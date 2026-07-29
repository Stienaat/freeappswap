console.log("uranus module loaded");

window.createUranusBubble = function createUranusBubble() {
  if (document.querySelector('.app-bubble[data-kind="uranus"]')) return;

  const el = document.createElement("div");
  el.className = "app-bubble uranus";
  el.dataset.kind = "uranus";
  el.dataset.motionStatus = "1";
  el.dataset.passive = "true";
  el.setAttribute("aria-label", "Info - binnenkort beschikbaar");
  el.title = "Info - binnenkort beschikbaar";

  preparePlanetBubble(
    el,
    randomBetween(12, 26),
    randomBetween(35, 62),
    "128px"
  );
};
