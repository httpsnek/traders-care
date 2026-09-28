"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Dictionary } from "@/i18n";
import { toQuad } from "@/lib/homography";
import { LaptopScreen, SCREEN_H, SCREEN_W, WEEKS } from "./laptop-screen";

// VID-01: крышка ноутбука открывается по мере прокрутки. Кадры — public/media/hero/lid/000..143.webp (1920×1080),
// нарезка — tools/process_vid01.py. Когда крышка встала, на экране «включается» интерфейс с кварталом трейдера.
//
// Геометрия кадра задаётся только CSS (рамка box), canvas и первый кадр-картинка рисуются внутри неё —
// поэтому при загрузке ничего не прыгает. Экран ноутбука — тоже внутри рамки, в её координатах.
//
// Десктоп (lg+): сцена на весь экран, текст над закрытым ноутбуком; прокрутка открывает крышку, текст уходит.
// Телефон: текст сверху, ноутбук во всю ширину под ним; прокрутка открывает крышку, затем камера «наезжает»
// на экран, текст уходит — на экране крупный (компактный) интерфейс. Reduced motion — сразу финал, без залипания.
const FRAMES = 144;
const src = (i: number) => `/media/hero/lid/${String(i).padStart(3, "0")}.webp`;
// Стекло экрана в последнем кадре, px кадра 1920×1080: TL, TR, BR, BL (замер по кадру 143). При замене видео — перемерить.
const SCREEN = [[548.75, 113], [1373.75, 113], [1373.75, 647], [548.75, 647]];
const FW = 1920;

// Фазы прокрутки (доля пути секции).
const DESK = { open: 0.78, textFrom: 0.02, textTo: 0.3 };
const MOB = { open: 0.5, zoomFrom: 0.56, zoomTo: 0.86, textFrom: 0.52, textTo: 0.72 };
const WEEK_MS = 230; // квартал на экране прорисовывается за ~3 с

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

