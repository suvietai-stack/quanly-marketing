import {useQuery} from "@tanstack/react-query";
import {supabase} from "@/integrations/supabase/client";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/components/ui/select";
import {Label} from "@/components/ui/label";
import {selectedDesignAssigneeId, type DesignFlow} from "@/lib/orders/design";
export type DesignCandidate={user_id:string;name:string};
export function useDesignAssignees(flow:DesignFlow|undefined){
 return useQuery({
  queryKey:["design-assignable-staff",flow],enabled:!!flow,staleTime:60000,retry:1,
  queryFn:async()=>{
   const {data,error}=await (supabase as any).rpc("design_assignable_staff",{_flow:flow});
   if(error)throw new Error(error.message);
   return (data??[]) as DesignCandidate[];
  }
 });
}
export function DesignAssigneePicker({flow,valueId,value,onChange,required=false,disabled=false,label="Người thực hiện"}:{
 flow:DesignFlow|undefined;valueId?:string;value?:string;
 onChange:(name:string|undefined,id:string|undefined)=>void;required?:boolean;disabled?:boolean;label?:string
}){
 const q=useDesignAssignees(flow);
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
  {q.isPending&&<p className="text-xs text-muted-foreground">Đang tải nhân viên phù hợp…</p>}
  {q.isError&&<p role="alert" className="text-xs text-destructive">Không tải được danh sách nhân viên. Kiểm tra quyền và thử lại.</p>}
  {!q.isPending&&!q.isError&&entries.length===0&&<p className="text-xs text-destructive">Chưa có nhân viên Thiết kế phù hợp. Cần cập nhật chuyên môn/quyền nhận việc trước khi tạo Job.</p>}
 </div>;
}
