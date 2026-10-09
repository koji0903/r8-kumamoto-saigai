#!/usr/bin/env python3
"""yatsushiro-support.html を第8版（2026年10月9日発行）に更新するスクリプト"""
import re

PDF_URL = "https://www.city.yatsushiro.lg.jp/kiji00326858/3_26858_161072_up_eh14ogek.pdf"

with open('yatsushiro-support.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update Head / Meta / OGP
html = html.replace('第7版全54制度', '第8版全58制度')
html = html.replace('yatsushiro-support.css?v=20260921-1', 'yatsushiro-support.css?v=20261009-1')
html = html.replace('yatsushiro-support.js?v=20260921-1', 'yatsushiro-support.js?v=20261009-1')

# 2. Update Hero & Lead
html = html.replace(
    '八代市「被災者応援ガイドブック第7版」62ページ・全54制度を読み解き、対象、金額、期限、必要書類、相談先を判断しやすい順番に整理しました。',
    '八代市「被災者応援ガイドブック第8版」65ページ・全58制度を読み解き、対象、金額、期限、必要書類、相談先を判断しやすい順番に整理しました。'
)
html = html.replace(
    '<a href="#updates">第7版の更新点</a>',
    '<a href="#updates">第8版の更新点</a>'
)
html = html.replace('54制度の一覧', '58制度の一覧')
html = html.replace('160146_up_l7vhrdbl.pdf', '161072_up_eh14ogek.pdf')

# 3. Update Source bar
html = html.replace('<b>第7版</b><span>2026年9月21日現在</span>', '<b>第8版</b><span>2026年10月9日現在</span>')

# 4. Update Banner
old_banner_pattern = r'<section class="ys-update-banner" id="updates">.*?</section>'
new_banner = '''<section class="ys-update-banner" id="updates"><div class="ys-shell"><header class="ys-update-header"><span class="ys-update-tag">10月9日更新</span><h2 class="ys-update-title">第8版での主な更新内容・新規制度（令和8年10月9日改定）</h2></header><div class="ys-update-grid"><article class="ys-update-card"><h4><span class="ys-badge-new">新規</span>くまもと事業者再出発支援補助金（受付開始）</h4><p>被災した中小企業等の事業用施設・設備・車両等の復旧費を補助。<b>補助率3/4・上限3億円</b>（中堅1/2）。八代商工会議所（32-6191）・八代市商工会（52-8111）で書類作成支援を受付中。（受付センター 096-284-7660）</p></article><article class="ys-update-card urgent"><h4><span class="ys-badge-new">新規</span>小規模事業者持続化補助金＜災害支援枠＞（10/16締切）</h4><p>小規模事業者の機械復旧・修繕・販路開拓等。<b>直接被害最大200万円、間接被害最大100万円</b>（補助率2/3）。<b>第1次公募締切：10月16日（金）</b>。八代商工会議所・八代市商工会へお早めにご相談ください。</p></article><article class="ys-update-card"><h4><span class="ys-badge-new">新規</span>中小企業者事業再建支援利子補給事業</h4><p>被災事業者の資金繰りを支援するため、災害関連融資（令和8年7月28日〜12月31日実行分）の<b>利子を3年間全額補給</b>（市独自事業。公庫は上限年20万円／商工政策課 33-8513）。</p></article><article class="ys-update-card"><h4><span class="ys-badge-up">受付開始</span>市県民税・固定資産税の減免受付が正式スタート</h4><p>第7版で準備中だった税減免が正式に受付開始。家屋損害割合等に応じ市県民税は全額〜一部減免、固定資産税も損害割合に応じ減免。窓口：市民税課（33-4107）・資産税課（33-4108）。</p></article><article class="ys-update-card"><h4><span class="ys-badge-new">新規</span>災害に関連する税証明書の手数料免除</h4><p>り災証明書の交付を受けた方が公的機関手続きに使用する場合、<b>所得課税証明書・資産証明書・納税証明書の交付手数料が免除</b>されます。（市民税課 33-4107）</p></article><article class="ys-update-card"><h4><span class="ys-badge-new">新規</span>令和8年熊本地震就学援助制度（小中学生）</h4><p>家屋被害（半壊以上等）や収入急減により就学困難となった世帯へ、<b>学用品費・給食費・通学費・修学旅行費・校外活動費等を実費援助</b>。在籍校経由で申請。（学校教育課 33-6133）</p></article><article class="ys-update-card"><h4><span class="ys-badge-new">新規開設</span>建築士による被災住宅相談会（毎週木曜・11月まで）</h4><p>毎週木曜（9〜12時／13〜16時）、市役所本庁舎1階会議室C横ホールで<b>建築士による住宅復旧・改修・建替え・耐震化の無料対面相談</b>を開設（事前申込不要・先着順／建築指導課 33-4750）。</p></article><article class="ys-update-card urgent"><h4><span class="ys-badge-up">提出期限</span>住家の緊急修理 完了報告期限（10月27日）</h4><p>屋根のブルーシート展張などの「住家の緊急修理」の完了報告提出期限は、<b>10月27日（火）まで</b>です。修理業者からの工事完了報告書の提出をお急ぎください。（建設政策課 33-4116）</p></article></div></div></section>'''

html = re.sub(old_banner_pattern, new_banner, html, flags=re.DOTALL)

# 5. Update Deadlines section
old_deadlines_pattern = r'<div class="ys-deadline-grid">.*?</div>(?=\s*</div></section>)'
new_deadlines = '''<div class="ys-deadline-grid"><article class="urgent"><time datetime="2026-10-16">10月16日</time><h3>小規模事業者持続化補助金</h3><p>一般型 災害支援枠の第1次公募締切。機械復旧・販路開拓等。直接被害最大200万円。</p><div style="margin-top:6px; display:flex; gap:8px; flex-wrap:wrap;"><a href="tel:0965326191">八代商工会議所 32-6191</a><a href="tel:0965528111">八代市商工会 52-8111</a></div></article><article class="urgent"><time datetime="2026-10-27">10月27日</time><h3>住家の緊急修理</h3><p>ブルーシート展張等の完了報告期限。上限5万6,400円。業者からの提出が必要です。</p><a href="tel:0965334116">建設政策課 33-4116</a></article><article><time datetime="2026-10-30">10月30日</time><h3>建築士の無料電話相談</h3><p>住宅の復旧・補修の電話相談と、必要に応じた現地対面相談。</p><a href="tel:05088825924">050-8882-5924</a></article><article><time datetime="2026-11-26">11月まで毎週木曜</time><h3>被災住宅対面相談会</h3><p>市役所1階ホール。建築士に対面で修理・建替え・耐震化を相談（事前予約不要・先着順）。</p><a href="tel:0965334750">建築指導課 33-4750</a></article><article><time datetime="2026-11-02">11月2日</time><h3>災害援護資金</h3><p>所得制限のある貸付。上限150万〜350万円。保証人で無利子。</p><div style="margin-top:6px; display:flex; gap:8px; flex-wrap:wrap;"><a href="yatsushiro-loan.html" style="font-weight:700;">貸付ガイド・診断 →</a><a href="tel:0965334003">健康福祉政策課 33-4003</a></div></article><article><time datetime="2026-11-30">11月30日</time><h3>日弁連の無料電話相談</h3><p>平日10〜12時・14〜16時。熊本地震の法的トラブル・手続相談。</p><a href="tel:0120254994">0120-254-994</a></article><article><time datetime="2026-12-25">12月25日</time><h3>災害サポート・レンタカー</h3><p>片付け・物資運搬等に軽トラ等を最長3日間無料貸出（カーシェアリング協会）。</p><a href="tel:05057994740">050-5799-4740</a></article><article><time datetime="2026-12-28">12月28日</time><h3>宅内配管工事紹介</h3><p>水道修繕に対応できる工事業者を紹介。井戸修理は対象外。</p><a href="tel:0120275557">0120-275-557</a></article><article><time datetime="2026-12-31">12月31日</time><h3>利子補給 対象融資実行</h3><p>市内中小企業向け災害融資の利子3年間全額補給。12/31までに実行された融資が対象。</p><a href="tel:0965338513">商工政策課 33-8513</a></article><article><time datetime="2027-03-31">2027年3月31日</time><h3>建物の解体・撤去</h3><p>公費解体・自費解体の申請受付。電話予約・Web予約受付中。</p><a href="tel:0965377550">専用ダイヤル 37-7550</a></article><article><time datetime="2027-03-31">2027年3月31日</time><h3>保険料等の減免</h3><p>死亡・重傷・行方不明・収入減等による申請受付期限。住家被害分は申請不要。</p></article><article><time datetime="2027-08-27">2027年8月27日</time><h3>生活再建支援金・基礎</h3><p>全壊・解体・長期避難・大規模半壊が主な対象。複数人世帯最大100万円。</p><div style="margin-top:6px;"><a href="yatsushiro-rebuild.html" style="font-weight:700;">支援金ガイド・支給額診断 →</a></div></article><article><time datetime="2029-08-27">2029年8月27日</time><h3>生活再建支援金・加算</h3><p>建設・購入（最大200万）、補修（最大100万）、賃借（最大50万）の再建方法に応じて支給。</p></article></div>'''

html = re.sub(old_deadlines_pattern, new_deadlines, html, flags=re.DOTALL)
html = html.replace('<p>第7版に記載された日付です。', '<p>第8版に記載された日付です。')

# 6. Update Key Support section (Add Saishuppatsu)
if 'id="saishuppatsu"' not in html:
    saishuppatsu_card = '''<article id="saishuppatsu"><div class="ys-card-head"><span>事業者</span><h3>くまもと事業者再出発支援補助金</h3></div><div class="ys-big"><strong>補助率 3/4 · 上限 3億円</strong><small>中堅企業は補助率 1/2（上限 3億円）</small></div><p>被災した中小企業・小規模事業者等の事業用施設・設備・車両等の復旧費を幅広く補助。交付決定前に着手した経費も一定要件で対象になります。</p><ul><li><b>補助対象：</b>事業用施設、生産機械、設備、車両等の復旧・修繕・再取得</li><li><b>申請受付：</b>令和8年10月1日より受付開始（月ごとに期間を区切って受付）</li><li>八代商工会議所（32-6191）・八代市商工会（52-8111）で書類作成支援を実施</li></ul><div style="margin-top:12px; display:flex; gap:12px; flex-wrap:wrap; align-items:center;"><a href="kumamoto-saishuppatsu.html" style="background:#235f7c; color:#fff; padding:6px 14px; border-radius:6px; font-size:13px; font-weight:900; text-decoration:none;">再出発支援補助金 特設ガイドを見る →</a><a href="tel:0962847660">受付センター 096-284-7660</a></div></article>
'''
    html = html.replace('</div></div></section>\n<section class="ys-eligibility"', saishuppatsu_card + '</div></div></section>\n<section class="ys-eligibility"')

# 7. Update Eligibility Details section
html = html.replace('第7版で特に条件の多い制度を、申請前に確認したい順に整理しました。', '第8版で特に条件の多い制度を、申請前に確認したい順に整理しました。')
html = html.replace('第7版では2026年11月利用分までです。', '第8版では2026年11月利用分までです。')
html = html.replace('第7版時点で検討中です。', '第8版で補助率9/10以内が確定しました。')
html = html.replace('第7版時点で受付準備中の制度があります。', '第8版で再出発補助金や持続化補助金が正式案内されました。')

# Add new details if not present
if '令和８年熊本地震就学援助制度' not in html:
    new_details = '''<details><summary><span>教育</span>令和８年熊本地震に伴う就学援助制度</summary><div class="ys-detail-body"><h3>活用できる方</h3><p>地震の影響で住宅被害（り災証明書で「全壊」「大規模半壊」「中規模半壊」「半壊」）を受けた世帯、主たる家計維持者が死亡した世帯、または休業・離職・売上減により家計が急変し困窮した世帯の小中学生の保護者。</p><h3>制度の内容</h3><p>学用品費等（小学校年額約1〜1.2万円、中学校年額約1.9〜2万円）、校外活動費、修学旅行費、学校給食費、通学費、医療費を実費支給・援助します。</p><h3>注意事項</h3><ul><li>在籍する八代市立小中学校を通じて申請します。</li><li>り災証明書の写しや収入減少が分かる書類等の提出が必要です。</li></ul><div style="margin-top:10px;"><a href="tel:0965336133">学校教育課 33-6133</a></div></div></details>
<details><summary><span>事業者</span>くまもと事業者再出発支援補助金・持続化補助金</summary><div class="ys-detail-body"><h3>活用できる方</h3><p>熊本県内に事業所を有し、地震で施設・設備・車両が被災した中小企業・小規模事業者・個人事業主、または売上が減少した小規模事業者。</p><h3>制度の内容</h3><p>①再出発支援補助金：事業用施設・設備・車両の復旧費を補助（中小3/4・上限3億円、中堅1/2）。②持続化補助金＜災害支援枠＞：小規模事業者の機械復旧・販路開拓等（直接被害上限200万円、間接被害上限100万円、補助率2/3）。③市利子補給事業：対象災害融資の利子を3年間全額補給。</p><h3>注意事項</h3><ul><li>持続化補助金＜災害支援枠＞の第1次公募締切は令和8年10月16日（金）です。</li><li>八代商工会議所（32-6191）・八代市商工会（52-8111）で申請計画書や書類作成支援を行っています。</li></ul><div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap;"><a href="kumamoto-saishuppatsu.html" style="font-weight:700;">再出発支援補助金 特設ガイド →</a><a href="tel:0962847660">受付センター 096-284-7660</a></div></div></details>
'''
    html = html.replace('<details><summary><span>税・保険</span>国保税・後期高齢者・介護保険料の減免</summary>', new_details + '<details><summary><span>税・保険</span>国保税・後期高齢者・介護・市県民税・固定資産税の減免</summary>')
    html = html.replace('<details><summary><span>税・保険</span>国保税・後期高齢者・介護保険料の減免</summary>', '<details><summary><span>税・保険</span>国保税・後期高齢者・介護・市県民税・固定資産税の減免</summary>')

# 8. Update Catalog section
html = html.replace('ALL 54 PROGRAMS', 'ALL 58 PROGRAMS')
html = html.replace('<h2>第7版の全54制度</h2>', '<h2>第8版の全58制度</h2>')

# Catalog HTML for all 58 items
catalog_html = f'''<div class="ys-catalog-grid" id="ysCatalog">
<article data-category="生活・相談"><h3>被災者対応 <span>10件</span></h3><ul>
<li><b><a href="{PDF_URL}#page=7" target="_blank" rel="noopener">災害相談窓口 <span class="ys-badge-up">更新</span><span class="ys-pdf-page">PDF 7ページ ↗</span></a></b><small>平日9〜17時、本庁1階会議室D。外国語22言語対応。10/18外国人相談会／33-4452</small></li>
<li><b><a href="{PDF_URL}#page=8" target="_blank" rel="noopener">災害ごみの受入れ <span class="ys-badge-up">更新</span><span class="ys-pdf-page">PDF 8ページ ↗</span></a></b><small>水処理センター西側（新港町3-1）仮置場、12月末まで。身分証、代理搬入は委任状／34-1997</small></li>
<li><b><a href="{PDF_URL}#page=9" target="_blank" rel="noopener">ホテル等への避難<span class="ys-pdf-page">PDF 9ページ ↗</span></a></b><small>宿泊費原則公費。食費・税・移動費等は自己負担／0120-325-327</small></li>
<li><b><a href="{PDF_URL}#page=10" target="_blank" rel="noopener">公衆浴場の無料入浴支援 <span class="ys-badge-up">更新</span><span class="ys-pdf-page">PDF 10ページ ↗</span></a></b><small>避難所生活または自宅浴室が被災した方。身分証・入浴用品を持参／33-4003</small></li>
<li><b><a href="{PDF_URL}#page=11" target="_blank" rel="noopener">災害ボランティアの派遣依頼 <span class="ys-badge-up">更新</span><span class="ys-pdf-page">PDF 11ページ ↗</span></a></b><small>住居内の片づけ、災害廃棄物の分別・搬出・運搬。鏡総合グラウンド拠点／社協</small></li>
<li><b><a href="{PDF_URL}#page=12" target="_blank" rel="noopener">災害サポート・レンタカーの貸出<span class="ys-pdf-page">PDF 12ページ ↗</span></a></b><small>被災者・支援団体へ軽トラ等を最長3日。12月25日まで／050-5799-4740</small></li>
<li><b><a href="{PDF_URL}#page=13" target="_blank" rel="noopener">（一社）八代青年会議所による水の配達サービス <span class="ys-badge-up">更新</span><span class="ys-pdf-page">PDF 13ページ ↗</span></a></b><small>断水・濁水で水を運べない世帯。八代市・氷川町限定／32-7063</small></li>
<li><b><a href="{PDF_URL}#page=14" target="_blank" rel="noopener">弁護士による無料法律相談<span class="ys-pdf-page">PDF 14ページ ↗</span></a></b><small>毎週木曜10〜12時（祝日除く）、市役所2階。予約不要、1組30分／33-4482</small></li>
<li><b><a href="{PDF_URL}#page=14" target="_blank" rel="noopener">日本弁護士連合会（日弁連）による無料電話相談<span class="ys-pdf-page">PDF 14ページ ↗</span></a></b><small>11月30日まで、平日10〜12時・14〜16時／0120-254-994</small></li>
<li><b><a href="{PDF_URL}#page=15" target="_blank" rel="noopener">司法書士による無料法律相談<span class="ys-pdf-page">PDF 15ページ ↗</span></a></b><small>毎週水曜13〜16時、市役所。予約不要／33-4482</small></li>
</ul></article>
<article data-category="税・保険"><h3>税・保険料 <span>4件</span></h3><ul>
<li><b><a href="{PDF_URL}#page=16" target="_blank" rel="noopener">国民健康保険税・後期高齢者医療保険料・介護保険料の減免<span class="ys-pdf-page">PDF 16ページ ↗</span></a></b><small>全壊は全部、半壊〜大規模半壊は2分の1。住家被害分は申請不要、収入減等は申請必要／33-4113</small></li>
<li><b><a href="{PDF_URL}#page=17" target="_blank" rel="noopener">市県民税の減免 <span class="ys-badge-up">受付開始</span><span class="ys-pdf-page">PDF 17ページ ↗</span></a></b><small>全壊10/10、大規模・中規模・半壊は所得に応じ減免。市民税課窓口（13番）／33-4107</small></li>
<li><b><a href="{PDF_URL}#page=19" target="_blank" rel="noopener">固定資産税の減免 <span class="ys-badge-up">受付開始</span><span class="ys-pdf-page">PDF 19ページ ↗</span></a></b><small>損害の程度に応じ税額減免。資産税課窓口（14番）／33-4108</small></li>
<li><b><a href="{PDF_URL}#page=20" target="_blank" rel="noopener">国民年金保険料の免除<span class="ys-pdf-page">PDF 20ページ ↗</span></a></b><small>住宅・家財等の被害額がおおむね2分の1以上の第1号被保険者／33-4105</small></li>
</ul></article>
<article data-category="証明"><h3>証明・手数料 <span>5件</span></h3><ul>
<li><b><a href="{PDF_URL}#page=21" target="_blank" rel="noopener">り災・被災証明書の発行<span class="ys-pdf-page">PDF 21ページ ↗</span></a></b><small>住家はり災証明、住家以外や家財は被災証明。本庁・各支所地域振興課／33-4107</small></li>
<li><b><a href="{PDF_URL}#page=22" target="_blank" rel="noopener">熊本県行政書士会による「り災証明書」無料申請支援<span class="ys-pdf-page">PDF 22ページ ↗</span></a></b><small>オンライン入力、書類・写真準備、事情により代理申請／096-237-7373</small></li>
<li><b><a href="{PDF_URL}#page=23" target="_blank" rel="noopener">住民票等の交付手数料の免除<span class="ys-pdf-page">PDF 23ページ ↗</span></a></b><small>災害手続き用。証明書、本人確認、用途確認書類。コンビニ交付は対象外／33-4110</small></li>
<li><b><a href="{PDF_URL}#page=24" target="_blank" rel="noopener">マイナンバーカードの再交付手数料の免除<span class="ys-pdf-page">PDF 24ページ ↗</span></a></b><small>7月28日以前に交付され、地震で紛失等した方／33-4110</small></li>
<li><b><a href="{PDF_URL}#page=25" target="_blank" rel="noopener">災害に関連する税証明書の手数料の免除 <span class="ys-badge-new">新規</span><span class="ys-pdf-page">PDF 25ページ ↗</span></a></b><small>り災証明受給者。所得課税・資産・納税証明書の交付手数料免除。市民税課／33-4107</small></li>
</ul></article>
<article data-category="生活・お金"><h3>経済・生活 <span>8件</span></h3><ul>
<li><b><a href="{PDF_URL}#page=26" target="_blank" rel="noopener">保険証等がなくても、介護サービスの利用や医療機関等を受診できます<span class="ys-pdf-page">PDF 26ページ ↗</span></a></b><small>氏名、生年月日、連絡先、住所等の申立てで利用可能</small></li>
<li><b><a href="{PDF_URL}#page=27" target="_blank" rel="noopener">医療保険の窓口負担、介護保険・障害福祉サービス利用料の免除<span class="ys-pdf-page">PDF 27ページ ↗</span></a></b><small>全半壊・床上浸水、生計維持者の死亡・重傷・失業等。11月利用分まで。食費・居住費は対象外</small></li>
<li><b><a href="{PDF_URL}#page=28" target="_blank" rel="noopener">被災した学用品を配付します<span class="ys-pdf-page">PDF 28ページ ↗</span></a></b><small>就学に支障のある小中学生。学校経由、1人1回／33-6133</small></li>
<li><b><a href="{PDF_URL}#page=29" target="_blank" rel="noopener">被災者生活再建支援制度<span class="ys-pdf-page">PDF 29ページ ↗</span></a></b><small>全壊・解体・長期避難・大規模半壊・中規模半壊。複数人世帯最大300万円／33-8722</small></li>
<li><b><a href="{PDF_URL}#page=31" target="_blank" rel="noopener">災害援護資金の貸付<span class="ys-pdf-page">PDF 31ページ ↗</span></a></b><a href="yatsushiro-loan.html" style="font-size:12px; font-weight:700; color:#235f7c; margin-left:6px;">【特設ガイド・診断】</a><small>所得制限あり、上限150万〜350万円、年1%・保証人ありは無利子。11/2締切／33-4003</small></li>
<li><b><a href="{PDF_URL}#page=33" target="_blank" rel="noopener">生活福祉資金（緊急小口資金）特例貸付 <span class="ys-badge-up">更新</span><span class="ys-pdf-page">PDF 33ページ ↗</span></a></b><small>原則10万円、一定世帯は20万円、無利子／社会福祉協議会 37-6001</small></li>
<li><b><a href="{PDF_URL}#page=34" target="_blank" rel="noopener">災害弔慰金・災害障がい見舞金・災害見舞金（重傷者）の支給<span class="ys-pdf-page">PDF 34ページ ↗</span></a></b><small>弔慰金250万/500万円、障がい125万/250万円、重傷3万/5万円／33-4003</small></li>
<li><b><a href="{PDF_URL}#page=35" target="_blank" rel="noopener">令和８年熊本地震に伴う就学援助制度のご案内 <span class="ys-badge-new">新規</span><span class="ys-pdf-page">PDF 35ページ ↗</span></a></b><small>半壊以上や収入急減世帯の小中学生。学用品費・給食費・修学旅行費・通学費等。在籍校経由／33-6133</small></li>
</ul></article>
<article data-category="公共料金"><h3>公共料金 <span>4件</span></h3><ul>
<li><b><a href="{PDF_URL}#page=36" target="_blank" rel="noopener">水道料金の免除<span class="ys-pdf-page">PDF 36ページ ↗</span></a></b><small>7・8月使用分を全額免除。申請不要</small></li>
<li><b><a href="{PDF_URL}#page=37" target="_blank" rel="noopener">ＮＨＫ受信料の免除<span class="ys-pdf-page">PDF 37ページ ↗</span></a></b><small>半壊・半焼以上、7〜12月の6か月。申請必要／0570-077-077</small></li>
<li><b><a href="{PDF_URL}#page=38" target="_blank" rel="noopener">九州電力の電気料金等の特別処置<span class="ys-pdf-page">PDF 38ページ ↗</span></a></b><small>支払期限延長、不使用月・基本料金・工事費等の免除。申請必要</small></li>
<li><b><a href="{PDF_URL}#page=39" target="_blank" rel="noopener">ＮＴＴ西日本の電話料金等の特別措置<span class="ys-pdf-page">PDF 39ページ ↗</span></a></b><small>基本料金等免除、支払期限1か月延長、仮住居移転工事費無料／0120-602776</small></li>
</ul></article>
<article data-category="住まい"><h3>住まい <span>12件</span></h3><ul>
<li><b><a href="{PDF_URL}#page=40" target="_blank" rel="noopener">建設型応急住宅（仮設住宅） <span class="ys-badge-up">更新</span><span class="ys-pdf-page">PDF 40ページ ↗</span></a></b><small>5要件すべてを確認、最長2年。一次募集終了・追加募集は別途案内／33-4122</small></li>
<li><b><a href="{PDF_URL}#page=42" target="_blank" rel="noopener">自宅敷地内への建設型応急住宅 <span class="ys-badge-up">更新</span><span class="ys-pdf-page">PDF 42ページ ↗</span></a></b><small>生業等の事情、敷地・搬入条件。募集は9月25日をもって終了／33-4122</small></li>
<li><b><a href="{PDF_URL}#page=43" target="_blank" rel="noopener">賃貸型応急住宅（みなし仮設住宅）<span class="ys-pdf-page">PDF 43ページ ↗</span></a></b><small>世帯人数別家賃上限、最長2年／33-4122</small></li>
<li><b><a href="{PDF_URL}#page=44" target="_blank" rel="noopener">住宅の応急修理 <span class="ys-badge-up">更新</span><span class="ys-pdf-page">PDF 44ページ ↗</span></a></b><small>最大75.7万円、準半壊36.7万円。市が業者へ直接支払い／33-4401</small></li>
<li><b><a href="{PDF_URL}#page=46" target="_blank" rel="noopener">住家の緊急修理（ブルーシート展張等）<span class="ys-pdf-page">PDF 46ページ ↗</span></a></b><small>準半壊相当以上、最大5万6,400円。完了報告期限が10月27日までに延長／33-4116</small></li>
<li><b><a href="{PDF_URL}#page=48" target="_blank" rel="noopener">合併処理浄化槽の補助<span class="ys-pdf-page">PDF 48ページ ↗</span></a></b><small>5人槽33.2万円、6〜7人槽41.4万円、8〜10人槽54.8万円。2027年1月末まで</small></li>
<li><b><a href="{PDF_URL}#page=49" target="_blank" rel="noopener">建築士による被災住宅相談会の開設について <span class="ys-badge-new">新規</span><span class="ys-pdf-page">PDF 49ページ ↗</span></a></b><small>毎週木曜（11月まで）9〜12時/13〜16時、市役所1階ホール。修理・建替え・耐震の対面相談／33-4750</small></li>
<li><b><a href="{PDF_URL}#page=50" target="_blank" rel="noopener">建築士による電話相談窓口の開設について<span class="ys-pdf-page">PDF 50ページ ↗</span></a></b><small>電話・必要に応じ現地相談。10月30日まで／050-8882-5924</small></li>
<li><b><a href="{PDF_URL}#page=51" target="_blank" rel="noopener">水道の宅内配管工事コールセンターの開設<span class="ys-pdf-page">PDF 51ページ ↗</span></a></b><small>工事業者紹介、12月28日まで／0120-275-557</small></li>
<li><b><a href="{PDF_URL}#page=52" target="_blank" rel="noopener">被災井戸に関する支援について<span class="ys-pdf-page">PDF 52ページ ↗</span></a></b><small>原因調査無料、修理最大75.7万円。上水道併用者等は対象外／33-8773 / 65-7722</small></li>
<li><b><a href="{PDF_URL}#page=53" target="_blank" rel="noopener">住宅金融支援機構による「災害復興住宅融資」（一般）<span class="ys-pdf-page">PDF 53ページ ↗</span></a></b><small>建設最大5,500万円、購入5,500万円、補修2,500万円。最長35年</small></li>
<li><b><a href="{PDF_URL}#page=55" target="_blank" rel="noopener">建物の解体・撤去について<span class="ys-pdf-page">PDF 55ページ ↗</span></a></b><small>半壊以上の損壊家屋等を公費解体・自費解体。9/28〜受付（事前予約制・2027年3月31日まで）／37-7550</small></li>
</ul></article>
<article data-category="農業・事業"><h3>農業・事業 <span>15件</span></h3><ul>
<li><b><a href="{PDF_URL}#page=56" target="_blank" rel="noopener">農地災害復旧事業<span class="ys-pdf-page">PDF 56ページ ↗</span></a></b><small>1か所40万円以上、営農農地。原則国50%・申請者50%／33-4118</small></li>
<li><b><a href="{PDF_URL}#page=57" target="_blank" rel="noopener">営農再開ワンストップ窓口<span class="ys-pdf-page">PDF 57ページ ↗</span></a></b><small>千丁支所に開設（平日9〜16時）。早期営農再開の支援事業・技術・融資を一括相談／33-4117</small></li>
<li><b><a href="{PDF_URL}#page=58" target="_blank" rel="noopener">早期の営農再開に向けた支援 <span class="ys-badge-up">更新</span><span class="ys-pdf-page">PDF 58ページ ↗</span></a></b><small>生産資材調達・残さ撤去補助（1/2等）、いぐさ畳表加工再開支援／33-4117</small></li>
<li><b><a href="{PDF_URL}#page=60" target="_blank" rel="noopener">八代市農業用機械・施設等復旧支援事業（Ｒ８熊本地震） <span class="ys-badge-up">更新</span><span class="ys-pdf-page">PDF 60ページ ↗</span></a></b><small>機械・農舎等の修繕又は再取得経費の9/10以内を補助／33-4117</small></li>
<li><b><a href="{PDF_URL}#page=61" target="_blank" rel="noopener">日本政策金融公庫による「災害復旧貸付」<span class="ys-pdf-page">PDF 61ページ ↗</span></a></b><small>国民事業3,000万円、中小企業事業1.5億円別枠／32-5195</small></li>
<li><b><a href="{PDF_URL}#page=62" target="_blank" rel="noopener">中小企業基盤整備機構による「小規模企業共済災害時貸付」<span class="ys-pdf-page">PDF 62ページ ↗</span></a></b><small>最大1,000万円、年0.9%、担保保証人不要／050-5541-7171</small></li>
<li><b><a href="{PDF_URL}#page=63" target="_blank" rel="noopener">緊急時短期資金保証制度<span class="ys-pdf-page">PDF 63ページ ↗</span></a></b><small>普通2.8億円、小口2,000万円、運転資金・6か月以内／33-2579</small></li>
<li><b><a href="{PDF_URL}#page=64" target="_blank" rel="noopener">金融円滑化特別資金（令和８年熊本地震枠）<span class="ys-pdf-page">PDF 64ページ ↗</span></a></b><small>企業8,000万円、組合1億円。証明または売上等減少／商工会議所等</small></li>
<li><b><a href="{PDF_URL}#page=65" target="_blank" rel="noopener">金融円滑化特別資金（セーフティネット保証対応枠（令和８年熊本地震分））<span class="ys-pdf-page">PDF 65ページ ↗</span></a></b><a href="yatsushiro-safetynet4.html" style="font-size:12px; font-weight:700; color:#1d5b79; margin-left:6px;">【特設ガイド・診断】</a><small>別枠8,000万円。市町村の認定が必要／商工政策課 33-8513</small></li>
<li><b><a href="{PDF_URL}#page=66" target="_blank" rel="noopener">小規模事業者おうえん資金（令和８年熊本地震分）<span class="ys-pdf-page">PDF 66ページ ↗</span></a></b><small>2,000万円。従業員数・残高・被害または売上等減少条件あり</small></li>
<li><b><a href="{PDF_URL}#page=67" target="_blank" rel="noopener">雇用調整助成金（令和８年熊本地震の災害に伴う特例措置）<span class="ys-pdf-page">PDF 67ページ ↗</span></a></b><small>中小2/3、大企業1/2。休業等の初日が2026年7月28日〜2027年1月27日</small></li>
<li><b><a href="{PDF_URL}#page=68" target="_blank" rel="noopener">八代商工会議所・八代市商工会による「特別相談窓口開設」 <span class="ys-badge-up">更新</span><span class="ys-pdf-page">PDF 68ページ ↗</span></a></b><small>持続化補助金（災害支援枠）相談会など。事業再建・継続・資金繰りを無料相談</small></li>
<li><b><a href="{PDF_URL}#page=69" target="_blank" rel="noopener">くまもと事業者再出発支援補助金 <span class="ys-badge-new">新規</span><span class="ys-pdf-page">PDF 69ページ ↗</span></a></b><small>事業用施設・設備・車両復旧。中小3/4（上限3億円）、中堅1/2。10/1〜受付／096-284-7660</small></li>
<li><b><a href="{PDF_URL}#page=70" target="_blank" rel="noopener">小規模事業者持続化補助金＜一般型 災害支援枠（令和 8 年熊本地震）＞ <span class="ys-badge-new">新規</span><span class="ys-pdf-page">PDF 70ページ ↗</span></a></b><small>小規模事業者の機械復旧・販路開拓等。直接被害上限200万、間接被害100万。10/16第1次締切／32-6191</small></li>
<li><b><a href="{PDF_URL}#page=71" target="_blank" rel="noopener">中小企業者事業再建支援利子補給事業（令和８年熊本地震） <span class="ys-badge-new">新規</span><span class="ys-pdf-page">PDF 71ページ ↗</span></a></b><small>災害関連融資（7/28〜12/31実行分）の利子を3年間全額補給。市独自事業／商工政策課 33-8513</small></li>
</ul></article>
</div>'''

html = re.sub(r'<div class="ys-catalog-grid" id="ysCatalog">.*?</div>(?=\s*<p id="ysNoResult")', catalog_html, html, flags=re.DOTALL)

# 9. Update Official Sources links
html = html.replace('掲載内容は第7版をもとにしています。', '掲載内容は第8版をもとにしています。')
html = html.replace(
    '<a href="https://www.city.yatsushiro.lg.jp/kiji00326858/3_26858_160146_up_l7vhrdbl.pdf" target="_blank" rel="noopener"><b>第7版 PDF（62ページ）</b><span>2026年9月21日現在 ↗</span></a>',
    f'<a href="{PDF_URL}" target="_blank" rel="noopener"><b>第8版 PDF（65ページ・本編71ページ）</b><span>2026年10月9日現在 ↗</span></a>'
)

with open('yatsushiro-support.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Updated yatsushiro-support.html to v8 successfully!")
