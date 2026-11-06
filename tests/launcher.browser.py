"""Real launcher component regression with isolated visibility; no business writes."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright, expect
HTML = '''<div id="root"></div><script type="module">import RefreshRuntime from "/@react-refresh";RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;</script><script type="module" src="/tests/launcher.browser.tsx"></script>'''
OUT = Path('/tmp/browser/launcher')
async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        for width,height in [(390,844),(320,740),(767,1024),(1280,1800)]:
            page = await browser.new_page(viewport={'width':width,'height':height})
            errors = []
            page.on('pageerror',lambda e: errors.append(str(e)))
            await page.route('http://localhost:8080/**',lambda r:r.fulfill(content_type='text/html',body=HTML) if r.request.resource_type=='document' else r.continue_())
            await page.goto('http://localhost:8080/')
            if width >= 768:
                await expect(page.get_by_role('navigation',name='Điều hướng chính')).to_be_visible()
                await expect(page.get_by_test_id('mobile-launcher')).not_to_be_visible()
            else:
                await expect(page.get_by_test_id('mobile-launcher')).to_be_visible()
                await expect(page.get_by_role('button',name='Showroom')).to_be_disabled()
                await page.get_by_role('link',name='Kinh doanh',exact=True).click()
                await page.get_by_role('button',name='Tùy chọn Quản lý 3K').click()
                await page.get_by_role('menuitem',name='Ghim trang chủ').click()
                await page.go_back()
                quick = page.get_by_role('region',name='Truy cập nhanh')
                await expect(quick.get_by_role('link',name='Quản lý 3K')).to_be_visible()
                await page.reload()
                quick = page.get_by_role('region',name='Truy cập nhanh')
                await expect(quick.get_by_role('link',name='Quản lý 3K')).to_be_visible()
                await quick.get_by_role('link',name='Quản lý 3K').click()
                await expect(page).to_have_url('http://localhost:8080/biz/3k')
                await page.go_back()
                await page.get_by_role('link',name='Hành Chính & Nhân Sự').click()
                await page.get_by_role('button',name='Tùy chọn Nghỉ phép & Đi sớm muộn').click()
                await page.get_by_role('menuitem',name='Ghim trang chủ').click()
                await page.go_back()
                await page.get_by_role('button',name='Tùy chọn Nghỉ phép & Đi sớm muộn').click()
                await page.get_by_role('menuitem',name='Đưa lên trước').click()
                quick = page.get_by_role('region',name='Truy cập nhanh')
                assert await quick.get_by_role('link').first.get_attribute('href') == '/leave'
                await page.get_by_role('button',name='Tùy chọn Nghỉ phép & Đi sớm muộn').click()
                await page.get_by_role('menuitem',name='Bỏ ghim').click()
                await expect(quick.get_by_role('link',name='Nghỉ phép & Đi sớm muộn')).to_have_count(0)
                search = page.get_by_role('textbox',name='Tìm chức năng trong Base')
                await search.fill('nghi phep')
                await expect(page.get_by_role('link',name='Nghỉ phép & Đi sớm muộn')).to_be_visible()
                await search.fill('bao cao tin hieu')
                await expect(page.get_by_role('link',name='Báo cáo tín hiệu')).to_have_count(0)
                await search.fill('')
                await page.get_by_role('button',name='Thu hồi 3K').click()
                await expect(quick.get_by_role('link',name='Quản lý 3K')).to_have_count(0)
                await search.fill('3k')
                await expect(page.get_by_role('link',name='Quản lý 3K')).to_have_count(0)
                await search.fill('')
                await page.screenshot(path=str(OUT/f'{width}-home.png'))
                assert not await page.evaluate('document.documentElement.scrollWidth > innerWidth')
            assert not errors, errors
            print(f'PASS {width}: permissions/search/pins/reorder/reload/revoke/navigation/overflow')
            await page.close()
        await browser.close()
asyncio.run(main())