// Live Train Finder route lookup.
// Uses the Shohoz Railway route endpoint to get the actual ordered stops,
// station times and day information for each train.

const MODELS = [
  701,702,703,704,705,706,707,708,709,710,711,712,713,714,715,716,717,718,719,720,
  721,722,723,724,725,726,727,728,729,730,731,732,733,734,735,736,737,738,739,740,
  741,742,743,744,745,746,747,748,749,750,751,752,753,754,755,756,757,758,759,760,
  761,762,763,764,765,766,767,768,769,770,771,772,773,774,775,776,777,778,779,780,
  781,782,783,784,785,786,787,788,789,790,791,792,793,794,795,796,797,798,799,800,
  801,802,803,804,805,806,807,808,809,810,811,812,813,814,815,816,817,818,819,820,
  821,822,823,824,825,826,827,828
];

const TRAIN_NAMES = {
  701:'Suborno Express',702:'Suborno Express',703:'Mohanagar Godhuli',704:'Mohanagar Provati',705:'Ekota Express',706:'Ekota Express',
  707:'Tista Express',708:'Tista Express',709:'Parabat Express',710:'Parabat Express',711:'Upakul Express',712:'Upakul Express',
  713:'Karatoya Express',714:'Karatoya Express',715:'Kapotaksha Express',716:'Kapotaksha Express',717:'Jayantika Express',718:'Jayantika Express',
  719:'Paharika Express',720:'Paharika Express',721:'Mohanagar Express',722:'Mohanagar Express',723:'Udayan Express',724:'Udayan Express',
  725:'Sundarban Express',726:'Sundarban Express',727:'Rupsha Express',728:'Rupsha Express',729:'Meghna Express',730:'Meghna Express',
  731:'Barendra Express',732:'Barendra Express',733:'Titumir Express',734:'Titumir Express',735:'Agnibina Express',736:'Agnibina Express',
  737:'Egarosindhur Provati',738:'Egarosindhur Provati',739:'Upaban Express',740:'Upaban Express',741:'Turna Express',742:'Turna Express',
  743:'Brahmaputra Express',744:'Brahmaputra Express',745:'Jamuna Express',746:'Jamuna Express',747:'Simanta Express',748:'Simanta Express',
  749:'Egarosindhur Godhuli',750:'Egarosindhur Godhuli',751:'Lalmoni Express',752:'Lalmoni Express',753:'Silk City Express',754:'Silk City Express',
  755:'Madhumati Express',756:'Madhumati Express',757:'Drutojan Express',758:'Drutojan Express',759:'Padma Express',760:'Padma Express',
  761:'Sagardari Express',762:'Sagardari Express',763:'Chitra Express',764:'Chitra Express',765:'Nilsagar Express',766:'Nilsagar Express',
  767:'Dolonchapa Express',768:'Dolonchapa Express',769:'Dhumketu Express',770:'Dhumketu Express',771:'Rangpur Express',772:'Rangpur Express',
  773:'Kalni Express',774:'Kalni Express',775:'Sirajganj Express',776:'Sirajganj Express',777:'Haor Express',778:'Haor Express',
  779:'Dhalarchar Express',780:'Dhalarchar Express',781:'Kishoreganj Express',782:'Kishoreganj Express',783:'Tungipara Express',784:'Tungipara Express',
  785:'Bijoy Express',786:'Bijoy Express',787:'Sonar Bangla Express',788:'Sonar Bangla Express',789:'Mohanganj Express',790:'Mohanganj Express',
  791:'Banalata Express',792:'Banalata Express',793:'Panchagarh Express',794:'Panchagarh Express',795:'Benapole Express',796:'Benapole Express',
  797:'Kurigram Express',798:'Kurigram Express',799:'Jamalpur Express',800:'Jamalpur Express',801:'Chattala Express',802:'Chattala Express',
  803:'Banglabandha Express',804:'Banglabandha Express',805:'Chilahati Express',806:'Chilahati Express',807:'Pabna Express',808:'Pabna Express',
  809:'Burimari Express',810:'Burimari Express',811:'Express',812:'Express',813:"Cox's Bazar Express",814:"Cox's Bazar Express",
  815:'Parjotak Express',816:'Parjotak Express',817:'Subarnachar Express',818:'Subarnachar Express',819:'Tanguar Express',820:'Tanguar Express',
  821:'Shaikat Express',822:'Probal Express',823:'Probal Express',824:'Shaikat Express',825:'Jahanabad Express',826:'Jahanabad Express',
  827:'Ruposhi Bangla Express',828:'Ruposhi Bangla Express'
};

