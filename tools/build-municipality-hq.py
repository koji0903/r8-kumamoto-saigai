#!/usr/bin/env python3
# 市町村の災害対策本部会議資料から、回ごとの数値と本文を取り出す。
#
#   python3 tools/build-municipality-hq.py
#
# 前提: tools/fetch-municipality-hq.mjs を先に実行しておく。
# 依存: PyMuPDF（八代市の資料PDFを読むときだけ。熊本市はHTMLなので不要）。
#
# 生成物
#   sources/official/municipality-hq-text/*.json  回ごとの本文（コミットする）
#   data/generated/municipality-hq-data.js        サイトが読むデータ（直接編集しない）
#
# 本文を別に保存するのは、八代市のPDFが1回20〜35MBあってリポジトリに置けない
# ため。ここに文字だけ残しておけば、PDFを取り直さなくてもサイトを作り直せる。
#
# 数値の扱いについて
#   ・資料に書かれた数字だけを写す。書かれていない項目は null のままにする。
#   ・意味が変わる数字は別の欄にする。熊本市は途中から「住家被害（自己申告を
#     含む速報）」の代わりに「住家被害認定調査実施件数」を載せるようになった。
#     同じ「住家被害」でも数え方が違うので、ひとつの推移に混ぜない。
#   ・差分（＋12、▲7 など）は資料の書き方であって値ではないので取り込まない。

import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "sources/official/municipality-hq-index.json"
PDF_DIR = ROOT / "sources/official/municipality-hq"
TEXT_DIR = ROOT / "sources/official/municipality-hq-text"
OUT = ROOT / "data/generated/municipality-hq-data.js"

ZEN = str.maketrans("０１２３４５６７８９（）：，", "0123456789():,")


def normalize(text):
    """全角数字と記号を半角にし、数字の中の空白を詰める。"""
    text = text.translate(ZEN).replace("　", " ")
    # 「2,658 棟」「34 名」のように単位の前に空白が入る
    return re.sub(r"(?<=[\d,])\s+(?=[名棟件戸か世人])", "", text)


def number(text, pattern):
    """pattern の1つ目の丸括弧を数として読む。無ければ None。"""
    match = re.search(pattern, normalize(text))
    if not match:
        return None
    try:
        return int(match.group(1).replace(",", ""))
    except ValueError:
        return None


# ---- 熊本市：一覧ページの本文から読む ---------------------------------------
def kumamoto_figures(sections):
    damage = "\n".join(s["text"] for s in sections if s["title"].startswith(("被害", "被害等")))
    shelter = "\n".join(s["text"] for s in sections if s["title"].startswith("避難所開設状況"))
    # 「避難者数：323世帯（▲10世帯）482人」の括弧は前回との差。中の数字を
    # 拾ってしまわないよう、読む前に括弧ごと外す
    shelter = re.sub(r"[（(][^（()）]*[)）]", "", shelter)
    figures = {
        "deaths": number(damage, r"死者数\s*(\d[\d,]*)名"),
        "missing": number(damage, r"安否不明者数\s*(\d[\d,]*)名"),
        "unaccounted": number(damage, r"行方不明者数\s*(\d[\d,]*)名"),
        "injuredSevere": number(damage, r"重傷者数\s*(\d[\d,]*)名"),
        "injuredModerate": number(damage, r"中等症数\s*(\d[\d,]*)名"),
        "injuredMinor": number(damage, r"軽傷者数\s*(\d[\d,]*)名"),
        # 「分類未確定3,456棟」は住家被害の側なので、名で終わるものだけ人と見る
        "injuredUnclassified": number(damage, r"分類未確定\s*(\d[\d,]*)名"),
        # 「住家被害 計5,024棟」＝自己申告を含む速報。第20回から載らなくなる
        "homesReported": number(damage, r"住家被害\s*計\s*(\d[\d,]*)棟"),
        # 「住家被害認定調査実施件数計2,658棟」＝調査で判定した件数。第20回から
        "homesSurveyed": number(damage, r"住家被害認定調査実施件数\s*計?\s*(\d[\d,]*)[棟件]"),
        "certificateApplications": number(damage, r"り災証明書申請件数\s*計?\s*(\d[\d,]*)件"),
        "certificateIssued": number(damage, r"り災証明書発行件数[^\n]*?計\s*(\d[\d,]*)[棟件]"),
        "shelters": number(shelter, r"開設避難所数\s*[:：]?\s*計?\s*(\d[\d,]*)か所"),
        "households": number(shelter, r"避難者数\s*[:：]?\s*(\d[\d,]*)世帯"),
        "evacuees": number(shelter, r"避難者数\s*[:：]?\s*(?:\d[\d,]*世帯[^\d]{0,20})?(\d[\d,]*)人"),
    }
    return figures


# ---- 八代市：資料PDFの「現在の状況等」から読む -------------------------------
def yatsushiro_summary(pdf_path):
    """総務企画対策部の被害状況報告ページを探して、その文字を返す。"""
    import fitz

    document = fitz.open(pdf_path)
    for page in document:
        text = page.get_text()
        if "被害情報" in text and "避難所開設情報" in text:
            return text, page.number + 1, document.page_count
    return None, None, document.page_count


# 「（１）地震情報」「（３）避難所開設情報」…の見出しで区切る。PDFの段組みの
# 都合で改行が入るので、見出しごとにまとめ直さないと読める形にならない。
YATSUSHIRO_HEADS = re.compile(r"[（(][一二三四五六七八１-９1-9][）)]\s*([^\n（(]{2,20})")


