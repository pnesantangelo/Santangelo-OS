const demoData = {
  generatedAt: "2026-08-03T11:14:00-07:00",
  state: "Late Sports Night",
  dayLoad: "Heavy",
  familyFocus: "Get everyone fed, clean, connected, and into bed efficiently.",
  whatCanWait: "Deep cleaning, optional organizing, and nonurgent projects.",
  nextDeparture: {
    title: "Gators Practice",
    time: "6:00 PM",
    leaveText: "Leave in 1 hr 12 min"
  },
  dinner: {
    plan: "Use leftovers, seconds, protein bites, granola bars, or suitable fridge food.",
    note: "Only tasks that prevent tomorrow-morning problems."
  },
  readiness: [
    { name: "Carson", detail: "Phone, water, uniform", ready: false },
    { name: "Nathan", detail: "Water, mouthguard, flags", ready: false },
    { name: "Addison", detail: "Chair, snack, water", ready: false },
    { name: "Mom", detail: "Field bag, chair, keys", ready: false },
    { name: "Dad", detail: "Coach bag, lineup card", ready: false }
  ],
  people: [
    { name: "Carson", title: "The Quiet Leader", prompt: "Lead by helping. Ask for help before frustration takes over." },
    { name: "Nathan", title: "The Protector", prompt: "Use your mind, heart, and energy to build. A corrected choice does not change who you are." },
    { name: "Addison", title: "The Light", prompt: "Today's plan is clear. You will get a warning before changes and transitions." },
    { name: "Erin", title: "Today's Decisions", prompt: "Use the simplest workable plan. Essentials count as success today." },
    { name: "Phillip", title: "One Next Action", prompt: "Pick one next action. Do not solve the whole project tonight." }
  ],
  schedule: [
    { time: "6:00 AM", title: "Workout" },
    { time: "6:00 PM", title: "Gators Practice" }
  ],
  decisions: [
    "Use the role-based sports checklist.",
    "Load gear before the departure countdown.",
    "Dinner and shower order can flex.",
    "Showers and tooth-brushing remain essential."
  ],
  house: [
    {
      name: "Grocery List",
      status: "4 items",
      level: "action",
      items: ["paper plates", "spaghetti noodles", "stain remover", "milk"]
    },
    {
      name: "Pantry — Buy Now",
      status: "2 items",
      level: "action",
      items: ["Milk", "Bread"]
    },
    {
      name: "Pantry — Low",
      status: "2 items",
      level: "watch",
      items: ["Eggs", "Laundry detergent"]
    },
    {
      name: "Maintenance — High",
      status: "3 items",
      level: "action",
      items: ["Clean dryer lint area", "Replace HVAC filter", "Repair backpack hook"]
    },
    {
      name: "Maintenance — Due",
      status: "More tasks available",
      level: "watch",
      items: ["Wipe baseboards", "Dust ceiling fans", "Vacuum under couches", "Clean refrigerator shelves"]
    },
    {
      name: "Sports Readiness",
      status: "Keep lockers and bags ready",
      level: "good",
      items: ["Clean sports bags", "Deep-clean reusable bottles"]
    }
  ]
};

let data = structuredClone(demoData);

function byId(id) { return document.getElementById(id); }

function render() {
  const now = new Date();
  byId("todayDate").textContent = now.toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric"
  });

  byId("stateName").textContent = data.state || "Normal Day";
  byId("dayLoad").textContent = `${data.dayLoad || "Normal"} day`;
  byId("nextEvent").textContent = data.nextDeparture?.title || "Nothing scheduled";
  byId("nextTime").textContent = data.nextDeparture?.time || "";
  byId("countdown").textContent = data.nextDeparture?.leaveText || "";
  byId("dinnerPlan").textContent = data.dinner?.plan || "No meal planned";
  byId("mealNote").textContent = data.dinner?.note || "";
  byId("familyFocus").textContent = data.familyFocus || "";
  byId("whatCanWait").textContent = data.whatCanWait || "";

  const savedReady = JSON.parse(localStorage.getItem("santangeloReady") || "{}");
  byId("readyList").innerHTML = data.readiness.map((item, index) => {
    const isReady = savedReady[item.name] ?? item.ready;
    return `<div class="ready-item ${isReady ? "ready" : ""}" data-ready-index="${index}">
      <div>
        <div class="ready-name">${item.name}</div>
        <div class="ready-status">${isReady ? "Ready ✓" : "Tap when ready"}</div>
      </div>
      <div class="subtle small">${item.detail || ""}</div>
    </div>`;
  }).join("");

  document.querySelectorAll("[data-ready-index]").forEach(el => {
    el.addEventListener("click", () => {
      const item = data.readiness[Number(el.dataset.readyIndex)];
      const current = JSON.parse(localStorage.getItem("santangeloReady") || "{}");
      current[item.name] = !(current[item.name] ?? item.ready);
      localStorage.setItem("santangeloReady", JSON.stringify(current));
      render();
    });
  });

  byId("familyCards").innerHTML = data.people.map(person => `
    <article class="card person-card">
      <p class="card-label">${person.name.toUpperCase()}</p>
      <h3 class="person-title">${person.title}</h3>
      <p class="person-prompt">${person.prompt}</p>
    </article>
  `).join("");

  byId("scheduleList").innerHTML = data.schedule.map(item => `
    <div class="timeline-item">
      <div class="timeline-time">${item.time}</div>
      <div>${item.title}</div>
    </div>
  `).join("");

  byId("decisionList").innerHTML = data.decisions.map(item =>
    `<div class="decision-item">${item}</div>`
  ).join("");

  byId("houseGrid").innerHTML = data.house.map(item => {
    const list = Array.isArray(item.items) && item.items.length
      ? `<ul class="ops-list">${item.items.map(x => `<li>${x}</li>`).join("")}</ul>`
      : "";
    return `
      <article class="card house-status status-${item.level || "good"}">
        <p class="card-label">${item.name.toUpperCase()}</p>
        <h3>${item.status}</h3>
        ${list}
      </article>
    `;
  }).join("");
}

async function refreshFromApi() {
  const url = localStorage.getItem("santangeloApiUrl");
  if (!url) {
    data = structuredClone(demoData);
    byId("systemStatus").textContent = "Demo data";
    render();
    return;
  }

  try {
    byId("systemStatus").textContent = "Refreshing…";
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    data = await response.json();
    byId("systemStatus").textContent = "Live";
    render();
  } catch (error) {
    console.error(error);
    byId("systemStatus").textContent = "Connection issue";
    data = structuredClone(demoData);
    render();
  }
}

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(x => x.classList.remove("active"));
    document.querySelectorAll(".screen").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    document.querySelector(`[data-screen="${btn.dataset.target}"]`).classList.add("active");
  });
});

byId("saveApi").addEventListener("click", () => {
  const value = byId("apiUrl").value.trim();
  localStorage.setItem("santangeloApiUrl", value);
  refreshFromApi();
});

byId("useDemo").addEventListener("click", () => {
  localStorage.removeItem("santangeloApiUrl");
  byId("apiUrl").value = "";
  refreshFromApi();
});

byId("resetReady").addEventListener("click", () => {
  localStorage.removeItem("santangeloReady");
  render();
});

byId("apiUrl").value = localStorage.getItem("santangeloApiUrl") || "";
refreshFromApi();
setInterval(refreshFromApi, 5 * 60 * 1000);
