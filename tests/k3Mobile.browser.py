import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright,expect
HTML='''<div id="root"></div><script type="module">import RefreshRuntime from "/@react-refresh";RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;</script><script type="module" src="/tests/k3Mobile.browser.tsx"></script>'''
OUT=Path('/tmp/browser/k3-mobile')
TODAY='2026-11-06'
metric={'status':'in_progress','overdue':False,'overdue_seconds':0,'kpi_total':1,'kpi_met':0,'kf_total':1,'kf_done':0,'completion_basis':'own_kpis','result_count':1,'review_required':False,'attained':False,'actual':15,'progress':15}
actions=[{'id':'a1','goal_id':'g1','delete_kind':'goal','name':'Phát triển đại lý mới khu vực miền Trung','goal_name':'Phát triển đại lý mới khu vực miền Trung','due_date':'2026-11-10','metric':metric,'kpis':[{'id':'quantity','name':'Số đại lý mới'}]}, {'id':'a2','goal_id':'g2','name':'Gửi báo giá khách hàng','goal_name':'Gửi báo giá khách hàng','due_date':TODAY,'metric':{**metric,'status':'not_started'},'kpis':[{'id':'binary','name':'Gửi báo giá'}]}]
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  for width,height in [(320,740),(375,812),(390,844),(430,932),(768,1024),(1280,1800)]:
   page=await browser.new_page(viewport={'width':width,'height':height});errors=[];writes=[];saved=15;reviewed=False;fail=True
   page.on('pageerror',lambda e:errors.append(str(e)))
   await page.route('**/k3-mobile-fixture',lambda r:r.fulfill(content_type='text/html',body=HTML))
   async def rpc(route):
    nonlocal saved,reviewed,fail
    name=route.request.url.split('/')[-1];payload=route.request.post_data_json or {};result=[]
    print("RPC",name)
    if name=='k3_day_read':result={'day':None,'tasks':[],'summaries':[],'events':[],'assigned_actions':[],'active_goals':[]}
    elif name=='k3_settings_read': result={'today':TODAY,'enabled':True,'can_use':True,'can_view_scope':True,'can_settings':False,'allow_team_goal':True,'summary_by':'18:00','max_focus':3}
    elif name=='k3_kpi_day_read':result={'actions':actions}
    elif name=='k3_employee_review_read':result={'date':TODAY,'source_version':'v1','manual_status':'reviewed' if reviewed else 'none','system_status':'open','auto_close_time':'18:00','missing':1,'result_count':1,'action_count':2,'goal_count':2,'actions':[{**a,'assignee_name':'Sale','updated':i==0} for i,a in enumerate(actions)],'goal_kpis':[],'results':[],'history':[]}
    elif name=='k3_kpi_result_read':
     binary=payload.get('_kpi')=='binary';value=0 if binary else saved
     result={'kpi':{'id':'binary' if binary else 'quantity','name':'Gửi báo giá' if binary else 'Số đại lý mới','measure':'binary' if binary else 'cumulative','target':None if binary else 100,'unit':'' if binary else 'đại lý','config':{}},'can_update':True,'metric':{**metric,'actual':value,'progress':value},'official_metric':metric,'daily':None if binary else {'id':'r1','revision':1,'value':saved,'work_date':TODAY,'user_id':'mobile-ui-test'},'results':[],'history':[]}
    elif name=='k3_kpi_result_preview':result={**metric,'actual':payload.get('_payload',{}).get('value',0)}
    elif name=='k3_kpi_result_save':
     writes.append((name,payload));saved=payload['_payload']['value'];result={}
    elif name=='k3_employee_review_confirm':writes.append((name,payload));reviewed=True;result={}
    elif name=='k3_quick_create':
     writes.append((name,payload))
     if fail:
      fail=False;await route.fulfill(status=400,content_type='application/json',body=json.dumps({'message':'Chưa lưu được công việc. Vui lòng thử lại.'}));return
     result={'goal_id':'created'}
    elif name=='k3_deletable':result={'ok':True}
    await route.fulfill(content_type='application/json',body=json.dumps(result))
   await page.route('**/rest/v1/rpc/**',rpc)
   await page.goto('http://localhost:8080/k3-mobile-fixture')
   await page.screenshot(path=str(OUT/f"{width}-start.png"));print((await page.locator("body").inner_text())[:1000],errors)
   await expect(page.get_by_text(actions[0]['name'],exact=True)).to_be_visible(timeout=15000)
   if width<768:
    await expect(page.get_by_role('heading',name='Quản lý 3K',exact=True)).to_have_count(1)
    await page.get_by_role('button',name='Ngày trước',exact=True).click()
    await page.get_by_role('button',name='Về hôm nay',exact=True).click()
    await page.screenshot(path=str(OUT/f'{width}-day.png'))
   await page.get_by_role('button',name='Tạo công việc',exact=True).click()
   dialog=page.get_by_role('dialog',name='Tạo công việc',exact=True)
   await dialog.get_by_role('textbox',name='Tên công việc').fill('Công việc kiểm tra giao diện')
   await dialog.locator('#k3q-end').fill('2026-11-10')
   await dialog.get_by_role('button',name='Lưu công việc',exact=True).click()
   await expect(dialog.get_by_role('alert')).to_be_visible(timeout=15000)
   await expect(dialog.get_by_role('textbox',name='Tên công việc')).to_have_value('Công việc kiểm tra giao diện')
   await page.screenshot(path=str(OUT/f'{width}-create-error.png'))
   await dialog.get_by_role('button',name='Lưu công việc',exact=True).click()
   await expect(dialog).not_to_be_visible(timeout=15000)
   assert writes[0][1]['_payload']['request_key']==writes[1][1]['_payload']['request_key']
   await page.get_by_role('button',name='Cập nhật kết quả',exact=True).first.click()
   dialog=page.get_by_role('dialog',name='Cập nhật kết quả · Số đại lý mới',exact=True)
   await expect(dialog.locator('#k3-result-value')).to_have_value('15')
   await dialog.locator('#k3-result-value').fill('30')
   await page.screenshot(path=str(OUT/f'{width}-result.png'))
   await dialog.get_by_role('button',name='Lưu kết quả',exact=True).click()
   await expect(dialog).not_to_be_visible();await expect(page.get_by_text('Kết quả: 30/100 đại lý')).to_be_visible(timeout=15000)
   await page.get_by_role('button',name='Cập nhật kết quả',exact=True).nth(1).click()
   dialog=page.get_by_role('dialog',name='Cập nhật kết quả · Gửi báo giá',exact=True)
   await dialog.get_by_role('button',name='Chưa hoàn thành',exact=True).click()
   await dialog.get_by_role('button',name='Lưu kết quả',exact=True).click()
   await expect(dialog).not_to_be_visible(timeout=15000)
   await page.get_by_role('button',name='Thao tác khác cho '+actions[0]['name'],exact=True).click()
   await page.get_by_role('menuitem',name='Lịch sử kết quả',exact=True).click()
   await expect(page.get_by_role('dialog')).to_be_visible();await page.keyboard.press('Escape')
   await page.get_by_role('button',name='Tổng kết hôm nay',exact=True).click()
   dialog=page.get_by_role('dialog',name='Tổng kết hôm nay · '+TODAY,exact=True)
   await expect(dialog.get_by_role('button',name='Xác nhận đã tổng kết',exact=True)).to_be_disabled()
   await dialog.get_by_role('checkbox').check()
   await page.screenshot(path=str(OUT/f'{width}-review.png'))
   await dialog.get_by_role('button',name='Xác nhận đã tổng kết',exact=True).click()
   await expect(dialog).not_to_be_visible(timeout=15000)
   await expect(page.get_by_text('Đã tổng kết',exact=True).first).to_be_visible(timeout=15000)
   assert not await page.evaluate('document.documentElement.scrollWidth > innerWidth')
   assert not errors,errors
   print('PASS',width,'day/date/create-error-retry/numeric-replace/binary/history/review-warning-confirm/overflow')
   await page.close()
  await browser.close()
asyncio.run(main())
