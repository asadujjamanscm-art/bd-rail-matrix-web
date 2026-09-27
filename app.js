const $=id=>document.getElementById(id);
const norm=s=>String(s||'').toLowerCase().replace(/[’']/g,"'").replace(/_/g,' ').replace(/\s+/g,' ').trim();
const aliases={'kishoreganj':'kishorganj','kishore gonj':'kishorganj','pakshi':'paksey','pakshi railway':'paksey','jessore':'jashore','comilla':'cumilla','commilla':'cumilla','kustia court':'kushtia court','kushtia_court':'kushtia court'};
let result=null, calendar=new Date(), chosen=null, currentMode='matrix', finderData=null, selectedFinderTrain=null;
function stationMatches(q){q=norm(q);const c=aliases[q]||q;return [...new Set(STATIONS)].filter(s=>!q||norm(s).includes(q)||norm(s).includes(c)).slice(0,30)}
function trainMatches(q){q=norm(q);return TRAINS.filter(([n,name])=>!q||String(n).includes(q)||norm(name).includes(q)).slice(0,30)}
function menu(input,box,items,onPick){box.innerHTML=items.map(x=>`<div class="item" data-v="${encodeURIComponent(x.v)}"><b>${x.title}</b>${x.sub?`<span>${x.sub}</span>`:''}</div>`).join('');box.classList.toggle('open',items.length>0);box.querySelectorAll('.item').forEach(el=>el.onclick=()=>{onPick(decodeURIComponent(el.dataset.v));box.classList.remove('open')})}
function chooseStation(field,value){$(field).value=value;if(field==='from'){$('to').focus();return}if(field==='to'){openDatePicker()}}
function selectOnFocus(input){input.addEventListener('focus',()=>{input.select(); if(input.id==='from')menu(input,$('fromMenu'),stationMatches('').map(v=>({v,title:v})),v=>chooseStation('from',v));if(input.id==='to')menu(input,$('toMenu'),stationMatches('').map(v=>({v,title:v})),v=>chooseStation('to',v));if(input.id==='train')showTrainMenu('')})}
selectOnFocus($('from'));selectOnFocus($('to'));selectOnFocus($('train'));
$('from').oninput=()=>menu($('from'),$('fromMenu'),stationMatches($('from').value).map(v=>({v,title:v})),v=>chooseStation('from',v));
$('to').oninput=()=>menu($('to'),$('toMenu'),stationMatches($('to').value).map(v=>({v,title:v})),v=>chooseStation('to',v));
function showTrainMenu(q){menu($('train'),$('trainMenu'),trainMatches(q).map(([n,name])=>({v:String(n),title:`${name} (${n})`,sub:trainDirection(n)||`Train number ${n}`})),v=>{const hit=TRAINS.find(([n])=>String(n)===v);$('train').value=hit?`${hit[1]} (${hit[0]})`:v;updateTrainInfo()})}
$('train').oninput=()=>{showTrainMenu($('train').value);updateTrainInfo()};
document.addEventListener('click',e=>{if(!e.target.closest('.combo'))document.querySelectorAll('.menu').forEach(x=>x.classList.remove('open'))});
function trainDirection(no){const d=typeof TRAIN_DIRECTIONS!=='undefined'?TRAIN_DIRECTIONS[String(no)]:null;return d?`${d[0]} → ${d[1]}`:''}
function updateTrainInfo(){const raw=$('train').value.trim();const m=raw.match(/\b\d{3,4}\b/);let no=m?.[0];if(!no){const n=norm(raw);const hit=TRAINS.find(([num,name])=>norm(name)===n||norm(name).includes(n)||n.includes(norm(name)));if(hit)no=String(hit[0])}if(no){const hit=TRAINS.find(([n])=>String(n)===no);$('trainInfo').textContent=hit?`${hit[1]} (${hit[0]})${trainDirection(no)?` • ${trainDirection(no)}`:''}`:`Train ${no}`;}else $('trainInfo').textContent='Type train number or name'}
function parsedTrain(){const raw=$('train').value.trim();const m=raw.match(/\b\d{3,4}\b/);if(m){const hit=TRAINS.find(([n])=>String(n)===m[0]);return {model:m[0],trip:hit?`${hit[1].toUpperCase()} (${m[0]})`:m[0],display:hit?`${hit[1]} (${m[0]})`:raw}}const n=norm(raw);const hit=TRAINS.find(([no,name])=>norm(name)===n||norm(name).includes(n)||n.includes(norm(name)));return hit?{model:String(hit[0]),trip:`${hit[1].toUpperCase()} (${hit[0]})`,display:`${hit[1]} (${hit[0]})`}:null}
function fmt(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function hero(d){return d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'2-digit',year:'numeric'})}
function renderCal(){const y=calendar.getFullYear(),m=calendar.getMonth();$('month').textContent=calendar.toLocaleDateString('en-US',{month:'long',year:'numeric'});$('heroYear').textContent=chosen?chosen.getFullYear():y;$('heroDate').textContent=chosen?hero(chosen):'Select journey date';const first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate();let h='';for(let i=0;i<first;i++)h+='<div class="empty"></div>';for(let d=1;d<=days;d++){const active=chosen&&chosen.getFullYear()===y&&chosen.getMonth()===m&&chosen.getDate()===d;h+=`<button class="day ${active?'active':''}" data-d="${d}">${d}</button>`}$('grid').innerHTML=h;$('grid').querySelectorAll('.day').forEach(b=>b.onclick=()=>{chosen=new Date(y,m,Number(b.dataset.d));$('date').value=fmt(chosen);$('datePicker').classList.remove('open');$('datePicker').setAttribute('aria-hidden','true')})}
function openDatePicker(){const cur=$('date').value?new Date($('date').value+'T00:00:00'):new Date();if(!chosen)chosen=cur;calendar=new Date(chosen);renderCal();$('datePicker').classList.add('open');$('datePicker').setAttribute('aria-hidden','false')}
$('date').onclick=openDatePicker;$('prev').onclick=()=>{calendar.setMonth(calendar.getMonth()-1);renderCal()};$('next').onclick=()=>{calendar.setMonth(calendar.getMonth()+1);renderCal()};$('datePicker').onclick=e=>{if(e.target===$('datePicker')){$('datePicker').classList.remove('open');$('datePicker').setAttribute('aria-hidden','true')}};
function setStatus(t,error=false){$('status').textContent=t;$('status').classList.toggle('error',error);$('status').classList.toggle('loading',!error && /^(Loading|Searching)/.test(t))}
function setLoading(on,label){const b=$('load');b.disabled=on;b.classList.toggle('is-loading',on);if(on){b.textContent=label||'LOADING LIVE DATA…'}else{b.textContent=currentMode==='matrix'?'SEAT MATRIX':'FIND TRAINS'}}
function render(data){result=data;$('result').hidden=false;$('finderResult').hidden=true;$('title').textContent=data.request.display;$('route').textContent=`${data.request.from} → ${data.request.to}`;$('loadedAt').textContent=`Updated ${new Date().toLocaleTimeString()}`;const classes=[...new Set(data.pairs.flatMap(p=>Object.keys(p.classes||{})))];$('cls').innerHTML='<option value="">All classes</option>'+classes.map(c=>`<option>${c}</option>`).join('');draw()}
function matrixStopMeta(name){
  const stops=result?.routeStops||[];
  const key=norm(name);
  const hit=stops.find(s=>norm(s.name||s.station||s.station_name||'')===key);
  if(!hit)return '';
  const isTo=key===norm(result.request.to);
  const time=isTo?(hit.arrival||hit.departure):(hit.departure||hit.arrival);
  const date=hit.date?displayDate(hit.date):'';
  if(!date&&!time)return '';
  return `<div class="matrixStationMeta">${date}${date&&time?' · ':''}${time||''}</div>`;
}
function draw(){if(!result)return;const cls=$('cls').value,filter=norm($('filter').value),pairs=result.pairs.filter(p=>!filter||norm(p.origin).includes(filter)||norm(p.dest).includes(filter));const stations=[...new Set(pairs.flatMap(p=>[p.origin,p.dest]))];const fromKey=norm(result.request.from),toKey=norm(result.request.to);let h='<div class="matrix"><table><thead><tr><th>STATION</th>'+stations.map(s=>`<th class="${norm(s)===toKey?'routeCol':''}">${s}</th>`).join('')+'</tr></thead><tbody>';for(const s of stations){const rowHi=norm(s)===fromKey;h+=`<tr class="${rowHi?'routeRow':''}"><td><div class="matrixStationName">${s}</div>${matrixStopMeta(s)}</td>`;for(const t of stations){const p=pairs.find(x=>x.origin===s&&x.dest===t);let val=0, classCount=0;if(p){const cs=cls&&p.classes[cls]?[p.classes[cls]]:Object.values(p.classes||{});val=cs.reduce((a,c)=>a+Number(c.total||0),0);classCount=cs.filter(c=>Number(c.total||0)>0).length}const classLabel=classCount===1?'class':'classes';const suffix=val&&classCount?` <small class="cellClasses">${classCount} ${classLabel}</small>`:(p&&Object.keys(p.classes||{}).length?` <small class="cellClasses">No available</small>`:'');const colHi=norm(t)===toKey;const intersect=rowHi&&colHi;const shown=val|| (p&&Object.keys(p.classes||{}).length?'0':'—');h+=`<td class="${colHi?'routeColCell':''}"><button type="button" class="cell ${val?'has':'zero'} ${intersect?'routeIntersection':''}" data-origin="${encodeURIComponent(s)}" data-dest="${encodeURIComponent(t)}" ${val?'':'disabled'}>${shown}${suffix}</button></td>`}h+='</tr>'}h+='</tbody></table></div>';$('matrix').innerHTML=h;$('matrix').querySelectorAll('.cell.has').forEach(b=>b.onclick=()=>openBreakdown(decodeURIComponent(b.dataset.origin),decodeURIComponent(b.dataset.dest)));}
function fmtFare(v){if(v===null||v===undefined||v==='')return '';const n=Number(String(v).replace(/[^0-9.]/g,''));return Number.isFinite(n)?`৳${n.toLocaleString('en-BD',{maximumFractionDigits:2})}`:String(v)}
function openBreakdown(origin,dest){const p=result?.pairs?.find(x=>x.origin===origin&&x.dest===dest);if(!p)return;const classes=Object.entries(p.classes||{}).map(([name,c])=>({name,...c,total:Number(c.total||0),online:Number(c.online||0),offline:Number(c.offline||0),fare:c.fare})).sort((a,b)=>b.total-a.total);const total=classes.reduce((a,c)=>a+c.total,0);$('breakdownTitle').textContent=`${origin} → ${dest}`;$('breakdownList').innerHTML=classes.length?classes.map(c=>{const fare=fmtFare(c.fare);return `<div class="breakdownRow"><div><b>${c.name}</b><small>${c.online} online · ${c.offline} offline</small>${fare?`<span class="breakdownFare">Fare ${fare}</span>`:''}</div><strong>${c.total}</strong></div>`}).join(''):'<div class="breakdownEmpty">No class breakdown available.</div>';$('breakdownTotal').textContent=total;$('breakdownModal').classList.add('open');$('breakdownModal').setAttribute('aria-hidden','false')}
function closeBreakdown(){$('breakdownModal').classList.remove('open');$('breakdownModal').setAttribute('aria-hidden','true')}
async function load(){const tr=parsedTrain(),from=$('from').value.trim(),to=$('to').value.trim(),date=$('date').value;if(!from||!to||!date||!tr){setStatus('Enter valid From, To, Date and Train.',true);return}result=null;$('result').hidden=true;$('matrix').innerHTML='';const specific=`${tr.display} • ${from} → ${to}`;setLoading(true,`LOADING ${tr.display.toUpperCase()}…`);setStatus(`Loading ${specific}…`);try{const q=new URLSearchParams({from,to,date,trainModel:tr.model,tripNumber:tr.trip,display:tr.display});const r=await fetch('/api/matrix?'+q);const j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'Matrix request failed');const d=j.data;const selected=selectedFinderTrain;const routeMatches=selected&&selected.stops?.length&&norm(selected.actualFrom||'')===norm(from)&&norm(selected.actualTo||'')===norm(to);d.routeStops=routeMatches?selected.stops:[];
    if(!d.routeStops.length){
      try{
        const fr=await fetch('/api/finder?'+new URLSearchParams({from,to,date}),{cache:'no-store'});
        const fj=await fr.json();
        if(fr.ok&&fj.ok){
          const hit=(fj.all||[]).find(x=>String(x.trainModel)===String(tr.model)&&norm(x.actualFrom||'')===norm(from)&&norm(x.actualTo||'')===norm(to));
          if(hit?.stops?.length)d.routeStops=hit.stops;
        }
      }catch(_){ }
    }
    render(d);setStatus('Live matrix loaded.')}catch(e){setStatus(e.message||'Unable to load matrix.',true)}finally{setLoading(false)}}
