import os
import time
from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:8899/index.html"
OUT_DIR = "/tmp/deck_pdf_frames"
W, H = 1440, 810
SETTLE_MS = 3200  # let staggered/forwards animations reach their final state

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
