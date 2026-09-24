#!/usr/bin/env python3
"""ページごとのOGP画像（1200x630）を作る。

    python3 tools/build-ogp-images.py

SNSやLINEに貼られたとき、誰向けの情報か、何ができるかが一目でわかるように、
【対象】バッジ、自治体・分野タグ、3連キータグチップ、一次情報準拠ステータスを配置。
制作者目線の作業報告調を排除し、被災者・支援者目線の具体的価値を伝える
洗練されたホワイトカード調デザインで生成する。
"""
import io
import os
import sys
from pathlib import Path

try:
    import fitz  # PyMuPDF：SVGを高品質レンダリング
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
except ImportError as error:  # pragma: no cover
    sys.exit(f"必要なライブラリがありません: {error}. pip install pymupdf pillow")

ROOT = Path(__file__).resolve().parent.parent
W, H = 1200, 630

FONT_DIR = Path("/System/Library/Fonts")
BOLD = FONT_DIR / "ヒラギノ角ゴシック W6.ttc"
REGULAR = FONT_DIR / "ヒラギノ角ゴシック W3.ttc"

# 章のテーマ色（tone: 主色, soft: カード内プレート淡色, outer: 外側キャンバス背景色）
TONES = {
    "blue": ("#1d4ed8", "#eff6ff", "#f1f5f9"),
    "sky": ("#0284c7", "#f0f9ff", "#f0f7fa"),
    "teal": ("#0f766e", "#f0fdfa", "#f0f7f5"),
    "amber": ("#d97706", "#fffbeb", "#fdf8ec"),
    "green": ("#15803d", "#f0fdf4", "#f0f8f2"),
    "orange": ("#c2410c", "#fff7ed", "#fdf5ee"),
    "pink": ("#be185d", "#fdf2f8", "#fcf3f7"),
    "purple": ("#6d28d9", "#faf5ff", "#f6f3fc"),
    "uki": ("#0e7490", "#ecfeff", "#edf8fa"),
    "hikawa": ("#115e59", "#f0fdfa", "#edf7f5"),
}

ART_STROKE = "#1e293b"

