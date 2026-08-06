function openDownloadOverlay(appId) {
  const app = dbApps.find(a => a.id === appId);
  if (!app) return;

if (app.status !== "accepted") {
  console.warn("App is nog niet geaccepteerd:", app.name);
  return;
}


  document.querySelector(".download-card-overlay")?.remove();

  const overlay = document.createElement("div");
  overlay.className = "download-card-overlay card-overlay";

  overlay.innerHTML = `
    <div class="download-card card">

      <header class="download-card-header card-header">
        <h2 class="download-card-title card-title">${app.name || "App"}</h2>

        <div class="download-card-actions card-actions">
          <a
            class="download-card-download card-button"
            href="${app.download_url || "#"}"
          >
            DOWNLOAD
          </a>

          <button
            class="download-card-close card-close"
            type="button"
            aria-label="Sluiten"
          >
            ×
          </button>
        </div>
      </header>

      <div class="download-card-body card-body">

        <div class="download-card-shot card-shot">
          <img
            src="${app.screenshot_url || "assets/images/no-screenshot.jpg"}"
            alt="Screenshot van ${app.name || "de app"}"
          >
        </div>

        <div class="download-card-main">
          <div class="download-card-description card-description">
  ${app.description || "Geen beschrijving."}
</div>

${app.features && app.features.length ? `
<div class="download-card-section">
  <h3>Mogelijkheden</h3>
  <ul>
    ${app.features.map(f => `<li>${f}</li>`).join("")}
  </ul>
</div>
` : ""}

<div class="download-card-specs card-specs">
  ${app.specs || ""}
</div>

${app.languages && app.languages.length ? `
<div class="download-card-section">
  <h3>Talen</h3>
  ${app.languages.join(", ")}
</div>
` : ""}

${app.privacy ? `
<div class="download-card-section">
  <h3>Privacy</h3>
  ${app.privacy}
</div>
` : ""}
        </div>

        <aside class="download-card-meta card-meta">
          <div><span>Versie</span><strong>${app.version || "-"}</strong></div>
          <div><span>Auteur</span><strong>${app.author || "-"}</strong></div>
          <div><span>Platform</span><strong>${app.platform || "-"}</strong></div>
          <div><span>Categorie</span><strong>${app.category || "-"}</strong></div>
          <div><span>Bestand</span><strong>${app.file_size || "-"} MB</strong></div>
          <div><span>Android</span><strong>${app.min_android || "-"}</strong></div>
          <div><span>Licentie</span><strong>${app.license || "-"}</strong></div>
        </aside>

      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  showCardPlanetBg();
  document.body.classList.add("planet-overlay-open");

  overlay.querySelector(".card-close")?.addEventListener("click", () => {
    overlay.remove();
    hideCardPlanetBg();
    document.body.classList.remove("planet-overlay-open");
  });
}

window.openDownloadOverlay = window.openDownloadOverlay || openDownloadOverlay;
