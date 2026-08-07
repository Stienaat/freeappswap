console.log("admin config module loaded");

const SITE_CONFIG_JUNO_KEY = "juno";

window.attachAdminConfigButton = function attachAdminConfigButton(admin) {
  if (!admin) return;

  const button =
    admin.querySelector("#btnConfig") ||
    admin.querySelector("#btnStats");

  if (!button) return;

  button.id = "btnConfig";
  button.textContent = "config";

  button.onclick = event => {
    event.stopPropagation();
    window.openAdminConfigCard();
  };
};

function setConfigStatus(text, isError = false) {
  const status = document.getElementById("adminConfigStatus");
  if (!status) return;

  status.textContent = text;
  status.classList.toggle("error", isError);
}

async function readSiteConfig(key) {
  const { data, error } = await supabaseClient
    .from("site_config")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error) throw error;
  return data?.value || {};
}

async function writeSiteConfig(key, value) {
  const { data: authData } = await supabaseClient.auth.getUser();

  const { error } = await supabaseClient
    .from("site_config")
    .upsert({
      key,
      value,
      updated_at: new Date().toISOString(),
      updated_by: authData?.user?.id || null
    }, {
      onConflict: "key"
    });

  if (error) throw error;
}


function selectConfigTab(name) {
  document.querySelectorAll(".admin-config-tab").forEach(button => {
    button.classList.toggle("active", button.dataset.tab === name);
  });

  document.querySelectorAll(".admin-config-page").forEach(page => {
    page.classList.toggle("active", page.dataset.page === name);
  });
}

window.closeAdminConfigCard = function closeAdminConfigCard() {
  closeAdminReviewDetail();
  closeAdminContactDetail();
  document.getElementById("adminConfigOverlay")?.remove();
  document.body.classList.remove("admin-config-open");
};

