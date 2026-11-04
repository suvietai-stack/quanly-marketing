CREATE FUNCTION private.k3_result_eligible(_kpi uuid,_official boolean) RETURNS SETOF public.k3_kpi_results LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
 SELECT r.* FROM public.k3_kpi_results r JOIN public.k3_kpis k ON k.id=r.kpi_id LEFT JOIN public.k3_actions a ON a.id=r.action_id JOIN public.k3_goals g ON g.id=r.goal_id LEFT JOIN LATERAL (SELECT * FROM public.k3_kpi_day_confirmations c WHERE c.user_id=r.user_id AND c.work_date=r.work_date ORDER BY c.confirmed_at DESC,c.id DESC LIMIT 1) c ON true WHERE r.kpi_id=_kpi AND r.deleted_at IS NULL AND r.review_reason IS NULL AND g.deleted_at IS NULL AND (a.id IS NULL OR a.deleted_at IS NULL) AND NOT EXISTS(SELECT 1 FROM public.k3_data_reviews v WHERE v.status='pending' AND ((v.kind='kpi' AND v.record_id=r.kpi_id) OR (v.kind='goal' AND v.record_id=r.goal_id) OR (v.kind='action' AND v.record_id=r.action_id))) AND (NOT _official OR EXISTS(SELECT 1 FROM jsonb_array_elements(c.snapshot) s WHERE s->>'id'=r.id::text AND (s->>'revision')::bigint=r.revision))
$fn$;
REVOKE ALL ON FUNCTION private.k3_result_eligible(uuid,boolean) FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION private.k3_result_metric(_kpi uuid,_official boolean DEFAULT false) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE k public.k3_kpis; x numeric; n int; den numeric; num numeric; tar numeric; attained boolean; pct numeric;
BEGIN
 SELECT * INTO k FROM public.k3_kpis WHERE id=_kpi; IF k.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy KPI.'; END IF;
 SELECT count(*)::int,sum(value),sum(numerator),sum(denominator) INTO n,x,num,den FROM private.k3_result_eligible(_kpi,_official);
 IF n=0 THEN x:=NULL;
 ELSIF k.measure IN ('ratio','average') THEN x:=CASE WHEN den>0 THEN num/den*CASE WHEN k.measure='ratio' THEN 100 ELSE 1 END ELSE NULL END;
 ELSIF k.measure='current' THEN SELECT value INTO x FROM private.k3_result_eligible(_kpi,_official) ORDER BY work_date DESC,updated_at DESC,id DESC LIMIT 1;
 ELSIF k.measure IN ('distinct','milestone') THEN SELECT count(DISTINCT item)::numeric INTO x FROM private.k3_result_eligible(_kpi,_official) r CROSS JOIN LATERAL jsonb_array_elements_text(CASE WHEN k.measure='distinct' THEN r.objects ELSE r.completed END) item WHERE k.measure='distinct' OR k.milestones ? item;
 END IF;
 tar:=CASE WHEN k.measure='milestone' THEN nullif(jsonb_array_length(k.milestones),0) ELSE k.target END;
 IF x IS NOT NULL AND tar IS NOT NULL THEN attained:=CASE k.condition WHEN 'gte' THEN x>=tar WHEN 'lte' THEN x<=tar WHEN 'eq' THEN x=tar WHEN 'range' THEN CASE WHEN k.target_max IS NULL THEN NULL ELSE x BETWEEN tar AND k.target_max END END; END IF;
 pct:=CASE WHEN x IS NOT NULL AND tar>0 AND k.condition='gte' THEN round(x/tar*100,2) ELSE NULL END;
 RETURN jsonb_build_object('actual',x,'progress',pct,'attained',attained,'status',CASE WHEN n=0 THEN 'not_started' WHEN attained THEN 'done' ELSE 'in_progress' END,'result_count',n,'aggregation',CASE WHEN k.measure='current' THEN 'latest_current' ELSE 'shared_kpi_contributions' END);
