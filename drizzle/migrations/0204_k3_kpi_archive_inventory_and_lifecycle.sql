CREATE TABLE private.k3_kpi_upgrade_backups(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, snapshot jsonb NOT NULL, counts jsonb NOT NULL);
REVOKE ALL ON private.k3_kpi_upgrade_backups FROM PUBLIC,anon,authenticated;
GRANT ALL ON private.k3_kpi_upgrade_backups TO service_role;
CREATE FUNCTION public.k3_kpi_inventory() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
BEGIN
 IF auth.uid() IS NULL OR NOT public.biz_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Admin được kiểm kê dữ liệu 3K.'; END IF;
 RETURN jsonb_build_object('counts',jsonb_build_object('goals',(SELECT count(*) FROM k3_goals),'actions',(SELECT count(*) FROM k3_actions),'kpis',(SELECT count(*) FROM k3_kpis),'tasks',(SELECT count(*) FROM k3_tasks),'days',(SELECT count(*) FROM k3_days),'summary_versions',(SELECT count(*) FROM k3_summary_versions)),'tasks',coalesce((SELECT jsonb_agg(jsonb_build_object('id',t.id,'name',t.name,'work_date',t.work_date,'owner_name',p.full_name,'has_official',(d.summarized_at IS NOT NULL),'actual',t.kpi_actual,'classification',CASE WHEN t.kpi_id IS NOT NULL AND EXISTS(SELECT 1 FROM k3_kpis k WHERE k.id=t.kpi_id AND k.action_id=t.action_id) THEN 'A' WHEN t.action_id IS NOT NULL AND (SELECT count(*) FROM k3_kpis k WHERE k.action_id=t.action_id AND k.kind='cumulative' AND k.unit IS NOT DISTINCT FROM t.kpi_unit)=1 AND t.kpi_actual IS NOT NULL THEN 'B' ELSE 'C' END,'reason',CASE WHEN t.action_id IS NULL THEN 'Chưa liên kết KF; giữ bản chốt/ngày gốc để rà soát.' WHEN t.kpi_id IS NULL THEN 'Chưa liên kết KPI; cần xác minh nguồn trước chuyển đổi.' ELSE 'Có định danh nguồn; cần đối chiếu kết quả.' END)) FROM k3_tasks t JOIN k3_days d ON d.id=t.day_id LEFT JOIN profiles p ON p.id=t.user_id),'[]'::jsonb),'review_count',(SELECT count(*) FROM k3_data_reviews WHERE status='pending'),'backup_verified',EXISTS(SELECT 1 FROM private.k3_kpi_upgrade_backups),'last_backup',(SELECT jsonb_build_object('id',id,'created_at',created_at,'counts',counts) FROM private.k3_kpi_upgrade_backups ORDER BY created_at DESC LIMIT 1));
END$fn$;
CREATE FUNCTION public.k3_kpi_backup_create() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE snapshot jsonb; counts jsonb; b private.k3_kpi_upgrade_backups;
BEGIN
 IF auth.uid() IS NULL OR NOT public.biz_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Admin được tạo bản sao kiểm kê.'; END IF;
 LOCK TABLE public.k3_goals,public.k3_actions,public.k3_kpis,public.k3_tasks,public.k3_days,public.k3_summary_versions,public.k3_task_events,public.k3_plan_events,public.k3_goal_members,public.k3_action_collaborators,public.k3_period_summaries,public.k3_comments,public.k3_period_comments,public.k3_kpi_results,public.k3_kpi_result_versions,public.k3_kpi_day_confirmations,public.k3_data_reviews IN SHARE MODE;
 snapshot:=jsonb_build_object('goals',(SELECT coalesce(jsonb_agg(to_jsonb(t)),'[]') FROM k3_goals t),'actions',(SELECT coalesce(jsonb_agg(to_jsonb(t)),'[]') FROM k3_actions t),'kpis',(SELECT coalesce(jsonb_agg(to_jsonb(t)),'[]') FROM k3_kpis t),'tasks',(SELECT coalesce(jsonb_agg(to_jsonb(t)),'[]') FROM k3_tasks t),'days',(SELECT coalesce(jsonb_agg(to_jsonb(t)),'[]') FROM k3_days t),'summary_versions',(SELECT coalesce(jsonb_agg(to_jsonb(t)),'[]') FROM k3_summary_versions t),'task_events',(SELECT coalesce(jsonb_agg(to_jsonb(t)),'[]') FROM k3_task_events t),'plan_events',(SELECT coalesce(jsonb_agg(to_jsonb(t)),'[]') FROM k3_plan_events t),'members',(SELECT coalesce(jsonb_agg(to_jsonb(t)),'[]') FROM k3_goal_members t),'collaborators',(SELECT coalesce(jsonb_agg(to_jsonb(t)),'[]') FROM k3_action_collaborators t),'period_summaries',(SELECT coalesce(jsonb_agg(to_jsonb(t)),'[]') FROM k3_period_summaries t),'comments',(SELECT coalesce(jsonb_agg(to_jsonb(t)),'[]') FROM k3_comments t),'period_comments',(SELECT coalesce(jsonb_agg(to_jsonb(t)),'[]') FROM k3_period_comments t),'results',(SELECT coalesce(jsonb_agg(to_jsonb(t)),'[]') FROM k3_kpi_results t),'result_versions',(SELECT coalesce(jsonb_agg(to_jsonb(t)),'[]') FROM k3_kpi_result_versions t),'confirmations',(SELECT coalesce(jsonb_agg(to_jsonb(t)),'[]') FROM k3_kpi_day_confirmations t),'reviews',(SELECT coalesce(jsonb_agg(to_jsonb(t)),'[]') FROM k3_data_reviews t));
 SELECT jsonb_object_agg(key,jsonb_array_length(value)) INTO counts FROM jsonb_each(snapshot);
 INSERT INTO private.k3_kpi_upgrade_backups(created_by,snapshot,counts) VALUES(auth.uid(),snapshot,counts) RETURNING * INTO b;
 IF (b.counts->>'tasks')::int<>(SELECT count(*) FROM k3_tasks) OR (b.counts->>'summary_versions')::int<>(SELECT count(*) FROM k3_summary_versions) THEN RAISE EXCEPTION 'Bản sao chưa đối soát đủ.'; END IF;
 RETURN jsonb_build_object('id',b.id,'created_at',b.created_at,'counts',b.counts,'verified',true);
