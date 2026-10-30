ALTER TABLE public.biz_department_members ADD COLUMN started_at timestamptz, ADD COLUMN ended_at timestamptz;
UPDATE public.biz_department_members SET started_at=created_at, ended_at=CASE WHEN effective_to IS NULL THEN NULL WHEN effective_to<effective_from THEN created_at ELSE greatest(created_at, ((effective_to+1)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh')) END;
ALTER TABLE public.biz_department_members ALTER COLUMN started_at SET DEFAULT now();
ALTER TABLE public.biz_department_members ADD CONSTRAINT biz_member_time_check CHECK(ended_at IS NULL OR ended_at>=started_at);
ALTER TABLE public.biz_department_members DROP CONSTRAINT biz_department_members_department_id_user_id_effective_from_key;
CREATE UNIQUE INDEX biz_member_one_current ON public.biz_department_members(user_id) WHERE ended_at IS NULL;
COMMENT ON COLUMN public.biz_department_members.effective_from IS 'DEPRECATED: original date history preserved; started_at is authoritative for new memberships';
COMMENT ON COLUMN public.biz_department_members.effective_to IS 'DEPRECATED: original date history preserved; ended_at is exclusive boundary; legacy invalid same-day interval maps to zero duration, actual removal time unknown';
CREATE FUNCTION public.biz_department_access(_department_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT private.sig_can(auth.uid(),'biz.view_all') OR private.sig_can(auth.uid(),'biz.dept_manage') OR private.sig_can(auth.uid(),'biz.kr_manage') OR
 EXISTS(SELECT 1 FROM public.biz_department_members m WHERE m.department_id=_department_id AND m.user_id=auth.uid() AND m.ended_at IS NULL AND
 (private.sig_can(auth.uid(),'biz.view_own') OR private.sig_can(auth.uid(),'biz.goal_submit') OR (m.is_manager AND (private.sig_can(auth.uid(),'biz.view_dept') OR private.sig_can(auth.uid(),'biz.goal_approve')))))
$$;
CREATE FUNCTION public.biz_member_access(_user_id uuid,_department_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT private.sig_can(auth.uid(),'biz.dept_manage') OR private.sig_can(auth.uid(),'biz.view_all') OR
 (_user_id=auth.uid() AND (private.sig_can(auth.uid(),'biz.view_own') OR private.sig_can(auth.uid(),'biz.goal_submit'))) OR
 EXISTS(SELECT 1 FROM public.biz_department_members m WHERE m.user_id=auth.uid() AND m.department_id=_department_id AND m.is_manager AND m.ended_at IS NULL AND (private.sig_can(auth.uid(),'biz.view_dept') OR private.sig_can(auth.uid(),'biz.goal_approve')))
$$;
ALTER POLICY "Authenticated read biz departments" ON public.biz_departments USING(public.biz_department_access(id) OR private.sig_can(auth.uid(),'biz.deadline_manage'));
ALTER POLICY "Authenticated read biz members" ON public.biz_department_members USING(public.biz_member_access(user_id,department_id));
ALTER POLICY "Authenticated read biz kr metrics" ON public.biz_kr_metrics USING(public.biz_department_access(department_id) AND (active OR private.sig_can(auth.uid(),'biz.kr_manage') OR private.sig_can(auth.uid(),'biz.dept_manage')));
ALTER POLICY "Authenticated read biz deadline config" ON public.biz_deadline_config USING(private.sig_can(auth.uid(),'biz.deadline_manage') OR private.sig_can(auth.uid(),'biz.goal_submit') OR private.sig_can(auth.uid(),'biz.view_own') OR private.sig_can(auth.uid(),'biz.view_dept') OR private.sig_can(auth.uid(),'biz.view_all') OR private.sig_can(auth.uid(),'biz.goal_approve'));
CREATE OR REPLACE FUNCTION public.biz_member_save(_department_id uuid,_user_id uuid,_is_manager boolean) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_id uuid; v_now timestamptz:=clock_timestamp();
BEGIN
 IF NOT private.sig_can(auth.uid(),'biz.dept_manage') THEN RAISE EXCEPTION 'Bạn không có quyền quản lý phòng ban kinh doanh.'; END IF;
 PERFORM 1 FROM public.profiles WHERE id=_user_id FOR UPDATE; IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy nhân viên.'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.biz_departments WHERE id=_department_id AND active) THEN RAISE EXCEPTION 'Phòng ban không tồn tại hoặc đã ngừng.'; END IF;
 SELECT id INTO v_id FROM public.biz_department_members WHERE user_id=_user_id AND department_id=_department_id AND ended_at IS NULL;
 IF v_id IS NOT NULL THEN UPDATE public.biz_department_members SET is_manager=coalesce(_is_manager,false) WHERE id=v_id; RETURN v_id; END IF;
 UPDATE public.biz_department_members SET ended_at=v_now,effective_to=(v_now AT TIME ZONE 'Asia/Ho_Chi_Minh')::date WHERE user_id=_user_id AND ended_at IS NULL;
 INSERT INTO public.biz_department_members(department_id,user_id,is_manager,effective_from,started_at) VALUES(_department_id,_user_id,coalesce(_is_manager,false),(v_now AT TIME ZONE 'Asia/Ho_Chi_Minh')::date,v_now) RETURNING id INTO v_id;
 RETURN v_id;
END $$;
CREATE OR REPLACE FUNCTION public.biz_member_end(_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_user uuid; v_now timestamptz:=clock_timestamp();
BEGIN
 IF NOT private.sig_can(auth.uid(),'biz.dept_manage') THEN RAISE EXCEPTION 'Bạn không có quyền quản lý phòng ban kinh doanh.'; END IF;
 SELECT user_id INTO v_user FROM public.biz_department_members WHERE id=_id;
 PERFORM 1 FROM public.profiles WHERE id=v_user FOR UPDATE;
 UPDATE public.biz_department_members SET ended_at=v_now,effective_to=(v_now AT TIME ZONE 'Asia/Ho_Chi_Minh')::date WHERE id=_id AND ended_at IS NULL;
 IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy thành viên đang hiệu lực.'; END IF;
END $$;
CREATE FUNCTION public.biz_deadline_at(_kind text,_year int,_period int DEFAULT 1) RETURNS timestamptz LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE r jsonb; first_month int; months int; base date; day_no int; exception_key text;
BEGIN
 IF NOT (private.sig_can(auth.uid(),'biz.deadline_manage') OR private.sig_can(auth.uid(),'biz.goal_submit') OR private.sig_can(auth.uid(),'biz.view_own') OR private.sig_can(auth.uid(),'biz.view_dept') OR private.sig_can(auth.uid(),'biz.view_all') OR private.sig_can(auth.uid(),'biz.goal_approve')) THEN RAISE EXCEPTION 'Không có quyền xem deadline.'; END IF;
 IF _kind NOT IN ('goal_year','plan_month','plan_quarter','plan_year','report_month','report_quarter','report_year') OR _year NOT BETWEEN 2000 AND 2200 THEN RAISE EXCEPTION 'Kỳ không hợp lệ.'; END IF;
 months:=CASE WHEN _kind LIKE '%month' THEN 1 WHEN _kind LIKE '%quarter' THEN 3 ELSE 12 END;
 IF _period<1 OR _period>12/months THEN RAISE EXCEPTION 'Kỳ không hợp lệ.'; END IF;
 first_month:=(_period-1)*months+1; exception_key:=_year::text||'-'||lpad(_period::text,2,'0');
 SELECT data->_kind INTO r FROM public.biz_deadline_config WHERE id=true;
 IF r->'exceptions'->>exception_key IS NOT NULL THEN RETURN ((r->'exceptions'->>exception_key)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh'); END IF;
 IF r->>'day' IS NULL THEN RETURN NULL; END IF;
 base:=make_date(_year,first_month,1);
 base:=CASE r->>'phase' WHEN 'before' THEN (base-interval '1 month')::date WHEN 'after' THEN (base+make_interval(months=>months))::date ELSE base END;
 day_no:=least((r->>'day')::int,extract(day FROM base+interval '1 month - 1 day')::int);
 RETURN ((base+(day_no-1))::timestamp+make_interval(hours=>coalesce((r->>'hour')::int,17),mins=>coalesce((r->>'minute')::int,0))) AT TIME ZONE 'Asia/Ho_Chi_Minh';
END $$;
CREATE OR REPLACE FUNCTION public.biz_deadline_save(_data jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE k text; r jsonb; ek text; ev jsonb;
BEGIN
 IF NOT private.sig_can(auth.uid(),'biz.deadline_manage') THEN RAISE EXCEPTION 'Bạn không có quyền quản lý deadline.'; END IF;
 IF jsonb_typeof(_data) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Cấu hình không hợp lệ.'; END IF;
 FOR k,r IN SELECT * FROM jsonb_each(_data) LOOP
  IF k NOT IN ('goal_year','plan_month','plan_quarter','plan_year','report_month','report_quarter','report_year') OR jsonb_typeof(r)<>'object' THEN RAISE EXCEPTION 'Cấu hình không hợp lệ.'; END IF;
  IF r->>'day' IS NOT NULL AND ((r->>'day')::numeric<>trunc((r->>'day')::numeric) OR (r->>'day')::int NOT BETWEEN 1 AND 31) THEN RAISE EXCEPTION 'Ngày phải từ 1 đến 31.'; END IF;
  IF coalesce(r->>'phase','during') NOT IN ('before','during','after') OR coalesce((r->>'hour')::int,17) NOT BETWEEN 0 AND 23 OR coalesce((r->>'minute')::int,0) NOT BETWEEN 0 AND 59 THEN RAISE EXCEPTION 'Giờ hoặc kiểu deadline không hợp lệ.'; END IF;
  IF r ? 'exceptions' THEN
   IF jsonb_typeof(r->'exceptions')<>'object' THEN RAISE EXCEPTION 'Ngoại lệ không hợp lệ.'; END IF;
   FOR ek,ev IN SELECT * FROM jsonb_each(r->'exceptions') LOOP
    IF ek !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' OR jsonb_typeof(ev)<>'string' THEN RAISE EXCEPTION 'Kỳ ngoại lệ không hợp lệ.'; END IF;
    PERFORM (ev#>>'{}')::timestamp;
   END LOOP;
  END IF;
 END LOOP;
 INSERT INTO public.biz_deadline_config(id,data,updated_by,updated_at) VALUES(true,_data,auth.uid(),now()) ON CONFLICT(id) DO UPDATE SET data=excluded.data,updated_by=excluded.updated_by,updated_at=now();
END $$;
CREATE TABLE public.biz_annual_goals(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid NOT NULL REFERENCES public.profiles(id),year int NOT NULL CHECK(year BETWEEN 2000 AND 2200),department_id uuid NOT NULL REFERENCES public.biz_departments(id),department_name text NOT NULL,official_version_id uuid,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(user_id,year));
GRANT SELECT ON public.biz_annual_goals TO authenticated; GRANT ALL ON public.biz_annual_goals TO service_role;
ALTER TABLE public.biz_annual_goals ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.biz_goal_versions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),goal_id uuid NOT NULL REFERENCES public.biz_annual_goals(id),version int NOT NULL,status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','pending','changes','approved')),reason text,review_comment text,submitted_at timestamptz,approved_at timestamptz,approved_by uuid REFERENCES public.profiles(id),revision int NOT NULL DEFAULT 0,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),UNIQUE(goal_id,version));
GRANT SELECT ON public.biz_goal_versions TO authenticated; GRANT ALL ON public.biz_goal_versions TO service_role;
ALTER TABLE public.biz_goal_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biz_annual_goals ADD CONSTRAINT biz_goal_official_fk FOREIGN KEY(official_version_id) REFERENCES public.biz_goal_versions(id);
CREATE UNIQUE INDEX biz_goal_one_editable ON public.biz_goal_versions(goal_id) WHERE status<>'approved';
CREATE TABLE public.biz_goal_items(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),version_id uuid NOT NULL REFERENCES public.biz_goal_versions(id),metric_id uuid NOT NULL REFERENCES public.biz_kr_metrics(id),definition jsonb NOT NULL,annual numeric(20,0) CHECK(annual>=0),months numeric(20,0)[] NOT NULL DEFAULT ARRAY[NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL]::numeric[],CHECK(cardinality(months)=12),UNIQUE(version_id,metric_id));
GRANT SELECT ON public.biz_goal_items TO authenticated; GRANT ALL ON public.biz_goal_items TO service_role;
ALTER TABLE public.biz_goal_items ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.biz_goal_events(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),goal_id uuid NOT NULL REFERENCES public.biz_annual_goals(id),version_id uuid NOT NULL REFERENCES public.biz_goal_versions(id),actor_id uuid NOT NULL REFERENCES public.profiles(id),action text NOT NULL,comment text,payload jsonb NOT NULL DEFAULT '{}',created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.biz_goal_events TO authenticated; GRANT ALL ON public.biz_goal_events TO service_role;
ALTER TABLE public.biz_goal_events ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.biz_goal_can_review(_user_id uuid,_department_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT _user_id<>auth.uid() AND private.sig_can(auth.uid(),'biz.goal_approve') AND (private.sig_can(auth.uid(),'biz.view_all') OR EXISTS(SELECT 1 FROM public.biz_department_members m WHERE m.user_id=auth.uid() AND m.department_id=_department_id AND m.is_manager AND m.ended_at IS NULL))
$$;
CREATE FUNCTION public.biz_goal_can_read(_goal_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM public.biz_annual_goals g WHERE g.id=_goal_id AND ((g.user_id=auth.uid() AND (private.sig_can(auth.uid(),'biz.view_own') OR private.sig_can(auth.uid(),'biz.goal_submit'))) OR private.sig_can(auth.uid(),'biz.view_all') OR public.biz_goal_can_review(g.user_id,g.department_id) OR (private.sig_can(auth.uid(),'biz.view_dept') AND EXISTS(SELECT 1 FROM public.biz_department_members m WHERE m.user_id=auth.uid() AND m.department_id=g.department_id AND m.is_manager AND m.ended_at IS NULL))))
$$;
CREATE POLICY biz_goal_scoped ON public.biz_annual_goals FOR SELECT TO authenticated USING(public.biz_goal_can_read(id));
CREATE POLICY biz_version_scoped ON public.biz_goal_versions FOR SELECT TO authenticated USING(public.biz_goal_can_read(goal_id));
CREATE POLICY biz_items_scoped ON public.biz_goal_items FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.biz_goal_versions v WHERE v.id=version_id));
CREATE POLICY biz_events_scoped ON public.biz_goal_events FOR SELECT TO authenticated USING(public.biz_goal_can_read(goal_id));
CREATE FUNCTION public.biz_goal_start(_year int,_reason text DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE g public.biz_annual_goals; v_id uuid; m public.biz_department_members; d public.biz_departments;
BEGIN
 IF NOT private.sig_can(auth.uid(),'biz.goal_submit') THEN RAISE EXCEPTION 'Không có quyền lập mục tiêu.'; END IF;
 PERFORM 1 FROM public.profiles WHERE id=auth.uid() FOR UPDATE;
 SELECT * INTO m FROM public.biz_department_members WHERE user_id=auth.uid() AND ended_at IS NULL;
 SELECT * INTO d FROM public.biz_departments WHERE id=m.department_id AND active;
 IF d.id IS NULL THEN RAISE EXCEPTION 'Bạn chưa thuộc phòng kinh doanh đang hoạt động. Liên hệ người quản lý.'; END IF;
 SELECT * INTO g FROM public.biz_annual_goals WHERE user_id=auth.uid() AND year=_year FOR UPDATE;
 IF g.id IS NULL THEN
  IF NOT EXISTS(SELECT 1 FROM public.biz_kr_metrics WHERE department_id=d.id AND active) THEN RAISE EXCEPTION 'Phòng chưa có chỉ số KR.'; END IF;
  INSERT INTO public.biz_annual_goals(user_id,year,department_id,department_name) VALUES(auth.uid(),_year,d.id,d.name) RETURNING * INTO g;
 END IF;
 SELECT id INTO v_id FROM public.biz_goal_versions WHERE goal_id=g.id AND status<>'approved';
 IF v_id IS NOT NULL THEN RETURN v_id; END IF;
 IF g.official_version_id IS NOT NULL AND btrim(coalesce(_reason,''))='' THEN RAISE EXCEPTION 'Cần nêu lý do điều chỉnh.'; END IF;
 INSERT INTO public.biz_goal_versions(goal_id,version,reason) VALUES(g.id,coalesce((SELECT max(version) FROM public.biz_goal_versions WHERE goal_id=g.id),0)+1,nullif(btrim(_reason),'')) RETURNING id INTO v_id;
 IF g.official_version_id IS NOT NULL THEN
  INSERT INTO public.biz_goal_items(version_id,metric_id,definition,annual,months) SELECT v_id,metric_id,definition,annual,months FROM public.biz_goal_items WHERE version_id=g.official_version_id;
 ELSE
  INSERT INTO public.biz_goal_items(version_id,metric_id,definition) SELECT v_id,id,jsonb_build_object('name',name,'description',description,'unit',unit,'aggregation',aggregation,'value_kind',value_kind,'direction',direction) FROM public.biz_kr_metrics WHERE department_id=g.department_id AND active;
 END IF;
 INSERT INTO public.biz_goal_events(goal_id,version_id,actor_id,action,comment) VALUES(g.id,v_id,auth.uid(),'created',_reason);
 RETURN v_id;
END $$;
CREATE FUNCTION public.biz_goal_save(_version_id uuid,_revision int,_items jsonb,_submit boolean DEFAULT false) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v public.biz_goal_versions; g public.biz_annual_goals; i public.biz_goal_items; r jsonb; annual_value numeric; month_values numeric[]; aggregate_value numeric; val jsonb;
BEGIN
 SELECT * INTO v FROM public.biz_goal_versions WHERE id=_version_id FOR UPDATE;
 SELECT * INTO g FROM public.biz_annual_goals WHERE id=v.goal_id;
 IF g.user_id IS DISTINCT FROM auth.uid() OR NOT private.sig_can(auth.uid(),'biz.goal_submit') THEN RAISE EXCEPTION 'Không có quyền sửa mục tiêu.'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.biz_department_members m JOIN public.biz_departments d ON d.id=m.department_id AND d.active WHERE m.user_id=auth.uid() AND m.ended_at IS NULL) THEN RAISE EXCEPTION 'Bạn chưa thuộc phòng kinh doanh hợp lệ.'; END IF;
 IF v.status NOT IN ('draft','changes') THEN RAISE EXCEPTION 'Mục tiêu đang chờ duyệt hoặc đã khóa.'; END IF;
 IF v.revision<>_revision THEN RAISE EXCEPTION 'Dữ liệu đã thay đổi. Hãy tải lại trước khi lưu.'; END IF;
 IF jsonb_typeof(_items) IS DISTINCT FROM 'array' OR jsonb_array_length(_items)<>(SELECT count(*) FROM public.biz_goal_items WHERE version_id=v.id) OR (SELECT count(DISTINCT x->>'metric_id') FROM jsonb_array_elements(_items) x)<>jsonb_array_length(_items) THEN RAISE EXCEPTION 'Danh sách KR không hợp lệ.'; END IF;
 FOR i IN SELECT * FROM public.biz_goal_items WHERE version_id=v.id LOOP
  SELECT x INTO r FROM jsonb_array_elements(_items) x WHERE x->>'metric_id'=i.metric_id::text;
  IF r IS NULL OR jsonb_typeof(r->'months') IS DISTINCT FROM 'array' OR jsonb_array_length(r->'months')<>12 THEN RAISE EXCEPTION 'Cần đủ 12 ô tháng cho mỗi KR.'; END IF;
  FOR val IN SELECT r->'annual' UNION ALL SELECT x FROM jsonb_array_elements(r->'months') x LOOP
   IF val IS NOT NULL AND val<>'null'::jsonb AND (val#>>'{}') !~ '^[0-9]{1,20}$' THEN RAISE EXCEPTION 'Giá trị phải là số nguyên không âm, tối đa 20 chữ số.'; END IF;
  END LOOP;
  annual_value:=(r->>'annual')::numeric;
  SELECT array_agg((x#>>'{}')::numeric ORDER BY n) INTO month_values FROM jsonb_array_elements(r->'months') WITH ORDINALITY t(x,n);
  IF _submit THEN
   IF annual_value IS NULL OR array_position(month_values,NULL) IS NOT NULL THEN RAISE EXCEPTION 'Cần nhập mục tiêu năm và đủ 12 tháng.'; END IF;
   SELECT CASE WHEN i.definition->>'aggregation'='sum' THEN sum(x) ELSE avg(x) END INTO aggregate_value FROM unnest(month_values) x;
   IF aggregate_value<>annual_value THEN RAISE EXCEPTION 'Phân bổ tháng không khớp mục tiêu năm: %.',i.definition->>'name'; END IF;
  END IF;
  UPDATE public.biz_goal_items SET annual=annual_value,months=month_values WHERE id=i.id;
 END LOOP;
 UPDATE public.biz_goal_versions SET status=CASE WHEN _submit THEN 'pending' ELSE status END,submitted_at=CASE WHEN _submit THEN now() ELSE submitted_at END,revision=revision+1,updated_at=now() WHERE id=v.id;
 INSERT INTO public.biz_goal_events(goal_id,version_id,actor_id,action,payload) VALUES(g.id,v.id,auth.uid(),CASE WHEN _submit THEN 'submitted' ELSE 'saved' END,_items);
END $$;
CREATE FUNCTION public.biz_goal_decide(_version_id uuid,_revision int,_approve boolean,_comment text DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v public.biz_goal_versions; g public.biz_annual_goals;
BEGIN
 SELECT * INTO v FROM public.biz_goal_versions WHERE id=_version_id FOR UPDATE;
 SELECT * INTO g FROM public.biz_annual_goals WHERE id=v.goal_id FOR UPDATE;
 IF NOT public.biz_goal_can_review(g.user_id,g.department_id) THEN RAISE EXCEPTION 'Không có quyền duyệt mục tiêu này hoặc không được tự duyệt.'; END IF;
 IF v.status<>'pending' OR v.revision<>_revision THEN RAISE EXCEPTION 'Mục tiêu không còn chờ duyệt. Hãy tải lại.'; END IF;
 IF NOT _approve AND btrim(coalesce(_comment,''))='' THEN RAISE EXCEPTION 'Cần nhận xét yêu cầu chỉnh sửa.'; END IF;
 UPDATE public.biz_goal_versions SET status=CASE WHEN _approve THEN 'approved' ELSE 'changes' END,review_comment=nullif(btrim(_comment),''),approved_at=CASE WHEN _approve THEN now() END,approved_by=CASE WHEN _approve THEN auth.uid() END,revision=revision+1,updated_at=now() WHERE id=v.id;
 IF _approve THEN UPDATE public.biz_annual_goals SET official_version_id=v.id WHERE id=g.id; END IF;
 INSERT INTO public.biz_goal_events(goal_id,version_id,actor_id,action,comment,payload) VALUES(g.id,v.id,auth.uid(),CASE WHEN _approve THEN 'approved' ELSE 'returned' END,_comment,jsonb_build_object('version',v.version));
END $$;
CREATE FUNCTION public.biz_goals_read(_year int) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT coalesce(jsonb_agg(jsonb_build_object('id',g.id,'user_id',g.user_id,'employee_name',p.full_name,'year',g.year,'department_id',g.department_id,'department_name',g.department_name,'official_version_id',g.official_version_id,'can_review',public.biz_goal_can_review(g.user_id,g.department_id),'versions',
 (SELECT coalesce(jsonb_agg(to_jsonb(v)||jsonb_build_object('items',(SELECT coalesce(jsonb_agg(jsonb_build_object('metric_id',i.metric_id,'definition',i.definition,'annual',i.annual::text,'months',ARRAY(SELECT x::text FROM unnest(i.months) x)) ORDER BY i.id),'[]'::jsonb) FROM public.biz_goal_items i WHERE i.version_id=v.id)) ORDER BY v.version),'[]'::jsonb) FROM public.biz_goal_versions v WHERE v.goal_id=g.id))), '[]'::jsonb)
 FROM public.biz_annual_goals g JOIN public.profiles p ON p.id=g.user_id WHERE g.year=_year AND public.biz_goal_can_read(g.id)
$$;
REVOKE ALL ON FUNCTION public.biz_department_access(uuid),public.biz_member_access(uuid,uuid),public.biz_goal_can_read(uuid),public.biz_goal_can_review(uuid,uuid),public.biz_goal_start(int,text),public.biz_goal_save(uuid,int,jsonb,boolean),public.biz_goal_decide(uuid,int,boolean,text),public.biz_goals_read(int),public.biz_deadline_at(text,int,int) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.biz_department_access(uuid),public.biz_member_access(uuid,uuid),public.biz_goal_can_read(uuid),public.biz_goal_can_review(uuid,uuid),public.biz_goal_start(int,text),public.biz_goal_save(uuid,int,jsonb,boolean),public.biz_goal_decide(uuid,int,boolean,text),public.biz_goals_read(int),public.biz_deadline_at(text,int,int) TO authenticated;