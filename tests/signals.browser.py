import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright,expect
HTML='''<div id="root"></div><script type="module">import RefreshRuntime from "/@react-refresh";RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;</script><script type="module" src="/tests/signals.browser.tsx"></script>'''
OUT=Path('/tmp/browser/signals');OUT.mkdir(parents=True,exist_ok=True)
UID='00000000-0000-0000-0000-000000000001';CID='00000000-0000-0000-0000-000000000004'
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  for width,height in [(320,740),(360,800),(390,844),(430,932),(1280,1800)]:
   page=await browser.new_page(viewport={'width':width,'height':height});errors=[];writes=[];fail=True
   page.on('pageerror',lambda e:errors.append(str(e)))
   signal={'id':CID,'customer_name':'Khách cách ly','phone':'0901234567','detected_on':'2026-11-06','products':['Ấm chén'],'need_group':'Sứ quà tặng','need_groups':['Sứ quà tặng'],'source':'Website','status':'consulting','potential':'unrated','assigned_to':UID,'created_by':UID,'created_at':'2026-11-06T02:00:00Z','updated_at':'2026-11-06T02:00:00Z','next_contact_on':None,'next_contact_at':None,'revenue':None,'closed_at':None,'cancelled_at':None}
   labels=[{'id':'00000000-0000-0000-0000-000000000008','owner_id':None,'name':'Khách trọng điểm','active':True},{'id':'00000000-0000-0000-0000-000000000009','owner_id':None,'name':'Cần gửi mẫu','active':True}];links=[]
   await page.route('**/signals-fixture*',lambda r:r.fulfill(content_type='text/html',body=HTML))
   async def backend(route):
    nonlocal fail
    path=route.request.url.split('/rest/v1/')[-1].split('?')[0];result=[]
    if path=='opportunity_signals':result=[signal]
    elif path=='signal_labels':result=labels
    elif path=='signal_label_links':result=links
    elif path=='catalogs':result=None
    elif path=='rpc/signal_enrichment_save':
     args=route.request.post_data_json;writes.append(args)
     if fail:
      fail=False;await route.fulfill(status=400,content_type='application/json',body=json.dumps({'message':'Chưa lưu được, thử lại'}));return
     signal['potential']=args['_potential'];signal['next_contact_on']=args['_next'];signal['next_contact_at']=args['_next_at'];signal['updated_at']='2026-11-06T08:00:00Z';links[:]=[{'signal_id':CID,'label_id':x} for x in args['_labels']];result='event'
    elif path=='rpc/signal_progression_report':result={'total':{'on_time':0,'due':0,'rate':None,'retro_on_time':0,'retro_due':0,'tracking':0,'overdue':0,'today':0,'soon':0},'sales':[],'activated_at':None,'calculated_at':'2026-11-06T08:00:00Z'}
    await route.fulfill(content_type='application/json',body=json.dumps(result))
   await page.route('**/rest/v1/**',backend)
   await page.route('**/_serverFn/**',lambda r:r.fulfill(content_type='application/json',body='{}'))
   await page.goto('http://localhost:8080/signals-fixture')
   await page.get_by_role('button',name='Mở chi tiết tín hiệu: Khách cách ly',exact=True).first.click()
   await page.get_by_role('button',name='Tiềm năng · Nhãn · Lịch',exact=True).click()
   dialog=page.get_by_role('dialog',name='Tiềm năng, nhãn và lịch theo dõi',exact=True)
   await dialog.get_by_label('Mức độ tiềm năng',exact=True).select_option('high')
   await dialog.get_by_label('Khách trọng điểm',exact=True).check();await dialog.get_by_label('Cần gửi mẫu',exact=True).check()
   await dialog.get_by_label('Ngày theo dõi',exact=True).fill('2026-11-09')
   await dialog.get_by_role('button',name='Lưu thay đổi',exact=True).click();await expect(dialog.get_by_role('alert')).to_be_visible()
   await expect(dialog.get_by_label('Mức độ tiềm năng',exact=True)).to_have_value('high')
   await dialog.get_by_role('button',name='Lưu thay đổi',exact=True).click();await expect(dialog).not_to_be_visible()
   await expect(page.get_by_text('🔥 Cao',exact=True).first).to_be_visible()
   assert writes[0]['_request_id']==writes[1]['_request_id']
   assert writes[1]['_labels']==[x['id'] for x in labels]
   await page.get_by_role('dialog').get_by_role('button',name='Close',exact=True).click()
   await page.get_by_role('button',name='Bộ lọc',exact=True).click();d=page.get_by_role('dialog',name='Bộ lọc',exact=True)
   await d.locator('select').nth(2).select_option('high');await d.get_by_role('button',name='Áp dụng',exact=True).click()
   await page.screenshot(path=str(OUT/f'{width}-list.png'))
   assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth')
   await page.reload();await expect(page.get_by_text('Tiềm năng: 🔥 Cao',exact=False).first).to_be_visible()
   await page.goto('http://localhost:8080/signals-fixture-report')
   await expect(page.get_by_role('heading',name='Mức độ tiềm năng',exact=True)).to_be_visible()
   await page.screenshot(path=str(OUT/f'{width}-report.png'))
   assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth')
   assert not errors,errors
   print('PASS',width,'potential/multi-label/followup/error-retained/idempotent-retry/readback/filters-reload/report/no-overflow')
   await page.close()
  await browser.close()
asyncio.run(main())