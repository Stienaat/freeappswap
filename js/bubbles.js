window.FreeAppSwapBubbles = (() => {
  const states = {
    home: {
      closed: { x: 50, y: 50, size: "min(100vh, 100vw)", scale: 0.02, z: 0, opacity: 0, dx: 0, dy: 0, pad: "0px" },
      active: { x: 50, y: 50, size: "min(100vh, 100vw)", scale: 1, z: 0, opacity: 1, dx: 0, dy: 0, pad: "0px" },
      background: { x: 50, y: 50, size: "min(100vh, 100vw)", scale: .92, z: -180, opacity: .85, dx: 0, dy: 0, pad: "0px" }
    },
    search: {
      hidden: { x: 8, y: 23, size: "70px", scale: .08, z: 650, opacity: 0, dx: 0, dy: 0, pad: "9px" },
      idle: { x: 8, y: 23, size: "70px", scale: 1, z: 800, opacity: .96, dx: 0, dy: 0, pad: "9px" },
      active: { x: 22, y: 34, size: "min(42vw, 42vh)", scale: 1, z: 1100, opacity: .98, dx: 0, dy: 0, pad: "clamp(18px, 4vw, 46px)" },
      background: { x: 8, y: 23, size: "70px", scale: .88, z: 650, opacity: .88, dx: 0, dy: 0, pad: "9px" }
    },
    account: {
      hidden: { x: 62, y: 47, size: "min(20vw, 20vh)", scale: .04, z: 820, opacity: 0, dx: 0, dy: 0, pad: "clamp(10px, 2vw, 22px)" },
      idle: { x: 62, y: 47, size: "min(20vw, 20vh)", scale: 1, z: 900, opacity: .96, dx: 0, dy: 0, pad: "clamp(10px, 2vw, 22px)" },
      active: { x: 56, y: 48, size: "280px", scale: 1, z: 1200, opacity: 1, dx: 0, dy: 0, pad: "clamp(18px, 4vw, 42px)" },
      background: { x: 84, y: 18, size: "min(12vw, 12vh)", scale: .55, z: -260, opacity: .68, dx: 0, dy: 0, pad: "10px" }
    },
    download: {
      idle: { x: 32, y: 70, size: "min(20vw, 20vh)", scale: 1, z: 680, opacity: .92, dx: -8, dy: 4, pad: "clamp(12px, 2.2vw, 26px)" },
      active: { x: 36, y: 56, size: "min(39vw, 39vh)", scale: 1, z: 1200, opacity: .98, dx: 0, dy: 0, pad: "clamp(22px, 4vw, 50px)" },
      background: { x: 28, y: 78, size: "min(15vw, 15vh)", scale: .72, z: -80, opacity: .74, dx: -12, dy: 8, pad: "14px" },
      hidden: { x: 50, y: 50, size: "100px", scale: .02, z: -300, opacity: 0, dx: 0, dy: 0, pad: "12px" }
    },
    upload: {
      idle: { x: 72, y: 72, size: "min(20vw, 20vh)", scale: 1, z: 680, opacity: .92, dx: 8, dy: 5, pad: "clamp(12px, 2.2vw, 26px)" },
      active: { x: 68, y: 56, size: "min(39vw, 39vh)", scale: 1, z: 1200, opacity: .98, dx: 0, dy: 0, pad: "clamp(22px, 4vw, 50px)" },
      background: { x: 76, y: 79, size: "min(15vw, 15vh)", scale: .72, z: -80, opacity: .74, dx: 12, dy: 8, pad: "14px" },
      hidden: { x: 50, y: 50, size: "100px", scale: .02, z: -300, opacity: 0, dx: 0, dy: 0, pad: "12px" }
    }
  };

  const visibleAfterLogin = new Set(["home", "search", "account", "download", "upload"]);

  function el(id) { return document.getElementById(`${id}Bubble`); }

  function applyState(id, stateName, time = "3600ms") {
    const node = el(id);
    if (!node) return;
    const state = states[id][stateName];
    if (!state) return;

    node.classList.toggle("hidden", stateName === "hidden");
    node.style.setProperty("--time", time);
    node.style.setProperty("--x", `${state.x}%`);
    node.style.setProperty("--y", `${state.y}%`);
    node.style.setProperty("--size", state.size);
    node.style.setProperty("--scale", state.scale);
    node.style.setProperty("--z", `${state.z}px`);
    node.style.setProperty("--dx", `${state.dx}px`);
    node.style.setProperty("--dy", `${state.dy}px`);
    node.style.setProperty("--opacity", state.opacity);
    node.style.setProperty("--pad", state.pad);
    node.style.setProperty("--pointer", state.opacity > .25 ? "auto" : "none");
    node.style.zIndex = Math.round(state.z + 3000);
  }

  function focus(id, isLoggedIn = false) {
    const all = ["home", "search", "account", "download", "upload"];
    for (const name of all) {
      if (!isLoggedIn && (name === "download" || name === "upload")) {
        applyState(name, "hidden", "3200ms");
        continue;
      }
      if (name === id) applyState(name, "active", "4200ms");
      else if (name === "home") applyState(name, "background", "4600ms");
      else applyState(name, isLoggedIn && visibleAfterLogin.has(name) ? "background" : "idle", "4000ms");
    }
  }

  function showLoggedInUniverse() {
    applyState("home", "background", "5200ms");
    applyState("account", "background", "5200ms");
    applyState("search", "idle", "4200ms");
    applyState("download", "idle", "6200ms");
    applyState("upload", "idle", "6200ms");
  }

  function initClosed() {
    applyState("home", "closed", "10ms");
    applyState("search", "hidden", "10ms");
    applyState("account", "hidden", "10ms");
    applyState("download", "hidden", "10ms");
    applyState("upload", "hidden", "10ms");
  }

  function showHome() {
    applyState("home", "active", "5600ms");
  }

  function showStartBubbles() {
    applyState("search", "idle", "4200ms");
    applyState("account", "active", "4600ms");
    applyState("download", "hidden", "10ms");
    applyState("upload", "hidden", "10ms");
  }

  return { initClosed, showHome, showStartBubbles, focus, showLoggedInUniverse, applyState };
})();
account: {
  idle: {
    x: 62, y: 47,
    size: "280px",
    scale: .62,
    z: 900,
    opacity: .96,
    dx: 0, dy: 0,
    pad: "18px"
  },

  active: {
    x: 62, y: 52,
    size: "280px",
    scale: 1,
    z: 2000,
    opacity: 1,
    dx: 0, dy: 0,
    pad: "18px"
  },

  background: {
    x: 62, y: 52,
    size: "280px",
    scale: .22,
    z: -260,
    opacity: .68,
    dx: 0, dy: 0,
    pad: "18px"
  }
}