console.log("mars module loaded");

let dbApps = [];

function getDownloadBubble() {
  return document.querySelector('.app-bubble[data-kind="download"]');
}

function renderDownloadStart(el = getDownloadBubble()) {
  if (!el) return;

  el.innerHTML = `
    <div class="planet-content">
      <div class="planet-title">DOWNLOAD</div>
    </div>
  `;
}

async function renderDownloadApps(el = getDownloadBubble()) {
  if (!el) return;

  await loadDownloadAppsFromDb();

  el.innerHTML = `
    <div class="planet-content download-focus-content">
      <div class="planet-title">DOWNLOAD</div>

      <div class="download-list-overlay">

        <input
          class="download-search"
          type="text"
          placeholder="Zoek app..."
          autocomplete="off"
        >

        <div class="download-list-header">
          <span>NAAM</span>
          <span>TYPE</span>
          <span>OMSCHRIJVING</span>
        </div>

        <div class="download-app-list">
          ${renderDownloadAppList(dbApps)}
        </div>

      </div>
    </div>
  `;

  const search = el.querySelector(".download-search");
  const list = el.querySelector(".download-app-list");

  search?.addEventListener("click", event => {
    event.stopPropagation();
  });

  search?.addEventListener("input", () => {
    const value = search.value.trim().toLowerCase();

    const filteredApps = dbApps.filter(app =>
      String(app.name || "").toLowerCase().includes(value)
    );

    list.innerHTML = renderDownloadAppList(filteredApps);
    bindDownloadAppButtons(list);
  });

  bindDownloadAppButtons(list);
}

function renderDownloadAppList(apps) {
  if (!apps.length) {
    return `<div class="download-no-apps">Geen apps gevonden</div>`;
  }

  return apps.map(app => `
    <button
      class="download-app-row"
      type="button"
      data-app="${app.id}"
    >
      <span class="download-app-name">
        ${app.name || ""}
      </span>

      <span class="download-app-platform">
        ${String(app.platform || "").toUpperCase()}
      </span>

      <span class="download-app-subtitle">
        ${app.subtitle || ""}
      </span>
    </button>
  `).join("");
}

function bindDownloadAppButtons(container) {
  container.querySelectorAll("[data-app]").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();

      openDownloadOverlay(button.dataset.app);
      focusBubble(button.dataset.app);
    });
  });
}

async function loadDownloadAppsFromDb() {
  const { data, error } = await supabaseClient
    .from("apps")
    .select("*")
    .eq("status", "accepted")
    .order("name", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  dbApps = data || [];
  return dbApps;
}

