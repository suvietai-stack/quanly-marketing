import asyncio,json,copy
from pathlib import Path
from playwright.async_api import async_playwright,expect
HTML='''<div id="root"></div><script type="module">import RefreshRuntime from "/@react-refresh";RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;</script><script type="module" src="/tests/signals.browser.tsx"></script>'''
OUT=Path('/tmp/browser/signal-mobile');UID='00000000-0000-0000-0000-000000000001'
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  for width,height in [(320,740),(360,800),(390,844),(430,932),(1280,1800)]:
   context=await browser.new_context(viewport={'width':width,'height':height},permissions=['clipboard-read','clipboard-write']);page=await context.new_page();errors=[];writes=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   rows=[dict(id=f'00000000-0000-0000-0000-{i:012d}',customer_name='Công ty Quà Tặng Gốm Sứ Việt Nam Khách Hàng Tên Dài' if i==4 else f'Khách {i}',phone='' if i==5 else '0989 123 456',need_detail=None if i==5 else 'Bộ quà tặng gốm sứ in logo cho dịp cuối năm và gửi mẫu kiểm tra trước khi đặt số lượng lớn. '*8,products=[],need_group=None,source='Website',status='deposit' if i==4 else 'consulting',potential='high' if i==4 else 'unrated',assigned_to=UID,created_by=UID,created_at='2026-11-06T01:00:00Z',updated_at='2026-11-06T01:00:00Z',next_contact_on='2026-12-12',cancelled_at=None) for i in range(4,49)]
   original=copy.deepcopy(rows)
   async def backend(r):
    path=r.request.url.split('/rest/v1/')[-1].split('?')[0];data=[]
    if path in ('opportunity_signals','signal_list_priority'):data=rows
    elif path=='rpc/signal_progression_deadlines':data=[dict(signal_id=s['id'],deadline_state='overdue' if i<2 else 'today',due_on='2026-11-05',next_due_on='2026-11-12',sale_id=UID,sequence=1,overdue_days=1,calculated_at='2026-11-06T08:00:00Z') for i,s in enumerate(rows)]
    if r.request.method!='GET' and not path.startswith('rpc/signal_progression'):writes.append(path)
    await r.fulfill(content_type='application/json',body=json.dumps(data))
   await page.route('**/mobile-fixture*',lambda r:r.fulfill(content_type='text/html',body=HTML));await page.route('**/rest/v1/**',backend);await page.route('**/_serverFn/**',lambda r:r.fulfill(content_type='application/json',body='{}'))
   await page.goto('http://localhost:8080/mobile-fixture');await expect(page.get_by_label('Tìm tín hiệu')).to_be_visible()
   await expect(page.get_by_role('button',name='Mở chi tiết tín hiệu:',exact=False).first).to_be_visible()
   if width<768:
    cards=page.locator('article.signal-card');await expect(cards).to_have_count(30)
    first=cards.first;await expect(first.get_by_role('link',name='0989 123 456',exact=True)).to_have_attribute('href','tel:0989123456')
    await expect(first.get_by_text('Hạn cập nhật 05/11',exact=True)).to_be_visible()
    assert await first.get_by_role('link',name='Gọi',exact=True).get_attribute('href')=='tel:0989123456'
    await first.get_by_role('link',name='Gọi',exact=True).evaluate('(e)=>e.addEventListener("click",event=>event.preventDefault())')
    await first.get_by_role('link',name='Gọi',exact=True).click();await expect(page.get_by_role('dialog')).to_have_count(0)
    missing=cards.nth(1);await expect(missing.get_by_role('button',name='Gọi',exact=True)).to_be_disabled();await expect(missing.get_by_role('button',name='Zalo',exact=True)).to_be_disabled();await expect(missing.get_by_text('Chưa có thông tin',exact=True)).to_be_visible()
    await first.get_by_role('button',name='Zalo',exact=True).click();d=page.get_by_role('dialog',name='Liên hệ Zalo',exact=True)
    await d.get_by_role('button',name='Sao chép số điện thoại',exact=True).click();await expect(d.get_by_role('button',name='Đã sao chép số',exact=True)).to_be_visible()
    await d.get_by_role('button',name='Close',exact=True).click();await expect(page.get_by_role('dialog')).to_have_count(0)
    bar=page.get_by_role('group',name='Trạng thái tín hiệu',exact=True)
    await expect(bar.get_by_role('button',name='Tất cả 45',exact=True)).to_be_visible();await bar.get_by_role('button',name='Chờ xác nhận / cọc 1',exact=True).click();await expect(cards).to_have_count(1)
    await expect(bar.get_by_role('button',name='Tất cả 45',exact=True)).to_be_attached()
    await page.get_by_role('button',name='Bộ lọc (1)',exact=True).click();d=page.get_by_role('dialog',name='Bộ lọc',exact=True)
    await d.get_by_label('Hạn cập nhật diễn biến',exact=True).select_option('overdue');await d.get_by_role('button',name='Áp dụng',exact=True).click();await expect(cards).to_have_count(1);await expect(page.get_by_role('button',name='Bộ lọc (2)',exact=True)).to_be_visible()
    await page.get_by_role('button',name='Bộ lọc (2)',exact=True).click();d=page.get_by_role('dialog',name='Bộ lọc',exact=True);await d.get_by_label('Hạn cập nhật diễn biến',exact=True).select_option('today');await d.get_by_role('button',name='Close',exact=True).click();await expect(cards).to_have_count(1)
    await page.reload();await expect(page.get_by_role('button',name='Bộ lọc (2)',exact=True)).to_be_visible();await expect(cards).to_have_count(1)
    await page.get_by_role('button',name='Bộ lọc (2)',exact=True).click();await page.get_by_role('dialog',name='Bộ lọc',exact=True).get_by_role('button',name='Xóa bộ lọc',exact=True).click();await expect(cards).to_have_count(30)
    await page.get_by_role('button',name='Tải thêm',exact=True).click();await expect(cards).to_have_count(45)
    target=cards.nth(20);await target.scroll_into_view_if_needed();y=await page.evaluate('scrollY');await target.get_by_role('button',name='Xem / Cập nhật' if width>=360 else 'Chi tiết',exact=True).click();await page.get_by_role('dialog').get_by_role('button',name='Close',exact=True).click();await page.wait_for_timeout(250);assert abs(await page.evaluate('scrollY')-y)<4;await expect(cards).to_have_count(45)
    await page.evaluate('scrollTo(0,0)');await page.screenshot(path=str(OUT/f'{width}-list.png'))
    assert await page.locator('section[aria-label="Hạn cập nhật diễn biến"]:visible').count()==0
   else:
    await expect(page.locator('table:visible')).to_have_count(1);await expect(page.locator('article:visible')).to_have_count(0);await page.screenshot(path=str(OUT/f'{width}-desktop.png'))
   assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth')
   assert not errors,errors
   assert rows==original
   assert not [x for x in writes if any(k in x for k in ['save','update','insert'])],writes
   print('PASS',width,'layout/contact/fallback/status/draft-deadline/persistence/load-more/scroll/desktop/no-business-writes')
   await context.close()
  await browser.close()
asyncio.run(main())
