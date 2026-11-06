"""Isolated real sidebar navigation regression; no session or live data changes."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright, expect

HTML = '''<div id="root"></div><script type="module">import RefreshRuntime from "/@react-refresh";RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;</script><script type="module" src="/tests/navigation.browser.tsx"></script>'''
OUT = Path('/tmp/browser/navigation')

async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        for width, height in [(1280,1800),(390,844),(768,1024)]:
            page = await browser.new_page(viewport={'width':width,'height':height})
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            await page.route('http://localhost:8080/**', lambda r: r.fulfill(content_type='text/html',body=HTML) if r.request.resource_type=='document' else r.continue_())
            await page.goto('http://localhost:8080/biz/3k')
            if width < 768:
                await page.get_by_role('button',name='Mở menu',exact=True).click()
            nav = page.get_by_role('navigation',name='Điều hướng chính').filter(visible=True)
            await expect(nav.get_by_role('button',name='Kinh doanh',exact=True)).to_have_attribute('aria-expanded','true')
            await expect(nav.get_by_role('link',name='Quản lý 3K',exact=True)).to_have_attribute('aria-current','page')
            await expect(nav.get_by_role('button',name='Showroom — Sắp ra mắt')).to_be_disabled()
            await nav.get_by_role('button',name='Mua Hàng & Giao Vận',exact=True).click()
            await expect(nav.get_by_role('button',name='Quản Lý Mua Hàng — Sắp ra mắt')).to_be_disabled()
            await nav.get_by_role('link',name='Theo Dõi Đơn Hàng',exact=True).click()
            await expect(page).to_have_url('http://localhost:8080/order-tracking')
            if width < 768:
                await expect(nav).not_to_be_visible()
                await page.get_by_role('button',name='Mở menu',exact=True).click()
                nav = page.get_by_role('navigation',name='Điều hướng chính').filter(visible=True)
            await expect(nav.get_by_role('link',name='Theo Dõi Đơn Hàng',exact=True)).to_have_attribute('aria-current','page')
            await nav.get_by_role('button',name='Kế Toán & Tài Chính',exact=True).click()
            await expect(nav.get_by_role('button',name='Đề Nghị Thanh Toán — Sắp ra mắt')).to_be_disabled()
            await nav.screenshot(path=str(OUT/f'{width}-expanded.png'))
            await page.get_by_role('button',name='Thu gọn menu',exact=True).filter(visible=True).click()
            await expect(nav.get_by_role('button',name='Mua Hàng & Giao Vận',exact=True)).to_be_visible()
            await nav.screenshot(path=str(OUT/f'{width}-collapsed.png'))
            await page.get_by_role('button',name='Mở rộng menu',exact=True).filter(visible=True).click()
            assert not await page.evaluate('document.documentElement.scrollWidth > innerWidth')
            assert not errors, errors
            print(f'PASS {width}px: deep link, parent expansion, existing URL, disabled future items, collapse, no overflow/errors')
            await page.close()
        await browser.close()

asyncio.run(main())