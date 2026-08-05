#!/usr/bin/env python3
# 熊本県災害対策本部会議「人的被害等の状況」PDF から市町村別データを取り出す。
#
#   python3 tools/build-hq-damage.py
#
# 前提: tools/fetch-hq.mjs を先に実行して sources/official/hq/*.pdf を揃えておく。
# 依存: PyMuPDF（pip install pymupdf）。サイト本体には依存パッケージはなく、
#       この抽出工程だけがPDFの表を読むために必要とする。
#
# 生成物
#   sources/official/hq-damage/*.json  抽出結果の保存（コミットする）
#   data/generated/hq-damage-data.js       サイトが読むデータ（生成物・直接編集しない）
#
# 列構成は日によって変わる（初期は停電列があり住家被害は1列、8/1以降は住家被害が
# 内訳に分かれ停電列が消える）。そのためヘッダー行のラベルから毎回対応づける。

import json, re, sys, unicodedata
from pathlib import Path

try:
    import fitz  # PyMuPDF
except ImportError:
    sys.exit("PyMuPDF が必要です:  pip install pymupdf")

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "sources/official/hq-index.json"
PDF_DIR = ROOT / "sources/official/hq"
ARCHIVE = ROOT / "sources/official/hq-damage"
OUT = ROOT / "data/generated/hq-damage-data.js"
OUT_LATEST = ROOT / "data/generated/hq-latest.js"

# 45市町村。PDFの行順そのまま（県北→阿蘇→上益城→県南→天草）。
MUNICIPALITIES = [
    "熊本市","宇土市","宇城市","美里町","荒尾市","玉名市","玉東町","南関町","長洲町","和水町",
    "山鹿市","菊池市","合志市","大津町","菊陽町","阿蘇市","南小国町","小国町","産山村","高森町",
    "西原村","南阿蘇村","御船町","嘉島町","益城町","甲佐町","山都町","八代市","氷川町","水俣市",
    "芦北町","津奈木町","人吉市","錦町","多良木町","湯前町","水上村","相良村","五木村","山江村",
    "球磨村","あさぎり町","上天草市","天草市","苓北町",
]
# 市町村以外の行。合計に含まれるが市町村には割り当てられない人数がここに入る。
TOTAL_ROW, COUNT_ROW = "合計", "該当市町村数"
EXTRA_ROWS = ("身元不明", "災害と関連する可能性がある死亡(※)", "災害との関連調査中")
SPECIAL_ROWS = (TOTAL_ROW, COUNT_ROW) + EXTRA_ROWS

# (区分, 見出し) → サイト内のキー。区分が変わっても同じ意味なら同じキーに寄せる。
FIELDS = {
    "避難所": "shelters", "避難者": "evacuees",
    "軽傷": "injuredMinor", "軽症": "injuredMinor",
    "中等症": "injuredModerate", "重症": "injuredSevere",
    "心肺停止": "cardiacArrest", "死亡": "deaths",
    "全壊": "homesFull", "大規模半壊": "homesLargeHalf", "半壊": "homesHalf",
    # 資料によって「一部破損」「一部損壊」、「軽傷」「軽症」と表記が揺れる
    "一部破損": "homesPartial", "一部損壊": "homesPartial", "計": "homesTotal",
}
FIELD_ORDER = [
    "shelters", "evacuees",
    "injuredMinor", "injuredModerate", "injuredSevere", "cardiacArrest", "deaths", "casualtyUnclassified",
    "homesFull", "homesLargeHalf", "homesHalf", "homesPartial", "homesUnclassified", "homesTotal",
    "outages", "waterOutages", "waterStations",
]


def clean(s):
    return unicodedata.normalize("NFKC", (s or "")).replace("\n", "").replace(" ", "").strip()


def to_int(s):
    s = clean(s).replace(",", "")
    return int(s) if re.fullmatch(r"-?\d+", s) else None


def column_key(section, label):
    """区分見出しと列見出しから、サイト内のキーを決める。"""
    section, label = clean(section), clean(label)
    if "備考" in (section + label):
        return None
    if "停電" in section and not label:
        return "outages"
    if "断水" in section and not label:
        return "waterOutages"
    if "給水所" in section and not label:
        return "waterStations"
    if "住家被害" in section and not label:
        return "homesTotal"  # 初期は内訳がなく1列だけ
    if label == "分類未確定":
        # 「分類未確定」は人的被害と住家被害の両方にある。区分で見分ける。
        return "homesUnclassified" if "住家被害" in section else "casualtyUnclassified"
    return FIELDS.get(label)


