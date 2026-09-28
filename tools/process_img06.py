# IMG-06: стеклянный ключ (блок «Цифры, которым можно верить»), обе темы.
# 1) Выравнивание освещения фона: по пикселям фона вне ключа подбирается плавная поверхность яркости
#    (квадратичная), затем кадр целиком делится/сдвигается на неё — как flat-field коррекция в студии.
#    Стекло прозрачное, поэтому корректируем весь кадр одинаково — то, что видно сквозь стекло, остаётся согласованным.
# 2) Чёрная/белая точка фона → токен ground. 3) Кроп ~2:1 с полями.
from PIL import Image
import numpy as np

T = {"dark": (11, 11, 13), "light": (238, 240, 243)}
SRC = {"dark": "assets/raw/IMG-06_key_dark_selected_2000.jpg", "light": "assets/raw/IMG-06_key_light_selected_2000.jpg"}
KEY = (300, 290, 1720, 900)          # ключ с тенью и каустикой + запас (x0, y0, x1, y1) — исключается из подгонки
CROP = (180, 180, 1840, 1000)        # 1660×820

for theme, src in SRC.items():
    a = np.asarray(Image.open(src).convert("RGB")).astype(float)
    H, W, _ = a.shape
    L = a.mean(2)
    yy, xx = np.mgrid[0:H, 0:W]
    mask = np.ones((H, W), bool)
    mask[KEY[1]:KEY[3], KEY[0]:KEY[2]] = False
    step = 6
    ys, xs = yy[mask][::step], xx[mask][::step]
    v = L[mask][::step]
    nx, ny = xs / W, ys / H
    A = np.stack([np.ones_like(nx), nx, ny, nx * nx, ny * ny, nx * ny], 1)
    coef, *_ = np.linalg.lstsq(A, v, rcond=None)
    NX, NY = xx / W, yy / H
    field = coef[0] + coef[1] * NX + coef[2] * NY + coef[3] * NX * NX + coef[4] * NY * NY + coef[5] * NX * NY
    ring = np.concatenate([a[:20].reshape(-1, 3), a[-20:].reshape(-1, 3), a[:, :20].reshape(-1, 3), a[:, -20:].reshape(-1, 3)])
    b = np.median(ring, 0)
    lb = b.mean()
    if theme == "dark":
        flat = a - (field - lb)[..., None]                       # аддитивно: на тёмном фоне свет «добавлен»
    else:
        flat = a * (lb / field)[..., None]                       # мультипликативно: светлый фон — освещённость
    t = np.array(T[theme], float)
    out = t + (flat - b) * (255 - t) / (255 - b) if theme == "dark" else flat * t / b
    out = np.clip(out, 0, 255)[CROP[1]:CROP[3], CROP[0]:CROP[2]]
    img = Image.fromarray(out.round().astype(np.uint8))
    img.save(f"public/media/verify/img-06-{theme}.webp", quality=90, method=6)
    Lo = out.mean(2); c = 50
    print(theme, "field range", round(field.min(), 1), round(field.max(), 1), "→ corners",
          [round(Lo[:c, :c].mean(), 1), round(Lo[:c, -c:].mean(), 1), round(Lo[-c:, :c].mean(), 1), round(Lo[-c:, -c:].mean(), 1)], img.size)
