-- Run as a privileged migration/test connection. All changes roll back.
BEGIN;
CREATE FUNCTION pg_temp.k3_normalize(value jsonb) RETURNS jsonb LANGUAGE sql AS $$
 SELECT coalesce(jsonb_agg((p-'kpis')||jsonb_build_object('kpis',
   coalesce((SELECT jsonb_agg(k ORDER BY k->>'id') FROM jsonb_array_elements(p->'kpis') k),'[]'::jsonb))
   ORDER BY p->>'user_id'),'[]'::jsonb) FROM jsonb_array_elements(value) p
$$;
CREATE TEMP TABLE k3_cases(actor uuid,start_date date,end_date date,manage boolean);
-- Use existing accounts only, never insert test users or alter permissions.
INSERT INTO k3_cases
SELECT id,current_date,current_date,true FROM profiles WHERE public.is_super_admin(id) LIMIT 1;
INSERT INTO k3_cases
SELECT id,date_trunc('month',current_date)::date,(date_trunc('month',current_date)+interval '1 month - 1 day')::date,true
FROM profiles WHERE public.k3_can(id,'k3.view_scope') AND NOT public.biz_admin(id) LIMIT 1;
INSERT INTO k3_cases SELECT id,current_date,current_date,false FROM profiles WHERE private.is_active(id) AND NOT public.k3_can(id,'k3.view_scope') LIMIT 1;
CREATE TEMP TABLE k3_expected AS SELECT *,NULL::jsonb result FROM k3_cases;
DO $$ DECLARE c record; BEGIN
 FOR c IN SELECT * FROM k3_expected LOOP
 PERFORM set_config('request.jwt.claim.sub',c.actor::text,true);
 UPDATE k3_expected SET result=pg_temp.k3_normalize(public.k3_measured_period_read(c.start_date,c.end_date,c.manage))
 WHERE actor=c.actor AND manage=c.manage;
 END LOOP;
END $$;
-- Apply the candidate filter inside this test transaction.
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

DO $$ DECLARE c record; actual jsonb; BEGIN
 FOR c IN SELECT * FROM k3_expected LOOP
 PERFORM set_config('request.jwt.claim.sub',c.actor::text,true);
 actual:=pg_temp.k3_normalize(public.k3_measured_period_read(c.start_date,c.end_date,c.manage));
 IF actual IS DISTINCT FROM c.result THEN RAISE EXCEPTION '3K period regression for %',c.actor; END IF;
 END LOOP;
 -- Missing authentication must still be rejected.
 PERFORM set_config('request.jwt.claim.sub','',true);
 BEGIN
  PERFORM public.k3_measured_period_read(current_date,current_date,true);
  RAISE EXCEPTION 'Unauthenticated management read allowed' USING ERRCODE='XX000';
 EXCEPTION WHEN raise_exception THEN NULL;
 END;
 -- A non-manager must still be rejected by the management endpoint.
 SELECT actor INTO c FROM k3_expected WHERE NOT manage LIMIT 1;
 IF c.actor IS NOT NULL THEN
  PERFORM set_config('request.jwt.claim.sub',c.actor::text,true);
  BEGIN
   PERFORM public.k3_measured_period_read(current_date,current_date,true);
   RAISE EXCEPTION 'Management read unexpectedly allowed' USING ERRCODE='XX000';
  EXCEPTION WHEN raise_exception THEN NULL;
  END;
 END IF;
END $$;
SELECT count(*) passed_equivalence_cases FROM k3_expected;
ROLLBACK;
