#!/usr/bin/env python3
"""uto-support.html を生成するスクリプト（幅レイアウト適正化・SVGイラストアイコン・シミュレーター付き）"""
import json
from pathlib import Path

# SVGアイコン定義（親しみやすく直感的なベクターイラスト）
ICONS = {
    "reform": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M14.5 12a2.5 2.5 0 0 0-3.5-3.5L8 11.5l4.5 4.5z"/><path d="m11.5 15 3.5 3.5"/></svg>''',
    "retrofit_check": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="14" r="3"/><path d="m14.5 16.5 2.5 2.5"/><path d="m9 13 2 2 4-4"/></svg>''',
    "retrofit_build": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M12 11v7"/><path d="M8 15h8"/><path d="M12 22s5-3 5-8V9l-5-2-5 2v5c0 5 5 8 5 8z" opacity="0.3"/></svg>''',
    "wall": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18"/><path d="M9 3v6M15 3v6M6 9v6M12 9v6M18 9v6M9 15v6M15 15v6"/></svg>''',
    "demolish": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="m7 7 10 10M17 7 7 17"/></svg>''',
    "landslide": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 20 8-14 4 7 8-3"/><path d="m14 15 4-3 4 3v5H14z"/></svg>''',
    "septic": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/><path d="M12 12v6M9 15h6"/></svg>''',
    "compost": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 3.5 1 7.5-1.5 10.5M11 20a7 7 0 0 0 6.5-7.5"/><path d="M11 20v-8"/></svg>''',
    "rainwater": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 19v2M8 13v2M12 21v2M12 15v2M16 19v2M16 13v2"/></svg>''',
    "vacant": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="14" r="2"/><path d="M12 16v3"/></svg>''',
    "child_med": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M19 8h4M21 6v4"/></svg>''',
    "child_benefit": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg>''',
    "single_parent": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>''',
    "school_aid": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10M6 10h10M6 14h6"/></svg>''',
    "afterschool": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>''',
    "preschool": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="8" height="8" rx="1"/><rect x="13" y="11" width="8" height="8" rx="1"/><path d="m8 3 5 8H3z"/></svg>''',
    "edu_loan": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>''',
    "heart": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>''',
    "maternity": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12h6M12 9v6"/><circle cx="12" cy="12" r="9"/></svg>''',
    "postpartum": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z"/><circle cx="17" cy="7" r="3"/><path d="M14 14a5 5 0 0 1 7 4"/></svg>''',
    "hearing": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a2.5 2.5 0 0 1-5 0"/><path d="M10 13a2.5 2.5 0 0 0 5 0"/></svg>''',
    "fertility": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a5 5 0 0 1 5 5c0 4-5 9-5 9s-5-5-5-9a5 5 0 0 1 5-5Z"/><circle cx="12" cy="7" r="2"/><path d="M12 16v6M8 20h8"/></svg>''',
    "checkup": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>''',
    "senior_house": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22v-6h6v6"/></svg>''',
    "emergency_bell": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M2 2l20 20" opacity="0.3"/></svg>''',
    "meal": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2v20M18 10h4M2 8a4 4 0 0 1 4-4h4v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z"/><path d="M6 4v6"/></svg>''',
    "aid_hearing": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11h3l3-7 4 14 3-7h5"/></svg>''',
    "taxi": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H10l-2 4H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h1a2 2 0 0 0 4 0h6a2 2 0 0 0 4 0h1a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-4z"/><circle cx="7" cy="18" r="1"/><circle cx="17" cy="18" r="1"/></svg>''',
    "wheelchair": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="5" r="2"/><path d="M10 7v6h4l3 5M8 17a5 5 0 1 1 5-5"/></svg>''',
    "assist_walk": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><path d="m10 22 2-7 3 3v4M8 12h8"/><path d="m14 15 2 7"/></svg>''',
    "diaper": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 7h-17A1.5 1.5 0 0 0 2 8.5v7A1.5 1.5 0 0 0 3.5 17h17a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 20.5 7z"/><path d="M7 7v10M17 7v10"/></svg>''',
    "insurance_shield": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>''',
    "wedding": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="5"/><circle cx="15" cy="12" r="5"/><path d="m9 7 3-4 3 4"/></svg>''',
    "moving": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>''',
    "community": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>''',
    "hall": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16M2 8l10-6 10 6v2H2zM6 10v9M10 10v9M14 10v9M18 10v9"/></svg>''',
    "fire_prep": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a9 9 0 0 0-9 9v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a9 9 0 0 0-9-9z"/><path d="M12 12v6M9 15h6"/></svg>''',
    "loan_biz": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v4M12 14v4M16 14v4"/></svg>''',
    "startup": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6M10 22h4"/></svg>''',
    "sme": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>''',
    "farmer": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22 12 2l10 20"/><path d="M5.5 15h13M8 10h8"/></svg>''',
    "rebuild": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M12 3v4M3 12h4M17 12h4M12 18h.01"/></svg>''',
    "emergency_repair": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>''',
    "jizokuka_disaster": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20M5 20V8l4 3 4-3 4 3 3-3v12"/><path d="M10 14h4"/></svg>''',
    "public_demolish": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/></svg>''',
    "relief_money": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 18V6"/></svg>''',
    "disaster_loan": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M7 15h.01M17 15h.01"/></svg>''',
    "tax_relief": '''<svg class="uto-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg>'''
}

