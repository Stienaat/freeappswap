console.log("juno module loaded");

window.createJunoBubble = function createJunoBubble() {
  if (document.querySelector('.app-bubble[data-kind="juno"]')) return;

  const el = document.createElement("div");
  el.className = "app-bubble juno";
  el.dataset.kind = "juno";
  el.dataset.motionStatus = "1";
  el.dataset.passive = "true";
  el.setAttribute("aria-label", "Steun FreeApps Exchange");
  el.title = "Steun FreeApps Exchange";

  preparePlanetBubble(
    el,
    randomBetween(76, 89),
    randomBetween(28, 54),
    "32px"
  );

  el.addEventListener("click", event => {
    event.stopPropagation();
    openJunoCard();
  });
};

const DEFAULT_JUNO_CONFIG = {
  enabled: true,
  beneficiary: "",
  iban: "",
  bic: "",
  payment_reference: "",
  max_amount: 10,
  message:
    "FreeApps Exchange blijft gratis, zonder advertenties en zonder abonnementen. Kosten zijn er helaas altijd. Een kleine vrijwillige bijdrage helpt om dit universum in leven te houden."
};

window.FREEAPPS_CONFIG = window.FREEAPPS_CONFIG || {};

async function loadJunoConfig(forceReload = false) {
  if (!forceReload && window.FREEAPPS_CONFIG.juno) {
    return window.FREEAPPS_CONFIG.juno;
  }

  try {
    const { data, error } = await supabaseClient
      .from("site_config")
      .select("value")
      .eq("key", "juno")
      .maybeSingle();

    if (error) throw error;

    window.FREEAPPS_CONFIG.juno = {
      ...DEFAULT_JUNO_CONFIG,
      ...(data?.value || {})
    };
  } catch (error) {
    console.warn("Juno-configuratie kon niet worden geladen:", error);
    window.FREEAPPS_CONFIG.juno = { ...DEFAULT_JUNO_CONFIG };
  }

  return window.FREEAPPS_CONFIG.juno;
}

function getJunoConfig() {
  return {
    ...DEFAULT_JUNO_CONFIG,
    ...(window.FREEAPPS_CONFIG.juno || {})
  };
}

function getJunoQrSource() {
  return String(getJunoConfig().qr_url || "").trim();
}

function getJunoMaxAmount() {
  const configured = Number(getJunoConfig().max_amount);

  if (!Number.isFinite(configured) || configured <= 0) return 10;
  return Math.min(configured, 10);
}

function escapeJunoHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function normalizeJunoAmount(value) {
  const number = Number(String(value || "").replace(",", "."));
  return Number.isFinite(number) ? number : 0;
}

function setJunoStatus(text, isError = false) {
  const status = document.getElementById("junoCardStatus");
  if (!status) return;

  status.textContent = text;
  status.classList.toggle("error", isError);
}

function normalizeEpcIban(value) {
  return String(value || "").replace(/\s+/g, "").toUpperCase();
}

function normalizeEpcBic(value) {
  return String(value || "").replace(/\s+/g, "").toUpperCase();
}

function buildEpcPayload(config, amount) {
  const beneficiary = String(config.beneficiary || "").trim().slice(0, 70);
  const iban = normalizeEpcIban(config.iban);
  const bic = normalizeEpcBic(config.bic);
  const remittance = String(config.payment_reference || "").trim().slice(0, 140);
  const amountLine = `EUR${Number(amount).toFixed(2)}`;

  // EPC069-12 v3.1, version 002, UTF-8:
  // BCD / version / charset / SCT / BIC / name / IBAN /
  // amount / purpose / structured reference / unstructured text.
  return [
    "BCD",
    "002",
    "1",
    "SCT",
    bic,
    beneficiary,
    iban,
    amountLine,
    "",
    "",
    remittance
  ].join("\n");
}

function renderJunoQr(amount = null) {
  const qrHost = document.getElementById("junoQrHost");
  if (!qrHost) return;

  const config = getJunoConfig();

  if (!config.beneficiary || !config.iban) {
    qrHost.innerHTML = `
      <div class="juno-card-qr-placeholder">
        <strong>QR</strong>
        <span>Betaalgegevens ontbreken in Venus Config</span>
      </div>
    `;
    return;
  }

  if (!amount || amount <= 0) {
    qrHost.innerHTML = `
      <div class="juno-card-qr-placeholder">
        <strong>€</strong>
        <span>Vul eerst een bedrag in en druk op BEVESTIG</span>
      </div>
    `;
    return;
  }

  if (typeof window.qrcode !== "function") {
    qrHost.innerHTML = `
      <div class="juno-card-qr-placeholder">
        <strong>!</strong>
        <span>QR-module is niet geladen</span>
      </div>
    `;
    return;
  }

  try {
    const payload = buildEpcPayload(config, amount);
    const code = window.qrcode(0, "M");
    code.addData(payload, "Byte");
    code.make();

    qrHost.innerHTML = code.createSvgTag({
      cellSize: 5,
      margin: 4,
      scalable: true
    });

    const svg = qrHost.querySelector("svg");
    if (svg) {
      svg.classList.add("juno-card-qr-svg");
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", "SEPA QR-code voor vrijwillige bijdrage");
    }
  } catch (error) {
    console.error("QR genereren mislukt:", error);
    qrHost.innerHTML = `
      <div class="juno-card-qr-placeholder">
        <strong>!</strong>
        <span>QR genereren mislukt</span>
      </div>
    `;
  }
}

