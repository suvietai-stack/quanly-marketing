import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright,expect
HTML='''<div id="root"></div><script type="module">import RefreshRuntime from "/@react-refresh";RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;</script><script type="module" src="/tests/leaveMobile.browser.tsx"></script>'''
OUT=Path('/tmp/browser/leave-mobile')
settings={'schedule':{str(i):{'am':True,'pm':True} for i in range(1,8)},'sessions':{'am':{'start':'08:00','end':'12:00'},'pm':{'start':'13:00','end':'17:00'}},'session_value':0.5,'holidays':[],'deadlines':{'leave_hours':12,'late_minutes':5,'early_minutes':5},'recall_minutes':{'leave':0,'late':0,'early':0},'reasons':[{'id':'family','name':'Việc gia đình','active':True},{'id':'other','name':'Khác','active':True}]}
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(headless=True)
  for width,height in [(320,740),(375,812),(390,844),(430,932),(1280,1800)]:
   page=await b.new_page(viewport={'width':width,'height':height});errs=[];writes=[];fail=True
   page.on('pageerror',lambda e:errs.append(str(e)))
   await page.route('**/leave-mobile-fixture*',lambda r:r.fulfill(content_type='text/html',body=HTML))
   async def rpc(route):
    nonlocal fail
    name=route.request.url.split('/')[-1];result=[]
    if name=='leave_settings_get':result=settings
    elif name=='leave_approvers':result=[{'id':'manager','full_name':'Người phê duyệt'}]
    elif name=='leave_submit':
     writes.append(route.request.post_data_json)
     if fail:
      fail=False;await route.fulfill(status=400,content_type='application/json',body=json.dumps({'message':'Chưa gửi được. Vui lòng thử lại.'}));return
     result='request-new'
    await route.fulfill(content_type='application/json',body=json.dumps(result))
   await page.route('**/rest/v1/rpc/**',rpc)
   await page.route('**/rest/v1/leave_requests*',lambda r:r.fulfill(content_type='application/json',body='null' if 'id=eq.' in r.request.url else '[]'))
   await page.route('**/rest/v1/leave_request_*',lambda r:r.fulfill(content_type='application/json',body='[]'))
   await page.route('**/_server*',lambda r:r.fulfill(status=200,body='{}'))
   await page.goto('http://localhost:8080/leave-mobile-fixture')
   await expect(page.get_by_role('tab',name='Đơn của tôi')).to_be_visible()
   if width<768:
    await expect(page.get_by_role('heading',name='Nghỉ phép & Đi sớm muộn',exact=True)).to_have_count(1)
    await page.get_by_role('button',name='Nghỉ phép',exact=True).click()
   else:await page.get_by_role('button',name='Tạo đơn',exact=True).click()
   dialog=page.get_by_role('dialog').first
   await dialog.locator('#leave-start-date').fill('2026-11-09')
   await dialog.locator('#leave-end-date').fill('2026-11-09')
   if width<768:
    await dialog.get_by_role('button',name='Buổi sáng',exact=True).click()
    await expect(dialog.get_by_text('Bạn đăng ký nghỉ: 0,5 ngày')).to_be_visible()
    await dialog.get_by_role('button',name='Cả ngày',exact=True).click()
    await expect(dialog.get_by_text('Bạn đăng ký nghỉ: 1 ngày')).to_be_visible()
   combo=dialog.get_by_role('combobox')
   await combo.nth(0).click();await page.get_by_role('option',name='Việc gia đình',exact=True).click()
   await combo.nth(1).click();await page.get_by_role('option',name='Người phê duyệt',exact=True).click()
   await page.wait_for_timeout(300);await page.screenshot(path=str(OUT/f'{width}-form.png'))
   await dialog.get_by_role('button',name='Gửi đơn',exact=True).click()
   await expect(dialog.get_by_role('alert')).to_be_visible()
   await expect(dialog.locator('#leave-start-date')).to_have_value('2026-11-09')
   await dialog.get_by_role('button',name='Hủy',exact=True).click()
   discard=page.get_by_role('dialog',name='Bỏ thay đổi chưa gửi?',exact=True)
   await expect(discard).to_be_visible();await discard.get_by_role('button',name='Tiếp tục soạn').click()
   await dialog.get_by_role('button',name='Gửi đơn',exact=True).click()
   await expect(page.get_by_role('dialog',name='Không thể mở đơn')).to_have_count(0)
   await page.get_by_role('dialog').get_by_role('button',name='Close',exact=True).click()
   await page.wait_for_timeout(300)
   if width<768:
    for name in ['Đi muộn','Về sớm']:
     await page.get_by_role('button',name=name,exact=True).click()
     dialog=page.get_by_role('dialog').first
     await dialog.locator('#leave-shift-date').fill('2026-11-05')
     await dialog.get_by_role('button',name='15 phút',exact=True).click()
     await expect(dialog.get_by_role('button',name='Gửi đơn bổ sung',exact=True)).to_be_disabled()
     await dialog.get_by_role('button',name='Sự cố giao thông',exact=True).click()
     await expect(dialog.get_by_text('Thời gian '+('đi muộn' if name=='Đi muộn' else 'về sớm')+': 15 phút',exact=True)).to_be_visible()
     await page.wait_for_timeout(300);await page.screenshot(path=str(OUT/f'{width}-{name}.png'))
     await dialog.get_by_role('button',name='Hủy',exact=True).click();await page.get_by_role('dialog',name='Bỏ thay đổi chưa gửi?',exact=True).get_by_role('button',name='Bỏ thay đổi',exact=True).click();await page.wait_for_timeout(300)
   await page.get_by_role('tab',name='Báo cáo',exact=True).click()
   await page.screenshot(path=str(OUT/f'{width}-report.png'))
   assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth')
   assert writes[0]['_payload']==writes[1]['_payload']
   assert not errs,errs
   print('PASS',width,'direct-type/half-day/whole-day/error-retains/retry/discard/late-warning/quick-minutes/report/overflow')
   await page.close()
  await b.close()
asyncio.run(main())