const routeCache = new Map();
const CACHE_MS = 10 * 60 * 1000;
const TIMEOUT_MS = 4500;
const CONCURRENCY = 18;

function norm(v){
  return String(v ?? '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/_/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sameStation(a,b){
  const x=norm(a), y=norm(b);
  if(x===y)return true;
  const aliases={
    'jessore':'jashore','jashore':'jashore',
    'comilla':'cumilla','cumilla':'cumilla',
    'chittagong':'chattogram','chattogram':'chattogram',
    'kishoreganj':'kishorganj','kishorganj':'kishorganj',
    'pakshi':'paksey','paksey':'paksey',
    'cox bazar':'coxs bazar','coxs bazar':'coxs bazar',
    'dhaka airport':'biman bandar','biman bandar':'biman bandar',
    'bhairab bazar':'bhairab bazar'
  };
  return (aliases[x]||x)===(aliases[y]||y);
}

function extractRoutes(data){
  const root=data?.data ?? data;
  if(!root)return [];
  const candidates=[];
  if(Array.isArray(root.routes)) candidates.push(root.routes);
  if(Array.isArray(root.route)) candidates.push(root.route);
  if(Array.isArray(root.stations)) candidates.push(root.stations);
  for(const key of ['train','train_data','trainData','result','route_data','routeData']){
    const x=root[key];
    if(Array.isArray(x)) candidates.push(x);
    if(x && Array.isArray(x.routes)) candidates.push(x.routes);
    if(x && Array.isArray(x.stations)) candidates.push(x.stations);
  }
  const routes=candidates.find(a=>a.some(x=>x && (x.city||x.station||x.name||x.station_name||x.city_name)))||[];
  return routes;
}

function stopName(s){
  if(typeof s==='string')return s;
  if(!s||typeof s!=='object')return '';
  return s.city||s.city_name||s.station||s.station_name||s.name||s.stop_name||s.location?.name||'';
}

function firstValue(obj,keys){
  for(const k of keys){
    const v=obj?.[k];
    if(v!==undefined&&v!==null&&String(v).trim()!=='')return v;
  }
  return '';
}

function stopTime(s,kind){
  if(!s||typeof s!=='object')return '';
  const keys=kind==='arrival'
    ? ['arrival_time','arrivalTime','arrive_time','arriveTime','arrival','time_arrival']
    : ['departure_time','departureTime','depart_time','departTime','departure','time_departure'];
  const v=firstValue(s,keys);
  if(typeof v==='object')return firstValue(v,['time','value','display','datetime','date_time']);
  return String(v||'');
}

function stopDate(s,kind){
  if(!s||typeof s!=='object')return '';
  const keys=kind==='arrival'
    ? ['arrival_date','arrivalDate','date_arrival']
    : ['departure_date','departureDate','date_departure','date'];
  return String(firstValue(s,keys)||'');
}

function cleanTime(v){
  if(!v)return '';
  const s=String(v).trim().replace(/\s+BST$/i,'');
  const m=s.match(/(\d{1,2}:\d{2})(?::\d{2})?\s*(AM|PM)?/i);
  if(!m)return s;
  const hhmm=m[1], ap=m[2];
  return ap?`${hhmm} ${ap.toUpperCase()}`:hhmm;
}

function toMinutes(v){
  const s=String(v||'').toUpperCase().trim();
  const m=s.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/);
  if(!m)return null;
  let h=Number(m[1]), min=Number(m[2]);
  if(m[3]==='PM'&&h<12)h+=12;
  if(m[3]==='AM'&&h===12)h=0;
  return h*60+min;
}

function durationBetween(dateA,timeA,dateB,timeB,baseDate){
  if(!timeA||!timeB)return '';
  const parse=(d,t)=>{
    const tm=toMinutes(t); if(tm===null)return null;
    let day=0;
    if(d&&baseDate){
      const a=new Date(`${baseDate}T00:00:00`), b=new Date(`${d}T00:00:00`);
      if(!Number.isNaN(a)&&!Number.isNaN(b)) day=Math.round((b-a)/86400000);
    }
    return day*1440+tm;
  };
  let a=parse(dateA,timeA), b=parse(dateB,timeB);
  if(a===null||b===null)return '';
  while(b<a)b+=1440;
  const mins=b-a,h=Math.floor(mins/60),m=mins%60;
  return `${h}h ${m}m`;
}

