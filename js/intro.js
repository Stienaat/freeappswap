function createIntroStars() {
  const layer = document.getElementById("introStars");
  if (!layer) return;

  layer.innerHTML = "";

  for (let i = 0; i < 260; i++) {
    const star = document.createElement("span");
    star.className = "intro-star";
    star.style.setProperty("--x", `${Math.random() * 100}%`);
    star.style.setProperty("--y", `${Math.random() * 100}%`);
    star.style.setProperty("--s", `${Math.random() * 2.4 + 0.6}px`);
    star.style.setProperty("--o", `${Math.random() * 0.75 + 0.25}`);
    layer.appendChild(star);
  }
}

window.startIntro = async function startIntro() {
  createIntroStars();

  const intro = document.getElementById("introBirth");

 // Figuranten meteen aanmaken.
  window.createUranusBubble?.();
 setTimeout(() => {
  window.createJunoBubble?.();
}, 0);

  await sleep(4300);

  intro?.classList.add("run");

  await sleep(4300);

  intro?.classList.add("run");

 setTimeout(() => {
  document.querySelector(".intro-title")?.classList.add("show");
}, 2200);

setTimeout(() => {
  document.querySelector(".intro-text-top")?.classList.add("show");
}, 3200);

setTimeout(() => {
  document.querySelector(".intro-text-bottom")?.classList.add("show");
}, 4200);

setTimeout(() => {
  document.querySelector(".intro-title")?.classList.add("hide");
  document.querySelector(".intro-text-top")?.classList.add("hide");
  document.querySelector(".intro-text-bottom")?.classList.add("hide");
}, 6500);
setTimeout(async () => {
  await sleep(5450);
  openAccountMoon();
}, 1000);
};