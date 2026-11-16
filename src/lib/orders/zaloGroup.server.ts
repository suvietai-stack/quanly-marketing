// Server-only: independent Zalo Group queues for Design, shared OA + postGroup.
import { postGroup } from "@/lib/finance/gmf.server";
import { baseUrl } from "@/lib/zalo.server";
import { designGroupMessage, FLOW_LABEL, type DesignZaloEvent, type DesignGroupSnapshot } from "./zaloGroupMessage";
import type { DesignFlow } from "./design";
const MAX_ATTEMPTS=3;
const STALE_MS=120_000;
const flows:DesignFlow[]=["photo","marketing_design","order_mockup"];
async function db(){const {supabaseAdmin}=await import("@/integrations/supabase/client.server");return supabaseAdmin as any;}
export async function designGroupConfig(flow:DesignFlow){
 const d=await db();
 const {data,error}=await d.from("design_zalo_group_config").select("*").eq("flow",flow).maybeSingle();
 if(error)throw new Error("Không đọc được cấu hình Zalo Thiết kế");
 return data as null|{flow:DesignFlow;group_id:string|null;group_name:string|null;enabled:boolean};
}
export async function processDesignGroup(limit=10){
 const d=await db();
 // No retry of uncertain/partially sent messages; preserve for manual inspection.
 await d.from("design_zalo_group_events").update({status:"unknown",error:"Tiến trình bị gián đoạn; kiểm tra Zalo trước khi gửi lại"})
   .eq("status","sending").lt("started_at",new Date(Date.now()-STALE_MS).toISOString());
 const {data:queue,error}=await d.from("design_zalo_group_events")
   .select("id,order_id,flow,event,group_id,snapshot,attempts")
   .eq("status","pending").lt("attempts",MAX_ATTEMPTS).order("created_at").limit(limit);
 if(error)return {processed:0,error:"Không tải được hàng đợi Thiết kế"};
 if(!queue?.length)return {processed:0};
 const configs=Object.fromEntries(await Promise.all(flows.map(async flow=>[flow,await designGroupConfig(flow)])));
 let processed=0;
 const base=await baseUrl();
 for(const ev of queue){
  const cfg=configs[ev.flow];
  if(!cfg?.enabled || !cfg.group_id || cfg.group_id!==ev.group_id){
   await d.from("design_zalo_group_events").update({status:"skipped",error:"Hệ đã tắt hoặc thay đổi nhóm"})
     .eq("id",ev.id).eq("status","pending");
   continue;
  }
  const {data:got}=await d.from("design_zalo_group_events")
    .update({status:"sending",started_at:new Date().toISOString(),attempts:ev.attempts+1})
    .eq("id",ev.id).eq("status","pending").eq("attempts",ev.attempts).select("id");
  if(!got?.length)continue;
  const mark=(patch:Record<string,unknown>)=>d.from("design_zalo_group_events").update(patch)
    .eq("id",ev.id).eq("status","sending").eq("attempts",ev.attempts+1);
  const {data:order}=await d.from("orders").select("id,workflow_kind,data").eq("id",ev.order_id).maybeSingle();
  if(!order || order.workflow_kind!==ev.flow){
   await mark({status:"skipped",error:"Job không còn thuộc luồng thiết kế này"});continue;
  }
  // Do not send stale work notifications after reassignment/closure.
  const snap=ev.snapshot as DesignGroupSnapshot;
  const st=order.data?.status;
  if((ev.event==="created"||ev.event==="transferred"||ev.event==="taken") &&
    (st==="Đã hủy"||st==="Hoàn thành" || order.data?.assignee!==snap.assignee)){
   await mark({status:"skipped",error:"Người nhận/trạng thái đã thay đổi"});continue;
  }
  const link=base+"/orders?open="+encodeURIComponent(ev.order_id);
  const res=await postGroup(ev.group_id,designGroupMessage(ev.flow as DesignFlow,ev.event as DesignZaloEvent,snap,link))
   .catch(()=>({ok:false,ambiguous:true,code:-9,message:"Không xác minh được kết quả gửi Zalo"}));
  processed++;
  await mark(res.ok?{status:"sent",sent_at:new Date().toISOString(),error:null}
    :{status:res.ambiguous?"unknown":"failed",error:String(res.code)+": "+res.message});
 }
 return {processed};
}
export async function designGroupSendTest(flow:DesignFlow){
 const cfg=await designGroupConfig(flow);
 if(!cfg?.group_id)return {ok:false,message:"Chưa chọn nhóm Zalo cho "+FLOW_LABEL[flow]};
 const now=new Date().toLocaleString("vi-VN",{timeZone:"Asia/Ho_Chi_Minh",hour12:false});
 const r=await postGroup(cfg.group_id,
  "🧪 THỬ KẾT NỐI THIẾT KẾ · "+FLOW_LABEL[flow]+"\nĐây là tin kiểm tra, không chứa dữ liệu Job.\n"+now);
 return r.ok?{ok:true,message:"Zalo đã nhận yêu cầu gửi; kiểm tra nhóm."}
  :{ok:false,message:"Chưa gửi được: "+r.code+" "+r.message};
}
export async function designGroupRetry(id:string,flow:DesignFlow){
 const d=await db();
 const cfg=await designGroupConfig(flow);
 if(!cfg?.enabled||!cfg.group_id)return {ok:false,message:"Bật thông báo và liên kết nhóm trước khi gửi lại"};
 const {data:ev}=await d.from("design_zalo_group_events").select("id,status,group_id")
  .eq("id",id).eq("flow",flow).in("status",["failed","unknown"]).maybeSingle();
 if(!ev)return {ok:false,message:"Tin không ở trạng thái có thể gửi lại"};
 if(ev.group_id!==cfg.group_id)return {ok:false,message:"Nhóm đã thay đổi, không gửi lại tin cũ"};
 const {data}=await d.from("design_zalo_group_events").update({status:"pending",attempts:0,error:null,started_at:null})
  .eq("id",id).in("status",["failed","unknown"]).select("id");
 if(!data?.length)return {ok:false,message:"Tin đã được xử lý bởi người khác"};
 await processDesignGroup(10);
 const {data:after}=await d.from("design_zalo_group_events").select("status,error").eq("id",id).maybeSingle();
 return after?.status==="sent"?{ok:true,message:"Đã gửi lại"}:{ok:false,message:after?.error||"Chưa gửi được"};
}
