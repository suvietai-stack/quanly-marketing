import {useQuery} from "@tanstack/react-query";
import {supabase} from "@/integrations/supabase/client";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/components/ui/select";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {useCurrentUser} from "@/lib/auth";
import {selectedDesignAssigneeId, type DesignFlow} from "@/lib/orders/design";
export type DesignCandidate={user_id:string;name:string};
/** Prevent an unresponsive RPC from trapping the job form in an endless spinner. */
export function useDesignAssignees(flow:DesignFlow|undefined){
 const {user}=useCurrentUser();
 return useQuery({
  queryKey:["design-assignable-staff",user?.id,flow],
  enabled:!!flow&&!!user?.id,
  staleTime:120000,gcTime:600000,refetchOnWindowFocus:false,retry:false,
  queryFn:async({signal})=>{
   const controller=new AbortController();
   const abort=()=>controller.abort();
   signal.addEventListener('abort',abort,{once:true});
   const timeout=setTimeout(()=>controller.abort(),12000);
   try{
    const {data,error}=await (supabase as any)
      .rpc("design_assignable_staff",{_flow:flow}).abortSignal(controller.signal);
    if(error)throw new Error(error.message);
    return (data??[]) as DesignCandidate[];
   }catch(error){
    if(controller.signal.aborted&&!signal.aborted)
      throw new Error("Dịch vụ danh sách Thiết kế không phản hồi trong 12 giây. Kiểm tra kết nối rồi thử lại.");
    throw error;
   }finally{
    clearTimeout(timeout);
    signal.removeEventListener('abort',abort);
   }
  }
 });
}
export function DesignAssigneePicker({flow,valueId,value,onChange,required=false,disabled=false,label="Người thực hiện"}:{
 flow:DesignFlow|undefined;valueId?:string;value?:string;
 onChange:(name:string|undefined,id:string|undefined)=>void;required?:boolean;disabled?:boolean;label?:string
}){
 const q=useDesignAssignees(flow);
 const {user}=useCurrentUser();
 const entries=q.data??[];
 // Older jobs store only a display name; never guess among duplicate names.
 const selectedId=selectedDesignAssigneeId(entries,valueId,value);
 return <div className="space-y-1.5">
  <Label>{label}{required?" *":""}</Label>
  <Select value={selectedId} disabled={disabled||!flow||q.isPending||q.isError}
    onValueChange={id=>{
     if(id==="_"){onChange(undefined,undefined);return;}
     const person=entries.find(x=>x.user_id===id);
     if(person)onChange(person.name,person.user_id);
    }}>
   <SelectTrigger aria-label={label}><SelectValue placeholder="Chọn nhân viên Thiết kế"/></SelectTrigger>
   <SelectContent>
    <SelectItem value="_">— Chọn người thực hiện —</SelectItem>
    {entries.map(p=><SelectItem key={p.user_id} value={p.user_id}>{p.name}</SelectItem>)}
    {valueId&&!entries.some(p=>p.user_id===valueId)&&<SelectItem value={valueId} disabled>{value||"Người cũ"} (không còn đủ điều kiện)</SelectItem>}
   </SelectContent>
  </Select>
  {flow&&!!user?.id&&q.isPending&&<p role="status" className="text-xs text-muted-foreground">Đang tải nhân viên phù hợp…</p>}
  {flow&&!user?.id&&<p role="alert" className="text-xs text-destructive">Chưa có phiên đăng nhập hợp lệ. Tải lại trang hoặc đăng nhập lại để chọn nhân viên.</p>}
  {!flow&&<p className="text-xs text-muted-foreground">Chọn hệ Thiết kế trước khi phân công.</p>}
  {q.isError&&<div role="alert" className="space-y-2 rounded-md border border-destructive/30 p-3 text-xs text-destructive">
    <p>Không tải được danh sách nhân viên: {q.error instanceof Error?q.error.message:"Lỗi không xác định"}</p>
    <Button type="button" variant="outline" size="sm" className="min-h-10" onClick={()=>void q.refetch()}>Tải lại nhân viên</Button>
  </div>}
  {flow&&q.isSuccess&&entries.length===0&&<p className="text-xs text-destructive">Chưa có nhân viên Thiết kế phù hợp. Cần cập nhật chuyên môn/quyền nhận việc trước khi tạo Job.</p>}
 </div>;
}
