-- STAGED ONLY. Requires separate owner approval of this exact SHA256. Supersedes role-grant-universal e818e8af and role-grant-expansion 3c4b23f8 (apply neither).
-- One Role grant policy for Common/position/task/personal + explicit personal DENY that wins over every Role source.
BEGIN;
LOCK TABLE public.app_roles,public.mkt_specialties,public.user_permission_overrides,public.user_roles IN SHARE ROW EXCLUSIVE MODE;
DO $guard$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='private.permission_editor_policy()'::regprocedure AND md5(pg_get_functiondef(oid))='5df07db9d70790a174e3078520314162' AND pg_get_userbyid(proowner)='postgres' AND proacl::text IS NOT DISTINCT FROM '{postgres=X/postgres}') THEN RAISE EXCEPTION 'Baseline/owner/ACL mismatch: private.permission_editor_policy'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='private.common_permission_ready(text)'::regprocedure AND md5(pg_get_functiondef(oid))='235e90397d4c9fbb8553a7f92734e37f' AND pg_get_userbyid(proowner)='postgres' AND proacl::text IS NOT DISTINCT FROM '{postgres=X/postgres}') THEN RAISE EXCEPTION 'Baseline/owner/ACL mismatch: private.common_permission_ready'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='private.role_editor_validate(text,text[],text[])'::regprocedure AND md5(pg_get_functiondef(oid))='9e5fa1a93890aaa486fe9d1674a4c1c2' AND pg_get_userbyid(proowner)='postgres' AND proacl::text IS NOT DISTINCT FROM '{postgres=X/postgres}') THEN RAISE EXCEPTION 'Baseline/owner/ACL mismatch: private.role_editor_validate'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='private.org_slot_rules(uuid,jsonb)'::regprocedure AND md5(pg_get_functiondef(oid))='8378b03b30cbff30004a03f24b77520a' AND pg_get_userbyid(proowner)='postgres' AND proacl::text IS NOT DISTINCT FROM '{postgres=X/postgres}') THEN RAISE EXCEPTION 'Baseline/owner/ACL mismatch: private.org_slot_rules'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='private.mkt_specialty_rules(uuid,jsonb)'::regprocedure AND md5(pg_get_functiondef(oid))='742425e52cf3d746a23b60f505529e85' AND pg_get_userbyid(proowner)='postgres' AND proacl::text IS NOT DISTINCT FROM '{postgres=X/postgres}') THEN RAISE EXCEPTION 'Baseline/owner/ACL mismatch: private.mkt_specialty_rules'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='private.org_assignment_specialty_rules(uuid,jsonb)'::regprocedure AND md5(pg_get_functiondef(oid))='a18e312f3e262c313d9eb208c8144851' AND pg_get_userbyid(proowner)='postgres' AND proacl::text IS NOT DISTINCT FROM '{postgres=X/postgres}') THEN RAISE EXCEPTION 'Baseline/owner/ACL mismatch: private.org_assignment_specialty_rules'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='public.permission_editor_read()'::regprocedure AND md5(pg_get_functiondef(oid))='4d070d87c9511db3f49e448b58dea40d' AND pg_get_userbyid(proowner)='postgres' AND proacl::text IS NOT DISTINCT FROM '{postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}') THEN RAISE EXCEPTION 'Baseline/owner/ACL mismatch: public.permission_editor_read'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='private.base_rules(uuid,jsonb)'::regprocedure AND md5(pg_get_functiondef(oid))='b007f5a4af182af9fb99e45ded5a565c' AND pg_get_userbyid(proowner)='postgres' AND proacl::text IS NOT DISTINCT FROM '{postgres=X/postgres}') THEN RAISE EXCEPTION 'Baseline/owner/ACL mismatch: private.base_rules'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='public.account_supplement_read(uuid)'::regprocedure AND md5(pg_get_functiondef(oid))='bf1ba617a64dc113171c72e46a7d6342' AND pg_get_userbyid(proowner)='postgres' AND proacl::text IS NOT DISTINCT FROM '{postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}') THEN RAISE EXCEPTION 'Baseline/owner/ACL mismatch: public.account_supplement_read'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='public.account_supplement_preview(uuid,text[])'::regprocedure AND md5(pg_get_functiondef(oid))='9903cd9510d304ae0059293f688fef27' AND pg_get_userbyid(proowner)='postgres' AND proacl::text IS NOT DISTINCT FROM '{postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}') THEN RAISE EXCEPTION 'Baseline/owner/ACL mismatch: public.account_supplement_preview'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='public.account_supplement_save(uuid,text[],text[],text,text)'::regprocedure AND md5(pg_get_functiondef(oid))='8533c449cde9ba73989b2541a583c49f' AND pg_get_userbyid(proowner)='postgres' AND proacl::text IS NOT DISTINCT FROM '{postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}') THEN RAISE EXCEPTION 'Baseline/owner/ACL mismatch: public.account_supplement_save'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='private.has_permission(uuid,text)'::regprocedure AND md5(pg_get_functiondef(oid))='c57afd7736a787a1cd89d48962f0261e' AND pg_get_userbyid(proowner)='postgres' AND proacl::text IS NOT DISTINCT FROM '{postgres=X/postgres,authenticated=X/postgres}') THEN RAISE EXCEPTION 'Baseline/owner/ACL mismatch: private.has_permission'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='private.base_effective(uuid,jsonb)'::regprocedure AND md5(pg_get_functiondef(oid))='af242a6b6fa74267a11c350aa5565e2f' AND pg_get_userbyid(proowner)='postgres' AND proacl::text IS NOT DISTINCT FROM '{postgres=X/postgres}') THEN RAISE EXCEPTION 'Baseline/owner/ACL mismatch: private.base_effective'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='private.base_decision(uuid,text,jsonb)'::regprocedure AND md5(pg_get_functiondef(oid))='2b656daba522eeefcb0cda29290742bd' AND pg_get_userbyid(proowner)='postgres' AND proacl::text IS NOT DISTINCT FROM '{postgres=X/postgres}') THEN RAISE EXCEPTION 'Baseline/owner/ACL mismatch: private.base_decision'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='private.k3_personal_denied(uuid,text)'::regprocedure AND md5(pg_get_functiondef(oid))='f15c912d9dd2459b27fa9d2510b8c778' AND pg_get_userbyid(proowner)='postgres' AND proacl::text IS NOT DISTINCT FROM '{postgres=X/postgres}') THEN RAISE EXCEPTION 'Baseline/owner/ACL mismatch: private.k3_personal_denied'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='public.k3_can(uuid,text)'::regprocedure AND md5(pg_get_functiondef(oid))='6f9082b7996e66a08e7cea2f31a8c48a' AND pg_get_userbyid(proowner)='postgres' AND proacl::text IS NOT DISTINCT FROM '{postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}') THEN RAISE EXCEPTION 'Baseline/owner/ACL mismatch: public.k3_can'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='private.org_permission_unit_member(uuid,uuid,text)'::regprocedure AND md5(pg_get_functiondef(oid))='45cebe02c12f207b0654a3ae1d424bf3' AND pg_get_userbyid(proowner)='postgres' AND proacl::text IS NOT DISTINCT FROM '{postgres=X/postgres}') THEN RAISE EXCEPTION 'Baseline/owner/ACL mismatch: private.org_permission_unit_member'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='private.staff_permission_validate(uuid,text[])'::regprocedure AND md5(pg_get_functiondef(oid))='7f34ef4d3b7d1b603da70acdd96b41ef' AND pg_get_userbyid(proowner)='postgres' AND proacl::text IS NOT DISTINCT FROM '{postgres=X/postgres}') THEN RAISE EXCEPTION 'Baseline/owner/ACL mismatch: private.staff_permission_validate'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='private.supplement_permission_guard(uuid)'::regprocedure AND md5(pg_get_functiondef(oid))='37ce537b5d3f903928cb80e604424905' AND pg_get_userbyid(proowner)='postgres' AND proacl::text IS NOT DISTINCT FROM '{postgres=X/postgres}') THEN RAISE EXCEPTION 'Baseline/owner/ACL mismatch: private.supplement_permission_guard'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='private.supplement_permission_state(uuid)'::regprocedure AND md5(pg_get_functiondef(oid))='842d3c76179fc8102f607f418d2fd944' AND pg_get_userbyid(proowner)='postgres' AND proacl::text IS NOT DISTINCT FROM '{postgres=X/postgres}') THEN RAISE EXCEPTION 'Baseline/owner/ACL mismatch: private.supplement_permission_state'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='private.org_role_permission_ready(text)'::regprocedure AND md5(pg_get_functiondef(oid))='a4efb605622ee682408e5469459ea72f' AND pg_get_userbyid(proowner)='postgres' AND proacl::text IS NOT DISTINCT FROM '{postgres=X/postgres}') THEN RAISE EXCEPTION 'Baseline/owner/ACL mismatch: private.org_role_permission_ready'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid='private.mkt_specialty_permission_ready(text)'::regprocedure AND md5(pg_get_functiondef(oid))='318e90477714f4b34efaf9e7efd3aa6a' AND pg_get_userbyid(proowner)='postgres' AND proacl::text IS NOT DISTINCT FROM '{postgres=X/postgres}') THEN RAISE EXCEPTION 'Baseline/owner/ACL mismatch: private.mkt_specialty_permission_ready'; END IF;
 IF to_regprocedure('private.universal_permission_ready(text)') IS NOT NULL OR to_regprocedure('private.grant_source_ready(text,text)') IS NOT NULL OR to_regprocedure('public.account_supplement_save(uuid,text[],text[],text[],text,text)') IS NOT NULL THEN RAISE EXCEPTION 'Baseline mismatch: candidate helpers exist'; END IF;
 IF EXISTS(SELECT 1 FROM pg_attribute WHERE attrelid IN ('public.user_permission_overrides'::regclass,'private.staff_permission_previews'::regclass) AND attname='denied_permissions' AND NOT attisdropped) THEN RAISE EXCEPTION 'Baseline mismatch: deny column exists'; END IF;
 IF (SELECT count(*) FROM public.base_permission_catalog)<>510 THEN RAISE EXCEPTION 'Baseline mismatch: catalog'; END IF;
 IF (SELECT md5(string_agg(id||':'||coalesce(role_kind,'')||':'||catalog_state||':'||coalesce(permissions,'{}')::text,'|' ORDER BY id)) FROM public.app_roles)<>'b4b3fd876c5d9d0dac34e554c258aa21' THEN RAISE EXCEPTION 'Baseline mismatch: Role permissions changed since capture'; END IF;
 IF (SELECT md5(coalesce(string_agg(user_id||':'||use_custom||':'||mode||':'||source_kind||':'||permissions::text,'|' ORDER BY user_id),'')) FROM public.user_permission_overrides)<>'921c3314094973bfaa620fd6f14261f2' THEN RAISE EXCEPTION 'Baseline mismatch: personal overrides changed since capture'; END IF;
