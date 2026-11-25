/* =========================================================
   ITUS102 - Practical 6 : WanderGo Travels
   Timers, callbacks, Fetch API (JSON), error handling,
   Local Storage and Session Storage.
   Run with Live Server for real fetch(); opening the file directly
   uses the built-in backup list (browsers block fetch on file://).
   ========================================================= */

"use strict";

const DATA_FILE = "data/packages.json";

/* Backup copy of data/packages.json (used only on file://) */
const BACKUP_DATA = [
  { id: 101, title: "Royal Rajasthan Circuit", place: "Jaipur, India", zone: "India", cost: 22999, nights: 5, score: 4.6, icon: "🏰", about: "Amber Fort, City Palace, camel ride at Pushkar and a heritage haveli stay." },
  { id: 102, title: "Kerala Backwater Bliss", place: "Alleppey, India", zone: "India", cost: 19999, nights: 4, score: 4.5, icon: "🛶", about: "Private houseboat, Munnar tea gardens and an Ayurvedic spa evening." },
  { id: 103, title: "Ladakh High Passes", place: "Leh, India", zone: "India", cost: 31999, nights: 7, score: 4.8, icon: "🏔️", about: "Pangong Lake, Nubra Valley, monasteries and the Khardung La drive." },
  { id: 104, title: "Tokyo Cherry Blossom", place: "Tokyo, Japan", zone: "Asia", cost: 119999, nights: 7, score: 4.7, icon: "🌸", about: "Shibuya, Asakusa, Mount Fuji day trip and a bullet train ride to Kyoto." },
  { id: 105, title: "Maldives Overwater Stay", place: "Male, Maldives", zone: "Asia", cost: 99999, nights: 4, score: 4.9, icon: "🐠", about: "Water villa, snorkelling with reef sharks and a sandbank picnic." },
  { id: 106, title: "Singapore Family Fun", place: "Singapore", zone: "Asia", cost: 64999, nights: 5, score: 4.4, icon: "🦁", about: "Gardens by the Bay, Sentosa, Universal Studios and a night safari." },
  { id: 107, title: "Roman Holiday", place: "Rome, Italy", zone: "Europe", cost: 104999, nights: 6, score: 4.5, icon: "🏛️", about: "Colosseum, Vatican museums, Trevi Fountain and a pasta cooking class." },
  { id: 108, title: "Iceland Northern Lights", place: "Reykjavik, Iceland", zone: "Europe", cost: 139999, nights: 6, score: 4.8, icon: "🌌", about: "Golden Circle, Blue Lagoon and a guided aurora hunt." }
];

/* ---------- element handles ---------- */
const $ = function (id) { return document.getElementById(id); };

const toastEl = $("toast");
const tickerText = $("ticker-text");
const saleClock = $("sale-clock");
const tickerBtn = $("ticker-btn");
const saleBtn = $("sale-btn");
const searchInput = $("q");
const zoneSelect = $("zone");
const sortSelect = $("sort");
const refreshBtn = $("refresh");
const breakBtn = $("break-net");
const statusBox = $("status");
const cardsBox = $("cards");
const countBadge = $("count-badge");
const wishList = $("wish-list");
const sessionInfo = $("session-info");
const wishClear = $("wish-clear");
const sessionClear = $("session-clear");
const labRun = $("lab-run");
const labLog = $("lab-log");
const modeButtons = document.querySelectorAll("[data-mode]");

let packages = [];

/* =========================================================
   STORAGE WRAPPERS (try/catch: storage may be blocked)
   ========================================================= */
const store = {
  local: {
    get: function (k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } },
    wipe: function () { try { localStorage.clear(); } catch (e) { /* ignore */ } }
  },
  session: {
    get: function (k, d) { try { const v = sessionStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* ignore */ } },
    wipe: function () { try { sessionStorage.clear(); } catch (e) { /* ignore */ } }
  }
};

// Wishlist is an array of ids saved as JSON text in Local Storage
function getWishIds() {
  try { return JSON.parse(store.local.get("wg2_wish", "[]")); } catch (e) { return []; }
}
function setWishIds(ids) { store.local.set("wg2_wish", JSON.stringify(ids)); }

