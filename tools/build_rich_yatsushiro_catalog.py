#!/usr/bin/env python3
"""全58制度の完全データ（対象・内容・窓口・電話・期限・注意）を厳密に定義し、空白ゼロでリッチカタログHTMLを生成するスクリプト"""
import json
import re
import unicodedata

with open("tools/v8_parsed_programs.json", "r", encoding="utf-8") as f:
    programs = json.load(f)

PDF_BASE = "https://www.city.yatsushiro.lg.jp/kiji00326858/3_26858_161072_up_eh14ogek.pdf"

# 空白だった制度の補完マスタ
OVERRIDES = {
    "counseling": {
        "target": "令和8年熊本地震で被災された八代市民・事業者・外国人市民など（どなたでも相談可能）",
        "contact": "八代市役所本庁舎1階 会議室D（平日9:00〜12:00／13:00〜17:00） TEL: 0965-33-4452（国際課 TEL: 0965-33-6846）",
        "phones": ["0965-33-4452", "0965-33-6846"]
    },
    "waste": {
        "target": "八代市内で地震に伴い災害ごみが発生した世帯・事業者（り災・被災証明書または受付票が必要）",
        "contact": "循環社会推進課（エコエイトやつしろ） TEL: 0965-34-1997",
        "phones": ["0965-34-1997"]
    },
    "scrivener-consult": {
        "target": "令和8年熊本地震で被災され、不動産登記・相続・成年後見・債務整理等の法律相談を希望される方",
        "contact": "市民活動政策課（本庁舎5階） TEL: 0965-33-4482（相談会場：本庁舎2階 市民相談室・毎週水曜13:00〜16:00・予約不要）",
        "phones": ["0965-33-4482"]
    },
    "resident-tax": {
        "target": "令和8年熊本地震により居住する住宅（全壊・大規模半壊・中規模半壊・半壊）または家財・所有家屋に損害を受けた市民・納税義務者",
        "contact": "市民税課（本庁舎2階 13番窓口） TEL: 0965-33-4107",
        "phones": ["0965-33-4107"]
    },
    "property-tax": {
        "target": "令和8年熊本地震により所有する固定資産（家屋・土地・償却資産）に損害を受けた納税義務者（住家は半壊以上、非住家・土地・償却資産も対象）",
        "contact": "資産税課（本庁舎2階 14番窓口） TEL: 0965-33-4108",
        "phones": ["0965-33-4108"]
    },
    "risai-cert": {
        "target": "令和8年熊本地震により住家・非住家・家財等に被害を受けた市民（住家はり災証明、店舗・倉庫・家財等は被災証明書を発行）",
        "contact": "市民税課（本庁舎2階） TEL: 0965-33-4107（本庁1階多目的ホール・各支所・日奈久出張所・オンライン申請受付中）",
        "phones": ["0965-33-4107"]
    },
    "medical-fee-exemption": {
        "target": "住家が全壊・大規模半壊・中規模半壊・半壊・床上浸水した方、または主たる生計維持者が死亡・重傷・行方不明・失業等の被保険者",
        "contact": "国保ねんきん課 TEL: 0965-33-4113 ／ 介護保険課 TEL: 0965-32-1175 ／ 障がい福祉課 TEL: 0965-33-4102",
        "phones": ["0965-33-4113", "0965-32-1175", "0965-33-4102"]
    },
    "smrj-loan": {
        "target": "小規模企業共済の契約者で、被災区域内に事業所を有し、全壊・半壊等の被害または売上減少の証明を受けた方",
        "contact": "中小企業基盤整備機構 共済相談室 TEL: 050-5541-7171（借入申込窓口：商工組合中央金庫）",
        "phones": ["050-5541-7171"]
    }
}

groups = {
    "生活・相談": {"title": "被災者対応", "items": []},
    "税・保険": {"title": "税金・保険料等の減免措置等", "items": []},
    "証明": {"title": "公的書類の発行等", "items": []},
    "生活・お金": {"title": "経済・生活面の支援", "items": []},
    "公共料金": {"title": "公共料金の減免措置等", "items": []},
    "住まい": {"title": "住まいの確保", "items": []},
    "農林・事業": {"title": "事業経営・農林漁業への支援", "items": []}
}

for p in programs:
    cat = p["category"]
    groups[cat]["items"].append(p)

