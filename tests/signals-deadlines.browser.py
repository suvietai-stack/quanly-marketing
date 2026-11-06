import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright,expect
HTML='''<div id="root"></div><script type="module">import RefreshRuntime from "/@react-refresh";RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;</script><script type="module" src="/tests/signals.browser.tsx"></script>'''
OUT=Path('/tmp/browser/deadline-filters');UID='00000000-0000-0000-0000-000000000001'
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  for width,height in [(320,740),(390,844),(430,932),(1280,1800)]:
   page=await browser.new_page(viewport={'width':width,'height':height});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   rows=[dict(id=f'00000000-0000-0000-0000-{i:012d}',customer_name=f'Khách hạn {i}',phone='0901234567',detected_on='2026-11-06',products=[],need_groups=[],source='Website',status='quoted' if i==3 else 'consulting',potential='high',assigned_to=UID,created_by=UID,created_at='2026-11-06T01:00:00Z',updated_at='2026-11-06T01:00:00Z',next_contact_on=None,cancelled_at=None) for i in range(4,8)]
   labels=[dict(id=f'00000000-0000-0000-0001-{i:012d}',name=f'Nhãn khách {i}',owner_id=None,active=True) for i in range(20)]
   async def backend(r):
    path=r.request.url.split('/rest/v1/')[-1].split('?')[0];data=[]
    if path=='opportunity_signals':data=rows
    elif path=='signal_labels':data=labels
    elif path=='rpc/signal_progression_deadlines':data=[dict(signal_id=s['id'],deadline_state=state,due_on='2026-11-06',next_due_on='2026-11-13',sale_id=UID,sequence=1,overdue_days=1,calculated_at='2026-11-06T08:00:00Z') for s,state in zip(rows,['today','soon','overdue','updated'])]
    await r.fulfill(content_type='application/json',body=json.dumps(data))
   await page.route('**/deadline-fixture*',lambda r:r.fulfill(content_type='text/html',body=HTML));await page.route('**/rest/v1/**',backend);await page.route('**/_serverFn/**',lambda r:r.fulfill(content_type='application/json',body='{}'))
   await page.goto('http://localhost:8080/deadline-fixture')
   bar=page.locator('section[aria-label="Hạn cập nhật diễn biến"]:visible')
   await expect(bar.get_by_role('button',name='Hôm nay (1)',exact=True)).to_be_visible()
   for label in ['Hôm nay','Sắp đến hạn','Quá hạn']:
    await bar.get_by_role('button',name=f'{label} (1)',exact=True).click()
    await expect(page.get_by_role('button',name='Mở chi tiết tín hiệu: Khách hạn',exact=False)).to_have_count(1)
    for other in ['Hôm nay','Sắp đến hạn','Quá hạn']:await expect(bar.get_by_role('button',name=f'{other} (1)',exact=True)).to_be_attached()
   await bar.get_by_role('button',name='Quá hạn (1)',exact=True).click()
   await expect(bar.get_by_role('button',name='Tất cả (4)',exact=True)).to_have_attribute('aria-pressed','true')
   await page.get_by_placeholder('Tìm khách hàng hoặc SĐT').fill('Khách hạn 4')
   await expect(bar.get_by_role('button',name='Tất cả (1)',exact=True)).to_be_visible()
   await expect(bar.get_by_role('button',name='Sắp đến hạn (0)',exact=True)).to_be_attached()
   await page.get_by_placeholder('Tìm khách hàng hoặc SĐT').fill('')
   await page.screenshot(path=str(OUT/f'{width}-list.png'))
   assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth')
   await page.get_by_role('button',name='Mở chi tiết tín hiệu: Khách hạn 4',exact=True).first.click()
   await page.get_by_role('button',name='Đánh giá cơ hội',exact=True).click()
   d=page.get_by_role('dialog',name='Đánh giá cơ hội',exact=True)
   await d.get_by_role('checkbox',name='Nhãn khách 1',exact=True).click()
   await d.get_by_label('Tìm nhãn tín hiệu').fill('khách 19')
   await d.get_by_role('checkbox',name='Nhãn khách 19',exact=True).click()
   await expect(d.get_by_role('button',name='Bỏ nhãn Nhãn khách 1',exact=True)).to_be_visible()
   await d.get_by_label('Tìm nhãn tín hiệu').fill('')
   await expect(d.get_by_role('checkbox',name='Nhãn khách 1',exact=True)).to_have_attribute('aria-checked','true')
   await d.get_by_label('Tìm nhãn tín hiệu').blur();await page.wait_for_timeout(300)
   await page.screenshot(path=str(OUT/f'{width}-labels.png'))
   save=await d.get_by_role('button',name='Lưu đánh giá',exact=True).bounding_box()
   assert save and save['y']+save['height']<=height
   assert not errors,errors
   print('PASS',width,'deadline counts independent/search/toggle/labels-search/preserved-selection/save-visible')
   await page.close()
  await browser.close()
asyncio.run(main())
