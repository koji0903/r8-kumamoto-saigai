(()=>{
  const form=document.querySelector('#kmsEligibilityForm');
  const output=document.querySelector('#kmsEligibilityResult');
  if(!form||!output)return;
  const names={full:'全壊',large:'大規模半壊',middle:'中規模半壊',half:'半壊',semi:'準半壊',minor:'一部損壊',unknown:'判定不明'};
  const item=(tone,title,why,next,href='#official')=>({tone,title,why,next,href});
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const data=new FormData(form),damage=data.get('damage'),conditions=new Set(data.getAll('condition'));
    if(!damage){output.innerHTML='<div class="kms-result-empty"><span>!</span><div><b>住家の被害判定を選んでください</b><p>まだ分からない場合は「まだ不明」を選べます。</p></div></div>';return}
    const has=(...x)=>x.includes(damage),results=[];
    if(damage==='unknown'){
      results.push(item('check','り災証明書を先に申請','住家の被害判定が、多くの給付・住まい・減免制度の入口になります。','写真、本人確認書類を準備。窓口は10月30日、電子申請は10月31日まで。','#certificate'));
    }else{
      results.push(item(has('minor')?'unlikely':'likely','災害見舞金',has('full')?'全壊・流失世帯は5万円':has('large','middle','half','semi')?'大規模半壊〜準半壊世帯は3万円':'一部損壊は住家被害による見舞金の対象外です。',has('minor')?'負傷や床上浸水の別要件も確認。':'り災証明書と世帯主名義の通帳を準備。','#money'));
      if(has('full','large'))results.push(item('likely','被災者生活再建支援金',damage==='full'?'基礎支援金100万円＋再建方法に応じ最大200万円。':'基礎支援金50万円＋再建方法に応じ最大200万円。','単身世帯は記載額の4分の3。再建方法が決まったら申請。','#money'));
      else if(damage==='middle')results.push(item('likely','被災者生活再建支援金（加算支援金）','基礎支援金はなく、建設・購入100万円、補修50万円、賃借25万円。','再建方法と契約関係書類を確認。','#money'));
      else if(damage==='half'&&conditions.has('demolish'))results.push(item('check','被災者生活再建支援金','やむを得ない理由で住宅を解体した世帯は「全壊扱い」になる可能性があります。','解体前に理由・手続き・必要書類を健康福祉政策課へ確認。','#money'));
      if(has('full','large','middle','half'))results.push(item('likely','災害援護資金',damage==='full'?'住居全壊等は被害条件の候補です。':'半壊以上は被害条件の候補です。','所得制限、世帯主の要件、貸付限度額を確認。返済が必要です。','#money'));
      if(has('full','large','middle','half','semi'))results.push(item('check','住宅の応急修理',damage==='semi'?'上限36万7千円。自らの資力で修理できない世帯が対象。':'上限75万7千円。中規模半壊・半壊は資力要件があります。','自宅で生活できる状態に戻る見込みが必要。契約前に住宅政策課へ。','#housing'));
      if(has('full','large','middle','half','semi'))results.push(item('check','住宅の緊急修理','屋根などの被害が広がるおそれがある場合、準半壊以上で上限5万6,400円。','り災証明書は不要。2026年9月30日の完了期限があるため、施工前に住宅政策課へ。','#housing'));
      if(has('full','large','middle','half')&&conditions.has('unlivable'))results.push(item('likely','市営住宅の一時提供','半壊以上で、引き続き住むことができない方が候補です。','原則6か月、最長1年。家賃・駐車場・敷金免除、共益費等は自己負担。','#housing'));
      if(conditions.has('nohome')&&(damage==='full'||(has('large','middle','half')&&(conditions.has('demolish')||conditions.has('longrepair')))))results.push(item('check','賃貸型・建設型応急住宅','住める家がなく、自力で住宅を確保できない世帯が候補です。','半壊等は解体・長期修理など追加条件。契約前に住宅政策課へ。','#housing'));
      if(has('full','large','middle','half'))results.push(item('likely','被災家屋等の解体・撤去','半壊以上の住家は被害判定上の候補です。','所有者、権利関係、対象建物を確認して申請。','#housing'));
      if(has('full','large','middle','half'))results.push(item('likely','市税・保険料等の減免','住家被害条件を満たす複数の減免があります。','市税、国保、後期高齢者、介護、保育料を個別に確認。','#reductions'));
      if(damage==='semi')results.push(item('check','水道・下水道使用料の減免','制度本文では「準半壊以上」と記載されていますが、冊子末尾表と読み取りが一致しません。','上下水道局料金課へ対象を確認。','#reductions'));
    }
    if(conditions.has('income')&&conditions.has('nhi'))results.push(item('check','国民健康保険料の減免','主たる生計維持者の収入が前年比3割以上減る見込みなど、3条件をすべて満たす場合があります。','前年所得1,000万円以下などの所得条件を国保年金課へ確認。','#reductions'));
    if(conditions.has('income')&&conditions.has('elderly'))results.push(item('check','後期高齢者医療保険料の減免','主たる生計維持者の収入減、死亡、重篤な傷病等で候補になる場合があります。','所得と収入減の資料を準備し国保年金課へ。','#reductions'));
    if(conditions.has('parent'))results.push(item('check','子育て・ひとり親・教育支援','保育料、児童扶養手当、就学援助、奨学金、ひとり親住宅資金などがあります。','子どもの年齢・在籍・世帯状況に合う制度を確認。','#reductions'));
    if(conditions.has('care'))results.push(item('check','宿泊・介護・障がい福祉','高齢者、障がい者、妊産婦、乳幼児、医療的配慮が必要な方を優先する宿泊支援等があります。','避難所職員・保健師または担当課へ相談。','#life'));
    if(conditions.has('business'))results.push(item('likely','事業者・農漁業の相談','中小企業の融資・経営、農作物・施設・機械・農地、労働の相談窓口があります。','被害写真、所在地、事業内容が分かる資料を残す。','#business'));
    const order={likely:0,check:1,unlikely:2};results.sort((a,b)=>order[a.tone]-order[b.tone]);
    output.innerHTML=`<header><div><small>選択した判定</small><h3>${names[damage]}</h3></div><b>${results.length}件の確認候補</b></header><div class="kms-result-list">${results.map(r=>`<article class="${r.tone}"><span>${r.tone==='likely'?'対象候補':r.tone==='unlikely'?'判定上は対象外':'条件を確認'}</span><h4>${r.title}</h4><p>${r.why}</p><dl><dt>次にすること</dt><dd>${r.next}</dd></dl><a href="${r.href}">詳しく見る →</a></article>`).join('')}</div><p class="kms-result-note">この結果は第6版冊子に基づく初期確認です。申請時点の受付状況と世帯ごとの要件は担当窓口が確認します。</p>`;
    output.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  });
})();
