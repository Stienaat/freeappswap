console.log("download fields + card reset module loaded");

(function () {
  "use strict";

  const processedDownloadCards = new WeakSet();
  const processedOverlays = new WeakSet();

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function normalizeList(value) {
    if (Array.isArray(value)) {
      return value
        .map(item => String(item || "").trim())
        .filter(Boolean);
    }

    if (value == null || value === "") return [];

    const text = String(value).trim();

    // Ondersteunt zowel gewone tekst als een PostgreSQL-arraynotatie:
    // {"Nederlands","English"}
    if (text.startsWith("{") && text.endsWith("}")) {
      return text
        .slice(1, -1)
        .split(",")
        .map(item => item.trim().replace(/^"(.*)"$/, "$1"))
        .filter(Boolean);
    }

    return text
      .split(/\r?\n|[,;]+/)
      .map(item => item.trim())
      .filter(Boolean);
  }

  function formatFileSize(value) {
    if (value == null || value === "") return "";

    const raw = String(value).trim();
    const numericText = raw
      .replace(/\s*(mb|mib|kb|kib|gb|gib)\s*$/i, "")
      .replace(",", ".");

    const number = Number(numericText);

    if (!Number.isFinite(number)) {
      return raw;
    }

    return `${new Intl.NumberFormat("nl-BE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(number)} MB`;
  }

  function renderList(items, emptyText = "") {
    if (!items.length) {
      return emptyText ? `<p class="app-field-empty">${escapeHtml(emptyText)}</p>` : "";
    }

    return `
      <ul class="app-field-list">
        ${items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    `;
  }

  function findDownloadApp(overlay, card) {
    const appId =
      overlay?.dataset?.appId ||
      card?.dataset?.appId ||
      window.currentDownloadAppId ||
      null;

    const apps =
      window.dbApps ||
      window.downloadApps ||
      window.apps ||
      [];

    if (appId) {
      const found = apps.find(app => String(app.id) === String(appId));
      if (found) return found;
    }

    const title = card
      ?.querySelector(".download-card-title, .card-title")
      ?.textContent
      ?.trim();

    if (!title) return null;

    return apps.find(app =>
      String(app.name || "").trim().toLowerCase() === title.toLowerCase()
    ) || null;
  }

  function renderDownloadFields(overlay) {
    const card = overlay.querySelector(".download-card");
    if (!card || processedDownloadCards.has(card)) return;

    const app = findDownloadApp(overlay, card);
    if (!app) return;

    processedDownloadCards.add(card);

    overlay.dataset.appId = app.id || overlay.dataset.appId || "";
    card.dataset.appId = app.id || card.dataset.appId || "";
    if (app.id) window.currentDownloadAppId = app.id;

    const info =
      card.querySelector(".download-card-info, .card-info") ||
      card.querySelector(".download-card-body, .card-body");

    if (!info) return;

    // De oude meta/specs blijven niet dubbel zichtbaar.
    info.querySelector(".download-card-meta, .card-meta")?.remove();
    info.querySelector(".download-card-specs, .card-specs")?.remove();
    info.querySelector(".download-card-extra-fields")?.remove();

    const features = normalizeList(app.features);
    const languages = normalizeList(app.languages);
    const specs = String(app.specs || "").trim();
    const privacy = String(app.privacy || "").trim();
    const fileSize = formatFileSize(app.file_size);

    const extra = document.createElement("section");
    extra.className = "download-card-extra-fields";

    extra.innerHTML = `
      <div class="app-field-meta-grid">
        ${app.version ? `
          <div><span>Versie</span><strong>${escapeHtml(app.version)}</strong></div>
        ` : ""}

        ${app.author ? `
          <div><span>Auteur</span><strong>${escapeHtml(app.author)}</strong></div>
        ` : ""}

        ${app.platform ? `
          <div><span>Platform</span><strong>${escapeHtml(app.platform)}</strong></div>
        ` : ""}

        ${app.category ? `
          <div><span>Categorie</span><strong>${escapeHtml(app.category)}</strong></div>
        ` : ""}

        ${fileSize ? `
          <div><span>Bestandsgrootte</span><strong>${escapeHtml(fileSize)}</strong></div>
        ` : ""}

        ${app.min_android ? `
          <div><span>Minimum Android</span><strong>${escapeHtml(app.min_android)}</strong></div>
        ` : ""}

        ${app.license ? `
          <div><span>Licentie</span><strong>${escapeHtml(app.license)}</strong></div>
        ` : ""}
      </div>

      ${features.length ? `
        <section class="app-field-section">
          <h3>Mogelijkheden</h3>
          ${renderList(features)}
        </section>
      ` : ""}

      ${specs ? `
        <section class="app-field-section">
          <h3>Technische gegevens</h3>
          <div class="app-field-text">${escapeHtml(specs).replaceAll("\n", "<br>")}</div>
        </section>
      ` : ""}

      ${languages.length ? `
        <section class="app-field-section">
          <h3>Talen</h3>
          <div class="app-language-list">
            ${languages.map(language => `
              <span>${escapeHtml(language)}</span>
            `).join("")}
          </div>
        </section>
      ` : ""}

      ${privacy ? `
        <section class="app-field-section app-privacy-section">
          <h3>Privacy</h3>
          <div class="app-field-text">${escapeHtml(privacy).replaceAll("\n", "<br>")}</div>
        </section>
      ` : ""}
    `;

    info.appendChild(extra);
  }

  async function resetPersistentAccountFields() {
    const password = document.getElementById("loginPassword");
    const confirm = document.getElementById("loginPasswordConfirm");
    const message = document.getElementById("loginMessage");

    if (password) password.value = "";
    if (confirm) confirm.value = "";
    if (message) message.textContent = "";

    let user = null;

    try {
      const result = await window.supabaseClient?.auth?.getUser?.();
      user = result?.data?.user || null;
    } catch {
      user = null;
    }

    // Zonder ingelogde gebruiker start ook naam/e-mail schoon.
    if (!user) {
      const name = document.getElementById("loginName");
      const email = document.getElementById("loginEmail");

      if (name) name.value = "";
      if (email) email.value = "";
    }
  }

  function clearStatusElements(root) {
    root.querySelectorAll(`
      .upload-status,
      .mercury-status,
      .review-form-status,
      .juno-card-status,
      #junoStatus,
      [data-form-status]
    `).forEach(element => {
      element.textContent = "";
      element.classList.remove("error", "success");
    });
  }

  function resetMercury(root) {
    const form = root.querySelector("#mercuryContactForm");
    if (!form) return;

    // Naam en e-mail worden bewust behouden wanneer de module
    // ze voor een ingelogd lid vooraf invult.
    const name = form.elements.name?.value || "";
    const email = form.elements.email?.value || "";
    const userId = form.elements.user_id?.value || "";

    form.reset();

    if (form.elements.name) form.elements.name.value = name;
    if (form.elements.email) form.elements.email.value = email;
    if (form.elements.user_id) form.elements.user_id.value = userId;
    if (form.elements.message_type) form.elements.message_type.value = "question";
    if (form.elements.subject) form.elements.subject.value = "";
    if (form.elements.message) form.elements.message.value = "";
  }

  function resetJuno(root) {
    const amount = root.querySelector("#junoAmount");
    if (amount) amount.value = "";

    const qrHost = root.querySelector("#junoQrHost");
    if (qrHost && typeof window.renderJunoQr === "function") {
      try {
        window.renderJunoQr(null);
      } catch {
        // De bestaande Juno-module beheert de placeholder zelf.
      }
    }
  }

  function resetReviewForms(root) {
    root.querySelectorAll(".review-form").forEach(form => {
      form.reset();
      if (form.elements.rating) form.elements.rating.value = "0";

      form.querySelectorAll("[data-rating]").forEach(star => {
        star.classList.remove("selected");
      });

      form.hidden = true;
    });

    root.querySelectorAll(".review-write-button").forEach(button => {
      button.hidden = false;
    });
  }

  function resetUpload(root) {
    const form = root.querySelector("form");

    if (form) {
      const preserved = [];

      form.querySelectorAll("input, textarea, select").forEach(field => {
        const key = `${field.name || ""} ${field.id || ""}`.toLowerCase();

        // Alleen de vooraf ingevulde naam/auteur en e-mail mogen blijven.
        if (
          key.includes("email") ||
          key.includes("author") ||
          key.includes("auteur")
        ) {
          preserved.push([field, field.value]);
        }
      });

      form.reset();

      preserved.forEach(([field, value]) => {
        field.value = value;
      });
    } else {
      root.querySelectorAll("input, textarea, select").forEach(field => {
        const key = `${field.name || ""} ${field.id || ""}`.toLowerCase();

        if (
          key.includes("email") ||
          key.includes("author") ||
          key.includes("auteur") ||
          field.type === "file"
        ) {
          if (field.type === "file") field.value = "";
          return;
        }

        if (field.tagName === "SELECT") {
          field.selectedIndex = 0;
        } else if (field.type !== "hidden") {
          field.value = "";
        }
      });
    }

    root.querySelectorAll(".upload-preview").forEach(preview => {
      preview.removeAttribute("src");
      preview.style.display = "none";
    });
  }

  function resetNewOverlay(overlay) {
    if (processedOverlays.has(overlay)) return;
    processedOverlays.add(overlay);

    clearStatusElements(overlay);

    if (overlay.matches(".mercury-card-overlay")) {
      resetMercury(overlay);
    }

    if (overlay.matches(".juno-card-overlay")) {
      resetJuno(overlay);
    }

    if (overlay.matches(".download-card-overlay")) {
      resetReviewForms(overlay);
      renderDownloadFields(overlay);
    }

    if (overlay.matches(".upload-card-overlay")) {
      resetUpload(overlay);
    }
  }

  function inspectNode(node) {
    if (!(node instanceof Element)) return;

    if (node.matches(`
      .mercury-card-overlay,
      .juno-card-overlay,
      .download-card-overlay,
      .upload-card-overlay
    `)) {
      // Eén frame wachten zodat de oorspronkelijke module eerst
      // naam/e-mail of appgegevens kan invullen.
      requestAnimationFrame(() => resetNewOverlay(node));
    }

    node.querySelectorAll?.(`
      .mercury-card-overlay,
      .juno-card-overlay,
      .download-card-overlay,
      .upload-card-overlay
    `).forEach(overlay => {
      requestAnimationFrame(() => resetNewOverlay(overlay));
    });
  }

  document.addEventListener("click", event => {
    if (event.target.closest('.app-bubble[data-kind="account"], .account')) {
      resetPersistentAccountFields();
    }
  }, true);

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(inspectNode);
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  document.querySelectorAll(`
    .mercury-card-overlay,
    .juno-card-overlay,
    .download-card-overlay,
    .upload-card-overlay
  `).forEach(resetNewOverlay);
})();