# 宇土市の主要な支援制度の定義
SYSTEMS = [
    # 1. 住まい・耐震・環境
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "被災併用OK・最大25万円",
        "title": "宇土市住宅リフォーム助成事業",
        "amount": "対象工事費用の20%（最大25万円分の商品券）",
        "desc": "市民の住環境向上と地元商工業の活性化のため、市内の施工業者による住宅リフォーム工事費用の一部を地域商品券で助成。外壁・屋根塗装、水回り改修、バリアフリー化などが対象です。",
        "extra": "【熊本地震支援との連携】災害救助法に基づく「住宅の応急修理」を完了した世帯が、追加で自己負担リフォームを行う場合も本助成の対象となります。被災者生活再建支援金や義援金の受給世帯も申請可能です。",
        "dept": "商工観光課 商工振興係",
        "phone": "0964-27-3329",
        "url": "https://www.city.uto.lg.jp/article/view/1007/12355.html",
        "urlLabel": "宇土市公式：住宅リフォーム助成事業 ↗",
        "icon": "reform",
        "life": ["working", "senior", "newlywed"],
        "family": ["general", "childcare", "senior_only"],
        "housing": ["owned_wood"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#持ち家", "#リフォーム", "#商品券25万", "#被災併用OK"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "無料耐震診断",
        "title": "戸建て木造住宅耐震診断事業補助金",
        "amount": "自己負担無料（市が木造住宅耐震診断士を派遣・全額補助）",
        "desc": "昭和56年5月31日以前に着工された旧耐震基準の木造一戸建て住宅を対象に、市が専門の耐震診断士を派遣して耐震性を無料で総合調査します。",
        "extra": "大地震に対する我が家の倒壊危険度を把握し、耐震改修や補強計画の基礎資料として活用できます。",
        "dept": "都市整備課 建築住宅係",
        "phone": "0964-27-3332",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（建築住宅係） ↗",
        "icon": "retrofit_check",
        "life": ["working", "senior"],
        "family": ["general", "senior_only"],
        "housing": ["owned_wood"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_partial"],
        "work": ["all"],
        "tags": ["#木造住宅", "#旧耐震", "#無料耐震診断"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "最大100万円補助",
        "title": "戸建て木造住宅耐震改修等事業補助金（建替え・改修）",
        "amount": "耐震改修・建替え：最大100万円補助 / 耐震シェルター設置：最大30万円補助",
        "desc": "耐震診断の結果、倒壊の危険性があると判定された旧耐震木造住宅について、耐震改修工事、建替え工事、または寝室等の安全を確保する耐震シェルターの設置費用を補助します。",
        "extra": "改修だけでなく建替えも対象。高齢者世帯には耐震シェルター設置も有効です。",
        "dept": "都市整備課 建築住宅係",
        "phone": "0964-27-3332",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（建築住宅係） ↗",
        "icon": "retrofit_build",
        "life": ["working", "senior"],
        "family": ["general", "senior_only"],
        "housing": ["owned_wood"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_partial"],
        "work": ["all"],
        "tags": ["#木造住宅", "#耐震改修", "#建替え", "#シェルター30万"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "撤去・改修最大16万円",
        "title": "危険ブロック塀等安全確保支援事業補助金",
        "amount": "撤去・建替え工事費用の2/3（上限16万円）",
        "desc": "避難路や道路に面した倒壊の危険があるブロック塀、石積塀等の撤去、または安全な軽量フェンス等への建替え費用を補助し、地震時の倒壊事故や避難路閉塞を防ぎます。",
        "extra": "道路境界に面する高さや傾きなどの安全点検基準があります。着工前の申請が必要です。",
        "dept": "都市整備課 建築住宅係",
        "phone": "0964-27-3332",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（建築住宅係） ↗",
        "icon": "wall",
        "life": ["working", "senior"],
        "family": ["general"],
        "housing": ["owned_wood", "vacant"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_partial"],
        "work": ["all"],
        "tags": ["#ブロック塀", "#道路沿い", "#撤去費16万"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "解体費最大50万円",
        "title": "老朽危険空家等除去促進事業補助金",
        "amount": "解体撤去費用の1/3（上限50万円）",
        "desc": "長期間使用されず、周囲に危険を及ぼす恐れのある特定空家等の解体・撤去費用を補助し、市民の安全確保と生活環境の改善を図ります。",
        "extra": "周囲への危険度判定基準を満たす必要があります。対象要件等の事前相談を受け付けています。",
        "dept": "都市整備課 建築住宅係",
        "phone": "0964-27-3332",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（建築住宅係） ↗",
        "icon": "demolish",
        "life": ["working", "senior"],
        "family": ["general"],
        "housing": ["vacant"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_partial"],
        "work": ["all"],
        "tags": ["#空き家解体", "#上限50万", "#倒壊危険防止"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "危険区域からの移転",
        "title": "がけ地近接・土砂災害危険住宅移転事業補助金",
        "amount": "危険住宅除却費（最大97.5万円）＋住宅移転支援（融資利子等最大421万円）",
        "desc": "土砂災害警戒区域やがけ地等の危険区域内にある住宅を安全な地域へ移転・建替える際、既存住宅の除却費用や新たな住宅の建設・購入のための借入利子等を補助します。",
        "extra": "土砂災害特別警戒区域等に指定された区域内の住宅が対象となります。",
        "dept": "都市整備課 建築住宅係",
        "phone": "0964-27-3332",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（建築住宅係） ↗",
        "icon": "landslide",
        "life": ["working", "senior"],
        "family": ["general"],
        "housing": ["owned_wood"],
        "income": ["general"],
        "disaster": ["none", "damage_partial"],
        "work": ["all"],
        "tags": ["#土砂警戒区域", "#住宅移転", "#融資利子補給"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "水洗化・最大約58万円〜",
        "title": "合併処理浄化槽設置整備事業補助金",
        "amount": "人槽区分・既存単独浄化槽撤去に応じて最大約58万円〜（配管工事加算あり）",
        "desc": "生活排水による河川の水質汚濁を防ぐため、汲み取り便所や単独処理浄化槽から高度処理型合併処理浄化槽へ転換・設置する費用の一部を補助します。",
        "extra": "既存単独槽の撤去や宅内配管工事を伴う場合は補助額が上乗せされます。",
        "dept": "都市整備課 下水道係",
        "phone": "0964-27-3334",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（下水道係） ↗",
        "icon": "septic",
        "life": ["all"],
        "family": ["general"],
        "housing": ["septic", "owned_wood"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#浄化槽転換", "#水洗化", "#最大58万〜"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "購入費の1/2補助",
        "title": "生ごみ処理機器等購入費補助金",
        "amount": "購入価格の2分の1（電動式上限20,000円 / 容器・コンポスト等上限3,000円）",
        "desc": "家庭から排出される生ごみの自家減量化・堆肥化を促進するため、電動生ごみ処理機やコンポスト容器の購入費用の一部を助成します。",
        "extra": "市内の販売店等で購入する前に要件をご確認ください。1世帯あたりの補助基数制限があります。",
        "dept": "環境福祉課 環境衛生係",
        "phone": "0964-27-3323",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（環境衛生係） ↗",
        "icon": "compost",
        "life": ["all"],
        "family": ["general"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#生ごみ処理機", "#購入費半額", "#環境美化"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "設置費用の1/2助成",
        "title": "雨水貯留施設設置補助金",
        "amount": "設置費用の2分の1（上限20,000円）",
        "desc": "雨水の有効利用と流出抑制、地震等の災害時における初期消火用水・生活用水の確保を図るため、住宅用雨水タンク（貯留施設）の設置費用を補助します。",
        "extra": "容量100リットル以上の貯留施設が対象です。防災時の非常用水としても役立ちます。",
        "dept": "都市整備課 下水道係",
        "phone": "0964-27-3334",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（下水道係） ↗",
        "icon": "rainwater",
        "life": ["all"],
        "family": ["general"],
        "housing": ["owned_wood"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#雨水タンク", "#防災用水", "#設置補助"]
    },
    {
        "cat": "housing",
        "catName": "住まい・耐震・環境",
        "badge": "空き家改修最大50万円",
        "title": "宇土市空き家バンク活用促進補助金",
        "amount": "改修工事費用の1/2（上限50万円）＋不要家財処分費用（上限10万円）",
        "desc": "空き家バンクに登録された物件の利活用を促進するため、物件の購入者または賃借人が行う改修工事費用や、所有者が行う家財処分費用を補助します。",
        "extra": "市外からの移住者や子育て世帯が入居する場合に手厚い支援設定があります。",
        "dept": "まちづくり推進課 政策推進係",
        "phone": "0964-27-3315",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（政策推進係） ↗",
        "icon": "vacant",
        "life": ["newlywed", "working"],
        "family": ["general", "childcare"],
        "housing": ["vacant", "rental", "owned_wood"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#空き家バンク", "#改修最大50万", "#家財処分"]
    },

    # 2. 子育て・教育・就学支援
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学支援",
        "badge": "高校生世代まで無料",
        "title": "子ども医療費助成事業",
        "amount": "0歳〜高校生世代（18歳到達後最初の3月31日まで）：通院・入院の保険診療自己負担分を全額助成",
        "desc": "宇土市内に住所のある高校生世代までのお子さんの医療費（保険適用分）を助成。窓口で「受給者証」を提示することで、熊本県内の医療機関窓口での支払いが不要（現物給付）となります。",
        "extra": "所得制限はありません。入院時の食事代や保険適用外の費用は自己負担となります。",
        "dept": "子育て支援課 子育て給付係",
        "phone": "0964-27-3337",
        "url": "https://www.city.uto.lg.jp/article/view/1018/14818.html",
        "urlLabel": "宇土市公式：子ども医療費助成事業 ↗",
        "icon": "child_med",
        "life": ["child_infant", "child_school"],
        "family": ["childcare", "single_parent"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#高校生まで無料", "#医療費現物給付", "#所得制限なし"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学支援",
        "badge": "高校生年代まで拡充",
        "title": "児童手当",
        "amount": "0歳〜3歳未満月額1.5万円 / 3歳〜高校生月額1万円（第3子以降月額3万円）",
        "desc": "高校生年代（18歳到達後の最初の3月31日）までのお子さんを養育している方に支給されます。制度改正により所得制限が撤廃され、支給期間・多子加算が大幅に拡充されています。",
        "extra": "年6回（偶数月）に2か月分ずつ指定口座へ支給されます。",
        "dept": "子育て支援課 子育て給付係",
        "phone": "0964-27-3337",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（子育て給付係） ↗",
        "icon": "child_benefit",
        "life": ["child_infant", "child_school"],
        "family": ["childcare", "single_parent"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#高校生年代まで", "#所得制限撤廃", "#多子加算"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学支援",
        "badge": "ひとり親世帯手当",
        "title": "児童扶養手当",
        "amount": "全部支給月額45,500円〜一部支給（所得・お子さんの人数に応じて算定）",
        "desc": "父母の離婚や死亡などにより、父または母と生計を同じくしていない児童を養育しているひとり親世帯等の生活の安定と自立を助けるための手当です。",
        "extra": "年6回（奇数月）に支給。所得額に応じた一部支給基準があります。",
        "dept": "子育て支援課 子育て給付係",
        "phone": "0964-27-3337",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（子育て給付係） ↗",
        "icon": "single_parent",
        "life": ["child_infant", "child_school"],
        "family": ["single_parent"],
        "housing": ["general"],
        "income": ["low_income"],
        "disaster": ["none", "damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#ひとり親世帯", "#月額最大45500円", "#生活安定"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学支援",
        "badge": "親子の通院・入院支援",
        "title": "ひとり親家庭等医療費助成",
        "amount": "ひとり親家庭の父・母・養育者および児童の医療費自己負担分を助成",
        "desc": "母子家庭・父子家庭等の健康維持と福祉向上を図るため、健康保険適用による診療・調剤の自己負担額を助成します（所得制限等の所定要件あり）。",
        "extra": "児童扶養手当受給世帯などが対象です。登録手続き後に受給者証が交付されます。",
        "dept": "子育て支援課 子育て給付係",
        "phone": "0964-27-3337",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（子育て給付係） ↗",
        "icon": "child_med",
        "life": ["child_infant", "child_school", "working"],
        "family": ["single_parent"],
        "housing": ["general"],
        "income": ["low_income"],
        "disaster": ["none", "damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#ひとり親世帯", "#親と子の医療費", "#自己負担助成"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学支援",
        "badge": "入学時のお祝い金",
        "title": "ひとり親家庭児童入学祝金",
        "amount": "小学校入学児童：1人1万円 / 中学校等入学児童：1人1万5千円",
        "desc": "ひとり親家庭の児童が小学校または中学校・義務教育学校等に入学する際、入学に伴う経済的負担を和らげ健やかな成長を祝う祝金を支給します。",
        "extra": "宇土市内に住所を有し、児童扶養手当受給資格等を有するひとり親世帯が対象です。",
        "dept": "子育て支援課 子育て給付係",
        "phone": "0964-27-3337",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（子育て給付係） ↗",
        "icon": "school_aid",
        "life": ["child_school"],
        "family": ["single_parent"],
        "housing": ["general"],
        "income": ["low_income"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#小中入学祝", "#ひとり親", "#最大1.5万円"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学支援",
        "badge": "学用品・給食費の援助",
        "title": "宇土市就学援助制度",
        "amount": "学用品費、通学用品費、校外活動費、修学旅行費、学校給食費等の全額または一部",
        "desc": "経済的理由により小中学校への就学が困難な世帯に対し、学用品費や給食費、修学旅行費などの必要な費用を援助する制度です（前年所得等による審査あり）。",
        "extra": "【熊本地震による特例】災害により家計が急変したり住家に甚大な被害を受けた世帯についても、随時申請・特例認定の対象となります。",
        "dept": "学校教育課 学務係",
        "phone": "0964-22-6500",
        "url": "https://www.city.uto.lg.jp/article/view/1068/11514.html",
        "urlLabel": "宇土市公式：就学援助 ↗",
        "icon": "school_aid",
        "life": ["child_school"],
        "family": ["childcare", "single_parent"],
        "housing": ["general"],
        "income": ["low_income"],
        "disaster": ["none", "damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#小中学校", "#学用品・給食費", "#家計急変特例"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学支援",
        "badge": "放課後の安全な居場所",
        "title": "宇土市放課後児童クラブ利用料減免制度",
        "amount": "生活保護世帯・非課税世帯：月額利用料の全額免除または減額",
        "desc": "放課後や学校休業日に就労等で保護者が不在となる児童を預かる放課後児童クラブ（学童保育）について、所得状況等に応じた利用料の減免措置を実施しています。",
        "extra": "市内各小学校区に設置。長期休業中（夏休み等）の利用枠もあります。",
        "dept": "子育て支援課 保育係",
        "phone": "0964-27-3336",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（保育係） ↗",
        "icon": "afterschool",
        "life": ["child_school"],
        "family": ["childcare", "single_parent"],
        "housing": ["general"],
        "income": ["low_income"],
        "disaster": ["none", "damage_heavy", "damage_half"],
        "work": ["employee", "business"],
        "tags": ["#学童保育", "#利用料減免", "#共働き・ひとり親"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学支援",
        "badge": "3〜5歳児利用料0円",
        "title": "幼児教育・保育の無償化および副食費免除",
        "amount": "3〜5歳児クラス全額無償 / 0〜2歳児住民税非課税世帯無償（副食費免除制度あり）",
        "desc": "認可保育所、認定こども園、幼稚園等を利用する子どもの利用料が無償化されています。年収・世帯状況に応じた給食費（副食費）の免除制度も用意されています。",
        "extra": "認可外保育施設等を利用する場合も、保育の必要性の認定により一定限度額まで無償化対象となります。",
        "dept": "子育て支援課 保育係",
        "phone": "0964-27-3336",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（保育係） ↗",
        "icon": "preschool",
        "life": ["child_infant"],
        "family": ["childcare", "single_parent"],
        "housing": ["general"],
        "income": ["no_limit", "low_income"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#3〜5歳無償", "#保育料無料", "#副食費免除"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学支援",
        "badge": "利子を市が全額補給",
        "title": "宇土市勤労者教育ローン利子補給制度",
        "amount": "教育資金借入利子の全額（年利1.5%相当を上限に在学中補給）",
        "desc": "市内に居住する勤労者が、お子さんの高校・大学・専門学校等への進学・在学資金として金融機関（九州ろうきん等）から借り入れた教育ローンの利息分を市が全額補給します。",
        "extra": "在学期間中の返済負担を大きく軽減。申請年度ごとに利子補給の受付が行われます。",
        "dept": "商工観光課 商工振興係",
        "phone": "0964-27-3329",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（商工振興係） ↗",
        "icon": "edu_loan",
        "life": ["child_school", "working"],
        "family": ["childcare"],
        "housing": ["general"],
        "income": ["general"],
        "disaster": ["none"],
        "work": ["employee", "business"],
        "tags": ["#高校・大学進学", "#教育ローン", "#利子全額補給"]
    },
    {
        "cat": "childcare",
        "catName": "子育て・教育・就学支援",
        "badge": "遺児等の育成支援",
        "title": "宇土市遺児手当",
        "amount": "対象児童1人につき月額手当を支給（学齢期加算あり）",
        "desc": "交通事故、労働災害、病気や災害等により生計維持者を亡くした遺児を養育している保護者に対し、生活の安定と健全な育成を願って市独自の手当を支給します。",
        "extra": "市内に1年以上在住などの要件があります。詳細は子育て給付係へご相談ください。",
        "dept": "子育て支援課 子育て給付係",
        "phone": "0964-27-3337",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（子育て給付係） ↗",
        "icon": "heart",
        "life": ["child_infant", "child_school"],
        "family": ["single_parent"],
        "housing": ["general"],
        "income": ["low_income"],
        "disaster": ["none", "damage_heavy"],
        "work": ["all"],
        "tags": ["#遺児支援", "#月額手当", "#学齢児加算"]
    },

    # 3. 妊娠・出産・女性・健康づくり
    {
        "cat": "health",
        "catName": "妊娠・出産・女性・健康づくり",
        "badge": "14回分無料受診票",
        "title": "妊婦健康診査受診票交付",
        "amount": "妊婦一般健康診査14回分＋産婦健康診査2回分の費用助成（無料券交付）",
        "desc": "母子健康手帳の交付時に、妊婦健診14回分および産後健診の公費助成受診票を交付。県内委託医療機関・助産所での健診費用が公費負担となります。",
        "extra": "多胎妊娠（双子・三つ子等）の場合は受診票が追加交付されます。県外受診の償還払い制度もあります。",
        "dept": "保健センター（健康増進課）",
        "phone": "0964-22-2300",
        "url": "https://www.city.uto.lg.jp/article/view/1017/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（保健指導係） ↗",
        "icon": "maternity",
        "life": ["child_infant"],
        "family": ["childcare"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#妊娠期", "#健診14回無料", "#多胎加算"]
    },
    {
        "cat": "health",
        "catName": "妊娠・出産・女性・健康づくり",
        "badge": "宿泊・通所・訪問サポート",
        "title": "産後ケア事業（ショートステイ・デイサービス・アウトリーチ）",
        "amount": "宿泊型（1泊2日〜）・通所型・訪問型の自己負担軽減（非課税世帯減免あり）",
        "desc": "出産後1年未満の産婦と乳児を対象に、助産所や産科医療機関で助産師等による授乳指導、乳房ケア、育児相談、休養サポートを提供します。",
        "extra": "産後の孤立や育児不安を予防するため、心身のケアが必要な方が気軽に利用できます。",
        "dept": "保健センター（健康増進課）",
        "phone": "0964-22-2300",
        "url": "https://www.city.uto.lg.jp/article/view/1017/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（保健指導係） ↗",
        "icon": "postpartum",
        "life": ["child_infant"],
        "family": ["childcare", "single_parent"],
        "housing": ["general"],
        "income": ["no_limit", "low_income"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#産後1年未満", "#宿泊・通所・訪問", "#育児不安解消"]
    },
    {
        "cat": "health",
        "catName": "妊娠・出産・女性・健康づくり",
        "badge": "自己負担無料",
        "title": "新生児聴覚検査費助成",
        "amount": "初回検査費用を公費負担（受診票による全額助成）",
        "desc": "生まれつきの難聴を早期に発見し適切な療育につなげるため、出生後間もない入院中に産科医療機関で受ける「新生児聴覚検査（AABRまたはOAE）」の費用を助成します。",
        "extra": "母子健康手帳交付時に受診票が配付されます。県外出産時も償還払いに対応します。",
        "dept": "保健センター（健康増進課）",
        "phone": "0964-22-2300",
        "url": "https://www.city.uto.lg.jp/article/view/1017/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（保健指導係） ↗",
        "icon": "hearing",
        "life": ["child_infant"],
        "family": ["childcare"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#新生児", "#耳の検査無料", "#早期発見"]
    },
    {
        "cat": "health",
        "catName": "妊娠・出産・女性・健康づくり",
        "badge": "先進医療等へ独自助成",
        "title": "熊本県・宇土市特定不妊治療費助成金",
        "amount": "保険適用外の先進医療費用の一部助成（1回あたり上限5万円等）",
        "desc": "不妊治療を受ける夫婦の経済的負担を軽減するため、保険適用された体外受精・顕微授精と併用して実施された「先進医療」の技術料の一部を助成します。",
        "extra": "保険診療と併用可能な先進医療が対象です。申請期限は治療終了日の属する年度内です。",
        "dept": "保健センター（健康増進課）",
        "phone": "0964-22-2300",
        "url": "https://www.city.uto.lg.jp/article/view/1017/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（保健指導係） ↗",
        "icon": "fertility",
        "life": ["newlywed", "working"],
        "family": ["general"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#妊活・不妊治療", "#保険適用併用", "#県市独自助成"]
    },
    {
        "cat": "health",
        "catName": "妊娠・出産・女性・健康づくり",
        "badge": "ワンコイン〜無料",
        "title": "成人各種がん検診・節目検診",
        "amount": "胃・肺・大腸・乳・子宮頸がん検診：自己負担500円〜1,500円程度（無料クーポン対象あり）",
        "desc": "市民の健康寿命延伸のため、胃がん、肺がん（結核含む）、大腸がん、子宮頸がん、乳がん等の集団・個別検診を実施。節目年齢の方には無料受診券が届きます。",
        "extra": "70歳以上の方や非課税世帯の方は受診料免除申請により無料となります。",
        "dept": "保健センター（健康増進課）",
        "phone": "0964-22-2300",
        "url": "https://www.city.uto.lg.jp/article/view/1017/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（保健予防係） ↗",
        "icon": "checkup",
        "life": ["working", "senior"],
        "family": ["general"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#がん検診", "#格安・無料", "#早期発見"]
    },
    {
        "cat": "health",
        "catName": "妊娠・出産・女性・健康づくり",
        "badge": "人間ドック1.5万円助成",
        "title": "国民健康保険 人間ドック・脳ドック受診費用助成",
        "amount": "1日人間ドック：助成額15,000円 / 脳ドック：助成額15,000円",
        "desc": "宇土市国民健康保険の加入者（35歳以上等）を対象に、生活習慣病の早期発見や脳血管疾患予防のための人間ドック・脳ドック受診費用を助成します。",
        "extra": "国保税の滞納がないこと、年度内に特定健診を受診していないこと等の要件があります。",
        "dept": "市民保険課 医療保険係",
        "phone": "0964-27-3318",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（医療保険係） ↗",
        "icon": "checkup",
        "life": ["working", "senior"],
        "family": ["general"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["business", "all"],
        "tags": ["#国保加入者", "#人間ドック", "#費用助成"]
    },

    # 4. シニア・高齢者・障がい福祉
    {
        "cat": "senior",
        "catName": "シニア・高齢者・障がい福祉",
        "badge": "バリアフリー改修支援",
        "title": "高齢者等住宅改修費助成事業",
        "amount": "介護保険給付限度額（20万円）を超えた追加工事や、独自改修に上限額まで助成",
        "desc": "要介護・要支援認定を受けた高齢者や虚弱高齢者が、住み慣れた自宅で安全に自立した生活を送れるよう、手すり設置、段差解消、滑り防止床材変更等の費用を補助します。",
        "extra": "必ず着工前の事前申請が必要です。ケアマネジャー等を通じた相談がスムーズです。",
        "dept": "高齢福祉課 介護保険係",
        "phone": "0964-27-3324",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（介護保険係） ↗",
        "icon": "senior_house",
        "life": ["senior"],
        "family": ["senior_only", "disability"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit", "low_income"],
        "disaster": ["none", "damage_partial"],
        "work": ["all"],
        "tags": ["#65歳以上", "#手すり・段差解消", "#介護保険併用"]
    },
    {
        "cat": "senior",
        "catName": "シニア・高齢者・障がい福祉",
        "badge": "24時間駆けつけ・機器無償",
        "title": "緊急通報システム機器貸与事業",
        "amount": "専用通報機器・ペンダント型発信器の無償貸与（通話料実費負担）",
        "desc": "ひとり暮らしの高齢者や重度障がい者が急病や事故などの緊急時に、ボタン一つで受信センターに連絡でき、救急車の手配や安否確認を行えるシステムです。",
        "extra": "固定電話回線がない世帯にも対応したモバイル型機器の導入も進められています。",
        "dept": "高齢福祉課 高齢者支援係",
        "phone": "0964-27-3325",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（高齢者支援係） ↗",
        "icon": "emergency_bell",
        "life": ["senior"],
        "family": ["senior_only"],
        "housing": ["general"],
        "income": ["no_limit", "low_income"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#ひとり暮らし高齢者", "#24時間急病通報", "#安心ペンダント"]
    },
    {
        "cat": "senior",
        "catName": "シニア・高齢者・障がい福祉",
        "badge": "見守り付き栄養食",
        "title": "高齢者等配食サービス事業",
        "amount": "1食あたり約400円〜の自己負担で栄養バランスの取れたお弁当を手渡し配達",
        "desc": "食事の調理や買い物が困難な高齢者単身世帯等に対し、定期的に栄養バランスの取れたお弁当を届けるとともに、手渡し時の声かけによる安否確認を行います。",
        "extra": "配達時に異変があった場合は、市役所や緊急連絡先へ直ちに通報・連携されます。",
        "dept": "高齢福祉課 高齢者支援係",
        "phone": "0964-27-3325",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（高齢者支援係） ↗",
        "icon": "meal",
        "life": ["senior"],
        "family": ["senior_only"],
        "housing": ["general"],
        "income": ["low_income"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#見守り配達", "#栄養バランス食", "#調理困難"]
    },
    {
        "cat": "senior",
        "catName": "シニア・高齢者・障がい福祉",
        "badge": "最大2万円補助",
        "title": "高齢者補聴器購入費助成事業",
        "amount": "補聴器本体購入費用の1/2（上限20,000円）",
        "desc": "加齢による聴力低下がある高齢者の社会参加と認知症予防を支援するため、医師の診断に基づいて購入する管理医療機器補聴器の購入費を助成します。",
        "extra": "65歳以上で市民税非課税世帯等の要件があります。購入前の申請が必要です。",
        "dept": "高齢福祉課 高齢者支援係",
        "phone": "0964-27-3325",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（高齢者支援係） ↗",
        "icon": "aid_hearing",
        "life": ["senior"],
        "family": ["senior_only", "general"],
        "housing": ["general"],
        "income": ["low_income"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#65歳以上", "#補聴器購入助成", "#上限2万円"]
    },
    {
        "cat": "senior",
        "catName": "シニア・高齢者・障がい福祉",
        "badge": "年間最大24枚交付",
        "title": "宇土市福祉タクシー利用券交付事業",
        "amount": "1枚あたり初乗り運賃相当（年間最大24枚、人工透析等重度者は追加交付）",
        "desc": "重度の身体障がい者や知的障がい者、精神障がい者等の外出支援と社会参加促進のため、市内運行の提携タクシーで利用できる利用券を交付します。",
        "extra": "身体障害者手帳1・2級、療育手帳A判定、精神障害者保健福祉手帳1級等をお持ちの方が対象です。",
        "dept": "環境福祉課 障がい福祉係",
        "phone": "0964-27-3322",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（障がい福祉係） ↗",
        "icon": "taxi",
        "life": ["senior", "working"],
        "family": ["senior_only", "disability"],
        "housing": ["general"],
        "income": ["no_limit", "low_income"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#重度障がい", "#外出支援", "#タクシー助成"]
    },
    {
        "cat": "senior",
        "catName": "シニア・高齢者・障がい福祉",
        "badge": "自己負担1割（上限あり）",
        "title": "重度障がい者日常生活用具給付等事業",
        "amount": "特殊寝台、車いす、入浴補助用具、意思伝達装置等の基準価格の原則9割を公費給付",
        "desc": "重度の障がいのある方に対し、日常生活を円滑に過ごすための支援用具（特殊ベッド、便器、歩行支援用具、情報通信支援用具等）の購入費用を給付します。",
        "extra": "障がいの種別・等級や年齢に応じた給付品目一覧があります。購入前の申請が必要です。",
        "dept": "環境福祉課 障がい福祉係",
        "phone": "0964-27-3322",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（障がい福祉係） ↗",
        "icon": "wheelchair",
        "life": ["all"],
        "family": ["disability"],
        "housing": ["general"],
        "income": ["no_limit", "low_income"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#障がい手帳", "#用具給付", "#自己負担1割"]
    },
    {
        "cat": "senior",
        "catName": "シニア・高齢者・障がい福祉",
        "badge": "外出・レスパイト支援",
        "title": "障がい者（児）地域生活支援事業（移動支援・日中一時支援）",
        "amount": "ガイドヘルパー派遣費用や一時預かり費用の原則9割公費負担（所得に応じた月額上限あり）",
        "desc": "単独では外出が困難な障がいのある方への移動支援（余暇活動・通院等）や、保護者の休息・就労等のために日中の居場所を提供する日中一時支援を実施します。",
        "extra": "特別支援学校の放課後や休日の余暇支援としても活用されています。",
        "dept": "環境福祉課 障がい福祉係",
        "phone": "0964-27-3322",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（障がい福祉係） ↗",
        "icon": "assist_walk",
        "life": ["all"],
        "family": ["disability", "childcare"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#移動支援", "#日中一時支援", "#レスパイト"]
    },
    {
        "cat": "senior",
        "catName": "シニア・高齢者・障がい福祉",
        "badge": "毎月自宅へ無料配達",
        "title": "ねたきり高齢者等紙おむつ等支給事業",
        "amount": "紙おむつ・尿取りパッド等（月額上限相当分を現物支給）",
        "desc": "常時ねたきり状態にある65歳以上の高齢者や認知症高齢者を在宅で介護している世帯に対し、介護者の経済的負担軽減のため紙おむつ等の介護用品を自宅へ配送・支給します。",
        "extra": "要介護4または5の認定を受けた市民税非課税世帯等が対象となります。",
        "dept": "高齢福祉課 高齢者支援係",
        "phone": "0964-27-3325",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（高齢者支援係） ↗",
        "icon": "diaper",
        "life": ["senior"],
        "family": ["senior_only", "disability"],
        "housing": ["general"],
        "income": ["low_income"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#在宅介護", "#紙おむつ無料配達", "#要介護4・5"]
    },
    {
        "cat": "senior",
        "catName": "シニア・高齢者・障がい福祉",
        "badge": "最大3億円賠償保険・市負担",
        "title": "認知症高齢者等個人賠償責任保険加入支援事業",
        "amount": "自己負担無料（保険料は宇土市が全額負担、最大3億円まで賠償補償）",
        "desc": "認知症等により行方不明となる恐れのある高齢者が「宇土市SOSネットワーク」に事前登録することで、万一の線路立ち入りや他人の財物損壊等の事故に対する賠償保険に市負担で加入できます。",
        "extra": "ご家族が多額の損害賠償を請求されるリスクを回避し、地域で安心して暮らせるセーフティネットです。",
        "dept": "高齢福祉課 高齢者支援係",
        "phone": "0964-27-3325",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（高齢者支援係） ↗",
        "icon": "insurance_shield",
        "life": ["senior"],
        "family": ["senior_only", "general"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#認知症SOS", "#市全額負担", "#賠償保険最大3億"]
    },

    # 5. 移住・定住・新生活・地域コミュニティ
    {
        "cat": "community",
        "catName": "移住・定住・新生活・地域",
        "badge": "所得制限なし・最大60万円",
        "title": "宇土市結婚新生活支援事業",
        "amount": "夫婦とも29歳以下：最大60万円 / 夫婦とも39歳以下：最大30万円",
        "desc": "婚姻に伴う新生活をスタートする新婚世帯を対象に、住宅の購入費、リフォーム費用、家賃・敷金・礼金、引越し費用を幅広く補助します。",
        "extra": "【宇土市独自の特徴】一般的な自治体にある「夫婦合算所得500万円未満」の制限を宇土市独自で撤廃しており、所得制限なしで申請可能です。",
        "dept": "まちづくり推進課 政策推進係",
        "phone": "0964-27-3315",
        "url": "https://www.city.uto.lg.jp/article/view/1005/11993.html",
        "urlLabel": "宇土市公式：結婚新生活支援事業 ↗",
        "icon": "wedding",
        "life": ["newlywed"],
        "family": ["general"],
        "housing": ["rental", "owned_wood"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["employee", "business"],
        "tags": ["#新婚夫婦39歳以下", "#住宅費最大60万", "#所得制限なし"]
    },
    {
        "cat": "community",
        "catName": "移住・定住・新生活・地域",
        "badge": "最大100万円＋子育て加算",
        "title": "宇土市移住支援事業支援金（東京圏からの移住）",
        "amount": "2人以上世帯：100万円 / 単身世帯：60万円（18歳未満の帯同児童1人につき100万円加算）",
        "desc": "東京23区に在住または通勤していた方が宇土市へ移住し、県内企業等へ就業、テレワーク継続、または起業した場合に国・県・市が共同で支援金を支給します。",
        "extra": "子育て世帯にはお子さん1人あたり最大100万円が上乗せ加算される手厚い制度です。",
        "dept": "まちづくり推進課 政策推進係",
        "phone": "0964-27-3315",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（政策推進係） ↗",
        "icon": "moving",
        "life": ["working", "newlywed", "child_infant", "child_school"],
        "family": ["general", "childcare"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["employee", "startup"],
        "tags": ["#東京圏からの移住", "#世帯100万円", "#子ども加算100万"]
    },
    {
        "cat": "community",
        "catName": "移住・定住・新生活・地域",
        "badge": "地域活性化・最大30万円",
        "title": "まちづくり活動推進事業補助金",
        "amount": "事業費の2/3（初年度上限30万円、継続事業段階的補助）",
        "desc": "市民が主体的・自発的に取り組む地域の課題解決、環境保全、文化振興、世代間交流などのまちづくり活動・イベントの立ち上げ・実施費用を助成します。",
        "extra": "営利目的ではない市民グループやボランティア団体が対象となります。",
        "dept": "まちづくり推進課 政策推進係",
        "phone": "0964-27-3315",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（政策推進係） ↗",
        "icon": "community",
        "life": ["working", "senior"],
        "family": ["general"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#市民団体", "#地域づくり助成", "#上限30万円"]
    },
    {
        "cat": "community",
        "catName": "移住・定住・新生活・地域",
        "badge": "自治会館新築・改修補助",
        "title": "宇土市自治会集会施設整備事業補助金",
        "amount": "新築・増築：事業費の1/2（上限1,000万円） / 改修・耐震化：事業費の1/2（上限300万円）",
        "desc": "地域の絆づくりや防災避難の拠点となる自治会公民館・集会施設の新築、建替え、大規模改修、バリアフリー化工事などの費用を補助します。",
        "extra": "地域の合意形成と自治会組織による申請が必要です。計画段階からの相談を受け付けています。",
        "dept": "まちづくり推進課 政策推進係",
        "phone": "0964-27-3315",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（政策推進係） ↗",
        "icon": "hall",
        "life": ["all"],
        "family": ["general"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none", "damage_partial"],
        "work": ["all"],
        "tags": ["#自治会・公民館", "#新築・改修補助", "#コミュニティ拠点"]
    },
    {
        "cat": "community",
        "catName": "移住・定住・新生活・地域",
        "badge": "防災資機材の購入補助",
        "title": "自主防災組織育成事業補助金",
        "amount": "結成時資機材購入費：上限20万円 / 育成・維持資機材購入費：上限10万円",
        "desc": "地震や豪雨災害等の発生時に住民同士が助け合う「自主防災組織」の結成や、救助工具、発電機、投光器、メガホン等の防災資機材の整備費用を補助します。",
        "extra": "地域での防災訓練や避難訓練の実施と合わせて活用できます。",
        "dept": "総務課 防災交通係",
        "phone": "0964-27-3314",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（防災交通係） ↗",
        "icon": "fire_prep",
        "life": ["all"],
        "family": ["general"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#自主防災組織", "#資機材購入", "#防災力強化"]
    },
    {
        "cat": "community",
        "catName": "移住・定住・新生活・地域",
        "badge": "購入前無料診断",
        "title": "宇土市木造住宅耐震診断士派遣（空き家バンク連携）",
        "amount": "自己負担無料（市が空き家バンク物件へ耐震診断士を派遣）",
        "desc": "空き家バンクに登録された昭和56年以前建築の木造住宅について、購入や賃貸を検討する移住希望者や所有者の依頼に基づき、市が耐震診断士を無料で派遣します。",
        "extra": "安全性を確認した上で物件を取得・改修することができ、その後の耐震改修補助とも接続可能です。",
        "dept": "都市整備課 建築住宅係",
        "phone": "0964-27-3332",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（建築住宅係） ↗",
        "icon": "retrofit_check",
        "life": ["newlywed", "working"],
        "family": ["general"],
        "housing": ["vacant", "owned_wood"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["all"],
        "tags": ["#空き家バンク", "#購入前耐震診断", "#移住者向け"]
    },

    # 6. 産業・農業・創業・中小企業支援
    {
        "cat": "business",
        "catName": "産業・農業・創業・中小企業",
        "badge": "低利融資＋利子補給",
        "title": "宇土市商工振興資金融資制度（振興資金・小口資金）",
        "amount": "振興資金：最大1,500万円 / 小口資金：最大1,000万円（利子補給・保証料補助あり）",
        "desc": "市内で1年以上事業を営む中小企業者・個人事業主の運転資金・設備資金の調達を支援。熊本県信用保証協会の保証を付し、市が利子補給や信用保証料の補助を行います。",
        "extra": "市内金融機関と宇土市商工会が窓口となって手続きをサポートします。",
        "dept": "商工観光課 商工振興係",
        "phone": "0964-27-3329",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（商工振興係） ↗",
        "icon": "loan_biz",
        "life": ["working"],
        "family": ["general"],
        "housing": ["general"],
        "income": ["general"],
        "disaster": ["none"],
        "work": ["business"],
        "tags": ["#中小企業・自営業", "#低利融資", "#利子・保証料補助"]
    },
    {
        "cat": "business",
        "catName": "産業・農業・創業・中小企業",
        "badge": "家賃・改修最大50万円",
        "title": "宇土市新規創業者応援補助金",
        "amount": "店舗・事務所家賃補助（月額上限2万円×最長12か月）＋店舗改装費用の1/2（上限26万円）＝最大50万円",
        "desc": "市内で新たに起業・開業する個人や法人を応援するため、創業から1年以内の事業所・店舗賃借料や内外装工事・設備導入費用を助成します。",
        "extra": "宇土市商工会の「特定創業支援事業」による事業計画作成支援を受けた方が対象です。",
        "dept": "商工観光課 商工振興係",
        "phone": "0964-27-3329",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（商工振興係） ↗",
        "icon": "startup",
        "life": ["working", "newlywed"],
        "family": ["general"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["startup", "business"],
        "tags": ["#起業・新規開業", "#家賃・改装費補助", "#最大50万円"]
    },
    {
        "cat": "business",
        "catName": "産業・農業・創業・中小企業",
        "badge": "販路開拓・新商品開発",
        "title": "宇土市がんばる中小企業応援補助金",
        "amount": "対象経費の1/2（上限30万円）",
        "desc": "市内の中小企業者が行う新商品・新サービスの開発、展示会出展、ECサイト構築、ブランディング等の販路開拓事業経費の一部を補助します。",
        "extra": "地域資源を活かした特産品開発やDX推進・IT導入へのチャレンジも対象となります。",
        "dept": "商工観光課 商工振興係",
        "phone": "0964-27-3329",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（商工振興係） ↗",
        "icon": "sme",
        "life": ["working"],
        "family": ["general"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["none"],
        "work": ["business"],
        "tags": ["#販路開拓・新商品", "#設備投資", "#市内事業者限定"]
    },
    {
        "cat": "business",
        "catName": "産業・農業・創業・中小企業",
        "badge": "就農給付・最大年150万",
        "title": "新規就農者育成・定着総合支援（農業次世代人材投資事業等）",
        "amount": "経営開始資金：年額最大150万円（最長3年間）＋機械・施設導入補助等",
        "desc": "宇土市内で新たに自立就農を目指す新規就農者に対し、就農直後の経営確立に向けた資金給付や、農業用機械・ビニールハウス等の導入費用の助成を行います。",
        "extra": "就農時の年齢要件（原則50歳未満等）や青年等就農計画の認定が必要です。",
        "dept": "農林水産課 農業振興係",
        "phone": "0964-27-3327",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（農業振興係） ↗",
        "icon": "farmer",
        "life": ["working", "newlywed"],
        "family": ["general"],
        "housing": ["general"],
        "income": ["general"],
        "disaster": ["none"],
        "work": ["agri"],
        "tags": ["#就農希望者", "#青年等就農給付", "#機械・設備支援"]
    },
    {
        "cat": "business",
        "catName": "産業・農業・創業・中小企業",
        "badge": "専業農家の経営強化",
        "title": "宇土市認定農業者等経営改善支援事業",
        "amount": "高性能農業機械導入費・スマート農業機器導入費の補助（国・県事業上乗せ）",
        "desc": "農業経営改善計画の認定を受けた「認定農業者」や集落営農組織に対し、生産コスト削減や省力化を実現するスマート農業機器・大型機械の導入を支援します。",
        "extra": "レンコン、不知火（デコポン）、トマトなど宇土市の基幹農産物の産地強化を推進しています。",
        "dept": "農林水産課 農業振興係",
        "phone": "0964-27-3327",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（農業振興係） ↗",
        "icon": "farmer",
        "life": ["working"],
        "family": ["general"],
        "housing": ["general"],
        "income": ["general"],
        "disaster": ["none"],
        "work": ["agri"],
        "tags": ["#専業農家", "#認定農業者", "#経営所得安定"]
    },

    # 7. 令和8年熊本地震 特別災害支援
    {
        "cat": "disaster",
        "catName": "令和8年熊本地震 特別支援",
        "badge": "最大300万円・生活再建",
        "title": "被災者生活再建支援金",
        "amount": "基礎支援金（最大100万円）＋加算支援金（住宅再建方法に応じ最大200万円）＝合計最大300万円",
        "desc": "令和8年熊本地震により住家に著しい被害を受けた世帯に対し、被害程度に応じた「基礎支援金」と、その後の住宅再建方法（建設・購入・補修・賃借）に応じた「加算支援金」を支給します。",
        "extra": "全壊、大規模半壊、中規模半壊、または半壊解体世帯が対象。宇土市役所1階「すまい再建支援室」が申請窓口です。",
        "dept": "すまい再建支援室（都市整備課）",
        "phone": "0964-22-1111",
        "url": "uto-housing.html",
        "urlLabel": "解説：宇土市 住まいの再建支援ガイド ↗",
        "icon": "rebuild",
        "life": ["all"],
        "family": ["general", "childcare", "senior_only", "single_parent"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["damage_heavy", "damage_half"],
        "work": ["all"],
        "tags": ["#全壊・大規模半壊", "#中規模半壊・解体", "#最大300万円"]
    },
    {
        "cat": "disaster",
        "catName": "令和8年熊本地震 特別支援",
        "badge": "上限70万6千円・現物修理",
        "title": "住宅の応急修理制度（災害救助法）",
        "amount": "準半壊以上：1世帯あたり限度額706,000円（一部損壊準半壊基準あり）",
        "desc": "地震で被災した住宅の屋根、外壁、床、トイレ、給排水設備等の日常生活に不可欠な部分を、市が業者に委託して自己負担なく応急修理する制度です。",
        "extra": "【完了後のリフォーム併用】応急修理の完了後、追加で市内業者によるリフォームを行う場合、宇土市住宅リフォーム助成（最大25万商品券）を併用可能です。",
        "dept": "すまい再建支援室（都市整備課）",
        "phone": "0964-22-1111",
        "url": "uto-repair.html",
        "urlLabel": "解説：宇土市 住宅応急修理ガイド ↗",
        "icon": "emergency_repair",
        "life": ["all"],
        "family": ["general", "childcare", "senior_only"],
        "housing": ["owned_wood"],
        "income": ["no_limit"],
        "disaster": ["damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#準半壊以上", "#最大70.6万円", "#現物修理", "#リフォーム併用可"]
    },
    {
        "cat": "disaster",
        "catName": "令和8年熊本地震 特別支援",
        "badge": "直接被害200万/定額10割",
        "title": "小規模事業者持続化補助金＜一般型 災害支援枠＞",
        "amount": "直接被害：上限200万円（定額10/10・自社施工特例あり） / 間接被害：上限100万円（補助率2/3）",
        "desc": "令和8年熊本地震で被災した宇土市内の小規模事業者・個人事業主に対し、事業再開・販路開拓のための設備導入や店舗改装費用を補助します。",
        "extra": "宇土市商工会の発行する事業支援計画書（様式4）が必要。商工会確認締切は10月9日、申請締切は10月16日です。",
        "dept": "宇土市商工会 / 商工観光課",
        "phone": "0964-22-1044",
        "url": "uto-jizokuka.html",
        "urlLabel": "解説：宇土市 持続化補助金＜災害支援枠＞ガイド ↗",
        "icon": "jizokuka_disaster",
        "life": ["working"],
        "family": ["general"],
        "housing": ["general"],
        "income": ["no_limit"],
        "disaster": ["damage_heavy", "damage_half", "damage_partial"],
        "work": ["business"],
        "tags": ["#被災小規模事業者", "#直接被害最大200万", "#定額10/10あり", "#間接100万"]
    },
    {
        "cat": "disaster",
        "catName": "令和8年熊本地震 特別支援",
        "badge": "自己負担0円解体・自費償還",
        "title": "災害公費解体・自費解体費用償還事業",
        "amount": "市による直接解体撤去：自己負担無料 / 所有者が自費施工：適正算定額を市が償還",
        "desc": "り災証明書で全壊、大規模半壊、中規模半壊等の判定を受け、危険で倒壊のおそれがある被災家屋について、所有者の申請に基づき市が公費で解体撤去を行います。",
        "extra": "自費解体を行う場合も着工前の写真や契約書類の保全が必要です。すまい再建支援室へ解体前にご相談ください。",
        "dept": "すまい再建支援室（公費解体窓口）",
        "phone": "0964-22-1111",
        "url": "uto-housing.html",
        "urlLabel": "解説：宇土市 住まいの再建支援ガイド ↗",
        "icon": "public_demolish",
        "life": ["all"],
        "family": ["general", "senior_only"],
        "housing": ["owned_wood", "vacant"],
        "income": ["no_limit"],
        "disaster": ["damage_heavy", "damage_half"],
        "work": ["all"],
        "tags": ["#全壊・解体必須", "#市が無料解体", "#自費解体費用償還"]
    },
    {
        "cat": "disaster",
        "catName": "令和8年熊本地震 特別支援",
        "badge": "見舞金・義援金配分",
        "title": "令和8年熊本地震 災害義援金・宇土市災害見舞金",
        "amount": "住家被害程度（全壊・大規模半壊・中規模半壊・半壊・一部損壊等）に応じた現金支給",
        "desc": "全国から寄せられた災害義援金や宇土市の災害見舞金を、り災証明書の判定に基づき被災世帯へ配分・支給します（返済不要）。",
        "extra": "人的被害（死亡・重傷）や住家損壊の区分に応じて市配分委員会で決定された金額が指定口座へ順次振り込まれます。",
        "dept": "市民保険課（福祉担当）",
        "phone": "0964-27-3316",
        "url": "https://www.city.uto.lg.jp/article/view/1310/16725.html",
        "urlLabel": "宇土市公式：災害対策本部会議資料 ↗",
        "icon": "relief_money",
        "life": ["all"],
        "family": ["general", "single_parent", "senior_only", "childcare"],
        "housing": ["owned_wood", "rental"],
        "income": ["no_limit"],
        "disaster": ["damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#人的被害・住家被害", "#現金支給", "#返済不要"]
    },
    {
        "cat": "disaster",
        "catName": "令和8年熊本地震 特別支援",
        "badge": "公的貸付・条件付無利子",
        "title": "宇土市災害援護資金貸付制度",
        "amount": "住居・家財被害や世帯主負傷に応じ最大350万円貸付（年利1%・保証人ありで無利子、据置5年）",
        "desc": "地震で被害を受けた世帯主に対し、生活の立て直しに必要な当面の生活資金を長期・低利で貸し付けます。保証人を立てることで据置期間中も含め全期間無利子（0%）となります。",
        "extra": "前年総所得要件（世帯人数に応じた限度額あり）がありますが、住家が全壊した場合は所得限度額が大幅に引き上げられます。",
        "dept": "福祉課 福祉総務係",
        "phone": "0964-27-3321",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（福祉総務係） ↗",
        "icon": "disaster_loan",
        "life": ["all"],
        "family": ["general", "single_parent", "senior_only"],
        "housing": ["owned_wood", "rental"],
        "income": ["low_income", "general"],
        "disaster": ["damage_heavy", "damage_half", "damage_partial"],
        "work": ["all"],
        "tags": ["#公的貸付最大350万", "#保証人で無利子", "#据置5年"]
    },
    {
        "cat": "disaster",
        "catName": "令和8年熊本地震 特別支援",
        "badge": "税・保険料の減免・猶予",
        "title": "熊本地震に伴う市税・各種保険料の減免・徴収猶予",
        "amount": "固定資産税、市県民税、国民健康保険税、介護保険料、後期高齢者医療保険料の全額免除〜減額",
        "desc": "住家が損壊したり所得が激減した世帯を対象に、り災証明書の判定や収入減少割合に応じて、市税や各種社会保険料の減免措置や徴収猶予を実施します。",
        "extra": "申請により減免決定されます。納期限前の申請が必要な場合がありますので、お早めに税務窓口へご相談ください。",
        "dept": "税務課・市民保険課・高齢福祉課",
        "phone": "0964-27-3317",
        "url": "https://www.city.uto.lg.jp/article/view/1032/14818.html",
        "urlLabel": "宇土市公式：まちづくりハンドブック（税務課） ↗",
        "icon": "tax_relief",
        "life": ["all"],
        "family": ["general"],
        "housing": ["general"],
        "income": ["low_income", "general"],
        "disaster": ["damage_heavy", "damage_half", "damage_partial"],
        "work": ["all", "employee", "business"],
        "tags": ["#固定資産税・市県民税", "#国保税・介護保険料", "#減免・納期限延長"]
    }
]

# 公式資料との照合結果を反映する補正データ。
# 元データを残しつつ、制度改定時に差分を追いやすい形で上書きする。
HANDBOOK_URL = "https://www.city.uto.lg.jp/article/view/1032/14818.html"

VERIFIED_UPDATES = {
    "宇土市住宅リフォーム助成事業": {
        "phone": "0964-27-3328",
        "extra": "令和8年度は対象工事費（税抜）30万円以上、着工前申請が必要です。受付は令和8年6月19日から9月30日までですが、予定件数に達すると早期終了します。応急修理完了後の追加工事や、義援金・生活再建支援金の受給者も対象になり得ます。",
    },
    "戸建て木造住宅耐震診断事業補助金": {
        "badge": "診断費の9/10以内",
        "amount": "補助率9/10以内・上限13万5,000円等（住宅の区分により補助率・上限が異なります）",
        "desc": "平成12年5月31日以前に着工した戸建て木造住宅、または平成28年熊本地震でり災したことを証明できる住宅について、精密耐震診断費用の一部を補助します。",
        "extra": "現に所有者が居住する住宅などの要件があります。無料派遣制度ではないため、契約前に都市整備課へ補助対象と自己負担額を確認してください。",
        "tags": ["#木造住宅", "#平成12年5月以前", "#精密耐震診断"],
    },
    "戸建て木造住宅耐震改修等事業補助金（建替え・改修）": {
        "badge": "区分により最大157.5万円",
        "amount": "耐震改修・建替え：補助率4/5～9/10以内、上限115万円～157万5,000円 / 耐震シェルター：1/2以内・上限20万円",
        "desc": "耐震診断で倒壊の危険性があると判断された戸建て木造住宅等について、耐震改修設計・工事、建替え設計・工事、耐震シェルター設置費を補助します。",
        "extra": "着工時期、世帯区分、住宅の建築時期により補助率と上限が異なります。交付決定前の契約・着工は避け、事前に都市整備課へ確認してください。",
        "tags": ["#木造住宅", "#耐震改修・建替え", "#シェルター上限20万"],
    },
    "危険ブロック塀等安全確保支援事業補助金": {
        "badge": "撤去最大20万円",
        "amount": "補助率2/3以内。撤去は上限20万円、撤去後の安全な塀への改修は上限10万円（塀の長さによる限度額あり）",
        "extra": "避難路に面し、高さや安全点検等の要件を満たす塀が対象です。職員の現地確認と交付決定の前に工事契約をすると対象外になります。",
        "tags": ["#危険ブロック塀", "#撤去上限20万", "#事前現地確認"],
        "url": "https://www.city.uto.lg.jp/d?q=5c4c3e8df8a89af6c6cb1df83fee2565.pdf",
        "urlLabel": "宇土市公式：危険ブロック塀等補助案内 ↗",
    },
    "老朽危険空家等除去促進事業補助金": {
        "badge": "解体費2/3・最大90万円",
        "amount": "補助対象経費の2/3（上限90万円）",
        "desc": "市の事前調査で老朽化の不良度・危険度要件を満たした空家について、市内の許可事業者による敷地全体の除却費用を補助します。",
        "extra": "1年以上使用されていない住宅であることなど複数要件があります。申請前の事前調査が必要です。",
        "tags": ["#危険空家", "#解体費2/3", "#上限90万円"],
    },
    "雨水貯留施設設置補助金": {
        "title": "宇土市雨水タンク設置補助金",
        "badge": "容量別・最大3.5万円",
        "amount": "200L以上：上限3万5,000円 / 50L以上200L未満：設置費の1/2・上限2万4,000円",
        "desc": "自ら居住する市内住宅に、有効貯水量50リットル以上で雨どい等に接続する雨水タンクを設置する費用を補助します。",
        "extra": "同一住宅につき1基。交付決定を受けてから設置してください。",
        "dept": "環境交通課 環境交通係",
        "phone": "0964-27-3316",
        "url": "https://www.city.uto.lg.jp/article/view/1048/2199.html",
        "urlLabel": "宇土市公式：雨水タンク・雨水浸透ます補助 ↗",
        "tags": ["#雨水タンク", "#50L以上", "#設置前申請"],
    },
    "合併処理浄化槽設置整備事業補助金": {
        "dept": "環境交通課 環境交通係", "phone": "0964-27-3316",
        "url": "https://www.city.uto.lg.jp/article/view/1240/245.html", "urlLabel": "宇土市公式：浄化槽設置事業補助金 ↗",
    },
    "生ごみ処理機器等購入費補助金": {
        "title": "宇土市生ごみ処理機購入補助金", "dept": "環境交通課 環境交通係", "phone": "0964-27-3316",
        "url": "https://www.city.uto.lg.jp/article/view/1006/247.html", "urlLabel": "宇土市公式：生ごみ処理機購入補助金 ↗",
    },
    "宇土市空き家バンク活用促進補助金": {
        "title": "宇土市空き家バンク登録物件補助金",
        "badge": "取得・改修・家財撤去を支援",
        "amount": "空き家取得：上限50万円（指定区域100万円） / 賃貸物件改修：1/2・上限50万円（指定区域100万円） / 家財撤去：上限10万円（指定区域20万円）",
        "desc": "空き家バンク登録物件の取得、賃貸物件の改修、売買・賃貸に伴う家財撤去費用を補助します。指定区域は住吉中学校区・網田中学校区です。",
        "extra": "事業ごとに申請者、対象経費、申請期限が異なります。所有権移転登記または賃貸借契約後1年以内が基本です。",
        "dept": "まちづくり推進課 定住移住推進係", "phone": "0964-27-4106",
        "url": "https://www.city.uto.lg.jp/article/view/1207/8835.html", "urlLabel": "宇土市公式：空き家バンク登録物件補助金 ↗",
        "tags": ["#空き家取得", "#賃貸物件改修", "#家財撤去"],
    },
    "子ども医療費助成事業": {
        "title": "宇土市子ども医療費助成",
        "url": "https://www.city.uto.lg.jp/article/view/1056/9210.html", "urlLabel": "宇土市公式：子ども医療費助成 ↗",
    },
    "児童手当": {
        "url": "https://www.city.uto.lg.jp/article/view/1056/1078.html", "urlLabel": "宇土市公式：児童手当 ↗",
    },
    "児童扶養手当": {
        "amount": "全部支給月額46,690円（児童1人・令和7年4月時点）／一部支給・児童数加算あり",
        "extra": "手当額は物価変動等で改定されます。最新額と所得制限は申請前に公式ページで確認してください。",
        "url": "https://www.city.uto.lg.jp/article/view/1058/1042.html", "urlLabel": "宇土市公式：児童扶養手当 ↗",
    },
    "ひとり親家庭等医療費助成": {
        "amount": "保険診療による本人負担額の2/3を助成",
        "extra": "親は児童が20歳になる月末まで、児童は18歳到達後最初の3月31日までが基本です。所得等の要件と申請期限があります。",
        "url": "https://www.city.uto.lg.jp/article/view/1202/1032.html", "urlLabel": "宇土市公式：ひとり親家庭等医療費助成 ↗",
    },
    "ひとり親家庭児童入学祝金": {
        "amount": "翌年度に小学校へ入学する児童1人につき2万円",
        "desc": "3月1日現在、市内に住所を有するひとり親家庭で、翌年度4月に小学校へ入学する児童を養育する方へ祝金を支給します。",
        "extra": "申請時期は2月です。中学校入学分は公式資料で確認できないため掲載対象に含めていません。",
        "url": "https://www.city.uto.lg.jp/article/view/1202/1033.html", "urlLabel": "宇土市公式：ひとり親家庭児童入学祝金 ↗",
        "tags": ["#ひとり親", "#小学校入学", "#2万円"],
    },
    "宇土市就学援助制度": {
        "title": "宇土市就学援助", "dept": "学校教育課 学務係", "phone": "0964-22-6500",
        "url": "https://www.city.uto.lg.jp/article/view/1068/11514.html", "urlLabel": "宇土市公式：就学援助 ↗",
    },
    "妊婦健康診査受診票交付": {
        "title": "宇土市妊産婦健康診査助成", "dept": "健康づくり課 母子保健係", "phone": "0964-27-4428",
        "url": HANDBOOK_URL, "urlLabel": "宇土市公式：まちづくりハンドブック（母子保健係） ↗",
    },
    "産後ケア事業（ショートステイ・デイサービス・アウトリーチ）": {
        "title": "宇土市産後ケア事業", "dept": "健康づくり課 母子保健係", "phone": "0964-27-4428",
        "url": "https://www.city.uto.lg.jp/article/view/1072/3363.html", "urlLabel": "宇土市公式：産後ケア事業 ↗",
    },
    "新生児聴覚検査費助成": {
        "title": "宇土市新生児聴覚検査費用助成事業", "amount": "初回検査1回につき上限5,000円",
        "extra": "検査当日に宇土市に住民票がある新生児が対象です。受診票の契約額を超える費用等は自己負担になる場合があります。",
        "dept": "健康づくり課 母子保健係", "phone": "0964-27-4428",
        "url": "https://www.city.uto.lg.jp/article/view/1153/6286.html", "urlLabel": "宇土市公式：新生児聴覚検査費用助成 ↗",
    },
    "熊本県・宇土市特定不妊治療費助成金": {
        "title": "宇土市不妊治療費助成事業",
        "badge": "一般・生殖補助医療を助成",
        "amount": "一般不妊治療：年上限4万円（通算3年） / 生殖補助医療：1回上限8万円（年齢に応じ回数制限）",
        "desc": "一般不妊治療（人工授精）や、保険適用・所定の保険適用外の生殖補助医療について、治療費の一部を助成します。",
        "extra": "治療開始時の年齢、保険加入、市税滞納がないこと等の要件があります。原則、治療日から1年以内に申請してください。",
        "dept": "健康づくり課 母子保健係", "phone": "0964-27-4428",
        "url": "https://www.city.uto.lg.jp/article/view/1153/5248.html", "urlLabel": "宇土市公式：不妊治療費助成事業 ↗",
        "tags": ["#一般不妊治療", "#生殖補助医療", "#治療日から1年以内"],
    },
    "成人各種がん検診・節目検診": {"dept": "健康づくり課 健康推進係", "phone": "0964-27-3324", "url": HANDBOOK_URL, "urlLabel": "宇土市公式：まちづくりハンドブック（健康推進係） ↗"},
    "国民健康保険 人間ドック・脳ドック受診費用助成": {"dept": "市民保険課 国保年金係", "phone": "0964-27-3312", "url": HANDBOOK_URL, "urlLabel": "宇土市公式：まちづくりハンドブック（国保年金係） ↗"},
    "緊急通報システム機器貸与事業": {
        "title": "宇土市緊急通報装置貸与等事業", "amount": "緊急通報装置を貸与。世帯区分により月額0円・200円・500円・700円",
        "extra": "概ね65歳以上の独居またはこれに準ずる世帯で、急病・転倒等の危険が高い方が対象です。利用可否は審査で決定します。",
        "dept": "高齢者支援課 高齢者支援係", "phone": "0964-27-3320",
        "url": "https://www.city.uto.lg.jp/article/view/1081/958.html", "urlLabel": "宇土市公式：高齢者在宅福祉サービス ↗",
        "tags": ["#ひとり暮らし高齢者", "#緊急通報", "#月額負担あり"],
    },
    "高齢者等配食サービス事業": {
        "title": "宇土市食の自立支援事業", "amount": "1食300円",
        "dept": "高齢者支援課 高齢者支援係", "phone": "0964-27-3320",
        "url": "https://www.city.uto.lg.jp/article/view/1081/958.html", "urlLabel": "宇土市公式：高齢者在宅福祉サービス ↗",
        "tags": ["#配食", "#安否確認", "#1食300円"],
    },
    "宇土市福祉タクシー利用券交付事業": {
        "title": "宇土市福祉タクシー料金助成事業", "amount": "タクシー乗車1回につき、普通車の初乗運賃の上限額まで助成",
        "extra": "身体障害者手帳1級、療育手帳A1、精神障害者保健福祉手帳1級のいずれかに該当する市民が対象です。交付枚数等は窓口で確認してください。",
        "dept": "福祉課 障がい者支援係", "phone": "0964-27-3318",
        "url": "https://www.city.uto.lg.jp/article/view/1086/1898.html", "urlLabel": "宇土市公式：福祉タクシー料金助成 ↗",
        "tags": ["#重度障がい", "#初乗運賃助成", "#外出支援"],
    },
    "重度障がい者日常生活用具給付等事業": {"title": "宇土市障害者等日常生活用具給付等事業", "dept": "福祉課 障がい者支援係", "phone": "0964-27-3318", "url": "https://www.city.uto.lg.jp/article/view/1087/1929.html", "urlLabel": "宇土市公式：日常生活用具給付等事業 ↗"},
    "障がい者（児）地域生活支援事業（移動支援・日中一時支援）": {"dept": "福祉課 障がい者支援係", "phone": "0964-27-3318", "url": "https://www.city.uto.lg.jp/article/view/1088/1928.html", "urlLabel": "宇土市公式：地域生活支援事業 ↗"},
    "ねたきり高齢者等紙おむつ等支給事業": {
        "title": "宇土市家族介護用品給付事業", "amount": "紙おむつ・尿取りパッド等を1回2万円相当、年度2回まで給付",
        "extra": "要介護4・5相当、概ね65歳以上、6か月以上介護用品を使用、市町村民税非課税等の要件があります。",
        "dept": "高齢者支援課 高齢者支援係", "phone": "0964-27-3320", "url": HANDBOOK_URL, "urlLabel": "宇土市公式：まちづくりハンドブック（高齢者支援係） ↗",
        "tags": ["#在宅介護", "#年2回", "#1回2万円相当"],
    },
    "宇土市結婚新生活支援事業": {
        "dept": "まちづくり推進課 定住移住推進係", "phone": "0964-27-4106",
        "url": "https://www.city.uto.lg.jp/article/view/1609/8791.html", "urlLabel": "宇土市公式：令和8年度結婚新生活支援事業 ↗",
        "extra": "所得制限はありません。令和8年度から、夫婦双方が指定講座の受講または妊娠・出産に関する相談等を行うことが要件に追加されました。申請期限は令和9年2月26日です。",
    },
    "宇土市移住支援事業支援金（東京圏からの移住）": {"dept": "まちづくり推進課 定住移住推進係", "phone": "0964-27-4106", "url": "https://www.city.uto.lg.jp/article/view/1609/8235.html", "urlLabel": "宇土市公式：定住移住支援制度一覧 ↗"},
    "宇土市自治会集会施設整備事業補助金": {
        "title": "宇土市自治公民館等整備事業補助金", "badge": "整備費1/3・上限50万円", "amount": "補助率1/3以内（上限50万円）",
        "desc": "自治組織が行う自治公民館等の新築、改築、増築または改修について、本体工事や附帯設備工事費を補助します。",
        "extra": "対象年度内に事業を完了する必要があります。計画段階で生涯活動推進課へ相談してください。",
        "dept": "生涯活動推進課 生涯学習係", "phone": "0964-22-6510", "url": HANDBOOK_URL, "urlLabel": "宇土市公式：まちづくりハンドブック（生涯学習係） ↗",
        "tags": ["#自治公民館", "#補助率1/3", "#上限50万円"],
    },
    "宇土市新規創業者応援補助金": {
        "title": "宇土市創業支援事業補助金", "badge": "通常100万円・西部500万円", "amount": "対象経費の2/3以内。通常上限100万円、指定区域（住吉・網田中学校区）での創業は上限500万円",
        "desc": "市内で創業する方の賃借料、店舗等の建設・改修、設備購入、マーケティング費用等を補助します。",
        "extra": "特定創業支援等事業の支援を受け、創業後に宇土市商工会へ加入することなどの要件があります。交付決定前の経費は対象外になる場合があります。",
        "dept": "商工観光課 商工振興係", "phone": "0964-27-3328",
        "url": "https://www.city.uto.lg.jp/d?q=afc2d1cb68f581f6c2b203d3a53841d0.pdf", "urlLabel": "宇土市公式：創業支援事業補助金 ↗",
        "tags": ["#創業", "#補助率2/3", "#西部地区上限500万"],
    },
    "新規就農者育成・定着総合支援（農業次世代人材投資事業等）": {
        "title": "宇土市新規就農者支援事業給付金", "badge": "年120万円・最長2年", "amount": "年120万円を最長2年間（西部地区へ移住して新規就農する場合は年180万円）",
        "desc": "50歳以上65歳未満で独立・自営就農する方へ、就農直後の経営確立を支援する給付金を交付します。",
        "extra": "農業所得が250万円未満であること、認定新規就農者であることなどの要件があります。申請前に農林政策課へ相談してください。",
        "dept": "農林政策課 農林振興係", "phone": "0964-27-3325", "url": "https://www.city.uto.lg.jp/article/view/1609/8235.html", "urlLabel": "宇土市公式：定住移住支援制度一覧（就農支援） ↗",
        "tags": ["#50歳以上65歳未満", "#年120万円", "#西部地区年180万円"],
    },
    "住宅の応急修理制度（災害救助法）": {
        "badge": "半壊以上75.7万円・準半壊36.7万円", "amount": "半壊以上：1世帯75万7,000円以内 / 準半壊：1世帯36万7,000円以内（消費税込み）",
        "extra": "市が修理業者へ直接支払う制度で、被災者への現金給付ではありません。契約・着工前に宇土市へ申し込み、対象工事と必要書類を確認してください。",
        "tags": ["#半壊以上75.7万円", "#準半壊36.7万円", "#市が業者へ支払い"],
    },
    "小規模事業者持続化補助金＜一般型 災害支援枠＞": {
        "badge": "直接200万円・間接100万円", "amount": "直接被害：上限200万円、基本補助率2/3以内（一定要件をすべて満たす場合は定額10/10） / 間接被害：上限100万円・2/3以内",
        "extra": "宇土市商工会の事業支援計画書が必要です。定額10/10は直接被害を受けたすべての事業者に自動適用されるものではありません。締切と最新公募回を公式要領で確認してください。",
        "tags": ["#直接被害最大200万", "#基本補助率2/3", "#定額は要件あり"],
    },
}

UNVERIFIED_TITLES = {
    "宇土市放課後児童クラブ利用料減免制度",
    "宇土市勤労者教育ローン利子補給制度",
    "宇土市遺児手当",
    "高齢者補聴器購入費助成事業",
    "認知症高齢者等個人賠償責任保険加入支援事業",
    "宇土市木造住宅耐震診断士派遣（空き家バンク連携）",
    "宇土市がんばる中小企業応援補助金",
    "宇土市認定農業者等経営改善支援事業",
    "高齢者等住宅改修費助成事業",
    "自主防災組織育成事業補助金",
    "まちづくり活動推進事業補助金",
    "宇土市商工振興資金融資制度（振興資金・小口資金）",
}

def support_item(*, cat, cat_name, badge, title, amount, desc, extra, dept, phone, url, icon,
                 life=("all",), family=("general",), housing=("general",), income=("no_limit",),
                 disaster=("none",), work=("all",), tags=()):
    return {
        "cat": cat, "catName": cat_name, "badge": badge, "title": title, "amount": amount,
        "desc": desc, "extra": extra, "dept": dept, "phone": phone, "url": url,
        "urlLabel": f"宇土市公式：{title} ↗", "icon": icon, "life": list(life),
        "family": list(family), "housing": list(housing), "income": list(income),
        "disaster": list(disaster), "work": list(work), "tags": list(tags),
    }

ADDITIONAL_VERIFIED_SYSTEMS = [
    support_item(cat="housing", cat_name="住まい・耐震・環境", badge="住宅取得最大100万円", title="宇土市定住移住促進補助金",
        amount="指定区域の住宅取得：上限100万円。中学生以下の子どもの人数により20万円・50万円・100万円を加算",
        desc="住吉中学校区・網田中学校区で住宅を取得し、定住する方を支援します。子育て世帯には人数に応じた加算があります。",
        extra="所有権保存・移転登記後1年以内の申請が必要です。同趣旨の他補助金との重複不可などの要件があります。",
        dept="まちづくり推進課 定住移住推進係", phone="0964-27-4106", url="https://www.city.uto.lg.jp/article/view/1207/8769.html", icon="moving",
        life=("working","newlywed","child_school"), family=("general","childcare"), housing=("owned_wood",), tags=("#西部地区","#住宅取得100万円","#子育て加算")),
    support_item(cat="housing", cat_name="住まい・耐震・環境", badge="家賃助成最大48万円", title="特定公共賃貸住宅における子育て世帯移住促進助成金",
        amount="月2万円、最大24か月（上限48万円）", desc="宇土市外から入地団地14棟へ移住する子育て世帯に、家賃の一部を助成します。",
        extra="特定公共賃貸住宅の入居条件等を満たす必要があり、先着受付枠があります。",
        dept="都市整備課 建築住宅係", phone="0964-27-3332", url="https://www.city.uto.lg.jp/article/view/1290/12157.html", icon="moving",
        life=("child_infant","child_school","working"), family=("childcare",), housing=("rental",), tags=("#子育て移住","#入地団地","#最大48万円")),
    support_item(cat="childcare", cat_name="子育て・教育・就学支援", badge="妊婦5万円＋胎児数×5万円", title="妊婦のための支援給付制度",
        amount="1回目：妊婦1人につき5万円 / 2回目：胎児1人につき5万円", desc="妊娠期から子育て期までの相談支援とあわせ、妊婦の身体的・精神的・経済的負担を軽減する給付金です。",
        extra="流産・死産等の場合も対象となることがあります。転入前自治体との重複受給はできません。",
        dept="健康づくり課 母子保健係", phone="0964-27-4428", url="https://www.city.uto.lg.jp/article/view/1056/11861.html", icon="maternity",
        life=("child_infant",), family=("childcare","general"), tags=("#妊婦支援給付","#現金5万円","#胎児数加算")),
    support_item(cat="health", cat_name="健康・出産・女性", badge="妊娠中1回・全額助成", title="宇土市妊婦歯科健康診査助成",
        amount="市が定める妊婦歯科健診1回を10/10助成", desc="母子健康手帳の交付を受けた市内在住の妊婦へ、歯科健康診査受診票を交付します。",
        extra="治療・歯石除去等は保険診療となり自己負担が生じます。受診票は市内の契約歯科医療機関で使用します。",
        dept="健康づくり課 母子保健係", phone="0964-27-4428", url="https://www.city.uto.lg.jp/article/view/1072/911.html", icon="maternity",
        life=("child_infant",), family=("childcare","general"), tags=("#妊婦歯科健診","#1回助成","#母子手帳")),
    support_item(cat="health", cat_name="健康・出産・女性", badge="初回受診1万円まで", title="低所得妊婦初回産科受診費助成事業",
        amount="初回産科受診1回につき上限1万円（同一年度2回まで）", desc="住民税非課税世帯等の妊婦について、妊娠判定のための初回産科受診費を助成します。",
        extra="受診日から1年以内に申請し、所得確認と関係機関との情報共有への同意が必要です。",
        dept="こども家庭センター", phone="0964-27-3322", url="https://www.city.uto.lg.jp/article/view/1072/7328.html", icon="maternity",
        life=("child_infant",), family=("general","childcare"), income=("low_income",), tags=("#低所得妊婦","#初回産科受診","#上限1万円")),
    support_item(cat="health", cat_name="健康・出産・女性", badge="治療費1/2・上限15万円", title="宇土市不育症治療費助成",
        amount="1治療期間の本人負担額の1/2（上限15万円、通算5年）", desc="不育症と診断された方の保険適用外の治療・検査費用の一部を助成します。",
        extra="治療開始時に妻が43歳未満などの要件があり、治療終了月末から6か月以内の申請が必要です。",
        dept="健康づくり課 母子保健係", phone="0964-27-4428", url="https://www.city.uto.lg.jp/article/view/1153/2191.html", icon="fertility",
        life=("working","newlywed"), family=("general",), tags=("#不育症","#上限15万円","#治療終了後6か月以内")),
    support_item(cat="health", cat_name="健康・出産・女性", badge="1か月児健診を助成", title="1か月児健康診査費用助成事業",
        amount="市が定める1か月児健康診査費用を助成（契約額・上限額の範囲）", desc="出生後おおむね1か月の乳児の健康診査費用を助成し、疾病の早期発見と健やかな成長を支援します。",
        extra="対象時期、契約医療機関、県外受診時の償還払いは公式案内で確認してください。",
        dept="健康づくり課 母子保健係", phone="0964-27-4428", url="https://www.city.uto.lg.jp/article/view/1153/11859.html", icon="child_med",
        life=("child_infant",), family=("childcare",), tags=("#1か月児健診","#乳児","#費用助成")),
    support_item(cat="senior", cat_name="シニア・高齢者・障がい福祉", badge="年6万円・12万円", title="宇土市在宅高齢者介護手当",
        amount="要介護3：年6万円 / 要介護4・5：年12万円", desc="要介護3～5の方を、基準日前1年間にわたり在宅で介護した方へ介護手当を支給します。",
        extra="入院・短期入所等の期間が通算120日以内であることなどの要件があります。申請は原則10月中です。",
        dept="高齢者支援課 高齢者支援係", phone="0964-27-3320", url="https://www.city.uto.lg.jp/article/view/1213/10297.html", icon="heart",
        life=("senior",), family=("senior_only","disability"), tags=("#在宅介護","#要介護3から5","#年6万・12万円")),
    support_item(cat="senior", cat_name="シニア・高齢者・障がい福祉", badge="重度障がいの医療費助成", title="宇土市重度心身障害者医療費助成",
        amount="保険診療の自己負担額について、制度所定の自己負担額を除き助成", desc="重度の身体・知的・精神障がいがある市民の医療費負担を軽減します。",
        extra="障害等級、所得、他制度との優先関係等の要件があります。受給資格認定後に申請してください。",
        dept="福祉課 障がい者支援係", phone="0964-27-3318", url="https://www.city.uto.lg.jp/article/view/1086/4133.html", icon="child_med",
        family=("disability",), tags=("#重度障がい","#医療費助成","#所得要件")),
    support_item(cat="senior", cat_name="シニア・高齢者・障がい福祉", badge="購入・修理費を支給", title="宇土市補装具費の支給",
        amount="補装具の購入・修理費について原則1割を自己負担", desc="身体障がい者・障がい児・所定の難病患者に、車いす、補聴器、義肢等の補装具費を支給します。",
        extra="品目や障がいの状況により判定・意見書等が必要です。購入・修理前に申請してください。",
        dept="福祉課 障がい者支援係", phone="0964-27-3318", url="https://www.city.uto.lg.jp/article/view/1087/1923.html", icon="wheelchair",
        family=("disability",), tags=("#補装具","#原則1割負担","#事前申請")),
    support_item(cat="senior", cat_name="シニア・高齢者・障がい福祉", badge="基準価格の2/3", title="宇土市難聴児補聴器購入費助成事業",
        amount="補聴器の基準価格の2/3を助成", desc="身体障害者手帳の対象とならない軽度・中等度の難聴がある18歳未満の児童へ補聴器購入費を助成します。",
        extra="聴力30dB以上などの要件があります。修理・部品交換は対象外で、購入前の申請が必要です。",
        dept="福祉課 障がい者支援係", phone="0964-27-3318", url="https://www.city.uto.lg.jp/article/view/1084/1925.html", icon="hearing",
        life=("child_infant","child_school"), family=("childcare","disability"), tags=("#難聴児","#補聴器","#基準価格2/3")),
    support_item(cat="senior", cat_name="シニア・高齢者・障がい福祉", badge="年12万円", title="宇土市在宅心身障がい者介護手当",
        amount="要介護者1人につき年12万円", desc="重度の心身障がいがあり常時介護を必要とする方を、基準日前1年間にわたり在宅介護した方へ手当を支給します。",
        extra="身体障害者手帳・医師判定または療育手帳A1等の要件があります。申請は原則10月中です。",
        dept="福祉課 障がい者支援係", phone="0964-27-3318", url="https://www.city.uto.lg.jp/article/view/1085/1895.html", icon="heart",
        family=("disability",), tags=("#在宅介護","#重度障がい","#年12万円")),
    support_item(cat="childcare", cat_name="子育て・教育・就学支援", badge="月7.05万～14万円", title="宇土市母子家庭等高等職業訓練促進費",
        amount="訓練促進費：月7万500円～14万円（課税区分・修業時期による）／修了支援給付金あり", desc="ひとり親が看護師、介護福祉士、保育士等の資格取得のため6か月以上修業する場合、生活費を支援します。",
        extra="児童扶養手当受給相当の所得水準等の要件があります。受講前に必ず相談してください。",
        dept="子育て支援課 子育て給付係", phone="0964-27-3337", url="https://www.city.uto.lg.jp/article/view/1202/1035.html", icon="school_aid",
        life=("working",), family=("single_parent",), income=("low_income",), tags=("#ひとり親","#資格取得","#月額給付")),
    support_item(cat="childcare", cat_name="子育て・教育・就学支援", badge="受講料60%・最大160万円", title="宇土市母子家庭等自立支援教育訓練給付金",
        amount="対象講座の受講料60%（1.2万円～最大160万円、所定の場合は上乗せあり）", desc="ひとり親の就職に必要な指定教育訓練講座の受講費用を助成します。",
        extra="受講開始前の講座指定と事前相談が必要です。雇用保険の教育訓練給付との調整があります。",
        dept="子育て支援課 子育て給付係", phone="0964-27-3337", url="https://www.city.uto.lg.jp/article/view/1202/1034.html", icon="school_aid",
        life=("working",), family=("single_parent",), income=("low_income",), tags=("#ひとり親","#教育訓練","#受講料60%")),
    support_item(cat="childcare", cat_name="子育て・教育・就学支援", badge="生活・子育て支援員を派遣", title="宇土市ひとり親家庭等日常生活支援事業",
        amount="生活援助・子育て支援を所得区分により無料または低額で利用", desc="修学、就職活動、疾病、出産、災害等で一時的に生活援助・保育が必要なひとり親家庭へ支援員を派遣します。",
        extra="利用には事前登録が必要です。離婚調停中など離婚前に困難を抱える方も対象になり得ます。",
        dept="子育て支援課 子育て給付係", phone="0964-27-3337", url="https://www.city.uto.lg.jp/article/view/1058/2121.html", icon="single_parent",
        family=("single_parent",), income=("low_income","general"), tags=("#ひとり親","#家事・保育支援","#事前登録")),
    support_item(cat="childcare", cat_name="子育て・教育・就学支援", badge="病児・病後児を一時保育", title="宇土市病児・病後児保育事業",
        amount="1日2,000円（5時間未満は1,000円）", desc="病気または回復期で集団保育が難しく、保護者が家庭で保育できない生後6か月～小学6年生を一時的に預かります。",
        extra="原則1日3人。利用前の登録と医療機関の確認等が必要です。",
        dept="子育て支援課 保育支援係", phone="0964-27-3323", url="https://www.city.uto.lg.jp/article/view/1191/14796.html", icon="child_med",
        life=("child_infant","child_school"), family=("childcare","single_parent"), tags=("#病児保育","#小学6年生まで","#事前登録")),
    support_item(cat="childcare", cat_name="子育て・教育・就学支援", badge="高校5万円・大学等10万円", title="宇土市入学準備祝金",
        amount="高校・高専・高等課程：5万円 / 大学・短大・専門課程：10万円", desc="生活保護世帯または市町村民税非課税世帯で、高校以上へ進学する方の入学時負担を支援します。",
        extra="居住年数、滞納なし、人数枠、成績等の要件があります。申請期間は例年2月1日～3月31日です。",
        dept="学校教育課 総務係", phone="0964-22-6502", url="https://www.city.uto.lg.jp/article/view/1290/13842.html", icon="school_aid",
        life=("child_school",), family=("childcare","single_parent"), income=("low_income",), tags=("#進学","#非課税世帯","#返済不要")),
]

def apply_verified_updates():
    global SYSTEMS
    kept = []
    for item in SYSTEMS:
        original_title = item["title"]
        if original_title in UNVERIFIED_TITLES:
            continue
        item.update(VERIFIED_UPDATES.get(original_title, {}))
        kept.append(item)
    existing_titles = {item["title"] for item in kept}
    kept.extend(item for item in ADDITIONAL_VERIFIED_SYSTEMS if item["title"] not in existing_titles)
    SYSTEMS = kept

apply_verified_updates()

def generate_html():
    categories = [
        {"key": "all", "name": "すべて表示"},
        {"key": "housing", "name": "住まい・耐震・環境"},
        {"key": "childcare", "name": "子育て・教育・就学"},
        {"key": "health", "name": "健康・出産・女性"},
        {"key": "senior", "name": "シニア・障がい福祉"},
        {"key": "community", "name": "移住・新婚・地域"},
        {"key": "business", "name": "産業・農業・創業"},
        {"key": "disaster", "name": "熊本地震特別支援"}
    ]

    cards_by_cat = {}
    for item in SYSTEMS:
        cards_by_cat.setdefault(item["cat"], []).append(item)

    html_parts = []
    html_parts.append('''<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>宇土市：暮らしの支援・補助金 総合ガイド（住まい・子育て・健康・福祉・産業）｜よか隊ネット熊本</title>
  <meta name="description" content="宇土市のまちづくりハンドブックと公式制度ページを基に、暮らしに関わる主要な支援制度と令和8年熊本地震特別支援を整理したガイド。住まい、子育て、健康、福祉、移住、創業などを条件から検索でき、掲載制度ごとに公式情報と担当窓口を確認できます。">
  <link rel="stylesheet" href="styles.css?v=20260907-2">
  <link rel="stylesheet" href="design-system.css?v=20260907-2">
  <link rel="stylesheet" href="org-site.css?v=20260918-1">
  <link rel="stylesheet" href="uto-support.css?v=20260921-4">
</head>
<body class="organization-site uto-support-page">
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
          <a href="hq-uto.html">宇土市</a>
          <span>&gt;</span>
          <span aria-current="page">暮らしの支援・補助金 総合ガイド</span>
        </nav>

        <div class="uto-sup-hero-badge">宇土市公式情報を確認 · 主要''' + str(len(SYSTEMS)) + '''制度</div>
        <h1>宇土市 暮らしの支援・補助金 総合ガイド</h1>
        <p class="uto-sup-hero-lead">
          宇土市が市民の生活安定、住環境向上、子育て、健康、福祉、産業振興のために平時から整備している公的支援・補助金制度と、令和8年熊本地震に伴う特別支援制度を体系的に整理しました。<br>
          「あなたの現在の状況」を選択して、活用できる制度をお探しいただけます。掲載制度には宇土市公式情報へのリンクと担当窓口を記載しています。掲載内容は令和7年度版まちづくりハンドブックと令和8年度の個別案内を2026年9月21日に確認したものです。
        </p>
      </div>
    </header>

    <!-- メインコンテンツシェル（幅1040px制限で中央揃え） -->
    <div class="uto-sup-shell">

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
              <span class="preset-icon">👨‍👩‍👧</span>
              <span class="preset-title">子育て・教育世帯</span>
              <span class="preset-desc">医療費・児童手当・保育料</span>
            </button>
            <button type="button" class="uto-sim-preset-btn" data-preset="senior">
              <span class="preset-icon">👴</span>
              <span class="preset-title">シニア・在宅介護</span>
              <span class="preset-desc">介護手当・緊急通報・配食</span>
            </button>
            <button type="button" class="uto-sim-preset-btn" data-preset="housing">
              <span class="preset-icon">🏠</span>
              <span class="preset-title">住まい改修・耐震</span>
              <span class="preset-desc">リフォーム25万・耐震最大157.5万</span>
            </button>
            <button type="button" class="uto-sim-preset-btn" data-preset="newlywed">
              <span class="preset-icon">💍</span>
              <span class="preset-title">新婚・若年夫婦</span>
              <span class="preset-desc">結婚新生活最大60万・制限なし</span>
            </button>
            <button type="button" class="uto-sim-preset-btn" data-preset="disaster">
              <span class="preset-icon">🚨</span>
              <span class="preset-title">熊本地震の被災世帯</span>
              <span class="preset-desc">再建金・応急修理・解体・減免</span>
            </button>
            <button type="button" class="uto-sim-preset-btn" data-preset="business">
              <span class="preset-icon">💼</span>
              <span class="preset-title">自営業・中小企業・農業</span>
              <span class="preset-desc">創業最大500万・就農・持続化</span>
            </button>
          </div>
        </div>

        <!-- ② 詳細条件折りたたみパネル（目立つデザインへ刷新） -->
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

        <!-- ③ 選択中条件・絞り込み結果サマリーバー（リアルタイムフィードバック） -->
        <div class="uto-sim-active-bar" id="utoSimActiveBar" style="display: none;">
          <div class="uto-sim-active-top">
            <div class="uto-sim-result-badge">
              <span>🎯 絞り込み結果：</span>
              <strong class="uto-sim-result-count" id="utoSimResultCount">0件</strong>
              <span style="font-size: 0.85rem; color: #475569; font-weight: normal;">（主要58制度中）</span>
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

      <!-- 宇土市の3大特徴ハイライト -->
      <section class="uto-sup-highlights" aria-labelledby="uto-hl-title">
        <h2 id="uto-hl-title">知っておきたい！宇土市の制度連携・独自メリット</h2>
        <div class="uto-sup-hl-grid">
          <div class="uto-sup-hl-item">
            <span class="hl-badge">震災併用OK</span>
            <h3>住宅リフォーム助成（最大25万円商品券）</h3>
            <p>応急修理制度を終えた世帯や、被災者生活再建支援金・義援金を受給した世帯も対象。市内施工業者による修繕・追加工事で最大25万円分の商品券が交付されます。</p>
          </div>
          <div class="uto-sup-hl-item">
            <span class="hl-badge">宇土市独自</span>
            <h3>結婚新生活支援事業（所得制限なし）</h3>
            <p>一般的な自治体にある「夫婦合算所得500万円未満」の制限を宇土市独自で撤廃。新婚夫婦（39歳以下）の住居費・引越費用等を最大30万〜60万円補助します。</p>
          </div>
          <div class="uto-sup-hl-item">
            <span class="hl-badge">耐震＋建替え</span>
            <h3>木造住宅耐震診断・改修・シェルター</h3>
            <p>精密耐震診断は費用の9/10以内（上限13万5,000円等）、耐震改修・建替えは住宅区分により最大157万5,000円、耐震シェルターは最大20万円が補助されます。</p>
          </div>
        </div>
      </section>

      <!-- 検索・絞り込みツールバー -->
      <section class="uto-sup-toolbar" aria-labelledby="uto-tool-title">
        <div class="uto-sup-search-row">
          <label for="utoSupSearch" id="uto-tool-title" class="uto-sup-search-label">キーワード検索：</label>
          <input type="text" id="utoSupSearch" class="uto-sup-search-input" placeholder="例：リフォーム、耐震、子育て、所得制限なし、商品券、解体、創業..." autocomplete="off">
        </div>
        <div class="uto-sup-cat-row" role="group" aria-label="分野別カテゴリフィルター">
''')

    for cat in categories:
        active_cls = ' active' if cat["key"] == "all" else ''
        html_parts.append(f'          <button type="button" class="uto-sup-cat-btn{active_cls}" data-target-cat="{cat["key"]}">{cat["name"]}</button>\n')

    html_parts.append('''        </div>
      </section>

      <!-- 検索結果件数表示 -->
      <div class="uto-sup-status">
        <span id="utoSupCount">表示中：''' + str(len(SYSTEMS)) + '''件 / 主要''' + str(len(SYSTEMS)) + '''制度</span>
        <span class="uto-sup-status-source">確認日：2026年9月21日／情報源：宇土市公式HP・令和7年度版まちづくりハンドブック</span>
      </div>

      <aside class="uto-sup-caution" role="note">
        <strong>申請前に必ず最新情報をご確認ください。</strong>
        制度は年度、予算、世帯状況などにより受付終了・金額変更・対象外となる場合があります。このページは宇土市の全制度を網羅するものではありません。公式ページと担当窓口で、現在の受付状況・対象要件・必要書類を確認してください。
      </aside>

      <!-- 一致なし表示 -->
      <div id="utoSupEmpty" class="uto-sup-empty" style="display: none;">
        <p>該当する制度が見つかりませんでした。条件シミュレーターの「条件をクリア」ボタンを押すか、別のキーワードで検索してください。</p>
      </div>
''')

    # 各カテゴリのセクション
    for cat in categories[1:]:
        c_key = cat["key"]
        c_name = cat["name"]
        items = cards_by_cat.get(c_key, [])
        if not items:
            continue

        html_parts.append(f'''
      <!-- セクション: {c_name} -->
      <section class="uto-sup-section" id="sec-{c_key}" data-cat="{c_key}">
        <header class="uto-sup-sec-header">
          <h2>{c_name}</h2>
          <span class="sec-count">（{len(items)}件）</span>
        </header>
        <div class="uto-sup-grid">
''')

        for item in items:
            extra_html = f'<div class="uto-card-extra">{item["extra"]}</div>' if item.get("extra") else ''
            phone_link = f'<a class="uto-card-phone" href="tel:{item["phone"].replace("-", "")}">{item["phone"]}</a>'
            url_target = ' target="_blank" rel="noopener"' if item["url"].startswith("http") else ''

            life_attr = ",".join(item.get("life", ["all"]))
            family_attr = ",".join(item.get("family", ["general"]))
            housing_attr = ",".join(item.get("housing", ["general"]))
            income_attr = ",".join(item.get("income", ["no_limit"]))
            disaster_attr = ",".join(item.get("disaster", ["none"]))
            work_attr = ",".join(item.get("work", ["all"]))

            icon_svg = ICONS.get(item.get("icon", "reform"), ICONS["reform"])
            tag_spans = "".join([f'<span class="card-hash-tag">{t}</span>' for t in item.get("tags", [])])

            html_parts.append(f'''          <article class="uto-card"
                   data-life="{life_attr}"
                   data-family="{family_attr}"
                   data-housing="{housing_attr}"
                   data-income="{income_attr}"
                   data-disaster="{disaster_attr}"
                   data-work="{work_attr}">
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
      <section class="uto-sup-contact-box" aria-labelledby="uto-contact-title">
        <h3 id="uto-contact-title">宇土市役所 お問い合わせ・窓口案内</h3>
        <p style="font-size:0.95rem; line-height:1.6; color:#475569; margin-bottom:18px;">
          各制度の申請要件、今年度の受付期限、必要書類などは制度ごとに異なります。詳しくは各カードに記載の担当課直通電話、または市役所代表窓口へお問い合わせください。
        </p>
        <div class="uto-sup-contact-grid">
          <div class="uto-sup-contact-item">
            <b>宇土市役所（代表庁舎）</b>
            <p>〒869-0492 熊本県宇土市浦田町51<br>開庁時間：平日 8:30〜17:15</p>
            <a href="tel:0964221111">0964-22-1111（代表）</a>
          </div>
          <div class="uto-sup-contact-item">
            <b>すまい再建支援室（熊本地震総合窓口）</b>
            <p>市役所1階 市民交流スペース<br>応急修理・仮設住宅・公費解体・生活再建支援金</p>
            <a href="tel:0964221111">0964-22-1111（内線）</a>
          </div>
          <div class="uto-sup-contact-item">
            <b>宇土市商工会</b>
            <p>〒869-0433 宇土市新小路町30<br>持続化補助金・創業支援・事業者相談</p>
            <a href="tel:0964221044">0964-22-1044</a>
          </div>
          <div class="uto-sup-contact-item">
            <b>宇土市社会福祉協議会</b>
            <p>〒869-0414 宇土市栄町40-1<br>ボランティアセンター・緊急小口資金等の貸付</p>
            <a href="tel:0964233355">0964-23-3355</a>
          </div>
        </div>
        <p style="margin-top:20px; font-size:0.875rem; color:#64748b;">
          関連リンク：<a href="uto-public-services.html">宇土市 公的施設・市民サービス マップ</a> · <a href="https://www.city.uto.lg.jp/" target="_blank" rel="noopener">宇土市公式ホームページ ↗</a> · <a href="hq-uto.html">宇土市 災害対策本部会議記録</a> · <a href="uto-housing.html">宇土市 住まいの相談・再建支援ガイド</a> · <a href="uto-jizokuka.html">宇土市 小規模事業者持続化補助金ガイド</a> · <a href="municipalities.html">自治体別支援情報へ戻る</a>
        </p>
      </section>

    </div>
  </main>
  <footer class="site-footer"></footer>
  <script src="org-site.js?v=20260907-2"></script>
  <script src="uto-support.js?v=20260921-4"></script>
</body>
</html>
''')

    content = "".join(html_parts)
    Path("uto-support.html").write_text(content, encoding="utf-8")
    print(f"Generated uto-support.html with {len(SYSTEMS)} systems and SVG illustrations.")

if __name__ == "__main__":
    generate_html()
