window.FreeAppSwapAccount = (() => {
  let loggedIn = false;

  function init() {
    const form = document.getElementById("accountForm");
    const status = document.getElementById("accountStatus");
    const jsonButton = document.getElementById("downloadUsersJson");

form?.addEventListener("submit", async event => {
  event.preventDefault();

  try {
    const name = document.getElementById("nameInput")?.value?.trim() || "";
    const email = document.getElementById("emailInput")?.value?.trim().toLowerCase() || "";
    const password = document.getElementById("passwordInput")?.value || "";

    console.log("LOGIN TEST", { email, hasPassword: !!password });

    if (!email || !password) {
      if (status) status.textContent = "Email en paswoord zijn verplicht.";
      return;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    console.log("LOGIN RESULT", { data, error });

    if (error) {
      if (status) status.textContent = error.message;
      return;
    }

    if (status) status.textContent = `Welkom terug ${email}`;

    loggedIn = true;

    setTimeout(() => {
      FreeAppSwapBubbles.showLoggedInUniverse();
    }, 900);

  } catch (err) {
    console.error("LOGIN CRASH", err);
    if (status) status.textContent = "Login crash: " + err.message;
  }
});

    jsonButton?.addEventListener("click", () => FreeAppSwapStore.downloadUsersJson());
  }

  function isLoggedIn() { return loggedIn; }

  return { init, isLoggedIn };
})();
