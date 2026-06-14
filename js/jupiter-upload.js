let selectedUploadPlatform = "apk";

function getUploadBubble() {
  return document.querySelector('.app-bubble[data-kind="upload"]');
}

function renderUploadStart(el = getUploadBubble()) {
  if (!el) return;

  el.innerHTML = `
    <div class="planet-content upload-start">
      <div class="planet-title">UPLOAD</div>
      <div class="planet-list">
        <button type="button" class="category-link" id="btnOpenUploadForm">
          nieuwe app
        </button>
      </div>
    </div>
  `;

  el.querySelector("#btnOpenUploadForm")?.addEventListener("click", event => {
    event.stopPropagation();
    renderUploadForm("apk");
    focusBubble("upload");
  });
}

function renderUploadForm(platformId = "apk") {
  selectedUploadPlatform = platformId;

  const el = getUploadBubble();
  if (!el) return;

  el.innerHTML = `
   <div class="upload-panel">

  <div class="upload-title">NIEUWE APP</div>

  <div class="upload-toolbar">
    <button id="btnUploadBack">exit</button>
    <button id="btnUploadSave">save</button>
  </div>

  <div class="upload-form-wrap">

    <label>Naam</label>
    <input id="uploadName">

    <label>Versie</label>
    <input id="uploadVersion">

    <label>Platform</label>
    <select id="uploadPlatform">
      ...
    </select>

    <label>Categorie</label>
    <select id="uploadCategory">
      ...
    </select>

    <label>Beschrijving</label>
    <textarea id="uploadDescription"></textarea>

  </div>

  <div id="uploadStatus"></div>

</div>
  `;

  document.getElementById("uploadPlatform").value = platformId;

  document.getElementById("btnUploadSave")?.addEventListener("click", saveUploadedApp);
  document.getElementById("btnUploadBack")?.addEventListener("click", event => {
  event.stopPropagation();

  const upload = document.querySelector('.app-bubble[data-kind="upload"]');

  renderUploadStart(upload);

  upload?.classList.remove("focus", "dim");
  upload?.style.setProperty("--scale", "1");
});
}


async function saveUploadedApp() {
  const status = document.getElementById("uploadStatus");

  const app = {
    name: document.getElementById("uploadName")?.value.trim() || "",
    version: document.getElementById("uploadVersion")?.value.trim() || "",
    platform: document.getElementById("uploadPlatform")?.value || "apk",
    category: document.getElementById("uploadCategory")?.value || "utilities",
    description: document.getElementById("uploadDescription")?.value.trim() || "",
    status: "test"
  };

  if (!app.name) {
    if (status) status.textContent = "Naam is verplicht.";
    return;
  }

  const { error } = await supabaseClient
    .from("apps")
    .insert(app);

  if (error) {
    console.error(error);
    if (status) status.textContent = "Opslaan mislukt.";
    return;
  }

  if (status) status.textContent = "App opgeslagen.";

  await loadDownloadAppsFromDb?.();

  setTimeout(() => {
    renderUploadStart();
  }, 900);
}