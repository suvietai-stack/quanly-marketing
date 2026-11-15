-- STAGED ONLY. Delete 29 obsolete V1 Roles and 17 INACTIVE title-links.
-- Requires separately approved role-515 account-approval migration first.
-- Preserves role-super-admin, role-admin, all 26 V2 Roles, organization assignments, audit.
BEGIN;
LOCK TABLE public.app_roles, public.user_roles, public.base_title_role_links,
 public.org_position_roles, public.org_position_slots, public.mkt_specialties,
 public.biz_access_exceptions IN SHARE ROW EXCLUSIVE MODE;
DO $preflight$
DECLARE n integer; fingerprint text;
BEGIN
 IF (SELECT count(*) FROM public.base_permission_catalog)<>515
 OR (SELECT count(*) FROM public.app_roles WHERE catalog_generation=2)<>26
 OR (SELECT count(*) FROM public.app_roles WHERE catalog_generation=2 AND role_kind='common')<>1
 THEN RAISE EXCEPTION 'STOP: V2 or 515 baseline drift'; END IF;
 IF to_regclass('private.role_515_approval_backup') IS NULL
 THEN RAISE EXCEPTION 'STOP: no-direct account approval must migrate first'; END IF;
 IF NOT EXISTS (SELECT 1 FROM private.role_515_approval_backup
    WHERE id='role-515-approval-20261116' AND status='applied')
 THEN RAISE EXCEPTION 'STOP: account approval migration is not active'; END IF;
 IF to_regclass('private.role_515_legacy_backup') IS NOT NULL
 THEN RAISE EXCEPTION 'STOP: V1 retirement already attempted'; END IF;
 IF (SELECT count(*) FROM public.user_roles)<>2
 OR (SELECT count(*) FROM public.user_roles WHERE role_id='role-super-admin')<>2
 OR NOT EXISTS (SELECT 1 FROM public.app_roles WHERE id='role-super-admin' AND is_system)
 OR NOT EXISTS (SELECT 1 FROM public.app_roles WHERE id='role-admin' AND is_system)
 THEN RAISE EXCEPTION 'STOP: protected admin roles changed'; END IF;
 SELECT count(*),md5(coalesce(string_agg(to_jsonb(r)::text,'|' ORDER BY r.id),''))
 INTO n,fingerprint
 FROM public.app_roles r
 WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin');
 IF n<>29 OR fingerprint<>'6de25f7bbb1f9cbe4df96e5e5944c861'
 THEN RAISE EXCEPTION 'STOP: obsolete V1 Role set changed (%, %)',n,fingerprint; END IF;
 SELECT count(*),md5(coalesce(string_agg(to_jsonb(l)::text,'|' ORDER BY l.id),''))
 INTO n,fingerprint
 FROM public.base_title_role_links l JOIN public.app_roles r ON l.role_id=r.id
 WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin');
 IF n<>17 OR fingerprint<>'b2ba1d705627b5e25f07927e23107d48'
 THEN RAISE EXCEPTION 'STOP: obsolete V1 title-link set changed (%, %)',n,fingerprint; END IF;
 IF EXISTS (SELECT 1 FROM public.base_title_role_links l JOIN public.app_roles r ON l.role_id=r.id
    WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin') AND l.active)
 OR EXISTS(SELECT 1 FROM public.user_roles u JOIN public.app_roles r ON r.id=u.role_id
    WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin'))
 OR EXISTS(SELECT 1 FROM public.org_position_slots s JOIN public.app_roles r ON r.id=s.role_id
    WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin'))
 OR EXISTS(SELECT 1 FROM public.org_position_roles s JOIN public.app_roles r ON r.id=s.role_id
    WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin'))
 OR EXISTS(SELECT 1 FROM public.mkt_specialties s JOIN public.app_roles r ON r.id=s.role_id
    WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin'))
 OR EXISTS(SELECT 1 FROM public.biz_access_exceptions s JOIN public.app_roles r ON r.id=s.role_id
    WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin'))
 THEN RAISE EXCEPTION 'STOP: V1 Role still has active references'; END IF;
 IF (SELECT count(*) FROM public.app_roles WHERE catalog_generation=1
     AND is_system AND id IN ('role-nhan-su-moi','role-dong-hang'))<>2
 OR EXISTS(SELECT 1 FROM public.app_roles WHERE catalog_generation=1
     AND is_system AND id NOT IN ('role-super-admin','role-admin','role-nhan-su-moi','role-dong-hang'))
 THEN RAISE EXCEPTION 'STOP: V1 system-role flags changed'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_trigger
   WHERE tgrelid='public.app_roles'::regclass
     AND tgname='app_role_delete_guard' AND tgenabled='O')
 THEN RAISE EXCEPTION 'STOP: live Role deletion guard changed'; END IF;
END; $preflight$;

CREATE TABLE private.role_515_legacy_backup(
 id text PRIMARY KEY,
 roles_json jsonb NOT NULL,
 title_links_json jsonb NOT NULL,
 original_roles_md5 text NOT NULL,
 original_links_md5 text NOT NULL,
 status text NOT NULL DEFAULT 'retired' CHECK(status IN ('retired','rolled_back')),
 captured_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 rolled_back_at timestamptz
);
REVOKE ALL ON private.role_515_legacy_backup FROM PUBLIC,anon,authenticated;
INSERT INTO private.role_515_legacy_backup
 (id,roles_json,title_links_json,original_roles_md5,original_links_md5)
SELECT 'role-515-retirement-20261116',
 (SELECT coalesce(jsonb_agg(to_jsonb(r) ORDER BY r.id),'[]'::jsonb) FROM public.app_roles r
   WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin')),
 (SELECT coalesce(jsonb_agg(to_jsonb(l) ORDER BY l.id),'[]'::jsonb)
   FROM public.base_title_role_links l JOIN public.app_roles r ON r.id=l.role_id
   WHERE r.catalog_generation=1 AND r.id NOT IN ('role-super-admin','role-admin')),
 '6de25f7bbb1f9cbe4df96e5e5944c861','b2ba1d705627b5e25f07927e23107d48';

-- Keep audit and historical source events, only remove inactive V1 linkage.
SELECT set_config('app.role_reason','Role 515: retire unused legacy Roles after backed-up cutover',true);
DELETE FROM public.base_title_role_links l USING public.app_roles r
 WHERE r.id=l.role_id AND r.catalog_generation=1
 AND r.id NOT IN ('role-super-admin','role-admin') AND NOT l.active;

-- Two obsolete catalog records were incorrectly marked system; protected super/admin are untouched.
UPDATE public.app_roles SET is_system=false
 WHERE catalog_generation=1 AND id IN ('role-nhan-su-moi','role-dong-hang');

-- Existing BEFORE DELETE trigger checks is_system and private.role_in_use.
-- No cascade. Any unexpected FK or remaining use aborts the whole transaction.
DELETE FROM public.app_roles
 WHERE catalog_generation=1 AND id NOT IN ('role-super-admin','role-admin');

DO $verify$
BEGIN
 IF (SELECT count(*) FROM public.app_roles WHERE catalog_generation=1)<>2
 OR (SELECT count(*) FROM public.app_roles WHERE catalog_generation=2)<>26
 OR (SELECT count(*) FROM public.user_roles WHERE role_id='role-super-admin')<>2
 OR (SELECT count(*) FROM private.role_515_legacy_backup
    WHERE id='role-515-retirement-20261116'
    AND jsonb_array_length(roles_json)=29 AND jsonb_array_length(title_links_json)=17
    AND status='retired')<>1
 THEN RAISE EXCEPTION 'STOP: V1 retirement validation failed'; END IF;
END; $verify$;
COMMIT;