END $guard$;

-- ===== CHANGES (schema is additive; existing rows get an empty deny list = neutral) =====
ALTER TABLE public.user_permission_overrides ADD COLUMN IF NOT EXISTS denied_permissions text[] NOT NULL DEFAULT '{}';
COMMENT ON COLUMN public.user_permission_overrides.denied_permissions IS 'Explicit personal DENY list. Wins over ALLOW from Common, position, task and personal sources. Written only by account_supplement_save.';
ALTER TABLE private.staff_permission_previews ADD COLUMN IF NOT EXISTS denied_permissions text[] NOT NULL DEFAULT '{}';

CREATE OR REPLACE FUNCTION private.universal_permission_ready(p text)
 RETURNS boolean LANGUAGE sql IMMUTABLE
AS $function$
 -- Keys whose server gates already read the Base resolver (org- or specialty-ready). Settings/admin keys stay Super-Admin-only.
 SELECT (private.org_role_permission_ready(p) OR private.mkt_specialty_permission_ready(p)) AND position('settings' in p)=0
$function$;
CREATE OR REPLACE FUNCTION private.universal_permission_scope(p text)
 RETURNS text LANGUAGE sql IMMUTABLE
AS $function$
 -- Label only. Unit data comes solely from the granting position appointment (org_permission_unit_member); other sources give no unit rows.
 SELECT CASE WHEN p LIKE '%\_unit' OR p='biz.crm_view_scope' THEN 'unit' ELSE 'native' END
