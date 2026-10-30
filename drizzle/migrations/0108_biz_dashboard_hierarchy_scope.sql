CREATE OR REPLACE FUNCTION public.biz_dashboard_read(_year int,_period_kind text DEFAULT 'year',_period int DEFAULT 1,_department_id uuid DEFAULT NULL,_user_id uuid DEFAULT NULL,_mode text DEFAULT 'official') RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE a uuid:=auth.uid(); all_ok boolean; dept_ok boolean; self_ok boolean; lo int; hi int; result jsonb;
BEGIN
 PERFORM public.biz_period_start(_year,_period_kind,_period);
 IF _mode NOT IN ('official','provisional') THEN RAISE EXCEPTION 'Chế độ không hợp lệ'; END IF;
 all_ok:=public.is_super_admin(a) OR private.sig_can(a,'biz.view_all');dept_ok:=private.sig_can(a,'biz.view_dept');self_ok:=private.sig_can(a,'biz.view_own');
 IF a IS NULL OR NOT(all_ok OR dept_ok OR self_ok) THEN RAISE EXCEPTION 'Không có quyền xem Dashboard';END IF;
 IF _user_id IS NOT NULL AND _user_id<>a AND NOT(all_ok OR dept_ok) THEN RAISE EXCEPTION 'Không có quyền xem nhân viên';END IF;
 IF _department_id IS NOT NULL AND NOT all_ok AND NOT EXISTS(SELECT 1 FROM public.biz_department_members m WHERE m.department_id=_department_id AND ((m.user_id=a AND m.ended_at IS NULL AND self_ok) OR (dept_ok AND public.biz_scope_ok(a,m.user_id,m.department_id,m.started_at)))) THEN RAISE EXCEPTION 'Không có quyền xem phòng';END IF;
 lo:=CASE _period_kind WHEN 'month' THEN _period WHEN 'quarter' THEN (_period-1)*3+1 ELSE 1 END;hi:=lo+CASE _period_kind WHEN 'month' THEN 0 WHEN 'quarter' THEN 2 ELSE 11 END;
 WITH roster AS (
 SELECT p.id user_id,p.full_name employee_name,m.month,coalesce(d.department_id,public.biz_period_department(p.id,_year,'month',m.month)) department_id,d.id document_id,d.official_version_id,coalesce(d.first_submitted_at,least(now(),(make_date(_year,m.month,1)+interval '1 month') AT TIME ZONE 'Asia/Ho_Chi_Minh'-interval '1 microsecond')) scope_at
 FROM public.profiles p CROSS JOIN generate_series(1,12) m(month) LEFT JOIN public.biz_documents d ON d.user_id=p.id AND d.kind='report' AND d.period_kind='month' AND d.year=_year AND d.period=m.month
 WHERE public.biz_period_department(p.id,_year,'month',m.month) IS NOT NULL AND (_user_id IS NULL OR _user_id=p.id)
 ), visible AS (
 SELECT r.* FROM roster r WHERE (all_ok OR (self_ok AND r.user_id=a) OR (dept_ok AND public.biz_scope_ok(a,r.user_id,r.department_id,r.scope_at))) AND (_department_id IS NULL OR r.department_id=_department_id)
 ), chosen AS (
 SELECT r.*,coalesce(CASE WHEN _mode='provisional' THEN (SELECT id FROM public.biz_document_versions WHERE document_id=r.document_id AND status='pending' ORDER BY version DESC LIMIT 1) END,r.official_version_id) version_id FROM visible r
 ), baselines AS (
 SELECT r.*,v.items,v.target_version_id,coalesce(v.target_version_id,(SELECT target_version_id FROM public.biz_document_versions WHERE document_id=r.document_id ORDER BY version DESC LIMIT 1),(SELECT official_version_id FROM public.biz_annual_goals WHERE user_id=r.user_id AND year=_year)) baseline_id FROM chosen r LEFT JOIN public.biz_document_versions v ON v.id=r.version_id
 ), facts AS (
 SELECT r.user_id,r.employee_name,r.department_id,dep.name department_name,r.month,r.version_id,r.target_version_id,r.baseline_id,i.metric_id,i.definition,i.months[r.month]::text target,(SELECT x->>'actual' FROM jsonb_array_elements(coalesce(r.items,'[]')) x WHERE x->>'metric_id'=i.metric_id::text) actual
 FROM baselines r JOIN public.biz_departments dep ON dep.id=r.department_id JOIN public.biz_goal_items i ON i.version_id=r.baseline_id
 ), obligations AS (
 SELECT p.id user_id,p.full_name employee_name,k.kind,coalesce(d.department_id,public.biz_period_department(p.id,_year,_period_kind,_period)) department_id,d.first_submitted_at,
 public.biz_deadline_status(CASE WHEN d.deadline_frozen THEN d.deadline ELSE public.biz_deadline_at(k.kind||'_'||_period_kind,_year,_period) END,d.first_submitted_at,now()) time_status,
 coalesce((SELECT status FROM public.biz_document_versions WHERE document_id=d.id ORDER BY version DESC LIMIT 1),'missing') approval_status,d.official_version_id IS NOT NULL official
 FROM public.profiles p CROSS JOIN (VALUES('plan'),('report')) k(kind) LEFT JOIN public.biz_documents d ON d.user_id=p.id AND d.kind=k.kind AND d.period_kind=_period_kind AND d.year=_year AND d.period=_period
 WHERE public.biz_period_department(p.id,_year,_period_kind,_period) IS NOT NULL AND (_user_id IS NULL OR p.id=_user_id)
 ), scoped_obligations AS (
 SELECT o.*,dep.name department_name FROM obligations o JOIN public.biz_departments dep ON dep.id=o.department_id WHERE (_department_id IS NULL OR o.department_id=_department_id) AND (all_ok OR (self_ok AND o.user_id=a) OR (dept_ok AND public.biz_scope_ok(a,o.user_id,o.department_id,coalesce(o.first_submitted_at,now()))))
 )
 SELECT jsonb_build_object('year',_year,'period_kind',_period_kind,'period',_period,'mode',_mode,'lo',lo,'hi',hi,'server_now',now(),'facts',coalesce((SELECT jsonb_agg(to_jsonb(f)) FROM facts f),'[]'),'roster',coalesce((SELECT jsonb_agg(jsonb_build_object('user_id',r.user_id,'employee_name',r.employee_name,'department_id',r.department_id,'department_name',dep.name,'month',r.month,'official',r.official_version_id IS NOT NULL,'system_id',(SELECT system_id FROM public.biz_department_system_history WHERE department_id=r.department_id AND started_at<=r.scope_at AND (ended_at IS NULL OR ended_at>r.scope_at) LIMIT 1),'team_id',(SELECT team_id FROM public.biz_team_members tm JOIN public.biz_teams t ON t.id=tm.team_id WHERE tm.user_id=r.user_id AND t.department_id=r.department_id AND tm.started_at<=r.scope_at AND (tm.ended_at IS NULL OR tm.ended_at>r.scope_at) LIMIT 1))) FROM visible r JOIN public.biz_departments dep ON dep.id=r.department_id),'[]'),'obligations',coalesce((SELECT jsonb_agg(to_jsonb(o)) FROM scoped_obligations o),'[]')) INTO result;
 RETURN result;
