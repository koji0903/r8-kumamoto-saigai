#!/usr/bin/env python3
"""PDFの全ページから全制度の構造化データを厳密に抽出する"""
import fitz
import json
import re

doc = fitz.open("tools/yatsushiro_v8.pdf")

# 目次（PDF 3〜6）から正式な制度リストを作成
toc_raw = []
for p in range(2, 6):
    text = doc[p].get_text()
    for line in text.split("\n"):
        line = line.strip()
        if "...." in line:
            parts = line.split("....")
            title = parts[0].strip()
            page_str = parts[-1].replace(".", "").strip()
            if page_str.isdigit() and title:
                toc_raw.append({"title": title, "nonbre": int(page_str)})

print(f"目次から抽出された制度数: {len(toc_raw)}")

# 各PDFページ（7〜71）を解析
# ノンブルとPDF実ページの対応
# PDF実ページ = ノンブル + 6
# ただし複数ページにわたる制度がある

# PDF各ページのテキストを抽出
pages_dict = {}
for i in range(6, len(doc)):
    pdf_p = i + 1
    text = doc[i].get_text()
    pages_dict[pdf_p] = text

# 全58制度のリストを定義し、PDFから正確に対象・内容・窓口・電話・期限を抽出
# 各制度の開始PDFページ
programs_meta = [
    # 被災者対応 (10件)
    {"id": "counseling", "name": "災害相談窓口", "cat": "生活・相談", "nonbre": 1, "pdf_page": 7, "badge": "更新"},
    {"id": "waste", "name": "災害ごみの受入れ", "cat": "生活・相談", "nonbre": 2, "pdf_page": 8, "badge": "更新"},
    {"id": "hotel", "name": "ホテル等への避難", "cat": "生活・相談", "nonbre": 3, "pdf_page": 9, "badge": ""},
    {"id": "bath", "name": "公衆浴場の無料入浴支援", "cat": "生活・相談", "nonbre": 4, "pdf_page": 10, "badge": "更新"},
    {"id": "volunteer", "name": "災害ボランティアの派遣依頼", "cat": "生活・相談", "nonbre": 5, "pdf_page": 11, "badge": "更新"},
    {"id": "rental-car", "name": "災害サポート・レンタカーの貸出", "cat": "生活・相談", "nonbre": 6, "pdf_page": 12, "badge": ""},
    {"id": "water-delivery", "name": "八代青年会議所による水の配達サービス", "cat": "生活・相談", "nonbre": 7, "pdf_page": 13, "badge": "更新"},
    {"id": "lawyer-consult", "name": "弁護士による無料法律相談", "cat": "生活・相談", "nonbre": 8, "pdf_page": 14, "badge": ""},
    {"id": "nichibenren-tel", "name": "日弁連による無料電話相談", "cat": "生活・相談", "nonbre": 8, "pdf_page": 14, "badge": ""},
    {"id": "scrivener-consult", "name": "司法書士による無料法律相談", "cat": "生活・相談", "nonbre": 9, "pdf_page": 15, "badge": ""},

    # 税金・保険料等の減免措置等 (4件)
    {"id": "health-insurance", "name": "国保税・後期高齢者・介護保険料の減免", "cat": "税・保険", "nonbre": 10, "pdf_page": 16, "badge": ""},
    {"id": "resident-tax", "name": "市県民税の減免", "cat": "税・保険", "nonbre": 11, "pdf_page": 17, "badge": "受付開始"},
    {"id": "property-tax", "name": "固定資産税の減免", "cat": "税・保険", "nonbre": 13, "pdf_page": 19, "badge": "受付開始"},
    {"id": "pension-exemption", "name": "国民年金保険料の免除", "cat": "税・保険", "nonbre": 14, "pdf_page": 20, "badge": ""},

    # 公的書類の発行等 (5件)
    {"id": "risai-cert", "name": "り災証明書・被災証明書の発行", "cat": "証明", "nonbre": 15, "pdf_page": 21, "badge": ""},
    {"id": "risai-support", "name": "熊本県行政書士会による「り災証明書」無料申請支援", "cat": "証明", "nonbre": 16, "pdf_page": 22, "badge": ""},
    {"id": "juminhyo-fee", "name": "住民票等の交付手数料の免除", "cat": "証明", "nonbre": 17, "pdf_page": 23, "badge": ""},
    {"id": "mynumber-fee", "name": "マイナンバーカードの再交付手数料の免除", "cat": "証明", "nonbre": 18, "pdf_page": 24, "badge": ""},
    {"id": "tax-cert-fee", "name": "災害に関連する税証明書の手数料の免除", "cat": "証明", "nonbre": 19, "pdf_page": 25, "badge": "新規"},

    # 経済・生活面の支援 (8件)
    {"id": "no-insurance-card", "name": "保険証なしでの医療・介護受診", "cat": "生活・お金", "nonbre": 20, "pdf_page": 26, "badge": ""},
    {"id": "medical-fee-exemption", "name": "医療保険・介護保険・障害福祉利用料の免除", "cat": "生活・お金", "nonbre": 21, "pdf_page": 27, "badge": ""},
    {"id": "school-supplies", "name": "被災学用品の配付", "cat": "生活・お金", "nonbre": 22, "pdf_page": 28, "badge": ""},
    {"id": "rebuild-grant", "name": "被災者生活再建支援制度", "cat": "生活・お金", "nonbre": 23, "pdf_page": 29, "badge": ""},
    {"id": "disaster-loan", "name": "災害援護資金の貸付", "cat": "生活・お金", "nonbre": 25, "pdf_page": 31, "badge": ""},
    {"id": "emergency-small-loan", "name": "生活福祉資金（緊急小口資金）特例貸付", "cat": "生活・お金", "nonbre": 27, "pdf_page": 33, "badge": "更新"},
    {"id": "condolence-grant", "name": "災害弔慰金・災害障がい見舞金・災害見舞金", "cat": "生活・お金", "nonbre": 28, "pdf_page": 34, "badge": ""},
    {"id": "school-support", "name": "令和８年熊本地震就学援助制度", "cat": "生活・お金", "nonbre": 29, "pdf_page": 35, "badge": "新規"},

    # 公共料金の減免措置等 (4件)
    {"id": "water-fee", "name": "水道料金の免除", "cat": "公共料金", "nonbre": 30, "pdf_page": 36, "badge": ""},
    {"id": "nhk-fee", "name": "NHK受信料の免除", "cat": "公共料金", "nonbre": 31, "pdf_page": 37, "badge": ""},
    {"id": "kyuden-fee", "name": "九州電力の電気料金等特別措置", "cat": "公共料金", "nonbre": 32, "pdf_page": 38, "badge": ""},
    {"id": "ntt-fee", "name": "NTT西日本の電話料金等特別措置", "cat": "公共料金", "nonbre": 33, "pdf_page": 39, "badge": ""},

    # 住まいの確保 (12件)
    {"id": "built-housing", "name": "建設型応急住宅（仮設住宅）", "cat": "住まい", "nonbre": 34, "pdf_page": 40, "badge": "更新"},
    {"id": "site-housing", "name": "自宅敷地内への建設型応急住宅", "cat": "住まい", "nonbre": 36, "pdf_page": 42, "badge": "更新"},
    {"id": "minashi-housing", "name": "賃貸型応急住宅（みなし仮設住宅）", "cat": "住まい", "nonbre": 37, "pdf_page": 43, "badge": ""},
    {"id": "emergency-repair", "name": "住宅の応急修理", "cat": "住まい", "nonbre": 38, "pdf_page": 44, "badge": "更新"},
    {"id": "bluesheet-repair", "name": "住家の緊急修理（ブルーシート展張等）", "cat": "住まい", "nonbre": 40, "pdf_page": 46, "badge": "期限間近"},
    {"id": "jokaso-grant", "name": "合併処理浄化槽の補助", "cat": "住まい", "nonbre": 42, "pdf_page": 48, "badge": ""},
    {"id": "architect-consult", "name": "建築士による被災住宅相談会", "cat": "住まい", "nonbre": 43, "pdf_page": 49, "badge": "新規開設"},
    {"id": "architect-tel", "name": "建築士による電話相談窓口", "cat": "住まい", "nonbre": 44, "pdf_page": 50, "badge": ""},
    {"id": "plumbing-callcenter", "name": "水道の宅内配管工事コールセンター", "cat": "住まい", "nonbre": 45, "pdf_page": 51, "badge": ""},
    {"id": "well-support", "name": "被災井戸に関する支援", "cat": "住まい", "nonbre": 46, "pdf_page": 52, "badge": ""},
    {"id": "jhf-loan", "name": "住宅金融支援機構「災害復興住宅融資」", "cat": "住まい", "nonbre": 47, "pdf_page": 53, "badge": ""},
    {"id": "demolition", "name": "建物の解体・撤去（公費解体・自費解体）", "cat": "住まい", "nonbre": 49, "pdf_page": 55, "badge": ""},

    # 事業経営・農林漁業への支援 (15件)
    {"id": "farmland-repair", "name": "農地災害復旧事業", "cat": "農林・事業", "nonbre": 50, "pdf_page": 56, "badge": ""},
    {"id": "farming-onestop", "name": "営農再開ワンストップ窓口", "cat": "農林・事業", "nonbre": 51, "pdf_page": 57, "badge": ""},
    {"id": "farming-restart", "name": "早期の営農再開に向けた支援", "cat": "農林・事業", "nonbre": 52, "pdf_page": 58, "badge": "更新"},
    {"id": "agri-machinery", "name": "八代市農業用機械・施設等復旧支援事業", "cat": "農林・事業", "nonbre": 54, "pdf_page": 60, "badge": "更新"},
    {"id": "jfc-loan", "name": "日本政策金融公庫「災害復旧貸付」", "cat": "農林・事業", "nonbre": 55, "pdf_page": 61, "badge": ""},
    {"id": "smrj-loan", "name": "中小企業基盤整備機構「小規模企業共済災害時貸付」", "cat": "農林・事業", "nonbre": 56, "pdf_page": 62, "badge": ""},
    {"id": "short-guarantee", "name": "緊急時短期資金保証制度", "cat": "農林・事業", "nonbre": 57, "pdf_page": 63, "badge": ""},
    {"id": "special-fund-r8", "name": "金融円滑化特別資金（令和８年熊本地震枠）", "cat": "農林・事業", "nonbre": 58, "pdf_page": 64, "badge": ""},
    {"id": "safetynet4-fund", "name": "金融円滑化特別資金（セーフティネット保証対応枠）", "cat": "農林・事業", "nonbre": 59, "pdf_page": 65, "badge": ""},
    {"id": "ouen-fund", "name": "小規模事業者おうえん資金", "cat": "農林・事業", "nonbre": 60, "pdf_page": 66, "badge": ""},
    {"id": "employment-subsidy", "name": "雇用調整助成金（特例措置）", "cat": "農林・事業", "nonbre": 61, "pdf_page": 67, "badge": ""},
    {"id": "chamber-consult", "name": "八代商工会議所・八代市商工会 特別相談窓口", "cat": "農林・事業", "nonbre": 62, "pdf_page": 68, "badge": "更新"},
    {"id": "saishuppatsu", "name": "くまもと事業者再出発支援補助金", "cat": "農林・事業", "nonbre": 63, "pdf_page": 69, "badge": "新規"},
    {"id": "jizokuka", "name": "小規模事業者持続化補助金＜一般型 災害支援枠＞", "cat": "農林・事業", "nonbre": 64, "pdf_page": 70, "badge": "新規"},
    {"id": "interest-subsidy", "name": "中小企業者事業再建支援利子補給事業", "cat": "農林・事業", "nonbre": 65, "pdf_page": 71, "badge": "新規"}
]

print(f"定義された全制度数: {len(programs_meta)}")

# 各制度のページテキストを収集・構造化
for prog in programs_meta:
    p_num = prog["pdf_page"]
    raw_text = pages_dict.get(p_num, "")
    # 次の制度の開始ページの前まで、あるいは2ページにわたる制度の場合
    # 複数ページ制度の判定
    two_page_pages = [17, 29, 31, 40, 44, 46, 53, 58]
    if p_num in two_page_pages and (p_num + 1) in pages_dict:
        raw_text += "\n" + pages_dict[p_num + 1]
    
    prog["raw_text"] = raw_text

with open("tools/programs_v8_raw.json", "w", encoding="utf-8") as f:
    json.dump(programs_meta, f, ensure_ascii=False, indent=2)

print("Saved tools/programs_v8_raw.json")
