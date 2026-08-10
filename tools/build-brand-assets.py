#!/usr/bin/env python3
"""現在進行中の災害・支援情報サイト用 OGP / ファビコンを生成する。"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent.parent
BACKGROUND = ROOT / "sources/design/ogp-background.png"
FONT_DIR = Path("/System/Library/Fonts")


def jp_font(weight: int, size: int):
    matches = sorted(FONT_DIR.glob(f"*角ゴシック W{weight}.ttc"))
    if not matches:
        matches = sorted(FONT_DIR.glob(f"*角ゴシック W{weight}.ttc"))
    if not matches:
        raise FileNotFoundError("ヒラギノ角ゴシックを検出できません")
    return ImageFont.truetype(str(matches[0]), size=size)


def draw_mark(draw, box, background="#0F172A"):
    x0, y0, x1, y1 = box
    width, height = x1 - x0, y1 - y0
    radius = int(min(width, height) * .24)
    draw.rounded_rectangle(box, radius=radius, fill=background)
    # 「一次情報→地域→支援」の接続を、3つの節点と線で表現。
    pts = [
        (x0 + width * .28, y0 + height * .60),
        (x0 + width * .49, y0 + height * .35),
        (x0 + width * .73, y0 + height * .55),
    ]
    draw.line(pts, fill="#7DD3FC", width=max(2, int(width * .07)), joint="curve")
    radii = [width * .10, width * .115, width * .13]
    fills = ["#E0F2FE", "#38BDF8", "#FAFAFA"]
    for (x, y), r, fill in zip(pts, radii, fills):
        draw.ellipse((x-r, y-r, x+r, y+r), fill=fill)


def draw_house_mark(draw, box):
    """団体ロゴの家と扉を、小サイズでも判別できる形で描く。"""
    x0, y0, x1, y1 = box
    width, height = x1 - x0, y1 - y0
    red = "#C92B20"
    cream = "#FFFAF5"
    radius = int(min(width, height) * .22)
    draw.rounded_rectangle(box, radius=radius, fill=cream)
    stroke = max(3, int(width * .095))
    roof = [
        (x0 + width * .14, y0 + height * .45),
        (x0 + width * .50, y0 + height * .20),
        (x0 + width * .86, y0 + height * .45),
    ]
    draw.line(roof, fill=red, width=stroke, joint="curve")
    draw.line((x0 + width * .22, y0 + height * .42, x0 + width * .22, y0 + height * .82), fill=red, width=stroke)
    draw.line((x0 + width * .78, y0 + height * .42, x0 + width * .78, y0 + height * .82), fill=red, width=stroke)
    door = (x0 + width * .39, y0 + height * .54, x0 + width * .63, y0 + height * .84)
    draw.rectangle(door, fill=red)
    draw.rectangle((x0 + width * .50, y0 + height * .62, x0 + width * .63, y0 + height * .84), fill=cream)
    knob = width * .018
    cx, cy = x0 + width * .56, y0 + height * .72
    draw.ellipse((cx-knob, cy-knob, cx+knob, cy+knob), fill=red)


def build_ogp():
    source = Image.open(BACKGROUND).convert("RGB")
    image = ImageOps.fit(source, (1200, 630), method=Image.Resampling.LANCZOS, centering=(.5, .5)).convert("RGBA")
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rounded_rectangle((40, 34, 735, 596), radius=34, fill=(250, 250, 250, 242), outline=(203, 213, 225, 180), width=2)
    image = Image.alpha_composite(image, overlay)
    draw = ImageDraw.Draw(image)

    draw_mark(draw, (76, 72, 132, 128))
    draw.text((151, 76), "よか隊ネット熊本", font=jp_font(4, 27), fill="#334155")
    draw.text((76, 163), "令和8年熊本地震", font=jp_font(6, 51), fill="#0F172A")
    draw.text((76, 242), "被災地のいまを知り、\n支援につなぐ", font=jp_font(6, 43), fill="#075985", spacing=15)
    draw.rounded_rectangle((76, 414, 425, 464), radius=25, fill="#E0F2FE")
    draw.text((101, 424), "災害・支援状況レポート", font=jp_font(5, 23), fill="#075985")
    draw.text((76, 504), "火の国会議 × 国・県・市町村の一次情報", font=jp_font(3, 20), fill="#64748B")
    output = image.convert("RGB")
    output.save(ROOT / "ogp.png", quality=95, optimize=True)
    # SNS側の旧OGPキャッシュを避けるため、HTML参照用は日付付きにする。
    output.save(ROOT / "ogp-20260808.png", quality=95, optimize=True)


def build_icons():
    master = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    draw = ImageDraw.Draw(master)
    draw_house_mark(draw, (0, 0, 512, 512))
    master.resize((180, 180), Image.Resampling.LANCZOS).save(ROOT / "apple-touch-icon.png", optimize=True)
    master.resize((32, 32), Image.Resampling.LANCZOS).save(ROOT / "favicon.png", optimize=True)


if __name__ == "__main__":
    build_ogp()
    build_icons()
    print("ogp.png / ogp-20260808.png / favicon.png / apple-touch-icon.png を更新しました")
