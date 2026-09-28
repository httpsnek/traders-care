# VID-01: открытие крышки (Veo 3.1 → Topaz 2x: 3840×2160, 30 fps) → последовательность кадров для прокрутки.
# Берём отрезок T0–T1: до него ноутбук почти неподвижен, после — крышка уже стоит. 144 кадра равномерно по времени,
# даунскейл до 1920×1080 → public/media/hero/lid/000..143.webp.
import subprocess, numpy as np, os, sys
from PIL import Image

# Тема: python3 tools/process_vid01.py [dark|light]. Светлая — серебристый ноутбук на светлом фоне (VID-01 light).
THEME = sys.argv[1] if len(sys.argv) > 1 else "dark"

CFG = {
    "dark": ("assets/raw/VID-01_lid_veo31_topaz.mp4", "public/media/hero/lid", 1.35, 6.5),
    "light": ("assets/raw/VID-01_lid_light_veo31_topaz.mp4", "public/media/hero/lid-light", 0.6, 6.1),
}
SRC, OUT, T0, T1 = CFG[THEME]
OW, OUT_M, MW = 1920, OUT + "-m", 960
N, FPS = 144, 30
W, H = 3840, 2160
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", SRC, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
os.makedirs(OUT, exist_ok=True); os.makedirs(OUT_M, exist_ok=True)
for i in range(N):
    n = min(len(fr) - 1, round((T0 + (T1 - T0) * i / (N - 1)) * FPS))
    im = Image.fromarray(fr[n])
    im.resize((OW, OW * 9 // 16), Image.LANCZOS).save(f"{OUT}/{i:03d}.webp", quality=88, method=5)
    # Телефон: 960 px — чуть мягче, зато кадр распаковывается за пару мс и плавность не страдает.
    im.resize((MW, MW * 9 // 16), Image.LANCZOS).save(f"{OUT_M}/{i:03d}.webp", quality=76, method=5)
for d in (OUT, OUT_M): print(d, N, "frames", sum(os.path.getsize(f"{d}/{f}") for f in os.listdir(d)) // 1024, "KB")
