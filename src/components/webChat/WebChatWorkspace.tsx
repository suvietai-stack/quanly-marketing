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
const defaults=()=>({name:'',domain:'',source:'',enabled:false,settings:settingsSchema.parse({})});
export function WebChatWorkspace(){
 const {user}=useCurrentUser();const uid=user?.id;const qc=useQueryClient();
 const [site,setSite]=useState(''),[selected,setSelected]=useState(''),[siteFilter,setSiteFilter]=useState('all'),[filter,setFilter]=useState('all'),[search,setSearch]=useState('');
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
 const rows:any[]=list.data??[];const shown=rows.filter(c=>(filter==='all'||c.mode===filter)&&((c.summary||'')+' '+JSON.stringify(c.contact||{})).toLowerCase().includes(search.trim().toLowerCase()));const c:any=thread.data;
 const siteName=(id:string)=>sites.find(s=>s.id===id)?.name||'Website';
 async function save(){setBusy(true);try{const r=await chatSaveSite({data:config});setConfig(null);if(r.key){setKey(r.key);setKeySite(r.id!);}await reload();toast.success('Đã lưu');}catch(e){toast.error(e instanceof Error?e.message:'Không lưu được');}finally{setBusy(false);}}
 return <div className={`wc-workspace min-w-0 space-y-4 ${selected&&view==='overview'?'wc-thread-open':''}`}>
  <header className="wc-hero flex flex-wrap items-center justify-between gap-4">
   <div><span className="wc-eyebrow">TRUNG TÂM TƯ VẤN WEBSITE</span><h1 className="text-2xl font-semibold">Tư vấn Website</h1><p className="mt-1 text-sm text-muted-foreground">AI tiếp nhận nhu cầu · Đốm AI tạo tín hiệu · Sale quan sát và can thiệp</p></div>
   {overview.data?.canManage&&<Button variant="outline" onClick={()=>{setView('manage');setAdminTab('sites');setSelected('');setSite('');}}>Quản lý website</Button>}
  </header>
  <nav className="wc-tabs" aria-label="Khu vực Tư vấn Website">
   <button type="button" aria-current={view==='overview'?'page':undefined} onClick={()=>setView('overview')}>Tổng hợp hội thoại</button>
   {overview.data?.canManage&&<button type="button" aria-current={view==='manage'?'page':undefined} onClick={()=>{setView('manage');setSelected('');setSite('');}}>Quản trị website</button>}
  </nav>
  {(overview.error||overview.data?.installed===false)&&<p role="alert" className="rounded-lg border p-4 text-sm text-destructive">{overview.error instanceof Error?overview.error.message:'Chat Web chưa được kích hoạt dữ liệu. Cần áp dụng migration phiên bản này.'}</p>}
  {view==='overview'?<>
   <div className="wc-filterbar">
    <label className="wc-filter-label" htmlFor="wc-site-filter">Website
     <select id="wc-site-filter" value={siteFilter} onChange={e=>{setSiteFilter(e.target.value);setSelected('');setSite('');}}>
      <option value="all">Tất cả website</option>{sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
     </select>
    </label>
    <span className="wc-filter-summary">{siteFilter==='all'?`Đang tổng hợp ${sites.length} website`:siteName(siteFilter)}</span>
   </div>
   {!sites.length&&!overview.isPending&&!overview.error&&overview.data?.installed&&<div className="rounded-xl border p-8 text-center text-sm">{overview.data.canManage?'Chưa có website. Vào Quản trị website để thêm và cấu hình.':'Anh chị chưa được cấp website. Nhờ quản trị viên thêm quyền Chat Web.'}</div>}
   {!!sites.length&&<>
    <div className="wc-metrics" aria-label="Thống kê 100 hội thoại gần đây theo bộ lọc website">
     {([{key:'all',label:'Hội thoại gần đây',value:rows.length},{key:'ai',label:'AI tiếp nhận',value:rows.filter(r=>r.mode==='ai').length},{key:'captured',label:'Đã chuyển tín hiệu',value:rows.filter(r=>r.mode==='captured').length},{key:'human',label:'Sale can thiệp',value:rows.filter(r=>r.mode==='human').length}] as const).map(m=><button type="button" key={m.key} className={`wc-metric wc-metric-${m.key} ${filter===m.key?'wc-metric-active':''}`} aria-pressed={filter===m.key} onClick={()=>{setFilter(m.key);setSelected('');setSite('');}}><span>{m.label}</span><strong>{m.value}</strong></button>)}
    </div>
    <div className="wc-columns grid min-h-[560px] gap-4 lg:grid-cols-[340px_1fr]">
     <section className={`wc-list space-y-3 rounded-xl border bg-card p-3 ${selected?'hidden lg:block':''}`}>
      <div className="wc-section-heading"><strong>Cuộc trò chuyện</strong><span>{shown.length} hiển thị</span></div>
      <Input aria-label="Tìm khách" placeholder="Tìm số điện thoại, nhu cầu…" value={search} onChange={e=>setSearch(e.target.value)}/>
      <select aria-label="Trạng thái hội thoại" className="w-full rounded-md border bg-background p-2" value={filter} onChange={e=>{setFilter(e.target.value);setSelected('');setSite('');}}><option value="all">Tất cả trạng thái</option>{Object.entries(labels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
      {list.error&&<p role="alert" className="text-sm text-destructive">Không tải được danh sách. <button type="button" className="underline" onClick={()=>list.refetch()}>Thử lại</button></p>}
      <div className="wc-conversation-list max-h-[65vh] space-y-2 overflow-y-auto">
       {shown.map(r=><button type="button" key={r.id} aria-current={selected===r.id} onClick={()=>{setSite(r.site_id);setSelected(r.id);}} className={`wc-contact w-full rounded-lg border p-3 text-left ${selected===r.id?'bg-primary/10':''}`}>
        <div className="wc-contact-heading"><span className="wc-contact-avatar" aria-hidden="true">{(r.contact?.name||'K').slice(0,1).toUpperCase()}</span><strong className="text-sm">{r.contact?.name||r.contact?.phone||'Khách website'}</strong>{(!r.read_at||r.read_at<r.updated_at)&&<span className="wc-new">● Mới</span>}</div>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.summary||'Đang tiếp nhận nhu cầu'}</p>
        <div className="wc-contact-footer"><span className="wc-site-tag">{siteName(r.site_id)}</span><span className={`wc-mode wc-mode-${r.mode}`}>{labels[r.mode]||'Đang xử lý'}</span>{r.error&&<span className="wc-warning">Cần kiểm tra</span>}</div>
       </button>)}
       {!shown.length&&!list.isPending&&<p className="p-4 text-sm text-muted-foreground">Chưa có cuộc chat phù hợp.</p>}
       {list.isPending&&<p className="p-4 text-sm text-muted-foreground">Đang tải hội thoại…</p>}
      </div>
      <p className="text-xs text-muted-foreground">Tối đa 100 hội thoại gần nhất theo website đã chọn · tự cập nhật khi mở</p>
     </section>
     <section className={`wc-thread flex min-w-0 flex-col rounded-xl border bg-card ${!selected?'hidden lg:flex':''}`}>
      {!selected?<div className="wc-empty"><span aria-hidden="true">✦</span><h2>Theo dõi cuộc trò chuyện</h2><p>AI đón khách và thu nhu cầu. Anh chị có thể quan sát hoặc can thiệp khi cần.</p><small>Chọn một khách ở danh sách để bắt đầu.</small></div>:<>
       <div className="wc-thread-header flex flex-wrap items-center justify-between gap-2 border-b p-3">
        <Button className="lg:hidden" variant="ghost" onClick={()=>{setSelected('');setSite('');}} aria-label="Quay lại danh sách">← Danh sách</Button>
        <div><strong>{c?.contact?.name||c?.contact?.phone||'Khách website'}</strong><div className="wc-thread-labels"><span className="wc-site-tag">{siteName(site)}</span><span className={`wc-mode wc-mode-${c?.mode}`}>{labels[c?.mode]||'Đang tải…'}</span></div></div>
        <Button variant="outline" disabled={busy||!c} onClick={()=>control(c?.mode==='human'?'resume':'takeover')}>{c?.mode==='human'?'Bật lại AI':'Can thiệp · Dừng AI'}</Button>
       </div>
       {thread.error&&<p role="alert" className="p-4 text-destructive">Không tải được cuộc chat.</p>}
       {!!c?.summary&&<div className="wc-summary border-b bg-muted/30 p-3 text-sm"><strong>Nhu cầu:</strong> {c.summary}<p>SĐT: {c.contact?.phone||'Chưa có'} · Zalo: {c.contact?.zalo==='confirmed'?'Khách xác nhận':'Chưa xác nhận'}</p>{c.page_url&&<a className="break-all text-xs underline" href={c.page_url} target="_blank" rel="noreferrer">Trang khách đang xem</a>}{c.signal_id&&<p className="mt-1 text-xs">Đã chuyển Tín hiệu · Người tạo: Đốm AI · Mã {c.signal_id}</p>}</div>}
       <div className="wc-messages max-h-[55vh] min-h-[260px] flex-1 space-y-3 overflow-y-auto p-4">{c?.messages?.map((m:any)=><div key={m.id} className={`wc-bubble wc-bubble-${m.role} max-w-[90%] whitespace-pre-wrap break-words rounded-xl p-3 text-sm ${m.role==='user'?'ml-auto bg-primary/10':'bg-muted'}`}><p className="mb-1 text-xs text-muted-foreground">{m.role==='user'?'Khách':m.role==='staff'?'Nhân viên':'AI'} · {new Date(m.created_at).toLocaleString('vi-VN')}</p>{m.body}{m.state==='error'&&<p className="mt-2 text-xs text-destructive">AI chưa xử lý được tin này.</p>}</div>)}</div>
       {c?.mode==='human'?<form className="wc-compose flex gap-2 border-t p-3" onSubmit={e=>{e.preventDefault();void control('send');}}><Textarea aria-label="Trả lời khách" maxLength={2000} value={text} onChange={e=>setText(e.target.value)} placeholder={c.taken_by===c.userId?'Nhân viên trả lời — AI đang dừng':'Nhân viên khác đang can thiệp'} disabled={c.taken_by!==c.userId}/><Button type="submit" disabled={busy||!text.trim()||c.taken_by!==c.userId}>Gửi</Button></form>:<p className="border-t p-3 text-xs text-muted-foreground">AI đang phụ trách. Can thiệp sẽ dừng AI riêng cuộc chat này.</p>}
      </>}
     </section>
    </div>
   </>}
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
  <Dialog open={!!config} onOpenChange={v=>!v&&setConfig(null)}><DialogContent className="wc-settings max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{config?.id?'Cài đặt website':'Thêm website'}</DialogTitle></DialogHeader>{config&&<form className="space-y-3" onSubmit={e=>{e.preventDefault();void save();}}>
   {(['name','domain'] as const).map(k=><label className="block text-sm" key={k}>{k==='name'?'Tên website':'Tên miền chính xác (không https://)'}<Input required value={config[k]} onChange={e=>setConfig({...config,[k]:e.target.value})}/></label>)}
   <label className="block text-sm">Nguồn tín hiệu<select required className="mt-1 w-full rounded-md border bg-background p-2" value={config.source} onChange={e=>setConfig({...config,source:e.target.value})}><option value="">Chọn trong Kho nguồn</option>{overview.data?.sources.map((s:string)=><option key={s}>{s}</option>)}</select></label>
   {Object.entries({character:'Tên nhân vật',avatar:'URL ảnh đại diện HTTPS',greeting:'Lời chào',invitation:'Câu mời trên bong bóng',color:'Màu giao diện (#RRGGBB)',tone:'Văn phong, xưng hô, emoji',goals:'Nhu cầu muốn thu thập thêm — luôn ưu tiên SĐT/Zalo',knowledge:'Kiến thức được duyệt riêng website này',closing:'Lời báo khách chờ sale liên hệ'}).map(([k,label])=><label className="block text-sm" key={k}>{label}{['tone','goals','knowledge','greeting','closing'].includes(k)?<Textarea rows={k==='knowledge'?6:2} value={config.settings[k]} onChange={e=>setConfig({...config,settings:{...config.settings,[k]:e.target.value}})}/>:<Input value={config.settings[k]} onChange={e=>setConfig({...config,settings:{...config.settings,[k]:e.target.value}})}/>}</label>)}
   <label className="block text-sm">Câu hỏi bấm nhanh (mỗi dòng một câu, tối đa 6)<Textarea rows={4} value={config.settings.starters.join('\n')} onChange={e=>setConfig({...config,settings:{...config.settings,starters:e.target.value.split('\n')}})}/></label>
   <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={config.settings.showGreeting} onChange={e=>setConfig({...config,settings:{...config.settings,showGreeting:e.target.checked}})}/>Hiện lời chào bên ngoài biểu tượng chat</label>
   <label className="block text-sm">Hiện sau bao nhiêu giây (3–60)<Input type="number" min={3} max={60} value={config.settings.greetingDelay} onChange={e=>setConfig({...config,settings:{...config.settings,greetingDelay:Number(e.target.value)}})}/></label>
   <label className="block text-sm">Tải ảnh đại diện PNG/JPG/WebP (dưới 70 KB)<input className="mt-1 block w-full text-sm" type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>70000||!['image/png','image/jpeg','image/webp'].includes(file.type)){toast.error('Chọn PNG/JPG/WebP dưới 70 KB');return;}const reader=new FileReader();reader.onload=()=>setConfig((current:any)=>current?{...current,settings:{...current.settings,avatar:String(reader.result)}}:current);reader.readAsDataURL(file);}}/></label>
   <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={config.enabled} onChange={e=>setConfig({...config,enabled:e.target.checked})}/>Bật Chat Web</label><p className="text-xs text-muted-foreground">Chỉ nhập kiến thức được phép trả lời khách. AI không đọc dữ liệu nội bộ Base. Người tạo tín hiệu: Đốm AI.</p>
   {config.id&&<div className="rounded border p-3 text-xs"><p className="break-all">ID website: {config.id}</p><Button type="button" variant="outline" className="mt-2" disabled={busy} onClick={async()=>{setBusy(true);try{const r=await chatRotateKey({data:{site:config.id}});setKey(r.key);setKeySite(config.id);setConfig(null);}catch{toast.error('Không cấp được mã');}finally{setBusy(false);}}}>Cấp mã kết nối mới — mã cũ hết hiệu lực</Button></div>}<Button disabled={busy} type="submit">{busy?'Đang lưu…':'Lưu cấu hình'}</Button>
  </form>}</DialogContent></Dialog>
  <Dialog open={!!key} onOpenChange={v=>!v&&setKey('')}><DialogContent><DialogHeader><DialogTitle>Kết nối plugin WordPress</DialogTitle></DialogHeader><p className="text-sm">Tải, cài và kích hoạt plugin. Vào WordPress → Cài đặt → Base Chat, nhập hai giá trị rồi bật chat.</p><label className="text-sm">ID website<Input readOnly value={keySite}/></label><label className="text-sm">Mã kết nối — chỉ hiện lần này<Input readOnly value={key}/></label><p className="text-xs text-muted-foreground">Không chèn mã vào JavaScript hoặc bài viết. Mất mã: cấp mã mới trong cài đặt website.</p></DialogContent></Dialog>
 </div>;
}

