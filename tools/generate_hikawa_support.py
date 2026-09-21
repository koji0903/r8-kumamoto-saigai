#!/usr/bin/env python3
"""hikawa-living-support.html を生成するスクリプト（氷川町 暮らしの支援・補助金 総合ガイド）"""
import json
from pathlib import Path

# SVGアイコン定義（親しみやすく直感的なベクターイラスト）
ICONS = {
    "reform": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M14.5 12a2.5 2.5 0 0 0-3.5-3.5L8 11.5l4.5 4.5z"/><path d="m11.5 15 3.5 3.5"/></svg>''',
    "retrofit_check": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="14" r="3"/><path d="m14.5 16.5 2.5 2.5"/><path d="m9 13 2 2 4-4"/></svg>''',
    "retrofit_build": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M12 11v7"/><path d="M8 15h8"/><path d="M12 22s5-3 5-8V9l-5-2-5 2v5c0 5 5 8 5 8z" opacity="0.3"/></svg>''',
    "tatami": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20M2 14h20M7 4v16M17 4v16"/><path d="M12 4v16" stroke-dasharray="2 2"/></svg>''',
    "solar": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>''',
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
    "demolish_public": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/></svg>''',
    "disaster_loan": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M7 15h.01M17 15h.01"/></svg>''',
    "tax_relief": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg>'''
}

SYSTEMS = [
    # 1. 住まい・耐震・環境
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "自己負担無料・耐震診断士派遣",
        "title": "戸建て木造住宅耐震診断事業",
        "amount": "自己負担無料（町が木造住宅耐震診断士を派遣・全額公費負担）",
        "desc": "旧耐震基準等で建築された木造戸建て住宅を対象に、町が専門の耐震診断士を無料で派遣。大地震時の倒壊危険度を総合的に調査・診断します。",
        "extra": "耐震改修工事や耐震シェルター設置補助を申請するための必須要件となる診断です。随時事前相談を受け付けています。",
        "dept": "建設下水道課 建設管理係",
        "phone": "0965-52-5862",
        "url": "https://www.town.hikawa.kumamoto.jp/",
        "urlLabel": "氷川町公式：住宅耐震化 ↗",
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
        "title": "戸建て木造住宅耐震改修等事業補助金",
        "amount": "耐震改修・建替え工事費用の一部補助（最大100万円等） / シェルター設置助成",
        "desc": "耐震診断の結果、安全性が不足している木造住宅について、耐震改修工事、建替え工事、または寝室等の安全を確保する耐震シェルター設置の費用を助成します。",
        "extra": "高齢者世帯には耐震シェルター設置も推奨。工事契約・着工前の申請が必要です。",
        "dept": "建設下水道課 建設管理係",
        "phone": "0965-52-5862",
        "url": "https://www.town.hikawa.kumamoto.jp/",
        "urlLabel": "氷川町公式：耐震改修等 ↗",
        "icon": "retrofit_build",
        "life": ["working", "senior"],
        "family": ["general", "senior_only"],
        "housing": ["owned_wood"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_partial"],
        "work": ["all"],
        "tags": ["#耐震補強", "#最大100万", "#建替え", "#シェルター"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "氷川町独自・町内産畳表助成",
        "title": "氷川町畳表張替助成事業",
        "amount": "町内施工業者による町内産畳表を用いた畳替え工事費用の一部助成",
        "desc": "日本一のい草・畳表の産地である氷川町ならではの独自事業。町内の施工業者に依頼し、地元産の良質な畳表を使って住宅の畳を表替え・新調する際の費用を助成します。",
        "extra": "【産地独自メリット】い草の香りと調湿機能で快適な住環境を取り戻し、地元産業も応援できる大人気の町独自制度です。",
        "dept": "農林振興課 / 地域振興課",
        "phone": "0965-62-2315",
        "url": "https://www.town.hikawa.kumamoto.jp/",
        "urlLabel": "氷川町公式：畳表張替助成 ↗",
        "icon": "tatami",
        "life": ["working", "senior", "newlywed"],
        "family": ["general", "childcare", "senior_only"],
        "housing": ["owned_wood"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_partial"],
        "work": ["all"],
        "tags": ["#畳表張替", "#氷川町独自", "#い草の里", "#リフォーム"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "水回り改善・転換補助",
        "title": "氷川町合併処理浄化槽設置整備事業補助金",
        "amount": "設置費用の一部補助（単独処理浄化槽・汲み取りからの転換上乗せ助成あり）",
        "desc": "生活排水による公共用水域の水質汚濁を防止するため、住宅に合併処理浄化槽を設置する費用を助成。既存の単独浄化槽撤去や宅内配管工事にも手厚い支援があります。",
        "extra": "対象地域および工事着工前の申請が必要です。快適で衛生的な水回り環境を整備できます。",
        "dept": "建設下水道課 業務管理係",
        "phone": "0965-52-5862",
        "url": "https://www.town.hikawa.kumamoto.jp/",
        "urlLabel": "氷川町公式：浄化槽補助 ↗",
        "icon": "septic",
        "life": ["working", "senior", "newlywed"],
        "family": ["general"],
        "housing": ["owned_wood", "septic"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_partial"],
        "work": ["all"],
        "tags": ["#浄化槽", "#水洗化", "#単独切替支援"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "成約物件の改修・家財処分",
        "title": "氷川町空き家バンク促進補助金",
        "amount": "空き家改修工事費用や家財道具撤去費用の一部助成",
        "desc": "空き家バンクに登録された住宅の改修工事や、不要な家財道具の処分・清掃費用を助成し、空き家の有効活用と定住促進を図ります。",
        "extra": "移住者や購入者が住み始める前のリフォームにも活用できます。事前申請が必要です。",
        "dept": "地域振興課 企画調整係",
        "phone": "0965-62-2315",
        "url": "https://www.town.hikawa.kumamoto.jp/",
        "urlLabel": "氷川町公式：空き家バンク ↗",
        "icon": "vacant",
        "life": ["working", "newlywed"],
        "family": ["general"],
        "housing": ["vacant", "owned_wood"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#空き家バンク", "#家財撤去", "#リフォーム助成"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "太陽光・蓄電池で省エネ",
        "title": "住宅用新エネルギー等導入促進事業補助金",
        "amount": "住宅用太陽光発電設備・家庭用蓄電池等の設置費用の一部補助",
        "desc": "地球温暖化防止と環境に優しいまちづくりを推進するため、住宅に太陽光発電システムや蓄電池を設置する費用を助成します。",
        "extra": "災害停電時の非常用電源としても大きな安心につながります。着工前の申請が必要です。",
        "dept": "住民福祉課 環境衛生係",
        "phone": "0965-62-2314",
        "url": "https://www.town.hikawa.kumamoto.jp/",
        "urlLabel": "氷川町公式：新エネ補助 ↗",
        "icon": "solar",
        "life": ["working", "senior", "newlywed"],
        "family": ["general"],
        "housing": ["owned_wood"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#太陽光", "#蓄電池", "#省エネ", "#停電対策"]
    },

    # 2. 子育て・教育・就学
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学",
        "badge": "高校生まで医療費を助成",
        "title": "氷川町こども医療費助成事業",
        "amount": "0歳から高校生年代（18歳年度末）までの通院・入院自己負担分を助成",
        "desc": "子どもたちの健康維持と健やかな成長を支えるため、小児・児童・生徒の保険診療による医療費の一部負担金を助成します。",
        "extra": "子どもが病気や怪我をした際にも安心して受診できるよう手厚くカバー。受給資格者証の手続きを行ってください。",
        "dept": "住民福祉課 国保年金係",
        "phone": "0965-62-2314",
        "url": "https://www.town.hikawa.kumamoto.jp/",
        "urlLabel": "氷川町公式：こども医療費 ↗",
        "icon": "child_med",
        "life": ["child_infant", "child_school"],
        "family": ["childcare", "single_parent"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#こども医療費", "#高校生まで", "#通院入院助成"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学",
        "badge": "町独自のお祝い金支給",
        "title": "すこやか赤ちゃん出産祝金（町独自）",
        "amount": "第1子・第2子・第3子以降の出生時に町独自のお祝い金を支給",
        "desc": "次代を担う赤ちゃんの誕生を町全体で祝福し、子育て世帯の初期負担を軽減するため、氷川町に住民登録のある保護者へ祝金を贈呈します。",
        "extra": "国の出産・子育て応援交付金（10万円）とは別枠で支給される心温まる町独自の子育て支援制度です。",
        "dept": "住民福祉課 福祉係",
        "phone": "0965-62-2314",
        "url": "https://www.town.hikawa.kumamoto.jp/",
        "urlLabel": "氷川町公式：出産祝金 ↗",
        "icon": "heart",
        "life": ["child_infant"],
        "family": ["childcare"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#出産祝金", "#氷川町独自", "#赤ちゃん誕生応援"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学",
        "badge": "高校生まで・所得制限なし",
        "title": "児童手当",
        "amount": "0〜2歳：1.5万円 / 3歳〜高校生：1万円（第3子以降は月3万円）",
        "desc": "高校生年代までの児童を養育している保護者に支給される手当。所得制限が撤廃され、第3子以降への支給額も手厚く拡充されています。",
        "extra": "出生日や転入日の翌日から15日以内に住民福祉課窓口で申請を行ってください。",
        "dept": "住民福祉課 福祉係",
        "phone": "0965-62-2314",
        "url": "https://www.town.hikawa.kumamoto.jp/",
        "urlLabel": "氷川町公式：児童手当 ↗",
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
        "badge": "給食費・学用品等の実費援助",
        "title": "就学援助制度（小中学校）",
        "amount": "学用品費、給食費、修学旅行費、校外活動費、新入学用品費などの実費援助",
        "desc": "氷川町立の小・中学校に通う児童生徒の保護者で、経済的にお困りの世帯に対し、義務教育を円滑に受けるための必要経費を援助します。",
        "extra": "災害や失業による急な家計急変時にも随時相談・申請が可能です。",
        "dept": "教育委員会 学校教育課",
        "phone": "0965-52-5861",
        "url": "https://www.town.hikawa.kumamoto.jp/",
        "urlLabel": "氷川町公式：就学援助 ↗",
        "icon": "school_aid",
        "life": ["child_school"],
        "family": ["childcare", "single_parent"],
        "housing": ["owned_wood", "rental"],
        "income": ["low_income"],
        "disaster": ["none", "damage_heavy", "damage_half"],
        "work": ["all"],
        "tags": ["#就学援助", "#給食費援助", "#学用品費", "#家計急変"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学",
        "badge": "無利子貸与で修学を支える",
        "title": "氷川町奨学金制度",
        "amount": "高等学校・大学・短大・専修学校等への進学支援（無利子貸与）",
        "desc": "学問を志しながら経済的理由により修学が困難な生徒・学生に対し、無利子で奨学資金を貸与します。",
        "extra": "卒業後に無理のない計画で返還する制度です。毎年度の募集時期をご確認ください。",
        "dept": "教育委員会 総務課",
        "phone": "0965-52-5861",
        "url": "https://www.town.hikawa.kumamoto.jp/",
        "urlLabel": "氷川町公式：教育・奨学金 ↗",
        "icon": "edu_loan",
        "life": ["child_school", "working"],
        "family": ["childcare", "single_parent"],
        "housing": ["owned_wood", "rental"],
        "income": ["low_income"],
        "disaster": ["none", "damage_heavy", "damage_half"],
        "work": ["all"],
        "tags": ["#奨学金", "#無利子貸与", "#進学支援"]
    },

    # 3. 健康・出産・女性
    {
        "cat": "health",
        "catName": "健康・出産・女性",
        "badge": "面談相談＋計10万円交付",
        "title": "出産・子育て応援交付金事業",
        "amount": "妊娠届出時5万円＋出生時5万円（計10万円相当）",
        "desc": "妊娠期から出産・子育てまで一貫して保健師が寄り添う伴走型相談支援と、出産準備や育児用品購入を支える計10万円の経済的支援を提供します。",
        "extra": "母子健康手帳交付時の面談および乳児家庭全戸訪問での面談を経て申請できます。",
        "dept": "住民福祉課 保健予防係",
        "phone": "0965-62-2314",
        "url": "https://www.town.hikawa.kumamoto.jp/",
        "urlLabel": "氷川町公式：子育て応援 ↗",
        "icon": "heart",
        "life": ["child_infant", "newlywed"],
        "family": ["childcare"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#出産応援10万", "#妊婦面談", "#安心出産"]
    },
    {
        "cat": "health",
        "catName": "健康・出産・女性",
        "badge": "心身ケアと育児サポート",
        "title": "氷川町産後ケア事業",
        "amount": "宿泊型・デイサービス型・訪問型の利用料助成",
        "desc": "出産後のお母さんが安心して育児をスタートできるよう、助産所や指定医療機関で母体の休養、乳房ケア、授乳指導、育児相談等を提供します。",
        "extra": "産後の体調不安や孤立感を和らげる温かいサポートです。利用申請は住民福祉課へ。",
        "dept": "住民福祉課 保健予防係",
        "phone": "0965-62-2314",
        "url": "https://www.town.hikawa.kumamoto.jp/",
        "urlLabel": "氷川町公式：産後ケア ↗",
        "icon": "postpartum",
        "life": ["child_infant"],
        "family": ["childcare"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#産後ケア", "#助産師相談", "#母体休養"]
    },
    {
        "cat": "health",
        "catName": "健康・出産・女性",
        "badge": "早期発見・ワンコイン健診",
        "title": "氷川町各種住民検診・特定健康診査",
        "amount": "無料または数百円〜千円程度で受診可能（特定健診・各種がん検診）",
        "desc": "生活習慣病を予防・早期改善するための特定健診や、胃がん・肺がん・大腸がん・乳がん・子宮頸がん検診を定期実施。節目年齢には無料クーポンも交付されます。",
        "extra": "災害後の生活環境変化による健康管理のためにも、積極的な受診が推奨されます。",
        "dept": "住民福祉課 保健予防係",
        "phone": "0965-62-2314",
        "url": "https://www.town.hikawa.kumamoto.jp/",
        "urlLabel": "氷川町公式：健診・検診 ↗",
        "icon": "checkup",
        "life": ["working", "senior"],
        "family": ["general", "senior_only"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#特定健診", "#がん検診", "#健康管理"]
    },

    # 4. シニア・障がい福祉
    {
        "cat": "senior",
        "catName": "シニア・障がい福祉",
        "badge": "タクシー利用券交付で移動応援",
        "title": "氷川町高齢者等福祉タクシー利用料金助成事業",
        "amount": "一般タクシー利用助成券の定期交付",
        "desc": "一般の交通機関を利用することが困難な在宅重度障がい者や一定基準を満たす高齢者に対し、通院や買い物等の外出を支援するタクシー利用券を交付します。",
        "extra": "車の運転ができない・免許を自主返納した高齢者の大切な移動手段として活用されています。",
        "dept": "地域振興課 / 住民福祉課",
        "phone": "0965-62-2315",
        "url": "https://www.town.hikawa.kumamoto.jp/",
        "urlLabel": "氷川町公式：福祉タクシー ↗",
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
        "badge": "見守りと栄養バランス",
        "title": "高齢者食の自立支援事業（配食サービス）",
        "amount": "町助成により1食あたり実費負担のみ（安否確認つき配達）",
        "desc": "一人暮らし高齢者や高齢者のみの世帯で自炊が困難な方を対象に、栄養バランスの取れた温かい食事を配達し、同時に直接手渡しによる安否確認を行います。",
        "extra": "体調変化の早期発見や孤独感の解消に役立っています。地域包括支援センターで相談できます。",
        "dept": "地域包括支援センター（住民福祉課内）",
        "phone": "0965-62-2314",
        "url": "https://www.town.hikawa.kumamoto.jp/",
        "urlLabel": "氷川町公式：高齢者支援 ↗",
        "icon": "meal",
        "life": ["senior"],
        "family": ["senior_only"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#配食サービス", "#見守り安否確認", "#自立支援"]
    },
    {
        "cat": "senior",
        "catName": "シニア・障がい福祉",
        "badge": "上限20万円の7〜9割支給",
        "title": "介護保険 住宅改修費支給",
        "amount": "上限20万円の工事費に対し、7割〜9割（最大18万円）を保険給付",
        "desc": "要支援・要介護認定を受けた方が暮らす自宅で、手すり設置、段差解消、滑り止め床材への変更、引き戸への扉取替等のバリアフリー改修費用を給付します。",
        "extra": "ケアマネジャーの理由書が必要です。必ず着工前の申請を行ってください。",
        "dept": "住民福祉課 介護保険係",
        "phone": "0965-62-2314",
        "url": "https://www.town.hikawa.kumamoto.jp/",
        "urlLabel": "氷川町公式：介護保険 ↗",
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
        "badge": "氷川町の暮らしをお試し体験",
        "title": "氷川町移住体験住宅（ひかわ暮らし体験）",
        "amount": "家具家電完備の体験住宅を格安で利用可能（数日〜数週間）",
        "desc": "氷川町への移住・定住を検討している方に対し、実際の町での生活環境、地域の雰囲気、気候や買い物の利便性を体感できる体験住宅を提供しています。",
        "extra": "「ひかわ暮らし」のリアルを体感でき、地域振興課による地域案内や就農・起業相談も併せて受けられます。",
        "dept": "地域振興課 企画調整係",
        "phone": "0965-62-2315",
        "url": "https://www.town.hikawa.kumamoto.jp/",
        "urlLabel": "氷川町移住情報「ひかわ暮らし」 ↗",
        "icon": "moving",
        "life": ["working", "newlywed"],
        "family": ["general", "childcare"],
        "housing": ["rental"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#移住体験住宅", "#お試し移住", "#ひかわ暮らし"]
    },
    {
        "cat": "migration",
        "catName": "移住・新婚・地域",
        "badge": "世帯100万円・単身60万円＋加算",
        "title": "氷川町移住支援金（就業・起業・テレワーク）",
        "amount": "2人以上世帯100万円 / 単身60万円（18歳未満の子ども加算あり）",
        "desc": "東京圏等の対象地域から氷川町へ移住し、マッチングサイト掲載求人への就職、起業、またはテレワークを継続する方へ支援金を支給します。",
        "extra": "豊かな自然と利便性が両立する氷川町での新生活を強力に後押しします。",
        "dept": "地域振興課 企画調整係",
        "phone": "0965-62-2315",
        "url": "https://www.town.hikawa.kumamoto.jp/",
        "urlLabel": "氷川町公式：移住支援 ↗",
        "icon": "moving",
        "life": ["working", "newlywed"],
        "family": ["general", "childcare"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["employee", "startup"],
        "tags": ["#移住支援金", "#100万支給", "#子育て加算"]
    },
    {
        "cat": "migration",
        "catName": "移住・新婚・地域",
        "badge": "新生活費用補助",
        "title": "氷川町結婚新生活支援事業補助金",
        "amount": "新婚世帯に住居費・引越費用等を補助（最大30万円〜60万円）",
        "desc": "新婚夫婦の経済的負担を軽減するため、新生活に伴う住居取得費、住宅賃借費（敷金・礼金・家賃等）、引越し業者費用の実費を補助します。",
        "extra": "年齢要件（夫婦39歳以下等）や所得制限があります。婚姻届提出後の申請となります。",
        "dept": "地域振興課 企画調整係",
        "phone": "0965-62-2315",
        "url": "https://www.town.hikawa.kumamoto.jp/",
        "urlLabel": "氷川町公式：定住促進 ↗",
        "icon": "wedding",
        "life": ["newlywed"],
        "family": ["general"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#新婚補助金", "#家賃引越補助", "#若者夫婦"]
    },

    # 6. 産業・農業・創業
    {
        "cat": "business",
        "catName": "産業・農業・創業",
        "badge": "い草・梨・特産品開発支援",
        "title": "氷川町特産品開発・商工振興支援事業",
        "amount": "特産品開発・新商品開発・販路開拓費用の一部補助",
        "desc": "町内の商工業者や農林漁業者が行う、地元農産物（い草、梨、晩白柚、ショウガ等）を活用した加工品・新商品の開発や販路拡大を支援します。",
        "extra": "氷川町商工会と連携し、地域経済を牽引する意欲的な取り組みを応援します。",
        "dept": "農林振興課 / 地域振興課",
        "phone": "0965-62-2315",
        "url": "https://www.town.hikawa.kumamoto.jp/",
        "urlLabel": "氷川町公式：産業振興 ↗",
        "icon": "startup",
        "life": ["working"],
        "family": ["general"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["business", "agri"],
        "tags": ["#特産品開発", "#い草梨加工", "#販路開拓"]
    },
    {
        "cat": "business",
        "catName": "産業・農業・創業",
        "badge": "後継者・担い手を育成",
        "title": "い草・農業担い手育成・経営基盤強化事業",
        "amount": "新規就農資金交付＋農業用機械・施設整備助成",
        "desc": "日本一の畳表産地を未来へつなぐため、い草生産者や果樹・野菜の新規就農者、認定農業者に対し、機械・施設の導入や技術定着を総合的に支援します。",
        "extra": "研修体制や農地確保の相談窓口も設置されています。",
        "dept": "農林振興課 農政係",
        "phone": "0965-62-2315",
        "url": "https://www.town.hikawa.kumamoto.jp/",
        "urlLabel": "氷川町公式：農政案内 ↗",
        "icon": "farmer",
        "life": ["working", "newlywed"],
        "family": ["general"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["agri", "startup"],
        "tags": ["#新規就農", "#い草農家", "#農業機械補助"]
    },
    {
        "cat": "business",
        "catName": "産業・農業・創業",
        "badge": "低利融資・保証料支援",
        "title": "氷川町中小企業振興資金融資制度",
        "amount": "低利融資枠＋町による利子補給・保証料補助",
        "desc": "町内の中小企業・小規模事業者の経営安定や設備近代化のため、公的融資制度をご案内します。",
        "extra": "商工会窓口で経営相談と併せて申し込めます。",
        "dept": "地域振興課 商工観光係",
        "phone": "0965-62-2315",
        "url": "https://www.town.hikawa.kumamoto.jp/",
        "urlLabel": "氷川町公式：商工融資 ↗",
        "icon": "loan_biz",
        "life": ["working"],
        "family": ["general"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_partial"],
        "work": ["business"],
        "tags": ["#中小企業融資", "#保証料補助", "#運転資金"]
    },

    # 7. 熊本地震特別支援
    {
        "cat": "disaster",
        "catName": "熊本地震特別支援",
        "badge": "半壊以上・町が解体撤去または費用償還",
        "title": "被災家屋等の公費解体・自費解体制度",
        "amount": "解体・撤去費用を町が負担（自費解体は基準限度額内で費用償還）",
        "desc": "令和8年熊本地震により「半壊」以上の被害を受けた住宅・付属家屋等について、所有者の申請に基づき町が解体・撤去を行うか、所有者が自ら解体した費用を償還します。",
        "extra": "【予約受付中】電話事前予約（0120-091-110）および様式1〜5の必要書類提出が必要です。自費解体の場合は解体前の全景写真等が必須です。",
        "dept": "建設下水道課 公費解体受付窓口",
        "phone": "0120-091-110",
        "url": "hikawa-demolition.html",
        "urlLabel": "氷川町公費解体・自費解体ガイドを見る →",
        "icon": "demolish_public",
        "life": ["working", "senior", "newlywed"],
        "family": ["general", "senior_only"],
        "housing": ["owned_wood", "vacant"],
        "income": ["no_limit"],
        "disaster": ["damage_heavy", "damage_half"],
        "work": ["all"],
        "tags": ["#公費解体", "#自費解体", "#半壊以上", "#費用町負担"]
    },
    {
        "cat": "disaster",
        "catName": "熊本地震特別支援",
        "badge": "最大75.7万円・市から業者支払い",
        "title": "住宅の応急修理制度（災害救助法）",
        "amount": "準半壊・半壊・中規模半壊・大規模半壊等：1世帯最大75万7千円（準半壊は別上限）",
        "desc": "被災住宅の屋根、外壁、床、トイレ、台所など日常生活に不可欠な部分の修理代金を町から施工業者へ直接支払う現物給付制度。",
        "extra": "【注意】被災者が自ら業者に全額支払った後は対象外となります。必ず工事前に申請してください。",
        "dept": "建設下水道課 建築係",
        "phone": "0965-52-5862",
        "url": "https://www.town.hikawa.kumamoto.jp/",
        "urlLabel": "氷川町公式：応急修理 ↗",
        "icon": "emergency_repair",
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
        "badge": "最大300万円支給",
        "title": "被災者生活再建支援金",
        "amount": "基礎支援金（最大100万円）＋加算支援金（最大200万円、計最大300万円）",
        "desc": "全壊・大規模半壊・中規模半壊等の甚大な被害を受けた世帯に対し、基礎支援金と再建方法に応じた加算支援金を支給します。",
        "extra": "やむを得ない事情による半壊解体も対象。り災証明書や契約書が必要です。",
        "dept": "住民福祉課 福祉係",
        "phone": "0965-62-2314",
        "url": "https://www.town.hikawa.kumamoto.jp/",
        "urlLabel": "氷川町公式：生活再建支援金 ↗",
        "icon": "rebuild",
        "life": ["working", "senior", "newlywed"],
        "family": ["general", "senior_only"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["damage_heavy", "damage_half"],
        "work": ["all"],
        "tags": ["#生活再建支援金", "#最大300万", "#全壊中規模半壊"]
    },
    {
        "cat": "disaster",
        "catName": "熊本地震特別支援",
        "badge": "上限150万〜350万円・保証人で無利子",
        "title": "氷川町 災害援護資金貸付",
        "amount": "世帯主の負傷や住居・家財被害に応じ最大350万円（据置5年・償還10年）",
        "desc": "被災世帯の生活立て直しを支援する公的貸付制度。保証人を立てることで無利子となります。",
        "extra": "所得制限要件があります。健康福祉政策窓口でご相談ください。",
        "dept": "住民福祉課 福祉係",
        "phone": "0965-62-2314",
        "url": "https://www.town.hikawa.kumamoto.jp/",
        "urlLabel": "氷川町公式：生活支援 ↗",
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
        "badge": "町税・上下水道料等の減免",
        "title": "被災に伴う町税・保険料・公共料金の減免・猶予",
        "amount": "被害状況や所得減少に応じた減免・徴収猶予",
        "desc": "住家損壊やり災判定、所得減少があった世帯に対し、町県民税、固定資産税、国民健康保険税、介護保険料、上下水道料金等の減免を実施します。",
        "extra": "り災証明書の写し等が必要となります。各担当課窓口でご相談ください。",
        "dept": "税務課 / 住民福祉課 / 建設下水道課",
        "phone": "0965-62-2313",
        "url": "https://www.town.hikawa.kumamoto.jp/",
        "urlLabel": "氷川町公式：減免窓口 ↗",
        "icon": "tax_relief",
        "life": ["working", "senior"],
        "family": ["general", "senior_only"],
        "housing": ["owned_wood", "rental"],
        "income": ["low_income"],
        "disaster": ["damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#町税減免", "#国保減免", "#水道料減免"]
    }
]

CATEGORIES = [
    {"id": "housing", "name": "住まい・耐震・環境", "icon": "🏠", "desc": "耐震診断・改修、町内産畳表張替助成、合併浄化槽、空き家バンク、新エネ設備"},
    {"id": "childcare", "name": "子育て・教育・就学", "icon": "🎒", "desc": "高校生まで医療費助成、すこやか赤ちゃん出産祝金、児童手当、就学援助、奨学金"},
    {"id": "health", "name": "健康・出産・女性", "icon": "🩺", "desc": "出産・子育て応援交付金（10万円）、産後ケア、住民健診・特定健診"},
    {"id": "senior", "name": "シニア・障がい福祉", "icon": "🤝", "desc": "高齢者福祉タクシー、食の自立支援配食、介護保険住宅改修"},
    {"id": "migration", "name": "移住・新婚・地域", "icon": "🌸", "desc": "移住体験住宅（ひかわ暮らし）、移住支援金（100万）、結婚新生活支援"},
    {"id": "business", "name": "産業・農業・創業", "icon": "💼", "desc": "い草・梨等特産品開発支援、農業担い手育成、中小企業振興融資"},
    {"id": "disaster", "name": "熊本地震特別支援", "icon": "🆘", "desc": "公費解体・自費解体、応急修理、生活再建支援金、災害援護資金、減免"}
]

def generate_html():
    html_parts = []
    
    # ヘッダー部分
    html_parts.append('''<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#185f55">
  <title>氷川町：暮らしの支援・補助金 総合ガイド（住まい・子育て・健康・福祉・産業）｜よか隊ネット熊本</title>
  <meta name="description" content="氷川町の公式制度・補助金を網羅した総合ガイド。住まい（町内産畳表張替助成・耐震）、子育て（出産祝金・高校生医療費）、健康、シニア福祉、移住体験住宅、産業から公費解体など令和8年熊本地震特別支援まで、条件シミュレーターで活用できる制度を即座に探せます。">
  <link rel="icon" href="favicon.png" sizes="32x32">
  <link rel="apple-touch-icon" href="apple-touch-icon.png">
  <link rel="stylesheet" href="styles.css?v=20260817-4">
  <link rel="stylesheet" href="design-system.css?v=20260810-1">
  <link rel="stylesheet" href="org-site.css?v=20260907-2">
  <link rel="stylesheet" href="hikawa-living-support.css?v=20260921-1">
</head>
<body class="organization-site hikawa-living-support-page">
  <a class="skip" href="#main">本文へ移動</a>
  <header class="site-header"></header>
  <main id="main">
    <section class="uto-sup-hero" style="background: linear-gradient(135deg, #0f3d36 0%, #185f55 60%, #237b6f 100%);">
      <div class="uto-sup-hero-inner">
        <nav class="breadcrumb-nav" aria-label="パンくずリスト">
          <a href="index.html">ホーム</a> &gt;
          <a href="municipalities.html">自治体別情報</a> &gt;
          <a href="municipalities.html?name=氷川町">氷川町</a> &gt;
          <span aria-current="page">暮らしの支援・補助金 総合ガイド</span>
        </nav>
        <span class="uto-sup-hero-badge">氷川町公式制度 総合ナビゲーション</span>
        <h1>氷川町 暮らしの支援・補助金 総合ガイド</h1>
        <p class="uto-sup-hero-lead">
          氷川町にお住まいの皆さまが活用できる、平時からの主要な支援制度・補助金と、令和8年熊本地震の特別支援を1つに集約しました。<br>
          「年齢」「世帯状況」「住まい」「被災状況」などの条件を選ぶだけで、あなたやご家族が使える制度をカンタンに調べることができます。
        </p>
        <div class="uto-sup-quick-actions" style="margin-top:20px;">
          <a href="#simulator" class="highlight">🔍 条件から制度を調べる</a>
          <a href="#hikawa-special">💡 氷川町の独自メリット</a>
          <a href="#cat-housing">🏠 住まい</a>
          <a href="#cat-childcare">🎒 子育て</a>
          <a href="#cat-senior">🤝 シニア福祉</a>
          <a href="#cat-migration">🌸 移住・新婚</a>
          <a href="#cat-business">💼 産業・農業</a>
          <a href="#cat-disaster">🆘 地震特別支援</a>
          <a href="hikawa-support.html" style="background:#edf7f4; color:#185f55;">📋 被災者支援制度一覧へ ↗</a>
        </div>
      </div>
    </section>

    <!-- 被災者専用ガイドとの連携バナー -->
    <aside class="hk-alert" style="max-width:1040px; margin:20px auto 0; padding:16px 20px; border-radius:12px; border-left:6px solid #185f55; background:#f0fdf9;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <b style="color:#0f3d36; font-size:1.05rem;">令和8年熊本地震の公費解体・被災手続きを急ぎ確認したい方へ</b>
          <p style="margin:4px 0 0; font-size:0.92rem; color:#334155;">「被災家屋等の公費解体・自費解体ガイド」やり災証明・被災者支援制度一覧を専用ページで詳しく整理しています。</p>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <a href="hikawa-demolition.html" style="background:#185f55; color:#fff; padding:8px 14px; border-radius:6px; font-weight:700; text-decoration:none; font-size:0.875rem;">公費解体ガイド →</a>
          <a href="hikawa-support.html" style="background:#e6f4f1; color:#185f55; border:1px solid #185f55; padding:8px 14px; border-radius:6px; font-weight:700; text-decoration:none; font-size:0.875rem;">被災者支援一覧 →</a>
        </div>
      </div>
    </aside>

    <div class="uto-sup-container">

      <!-- シミュレーターセクション -->
      <section class="uto-sup-sim-box" id="simulator" aria-labelledby="sim-title">
        <div class="uto-sup-sim-header">
          <h2 id="sim-title">現在の状況から、使える制度を調べる</h2>
          <p>当てはまる立場や条件を選ぶと、該当する制度がハイライトされ、絞り込んで確認できます。</p>
        </div>

        <!-- かんたんプリセット -->
        <div class="uto-sim-presets">
          <span class="uto-sim-preset-label">よく使われる立場から選ぶ：</span>
          <div class="uto-sim-preset-chips">
            <button type="button" class="uto-sim-preset-btn" data-preset="childcare">🎒 子育て世帯</button>
            <button type="button" class="uto-sim-preset-btn" data-preset="senior">👴 シニア・高齢者世帯</button>
            <button type="button" class="uto-sim-preset-btn" data-preset="housing">🏠 持ち家・リフォーム検討</button>
            <button type="button" class="uto-sim-preset-btn" data-preset="newlywed">🌸 新婚・移住検討</button>
            <button type="button" class="uto-sim-preset-btn" data-preset="business">💼 自営業・農業・特産品</button>
            <button type="button" class="uto-sim-preset-btn" data-preset="disaster">🆘 地震で被災された方</button>
            <button type="button" class="uto-sim-reset-btn" id="utoSimResetBtn">🔄 条件をクリア</button>
          </div>
        </div>

        <!-- 詳細条件アコーディオン -->
        <details class="uto-sim-details" id="utoSimDetails">
          <summary class="uto-sim-details-summary">
            <div class="uto-sim-summary-left">
              <span class="uto-sim-summary-icon" aria-hidden="true">⚙️</span>
              <div class="uto-sim-summary-headings">
                <span class="uto-sim-summary-title">さらに詳細な条件で絞り込む</span>
                <span class="uto-sim-summary-sub">対象者の年齢・世帯状況・被災程度・事業形態など</span>
              </div>
            </div>
            <div class="uto-sim-summary-toggle">
              <span class="toggle-text">詳細条件を開く</span>
              <span class="toggle-arrow" aria-hidden="true">▼</span>
            </div>
          </summary>
          <div class="uto-sim-details-content">
            <div class="uto-sim-grid">
              <!-- ライフステージ -->
              <div class="uto-sim-col">
                <b>① 年齢・ライフステージ</b>
                <div class="uto-filter-chips">
                  <label><input type="checkbox" name="simLife" value="child_infant"> 乳幼児（0〜5歳）</label>
                  <label><input type="checkbox" name="simLife" value="child_school"> 小中高生（6〜18歳）</label>
                  <label><input type="checkbox" name="simLife" value="newlywed"> 新婚・若者夫婦</label>
                  <label><input type="checkbox" name="simLife" value="working"> 現役・勤労世代</label>
                  <label><input type="checkbox" name="simLife" value="senior"> シニア（65歳以上）</label>
                </div>
              </div>
              <!-- 家族構成 -->
              <div class="uto-sim-col">
                <b>② 世帯・家族の状況</b>
                <div class="uto-filter-chips">
                  <label><input type="checkbox" name="simFamily" value="childcare"> 子どもと同居中</label>
                  <label><input type="checkbox" name="simFamily" value="single_parent"> ひとり親世帯</label>
                  <label><input type="checkbox" name="simFamily" value="senior_only"> 高齢者のみ世帯</label>
                  <label><input type="checkbox" name="simFamily" value="disability"> 障がい・要介護認定</label>
                </div>
              </div>
              <!-- 住まいの状況 -->
              <div class="uto-sim-col">
                <b>③ 住まいの状況</b>
                <div class="uto-filter-chips">
                  <label><input type="checkbox" name="simHousing" value="owned_wood"> 持ち家（木造戸建て）</label>
                  <label><input type="checkbox" name="simHousing" value="rental"> 借家・賃貸住宅</label>
                  <label><input type="checkbox" name="simHousing" value="septic"> 浄化槽を使用</label>
                  <label><input type="checkbox" name="simHousing" value="vacant"> 空き家所有・解体検討</label>
                </div>
              </div>
              <!-- 熊本地震の被災状況 -->
              <div class="uto-sim-col">
                <b>④ 熊本地震の被害（り災判定）</b>
                <div class="uto-filter-chips">
                  <label><input type="checkbox" name="simDisaster" value="damage_heavy"> 全壊〜中規模半壊</label>
                  <label><input type="checkbox" name="simDisaster" value="damage_half"> 半壊（解体含む）</label>
                  <label><input type="checkbox" name="simDisaster" value="damage_partial"> 一部損壊（準半壊含む）</label>
                  <label><input type="checkbox" name="simDisaster" value="none"> 被害なし（平時）</label>
                </div>
              </div>
              <!-- 仕事・産業 -->
              <div class="uto-sim-col">
                <b>⑤ 仕事・生業</b>
                <div class="uto-filter-chips">
                  <label><input type="checkbox" name="simWork" value="employee"> 会社員・公務員など</label>
                  <label><input type="checkbox" name="simWork" value="business"> 個人事業主・商工業</label>
                  <label><input type="checkbox" name="simWork" value="agri"> い草・農業・果樹</label>
                  <label><input type="checkbox" name="simWork" value="startup"> 創業検討・起業家</label>
                </div>
              </div>
              <!-- 所得要件 -->
              <div class="uto-sim-col">
                <b>⑥ 所得の目安</b>
                <div class="uto-filter-chips">
                  <label><input type="checkbox" name="simIncome" value="low_income"> 非課税・低所得世帯</label>
                  <label><input type="checkbox" name="simIncome" value="no_limit"> 所得制限なし（全般）</label>
                </div>
              </div>
            </div>
          </div>
        </details>

        <!-- 選択中の条件表示バー -->
        <div class="uto-sim-active-bar" id="utoSimActiveBar" style="display: none;">
          <div class="uto-sim-active-header">
            <div class="uto-sim-active-title">
              <span>🎯 適用中の条件：</span>
              <span class="uto-sim-result-count" id="utoSimResultCount">該当 0件</span>
            </div>
            <div class="uto-sim-active-actions">
              <button type="button" class="uto-sim-scroll-btn" id="utoSimScrollBtn">該当する制度を見る（↓）</button>
              <button type="button" class="uto-sim-clear-btn" id="utoSimClearBtn">✕ 条件をすべて解除</button>
            </div>
          </div>
          <div class="uto-sim-active-tags" id="utoSimActiveTags"></div>
        </div>
      </section>

      <!-- 氷川町独自の連携・独自メリット解説 -->
      <section class="uto-sup-merit-box" id="hikawa-special" aria-labelledby="hikawa-merit-title">
        <div class="uto-sup-merit-header">
          <h2 id="hikawa-merit-title">知っておきたい！氷川町の制度連携・独自メリット</h2>
          <p>氷川町が提供する支援制度には、全国有数のい草産地としての独自制度や、手厚い子育て祝い金などの特徴があります。</p>
        </div>
        <div class="uto-sup-merit-grid">
          <div class="uto-sup-merit-card">
            <div class="uto-sup-merit-icon">🌾</div>
            <h3>い草の里ならではの「畳表張替助成事業」</h3>
            <p>
              町内施工業者を通じて地元・氷川町産の良質ない草畳表を使った表替え・新調工事を行う際、<strong>工事費用の一部を町が助成</strong>。
              被災後の住環境リフレッシュや快適な和室づくりを経済的に支援します。
            </p>
          </div>
          <div class="uto-sup-merit-card">
            <div class="uto-sup-merit-icon">👶</div>
            <h3>「すこやか赤ちゃん出産祝金」＋「10万円給付」</h3>
            <p>
              国の出産・子育て応援給付金（計10万円）に加え、氷川町独自で<strong>「すこやか赤ちゃん出産祝金」</strong>を給付。
              第1子から手厚い祝金が贈呈され、赤ちゃんの誕生を町全体で温かく祝福します。
            </p>
          </div>
          <div class="uto-sup-merit-card">
            <div class="uto-sup-merit-icon">🏡</div>
            <h3>お試し滞在できる「氷川町移住体験住宅」</h3>
            <p>
              家具や生活必需品が揃った体験住宅を用意しており、移住検討者が数日〜数週間<strong>実際のひかわ暮らしを体感</strong>できます。
              移住支援金（最大100万円＋加算）と組み合わせて、安心して新生活を設計できます。
            </p>
          </div>
        </div>
      </section>

      <!-- 検索・カテゴリタブ -->
      <div class="uto-sup-controls">
        <div class="uto-sup-search-wrap">
          <input type="search" id="utoSupSearch" placeholder="キーワードで制度を検索（例：耐震、畳表、医療費、解体、移住...）" aria-label="制度をキーワード検索">
        </div>
        <div class="uto-sup-cat-tabs" role="tablist" aria-label="制度のカテゴリ">
          <button type="button" class="uto-sup-cat-btn active" data-cat="all" role="tab" aria-selected="true">すべて表示 (''')
    html_parts.append(str(len(SYSTEMS)))
    html_parts.append('''件)</button>
''')

    for cat in CATEGORIES:
        count = sum(1 for s in SYSTEMS if s["cat"] == cat["id"])
        html_parts.append(f'''          <button type="button" class="uto-sup-cat-btn" data-cat="{cat["id"]}" role="tab" aria-selected="false">{cat["icon"]} {cat["name"]} ({count})</button>\n''')

    html_parts.append('''        </div>
      </div>

      <!-- 該当件数カウンター -->
      <div class="uto-sup-count-bar">
        <span>表示中の制度：<b id="utoSupCount">''')
    html_parts.append(str(len(SYSTEMS)))
    html_parts.append('''</b>件</span>
      </div>

      <!-- 該当なしメッセージ -->
      <div class="uto-sup-empty" id="utoSupEmpty" style="display: none;">
        <p>選択された条件に一致する制度が見つかりませんでした。<br>条件を緩めるか、別のキーワードでお試しください。</p>
      </div>

      <!-- 制度一覧（1列カードレイアウト） -->
      <div class="uto-sup-sections" id="utoSupSections">
''')

    for cat in CATEGORIES:
        cat_items = [s for s in SYSTEMS if s["cat"] == cat["id"]]
        if not cat_items:
            continue

        html_parts.append(f'''
      <!-- カテゴリ：{cat["name"]} -->
      <section class="uto-sup-section" id="cat-{cat["id"]}" data-cat="{cat["id"]}" aria-labelledby="heading-{cat["id"]}">
        <div class="uto-sup-section-head">
          <h2 id="heading-{cat["id"]}">{cat["icon"]} {cat["name"]}</h2>
          <p>{cat["desc"]}</p>
        </div>
        <div class="uto-sup-cards-flow">
''')

        for item in cat_items:
            icon_svg = ICONS.get(item["icon"], ICONS["reform"])
            tag_spans = " ".join([f'<span class="uto-tag">{t}</span>' for t in item.get("tags", [])])
            extra_html = f'<div class="uto-card-extra">{item["extra"]}</div>' if item.get("extra") else ''
            phone_link = f'<a href="tel:{item["phone"].replace("-", "")}">{item["phone"]}</a>' if item.get("phone") else ''
            url_target = ' target="_blank" rel="noopener"' if item["url"].startswith("http") else ''

            html_parts.append(f'''          <article class="uto-card" 
            data-cat="{item["cat"]}"
            data-life="{",".join(item["life"])}"
            data-family="{",".join(item["family"])}"
            data-housing="{",".join(item["housing"])}"
            data-income="{",".join(item["income"])}"
            data-disaster="{",".join(item["disaster"])}"
            data-work="{",".join(item["work"])}">
            <div class="uto-card-header">
              <div class="uto-card-icon-box">
                {icon_svg}
              </div>
              <div class="uto-card-title-group">
                <div class="uto-card-badges">
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
      <section class="uto-sup-contact-box" aria-labelledby="hikawa-contact-title">
        <h3 id="hikawa-contact-title">氷川町役場 お問い合わせ・窓口案内</h3>
        <p style="font-size:0.95rem; line-height:1.6; color:#475569; margin-bottom:18px;">
          各制度の申請要件、今年度の受付期限、必要書類などは制度ごとに異なります。詳しくは各カードに記載の担当課直通電話、または役場代表窓口へお問い合わせください。
        </p>
        <div class="uto-sup-contact-grid">
          <div class="uto-sup-contact-item">
            <b>氷川町役場 宮原振興クリニック庁舎（本庁）</b>
            <p>〒869-4692 熊本県八代郡氷川町宮原栄久33<br>開庁時間：平日 8:30〜17:15</p>
            <a href="tel:0965622111">0965-62-2111（代表）</a>
          </div>
          <div class="uto-sup-contact-item">
            <b>氷川町役場 竜北庁舎（建設下水道課等）</b>
            <p>〒869-4814 氷川町島地342-1<br>公費解体・耐震診断・浄化槽・住宅修繕</p>
            <a href="tel:0965525862">0965-52-5862</a>
          </div>
          <div class="uto-sup-contact-item">
            <b>公費解体受付専用ダイヤル</b>
            <p>公費解体・自費解体の申請・予約受付専用<br>平日 9:00〜17:00</p>
            <a href="tel:0120091110">0120-091-110（フリーダイヤル）</a>
          </div>
          <div class="uto-sup-contact-item">
            <b>氷川町商工会</b>
            <p>〒869-4602 氷川町宮原760<br>小規模事業者支援・経営相談・特産品振興</p>
            <a href="tel:0965622188">0965-62-2188</a>
          </div>
        </div>
        <p style="margin-top:20px; font-size:0.875rem; color:#64748b;">
          関連リンク：<a href="https://www.town.hikawa.kumamoto.jp/" target="_blank" rel="noopener">氷川町公式ホームページ ↗</a> · <a href="hikawa-demolition.html">氷川町 公費解体・自費解体ガイド</a> · <a href="hikawa-support.html">氷川町 被災者支援制度一覧</a> · <a href="municipalities.html">自治体別支援情報へ戻る</a>
        </p>
      </section>

    </div>
  </main>
  <footer class="site-footer"></footer>
  <script src="org-site.js?v=20260907-2"></script>
  <script src="hikawa-living-support.js?v=20260921-1"></script>
</body>
</html>
''')

    content = "".join(html_parts)
    Path("hikawa-living-support.html").write_text(content, encoding="utf-8")
    print(f"Generated hikawa-living-support.html with {len(SYSTEMS)} systems and SVG illustrations.")

if __name__ == "__main__":
    generate_html()
