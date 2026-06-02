const slideFiles = [
  "src/slides/01-hero.html",
  "src/slides/02-product-overview.html",
  "src/slides/03-authorized.html",
  "src/slides/03-confidential.html",
  "src/slides/04-gap.html",
  "src/slides/10-problem.html",
  "src/slides/12-europe.html",
  "src/slides/13-flow.html",
  "src/slides/07-certify.html",
  "src/slides/08-team.html",
  "src/slides/11-cta.html",
  "src/slides/14-loi.html",
  "src/slides/15-competition.html",
  "src/slides/17-roadmap.html",
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
  const maxW = window.innerWidth;
  const maxH = window.innerHeight;
  const scale = Math.min(maxW / 1440, maxH / 810);
  stage.style.transform = `scale(${scale})`;
  stageWrapper.style.width = `${1440 * scale}px`;
  stageWrapper.style.height = `${810 * scale}px`;
}
scaleStage();
window.addEventListener("resize", scaleStage);

const slides = Array.from(document.querySelectorAll(".slide"));
const deck = document.querySelector(".deck");
let current = 0;

function show(index) {
  current = Math.max(0, Math.min(index, slides.length - 1));
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("active", slideIndex === current);
  });
  const active = slides[current];
  deck.classList.toggle("deck-dark", active.classList.contains("inverted"));
}

function move(step) {
  show(current + step);
}

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

show(0);
