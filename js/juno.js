console.log("juno module loaded");

window.createJunoBubble = function createJunoBubble() {
  if (document.querySelector('.app-bubble[data-kind="juno"]')) return;

  const el = document.createElement("div");
  el.className = "app-bubble juno";
  el.dataset.kind = "juno";
  el.dataset.motionStatus = "1";
  el.dataset.passive = "true";
  el.setAttribute("aria-label", "Steun FreeApps Exchange - binnenkort beschikbaar");
  el.title = "Steun FreeApps Exchange - binnenkort beschikbaar";

  preparePlanetBubble(
    el,
    randomBetween(76, 89),
    randomBetween(28, 54),
    "72px"
  );
};
