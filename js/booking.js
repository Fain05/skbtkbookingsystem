/* ====================================================================
   booking form logic — index.html
   ==================================================================== */

const ROOM_ICONS = {
  "smart-classroom": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/><path d="M7 9l2 2-2 2M12 13h3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  "bilik-pak21": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3 2.2-5 5-5s5 2 5 5M14 20c0-2.4 1.6-4 3.5-4s3.5 1.6 3.5 4" stroke-linecap="round"/></svg>`,
  "makmal-komputer": `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="14" height="10" rx="1.5"/><path d="M8 18h4M19 8v9M17 17h4M19 8h-2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
};

const ROOM_DESC = {
  "smart-classroom": "Dilengkapi papan putih pintar &amp; sistem audio visual.",
  "bilik-pak21": "Ruang fleksibel untuk pembelajaran abad ke-21.",
  "makmal-komputer": "Komputer untuk aktiviti TMK dan latihan ICT."
};

let pendingBooking = null;

document.addEventListener("DOMContentLoaded", () => {
  renderRoomCards();
  renderRoomPick();
  renderTimetable();
  setMinDate();
  wireModals();
  wireForm();

  document.getElementById("tarikh").addEventListener("change", loadBookedSlots);

  document.querySelectorAll('input[name="bilik"]').forEach(radio => {
    radio.addEventListener("change", loadBookedSlots);
  });

  if (!Api.isConnected()) {
    document.getElementById("connectionNote").style.display = "block";
  }

  populateTeachers(CONFIG.FALLBACK_TEACHERS);
  populateClasses(CONFIG.FALLBACK_CLASSES);

  Api.getData()
    .then(data => {
      populateTeachers(data.teachers?.length ? data.teachers : CONFIG.FALLBACK_TEACHERS);
      populateClasses(data.classes?.length ? data.classes : CONFIG.FALLBACK_CLASSES);
    })
    .catch(err => {
      console.warn("Guna senarai sandaran:", err.message);
    });
});

function renderRoomCards() {
  const wrap = document.getElementById("roomCards");
  wrap.innerHTML = CONFIG.ROOMS.map(r => `
    <div class="room-card">
      <div class="room-card__icon">${ROOM_ICONS[r.id] || ""}</div>
      <h3>${r.nama}</h3>
      <p>${ROOM_DESC[r.id] || ""}</p>
      <a href="#tempah-bilik" class="room-card__link" data-room-pick="${r.id}">Tempah bilik ini &rarr;</a>
    </div>
  `).join("");

  wrap.querySelectorAll("[data-room-pick]").forEach(link => {
    link.addEventListener("click", () => {
      const id = link.getAttribute("data-room-pick");
      const radio = document.querySelector(`input[name="bilik"][value="${id}"]`);
      if (radio) radio.checked = true;
    });
  });
}

function renderRoomPick() {
  const wrap = document.getElementById("roomPick");
  wrap.innerHTML = CONFIG.ROOMS.map((r, i) => `
    <input type="radio" name="bilik" id="bilik-${r.id}" value="${r.id}" required>
    <label for="bilik-${r.id}">${r.nama}</label>
  `).join("");
}

function renderTimetable() {
  const wrap = document.getElementById("timetable");

  wrap.innerHTML = CONFIG.TIME_SLOTS.map((slot, i) => `
    <input
      type="checkbox"
      name="masa"
      id="masa-${i}"
      value="${slot}"
    >

    <label
      for="masa-${i}"
      data-period="W${i + 1}"
    >
      ${slot}
    </label>
  `).join("");
}

async function loadBookedSlots() {
  const bilik = document.querySelector('input[name="bilik"]:checked')?.value;
  const tarikh = document.getElementById("tarikh").value;

  if (!bilik || !tarikh) return;

  const res = await fetch(
    `${CONFIG.APPS_SCRIPT_URL}?action=slots&bilikId=${bilik}&tarikh=${tarikh}`
  );

  const data = await res.json();

  document.querySelectorAll('input[name="masa"]').forEach(input => {
    const label = document.querySelector(`label[for="${input.id}"]`);
    const slot = input.value;

    const booked = data.find(x => x.masa === slot);

    if (booked) {
      input.disabled = true;
      input.checked = false;

      label.classList.add("locked");
      label.setAttribute("title", `Ditempah oleh: ${booked.nama}`);
    } else {
      input.disabled = false;
      label.classList.remove("locked");
      label.removeAttribute("title");
    }
  });
}

