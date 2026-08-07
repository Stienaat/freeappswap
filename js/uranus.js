console.log("uranus module loaded");

window.createUranusBubble = function createUranusBubble() {
  if (document.querySelector('.app-bubble[data-kind="uranus"]')) return;

  const el = document.createElement("div");
  el.className = "app-bubble uranus";
  el.dataset.kind = "uranus";
  el.dataset.motionStatus = "1";
  el.setAttribute("aria-label", "Help en informatie over FreeApps Exchange");
  el.title = "HELP & INFO";

  el.innerHTML = `
    <div class="uranus-label" aria-hidden="true">?</div>
    <section class="uranus-info" aria-hidden="true">
      <button
        class="uranus-close"
        type="button"
        aria-label="Informatie sluiten"
        title="Sluiten"
      >×</button>

      <div class="uranus-scroll" tabindex="0">
        <header class="uranus-header">
          <h2>FREEAPPS EXCHANGE</h2>
          <p class="uranus-kicker">HELP &amp; INFO</p>
        </header>

        <article class="uranus-section">
          <span class="uranus-section-icon">i</span>
          <div>
            <h3>WAT IS FREEAPPS EXCHANGE?</h3>
            <p>
              In een wereld vol abonnementen, kopen en reclame, een uniek gratis platform waar je veilige, nuttige en kwalitatieve apps
              van hobbyontwikkelaars kunt ontdekken, downloaden en uploaden.<br> maak je graag voor de fun  apps en wil je die delen met anderen. Hier moet je zijn.
            </p>
            <p> Uitwisselen is hier het codewoord.</p>
          </div>
        </article>

        <article class="uranus-section">
          <span class="uranus-section-icon">◎</span>
          <div>
            <h3>WAAROM BESTAAT HET?</h3>
            <p>
              Omdat goede gratis software te vaak verborgen blijft. Wij brengen
              ze samen op één overzichtelijke en betrouwbare plek. 
            </p>
          </div>
        </article>

        <article class="uranus-section">
          <span class="uranus-section-icon">●</span>
          <div>
            <h3>VOOR WIE IS HET?</h3>
            <p>
              Voor hobbyontwikkelaars, testers en iedereen die graag eenvoudige,
              eerlijke software maakt of ontdekt.
            </p>
          </div>
        </article>

        <article class="uranus-section">
          <span class="uranus-section-icon">⚙</span>
          <div>
            <h3>HOE WERKT HET?</h3>
            <p>
              Bekijk apps per platform en categorie. Leden kunnen zelf een app
              indienen; na controle wordt die zichtbaar en downloadbaar voor anderen.
            </p>
          </div>
        </article>

        <article class="uranus-section">
          <span class="uranus-section-icon">◆</span>
          <div>
            <h3>WAT MAG WEL EN NIET?</h3>
            <p>
              Alleen legale en veilige software. Geen schadelijke software,
              misleiding, cracks, keygens of ongepaste inhoud.
            </p>
          </div>
        </article>

        <article class="uranus-section">
          <span class="uranus-section-icon">⬆</span>
          <div>
            <h3>UPLOADS &amp; CONTROLE</h3>
            <p>
              Ingediende apps krijgen eerst de status pending. Een beheerder
              controleert de informatie en accepteert of wijzigt de app.
            </p>
          </div>
        </article>

        <article class="uranus-section">
          <span class="uranus-section-icon">▣</span>
          <div>
            <h3>Privacy en cookies</h3>
            <p>
            FreeApps Exchange gebruikt alleen noodzakelijke browseropslag om functies zoals aanmelden en sessiebeheer mogelijk te maken. Er worden momenteel geen advertentie- of trackingcookies gebruikt.

Gegevens die u zelf invoert, zoals accountgegevens, reviews, contactberichten en app-informatie, worden opgeslagen in Supabase en alleen gebruikt voor de werking en het beheer van FreeApps Exchange.

Wachtwoorden worden niet door FreeApps Exchange opgeslagen of zichtbaar gemaakt; de aanmelding verloopt via Supabase Authentication
            </p>
          </div>
        </article>

        <article class="uranus-section">
          <span class="uranus-section-icon">✉</span>
          <div>
            <h3>CONTACT</h3>
            <p>
              Vragen, suggesties of meldingen? Neem contact op. We helpen je
              graag verder.
              En bedenk ook: gratis is nooit helemaal gratis. Een kleine gift wordt altijd in dank afgenomen, maar blijft volledig vrij. 
              
            </p>
          </div>
        </article>

        <footer class="uranus-footer">
          Veel plezier en ontdek geweldige apps!
        </footer>
      </div>
    </section>
  `;

  preparePlanetBubble(
    el,
    randomBetween(12, 26),
    randomBetween(35, 62),
    "128px"
  );

  const info = el.querySelector(".uranus-info");
  const closeButton = el.querySelector(".uranus-close");
  const scrollPanel = el.querySelector(".uranus-scroll");

  function openUranusInfo() {
    if (el.classList.contains("info-open")) return;

    window.PlanetManager?.activate("uranus");
    el.classList.add("info-open");
    el.dataset.motionStatus = "3";
    info.setAttribute("aria-hidden", "false");
    document.body.classList.add("uranus-info-active");
    el.title = "";

    requestAnimationFrame(() => {
      scrollPanel.scrollTop = 0;
      scrollPanel.focus({ preventScroll: true });
    });
  }

  function closeUranusInfo() {
    if (!el.classList.contains("info-open")) return;

    el.classList.remove("info-open");
    el.dataset.motionStatus = "1";
    info.setAttribute("aria-hidden", "true");
    document.body.classList.remove("uranus-info-active");
    el.title = "HELP & INFO";
  }

  el.addEventListener("click", (event) => {
    if (event.target.closest(".uranus-close")) return;
    if (!el.classList.contains("info-open")) openUranusInfo();
  });

  closeButton.addEventListener("click", (event) => {
    event.stopPropagation();
    closeUranusInfo();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && el.classList.contains("info-open")) {
      closeUranusInfo();
    }
  });

  window.openUranusInfo = openUranusInfo;
  window.closeUranusInfo = closeUranusInfo;
  window.PlanetManager?.register("uranus", closeUranusInfo);
};
