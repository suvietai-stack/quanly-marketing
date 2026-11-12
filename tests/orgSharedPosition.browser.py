import asyncio,json,os
from pathlib import Path
from playwright.async_api import async_playwright,expect
OUT=Path('/tmp/browser/org-repair')
HTML='''<div id="root"></div><script type="module">import RefreshRuntime from "/@react-refresh";RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;</script><script type="module" src="/tests/orgSharedPosition.browser.tsx"></script>'''
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(headless=True)
  for width in [1280,1024,390]:
   page=await b.new_page(viewport={'width':width,'height':1800});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   await page.route('**/org-fixture',lambda r:r.fulfill(content_type='text/html',body=HTML))
   await page.route('**/rest/v1/**',lambda r:r.fulfill(content_type='application/json',body='[]'));await page.route('**/_serverFn/**',lambda r:r.abort())
   await page.goto('http://localhost:8080/org-fixture');await expect(page.get_by_role('button',name='Thao tác Nhân viên Marketing',exact=True)).to_have_count(1)
   for name in ['Ngọc','Mai Loan','Nhân sự thứ ba']:await expect(page.get_by_role('button',name=name,exact=True)).to_be_visible()
   await expect(page.get_by_text('Chưa bổ nhiệm',exact=True)).to_be_visible();assert 'UUID-' not in await page.locator('body').inner_text()
   await page.get_by_role('button',name='Thao tác Nhân viên Marketing',exact=True).click();await page.get_by_role('menuitem',name='Bổ nhiệm / Thêm nhân sự').click();assert json.loads(await page.locator('body').get_attribute('data-assigned'))=={'unitId':'m','titleId':'staff'}
   await expect(page.get_by_role('checkbox',name='Chọn Ngọc a',exact=True)).to_be_disabled();await page.get_by_role('checkbox',name='Chọn Người mới new',exact=True).check();await page.get_by_role('button',name='Xem trước',exact=True).click();await page.get_by_role('button',name='Xác nhận bổ nhiệm',exact=True).click();await expect(page.get_by_text('Đã lưu phân công và làm mới sơ đồ.',exact=True)).to_be_visible();await page.get_by_role('button',name='Đóng',exact=True).click();await expect(page.get_by_role('button',name='Người mới',exact=True)).to_be_visible()
   await page.screenshot(path=str(OUT/f'chart-{width}.png'));assert not errors,errors
   print('PASS fixture',width,'one title / three holders / title-only assign');await page.close()
  context=await b.new_context(viewport={'width':1280,'height':1800});page=await context.new_page()
  cookies=json.loads(os.environ.get('LOVABLE_BROWSER_SUPABASE_COOKIES_JSON') or '[]')
  if cookies:await context.add_cookies([{**c,'url':'http://localhost:8080'} for c in cookies])
  # Block known automatic write endpoints; organization reads only.
  await page.route('**/rest/v1/rpc/**',lambda r:r.abort() if any(k in r.request.url for k in ['heartbeat','claim','celebration','org_change']) else r.continue_())
  await page.goto('http://localhost:8080');await page.evaluate('([k,v])=>localStorage.setItem(k,v)',[os.environ['LOVABLE_BROWSER_SUPABASE_STORAGE_KEY'],os.environ['LOVABLE_BROWSER_SUPABASE_SESSION_JSON']]);await page.goto('http://localhost:8080/organization');await expect(page.get_by_placeholder('Tìm nhân sự, đơn vị, chức danh…')).to_be_visible(timeout=90000)
  await page.get_by_placeholder('Tìm nhân sự, đơn vị, chức danh…').fill('Phòng Marketing')
  expand=page.get_by_role('button',name='Mở rộng Phòng Marketing',exact=True)
  if await expand.count():await expand.click()
  await page.get_by_placeholder('Tìm nhân sự, đơn vị, chức danh…').fill('')
  await page.screenshot(path=str(OUT/'live-before.png'))
  await expect(page.get_by_role('button',name='Thao tác Nhân viên Marketing',exact=True)).to_have_count(1)
  await page.screenshot(path=str(OUT/'live-admin.png'));print('PASS authorized Preview read-only chart; one Marketing title');await b.close()
asyncio.run(main())