/* =========================================================
   TOAST - uses setTimeout to auto-hide
   ========================================================= */
let toastTimer;
function toast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 3500);
}

/* =========================================================
   MODE (theme) - saved in Local Storage
   ========================================================= */
function setMode(mode) {
  document.body.classList.remove("night", "sunset");
  if (mode !== "day") { document.body.classList.add(mode); }
  modeButtons.forEach(function (btn) {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });
  store.local.set("wg2_mode", mode);
}

modeButtons.forEach(function (btn) {
  btn.addEventListener("click", function () {
    setMode(btn.dataset.mode);
    toast("Switched to " + btn.dataset.mode + " mode");
  });
});

/* =========================================================
   TIMERS
   setTimeout  -> welcome toast after 1.5 s
   setInterval -> deal ticker (every 3 s) and sale countdown (every 1 s)
   ========================================================= */
setTimeout(function () {
  toast("Welcome to WanderGo! Use code FIRST10 for 10% off.");
}, 1500);

const deals = [
  "Up to 20% off on Indian getaways",
  "Kids under 5 travel free on Singapore tours",
  "Free travel insurance on bookings above ₹50,000",
  "Early-bird: book Europe 60 days ahead and save 8%"
];
let dealPos = 0;
let tickerId = null;

function rotateDeal() {
  tickerText.textContent = deals[dealPos];
  dealPos = (dealPos + 1) % deals.length;
}

function runTicker() {
  rotateDeal();
  tickerId = setInterval(rotateDeal, 3000);
}

tickerBtn.addEventListener("click", function () {
  if (tickerId) {
    clearInterval(tickerId);
    tickerId = null;
    tickerBtn.textContent = "Resume deals";
  } else {
    runTicker();
    tickerBtn.textContent = "Pause deals";
  }
});

let saleLeft = 15 * 60;
let saleId = null;

function tickSale() {
  const mm = String(Math.floor(saleLeft / 60)).padStart(2, "0");
  const ss = String(saleLeft % 60).padStart(2, "0");
  saleClock.textContent = mm + ":" + ss;
  if (saleLeft <= 0) {
    clearInterval(saleId);
    saleId = null;
    saleClock.textContent = "ended";
    return;
  }
  saleLeft -= 1;
}

function runSale() {
  clearInterval(saleId);
  saleLeft = 15 * 60;
  tickSale();
  saleId = setInterval(tickSale, 1000);
}

saleBtn.addEventListener("click", runSale);

/* =========================================================
   STATUS BAR (loading / error / info)
   ========================================================= */
function setStatus(kind, message) {
  if (!kind) { statusBox.className = "status hidden"; statusBox.textContent = ""; return; }
  statusBox.className = "status " + kind;
  statusBox.textContent = message;

  // retry button for errors
  if (kind === "error") {
    const retry = document.createElement("button");
    retry.type = "button";
    retry.textContent = "Try again";
    retry.addEventListener("click", function () { startPipeline(DATA_FILE); });
    statusBox.append(" ", retry);
  }
}

function showSkeletons() {
  cardsBox.innerHTML = "";
  for (let i = 0; i < 4; i++) {
    const s = document.createElement("div");
    s.className = "skeleton";
    cardsBox.appendChild(s);
  }
}

/* =========================================================
   CALLBACK PIPELINE + FETCH
   step1 (prepare) -> step2 (fetch) -> step3 (show) -> step4 (finish)
   ========================================================= */
function step1Prepare(done) {
  setStatus("loading", "Contacting WanderGo servers...");
  showSkeletons();
  setTimeout(done, 700);                       // callback after a timer
}

function step2Fetch(url, onOk, onFail) {
  fetch(url)
    .then(function (res) {
      if (!res.ok) { throw new Error("HTTP " + res.status + " " + res.statusText); }
      return res.json();
    })
    .then(function (json) {
      if (!Array.isArray(json)) { throw new Error("Unexpected JSON shape"); }
      onOk(json);
    })
    .catch(onFail);
}

