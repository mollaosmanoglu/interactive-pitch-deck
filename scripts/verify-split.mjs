import { readFileSync, existsSync } from "node:fs";

const requiredFiles = [
  "src/styles/base.css",
  "src/deck.js",
  "src/slides/02-product-overview.html",
  "src/slides/03-scale.html",
  "src/slides/04-gap.html",
  "src/slides/05-scan.html",
  "src/slides/06-sources.html",
  "src/slides/07-certify.html",
];

const missing = requiredFiles.filter((path) => !existsSync(path));
if (missing.length > 0) {
  throw new Error(`Missing split files:\n${missing.join("\n")}`);
}

const index = readFileSync("index.html", "utf8");
if (index.includes("<article class=\"slide")) {
  throw new Error("index.html still contains inline slide articles");
}
if (index.includes("<style>")) {
  throw new Error("index.html still contains inline CSS");
}
if (!index.includes("src/deck.js")) {
  throw new Error("index.html does not load src/deck.js");
}

const slides = requiredFiles
  .filter((path) => path.startsWith("src/slides/"))
  .map((path) => readFileSync(path, "utf8"));

slides.forEach((slide, index) => {
  if (!slide.includes("<article class=\"slide")) {
    throw new Error(`Slide ${index + 1} does not contain an article.slide root`);
  }
});

const wrongBrandPattern = new RegExp(String.fromCharCode(100, 101, 102, 116, 101, 114), "i");
const wrongBrandMentions = ["index.html", ...requiredFiles]
  .map((path) => [path, readFileSync(path, "utf8")])
  .filter(([, content]) => wrongBrandPattern.test(content))
  .map(([path]) => path);

if (wrongBrandMentions.length > 0) {
  throw new Error(`Unexpected wrong-brand mention in:\n${wrongBrandMentions.join("\n")}`);
}

console.log(`Verified ${slides.length} split slides, shared CSS, and deck JS.`);
