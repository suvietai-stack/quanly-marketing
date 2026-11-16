"""Viewport smoke checks for Design pages. Uses isolated fixtures, never live Job data."""
import asyncio
import re
from pathlib import Path
from playwright.async_api import async_playwright, expect

HTML = """<div id="root"></div>
<script type="module">import RefreshRuntime from "/@react-refresh";RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;</script>
<script type="module" src="/tests/design.browser.tsx"></script>"""
OUT = Path("/tmp/browser/design-mobile")

async def no_horizontal_overflow(page, label):
    value = await page.evaluate("""() => ({
        viewport: window.innerWidth,
        scroll: document.documentElement.scrollWidth,
        body: document.body.scrollWidth
    })""")
    assert value["scroll"] <= value["viewport"] + 1, (label, value)

async def minimum_touch_target(locator, label, pixels=42):
    box = await locator.bounding_box()
    assert box and box["height"] >= pixels, (label, box)

async def run():
    OUT.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        for width, height in [(320, 740), (375, 812), (390, 844), (430, 932)]:
            page = await browser.new_page(viewport={"width": width, "height": height}, device_scale_factor=1)
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            await page.route("http://localhost:8080/**", lambda route: route.fulfill(content_type="text/html", body=HTML) if route.request.resource_type == "document" else route.continue_())
            await page.goto("http://localhost:8080/?flow=mockup")
            await expect(page.get_by_role("heading", name="Ma-két đơn hàng", exact=True)).to_be_visible(timeout=20000)
            await no_horizontal_overflow(page, f"{width} list")
            create = page.get_by_role("button", name="Tạo Job", exact=True)
            await expect(create).to_be_visible()
            await minimum_touch_target(create, f"{width} create")
            card_title = page.locator(".design-work-card-title").first
            await expect(card_title).to_be_visible()
            font_size = await card_title.evaluate("(node) => parseFloat(getComputedStyle(node).fontSize)")
            assert font_size >= 15.5, (width, font_size)
            await minimum_touch_target(page.get_by_role("button", name="Mở Job").first, f"{width} open")

            await create.click()
            dialog = page.get_by_role("dialog", name=re.compile(r"Tạo Ma-két"))
            await expect(dialog).to_be_visible()
            await expect(dialog.get_by_text("Bước 1/3", exact=False)).to_be_visible()
            await dialog.get_by_placeholder("Ví dụ: Bộ ảnh sản phẩm tháng 11").fill("Ma-két kiểm tra trình bày trên mobile")
            await dialog.get_by_role("combobox").first.click()
            await page.get_by_role("option", name="Ma-két bộ quà tặng", exact=True).click()
            await dialog.get_by_role("button", name="Tiếp tục").click()

            await expect(dialog.get_by_text("Bước 2/3", exact=False)).to_be_visible()
            await dialog.get_by_role("combobox", name="Người thực hiện").click()
            await page.get_by_role("option", name="Designer", exact=True).click()
            await dialog.get_by_role("button", name="Tiếp tục").click()
            await expect(dialog.get_by_text("Bước 3/3", exact=False)).to_be_visible()
            await expect(dialog.get_by_text("Kiểm tra trước khi tạo")).to_be_visible()
            final_button = dialog.get_by_role("button", name="Tạo Job & giao việc")
            await expect(final_button).to_be_visible()
            await minimum_touch_target(final_button, f"{width} save")
            outer = await dialog.bounding_box()
            action = await final_button.bounding_box()
            assert outer and action, (width, outer, action)
            assert action["y"] >= outer["y"] and action["y"] + action["height"] <= outer["y"] + outer["height"] + 2, (width, outer, action)
            await no_horizontal_overflow(page, f"{width} create form")
            await page.screenshot(path=str(OUT / f"{width}-create.png"))
            await page.keyboard.press("Escape")
            await expect(dialog).not_to_be_visible()

            await page.get_by_role("button", name="Mở Job").first.click()
            detail = page.get_by_role("dialog")
            await expect(detail).to_be_visible()
            for tab in ("Thông tin", "Xử lý", "Lịch sử"):
                await expect(detail.get_by_role("tab", name=re.compile(tab))).to_be_visible()
            # Trao đổi is only shown if the backend grants job-chat access.
            assert await detail.get_by_role("tab").count() in (3, 4)
            await expect(detail.get_by_text(re.compile(r"Bước [1-5]/5"))).to_be_visible()
            await no_horizontal_overflow(page, f"{width} detail")
            await page.screenshot(path=str(OUT / f"{width}-detail.png"))
            assert not errors, (width, errors)
            print("PASS", width, "job list, readable cards, 3-step form, fixed action, detail, no overflow")
            await page.close()
        await browser.close()

asyncio.run(run())
