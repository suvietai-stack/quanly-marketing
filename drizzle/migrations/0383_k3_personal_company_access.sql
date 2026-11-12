-- Personal-first company K3. No business data or Role updates; no discipline activation.
DO $$ BEGIN
IF md5(pg_get_functiondef('public.k3_can(uuid,text)'::regprocedure)) <> '10bc47528360083b3012377fb7802e49' THEN RAISE EXCEPTION 'K3 gate changed: k3_can'; END IF;
IF md5(pg_get_functiondef('private.k3_day_guard()'::regprocedure)) <> '983847d1885f9f8e063a6d11d33a262c' THEN RAISE EXCEPTION 'K3 gate changed: day_guard'; END IF;
IF md5(pg_get_functiondef('private.k3_goal_manage_ok(uuid,uuid)'::regprocedure)) <> '01708330ddf0f82b4d1c03b6328da863' THEN RAISE EXCEPTION 'K3 gate changed: goal_manage'; END IF;
IF md5(pg_get_functiondef('public.k3_scope_ok(uuid,uuid)'::regprocedure)) <> '48e1fe2bbef21ce7cd9e7d7b8585ea3f' THEN RAISE EXCEPTION 'K3 gate changed: scope'; END IF;
END $$;
ALTER TABLE public.k3_goals ADD COLUMN IF NOT EXISTS org_unit_id text REFERENCES public.org_units(id);
ALTER TABLE public.k3_days ADD COLUMN IF NOT EXISTS org_unit_id text REFERENCES public.org_units(id);
ALTER TABLE public.k3_period_summaries ADD COLUMN IF NOT EXISTS org_unit_id text REFERENCES public.org_units(id);
ALTER TABLE public.k3_daily_closes ADD COLUMN IF NOT EXISTS org_unit_id text REFERENCES public.org_units(id);
ALTER TABLE public.k3_settings ADD COLUMN IF NOT EXISTS company_effective_from date;
COMMENT ON COLUMN public.k3_settings.company_effective_from IS 'Explicit prospective company cutover date. NULL disables company obligations; original effective_from remains historical.';
COMMENT ON COLUMN public.k3_goals.org_unit_id IS 'Frozen organization attribution; NULL retains legacy department_id. No guessed historical backfill.';
CREATE INDEX IF NOT EXISTS k3_goals_org_unit_idx ON public.k3_goals(org_unit_id);
CREATE INDEX IF NOT EXISTS k3_days_org_unit_date_idx ON public.k3_days(org_unit_id,work_date);
CREATE OR REPLACE FUNCTION private.k3_personal_denied(u uuid,p text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM jsonb_array_elements(private.base_rules(u,private.base_config())) r WHERE r->>'permission'=p AND r->>'effect'='DENY' AND private.base_valid_at(r))
$$;
CREATE OR REPLACE FUNCTION private.k3_personal_unit(u uuid,d date) RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT CASE WHEN count(DISTINCT a.unit_id)=1 THEN min(a.unit_id) END FROM org_assignments a JOIN org_units ou ON ou.id=a.unit_id AND ou.active
 WHERE a.user_id=u AND a.status='active' AND a.starts_at<=least(now(),d::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh'+interval '1 day'-interval '1 microsecond') AND (a.ends_at IS NULL OR a.ends_at>least(now(),d::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh'+interval '1 day'-interval '1 microsecond'))
$$;
CREATE OR REPLACE FUNCTION private.k3_personal_attribution() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF TG_OP='INSERT' THEN
 IF TG_TABLE_NAME='k3_goals' OR TG_TABLE_NAME='k3_period_summaries' THEN NEW.org_unit_id:=private.k3_personal_unit(NEW.user_id,NEW.period_start); ELSE NEW.org_unit_id:=private.k3_personal_unit(NEW.user_id,NEW.work_date); END IF;
 ELSE IF NEW.org_unit_id IS DISTINCT FROM OLD.org_unit_id THEN RAISE EXCEPTION 'Không đổi đơn vị lịch sử 3K.'; END IF; END IF;
 RETURN NEW; END $$;
