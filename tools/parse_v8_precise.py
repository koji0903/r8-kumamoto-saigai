#!/usr/bin/env python3
"""八代市被災者応援ガイドブック第8版PDFから制度詳細を正確に抽出する"""
import json
import re

with open("tools/programs_v8_raw.json", "r", encoding="utf-8") as f:
    programs = json.load(f)

parsed_programs = []

for prog in programs:
    raw = prog["raw_text"]
    lines = [l.strip() for l in raw.split("\n") if l.strip()]

    # 見出しで分割
    # 八代市ガイドブックの標準見出し:
    # 制度の名称 / 支援の種類 / 制度の内容 / 活用できる方 / 注意事項 / お問合わせ先 (または お問い合わせ先, 受付窓口)
    sections = {
        "title": [],
        "type": [],
        "content": [],
        "target": [],
        "notes": [],
        "contact": []
    }
    current = "content"

    for l in lines:
        if "制度の名称" in l:
            current = "title"
            val = l.replace("制度の名称", "").strip()
            if val: sections["title"].append(val)
        elif "支援の種類" in l:
            current = "type"
            val = l.replace("支援の種類", "").strip()
            if val: sections["type"].append(val)
        elif "制度の内容" in l:
            current = "content"
            val = l.replace("制度の内容", "").strip()
            if val: sections["content"].append(val)
        elif "活用できる方" in l or "対象者" in l:
            current = "target"
            val = l.replace("活用できる方", "").replace("対象者", "").strip()
            if val: sections["target"].append(val)
        elif "注意事項" in l:
            current = "notes"
            val = l.replace("注意事項", "").strip()
            if val: sections["notes"].append(val)
        elif any(k in l for k in ["お問合わせ先", "お問い合わせ先", "受付窓口", "相談窓口"]):
            current = "contact"
            val = re.sub(r'お問合わせ先|お問い合わせ先|受付窓口|相談窓口', '', l).strip()
            if val: sections["contact"].append(val)
        else:
            # ページ番号やヘッダー等はスキップ
            if l.isdigit() and len(l) <= 2:
                continue
            if "被災者応援ガイドブック" in l or ("令和８年熊本地震" in l and len(l) < 25):
                continue
            sections[current].append(l)

    title_text = " ".join(sections["title"]).strip() or prog["name"]
    type_text = " ".join(sections["type"]).strip()
    target_text = " ".join(sections["target"]).strip()
    content_text = " ".join(sections["content"]).strip()
    notes_text = " ".join(sections["notes"]).strip()
    contact_text = " ".join(sections["contact"]).strip()

    # 電話番号
    phones = re.findall(r'(?:0\d{1,4}[-－]\d{1,4}[-－]\d{3,4}|\b\d{2,3}[-－]\d{4}\b|0120[-－]\d{3}[-－]\d{3}|080[-－]\d{4}[-－]\d{4}|070[-－]\d{4}[-－]\d{4}|050[-－]\d{4}[-－]\d{4})', raw)
    phones = list(dict.fromkeys(phones))

    parsed_programs.append({
        "id": prog["id"],
        "name": prog["name"],
        "pdf_title": title_text,
        "category": prog["cat"],
        "nonbre": prog["nonbre"],
        "pdf_page": prog["pdf_page"],
        "badge": prog["badge"],
        "type": type_text,
        "target": target_text,
        "content": content_text,
        "notes": notes_text,
        "contact": contact_text,
        "phones": phones
    })

with open("tools/v8_parsed_programs.json", "w", encoding="utf-8") as f:
    json.dump(parsed_programs, f, ensure_ascii=False, indent=2)

print(f"解析完了: {len(parsed_programs)}件")
for p in parsed_programs[:5]:
    print(f"[{p['category']}] {p['name']} (PDF p.{p['pdf_page']} / ノンブル {p['nonbre']})")
    print(f"  対象: {p['target'][:60]}")
    print(f"  内容: {p['content'][:80]}...")
    print(f"  窓口: {p['contact'][:60]}")
    print(f"  電話: {', '.join(p['phones'])}")
    print()
