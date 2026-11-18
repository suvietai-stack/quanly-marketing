import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import type { Json } from '@/integrations/supabase/types';
import type { OrgCommand } from './commands';
export type RoleKind='common'|'position'|'marketing_task'|'system';
export interface CatalogRole {id:string;role_code?:string;name:string;description:string;is_system:boolean;permissions:string[];role_kind:RoleKind;catalog_group:string;catalog_state:string;receivers:number;receiver_counts?:{slots:number;tasks:number;direct:number;legacy:number};signal_scope_all:boolean;signal_scope:string[];references:{positions:{id:string;name:string;unit_id:string}[];titles:{id:string;name:string}[];direct:number;specialties:{id:string;name:string}[]};permission_checks:{key:string;ready:boolean;reason:string}[]}
export interface PositionSlot {id:string;title_id:string;unit_id:string;role_id:string;name:string;active:boolean}
export interface UnmappedAssignment {id:string;title_id:string|null;title_name:string|null;unit_id:string;unit_name:string;user_id:string;user_name:string;starts_at:string;ends_at:string|null;source:string;category:string;status?:string}
export interface RoleCatalog {common_role_ready?:boolean;server_now:string;roles:CatalogRole[];slots:PositionSlot[];mapping:{title_id:string;title_name:string;unit_id:string|null;active:boolean;roles:string[];unmapped_assignments:number}[];unmapped:UnmappedAssignment[];direct_count:number;override_rows:number;audit:{id:string;role_id:string;action:string;reason:string;created_at:string}[]}
export interface RoleProposal {canonical_id?:string;name:string;description:string;role_kind:RoleKind;catalog_group:string;permissions:string[];signal_scope_all:boolean;signal_scope:string[]}
export interface RolePreview {id:string;action:string;role_id:string;before:CatalogRole|null;after:RoleProposal;added:string[];removed:string[];affected_users:string[];expires_at:string}
export const roleCatalogApi={
 async read(context?:{signal?:AbortSignal}):Promise<RoleCatalog>{const request=supabase.rpc('role_catalog_read');const {data,error}=await(context?.signal?request.abortSignal(context.signal):request);if(error)throw new Error(error.message);return data as unknown as RoleCatalog;},
 async preview(action:'create'|'edit'|'archive'|'delete',roleId?:string,proposal?:RoleProposal):Promise<RolePreview>{const {data,error}=await supabase.rpc('role_catalog_change',{_phase:'preview',_action:action,_role_id:roleId,_proposed:proposal as unknown as Json});if(error)throw new Error(error.message);return data as unknown as RolePreview;},
 async apply(id:string,reason:string,affectedUsers:string[]=[]){
  const {error}=await supabase.rpc('role_catalog_change',{
    _phase:'apply',_preview:id,_confirmation:'ÁP DỤNG ROLE',_reason:reason,
  });
  if(error)throw new Error(error.message);
  // The audited server preview identifies receivers. Warm only them, after the
  // transaction commits; never delay Role save, and never authorize from this list.
  if(affectedUsers.length) void supabase.rpc('base_role_cache_sync_users' as never,{
    _users:affectedUsers as never,
  }).then(()=>undefined).catch(()=>undefined);
  void useAuth.getState().refreshBaseAccess(true).catch(()=>undefined);
  void useAuth.getState().refreshBizAccess(true).catch(()=>undefined);
 },
};
export function slotConversionCommands(catalog:RoleCatalog,ids:string[]):OrgCommand[]{return [...new Set(ids)].flatMap(id=>{
 void catalog; void id;
 throw new Error('Không tự chuyển từ liên kết chức danh legacy. Chọn Role chuẩn mới và xem trước từng nguồn trong Mapping ô.');
});}