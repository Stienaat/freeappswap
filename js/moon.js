/*
  moon.js

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

window.FreeAppSwapMoon = {};
console.log("moon module loaded");

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


window.createMoonShadow = createMoonShadow;
window.setAccountMode = setAccountMode;
window.showLoginError = showLoginError;