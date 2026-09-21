#!/usr/bin/env python3
"""yatsushiro-living-support.html を生成するスクリプト（八代市 暮らしの支援・補助金 総合ガイド）"""
import json
from pathlib import Path

# SVGアイコン定義（親しみやすく直感的なベクターイラスト）
ICONS = {
    "reform": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M14.5 12a2.5 2.5 0 0 0-3.5-3.5L8 11.5l4.5 4.5z"/><path d="m11.5 15 3.5 3.5"/></svg>''',
    "retrofit_check": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="14" r="3"/><path d="m14.5 16.5 2.5 2.5"/><path d="m9 13 2 2 4-4"/></svg>''',
    "retrofit_build": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M12 11v7"/><path d="M8 15h8"/><path d="M12 22s5-3 5-8V9l-5-2-5 2v5c0 5 5 8 5 8z" opacity="0.3"/></svg>''',
    "wood": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 18h16Z"/><path d="M12 18v4"/><path d="M9 10h6"/></svg>''',
    "wall": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18"/><path d="M9 3v6M15 3v6M6 9v6M12 9v6M18 9v6M9 15v6M15 15v6"/></svg>''',
    "demolish": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="m7 7 10 10M17 7 7 17"/></svg>''',
    "septic": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/><path d="M12 12v6M9 15h6"/></svg>''',
    "compost": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 3.5 1 7.5-1.5 10.5M11 20a7 7 0 0 0 6.5-7.5"/><path d="M11 20v-8"/></svg>''',
    "vacant": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="14" r="2"/><path d="M12 16v3"/></svg>''',
    "child_med": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M19 8h4M21 6v4"/></svg>''',
    "child_benefit": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg>''',
    "preschool": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="8" height="8" rx="1"/><rect x="13" y="11" width="8" height="8" rx="1"/><path d="m8 3 5 8H3z"/></svg>''',
    "school_aid": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10M6 10h10M6 14h6"/></svg>''',
    "afterschool": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>''',
    "edu_loan": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>''',
    "heart": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>''',
    "postpartum": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z"/><circle cx="17" cy="7" r="3"/><path d="M14 14a5 5 0 0 1 7 4"/></svg>''',
    "fertility": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a5 5 0 0 1 5 5c0 4-5 9-5 9s-5-5-5-9a5 5 0 0 1 5-5Z"/><circle cx="12" cy="7" r="2"/><path d="M12 16v6M8 20h8"/></svg>''',
    "checkup": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>''',
    "senior_house": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22v-6h6v6"/></svg>''',
    "emergency_bell": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M2 2l20 20" opacity="0.3"/></svg>''',
    "meal": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v20M18 10h4M2 8a4 4 0 0 1 4-4h4v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z"/><path d="M6 4v6"/></svg>''',
    "taxi": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H10l-2 4H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h1a2 2 0 0 0 4 0h6a2 2 0 0 0 4 0h1a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-4z"/><circle cx="7" cy="18" r="1"/><circle cx="17" cy="18" r="1"/></svg>''',
    "aid_hearing": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11h3l3-7 4 14 3-7h5"/></svg>''',
    "wedding": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="5"/><circle cx="15" cy="12" r="5"/><path d="m9 7 3-4 3 4"/></svg>''',
    "moving": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>''',
    "startup": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6M10 22h4"/></svg>''',
    "loan_biz": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v4M12 14v4M16 14v4"/></svg>''',
    "farmer": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22 12 2l10 20"/><path d="M5.5 15h13M8 10h8"/></svg>''',
    "rebuild": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M12 3v4M3 12h4M17 12h4M12 18h.01"/></svg>''',
    "emergency_repair": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>''',
    "demolish_public": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/></svg>''',
    "disaster_loan": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M7 15h.01M17 15h.01"/></svg>''',
    "safetynet": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>''',
    "tax_relief": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg>'''
}

