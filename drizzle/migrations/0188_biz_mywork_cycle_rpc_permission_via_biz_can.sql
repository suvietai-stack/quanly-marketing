-- RPC biz_my_work: kiểm quyền qua biz_can (Cơ cấu tổ chức) thay vì Role tổng
CREATE OR REPLACE FUNCTION public.biz_my_work(_kind text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_now timestamptz:=now();
  v_vn date:=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
  result jsonb:='[]'::jsonb;
  pk text; months int; pmax int; cur_idx int; idx int; y int; p int; phase text;
  m jsonb; dep uuid; dep_name text; d public.biz_documents; v_status text; v_url text; v_id uuid; lr public.biz_late_requests;
  seen text[]:= '{}';
  row_key text;
  rec record;
  pks text[]; cyc jsonb; wd jsonb; dd date; wmon date; off int;
  cands jsonb:='[]'; is_cur boolean; is_nxt boolean;
BEGIN
  IF _kind NOT IN ('plan','report') THEN RAISE EXCEPTION 'Loại tài liệu không hợp lệ.'; END IF;
  IF auth.uid() IS NULL OR NOT (public.biz_can(auth.uid(),'biz.view_own') OR public.biz_can(auth.uid(),'biz.'||_kind||'_submit')) THEN RAISE EXCEPTION 'Không có quyền xem công việc của mình.'; END IF;
  IF _kind='plan' THEN pks:=ARRAY['month','quarter','year'];
  ELSE cyc:=public.biz_report_cycle_config_of(auth.uid(),v_vn); pks:=ARRAY[coalesce(cyc->>'cycle','month')]; END IF;
  FOREACH pk IN ARRAY pks LOOP
    IF pk='day' THEN
      wd:=cyc->'workdays';
      FOR off IN -6..1 LOOP
        dd:=v_vn+off;
        IF wd IS NOT NULL AND coalesce(wd->>(extract(isodow FROM dd)::integer::text),'true')='false' THEN CONTINUE; END IF;
        IF coalesce(public.biz_report_cycle_config_of(auth.uid(),dd)->>'cycle','month')<>'day' THEN CONTINUE; END IF;
        y:=extract(year FROM dd)::int; p:=(dd-make_date(y,1,1))+1;
        cands:=cands||jsonb_build_object('pk',pk,'y',y,'p',p,'cur',off=0,'nxt',off=1);
      END LOOP;
    ELSIF pk='week' THEN
      wmon:=v_vn-(extract(isodow FROM v_vn)::int-1);
      FOR off IN -2..1 LOOP
        dd:=wmon+off*7;
        IF coalesce(public.biz_report_cycle_config_of(auth.uid(),dd)->>'cycle','month')<>'week' THEN CONTINUE; END IF;
        y:=to_char(dd,'IYYY')::int; p:=to_char(dd,'IW')::int;
        cands:=cands||jsonb_build_object('pk',pk,'y',y,'p',p,'cur',off=0,'nxt',off=1);
      END LOOP;
    ELSE
      months:=CASE pk WHEN 'month' THEN 1 WHEN 'quarter' THEN 3 ELSE 12 END;
      pmax:=12/months;
      cur_idx:=(extract(month FROM v_vn)::int-1)/months;
      FOR idx IN -1..1 LOOP
        y:=extract(year FROM v_vn)::int+floor((cur_idx+idx)::numeric/pmax)::int;
        p:=((cur_idx+idx)%pmax+pmax)%pmax+1;
        IF _kind='report' AND coalesce(public.biz_report_cycle_config_of(auth.uid(),public.biz_period_start_date(pk,y,p))->>'cycle','month')<>pk THEN CONTINUE; END IF;
        cands:=cands||jsonb_build_object('pk',pk,'y',y,'p',p,'cur',idx=0,'nxt',idx=1);
      END LOOP;
    END IF;
  END LOOP;
  FOR rec IN SELECT (c->>'pk') AS pk,(c->>'y')::int AS y,(c->>'p')::int AS p,(c->>'cur')::boolean AS cur,(c->>'nxt')::boolean AS nxt FROM jsonb_array_elements(cands) c LOOP
    IF _kind='report' AND NOT public.biz_report_period_matches(auth.uid(),rec.pk,rec.y,rec.p) AND NOT EXISTS(SELECT 1 FROM public.biz_documents WHERE user_id=auth.uid() AND kind='report' AND period_kind=rec.pk AND year=rec.y AND period=rec.p) THEN CONTINUE; END IF; phase:=public.biz_any_phase(_kind,rec.pk,rec.y,rec.p,v_now);
    IF phase IN ('none','closed') THEN CONTINUE; END IF;
    IF phase='not_open' AND NOT rec.nxt THEN CONTINUE; END IF;
    SELECT * INTO d FROM public.biz_documents WHERE user_id=auth.uid() AND kind=_kind AND period_kind=rec.pk AND year=rec.y AND period=rec.p;
    dep:=coalesce(public.biz_period_department_any(auth.uid(),rec.pk,rec.y,rec.p),d.department_id);
    IF dep IS NULL THEN CONTINUE; END IF;
    v_id:=NULL; v_status:=NULL; v_url:=NULL;
    IF d.id IS NOT NULL THEN
      SELECT v.id,v.status,v.url INTO v_id,v_status,v_url FROM public.biz_document_versions v WHERE v.document_id=d.id ORDER BY v.version DESC LIMIT 1;
    END IF;
    SELECT * INTO lr FROM public.biz_late_requests WHERE user_id=auth.uid() AND kind=_kind AND period_kind=rec.pk AND year=rec.y AND period=rec.p ORDER BY created_at DESC LIMIT 1;
    IF phase='open' AND d.first_submitted_at IS NOT NULL AND v_status IS DISTINCT FROM 'changes' AND NOT rec.cur THEN CONTINUE; END IF;
    IF phase='overdue' AND d.first_submitted_at IS NOT NULL AND v_status IS DISTINCT FROM 'changes' THEN CONTINUE; END IF;
    m:=public.biz_any_milestones(_kind,rec.pk,rec.y,rec.p);
    SELECT name INTO dep_name FROM public.biz_departments WHERE id=dep;
    row_key:=rec.pk||'-'||rec.y||'-'||rec.p;
    seen:=seen||row_key;
    result:=result||jsonb_build_object('period_kind',rec.pk,'year',rec.y,'period',rec.p,'phase',phase,'open_at',m->>'open','due_at',m->>'due','late_close_at',m->>'late_close','period_start',public.biz_period_start_date(rec.pk,rec.y,rec.p),'period_end',public.biz_period_end_date(rec.pk,rec.y,rec.p),'department_id',dep,'department_name',dep_name,'document_id',d.id,'first_submitted_at',d.first_submitted_at,'last_submitted_at',d.last_submitted_at,'late_submitted',coalesce(d.late_submitted,false),'version_id',v_id,'version_status',v_status,'version_url',v_url,'late_status',lr.status,'late_request_id',lr.id);
  END LOOP;
  -- Gộp mọi kỳ cũ còn việc dở: đang bị yêu cầu chỉnh sửa hoặc có yêu cầu nộp bù đang chờ/đã duyệt mà chưa nộp.
  FOR rec IN
    SELECT dd.year,dd.period,dd.period_kind,dd.id AS doc_id,dd.department_id AS doc_dept,dd.first_submitted_at,dd.last_submitted_at,dd.late_submitted,vv.id AS ver_id,vv.status AS ver_status,vv.url AS ver_url,ll.status AS lr_status,ll.id AS lr_id FROM public.biz_documents dd
    LEFT JOIN LATERAL (SELECT v.id,v.status,v.url FROM public.biz_document_versions v WHERE v.document_id=dd.id ORDER BY v.version DESC LIMIT 1) vv ON true
    LEFT JOIN LATERAL (SELECT l.status,l.id FROM public.biz_late_requests l WHERE l.user_id=dd.user_id AND l.kind=dd.kind AND l.period_kind=dd.period_kind AND l.year=dd.year AND l.period=dd.period ORDER BY l.created_at DESC LIMIT 1) ll ON true
    WHERE dd.user_id=auth.uid() AND dd.kind=_kind AND (vv.status='changes' OR (ll.status IN ('pending','approved') AND dd.first_submitted_at IS NULL))
  LOOP
    row_key:=rec.period_kind||'-'||rec.year||'-'||rec.period;
    IF row_key=ANY(seen) THEN CONTINUE; END IF;
    phase:=public.biz_any_phase(_kind,rec.period_kind,rec.year,rec.period,v_now);
    IF phase='closed' AND rec.ver_status IS DISTINCT FROM 'changes' THEN CONTINUE; END IF;
    m:=public.biz_any_milestones(_kind,rec.period_kind,rec.year,rec.period);
    dep:=coalesce(public.biz_period_department_any(auth.uid(),rec.period_kind,rec.year,rec.period),rec.doc_dept);
    SELECT name INTO dep_name FROM public.biz_departments WHERE id=dep;
    result:=result||jsonb_build_object('period_kind',rec.period_kind,'year',rec.year,'period',rec.period,'phase',phase,'open_at',m->>'open','due_at',m->>'due','late_close_at',m->>'late_close','period_start',public.biz_period_start_date(rec.period_kind,rec.year,rec.period),'period_end',public.biz_period_end_date(rec.period_kind,rec.year,rec.period),'department_id',dep,'department_name',dep_name,'document_id',rec.doc_id,'first_submitted_at',rec.first_submitted_at,'last_submitted_at',rec.last_submitted_at,'late_submitted',coalesce(rec.late_submitted,false),'version_id',rec.ver_id,'version_status',rec.ver_status,'version_url',rec.ver_url,'late_status',rec.lr_status,'late_request_id',rec.lr_id);
  END LOOP;
  RETURN jsonb_build_object('rows',result,'server_now',v_now);
END $function$;

-- RPC biz_report_cycle_delete: kiểm quyền qua biz_can (Cơ cấu tổ chức) thay vì Role tổng
CREATE OR REPLACE FUNCTION public.biz_report_cycle_delete(_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE ex public.biz_report_cycle_configs; at_ date; start_ date; rid uuid;
BEGIN
 IF NOT public.biz_can(auth.uid(),'biz.deadline_manage') THEN RAISE EXCEPTION 'Bạn không có quyền cấu hình chu kỳ báo cáo.'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('biz_report_cycle_config'));
 SELECT * INTO ex FROM public.biz_report_cycle_configs WHERE id=_id FOR UPDATE;
 IF ex.id IS NULL THEN RAISE EXCEPTION 'Cấu hình không tồn tại.'; END IF;
 at_:=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
 IF ex.effective_from>=at_ THEN
  DELETE FROM public.biz_report_cycle_configs WHERE id=_id;
  INSERT INTO public.biz_report_cycle_config_log(actor_id,action,config_id,old_row) VALUES(auth.uid(),'delete',_id,to_jsonb(ex));
  RETURN;
 END IF;
 start_:=CASE ex.cycle WHEN 'day' THEN at_+1 WHEN 'week' THEN at_+(8-extract(isodow FROM at_)::int) WHEN 'month' THEN (date_trunc('month',at_)+interval '1 month')::date ELSE (date_trunc('quarter',at_)+interval '3 months')::date END;
 INSERT INTO public.biz_report_cycle_configs(scope,system_id,department_id,cycle,effective_from,workdays,created_by,inherit_parent)
 VALUES(ex.scope,ex.system_id,ex.department_id,ex.cycle,start_,ex.workdays,auth.uid(),true)
 ON CONFLICT(scope,coalesce(system_id,'00000000-0000-0000-0000-000000000000'::uuid),coalesce(department_id,'00000000-0000-0000-0000-000000000000'::uuid),effective_from) DO UPDATE SET inherit_parent=true,updated_at=now() RETURNING id INTO rid;
 INSERT INTO public.biz_report_cycle_config_log(actor_id,action,config_id,old_row,new_row) VALUES(auth.uid(),'delete',rid,to_jsonb(ex),(SELECT to_jsonb(c) FROM public.biz_report_cycle_configs c WHERE id=rid));
END $function$;

-- RPC biz_report_cycle_save: kiểm quyền qua biz_can (Cơ cấu tổ chức) thay vì Role tổng
CREATE OR REPLACE FUNCTION public.biz_report_cycle_save(_scope text, _system_id uuid, _department_id uuid, _cycle text, _effective_from date, _workdays jsonb DEFAULT NULL::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE ex public.biz_report_cycle_configs%ROWTYPE; rid uuid;
BEGIN
  IF NOT public.biz_can(auth.uid(),'biz.deadline_manage') THEN RAISE EXCEPTION 'Bạn không có quyền cấu hình chu kỳ báo cáo.'; END IF;
  IF _scope NOT IN ('block','system','department') OR _cycle NOT IN ('day','week','month','quarter') THEN RAISE EXCEPTION 'Cấu hình không hợp lệ.'; END IF;
  IF (_scope='block' AND (_system_id IS NOT NULL OR _department_id IS NOT NULL))
    OR (_scope='system' AND (_system_id IS NULL OR _department_id IS NOT NULL))
    OR (_scope='department' AND _department_id IS NULL) THEN RAISE EXCEPTION 'Đơn vị áp dụng không khớp phạm vi.'; END IF;
  IF _effective_from IS NULL OR _effective_from < '2020-01-01' THEN RAISE EXCEPTION 'Ngày hiệu lực không hợp lệ.'; END IF; IF _cycle='week' AND (extract(isodow FROM _effective_from)<>1 OR _effective_from < DATE '2026-11-02') THEN RAISE EXCEPTION 'Chu kỳ Tuần mới phải từ Thứ Hai, không hồi tố trước 02/11/2026.'; END IF; IF NOT public.biz_report_deadline_ready('report',_cycle,CASE WHEN _cycle='week' THEN to_char(_effective_from,'IYYY')::int ELSE extract(year FROM _effective_from)::int END,CASE _cycle WHEN 'week' THEN to_char(_effective_from,'IW')::int WHEN 'day' THEN (_effective_from-make_date(extract(year FROM _effective_from)::int,1,1))+1 WHEN 'month' THEN extract(month FROM _effective_from)::int ELSE extract(quarter FROM _effective_from)::int END) THEN RAISE EXCEPTION 'Cần hoàn tất cả ba mốc deadline trước khi áp dụng chu kỳ Báo cáo.'; END IF;
  IF _workdays IS NOT NULL AND (jsonb_typeof(_workdays)<>'object' OR EXISTS(SELECT 1 FROM jsonb_each(_workdays) e(k,v) WHERE k NOT IN ('1','2','3','4','5','6','7') OR jsonb_typeof(v)<>'boolean')) THEN RAISE EXCEPTION 'Lịch ngày làm việc không hợp lệ.'; END IF;
  SELECT * INTO ex FROM public.biz_report_cycle_configs
    WHERE scope=_scope AND system_id IS NOT DISTINCT FROM _system_id AND department_id IS NOT DISTINCT FROM _department_id AND effective_from=_effective_from;
  IF ex.id IS NOT NULL THEN
    UPDATE public.biz_report_cycle_configs SET cycle=_cycle, workdays=_workdays,inherit_parent=false, updated_at=now() WHERE id=ex.id;
    rid:=ex.id;
    INSERT INTO public.biz_report_cycle_config_log(actor_id,action,config_id,old_row,new_row) VALUES(auth.uid(),'save',ex.id,to_jsonb(ex),to_jsonb((SELECT c FROM public.biz_report_cycle_configs c WHERE c.id=ex.id)));
  ELSE
    INSERT INTO public.biz_report_cycle_configs(scope,system_id,department_id,cycle,effective_from,workdays,created_by)
    VALUES(_scope,_system_id,_department_id,_cycle,_effective_from,_workdays,auth.uid()) RETURNING id INTO rid;
    INSERT INTO public.biz_report_cycle_config_log(actor_id,action,config_id,new_row) VALUES(auth.uid(),'save',rid,to_jsonb((SELECT c FROM public.biz_report_cycle_configs c WHERE c.id=rid)));
  END IF;
  RETURN rid;
END $function$;