-- Base Showroom stage 1: independent read-only module, scoped by active V2 title
-- assignments. No POS, stock, sales or financial permissions are implied.
BEGIN;
SET LOCAL lock_timeout='8s';
SET LOCAL statement_timeout='80s';

INSERT INTO public.base_permission_catalog(key,label,module,dependencies) VALUES
 ('showroom.view','Xem phân hệ Showroom','Showroom','{}'::text[]),
 ('showroom.view_unit','Xem nhân sự cửa hàng mình phụ trách','Showroom','{}'::text[]),
 ('showroom.view_all','Xem toàn bộ hệ thống Showroom','Showroom','{}'::text[])
ON CONFLICT(key) DO UPDATE SET label=excluded.label,module=excluded.module;

UPDATE public.app_roles SET
 permissions=(SELECT array_agg(DISTINCT p ORDER BY p) FROM unnest(permissions||ARRAY['showroom.view']) p),
 updated_at=now()
WHERE id='role-v2-showroom-staff' AND role_kind='position' AND catalog_generation=2;
UPDATE public.app_roles SET
 permissions=(SELECT array_agg(DISTINCT p ORDER BY p) FROM unnest(permissions||ARRAY['showroom.view','showroom.view_unit']) p),
 updated_at=now()
WHERE id='role-v2-showroom-manager' AND role_kind='position' AND catalog_generation=2;
UPDATE public.app_roles SET
 permissions=(SELECT array_agg(DISTINCT p ORDER BY p) FROM unnest(permissions||ARRAY['showroom.view','showroom.view_all']) p),
 updated_at=now()
WHERE id='role-v2-executive' AND role_kind='position' AND catalog_generation=2;

CREATE OR REPLACE FUNCTION public.showroom_overview_read()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE
  who uuid:=auth.uid();
  can_all boolean;
  can_unit boolean;
  data_ jsonb;
BEGIN
  IF who IS NULL OR NOT private.is_active(who) THEN
    RAISE EXCEPTION 'Cần đăng nhập vào Base.' USING ERRCODE='42501';
  END IF;
  IF NOT (private.is_super_admin(who) OR private.has_permission(who,'showroom.view')) THEN
    RAISE EXCEPTION 'Chưa được cấp quyền xem Showroom.' USING ERRCODE='42501';
  END IF;
  can_all:=private.is_super_admin(who) OR private.has_permission(who,'showroom.view_all');
  can_unit:=can_all OR private.has_permission(who,'showroom.view_unit');

  WITH RECURSIVE tree AS (
    SELECT id,parent_id,kind,name,ARRAY[id] path
    FROM public.org_units WHERE id='showroom-block' AND active
    UNION ALL
    SELECT o.id,o.parent_id,o.kind,o.name,t.path||o.id
    FROM public.org_units o JOIN tree t ON o.parent_id=t.id
    WHERE o.active AND NOT o.id=ANY(t.path)
  ),
  stores AS (
    SELECT t.id,t.name,t.path FROM tree t WHERE t.kind='department'
      AND (can_all OR EXISTS (
        SELECT 1 FROM public.org_assignments a
        WHERE a.unit_id=t.id AND a.user_id=who AND a.status='active'
          AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())
      ))
  ),
  crew AS (
    SELECT DISTINCT a.unit_id AS store_id,a.user_id,p.full_name,t.name AS title_name,
      coalesce(t.kind,'staff') AS title_kind
    FROM public.org_assignments a
    JOIN stores s ON s.id=a.unit_id
    JOIN public.org_titles t ON t.id=a.title_id AND t.active
    JOIN public.profiles p ON p.id=a.user_id
    WHERE a.status='active' AND a.starts_at<=now()
      AND (a.ends_at IS NULL OR a.ends_at>now())
      AND p.status='Đang hoạt động'
  ),
  scoped AS (
    SELECT s.id,s.name,
      (SELECT count(DISTINCT c.user_id) FROM crew c WHERE c.store_id=s.id) AS staff_count,
      (SELECT count(DISTINCT c.user_id) FROM crew c WHERE c.store_id=s.id AND c.title_kind='manager') AS manager_count,
      (SELECT coalesce(jsonb_agg(jsonb_build_object('id',q.user_id,
        'name',q.full_name,'position',q.title_name,'is_manager',q.title_kind='manager')
        ORDER BY q.title_kind DESC,q.full_name),'[]'::jsonb)
       FROM crew q WHERE q.store_id=s.id AND (can_unit OR q.user_id=who)) AS staff
    FROM stores s
  )
  SELECT jsonb_build_object(
    'scope',CASE WHEN can_all THEN 'company' WHEN can_unit THEN 'unit' ELSE 'own' END,
    'stores',coalesce((SELECT jsonb_agg(jsonb_build_object(
       'id',id,'name',CASE WHEN name LIKE 'Showrom %' THEN overlay(name placing 'Showroom' from 1 for 7) ELSE name END,
       'staff_count',staff_count,'manager_count',manager_count,'staff',staff
    ) ORDER BY name) FROM scoped),'[]'::jsonb),
    'store_count',(SELECT count(*) FROM scoped),
    'staff_count',(SELECT count(DISTINCT a.user_id) FROM crew a),
    'server_now',now()
  ) INTO data_;
  RETURN data_;
END;
$fn$;

REVOKE ALL ON FUNCTION public.showroom_overview_read() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.showroom_overview_read() TO authenticated;
COMMIT;
