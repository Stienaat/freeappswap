const componentFallbacks = {
  account: `<div class="bubble-content"><div class="bubble-title">ACCOUNT</div><form class="bubble-form" id="accountForm"><input id="nameInput" placeholder="Naam"/><input id="emailInput" type="email" placeholder="Email" required/><input id="passwordInput" type="password" placeholder="Paswoord" required/><button type="submit">OK</button></form><div class="status" id="accountStatus">Login of registreer</div><div class="json-link" id="downloadUsersJson">download users JSON</div></div>`,
  search: `<div class="bubble-content"><div class="bubble-title">SEARCH</div><div class="bubble-list"><button class="planet-button" data-target="download">DOWNLOAD</button><button class="planet-button" data-target="upload">UPLOAD</button><button class="planet-button" data-target="account">ACCOUNT</button></div></div>`,
  download: `<div class="bubble-content"><div class="bubble-title">DOWNLOAD</div><div class="bubble-list"><button class="planet-button">FamilieConnect</button><button class="planet-button">Latin Square</button><button class="planet-button">Intercom</button></div></div>`,
  upload: `<div class="bubble-content"><div class="bubble-title">UPLOAD</div><div class="bubble-list"><button class="planet-button">Nieuwe app</button><button class="planet-button">Upload regels</button><button class="planet-button">Info</button></div></div>`
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadComponent(id) {
  const node = document.getElementById(`${id}Bubble`);
  if (!node) return;
  try {
    const response = await fetch(`components/${id}.html`);
    if (!response.ok) throw new Error(`component ${id} niet gevonden`);
    node.innerHTML = await response.text();
  } catch (error) {
    node.innerHTML = componentFallbacks[id] || "";
  }
}

function bindBubbleBehaviour() {
  document.getElementById("accountBubble")?.addEventListener("mouseenter", () => {
    FreeAppSwapBubbles.focus("account", FreeAppSwapAccount.isLoggedIn());
  });
  document.getElementById("searchBubble")?.addEventListener("mouseenter", () => {
    FreeAppSwapBubbles.focus("search", FreeAppSwapAccount.isLoggedIn());
  });
  document.getElementById("downloadBubble")?.addEventListener("mouseenter", () => {
    if (FreeAppSwapAccount.isLoggedIn()) FreeAppSwapBubbles.focus("download", true);
  });
  document.getElementById("uploadBubble")?.addEventListener("mouseenter", () => {
    if (FreeAppSwapAccount.isLoggedIn()) FreeAppSwapBubbles.focus("upload", true);
  });
}

async function startUniverse() {
  await Promise.all(["account", "search", "download", "upload"].map(loadComponent));

  FreeAppSwapBubbles.initClosed();
  FreeAppSwapAccount.init();
  FreeAppSwapSearch.init();
  FreeAppSwapDownload.init();
  FreeAppSwapUpload.init();
  bindBubbleBehaviour();

  await sleep(160);

  FreeAppSwapBubbles.showHome();
  await sleep(5600);

  FreeAppSwapBubbles.showStartBubbles();
}

startUniverse();
