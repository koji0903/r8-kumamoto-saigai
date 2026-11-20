#!/usr/bin/env python3
"""八代市「被災者応援ガイドブック」第10版を制度単位で構造化する。"""
import json
import re
import sys
from pathlib import Path

import pymupdf

META = [
    (8,"counseling","災害相談窓口","生活・相談",1,""),(9,"waste","災害ごみの受入れ","生活・相談",2,"更新"),(11,"hotel","ホテル等への避難","生活・相談",3,""),(12,"bath","公衆浴場の無料入浴支援","生活・相談",4,""),(13,"volunteer","災害ボランティアの派遣依頼","生活・相談",5,""),(14,"rental-car","災害サポート・レンタカーの貸出","生活・相談",7,"更新"),(15,"lawyer-consult","弁護士による無料法律相談","生活・相談",8,""),(15,"nichibenren-tel","日本弁護士連合会（日弁連）による無料電話相談","生活・相談",8,""),(16,"scrivener-consult","司法書士による無料法律相談","生活・相談",9,""),
    (17,"health-insurance","国民健康保険税・後期高齢者医療保険料・介護保険料の減免","税・保険",10,""),(18,"resident-tax","市県民税の減免","税・保険",11,"更新"),(20,"property-tax","固定資産税の減免","税・保険",13,"更新"),(22,"pension-exemption","国民年金保険料の免除","税・保険",15,""),(23,"automobile-tax","自動車税の減免","税・保険",16,""),
    (24,"risai-cert","り災・被災証明書の発行","証明",17,"更新"),(25,"juminhyo-fee","住民票等の交付手数料の免除","証明",18,""),(26,"mynumber-fee","マイナンバーカードの再交付手数料の免除","証明",19,""),(27,"tax-cert-fee","災害に関連する税証明書の手数料の免除","証明",20,""),
    (28,"no-insurance-card","保険証等がなくても、介護サービスの利用や医療機関等を受診できます","生活・お金",21,""),(29,"medical-fee-exemption","医療保険の窓口負担、介護保険・障害福祉サービス利用料の免除","生活・お金",22,"更新"),(30,"rebuild-grant","被災者生活再建支援制度","生活・お金",23,""),(32,"disaster-loan","災害援護資金の貸付","生活・お金",25,"更新"),(34,"condolence-grant","災害弔慰金・災害障がい見舞金・災害見舞金（重傷者）の支給","生活・お金",27,""),(35,"school-support","令和８年熊本地震に伴う就学援助制度のご案内","生活・お金",28,""),(36,"donation-distribution","災害義援金の配分（第１次配分）","生活・お金",29,""),
    (37,"nhk-fee","ＮＨＫ受信料の免除","公共料金",30,""),(38,"kyuden-fee","九州電力の電気料金等の特別処置","公共料金",31,""),(39,"ntt-fee","ＮＴＴ西日本の電話料金等の特別措置","公共料金",32,""),
    (40,"built-housing","建設型応急住宅（仮設住宅）","住まい",33,"更新"),(41,"site-housing","自宅敷地内への建設型応急住宅","住まい",34,"更新"),(42,"minashi-housing","賃貸型応急住宅（みなし仮設住宅）","住まい",35,"更新"),(43,"emergency-repair","住宅の応急修理","住まい",36,""),(45,"bluesheet-repair","住家の緊急修理（ブルーシート展張等）","住まい",38,"更新"),(47,"jokaso-grant","合併処理浄化槽の補助","住まい",40,""),(48,"architect-consult","建築士による被災住宅相談会の開設について","住まい",41,"更新"),(49,"architect-tel","建築士による電話相談窓口の開設について","住まい",42,"更新"),(50,"plumbing-callcenter","水道の宅内配管工事コールセンターの開設","住まい",43,""),(51,"well-support","被災井戸に関する支援について","住まい",44,"更新"),(52,"water-materials","生活用水確保用資材の貸出","住まい",45,""),(53,"vulnerable-water","要配慮世帯への給水支援","住まい",46,"新規"),(54,"jhf-loan","住宅金融支援機構による「災害復興住宅融資」（一般）","住まい",47,""),(56,"demolition","建物の解体・撤去について","住まい",49,""),
    (57,"farmland-repair","農地災害復旧事業","農林・事業",50,""),(58,"farming-onestop","営農再開ワンストップ窓口","農林・事業",51,""),(59,"agri-machinery","八代市農業用機械・施設等復旧支援事業（令和８年熊本地震）","農林・事業",52,""),(60,"agri-emergency-loan","令和８年熊本地震緊急支援資金制度（被災農業者向け）","農林・事業",53,"新規"),(61,"jfc-loan","日本政策金融公庫による「災害復旧貸付」","農林・事業",54,""),(62,"smrj-loan","中小企業基盤整備機構による「小規模企業共済災害時貸付」","農林・事業",55,""),(63,"short-guarantee","緊急時短期資金保証制度","農林・事業",56,""),(64,"special-fund-r8","金融円滑化特別資金（令和８年熊本地震枠）","農林・事業",57,""),(65,"safetynet4-fund","金融円滑化特別資金（セーフティネット保証対応枠（令和８年熊本地震分））","農林・事業",58,""),(66,"ouen-fund","小規模事業者おうえん資金（令和８年熊本地震分）","農林・事業",59,""),(67,"employment-subsidy","雇用調整助成金（令和８年熊本地震の災害に伴う特例措置）","農林・事業",60,""),(68,"chamber-consult","八代商工会議所・八代市商工会による「特別相談窓口開設」","農林・事業",61,""),(69,"saishuppatsu","令和８年熊本地震に係る「くまもと事業者再出発支援補助金」","農林・事業",62,""),(71,"jizokuka","小規模事業者持続化補助金＜一般型 災害支援枠（令和８年熊本地震）＞","農林・事業",64,""),(72,"interest-subsidy","中小企業者事業再建支援利子補給事業（令和８年熊本地震）","農林・事業",65,""),(73,"industrial-employment","産業雇用安定助成金（令和８年熊本地震災害特例人材確保支援コース）","農林・事業",66,""),(74,"shopping-street","商店街にぎわい創出事業（被災商店街等再建支援事業）","農林・事業",67,"")
]