# SVGベクターアイコン
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
    "volunteer": '<path stroke="#475569" d="M8 76h104"/>'
                 '<circle fill="#2dd4bf" stroke="#0f766e" cx="30" cy="22" r="12"/>'
                 '<path fill="#2dd4bf" stroke="#0f766e" d="M14 76V56c0-9 7-16 16-16s16 7 16 16v20z"/>'
                 '<circle fill="#fb923c" stroke="#c2410c" cx="90" cy="26" r="10"/>'
                 '<path fill="#fb923c" stroke="#c2410c" d="M76 76V58c0-8 6-14 14-14s14 6 14 14v18z"/>'
                 '<path fill="#fde047" stroke="#a16207" d="M50 58h20v18H50z"/><path d="M50 65h20M60 58v7"/>',
    "hq": '<path fill="#cbd5e1" stroke="#475569" d="M16 10h60v62H16z"/><path d="M26 22h40M26 32h28"/>'
          '<path fill="#93c5fd" stroke="#1d4ed8" d="M28 66V46h10v20z"/>'
          '<path fill="#2dd4bf" stroke="#0f766e" d="M44 66V38h10v28z"/>'
          '<path fill="#fb923c" stroke="#c2410c" d="M60 66V52h10v14z"/>'
          '<path fill="#fde047" stroke="#a16207" d="M86 24h22v48H86z"/><path d="M92 36h10M92 48h10M92 60h6"/>',
    "housing": '<path fill="#cbd5e1" stroke="#475569" d="m18 42 34-26 34 26"/><path d="M26 40v34h52V40"/>'
               '<path fill="#93c5fd" stroke="#1d4ed8" d="M52 14 92 44l-9 7-31-24-31 24-9-7Z"/>'
               '<path fill="#fb923c" stroke="#c2410c" d="M44 74V56h16v18"/>'
               '<path fill="#2dd4bf" stroke="#0f766e" d="M100 30c-5 7-8 11-8 15a8 8 0 0 0 16 0c0-4-3-8-8-15Z"/>',
    "repair": '<path fill="#fed7aa" stroke="#c2410c" d="m10 44 34-26 34 26v28H10Z"/>'
              '<path fill="#fde047" stroke="#a16207" d="M34 30h18v10H34z"/>'
              '<path fill="#93c5fd" stroke="#1d4ed8" d="M20 50h14v12H20zM54 50h14v12H54z"/>'
              '<path d="m46 44-4 6 4 4-4 6"/>'
              '<rect fill="#2dd4bf" stroke="#0f766e" x="84" y="20" width="26" height="46" rx="5"/>'
              '<path fill="#fff" stroke="#0f766e" d="m90 48 7-6 7 6v8H90Z"/>',
    "risai": '<path fill="#cbd5e1" stroke="#475569" d="m8 40 30-23 30 23"/><path d="M15 38v36h46V38"/>'
             '<path fill="#fb923c" stroke="#c2410c" d="M37 17 31 39l11 8-7 27"/>'
             '<path fill="#fde047" stroke="#a16207" d="M76 12h34v56H76z"/><path d="M84 25h18M84 36h18M84 47h10"/>'
             '<path fill="#2dd4bf" stroke="#0f766e" d="m84 57 5 5 12-13"/>',
    "hikawa": '<path fill="#cbd5e1" stroke="#475569" d="M12 28h40v44H12z"/><path d="M20 40h24M20 52h16"/>'
              '<path fill="#2dd4bf" stroke="#0f766e" d="m42 16 34-10 34 10v40H42z"/>'
              '<path d="M54 32v24h46V32"/><circle fill="#fb923c" stroke="#c2410c" cx="77" cy="44" r="9"/>'
              '<path d="m73 44 3 3 5-6"/>',
    "demolition": '<path fill="#cbd5e1" stroke="#475569" d="m14 44 32-22 32 22v26H14Z"/>'
                  '<path stroke="#c2410c" stroke-width="2" d="m36 32-8 16 12 8-8 14"/>'
                  '<path fill="#fb923c" stroke="#c2410c" d="M72 38h24v32H72z"/>'
                  '<path fill="#fde047" stroke="#a16207" d="m84 20 16 18H68Z"/>'
                  '<circle fill="#2dd4bf" stroke="#0f766e" cx="96" cy="62" r="10"/>',
    "uki": '<path fill="#cbd5e1" stroke="#475569" d="M14 16h42v52H14z"/>'
           '<path fill="#93c5fd" stroke="#1d4ed8" d="M22 26h26M22 36h26M22 46h16"/>'
           '<path fill="#2dd4bf" stroke="#0f766e" d="M64 24h44v44H64z"/>'
           '<path fill="#fde047" stroke="#a16207" d="M72 34h28M72 44h20M72 54h28"/>'
           '<circle fill="#fb923c" stroke="#c2410c" cx="96" cy="18" r="10"/><path d="M92 18l3 3 6-7"/>',
    "rebuild": '<path fill="#cbd5e1" stroke="#475569" d="m16 44 36-26 36 26v28H16Z"/>'
               '<path fill="#93c5fd" stroke="#1d4ed8" d="M42 72V50h20v22"/>'
               '<path fill="#2dd4bf" stroke="#0f766e" d="M94 62c-8 0-14-6-14-14 8 0 14 6 14 14Z"/>'
               '<path fill="#2dd4bf" stroke="#0f766e" d="M94 48c0-8 6-14 14-14 0 8-6 14-14 14Z"/>'
               '<path stroke="#0f766e" d="M94 62V34"/><path fill="#fb923c" stroke="#c2410c" d="m94 20 8 10h-16Z"/>',
    "housing_build": '<path fill="#cbd5e1" stroke="#475569" d="m12 48 24-18 24 18v24H12Z"/>'
                     '<path fill="#fb923c" stroke="#c2410c" d="M28 72V56h12v16"/>'
                     '<path fill="#93c5fd" stroke="#1d4ed8" d="m56 42 26-20 26 20v30H56Z"/>'
                     '<path fill="#2dd4bf" stroke="#0f766e" d="M76 72V52h14v20"/>'
                     '<path stroke="#a16207" d="M98 14h14v16M105 14v12"/>',
    "guide_book": '<path fill="#93c5fd" stroke="#1d4ed8" d="M16 20c16-6 32-4 44 4v44c-12-8-28-10-44-4Z"/>'
                  '<path fill="#cbd5e1" stroke="#475569" d="M104 20c-16-6-32-4-44 4v44c12-8 28-10 44-4Z"/>'
                  '<path d="M26 34h22M26 44h22M26 54h14M72 34h22M72 44h22M72 54h14"/>'
                  '<path fill="#fde047" stroke="#a16207" d="m88 12 16 16-6 6-16-16Z"/>',
    "dashboard": '<rect fill="#cbd5e1" stroke="#475569" x="14" y="14" width="92" height="58" rx="8"/>'
                 '<path fill="#2dd4bf" stroke="#0f766e" d="M14 26h92"/>'
                 '<circle fill="#fb923c" stroke="#c2410c" cx="24" cy="20" r="3"/>'
                 '<circle fill="#fde047" stroke="#a16207" cx="32" cy="20" r="3"/>'
                 '<path fill="#93c5fd" stroke="#1d4ed8" d="M24 60V42h16v18zM46 60V34h16v26z"/>'
                 '<path stroke="#c2410c" d="m68 54 10-14 12 6 10-16"/>',
    "compare": '<rect fill="#93c5fd" stroke="#1d4ed8" x="14" y="16" width="40" height="52" rx="6"/>'
               '<rect fill="#2dd4bf" stroke="#0f766e" x="66" y="16" width="40" height="52" rx="6"/>'
               '<path d="M24 28h20M24 38h20M24 48h12M76 28h20M76 38h20M76 48h12"/>'
               '<path stroke="#a16207" d="m50 42 20 0M64 36l6 6-6 6"/>',
    "shelter": '<path fill="#2dd4bf" stroke="#0f766e" d="m14 68 34-44 34 44z"/>'
               '<path fill="#fb923c" stroke="#c2410c" d="m48 24 14 44H34z"/>'
               '<path fill="#93c5fd" stroke="#1d4ed8" d="M92 20c-8 0-14 6-14 14 0 10 14 24 14 24s14-14 14-24c0-8-6-14-14-14Z"/>'
               '<circle fill="#ffffff" cx="92" cy="34" r="5"/>',
    "calendar_clock": '<rect fill="#cbd5e1" stroke="#475569" x="14" y="20" width="52" height="50" rx="6"/>'
                      '<path fill="#fb923c" stroke="#c2410c" d="M14 32h52"/>'
                      '<path d="M26 14v10M54 14v10M26 44h10M44 44h10M26 56h10"/>'
                      '<circle fill="#93c5fd" stroke="#1d4ed8" cx="86" cy="46" r="22"/>'
                      '<path stroke="#1d4ed8" d="M86 34v12l8 6"/>',
    "meeting": '<ellipse fill="#cbd5e1" stroke="#475569" cx="60" cy="46" rx="44" ry="20"/>'
               '<circle fill="#2dd4bf" stroke="#0f766e" cx="30" cy="24" r="8"/>'
               '<circle fill="#fb923c" stroke="#c2410c" cx="60" cy="18" r="8"/>'
               '<circle fill="#93c5fd" stroke="#1d4ed8" cx="90" cy="24" r="8"/>'
               '<rect fill="#ffffff" stroke="#475569" x="48" y="38" width="24" height="16" rx="2"/>'
               '<path d="M54 44h12M54 48h8"/>',
    "dictionary": '<rect fill="#93c5fd" stroke="#1d4ed8" x="20" y="16" width="56" height="54" rx="4"/>'
                  '<path d="M28 16v54M40 32h24M40 44h20M40 56h14"/>'
                  '<path fill="#fde047" stroke="#a16207" d="M72 32h34v26H88l-8 8v-8h-8z"/>'
                  '<path d="M84 42h14M84 48h8"/>',
    "docs": '<rect fill="#cbd5e1" stroke="#475569" x="14" y="14" width="46" height="56" rx="4"/>'
            '<path d="M24 28h26M24 40h26M24 52h16"/>'
            '<rect fill="#2dd4bf" stroke="#0f766e" x="66" y="24" width="40" height="28" rx="6"/>'
            '<circle fill="#ffffff" cx="86" cy="38" r="7"/>'
            '<circle fill="#fb923c" stroke="#c2410c" cx="92" cy="62" r="10"/>',
    "money": '<rect fill="#2dd4bf" stroke="#0f766e" x="14" y="22" width="60" height="34" rx="4"/>'
             '<circle fill="#ffffff" stroke="#0f766e" cx="44" cy="39" r="8"/>'
             '<circle fill="#fde047" stroke="#a16207" cx="86" cy="32" r="14"/>'
             '<circle fill="#fb923c" stroke="#c2410c" cx="80" cy="54" r="14"/>'
             '<path d="M44 35v8M86 28v8M80 50v8"/>',
    "health": '<path fill="#fb923c" stroke="#c2410c" d="M60 28c-10-14-30-4-30 12 0 16 30 30 30 30s30-14 30-30c0-16-20-26-30-12Z"/>'
              '<path fill="#ffffff" d="M56 38h8v18h-8zM51 43h18v8h-18z"/>',
    "family": '<circle fill="#2dd4bf" stroke="#0f766e" cx="36" cy="26" r="12"/>'
              '<path fill="#2dd4bf" stroke="#0f766e" d="M18 72V52c0-8 8-14 18-14s18 6 18 14v20z"/>'
              '<circle fill="#fb923c" stroke="#c2410c" cx="78" cy="34" r="10"/>'
              '<path fill="#fb923c" stroke="#c2410c" d="M64 72V56c0-7 6-12 14-12s14 5 14 12v16z"/>'
              '<rect fill="#fde047" stroke="#a16207" x="90" y="52" width="14" height="16" rx="3"/>',
    "work": '<rect fill="#93c5fd" stroke="#1d4ed8" x="18" y="24" width="34" height="48" rx="2"/>'
            '<path d="M26 34h6M38 34h6M26 44h6M38 44h6M26 54h6M38 54h6M30 72v-8h10v8"/>'
            '<path fill="#cbd5e1" stroke="#475569" d="M60 38h46v34H60z"/>'
            '<path fill="#fb923c" stroke="#c2410c" d="m82 14 12 12-6 6-12-12 3-5-2-2 5-3Z"/>',
    "agri": '<path fill="#fde047" stroke="#a16207" d="M24 64C24 40 44 24 60 20c-4 16-2 36-18 44"/>'
            '<path stroke="#a16207" d="M24 64c12-12 24-22 36-44"/>'
            '<path fill="#93c5fd" stroke="#1d4ed8" d="M60 52c16-8 32-4 44 0-6 8-6 12 0 16-12 4-28 8-44 0 4-6 4-10 0-16Z"/>'
            '<path stroke="#475569" d="M14 72c16-4 32 4 48 0s32 4 48 0"/>',
    "search": '<rect fill="#cbd5e1" stroke="#475569" x="18" y="16" width="50" height="54" rx="4"/>'
              '<path d="M28 28h24M28 38h30M28 48h20"/>'
              '<circle fill="#2dd4bf" stroke="#0f766e" cx="76" cy="46" r="18"/>'
              '<path stroke="#0f766e" stroke-width="4" d="m89 59 18 16"/>',
    "nav": '<circle fill="#93c5fd" stroke="#1d4ed8" cx="60" cy="42" r="28"/>'
           '<path fill="#fb923c" stroke="#c2410c" d="m60 22 8 20-8-4-8 4Z"/>'
           '<path fill="#cbd5e1" stroke="#475569" d="m60 62 8-20-8 4-8-4Z"/>',
    "portal": '<circle fill="#fde047" stroke="#a16207" cx="60" cy="42" r="30"/>'
              '<path fill="#2dd4bf" stroke="#0f766e" d="m32 50 28-22 28 22v22H32Z"/>'
              '<path fill="#ffffff" stroke="#0f766e" d="M52 72V56h16v16"/>',
    "affected": '<path fill="#93c5fd" stroke="#1d4ed8" d="m20 46 26-20 26 20v24H20Z"/>'
                '<path fill="#fb923c" stroke="#c2410c" d="M38 70V54h14v16"/>'
                '<path fill="#2dd4bf" stroke="#0f766e" d="M70 48c0-8 8-14 18-14s18 6 18 14v22H70Z"/>'
                '<circle fill="#2dd4bf" stroke="#0f766e" cx="88" cy="24" r="10"/>',
    "supporters": '<circle fill="#2dd4bf" stroke="#0f766e" cx="38" cy="24" r="10"/>'
                  '<path fill="#2dd4bf" stroke="#0f766e" d="M22 68V52c0-8 8-14 16-14s16 6 16 14v16z"/>'
                  '<circle fill="#93c5fd" stroke="#1d4ed8" cx="82" cy="24" r="10"/>'
                  '<path fill="#93c5fd" stroke="#1d4ed8" d="M66 68V52c0-8 8-14 16-14s16 6 16 14v16z"/>'
                  '<path fill="#fb923c" stroke="#c2410c" d="M60 48c-4-6-12-2-12 4 0 6 12 12 12 12s12-6 12-12c0-6-8-10-12-4Z"/>',
    "official": '<path fill="#cbd5e1" stroke="#475569" d="M16 38h88v34H16z"/>'
                '<path fill="#93c5fd" stroke="#1d4ed8" d="m10 38 50-24 50 24z"/>'
                '<circle fill="#fb923c" stroke="#c2410c" cx="60" cy="26" r="6"/>'
                '<path d="M32 48v24M48 48v24M72 48v24M88 48v24"/>',
    "support_fields": '<rect fill="#2dd4bf" stroke="#0f766e" x="18" y="16" width="38" height="24" rx="6"/>'
                      '<rect fill="#fb923c" stroke="#c2410c" x="64" y="16" width="38" height="24" rx="6"/>'
                      '<rect fill="#93c5fd" stroke="#1d4ed8" x="18" y="46" width="38" height="24" rx="6"/>'
                      '<rect fill="#fde047" stroke="#a16207" x="64" y="46" width="38" height="24" rx="6"/>'
                      '<path d="M28 28h18M74 28h18M28 58h18M74 58h18"/>',
}

