console.log("mercury module loaded");

const MERCURY_TYPES = {
  question: "Vraag",
  comment: "Opmerking",
  bug: "Bugmelding",
  suggestion: "Suggestie",
  other: "Anders"
};

window.createMercuryBubble = function createMercuryBubble() {
  if (document.querySelector('.app-bubble[data-kind="mercury"]')) return;
  if (typeof preparePlanetBubble !== "function") return;

  const el = document.createElement("div");
  el.className = "app-bubble mercury";
  el.dataset.kind = "mercury";
  el.dataset.motionStatus = "1";
  el.dataset.passive = "true";
  el.setAttribute("aria-label", "Contact");
  el.title = "Contact";

  el.innerHTML = `
    <div class="mercury-label" aria-hidden="true">CONTACT</div>
  `;

  preparePlanetBubble(
    el,
    randomBetween(7, 20),
    randomBetween(66, 86),
    "70px"
  );

  el.addEventListener("click", event => {
    event.stopPropagation();
    openMercuryCard();
  });
};

async function getMercuryUserDefaults() {
  const defaults = {
    userId: null,
    name: "",
    email: ""
  };

  try {
    const { data: authData } = await supabaseClient.auth.getUser();
    const user = authData?.user;

    if (!user) return defaults;

    defaults.userId = user.id;
    defaults.email = user.email || "";

    const { data: member } = await supabaseClient
      .from("members")
      .select("name, email")
      .eq("id", user.id)
      .maybeSingle();

    defaults.name = member?.name || "";
    defaults.email = member?.email || defaults.email;
  } catch (error) {
    console.warn("Contactgegevens konden niet vooraf ingevuld worden:", error);
  }

  return defaults;
}

function escapeMercuryHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function setMercuryStatus(text, isError = false) {
  const status = document.getElementById("mercuryStatus");
  if (!status) return;

  status.textContent = text;
  status.classList.toggle("error", isError);
}

function isValidMercuryEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

window.openMercuryCard = async function openMercuryCard() {
  window.closeMercuryCard();
  window.PlanetManager?.activate("mercury");

  const defaults = await getMercuryUserDefaults();

  const overlay = document.createElement("div");
  overlay.id = "mercuryCardOverlay";
  overlay.className = "mercury-card-overlay";

  overlay.innerHTML = `
    <section
      class="mercury-card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mercuryCardTitle"
    >
      <header class="mercury-card-header">
        <div>
          <div class="mercury-card-kicker">FREEAPPS EXCHANGE</div>
          <h2 id="mercuryCardTitle">CONTACT</h2>
        </div>

        <button
          type="button"
          class="mercury-card-close"
          aria-label="Sluiten"
          title="Sluiten"
        >×</button>
      </header>

      <p class="mercury-card-intro">
        Heb je een vraag, een idee, een opmerking of een bug gevonden?
        Laat hier gerust een bericht achter.
      </p>

      <form id="mercuryContactForm" autocomplete="on">
        <input name="user_id" type="hidden" value="${escapeMercuryHtml(defaults.userId || "")}">

        <div class="mercury-form-grid">
          <label>Naam *
            <input
              name="name"
              maxlength="120"
              value="${escapeMercuryHtml(defaults.name)}"
              required
            >
          </label>

          <label>E-mail *
            <input
              name="email"
              type="email"
              maxlength="180"
              value="${escapeMercuryHtml(defaults.email)}"
              required
            >
          </label>

          <label>Type bericht
            <select name="message_type">
              <option value="question">Vraag</option>
              <option value="comment">Opmerking</option>
              <option value="bug">Bugmelding</option>
              <option value="suggestion">Suggestie</option>
              <option value="other">Anders</option>
            </select>
          </label>

          <label>Onderwerp
            <input name="subject" maxlength="180">
          </label>

          <label class="mercury-form-wide">Bericht *
            <textarea
              name="message"
              rows="8"
              maxlength="4000"
              required
            ></textarea>
          </label>
        </div>

        <div id="mercuryStatus" class="mercury-status"></div>

        <footer class="mercury-card-actions">
          <button type="submit" class="mercury-send">VERZENDEN</button>
        </footer>
      </form>
    </section>
  `;

  document.body.appendChild(overlay);
  document.body.classList.add("mercury-card-open");

  overlay.addEventListener("click", event => {
    if (event.target === overlay) window.closeMercuryCard();
  });

  overlay.querySelector(".mercury-card-close").onclick = event => {
    event.stopPropagation();
    window.closeMercuryCard();
  };

  overlay.querySelector("#mercuryContactForm").onsubmit = submitMercuryMessage;

  requestAnimationFrame(() => {
    overlay.classList.add("show");

    const firstEmpty =
      overlay.querySelector('[name="name"]:not([value]), [name="message"]');

    firstEmpty?.focus({ preventScroll: true });
  });
};

async function submitMercuryMessage(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const submitButton = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);

  const record = {
    user_id: String(formData.get("user_id") || "").trim() || null,
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim().toLowerCase(),
    message_type: String(formData.get("message_type") || "question").trim(),
    subject: String(formData.get("subject") || "").trim() || null,
    message: String(formData.get("message") || "").trim(),
    status: "new",
    updated_at: new Date().toISOString()
  };

  if (!record.name) {
    setMercuryStatus("Naam is verplicht.", true);
    return;
  }

  if (!isValidMercuryEmail(record.email)) {
    setMercuryStatus("Vul een geldig e-mailadres in.", true);
    return;
  }

  if (!record.message) {
    setMercuryStatus("Schrijf eerst een bericht.", true);
    return;
  }

  submitButton.disabled = true;
  setMercuryStatus("Bericht verzenden...");

  const { error } = await supabaseClient
    .from("contact_messages")
    .insert(record);

  submitButton.disabled = false;

  if (error) {
    console.error(error);
    setMercuryStatus(`Verzenden mislukt: ${error.message}`, true);
    return;
  }

  form.reset();
  setMercuryStatus("Bedankt. Je bericht werd ontvangen.");

  setTimeout(() => {
    window.closeMercuryCard();
  }, 1800);
}

window.closeMercuryCard = function closeMercuryCard() {
  const overlay = document.getElementById("mercuryCardOverlay");
  if (!overlay) return;

  overlay.classList.remove("show");
  document.body.classList.remove("mercury-card-open");

  setTimeout(() => overlay.remove(), 220);
};

document.addEventListener("keydown", event => {
  if (
    event.key === "Escape" &&
    document.getElementById("mercuryCardOverlay")
  ) {
    window.closeMercuryCard();
  }
});

window.PlanetManager?.register("mercury", window.closeMercuryCard);

(function initializeMercury(attempt = 0) {
  if (
    typeof preparePlanetBubble === "function" &&
    document.querySelector(".space")
  ) {
    window.createMercuryBubble();
    return;
  }

  if (attempt < 80) {
    setTimeout(() => initializeMercury(attempt + 1), 250);
  }
})();
