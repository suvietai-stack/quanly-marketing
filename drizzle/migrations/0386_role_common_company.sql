-- PENDING ONLY: common Role extension, AFTER accepted shared-position cutover.
-- Never execute the snapshot SQL files separately. No production Role permissions seeded.
DO $preflight$ BEGIN
IF (SELECT md5(pg_get_functiondef(p.oid)) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='role_catalog_read') IS DISTINCT FROM '37c7532e8c76c553978ec03314bee03c' THEN RAISE EXCEPTION 'Baseline changed: public.role_catalog_read'; END IF;
IF (SELECT md5(pg_get_functiondef(p.oid)) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='private' AND p.proname='role_source_rows') IS DISTINCT FROM 'ce13485d8a163df0808967de4ab4797a' THEN RAISE EXCEPTION 'Baseline changed: private.role_source_rows'; END IF;
IF (SELECT md5(pg_get_functiondef(p.oid)) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='permission_editor_read') IS DISTINCT FROM 'a05bdf849369af3837f4a7f6d482660b' THEN RAISE EXCEPTION 'Baseline changed: public.permission_editor_read'; END IF;
IF (SELECT md5(pg_get_functiondef(p.oid)) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='private' AND p.proname='role_editor_validate') IS DISTINCT FROM 'd820059c86b1e6bc2aa3f6f752c12d83' THEN RAISE EXCEPTION 'Baseline changed: private.role_editor_validate'; END IF;
IF (SELECT md5(pg_get_functiondef(p.oid)) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='role_catalog_change') IS DISTINCT FROM '16ffa239723e05252f4165b2ee82c330' THEN RAISE EXCEPTION 'Baseline changed: public.role_catalog_change'; END IF;
IF (SELECT md5(pg_get_functiondef(p.oid)) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='private' AND p.proname='base_rules') IS DISTINCT FROM 'b7359b228a98c7f3c569c2098d509c12' THEN RAISE EXCEPTION 'Baseline changed: private.base_rules'; END IF;
END $preflight$;
ALTER TABLE public.app_roles DROP CONSTRAINT app_roles_role_kind_check;
ALTER TABLE public.app_roles ADD CONSTRAINT app_roles_role_kind_check CHECK (role_kind IN ('common','position','marketing_task','system'));
CREATE UNIQUE INDEX app_roles_one_common ON public.app_roles ((role_kind)) WHERE role_kind='common';
CREATE OR REPLACE FUNCTION private.common_permission_ready(p text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO public AS $$
 -- k3.use stays unavailable from Common until the single block-application gate is activated and verified.
 SELECT p<>'k3.use' AND EXISTS(SELECT 1 FROM private.permission_editor_policy() s WHERE s.key=p AND s.scope='own' AND s.personal AND private.org_role_permission_ready(p));
$$;
REVOKE ALL ON FUNCTION private.common_permission_ready(text) FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION private.common_role_rules(u uuid) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO public AS $$
 SELECT coalesce(jsonb_agg(jsonb_build_object('permission',p,'effect','ALLOW','source_kind','common','source_id',r.id,'role_id',r.id,'source_name',r.name,'scope','own','unit_id',NULL)),'[]')
 FROM app_roles r CROSS JOIN LATERAL unnest(r.permissions) p
 WHERE private.is_active(u) AND r.role_kind='common' AND r.catalog_generation=2 AND r.catalog_state='standard' AND private.common_permission_ready(p);
$$;
REVOKE ALL ON FUNCTION private.common_role_rules(uuid) FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION private.base_rules(u uuid, c jsonb)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 SELECT coalesce(jsonb_agg(r),'[]') || private.common_role_rules(u) FROM jsonb_array_elements(private.reset_previous_base_rules(u,c)) r WHERE NOT private.legacy_reset_applies(u) OR r->>'effect'='DENY' OR (r->>'source_kind' IN ('appointment_role','marketing_appointment') AND EXISTS(SELECT 1 FROM app_roles ar WHERE ar.id=r->>'role_id' AND ar.catalog_state='standard'))
$function$
;

CREATE OR REPLACE FUNCTION private.role_source_rows(c jsonb)
 RETURNS TABLE(user_id uuid, role_id text, source_kind text, source_id text, unit_id text, legacy boolean, eligible boolean, scope text, permissions text[])
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 SELECT * FROM private.slot_previous_source_rows(c)
 UNION ALL
 SELECT (m->>'user_id')::uuid,r.id,'task',m->>'id'||':'||s.id,m->>'unit_id',true,private.org_marketing_eligible((m->>'user_id')::uuid,c),'native',ARRAY(SELECT p FROM unnest(r.permissions) p WHERE private.org_role_permission_ready(p))
 FROM jsonb_array_elements(coalesce(c->'memberships','[]')) m CROSS JOIN LATERAL jsonb_array_elements_text(coalesce(m->'specialty_ids','[]')) sid JOIN mkt_specialties s ON s.id=sid AND s.active JOIN app_roles r ON r.id=s.role_id
 WHERE private.is_active((m->>'user_id')::uuid) AND private.base_valid_at(m) AND m->>'status'='active' AND m->'specialty_signatures'->>s.id=md5(coalesce(r.permissions,'{}')::text) 
 UNION ALL
 SELECT p.id,r.id,'common',r.id,NULL::text,false,true,'own',ARRAY(SELECT k FROM unnest(r.permissions) k WHERE private.common_permission_ready(k))
 FROM profiles p CROSS JOIN app_roles r WHERE private.is_active(p.id) AND r.role_kind='common' AND r.catalog_generation=2 AND r.catalog_state='standard'
$function$
;

CREATE OR REPLACE FUNCTION private.role_editor_validate(kind text, next_permissions text[], previous_permissions text[])
 RETURNS void
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN IF kind='common' AND EXISTS(SELECT 1 FROM unnest(coalesce(next_permissions,'{}')) p WHERE NOT private.common_permission_ready(p)) THEN RAISE EXCEPTION 'Quyền chung chỉ hỗ trợ quyền cá nhân cơ bản đã kiểm chứng.' USING ERRCODE='42501'; END IF; IF EXISTS(SELECT 1 FROM unnest(coalesce(next_permissions,'{}')) p WHERE NOT p=ANY(coalesce(previous_permissions,'{}')) AND NOT EXISTS(SELECT 1 FROM private.permission_editor_policy() s WHERE s.key=p AND CASE WHEN kind='marketing_task' THEN private.mkt_specialty_permission_ready(p) AND s.scope<>'unit' ELSE private.org_role_permission_ready(p) END)) THEN RAISE EXCEPTION 'Quyền mới chưa có phạm vi an toàn; giữ cấu hình hiện tại hoặc chọn quyền đã kiểm chứng.' USING ERRCODE='42501'; END IF; END $function$
;

CREATE OR REPLACE FUNCTION public.permission_editor_read()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN IF NOT private.is_active(auth.uid()) THEN RAISE EXCEPTION 'Cần đăng nhập bằng tài khoản hoạt động.' USING ERRCODE='42501'; END IF; RETURN (SELECT coalesce(jsonb_agg(to_jsonb(p)||jsonb_build_object('common_ready',private.common_permission_ready(p.key),'position_ready',private.org_role_permission_ready(p.key),'task_ready',private.mkt_specialty_permission_ready(p.key) AND p.scope<>'unit')),'[]') FROM private.permission_editor_policy() p); END $function$
;

CREATE OR REPLACE FUNCTION public.role_catalog_read()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ DECLARE d jsonb; counts jsonb; BEGIN d:=private.slot_catalog_previous_read(); SELECT coalesce(jsonb_object_agg(role_id,stats),'{}') INTO counts FROM (SELECT role_id,jsonb_build_object('total',count(DISTINCT user_id),'slots',count(DISTINCT user_id) FILTER(WHERE source_kind IN ('slot','position')),'tasks',count(DISTINCT user_id) FILTER(WHERE source_kind IN ('task','specialty')),'direct',count(DISTINCT user_id) FILTER(WHERE source_kind='direct'),'legacy',count(DISTINCT user_id) FILTER(WHERE source_kind='title_legacy')) stats FROM private.role_source_rows(private.base_config()) GROUP BY role_id) x; d:=d||jsonb_build_object('common_role_ready',true); RETURN jsonb_set(d,'{roles}',(SELECT coalesce(jsonb_agg(r||jsonb_build_object('receivers',coalesce((counts->(r->>'id')->>'total')::int,0),'receiver_counts',coalesce(counts->(r->>'id'),'{}'))),'[]') FROM jsonb_array_elements(d->'roles') r)); END $function$
;

CREATE OR REPLACE FUNCTION public.role_catalog_change(_phase text, _action text DEFAULT NULL::text, _role_id text DEFAULT NULL::text, _proposed jsonb DEFAULT NULL::jsonb, _preview uuid DEFAULT NULL::uuid, _confirmation text DEFAULT NULL::text, _reason text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 DECLARE p record; r record; proposal jsonb; before_ jsonb; id_ text; affected_ jsonb; canonical_ boolean:=false; basis_ text[]; scope_all_ boolean; scope_ text[]; gen_ smallint;
 BEGIN
 IF NOT private.is_active(auth.uid()) OR NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin quản trị kho Role.' USING ERRCODE='42501'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('canonical_org'));
 LOCK TABLE app_roles,user_roles,base_title_role_links,org_assignments,org_position_slots,mkt_specialties,mkt_staff_specialties,leave_requests IN SHARE ROW EXCLUSIVE MODE;
 IF _phase='preview' THEN
  IF _action NOT IN ('create','edit','archive','delete') THEN RAISE EXCEPTION 'Thao tác Role không hợp lệ.'; END IF;
  canonical_:=_action='create' AND nullif(_proposed->>'canonical_id','') IS NOT NULL;
  IF canonical_ THEN
   id_:=_proposed->>'canonical_id';
   IF id_ !~ '^role-v2-[a-z0-9]+(-[a-z0-9]+)*$' THEN RAISE EXCEPTION 'Mã Role chuẩn mới không hợp lệ.'; END IF;
   IF EXISTS(SELECT 1 FROM app_roles WHERE id=id_ OR role_code=id_) THEN RAISE EXCEPTION 'Role chuẩn mới đã tồn tại; chỉnh sửa thay vì tạo lại.'; END IF;
  ELSE
   id_:=CASE WHEN _action='create' THEN 'role-custom-'||gen_random_uuid()::text ELSE _role_id END;
  END IF;
  SELECT * INTO r FROM app_roles WHERE id=id_; before_:=to_jsonb(r);
  IF _action<>'create' AND r.id IS NULL THEN RAISE EXCEPTION 'Role không tồn tại.'; END IF;
  IF _action IN ('archive','delete') AND r.is_system THEN RAISE EXCEPTION 'Role hệ thống không được ngừng hoặc xóa.'; END IF;
  IF _action='delete' AND private.role_in_use(id_) THEN RAISE EXCEPTION 'Role còn liên kết vị trí, nhiệm vụ hoặc nguồn trực tiếp; không được xóa.'; END IF;
  IF _action='archive' AND private.role_in_use(id_) THEN RAISE EXCEPTION 'Role đang được sử dụng; cần nguồn thay thế đã xác nhận trước khi ngừng.'; END IF;
  proposal:=coalesce(_proposed,'{}'); IF _action='edit' AND (r.is_system OR r.id IN ('role-admin','role-super-admin')) AND proposal->'permissions' IS DISTINCT FROM to_jsonb(r.permissions) THEN RAISE EXCEPTION 'Role hệ thống được bảo vệ.' USING ERRCODE='42501'; END IF;
  IF _action='create' AND proposal->>'role_kind'='common' THEN RAISE EXCEPTION 'Quyền chung duy nhất đã có; chỉnh bộ hiện hữu.'; END IF;
  IF _action IN ('archive','delete') AND r.role_kind='common' THEN RAISE EXCEPTION 'Không ngừng hoặc xóa bộ quyền chung; bỏ quyền qua chỉnh sửa.'; END IF;
  IF _action='edit' AND ((r.role_kind='common') IS DISTINCT FROM (proposal->>'role_kind'='common')) THEN RAISE EXCEPTION 'Không chuyển loại Role chung.'; END IF;
  basis_:=coalesce(r.permissions,'{}'); gen_:=CASE WHEN canonical_ THEN 2 ELSE coalesce(r.catalog_generation,1) END;
  IF canonical_ THEN
   IF jsonb_typeof(proposal->'basis_role_ids') IS DISTINCT FROM 'array' OR jsonb_array_length(proposal->'basis_role_ids')=0 OR EXISTS(SELECT 1 FROM jsonb_array_elements_text(proposal->'basis_role_ids') b WHERE b IN ('role-admin','role-super-admin') OR NOT EXISTS(SELECT 1 FROM app_roles ar WHERE ar.id=b)) THEN RAISE EXCEPTION 'Role chuẩn mới cần Role nguồn đối chiếu hợp lệ.'; END IF;
   basis_:=ARRAY(SELECT DISTINCT k FROM app_roles ar CROSS JOIN LATERAL unnest(ar.permissions) k WHERE ar.id IN (SELECT jsonb_array_elements_text(proposal->'basis_role_ids')));
   SELECT ar.signal_scope_all,ar.signal_scope INTO scope_all_,scope_ FROM app_roles ar WHERE ar.id=proposal->'basis_role_ids'->>0;
   proposal:=proposal||jsonb_build_object('signal_scope_all',coalesce(scope_all_,false),'signal_scope',to_jsonb(coalesce(scope_,'{}'::text[])),'catalog_generation',2);
  END IF;
  IF _action IN ('create','edit') THEN
PERFORM private.role_editor_validate(proposal->>'role_kind',ARRAY(SELECT jsonb_array_elements_text(coalesce(proposal->'permissions','[]'))),basis_);
IF NOT canonical_ AND coalesce((proposal->>'signal_scope_all')::boolean,false) AND NOT coalesce(r.signal_scope_all,false) THEN RAISE EXCEPTION 'Không mở tất cả nhóm tín hiệu qua ma trận quyền.'; END IF;
IF _action='edit' AND proposal->'signal_scope' IS DISTINCT FROM to_jsonb(r.signal_scope) THEN RAISE EXCEPTION 'Giữ phạm vi nhóm hiện có; cấu hình phạm vi cần quy trình riêng.'; END IF;
IF _action='create' AND NOT canonical_ AND coalesce(jsonb_array_length(proposal->'signal_scope'),0)>0 THEN RAISE EXCEPTION 'Role mới không mặc định phạm vi tín hiệu.'; END IF;

   IF coalesce(trim(proposal->>'name'),'')='' OR proposal->>'role_kind' NOT IN ('common','position','marketing_task','system') OR jsonb_typeof(proposal->'permissions') IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Tên, loại và permission Role không hợp lệ.'; END IF;
   IF _action='create' AND proposal->>'role_kind'='system' THEN RAISE EXCEPTION 'Không tạo Role đặc quyền qua kho thông thường.'; END IF;
   IF _action='edit' AND proposal->>'role_kind'<>r.role_kind AND private.role_in_use(id_) THEN RAISE EXCEPTION 'Không đổi loại Role đang sử dụng.'; END IF;
   IF _action='edit' AND r.is_system AND (proposal->>'name'<>r.name OR proposal->>'role_kind'<>r.role_kind OR (id_='role-super-admin' AND proposal->'permissions' IS DISTINCT FROM to_jsonb(r.permissions))) THEN RAISE EXCEPTION 'Không thay đổi Role hệ thống được bảo vệ.'; END IF;
   IF EXISTS(SELECT 1 FROM jsonb_array_elements_text(proposal->'permissions') k WHERE NOT EXISTS(SELECT 1 FROM base_permission_catalog b WHERE b.key=k) AND NOT (_action='edit' AND k=ANY(r.permissions))) THEN RAISE EXCEPTION 'Permission chưa có trong danh mục backend.'; END IF;
   IF EXISTS(SELECT 1 FROM app_roles ar WHERE ar.id<>id_ AND ar.catalog_state='standard' AND ar.catalog_generation=gen_ AND lower(trim(ar.name))=lower(trim(proposal->>'name'))) THEN RAISE EXCEPTION 'Tên Role đã tồn tại.'; END IF;
  END IF;
  IF _action='edit' AND r.catalog_generation>=2 AND EXISTS(SELECT 1 FROM unnest(r.permissions) k WHERE NOT coalesce(proposal->'permissions','[]') ? k) THEN PERFORM private.role_v2_reduction_guard(id_); END IF; affected_:=(SELECT coalesce(jsonb_agg(DISTINCT user_id),'[]') FROM private.role_source_rows(private.base_config()) WHERE role_id=id_);
  INSERT INTO private.role_catalog_previews(actor_id,action,role_id,proposed,before_data,baseline) VALUES(auth.uid(),_action,id_,proposal,before_,private.role_catalog_fingerprint()) RETURNING * INTO p;
  RETURN jsonb_build_object('id',p.id,'action',_action,'role_id',id_,'before',before_,'after',proposal,'affected_users',affected_,'references',private.role_references(id_),'added',(SELECT coalesce(jsonb_agg(k),'[]') FROM jsonb_array_elements_text(coalesce(proposal->'permissions','[]')) k WHERE NOT k=ANY(coalesce(r.permissions,'{}'))),'removed',(SELECT coalesce(jsonb_agg(k),'[]') FROM unnest(coalesce(r.permissions,'{}')) k WHERE NOT coalesce(proposal->'permissions','[]') ? k),'expires_at',p.expires_at);
 ELSIF _phase='apply' THEN
  SELECT * INTO p FROM private.role_catalog_previews WHERE id=_preview AND actor_id=auth.uid() FOR UPDATE;
  IF p.id IS NULL OR p.applied_at IS NOT NULL OR p.expires_at<=clock_timestamp() OR p.baseline<>private.role_catalog_fingerprint() THEN RAISE EXCEPTION 'Xem trước hết hạn hoặc nguồn đã thay đổi.'; END IF;
  IF _confirmation IS DISTINCT FROM 'ÁP DỤNG ROLE' OR coalesce(trim(_reason),'')='' THEN RAISE EXCEPTION 'Cần xác nhận ÁP DỤNG ROLE và lý do.'; END IF;
  PERFORM set_config('app.role_reason',trim(_reason),true); proposal:=p.proposed;
  IF proposal->>'role_kind'='common' THEN PERFORM private.role_editor_validate('common',ARRAY(SELECT jsonb_array_elements_text(proposal->'permissions')),'{}'); END IF;
  IF p.action='create' THEN
   IF coalesce((proposal->>'catalog_generation')::smallint,1)>=2 THEN PERFORM set_config('app.role_v2_validated',p.role_id,true); END IF;
   INSERT INTO app_roles(id,name,description,permissions,is_system,catalog_state,catalog_group,role_kind,role_code,signal_scope_all,signal_scope,catalog_generation) VALUES(p.role_id,trim(proposal->>'name'),coalesce(proposal->>'description',''),ARRAY(SELECT DISTINCT jsonb_array_elements_text(proposal->'permissions')),false,'standard',CASE WHEN proposal->>'role_kind'='marketing_task' THEN 'Nhiệm vụ Marketing' ELSE coalesce(proposal->>'catalog_group','Vận hành') END,proposal->>'role_kind',p.role_id,coalesce((proposal->>'signal_scope_all')::boolean,false),ARRAY(SELECT jsonb_array_elements_text(coalesce(proposal->'signal_scope','[]'))),coalesce((proposal->>'catalog_generation')::smallint,1));
  ELSIF p.action='edit' THEN
   SELECT * INTO r FROM app_roles WHERE id=p.role_id;
   IF (r.is_system OR r.id IN ('role-admin','role-super-admin')) AND proposal->'permissions' IS DISTINCT FROM to_jsonb(r.permissions) THEN RAISE EXCEPTION 'Role hệ thống được bảo vệ.' USING ERRCODE='42501'; END IF;
   IF r.catalog_generation>=2 AND EXISTS(SELECT 1 FROM unnest(r.permissions) k WHERE NOT coalesce(proposal->'permissions','[]') ? k) THEN PERFORM private.role_v2_reduction_guard(p.role_id); END IF;
   UPDATE app_roles SET name=trim(proposal->>'name'),description=coalesce(proposal->>'description',''),permissions=ARRAY(SELECT DISTINCT jsonb_array_elements_text(proposal->'permissions')),role_kind=proposal->>'role_kind',catalog_group=CASE WHEN proposal->>'role_kind'='marketing_task' THEN 'Nhiệm vụ Marketing' ELSE coalesce(proposal->>'catalog_group',catalog_group) END,signal_scope_all=coalesce((proposal->>'signal_scope_all')::boolean,signal_scope_all),signal_scope=CASE WHEN proposal ? 'signal_scope' THEN ARRAY(SELECT jsonb_array_elements_text(proposal->'signal_scope')) ELSE signal_scope END,updated_at=now() WHERE id=p.role_id;
  ELSIF p.action='archive' THEN
   IF private.role_in_use(p.role_id) THEN RAISE EXCEPTION 'Role vẫn còn liên kết.'; END IF;
   UPDATE app_roles SET catalog_state='archived',updated_at=now() WHERE id=p.role_id;
  ELSIF p.action='delete' THEN
   IF private.role_in_use(p.role_id) THEN RAISE EXCEPTION 'Role vẫn còn liên kết.'; END IF;
   DELETE FROM app_roles WHERE id=p.role_id;
  END IF;
  UPDATE private.role_catalog_previews SET applied_at=clock_timestamp() WHERE id=p.id;
  RETURN jsonb_build_object('role_id',p.role_id,'action',p.action);
 END IF;
 RAISE EXCEPTION 'Giai đoạn không hợp lệ.';
 END $function$
;

-- The single common Role starts empty: no automatic grant or per-user link INSERT.
INSERT INTO public.app_roles(id,role_code,name,description,role_kind,catalog_generation,catalog_state,catalog_group,permissions,signal_scope_all,signal_scope,is_system)
VALUES('role-v2-common','role-v2-common','Quyền chung','Quyền cá nhân cơ bản cho tài khoản hoạt động đã duyệt.','common',2,'standard','Công ty','{}',false,'{}',false);