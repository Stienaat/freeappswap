function openAppCard(options) {
  const mode = options.mode; // "view" of "edit"
  const appId = options.appId || null;

  if (mode === "view") {
    openAppCardView(appId);
  }

  if (mode === "edit") {
    openAppCardEdit();
  }

openAppCard({
  mode: "edit"
});

function openAppCard({ mode, appId }) {
  if (mode === "view") {
    alert("product view: " + appId);
  }

  if (mode === "edit") {
    alert("upload edit");
  }
}