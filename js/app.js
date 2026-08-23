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
  - login.js voor account UI
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

  Later eventueel naar login.js:
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
const passwordConfirmInput =
  document.getElementById("loginPasswordConfirm");

if (passwordInput) passwordInput.value = "";
if (passwordConfirmInput) passwordConfirmInput.value = "";

const SUPABASE_URL = "https://njefjypajmbolkufgkgd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZWZqeXBham1ib2xrdWZna2dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNDQyNjksImV4cCI6MjA5NjYyMDI2OX0.mUZSAB8mxExzXQM3OK55mfYnGZVhl1QmyLNwv64V-Mo";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const FREEAPPS_STORAGE_URL =
  "https://conclusion-reynolds-gold-pointed.trycloudflare.com";
let loggedIn = false;
let appBubblesCreated = false;
let accountMode = "start";

let productModalOpen = false;

let speedFactor = 1;



// Zelfde structuur als data/apps.json. Later kan dit rechtstreeks uit Supabase komen.
const appData = {
  platforms: [
    { id: "apk", label: "APK" },
    { id: "pwa", label: "PWA" },
    { id: "web", label: "WEB" },
    { id: "OTHER", label: "OTHER" }
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
      screenshot: "../assets/images/LS.jpg",
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


const appMap = Object.fromEntries(appData.apps.map(item => [item.id, item]));
const platformMap = Object.fromEntries(appData.platforms.map(item => [item.id, item]));
const categoryMap = Object.fromEntries(appData.categories.map(item => [item.id, item]));


function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}


function createDownloadUpload() {
  if (appBubblesCreated) return;

  appBubblesCreated = true;

  createAppBubble("download");
  createAppBubble("upload");
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

  openSunSearch();

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
  }



forgotPassword.addEventListener("click", async event => {
  event.stopPropagation();
  
  const email = normalize(emailInput.value);

  if (!email || !email.includes("@")) {
    showLoginError("Geef je emailadres in");
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
    window.PlanetManager.activate("upload");
    openUserAppEditor();
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

  passwordInput.value = "";
  passwordConfirmInput.value = "";

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

    const kind = el.dataset.kind;
    const focusGroup = appMap[kind] ? "download" : kind;

    // Een app-bol hoort functioneel bij Mars/Download.
    // Gebruik daarom "download" als uitzonderingsgroep, zodat de
    // detailkaart niet meteen door de centrale manager wordt gesloten.
    window.PlanetManager.activate(focusGroup);

    if (kind === "upload") {
      openUserAppEditor();
      return;
    }

    // Passieve bollen mogen andere open onderdelen wel sluiten,
    // maar openen zelf geen algemeen focusvenster.
    if (el.dataset.passive === "true") return;

    if (kind === "uranus" || kind === "juno") return;

    focusBubble(kind);
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
if (kind === "uranus") speedFactor = 0.42;
if (kind === "juno") speedFactor = 0.32;

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

/* =========================================================
   PLANET MANAGER
   Eén centrale plaats voor focusverlies, sluiten en hervatten.
   ========================================================= */

window.PlanetManager = (() => {
  const closers = new Map();

  function register(kind, closeHandler) {
    if (!kind || typeof closeHandler !== "function") return;
    closers.set(kind, closeHandler);
  }

  function unregister(kind) {
    closers.delete(kind);
  }

  function resumeMotion(kind, fallbackStatus = "2") {
    const planet = document.querySelector(`.app-bubble[data-kind="${kind}"]`);
    if (!planet) return;

    planet.dataset.motionStatus = fallbackStatus;
    planet.classList.remove("focus", "dim");

    if (planet._wrapMotion) {
      planet._wrapMotion.lastTime = performance.now();
    }
  }

  function closeGenericOverlays(exceptKind = null) {
    if (exceptKind !== "admin") {
      document.getElementById("adminAppEditorOverlay")?.remove();
      document.body.classList.remove("admin-editor-open");
    }

    if (exceptKind !== "upload") {
      document.getElementById("userAppEditorOverlay")?.remove();
      document.body.classList.remove("user-editor-open");
    }

    if (exceptKind !== "download") {
      document.querySelector(".download-card-overlay")?.remove();
      document.body.classList.remove("planet-overlay-open", "card-planet-bg");
      productModalOpen = false;

      if (typeof hideCardPlanetBg === "function") {
        hideCardPlanetBg();
      }
    }
  }

  function close(kind) {
    const closeHandler = closers.get(kind);

    if (typeof closeHandler === "function") {
      try {
        closeHandler();
      } catch (error) {
        console.error(`Sluiten van ${kind} mislukt:`, error);
      }
    }

    if (kind === "admin") resumeMotion("admin", "2");
    if (kind === "uranus") resumeMotion("uranus", "1");
    if (kind === "upload") resumeMotion("upload", "2");
    if (kind === "download") resumeMotion("download", "2");
  }

  function closeAll(exceptKind = null) {
    for (const kind of closers.keys()) {
      if (kind !== exceptKind) close(kind);
    }

    closeGenericOverlays(exceptKind);

    document.querySelectorAll(".app-bubble").forEach(planet => {
      const kind = planet.dataset.kind;
      if (kind === exceptKind) return;

      planet.classList.remove("focus", "dim");

      if (kind === "uranus") {
        planet.dataset.motionStatus = "1";
      } else if (kind === "admin" || kind === "download" || kind === "upload") {
        planet.dataset.motionStatus = "2";
      }

      if (planet._wrapMotion) {
        planet._wrapMotion.lastTime = performance.now();
      }
    });
  }

  function activate(kind) {
    closeAll(kind);
  }

  return {
    register,
    unregister,
    close,
    closeAll,
    activate,
    resumeMotion
  };
})();

function clearFocusStates() {
 clearSunFocusState();
  clearMoonFocusState();
  document.querySelectorAll(".app-bubble").forEach(el => {
    el.classList.remove("focus", "dim");
  });
}
function focusBubble(kind) {
  if (kind === "account" && loggedIn) return;

  const isStaticDownloadApp = Boolean(appMap[kind]);
  const isDatabaseDownloadApp =
    typeof dbApps !== "undefined" &&
    Array.isArray(dbApps) &&
    dbApps.some(app => String(app.id) === String(kind));

  const focusGroup =
    isStaticDownloadApp || isDatabaseDownloadApp
      ? "download"
      : kind;

  window.PlanetManager.activate(focusGroup);

  const activeIsSearch = kind === "search";
  const activeIsAccount = kind === "account";

  updateSunFocusState(activeIsSearch, loggedIn, appBubblesCreated);
  updateMoonFocusState(activeIsAccount, activeIsSearch, loggedIn);

  document.querySelectorAll(".app-bubble").forEach(el => {
    const active = el.dataset.kind === kind;

    el.classList.toggle("focus", active);
    el.classList.toggle(
      "dim",
      !active &&
      (
        activeIsSearch ||
        activeIsAccount ||
        kind === "download" ||
        kind === "upload" ||
        categoryMap[kind] ||
        appMap[kind]
      )
    );
  });
}

const planetSpace = document.querySelector(".space");

planetSpace?.addEventListener("click", event => {
  const interactiveTarget = event.target.closest(
    ".app-bubble, button, a, input, textarea, select, " +
    ".download-card-overlay, .user-app-editor-overlay, .admin-app-editor-overlay"
  );

  if (interactiveTarget) return;

  window.PlanetManager.closeAll();
  clearFocusStates();
});

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

  const { data: { user } } = await supabaseClient.auth.getUser();

  if (id === user?.id) {
    alert("De actieve administrator kan zichzelf niet verwijderen.");
    return;
  }

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
function showCardPlanetBg() {
  document.body.classList.add("card-planet-bg");
}

function hideCardPlanetBg() {
  document.body.classList.remove("card-planet-bg");
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

startIntro();

/* =========================================================
   ADMIN APP EDITOR
   Eén functionele editor voor new / edit / later review.
   ========================================================= */

function escapeAdminEditorHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function adminArrayToText(value) {
  if (Array.isArray(value)) return value.join("\n");
  if (typeof value === "string") return value;
  return "";
}

function adminTextToArray(value) {
  return String(value || "")
    .split(/\r?\n|,/)
    .map(item => item.trim())
    .filter(Boolean);
}

function closeAdminAppEditor() {
  document.getElementById("adminAppEditorOverlay")?.remove();
  document.body.classList.remove("admin-editor-open");
}

function setAdminEditorStatus(text, isError = false) {
  const el = document.getElementById("adminEditorStatus");
  if (!el) return;
  el.textContent = text;
  el.classList.toggle("error", isError);
}

function openSelectedAdminAppEditor() {
  const row = getSelectedAppRow();

  if (!row) {
    setAppsStatus("Selecteer eerst een app.");
    return;
  }

  if (row.dataset.new === "1") {
    setAppsStatus("Gebruik NEW voor een nieuwe app.");
    return;
  }

  openAdminAppEditor(row.dataset.id);
}

async function openAdminAppEditor(appId = null, mode = "admin") {
  closeAdminAppEditor();

  let app = {
    name: "",
    subtitle: "",
    description: "",
    category: "",
    platform: "apk",
    version: "0.1",
    author: "",
    status: mode === "review" ? "pending" : "draft",
    screenshot_url: "",
    icon_url: "",
    download_url: "",
    file_size: "",
    min_android: "",
    license: "",
    privacy: "",
    features: [],
    languages: [],
    specs: "",
    rejection_reason: ""
  };

  if (appId) {
    const cached = (window.currentApps || []).find(item => String(item.id) === String(appId));

    if (cached) {
      app = { ...app, ...cached };
    } else {
      const { data, error } = await supabaseClient
        .from("apps")
        .select("*")
        .eq("id", appId)
        .single();

      if (error) {
        console.error(error);
        setAppsStatus("App laden mislukt.");
        return;
      }

      app = { ...app, ...data };
    }
  }

  const overlay = document.createElement("div");
  overlay.id = "adminAppEditorOverlay";
  overlay.className = "admin-app-editor-overlay";
  overlay.dataset.appId = appId || "";
  overlay.dataset.mode = mode;

  overlay.innerHTML = `
    <section class="admin-app-editor" role="dialog" aria-modal="true" aria-labelledby="adminEditorTitle">
      <header class="admin-editor-header">
        <h2 id="adminEditorTitle">${appId ? "APP BEWERKEN" : "NIEUWE APP"}</h2>
        <button type="button" id="btnCloseAdminEditor" class="admin-editor-close" aria-label="Sluiten">×</button>
      </header>

      <form id="adminAppEditorForm" autocomplete="off">
        <div class="admin-editor-grid">
          <label>Naam *
            <input name="name" value="${escapeAdminEditorHtml(app.name)}" required>
          </label>

          <label>Ondertitel
            <input name="subtitle" value="${escapeAdminEditorHtml(app.subtitle)}">
          </label>

          <label>Platform
            <select name="platform">
              <option value="apk" ${app.platform === "apk" ? "selected" : ""}>APK</option>
              <option value="pwa" ${app.platform === "pwa" ? "selected" : ""}>PWA</option>
              <option value="web" ${app.platform === "web" ? "selected" : ""}>WEB</option>
              <option value="other" ${app.platform === "other" ? "selected" : ""}>OTHER</option>
            </select>
          </label>

          <label>Categorie
            <input name="category" value="${escapeAdminEditorHtml(app.category)}">
          </label>

          <label>Versie
            <input name="version" value="${escapeAdminEditorHtml(app.version)}">
          </label>

          <label>Auteur
            <input name="author" value="${escapeAdminEditorHtml(app.author)}">
          </label>

          <label>Status
            <select name="status">
              ${["draft", "pending", "accepted", "rejected", "hidden"].map(status =>
                `<option value="${status}" ${app.status === status ? "selected" : ""}>${status}</option>`
              ).join("")}
            </select>
          </label>

          <label>Bestandsgrootte
            <input name="file_size" value="${escapeAdminEditorHtml(app.file_size)}" placeholder="bv. 15.3 MB">
          </label>

          <label>Minimum Android
            <input name="min_android" value="${escapeAdminEditorHtml(app.min_android)}" placeholder="bv. Android 8">
          </label>

          <label>Licentie
            <input name="license" value="${escapeAdminEditorHtml(app.license)}">
          </label>

          <label class="admin-editor-wide">Screenshot URL
            <input name="screenshot_url" value="${escapeAdminEditorHtml(app.screenshot_url)}">
          </label>

          <label class="admin-editor-wide">Icon URL
            <input name="icon_url" value="${escapeAdminEditorHtml(app.icon_url)}">
          </label>

<label class="admin-editor-wide">APK-bestand
  <input
    name="apk_file"
    type="file"
    accept=".apk,application/vnd.android.package-archive"
  >
  <small>
    Maximaal 100 MB. Laat leeg om het bestaande bestand te behouden.
  </small>
</label>

          <label class="admin-editor-wide">Download URL
            <input name="download_url" value="${escapeAdminEditorHtml(app.download_url)}">
          </label>

          <label class="admin-editor-wide">Beschrijving
            <textarea name="description" rows="4">${escapeAdminEditorHtml(app.description)}</textarea>
          </label>

          <label class="admin-editor-wide">Features <small>één per regel</small>
            <textarea name="features" rows="4">${escapeAdminEditorHtml(adminArrayToText(app.features))}</textarea>
          </label>

          <label class="admin-editor-wide">Talen <small>één per regel</small>
            <textarea name="languages" rows="3">${escapeAdminEditorHtml(adminArrayToText(app.languages))}</textarea>
          </label>

          <label class="admin-editor-wide">Specificaties
            <textarea name="specs" rows="4">${escapeAdminEditorHtml(typeof app.specs === "object" ? JSON.stringify(app.specs, null, 2) : app.specs)}</textarea>
          </label>

          <label class="admin-editor-wide">Privacy
            <textarea name="privacy" rows="3">${escapeAdminEditorHtml(app.privacy)}</textarea>
          </label>

          <label class="admin-editor-wide">Reden weigering
            <textarea name="rejection_reason" rows="3">${escapeAdminEditorHtml(app.rejection_reason)}</textarea>
          </label>
        </div>

        <div id="adminEditorStatus" class="admin-editor-status"></div>

        <footer class="admin-editor-actions">
          <button type="button" id="btnCancelAdminEditor">annuleren</button>
          <button type="submit" class="primary">opslaan</button>
        </footer>
      </form>
    </section>
  `;

  document.body.appendChild(overlay);
  document.body.classList.add("admin-editor-open");

  overlay.addEventListener("click", event => {
    if (event.target === overlay) closeAdminAppEditor();
  });

  document.getElementById("btnCloseAdminEditor").onclick = closeAdminAppEditor;
  document.getElementById("btnCancelAdminEditor").onclick = closeAdminAppEditor;
  document.getElementById("adminAppEditorForm").onsubmit = saveAdminAppEditor;
  overlay.querySelector('[name="name"]')?.focus();
}

async function uploadApkToFreeAppsStorage(appId, file) {
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  if (!file.name.toLowerCase().endsWith(".apk")) {
    throw new Error("Kies een geldig APK-bestand.");
  }

  const maximumBytes = 100 * 1024 * 1024;

  if (file.size > maximumBytes) {
    throw new Error("Het APK-bestand mag maximaal 100 MB groot zijn.");
  }

  const { data, error } = await supabaseClient.auth.getSession();

  if (error) {
    throw new Error(`Sessie controleren mislukt: ${error.message}`);
  }

  const accessToken = data?.session?.access_token;

  if (!accessToken) {
    throw new Error("Je moet aangemeld zijn om een APK te uploaden.");
  }

  const uploadData = new FormData();
  uploadData.append("file", file, file.name);

  const response = await fetch(
    `${FREEAPPS_STORAGE_URL}/upload/${encodeURIComponent(appId)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: uploadData
    }
  );

  const responseText = await response.text();

  let result = {};

  try {
    result = responseText ? JSON.parse(responseText) : {};
  } catch {
    result = {};
  }

  if (!response.ok) {
    throw new Error(
      result.error ||
      `Upload mislukt met foutcode ${response.status}.`
    );
  }

  return result;
}

async function saveAdminAppEditor(event) {
  event.preventDefault();

  const overlay = document.getElementById("adminAppEditorOverlay");
  const form = event.currentTarget;

  if (!overlay || !form) return;

  const saveButton = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);
  const appId = overlay.dataset.appId;

  const selectedFile = formData.get("apk_file");

  const apkFile =
    selectedFile instanceof File && selectedFile.size > 0
      ? selectedFile
      : null;

  const record = {
    name: String(formData.get("name") || "").trim(),
    subtitle: String(formData.get("subtitle") || "").trim() || null,
    description: String(formData.get("description") || "").trim() || null,
    category: String(formData.get("category") || "").trim() || null,
    platform: String(formData.get("platform") || "apk").trim(),
    version: String(formData.get("version") || "").trim() || null,
    author: String(formData.get("author") || "").trim() || null,
    status: String(formData.get("status") || "draft").trim(),
    screenshot_url:
      String(formData.get("screenshot_url") || "").trim() || null,
    icon_url:
      String(formData.get("icon_url") || "").trim() || null,
    download_url:
      String(formData.get("download_url") || "").trim() || null,
    file_size:
      String(formData.get("file_size") || "").trim() || null,
    min_android:
      String(formData.get("min_android") || "").trim() || null,
    license:
      String(formData.get("license") || "").trim() || null,
    privacy:
      String(formData.get("privacy") || "").trim() || null,
    features: adminTextToArray(formData.get("features")),
    languages: adminTextToArray(formData.get("languages")),
    specs:
      String(formData.get("specs") || "").trim() || null,
    rejection_reason:
      String(formData.get("rejection_reason") || "").trim() || null,
    updated_at: new Date().toISOString()
  };

  if (!record.name) {
    setAdminEditorStatus("Naam is verplicht.", true);
    return;
  }

  if (apkFile) {
    if (!apkFile.name.toLowerCase().endsWith(".apk")) {
      setAdminEditorStatus("Kies een geldig APK-bestand.", true);
      return;
    }

    if (apkFile.size > 100 * 1024 * 1024) {
      setAdminEditorStatus(
        "Het APK-bestand mag maximaal 100 MB groot zijn.",
        true
      );
      return;
    }
  }

  saveButton.disabled = true;
  setAdminEditorStatus("Appgegevens opslaan...");

  try {
    let result;

    if (appId) {
      result = await supabaseClient
        .from("apps")
        .update(record)
        .eq("id", appId)
        .select()
        .single();
    } else {
      const {
        data: authData,
        error: authError
      } = await supabaseClient.auth.getUser();

      if (authError || !authData?.user?.id) {
        throw new Error("Je moet aangemeld zijn om een app op te slaan.");
      }

      record.submitted_by = authData.user.id;

      result = await supabaseClient
        .from("apps")
        .insert(record)
        .select()
        .single();
    }

    if (result.error) {
      throw new Error(`Opslaan mislukt: ${result.error.message}`);
    }

    const savedAppId = result.data?.id;

    if (!savedAppId) {
      throw new Error("De opgeslagen app heeft geen geldig app-ID.");
    }

    if (!appId) {
      overlay.dataset.appId = savedAppId;
    }

    if (apkFile) {
      const sizeMb = (apkFile.size / 1024 / 1024).toFixed(1);

      setAdminEditorStatus(
        `APK uploaden (${sizeMb} MB)...`
      );

      const uploadResult =
        await uploadApkToFreeAppsStorage(savedAppId, apkFile);

      const { error: fileUpdateError } = await supabaseClient
        .from("apps")
        .update({
          download_url: uploadResult.download_url,
          file_size: Number(
            (uploadResult.size_bytes / 1024 / 1024).toFixed(1)
    ),
          updated_at: new Date().toISOString()
        })
        .eq("id", savedAppId);

      if (fileUpdateError) {
        throw new Error(
          `APK is opgeslagen, maar de downloadgegevens konden niet worden bijgewerkt: ${fileUpdateError.message}`
        );
      }

      setAdminEditorStatus("App en APK opgeslagen.");
    } else {
      setAdminEditorStatus("App opgeslagen.");
    }

    await loadApps();

    setAppsStatus(
      appId
        ? "App bijgewerkt."
        : "Nieuwe app toegevoegd."
    );

    closeAdminAppEditor();
  } catch (error) {
    console.error(error);

    setAdminEditorStatus(
      error?.message || "Opslaan mislukt.",
      true
    );
  } finally {
    saveButton.disabled = false;
  }
}

window.openAdminAppEditor = openAdminAppEditor;
window.openSelectedAdminAppEditor = openSelectedAdminAppEditor;
window.closeAdminAppEditor = closeAdminAppEditor;


/* =========================================================
   USER APP EDITOR
   Groene gebruikersmodus, geopend vanuit de uploadbol.
   Schrijft altijd een pending record naar public.apps.
   ========================================================= */

function closeUserAppEditor() {
  document.getElementById("userAppEditorOverlay")?.remove();
  document.body.classList.remove("user-editor-open");
}

function setUserEditorStatus(text, isError = false) {
  const status = document.getElementById("userEditorStatus");
  if (!status) return;
  status.textContent = text;
  status.classList.toggle("error", isError);
}

function setUserScreenshotPreview(source) {
  const preview = document.getElementById("userScreenshotPreview");
  const placeholder = document.getElementById("userScreenshotPlaceholder");
  const valueInput = document.getElementById("userScreenshotValue");
  if (!preview || !placeholder || !valueInput) return;

  valueInput.value = source || "";
  if (source) {
    preview.src = source;
    preview.hidden = false;
    placeholder.hidden = true;
  } else {
    preview.removeAttribute("src");
    preview.hidden = true;
    placeholder.hidden = false;
  }
}

function readUserScreenshotFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    setUserEditorStatus("Kies een geldig afbeeldingsbestand.", true);
    return;
  }

  const reader = new FileReader();
  reader.onload = () => setUserScreenshotPreview(String(reader.result || ""));
  reader.onerror = () => setUserEditorStatus("Afbeelding lezen mislukt.", true);
  reader.readAsDataURL(file);
}

function bindUserScreenshotInput(overlay) {
  const dropZone = overlay.querySelector("#userScreenshotDropZone");
  const fileInput = overlay.querySelector("#userScreenshotFile");
  const removeButton = overlay.querySelector("#btnRemoveUserScreenshot");
  if (!dropZone || !fileInput) return;

  dropZone.addEventListener("click", event => {
    if (event.target.closest("button")) return;
    fileInput.click();
  });

  dropZone.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      fileInput.click();
    }
  });

  fileInput.addEventListener("change", () => {
    readUserScreenshotFile(fileInput.files?.[0]);
  });

  ["dragenter", "dragover"].forEach(type => {
    dropZone.addEventListener(type, event => {
      event.preventDefault();
      dropZone.classList.add("drag-over");
    });
  });

  ["dragleave", "drop"].forEach(type => {
    dropZone.addEventListener(type, event => {
      event.preventDefault();
      dropZone.classList.remove("drag-over");
    });
  });

  dropZone.addEventListener("drop", event => {
    readUserScreenshotFile(event.dataTransfer?.files?.[0]);
  });

  overlay.addEventListener("paste", event => {
    const imageItem = Array.from(event.clipboardData?.items || [])
      .find(item => item.type.startsWith("image/"));
    if (!imageItem) return;
    event.preventDefault();
    readUserScreenshotFile(imageItem.getAsFile());
  });

  removeButton?.addEventListener("click", event => {
    event.stopPropagation();
    fileInput.value = "";
    setUserScreenshotPreview("");
  });
}

async function openUserAppEditor() {
  closeUserAppEditor();
  closeAdminAppEditor();

  const { data: authData } = await supabaseClient.auth.getUser();
  const user = authData?.user;

  if (!user) {
    setAccountMode("login");
    focusBubble("account");
    showLoginError("login vereist!");
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = "userAppEditorOverlay";
  overlay.className = "user-app-editor-overlay";

  overlay.innerHTML = `
    <section class="user-app-editor" role="dialog" aria-modal="true" aria-labelledby="userEditorTitle">
      <header class="user-editor-header">
        <div>
          <div class="user-editor-kicker">FREEAPPS EXCHANGE</div>
          <h2 id="userEditorTitle">JOUW APP INDIENEN</h2>
        </div>

        <div class="user-editor-header-actions">
          <button type="submit" form="userAppEditorForm" class="user-editor-submit">
            APP INDIENEN
          </button>
          <button type="button" id="btnCloseUserEditor" class="user-editor-close" aria-label="Sluiten">×</button>
        </div>
      </header>

      <form id="userAppEditorForm" autocomplete="off">
        <div class="user-editor-layout">
          <aside class="user-editor-media user-editor-panel">
            <div id="userScreenshotDropZone" class="user-screenshot-drop" tabindex="0">
              <img id="userScreenshotPreview" alt="Screenshotvoorbeeld" hidden>
              <div id="userScreenshotPlaceholder" class="user-screenshot-placeholder">
                <strong>SCREENSHOT</strong>
                <span>plak met Ctrl+V</span>
                <span>sleep een afbeelding</span>
                <span>of klik om te kiezen</span>
              </div>
              <input id="userScreenshotFile" type="file" accept="image/*" hidden>
              <input id="userScreenshotValue" name="screenshot_url" type="hidden">
            </div>
            <button type="button" id="btnRemoveUserScreenshot" class="user-media-remove">screenshot verwijderen</button>
            <p class="user-media-help">De afbeelding wordt onmiddellijk als voorbeeld getoond.</p>
          </aside>

          <div class="user-editor-fields">
            <section class="user-editor-main user-editor-panel">
              <div class="user-editor-grid user-editor-main-grid">
                <label>Naam van de app *
                  <input name="name" required maxlength="120">
                </label>

                <label>Ondertitel
                  <input name="subtitle" maxlength="180">
                </label>

                <label class="user-editor-wide">Beschrijving *
                  <textarea name="description" rows="5" required></textarea>
                </label>

                <label class="user-editor-wide">Belangrijkste functies <small>één per regel</small>
                  <textarea name="features" rows="5"></textarea>
                </label>

                <label>Talen <small>één per regel</small>
                  <textarea name="languages" rows="4" placeholder="Nederlands&#10;Engels"></textarea>
                </label>

                <label>Privacy
                  <textarea name="privacy" rows="4"></textarea>
                </label>

                <label class="user-editor-wide">Specificaties en extra informatie
                  <textarea name="specs" rows="5"></textarea>
                </label>
              </div>
            </section>

            <aside class="user-editor-meta user-editor-panel">
              <div class="user-editor-grid user-editor-meta-grid">
                <label>Versie
                  <input name="version" value="0.1">
                </label>

                <label>Auteur / studio
                  <input name="author">
                </label>

                <label>Platform
                  <select name="platform">
                    <option value="apk">APK</option>
                    <option value="pwa">PWA</option>
                    <option value="web">WEB</option>
                    <option value="other">OTHER</option>
                  </select>
                </label>

                <label>Categorie
                  <select name="category">
                    <option value="games">Games</option>
                    <option value="utilities">Utilities</option>
                    <option value="tools">Tools</option>
                  </select>
                </label>

                <label>Bestandsgrootte
                  <input name="file_size" placeholder="bv. 15.3 MB">
                </label>

                <label>Minimum Android
                  <input name="min_android" placeholder="bv. Android 8">
                </label>

                <label>Licentie
                  <input name="license" value="Gratis">
                </label>

                <label>Icoon URL
                  <input name="icon_url" type="url" placeholder="https://...">
                </label>

                <label>Link naar appbestand *
                  <input name="download_url" required placeholder="https://...">
                </label>
              </div>
            </aside>
          </div>
        </div>

        <div id="userEditorStatus" class="user-editor-status"></div>
      </form>
    </section>
  `;

  document.body.appendChild(overlay);
  document.body.classList.add("user-editor-open");

  overlay.addEventListener("click", event => {
    if (event.target === overlay) closeUserAppEditor();
  });

  overlay.querySelector("#btnCloseUserEditor").onclick = closeUserAppEditor;
  overlay.querySelector("#userAppEditorForm").onsubmit = saveUserAppEditor;
  bindUserScreenshotInput(overlay);
  overlay.querySelector('[name="name"]')?.focus();
}

async function saveUserAppEditor(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const submitButton = document.querySelector('.user-app-editor-overlay .user-editor-submit');
  const formData = new FormData(form);
  const { data: authData, error: authError } = await supabaseClient.auth.getUser();
  const user = authData?.user;

  if (authError || !user) {
    setUserEditorStatus("Je sessie is verlopen. Log opnieuw in.", true);
    return;
  }

  const record = {
    name: String(formData.get("name") || "").trim(),
    subtitle: String(formData.get("subtitle") || "").trim() || null,
    description: String(formData.get("description") || "").trim(),
    category: String(formData.get("category") || "").trim() || null,
    platform: String(formData.get("platform") || "apk").trim().toLowerCase(),
    version: String(formData.get("version") || "").trim() || null,
    author: String(formData.get("author") || "").trim() || null,
    status: "pending",
    screenshot_url: String(formData.get("screenshot_url") || "").trim() || null,
    icon_url: String(formData.get("icon_url") || "").trim() || null,
    download_url: String(formData.get("download_url") || "").trim() || null,
    file_size: String(formData.get("file_size") || "").trim() || null,
    min_android: String(formData.get("min_android") || "").trim() || null,
    license: String(formData.get("license") || "").trim() || "Gratis",
    privacy: String(formData.get("privacy") || "").trim() || null,
    features: adminTextToArray(formData.get("features")),
    languages: adminTextToArray(formData.get("languages")),
    specs: String(formData.get("specs") || "").trim() || null,
    submitted_by: user.id,
    updated_at: new Date().toISOString()
  };

  if (!record.name || !record.description || !record.download_url) {
    setUserEditorStatus("Vul naam, beschrijving en link naar het appbestand in.", true);
    return;
  }

  if (submitButton) submitButton.disabled = true;
  setUserEditorStatus("App indienen...");

  const { error } = await supabaseClient
    .from("apps")
    .insert(record);

  if (submitButton) submitButton.disabled = false;

  if (error) {
    console.error(error);
    setUserEditorStatus(`Indienen mislukt: ${error.message}`, true);
    return;
  }

  setUserEditorStatus("Je app is ingediend en wacht op controle.");
  form.reset();
  setUserScreenshotPreview("");

  setTimeout(() => closeUserAppEditor(), 1400);
}

window.openUserAppEditor = openUserAppEditor;
window.closeUserAppEditor = closeUserAppEditor;
window.PlanetManager.register("upload", closeUserAppEditor);

