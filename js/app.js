/*
  app.js

  Centrale regie van FreeApps Exchange.

  Eigenaar van:
  - login/register flow
  - Supabase communicatie
  - bubble focus systeem
  - login status
  - post-login acties

  Gebruikt:
  - moon.js voor account UI
      setAccountMode()
      showLoginError()
      createMoonShadow()

  Niet eigenaar van:
  - maan-schaduw implementatie
  - account scherm layout
*/
/*
  Nog in app.js aanwezig rond account:
  - account eventlisteners
  - account focus/dim/far classes
  - logged-in-moon class na login

  Later eventueel naar moon.js:
  - account focus helpers
  - account logged-in state helpers
*/

const home = document.getElementById("home");
const search = document.getElementById("search");
const account = document.getElementById("account");
const accountTitle = document.getElementById("accountTitle");
const accountStart = document.getElementById("accountStart");
const accountForm = document.getElementById("accountForm");
const showLogin = document.getElementById("showLogin");
const showRegister = document.getElementById("showRegister");
const backToAccountStart = document.getElementById("backToAccountStart");
const loginMessage = document.getElementById("loginMessage");
const exportUsersJson = document.getElementById("exportUsersJson");
const forgotPassword = document.getElementById("forgotPassword");
const submitButton = document.getElementById("accountSubmit");
const nameInput = document.getElementById("loginName");
const emailInput = document.getElementById("loginEmail");
const passwordInput = document.getElementById("loginPassword");
const passwordConfirmInput = document.getElementById("loginPasswordConfirm");
const SUPABASE_URL = "https://njefjypajmbolkufgkgd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZWZqeXBham1ib2xrdWZna2dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNDQyNjksImV4cCI6MjA5NjYyMDI2OX0.mUZSAB8mxExzXQM3OK55mfYnGZVhl1QmyLNwv64V-Mo";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let loggedIn = false;
let appBubblesCreated = false;
let accountMode = "start";
let selectedPlatform = null;
let productModalOpen = false;
let dbApps = [];

let speedFactor = 1;



// Zelfde structuur als data/apps.json. Later kan dit rechtstreeks uit Supabase komen.
const appData = {
  platforms: [
    { id: "apk", label: "APK" },
    { id: "pwa", label: "PWA" }
  ],
  categories: [
    { id: "games", label: "GAMES", planet: "assets/images/planet-games.png" },
    { id: "utilities", label: "UTILITIES", planet: "assets/images/planet-utilities.png" },
    { id: "tools", label: "TOOLS", planet: "assets/images/planet-tools.png" }
  ],
  apps: [
    {
      id: "10letterwoord",
      name: "10LetterWoord",
      platform: "apk",
      category: "games",
      version: "0.1",
      author: "FScreations",
      status: "Testversie",
      description: "Woordspel met woorden van tien letters.",
      screenshot: "assets/images/LSw.jpg",
      size: "-",
      updated_at: "-",
      readme: [
        "Woordspel",
        "Puzzel",
        "Nederlandstalig"
      ],
      download_url: "downloads/10letterwoord.apk"
    },
    {
      id: "latinsquare",
      name: "LatinSquare",
      platform: "apk",
      category: "games",
      version: "0.1",
      author: "FScreations",
      status: "Testversie",
      description: "Logisch kleurenspel gebaseerd op een Latin square.",
      screenshot: "assets/images/LS.jpg",
      size: "-",
      updated_at: "-",
      readme: [
        "Logisch spel",
        "Kleurenpuzzel",
        "Meerdere levels"
      ],
      download_url: "downloads/latinsquare.apk"
    },
    {
      id: "letterwissel",
      name: "LetterWissel",
      platform: "apk",
      category: "games",
      version: "0.1",
      author: "FScreations",
      status: "Testversie",
      description: "Letterspel waarbij je letters wisselt om woorden te maken.",
      screenshot: "assets/images/LW.jpg",
      size: "-",
      updated_at: "-",
      readme: [
        "Letterspel",
        "Woordpuzzel",
        "Rustige gameplay"
      ],
      download_url: "downloads/letterwissel.apk"
    },
    {
      id: "familieconnect",
      name: "FamilieConnect",
      platform: "apk",
      category: "utilities",
      version: "0.1",
      author: "FScreations",
      status: "Testversie",
      description: "Familietracker voor gezinnen, kinderen en mantelzorgers.",
      screenshot: "assets/images/FC.jpg",
      size: "15.3 MB",
      updated_at: "24 mei 2025",
      readme: [
        "Live locatie",
        "SOS functie",
        "Lage batterijbelasting",
        "Privacyvriendelijk"
      ],
      download_url: "downloads/familieconnect.apk"
    },
    {
      id: "mini-intercom",
      name: "Mini-Intercom",
      platform: "apk",
      category: "utilities",
      version: "0.1",
      author: "FScreations",
      status: "Testversie",
      description: "Eenvoudige intercom-app voor snelle spraakverbinding.",
      screenshot: "assets/images/FC.jpg",
      size: "-",
      updated_at: "-",
      readme: [
        "Spraakverbinding",
        "Kamer met PIN",
        "Eenvoudig gebruik"
      ],
      download_url: "downloads/mini-intercom.apk"
    }
  ]
};

