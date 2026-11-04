CREATE FUNCTION private.k3_validate_config(_measure text,_config jsonb,_target numeric) RETURNS void LANGUAGE plpgsql IMMUTABLE SET search_path=public AS $fn$
DECLARE c jsonb:=coalesce(_config,'{}'); m jsonb; total numeric; ids int; n int;
BEGIN
 IF jsonb_typeof(c)<>'object' THEN RAISE EXCEPTION 'Cấu hình KPI phải có cấu trúc hợp lệ.'; END IF;
 IF c ? 'baseline' AND (nullif(btrim(c->>'baseline_source'),'') IS NULL OR (c->>'baseline')::numeric<0 OR (c->>'baseline')::numeric::text IN('NaN','Infinity','-Infinity')) THEN RAISE EXCEPTION 'Giá trị bắt đầu cần căn cứ và số không âm hữu hạn.'; END IF;
 IF c ? 'tolerance' AND ((c->>'tolerance')::numeric<0 OR (c->>'tolerance')::numeric::text IN('NaN','Infinity','-Infinity')) THEN RAISE EXCEPTION 'Sai số phải không âm hữu hạn.'; END IF;
 IF c ? 'precision' AND (c->>'precision')::int NOT BETWEEN 0 AND 8 THEN RAISE EXCEPTION 'Độ chính xác từ 0 đến 8 chữ số.'; END IF;
 IF c ? 'daily_target' AND ((c->>'daily_target')::numeric<=0 OR (c->>'daily_target')::numeric::text IN('NaN','Infinity','-Infinity')) THEN RAISE EXCEPTION 'Kế hoạch ngày phải lớn hơn 0 hữu hạn.'; END IF;
 IF _measure IN('binary','frequency','streak') AND nullif(btrim(c->>'valid_condition'),'') IS NULL THEN RAISE EXCEPTION 'Cần điều kiện một kết quả hợp lệ.'; END IF;
 IF _measure IN('frequency','streak') THEN
 IF coalesce(c->>'cycle','') NOT IN('day','week','month') OR _measure='streak' AND c->>'cycle'<>'day' THEN RAISE EXCEPTION 'Chu kỳ không hợp lệ.'; END IF;
 IF nullif(c->>'start_date','') IS NULL OR nullif(c->>'end_date','') IS NULL OR (c->>'end_date')::date<(c->>'start_date')::date THEN RAISE EXCEPTION 'Cần khoảng ngày áp dụng hợp lệ.'; END IF;
 IF _target IS NULL OR _target<1 OR trunc(_target)<>_target THEN RAISE EXCEPTION 'Số lần/chuỗi mục tiêu phải là số nguyên dương.'; END IF;
 END IF;
 IF c ? 'weekdays' AND (jsonb_typeof(c->'weekdays')<>'array' OR jsonb_array_length(c->'weekdays')=0) THEN RAISE EXCEPTION 'Cần ít nhất một ngày áp dụng.'; END IF;
 IF c ? 'weekdays' AND EXISTS(SELECT 1 FROM jsonb_array_elements_text(c->'weekdays') x WHERE x::int NOT BETWEEN 1 AND 7) THEN RAISE EXCEPTION 'Ngày áp dụng từ 1 đến 7.'; END IF;
 IF _measure='distinct' AND (nullif(btrim(c->>'entity_type'),'') IS NULL OR nullif(btrim(c->>'identifier_field'),'') IS NULL OR coalesce(c->>'normalization','') NOT IN('exact','trim_lower')) THEN RAISE EXCEPTION 'Cần loại đối tượng, trường định danh và quy tắc trùng.'; END IF;
 IF _measure='duration' AND (coalesce(c->>'duration_unit','minutes') NOT IN('minutes','hours') OR coalesce(c->>'duration_method','total') NOT IN('total','intervals')) THEN RAISE EXCEPTION 'Phương thức thời lượng không hợp lệ.'; END IF;
 IF _measure='milestone' AND c ? 'milestones' THEN
 IF jsonb_typeof(c->'milestones')<>'array' OR jsonb_array_length(c->'milestones')=0 THEN RAISE EXCEPTION 'Cần ít nhất một mốc.'; END IF;
 SELECT count(*),count(DISTINCT x->>'id'),sum((x->>'weight')::numeric) INTO n,ids,total FROM jsonb_array_elements(c->'milestones') x;
 IF ids<>n THEN RAISE EXCEPTION 'Định danh mốc không được trùng.'; END IF;
 FOR m IN SELECT * FROM jsonb_array_elements(c->'milestones') LOOP
 IF nullif(btrim(m->>'id'),'') IS NULL OR nullif(btrim(m->>'name'),'') IS NULL OR nullif(btrim(m->>'condition'),'') IS NULL THEN RAISE EXCEPTION 'Mốc cần tên và điều kiện hoàn thành.'; END IF;
 IF total IS NOT NULL AND (NOT m ? 'weight' OR (m->>'weight')::numeric<=0) THEN RAISE EXCEPTION 'Mọi mốc phải có trọng số dương khi dùng trọng số.'; END IF;
 END LOOP;
 IF total IS NOT NULL AND total<>100 THEN RAISE EXCEPTION 'Tổng trọng số phải bằng 100.'; END IF;
 END IF;
END $fn$;
REVOKE ALL ON FUNCTION private.k3_validate_config(text,jsonb,numeric) FROM PUBLIC,anon,authenticated;
DO $patch$ DECLARE def text; BEGIN
 def:=pg_get_functiondef('public.k3_kpi_configure(jsonb)'::regprocedure);
 def:=replace(def,$old$'average','milestone','duration')$old$,$new$'average','milestone','duration','binary','frequency','streak')$new$);
 def:=replace(def,$old$IF measure<>'milestone'$old$, $new$IF measure NOT IN ('milestone','binary')$new$);
 def:=replace(def,'IF kid IS NULL THEN', 'PERFORM private.k3_validate_config(measure,coalesce(p->''config'',''{}''::jsonb),target); IF measure=''binary'' THEN target:=1; condition:=''gte''; END IF; IF kid IS NULL THEN');
 def:=replace(def,'required,milestones,created_by,request_key)', 'required,milestones,config,created_by,request_key)');
 def:=replace(def,'true),milestones,auth.uid(),key)', 'true),milestones,coalesce(p->''config'',''{}''::jsonb),auth.uid(),key)');
 def:=replace(def,'milestones=milestones,updated_at=now()', 'milestones=milestones,config=coalesce(p->''config'',''{}''::jsonb),config_revision=k.config_revision+1,updated_at=now()');
 IF def NOT LIKE '%config,created_by%' THEN RAISE EXCEPTION 'Configuration extension failed'; END IF; EXECUTE def;
END $patch$;