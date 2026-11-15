// Isolated visual/interaction checks. All account, Page and API data is mocked.
import { mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium }=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
for(let attempt=0;attempt<30;attempt++) { try { const r=await fetch('http://127.0.0.1:4173/');if(r.ok)break; } catch {} if(attempt===29)throw new Error('UI fixture did not start');await new Promise(r=>setTimeout(r,500)); }
await mkdir('tests/inbox-ui/screenshots',{recursive:true});
const browser=await chromium.launch({headless:true});
try {
 for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]) {
  const page=await browser.newPage({viewport:{width,height}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/');await page.getByRole('button',{name:/Nguyễn Minh Anh/}).waitFor();
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error(`${name}: horizontal overflow in list`);
  await page.screenshot({path:`tests/inbox-ui/screenshots/${name}-list.png`,fullPage:true});
  await page.getByRole('button',{name:/Nguyễn Minh Anh/}).click();await page.getByLabel('Nội dung trả lời').waitFor();
  if(!await page.getByLabel('Nội dung trả lời').isEnabled())throw new Error(`${name}: authorized composer disabled`);
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error(`${name}: horizontal overflow in thread`);
  await page.screenshot({path:`tests/inbox-ui/screenshots/${name}-thread.png`,fullPage:true});
  await page.getByLabel('Nội dung trả lời').fill('Nội dung kiểm thử cục bộ, không gửi khách thật.');await page.getByRole('button',{name:'Gửi tin nhắn',exact:true}).click();
  await page.getByLabel('Nội dung trả lời').waitFor();
  await page.getByRole('tab',{name:/Chat Web/}).click();await page.getByRole('heading',{name:'Trò chuyện với khách ngay từ website'}).waitFor();
  await page.screenshot({path:`tests/inbox-ui/screenshots/${name}-chat-web.png`,fullPage:true});
  if(errors.length)throw new Error(`${name}: ${errors.join('; ')}`);await page.close();
 }
 console.log('Desktop and mobile Inbox: list, thread, composer, Chat Web and overflow checks passed.');
} finally {await browser.close();}
