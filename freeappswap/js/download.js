window.FreeAppSwapDownload = (() => {
  function init() {
    document.getElementById("downloadBubble")?.addEventListener("click", () => {
      FreeAppSwapBubbles.focus("download", FreeAppSwapAccount.isLoggedIn());
    });
  }
  return { init };
})();