async function findTrains(){
  const from=$('from').value.trim(),to=$('to').value.trim(),date=$('date').value;
  if(!from||!to||!date){setStatus('Select From, To and Date.',true);return}
  if(norm(from)===norm(to)){setStatus('From and To must be different.',true);return}
  setLoading(true,'SEARCHING LIVE TRAINS…');
  setStatus('Searching live train routes…');
  try{
    const q=new URLSearchParams({from,to,date});
    const r=await fetch('/api/finder?'+q,{cache:'no-store'});
    const j=await r.json();
    if(!r.ok||!j.ok)throw new Error(j.error||'Train Finder request failed');
    finderData=j;
    renderFinder(finderData);
    setStatus(`Found ${finderData.all.length} train(s) from live route data.`);
  }catch(e){
    finderData=null;
    $('finderResult').hidden=false;
    $('finderRoute').textContent=`${from} → ${to}`;
    $('finderMeta').textContent='';
    $('outboundList').innerHTML='<div class="emptyFinder">Unable to load live train routes. Please try again.</div>';
    $('returnList').innerHTML='';
    setStatus(e.message||'Unable to load train routes.',true);
  }finally{setLoading(false)}
}
function esc(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function displayDate(v){if(!v)return '';const d=new Date(v+'T00:00:00');if(Number.isNaN(d.getTime()))return v;return d.toLocaleDateString('en-US',{day:'2-digit',month:'short'}).replace(/^0/,'')}
function renderFinder(data){
  $('result').hidden=true;$('finderResult').hidden=false;
  $('finderRoute').textContent=`${data.from} → ${data.to}`;
  const first=[...data.outbound].find(x=>x.fromTime)||data.outbound[0];
  const last=[...data.outbound].slice(-1)[0];
  $('finderMeta').innerHTML=`${esc(data.date)} • ${data.outbound.length} going · ${data.returning.length} return${first&&last&&first!==last?`<span class="finderRange"> · First ${esc(first.fromTime||'—')} · Last ${esc(last.fromTime||'—')}</span>`:''}`;
  $('outboundList').innerHTML=renderTrainCards(data.outbound);
  $('returnList').innerHTML=renderTrainCards(data.returning);
  document.querySelectorAll('.finderCard').forEach(card=>{
    const t=data.all.find(x=>String(x.trainModel)===card.dataset.model && x.direction===card.dataset.direction);
    card.onclick=()=>{if(t)selectFinderTrain(t)};
    const details=card.querySelector('.finderDetails');
    if(details)details.onclick=e=>{e.stopPropagation();if(t)openRouteDetails(t)};
  });
}
function renderTrainCards(list){
  if(!list.length)return '<div class="emptyFinder">No trains found.</div>';
  return list.map((t,i)=>{
    const first=i===0,last=i===list.length-1;
    const badges=`${first?'<span class="finderBadge first">FIRST</span>':''}${last&&!first?'<span class="finderBadge last">LAST</span>':''}`;
    const dateLine=t.fromDate&&t.toDate&&t.fromDate!==t.toDate
      ?`${displayDate(t.fromDate)} → ${displayDate(t.toDate)}`
      :displayDate(t.fromDate||t.toDate);
    const timeBlock=t.fromTime&&t.toTime
      ?`<div class="finderTimes"><b>${esc(t.fromTime)}</b><span>→</span><b>${esc(t.toTime)}</b>${t.duration?`<em>${esc(t.duration)}</em>`:''}</div>`
      :'<div class="finderTimes muted">Time not available</div>';
    return `<button type="button" class="finderCard" data-model="${esc(t.trainModel)}" data-direction="${esc(t.direction)}">
      <div class="trainIcon">🚆</div><div class="finderMain">
        <div class="finderName">${esc(t.name)} <span>(${esc(t.trainModel)})</span> ${badges}</div>
        <div class="finderRouteMini">${esc(t.actualFrom)} → ${esc(t.actualTo)}</div>
        ${timeBlock}${dateLine?`<div class="finderDate">${esc(dateLine)}</div>`:''}
      </div><span class="finderDetails" role="button" tabindex="0" title="View full route">›</span></button>`;
  }).join('');
}
function openRouteDetails(t){
  selectedFinderTrain=t;
  $('routeModalTitle').textContent=`${t.name} (${t.trainModel})`;
  $('routeModalRoute').textContent=`${t.actualFrom} → ${t.actualTo}`;
  $('routeModalMeta').textContent=`${t.fromTime||'—'} → ${t.toTime||'—'}${t.duration?` · ${t.duration}`:''}`;
  const selectedFrom=norm(t.actualFrom),selectedTo=norm(t.actualTo);
  const stops=t.stops||[];
  $('routeStops').innerHTML=stops.map((s,i)=>{
    const isStart=norm(s.name)===selectedFrom, isEnd=norm(s.name)===selectedTo;
    const date=s.date?displayDate(s.date):'';
    return `<div class="routeStop ${isStart?'selectedStart':''} ${isEnd?'selectedEnd':''}">
      <div class="routeRail"><span class="routeNode"></span>${i<stops.length-1?'<span class="routeLine"></span>':''}</div>
      <div class="routeStopBody"><div class="routeStopTop"><b>${esc(s.name)}</b>${isStart?'<span class="stationTag start">FROM</span>':''}${isEnd?'<span class="stationTag end">TO</span>':''}</div>
      <div class="routeStopTimes">${s.arrival?`<span><small>Arrival</small><strong>${esc(s.arrival)}</strong></span>`:''}${s.departure?`<span><small>Departure</small><strong>${esc(s.departure)}</strong></span>`:''}${date?`<span class="routeStopDate">${esc(date)}</span>`:''}</div></div>
    </div>`;
  }).join('')||'<div class="emptyFinder">Route timing data is not available.</div>';
  $('routeModal').classList.add('open');$('routeModal').setAttribute('aria-hidden','false');
}
function closeRouteDetails(){$('routeModal').classList.remove('open');$('routeModal').setAttribute('aria-hidden','true')}
async function selectFinderTrain(t){const actualFrom=t.actualFrom|| (t.direction==='RETURN'?t.queryTo:t.queryFrom);const actualTo=t.actualTo|| (t.direction==='RETURN'?t.queryFrom:t.queryTo);$('from').value=actualFrom;$('to').value=actualTo;$('train').value=`${t.name} (${t.trainModel})`;updateTrainInfo();setMode('matrix');setStatus(`Loading ${t.name} (${t.trainModel}) • ${actualFrom} → ${actualTo}…`);await load()}
function setMode(mode){currentMode=mode;document.querySelectorAll('.modeTab').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));$('trainField').style.display=mode==='matrix'?'':'none';$('load').textContent=mode==='matrix'?'SEAT MATRIX':'FIND TRAINS';$('result').hidden=mode!=='matrix'||!result;$('finderResult').hidden=mode!=='finder'||!finderData;if(mode==='finder')setStatus('Select From, To and Date.')}
document.querySelectorAll('.modeTab').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
$('load').onclick=()=>currentMode==='matrix'?load():findTrains();$('refresh').onclick=load;$('cls').onchange=draw;$('filter').oninput=draw;updateTrainInfo();setMode('matrix');

$('routeClose').onclick=closeRouteDetails;$('routeMatrixBtn').onclick=()=>{if(selectedFinderTrain){closeRouteDetails();selectFinderTrain(selectedFinderTrain)}};$('routeModal').onclick=e=>{if(e.target===$('routeModal'))closeRouteDetails()};
$('breakdownClose').onclick=closeBreakdown;$('breakdownModal').onclick=e=>{if(e.target===$('breakdownModal'))closeBreakdown()};
