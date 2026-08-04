console.log("admin knowledge base module loaded");

const KNOWLEDGE_SECTIONS = [
  ["welcome", "Welkom"],
  ["philosophy", "Filosofie"],
  ["daily-management", "Dagelijks beheer"],
  ["git-github", "Git & GitHub"],
  ["render", "Render"],
  ["supabase", "Supabase"],
  ["brevo", "Brevo"],
  ["domain", "Domein"],
  ["database", "Database"],
  ["release", "Nieuwe release"],
  ["app-review", "Apps beoordelen"],
  ["reviews", "Reviews"],
  ["contact", "Contact (Mercurius)"],
  ["donations", "Donaties (Juno)"],
  ["statistics", "Statistieken"],
  ["backups", "Back-ups en herstel"],
  ["security", "Beveiliging"],
  ["problems", "Veel voorkomende problemen"],
  ["decisions", "Beslissingslogboek"],
  ["roadmap", "Roadmap"]
];

let knowledgeCache = [];
let selectedKnowledgeSlug = "welcome";
let knowledgeObserver = null;

function kbEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function kbFormatText(value) {
  return kbEscape(value).replaceAll("\n", "<br>");
}

function kbSetStatus(text, isError = false) {
  const status = document.getElementById("knowledgeStatus");
  if (!status) return;

  status.textContent = text;
  status.classList.toggle("error", isError);
}

function kbFindSection(slug) {
  return knowledgeCache.find(section => section.slug === slug) || null;
}

async function kbLoadSections(force = false) {
  if (knowledgeCache.length && !force) return knowledgeCache;

  const { data, error } = await supabaseClient
    .from("admin_knowledge")
    .select("slug, title, summary, content, sort_order, updated_at")
    .order("sort_order", { ascending: true });

  if (error) throw error;

  knowledgeCache = data || [];
  return knowledgeCache;
}

function kbRenderNavigation() {
  const nav = document.getElementById("knowledgeNavigation");
  if (!nav) return;

  nav.innerHTML = KNOWLEDGE_SECTIONS.map(([slug, fallbackTitle]) => {
    const section = kbFindSection(slug);
    const title = section?.title || fallbackTitle;

    return `
      <button
        type="button"
        class="knowledge-nav-item${slug === selectedKnowledgeSlug ? " active" : ""}"
        data-knowledge-slug="${kbEscape(slug)}"
      >
        ${kbEscape(title)}
      </button>
    `;
  }).join("");

  nav.querySelectorAll("[data-knowledge-slug]").forEach(button => {
    button.addEventListener("click", () => {
      selectedKnowledgeSlug = button.dataset.knowledgeSlug;
      kbRenderNavigation();
      kbRenderSection();
    });
  });
}

function kbRenderSection() {
  const host = document.getElementById("knowledgeContent");
  if (!host) return;

  const section = kbFindSection(selectedKnowledgeSlug);
  const fallback = KNOWLEDGE_SECTIONS.find(([slug]) => slug === selectedKnowledgeSlug);
  const fallbackTitle = fallback?.[1] || "Kennisbank";

  if (!section) {
    host.innerHTML = `
      <article class="knowledge-article">
        <h2>${kbEscape(fallbackTitle)}</h2>
        <p>Dit hoofdstuk is nog niet aangemaakt.</p>
      </article>
    `;
    return;
  }

  host.innerHTML = `
    <article class="knowledge-article">
      <div class="knowledge-article-head">
        <div>
          <div class="knowledge-article-kicker">BEHEERDERSHANDBOEK</div>
          <h2>${kbEscape(section.title)}</h2>
        </div>

        <button type="button" id="btnEditKnowledgeSection">
          BEWERKEN
        </button>
      </div>

      ${section.summary ? `
        <p class="knowledge-summary">${kbFormatText(section.summary)}</p>
      ` : ""}

      <div class="knowledge-text">
        ${kbFormatText(section.content || "Nog uit te werken.")}
      </div>

      <small class="knowledge-updated">
        Laatst bijgewerkt:
        ${section.updated_at
          ? new Date(section.updated_at).toLocaleString("nl-BE")
          : "onbekend"}
      </small>
    </article>
  `;

  host.querySelector("#btnEditKnowledgeSection")?.addEventListener(
    "click",
    () => kbOpenEditor(section)
  );
}

