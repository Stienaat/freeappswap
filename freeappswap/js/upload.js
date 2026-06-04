window.FreeAppSwapUpload = (() => {
  function init() {
    document.getElementById("uploadBubble")?.addEventListener("click", () => {
      FreeAppSwapBubbles.focus("upload", FreeAppSwapAccount.isLoggedIn());
    });
  }
  return { init };
})();
