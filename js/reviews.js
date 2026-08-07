console.log("reviews module loaded");

const REVIEW_STATUS_VISIBLE = "visible";

function reviewEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function reviewStars(value) {
  const rating = Math.max(0, Math.min(5, Number(value) || 0));
  return `${"★".repeat(Math.round(rating))}${"☆".repeat(5 - Math.round(rating))}`;
}

async function getReviewUser() {
  try {
    const { data } = await supabaseClient.auth.getUser();
    return data?.user || null;
  } catch {
    return null;
  }
}

async function loadAppReviews(appId) {
  const { data, error } = await supabaseClient
    .from("reviews")
    .select("id, app_id, user_id, rating, title, review_text, status, created_at, members(name)")
    .eq("app_id", appId)
    .eq("status", REVIEW_STATUS_VISIBLE)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

function calculateReviewSummary(reviews) {
  const count = reviews.length;
  const average = count
    ? reviews.reduce((total, item) => total + Number(item.rating || 0), 0) / count
    : 0;

  return { count, average };
}

async function renderReviewsForCurrentDownloadCard() {
  const card = document.querySelector(".download-card");
  const overlay = document.querySelector(".download-card-overlay");
  if (!card || !overlay || card.querySelector(".download-card-reviews")) return;

  const appId =
    overlay.dataset.appId ||
    card.dataset.appId ||
    window.currentDownloadAppId ||
    null;

  if (!appId) return;

  const target =
    card.querySelector(".download-card-main") ||
    card.querySelector(".download-card-info") ||
    card.querySelector(".download-card-body");

  if (!target) return;

  const section = document.createElement("section");
  section.className = "download-card-reviews";
  section.innerHTML = `<div class="review-loading">Reviews laden...</div>`;
  target.appendChild(section);

  try {
    const [reviews, user] = await Promise.all([
      loadAppReviews(appId),
      getReviewUser()
    ]);

    const summary = calculateReviewSummary(reviews);

    section.innerHTML = `
      <header class="review-summary">
        <div>
          <strong>${summary.count ? summary.average.toFixed(1).replace(".", ",") : "-"}</strong>
          <span class="review-stars">${reviewStars(summary.average)}</span>
          <small>${summary.count} review${summary.count === 1 ? "" : "s"}</small>
        </div>

        ${user ? `<button class="review-write-button" type="button">SCHRIJF REVIEW</button>` : `
          <span class="review-login-note">Login om een review te schrijven</span>
        `}
      </header>

      <div class="review-list">
        ${reviews.length ? reviews.slice(0, 8).map(item => `
          <article class="review-item">
            <div class="review-item-head">
              <strong>${reviewEscape(item.members?.name || "Gebruiker")}</strong>
              <span>${reviewStars(item.rating)}</span>
            </div>
            ${item.title ? `<h4>${reviewEscape(item.title)}</h4>` : ""}
            <p>${reviewEscape(item.review_text).replaceAll("\n", "<br>")}</p>
            <small>${new Date(item.created_at).toLocaleDateString("nl-BE")}</small>
          </article>
        `).join("") : `<p class="review-empty">Nog geen reviews.</p>`}
      </div>

      <form class="review-form" hidden>
        <div class="review-rating-picker" aria-label="Score">
          ${[1,2,3,4,5].map(value => `
            <button type="button" data-rating="${value}" aria-label="${value} sterren">★</button>
          `).join("")}
        </div>
        <input name="title" maxlength="100" placeholder="Titel (optioneel)">
        <textarea name="review_text" maxlength="1500" rows="4" placeholder="Wat vind je van deze app?" required></textarea>
        <input name="rating" type="hidden" value="0">
        <div class="review-form-actions">
          <button type="button" class="review-cancel">ANNULEREN</button>
          <button type="submit" class="review-submit">PLAATSEN</button>
        </div>
        <div class="review-form-status"></div>
      </form>
    `;

    const writeButton = section.querySelector(".review-write-button");
    const form = section.querySelector(".review-form");

    writeButton?.addEventListener("click", () => {
      form.hidden = false;
      writeButton.hidden = true;
    });

    section.querySelector(".review-cancel")?.addEventListener("click", () => {
      form.hidden = true;
      if (writeButton) writeButton.hidden = false;
    });

    section.querySelectorAll("[data-rating]").forEach(button => {
      button.addEventListener("click", () => {
        const rating = Number(button.dataset.rating);
        form.elements.rating.value = String(rating);

        section.querySelectorAll("[data-rating]").forEach(star => {
          star.classList.toggle("selected", Number(star.dataset.rating) <= rating);
        });
      });
    });

    form?.addEventListener("submit", async event => {
      event.preventDefault();

      const rating = Number(form.elements.rating.value);
      const text = form.elements.review_text.value.trim();
      const title = form.elements.title.value.trim();
      const status = form.querySelector(".review-form-status");
      const submit = form.querySelector(".review-submit");

      if (rating < 1 || rating > 5) {
        status.textContent = "Kies eerst 1 tot 5 sterren.";
        status.classList.add("error");
        return;
      }

      if (!text) {
        status.textContent = "Schrijf eerst je review.";
        status.classList.add("error");
        return;
      }

      submit.disabled = true;
      status.textContent = "Opslaan...";
      status.classList.remove("error");

      const { error } = await supabaseClient
        .from("reviews")
        .upsert({
          app_id: appId,
          user_id: user.id,
          rating,
          title: title || null,
          review_text: text,
          status: REVIEW_STATUS_VISIBLE,
          updated_at: new Date().toISOString()
        }, {
          onConflict: "app_id,user_id"
        });

      submit.disabled = false;

      if (error) {
        console.error(error);
        status.textContent = `Opslaan mislukt: ${error.message}`;
        status.classList.add("error");
        return;
      }

      section.remove();
      await renderReviewsForCurrentDownloadCard();
    });
  } catch (error) {
    console.error(error);
    section.innerHTML = `<div class="review-error">Reviews konden niet worden geladen.</div>`;
  }
}

function identifyDownloadAppId(overlay) {
  if (!overlay) return;

  if (overlay.dataset.appId) return;

  const app =
    window.dbApps?.find(item =>
      String(item.name || "").trim() ===
      String(overlay.querySelector(".download-card-title")?.textContent || "").trim()
    );

  if (app?.id) {
    overlay.dataset.appId = app.id;
    window.currentDownloadAppId = app.id;
  }
}

const reviewsObserver = new MutationObserver(() => {
  const overlay = document.querySelector(".download-card-overlay");
  if (!overlay) return;

  identifyDownloadAppId(overlay);
  renderReviewsForCurrentDownloadCard();
});

reviewsObserver.observe(document.documentElement, {
  childList: true,
  subtree: true
});