SYSTEMS = [
    # 1. 住まい・耐震・環境
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "自己負担無料・耐震診断士派遣",
        "title": "八代市戸建木造住宅耐震診断事業",
        "amount": "自己負担無料（市が専門の木造住宅耐震診断士を派遣・全額公費負担）",
        "desc": "旧耐震基準（昭和56年5月以前着工）または従来基準の木造一戸建て住宅を対象に、市が専門の耐震診断士を無料で派遣。大地震時の倒壊危険度を詳細に調査します。",
        "extra": "耐震改修工事や耐震シェルター設置補助を受けるための必須診断です。耐震性の現状把握からご相談いただけます。",
        "dept": "住宅課 住宅政策係",
        "phone": "0965-33-4122",
        "url": "https://www.city.yatsushiro.lg.jp/kiji00325525/index.html",
        "urlLabel": "公式：木造耐震化支援 ↗",
        "icon": "retrofit_check",
        "life": ["working", "senior"],
        "family": ["general", "senior_only"],
        "housing": ["owned_wood"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_partial"],
        "work": ["all"],
        "tags": ["#木造耐震", "#無料診断", "#持ち家", "#倒壊防止"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "改修・建替え最大100万円補助",
        "title": "戸建木造住宅耐震改修等事業補助金",
        "amount": "耐震改修・建替え工事費の一部補助（最大100万円） / 耐震シェルター設置助成",
        "desc": "耐震診断の結果、倒壊の危険性があると判定された木造住宅について、耐震改修工事や建替え工事、または寝室等の安全を確保する耐震シェルター設置費用を助成します。",
        "extra": "高齢者世帯には耐震シェルター設置も有効です。工事契約・着工前の申請が必要です。",
        "dept": "住宅課 住宅政策係",
        "phone": "0965-33-4122",
        "url": "https://www.city.yatsushiro.lg.jp/kiji00325525/index.html",
        "urlLabel": "公式：耐震改修等補助 ↗",
        "icon": "retrofit_build",
        "life": ["working", "senior"],
        "family": ["general", "senior_only"],
        "housing": ["owned_wood"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_partial"],
        "work": ["all"],
        "tags": ["#耐震補強", "#建替え100万", "#シェルター"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "八代市独自・地元産材利用助成",
        "title": "八代産材利用促進事業補助金",
        "amount": "八代産木材を使用した新築・増改築・リフォーム費用の一部助成",
        "desc": "豊かな八代の森林資源を活かし、市内の木造住宅新築やリフォームにおいて八代産材（柱・梁・床材等）を一定割合以上使用する場合に費用の一部を助成します。",
        "extra": "【市独自メリット】地産地消の安心な住まいづくりを応援。耐震改修や一般的なリフォームとも組み合わせて活用できます。",
        "dept": "林務水産課 林業振興係",
        "phone": "0965-33-4117",
        "url": "https://www.city.yatsushiro.lg.jp/kiji00319507/index.html",
        "urlLabel": "公式：八代産材利用促進 ↗",
        "icon": "wood",
        "life": ["working", "senior", "newlywed"],
        "family": ["general", "childcare"],
        "housing": ["owned_wood"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_partial"],
        "work": ["all"],
        "tags": ["#八代産材", "#木造リフォーム", "#新築助成", "#八代市独自"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "撤去・フェンス改修補助",
        "title": "危険ブロック塀等安全確保支援事業補助金",
        "amount": "避難路・通学路に面する危険ブロック塀の撤去・改修費用の一部補助",
        "desc": "地震発生時の倒壊による人身被害や避難路閉塞を防ぐため、道路に面する危険なブロック塀等の撤去、または軽量フェンス等への建替え費用を補助します。",
        "extra": "事前相談・現地確認が必要です。着工前に申請してください。",
        "dept": "建築指導課 審査指導係",
        "phone": "0965-33-4123",
        "url": "https://www.city.yatsushiro.lg.jp/kiji0039860/index.html",
        "urlLabel": "公式：ブロック塀除却補助 ↗",
        "icon": "wall",
        "life": ["working", "senior"],
        "family": ["general"],
        "housing": ["owned_wood", "vacant"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_partial"],
        "work": ["all"],
        "tags": ["#ブロック塀撤去", "#通学路安全", "#防災助成"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "水回り改善・転換上乗せ",
        "title": "八代市合併処理浄化槽設置整備事業補助金",
        "amount": "人槽区分に応じた設置補助＋単独浄化槽・汲み取り転換時の撤去配管上乗せ助成",
        "desc": "生活排水による環境保全を図るため、専用住宅に合併処理浄化槽を設置する費用を助成。単独浄化槽等からの転換には手厚い上乗せ助成があります。",
        "extra": "下水道区域外が対象。水洗トイレと清潔な水環境を実現できます。",
        "dept": "下水道業務課 排水設備係",
        "phone": "0965-33-4131",
        "url": "https://www.city.yatsushiro.lg.jp/kiji0039803/index.html",
        "urlLabel": "公式：浄化槽設置補助 ↗",
        "icon": "septic",
        "life": ["working", "senior", "newlywed"],
        "family": ["general"],
        "housing": ["owned_wood", "septic"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_partial"],
        "work": ["all"],
        "tags": ["#浄化槽", "#水洗化", "#単独切替上乗せ"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "購入費用の助成",
        "title": "生ごみ処理機等購入費補助金",
        "amount": "電動生ごみ処理機・コンポスト容器等の購入費用の一部補助",
        "desc": "家庭から出る生ごみの減量化・資源化を推進するため、処理機器等の購入費用の一部を助成します。",
        "extra": "生ごみ減量と良質な家庭菜園用堆肥づくりに役立ちます。",
        "dept": "環境課 資源循環係",
        "phone": "0965-33-4114",
        "url": "https://www.city.yatsushiro.lg.jp/kiji00324383/index.html",
        "urlLabel": "公式：生ごみ処理機助成 ↗",
        "icon": "compost",
        "life": ["working", "senior"],
        "family": ["general"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#生ごみ処理機", "#減量化", "#コンポスト"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "成約物件の改修・家財撤去",
        "title": "八代市空き家バンク活用促進事業補助金",
        "amount": "バンク登録物件の改修工事費・家財撤去費・引越費用の一部補助",
        "desc": "空き家バンクを活用して市内に移住・定住する方を対象に、物件のリフォーム費用や残置家財道具の撤去費用を助成します。",
        "extra": "移住定住補助金と併せて活用することで、初期の住まい費用を大幅に抑えられます。",
        "dept": "企画政策課 移住定住推進係",
        "phone": "0965-33-4162",
        "url": "https://www.city.yatsushiro.lg.jp/kiji0036921/index.html",
        "urlLabel": "公式：空き家バンク活用 ↗",
        "icon": "vacant",
        "life": ["working", "newlywed"],
        "family": ["general", "childcare"],
        "housing": ["vacant", "owned_wood"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#空き家バンク", "#リフォーム補助", "#家財撤去"]
    },

    # 2. 子育て・教育・就学
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学",
        "badge": "高校生まで窓口負担ゼロ",
        "title": "八代市こども医療費助成事業（高校生まで全額助成）",
        "amount": "0歳から高校3年生（18歳年度末）までの通院・入院自己負担分を全額助成",
        "desc": "高校生年代までのお子さまが病気や怪我で受診した際、保険診療の自己負担分を全額市が助成。市内指定医療機関では窓口での支払いも原則不要です。",
        "extra": "【八代市独自の手厚い支援】子どもの健やかな成長と保護者の経済的不安を力強く解消する中核制度です。",
        "dept": "こども未来課 給付係",
        "phone": "0965-33-4100",
        "url": "https://www.city.yatsushiro.lg.jp/kiji00321431/index.html",
        "urlLabel": "公式：こども医療費助成 ↗",
        "icon": "child_med",
        "life": ["child_infant", "child_school"],
        "family": ["childcare", "single_parent"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#こども医療費", "#18歳まで全額助成", "#窓口負担ゼロ", "#所得制限なし"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学",
        "badge": "八代市独自・保育料完全無償化",
        "title": "保育料完全無償化（0〜5歳児）",
        "amount": "0歳児から5歳児までの保育料を完全無償化（副食費等の軽減含む）",
        "desc": "国の幼児教育・保育無償化（3〜5歳児）に加え、八代市独自で0〜2歳児の保育料も市独自財源で無償化。乳幼児期から切れ目のない手厚い子育て環境を実現しています。",
        "extra": "【八代市独自メリット】共働き世帯や子育て世代の定住を力強く支える県内屈指の手厚い施策です。",
        "dept": "こども未来課 保育係",
        "phone": "0965-33-4100",
        "url": "https://www.city.yatsushiro.lg.jp/kiji00326065/index.html",
        "urlLabel": "公式：子育て施策・保育 ↗",
        "icon": "preschool",
        "life": ["child_infant"],
        "family": ["childcare", "single_parent"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_heavy", "damage_half"],
        "work": ["employee", "business", "agri"],
        "tags": ["#保育料完全無償化", "#0歳から無料", "#八代市独自", "#共働き応援"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学",
        "badge": "第1子3万・第2子5万・第3子10万",
        "title": "八代市出産祝金（市独自）",
        "amount": "第1子：3万円 / 第2子：5万円 / 第3子以降：10万円贈呈",
        "desc": "八代市で誕生した赤ちゃんの健やかな成長を祝い、保護者へ市独自の出産祝金を支給します。",
        "extra": "国の出産・子育て応援給付金（計10万円）と重複して受給できます。出生届提出時にご案内します。",
        "dept": "こども未来課 給付係",
        "phone": "0965-33-4100",
        "url": "https://www.city.yatsushiro.lg.jp/kiji00317243/index.html",
        "urlLabel": "公式：出産祝い金 ↗",
        "icon": "heart",
        "life": ["child_infant"],
        "family": ["childcare"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#出産祝金", "#第3子10万", "#八代市独自", "#子育て応援"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学",
        "badge": "高校生まで・所得制限なし",
        "title": "児童手当",
        "amount": "0〜2歳：1.5万円 / 3歳〜高校生：1万円（第3子以降は月3万円）",
        "desc": "高校生年代までの児童を養育している方に支給される手当。所得制限が撤廃され、第3子以降には月3万円が支給されます。",
        "extra": "出生日や転入日の翌日から15日以内にこども未来課窓口へ申請してください。",
        "dept": "こども未来課 給付係",
        "phone": "0965-33-4100",
        "url": "https://www.city.yatsushiro.lg.jp/kiji00323684/index.html",
        "urlLabel": "公式：児童手当 ↗",
        "icon": "child_benefit",
        "life": ["child_infant", "child_school"],
        "family": ["childcare", "single_parent"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#児童手当", "#高校生まで", "#第3子3万"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学",
        "badge": "給食費・学用品費援助",
        "title": "八代市就学援助制度（小中学校）",
        "amount": "学用品費、給食費、修学旅行費、新入学用品費などの実費援助",
        "desc": "八代市立小・中学校に通う児童生徒の保護者で、経済的にお困りの世帯に対し、義務教育を安心して受けるための経費を援助します。",
        "extra": "非課税世帯や所得基準以下の世帯が対象。被災による家計急変時にも随時相談できます。",
        "dept": "教育総務課 学務保健係",
        "phone": "0965-33-4125",
        "url": "https://www.city.yatsushiro.lg.jp/kiji0038010/index.html",
        "urlLabel": "公式：就学援助制度 ↗",
        "icon": "school_aid",
        "life": ["child_school"],
        "family": ["childcare", "single_parent"],
        "housing": ["owned_wood", "rental"],
        "income": ["low_income"],
        "disaster": ["none", "damage_heavy", "damage_half"],
        "work": ["all"],
        "tags": ["#就学援助", "#給食費援助", "#学用品費"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学",
        "badge": "無利子貸与で進学支援",
        "title": "八代市育英資金・奨学金制度",
        "amount": "高等学校・大学・短大・高等専門学校等の修学資金（無利子貸与）",
        "desc": "能力がありながら経済的理由により進学・修学が困難な生徒・学生に対し、無利子で奨学資金を貸与します。",
        "extra": "卒業後に計画的に返還する制度です。毎年の公募時期にご確認ください。",
        "dept": "教育総務課 総務係",
        "phone": "0965-33-4125",
        "url": "https://www.city.yatsushiro.lg.jp/kiji00321946/index.html",
        "urlLabel": "公式：八代市奨学資金 ↗",
        "icon": "edu_loan",
        "life": ["child_school", "working"],
        "family": ["childcare", "single_parent"],
        "housing": ["owned_wood", "rental"],
        "income": ["low_income"],
        "disaster": ["none", "damage_heavy", "damage_half"],
        "work": ["all"],
        "tags": ["#奨学金", "#育英資金", "#無利子貸与", "#進学応援"]
    },

    # 3. 健康・出産・女性
    {
        "cat": "health",
        "catName": "健康・出産・女性",
        "badge": "伴走相談＋計10万円給付",
        "title": "出産・子育て応援交付金事業",
        "amount": "妊娠届出時5万円＋出生時5万円（計10万円相当）",
        "desc": "すべての妊産婦・子育て家庭へ保健師が寄り添い、面談を通じて不安を解消するとともに、計10万円の経済的支援を提供します。",
        "extra": "母子健康手帳交付時およびこんにちは赤ちゃん訪問での面談を経て給付されます。",
        "dept": "健康づくり推進課 母子保健係",
        "phone": "0965-33-5116",
        "url": "https://www.city.yatsushiro.lg.jp/kiji00319416/index.html",
        "urlLabel": "公式：出産・子育て応援 ↗",
        "icon": "heart",
        "life": ["child_infant", "newlywed"],
        "family": ["childcare"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#出産応援10万", "#妊婦面談", "#安心子育て"]
    },
    {
        "cat": "health",
        "catName": "健康・出産・女性",
        "badge": "宿泊・通所・訪問ケア",
        "title": "八代市産後ケア事業",
        "amount": "利用料金の大部分を公費負担（自己負担数千円程度）",
        "desc": "産後のお母さんの心身のケアや授乳指導、育児相談を、医療機関や助産所での宿泊、デイサービス、訪問形式で提供します。",
        "extra": "産後の体調不良や孤立を防ぐ心強い制度。非課税世帯等への利用料減免もあります。",
        "dept": "健康づくり推進課 母子保健係",
        "phone": "0965-33-5116",
        "url": "https://www.city.yatsushiro.lg.jp/kiji00316768/index.html",
        "urlLabel": "公式：産後ケア事業 ↗",
        "icon": "postpartum",
        "life": ["child_infant"],
        "family": ["childcare"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#産後ケア", "#助産師サポート", "#母体回復"]
    },
    {
        "cat": "health",
        "catName": "健康・出産・女性",
        "badge": "不妊治療の自己負担助成",
        "title": "不妊治療費・先進医療費助成事業",
        "amount": "保険適用の生殖補助医療や先進医療にかかる自己負担額の一部助成",
        "desc": "子どもを望むご夫婦の経済的負担を軽減するため、不妊治療における保険適用治療や先進医療の自己負担費用を一部助成します。",
        "extra": "熊本県の支援とも連携し、安心して治療を受けられるよう支えます。",
        "dept": "健康づくり推進課 母子保健係",
        "phone": "0965-33-5116",
        "url": "https://www.city.yatsushiro.lg.jp/kiji00315044/index.html",
        "urlLabel": "公式：不妊治療先進医療 ↗",
        "icon": "fertility",
        "life": ["newlywed", "working"],
        "family": ["general"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#不妊治療助成", "#先進医療", "#妊活支援"]
    },
    {
        "cat": "health",
        "catName": "健康・出産・女性",
        "badge": "特定健診・各種がん検診",
        "title": "八代市特定健康診査・各種がん検診",
        "amount": "無料または数百円〜千円程度で受診可能（特定健診・各種がん検診）",
        "desc": "生活習慣病予防のための特定健診（40〜74歳国保加入者）や、胃がん・肺がん・大腸がん・乳がん・子宮頸がん検診を定期実施しています。",
        "extra": "被災後の生活環境の変化による生活習慣病や健康被害を防ぐためにも、毎年の受診をおすすめします。",
        "dept": "健康づくり推進課 成人保健係",
        "phone": "0965-33-5116",
        "url": "https://www.city.yatsushiro.lg.jp/kiji00319429/index.html",
        "urlLabel": "公式：健康診査・検診案内 ↗",
        "icon": "checkup",
        "life": ["working", "senior"],
        "family": ["general", "senior_only"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#特定健診", "#がん検診", "#健康維持"]
    },

    # 4. シニア・障がい福祉
    {
        "cat": "senior",
        "catName": "シニア・障がい福祉",
        "badge": "市独自助成・在宅安心",
        "title": "八代市高齢者住宅改修費給付事業",
        "amount": "在宅高齢者向け住宅改修費用の一部助成（介護保険給付と別枠）",
        "desc": "在宅の高齢者が安全に生活できるよう、手すり設置や段差解消などのバリアフリー住宅改修費用を市独自財源で助成します。",
        "extra": "介護保険の要介護認定区分等に応じた基準があります。着工前の事前申請が必要です。",
        "dept": "高齢者支援課 高齢福祉係",
        "phone": "0965-33-4113",
        "url": "https://www.city.yatsushiro.lg.jp/kiji00319429/index.html",
        "urlLabel": "公式：高齢者支援申請書 ↗",
        "icon": "senior_house",
        "life": ["senior"],
        "family": ["senior_only", "disability"],
        "housing": ["owned_wood"],
        "income": ["low_income"],
        "disaster": ["none", "damage_partial"],
        "work": ["all"],
        "tags": ["#高齢者住宅改修", "#バリアフリー", "#市独自助成"]
    },
    {
        "cat": "senior",
        "catName": "シニア・障がい福祉",
        "badge": "タクシー利用券で移動支援",
        "title": "八代市高齢者等福祉タクシー利用助成事業",
        "amount": "一般タクシー初乗り運賃相当等の助成券交付",
        "desc": "自力での移動や公共交通機関の利用が困難な在宅重度障がい者や一定基準を満たす高齢者を対象に、通院や買い物等の外出を支援するタクシー助成券を交付します。",
        "extra": "運転免許証返納後の外出支援としても活用されています。対象要件をご確認ください。",
        "dept": "障がい福祉課 / 高齢者支援課",
        "phone": "0965-33-4113",
        "url": "https://www.city.yatsushiro.lg.jp/kiji00319429/index.html",
        "urlLabel": "公式：高齢者支援各種申請 ↗",
        "icon": "taxi",
        "life": ["senior"],
        "family": ["senior_only", "disability"],
        "housing": ["owned_wood", "rental"],
        "income": ["low_income"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#福祉タクシー", "#通院支援", "#免許返納", "#移動支援"]
    },
    {
        "cat": "senior",
        "catName": "シニア・障がい福祉",
        "badge": "安否確認＋栄養管理",
        "title": "高齢者食の自立支援事業（配食サービス）",
        "amount": "市助成により実費負担のみで利用可能（手渡し安否確認つき）",
        "desc": "一人暮らし高齢者等で自炊が困難な方を対象に、栄養バランスの整った食事をご自宅へ配達し、手渡しによる安否確認を行います。",
        "extra": "体調変化の早期発見や孤独死防止のための地域見守りネットワークです。",
        "dept": "高齢者支援課 地域包括支援センター",
        "phone": "0965-33-4113",
        "url": "https://www.city.yatsushiro.lg.jp/kiji00321160/index.html",
        "urlLabel": "公式：配食サービス ↗",
        "icon": "meal",
        "life": ["senior"],
        "family": ["senior_only"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#配食サービス", "#見守り安否確認", "#栄養管理"]
    },
    {
        "cat": "senior",
        "catName": "シニア・障がい福祉",
        "badge": "上限20万円の7〜9割支給",
        "title": "介護保険 住宅改修費支給",
        "amount": "上限20万円の工事費に対し、7割〜9割（最大18万円）を保険給付",
        "desc": "要支援・要介護の認定を受けた方の自宅で、手すり取付、段差解消、引き戸等への扉取替工事等のバリアフリー改修費用を給付します。",
        "extra": "ケアマネジャーの理由書が必要です。着工前の事前申請が必須となります。",
        "dept": "高齢者支援課 介護給付係",
        "phone": "0965-33-4113",
        "url": "https://www.city.yatsushiro.lg.jp/kiji00311216/index.html",
        "urlLabel": "公式：介護保険住宅改修 ↗",
        "icon": "reform",
        "life": ["senior"],
        "family": ["senior_only", "disability"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_partial"],
        "work": ["all"],
        "tags": ["#介護保険", "#手すり設置", "#段差解消", "#バリアフリー"]
    },

    # 5. 移住・新婚・地域
    {
        "cat": "migration",
        "catName": "移住・新婚・地域",
        "badge": "住宅取得最大50万・賃借最大30万",
        "title": "八代市移住・定住促進補助金",
        "amount": "県外からの移住世帯に住宅取得費用（最大50万円）や賃借費用（最大30万円）を補助",
        "desc": "若者世代や子育て世帯の移住・定住を促進するため、県外から八代市へ転入し住宅を取得または賃借する方へ費用を補助します。",
        "extra": "豊かな自然と田園環境、充実した子育て支援が揃う八代市での暮らしを応援します。",
        "dept": "企画政策課 移住定住推進係",
        "phone": "0965-33-4162",
        "url": "https://www.city.yatsushiro.lg.jp/ijyu/kiji00325901/index.html",
        "urlLabel": "公式：移住定住促進補助 ↗",
        "icon": "moving",
        "life": ["working", "newlywed"],
        "family": ["general", "childcare"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["employee", "business"],
        "tags": ["#移住定住補助金", "#住宅取得50万", "#賃借30万", "#子育て応援"]
    },
    {
        "cat": "migration",
        "catName": "移住・新婚・地域",
        "badge": "新婚世帯に最大30〜60万円",
        "title": "八代市結婚新生活支援事業補助金",
        "amount": "新婚世帯に住居費（購入・家賃・敷金礼金）および引越費用を補助（最大30万〜60万円）",
        "desc": "新婚夫婦の新しい生活スタートを後押しするため、住まいの取得・賃貸費用や引越し業者への支払実費を補助します。",
        "extra": "年齢や世帯所得条件があります。婚姻届提出後の早めの申請をおすすめします。",
        "dept": "企画政策課 移住定住推進係",
        "phone": "0965-33-4162",
        "url": "https://www.city.yatsushiro.lg.jp/ijyu/kiji00325901/index.html",
        "urlLabel": "公式：新生活・住まい支援 ↗",
        "icon": "wedding",
        "life": ["newlywed"],
        "family": ["general"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#新婚補助金", "#最大60万", "#家賃引越支援", "#若者夫婦"]
    },
    {
        "cat": "migration",
        "catName": "移住・新婚・地域",
        "badge": "世帯100万円・単身60万円＋加算",
        "title": "八代市移住支援金（就業・起業・テレワーク）",
        "amount": "2人以上世帯100万円 / 単身60万円（18歳未満の子ども1人につき加算あり）",
        "desc": "東京圏等の対象地域から八代市へ移住し、マッチングサイト掲載求人への就業、起業、またはテレワークを継続する方へ支援金を支給します。",
        "extra": "県南の中核都市・八代市での新しいキャリアと豊かな生活をサポートします。",
        "dept": "企画政策課 移住定住推進係",
        "phone": "0965-33-4162",
        "url": "https://www.city.yatsushiro.lg.jp/kiji00311456/index.html",
        "urlLabel": "公式：八代市移住支援金 ↗",
        "icon": "moving",
        "life": ["working", "newlywed"],
        "family": ["general", "childcare"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["employee", "startup"],
        "tags": ["#移住支援金", "#100万支給", "#子育て加算"]
    },

    # 6. 産業・農業・創業
    {
        "cat": "business",
        "catName": "産業・農業・創業",
        "badge": "創業・設備導入費用助成",
        "title": "八代市創業支援事業補助金",
        "amount": "店舗改修費・設備備品購入費・広告宣伝費等の一部補助（特定創業支援等事業受講者対象）",
        "desc": "八代市内での新規創業や新事業展開を促進するため、開業に必要な事業所改修工事費や機械設備購入費、販売促進費用の一部を補助します。",
        "extra": "特定創業支援等事業によるセミナー受講や経営相談が要件となります。商工政策課でご相談いただけます。",
        "dept": "商工政策課 産業振興係",
        "phone": "0965-33-8513",
        "url": "https://www.city.yatsushiro.lg.jp/kiji00315987/index.html",
        "urlLabel": "公式：創業支援・事業補助 ↗",
        "icon": "startup",
        "life": ["working"],
        "family": ["general"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["startup", "business"],
        "tags": ["#創業補助金", "#店舗改修", "#設備投資", "#特定創業支援"]
    },
    {
        "cat": "business",
        "catName": "産業・農業・創業",
        "badge": "低利融資・利子補給",
        "title": "八代市中小企業資金融資制度・利子補給",
        "amount": "公的低利融資枠＋市による利子補給および信用保証料補助",
        "desc": "市内の中小企業・小規模事業者の資金繰り円滑化と設備投資を支援するため、金融機関協調の低利融資制度を実施しています。",
        "extra": "八代商工会議所や八代市商工会で事前相談を受け付けています。",
        "dept": "商工政策課 金融労働係",
        "phone": "0965-33-8513",
        "url": "https://www.city.yatsushiro.lg.jp/kiji0031083/index.html",
        "urlLabel": "公式：中小企業融資制度 ↗",
        "icon": "loan_biz",
        "life": ["working"],
        "family": ["general"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_partial"],
        "work": ["business"],
        "tags": ["#中小企業融資", "#利子補給", "#保証料補助", "#運転資金"]
    },
    {
        "cat": "business",
        "catName": "産業・農業・創業",
        "badge": "新規就農・担い手育成",
        "title": "農業後継者・新規就農定着支援事業",
        "amount": "就農準備・経営開始資金交付＋農業用機械・施設整備助成",
        "desc": "八代の基幹産業である農業を支えるため、トマト、い草、柑橘、ショウガ等の新規就農者や担い手農家に対し、機械導入や定着支援を行います。",
        "extra": "農業委員会やJAやつしろと連携し、農地確保から技術習得まで包括的に支援します。",
        "dept": "農業振興課 農政係",
        "phone": "0965-33-4115",
        "url": "https://www.city.yatsushiro.lg.jp/kiji00313735/",
        "urlLabel": "公式：就農支援・八代農業塾 ↗",
        "icon": "farmer",
        "life": ["working", "newlywed"],
        "family": ["general"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["agri", "startup"],
        "tags": ["#新規就農", "#八代トマト", "#農業機械補助"]
    },

    # 7. 熊本地震特別支援
    {
        "cat": "disaster",
        "catName": "熊本地震特別支援",
        "badge": "被災者応援ガイド第7版・全54制度",
        "title": "八代市 被災者応援ガイドブック（第7版連携）",
        "amount": "全54制度の対象・金額・期限・条件・相談先を完全網羅",
        "desc": "八代市が令和8年9月21日に発行した「被災者応援ガイドブック第7版」全62ページを読み解き、住家判定や困りごとから探せるよう整理した専用ガイドです。",
        "extra": "緊急修理の期限延長（10/27まで）や公費解体受付（9/28〜）、特別行政相談所（10/8）などの最新情報を網羅しています。",
        "dept": "生活援護課 支援給付係",
        "phone": "0965-33-8722",
        "url": "yatsushiro-support.html",
        "urlLabel": "八代市被災者支援ナビ ↗",
        "icon": "rebuild",
        "life": ["working", "senior", "newlywed"],
        "family": ["general", "childcare", "senior_only"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#被災者応援ガイド", "#第7版", "#全54制度", "#総合まとめ"]
    },
    {
        "cat": "disaster",
        "catName": "熊本地震特別支援",
        "badge": "半壊以上・市が解体または費用償還",
        "title": "建物の解体・撤去（公費解体／自費解体）",
        "amount": "解体撤去費用を市が全額負担（自費解体は基準限度額内で費用償還）",
        "desc": "令和8年熊本地震で「半壊」以上の被害を受けた住宅・付属家屋等を対象に、市が解体撤去を実施する「公費解体」と、所有者が自ら解体した費用を償還する「自費解体」を受け付けます。",
        "extra": "申請期間：令和8年9月28日〜令和9年3月31日。Web予約および電話事前予約（0965-37-7550）が必要です。",
        "dept": "環境課 公費解体受付窓口",
        "phone": "0965-37-7550",
        "url": "yatsushiro-support.html#catalog-housing",
        "urlLabel": "公費解体・自費解体詳細 ↗",
        "icon": "demolish_public",
        "life": ["working", "senior", "newlywed"],
        "family": ["general", "senior_only"],
        "housing": ["owned_wood", "vacant"],
        "income": ["no_limit"],
        "disaster": ["damage_heavy", "damage_half"],
        "work": ["all"],
        "tags": ["#公費解体", "#自費解体", "#半壊以上", "#費用市負担"]
    },
    {
        "cat": "disaster",
        "catName": "熊本地震特別支援",
        "badge": "完了報告期限10/27まで延長",
        "title": "住家の緊急修理（ブルーシート展張等）",
        "amount": "1世帯あたり最大5万6,400円（市から業者へ直接支払い）",
        "desc": "雨水の浸入による二次被害を防ぐため、屋根等へのブルーシート展張や応急措置費用を市が助成します。施工完了報告の提出期限が10月27日まで延長されました。",
        "extra": "【注意】事前申込みが必要です。市指定業者による施工が原則となります。",
        "dept": "建設政策課 建築係",
        "phone": "0965-33-4116",
        "url": "yatsushiro-support.html#deadlines",
        "urlLabel": "緊急修理・ブルーシート ↗",
        "icon": "emergency_repair",
        "life": ["working", "senior", "newlywed"],
        "family": ["general", "senior_only"],
        "housing": ["owned_wood"],
        "income": ["no_limit"],
        "disaster": ["damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#緊急修理", "#ブルーシート", "#期限10月27日", "#二次被害防止"]
    },
    {
        "cat": "disaster",
        "catName": "熊本地震特別支援",
        "badge": "最大75.7万円・日常生活最小限",
        "title": "住宅の応急修理制度（災害救助法）",
        "amount": "準半壊・半壊・中規模半壊・大規模半壊等：最大75万7千円（準半壊は最大36.7万円）",
        "desc": "被害を受けそのままでは住むことができない住宅について、日常生活に不可欠な部分（屋根・外壁・床・トイレ・台所等）の応急修理を市が施工業者へ委託して実施します。",
        "extra": "【重要】被災者が自ら業者に全額支払った後は対象外です。必ず着工前に営繕課へご相談ください。",
        "dept": "営繕課 営繕係",
        "phone": "0965-33-4401",
        "url": "yatsushiro-support.html#repair",
        "urlLabel": "応急修理制度の詳細 ↗",
        "icon": "reform",
        "life": ["working", "senior", "newlywed"],
        "family": ["general", "childcare", "senior_only"],
        "housing": ["owned_wood"],
        "income": ["no_limit"],
        "disaster": ["damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#応急修理", "#最大75.7万", "#先払い不可"]
    },
    {
        "cat": "disaster",
        "catName": "熊本地震特別支援",
        "badge": "最大300万円支給・診断シミュレーターあり",
        "title": "被災者生活再建支援金",
        "amount": "基礎支援金（最大100万円）＋加算支援金（最大200万円、計最大300万円）",
        "desc": "全壊・大規模半壊・中規模半壊等の被害を受けた世帯に対し、基礎支援金と再建方法に応じた加算支援金を支給します。",
        "extra": "当サイト内に「八代市 被災者生活再建支援金ガイド・支給額診断シミュレーター」をご用意しています。",
        "dept": "生活援護課 支援給付係",
        "phone": "0965-33-8722",
        "url": "yatsushiro-rebuild.html",
        "urlLabel": "生活再建支援金ガイド ↗",
        "icon": "rebuild",
        "life": ["working", "senior", "newlywed"],
        "family": ["general", "senior_only"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["damage_heavy", "damage_half"],
        "work": ["all"],
        "tags": ["#生活再建支援金", "#最大300万", "#全壊中規模半壊", "#診断シミュレーター"]
    },
    {
        "cat": "disaster",
        "catName": "熊本地震特別支援",
        "badge": "最大350万円・保証人で無利子",
        "title": "八代市 災害援護資金貸付",
        "amount": "世帯主の負傷や住居・家財被害に応じ最大350万円（据置最長5年・償還10年）",
        "desc": "災害により被害を受けた世帯主に対し、生活再建に必要な資金を低利または無利子で貸し付けます。",
        "extra": "当サイト内に「八代市 災害援護資金貸付ガイド・所得制限シミュレーター」をご用意しています。",
        "dept": "健康福祉政策課 総務係",
        "phone": "0965-33-4003",
        "url": "yatsushiro-loan.html",
        "urlLabel": "災害援護資金の詳細 ↗",
        "icon": "disaster_loan",
        "life": ["working", "senior"],
        "family": ["general", "senior_only"],
        "housing": ["owned_wood", "rental"],
        "income": ["low_income"],
        "disaster": ["damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#災害貸付", "#無利子保証人", "#上限350万"]
    },
    {
        "cat": "disaster",
        "catName": "熊本地震特別支援",
        "badge": "別枠8,000万円・保証割合100%",
        "title": "セーフティネット保証4号（中小企業支援）",
        "amount": "一般保証枠とは別枠無担保8,000万円（最大2億8,000万円）の信用保証",
        "desc": "熊本地震により売上が前年同月比20%以上減少している八代市内の中小企業・小規模事業者を対象に、別枠100%保証を提供します。",
        "extra": "当サイト内に「八代市 セーフティネット保証4号利用ガイド・売上減少率シミュレーター」をご用意しています。",
        "dept": "商工政策課 金融労働係",
        "phone": "0965-33-8513",
        "url": "yatsushiro-safetynet4.html",
        "urlLabel": "セーフティネット4号詳細 ↗",
        "icon": "safetynet",
        "life": ["working"],
        "family": ["general"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_partial"],
        "work": ["business", "agri"],
        "tags": ["#セーフティネット4号", "#別枠融資", "#売上20パーセント減", "#事業者支援"]
    }
]

CATEGORIES = [
    {"id": "housing", "name": "住まい・耐震・環境", "icon": "🏠", "desc": "耐震診断・改修、八代産材利用助成、ブロック塀撤去、合併浄化槽、空き家バンク"},
    {"id": "childcare", "name": "子育て・教育・就学", "icon": "🎒", "desc": "高校生まで医療費完全無償化、0〜5歳児保育料完全無償化、出産祝金、奨学金"},
    {"id": "health", "name": "健康・出産・女性", "icon": "🩺", "desc": "出産応援給付金（10万円）、産後ケア、不妊治療助成、特定健診・がん検診"},
    {"id": "senior", "name": "シニア・障がい福祉", "icon": "🤝", "desc": "高齢者住宅改修費給付、福祉タクシー利用助成、配食見守り、介護保険住宅改修"},
    {"id": "migration", "name": "移住・新婚・地域", "icon": "🌸", "desc": "移住定住補助金（最大50万）、結婚新生活支援（最大60万）、移住支援金（100万）"},
    {"id": "business", "name": "産業・農業・創業", "icon": "💼", "desc": "創業支援補助金、中小企業融資・利子補給、新規就農定着支援"},
    {"id": "disaster", "name": "熊本地震特別支援", "icon": "🆘", "desc": "第7版全54制度、公費解体、緊急修理、応急修理、支援金、災害援護資金、セーフティネット"}
]

def generate_html():
    html_parts = []
    total_count = len(SYSTEMS)
    
    # ヘッダー部分
    html_parts.append(f'''<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>八代市：暮らしの支援・補助金 総合ガイド（住まい・子育て・健康・福祉・産業）｜よか隊ネット熊本</title>
  <meta name="description" content="八代市の公式制度・補助金を網羅した総合ガイド。住まい（八代産材利用・耐震）、子育て（高校生医療費・0〜5歳児保育料の完全無償化）、シニア福祉、移住新婚、創業から被災者応援ガイドブック第7版など令和8年熊本地震特別支援まで、条件シミュレーターで活用できる制度を即座に探せます。">
  <link rel="stylesheet" href="styles.css?v=20260907-2">
  <link rel="stylesheet" href="design-system.css?v=20260907-2">
  <link rel="stylesheet" href="org-site.css?v=20260918-1">
  <link rel="stylesheet" href="yatsushiro-living-support.css?v=20260921-2">
  <link rel="canonical" href="https://www.yokatainet.jp/yatsushiro-living-support.html">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="ja_JP">
  <meta property="og:site_name" content="よか隊ネット熊本　災害・支援状況レポート">
  <meta property="og:title" content="八代市：暮らしの支援・補助金 総合ガイド（住まい・子育て・健康・福祉・産業）">
  <meta property="og:description" content="八代市の公式制度・補助金を網羅した総合ガイド。住まい（八代産材利用・耐震）、子育て（高校生医療費・0〜5歳児保育料の完全無償化）、シニア福祉、移住新婚、創業から被災者応援ガイドブック第7版など令和8年熊本地震特別支援まで、条件シミュレーターで活用できる制度を即座に探せます。">
  <meta property="og:url" content="https://www.yokatainet.jp/yatsushiro-living-support.html">
  <meta property="og:image" content="https://www.yokatainet.jp/ogp-yatsushiro-living-support.png">
  <meta property="og:image:secure_url" content="https://www.yokatainet.jp/ogp-yatsushiro-living-support.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="八代市：暮らしの支援・補助金 総合ガイド（住まい・子育て・健康・福祉・産業）｜よか隊ネット熊本　災害・支援状況レポート">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="八代市：暮らしの支援・補助金 総合ガイド（住まい・子育て・健康・福祉・産業）">
  <meta name="twitter:description" content="八代市の公式制度・補助金を網羅した総合ガイド。住まい（八代産材利用・耐震）、子育て（高校生医療費・0〜5歳児保育料の完全無償化）、シニア福祉、移住新婚、創業から被災者応援ガイドブック第7版など令和8年熊本地震特別支援まで、条件シミュレーターで活用できる制度を即座に探せます。">
  <meta name="twitter:image" content="https://www.yokatainet.jp/ogp-yatsushiro-living-support.png">
</head>
<body class="organization-site yatsushiro-living-support-page">
  <a class="skip" href="#mainContent">本文へ移動</a>
  <header class="site-header"></header>
  <main id="mainContent" class="uto-support-main">

    <!-- ヒーローヘッダー（全幅グラデーション＋内部幅制限1040px） -->
    <header class="uto-sup-hero">
      <div class="uto-sup-hero-inner">
        <!-- パンくずリスト -->
        <nav class="breadcrumb-nav" aria-label="パンくずリスト">
          <a href="index.html">ホーム</a>
          <span>&gt;</span>
          <a href="municipalities.html">自治体別の状況</a>
          <span>&gt;</span>
          <a href="municipalities.html?name=八代市">八代市</a>
          <span>&gt;</span>
          <span aria-current="page">暮らしの支援・補助金 総合ガイド</span>
        </nav>

        <div class="uto-sup-hero-badge">八代市公式情報を確認 · 主要{total_count}制度</div>
        <h1>八代市 暮らしの支援・補助金 総合ガイド</h1>
        <p class="uto-sup-hero-lead">
          八代市にお住まいの皆さまが活用できる、平時からの主要な支援制度・補助金と、令和8年熊本地震の特別支援を体系的に整理しました。<br>
          「あなたの現在の状況」を選択して、活用できる制度をお探しいただけます。掲載制度には八代市公式情報へのリンクと担当窓口を記載しています。掲載内容は令和8年9月21日改定の八代市「被災者応援ガイドブック第7版」および最新公式案内を確認したものです。
        </p>
      </div>
    </header>

    <!-- メインコンテンツシェル（幅1040px制限で中央揃え） -->
    <div class="uto-sup-shell">

      <!-- 被災者専用ガイドとの連携バナー -->
      <aside class="uto-sup-banner" aria-labelledby="yatsushiro-banner-title">
        <span class="uto-sup-banner-tag">熊本地震被災者支援連携</span>
        <h2 id="yatsushiro-banner-title">令和8年熊本地震「被災者応援ガイドブック第7版」を詳しく見たい方へ</h2>
        <p>八代市が令和8年9月21日に発行した第7版・全54制度の対象・金額・窓口や公費解体受付（9/28〜）、緊急修理期限延長（10/27まで）など、災害特化の解説は専用ページをご覧ください。</p>
        <ul class="uto-sup-banner-points">
          <li><strong>被災者応援ガイドブック第7版：</strong>令和8年9月21日改定・全54制度の支援メニューを完全網羅</li>
          <li><strong>公費解体・自費解体受付：</strong>半壊以上の住家等を市が解体撤去（事前予約：0965-37-7550）</li>
          <li><strong>緊急修理・応急修理：</strong>ブルーシート展張等の完了報告は10月27日まで延長、応急修理最大75.7万円</li>
        </ul>
        <div style="margin-top:16px; display:flex; gap:10px; flex-wrap:wrap;">
          <a href="yatsushiro-support.html" class="uto-card-link" style="display:inline-flex;">八代市 応援ガイド第7版を見る →</a>
          <a href="yatsushiro-rebuild.html" class="uto-card-link" style="display:inline-flex; background:#103b4f;">生活再建支援金ガイド →</a>
        </div>
      </aside>

      <!-- かんたん条件シミュレーター -->
      <section class="uto-sim-card" id="utoSimulator" aria-labelledby="utoSimTitle">
        <div class="uto-sim-header">
          <div class="uto-sim-title-group">
            <span class="uto-sim-badge">条件シミュレーター</span>
            <h2 id="utoSimTitle">現在の状況から、使える制度を調べる</h2>
          </div>
          <button type="button" class="uto-sim-reset-btn" id="utoSimResetBtn" aria-label="すべての選択条件をリセット">
            <span aria-hidden="true">↺</span> 条件をクリア
          </button>
        </div>
        <p class="uto-sim-guide">
          お困りごとや世帯の状況に合わせて、ワンタップで探せる「クイック診断」または「詳細条件」をお選びください。<br>
          <small class="uto-sim-privacy-note">※入力・選択された情報は外部に送信されず、お使いの端末（ブラウザ）内でのみ即座に計算されます。</small>
        </p>

        <!-- ① クイック診断プリセットボタン -->
        <div class="uto-sim-presets">
          <span class="uto-sim-presets-label">おすすめクイック診断：</span>
          <div class="uto-sim-preset-grid" role="group" aria-label="おすすめクイック診断">
            <button type="button" class="uto-sim-preset-btn" data-preset="childcare">
              <span class="preset-icon">🎒</span>
              <span class="preset-title">子育て・教育世帯</span>
              <span class="preset-desc">高校生まで医療費・0〜5歳保育料完全無償化</span>
            </button>
            <button type="button" class="uto-sim-preset-btn" data-preset="senior">
              <span class="preset-icon">👴</span>
              <span class="preset-title">シニア・在宅介護</span>
              <span class="preset-desc">住宅改修補助・福祉タクシー・緊急通報装置</span>
            </button>
            <button type="button" class="uto-sim-preset-btn" data-preset="housing">
              <span class="preset-icon">🏠</span>
              <span class="preset-title">住まい改修・耐震</span>
              <span class="preset-desc">耐震100万・八代産材利用助成・浄化槽補助</span>
            </button>
            <button type="button" class="uto-sim-preset-btn" data-preset="newlywed">
              <span class="preset-icon">💍</span>
              <span class="preset-title">新婚・移住検討</span>
              <span class="preset-desc">新生活最大60万・移住定住補助金50万</span>
            </button>
            <button type="button" class="uto-sim-preset-btn" data-preset="disaster">
              <span class="preset-icon">🚨</span>
              <span class="preset-title">熊本地震の被災世帯</span>
              <span class="preset-desc">応援ガイド第7版・公費解体・応急修理・支援金</span>
            </button>
            <button type="button" class="uto-sim-preset-btn" data-preset="business">
              <span class="preset-icon">💼</span>
              <span class="preset-title">自営業・農業・創業</span>
              <span class="preset-desc">セーフティネット4号・創業補助・新規就農</span>
            </button>
          </div>
        </div>

        <!-- ② 詳細条件折りたたみパネル（目立つデザイン） -->
        <details class="uto-sim-details" id="utoSimDetails">
          <summary class="uto-sim-details-summary">
            <div class="uto-sim-summary-content">
              <span class="uto-sim-gear-icon" aria-hidden="true">⚙️</span>
              <div class="uto-sim-summary-text">
                <strong class="uto-sim-summary-title">さらに詳細な条件で絞り込む</strong>
                <span class="uto-sim-summary-sub">年齢・世帯・住まい・収入・被災状況・お仕事など全23項目から選ぶ</span>
              </div>
            </div>
            <span class="uto-sim-summary-toggle">
              <span class="toggle-text">条件を開く</span>
              <span class="toggle-arrow" aria-hidden="true">▼</span>
            </span>
          </summary>
          <div class="uto-sim-filter-grid">

            <!-- 年代・ライフステージ -->
            <div class="uto-filter-group">
              <label class="uto-filter-label">年代・ライフステージ</label>
              <div class="uto-filter-chips">
                <label class="uto-chip-label">
                  <input type="checkbox" name="simLife" value="child_infant">
                  <span>妊娠中・乳幼児（0〜5歳）</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simLife" value="child_school">
                  <span>小中高生（6〜18歳）</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simLife" value="newlywed">
                  <span>新婚・若者（夫婦39歳以下）</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simLife" value="working">
                  <span>現役・勤労世代</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simLife" value="senior">
                  <span>シニア・高齢者（65歳以上）</span>
                </label>
              </div>
            </div>

            <!-- 世帯・家族構成 -->
            <div class="uto-filter-group">
              <label class="uto-filter-label">世帯・家族の状況</label>
              <div class="uto-filter-chips">
                <label class="uto-chip-label">
                  <input type="checkbox" name="simFamily" value="childcare">
                  <span>子育て中（子どもと同居）</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simFamily" value="single_parent">
                  <span>ひとり親世帯（母子・父子）</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simFamily" value="senior_only">
                  <span>独居・高齢者のみ世帯</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simFamily" value="disability">
                  <span>障がい者手帳・要介護認定あり</span>
                </label>
              </div>
            </div>

            <!-- 住まいの形態 -->
            <div class="uto-filter-group">
              <label class="uto-filter-label">住まいの状況</label>
              <div class="uto-filter-chips">
                <label class="uto-chip-label">
                  <input type="checkbox" name="simHousing" value="owned_wood">
                  <span>持ち家（木造一戸建て）</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simHousing" value="rental">
                  <span>借家・賃貸アパート</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simHousing" value="septic">
                  <span>浄化槽使用（水洗化検討）</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simHousing" value="vacant">
                  <span>空き家を所有・解体検討中</span>
                </label>
              </div>
            </div>

            <!-- 収入・所得の状況 -->
            <div class="uto-filter-group">
              <label class="uto-filter-label">所得・収入の状況</label>
              <div class="uto-filter-chips">
                <label class="uto-chip-label">
                  <input type="checkbox" name="simIncome" value="no_limit">
                  <span>所得制限なし（誰でもOK）</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simIncome" value="low_income">
                  <span>住民税非課税・低所得世帯</span>
                </label>
              </div>
            </div>

            <!-- 熊本地震の被害度 -->
            <div class="uto-filter-group">
              <label class="uto-filter-label">熊本地震の被害状況</label>
              <div class="uto-filter-chips">
                <label class="uto-chip-label">
                  <input type="checkbox" name="simDisaster" value="damage_heavy">
                  <span>全壊・大規模半壊・中規模半壊</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simDisaster" value="damage_half">
                  <span>半壊（解体検討含む）</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simDisaster" value="damage_partial">
                  <span>一部損壊（準半壊含む）</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simDisaster" value="none">
                  <span>被害なし（平時の支援を探す）</span>
                </label>
              </div>
            </div>

            <!-- お仕事・事業 -->
            <div class="uto-filter-group">
              <label class="uto-filter-label">お仕事・事業形態</label>
              <div class="uto-filter-chips">
                <label class="uto-chip-label">
                  <input type="checkbox" name="simWork" value="employee">
                  <span>会社員・パート・一般勤労</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simWork" value="business">
                  <span>個人事業主・自営業・中小企業</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simWork" value="agri">
                  <span>農林水産業（就農・農家）</span>
                </label>
                <label class="uto-chip-label">
                  <input type="checkbox" name="simWork" value="startup">
                  <span>新規創業・起業予定</span>
                </label>
              </div>
            </div>

          </div>
        </details>

        <!-- ③ 選択中条件・絞り込み結果サマリーバー -->
        <div class="uto-sim-active-bar" id="utoSimActiveBar" style="display: none;">
          <div class="uto-sim-active-top">
            <div class="uto-sim-result-badge">
              <span>🎯 絞り込み結果：</span>
              <strong class="uto-sim-result-count" id="utoSimResultCount">0件</strong>
              <span style="font-size: 0.85rem; color: #475569; font-weight: normal;">（主要{total_count}制度中）</span>
            </div>
            <div class="uto-sim-active-actions">
              <button type="button" class="uto-sim-scroll-btn" id="utoSimScrollBtn">
                <span>👇 該当する制度を見る</span>
              </button>
              <button type="button" class="uto-sim-clear-btn" id="utoSimClearBtn">
                <span>条件をすべて解除 ×</span>
              </button>
            </div>
          </div>
          <div class="uto-sim-active-tags-row">
            <span class="active-bar-label">適用中の条件：</span>
            <div class="active-tags-container" id="utoSimActiveTags"></div>
          </div>
        </div>
      </section>

      <!-- 八代市の3大特徴ハイライト -->
      <section class="uto-sup-highlights" aria-labelledby="yatsushiro-hl-title">
        <div class="uto-sup-hl-header">
          <div class="uto-sup-hl-kicker">
            <span class="uto-sup-hl-kicker-icon">💡</span>
            <span>自治体独自メリット・お得な制度連携</span>
          </div>
          <h2 id="yatsushiro-hl-title">知っておきたい！八代市の制度連携・独自メリット</h2>
          <p class="uto-sup-hl-sub">全国屈指の手厚い子育て支援策や、豊富な森林資源を活かした独自助成、そして最新の被災者応援ガイド第7版との連携など、八代市独自の強みを活かせます。</p>
        </div>
        <div class="uto-sup-hl-grid">
          <div class="uto-sup-hl-item">
            <div class="hl-item-top">
              <span class="hl-point-label">Point 01</span>
              <span class="hl-badge">全国屈指の手厚さ</span>
            </div>
            <h3>「0〜5歳児保育料完全無償化」＋「高校生医療費完全無償化」</h3>
            <p>八代市では国の幼児教育無償化に加え、市独自で0〜2歳児の保育料も完全無償化。さらに高校生までの医療費自己負担も全額助成（窓口負担原則ゼロ）されており、子育て負担の軽さは県内屈指です。</p>
          </div>
          <div class="uto-sup-hl-item">
            <div class="hl-item-top">
              <span class="hl-point-label">Point 02</span>
              <span class="hl-badge">地産地消の住まい</span>
            </div>
            <h3>八代産材利用促進事業＋木造耐震改修補助（100万円）</h3>
            <p>新築やリフォームにおいて八代産木材を使用することで工事費用の一部を助成。耐震改修補助金（最大100万円）と併用することで、安全で温もりのある住まいをお得に実現できます。</p>
          </div>
          <div class="uto-sup-hl-item">
            <div class="hl-item-top">
              <span class="hl-point-label">Point 03</span>
              <span class="hl-badge">最新被災者支援連携</span>
            </div>
            <h3>被災者応援ガイドブック「第7版」全54制度との連携</h3>
            <p>令和8年9月21日改定の「第7版」全54制度（住家の緊急修理期限延長、公費解体受付、生活再建支援金など）を網羅。平時の補助金と被災特別支援をひとつの画面でスムーズに見比べられます。</p>
          </div>
        </div>
      </section>

      <!-- 検索・絞り込みツールバー -->
      <section class="uto-sup-toolbar" aria-labelledby="yatsushiro-tool-title">
        <div class="uto-sup-search-row">
          <label for="utoSupSearch" id="yatsushiro-tool-title" class="uto-sup-search-label">キーワード検索：</label>
          <input type="text" id="utoSupSearch" class="uto-sup-search-input" placeholder="例：耐震、八代産材、医療費、保育料、解体、移住、創業..." autocomplete="off">
        </div>
        <div class="uto-sup-cat-row" role="group" aria-label="分野別カテゴリフィルター">
          <button type="button" class="uto-sup-cat-btn active" data-target-cat="all">すべて表示</button>
''')

    for cat in CATEGORIES:
        html_parts.append(f'''          <button type="button" class="uto-sup-cat-btn" data-target-cat="{cat["id"]}">{cat["name"]}</button>\n''')

    html_parts.append(f'''        </div>
      </section>

      <!-- 検索結果件数表示 -->
      <div class="uto-sup-status">
        <span id="utoSupCount">表示中：{total_count}件 / 主要{total_count}制度</span>
        <span class="uto-sup-status-source">確認日：2026年9月21日／情報源：八代市公式HP・応援ガイド第7版等</span>
      </div>

      <aside class="uto-sup-caution" role="note">
        <strong>申請前に必ず最新情報をご確認ください。</strong>
        制度は年度、予算、世帯状況などにより受付終了・金額変更・対象外となる場合があります。このページは八代市の全制度を網羅するものではありません。公式ページと担当窓口で、現在の受付状況・対象要件・必要書類を確認してください。
      </aside>

      <!-- 一致なし表示 -->
      <div id="utoSupEmpty" class="uto-sup-empty" style="display: none;">
        <p>該当する制度が見つかりませんでした。条件シミュレーターの「条件をクリア」ボタンを押すか、別のキーワードで検索してください。</p>
      </div>
''')

    for cat in CATEGORIES:
        cat_items = [s for s in SYSTEMS if s["cat"] == cat["id"]]
        if not cat_items:
            continue

        html_parts.append(f'''
      <!-- セクション: {cat["name"]} -->
      <section class="uto-sup-section" id="sec-{cat["id"]}" data-cat="{cat["id"]}">
        <header class="uto-sup-sec-header">
          <h2>{cat["name"]}</h2>
          <span class="sec-count">（{len(cat_items)}件）</span>
        </header>
        <div class="uto-sup-grid">
''')

        for item in cat_items:
            icon_svg = ICONS.get(item["icon"], ICONS["reform"])
            tag_spans = "".join([f'<span class="card-hash-tag">{t}</span>' for t in item.get("tags", [])])
            extra_html = f'<div class="uto-card-extra">{item["extra"]}</div>' if item.get("extra") else ''
            phone_raw = item.get("phone", "").replace("-", "")
            phone_link = f'<a class="uto-card-phone" href="tel:{phone_raw}">{item["phone"]}</a>' if item.get("phone") else ''
            url_target = ' target="_blank" rel="noopener"' if item["url"].startswith("http") else ''

            html_parts.append(f'''          <article class="uto-card"
                   data-life="{",".join(item["life"])}"
                   data-family="{",".join(item["family"])}"
                   data-housing="{",".join(item["housing"])}"
                   data-income="{",".join(item["income"])}"
                   data-disaster="{",".join(item["disaster"])}"
                   data-work="{",".join(item["work"])}">
            <div class="uto-card-header-flex">
              <div class="uto-card-icon-box" aria-hidden="true">
                {icon_svg}
              </div>
              <div class="uto-card-title-meta">
                <div class="uto-card-tag-row">
                  <span class="uto-badge-cat">{item["catName"]}</span>
                  <span class="uto-badge-feature">{item["badge"]}</span>
                  <span class="uto-badge-match" style="display: none;">🎯 該当</span>
                </div>
                <h3>{item["title"]}</h3>
              </div>
            </div>
            <div class="uto-card-amount-box">
              <span class="uto-card-amount-label">支援金額・内容</span>
              <div class="uto-card-amount">{item["amount"]}</div>
            </div>
            <p class="uto-card-desc">{item["desc"]}</p>
            {extra_html}
            <div class="uto-card-tags">
              {tag_spans}
            </div>
            <div class="uto-card-footer-flex">
              <div class="uto-card-dept-box">
                <span class="uto-card-dept-label">お問い合わせ・担当</span>
                <span class="uto-card-dept-name">{item["dept"]}</span>
                {phone_link}
              </div>
              <a class="uto-card-link" href="{item["url"]}"{url_target}>{item["urlLabel"]}</a>
            </div>
          </article>
''')

        html_parts.append('''        </div>
      </section>
''')

    # 庁舎案内・相談窓口フッター
    html_parts.append('''
      <!-- 窓口・庁舎案内 -->
      <section class="uto-sup-contact-box" aria-labelledby="yatsushiro-contact-title">
        <h3 id="yatsushiro-contact-title">八代市役所 お問い合わせ・窓口案内</h3>
        <p style="font-size:0.95rem; line-height:1.6; color:#475569; margin-bottom:18px;">
          各制度の申請要件、今年度の受付期限、必要書類などは制度ごとに異なります。詳しくは各カードに記載の担当課直通電話、または市役所代表窓口へお問い合わせください。
        </p>
        <div class="uto-sup-contact-grid">
          <div class="uto-sup-contact-item">
            <b>八代市役所（本庁舎）</b>
            <p>〒866-8601 熊本県八代市松江城町1-25<br>開庁時間：平日 8:30〜17:15</p>
            <a href="tel:0965334111">0965-33-4111（代表）</a>
          </div>
          <div class="uto-sup-contact-item">
            <b>八代市 生活援護課（被災者支援総合窓口）</b>
            <p>本庁舎内 生活援護課<br>生活再建支援金・義援金・被災者応援相談</p>
            <a href="tel:0965338722">0965-33-8722</a>
          </div>
          <div class="uto-sup-contact-item">
            <b>建物の解体・撤去（公費解体受付専用ダイヤル）</b>
            <p>公費解体・自費解体の事前予約・申請窓口<br>平日 9:00〜17:00</p>
            <a href="tel:0965377550">0965-37-7550</a>
          </div>
          <div class="uto-sup-contact-item">
            <b>八代商工会議所</b>
            <p>〒866-0862 八代市松江城町6-36<br>事業者支援・セーフティネット保証・創業相談</p>
            <a href="tel:0965326151">0965-32-6151</a>
          </div>
        </div>
        <p style="margin-top:20px; font-size:0.875rem; color:#64748b;">
          関連リンク：<a href="https://www.city.yatsushiro.lg.jp/" target="_blank" rel="noopener">八代市公式ホームページ ↗</a> · <a href="yatsushiro-support.html">八代市 被災者応援ガイドブック第7版</a> · <a href="yatsushiro-rebuild.html">八代市 生活再建支援金ガイド</a> · <a href="yatsushiro-loan.html">八代市 災害援護資金貸付ガイド</a> · <a href="yatsushiro-safetynet4.html">八代市 セーフティネット保証4号ガイド</a> · <a href="municipalities.html">自治体別支援情報へ戻る</a>
        </p>
      </section>

    </div>
  </main>
  <footer class="site-footer"></footer>
  <script src="org-site.js?v=20260907-2"></script>
  <script src="yatsushiro-living-support.js?v=20260921-2"></script>
</body>
</html>
''')

    content = "".join(html_parts)
    Path("yatsushiro-living-support.html").write_text(content, encoding="utf-8")
    print(f"Generated yatsushiro-living-support.html with {len(SYSTEMS)} systems and full 1-column layout.")

if __name__ == "__main__":
    generate_html()
