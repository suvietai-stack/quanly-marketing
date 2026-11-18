-- Stage 7/8: profile-status epoch invalidation and audited affected-staff refresh.
-- Safe to apply before activation; regular access still uses the live evaluator.
-- Presence heartbeat edits must not recompile everybody's roles.
DROP TRIGGER IF EXISTS base_role_cache_profile_status ON public.profiles;
CREATE TRIGGER base_role_cache_profile_status
AFTER UPDATE OF status,is_system_admin ON public.profiles
FOR EACH STATEMENT EXECUTE FUNCTION private.base_role_cache_mark();
DROP TRIGGER IF EXISTS base_role_cache_profile_membership ON public.profiles;
CREATE TRIGGER base_role_cache_profile_membership
AFTER INSERT OR DELETE ON public.profiles
FOR EACH STATEMENT EXECUTE FUNCTION private.base_role_cache_mark();


-- Audited membership-only changes update only affected staff, not all employees.
-- Broader role/structure changes invalidate caches until the user's next login/focus sync.
-- A stale snapshot is NEVER considered authoritative.
CREATE OR REPLACE FUNCTION private.base_role_cache_org_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $body$
DECLARE
  actor_ uuid;
  affected uuid[];
BEGIN
  IF NEW.before_data IS NULL OR NEW.after_data IS NULL
    OR NOT (NEW.before_data ? 'memberships' AND NEW.after_data ? 'memberships')
    OR (NEW.before_data - 'memberships') IS DISTINCT FROM (NEW.after_data - 'memberships') THEN
    RETURN NULL;
  END IF;
  WITH old_members AS (
    SELECT x->>'id' AS member_id,x->>'user_id' AS user_id,x AS payload
    FROM jsonb_array_elements(coalesce(NEW.before_data->'memberships','[]'::jsonb)) x
  ), new_members AS (
    SELECT x->>'id' AS member_id,x->>'user_id' AS user_id,x AS payload
    FROM jsonb_array_elements(coalesce(NEW.after_data->'memberships','[]'::jsonb)) x
  )
  SELECT coalesce(array_agg(DISTINCT user_id::uuid),'{}'::uuid[])
    INTO affected
  FROM (
    SELECT a.user_id FROM old_members a
      FULL OUTER JOIN new_members b USING(member_id)
      WHERE a.payload IS DISTINCT FROM b.payload
    UNION ALL
    SELECT b.user_id FROM old_members a
      FULL OUTER JOIN new_members b USING(member_id)
      WHERE a.payload IS DISTINCT FROM b.payload
  ) delta
  WHERE user_id ~* '^[0-9a-f-]{36}$';

  -- The epoch was invalidated by the canonical org source write before this deferred trigger.
  FOR actor_ IN SELECT unnest(affected) LOOP
    BEGIN
      PERFORM private.base_role_cache_refresh(actor_);
    EXCEPTION WHEN OTHERS THEN
      -- No stale rights can be served: the original source write already bumped epoch.
      UPDATE private.base_role_cache_state SET refresh_error=SQLSTATE WHERE id;
      RAISE WARNING 'Role snapshot refresh deferred; live resolver remains active (%).',SQLSTATE;
    END;
  END LOOP;
  RETURN NULL;
END
$body$;
REVOKE ALL ON FUNCTION private.base_role_cache_org_event() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS base_role_cache_org_event ON public.org_events;
CREATE CONSTRAINT TRIGGER base_role_cache_org_event
AFTER INSERT ON public.org_events DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION private.base_role_cache_org_event();

-- Do not warm every staff member on migration or on every change.
-- The login/access refresh sync RPC warms one actor and read gates always fail closed.
COMMENT ON TABLE private.base_role_effective_cache IS
  'Server-authoritative fast decisions; valid epoch and transition required; clients cannot write.';