window.openAdminConfigCard = async function openAdminConfigCard() {
  window.closeAdminConfigCard();

  const overlay = document.createElement("div");
  overlay.id = "adminConfigOverlay";
  overlay.className = "admin-config-overlay";

  overlay.innerHTML = `
    <section class="admin-config-card" role="dialog" aria-modal="true" aria-labelledby="adminConfigTitle">
      <header class="admin-config-header">
        <div>
          <div class="admin-config-kicker">VENUS</div>
          <h2 id="adminConfigTitle">CONFIG</h2>
        </div>
        <button id="btnCloseAdminConfig" class="admin-config-close" type="button" aria-label="Sluiten">×</button>
      </header>

      <nav class="admin-config-tabs">
        <button class="admin-config-tab active" data-tab="juno" type="button">JUNO</button>
        <button class="admin-config-tab" data-tab="reviews" type="button">REVIEWS</button>
        <button class="admin-config-tab" data-tab="stats" type="button">STATISTIEKEN</button>
        <button class="admin-config-tab" data-tab="contact" type="button">CONTACT</button>
      </nav>

      <main class="admin-config-body">
        <section class="admin-config-page active" data-page="juno">
          <form id="adminJunoConfigForm">
            <div class="admin-config-bank-grid">
              <section class="admin-config-bank-panel">
                <h3>BETALINGSGEGEVENS</h3>

                <label class="admin-config-check">
                  <input name="enabled" type="checkbox">
                  <span>Juno actief</span>
                </label>

                <label>Begunstigde
                  <input
                    name="beneficiary"
                    maxlength="70"
                    autocomplete="organization"
                    placeholder="Naam rekeninghouder"
                    required
                  >
                </label>

                <label>IBAN
                  <input
                    name="iban"
                    maxlength="42"
                    autocomplete="off"
                    inputmode="text"
                    placeholder="BE00 0000 0000 0000"
                    required
                  >
                </label>

                <label>BIC <small>optioneel voor betalingen binnen de EER</small>
                  <input
                    name="bic"
                    maxlength="11"
                    autocomplete="off"
                    inputmode="text"
                    placeholder="bv. GEBABEBB"
                  >
                </label>

                <label>Mededeling
                  <input
                    name="payment_reference"
                    maxlength="140"
                    placeholder="Steun FreeApps Exchange"
                  >
                </label>

                <label>Maximum bedrag
                  <div class="admin-config-money">
                    <span>€</span>
                    <input
                      name="max_amount"
                      type="number"
                      min="0.01"
                      max="10"
                      step="0.01"
                      value="10"
                    >
                  </div>
                </label>
              </section>

              <section class="admin-config-bank-panel admin-config-message-panel">
                <h3>JUNO-KAART</h3>

                <label>Tekst op Juno
                  <textarea name="message" rows="9" maxlength="600"></textarea>
                </label>

                <div class="admin-config-epc-note">
                  De QR-code wordt automatisch aangemaakt uit IBAN,
                  begunstigde, mededeling en het gekozen bedrag.
                </div>
              </section>
            </div>

            <div id="adminConfigStatus" class="admin-config-status">Laden...</div>

            <footer class="admin-config-actions">
              <button id="btnPreviewJuno" type="button">VOORBEELD</button>
              <button class="primary" type="submit">OPSLAAN</button>
            </footer>
          </form>
        </section>

        <section class="admin-config-page" data-page="reviews">
          <div class="admin-review-toolbar">
            <strong>REVIEWS</strong>
            <div>
              <select id="adminReviewStatusFilter">
                <option value="">alle statussen</option>
                <option value="visible">zichtbaar</option>
                <option value="hidden">verborgen</option>
              </select>
              <button id="btnRefreshAdminReviews" type="button">VERVERS</button>
            </div>
          </div>

          <div class="admin-review-table-wrap">
            <table class="admin-review-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>App</th>
                  <th>Score</th>
                  <th>Gebruiker</th>
                  <th>Datum</th>
                </tr>
              </thead>
              <tbody id="adminReviewBody">
                <tr><td colspan="5">Open het tabblad om reviews te laden.</td></tr>
              </tbody>
            </table>
          </div>

          <div id="adminReviewStatus" class="admin-review-status"></div>
        </section>

        <section class="admin-config-page" data-page="stats">
          <div class="admin-stats-toolbar">
            <strong>STATISTIEKEN</strong>
            <button id="btnRefreshAdminStats" type="button">VERVERS</button>
          </div>

          <div id="adminStatsGrid" class="admin-stats-grid">
            <div class="admin-stat-card"><span>Leden</span><strong id="statMembers">-</strong></div>
            <div class="admin-stat-card"><span>Apps</span><strong id="statApps">-</strong></div>
            <div class="admin-stat-card"><span>Pending</span><strong id="statPending">-</strong></div>
            <div class="admin-stat-card"><span>Accepted</span><strong id="statAccepted">-</strong></div>
            <div class="admin-stat-card"><span>Downloads</span><strong id="statDownloads">-</strong></div>
            <div class="admin-stat-card"><span>Reviews</span><strong id="statReviews">-</strong></div>
            <div class="admin-stat-card"><span>Gem. rating</span><strong id="statRating">-</strong></div>
            <div class="admin-stat-card"><span>Nieuwe contacten</span><strong id="statContacts">-</strong></div>
            <div class="admin-stat-card"><span>Bezoeken vandaag</span><strong id="statVisitsToday">-</strong></div>
            <div class="admin-stat-card"><span>Bezoeken 7 dagen</span><strong id="statVisitsWeek">-</strong></div>
            <div class="admin-stat-card"><span>Bezoeken totaal</span><strong id="statVisitsTotal">-</strong></div>
          </div>

          <section class="admin-top-downloads">
            <h3>MEEST GEDOWNLOAD</h3>
            <div id="adminTopDownloads">laden...</div>
          </section>

          <div id="adminStatsStatus" class="admin-stats-status"></div>
        </section>

        <section class="admin-config-page" data-page="contact">
          <div class="admin-contact-toolbar">
            <strong>CONTACTBERICHTEN</strong>

            <div>
              <select id="adminContactStatusFilter">
                <option value="">alle statussen</option>
                <option value="new">nieuw</option>
                <option value="read">gelezen</option>
                <option value="answered">beantwoord</option>
                <option value="archived">gearchiveerd</option>
              </select>

              <button id="btnRefreshAdminContact" type="button">VERVERS</button>
            </div>
          </div>

          <div class="admin-contact-table-wrap">
            <table class="admin-contact-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Datum</th>
                  <th>Type</th>
                  <th>Naam</th>
                  <th>Onderwerp</th>
                </tr>
              </thead>
              <tbody id="adminContactBody">
                <tr><td colspan="5">Open het tabblad om berichten te laden.</td></tr>
              </tbody>
            </table>
          </div>

          <div id="adminContactStatus" class="admin-contact-status"></div>
        </section>
      </main>
    </section>
  `;

  document.body.appendChild(overlay);
  document.body.classList.add("admin-config-open");

  overlay.addEventListener("click", event => {
    if (event.target === overlay) window.closeAdminConfigCard();
  });

  overlay.querySelector("#btnCloseAdminConfig").onclick =
    window.closeAdminConfigCard;

  overlay.querySelectorAll(".admin-config-tab").forEach(button => {
    button.addEventListener("click", () => {
      const tabName = button.dataset.tab;
      selectConfigTab(tabName);

      if (tabName === "contact") {
        loadAdminContactMessages();
      }

      if (tabName === "reviews") {
        loadAdminReviews();
      }

      if (tabName === "stats") {
        loadAdminStats();
      }
    });
  });


  overlay.querySelector("#btnRefreshAdminContact").onclick =
    loadAdminContactMessages;

  overlay.querySelector("#adminContactStatusFilter").onchange =
    loadAdminContactMessages;

  overlay.querySelector("#btnRefreshAdminReviews").onclick =
    loadAdminReviews;

  overlay.querySelector("#adminReviewStatusFilter").onchange =
    loadAdminReviews;

  overlay.querySelector("#btnRefreshAdminStats").onclick =
    loadAdminStats;

  const form = overlay.querySelector("#adminJunoConfigForm");

  overlay.querySelector("#btnPreviewJuno").onclick = async () => {
    const saved = await saveJunoConfig(form);

    if (saved && typeof window.openJunoCard === "function") {
      window.openJunoCard();
    }
  };

  form.onsubmit = async event => {
    event.preventDefault();
    await saveJunoConfig(form);
  };

  try {
    const config = await readSiteConfig(SITE_CONFIG_JUNO_KEY);

    form.elements.enabled.checked = config.enabled !== false;
    form.elements.beneficiary.value = config.beneficiary || "";
    form.elements.iban.value = config.iban || "";
    form.elements.bic.value = config.bic || "";
    form.elements.payment_reference.value = config.payment_reference || "";
    form.elements.max_amount.value =
      Math.min(Number(config.max_amount) || 10, 10);

    form.elements.message.value =
      config.message ||
      "FreeApps Exchange blijft gratis, zonder advertenties en zonder abonnementen. Kosten zijn er helaas altijd.";

    setConfigStatus("Juno-configuratie geladen.");
  } catch (error) {
    console.error(error);
    setConfigStatus(
      `Laden mislukt: ${error.message}. Voer eerst site_config.sql uit.`,
      true
    );
  }
};

