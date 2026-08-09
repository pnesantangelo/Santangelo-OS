const DEFAULT_API_URL='https://script.google.com/macros/s/AKfycbwpPnSSKGZJ5uhQ7wRNAkML6jsZugZ2IFrwil6v4naXYmFgQKEGS8EUmONSaPNwybAk/exec';
const DEFAULT_WEATHER_LOCATION='Yorba Linda, CA';

const demoData={
  apiVersion:'0.8.6',generatedAt:new Date().toISOString(),state:'Late Sports Night',dayLoad:'Heavy',
  familyFocus:'Protect tomorrow morning.',whatCanWait:'Deep cleaning can wait.',
  nextDeparture:{title:'Gators Practice',time:'6:00 PM',leaveText:'Leave in 1 hr 12 min',departureAt:new Date(Date.now()+72*60000).toISOString()},
  departureKey:'demo-departure',
  dinner:{plan:'Use leftovers or a simple family meal',note:'Keep cleanup easy tonight.'},
  readiness:[{id:'demo-1',name:'Carson',detail:'Cleats and flags/belt',required:'Yes',ready:false},{id:'demo-2',name:'Nathan',detail:'Mouthguard and uniform',required:'Yes',ready:false},{id:'demo-3',name:'Erin',detail:'Phone, keys, and wallet',required:'Yes',ready:false}],
  people:[],schedule:[],decisions:['Buy now: paper towels, spray stain remover, mustard, salami.'],
  shopping:{active:[{id:'demo-1',item:'Sour cream',quantity:'1',store:'Smart & Final',category:'Dairy',reason:'Meal ingredient',source:'Grocery List',trackInventory:'Auto',inventoryMatch:''},{id:'demo-2',item:'Chicken breast',quantity:'4 lb',store:"Sam's Club",category:'Inventory',reason:'Low inventory',source:'Inventory',trackInventory:'Auto',inventoryMatch:'Chicken breast'}],buyNow:[{item:'Paper towels'}],buySoon:[{item:'Chicken breast'}],dontBuy:[{item:'Ground beef'}],byStore:{}},
  homeHealth:{percent:62,completed:5,total:8,label:'5 of 8 chore points complete'},chores:{weekLabel:'This week',daily:[],weekly:[],asNeeded:[],summary:{dailyDone:0,dailyTotal:0,weeklyDone:0,weeklyTotal:0}},householdHealth:[],house:[],calendar4Weeks:{startDate:'',endDate:'',days:[]},
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
   <p class="subtle">${esc(d.why||'')}</p>${(d.reviewItems||[]).length&&String(d.approval).toLowerCase()!=='approved'?`<div class="ingredient-review"><p class="missing-line"><strong>Review ingredients the OS still cannot match:</strong></p>${(d.reviewItems||[]).map((item,j)=>`<div class="ingredient-review-row" data-review-row="${d.row}" data-review-item="${esc(item)}"><span class="ingredient-name">${esc(item)}</span><label><input type="radio" name="ingredient-${d.row}-${j}" value="have"> I have it</label><label><input type="radio" name="ingredient-${d.row}-${j}" value="need"> Need to buy</label><input class="ingredient-alias-input" data-have-as placeholder="Stored as… (optional)"></div>`).join('')}<p class="subtle small">Only unmatched ingredients appear here. Refreshing the app rechecks Kitchen Inventory and aliases. Mark the remaining items as <strong>I have it</strong> or <strong>Need to buy</strong>.</p></div>`:(String(d.approval).toLowerCase()==='approved'&&d.missingItems?`<div class="ingredient-review reviewed-needs"><p><strong>Reviewed and still needed:</strong> ${esc(d.missingItems)}</p><button class="secondary-btn" data-action="add-needed" data-row="${d.row}">Add these to grocery list</button></div>`:'')}
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
  const base=(localStorage.getItem('santangeloApiUrl')||DEFAULT_API_URL);if(!base)throw new Error('Connect the Apps Script URL first.');
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
   if(unreviewed.length){alert(`Please review each unmatched ingredient as I have it or Need to buy. Remaining: ${unreviewed.map(x=>x.ingredient).join(', ')}`);btn.disabled=false;return;}
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
 const base=(localStorage.getItem('santangeloApiUrl')||DEFAULT_API_URL);if(!base)throw new Error('Connect the Apps Script URL first.');
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

function setGauge(id,value){
 const el=byId(id);if(!el)return;const v=Math.max(0,Math.min(100,Number(value)||0));el.style.setProperty('--progress',`${v}%`);
}
function readySnapshot(){
 const items=data.readiness||[],required=items.filter(x=>x.required!=='Optional');
 if(!required.length)return {percent:100,done:0,total:0};
 const key='santangeloReady:'+String(data.departureKey||'current');const saved=JSON.parse(localStorage.getItem(key)||'{}');
 const done=required.filter(x=>{const k=x.id||`${x.name}|${x.detail}`;return saved[k]??x.ready;}).length;
 return {percent:Math.round(done/required.length*100),done,total:required.length};
}
function loadScore(label){const s=String(label||'').toLowerCase();if(/open|very light/.test(s))return 20;if(/light/.test(s))return 35;if(/heavy|late/.test(s))return 88;if(/busy|full/.test(s))return 72;return 50;}
function renderHomeMetrics(){
 const hh=data.homeHealth||{percent:0,completed:0,total:0,label:'No chores assigned'};const rp=readySnapshot();const dl=data.dayLoadMetric||{percent:loadScore(data.dayLoad),label:data.dayLoad||'Normal'};
 setGauge('homeHealthGauge',hh.percent);byId('homeHealthValue').textContent=hh.total?`${hh.percent}%`:'—';byId('homeHealthLabel').textContent=hh.total?(hh.percent>=80?'Home is in good shape':hh.percent>=50?'Making progress':'Needs a reset'):'No chores assigned';byId('homeHealthDetail').textContent=hh.label||`${hh.completed||0} of ${hh.total||0} complete`;
 setGauge('familyReadyGauge',rp.percent);byId('familyReadyValue').textContent=rp.total?`${rp.percent}%`:'✓';byId('familyReadyLabel').textContent=rp.total?(rp.percent===100?'Ready to go':`${rp.done} of ${rp.total} ready`):'Nothing to pack';byId('familyReadyDetail').textContent=data.nextDeparture?.title||'';
 setGauge('dayLoadGauge',dl.percent);byId('dayLoadValue').textContent=`${dl.percent}%`;byId('dayLoadLabel').textContent=dl.label||data.dayLoad||'Normal';byId('dayLoadDetail').textContent=dl.detail||'Calendar, travel, and commitments';
}
function shoppingItemHtml(x){
 const qty=esc(x.quantity||'');const store=esc(x.store||'Unassigned');const track=String(x.trackInventory||'Auto');const match=esc(x.inventoryMatch||'');
 return `<article class="card shopping-row" data-shopping-id="${esc(x.id||'')}"><div class="shopping-row-main"><div><p class="card-label">${esc(x.source||'SHOPPING')}</p><h3>${esc(x.item)}</h3><p class="subtle small">${qty?`Need: ${qty} · `:''}${store}${x.reason?` · ${esc(x.reason)}`:''}</p>${match?`<p class="inventory-match">Tracks: ${match}</p>`:''}</div><div class="shopping-purchase-controls"><label>Qty bought<input data-shop-qty type="text" value="${qty||'1'}"></label><label>Inventory<select data-shop-track><option value="Auto" ${track==='Auto'?'selected':''}>Auto</option><option value="No" ${track==='No'?'selected':''}>Do not track</option><option value="Kitchen" ${track==='Kitchen'?'selected':''}>Kitchen</option><option value="Household" ${track==='Household'?'selected':''}>Household</option></select></label><button class="primary-btn" data-shop-bought type="button">Bought ✓</button></div></div></article>`;
}
function renderShopping(){
 const items=data.shopping?.active||[];const root=byId('shoppingActiveList');if(!root)return;
 if(!items.length){root.innerHTML='<article class="card"><h3>Shopping list is clear ✓</h3><p class="subtle">Add an item above or wait for the OS to find something you need.</p></article>';return;}
 const stores={};items.forEach(x=>{const k=x.store||'Unassigned';(stores[k]||(stores[k]=[])).push(x);});
 root.innerHTML=Object.keys(stores).sort().map(store=>`<section class="shopping-store-group"><div class="shopping-store-title"><h3>${esc(store)}</h3><span>${stores[store].length} item${stores[store].length===1?'':'s'}</span></div>${stores[store].map(shoppingItemHtml).join('')}</section>`).join('');
 document.querySelectorAll('[data-shop-bought]').forEach(btn=>btn.addEventListener('click',async()=>{const card=btn.closest('[data-shopping-id]'),item=items.find(x=>String(x.id)===String(card.dataset.shoppingId));if(!item)return;const qtyBought=card.querySelector('[data-shop-qty]').value.trim()||'1',trackInventory=card.querySelector('[data-shop-track]').value;try{btn.disabled=true;btn.textContent='Saving…';await apiAction('markShoppingPurchased',{id:item.id,row:item.row||0,item:item.item,source:item.source||'',quantityBought:qtyBought,trackInventory,inventoryMatch:item.inventoryMatch||'',store:item.store||'',category:item.category||'',unit:item.unit||''});await refreshFromApi();}catch(err){alert('Could not mark purchased: '+err.message);btn.disabled=false;btn.textContent='Bought ✓';}}));
}
function choreRowHtml(chore){
 const complete=!!chore.complete, count=Number(chore.count||0), target=Number(chore.target||0), weekly=chore.period==='week';
 const progress=target?`${Math.min(count,target)}/${target}`:(count?`${count} logged`:'Available');
 const members=(data.chores?.familyMembers||['Erin','Phillip','Carson','Nathan','Addison']);
 const options=['<option value="">Who did it?</option>',...members.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`)].join('');
 const actionLabel=complete?(weekly?'Completed ✓':'Done ✓'):'✓ Complete';
 return `<div class="chore-row ${complete?'is-complete':''}" data-chore-id="${esc(chore.id)}"><div class="chore-main"><div class="chore-name">${esc(chore.name)}</div><div class="chore-meta">${esc(chore.area||'')} · ${esc(chore.frequency||'')} · ${progress}${chore.estimatedMinutes?` · ${esc(chore.estimatedMinutes)} min`:''}</div>${chore.lastCompletedBy?`<span class="chore-person-last">Last: ${esc(chore.lastCompletedBy)}${chore.lastCompletedAt?` · ${esc(chore.lastCompletedAt)}`:''}</span>`:''}</div><select class="chore-person-select" data-chore-person>${options}</select><div><button type="button" class="primary-btn chore-complete-btn ${complete?'done':''}" data-chore-complete ${complete?'disabled':''}>${actionLabel}</button>${complete&&weekly?'<button type="button" class="chore-extra-btn" data-chore-again>Log another completion</button>':''}</div></div>`;
}
function choreSectionHtml(title,subtitle,chores){return `<section class="chore-section"><div class="chore-section-title"><h3>${esc(title)}</h3><span class="subtle small">${esc(subtitle)}</span></div><div class="chore-list">${chores.length?chores.map(choreRowHtml).join(''):'<div class="chore-empty">Nothing in this group.</div>'}</div></section>`;}
function renderChores(){
 const c=data.chores||{daily:[],weekly:[],asNeeded:[],summary:{}};const sum=c.summary||{};
 const totalDaily=Number(sum.dailyTotal||0),doneDaily=Number(sum.dailyDone||0),totalWeekly=Number(sum.weeklyTotal||0),doneWeekly=Number(sum.weeklyDone||0);
 byId('choreWeekLabel').textContent=c.weekLabel||'';
 byId('choreSummary').innerHTML=`<article class="card chore-summary-card"><p class="card-label">TODAY</p><h3>${doneDaily} / ${totalDaily}</h3><p class="subtle small">daily chores complete</p></article><article class="card chore-summary-card"><p class="card-label">THIS WEEK</p><h3>${doneWeekly} / ${totalWeekly}</h3><p class="subtle small">weekly minimums complete</p></article><article class="card chore-summary-card"><p class="card-label">HOME HEALTH</p><h3>${data.homeHealth?.total?`${data.homeHealth.percent}%`:'—'}</h3><p class="subtle small">${esc(data.homeHealth?.label||'')}</p></article>`;
 byId('choreBoard').innerHTML=choreSectionHtml('Daily','Resets every day',c.daily||[])+choreSectionHtml('This week','Weekly progress resets Monday',c.weekly||[])+choreSectionHtml('As needed','Available anytime; not counted against Home Health',c.asNeeded||[]);
 document.querySelectorAll('[data-chore-complete],[data-chore-again]').forEach(btn=>btn.addEventListener('click',async()=>{const row=btn.closest('[data-chore-id]'),chore=[...(c.daily||[]),...(c.weekly||[]),...(c.asNeeded||[])].find(x=>String(x.id)===String(row.dataset.choreId));const person=row.querySelector('[data-chore-person]').value;if(!person){alert('Choose who completed the chore first.');return;}try{btn.disabled=true;btn.textContent='Saving…';await apiAction('completeChore',{chore:chore.name,person:person});await refreshFromApi();}catch(e){alert('Could not save chore: '+e.message);btn.disabled=false;btn.textContent='✓ Complete';}}));
}

function updateClock(){const el=byId('currentTime');if(el)el.textContent=new Date().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});}
function weatherCodeLabel(code){if(code===0)return'Sunny';if(code<=3)return'Partly cloudy';if(code<=48)return'Foggy';if(code<=67)return'Rain';if(code<=77)return'Snow';if(code<=82)return'Showers';if(code<=99)return'Thunderstorms';return'Weather';}
function weatherCodeIcon(code){if(code===0)return'☀️';if(code<=3)return'⛅';if(code<=48)return'🌫️';if(code<=67)return'🌧️';if(code<=77)return'❄️';if(code<=82)return'🌦️';if(code<=99)return'⛈️';return'🌤️';}
async function refreshWeather(){
 const label=byId('weatherSummary'),forecast=byId('weatherForecast');if(!label)return;const place=localStorage.getItem('santangeloWeatherLocation')||DEFAULT_WEATHER_LOCATION;
 try{
  const g=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1&language=en&format=json`);const gj=await g.json();const loc=gj.results?.[0];if(!loc)throw new Error('City not found');
  const w=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&timezone=auto&forecast_days=5`);const j=await w.json();
  label.textContent=`${Math.round(j.current?.temperature_2m)}° · ${weatherCodeLabel(j.current?.weather_code)} · ${loc.name}`;
  if(forecast){const d=j.daily||{};forecast.innerHTML=(d.time||[]).slice(0,5).map((date,i)=>{const day=new Date(date+'T12:00:00').toLocaleDateString([], {weekday:'short'}),hi=Math.round(d.temperature_2m_max?.[i]),lo=Math.round(d.temperature_2m_min?.[i]),rain=Math.round(d.precipitation_probability_max?.[i]||0),rainText=rain>10?`💧 ${rain}%`:'☀ Dry';return `<div class="forecast-day"><strong>${day}</strong><span class="forecast-icon">${weatherCodeIcon(d.weather_code?.[i])}</span><span>${hi}° / ${lo}°</span><small>${rainText}</small></div>`;}).join('');}
 }catch(e){label.textContent='Weather unavailable';if(forecast)forecast.innerHTML='';}
}
async function addShoppingItem(){const item=byId('shoppingItem').value.trim();if(!item)return;const status=byId('shoppingAddStatus');try{status.textContent='Adding…';await apiAction('addShoppingItem',{item,quantity:byId('shoppingQty').value.trim()||'1',store:byId('shoppingStore').value.trim(),category:byId('shoppingCategory').value.trim(),source:'Web App'});byId('shoppingItem').value='';byId('shoppingQty').value='';status.textContent='Added.';await refreshFromApi();}catch(e){status.textContent='Could not add: '+e.message;}}
function applyDisplayMode(){const p=new URLSearchParams(location.search),forced=p.get('mode');const autoPortrait=window.innerHeight>window.innerWidth*1.18&&window.innerWidth>=500;const wall=forced==='wall'||(forced!=='app'&&autoPortrait);document.body.classList.toggle('wall-mode',wall);if(wall){document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.dataset.screen==='home'));}}

function render(){
 const now=new Date();byId('todayDate').textContent=now.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});updateClock();
 byId('nextEvent').textContent=data.nextDeparture?.title||'Nothing scheduled';byId('nextTime').textContent=data.nextDeparture?.time||'';byId('countdown').textContent=data.nextDeparture?.leaveText||'';updateDepartureCountdown();
 byId('dinnerPlan').textContent=data.dinner?.plan||'No meal planned';byId('mealNote').textContent=data.dinner?.note||'';
 const readyStoreKey='santangeloReady:'+String(data.departureKey||'current');
 const saved=JSON.parse(localStorage.getItem(readyStoreKey)||'{}');
 byId('readyList').innerHTML=(data.readiness||[]).length?(data.readiness||[]).map((x,i)=>{const itemKey=x.id||`${x.name}|${x.detail}`,r=saved[itemKey]??x.ready;return `<div class="ready-item ${r?'ready':''}" data-ready-index="${i}"><div><div class="ready-name">${esc(x.name)}</div><div class="ready-status">${r?'Ready ✓':esc(x.required==='Optional'?'Optional':'Tap when packed')}</div></div><div class="subtle small">${esc(x.detail||'')}</div></div>`}).join(''):'<div class="subtle">Nothing needs to be packed for another departure today.</div>';
 document.querySelectorAll('[data-ready-index]').forEach(el=>el.onclick=()=>{const x=data.readiness[+el.dataset.readyIndex],itemKey=x.id||`${x.name}|${x.detail}`,store=JSON.parse(localStorage.getItem(readyStoreKey)||'{}');store[itemKey]=!(store[itemKey]??x.ready);localStorage.setItem(readyStoreKey,JSON.stringify(store));render();});
 byId('scheduleList').innerHTML=(data.schedule||[]).map(x=>`<div class="timeline-item"><div class="timeline-time">${esc(x.time)}</div><div>${esc(x.title)}</div></div>`).join('');
 byId('decisionList').innerHTML=(data.decisions||[]).map(x=>`<div class="decision-item">${esc(x)}</div>`).join('');
 renderHomeMetrics();renderShopping();renderMealPlan();renderFourWeekCalendar();renderChores();
 const health=(data.householdHealth||[]).map(x=>({name:x.name,status:x.summary,level:x.level,items:[]})),cards=[...(data.house||[]),...health];byId('houseGrid').innerHTML=cards.map(x=>`<article class="card house-status status-${esc(x.level||'good')}"><p class="card-label">${esc(x.name).toUpperCase()}</p><h3>${esc(x.status)}</h3>${x.items?.length?`<ul class="ops-list">${x.items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>`:''}</article>`).join('');
}
async function refreshFromApi(){const base=(localStorage.getItem('santangeloApiUrl')||DEFAULT_API_URL);if(!base){data=structuredClone(demoData);byId('systemStatus').textContent='Demo data';render();return;}try{byId('systemStatus').textContent='Refreshing…';const u=new URL(base);u.searchParams.set('action','dashboard');const r=await fetch(u.toString(),{cache:'no-store'});if(!r.ok)throw new Error(`HTTP ${r.status}`);const j=await r.json();if(j.error)throw new Error(j.message);data=j;byId('systemStatus').textContent='Live v'+(j.apiVersion||'');render();}catch(e){console.error(e);byId('systemStatus').textContent='Connection issue';data=structuredClone(demoData);render();}}
document.querySelectorAll('.nav-btn').forEach(b=>b.onclick=()=>{document.querySelectorAll('.nav-btn').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelector(`[data-screen="${b.dataset.target}"]`).classList.add('active');});
byId('approveWeek').onclick=async()=>{try{byId('approveWeek').disabled=true;await apiAction('approveWeek');await refreshFromApi();}catch(e){alert(e.message);}finally{byId('approveWeek').disabled=false;}};
byId('saveApi').onclick=()=>{localStorage.setItem('santangeloApiUrl',byId('apiUrl').value.trim());localStorage.setItem('santangeloWeatherLocation',byId('weatherLocation').value.trim());refreshWeather();refreshFromApi();};byId('useDemo').onclick=()=>{localStorage.removeItem('santangeloApiUrl');byId('apiUrl').value='';refreshFromApi();};byId('resetReady').onclick=()=>{localStorage.removeItem('santangeloReady:'+String(data.departureKey||'current'));render();};byId('apiUrl').value=localStorage.getItem('santangeloApiUrl')||DEFAULT_API_URL;byId('weatherLocation').value=localStorage.getItem('santangeloWeatherLocation')||DEFAULT_WEATHER_LOCATION;byId('addShoppingItem')?.addEventListener('click',addShoppingItem);byId('shoppingItem')?.addEventListener('keydown',e=>{if(e.key==='Enter')addShoppingItem();});applyDisplayMode();updateClock();refreshWeather();refreshFromApi();setInterval(refreshFromApi,5*60*1000);setInterval(updateDepartureCountdown,30000);setInterval(updateClock,30000);setInterval(refreshWeather,60*60*1000);
