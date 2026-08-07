console.log("analytics module loaded");

async function recordAnalyticsEvent(eventName, appId = null, metadata = {}) {
  try {
    await supabaseClient.rpc("record_analytics_event", {
      p_event_name: eventName,
      p_app_id: appId,
      p_metadata: metadata
    });
  } catch (error) {
    console.warn("Analytics event niet opgeslagen:", error);
  }
}

(function recordPageViewOnce() {
  const key = "freeapps_page_view_recorded";

  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, "1");

  recordAnalyticsEvent("page_view", null, {
    path: location.pathname,
    referrer: document.referrer || null
  });
})();

document.addEventListener("click", event => {
  const download = event.target.closest(".download-card-download");
  if (!download) return;

  const overlay = download.closest(".download-card-overlay");
  const appId =
    overlay?.dataset.appId ||
    window.currentDownloadAppId ||
    null;

  if (appId) {
    recordAnalyticsEvent("app_download", appId, {});
  }
});
