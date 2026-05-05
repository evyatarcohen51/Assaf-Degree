#!/usr/bin/env python3
"""Generate Got Schooled PWA icons (192, 512, 512-maskable) using Pillow.
Cream background, dark border, gold sparkle — matches favicon.svg.
"""
import os
from PIL import Image, ImageDraw

CREAM = (255, 246, 234)
INK = (42, 42, 42)
GOLD = (241, 179, 51)


def draw_sparkle(draw, cx, cy, r, fill, outline, stroke):
    pts = [
        (cx, cy - r),
        (cx + r * 0.25, cy - r * 0.25),
        (cx + r, cy),
        (cx + r * 0.25, cy + r * 0.25),
        (cx, cy + r),
        (cx - r * 0.25, cy + r * 0.25),
        (cx - r, cy),
        (cx - r * 0.25, cy - r * 0.25),
    ]
    draw.polygon(pts, fill=fill, outline=outline, width=stroke)


def make(size, maskable=False):
    img = Image.new('RGBA', (size, size), CREAM)
    d = ImageDraw.Draw(img)
    pad = 0 if maskable else int(size * 0.08)
    border = max(2, size // 32)
    radius = int(size * 0.18) if not maskable else 0
    if not maskable:
        d.rounded_rectangle(
            [pad, pad, size - pad, size - pad],
            radius=radius,
            outline=INK,
            width=border,
            fill=CREAM,
        )
    cx = cy = size // 2
    r = int(size * (0.32 if maskable else 0.36))
    draw_sparkle(d, cx, cy, r, GOLD, INK, max(2, size // 64))
    return img


def main():
    out = os.path.join(os.path.dirname(__file__), '..', 'public', 'icons')
    os.makedirs(out, exist_ok=True)
    make(192).save(os.path.join(out, 'icon-192.png'), 'PNG')
    make(512).save(os.path.join(out, 'icon-512.png'), 'PNG')
    make(512, maskable=True).save(os.path.join(out, 'icon-512-maskable.png'), 'PNG')
    print('Wrote 3 icons to', out)


if __name__ == '__main__':
    main()
