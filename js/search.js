console.log("sun module loaded");

const sunSearch = document.getElementById("search");

function openSunSearch() {
  sunSearch.classList.add("open");
}

function clearSunFocusState() {
  sunSearch.classList.remove("focus", "dim");
}

function updateSunFocusState(activeIsSearch, loggedIn, appBubblesCreated) {
  sunSearch.classList.toggle("focus", activeIsSearch);
  sunSearch.classList.toggle("dim", !activeIsSearch && (loggedIn || appBubblesCreated));
}

window.openSunSearch = openSunSearch;
window.clearSunFocusState = clearSunFocusState;
window.updateSunFocusState = updateSunFocusState;