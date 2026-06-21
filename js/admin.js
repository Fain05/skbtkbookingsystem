/* ====================================================================
   admin panel logic — admin.html
   ==================================================================== */


const SESSION_KEY = "skbtk_admin_session";

let allBookings = [];
let activeFilter = "semua";
let roomChartInstance = null;

document.addEventListener("DOMContentLoaded", () => {
  wireLogin();
  document.getElementById("logoutBtn").addEventListener("click", logout);
  wireFilters();

  if (sessionStorage.getItem(SESSION_KEY) === "true") {
    showDashboard();
  } else {
    showLogin();
  }
});

/* ---------------------------------------------------------------- */
/* log in                                                         */
/* ---------------------------------------------------------------- */

function wireLogin() {
  document.getElementById("loginForm").addEventListener("submit", async e => {
    e.preventDefault();
    const username = document.getElementById("loginUser").value.trim();
    const password = document.getElementById("loginPass").value;
    const errorBox = document.getElementById("loginError");
    const btn = document.getElementById("loginBtn");

    errorBox.classList.remove("is-shown");
    btn.disabled = true;
    btn.textContent = "Menyemak...";

    try {
      let ok = false;
      if (Api.isConnected()) {
        const res = await Api.login(username, password);
        ok = !!res.success;
      } else {
        ok = username === CONFIG.ADMIN_USERNAME && password === CONFIG.ADMIN_DEMO_PASSWORD;
      }

      if (ok) {
        sessionStorage.setItem(SESSION_KEY, "true");
        showDashboard();
      } else {
        errorBox.textContent = "Nama pengguna atau kata laluan salah.";
        errorBox.classList.add("is-shown");
      }
    } catch (err) {
      errorBox.textContent = err.message || "Tidak dapat menghubungi pelayan.";
      errorBox.classList.add("is-shown");
    } finally {
      btn.disabled = false;
      btn.textContent = "Log Masuk";
    }
  });
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  showLogin();
}

function showLogin() {
  document.getElementById("loginView").style.display = "flex";
  document.getElementById("dashboardView").style.display = "none";
  document.getElementById("loginForm").reset();
}

function showDashboard() {
  document.getElementById("loginView").style.display = "none";
  document.getElementById("dashboardView").style.display = "block";
  loadDashboard();
}

/* ---------------------------------------------------------------- */
/* load data                                                       */
/* ---------------------------------------------------------------- */

async function loadDashboard() {
  try {
    const data = await Api.getData();
    allBookings = groupBookings(data.bookings || []);
  } catch (err) {
    console.warn("Gagal muat tempahan:", err.message);
    allBookings = [];
  }
  renderStats();
  renderChart();
  renderRoomRank();
  renderTable();
}

/* ---------------------------------------------------------------- */
/* statistics                                                       */
/* ---------------------------------------------------------------- */

function countByRoom() {
  const counts = {};
  CONFIG.ROOMS.forEach(r => (counts[r.id] = 0));
  allBookings.forEach(b => {
    if (counts[b.bilikId] === undefined) counts[b.bilikId] = 0;
    counts[b.bilikId]++;
  });
  return counts;
}

function renderStats() {
  const total = allBookings.length;
  const menunggu = allBookings.filter(b => b.status === "Menunggu").length;
  const lulus = allBookings.filter(b => b.status === "Diluluskan").length;

  document.getElementById("statTotal").textContent = total;
  document.getElementById("statMenunggu").textContent = menunggu;
  document.getElementById("statLulus").textContent = lulus;

  const counts = countByRoom();
  let popularId = null;
  let max = -1;
  Object.entries(counts).forEach(([id, c]) => {
    if (c > max) { max = c; popularId = id; }
  });
  const popularRoom = CONFIG.ROOMS.find(r => r.id === popularId);
  document.getElementById("statPopular").textContent =
    popularRoom && max > 0 ? popularRoom.nama : "—";
}

/* ---------------------------------------------------------------- */
/* carts                                                           */
/* ---------------------------------------------------------------- */

function renderChart() {
  const counts = countByRoom();
  const labels = CONFIG.ROOMS.map(r => r.nama);
  const values = CONFIG.ROOMS.map(r => counts[r.id] || 0);

  const ctx = document.getElementById("roomChart").getContext("2d");
  if (roomChartInstance) roomChartInstance.destroy();

  roomChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: ["#1d4e89", "#2f6b4f", "#c9972c"],
        borderRadius: 8,
        maxBarThickness: 60
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: "#ece4d2" } },
        x: { grid: { display: false } }
      }
    }
  });
}

