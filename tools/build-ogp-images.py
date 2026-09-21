#!/usr/bin/env python3
"""ページごとのOGP画像（1200x630）を作る。

    python3 tools/build-ogp-images.py

SNSやLINEに貼られたとき、どのページも同じ共通画像だと「誰向けの情報か」が伝わらない。
対象者（被災者、事業者、解体検討中の方、支援者など）を一目で伝える【対象】バッジと、
自治体名・カテゴリタグを配置し、必要な人に確実に届く画像に仕上げる。

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
MUTED = "#334155"

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
    "uki": ("#176b87", "#eaf6fa"),
    "hikawa": ("#185f55", "#edf7f4"),
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

PAGES = [
    dict(file="uto-support.html", out="ogp-uto-support.png", tone="teal", art="support_fields",
         label="宇土市", tag="暮らしの支援・補助金",
         target="宇土市民・被災者・子育て世帯・シニア・事業者",
         title="暮らしの支援・補助金/総合ガイド",
         lead="住まい（リフォーム・耐震）・子育て・健康・福祉・産業まで全53制度を整理。熊本地震復興支援との連携ルール・一次情報リンク完備。"),
    dict(file="uki-living-support.html", out="ogp-uki-living-support.png", tone="uki", art="support_fields",
         label="宇城市", tag="暮らしの支援・補助金",
         target="宇城市民・被災者・子育て世帯・シニア・事業者",
         title="暮らしの支援・補助金/総合ガイド",
         lead="高校生までの医療費完全無償化、耐震100万、創業、移住から地震特別支援まで条件で即座に探せます。"),
    dict(file="hikawa-living-support.html", out="ogp-hikawa-living-support.png", tone="hikawa", art="support_fields",
         label="氷川町", tag="暮らしの支援・補助金",
         target="氷川町民・被災者・子育て世帯・シニア・農家",
         title="暮らしの支援・補助金/総合ガイド",
         lead="町内産畳表張替助成、出産祝金、高校生医療費、移住体験住宅から公費解体まで条件で探せます。"),
    dict(file="yatsushiro-living-support.html", out="ogp-yatsushiro-living-support.png", tone="blue", art="support_fields",
         label="八代市", tag="暮らしの支援・補助金",
         target="八代市民・被災者・子育て世帯・シニア・事業者",
         title="暮らしの支援・補助金/総合ガイド",
         lead="0〜5歳保育料完全無償化、高校生医療費全額助成、八代産材、創業から第7版全54制度まで条件で探せます。"),
    dict(file="uki-consultation.html", out="ogp-uki-consultation.png", tone="uki", art="meeting",
         label="宇城市", tag="無料相談会",
         target="法律・ローン・相続・解体・手続きで悩む被災者",
         title="被災者支援のための/無料相談会ガイド",
         lead="司法書士・弁護士・行政書士に予約不要・無料で相談。市役所新館と小川ラポートの曜日・時間・場所、相談内容を整理。"),
    dict(file="yatsushiro-safetynet4.html", out="ogp-yatsushiro-safetynet4.png", tone="blue", art="work",
         label="八代市", tag="令和8年熊本地震",
         target="売上減少・資金繰りに直面する事業者・個人事業主",
         title="セーフティネット保証4号/利用ガイド",
         lead="別枠無担保8,000万円・100%信用保証。売上20%減要件の3パターン判定・指定期間12/17・必要書類・手続き手順を整理。"),
    dict(file="priority-support-summary.html", out="ogp-priority-support.png", tone="teal", art="support_fields",
         label="5市町横断比較", tag="支援制度まとめ",
         target="被災された住民・支援者・相談窓口担当",
         title="熊本市・宇土市・宇城市/氷川町・八代市の制度比較",
         lead="住まい・お金・減免・生活・事業の20制度を横断整理。制度の有無、金額、特設ガイド、自治体公式の受付状況を比較できます。"),
    dict(file="yatsushiro-loan.html", out="ogp-yatsushiro-loan.png", tone="blue", art="money",
         label="八代市", tag="生活資金・貸付",
         target="当面の生活費や再建資金を必要とする世帯",
         title="災害援護資金の貸付/利用ガイド",
         lead="世帯主の負傷・住居や家財損害に最大350万円貸付。年1%（保証人で無利子）・据置最長5年・申請期限11/2・診断ツール。"),
    dict(file="uto-jizokuka.html", out="ogp-uto-jizokuka.png", tone="teal", art="work",
         label="宇土市", tag="事業者支援",
         target="被災した小規模事業者・個人事業主",
         title="小規模事業者持続化補助金/＜一般型 災害支援枠＞",
         lead="直接被害最大200万円（定額10/10あり）、間接被害最大100万円。商工会確認締切10/9・申請締切10/16・受給額診断を整理。"),
    dict(file="yatsushiro-rebuild.html", out="ogp-yatsushiro-rebuild.png", tone="blue", art="rebuild",
         label="八代市", tag="生活再建支援",
         target="全壊・大規模半壊・中規模半壊等の被災世帯",
         title="被災者生活再建支援金/利用ガイド",
         lead="全壊・解体・大規模半壊・中規模半壊。最大300万円の支援金・半壊解体の事前相談・申請書類・FAQを整理。"),
    dict(file="yatsushiro-support.html", out="ogp-yatsushiro-support.png", tone="blue", art="support_fields",
         label="八代市", tag="被災者応援",
         target="八代市で被災された住民・ご家族",
         title="被災者応援ガイドブック/第7版を分かりやすく",
         lead="全54制度を対象、金額、期限、必要書類から整理。住家被害判定から主な支援候補も確認できます。"),
    dict(file="index.html", out="ogp-home.png", tone="teal", art="portal",
         label="よか隊ネット熊本", tag="総合ポータル",
         target="被災された方・支援者・関係自治体の皆さま",
         title="災害・支援状況レポート/令和8年熊本地震",
         lead="令和8年熊本地震の被害状況、自治体の一次情報、生活再建と支援活動を分かりやすく伝えます。"),
    dict(file="404.html", out="ogp-404.png", tone="sky", art="search",
         label="よか隊ネット熊本", tag="案内",
         target="サイトをご利用の皆さま",
         title="ページが見つかりません",
         lead="お探しのページは移動または削除された可能性があります。トップページやサイト内検索から情報を探せます。"),
    dict(file="about.html", out="ogp-about.png", tone="teal", art="supporters",
         label="団体について", tag="よか隊ネット熊本",
         target="団体の理念・活動を知りたい方・連携先",
         title="よか隊ネット熊本とは",
         lead="熊本の災害支援と地域のつながりを支える団体の目的、活動内容、運営方針をご紹介します。"),
    dict(file="join.html", out="ogp-join.png", tone="green", art="volunteer",
         label="参加・協力", tag="よか隊ネット熊本",
         target="ボランティア・寄付・支援に関心のある方",
         title="支援・協力する",
         lead="会員、寄付、ボランティア、連携など、よか隊ネット熊本の活動へ参加・協力する方法をご案内します。"),
    dict(file="contact.html", out="ogp-contact.png", tone="blue", art="channels",
         label="お問い合わせ", tag="連絡窓口",
         target="相談・取材・連携をご希望の方",
         title="連絡・相談窓口",
         lead="よか隊ネット熊本へのお問い合わせ方法と、災害時の緊急連絡に関する注意事項をご案内します。"),
    dict(file="privacy.html", out="ogp-privacy.png", tone="purple", art="docs",
         label="運営方針", tag="プライバシー",
         target="サイトをご利用の皆さま",
         title="プライバシーポリシー",
         lead="個人情報の取得、利用目的、安全管理、アクセス解析、外部サービスの取り扱いを定めています。"),
    dict(file="accessibility.html", out="ogp-accessibility.png", tone="sky", art="guide_book",
         label="運営方針", tag="アクセシビリティ",
         target="サイトをご利用の皆さま・閲覧支援が必要な方",
         title="アクセシビリティ方針",
         lead="災害時にも必要な情報へたどり着けるよう、読みやすさ、操作しやすさ、情報の伝わり方を整えます。"),
    dict(file="kumamoto-support.html", out="ogp-kumamoto-support.png", tone="uki", art="support_fields",
         label="熊本市", tag="被災者支援",
         target="熊本市で被災された住民・ご家族",
         title="被災者支援制度ガイド",
         lead="全95支援項目を7分野に整理。被害判定と世帯状況から対象候補、支給額、条件、期限、窓口を確認できます。"),
    dict(file="municipality-updates.html", out="ogp-municipality-updates.png", tone="orange", art="timeline",
         label="21市町村", tag="公式発表",
         target="自治体の一次情報を追う被災者・支援者",
         title="市町村からの公式発信",
         lead="被災自治体が公表した一次情報を自動収集し、日付、自治体、支援分野から探せるよう整理しています。"),
    dict(file="risai-certificate.html", out="ogp-risai-certificate.png", tone="teal", art="risai",
         label="熊本県全域", tag="証明書手続き",
         target="住まいに被害を受けたすべての被災者",
         title="り災証明書を/いちから分かりやすく",
         lead="写真・調査・判定・支援金・再調査。被災後の流れを絵と大きな文字で説明します。"),
    dict(file="uto-bulletin.html", out="ogp-uto-bulletin.png", tone="blue", art="bulletin",
         label="宇土市", tag="広報解説",
         target="宇土市で被災された住民・ご家族",
         title="広報うと 災害臨時号vol.1/の読み方",
         lead="り災証明・災害ごみ・住まいの修理・支援金・減免を、期限が近い順に並べ直しました。"),
    dict(file="alert-channels.html", out="ogp-alert-channels.png", tone="teal", art="channels",
         label="21市町村", tag="情報受信",
         target="市町村からの緊急通知・情報を受け取りたい方",
         title="お知らせの受け取り方",
         lead="公式LINE・メール配信・防災行政無線。市町村ごとの受け取り方を、公式ページで確認してまとめました。"),
    dict(file="official-timeline.html", out="ogp-official-timeline.png", tone="orange", art="timeline",
         label="21市町村分析", tag="復旧局面",
         target="復旧経過・局面変化を把握したい支援者・自治体",
         title="発信でたどる被災地の局面",
         lead="何が話題になっていたかの移り変わりを、市町村の公式発信から3つの局面で示します。"),
    dict(file="official-water-recovery.html", out="ogp-official-water.png", tone="sky", art="water",
         label="21市町村分析", tag="水道・井戸復旧",
         target="断水・濁り水・井戸水問題に関わる住民・支援者",
         title="水の復旧と、/統計に表れない水の問題",
         lead="断水戸数では0と数えられる濁り水・時間断水・井戸水を、発信と会議記録から補います。"),
    dict(file="official-response-tracks.html", out="ogp-official-tracks.png", tone="purple", art="tracks",
         label="21市町村分析", tag="初動・対応推移",
         target="自治体の初動対応・推移を検証したい支援者・関係者",
         title="5つの対応の流れ",
         lead="断水・罹災証明・災害VC・災害ごみ・相談窓口。市町村ごとの動きを時間軸で並べます。"),
    dict(file="volunteer-centers.html", out="ogp-volunteer-centers.png", tone="green", art="volunteer",
         label="熊本県全域", tag="ボランティア",
         target="ボランティア参加希望者・活動中の支援団体",
         title="災害ボランティアセンター",
         lead="各地の設置場所と活動状況、運営する社会福祉協議会からの募集・活動の発信をまとめています。"),
    dict(file="uto-housing.html", out="ogp-uto-housing.png", tone="amber", art="housing",
         label="宇土市", tag="住まい再建",
         target="宇土市で住宅被害を受けた被災世帯",
         title="住まいの相談・再建支援",
         lead="応急修理・みなし仮設・公費解体など、住まいの再建に関する宇土市の公式情報への入口です。"),
    dict(file="uto-repair.html", out="ogp-uto-repair.png", tone="teal", art="repair",
         label="宇土市", tag="住宅修理",
         target="一部損壊・準半壊・半壊等で自宅修理を行う方",
         title="住宅の応急修理/利用ガイド",
         lead="上限は75万7千円（準半壊は36万7千円）。対象になる修理・写真の撮り方・必要書類・手続きの流れを整理。"),
    dict(file="hq-kumamoto.html", out="ogp-hq-kumamoto.png", tone="pink", art="hq",
         label="熊本市", tag="対策本部会議",
         target="熊本市の被害・避難・本部決定を追う支援者・報道",
         title="災害対策本部会議/のまとめ",
         lead="第1回から公開されている会議資料を並べ、避難者数・住家被害・り災証明の推移を追えるようにしました。"),
    dict(file="hq-yatsushiro.html", out="ogp-hq-yatsushiro.png", tone="green", art="hq",
         label="八代市", tag="対策本部会議",
         target="八代市の被害・避難・本部決定を追う支援者・報道",
         title="災害対策本部会議/のまとめ",
         lead="第2回から公開されている会議資料を並べ、避難者数と住家被害の内訳の動きを追えるようにしました。"),
    dict(file="hikawa-support.html", out="ogp-hikawa-support.png", tone="hikawa", art="hikawa",
         label="氷川町", tag="被災者支援",
         target="氷川町で被災された住民・ご家族",
         title="被災者支援制度一覧",
         lead="証明書・住まい・支援金・生活の困りごと。氷川町公式の支援制度と窓口を目的から探せます。"),
    dict(file="hikawa-demolition.html", out="ogp-hikawa-demolition.png", tone="hikawa", art="demolition",
         label="氷川町", tag="家屋解体",
         target="半壊以上で家屋解体を検討中の世帯・所有者",
         title="公費解体・自費解体/利用ガイド",
         lead="全壊〜半壊が対象。完全電話予約制・竜北体育センター受付・全10様式と記載例・自費解体の保管書類を整理。"),
    dict(file="uki-support.html", out="ogp-uki-support.png", tone="uki", art="uki",
         label="宇城市", tag="被災者支援",
         target="宇城市で被災された住民・ご家族",
         title="被災者支援制度ガイド",
         lead="36の公的支援を全壊〜一部損壊の判定別・困りごと別に整理。支援額・必要書類・窓口を網羅。"),
    dict(file="reconstruction.html", out="ogp-reconstruction.png", tone="teal", art="rebuild",
         label="生活再建", tag="総合ナビ",
         target="被災後の生活再建を進めるすべての被災者",
         title="暮らしの再建ナビ",
         lead="住まい・生活資金・各種手続き・健康・仕事。直面している困りごとから自治体や公的機関の支援へ。"),
    dict(file="temporary-housing.html", out="ogp-temporary-housing.png", tone="sky", art="housing_build",
         label="熊本県全域", tag="仮設住宅",
         target="建設型応急住宅への入居を検討・希望する方",
         title="仮設住宅の整備状況",
         lead="宇土市・宇城市・美里町・甲佐町・氷川町。各団地の戸数、着工日、入居予定、進捗の最新まとめ。"),
    dict(file="guide.html", out="ogp-guide.png", tone="blue", art="guide_book",
         label="制度解説", tag="生活再建",
         target="公的支援の仕組みや申請要点を知りたい被災者",
         title="制度・生活再建ガイド",
         lead="罹災証明・生活再建支援金・住宅応急修理・減免制度。知っておくべき支援の仕組みと申請の要点。"),
    dict(file="municipalities.html", out="ogp-municipalities.png", tone="green", art="dashboard",
         label="21市町村", tag="ダッシュボード",
         target="自治体別の被害・避難・支援状況を調べたい方",
         title="自治体別 被害・支援情報",
         lead="自治体ごとの公式発表タイムライン、被害・避難状況、支援制度、活動記録をワンストップで確認。"),
    dict(file="municipality-support-compare.html", out="ogp-support-compare.png", tone="purple", art="compare",
         label="21市町村", tag="制度横断比較",
         target="自治体ごとの支援手厚さ・受付状況を比較したい方",
         title="被災者支援制度/自治体間比較",
         lead="住まい修理・支援金・仮設住宅・災害ごみ。21市町村の対応状況と受付窓口を横並びで比較。"),
    dict(file="hq-uto.html", out="ogp-hq-uto.png", tone="amber", art="hq",
         label="宇土市", tag="対策本部会議",
         target="宇土市の被害・避難・本部決定を追う支援者・報道",
         title="災害対策本部会議/のまとめ",
         lead="公開された全本部会議資料から、避難者数・住家被害・給水・罹災証明受付の推移を整理。"),
    dict(file="shelters.html", out="ogp-shelters.png", tone="orange", art="shelter",
         label="避難所情報", tag="マップ・一覧",
         target="避難所を利用中の方・受入状況を確認したい方",
         title="開設中の避難所マップ",
         lead="市町村別の指定避難所の開設・閉鎖状況、避難者数、所在地・設備情報を地図と一覧で確認。"),
    dict(file="timeline.html", out="ogp-timeline.png", tone="blue", art="calendar_clock",
         label="日々の記録", tag="時系列アーカイブ",
         target="発災からの推移・経過を検証・確認したい方",
         title="日々の記録",
         lead="発災初日から現在までの地震発生、避難、インフラ復旧、公的支援の動きを日系列でたどる記録。"),
    dict(file="meetings.html", out="ogp-meetings.png", tone="teal", art="meeting",
         label="火の国会議", tag="連携協議",
         target="現地で救援・連携活動を行う支援関係者",
         title="火の国会議 議事録",
         lead="行政・社協・民間支援団体が共有した現地課題、支援ニーズ、連携の協議経過と公式資料。"),
    dict(file="terms.html", out="ogp-terms.png", tone="sky", art="dictionary",
         label="災害用語", tag="やさしい解説",
         target="罹災証明や公費解体など制度用語を調べたい方",
         title="災害用語集",
         lead="罹災証明・みなし仮設・公費解体・緊急修理など、災害時に使われる公的用語をやさしく解説。"),
    dict(file="reconstruction-documents.html", out="ogp-reconstruction-documents.png", tone="blue", art="docs",
         label="暮らしの再建", tag="手続き・証明",
         target="罹災証明・被災届出証明の申請を行う被災者",
         title="証明・申請の手続き",
         lead="罹災証明書・被災届出証明の申請、被害箇所の撮影、必要書類と各自治体の受付窓口。"),
    dict(file="reconstruction-money.html", out="ogp-reconstruction-money.png", tone="amber", art="money",
         label="暮らしの再建", tag="お金・給付",
         target="支援金・義援金・融資・減免を申請したい被災者",
         title="お金・支払いの支援",
         lead="被災者生活再建支援金・義援金・各種見舞金・融資貸付・税や保険料の減免猶予。"),
    dict(file="reconstruction-health-care.html", out="ogp-reconstruction-health.png", tone="pink", art="health",
         label="暮らしの再建", tag="医療・健康",
         target="通院・服薬・介護・心のケアが必要な被災者",
         title="健康・医療・介護の支援",
         lead="保険証なし受診・医療費窓口負担の減免・介護保険サービス・こころの健康相談。"),
    dict(file="reconstruction-family.html", out="ogp-reconstruction-family.png", tone="orange", art="family",
         label="暮らしの再建", tag="子ども・学校",
         target="保育・就学・子育て支援を求める世帯",
         title="子ども・家族の支援",
         lead="保育園・学校の再開、教科書・学用品の給与、給食費減免、育児相談と子育て支援。"),
    dict(file="reconstruction-work-business.html", out="ogp-reconstruction-work.png", tone="purple", art="work",
         label="暮らしの再建", tag="仕事・事業",
         target="雇用維持・休業手当・事業再開を図る事業者・働く方",
         title="仕事・事業の再開支援",
         lead="雇用調整助成金・休業手当・事業者向け補助金・特別融資・労働相談窓口。"),
    dict(file="reconstruction-agriculture-fishery.html", out="ogp-reconstruction-agri.png", tone="green", art="agri",
         label="暮らしの再建", tag="農林水産業",
         target="農地・施設・機具・船に被害を受けた農漁業者",
         title="農業・漁業の復旧支援",
         lead="農地・農業用施設・農機具・漁船の被害復旧支援、共済金・特別融資の公的相談。"),
    dict(file="reconstruction-search.html", out="ogp-reconstruction-search.png", tone="teal", art="search",
         label="暮らしの再建", tag="横断検索",
         target="21市町村の公式情報をキーワードで探したい方",
         title="自治体公式情報を探す",
         lead="21市町村が公表する生活再建情報を、困りごとやキーワードから横断的に検索。"),
    dict(file="reconstruction-official.html", out="ogp-reconstruction-official.png", tone="blue", art="nav",
         label="暮らしの再建", tag="公式リンク集",
         target="各市町村の災害対策窓口へアクセスしたい方",
         title="自治体公式情報ナビ",
         lead="各市町村の災害対策特設ページ、生活支援情報、窓口案内への公式リンク集。"),
    dict(file="disaster.html", out="ogp-disaster-portal.png", tone="teal", art="portal",
         label="令和8年熊本地震", tag="支援ポータル",
         target="すべての被災者・支援関係者・ボランティア",
         title="支援情報総合ポータル",
         lead="被災された方の生活再建から自治体公式発表、避難所、ボランティアまで全情報を網羅。"),
    dict(file="affected.html", out="ogp-affected.png", tone="amber", art="affected",
         label="令和8年熊本地震", tag="総合案内",
         target="今すぐ生活再建・公的支援情報を必要とする被災者",
         title="被災された方へ",
         lead="今すぐ必要な生活支援、住まいの確保、罹災証明、健康管理、相談窓口の総合案内。"),
    dict(file="supporters.html", out="ogp-supporters.png", tone="green", art="supporters",
         label="令和8年熊本地震", tag="支援者連携",
         target="ボランティア・支援団体・物資支援に関わる方",
         title="支援活動・連携ガイド",
         lead="ボランティア参加、物資支援、現地連携会議、活動情報の発信ルールと注意点。"),
    dict(file="official.html", out="ogp-official.png", tone="blue", art="official",
         label="令和8年熊本地震", tag="一次情報",
         target="国・県・市町村の公式通達・制度基準を確認したい方",
         title="国・県・市町村の公的情報",
         lead="内閣府・熊本県・各市町村が発表する一次情報、災害救助法の適用、公的支援の最新通達。"),
    dict(file="support.html", out="ogp-support-fields.png", tone="sky", art="support_fields",
         label="令和8年熊本地震", tag="分野別窓口",
         target="住まい・お金・医療・雇用など分野別に探したい方",
         title="支援分野別インデックス",
         lead="住まい、生活物資、医療介護、子育て、雇用、法律相談など分野別に支援窓口を整理。"),
]


def font(path: Path, size: int) -> "ImageFont.FreeTypeFont":
    return ImageFont.truetype(str(path), size, index=0)


def wrap(text: str, fnt, max_width: int, respect_slash: bool = True) -> list[str]:
    """日本語は単語で切れないので幅を測って折る。「/」があればそこで折る。"""
    chunks = [p for p in text.split("/") if p] if (respect_slash and "/" in text) else [text]
    lines = []
    for chunk in chunks:
        current = ""
        for char in chunk:
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
    art_box = (710, 140, 1130, 460)
    draw.rounded_rectangle(art_box, radius=24, fill=soft, outline=tone, width=2)
    art = render_art(ART[page["art"]], 320)
    image.paste(art, (art_box[0] + (420 - art.width) // 2,
                      art_box[1] + (320 - art.height) // 2), art)

    # 表題。2行に収まり、かつ絵の板に重ならない幅になるまで小さくする
    text_width = 580
    for size in (60, 54, 48, 44, 40, 36):
        title_font = font(BOLD, size)
        title_lines = wrap(page["title"], title_font, text_width, respect_slash=True)
        widest = max(title_font.getlength(line) for line in title_lines)
        if len(title_lines) <= 2 and widest <= text_width:
            break

    lead_font = font(REGULAR, 25)
    # リード文は「/」で強制改行しない（スラッシュ記号や日付を保持）
    lead_lines = wrap(page["lead"], lead_font, text_width, respect_slash=False)[:3]

    label_font = font(BOLD, 22)

    # 対象者バッジのフォントサイズ調整（枠内に確実に収める）
    target_raw = f"【対象】{page['target']}"
    for t_size in (23, 21, 19, 17):
        target_font = font(BOLD, t_size)
        if target_font.getlength(target_raw) <= text_width - 32:
            break

    title_step = int(size * 1.30)
    lead_step = 40

    # 縦のレイアウト計算（上下中央揃え）
    block_h = 36 + 12 + 42 + 20 + len(title_lines) * title_step + 16 + len(lead_lines) * lead_step
    top = 16 + (538 - block_h) // 2

    # ① 自治体・カテゴリバッジ
    label_w = int(label_font.getlength(page["label"])) + 28
    draw.rounded_rectangle([72, top, 72 + label_w, top + 36], radius=8, fill=tone)
    draw.text((72 + 14, top + 18), page["label"], font=label_font, fill="#ffffff", anchor="lm")

    # サブタグ
    tag = page.get("tag", "令和8年熊本地震")
    tag_w = int(label_font.getlength(tag)) + 24
    tag_x = 72 + label_w + 10
    draw.rounded_rectangle([tag_x, top, tag_x + tag_w, top + 36], radius=8, fill="#ffffff", outline=tone, width=2)
    draw.text((tag_x + 12, top + 18), tag, font=label_font, fill=tone, anchor="lm")

    # ② 対象者バッジ（一目で誰向けか伝わるように）
    target_y = top + 36 + 12
    target_w = int(target_font.getlength(target_raw)) + 28
    draw.rounded_rectangle([72, target_y, 72 + target_w, target_y + 42], radius=8, fill=soft, outline="#cbd5e1", width=1)
    draw.rectangle([72, target_y, 72 + 8, target_y + 42], fill="#c2410c")  # オレンジのアクセントライン
    draw.text((72 + 18, target_y + 21), target_raw, font=target_font, fill="#0f2c3d", anchor="lm")

    # ③ タイトル
    y = target_y + 42 + 20
    for line in title_lines:
        draw.text((72, y), line, font=title_font, fill=INK)
        y += title_step

    # ④ リード文
    y += 16
    for line in lead_lines:
        draw.text((72, y), line, font=lead_font, fill=MUTED)
        y += lead_step

    # 下の帯にサイト名とURL
    site_font = font(BOLD, 26)
    draw.text((72, H - 38), "よか隊ネット熊本　災害・支援状況レポート", font=site_font,
              fill="#ffffff", anchor="lm")
    url_font = font(REGULAR, 22)
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
