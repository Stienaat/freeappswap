/*
  login.js

  Eigenaar van:
  - account mode: start / login / register
  - login foutmelding tonen
  - maan-schaduw maken na login

  Wordt gebruikt door app.js via:
  - setAccountMode(mode)
  - showLoginError(message)
  - createMoonShadow()

  Niet eigenaar van:
  - Supabase login/register
  - globale login-status
  - search/download/upload/admin bubbles
*/
console.log("account module loaded");
window.FreeAppSwapMoon = {};


function createMoonShadow() {
  if (document.querySelector(".moon-shadow")) return;

  const shadow = document.createElement("div");
  shadow.className = "moon-shadow";

  document.querySelector(".space").appendChild(shadow);
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
  emailInput.placeholder = "Email";
  passwordInput.autocomplete = isRegister ? "new-password" : "current-password";

  if (isStart) {
    account.classList.remove("focus", "dim");
  } else {
    focusBubble("account");
    setTimeout(() => emailInput.focus(), 350);
  }
}
function showLoginError(text) {
  loginMessage.textContent = text;
}

function setMoonLoggedIn() {
  account.classList.remove("focus", "dim", "far");
  account.classList.add("logged-in-moon");
  createMoonShadow();
}
function updateMoonFocusState(activeIsAccount, activeIsSearch, loggedIn) {
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
}
function clearMoonFocusState() {
  account.classList.remove("focus", "dim");
}
function openAccountMoon() {
  account.classList.add("open");
  setAccountMode("start");
}

window.openAccountMoon = openAccountMoon;
window.clearMoonFocusState = clearMoonFocusState;
window.updateMoonFocusState = updateMoonFocusState;
window.createMoonShadow = createMoonShadow;
window.setAccountMode = setAccountMode;
window.showLoginError = showLoginError;
window.setMoonLoggedIn = setMoonLoggedIn;