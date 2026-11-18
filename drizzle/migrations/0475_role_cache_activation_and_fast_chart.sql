-- Final stage 8/8: switch to epoch-validated snapshots only after all source invalidators exist.
-- Do not activate the cache with missing invalidators; that could create stale permissions.
DO $safety$
DECLARE source text;
BEGIN
  FOREACH source IN ARRAY ARRAY['public.org_assignments','public.org_units','public.org_titles','public.org_position_roles','public.org_position_slots','public.app_roles','public.user_roles','public.user_permission_overrides','public.base_org_state','public.base_title_role_links','public.mkt_specialties','public.mkt_staff_specialties','public.biz_appointments','public.biz_department_members','public.biz_management_assignments','public.biz_team_members','public.biz_member_affiliations','public.biz_positions','public.biz_departments','public.biz_systems','private.legacy_reset_accounts']
  LOOP
    IF to_regclass(source) IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM pg_trigger
      WHERE tgrelid=to_regclass(source) AND tgname='base_role_cache_mark' AND NOT tgisinternal
    ) THEN RAISE EXCEPTION 'Cannot activate Role cache; missing invalidation trigger for %',source; END IF;
  END LOOP;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid='public.profiles'::regclass AND tgname='base_role_cache_profile_status')
  OR NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid='public.profiles'::regclass AND tgname='base_role_cache_profile_membership')
  OR NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid='public.org_events'::regclass AND tgname='base_role_cache_org_event')
  THEN RAISE EXCEPTION 'Cannot activate Role cache; missing profile/audit invalidator'; END IF;
END $safety$;
-- Invalidate any snapshots created while only some source triggers were installed.
UPDATE private.base_role_cache_state SET epoch=epoch+1 WHERE id=true;

CREATE OR REPLACE FUNCTION private.base_tier1(u uuid,p text)
RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $body$
DECLARE result_ text;
BEGIN
  -- Read the current support policy even when the cached role decision is fresh.
  IF NOT private.base_supported(p) THEN RETURN 'NOT_CONFIGURED'; END IF;
  SELECT c.decisions->>p INTO result_
  FROM private.base_role_effective_cache c
  JOIN private.base_role_cache_state s ON s.id=true AND s.epoch=c.epoch
  WHERE c.user_id=u AND (c.valid_until IS NULL OR now()<c.valid_until);
  IF FOUND THEN RETURN coalesce(result_,'NOT_CONFIGURED'); END IF;
  RETURN private.base_tier1_uncached(u,p);
END
$body$;
-- Match the previous function's privileges. RPCs use it internally; no new public endpoint.
REVOKE ALL ON FUNCTION private.base_tier1(uuid,text) FROM PUBLIC,anon,authenticated;


-- Chart-only read optimization: the old implementation rebuilt private.base_config()
-- three times per request. Compute once and return the same names/keys/active flags.
CREATE OR REPLACE FUNCTION public.base_org_chart_read()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $body$
DECLARE config_ jsonb;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND status='Đang hoạt động') THEN
    RAISE EXCEPTION 'Chỉ nhân sự đang hoạt động được xem sơ đồ tổ chức.';
  END IF;
  config_ := private.base_config();
  RETURN jsonb_build_object(
    'server_now', now(),
    'units', coalesce(config_->'units','[]'::jsonb),
    'titles', coalesce(config_->'titles','[]'::jsonb),
    'members', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'user_id',p.id,'name',p.full_name,'unit_id',m->>'unit_id',
        'title_id',m->>'title_id','duties',m->>'duties',
        'active',coalesce((m->>'active')::boolean,false),
        'starts_at',m->>'starts_at','ends_at',m->>'ends_at'
      ) ORDER BY sequence_)
      FROM jsonb_array_elements(coalesce(config_->'memberships','[]'::jsonb))
           WITH ORDINALITY AS memberships(m,sequence_)
      JOIN public.profiles p ON p.id::text=m->>'user_id'
    ),'[]'::jsonb)
  );
END
$body$;

-- Optional post-save warm-up for the server-previewed receivers of a Role edit.
-- Restrict to existing organization administrators; never accept a client-produced allowlist as an authorization grant.
CREATE OR REPLACE FUNCTION public.base_role_cache_sync_users(_users uuid[])
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $body$
DECLARE uid uuid; n integer:=0;
BEGIN
  IF auth.uid() IS NULL OR NOT private.is_active(auth.uid()) OR NOT private.base_org_admin() THEN
    RAISE EXCEPTION 'Không có quyền đồng bộ Role người khác.' USING ERRCODE='42501';
  END IF;
  IF coalesce(cardinality(_users),0)>100 THEN
    RAISE EXCEPTION 'Danh sách đồng bộ vượt giới hạn.' USING ERRCODE='22023';
  END IF;
  FOR uid IN SELECT DISTINCT x FROM unnest(coalesce(_users,'{}'::uuid[])) AS x LOOP
    BEGIN
      PERFORM private.base_role_cache_refresh(uid);
      n:=n+1;
    EXCEPTION WHEN OTHERS THEN
      UPDATE private.base_role_cache_state SET refresh_error=SQLSTATE WHERE id;
      RAISE WARNING 'Affected Role snapshot not refreshed; live fallback stays active (%).',SQLSTATE;
    END;
  END LOOP;
  RETURN n;
END
$body$;
REVOKE ALL ON FUNCTION public.base_role_cache_sync_users(uuid[]) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.base_role_cache_sync_users(uuid[]) TO authenticated;
