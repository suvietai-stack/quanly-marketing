(() => {
  'use strict';
  if (!window.SVBaseChat || document.getElementById('svwc-root')) return;
  const root=document.createElement('div');root.id='svwc-root';document.body.append(root);
  const box=document.createElement('section');box.className='svwc-box';box.hidden=true;box.setAttribute('aria-label','Trò chuyện tư vấn');
  const header=document.createElement('header'),avatar=document.createElement('img'),title=document.createElement('strong'),close=document.createElement('button');
  close.textContent='×';close.setAttribute('aria-label','Đóng trò chuyện');header.append(avatar,title,close);
  const transcript=document.createElement('div');transcript.className='svwc-transcript';transcript.setAttribute('role','log');transcript.setAttribute('aria-live','polite');
  const status=document.createElement('p');status.className='svwc-status';
  const form=document.createElement('form'),input=document.createElement('textarea'),send=document.createElement('button');
  input.maxLength=2000;input.placeholder='Nhập lời nhắn…';input.setAttribute('aria-label','Lời nhắn');input.rows=2;send.textContent='Gửi';send.type='submit';form.append(input,send);
  const privacy=document.createElement('small');privacy.textContent='Trợ lý AI hỗ trợ tiếp nhận nhu cầu. Khi cung cấp liên hệ, anh chị đồng ý để bộ phận tư vấn liên hệ về nhu cầu này.';
  box.append(header,transcript,status,form,privacy);
  const launcher=document.createElement('button');launcher.className='svwc-launcher';launcher.textContent='Chat tư vấn';launcher.setAttribute('aria-expanded','false');root.append(box,launcher);
  const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),v=>v.toString(16).padStart(2,'0')).join('');
  let token;try{token=localStorage.getItem('svwc-token');if(!/^[a-f0-9]{64}$/.test(token||'')){token=random();localStorage.setItem('svwc-token',token);}}catch{token=random();}
  let busy=false,pending=null,timer=null,appearance=null,lastSignature='';
  const setStatus=t=>{status.textContent=t;};
  const render=data=>{
    appearance=data.appearance||appearance;
    if(appearance){title.textContent=appearance.character+' · Trợ lý AI';launcher.textContent=appearance.invitation||'Chat tư vấn';root.style.setProperty('--svwc-color',appearance.color);avatar.hidden=!appearance.avatar;if(appearance.avatar)avatar.src=appearance.avatar;}
    const rows=data.messages||[], signature=JSON.stringify(rows);
    if(signature!==lastSignature){lastSignature=signature;transcript.replaceChildren();
      const add=(role,body)=>{const p=document.createElement('p');p.className='svwc-message svwc-'+role;p.textContent=body;transcript.append(p);};
      if(appearance)add('assistant',appearance.greeting);for(const m of rows)add(m.role,m.body);transcript.scrollTop=transcript.scrollHeight;
    }
    if(data.error)setStatus(data.error+' Bấm Gửi để thử lại nếu cần.');
    else setStatus(data.mode==='human'?'Nhân viên đang tiếp nhận cuộc trò chuyện.':data.mode==='captured'?'Đã chuyển thông tin — bộ phận tư vấn sẽ liên hệ.':rows.some(m=>m.state==='pending')?'AI đang phản hồi…':'AI hỗ trợ tiếp nhận nhu cầu');
  };
  async function request(action,text='',id=crypto.randomUUID()){
    const page=location.origin+location.pathname;
    const response=await fetch(window.SVBaseChat.endpoint,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,token,request:id,text,page}),signal:AbortSignal.timeout(55000)});
    const data=await response.json();if(!response.ok)throw new Error(data.error||data.message||'Chưa kết nối được');render(data);return data;
  }
  async function poll(){if(box.hidden||document.hidden||busy)return;schedule(false);busy=true;try{await request('poll');}catch{setStatus('Kết nối gián đoạn. Mở lại khung chat để thử lại.');}finally{busy=false;schedule();}}
  function schedule(start=true){if(timer)clearTimeout(timer);if(start&&!box.hidden)timer=setTimeout(poll,10000);}
  launcher.onclick=()=>{box.hidden=!box.hidden;launcher.setAttribute('aria-expanded',String(!box.hidden));if(!box.hidden){input.focus();poll();}else schedule(false);};
  close.onclick=()=>{box.hidden=true;launcher.setAttribute('aria-expanded','false');schedule(false);launcher.focus();};
  form.onsubmit=async event=>{event.preventDefault();if(busy)return;if(!pending){const text=input.value.trim();if(!text)return;pending={text,id:crypto.randomUUID()};}busy=true;send.disabled=true;setStatus('Đang gửi…');try{await request('send',pending.text,pending.id);pending=null;input.value='';send.textContent='Gửi';}catch(e){setStatus(e.message+' · Bấm Thử lại để gửi lại an toàn.');send.textContent='Thử lại';}finally{busy=false;send.disabled=false;schedule();}};
  input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form.requestSubmit();}});
})();
