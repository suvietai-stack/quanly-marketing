import {useEffect,useState} from "react";
import {useQuery,useQueryClient} from "@tanstack/react-query";
import {useServerFn} from "@tanstack/react-start";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Switch} from "@/components/ui/switch";
import {Badge} from "@/components/ui/badge";
import {Label} from "@/components/ui/label";
import {DESIGN_FLOWS,type DesignFlow} from "@/lib/orders/design";
import {
 designGroupStatus,designGroupListGroups,designGroupSave,
 designGroupSendTest,designGroupHistory,designGroupRetryEvent
} from "@/lib/orders/zaloGroup.functions";
export function DesignZaloSettings(){
 const [flow,setFlow]=useState<DesignFlow>("photo");
 return <div className="space-y-4">
  <p className="text-sm text-muted-foreground">Ba hệ Thiết kế dùng chung OA của Base; mỗi hệ bật/tắt và chọn Group riêng. Mặc định tắt, không gửi khi chưa liên kết.</p>
  <div className="flex flex-wrap gap-2">{DESIGN_FLOWS.map(f=><Button key={f.key} size="sm" variant={flow===f.key?"secondary":"outline"} onClick={()=>setFlow(f.key)}>{f.label}</Button>)}</div>
  <DesignGroupPanel key={flow} flow={flow}/>
 </div>;
}
function DesignGroupPanel({flow}:{flow:DesignFlow}){
 const qc=useQueryClient();
 const fnStatus=useServerFn(designGroupStatus),fnGroups=useServerFn(designGroupListGroups),
 fnSave=useServerFn(designGroupSave),fnTest=useServerFn(designGroupSendTest),
 fnHistory=useServerFn(designGroupHistory),fnRetry=useServerFn(designGroupRetryEvent);
 const status=useQuery({queryKey:["design-zalo",flow,"status"],queryFn:()=>fnStatus({data:{flow}})});
 const history=useQuery({queryKey:["design-zalo",flow,"history"],queryFn:()=>fnHistory({data:{flow}})});
 const [enabled,setEnabled]=useState(false),[groupId,setGroupId]=useState(""),[groupName,setGroupName]=useState("");
 const [groups,setGroups]=useState<{id:string;name:string}[]|null>(null);
 const [search,setSearch]=useState(""),[busy,setBusy]=useState(false);
 useEffect(()=>{if(status.data){setEnabled(status.data.enabled);setGroupId(status.data.groupId);setGroupName(status.data.groupName);}},[status.data]);
 async function load(){
  setBusy(true);try{const r=await fnGroups();if(r.ok)setGroups(r.groups);else toast.error(r.message)}
  catch(e){toast.error(e instanceof Error?e.message:"Không tải được nhóm");}finally{setBusy(false);}
 }
 async function save(){
  setBusy(true);try{
   const r=await fnSave({data:{flow,enabled,groupId,groupName}});
   if(r.ok){toast.success("Đã lưu");void qc.invalidateQueries({queryKey:["design-zalo",flow]});}
   else toast.error(r.message);
  }catch(e){toast.error(e instanceof Error?e.message:"Lỗi lưu cấu hình");}finally{setBusy(false);}
 }
 async function test(){
  setBusy(true);try{const r=await fnTest({data:{flow}});r.ok?toast.success(r.message):toast.error(r.message)}
  catch(e){toast.error(e instanceof Error?e.message:"Không gửi được");}finally{setBusy(false);}
 }
 if(status.isPending)return <p className="text-sm">Đang tải cấu hình Zalo…</p>;
 if(status.isError)return <p className="text-sm text-destructive">Không tải được cấu hình. Kiểm tra quyền hoặc cập nhật database.</p>;
 return <div className="rounded-lg border p-3 sm:p-4 space-y-4">
  <div className="flex items-center justify-between gap-3">
   <div><h3 className="font-semibold">Thông báo Group Zalo</h3><p className="text-xs text-muted-foreground">Cấu hình độc lập cho từng hệ</p></div>
   <Badge variant={status.data?.oaConnected?"default":"secondary"}>{status.data?.oaConnected?"OA đã kết nối":"OA chưa kết nối"}</Badge>
  </div>
  <label className="flex items-center justify-between gap-3 text-sm font-medium">Bật gửi thông báo Group
   <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Bật thông báo Zalo của hệ này"/>
  </label>
  <div className="space-y-2"><Label>Group Zalo nhận thông báo</Label>
   <div className="flex gap-2"><Input value={groupId} placeholder="Chưa chọn Group — liên kết sau" onChange={e=>{setGroupId(e.target.value);setGroupName("");}}/>
    <Button variant="outline" disabled={busy} onClick={load}>Chọn Group</Button></div>
   {groupName&&<p className="text-sm text-muted-foreground">Đã chọn: {groupName}</p>}
   {groups&&<div className="rounded-md border max-h-48 overflow-auto p-2 space-y-1">
    <Input placeholder="Tìm Group…" value={search} onChange={e=>setSearch(e.target.value)}/>
    {groups.filter(g=>(g.name+" "+g.id).toLowerCase().includes(search.toLowerCase())).map(g=>
     <button key={g.id} type="button" className="block w-full text-left text-sm rounded-md p-2 hover:bg-accent" onClick={()=>{setGroupId(g.id);setGroupName(g.name);setGroups(null);}}>{g.name}</button>)}
    {!groups.length&&<p className="text-sm text-muted-foreground">OA chưa thấy Group. Có thể nhập Group ID thủ công.</p>}
   </div>}
  </div>
  <div className="flex flex-wrap gap-2">
   <Button disabled={busy||enabled&&!groupId.trim()} onClick={save}>Lưu cài đặt</Button>
   <Button variant="outline" disabled={busy||!groupId.trim()} onClick={test}>Gửi tin thử</Button>
  </div>
  <div className="border-t pt-3 space-y-2">
   <p className="text-sm font-medium">Lịch sử gửi gần đây ({status.data?.failed??0} cần kiểm tra)</p>
   {(history.data?.events??[]).length===0&&<p className="text-sm text-muted-foreground">Chưa có lượt gửi nào.</p>}
   {(history.data?.events??[]).map((ev:any)=><div key={ev.id} className="flex items-center gap-2 py-2 border-b text-sm">
    <Badge variant={ev.status==="failed"?"destructive":"secondary"}>{ev.status==="sent"?"Đã gửi":ev.status==="unknown"?"Cần kiểm tra":ev.status==="failed"?"Lỗi":ev.status==="skipped"?"Bỏ qua":"Đang chờ"}</Badge>
    <div className="flex-1 min-w-0"><p className="truncate">{ev.snapshot?.title??ev.event}</p><p className="text-xs text-muted-foreground">{new Date(ev.created_at).toLocaleString("vi-VN")} {ev.error??""}</p></div>
    {(ev.status==="failed"||ev.status==="unknown")&&<Button size="sm" variant="outline" disabled={busy} onClick={async()=>{
     if(ev.status==="unknown"&&!window.confirm("Chưa xác minh Zalo có nhận tin hay chưa. Bạn đã kiểm tra Group để tránh gửi trùng?"))return;
     setBusy(true);try{const r=await fnRetry({data:{flow,id:ev.id}});r.ok?toast.success(r.message):toast.error(r.message);void qc.invalidateQueries({queryKey:["design-zalo",flow]});}
     catch(e){toast.error(e instanceof Error?e.message:"Không gửi lại được");}finally{setBusy(false);}
    }}>Gửi lại</Button>}
   </div>)}
  </div>
 </div>;
}