END $$;
CREATE FUNCTION public.biz_org_parent_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$BEGIN
 IF TG_TABLE_NAME='biz_teams' AND NEW.active AND NOT EXISTS(SELECT 1 FROM public.biz_departments d JOIN public.biz_systems s ON s.id=d.system_id WHERE d.id=NEW.department_id AND d.active AND s.active) THEN RAISE EXCEPTION 'Nhóm cần phòng và Hệ đang hoạt động.'; END IF;
 IF TG_TABLE_NAME='biz_management_assignments' AND NEW.ended_at IS NULL THEN
 IF NEW.position='department_head' AND NOT EXISTS(SELECT 1 FROM public.biz_departments d JOIN public.biz_systems s ON s.id=d.system_id WHERE d.id=NEW.department_id AND d.active AND s.active) THEN RAISE EXCEPTION 'Phòng và Hệ phải đang hoạt động.'; END IF;
 IF NEW.position='team_lead' AND NOT EXISTS(SELECT 1 FROM public.biz_teams t JOIN public.biz_departments d ON d.id=t.department_id JOIN public.biz_systems s ON s.id=d.system_id WHERE t.id=NEW.team_id AND t.active AND d.active AND s.active) THEN RAISE EXCEPTION 'Nhóm, phòng và Hệ phải đang hoạt động.'; END IF;
 END IF; RETURN NEW;END $$;
CREATE TRIGGER biz_team_parent_guard BEFORE INSERT OR UPDATE ON public.biz_teams FOR EACH ROW EXECUTE FUNCTION public.biz_org_parent_guard();
CREATE TRIGGER biz_management_parent_guard BEFORE INSERT OR UPDATE ON public.biz_management_assignments FOR EACH ROW EXECUTE FUNCTION public.biz_org_parent_guard();
CREATE FUNCTION public.biz_legacy_org_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE dep uuid;BEGIN
 IF TG_TABLE_NAME='biz_department_members' THEN
 IF TG_OP='UPDATE' AND (NEW.ended_at IS DISTINCT FROM OLD.ended_at OR NEW.department_id IS DISTINCT FROM OLD.department_id) THEN UPDATE public.biz_team_members SET ended_at=coalesce(NEW.ended_at,clock_timestamp()) WHERE user_id=NEW.user_id AND ended_at IS NULL; END IF;
 ELSE
 IF NOT NEW.active AND (EXISTS(SELECT 1 FROM public.biz_teams WHERE department_id=NEW.id AND active) OR EXISTS(SELECT 1 FROM public.biz_department_members WHERE department_id=NEW.id AND ended_at IS NULL) OR EXISTS(SELECT 1 FROM public.biz_management_assignments WHERE department_id=NEW.id AND ended_at IS NULL)) THEN RAISE EXCEPTION 'Phòng còn nhóm, thành viên hoặc quản lý hoạt động.'; END IF;
 END IF; RETURN NEW;END $$;
CREATE TRIGGER biz_legacy_member_guard BEFORE UPDATE ON public.biz_department_members FOR EACH ROW EXECUTE FUNCTION public.biz_legacy_org_guard();
CREATE TRIGGER biz_legacy_department_guard BEFORE UPDATE ON public.biz_departments FOR EACH ROW EXECUTE FUNCTION public.biz_legacy_org_guard();
REVOKE ALL ON FUNCTION public.biz_org_parent_guard(),public.biz_legacy_org_guard() FROM PUBLIC,anon;
