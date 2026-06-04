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

let loggedIn = false;
let appBubblesCreated = false;
let accountMode = "start";
let selectedPlatform = null;

// Zelfde structuur als data/apps.json. Later kan dit rechtstreeks uit Supabase komen.
const appData = {
  platforms: [
    { id: "apk", label: "APK" },
    { id: "pwa", label: "PWA" }
  ],
  categories: [
    { id: "games", label: "GAMES" },
    { id: "utilities", label: "UTILITIES" }
  ],
  apps: [
    {
      id: "familieconnect",
      name: "FamilieConnect",
      platform: "apk",
      category: "utilities",
      version: "0.1",
      author: "Frank Steenhoudt",
      status: "Testversie",
      description: "Familietracker voor gezinnen, kinderen en mantelzorgers.",
      screenshot: "assets/images/familieconnect_screen1.jpg",
      readme: [
        "Live locatie op de kaart",
        "SOS-signaal voor noodgevallen",
        "Eenvoudig voor familiegebruik",
        "Privacyvriendelijk prototype"
      ],
      download_url: "downloads/familieconnect.apk"
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

async function startLayout() {
  await sleep(350);
  home.classList.add("open");

  await sleep(5450);
  search.classList.add("open");
  account.classList.add("open");
  setAccountMode("start");
}

const USERS_STORAGE_KEY = "freeAppSwap_users_json";
const CURRENT_USER_KEY = "freeAppSwap_current_user";

function emptyDatabase() {
  return {
    schema: "free_app_swap_prototype_users_v2",
    note: "Prototype JSON in localStorage. Later om te zetten naar Supabase. Paswoorden zijn lokaal gehasht met PBKDF2-SHA256 + salt.",
    users: []
  };
}

function readDatabase() {
  try {
    const parsed = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || "null");
    if (parsed && Array.isArray(parsed.users)) return parsed;
  } catch {}
  return emptyDatabase();
}

function saveDatabase(db) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(db, null, 2));
}

function saveCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    login_at: new Date().toISOString()
  }, null, 2));
}

function showLoginError(text) {
  loginMessage.textContent = text;
}

function clearLoginError() {
  loginMessage.textContent = "";
}

function setAccountMode(mode) {
  accountMode = mode;
  clearLoginError();

  const isStart = mode === "start";
  const isRegister = mode === "register";

  accountTitle.textContent = isStart ? "ACCOUNT" : isRegister ? "REGISTREER" : "LOGIN";
  accountStart.style.display = isStart ? "grid" : "none";
  accountForm.style.display = isStart ? "none" : "grid";
  account.classList.toggle("register-mode", isRegister);

  submitButton.textContent = isRegister ? "REGISTREER" : "LOGIN";
  forgotPassword.style.display = isRegister ? "none" : "block";

  nameInput.required = isRegister;
  passwordConfirmInput.required = isRegister;
  emailInput.placeholder = isRegister ? "Email" : "Email of naam";
  passwordInput.autocomplete = isRegister ? "new-password" : "current-password";

  if (isStart) {
    account.classList.remove("focus", "dim");
  } else {
    focusBubble("account");
    setTimeout(() => emailInput.focus(), 350);
  }
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
  loggedIn = true;
  saveCurrentUser(user);
  clearFocusStates();
  account.classList.remove("focus", "dim");
  account.classList.add("far");
  home.classList.add("explode");
  setTimeout(createDownloadUpload, 900);
}

account.addEventListener("mouseenter", () => focusBubble("account"));
account.addEventListener("click", () => focusBubble("account"));
search.addEventListener("mouseenter", () => focusBubble("search"));

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

forgotPassword.addEventListener("click", event => {
  event.stopPropagation();
  showLoginError("paswoord vergeten komt later via Supabase");
});

document.querySelectorAll(".search-link").forEach(button => {
  button.addEventListener("click", event => {
    event.stopPropagation();
    handleNavigationTarget(button.dataset.target);
  });
});

function handleNavigationTarget(target) {
  if (target === "account") {
    focusBubble("account");
    return;
  }

  if (!loggedIn) {
    focusBubble("account");
    showLoginError("eerst inloggen");
    return;
  }

  if (!appBubblesCreated) createDownloadUpload();

  if (target === "download" || target === "upload") {
    focusBubble(target);
    return;
  }

  if (platformMap[target]) {
    setDownloadPlatform(target);
    focusBubble("download");
    return;
  }

  if (categoryMap[target]) {
    if (!selectedPlatform) setDownloadPlatform("apk");
    createCategoryBubble(target);
    focusBubble(target);
    return;
  }

  if (appMap[target]) {
    createAppDetailBubble(target);
    focusBubble(target);
  }
}

accountForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (loggedIn) return;

  clearLoginError();

  const name = nameInput.value.trim();
  const loginOrEmail = emailInput.value.trim();
  const email = normalize(loginOrEmail);
  const password = passwordInput.value;
  const passwordConfirm = passwordConfirmInput.value;

  if (!loginOrEmail || !password) {
    showLoginError("email/naam en paswoord nodig");
    return;
  }

  const db = readDatabase();

  if (accountMode === "register") {
    if (!name) {
      showLoginError("naam nodig");
      return;
    }
    if (!email.includes("@")) {
      showLoginError("geldig emailadres nodig");
      return;
    }
    if (password.length < 4) {
      showLoginError("paswoord is te kort");
      return;
    }
    if (password !== passwordConfirm) {
      showLoginError("paswoorden verschillen");
      return;
    }
    const existing = db.users.find(user => normalize(user.email) === email || normalize(user.name) === normalize(name));
    if (existing) {
      showLoginError("account bestaat al");
      return;
    }

    const newUser = await createUserRecord({ name, email, password });
    db.users.push(newUser);
    saveDatabase(db);
    finishLogin(newUser);
    return;
  }

  const existing = db.users.find(user => normalize(user.email) === email || normalize(user.name) === email);
  if (!existing) {
    showLoginError("account niet gevonden");
    return;
  }
  const ok = await verifyPassword(password, existing);
  if (!ok) {
    showLoginError("paswoord klopt niet");
    return;
  }
  existing.last_login_at = new Date().toISOString();
  existing.updated_at = existing.last_login_at;

  if (existing.password_plain_for_prototype) {
    existing.password = await hashPassword(password);
    delete existing.password_plain_for_prototype;
  }

  saveDatabase(db);
  finishLogin(existing);
});

function createDownloadUpload() {
  if (appBubblesCreated) return;
  appBubblesCreated = true;
  createAppBubble("download");
  createAppBubble("upload");
}

function createAppBubble(kind) {
  const el = document.createElement("div");
  el.className = `app-bubble ${kind}`;
  el.dataset.kind = kind;

  if (kind === "download") {
    renderDownloadStart(el);
  } else {
    el.innerHTML = `
      <div class="planet-content">
        <div class="planet-title">UPLOAD</div>
        <div class="planet-list">
          <div>nieuwe app</div>
          <div>screenshots</div>
          <div>beschrijving</div>
        </div>
      </div>
    `;
  }

  const finalX = kind === "download" ? randomBetween(23, 34) : randomBetween(64, 77);
  const finalY = kind === "download" ? randomBetween(57, 74) : randomBetween(58, 75);
  const size = "min(17vw, 24vh)";

  preparePlanetBubble(el, finalX, finalY, size);
}

function getDownloadBubble() {
  return document.querySelector('.app-bubble[data-kind="download"]');
}

function renderDownloadStart(el = getDownloadBubble()) {
  if (!el) return;
  selectedPlatform = null;
  el.innerHTML = `
    <div class="planet-content">
      <div class="planet-title">DOWNLOAD</div>
      <div class="planet-list">
        ${appData.platforms.map(platform => `
          <button class="category-link" type="button" data-platform="${platform.id}">${platform.label}</button>
        `).join("")}
      </div>
    </div>
  `;
  el.querySelectorAll("[data-platform]").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      setDownloadPlatform(button.dataset.platform);
      focusBubble("download");
    });
  });
}

function setDownloadPlatform(platformId) {
  selectedPlatform = platformId;
  const el = getDownloadBubble();
  if (!el) return;
  const platform = platformMap[platformId];
  const categories = appData.categories.filter(category => {
    return appData.apps.some(app => app.platform === platformId && app.category === category.id);
  });

  el.innerHTML = `
    <div class="planet-content">
      <div class="planet-title">${platform ? platform.label : platformId}</div>
      <div class="planet-list">
        ${categories.length ? categories.map(category => `
          <button class="category-link" type="button" data-category="${category.id}">${category.label}</button>
        `).join("") : `<div>nog geen apps</div>`}
        <button class="category-link soft-link" type="button" data-back-platforms="1">terug</button>
      </div>
    </div>
  `;
  el.querySelectorAll("[data-category]").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      createCategoryBubble(button.dataset.category);
      focusBubble(button.dataset.category);
    });
  });
  const back = el.querySelector("[data-back-platforms]");
  if (back) {
    back.addEventListener("click", event => {
      event.stopPropagation();
      renderDownloadStart(el);
      focusBubble("download");
    });
  }
}

function createCategoryBubble(categoryId) {
  const category = categoryMap[categoryId];
  if (!category) return;

  const existing = document.querySelector(`.app-bubble[data-kind="${categoryId}"]`);
  if (existing) {
    renderCategoryBubble(existing, categoryId);
    return;
  }

  const el = document.createElement("div");
  el.className = `app-bubble category ${categoryId}`;
  el.dataset.kind = categoryId;
  renderCategoryBubble(el, categoryId);

  const fallbackPositions = {
    games: { x: randomBetween(17, 29), y: randomBetween(37, 55) },
    utilities: { x: randomBetween(70, 84), y: randomBetween(35, 55) }
  };
  const pos = fallbackPositions[categoryId] || { x: randomBetween(25, 78), y: randomBetween(35, 82) };

  preparePlanetBubble(el, pos.x, pos.y, "min(16vw, 23vh)");
}

