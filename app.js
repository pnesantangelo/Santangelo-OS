const demoData={
  apiVersion:'0.8.2',generatedAt:new Date().toISOString(),state:'Late Sports Night',dayLoad:'Heavy',
  familyFocus:'Protect tomorrow morning.',whatCanWait:'Deep cleaning can wait.',
  nextDeparture:{title:'Gators Practice',time:'6:00 PM',leaveText:'Leave in 1 hr 12 min',departureAt:new Date(Date.now()+72*60000).toISOString()},
  departureKey:'demo-departure',
  dinner:{plan:'Use leftovers or a simple family meal',note:'Keep cleanup easy tonight.'},
  readiness:[{id:'demo-1',name:'Carson',detail:'Cleats and flags/belt',required:'Yes',ready:false},{id:'demo-2',name:'Nathan',detail:'Mouthguard and uniform',required:'Yes',ready:false},{id:'demo-3',name:'Erin',detail:'Phone, keys, and wallet',required:'Yes',ready:false}],
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

function dateKey(value){
 const d=new Date(value);
 return Number.isNaN(d.getTime())?'':`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function nextMealDay(days){
 if(!days.length)return null;
 const now=new Date();now.setHours(0,0,0,0);
 const tomorrow=new Date(now);tomorrow.setDate(now.getDate()+1);
 const exact=days.find(d=>dateKey(d.date)===dateKey(tomorrow));
 if(exact)return exact;
 return days.find(d=>{const x=new Date(d.date);return !Number.isNaN(x.getTime())&&x>now;})||days[0];
}
function prepItems(day){
 if(!day)return [];
 const raw=[day.prepAction,day.notes].filter(Boolean).join('; ');
 const parts=raw.split(/;|\n|\u2022/).map(x=>x.trim()).filter(Boolean);
 return [...new Set(parts)].slice(0,6);
}
function renderTomorrowPrep(days){
 const day=nextMealDay(days);
 byId('tomorrowPrepTitle').textContent=day?`${day.day}: ${day.meal||'Meal not selected'}`:'No next-day meal yet';
 byId('tomorrowPrepStatus').textContent=day?.reminderTime||'';
 const items=prepItems(day);
 byId('tomorrowPrepList').innerHTML=items.length?items.map((item,i)=>`<label class="prep-item"><input type="checkbox" data-prep-key="${esc((day?.date||'')+'-'+i)}"><span>${esc(item)}</span></label>`).join(''):'<p class="subtle">Nothing needs to be done tonight.</p>';
 const saved=JSON.parse(localStorage.getItem('santangeloMealPrep')||'{}');
 document.querySelectorAll('[data-prep-key]').forEach(box=>{box.checked=!!saved[box.dataset.prepKey];box.addEventListener('change',()=>{saved[box.dataset.prepKey]=box.checked;localStorage.setItem('santangeloMealPrep',JSON.stringify(saved));});});
}
function renderMealPlan(){
 const plan=data.weeklyMealPlan||{days:[]}, days=plan.days||[];
 byId('mealPlanWeek').textContent=plan.weekOf?`Week of ${plan.weekOf}`:'Next week';
 byId('mealPlanSummary').innerHTML=days.length?days.map(d=>`<div class="meal-summary-row ${readinessClass(d)}"><strong>${esc(d.day.slice(0,3))}</strong>${String(d.approval).toLowerCase()==='approved'&&d.meal?`<button class="meal-name-link" data-recipe="${esc(d.recipeKey||d.meal)}" data-recipe-display="${esc(d.meal)}" data-recipe-row="${d.row}">${esc(d.meal)}</button>`:`<span>${esc(d.meal||'No meal selected')}</span>`}<small>${readinessLabel(d)}</small></div>`).join(''):'<div class="subtle">No weekly plan has been generated yet.</div>';
 renderTomorrowPrep(days);
 byId('mealPlanEditor').innerHTML=days.length?days.map((d,i)=>`<article class="card meal-editor-card ${readinessClass(d)}" data-row="${d.row}">
   <div class="meal-editor-top"><div><p class="card-label">${esc(d.day)} · ${esc(d.date)}</p>${String(d.approval).toLowerCase()==='approved'&&d.meal?`<button class="recipe-title-link" data-recipe="${esc(d.recipeKey||d.meal)}" data-recipe-display="${esc(d.meal)}" data-recipe-row="${d.row}">${esc(d.meal)}</button>`:`<h3>${esc(d.meal||'No meal selected')}</h3>`}</div><span class="meal-status">${readinessLabel(d)}</span></div>
   <p class="subtle">${esc(d.why||'')}</p>${(d.reviewItems||[]).length&&String(d.approval).toLowerCase()!=='approved'?`<div class="ingredient-review"><p class="missing-line"><strong>Review every ingredient the OS could not confirm:</strong></p>${(d.reviewItems||[]).map((item,j)=>`<div class="ingredient-review-row" data-review-row="${d.row}" data-review-item="${esc(item)}"><span class="ingredient-name">${esc(item)}</span><label><input type="radio" name="ingredient-${d.row}-${j}" value="have"> I have it</label><label><input type="radio" name="ingredient-${d.row}-${j}" value="need"> Need to buy</label><input class="ingredient-alias-input" data-have-as placeholder="Stored as… (optional)"></div>`).join('')}<p class="subtle small">Every item must be marked. Only items marked <strong>Need to buy</strong> remain on the shopping list. Items marked <strong>I have it</strong> go to Inventory Review Queue.</p></div>`:(String(d.approval).toLowerCase()==='approved'&&d.missingItems?`<div class="ingredient-review reviewed-needs"><p><strong>Reviewed and still needed:</strong> ${esc(d.missingItems)}</p><button class="secondary-btn" data-action="add-needed" data-row="${d.row}">Add these to grocery list</button></div>`:'')}
   <div class="meal-actions">
    <button class="primary-btn" data-action="approve" data-row="${d.row}" ${String(d.approval).toLowerCase()==='approved'?'disabled':''}>${String(d.approval).toLowerCase()==='approved'?'Approved ✓':'Approve'}</button>
    <button class="secondary-btn" data-action="alternate" data-row="${d.row}">Another idea</button>
    <button class="secondary-btn icon-btn" data-action="up" data-index="${i}" ${i===0?'disabled':''}>↑</button>
    <button class="secondary-btn icon-btn" data-action="down" data-index="${i}" ${i===days.length-1?'disabled':''}>↓</button>
   </div>${d.alternateSuggestion?`<div class="alternate-box"><strong>Alternate:</strong> ${esc(d.alternateSuggestion)} <button class="link-btn" data-action="use-alternate" data-row="${d.row}">Use this</button></div>`:''}
  </article>`).join(''):'<article class="card"><p class="subtle">No plan yet.</p></article>';
 document.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',handleMealAction));
 document.querySelectorAll('[data-recipe]').forEach(btn=>btn.addEventListener('click',()=>openRecipe(btn.dataset.recipe,btn.dataset.recipeDisplay||btn.textContent.trim(),Number(btn.dataset.recipeRow||0))));
}
function splitRecipeList(text){return String(text||'').split(/;|\n|\u2022/).map(x=>x.trim()).filter(Boolean);}
function closeRecipe(){const m=byId('recipeModal');m.classList.remove('open');m.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');}
async function openRecipe(recipeKey,displayName,row){
 const modal=byId('recipeModal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');
 byId('recipeTitle').textContent=displayName||recipeKey;byId('recipeContent').innerHTML='<p class="subtle">Loading recipe…</p>';
 try{
  const base=localStorage.getItem('santangeloApiUrl');if(!base)throw new Error('Connect the Apps Script URL first.');
  const u=new URL(base);u.searchParams.set('action','recipe');u.searchParams.set('recipeKey',recipeKey);
  const r=await fetch(u.toString(),{cache:'no-store'});if(!r.ok)throw new Error(`HTTP ${r.status}`);const j=await r.json();if(j.error)throw new Error(j.message||'Recipe could not be loaded.');
  renderRecipe(j.recipe||{},displayName||recipeKey,(data.weeklyMealPlan?.days||[]).find(d=>Number(d.row)===Number(row)));
 }catch(err){byId('recipeContent').innerHTML=`<div class="recipe-error"><strong>Recipe unavailable</strong><p>${esc(err.message)}</p></div>`;}
}
function renderRecipe(recipe,fallbackName,planDay){
 const ingredients=splitRecipeList(recipe.requiredIngredients||recipe.coreIngredients);
 const optional=splitRecipeList(recipe.optionalIngredients);
 const instructions=splitRecipeList(recipe.instructions||recipe.notes);
 const reviewed=String(planDay?.approval||'').toLowerCase()==='approved';
 const missing=reviewed?splitRecipeList(planDay?.missingItems):splitRecipeList(recipe.missingItems);
 byId('recipeTitle').textContent=recipe.name||fallbackName;
 byId('recipeContent').innerHTML=`
  <div class="recipe-meta">
   ${recipe.prepMinutes?`<span><strong>${esc(recipe.prepMinutes)}</strong> min prep</span>`:''}
   ${recipe.cookMethod?`<span>${esc(recipe.cookMethod)}</span>`:''}
   ${recipe.servings?`<span>Serves ${esc(recipe.servings)}</span>`:''}
   ${recipe.sourceCollection?`<span>${esc(recipe.sourceCollection)}${recipe.sourceWeek?' · Week '+esc(recipe.sourceWeek):''}</span>`:''}
  </div>
  ${recipe.ingredientRules?`<div class="recipe-callout"><strong>Your substitutions:</strong> ${esc(recipe.ingredientRules)}</div>`:''}
  <section class="recipe-section"><h3>Ingredients</h3>${ingredients.length?`<ul>${ingredients.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p class="subtle">Ingredients have not been added to the Meal Library yet.</p>'}${optional.length?`<h4>Optional</h4><ul>${optional.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}</section>
  <section class="recipe-section"><h3>Directions</h3>${instructions.length?`<ol>${instructions.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>`:'<p class="subtle">Detailed directions are not yet stored for this meal. The available Meal Library notes are shown when present.</p>'}</section>
  ${(recipe.thawInstructions||recipe.servingDayIngredients||recipe.batchPrepNotes)?`<section class="recipe-section recipe-prep-section"><h3>Make-ahead and serving notes</h3>${recipe.thawInstructions?`<p><strong>Thaw:</strong> ${esc(recipe.thawInstructions)}</p>`:''}${recipe.servingDayIngredients?`<p><strong>Serving day:</strong> ${esc(recipe.servingDayIngredients)}</p>`:''}${recipe.batchPrepNotes?`<p><strong>Batch prep:</strong> ${esc(recipe.batchPrepNotes)}</p>`:''}</section>`:''}
  ${missing.length?`<section class="recipe-section"><h3>${reviewed?'Reviewed and still needed':'Ingredient review needed'}</h3><p>${esc(missing.join(', '))}</p>${reviewed?'<button class="secondary-btn" id="addRecipeMissing">Add reviewed items to grocery list</button>':'<p class="subtle">Review these ingredients from the weekly meal card before adding anything to the grocery list.</p>'}</section>`:''}
  <div class="recipe-actions"><button class="primary-btn" id="markRecipeCooked">Mark cooked</button><label class="rating-label" for="recipeRating">Family rating<select id="recipeRating"><option value="">Choose</option><option value="5">5 — Loved it</option><option value="4">4 — Good</option><option value="3">3 — Okay</option><option value="2">2 — Not a favorite</option><option value="1">1 — Never again</option></select></label><button class="secondary-btn" id="saveRecipeRating">Save rating</button></div>`;
 byId('markRecipeCooked')?.addEventListener('click',async()=>{await recipeAction('markCooked',{meal:recipe.name||fallbackName});closeRecipe();await refreshFromApi();});
 byId('saveRecipeRating')?.addEventListener('click',async()=>{const rating=byId('recipeRating').value;if(!rating)return alert('Choose a rating first.');await recipeAction('rateMeal',{meal:recipe.name||fallbackName,rating:Number(rating)});alert('Rating saved.');});
 byId('addRecipeMissing')?.addEventListener('click',async()=>{await recipeAction('addMissingToGrocery',{meal:recipe.name||fallbackName,items:missing});alert('Missing items added to the grocery list.');});
}
async function recipeAction(action,payload){try{return await apiAction(action,payload);}catch(err){alert('Could not update the recipe: '+err.message);throw err;}}
document.querySelectorAll('[data-close-recipe]').forEach(x=>x.addEventListener('click',closeRecipe));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeRecipe();});

async function handleMealAction(e){
 const btn=e.currentTarget,action=btn.dataset.action,days=data.weeklyMealPlan?.days||[];
 try{
  btn.disabled=true;
  if(action==='approve'){
   const row=Number(btn.dataset.row);
   const reviewRows=[...document.querySelectorAll(`[data-review-row="${row}"]`)];
   const reviewedItems=reviewRows.map(el=>{
    const chosen=el.querySelector('input[type="radio"]:checked');
    return {ingredient:el.dataset.reviewItem,status:chosen?.value||'',inventoryName:el.querySelector('[data-have-as]')?.value.trim()||''};
   });
   const unreviewed=reviewedItems.filter(x=>!x.status);
   if(unreviewed.length){alert(`Please mark every ingredient as I have it or Need to buy. Remaining: ${unreviewed.map(x=>x.ingredient).join(', ')}`);btn.disabled=false;return;}
   await apiAction('approveMeal',{row,reviewedItems});
  }
  if(action==='add-needed'){const row=Number(btn.dataset.row),day=days.find(d=>Number(d.row)===row),items=splitRecipeList(day?.missingItems);if(!items.length){alert('There are no reviewed grocery items for this meal.');btn.disabled=false;return;}await apiAction('addMissingToGrocery',{meal:day?.recipeKey||day?.meal||'',items});alert('Reviewed items added to the grocery list.');}
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
function updateDepartureCountdown(){
 const el=byId('countdown'),iso=data.nextDeparture?.departureAt;
 if(!el||!iso)return;
 const diff=new Date(iso)-new Date();
 if(diff<=0){el.textContent='Time to leave';return;}
 const total=Math.ceil(diff/60000),h=Math.floor(total/60),m=total%60;
 el.textContent=h?`Leave in ${h} hr${h===1?'':'s'}${m?' '+m+' min':''}`:`Leave in ${m} min`;
}
function render(){
 const now=new Date();byId('todayDate').textContent=now.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});
 byId('stateName').textContent=data.state||'Normal Day';byId('dayLoad').textContent=`${data.dayLoad||'Normal'} day`;
 byId('nextEvent').textContent=data.nextDeparture?.title||'Nothing scheduled';byId('nextTime').textContent=data.nextDeparture?.time||'';byId('countdown').textContent=data.nextDeparture?.leaveText||'';updateDepartureCountdown();
 byId('dinnerPlan').textContent=data.dinner?.plan||'No meal planned';byId('mealNote').textContent=data.dinner?.note||'';byId('familyFocus').textContent=data.familyFocus||'';byId('whatCanWait').textContent=data.whatCanWait||'';
 byId('buyNowList').innerHTML=listHtml(data.shopping?.buyNow,'Nothing urgent');byId('buySoonList').innerHTML=listHtml(data.shopping?.buySoon,'Nothing needed next trip');byId('dontBuyList').innerHTML=listHtml((data.shopping?.dontBuy||[]).slice(0,6),'No stocked items yet');
 const readyStoreKey='santangeloReady:'+String(data.departureKey||'current');
 const saved=JSON.parse(localStorage.getItem(readyStoreKey)||'{}');
 byId('readyList').innerHTML=(data.readiness||[]).length?(data.readiness||[]).map((x,i)=>{const itemKey=x.id||`${x.name}|${x.detail}`,r=saved[itemKey]??x.ready;return `<div class="ready-item ${r?'ready':''}" data-ready-index="${i}"><div><div class="ready-name">${esc(x.name)}</div><div class="ready-status">${r?'Ready ✓':esc(x.required==='Optional'?'Optional':'Tap when packed')}</div></div><div class="subtle small">${esc(x.detail||'')}</div></div>`}).join(''):'<div class="subtle">Nothing needs to be packed for another departure today.</div>';
 document.querySelectorAll('[data-ready-index]').forEach(el=>el.onclick=()=>{const x=data.readiness[+el.dataset.readyIndex],itemKey=x.id||`${x.name}|${x.detail}`,store=JSON.parse(localStorage.getItem(readyStoreKey)||'{}');store[itemKey]=!(store[itemKey]??x.ready);localStorage.setItem(readyStoreKey,JSON.stringify(store));render();});
 byId('scheduleList').innerHTML=(data.schedule||[]).map(x=>`<div class="timeline-item"><div class="timeline-time">${esc(x.time)}</div><div>${esc(x.title)}</div></div>`).join('');
 byId('decisionList').innerHTML=(data.decisions||[]).map(x=>`<div class="decision-item">${esc(x)}</div>`).join('');
 renderMealPlan();renderFourWeekCalendar();
 const health=(data.householdHealth||[]).map(x=>({name:x.name,status:x.summary,level:x.level,items:[]})),cards=[...(data.house||[]),...health];byId('houseGrid').innerHTML=cards.map(x=>`<article class="card house-status status-${esc(x.level||'good')}"><p class="card-label">${esc(x.name).toUpperCase()}</p><h3>${esc(x.status)}</h3>${x.items?.length?`<ul class="ops-list">${x.items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>`:''}</article>`).join('');
}
async function refreshFromApi(){const base=localStorage.getItem('santangeloApiUrl');if(!base){data=structuredClone(demoData);byId('systemStatus').textContent='Demo data';render();return;}try{byId('systemStatus').textContent='Refreshing…';const u=new URL(base);u.searchParams.set('action','dashboard');const r=await fetch(u.toString(),{cache:'no-store'});if(!r.ok)throw new Error(`HTTP ${r.status}`);const j=await r.json();if(j.error)throw new Error(j.message);data=j;byId('systemStatus').textContent='Live v'+(j.apiVersion||'');render();}catch(e){console.error(e);byId('systemStatus').textContent='Connection issue';data=structuredClone(demoData);render();}}
document.querySelectorAll('.nav-btn').forEach(b=>b.onclick=()=>{document.querySelectorAll('.nav-btn').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelector(`[data-screen="${b.dataset.target}"]`).classList.add('active');});
byId('approveWeek').onclick=async()=>{try{byId('approveWeek').disabled=true;await apiAction('approveWeek');await refreshFromApi();}catch(e){alert(e.message);}finally{byId('approveWeek').disabled=false;}};
byId('saveApi').onclick=()=>{localStorage.setItem('santangeloApiUrl',byId('apiUrl').value.trim());refreshFromApi();};byId('useDemo').onclick=()=>{localStorage.removeItem('santangeloApiUrl');byId('apiUrl').value='';refreshFromApi();};byId('resetReady').onclick=()=>{localStorage.removeItem('santangeloReady:'+String(data.departureKey||'current'));render();};byId('apiUrl').value=localStorage.getItem('santangeloApiUrl')||'';refreshFromApi();setInterval(refreshFromApi,5*60*1000);setInterval(updateDepartureCountdown,30000);