function step3Show(list, done) {
  packages = list;
  setStatus(null);
  draw();
  done();
}

function step4Finish() {
  zoneSelect.value = store.local.get("wg2_zone", "All");
  sortSelect.value = store.local.get("wg2_sort", "default");
  draw();
  drawStorage();
}

function startPipeline(url) {
  step1Prepare(function () {
    step2Fetch(
      url,
      function (data) { step3Show(data, step4Finish); },
      function (err) {
        if (location.protocol === "file:") {
          step3Show(BACKUP_DATA, step4Finish);
          setStatus("info", "Opened from disk, so fetch() is blocked. Showing built-in data. Use Live Server for the real request.");
        } else {
          cardsBox.innerHTML = "";
          setStatus("error", "Could not load packages (" + err.message + ").");
        }
      }
    );
  });
}

/* async/await version used by the Refresh button */
async function refreshData() {
  setStatus("loading", "Refreshing...");
  try {
    const res = await fetch(DATA_FILE, { cache: "no-store" });
    if (!res.ok) { throw new Error("HTTP " + res.status); }
    packages = await res.json();
    setStatus(null);
    draw();
    toast("Fresh data loaded: " + packages.length + " packages");
  } catch (err) {
    if (location.protocol === "file:") {
      packages = BACKUP_DATA;
      setStatus("info", "Opened from disk: showing built-in data.");
      draw();
    } else {
      setStatus("error", "Refresh failed (" + err.message + ").");
    }
  }
}

refreshBtn.addEventListener("click", refreshData);

// Ask for a file that does not exist to demonstrate graceful failure
breakBtn.addEventListener("click", function () {
  setStatus("loading", "Requesting data from an unreachable endpoint...");
  step2Fetch(
    "data/not-here.json",
    function () { setStatus(null); },
    function (err) {
      setStatus("error", "Network problem handled: " + err.message + ". Your existing packages are still shown below.");
      draw();
    }
  );
});

/* =========================================================
   DRAW CARDS (filter + sort + wishlist state)
   ========================================================= */
function draw() {
  const term = searchInput.value.trim().toLowerCase();
  const zone = zoneSelect.value;
  const sort = sortSelect.value;
  const loved = getWishIds();

  let list = packages.filter(function (p) {
    const zoneOk = zone === "All" || p.zone === zone;
    const textOk = p.title.toLowerCase().includes(term) || p.place.toLowerCase().includes(term);
    return zoneOk && textOk;
  });

  if (sort === "low") { list = list.slice().sort(function (a, b) { return a.cost - b.cost; }); }
  if (sort === "high") { list = list.slice().sort(function (a, b) { return b.cost - a.cost; }); }
  if (sort === "score") { list = list.slice().sort(function (a, b) { return b.score - a.score; }); }

  countBadge.textContent = list.length + (list.length === 1 ? " result" : " results");
  cardsBox.innerHTML = "";

  if (list.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "Nothing matches your filters yet.";
    cardsBox.appendChild(empty);
    return;
  }

  list.forEach(function (p) {
    const isLoved = loved.includes(p.id);

    const card = document.createElement("article");
    card.className = "card" + (isLoved ? " loved" : "");

    const icon = document.createElement("div");
    icon.className = "icon";
    icon.textContent = p.icon;

    const h3 = document.createElement("h3");
    h3.textContent = p.title;

    const place = document.createElement("div");
    place.className = "place";
    place.textContent = p.place + " | " + p.nights + " nights | ⭐ " + p.score;

    const about = document.createElement("p");
    about.className = "about";
    about.textContent = p.about;

    const cost = document.createElement("div");
    cost.className = "cost";
    cost.textContent = "₹" + p.cost.toLocaleString("en-IN");

    const loveBtn = document.createElement("button");
    loveBtn.type = "button";
    loveBtn.textContent = isLoved ? "💔 Remove" : "❤️ Wishlist";
    loveBtn.addEventListener("click", function () { toggleWish(p); });

    const viewBtn = document.createElement("button");
    viewBtn.type = "button";
    viewBtn.textContent = "👀 Quick view";
    viewBtn.addEventListener("click", function () { quickView(p); });

    card.append(icon, h3, place, about, cost, loveBtn, viewBtn);
    cardsBox.appendChild(card);
  });
}