function normalizeIban(value) {
  return String(value || "").replace(/\s+/g, "").toUpperCase();
}

function normalizeBic(value) {
  return String(value || "").replace(/\s+/g, "").toUpperCase();
}

function isValidIban(iban) {
  const normalized = normalizeIban(iban);

  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(normalized)) return false;

  const rearranged = normalized.slice(4) + normalized.slice(0, 4);
  let remainder = 0;

  for (const character of rearranged) {
    const converted =
      character >= "A" && character <= "Z"
        ? String(character.charCodeAt(0) - 55)
        : character;

    for (const digit of converted) {
      remainder = (remainder * 10 + Number(digit)) % 97;
    }
  }

  return remainder === 1;
}

function isValidBic(bic) {
  if (!bic) return true;
  return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(normalizeBic(bic));
}

async function saveJunoConfig(form) {
  const formData = new FormData(form);

  const value = {
    enabled: form.elements.enabled.checked,
    beneficiary: String(formData.get("beneficiary") || "").trim(),
    iban: normalizeIban(formData.get("iban")),
    bic: normalizeBic(formData.get("bic")),
    payment_reference:
      String(formData.get("payment_reference") || "").trim(),
    max_amount: Math.min(
      Math.max(Number(formData.get("max_amount")) || 10, 0.01),
      10
    ),
    message: String(formData.get("message") || "").trim()
  };

  if (!value.beneficiary) {
    setConfigStatus("Begunstigde is verplicht.", true);
    return false;
  }

  if (!isValidIban(value.iban)) {
    setConfigStatus("Het IBAN is niet geldig.", true);
    return false;
  }

  if (!isValidBic(value.bic)) {
    setConfigStatus("Het BIC-formaat is niet geldig.", true);
    return false;
  }

  setConfigStatus("Opslaan...");

  try {
    await writeSiteConfig(SITE_CONFIG_JUNO_KEY, value);

    window.FREEAPPS_CONFIG = window.FREEAPPS_CONFIG || {};
    window.FREEAPPS_CONFIG.juno = value;

    setConfigStatus("Juno-configuratie opgeslagen.");
    return true;
  } catch (error) {
    console.error(error);
    setConfigStatus(`Opslaan mislukt: ${error.message}`, true);
    return false;
  }
}



