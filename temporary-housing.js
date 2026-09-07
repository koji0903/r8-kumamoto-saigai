(()=>{
  const mapNode=document.getElementById("temporaryHousingMap");
  if(!mapNode)return;

  const sites=[
    {city:"八代市",name:"毘舎丸町",address:"八代市毘舎丸町337-1",units:18,lat:32.509651,lng:130.615097,precision:"area"},
    {city:"八代市",name:"鏡町",address:"八代市鏡町内田446-1",units:17,lat:32.563713,lng:130.647003,precision:"area"},
    {city:"八代市",name:"植柳上町",address:"八代市植柳上町1-1",units:34,lat:32.49255,lng:130.605927,precision:"address"},
    {city:"八代市",name:"海士江町",address:"八代市海士江町2596",units:35,lat:32.527103,lng:130.62674,precision:"address"},
    {city:"八代市",name:"鏡ヶ池公園",address:"八代市鏡町上鏡526",units:34,lat:32.569965,lng:130.667358,precision:"area"},
    {city:"八代市",name:"沖町",address:"八代市沖町4002-1",units:31,lat:32.524139,lng:130.58699,precision:"address"},
    {city:"宇土市",name:"浦田町",address:"宇土市浦田町1",units:17,lat:32.687138,lng:130.660309,precision:"address"},
    {city:"宇土市",name:"高柳町",address:"宇土市高柳町138",units:45,lat:32.688904,lng:130.648926,precision:"address"},
    {city:"宇城市",name:"当尾",address:"宇城市松橋町曲野1624-22",units:58,lat:32.661015,lng:130.69577,precision:"area"},
    {city:"宇城市",name:"小川",address:"宇城市小川町南新田564-8",units:36,lat:32.592335,lng:130.691406,precision:"area"},
    {city:"宇城市",name:"豊野",address:"宇城市豊野町糸石2966",units:35,lat:32.635307,lng:130.761765,precision:"area"},
    {city:"宇城市",name:"小川駅西",address:"宇城市小川町314-2（JR小川駅西側空地）",units:20,lat:32.6007,lng:130.694,precision:"landmark"},
    {city:"美里町",name:"中央庁舎復興団地",address:"下益城郡美里町馬場1110",units:12,lat:32.6401,lng:130.7901,precision:"area"},
    {city:"美里町",name:"町営球技場",address:"下益城郡美里町馬場537-2",units:40,lat:32.6359,lng:130.7932,precision:"area"},
    {city:"甲佐町",name:"乙女",address:"上益城郡甲佐町田口383-2",units:20,lat:32.697773,lng:130.770203,precision:"area"},
    {city:"氷川町",name:"吉本",address:"八代郡氷川町高塚895",units:27,lat:32.577747,lng:130.704376,precision:"area",complete:true},
    {city:"氷川町",name:"宮原防災公園",address:"八代郡氷川町宮原82",units:24,lat:32.5529,lng:130.6829,precision:"area"},
    {city:"氷川町",name:"鹿島",address:"八代郡氷川町鹿島1654-1",units:18,lat:32.582191,lng:130.665268,precision:"area"},
    {city:"氷川町",name:"新村",address:"八代郡氷川町宮原334（町営久保団地内）",units:13,lat:32.5564,lng:130.6871,precision:"area"}
  ];

  const schedule=[
    {city:"八代市",name:"毘舎丸町",units:18,start:"2026-08-11",end:"2026-10-05",endLabel:"10月上旬"},
    {city:"八代市",name:"鏡町",units:17,start:"2026-08-18",end:"2026-10-15",endLabel:"10月中旬"},
    {city:"八代市",name:"植柳上町",units:34,start:"2026-08-18",end:"2026-10-15",endLabel:"10月中旬"},
    {city:"八代市",name:"海士江町",units:35,start:"2026-08-22",end:"2026-10-25",endLabel:"10月下旬"},
    {city:"八代市",name:"鏡ヶ池公園",units:34,start:"2026-08-26",end:"2026-10-25",endLabel:"10月下旬"},
    {city:"八代市",name:"沖町",units:31,start:"2026-09-07",end:"2026-11-15",endLabel:"11月中旬"},
    {city:"宇土市",name:"浦田町",units:17,start:"2026-08-22",end:"2026-10-25",endLabel:"10月下旬"},
    {city:"宇土市",name:"高柳町",units:45,start:"2026-08-29",end:"2026-11-05",endLabel:"11月上旬"},
    {city:"宇城市",name:"当尾",units:58,phases:[{label:"第1期 10戸",start:"2026-08-03",end:"2026-09-25",endLabel:"9月下旬"},{label:"第2期 48戸",start:"2026-08-29",end:"2026-11-05",endLabel:"11月上旬"}]},
    {city:"宇城市",name:"小川",units:36,phases:[{label:"第1期 30戸",start:"2026-08-03",end:"2026-09-25",endLabel:"9月下旬"},{label:"第2期 6戸",start:"2026-08-29",end:"2026-11-05",endLabel:"11月上旬"}]},
    {city:"宇城市",name:"豊野",units:35,phases:[{label:"第1期 10戸",start:"2026-08-03",end:"2026-09-25",endLabel:"9月下旬"},{label:"第2期 25戸",start:"2026-08-29",end:"2026-11-05",endLabel:"11月上旬"}]},
    {city:"宇城市",name:"小川駅西",units:20,start:"2026-08-29",end:"2026-11-15",endLabel:"11月中旬"},
    {city:"美里町",name:"中央庁舎復興団地",units:12,start:"2026-08-09",end:"2026-10-05",endLabel:"10月上旬"},
    {city:"美里町",name:"町営球技場",units:40,start:"2026-08-22",end:"2026-10-15",endLabel:"10月中旬"},
    {city:"甲佐町",name:"乙女",units:20,start:"2026-08-18",end:"2026-10-05",endLabel:"10月上旬"},
    {city:"氷川町",name:"吉本",units:27,phases:[{label:"第1期 20戸",start:"2026-08-03",end:"2026-08-29",endLabel:"8月29日完成",done:true,handover:"2026-09-05"},{label:"第2期 7戸",start:"2026-08-26",end:"2026-10-15",endLabel:"10月中旬"}]},
    {city:"氷川町",name:"宮原防災公園",units:24,start:"2026-08-10",end:"2026-09-15",endLabel:"9月中旬"},
    {city:"氷川町",name:"鹿島",units:18,start:"2026-08-10",end:"2026-09-15",endLabel:"9月中旬"},
    {city:"氷川町",name:"新村",units:13,start:"2026-08-13",end:"2026-10-05",endLabel:"10月上旬"}
  ];

  const scheduleNode=document.getElementById("temporaryHousingSchedule");
  if(scheduleNode){
    const rangeStart=new Date("2026-08-01T00:00:00+09:00");
    const rangeEnd=new Date("2026-11-16T00:00:00+09:00");
    const total=rangeEnd-rangeStart;
    const pos=date=>Math.max(0,Math.min(100,(new Date(date+"T00:00:00+09:00")-rangeStart)/total*100));
    const ticks=[
      ["8/1","2026-08-01"],["8/15","2026-08-15"],["9/1","2026-09-01"],["9/15","2026-09-15"],
      ["10/1","2026-10-01"],["10/15","2026-10-15"],["11/1","2026-11-01"],["11/15","2026-11-15"]
    ];
    const bar=phase=>{
      const left=pos(phase.start),width=Math.max(1.2,pos(phase.end)-left);
      const label=phase.label?phase.label+"・":"";
      const handover=phase.handover?`<i class="th-handover" style="left:${pos(phase.handover)}%" title="9月5日 鍵引渡し"><span>鍵引渡し</span></i>`:"";
      return `<span class="th-schedule-bar ${phase.done?"done":"plan"}" style="left:${left}%;width:${width}%" title="${label}${phase.start.slice(5).replace("-","/")}着工 → ${phase.endLabel}"><b>${phase.label||phase.units+"戸"}</b></span>${handover}`;
    };
    let previous="";
    scheduleNode.innerHTML=`<div class="th-schedule-axis"><div>市町・団地</div><div>${ticks.map(([label,date])=>`<span style="left:${pos(date)}%">${label}</span>`).join("")}</div></div>`+
      schedule.map(item=>{
        const cityStart=item.city!==previous;previous=item.city;
        const phases=item.phases||[{...item,label:item.units+"戸"}];
        return `<div class="th-schedule-row ${cityStart?"city-start":""}"><div class="th-schedule-name"><small>${cityStart?item.city:""}</small><b>${item.name}</b><span>${item.units}戸</span></div><div class="th-schedule-track">${ticks.map(([,date])=>`<i class="th-gridline" style="left:${pos(date)}%"></i>`).join("")}${phases.map(bar).join("")}</div></div>`;
      }).join("");
  }

  const cities=["すべて",...new Set(sites.map(site=>site.city))];
  let map,layer;

  const label=site=>site.name.endsWith("団地")?site.name:site.name+"仮設団地";
  const officialMapLink=site=>`https://maps.gsi.go.jp/#16/${site.lat}/${site.lng}/&base=std&ls=std&disp=1`;
  const googleDirectionsLink=site=>"https://www.google.com/maps/dir/?api=1&destination="+encodeURIComponent("熊本県"+site.address.replace(/（.*$/,""));
  const markerIcon=site=>L.divIcon({
    className:"th-marker-wrap",
    html:`<span class="th-marker ${site.complete?"complete":"building"}" aria-hidden="true"><b>${site.units}</b></span>`,
    iconSize:[38,44],
    iconAnchor:[19,42],
    popupAnchor:[0,-39]
  });

  const render=city=>{
    layer.clearLayers();
    const visible=city==="すべて"?sites:sites.filter(site=>site.city===city);
    visible.forEach(site=>{
      const accuracy=site.precision==="address"?"番地まで一致した案内位置":site.precision==="landmark"?"県資料の目印から示した案内位置":"町域内のおおよその位置";
      L.marker([site.lat,site.lng],{icon:markerIcon(site),title:`${site.city} ${label(site)} ${site.units}戸`})
        .bindPopup(`<div class="th-map-popup"><small>${site.city}</small><b>${label(site)}</b><strong>${site.units}戸</strong><span>${site.address}</span><em>${accuracy}</em><div class="th-map-popup-actions"><a class="route" href="${googleDirectionsLink(site)}" target="_blank" rel="noopener">現在地から経路を開く ↗</a><a href="${officialMapLink(site)}" target="_blank" rel="noopener">地理院地図で確認 ↗</a></div></div>`)
        .addTo(layer);
    });
    if(visible.length)map.fitBounds(L.latLngBounds(visible.map(site=>[site.lat,site.lng])).pad(.12),{maxZoom:14});
    document.querySelectorAll("#housingMapFilters button").forEach(button=>{
      const active=button.dataset.city===city;
      button.setAttribute("aria-pressed",String(active));
      button.classList.toggle("active",active);
    });
  };

  try{
    map=L.map(mapNode,{scrollWheelZoom:false,minZoom:7}).setView([32.59,130.68],10);
    L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",{
      attribution:'地図：<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">国土地理院</a>',
      maxZoom:18
    }).addTo(map);
    layer=L.layerGroup().addTo(map);
    document.getElementById("housingMapFilters").innerHTML=cities.map(city=>`<button type="button" data-city="${city}" aria-pressed="${city==="すべて"}">${city}</button>`).join("");
    document.querySelectorAll("#housingMapFilters button").forEach(button=>button.addEventListener("click",()=>render(button.dataset.city)));
    render("すべて");
  }catch(error){
    mapNode.hidden=true;
    document.getElementById("temporaryHousingMapFallback").hidden=false;
  }
})();
