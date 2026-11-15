-- Filter inexpensive performer/date candidates before evaluating official KPI eligibility.
-- Keep all native permission, historical scope and confirmation checks unchanged.
CREATE OR REPLACE FUNCTION public.k3_measured_period_read(_start date, _end date, _manage boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE uid uuid:=auth.uid(); people jsonb;
BEGIN
 IF uid IS NULL OR NOT public.k3_can(uid,CASE WHEN _manage THEN 'k3.view_scope' ELSE 'k3.use' END) THEN RAISE EXCEPTION 'Bạn không có quyền xem 3K trong phạm vi này.'; END IF;
 IF _end<_start OR _end-_start>366 THEN RAISE EXCEPTION 'Khoảng ngày không hợp lệ.'; END IF;
 SELECT coalesce(jsonb_agg(jsonb_build_object('user_id',p.id,'name',p.full_name,'department_id',dep.id,'department',dep.name,
 'updated',EXISTS(SELECT 1 FROM k3_kpi_results r JOIN k3_goals g ON g.id=r.goal_id WHERE r.user_id=p.id AND r.work_date BETWEEN _start AND _end AND r.deleted_at IS NULL AND r.review_reason IS NULL AND (p.id=uid OR public.biz_admin(uid) OR public.biz_scope_ok(uid,p.id,coalesce(g.department_id,public.biz_department_at(p.id,r.work_date)),r.work_date::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh'))),
 'closes',(SELECT count(*) FROM k3_daily_closes c WHERE c.user_id=p.id AND c.work_date BETWEEN _start AND _end AND (p.id=uid OR public.biz_admin(uid) OR public.biz_scope_ok(uid,p.id,c.department_id,c.work_date::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh'))),
 'kpis',coalesce((WITH candidate_kpis AS MATERIALIZED (
 SELECT DISTINCT r.kpi_id FROM public.k3_kpi_results r
 WHERE r.user_id=p.id AND r.work_date BETWEEN _start AND _end
 AND r.deleted_at IS NULL AND r.review_reason IS NULL
 ) SELECT jsonb_agg(jsonb_build_object('id',k.id,'name',k.name,'unit',k.unit,'measure',k.measure,'target',k.target,'goal_name',g.name,'action_name',a.name,'metric',private.k3_result_metric_range(k.id,false,_start,_end,p.id),'official_metric',private.k3_result_metric_range(k.id,true,_start,_end,p.id))) FROM candidate_kpis ck JOIN k3_kpis k ON k.id=ck.kpi_id LEFT JOIN k3_actions a ON a.id=k.action_id JOIN k3_goals g ON g.id=coalesce(k.goal_id,a.goal_id) WHERE g.deleted_at IS NULL AND (a.id IS NULL OR a.deleted_at IS NULL) AND NOT EXISTS(SELECT 1 FROM k3_data_reviews v WHERE v.status='pending' AND v.record_id IN(k.id,g.id,a.id)) AND EXISTS(SELECT 1 FROM private.k3_result_eligible_range(k.id,false,_start,_end,p.id))),'[]'::jsonb)
 ) ORDER BY p.full_name),'[]'::jsonb) INTO people FROM profiles p LEFT JOIN biz_departments dep ON dep.id=public.biz_department_at(p.id,_end) WHERE CASE WHEN NOT _manage THEN p.id=uid ELSE p.id<>uid AND (public.biz_admin(uid) OR public.biz_scope_ok(uid,p.id,dep.id,_end::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')) AND public.k3_can(p.id,'k3.use') END;
 RETURN people;
END$function$;