$function$;
CREATE OR REPLACE FUNCTION private.grant_source_ready(kind text, p text)
 RETURNS boolean LANGUAGE sql IMMUTABLE
AS $function$
 -- One policy for every Role kind and personal ALLOW. Exceptions are proven scope gaps, not Role-kind whitelists:
 -- biz.crm_view_scope widens CRM through legacy business scope, so it stays position-only; k3.use stays out of Common until 3K application scope is accepted.
 SELECT private.universal_permission_ready(p) AND (kind='position' OR (p<>'biz.crm_view_scope' AND (kind<>'common' OR p<>'k3.use')))
$function$;
CREATE OR REPLACE FUNCTION private.universal_dormant_fence(role_id text, p text)
 RETURNS boolean LANGUAGE sql IMMUTABLE
AS $function$
 -- Exact pairs stored before this change that the old emitters ignored; they stay inactive so applying never silently grants. Super Admin may uncheck and re-check to activate.
 SELECT (role_id,p) IN (VALUES ('role-leader-marketing','brand.view'),('role-leader-marketing','local.create'),('role-leader-marketing','local.edit'),('role-leader-marketing','local.growth_create'),('role-leader-marketing','local.growth_edit'),('role-leader-marketing','local.growth_view'),('role-leader-marketing','local.photo'),('role-leader-marketing','local.post_create'),('role-leader-marketing','local.post_edit'),('role-leader-marketing','local.products'),('role-leader-marketing','local.review'),('role-leader-marketing','local.review_reply'),('role-leader-marketing','local.review_status'),('role-leader-marketing','local.view'),('role-leader-marketing','local.view_mine'),('role-leader-marketing','overview.alerts'),('role-leader-marketing','social.growth_create'),('role-leader-marketing','social.growth_edit'),('role-leader-marketing','social.growth_open'),('role-leader-marketing','social.growth_view'),('role-leader-marketing','social.post_create'),('role-leader-marketing','social.post_edit'),('role-leader-marketing','social.post_history'),('role-leader-marketing','social.post_resubmit'),('role-leader-marketing','social.post_start'),('role-leader-marketing','social.post_submit'),('role-leader-marketing','social.post_view'),('role-leader-marketing','social.post_view_mine'),('role-leader-marketing','social.view'),('role-leader-marketing','social.view_mine'),('role-leader-marketing','task.accept'),('role-leader-marketing','task.add_note'),('role-leader-marketing','task.create'),('role-leader-marketing','task.resubmit_completion'),('role-leader-marketing','task.start'),('role-leader-marketing','task.submit_completion'),('role-leader-marketing','task.update_result'),('role-leader-marketing','task.update_status'),('role-leader-marketing','task.view'),('role-leader-marketing','task.view_created_by_me'),('role-leader-marketing','task.view_history'),('role-leader-marketing','task.view_mine'),('role-leader-marketing','video.create'),('role-leader-marketing','video.create_design_order'),('role-leader-marketing','video.deliver'),('role-leader-marketing','video.edit_cut'),('role-leader-marketing','video.footage'),('role-leader-marketing','video.history'),('role-leader-marketing','video.move_editing'),('role-leader-marketing','video.move_shooting'),('role-leader-marketing','video.resubmit'),('role-leader-marketing','video.script_resubmit'),('role-leader-marketing','video.script_start'),('role-leader-marketing','video.script_submit'),('role-leader-marketing','video.submit'),('role-leader-marketing','video.view'),('role-leader-marketing','video.view_mine'),('role-leader-marketing','web.content_history'),('role-leader-marketing','web.content_note'),('role-leader-marketing','web.content_view'),('role-leader-marketing','web.content_view_mine'),('role-leader-marketing','web.edit_web_draft_url'),('role-leader-marketing','web.index_view'),('role-leader-marketing','web.keyword_open_sheet'),('role-leader-marketing','web.keyword_view'),('role-leader-marketing','web.open_detail'),('role-leader-marketing','web.open_published_url'),('role-leader-marketing','web.outline_resubmit'),('role-leader-marketing','web.outline_start'),('role-leader-marketing','web.outline_submit'),('role-leader-marketing','web.post_resubmit'),('role-leader-marketing','web.post_submit'),('role-leader-marketing','web.post_write_start'),('role-leader-marketing','web.resubmit_web_draft_review'),('role-leader-marketing','web.start_web_draft_layout'),('role-leader-marketing','web.submit_web_draft_review'),('role-leader-marketing','web.view'),('role-leader-marketing','web.view_web_draft_revision_note'),('role-leader-marketing','web.view_web_draft_url'),('role-u0fzsvsp','brand.view'),('role-video','leave.approve'),('role-video','leave.report'),('role-video','leave.view_assigned'),('role-video','order.assign'),('role-video','order.cancel'),('role-video','order.complete'),('role-video','order.request_changes'),('role-video','order.send_request'),('role-social','leave.approve'),('role-social','leave.create_for'),('role-social','leave.view_assigned'),('role-social','order.approve'),('role-social','order.assign'),('role-social','order.cancel'),('role-social','order.complete'),('role-social','order.request_changes'),('role-social','order.send_request'),('role-content-web','leave.approve'),('role-content-web','leave.report'),('role-content-web','leave.view_assigned'),('role-content-web','order.approve'),('role-content-web','order.assign'),('role-content-web','order.cancel'),('role-content-web','order.complete'),('role-content-web','order.edit'),('role-content-web','order.request_changes'),('role-content-web','order.send_request'),('role-viewer','brand.view'),('role-viewer','local.view'),('role-viewer','overview.alerts'),('role-viewer','social.post_view'),('role-viewer','social.view'),('role-viewer','video.view'),('role-viewer','web.content_view'),('role-viewer','web.open_detail'),('role-viewer','web.view'),('role-designer','brand.view'),('role-designer','local.view'),('role-designer','overview.alerts'),('role-designer','social.view'),('role-designer','task.accept'),('role-designer','task.add_note'),('role-designer','task.resubmit_completion'),('role-designer','task.start'),('role-designer','task.submit_completion'),('role-designer','task.update_result'),('role-designer','task.view'),('role-designer','task.view_history'),('role-designer','task.view_mine'),('role-designer','web.view'),('role-kinh-doanh','brand.view'),('role-local-seo','leave.approve'),('role-local-seo','leave.create_for'),('role-local-seo','leave.view_assigned'),('role-local-seo','order.approve'),('role-local-seo','order.assign'),('role-local-seo','order.cancel'),('role-local-seo','order.complete'),('role-local-seo','order.edit'),('role-local-seo','order.request_changes'),('role-local-seo','order.send_request'),('role-local-seo','order.view_all'),('role-seo','leave.approve'),('role-seo','leave.create_for'),('role-seo','leave.view_assigned'),('role-seo','order.approve'),('role-seo','order.assign'),('role-seo','order.cancel'),('role-seo','order.complete'),('role-seo','order.request_changes'),('role-seo','order.send_request'),('role-seo','order.view_all'))