def parse_asof(title):
    """『（８月４日１４：００時点）』→ ('2026-08-04', '14:00')"""
    t = unicodedata.normalize("NFKC", title).replace(" ", "")
    m = re.search(r"(\d{1,2})月(\d{1,2})日(\d{1,2})[:：](\d{2})", t)
    if not m:
        raise ValueError(f"時点を読み取れません: {title}")
    month, day, hour, minute = (int(x) for x in m.groups())
    return f"2026-{month:02d}-{day:02d}", f"{hour:02d}:{minute:02d}"


def parse_damage(pdf_path):
    doc = fitz.open(pdf_path)
    page = doc[0]
    # タイトルは必ずしも1行目に来ない（PDFによって描画順が違う）ので本文から探す
    text = page.get_text()
    title = next((ln.strip() for ln in text.split("\n") if "人的被害等の状況" in ln), "")
    if not title:
        raise ValueError(f"表題を見つけられません: {pdf_path.name}")
    date, time = parse_asof(title)

    tables = page.find_tables().tables
    if not tables:
        raise ValueError(f"表を検出できません: {pdf_path.name}")
    grid = tables[0].extract()

    # 1行目=区分（結合セルのぶん None が続く）、2行目=列見出し
    sections, carry = [], ""
    for cell in grid[0]:
        if cell:
            carry = cell
        sections.append(carry)
    labels = grid[1] if len(grid) > 1 else [None] * len(sections)

    keys = [None]  # 先頭列は市町村名
    for i in range(1, len(sections)):
        keys.append(column_key(sections[i], labels[i] if i < len(labels) else None))

    # 「不明」「不明（２名）」のように数値でないセルがある。落とさず注記として残す。
    rows, extra, notes = {}, {}, {}
    for row in grid:
        name = clean(row[0])
        if name not in MUNICIPALITIES and name not in SPECIAL_ROWS:
            continue
        values = {}
        for i, key in enumerate(keys):
            if not key or i >= len(row):
                continue
            v = to_int(row[i])
            if v is not None:
                values[key] = v
            elif clean(row[i]) not in ("", "―", "-"):
                notes.setdefault(name, {})[key] = clean(row[i])
        (rows if name in MUNICIPALITIES else extra)[name] = values

    # 2ページ目の罹災証明・住家被害認定調査の日程（ある回だけ）
    certification = {}
    if len(doc) > 1:
        for t in doc[1].find_tables().tables:
            for row in t.extract():
                name = clean(row[0])
                if name in MUNICIPALITIES and len(row) >= 3:
                    window, survey = clean(row[1]), clean(row[2])
                    if window or survey:
                        certification[name] = {"window": window or None, "survey": survey or None}

    return {
        "title": title, "date": date, "time": time,
        "columns": [k for k in dict.fromkeys(k for k in keys if k)],
        "municipalities": rows, "totals": extra.get(TOTAL_ROW, {}),
        "affectedCounts": extra.get(COUNT_ROW, {}),
        "extraRows": {k: v for k, v in extra.items() if k in EXTRA_ROWS and v},
        "notes": notes,
        "certification": certification,
    }


def verify(snap):
    """合計行と内訳の突き合わせ。ずれたら黙って通さない。

    合計には市町村に割り当てられない行（身元不明・災害との関連調査中など）が
    加算されるため、それらも足したうえで比較する。「不明」のように数値でない
    セルがあった列は数の上で照合できないので、注記つきで検算を見送る。
    """
    problems, skipped = [], []
    noted = {key for fields in snap["notes"].values() for key in fields}
    for key in snap["columns"]:
        total = snap["totals"].get(key)
        if total is None:
            continue
        if key in noted:
            skipped.append(key)
            continue
        summed = sum(m.get(key, 0) for m in snap["municipalities"].values()) \
            + sum(r.get(key, 0) for r in snap["extraRows"].values())
        if summed != total:
            problems.append(f"{key}: 内訳合計{summed} ≠ 資料の合計{total}")
    for name, m in snap["municipalities"].items():
        parts = ["homesFull", "homesLargeHalf", "homesHalf", "homesPartial", "homesUnclassified"]
        if "homesTotal" in m and any(p in m for p in parts):
            s = sum(m.get(p, 0) for p in parts)
            if s != m["homesTotal"]:
                problems.append(f"{name} 住家被害: 内訳{s} ≠ 計{m['homesTotal']}")
    return problems, skipped