function setAdminReviewStatus(text, isError = false) {
  const status = document.getElementById("adminReviewStatus");
  if (!status) return;
  status.textContent = text;
  status.classList.toggle("error", isError);
}

async function loadAdminReviews() {
  const body = document.getElementById("adminReviewBody");
  const filter = document.getElementById("adminReviewStatusFilter");
  if (!body) return;

  body.innerHTML = `<tr><td colspan="5">laden...</td></tr>`;
  setAdminReviewStatus("");

  let query = supabaseClient
    .from("reviews")
    .select("id, app_id, user_id, rating, title, review_text, status, created_at, apps(name), members(name,email)")
    .order("created_at", { ascending: false })
    .limit(300);

  if (filter?.value) query = query.eq("status", filter.value);

  const { data, error } = await query;

  if (error) {
    console.error(error);
    body.innerHTML = `<tr><td colspan="5">Laden mislukt.</td></tr>`;
    setAdminReviewStatus(error.message, true);
    return;
  }

  window.currentAdminReviews = data || [];

  if (!data?.length) {
    body.innerHTML = `<tr><td colspan="5">Geen reviews gevonden.</td></tr>`;
    return;
  }

  body.innerHTML = data.map(item => `
    <tr data-review-id="${adminContactEscape(item.id)}">
      <td><span class="admin-review-badge status-${adminContactEscape(item.status)}">${adminContactEscape(item.status)}</span></td>
      <td>${adminContactEscape(item.apps?.name || "-")}</td>
      <td class="admin-review-stars">${"★".repeat(Number(item.rating) || 0)}${"☆".repeat(5 - (Number(item.rating) || 0))}</td>
      <td>${adminContactEscape(item.members?.name || item.members?.email || "-")}</td>
      <td>${adminContactEscape(new Date(item.created_at).toLocaleDateString("nl-BE"))}</td>
    </tr>
  `).join("");

  body.querySelectorAll("tr[data-review-id]").forEach(row => {
    row.onclick = () => {
      const item = window.currentAdminReviews.find(review => String(review.id) === String(row.dataset.reviewId));
      if (item) openAdminReviewDetail(item);
    };
  });
}

function closeAdminReviewDetail() {
  document.getElementById("adminReviewDetailOverlay")?.remove();
}

