#!/usr/bin/env python3
"""ページごとのOGP画像（1200x630）を作る。

    python3 tools/build-ogp-images.py

SNSやLINEに貼られたとき、どのページも同じ共通画像だと中身が伝わらない。
ページの色を使って1枚ずつ作る。絵は宇土市のページ（uto-waste / uto-bulletin）
と同じ描き方（viewBox 120x82・線は currentColor・同じ配色）で描くので、
画像を見てから開いても印象が食い違わない。

文字は画像として焼き込む（フォントを配布するわけではない）。
"""
import io
import os
import sys
from pathlib import Path

try:
    import fitz  # PyMuPDF：SVGをそのまま画像にする
    from PIL import Image, ImageDraw, ImageFont
except ImportError as error:  # pragma: no cover
    sys.exit(f"必要なライブラリがありません: {error}. pip install pymupdf pillow")

ROOT = Path(__file__).resolve().parent.parent
W, H = 1200, 630
PAPER = "#fbfaf6"
INK = "#123f38"
MUTED = "#46605a"

FONT_DIR = Path("/System/Library/Fonts")
BOLD = FONT_DIR / "ヒラギノ角ゴシック W6.ttc"
REGULAR = FONT_DIR / "ヒラギノ角ゴシック W3.ttc"

# 章の色はページと同じものを使う（uto-bulletin.css / uto-waste.css と揃える）
ART_STROKE = "#33443f"
TONES = {
    "blue": ("#1a5b93", "#e8f1f8"),
    "sky": ("#2d79a8", "#e9f3f9"),
    "teal": ("#0f8a72", "#e6f5f1"),
    "amber": ("#c9821b", "#fdf3e2"),
    "green": ("#4f8f2f", "#eef6e8"),
    "orange": ("#d8552f", "#fdeee9"),
    "pink": ("#c2557f", "#fbedf3"),
    "purple": ("#6a5aa8", "#f0eefa"),
}

# 絵は宇土市のページと同じ描き方に揃える（線は外側のgで引き、fillで色を付ける）
ART = {
    "bulletin": '<path fill="#93c5fd" stroke="#1d4ed8" d="M18 8h46l16 16v50H18Z"/><path d="M64 8v16h16"/>'
                '<path d="M30 36h32M30 48h32M30 60h20"/><circle fill="#fb923c" stroke="#c2410c" cx="90" cy="58" r="14"/>'
                '<path d="M84 58l5 5 8-9"/>',
    "channels": '<path fill="#2dd4bf" stroke="#0f766e" d="M14 18h64v42H40L24 74V60h-10Z"/>'
                '<path d="M28 32h36M28 45h24"/><path fill="#fde047" stroke="#a16207" d="M86 26h26v26H86z"/>'
                '<path d="m86 26 13 12 13-12"/><path d="M99 56v18M92 66h14"/>',
    "timeline": '<path stroke="#475569" d="M12 70h96"/><path fill="#93c5fd" stroke="#1d4ed8" d="M22 70V44h16v26z"/>'
                '<path fill="#2dd4bf" stroke="#0f766e" d="M46 70V28h16v42z"/>'
                '<path fill="#fb923c" stroke="#c2410c" d="M70 70V16h16v54z"/>'
                '<path fill="#fde047" stroke="#a16207" d="M94 70V36h14v34z"/>',
    "water": '<path fill="#cbd5e1" stroke="#475569" d="M32 18h22v10H32z"/><path d="M43 28v10"/>'
             '<path fill="#cbd5e1" stroke="#475569" d="M24 38h38v12H24z"/><path d="M43 50v8"/>'
             '<path fill="#93c5fd" stroke="#1d4ed8" d="M43 58c-4 5-6 8-6 11a6 6 0 0 0 12 0c0-3-2-6-6-11Z"/>'
             '<path fill="#2dd4bf" stroke="#0f766e" d="M78 38h26l-4 36H82Z"/><path d="M80 54h22"/>',
    "tracks": '<path stroke="#475569" d="M14 22h92M14 42h92M14 62h92"/>'
              '<circle fill="#2dd4bf" stroke="#0f766e" cx="30" cy="22" r="8"/>'
              '<circle fill="#fb923c" stroke="#c2410c" cx="60" cy="42" r="8"/>'
              '<circle fill="#fde047" stroke="#a16207" cx="86" cy="62" r="8"/>'
              '<circle fill="#93c5fd" stroke="#1d4ed8" cx="74" cy="22" r="8"/>'
              '<circle fill="#cbd5e1" stroke="#475569" cx="34" cy="62" r="8"/>',
    # 人は頭と胴をつなげる（離すと顔だけ浮いて見える）
    "volunteer": '<path stroke="#475569" d="M8 76h104"/>'
                 '<circle fill="#2dd4bf" stroke="#0f766e" cx="30" cy="22" r="12"/>'
                 '<path fill="#2dd4bf" stroke="#0f766e" d="M14 76V56c0-9 7-16 16-16s16 7 16 16v20z"/>'
                 '<circle fill="#fb923c" stroke="#c2410c" cx="90" cy="26" r="10"/>'
                 '<path fill="#fb923c" stroke="#c2410c" d="M76 76V58c0-8 6-14 14-14s14 6 14 14v18z"/>'
                 '<path fill="#fde047" stroke="#a16207" d="M50 58h20v18H50z"/><path d="M50 65h20M60 58v7"/>',
    # 会議資料＝紙と数字。棒は資料に並ぶ数字の推移を表す
    "hq": '<path fill="#cbd5e1" stroke="#475569" d="M16 10h60v62H16z"/><path d="M26 22h40M26 32h28"/>'
          '<path fill="#93c5fd" stroke="#1d4ed8" d="M28 66V46h10v20z"/>'
          '<path fill="#2dd4bf" stroke="#0f766e" d="M44 66V38h10v28z"/>'
          '<path fill="#fb923c" stroke="#c2410c" d="M60 66V52h10v14z"/>'
          '<path fill="#fde047" stroke="#a16207" d="M86 24h22v48H86z"/><path d="M92 36h10M92 48h10M92 60h6"/>',
    "housing": '<path fill="#cbd5e1" stroke="#475569" d="m18 42 34-26 34 26"/><path d="M26 40v34h52V40"/>'
               '<path fill="#93c5fd" stroke="#1d4ed8" d="M52 14 92 44l-9 7-31-24-31 24-9-7Z"/>'
               '<path fill="#fb923c" stroke="#c2410c" d="M44 74V56h16v18"/>'
               '<path fill="#2dd4bf" stroke="#0f766e" d="M100 30c-5 7-8 11-8 15a8 8 0 0 0 16 0c0-4-3-8-8-15Z"/>',
    "risai": '<path fill="#cbd5e1" stroke="#475569" d="m8 40 30-23 30 23"/><path d="M15 38v36h46V38"/>'
             '<path fill="#fb923c" stroke="#c2410c" d="M37 17 31 39l11 8-7 27"/>'
             '<path fill="#fde047" stroke="#a16207" d="M76 12h34v56H76z"/><path d="M84 25h18M84 36h18M84 47h10"/>'
             '<path fill="#2dd4bf" stroke="#0f766e" d="m84 57 5 5 12-13"/>',
}

