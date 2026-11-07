"""Regression: real launcher, delayed visibility, local preferences only."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright, expect

HTML = '''<div id="root"></div><script type="module">import RefreshRuntime from "/@react-refresh";RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;</script><script type="module" src="/tests/launcher.browser.tsx"></script>'''
KEY = 'base-launcher-pins:launcher-fixture'
PINS = ['/biz/crm', '/biz/3k', '/biz/approvals', '/leave']
OUT = Path('/tmp/browser/launcher-permissions')

async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        for width in [320, 390, 767]:
            page = await browser.new_page(viewport={'width': width, 'height': 1000})
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            await page.route('http://localhost:8080/**', lambda r: r.fulfill(content_type='text/html', body=HTML) if r.request.resource_type == 'document' else r.continue_())
            await page.goto('http://localhost:8080/')
            await expect(page.get_by_test_id('mobile-launcher')).to_be_visible()
            await page.evaluate('([key,pins]) => localStorage.setItem(key, JSON.stringify(pins))', [KEY, PINS])
            await page.goto('http://localhost:8080/?pending=1')
            quick = page.get_by_role('region', name='Truy cập nhanh')
            await expect(quick.get_by_role('link', name='Nghỉ phép & Đi sớm muộn')).to_be_visible()
            await expect(quick.get_by_role('link', name='CRM Khách Hàng')).to_have_count(0)
            assert await page.evaluate('(key) => JSON.parse(localStorage.getItem(key))', KEY) == PINS, 'initial loading erased pins'
            await page.evaluate("window.dispatchEvent(new CustomEvent('fixture-access-pending', {detail:false}))")
            await expect(quick.get_by_role('link', name='CRM Khách Hàng')).to_be_visible()
            await expect(quick.get_by_role('link', name='Phê duyệt', exact=True)).to_be_visible()
            for event, label in [('fixture-access-pending', 'CRM Khách Hàng'), ('fixture-approvals-pending', 'Phê duyệt')]:
                await page.evaluate('(event) => window.dispatchEvent(new CustomEvent(event, {detail:true}))', event)
                await expect(quick.get_by_role('link', name=label, exact=True)).to_have_count(0)
                await expect(quick.get_by_role('button', name='Tùy chỉnh')).to_be_disabled()
                assert await page.evaluate('(key) => JSON.parse(localStorage.getItem(key))', KEY) == PINS, 'refresh erased pins'
                await page.evaluate('(event) => window.dispatchEvent(new CustomEvent(event, {detail:false}))', event)
                await expect(quick.get_by_role('link', name=label, exact=True)).to_be_visible()
            await page.reload()
            await page.evaluate("window.dispatchEvent(new CustomEvent('fixture-access-pending', {detail:false}))")
            await expect(quick.get_by_role('link', name='CRM Khách Hàng')).to_be_visible()
            assert await quick.get_by_role('link').evaluate_all('(links) => links.map(l => l.getAttribute("href"))') == PINS
            await page.get_by_role('button', name='Thu hồi 3K', exact=True).click()
            await expect(quick.get_by_role('link', name='Quản lý 3K', exact=True)).to_have_count(0)
            assert await page.evaluate('(key) => JSON.parse(localStorage.getItem(key))', KEY) == ['/biz/crm', '/biz/approvals', '/leave']
            await page.screenshot(path=str(OUT / f'{width}-restored.png'))
            assert not errors, errors
            print(f'PASS {width}: delayed access, approval loading, refresh, reload, order, true revocation')
            await page.close()
        await browser.close()

asyncio.run(main())