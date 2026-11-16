-- Showroom A2: the legacy biz_* records stay for audit only after moving the
-- existing retail subtree to a canonical Showroom block.
-- Never delete or rewrite historical biz documents, approvals or employee IDs.
BEGIN;
SET LOCAL lock_timeout='8s';
SET LOCAL statement_timeout='90s';

CREATE OR REPLACE FUNCTION private.biz_owned_system(_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_units u
    WHERE u.id=_id::text AND u.kind='system' AND u.parent_id='biz-block' AND u.active
  )
$$;
REVOKE ALL ON FUNCTION private.biz_owned_system(uuid) FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION private.biz_owned_department(_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.biz_departments d
    WHERE d.id=_id AND d.system_id IS NOT NULL AND private.biz_owned_system(d.system_id)
  )
$$;
REVOKE ALL ON FUNCTION private.biz_owned_department(uuid) FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION private.biz_legacy_target_is_showroom(_action text,_data jsonb)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT (
    (nullif(_data->>'system_id','') IS NOT NULL AND private.org_contains('showroom-block',_data->>'system_id'))
    OR (nullif(_data->>'department_id','') IS NOT NULL AND private.org_contains('showroom-block',_data->>'department_id'))
    OR (nullif(_data->>'team_id','') IS NOT NULL AND private.org_contains('showroom-block',_data->>'team_id'))
    OR (_action='system' AND nullif(_data->>'id','') IS NOT NULL AND private.org_contains('showroom-block',_data->>'id'))
    OR (_action='department' AND nullif(_data->>'id','') IS NOT NULL AND private.org_contains('showroom-block',_data->>'id'))
    OR (_action='team' AND nullif(_data->>'id','') IS NOT NULL AND private.org_contains('showroom-block',_data->>'id'))
  )
$$;
REVOKE ALL ON FUNCTION private.biz_legacy_target_is_showroom(text,jsonb) FROM PUBLIC,anon,authenticated;

-- Keep the existing business authorization checks. Only include business-owned
-- systems in its organization manager, never the separated retail subtree.
CREATE OR REPLACE FUNCTION public.biz_org_read()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Cần đăng nhập.'; END IF;
 IF NOT public.biz_org_can_manage() AND NOT public.biz_can(auth.uid(),'biz.workflow_manage') THEN
   RAISE EXCEPTION 'Không có quyền xem cài đặt cơ cấu.';
 END IF;
 RETURN jsonb_build_object(
   'systems',(SELECT coalesce(jsonb_agg(to_jsonb(s) ORDER BY created_at),'[]') FROM public.biz_systems s WHERE private.biz_owned_system(s.id)),
   'departments',(SELECT coalesce(jsonb_agg(to_jsonb(d) ORDER BY sort_order,name),'[]') FROM public.biz_departments d WHERE private.biz_owned_department(d.id)),
   'teams',(SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY name),'[]') FROM public.biz_teams t WHERE private.biz_owned_department(t.department_id)),
   'members',(
     (SELECT coalesce(jsonb_agg(to_jsonb(m)),'[]') FROM public.biz_department_members m WHERE private.biz_owned_department(m.department_id))
     ||(SELECT coalesce(jsonb_agg(to_jsonb(a)||jsonb_build_object('is_manager',false,'concurrent',true)),'[]') FROM public.biz_member_affiliations a WHERE private.biz_owned_department(a.department_id))
   ),
   'team_members',(
     (SELECT coalesce(jsonb_agg(to_jsonb(m)),'[]') FROM public.biz_team_members m
       JOIN public.biz_teams t ON t.id=m.team_id WHERE private.biz_owned_department(t.department_id))
     ||(SELECT coalesce(jsonb_agg(to_jsonb(a)||jsonb_build_object('concurrent',true)),'[]') FROM public.biz_member_affiliations a WHERE a.team_id IS NOT NULL AND private.biz_owned_department(a.department_id))
   ),
   'managers',(SELECT coalesce(jsonb_agg(to_jsonb(a)),'[]') FROM public.biz_management_assignments a
     WHERE (a.system_id IS NOT NULL AND private.biz_owned_system(a.system_id))
        OR (a.department_id IS NOT NULL AND private.biz_owned_department(a.department_id))
        OR (a.team_id IS NOT NULL AND EXISTS(
          SELECT 1 FROM public.biz_teams t WHERE t.id=a.team_id AND private.biz_owned_department(t.department_id)))),
   'events',(SELECT coalesce(jsonb_agg(to_jsonb(e) ORDER BY created_at DESC),'[]')
       FROM (SELECT * FROM public.biz_org_events ORDER BY created_at DESC LIMIT 200) e)
 );
END
$$;

CREATE OR REPLACE FUNCTION public.biz_dashboard_systems()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT CASE WHEN auth.uid() IS NOT NULL AND (public.is_super_admin(auth.uid()) OR public.biz_all_scope(auth.uid()))
 THEN coalesce((
   SELECT jsonb_agg(jsonb_build_object('id',s.id,'name',s.name)
    ORDER BY (SELECT count(*) FROM public.biz_departments d WHERE d.system_id=s.id AND d.active) DESC,s.created_at,s.name)
   FROM public.biz_systems s WHERE s.active AND private.biz_owned_system(s.id)
 ),'[]'::jsonb) ELSE '[]'::jsonb END
$$;

DO $fence$
DECLARE def text;
BEGIN
  SELECT pg_get_functiondef('public.biz_org_save(text,jsonb)'::regprocedure) INTO def;
  IF position('private.biz_legacy_target_is_showroom(' in def)=0 THEN
    IF position('IF NOT public.biz_org_can_manage() THEN' in def)=0 THEN RAISE EXCEPTION 'Business organization writer changed; review the fence.'; END IF;
    def:=replace(def,
      'IF NOT public.biz_org_can_manage() THEN',
      'IF private.biz_legacy_target_is_showroom(_action,_data) THEN RAISE EXCEPTION ''Hệ Showroom đã tách khỏi Khối Kinh doanh; dùng Cơ cấu tổ chức để chỉnh sửa.'' USING ERRCODE=''42501''; END IF; IF NOT public.biz_org_can_manage() THEN');
    EXECUTE def;
  END IF;

  SELECT pg_get_functiondef('public.biz_appointment_guard()'::regprocedure) INTO def;
  IF position('Showroom là đơn vị bán lẻ độc lập' in def)=0 THEN
    IF position('IF TG_OP=''DELETE'' THEN' in def)=0 THEN RAISE EXCEPTION 'Business appointment guard changed; review before patching.'; END IF;
    def:=replace(def,
      'IF TG_OP=''DELETE'' THEN',
      'IF TG_OP=''INSERT'' AND ((NEW.system_id IS NOT NULL AND private.org_contains(''showroom-block'',NEW.system_id::text)) OR (NEW.department_id IS NOT NULL AND private.org_contains(''showroom-block'',NEW.department_id::text)) OR (NEW.team_id IS NOT NULL AND private.org_contains(''showroom-block'',NEW.team_id::text))) THEN RAISE EXCEPTION ''Showroom là đơn vị bán lẻ độc lập, không tạo bổ nhiệm Kinh doanh mới.'' USING ERRCODE=''42501''; END IF; IF TG_OP=''DELETE'' THEN');
    EXECUTE def;
  END IF;
END
$fence$;

COMMIT;
