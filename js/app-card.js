function openDownloadOverlay(appId) {
 

  const app = dbApps.find(a => a.id === appId);
  if (!app) return;

  document.querySelector(".app-card-overlay")?.remove();

  const overlay = document.createElement("div");
  overlay.className = "app-card-overlay";

  overlay.innerHTML = `
  <div class="app-card">

    <div class="app-card-header">
      <h2 class="app-card-title">${app.name || "App"}</h2>

      <div class="app-card-actions">
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

  document.body.appendChild(overlay);

  overlay.querySelector(".app-card-close")?.addEventListener("click", () => {
    overlay.remove();

     
  });
}

window.openDownloadOverlay = window.openDownloadOverlay || openDownloadOverlay;