const platformMap = Object.fromEntries(appData.platforms.map(item => [item.id, item]));
const categoryMap = Object.fromEntries(appData.categories.map(item => [item.id, item]));
const appMap = Object.fromEntries(appData.apps.map(item => [item.id, item]));

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}
function createIntroStars() {
  const layer = document.getElementById("introStars");
  if (!layer) return;

  layer.innerHTML = "";

  for (let i = 0; i < 260; i++) {
    const star = document.createElement("span");
    star.className = "intro-star";
    star.style.setProperty("--x", `${Math.random() * 100}%`);
    star.style.setProperty("--y", `${Math.random() * 100}%`);
    star.style.setProperty("--s", `${Math.random() * 2.4 + 0.6}px`);
    star.style.setProperty("--o", `${Math.random() * 0.75 + 0.25}`);
    layer.appendChild(star);
  }
}

function createDownloadUpload() {
  if (appBubblesCreated) return;

  appBubblesCreated = true;

  createAppBubble("download");
  createAppBubble("upload");
}

async function startLayout() {

  createIntroStars();

  const intro = document.getElementById("introBirth");

  await sleep(400);

  intro?.classList.add("run");

  setTimeout(() => {
    document.querySelector(".intro-title")?.classList.add("show");
  }, 11000);

  setTimeout(() => {
    document.querySelector(".intro-text-top")?.classList.add("show");
  }, 13000);

  setTimeout(() => {
    document.querySelector(".intro-text-bottom")?.classList.add("show");
  }, 15000);

  setTimeout(() => {
    document.querySelector(".intro-title")?.classList.add("hide");
    document.querySelector(".intro-text-top")?.classList.add("hide");
    document.querySelector(".intro-text-bottom")?.classList.add("hide");
  }, 18500);

setTimeout(async () => {
  await sleep(5450);

openAccountMoon();
}, 10000);
}

const USERS_STORAGE_KEY = "freeAppSwap_users_json";


function clearLoginError() {
  loginMessage.textContent = "";
}

function normalize(text) {
  return String(text || "").trim().toLowerCase();
}

function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

function base64ToBytes(base64) {
  return Uint8Array.from(atob(base64), char => char.charCodeAt(0));
}

async function hashPassword(password, saltBase64 = null) {
  const encoder = new TextEncoder();
  const salt = saltBase64 ? base64ToBytes(saltBase64) : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 120000,
      hash: "SHA-256"
    },
    keyMaterial,
    256
  );
  return {
    algorithm: "PBKDF2-SHA256",
    iterations: 120000,
    salt: bytesToBase64(salt),
    hash: bytesToBase64(bits)
  };
}

async function verifyPassword(password, user) {
  if (user.password_plain_for_prototype) {
    return user.password_plain_for_prototype === password;
  }
  if (!user.password || !user.password.salt || !user.password.hash) return false;
  const candidate = await hashPassword(password, user.password.salt);
  return candidate.hash === user.password.hash;
}