PAGES = [
    dict(file="risai-certificate.html", out="ogp-risai-certificate.png", tone="teal", art="risai",
         label="令和8年熊本地震 / 熊本県全域",
         title="り災証明書を/いちから分かりやすく",
         lead="写真・調査・判定・支援金・再調査。被災後の流れを絵と大きな文字で説明します。"),
    dict(file="uto-bulletin.html", out="ogp-uto-bulletin.png", tone="blue", art="bulletin",
         label="宇土市の広報を読み解く",
         title="広報うと 災害臨時号vol.1/の読み方",
         lead="り災証明・災害ごみ・住まいの修理・支援金・減免を、期限が近い順に並べ直しました。"),
    dict(file="alert-channels.html", out="ogp-alert-channels.png", tone="teal", art="channels",
         label="令和8年熊本地震",
         title="お知らせの受け取り方",
         lead="公式LINE・メール配信・防災行政無線。市町村ごとの受け取り方を、公式ページで確認してまとめました。"),
    dict(file="official-timeline.html", out="ogp-official-timeline.png", tone="orange", art="timeline",
         label="21市町村の発信から読み解く",
         title="発信でたどる被災地の局面",
         lead="何が話題になっていたかの移り変わりを、市町村の公式発信から3つの局面で示します。"),
    dict(file="official-water-recovery.html", out="ogp-official-water.png", tone="sky", art="water",
         label="21市町村の発信から読み解く",
         title="水の復旧と、/統計に表れない水の問題",
         lead="断水戸数では0と数えられる濁り水・時間断水・井戸水を、発信と会議記録から補います。"),
    dict(file="official-response-tracks.html", out="ogp-official-tracks.png", tone="purple", art="tracks",
         label="21市町村の発信から読み解く",
         title="5つの対応の流れ",
         lead="断水・罹災証明・災害VC・災害ごみ・相談窓口。市町村ごとの動きを時間軸で並べます。"),
    dict(file="volunteer-centers.html", out="ogp-volunteer-centers.png", tone="green", art="volunteer",
         label="令和8年熊本地震",
         title="災害ボランティアセンター",
         lead="各地の設置場所と活動状況、運営する社会福祉協議会からの募集・活動の発信をまとめています。"),
    dict(file="uto-housing.html", out="ogp-uto-housing.png", tone="amber", art="housing",
         label="宇土市",
         title="住まいの相談・再建支援",
         lead="応急修理・みなし仮設・公費解体など、住まいの再建に関する宇土市の公式情報への入口です。"),
    dict(file="hq-kumamoto.html", out="ogp-hq-kumamoto.png", tone="pink", art="hq",
         label="熊本市",
         title="災害対策本部会議/のまとめ",
         lead="第1回から公開されている会議資料を並べ、避難者数・住家被害・り災証明の推移を追えるようにしました。"),
    dict(file="hq-yatsushiro.html", out="ogp-hq-yatsushiro.png", tone="green", art="hq",
         label="八代市",
         title="災害対策本部会議/のまとめ",
         lead="第2回から公開されている会議資料を並べ、避難者数と住家被害の内訳の動きを追えるようにしました。"),
]


