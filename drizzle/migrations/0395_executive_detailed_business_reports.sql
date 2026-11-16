-- Company executive: READ detailed plans/reports for every business system.
-- Do NOT change public.biz_doc_access: it also protects writes/approvals.
-- Explicitly add the V2 exception only inside the read-only RPCs.
BEGIN;
SET LOCAL lock_timeout='8s';
SET LOCAL statement_timeout='60s';

DO $scope$
DECLARE fn text; def text; needle text; replacement text;
BEGIN
  IF NOT private.executive_v2_read_scope('f2ad667f-af07-4bad-be3c-6da39bc2e8f0'::uuid) THEN
    RAISE EXCEPTION 'Executive V2 read scope is not active; refuse patch';
  END IF;

  fn:='public.biz_documents_read(text,text,integer,integer)';
  SELECT pg_get_functiondef(fn::regprocedure) INTO def;
  needle:='WHERE public.biz_doc_access(p.id,coalesce(d.department_id,dep.id),_kind) AND';
  replacement:='WHERE (private.executive_v2_read_scope(auth.uid()) OR public.biz_doc_access(p.id,coalesce(d.department_id,dep.id),_kind)) AND';
  IF position(replacement IN def)=0 THEN
    IF position(needle IN def)=0 THEN RAISE EXCEPTION 'Document read guard changed'; END IF;
    def:=replace(def,needle,replacement);
  END IF;
  EXECUTE def;

  fn:='public.biz_report_metrics(uuid,integer,text,integer,text)';
  SELECT pg_get_functiondef(fn::regprocedure) INTO def;
  needle:='IF NOT public.biz_doc_access(_user,coalesce(d_.department_id,public.biz_period_department_any(_user,_period_kind,_year,_period)),''report'') THEN';
  replacement:='IF NOT (private.executive_v2_read_scope(auth.uid()) OR public.biz_doc_access(_user,coalesce(d_.department_id,public.biz_period_department_any(_user,_period_kind,_year,_period)),''report'')) THEN';
  IF position(replacement IN def)=0 THEN
    IF position(needle IN def)=0 THEN RAISE EXCEPTION 'Daily/weekly report metrics guard changed'; END IF;
    def:=replace(def,needle,replacement);
  END IF;
  needle:='IF NOT public.biz_doc_access(_user,coalesce((SELECT department_id FROM public.biz_documents WHERE user_id=_user AND kind=''report'' AND year=_year AND period_kind=_period_kind AND period=_period),dep),''report'') THEN';
  replacement:='IF NOT (private.executive_v2_read_scope(auth.uid()) OR public.biz_doc_access(_user,coalesce((SELECT department_id FROM public.biz_documents WHERE user_id=_user AND kind=''report'' AND year=_year AND period_kind=_period_kind AND period=_period),dep),''report'')) THEN';
  IF position(replacement IN def)=0 THEN
    IF position(needle IN def)=0 THEN RAISE EXCEPTION 'Period report metrics guard changed'; END IF;
    def:=replace(def,needle,replacement);
  END IF;
  EXECUTE def;

  fn:='public.biz_late_requests_read(text,text,integer,integer)';
  SELECT pg_get_functiondef(fn::regprocedure) INTO def;
  needle:='(l.user_id=auth.uid() OR public.biz_all_scope(auth.uid()) OR public.biz_scope_ok(';
  replacement:='(l.user_id=auth.uid() OR private.executive_v2_read_scope(auth.uid()) OR public.biz_all_scope(auth.uid()) OR public.biz_scope_ok(';
  IF position(replacement IN def)=0 THEN
    IF position(needle IN def)=0 THEN RAISE EXCEPTION 'Late-request read guard changed'; END IF;
    def:=replace(def,needle,replacement);
  END IF;
  EXECUTE def;
END
$scope$;
COMMIT;
