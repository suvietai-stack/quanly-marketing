import asyncio,json
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from playwright.async_api import async_playwright,expect
OUT=Path('/tmp/browser/signals-voluntary'); UID='00000000-0000-0000-0000-000000000001'
HTML='''<div id="root"></div><script type="module">import RefreshRuntime from "/@react-refresh";RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;</script><script type="module" src="/tests/signals.browser.tsx"></script>'''
def row(i):return dict(id=f'00000000-0000-0000-0001-{i:012d}',customer_name=f'Khách {i}',phone='0901234567',detected_on='2026-11-09',products=[],need_groups=[],source='Website',status='waiting' if i==1 else 'consulting',assigned_to=UID,created_by=UID,assigned_at='2026-11-01T01:00:00Z',created_at='2026-11-01T01:00:00Z',updated_at='2026-11-09T01:00:00Z',next_contact_on=None,cancelled_at=None,note_count=0,last_note=None)
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  for width in [390,1280]:
   page=await browser.new_page(viewport={'width':width,'height':1800});errors=[];requests=[];notes=[];saved=[];rows=[row(i) for i in range(1,601)]
   page.on('pageerror',lambda e:errors.append(str(e)))
   async def backend(route):
    path=urlparse(route.request.url).path.split('/rest/v1/')[-1];requests.append(path);data=[];payload=route.request.post_data_json if route.request.method=='POST' else {}
    if path=='rpc/signal_list_page':
     f=payload['_filter'];items=[r for r in rows if (not f.get('q') or f['q'].lower() in r['customer_name'].lower()) and (f.get('quick','all')=='all' or r['status']==f['quick'])];data={'rows':items[payload['_offset']:payload['_offset']+payload['_limit']]}
    elif path=='rpc/signal_list_counts':
     f=payload['_filter'];items=[r for r in rows if not f.get('q') or f['q'].lower() in r['customer_name'].lower()];data=dict(total=len([r for r in items if f.get('quick','all')=='all' or r['status']==f['quick']]),status={'all':len(items),'waiting':sum(r['status']=='waiting' for r in items),'consulting':sum(r['status']=='consulting' for r in items)},needs={'all':len(items)},sales=[UID],creators=[UID],mine={'waiting':1,'active':599,'quoted':0,'won':0})
    elif path=='rpc/signal_change_token':data='token'
    elif path=='opportunity_signals':
     eq=parse_qs(urlparse(route.request.url).query).get('id',[''])[0].replace('eq.','');data=next((r for r in rows if r['id']==eq),rows[1])
    elif path=='opportunity_signal_notes':data=notes
    elif path=='rpc/signal_note_count':data=len(notes)
    elif path=='rpc/signal_note_save':
     saved.append(payload);n={'id':'note-1','signal_id':payload['_id'],'author_id':UID,'note':payload['_note'],'created_at':'2026-11-09T02:00:00Z','is_progression':True,'status_from':'consulting','status_to':'consulting'};notes.append(n);data='note-1'
    elif path=='rpc/signal_sales_report':data=dict(summary={'total':600,'unassigned':0,'accepted':599,'waiting':1,'contacting':0,'consulting':599,'quoted':0,'deposit':0,'won':0,'lost':0,'revenue':0,'closeRate':0},groups=[],trend=[],accepts=[],lost=[],stages=[],sales=[UID],creators=[UID])
    elif path=='rpc/signal_note_report':data=dict(total=600,zero=598,noted=2,notes=13,distribution=[{'n':0,'signals':598},{'n':1,'signals':1},{'n':12,'signals':1}],portfolio=[],activity=[],trend=[],firsts=[])
    await route.fulfill(content_type='application/json',body=json.dumps(data))
   await page.route('**/*voluntary-fixture*',lambda r:r.fulfill(content_type='text/html',body=HTML));await page.route('**/rest/v1/**',backend);await page.route('**/_serverFn/**',lambda r:r.fulfill(content_type='application/json',body='{}'))
   await page.goto('http://localhost:8080/voluntary-fixture');await expect(page.get_by_role('button',name='Mở chi tiết tín hiệu: Khách 1',exact=True).first).to_be_visible()
   await page.screenshot(path=str(OUT/f'{width}-list.png'))
   assert 'rpc/signal_progression_deadlines' not in requests and 'opportunity_signal_notes' not in requests
   assert requests.count('rpc/signal_list_page')==1,requests
   if width>=768:
    await expect(page.locator('tbody tr')).to_have_count(40);await page.get_by_role('button',name='Sau',exact=True).click();await expect(page.locator('tbody tr')).to_have_count(40)
   else:
    await expect(page.get_by_role('article',name='Tín hiệu:',exact=False)).to_have_count(30)
   search=page.get_by_label('Tìm tín hiệu');before=requests.count('rpc/signal_list_page');await search.fill('Khách');await search.fill('Khách 2');await page.wait_for_timeout(500);assert requests.count('rpc/signal_list_page')-before<=2
   await page.get_by_role('button',name='Mở chi tiết tín hiệu: Khách 2',exact=True).first.click();await page.get_by_role('button',name='Cập nhật diễn biến',exact=True).click();await page.get_by_label('Nội dung diễn biến').fill('Khách đã nhận báo giá');await page.get_by_role('button',name='Lưu',exact=True).click();await expect(page.get_by_label('Nội dung diễn biến')).to_have_count(0);await expect(page.get_by_text('Khách đã nhận báo giá',exact=True).first).to_be_visible();print('save count',len(saved));assert len(saved)==1;await page.screenshot(path=str(OUT/f'{width}-note.png'))
   assert not errors,errors
   assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth')
   await page.goto('http://localhost:8080/report-voluntary-fixture');await expect(page.get_by_role('heading',name='Thống kê cập nhật diễn biến')).to_be_visible();await page.screenshot(path=str(OUT/f'{width}-report.png'));assert not errors,errors
   print('PASS',width,'paged list/debounce/note save-read/report/no deadline calls');await page.close()
  await browser.close()
asyncio.run(main())
