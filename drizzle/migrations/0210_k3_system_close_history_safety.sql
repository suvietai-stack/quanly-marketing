COMMENT ON COLUMN public.k3_kpi_day_confirmations.source IS 'Manual confirmations belong to authenticated employees; automatic closures use k3_daily_closes without a synthetic actor.';
DO $patch$ DECLARE def text; fname text; BEGIN
 def:=pg_get_functiondef('private.k3_close_one(uuid,date,text)'::regprocedure);
 def:=regexp_replace(def,' IF made IS NOT NULL AND _source=''auto''[\s\S]*?END IF;', '', 'g');
 IF def LIKE '%00000000-0000-0000-0000-000000000000%' THEN RAISE EXCEPTION 'System actor replacement failed'; END IF;
 EXECUTE def;
 def:=pg_get_functiondef('public.k3_auto_close_run()'::regprocedure);
 def:=replace(def,$old$p.status='Đang hoạt động' AND EXISTS$old$, $new$p.status='Đang hoạt động' AND public.k3_can(p.id,'k3.use') AND EXISTS$new$);
 EXECUTE def;
 FOREACH fname IN ARRAY ARRAY['private.k3_goal_has_official(uuid)','private.k3_action_has_official(uuid)'] LOOP
 def:=pg_get_functiondef(fname::regprocedure);
 IF fname LIKE '%goal%' THEN
 def:=replace(def,'SELECT EXISTS(', 'SELECT EXISTS(SELECT 1 FROM public.k3_daily_closes c CROSS JOIN LATERAL jsonb_array_elements(c.snapshot->''results'') s WHERE s->>''goal_id''=_goal::text) OR EXISTS(');
 ELSE
 def:=replace(def,'SELECT EXISTS(', 'SELECT EXISTS(SELECT 1 FROM public.k3_daily_closes c CROSS JOIN LATERAL jsonb_array_elements(c.snapshot->''results'') s WHERE s->>''action_id''=_action::text) OR EXISTS(');
 END IF;
 EXECUTE def;
 END LOOP;
END$patch$;
CREATE OR REPLACE FUNCTION private.k3_result_eligible(_kpi uuid,_official boolean) RETURNS SETOF public.k3_kpi_results LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
 SELECT r.* FROM public.k3_kpi_results r JOIN public.k3_kpis k ON k.id=r.kpi_id LEFT JOIN public.k3_actions a ON a.id=r.action_id JOIN public.k3_goals g ON g.id=r.goal_id LEFT JOIN LATERAL (
 SELECT snapshot FROM (SELECT c.snapshot,c.confirmed_at AS at,c.id FROM public.k3_kpi_day_confirmations c WHERE c.user_id=r.user_id AND c.work_date=r.work_date AND c.source='manual' UNION ALL SELECT d.snapshot->'results',d.closed_at,d.id FROM public.k3_daily_closes d WHERE d.user_id=r.user_id AND d.work_date=r.work_date) c ORDER BY at DESC,id DESC LIMIT 1
 ) c ON true WHERE r.kpi_id=_kpi AND r.deleted_at IS NULL AND r.review_reason IS NULL AND g.deleted_at IS NULL AND (a.id IS NULL OR a.deleted_at IS NULL) AND NOT EXISTS(SELECT 1 FROM public.k3_data_reviews v WHERE v.status='pending' AND ((v.kind='kpi' AND v.record_id=r.kpi_id) OR (v.kind='goal' AND v.record_id=r.goal_id) OR (v.kind='action' AND v.record_id=r.action_id))) AND (NOT _official OR EXISTS(SELECT 1 FROM jsonb_array_elements(c.snapshot) s WHERE s->>'id'=r.id::text AND (s->>'revision')::bigint=r.revision))
$fn$;
DO $patch$ DECLARE def text; BEGIN
 def:=pg_get_functiondef('public.k3_kpi_day_read(date)'::regprocedure);
 def:=replace(def,'''confirmed_at'',c.confirmed_at,''needs_confirmation'',c.id IS NOT NULL AND c.snapshot<>rows', '''confirmed_at'',coalesce(c.confirmed_at,(SELECT closed_at FROM k3_daily_closes WHERE user_id=uid AND work_date=_date)),''needs_confirmation'',coalesce((SELECT snapshot FROM (SELECT x.snapshot,x.confirmed_at AS at,x.id FROM k3_kpi_day_confirmations x WHERE x.user_id=uid AND x.work_date=_date UNION ALL SELECT x.snapshot->''results'',x.closed_at,x.id FROM k3_daily_closes x WHERE x.user_id=uid AND x.work_date=_date) x ORDER BY at DESC,id DESC LIMIT 1)<>rows,false)');
 EXECUTE def;
END$patch$;
CREATE OR REPLACE FUNCTION public.k3_zalo_report_claim() RETURNS SETOF public.k3_zalo_reports LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
BEGIN
 UPDATE k3_zalo_reports SET status='unknown',error='Tiến trình gửi gián đoạn; cần đối soát, không gửi lại.' WHERE status='sending' AND attempted_at<now()-interval '20 minutes';
 UPDATE k3_zalo_reports r SET status='skipped',error='Cấu hình nhận báo cáo đã thay đổi; không tự chuyển người nhận.' FROM k3_automation_config c WHERE c.id AND r.status='pending' AND (NOT c.zalo_enabled OR r.group_id IS DISTINCT FROM c.group_id OR r.scope_kind IS DISTINCT FROM c.scope_kind OR r.scope_id IS DISTINCT FROM c.scope_id);
 RETURN QUERY WITH chosen AS (SELECT r.id FROM k3_zalo_reports r JOIN k3_automation_config c ON c.id WHERE r.status='pending' AND c.zalo_enabled AND r.group_id=c.group_id AND r.scope_kind=c.scope_kind AND r.scope_id IS NOT DISTINCT FROM c.scope_id ORDER BY r.created_at LIMIT 5 FOR UPDATE OF r SKIP LOCKED) UPDATE k3_zalo_reports r SET status='sending',lease=gen_random_uuid(),attempted_at=now() WHERE r.id IN(SELECT id FROM chosen) RETURNING r.*;
END$fn$;