function normalizeStop(s,index,baseDate){
  const name=stopName(s);
  const arrival=cleanTime(stopTime(s,'arrival'));
  const departure=cleanTime(stopTime(s,'departure'));
  const date=stopDate(s,'departure')||stopDate(s,'arrival')||baseDate;
  return {index,name,arrival,departure,date,raw:s};
}

async function fetchRoute(model,date){
  const key=`${model}|${date}`;
  const cached=routeCache.get(key);
  if(cached && Date.now()-cached.at<CACHE_MS)return cached.value;
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),TIMEOUT_MS);
  try{
    const r=await fetch('https://railspaapi.shohoz.com/v1.0/web/train-routes',{
      method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify({model:String(model),departure_date_time:date}),
      signal:controller.signal,cache:'no-store'
    });
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    const j=await r.json();
    const value={data:j?.data ?? j,routes:extractRoutes(j)};
    routeCache.set(key,{at:Date.now(),value});
    return value;
  } finally {clearTimeout(timer);}
}

async function mapLimit(items,limit,fn){
  const out=new Array(items.length); let next=0;
  async function worker(){
    while(true){const i=next++;if(i>=items.length)return;try{out[i]=await fn(items[i],i)}catch(e){out[i]={error:e?.message||String(e)}}}
  }
  await Promise.all(Array.from({length:Math.min(limit,items.length)},()=>worker()));
  return out;
}

export default async function handler(req,res){
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'Method not allowed'});
  const {from,to,date}=req.query||{};
  if(!from||!to||!date)return res.status(400).json({ok:false,error:'from, to and date are required'});
  if(sameStation(from,to))return res.status(400).json({ok:false,error:'From and To must be different'});

  const results=await mapLimit(MODELS,CONCURRENCY,async model=>{
    const x=await fetchRoute(model,date);
    const routes=x.routes||[];
    const stops=routes.map((s,i)=>normalizeStop(s,i,date)).filter(s=>s.name);
    let inferredDay=0,previousMinutes=null;
    for(const stop of stops){
      const tm=toMinutes(stop.departure||stop.arrival);
      if(tm!==null&&previousMinutes!==null&&tm<previousMinutes) inferredDay++;
      if(tm!==null) previousMinutes=tm;
      if(!stop.date || stop.date===date){
        const d=new Date(`${date}T00:00:00`); d.setDate(d.getDate()+inferredDay);
        stop.date=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      }
    }
    const fi=stops.findIndex(s=>sameStation(s.name,from));
    const ti=stops.findIndex(s=>sameStation(s.name,to));
    if(fi<0||ti<0||fi===ti)return null;

    const going=fi<ti;
    const start=stops[fi], end=stops[ti];
    const fromTime=cleanTime(start.departure||start.arrival);
    const toTime=cleanTime(end.arrival||end.departure);
    const duration=going
      ? durationBetween(start.date,fromTime,end.date,toTime,date)
      : durationBetween(end.date,cleanTime(end.departure||end.arrival),start.date,cleanTime(start.arrival||start.departure),date);
    const actualFrom=going?from:to;
    const actualTo=going?to:from;

    return {
      trainModel:String(model),name:TRAIN_NAMES[model]||String(model),
      direction:going?'GOING':'RETURN',
      queryFrom:from,queryTo:to,
      actualFrom,actualTo,
      fromTime:going?fromTime:cleanTime(end.departure||end.arrival),
      toTime:going?toTime:cleanTime(start.arrival||start.departure),
      duration,
      fromDate:going?(start.date||date):(end.date||date),
      toDate:going?(end.date||date):(start.date||date),
      stops:stops.map((s,idx)=>({...s,index:idx}))
    };
  });

  const all=results.filter(Boolean).filter(x=>!x.error);
  const outbound=all.filter(x=>x.direction==='GOING');
  const returning=all.filter(x=>x.direction==='RETURN');
  const sortByTime=(a,b)=>{
    const am=toMinutes(a.fromTime),bm=toMinutes(b.fromTime);
    if(am===null&&bm===null)return Number(a.trainModel)-Number(b.trainModel);
    if(am===null)return 1;if(bm===null)return -1;return am-bm;
  };
  outbound.sort(sortByTime);returning.sort(sortByTime);
  res.setHeader('Cache-Control','s-maxage=60, stale-while-revalidate=300');
  return res.status(200).json({ok:true,source:'Shohoz train-routes',from,to,date,outbound,returning,all:[...outbound,...returning],checked:MODELS.length});
}
