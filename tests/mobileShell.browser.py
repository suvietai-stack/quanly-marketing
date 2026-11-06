import asyncio
from urllib.parse import quote
from pathlib import Path
from playwright.async_api import async_playwright,expect
HTML='''<div id="root"></div><script type="module">import RefreshRuntime from "/@react-refresh";RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;</script><script type="module" src="/tests/mobileShell.browser.tsx"></script>'''
OUT=Path('/tmp/browser/mobile-shell')
async def chrome(page):
 h=page.get_by_role('banner',name='Đầu trang mobile');n=page.get_by_role('navigation',name='Điều hướng mobile')
 await expect(h).to_be_visible(); await expect(n).to_be_visible()
 assert await h.count()==1 and await n.count()==1
 hb=await h.bounding_box();nb=await n.bounding_box();height=page.viewport_size['height']
 assert abs(hb['y'])<2 and abs(nb['y']+nb['height']-height)<2,(hb,nb,height)
 return h,n
async def main():
 OUT.mkdir(parents=True,exist_ok=True)
 async with async_playwright() as p:
  b=await p.chromium.launch(headless=True)
  for w,height in [(390,844),(320,740),(767,1024),(1280,1800)]:
   page=await b.new_page(viewport={'width':w,'height':height});errs=[]
   page.on('pageerror',lambda e:errs.append(str(e)))
   await page.route('http://localhost:8080/**',lambda r:r.fulfill(content_type='text/html',body=HTML) if r.request.resource_type=='document' else r.continue_())
   await page.goto('http://localhost:8080/')
   if w>=768:
    await expect(page.get_by_role('navigation',name='Điều hướng mobile')).not_to_be_visible()
   else:
    h,n=await chrome(page)
    await expect(h.get_by_role('heading',name='Trang chủ',exact=True)).to_have_count(1)
    await expect(page.get_by_test_id('mobile-launcher').get_by_role('heading',level=1)).to_have_count(0)
    areas=['Điều hành','Kinh doanh','Showroom','Marketing','Thiết Kế','Mua Hàng & Giao Vận','Kế Toán & Tài Chính','Hành Chính & Nhân Sự','Sao Sứ Việt','Hệ thống']
    for area in areas:
     await page.goto('http://localhost:8080/?area='+quote(area))
     h,n=await chrome(page)
     await expect(h.get_by_role('heading',name=area,exact=True)).to_have_count(1)
     launcher=page.get_by_test_id('mobile-launcher')
     await expect(launcher.get_by_role('heading',level=1)).to_have_count(0)
     await expect(page.get_by_role('button',name='Quay lại',exact=True)).to_have_count(1)
     searchbox=await page.get_by_role('textbox',name='Tìm chức năng trong Base').bounding_box()
     hb=await h.bounding_box()
     assert 12<=searchbox['y']-hb['height']<=20,(area,searchbox,hb)
     if area=='Kinh doanh':
      await expect(page.get_by_role('button',name='Tùy chọn',exact=False)).to_have_count(0)
      await n.get_by_role('link',name='Trang chủ',exact=True).click()
      quick=page.get_by_role('region',name='Truy cập nhanh')
      await quick.get_by_role('button',name='Tùy chỉnh').click()
      dialog=page.get_by_role('dialog',name='Tùy chỉnh truy cập nhanh')
      await dialog.get_by_role('checkbox',name='Ghim Quản lý 3K',exact=True).check()
      await dialog.get_by_role('button',name='Lưu thay đổi').click()
      await expect(quick.get_by_role('link',name='Quản lý 3K')).to_be_visible()
      await quick.get_by_role('button',name='Tùy chỉnh').click()
      await dialog.get_by_role('button',name='Bỏ ghim Quản lý 3K',exact=True).click()
      await dialog.get_by_role('button',name='Lưu thay đổi').click()
      await expect(quick.get_by_role('link',name='Quản lý 3K')).to_have_count(0)
     if area=='Marketing':
      await page.screenshot(path=str(OUT/f'{w}-area-single-header.png'))
    await n.get_by_role('link',name='Trang chủ',exact=True).click()
    await page.get_by_role('link',name='Kinh doanh',exact=True).click();await chrome(page)
    await page.get_by_role('link',name='Quản lý 3K',exact=True).click();await chrome(page)
    await expect(h).to_contain_text('Quản lý 3K')
    await page.get_by_role('link',name='Chi tiết công việc').click();await chrome(page)
    await h.get_by_role('button',name='Quay lại',exact=True).click()
    await expect(page).to_have_url('http://localhost:8080/biz/3k')
    await page.evaluate('window.scrollTo(0,document.documentElement.scrollHeight)');await chrome(page)
    fixed=await page.get_by_role('button',name='Nút cố định hiện hữu').bounding_box();nb=await n.bounding_box()
    assert fixed['y']+fixed['height']<=nb['y'],(fixed,nb)
    await page.get_by_role('button',name='Lưu nội dung').click()
    await page.get_by_role('button',name='Xác nhận xóa').click()
    await expect(page.get_by_role('dialog')).to_be_visible()
    await page.get_by_role('dialog').get_by_role('button',name='Đồng ý').click()
    await page.keyboard.press('Escape')
    await n.get_by_role('link',name='Trang chủ',exact=True).click();await expect(page).to_have_url('http://localhost:8080/');await chrome(page)
    for path in ['/signals','/settings/kpi-v2','/orders','/finance/incoming/id','/leave','/order-quotes/id','/profile']:
     await page.goto('http://localhost:8080'+path)
     await chrome(page)
    await expect(n.get_by_role('link',name='Cá nhân')).to_have_attribute('aria-current','page')
    await page.goto('http://localhost:8080/order-tracking/deep-link?from=zalo')
    await chrome(page)
    await h.get_by_role('button',name='Quay lại',exact=True).click()
    await expect(page).to_have_url('http://localhost:8080/?area=Mua+H%C3%A0ng+%26+Giao+V%E1%BA%ADn')
    await n.get_by_role('link',name='Trang chủ',exact=True).click()
    await n.get_by_role('button',name='Thông báo',exact=True).click()
    await page.get_by_role('link',name='Thông báo đơn hàng').click()
    await expect(page).to_have_url('http://localhost:8080/order-tracking/order-notification');await chrome(page)
    await h.get_by_role('button',name='Thông báo',exact=True).click()
    await expect(h.get_by_role('button',name='Thông báo',exact=True)).to_have_attribute('aria-expanded','false')
    await page.screenshot(path=str(OUT/f'{w}-module.png'))
    assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth')
   assert not errs,errs
   print('PASS',w,'persistent chrome, scroll, home/back, deep link, modal, existing fixed action, no errors')
   await page.close()
  await b.close()
asyncio.run(main())
