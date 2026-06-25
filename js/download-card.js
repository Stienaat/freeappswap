function openDownloadOverlay(appId) {
 

  const app = dbApps.find(a => a.id === appId);
  if (!app) return;

  document.querySelector(".app-card-overlay")?.remove();

  const overlay = document.createElement("div");
  overlay.className = "app-card-overlay";

  overlay.innerHTML = `
  <div class="app-card">

    <div class="app-card-header">
      <div class="app-card-actions">  
        <h2 class="app-card-title">${app.name || "App"}</h2>

      
        <a class="app-card-download" href="${app.download_url || "#"}">
          DOWNLOAD
        </a>

        <button class="app-card-close" type="button">X</button>
      </div>
    </div>

    <div class="app-card-body">

      <div class="app-card-shot">
        <img src="${app.screenshot_url || "assets/images/no-screenshot.jpg"}" alt="">
      </div>

      <div class="app-card-info">

        <div class="app-card-description">
          ${app.description || "Geen beschrijving."}
        </div>

        <div class="app-card-meta">
          <div><span>Versie</span><strong>${app.version || "-"}</strong></div>
          <div><span>Auteur</span><strong>${app.author || "-"}</strong></div>
          <div><span>Status</span><strong>${app.status || "-"}</strong></div>
          <div><span>Platform</span><strong>${app.platform || "-"}</strong></div>
          <div><span>Categorie</span><strong>${app.category || "-"}</strong></div>
        </div>

        <div class="app-card-specs">
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

overlay.querySelector(".app-card-close")?.addEventListener("click", () => {
  overlay.remove();
  hideCardPlanetBg();
  document.body.classList.remove("planet-overlay-open");
});
}

window.openDownloadOverlay = window.openDownloadOverlay || openDownloadOverlay;