function setMinDate() {
  const today = new Date();
  const iso = today.toISOString().slice(0, 10);
  document.getElementById("tarikh").min = iso;
  document.getElementById("tarikh").value = iso;
}

function populateTeachers(list) {
  const datalist = document.getElementById("teacherList");
  datalist.innerHTML = list.map(n => `<option value="${escapeHtml(n)}">`).join("");
}

function populateClasses(list) {
  const select = document.getElementById("kelas");
  const options = ['<option value="" disabled selected>Pilih kelas</option>']
    .concat(list.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`))
    .concat(['<option value="Lain-lain">Lain-lain</option>']);
  select.innerHTML = options.join("");

  select.addEventListener("change", () => {
    const wrap = document.getElementById("kelasLainWrap");
    const lainInput = document.getElementById("kelasLain");
    if (select.value === "Lain-lain") {
      wrap.style.display = "flex";
      lainInput.required = true;
    } else {
      wrap.style.display = "none";
      lainInput.required = false;
      lainInput.value = "";
    }
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function wireForm() {
  document.getElementById("bookingForm").addEventListener("submit", e => {
    e.preventDefault();

    const namaGuru = document.getElementById("namaGuru").value.trim();
    const kelasSelect = document.getElementById("kelas").value;
    const kelasLain = document.getElementById("kelasLain").value.trim();
    const kelas = kelasSelect === "Lain-lain" ? kelasLain : kelasSelect;
    const bilikInput = document.querySelector('input[name="bilik"]:checked');
    const masaInputs = document.querySelectorAll('input[name="masa"]:checked');
    const selectedSlots = [...masaInputs].map(m => m.value);
    const tarikh = document.getElementById("tarikh").value;

    if (!namaGuru ||!kelas ||!bilikInput ||masaInputs.length === 0 ||!tarikh) {
      alert("Sila lengkapkan semua maklumat sebelum menghantar.");
      return;
    }

    const room = CONFIG.ROOMS.find(r => r.id === bilikInput.value);

    pendingBooking = {
      namaGuru,
      kelas,
      bilikId: room.id,
      bilikNama: room.nama,
      tarikh,
      masa: selectedSlots
    };

    document.getElementById("sumGuru").textContent = namaGuru;
    document.getElementById("sumKelas").textContent = kelas;
    document.getElementById("sumBilik").textContent = room.nama;
    document.getElementById("sumTarikh").textContent = formatTarikh(tarikh);
    document.getElementById("sumMasa").textContent =selectedSlots.join(", ");

    openOverlay("modalConfirm");
  });
}

function formatTarikh(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("ms-MY", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function wireModals() {
  document.querySelectorAll(".overlay").forEach(ov => {
    ov.addEventListener("click", e => {
      if (e.target === ov) closeOverlay(ov.id);
    });
  });

  document.getElementById("btnBatal").addEventListener("click", () => closeOverlay("modalConfirm"));
  document.getElementById("btnWarnTutup").addEventListener("click", () => closeOverlay("modalWarn"));
  document.getElementById("btnSuccessTutup").addEventListener("click", () => closeOverlay("modalSuccess"));

  document.getElementById("btnSahkan").addEventListener("click", submitBooking);
}

async function submitBooking() {
  if (!pendingBooking) return;
  const btn = document.getElementById("btnSahkan");
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Menghantar...";

  try {
    const res = await Api.checkAndBook(pendingBooking);
    closeOverlay("modalConfirm");

    if (res.success) {
      resetForm();
      openOverlay("modalSuccess");
    } else {
      document.getElementById("warnMessage").textContent =
        res.message || "Bilik ini sudah ditempah pada tarikh dan waktu yang sama. Sila pilih waktu atau bilik lain.";
      openOverlay("modalWarn");
    }
  } catch (err) {
    closeOverlay("modalConfirm");
    document.getElementById("warnMessage").textContent =
      err.message || "Tidak dapat menghubungi pelayan. Sila cuba sebentar lagi.";
    openOverlay("modalWarn");
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

function resetForm() {
  document.getElementById("bookingForm").reset();
  document.getElementById("kelasLainWrap").style.display = "none";
  setMinDate();
  pendingBooking = null;
}

function openOverlay(id) {
  document.getElementById(id).classList.add("is-open");
}
function closeOverlay(id) {
  document.getElementById(id).classList.remove("is-open");
}

