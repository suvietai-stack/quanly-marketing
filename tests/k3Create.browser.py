"""Real creation modal, intercepted writes only; no production test data."""
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright,expect
HTML='''<div id="root"></div><script type="module">import RefreshRuntime from "/@react-refresh";RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;</script><script type="module" src="/tests/k3Create.browser.tsx"></script>'''
OUT=Path('/tmp/browser/k3-create-p0')
async def main():
 OUT.mkdir(parents=True,exist_ok=True)
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  for width in [1280,1024,390]:
   for mode in ['basic','advanced']:
    page=await browser.new_page(viewport={'width':width,'height':1800});calls=[];errors=[];release=asyncio.Event()
    page.on('pageerror',lambda e:errors.append(str(e)))
    await page.route('**/k3-create-fixture',lambda r:r.fulfill(content_type='text/html',body=HTML))
    async def rpc(route):
     if route.request.url.endswith('/k3_quick_create'):
      calls.append(route.request.post_data_json['_payload']);await release.wait()
      if len(calls)==1:await route.fulfill(status=500,content_type='application/json',body=json.dumps({'code':'57014','message':'canceling statement due to statement timeout'}))
      else:await route.fulfill(content_type='application/json',body=json.dumps({'goal_id':'fixture-goal','duplicated':True}))
     else:await route.fulfill(content_type='application/json',body='[]')
    await page.route('**/rest/v1/**',rpc);await page.route('**/_serverFn/**',lambda r:r.abort())
    await page.goto('http://localhost:8080/k3-create-fixture')
    await expect(page.get_by_role('tab',name='Cơ bản',exact=True)).to_have_attribute('data-state','active')
    await page.get_by_label('Tên công việc *',exact=True).fill('Soạn báo giá')
    await page.get_by_label('Hạn hoàn thành *',exact=True).fill('2026-11-13')
    await page.get_by_role('tab',name='Nâng cao',exact=True).click()
    await expect(page.get_by_label('Mô tả chi tiết',exact=True)).to_be_visible()
    await expect(page.get_by_text('Yêu cầu bằng chứng',exact=True)).to_be_visible()
    await expect(page.get_by_text('Yêu cầu nghiệm thu',exact=True)).to_be_visible()
    await page.get_by_label('Mô tả chi tiết',exact=True).fill('Giữ mô tả khi đổi chế độ')
    await page.get_by_role('tab',name='Cơ bản',exact=True).click()
    await expect(page.get_by_label('Tên công việc *',exact=True)).to_have_value('Soạn báo giá')
    await page.get_by_role('tab',name='Nâng cao',exact=True).click()
    await expect(page.get_by_label('Mô tả chi tiết',exact=True)).to_have_value('Giữ mô tả khi đổi chế độ')
    if mode=='advanced':
     await page.get_by_role('button',name='Thêm chỉ số',exact=True).click()
     await page.get_by_role('tab',name='Cơ bản',exact=True).click()
     await expect(page.get_by_role('tab',name='Nâng cao',exact=True)).to_have_attribute('data-state','active')
     await expect(page.get_by_role('alert')).to_contain_text('không mất')
     await page.get_by_role('button',name='Có / Chưa',exact=False).last.click()
    else:await page.get_by_role('tab',name='Cơ bản',exact=True).click()
    await page.get_by_role('dialog').first.screenshot(path=str(OUT/f'{width}-{mode}.png'))
    save=page.get_by_role('button',name='Lưu công việc',exact=True)
    await save.evaluate('(el)=>{el.click();el.click();el.click()}')
    await expect(save).to_be_disabled();release.set()
    await expect(page.get_by_role('alert')).to_contain_text('thời gian')
    assert len(calls)==1,calls
    await save.click();await expect(page.get_by_text('Đã lưu công việc',exact=True)).to_be_visible()
    assert len(calls)==2 and calls[0]==calls[1],calls
    assert calls[0]['creation_mode']==mode
    assert len(calls[0]['kfs'])==1 and len(calls[0]['kfs'][0]['kpis'])==(2 if mode=='advanced' else 1)
    assert not errors,errors
    assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth')
    print('PASS',width,mode,'state/mode/no-loss/one-submit/timeout retry identity');await page.close()
  await browser.close()
asyncio.run(main())