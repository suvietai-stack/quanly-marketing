CREATE FUNCTION private.k3_measure_eval(_k jsonb,_rows jsonb,_date date) RETURNS jsonb LANGUAGE plpgsql IMMUTABLE SET search_path=public AS $fn$
DECLARE mode text:=_k->>'measure'; cfg jsonb:=coalesce(_k->'config','{}'); tar numeric:=nullif(_k->>'target','')::numeric; upper_tar numeric:=nullif(_k->>'target_max','')::numeric; cond text:=coalesce(_k->>'condition','gte'); x numeric; num numeric; den numeric; total numeric; pct numeric; attained boolean; n int; pending int; rows jsonb:=coalesce(_rows,'[]'); scoped jsonb; ids jsonb; m jsonb; milestone_count int; weight_total numeric; weight_done numeric; lo date; hi date; d date; streak int:=0; longest int:=0; yes boolean; tol numeric:=coalesce((cfg->>'tolerance')::numeric,0); baseline numeric:=nullif(cfg->>'baseline','')::numeric;
BEGIN
 SELECT count(*),sum((r->>'value')::numeric),sum((r->>'numerator')::numeric),sum((r->>'denominator')::numeric),count(*) FILTER(WHERE coalesce((cfg->>'acceptance_required')::boolean,false) AND coalesce(r->>'acceptance','')<>'accepted') INTO n,total,num,den,pending FROM jsonb_array_elements(rows) r;
 IF coalesce((cfg->>'acceptance_required')::boolean,false) THEN SELECT coalesce(jsonb_agg(r),'[]') INTO rows FROM jsonb_array_elements(rows) r WHERE r->>'acceptance'='accepted'; END IF;
 scoped:=rows;
 IF mode='frequency' THEN
 lo:=CASE cfg->>'cycle' WHEN 'month' THEN date_trunc('month',_date)::date WHEN 'week' THEN date_trunc('week',_date)::date ELSE _date END;
 hi:=CASE cfg->>'cycle' WHEN 'month' THEN (lo+interval '1 month'-interval '1 day')::date WHEN 'week' THEN lo+6 ELSE lo END;
 SELECT coalesce(jsonb_agg(r),'[]') INTO scoped FROM jsonb_array_elements(rows) r WHERE (r->>'work_date')::date BETWEEN greatest(lo,(cfg->>'start_date')::date) AND least(hi,(cfg->>'end_date')::date);
 END IF;
 IF mode IN('cumulative','duration','frequency') THEN SELECT sum((r->>'value')::numeric) INTO x FROM jsonb_array_elements(scoped) r; IF x IS NOT NULL AND mode='cumulative' THEN x:=x+coalesce(baseline,0); END IF;
 ELSIF mode IN('current','binary') THEN SELECT (r->>'value')::numeric INTO x FROM jsonb_array_elements(scoped) r ORDER BY r->>'work_date' DESC,r->>'updated_at' DESC,r->>'id' DESC LIMIT 1;
 ELSIF mode IN('ratio','average') THEN SELECT sum((r->>'numerator')::numeric),sum((r->>'denominator')::numeric) INTO num,den FROM jsonb_array_elements(scoped) r; x:=CASE WHEN den>0 THEN num/den*CASE WHEN mode='ratio' THEN 100 ELSE 1 END ELSE NULL END;
 ELSIF mode='distinct' THEN IF jsonb_array_length(scoped)>0 THEN SELECT count(DISTINCT CASE WHEN cfg->>'normalization'='trim_lower' THEN lower(btrim(item)) ELSE item END)::numeric INTO x FROM jsonb_array_elements(scoped) r CROSS JOIN LATERAL jsonb_array_elements_text(r->'objects') item; END IF;
 ELSIF mode='milestone' THEN
 SELECT coalesce(jsonb_agg(DISTINCT item),'[]') INTO ids FROM jsonb_array_elements(scoped) r CROSS JOIN LATERAL jsonb_array_elements_text(r->'completed') item;
 milestone_count:=jsonb_array_length(coalesce(cfg->'milestones',_k->'milestones','[]'));
 IF jsonb_array_length(scoped)>0 THEN SELECT count(*)::numeric INTO x FROM jsonb_array_elements_text(coalesce(_k->'milestones','[]')) item WHERE ids ? item; END IF;
 tar:=milestone_count;
 IF cfg ? 'milestones' THEN
 SELECT sum((item->>'weight')::numeric),sum((item->>'weight')::numeric) FILTER(WHERE ids ? (item->>'id')) INTO weight_total,weight_done FROM jsonb_array_elements(cfg->'milestones') item;
 IF weight_total>0 THEN pct:=round(coalesce(weight_done,0)/weight_total*100,2); ELSE pct:=CASE WHEN x IS NOT NULL AND tar>0 THEN round(x/tar*100,2) END; END IF;
 attained:=jsonb_array_length(scoped)>0 AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements(cfg->'milestones') item WHERE coalesce((item->>'required')::boolean,true) AND NOT ids ? (item->>'id')) AND EXISTS(SELECT 1 FROM jsonb_array_elements(cfg->'milestones') item WHERE coalesce((item->>'required')::boolean,true));
 END IF;
 ELSIF mode='streak' THEN
 lo:=(cfg->>'start_date')::date; hi:=least(_date,(cfg->>'end_date')::date);
 IF lo IS NOT NULL AND hi IS NOT NULL AND hi>=lo THEN
 FOR d IN SELECT generate_series(lo,hi,interval '1 day')::date LOOP
 IF NOT cfg ? 'weekdays' OR cfg->'weekdays' @> jsonb_build_array(extract(isodow FROM d)::int) THEN
 SELECT coalesce(bool_or((r->>'value')::numeric=1),false) INTO yes FROM jsonb_array_elements(scoped) r WHERE (r->>'work_date')::date=d;
 IF yes THEN streak:=streak+1; longest:=greatest(longest,streak); ELSE streak:=0; END IF;
 END IF;
 END LOOP; x:=streak;
 END IF;
 END IF;
 IF x IS NOT NULL AND tar IS NOT NULL AND attained IS NULL THEN attained:=CASE cond WHEN 'gte' THEN x>=tar-tol WHEN 'lte' THEN x<=tar+tol WHEN 'eq' THEN abs(x-tar)<=tol WHEN 'range' THEN CASE WHEN upper_tar IS NULL THEN NULL ELSE x BETWEEN tar-tol AND upper_tar+tol END END; END IF;
 IF mode='current' AND cond='lte' AND baseline IS NOT NULL AND baseline>tar AND x IS NOT NULL THEN pct:=round(greatest(0,(baseline-x)/(baseline-tar)*100),2);
 ELSIF pct IS NULL AND x IS NOT NULL AND tar>0 AND cond='gte' THEN pct:=round(x/tar*100,2); END IF;
 IF pending>0 AND coalesce((cfg->>'acceptance_required')::boolean,false) THEN attained:=false; END IF;
 RETURN jsonb_build_object('actual',x,'progress',pct,'attained',attained,'status',CASE WHEN n=0 THEN 'not_started' WHEN attained THEN 'done' ELSE 'in_progress' END,'result_count',n,'numerator',num,'denominator',den,'total_actual',total,'longest_streak',longest,'cycle_start',lo,'cycle_end',hi,'pending_acceptance',pending,'milestone_total',milestone_count);