def clean(text):
    return re.sub(r"\s+", " ", text).strip()

def parse_sections(raw):
    labels = [("type","支援の種類"),("content","制度の内容"),("target","活用できる方"),("notes","注意事項"),("contact","お問合わせ先")]
    positions = []
    for key,label in labels:
        pos = raw.find(label)
        if pos >= 0: positions.append((pos,key,label))
    positions.sort()
    out = {k:"" for k,_ in labels}
    for i,(pos,key,label) in enumerate(positions):
        end = positions[i+1][0] if i+1 < len(positions) else len(raw)
        out[key] = clean(raw[pos+len(label):end])
    return out

def main():
    if len(sys.argv) != 3:
        raise SystemExit("usage: parse_yatsushiro_v10.py GUIDE.pdf OUTPUT.json")
    document = pymupdf.open(sys.argv[1])
    starts = []
    full = ""
    meta_index = 0
    for page_no,page in enumerate(document,1):
        text = page.get_text()
        base = len(full)
        full += text + "\n"
        for match in re.finditer("制度の名称", text):
            if meta_index >= len(META): break
            expected_page = META[meta_index][0]
            if expected_page != page_no:
                raise RuntimeError(f"制度開始ページ不一致: expected={expected_page}, actual={page_no}")
            starts.append(base + match.start())
            meta_index += 1
    if meta_index != len(META):
        raise RuntimeError(f"制度数不一致: expected={len(META)}, actual={meta_index}")
    programs = []
    for i,meta in enumerate(META):
        page,pid,name,category,nonbre,badge = meta
        raw = full[starts[i]:starts[i+1] if i+1 < len(starts) else len(full)]
        sections = parse_sections(raw)
        phones = list(dict.fromkeys(re.findall(r"(?:0\d{1,4}[-－]\d{1,4}[-－]\d{3,4}|\b\d{2,3}[-－]\d{4}\b|0120[-－]\d{3}[-－]\d{3}|080[-－]\d{4}[-－]\d{4}|070[-－]\d{4}[-－]\d{4}|050[-－]\d{4}[-－]\d{4})", raw)))
        programs.append({"id":pid,"name":name,"category":category,"nonbre":nonbre,"pdf_page":page,"badge":badge,"type":sections["type"],"target":sections["target"],"content":sections["content"],"notes":sections["notes"],"contact":sections["contact"],"phones":phones})
    Path(sys.argv[2]).write_text(json.dumps(programs,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"第10版を構造化しました: {len(programs)}制度")

if __name__ == "__main__":
    main()
