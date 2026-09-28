// Короткая концепция нового лендинга для клиента.
// node tools/build-concept-docx.js  →  deliverables/concept-docx/Traders_Care_концепция_лендинга.docx
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, HeadingLevel,
  WidthType, BorderStyle, ShadingType, LevelFormat, Footer, PageNumber,
} = require("docx");

const OUT_DIR = path.resolve(__dirname, "../deliverables/concept-docx");
fs.mkdirSync(OUT_DIR, { recursive: true });
const OUT = path.join(OUT_DIR, "Traders_Care_концепция_лендинга.docx");

const FONT = "Times New Roman";
const CONTENT_W = 9355;
const GREY = "595959";
const run = (text, o = {}) => new TextRun({ text, font: FONT, ...o });
const p = (children, o = {}) => new Paragraph({
  children: typeof children === "string" ? [run(children)] : children,
  alignment: o.align ?? AlignmentType.JUSTIFIED,
  indent: o.noIndent ? undefined : { firstLine: 709 },
  spacing: { after: 120, line: 312 },
});
const h1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [run(t)] });
const bullet = (t) => new Paragraph({
  numbering: { reference: "dash", level: 0 }, alignment: AlignmentType.JUSTIFIED,
  spacing: { after: 40, line: 300 }, children: typeof t === "string" ? [run(t)] : t,
});
const lead = (a, b) => bullet([run(a, { bold: true }), run(b)]);

const border = { style: BorderStyle.SINGLE, size: 4, color: "8C8C8C" };
const borders = { top: border, bottom: border, left: border, right: border };
function table(rows, fr) {
  const w = fr.map((f) => Math.round(f * CONTENT_W));
  w[w.length - 1] += CONTENT_W - w.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: w,
    rows: rows.map((r, ri) => new TableRow({
      tableHeader: ri === 0, cantSplit: true,
      children: r.map((c, ci) => new TableCell({
        borders, width: { size: w[ci], type: WidthType.DXA },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        shading: ri === 0 ? { fill: "E7E6E6", type: ShadingType.CLEAR, color: "auto" } : undefined,
        children: [new Paragraph({ spacing: { after: 0, line: 252 }, children: [run(c, { size: 21, bold: ri === 0 })] })],
      })),
    })),
  });
}