END $fn$;
REVOKE ALL ON FUNCTION private.k3_measure_eval(jsonb,jsonb,date) FROM PUBLIC,anon,authenticated;
CREATE FUNCTION private.k3_measure_rows(_kpi uuid,_official boolean) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
 SELECT coalesce(jsonb_agg(to_jsonb(r)||jsonb_build_object('acceptance',(SELECT a.decision FROM k3_kpi_acceptances a WHERE a.result_id=r.id AND a.result_revision=r.revision ORDER BY a.created_at DESC,a.id DESC LIMIT 1))),'[]') FROM private.k3_result_eligible(_kpi,_official) r
$fn$;
REVOKE ALL ON FUNCTION private.k3_measure_rows(uuid,boolean) FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION private.k3_result_metric(_kpi uuid,_official boolean DEFAULT false) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE k k3_kpis; BEGIN SELECT * INTO k FROM k3_kpis WHERE id=_kpi; IF k.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy KPI.'; END IF; RETURN private.k3_measure_eval(to_jsonb(k),private.k3_measure_rows(_kpi,_official),(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date); END $fn$;
CREATE OR REPLACE FUNCTION private.k3_result_metric_range(_kpi uuid,_official boolean,_start date,_end date,_user uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE k k3_kpis; rows jsonb; BEGIN SELECT * INTO k FROM k3_kpis WHERE id=_kpi; SELECT coalesce(jsonb_agg(to_jsonb(r)||jsonb_build_object('acceptance',(SELECT a.decision FROM k3_kpi_acceptances a WHERE a.result_id=r.id AND a.result_revision=r.revision ORDER BY a.created_at DESC,a.id DESC LIMIT 1))),'[]') INTO rows FROM private.k3_result_eligible_range(_kpi,_official,_start,_end,_user) r;
 RETURN private.k3_measure_eval(to_jsonb(k),rows,_end); END $fn$;
CREATE FUNCTION public.k3_kpi_accept(_result uuid,_revision bigint,_decision text,_reason text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE r k3_kpi_results; k k3_kpis; a k3_kpi_acceptances;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
 SELECT * INTO r FROM k3_kpi_results WHERE id=_result;
 IF r.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy kết quả.'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('k3owner'),hashtext(r.user_id::text)); PERFORM pg_advisory_xact_lock(hashtext('k3result'),hashtext(r.kpi_id::text));
 SELECT * INTO r FROM k3_kpi_results WHERE id=_result FOR UPDATE;
 IF NOT public.biz_admin(auth.uid()) AND (auth.uid()=r.user_id OR NOT public.k3_can(auth.uid(),'k3.view_scope') OR NOT public.biz_scope_ok(auth.uid(),r.user_id,public.biz_department_at(r.user_id,r.work_date),r.work_date::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')) THEN RAISE EXCEPTION 'Bạn không có quyền nghiệm thu trong phạm vi này.'; END IF;
 PERFORM private.k3_write_guard(r.work_date);
 IF r.revision<>_revision OR r.deleted_at IS NOT NULL OR r.review_reason IS NOT NULL THEN RAISE EXCEPTION 'Kết quả đã thay đổi hoặc đang lưu trữ.'; END IF;
 SELECT * INTO k FROM k3_kpis WHERE id=r.kpi_id;
 IF NOT coalesce((k.config->>'acceptance_required')::boolean,false) THEN RAISE EXCEPTION 'KPI không yêu cầu nghiệm thu.'; END IF;
 IF _decision NOT IN('accepted','rejected') OR nullif(btrim(_reason),'') IS NULL THEN RAISE EXCEPTION 'Cần quyết định và lý do nghiệm thu.'; END IF;
 INSERT INTO k3_kpi_acceptances(result_id,result_revision,decision,actor_id,reason) VALUES(r.id,r.revision,_decision,auth.uid(),btrim(_reason)) RETURNING * INTO a;
 INSERT INTO k3_plan_events(user_id,goal_id,action_id,actor_id,action,detail) VALUES(r.user_id,r.goal_id,r.action_id,auth.uid(),'kpi_acceptance',to_jsonb(a)); RETURN to_jsonb(a);
END $fn$;
REVOKE ALL ON FUNCTION public.k3_kpi_accept(uuid,bigint,text,text) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.k3_kpi_accept(uuid,bigint,text,text) TO authenticated;
CREATE FUNCTION public.k3_kpi_result_preview(_kpi uuid,_date date,_payload jsonb) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE k k3_kpis; rows jsonb; p jsonb:=_payload;
BEGIN
 SELECT * INTO k FROM k3_kpis WHERE id=_kpi;
 IF auth.uid() IS NULL OR NOT private.k3_result_can_write(auth.uid(),_kpi) THEN RAISE EXCEPTION 'Bạn không có quyền cập nhật KPI.'; END IF;
 SELECT coalesce(jsonb_agg(r),'[]') INTO rows FROM jsonb_array_elements(private.k3_measure_rows(_kpi,false)) r WHERE NOT(r->>'user_id'=auth.uid()::text AND r->>'work_date'=_date::text);
 IF k.measure='duration' AND k.config->>'duration_unit'='hours' AND coalesce(k.config->>'duration_method','total')='total' THEN p:=p||jsonb_build_object('value',(p->>'value')::numeric*60); END IF;
 RETURN private.k3_measure_eval(to_jsonb(k),rows||jsonb_build_array(p||jsonb_build_object('user_id',auth.uid(),'work_date',_date,'updated_at',now(),'acceptance',NULL)),_date);
END $fn$;
REVOKE ALL ON FUNCTION public.k3_kpi_result_preview(uuid,date,jsonb) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.k3_kpi_result_preview(uuid,date,jsonb) TO authenticated;