export function HeroLaptop({ t, children }: { t: Dictionary["hero"]["visual"]; children: React.ReactNode }) {
  const section = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imgs = useRef<HTMLImageElement[]>([]);
  const frame = useRef(0);
  const [quad, setQuad] = useState<string | null>(null);
  const [compact, setCompact] = useState(false);
  const [on, setOn] = useState(false);
  const [p, setP] = useState(0);
  const raf = useRef(0);

  // Кадр целиком в рамку (рамка уже имеет пропорции кадра).
  const draw = useCallback(() => {
    const c = canvas.current, b = box.current; if (!c || !b) return;
    let i = frame.current;
    while (i > 0 && !imgs.current[i]?.complete) i--;
    const img = imgs.current[i]; if (!img?.complete || !img.naturalWidth) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    const w = Math.round(b.offsetWidth * dpr), h = Math.round(b.offsetHeight * dpr);
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    c.getContext("2d")?.drawImage(img, 0, 0, w, h);
  }, []);

  // Загрузка кадров: первый уже на странице (<img>), остальные — после загрузки страницы, в простое браузера,
  // чтобы не мешать первому экрану. Порядок: последний, затем по порядку. На телефоне — каждый второй.
  // Если прокрутили раньше — рисуется ближайший загруженный кадр.
  useEffect(() => {
    const step = matchMedia("(min-width: 1024px)").matches ? 1 : 2;
    let cancelled = false, idle = 0;
    const load = (i: number) => {
      if (cancelled || imgs.current[i]) return;
      const im = new Image(); im.decoding = "async";
      im.onload = () => { if (Math.abs(i - frame.current) <= step) draw(); };
      im.src = src(i); imgs.current[i] = im;
    };
    load(0);
    const rest = () => {
      [FRAMES - 1, ...Array.from({ length: FRAMES }, (_, i) => i).filter((i) => i % step === 0 && i && i < FRAMES - 1)].forEach(load);
      if (step === 2) for (let i = 1; i < FRAMES - 1; i += 2) imgs.current[i] = imgs.current[i - 1];
    };
    const start = () => { idle = "requestIdleCallback" in window ? requestIdleCallback(rest, { timeout: 1200 }) : setTimeout(rest, 300) as unknown as number; };
    // Прокрутка началась до простоя — грузим сразу.
    const early = () => rest();
    if (document.readyState === "complete") start(); else window.addEventListener("load", start, { once: true });
    window.addEventListener("scroll", early, { once: true, passive: true });
    return () => {
      cancelled = true; window.removeEventListener("load", start); window.removeEventListener("scroll", early);
      if ("cancelIdleCallback" in window) cancelIdleCallback(idle); else clearTimeout(idle);
    };
  }, [draw]);

  // Экран ноутбука в координатах рамки.
  useLayoutEffect(() => {
    const b = box.current; if (!b) return;
    const upd = () => {
      const k = b.offsetWidth / FW;
      setQuad(toQuad(SCREEN_W, SCREEN_H, SCREEN.map(([x, y]) => [x * k, y * k])));
      draw();
    };
    upd(); const ro = new ResizeObserver(upd); ro.observe(b); return () => ro.disconnect();
  }, [draw]);

  // Прокрутка → кадр, экран, текст, наезд камеры.
  useEffect(() => {
    const desk = matchMedia("(min-width: 1024px)"), still = matchMedia("(prefers-reduced-motion: reduce)");
    let tick = 0;
    const setText = (k: number, dy: number) => {
      const tx = textRef.current; if (!tx) return;
      tx.style.opacity = k ? String(1 - k) : "";
      tx.style.transform = k ? `translateY(${(-k * dy).toFixed(1)}px)` : "";
      tx.style.pointerEvents = k > 0.5 ? "none" : "";
    };
    // Наезд (телефон): центр экрана ноутбука → центр закреплённой области, ширина экрана → 94 % ширины (но не выше 80 % высоты).
    // Геометрию берём без трансформации (offset*), чтобы наезд не влиял сам на себя.
    const setZoom = (k: number) => {
      const z = zoomRef.current, b = box.current, pn = pin.current; if (!z || !b || !pn) return;
      if (!k) { z.style.transform = ""; return; }
      const zr = z.offsetParent as HTMLElement | null; if (!zr) return;
      const bw = b.offsetWidth, bh = b.offsetHeight, f = bw / FW;
      // Рамка на телефоне — по центру сцены (см. классы ниже).
      const bx = (zr.offsetWidth - bw) / 2, by = (zr.offsetHeight - bh) / 2;
      const cx = bx + ((SCREEN[0][0] + SCREEN[1][0]) / 2) * f;
      const cy = by + ((SCREEN[0][1] + SCREEN[2][1]) / 2) * f;
      const sw = (SCREEN[1][0] - SCREEN[0][0]) * f, sh = (SCREEN[2][1] - SCREEN[0][1]) * f;
      // Центр закреплённой области в координатах сцены.
      const tx = pn.offsetWidth / 2, ty = pn.offsetHeight / 2 - zr.offsetTop;
      const s = 1 + (Math.min((pn.offsetWidth * 0.94) / sw, (pn.offsetHeight * 0.8) / sh) - 1) * k;
      z.style.transformOrigin = `${cx.toFixed(1)}px ${cy.toFixed(1)}px`;
      z.style.transform = `translate(${((tx - cx) * k).toFixed(1)}px, ${((ty - cy) * k).toFixed(1)}px) scale(${s.toFixed(4)})`;
    };
    const onScroll = () => {
      cancelAnimationFrame(tick);
      tick = requestAnimationFrame(() => {
        const el = section.current, pn = pin.current; if (!el || !pn) return;
        const r = el.getBoundingClientRect();
        const pr = clamp(-r.top / Math.max(1, r.height - pn.offsetHeight));
        const ph = desk.matches ? DESK : MOB;
        frame.current = Math.round(clamp(pr / ph.open) * (FRAMES - 1));
        draw();
        setOn(pr >= ph.open);
        if (desk.matches) { setText(smooth(DESK.textFrom, DESK.textTo, pr), 60); setZoom(0); }
        else { setText(smooth(MOB.textFrom, MOB.textTo, pr), 90); setZoom(smooth(MOB.zoomFrom, MOB.zoomTo, pr)); }
      });
    };
    const setup = () => {
      setCompact(!desk.matches);
      window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll);
      setText(0, 0); setZoom(0);
      if (still.matches) { frame.current = FRAMES - 1; draw(); setOn(true); return; }
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

  return (
    <div ref={section} className="lp-dark relative h-[230svh] bg-[#0b0b0d] lg:h-[250svh] motion-reduce:h-auto" role="img" aria-label={t.aria}>
      <div ref={pin} className="sticky top-header flex h-[calc(100svh-var(--lp-header-h))] flex-col overflow-hidden motion-reduce:static motion-reduce:h-auto">
        <div ref={textRef} className="relative z-10 shrink-0 will-change-transform lg:absolute lg:inset-x-0 lg:top-[clamp(20px,5svh,56px)]">{children}</div>

        <div className="relative flex-1 [container-type:size] lg:absolute lg:inset-0 lg:min-h-0 lg:[container-type:normal]">
          <div ref={zoomRef} className="absolute inset-0 will-change-transform">
            {/* Рамка кадра. Телефон: 140 % ширины (ноутбук во всю ширину), но не выше сцены (215cqh — открытый ноутбук целиком), по центру.
                Десктоп: по высоте сцены, видимая часть — 84 % высоты, низ срезан на 10 %. */}
            <div ref={box}
              className="absolute left-1/2 top-1/2 aspect-video w-[min(140cqw,215cqh)] -translate-x-1/2 -translate-y-1/2 [mask-composite:intersect] [mask-image:linear-gradient(to_bottom,transparent,#000_12%,#000_86%,transparent),linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)] lg:bottom-0 lg:top-auto lg:h-[93.334%] lg:w-auto lg:translate-y-[10%] lg:[mask-image:linear-gradient(to_right,transparent,#000_14%,#000_86%,transparent),linear-gradient(to_bottom,transparent,#000_12%)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src(0)} alt="" fetchPriority="high" className="absolute inset-0 size-full" />
              <canvas ref={canvas} aria-hidden className="absolute inset-0 size-full" />

              {/* Экран: интерфейс «включается», когда крышка встала */}
              <div aria-hidden className="absolute left-0 top-0 origin-top-left"
                style={{ width: SCREEN_W, height: SCREEN_H, transform: quad ?? undefined, visibility: quad ? "visible" : "hidden" }}>
                <div className={`relative size-full transition-[opacity,filter] ease-out ${on ? "opacity-100 [filter:brightness(1)] duration-700" : "opacity-0 [filter:brightness(2.2)] duration-300"}`}>
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