END$fn$;
-- Review archive writes preserve the complete original; they never set deleted_at or start a purge clock.
CREATE FUNCTION public.k3_data_review_save(_kind text,_id uuid,_reason text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE row jsonb; v public.k3_data_reviews;
BEGIN
 IF auth.uid() IS NULL OR NOT public.biz_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Admin được rà soát.'; END IF;
 IF btrim(coalesce(_reason,''))='' THEN RAISE EXCEPTION 'Cần lý do rà soát.'; END IF;
 IF NOT EXISTS(SELECT 1 FROM private.k3_kpi_upgrade_backups) THEN RAISE EXCEPTION 'Cần bản sao đã kiểm đếm trước cách ly.'; END IF;
 IF _kind='goal' THEN SELECT to_jsonb(t) INTO row FROM k3_goals t WHERE id=_id FOR UPDATE;
 ELSIF _kind='action' THEN SELECT to_jsonb(t) INTO row FROM k3_actions t WHERE id=_id FOR UPDATE;
 ELSIF _kind='kpi' THEN SELECT to_jsonb(t) INTO row FROM k3_kpis t WHERE id=_id FOR UPDATE;
 ELSIF _kind='task' THEN SELECT to_jsonb(t) INTO row FROM k3_tasks t WHERE id=_id FOR UPDATE;
 ELSE RAISE EXCEPTION 'Loại dữ liệu không hợp lệ.'; END IF;
 IF row IS NULL THEN RAISE EXCEPTION 'Không tìm thấy dữ liệu.'; END IF;
 INSERT INTO public.k3_data_reviews(kind,record_id,reason,original_snapshot) VALUES(_kind,_id,btrim(_reason),row) ON CONFLICT(kind,record_id) DO NOTHING RETURNING * INTO v;
 IF v.id IS NULL THEN SELECT * INTO v FROM k3_data_reviews WHERE kind=_kind AND record_id=_id; END IF;
 RETURN to_jsonb(v);
END$fn$;
-- Prevent cascade purge of parents that contain canonical results or pending review records.
DO $patch$ DECLARE def text; BEGIN
 def:=pg_get_functiondef('public.k3_purge_expired(integer)'::regprocedure);
 def:=replace(def,'IF private.k3_goal_has_official(g.id) THEN','IF private.k3_goal_has_official(g.id) OR EXISTS(SELECT 1 FROM public.k3_kpi_results WHERE goal_id=g.id) OR EXISTS(SELECT 1 FROM public.k3_data_reviews v WHERE v.status=''pending'' AND (v.record_id=g.id OR v.record_id IN (SELECT id FROM k3_actions WHERE goal_id=g.id) OR v.record_id IN (SELECT id FROM k3_tasks WHERE action_id IN (SELECT id FROM k3_actions WHERE goal_id=g.id)) OR v.record_id IN (SELECT id FROM k3_kpis WHERE goal_id=g.id OR action_id IN (SELECT id FROM k3_actions WHERE goal_id=g.id)))) THEN');
 def:=replace(def,'IF private.k3_action_has_official(a.id) THEN','IF private.k3_action_has_official(a.id) OR EXISTS(SELECT 1 FROM public.k3_kpi_results WHERE action_id=a.id) OR EXISTS(SELECT 1 FROM public.k3_data_reviews v WHERE v.status=''pending'' AND (v.record_id=a.id OR v.record_id IN (SELECT id FROM k3_tasks WHERE action_id=a.id) OR v.record_id IN (SELECT id FROM k3_kpis WHERE action_id=a.id))) THEN');
 def:=replace(def,'WHERE t.deleted_at IS NOT NULL AND t.deleted_at<=cutoff AND d.summarized_at IS NULL','WHERE t.deleted_at IS NOT NULL AND t.deleted_at<=cutoff AND d.summarized_at IS NULL AND NOT EXISTS(SELECT 1 FROM public.k3_data_reviews v WHERE v.status=''pending'' AND v.record_id=t.id)');
 EXECUTE def;
END$patch$;
REVOKE ALL ON FUNCTION public.k3_kpi_inventory(),public.k3_kpi_backup_create(),public.k3_data_review_save(text,uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.k3_kpi_inventory(),public.k3_kpi_backup_create(),public.k3_data_review_save(text,uuid,text) TO authenticated;
-- Canonical result/confirmation rows have no cascade foreign keys: official history remains recoverable.