$function$;
CREATE OR REPLACE FUNCTION private.personal_permission_rules(u uuid)
 RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
 -- Personal DENY always applies (also when the account is inactive); personal ALLOW only for an active account and ready keys.
 SELECT coalesce(jsonb_agg(x.rule),'[]'::jsonb) FROM (
  SELECT jsonb_build_object('id','personal-deny:'||p,'permission',p,'effect','DENY','scope','native','active',true,'source_kind','personal_deny','source_id',o.user_id::text,'source_name','Chặn riêng','legacy',false) rule
  FROM user_permission_overrides o CROSS JOIN LATERAL unnest(o.denied_permissions) p WHERE o.user_id=u
  UNION ALL
  SELECT jsonb_build_object('id','personal:'||p,'permission',p,'effect','ALLOW','scope','native','active',true,'source_kind','personal','source_id',o.user_id::text,'source_name','Cho phép riêng','legacy',false)
  FROM user_permission_overrides o CROSS JOIN LATERAL unnest(o.permissions) p
  WHERE o.user_id=u AND o.use_custom AND o.mode='additive' AND o.source_kind='supplemental' AND private.is_active(u) AND private.grant_source_ready('personal',p)
 ) x
$function$;
CREATE OR REPLACE FUNCTION private.permission_deny_write_guard()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$ BEGIN
 -- Deny lists change only through the audited preview/save RPC; direct table writes (including the admin RLS policy) cannot add, clear or delete them.
 IF coalesce(current_setting('base.personal_deny_write',true),'')='on' THEN RETURN coalesce(NEW,OLD); END IF;
 IF TG_OP='DELETE' THEN IF cardinality(OLD.denied_permissions)>0 AND EXISTS(SELECT 1 FROM auth.users WHERE id=OLD.user_id) THEN RAISE EXCEPTION 'Chặn quyền riêng chỉ thay đổi qua xem trước và xác nhận.' USING ERRCODE='42501'; END IF; RETURN OLD; END IF;
 IF TG_OP='INSERT' THEN IF cardinality(NEW.denied_permissions)>0 THEN RAISE EXCEPTION 'Chặn quyền riêng chỉ thay đổi qua xem trước và xác nhận.' USING ERRCODE='42501'; END IF; RETURN NEW; END IF;
 IF NEW.denied_permissions IS DISTINCT FROM OLD.denied_permissions OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN RAISE EXCEPTION 'Chặn quyền riêng chỉ thay đổi qua xem trước và xác nhận.' USING ERRCODE='42501'; END IF;
 RETURN NEW; END $function$;
