import asyncio,json
from pathlib import Path
from urllib.parse import urlparse
from playwright.async_api import async_playwright,expect
OUT=Path('/tmp/browser/signals-load')
HTML='''<div id="root"></div><script type="module">import RefreshRuntime from "/@react-refresh";RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;</script><script type="module" src="/tests/signals.browser.tsx"></script>'''
UID='00000000-0000-0000-0000-000000000001'
ROW=dict(id='00000000-0000-0000-0001-000000000001',customer_name='Khách kiểm tra',phone='0901234567',detected_on='2026-11-09',products=[],need_groups=[],source='Website',status='consulting',assigned_to=UID,created_by=UID,created_at='2026-11-01T01:00:00Z',updated_at='2026-11-09T01:00:00Z',cancelled_at=None,note_count=0,last_note=None)
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  for width in [390,1280]:
   for mode in ['counts-error','page-error','timeout']:
    page=await browser.new_page(viewport={'width':width,'height':1800});calls=[];errors=[];retry=False
    page.on('pageerror',lambda e:errors.append(str(e)))
    async def backend(route):
     path=urlparse(route.request.url).path.split('/rest/v1/')[-1];calls.append(path)
     if path=='rpc/signal_list_page':
      if mode=='timeout' and not retry:await asyncio.sleep(16)
      if mode=='page-error' and not retry:return await route.fulfill(status=500,content_type='application/json',body=json.dumps({'message':'Lỗi đọc danh sách','code':'57014'}))
      data={'rows':[ROW]}
     elif path=='rpc/signal_list_counts':
      if mode=='counts-error' and not retry:return await route.fulfill(status=500,content_type='application/json',body=json.dumps({'message':'Lỗi thống kê','code':'57014'}))
      data=dict(total=1,status={'all':1,'consulting':1},needs={'all':1},sales=[UID],creators=[UID],mine={'waiting':0,'active':1,'quoted':0,'won':0})
     elif path=='rpc/signal_change_token':data='token'
     else:data=[]
     try:await route.fulfill(content_type='application/json',body=json.dumps(data))
     except Exception:pass
    await page.route('**/*load-fixture*',lambda r:r.fulfill(content_type='text/html',body=HTML));await page.route('**/rest/v1/**',backend);await page.route('**/_serverFn/**',lambda r:r.fulfill(content_type='application/json',body='{}'))
    await page.goto('http://localhost:8080/load-fixture')
    if mode=='counts-error':
     await expect(page.get_by_role('button',name='Mở chi tiết tín hiệu: Khách kiểm tra',exact=True).first).to_be_visible()
     await expect(page.get_by_role('alert')).to_contain_text('Không tải được số liệu thống kê')
     button=page.get_by_role('button',name='Thử tải lại số liệu',exact=True)
    else:
     await expect(page.get_by_role('button',name='Thử tải lại',exact=True)).to_be_visible(timeout=20000)
     assert not await page.get_by_text('Không có tín hiệu phù hợp.',exact=True).count()
     button=page.get_by_role('button',name='Thử tải lại',exact=True)
    await page.screenshot(path=str(OUT/f'{width}-{mode}.png'))
    await page.wait_for_timeout(700)
    assert calls.count('rpc/signal_list_page')==1,calls
    assert calls.count('rpc/signal_list_counts')==1,calls
    retry=True;await button.click()
    await expect(page.get_by_role('button',name='Mở chi tiết tín hiệu: Khách kiểm tra',exact=True).first).to_be_visible()
    assert not errors,errors
    assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth')
    print('PASS',width,mode,'independent errors/bounded read/no retry loop/manual recovery')
    await page.close()
  page=await browser.new_page(viewport={'width':1280,'height':1800})
  await page.goto('https://base.suviet.vn/signals',wait_until='domcontentloaded')
  await page.wait_for_timeout(2000)
  print('Publish signed-out final path:',urlparse(page.url).path)
  await page.screenshot(path=str(OUT/'publish-signed-out.png'))
  await browser.close()
asyncio.run(main())