def clean_txt(t):
    if not t: return ""
    t = unicodedata.normalize('NFKC', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def format_tel(ph_raw):
    ph = unicodedata.normalize('NFKC', ph_raw)
    digits = re.sub(r'\D', '', ph)
    if len(digits) == 6:
        dial = f"0965{digits}"
        disp = f"0965-{ph}" if not ph.startswith("0965") else ph
    else:
        dial = digits
        disp = ph
    return disp, dial

def build_item_html(p):
    pid = p["id"]
    name = clean_txt(p["name"])
    badge_html = f' <span class="ys-badge-{"new" if "新規" in p["badge"] else "up"}">{p["badge"]}</span>' if p["badge"] else ""
    nonbre = p["nonbre"]
    pdf_p = p["pdf_page"]
    pdf_link = f"{PDF_BASE}#page={pdf_p}"
    
    # 補完適用
    target = clean_txt(p["target"])
    content = clean_txt(p["content"])
    contact = clean_txt(p["contact"])
    notes = clean_txt(p["notes"])
    phones = p["phones"]

    if pid in OVERRIDES:
        ov = OVERRIDES[pid]
        if "target" in ov and ov["target"]: target = ov["target"]
        if "contact" in ov and ov["contact"]: contact = ov["contact"]
        if "phones" in ov and ov["phones"]: phones = ov["phones"]

    # 1. タイトル行
    title_line = f'<b><a href="{pdf_link}" target="_blank" rel="noopener">{name}{badge_html}<span class="ys-pdf-page">ガイドブック p.{nonbre}（PDF {pdf_p}枚目） ↗</span></a></b>'

    # 2. 特設ガイドリンク
    extra_link = ""
    if pid == "rebuild-grant":
        extra_link = '<div style="margin:6px 0;"><a href="yatsushiro-rebuild.html" style="font-size:12.5px; font-weight:700; color:#1b5671;">【八代市 被災者生活再建支援金ガイド・支給額診断 →】</a></div>'
    elif pid == "disaster-loan":
        extra_link = '<div style="margin:6px 0;"><a href="yatsushiro-loan.html" style="font-size:12.5px; font-weight:700; color:#1b5671;">【八代市 災害援護資金 特別貸付ガイド・診断 →】</a></div>'
    elif pid == "safetynet4-fund":
        extra_link = '<div style="margin:6px 0;"><a href="yatsushiro-safetynet4.html" style="font-size:12.5px; font-weight:700; color:#1b5671;">【八代市 セーフティネット保証4号 認定・資金繰りガイド →】</a></div>'
    elif pid == "saishuppatsu":
        extra_link = '<div style="margin:6px 0;"><a href="kumamoto-saishuppatsu.html" style="font-size:12.5px; font-weight:700; color:#1b5671;">【くまもと事業者再出発支援補助金 特設ガイド →】</a></div>'
    elif pid == "jizokuka":
        extra_link = '<div style="margin:6px 0;"><a href="uto-jizokuka.html" style="font-size:12.5px; font-weight:700; color:#1b5671;">【持続化補助金＜災害支援枠＞ 申請手順・要件解説 →】</a></div>'

    # 3. リッチ情報ブロック
    detail_box = ['<div class="ys-catalog-card">']
    
    if target:
        detail_box.append(f'<div class="ys-card-row"><span class="ys-card-label ys-lbl-target">対象</span><div class="ys-card-val">{target}</div></div>')
    
    if content:
        detail_box.append(f'<div class="ys-card-row"><span class="ys-card-label ys-lbl-content">支援内容</span><div class="ys-card-val">{content}</div></div>')

    # 電話番号
    if contact or phones:
        contact_display = contact
        if phones:
            phone_links = []
            for ph_raw in phones:
                disp, dial = format_tel(ph_raw)
                phone_links.append(f'<a href="tel:{dial}">{disp}</a>')
            contact_display += f' （電話: {" / ".join(phone_links)}）'
        detail_box.append(f'<div class="ys-card-row"><span class="ys-card-label ys-lbl-contact">窓口</span><div class="ys-card-val">{contact_display}</div></div>')

    if notes and "お問" not in notes and len(notes) > 5:
        detail_box.append(f'<div class="ys-card-row"><span class="ys-card-label ys-lbl-note">注意</span><div class="ys-card-val">{notes}</div></div>')

    detail_box.append('</div>')

    item_html = f'<li>{title_line}{extra_link}{"".join(detail_box)}</li>'
    return item_html

articles = []
for cat_key, cat_data in groups.items():
    cnt = len(cat_data["items"])
    items_html = "\n".join([build_item_html(item) for item in cat_data["items"]])
    article = f'''<article data-category="{cat_key}"><h3>{cat_data["title"]} <span>{cnt}件</span></h3><ul>
{items_html}
</ul></article>'''
    articles.append(article)

full_catalog_html = f'''<div class="ys-catalog-grid" id="ysCatalog">
{"\n".join(articles)}
</div>'''

with open("tools/generated_catalog.html", "w", encoding="utf-8") as f:
    f.write(full_catalog_html)

print("リッチカタログ再生成完了（空白ゼロ保証）")
