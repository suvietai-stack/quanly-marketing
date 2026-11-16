import {Checkbox} from "@/components/ui/checkbox";
import {Badge} from "@/components/ui/badge";
import {permissionControl,type EditorPolicy} from "@/lib/basePermissions/permissionEditor";
import {DESIGN_FLOWS} from "@/lib/orders/design";

const actions=[
 ["view","Xem và theo dõi Job trong phạm vi được phép"],
 ["edit","Sửa thông tin yêu cầu mình liên quan"],
 ["take","Xác nhận nhận Job được giao"],
 ["update_draft","Cập nhật file/bản thiết kế"],
 ["submit","Gửi bản thiết kế để duyệt"],
 ["resubmit","Chỉnh sửa và gửi duyệt lại"],
 ["approve","Duyệt Job được chỉ định duyệt"],
 ["request_changes","Yêu cầu chỉnh sửa (ghi rõ lý do)"],
 ["deliver","Bàn giao kết quả đã duyệt"],
 ["complete","Xác nhận đã hoàn thành"],
 ["cancel","Hủy Job hợp lệ"],
 ["restore","Khôi phục Job bị hủy"],
 ["report_view","Xem báo cáo Thiết kế"],
] as const;
type Props={value:string[];onChange:(v:string[])=>void;policy:EditorPolicy[];source:string;baseline:string[];disabled:boolean};
export function DesignRolePermissionGroups({value,onChange,policy,source,baseline,disabled}:Props){
 const has=(key:string)=>value.includes(key);
 const canChange=(key:string)=>permissionControl(policy,key,source,baseline,value).editable;
 const flows=DESIGN_FLOWS.map(f=>f.key);
 const createKeys=flows.map(f=>"order."+f+".create");
 const allCreateEditable=createKeys.every(canChange)&&(!has("order.create")||canChange("order.create"));
 function setCreate(flow:string,checked:boolean){
  if(disabled||!allCreateEditable)return;
  // Normalize legacy global create into explicit per-flow switches before toggling.
  const allActive=has("order.create")?flows:flows.filter(f=>has("order."+f+".create"));
  const updated=checked?[...new Set([...allActive,flow])]:allActive.filter(f=>f!==flow);
  onChange([...new Set([...value.filter(k=>k!=="order.create"&&!createKeys.includes(k)),...updated.map(f=>"order."+f+".create")])]);
 }
 const actionKeys=(action:string)=>["order."+action,...flows.map(f=>"order."+f+"."+action)];
 function actionState(action:string){
  const k=actionKeys(action), scoped=k.slice(1);
  return scoped.every(has)|| (has(k[0])&&!scoped.some(has));
 }
 function setAction(action:string,on:boolean){
  if(disabled)return;
  const keys=actionKeys(action);
  const editable=keys.filter(canChange);
  if(!editable.length)return;
  const next=value.filter(k=>!editable.includes(k));
  onChange(on?[...new Set([...next,...editable])]:next);
 }
 const count=actions.filter(a=>actionState(a[0])).length;
 return <section className="space-y-3 rounded-lg border p-3 sm:p-4" aria-label="Quyền Thiết kế theo tác vụ">
  <div><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">Thiết kế — tích theo tác vụ</h3><Badge variant="secondary">{count}/{actions.length} nhóm thao tác</Badge></div>
   <p className="mt-1 text-sm text-muted-foreground">Chỉ phân biệt quyền tạo theo 3 loại Job. Các quyền xử lý áp dụng chung, đúng người thực hiện/người duyệt và trạng thái Job. Không cần tích 83 mã kỹ thuật.</p>
  </div>
  <div className="space-y-2"><p className="text-sm font-medium">1. Được tạo loại Job nào?</p>
   {DESIGN_FLOWS.map(f=><label key={f.key} className="flex items-center gap-2 text-sm min-h-9">
    <Checkbox checked={has("order.create")||has("order."+f.key+".create")} disabled={disabled||!allCreateEditable} onCheckedChange={v=>setCreate(f.key,v===true)}/>{f.label}
   </label>)}
  </div>
  <div className="border-t pt-3 space-y-2"><p className="text-sm font-medium">2. Các tác vụ xử lý chung</p>
   <div className="grid gap-2 sm:grid-cols-2">{actions.map(([key,label])=>{
    const editable=actionKeys(key).some(canChange);
    return <label key={key} className="flex items-start gap-2 text-sm min-h-9">
      <Checkbox className="mt-0.5" checked={actionState(key)} disabled={disabled||!editable} onCheckedChange={v=>setAction(key,v===true)}/>
      <span>{label}</span>
    </label>;
   })}</div>
  </div>
  <details className="border-t pt-3"><summary className="cursor-pointer text-sm font-medium">Quyền quản trị đặc biệt (chỉ chuyên trách)</summary>
   <div className="mt-2 space-y-2">{[
    ["assign","Điều phối tất cả Job của bộ phận (không cần để người tạo chọn người làm)"],
    ["edit_reviewer","Đổi người duyệt được chỉ định"],
    ["force_status","Ép chuyển trạng thái để xử lý sự cố"],
    ["delete","Xóa Job chưa có lịch sử"],
   ].map(([key,label])=><label key={key} className="flex items-center gap-2 text-sm min-h-9">
    <Checkbox checked={actionState(key)} disabled={disabled||!actionKeys(key).some(canChange)} onCheckedChange={v=>setAction(key,v===true)}/>{label}
   </label>)}</div>
  </details>
  <p className="text-xs text-muted-foreground">Người tạo tự chọn nhân viên khi tạo Job; người đang thực hiện thuộc bộ phận Thiết kế được chuyển việc nội bộ. Trang “Tất cả thiết kế” chỉ hiển thị với thành viên Thiết kế.</p>
 </section>;
}