# 全59ページの定義（uto-waste.htmlは手動制作専用画像のため除外）
PAGES = [
    dict(file="uto-public-services.html", out="ogp-uto-public-services.png", tone="sky", art="support_fields",
         label="宇土市", tag="公的施設・市民サービス",
         target="宇土市民・被災者・子育て世帯・シニア・転入者",
         title="公的施設・市民サービス/マップ＆総合ガイド",
         lead="市役所・支所・保健・子育て・福祉・公民館・体育館など全27施設。開館時間や利用可能な行政・生活支援サービスを地図から探せます。",
         chips=["全27施設マップ", "開館・休館リアルタイム", "窓口・電話番号一覧"]),
    dict(file="uto-support.html", out="ogp-uto-support.png", tone="teal", art="support_fields",
         label="宇土市", tag="暮らしの支援・補助金",
         target="宇土市民・被災者・子育て世帯・シニア・事業者",
         title="暮らしの支援・補助金/総合ガイド",
         lead="住まい（リフォーム・耐震補助）・子育て・健康・福祉・事業者支援まで全53制度。対象条件と申請手順を網羅した総合ガイド。",
         chips=["全53制度を網羅", "住まい・子育て・福祉", "要件・申請窓口"]),
    dict(file="uki-living-support.html", out="ogp-uki-living-support.png", tone="uki", art="support_fields",
         label="宇城市", tag="暮らしの支援・補助金",
         target="宇城市民・被災者・子育て世帯・シニア・事業者",
         title="暮らしの支援・補助金/総合ガイド",
         lead="高校生までの医療費完全無償化、木造住宅耐震化（最大100万円）、創業・移住から地震特別支援まで条件別に即座に探せます。",
         chips=["医療費完全無償化", "住宅耐震・空き家補助", "被災者生活支援"]),
    dict(file="hikawa-living-support.html", out="ogp-hikawa-living-support.png", tone="hikawa", art="support_fields",
         label="氷川町", tag="暮らしの支援・補助金",
         target="氷川町民・被災者・子育て世帯・シニア・農家",
         title="暮らしの支援・補助金/総合ガイド",
         lead="町内産畳表張替助成、出産祝金、高校生までのこども医療費、移住体験住宅から公費解体まで、町の独自助成を網羅。",
         chips=["畳表張替・住宅助成", "子育て・医療費助成", "公費解体・農家支援"]),
    dict(file="kumamoto-living-support.html", out="ogp-kumamoto-living-support.png", tone="amber", art="support_fields",
         label="熊本市", tag="暮らしの支援・補助金",
         target="熊本市民・被災者・子育て世帯・シニア・事業者",
         title="暮らしの支援・補助金/総合ガイド",
         lead="高校生までのこども医療費助成、木造住宅耐震・空き家対策、高齢者福祉、地域活動助成から地震特別支援まで条件検索。",
         chips=["こども医療費助成", "耐震・空き家補助", "高齢者福祉・手当"]),
    dict(file="yatsushiro-living-support.html", out="ogp-yatsushiro-living-support.png", tone="blue", art="support_fields",
         label="八代市", tag="暮らしの支援・補助金",
         target="八代市民・被災者・子育て世帯・シニア・事業者",
         title="暮らしの支援・補助金/総合ガイド",
         lead="0〜5歳児保育料の完全無償化、高校生等医療費全額助成、八代産材活用住宅助成、創業支援から全54制度の被災者応援まで掲載。",
         chips=["保育料完全無償化", "医療費全額助成", "被災者応援全54制度"]),
    dict(file="uki-consultation.html", out="ogp-uki-consultation.png", tone="uki", art="meeting",
         label="宇城市", tag="無料相談会",
         target="法律・ローン・相続・解体・手続きで悩む被災者",
         title="被災者支援のための/専門家無料相談会ガイド",
         lead="弁護士・司法書士・行政書士に予約不要・無料で相談可能。市役所新館・小川ラポートの日程・受付時間・相談内容を案内。",
         chips=["予約不要・相談無料", "弁護士・司法書士", "市役所新館・小川"]),
    dict(file="yatsushiro-safetynet4.html", out="ogp-yatsushiro-safetynet4.png", tone="blue", art="work",
         label="八代市", tag="資金繰り支援",
         target="売上減少に直面する被災事業者・個人事業主",
         title="セーフティネット保証4号/資金繰り支援ガイド",
         lead="一般枠とは別枠で最大8,000万円・100%信用保証。売上20%減要件の3パターン自己判定、認定申請手順、必要書類を完全解説。",
         chips=["別枠無担保8,000万", "100%信用保証", "売上20%減判定"]),
    dict(file="priority-support-summary.html", out="ogp-priority-support.png", tone="teal", art="support_fields",
         label="5市町横断比較", tag="制度横断比較",
         target="被災された住民・ご家族・支援者・相談窓口",
         title="被災者支援制度の横断比較/熊本・宇土・宇城・氷川・八代",
         lead="住まい再建・生活資金・減免猶予・生活福祉の主要20制度を横並び比較。自治体ごとの金額差・独自上乗せ・受付状況が一目瞭然。",
         chips=["主要20制度横断", "独自上乗せ・金額差", "自治体公式リンク完備"]),
    dict(file="yatsushiro-loan.html", out="ogp-yatsushiro-loan.png", tone="blue", art="money",
         label="八代市", tag="生活再建資金",
         target="当面の生活費や住宅再建資金を必要とする世帯",
         title="災害援護資金 特別貸付/最大350万円の利用ガイド",
         lead="世帯主の負傷や住家・家財損害に最大350万円を貸付。据置期間最長5年・保証人で無利子。申請要件と受給額シミュレーション。",
         chips=["最大350万円貸付", "保証人で無利子", "据置最長5年"]),
    dict(file="uto-jizokuka.html", out="ogp-uto-jizokuka.png", tone="teal", art="work",
         label="宇土市", tag="事業者支援",
         target="被災した小規模事業者・個人事業主",
         title="小規模事業者持続化補助金/＜災害支援枠＞利用案内",
         lead="直接被害最大200万円（補助率定額10/10あり）、間接被害最大100万円。店舗・設備の復旧費用を支援。商工会申請手順と要件解説。",
         chips=["直接被害最大200万", "補助率10/10あり", "商工会・申請手順"]),
    dict(file="kumamoto-saishuppatsu.html", out="ogp-kumamoto-saishuppatsu.png", tone="teal", art="work",
         label="熊本県", tag="事業者再建補助金",
         target="被災した県内の中小企業・小規模事業者・中堅企業",
         title="くまもと事業者再出発支援補助金/最大3億〜15億円 総合ガイド",
         lead="施設・設備・車両の復旧を支援。補助率3/4・上限3億円（多重被災は5億円まで定額10/10・最大15億円）。事前着手特例・説明会日程・申請手順。",
         chips=["最大3億〜15億円", "補助率3/4〜定額", "事前着手特例・説明会"]),
    dict(file="yatsushiro-rebuild.html", out="ogp-yatsushiro-rebuild.png", tone="blue", art="rebuild",
         label="八代市", tag="生活再建支援金",
         target="全壊・大規模半壊・中規模半壊等の被災世帯",
         title="被災者生活再建支援金/最大300万円の申請ガイド",
         lead="全壊・大規模半壊・中規模半壊世帯へ最大300万円を支給。基礎支援金と加算支援金の仕組み、半壊解体の申請書類と注意点を整理。",
         chips=["最大300万円支給", "基礎＋加算支援金", "必要書類・申請窓口"]),
    dict(file="yatsushiro-support.html", out="ogp-yatsushiro-support.png", tone="blue", art="support_fields",
         label="八代市", tag="被災者応援",
         target="八代市で被災されたすべての住民・ご家族",
         title="八代市 被災者応援ガイド/全54制度の要件・窓口一覧",
         lead="住家被害判定から利用できる支援を即座に判定。見舞金・仮設住宅・応急修理・税減免など全54制度の支給額・期限・窓口を網羅。",
         chips=["全54制度を網羅", "被害判定から逆引き", "申請期限・窓口一覧"]),
    dict(file="index.html", out="ogp-home.png", tone="teal", art="portal",
         label="よか隊ネット熊本", tag="総合ポータル",
         target="熊本県内の被災者・支援関係者・自治体関係者",
         title="令和8年熊本地震 支援情報ポータル/被災者と支援者をつなぐ総合拠点",
         lead="被災地の一次情報、自治体公式発表、生活再建制度、避難所・仮設住宅、災害ボランティアの最新動向をわかりやすく発信。",
         chips=["最新公式トピックス", "生活再建制度ナビ", "現地支援・活動記録"]),
    dict(file="404.html", out="ogp-404.png", tone="sky", art="search",
         label="よか隊ネット熊本", tag="ページ案内",
         target="サイトをご利用のすべての皆さま",
         title="お探しのページが見つかりません/サイト内検索・総合案内",
         lead="ページが移動または変更された可能性があります。トップページや検索機能から、必要な生活再建情報をお探しいただけます。",
         chips=["トップページへ", "サイト内横断検索", "重要支援制度一覧"]),
    dict(file="about.html", out="ogp-about.png", tone="teal", art="supporters",
         label="団体について", tag="よか隊ネット熊本",
         target="団体の理念・活動を知りたい方・連携パートナー",
         title="よか隊ネット熊本とは/団体の活動と被災地支援",
         lead="熊本地震をはじめとする災害支援の知見を活かし、被災された方々と支援団体・行政をつなぎ、地域社会の確かな復興を支えます。",
         chips=["設立趣旨・活動理念", "被災地連携ネットワーク", "運営方針・情報開示"]),
    dict(file="join.html", out="ogp-join.png", tone="green", art="volunteer",
         label="支援・協力", tag="よか隊ネット熊本",
         target="寄付・ボランティア・物資支援に関心のある方",
         title="被災地を支援・協力する/寄付・ボランティアのご案内",
         lead="被災者支援の現場活動への寄付金、ボランティア参加、専門職連携など、よか隊ネット熊本の支援ネットワークへの参加方法を案内。",
         chips=["支援金・寄付の受付", "ボランティア参加", "企業・団体連携"]),
    dict(file="contact.html", out="ogp-contact.png", tone="blue", art="channels",
         label="お問い合わせ", tag="連絡窓口",
         target="支援相談・取材・連携協働をご希望の皆さま",
         title="お問い合わせ・支援相談/連絡窓口のご案内",
         lead="被災者支援に関するご相談、報道・取材のお申込み、自治体・支援団体との連携に関するお問い合わせ窓口をご案内します。",
         chips=["支援連携のご相談", "取材・報道のお問合せ", "緊急連絡に関する注意"]),
    dict(file="privacy.html", out="ogp-privacy.png", tone="purple", art="docs",
         label="運営方針", tag="プライバシー",
         target="サイトをご利用のすべての皆さま",
         title="プライバシーポリシー/個人情報保護方針",
         lead="当サイトにおける個人情報の収集・利用目的、適切な安全管理措置、アクセス解析ツールの取り扱いについて定めています。",
         chips=["個人情報の適正管理", "利用目的の明示", "外部サービス方針"]),
    dict(file="accessibility.html", out="ogp-accessibility.png", tone="sky", art="guide_book",
         label="運営方針", tag="アクセシビリティ",
         target="高齢者・視覚障害をお持ちの方・支援が必要な方",
         title="ウェブアクセシビリティ方針/誰にでも伝わる情報発信",
         lead="災害緊急時でも誰もが必要な支援情報に確実にたどり着けるよう、読みやすさ・文字コントラスト・操作性の確保に努めています。",
         chips=["JIS規格準拠への取組", "誰でも読みやすい設計", "継続的な改善"]),
    dict(file="kumamoto-support.html", out="ogp-kumamoto-support.png", tone="uki", art="support_fields",
         label="熊本市", tag="被災者支援",
         target="熊本市内で被災された住民・ご家族",
         title="熊本市 被災者支援制度ガイド/全95制度の条件・窓口一覧",
         lead="住家被害判定や世帯状況から利用できる制度を判定。見舞金・住宅応急修理・税減免など全95支援項目の支給額・期限・窓口を網羅。",
         chips=["全95支援項目網羅", "被害判定から逆引き", "支給額・申請窓口"]),
    dict(file="municipality-updates.html", out="ogp-municipality-updates.png", tone="orange", art="timeline",
         label="21市町村", tag="公式発表",
         target="自治体の一次情報を確認したい被災者・支援者",
         title="21市町村 公式発表まとめ/自治体別の支援・復旧動向",
         lead="被災市町村が公表した公式発表を自動収集。自治体別・支援分野別（住まい・給水・ごみ等）に最新の一次情報を即座に確認可能。",
         chips=["21市町村一次情報", "自動収集・随時更新", "分野別絞り込み"]),
    dict(file="risai-certificate.html", out="ogp-risai-certificate.png", tone="teal", art="risai",
         label="熊本県全域", tag="証明書手続き",
         target="住まいに被害を受けたすべての被災世帯",
         title="り災証明書 申請・判定ガイド/写真撮影から支援金まで",
         lead="片付け前の被害写真の撮り方、現地調査の手順、一部損壊〜全壊の判定区分、各種支援金との連動、再調査の申請手順を詳しく解説。",
         chips=["写真撮影のポイント", "判定基準と支援金", "再調査の申請手順"]),
    dict(file="uto-bulletin.html", out="ogp-uto-bulletin.png", tone="blue", art="bulletin",
         label="宇土市", tag="広報臨時号",
         target="宇土市で被災されたすべての住民・ご家族",
         title="被災者支援・手続き早見表/広報うと臨時号 制度まとめ",
         lead="り災証明書・災害ごみ・住宅応急修理・生活再建支援金・税や保険料減免。申請期限が迫る重要制度と相談窓口を網羅。",
         chips=["申請期限早見表", "り災証明・ごみ搬入", "窓口・電話案内"]),
    dict(file="alert-channels.html", out="ogp-alert-channels.png", tone="teal", art="channels",
         label="21市町村", tag="情報受信",
         target="自治体からの緊急情報・生活支援情報を受け取りたい方",
         title="自治体緊急情報の受信ガイド/公式LINE・防災メール・無線",
         lead="21市町村の公式LINE、防災メール配信サービス、防災行政無線の登録・受信方法を網羅。避難情報や給水通知を確実に受信。",
         chips=["公式LINE登録手順", "防災メール配信", "行政無線の確認法"]),
    dict(file="official-timeline.html", out="ogp-official-timeline.png", tone="orange", art="timeline",
         label="21市町村動向", tag="復旧局面",
         target="復旧の経過・自治体対応の推移を把握したい支援者・住民",
         title="復旧局面と被災地の推移/21市町村の公式対応動向",
         lead="発災直後の人命救助・避難所開設からインフラ応急復旧、生活再建期へ。被災各市町村の発信データから復旧局面の推移を俯瞰。",
         chips=["初動から再建へ", "21市町村の推移", "注力課題の変遷"]),
    dict(file="official-water-recovery.html", out="ogp-official-water.png", tone="sky", art="water",
         label="水道・井戸水", tag="給水・水課題",
         target="断水・濁り水・水圧低下・井戸水問題に直面する住民・支援者",
         title="熊本県内の水道・井戸水復旧状況/濁り水・個別水課題の記録",
         lead="各市町村の通水完了状況や給水所情報に加え、濁り水・個別管損壊・井戸水枯渇など現場で継続する水課題と支援活動を掲載。",
         chips=["通水・給水所情報", "濁り水・水圧低下", "井戸水検査・支援"]),
    dict(file="official-response-tracks.html", out="ogp-official-tracks.png", tone="purple", art="tracks",
         label="21市町村動向", tag="対応推移",
         target="自治体の初動対応・復旧タイムラインを検証したい支援者",
         title="主要5分野の復旧タイムライン/断水・り災・VC・ごみ・相談",
         lead="断水解消・罹災証明発行・災害ボランティアセンター・災害ごみ処理・相談窓口。主要5分野の市町村別対応の動きを時系列で整理。",
         chips=["主要5分野の推移", "市町村別の初動", "生活基盤の復旧"]),
    dict(file="volunteer-centers.html", out="ogp-volunteer-centers.png", tone="green", art="volunteer",
         label="熊本県全域", tag="ボランティア",
         target="ボランティア参加希望者・被災地の支援要請をしたい方",
         title="災害ボランティアセンター/各地の募集状況・受付窓口",
         lead="県内各地の災害VCの開設場所、受付時間、募集対象（県内・市町村内・全国）、持ち物や注意事項、支援要請の依頼手順を案内。",
         chips=["開設場所・募集対象", "事前登録・受付手順", "お手伝いの依頼窓口"]),
    dict(file="uto-housing.html", out="ogp-uto-housing.png", tone="amber", art="housing",
         label="宇土市", tag="住まい再建",
         target="住宅に被害を受け住まいの確保に悩む被災世帯",
         title="住まいの相談・再建ガイド/応急修理・仮設・公費解体",
         lead="自宅の応急修理制度、みなし仮設（賃貸借上げ）、建設型仮設住宅、被災家屋の公費解体まで、住まい確保の選択肢と窓口をご案内。",
         chips=["応急修理・仮設住宅", "みなし仮設住宅", "公費解体の手続き"]),
    dict(file="uto-repair.html", out="ogp-uto-repair.png", tone="teal", art="repair",
         label="宇土市", tag="住宅修理",
         target="準半壊・半壊等で自宅の修理を行いたい被災世帯",
         title="住宅の応急修理制度ガイド/最大75.7万円の公的支援",
         lead="屋根・外壁・台所・トイレなど日常生活に不可欠な部位の修理を市が支援（最大75.7万円）。施工前の写真撮影法や申請手順を解説。",
         chips=["最大75.7万円補助", "対象工事の範囲", "申請手順・写真ルール"]),
    dict(file="hq-kumamoto.html", out="ogp-hq-kumamoto.png", tone="pink", art="hq",
         label="熊本市", tag="対策本部会議",
         target="熊本市の公式決定・被害推移・支援計画を追う支援者",
         title="熊本市 災害対策本部会議/決定事項・被害状況アーカイブ",
         lead="公開された全対策本部会議資料を収録。避難者数、住家被害認定、り災証明発行、インフラ復旧、公的支援決定の推移を追跡。",
         chips=["会議資料アーカイブ", "住家被害・避難推移", "本部決定事項一覧"]),
    dict(file="hq-yatsushiro.html", out="ogp-hq-yatsushiro.png", tone="green", art="hq",
         label="八代市", tag="対策本部会議",
         target="八代市の公式決定・被害推移・復旧対策を追う支援者",
         title="八代市 災害対策本部会議/決定事項・被害状況アーカイブ",
         lead="八代市災害対策本部の公式会議資料を網羅。避難所の状況、住家被害の調査進捗、仮設住宅建設、生活支援策の決定経過を記録。",
         chips=["全本部会議資料", "住家被害・避難動向", "支援施策の決定"]),
    dict(file="hikawa-support.html", out="ogp-hikawa-support.png", tone="hikawa", art="hikawa",
         label="氷川町", tag="被災者支援",
         target="氷川町内で被災されたすべての住民・ご家族",
         title="氷川町 被災者支援制度一覧/証明・住まい・給付の手引き",
         lead="り災証明書・生活再建支援金・住宅応急修理・被災家屋解体・町独自の見舞金など、氷川町公式の支援制度と申請窓口を目的別案内。",
         chips=["町公式支援一覧", "生活再建・住まい", "申請窓口・電話案内"]),
    dict(file="hikawa-demolition.html", out="ogp-hikawa-demolition.png", tone="hikawa", art="demolition",
         label="氷川町", tag="家屋解体",
         target="半壊以上で家屋解体を検討中の世帯・建物所有者",
         title="被災家屋の公費解体ガイド/全額公費・自費解体償還",
         lead="半壊以上の家屋が対象。解体費用を町が負担する公費解体と、自費で解体した費用の償還制度。必要書類全10様式の記載例と予約手順。",
         chips=["全壊〜半壊対象", "解体費用全額公費", "全10様式・記入例"]),
    dict(file="uki-support.html", out="ogp-uki-support.png", tone="uki", art="uki",
         label="宇城市", tag="被災者支援",
         target="宇城市内で被災されたすべての住民・ご家族",
         title="宇城市 被災者支援制度ガイド/全36支援の条件・窓口一覧",
         lead="全壊・大規模半壊・中規模半壊・半壊・一部損壊の判定別、困りごと別に全36支援を整理。支援金額、申請期限、提出書類を網羅。",
         chips=["全36支援を網羅", "判定区分別インデックス", "必要書類・申請窓口"]),
    dict(file="reconstruction.html", out="ogp-reconstruction.png", tone="teal", art="rebuild",
         label="生活再建", tag="総合ナビ",
         target="被災後の生活再建を進めるすべての被災世帯",
         title="暮らしの再建・支援制度ナビ/住まい・お金・生活の一括判定",
         lead="住まい確保・生活資金給付・税保険料減免・健康医療・就労事業再開。直面する困りごとに応じて利用できる公的支援制度を即座に判定。",
         chips=["住まい・生活資金", "税・保険料の減免", "困りごと逆引き判定"]),
    dict(file="temporary-housing.html", out="ogp-temporary-housing.png", tone="sky", art="housing_build",
         label="熊本県全域", tag="仮設住宅",
         target="仮設住宅・みなし仮設への入居を希望・検討する被災者",
         title="仮設住宅の整備・募集状況/建設型仮設・民間借上げ賃貸",
         lead="宇土市・宇城市・美里町・甲佐町・氷川町等の建設型応急住宅の戸数・完成入居予定と、民間賃貸借上げ（みなし仮設）の入居要件を案内。",
         chips=["建設型仮設の進捗", "みなし仮設の要件", "入居申込の手続き"]),
    dict(file="guide.html", out="ogp-guide.png", tone="blue", art="guide_book",
         label="制度解説", tag="生活再建",
         target="公的支援の仕組みや手続きの基本を知りたい被災者",
         title="被災者支援・生活再建ガイド/制度の仕組みと申請のツボ",
         lead="罹災証明・生活再建支援金・住宅応急修理・義援金・減免猶予。複雑な公的支援の基本ルール、受給額の上限、知っておくべき注意点を解説。",
         chips=["公的支援の全体像", "もらえるお金・支援", "知っておくべき注意点"]),
    dict(file="municipalities.html", out="ogp-municipalities.png", tone="green", art="dashboard",
         label="21市町村", tag="ダッシュボード",
         target="自治体別の被害状況や支援体制を調べたい方・支援者",
         title="自治体別 被害・支援ダッシュボード/21市町村の現況",
         lead="市町村ごとの公式発表タイムライン、住家被害・避難者数、支援制度の実施状況、復旧進捗をワンストップで比較・確認できます。",
         chips=["21市町村の現況", "住家被害・避難者数", "自治体別公式リンク"]),
    dict(file="municipality-support-compare.html", out="ogp-support-compare.png", tone="purple", art="compare",
         label="21市町村", tag="制度横断比較",
         target="自治体ごとの支援の手厚さや受付状況を把握したい方",
         title="被災者支援制度 自治体間比較/主要制度の実施状況一覧",
         lead="住宅応急修理・生活再建支援金・仮設住宅・災害ごみ受入・見舞金。21市町村の受付開始状況、独自上乗せ、窓口体制を横並び比較。",
         chips=["主要制度の横並び", "自治体独自の上乗せ", "受付状況・窓口一覧"]),
    dict(file="hq-uto.html", out="ogp-hq-uto.png", tone="amber", art="hq",
         label="宇土市", tag="対策本部会議",
         target="宇土市の公式決定・被害推移・復旧計画を追う支援者",
         title="宇土市 災害対策本部会議/決定事項・被害状況アーカイブ",
         lead="公開された全対策本部会議資料を収録。避難者数、住家被害認定、給水活動、り災証明受付、公費解体などの推移と決定事項を網羅。",
         chips=["全本部会議資料", "住家被害・避難動向", "本部決定事項一覧"]),
    dict(file="shelters.html", out="ogp-shelters.png", tone="orange", art="shelter",
         label="避難所情報", tag="マップ・一覧",
         target="避難所を利用中の方・受入状況や設備を確認したい方",
         title="開設中の避難所マップ＆一覧/受入状況・設備情報",
         lead="市町村別の指定緊急避難場所・指定避難所の開設状況、避難者数、所在地、バリアフリー・冷暖房設備などの現況を地図と一覧で案内。",
         chips=["避難所マップ", "開設・受入状況", "所在地・設備一覧"]),
    dict(file="timeline.html", out="ogp-timeline.png", tone="blue", art="calendar_clock",
         label="日々の記録", tag="時系列アーカイブ",
         target="発災からの経過・復旧の歩みを検証・確認したい方",
         title="令和8年熊本地震 日々の記録/発災からの復旧アーカイブ",
         lead="地震発生初日から現在までの揺れ、避難状況、ライフライン復旧、公的支援の開始、地域の動きを日系列で詳細にたどる記録。",
         chips=["発災からの推移", "インフラ復旧記録", "公的支援の開始履歴"]),
    dict(file="meetings.html", out="ogp-meetings.png", tone="teal", art="meeting",
         label="火の国会議", tag="支援連携",
         target="現地で救援・生活再建支援に携わる関係者・支援団体",
         title="火の国会議 議事録アーカイブ/行政・社協・民間連携の記録",
         lead="熊本県・被災市町村・社会福祉協議会・民間NPOが現地ニーズと課題を共有し、連携して支援を進める協議会の議事録・公式配付資料。",
         chips=["行政・社協・民間連携", "現地ニーズ・課題共有", "会議議事録・資料"]),
    dict(file="terms.html", out="ogp-terms.png", tone="sky", art="dictionary",
         label="災害用語", tag="やさしい解説",
         target="り災証明書や公費解体など制度用語の意味を調べたい方",
         title="災害用語集・制度の手引き/公的支援用語をやさしく解説",
         lead="罹災証明・みなし仮設・公費解体・応急修理・善後措置など、被災後の手続きで頻出する難解な公的用語の意味と実務要点をわかりやすく解説。",
         chips=["制度用語をやさしく", "手続きの注意点", "五十音・分野別検索"]),
    dict(file="reconstruction-documents.html", out="ogp-reconstruction-documents.png", tone="blue", art="docs",
         label="暮らしの再建", tag="証明・手続き",
         target="罹災証明書・被災届出証明書の交付を受ける被災世帯",
         title="り災証明書・各種申請手続き/必要書類と窓口案内",
         lead="罹災証明書・被災届出証明の申請手順、被害状況写真の撮り方、紛失した身分証の再発行、各市町村の特設受付窓口を詳しく案内。",
         chips=["り災証明の申請手順", "被害写真の撮影方法", "身分証・通帳の再発行"]),
    dict(file="reconstruction-money.html", out="ogp-reconstruction-money.png", tone="amber", art="money",
         label="暮らしの再建", tag="お金・給付",
         target="生活資金・義援金・融資・各種減免を申請したい被災者",
         title="お金・生活資金の公的支援/支援金・義援金・貸付・減免",
         lead="被災者生活再建支援金・義援金・災害援護資金貸付・税や国民健康保険料・年金の減免・猶予など、お金に関するすべての支援を網羅。",
         chips=["生活再建支援金・義援金", "災害援護資金貸付", "税・保険料の減免猶予"]),
    dict(file="reconstruction-health-care.html", out="ogp-reconstruction-health.png", tone="pink", art="health",
         label="暮らしの再建", tag="医療・健康",
         target="通院・服薬・介護保険・こころのケアを必要とする被災者",
         title="健康・医療・介護の支援ガイド/保険証なし受診・窓口減免",
         lead="保険証が手元になくても受診できる特例、医療費窓口負担の減免、介護保険サービスの利用継続、巡回診療・こころの健康相談案内。",
         chips=["保険証なし受診特例", "医療費の窓口減免", "こころの健康・介護"]),
    dict(file="reconstruction-family.html", out="ogp-reconstruction-family.png", tone="orange", art="family",
         label="暮らしの再建", tag="子ども・学校",
         target="保育所・就学・子育ての支援を求める被災世帯",
         title="子ども・家族の生活支援ガイド/保育・学校・就学援助",
         lead="保育所・学童の特別受入、学校再開情報、教科書・学用品の給与、給食費減免、就学援助制度、被災家庭のための育児相談窓口。",
         chips=["保育所・学童の受入", "教科書・学用品給与", "給食費減免・就学援助"]),
    dict(file="reconstruction-work-business.html", out="ogp-reconstruction-work.png", tone="purple", art="work",
         label="暮らしの再建", tag="仕事・事業",
         target="事業再建・雇用維持・休業補償を求める事業者・働く方",
         title="仕事・事業の再開支援ガイド/雇用調整助成金・特別融資",
         lead="雇用調整助成金の災害特例、休業手当の給付、事業者向け復旧補助金、日本政策金融公庫等の特別融資、労働相談窓口を網羅。",
         chips=["雇用調整助成金特例", "事業復旧補助金", "緊急特別融資・相談"]),
    dict(file="reconstruction-agriculture-fishery.html", out="ogp-reconstruction-agri.png", tone="green", art="agri",
         label="暮らしの再建", tag="農林水産業",
         target="農地・ハウス・農機具・漁船等に被害を受けた農漁業者",
         title="農業・漁業の復旧支援ガイド/施設・機具の復旧と公的共済",
         lead="農地・農業用ハウス・農業機械・漁船の被害復旧支援、被災農業者向け経営体育成支援事業、共済金の早期支払、無利子資金のご案内。",
         chips=["農地・ハウス復旧支援", "農業機械・漁船支援", "共済金・無利子資金"]),
    dict(file="reconstruction-search.html", out="ogp-reconstruction-search.png", tone="teal", art="search",
         label="暮らしの再建", tag="横断検索",
         target="21市町村の公式情報をキーワードで探したい被災者",
         title="被災者支援 横断検索ナビ/キーワードで探す公的情報",
         lead="21市町村と熊本県が発信する膨大な支援制度・生活再建情報を、困りごとやキーワード（ごみ、修理、給付など）から横断的に検索。",
         chips=["全制度キーワード検索", "自治体別絞り込み", "一次情報へ直通"]),
    dict(file="reconstruction-official.html", out="ogp-reconstruction-official.png", tone="blue", art="nav",
         label="暮らしの再建", tag="公式ナビ",
         target="各市町村の災害特設ページや窓口へ直通したい被災者",
         title="自治体公式支援ナビ/21市町村の災害特設窓口一覧",
         lead="21市町村の災害対策特設ページ、り災証明受付案内、生活再建ガイド、担当部署直通ダイヤルへの公式一次情報リンク集。",
         chips=["21市町村特設ページ", "公式一次情報直通", "担当窓口ダイヤル"]),
    dict(file="disaster.html", out="ogp-disaster-portal.png", tone="teal", art="portal",
         label="令和8年熊本地震", tag="支援ポータル",
         target="被災された住民・ご家族・ボランティア・支援関係者",
         title="令和8年熊本地震 支援情報ポータル/暮らし再建と支援現場の総合案内",
         lead="住まいの再建・生活資金・各種減免から、21市町村公式発表、避難所・仮設住宅、災害ボランティア連携まで全情報を網羅。",
         chips=["生活再建制度ナビ", "21市町村公式発表", "支援活動・連携ガイド"]),
    dict(file="affected.html", out="ogp-affected.png", tone="amber", art="affected",
         label="被災された方へ", tag="総合案内",
         target="今すぐ生活支援・住まい・給付を必要とする被災者",
         title="被災された方の生活再建ガイド/今すぐ役立つ支援と手続き",
         lead="今夜の住まい、食事や給水、り災証明書の申請、健康と医療、生活資金の給付など、被災直後から再建までに必要な支援を順序立てて案内。",
         chips=["直後の生活・安全確保", "住まいと証明書申請", "給付金・生活再建資金"]),
    dict(file="supporters.html", out="ogp-supporters.png", tone="green", art="supporters",
         label="支援者の方へ", tag="活動連携",
         target="ボランティア・民間支援団体・物資支援に関わる方",
         title="支援活動・現地連携ガイド/ボランティア・物資・活動ルール",
         lead="災害ボランティア参加手順、物資受入ルール、現地連絡会議（火の国会議）の動向、被災者本位の支援を行うための留意事項。",
         chips=["ボランティア参加手順", "物資支援のルール", "火の国会議・現地連携"]),
    dict(file="official.html", out="ogp-official.png", tone="blue", art="official",
         label="公的機関情報", tag="一次情報",
         target="国・県・市町村の公式制度基準・通達を確認したい方",
         title="国・熊本県・市町村 公的情報/災害救助法・支援基準アーカイブ",
         lead="内閣府・熊本県・21市町村が発表する災害救助法適用、被災者生活再建支援法適用、公的支援の実施要綱などの一次情報通達を網羅。",
         chips=["災害救助法適用通達", "生活再建支援法基準", "公式発表アーカイブ"]),
    dict(file="support.html", out="ogp-support-fields.png", tone="sky", art="support_fields",
         label="支援分野別", tag="分野別窓口",
         target="住まい・お金・医療・雇用など目的別に探したい方",
         title="支援分野別インデックス/目的から探す公的支援窓口",
         lead="住まいの確保、お金・生活費、医療と介護、子育て・就学、仕事と雇用、法律相談など、困りごとの分野から必要な制度と窓口を案内。",
         chips=["分野別支援インデックス", "住まい・生活・健康", "専門相談窓口一覧"]),
]


