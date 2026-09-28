"use client";

import { ArrowRight } from "lucide-react";
import { Fragment, useMemo, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { Container } from "@/components/ui/container";
import { makeFormat } from "@/lib/format";
import { ProductIpad } from "./product-ipad";
import { JournalScreen, MistakesScreen, PlanScreen, ReviewScreen, StatsScreen, SystemScreen } from "./product-screens";

// Блок 5 «Продукт» (docs/LANDING-SPEC.md, часть C). Схему-линейку цикла убрали (непонятна) — цикл теперь в самих вкладках.
// Десктоп (lg+): вкладки строкой, под ними iPad Pro (IMG-09) на всю ширину — внутри приложение,
// вкладка переключает и меню приложения, и экран. Ниже lg — аккордеон с экраном-карточкой внутри пункта.

const SCREENS = [PlanScreen, JournalScreen, StatsScreen, MistakesScreen, SystemScreen, ReviewScreen];

export function Product({ t, locale }: { t: Dictionary["product"]; locale: Locale }) {
  const [active, setActive] = useState(1); // по умолчанию — Журнал
  const deskTabs = useRef<(HTMLButtonElement | null)[]>([]);
  const mobTabs = useRef<(HTMLButtonElement | null)[]>([]);
  const f = useMemo(() => makeFormat(locale), [locale]);
  const Screen = SCREENS[active];
  const titles = t.tabs.map((x) => x.title);

  // Клавиатура: стрелки, Home, End — как у ARIA tabs. Автопереключения по таймеру нет.
  const onKey = (refs: typeof deskTabs) => (e: React.KeyboardEvent) => {
    const n = t.tabs.length;
    const next = { ArrowDown: active + 1, ArrowRight: active + 1, ArrowUp: active - 1, ArrowLeft: active - 1, Home: 0, End: n - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const i = (next + n) % n;
    setActive(i);
    refs.current[i]?.focus();
  };

  // Экран-карточка — ниже lg, внутри аккордеона (iPad там был бы слишком мелким).
  const card = (key: string) => (
    <figure>
      <div className="rounded-screen border border-lp-line bg-lp-raised">
        <div className="flex items-center justify-between gap-4 border-b border-lp-line px-5 py-3 text-[13px]">
          <span className="text-lp-text-2">Traders Care · <span className="text-lp-text">{titles[active]}</span></span>
          <span className="hidden items-center gap-2 text-lp-muted sm:flex"><span className="h-[6px] w-[6px] rounded-full bg-lp-accent" />{t.synced}</span>
        </div>
        <div key={key} className="phone-swap p-5 sm:p-6 lg:min-h-[468px] lg:p-8 [&>*]:lg:min-h-[404px]">
          <Screen t={t} f={f} />
        </div>
      </div>
      <figcaption className="mt-4 text-lp-small text-lp-muted">{t.demo}</figcaption>
    </figure>
  );

  return (
    <section id="product" aria-labelledby="product-title" className="pb-12 pt-section-sm lg:pb-14 lg:pt-section">
      <Container>
        <h2 id="product-title" className="max-w-[700px] text-lp-h2 text-lp-text">{t.title}</h2>

        {/* Десктоп: вкладки строкой + iPad */}
        <div className="mt-10 hidden lg:block">
          {/* Вкладки — шаги одного процесса: у каждой короткий ответ «зачем», между ними стрелки. */}
          <div role="tablist" aria-label={t.listLabel} aria-orientation="horizontal" onKeyDown={onKey(deskTabs)} className="grid items-stretch gap-x-2" style={{ gridTemplateColumns: t.tabs.map(() => "1fr").join(" auto ") }}>
            {t.tabs.map((tab, i) => {
              const on = i === active;
              return (
                <Fragment key={tab.title}>
                  {i > 0 && <ArrowRight aria-hidden size={15} strokeWidth={1.5} className="mt-[26px] text-lp-muted" />}
                  <button
                    ref={(el) => { deskTabs.current[i] = el; }}
                    type="button" role="tab" id={`product-tab-${i}`} aria-selected={on} aria-controls="product-panel" tabIndex={on ? 0 : -1}
                    onClick={() => setActive(i)}
                    className={`group relative rounded-screen border px-4 py-3 text-left transition-colors duration-300 ${on ? "border-lp-accent/60 bg-lp-accent/[0.08]" : "border-lp-line hover:border-lp-text/25"}`}>
                    <span className={`block font-display text-[17px] font-medium tracking-[-0.015em] transition-colors duration-200 ${on ? "text-lp-text" : "text-lp-text-2 group-hover:text-lp-text"}`}>{tab.title}</span>
                    <span className={`mt-1 block text-[13px] leading-snug ${on ? "text-lp-accent" : "text-lp-muted"}`}>{tab.hint}</span>
                  </button>
                </Fragment>
              );
            })}
          </div>
          {/* Все описания в одной ячейке сетки: высота = самое длинное, поэтому iPad ниже не сдвигается при смене вкладки. */}
          <div className="mt-4 grid max-w-[64ch]">
            {t.tabs.map((tab, i) => (
              <p key={tab.title} aria-hidden={i !== active}
                className={`col-start-1 row-start-1 text-lp-body text-lp-text-2 transition-opacity duration-300 ${i === active ? "opacity-100" : "pointer-events-none opacity-0"}`}>{tab.text}</p>
            ))}
          </div>

          <div id="product-panel" role="tabpanel" aria-labelledby={`product-tab-${active}`} className="mx-auto mt-6 max-w-[1000px]">
            <ProductIpad tabs={titles} active={active} onSelect={setActive} synced={t.synced} demo={t.demo}>
              <Screen t={t} f={f} />
            </ProductIpad>
          </div>
        </div>

        {/* Ниже lg: аккордеон, экран внутри раскрытого пункта */}
        <div role="tablist" aria-label={t.listLabel} aria-orientation="vertical" onKeyDown={onKey(mobTabs)} className="mt-14 flex flex-col lg:hidden">
          {t.tabs.map((tab, i) => {
            const on = i === active;
            return (
              <div key={tab.title} className="relative border-b border-lp-line first:border-t">
                <span aria-hidden className={`absolute inset-y-4 left-0 w-[2px] rounded-full transition-colors duration-200 ${on ? "bg-lp-accent" : "bg-transparent"}`} />
                <button
                  ref={(el) => { mobTabs.current[i] = el; }}
                  type="button" role="tab" id={`product-tab-m-${i}`} aria-selected={on} aria-controls="product-panel-m" tabIndex={on ? 0 : -1}
                  onClick={() => setActive(i)}
                  className={`flex w-full items-center justify-between py-5 pl-5 text-left font-display text-[20px] font-medium tracking-[-0.01em] transition-colors duration-200 ${on ? "text-lp-text" : "text-lp-muted"}`}>
                  <span>{tab.title}<span className="mt-0.5 block font-sans text-[14px] font-normal text-lp-muted">{tab.hint}</span></span>
                </button>
                {on && (
                  <div id="product-panel-m" role="tabpanel" aria-labelledby={`product-tab-m-${i}`} className="pb-6 pl-5">
                    <p className="max-w-[46ch] text-lp-body text-lp-text-2">{tab.text}</p>
                    <div className="mt-6">{card(`m${i}`)}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
