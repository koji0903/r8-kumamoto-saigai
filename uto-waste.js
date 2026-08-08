(()=>{
  const icon=(body)=>`<svg viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
  const categories=[
    {key:"all",label:"すべて",icon:icon('<path d="M4 7h16v13H4zM8 7V4h8v3"/>')},
    {key:"burnable",label:"可燃・プラスチック",icon:icon('<path d="M12 3c3 4 5 6 5 10a5 5 0 0 1-10 0c0-2 1-4 3-6 0 3 2 4 2 4 1-3 0-5 0-8Z"/>')},
    {key:"fabric",label:"布団・布類",icon:icon('<path d="M4 8h16v10H4zM7 8V5h10v3M8 13h8"/>')},
    {key:"wood",label:"木くず・家具",icon:icon('<path d="M4 18 18 4m-9 0 11 11M4 9l11 11"/>')},
    {key:"metal",label:"金属類",icon:icon('<path d="M7 4h10l3 8-8 8-8-8 3-8Z"/>')},
    {key:"sofa",label:"ソファー・マット",icon:icon('<path d="M5 11V8h14v3m2 1v7H3v-7m3 7v2m12-2v2"/>')},
    {key:"small",label:"小型家電",icon:icon('<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M9 8h6m-7 8h.01m4 0h.01m4 0h.01"/>')},
    {key:"building",label:"瓦・がれき類",icon:icon('<path d="m3 17 4-5 4 4 4-8 6 9M4 20h16"/>')},
    {key:"appliance",label:"テレビ・冷蔵庫等",icon:icon('<rect x="4" y="5" width="16" height="14" rx="2"/><path d="m9 2 3 3 3-3M8 15h8"/>')}
  ];
  const facilities=[
    {id:"cs",name:"CSネットワーク",address:"宇土市松山町3941",lat:32.668007,lng:130.673584,ticket:true,closed:"8月19日以降：毎週水曜・日曜",types:["burnable","fabric","wood","metal","sofa","small","building","appliance"],note:"可燃ごみ（生活ごみを除く）、プラスチック類、布団・布類、木くず、金属類、ソファー・マット、小型家電、瓦、コンクリート殻、廃家電、陶磁器、ガラス、スレート板、サイディングボード、石膏ボード",flow:"施設へ直接並べません。指定の入場券配布・待機場所へ向かってください。"},
    {id:"kireka",name:"環境再生センターKIREKA",address:"宇土市松原町386",lat:32.696476,lng:130.658844,ticket:true,closed:"8月18日以降：毎週火曜・土曜",types:["burnable","fabric","wood","metal","sofa","small","building","appliance"],note:"CSネットワークと同じ15品目を受け入れます。",flow:"施設へ直接並べません。三菱ケミカル駐車場で入場券を受け取り、誘導に従ってください。"},
    {id:"kanemura",name:"カネムラエコワークス",address:"宇土市岩古曽町2063-1",lat:32.686455,lng:130.677902,ticket:false,closed:"8月23日以降：毎週日曜",types:["metal","sofa","small"],note:"金属類（針金ハンガー、フライパン等）、ソファー・マット、小型家電（カメラ、ゲーム機、電気シェーバー等）のみ",flow:"直接搬入できます。渋滞等により待つ場合があります。"}
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
    filters.innerHTML=categories.map(c=>`<button type="button" data-key="${c.key}" aria-pressed="${selected===c.key}">${c.icon}<span>${c.label}</span></button>`).join("");
    const found=selected==="all"?facilities:facilities.filter(f=>f.types.includes(selected));
    results.innerHTML=found.map(f=>`<article class="facility-card"><header><span class="facility-number">${facilities.indexOf(f)+1}</span><div><p>${f.ticket?"入場券が必要":"直接搬入"}</p><h3>${f.name}</h3><span>${f.address}</span></div></header><div class="facility-status ${f.ticket?"needs-ticket":"direct"}">${f.ticket?icon('<path d="M4 7h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4V7Z"/>'):icon('<path d="M3 11h18M5 11l2-5h10l2 5v7H5z"/>')}<b>${f.ticket?"入場券を受け取ってから搬入":"この施設へ直接搬入"}</b></div><dl><div><dt>受付</dt><dd>8:30〜11:30／13:00〜15:30</dd></div><div><dt>停止日</dt><dd>${f.closed}</dd></div></dl><div class="accepted"><b>受け入れるもの</b><p>${f.note}</p></div><p class="facility-flow">${f.flow}</p><a class="route-link" href="${mapsUrl(f)}" target="_blank" rel="noopener">現在地から経路を検索 ↗</a></article>`).join("");
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
