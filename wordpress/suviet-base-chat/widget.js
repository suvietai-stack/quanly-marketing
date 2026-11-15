(() => {
  'use strict';
  if (!window.SVBaseChat || document.getElementById('svwc-root')) return;
  const uuid=()=>typeof crypto.randomUUID==='function'?crypto.randomUUID():'10000000-1000-4000-8000-100000000000'.replace(/[018]/g,c=>(Number(c)^crypto.getRandomValues(new Uint8Array(1))[0]&15>>Number(c)/4).toString(16));
  const root=document.createElement('div');root.id='svwc-root';document.body.append(root);root.lang='vi';
  const box=document.createElement('section');box.className='svwc-box';box.hidden=true;box.setAttribute('aria-label','Trò chuyện tư vấn');
  const header=document.createElement('header'),avatar=document.createElement('img'),title=document.createElement('strong'),close=document.createElement('button');
  close.textContent='×';close.setAttribute('aria-label','Đóng trò chuyện');const identity=document.createElement('div');identity.className='svwc-identity';const subtitle=document.createElement('span');subtitle.textContent='Trợ lý tư vấn AI · Chat 24/7';identity.append(title,subtitle);header.append(avatar,identity,close);avatar.alt='';
  const transcript=document.createElement('div');transcript.className='svwc-transcript';transcript.setAttribute('role','log');transcript.setAttribute('aria-live','polite');
  const status=document.createElement('p');status.className='svwc-status';
  const form=document.createElement('form'),input=document.createElement('textarea'),send=document.createElement('button');
  input.maxLength=2000;input.placeholder='Nhập lời nhắn…';input.setAttribute('aria-label','Lời nhắn');input.rows=1;send.textContent='Gửi';send.setAttribute('aria-label','Gửi tin nhắn');send.type='submit';form.append(input,send);
  const privacy=document.createElement('small');privacy.textContent='Trợ lý AI hỗ trợ tiếp nhận nhu cầu. Khi cung cấp liên hệ, anh chị đồng ý để bộ phận tư vấn liên hệ về nhu cầu này.';
  box.append(header,transcript,status,form,privacy);
  const launcher=document.createElement('button');launcher.className='svwc-launcher';launcher.setAttribute('aria-label','Mở trò chuyện tư vấn');const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('aria-hidden','true');const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M4 4h16v12H9l-5 4V4zm4 5h8M8 12h5');icon.append(path);const launcherLabel=document.createElement('span');launcherLabel.textContent='Chat 24/7';launcher.append(icon,launcherLabel);launcher.setAttribute('aria-label','Chat tư vấn AI 24/7');launcher.setAttribute('aria-expanded','false');const teaser=document.createElement('aside');teaser.className='svwc-teaser';teaser.hidden=true;const teaserClose=document.createElement('button');teaserClose.textContent='×';teaserClose.setAttribute('aria-label','Ẩn lời chào');const teaserText=document.createElement('button');teaser.append(teaserClose,teaserText);const starters=document.createElement('div');starters.className='svwc-starters';box.insertBefore(starters,status);root.append(box,teaser,launcher);let greeted=false;let greetingTimer;teaserText.textContent='Dạ, anh/chị cần tư vấn sản phẩm nào ạ? Em hỗ trợ mình 24/7.';greetingTimer=setTimeout(()=>{let dismissed=false;try{dismissed=sessionStorage.getItem('svwc-greeted')==='1';}catch{}if(box.hidden&&!dismissed){teaser.hidden=false;launcher.classList.add('svwc-pulse');}},3000);teaserClose.onclick=()=>{teaser.hidden=true;try{sessionStorage.setItem('svwc-greeted','1');}catch{}};teaserText.onclick=()=>launcher.click();
  const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),v=>v.toString(16).padStart(2,'0')).join('');
  let token;try{token=localStorage.getItem('svwc-token');if(!/^[a-f0-9]{64}$/.test(token||'')){token=random();localStorage.setItem('svwc-token',token);}}catch{token=random();}
  let busy=false,pending=null,timer=null,appearance=null,lastSignature='';
  status.setAttribute('role','status');const setStatus=t=>{status.textContent=t;status.classList.toggle('svwc-working',busy);};
  const render=data=>{
    appearance=data.appearance||appearance;
    if(appearance){title.textContent=appearance.character;launcher.setAttribute('aria-label','Chat 24/7 · '+(appearance.invitation||'Tư vấn AI'));teaserText.textContent=appearance.greeting;starters.replaceChildren();for(const q of appearance.starters||[]){const b=document.createElement('button');b.type='button';b.textContent=q;b.onclick=()=>{if(busy||pending)return;input.value=q;if(typeof form.requestSubmit==='function')form.requestSubmit();else form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));};starters.append(b);}if(appearance.showGreeting===false){clearTimeout(greetingTimer);teaser.hidden=true;}root.style.setProperty('--svwc-color',appearance.color);avatar.hidden=!appearance.avatar;if(appearance.avatar)avatar.src=appearance.avatar;}
    if(!data.messages)return;const rows=data.messages, signature=JSON.stringify(rows);starters.hidden=rows.some(m=>m.role==='user');
    if(signature!==lastSignature){lastSignature=signature;transcript.replaceChildren();
      const add=(role,body)=>{const p=document.createElement('p');p.className='svwc-message svwc-'+role;const content=document.createElement('span');content.textContent=body;p.append(content);if(role!=='assistant'||body!==appearance?.greeting){const time=document.createElement('time');time.className='svwc-time';time.textContent=role==='user'?'Anh/chị':role==='staff'?'Tư vấn viên':appearance?.character||'Trợ lý AI';p.append(time);}transcript.append(p);};
      if(appearance)add('assistant',appearance.greeting);for(const m of rows)add(m.role,m.body);transcript.scrollTop=transcript.scrollHeight;
    }
    if(data.error)setStatus(data.error+' Bấm Gửi để thử lại nếu cần.');
    else setStatus(data.mode==='human'?'Nhân viên đang tiếp nhận cuộc trò chuyện.':data.mode==='captured'?'Đã chuyển thông tin — bộ phận tư vấn sẽ liên hệ.':rows.some(m=>m.state==='pending')?'AI đang phản hồi…':'AI hỗ trợ tiếp nhận nhu cầu');
  };
  async function request(action,text='',id=uuid()){
    const page=location.origin+location.pathname;
    const response=await fetch(window.SVBaseChat.endpoint,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,token,request:id,text,page}),signal:typeof AbortSignal!=='undefined'&&typeof AbortSignal.timeout==='function'?AbortSignal.timeout(55000):undefined});
    const data=await response.json();if(!response.ok)throw new Error(data.error||data.message||'Chưa kết nối được');render(data);return data;
  }
  async function poll(){if(box.hidden||document.hidden||busy)return;schedule(false);busy=true;try{await request('poll');}catch{setStatus('Kết nối gián đoạn. Mở lại khung chat để thử lại.');}finally{busy=false;schedule();}}
  function schedule(start=true){if(timer)clearTimeout(timer);if(start&&!box.hidden)timer=setTimeout(poll,10000);}
  launcher.onclick=()=>{teaser.hidden=true;launcher.classList.remove('svwc-pulse');try{sessionStorage.setItem('svwc-greeted','1');}catch{}box.hidden=!box.hidden;launcher.setAttribute('aria-expanded',String(!box.hidden));if(!box.hidden){input.focus();poll();}else schedule(false);};
  close.onclick=()=>{box.hidden=true;launcher.setAttribute('aria-expanded','false');schedule(false);launcher.focus();};
  form.onsubmit=async event=>{event.preventDefault();if(busy)return;if(!pending){const text=input.value.trim();if(!text)return;pending={text,id:uuid()};}busy=true;send.disabled=true;setStatus('Đang gửi…');try{await request('send',pending.text,pending.id);pending=null;input.value='';send.textContent='Gửi';}catch(e){setStatus(e.message+' · Bấm Thử lại để gửi lại an toàn.');send.textContent='Thử lại';}finally{busy=false;send.disabled=false;schedule();}};
  input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();if(typeof form.requestSubmit==='function')form.requestSubmit();else form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));}});
request('config').catch(()=>{setStatus('Chat chưa kết nối. Vui lòng thử lại sau.');});
})();
