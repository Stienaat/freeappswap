function showAdminMenu() {
  const admin = document.querySelector('.app-bubble.admin');
  if (!admin) return;

  renderAdminMenu(admin);
  window.attachAdminConfigButton?.(admin);
}

function closeAdminPanel() {
  const admin = document.querySelector('.app-bubble.admin');
  if (!admin) return;

  admin.classList.remove(
    "admin-phase-3",
    "focus",
    "dim"
  );

  admin.dataset.motionStatus = "2";
  renderAdminMenu(admin);
  window.attachAdminConfigButton?.(admin);

  if (admin._wrapMotion) {
    admin._wrapMotion.lastTime = performance.now();
  }
}

function closeAdminWorkspace() {
  if (typeof window.closeAdminAppEditor === "function") {
    window.closeAdminAppEditor();
  }

  if (typeof window.closeAdminConfigCard === "function") {
    window.closeAdminConfigCard();
  }

  closeAdminPanel();
}

async function showAdminUsers() {
  const admin = document.querySelector('.app-bubble.admin');
  if (!admin) return;

  admin.classList.add("admin-phase-3");

  admin.innerHTML = `
    <div class="admin-members-panel">

      <div class="admin-members-title">LEDEN</div>

      <div class="admin-toolbar">
        <button id="btnAdminBack">exit</button>
        <button id="btnEditMember">edit</button>
        <button id="btnDeleteMember">delete</button>
        <button id="btnExportMembers">export</button>
        <button id="btnSaveMember">save</button>
      </div>

      <div class="members-table-wrap">
        <table class="members-table">
          <thead>
            <tr>
              <th></th>
              <th>Naam</th>
              <th>Email</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody id="membersBody">
            <tr><td colspan="4">laden...</td></tr>
          </tbody>
        </table>
      </div>

      <div id="membersStatus" class="members-status"></div>

    </div>
  `;

  document.getElementById("btnAdminBack").onclick = event => {
    event.stopPropagation();
    closeAdminWorkspace();
  };

  document.getElementById("btnEditMember").onclick = enableMemberEdit;
  document.getElementById("btnDeleteMember").onclick = deleteSelectedMember;
  document.getElementById("btnExportMembers").onclick = exportMembersExcel;
  document.getElementById("btnSaveMember").onclick = saveSelectedMember;

  await loadMembers();
}

async function showAdminApps() {
  const admin = document.querySelector('.app-bubble.admin');
  if (!admin) return;

  admin.classList.add("admin-phase-3");

  admin.innerHTML = `
    <div class="admin-members-panel apps-panel">

      <div class="admin-members-title">APPS</div>

      <div class="admin-toolbar">
        <button id="btnAdminBack">exit</button>
        <button id="btnNewApp">new</button>
        <button id="btnEditApp">edit</button>
        <button id="btnDeleteApp">delete</button>
        <button id="btnExportApps">export</button>
      </div>

      <div class="members-table-wrap">
        <table class="members-table">
          <thead>
            <tr>
              <th></th>
              <th>Naam</th>
              <th>Platform</th>
              <th>Categorie</th>
              <th>Versie</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="appsBody">
            <tr><td colspan="6">laden...</td></tr>
          </tbody>
        </table>
      </div>

      <div id="appsStatus" class="members-status"></div>

    </div>
  `;

  document.getElementById("btnAdminBack").onclick = event => {
    event.stopPropagation();
    closeAdminWorkspace();
  };

  document.getElementById("btnNewApp").onclick = () => openAdminAppEditor(null);
  document.getElementById("btnEditApp").onclick = openSelectedAdminAppEditor;
  document.getElementById("btnDeleteApp").onclick = deleteSelectedApp;
  document.getElementById("btnExportApps").onclick = exportAppsExcel;

  await loadApps();
}

function createAdminBubble() {
  if (document.querySelector('.app-bubble[data-kind="admin"]')) return;

  const el = document.createElement("div");
  el.className = "app-bubble admin";
  el.dataset.kind = "admin";
  el.dataset.motionStatus = "2";
  el.style.background = `
radial-gradient(circle at 30% 20%,
#ffffff 0%,
#ffe89a 20%,
#ffb52e 60%,
#cc7700 100%)
`;

renderAdminMenu(el);
window.attachAdminConfigButton?.(el);

  preparePlanetBubble(el, randomBetween(43, 57), randomBetween(70, 82), "min(17vw, 24vh)");
}

window.showAdminApps = showAdminApps;
window.showAdminUsers = showAdminUsers;

window.closeAdminPanel = closeAdminPanel;
window.closeAdminWorkspace = closeAdminWorkspace;
window.PlanetManager?.register("admin", closeAdminWorkspace);
