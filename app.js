const STORAGE_KEY = "haven-smart-home-v1";
const initialState = {
  devices: [
    {id:1,name:"Living room light",room:"Living room",type:"light",icon:"☼",on:true,detail:"Main ceiling light"},
    {id:2,name:"Bedroom fan",room:"Bedroom",type:"fan",icon:"✺",on:false,detail:"Ceiling fan"},
    {id:3,name:"Coffee corner plug",room:"Kitchen",type:"plug",icon:"ϟ",on:true,detail:"Smart plug"},
    {id:4,name:"Entryway lock",room:"Entryway",type:"lock",icon:"⌑",on:true,detail:"Door lock · demo only"},
    {id:5,name:"Living room climate",room:"Living room",type:"climate",icon:"☷",on:false,detail:"Climate control"},
    {id:6,name:"Bedside lamp",room:"Bedroom",type:"lamp",icon:"♧",on:true,detail:"Warm ambient light"}
  ],
  routines:[
    {id:1,name:"Gentle mornings",icon:"☼",description:"A softer start to the day.",trigger:"Every day · 7:00 AM",action:"Turn on bedroom lamp",on:true},
    {id:2,name:"Lights when it gets dark",icon:"☾",description:"Let the room respond to daylight.",trigger:"When ambient light is low",action:"Turn on living room light",on:true},
    {id:3,name:"Goodnight, home",icon:"☾",description:"Switch off the things you don't need.",trigger:"Every day · 10:30 PM",action:"Switch off non-essential devices",on:true}
  ],
  activity:[
    {icon:"☼",title:"Living room light switched on",description:"Device control · Living room",time:"Just now"},
    {icon:"✳",title:"Gentle mornings routine is active",description:"Routine status updated",time:"Today, 7:00 AM"},
    {icon:"⌁",title:"Motion activity recorded",description:"Sample event · Hallway sensor",time:"Today, 6:42 AM"},
    {icon:"ϟ",title:"Coffee corner plug switched on",description:"Device control · Kitchen",time:"Today, 6:35 AM"},
    {icon:"☾",title:"Goodnight, home routine is active",description:"Routine status updated",time:"Yesterday, 10:30 PM"}
  ],
  settings:{homeName:"My home",unit:"C",comfort:true},
  nextId:7
};
let state = loadState();
let currentFilter = "All";
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
function clone(v){return JSON.parse(JSON.stringify(v))}
function loadState(){try{const s=JSON.parse(localStorage.getItem(STORAGE_KEY));if(s&&s.devices&&s.routines)return s}catch(e){}return clone(initialState)}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function escapeHTML(str){return String(str).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function toast(message){const el=document.createElement("div");el.className="toast";el.textContent=message;$("#toastRegion").appendChild(el);setTimeout(()=>el.remove(),3200)}
function addActivity(title,description="Preview interaction"){const now=new Date();state.activity.unshift({icon:"✳",title,description,time:"Just now"});state.activity=state.activity.slice(0,30);saveState();renderActivity()}
function fmtTemp(c){return state.settings.unit==="F"?(c*9/5+32).toFixed(1):c.toFixed(1)}
function tempUnit(){return state.settings.unit==="F"?"°F":"°C"}
function setPage(name){$$(".page").forEach(p=>p.classList.toggle("active-page",p.id==="page-"+name));$$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===name));$("#pageCrumb").textContent=({overview:"Overview",devices:"Devices",automation:"Automations",sensors:"Sensor room",activity:"Activity & alerts",insights:"Research insights",settings:"Settings"})[name]||"Overview";$("#sidebar").classList.remove("open");window.scrollTo({top:0,behavior:"smooth"});if(name==="devices")renderDevices();if(name==="automation")renderRoutines();if(name==="activity")renderActivity()}
function navigateEvents(){ $$(".nav-item[data-page]").forEach(b=>b.addEventListener("click",()=>setPage(b.dataset.page)));$$("[data-goto]").forEach(b=>b.addEventListener("click",()=>setPage(b.dataset.goto)));$("#mobileMenu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));document.addEventListener("click",e=>{if(window.innerWidth<=900&&!e.target.closest("#sidebar")&&!e.target.closest("#mobileMenu"))$("#sidebar").classList.remove("open")})}
function deviceRow(d){return `<div class="device-row"><div class="device-symbol ${d.type}">${d.icon}</div><div class="device-meta"><strong>${escapeHTML(d.name)}</strong><small>${escapeHTML(d.room)} · ${escapeHTML(d.detail)}</small></div><span class="device-state ${d.on?"on":""}">${d.on?"On":"Off"}</span><label class="switch" aria-label="Toggle ${escapeHTML(d.name)}"><input type="checkbox" data-device-toggle="${d.id}" ${d.on?"checked":""}><span class="slider"></span></label></div>`}
function renderOverviewDevices(){$("#overviewDeviceList").innerHTML=state.devices.slice(0,4).map(deviceRow).join("");bindDeviceToggles()}
function deviceCard(d){return `<article class="device-card"><div class="device-card-head"><div class="device-symbol ${d.type}">${d.icon}</div><span class="device-online ${d.on?"":"offline"}">${d.on?"Active":"Standby"}</span></div><h3>${escapeHTML(d.name)}</h3><p>${escapeHTML(d.room)} · ${escapeHTML(d.detail)}</p><div class="device-card-bottom"><small>${d.on?"Currently on":"Currently off"}</small><label class="switch" aria-label="Toggle ${escapeHTML(d.name)}"><input type="checkbox" data-device-toggle="${d.id}" ${d.on?"checked":""}><span class="slider"></span></label></div></article>`}
function renderDevices(){const q=($("#deviceSearch")?.value||"").toLowerCase();const list=state.devices.filter(d=>(currentFilter==="All"||(currentFilter==="On"?d.on:!d.on))&&`${d.name} ${d.room} ${d.detail}`.toLowerCase().includes(q));$("#allDevicesGrid").innerHTML=list.length?list.map(deviceCard).join():'<div class="empty-state">No devices match that search. Try another name or filter.</div>';$("#deviceCount").textContent=state.devices.length;$("#allDeviceNum").textContent=state.devices.length;bindDeviceToggles()}
function bindDeviceToggles(){$$("[data-device-toggle]").forEach(input=>input.addEventListener("change",()=>{const d=state.devices.find(x=>x.id===Number(input.dataset.deviceToggle));if(!d)return;d.on=input.checked;saveState();addActivity(`${d.name} switched ${d.on?"on":"off"}`,`${d.room} · Local preview control`);renderAll();toast(`${d.name} is now ${d.on?"on":"off"}.`)}))}
function routineLine(r){return `<div class="routine-line"><div class="routine-icon">${r.icon||"✳"}</div><div><strong>${escapeHTML(r.name)}</strong><small>${escapeHTML(r.trigger)}</small></div><label class="switch" aria-label="Toggle ${escapeHTML(r.name)}"><input type="checkbox" data-routine-toggle="${r.id}" ${r.on?"checked":""}><span class="slider"></span></label></div>`}
function routineCard(r){return `<article class="routine-card"><div class="routine-card-head"><div class="routine-card-icon">${r.icon||"✳"}</div><label class="switch" aria-label="Toggle ${escapeHTML(r.name)}"><input type="checkbox" data-routine-toggle="${r.id}" ${r.on?"checked":""}><span class="slider"></span></label></div><h3>${escapeHTML(r.name)}</h3><p>${escapeHTML(r.description||"A custom home routine.")}</p><div class="routine-detail"><span>◷</span><span>${escapeHTML(r.trigger)}</span></div><div class="routine-detail"><span>↗</span><span>${escapeHTML(r.action)}</span></div><div class="routine-card-foot"><small>${r.on?"Routine enabled":"Routine paused"}</small><span class="subtle-count">#${String(r.id).padStart(2,"0")}</span></div></article>`}
function renderRoutines(){$("#overviewRoutineList").innerHTML=state.routines.slice(0,3).map(routineLine).join("")||'<p class="empty-state">No routines yet.</p>';$("#allRoutinesGrid").innerHTML=state.routines.map(routineCard).join("")||'<div class="empty-state">No routines yet. Create your first one.</div>';$("#routineCountLabel").textContent=`${state.routines.length} routine${state.routines.length===1?"":"s"}`;$("#activeAutomationCount").textContent=state.routines.filter(r=>r.on).length;bindRoutineToggles()}
function bindRoutineToggles(){$$("[data-routine-toggle]").forEach(input=>input.addEventListener("change",()=>{const r=state.routines.find(x=>x.id===Number(input.dataset.routineToggle));if(!r)return;r.on=input.checked;saveState();addActivity(`${r.name} ${r.on?"enabled":"paused"}`,"Routine status · Local preview");renderRoutines();toast(`${r.name} ${r.on?"enabled":"paused"}.`)}))}
function renderActivity(){$("#activityList").innerHTML=state.activity.length?state.activity.map(a=>`<div class="activity-entry"><div class="activity-entry-icon ${a.warning?"warning":""}">${a.icon||"✳"}</div><div class="activity-entry-main"><strong>${escapeHTML(a.title)}</strong><p>${escapeHTML(a.description||"")}</p></div><time>${escapeHTML(a.time)}</time></div>`).join(""):'<div class="empty-state">Your timeline is clear. Device and routine actions will appear here.</div>';$("#activityTotal").textContent=state.activity.length}
function renderAll(){renderOverviewDevices();renderRoutines();renderDevices();renderActivity();updateSensorUnits();$("#deviceCount").textContent=state.devices.length}
function updateSensorUnits(){const v=fmtTemp(24.2);$("#tempValue").textContent=v;$("#sensorTemp").textContent=v;$("#tempValue").nextElementSibling.textContent=tempUnit();$("#sensorTemp").nextElementSibling.textContent=tempUnit()}
function openRoutineModal(prefill){$("#routineForm").reset();if(prefill){$("#routineName").value=prefill.name;$("#routineTrigger").value=prefill.trigger;$("#routineAction").value=prefill.action}$("#modalBackdrop").hidden=false;setTimeout(()=>$("#routineName").focus(),50)}
function closeModal(){$("#modalBackdrop").hidden=true}
function bindModal(){$("#newRoutineButton").addEventListener("click",()=>openRoutineModal());$("#addRoutineButton")?.addEventListener("click",()=>openRoutineModal());$("#modalClose").addEventListener("click",closeModal);$("#modalCancel").addEventListener("click",closeModal);$("#modalBackdrop").addEventListener("click",e=>{if(e.target===$("#modalBackdrop"))closeModal()});document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});$("#routineForm").addEventListener("submit",e=>{e.preventDefault();const name=$("#routineName").value.trim();if(!name)return;const r={id:state.nextId++,name,icon:$("#routineTrigger").value.includes("dark")?"☾":$("#routineTrigger").value.includes("motion")?"⌁":"✳",description:"A custom routine for your space.",trigger:$("#routineTrigger").value,action:$("#routineAction").value,on:true};state.routines.push(r);saveState();addActivity(`Routine created: ${name}`,`${r.trigger} · Local preview`);closeModal();renderAll();setPage("automation");toast("Your new routine has been saved.")})}
function bindFilters(){$$("#deviceFilters .filter-tab").forEach(b=>b.addEventListener("click",()=>{currentFilter=b.dataset.filter;$$(".filter-tab").forEach(t=>t.classList.toggle("selected",t===b));renderDevices()}));$("#deviceSearch").addEventListener("input",renderDevices)}
function bindSettings(){$("#homeNameInput").value=state.settings.homeName;$("#unitSelect").value=state.settings.unit;$("#comfortNotifications").checked=state.settings.comfort;$("#saveSettingsButton").addEventListener("click",()=>{state.settings.homeName=$("#homeNameInput").value.trim()||"My home";state.settings.unit=$("#unitSelect").value;state.settings.comfort=$("#comfortNotifications").checked;saveState();updateSensorUnits();$("#settingsSaved").textContent="Saved just now";$("#pageCrumb").textContent="Settings";toast("Preferences saved in this browser.")});$("#settingsDataTab").addEventListener("click",()=>showSettingsInfo("Data & privacy","Your device toggles, routines, preferences, and activity are stored in this browser using localStorage. No account or external service is connected in this demo."));$("#settingsAboutTab").addEventListener("click",()=>showSettingsInfo("About this preview","Haven is a front-end prototype inspired by your IoT smart-home literature review. Real sensor readings, remote access, authentication, MQTT, and hardware control require a backend and compatible devices."));$("#resetDemoButton").addEventListener("click",()=>{if(!confirm("Reset all Haven preview data to its original demo state?"))return;state=clone(initialState);saveState();bindSettingsValues();renderAll();toast("Preview data has been reset.")})}
function bindSettingsValues(){$("#homeNameInput").value=state.settings.homeName;$("#unitSelect").value=state.settings.unit;$("#comfortNotifications").checked=state.settings.comfort}
function showSettingsInfo(title,copy){const content=$("#settingsContent");content.innerHTML=`<div class="settings-section"><span class="settings-kicker">HAVEN PREVIEW</span><h3>${escapeHTML(title)}</h3><p style="line-height:1.9">${escapeHTML(copy)}</p><button class="secondary-button" id="backSettings">← Back to preferences</button></div>`;$("#backSettings").addEventListener("click",()=>location.reload());$$(".settings-tab").forEach(t=>t.classList.toggle("active",t.id=== (title==="Data & privacy"?"settingsDataTab":"settingsAboutTab")))}
function bindOtherActions(){$("#quickScene").addEventListener("click",()=>{let changed=0;state.devices.forEach(d=>{if(d.type==="light"||d.type==="lamp"){if(!d.on){d.on=true;changed++}}else if(d.type==="climate"&&d.on){d.on=false;changed++}});saveState();addActivity("Evening scene applied","Lights on · Climate control off · Local preview");renderAll();toast(changed?`Evening scene applied. ${changed} device${changed===1?"":"s"} updated.`:"Evening scene is already set.")});$("#suggestRoutineButton").addEventListener("click",()=>openRoutineModal({name:"Calm evening",trigger:"At a set time",action:"Switch off non-essential devices"}));$("#addDeviceButton").addEventListener("click",()=>toast("Hardware pairing isn't available in this front-end preview. See Research insights for the proposed connection architecture."));$("#openNotifications").addEventListener("click",()=>setPage("activity"));$("#clearActivityButton").addEventListener("click",()=>{if(!state.activity.length)return toast("Your activity timeline is already clear.");state.activity=[];saveState();renderActivity();toast("Activity timeline cleared.")});$("#dismissNote").addEventListener("click",()=>$(".bottom-note").remove())}
function setDate(){const d=new Date();$("#todayLabel").textContent=new Intl.DateTimeFormat("en-IN",{weekday:"long",day:"numeric",month:"long"}).format(d)}
function init(){navigateEvents();bindFilters();bindModal();bindSettings();bindOtherActions();setDate();renderAll();$("#deviceCount").textContent=state.devices.length}
init();
// Location-aware weather and three-house thermal comparison.
// Outdoor values come from Open-Meteo; indoor room values are clearly labelled model estimates.
let activeLocation={name:'Bengaluru, Karnataka',latitude:12.9716,longitude:77.5946};
let latestWeather=null;
const roomOffsets={Kitchen:2.2,'Living room':0,Bedroom:-1.4,Bathroom:-0.5};
const houseProfiles=[
  {id:'full',name:'House A · Fully IoT integrated',tag:'FULL IOT',description:'Smart thermostat, automated fans, blinds and room sensors.',factor:.18,bias:-.2,roomFactor:.42,accent:'full'},
  {id:'none',name:'House B · Non-IoT home',tag:'NO IOT',description:'No automated climate control; rooms respond more to outdoor conditions.',factor:.78,bias:.8,roomFactor:1,accent:'none'},
  {id:'partial',name:'House C · Partially IoT integrated',tag:'PARTIAL IOT',description:'Selected smart appliances and basic temperature automation.',factor:.46,bias:.3,roomFactor:.72,accent:'partial'}
];
const roomNames=['Kitchen','Living room','Bedroom','Bathroom'];
function roomTempFor(profile,room,outdoorMean){
  const indoorBase=24+(outdoorMean-24)*profile.factor+profile.bias;
  const roomOffset=roomOffsets[room]*profile.roomFactor;
  return Math.max(12,Math.min(39,indoorBase+roomOffset));
}
function renderHouseComparison(weather){
  if(!weather)return;
  const mean=(weather.min+weather.max)/2;
  const grid=document.getElementById('houseComparisonGrid');if(!grid)return;
  grid.innerHTML=houseProfiles.map(profile=>{
    const values=roomNames.map(room=>({room,temp:roomTempFor(profile,room,mean)}));
    const avg=values.reduce((sum,item)=>sum+item.temp,0)/values.length;
    return `<article class="house-comparison-card ${profile.accent}"><div class="house-card-top"><div><span class="house-tag">${profile.tag}</span><h3>${profile.name}</h3></div><strong class="house-average">${avg.toFixed(1)}°C<small>avg indoor</small></strong></div><p class="house-description">${profile.description}</p><div class="house-room-grid">${values.map(item=>`<div class="house-room-value"><span>${item.room}</span><strong>${fmtTemp(item.temp)}${tempUnit()}</strong></div>`).join('')}</div><div class="house-card-foot"><span>Outdoor mean · ${mean.toFixed(1)}°C</span><span>Model estimate</span></div></article>`;
  }).join('');
  // The single-house blueprint mirrors the fully IoT house for room selection.
  const full=houseProfiles[0];roomNames.forEach(room=>{if(!climateHeld.has(room))roomTemperatures[room]=roomTempFor(full,room,mean)});renderRoomTemperatures();
}
const climateHeld=new Set();
const roomTemperatures={Kitchen:29,'Living room':24,Bedroom:22.5,Bathroom:23.5};
function renderRoomTemperatures(){
  const ids={Kitchen:'roomKitchen','Living room':'roomLiving',Bedroom:'roomBedroom',Bathroom:'roomBathroom'};
  Object.entries(roomTemperatures).forEach(([room,value])=>{const el=document.getElementById(ids[room]);if(el)el.textContent=`${fmtTemp(value)}${tempUnit()}`});
  const living=fmtTemp(roomTemperatures['Living room']);['tempValue','sensorTemp'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=living});
  const selected=document.querySelector('.bp-sensor.selected')?.dataset.room||'Kitchen';
  const info=document.getElementById('selectedRoomInfo');if(info)info.textContent=`Fully IoT house · ${selected} · ${fmtTemp(roomTemperatures[selected])}${tempUnit()} · modelled estimate, not a physical sensor.`;
}
function selectRoom(room){
  document.querySelectorAll('.bp-sensor,#roomReadings button,.bp-room-hit').forEach(el=>el.classList.toggle('selected',el.dataset.room===room));
  const info=document.getElementById('selectedRoomInfo');if(info)info.textContent=`Fully IoT house · ${room} · ${fmtTemp(roomTemperatures[room])}${tempUnit()} · modelled estimate, not a physical sensor.`;
}
function initBlueprint(){
  document.querySelectorAll('.bp-sensor,#roomReadings button,.bp-room-hit').forEach(el=>{
    const room=el.dataset.room;
    el.addEventListener('click',()=>selectRoom(room));
    el.addEventListener('pointerenter',()=>selectRoom(room));
    el.addEventListener('pointerleave',()=>{const focused=document.activeElement;if(!focused?.dataset?.room)selectRoom(document.querySelector('.bp-sensor.selected')?.dataset.room||'Kitchen')});
    el.addEventListener('focus',()=>selectRoom(room));
    if(el.classList.contains('bp-sensor'))el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectRoom(room)}});
  });
  selectRoom('Kitchen');renderRoomTemperatures();
}
async function fetchWeatherForLocation(location){
  const url=`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&daily=temperature_2m_min,temperature_2m_max&forecast_days=1&timezone=auto`;
  const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw new Error('Weather service unavailable');
  const data=await response.json();const c=data.current;const min=data.daily?.temperature_2m_min?.[0];const max=data.daily?.temperature_2m_max?.[0];
  if(typeof c?.temperature_2m!=='number'||typeof min!=='number'||typeof max!=='number')throw new Error('Weather values unavailable');
  return {current:c.temperature_2m,humidity:c.relative_humidity_2m,wind:c.wind_speed_10m,code:c.weather_code,time:c.time,min,max};
}
function weatherDescription(code){return ({0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Fog',48:'Depositing rime fog',51:'Light drizzle',53:'Drizzle',55:'Dense drizzle',61:'Light rain',63:'Moderate rain',65:'Heavy rain',80:'Rain showers',81:'Moderate rain showers',82:'Heavy rain showers',95:'Thunderstorm'})[code]||'Current conditions'}
function updateMapLocation(name){
  const query=encodeURIComponent(name);const frame=document.getElementById('havenMapFrame');if(frame)frame.src=`https://maps.google.com/maps?q=${query}&t=&z=11&ie=UTF8&iwloc=&output=embed`;
  const link=document.getElementById('mapOpenLink');if(link)link.href=`https://www.google.com/maps/search/?api=1&query=${query}`;
  const subtitle=document.getElementById('locationSubtitle');if(subtitle)subtitle.textContent=`${name} · Live outdoor weather and map`;
  const label=document.getElementById('weatherLocationLabel');if(label)label.textContent=`${name.toUpperCase()} OUTDOORS`;
}
async function applyLocation(location){
  const source=document.getElementById('weatherSource');const status=document.getElementById('locationSearchStatus');
  if(source){source.textContent='WEATHER LOADING';source.classList.remove('live-weather')}
  if(status)status.textContent=`Loading live weather for ${location.name}…`;
  try{
    const weather=await fetchWeatherForLocation(location);activeLocation=location;latestWeather=weather;
    document.getElementById('outdoorTemp').textContent=weather.current.toFixed(1);
    document.getElementById('outdoorHumidity').textContent=`${weather.humidity}%`;
    document.getElementById('outdoorWind').textContent=`${weather.wind} km/h`;
    document.getElementById('outdoorCondition').textContent=weatherDescription(weather.code);
    document.getElementById('outdoorLow').textContent=`${weather.min.toFixed(1)}°C`;
    document.getElementById('outdoorHigh').textContent=`${weather.max.toFixed(1)}°C`;
    document.getElementById('weatherUpdated').textContent=`Updated ${new Date(weather.time).toLocaleString('en-IN',{hour:'2-digit',minute:'2-digit'})} · Open-Meteo`;
    if(source){source.textContent='LIVE WEATHER';source.classList.add('live-weather')}
    if(status)status.textContent=`Showing weather and house estimates for ${location.name}.`;
    updateMapLocation(location.name);renderHouseComparison(weather);if(typeof refreshClimateUI==='function')refreshClimateUI();
  }catch(error){
    if(status)status.textContent=`Could not load weather for ${location.name}. Check the spelling or try another location.`;
    if(source)source.textContent='OFFLINE';
    document.getElementById('outdoorCondition').textContent='Live weather unavailable. No replacement values have been invented.';
    document.getElementById('weatherUpdated').textContent='Weather unavailable';
  }
}
const suggestionBox=document.getElementById('locationSuggestions');
let suggestionTimer=null;let suggestionRequest=0;let latestSuggestions=[];
function hideLocationSuggestions(){if(suggestionBox){suggestionBox.hidden=true;suggestionBox.innerHTML=''}latestSuggestions=[]}
function renderLocationSuggestions(places){
  latestSuggestions=places||[];
  if(!suggestionBox)return;
  if(!latestSuggestions.length){hideLocationSuggestions();return}
  suggestionBox.innerHTML=latestSuggestions.map((place,index)=>{
    const label=[place.name,place.admin1,place.country].filter(Boolean).join(', ');
    return `<button type="button" class="location-suggestion" role="option" data-suggestion-index="${index}"><strong>${escapeHTML(place.name)}</strong><span>${escapeHTML([place.admin1,place.country].filter(Boolean).join(' · '))}</span></button>`;
  }).join('');
  suggestionBox.hidden=false;
  suggestionBox.querySelectorAll('[data-suggestion-index]').forEach(button=>button.addEventListener('click',()=>chooseLocationSuggestion(Number(button.dataset.suggestionIndex))));
}
async function geocodePlaces(query,count=8){
  const url=`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=${count}&language=en&format=json`;
  const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw new Error('Location search failed');
  const data=await response.json();return (data.results||[]).sort((a,b)=>{
    const q=query.toLowerCase();const an=(a.name||'').toLowerCase(),bn=(b.name||'').toLowerCase();
    const ap=an===q?0:an.startsWith(q)?1:2,bp=bn===q?0:bn.startsWith(q)?1:2;
    return ap-bp||(b.population||0)-(a.population||0);
  });
}
async function loadLocationSuggestions(query){
  const request=++suggestionRequest;
  try{const places=await geocodePlaces(query,10);if(request!==suggestionRequest)return;renderLocationSuggestions(places)}
  catch(_){if(request===suggestionRequest)hideLocationSuggestions()}
}
async function chooseLocationSuggestion(index){
  const place=latestSuggestions[index];if(!place)return;
  hideLocationSuggestions();const label=[place.name,place.admin1,place.country].filter(Boolean).join(', ');
  const input=document.getElementById('locationSearch');if(input)input.value=place.name;
  await applyLocation({name:label,latitude:place.latitude,longitude:place.longitude});
}
async function searchLocation(query){
  const status=document.getElementById('locationSearchStatus');if(status)status.textContent='Finding matching places…';
  const places=await geocodePlaces(query,10);const place=places[0];
  if(!place)throw new Error('No matching place found');
  const label=[place.name,place.admin1,place.country].filter(Boolean).join(', ');
  hideLocationSuggestions();await applyLocation({name:label,latitude:place.latitude,longitude:place.longitude});
}
const locationInput=document.getElementById('locationSearch');
locationInput?.addEventListener('input',()=>{
  clearTimeout(suggestionTimer);const query=locationInput.value.trim();
  if(query.length<2){hideLocationSuggestions();return}
  if(suggestionBox){suggestionBox.hidden=false;suggestionBox.innerHTML='<div class="suggestion-loading">Searching places…</div>'}
  suggestionTimer=setTimeout(()=>loadLocationSuggestions(query),250);
});
locationInput?.addEventListener('keydown',e=>{
  if(e.key==='Escape')hideLocationSuggestions();
  if(e.key==='ArrowDown'&&!suggestionBox?.hidden){e.preventDefault();suggestionBox.querySelector('button')?.focus()}
});
document.addEventListener('click',e=>{if(!e.target.closest('.location-search-form'))hideLocationSuggestions()});
document.getElementById('locationSearchForm')?.addEventListener('submit',async e=>{
  e.preventDefault();const input=document.getElementById('locationSearch');const button=document.getElementById('locationSearchButton');const query=input.value.trim();if(!query)return;
  if(latestSuggestions.length){await chooseLocationSuggestion(0);return}
  button.disabled=true;button.textContent='Searching…';
  try{await searchLocation(query)}catch(error){document.getElementById('locationSearchStatus').textContent=error.message==='No matching place found'?'No matching location found. Try another spelling.':'Location search failed. Check your connection and try again.'}
  finally{button.disabled=false;button.textContent='Search location'}
});
document.getElementById('refreshWeather')?.addEventListener('click',()=>applyLocation(activeLocation));
/* ===== Room climate control + hardware bridge =====
   Virtual circuit mirrors the Tinkercad build (hardware/): same rule, same serial messages.
   App -> hardware : OUT=25.0;SET=19;MODE=AUTO     (MODE=OFF stops the AC)
   Hardware -> app : TEMP=28.4;AC=ON;SET=19;MODE=AUTO                                   */
const climate={min:15,max:19,hyst:.5,coolPerTick:.35,leak:.012,tickMs:500,room:'Living room',target:null,outdoor:null,active:false,acOn:false,reached:false,timer:null,n:0,port:null,writer:null,reader:null,lastCmd:''};
const cEl=id=>document.getElementById(id);
function cSet(id,v){const e=cEl(id);if(e)e.textContent=v}
function climateOutdoor(){
  const raw=(cEl('climateOutdoor')?.value||'').trim();
  if(raw!==''&&!isNaN(parseFloat(raw)))return{value:parseFloat(raw),src:'manual'};
  if(latestWeather&&typeof latestWeather.current==='number')return{value:latestWeather.current,src:'live weather'};
  return null;
}
// Hotter day -> slightly lower target, always inside the 15-19 band (25C->19, 30C->17, 35C->15).
function suggestTarget(out){const pref=cEl('climatePref')?.value;if(pref&&pref!=='auto')return parseInt(pref,10);return Math.round(Math.max(climate.min,Math.min(climate.max,climate.max-(out-25)*.4)))}
function buildCommand(out,target){return`OUT=${out.toFixed(1)};SET=${target};MODE=AUTO`}
function hwLog(dir,text){
  const box=cEl('hwLog');if(!box)return;
  const row=document.createElement('div');row.className='hw-line '+dir.toLowerCase();
  row.textContent=`${new Date().toLocaleTimeString('en-IN',{hour12:false})}  ${dir==='TX'?'App → HW':'HW → App'}  ${text}`;
  box.appendChild(row);while(box.children.length>60)box.firstChild.remove();box.scrollTop=box.scrollHeight;
}
function sendToHardware(line){
  climate.lastCmd=line;cSet('hwCmd',line);hwLog('TX',line);
  if(climate.writer)climate.writer.write(line+'\n').catch(()=>{});
}
function syncClimateDevice(){
  const d=state.devices.find(x=>x.type==='climate');
  if(d&&d.on!==climate.acOn){d.on=climate.acOn;saveState();renderAll()}
}
function setAC(on){if(climate.acOn===on)return;climate.acOn=on;syncClimateDevice()}
// Virtual controller: identical to the Arduino sketch (relay ON above target+0.5, OFF at target).
function virtualControllerTick(){
  const room=climate.room;let t=roomTemperatures[room];
  t+=(climate.outdoor-t)*climate.leak;if(climate.acOn)t-=climate.coolPerTick;
  roomTemperatures[room]=t;
  if(!climate.acOn&&t>climate.target+climate.hyst)setAC(true);
  else if(climate.acOn&&t<=climate.target)setAC(false);
  if(!climate.reached&&t<=climate.target+climate.hyst){
    climate.reached=true;toast(`${room} reached ${climate.target}°C. Holding.`);
    addActivity('Room temperature reached',`${room} · target ${climate.target}°C · AC holding`);
  }
  if(++climate.n%2===0)hwLog('RX',`TEMP=${t.toFixed(1)};AC=${climate.acOn?'ON':'OFF'};SET=${climate.target};MODE=AUTO`);
  refreshClimateUI();
}

// Plain-language description of a temperature in Celsius.
function feelOf(c){
  if(c<15)return{label:'Cold',cls:'cold'};
  if(c<20)return{label:'Comfortable',cls:'comfy'};
  if(c<25)return{label:'Warm',cls:'warm'};
  if(c<30)return{label:'Hot',cls:'hot'};
  return{label:'Very hot',cls:'hot'};
}
function refreshFeelSummary(){
  const o=climateOutdoor();const t=roomTemperatures[climate.room];
  const place=(activeLocation?.name||'your city').split(',')[0].toUpperCase();
  const badge=(id,f)=>{const e=cEl(id);if(e){e.textContent=f.label;e.className='feel-badge '+f.cls}};
  cSet('feelOutPlace',`OUTSIDE · ${place}`);cSet('feelInPlace',`INSIDE · ${climate.room.toUpperCase()}`);
  if(o){
    const f=feelOf(o.value);cSet('feelOutTemp',`${o.value.toFixed(1)}°C`);badge('feelOutBadge',f);
    cSet('feelOutText',`It is ${o.value.toFixed(1)}°C outside in ${activeLocation?.name||'your city'}. That feels ${f.label.toLowerCase()}${o.src==='manual'?' (simulated value)':''}.`);
  }else{cSet('feelOutTemp','--°C');cSet('feelOutText','Live weather not loaded yet.')}
  const fi=feelOf(t);cSet('feelInTemp',`${t.toFixed(1)}°C`);badge('feelInBadge',fi);
  let advice;
  if(climate.active&&climate.acOn)advice=`AC is cooling the room down to ${climate.target}°C.`;
  else if(climate.active)advice=`Target reached. AC is holding around ${climate.target}°C.`;
  else if(t>climate.max)advice=`${t.toFixed(1)}°C is ${fi.label.toLowerCase()} and above the 15–19°C comfort band. Press Adjust room temperature.`;
  else if(t<climate.min)advice=`The room is ${fi.label.toLowerCase()}. Cooling is not needed.`;
  else advice='The room is already within the comfort band.';
  cSet('feelInText',advice);
  if(climate.active&&climate.target!=null)cSet('feelGoalTemp',`${climate.target}°C`);
  else cSet('feelGoalTemp',cEl('climatePref')?.value&&cEl('climatePref').value!=='auto'?`${cEl('climatePref').value}°C`:'15–19°C');
}
async function useMyLocation(){
  if(!navigator.geolocation){toast('This browser cannot share your location.');return}
  toast('Allow location access to use your current city…');
  navigator.geolocation.getCurrentPosition(async pos=>{
    const{latitude,longitude}=pos.coords;let name='Your location';
    try{
      const r=await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
      const j=await r.json();name=[j.city||j.locality,j.principalSubdivision,j.countryName].filter(Boolean).join(', ')||name;
    }catch(e){}
    await applyLocation({name,latitude,longitude});toast(`Using ${name}`);
  },()=>toast('Location permission was denied. Search for your city instead.'),{timeout:10000});
}
cEl('useMyLocation')?.addEventListener('click',useMyLocation);
cEl('climateOutdoor')?.addEventListener('input',()=>refreshClimateUI());
cEl('climatePref')?.addEventListener('change',()=>refreshClimateUI());
function refreshClimateUI(){
  const t=roomTemperatures[climate.room];const unit=tempUnit();
  const atTarget=climate.active&&!climate.acOn&&t<=climate.target+climate.hyst;
  renderRoomTemperatures();refreshFeelSummary();
  cSet('climateNow',`${fmtTemp(t)}${unit}`);
  cSet('climateTarget',climate.target!=null&&climate.active?`${fmtTemp(climate.target)}${unit}`:'--');
  cSet('climateAC',!climate.active?'OFF':climate.acOn?'COOLING':'HOLDING');
  cSet('hwSensor',`${fmtTemp(t)}${unit}`);
  cSet('hwLcd1',`T:${t.toFixed(1)}C SET:${climate.active?climate.target:'--'}C`.padEnd(16));
  cSet('hwLcd2',(climate.acOn?'AC:ON  COOLING':climate.active?'AC:OFF HOLDING':'AC:OFF  IDLE').padEnd(16));
  const relay=cEl('hwRelay');if(relay){relay.textContent=climate.acOn?'ON':'OFF';relay.classList.toggle('on',climate.acOn)}
  cEl('hwFan')?.classList.toggle('spin',climate.acOn);
  cEl('hwLedCool')?.classList.toggle('on',climate.acOn);
  cEl('hwLedOk')?.classList.toggle('on',atTarget);
  cEl('hwVane')?.setAttribute('transform',`rotate(${climate.acOn?-50:0} 592 244)`);
}
function adjustRoomTemperature(){
  const o=climateOutdoor();
  if(!o){toast('Outdoor temperature not loaded yet. Type a value (for example 25) or refresh the weather.');return}
  const room=cEl('climateRoom')?.value||'Living room';
  if(o.value<climate.min){cSet('climateStatus',`Outdoor is ${o.value.toFixed(1)}°C, below the ${climate.min}°C band, so AC cooling is not needed.`);return}
  clearInterval(climate.timer);climate.timer=null;
  if(room!==climate.room)climateHeld.delete(climate.room);
  climate.room=room;climate.outdoor=o.value;climate.target=suggestTarget(o.value);
  climate.active=true;climate.reached=false;climate.n=0;climateHeld.add(room);
  const start=roomTemperatures[room];
  cSet('climateStatus',`Outdoor ${o.value.toFixed(1)}°C (${o.src}) → target ${climate.target}°C for the ${room.toLowerCase()}. Room is ${start.toFixed(1)}°C, so the AC will run until it reaches the target.`);
  addActivity('Room temperature adjustment started',`${room} · ${start.toFixed(1)}°C → ${climate.target}°C · outdoor ${o.value.toFixed(1)}°C`);
  sendToHardware(buildCommand(o.value,climate.target));
  if(climate.port){refreshClimateUI();return}   // real Arduino reports back over USB
  virtualControllerTick();
  climate.timer=setInterval(virtualControllerTick,climate.tickMs);
}
function stopClimate(){
  clearInterval(climate.timer);climate.timer=null;
  if(climate.active)sendToHardware('MODE=OFF');
  climate.active=false;setAC(false);climateHeld.delete(climate.room);
  if(latestWeather)renderHouseComparison(latestWeather);
  refreshClimateUI();cSet('climateStatus','AC off. Room returns to its modelled estimate.');
  addActivity('AC switched off','Climate control · manual stop');
}
function handleHardwareLine(line){
  if(!line)return;hwLog('RX',line);
  const kv=Object.fromEntries(line.split(';').map(p=>p.split('=')).filter(p=>p.length===2));
  const t=parseFloat(kv.TEMP);
  if(!isNaN(t)){roomTemperatures[climate.room]=t;climateHeld.add(climate.room)}
  if(kv.AC){climate.acOn=kv.AC==='ON';syncClimateDevice()}
  if(kv.SET)climate.target=parseFloat(kv.SET);
  if(kv.MODE)climate.active=kv.MODE==='AUTO';
  refreshClimateUI();
}
async function readSerialLoop(){
  let buf='';
  try{while(true){const{value,done}=await climate.reader.read();if(done)break;buf+=value;let i;while((i=buf.indexOf('\n'))>=0){handleHardwareLine(buf.slice(0,i).trim());buf=buf.slice(i+1)}}}catch(e){}
}
async function toggleSerial(){
  const btn=cEl('hwConnect');
  if(climate.port){
    try{await climate.reader?.cancel();await climate.writer?.close();await climate.port.close()}catch(e){}
    climate.port=climate.writer=climate.reader=null;btn.textContent='Connect real Arduino (USB)';cSet('hwModeChip','VIRTUAL HARDWARE');return;
  }
  if(!('serial' in navigator)){toast('Web Serial needs Chrome or Edge on a desktop computer.');return}
  try{
    const port=await navigator.serial.requestPort();await port.open({baudRate:9600});
    const enc=new TextEncoderStream();enc.readable.pipeTo(port.writable);climate.writer=enc.writable.getWriter();
    const dec=new TextDecoderStream();port.readable.pipeTo(dec.writable);climate.reader=dec.readable.getReader();
    climate.port=port;clearInterval(climate.timer);climate.timer=null;
    btn.textContent='Disconnect Arduino';cSet('hwModeChip','USB HARDWARE LIVE');toast('Arduino connected. Press Adjust room temperature.');
    readSerialLoop();
  }catch(e){toast('Could not open the serial port.')}
}
cEl('adjustRoomTemp')?.addEventListener('click',adjustRoomTemperature);
cEl('stopClimate')?.addEventListener('click',stopClimate);
cEl('hwConnect')?.addEventListener('click',toggleSerial);
cEl('hwCopy')?.addEventListener('click',async()=>{
  const o=climateOutdoor();const cmd=climate.lastCmd||(o?buildCommand(o.value,suggestTarget(o.value)):'');
  if(!cmd){toast('Press Adjust room temperature first.');return}
  try{await navigator.clipboard.writeText(cmd);toast('Command copied. Paste it into the Tinkercad Serial Monitor.')}catch(e){toast(`Copy this: ${cmd}`)}
});
cEl('climateRoom')?.addEventListener('change',()=>{if(!climate.active){climate.room=cEl('climateRoom').value;refreshClimateUI()}});
refreshClimateUI();
initBlueprint();applyLocation(activeLocation);
setInterval(()=>{if(activeLocation)applyLocation(activeLocation)},15*60*1000);
