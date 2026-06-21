let selectedUploadPlatform = "apk";

function getUploadBubble() {
  return document.querySelector('.app-bubble[data-kind="upload"]');
}



function renderUploadForm(platformId = "apk") {
  const el = getUploadBubble();
  if (!el) return;

  el.innerHTML = `
    <div class="upload-card">

      <button id="btnUploadBack" class="upload-close" type="button">×</button>

      <h1 class="upload-title">Nieuwe app</h1>

      <div class="upload-body">

        <div class="upload-left">
          <div class="upload-dropzone" id="uploadDropzone">
            Sleep screenshot hier<br>
            of klik om te kiezen
          </div>

          <input id="uploadScreenshotFile" type="file" accept="image/*" hidden>

          <img id="uploadPreview" class="upload-preview" alt="">
        </div>

        <div class="upload-right">
          <input id="uploadName" placeholder="Naam app">

          <textarea id="uploadDescription" placeholder="Beschrijving"></textarea>

          <input id="uploadVersion" placeholder="Versie">

          <input id="uploadAuthor" placeholder="Auteur">

          <select id="uploadPlatform">
            <option value="apk">APK</option>
            <option value="pwa">PWA</option>
          </select>

          <select id="uploadCategory">
            <option value="games">Games</option>
            <option value="utilities">Utilities</option>
            <option value="tools">Tools</option>
          </select>

          <button id="btnUploadSave" type="button">SAVE</button>

          <div id="uploadStatus" class="upload-status"></div>
        </div>

      </div>
    </div>
  `;

  document.getElementById("uploadPlatform").value = platformId;

  const fileInput = document.getElementById("uploadScreenshotFile");
  const dropzone = document.getElementById("uploadDropzone");
  const preview = document.getElementById("uploadPreview");

  dropzone.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    preview.src = url;
    preview.style.display = "block";
    dropzone.style.display = "none";
  });

  document.getElementById("btnUploadSave").addEventListener("click", saveUploadedApp);

  document.getElementById("btnUploadBack").addEventListener("click", event => {
    event.stopPropagation();
    renderUploadStart();
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
let selectedScreenshotFile = null;

function openUploadCard() {
  document.querySelector(".upload-card-overlay")?.remove();

  const overlay = document.createElement("div");
  overlay.className = "upload-card-overlay";

  overlay.innerHTML = `
    <div class="upload-card">
      <div class="upload-card-header">
        <h1 class="upload-card-title">NIEUWE APP</h1>

        <div class="upload-card-actions">
          <button class="upload-card-save" type="button">UPLOAD</button>
          <button class="upload-card-close" type="button">X</button>
        </div>
      </div>

      <div class="upload-card-body">
        <div class="upload-card-shot" id="uploadShot">
          <div class="upload-shot-placeholder">
            📷<br>
            Klik hier om screenshot te kiezen
          </div>

          <input id="uploadScreenshot" type="file" accept="image/*" hidden>
        </div>

        <div class="upload-card-info">
          <input id="uploadName" type="text" placeholder="Naam app">
          <input id="uploadVersion" type="text" placeholder="Versie">
          <input id="uploadPlatform" type="text" value="apk">
          <input id="uploadCategory" type="text" value="utilities">
          <textarea id="uploadDescription" placeholder="Beschrijving"></textarea>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const shot = overlay.querySelector("#uploadShot");
  const fileInput = overlay.querySelector("#uploadScreenshot");

  shot?.addEventListener("click", () => fileInput?.click());

  fileInput?.addEventListener("change", event => {
    const file = event.target.files?.[0];
    if (!file) return;

    selectedScreenshotFile = file;

    const reader = new FileReader();
    reader.onload = e => {
      shot.innerHTML = `<img src="${e.target.result}" class="upload-preview">`;
    };
    reader.readAsDataURL(file);
  });

  overlay.querySelector(".upload-card-close")?.addEventListener("click", () => {
    overlay.remove();

const admin = document.querySelector('.app-bubble[data-kind="admin"]');

    if (admin) {
   renderAdminMenu(admin);

      if (window.FreeAppSwapBubbles) {
        FreeAppSwapBubbles.applyState("admin", "idle", "3600ms");
      }
    }
      });
    }
