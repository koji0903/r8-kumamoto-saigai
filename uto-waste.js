(()=>{
  const icon=(body)=>`<svg viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
  const art=(body)=>`<svg viewBox="0 0 120 82" aria-hidden="true">${body}</svg>`;
  const categories=[
    {key:"all",label:"すべて",examples:"すべての持込先を見る",art:art('<rect class="art-teal" x="11" y="36" width="29" height="32" rx="3"/><rect class="art-orange" x="45" y="21" width="29" height="47" rx="3"/><rect class="art-blue" x="79" y="31" width="29" height="37" rx="3"/><path d="M18 45h15M52 31h15M86 41h15"/>')},
    {key:"burnable",label:"可燃・プラスチック",examples:"生活ごみを除く可燃物・プラ製品",art:art('<path class="art-orange" d="M18 31h44l-5 40H23l-5-40Z"/><path d="M26 31c3-18 28-18 31 0M36 42v18m11-18v18"/><path class="art-blue" d="M78 18h19v12l7 10v30H71V40l7-10V18Z"/><path d="M78 29h19M78 45h19"/>')},
    {key:"fabric",label:"布団・布類",examples:"布類（布団など）",art:art('<rect class="art-blue" x="15" y="18" width="90" height="52" rx="9"/><path d="M22 38h76M43 18v52M70 18v52"/><path class="art-yellow" d="M19 22h25v14H19z"/>')},
    {key:"glass",label:"ガラス・陶磁器・瓦",examples:"ガラス類・せともの・瓦",art:art('<path class="art-blue" d="m14 61 25-36 25 36H14Z"/><path class="art-orange" d="m48 67 28-41 29 41H48Z"/><path d="M24 53h30M61 55h31M69 38l13 18"/>')},
    {key:"wood",label:"木くず・家具",examples:"たんす・椅子・木材など",art:art('<rect class="art-orange" x="12" y="19" width="51" height="52" rx="2"/><path d="M12 38h51M38 19v52M31 29h3m11 0h3M31 50h3m11 0h3"/><path class="art-yellow" d="M76 35h28v25H76z"/><path d="M81 60v12m18-12v12M79 35V23m22 12V23"/>')},
    {key:"metal",label:"金属類",examples:"フライパン・針金ハンガーなど",art:art('<circle class="art-slate" cx="43" cy="49" r="25"/><circle cx="43" cy="49" r="15"/><path d="m63 36 39-22 6 10-42 20"/><path class="hanger" d="M77 69 95 48l18 21H77Zm18-21c-5-8 8-10 4-18"/>')},
    {key:"sofa",label:"ソファー・マット",examples:"ソファー・マットレス",art:art('<path class="art-orange" d="M23 37V23h74v14M14 40v28h92V40c0-7-11-7-11 0v9H25v-9c0-7-11-7-11 0Z"/><path d="M25 49v19m70-19v19M31 68v8m58-8v8"/>')},
    {key:"small",label:"小型家電",examples:"カメラ・ゲーム機・電気シェーバー",art:art('<rect class="art-blue" x="9" y="28" width="50" height="35" rx="5"/><circle cx="34" cy="45" r="11"/><path d="M18 28l6-9h18l6 9"/><rect class="art-teal" x="69" y="36" width="42" height="25" rx="10"/><circle cx="83" cy="48" r="3"/><circle cx="98" cy="44" r="2"/><circle cx="103" cy="51" r="2"/>')},
    {key:"building",label:"コンクリート・建材類",examples:"コンクリート・スレート・石膏ボード",art:art('<path class="art-slate" d="M8 55 34 25l26 30H8Z"/><path class="art-orange" d="M43 66 73 29l27 37H43Z"/><path class="art-blue" d="m82 17 28 9-8 31-28-9 8-31Z"/><path d="m86 23 14 26M105 29 80 43"/>')},
    {key:"appliance",label:"テレビ・冷蔵庫等",examples:"テレビ・冷蔵庫などの廃家電",art:art('<rect class="art-blue" x="8" y="23" width="61" height="43" rx="4"/><rect x="16" y="31" width="45" height="27" rx="2"/><path d="m28 13 11 10 11-10M22 72h34"/><rect class="art-teal" x="79" y="10" width="32" height="62" rx="4"/><path d="M79 37h32M87 23v7m0 15v11"/>')}
  ];
  const facilities=[
    {id:"cs",name:"CSネットワーク",address:"宇土市松山町3941",lat:32.668007,lng:130.673584,ticket:true,hours:"8:30〜11:30／13:00〜15:30",closed:"8月19日以降：毎週水曜・日曜",types:["burnable","fabric","glass","wood","metal","sofa","small","building","appliance"],count:"15品目",note:"可燃ごみ（生活ごみを除く）、プラスチック類、布団・布類、木くず、金属類、ソファー・マット、小型家電、瓦、コンクリート殻、廃家電、陶磁器、ガラス、スレート板、サイディングボード、石膏ボード",flow:"施設へ直接並べません。指定の入場券配布・待機場所へ向かってください。"},
    {id:"kireka",name:"環境再生センターKIREKA",address:"宇土市松原町386",lat:32.696476,lng:130.658844,ticket:true,hours:"8:30〜11:30／13:00〜15:30",closed:"8月18日以降：毎週火曜・土曜",types:["burnable","fabric","glass","wood","metal","sofa","small","building","appliance"],count:"15品目",note:"可燃ごみ（生活ごみを除く）、プラスチック類、布団・布類、木くず、金属類、ソファー・マット、小型家電、瓦、コンクリート殻、廃家電、陶磁器、ガラス、スレート板、サイディングボード、石膏ボード",flow:"施設へ直接並べません。三菱ケミカル駐車場で入場券を受け取り、誘導に従ってください。"},
    {id:"kanemura",name:"カネムラエコワークス",address:"宇土市岩古曽町2063-1",lat:32.686455,lng:130.677902,ticket:false,hours:"8:30〜11:30／13:00〜15:30",closed:"8月23日以降：毎週日曜",types:["metal","sofa","small"],count:"3種類のみ",note:"金属類（針金ハンガー、フライパン等）、ソファー・マット、小型家電（カメラ、ゲーム機、電気シェーバー等）のみ",flow:"直接搬入できます。渋滞等により待つ場合があります。"},
    {id:"ouda",name:"網田支所",address:"熊本県宇土市下網田町1819",lat:32.663006,lng:130.545410,ticket:false,selfService:true,period:"8月10日（月）〜9月30日（水）",closed:"定例の中止日なし（満杯時は一時中止）",types:["glass","fabric"],count:"4品目のみ",note:"ガラス類、陶磁器類（せともの）、瓦、布類（布団等）の4品目のみ",flow:"書類は不要です。ガラス類・陶磁器類・瓦は袋から出し、設置されたコンテナへ直接投入してください。"},
    {id:"amitsu",name:"網津支所",address:"熊本県宇土市網津町1991-1（網津防災センター内）",lat:32.696949,lng:130.604156,ticket:false,selfService:true,period:"8月10日（月）〜9月30日（水）",closed:"定例の中止日なし（満杯時は一時中止）",types:["glass","fabric"],count:"4品目のみ",note:"ガラス類、陶磁器類（せともの）、瓦、布類（布団等）の4品目のみ",flow:"書類は不要です。ガラス類・陶磁器類・瓦は袋から出し、設置されたコンテナへ直接投入してください。"}
  ];
  const locations=[
    ...facilities.map(f=>({...f,type:"drop",label:f.name,description:"災害ごみ仮置場"})),
    {id:"komeri",type:"ticket",label:"コメリパワー宇土店 駐車場",address:"宇土市善道寺町綾織179-3",lat:32.681545,lng:130.672272,description:"CSネットワーク入場券・待機場所（8月8日・9日）"},
    {id:"sports",type:"ticket",label:"宇土市運動公園グラウンド",address:"宇土市旭町375",lat:32.682423,lng:130.665771,description:"CSネットワーク入場券・待機場所（8月10日〜16日）"},
    {id:"mitsubishi",type:"ticket",label:"三菱ケミカル駐車場",address:"宇土市築籠町221",lat:32.692474,lng:130.654968,description:"KIREKA入場券・待機場所（8月8日以降）"}
  ];
  const mapsUrl=l=>`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${l.label} ${l.address}`)}`;
  let selected="all";
  const filters=document.querySelector("#wasteFilters"),results=document.querySelector("#facilityResults");
  const render=()=>{
    filters.innerHTML=categories.map(c=>`<button type="button" data-key="${c.key}" aria-pressed="${selected===c.key}"><span class="waste-art">${c.art}</span><span class="waste-filter-copy"><b>${c.label}</b><small>${c.examples}</small></span><i aria-hidden="true">✓</i></button>`).join("");
    const current=categories.find(c=>c.key===selected);
    const found=selected==="all"?facilities:facilities.filter(f=>f.types.includes(selected));
    results.innerHTML=`<header class="facility-result-heading"><span class="result-step">2</span><div><p>選択した品目：<b>${current.label}</b></p><h3>持ち込める場所はこちら</h3><span>${found.length}施設が該当します</span></div><i aria-hidden="true">↓</i></header>`+found.map(f=>`<article class="facility-card ${f.selfService?"branch-card":""}"><header><span class="facility-number">${facilities.indexOf(f)+1}</span><div><p>${f.ticket?"入場券が必要":f.selfService?"支所のコンテナ":"直接搬入"}</p><h3>${f.name}</h3><span>${f.address}</span></div></header><div class="facility-status ${f.ticket?"needs-ticket":f.selfService?"self-service":"direct"}">${f.ticket?icon('<path d="M4 7h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4V7Z"/>'):icon('<path d="M3 11h18M5 11l2-5h10l2 5v7H5z"/>')}<b>${f.ticket?"入場券を受け取ってから搬入":f.selfService?"書類不要・コンテナへ直接投入":"この施設へ直接搬入"}</b></div><dl>${f.period?`<div><dt>期間</dt><dd>${f.period}</dd></div>`:`<div><dt>受付</dt><dd>${f.hours}</dd></div>`}<div><dt>停止日</dt><dd>${f.closed}</dd></div></dl><div class="accepted"><header><span aria-hidden="true">${icon('<path d="M4 7h16v13H4zM8 7V4h8v3M9 11v5m6-5v5"/>')}</span><div><b>持ち込めるごみ</b><small>${f.count}。記載品目以外は持ち込めません</small></div></header><div class="accepted-list">${f.types.map(key=>{const c=categories.find(x=>x.key===key);return `<span><i>${c.art}</i><b>${c.label}</b></span>`}).join("")}</div><details><summary>正式な品目を確認する</summary><p>${f.note}</p></details></div><p class="facility-flow">${f.flow}</p><a class="route-link" href="${mapsUrl(f)}" target="_blank" rel="noopener">現在地から経路を検索 ↗</a></article>`).join("");
    filters.querySelectorAll("button").forEach(b=>b.onclick=()=>{selected=b.dataset.key;render()});
  };
  render();
  document.querySelector("#locationList").innerHTML=locations.map(l=>`<article><span class="location-kind ${l.type}">${l.type==="drop"?"仮置場":"入場券"}</span><div><h3>${l.label}</h3><p>${l.description}</p><span>${l.address}</span></div><a href="${mapsUrl(l)}" target="_blank" rel="noopener">現在地から行く ↗</a></article>`).join("");
  if(window.L){
    const map=L.map("wasteMap",{scrollWheelZoom:false}).setView([32.684,130.666],13);
    L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",{attribution:'地図：<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">国土地理院</a>',maxZoom:18}).addTo(map);
    const bounds=[];
    locations.forEach((l,i)=>{const marker=L.marker([l.lat,l.lng],{icon:L.divIcon({className:"waste-marker-wrap",html:`<span class="waste-marker ${l.type}">${l.type==="drop"?facilities.findIndex(f=>f.id===l.id)+1:"券"}</span>`,iconSize:[38,38],iconAnchor:[19,38]})}).addTo(map);marker.bindPopup(`<b>${l.label}</b><br><span>${l.description}</span><br><a href="${mapsUrl(l)}" target="_blank" rel="noopener">現在地からの経路 ↗</a>`);bounds.push([l.lat,l.lng]);});
    map.fitBounds(bounds,{padding:[28,28]});
  }
})();
