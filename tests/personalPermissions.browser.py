import asyncio,json,time
from pathlib import Path
from playwright.async_api import async_playwright,expect
OUT=Path('/tmp/browser/personal-permissions')
OUT.mkdir(parents=True,exist_ok=True)
POLICY=json.load(open(Path(__file__).parent/'fixtures/personal-policy.json'))
CATALOG=json.load(open(Path(__file__).parent/'fixtures/permission-catalog.json'))
HTML='''<div id="root"></div><script type="module">import RefreshRuntime from "/@react-refresh";RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;</script><script type="module" src="/tests/personalPermissions.browser.tsx"></script>'''
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  for width in [1280,390]:
   page=await browser.new_page(viewport={'width':width,'height':1800}); selected=['settings.role']; calls=[]; errors=[]; catalog_reads=0
   page.on('pageerror',lambda e:errors.append(str(e)))
   async def rpc(r):
    nonlocal selected,catalog_reads
    name=r.request.url.split('/')[-1]; payload=r.request.post_data_json or {};calls.append(name)
    if 'base_permission_catalog?' in name:
     assert r.request.method=='GET';catalog_reads+=1;data=CATALOG
    elif name=='permission_editor_read':data=POLICY
    elif name=='account_supplement_read':data={'fingerprint':'fixture','role_ids':[],'permissions':selected,'legacy_override':False,'inactive_legacy':False}
    elif name=='account_supplement_preview':
     assert payload['_permissions']==['settings.role','leave.edit_own'],payload
     data={'id':'preview','fingerprint':'fixture','added':['leave.edit_own'],'removed':[],'affected_users':['fixture-staff'],'inactive_legacy':False}
    elif name=='account_supplement_save':
     assert payload['_roles']==[] and payload['_permissions']==['settings.role','leave.edit_own'];assert payload['_reason']=='Kiểm thử fixture';selected=payload['_permissions'];data={'ok':True}
    else:data=[]
    await r.fulfill(content_type='application/json',body=json.dumps(data))
   await page.route('**/personal-fixture',lambda r:r.fulfill(content_type='text/html',body=HTML));await page.route('**/rest/v1/**',rpc);await page.route('**/_serverFn/**',lambda r:r.abort())
   start=time.perf_counter();await page.goto('http://localhost:8080/personal-fixture');await expect(page.get_by_text('24 module · 510/510 quyền',exact=True)).to_be_visible();print(width,'initial ms',round((time.perf_counter()-start)*1000))
   assert await page.get_by_role('checkbox').count()==0
   await page.get_by_role('button',name='Đơn Từ & Phê Duyệt',exact=False).click()
   await expect(page.get_by_role('checkbox',name='leave.view_own',exact=True)).not_to_be_checked()
   await expect(page.get_by_text('Đang có từ Role: Quyền chung',exact=True)).to_be_visible()
   await page.get_by_role('checkbox',name='leave.edit_own',exact=True).check()
   await page.get_by_role('button',name='Xem trước quyền riêng',exact=True).click();await expect(page.get_by_text('Thêm 1 / bỏ 0 quyền · chỉ 1 nhân viên',exact=True)).to_be_visible()
   await page.get_by_label('Lý do thay đổi',exact=True).fill('Kiểm thử fixture');await page.get_by_role('button',name='Xác nhận lưu quyền riêng',exact=True).click();await expect(page.get_by_role('checkbox',name='leave.edit_own',exact=True)).to_be_checked()
   await page.get_by_label('Tìm quyền bổ sung').fill('settings.role');await expect(page.get_by_role('checkbox',name='settings.role',exact=True)).to_be_checked();await expect(page.get_by_role('checkbox',name='settings.role',exact=True)).to_be_enabled()
   await page.get_by_label('Tìm quyền bổ sung').fill('order.approve');await expect(page.get_by_role('checkbox',name='order.approve',exact=True)).to_be_disabled()
   await page.get_by_label('Tìm quyền bổ sung').fill('');start=time.perf_counter()
   while await page.locator('section > button[aria-expanded="false"]').count():await page.locator('section > button[aria-expanded="false"]').first.click()
   assert await page.get_by_role('checkbox').count()==510
   assert catalog_reads==2, catalog_reads
   assert len(set(await page.get_by_role('checkbox').evaluate_all('(els)=>els.map(e=>e.getAttribute("aria-label"))')))==510
   await expect(page.get_by_role('checkbox',name='order.photo.approve',exact=True)).to_be_disabled()
   print(width,'expand 510 ms',round((time.perf_counter()-start)*1000),'grantable15, baselineunsupported revocable; RPCs',calls)
   assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth');assert not errors,errors
   await page.screenshot(path=str(OUT/f'all-{width}.png'))
   await page.unroute('**/rest/v1/**',rpc)
   async def failed(r):
    if r.request.url.endswith('permission_editor_read'):await r.fulfill(status=500,content_type='application/json',body=json.dumps({'message':'fixture policy unavailable'}))
    else:await rpc(r)
   await page.route('**/rest/v1/**',failed);await page.reload();await expect(page.get_by_role('alert')).to_contain_text('Danh mục chỉ xem');await page.get_by_label('Tìm quyền bổ sung').fill('leave.edit_own');await expect(page.get_by_role('checkbox',name='leave.edit_own',exact=True)).to_be_disabled();await page.screenshot(path=str(OUT/f'policy-error-{width}.png'))
   print('PASS',width,'preview/save/readback fixture, full catalog, policy fail closed, no overflow')
   await page.close()
  await browser.close()
asyncio.run(main())
