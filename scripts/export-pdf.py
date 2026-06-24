import glob
import os
import sys

import img2pdf
from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:8899/index.html"
OUT_DIR = "/tmp/deck_pdf_frames"
W, H = 1440, 810
SETTLE_MS = 5500  # exceed the longest timeline (flow slide finishes ~4.35s)
PDF_NAME = sys.argv[1] if len(sys.argv) > 1 else "Luphra-pitch-deck-draft.pdf"

os.makedirs(OUT_DIR, exist_ok=True)
for f in os.listdir(OUT_DIR):
    os.remove(os.path.join(OUT_DIR, f))

CHROME = os.path.expanduser(
    "~/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/"
    "Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"
)

frames = []
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME)
    page = browser.new_page(viewport={"width": W, "height": H}, device_scale_factor=2)
    page.goto(URL, wait_until="networkidle")

    # Hide the on-screen fullscreen control so it isn't baked into the PDF.
    page.add_style_tag(content="#fullscreenButton{display:none !important;}")

    # Wait for slides to be injected and fonts to be ready.
    page.wait_for_selector(".slide", state="attached")
    page.evaluate("document.fonts && document.fonts.ready")
    count = page.eval_on_selector_all(".slide", "els => els.length")
    print("slides:", count)

    for i in range(count):
        if i > 0:
            page.keyboard.press("ArrowRight")
        # Wait until this slide is the active one.
        page.wait_for_function(
            "idx => { const s=[...document.querySelectorAll('.slide')];"
            "return s[idx] && s[idx].classList.contains('active'); }",
            arg=i,
        )
        page.wait_for_timeout(SETTLE_MS)  # animations settle into final frame
        path = os.path.join(OUT_DIR, f"slide-{i+1:02d}.png")
        page.screenshot(path=path)
        frames.append(path)
        print("captured", path)

    browser.close()

print("DONE", len(frames))

layout = img2pdf.get_layout_fun((img2pdf.in_to_pt(10), img2pdf.in_to_pt(5.625)))
with open(PDF_NAME, "wb") as f:
    f.write(img2pdf.convert(frames, layout_fun=layout))
print("saved:", os.path.abspath(PDF_NAME), round(os.path.getsize(PDF_NAME) / 1024 / 1024, 2), "MB")
