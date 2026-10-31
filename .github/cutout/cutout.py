# One-off: cut Siddharth out of the avatar's dark backdrop with a few rembg models,
# and render each result over the site's background colour for review.
import os
import sys
from PIL import Image
from rembg import new_session, remove

SRC = "frontend/src/assets/avatar.jpg"
OUT = "cutout-out"
os.makedirs(OUT, exist_ok=True)
src = Image.open(SRC).convert("RGB")

for model in sys.argv[1:]:
    print("model", model, flush=True)
    try:
        cut = remove(src, session=new_session(model), post_process_mask=True)
    except Exception as e:  # keep going so one failing model doesn't lose the others
        print("  failed:", e, flush=True)
        continue
    cut.save(f"{OUT}/{model}.png", optimize=True)
    bg = Image.new("RGBA", cut.size, (7, 8, 10, 255))
    bg.alpha_composite(cut)
    bg.convert("RGB").resize((512, 512)).save(f"{OUT}/{model}-preview.jpg", quality=88)
