CREATE FUNCTION private.k3_result_measure_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE k k3_kpis; item jsonb; minutes numeric;
BEGIN
 SELECT * INTO k FROM k3_kpis WHERE id=NEW.kpi_id; NEW.config_revision:=k.config_revision;
 IF coalesce((k.config->>'evidence_required')::boolean,false) AND nullif(btrim(NEW.evidence),'') IS NULL THEN RAISE EXCEPTION 'KPI này yêu cầu bằng chứng.'; END IF;
 IF k.measure IN('binary','streak') AND (NEW.value IS NULL OR NEW.value NOT IN(0,1)) THEN RAISE EXCEPTION 'Kết quả Có/Chưa hoặc chuỗi phải là 0 hoặc 1.'; END IF;
 IF k.measure='frequency' AND (NEW.value IS NULL OR NEW.value<0 OR trunc(NEW.value)<>NEW.value) THEN RAISE EXCEPTION 'Số lần phải là số nguyên không âm.'; END IF;
 IF k.measure IN('frequency','streak') AND (NEW.work_date NOT BETWEEN (k.config->>'start_date')::date AND (k.config->>'end_date')::date OR k.config ? 'weekdays' AND NOT k.config->'weekdays' @> jsonb_build_array(extract(isodow FROM NEW.work_date)::int)) THEN RAISE EXCEPTION 'Ngày này ngoài lịch áp dụng KPI.'; END IF;
 IF k.measure='average' AND trunc(NEW.denominator)<>NEW.denominator THEN RAISE EXCEPTION 'Số quan sát phải là số nguyên.'; END IF;
 IF k.measure='duration' AND k.config->>'duration_method'='intervals' THEN
 IF jsonb_typeof(NEW.intervals)<>'array' OR jsonb_array_length(NEW.intervals)=0 THEN RAISE EXCEPTION 'Cần khoảng thời gian thực hiện.'; END IF;
 FOR item IN SELECT * FROM jsonb_array_elements(NEW.intervals) LOOP
 IF (item->>'end')::timestamptz<=(item->>'start')::timestamptz OR ((item->>'start')::timestamptz AT TIME ZONE 'Asia/Ho_Chi_Minh')::date<>NEW.work_date OR ((item->>'end')::timestamptz AT TIME ZONE 'Asia/Ho_Chi_Minh')::date<>NEW.work_date THEN RAISE EXCEPTION 'Khoảng thời gian phải hợp lệ trong ngày thực hiện.'; END IF;
 END LOOP;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(NEW.intervals) WITH ORDINALITY a(x,i) JOIN jsonb_array_elements(NEW.intervals) WITH ORDINALITY b(x,i) ON a.i<b.i WHERE tstzrange((a.x->>'start')::timestamptz,(a.x->>'end')::timestamptz,'[)') && tstzrange((b.x->>'start')::timestamptz,(b.x->>'end')::timestamptz,'[)')) THEN RAISE EXCEPTION 'Khoảng thời gian bị chồng lấn.'; END IF;
 SELECT sum(extract(epoch FROM (x->>'end')::timestamptz-(x->>'start')::timestamptz)/60) INTO minutes FROM jsonb_array_elements(NEW.intervals) x; NEW.value:=minutes;
 END IF;
 RETURN NEW;
END $fn$;
REVOKE ALL ON FUNCTION private.k3_result_measure_guard() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER k3_result_measure_guard BEFORE INSERT OR UPDATE ON public.k3_kpi_results FOR EACH ROW EXECUTE FUNCTION private.k3_result_measure_guard();
DO $patch$ DECLARE def text; BEGIN
 def:=pg_get_functiondef('public.k3_kpi_result_save(jsonb)'::regprocedure);
 def:=replace(def,$old$'cumulative','current','duration'$old$,$new$'cumulative','current','duration','binary','frequency','streak'$new$);
 def:=replace(def,'den<=0','den<0'); def:=replace(def,'mẫu số lớn hơn 0','mẫu số không âm');
 def:=replace(def,'SELECT * INTO a FROM public.k3_actions', $new$IF k.measure='duration' AND k.config->>'duration_unit'='hours' AND coalesce(k.config->>'duration_method','total')='total' THEN val:=val*60; END IF; IF k.measure='duration' AND k.config->>'duration_method'='intervals' THEN val:=0; END IF; SELECT * INTO a FROM public.k3_actions$new$);
 def:=replace(def,'evidence,note,problem,cause,solution,updated_by)', 'evidence,note,problem,cause,solution,intervals,updated_by)');
 def:=replace(def,$old$nullif(btrim(p->>'solution'),''),uid)$old$,$new$nullif(btrim(p->>'solution'),''),coalesce(p->'intervals','[]'::jsonb),uid)$new$);
 def:=replace(def,'solution=excluded.solution,revision=', 'solution=excluded.solution,intervals=excluded.intervals,revision=');
 EXECUTE def;
END $patch$;