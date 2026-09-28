# IMG-07: металлические карты (блок «Проп-фирмы»). Каждая карта сгенерирована отдельно по одному шаблону —
# контур у всех совпадает (x 347–1652, y 330–1161 в 2000×1493). Вырез не по цвету, а по геометрии:
# маска — скруглённый прямоугольник (радиус как у банковской карты, 3.2 / 85.6 ширины), со сглаживанием ×4.
# Результат — WebP с прозрачностью, обрезанный по карте; тень, поворот и раскладка — в CSS.
from PIL import Image, ImageDraw
import os

BOX = (347, 330, 1652, 1161)        # внешний контур карты (по фаске)
INSET = 1.0                          # на 1 px внутрь — без серой каймы фона
OUT_W = 1200
SS = 4

cards = [n for n in ("graphite", "titanium", "violet", "ceramic") if os.path.exists(f"assets/raw/IMG-07_card_{n}_2000.jpg")]
for name in cards:
    im = Image.open(f"assets/raw/IMG-07_card_{name}_2000.jpg").convert("RGB").crop(BOX)
    w, h = im.size
    r = 3.2 / 85.6 * w
    mask = Image.new("L", (w * SS, h * SS), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [INSET * SS, INSET * SS, (w - INSET) * SS - 1, (h - INSET) * SS - 1], radius=r * SS, fill=255)
    mask = mask.resize((w, h), Image.LANCZOS)
    out = im.copy(); out.putalpha(mask)
    out = out.resize((OUT_W, round(h * OUT_W / w)), Image.LANCZOS)
    out.save(f"public/media/firms/img-07-{name}.webp", quality=92, method=6)
    print(name, "→", out.size, "radius px", round(r, 1))
