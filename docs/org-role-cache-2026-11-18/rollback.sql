-- Controlled rollback of 0463, preserving org assignments, roles, audit and customers.
-- Run as database owner only after a privilege/parity review.
BEGIN;
DO $body$
DECLARE source text;
BEGIN
  FOREACH source IN ARRAY ARRAY[
    'public.org_assignments','public.org_units','public.org_titles',
    'public.org_position_roles','public.org_position_slots',
    'public.app_roles','public.user_roles','public.user_permission_overrides',
    'public.base_org_state','public.base_title_role_links',
    'public.mkt_specialties','public.mkt_staff_specialties',
    'public.biz_appointments','public.biz_department_members','public.biz_management_assignments',
    'public.biz_team_members','public.biz_member_affiliations',
    'public.biz_positions','public.biz_departments','public.biz_systems',
    'private.legacy_reset_accounts'
  ] LOOP
    IF to_regclass(source) IS NOT NULL THEN
      EXECUTE format('DROP TRIGGER IF EXISTS base_role_cache_mark ON %s',source);
    END IF;
  END LOOP;
END
$body$;
DROP TRIGGER IF EXISTS base_role_cache_profile_status ON public.profiles;
DROP TRIGGER IF EXISTS base_role_cache_profile_membership ON public.profiles;
DROP TRIGGER IF EXISTS base_role_cache_org_event ON public.org_events;
DROP TRIGGER IF EXISTS base_role_cache_flush ON private.base_role_cache_queue;

-- Restore unchanged original decision rules (not a new authorization model).
CREATE OR REPLACE FUNCTION private.base_tier1(u uuid,p text)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $body$
 SELECT CASE WHEN private.base_supported(p)
 THEN private.base_decision(u,p,private.base_config()) ELSE 'NOT_CONFIGURED' END
$body$;
REVOKE ALL ON FUNCTION private.base_tier1(uuid,text) FROM PUBLIC,anon,authenticated;

-- Restore the prior chart contract and expression structure.
CREATE OR REPLACE FUNCTION public.base_org_chart_read()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $body$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND status='Đang hoạt động') THEN
  RAISE EXCEPTION 'Chỉ nhân sự đang hoạt động được xem sơ đồ tổ chức.';
 END IF;
 RETURN jsonb_build_object(
  'server_now',now(),
  'units',coalesce((SELECT jsonb_agg(u) FROM jsonb_array_elements(private.base_config()->'units') u),'[]'::jsonb),
  'titles',coalesce((SELECT jsonb_agg(t) FROM jsonb_array_elements(private.base_config()->'titles') t),'[]'::jsonb),
  'members',coalesce((SELECT jsonb_agg(jsonb_build_object(
   'user_id',p.id,'name',p.full_name,'unit_id',m->>'unit_id','title_id',m->>'title_id',
   'duties',m->>'duties','active',coalesce((m->>'active')::boolean,false),
   'starts_at',m->>'starts_at','ends_at',m->>'ends_at'
  )) FROM jsonb_array_elements(private.base_config()->'memberships') m
  JOIN profiles p ON p.id::text=m->>'user_id'),'[]'::jsonb)
 );
END
$body$;
DROP FUNCTION IF EXISTS public.base_role_cache_sync_users(uuid[]);
DROP FUNCTION IF EXISTS public.base_role_cache_sync();
DROP FUNCTION IF EXISTS private.base_role_cache_org_event();
DROP FUNCTION IF EXISTS private.base_role_cache_flush();
DROP FUNCTION IF EXISTS private.base_role_cache_mark();
DROP FUNCTION IF EXISTS private.base_role_cache_refresh(uuid);
DROP FUNCTION IF EXISTS private.base_tier1_uncached(uuid,text);
DROP TABLE IF EXISTS private.base_role_cache_queue;
DROP TABLE IF EXISTS private.base_role_effective_cache;
DROP TABLE IF EXISTS private.base_role_cache_state;
COMMIT;
