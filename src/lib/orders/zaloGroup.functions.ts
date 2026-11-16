import {createServerFn} from "@tanstack/react-start";
import {z} from "zod";
import {requireSupabaseAuth} from "@/integrations/supabase/auth-middleware";
const flowSchema=z.enum(["photo","marketing_design","order_mockup"]);
async function check(ctx:{supabase:any}){
 const {data,error}=await ctx.supabase.rpc("design_zalo_group_can_manage");
 if(error||!data)throw new Error("Bạn không có quyền Cài đặt thông báo Thiết kế");
}
export const designGroupStatus=createServerFn({method:"POST"}).middleware([requireSupabaseAuth])
 .inputValidator((data)=>z.object({flow:flowSchema}).parse(data))
 .handler(async({context,data})=>{
  await check(context);const s=await import("./zaloGroup.server");
  const {getConfig}=await import("@/lib/zalo.server");
  const c:any=await getConfig();const cfg=await s.designGroupConfig(data.flow);
  const {supabaseAdmin}=await import("@/integrations/supabase/client.server");
  const {count}=await (supabaseAdmin as any).from("design_zalo_group_events")
   .select("id",{count:"exact",head:true}).eq("flow",data.flow).in("status",["failed","unknown"]);
  return {oaConnected:c?.status==="connected",oaName:c?.oa_name??null,groupId:cfg?.group_id??"",
   groupName:cfg?.group_name??"",enabled:!!cfg?.enabled,failed:count??0};
 });
export const designGroupListGroups=createServerFn({method:"POST"}).middleware([requireSupabaseAuth])
 .handler(async({context})=>{await check(context);const s=await import("@/lib/finance/gmf.server");return s.listGroups();});
export const designGroupSave=createServerFn({method:"POST"}).middleware([requireSupabaseAuth])
 .inputValidator((data)=>z.object({flow:flowSchema,groupId:z.string().trim().max(100),
  groupName:z.string().trim().max(200),enabled:z.boolean()}).parse(data))
 .handler(async({context,data})=>{await check(context);
  const {error}=await (context.supabase as any).rpc("design_zalo_group_save",{
    _flow:data.flow,_group_id:data.groupId,_group_name:data.groupName,_enabled:data.enabled
  });
  return error?{ok:false,message:error.message}:{ok:true,message:"Đã lưu cấu hình Zalo của "+data.flow};
 });
export const designGroupSendTest=createServerFn({method:"POST"}).middleware([requireSupabaseAuth])
 .inputValidator((data)=>z.object({flow:flowSchema}).parse(data))
 .handler(async({context,data})=>{await check(context);const s=await import("./zaloGroup.server");return s.designGroupSendTest(data.flow);});
export const designGroupHistory=createServerFn({method:"POST"}).middleware([requireSupabaseAuth])
 .inputValidator((data)=>z.object({flow:flowSchema}).parse(data))
 .handler(async({context,data})=>{await check(context);const {supabaseAdmin}=await import("@/integrations/supabase/client.server");
 const {data:rows}=await (supabaseAdmin as any).from("design_zalo_group_events")
  .select("id,event,status,error,created_at,sent_at,snapshot").eq("flow",data.flow).order("created_at",{ascending:false}).limit(30);
 return {events:rows??[]};
 });
export const designGroupRetryEvent=createServerFn({method:"POST"}).middleware([requireSupabaseAuth])
 .inputValidator((data)=>z.object({flow:flowSchema,id:z.string().uuid()}).parse(data))
 .handler(async({context,data})=>{await check(context);const s=await import("./zaloGroup.server");return s.designGroupRetry(data.id,data.flow);});
