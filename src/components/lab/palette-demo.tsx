"use client";

import { ArrowRight } from "lucide-react";
import type { Dictionary } from "@/i18n";
import { PropGauge } from "@/components/sections/prop-gauge";
import { DrawdownTypes } from "@/components/sections/drawdown-types";

// Служебное сравнение палитр (только /lab). Палитра переопределяет CSS-переменную --lp-warning и добавляет --lp-gold
// на обёртке — реальные компоненты сайта перекрашиваются без правок в них.

export type Palette = { id: string; title: string; note: string; warnDark: string; warnLight: string; gold?: { dark: string; light: string } };

export function PaletteDemo({ p, t }: { p: Palette; t: Dictionary["prop"] }) {
  const cls = `pal-${p.id}`;
  const fmt = (n: number) => `$${Math.round(n).toLocaleString("ru").replace(/\s/g, " ")}`;
  const gold = p.gold ? "rgb(var(--lp-gold))" : "rgb(var(--lp-accent))";
  return (
    <div className={cls}>
      <style>{`
        .${cls}{--lp-warning:${p.warnDark};${p.gold ? `--lp-gold:${p.gold.dark};` : ""}}
        [data-theme=light] .${cls}{--lp-warning:${p.warnLight};${p.gold ? `--lp-gold:${p.gold.light};` : ""}}
      `}</style>
      <div className="flex items-baseline justify-between gap-6 border-t border-lp-line pt-8">
        <div>
          <div className="text-[20px] font-medium text-lp-text">{p.title}</div>
          <p className="mt-1 max-w-[70ch] text-lp-small text-lp-text-2">{p.note}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          {["accent", "warning", "profit", "loss", ...(p.gold ? ["gold"] : [])].map((c) => (
            <span key={c} title={c} className="size-7 rounded-full ring-1 ring-lp-line" style={{ background: `rgb(var(--lp-${c}))` }} />
          ))}
        </div>
      </div>

      <div className="mt-8 grid items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <PropGauge percent={82} kind="warning" readoutValue={3150} format={fmt} caption={t.rules[2].caption}
            verdict="WARNING · 82 %" account={t.account} marker={t.markerLimit} liveStep={0} />
        </div>
        <div className="grid gap-8 lg:col-span-7">
          {/* строки правил */}
          <ul className="border-t border-lp-line">
            {[{ n: t.rules[0].name, v: "64 %", k: "p", w: 64 }, { n: t.rules[1].name, v: "OK", k: "o", w: 36 }, { n: t.rules[2].name, v: "WARNING", k: "w", w: 82 }].map((r) => (
              <li key={r.n} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 border-b border-lp-line py-3">
                <span className="text-[15px] text-lp-text">{r.n}</span>
                <span className={`text-[12px] font-semibold tracking-[0.06em] ${r.k === "w" ? "text-lp-warning" : r.k === "p" ? "text-lp-accent" : "text-lp-text-2"}`}>{r.v}</span>
                <span className="col-span-2 h-[3px] rounded-full bg-lp-text/10">
                  <span className={`block h-full rounded-full ${r.k === "w" ? "bg-lp-warning" : r.k === "p" ? "bg-lp-accent" : "bg-lp-text/50"}`} style={{ width: `${r.w}%` }} />
                </span>
              </li>
            ))}
          </ul>
          {/* кнопка, «Рекомендуем», сумма */}
          <div className="flex flex-wrap items-center gap-6">
            <a href="#" className="btn-v btn-a" style={p.gold ? { boxShadow: "inset 0 1px 0 rgb(255 255 255 / .35), 0 1px 2px rgb(0 0 0 / .3), 0 8px 22px -6px rgb(var(--lp-gold) / .45)" } : undefined}>
              Начать бесплатно <ArrowRight size={17} />
            </a>
            <span className="text-[13px] font-medium" style={{ color: gold }}>Рекомендуем</span>
            <span className="font-display text-[28px] font-medium text-lp-profit">+$6 420</span>
            <span className="font-display text-[28px] font-medium text-lp-loss">−$2 340</span>
          </div>
          {/* мини-календарь: выбранный день */}
          <div className="flex gap-1.5">
            {[320, -180, 590, 1990, -310, 380, 190].map((v, i) => (
              <span key={i} className={`flex h-12 w-12 items-end justify-end rounded-[9px] p-1.5 text-[11px] font-semibold ${v < 0 ? "bg-lp-loss/15 text-lp-loss" : "bg-lp-profit/15 text-lp-profit"}`}
                style={i === 3 ? { boxShadow: `0 0 0 2px ${gold}` } : { opacity: 0.45 }}>
                {v > 0 ? "+" : "−"}{Math.abs(v)}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-10"><DrawdownTypes t={t.drawdown} /></div>
    </div>
  );
}