DROP TRIGGER IF EXISTS permission_deny_write_guard ON public.user_permission_overrides;
CREATE TRIGGER permission_deny_write_guard BEFORE INSERT OR UPDATE OR DELETE ON public.user_permission_overrides FOR EACH ROW EXECUTE FUNCTION private.permission_deny_write_guard();
CREATE OR REPLACE FUNCTION private.staff_deny_validate(u uuid, allow_ text[], deny_ text[])
 RETURNS void LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$ DECLARE old_ text[]; BEGIN
 PERFORM private.supplement_permission_guard(u);
 SELECT denied_permissions INTO old_ FROM user_permission_overrides WHERE user_id=u; old_:=coalesce(old_,'{}');
 IF coalesce(cardinality(deny_),0)>600 THEN RAISE EXCEPTION 'Danh sách chặn quá dài.'; END IF;
 IF EXISTS(SELECT 1 FROM unnest(coalesce(allow_,'{}')) a WHERE a=ANY(coalesce(deny_,'{}'))) THEN RAISE EXCEPTION 'Một quyền không thể vừa Cho phép riêng vừa Chặn riêng; bỏ chặn trước khi cho phép.' USING ERRCODE='42501'; END IF;
 IF EXISTS(SELECT 1 FROM unnest(coalesce(deny_,'{}')) p WHERE NOT p=ANY(old_) AND NOT private.universal_permission_ready(p)) THEN RAISE EXCEPTION 'Quyền này chưa đi qua cổng kiểm tra quyền chung của máy chủ; chặn riêng sẽ không có hiệu lực nên không cho lưu.' USING ERRCODE='42501'; END IF;
 IF public.biz_admin(u) AND EXISTS(SELECT 1 FROM unnest(coalesce(deny_,'{}')) p WHERE p LIKE 'biz.crm\_%' AND NOT p=ANY(old_)) THEN RAISE EXCEPTION 'Quản trị Kinh doanh bỏ qua chặn riêng CRM; không tạo chặn giả.' USING ERRCODE='42501'; END IF;
 IF EXISTS(SELECT 1 FROM unnest(coalesce(deny_,'{}')) p WHERE p IN ('leave.approve','leave.view_assigned') AND NOT p=ANY(old_)) AND EXISTS(SELECT 1 FROM public.leave_requests l WHERE l.approver_id=u AND (l.status='pending' OR (l.cancel_state IS NOT NULL AND l.cancel_state NOT IN ('approved','rejected','cancelled','recalled')))) THEN RAISE EXCEPTION 'Nhân sự còn đơn chờ duyệt; chuyển người duyệt trước khi chặn quyền duyệt.' USING ERRCODE='42501'; END IF;
