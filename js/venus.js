function showAdminMenu() {
  const admin = document.querySelector('.app-bubble.admin');
  if (!admin) return;

  renderAdminMenu(admin);
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

  document.getElementById("btnAdminBack").onclick = () => {
    admin.classList.remove("admin-phase-3");
    showAdminMenu();
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
        <button id="btnSaveApp">save</button>
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

  document.getElementById("btnAdminBack").onclick = () => {
    showAdminMenu();
  };

  document.getElementById("btnNewApp").onclick = newAppRow;
  document.getElementById("btnEditApp").onclick = enableAppEdit;
  document.getElementById("btnDeleteApp").onclick = deleteSelectedApp;
  document.getElementById("btnExportApps").onclick = exportAppsExcel;
  document.getElementById("btnSaveApp").onclick = saveSelectedApp;

  await loadApps();
}

window.showAdminApps = showAdminApps;
window.showAdminUsers = showAdminUsers;