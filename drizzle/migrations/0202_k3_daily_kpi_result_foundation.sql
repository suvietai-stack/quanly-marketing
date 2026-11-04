-- Additive canonical KPI result source; legacy tasks, timestamps and official snapshots remain untouched.
ALTER TABLE public.k3_kpis ADD COLUMN measure text NOT NULL DEFAULT 'cumulative', ADD COLUMN condition text NOT NULL DEFAULT 'gte', ADD COLUMN target_max numeric, ADD COLUMN required boolean NOT NULL DEFAULT true, ADD COLUMN milestones jsonb NOT NULL DEFAULT '[]'::jsonb;
UPDATE public.k3_kpis SET measure=kind;
ALTER TABLE public.k3_kpis ADD CONSTRAINT k3_measure_check CHECK (measure IN ('cumulative','distinct','current','ratio','average','milestone','duration')), ADD CONSTRAINT k3_condition_check CHECK (condition IN ('gte','lte','eq','range'));
CREATE TABLE public.k3_kpi_results (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), kpi_id uuid NOT NULL REFERENCES public.k3_kpis(id), goal_id uuid NOT NULL REFERENCES public.k3_goals(id), action_id uuid REFERENCES public.k3_actions(id), user_id uuid NOT NULL, work_date date NOT NULL, value numeric, numerator numeric, denominator numeric, objects jsonb NOT NULL DEFAULT '[]'::jsonb, completed jsonb NOT NULL DEFAULT '[]'::jsonb, evidence text, note text, problem text, cause text, solution text, revision bigint NOT NULL DEFAULT 1, updated_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), review_reason text, deleted_at timestamptz, UNIQUE(kpi_id,user_id,work_date)
);
GRANT SELECT ON public.k3_kpi_results TO authenticated; GRANT ALL ON public.k3_kpi_results TO service_role;
ALTER TABLE public.k3_kpi_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY k3_result_read ON public.k3_kpi_results FOR SELECT TO authenticated USING (public.k3_goal_visible(auth.uid(),goal_id));
CREATE TABLE public.k3_kpi_result_versions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), result_id uuid NOT NULL REFERENCES public.k3_kpi_results(id), revision bigint NOT NULL, snapshot jsonb NOT NULL, request_key uuid NOT NULL, actor_id uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(result_id,revision), UNIQUE(actor_id,request_key)
);
GRANT SELECT ON public.k3_kpi_result_versions TO authenticated; GRANT ALL ON public.k3_kpi_result_versions TO service_role;
ALTER TABLE public.k3_kpi_result_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY k3_result_version_read ON public.k3_kpi_result_versions FOR SELECT TO authenticated USING (EXISTS(SELECT 1 FROM public.k3_kpi_results r WHERE r.id=result_id AND public.k3_goal_visible(auth.uid(),r.goal_id)));
CREATE TABLE public.k3_kpi_day_confirmations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, work_date date NOT NULL, snapshot jsonb NOT NULL, confirmed_at timestamptz NOT NULL DEFAULT now(), actor_id uuid NOT NULL
);
GRANT SELECT ON public.k3_kpi_day_confirmations TO authenticated; GRANT ALL ON public.k3_kpi_day_confirmations TO service_role;
ALTER TABLE public.k3_kpi_day_confirmations ENABLE ROW LEVEL SECURITY;
CREATE POLICY k3_result_confirm_read ON public.k3_kpi_day_confirmations FOR SELECT TO authenticated USING (user_id=auth.uid() OR public.biz_admin(auth.uid()) OR EXISTS(SELECT 1 FROM public.k3_kpi_results r WHERE r.user_id=k3_kpi_day_confirmations.user_id AND r.work_date=k3_kpi_day_confirmations.work_date AND public.k3_goal_visible(auth.uid(),r.goal_id)));
CREATE TABLE public.k3_data_reviews (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), kind text NOT NULL CHECK(kind IN ('goal','action','kpi','task')), record_id uuid NOT NULL, reason text NOT NULL, original_snapshot jsonb NOT NULL, status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','resolved','delete_confirmed')), created_at timestamptz NOT NULL DEFAULT now(), resolved_at timestamptz, resolved_by uuid, resolution_note text, UNIQUE(kind,record_id)
);
GRANT SELECT ON public.k3_data_reviews TO authenticated; GRANT ALL ON public.k3_data_reviews TO service_role;
ALTER TABLE public.k3_data_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY k3_reviews_admin ON public.k3_data_reviews FOR SELECT TO authenticated USING(public.biz_admin(auth.uid()));
COMMENT ON TABLE public.k3_data_reviews IS 'Review archive is not trash: pending rows never enter the 15-day purge. No legacy conversion is executed by this migration.';
CREATE FUNCTION private.k3_result_can_write(_uid uuid,_kpi uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
 SELECT EXISTS(SELECT 1 FROM public.k3_kpis k LEFT JOIN public.k3_actions a ON a.id=k.action_id JOIN public.k3_goals g ON g.id=coalesce(k.goal_id,a.goal_id) WHERE k.id=_kpi AND _uid IS NOT NULL AND public.k3_can(_uid,'k3.use') AND g.deleted_at IS NULL AND (a.id IS NULL OR a.deleted_at IS NULL) AND g.status NOT IN ('draft','paused','cancelled','ended_missed') AND (a.id IS NULL OR a.status NOT IN ('draft','paused','cancelled','ended_missed')) AND NOT EXISTS(SELECT 1 FROM public.k3_data_reviews v WHERE v.status='pending' AND ((v.kind='kpi' AND v.record_id=k.id) OR (v.kind='goal' AND v.record_id=g.id) OR (v.kind='action' AND v.record_id=a.id))) AND CASE WHEN a.id IS NOT NULL THEN private.k3_action_worker_ok(_uid,a.id) ELSE g.user_id=_uid OR public.biz_admin(_uid) END)
$fn$;
REVOKE ALL ON FUNCTION private.k3_result_can_write(uuid,uuid) FROM PUBLIC,anon,authenticated;
CREATE FUNCTION private.k3_result_metric(_kpi uuid,_official boolean DEFAULT false) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE k public.k3_kpis; x numeric; n int; den numeric; num numeric; tar numeric; attained boolean; pct numeric;
BEGIN
 SELECT * INTO k FROM public.k3_kpis WHERE id=_kpi;
 IF k.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy KPI.'; END IF;
 WITH latest AS (SELECT DISTINCT ON(user_id,work_date) * FROM public.k3_kpi_day_confirmations ORDER BY user_id,work_date,confirmed_at DESC,id DESC), eligible AS (
 SELECT r.* FROM public.k3_kpi_results r LEFT JOIN latest c ON c.user_id=r.user_id AND c.work_date=r.work_date WHERE r.kpi_id=k.id AND r.deleted_at IS NULL AND r.review_reason IS NULL AND NOT EXISTS(SELECT 1 FROM public.k3_data_reviews v WHERE v.status='pending' AND ((v.kind='kpi' AND v.record_id=r.kpi_id) OR (v.kind='goal' AND v.record_id=r.goal_id) OR (v.kind='action' AND v.record_id=r.action_id))) AND (NOT _official OR EXISTS(SELECT 1 FROM jsonb_array_elements(c.snapshot) s WHERE s->>'id'=r.id::text AND (s->>'revision')::bigint=r.revision))
 ) SELECT count(*)::int,sum(value),sum(numerator),sum(denominator) INTO n,x,num,den FROM eligible;
 IF n=0 THEN x:=NULL;
 ELSIF k.measure IN ('ratio','average') THEN x:=CASE WHEN den>0 THEN num/den*CASE WHEN k.measure='ratio' THEN 100 ELSE 1 END ELSE NULL END;
 ELSIF k.measure='current' THEN
 SELECT r.value INTO x FROM public.k3_kpi_results r WHERE r.kpi_id=k.id AND r.deleted_at IS NULL AND r.review_reason IS NULL AND (NOT _official OR EXISTS(SELECT 1 FROM public.k3_kpi_day_confirmations c WHERE c.id=(SELECT c2.id FROM public.k3_kpi_day_confirmations c2 WHERE c2.user_id=r.user_id AND c2.work_date=r.work_date ORDER BY c2.confirmed_at DESC,c2.id DESC LIMIT 1) AND EXISTS(SELECT 1 FROM jsonb_array_elements(c.snapshot) s WHERE s->>'id'=r.id::text AND (s->>'revision')::bigint=r.revision))) ORDER BY r.work_date DESC,r.updated_at DESC,r.id DESC LIMIT 1;
 ELSIF k.measure IN ('distinct','milestone') THEN
 SELECT count(DISTINCT item)::numeric INTO x FROM public.k3_kpi_results r CROSS JOIN LATERAL jsonb_array_elements_text(CASE WHEN k.measure='distinct' THEN r.objects ELSE r.completed END) item WHERE r.kpi_id=k.id AND r.deleted_at IS NULL AND r.review_reason IS NULL AND (k.measure='distinct' OR k.milestones ? item) AND (NOT _official OR EXISTS(SELECT 1 FROM public.k3_kpi_day_confirmations c WHERE c.id=(SELECT c2.id FROM public.k3_kpi_day_confirmations c2 WHERE c2.user_id=r.user_id AND c2.work_date=r.work_date ORDER BY c2.confirmed_at DESC,c2.id DESC LIMIT 1) AND EXISTS(SELECT 1 FROM jsonb_array_elements(c.snapshot) s WHERE s->>'id'=r.id::text AND (s->>'revision')::bigint=r.revision)));
 END IF;
 tar:=CASE WHEN k.measure='milestone' THEN nullif(jsonb_array_length(k.milestones),0) ELSE k.target END;
 IF x IS NOT NULL AND tar IS NOT NULL THEN attained:=CASE k.condition WHEN 'gte' THEN x>=tar WHEN 'lte' THEN x<=tar WHEN 'eq' THEN x=tar WHEN 'range' THEN CASE WHEN k.target_max IS NULL THEN NULL ELSE x BETWEEN tar AND k.target_max END END; END IF;
 pct:=CASE WHEN x IS NOT NULL AND tar>0 AND k.condition='gte' THEN round(x/tar*100,2) ELSE NULL END;
 RETURN jsonb_build_object('actual',x,'progress',pct,'attained',attained,'status',CASE WHEN n=0 THEN 'not_started' WHEN attained THEN 'done' ELSE 'in_progress' END,'result_count',n);
END$fn$;
REVOKE ALL ON FUNCTION private.k3_result_metric(uuid,boolean) FROM PUBLIC,anon,authenticated;
CREATE FUNCTION public.k3_kpi_result_read(_kpi uuid,_date date) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE k public.k3_kpis; g uuid;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
 SELECT * INTO k FROM public.k3_kpis WHERE id=_kpi; SELECT coalesce(k.goal_id,a.goal_id) INTO g FROM (SELECT 1) dummy LEFT JOIN public.k3_actions a ON a.id=k.action_id;
 IF g IS NULL OR NOT public.k3_goal_visible(auth.uid(),g) THEN RAISE EXCEPTION 'Bạn không có quyền xem KPI.'; END IF;
 RETURN jsonb_build_object('kpi',to_jsonb(k),'can_update',private.k3_result_can_write(auth.uid(),k.id),'metric',private.k3_result_metric(k.id,false),'official_metric',private.k3_result_metric(k.id,true),'daily',(SELECT to_jsonb(r) FROM public.k3_kpi_results r WHERE r.kpi_id=k.id AND r.user_id=auth.uid() AND r.work_date=_date),'results',coalesce((SELECT jsonb_agg(to_jsonb(r)||jsonb_build_object('full_name',p.full_name,'is_confirmed',EXISTS(SELECT 1 FROM jsonb_array_elements(c.snapshot) s WHERE s->>'id'=r.id::text AND (s->>'revision')::bigint=r.revision)) ORDER BY r.work_date,r.updated_at) FROM public.k3_kpi_results r LEFT JOIN public.profiles p ON p.id=r.user_id LEFT JOIN LATERAL (SELECT * FROM public.k3_kpi_day_confirmations c WHERE c.user_id=r.user_id AND c.work_date=r.work_date ORDER BY c.confirmed_at DESC,c.id DESC LIMIT 1) c ON true WHERE r.kpi_id=k.id AND r.deleted_at IS NULL AND r.review_reason IS NULL),'[]'::jsonb),'history',coalesce((SELECT jsonb_agg(to_jsonb(v) ORDER BY v.created_at DESC) FROM public.k3_kpi_result_versions v JOIN public.k3_kpi_results r ON r.id=v.result_id WHERE r.kpi_id=k.id),'[]'::jsonb));
END$fn$;
CREATE FUNCTION public.k3_kpi_result_save(_payload jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE p jsonb:=_payload; uid uuid:=auth.uid(); kid uuid:=nullif(p->>'kpi_id','')::uuid; day date:=nullif(p->>'work_date','')::date; key uuid:=nullif(p->>'request_key','')::uuid; k public.k3_kpis; g public.k3_goals; a public.k3_actions; old public.k3_kpi_results; r public.k3_kpi_results; val numeric:=nullif(p->>'value','')::numeric; num numeric:=nullif(p->>'numerator','')::numeric; den numeric:=nullif(p->>'denominator','')::numeric; arr jsonb; done jsonb;
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
 IF key IS NULL OR day IS NULL OR kid IS NULL THEN RAISE EXCEPTION 'Thiếu KPI, ngày hoặc mã yêu cầu.'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('k3owner'),hashtext(uid::text));
 PERFORM pg_advisory_xact_lock(hashtext('k3result'),hashtext(kid::text));
 IF NOT private.k3_result_can_write(uid,kid) THEN RAISE EXCEPTION 'Bạn không được cập nhật KPI này hoặc KG/KF đang bị khóa/lưu trữ.'; END IF;
 IF EXISTS(SELECT 1 FROM public.k3_kpi_result_versions WHERE actor_id=uid AND request_key=key) THEN RETURN public.k3_kpi_result_read(kid,day); END IF;
 IF day>(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date THEN RAISE EXCEPTION 'Không ghi kết quả cho ngày tương lai.'; END IF;
 PERFORM private.k3_write_guard(day);
 SELECT * INTO k FROM public.k3_kpis WHERE id=kid FOR UPDATE;
 SELECT * INTO a FROM public.k3_actions WHERE id=k.action_id; SELECT * INTO g FROM public.k3_goals WHERE id=coalesce(k.goal_id,a.goal_id);
 IF day<coalesce(a.start_date,g.period_start) OR day>g.period_end THEN RAISE EXCEPTION 'Ngày kết quả ngoài khoảng thực hiện.'; END IF;
 SELECT * INTO old FROM public.k3_kpi_results WHERE kpi_id=kid AND user_id=uid AND work_date=day FOR UPDATE;
 IF coalesce((p->>'revision')::bigint,0)<>coalesce(old.revision,0) THEN RAISE EXCEPTION 'Kết quả đã được sửa ở nơi khác. Vui lòng tải lại.'; END IF;
 IF old.deleted_at IS NOT NULL OR old.review_reason IS NOT NULL THEN RAISE EXCEPTION 'Kết quả đang lưu trữ/chờ rà soát.'; END IF;
 IF val IS NOT NULL AND val::text IN ('NaN','Infinity','-Infinity') OR num IS NOT NULL AND num::text IN ('NaN','Infinity','-Infinity') OR den IS NOT NULL AND den::text IN ('NaN','Infinity','-Infinity') THEN RAISE EXCEPTION 'Số liệu phải hữu hạn.'; END IF;
 IF k.measure IN ('cumulative','current','duration') AND (val IS NULL OR val<0) THEN RAISE EXCEPTION 'Kết quả thực tế cần là số không âm.'; END IF;
 IF k.measure IN ('ratio','average') AND (num IS NULL OR den IS NULL OR num<0 OR den<=0) THEN RAISE EXCEPTION 'Cần tổng/tử số không âm và số quan sát/mẫu số lớn hơn 0.'; END IF;
 IF k.measure='ratio' AND num>den THEN RAISE EXCEPTION 'Tử số tỷ lệ không được lớn hơn mẫu số.'; END IF;
 arr:=coalesce(p->'objects','[]'::jsonb); done:=coalesce(p->'completed','[]'::jsonb);
 IF jsonb_typeof(arr)<>'array' OR jsonb_typeof(done)<>'array' THEN RAISE EXCEPTION 'Định danh/mốc cần là danh sách.'; END IF;
 IF k.measure='distinct' AND EXISTS(SELECT 1 FROM jsonb_array_elements(arr) x WHERE jsonb_typeof(x)<>'string' OR btrim(x#>>'{}')='') THEN RAISE EXCEPTION 'Cần định danh đối tượng hợp lệ.'; END IF;
 IF k.measure='milestone' AND (jsonb_array_length(k.milestones)=0 OR btrim(coalesce(p->>'evidence',''))='' OR EXISTS(SELECT 1 FROM jsonb_array_elements_text(done) x WHERE NOT k.milestones ? x)) THEN RAISE EXCEPTION 'Mốc cần tiêu chí đã cấu hình và bằng chứng.'; END IF;
 INSERT INTO public.k3_kpi_results(kpi_id,goal_id,action_id,user_id,work_date,value,numerator,denominator,objects,completed,evidence,note,problem,cause,solution,updated_by)
 VALUES(kid,g.id,a.id,uid,day,CASE WHEN k.measure IN ('cumulative','current','duration') THEN val END,CASE WHEN k.measure IN ('ratio','average') THEN num END,CASE WHEN k.measure IN ('ratio','average') THEN den END,CASE WHEN k.measure='distinct' THEN arr ELSE '[]'::jsonb END,CASE WHEN k.measure='milestone' THEN done ELSE '[]'::jsonb END,nullif(btrim(p->>'evidence'),''),nullif(btrim(p->>'note'),''),nullif(btrim(p->>'problem'),''),nullif(btrim(p->>'cause'),''),nullif(btrim(p->>'solution'),''),uid)
 ON CONFLICT(kpi_id,user_id,work_date) DO UPDATE SET value=excluded.value,numerator=excluded.numerator,denominator=excluded.denominator,objects=excluded.objects,completed=excluded.completed,evidence=excluded.evidence,note=excluded.note,problem=excluded.problem,cause=excluded.cause,solution=excluded.solution,revision=k3_kpi_results.revision+1,updated_at=now(),updated_by=uid RETURNING * INTO r;
 INSERT INTO public.k3_kpi_result_versions(result_id,revision,snapshot,request_key,actor_id) VALUES(r.id,r.revision,to_jsonb(r),key,uid);
 INSERT INTO public.k3_plan_events(user_id,goal_id,action_id,actor_id,action,detail) VALUES(uid,g.id,a.id,uid,'kpi_result_save',jsonb_build_object('result_id',r.id,'before',to_jsonb(old),'after',to_jsonb(r)));
 RETURN public.k3_kpi_result_read(kid,day);
END$fn$;
CREATE FUNCTION public.k3_kpi_day_confirm(_date date) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE uid uuid:=auth.uid(); rows jsonb; c public.k3_kpi_day_confirmations;
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('k3owner'),hashtext(uid::text)); PERFORM private.k3_write_guard(_date);
 IF _date>(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date THEN RAISE EXCEPTION 'Không chốt ngày tương lai.'; END IF;
 IF EXISTS(SELECT 1 FROM public.k3_kpi_results r WHERE r.user_id=uid AND r.work_date=_date AND r.deleted_at IS NULL AND r.review_reason IS NULL AND NOT private.k3_result_can_write(uid,r.kpi_id)) THEN RAISE EXCEPTION 'Có kết quả không còn quyền thực hiện hoặc đang lưu trữ.'; END IF;
 SELECT jsonb_agg(to_jsonb(r) ORDER BY r.id) INTO rows FROM public.k3_kpi_results r WHERE r.user_id=uid AND r.work_date=_date AND r.deleted_at IS NULL AND r.review_reason IS NULL;
 IF rows IS NULL THEN RAISE EXCEPTION 'Ngày này chưa có kết quả KPI.'; END IF;
 INSERT INTO public.k3_kpi_day_confirmations(user_id,work_date,snapshot,actor_id) VALUES(uid,_date,rows,uid) RETURNING * INTO c;
 RETURN to_jsonb(c);
END$fn$;
REVOKE ALL ON FUNCTION public.k3_kpi_result_read(uuid,date),public.k3_kpi_result_save(jsonb),public.k3_kpi_day_confirm(date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.k3_kpi_result_read(uuid,date),public.k3_kpi_result_save(jsonb),public.k3_kpi_day_confirm(date) TO authenticated;