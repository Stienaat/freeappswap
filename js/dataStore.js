window.FreeAppSwapStore = (() => {
  const STORAGE_KEY = "freeappswap_users_json";
  const CURRENT_USER_KEY = "freeappswap_current_user";

  function emptyStore() {
    return {
      table: "users",
      supabase_ready: true,
      users: []
    };
  }

  function loadUsersJson() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || emptyStore();
    } catch (error) {
      console.warn("Kon users JSON niet lezen", error);
      return emptyStore();
    }
  }

  function saveUsersJson(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2));
  }

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function registerOrLogin({ name, email, password }) {
    const now = new Date().toISOString();
    const usersJson = loadUsersJson();
    const cleanEmail = normalizeEmail(email);
    const user = usersJson.users.find(item => item.email === cleanEmail);

    if (!cleanEmail || !password) {
      return { ok: false, message: "Email en paswoord zijn verplicht." };
    }

    if (user) {
      if (user.password_demo !== password) {
        return { ok: false, message: "Paswoord klopt niet." };
      }
      user.name = name || user.name;
      user.updated_at = now;
      user.last_login_at = now;
      saveUsersJson(usersJson);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return { ok: true, mode: "login", user, message: `Welkom terug ${user.name || user.email}` };
    }

    const newUser = {
      id: crypto.randomUUID ? crypto.randomUUID() : `user_${Date.now()}`,
      name: name || "",
      email: cleanEmail,
      password_demo: password,
      role: "member",
      created_at: now,
      updated_at: now,
      last_login_at: now
    };

    usersJson.users.push(newUser);
    saveUsersJson(usersJson);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return { ok: true, mode: "register", user: newUser, message: `Account gemaakt voor ${newUser.email}` };
  }

  function downloadUsersJson() {
    const blob = new Blob([JSON.stringify(loadUsersJson(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "users.local.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return { loadUsersJson, saveUsersJson, registerOrLogin, downloadUsersJson };
})();
