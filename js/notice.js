const WARNING_KEY = "delay_warning_seen";

document.addEventListener("DOMContentLoaded", () => {
  const seen = sessionStorage.getItem(WARNING_KEY);

  if (!seen) {
    document.getElementById("delayWarning").classList.add("show");
  }
});

function closeDelayWarning() {
  document.getElementById("delayWarning").classList.remove("show");
  sessionStorage.setItem(WARNING_KEY, "true");
}