function kbOpenEditor(section) {
  document.getElementById("knowledgeEditorOverlay")?.remove();

  const overlay = document.createElement("div");
  overlay.id = "knowledgeEditorOverlay";
  overlay.className = "knowledge-editor-overlay";

  overlay.innerHTML = `
    <section class="knowledge-editor">
      <header>
        <div>
          <div class="knowledge-editor-kicker">KENNISBANK</div>
          <h3>${kbEscape(section.title)}</h3>
        </div>
        <button type="button" class="knowledge-editor-close">×</button>
      </header>

      <form id="knowledgeEditorForm">
        <label>Titel
          <input name="title" maxlength="120" value="${kbEscape(section.title)}">
        </label>

        <label>Korte samenvatting
          <textarea name="summary" rows="3" maxlength="600">${kbEscape(section.summary || "")}</textarea>
        </label>

        <label>Inhoud
          <textarea name="content" rows="18">${kbEscape(section.content || "")}</textarea>
        </label>

        <div id="knowledgeEditorStatus" class="knowledge-editor-status"></div>

        <footer>
          <button type="button" class="knowledge-editor-cancel">ANNULEREN</button>
          <button type="submit" class="primary">OPSLAAN</button>
        </footer>
      </form>
    </section>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();

  overlay.addEventListener("click", event => {
    if (event.target === overlay) close();
  });

  overlay.querySelector(".knowledge-editor-close").onclick = close;
  overlay.querySelector(".knowledge-editor-cancel").onclick = close;

  overlay.querySelector("#knowledgeEditorForm").onsubmit = async event => {
    event.preventDefault();

    const form = event.currentTarget;
    const status = form.querySelector("#knowledgeEditorStatus");
    const submit = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);

    submit.disabled = true;
    status.textContent = "Opslaan...";
    status.classList.remove("error");

    const { data: authData } = await supabaseClient.auth.getUser();

    const { error } = await supabaseClient
      .from("admin_knowledge")
      .update({
        title: String(formData.get("title") || "").trim(),
        summary: String(formData.get("summary") || "").trim(),
        content: String(formData.get("content") || "").trim(),
        updated_at: new Date().toISOString(),
        updated_by: authData?.user?.id || null
      })
      .eq("slug", section.slug);

    submit.disabled = false;

    if (error) {
      console.error(error);
      status.textContent = `Opslaan mislukt: ${error.message}`;
      status.classList.add("error");
      return;
    }

    await kbLoadSections(true);
    kbRenderNavigation();
    kbRenderSection();
    close();
  };
}

async function kbOpenPage() {
  kbSetStatus("Kennisbank laden...");

  try {
    await kbLoadSections();
    kbRenderNavigation();
    kbRenderSection();
    kbSetStatus("");
  } catch (error) {
    console.error(error);
    kbSetStatus(
      `Laden mislukt: ${error.message}. Voer eerst admin_knowledge.sql uit.`,
      true
    );
  }
}

function kbInjectTab() {
  const overlay = document.getElementById("adminConfigOverlay");
  if (!overlay) return;

  const tabs = overlay.querySelector(".admin-config-tabs");
  const body = overlay.querySelector(".admin-config-body");

  if (!tabs || !body || tabs.querySelector('[data-tab="knowledge"]')) return;

  const tab = document.createElement("button");
  tab.type = "button";
  tab.className = "admin-config-tab";
  tab.dataset.tab = "knowledge";
  tab.textContent = "KENNISBANK";
  tabs.appendChild(tab);

  const page = document.createElement("section");
  page.className = "admin-config-page";
  page.dataset.page = "knowledge";
  page.innerHTML = `
    <div class="knowledge-layout">
      <aside id="knowledgeNavigation" class="knowledge-navigation"></aside>

      <main id="knowledgeContent" class="knowledge-content">
        <article class="knowledge-article">
          <h2>Kennisbank</h2>
          <p>Laden...</p>
        </article>
      </main>
    </div>

    <div id="knowledgeStatus" class="knowledge-status"></div>
  `;

  body.appendChild(page);

  tab.addEventListener("click", () => {
    overlay.querySelectorAll(".admin-config-tab").forEach(button => {
      button.classList.toggle("active", button === tab);
    });

    overlay.querySelectorAll(".admin-config-page").forEach(configPage => {
      configPage.classList.toggle("active", configPage === page);
    });

    kbOpenPage();
  });
}

function kbWatchConfig() {
  knowledgeObserver = new MutationObserver(() => kbInjectTab());

  knowledgeObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  kbInjectTab();
}

document.addEventListener("keydown", event => {
  if (
    event.key === "Escape" &&
    document.getElementById("knowledgeEditorOverlay")
  ) {
    document.getElementById("knowledgeEditorOverlay")?.remove();
  }
});

kbWatchConfig();
