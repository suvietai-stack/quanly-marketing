CREATE TABLE public.biz_rolling_plans(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),goal_id uuid NOT NULL REFERENCES public.biz_annual_goals(id),version integer NOT NULL,revision integer NOT NULL DEFAULT 0,status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','pending','changes','approved')),reason text NOT NULL,base_version_id uuid NOT NULL REFERENCES public.biz_goal_versions(id),first_month integer NOT NULL CHECK(first_month BETWEEN 1 AND 13),basis jsonb NOT NULL,items jsonb NOT NULL,submitted_at timestamptz,approved_at timestamptz,approved_by uuid REFERENCES public.profiles(id),review_comment text,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(goal_id,version));
GRANT SELECT ON public.biz_rolling_plans TO authenticated; GRANT ALL ON public.biz_rolling_plans TO service_role;
ALTER TABLE public.biz_rolling_plans ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX biz_rolling_one_open ON public.biz_rolling_plans(goal_id) WHERE status<>'approved';
CREATE TABLE public.biz_rolling_events(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),plan_id uuid NOT NULL REFERENCES public.biz_rolling_plans(id),actor_id uuid NOT NULL REFERENCES public.profiles(id),action text NOT NULL,payload jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.biz_rolling_events TO authenticated; GRANT ALL ON public.biz_rolling_events TO service_role;
ALTER TABLE public.biz_rolling_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY biz_rolling_read ON public.biz_rolling_plans FOR SELECT TO authenticated USING(public.biz_goal_can_read(goal_id) OR public.biz_run_assigned(id));
CREATE POLICY biz_rolling_events_read ON public.biz_rolling_events FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.biz_rolling_plans p WHERE p.id=plan_id AND (public.biz_goal_can_read(p.goal_id) OR public.biz_run_assigned(p.id))));
CREATE FUNCTION private.biz_rolling_basis(_goal uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE g public.biz_annual_goals; p public.biz_rolling_plans; i public.biz_goal_items; rows_ jsonb:='[]'; actuals_ jsonb; current_ jsonb; a text; total_ numeric; complete_ boolean; m integer; first_ integer; today_ date:=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
BEGIN
 SELECT * INTO g FROM public.biz_annual_goals WHERE id=_goal;
 IF g.official_version_id IS NULL THEN RAISE EXCEPTION 'Cần mục tiêu năm đã duyệt.';END IF;
 first_:=CASE WHEN g.year>extract(year FROM today_) THEN 1 WHEN g.year<extract(year FROM today_) THEN 13 ELSE extract(month FROM today_)::integer+1 END;
 SELECT * INTO p FROM public.biz_rolling_plans WHERE goal_id=g.id AND status='approved' AND base_version_id=g.official_version_id ORDER BY version DESC LIMIT 1;
 FOR i IN SELECT * FROM public.biz_goal_items WHERE version_id=g.official_version_id ORDER BY metric_id LOOP
 current_:=coalesce((SELECT x->'months' FROM jsonb_array_elements(p.items) x WHERE x->>'metric_id'=i.metric_id::text),to_jsonb(ARRAY(SELECT v::text FROM unnest(i.months) v)));
 actuals_:='[]';total_:=0;complete_:=true;
 FOR m IN 1..12 LOOP
 a:=NULL;
 IF make_date(g.year,m,1)<date_trunc('month',today_)::date THEN
 a:=private.biz_report_actual_range(g.user_id,i.metric_id,make_date(g.year,m,1),(make_date(g.year,m,1)+interval '1 month - 1 day')::date,'official');
 IF a IS NULL THEN complete_:=false; ELSE total_:=total_+a::numeric;END IF;
 END IF;
 actuals_:=actuals_||jsonb_build_array(a);
 END LOOP;
 rows_:=rows_||jsonb_build_array(jsonb_build_object('metric_id',i.metric_id,'definition',i.definition,'annual',i.annual::text,'months',ARRAY(SELECT v::text FROM unnest(i.months) v),'current',current_,'actuals',actuals_,'complete',complete_,'actual',CASE WHEN complete_ THEN total_::text END,'remaining',CASE WHEN complete_ AND i.definition->>'aggregation'='sum' THEN greatest(0,i.annual-total_)::text END));
 END LOOP;
 RETURN jsonb_build_object('year',g.year,'first_month',first_,'official_version_id',g.official_version_id,'current_plan_id',p.id,'items',rows_);
END $$;
REVOKE ALL ON FUNCTION private.biz_rolling_basis(uuid) FROM PUBLIC,anon,authenticated,service_role;
CREATE FUNCTION private.biz_rolling_validate(_items jsonb,_basis jsonb,_submit boolean) RETURNS void LANGUAGE plpgsql SET search_path=public AS $$
DECLARE b jsonb;x jsonb;m integer;v text;s numeric;first_ integer:=(_basis->>'first_month')::integer;
BEGIN
 IF first_>12 THEN RAISE EXCEPTION 'Không còn tháng tương lai để điều chỉnh.';END IF;
 IF jsonb_typeof(_items) IS DISTINCT FROM 'array' OR jsonb_array_length(_items)<>jsonb_array_length(_basis->'items') THEN RAISE EXCEPTION 'Danh sách KR đã thay đổi.';END IF;
 IF (SELECT count(DISTINCT x->>'metric_id') FROM jsonb_array_elements(_items) x)<>jsonb_array_length(_items) THEN RAISE EXCEPTION 'KR bị trùng.';END IF;
 FOR b IN SELECT * FROM jsonb_array_elements(_basis->'items') LOOP
 SELECT z INTO x FROM jsonb_array_elements(_items) z WHERE z->>'metric_id'=b->>'metric_id';
 IF x IS NULL OR x->>'annual' IS DISTINCT FROM b->>'annual' OR x->'definition' IS DISTINCT FROM b->'definition' OR jsonb_typeof(x->'months') IS DISTINCT FROM 'array' OR jsonb_array_length(x->'months')<>12 THEN RAISE EXCEPTION 'Không được thay đổi cam kết năm hoặc định nghĩa KR.';END IF;
 s:=0;
 FOR m IN 0..11 LOOP
 v:=x->'months'->>m;
 IF v IS NOT NULL AND (v !~ '^[0-9]+$' OR length(v)>20) THEN RAISE EXCEPTION 'Chỉ nhận số nguyên không âm.';END IF;
 IF m<first_-1 AND x->'months'->m IS DISTINCT FROM b->'current'->m THEN RAISE EXCEPTION 'Không được sửa tháng hiện tại hoặc lịch sử.';END IF;
 IF b->'definition'->>'aggregation'<>'sum' AND x->'months'->m IS DISTINCT FROM b->'current'->m THEN RAISE EXCEPTION 'KR bình quân/tỷ lệ không dùng kế hoạch bù cộng dồn.';END IF;
 IF _submit AND v IS NULL THEN RAISE EXCEPTION 'Cần nhập đủ phân bổ tháng.';END IF;
 IF m>=first_-1 THEN s:=s+coalesce(v::numeric,0);END IF;
 END LOOP;
 IF _submit AND b->'definition'->>'aggregation'='sum' THEN
 IF NOT (b->>'complete')::boolean OR b->>'remaining' IS NULL THEN RAISE EXCEPTION 'Thiếu dữ liệu chính thức của tháng đã kết thúc.';END IF;
 IF s<(b->>'remaining')::numeric THEN RAISE EXCEPTION 'Tổng kế hoạch tương lai chưa đủ phần còn phải đạt.';END IF;
 END IF;
 END LOOP;
END $$;
REVOKE ALL ON FUNCTION private.biz_rolling_validate(jsonb,jsonb,boolean) FROM PUBLIC,anon,authenticated,service_role;
CREATE FUNCTION public.biz_rolling_read(_goal uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE b jsonb;p public.biz_rolling_plans;g public.biz_annual_goals;
BEGIN
 IF NOT public.biz_goal_can_read(_goal) AND NOT EXISTS(SELECT 1 FROM public.biz_rolling_plans WHERE goal_id=_goal AND public.biz_run_assigned(id)) THEN RAISE EXCEPTION 'Không có quyền xem mục tiêu.';END IF;
 SELECT * INTO g FROM public.biz_annual_goals WHERE id=_goal;b:=private.biz_rolling_basis(_goal);
 SELECT * INTO p FROM public.biz_rolling_plans WHERE goal_id=_goal AND status='approved' ORDER BY version DESC LIMIT 1;
 RETURN jsonb_build_object('basis',b,'server_now',now(),'can_propose',g.user_id=auth.uid() AND public.biz_can(auth.uid(),'biz.goal_submit') AND (b->>'first_month')::integer<=12 AND EXISTS(SELECT 1 FROM jsonb_array_elements(b->'items') x WHERE x->'definition'->>'aggregation'='sum'),'needs_review',p.id IS NOT NULL AND (p.base_version_id<>g.official_version_id OR EXISTS(SELECT 1 FROM jsonb_array_elements(b->'items') x JOIN jsonb_array_elements(p.basis->'items') old ON old->>'metric_id'=x->>'metric_id' WHERE old->'actuals' IS DISTINCT FROM x->'actuals')),'proposals',coalesce((SELECT jsonb_agg(to_jsonb(r) ORDER BY version DESC) FROM public.biz_rolling_plans r WHERE goal_id=_goal),'[]'));
END $$;
CREATE FUNCTION public.biz_rolling_save(_goal uuid,_items jsonb,_reason text,_revision integer DEFAULT NULL,_submit boolean DEFAULT false) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE g public.biz_annual_goals;p public.biz_rolling_plans;b jsonb;id_ uuid;run_ uuid;
BEGIN
 SELECT * INTO g FROM public.biz_annual_goals WHERE id=_goal FOR UPDATE;
 IF g.id IS NULL OR g.user_id<>auth.uid() OR NOT public.biz_can(auth.uid(),'biz.goal_submit') THEN RAISE EXCEPTION 'Chỉ đề xuất điều chỉnh KR của mình.';END IF;
 IF btrim(coalesce(_reason,''))='' THEN RAISE EXCEPTION 'Cần lý do điều chỉnh.';END IF;
 b:=private.biz_rolling_basis(_goal);PERFORM private.biz_rolling_validate(_items,b,_submit);
 SELECT * INTO p FROM public.biz_rolling_plans WHERE goal_id=_goal AND status<>'approved' FOR UPDATE;
 IF p.id IS NOT NULL AND (p.status='pending' OR _revision IS DISTINCT FROM p.revision) THEN RAISE EXCEPTION 'Hồ sơ đã thay đổi hoặc đang chờ duyệt. Hãy tải lại.';END IF;
 IF p.id IS NULL THEN
 INSERT INTO public.biz_rolling_plans(goal_id,version,reason,base_version_id,first_month,basis,items) VALUES(_goal,coalesce((SELECT max(version)+1 FROM public.biz_rolling_plans WHERE goal_id=_goal),1),btrim(_reason),g.official_version_id,(b->>'first_month')::integer,b,_items) RETURNING id INTO id_;
 ELSE
 id_:=p.id;UPDATE public.biz_rolling_plans SET reason=btrim(_reason),base_version_id=g.official_version_id,first_month=(b->>'first_month')::integer,basis=b,items=_items,revision=revision+1 WHERE id=id_;
 END IF;
 IF _submit THEN
 run_:=public.biz_approval_start(id_,'goal_year',g.user_id,g.department_id,jsonb_build_object('entity','rolling_plan','goal_id',g.id,'year',g.year,'reason',_reason,'items',_items,'basis',b));
 IF run_ IS NULL THEN RAISE EXCEPTION 'Cần cấu hình luồng phê duyệt KR trước khi gửi.';END IF;
 UPDATE public.biz_rolling_plans SET status='pending',submitted_at=now() WHERE id=id_;
 END IF;
 INSERT INTO public.biz_rolling_events(plan_id,actor_id,action,payload) VALUES(id_,auth.uid(),CASE WHEN _submit THEN 'submitted' ELSE 'saved' END,jsonb_build_object('before',p.items,'after',_items,'basis',b,'reason',_reason));RETURN id_;
END $$;
CREATE FUNCTION public.biz_rolling_decide(_id uuid,_revision integer,_approve boolean,_comment text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p public.biz_rolling_plans;g public.biz_annual_goals;b jsonb;final_ boolean;
BEGIN
 SELECT * INTO p FROM public.biz_rolling_plans WHERE id=_id;
 SELECT * INTO g FROM public.biz_annual_goals WHERE id=p.goal_id FOR UPDATE;
 SELECT * INTO p FROM public.biz_rolling_plans WHERE id=_id FOR UPDATE;
 IF p.id IS NULL OR p.status<>'pending' OR p.revision<>_revision OR g.user_id=auth.uid() OR NOT public.biz_run_assigned(p.id,true) THEN RAISE EXCEPTION 'Không đến lượt, không được tự duyệt hoặc hồ sơ đã thay đổi.';END IF;
 IF NOT EXISTS(SELECT 1 FROM public.biz_approval_runs WHERE version_id=p.id AND status='pending') THEN RAISE EXCEPTION 'Thiếu luồng phê duyệt.';END IF;
 IF _approve THEN
 b:=private.biz_rolling_basis(p.goal_id);
 IF b IS DISTINCT FROM p.basis THEN RAISE EXCEPTION 'Cơ sở thực tế, cam kết hoặc tháng áp dụng đã thay đổi. Cần trả lại và cập nhật đề xuất.';END IF;
 PERFORM private.biz_rolling_validate(p.items,b,true);
 END IF;
 final_:=public.biz_approval_step(p.id,_approve,_comment);
 UPDATE public.biz_rolling_plans SET status=CASE WHEN NOT _approve THEN 'changes' WHEN final_ THEN 'approved' ELSE 'pending' END,revision=revision+1,approved_at=CASE WHEN final_ THEN now() END,approved_by=CASE WHEN final_ THEN auth.uid() END,review_comment=nullif(btrim(_comment),'') WHERE id=p.id;
 INSERT INTO public.biz_rolling_events(plan_id,actor_id,action,payload) VALUES(p.id,auth.uid(),CASE WHEN NOT _approve THEN 'returned' WHEN final_ THEN 'approved' ELSE 'step_approved' END,jsonb_build_object('before',p.basis,'after',p.items,'comment',_comment));
END $$;
REVOKE ALL ON FUNCTION public.biz_rolling_read(uuid),public.biz_rolling_save(uuid,jsonb,text,integer,boolean),public.biz_rolling_decide(uuid,integer,boolean,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.biz_rolling_read(uuid),public.biz_rolling_save(uuid,jsonb,text,integer,boolean),public.biz_rolling_decide(uuid,integer,boolean,text) TO authenticated;
DO $patch$ DECLARE f text; BEGIN
 SELECT pg_get_functiondef('public.biz_approvals_read()'::regprocedure) INTO f;
 f:=replace(f,'WHEN a.kind=''goal_year'' THEN (SELECT revision FROM public.biz_goal_versions WHERE id=a.version_id)','WHEN a.kind=''goal_year'' THEN coalesce((SELECT revision FROM public.biz_rolling_plans WHERE id=a.version_id),(SELECT revision FROM public.biz_goal_versions WHERE id=a.version_id))');EXECUTE f;
 SELECT pg_get_functiondef('public.biz_approval_override(uuid,integer,text,text,uuid)'::regprocedure) INTO f;
 f:=replace(f,'SELECT * INTO r FROM public.biz_approval_runs WHERE id=_id;','SELECT * INTO r FROM public.biz_approval_runs WHERE id=_id; IF r.content_snapshot->>''entity''=''rolling_plan'' THEN RAISE EXCEPTION ''Điều chỉnh phân bổ phải dùng các cấp duyệt KR, không duyệt tắt.'';END IF;');EXECUTE f;
 SELECT pg_get_functiondef('public.biz_approval_notify()'::regprocedure) INTO f;
 f:=replace(f,'(SELECT goal_id FROM public.biz_goal_versions WHERE id=r.version_id)','coalesce((SELECT goal_id FROM public.biz_rolling_plans WHERE id=r.version_id),(SELECT goal_id FROM public.biz_goal_versions WHERE id=r.version_id))');EXECUTE f;
END $patch$;