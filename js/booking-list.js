/* ====================================================================
   booking list logic — booking.html
   ==================================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  await loadBookings();
});

async function loadBookings() {
  try {
    const data = await Api.getData();
    renderBookingList(data.bookings || []);
  } catch (err) {
    console.log("Error loading bookings:", err);
    renderBookingList([]);
  }
}

/* ================= RENDER TABLE ================= */

function renderBookingList(list) {
  const tbody = document.getElementById("bookingListBody");
  const empty = document.getElementById("emptyState");

  tbody.innerHTML = "";

  if (!list || list.length === 0) {
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";

  list.forEach(b => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${escapeHtml(b.namaGuru)}</td>
      <td>${escapeHtml(b.kelas)}</td>
      <td>${escapeHtml(b.bilikNama)}</td>
      <td>${escapeHtml(b.tarikh)}</td>
      <td>${escapeHtml(b.masa)}</td>
      <td>${formatStatus(b.status)}</td>
    `;

    tbody.appendChild(row);
  });
}

/* ================= STATUS UI ================= */

function formatStatus(status) {
  let cls = "";

  if (status === "Menunggu") cls = "menunggu";
  else if (status === "Diluluskan") cls = "diluluskan";
  else if (status === "Ditolak") cls = "ditolak";

  return `<span class="status-pill ${cls}">${status}</span>`;
}

/* ================= SECURITY (basic HTML safety) ================= */

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : str;
  return div.innerHTML;
}