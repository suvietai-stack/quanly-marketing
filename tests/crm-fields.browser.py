import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright,expect
OUT=Path(__file__).parent
HTML='<div id="root"></div><script type="module">import RefreshRuntime from "/@react-refresh";RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;</script><script type="module" src="/tests/crm.browser.tsx"></script>'
UID='00000000-0000-0000-0000-000000000002'
def cat(id,kind,name,config={},parent=None):return dict(id=id,kind=kind,name=name,config=config,parent_id=parent,active=True,sort_order=0,description='')
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  for width,height in [(320,740),(390,844),(430,932),(1280,1800)]:
   page=await browser.new_page(viewport={'width':width,'height':height});errors=[];customers=[];writes=[];catalogs=[cat('g','group','Khách sỉ'),cat('h','group','Khách quà tặng trực tiếp'),cat('s','segment','Khách mua sỉ theo lô',parent='g'),cat('n','custom_field','Số đại lý',{'field_type':'number','scope_mode':'groups','group_ids':['g']}),cat('m','custom_field','Kênh bán',{'field_type':'multiselect','scope_mode':'groups','group_ids':['g'],'options':[{'id':'fb','name':'Facebook','active':True},{'id':'sh','name':'Shopee','active':True}]}),cat('t','trait','Có cửa hàng',{'scope_mode':'groups','group_ids':['g']})]
   page.on('pageerror',lambda e:errors.append(str(e)))
   await page.route('**/crm-fields-fixture*',lambda r:r.fulfill(content_type='text/html',body=HTML))
   await page.route('**/rest/v1/crm_catalogs*',lambda r:r.fulfill(content_type='application/json',body=json.dumps(catalogs)))
   await page.route('**/rest/v1/crm_templates*',lambda r:r.fulfill(content_type='application/json',body='[]'))
   await page.route('**/storage/v1/**',lambda r:r.fulfill(content_type='application/json',body='[]'))
   async def rpc(r):
    n=r.request.url.split('/')[-1];a=r.request.post_data_json or {};result=[]
    if n=='crm_people':result=[{'id':UID,'name':'Sale cách ly'}]
    elif n=='crm_catalog_counts':result={}
    elif n=='crm_customer_save':
     d=a['_data'];writes.append(d);customers[:]=[dict(d,id='c',code='CRM-C',owner_id=UID,created_at='2026-11-09T00:00:00Z',updated_at='2026-11-09T00:00:00Z',archived_at=None,revision=len(writes))];result='c'
    elif n=='crm_detail':result={'customer':customers[0],'contacts':[],'locations':[],'schedules':[],'interactions':[],'events':[],'can_edit':True}
    elif n=='crm_read_dynamic':result={'customers':customers,'schedules':[],'contacts':[],'server_now':'2026-11-09T00:00:00Z'}
    elif n=='crm_catalog_save':
     d=a['_data'];d['id']=d.get('id') or 'new-field';catalogs.append(d);result=d['id']
    elif n=='crm_report_dynamic':result={'customers':customers,'catalogs':catalogs,'schedules':[],'interactions':[],'totals':{'customers':len(customers),'new_customers':len(customers),'due':0,'attempts':0,'connected':0},'start':'2026-11-01','end':'2026-11-30','as_of':'2026-11-09T00:00:00Z','server_now':'2026-11-09T00:00:00Z'}
    await r.fulfill(content_type='application/json',body=json.dumps(result))
   await page.route('**/rest/v1/rpc/**',rpc)
   await page.goto('http://localhost:8080/crm-fields-fixture');await page.get_by_role('button',name='Thêm khách',exact=True).click();d=page.get_by_role('dialog')
   await d.get_by_label('Tên khách hàng / Đơn vị',exact=True).fill('Custom cách ly')
   assert await d.get_by_text('Thông tin chuyên sâu',exact=True).count()==0
   await d.get_by_role('combobox',name='Chọn nhóm khách',exact=True).click();await page.get_by_role('option',name='Khách sỉ',exact=True).click()
   await d.get_by_role('combobox',name='Chọn tệp khách',exact=True).click();await page.get_by_role('option',name='Khách mua sỉ theo lô',exact=True).click()
   await d.get_by_text('Thông tin chuyên sâu',exact=True).click();await d.get_by_label('Số đại lý',exact=True).fill('12');await d.get_by_text('Facebook',exact=True).click();await d.get_by_text('Shopee',exact=True).click()
   await page.screenshot(path=str(OUT/f'{width}-custom-form.png'))
   await d.get_by_role('button',name='Lưu khách hàng',exact=True).click();await expect(page.get_by_role('dialog',name='Custom cách ly',exact=True)).to_be_visible();assert writes[0]['custom_values']=={'n':12,'m':['fb','sh']}
   await page.get_by_role('button',name='Sửa hồ sơ',exact=True).click();d=page.get_by_role('dialog')
   await d.get_by_role('combobox',name='Chọn nhóm khách',exact=True).click();await page.get_by_role('option',name='Khách quà tặng trực tiếp',exact=True).click();await page.get_by_role('button',name='Đổi nhóm',exact=True).click()
   assert await d.get_by_text('Thông tin chuyên sâu',exact=True).count()==0;assert await d.get_by_text('Có cửa hàng',exact=True).count()==0
   await d.get_by_role('combobox',name='Chọn nhóm khách',exact=True).click();await page.get_by_role('option',name='Khách sỉ',exact=True).click();await page.get_by_role('button',name='Đổi nhóm',exact=True).click();await expect(d.get_by_role('combobox',name='Chọn tệp khách',exact=True)).to_contain_text('Khách mua sỉ theo lô');await d.get_by_text('Thông tin chuyên sâu',exact=True).click();await expect(d.get_by_label('Số đại lý',exact=True)).to_have_value('12')
   await d.get_by_role('button',name='Lưu khách hàng',exact=True).click();await expect(page.get_by_role('dialog',name='Sửa hồ sơ khách',exact=True)).to_have_count(0);await page.get_by_role('dialog').get_by_role('button',name='Close',exact=True).click()
   await page.get_by_role('combobox',name='Khu vực CRM',exact=True).click();await page.get_by_role('option',name='Cài đặt CRM',exact=True).click();await page.get_by_role('tab',name='Trường chuyên sâu',exact=True).click();await page.get_by_role('button',name='Thêm trường',exact=True).click();d=page.get_by_role('dialog');await d.get_by_label('Tên trường',exact=True).fill('Mã vùng mới');await d.get_by_role('combobox',name='Chọn phạm vi',exact=True).click();await page.get_by_role('option',name='Nhóm được chọn',exact=True).click();await d.get_by_text('Khách sỉ',exact=True).click();await d.get_by_role('button',name='Lưu trường',exact=True).click();await expect(page.get_by_text('Mã vùng mới',exact=True)).to_be_visible()
   await page.get_by_role('combobox',name='Khu vực CRM',exact=True).click();await page.get_by_role('option',name='Báo cáo & Phân tích',exact=True).click();await page.get_by_role('combobox',name='Chọn trường phân tích',exact=True).click();await page.get_by_role('option',name='Kênh bán',exact=True).click();await page.get_by_text('Phân tích thông tin chuyên sâu',exact=True).scroll_into_view_if_needed();await page.screenshot(path=str(OUT/f'{width}-analysis.png'));await expect(page.get_by_text('Lượt lựa chọn:',exact=False)).to_contain_text('2')
   assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth');assert not errors,errors;print('PASS',width,'custom save/readback/group roundtrip/field settings/report/no overflow');await page.close()
  await browser.close()
asyncio.run(main())
