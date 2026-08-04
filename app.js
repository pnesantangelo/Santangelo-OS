const demoData={apiVersion:'0.3.0',generatedAt:new Date().toISOString(),state:'Late Sports Night',dayLoad:'Heavy',familyFocus:'Protect tomorrow morning.',whatCanWait:'Deep cleaning can wait.',nextDeparture:{title:'Gators Practice',time:'6:00 PM',leaveText:'Leave in 1 hr 12 min'},dinner:{plan:'Use leftovers or a simple family meal',note:'Keep cleanup easy tonight.'},readiness:[{name:'Carson',detail:'Phone, water, uniform',ready:false},{name:'Nathan',detail:'Water, mouthguard, flags',ready:false},{name:'Addison',detail:'Activity bag, water, gear',ready:false},{name:'Mom',detail:'Field bag, keys, water',ready:false},{name:'Dad',detail:'Coach bag or project gear',ready:false}],people:[],schedule:[],decisions:['Buy now: paper towels, spray stain remover, mustard, salami.'],shopping:{buyNow:[{item:'Paper towels'},{item:'Spray stain remover'},{item:'Mustard'},{item:'Salami'}],buySoon:[{item:'Chicken breast'},{item:'Tide liquid detergent'},{item:'Parmesan cheese'},{item:'Turkey lunch meat'},{item:'Ham lunch meat'}],dontBuy:[{item:'Ground beef'},{item:'Whole milk'},{item:'Coffee'},{item:'Toilet paper'}],byStore:{}},householdHealth:[],house:[],calendar4Weeks:{startDate:'',endDate:'',days:[]}};
let data=structuredClone(demoData);
const byId=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
function listHtml(items,empty){return items&&items.length?items.map(x=>`<div class="compact-item">${esc(x.item||x)}</div>`).join(''):`<div class="subtle">${empty}</div>`;}
function calendarPersonClass(person){
 const key=String(person||'family').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 if(key.includes('phillip')||key.includes('phil'))return 'phillip';
 if(key.includes('erin'))return 'erin';
 if(key.includes('carson')&&key.includes('nathan'))return 'both-boys';
 if(key.includes('both')&&key.includes('boy'))return 'both-boys';
 if(key.includes('carson'))return 'carson';
 if(key.includes('nathan'))return 'nathan';
 if(key.includes('addison'))return 'addison';
 return 'family';
}
function renderFourWeekCalendar(){
 const cal=data.calendar4Weeks||{};
 const days=Array.isArray(cal.days)?cal.days:[];
 byId('calendarRange').textContent=cal.startDate&&cal.endDate?`${cal.startDate} – ${cal.endDate}`:'';
 if(!days.length){byId('fourWeekCalendar').innerHTML='<div class="calendar-empty subtle">Calendar data will appear after the updated Apps Script API is deployed.</div>';return;}
 const headers=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=>`<div class="calendar-weekday">${x}</div>`).join('');
 const cells=days.map(day=>{
   const events=(day.events||[]).map(ev=>`<div class="calendar-event person-${calendarPersonClass(ev.person)}" title="${esc(ev.title)}"><span class="event-time">${esc(ev.time||'')}</span>${esc(ev.title)}</div>`).join('');
   return `<div class="calendar-day ${day.isToday?'is-today':''} ${day.inCurrentMonth===false?'outside-month':''}"><div class="calendar-date"><span>${esc(day.dayNumber)}</span><small>${esc(day.monthLabel||'')}</small></div><div class="calendar-events">${events||'<span class="no-events">—</span>'}</div></div>`;
 }).join('');
 byId('fourWeekCalendar').innerHTML=`<div class="calendar-weekdays">${headers}</div><div class="calendar-days">${cells}</div>`;
}
function render(){
 const now=new Date(); byId('todayDate').textContent=now.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});
 byId('stateName').textContent=data.state||'Normal Day'; byId('dayLoad').textContent=`${data.dayLoad||'Normal'} day`;
 byId('nextEvent').textContent=data.nextDeparture?.title||'Nothing scheduled'; byId('nextTime').textContent=data.nextDeparture?.time||''; byId('countdown').textContent=data.nextDeparture?.leaveText||'';
 byId('dinnerPlan').textContent=data.dinner?.plan||'No meal planned'; byId('mealNote').textContent=data.dinner?.note||''; byId('familyFocus').textContent=data.familyFocus||''; byId('whatCanWait').textContent=data.whatCanWait||'';
 byId('buyNowList').innerHTML=listHtml(data.shopping?.buyNow,'Nothing urgent'); byId('buySoonList').innerHTML=listHtml(data.shopping?.buySoon,'Nothing needed next trip'); byId('dontBuyList').innerHTML=listHtml((data.shopping?.dontBuy||[]).slice(0,6),'No stocked items yet');
 const saved=JSON.parse(localStorage.getItem('santangeloReady')||'{}'); byId('readyList').innerHTML=(data.readiness||[]).map((x,i)=>{const r=saved[x.name]??x.ready;return `<div class="ready-item ${r?'ready':''}" data-ready-index="${i}"><div><div class="ready-name">${esc(x.name)}</div><div class="ready-status">${r?'Ready ✓':'Tap when ready'}</div></div><div class="subtle small">${esc(x.detail||'')}</div></div>`}).join('');
 document.querySelectorAll('[data-ready-index]').forEach(el=>el.onclick=()=>{const x=data.readiness[+el.dataset.readyIndex],s=JSON.parse(localStorage.getItem('santangeloReady')||'{}');s[x.name]=!(s[x.name]??x.ready);localStorage.setItem('santangeloReady',JSON.stringify(s));render();});
 byId('familyCards').innerHTML=(data.people||[]).map(p=>`<article class="card person-card"><p class="card-label">${esc(p.name).toUpperCase()}</p><h3 class="person-title">${esc(p.title)}</h3><p class="person-prompt">${esc(p.prompt)}</p></article>`).join('');
 byId('scheduleList').innerHTML=(data.schedule||[]).map(x=>`<div class="timeline-item"><div class="timeline-time">${esc(x.time)}</div><div>${esc(x.title)}</div></div>`).join('');
 byId('decisionList').innerHTML=(data.decisions||[]).map(x=>`<div class="decision-item">${esc(x)}</div>`).join('');
 renderFourWeekCalendar();
 const health=(data.householdHealth||[]).map(x=>({name:x.name,status:x.summary,level:x.level,items:[]})); const cards=[...(data.house||[]),...health]; byId('houseGrid').innerHTML=cards.map(x=>`<article class="card house-status status-${esc(x.level||'good')}"><p class="card-label">${esc(x.name).toUpperCase()}</p><h3>${esc(x.status)}</h3>${x.items?.length?`<ul class="ops-list">${x.items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>`:''}</article>`).join('');
}
async function refreshFromApi(){const base=localStorage.getItem('santangeloApiUrl');if(!base){data=structuredClone(demoData);byId('systemStatus').textContent='Demo data';render();return;}try{byId('systemStatus').textContent='Refreshing…';const u=new URL(base);u.searchParams.set('action','dashboard');const r=await fetch(u.toString(),{cache:'no-store'});if(!r.ok)throw new Error(`HTTP ${r.status}`);const j=await r.json();if(j.error)throw new Error(j.message);data=j;byId('systemStatus').textContent='Live v'+(j.apiVersion||'');render();}catch(e){console.error(e);byId('systemStatus').textContent='Connection issue';data=structuredClone(demoData);render();}}
document.querySelectorAll('.nav-btn').forEach(b=>b.onclick=()=>{document.querySelectorAll('.nav-btn').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelector(`[data-screen="${b.dataset.target}"]`).classList.add('active');});
byId('saveApi').onclick=()=>{localStorage.setItem('santangeloApiUrl',byId('apiUrl').value.trim());refreshFromApi();};byId('useDemo').onclick=()=>{localStorage.removeItem('santangeloApiUrl');byId('apiUrl').value='';refreshFromApi();};byId('resetReady').onclick=()=>{localStorage.removeItem('santangeloReady');render();};byId('apiUrl').value=localStorage.getItem('santangeloApiUrl')||'';refreshFromApi();setInterval(refreshFromApi,5*60*1000);
