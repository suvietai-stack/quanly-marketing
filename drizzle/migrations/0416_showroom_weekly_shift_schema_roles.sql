-- Showroom roster: shared organization staff, editable policy, audited weekly requests.
BEGIN;
SET LOCAL lock_timeout='10s';
SET LOCAL statement_timeout='90s';

INSERT INTO public.base_permission_catalog(key,label,module,dependencies) VALUES
 ('showroom.shift.view','Xem lịch trực trong Showroom của mình','Showroom',ARRAY[]::text[]),
 ('showroom.shift.register','Đăng ký lịch trực tuần của bản thân','Showroom',ARRAY[]::text[]),
 ('showroom.shift.swap','Đề nghị đổi ca và xác nhận nhận ca','Showroom',ARRAY[]::text[]),
 ('showroom.shift.approve','Duyệt và công bố lịch trực cửa hàng','Showroom',ARRAY[]::text[]),
 ('showroom.shift.settings','Cài đặt chính sách lịch trực cửa hàng','Showroom',ARRAY[]::text[]),
 ('showroom.shift.view_all','Xem lịch trực toàn Khối Showroom','Showroom',ARRAY[]::text[])
 ON CONFLICT(key) DO UPDATE SET label=EXCLUDED.label,module=EXCLUDED.module,dependencies=EXCLUDED.dependencies;

UPDATE public.app_roles r SET
 permissions=(SELECT array_agg(DISTINCT p ORDER BY p)
 FROM unnest(r.permissions || ARRAY['showroom.shift.view','showroom.shift.register','showroom.shift.swap']::text[]) p),
 updated_at=now()
WHERE r.id='role-v2-showroom-staff';
UPDATE public.app_roles r SET
 permissions=(SELECT array_agg(DISTINCT p ORDER BY p)
 FROM unnest(r.permissions || ARRAY['showroom.shift.view','showroom.shift.register','showroom.shift.swap','showroom.shift.approve','showroom.shift.settings']::text[]) p),
 updated_at=now()
WHERE r.id='role-v2-showroom-manager';

