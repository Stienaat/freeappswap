const home = document.getElementById("home");
    const search = document.getElementById("search");
    const account = document.getElementById("account");
    const accountForm = document.getElementById("accountForm");
    const loginMessage = document.getElementById("loginMessage");
    const exportUsersJson = document.getElementById("exportUsersJson");

    let loggedIn = false;
    let appBubblesCreated = false;

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
    }

    const USERS_STORAGE_KEY = "freeAppSwap_users_json";
    const CURRENT_USER_KEY = "freeAppSwap_current_user";

    function emptyDatabase() {
      return {
        schema: "free_app_swap_prototype_users_v1",
        note: "Prototype JSON. Later om te zetten naar Supabase-tabellen. Wachtwoorden zijn hier alleen voor lokale test.",
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

    function createUserRecord({ name, email, password }) {
      const now = new Date().toISOString();
      return {
        id: crypto.randomUUID ? crypto.randomUUID() : `local_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        name,
        email,
        password_plain_for_prototype: password,
        role: "member",
        status: "active",
        created_at: now,
        updated_at: now,
        last_login_at: now
      };
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

    account.addEventListener("mouseenter", () => focusBubble("account"));
    account.addEventListener("click", () => focusBubble("account"));
    search.addEventListener("mouseenter", () => focusBubble("search"));

    document.querySelectorAll(".search-link").forEach(button => {
      button.addEventListener("click", event => {
        event.stopPropagation();
        const target = button.dataset.target;
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
        focusBubble(target);
      });
    });

    accountForm.addEventListener("submit", event => {
      event.preventDefault();
      if (loggedIn) return;

      clearLoginError();

      const name = document.getElementById("loginName").value.trim();
      const email = document.getElementById("loginEmail").value.trim().toLowerCase();
      const password = document.getElementById("loginPassword").value;

      if (!email || !password) {
        showLoginError("email en paswoord nodig");
        return;
      }

      const db = readDatabase();
      const existing = db.users.find(user => user.email === email);

      if (existing) {
        if (existing.password_plain_for_prototype !== password) {
          showLoginError("paswoord klopt niet");
          return;
        }
        existing.last_login_at = new Date().toISOString();
        existing.updated_at = existing.last_login_at;
        saveDatabase(db);
        saveCurrentUser(existing);
      } else {
        if (!name) {
          showLoginError("naam nodig voor registratie");
          return;
        }
        const newUser = createUserRecord({ name, email, password });
        db.users.push(newUser);
        saveDatabase(db);
        saveCurrentUser(newUser);
      }

      loggedIn = true;
      clearFocusStates();
      account.classList.remove("focus", "dim");
      account.classList.add("far");
      home.classList.add("explode");

      setTimeout(createDownloadUpload, 900);
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
        el.innerHTML = `
          <div class="planet-content">
            <div class="planet-title">DOWNLOAD</div>
            <div class="planet-list">
              <div>FamilieConnect</div>
              <div>Latin Square</div>
              <div>Intercom</div>
            </div>
          </div>
        `;
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

      el.style.setProperty("--x", "50%");
      el.style.setProperty("--y", "50%");
      el.style.setProperty("--size", size);
      el.style.setProperty("--scale", ".03");
      el.style.setProperty("--opacity", "0");
      el.style.setProperty("--float-x", `${randomBetween(8, 18).toFixed(1)}px`);
      el.style.setProperty("--float-y", `${randomBetween(6, 15).toFixed(1)}px`);
      el.style.setProperty("--float-time", `${randomBetween(28, 46).toFixed(1)}s`);

      el.addEventListener("mouseenter", () => focusBubble(kind));
      el.addEventListener("click", () => focusBubble(kind));

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
      // Alle bollen volgen nu hetzelfde principe:
      // actieve bol groeit, de andere bollen worden kleiner/achtergrond.
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
        el.classList.toggle("dim", !active && (activeIsSearch || activeIsAccount || kind === "download" || kind === "upload"));
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