END$fn$;
-- A day snapshot must not leak unrelated goals when a manager sees only one goal.
DROP POLICY k3_result_confirm_read ON public.k3_kpi_day_confirmations;
CREATE POLICY k3_result_confirm_read ON public.k3_kpi_day_confirmations FOR SELECT TO authenticated USING (user_id=auth.uid() OR public.biz_admin(auth.uid()));
CREATE FUNCTION public.k3_kpi_configure(_payload jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE p jsonb:=_payload; k public.k3_kpis; kid uuid:=nullif(p->>'id','')::uuid; aid uuid:=nullif(p->>'action_id','')::uuid; gid uuid:=nullif(p->>'goal_id','')::uuid; key uuid:=nullif(p->>'request_key','')::uuid; perm uuid; measure text:=coalesce(p->>'measure','cumulative'); condition text:=coalesce(p->>'condition','gte'); target numeric:=nullif(p->>'target','')::numeric; upper_target numeric:=nullif(p->>'target_max','')::numeric; milestones jsonb:=coalesce(p->'milestones','[]'::jsonb);
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
 IF kid IS NOT NULL THEN SELECT * INTO k FROM public.k3_kpis WHERE id=kid FOR UPDATE; IF k.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy KPI.'; END IF; aid:=k.action_id; gid:=k.goal_id; END IF;
 IF aid IS NOT NULL THEN SELECT goal_id INTO perm FROM public.k3_actions WHERE id=aid; ELSE perm:=gid; END IF;
 IF perm IS NULL OR NOT private.k3_goal_manage_ok(auth.uid(),perm) THEN RAISE EXCEPTION 'Bạn không có quyền cấu hình KPI.'; END IF;
 IF EXISTS(SELECT 1 FROM public.k3_goals WHERE id=perm AND deleted_at IS NOT NULL) OR EXISTS(SELECT 1 FROM public.k3_actions WHERE id=aid AND deleted_at IS NOT NULL) OR EXISTS(SELECT 1 FROM public.k3_data_reviews v WHERE status='pending' AND record_id IN (perm,aid,kid)) THEN RAISE EXCEPTION 'KG/KF/KPI đang lưu trữ hoặc chờ rà soát.'; END IF;
 IF kid IS NOT NULL AND EXISTS(SELECT 1 FROM public.k3_kpi_results WHERE kpi_id=kid) THEN RAISE EXCEPTION 'KPI đã có kết quả. Không được đổi công thức hồi tố.'; END IF;
 IF btrim(coalesce(p->>'name',''))='' OR measure NOT IN ('cumulative','distinct','current','ratio','average','milestone','duration') OR condition NOT IN ('gte','lte','eq','range') THEN RAISE EXCEPTION 'Tên hoặc phương thức/điều kiện KPI không hợp lệ.'; END IF;
 IF measure<>'milestone' AND (target IS NULL OR target<0 OR target::text IN ('NaN','Infinity','-Infinity')) THEN RAISE EXCEPTION 'Chỉ tiêu cần là số không âm hữu hạn.'; END IF;
 IF condition='range' AND (upper_target IS NULL OR upper_target<target OR upper_target::text IN ('NaN','Infinity','-Infinity')) THEN RAISE EXCEPTION 'Khoảng chỉ tiêu không hợp lệ.'; END IF;
 IF jsonb_typeof(milestones)<>'array' OR (measure='milestone' AND (jsonb_array_length(milestones)=0 OR EXISTS(SELECT 1 FROM jsonb_array_elements(milestones) x WHERE jsonb_typeof(x)<>'string' OR btrim(x#>>'{}')=''))) THEN RAISE EXCEPTION 'Mốc cần danh sách tiêu chí hợp lệ.'; END IF;
 IF kid IS NULL THEN
 IF key IS NULL THEN RAISE EXCEPTION 'Thiếu mã yêu cầu.'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('k3config'),hashtext(key::text));
 SELECT * INTO k FROM public.k3_kpis WHERE request_key=key;
 IF k.id IS NOT NULL THEN IF coalesce(k.goal_id,(SELECT goal_id FROM public.k3_actions WHERE id=k.action_id))<>perm THEN RAISE EXCEPTION 'Mã yêu cầu thuộc hồ sơ khác.'; END IF; RETURN to_jsonb(k); END IF;
 INSERT INTO public.k3_kpis(goal_id,action_id,name,kind,measure,condition,target,target_max,unit,required,milestones,created_by,request_key) VALUES(CASE WHEN aid IS NULL THEN gid END,aid,btrim(p->>'name'),CASE WHEN measure IN ('ratio','milestone') THEN measure ELSE 'cumulative' END,measure,condition,target,upper_target,CASE WHEN measure='duration' THEN 'phút' ELSE nullif(btrim(p->>'unit'),'') END,coalesce((p->>'required')::boolean,true),milestones,auth.uid(),key) RETURNING * INTO k;
 ELSE UPDATE public.k3_kpis SET name=btrim(p->>'name'),measure=measure,condition=condition,target=target,target_max=upper_target,unit=CASE WHEN measure='duration' THEN 'phút' ELSE nullif(btrim(p->>'unit'),'') END,required=coalesce((p->>'required')::boolean,true),milestones=milestones,updated_at=now() WHERE id=kid RETURNING * INTO k; END IF;
 RETURN to_jsonb(k);
END$fn$;
REVOKE ALL ON FUNCTION public.k3_kpi_configure(jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.k3_kpi_configure(jsonb) TO authenticated;
COMMENT ON TABLE public.k3_kpi_results IS 'Canonical daily total per KPI/performer/date. UI writes are RPC-only. Shared KPI contributions aggregate by measurement, not by displayed copies. Current measurement selects latest dated observation.';