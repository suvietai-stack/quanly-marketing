-- STAGED ONLY. Non-destructive archive; NEVER touch shared Sales/Showroom Roles.
-- Caller must compare private preflight and seed audit: only newly inserted,
-- unchanged Roles may be retired. Referenced Roles require org_change restore.
BEGIN;
SELECT pg_advisory_xact_lock(hashtext('canonical_org'));
LOCK TABLE app_roles,org_position_roles,org_position_slots,base_title_role_links,user_roles,mkt_specialties IN SHARE ROW EXCLUSIVE MODE;
DO $rollback$
DECLARE ids text[]:=ARRAY['role-v2-b2b-director','role-v2-b2b-head','role-v2-b2b-team','role-v2-b2b-staff','role-v2-btc-director']; r app_roles%ROWTYPE; a record;
BEGIN
 IF EXISTS(SELECT 1 FROM org_position_roles WHERE role_id=ANY(ids)) OR EXISTS(SELECT 1 FROM org_position_slots WHERE role_id=ANY(ids))
 OR EXISTS(SELECT 1 FROM base_title_role_links WHERE role_id=ANY(ids)) OR EXISTS(SELECT 1 FROM user_roles WHERE role_id=ANY(ids))
 OR EXISTS(SELECT 1 FROM mkt_specialties WHERE role_id=ANY(ids)) THEN RAISE EXCEPTION 'Referenced Role: audited mapping restore required'; END IF;
 FOR r IN SELECT * FROM app_roles WHERE id=ANY(ids) LOOP
   SELECT * INTO a FROM private.role_catalog_audit WHERE role_id=r.id AND action='INSERT'
    AND reason='Năm Role vị trí B2B/BTC độc lập; không thay bổ nhiệm' ORDER BY created_at DESC LIMIT 1;
   IF NOT FOUND OR a.after_data IS DISTINCT FROM to_jsonb(r) THEN RAISE EXCEPTION 'Missing seed snapshot or customized Role: %',r.id; END IF;
 END LOOP;
 PERFORM set_config('app.role_reason','Rollback seed B2B/BTC chưa dùng; giữ lịch sử',true);
 UPDATE app_roles SET catalog_state='archived' WHERE id=ANY(ids);
END $rollback$;
COMMIT;