def font(path: Path, size: int) -> "ImageFont.FreeTypeFont":
    return ImageFont.truetype(str(path), size, index=0)


def wrap(text: str, fnt, max_width: int, respect_slash: bool = True) -> list[str]:
    """意味のまとまりを維持しながら幅に収まるよう行を折る。「/」があればそこで優先改行する。"""
    if respect_slash and "/" in text:
        parts = [p.strip() for p in text.split("/") if p.strip()]
        lines = []
        for part in parts:
            lines.extend(wrap(part, fnt, max_width, respect_slash=False))
        return lines

    lines = []
    current = ""
    for char in text:
        if fnt.getlength(current + char) > max_width and current:
            # 句読点や助詞が行頭にこないよう禁則処理
            if char in "、。，．！？)]｝」』・ー":
                current += char
                lines.append(current)
                current = ""
            else:
                lines.append(current)
                current = char
        else:
            current += char
    if current:
        lines.append(current)
    return lines


def render_art(body: str, box_width: int) -> Image.Image:
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 82" width="120" height="82">'
           f'<g fill="none" stroke="{ART_STROKE}" stroke-width="2.6" stroke-linecap="round" '
           f'stroke-linejoin="round">{body}</g></svg>')
    document = fitz.open("svg", svg.encode("utf-8"))
    scale = box_width / 120
    pixmap = document[0].get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=True)
    return Image.open(io.BytesIO(pixmap.tobytes("png"))).convert("RGBA")


