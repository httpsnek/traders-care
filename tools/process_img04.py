# IMG-04 v3: чек в обеих темах (тёмная — генерация с исправленным фоном, светлая — из тёмной по референсу;
# геометрия совпадает до нескольких px). Без склеек: только кроп и подгонка фона под токены ground.
from PIL import Image
import numpy as np

X0, Y0, W, H = 520, 60, 1040, 1380
T = {"dark": (11, 11, 13), "light": (238, 240, 243)}
SRC = {"dark": "assets/raw/IMG-04_v3_dark_2000.jpg", "light": "assets/raw/IMG-04_v3_light_2000.jpg"}

for theme, src in SRC.items():
    a = np.asarray(Image.open(src).convert("RGB")).astype(float)
    ring = np.concatenate([a[:40].reshape(-1, 3), a[-40:].reshape(-1, 3), a[:, :40].reshape(-1, 3), a[:, -40:].reshape(-1, 3)])
    b = np.median(ring, 0); t = np.array(T[theme], float)
    out = t + (a - b) * (255 - t) / (255 - b) if theme == "dark" else a * t / b
    img = Image.fromarray(np.clip(out, 0, 255)[Y0:Y0 + H, X0:X0 + W].round().astype(np.uint8))
    img.save(f"public/media/how/img-04-{theme}.webp", quality=90, method=6)
    print(theme, "bg", b.round(1), "→", t, img.size)

# Плоская часть (по тёмной, 2000×1493): левый верхний угол (724.7, 202.8), ширина 353.8, наклон 9.83°, скрутка с y≈1100.
cx, cy = 724.7 - X0, 202.8 - Y0
print(f"PAPER left {cx / W * 100:.2f}% top {cy / H * 100:.2f}% width {353.8 / W * 100:.2f}cqw flat {880 / W * 100:.1f}cqw")
