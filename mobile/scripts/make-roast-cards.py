#!/usr/bin/env python3
"""Draw the four roast cards attached to notifications.

Run from mobile/:  python3 scripts/make-roast-cards.py

The cards are checked in; this script exists so they can be regenerated when the
copy or the palette moves. Fonts come from the same @expo-google-fonts packages
the app renders with, so the cards cannot drift from the app's type.
"""

from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 600
INK = "#111111"
FONTS = "node_modules/@expo-google-fonts"
DISPLAY = f"{FONTS}/titan-one/400Regular/TitanOne_400Regular.ttf"
BODY = f"{FONTS}/nunito/900Black/Nunito_900Black.ttf"

# tone/lead -> background, headline colour, headline, subline
CARDS = {
    "heads-up": ("#8fd0ff", "#ffffff", "INCOMING", "bro. a leech is on the way."),
    "one-day": ("#ffe14d", "#111111", "TOMORROW", "one day. that's the whole warning."),
    "morning-of": ("#ff2f8e", "#ffffff", "IT'S TODAY", "the money leaves tonight."),
    "last-call": ("#111111", "#ffe14d", "MIDNIGHT", "cancel it or accept your fate."),
}


def centred(draw, y, text, font, fill, shadow=INK, offset=7):
    """Text centred on the card, with the hard offset shadow the app uses."""
    left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
    x = (W - (right - left)) // 2 - left
    draw.text((x + offset, y + offset), text, font=font, fill=shadow)
    draw.text((x, y), text, font=font, fill=fill)
    return bottom - top


def build(name, bg, fg, headline, subline):
    img = Image.new("RGB", (W, H), bg)
    d = ImageDraw.Draw(img)

    # The sticker border every surface in the app wears.
    border = "#ffffff" if bg == INK else INK
    d.rounded_rectangle([14, 14, W - 15, H - 15], radius=48, outline=border, width=12)

    display = ImageFont.truetype(DISPLAY, 168)
    body = ImageFont.truetype(BODY, 52)

    centred(d, 176, headline, display, fg)
    centred(d, 392, subline, body, border, shadow=bg, offset=0)

    out = f"assets/roast-cards/{name}.png"
    img.save(out, "PNG")
    print(f"{out}  {img.size[0]}x{img.size[1]}")


for name, spec in CARDS.items():
    build(name, *spec)
