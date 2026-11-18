-- Safe online deployment stage 1/8. This stage is inert: never replaces
-- the live resolver or attaches permission-source triggers.
-- In production, apply each subsequent migration separately with a short lock timeout.
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
  -- Successful per-user refreshes must not serialize all logins through
  -- a write lock on the global epoch row. Epoch only changes on source writes.
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

