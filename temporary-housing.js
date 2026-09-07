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
  const cities=["すべて",...new Set(sites.map(site=>site.city))];
  let map,layer;

  const label=site=>site.name.endsWith("団地")?site.name:site.name+"仮設団地";
  const officialMapLink=site=>`https://maps.gsi.go.jp/#16/${site.lat}/${site.lng}/&base=std&ls=std&disp=1`;
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
        .bindPopup(`<div class="th-map-popup"><small>${site.city}</small><b>${label(site)}</b><strong>${site.units}戸</strong><span>${site.address}</span><em>${accuracy}</em><a href="${officialMapLink(site)}" target="_blank" rel="noopener">地理院地図で開く ↗</a></div>`)
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
