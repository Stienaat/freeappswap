function formatFreeAppsInline(text) {
  return text.replace(
    /\*\*(.+?)\*\*/g,
    "<strong>$1</strong>"
  );
}

function formatFreeAppsText(value) {
  if (!value) return "";

  const escapeHtml = text =>
    text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const lines = escapeHtml(String(value))
    .replace(/\r\n/g, "\n")
    .split("\n");

  let html = "";
  let listType = null;
  let paragraphLines = [];

  function closeList() {
    if (listType === "ul") html += "</ul>";
    if (listType === "ol") html += "</ol>";
    listType = null;
  }

  function flushParagraph() {
    if (!paragraphLines.length) return;

    html += `<p>${paragraphLines
      .map(line => formatFreeAppsInline(line))
      .join("<br>")}</p>`;

    paragraphLines = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      closeList();
      continue;
    }

    const bulletMatch = line.match(/^-\s+(.+)$/);
    const numberMatch = line.match(/^\d+\.\s+(.+)$/);

    if (bulletMatch) {
      flushParagraph();

      if (listType !== "ul") {
        closeList();
        html += "<ul>";
        listType = "ul";
      }

      html += `<li>${formatFreeAppsInline(bulletMatch[1])}</li>`;
      continue;
    }

    if (numberMatch) {
      flushParagraph();

      if (listType !== "ol") {
        closeList();
        html += "<ol>";
        listType = "ol";
      }

      html += `<li>${formatFreeAppsInline(numberMatch[1])}</li>`;
      continue;
    }

    closeList();
    paragraphLines.push(line);
  }

  flushParagraph();
  closeList();

  return html;
}

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
        data-download-url="${app.download_url || ""}"
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

        <section class="download-card-text-section">
          <h3>BESCHRIJVING</h3>

        <div class="download-card-text">
          ${formatFreeAppsText(app.description || "Geen beschrijving beschikbaar.")}
        </div>
        </section>

        ${app.specs ? `
          <section class="download-card-text-section">
            <h3>SPECIFICATIES</h3>

          <div class="download-card-text">
            ${formatFreeAppsText(app.specs)}
          </div>
            </section>

          ` : ""}

        </div>

       <aside class="download-card-meta card-meta">
          <div><span>Versie</span><strong>${app.version || "-"}</strong></div>
          <div><span>Auteur</span><strong>${app.author || "-"}</strong></div>
          <div><span>Platform</span><strong>${app.platform || "-"}</strong></div>
          <div><span>Categorie</span><strong>${app.category || "-"}</strong></div>

          <div>
            <span>Talen</span>
            <strong>
              ${Array.isArray(app.languages) && app.languages.length
                ? app.languages.join(", ")
                : "-"}
            </strong>
          </div>
          ${app.readme_url ? `
          <a
            class="download-card-readme card-button"
            href="${app.readme_url}"
            target="_blank"
            rel="noopener noreferrer"
          >
            README / HANDLEIDING
          </a>
        ` : ""}
      </aside>
     
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

const downloadButton = overlay.querySelector(".download-card-download");

downloadButton?.addEventListener("click", event => {
  if (!loggedIn) {
    event.preventDefault();

    alert("Log in om deze app te downloaden.");
    focusBubble("account");

    return;
  }
});

showCardPlanetBg();

document.body.classList.add("planet-overlay-open");
  showCardPlanetBg();
  document.body.classList.add("planet-overlay-open");

  overlay.querySelector(".card-close")?.addEventListener("click", () => {
    overlay.remove();
    hideCardPlanetBg();
    document.body.classList.remove("planet-overlay-open");
  });
}

function showFreeAppsNotice(message) {

   console.log("showFreeAppsNotice:", message);
  document.querySelector(".freeapps-notice")?.remove();

  const notice = document.createElement("div");
  notice.className = "freeapps-notice";

  notice.innerHTML = `
    <div class="freeapps-notice-text">${message}</div>
    <button type="button" class="freeapps-notice-button">
      INLOGGEN
    </button>
  `;

  document.body.appendChild(notice);

  notice
    .querySelector(".freeapps-notice-button")
    .addEventListener("click", () => {
      notice.remove();
      focusBubble("account");
    });
}

window.openDownloadOverlay = window.openDownloadOverlay || openDownloadOverlay;
