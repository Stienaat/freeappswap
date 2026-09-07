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

    <div class="download-category-filters" id="downloadCategoryFilters"></div>

        <div class="download-list-header">
          <span>NAAM</span>
          <span>TYPE</span>
          <span>CATEGORIE</span>
        </div>

        <div class="download-app-list">
          ${renderDownloadAppList(dbApps)}
        </div>

      </div>
    </div>
  `;

const categoryFilters = el.querySelector("#downloadCategoryFilters");
const list = el.querySelector(".download-app-list");

categoryFilters?.addEventListener("click", event => {
  event.stopPropagation();
});

categoryFilters?.addEventListener("pointerdown", event => {
  event.stopPropagation();
});

if (categoryFilters) {
  const { data: categories, error: categoryError } = await supabaseClient
    .from("app_categories")
    .select("id, name, parent_id, sort_order, active")
    .eq("active", true)
    .is("parent_id", null)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (categoryError) {
    console.error("Mars categorieën laden mislukt:", categoryError);
  } else {
    categoryFilters.innerHTML = `
      <select class="download-category-level" data-level="0">
        <option value="">Alle categorieën</option>
        ${(categories || []).map(item => `
          <option value="${item.id}">
            ${item.name}
          </option>
        `).join("")}
      </select>
    `;
  }
}

categoryFilters?.addEventListener("change", async event => {
  const select = event.target.closest(".download-category-level");
  if (!select) return;

  const level = Number(select.dataset.level);

  // Alle dropdowns rechts van de gewijzigde dropdown verwijderen
  categoryFilters
    .querySelectorAll(".download-category-level")
    .forEach(item => {
      if (Number(item.dataset.level) > level) {
        item.remove();
      }
    });

  // Geselecteerd categoriepad samenstellen
  const selectedPath = Array.from(
    categoryFilters.querySelectorAll(".download-category-level")
  )
    .map(item =>
      item.value
        ? item.options[item.selectedIndex]?.textContent.trim()
        : ""
    )
    .filter(Boolean)
    .join(" > ");

  // App-lijst filteren
  const filteredApps = selectedPath
    ? dbApps.filter(app =>
        String(app.category || "")
          .toLowerCase()
          .startsWith(selectedPath.toLowerCase())
      )
    : dbApps;

  list.innerHTML = renderDownloadAppList(filteredApps);
  bindDownloadAppButtons(list);

  // Geen selectie = geen volgende dropdown
  if (!select.value) return;

  // Kindcategorieën ophalen
  const { data: children, error } = await supabaseClient
    .from("app_categories")
    .select("id, name, parent_id, sort_order")
    .eq("active", true)
    .eq("parent_id", select.value)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Mars subcategorieën laden mislukt:", error);
    return;
  }

  if (!children?.length) return;

  const nextLevel = level + 1;

  const nextSelect = document.createElement("select");
  nextSelect.className = "download-category-level";
  nextSelect.dataset.level = nextLevel;

  const parentName =
    select.options[select.selectedIndex]?.textContent.trim() || "";

  const title =
    nextLevel === 1
      ? "Alle subcategorieën"
      : `Alle ${parentName}`;

  nextSelect.innerHTML = `
    <option value="">${title}</option>
    ${children.map(item => `
      <option value="${item.id}">${item.name}</option>
    `).join("")}
  `;

  categoryFilters.appendChild(nextSelect);
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

      <span class="download-app-category ">
        ${app.category   || ""}
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