const children = [
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
    children: [run("Концепция нового лендинга Traders Care", { size: 34, bold: true })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 360 },
    children: [run("traderscare.io · сентябрь 2026", { size: 22, color: GREY })] }),

  h1("1. Главная идея"),
  p("Большинство журналов сделок обещают «найти ошибки». Traders Care может показать больше: сколько в деньгах трейдер теряет, когда отступает от собственных правил. Эта мысль уже заложена в продукте, и на ней построена вся страница."),
  p([run("Рабочий заголовок первого экрана: ", { bold: true }), run("«Торгуй по своим правилам. И знай, сколько стоит каждое отступление.»")]),
  p("Главная аудитория на странице — проп-трейдеры: для них нарушение правила означает потерю счёта. Вторая аудитория — системные трейдеры с несколькими счетами."),

  h1("2. Как выглядит страница"),
  p("Визуальное направление — «прецизионные инструменты»: тёмный алюминий, матовое стекло, латунь в деталях, мягкий студийный свет и фирменный фиолетовый акцент. Интерфейс Traders Care выглядит как ещё один прибор из этой серии."),
  p("Основа страницы — сам продукт. Экраны интерфейса нарисованы заново в новом стиле, с правдоподобными данными, так что лендинг заодно показывает, как может выглядеть обновлённое приложение."),
  p("Изображения работают как часть интерфейса. Это физические объекты, снятые в студийной манере, поверх которых выводятся живые данные:"),
  lead("стеклянная панель", " на металлическом основании, на ней график доходности «как торговал» против «как если бы по правилам»;"),
  lead("точный измерительный прибор,", " стрелка которого показывает, сколько осталось до лимита просадки проп-фирмы;"),
  lead("кассовый чек", " со списком нарушений и их стоимостью — «счёт за отступления»;"),
  lead("стеклянный ключ", " как образ доступа только на чтение;"),
  lead("металлические карты", " для каталога проп-фирм."),
  p("Все надписи на изображениях выводятся кодом, поэтому страница одинаково работает на английском, русском и украинском языках. Для страницы предусмотрены тёмная и светлая темы, мобильная версия и соответствие стандарту доступности WCAG AA."),

  new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [run("3. Структура страницы")] }),
  new Paragraph({ keepNext: true, indent: { firstLine: 709 }, spacing: { after: 160, line: 312 },
    children: [run("Страница состоит из одиннадцати блоков. Каждый отвечает на один вопрос посетителя, а соседние блоки оформлены по-разному, чтобы страница не превращалась в однообразную ленту.")] }),
  table([
    ["№", "Блок", "Что видит посетитель"],
    ["1", "Первый экран", "Обещание продукта и график «факт против торговли по правилам» с подписанной разницей в деньгах"],
    ["2", "Поддерживаемые платформы", "MetaTrader 4 и 5, cTrader, Match-Trader, DXtrade и ключевые показатели сервиса"],
    ["3", "Правила проп-фирмы", "Прибор с лимитами счёта в реальном времени, та же информация на телефоне, схема трёх типов просадки"],
    ["4", "Как это работает", "Три шага от подключения счёта до первого разбора и пример «чека» с ценой ошибок"],
    ["5", "Продукт", "Журнал, статистика, торговая система и разборы — четыре переключаемых экрана"],
    ["6", "ИИ-ассистент", "Пример диалога по данным журнала; анализ, а не торговые сигналы"],
    ["7", "Доверие и безопасность", "Схема доступа только на чтение и проверяемая карточка сделки"],
    ["8", "Проп-фирмы и калькуляторы", "Каталог фирм с подбором и бесплатные инструменты"],
    ["9", "Сравнение и тарифы", "Отличия от таблиц и обычных журналов, четыре тарифа с отдельной кнопкой у каждого"],
    ["10", "Вопросы", "Ответы на шесть главных вопросов перед регистрацией"],
    ["11", "Финальный экран", "Спокойная сцена рабочего места на рассвете и кнопка регистрации"],
  ], [0.06, 0.28, 0.66]),

  h1("4. Что нужно от вас"),
  p("Где данных пока нет, в макете останутся нейтральные формулировки без цифр."),
  bullet("показатели, которые можно публиковать: число пользователей, сделок или подключённых счетов;"),
  bullet("актуальные условия тарифов и планы по годовой оплате;"),
  bullet("текущий способ оплаты подписки;"),
  bullet("реальные отзывы пользователей, если они есть;"),
  bullet("разрешение на использование логотипов платформ и проп-фирм;"),
  bullet("контакты поддержки и ссылки на социальные сети."),

  h1("5. Дальнейшие шаги"),
  p("После согласования — визуальные материалы и первый экран в двух вариантах, затем вёрстка всей страницы на технологиях Traders Care, без переписывания при переносе на сайт."),
];

const doc = new Document({
  creator: "",
  title: "Концепция нового лендинга Traders Care",
  styles: {
    default: { document: { run: { font: FONT, size: 24, color: "1A1A1A" } } },
    paragraphStyles: [{ id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
      run: { font: FONT, size: 28, bold: true }, paragraph: { spacing: { before: 260, after: 120 }, outlineLevel: 0, keepNext: true } }],
  },
  numbering: { config: [{ reference: "dash", levels: [{ level: 0, format: LevelFormat.BULLET, text: "–", alignment: AlignmentType.LEFT,
    style: { paragraph: { indent: { left: 1069, hanging: 360 } } } }] }] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1701, right: 850 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
      children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 20, color: GREY })] })] }) },
    children,
  }],
});

Packer.toBuffer(doc).then((b) => { fs.writeFileSync(OUT, b); console.log("saved", OUT); });
