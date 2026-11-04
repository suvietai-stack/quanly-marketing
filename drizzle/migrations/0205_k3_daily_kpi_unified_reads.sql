CREATE FUNCTION private.k3_entity_metric(_kind text,_id uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE total int; met int; active int; lifecycle text;
BEGIN
 IF _kind='goal' THEN SELECT status INTO lifecycle FROM k3_goals WHERE id=_id; ELSE SELECT status INTO lifecycle FROM k3_actions WHERE id=_id; END IF;
 SELECT count(*)::int,count(*) FILTER(WHERE (private.k3_result_metric(k.id,false)->>'attained')::boolean IS TRUE)::int,coalesce(sum((private.k3_result_metric(k.id,false)->>'result_count')::int),0)::int INTO total,met,active FROM k3_kpis k WHERE k.required AND CASE WHEN _kind='goal' THEN k.goal_id=_id ELSE k.action_id=_id END;
 RETURN jsonb_build_object('kpi_total',total,'kpi_met',met,'status',CASE WHEN lifecycle IN ('draft','paused','cancelled','ended_missed') THEN lifecycle WHEN total>0 AND total=met THEN 'done' WHEN active>0 THEN 'in_progress' ELSE 'not_started' END);
END$fn$;
REVOKE ALL ON FUNCTION private.k3_entity_metric(text,uuid) FROM PUBLIC,anon,authenticated;
CREATE FUNCTION public.k3_kpi_day_read(_date date) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE uid uuid:=auth.uid(); rows jsonb; c public.k3_kpi_day_confirmations;
BEGIN
 IF uid IS NULL OR NOT public.k3_can(uid,'k3.use') THEN RAISE EXCEPTION 'Bạn không có quyền sử dụng 3K.'; END IF;
 SELECT * INTO c FROM k3_kpi_day_confirmations WHERE user_id=uid AND work_date=_date ORDER BY confirmed_at DESC,id DESC LIMIT 1;
 SELECT coalesce(jsonb_agg(to_jsonb(r) ORDER BY r.id),'[]'::jsonb) INTO rows FROM k3_kpi_results r WHERE user_id=uid AND work_date=_date AND deleted_at IS NULL AND review_reason IS NULL;
 RETURN jsonb_build_object('date',_date,'result_count',jsonb_array_length(rows),'confirmed_at',c.confirmed_at,'needs_confirmation',c.id IS NOT NULL AND c.snapshot<>rows,'actions',coalesce((SELECT jsonb_agg(jsonb_build_object('id',a.id,'name',a.name,'goal_name',g.name,'due_date',a.due_date,'metric',private.k3_entity_metric('action',a.id),'kpis',coalesce((SELECT jsonb_agg(jsonb_build_object('id',k.id,'name',k.name,'metric',private.k3_result_metric(k.id,false))) FROM k3_kpis k WHERE k.action_id=a.id),'[]'::jsonb)) ORDER BY a.is_key DESC,a.created_at) FROM k3_actions a JOIN k3_goals g ON g.id=a.goal_id WHERE private.k3_action_worker_ok(uid,a.id) AND g.deleted_at IS NULL AND a.deleted_at IS NULL AND g.status NOT IN ('draft','paused','cancelled','ended_missed') AND a.status NOT IN ('draft','paused','cancelled','ended_missed') AND _date BETWEEN coalesce(a.start_date,g.period_start) AND g.period_end AND NOT EXISTS(SELECT 1 FROM k3_data_reviews v WHERE v.status='pending' AND v.record_id IN (g.id,a.id))),'[]'::jsonb));
END$fn$;
REVOKE ALL ON FUNCTION public.k3_kpi_day_read(date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.k3_kpi_day_read(date) TO authenticated;
-- Keep legacy status/timestamps for audit; display status is derived, never stored by result saves.
DO $patch$ DECLARE def text; BEGIN
 def:=pg_get_functiondef('public.k3_goal_list(text,text)'::regprocedure);
 def:=replace(def,'''status'',g.status','''status'',private.k3_entity_metric(''goal'',g.id)->>''status''');
 EXECUTE def;
 def:=pg_get_functiondef('public.k3_goal_detail(uuid)'::regprocedure);
 def:=replace(def,'''goal'', to_jsonb(g) || jsonb_build_object','''goal'', to_jsonb(g) || jsonb_build_object(''status'',private.k3_entity_metric(''goal'',g.id)->>''status'') || jsonb_build_object');
 def:=replace(def,'''action'',to_jsonb(a)','''action'',to_jsonb(a)||jsonb_build_object(''status'',private.k3_entity_metric(''action'',a.id)->>''status'',''kpi_summary'',private.k3_entity_metric(''action'',a.id))');
 EXECUTE def;
END$patch$;
-- Existing API callers cannot force computed completion. Lifecycle cancellation needs an explanation.
DO $patch$ DECLARE def text; fname text; BEGIN
 FOREACH fname IN ARRAY ARRAY['public.k3_action_status(uuid,text,text,text,text,bigint)','public.k3_goal_status(uuid,text,text,bigint)'] LOOP
 def:=pg_get_functiondef(fname::regprocedure);
 def:=replace(def,'IF _status=''done'' THEN','IF _status=''done'' THEN RAISE EXCEPTION ''Hoàn thành được tự xác định từ kết quả KPI.''; END IF; IF _status=''done'' THEN');
 EXECUTE def;
 END LOOP;
END$patch$;
-- Pending review records cannot be silently deleted/restored through ordinary trash operations.
DO $patch$ DECLARE def text; fname text; BEGIN
 FOREACH fname IN ARRAY ARRAY['public.k3_soft_delete(text,uuid)','public.k3_restore(text,uuid)'] LOOP
 def:=pg_get_functiondef(fname::regprocedure);
 def:=replace(def,'IF uid IS NULL THEN','IF EXISTS(SELECT 1 FROM public.k3_data_reviews v WHERE v.record_id=_id AND v.status=''pending'') THEN RAISE EXCEPTION ''Dữ liệu chờ rà soát: chỉ xử lý qua khu vực quản trị, không vào Thùng rác 15 ngày.''; END IF; IF uid IS NULL THEN');
 EXECUTE def;
 END LOOP;
END$patch$;