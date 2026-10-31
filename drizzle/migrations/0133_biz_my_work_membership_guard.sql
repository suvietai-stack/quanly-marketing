CREATE OR REPLACE FUNCTION public.biz_my_work(_kind text) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE
  v_now timestamptz:=now();
  v_vn date:=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
  result jsonb:='[]'::jsonb;
  pk text; months int; pmax int; cur_idx int; idx int; y int; p int; phase text;
  m jsonb; dep uuid; dep_name text; d public.biz_documents; v_status text; v_url text; v_id uuid; lr public.biz_late_requests;
  seen text[]:= '{}';
  row_key text;
  rec record;
BEGIN
  IF _kind NOT IN ('plan','report') THEN RAISE EXCEPTION 'Loại tài liệu không hợp lệ.'; END IF;
  IF auth.uid() IS NULL OR NOT (private.sig_can(auth.uid(),'biz.view_own') OR private.sig_can(auth.uid(),'biz.'||_kind||'_submit')) THEN RAISE EXCEPTION 'Không có quyền xem công việc của mình.'; END IF;
  FOREACH pk IN ARRAY ARRAY['month','quarter','year'] LOOP
    months:=CASE pk WHEN 'month' THEN 1 WHEN 'quarter' THEN 3 ELSE 12 END;
    pmax:=12/months;
    cur_idx:=(extract(month FROM v_vn)::int-1)/months;
    FOR idx IN -1..1 LOOP
      y:=extract(year FROM v_vn)::int+floor((cur_idx+idx)::numeric/pmax)::int;
      p:=((cur_idx+idx)%pmax+pmax)%pmax+1;
      phase:=public.biz_deadline_phase(_kind||'_'||pk,y,p,v_now);
      IF phase IN ('none','closed') THEN CONTINUE; END IF;
      IF phase='not_open' AND idx<>1 THEN CONTINUE; END IF;
      SELECT * INTO d FROM public.biz_documents WHERE user_id=auth.uid() AND kind=_kind AND period_kind=pk AND year=y AND period=p;
      dep:=coalesce(public.biz_period_department(auth.uid(),y,pk,p),d.department_id);
      -- Không thuộc phòng nào trong kỳ và chưa có hồ sơ → không có nghĩa vụ nộp.
      IF dep IS NULL THEN CONTINUE; END IF;
      v_id:=NULL; v_status:=NULL; v_url:=NULL;
      IF d.id IS NOT NULL THEN
        SELECT v.id,v.status,v.url INTO v_id,v_status,v_url FROM public.biz_document_versions v WHERE v.document_id=d.id ORDER BY v.version DESC LIMIT 1;
      END IF;
      SELECT * INTO lr FROM public.biz_late_requests WHERE user_id=auth.uid() AND kind=_kind AND period_kind=pk AND year=y AND period=p ORDER BY created_at DESC LIMIT 1;
      IF phase='open' AND d.first_submitted_at IS NOT NULL AND v_status IS DISTINCT FROM 'changes' AND idx<>0 THEN CONTINUE; END IF;
      IF phase='overdue' AND d.first_submitted_at IS NOT NULL AND v_status IS DISTINCT FROM 'changes' THEN CONTINUE; END IF;
      m:=public.biz_deadline_milestones(_kind||'_'||pk,y,p);
      SELECT name INTO dep_name FROM public.biz_departments WHERE id=dep;
      row_key:=pk||'-'||y||'-'||p;
      seen:=seen||row_key;
      result:=result||jsonb_build_object('period_kind',pk,'year',y,'period',p,'phase',phase,'open_at',m->>'open','due_at',m->>'due','late_close_at',m->>'late_close','department_id',dep,'department_name',dep_name,'document_id',d.id,'first_submitted_at',d.first_submitted_at,'last_submitted_at',d.last_submitted_at,'late_submitted',coalesce(d.late_submitted,false),'version_id',v_id,'version_status',v_status,'version_url',v_url,'late_status',lr.status,'late_request_id',lr.id);
    END LOOP;
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
    phase:=public.biz_deadline_phase(_kind||'_'||rec.period_kind,rec.year,rec.period,v_now);
    IF phase='closed' AND rec.ver_status IS DISTINCT FROM 'changes' THEN CONTINUE; END IF;
    m:=public.biz_deadline_milestones(_kind||'_'||rec.period_kind,rec.year,rec.period);
    dep:=coalesce(public.biz_period_department(auth.uid(),rec.year,rec.period_kind,rec.period),rec.doc_dept);
    SELECT name INTO dep_name FROM public.biz_departments WHERE id=dep;
    result:=result||jsonb_build_object('period_kind',rec.period_kind,'year',rec.year,'period',rec.period,'phase',phase,'open_at',m->>'open','due_at',m->>'due','late_close_at',m->>'late_close','department_id',dep,'department_name',dep_name,'document_id',rec.doc_id,'first_submitted_at',rec.first_submitted_at,'last_submitted_at',rec.last_submitted_at,'late_submitted',coalesce(rec.late_submitted,false),'version_id',rec.ver_id,'version_status',rec.ver_status,'version_url',rec.ver_url,'late_status',rec.lr_status,'late_request_id',rec.lr_id);
  END LOOP;
  RETURN jsonb_build_object('rows',result,'server_now',v_now);
END $$;