async function createUserRecord({ name, email, password }) {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `local_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    name,
    email,
    password: await hashPassword(password),
    role: "member",
    status: "active",
    created_at: now,
    updated_at: now,
    last_login_at: now
  };
}

function finishLogin(user) {

  setTimeout(() => {

  createAppBubble("download");
  createAppBubble("upload");

  appBubblesCreated = true;

  search.classList.add("open");

  if (String(user.role || "").trim().toLowerCase() === "admin") {
    createAdminBubble();
  }
}, 900);
  loggedIn = true;
  

  const welcome = document.getElementById("welcomeUser");

if (welcome) {
  welcome.textContent = `Welkom ${user.name}`;
  welcome.classList.add("show");
}

  clearFocusStates();
  document.body.classList.add("day-open");
  setMoonLoggedIn();
  createMoonShadow();
  setMoonLoggedIn();
}

account.addEventListener("mouseenter", () => focusBubble("account"));
account.addEventListener("click", () => focusBubble("account"));

showLogin.addEventListener("click", event => {
  event.stopPropagation();
  setAccountMode("login");
});

showRegister.addEventListener("click", event => {
  event.stopPropagation();
  setAccountMode("register");
});

backToAccountStart.addEventListener("click", event => {
  event.stopPropagation();
  setAccountMode("start");
});

forgotPassword.addEventListener("click", async event => {
  event.stopPropagation();
  
  const email = normalize(emailInput.value);

  if (!email || !email.includes("@")) {
    showLoginError("vul eerst je emailadres in");
    return;
  }

  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin
  });

  if (error) {
    showLoginError(error.message);
    return;
  }

  showLoginError("Controleer je mailbox om je paswoord te wijzigen.");
});

document.querySelectorAll(".search-link").forEach(button => {
  button.addEventListener("click", event => {
    event.stopPropagation();
    handleNavigationTarget(button.dataset.target);
  });
});

function handleNavigationTarget(target) {

  if (target === "upload") {
  renderUploadForm("apk");
  focusBubble("upload");
  return;
}

  if (target === "download") {
    renderDownloadStart();
    focusBubble("download");
    return;
  }

  if (target === "download-apk") {
    setDownloadPlatform("apk");
    focusBubble("download");
    return;
  }

  if (target === "download-pwa") {
    setDownloadPlatform("pwa");
    focusBubble("download");
    return;
  }

  if (target === "download-games") {
    selectedPlatform = "apk";
    renderDownloadCategory("games");
    focusBubble("download");
    return;
  }

  if (target === "download-utilities") {
    selectedPlatform = "apk";
    renderDownloadCategory("utilities");
    focusBubble("download");
    return;
  }

  if (target === "download-tools") {
    selectedPlatform = "apk";
    renderDownloadCategory("tools");
    focusBubble("download");
    return;
  }

  if (target === "logout") {
    logoutUser();
    return;
  }
}

accountForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (loggedIn) return;

  clearLoginError();

  const name = nameInput.value.trim();
  const email = normalize(emailInput.value);
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;

  if (!email || !password) {
    showLoginError("Vul email en paswoord in!");
    return;
  }

  if (!email.includes("@")) {
    showLoginError("geldig emailadres nodig");
    return;
  }

  if (accountMode === "register") {
    if (!name) {
      showLoginError("naam nodig");
      return;
    }

    if (password.length < 6) {
      showLoginError("paswoord is te kort");
      return;
    }

    if (password !== passwordConfirm) {
      showLoginError("paswoorden verschillen");
      return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password
    });

    if (error) {
      showLoginError(error.message);
      return;
    }

    const user = data.user;

    if (user) {
      const { error: memberError } = await supabaseClient
        .from("members")
        .insert({
          id: user.id,
          name,
          email,
          role: "member"
        });

      if (memberError) {
        console.error(memberError);
        showLoginError("Account gemaakt, maar member niet opgeslagen.");
        return;
      }
    }

    showLoginError("Account gemaakt. Log nu in.");
    setAccountMode("login");
    return;
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    showLoginError("email of paswoord klopt niet");
    return;
  }

  const authUser = data.user;

  const { data: profile, error: profileError } = await supabaseClient
    .from("members")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (profileError) {
    console.error(profileError);
  }

  finishLogin({
    id: authUser.id,
    name: profile?.name || email,
    email,
    role: profile?.role || "member"
  });
});
  
 function renderAdminMenu(admin) {
  admin.classList.remove("admin-phase-3");

  admin.innerHTML = `
    <div class="planet-content">
      <div class="planet-title">BEHEER</div>
      <div class="planet-list">
        <div id="btnApps">apps</div>
        <div>uploads</div>
        <div id="btnUsers">gebruikers</div>
        <div id="btnStats">stats</div>
      </div>
    </div>
  `;

admin.querySelector("#btnApps").onclick = event => {
  event.stopPropagation();

  showAdminApps();
};

  admin.querySelector("#btnUsers").onclick = event => {
    event.stopPropagation();
    showAdminUsers();
  };
}
window.renderAdminMenu = renderAdminMenu;



function createAppBubble(kind) {
  const el = document.createElement("div");
  el.className = `app-bubble ${kind}`;
  el.dataset.kind = kind;
  el.dataset.motionStatus = "2";

  if (kind === "download") {
    renderDownloadStart(el);
  } else if (kind === "upload") {
  el.innerHTML = `
    <div class="planet-content">
      <div class="planet-title">UPLOAD</div>
    </div>
  `;
}

  const finalX = kind === "download" ? randomBetween(23, 34) : randomBetween(64, 77);
  const finalY = kind === "download" ? randomBetween(57, 74) : randomBetween(58, 75);

const baseSize = 180;   // regelt de onderlinge diameter afmetingen 

const sizeFactors = {
  search: 0.75,
  account: 0.85,
  admin: 0.95,
  download: 0.9,
  upload: 1.10
};

const size = `${baseSize * (sizeFactors[kind] || 1)}px`;

  preparePlanetBubble(el, finalX, finalY, size);
}

function preparePlanetBubble(el, finalX, finalY, size) {

  el.style.setProperty("--x", "50%");
  el.style.setProperty("--y", "50%");
  el.style.setProperty("--size", size);
  el.style.setProperty("--scale", ".03");
  el.style.setProperty("--opacity", "0");
  // Vrije zweefbeweging gebeurt niet meer met CSS heen-en-terug animatie.
  // Status 1 en 2 krijgen straks een vaste richting en verschijnen aan de andere kant terug.
  el.style.setProperty("--float-x", "0px");
  el.style.setProperty("--float-y", "0px");
  el.style.setProperty("--float-time", "1s");

  el.addEventListener("click", event => {
  event.stopPropagation();

  if (el.dataset.kind === "upload") {
    openUploadCard();
    return;
  }

  if (!productModalOpen || el.classList.contains("app-detail")) {
    focusBubble(el.dataset.kind);
  }
});

  document.querySelector(".space").appendChild(el);

  requestAnimationFrame(() => {
    el.style.setProperty("--x", `${finalX}%`);
    el.style.setProperty("--y", `${finalY}%`);
    el.style.setProperty("--scale", "1");
    el.style.setProperty("--opacity", ".96");

    // Laat eerst de bol rustig binnenkomen, daarna begint de vrije wrap-beweging.
    setTimeout(() => startWrapMotion(el, finalX, finalY), 5400);
  });
}

function startWrapMotion(el, startX, startY) {
  const motionStatus = Number(el.dataset.motionStatus || "0");
  if (motionStatus !== 1 && motionStatus !== 2) return;
  if (el._wrapMotionStarted) return;
  el._wrapMotionStarted = true;

  // Snelheid in schermpercentage per seconde.
  // Status 1 = klein en rustiger. Status 2 = middelklein en duidelijker zichtbaar.
const kind = el.dataset.kind;

let speedFactor = 1;

if (kind === "search") speedFactor = 0.65;
if (kind === "account") speedFactor = 1.15;
if (kind === "admin") speedFactor = 0.30;
if (kind === "download") speedFactor = 1.00;
if (kind === "upload") speedFactor = 0.80;

const baseSpeed = motionStatus === 1
  ? randomBetween(1.0, 1.8)
  : randomBetween(1.8, 3.0);

const speed = baseSpeed * speedFactor;

  const angle = randomBetween(0, Math.PI * 2);
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;

  const motion = {
    x: startX,
    y: startY,
    vx,
    vy,
    lastTime: performance.now()
  };
  el._wrapMotion = motion;
  el.classList.add("wrap-motion");

  function step(now) {
    if (!el.isConnected) return;

if (
    el.classList.contains("focus") ||
    el.dataset.motionStatus === "0" ||
    el.dataset.motionStatus === "3"
)
 {
      motion.lastTime = now;
      requestAnimationFrame(step);
      return;
    }

    const dt = Math.min((now - motion.lastTime) / 1000, 0.08);
    motion.lastTime = now;

    motion.x += motion.vx * dt;
    motion.y += motion.vy * dt;

    // Wrap-around: links eruit = rechts terug, rechts eruit = links terug,
    // boven eruit = onder terug, onder eruit = boven terug.
    const margin = 8;


if (motion.x < margin) {
  motion.x = margin;
  motion.vx *= -1;
}

if (motion.x > 100 - margin) {
  motion.x = 100 - margin;
  motion.vx *= -1;
}

if (motion.y < margin) {
  motion.y = margin;
  motion.vy *= -1;
}

if (motion.y > 100 - margin) {
  motion.y = 100 - margin;
  motion.vy *= -1;
}

    el.style.setProperty("--x", `${motion.x}%`);
    el.style.setProperty("--y", `${motion.y}%`);

    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function clearFocusStates() {
  search.classList.remove("focus", "dim");
  clearMoonFocusState();
  document.querySelectorAll(".app-bubble").forEach(el => {
    el.classList.remove("focus", "dim");
  });
}
function focusBubble(kind) {
  if (kind === "account" && loggedIn) return;
  if (productModalOpen && !appMap[kind]) return;
  const activeIsSearch = kind === "search";
  const activeIsAccount = kind === "account";

  search.classList.toggle("focus", activeIsSearch);
  search.classList.toggle("dim", !activeIsSearch && (loggedIn || appBubblesCreated));

  updateMoonFocusState(activeIsAccount, activeIsSearch, loggedIn);

  document.querySelectorAll(".app-bubble").forEach(el => {
    const active = el.dataset.kind === kind;
    el.classList.toggle("focus", active);
    el.classList.toggle("dim", !active && (activeIsSearch || activeIsAccount || kind === "download" || kind === "upload" || categoryMap[kind] || appMap[kind]));
  });
}

search.addEventListener("click", event => {
  event.stopPropagation();

  if (!loggedIn) {
    setAccountMode("login");
    focusBubble("account");
    showLoginError("login vereist!");
    return;
  }

  focusBubble("search");
});

exportUsersJson.addEventListener("click", event => {
  event.stopPropagation();
  const blob = new Blob([JSON.stringify(readDatabase(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "free-app-swap-users-prototype.json";
  a.click();
  URL.revokeObjectURL(url);
});

async function loadMembers() {
  const body = document.getElementById("membersBody");
  if (!body) return;

  const { data, error } = await supabaseClient
    .from("members")
    .select("id, email, name, role")
    .order("name", { ascending: true });

  if (error) {
    console.error(error);
    body.innerHTML = `<tr><td colspan="4">Fout bij laden</td></tr>`;
    return;
  }

  window.currentMembers = data || [];

  if (!data || data.length === 0) {
    body.innerHTML = `<tr><td colspan="4">Geen leden gevonden</td></tr>`;
    return;
  }

  body.innerHTML = data.map(m => `
    <tr data-id="${m.id}">
      <td><input type="radio" name="selectedMember" value="${m.id}"></td>
      <td><input class="member-input" data-field="name" value="${m.name || ""}" disabled></td>
      <td><input class="member-input" data-field="email" value="${m.email || ""}" disabled></td>
      <td>
        <select class="member-input" data-field="role" disabled>
          <option value="member" ${m.role === "member" ? "selected" : ""}>member</option>
          <option value="admin" ${m.role === "admin" ? "selected" : ""}>admin</option>
        </select>
      </td>
    </tr>
  `).join("");
}
function getSelectedMemberRow() {
  const selected = document.querySelector('input[name="selectedMember"]:checked');
  if (!selected) return null;

  return document.querySelector(`tr[data-id="${selected.value}"]`);
}

function setMembersStatus(text) {
  const status = document.getElementById("membersStatus");
  if (status) status.textContent = text;
}

function enableMemberEdit() {
  const row = getSelectedMemberRow();

  if (!row) {
    setMembersStatus("Selecteer eerst een lid.");
    return;
  }

  row.querySelectorAll(".member-input").forEach(input => {
    input.disabled = false;
  });

  setMembersStatus("Edit actief. Pas aan en druk op save.");
}

async function saveSelectedMember() {
  const row = getSelectedMemberRow();

  if (!row) {
    setMembersStatus("Selecteer eerst een lid.");
    return;
  }

  const id = row.dataset.id;
  const name = row.querySelector('[data-field="name"]').value.trim();
  const email = row.querySelector('[data-field="email"]').value.trim().toLowerCase();
  const role = row.querySelector('[data-field="role"]').value.trim().toLowerCase();

  const { error } = await supabaseClient
    .from("members")
    .update({
      name,
      email,
      role
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    setMembersStatus("Opslaan mislukt.");
    return;
  }

  setMembersStatus("Opgeslagen.");
  await loadMembers();
}

async function deleteSelectedMember() {
  const row = getSelectedMemberRow();

  if (!row) {
    setMembersStatus("Selecteer eerst een lid.");
    return;
  }

  const id = row.dataset.id;
  const name = row.querySelector('[data-field="name"]').value.trim();

  if (!confirm(`Lid "${name}" verwijderen uit members?`)) return;

  const { error } = await supabaseClient
    .from("members")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    setMembersStatus("Verwijderen mislukt.");
    return;
  }

  setMembersStatus("Verwijderd.");
  await loadMembers();
}

function exportMembersExcel() {
  const rows = window.currentMembers || [];

  if (!rows.length) {
    setMembersStatus("Geen leden om te exporteren.");
    return;
  }

  let html = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Naam</th>
          <th>Email</th>
          <th>Rol</th>
        </tr>
      </thead>
      <tbody>
  `;

  rows.forEach(m => {
    html += `
      <tr>
        <td>${m.id || ""}</td>
        <td>${m.name || ""}</td>
        <td>${m.email || ""}</td>
        <td>${m.role || ""}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  const blob = new Blob([html], {
    type: "application/vnd.ms-excel"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  const date = new Date().toISOString().slice(0, 10);

  a.href = url;
  a.download = `leden-export-${date}.xls`;
  a.click();

  URL.revokeObjectURL(url);

  setMembersStatus("Excel export gemaakt.");
}

function appRowHtml(app, isNew = false) {
  return `
    <tr data-id="${app.id || "new"}" data-new="${isNew ? "1" : "0"}">
      <td>
        <input type="radio" name="selectedApp" value="${app.id || "new"}" ${isNew ? "checked" : ""}>
      </td>

      <td>
        <input class="app-input" data-field="name" value="${app.name || ""}" ${isNew ? "" : "disabled"}>
      </td>

      <td>
        <input class="app-input" data-field="platform" value="${app.platform || "apk"}" ${isNew ? "" : "disabled"}>
      </td>

      <td>
        <input class="app-input" data-field="category" value="${app.category || ""}" ${isNew ? "" : "disabled"}>
      </td>

      <td>
        <input class="app-input" data-field="version" value="${app.version || "0.1"}" ${isNew ? "" : "disabled"}>
      </td>

      <td>
        <input class="app-input" data-field="status" value="${app.status || "test"}" ${isNew ? "" : "disabled"}>
      </td>
    </tr>
  `;
}

function newAppRow() {
  const body = document.getElementById("appsBody");
  if (!body) return;

  body.insertAdjacentHTML("afterbegin", appRowHtml({
    name: "",
    platform: "apk",
    category: "",
    version: "0.1",
    status: "test"
  }, true));

  setAppsStatus("Nieuwe app. Vul in en druk op save.");
}

function setAppsStatus(text) {
  const status = document.getElementById("appsStatus");
  if (status) status.textContent = text;
}
function getSelectedAppRow() {
  const selected = document.querySelector('input[name="selectedApp"]:checked');
  if (!selected) return null;

  return document.querySelector(`tr[data-id="${selected.value}"]`);
}

function enableAppEdit() {
  const row = getSelectedAppRow();

  if (!row) {
    setAppsStatus("Selecteer eerst een app.");
    return;
  }

  row.querySelectorAll(".app-input").forEach(input => {
    input.disabled = false;
  });

  setAppsStatus("Edit actief. Pas aan en druk op save.");
}

async function deleteSelectedApp() {
  const row = getSelectedAppRow();

  if (!row) {
    setAppsStatus("Selecteer eerst een app.");
    return;
  }

  if (row.dataset.new === "1") {
    row.remove();
    setAppsStatus("Nieuwe rij verwijderd.");
    return;
  }

  const name = row.querySelector('[data-field="name"]').value.trim();

  if (!confirm(`App "${name}" verwijderen?`)) return;

  const { error } = await supabaseClient
    .from("apps")
    .delete()
    .eq("id", row.dataset.id);

  if (error) {
    console.error(error);
    setAppsStatus("Verwijderen mislukt.");
    return;
  }

  setAppsStatus("Verwijderd.");
  await loadApps();
}

function exportAppsExcel() {
  const rows = window.currentApps || [];

  if (!rows.length) {
    setAppsStatus("Geen apps om te exporteren.");
    return;
  }

  let html = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Naam</th>
          <th>Platform</th>
          <th>Categorie</th>
          <th>Versie</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
  `;

  rows.forEach(app => {
    html += `
      <tr>
        <td>${app.id || ""}</td>
        <td>${app.name || ""}</td>
        <td>${app.platform || ""}</td>
        <td>${app.category || ""}</td>
        <td>${app.version || ""}</td>
        <td>${app.status || ""}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;

  const blob = new Blob([html], {
    type: "application/vnd.ms-excel"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);

  a.href = url;
  a.download = `apps-export-${date}.xls`;
  a.click();

  URL.revokeObjectURL(url);
  setAppsStatus("Excel export gemaakt.");
}
async function saveSelectedApp() {
  const row = getSelectedAppRow();

  if (!row) {
    setAppsStatus("Selecteer eerst een app.");
    return;
  }

  const app = {};

  row.querySelectorAll(".app-input").forEach(input => {
    app[input.dataset.field] = input.value.trim();
  });

  if (!app.name) {
    setAppsStatus("Naam is verplicht.");
    return;
  }

  let result;

  if (row.dataset.new === "1") {
    result = await supabaseClient
      .from("apps")
      .insert(app);
  } else {
    result = await supabaseClient
      .from("apps")
      .update(app)
      .eq("id", row.dataset.id);
  }

  if (result.error) {
    console.error(result.error);
    setAppsStatus("Opslaan mislukt.");
    return;
  }

  setAppsStatus("Opgeslagen.");
  await loadApps();
}

async function loadApps() {
  const body = document.getElementById("appsBody");
  if (!body) return;

  const { data, error } = await supabaseClient
    .from("apps")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error(error);
    body.innerHTML = `<tr><td colspan="6">Fout bij laden</td></tr>`;
    return;
  }

  window.currentApps = data || [];

  if (!data || data.length === 0) {
    body.innerHTML = `<tr><td colspan="6">Geen apps gevonden</td></tr>`;
    return;
  }

  body.innerHTML = data.map(app => appRowHtml(app)).join("");
}

async function logoutUser() {
  await supabaseClient.auth.signOut();

  loggedIn = false;
  appBubblesCreated = false;

  location.reload();
}

startLayout();
