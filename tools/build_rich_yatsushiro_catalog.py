#!/usr/bin/env python3
"""全58制度の詳細（対象・内容・窓口・電話・期限・ノンブル/PDFページ）を網羅したリッチカタログHTML生成スクリプト（電話番号正規化対応）"""
import json
import re
import unicodedata

with open("tools/v8_parsed_programs.json", "r", encoding="utf-8") as f:
    programs = json.load(f)

PDF_BASE = "https://www.city.yatsushiro.lg.jp/kiji00326858/3_26858_161072_up_eh14ogek.pdf"

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
    # 全角数字や記号を半角に
    ph = unicodedata.normalize('NFKC', ph_raw)
    digits = re.sub(r'\D', '', ph)
    # 6桁（市外局番なし、例: 33-4107）の場合は 0965 を補完するかそのまま
    if len(digits) == 6:
        dial = f"0965{digits}"
    else:
        dial = digits
    return ph, dial

def build_item_html(p):
    pid = p["id"]
    name = clean_txt(p["name"])
    badge_html = f' <span class="ys-badge-{"new" if "新規" in p["badge"] else "up"}">{p["badge"]}</span>' if p["badge"] else ""
    nonbre = p["nonbre"]
    pdf_p = p["pdf_page"]
    pdf_link = f"{PDF_BASE}#page={pdf_p}"
    
    target = clean_txt(p["target"])
    content = clean_txt(p["content"])
    contact = clean_txt(p["contact"])
    notes = clean_txt(p["notes"])

    # 1. タイトル行
    title_line = f'<b><a href="{pdf_link}" target="_blank" rel="noopener">{name}{badge_html}<span class="ys-pdf-page">ガイドブック p.{nonbre}（PDF {pdf_p}枚目） ↗</span></a></b>'

    # 2. 特設ガイドがある場合のリンク
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
        detail_box.append(f'<div class="ys-card-row"><span class="ys-card-label">対象</span><div class="ys-card-val">{target}</div></div>')
    
    if content:
        detail_box.append(f'<div class="ys-card-row"><span class="ys-card-label">支援内容</span><div class="ys-card-val">{content}</div></div>')

    # 電話番号の処理
    phones = p["phones"]
    if contact or phones:
        contact_display = contact
        if phones:
            phone_links = []
            for ph_raw in phones:
                disp, dial = format_tel(ph_raw)
                phone_links.append(f'<a href="tel:{dial}">{disp}</a>')
            contact_display += f' （電話: {" / ".join(phone_links)}）'
        detail_box.append(f'<div class="ys-card-row"><span class="ys-card-label">窓口</span><div class="ys-card-val">{contact_display}</div></div>')

    if notes and "お問" not in notes and len(notes) > 5:
        detail_box.append(f'<div class="ys-card-row"><span class="ys-card-label">注意</span><div class="ys-card-val">{notes}</div></div>')

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

print("生成完了（正規化対応）")
