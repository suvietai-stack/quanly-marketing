"""Real list UI with isolated records and priority read surface; no hosted writes."""
import asyncio, json, sys
from pathlib import Path
from playwright.async_api import async_playwright, expect
sys.path.insert(0,str(Path(__file__).parent))
from signals_mock import make_backend,UID
HTML='''<div id="root"></div><script type="module">import RefreshRuntime from "/@react-refresh";RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;</script><script type="module" src="/tests/signals.browser.tsx"></script>'''
OUT=Path('/tmp/browser/signals-priority')
def row(i,status='consulting',**extra):
  return dict(id=f'00000000-0000-0000-0001-{i:012d}',customer_name=f'Khách {i}',phone='0901234567',detected_on='2026-11-06',products=[],need_groups=[],source='Website',status=status,potential='unrated',assigned_to=UID,created_by=UID,created_at='2026-11-01T00:00:00Z',updated_at='2026-11-06T00:00:00Z',next_contact_on=None,cancelled_at=None,**extra)
async def main():
 OUT.mkdir(parents=True,exist_ok=True)
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  for width in [320,390,430,1280]:
   for sale in [False,True]:
    page=await browser.new_page(viewport={'width':width,'height':1000 if width<768 else 1800})
    errors=[]; page_calls=[]; page.on('pageerror',lambda e:errors.append(str(e)))
    rows=[row(i,list_work_priority=2 if i<=306 else 3 if i<=310 else 4 if i<=314 else 5) for i in range(1,572)]+[row(600,'waiting',list_wait_since='2026-11-05T00:00:00Z'),row(601,'waiting',list_wait_since='2026-11-02T00:00:00Z')]+[row(i,None) for i in range(602,606)]+[row(606,'won'),row(607,'lost')]
    for s in rows:
     if s['status'] is None:s['assigned_to']=None
    if sale: rows=[s for s in rows if s['assigned_to']==UID]
    def rpc(path,payload):
     if path=='rpc/signal_progression_report':return {'total':{},'sales':[],'activated_at':None,'calculated_at':'2026-11-06T08:00:00Z'}
     return []
    backend=make_backend(rows,rpc=rpc)
    async def tracked(r):
     if 'rpc/signal_list_page' in r.request.url:page_calls.append(r.request.post_data_json)
     await backend(r)
    await page.route('**/*priority-fixture*',lambda r:r.fulfill(content_type='text/html',body=HTML))
    await page.route('**/rest/v1/**',tracked)
    await page.route('**/_serverFn/**',lambda r:r.fulfill(content_type='application/json',body='{}'))
    await page.goto('http://localhost:8080/'+('sale-priority-fixture' if sale else 'priority-fixture'))
    quick=page.get_by_role('group',name='Trạng thái tín hiệu') if width<768 else page.get_by_text('Trạng thái',exact=True).locator('..')
    names=page.get_by_role('button',name='Mở chi tiết tín hiệu:',exact=False)
    if width>=768:names=page.locator('table').get_by_role('button',name='Mở chi tiết tín hiệu:',exact=False)
    await expect(names.first).to_have_attribute('aria-label','Mở chi tiết tín hiệu: Khách '+('601' if sale else '602'))
    await expect(names.nth(1 if sale else 5)).to_have_attribute('aria-label','Mở chi tiết tín hiệu: Khách 600')
    expected=[601,600,1] if sale else [602,603,604,605,601,600,1]
    assert [await names.nth(i).get_attribute('aria-label') for i in range(len(expected))]==[f'Mở chi tiết tín hiệu: Khách {i}' for i in expected]
    await page.screenshot(path=str(OUT/f'{width}-{sale}-default.png'))
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
     dialog=page.get_by_role('dialog',name='Bộ lọc');await expect(dialog).to_be_visible();await page.wait_for_timeout(300);await dialog.get_by_text('Sắp xếp',exact=True).locator('..').locator('select').select_option('newest')
     await dialog.get_by_role('button',name='Áp dụng',exact=True).click()
    else:await page.get_by_label('Sắp xếp tín hiệu').select_option('newest')
    await expect(names.first).to_have_attribute('aria-label','Mở chi tiết tín hiệu: Khách 1')
    await page.reload();await expect(names.first).to_have_attribute('aria-label','Mở chi tiết tín hiệu: Khách 1')
    if width<768:
     await page.get_by_role('button',name='Bộ lọc',exact=True).click()
     dialog=page.get_by_role('dialog',name='Bộ lọc');await expect(dialog).to_be_visible();await page.wait_for_timeout(300);await dialog.get_by_text('Sắp xếp',exact=True).locator('..').locator('select').select_option('work')
     await dialog.get_by_role('button',name='Áp dụng',exact=True).click()
    else:await page.get_by_label('Sắp xếp tín hiệu').select_option('work')
    await expect(names.first).to_have_attribute('aria-label',f'Mở chi tiết tín hiệu: Khách {expected[0]}')
    await page.reload();await expect(names.first).to_have_attribute('aria-label',f'Mở chi tiết tín hiệu: Khách {expected[0]}')
    assert page_calls and page_calls[0]['_sort']=='work'
    assert any(c['_sort']=='newest' for c in page_calls) and page_calls[-1]['_sort']=='work'
    assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth')
    await page.screenshot(path=str(OUT/f'{width}-{sale}.png'))
    assert not errors,errors
    print('PASS',width,'Sale' if sale else 'Manager','priority/tab/count/search/override/reload/paged-query')
    await page.close()
  await browser.close()
asyncio.run(main())
