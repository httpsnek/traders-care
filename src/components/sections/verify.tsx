import { Check, X } from "lucide-react";
import Image from "next/image";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { Container } from "@/components/ui/container";
import { VerifyProof } from "./verify-proof";

// Блок 7 «Цифры, которым можно верить» (docs/LANDING-SPEC.md, часть C): доверие + проверяемые результаты + безопасность.
// 1) Схема пути данных на всю ширину: Брокер → стеклянный ключ IMG-06 («инвесторский пароль, только чтение») → Traders Care →
//    Журнал / Публичная карточка. От бородки ключа вверх — перечёркнутые ветки «открыть сделку», «вывести деньги».
// 2) Сверка: публичная карточка сделки ↔ строка выписки MT5 (verify-proof.tsx). 3) Четыре факта безопасности.

// Точки ключа в img-06-*.webp (1660×820), сняты по пикселям: вход линии в головку, выход из кончика, верх бородки.
const KEY = { inY: 44.2, inX: 10.9, outY: 41.6, outX: 87.35, bladeTop: 34 };
// Раскладка схемы (в % ширины контейнера): картинка 54 % по центру (от 23 %); высота контейнера = высота картинки
// (1660×820 при ширине 54 % → пропорция контейнера 3.748 : 1). at() переводит % картинки в % контейнера.
const IMG = { left: 23, width: 54 }; // ключ по центру контейнера
const at = (xInImg: number) => +(IMG.left + (xInImg * IMG.width) / 100).toFixed(3);
const BROKER_AT = 24;   // точка «Брокер» — зеркально APP_AT относительно ключа
const APP_AT = 75;      // точка «Traders Care»