def main():
    index = json.loads(INDEX.read_text(encoding="utf-8"))
    ARCHIVE.mkdir(parents=True, exist_ok=True)

    snapshots, warnings, notices = [], [], []
    for meeting in index["meetings"]:
        for doc in meeting["documents"]:
            if "人的被害等の状況" not in doc["title"]:
                continue
            path = PDF_DIR / doc["file"]
            if not path.exists():
                sys.exit(f"PDFがありません: {path}\n先に  node tools/fetch-hq.mjs  を実行してください。")
            snap = parse_damage(path)
            snap.update(meeting=meeting["meeting"], govMeeting=meeting["govMeeting"],
                        sourceUrl=doc["url"], file=doc["file"])
            problems, skipped = verify(snap)
            if problems:
                warnings.append((snap["date"], snap["time"], problems))
            if skipped:
                notices.append((snap["date"], snap["time"], skipped))
            snapshots.append(snap)
            (ARCHIVE / f"{snap['date'].replace('-','')}-{snap['time'].replace(':','')}.json").write_text(
                json.dumps(snap, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    snapshots.sort(key=lambda s: (s["date"], s["time"]))
    if not snapshots:
        sys.exit("「人的被害等の状況」の資料が1件も見つかりませんでした。")

    for date, time, skipped in notices:
        print(f"・{date} {time}: {'、'.join(skipped)} は「不明」表記のセルがあるため検算を省略")
    for date, time, problems in warnings:
        print(f"⚠ {date} {time}", *(f"    {p}" for p in problems), sep="\n")

    latest = snapshots[-1]
    # 罹災証明の日程は毎回付いてくるわけではないので、最後に載っていた回のものを使う
    cert_source = next((s for s in reversed(snapshots) if s["certification"]), None)

    body = {
        "metadata": {
            "source": index["source"],
            "sourceName": "熊本県 災害対策本部会議",
            "generatedFrom": "sources/official/hq/*.pdf",
            "latest": {"date": latest["date"], "time": latest["time"],
                       "meeting": latest["meeting"], "govMeeting": latest["govMeeting"],
                       "url": latest["sourceUrl"]},
            "certificationAsOf": {"date": cert_source["date"], "time": cert_source["time"],
                                  "url": cert_source["sourceUrl"]} if cert_source else None,
        },
        "fieldOrder": FIELD_ORDER,
        "municipalityOrder": MUNICIPALITIES,
        "certification": cert_source["certification"] if cert_source else {},
        "snapshots": [
            {k: s[k] for k in ("date", "time", "meeting", "govMeeting", "sourceUrl",
                               "columns", "municipalities", "totals", "affectedCounts",
                               "extraRows", "notes")}
            for s in snapshots
        ],
    }

    OUT.write_text(
        "// 熊本県災害対策本部会議「人的被害等の状況」から生成。直接編集しない。\n"
        "// 生成: node tools/fetch-hq.mjs && python3 tools/build-hq-damage.py\n"
        "window.HQ_DAMAGE = " + json.dumps(body, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8")

    # 全ページのヘッダー（最終更新）が使う最小限の情報。数十バイトなので全ページで読む。
    OUT_LATEST.write_text(
        "// 生成物・直接編集しない。生成: python3 tools/build-hq-damage.py\n"
        "window.HQ_LATEST = " + json.dumps(body["metadata"]["latest"], ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8")

    print(f"スナップショット {len(snapshots)}件（{snapshots[0]['date']} {snapshots[0]['time']} 〜 {latest['date']} {latest['time']}）")
    print(f"  → {OUT.name}  ({OUT.stat().st_size // 1024}KB)")
    print(f"  → {OUT_LATEST.name}")
    print(f"  → {ARCHIVE.relative_to(ROOT)}/*.json")
    if warnings:
        print(f"⚠ 検算の不一致が {len(warnings)}件あります。上の内容を確認してください。")
    else:
        print("  検算OK（各列の内訳合計と資料の合計行が一致）")


if __name__ == "__main__":
    main()