function openAdminReviewDetail(item) {
  closeAdminReviewDetail();

  const overlay = document.createElement("div");
  overlay.id = "adminReviewDetailOverlay";
  overlay.className = "admin-review-detail-overlay";

  overlay.innerHTML = `
    <section class="admin-review-detail">
      <header>
        <div>
          <div class="admin-review-detail-kicker">${adminContactEscape(item.apps?.name || "App")}</div>
          <h3>${adminContactEscape(item.title || "Review")}</h3>
        </div>
        <button class="admin-review-detail-close" type="button">×</button>
      </header>

      <div class="admin-review-detail-rating">
        ${"★".repeat(Number(item.rating) || 0)}${"☆".repeat(5 - (Number(item.rating) || 0))}
      </div>

      <div class="admin-review-detail-meta">
        <span>${adminContactEscape(item.members?.name || item.members?.email || "Gebruiker")}</span>
        <span>${adminContactEscape(new Date(item.created_at).toLocaleString("nl-BE"))}</span>
        <span>${adminContactEscape(item.status)}</span>
      </div>

      <div class="admin-review-detail-text">
        ${adminContactEscape(item.review_text).replaceAll("\n", "<br>")}
      </div>

      <footer class="admin-review-detail-actions">
        <button type="button" data-review-status="visible">TOON</button>
        <button type="button" data-review-status="hidden">VERBERG</button>
        <button type="button" class="danger" id="btnDeleteAdminReview">VERWIJDER</button>
      </footer>

      <div id="adminReviewDetailStatus" class="admin-review-status"></div>
    </section>
  `;

  document.body.appendChild(overlay);

  overlay.onclick = event => {
    if (event.target === overlay) closeAdminReviewDetail();
  };

  overlay.querySelector(".admin-review-detail-close").onclick = closeAdminReviewDetail;

  overlay.querySelectorAll("[data-review-status]").forEach(button => {
    button.onclick = () => updateAdminReviewStatus(item.id, button.dataset.reviewStatus);
  });

  overlay.querySelector("#btnDeleteAdminReview").onclick = () => deleteAdminReview(item);
}

async function updateAdminReviewStatus(id, status) {
  const statusEl = document.getElementById("adminReviewDetailStatus");
  if (statusEl) statusEl.textContent = "Opslaan...";

  const { error } = await supabaseClient
    .from("reviews")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    if (statusEl) {
      statusEl.textContent = error.message;
      statusEl.classList.add("error");
    }
    return;
  }

  closeAdminReviewDetail();
  await loadAdminReviews();
  setAdminReviewStatus("Reviewstatus opgeslagen.");
}

async function deleteAdminReview(item) {
  if (!confirm("Deze review verwijderen?")) return;

  const { error } = await supabaseClient
    .from("reviews")
    .delete()
    .eq("id", item.id);

  if (error) {
    const statusEl = document.getElementById("adminReviewDetailStatus");
    if (statusEl) {
      statusEl.textContent = error.message;
      statusEl.classList.add("error");
    }
    return;
  }

  closeAdminReviewDetail();
  await loadAdminReviews();
  setAdminReviewStatus("Review verwijderd.");
}

function setStatValue(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = String(value ?? "-");
}

async function loadAdminStats() {
  const status = document.getElementById("adminStatsStatus");
  if (!status) return;

  status.textContent = "Statistieken laden...";
  status.classList.remove("error");

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const week = new Date(now);
  week.setDate(now.getDate() - 7);

  const [
    membersResult,
    appsResult,
    reviewsResult,
    contactsResult,
    visitsTotalResult,
    visitsTodayResult,
    visitsWeekResult
  ] = await Promise.all([
    supabaseClient.from("members").select("*", { count: "exact", head: true }),
    supabaseClient.from("apps").select("id,name,status,downloads"),
    supabaseClient.from("reviews").select("rating,status"),
    supabaseClient.from("contact_messages").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabaseClient.from("analytics_events").select("*", { count: "exact", head: true }).eq("event_name", "page_view"),
    supabaseClient.from("analytics_events").select("*", { count: "exact", head: true }).eq("event_name", "page_view").gte("created_at", today.toISOString()),
    supabaseClient.from("analytics_events").select("*", { count: "exact", head: true }).eq("event_name", "page_view").gte("created_at", week.toISOString())
  ]);

  const errors = [
    membersResult.error,
    appsResult.error,
    reviewsResult.error,
    contactsResult.error,
    visitsTotalResult.error,
    visitsTodayResult.error,
    visitsWeekResult.error
  ].filter(Boolean);

  if (errors.length) {
    console.error(errors);
    status.textContent = errors[0].message;
    status.classList.add("error");
    return;
  }

  const apps = appsResult.data || [];
  const visibleReviews = (reviewsResult.data || []).filter(item => item.status === "visible");
  const rating = visibleReviews.length
    ? visibleReviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / visibleReviews.length
    : 0;

  setStatValue("statMembers", membersResult.count || 0);
  setStatValue("statApps", apps.length);
  setStatValue("statPending", apps.filter(item => item.status === "pending").length);
  setStatValue("statAccepted", apps.filter(item => item.status === "accepted").length);
  setStatValue("statDownloads", apps.reduce((sum, item) => sum + Number(item.downloads || 0), 0));
  setStatValue("statReviews", visibleReviews.length);
  setStatValue("statRating", visibleReviews.length ? rating.toFixed(1).replace(".", ",") : "-");
  setStatValue("statContacts", contactsResult.count || 0);
  setStatValue("statVisitsToday", visitsTodayResult.count || 0);
  setStatValue("statVisitsWeek", visitsWeekResult.count || 0);
  setStatValue("statVisitsTotal", visitsTotalResult.count || 0);

  const top = [...apps]
    .sort((a, b) => Number(b.downloads || 0) - Number(a.downloads || 0))
    .slice(0, 10);

  const host = document.getElementById("adminTopDownloads");
  if (host) {
    host.innerHTML = top.length
      ? top.map((item, index) => `
          <div class="admin-top-download-row">
            <span>${index + 1}. ${adminContactEscape(item.name)}</span>
            <strong>${Number(item.downloads || 0)}</strong>
          </div>
        `).join("")
      : "Nog geen downloads.";
  }

  status.textContent = "Statistieken bijgewerkt.";
}

