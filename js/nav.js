/* ====================================================================
   navbar logic
   ==================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => links.classList.toggle("is-open"));
  links.querySelectorAll("a").forEach(a =>
    a.addEventListener("click", () => links.classList.remove("is-open"))
  );
});
