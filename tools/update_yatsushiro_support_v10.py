#!/usr/bin/env python3
"""第10版の構造化カタログと重要変更を公開ページへ反映する。"""
from pathlib import Path

PAGE = Path("yatsushiro-support.html")
PDF = "https://www.city.yatsushiro.lg.jp/kiji00326858/3_26858_162529_up_cabdrsb4.pdf"
SOURCE = "https://www.city.yatsushiro.lg.jp/kiji00326858/index.html"

def replace_between(text, start, end, replacement):
    left = text.index(start)
    right = text.index(end, left)
    return text[:left] + replacement + text[right:]

html = PAGE.read_text(encoding="utf-8")

hero = f'''<section class="ys-hero"><div class="ys-shell"><p class="ys-kicker">八代市｜令和8年熊本地震</p><h1>被災者応援ガイド<span>第10版・全59制度</span></h1><p class="ys-lead">八代市「被災者応援ガイドブック第10版」74ページ・全59制度を、公式PDFに基づき対象、支援内容、期限、注意事項、窓口まで整理しました。掲載基準日は2026年11月18日です。</p><div class="ys-actions"><a href="{PDF}" target="_blank" rel="noopener" style="background:#103b4f;color:#fff;font-weight:700;">公式第10版PDF ↗</a><a href="#updates">第10版の変更点</a><a href="#deadlines">期限を見る</a><a href="#catalog">全59制度</a><a href="yatsushiro-living-support.html">暮らしの支援ガイド →</a></div></div></section>'''
html = replace_between(html, '<section class="ys-hero">', '<aside class="ys-source">', hero)

source = f'''<aside class="ys-source"><div class="ys-shell"><div><b>公式第10版</b><span>2026年11月18日現在</span></div><p>八代市公式の最新版PDFを全74ページ確認し、全59制度を掲載しています。制度は今後も変更されるため、申請・契約・解体・修理代の支払い前に、必ず<a href="{SOURCE}" target="_blank" rel="noopener">八代市の公式掲載ページ</a>と担当窓口で最新状況を確認してください。</p></div></aside>'''
html = replace_between(html, '<aside class="ys-source">', '<section class="ys-now">', source)

updates = '''<section class="ys-update-banner" id="updates"><div class="ys-shell"><header class="ys-update-header"><span class="ys-update-tag">11月18日更新</span><h2 class="ys-update-title">第10版で確認した主な変更</h2></header><div class="ys-update-grid"><article class="ys-update-card urgent"><h4><span class="ys-badge-up">期限更新</span>住家の緊急修理</h4><p>申込書は<b>11月30日</b>、完了報告は<b>12月27日</b>まで。上限5万6,400円を市から修理業者へ直接支払います。</p></article><article class="ys-update-card"><h4><span class="ys-badge-up">期間延長</span>医療・介護・障害福祉利用料の免除</h4><p>住家の全半壊等の要件に該当する方の免除期間が<b>2027年2月利用分まで</b>に更新されました。</p></article><article class="ys-update-card"><h4><span class="ys-badge-up">募集</span>建設型応急住宅</h4><p>大還児童公園、龍峯やまびこ公園、西宮町の各仮設団地について、<b>11月16日〜27日</b>に受付。先着順ではありません。</p></article><article class="ys-update-card"><h4><span class="ys-badge-up">期間延長</span>建築士相談</h4><p>対面相談は12月10日・24日を追加。無料電話相談と現地相談は<b>12月25日まで</b>に延長されました。</p></article><article class="ys-update-card"><h4><span class="ys-badge-new">新規</span>要配慮世帯への給水支援</h4><p>水の確保・受取りが困難な避難行動要支援者または75歳以上のみの世帯へ、状況確認のうえ個別給水を行います。</p></article><article class="ys-update-card"><h4><span class="ys-badge-new">新規</span>被災農業者向け緊急支援資金</h4><p>運転資金は最大1,000万円、農業近代化資金は個人1,800万円・法人2億円まで、利子補給により実質無利子です。</p></article><article class="ys-update-card"><h4><span class="ys-badge-new">追加</span>雇用・商店街支援</h4><p>在籍型出向を支える産業雇用安定助成金と、被災商店街等のにぎわい創出事業が追加されています。</p></article><article class="ys-update-card"><h4><span class="ys-badge-up">制度構成変更</span>終了・統合された旧掲載を除外</h4><p>第10版に掲載されていない水の配達、行政書士申請支援、学用品配付、緊急小口資金、水道料金免除等は一覧から除外し、現在の59制度へ差し替えました。</p></article></div></div></section>'''
insert_at = html.index('<section class="ys-now">')
html = html[:insert_at] + updates + html[insert_at:]

