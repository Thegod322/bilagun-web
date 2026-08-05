import os
from PIL import Image

in_dir = "public/assets/compressed-for-web-page"
out_dir = "public/assets/thumbnails"

if not os.path.exists(out_dir):
    os.makedirs(out_dir)

for file in os.listdir(in_dir):
    if file.endswith(".webp"):
        in_path = os.path.join(in_dir, file)
        out_path = os.path.join(out_dir, file)
        with Image.open(in_path) as img:
            img.thumbnail((400, 400))
            img.save(out_path, "WEBP", quality=80)
print("Thumbnails created.")
