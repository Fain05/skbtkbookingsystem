const SESSION_KEY = "skbtk_admin_session";

if (sessionStorage.getItem(SESSION_KEY) !== "true") {
  document.body.innerHTML = `
    <div class="login-wrap">
      <div class="login-card">
        <div class="modal__icon" style="background: var(--warn-tint); color: var(--warn);">
          ⚠️
        </div>

        <h1>Akses Ditolak</h1>
        <p>Anda perlu log masuk sebagai admin untuk mengakses halaman ini.</p>

        <a href="admin.html" class="btn btn-primary" style="margin-top:15px; display:inline-block;">
          Pergi ke Log Masuk
        </a>
      </div>
    </div>
  `;
}

let teachers = [];
let classes = [];

document.addEventListener("DOMContentLoaded", async () => {
  await loadData();
});

async function loadData() {
  try {
    const data = await Api.getData();

    teachers = data.teachers || [];
    classes = data.classes || [];

    renderTeachers();
    renderClasses();

  } catch (err) {
    console.log("Error load data", err);
  }
}

/* ================= TEACHERS ================= */

function renderTeachers() {
  const div = document.getElementById("teacherList");

  div.innerHTML = teachers.map((t, i) => `
    <div style="
      display:flex;
      justify-content:space-between;
      align-items:center;
      padding:10px 12px;
      border-bottom:1px solid var(--border);
    ">
      <span>${t}</span>
      <button class="btn-icon delete" onclick="deleteTeacher(${i})">Padam</button>
    </div>
  `).join("");
}

function addTeacher() {
  const input = document.getElementById("teacherInput");

  if (!input.value.trim()) return;

  teachers.push(input.value.trim());
  input.value = "";

  renderTeachers();
  saveTeachers();
}

function deleteTeacher(index) {
  const confirmDelete = confirm("Adakah anda pasti mahu padam nama guru ini?");

  if (!confirmDelete) return;

  teachers.splice(index, 1);
  renderTeachers();
  saveTeachers();
}

/* ================= CLASSES ================= */

function renderClasses() {
  const div = document.getElementById("classList");

  div.innerHTML = classes.map((c, i) => `
    <div style="
      display:flex;
      justify-content:space-between;
      align-items:center;
      padding:10px 12px;
      border-bottom:1px solid var(--border);
    ">
      <span>${c}</span>
      <button class="btn-icon delete" onclick="deleteClass(${i})">Padam</button>
    </div>
  `).join("");
}

function addClass() {
  const input = document.getElementById("classInput");

  if (!input.value.trim()) return;

  classes.push(input.value.trim());
  input.value = "";

  renderClasses();
  saveClasses();
}

function deleteClass(index) {
  const confirmDelete = confirm("Adakah anda pasti mahu padam kelas ini?");

  if (!confirmDelete) return;

  classes.splice(index, 1);
  renderClasses();
  saveClasses();
}

/* ================= SAVE TO GOOGLE SHEET ================= */

async function saveTeachers() {
  await fetch(CONFIG.APPS_SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "updateTeachers",
      data: teachers
    })
  });
}

async function saveClasses() {
  await fetch(CONFIG.APPS_SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "updateClasses",
      data: classes
    })
  });
}
