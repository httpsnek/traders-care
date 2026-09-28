# IMG-09: iPad Pro + Apple Pencil (блок «Продукт»). Кроп 3:2 с полями, чёрная точка фона → ground.
# Исходники 2000×1493 (тёмная из светлой по референсу — геометрия совпадает до 1 px).
# Экран: x 500–1437, y 410–1082 (937×672, 1.394), стоит ровно, без наклона.
from PIL import Image
import numpy as np, sys

X0, Y0, W, H = 360, 302, 1330, 887
T = {"dark": (11, 11, 13), "light": (238, 240, 243)}
SRC = {"dark": "assets/raw/IMG-09_ipad_dark_selected_2000.jpg", "light": "assets/raw/IMG-09_ipad_light_selected_2000.jpg"}

for theme, src in SRC.items():
    try:
        a = np.asarray(Image.open(src).convert("RGB")).astype(float)
    except FileNotFoundError:
        print(theme, "— нет исходника, пропуск"); continue
    ring = np.concatenate([a[:40].reshape(-1, 3), a[-40:].reshape(-1, 3), a[:, :40].reshape(-1, 3), a[:, -40:].reshape(-1, 3)])
    b = np.median(ring, 0); t = np.array(T[theme], float)
    out = t + (a - b) * (255 - t) / (255 - b) if theme == "dark" else a * t / b
    img = Image.fromarray(np.clip(out, 0, 255)[Y0:Y0 + H, X0:X0 + W].round().astype(np.uint8))
    img.save(f"public/media/product/img-09-{theme}.webp", quality=90, method=6)
    print(theme, "bg", b.round(1), "→", t, img.size)

sx, sy, sw, sh = 500 - X0, 410 - Y0, 937, 672
print(f"screen %: left {sx/W*100:.3f} top {sy/H*100:.3f} width {sw/W*100:.3f} height {sh/H*100:.3f}")
