/* ====================================================================
   booking list logic — booking.html
   ==================================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  await loadBookings();
});

async function loadBookings() {
  try {
    const data = await Api.getData();
    renderBookingList(groupBookings(data.bookings || []));
  } catch (err) {
    console.log("Error loading bookings:", err);
    renderBookingList([]);
  }
}

/* ================= GROUP BOOKINGS ================= */

function groupBookings(data) {
  const grouped = {};

  data.forEach(b => {
    const id = b.id;

   if (!grouped[id]) {
      grouped[id] = {
        id: b.id,
        namaGuru: b.namaGuru,
        kelas: b.kelas,
        bilikNama: b.bilikNama,
        tarikh: b.tarikh,
        tarikhMohon: b.tarikhMohon, // ✅ IMPORTANT
        status: b.status,
        slots: []
      };
    }

    grouped[id].slots.push(b.masa);

    // status priority logic
    if (b.status === "Menunggu") grouped[id].status = "Menunggu";
    if (b.status === "Ditolak" && grouped[id].status !== "Menunggu") {
      grouped[id].status = "Ditolak";
    }
  });

  return Object.values(grouped);
}

/* ================= PARSE GOOGLE SHEETS DATETIME ================= */

function parseDateTime(str) {
  if (!str) return new Date(0);

  // already JS date format
  if (!isNaN(Date.parse(str))) {
    return new Date(str);
  }

  // Google Sheets format: "6/21/2026 17:29:53"
  const parts = str.split(" ");
  if (parts.length === 2) {
    const datePart = parts[0];
    const timePart = parts[1];

    const d = new Date(datePart);
    if (!isNaN(d)) {
      return new Date(`${datePart} ${timePart}`);
    }
  }

  return new Date(0);
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

  /* 🔥 SORT BY TarikhMohon (NEWEST FIRST) */
  list.sort((a, b) => {
    return parseDateTime(b.tarikhMohon) - parseDateTime(a.tarikhMohon);
  });

  list.forEach(b => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${escapeHtml(b.namaGuru)}</td>
      <td>${escapeHtml(b.kelas)}</td>
      <td>${escapeHtml(b.bilikNama)}</td>
      <td>${escapeHtml(b.tarikh)}</td>
      <td>${b.slots.join(", ")}</td>
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

/* ================= SECURITY ================= */

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : str;
  return div.innerHTML;
}
