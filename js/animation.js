const text = "Tempah bilik sekolah dalam masa kurang seminit.";
let index = 0;

function typeEffect() {
  const target = document.getElementById("typingText");

  if (!target) return;

  if (index < text.length) {
    target.textContent += text.charAt(index);
    index++;
    setTimeout(typeEffect, 60);
  }
}

document.addEventListener("DOMContentLoaded", typeEffect);