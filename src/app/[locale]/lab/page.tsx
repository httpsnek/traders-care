import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { buttonClass } from "@/components/ui/button";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { PaletteDemo, type Palette } from "@/components/lab/palette-demo";

// Служебная страница: тестовые кнопки на выбор. Не для публикации — удалить после выбора.
export const metadata = { robots: { index: false } };

const S = ["", "hover", "press"] as const;
const L = { "": "обычная", hover: "наведение", press: "нажатие" } as const;

function Row({ title, note, children }: { title: string; note: string; children: (s: (typeof S)[number]) => React.ReactNode }) {
  return (
    <div className="border-t border-lp-line py-10">
      <div className="text-[17px] font-medium text-lp-text">{title}</div>
      <p className="mt-1 max-w-[70ch] text-lp-small text-lp-text-2">{note}</p>
      <div className="mt-6 flex flex-wrap items-end gap-8">
        {S.map((s) => (
          <div key={s} className="flex flex-col items-start gap-2">
            {children(s)}
            <span className="text-[12px] text-lp-muted">{L[s]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function Lab({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale).prop;
  const palettes: Palette[] = [
    { id: "now", title: "1. Сейчас", note: "Предупреждение пурпурное — почти как фирменный фиолетовый: кнопка и опасность одного цвета.", warnDark: "197 111 230", warnLight: "155 63 191" },
    { id: "amber", title: "2. Янтарь для предупреждений", note: "Предупреждение — тёплый янтарь (#F2B35A / #B7791F). Фиолетовый остаётся только брендом и интерактивом.", warnDark: "242 179 90", warnLight: "183 121 31" },
    { id: "gold", title: "3. Янтарь + золотые акценты", note: "То же, плюс тёплые детали малыми дозами: «Рекомендуем», выбранный день, свечение кнопки. Связывает интерфейс с рассветом и латунью на фото.", warnDark: "242 179 90", warnLight: "183 121 31", gold: { dark: "242 179 90", light: "183 121 31" } },
    { id: "copper", title: "4. Медь (альтернатива)", note: "Предупреждение — более красная медь (#E8875A / #B4552A). Теплее и тревожнее, но ближе к красному убытка.", warnDark: "232 135 90", warnLight: "180 85 42" },
  ];
  return (
    <main className="py-16">
      <Container>
        <h1 className="text-lp-h3 text-lp-text">Палитра: варианты</h1>
        <p className="mt-2 text-lp-small text-lp-text-2">Реальные компоненты сайта, перекрашены только цвета. Тему переключай на главной — выбор сохраняется и здесь.</p>
        <div className="mt-8 grid gap-20">{palettes.map((p) => <PaletteDemo key={p.id} p={p} t={t} />)}</div>

        <h1 className="mt-32 text-lp-h3 text-lp-text">Тестовые кнопки</h1>
        <p className="mt-2 text-lp-small text-lp-text-2">Наведи и нажми — состояния живые. Рядом зафиксированы «наведение» и «нажатие» для сравнения.</p>

        <div className="mt-10">
          <Row title="A. Яркий акцент" note="Сочный фиолетовый с тонким бликом сверху. При наведении — лёгкий подъём и свечение, стрелка сдвигается.">
            {(s) => (<div className="flex gap-3"><a href="#" data-s={s || undefined} className="btn-v btn-a">Начать бесплатно <ArrowRight size={17} /></a><a href="#" data-s={s || undefined} className="btn-v btn-s">Как это работает</a></div>)}
          </Row>
          <Row title="B. Контраст (белая / чёрная)" note="Самый современный и чистый приём: белая кнопка в тёмной теме, чёрная — в светлой. Фиолетовый остаётся акцентом в графиках.">
            {(s) => (<div className="flex gap-3"><a href="#" data-s={s || undefined} className="btn-v btn-b">Начать бесплатно <ArrowRight size={17} /></a><a href="#" data-s={s || undefined} className="btn-v btn-s">Как это работает</a></div>)}
          </Row>
          <Row title="C. Живой градиент" note="Акцент с мягким переливом, который плавно проезжает при наведении. Самый заметный, но без кислотности.">
            {(s) => (<div className="flex gap-3"><a href="#" data-s={s || undefined} className="btn-v btn-c">Начать бесплатно <ArrowRight size={17} /></a><a href="#" data-s={s || undefined} className="btn-v btn-s">Как это работает</a></div>)}
          </Row>
          <Row title="Сейчас на сайте" note="Плоская лавандовая.">
            {() => <a href="#" className={buttonClass("primary", "lg")}>Начать бесплатно</a>}
          </Row>
          <Row title="Металл (прошлый тест)" note="Для сравнения.">
            {(s) => <a href="#" data-s={s || undefined} className="btn-m btn-m--violet">Начать бесплатно <ArrowRight size={17} /></a>}
          </Row>
        </div>

        <div className="border-t border-lp-line py-10">
          <div className="text-[17px] font-medium text-lp-text">5. Жидкое стекло — для сравнения</div>
          <p className="mt-1 max-w-[70ch] text-lp-small text-lp-text-2">Работает только поверх картинки (ему нужно что-то преломлять). Слева — на финальной сцене, справа — на ровном фоне страницы.</p>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="relative flex aspect-[2/1] items-center justify-center overflow-hidden rounded-screen">
              <Image src="/media/final/img-08-dark.webp" alt="" fill unoptimized className="object-cover object-[70%_60%]" />
              <a href="#" className="btn-glass relative">Начать бесплатно</a>
            </div>
            <div className="flex aspect-[2/1] items-center justify-center rounded-screen border border-lp-line">
              <a href="#" className="btn-glass" style={{ color: "rgb(var(--lp-text))" }}>Начать бесплатно</a>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
