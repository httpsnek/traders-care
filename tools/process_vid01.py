# VID-01: открытие крышки (Veo 3.1 → Topaz 2x: 3840×2160, 30 fps) → последовательность кадров для прокрутки.
# Берём отрезок T0–T1: до него ноутбук почти неподвижен, после — крышка уже стоит. 144 кадра равномерно по времени,
# даунскейл до 1920×1080 → public/media/hero/lid/000..143.webp.
import subprocess, numpy as np, os
from PIL import Image

SRC, OUT, OW = "assets/raw/VID-01_lid_veo31_topaz.mp4", "public/media/hero/lid", 1920
T0, T1, N, FPS = 1.35, 6.5, 144, 30
W, H = 3840, 2160
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", SRC, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
os.makedirs(OUT, exist_ok=True)
for i in range(N):
    n = min(len(fr) - 1, round((T0 + (T1 - T0) * i / (N - 1)) * FPS))
    Image.fromarray(fr[n]).resize((OW, OW * 9 // 16), Image.LANCZOS).save(f"{OUT}/{i:03d}.webp", quality=88, method=5)
print("frames", N, "of", len(fr), "KB", sum(os.path.getsize(f"{OUT}/{f}") for f in os.listdir(OUT)) // 1024)
