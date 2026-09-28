"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Dictionary } from "@/i18n";
import { toQuad } from "@/lib/homography";
import { LaptopScreen, SCREEN_H, SCREEN_W, WEEKS } from "./laptop-screen";

// VID-01: крышка ноутбука открывается по мере прокрутки. Кадры — public/media/hero/lid/000..143.webp (1920×1080)
// и lid-m/ (1120×630, для телефона), нарезка — tools/process_vid01.py. Когда крышка встала, на экране
// «включается» интерфейс с кварталом трейдера.
//
// Геометрия кадра задаётся только CSS (рамка box), canvas и первый кадр-картинка рисуются внутри неё —
// поэтому при загрузке ничего не прыгает. Экран ноутбука — тоже внутри рамки, в её координатах.
//
// Десктоп (lg+): сцена на весь экран, текст над закрытым ноутбуком; прокрутка открывает крышку, текст уходит.
// Телефон: текст сверху, ноутбук во всю ширину под ним; прокрутка открывает крышку, затем камера «наезжает»
// на экран, текст уходит — на экране крупный (компактный) интерфейс. Reduced motion — сразу финал, без залипания.
//
// Производительность (телефон): кадры 960 px, вокруг текущего — окно распакованных ImageBitmap, перерисовка — только при смене кадра,
// геометрия наезда считается при изменении размеров, а не на каждое событие прокрутки; маски на большом слое нет
// (края растворяются градиентами поверх).
const FRAMES = 144;
const DESK_MQ = "(min-width: 1024px)";
const src = (i: number, mobile: boolean) => `/media/hero/${mobile ? "lid-m" : "lid"}/${String(i).padStart(3, "0")}.webp`;
// Стекло экрана в последнем кадре, в долях кадра: TL, TR, BR, BL (замер по кадру 143, 1920×1080).
const SCREEN = [[548.75, 113], [1373.75, 113], [1373.75, 647], [548.75, 647]].map(([x, y]) => [x / 1920, y / 1080]);

// Фазы прокрутки (доля пути секции).
const DESK = { open: 0.78, textFrom: 0.02, textTo: 0.3 };
const MOB = { open: 0.5, zoomFrom: 0.56, zoomTo: 0.86, textFrom: 0.52, textTo: 0.72 };
const WEEK_MS = 230; // квартал на экране прорисовывается за ~3 с

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

// Распакованных кадров держим не больше WINDOW (вокруг текущего): 144 распакованных кадра — сотни МБ,
// iOS Safari от такого перезагружает вкладку. Остальные кадры лежат сжатыми (<img>), распаковываются заранее по ходу.
const WINDOW = 24, AHEAD = 8;

