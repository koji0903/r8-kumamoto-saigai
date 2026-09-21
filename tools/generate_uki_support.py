#!/usr/bin/env python3
"""uki-living-support.html を生成するスクリプト（宇城市 暮らしの支援・補助金 総合ガイド）"""
import json
from pathlib import Path

# SVGアイコン定義（親しみやすく直感的なベクターイラスト）
ICONS = {
    "reform": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M14.5 12a2.5 2.5 0 0 0-3.5-3.5L8 11.5l4.5 4.5z"/><path d="m11.5 15 3.5 3.5"/></svg>''',
    "retrofit_check": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="14" r="3"/><path d="m14.5 16.5 2.5 2.5"/><path d="m9 13 2 2 4-4"/></svg>''',
    "retrofit_build": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M12 11v7"/><path d="M8 15h8"/><path d="M12 22s5-3 5-8V9l-5-2-5 2v5c0 5 5 8 5 8z" opacity="0.3"/></svg>''',
    "wall": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18"/><path d="M9 3v6M15 3v6M6 9v6M12 9v6M18 9v6M9 15v6M15 15v6"/></svg>''',
    "demolish": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="m7 7 10 10M17 7 7 17"/></svg>''',
    "septic": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/><path d="M12 12v6M9 15h6"/></svg>''',
    "compost": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 3.5 1 7.5-1.5 10.5M11 20a7 7 0 0 0 6.5-7.5"/><path d="M11 20v-8"/></svg>''',
    "vacant": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="14" r="2"/><path d="M12 16v3"/></svg>''',
    "child_med": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M19 8h4M21 6v4"/></svg>''',
    "child_benefit": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg>''',
    "single_parent": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>''',
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
    "consult": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/></svg>''',
    "disaster_loan": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M7 15h.01M17 15h.01"/></svg>''',
    "tax_relief": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg>'''
}

SYSTEMS = [
    # 1. 住まい・耐震・環境
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "自己負担無料・市が診断士派遣",
        "title": "戸建て木造住宅耐震診断事業",
        "amount": "自己負担無料（市が専門の木造住宅耐震診断士を派遣して全額負担）",
        "desc": "平成12年5月31日以前に着工された旧耐震基準・従来基準の木造一戸建て住宅、または熊本地震等で被災した木造住宅を対象に、市が専門の耐震診断士を無料で派遣して耐震安全性を総合調査します。",
        "extra": "耐震改修計画や建替えの第一歩として不可欠な公式診断です。調査結果に基づき、改修工事費用の補助制度へ進むことができます。",
        "dept": "建築指導課 建築指導係",
        "phone": "0964-32-1668",
        "url": "https://www.city.uki.kumamoto.jp/",
        "urlLabel": "宇城市公式：住宅耐震化支援 ↗",
        "icon": "retrofit_check",
        "life": ["working", "senior"],
        "family": ["general", "senior_only"],
        "housing": ["owned_wood"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_partial"],
        "work": ["all"],
        "tags": ["#木造住宅", "#旧耐震", "#無料耐震診断", "#持ち家"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "改修・建替え最大100万円補助",
        "title": "戸建て木造住宅耐震改修等事業補助金",
        "amount": "耐震改修・建替え：最大100万円補助 / 耐震シェルター設置：最大30万円補助",
        "desc": "耐震診断の結果、倒壊の危険性があると判定された木造住宅について、耐震改修工事、建替え工事、または寝室等の安全を確保する耐震シェルター設置の費用を補助します。",
        "extra": "大地震時の家屋倒壊から命を守るための基幹補助制度。高齢者世帯へのシェルター設置も手厚く支援されます。着工前の申請が必要です。",
        "dept": "建築指導課 建築指導係",
        "phone": "0964-32-1668",
        "url": "https://www.city.uki.kumamoto.jp/",
        "urlLabel": "宇城市公式：耐震改修補助 ↗",
        "icon": "retrofit_build",
        "life": ["working", "senior"],
        "family": ["general", "senior_only"],
        "housing": ["owned_wood"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_partial"],
        "work": ["all"],
        "tags": ["#耐震補強", "#建替え100万", "#シェルター30万"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "撤去・フェンス改修補助",
        "title": "危険ブロック塀等安全確保支援事業補助金",
        "amount": "撤去・改修費用の一定割合（上限額あり）",
        "desc": "避難路、通学路、緊急輸送道路等に面した倒壊の危険があるコンクリートブロック塀や石積塀等の撤去、および安全なフェンス等への改修費用を補助します。",
        "extra": "地震時の倒壊による歩行者の人身事故や避難路閉塞を防ぐための制度です。工事着工前の事前相談・現地確認が必須です。",
        "dept": "建築指導課 建築指導係",
        "phone": "0964-32-1668",
        "url": "https://www.city.uki.kumamoto.jp/",
        "urlLabel": "宇城市公式：ブロック塀安全対策 ↗",
        "icon": "wall",
        "life": ["working", "senior"],
        "family": ["general"],
        "housing": ["owned_wood", "vacant"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_partial"],
        "work": ["all"],
        "tags": ["#ブロック塀撤去", "#通学路安全", "#防災"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "解体費最大50万円",
        "title": "宇城市老朽危険空家等除却推進事業補助金",
        "amount": "解体撤去費用の1/3（上限50万円）",
        "desc": "倒壊や屋根材崩落等の危険性が高く、周辺の生活環境に深刻な悪影響を及ぼす「特定空家等」の解体・撤去費用を補助します。",
        "extra": "事前調査による危険度判定基準を満たす必要があります。管理にお困りの相続人・所有者の方は事前相談をご利用ください。",
        "dept": "まちづくり推進課 まちづくり推進係",
        "phone": "0964-32-1114",
        "url": "https://www.city.uki.kumamoto.jp/",
        "urlLabel": "宇城市公式：空き家対策 ↗",
        "icon": "demolish",
        "life": ["working", "senior"],
        "family": ["general"],
        "housing": ["vacant"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_partial"],
        "work": ["all"],
        "tags": ["#空き家解体", "#上限50万", "#住環境改善"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "水回り改善・転換補助上乗せ",
        "title": "合併処理浄化槽設置整備事業補助金",
        "amount": "人槽区分に応じた設置補助＋単独・汲み取り転換時の撤去・配管上乗せ補助",
        "desc": "公共下水道事業計画区域外において、専用住宅に高性能な合併処理浄化槽を設置する費用の一部を補助。単独処理浄化槽や汲み取り便槽からの転換には手厚い上乗せ助成があります。",
        "extra": "生活排水による河川や海の汚染を防ぎ、清潔な水洗トイレ・水回りを実現します。着工前の申請が必要です。",
        "dept": "衛生環境課 保健衛生係",
        "phone": "0964-32-1371",
        "url": "https://www.city.uki.kumamoto.jp/",
        "urlLabel": "宇城市公式：浄化槽補助金 ↗",
        "icon": "septic",
        "life": ["working", "senior", "newlywed"],
        "family": ["general"],
        "housing": ["owned_wood", "septic"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_partial"],
        "work": ["all"],
        "tags": ["#浄化槽", "#水回りリフォーム", "#単独切替上乗せ"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "購入費の1/2助成",
        "title": "生ごみ処理機等購入費補助金",
        "amount": "購入費用の1/2（上限額あり）",
        "desc": "家庭から排出される生ごみの減量化と自家堆肥化を促進するため、電動生ごみ処理機やコンポスト容器の購入費用の一部を助成します。",
        "extra": "ごみ出しの手間を減らし、家庭菜園やガーデニングの良質な堆肥として再利用できます。",
        "dept": "衛生環境課 保健衛生係",
        "phone": "0964-32-1371",
        "url": "https://www.city.uki.kumamoto.jp/",
        "urlLabel": "宇城市公式：環境衛生 ↗",
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
        "badge": "成約物件の改修支援",
        "title": "空き家・空き地バンク活用促進補助金",
        "amount": "バンク登録物件の改修費用等の一部補助",
        "desc": "宇城市空き家・空き地バンクに登録・成約した物件について、移住者や購入者が行う居住環境整備・改修工事の費用を支援します。",
        "extra": "住宅金融支援機構の「フラット35」金利優遇措置とも連携し、有利な条件で取得・改修が可能です。",
        "dept": "まちづくり推進課 まちづくり推進係",
        "phone": "0964-32-1114",
        "url": "https://www.city.uki.kumamoto.jp/q/aview/128/1283.html",
        "urlLabel": "宇城市公式：空き家・空き地バンク ↗",
        "icon": "vacant",
        "life": ["working", "newlywed"],
        "family": ["general", "childcare"],
        "housing": ["vacant", "owned_wood"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#空き家バンク", "#改修助成", "#フラット35連携"]
    },

    # 2. 子育て・教育・就学
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学",
        "badge": "高校生まで助成・完全無償化へ拡充",
        "title": "宇城市こども医療費助成制度",
        "amount": "18歳年度末までの通院・入院自己負担分を助成（令和8年10月より自己負担完全無償化）",
        "desc": "宇城市内に居住し健康保険に加入している0歳から高校生年代（18歳到達年度末）までの子どもの保険診療医療費の一部負担金を助成。未就学児は自己負担なし。さらに令和8年10月診療分からは18歳まで自己負担なしの完全無償化へ拡充されます。",
        "extra": "【令和8年10月拡充】高校生年代まで窓口負担がゼロになり、子育て世帯の医療費負担を大幅に軽減します。",
        "dept": "子ども未来課 給付支援係",
        "phone": "0964-32-1404",
        "url": "https://www.city.uki.kumamoto.jp/",
        "urlLabel": "宇城市公式：こども医療費助成 ↗",
        "icon": "child_med",
        "life": ["child_infant", "child_school"],
        "family": ["childcare", "single_parent"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#こども医療費", "#18歳まで無償化", "#高校生対象", "#所得制限なし"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学",
        "badge": "高校生まで支給・所得制限なし",
        "title": "児童手当（制度拡充版）",
        "amount": "0〜2歳：1.5万円 / 3歳〜高校生：1万円（第3子以降は月3万円）",
        "desc": "高校生年代（18歳到達の最初の3月31日）までの児童を養育している父母等に支給される国の手当。所得制限が撤廃され、第3子以降は手当額が月3万円へ増額されています。",
        "extra": "出生や転入時は、事由発生日の翌日から15日以内に子ども未来課または各支所総合窓口課で手続きを行ってください。",
        "dept": "子ども未来課 給付支援係",
        "phone": "0964-32-1404",
        "url": "https://www.city.uki.kumamoto.jp/",
        "urlLabel": "宇城市公式：児童手当 ↗",
        "icon": "child_benefit",
        "life": ["child_infant", "child_school"],
        "family": ["childcare", "single_parent"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#児童手当", "#高校生まで", "#第3子3万円", "#所得制限なし"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学",
        "badge": "医療費自己負担を助成",
        "title": "ひとり親家庭等医療費助成制度",
        "amount": "保険診療の自己負担額（一部控除あり）を助成",
        "desc": "母子家庭・父子家庭の母・父およびその児童、父母のいない児童を対象に、病気やけがで医療機関を受診した際の保険診療自己負担分を助成します。",
        "extra": "母子父子家庭の健康維持と自立を支える制度です。所得制限基準があります。事前登録により受給資格者証が交付されます。",
        "dept": "子ども未来課 給付支援係",
        "phone": "0964-32-1404",
        "url": "https://www.city.uki.kumamoto.jp/",
        "urlLabel": "宇城市公式：ひとり親支援 ↗",
        "icon": "single_parent",
        "life": ["child_infant", "child_school", "working"],
        "family": ["single_parent"],
        "housing": ["owned_wood", "rental"],
        "income": ["low_income"],
        "disaster": ["none", "damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#ひとり親", "#母子父子支援", "#医療費助成"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学",
        "badge": "学用品費・給食費などを援助",
        "title": "就学援助制度（小中学校）",
        "amount": "学用品費、給食費、修学旅行費、校外活動費、新入学用品費などの援助",
        "desc": "宇城市立の小・中学校に通う児童生徒の保護者で、経済的にお困りの世帯（市県民税非課税世帯や所得基準以下）に対し、学校生活に必要な学用品や学校給食費等の実費相当を援助します。",
        "extra": "毎年前期・後期に受付。災害による急な家計急変時にも随時申請を受け付けています。",
        "dept": "学校教育課 学務給食係",
        "phone": "0964-32-1811",
        "url": "https://www.city.uki.kumamoto.jp/",
        "urlLabel": "宇城市公式：教育委員会・就学援助 ↗",
        "icon": "school_aid",
        "life": ["child_school"],
        "family": ["childcare", "single_parent"],
        "housing": ["owned_wood", "rental"],
        "income": ["low_income"],
        "disaster": ["none", "damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#就学援助", "#給食費援助", "#学用品費", "#家計急変対応"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学",
        "badge": "放課後の安全な居場所",
        "title": "放課後児童健全育成事業（放課後児童クラブ）",
        "amount": "月額利用料助成（減免制度あり）",
        "desc": "保護者が就労等により昼間家庭にいない小学校就学児童を対象に、放課後や学校休業日（夏休み等）に適切な遊びと生活の場を提供し、健全育成を図ります。",
        "extra": "市内各小学校区に整備されており、生活保護世帯・ひとり親世帯等への利用料減免制度もあります。",
        "dept": "子ども未来課 保育支援係",
        "phone": "0964-32-1404",
        "url": "https://www.city.uki.kumamoto.jp/",
        "urlLabel": "宇城市公式：放課後児童クラブ ↗",
        "icon": "afterschool",
        "life": ["child_school"],
        "family": ["childcare", "single_parent"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["employee", "business", "agri"],
        "tags": ["#学童保育", "#共働き応援", "#利用料減免"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学",
        "badge": "無利子貸与で進学を応援",
        "title": "宇城市奨学金制度",
        "amount": "高等学校：月額1.5万〜2万円 / 大学等：月額3万〜4.5万円（無利子）",
        "desc": "向学心に富みながら、経済的理由により修学が困難な高校生・高専生・大学生等に対し、学資金を無利子で貸与し、有能な人材を育成します。",
        "extra": "卒業後に無理のない計画で返還する仕組みです。国の給付型奨学金や日本学生支援機構（JASSO）との併用も相談できます。",
        "dept": "学校教育課 総務係",
        "phone": "0964-32-1811",
        "url": "https://www.city.uki.kumamoto.jp/",
        "urlLabel": "宇城市公式：教育総務・奨学金 ↗",
        "icon": "edu_loan",
        "life": ["child_school", "working"],
        "family": ["childcare", "single_parent"],
        "housing": ["owned_wood", "rental"],
        "income": ["low_income"],
        "disaster": ["none", "damage_heavy", "damage_half"],
        "work": ["all"],
        "tags": ["#奨学金", "#無利子貸与", "#高校大学進学"]
    },

    # 3. 健康・出産・女性
    {
        "cat": "health",
        "catName": "健康・出産・女性",
        "badge": "伴走相談＋計10万円給付",
        "title": "出産・子育て応援交付金（国の経済的支援）",
        "amount": "妊娠届出時5万円＋出生時5万円（計10万円相当）",
        "desc": "すべての妊産婦・子育て世帯が安心して出産・育児できるよう、保健師等の専門職による面談（妊娠期・出産前・産後）と、計10万円の応援給付金を一体的に提供します。",
        "extra": "母子健康手帳交付時の面談、および赤ちゃん訪問（こんにちは赤ちゃん事業）での面談を経て申請・給付されます。",
        "dept": "保健センター 保健予防係",
        "phone": "0964-32-1111",
        "url": "https://www.city.uki.kumamoto.jp/",
        "urlLabel": "宇城市公式：母子保健 ↗",
        "icon": "heart",
        "life": ["child_infant", "newlywed"],
        "family": ["childcare"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#出産応援10万", "#妊婦面談", "#安心育児"]
    },
    {
        "cat": "health",
        "catName": "健康・出産・女性",
        "badge": "宿泊・日帰り・訪問ケア",
        "title": "宇城市産後ケア事業",
        "amount": "利用料金の大部分を公費負担（自己負担数千円程度）",
        "desc": "産後に家族等から十分な家事・育児支援が受けられないお母さんと生後1年未満の赤ちゃんを対象に、助産所や医療機関での宿泊、デイサービス、助産師の居宅訪問により心身のケアや授乳指導を提供します。",
        "extra": "産後の不安や孤立、育児疲れを予防する手厚いケア。非課税世帯や生活保護世帯には利用料の減免制度があります。",
        "dept": "保健センター 保健予防係",
        "phone": "0964-32-1111",
        "url": "https://www.city.uki.kumamoto.jp/",
        "urlLabel": "宇城市公式：母子保健 ↗",
        "icon": "postpartum",
        "life": ["child_infant"],
        "family": ["childcare"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#産後ケア", "#助産師サポート", "#育児不安解消"]
    },
    {
        "cat": "health",
        "catName": "健康・出産・女性",
        "badge": "不妊治療の自己負担軽減",
        "title": "宇城市不妊治療費助成事業",
        "amount": "保険適用外の先進医療や一般不妊治療等の自己負担額助成（上限額あり）",
        "desc": "子どもを望むご夫婦の経済的負担を軽減するため、保険診療と併用して実施される先進医療や、特定不妊治療（体外受精・顕微授精等）の自己負担費用を一部助成します。",
        "extra": "熊本県の支援制度とも連携し、安心して治療に専念できるようサポートします。治療終了後の期限内申請が必要です。",
        "dept": "保健センター 保健予防係",
        "phone": "0964-32-1111",
        "url": "https://www.city.uki.kumamoto.jp/",
        "urlLabel": "宇城市公式：健康づくり ↗",
        "icon": "fertility",
        "life": ["newlywed", "working"],
        "family": ["general"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#不妊治療助成", "#先進医療", "#妊活サポート"]
    },
    {
        "cat": "health",
        "catName": "健康・出産・女性",
        "badge": "早期発見・ワンコイン健診",
        "title": "宇城市特定健康診査・各種がん検診",
        "amount": "無料または数百円〜千円程度で受診可能（節目年齢無料クーポンあり）",
        "desc": "生活習慣病予防のための特定健診（40〜74歳国保加入者）や、胃がん・肺がん・大腸がん・乳がん・子宮頸がん検診を格安または無料で実施。集団健診や指定医療機関での個別受診が選べます。",
        "extra": "被災後の生活リズム変化やストレスによる健康被害を防ぐためにも、毎年の受診が強く推奨されています。",
        "dept": "保健センター 保健予防係",
        "phone": "0964-32-1111",
        "url": "https://www.city.uki.kumamoto.jp/",
        "urlLabel": "宇城市公式：健診・検診 ↗",
        "icon": "checkup",
        "life": ["working", "senior"],
        "family": ["general", "senior_only"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#特定健診", "#がん検診", "#無料クーポン", "#生活習慣病予防"]
    },

    # 4. シニア・障がい福祉
    {
        "cat": "senior",
        "catName": "シニア・障がい福祉",
        "badge": "市独自助成・在宅安心",
        "title": "宇城市在宅要介護高齢者住宅改造助成事業",
        "amount": "住宅改造費用の一定割合を助成（介護保険給付と別枠）",
        "desc": "在宅の要介護高齢者（要介護認定者等）が住み慣れた自宅で安心して自立生活を続けられるよう、浴室、トイレ、玄関、居室などのバリアフリー住宅改造費用を助成します。",
        "extra": "介護保険の住宅改修（限度額20万円）と連携・補完する市独自の助成制度。所得要件等の基準があります。着工前の申請が必要です。",
        "dept": "高齢介護課 高齢者支援係",
        "phone": "0964-32-1406",
        "url": "https://www.city.uki.kumamoto.jp/",
        "urlLabel": "宇城市公式：高齢者福祉 ↗",
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
        "badge": "上限20万円の7〜9割支給",
        "title": "介護保険 住宅改修費支給",
        "amount": "上限20万円の工事費に対し、7割〜9割（最大18万円）を保険給付",
        "desc": "要支援・要介護の認定を受けた方が暮らす住宅で、手すりの取付け、段差の解消、滑り止め、引き戸への扉取替え、和式から洋式便器への取替え等の工事費を給付します。",
        "extra": "ケアマネジャーが作成する「住宅改修が必要な理由書」が必要です。着工前の事前申請が必須となります。",
        "dept": "高齢介護課 介護保険係",
        "phone": "0964-32-1406",
        "url": "https://www.city.uki.kumamoto.jp/",
        "urlLabel": "宇城市公式：介護保険 ↗",
        "icon": "reform",
        "life": ["senior"],
        "family": ["senior_only", "disability"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_partial"],
        "work": ["all"],
        "tags": ["#介護保険", "#手すり設置", "#段差解消", "#ケアマネ相談"]
    },
    {
        "cat": "senior",
        "catName": "シニア・障がい福祉",
        "badge": "タクシー利用券交付",
        "title": "宇城市高齢者・障がい者福祉タクシー利用料金助成",
        "amount": "一般タクシー利用券（初乗り運賃相当等）の年間助成",
        "desc": "自力での移動や公共交通機関の利用が困難な在宅重度障がい者や一定基準を満たす高齢者を対象に、通院や生活必需品の買い物等の移動を支援する福祉タクシー利用券を交付します。",
        "extra": "運転免許証返納後の移動手段としても重宝されています。手帳等級や年齢・所得条件をご確認ください。",
        "dept": "社会福祉課 障がい福祉係 / 高齢介護課",
        "phone": "0964-32-1387",
        "url": "https://www.city.uki.kumamoto.jp/",
        "urlLabel": "宇城市公式：障がい福祉 ↗",
        "icon": "taxi",
        "life": ["senior"],
        "family": ["senior_only", "disability"],
        "housing": ["owned_wood", "rental"],
        "income": ["low_income"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#福祉タクシー", "#通院支援", "#移動支援", "#免許返納"]
    },
    {
        "cat": "senior",
        "catName": "シニア・障がい福祉",
        "badge": "栄養管理＋安否確認",
        "title": "宇城市高齢者食の自立支援事業（配食サービス）",
        "amount": "市助成により1食あたり実費負担のみ（週数回利用可）",
        "desc": "一人暮らしや高齢者のみの世帯で、老衰や心身の障害等により自炊が困難な高齢者に対し、栄養バランスの整った食事をご自宅へお届けし、手渡しによる安否確認を行います。",
        "extra": "健康維持だけでなく、異変があった際の早期発見・家族への連絡など、見守りネットワークとしても機能します。",
        "dept": "高齢介護課 地域包括支援センター",
        "phone": "0964-32-1406",
        "url": "https://www.city.uki.kumamoto.jp/",
        "urlLabel": "宇城市公式：高齢者配食 ↗",
        "icon": "meal",
        "life": ["senior"],
        "family": ["senior_only"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#配食サービス", "#見守り安否確認", "#栄養バランス"]
    },
    {
        "cat": "senior",
        "catName": "シニア・障がい福祉",
        "badge": "ボタン1つで急報",
        "title": "宇城市緊急通報システム貸与事業",
        "amount": "機器設置・基本利用料公費負担（所得に応じた一部負担あり）",
        "desc": "ひとり暮らしの高齢者や重度身体障がい者の自宅に緊急通報装置を設置。急病や事故等の緊急時にボタンを押すだけで受信センターへ通報され、協力員や消防本部と連携して迅速に救助を行います。",
        "extra": "ペンダント型送信機も付属し、入浴中や就寝時の急変時にも対応可能です。",
        "dept": "高齢介護課 高齢者支援係",
        "phone": "0964-32-1406",
        "url": "https://www.city.uki.kumamoto.jp/",
        "urlLabel": "宇城市公式：高齢者福祉 ↗",
        "icon": "emergency_bell",
        "life": ["senior"],
        "family": ["senior_only", "disability"],
        "housing": ["owned_wood", "rental"],
        "income": ["low_income"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#緊急通報", "#ボタン通報", "#一人暮らし安心"]
    },
    {
        "cat": "senior",
        "catName": "シニア・障がい福祉",
        "badge": "補聴器・車椅子等の公費支給",
        "title": "補装具費支給制度（身体障害者手帳所持者）",
        "amount": "原則1割の自己負担で補装具（補聴器・車椅子・義肢・装具等）の購入・修理費支給",
        "desc": "身体障がい者の身体機能を補完・代替するため、補聴器、車椅子、歩行器、義肢、装具などの購入費用や修理費用を支給します。",
        "extra": "医師の意見書や判定が必要となります。必ず購入・修理の契約前に社会福祉課へご相談ください。",
        "dept": "社会福祉課 障がい福祉係",
        "phone": "0964-32-1387",
        "url": "https://www.city.uki.kumamoto.jp/",
        "urlLabel": "宇城市公式：補装具費支給 ↗",
        "icon": "aid_hearing",
        "life": ["senior", "working", "child_school"],
        "family": ["disability"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#補聴器", "#車椅子", "#補装具", "#障がい者支援"]
    },

    # 5. 移住・新婚・地域
    {
        "cat": "migration",
        "catName": "移住・新婚・地域",
        "badge": "新生活費用最大30〜60万円",
        "title": "宇城市結婚新生活支援事業補助金",
        "amount": "新婚世帯に住居費・引越費用等を補助（夫婦29歳以下最大60万円、39歳以下最大30万円）",
        "desc": "新婚夫婦の新たな門出を後押しするため、婚姻に伴う住宅取得費用、住宅賃借費用（敷金・礼金・家賃等）、および引越し業者への支払費用を補助します。",
        "extra": "婚姻日や年齢、世帯所得の要件があります。予算上限に達し次第受付終了となるため、婚姻届提出後の早めの申請をおすすめします。",
        "dept": "まちづくり推進課 まちづくり推進係",
        "phone": "0964-32-1114",
        "url": "https://www.city.uki.kumamoto.jp/q/aview/264/27988.html",
        "urlLabel": "宇城市公式：結婚新生活支援 ↗",
        "icon": "wedding",
        "life": ["newlywed"],
        "family": ["general"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#新婚補助金", "#最大60万", "#家賃引越補助", "#若者夫婦"]
    },
    {
        "cat": "migration",
        "catName": "移住・新婚・地域",
        "badge": "単身60万・世帯100万円＋加算",
        "title": "宇城市移住支援金（就業・起業・テレワーク）",
        "amount": "2人以上世帯100万円 / 単身60万円（18歳未満の子ども1人につき加算あり）",
        "desc": "東京圏等の対象地域から宇城市へ移住し、県のマッチングサイト掲載企業へ就職、起業、または専門人材・テレワーク移住を行った方へ支援金を支給します。",
        "extra": "豊かな自然と生活利便性が調和した宇城市での新しい暮らしを強力にサポート。移住ポータル「UKINISUM」で相談できます。",
        "dept": "まちづくり推進課 まちづくり推進係",
        "phone": "0964-32-1114",
        "url": "https://www.city.uki.kumamoto.jp/ukinisum/",
        "urlLabel": "宇城市移住定住サイト「UKINISUM」 ↗",
        "icon": "moving",
        "life": ["working", "newlywed"],
        "family": ["general", "childcare"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["employee", "startup"],
        "tags": ["#移住支援金", "#100万支給", "#子育て加算", "#UKINISUM"]
    },

    # 6. 産業・農業・創業
    {
        "cat": "business",
        "catName": "産業・農業・創業",
        "badge": "OGAWA Lab.連携・設備補助",
        "title": "宇城市創業支援事業補助金",
        "amount": "創業に要する経費（店舗改修・設備導入・広報費等）の一部補助（上限最大200万円等）",
        "desc": "宇城市内での新規創業や新事業展開を促進するため、店舗や事業所の改修費用、機械設備導入費、販路開拓費用を助成します。",
        "extra": "創業支援拠点「OGAWA Lab.（小川ラボ）」や「うきコテナ」等と連携し、経営指導や専門家相談、コワーキング環境も提供されます。",
        "dept": "しごと創生課 しごと創生係",
        "phone": "0964-32-1604",
        "url": "https://www.city.uki.kumamoto.jp/q/list/ps_cat_id/1288",
        "urlLabel": "宇城市公式：起業家支援 ↗",
        "icon": "startup",
        "life": ["working"],
        "family": ["general"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["startup", "business"],
        "tags": ["#創業支援", "#小川ラボ", "#店舗改修", "#設備投資"]
    },
    {
        "cat": "business",
        "catName": "産業・農業・創業",
        "badge": "低利融資・利子補給",
        "title": "宇城市中小企業振興資金融資制度",
        "amount": "低利融資枠＋市による利子補給・保証料支援",
        "desc": "市内の中小企業者・小規模事業者の経営基盤強化や資金繰りを円滑にするため、金融機関・熊本県信用保証協会と協調した公的融資制度です。",
        "extra": "運転資金や設備資金として利用可能。商工会や各金融機関で事前相談を受け付けています。",
        "dept": "しごと創生課 商工振興係",
        "phone": "0964-32-1604",
        "url": "https://www.city.uki.kumamoto.jp/",
        "urlLabel": "宇城市公式：商工振興 ↗",
        "icon": "loan_biz",
        "life": ["working"],
        "family": ["general"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_partial"],
        "work": ["business"],
        "tags": ["#中小企業融資", "#利子補給", "#資金繰り支援"]
    },
    {
        "cat": "business",
        "catName": "産業・農業・創業",
        "badge": "新規就農を包括サポート",
        "title": "新規就農者育成・就農定着支援事業",
        "amount": "就農準備・経営開始資金交付＋機械・施設整備助成",
        "desc": "宇城市で新たに農業を始める意欲的な就農者に対し、就農直後の所得を確保する資金給付や、ビニールハウス・農業機械の導入経費を補助します。",
        "extra": "温暖な気候を活かした果樹（柑橘等）・野菜・水稲の就農地として、技術習得から農地確保まで手厚く伴走します。",
        "dept": "農業振興課 農政係",
        "phone": "0964-32-1644",
        "url": "https://www.city.uki.kumamoto.jp/",
        "urlLabel": "宇城市公式：農政案内 ↗",
        "icon": "farmer",
        "life": ["working", "newlywed"],
        "family": ["general"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["agri", "startup"],
        "tags": ["#新規就農", "#就農給付金", "#農業機械補助"]
    },

    # 7. 熊本地震特別支援
    {
        "cat": "disaster",
        "catName": "熊本地震特別支援",
        "badge": "最大300万円支給",
        "title": "被災者生活再建支援金",
        "amount": "基礎支援金（最大100万円）＋加算支援金（最大200万円、合計最大300万円）",
        "desc": "住家に全壊、大規模半壊、中規模半壊等の甚大な被害を受けた世帯に対し、被害程度に応じた「基礎支援金」と、その後の住宅再建方法（建設・購入・補修・賃借）に応じた「加算支援金」を支給します。",
        "extra": "解体や長期避難も対象。単身世帯は各額の3/4。り災証明書、住民票、契約書等が必要です。",
        "dept": "危機管理課 復興支援係",
        "phone": "0964-32-1798",
        "url": "https://www.city.uki.kumamoto.jp/",
        "urlLabel": "宇城市公式：生活再建支援金 ↗",
        "icon": "rebuild",
        "life": ["working", "senior", "newlywed"],
        "family": ["general", "childcare", "senior_only"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["damage_heavy", "damage_half"],
        "work": ["all"],
        "tags": ["#生活再建支援金", "#最大300万", "#全壊中規模半壊", "#加算支援金"]
    },
    {
        "cat": "disaster",
        "catName": "熊本地震特別支援",
        "badge": "市から業者へ直接支払い",
        "title": "住宅の応急修理制度（災害救助法）",
        "amount": "準半壊・半壊・中規模半壊・大規模半壊等：1世帯あたり最大75万7千円（準半壊は別上限）",
        "desc": "被害を受けそのままでは住むことができない住宅について、日常生活に不可欠な部分（屋根・外壁・床・水回り等）の応急修理を市が施工業者へ委託して実施する現物給付制度です。",
        "extra": "【注意】被災者が自ら業者に工事代金を支払った後は対象外となります。必ず工事着工・契約前に申請してください。",
        "dept": "建築指導課 建築指導係",
        "phone": "0964-32-1668",
        "url": "https://www.city.uki.kumamoto.jp/",
        "urlLabel": "宇城市公式：住宅応急修理 ↗",
        "icon": "emergency_repair",
        "life": ["working", "senior", "newlywed"],
        "family": ["general", "childcare", "senior_only"],
        "housing": ["owned_wood"],
        "income": ["no_limit"],
        "disaster": ["damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#応急修理", "#最大75.7万", "#先払い不可", "#日常最小限"]
    },
    {
        "cat": "disaster",
        "catName": "熊本地震特別支援",
        "badge": "司法書士・弁護士・行政書士",
        "title": "宇城市 被災者支援のための無料相談会",
        "amount": "予約不要・相談無料（面談形式）",
        "desc": "被災ローン減免制度、土地建物の相続・登記、借家・損害賠償、支援金申請書類の書き方など、法的手続きや権利関係の悩みを専門家に直接対面で相談できます。",
        "extra": "市役所新館や小川ラポートで定期開催（日曜開催あり）。建築士による住宅相談も併催される日があります。",
        "dept": "総務課 文書法規係",
        "phone": "0964-32-1798",
        "url": "uki-consultation.html",
        "urlLabel": "宇城市無料相談会ガイドを見る →",
        "icon": "consult",
        "life": ["working", "senior", "newlywed"],
        "family": ["general", "senior_only"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#無料相談会", "#司法書士弁護士", "#ローン減免", "#予約不要"]
    },
    {
        "cat": "disaster",
        "catName": "熊本地震特別支援",
        "badge": "上限150万〜350万円・無利子可",
        "title": "宇城市 災害援護資金貸付",
        "amount": "被害程度・世帯主負傷に応じ最大350万円（保証人で無利子、据置最長5年・償還10年）",
        "desc": "災害により世帯主が負傷、または住居や家財に損害を受けた世帯に対し、生活再建のための資金を低利または無利子で貸し付けます。",
        "extra": "所得制限基準があります。保証人を立てることで償還期間中ずっと無利子となります。",
        "dept": "社会福祉課 総務係",
        "phone": "0964-32-1387",
        "url": "https://www.city.uki.kumamoto.jp/",
        "urlLabel": "宇城市公式：生活支援 ↗",
        "icon": "disaster_loan",
        "life": ["working", "senior"],
        "family": ["general", "childcare", "senior_only"],
        "housing": ["owned_wood", "rental"],
        "income": ["low_income"],
        "disaster": ["damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#災害貸付", "#無利子保証人", "#上限350万"]
    },
    {
        "cat": "disaster",
        "catName": "熊本地震特別支援",
        "badge": "市税・国保・上下水道等の減免",
        "title": "被災に伴う税金・保険料・公共料金の減免・猶予",
        "amount": "被害割合や所得減少に応じた全額免除・減額または徴収猶予",
        "desc": "住家の損壊や所得の減少が生じた世帯を対象に、市県民税、固定資産税、国民健康保険税、介護保険料、上下水道料金等の減免や納期限延長を行います。",
        "extra": "り災証明書や所得状況を確認できる書類が必要です。各税目・料金の担当課へご相談ください。",
        "dept": "税務課 / 保険年金課 / 上下水道課",
        "phone": "0964-32-1111",
        "url": "https://www.city.uki.kumamoto.jp/",
        "urlLabel": "宇城市公式：減免案内 ↗",
        "icon": "tax_relief",
        "life": ["working", "senior"],
        "family": ["general", "senior_only"],
        "housing": ["owned_wood", "rental"],
        "income": ["low_income"],
        "disaster": ["damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#税減免", "#国保減免", "#水道減免", "#徴収猶予"]
    }
]

CATEGORIES = [
    {"id": "housing", "name": "住まい・耐震・環境", "icon": "🏠", "desc": "耐震診断・改修、危険ブロック塀撤去、空き家解体、合併浄化槽など"},
    {"id": "childcare", "name": "子育て・教育・就学", "icon": "🎒", "desc": "18歳まで医療費無償化、児童手当、就学援助、放課後児童クラブ、奨学金"},
    {"id": "health", "name": "健康・出産・女性", "icon": "🩺", "desc": "出産・子育て応援給付金（10万円）、産後ケア、不妊治療助成、各種健診"},
    {"id": "senior", "name": "シニア・障がい福祉", "icon": "🤝", "desc": "在宅高齢者住宅改造助成、介護保険住宅改修、福祉タクシー、配食サービス"},
    {"id": "migration", "name": "移住・新婚・地域", "icon": "🌸", "desc": "結婚新生活支援（最大60万）、移住支援金（100万）、空き家バンク改修"},
    {"id": "business", "name": "産業・農業・創業", "icon": "💼", "desc": "小川ラボ連携創業支援、中小企業融資・利子補給、新規就農支援"},
    {"id": "disaster", "name": "熊本地震特別支援", "icon": "🆘", "desc": "生活再建支援金、応急修理、無料相談会、災害援護資金、税減免"}
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
  <title>宇城市：暮らしの支援・補助金 総合ガイド（住まい・子育て・健康・福祉・産業）｜よか隊ネット熊本</title>
  <meta name="description" content="宇城市の公式制度・補助金を網羅した総合ガイド。住まい、子育て（高校生医療費無償化）、健康・出産、シニア福祉、移住新婚、創業支援から令和8年熊本地震特別支援まで、条件シミュレーターで活用できる制度を即座に探せます。">
  <link rel="stylesheet" href="styles.css?v=20260907-2">
  <link rel="stylesheet" href="design-system.css?v=20260907-2">
  <link rel="stylesheet" href="org-site.css?v=20260918-1">
  <link rel="stylesheet" href="uki-living-support.css?v=20260921-2">
  <link rel="canonical" href="https://www.yokatainet.jp/uki-living-support.html">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="ja_JP">
  <meta property="og:site_name" content="よか隊ネット熊本　災害・支援状況レポート">
  <meta property="og:title" content="宇城市：暮らしの支援・補助金 総合ガイド（住まい・子育て・健康・福祉・産業）">
  <meta property="og:description" content="宇城市の公式制度・補助金を網羅した総合ガイド。住まい、子育て（高校生医療費無償化）、健康・出産、シニア福祉、移住新婚、創業支援から令和8年熊本地震特別支援まで、条件シミュレーターで活用できる制度を即座に探せます。">
  <meta property="og:url" content="https://www.yokatainet.jp/uki-living-support.html">
  <meta property="og:image" content="https://www.yokatainet.jp/ogp-uki-living-support.png">
  <meta property="og:image:secure_url" content="https://www.yokatainet.jp/ogp-uki-living-support.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="宇城市：暮らしの支援・補助金 総合ガイド（住まい・子育て・健康・福祉・産業）｜よか隊ネット熊本　災害・支援状況レポート">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="宇城市：暮らしの支援・補助金 総合ガイド（住まい・子育て・健康・福祉・産業）">
  <meta name="twitter:description" content="宇城市の公式制度・補助金を網羅した総合ガイド。住まい、子育て（高校生医療費無償化）、健康・出産、シニア福祉、移住新婚、創業支援から令和8年熊本地震特別支援まで、条件シミュレーターで活用できる制度を即座に探せます。">
  <meta name="twitter:image" content="https://www.yokatainet.jp/ogp-uki-living-support.png">
</head>
<body class="organization-site uki-living-support-page">
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
          <a href="municipalities.html?name=宇城市">宇城市</a>
          <span>&gt;</span>
          <span aria-current="page">暮らしの支援・補助金 総合ガイド</span>
        </nav>

        <div class="uto-sup-hero-badge">宇城市公式情報を確認 · 主要{total_count}制度</div>
        <h1>宇城市 暮らしの支援・補助金 総合ガイド</h1>
        <p class="uto-sup-hero-lead">
          宇城市が市民の生活安定、住環境向上、子育て、健康、福祉、産業振興のために平時から整備している公的支援・補助金制度と、令和8年熊本地震に伴う特別支援制度を体系的に整理しました。<br>
          「あなたの現在の状況」を選択して、活用できる制度をお探しいただけます。掲載制度には宇城市公式情報へのリンクと担当窓口を記載しています。掲載内容は令和8年度の宇城市公式案内を2026年9月21日に確認したものです。
        </p>
      </div>
    </header>

    <!-- メインコンテンツシェル（幅1040px制限で中央揃え） -->
    <div class="uto-sup-shell">

      <!-- 被災者専用ガイドとの連携バナー -->
      <aside class="uto-sup-banner" aria-labelledby="uki-banner-title">
        <span class="uto-sup-banner-tag">熊本地震被災者支援連携</span>
        <h2 id="uki-banner-title">令和8年熊本地震の被災手続き・無料相談会を急ぎ確認したい方へ</h2>
        <p>り災証明書の判定（全壊〜一部損壊）や専門家無料相談会（司法書士・弁護士・行政書士）に特化した案内は専用ページで詳しく整理しています。</p>
        <ul class="uto-sup-banner-points">
          <li><strong>無料相談会（予約不要）：</strong>司法書士（相続・調停）・弁護士（被災ローン減免・ADR）・行政書士（書類作成）が市役所新館・小川ラポートで定期開設</li>
          <li><strong>被災者生活再建支援金：</strong>全壊・解体等で最大300万円支給（申請期限と加算支援金の確認）</li>
          <li><strong>平時制度との併用：</strong>耐震診断・改修補助や在宅高齢者住宅改造助成など、復旧工事と連動できる制度もあわせてご活用いただけます</li>
        </ul>
        <div style="margin-top:16px;">
          <a href="uki-support.html" class="uto-card-link" style="display:inline-flex;">宇城市 被災者支援制度ガイド（全36制度）を見る →</a>
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
              <span class="preset-desc">18歳まで医療費無償・児童手当・応援金</span>
            </button>
            <button type="button" class="uto-sim-preset-btn" data-preset="senior">
              <span class="preset-icon">👴</span>
              <span class="preset-title">シニア・在宅介護</span>
              <span class="preset-desc">住宅改造助成・福祉タクシー・配食</span>
            </button>
            <button type="button" class="uto-sim-preset-btn" data-preset="housing">
              <span class="preset-icon">🏠</span>
              <span class="preset-title">住まい改修・耐震</span>
              <span class="preset-desc">無料耐震診断・改修100万・空き家解体</span>
            </button>
            <button type="button" class="uto-sim-preset-btn" data-preset="newlywed">
              <span class="preset-icon">💍</span>
              <span class="preset-title">新婚・若年夫婦</span>
              <span class="preset-desc">結婚新生活最大60万・移住100万</span>
            </button>
            <button type="button" class="uto-sim-preset-btn" data-preset="disaster">
              <span class="preset-icon">🚨</span>
              <span class="preset-title">熊本地震の被災世帯</span>
              <span class="preset-desc">再建金300万・無料相談会・応急修理</span>
            </button>
            <button type="button" class="uto-sim-preset-btn" data-preset="business">
              <span class="preset-icon">💼</span>
              <span class="preset-title">自営業・中小企業・農業</span>
              <span class="preset-desc">小川ラボ創業支援・低利融資・新規就農</span>
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

      <!-- 宇城市の3大特徴ハイライト -->
      <section class="uto-sup-highlights" aria-labelledby="uki-hl-title">
        <div class="uto-sup-hl-header">
          <div class="uto-sup-hl-kicker">
            <span class="uto-sup-hl-kicker-icon">💡</span>
            <span>自治体独自メリット・お得な制度連携</span>
          </div>
          <h2 id="uki-hl-title">知っておきたい！宇城市の制度連携・独自メリット</h2>
          <p class="uto-sup-hl-sub">平時の補助金と震災復興支援を上手に組み合わせることで、住まいの根本改善や子育て・産業再建を強力に後押しします。</p>
        </div>
        <div class="uto-sup-hl-grid">
          <div class="uto-sup-hl-item">
            <div class="hl-item-top">
              <span class="hl-point-label">Point 01</span>
              <span class="hl-badge">完全無償化拡充</span>
            </div>
            <h3>こども医療費 18歳まで完全無償化</h3>
            <p>令和8年10月診療分より、0歳から高校生年代（18歳到達年度末）までの医療費窓口自己負担が完全無償化。子育て世帯の医療費負担を大幅にゼロ化します。</p>
          </div>
          <div class="uto-sup-hl-item">
            <div class="hl-item-top">
              <span class="hl-point-label">Point 02</span>
              <span class="hl-badge">予約不要・無料</span>
            </div>
            <h3>被災者支援のための「無料相談会」定期開設</h3>
            <p>市役所新館と小川ラポートで司法書士・弁護士・行政書士が常駐。被災ローン減免制度や建物の相続・登記、公費解体申請書類の確認などをワンストップで解決。</p>
          </div>
          <div class="uto-sup-hl-item">
            <div class="hl-item-top">
              <span class="hl-point-label">Point 03</span>
              <span class="hl-badge">OGAWA Lab.連携</span>
            </div>
            <h3>創業支援・特定創業支援事業＋移住支援金</h3>
            <p>起業支援拠点「OGAWA Lab.」を中心に創業補助金や専門家相談が充実。東京圏等からの移住支援金（最大100万円＋加算）と併せて新規起業を強力にサポート。</p>
          </div>
        </div>
      </section>

      <!-- 検索・絞り込みツールバー -->
      <section class="uto-sup-toolbar" aria-labelledby="uki-tool-title">
        <div class="uto-sup-search-row">
          <label for="utoSupSearch" id="uki-tool-title" class="uto-sup-search-label">キーワード検索：</label>
          <input type="text" id="utoSupSearch" class="uto-sup-search-input" placeholder="例：耐震、医療費、タクシー、補助金、創業、解体、新婚..." autocomplete="off">
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
        <span class="uto-sup-status-source">確認日：2026年9月21日／情報源：宇城市公式HP等</span>
      </div>

      <aside class="uto-sup-caution" role="note">
        <strong>申請前に必ず最新情報をご確認ください。</strong>
        制度は年度、予算、世帯状況などにより受付終了・金額変更・対象外となる場合があります。このページは宇城市の全制度を網羅するものではありません。公式ページと担当窓口で、現在の受付状況・対象要件・必要書類を確認してください。
      </aside>

      <!-- 一致なし表示 -->
      <div id="utoSupEmpty" class="uto-sup-empty" style="display: none;">
        <p>該当する制度が見つかりませんでした。条件シミュレーターの「条件をクリア」ボタンを押すか、別のキーワードで検索してください。</p>
      </div>
''')

    # 各カテゴリセクションとカード（1列構成）
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
            <div class="uto-card-amount">{item["amount"]}</div>
            <p class="uto-card-desc">{item["desc"]}</p>
            {extra_html}
            <div class="uto-card-tags">
              {tag_spans}
            </div>
            <div class="uto-card-footer">
              <div class="uto-card-dept">
                <span>担当：{item["dept"]}</span>
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
      <section class="uto-sup-contact-box" aria-labelledby="uki-contact-title">
        <h3 id="uki-contact-title">宇城市役所 お問い合わせ・窓口案内</h3>
        <p style="font-size:0.95rem; line-height:1.6; color:#475569; margin-bottom:18px;">
          各制度の申請要件、今年度の受付期限、必要書類などは制度ごとに異なります。詳しくは各カードに記載の担当課直通電話、または市役所代表窓口へお問い合わせください。
        </p>
        <div class="uto-sup-contact-grid">
          <div class="uto-sup-contact-item">
            <b>宇城市役所（本庁舎）</b>
            <p>〒869-0592 熊本県宇城市松橋町大野85<br>開庁時間：平日 8:30〜17:15</p>
            <a href="tel:0964321111">0964-32-1111（代表）</a>
          </div>
          <div class="uto-sup-contact-item">
            <b>宇城市 復興支援窓口（危機管理課）</b>
            <p>本庁舎内 復興支援係<br>生活再建支援金・応急修理・無料相談会・災害援護資金</p>
            <a href="tel:0964321798">0964-32-1798</a>
          </div>
          <div class="uto-sup-contact-item">
            <b>宇城市商工会</b>
            <p>〒869-0502 宇城市松橋町松橋394-1<br>小規模事業者支援・創業支援・事業持続化相談</p>
            <a href="tel:0964320258">0964-32-0258</a>
          </div>
          <div class="uto-sup-contact-item">
            <b>宇城市社会福祉協議会</b>
            <p>〒869-0502 宇城市松橋町松橋400<br>ボランティアセンター・福祉相談・生活福祉資金貸付</p>
            <a href="tel:0964321316">0964-32-1316</a>
          </div>
        </div>
        <p style="margin-top:20px; font-size:0.875rem; color:#64748b;">
          関連リンク：<a href="https://www.city.uki.kumamoto.jp/" target="_blank" rel="noopener">宇城市公式ホームページ ↗</a> · <a href="uki-support.html">宇城市 被災者支援制度ガイド（全36制度）</a> · <a href="uki-consultation.html">宇城市 無料相談会ガイド</a> · <a href="municipalities.html">自治体別支援情報へ戻る</a>
        </p>
      </section>

    </div>
  </main>
  <footer class="site-footer"></footer>
  <script src="org-site.js?v=20260907-2"></script>
  <script src="uki-living-support.js?v=20260921-2"></script>
</body>
</html>
''')

    content = "".join(html_parts)
    Path("uki-living-support.html").write_text(content, encoding="utf-8")
    print(f"Generated uki-living-support.html with {len(SYSTEMS)} systems and full 1-column layout.")

if __name__ == "__main__":
    generate_html()
