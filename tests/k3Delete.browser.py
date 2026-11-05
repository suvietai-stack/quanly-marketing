"""Real Radix menu/dialog regression with intercepted RPC; no live user records modified.
Run: python3 tests/k3Delete.browser.py
"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright, expect

HTML = '''<div id="root"></div><script type="module">import RefreshRuntime from "/@react-refresh";RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;</script><script type="module" src="/tests/k3Delete.browser.tsx"></script>'''
OUT = Path('/tmp/browser/k3-delete')

async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        for width, height in [(1280,1800),(390,844)]:
            for label in ['Ngày','KG','KF']:
                page = await browser.new_page(viewport={'width':width,'height':height})
                errors = []
                calls = []
                release = asyncio.Event()
                fail = True
                page.on('pageerror', lambda e: errors.append(str(e)))
                await page.route('**/k3-delete-fixture', lambda r:r.fulfill(content_type='text/html',body=HTML))
                await page.route('**/rest/v1/rpc/k3_deletable', lambda r:r.fulfill(content_type='application/json',body='{"ok":true}'))
                async def delete(route):
                    nonlocal fail
                    calls.append(route.request.post_data_json)
                    await release.wait()
                    if fail:
                        fail = False
                        await route.fulfill(status=400,content_type='application/json',body='{"message":"Bạn không có quyền xóa công việc."}')
                    else:
                        await route.fulfill(content_type='application/json',body='{"ok":true}')
                await page.route('**/rest/v1/rpc/k3_soft_delete', delete)
                page.on('console',lambda m: print(m.text) if m.type=='error' else None)
                await page.goto('http://localhost:8080/k3-delete-fixture')
                async def open_delete():
                    await page.get_by_role('button',name=f'Menu {label}',exact=True).click()
                    await page.get_by_role('menuitem',name='Xóa',exact=True).click()
                    await expect(page.get_by_role('alertdialog')).to_be_visible()
                    await expect(page.get_by_role('menu')).to_have_count(0)
                await open_delete()
                await page.evaluate('window.k3Test.refetch()')
                await page.get_by_role('alertdialog').dispatch_event('blur')
                await expect(page.get_by_role('alertdialog')).to_be_visible()
                await page.get_by_role('button',name='Quay lại',exact=True).click()
                await expect(page.get_by_role('alertdialog')).to_have_count(0)
                assert len(calls)==0
                await open_delete()
                await page.get_by_role('button',name='Xóa',exact=True).click()
                await expect(page.get_by_role('button',name='Đang xóa…')).to_be_disabled()
                await page.get_by_role('button',name='Đang xóa…').evaluate('(el)=>{el.click();el.click()}')
                await page.keyboard.press('Escape')
                await expect(page.get_by_role('alertdialog')).to_be_visible()
                release.set()
                await expect(page.get_by_role('alert')).to_contain_text('Bạn không có quyền')
                assert len(calls)==1
                assert calls[0]=={'_kind':'action' if label=='KF' else 'goal','_id':'action-456' if label=='KF' else 'goal-123'}
                await page.get_by_role('alertdialog').screenshot(path=str(OUT/f'{width}-{label}-error.png'))
                await page.get_by_role('button',name='Xóa',exact=True).click()
                await expect(page.get_by_text('Đã xóa khỏi danh sách',exact=True)).to_be_visible()
                await expect(page.get_by_role('alertdialog')).to_have_count(0)
                assert len(calls)==2
                assert not errors, errors
                assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth')
                print(f'PASS {width}px {label}: stable after menu/refetch/blur, cancel, one request, error retained, retry succeeds')
                await page.close()
        await browser.close()

asyncio.run(main())