def font(path: Path, size: int) -> "ImageFont.FreeTypeFont":
    return ImageFont.truetype(str(path), size, index=0)


def wrap(text: str, fnt, max_width: int) -> list[str]:
    """日本語は単語で切れないので幅を測って折る。「/」があればそこで折る。"""
    if "/" in text:
        return [part for part in text.split("/") if part]
    lines, current = [], ""
    for char in text:
        if fnt.getlength(current + char) > max_width and current:
            lines.append(current)
            current = char
        else:
            current += char
    if current:
        lines.append(current)
    return lines


def render_art(body: str, box_width: int) -> Image.Image:
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 82" width="120" height="82">'
           f'<g fill="none" stroke="{ART_STROKE}" stroke-width="2.4" stroke-linecap="round" '
           f'stroke-linejoin="round">{body}</g></svg>')
    document = fitz.open("svg", svg.encode("utf-8"))
    scale = box_width / 120
    pixmap = document[0].get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=True)
    return Image.open(io.BytesIO(pixmap.tobytes("png"))).convert("RGBA")


def build(page: dict) -> Path:
    tone, soft = TONES[page["tone"]]
    image = Image.new("RGB", (W, H), PAPER)
    draw = ImageDraw.Draw(image)

    # 章の色の帯（上下）。どのページの話かを色で示す
    draw.rectangle([0, 0, W, 16], fill=tone)
    draw.rectangle([0, H - 76, W, H], fill=tone)

    # 絵は右に。薄い地色の板に載せる
    art_box = (700, 150, 1130, 460)
    draw.rounded_rectangle(art_box, radius=26, fill=soft)
    art = render_art(ART[page["art"]], 340)
    image.paste(art, (art_box[0] + (430 - art.width) // 2,
                      art_box[1] + (312 - art.height) // 2), art)

    # 表題。2行に収まり、かつ絵の板に重ならない幅になるまで小さくする
    # （「/」で明示的に折る場合は幅の検査を通らないので、ここで必ず見る）
    text_width = 590
    for size in (66, 60, 54, 48, 44, 40, 36):
        title_font = font(BOLD, size)
        title_lines = wrap(page["title"], title_font, text_width)
        widest = max(title_font.getlength(line) for line in title_lines)
        if len(title_lines) <= 2 and widest <= text_width:
            break
    lead_font = font(REGULAR, 27)
    lead_lines = wrap(page["lead"], lead_font, 600)[:3]

    # ラベル・表題・説明をひとまとまりとして、上下の中央に置く
    title_step, lead_step = int(size * 1.34), 45
    block = 48 + 26 + len(title_lines) * title_step + 20 + len(lead_lines) * lead_step
    top = 16 + ((H - 76) - 16 - block) // 2

    label_font = font(BOLD, 26)
    label_w = int(label_font.getlength(page["label"])) + 36
    draw.rounded_rectangle([72, top, 72 + label_w, top + 48], radius=10, fill=tone)
    draw.text((72 + 18, top + 24), page["label"], font=label_font, fill="#ffffff", anchor="lm")

    y = top + 48 + 26
    for line in title_lines:
        draw.text((72, y), line, font=title_font, fill=INK)
        y += title_step
    y += 20
    for line in lead_lines:
        draw.text((72, y), line, font=lead_font, fill=MUTED)
        y += lead_step

    # 下の帯にサイト名
    site_font = font(BOLD, 27)
    draw.text((72, H - 38), "よか隊ネット熊本　災害・支援状況レポート", font=site_font,
              fill="#ffffff", anchor="lm")
    url_font = font(REGULAR, 23)
    draw.text((W - 72, H - 38), "www.yokatainet.jp", font=url_font, fill="#ffffff", anchor="rm")

    path = ROOT / page["out"]
    image.save(path, "PNG", optimize=True)
    return path


def main() -> None:
    for name, path in (("太字", BOLD), ("標準", REGULAR)):
        if not path.exists():
            sys.exit(f"{name}のフォントが見つかりません: {path}")
    for page in PAGES:
        if not (ROOT / page["file"]).exists():
            sys.exit(f"対象ページがありません: {page['file']}")
        path = build(page)
        size = os.path.getsize(path)
        print(f"{page['out']}  {W}x{H}  {size // 1024}KB  ← {page['file']}")
    print(f"OGP画像 {len(PAGES)}枚を生成しました")


if __name__ == "__main__":
    main()
