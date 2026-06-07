const slideFiles = [
  "src/slides/02-product-overview.html",
  "src/slides/03-scale.html",
  "src/slides/04-gap.html",
  "src/slides/05-scan.html",
  "src/slides/06-sources.html",
  "src/slides/07-certify.html",
];

const stage = document.querySelector("#stage");
const slideMarkup = await Promise.all(slideFiles.map(async (file) => {
  const response = await fetch(file);
  if (!response.ok) {
    throw new Error(`Failed to load ${file}: ${response.status}`);
  }
  return response.text();
}));
stage.insertAdjacentHTML("afterbegin", slideMarkup.join("\n\n"));
// Scale stage proportionally to fit viewport
const stageWrapper = document.querySelector("#stageWrapper");
function scaleStage() {
  const pad = 48;
  const maxW = window.innerWidth - pad * 2;
  const maxH = window.innerHeight - pad * 2;
  const scale = Math.min(maxW / 1440, maxH / 810);
  stage.style.transform = `scale(${scale})`;
  stageWrapper.style.width = `${1440 * scale}px`;
  stageWrapper.style.height = `${810 * scale}px`;
}
scaleStage();
window.addEventListener("resize", scaleStage);

const slides = Array.from(document.querySelectorAll(".slide"));
const progress = document.querySelector("#progress");
let current = 0;

slides.forEach((slide, index) => {
  const dot = document.createElement("button");
  dot.className = "progress-dot";
  dot.type = "button";
  dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
  dot.addEventListener("click", () => show(index));
  progress.appendChild(dot);
});

function show(index) {
  current = Math.max(0, Math.min(index, slides.length - 1));
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("active", slideIndex === current);
  });
  Array.from(progress.children).forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === current);
  });
}

function move(step) {
  show(current + step);
}

document.querySelector("#prev").addEventListener("click", () => move(-1));
document.querySelector("#next").addEventListener("click", () => move(1));

const fullscreenButton = document.querySelector("#fullscreen");
const enterFullscreenIcon = document.querySelector("#enterFullscreenIcon");
const exitFullscreenIcon = document.querySelector("#exitFullscreenIcon");

function updateFullscreenButton() {
  const isFullscreen = Boolean(document.fullscreenElement);
  fullscreenButton.setAttribute(
    "aria-label",
    isFullscreen ? "Exit fullscreen" : "Enter fullscreen",
  );
  fullscreenButton.title = isFullscreen ? "Exit fullscreen" : "Enter fullscreen";
  enterFullscreenIcon.hidden = isFullscreen;
  exitFullscreenIcon.hidden = !isFullscreen;
}

fullscreenButton.addEventListener("click", async () => {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
  } else {
    await document.documentElement.requestFullscreen();
  }
});

document.addEventListener("fullscreenchange", () => {
  updateFullscreenButton();
  scaleStage();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === " " || event.key === "PageDown") {
    event.preventDefault();
    move(1);
  }
  if (event.key === "ArrowLeft" || event.key === "PageUp") {
    event.preventDefault();
    move(-1);
  }
  if (event.key >= "1" && event.key <= "9") {
    show(Number(event.key) - 1);
  }
});

updateFullscreenButton();
show(0);
