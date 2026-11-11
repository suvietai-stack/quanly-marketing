import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import type { OrgCommand } from './commands';
export type RoleKind='position'|'marketing_task'|'system';
export interface CatalogRole {id:string;name:string;description:string;is_system:boolean;permissions:string[];role_kind:RoleKind;catalog_group:string;catalog_state:string;receivers:number;signal_scope_all:boolean;signal_scope:string[];references:{positions:{id:string;name:string;unit_id:string}[];titles:{id:string;name:string}[];direct:number;specialties:{id:string;name:string}[]};permission_checks:{key:string;ready:boolean;reason:string}[]}
export interface PositionSlot {id:string;title_id:string;unit_id:string;role_id:string;name:string;active:boolean}
export interface UnmappedAssignment {id:string;title_id:string|null;title_name:string|null;unit_id:string;unit_name:string;user_id:string;user_name:string;starts_at:string;ends_at:string|null;source:string;category:string}
export interface RoleCatalog {server_now:string;roles:CatalogRole[];slots:PositionSlot[];mapping:{title_id:string;title_name:string;unit_id:string|null;active:boolean;roles:string[];unmapped_assignments:number}[];unmapped:UnmappedAssignment[];direct_count:number;override_rows:number;audit:{id:string;role_id:string;action:string;reason:string;created_at:string}[]}
export interface RoleProposal {name:string;description:string;role_kind:RoleKind;catalog_group:string;permissions:string[];signal_scope_all:boolean;signal_scope:string[]}
export interface RolePreview {id:string;action:string;role_id:string;before:CatalogRole|null;after:RoleProposal;added:string[];removed:string[];affected_users:string[];expires_at:string}
export const roleCatalogApi={
 async read():Promise<RoleCatalog>{const {data,error}=await supabase.rpc('role_catalog_read');if(error)throw new Error(error.message);return data as unknown as RoleCatalog;},
 async preview(action:'create'|'edit'|'archive'|'delete',roleId?:string,proposal?:RoleProposal):Promise<RolePreview>{const {data,error}=await supabase.rpc('role_catalog_change',{_phase:'preview',_action:action,_role_id:roleId,_proposed:proposal as unknown as Json});if(error)throw new Error(error.message);return data as unknown as RolePreview;},
 async apply(id:string,reason:string){const {error}=await supabase.rpc('role_catalog_change',{_phase:'apply',_preview:id,_confirmation:'ÁP DỤNG ROLE',_reason:reason});if(error)throw new Error(error.message);},
};
export function slotConversionCommands(catalog:RoleCatalog,ids:string[]):OrgCommand[]{return [...new Set(ids)].flatMap(id=>{
 const a=catalog.unmapped.find(x=>x.id===id);const m=catalog.mapping.find(x=>x.title_id===a?.title_id);const role=m?.roles.length===1?catalog.roles.find(r=>r.id===m.roles[0]):undefined;
 if(!a?.title_id||!role||role.role_kind!=='position'||role.catalog_state!=='standard')throw new Error('Phân công chưa có đúng một Role vị trí chuẩn.');
 const slotId=crypto.randomUUID();return [{action:'slot' as const,data:{id:slotId,title_id:a.title_id,unit_id:a.unit_id,role_id:role.id,name:`${a.title_name??'Vị trí'} · ${a.user_name}`}},{action:'bind_slot' as const,data:{id:a.id,slot_id:slotId}}];
});}