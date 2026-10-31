CREATE OR REPLACE FUNCTION public.biz_document_first_submit_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE d public.biz_documents; phase text; lr uuid;
BEGIN
 IF NEW.submitted_at IS NULL OR OLD.status NOT IN ('draft','changes') OR NEW.status NOT IN ('pending','approved','resubmitted') THEN RETURN NEW; END IF;
 SELECT * INTO d FROM public.biz_documents WHERE id=NEW.document_id FOR UPDATE;
 IF d.first_submitted_at IS NOT NULL THEN RETURN NEW; END IF;
 phase:=public.biz_any_phase(d.kind,d.period_kind,d.year,d.period,now());
 IF phase='not_open' THEN RAISE EXCEPTION 'Kỳ nộp chưa mở.'; END IF;
 IF phase='closed' THEN RAISE EXCEPTION 'Kỳ nộp đã đóng hoàn toàn.'; END IF;
 IF phase='overdue' THEN
  SELECT id INTO lr FROM public.biz_late_requests WHERE user_id=d.user_id AND kind=d.kind AND period_kind=d.period_kind AND year=d.year AND period=d.period AND status='approved' ORDER BY created_at DESC LIMIT 1 FOR UPDATE;
  IF lr IS NULL THEN RAISE EXCEPTION 'Đã quá hạn nộp trực tiếp. Cần được duyệt nộp bù.'; END IF;
  UPDATE public.biz_late_requests SET status='used',used_at=now() WHERE id=lr;
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.biz_document_first_submit_guard() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER biz_document_first_submit_gate BEFORE UPDATE ON public.biz_document_versions FOR EACH ROW EXECUTE FUNCTION public.biz_document_first_submit_guard();
-- Gate must run BEFORE the save function stamps first_submitted_at. Inject the same authoritative check into that existing function, preserving all other rules.
DO $patch$
DECLARE f text; old text;
BEGIN
 SELECT pg_get_functiondef('public.biz_document_save(uuid,integer,text,text,jsonb,boolean,jsonb,jsonb)'::regprocedure) INTO f;
 old:='IF _submit AND d.first_submitted_at IS NULL THEN UPDATE public.biz_documents SET deadline=public.biz_any_deadline_at(d.kind||''_''||d.period_kind,d.year,d.period),deadline_frozen=true,first_submitted_at=now() WHERE id=d.id; END IF;';
 IF position(old in f)=0 THEN RAISE EXCEPTION 'Save function shape changed; refusing unsafe patch.'; END IF;
 f:=replace(f,old,$gate$IF _submit AND d.first_submitted_at IS NULL THEN
  DECLARE phase_ text; late_id uuid;
  BEGIN
   phase_:=public.biz_any_phase(d.kind,d.period_kind,d.year,d.period,now());
   IF phase_='not_open' THEN RAISE EXCEPTION 'Kỳ nộp chưa mở.'; END IF;
   IF phase_='closed' THEN RAISE EXCEPTION 'Kỳ nộp đã đóng hoàn toàn.'; END IF;
   IF phase_='overdue' THEN
    SELECT id INTO late_id FROM public.biz_late_requests WHERE user_id=d.user_id AND kind=d.kind AND period_kind=d.period_kind AND year=d.year AND period=d.period AND status='approved' ORDER BY created_at DESC LIMIT 1 FOR UPDATE;
    IF late_id IS NULL THEN RAISE EXCEPTION 'Đã quá hạn nộp trực tiếp. Cần được duyệt nộp bù.'; END IF;
    UPDATE public.biz_late_requests SET status='used',used_at=now() WHERE id=late_id;
   END IF;
   UPDATE public.biz_documents SET deadline=public.biz_any_deadline_at(d.kind||'_'||d.period_kind,d.year,d.period),deadline_frozen=true,first_submitted_at=now(),late_submitted=phase_='overdue' WHERE id=d.id;
  END;
 END IF;$gate$);
 EXECUTE f;
END $patch$;
-- Return allocations when starting an adjustment, and use universal boundaries for report reads.
DO $patch$
DECLARE f text;
BEGIN
 SELECT pg_get_functiondef('public.biz_document_start(text,text,integer,integer,text)'::regprocedure) INTO f;
 f:=replace(f,'attachments=old.attachments,target_version_id=old.target_version_id','attachments=old.attachments,allocations=old.allocations,target_version_id=old.target_version_id'); EXECUTE f;
 SELECT pg_get_functiondef('public.biz_documents_read(text,text,integer,integer)'::regprocedure) INTO f;
 f:=replace(f,'public.biz_period_department(p.id,_year,_period_kind,_period)','public.biz_period_department_any(p.id,_period_kind,_year,_period)');
 f:=replace(f,'public.biz_deadline_at(_kind||''_''||_period_kind,_year,_period)','public.biz_any_deadline_at(_kind||''_''||_period_kind,_year,_period)');
 f:=replace(f,'WHERE public.biz_doc_access(p.id,coalesce(d.department_id,dep.id),_kind);','WHERE public.biz_doc_access(p.id,coalesce(d.department_id,dep.id),_kind) AND (_kind<>''report'' OR d.id IS NOT NULL OR public.biz_report_cycle_of(p.id,public.biz_period_start_date(_period_kind,_year,_period))=_period_kind);');
 EXECUTE f;
END $patch$;