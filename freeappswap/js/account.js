window.FreeAppSwapAccount = (() => {
  let loggedIn = false;

  function init() {
    const form = document.getElementById("accountForm");
    const status = document.getElementById("accountStatus");
    const jsonButton = document.getElementById("downloadUsersJson");

    form?.addEventListener("submit", event => {
      event.preventDefault();
      const result = FreeAppSwapStore.registerOrLogin({
        name: document.getElementById("nameInput")?.value,
        email: document.getElementById("emailInput")?.value,
        password: document.getElementById("passwordInput")?.value
      });

      if (status) status.textContent = result.message;
      if (result.ok) {
        loggedIn = true;
        setTimeout(() => FreeAppSwapBubbles.showLoggedInUniverse(), 900);
      }
    });

    jsonButton?.addEventListener("click", () => FreeAppSwapStore.downloadUsersJson());
  }

  function isLoggedIn() { return loggedIn; }

  return { init, isLoggedIn };
})();
