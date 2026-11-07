"""Real list UI with isolated records and priority read surface; no hosted writes."""
import asyncio, json
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from playwright.async_api import async_playwright, expect
HTML='''<div id="root"></div><script type="module">import RefreshRuntime from "/@react-refresh";RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;</script><script type="module" src="/tests/signals.browser.tsx"></script>'''
UID='00000000-0000-0000-0000-000000000001'
OUT=Path('/tmp/browser/signals-priority')
def row(i,status='consulting',**extra):
 return dict(id=f'00000000-0000-0000-0001-{i:012d}',customer_name=f'Khách {i}',phone='0901234567',detected_on='2026-11-06',products=[],need_groups=[],source='Website',status=status,assigned_to=UID,created_by=UID,created_at='2026-11-01T00:00:00Z',updated_at='2026-11-06T00:00:00Z',next_contact_on=None,cancelled_at=None,**extra)
async def main():
 OUT.mkdir(parents=True,exist_ok=True)
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  for width in [320,390,430,1280]:
   for sale in [False,True]:
    page=await browser.new_page(viewport={'width':width,'height':1000 if width<768 else 1800})
    errors=[]; requests=[]; page.on('pageerror',lambda e:errors.append(str(e)))
    rows=[row(i) for i in range(1,575)]+[row(600,'waiting',list_wait_since='2026-11-05T00:00:00Z'),row(601,'waiting',list_wait_since='2026-11-02T00:00:00Z'),row(602,None),row(603,'won'),row(604,'lost')]
    rows[-3]['assigned_to']=None
    if sale: rows=[s for s in rows if s['assigned_to']==UID]
    async def backend(r):
     path=urlparse(r.request.url).path.split('/rest/v1/')[-1];data=[]
     if path=='signal_list_priority':
      requests.append(parse_qs(urlparse(r.request.url).query))
      data=sorted(rows,key=lambda s:(0 if not s['assigned_to'] else 1 if s['status']=='waiting' else 3 if s['status'] in ['won','lost'] else 2,s.get('list_wait_since',''),s['id']))
     elif path=='opportunity_signals':data=rows
     await r.fulfill(content_type='application/json',body=json.dumps(data))
    await page.route('**/*priority-fixture*',lambda r:r.fulfill(content_type='text/html',body=HTML))
    await page.route('**/rest/v1/**',backend)
    await page.route('**/_serverFn/**',lambda r:r.fulfill(content_type='application/json',body='{}'))
    await page.goto('http://localhost:8080/'+('sale-priority-fixture' if sale else 'priority-fixture'))
    print('DEBUG',requests, await page.evaluate('sessionStorage.getItem("sig:filters:'+UID+'")'))
    quick=page.get_by_role('group',name='Trạng thái tín hiệu') if width<768 else page.locator('.hidden.md\\:block').filter(has=page.get_by_text('Nhóm nhu cầu',exact=True))
    names=page.get_by_role('button',name='Mở chi tiết tín hiệu:',exact=False)
    if width>=768:names=page.locator('table').get_by_role('button',name='Mở chi tiết tín hiệu:',exact=False)
    await expect(names.first).to_have_attribute('aria-label','Mở chi tiết tín hiệu: Khách '+('601' if sale else '602'))
    await expect(names.nth(1 if sale else 2)).to_have_attribute('aria-label','Mở chi tiết tín hiệu: Khách 600')
    buttons=await quick.get_by_role('button').all_text_contents()
    assert buttons[0].startswith('Tất cả')
    assert buttons[1].startswith('Chờ nhận' if sale else 'Chờ phân công')
    if not sale: assert buttons[2].startswith('Chờ nhận')
    await quick.get_by_role('button',name='Chờ nhận 2',exact=True).click()
    await expect(names).to_have_count(2)
    await expect(names.first).to_have_attribute('aria-label','Mở chi tiết tín hiệu: Khách 601')
    search=page.get_by_label('Tìm tín hiệu');await search.fill('Khách 600')
    await expect(names).to_have_count(1)
    await expect(quick.get_by_role('button',name='Chờ nhận 1',exact=True)).to_be_attached()
    await search.fill('');await quick.get_by_role('button',name='Tất cả '+str(len(rows)),exact=True).click()
    if width<768:
     await page.get_by_role('button',name='Bộ lọc',exact=True).click()
     dialog=page.get_by_role('dialog',name='Bộ lọc');await dialog.get_by_text('Sắp xếp',exact=True).locator('..').locator('select').select_option('newest')
     await dialog.get_by_role('button',name='Áp dụng',exact=True).click()
    else:await page.get_by_label('Sắp xếp tín hiệu').select_option('newest')
    await expect(names.first).to_have_attribute('aria-label','Mở chi tiết tín hiệu: Khách 1')
    await page.reload();await expect(names.first).to_have_attribute('aria-label','Mở chi tiết tín hiệu: Khách 1')
    assert requests and requests[0]['order'][0].startswith('list_priority.asc,list_wait_since.asc.nullslast')
    assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth')
    await page.screenshot(path=str(OUT/f'{width}-{sale}.png'))
    assert not errors,errors
    print('PASS',width,'Sale' if sale else 'Manager','priority/tab/count/search/override/reload/read-query')
    await page.close()
  await browser.close()
asyncio.run(main())