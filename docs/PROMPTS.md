# Промпты для изображений и видео

Готовые к копированию. Источник и логика — `LANDING-SPEC.md`, часть D.

## Как пользоваться

1. Сначала **тёмная** версия каждого изображения, 4–8 вариантов, выбрать по критериям.
2. **Светлая** — на вход подать выбранную тёмную как референс (image-to-image, сходство высокое) + светлый промпт. Геометрия должна совпасть: наложи две картинки друг на друга — контуры объекта одинаковые.
3. **Видео** — image-to-video из выбранного кадра своей темы.
4. Негатив один на все изображения (ниже). Если инструмент не поддерживает негатив — пропусти.
5. Файлы: `assets/raw/IMG-01_dark_v1.png`, `IMG-01_light_v1.png`, `VID-01_dark_v1.mp4`.

Везде: **никакого текста в кадре** — все цифры и подписи накладываются кодом.

### Негатив для всех изображений

```
text, letters, numbers, digits, logo, watermark, label, UI, screen content, charts drawn on objects, people, hands, fingers, face, green light, red light, neon, rainbow, lens flare, bokeh balls, colored smoke, sci-fi, cyberpunk, clutter, busy background, gradient background, floor horizon line, cartoon, illustration, 3d render look, plastic, oversaturated
```

### Светлая версия — общий промпт (для IMG-01…IMG-07)

```
Same object, same composition, same camera angle and framing as the reference image. Relit as bright high-key studio product photography on a seamless very light cool grey background (#EEF0F3) filling the entire frame, soft diffused daylight from the upper left, soft natural contact shadow beneath, the violet rim light reduced to a faint violet reflection on the edges, materials unchanged, photorealistic, high detail.
```

---

## IMG-01 · Стеклянная панель — первый экран

**Как выглядит**: высокая панель из толстого матового стекла стоит в пазу массивного тёмного алюминиевого основания, снята строго спереди. Сзади сквозь стекло пробивается фиолетовый свет. На стекло код выводит график «факт против торговли по правилам».
**Формат**: 4:3, от 3200 × 2400.

**Тёмная**
```
A single tall rectangular panel of thick frosted glass standing perfectly upright in a precise slot milled into a heavy low block of dark anodized aluminium, photographed exactly head-on so the glass edges are perfectly parallel to the frame, the glass surface is evenly frosted and completely blank, a soft violet glow shines through the glass from directly behind it and fades toward the edges, fine polished chamfer on the glass edges catching a thin line of light, the aluminium base has subtle horizontal machining lines and a small brass screw at each end, object centered slightly to the right, generous empty space around it, studio product photography, seamless near-black charcoal background (#0B0B0D) filling the entire frame, soft key light from the upper left, thin cool violet rim light from behind (#8D7CF8), precise machined edges, realistic materials and reflections, calm minimal composition, photorealistic, high detail, 8k
```

**Выбирать**: края стекла параллельны кадру; стекло ровное, без пятен; фон в углах однотонный почти чёрный; нет линии горизонта пола.

### VID-01 · Дымка из паза (из IMG-01, каждая тема)

**Как выглядит**: кадр неподвижен, из паза основания за стеклом медленно поднимается тонкая полупрозрачная фиолетовая дымка. 6 секунд, по кругу.

```
Static locked-off camera, no camera movement. A very thin, slow, translucent violet haze rises gently from the slot in the aluminium base behind the glass panel and drifts upward, softly lit by the glow behind the glass; the glass panel, the base and the background stay completely still; subtle, calm, seamless loop, 6 seconds.
```
Негатив: `camera movement, zoom, pan, flicker, sparks, particles, fire, thick smoke, objects moving, text`
Для светлой темы: `a very thin, slow, translucent pale lavender haze` вместо violet.
**Выбирать**: стекло и основание не шевелятся ни на пиксель; дымка не закрывает центр стекла.

---

## IMG-02 · Прецизионный прибор — правила проп-фирмы

**Как выглядит**: круглый измерительный прибор, как манометр: массивный алюминиевый корпус, латунное кольцо, выпуклое стекло, пустой тёмный циферблат. Шкалу, стрелку и «до пола $3 150» рисует код.
**Формат**: 1:1, от 3000 × 3000.

**Тёмная**
```
A precision round instrument gauge with a heavy dark anodized aluminium bezel and a thick domed glass cover, photographed exactly head-on so the dial is a perfect circle, the dial face is completely blank matte dark graphite with only a few very fine concentric machined rings near its outer edge, no needle, no markings, no numbers, a thin brass ring between bezel and dial, knurled texture on the outer bezel edge, soft reflection of the key light as a gentle arc on the upper left of the glass dome, faint violet rim light around the back of the bezel, the gauge floats centered in empty dark space, studio product photography, seamless near-black charcoal background (#0B0B0D) filling the entire frame, soft key light from the upper left, precise machined edges, realistic materials and reflections, calm minimal composition, photorealistic, high detail, 8k
```

