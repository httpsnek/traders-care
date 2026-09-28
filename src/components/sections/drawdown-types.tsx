import type { Dictionary } from "@/i18n";

// Схема «Три типа просадки»: одна и та же кривая эквити, три способа двигать пол.
// Static — пол на месте; Trailing — пол = максимум эквити − лимит (только вверх); EOD — то же, но по закрытиям дня.

const EQ = [100, 101.2, 100.6, 102.1, 103.4, 102.2, 103.9, 105.1, 104.0, 104.6, 106.2, 105.1, 104.2, 105.6, 106.9, 106.1, 107.4, 106.2, 105.4, 106.6, 107.8];
const LIMIT = 4.2;          // расстояние до пола, в тех же единицах
const DAY = 4;              // точек в «торговом дне» для EOD
const W = 240, H = 120, PAD = 8, MIN = 94.5, MAX = 109;
const x = (i: number) => PAD + (i / (EQ.length - 1)) * (W - PAD * 2);
const y = (v: number) => PAD + (1 - (v - MIN) / (MAX - MIN)) * (H - PAD * 2);
const r = (v: number) => Math.round(v * 100) / 100;

const floors = {
  static: EQ.map(() => EQ[0] - LIMIT),
  trailing: EQ.map((_, i) => Math.max(...EQ.slice(0, i + 1)) - LIMIT),
  eod: EQ.map((_, i) => {
    const lastClose = Math.floor(i / DAY) * DAY; // пол обновляется по закрытию предыдущих дней
    const closes = EQ.filter((__, k) => k % DAY === 0 && k <= lastClose);
    return Math.max(...closes) - LIMIT;
  }),
};

// Ступенчатая линия (для пола): горизонталь, потом вертикаль.
const stepPath = (vals: number[]) =>
  vals.map((v, i) => (i === 0 ? `M${r(x(0))},${r(y(v))}` : `H${r(x(i))}V${r(y(v))}`)).join("");
const linePath = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${r(x(i))},${r(y(v))}`).join("");

export function DrawdownTypes({ t }: { t: Dictionary["prop"]["drawdown"] }) {
  const kinds = ["static", "trailing", "eod"] as const;
  return (
    <div>
      <h3 className="text-lp-h3 text-lp-text">{t.title}</h3>
      <p className="mt-3 max-w-[58ch] text-lp-body text-lp-text-2">{t.lead}</p>

      <div className="-mx-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0">
        {kinds.map((k, i) => (
          <figure key={k} className="w-[78%] shrink-0 snap-start md:w-auto">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" role="img" aria-label={`${t.types[i].name}: ${t.types[i].text}`}>
              {/* дни для EOD */}
              {k === "eod" && EQ.map((_, j) => j > 0 && j % DAY === 0 ? (
                <line key={j} x1={r(x(j))} x2={r(x(j))} y1={PAD} y2={H - PAD} stroke="rgb(var(--lp-text))" strokeOpacity="0.08" strokeDasharray="2 3" />
              ) : null)}
              <line x1={PAD} x2={W - PAD} y1={H - PAD} y2={H - PAD} stroke="rgb(var(--lp-line))" />
              {/* зона ниже пола */}
              <path d={`${stepPath(floors[k])}V${H - PAD}H${PAD}Z`} fill="rgb(var(--lp-accent))" fillOpacity="0.12" />
              <path d={stepPath(floors[k])} fill="none" stroke="rgb(var(--lp-accent))" strokeWidth="1.6" strokeDasharray="4 3" />
              <path d={linePath(EQ)} fill="none" stroke="rgb(var(--lp-text))" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            <figcaption className="mt-3">
              <div className="font-display text-[17px] font-semibold text-lp-text">{t.types[i].name}</div>
              <p className="mt-1 text-lp-small text-lp-text-2">{t.types[i].text}</p>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-lp-small text-lp-muted">
        <span className="flex items-center gap-2"><span className="h-[2px] w-5 bg-lp-text" />{t.equity}</span>
        <span className="flex items-center gap-2"><span className="w-5 border-t-2 border-dashed border-lp-accent" />{t.floor}</span>
      </div>
      <p className="mt-5 max-w-[60ch] text-lp-small text-lp-text-2">{t.unverified}</p>
    </div>
  );
}
