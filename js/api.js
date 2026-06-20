/* ====================================================================
   help api to connect script to sheets
   ==================================================================== */

const Api = {
  isConnected() {
    return !!CONFIG.APPS_SCRIPT_URL;
  },

  // take data using GET
  async getData() {
    if (!this.isConnected()) {
      return {
        teachers: CONFIG.FALLBACK_TEACHERS,
        classes: CONFIG.FALLBACK_CLASSES,
        bookings: []
      };
    }
    const res = await fetch(`${CONFIG.APPS_SCRIPT_URL}?action=data`);
    if (!res.ok) throw new Error("Gagal hubungi pelayan.");
    return res.json();
  },

  // execute with POST
  async post(action, payload) {
    if (!this.isConnected()) {
      throw new Error(
        "Sistem belum disambungkan ke Google Sheet. Sila tampal URL Apps Script dalam js/config.js"
      );
    }
    const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, ...payload })
    });
    if (!res.ok) throw new Error("Gagal hubungi pelayan.");
    return res.json();
  },

  async checkAndBook(payload) {
    return this.post("checkAndBook", payload);
  },

  async login(username, password) {
    return this.post("login", { username, password });
  },

  async updateStatus(id, status) {
    return this.post("updateStatus", { id, status });
  }
};