window.loadAdminReviews = loadAdminReviews;
window.loadAdminStats = loadAdminStats;
window.closeAdminReviewDetail = closeAdminReviewDetail;

function adminContactTypeLabel(value) {
  const labels = {
    question: "Vraag",
    comment: "Opmerking",
    bug: "Bug",
    suggestion: "Suggestie",
    other: "Anders"
  };

  return labels[value] || value || "-";
}

function adminContactStatusLabel(value) {
  const labels = {
    new: "nieuw",
    read: "gelezen",
    answered: "beantwoord",
    archived: "archief"
  };

  return labels[value] || value || "-";
}

function adminContactEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function setAdminContactStatus(text, isError = false) {
  const status = document.getElementById("adminContactStatus");
  if (!status) return;

  status.textContent = text;
  status.classList.toggle("error", isError);
}

async function loadAdminContactMessages() {
  const body = document.getElementById("adminContactBody");
  const filter = document.getElementById("adminContactStatusFilter");
  if (!body) return;

  body.innerHTML = `<tr><td colspan="5">laden...</td></tr>`;
  setAdminContactStatus("");

  let query = supabaseClient
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(250);

  if (filter?.value) {
    query = query.eq("status", filter.value);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    body.innerHTML = `<tr><td colspan="5">Laden mislukt.</td></tr>`;
    setAdminContactStatus(error.message, true);
    return;
  }

  window.currentContactMessages = data || [];

  if (!data?.length) {
    body.innerHTML = `<tr><td colspan="5">Geen berichten gevonden.</td></tr>`;
    return;
  }

  body.innerHTML = data.map(item => {
    const date = item.created_at
      ? new Date(item.created_at).toLocaleString("nl-BE")
      : "-";

    return `
      <tr data-contact-id="${adminContactEscape(item.id)}">
        <td>
          <span class="admin-contact-badge status-${adminContactEscape(item.status)}">
            ${adminContactEscape(adminContactStatusLabel(item.status))}
          </span>
        </td>
        <td>${adminContactEscape(date)}</td>
        <td>${adminContactEscape(adminContactTypeLabel(item.message_type))}</td>
        <td>${adminContactEscape(item.name)}</td>
        <td>${adminContactEscape(item.subject || "(zonder onderwerp)")}</td>
      </tr>
    `;
  }).join("");

  body.querySelectorAll("tr[data-contact-id]").forEach(row => {
    row.addEventListener("click", () => {
      const item = window.currentContactMessages.find(
        message => String(message.id) === String(row.dataset.contactId)
      );

      if (item) openAdminContactDetail(item);
    });
  });
}

function closeAdminContactDetail() {
  document.getElementById("adminContactDetailOverlay")?.remove();
}

