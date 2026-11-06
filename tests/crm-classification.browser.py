import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright,expect
HTML='<div id="root"></div><script type="module">import RefreshRuntime from "/@react-refresh";RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;</script><script type="module" src="/tests/crm.browser.tsx"></script>'
OUT=Path('/tmp/browser/crm-classification');UID='00000000-0000-0000-0000-000000000002'
def cat(id,kind,name,parent=None):return dict(id=id,kind=kind,name=name,parent_id=parent,description='',active=True,sort_order=0,config={})
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  for width,height in [(320,740),(390,844),(430,932),(1280,1800)]:
   page=await browser.new_page(viewport={'width':width,'height':height});errors=[];cats=[cat('g','group','Trung Gian Quà Tặng'),cat('h','group','Đại Lý Đồ Thờ'),cat('s','segment','Công ty chuyên quà tặng doanh nghiệp','g'),cat('t','segment','Cửa hàng chuyên đồ thờ','h')];customers=[];writes=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   await page.route('**/crm-fixture*',lambda r:r.fulfill(content_type='text/html',body=HTML))
   await page.route('**/rest/v1/crm_catalogs*',lambda r:r.fulfill(content_type='application/json',body=json.dumps(cats)))
   await page.route('**/rest/v1/crm_templates*',lambda r:r.fulfill(content_type='application/json',body='[]'))
   async def rpc(r):
    n=r.request.url.split('/')[-1];a=r.request.post_data_json or {};result=[]
    if n=='crm_people':result=[{'id':UID,'name':'Sale cách ly'}]
    elif n=='crm_catalog_counts':result={'g':1,'h':0,'s':1,'t':0}
    elif n=='crm_read':result={'customers':customers,'schedules':[],'contacts':[],'server_now':'2026-11-06T07:00:00Z'}
    elif n=='crm_catalog_save':
     d=a['_data'];found=next((c for c in cats if c['id']==d.get('id')),None)
     if found:found.update(d);result=found['id']
     else:cats.append(dict(d,id='added'));result='added'
    elif n=='crm_customer_save':
     d=a['_data'];writes.append(d);c=dict(d,id='c',code='CRM-C',owner_id=UID,revision=len(writes),created_at='2026-11-02T07:00:00Z',updated_at='2026-11-06T07:00:00Z',archived_at=None);customers[:]=[c];result='c'
    elif n=='crm_detail':result={'customer':customers[0],'contacts':[],'locations':[],'schedules':[],'interactions':[],'events':[],'can_edit':True}
    elif n=='crm_report_filtered':
     own=[c for c in customers if not a.get('_group') or c.get('group_id')==a['_group']];result={'customers':own,'schedules':[],'interactions':[],'totals':{'customers':len(own),'new_customers':len(own),'priority_customers':0,'scheduled_customers':0,'due':0,'processed':0,'on_time':0,'overdue':0,'overdue_customers':0,'priority_overdue':0,'attempts':0,'connected':0},'start':'2026-11-01','end':'2026-11-30','as_of':'2026-11-06T07:00:00Z','server_now':'2026-11-06T07:00:00Z'}
    await r.fulfill(content_type='application/json',body=json.dumps(result))
   await page.route('**/rest/v1/rpc/**',rpc)
   await page.goto('http://localhost:8080/crm-fixture')
   await page.get_by_role('button',name='Thêm khách',exact=True).click();d=page.get_by_role('dialog').first
   await d.get_by_label('Tên khách hàng / Đơn vị',exact=True).fill('Khách phân loại cách ly')
   await d.get_by_role('combobox',name='Chọn nhóm khách',exact=True).click();await page.get_by_role('option',name='Trung Gian Quà Tặng',exact=True).click()
   await d.get_by_role('combobox',name='Chọn tệp khách',exact=True).click();await expect(page.get_by_role('option',name='Cửa hàng chuyên đồ thờ',exact=True)).to_have_count(0);await page.get_by_role('option',name='Công ty chuyên quà tặng doanh nghiệp',exact=True).click()
   await d.get_by_role('button',name='Lưu khách hàng',exact=True).click();await expect(page.get_by_role('dialog',name='Khách phân loại cách ly',exact=True)).to_be_visible()
   await page.get_by_role('button',name='Sửa hồ sơ',exact=True).click();d=page.get_by_role('dialog').first
   await d.get_by_role('combobox',name='Chọn nhóm khách',exact=True).click();await page.get_by_role('option',name='Đại Lý Đồ Thờ',exact=True).click();await expect(page.get_by_role('alertdialog')).to_be_visible();await page.get_by_role('button',name='Giữ nhóm hiện tại').click()
   await expect(d.get_by_role('combobox',name='Chọn tệp khách',exact=True)).to_contain_text('Công ty chuyên')
   await d.get_by_role('combobox',name='Chọn nhóm khách',exact=True).click();await page.get_by_role('option',name='Đại Lý Đồ Thờ',exact=True).click();await page.get_by_role('button',name='Đổi nhóm',exact=True).click();await expect(d.get_by_role('combobox',name='Chọn tệp khách',exact=True)).to_contain_text('Chọn tệp khách')
   await d.get_by_role('button',name='Lưu khách hàng',exact=True).click();await expect(page.get_by_role('dialog',name='Sửa hồ sơ khách',exact=True)).to_have_count(0);await page.get_by_role('dialog').get_by_role('button',name='Close',exact=True).click()
   assert writes[1]['name']==writes[0]['name'] and writes[1]['group_id']=='h' and writes[1]['segment_id']==''
   await page.get_by_role('combobox',name='Khu vực CRM',exact=True).click();await page.get_by_role('option',name='Cài đặt CRM',exact=True).click()
   await expect(page.get_by_text('Quản lý Nhóm & Tệp khách',exact=True)).to_be_visible()
   await page.get_by_role('button',name='Thêm tệp khách',exact=True).first.click();d=page.get_by_role('dialog');await expect(d.get_by_role('combobox',name='Không có nhóm cha',exact=True)).to_contain_text('Trung Gian Quà Tặng');await d.get_by_label('Tên danh mục',exact=True).fill('Tệp quản trị thêm');await d.get_by_role('button',name='Lưu danh mục',exact=True).click();await expect(page.get_by_text('Tệp quản trị thêm',exact=True)).to_be_visible()
   await page.screenshot(path=str(OUT/f'{width}-settings.png'))
   await page.get_by_role('combobox',name='Khu vực CRM',exact=True).click();await page.get_by_role('option',name='Báo cáo & Phân tích',exact=True).click()
   await page.get_by_role('button',name='Bộ lọc',exact=True).click();d=page.get_by_role('dialog');await d.get_by_role('combobox',name='Tất cả nhóm',exact=True).click();await page.get_by_role('option',name='Đại Lý Đồ Thờ',exact=True).click();await d.get_by_role('button',name='Xem báo cáo',exact=True).click()
   await page.get_by_role('heading',name='Phân tích cơ cấu Tệp khách').scroll_into_view_if_needed();await page.screenshot(path=str(OUT/f'{width}-structure.png'))
   await page.get_by_role('button',name='Chưa phân loại tệp',exact=False).filter(has_text='khách mới').first.click();await expect(page.get_by_role('dialog').get_by_role('button',name='Khách phân loại cách ly · CRM-C')).to_be_visible();await page.get_by_role('dialog').get_by_role('button',name='Close',exact=True).click()
   assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth')
   assert not errors,errors
   print('PASS',width,'group-file search / wrong-file hidden / confirm cancel / change preserves / tree create / report filter / unclassified drilldown / no overflow')
   await page.close()
  await browser.close()
asyncio.run(main())
