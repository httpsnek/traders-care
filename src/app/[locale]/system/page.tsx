import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/site/header";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n";

// Служебная страница: токены, шрифты и компоненты в текущей теме. Не для посетителей.
export const metadata: Metadata = { title: "System · Traders Care landing", robots: { index: false } };

const colors = [
  ["ground", "Фон страницы и генераций"], ["raised", "Экраны интерфейса"], ["line", "Линии"],
  ["text", "Текст"], ["text-2", "Текст второй"], ["muted", "Подписи"], ["accent", "Акцент"],
  ["profit", "Только прибыль"], ["loss", "Только убыток"], ["warning", "WARNING"],
] as const;

const type = [
  ["text-lp-hero font-display font-semibold", "Hero H1 · 76", "Торгуй по своим правилам."],
  ["text-lp-h2 font-display font-semibold", "H2 · 52", "Узнай о нарушении заранее."],
  ["text-lp-num font-display font-medium text-lp-loss", "Цифра · 96", "−$2 340"],
  ["text-lp-h3 font-display font-semibold", "H3 · 24", "Дневной лимит"],
  ["text-lp-lead text-lp-text-2", "Лид · 20", "Сделки приходят сами с MetaTrader, cTrader, Match-Trader и DXtrade."],
  ["text-lp-body", "Текст · 17", "Ґрунтовний аналіз: їхні правила, твої угоди, єдиний журнал."],
  ["text-lp-small text-lp-muted", "Подпись · 14", "Пример данных · обновлено 2 мин назад"],
  ["text-lp-data font-mono", "Моно · 14", "Вход без подтверждения ×5   −$640"],
] as const;

type Props = { params: Promise<{ locale: string }> };

export default async function SystemPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <>
      <Header locale={locale} t={t.header} />
      <main className="pt-header">
        <Container className="flex flex-col gap-20 py-16">
          <section className="flex flex-col gap-6">
            <h1 className="text-lp-h2">Токены</h1>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {colors.map(([name, note]) => (
                <li key={name} className="overflow-hidden rounded-control border border-lp-line">
                  <div className="h-20" style={{ background: `rgb(var(--lp-${name}))` }} />
                  <div className="p-3">
                    <div className="font-mono text-[13px] text-lp-text">--lp-{name}</div>
                    <div className="text-[13px] text-lp-muted">{note}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-8">
            <h2 className="text-lp-h2">Шкала шрифтов</h2>
            {type.map(([cls, label, sample]) => (
              <div key={label} className="grid gap-2 border-t border-lp-line pt-4 md:grid-cols-[180px_1fr]">
                <span className="font-mono text-[13px] text-lp-muted">{label}</span>
                <span className={cls}>{sample}</span>
              </div>
            ))}
          </section>

          <section className="flex flex-col gap-6">
            <h2 className="text-lp-h2">Кнопки</h2>
            <div className="flex flex-wrap items-center gap-3">
              <ButtonLink href="#" size="lg">Начать бесплатно</ButtonLink>
              <ButtonLink href="#" variant="secondary" size="lg">Как это работает</ButtonLink>
              <ButtonLink href="#">Начать бесплатно</ButtonLink>
              <ButtonLink href="#" variant="secondary">Войти</ButtonLink>
              <ButtonLink href="#" variant="ghost">Все вопросы →</ButtonLink>
            </div>
          </section>
        </Container>
      </main>
    </>
  );
}
