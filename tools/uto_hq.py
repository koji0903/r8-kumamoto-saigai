"""宇土市PDF全ページを保存。日時は表紙、避難者数は総務部の一覧表から読む。"""
import json
import re
import unicodedata


def plain(text):
    return unicodedata.normalize('NFKC', text)


def cover_date(text, meeting):
    source = plain(text)
    match = re.search(rf'第\s*{meeting}\s*回\s+(?:令和\s*\d+\s*年\s*)?(\d+)\s*月\s*(\d+)\s*日[^\n]*?(?=第|\n|$)', source)
    if not match:
        raise ValueError(f'宇土市 第{meeting}回: 表紙の日時が読めません')
    clock = re.search(r'(\d{1,2})\s*:\s*(\d{2})', match[0])
    return {'date': f'2026-{int(match[1]):02}-{int(match[2]):02}',
            'time': f'{int(clock[1]):02}:{clock[2]}' if clock else None,
            'writtenReport': '書面報告' in match[0]}


def shelter_figures(text):
    """先頭の避難者一覧の合計行だけを使用。最新列を採用し前日比や施設行は読まない。"""
    source = plain(text)
    if '避難者数一覧' not in source:
        return {}, None
    head = source.split('避難者数一覧', 1)[1].split('福祉センター', 1)[0]
    rows = []
    for line in head.splitlines():
        # 補注を除き、5〜7列の整数だけが並ぶ行を採用する。
        line = re.sub(r'（[^）]*）|\([^)]*\)', '', line).strip()
        if re.fullmatch(r'\d+(?:\s+\d+){4,6}', line):
            rows.append([int(n) for n in line.split()])
    if len(rows) != 2:
        raise ValueError('宇土市: 避難者一覧の合計2行が読めません')
    times = re.findall(r'\b\d{1,2}:\d{2}\b', head)
    return {'households': rows[0][-1], 'evacuees': rows[1][-1]}, times[-1] if times else None


def read_uto(meeting, items, pdf_dir, text_dir):
    cache = text_dir / f'uto-{meeting:03}.json'
    pdf = pdf_dir / items[0]['file']
    if pdf.exists():
        import fitz
        with fitz.open(pdf) as document:
            pages = [{'page': i+1, 'text': p.get_text(sort=True)} for i,p in enumerate(document)]
        if any(not page['text'].strip() for page in pages):
            raise ValueError(f'宇土市 第{meeting}回: 読み取れないページがあります')
        saved = {'meeting': meeting, 'url': items[0]['url'], 'pages': pages}
        cache.write_text(json.dumps(saved, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    else:
        saved = json.loads(cache.read_text(encoding='utf-8'))
    if saved['url'] != items[0]['url']:
        raise ValueError(f'宇土市 第{meeting}回: PDF URLが変更されています。再取得してください')
    pages = saved['pages']
    when = cover_date(pages[0]['text'], meeting)
    figures, time = shelter_figures(pages[1]['text'])
    damage, damage_page = damage_figures(pages, when['date'])
    figures.update(damage)
    sections = []
    department = '会議日時'
    for page in pages:
        lines = [line.strip() for line in page['text'].splitlines() if line.strip()]
        if page['page'] > 1:
            first = re.sub(r'\s', '', lines[0])
            if first.endswith(('部', '事務局', '班', '（ボランティアセンター）')):
                department = first
        sections.append({'title': f'{department}（PDF p.{page["page"]}）', 'text': page['text'], 'page': page['page']})
    return {**when, 'sections': sections, 'figures': figures, 'pages': len(pages),
            'fullText': True, 'damageSourcePage': damage_page, 'damageAsOf': when['date']+' 13:00' if damage else None, 'figureAsOf': f'{when["date"]} {time or "時刻記載なし"}', 'figureSourcePage': 2}


def damage_figures(pages, date):
    """日付列を持つ被害報告だけを読む。将来日の0や未入力欄は採用しない。"""
    target = f'{int(date[5:7])}/{int(date[8:])}'
    for page in pages:
        text = plain(page['text'])
        header = re.search(r'物的被害\(住家\)\s*([^\n]+)', text)
        if not header:
            continue
        dates = re.findall(r'\d{1,2}/\d{1,2}', header[1])
        if target not in dates:
            raise ValueError('被害報告の集計日が会議日と一致しません')
        column = dates.index(target)
        block = text[header.end():].split('税務課',1)[0]
        result = {}
        for label,key in [('全壊','utoHomesFull'),('大規模半壊','utoHomesLargeHalf'),('半壊(中規模半壊含)','utoHomesHalf'),('一部損壊(準半壊含)','utoHomesPartial'),('分類未確定','utoHomesUnclassified'),('合計','utoHomesTotal')]:
            row = re.search(r'^\s*'+re.escape(label)+r'\s+([\d,\s]+)$', block, re.M)
            if not row:
                raise ValueError(f'被害報告に{label}の数値行がありません')
            values = re.findall(r'\d[\d,]*',row[1])
            if column >= len(values):
                raise ValueError(f'被害報告の{label}に当日列がありません')
            result[key] = int(values[column].replace(',',''))
        return result, page['page']
    return {}, None
