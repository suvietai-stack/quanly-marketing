-- STAGED ONLY. No literal staff DML; wrapper builds an org_change preview only.
CREATE OR REPLACE FUNCTION public.org_legacy_manager_preview(_source uuid,_revision bigint,_role text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$ DECLARE m record;u record;t record;a record;changes_ jsonb;at_ timestamptz:=now();BEGIN
 IF NOT private.is_active(auth.uid()) OR NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin chuyển nguồn quản lý.' USING ERRCODE='42501';END IF;
 SELECT * INTO m FROM biz_management_assignments WHERE id=_source;
 IF m.id IS NULL OR m.ended_at IS NOT NULL OR m.started_at>=at_ THEN RAISE EXCEPTION 'Nguồn quản lý không còn hiệu lực.';END IF;
 SELECT * INTO u FROM org_units WHERE source=CASE m.position WHEN 'director' THEN 'biz_systems' WHEN 'team_lead' THEN 'biz_teams' ELSE 'biz_departments' END AND source_id=coalesce(m.team_id,m.department_id,m.system_id)::text AND active;
 SELECT ot.* INTO t FROM org_titles ot JOIN biz_positions p ON p.id::text=ot.source_id WHERE ot.source='biz_positions' AND p.code=m.position AND ot.active;
 IF u.id IS NULL OR t.id IS NULL THEN RAISE EXCEPTION 'Thiếu mapping đơn vị/chức danh.';END IF;
 SELECT * INTO a FROM org_assignments WHERE source='biz_management_assignments' AND source_id=_source::text AND user_id=m.user_id AND unit_id=u.id AND category='legacy_manager' AND ends_at IS NULL;
 IF a.id IS NULL THEN RAISE EXCEPTION 'Projection nguồn cũ không khớp.';END IF;
 IF NOT EXISTS(SELECT 1 FROM app_roles WHERE id=_role AND role_kind='position' AND catalog_generation>=2 AND catalog_state='standard' AND NOT is_system) THEN RAISE EXCEPTION 'Role vị trí V2 không hợp lệ.';END IF;
 IF EXISTS(SELECT 1 FROM org_position_roles WHERE unit_id=u.id AND title_id=t.id AND role_id<>_role) THEN RAISE EXCEPTION 'Mapping đã khác; không ghi đè.';END IF;
 changes_:=jsonb_build_array(jsonb_build_object('action','end','data',jsonb_build_object('id',a.id,'ends_at',at_)));
 IF NOT EXISTS(SELECT 1 FROM org_position_roles WHERE unit_id=u.id AND title_id=t.id AND role_id=_role) THEN changes_:=changes_||jsonb_build_array(jsonb_build_object('action','position_role','data',jsonb_build_object('unit_id',u.id,'title_id',t.id,'role_id',_role,'reason','Chuyển nguồn quản lý legacy sang V2')));END IF;
 changes_:=changes_||jsonb_build_array(jsonb_build_object('action','assign','data',jsonb_build_object('unit_id',u.id,'title_id',t.id,'user_id',m.user_id,'kind','concurrent','starts_at',at_)));
 RETURN public.org_change('preview',_revision,changes_);END $function$;
REVOKE ALL ON FUNCTION public.org_legacy_manager_preview(uuid,bigint,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.org_legacy_manager_preview(uuid,bigint,text) TO authenticated,service_role;
