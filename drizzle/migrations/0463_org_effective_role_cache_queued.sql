-- Materialize exact DENY > ALLOW > NOT_CONFIGURED decisions at the time a role/source changes.
-- SECURITY: no direct client grants; each runtime check is server-side and checks current cache epoch.
-- Missing, invalid or expired snapshots use the previous live evaluator (never trust stale rights).
CREATE TABLE IF NOT EXISTS private.base_role_cache_state (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  epoch bigint NOT NULL DEFAULT 1,
  refreshed_at timestamptz,
  refresh_error text
);
INSERT INTO private.base_role_cache_state (id) VALUES (true) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS private.base_role_effective_cache (
  user_id uuid PRIMARY KEY,
  epoch bigint NOT NULL,
  decisions jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(decisions)='object'),
  computed_at timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz
);
CREATE TABLE IF NOT EXISTS private.base_role_cache_queue (
  transaction_id bigint PRIMARY KEY
);
REVOKE ALL ON private.base_role_cache_state, private.base_role_effective_cache, private.base_role_cache_queue FROM PUBLIC, anon, authenticated;

-- Keep the old exact resolver as a safety fallback for absent/dirty/time-transition cache.
CREATE OR REPLACE FUNCTION private.base_tier1_uncached(u uuid,p text)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $body$
  SELECT CASE WHEN private.base_supported(p)
    THEN private.base_decision(u,p,private.base_config())
    ELSE 'NOT_CONFIGURED' END
$body$;
REVOKE ALL ON FUNCTION private.base_tier1_uncached(uuid,text) FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION private.base_role_cache_refresh(_user uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $body$
DECLARE
  snapshot jsonb;
  next_change timestamptz;
  new_epoch bigint;
  matches jsonb;
  results jsonb;
BEGIN
  IF _user IS NULL OR NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=_user) THEN RETURN; END IF;
  SELECT epoch INTO STRICT new_epoch FROM private.base_role_cache_state WHERE id;
  snapshot := private.base_config();
  next_change := private.base_next_transition(snapshot);
  matches := private.base_rules(_user,snapshot);
  SELECT coalesce(jsonb_object_agg(permission,decision),'{}'::jsonb)
    INTO results
  FROM (
    SELECT x->>'permission' AS permission,
      CASE WHEN bool_or(x->>'effect'='DENY') THEN 'DENY'
        WHEN bool_or(x->>'effect'='ALLOW') THEN 'ALLOW'
        ELSE 'NOT_CONFIGURED' END AS decision
    FROM jsonb_array_elements(coalesce(matches,'[]'::jsonb)) AS r(x)
    WHERE nullif(x->>'permission','') IS NOT NULL
    GROUP BY x->>'permission'
  ) checked;
  INSERT INTO private.base_role_effective_cache(user_id,epoch,decisions,computed_at,valid_until)
  VALUES(_user,new_epoch,results,now(),next_change)
  ON CONFLICT(user_id) DO UPDATE SET
    epoch=excluded.epoch,
    decisions=excluded.decisions,
    computed_at=excluded.computed_at,
    valid_until=excluded.valid_until;
  UPDATE private.base_role_cache_state SET refreshed_at=now(),refresh_error=NULL WHERE id;
END
$body$;
REVOKE ALL ON FUNCTION private.base_role_cache_refresh(uuid) FROM PUBLIC,anon,authenticated;

-- Self-only synchronizer, invoked at login/access refresh and not for every task.
CREATE OR REPLACE FUNCTION public.base_role_cache_sync()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $body$
DECLARE actor_ uuid:=auth.uid(); valid_ boolean;
BEGIN
  IF actor_ IS NULL OR NOT private.is_active(actor_) THEN
    RAISE EXCEPTION 'Không có quyền đồng bộ phân quyền.' USING ERRCODE='42501';
  END IF;
  SELECT EXISTS(
    SELECT 1 FROM private.base_role_effective_cache c
    JOIN private.base_role_cache_state s ON s.id=true AND s.epoch=c.epoch
    WHERE c.user_id=actor_ AND (c.valid_until IS NULL OR now()<c.valid_until)
  ) INTO valid_;
  IF NOT valid_ THEN PERFORM private.base_role_cache_refresh(actor_); END IF;
  RETURN jsonb_build_object('ready',true,'updated',NOT valid_);
END
$body$;
REVOKE ALL ON FUNCTION public.base_role_cache_sync() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.base_role_cache_sync() TO authenticated;

-- Queue only once per SQL transaction even if org_change updates many source tables.
-- The epoch changes in the same transaction; stale snapshots can never be reused after commit.
CREATE OR REPLACE FUNCTION private.base_role_cache_mark()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $body$
BEGIN
  INSERT INTO private.base_role_cache_queue(transaction_id)
  VALUES(txid_current()) ON CONFLICT(transaction_id) DO NOTHING;
  IF FOUND THEN
    UPDATE private.base_role_cache_state SET epoch=epoch+1,refresh_error=NULL WHERE id;
  END IF;
  RETURN NULL;
END
$body$;
REVOKE ALL ON FUNCTION private.base_role_cache_mark() FROM PUBLIC,anon,authenticated;

-- Flush the per-transaction dirty marker; never rebuild every user's cache in an org write.
CREATE OR REPLACE FUNCTION private.base_role_cache_flush()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $body$
BEGIN
  DELETE FROM private.base_role_cache_queue WHERE transaction_id=NEW.transaction_id;
  RETURN NULL;
END
$body$;
REVOKE ALL ON FUNCTION private.base_role_cache_flush() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS base_role_cache_flush ON private.base_role_cache_queue;
CREATE CONSTRAINT TRIGGER base_role_cache_flush
AFTER INSERT ON private.base_role_cache_queue
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION private.base_role_cache_flush();

-- Only tables which can change permission sources; never attach to task/customer/order writes.
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
      EXECUTE format('CREATE TRIGGER base_role_cache_mark AFTER INSERT OR UPDATE OR DELETE ON %s FOR EACH STATEMENT EXECUTE FUNCTION private.base_role_cache_mark()',source);
    END IF;
  END LOOP;
END
$body$;

-- Presence heartbeat edits must not recompile everybody's roles.
DROP TRIGGER IF EXISTS base_role_cache_profile_status ON public.profiles;
CREATE TRIGGER base_role_cache_profile_status
AFTER UPDATE OF status,is_system_admin ON public.profiles
FOR EACH STATEMENT EXECUTE FUNCTION private.base_role_cache_mark();
DROP TRIGGER IF EXISTS base_role_cache_profile_membership ON public.profiles;
CREATE TRIGGER base_role_cache_profile_membership
AFTER INSERT OR DELETE ON public.profiles
FOR EACH STATEMENT EXECUTE FUNCTION private.base_role_cache_mark();

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
    SELECT coalesce(b.user_id,a.user_id) AS user_id
    FROM old_members a
    FULL OUTER JOIN new_members b USING(member_id)
    WHERE a.payload IS DISTINCT FROM b.payload
  ) delta
  WHERE user_id ~* '^[0-9a-f-]{36}$';

  -- The epoch was invalidated by the canonical org source write before this deferred trigger.
  FOR actor_ IN SELECT unnest(affected) LOOP
    PERFORM private.base_role_cache_refresh(actor_);
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