/* ---------- wishlist (Local Storage) ---------- */
function toggleWish(pkg) {
  let ids = getWishIds();
  if (ids.includes(pkg.id)) {
    ids = ids.filter(function (id) { return id !== pkg.id; });
    toast("Removed " + pkg.title + " from wishlist");
  } else {
    ids.push(pkg.id);
    toast("Saved " + pkg.title + " to wishlist");
  }
  setWishIds(ids);
  draw();
  drawStorage();
}

/* ---------- quick view (Session Storage) ---------- */
function quickView(pkg) {
  store.session.set("wg2_last", pkg.title);
  const count = Number(store.session.get("wg2_viewed", "0")) + 1;
  store.session.set("wg2_viewed", String(count));
  toast(pkg.title + ": " + pkg.nights + " nights from ₹" + pkg.cost.toLocaleString("en-IN"));
  drawStorage();
}

/* ---------- storage panels ---------- */
function drawStorage() {
  wishList.innerHTML = "";
  const ids = getWishIds();
  const saved = packages.filter(function (p) { return ids.includes(p.id); });

  if (saved.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Nothing saved yet.";
    wishList.appendChild(li);
  } else {
    saved.forEach(function (p) {
      const li = document.createElement("li");
      li.textContent = p.title + " (₹" + p.cost.toLocaleString("en-IN") + ")";
      wishList.appendChild(li);
    });
  }

  sessionInfo.innerHTML = "";
  const rows = [
    "Visits in this tab: " + store.session.get("wg2_visits", "0"),
    "Packages viewed: " + store.session.get("wg2_viewed", "0"),
    "Last viewed: " + store.session.get("wg2_last", "none"),
    "Session began: " + store.session.get("wg2_began", "-")
  ];
  rows.forEach(function (text) {
    const li = document.createElement("li");
    li.textContent = text;
    sessionInfo.appendChild(li);
  });
}

wishClear.addEventListener("click", function () {
  setWishIds([]);
  draw();
  drawStorage();
  toast("Wishlist emptied");
});

sessionClear.addEventListener("click", function () {
  store.session.wipe();
  drawStorage();
  toast("Session data reset");
});

/* ---------- filter listeners ---------- */
searchInput.addEventListener("input", function () { draw(); });

zoneSelect.addEventListener("change", function () {
  store.local.set("wg2_zone", zoneSelect.value);   // remembered after reload
  draw();
});

sortSelect.addEventListener("change", function () {
  store.local.set("wg2_sort", sortSelect.value);
  draw();
});

/* =========================================================
   ASYNC LAB: nested callbacks with setTimeout
   ========================================================= */
function logLine(text) {
  const li = document.createElement("li");
  li.textContent = text;
  labLog.appendChild(li);
}

function pickDates(next) { setTimeout(function () { logLine("📅 Dates selected"); next(); }, 700); }
function addTravellers(next) { setTimeout(function () { logLine("🧑‍🤝‍🧑 Travellers added"); next(); }, 900); }
function payNow(next) { setTimeout(function () { logLine("💳 Payment successful"); next(); }, 1100); }

labRun.addEventListener("click", function () {
  labLog.innerHTML = "";
  logLine("▶️ Flow started");
  pickDates(function () {
    addTravellers(function () {
      payNow(function () {
        logLine("🎉 Booking confirmed!");
      });
    });
  });
});

/* =========================================================
   START
   ========================================================= */
function boot() {
  setMode(store.local.get("wg2_mode", "day"));

  store.session.set("wg2_visits", String(Number(store.session.get("wg2_visits", "0")) + 1));
  if (store.session.get("wg2_began", null) === null) {
    store.session.set("wg2_began", new Date().toLocaleTimeString());
  }

  runTicker();
  runSale();
  drawStorage();
  startPipeline(DATA_FILE);
}

boot();