END $function$;
CREATE OR REPLACE FUNCTION private.permission_editor_policy()
 RETURNS TABLE(key text, scope text, personal boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT v.key,v.scope,v.personal OR private.grant_source_ready('personal',v.key) FROM (VALUES ('k3.use','own',true),('leave.create','own',true),('leave.view_own','own',true),('leave.edit_own','own',true),('leave.recall','own',true),('att.create','own',true),('att.view_own','own',true),('att.edit_own','own',true),('att.witness','own',true),('order.view','own',true),('order.view_mine','own',true),('order.take','own',true),('order.update_draft','own',true),('order.submit','own',true),('order.history','own',true),('web.view','assigned',false),('web.content_view','assigned',false),('web.content_view_mine','assigned',false),('web.outline_start','assigned',false),('web.outline_submit','assigned',false),('web.post_write_start','assigned',false),('web.post_submit','assigned',false),('web.keyword_view','assigned',false),('web.keyword_open_sheet','assigned',false),('local.view','assigned',false),('local.view_mine','assigned',false),('local.post_create','assigned',false),('local.post_edit','assigned',false),('social.view','assigned',false),('social.post_view','assigned',false),('social.post_view_mine','assigned',false),('social.post_create','assigned',false),('social.post_edit','assigned',false),('social.post_start','assigned',false),('social.post_submit','assigned',false),('video.view','assigned',false),('video.view_mine','assigned',false),('video.create','assigned',false),('video.script_start','assigned',false),('video.script_submit','assigned',false),('video.submit','assigned',false),('leave.view_unit','unit',false),('ot.view_unit','unit',false)) v(key,scope,personal) JOIN base_permission_catalog b ON b.key=v.key WHERE private.org_role_permission_ready(v.key) OR private.mkt_specialty_permission_ready(v.key)
 UNION ALL
 SELECT b.key,private.universal_permission_scope(b.key),private.grant_source_ready('personal',b.key) FROM base_permission_catalog b WHERE private.universal_permission_ready(b.key) AND b.key NOT IN ('k3.use','leave.create','leave.view_own','leave.edit_own','leave.recall','att.create','att.view_own','att.edit_own','att.witness','order.view','order.view_mine','order.take','order.update_draft','order.submit','order.history','web.view','web.content_view','web.content_view_mine','web.outline_start','web.outline_submit','web.post_write_start','web.post_submit','web.keyword_view','web.keyword_open_sheet','local.view','local.view_mine','local.post_create','local.post_edit','social.view','social.post_view','social.post_view_mine','social.post_create','social.post_edit','social.post_start','social.post_submit','video.view','video.view_mine','video.create','video.script_start','video.script_submit','video.submit','leave.view_unit','ot.view_unit') $function$;
CREATE OR REPLACE FUNCTION private.common_permission_ready(p text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 -- Same policy as every other source; see grant_source_ready for the two proven scope exceptions.
 SELECT private.grant_source_ready('common',p);
$function$;
CREATE OR REPLACE FUNCTION private.role_editor_validate(kind text, next_permissions text[], previous_permissions text[])
 RETURNS void
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN
 -- Removals are always allowed here (pending-obligation guard runs in role_catalog_change). Additions use one policy; position keeps its existing org-ready keys.
 IF EXISTS(SELECT 1 FROM unnest(coalesce(next_permissions,'{}')) p WHERE NOT p=ANY(coalesce(previous_permissions,'{}')) AND NOT (private.grant_source_ready(CASE WHEN kind IN ('common','position') THEN kind ELSE 'marketing_task' END,p) OR (kind NOT IN ('common','marketing_task') AND private.org_role_permission_ready(p)))) THEN RAISE EXCEPTION 'Quyền mới chưa đi qua cổng kiểm tra quyền của máy chủ (hoặc là quyền quản trị); giữ cấu hình hiện tại.' USING ERRCODE='42501'; END IF;
END $function$;
CREATE OR REPLACE FUNCTION private.org_slot_rules(u uuid, c jsonb)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 SELECT coalesce(jsonb_agg(x.rule),'[]'::jsonb) FROM (
 SELECT jsonb_build_object('id',(m->>'id')||':'||r.id||':'||p,'permission',p,'effect','ALLOW','scope','native','active',true,'source_kind','appointment_role','source_id',m->>'id','source_name',r.name,'role_id',r.id,'unit_id',m->>'unit_id','slot_id',NULL,'starts_at',m->>'starts_at','ends_at',m->>'ends_at','legacy',false) rule
 FROM jsonb_array_elements(coalesce(c->'memberships','[]')) m JOIN public.org_position_roles b ON b.unit_id=m->>'unit_id' AND b.title_id=m->>'title_id' JOIN LATERAL jsonb_array_elements(coalesce(c->'titles','[]')) t ON t->>'id'=m->>'title_id' JOIN app_roles r ON r.id=b.role_id AND r.role_kind='position' AND r.catalog_state='standard' AND NOT r.is_system AND r.catalog_generation>=2 CROSS JOIN LATERAL unnest(r.permissions) p
 WHERE private.is_active(u) AND m->>'user_id'=u::text AND private.base_valid_at(m) AND coalesce(m->>'status','active')='active' AND coalesce((t->>'active')::boolean,false) AND (private.org_role_permission_ready(p) OR (private.universal_permission_ready(p) AND NOT private.universal_dormant_fence(r.id,p)))
) x $function$;
CREATE OR REPLACE FUNCTION private.mkt_specialty_rules(u uuid, c jsonb)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT coalesce(jsonb_agg(DISTINCT jsonb_build_object('id','mkt:'||m.specialty_id||':'||p,'permission',p,'effect','ALLOW','scope','own','active',true,'source_kind','marketing_specialty','source_id',m.specialty_id,'source_name',s.name,'role_id',r.id,'legacy',NOT m.eligibility_enforced)),'[]'::jsonb) FROM mkt_staff_specialties m JOIN mkt_specialties s ON s.id=m.specialty_id AND s.active JOIN app_roles r ON r.id=s.role_id CROSS JOIN LATERAL unnest(r.permissions) p WHERE m.user_id=u AND m.state='active' AND private.is_active(u) AND (private.mkt_specialty_permission_ready(p) OR (private.grant_source_ready('marketing_task',p) AND NOT private.universal_dormant_fence(r.id,p))) AND (r.role_kind<>'marketing_task' OR (NOT m.eligibility_enforced AND r.catalog_generation<2) OR private.org_marketing_eligible(u,c)) $function$;
CREATE OR REPLACE FUNCTION private.org_assignment_specialty_rules(u uuid, c jsonb)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 SELECT coalesce(jsonb_agg(DISTINCT jsonb_build_object('id','assignment-specialty:'||(m->>'id')||':'||s.id||':'||p,'permission',p,'effect','ALLOW','scope','native','active',true,'source_kind','marketing_appointment','source_id',m->>'id','source_name',s.name,'role_id',r.id,'unit_id',m->>'unit_id','starts_at',m->>'starts_at','ends_at',m->>'ends_at')),'[]')
 FROM jsonb_array_elements(coalesce(c->'memberships','[]')) m JOIN LATERAL jsonb_array_elements(coalesce(c->'titles','[]')) t ON t->>'id'=m->>'title_id'
 CROSS JOIN LATERAL jsonb_array_elements_text(coalesce(m->'specialty_ids','[]')) sid
 JOIN mkt_specialties s ON s.id=sid AND s.active JOIN app_roles r ON r.id=s.role_id CROSS JOIN LATERAL unnest(r.permissions) p
 WHERE private.is_active(u) AND m->>'user_id'=u::text AND private.base_valid_at(m) AND m->>'status'='active' AND coalesce((t->>'active')::boolean,false) AND t->>'source' IS DISTINCT FROM 'biz_positions' AND r.id NOT IN ('role-admin','role-super-admin')
 AND (m->'specialty_signatures'->>s.id=md5(coalesce(r.permissions,'{}')::text) OR r.catalog_generation>=2)
 AND (private.org_role_permission_ready(p) OR (r.catalog_generation>=2 AND r.role_kind='marketing_task' AND private.mkt_specialty_permission_ready(p)) OR (r.catalog_generation>=2 AND private.grant_source_ready('marketing_task',p) AND NOT private.universal_dormant_fence(r.id,p)))
 AND (r.role_kind<>'marketing_task' OR r.catalog_generation<2 OR EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(c->'units','[]')) b WHERE b->>'kind'='block' AND (b->>'id'='b5e00000-0000-4000-8000-000000000001' OR b->>'code'='marketing') AND coalesce((b->>'active')::boolean,true) AND private.base_role_unit_contains(c,b->>'id',m->>'unit_id')))
 AND EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(c->'units','[]')) root WHERE root->>'kind' IN ('company','block') AND private.base_role_unit_contains(c,root->>'id',m->>'unit_id')) $function$;