function validateJunoAmount() {
  const input = document.getElementById("junoAmount");
  if (!input) return false;

  const maxAmount = getJunoMaxAmount();
  const amount = normalizeJunoAmount(input.value);

  if (!input.value.trim()) {
    setJunoStatus("Vul zelf een bedrag in.", true);
    return false;
  }

  if (amount <= 0) {
    setJunoStatus("Het bedrag moet groter zijn dan €0.", true);
    return false;
  }

  if (amount > maxAmount) {
    input.value = maxAmount.toFixed(2).replace(".", ",");
    setJunoStatus(`Maximum €${maxAmount}.`, true);
    return false;
  }

  input.value = amount.toFixed(2).replace(".", ",");
  renderJunoQr(amount);
  setJunoStatus(`QR aangemaakt voor €${input.value}`);
  return true;
}

async function openJunoCard() {
  closeJunoCard();

  window.PlanetManager?.activate("juno");

  const config = await loadJunoConfig();
  if (config.enabled === false) return;

  const maxAmount = getJunoMaxAmount();
  const overlay = document.createElement("div");
  overlay.id = "junoCardOverlay";
  overlay.className = "juno-card-overlay";

  overlay.innerHTML = `
    <section
      class="juno-card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="junoCardTitle"
    >
      <button
        type="button"
        class="juno-card-close"
        aria-label="Sluiten"
        title="Sluiten"
      >×</button>

      <img
        class="juno-card-mascot"
        src="assets/images/juno-donate.png"
        alt=""
        aria-hidden="true"
      >

      <header class="juno-card-header">
        <h2 id="junoCardTitle">JUNO</h2>
        <p>elke steun helpt</p>
      </header>

      <p class="juno-card-copy">
        ${escapeJunoHtml(config.message || DEFAULT_JUNO_CONFIG.message)}
      </p>

      <div class="juno-card-divider"></div>

      <div class="juno-card-amount-actions">
        <div class="juno-card-amount-row">
          <span>€</span>
          <input
            id="junoAmount"
            type="number"
            min="0.01"
            max="${maxAmount}"
            step="0.01"
            inputmode="decimal"
            placeholder="max. €10"
          >
        </div>

        <button type="button" id="btnJunoConfirm" class="juno-card-confirm">
          BEVESTIG
        </button>
      </div>

      <div id="junoCardStatus" class="juno-card-status"></div>

      <div class="juno-card-payment">
        <div id="junoQrHost" class="juno-card-qr"></div>

        <p>
          Gebruik enkel je<br>
          bank-app<br>
          om te betalen
          ${config.beneficiary ? `<small>Begunstigde:<br><strong>${escapeJunoHtml(config.beneficiary)}</strong></small>` : ""}
          ${config.payment_reference ? `<small>Mededeling:<br><strong>${escapeJunoHtml(config.payment_reference)}</strong></small>` : ""}
        </p>
      </div>

      <footer class="juno-card-footer">
        <strong>BEDANKT!</strong>
        <span>jij maakt het verschil</span>
        <b>♥</b>
      </footer>
    </section>
  `;

  document.body.appendChild(overlay);
  document.body.classList.add("juno-card-open");

  renderJunoQr(null);

  const input = overlay.querySelector("#junoAmount");
  const closeButton = overlay.querySelector(".juno-card-close");
  const confirmButton = overlay.querySelector("#btnJunoConfirm");

  overlay.addEventListener("click", event => {
    if (event.target === overlay) closeJunoCard();
  });

  closeButton.addEventListener("click", event => {
    event.stopPropagation();
    closeJunoCard();
  });

  confirmButton.addEventListener("click", validateJunoAmount);

  input.addEventListener("input", () => {
    const amount = normalizeJunoAmount(input.value);
    if (amount > maxAmount) {
      input.value = String(maxAmount);
      setJunoStatus(`Maximum €${maxAmount}.`, true);
    } else {
      setJunoStatus("");
      renderJunoQr(null);
    }
  });

  input.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      validateJunoAmount();
    }
  });

  requestAnimationFrame(() => {
    overlay.classList.add("show");
    input.focus({ preventScroll: true });
  });
}

function closeJunoCard() {
  const overlay = document.getElementById("junoCardOverlay");
  if (!overlay) return;

  overlay.classList.remove("show");
  document.body.classList.remove("juno-card-open");

  setTimeout(() => overlay.remove(), 220);
}

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && document.getElementById("junoCardOverlay")) {
    closeJunoCard();
  }
});

window.openJunoCard = openJunoCard;
window.closeJunoCard = closeJunoCard;

window.PlanetManager?.register("juno", closeJunoCard);
