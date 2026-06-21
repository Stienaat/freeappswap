window.FreeAppSwapSearch = (() => {
  function init() {
    document.getElementById("searchBubble")?.addEventListener("click", event => {
      const button = event.target.closest("[data-target]");
      if (button) {
        const target = button.dataset.target;
        FreeAppSwapBubbles.focus(target, FreeAppSwapAccount.isLoggedIn());
        return;
      }
      FreeAppSwapBubbles.focus("search", FreeAppSwapAccount.isLoggedIn());
    });
  }
  return { init };
})();
