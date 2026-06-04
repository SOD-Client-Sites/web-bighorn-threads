"""Build YouTube thumbnail: 1280x720, avatar face left, bold text right, navy/gold brand."""
from PIL import Image, ImageDraw, ImageFont
import os, sys

ROOT = os.path.dirname(__file__)
AVATAR = os.path.join(ROOT, "thumb-avatar-raw.png")
LOGO   = os.path.join(ROOT, "..", "logos", "bighorn-logo-color.png")
OUT    = os.path.join(ROOT, "thumb-embroidery-cost.png")

W, H = 1280, 720
NAVY  = (0, 59, 92)       # #003B5C
GOLD  = (193, 155, 61)    # #C19B3D
WHITE = (255, 255, 255)
DARK  = (10, 18, 36)

canvas = Image.new("RGB", (W, H), NAVY)
draw   = ImageDraw.Draw(canvas)

# --- Avatar: crop face from portrait frame, place left side ---
av = Image.open(AVATAR).convert("RGB")
av_w, av_h = av.size  # 1080x1920

# Crop: take top 60% of the portrait for the face/upper body
crop_h = int(av_h * 0.60)
av_cropped = av.crop((0, 0, av_w, crop_h))  # 1080 x 1152

# Scale to fill left 640px wide at full height
scale = H / crop_h
new_w = int(av_w * scale)
av_resized = av_cropped.resize((new_w, H), Image.LANCZOS)

# Paste left-aligned, centered vertically
canvas.paste(av_resized, (0, 0))

# Dark gradient overlay on right half so text pops
for x in range(W // 2, W):
    alpha = int(255 * ((x - W // 2) / (W // 2)) ** 0.6)
    for y in range(H):
        r, g, b = canvas.getpixel((x, y))
        blend = alpha / 255
        nr = int(r * (1 - blend) + DARK[0] * blend)
        ng = int(g * (1 - blend) + DARK[1] * blend)
        nb = int(b * (1 - blend) + DARK[2] * blend)
        canvas.putpixel((x, y), (nr, ng, nb))

# Left-side dark vignette so avatar doesn't bleed to edge
for x in range(0, 100):
    alpha = int(255 * ((100 - x) / 100) ** 1.5)
    for y in range(H):
        r, g, b = canvas.getpixel((x, y))
        blend = alpha / 255
        nr = int(r * (1 - blend) + DARK[0] * blend)
        ng = int(g * (1 - blend) + DARK[1] * blend)
        nb = int(b * (1 - blend) + DARK[2] * blend)
        canvas.putpixel((x, y), (nr, ng, nb))

draw = ImageDraw.Draw(canvas)

# --- Gold accent bar ---
draw.rectangle([(640, 0), (648, H)], fill=GOLD)

# --- Text: right panel ---
text_x = 670
try:
    font_xl  = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 78)
    font_lg  = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 58)
    font_med = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 44)
    font_sm  = ImageFont.truetype("C:/Windows/Fonts/arial.ttf",   32)
except:
    font_xl = font_lg = font_med = font_sm = ImageFont.load_default()

# Line 1: question hook
draw.text((text_x, 80),  "HOW MUCH",      font=font_xl,  fill=WHITE)
draw.text((text_x, 168), "DOES IT COST",  font=font_lg,  fill=WHITE)
draw.text((text_x, 238), "TO EMBROIDER",  font=font_lg,  fill=WHITE)
draw.text((text_x, 308), "A SHIRT?",      font=font_xl,  fill=GOLD)

# Divider
draw.rectangle([(text_x, 400), (text_x + 560, 406)], fill=GOLD)

# Price callout
draw.text((text_x, 420), "$28–35/shirt",  font=font_lg,  fill=GOLD)
draw.text((text_x, 484), "at 24 pieces",  font=font_med, fill=WHITE)

# Divider 2
draw.rectangle([(text_x, 548), (text_x + 560, 552)], fill=(255,255,255,80))

# Brand line
draw.text((text_x, 562), "BIGHORN THREADS · LAS VEGAS", font=font_sm, fill=GOLD)
draw.text((text_x, 600), "bighornthreads.com",           font=font_sm, fill=(200,200,200))

# --- Logo top-right corner ---
try:
    logo = Image.open(LOGO).convert("RGBA")
    logo_w = 180
    ratio  = logo_w / logo.width
    logo   = logo.resize((logo_w, int(logo.height * ratio)), Image.LANCZOS)
    # Paste with alpha
    canvas.paste(logo, (W - logo_w - 20, 20), logo)
except Exception as e:
    print(f"Logo paste skipped: {e}")

canvas.save(OUT, "PNG", optimize=True)
print(f"Saved: {OUT}  ({os.path.getsize(OUT)//1024}KB)")