CREATE OR REPLACE TRIGGER k3_personal_goal_attribution BEFORE INSERT OR UPDATE ON public.k3_goals FOR EACH ROW EXECUTE FUNCTION private.k3_personal_attribution();
CREATE OR REPLACE TRIGGER k3_personal_period_attribution BEFORE INSERT OR UPDATE ON public.k3_period_summaries FOR EACH ROW EXECUTE FUNCTION private.k3_personal_attribution();
CREATE OR REPLACE TRIGGER k3_personal_close_attribution BEFORE INSERT OR UPDATE ON public.k3_daily_closes FOR EACH ROW EXECUTE FUNCTION private.k3_personal_attribution();
CREATE OR REPLACE FUNCTION public.k3_can(_actor uuid,_permission text) RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF NOT private.is_active(_actor) THEN RETURN false; END IF;
 IF public.is_super_admin(_actor) OR public.biz_admin(_actor) THEN RETURN true; END IF;
 IF private.k3_personal_denied(_actor,_permission) THEN RETURN false; END IF;
 IF _permission='k3.use' THEN RETURN true; END IF;
 IF NOT private.legacy_business_allowed(_actor) THEN RETURN false; END IF;
 IF _permission IN ('k3.view_scope','k3.comment') THEN RETURN public.biz_manager(_actor) OR public.biz_all_scope(_actor); END IF;
 RETURN false; END $$;
CREATE OR REPLACE FUNCTION private.k3_day_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE s public.k3_settings; BEGIN
 IF TG_OP='INSERT' THEN SELECT * INTO s FROM public.k3_settings WHERE id; NEW.department_id:=public.biz_department_at(NEW.user_id,NEW.work_date); NEW.org_unit_id:=private.k3_personal_unit(NEW.user_id,NEW.work_date); NEW.plan_deadline:=(NEW.work_date+coalesce(s.plan_by,'08:45'::time)) AT TIME ZONE 'Asia/Ho_Chi_Minh'; NEW.summary_deadline:=(NEW.work_date+coalesce(s.summary_by,'18:00'::time)) AT TIME ZONE 'Asia/Ho_Chi_Minh';
 ELSIF NEW.kg IS DISTINCT FROM OLD.kg THEN NEW.data_revision:=OLD.data_revision+1; END IF; RETURN NEW; END $$;
CREATE OR REPLACE FUNCTION private.k3_goal_manage_ok(_actor uuid,_goal uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT public.k3_can(_actor,'k3.use') AND (public.biz_admin(_actor) OR EXISTS(SELECT 1 FROM public.k3_goals g WHERE g.id=_goal AND g.user_id=_actor)) $$;
CREATE OR REPLACE FUNCTION public.k3_scope_ok(_actor uuid,_user uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT private.is_active(_actor) AND (_actor=_user AND public.k3_can(_actor,'k3.use') OR public.k3_can(_actor,'k3.view_scope') AND private.legacy_business_allowed(_actor) AND (public.biz_all_scope(_actor) OR EXISTS(SELECT 1 FROM biz_department_members m WHERE m.user_id=_user AND public.biz_scope_ok(_actor,_user,m.department_id)))) $$;
REVOKE ALL ON FUNCTION private.k3_personal_denied(uuid,text),private.k3_personal_unit(uuid,date),private.k3_personal_attribution() FROM PUBLIC,anon,authenticated,service_role;
DO $patch$ DECLARE d text; BEGIN
 d:=pg_get_functiondef('private.org_role_permission_ready(text)'::regprocedure); IF md5(d)<>'dc24adec9021ac7b73f987c8659c8b4b' THEN RAISE EXCEPTION 'Readiness changed'; END IF; d:=replace(d,'SELECT p = ANY (ARRAY[','SELECT p=''k3.use'' OR p = ANY (ARRAY['); EXECUTE d;
 d:=pg_get_functiondef('private.permission_editor_policy()'::regprocedure); IF md5(d)<>'c11f9a01d1b9b2a56b990e365d9fd7af' THEN RAISE EXCEPTION 'Editor policy changed'; END IF; d:=replace(d,'(VALUES (''leave.create''','(VALUES (''k3.use'',''own'',true),(''leave.create'''); EXECUTE d;
 d:=pg_get_functiondef('public.k3_zalo_report_preview(date)'::regprocedure); IF md5(d)<>'817b44944d552fd994fae546b3d7788d' THEN RAISE EXCEPTION 'Zalo preview changed'; END IF; d:=replace(d,'(c.scope_kind=''all'' OR','((c.scope_kind=''all'' AND department_id IS NOT NULL) OR'); EXECUTE d;
 d:=pg_get_functiondef('public.k3_zalo_report_queue()'::regprocedure); IF md5(d)<>'a99131e4eeed42544c1fca451aa39371' THEN RAISE EXCEPTION 'Zalo queue changed'; END IF; d:=replace(d,'(c.scope_kind=''all'' OR','((c.scope_kind=''all'' AND department_id IS NOT NULL) OR'); EXECUTE d;
END $patch$;
-- Existing RLS/grants, Sales discipline/leave checks and old timestamps remain. company_effective_from remains NULL.