CREATE TABLE IF NOT EXISTS public.showroom_shift_policies (
 store_id text PRIMARY KEY REFERENCES public.org_units(id),
 config jsonb NOT NULL DEFAULT '{}'::jsonb,
 version integer NOT NULL DEFAULT 1,
 updated_by uuid,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.showroom_shift_policy_history (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 store_id text NOT NULL REFERENCES public.org_units(id),
 version integer NOT NULL,
 config jsonb NOT NULL,
 changed_by uuid,
 changed_at timestamptz NOT NULL DEFAULT now(),
 reason text NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS public.showroom_shift_weeks (
 store_id text NOT NULL REFERENCES public.org_units(id),
 week_start date NOT NULL,
 status text NOT NULL DEFAULT 'draft' CHECK(status IN('draft','published')),
 opens_at timestamptz,
 closes_at timestamptz,
 published_at timestamptz,
 published_by uuid,
 publish_note text,
 revision integer NOT NULL DEFAULT 1,
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(store_id,week_start),
 CONSTRAINT showroom_shift_week_monday CHECK (extract(isodow from week_start)=1)
);
CREATE TABLE IF NOT EXISTS public.showroom_shift_entries (
 store_id text NOT NULL REFERENCES public.org_units(id),
 work_date date NOT NULL,
 staff_id uuid NOT NULL REFERENCES public.profiles(id),
 requested_shift text CHECK(requested_shift IN('early','late','full','off')),
 assigned_shift text CHECK(assigned_shift IN('early','late','full','off')),
 updated_by uuid,
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(store_id,work_date,staff_id),
 CHECK(requested_shift IS NOT NULL OR assigned_shift IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS showroom_shift_entries_staff_idx
 ON public.showroom_shift_entries(staff_id,work_date DESC);
CREATE TABLE IF NOT EXISTS public.showroom_shift_changes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 store_id text NOT NULL REFERENCES public.org_units(id),
 requester_id uuid NOT NULL REFERENCES public.profiles(id),
 work_date date NOT NULL,
 original_shift text NOT NULL,
 partner_id uuid REFERENCES public.profiles(id),
 partner_date date,
 partner_shift text,
 kind text NOT NULL CHECK(kind IN('swap','emergency')),
 reason text NOT NULL DEFAULT '',
 status text NOT NULL CHECK(status IN('pending_peer','pending_manager','approved','rejected','cancelled')),
 decided_by uuid,
 decided_at timestamptz,
 decision_note text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK ((kind='swap' AND partner_id IS NOT NULL AND partner_date IS NOT NULL AND partner_shift IS NOT NULL)
 OR (kind='emergency' AND partner_id IS NULL))
);
CREATE INDEX IF NOT EXISTS showroom_shift_changes_store_idx
 ON public.showroom_shift_changes(store_id,created_at DESC);
CREATE TABLE IF NOT EXISTS public.showroom_shift_audit (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 store_id text NOT NULL REFERENCES public.org_units(id),
 week_start date,
 action text NOT NULL,
 actor_id uuid,
 detail jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS showroom_shift_audit_store_idx
 ON public.showroom_shift_audit(store_id,created_at DESC);

-- All client reads/writes go through per-actor, per-store SECURITY DEFINER RPCs.
ALTER TABLE public.showroom_shift_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showroom_shift_policy_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showroom_shift_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showroom_shift_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showroom_shift_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showroom_shift_audit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.showroom_shift_policies,public.showroom_shift_policy_history,
 public.showroom_shift_weeks,public.showroom_shift_entries,public.showroom_shift_changes,
 public.showroom_shift_audit FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION private.showroom_shift_store(_store text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
 SELECT EXISTS(SELECT 1 FROM public.org_units u
 JOIN public.org_units parent ON parent.id=u.parent_id AND parent.active AND parent.kind='system'
 JOIN public.org_units block ON block.id=parent.parent_id AND block.id='showroom-block' AND block.active
 WHERE u.id=_store AND u.active AND u.kind='department')
$fn$;
CREATE OR REPLACE FUNCTION private.showroom_shift_member(_who uuid,_store text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
 SELECT EXISTS(SELECT 1 FROM public.org_assignments a
 JOIN public.org_titles t ON t.id=a.title_id AND t.active AND t.unit_id=a.unit_id
 WHERE a.user_id=_who AND a.unit_id=_store AND a.status='active'
 AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now()))
$fn$;
CREATE OR REPLACE FUNCTION private.showroom_shift_can(_who uuid,_store text,_key text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
BEGIN
 IF _who IS NULL OR NOT private.is_active(_who) OR NOT private.showroom_shift_store(_store) THEN RETURN false; END IF;
 IF private.is_super_admin(_who) THEN RETURN true; END IF;
 IF _key='showroom.shift.view' AND private.has_permission(_who,'showroom.shift.view_all') THEN RETURN true; END IF;
 RETURN private.showroom_shift_member(_who,_store) AND private.has_permission(_who,_key);
END $fn$;
-- Policy defaults are read-only fallbacks; only a person with settings right can change the policy.
CREATE OR REPLACE FUNCTION private.showroom_shift_defaults()
RETURNS jsonb LANGUAGE sql IMMUTABLE AS $fn$
 SELECT '{"open_day":1,"open_time":"08:00","close_day":4,"close_time":"17:00","publish_day":5,"publish_time":"17:00","rest_days":1,"min_early":1,"min_late":1,"open_store":"07:30","close_store":"17:30","allow_full_exception":true,"remind":true,"holidays":[],"early_start":"07:30","early_end":"16:30","late_start":"08:30","late_end":"17:30","noon_break_start":"12:00","noon_break_end":"13:15"}'::jsonb
$fn$;
CREATE OR REPLACE FUNCTION private.showroom_shift_policy(_store text)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
 SELECT private.showroom_shift_defaults() || coalesce((SELECT config FROM public.showroom_shift_policies WHERE store_id=_store),'{}'::jsonb)
$fn$;
CREATE OR REPLACE FUNCTION private.showroom_shift_window(_week date,_config jsonb)
RETURNS jsonb LANGUAGE sql STABLE AS $fn$
 SELECT jsonb_build_object(
  'open_at',(((_week - 7) + (coalesce((_config->>'open_day')::int,1)-1))::timestamp + coalesce((_config->>'open_time')::time,'08:00'::time)) AT TIME ZONE 'Asia/Ho_Chi_Minh',
  'close_at',(((_week - 7) + (coalesce((_config->>'close_day')::int,4)-1))::timestamp + coalesce((_config->>'close_time')::time,'17:00'::time)) AT TIME ZONE 'Asia/Ho_Chi_Minh',
  'publish_due',(((_week - 7) + (coalesce((_config->>'publish_day')::int,5)-1))::timestamp + coalesce((_config->>'publish_time')::time,'17:00'::time)) AT TIME ZONE 'Asia/Ho_Chi_Minh'
 )
$fn$;
COMMIT;