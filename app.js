const DEFAULT_API_URL='https://script.google.com/macros/s/AKfycbwpPnSSKGZJ5uhQ7wRNAkML6jsZugZ2IFrwil6v4naXYmFgQKEGS8EUmONSaPNwybAk/exec';
const DEFAULT_WEATHER_LOCATION='Yorba Linda, CA';
const CURRENT_FRONTEND_VERSION='0.10.2b3';
const MIN_CURRENT_API_VERSION='0.10.2';

const blankData={apiVersion:'0.10.2',generatedAt:new Date().toISOString(),state:'Connecting',dayLoad:'',familyFocus:'',whatCanWait:'',nextDeparture:{title:'Connecting to Santangelo OS',time:'',leaveText:''},departureKey:'connecting',dinner:{plan:'Loading dinner…',note:''},readiness:[],people:[],schedule:[],decisions:[],shopping:{active:[],buyNow:[],buySoon:[],dontBuy:[],byStore:{}},homeHealth:{percent:0,completed:0,total:0,label:'Loading chores…'},chores:{weekLabel:'This week',daily:[],deepClean:[],weekly:[],asNeeded:[],summary:{dailyDone:0,dailyTotal:0,weeklyDone:0,weeklyTotal:0,deepCleanDue:0}},tasks:{today:[],upcoming:[],waiting:[],someday:[],completed:[],summary:{open:0,dueToday:0,overdue:0}},mealReview:{weekOf:'',days:[],complete:false},householdHealth:[],house:[],calendar4Weeks:{startDate:'',endDate:'',days:[]},weeklyMealPlan:{weekOf:'',status:'',days:[]}};
function cloneData(value){return JSON.parse(JSON.stringify(value));}
function readLastLiveData(){try{return JSON.parse(localStorage.getItem('santangeloLastLiveData')||'null');}catch(e){return null;}}
function saveLastLiveData(value){try{localStorage.setItem('santangeloLastLiveData',JSON.stringify(value));}catch(e){console.warn('Could not cache live dashboard data',e);}}
let data=readLastLiveData()||cloneData(blankData);
const byId=id=>document.getElementById(id);
function isWallMode(){return document.body.classList.contains('wall-mode');}
function getApiBase(){
  // The wall display must always use the known live endpoint. Ignore stale Yodeck localStorage.
  if(isWallMode()) return DEFAULT_API_URL;
  const saved=(localStorage.getItem('santangeloApiUrl')||'').trim();
  return saved || DEFAULT_API_URL;
}
function setSystemStatus(text,kind=''){
  const el=byId('systemStatus'); if(!el)return; el.textContent=text;
  el.dataset.connection=kind;
}
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
function prepDayLabel(day){
 const d=new Date(day?.date||'');
 if(Number.isNaN(d.getTime()))return 'Tonight';
 d.setDate(d.getDate()-1);
 return d.toLocaleDateString('en-US',{weekday:'long'});
}
function renderTomorrowPrep(days){
 const day=nextMealDay(days);
 const prepDay=prepDayLabel(day);
 byId('tomorrowPrepTitle').textContent=day?`${day.day}: ${day.meal||'Meal not selected'}`:'No next-day meal yet';
 byId('tomorrowPrepStatus').textContent=day?.reminderTime||'';
 const items=prepItems(day);
 byId('tomorrowPrepList').innerHTML=items.length?items.map((item,i)=>`<label class="prep-item"><input type="checkbox" data-prep-key="${esc((day?.date||'')+'-'+i)}"><span><strong>${esc(prepDay)}:</strong> ${esc(item.replace(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s*[:,-]?\s*/i,''))}</span></label>`).join(''):'<p class="subtle">Nothing needs to be done tonight.</p>';
 const saved=JSON.parse(localStorage.getItem('santangeloMealPrep')||'{}');
 document.querySelectorAll('[data-prep-key]').forEach(box=>{box.checked=!!saved[box.dataset.prepKey];box.addEventListener('change',()=>{saved[box.dataset.prepKey]=box.checked;localStorage.setItem('santangeloMealPrep',JSON.stringify(saved));});});
}
function renderMealReview(){
 const review=data.mealReview||{days:[]},days=review.days||[],root=byId('mealReviewPanel');if(!root)return;
 if(!days.length){root.innerHTML='<p class="subtle">No prior week is waiting for review.</p>';return;}
 root.innerHTML=`<div class="meal-review-head"><div><p class="card-label">SUNDAY RESET</p><h3>Review week of ${esc(review.weekOf||'last week')}</h3><p class="subtle small">Tell Santangelo OS what actually happened so skipped meals and ratings influence the next plan.</p></div><button id="saveMealReview" class="primary-btn" type="button">Save review</button></div><div class="meal-review-list">${days.map(d=>`<div class="meal-review-row" data-meal-review-row="${d.row}"><div class="meal-review-meal"><strong>${esc(d.day)}</strong><span>${esc(d.meal||'No meal')}</span></div><label>Outcome<select data-review-outcome><option value="">Choose…</option>${['Made','Leftovers / Repurposed','Ate Out / Plans Changed','Not Made - Ingredients Still Available','Not Made - Ingredients No Longer Available'].map(x=>`<option value="${esc(x)}" ${d.outcome===x?'selected':''}>${esc(x)}</option>`).join('')}</select></label><label>Rating<select data-review-rating><option value="">—</option>${[5,4,3,2,1].map(x=>`<option value="${x}" ${Number(d.rating)===x?'selected':''}>${x}</option>`).join('')}</select></label><label class="meal-review-stock"><input type="checkbox" data-review-stock ${d.ingredientsStillAvailable?'checked':''}> Ingredients still available</label><label>Notes<input data-review-notes type="text" value="${esc(d.outcomeNotes||'')}" placeholder="What worked or changed?"></label></div>`).join('')}</div>`;
 byId('saveMealReview')?.addEventListener('click',async()=>{const btn=byId('saveMealReview');const reviews=[...document.querySelectorAll('[data-meal-review-row]')].map(row=>({row:Number(row.dataset.mealReviewRow),outcome:row.querySelector('[data-review-outcome]').value,rating:row.querySelector('[data-review-rating]').value?Number(row.querySelector('[data-review-rating]').value):'',ingredientsStillAvailable:row.querySelector('[data-review-stock]').checked,outcomeNotes:row.querySelector('[data-review-notes]').value.trim()}));try{btn.disabled=true;btn.textContent='Saving…';await apiAction('saveMealReview',{reviews});btn.textContent='Saved ✓';}catch(e){alert('Could not save meal review: '+e.message);btn.disabled=false;btn.textContent='Save review';}});
}
function renderMealPlan(){
 renderMealReview();
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
  const base=getApiBase();if(!base)throw new Error('Connect the Apps Script URL first.');
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
 byId('markRecipeCooked')?.addEventListener('click',async()=>{await recipeAction('markCooked',{meal:recipe.name||fallbackName});closeRecipe();await Promise.all([loadModule('meals',{quiet:true}),loadModule('home',{quiet:true})]);});
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
  if(action==='add-needed')await loadModule('shopping',{quiet:true});
 }catch(err){alert('Could not update the meal plan: '+err.message);btn.disabled=false;}
}
async function apiAction(action,payload={}){
 const base=getApiBase();if(!base)throw new Error('Connect the Apps Script URL first.');
 const r=await fetch(base,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,...payload})});
 if(!r.ok)throw new Error(`HTTP ${r.status}`);const j=await r.json();if(j.error)throw new Error(j.message||'Update failed');mergePayload(j);return j;
}
function mergePayload(j){if(!j)return;Object.keys(j).forEach(k=>{if(!['ok','module'].includes(k))data[k]=j[k];});saveLastLiveData(data);render();}
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
 document.querySelectorAll('[data-shop-bought]').forEach(btn=>btn.addEventListener('click',async()=>{const card=btn.closest('[data-shopping-id]'),item=items.find(x=>String(x.id)===String(card.dataset.shoppingId));if(!item)return;const qtyBought=card.querySelector('[data-shop-qty]').value.trim()||'1',trackInventory=card.querySelector('[data-shop-track]').value;try{btn.disabled=true;btn.textContent='Saving…';data.shopping.active=(data.shopping.active||[]).filter(x=>String(x.id)!==String(item.id));renderShopping();await apiAction('markShoppingPurchased',{id:item.id,row:item.row||0,item:item.item,source:item.source||'',quantityBought:qtyBought,trackInventory,inventoryMatch:item.inventoryMatch||'',store:item.store||'',category:item.category||'',unit:item.unit||''});}catch(err){alert('Could not mark purchased: '+err.message);btn.disabled=false;btn.textContent='Bought ✓';}}));
}
function choreRowHtml(chore){
 const complete=!!chore.complete,count=Number(chore.count||0),target=Number(chore.target||0),weekly=chore.period==='week',deep=!!chore.deepClean;
 const progress=deep?(chore.dueLabel||'Deep clean'):target?`${Math.min(count,target)}/${target}`:(count?`${count} logged`:'Available');
 const members=(data.chores?.familyMembers||['Erin','Phillip','Carson','Nathan','Addison']);
 const options=chore.fixedPerson?`<option value="${esc(chore.fixedPerson)}" selected>${esc(chore.fixedPerson)}</option>`:['<option value="">Who did it?</option>',...members.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`)].join('');
 const actionLabel=complete&&!deep?(weekly?'Completed ✓':'Done ✓'):'✓ Complete';
 return `<div class="chore-row ${complete&&!deep?'is-complete':''} ${deep?'deep-clean-row':''}" data-chore-id="${esc(chore.id)}"><div class="chore-main"><div class="chore-name">${esc(chore.name)}</div><div class="chore-meta">${esc(chore.area||'')} · ${esc(chore.frequency||'')} · ${esc(progress)}${chore.estimatedMinutes?` · ${esc(chore.estimatedMinutes)} min`:''}</div>${chore.lastCompletedBy?`<span class="chore-person-last">Last: ${esc(chore.lastCompletedBy)}${chore.lastCompletedAt?` · ${esc(chore.lastCompletedAt)}`:''}</span>`:''}</div><select class="chore-person-select" data-chore-person ${chore.fixedPerson?'disabled':''}>${options}</select><div><button type="button" class="primary-btn chore-complete-btn ${complete&&!deep?'done':''}" data-chore-complete ${complete&&!deep?'disabled':''}>${actionLabel}</button>${complete&&weekly&&!deep?'<button type="button" class="chore-extra-btn" data-chore-again>Log another completion</button>':''}</div></div>`;
}
function choreSectionHtml(title,subtitle,chores,extra=''){return `<section class="chore-section ${extra}"><div class="chore-section-title"><h3>${esc(title)}</h3><span class="subtle small">${esc(subtitle)}</span></div><div class="chore-list">${chores.length?chores.map(choreRowHtml).join(''):'<div class="chore-empty">Nothing in this group.</div>'}</div></section>`;}
function renderChores(){
 const c=data.chores||{daily:[],deepClean:[],weekly:[],asNeeded:[],summary:{}},sum=c.summary||{};
 const totalDaily=Number(sum.dailyTotal||0),doneDaily=Number(sum.dailyDone||0),totalWeekly=Number(sum.weeklyTotal||0),doneWeekly=Number(sum.weeklyDone||0),deepDue=Number(sum.deepCleanDue||0);
 byId('choreWeekLabel').textContent=c.weekLabel||'';
 byId('choreSummary').innerHTML=`<article class="card chore-summary-card"><p class="card-label">TODAY</p><h3>${doneDaily} / ${totalDaily}</h3><p class="subtle small">daily chores complete</p></article><article class="card chore-summary-card"><p class="card-label">THIS WEEK</p><h3>${doneWeekly} / ${totalWeekly}</h3><p class="subtle small">weekly minimums complete</p></article><article class="card chore-summary-card deep-clean-summary"><p class="card-label">DEEP CLEAN DUE</p><h3>${deepDue}</h3><p class="subtle small">focus areas need attention</p></article>`;
 byId('choreBoard').innerHTML=choreSectionHtml('Deep Clean Focus','Most overdue first — aim for one focus block on normal days',c.deepClean||[],'deep-clean-section')+choreSectionHtml('Daily','Resets every day',c.daily||[])+choreSectionHtml('This week','Weekly progress resets Monday',c.weekly||[])+choreSectionHtml('As needed','Available anytime; not counted against Home Health',c.asNeeded||[]);
 document.querySelectorAll('[data-chore-complete],[data-chore-again]').forEach(btn=>btn.addEventListener('click',async()=>{const row=btn.closest('[data-chore-id]'),chore=[...(c.deepClean||[]),...(c.daily||[]),...(c.weekly||[]),...(c.asNeeded||[])].find(x=>String(x.id)===String(row.dataset.choreId));const person=row.querySelector('[data-chore-person]').value;if(!person){alert('Choose who completed the chore first.');return;}try{btn.disabled=true;btn.textContent='Saving…';await apiAction(chore.deepClean?'completeMaintenance':'completeChore',chore.deepClean?{row:chore.maintenanceRow,person:person}:{chore:chore.name,person:person});}catch(e){alert('Could not save chore: '+e.message);btn.disabled=false;btn.textContent='✓ Complete';}}));
}
function taskCardHtml(t){const due=t.dueDate?`Due ${esc(t.dueDate)}`:'No due date',rem=t.reminderAt?` · Reminder ${esc(t.reminderAt)}`:'',meta=[t.project?`Project: ${esc(t.project)}`:'',t.area?`Area: ${esc(t.area)}`:''].filter(Boolean).join(' · ');return `<article class="card task-row ${t.overdue?'task-overdue':''}" data-task-row="${t.row}"><div><p class="card-label">${esc(t.project||t.area||'TASK')}</p><h3>${esc(t.task)}</h3>${meta?`<p class="task-project-area">${meta}</p>`:''}<p class="subtle small">${due}${rem}${t.waitingOn?` · Waiting on ${esc(t.waitingOn)}`:''}</p>${t.nextAction?`<p class="task-next"><strong>Next:</strong> ${esc(t.nextAction)}</p>`:''}</div><div class="task-actions"><span class="task-priority">${esc(t.priority||'Normal')}</span><button class="primary-btn" data-task-complete type="button">Done ✓</button></div></article>`;}
function renderTasks(){const t=data.tasks||{today:[],upcoming:[],waiting:[],someday:[],summary:{}},root=byId('taskBoard');if(!root)return;const s=t.summary||{};byId('taskSummary').innerHTML=`<article class="card task-summary-card"><p class="card-label">OPEN</p><h3>${Number(s.open||0)}</h3></article><article class="card task-summary-card"><p class="card-label">DUE TODAY</p><h3>${Number(s.dueToday||0)}</h3></article><article class="card task-summary-card"><p class="card-label">OVERDUE</p><h3>${Number(s.overdue||0)}</h3></article>`;const sec=(name,items,empty)=>`<section class="task-section"><h3>${name}</h3><div class="task-list">${items.length?items.map(taskCardHtml).join(''):`<div class="chore-empty">${empty}</div>`}</div></section>`;root.innerHTML=sec('Today',t.today||[],'Nothing due today.')+sec('Upcoming',t.upcoming||[],'No dated tasks coming up.')+sec('Waiting / Delegated',t.waiting||[],'Nothing waiting on someone else.')+sec('Someday / Undated',t.someday||[],'No undated tasks.');document.querySelectorAll('[data-task-complete]').forEach(btn=>btn.addEventListener('click',async()=>{const row=Number(btn.closest('[data-task-row]').dataset.taskRow);try{btn.disabled=true;await apiAction('completeTask',{row});}catch(e){alert('Could not complete task: '+e.message);btn.disabled=false;}}));}
async function addTask(){const task=byId('taskInput').value.trim();if(!task)return;const body={task,project:byId('taskProject').value.trim(),area:byId('taskArea')?.value.trim()||'',priority:byId('taskPriority').value,dueDate:byId('taskDue').value,reminderAt:byId('taskReminder').value,source:'Web App'};const status=byId('taskAddStatus');try{status.textContent='Saving…';await apiAction('addTask',body);byId('taskInput').value='';byId('taskProject').value='';if(byId('taskArea'))byId('taskArea').value='';byId('taskDue').value='';byId('taskReminder').value='';status.textContent='Added.';}catch(e){status.textContent='Could not add: '+e.message;}}

function updateClock(){const el=byId('currentTime');if(el)el.textContent=new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true});}
function weatherCodeLabel(code){if(code===0)return'Sunny';if(code<=3)return'Partly cloudy';if(code<=48)return'Foggy';if(code<=67)return'Rain';if(code<=77)return'Snow';if(code<=82)return'Showers';if(code<=99)return'Thunderstorms';return'Weather';}
function weatherCodeIcon(code){if(code===0)return'☀️';if(code<=3)return'⛅';if(code<=48)return'🌫️';if(code<=67)return'🌧️';if(code<=77)return'❄️';if(code<=82)return'🌦️';if(code<=99)return'⛈️';return'🌤️';}
async function refreshWeather(){
 const label=byId('weatherSummary'),forecast=byId('weatherForecast');if(!label)return;const place=localStorage.getItem('santangeloWeatherLocation')||DEFAULT_WEATHER_LOCATION;
 try{
  const g=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1&language=en&format=json`);const gj=await g.json();const loc=gj.results?.[0];if(!loc)throw new Error('City not found');
  const w=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&timezone=auto&forecast_days=5`);const j=await w.json();
  label.innerHTML=`<span class="current-temp">${Math.round(j.current?.temperature_2m)}°</span><span class="current-condition">${weatherCodeLabel(j.current?.weather_code)} · ${esc(loc.name)}</span>`;
  if(forecast){const d=j.daily||{};forecast.innerHTML=(d.time||[]).slice(0,5).map((date,i)=>{const day=new Date(date+'T12:00:00').toLocaleDateString([], {weekday:'short'}),hi=Math.round(d.temperature_2m_max?.[i]),lo=Math.round(d.temperature_2m_min?.[i]),rain=Math.round(d.precipitation_probability_max?.[i]||0),rainText=rain>10?`${rain}% rain`:'Dry';return `<div class="forecast-day"><strong>${day}</strong><div class="forecast-temps"><span class="forecast-high">${hi}°</span><span class="forecast-low">${lo}°</span></div><small>${rainText}</small></div>`;}).join('');}
 }catch(e){label.textContent='Weather unavailable';if(forecast)forecast.innerHTML='';}
}
async function addShoppingItem(){
 const input=byId('shoppingItem'),item=input.value.trim();if(!item)return;const status=byId('shoppingAddStatus');
 const quantity=byId('shoppingQty').value.trim()||'1',store=byId('shoppingStore').value.trim(),category=byId('shoppingCategory').value.trim();
 const temp={id:'pending-'+Date.now(),item,quantity,store:store||'Smart & Final',category,source:'Web App',status:'Needed',reason:'Saving…'};
 data.shopping=data.shopping||{active:[],buyNow:[],buySoon:[],dontBuy:[],byStore:{}};data.shopping.active=[...(data.shopping.active||[]),temp];renderShopping();input.value='';byId('shoppingQty').value='';status.textContent='Added — saving…';
 try{await apiAction('addShoppingItem',{item,quantity,store,category,source:'Web App'});status.textContent='Added.';}
 catch(e){data.shopping.active=(data.shopping.active||[]).filter(x=>x.id!==temp.id);renderShopping();input.value=item;status.textContent='Could not add: '+e.message;}
}
function applyDisplayMode(){const p=new URLSearchParams(location.search),forced=p.get('mode');const autoPortrait=window.innerHeight>window.innerWidth*1.18&&window.innerWidth>=500;const wall=forced==='wall'||(forced!=='app'&&autoPortrait);document.body.classList.toggle('wall-mode',wall);if(wall){document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.dataset.screen==='home'));}}

function render(){
 const now=new Date();byId('todayDate').textContent=now.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});updateClock();
 byId('nextEvent').textContent=data.nextDeparture?.title||'Nothing scheduled';byId('nextTime').textContent=data.nextDeparture?.time||'';byId('countdown').textContent=data.nextDeparture?.leaveText||'';updateDepartureCountdown();
 byId('dinnerPlan').textContent=data.dinner?.plan||'No meal planned';byId('mealNote').textContent=data.dinner?.note||'';
 const dinnerCard=document.querySelector('.dinner-card');if(dinnerCard){const recipeKey=data.dinner?.recipeKey||'';dinnerCard.classList.toggle('clickable-card',!!recipeKey&&!document.body.classList.contains('wall-mode'));dinnerCard.onclick=recipeKey&&!document.body.classList.contains('wall-mode')?()=>openRecipe(recipeKey,data.dinner?.plan||recipeKey,data.dinner?.row||null):null;}
 const homeHealthCard=byId('homeHealthCard'),dayLoadCard=byId('dayLoadCard');if(!document.body.classList.contains('wall-mode')){if(homeHealthCard){homeHealthCard.classList.add('clickable-card');homeHealthCard.onclick=()=>goToScreen('house');}if(dayLoadCard){dayLoadCard.classList.add('clickable-card');dayLoadCard.onclick=()=>goToScreen('today');}}
 const readyStoreKey='santangeloReady:'+String(data.departureKey||'current');
 const saved=JSON.parse(localStorage.getItem(readyStoreKey)||'{}');
 const readinessItems=data.readiness||[];
 const groupedReadiness=readinessItems.reduce((groups,x,i)=>{const person=String(x.name||'Family').trim()||'Family';(groups[person]||(groups[person]=[])).push({x,i});return groups;},{});
 const wallMode=document.body.classList.contains('wall-mode');
 if(!readinessItems.length){
   byId('readyList').innerHTML='<div class="subtle">Nothing needs to be packed for another departure today.</div>';
 } else if(wallMode){
   byId('readyList').innerHTML=Object.entries(groupedReadiness).map(([person,rows])=>`<section class="ready-person-group wall-ready-person"><div class="ready-person-name">${esc(person)}</div><ul class="wall-ready-items">${rows.map(({x})=>`<li>${esc(x.detail||x.required||'Ready')}</li>`).join('')}</ul></section>`).join('');
 } else {
   byId('readyList').innerHTML=Object.entries(groupedReadiness).map(([person,rows])=>`<section class="ready-person-group"><div class="ready-person-name">${esc(person)}</div><div class="ready-check-items">${rows.map(({x,i})=>{const itemKey=x.id||`${x.name}|${x.detail}`,r=saved[itemKey]??x.ready;return `<label class="ready-check-row ${r?'ready':''}"><input type="checkbox" data-ready-index="${i}" ${r?'checked':''}><span>${esc(x.detail||x.required||'Ready')}</span>${x.required==='Optional'?'<small>Optional</small>':''}</label>`;}).join('')}</div></section>`).join('');
   document.querySelectorAll('input[data-ready-index]').forEach(input=>input.addEventListener('change',()=>{const x=data.readiness[+input.dataset.readyIndex],itemKey=x.id||`${x.name}|${x.detail}`,store=JSON.parse(localStorage.getItem(readyStoreKey)||'{}');store[itemKey]=input.checked;localStorage.setItem(readyStoreKey,JSON.stringify(store));render();}));
 }
 byId('scheduleList').innerHTML=(data.schedule||[]).map(x=>`<div class="timeline-item"><div class="timeline-time">${esc(x.time)}</div><div>${esc(x.title)}</div></div>`).join('');
 byId('decisionList').innerHTML=(data.decisions||[]).map(x=>`<div class="decision-item">${esc(x)}</div>`).join('');
 renderHomeMetrics();renderShopping();renderMealPlan();renderFourWeekCalendar();renderChores();renderTasks();
 const health=(data.householdHealth||[]).map(x=>({name:x.name,status:x.summary,level:x.level,items:[]})),cards=[...(data.house||[]),...health];byId('houseGrid').innerHTML=cards.map(x=>`<article class="card house-status status-${esc(x.level||'good')}"><p class="card-label">${esc(x.name).toUpperCase()}</p><h3>${esc(x.status)}</h3>${x.items?.length?`<ul class="ops-list">${x.items.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>`:''}</article>`).join('');
}
let moduleLoads={};
let reconnectTimer=null;
function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
async function fetchModuleAttempt(base,action,timeoutMs){
 const sep=base.includes('?')?'&':'?';const url=base+sep+'action='+encodeURIComponent(action)+'&_ts='+Date.now();
 const controller=typeof AbortController!=='undefined'?new AbortController():null;const timer=controller?setTimeout(()=>controller.abort(),timeoutMs):null;
 try{const r=await fetch(url,{cache:'no-store',credentials:'omit',signal:controller?controller.signal:undefined});if(!r.ok)throw new Error('HTTP '+r.status);const j=await r.json();if(j.error)throw new Error(j.message||'API error');return j;}finally{if(timer)clearTimeout(timer);}
}
async function loadModule(action,{quiet=false,timeout=60000}={}){
 if(moduleLoads[action])return moduleLoads[action];const base=getApiBase();if(!base)throw new Error('API URL missing');
 moduleLoads[action]=(async()=>{try{if(!quiet)setSystemStatus('LOADING '+action.toUpperCase()+'…','connecting');const j=await fetchModuleAttempt(base,action,timeout);mergePayload(j);if(!quiet)setSystemStatus('LIVE v'+(j.apiVersion||data.apiVersion)+' · UI '+CURRENT_FRONTEND_VERSION,'live');return j;}finally{delete moduleLoads[action];}})();
 return moduleLoads[action];
}
function scheduleReconnect(delayMs=60000){if(reconnectTimer)clearTimeout(reconnectTimer);reconnectTimer=setTimeout(()=>{reconnectTimer=null;refreshFromApi();},delayMs);}
function versionParts(v){return String(v||'').replace(/^v/i,'').split(/[^0-9]+/).filter(Boolean).map(Number);}
function versionAtLeast(v,min){const a=versionParts(v),b=versionParts(min),n=Math.max(a.length,b.length);for(let i=0;i<n;i++){const x=a[i]||0,y=b[i]||0;if(x>y)return true;if(x<y)return false;}return true;}
async function migrateStaleApiEndpointIfNeeded(homePayload){
 const saved=(localStorage.getItem('santangeloApiUrl')||'').trim();
 if(!saved||saved===DEFAULT_API_URL||versionAtLeast(homePayload?.apiVersion,MIN_CURRENT_API_VERSION))return homePayload;
 try{
  const newer=await fetchModuleAttempt(DEFAULT_API_URL,'home',30000);
  if(versionAtLeast(newer?.apiVersion,MIN_CURRENT_API_VERSION)&&!versionAtLeast(homePayload?.apiVersion,MIN_CURRENT_API_VERSION)){
   localStorage.setItem('santangeloApiUrl',DEFAULT_API_URL);
   const apiInput=byId('apiUrl');if(apiInput)apiInput.value=DEFAULT_API_URL;
   mergePayload(newer);
   setSystemStatus('LIVE v'+(newer.apiVersion||data.apiVersion)+' · endpoint updated','live');
   return newer;
  }
 }catch(e){console.warn('Could not test current default API endpoint',e);}
 return homePayload;
}
async function refreshFromApi(){
 try{
  setSystemStatus('CONNECTING · loading home','connecting');
  const homePayload=await loadModule('home',{quiet:true,timeout:60000});
  await migrateStaleApiEndpointIfNeeded(homePayload);
  setSystemStatus('LIVE v'+data.apiVersion+' · UI '+CURRENT_FRONTEND_VERSION,'live');
  // Calendar is the only second module Home needs. Load it independently so it cannot block the rest of Home.
  loadModule('calendar',{quiet:true,timeout:60000}).catch(e=>console.warn('Calendar module failed',e));
  if(reconnectTimer){clearTimeout(reconnectTimer);reconnectTimer=null;}
 }catch(e){const cached=readLastLiveData();const reason=e&&e.name==='AbortError'?'slow connection / timeout':(e.message||'connection failed');if(cached){data=cached;setSystemStatus('OFFLINE · last live data · '+reason,'offline');render();}else{data=cloneData(blankData);setSystemStatus('CONNECTION ERROR · '+reason,'error');render();}scheduleReconnect(60000);}
}
async function refreshCurrentScreen(target){
 if(target==='home'){await Promise.allSettled([loadModule('home',{quiet:true}),loadModule('calendar',{quiet:true})]);}
 else if(target==='meals')await loadModule('meals',{quiet:true});
 else if(target==='shopping')await loadModule('shopping',{quiet:true});
 else if(target==='tasks')await loadModule('tasks',{quiet:true});
 else if(target==='today')await loadModule('home',{quiet:true});
 else if(target==='house')await Promise.allSettled([loadModule('chores',{quiet:true}),loadModule('house',{quiet:true})]);
}
function goToScreen(target){document.querySelectorAll('.nav-btn').forEach(x=>x.classList.toggle('active',x.dataset.target===target));document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.dataset.screen===target));window.scrollTo({top:0,behavior:'smooth'});refreshCurrentScreen(target).catch(e=>{console.warn('Module load failed',target,e);setSystemStatus('PARTIAL · '+target+' unavailable','offline');});}
document.querySelectorAll('.nav-btn').forEach(b=>b.onclick=()=>goToScreen(b.dataset.target));
byId('approveWeek').onclick=async()=>{try{byId('approveWeek').disabled=true;await apiAction('approveWeek');}catch(e){alert(e.message);}finally{byId('approveWeek').disabled=false;}};
applyDisplayMode();byId('saveApi').onclick=()=>{localStorage.setItem('santangeloApiUrl',byId('apiUrl').value.trim());localStorage.setItem('santangeloWeatherLocation',byId('weatherLocation').value.trim());refreshWeather();refreshFromApi();};byId('resetReady').onclick=()=>{localStorage.removeItem('santangeloReady:'+String(data.departureKey||'current'));render();};byId('apiUrl').value=getApiBase();byId('weatherLocation').value=localStorage.getItem('santangeloWeatherLocation')||DEFAULT_WEATHER_LOCATION;byId('addShoppingItem')?.addEventListener('click',addShoppingItem);byId('addTask')?.addEventListener('click',addTask);byId('taskInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')addTask();});byId('shoppingItem')?.addEventListener('keydown',e=>{if(e.key==='Enter')addShoppingItem();});updateClock();refreshWeather();refreshFromApi();setInterval(()=>loadModule('departure',{quiet:true}).catch(()=>{}),2*60*1000);setInterval(()=>loadModule('home',{quiet:true}).catch(()=>{}),5*60*1000);setInterval(()=>loadModule('calendar',{quiet:true}).catch(()=>{}),10*60*1000);setInterval(updateDepartureCountdown,30000);setInterval(updateClock,30000);setInterval(refreshWeather,60*60*1000);


// v0.10.2a Android notification test
let santangeloServiceWorkerRegistration=null;
function notificationSupport(){
 return 'Notification' in window && 'serviceWorker' in navigator;
}
function updateNotificationUi(message=''){
 const status=byId('notificationStatus'),enable=byId('enableNotifications'),test=byId('testNotification'),help=byId('notificationHelp');
 if(!status||!enable||!test||!help)return;
 if(!notificationSupport()){
  status.textContent='Not supported in this browser';status.className='notification-status is-blocked';enable.disabled=true;test.disabled=true;help.textContent='Open the installed Santangelo OS app in Chrome on Android.';return;
 }
 const permission=Notification.permission;
 if(permission==='granted'){
  status.textContent='Notifications enabled';status.className='notification-status is-ready';enable.textContent='Notifications enabled ✓';enable.disabled=true;test.disabled=!santangeloServiceWorkerRegistration;help.textContent=message||'Ready for a test notification on this device.';
 }else if(permission==='denied'){
  status.textContent='Notifications blocked';status.className='notification-status is-blocked';enable.textContent='Notifications blocked';enable.disabled=true;test.disabled=true;help.textContent='Android has blocked notifications for Santangelo OS. Re-enable them in the app/site notification settings, then reopen the app.';
 }else{
  status.textContent='Notifications not enabled';status.className='notification-status';enable.textContent='Enable notifications';enable.disabled=false;test.disabled=true;help.textContent=message||'Tap Enable notifications, then choose Allow when Android asks.';
 }
}
async function registerSantangeloServiceWorker(){
 if(!notificationSupport()){updateNotificationUi();return null;}
 try{
  santangeloServiceWorkerRegistration=await navigator.serviceWorker.register('./service-worker.js?v=0.10.2b',{scope:'./'});
  await navigator.serviceWorker.ready;
  updateNotificationUi('Notification service is ready on this device.');
  return santangeloServiceWorkerRegistration;
 }catch(err){
  console.error('Service worker registration failed',err);
  const help=byId('notificationHelp');if(help)help.textContent='Could not start notification service: '+err.message;
  return null;
 }
}
async function enableSantangeloNotifications(){
 if(!notificationSupport()){updateNotificationUi();return;}
 try{
  const permission=await Notification.requestPermission();
  if(permission==='granted'&&!santangeloServiceWorkerRegistration)await registerSantangeloServiceWorker();
  updateNotificationUi(permission==='granted'?'Permission granted. Send the test notification next.':'');
 }catch(err){
  const help=byId('notificationHelp');if(help)help.textContent='Could not request notification permission: '+err.message;
 }
}
async function sendSantangeloTestNotification(){
 try{
  if(Notification.permission!=='granted'){updateNotificationUi();return;}
  const reg=santangeloServiceWorkerRegistration||await registerSantangeloServiceWorker();
  if(!reg)throw new Error('Notification service is not ready.');
  await reg.showNotification('Santangelo OS', {
   body:'Test successful — this phone can receive Santangelo OS notifications.',
   tag:'santangelo-test',
   renotify:true,
   data:{url:'./?screen=tasks'}
  });
  updateNotificationUi('Test sent. You should see a Santangelo OS notification now.');
 }catch(err){
  const help=byId('notificationHelp');if(help)help.textContent='Could not show test notification: '+err.message;
 }
}
byId('enableNotifications')?.addEventListener('click',enableSantangeloNotifications);
byId('testNotification')?.addEventListener('click',sendSantangeloTestNotification);
registerSantangeloServiceWorker();


// v0.10.2b real push delivery via OneSignal
let santangeloOneSignal=null;
let santangeloPushConnected=false;
async function fetchPushConfig(){
 const base=getApiBase();if(!base)throw new Error('API URL missing');
 const u=new URL(base);u.searchParams.set('action','pushconfig');u.searchParams.set('_ts',Date.now());
 const r=await fetch(u.toString(),{cache:'no-store',credentials:'omit'});if(!r.ok)throw new Error('HTTP '+r.status);
 const j=await r.json();if(j.error)throw new Error(j.message||'Push configuration unavailable');return j;
}
function updatePushButtons(message=''){
 const connect=byId('connectPush'),serverTest=byId('backendTestNotification'),help=byId('notificationHelp');
 if(connect){connect.textContent=santangeloPushConnected?'Reminder delivery connected ✓':'Connect reminder delivery';connect.disabled=santangeloPushConnected;}
 if(serverTest)serverTest.disabled=!santangeloPushConnected;
 if(help&&message)help.textContent=message;
}
async function connectSantangeloPush(){
 try{
  updatePushButtons('Connecting this device to scheduled reminder delivery…');
  const cfg=await fetchPushConfig();
  if(!cfg.appId)throw new Error('OneSignal App ID has not been configured in Apps Script yet.');
  window.OneSignalDeferred=window.OneSignalDeferred||[];
  await new Promise((resolve,reject)=>{
   let settled=false;
   window.OneSignalDeferred.push(async function(OneSignal){
    try{
     santangeloOneSignal=OneSignal;
     const oneSignalDir=new URL('./push/onesignal/',location.href);
     const oneSignalScope=oneSignalDir.pathname;
     const oneSignalWorkerPath=new URL('OneSignalSDKWorker.js',oneSignalDir).pathname.replace(/^\/+/, '');
     await OneSignal.init({appId:cfg.appId,serviceWorkerPath:oneSignalWorkerPath,serviceWorkerParam:{scope:oneSignalScope},autoResubscribe:true});
     await OneSignal.login(cfg.externalId||'santangelo-primary');
     if(Notification.permission!=='granted')await OneSignal.Notifications.requestPermission();
     if(OneSignal.User&&OneSignal.User.PushSubscription&&!OneSignal.User.PushSubscription.optedIn)await OneSignal.User.PushSubscription.optIn();
     santangeloPushConnected=true;settled=true;updatePushButtons('Connected. Scheduled task reminders can now reach this device even when the app is closed.');resolve();
    }catch(err){settled=true;reject(err);}
   });
   setTimeout(()=>{if(!settled)reject(new Error('Push service did not finish loading. Check the OneSignal App ID and service-worker path.'));},15000);
  });
 }catch(err){console.error('Push connection failed',err);santangeloPushConnected=false;updatePushButtons('Could not connect reminder delivery: '+err.message);}
}
async function sendBackendTestNotification(){
 const btn=byId('backendTestNotification');
 try{if(btn){btn.disabled=true;btn.textContent='Sending…';}await apiAction('testpush',{});updatePushButtons('Server test sent. It should arrive even after you leave Santangelo OS.');}
 catch(err){updatePushButtons('Server test failed: '+err.message);}
 finally{if(btn){btn.disabled=!santangeloPushConnected;btn.textContent='Send server test';}}
}
byId('connectPush')?.addEventListener('click',connectSantangeloPush);
byId('backendTestNotification')?.addEventListener('click',sendBackendTestNotification);