function renderRoomRank() {
  const counts = countByRoom();
  const max = Math.max(1, ...Object.values(counts));
  const sorted = [...CONFIG.ROOMS].sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0));

  document.getElementById("roomRank").innerHTML = sorted.map(r => {
    const c = counts[r.id] || 0;
    const pct = Math.round((c / max) * 100);
    return `
      <div class="room-rank__row">
        <div class="room-rank__name">${r.nama}</div>
        <div class="room-rank__bar-track"><div class="room-rank__bar" style="width:${pct}%"></div></div>
        <div class="room-rank__count">${c}</div>
      </div>
    `;
  }).join("");
}

/* ---------------------------------------------------------------- */
/* booking list                                                   */
/* ---------------------------------------------------------------- */

function wireFilters() {
  document.getElementById("filterBar").addEventListener("click", e => {
    const btn = e.target.closest(".filter-chip");
    if (!btn) return;
    document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("is-active"));
    btn.classList.add("is-active");
    activeFilter = btn.dataset.filter;
    renderTable();
  });

document.getElementById("bookingTableBody").addEventListener("click", e => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const id = btn.dataset.id;
  const action = btn.dataset.action;

  if (action === "approve") {
    handleStatusChange(id, "Diluluskan", btn);
  }

  if (action === "reject") {
    handleStatusChange(id, "Ditolak", btn);
  }

  if (action === "delete") {
    handleDeleteBooking(id);
  }
});
}

function groupBookings(data) {
  const grouped = {};

  data.forEach(b => {
    const id = b.id;

    if (!grouped[id]) {
      grouped[id] = {
        id: b.id,
        namaGuru: b.namaGuru,
        kelas: b.kelas,
        bilikId: b.bilikId,
        bilikNama: b.bilikNama,
        tarikh: b.tarikh,
        tarikhMohon: b.tarikhMohon,
        status: b.status,
        slots: []
      };
    }

    grouped[id].slots.push(b.masa);

    // priority status (so admin sees worst state correctly)
    if (b.status === "Menunggu") grouped[id].status = "Menunggu";
    if (b.status === "Ditolak" && grouped[id].status !== "Menunggu") {
      grouped[id].status = "Ditolak";
    }
  });

  return Object.values(grouped);
}

function renderTable() {
  const tbody = document.getElementById("bookingTableBody");
  const emptyState = document.getElementById("emptyState");

  let rows = [...allBookings];
  if (activeFilter !== "semua") rows = rows.filter(b => b.status === activeFilter);
  rows.sort((a, b) => {
  return new Date(b.tarikhMohon) - new Date(a.tarikhMohon);
});

  if (!rows.length) {
    tbody.innerHTML = "";
    emptyState.style.display = "block";
    return;
  }
  emptyState.style.display = "none";

  tbody.innerHTML = rows.map(b => `
    <tr>
      <td>${escapeHtml(b.namaGuru)}</td>
      <td>${escapeHtml(b.kelas)}</td>
      <td>${escapeHtml(b.bilikNama || b.bilikId)}</td>
      <td>${escapeHtml(b.tarikh)}</td>
      <td>${b.slots.join(", ")}</td>
      <td>${statusPill(b.status)}</td>
      <td>${rowActions(b)}</td>
    </tr>
  `).join("");
}

function statusPill(status) {
  const map = {
    "Menunggu": "menunggu",
    "Diluluskan": "diluluskan",
    "Ditolak": "ditolak"
  };
  const cls = map[status] || "menunggu";
  return `<span class="status-pill ${cls}">${status}</span>`;
}

function rowActions(b) {
  return `
    <div class="row-actions">
      ${b.status === "Menunggu" ? `
        <button class="btn-icon approve" data-action="approve" data-id="${b.id}">Luluskan</button>
        <button class="btn-icon reject" data-action="reject" data-id="${b.id}">Tolak</button>
      ` : ""}

      <button class="btn-icon delete" data-action="delete" data-id="${b.id}">
        Padam
      </button>
    </div>
  `;
}

async function handleStatusChange(id, status, btn) {
  btn.disabled = true;
  const original = btn.textContent;
  btn.textContent = "...";
  try {
    await Api.updateStatus(id, status);
    const b = allBookings.find(x => String(x.id) === String(id));
    if (b) b.status = status;
    renderStats();
    renderChart();
    renderRoomRank();
    renderTable();
  } catch (err) {
    alert(err.message || "Gagal kemaskini status tempahan.");
    btn.disabled = false;
    btn.textContent = original;
  }
}

async function handleDeleteBooking(id) {

  const confirmDelete = confirm(
    "Adakah anda pasti ingin memadam tempahan ini?"
  );

  if (!confirmDelete) return;

  try {

    await Api.deleteBooking(id);

    allBookings = allBookings.filter(
      b => String(b.id) !== String(id)
    );

    renderStats();
    renderChart();
    renderRoomRank();
    renderTable();

  } catch (err) {
    alert(err.message || "Gagal memadam tempahan.");
  }

}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : str;
  return div.innerHTML;
}