**Выбирать**: циферблат — ровный круг, не овал; нет стрелки и рисок; блик не заходит в центр.

---

## IMG-03 · Телефон у металлического бруска — правила проп-фирмы (только десктоп)

**Как выглядит**: минималистичный телефон в тёмной титановой рамке стоит почти вертикально, прислонён к бруску алюминия. Экран смотрит прямо в камеру и полностью чёрный — туда код вставит мобильную версию проп-лимитов.
**Формат**: 4:5, от 2400 × 3000.

**Тёмная**
```
A modern minimalist smartphone with thin uniform bezels and a dark titanium frame standing almost upright, leaning back slightly against a solid rectangular block of dark anodized aluminium, photographed from the front and very slightly above, the screen faces the camera directly and is completely black and blank with no reflections, no brand, no visible camera bump from the front, the aluminium block has crisp machined edges and fine horizontal milling lines, a thin violet rim light outlines the phone frame from behind, soft contact shadow on an invisible dark floor that blends into the background, object centered, studio product photography, seamless near-black charcoal background (#0B0B0D) filling the entire frame, soft key light from the upper left, realistic materials and reflections, calm minimal composition, photorealistic, high detail, 8k
```
Добавить в негатив: `apple logo, iphone camera island, notch, dynamic island, reflections on screen, wallpaper`

**Выбирать**: экран — чёткий прямоугольник без бликов; телефон не похож на конкретный бренд.

---

## IMG-04 · Чек из термопринтера — «Как это работает»

**Как выглядит**: вид строго сверху, длинная узкая полоска чековой бумаги лежит по диагонали на тёмном металле, нижний конец мягко скручен. Бумага пустая — код «напечатает» на ней ошибки и их цену.
**Формат**: 3:2, от 3300 × 2200.

**Тёмная**
```
Top-down flat lay photograph, camera exactly overhead, a single long narrow strip of blank thermal receipt paper lying diagonally on a dark matte anodized aluminium surface, the paper enters from the top edge of the frame and runs almost to the bottom, the upper and middle parts lie perfectly flat, only the bottom end curls up softly and casts a gentle shadow, subtle realistic paper texture, slightly torn serrated edge at the top, the paper is completely blank with no print, soft directional light from the upper left, faint violet rim reflection on the curled end, the metal surface fades seamlessly into near-black (#0B0B0D) at the frame edges, studio product photography, realistic materials, calm minimal composition, photorealistic, high detail, 8k
```

**Светлая** — общий светлый промпт + `the paper stays warm white, separated from the light background by a soft shadow`.
**Выбирать**: плоская часть бумаги без изгибов; края прямые; наклон примерно 12°.

---

## IMG-05 · Сургучная пломба — журнал и проверенная карточка

**Как выглядит**: круглая печать из фиолетового сургуча с выдавленным геометрическим узором (кольца и точка), без букв. На сайте маленькая, около 120 px, как знак «данные брокера опечатаны».
**Формат**: 1:1, от 1500 × 1500. После генерации — удалить фон (PNG с прозрачностью). Светлая версия, скорее всего, не нужна: проверим вырез на обоих фонах.

```
A single round seal stamp made of deep violet sealing wax, pressed flat, with an embossed abstract geometric pattern of concentric rings and a small center dot, no letters, no symbols, irregular soft wax edges, satin sheen, lying on a plain dark background, lit from the upper left, crisp detail, macro product photography, isolated object, photorealistic, high detail, 8k
```

**Выбирать**: в оттиске нет букв; воск фиолетовый, не красный.

---

## IMG-06 · Стеклянный ключ — доверие и безопасность

**Как выглядит**: классический ключ целиком из прозрачного стекла лежит на тёмном шлифованном металле, сквозь него видна фактура. Встаёт в узел схемы «брокер → инвесторский пароль → Traders Care»: смотреть можно, торговать нельзя.
**Формат**: 1:1, от 2000 × 2000.

**Тёмная**
```
A single classic key made entirely of clear solid glass, lying horizontally on a dark brushed aluminium surface, the glass is perfectly transparent with polished edges that catch thin lines of light, the key's bit has simple straight cuts, the metal surface texture is visible through the glass, a soft violet rim light refracts inside the glass edges, gentle caustic light on the surface next to the key, camera from above at about 35 degrees, object centered with lots of empty space, the surface fades into near-black (#0B0B0D) at the frame edges, studio product photography, realistic materials and reflections, calm minimal composition, photorealistic, high detail, 8k
```