def yatsushiro_sections(text):
    if not text:
        return []
    # 「□市長報告済（○月○日 ○：○）」は記入前のひな形。ここから後ろは中身がない
    body = re.split(r"[□\s]*市長報告済", text)[0]
    # 次第の番号だけの行と、ページ左端に出る見出しの断片を落とす
    drop = re.compile(r"^(?:[０-９0-9]{1,2}|現在の状況等|今後の対応|[０-９0-9]{1,2}\s*(?:現在の状況等|今後の対応))$")
    lines = [line.strip() for line in body.split("\n") if line.strip()]
    body = "\n".join(line for line in lines if not drop.match(line))
    marks = list(YATSUSHIRO_HEADS.finditer(body))
    if not marks:
        return [{"title": "現在の状況等", "text": body.strip()}]
    sections = []
    # 最初の見出しより前は「【7月28日 震度6強発生】被害状況報告 ○時点」の表題
    for order, mark in enumerate(marks):
        stop = marks[order + 1].start() if order + 1 < len(marks) else len(body)
        content = body[mark.end():stop].strip()
        title = mark.group(1).strip().rstrip("（(")
        if content:
            sections.append({"title": title, "text": content})
    return sections


def yatsushiro_figures(text):
    if not text:
        return {}
    body = normalize(text)
    return {
        "deaths": number(body, r"死亡\s*[:：]?\s*(\d[\d,]*)名"),
        "cardiacArrest": number(body, r"心肺停止\s*[:：]?\s*(\d[\d,]*)名"),
        "missing": number(body, r"安否不明者?\s*[:：]?\s*(\d[\d,]*)名"),
        # 人は「名」、住家は「件」「棟」。同じ「分類未確定」でも別の欄に入れる
        "injuredUnclassified": number(body, r"分類未確定\s*[:：]?\s*(\d[\d,]*)名"),
        "shelters": number(body, r"合計\s*(\d[\d,]*)か所を開設"),
        "evacuees": number(body, r"避難者数\s*[:：]?\s*(\d[\d,]*)名"),
        "evacueesPeak": number(body, r"最大避難者数\s*[:：]?\s*(\d[\d,]*)名"),
        # 住家被害は総数を据え置いたまま内訳だけが動く。総数と内訳を両方残す
        "homesReported": number(body, r"住家被害\s*[:：]?\s*(\d[\d,]*)件"),
        "homesFull": number(body, r"全壊\s*[:：]?\s*(\d[\d,]*)[件棟]"),
        "homesPartial": number(body, r"一部損壊\s*[:：]?\s*(\d[\d,]*)[件棟]"),
        "homesUnclassified": number(body, r"分類未確定\s*[:：]?\s*(\d[\d,]*)[件棟]"),
        "lifeline": number(body, r"ライフライン\s*(\d[\d,]*)件"),
    }


def main():
    if not INDEX.exists():
        sys.exit("先に node tools/fetch-municipality-hq.mjs を実行してください")
    index = json.loads(INDEX.read_text(encoding="utf-8"))
    TEXT_DIR.mkdir(parents=True, exist_ok=True)

    output = []
    for municipality in index["municipalities"]:
        meetings, missing = [], []
        # 1回が2ファイルに分かれることがあるので、回ごとにまとめる
        by_meeting = {}
        for item in municipality["meetings"]:
            by_meeting.setdefault(item["meeting"], []).append(item)

        for number_of, items in sorted(by_meeting.items()):
            head = items[0]
            record = {
                "meeting": number_of,
                "date": head.get("date"),
                "time": head.get("time"),
                "venue": head.get("venue"),
                "documents": [{"label": item["label"], "url": item["url"]} for item in items],
            }
            if municipality["source"] == "html":
                sections = head.get("sections") or []
                record["sections"] = sections
                record["figures"] = kumamoto_figures(sections) if sections else {}
                if not sections:
                    missing.append(number_of)
            else:
                cache = TEXT_DIR / f"{municipality['key']}-{number_of:03d}.json"
                pdf = PDF_DIR / head["file"]
                if pdf.exists():
                    text, page, pages = yatsushiro_summary(pdf)
                    cache.write_text(json.dumps(
                        {"meeting": number_of, "page": page, "pages": pages, "text": text},
                        ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
                if not cache.exists():
                    missing.append(number_of)
                    record["sections"], record["figures"] = [], {}
                else:
                    saved = json.loads(cache.read_text(encoding="utf-8"))
                    record["sourcePage"] = saved.get("page")
                    record["pages"] = saved.get("pages")
                    record["sections"] = yatsushiro_sections(saved.get("text"))
                    record["figures"] = yatsushiro_figures(saved.get("text"))
            record["figures"] = {key: value for key, value in record["figures"].items() if value is not None}
            meetings.append(record)

        output.append({
            "key": municipality["key"], "name": municipality["name"], "page": municipality["page"],
            "source": municipality["source"],
            "indexUrl": municipality["indexUrl"], "indexTitle": municipality["indexTitle"],
            "department": municipality["department"], "documentKind": municipality["documentKind"],
            "note": municipality["note"],
            "meetings": meetings,
            "withoutText": missing,
        })
        filled = sum(1 for m in meetings if m["figures"])
        print(f"{municipality['name']}: {len(meetings)}回（数値を取れた回 {filled} / 本文なし {len(missing)}）")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        "// 市町村の災害対策本部会議資料（生成物・直接編集しない）\n"
        "// tools/fetch-municipality-hq.mjs → tools/build-municipality-hq.py で作る\n"
        "window.MUNICIPALITY_HQ = " + json.dumps({
            "schemaVersion": "1.0.0",
            "retrievedAt": index["retrievedAt"],
            "disasterDate": index["disasterDate"],
            "municipalities": output,
        }, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    print(f"→ {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