function openAdminContactDetail(item) {
  closeAdminContactDetail();

  const overlay = document.createElement("div");
  overlay.id = "adminContactDetailOverlay";
  overlay.className = "admin-contact-detail-overlay";

  const date = item.created_at
    ? new Date(item.created_at).toLocaleString("nl-BE")
    : "-";

  overlay.innerHTML = `
    <section class="admin-contact-detail">
      <header>
        <div>
          <div class="admin-contact-detail-kicker">
            ${adminContactEscape(adminContactTypeLabel(item.message_type))}
          </div>
          <h3>${adminContactEscape(item.subject || "(zonder onderwerp)")}</h3>
        </div>

        <button type="button" class="admin-contact-detail-close">×</button>
      </header>

      <dl class="admin-contact-meta">
        <div><dt>Naam</dt><dd>${adminContactEscape(item.name)}</dd></div>
        <div>
          <dt>E-mail</dt>
          <dd>
            <a href="mailto:${adminContactEscape(item.email)}">
              ${adminContactEscape(item.email)}
            </a>
          </dd>
        </div>
        <div><dt>Datum</dt><dd>${adminContactEscape(date)}</dd></div>
        <div><dt>Status</dt><dd>${adminContactEscape(adminContactStatusLabel(item.status))}</dd></div>
      </dl>

      <div class="admin-contact-message">
        ${adminContactEscape(item.message).replaceAll("\n", "<br>")}
      </div>

      <footer class="admin-contact-detail-actions">
        <button type="button" data-contact-status="read">GELEZEN</button>
        <button type="button" data-contact-status="answered">BEANTWOORD</button>
        <button type="button" data-contact-status="archived">ARCHIVEER</button>
        <button type="button" class="danger" id="btnDeleteAdminContact">VERWIJDER</button>
      </footer>

      <div id="adminContactDetailStatus" class="admin-contact-status"></div>
    </section>
  `;

  document.body.appendChild(overlay);

  overlay.addEventListener("click", event => {
    if (event.target === overlay) closeAdminContactDetail();
  });

  overlay.querySelector(".admin-contact-detail-close").onclick =
    closeAdminContactDetail;

  overlay.querySelectorAll("[data-contact-status]").forEach(button => {
    button.onclick = () => {
      updateAdminContactStatus(item.id, button.dataset.contactStatus);
    };
  });

  overlay.querySelector("#btnDeleteAdminContact").onclick = () => {
    deleteAdminContactMessage(item);
  };

  if (item.status === "new") {
    updateAdminContactStatus(item.id, "read", false);
  }
}

async function updateAdminContactStatus(id, status, refreshDetail = true) {
  const detailStatus = document.getElementById("adminContactDetailStatus");
  if (detailStatus) detailStatus.textContent = "Opslaan...";

  const { error } = await supabaseClient
    .from("contact_messages")
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    if (detailStatus) {
      detailStatus.textContent = `Opslaan mislukt: ${error.message}`;
      detailStatus.classList.add("error");
    }
    return;
  }

  if (detailStatus) {
    detailStatus.textContent = "Status opgeslagen.";
    detailStatus.classList.remove("error");
  }

  await loadAdminContactMessages();

  if (refreshDetail) {
    const updated = (window.currentContactMessages || [])
      .find(item => String(item.id) === String(id));

    if (updated) openAdminContactDetail(updated);
  }
}

async function deleteAdminContactMessage(item) {
  if (!confirm(`Bericht van "${item.name}" verwijderen?`)) return;

  const { error } = await supabaseClient
    .from("contact_messages")
    .delete()
    .eq("id", item.id);

  if (error) {
    console.error(error);
    const detailStatus = document.getElementById("adminContactDetailStatus");
    if (detailStatus) {
      detailStatus.textContent = `Verwijderen mislukt: ${error.message}`;
      detailStatus.classList.add("error");
    }
    return;
  }

  closeAdminContactDetail();
  await loadAdminContactMessages();
  setAdminContactStatus("Bericht verwijderd.");
}

window.loadAdminContactMessages = loadAdminContactMessages;
window.closeAdminContactDetail = closeAdminContactDetail;

document.addEventListener("keydown", event => {
  if (
    event.key === "Escape" &&
    document.getElementById("adminConfigOverlay")
  ) {
    window.closeAdminConfigCard();
  }
});
