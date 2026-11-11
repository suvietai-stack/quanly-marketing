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
 LOCK TABLE app_roles,user_roles,base_title_role_links,org_assignments,org_position_slots,mkt_specialties,mkt_staff_specialties IN SHARE ROW EXCLUSIVE MODE;
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
  proposal:=coalesce(_proposed,'{}');
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

   IF coalesce(trim(proposal->>'name'),'')='' OR proposal->>'role_kind' NOT IN ('position','marketing_task','system') OR jsonb_typeof(proposal->'permissions') IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Tên, loại và permission Role không hợp lệ.'; END IF;
   IF _action='create' AND proposal->>'role_kind'='system' THEN RAISE EXCEPTION 'Không tạo Role đặc quyền qua kho thông thường.'; END IF;
   IF _action='edit' AND proposal->>'role_kind'<>r.role_kind AND private.role_in_use(id_) THEN RAISE EXCEPTION 'Không đổi loại Role đang sử dụng.'; END IF;
   IF _action='edit' AND r.is_system AND (proposal->>'name'<>r.name OR proposal->>'role_kind'<>r.role_kind OR (id_='role-super-admin' AND proposal->'permissions' IS DISTINCT FROM to_jsonb(r.permissions))) THEN RAISE EXCEPTION 'Không thay đổi Role hệ thống được bảo vệ.'; END IF;
   IF EXISTS(SELECT 1 FROM jsonb_array_elements_text(proposal->'permissions') k WHERE NOT EXISTS(SELECT 1 FROM base_permission_catalog b WHERE b.key=k) AND NOT (_action='edit' AND k=ANY(r.permissions))) THEN RAISE EXCEPTION 'Permission chưa có trong danh mục backend.'; END IF;
   IF EXISTS(SELECT 1 FROM app_roles ar WHERE ar.id<>id_ AND ar.catalog_state='standard' AND ar.catalog_generation=gen_ AND lower(trim(ar.name))=lower(trim(proposal->>'name'))) THEN RAISE EXCEPTION 'Tên Role đã tồn tại.'; END IF;
  END IF;
  affected_:=(SELECT coalesce(jsonb_agg(DISTINCT user_id),'[]') FROM private.role_source_rows(private.base_config()) WHERE role_id=id_);
  INSERT INTO private.role_catalog_previews(actor_id,action,role_id,proposed,before_data,baseline) VALUES(auth.uid(),_action,id_,proposal,before_,private.role_catalog_fingerprint()) RETURNING * INTO p;
  RETURN jsonb_build_object('id',p.id,'action',_action,'role_id',id_,'before',before_,'after',proposal,'affected_users',affected_,'references',private.role_references(id_),'added',(SELECT coalesce(jsonb_agg(k),'[]') FROM jsonb_array_elements_text(coalesce(proposal->'permissions','[]')) k WHERE NOT k=ANY(coalesce(r.permissions,'{}'))),'removed',(SELECT coalesce(jsonb_agg(k),'[]') FROM unnest(coalesce(r.permissions,'{}')) k WHERE NOT coalesce(proposal->'permissions','[]') ? k),'expires_at',p.expires_at);
 ELSIF _phase='apply' THEN
  SELECT * INTO p FROM private.role_catalog_previews WHERE id=_preview AND actor_id=auth.uid() FOR UPDATE;
  IF p.id IS NULL OR p.applied_at IS NOT NULL OR p.expires_at<=clock_timestamp() OR p.baseline<>private.role_catalog_fingerprint() THEN RAISE EXCEPTION 'Xem trước hết hạn hoặc nguồn đã thay đổi.'; END IF;
  IF _confirmation IS DISTINCT FROM 'ÁP DỤNG ROLE' OR coalesce(trim(_reason),'')='' THEN RAISE EXCEPTION 'Cần xác nhận ÁP DỤNG ROLE và lý do.'; END IF;
  PERFORM set_config('app.role_reason',trim(_reason),true); proposal:=p.proposed;
  IF p.action='create' THEN
   IF coalesce((proposal->>'catalog_generation')::smallint,1)>=2 THEN PERFORM set_config('app.role_v2_validated',p.role_id,true); END IF;
   INSERT INTO app_roles(id,name,description,permissions,is_system,catalog_state,catalog_group,role_kind,role_code,signal_scope_all,signal_scope,catalog_generation) VALUES(p.role_id,trim(proposal->>'name'),coalesce(proposal->>'description',''),ARRAY(SELECT DISTINCT jsonb_array_elements_text(proposal->'permissions')),false,'standard',CASE WHEN proposal->>'role_kind'='marketing_task' THEN 'Nhiệm vụ Marketing' ELSE coalesce(proposal->>'catalog_group','Vận hành') END,proposal->>'role_kind',p.role_id,coalesce((proposal->>'signal_scope_all')::boolean,false),ARRAY(SELECT jsonb_array_elements_text(coalesce(proposal->'signal_scope','[]'))),coalesce((proposal->>'catalog_generation')::smallint,1));
  ELSIF p.action='edit' THEN
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