CREATE OR REPLACE FUNCTION private.base_rules(u uuid, c jsonb)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 SELECT coalesce(jsonb_agg(r),'[]') || private.common_role_rules(u) || private.personal_permission_rules(u) FROM jsonb_array_elements(private.reset_previous_base_rules(u,c)) r WHERE NOT private.legacy_reset_applies(u) OR r->>'effect'='DENY' OR (r->>'source_kind' IN ('appointment_role','marketing_appointment') AND EXISTS(SELECT 1 FROM app_roles ar WHERE ar.id=r->>'role_id' AND ar.catalog_state='standard'))
$function$;
CREATE OR REPLACE FUNCTION public.account_supplement_read(_target uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ DECLARE state_ jsonb; BEGIN PERFORM private.supplement_permission_guard(_target);state_:=private.supplement_permission_state(_target); RETURN jsonb_build_object('fingerprint',md5(state_::text),'role_ids',(SELECT coalesce(jsonb_agg(role_id ORDER BY role_id),'[]') FROM user_roles WHERE user_id=_target AND source_kind='supplemental'),'permissions',(SELECT to_jsonb(permissions) FROM user_permission_overrides WHERE user_id=_target AND source_kind='supplemental'),'denied_permissions',(SELECT to_jsonb(denied_permissions) FROM user_permission_overrides WHERE user_id=_target),'deny_supported',true,'legacy_override',EXISTS(SELECT 1 FROM user_permission_overrides WHERE user_id=_target AND use_custom AND (source_kind='legacy' OR mode='replace')),'inactive_legacy',EXISTS(SELECT 1 FROM user_permission_overrides WHERE user_id=_target AND NOT use_custom AND mode='replace'),'roles',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',r.id,'name',r.name,'catalog_state',r.catalog_state,'permissions',r.permissions) ORDER BY r.name),'[]') FROM app_roles r WHERE r.catalog_state='standard' AND r.id NOT IN('role-admin','role-super-admin','role-kinh-doanh','role-9h328b84','role-g8qc3q2s','role-u0fzsvsp') AND NOT EXISTS(SELECT 1 FROM unnest(r.permissions)p WHERE p LIKE 'biz.%' OR p LIKE 'k3.%' OR p LIKE 'settings.%')));END $function$;
CREATE OR REPLACE FUNCTION public.account_supplement_preview(_target uuid, _permissions text[], _denied text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ DECLARE state_ jsonb; old_ text[]; oldd_ text[]; p record; allow_ text[]:=ARRAY(SELECT DISTINCT unnest(coalesce(_permissions,'{}')) ORDER BY 1); deny_ text[]:=ARRAY(SELECT DISTINCT unnest(coalesce(_denied,'{}')) ORDER BY 1); BEGIN
 PERFORM private.staff_permission_validate(_target,allow_); PERFORM private.staff_deny_validate(_target,allow_,deny_);
 state_:=private.supplement_permission_state(_target);
 SELECT permissions INTO old_ FROM user_permission_overrides WHERE user_id=_target AND use_custom AND source_kind='supplemental' AND mode='additive';
 SELECT denied_permissions INTO oldd_ FROM user_permission_overrides WHERE user_id=_target;
 INSERT INTO private.staff_permission_previews(actor_id,target_id,permissions,denied_permissions,baseline) VALUES(auth.uid(),_target,allow_,deny_,md5(state_::text)) RETURNING * INTO p;
 RETURN jsonb_build_object('id',p.id,'fingerprint',p.baseline,'affected_users',jsonb_build_array(_target),
  'added',to_jsonb(ARRAY(SELECT unnest(allow_) EXCEPT SELECT unnest(coalesce(old_,'{}')))),'removed',to_jsonb(ARRAY(SELECT unnest(coalesce(old_,'{}')) EXCEPT SELECT unnest(allow_))),
  'deny_added',to_jsonb(ARRAY(SELECT unnest(deny_) EXCEPT SELECT unnest(coalesce(oldd_,'{}')))),'deny_removed',to_jsonb(ARRAY(SELECT unnest(coalesce(oldd_,'{}')) EXCEPT SELECT unnest(deny_))),
  'inactive_legacy',EXISTS(SELECT 1 FROM user_permission_overrides WHERE user_id=_target AND NOT use_custom AND mode='replace'),'expires_at',p.expires_at); END $function$;
CREATE OR REPLACE FUNCTION public.account_supplement_save(_target uuid, _roles text[], _permissions text[], _denied text[], _fingerprint text, _reason text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ DECLARE before_ jsonb; after_ jsonb; p record; roles_ text[]; allow_ text[]:=ARRAY(SELECT DISTINCT unnest(coalesce(_permissions,'{}')) ORDER BY 1); deny_ text[]:=ARRAY(SELECT DISTINCT unnest(coalesce(_denied,'{}')) ORDER BY 1); BEGIN
 LOCK TABLE user_roles,user_permission_overrides,app_roles,profiles,biz_appointments,biz_department_members,biz_management_assignments,biz_member_affiliations IN SHARE ROW EXCLUSIVE MODE;
 PERFORM private.staff_permission_validate(_target,allow_); PERFORM private.staff_deny_validate(_target,allow_,deny_);
 IF coalesce(length(trim(_reason)),0)=0 OR cardinality(allow_)>600 THEN RAISE EXCEPTION 'Cần lý do và danh sách quyền hợp lệ.'; END IF;
 SELECT coalesce(array_agg(role_id ORDER BY role_id),'{}') INTO roles_ FROM user_roles WHERE user_id=_target AND source_kind='supplemental';
 IF roles_ IS DISTINCT FROM ARRAY(SELECT DISTINCT unnest(coalesce(_roles,'{}')) ORDER BY 1) THEN RAISE EXCEPTION 'Không cấp hoặc thu hồi Role trực tiếp tại quyền bổ sung cá nhân.'; END IF;
 before_:=private.supplement_permission_state(_target);
 IF md5(before_::text) IS DISTINCT FROM _fingerprint THEN RAISE EXCEPTION 'Quyền đã thay đổi; tải lại trước khi lưu.'; END IF;
 SELECT * INTO p FROM private.staff_permission_previews WHERE actor_id=auth.uid() AND target_id=_target AND baseline=_fingerprint AND permissions=allow_ AND denied_permissions=deny_ AND applied_at IS NULL AND expires_at>clock_timestamp() ORDER BY created_at DESC LIMIT 1 FOR UPDATE;
 IF p.id IS NULL THEN RAISE EXCEPTION 'Cần xem trước còn hiệu lực trước khi lưu quyền riêng.'; END IF;
 PERFORM set_config('base.personal_deny_write','on',true);
 INSERT INTO user_permission_overrides(user_id,use_custom,permissions,denied_permissions,mode,source_kind) VALUES(_target,cardinality(allow_)>0,allow_,deny_,'additive','supplemental')
  ON CONFLICT(user_id) DO UPDATE SET use_custom=excluded.use_custom,permissions=excluded.permissions,denied_permissions=excluded.denied_permissions,mode='additive',source_kind='supplemental',updated_at=now();
 PERFORM set_config('base.personal_deny_write','',true);
 after_:=private.supplement_permission_state(_target);
 INSERT INTO account_permission_changes(actor_id,target_id,before_data,after_data,reason) VALUES(auth.uid(),_target,before_,after_,_reason);
 UPDATE private.staff_permission_previews SET applied_at=clock_timestamp() WHERE id=p.id;
 RETURN jsonb_build_object('fingerprint',md5(after_::text),'saved',true,'affected_users',jsonb_build_array(_target),'mode','additive','denied',to_jsonb(deny_)); END $function$;
CREATE OR REPLACE FUNCTION public.account_supplement_preview(_target uuid, _permissions text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN
 -- Compatibility: older clients keep the current personal DENY list unchanged.
 RETURN public.account_supplement_preview(_target,_permissions,coalesce((SELECT denied_permissions FROM user_permission_overrides WHERE user_id=_target),'{}')); END $function$;
CREATE OR REPLACE FUNCTION public.account_supplement_save(_target uuid, _roles text[], _permissions text[], _fingerprint text, _reason text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN
 -- Compatibility: older clients keep the current personal DENY list unchanged.
 RETURN public.account_supplement_save(_target,_roles,_permissions,coalesce((SELECT denied_permissions FROM user_permission_overrides WHERE user_id=_target),'{}'),_fingerprint,_reason); END $function$;
CREATE OR REPLACE FUNCTION public.permission_editor_read()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN IF NOT private.is_active(auth.uid()) THEN RAISE EXCEPTION 'Cần đăng nhập bằng tài khoản hoạt động.' USING ERRCODE='42501'; END IF; RETURN (SELECT coalesce(jsonb_agg(to_jsonb(p)||jsonb_build_object('common_ready',private.grant_source_ready('common',p.key),'position_ready',private.grant_source_ready('position',p.key),'task_ready',private.grant_source_ready('marketing_task',p.key),'grantable',private.grant_source_ready('common',p.key) AND private.grant_source_ready('marketing_task',p.key) AND p.personal,'deny_ready',private.universal_permission_ready(p.key),'unit_binding',CASE WHEN p.scope='unit' THEN 'position_appointment' END,'reason',CASE WHEN p.key='k3.use' THEN 'Role chung chưa cấp 3K; dùng Role vị trí, nhiệm vụ hoặc cá nhân.' WHEN p.key='biz.crm_view_scope' THEN 'Phạm vi CRM chỉ an toàn khi gắn với Role vị trí.' END)),'[]') FROM private.permission_editor_policy() p); END $function$;
REVOKE ALL ON FUNCTION private.universal_permission_ready(text),private.universal_permission_scope(text),private.grant_source_ready(text,text),private.universal_dormant_fence(text,text),private.personal_permission_rules(uuid),private.permission_deny_write_guard(),private.staff_deny_validate(uuid,text[],text[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.account_supplement_preview(uuid,text[],text[]),public.account_supplement_save(uuid,text[],text[],text[],text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.account_supplement_preview(uuid,text[],text[]),public.account_supplement_save(uuid,text[],text[],text[],text,text) TO authenticated, service_role;
COMMIT;