function renderCategoryBubble(el, categoryId) {
  const category = categoryMap[categoryId];
  const platformId = selectedPlatform || "apk";
  const apps = appData.apps.filter(app => app.platform === platformId && app.category === categoryId);

  el.innerHTML = `
    <div class="planet-content">
      <div class="planet-title">${category.label}</div>
      <div class="planet-list">
        ${apps.length ? apps.map(app => `
          <button class="category-link app-link" type="button" data-app="${app.id}">${app.name}</button>
        `).join("") : `<div>nog geen apps</div>`}
      </div>
    </div>
  `;
  el.querySelectorAll("[data-app]").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      createAppDetailBubble(button.dataset.app);
      focusBubble(button.dataset.app);
    });
  });
}

function createAppDetailBubble(appId) {
  const app = appMap[appId];
  if (!app) return;

  const existing = document.querySelector(`.app-bubble[data-kind="${appId}"]`);
  if (existing) {
    focusBubble(appId);
    return;
  }

  const el = document.createElement("div");
  el.className = "app-bubble app-detail max-detail";
  el.dataset.kind = appId;

  el.innerHTML = `
    <button class="detail-close" type="button" aria-label="sluiten">×</button>
    <div class="app-detail-shell">
      <section class="detail-hero">
        <img class="detail-screenshot" src="${app.screenshot || ''}" alt="Screenshot van ${app.name}" />
      </section>

      <section class="detail-info">
        <div class="detail-kicker">${app.platform.toUpperCase()} • versie ${app.version} • ${app.status}</div>
        <div class="detail-title">${app.name}</div>
        <div class="detail-description">${app.description}</div>

        <div class="detail-features">
          ${app.readme.map(item => `<div>✓ ${item}</div>`).join("")}
        </div>

        <div class="detail-author">Auteur: ${app.author}</div>
        <a class="detail-download" href="${app.download_url}" download>⬇ DOWNLOAD APK</a>
      </section>
    </div>
  `;

  const close = el.querySelector(".detail-close");
  close.addEventListener("click", event => {
    event.stopPropagation();
    closeAppDetailBubble(el);
  });

  preparePlanetBubble(el, 50, 51, "min(88vw, 88vh)");
}

function closeAppDetailBubble(el) {
  el.style.setProperty("--scale", ".03");
  el.style.setProperty("--opacity", "0");
  el.style.pointerEvents = "none";
  setTimeout(() => el.remove(), 1700);
  if (selectedPlatform) {
    const activeCategory = document.querySelector(".app-bubble.category.utilities") || document.querySelector(".app-bubble.category");
    if (activeCategory) focusBubble(activeCategory.dataset.kind);
  }
}

function preparePlanetBubble(el, finalX, finalY, size) {
  el.style.setProperty("--x", "50%");
  el.style.setProperty("--y", "50%");
  el.style.setProperty("--size", size);
  el.style.setProperty("--scale", ".03");
  el.style.setProperty("--opacity", "0");
  el.style.setProperty("--float-x", `${randomBetween(8, 18).toFixed(1)}px`);
  el.style.setProperty("--float-y", `${randomBetween(6, 15).toFixed(1)}px`);
  el.style.setProperty("--float-time", `${randomBetween(28, 46).toFixed(1)}s`);

  el.addEventListener("mouseenter", () => focusBubble(el.dataset.kind));
  el.addEventListener("click", () => focusBubble(el.dataset.kind));

  document.querySelector(".space").appendChild(el);

  requestAnimationFrame(() => {
    el.style.setProperty("--x", `${finalX}%`);
    el.style.setProperty("--y", `${finalY}%`);
    el.style.setProperty("--scale", "1");
    el.style.setProperty("--opacity", ".96");
  });
}

function clearFocusStates() {
  search.classList.remove("focus", "dim");
  account.classList.remove("focus", "dim");
  document.querySelectorAll(".app-bubble").forEach(el => {
    el.classList.remove("focus", "dim");
  });
}

function focusBubble(kind) {
  const activeIsSearch = kind === "search";
  const activeIsAccount = kind === "account";

  search.classList.toggle("focus", activeIsSearch);
  search.classList.toggle("dim", !activeIsSearch && (loggedIn || appBubblesCreated));

  if (activeIsAccount) {
    account.classList.remove("far", "dim");
    account.classList.add("focus");
  } else {
    account.classList.remove("focus");
    if (loggedIn) {
      account.classList.add("far");
      account.classList.remove("dim");
    } else {
      account.classList.toggle("dim", activeIsSearch);
    }
  }

  document.querySelectorAll(".app-bubble").forEach(el => {
    const active = el.dataset.kind === kind;
    el.classList.toggle("focus", active);
    el.classList.toggle("dim", !active && (activeIsSearch || activeIsAccount || kind === "download" || kind === "upload" || categoryMap[kind] || appMap[kind]));
  });
}

search.addEventListener("click", () => {
  if (!loggedIn) {
    focusBubble("account");
    return;
  }
  if (!appBubblesCreated) createDownloadUpload();
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

startLayout();
