const demoData={
  apiVersion:'0.5.0',generatedAt:new Date().toISOString(),state:'Late Sports Night',dayLoad:'Heavy',
  familyFocus:'Protect tomorrow morning.',whatCanWait:'Deep cleaning can wait.',
  nextDeparture:{title:'Gators Practice',time:'6:00 PM',leaveText:'Leave in 1 hr 12 min'},
  dinner:{plan:'Use leftovers or a simple family meal',note:'Keep cleanup easy tonight.'},
  readiness:[{name:'Carson',detail:'Phone, water, uniform',ready:false},{name:'Nathan',detail:'Water, mouthguard, flags',ready:false},{name:'Addison',detail:'Activity bag, water, gear',ready:false},{name:'Mom',detail:'Field bag, keys, water',ready:false},{name:'Dad',detail:'Coach bag or project gear',ready:false}],
  people:[],schedule:[],decisions:['Buy now: paper towels, spray stain remover, mustard, salami.'],
  shopping:{buyNow:[{item:'Paper towels'}],buySoon:[{item:'Chicken breast'}],dontBuy:[{item:'Ground beef'}],byStore:{}},
  householdHealth:[],house:[],calendar4Weeks:{startDate:'',endDate:'',days:[]},
  weeklyMealPlan:{weekOf:'Aug 10',status:'Draft',days:[
    {row:4,date:'8/10/2026',day:'Monday',meal:'Pool & Pizza Party',readiness:'Ready',missingCount:0,missingItems:'',approval:'Approved',why:'Calendar override'},
    {row:5,date:'8/11/2026',day:'Tuesday',meal:'Honey Garlic Grilled Chicken',readiness:'Ready',missingCount:0,missingItems:'',approval:'Draft',why:'Cook once, use twice'},
    {row:6,date:'8/12/2026',day:'Wednesday',meal:'Sesame Pasta Salad with Grilled Chicken',readiness:'Quick Shop',missingCount:2,missingItems:'Baby tomatoes; green onions',approval:'Draft',why:'Uses Tuesday leftovers'},
    {row:7,date:'8/13/2026',day:'Thursday',meal:'Chicken Tacos / Burritos',readiness:'Shopping Required',missingCount:3,missingItems:'Salsa; sour cream; lettuce',approval:'Draft',why:'Quick first-day meal'},
    {row:8,date:'8/14/2026',day:'Friday',meal:'Hawaiian Ham & Swiss Sliders',readiness:'Quick Shop',missingCount:2,missingItems:'Hawaiian rolls; Swiss cheese',approval:'Draft',why:'Portable sports-night meal'},
    {row:9,date:'8/15/2026',day:'Saturday',meal:'Grilled Burgers',readiness:'Ready',missingCount:0,missingItems:'',approval:'Draft',why:'Pairs with freezer prep'},
    {row:10,date:'8/16/2026',day:'Sunday',meal:'Favorite Half Turkey / Half Beef Meatloaf',readiness:'Quick Shop',missingCount:1,missingItems:'Ground turkey',approval:'Draft',why:'Family dinner with leftovers'}
  ]}
};
let data=structuredClone(demoData);
const byId=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
function listHtml(items,empty){return items&&items.length?items.map(x=>`<div class="compact-item">${esc(x.item||x)}</div>`).join(''):`<div class="subtle">${empty}</div>`;}
function readinessClass(day){const n=Number(day.missingCount||0);if(n>=3)return 'meal-red';if(n>=1)return 'meal-yellow';return 'meal-green';}
function readinessLabel(day){const n=Number(day.missingCount||0);if(n>=3)return `● ${n} items`;if(n>=1)return `● ${n} item${n===1?'':'s'}`;return '✓ Ready';}
function calendarPersonClass(person){
 const key=String(person||'family').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 if(key.includes('phillip')||key.includes('phil'))return 'phillip';if(key.includes('erin'))return 'erin';
 if((key.includes('carson')&&key.includes('nathan'))||(key.includes('both')&&key.includes('boy')))return 'both-boys';
 if(key.includes('carson'))return 'carson';if(key.includes('nathan'))return 'nathan';if(key.includes('addison'))return 'addison';return 'family';
}
function renderFourWeekCalendar(){
 const cal=data.calendar4Weeks||{},days=Array.isArray(cal.days)?cal.days:[];
 byId('calendarRange').textContent=cal.startDate&&cal.endDate?`${cal.startDate} – ${cal.endDate}`:'';
 if(!days.length){byId('fourWeekCalendar').innerHTML='<div class="calendar-empty subtle">Calendar data will appear after the updated Apps Script API is deployed.</div>';return;}
 const headers=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=>`<div class="calendar-weekday">${x}</div>`).join('');
 const cells=days.map(day=>{const events=(day.events||[]).map(ev=>`<div class="calendar-event person-${calendarPersonClass(ev.person)}" title="${esc(ev.title)}"><span class="event-time">${esc(ev.time||'')}</span>${esc(ev.title)}</div>`).join('');return `<div class="calendar-day ${day.isToday?'is-today':''}"><div class="calendar-date"><span>${esc(day.dayNumber)}</span><small>${esc(day.monthLabel||'')}</small></div><div class="calendar-events">${events||'<span class="no-events">—</span>'}</div></div>`;}).join('');
 byId('fourWeekCalendar').innerHTML=`<div class="calendar-weekdays">${headers}</div><div class="calendar-days">${cells}</div>`;
}
function renderMealPlan(){
 const plan=data.weeklyMealPlan||{days:[]}, days=plan.days||[];
 byId('mealPlanWeek').textContent=plan.weekOf?`Week of ${plan.weekOf}`:'Next week';
 byId('mealPlanSummary').innerHTML=days.length?days.map(d=>`<div class="meal-summary-row ${readinessClass(d)}"><strong>${esc(d.day.slice(0,3))}</strong><span>${esc(d.meal||'No meal selected')}</span><small>${readinessLabel(d)}</small></div>`).join(''):'<div class="subtle">No weekly plan has been generated yet.</div>';
 byId('mealPlanEditor').innerHTML=days.length?days.map((d,i)=>`<article class="card meal-editor-card ${readinessClass(d)}" data-row="${d.row}">
   <div class="meal-editor-top"><div><p class="card-label">${esc(d.day)} · ${esc(d.date)}</p><h3>${esc(d.meal||'No meal selected')}</h3></div><span class="meal-status">${readinessLabel(d)}</span></div>
   <p class="subtle">${esc(d.why||'')}</p>${d.missingItems?`<p class="missing-line"><strong>Need:</strong> ${esc(d.missingItems)}</p>`:''}
   <div class="meal-actions">
    <button class="primary-btn" data-action="approve" data-row="${d.row}" ${String(d.approval).toLowerCase()==='approved'?'disabled':''}>${String(d.approval).toLowerCase()==='approved'?'Approved ✓':'Approve'}</button>
    <button class="secondary-btn" data-action="alternate" data-row="${d.row}">Another idea</button>
    <button class="secondary-btn icon-btn" data-action="up" data-index="${i}" ${i===0?'disabled':''}>↑</button>
    <button class="secondary-btn icon-btn" data-action="down" data-index="${i}" ${i===days.length-1?'disabled':''}>↓</button>
   </div>${d.alternateSuggestion?`<div class="alternate-box"><strong>Alternate:</strong> ${esc(d.alternateSuggestion)} <button class="link-btn" data-action="use-alternate" data-row="${d.row}">Use this</button></div>`:''}
  </article>`).join(''):'<article class="card"><p class="subtle">No plan yet.</p></article>';
 document.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',handleMealAction));
}
async function handleMealAction(e){
 const btn=e.currentTarget,action=btn.dataset.action,days=data.weeklyMealPlan?.days||[];
 try{
  btn.disabled=true;
  if(action==='approve')await apiAction('approveMeal',{row:Number(btn.dataset.row)});
  if(action==='alternate')await apiAction('requestAlternate',{row:Number(btn.dataset.row)});
  if(action==='use-alternate')await apiAction('useAlternate',{row:Number(btn.dataset.row)});
  if(action==='up'||action==='down'){
   const i=Number(btn.dataset.index),j=action==='up'?i-1:i+1;
   await apiAction('swapMeals',{rowA:days[i].row,rowB:days[j].row});
  }
  await refreshFromApi();
 }catch(err){alert('Could not update the meal plan: '+err.message);btn.disabled=false;}
}
async function apiAction(action,payload={}){
 const base=localStorage.getItem('santangeloApiUrl');if(!base)throw new Error('Connect the Apps Script URL first.');
 const r=await fetch(base,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,...payload})});
 if(!r.ok)throw new Error(`HTTP ${r.status}`);const j=await r.json();if(j.error)throw new Error(j.message||'Update failed');return j;
}
function render(){
 const now=new Date();byId('todayDate').textContent=now.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});
 byId('stateName').textContent=data.state||'Normal Day';byId('dayLoad').textContent=`${data.dayLoad||'Normal'} day`;
 byId('nextEvent').textContent=data.nextDeparture?.title||'Nothing scheduled';byId('nextTime').textContent=data.nextDeparture?.time||'';byId('countdown').textContent=data.nextDeparture?.leaveText||'';
 byId('dinnerPlan').textContent=data.dinner?.plan||'No meal planned';byId('mealNote').textContent=data.dinner?.note||'';byId('familyFocus').textContent=data.familyFocus||'';byId('whatCanWait').textContent=data.whatCanWait||'';
 byId('buyNowList').innerHTML=listHtml(data.shopping?.buyNow,'Nothing urgent');byId('buySoonList').innerHTML=listHtml(data.shopping?.buySoon,'Nothing needed next trip');byId('dontBuyList').innerHTML=listHtml((data.shopping?.dontBuy||[]).slice(0,6),'No stocked items yet');
 const saved=JSON.parse(localStorage.getItem('santangeloReady')||'{}');byId('readyList').innerHTML=(data.readiness||[]).map((x,i)=>{const r=saved[x.name]??x.ready;return `<div class="ready-item ${r?'ready':''}" data-ready-index="${i}"><div><div class="ready-name">${esc(x.name)}</div><div class="ready-status">${r?'Ready ✓':'Tap when ready'}</div></div><div class="subtle small">${esc(x.detail||'')}</div></div>`}).join('');
 document.querySelectorAll('[data-ready-index]').forEach(el=>el.onclick=()=>{const x=data.readiness[+el.dataset.readyIndex],s=JSON.parse(localStorage.getItem('santangeloReady')||'{}');s[x.name]=!(s[x.name]??x.ready);localStorage.setItem('santangeloReady',JSON.stringify(s));render();});
 byId('scheduleList').innerHTML=(data.schedule||[]).map(x=>`<div class="timeline-item"><div class="timeline-time">${esc(x.time)}</div><div>${esc(x.title)}</div></div>`).join('');
 byId('decisionList').innerHTML=(data.decisions||[]).map(x=>`<div class="decision-item">${esc(x)}</div>`).join('');
 renderMealPlan();renderFourWeekCalendar();
 const health=(data.householdHealth||[]).map(x=>({name:x.name,status:x.summary,level:x.level,items:[]})),cards=[...(data.house||[]),...health];byId('houseGrid').innerHTML=cards.map(x=>`<article class="card house-status status-${esc(x.level||'good')}"><p class="card-label">${esc(x.name).toUpperCase()}</p><h3>${esc(x.status)}</h3>${x.items?.length?`<ul class="ops-list">${x.items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>`:''}</article>`).join('');
}
async function refreshFromApi(){const base=localStorage.getItem('santangeloApiUrl');if(!base){data=structuredClone(demoData);byId('systemStatus').textContent='Demo data';render();return;}try{byId('systemStatus').textContent='Refreshing…';const u=new URL(base);u.searchParams.set('action','dashboard');const r=await fetch(u.toString(),{cache:'no-store'});if(!r.ok)throw new Error(`HTTP ${r.status}`);const j=await r.json();if(j.error)throw new Error(j.message);data=j;byId('systemStatus').textContent='Live v'+(j.apiVersion||'');render();}catch(e){console.error(e);byId('systemStatus').textContent='Connection issue';data=structuredClone(demoData);render();}}
document.querySelectorAll('.nav-btn').forEach(b=>b.onclick=()=>{document.querySelectorAll('.nav-btn').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelector(`[data-screen="${b.dataset.target}"]`).classList.add('active');});
byId('approveWeek').onclick=async()=>{try{byId('approveWeek').disabled=true;await apiAction('approveWeek');await refreshFromApi();}catch(e){alert(e.message);}finally{byId('approveWeek').disabled=false;}};
byId('saveApi').onclick=()=>{localStorage.setItem('santangeloApiUrl',byId('apiUrl').value.trim());refreshFromApi();};byId('useDemo').onclick=()=>{localStorage.removeItem('santangeloApiUrl');byId('apiUrl').value='';refreshFromApi();};byId('resetReady').onclick=()=>{localStorage.removeItem('santangeloReady');render();};byId('apiUrl').value=localStorage.getItem('santangeloApiUrl')||'';refreshFromApi();setInterval(refreshFromApi,5*60*1000);