def build(page: dict) -> Path:
    tone, soft, outer = TONES[page["tone"]]

    # ① キャンバス作成（淡いトーン背景）
    image = Image.new("RGBA", (W, H), outer)
    draw = ImageDraw.Draw(image)

    # 上端・下端の品格あるアクセントライン（高さ 6px）
    draw.rectangle([0, 0, W, 6], fill=tone)
    draw.rectangle([0, H - 6, W, H], fill=tone)

    # ② ドロップシャドウ付きメインホワイトカード
    card_margin_x, card_margin_y = 32, 26
    card_rect = [card_margin_x, card_margin_y, W - card_margin_x, H - card_margin_y]

    # シャドウレイヤー
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    # 2重のソフトシャドウ
    sdraw.rounded_rectangle([card_rect[0] + 2, card_rect[1] + 6, card_rect[2] + 2, card_rect[3] + 6],
                            radius=24, fill=(15, 23, 42, 14))
    sdraw.rounded_rectangle([card_rect[0], card_rect[1] + 3, card_rect[2], card_rect[3] + 3],
                            radius=24, fill=(15, 23, 42, 22))
    image = Image.alpha_composite(image, shadow)
    draw = ImageDraw.Draw(image)

    # ホワイトカード本体
    draw.rounded_rectangle(card_rect, radius=24, fill="#ffffff", outline="#e2e8f0", width=2)

    # ③ カード内ヘッダー（左：バッジ群、右：ブランド表記）
    header_y = card_rect[1] + 24
    label_font = font(BOLD, 19)

    # 自治体／メインバッジ
    label_text = page["label"]
    label_w = int(label_font.getlength(label_text)) + 26
    label_rect = [card_rect[0] + 36, header_y, card_rect[0] + 36 + label_w, header_y + 34]
    draw.rounded_rectangle(label_rect, radius=6, fill=tone)
    draw.text((label_rect[0] + 13, header_y + 17), label_text, font=label_font, fill="#ffffff", anchor="lm")

    # サブタグバッジ
    tag_text = page.get("tag", "令和8年熊本地震")
    tag_w = int(label_font.getlength(tag_text)) + 24
    tag_rect = [label_rect[2] + 10, header_y, label_rect[2] + 10 + tag_w, header_y + 34]
    draw.rounded_rectangle(tag_rect, radius=6, fill=soft, outline=tone, width=1)
    draw.text((tag_rect[0] + 12, header_y + 17), tag_text, font=label_font, fill=tone, anchor="lm")

    # 右側ブランド表記
    brand_font = font(BOLD, 17)
    draw.text((card_rect[2] - 36, header_y + 17), "よか隊ネット熊本　|　令和8年熊本地震", font=brand_font,
              fill="#64748b", anchor="rm")

    # ④ 右側ビジュアルプレート（インフォグラフィック枠）
    plate_w, plate_h = 390, 420
    plate_x = card_rect[2] - plate_w - 36
    plate_y = header_y + 54
    plate_rect = [plate_x, plate_y, plate_x + plate_w, plate_y + plate_h]

    # プレート背景
    draw.rounded_rectangle(plate_rect, radius=20, fill=soft, outline=tone, width=2)

    # SVGアイコン描画（高精細）
    art = render_art(ART[page["art"]], 290)
    image.paste(art, (plate_x + (plate_w - art.width) // 2,
                      plate_y + (plate_h - 70 - art.height) // 2), art)

    # プレート下部：信頼性ステータスチップ
    badge_w, badge_h = 330, 38
    badge_x = plate_x + (plate_w - badge_w) // 2
    badge_y = plate_y + plate_h - 52
    badge_rect = [badge_x, badge_y, badge_x + badge_w, badge_y + badge_h]
    draw.rounded_rectangle(badge_rect, radius=19, fill="#ffffff", outline="#cbd5e1", width=1)
    badge_font = font(BOLD, 15)
    draw.text((badge_x + badge_w // 2, badge_y + badge_h // 2),
              "✓ 一次情報リンク完備・自治体公式準拠", font=badge_font, fill="#0f766e", anchor="mm")

    # ⑤ 左側コンテンツエリア
    content_x = card_rect[0] + 36
    content_w = plate_x - content_x - 32

    # 【対象】バッジ（左端アクセントバー付き）
    target_raw = f"【対象】{page['target']}"
    for t_size in (19, 18, 17, 16, 15):
        target_font = font(BOLD, t_size)
        if target_font.getlength(target_raw) <= content_w - 32:
            break
    target_w = int(target_font.getlength(target_raw)) + 26
    target_y = plate_y + 4
    target_h = 36
    target_rect = [content_x, target_y, content_x + target_w, target_y + target_h]
    draw.rounded_rectangle(target_rect, radius=6, fill="#f8fafc", outline="#cbd5e1", width=1)
    # オレンジのアクセントライン
    draw.rounded_rectangle([content_x, target_y, content_x + 6, target_y + target_h],
                           radius=3, fill="#ea580c")
    draw.text((content_x + 16, target_y + target_h // 2), target_raw, font=target_font, fill="#0f172a", anchor="lm")

    # タイトル（2行に美しく収める）
    title_y = target_y + target_h + 16
    for t_size in (48, 44, 40, 36, 33):
        title_font = font(BOLD, t_size)
        title_lines = wrap(page["title"], title_font, content_w, respect_slash=True)
        widest = max(title_font.getlength(line) for line in title_lines)
        if len(title_lines) <= 2 and widest <= content_w:
            break
    title_step = int(t_size * 1.32)

    cur_y = title_y
    for line in title_lines:
        draw.text((content_x, cur_y), line, font=title_font, fill="#0f172a")
        cur_y += title_step

    # タイトル下のテーマカラー・アクセントバー
    draw.rounded_rectangle([content_x, cur_y + 6, content_x + 80, cur_y + 10], radius=2, fill=tone)

    # リード文
    lead_y = cur_y + 24
    lead_font = font(REGULAR, 22)
    lead_lines = wrap(page["lead"], lead_font, content_w, respect_slash=False)[:3]
    lead_step = 34

    cur_lead_y = lead_y
    for line in lead_lines:
        draw.text((content_x, cur_lead_y), line, font=lead_font, fill="#334155")
        cur_lead_y += lead_step

    # 3連キータグチップ（各ページの主要ポイント）
    chips = page.get("chips", ["公的支援ナビ", "要件・手続き", "一次情報直通"])
    chip_font = font(BOLD, 16)
    chip_y = plate_y + plate_h - 48
    chip_x = content_x

    for idx, chip_text in enumerate(chips):
        cw = int(chip_font.getlength(chip_text)) + 24
        ch = 34
        crect = [chip_x, chip_y, chip_x + cw, chip_y + ch]
        if idx == 0:
            # 1つ目：トーンカラーの強調チップ
            draw.rounded_rectangle(crect, radius=8, fill=soft, outline=tone, width=2)
            draw.text((chip_x + cw // 2, chip_y + ch // 2), chip_text, font=chip_font, fill=tone, anchor="mm")
        else:
            # 2つ目・3つ目：上品なニュートラルチップ
            draw.rounded_rectangle(crect, radius=8, fill="#f8fafc", outline="#cbd5e1", width=1)
            draw.text((chip_x + cw // 2, chip_y + ch // 2), chip_text, font=chip_font, fill="#334155", anchor="mm")
        chip_x += cw + 10

    # ⑥ 最下部：URLとタグライン
    footer_y = card_rect[3] - 16
    url_font = font(REGULAR, 16)
    draw.text((content_x, footer_y), "https://www.yokatainet.jp", font=url_font, fill="#94a3b8", anchor="lb")
    tagline_font = font(REGULAR, 15)
    draw.text((card_rect[2] - 36, footer_y), "被災者・支援者のための情報プラットフォーム",
              font=tagline_font, fill="#94a3b8", anchor="rb")

    # RGB変換して保存
    final_image = image.convert("RGB")
    path = ROOT / page["out"]
    final_image.save(path, "PNG", optimize=True)
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
