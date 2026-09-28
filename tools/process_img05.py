# IMG-05: пломба. Вырез с нейтрально-серого фона: силуэт по насыщенности (воск фиолетовый, фон серый);
# фон заливается от угла, всё, что заливка не достала, — пломба (так блики внутри не становятся дырками);
# край уводится на 2 px внутрь по чистому воску и растушёвывается — без серой каймы на обоих фонах.
# 512 px, WebP с прозрачностью. Тень — в CSS.
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

src = np.asarray(Image.open("assets/raw/IMG-05_selected_2000.jpg").convert("RGB")).astype(float)
chroma = src.max(2) - src.min(2)

m = Image.fromarray(((chroma > 24) * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(5))
ImageDraw.floodfill(m, (0, 0), 128)                       # фон, связанный с углом
mask = Image.fromarray(((np.asarray(m) != 128) * 255).astype(np.uint8))
mask = mask.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
alpha = np.asarray(mask).astype(float)

ys, xs = np.where(alpha > 5)
pad = 24
box = (xs.min() - pad, ys.min() - pad, xs.max() + pad, ys.max() + pad)
out = Image.fromarray(np.dstack([src, alpha]).round().astype(np.uint8), "RGBA").crop(box)
side = max(out.size)
sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
sq.paste(out, ((side - out.width) // 2, (side - out.height) // 2))
sq = sq.resize((512, 512), Image.LANCZOS)
sq.save("public/media/product/img-05-seal.webp", quality=92, method=6)
print("box", box, "→", sq.size)
