-- Rolling plans get their own workflow kind (goal_year fallback kept), submit uses the currently managing department, and table-wide locks become per-user advisory locks.
ALTER TABLE public.biz_approval_workflows DROP CONSTRAINT biz_approval_workflows_kind_check;
ALTER TABLE public.biz_approval_workflows ADD CONSTRAINT biz_approval_workflows_kind_check CHECK(kind IN ('goal_year','rolling_plan','report_day','report_week','report_month','report_quarter','report_year','late_plan_month','late_plan_quarter','late_plan_year','late_report_day','late_report_week','late_report_month','late_report_quarter','late_report_year'));
DO $patch$
DECLARE f text;
BEGIN
 -- Rolling approvals use goal-approval permission everywhere kinds are mapped.
 SELECT pg_get_functiondef('public.biz_approval_start(uuid,text,uuid,uuid,jsonb)'::regprocedure) INTO f;
 f:=replace(f,'CASE WHEN _kind=''goal_year'' THEN ''biz.goal_approve'' ELSE ''biz.report_approve'' END','CASE WHEN _kind IN (''goal_year'',''rolling_plan'') THEN ''biz.goal_approve'' ELSE ''biz.report_approve'' END');EXECUTE f;
 SELECT pg_get_functiondef('public.biz_workflow_save(jsonb)'::regprocedure) INTO f;
 f:=replace(f,'CASE WHEN kind_=''goal_year'' THEN ''biz.goal_approve'' ELSE ''biz.report_approve'' END','CASE WHEN kind_ IN (''goal_year'',''rolling_plan'') THEN ''biz.goal_approve'' ELSE ''biz.report_approve'' END');EXECUTE f;
 SELECT pg_get_functiondef('public.biz_workflow_preview(jsonb)'::regprocedure) INTO f;
 f:=replace(f,'CASE WHEN _data->>''kind''=''goal_year'' THEN ''biz.goal_approve'' ELSE ''biz.report_approve'' END','CASE WHEN _data->>''kind'' IN (''goal_year'',''rolling_plan'') THEN ''biz.goal_approve'' ELSE ''biz.report_approve'' END');EXECUTE f;
 SELECT pg_get_functiondef('public.biz_approvals_read()'::regprocedure) INTO f;
 f:=replace(f,'CASE WHEN a.kind=''goal_year'' THEN ''biz.goal_approve'' ELSE ''biz.report_approve'' END','CASE WHEN a.kind IN (''goal_year'',''rolling_plan'') THEN ''biz.goal_approve'' ELSE ''biz.report_approve'' END');
 f:=replace(f,'WHEN a.kind=''goal_year'' THEN coalesce((SELECT revision FROM public.biz_rolling_plans WHERE id=a.version_id),(SELECT revision FROM public.biz_goal_versions WHERE id=a.version_id))','WHEN a.kind IN (''goal_year'',''rolling_plan'') THEN coalesce((SELECT revision FROM public.biz_rolling_plans WHERE id=a.version_id),(SELECT revision FROM public.biz_goal_versions WHERE id=a.version_id))');EXECUTE f;
 -- rolling_save: per-user advisory lock instead of table lock; department resolved at submit time; rolling_plan workflow with explicit goal_year fallback.
 SELECT pg_get_functiondef('public.biz_rolling_save(uuid,jsonb,text,integer,boolean)'::regprocedure) INTO f;
 IF position('LOCK TABLE public.biz_documents IN SHARE MODE;' IN f)=0 THEN RAISE EXCEPTION 'Rolling save lock shape changed.'; END IF;
 f:=replace(f,'DECLARE g public.biz_annual_goals;p public.biz_rolling_plans;b jsonb;id_ uuid;run_ uuid;','DECLARE g public.biz_annual_goals;p public.biz_rolling_plans;b jsonb;id_ uuid;run_ uuid;dept_ uuid;kind_ text;');
 f:=replace(f,'LOCK TABLE public.biz_documents IN SHARE MODE; SELECT * INTO g FROM public.biz_annual_goals WHERE id=_goal FOR UPDATE;','SELECT * INTO g FROM public.biz_annual_goals WHERE id=_goal FOR UPDATE; PERFORM pg_advisory_xact_lock(hashtext(''biz_report_docs:''||g.user_id::text));');
 f:=replace(f,$old$run_:=public.biz_approval_start(id_,'goal_year',g.user_id,g.department_id,jsonb_build_object('entity','rolling_plan','goal_id',g.id,'year',g.year,'reason',_reason,'items',_items,'basis',b));
 IF run_ IS NULL THEN RAISE EXCEPTION 'Cần cấu hình luồng phê duyệt KR trước khi gửi.';END IF;$old$,$new$dept_:=coalesce(public.biz_department_at(g.user_id,(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date),g.department_id);
 kind_:=CASE WHEN EXISTS(SELECT 1 FROM public.biz_approval_workflows w WHERE w.active AND w.kind='rolling_plan' AND w.system_id=(SELECT system_id FROM public.biz_departments WHERE id=dept_) AND (w.department_id IS NULL OR w.department_id=dept_) AND w.effective_from<=now()) THEN 'rolling_plan' ELSE 'goal_year' END;
 run_:=public.biz_approval_start(id_,kind_,g.user_id,dept_,jsonb_build_object('entity','rolling_plan','workflow_kind',kind_,'goal_id',g.id,'year',g.year,'reason',_reason,'items',_items,'basis',b,'goal_department_id',g.department_id));
 IF run_ IS NULL THEN RAISE EXCEPTION 'Chưa có luồng phê duyệt KR cho đơn vị hiện tại. Vào Quản trị Kinh doanh → Cài đặt → Quy trình phê duyệt để khởi tạo.';END IF;$new$);
 EXECUTE f;
 -- rolling_decide: same lock narrowing.
 SELECT pg_get_functiondef('public.biz_rolling_decide(uuid,integer,boolean,text)'::regprocedure) INTO f;
 IF position('LOCK TABLE public.biz_documents IN SHARE MODE;' IN f)=0 THEN RAISE EXCEPTION 'Rolling decide lock shape changed.'; END IF;
 f:=replace(f,'LOCK TABLE public.biz_documents IN SHARE MODE; SELECT * INTO p FROM public.biz_rolling_plans WHERE id=_id;','SELECT * INTO p FROM public.biz_rolling_plans WHERE id=_id;');
 f:=replace(f,'SELECT * INTO g FROM public.biz_annual_goals WHERE id=p.goal_id FOR UPDATE;','SELECT * INTO g FROM public.biz_annual_goals WHERE id=p.goal_id FOR UPDATE; PERFORM pg_advisory_xact_lock(hashtext(''biz_report_docs:''||g.user_id::text));');
 EXECUTE f;
 -- Report saves and opening confirmations serialize with rolling basis reads for the same user only.
 SELECT pg_get_functiondef('public.biz_document_save(uuid,integer,text,text,jsonb,boolean,jsonb,jsonb)'::regprocedure) INTO f;
 IF position('IF v.status NOT IN (''draft'',''changes'') THEN RAISE EXCEPTION ''Tài liệu đang chờ duyệt hoặc đã khóa.''; END IF;' IN f)=0 THEN RAISE EXCEPTION 'Document save shape changed.'; END IF;
 f:=replace(f,'IF v.status NOT IN (''draft'',''changes'') THEN RAISE EXCEPTION ''Tài liệu đang chờ duyệt hoặc đã khóa.''; END IF;','PERFORM pg_advisory_xact_lock(hashtext(''biz_report_docs:''||d.user_id::text)); IF v.status NOT IN (''draft'',''changes'') THEN RAISE EXCEPTION ''Tài liệu đang chờ duyệt hoặc đã khóa.''; END IF;');
 EXECUTE f;
 SELECT pg_get_functiondef('public.biz_opening_actual_save(jsonb)'::regprocedure) INTO f;
 f:=replace(f,'PERFORM pg_advisory_xact_lock(hashtext(''biz_opening:''||uid::text));','PERFORM pg_advisory_xact_lock(hashtext(''biz_report_docs:''||uid::text)); PERFORM pg_advisory_xact_lock(hashtext(''biz_opening:''||uid::text));');
 EXECUTE f;
END $patch$;