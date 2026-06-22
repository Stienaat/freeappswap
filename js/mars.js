console.log("mars module loaded");

function getDownloadBubble() {
  return document.querySelector('.app-bubble[data-kind="download"]');
}

function renderDownloadStart(el = getDownloadBubble()) {
  loadDownloadAppsFromDb();
  if (!el) return;
  selectedPlatform = null;
  el.innerHTML = `
    <div class="planet-content">
      <div class="planet-title">DOWNLOAD</div>
      <div class="planet-list">
        ${appData.platforms.map(platform => `
          <button class="category-link" type="button" data-platform="${platform.id}">${platform.label}</button>
        `).join("")}
      </div>
    </div>
  `;
  el.querySelectorAll("[data-platform]").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      setDownloadPlatform(button.dataset.platform);
      focusBubble("download");
    });
  });
}

async function setDownloadPlatform(platformId) {

  await loadDownloadAppsFromDb();

  selectedPlatform = platformId;
  const el = getDownloadBubble();
  if (!el) return;
  const platform = platformMap[platformId];
  // Fase 3: toon alle categorieën voor dit platform.
  // Later mag dit rechtstreeks uit de DB komen.
  const categories = appData.categories;

  el.innerHTML = `
    <div class="planet-content">
      <div class="planet-title">${platform ? platform.label : platformId}</div>
      <div class="planet-list">
        ${categories.length ? categories.map(category => `
          <button class="category-link" type="button" data-category="${category.id}">${category.label}</button>
        `).join("") : `<div>nog geen apps</div>`}
        <button class="category-link soft-link" type="button" data-back-platforms="1">terug</button>
      </div>
    </div>
  `;
  el.querySelectorAll("[data-category]").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
    renderDownloadCategory(button.dataset.category);
    focusBubble("download");
    });
  });
  const back = el.querySelector("[data-back-platforms]");
  if (back) {
    back.addEventListener("click", event => {
      event.stopPropagation();
      renderDownloadStart(el);
      focusBubble("download");
    });
  }
}

function renderDownloadCategory(categoryId) {

  const el = getDownloadBubble();
  if (!el) return;

  const category = categoryMap[categoryId];
  const platformId = selectedPlatform || "apk";

const apps = dbApps.filter(app =>
  String(app.platform || "").trim().toLowerCase() === String(platformId || "").trim().toLowerCase() &&
  String(app.category || "").trim().toLowerCase() === String(categoryId || "").trim().toLowerCase()
);

  el.innerHTML = `
    <div class="planet-content">
      <div class="planet-title">${category?.label || categoryId}</div>

      <div class="planet-list">
        ${
          apps.length
            ? apps.map(app => `
                <button class="category-link app-link" type="button" data-app="${app.id}">
                  ${app.name}
                </button>
              `).join("")
            : `<div>nog geen apps</div>`
        }

        <button class="category-link soft-link" type="button" data-back-categories="1">
          terug
        </button>
      </div>
    </div>
  `;

el.querySelectorAll("[data-app]").forEach(button => {
  button.addEventListener("click", event => {
    event.stopPropagation();

const mars = getDownloadBubble();
if (mars) {
  mars.classList.remove("focus", "dim");
  mars.style.setProperty("--scale", "1");
}

renderDownloadStart();

    openDownloadOverlay(button.dataset.app);
    focusBubble(button.dataset.app);

  });
});

  el.querySelector("[data-back-categories]")?.addEventListener("click", event => {
    event.stopPropagation();
    setDownloadPlatform(platformId);
    focusBubble("download");
  });
}

async function loadDownloadAppsFromDb() {
  const { data, error } = await supabaseClient
    .from("apps")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  dbApps = data || [];
  return dbApps;
}

/*
function createCategoryBubble(categoryId) {
  const category = categoryMap[categoryId];
  if (!category) return;

  const existing = document.querySelector(`.app-bubble[data-kind="${categoryId}"]`);
  if (existing) {
    renderCategoryBubble(existing, categoryId);
    return;
  }

  const el = document.createElement("div");
  el.className = `app-bubble category ${categoryId}`;
  el.dataset.kind = categoryId;
  el.dataset.motionStatus = "0";
  renderCategoryBubble(el, categoryId);

  const fallbackPositions = {
    games: { x: randomBetween(17, 29), y: randomBetween(37, 55) },
    utilities: { x: randomBetween(70, 84), y: randomBetween(35, 55) }
  };
  const pos = fallbackPositions[categoryId] || { x: randomBetween(25, 78), y: randomBetween(35, 82) };

  preparePlanetBubble(el, pos.x, pos.y, "min(16vw, 23vh)");
}*/