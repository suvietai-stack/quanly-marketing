import asyncio,json,sys
from pathlib import Path
from playwright.async_api import async_playwright,expect
sys.path.insert(0,str(Path(__file__).parent))
from signals_mock import make_backend,UID
HTML='''<div id="root"></div><script type="module">import RefreshRuntime from "/@react-refresh";RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;</script><script type="module" src="/tests/signals.browser.tsx"></script>'''
OUT=Path('/tmp/browser/signals');OUT.mkdir(parents=True,exist_ok=True)
CID='00000000-0000-0000-0000-000000000004'
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  for width,height in [(320,740),(360,800),(390,844),(430,932),(1280,1800)]:
   page=await browser.new_page(viewport={'width':width,'height':height});errors=[];writes=[];fail=[True]
   page.on('pageerror',lambda e:errors.append(str(e)))
   signal={'id':CID,'customer_name':'Khách cách ly','phone':'0901234567','detected_on':'2026-11-06','products':['Ấm chén'],'need_group':'Sứ quà tặng','need_groups':['Sứ quà tặng'],'source':'Website','status':'consulting','potential':'unrated','assigned_to':UID,'created_by':UID,'created_at':'2026-11-06T02:00:00Z','updated_at':'2026-11-06T02:00:00Z','next_contact_on':'2026-11-12','next_contact_at':'2026-11-12T02:00:00Z','revenue':None,'closed_at':None,'cancelled_at':None}
   labels=[{'id':'00000000-0000-0000-0000-000000000008','owner_id':None,'name':'Khách trọng điểm','active':True},{'id':'00000000-0000-0000-0000-000000000009','owner_id':None,'name':'Cần gửi mẫu','active':True}];links=[]
   def rpc(path,payload):
    if path=='rpc/signal_assessment_save':
     writes.append(payload)
     if fail[0]:
      fail[0]=False;return (400,{'message':'Chưa lưu được, thử lại'})
     signal['potential']=payload['_potential'];signal['updated_at']='2026-11-06T08:00:00Z';links[:]=[{'signal_id':CID,'label_id':x} for x in payload['_labels']];return 'event'
    if path=='rpc/signal_progression_report':return {'total':{'on_time':0,'due':0,'rate':None,'retro_on_time':0,'retro_due':0,'tracking':0,'overdue':0,'today':0,'soon':0},'sales':[],'activated_at':None,'calculated_at':'2026-11-06T08:00:00Z'}
    return []
   await page.route('**/signals-fixture*',lambda r:r.fulfill(content_type='text/html',body=HTML))
   await page.route('**/rest/v1/**',make_backend([signal],notes=[],labels=labels,links=links,rpc=rpc))
   await page.route('**/_serverFn/**',lambda r:r.fulfill(content_type='application/json',body='{}'))
   await page.goto('http://localhost:8080/signals-fixture')
   await page.get_by_role('button',name='Mở chi tiết tín hiệu: Khách cách ly',exact=True).first.click()
   await page.get_by_role('button',name='Đánh giá cơ hội',exact=True).click()
   dialog=page.get_by_role('dialog',name='Đánh giá cơ hội',exact=True)
   await dialog.get_by_label('Mức độ tiềm năng',exact=True).select_option('high')
   await dialog.get_by_role('checkbox',name='Khách trọng điểm',exact=True).click();await dialog.get_by_role('checkbox',name='Cần gửi mẫu',exact=True).click()
   assert await dialog.locator('input[type=date],input[type=time]').count()==0
   await dialog.get_by_role('button',name='Lưu đánh giá',exact=True).click();await expect(dialog.get_by_role('alert')).to_be_visible()
   await expect(dialog.get_by_label('Mức độ tiềm năng',exact=True)).to_have_value('high')
   await dialog.get_by_role('button',name='Lưu đánh giá',exact=True).click();await expect(dialog).not_to_be_visible()
   await expect(page.get_by_role('dialog').get_by_text('🔥 Cao',exact=True).first).to_be_visible()
   assert writes[0]['_request_id']==writes[1]['_request_id']
   assert writes[1]['_labels']==[x['id'] for x in labels]
   assert '_next' not in writes[1] and '_next_at' not in writes[1]
   assert signal['next_contact_on']=='2026-11-12'
   await page.get_by_role('button',name='Đánh giá cơ hội',exact=True).click()
   reopened=page.get_by_role('dialog',name='Đánh giá cơ hội',exact=True)
   await expect(reopened.get_by_label('Mức độ tiềm năng',exact=True)).to_have_value('high')
   await expect(reopened.get_by_role('checkbox',name='Khách trọng điểm',exact=True)).to_have_attribute('aria-checked','true')
   await reopened.wait_for(state='visible');await page.wait_for_timeout(300);await page.screenshot(path=str(OUT/f'{width}-assessment.png'))
   await reopened.get_by_role('button',name='Close',exact=True).click()
   await page.get_by_role('dialog').get_by_role('button',name='Close',exact=True).click()
   await page.get_by_role('button',name='Bộ lọc',exact=True).click();d=page.get_by_role('dialog',name='Bộ lọc',exact=True)
   await d.get_by_text('Mức độ tiềm năng',exact=True).locator('..').locator('select').select_option('high');await d.get_by_role('button',name='Áp dụng',exact=True).click()
   await page.screenshot(path=str(OUT/f'{width}-list.png'))
   assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth')
   await page.reload();await expect(page.get_by_role('button',name='Bộ lọc (1)',exact=True)).to_be_visible()
   await page.goto('http://localhost:8080/signals-fixture-report')
   await expect(page.get_by_role('heading',name='Mức độ tiềm năng',exact=True)).to_be_visible()
   await page.screenshot(path=str(OUT/f'{width}-report.png'))
   assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth')
   assert not errors,errors
   print('PASS',width,'assessment/multi-label/schedule-preserved/error-retained/idempotent-retry/readback/filters-reload/report/no-overflow')
   await page.close()
  await browser.close()
asyncio.run(main())