export function HeroLaptop({ t, children }: { t: Dictionary["hero"]["visual"]; children: React.ReactNode }) {
  const section = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imgs = useRef<(HTMLImageElement | undefined)[]>([]);
  const bmps = useRef(new Map<number, ImageBitmap>());
  const pending = useRef(new Set<number>());
  const frame = useRef(0);
  const drawn = useRef(-1);
  const onRef = useRef(false);
  // Геометрия наезда: пересчитывается при изменении размеров.
  const geo = useRef({ cx: 0, cy: 0, tx: 0, ty: 0, s: 1 });
  const [quad, setQuad] = useState<string | null>(null);
  const [compact, setCompact] = useState(false);
  const [on, setOn] = useState(false);
  const [p, setP] = useState(0);
  const raf = useRef(0);

  // Держим распакованными кадры вокруг текущего, дальние освобождаем.
  const warm = useCallback((center: number) => {
    if (!("createImageBitmap" in window)) return;
    for (let d = -AHEAD; d <= AHEAD; d++) {
      const i = center + d, im = imgs.current[i];
      if (!im || bmps.current.has(i) || pending.current.has(i)) continue;
      pending.current.add(i);
      createImageBitmap(im).then((b) => {
        pending.current.delete(i);
        bmps.current.set(i, b);
        if (bmps.current.size > WINDOW) {
          const far = [...bmps.current.keys()].sort((x, y) => Math.abs(y - frame.current) - Math.abs(x - frame.current));
          for (const k of far.slice(0, bmps.current.size - WINDOW)) { bmps.current.get(k)?.close(); bmps.current.delete(k); }
        }
      }).catch(() => pending.current.delete(i));
    }
  }, []);

  // Ближайший загруженный кадр (пока грузятся — ближайший предыдущий). Рисуем только при смене кадра.
  const draw = useCallback((force = false) => {
    const c = canvas.current; if (!c) return;
    let i = frame.current;
    while (i > 0 && !imgs.current[i]) i--;
    const f = bmps.current.get(i) ?? imgs.current[i];
    if (!f || (i === drawn.current && !force)) return;
    c.getContext("2d")?.drawImage(f, 0, 0, c.width, c.height);
    drawn.current = i;
    warm(i);
  }, [warm]);

  // Загрузка: первый кадр сразу, остальные — после загрузки страницы, в простое браузера (или сразу, если начали
  // прокручивать). Кадр считается готовым после decode() — при прокрутке drawImage не ждёт сети.
  useEffect(() => {
    const mobile = !matchMedia(DESK_MQ).matches;
    let cancelled = false, idle = 0;
    const asked = new Set<number>();
    const load = (i: number) => {
      if (cancelled || asked.has(i)) return;
      asked.add(i);
      const im = new Image(); im.decoding = "async"; im.src = src(i, mobile);
      im.decode().then(() => {
        if (cancelled) return;
        imgs.current[i] = im;
        if (Math.abs(i - frame.current) <= 2 || i === 0) draw(true);
      }).catch(() => {});
    };
    load(0);
    let started = false;
    const rest = () => { if (started) return; started = true; load(FRAMES - 1); for (let i = 1; i < FRAMES - 1; i++) load(i); };
    const start = () => { idle = "requestIdleCallback" in window ? requestIdleCallback(rest, { timeout: 1200 }) : (setTimeout(rest, 300) as unknown as number); };
    if (document.readyState === "complete") start(); else window.addEventListener("load", start, { once: true });
    window.addEventListener("scroll", rest, { once: true, passive: true });
    const cache = bmps.current;
    return () => {
      cancelled = true; window.removeEventListener("load", start); window.removeEventListener("scroll", rest);
      if ("cancelIdleCallback" in window) cancelIdleCallback(idle); else clearTimeout(idle);
      cache.forEach((b) => b.close()); cache.clear();
    };
  }, [draw]);

  // Размеры: canvas, экран ноутбука, геометрия наезда.
  useLayoutEffect(() => {
    const b = box.current, st = stage.current, pn = pin.current; if (!b || !st || !pn) return;
    const upd = () => {
      const bw = b.offsetWidth, bh = b.offsetHeight;
      const c = canvas.current;
      if (c) {
        const dpr = Math.min(2, devicePixelRatio || 1);
        const w = Math.round(bw * dpr), h = Math.round(bh * dpr);
        if (c.width !== w || c.height !== h) { c.width = w; c.height = h; draw(true); }
      }
      setQuad(toQuad(SCREEN_W, SCREEN_H, SCREEN.map(([x, y]) => [x * bw, y * bh])));
      // Наезд (телефон): центр экрана ноутбука → центр закреплённой области, ширина экрана → 94 % ширины
      // (но не выше 80 % высоты). Рамка на телефоне — по центру сцены.
      const bx = (st.offsetWidth - bw) / 2, by = (st.offsetHeight - bh) / 2;
      const cx = bx + ((SCREEN[0][0] + SCREEN[1][0]) / 2) * bw, cy = by + ((SCREEN[0][1] + SCREEN[2][1]) / 2) * bh;
      const sw = (SCREEN[1][0] - SCREEN[0][0]) * bw, sh = (SCREEN[2][1] - SCREEN[0][1]) * bh;
      geo.current = { cx, cy, tx: pn.offsetWidth / 2, ty: pn.offsetHeight / 2 - st.offsetTop, s: Math.min((pn.offsetWidth * 0.94) / sw, (pn.offsetHeight * 0.8) / sh) };
      if (zoomRef.current) zoomRef.current.style.transformOrigin = `${cx.toFixed(1)}px ${cy.toFixed(1)}px`;
    };
    upd(); const ro = new ResizeObserver(upd); ro.observe(b); ro.observe(pn); return () => ro.disconnect();
  }, [draw]);

  // Прокрутка → кадр, экран, текст, наезд камеры. В обработчике только чтение одной позиции и запись стилей.
  useEffect(() => {
    const desk = matchMedia(DESK_MQ), still = matchMedia("(prefers-reduced-motion: reduce)");
    let tick = 0;
    const setText = (k: number, dy: number) => {
      const tx = textRef.current; if (!tx) return;
      tx.style.opacity = k ? String(1 - k) : "";
      tx.style.transform = k ? `translate3d(0,${(-k * dy).toFixed(1)}px,0)` : "";
      tx.style.pointerEvents = k > 0.5 ? "none" : "";
    };
    const setZoom = (k: number) => {
      const z = zoomRef.current; if (!z) return;
      if (!k) { z.style.transform = ""; return; }
      const g = geo.current, s = 1 + (g.s - 1) * k;
      z.style.transform = `translate3d(${((g.tx - g.cx) * k).toFixed(1)}px, ${((g.ty - g.cy) * k).toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
    };
    const setScreen = (v: boolean) => { if (onRef.current !== v) { onRef.current = v; setOn(v); } };
    const onScroll = () => {
      cancelAnimationFrame(tick);
      tick = requestAnimationFrame(() => {
        const el = section.current, pn = pin.current; if (!el || !pn) return;
        const pr = clamp(-el.getBoundingClientRect().top / Math.max(1, el.offsetHeight - pn.offsetHeight));
        const ph = desk.matches ? DESK : MOB;
        frame.current = Math.round(clamp(pr / ph.open) * (FRAMES - 1));
        draw();
        setScreen(pr >= ph.open);
        if (desk.matches) { setText(smooth(DESK.textFrom, DESK.textTo, pr), 60); setZoom(0); }
        else { setText(smooth(MOB.textFrom, MOB.textTo, pr), 90); setZoom(smooth(MOB.zoomFrom, MOB.zoomTo, pr)); }
      });
    };
    const setup = () => {
      setCompact(!desk.matches);
      window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll);
      setText(0, 0); setZoom(0);
      if (still.matches) { frame.current = FRAMES - 1; draw(); setScreen(true); return; }
      window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("resize", onScroll);
      onScroll();
    };
    setup();
    desk.addEventListener("change", setup); still.addEventListener("change", setup);
    return () => {
      window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll);
      desk.removeEventListener("change", setup); still.removeEventListener("change", setup); cancelAnimationFrame(tick);
    };
  }, [draw]);

  // Экран включился — квартал прорисовывается заново.
  const play = useCallback(() => {
    cancelAnimationFrame(raf.current);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setP(WEEKS); return; }
    const t0 = performance.now() + 450;
    const tick = (now: number) => { const v = clamp((now - t0) / WEEK_MS, 0, WEEKS); setP(v); if (v < WEEKS) raf.current = requestAnimationFrame(tick); };
    raf.current = requestAnimationFrame(tick);
  }, []);
  useEffect(() => { if (on) play(); else { cancelAnimationFrame(raf.current); setP(0); } return () => cancelAnimationFrame(raf.current); }, [on, play]);

  const edge = "pointer-events-none absolute from-[#0b0b0d] to-transparent";
  return (
    <div ref={section} className="lp-dark relative h-[230svh] bg-[#0b0b0d] lg:h-[250svh] motion-reduce:h-auto" role="img" aria-label={t.aria}>
      <div ref={pin} className="sticky top-header flex h-[calc(100svh-var(--lp-header-h))] flex-col overflow-hidden motion-reduce:static motion-reduce:h-auto">
        <div ref={textRef} className="relative z-10 shrink-0 lg:absolute lg:inset-x-0 lg:top-[clamp(20px,5svh,56px)]">{children}</div>

        <div ref={stage} className="relative flex-1 [container-type:size] motion-reduce:min-h-[70vw] lg:absolute lg:inset-0 lg:min-h-0 lg:[container-type:normal]">
          <div ref={zoomRef} className="absolute inset-0">
            {/* Рамка кадра. Телефон: 140 % ширины (ноутбук во всю ширину), но не выше сцены (215cqh — открытый ноутбук целиком), по центру.
                Десктоп: по высоте сцены, видимая часть — 84 % высоты, низ срезан на 10 %. */}
            <div ref={box}
              className="absolute left-1/2 top-1/2 aspect-video w-[min(140cqw,215cqh)] -translate-x-1/2 -translate-y-1/2 lg:bottom-0 lg:top-auto lg:h-[93.334%] lg:w-auto lg:translate-y-[10%]">
              <picture>
                <source media={DESK_MQ} srcSet={src(0, false)} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src(0, true)} alt="" fetchPriority="high" className="absolute inset-0 size-full" />
              </picture>
              <canvas ref={canvas} aria-hidden className="absolute inset-0 size-full" />
              {/* Края кадра растворяются в фоне страницы (вместо маски — дешевле при прокрутке) */}
              <div aria-hidden className={`${edge} inset-x-0 top-0 h-[14%] bg-gradient-to-b`} />
              <div aria-hidden className={`${edge} inset-y-0 left-0 w-[12%] bg-gradient-to-r`} />
              <div aria-hidden className={`${edge} inset-y-0 right-0 w-[12%] bg-gradient-to-l`} />
              <div aria-hidden className={`${edge} inset-x-0 bottom-0 h-[16%] bg-gradient-to-t lg:hidden`} />

              {/* Экран: интерфейс «включается», когда крышка встала */}
              <div aria-hidden className="absolute left-0 top-0 origin-top-left"
                style={{ width: SCREEN_W, height: SCREEN_H, transform: quad ?? undefined, visibility: quad ? "visible" : "hidden" }}>
                <div className={`relative size-full transition-opacity ease-out ${on ? "opacity-100 duration-700" : "opacity-0 duration-300"}`}>
                  <LaptopScreen t={t} p={p} onReplay={play} compact={compact} />
                  {/* Блик студийного света на стекле — как в кадре с выключенным экраном */}
                  <div className="pointer-events-none absolute inset-0 rounded-t-[6px] bg-[radial-gradient(70%_45%_at_50%_0%,rgb(255_255_255/0.06),transparent_70%)]" />
                </div>
              </div>
            </div>
          </div>
          {/* Стык с фоном страницы снизу */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[10%] bg-gradient-to-b from-transparent to-[#0b0b0d]" />
        </div>
      </div>
    </div>
  );
}
