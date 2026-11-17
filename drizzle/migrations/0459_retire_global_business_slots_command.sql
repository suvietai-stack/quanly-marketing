-- Extend the already audited org_change preview/apply workflow to retire
-- obsolete individually-bound slots. It can only target global biz_positions
-- with no current or future appointments. Slots remain as historical rows.
CREATE TABLE IF NOT EXISTS private.retired_legacy_org_slots_20261117 (
 slot_id text PRIMARY KEY,
 prior_data jsonb NOT NULL,
 actor_id uuid NOT NULL,
 retired_at timestamptz NOT NULL DEFAULT now()
);
CREATE OR REPLACE FUNCTION private.org_commands_v2(changes_ jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 #variable_conflict use_column
 DECLARE x jsonb;v jsonb;r jsonb;n int;before_ jsonb;after_ jsonb;src text;result_ jsonb:='[]';BEGIN
 IF jsonb_typeof(changes_) IS DISTINCT FROM 'array' OR jsonb_array_length(changes_) NOT BETWEEN 1 AND 500 THEN RAISE EXCEPTION 'Danh sách thay đổi không hợp lệ.';END IF;
 FOR x IN SELECT value FROM jsonb_array_elements(changes_) LOOP v:=x->'data';
 IF x->>'action'='roles' AND (jsonb_typeof(v->'roles') IS DISTINCT FROM 'array' OR jsonb_array_length(v->'roles')<>1 OR EXISTS(SELECT 1 FROM jsonb_array_elements(v->'roles') l LEFT JOIN app_roles r ON r.id=l->>'role_id' WHERE r.id IS NULL OR r.role_kind<>'position' OR r.catalog_state<>'standard' OR r.id IN ('role-admin','role-super-admin'))) THEN RAISE EXCEPTION 'Chức danh chỉ liên kết đúng một Role vị trí chuẩn.'; END IF;
 IF x->>'action'='retire_legacy_slot' THEN
  IF NOT private.org_execution_ok() OR NOT private.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Chỉ Super Admin được kết thúc ô vị trí cũ qua xem trước.' USING ERRCODE='42501';
  END IF;
  SELECT to_jsonb(s) INTO before_
  FROM public.org_position_slots s
  JOIN public.org_titles t ON t.id=s.title_id
  WHERE s.id=v->>'id' AND t.source='biz_positions' AND t.unit_id IS NULL
    AND s.active
  FOR UPDATE OF s;
  IF before_ IS NULL THEN
    RAISE EXCEPTION 'Ô vị trí cũ không tồn tại hoặc đã kết thúc: %',v->>'id';
  END IF;
  IF EXISTS(
    SELECT 1 FROM public.org_assignments a
    WHERE (a.slot_id=v->>'id' OR (
      a.title_id=before_->>'title_id' AND a.unit_id=before_->>'unit_id'
      AND a.source='biz_appointments'))
      AND a.status<>'cancelled'
      AND (a.ends_at IS NULL OR a.ends_at>clock_timestamp())
  ) THEN
    RAISE EXCEPTION 'Ô còn bổ nhiệm có hiệu lực hoặc tương lai; không thể ngừng.';
  END IF;
  INSERT INTO private.retired_legacy_org_slots_20261117(slot_id,prior_data,actor_id)
  VALUES (v->>'id',before_,auth.uid())
  ON CONFLICT (slot_id) DO NOTHING;
  UPDATE public.org_position_slots
    SET active=false,revision=revision+1
    WHERE id=v->>'id' AND active;
  result_:=result_||jsonb_build_array(before_->>'unit_id');
  CONTINUE;
 END IF;
 IF x->>'action'='position_role' THEN
  IF NOT private.org_execution_ok() OR NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin gắn Role cho vị trí qua xem trước.' USING ERRCODE='42501'; END IF;
  IF NOT EXISTS(SELECT 1 FROM org_units WHERE id=v->>'unit_id' AND active) OR NOT EXISTS(SELECT 1 FROM org_titles WHERE id=v->>'title_id' AND active) THEN RAISE EXCEPTION 'Đơn vị hoặc chức danh không hợp lệ.'; END IF;
  IF nullif(v->>'role_id','') IS NOT NULL AND NOT EXISTS(SELECT 1 FROM app_roles WHERE id=v->>'role_id' AND role_kind='position' AND catalog_state='standard' AND NOT is_system AND catalog_generation>=2) THEN RAISE EXCEPTION 'Vị trí chỉ nhận Role chuẩn mới.'; END IF;
  SELECT role_id INTO src FROM org_position_roles WHERE unit_id=v->>'unit_id' AND title_id=v->>'title_id' FOR UPDATE;
  IF nullif(v->>'role_id','') IS NULL THEN DELETE FROM org_position_roles WHERE unit_id=v->>'unit_id' AND title_id=v->>'title_id';
  ELSE INSERT INTO org_position_roles(unit_id,title_id,role_id,updated_by) VALUES(v->>'unit_id',v->>'title_id',v->>'role_id',auth.uid())
   ON CONFLICT(unit_id,title_id) DO UPDATE SET role_id=excluded.role_id,revision=org_position_roles.revision+1,updated_at=now(),updated_by=auth.uid(); END IF;
  INSERT INTO org_position_role_events(unit_id,title_id,before_role,after_role,actor_id,reason) VALUES(v->>'unit_id',v->>'title_id',src,nullif(v->>'role_id',''),auth.uid(),coalesce(v->>'reason','Gắn Role cho vị trí'));
  result_:=result_||jsonb_build_array(v->>'unit_id'); CONTINUE;
 END IF;
 IF x->>'action'<>'roles' THEN result_:=result_||private.org_commands(jsonb_build_array(x));CONTINUE;END IF;
 v:=x->'data';IF NOT private.org_execution_ok() OR NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin được liên kết Role qua xem trước.';END IF;
 SELECT source INTO src FROM org_titles WHERE id=v->>'id' AND active;IF NOT FOUND OR src='biz_positions' THEN RAISE EXCEPTION 'Giữ nguyên chức vụ và quyền Kinh doanh; chức vụ phải đang hoạt động.';END IF;
 IF jsonb_typeof(v->'roles') IS DISTINCT FROM 'array' OR jsonb_array_length(v->'roles')>20 THEN RAISE EXCEPTION 'Danh sách Role không hợp lệ.';END IF;
 SELECT count(*) INTO n FROM jsonb_array_elements(v->'roles') r WHERE coalesce((r->>'is_primary')::boolean,false);
 IF (jsonb_array_length(v->'roles')>0 AND n<>1) OR EXISTS(SELECT 1 FROM jsonb_array_elements(v->'roles') r GROUP BY r->>'role_id' HAVING count(*)>1) THEN RAISE EXCEPTION 'Chọn đúng một Role chính, không trùng Role.';END IF;
 FOR r IN SELECT value FROM jsonb_array_elements(v->'roles') LOOP
 IF r->>'role_id' IN ('role-admin','role-super-admin') OR NOT EXISTS(SELECT 1 FROM app_roles WHERE id=r->>'role_id') OR coalesce((r->>'active')::boolean,false) OR coalesce(r->>'scope_kind','unit') NOT IN ('own','unit') THEN RAISE EXCEPTION 'Role quản trị hoặc Role không hợp lệ.';END IF;
 IF jsonb_typeof(coalesce(r->'enabled_permissions','[]')) IS DISTINCT FROM 'array' OR EXISTS(SELECT 1 FROM jsonb_array_elements_text(coalesce(r->'enabled_permissions','[]')) p WHERE NOT private.org_role_permission_ready(p) OR NOT EXISTS(SELECT 1 FROM app_roles a WHERE a.id=r->>'role_id' AND p=ANY(a.permissions))) THEN RAISE EXCEPTION 'Chức năng chưa được kiểm chứng an toàn hoặc không thuộc Role.';END IF;
 IF jsonb_array_length(coalesce(r->'enabled_permissions','[]'))>0 AND r->>'scope_kind' IS DISTINCT FROM 'own' THEN RAISE EXCEPTION 'Chưa kiểm chứng quyền quản lý theo đơn vị; chỉ bật chức năng cá nhân.';END IF;
 END LOOP;
 SELECT coalesce(jsonb_agg(to_jsonb(l) ORDER BY role_id),'[]') INTO before_ FROM base_title_role_links l WHERE title_source='base' AND title_id=v->>'id';
 DELETE FROM base_title_role_links WHERE title_source='base' AND title_id=v->>'id';
 INSERT INTO base_title_role_links(title_source,title_id,role_id,is_primary,scope_kind,active,reason,updated_by,enabled_permissions,permission_signature)
 SELECT 'base',v->>'id',r->>'role_id',coalesce((r->>'is_primary')::boolean,false),coalesce(r->>'scope_kind','unit'),false,coalesce(v->>'reason','Liên kết Role'),auth.uid(),ARRAY(SELECT DISTINCT jsonb_array_elements_text(coalesce(r->'enabled_permissions','[]'))),md5(coalesce(a.permissions,'{}')::text)
 FROM jsonb_array_elements(v->'roles') r JOIN app_roles a ON a.id=r->>'role_id';
 SELECT coalesce(jsonb_agg(to_jsonb(l) ORDER BY role_id),'[]') INTO after_ FROM base_title_role_links l WHERE title_source='base' AND title_id=v->>'id';
 INSERT INTO base_title_role_events(actor_id,title_source,title_id,reason,before_data,after_data) VALUES(auth.uid(),'base',v->>'id',coalesce(v->>'reason','Liên kết Role'),before_,after_);result_:=result_||jsonb_build_array('org-company');
 END LOOP;RETURN result_;END $function$
;
