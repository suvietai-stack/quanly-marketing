import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright,expect
HTML='''<div id="root"></div><script type="module">import RefreshRuntime from "/@react-refresh";RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;</script><script type="module" src="/tests/crm.browser.tsx"></script>'''
OUT=Path('/tmp/browser/crm');OUT.mkdir(parents=True,exist_ok=True)
UID='00000000-0000-0000-0000-000000000002';CID='00000000-0000-0000-0000-000000000010'
catalogs=[{'id':'g','kind':'group','name':'Khách quà tặng trực tiếp','active':True,'config':{},'sort_order':0,'parent_id':None},{'id':'o','kind':'outcome','name':'Đã trao đổi được','active':True,'config':{'connected':True,'completed':True},'sort_order':0,'parent_id':None}]
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  for width,height in [(320,740),(390,844),(430,932),(768,1024),(1280,1800)]:
   page=await browser.new_page(viewport={'width':width,'height':height});errors=[];writes=[];customers=[];fail=True;interactions=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   await page.route('**/crm-fixture*',lambda r:r.fulfill(content_type='text/html',body=HTML))
   await page.route('**/rest/v1/crm_catalogs*',lambda r:r.fulfill(content_type='application/json',body=json.dumps(catalogs)))
   await page.route('**/rest/v1/crm_templates*',lambda r:r.fulfill(content_type='application/json',body='[]'))
   await page.route('**/storage/v1/**',lambda r:r.fulfill(content_type='application/json',body='[]'))
   async def rpc(route):
    nonlocal fail
    name=route.request.url.split('/')[-1];args=route.request.post_data_json or {};result=[]
    if name=='crm_read':result={'customers':customers,'schedules':[],'contacts':[],'server_now':'2026-11-06T07:00:00Z'}
    elif name=='crm_people':result=[{'id':UID,'name':'Sale kiểm tra cách ly'}]
    elif name=='crm_customer_save':
     writes.append(args['_data'])
     if fail:
      fail=False;await route.fulfill(status=400,content_type='application/json',body=json.dumps({'message':'Chưa lưu được. Vui lòng thử lại.'}));return
     d=args['_data'];customers.append({'id':CID,'code':'CRM-TEST','owner_id':UID,'name':d['name'],'phone':d.get('phone',''),'profile_kind':d['profile_kind'],'related_ids':[],'details':{},'revision':1,'created_at':'2026-11-06T07:00:00Z','updated_at':'2026-11-06T07:00:00Z','archived_at':None});result=CID
    elif name=='crm_detail':result={'customer':customers[0],'contacts':[],'locations':[],'schedules':[],'interactions':interactions,'events':[],'can_edit':True}
    elif name=='crm_interaction_save':interactions.append({'id':'i','customer_id':CID,'channel':'phone','outcome_id':'o','content':args['_data']['content'],'connected':True,'completed':True,'happened_at':'2026-11-06T07:00:00Z','actor_id':UID,'owner_id':UID});result='i'
    elif name in ['crm_report','crm_export','crm_report_filtered']:result={'customers':customers,'schedules':[],'interactions':interactions,'totals':{'customers':len(customers),'new_customers':len(customers),'priority_customers':0,'scheduled_customers':0,'due':0,'processed':0,'on_time':0,'overdue':0,'overdue_customers':0,'priority_overdue':0,'attempts':len(interactions),'connected':len(interactions)},'start':'2026-11-01','end':'2026-11-30','as_of':'2026-11-06T07:00:00Z','server_now':'2026-11-06T07:00:00Z'}
    await route.fulfill(content_type='application/json',body=json.dumps(result))
   await page.route('**/rest/v1/rpc/**',rpc)
   await page.goto('http://localhost:8080/crm-fixture')
   await page.get_by_role('button',name='Thêm khách',exact=True).click()
   dialog=page.get_by_role('dialog').first
   await dialog.get_by_role('button',name='Cá nhân',exact=True).click()
   await dialog.get_by_label('Họ tên khách hàng',exact=True).fill('Khách kiểm thử cách ly')
   await dialog.get_by_label('Số điện thoại',exact=True).fill('0900000000')
   await dialog.get_by_role('combobox',name='Chọn tỉnh / thành phố',exact=True).click()
   await page.get_by_placeholder('Tìm chọn tỉnh / thành phố').fill('Hà Nội')
   await page.get_by_role('option',name='Thành phố Hà Nội',exact=True).click()
   await page.wait_for_timeout(400)
   await page.screenshot(path=str(OUT/f'{width}-create.png'))
   await dialog.get_by_role('button',name='Lưu khách hàng',exact=True).click()
   await expect(dialog.get_by_role('alert')).to_be_visible()
   await expect(dialog.get_by_label('Họ tên khách hàng',exact=True)).to_have_value('Khách kiểm thử cách ly')
   await dialog.get_by_role('button',name='Lưu khách hàng',exact=True).click()
   await expect(page.get_by_role('dialog',name='Khách kiểm thử cách ly',exact=True)).to_be_visible()
   await page.get_by_role('dialog').get_by_role('tab',name='Chăm sóc',exact=True).click()
   await page.get_by_role('button',name='Ghi nhận chăm sóc',exact=True).click()
   dialog=page.get_by_role('dialog').first
   await dialog.get_by_role('combobox',name='Chọn kết quả',exact=True).click();await page.get_by_role('option',name='Đã trao đổi được',exact=True).click()
   await dialog.get_by_label('Nội dung trao đổi',exact=True).fill('Trao đổi nhu cầu trong kiểm thử cách ly')
   await dialog.get_by_role('button',name='Lưu kết quả chăm sóc',exact=True).click()
   await page.get_by_role('dialog').get_by_role('tab',name='Lịch sử',exact=True).click()
   await expect(page.get_by_text('Trao đổi nhu cầu trong kiểm thử cách ly',exact=True)).to_be_visible()
   await page.get_by_role('dialog').get_by_role('button',name='Close',exact=True).click()
   await page.get_by_role('tab',name='Báo cáo',exact=True).click();await expect(page.get_by_text('Cơ cấu khách hàng',exact=True)).to_be_visible()
   await page.screenshot(path=str(OUT/f'{width}-report.png'))
   assert writes[0]['request_key']==writes[1]['request_key']
   print('overflow',await page.evaluate('Array.from(document.querySelectorAll("*")).filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,15).map(e=>[e.tagName,e.className,e.getBoundingClientRect().right])'))
   assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth')
   assert not errors,errors
   print('PASS',width,'create/error-retains/retry/readback/care/history/report/no-overflow')
   await page.close()
  await browser.close()
asyncio.run(main())