export function Verify({ t, locale }: { t: Dictionary["verify"]; locale: Locale }) {
  const d = t.diagram;
  const blocked = [d.trade, d.withdraw];
  const keyImg = (
    <>
      <Image src="/media/verify/img-06-dark.webp" alt="" fill unoptimized sizes="(min-width: 1024px) 740px, 100vw" className="object-cover [[data-theme=light]_&]:hidden" />
      <Image src="/media/verify/img-06-light.webp" alt="" fill unoptimized sizes="(min-width: 1024px) 740px, 100vw" className="hidden object-cover [[data-theme=light]_&]:block" />
    </>
  );
  const fade = "[mask-composite:intersect] [mask-image:linear-gradient(to_right,transparent,#000_4%,#000_96%,transparent),linear-gradient(to_bottom,transparent,#000_4%,#000_96%,transparent)]";
  const struck = (label: string) => (
    <span className="whitespace-nowrap text-lp-small text-lp-muted">
      <span className="line-through decoration-lp-text/50">{label}</span>
      <span className="ml-1.5 text-[12px]">× {d.blocked}</span>
    </span>
  );

  return (
    <section id="verify" aria-labelledby="verify-title" className="py-section-sm lg:py-section">
      <Container>
        <div className="grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-6">
          <h2 id="verify-title" className="text-lp-h2 text-lp-text lg:col-span-6">{t.title}</h2>
          <p className="max-w-[48ch] text-lp-lead text-lp-text-2 lg:col-span-5 lg:col-start-8">{t.lead}</p>
        </div>

        {/* Схема пути данных — десктоп. Всё в одной системе координат (высота контейнера = высота картинки),
            каждая линия — один сплошной отрезок от подписи до ключа, без стыков. */}
        <figure aria-label={d.aria} className="relative mt-16 hidden aspect-[3.748/1] lg:block">
          <div className={`absolute inset-y-0 ${fade}`} style={{ left: `${IMG.left}%`, width: `${IMG.width}%` }}>{keyImg}</div>

          <div aria-hidden className="pointer-events-none absolute inset-0">
            {/* Брокер → головка ключа. Зеркально правой стороне: точка, короткая линия, подпись выровнена вправо к точке. */}
            <div className="absolute -mt-[15px] text-right" style={{ top: `${KEY.inY}%`, right: `${100 - BROKER_AT}%` }}>
              <div className="flex h-[30px] items-center justify-end gap-3">
                <span className="whitespace-nowrap font-display text-[20px] font-medium tracking-[-0.01em] text-lp-text">{d.broker}</span>
                <span className="-mr-[4.5px] size-[9px] shrink-0 rounded-full bg-lp-accent" />
              </div>
              <div className="ml-auto mr-[-0.75px] mt-2 flex max-w-[20ch] flex-col items-end gap-2 border-r border-lp-text/35 py-1 pr-4 text-lp-small text-lp-text-2">
                {d.brokerSub.split(/,\s*/).map((x) => <span key={x} className="whitespace-nowrap">{x}</span>)}
              </div>
            </div>
            <span className="absolute h-[1.5px] bg-lp-accent" style={{ top: `${KEY.inY}%`, left: `${BROKER_AT}%`, width: `${at(KEY.inX) - BROKER_AT}%` }} />

            {/* Кончик ключа → Traders Care */}
            <span className="absolute h-[1.5px] bg-lp-accent" style={{ top: `${KEY.outY}%`, left: `${at(KEY.outX)}%`, width: `${APP_AT - at(KEY.outX)}%` }} />
            <div className="absolute -mt-[15px]" style={{ top: `${KEY.outY}%`, left: `${APP_AT}%` }}>
              <div className="flex h-[30px] items-center gap-3">
                <span className="-ml-[4.5px] size-[9px] shrink-0 rounded-full bg-lp-accent" />
                <span className="whitespace-nowrap font-display text-[20px] font-medium tracking-[-0.01em] text-lp-text">{d.app}</span>
              </div>
              <div className="ml-[-0.75px] mt-2 flex flex-col gap-2 border-l border-lp-text/35 py-1 pl-4 text-lp-small text-lp-text-2">
                <span className="whitespace-nowrap">{d.journal}</span>
                <span className="whitespace-nowrap">{d.card}</span>
              </div>
            </div>

            {/* От бородки вверх — недоступные действия */}
            {[56, 78].map((xPct, k) => (
              <span key={xPct} className="absolute w-0 border-l border-dashed border-lp-text/35" style={{ left: `${at(xPct)}%`, top: "2%", height: `${KEY.bladeTop - 2}%` }}>
                <span className={`absolute -top-2 -translate-y-full ${k === 0 ? "right-0 translate-x-3" : "left-0 -translate-x-3"}`}>{struck(blocked[k])}</span>
              </span>
            ))}

            <span className="absolute -translate-x-1/2 text-center" style={{ top: "80%", left: `${at(50)}%` }}>
              <span className="block text-[15px] font-medium text-lp-text">{d.key}</span>
              <span className="block text-[12px] text-lp-muted">{d.keySub}</span>
            </span>
          </div>
        </figure>

        {/* Мобильный и планшет: вместо схемы с ключом — карточка прав доступа, как экран разрешений.
            Что Traders Care может сделать со счётом и чего не может — читается за секунду. */}
        <figure aria-label={d.aria} className="mt-9 overflow-hidden rounded-screen border border-lp-line bg-lp-raised lg:hidden">
          <div className="flex items-center gap-3 border-b border-lp-line px-4 py-4">
            <span className="min-w-0">
              <span className="block font-display text-[17px] font-medium text-lp-text">{d.broker}</span>
              <span className="block text-[12px] leading-snug text-lp-muted">MetaTrader · cTrader · Match-Trader · DXtrade</span>
            </span>
            <span aria-hidden className="relative mx-1 h-px min-w-[24px] flex-1 bg-lp-accent after:absolute after:-right-px after:-top-[3.5px] after:size-2 after:rotate-45 after:border-r after:border-t after:border-lp-accent" />
            <span className="shrink-0 font-display text-[17px] font-medium text-lp-text">{d.app}</span>
          </div>
          <ul className="divide-y divide-lp-line">
            <li className="flex items-start gap-3 px-4 py-3.5">
              <Check aria-hidden size={18} strokeWidth={2.2} className="mt-0.5 shrink-0 text-lp-accent" />
              <span>
                <span className="block text-[15px] text-lp-text">{d.read}</span>
                <span className="mt-0.5 block text-[13px] text-lp-muted">{d.journal} · {d.card}</span>
              </span>
            </li>
            {blocked.map((b) => (
              <li key={b} className="flex items-center gap-3 px-4 py-3.5">
                <X aria-hidden size={18} strokeWidth={2.2} className="shrink-0 text-lp-muted" />
                <span className="text-[15px] text-lp-muted line-through decoration-lp-text/40">{b}</span>
                <span className="ml-auto text-[12px] text-lp-muted">{d.blocked}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-lp-line bg-lp-text/[0.02] px-4 py-3 text-[13px] text-lp-text-2">
            <span className="font-medium text-lp-text">{d.key}</span> · {d.keySub}
          </div>
        </figure>

        {/* Результаты, которые нельзя нарисовать: публичная карточка ↔ выписка брокера */}
        <div className="mt-16 border-t border-lp-line pt-12 lg:mt-20 lg:pt-16">
          <div className="grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-6">
            <h3 className="font-display text-[clamp(26px,2.6vw,36px)] font-medium leading-tight tracking-[-0.02em] text-lp-text lg:col-span-6">{t.proof.title}</h3>
            <p className="max-w-[48ch] text-lp-body text-lp-text-2 lg:col-span-5 lg:col-start-8">{t.proof.text}</p>
          </div>
          <div className="mt-12 lg:mt-16"><VerifyProof t={t.proof} locale={locale} /></div>
        </div>

        {/* Четыре факта безопасности — в строку, через тонкие разделители, без иконок */}
        <div className="mt-14 border-t border-lp-line pt-10 lg:mt-20">
          <h3 className="text-lp-h3 text-lp-text">{t.safety.title}</h3>
          <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-lp-line">
            {t.safety.facts.map((fact) => (
              <li key={fact.t} className="lg:px-6 lg:first:pl-0 lg:last:pr-0">
                <div className="text-[16px] font-semibold text-lp-text">{fact.t}</div>
                <p className="mt-2 text-lp-small text-lp-text-2">{fact.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
