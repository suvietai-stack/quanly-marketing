import './web-chat.css';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { chatAccess, chatControl, chatLocate, chatOverview, chatRotateKey, chatSaveSite, chatThread, chatThreadsFeed } from '@/lib/webChat/chat.functions';
import { settingsSchema } from '@/lib/webChat/model';
const labels:Record<string,string>={ai:'AI tiếp nhận',human:'Sale can thiệp',captured:'Đã chuyển tín hiệu'};
const presenceLabels:Record<string,string>={chat:'Đang chat',website:'Đang xem website',offline:'Đã rời'};
const defaults=()=>({name:'',domain:'',source:'',enabled:false,settings:settingsSchema.parse({})});
export function WebChatWorkspace(){
 const {user}=useCurrentUser();const uid=user?.id;const qc=useQueryClient();
 const [site,setSite]=useState(''),[selected,setSelected]=useState(''),[siteFilter,setSiteFilter]=useState('all'),[filter,setFilter]=useState('all'),[presenceFilter,setPresenceFilter]=useState('all'),[search,setSearch]=useState('');
 const [view,setView]=useState<'overview'|'manage'>('overview'),[adminTab,setAdminTab]=useState<'sites'|'permissions'>('sites'),[accessBusy,setAccessBusy]=useState('');
 const [config,setConfig]=useState<any>(null),[key,setKey]=useState(''),[keySite,setKeySite]=useState(''),[busy,setBusy]=useState(false),[text,setText]=useState(''),[accessSite,setAccessSite]=useState('');
 const overview=useQuery({queryKey:['wc',uid,'overview'],queryFn:()=>chatOverview(),enabled:!!uid,retry:1});
 const sites:any[]=overview.data?.sites??[];
 useEffect(()=>{if(!uid)return;const id=new URLSearchParams(window.location.search).get('conversation');if(!id)return;let live=true;void chatLocate({data:{id}}).then(r=>{if(live){setSite(r.site);setSelected(id);}}).catch(()=>toast.error('Không có quyền mở cuộc chat này'));return()=>{live=false;};},[uid]);
 const list=useQuery({queryKey:['wc',uid,'feed',siteFilter],queryFn:()=>chatThreadsFeed({data:siteFilter==='all'?{}:{site:siteFilter}}),enabled:!!uid&&!!overview.data?.installed&&sites.length>0,retry:1,refetchInterval:10000,refetchIntervalInBackground:false});
 const thread=useQuery({queryKey:['wc',uid,'thread',site,selected],queryFn:()=>chatThread({data:{site,id:selected}}),enabled:!!uid&&!!site&&!!selected,retry:1,refetchInterval:5000,refetchIntervalInBackground:false});
 const staff=useQuery({queryKey:['wc',uid,'access',accessSite],queryFn:()=>chatAccess({data:{site:accessSite}}),enabled:!!accessSite&&!!overview.data?.canManage,retry:1});
 const reload=()=>qc.invalidateQueries({queryKey:['wc',uid]});
 async function control(action:'read'|'takeover'|'resume'|'send'){
  if(busy)return;setBusy(true);try{await chatControl({data:{site,id:selected,action,request:crypto.randomUUID(),text}});if(action==='send')setText('');await reload();}catch(e){toast.error(e instanceof Error?e.message:'Không cập nhật được');}finally{setBusy(false);}
 }
 useEffect(()=>{if(selected&&site)void chatControl({data:{site,id:selected,action:'read',request:crypto.randomUUID()}}).catch(()=>{});},[selected,site]);
 const rows:any[]=list.data??[];const shown=rows.filter(c=>(filter==='all'||c.mode===filter)&&(presenceFilter==='all'||(presenceFilter==='active'?c.presence==='chat'||c.presence==='website':c.presence===presenceFilter))&&((c.summary||'')+' '+JSON.stringify(c.contact||{})).toLowerCase().includes(search.trim().toLowerCase()));const c:any=thread.data;
 const siteName=(id:string)=>sites.find(s=>s.id===id)?.name||'Website';
 async function save(){setBusy(true);try{const data={...config,settings:{...config.settings,starters:config.settings.starters.map((x:string)=>x.trim()).filter(Boolean).slice(0,6)}};const r=await chatSaveSite({data});setConfig(null);if(r.key){setKey(r.key);setKeySite(r.id!);}await reload();toast.success('Đã lưu');}catch(e){toast.error(e instanceof Error?e.message:'Không lưu được');}finally{setBusy(false);}}
 return <div className={`wc-workspace min-w-0 ${selected&&view==='overview'?'wc-thread-open':''}`}>
  <header className="wc-page-head">
   <div className="wc-page-heading">
    <span className="wc-eyebrow">TRUNG TÂM TƯ VẤN WEBSITE</span>
    <h1>Tư vấn Website</h1>
    <p>Đốm AI tiếp nhận nhu cầu · Sale theo dõi và hỗ trợ khách</p>
   </div>
   {overview.data?.canManage&&<Button className="wc-head-action" variant="outline" onClick={()=>{setView(view==='overview'?'manage':'overview');setSelected('');setSite('');}}>
    {view==='overview'?'Quản trị website':'← Về hội thoại'}
   </Button>}
  </header>
  {(overview.error||overview.data?.installed===false)&&<p role="alert" className="rounded-lg border p-4 text-sm text-destructive">{overview.error instanceof Error?overview.error.message:'Chat Web chưa được kích hoạt dữ liệu. Cần áp dụng migration phiên bản này.'}</p>}
  {view==='overview'?<>
   <section className="wc-overview-controls" aria-label="Tổng hợp và bộ lọc">
    <div className="wc-overview-filter">
     <label className="wc-filter-label" htmlFor="wc-site-filter">Theo dõi website
      <select id="wc-site-filter" value={siteFilter} onChange={e=>{setSiteFilter(e.target.value);setSelected('');setSite('');}}>
       <option value="all">Tất cả website</option>{sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
     </label>
     <span className="wc-filter-summary">{siteFilter==='all'?`${sites.length} website được theo dõi`:siteName(siteFilter)} · Tự cập nhật</span>
    </div>
    {!sites.length&&!overview.isPending&&!overview.error&&overview.data?.installed&&<div className="rounded-xl border p-8 text-center text-sm">{overview.data.canManage?'Chưa có website. Vào Quản trị website để thêm và cấu hình.':'Anh chị chưa được cấp website. Nhờ quản trị viên thêm quyền Chat Web.'}</div>}
    {!!sites.length&&<>
     <div className="wc-stats" aria-label="Thống kê hội thoại gần đây">
      {([
       {key:'all',label:'Hội thoại',value:rows.length,kind:'all'},
       {key:'active',label:'Đang online',value:rows.filter(r=>r.presence==='chat'||r.presence==='website').length,kind:'presence'},
       {key:'chat',label:'Đang chat',value:rows.filter(r=>r.presence==='chat').length,kind:'presence'}
      ] as const).map(stat=><button key={stat.key} type="button" className={`wc-stat wc-stat-${stat.key}`} aria-pressed={stat.kind==='all'?filter==='all'&&presenceFilter==='all':filter==='all'&&presenceFilter===stat.key} onClick={()=>{
       setFilter('all');setPresenceFilter(stat.kind==='all'?'all':stat.key);setSelected('');setSite('');
      }}>
       <strong>{stat.value}</strong><span>{stat.label}</span>
      </button>)}
     </div>
     <div className="wc-queue-toolbar">
      <div className="wc-queue-filters" role="group" aria-label="Lọc theo người phụ trách">
       {([
        {key:'all',label:'Tất cả',value:rows.length},
        {key:'ai',label:'Đốm AI',value:rows.filter(r=>r.mode==='ai').length},
        {key:'captured',label:'Đã có tín hiệu',value:rows.filter(r=>r.mode==='captured').length},
        {key:'human',label:'Sale can thiệp',value:rows.filter(r=>r.mode==='human').length}
       ] as const).map(m=><button type="button" key={m.key} aria-pressed={filter===m.key} onClick={()=>{setFilter(m.key);setSelected('');setSite('');}}>{m.label}<span>{m.value}</span></button>)}
      </div>
      <div className="wc-search-tools">
       <Input className="wc-search" aria-label="Tìm hội thoại" placeholder="Tên, SĐT hoặc nhu cầu…" value={search} onChange={e=>setSearch(e.target.value)}/>
       <select aria-label="Tình trạng khách trực tuyến" value={presenceFilter} onChange={e=>{setPresenceFilter(e.target.value);setSelected('');setSite('');}}>
        <option value="all">Mọi khách</option><option value="active">Đang online</option><option value="chat">Đang chat</option><option value="website">Đang xem web</option><option value="offline">Đã rời</option>
       </select>
       {(search||filter!=='all'||presenceFilter!=='all')&&<button type="button" className="wc-clear" onClick={()=>{setSearch('');setFilter('all');setPresenceFilter('all');}}>Xóa lọc</button>}
      </div>
     </div>
    </>}
   </section>
   {!!sites.length&&<div className="wc-columns">
    <section className={`wc-list ${selected?'wc-mobile-list-hidden':''}`} aria-label="Danh sách hội thoại">
     <div className="wc-section-heading"><strong>Cuộc trò chuyện</strong><span>{shown.length} hiển thị</span></div>
     {list.error&&<p role="alert" className="wc-list-note text-destructive">Không tải được hội thoại. <button type="button" className="underline" onClick={()=>list.refetch()}>Thử lại</button></p>}
     <div className="wc-conversation-list">
      {shown.map(r=><button type="button" key={r.id} aria-current={selected===r.id} onClick={()=>{setSite(r.site_id);setSelected(r.id);}} className="wc-contact">
       <div className="wc-contact-main">
        <span className="wc-contact-avatar" aria-hidden="true">{(r.contact?.name||'K').slice(0,1).toUpperCase()}</span>
        <span className="wc-contact-body">
         <span className="wc-contact-first">
          <strong>{r.contact?.name||r.contact?.phone||'Khách website'}</strong>
          {(!r.read_at||r.read_at<r.updated_at)&&<span className="wc-unread" aria-label="Tin chưa đọc"/>}
         </span>
         <span className="wc-contact-preview">{r.summary||'Khách đang trao đổi nhu cầu'}</span>
         <span className="wc-contact-tags"><span className="wc-site-tag">{siteName(r.site_id)}</span><span className={`wc-presence wc-presence-${r.presence||'offline'}`}>{presenceLabels[r.presence]||'Đã rời'}</span><span className={`wc-mode wc-mode-${r.mode}`}>{r.mode==='human'?'Sale':r.mode==='captured'?'Đã chuyển':'AI'}</span></span>
        </span>
       </div>
       {r.error&&<span className="wc-warning">AI cần kiểm tra</span>}
      </button>)}
      {!shown.length&&!list.isPending&&<p className="wc-list-note">Không có hội thoại phù hợp với bộ lọc.</p>}
      {list.isPending&&<p className="wc-list-note">Đang tải hội thoại…</p>}
     </div>
     <p className="wc-list-footnote">100 hội thoại gần nhất · Cập nhật khi mở trang</p>
    </section>
    <section className={`wc-thread ${!selected?'wc-mobile-thread-hidden':''}`} aria-label="Chi tiết hội thoại">
     {!selected?<div className="wc-empty"><span aria-hidden="true">✦</span><h2>Chọn một cuộc trò chuyện</h2><p>Quan sát Đốm AI tư vấn, xem nhu cầu hoặc tiếp nhận để phản hồi khách ngay.</p></div>:<>
      <div className="wc-thread-header">
       <Button className="wc-back" variant="ghost" onClick={()=>{setSelected('');setSite('');}}>← Hội thoại</Button>
       <div className="wc-thread-identity">
        <strong>{c?.contact?.name||c?.contact?.phone||'Khách website'}</strong>
        <div className="wc-thread-labels">
         <span className="wc-site-tag">{siteName(site)}</span>
         <span className={`wc-presence wc-presence-${c?.presence||'offline'}`}>{c?presenceLabels[c.presence]||'Đã rời':'Đang tải…'}</span>
         <span className={`wc-mode wc-mode-${c?.mode}`}>{labels[c?.mode]||'Đang tải…'}</span>
        </div>
       </div>
       <Button className="wc-takeover" variant="outline" disabled={busy||!c} onClick={()=>control(c?.mode==='human'?'resume':'takeover')}>{c?.mode==='human'?'Bật lại AI':'Can thiệp chat'}</Button>
      </div>
      {thread.error&&<p role="alert" className="wc-list-note text-destructive">Không tải được nội dung cuộc trò chuyện.</p>}
      {!!c&&<details className="wc-thread-info">
       <summary><span>Thông tin khách và nhu cầu</span><span className="wc-info-hint">{c.contact?.phone?'Đã có SĐT':'Xem chi tiết'}</span></summary>
       <div className="wc-info-body">
        <p><strong>Nhu cầu:</strong> {c.summary||'Chưa ghi nhận'}</p>
        <p><strong>SĐT:</strong> {c.contact?.phone||'Chưa có'} · <strong>Zalo:</strong> {c.contact?.zalo==='confirmed'?'Khách xác nhận':'Chưa xác nhận'}</p>
        {c.page_url&&<a className="underline break-all" href={c.page_url} target="_blank" rel="noreferrer">Trang khách đang xem</a>}
        {c.signal_id&&<p>Đã chuyển tín hiệu · Đốm AI · Mã {c.signal_id}</p>}
        {c.presence==='offline'&&c.last_seen_at&&<p>Hoạt động cuối: {new Date(c.last_seen_at).toLocaleString('vi-VN')}</p>}
       </div>
      </details>}
      <div className="wc-messages">
       {thread.isPending&&<p className="wc-list-note">Đang tải tin nhắn…</p>}
       {c?.messages?.map((m:any)=><div key={m.id} className={`wc-bubble wc-bubble-${m.role}`}>
        <p className="wc-bubble-meta">{m.role==='user'?'Khách':m.role==='staff'?'Nhân viên':'Đốm AI'} · {new Date(m.created_at).toLocaleString('vi-VN')}</p>
        <p className="whitespace-pre-wrap break-words">{m.body}</p>
        {m.state==='error'&&<p className="mt-2 text-xs text-destructive">AI chưa xử lý được tin này.</p>}
       </div>)}
      </div>
      {c?.mode==='human'?<form className="wc-compose" onSubmit={e=>{e.preventDefault();void control('send');}}>
       <Textarea aria-label="Trả lời khách" maxLength={2000} value={text} onChange={e=>setText(e.target.value)} placeholder={c.taken_by===c.userId?'Nhập lời nhắn cho khách…':'Nhân viên khác đang can thiệp'} disabled={c.taken_by!==c.userId}/>
       <Button type="submit" disabled={busy||!text.trim()||c.taken_by!==c.userId}>Gửi</Button>
      </form>:<div className="wc-ai-notice">Đốm AI đang phụ trách · Bấm “Can thiệp chat” để trả lời khách.</div>}
     </>}
    </section>
   </div>}
  </>:overview.data?.canManage&&<section className="wc-admin rounded-xl border bg-card p-4">
   <div className="wc-admin-top"><div><h2 className="text-lg font-semibold">Quản trị website</h2><p className="text-sm text-muted-foreground">Thêm website, cài đặt AI và cấp quyền nhân viên tại một nơi.</p></div><Button onClick={()=>setConfig(defaults())}>Thêm website</Button></div>
   <div className="wc-admin-tabs" role="group" aria-label="Quản trị website">
    <button type="button" aria-pressed={adminTab==='sites'} onClick={()=>setAdminTab('sites')}>Danh sách website</button>
    <button type="button" aria-pressed={adminTab==='permissions'} onClick={()=>setAdminTab('permissions')}>Phân quyền nhân viên</button>
   </div>
   {adminTab==='sites'?<>
    {sites.length===0?<p className="py-8 text-center text-sm text-muted-foreground">Chưa có website. Chọn “Thêm website” để bắt đầu.</p>:<div className="wc-admin-sites">
     {sites.map(s=><div key={s.id} className="wc-admin-site">
      <div className="wc-admin-name"><strong>{s.name}</strong><span className={`wc-site-status ${s.enabled?'wc-on':'wc-off'}`}>{s.enabled?'Đang bật':'Đang tắt'}</span></div>
      <div className="wc-admin-meta"><span className="wc-admin-field-label">Tên miền</span><span className="break-all">{s.domain}</span></div>
      <div className="wc-admin-meta"><span className="wc-admin-field-label">Nguồn tín hiệu</span><span>{s.source}</span></div>
      <div className="wc-admin-actions"><Button variant="outline" onClick={()=>setConfig({...s,settings:settingsSchema.parse(s.settings)})}>Cài đặt</Button><Button variant="outline" onClick={()=>{setAdminTab('permissions');setAccessSite(s.id);}}>Phân quyền</Button></div>
     </div>)}
    </div>}
    <div className="wc-admin-footer"><a href="/downloads/suviet-base-chat.zip" download className="underline underline-offset-4">Tải plugin WordPress</a><span>Cài plugin ở WordPress → Cài đặt → Base Chat, sau đó nhập ID và mã kết nối.</span></div>
   </>:<div className="wc-permissions">
    <label className="wc-filter-label" htmlFor="wc-access-site">Chọn website để phân quyền
     <select id="wc-access-site" value={accessSite} onChange={e=>setAccessSite(e.target.value)}><option value="">Chọn website</option>{sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
    </label>
    {!accessSite?<p className="py-6 text-sm text-muted-foreground">Chọn một website để xem và tích nhân viên được theo dõi.</p>:<>
     <p className="text-sm text-muted-foreground">Nhân viên được tích chọn có quyền <strong>xem hội thoại và can thiệp chat</strong> của website này. Quản trị tích hợp có quyền quản lý toàn bộ website.</p>
     {staff.isPending&&<p className="p-3 text-sm">Đang tải danh sách nhân viên…</p>}
     {staff.error&&<p role="alert" className="text-sm text-destructive">Không đọc được quyền nhân viên. <button type="button" className="underline" onClick={()=>staff.refetch()}>Thử lại</button></p>}
     <div className="wc-permission-list">{staff.data?.staff.map((p:any)=><label key={p.id} className="wc-permission-item"><input type="checkbox" disabled={!!accessBusy} checked={staff.data.allowed.includes(p.id)} onChange={async e=>{if(accessBusy)return;setAccessBusy(p.id);try{await chatAccess({data:{site:accessSite,user:p.id,enabled:e.target.checked}});await staff.refetch();}catch{toast.error('Không cập nhật được quyền');}finally{setAccessBusy('');}}}/><span>{p.full_name}</span></label>)}</div>
    </>}
   </div>}
  </section>}
  <Dialog open={!!config} onOpenChange={v=>!v&&setConfig(null)}>
   <DialogContent className="wc-settings sm:max-w-2xl">
    <DialogHeader><DialogTitle>{config?.id?'Cài đặt website':'Thêm website'}</DialogTitle></DialogHeader>
    {config&&<form className="wc-settings-form" onSubmit={e=>{e.preventDefault();void save();}}>
     <section className="wc-settings-group">
      <h3>Website & kết nối</h3>
      <div className="wc-settings-fields">
       {(['name','domain'] as const).map(k=><label className="wc-settings-field" key={k}>{k==='name'?'Tên website':'Tên miền (không có https://)'}<Input required value={config[k]} onChange={e=>setConfig({...config,[k]:e.target.value})}/></label>)}
       <label className="wc-settings-field">Nguồn tín hiệu<select required className="w-full rounded-md border bg-background p-2" value={config.source} onChange={e=>setConfig({...config,source:e.target.value})}><option value="">Chọn trong Kho nguồn</option>{overview.data?.sources.map((s:string)=><option key={s}>{s}</option>)}</select></label>
       <label className="wc-switch"><input type="checkbox" checked={config.enabled} onChange={e=>setConfig({...config,enabled:e.target.checked})}/><span><strong>Bật Chat Web</strong><small>Khách có thể trò chuyện và gửi nhu cầu về Base</small></span></label>
      </div>
     </section>
     <details className="wc-settings-group">
      <summary>Giao diện và lời chào <span>Nhân vật, màu sắc, hình ảnh</span></summary>
      <div className="wc-settings-fields">
       {Object.entries({character:'Tên nhân vật',greeting:'Lời chào',invitation:'Câu mời trên bong bóng',color:'Màu giao diện (#RRGGBB)',avatar:'URL ảnh đại diện HTTPS'}).map(([k,label])=><label key={k} className="wc-settings-field">{label}{k==='greeting'?<Textarea rows={2} value={config.settings[k]} onChange={e=>setConfig({...config,settings:{...config.settings,[k]:e.target.value}})}/>:<Input value={config.settings[k]} onChange={e=>setConfig({...config,settings:{...config.settings,[k]:e.target.value}})}/>}</label>)}
       <label className="wc-settings-field">Câu hỏi bấm nhanh (mỗi dòng một câu, tối đa 6)<Textarea rows={3} value={config.settings.starters.join('\n')} onChange={e=>setConfig({...config,settings:{...config.settings,starters:e.target.value.split('\n')}})}/></label>
       <label className="wc-switch"><input type="checkbox" checked={config.settings.showGreeting} onChange={e=>setConfig({...config,settings:{...config.settings,showGreeting:e.target.checked}})}/><span>Hiện lời chào bên ngoài biểu tượng chat</span></label>
       <label className="wc-settings-field">Hiện sau bao nhiêu giây (3–60)<Input type="number" min={3} max={60} value={config.settings.greetingDelay} onChange={e=>setConfig({...config,settings:{...config.settings,greetingDelay:Number(e.target.value)}})}/></label>
       <label className="wc-settings-field">Tải ảnh đại diện PNG/JPG/WebP (dưới 70 KB)<input className="wc-file-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>70000||!['image/png','image/jpeg','image/webp'].includes(file.type)){toast.error('Chọn PNG/JPG/WebP dưới 70 KB');return;}const reader=new FileReader();reader.onload=()=>setConfig((current:any)=>current?{...current,settings:{...current.settings,avatar:String(reader.result)}}:current);reader.readAsDataURL(file);}}/></label>
      </div>
     </details>
     <details className="wc-settings-group">
      <summary>Hướng dẫn Đốm AI <span>Văn phong, mục tiêu và kiến thức</span></summary>
      <div className="wc-settings-fields">
       {Object.entries({tone:'Văn phong, xưng hô',goals:'Mục tiêu tiếp nhận nhu cầu',knowledge:'Kiến thức được phép tư vấn',closing:'Lời nhắn sau khi chuyển tín hiệu'}).map(([k,label])=><label className="wc-settings-field" key={k}>{label}<Textarea rows={k==='knowledge'?6:3} value={config.settings[k]} onChange={e=>setConfig({...config,settings:{...config.settings,[k]:e.target.value}})}/></label>)}
       <p className="text-xs text-muted-foreground">Chỉ nhập kiến thức công khai, được phép trả lời khách. Đốm AI không đọc dữ liệu nội bộ Base.</p>
      </div>
     </details>
     {config.id&&<details className="wc-settings-group wc-settings-key">
      <summary>Mã kết nối WordPress <span>Chỉ đổi khi cần thiết</span></summary>
      <div className="wc-settings-fields">
       <p className="break-all text-xs">ID website: {config.id}</p>
       <Button type="button" variant="outline" disabled={busy} onClick={async()=>{setBusy(true);try{const r=await chatRotateKey({data:{site:config.id}});setKey(r.key);setKeySite(config.id);setConfig(null);}catch{toast.error('Không cấp được mã');}finally{setBusy(false);}}}>Cấp mã mới (mã cũ sẽ hết hiệu lực)</Button>
      </div>
     </details>}
     <div className="wc-settings-save"><Button disabled={busy} type="submit">{busy?'Đang lưu…':'Lưu cấu hình'}</Button></div>
    </form>}
   </DialogContent>
  </Dialog>  <Dialog open={!!key} onOpenChange={v=>!v&&setKey('')}><DialogContent><DialogHeader><DialogTitle>Kết nối plugin WordPress</DialogTitle></DialogHeader><p className="text-sm">Tải, cài và kích hoạt plugin. Vào WordPress → Cài đặt → Base Chat, nhập hai giá trị rồi bật chat.</p><label className="text-sm">ID website<Input readOnly value={keySite}/></label><label className="text-sm">Mã kết nối — chỉ hiện lần này<Input readOnly value={key}/></label><p className="text-xs text-muted-foreground">Không chèn mã vào JavaScript hoặc bài viết. Mất mã: cấp mã mới trong cài đặt website.</p></DialogContent></Dialog>
 </div>;
}