deadlines = '''<section class="ys-deadlines" id="deadlines"><div class="ys-shell"><header><p class="ys-kicker">DEADLINES</p><h2>第10版で確認できる主な期限</h2><p>2026年11月18日現在の公式PDF記載です。締切前でも受付状況を担当窓口へ確認してください。</p></header><div class="ys-deadline-grid"><article class="urgent"><time datetime="2026-11-26">11月26日</time><h3>商店街にぎわい創出事業</h3><p>被災商店街等のイベント等を上限100万円で補助。</p></article><article class="urgent"><time datetime="2026-11-30">11月30日</time><h3>住家の緊急修理・井戸原因調査・日弁連相談</h3><p>緊急修理の申込、被災井戸の原因調査、日弁連無料電話相談の期限です。</p></article><article><time datetime="2026-12-10">12月10日・24日</time><h3>建築士による被災住宅相談会</h3><p>市役所1階で9〜12時、13〜16時。事前申込不要・当日先着順。</p></article><article class="urgent"><time datetime="2026-12-15">12月15日</time><h3>持続化補助金 第2次公募</h3><p>直接被害上限200万円、間接被害上限100万円。早めに商工会議所・商工会へ相談してください。</p></article><article><time datetime="2026-12-25">12月25日</time><h3>建築士の無料電話・現地相談</h3><p>平日9〜12時、13〜16時。050-8882-5924。</p></article><article class="urgent"><time datetime="2026-12-27">12月27日</time><h3>住家の緊急修理 完了報告</h3><p>修理業者から工事完了報告書、施工前後写真、請求書を提出。</p></article><article><time datetime="2026-12-28">12月28日</time><h3>農業用機械・施設等復旧支援</h3><p>要望調査の受付期限。営農再開ワンストップ相談窓口へ提出。</p></article><article><time datetime="2027-01-29">1月29日・31日</time><h3>り災・被災証明</h3><p>り災証明の窓口は1月29日16時、オンラインは1月31日16時。被災証明の窓口は3月31日まで。</p></article><article><time datetime="2027-02-01">2027年2月1日</time><h3>災害援護資金</h3><p>所得要件のある貸付。上限150万〜350万円。</p><a href="yatsushiro-loan.html">貸付ガイド・診断 →</a></article><article><time datetime="2027-02-28">2027年2月利用分まで</time><h3>医療・介護等利用料の免除</h3><p>食費・居住費等は対象外。利用先窓口で該当する旨を申告します。</p></article><article><time datetime="2027-03-31">2027年3月31日</time><h3>レンタカー・税減免・解体等</h3><p>制度ごとに要件と申請先が異なります。各制度カードで確認してください。</p></article></div></div></section>'''
html = replace_between(html, '<section class="ys-deadlines"', '<section class="ys-key"', deadlines)

catalog = Path("tools/generated_catalog.html").read_text(encoding="utf-8")
html = replace_between(html, '<div class="ys-catalog-grid" id="ysCatalog">', '<p id="ysNoResult"', catalog + '<p id="ysNoResult"')

replacements = {
    '第8版アーカイブ': '第10版',
    '第8版': '第10版',
    '第9版（2026年10月28日時点）': '第10版（2026年11月18日時点）',
    '2026年10月9日時点': '2026年11月18日時点',
    '2026年10月9日現在': '2026年11月18日現在',
    '全58制度': '全59制度',
    '58制度': '59制度',
    'ALL 58 PROGRAMS': 'ALL 59 PROGRAMS',
    '65ページ': '74ページ',
    '2026年11月利用分まで': '2027年2月利用分まで',
    '10月27日までの完了報告': '11月30日までの申込と12月27日までの完了報告',
    '完了報告期限は10月27日': '申込期限は11月30日、完了報告期限は12月27日',
    '八代市の被災者応援ガイドブック第10版全59制度を整理した2026年11月18日時点のアーカイブ。公式掲載ページは第9版へ更新済みのため、現在の金額・期限・受付状況は八代市公式情報で確認してください。': '八代市公式「被災者応援ガイドブック」第10版（2026年11月18日現在）の全59制度を整理。対象、支援内容、申請期限、注意事項、担当窓口を一次資料に基づき確認できます。',
    '災害援護資金・緊急小口資金': '災害援護資金',
    '災害援護資金は世帯主の負傷や住居・家財の一定以上の損害があり、所得基準以内の世帯。緊急小口資金は災害で当面の生活費を必要とする世帯です。': '世帯主の負傷や住居・家財の一定以上の損害があり、所得基準以内の世帯が対象です。',
    '災害援護資金は150万〜350万円、年利1％で保証人ありは無利子。緊急小口資金は原則10万円、一定事情がある場合20万円まで、無利子です。': '貸付限度額は150万〜350万円、年利1％で、保証人を立てる場合は無利子です。',
    '<li>どちらも給付ではなく返済が必要です。</li>': '<li>給付ではなく返済が必要です。</li>',
    '<li>緊急小口資金は社会福祉協議会へ相談し、同一世帯の重複貸付はできません。</li>': '',
}
for old,new in replacements.items():
    html = html.replace(old,new)

PAGE.write_text(html, encoding="utf-8")

js_path = Path("yatsushiro-support.js")
js = js_path.read_text(encoding="utf-8")
js = js.replace('完了報告期限は10月27日', '申込期限は11月30日、完了報告期限は12月27日')
js = js.replace('この結果は第8版に基づく初期確認です。', 'この結果は第10版に基づく初期確認です。')
js_path.write_text(js, encoding="utf-8")

print("yatsushiro-support.html を第10版・全59制度へ更新しました")
