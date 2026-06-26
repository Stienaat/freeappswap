function openDownloadOverlay(appId) {
   const app = dbApps.find(a => a.id === appId);
  if (!app) return;

  document.querySelector(".download-card-overlay")?.remove();

  const overlay = document.createElement("div");
  overlay.className = "download-card-overlay";

  overlay.innerHTML = `
  <div class="download-card">

    <div class="download-card-header">
      <div class="download-card-actions">  
        <h2 class="download-card-title">${app.name || "App"}</h2>

      
        <a class="download-card-download" href="${app.download_url || "#"}">
          DOWNLOAD
        </a>

        <button class="download-card-close" type="button">X</button>
      </div>
    </div>

    <div class="download-card-body">

      <div class="download-card-shot">
        <img src="${app.screenshot_url || "assets/images/no-screenshot.jpg"}" alt="">
      </div>

      <div class="download-card-info">

        <div class="download-card-description">
          ${app.description || "Geen beschrijving."}
        </div>

        <div class="download-card-meta">
          <div><span>Versie</span><strong>${app.version || "-"}</strong></div>
          <div><span>Auteur</span><strong>${app.author || "-"}</strong></div>
          <div><span>Status</span><strong>${app.status || "-"}</strong></div>
          <div><span>Platform</span><strong>${app.platform || "-"}</strong></div>
          <div><span>Categorie</span><strong>${app.category || "-"}</strong></div>
        </div>

        <div class="download-card-specs">
          ${app.specs || ""}
        </div>

      </div>

    </div>

  </div>
`;

function showSaturnOverlay() {
let saturn = document.getElementById("saturnOverlay");

if (!saturn) {
  saturn = document.createElement("img");
  saturn.id = "saturnOverlay";
  saturn.src = "../assets/images/saturnus.PNG";
  saturn.alt = "";
  document.body.appendChild(saturn);
}
saturn.classList.add("show");
}
function hideSaturnOverlay() {
  document.getElementById("saturnOverlay")?.classList.remove("show");
}

document.body.appendChild(overlay);
showCardPlanetBg();

document.body.classList.add("planet-overlay-open");

overlay.querySelector(".download-card-close")?.addEventListener("click", () => {
  overlay.remove();
  hideCardPlanetBg();
  document.body.classList.remove("planet-overlay-open");
});
}

window.openDownloadOverlay = window.openDownloadOverlay || openDownloadOverlay;