**Выбирать**: сразу читается как ключ; стекло прозрачное, не мутное.

---

## IMG-07 · Веер металлических карт — проп-фирмы

**Как выглядит**: вид сверху, три карты банковского размера веером — тёмный алюминий, латунь, матовое стекло. Лица пустые — код выведет логотип фирмы, «до $400K», рейтинг.
**Формат**: 3:2, от 3300 × 2200.

**Тёмная**
```
Top-down flat lay, camera exactly overhead, three premium metal cards the size of bank cards fanned out slightly on a dark matte surface, each card made of a different finish: dark anodized aluminium, brushed brass, and frosted glass, cards rotated at about minus 14, minus 4 and plus 8 degrees with their lower corners close together, card faces completely blank with no chip, no numbers, no logos, crisp beveled edges catching thin light, soft realistic shadows between cards, faint violet rim reflection on edges, the surface fades seamlessly into near-black (#0B0B0D) at the frame edges, studio product photography, realistic materials, calm minimal composition, photorealistic, high detail, 8k
```
Добавить в негатив: `chip, contactless symbol, embossed numbers, credit card logos`

**Выбирать**: лица карт плоские, без перспективы; верхняя карта видна целиком.

---

## IMG-08 · Рабочее место на рассвете — финальный экран

**Как выглядит**: широкий кадр. Пустое рабочее место трейдера у огромного окна, за окном город на рассвете, один тонкий монитор с тусклым экраном, закрытый блокнот и латунная ручка. Левая половина — спокойная тёмная стена под текст и кнопку. Людей нет.
**Формат**: 21:9, от 4200 × 1800.

**Тёмная (ранний рассвет, сумерки)**
```
Wide cinematic interior photograph of a minimal trader's workspace at early dawn, no people, a clean dark wooden desk in front of a huge floor-to-ceiling window, a single slim monitor on a dark aluminium stand with a dim screen glowing softly, a closed notebook and a brass pen on the desk, outside the window a calm city skyline in deep blue twilight with the first thin line of pale light on the horizon, the left half of the frame is a dark quiet wall in deep shadow with no details, soft cool ambient light, subtle violet reflection on the monitor stand, shallow depth of field, shot on 35mm, photorealistic, quiet and calm mood, color palette of near-black, deep blue and a touch of violet
```
Негатив: `people, person, chair with person, reflection of a person, coffee cup steam, multiple monitors, trading screens, candlestick charts, logos, text, cluttered desk, plants, warm orange sunset, neon`

**Светлая (позднее утро, с тёмной как референсом)**
```
Same scene, same composition and camera as the reference image; bright soft morning daylight, the sky outside pale and clear, the room light and airy with soft shadows, the left half of the frame is a smooth light grey wall with no details, the monitor screen dark grey, palette of light grey, white and pale blue with a faint violet reflection, photorealistic
```

**Выбирать**: левая половина без деталей; нет людей и их отражений в стекле; на мониторе нет графиков.

### VID-03 · Свет ползёт по столу (из IMG-08, каждая тема)

**Как выглядит**: кадр неподвижен, за окном медленно светлеет, по столу проходит полоса бледного света. 8 секунд, по кругу.

```
Static locked-off camera, no camera movement. Soft dawn light slowly grows outside the window and a thin band of pale light gradually moves across the desk surface; nothing else moves; very slow, calm, seamless loop, 8 seconds.
```
Негатив: `camera movement, people, flicker, clouds moving fast, birds, cars, lights turning on, text`
Для светлой темы: `soft morning sunlight slowly shifts, a band of warm pale light gradually moves across the desk`.

---

## Итого

| ID | Что | Тёмная | Светлая | Видео |
|---|---|---|---|---|
| IMG-01 | Стеклянная панель | ✓ | ✓ | VID-01 × 2 |
| IMG-02 | Прибор | ✓ | ✓ | — |
| IMG-03 | Телефон | ✓ | ✓ | — |
| IMG-04 | Чек | ✓ | ✓ | — |
| IMG-05 | Пломба | ✓ (вырез) | проверить | — |
| IMG-06 | Стеклянный ключ | ✓ | ✓ | — |
| IMG-07 | Карты | ✓ | ✓ | — |
| IMG-08 | Рабочее место | ✓ | ✓ | VID-03 × 2 |

Начать с IMG-01, IMG-02, IMG-04 (тёмные): по ним станет понятно, работает ли стиль.
