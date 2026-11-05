ALTER TABLE public.k3_goals ADD COLUMN IF NOT EXISTS creation_mode text;
COMMENT ON COLUMN public.k3_goals.creation_mode IS 'Creation provenance for new quick-created work: basic/advanced; NULL means unknown legacy, never inferred from old structures.';
DO $patch$
DECLARE def text; changed text;
BEGIN
 def:=pg_get_functiondef('public.k3_quick_create(jsonb)'::regprocedure);
 IF position('SET creation_mode=' IN def)=0 THEN
  changed:=replace(def,'gid:=(g->>''id'')::uuid;','gid:=(g->>''id'')::uuid; UPDATE public.k3_goals SET creation_mode=CASE WHEN p->>''creation_mode'' IN (''basic'',''advanced'') THEN p->>''creation_mode'' ELSE NULL END WHERE id=gid;');
  IF changed=def THEN RAISE EXCEPTION 'Quick create provenance anchor missing'; END IF;
  EXECUTE changed;
 END IF;
 def:=pg_get_functiondef('public.k3_kpi_day_read(date)'::regprocedure);
 changed:=replace(def,'g.creation_mode=''basic'' AND (SELECT count(*)','(SELECT count(*)');
 IF changed<>def THEN EXECUTE changed; END IF;
END $patch$;

CREATE OR REPLACE FUNCTION private.k3_goal_has_results(_goal uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
 SELECT EXISTS(SELECT 1 FROM k3_kpi_results r WHERE r.goal_id=_goal OR r.action_id IN(SELECT id FROM k3_actions WHERE goal_id=_goal) OR r.kpi_id IN(SELECT k.id FROM k3_kpis k LEFT JOIN k3_actions a ON a.id=k.action_id WHERE coalesce(k.goal_id,a.goal_id)=_goal))
 OR EXISTS(SELECT 1 FROM k3_kpi_result_versions v WHERE v.snapshot->>'goal_id'=_goal::text OR v.snapshot->>'action_id' IN(SELECT id::text FROM k3_actions WHERE goal_id=_goal))
 OR EXISTS(SELECT 1 FROM k3_tasks t JOIN k3_actions a ON a.id=t.action_id WHERE a.goal_id=_goal AND (t.kpi_actual IS NOT NULL OR t.status IN('doing','done','incomplete') OR coalesce(t.progress,0)>0 OR EXISTS(SELECT 1 FROM k3_task_events e WHERE e.task_id=t.id AND e.action NOT IN('create','delete'))))
$fn$;
CREATE OR REPLACE FUNCTION private.k3_action_has_results(_action uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
 SELECT EXISTS(SELECT 1 FROM k3_kpi_results r WHERE r.action_id=_action OR r.kpi_id IN(SELECT id FROM k3_kpis WHERE action_id=_action))
 OR EXISTS(SELECT 1 FROM k3_kpi_result_versions v WHERE v.snapshot->>'action_id'=_action::text)
 OR EXISTS(SELECT 1 FROM k3_tasks t WHERE t.action_id=_action AND (t.kpi_actual IS NOT NULL OR t.status IN('doing','done','incomplete') OR coalesce(t.progress,0)>0 OR EXISTS(SELECT 1 FROM k3_task_events e WHERE e.task_id=t.id AND e.action NOT IN('create','delete'))))
$fn$;
DO $patch$
DECLARE def text; anchor text;
BEGIN
 def:=pg_get_functiondef('private.k3_goal_has_official(uuid)'::regprocedure);
 anchor:='SELECT EXISTS';
 IF position('k3_employee_reviews' IN def)=0 THEN
  def:=replace(def,anchor,'SELECT EXISTS(SELECT 1 FROM k3_employee_reviews r WHERE jsonb_path_exists(r.snapshot,''$.** ? (@ == $id)'',jsonb_build_object(''id'',_goal::text))) OR EXISTS(SELECT 1 FROM k3_daily_closes c WHERE jsonb_path_exists(c.snapshot,''$.** ? (@ == $id)'',jsonb_build_object(''id'',_goal::text))) OR EXISTS');
  EXECUTE def;
 END IF;
 def:=pg_get_functiondef('private.k3_action_has_official(uuid)'::regprocedure);
 IF position('k3_employee_reviews' IN def)=0 THEN
  def:=replace(def,anchor,'SELECT EXISTS(SELECT 1 FROM k3_employee_reviews r WHERE jsonb_path_exists(r.snapshot,''$.** ? (@ == $id)'',jsonb_build_object(''id'',_action::text))) OR EXISTS(SELECT 1 FROM k3_daily_closes c WHERE jsonb_path_exists(c.snapshot,''$.** ? (@ == $id)'',jsonb_build_object(''id'',_action::text))) OR EXISTS');
  EXECUTE def;
 END IF;
 def:=pg_get_functiondef('public.k3_soft_delete(text,uuid)'::regprocedure);
 IF position('k3delete hotfix fence' IN def)=0 THEN
  def:=replace(def,'IF _kind=''goal'' THEN','-- k3delete hotfix fence
  IF NOT public.k3_can(uid,''k3.use'') THEN RAISE EXCEPTION ''Bạn không có quyền xóa công việc.''; END IF;
  PERFORM pg_advisory_xact_lock(hashtext(''k3owner''),hashtext(uid::text));
  IF _kind=''action'' AND EXISTS(SELECT 1 FROM k3_actions x WHERE x.id=_id AND x.deleted_at IS NULL AND NOT EXISTS(SELECT 1 FROM k3_actions s WHERE s.goal_id=x.goal_id AND s.id<>x.id AND s.deleted_at IS NULL)) THEN
    RETURN public.k3_soft_delete(''goal'',(SELECT goal_id FROM k3_actions WHERE id=_id));
  END IF;
  IF _kind=''goal'' THEN');
  def:=replace(def,'IF private.k3_goal_has_official(vg.id) THEN','PERFORM k.id FROM k3_kpis k LEFT JOIN k3_actions a ON a.id=k.action_id WHERE coalesce(k.goal_id,a.goal_id)=vg.id ORDER BY k.id FOR UPDATE OF k;
    IF vg.status=''cancelled'' THEN RAISE EXCEPTION ''Công việc đã hủy được giữ trong lịch sử, không chuyển vào Thùng rác.''; END IF;
    IF private.k3_goal_has_official(vg.id) THEN');
  def:=replace(def,'IF private.k3_action_has_official(va.id) THEN','PERFORM k.id FROM k3_kpis k WHERE k.action_id=va.id ORDER BY k.id FOR UPDATE;
    IF va.status=''cancelled'' OR vg.status=''cancelled'' THEN RAISE EXCEPTION ''Công việc đã hủy được giữ trong lịch sử, không chuyển vào Thùng rác.''; END IF;
    IF private.k3_action_has_official(va.id) THEN');
  EXECUTE def;
 END IF;
 def:=pg_get_functiondef('public.k3_deletable(text,uuid)'::regprocedure);
 IF position('k3delete hotfix fence' IN def)=0 THEN
  def:=replace(def,'IF _kind=''goal'' THEN','-- k3delete hotfix fence
  IF NOT public.k3_can(uid,''k3.use'') THEN RETURN jsonb_build_object(''ok'',false,''reason'',''Bạn không có quyền xóa công việc.''); END IF;
  IF _kind=''action'' AND EXISTS(SELECT 1 FROM k3_actions x WHERE x.id=_id AND x.deleted_at IS NULL AND NOT EXISTS(SELECT 1 FROM k3_actions s WHERE s.goal_id=x.goal_id AND s.id<>x.id AND s.deleted_at IS NULL)) THEN
    RETURN public.k3_deletable(''goal'',(SELECT goal_id FROM k3_actions WHERE id=_id));
  END IF;
  IF _kind=''goal'' THEN');
  def:=replace(def,'IF private.k3_goal_has_official(g.id) THEN','IF g.status=''cancelled'' THEN RETURN jsonb_build_object(''ok'',false,''reason'',''Công việc đã hủy được giữ trong lịch sử.''); END IF; IF private.k3_goal_has_official(g.id) THEN');
  def:=replace(def,'IF private.k3_action_has_official(a.id) THEN','IF a.status=''cancelled'' OR g.status=''cancelled'' THEN RETURN jsonb_build_object(''ok'',false,''reason'',''Công việc đã hủy được giữ trong lịch sử.''); END IF; IF private.k3_action_has_official(a.id) THEN');
  EXECUTE def;
 END IF;
 def:=pg_get_functiondef('public.k3_kpi_result_save(jsonb)'::regprocedure);
 IF position('k3delete result fence' IN def)=0 THEN
  def:=replace(def,'SELECT * INTO k FROM public.k3_kpis WHERE id=kid FOR UPDATE;','SELECT * INTO k FROM public.k3_kpis WHERE id=kid FOR UPDATE;
  -- k3delete result fence: recheck visibility after waiting on the KPI lock.
  IF NOT private.k3_result_can_write(uid,kid) THEN RAISE EXCEPTION ''Công việc đã thay đổi hoặc đang ở Thùng rác. Vui lòng tải lại.''; END IF;');
  EXECUTE def;
 END IF;
END $patch$;
CREATE OR REPLACE FUNCTION public.k3_draft_delete(_kind text,_id uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
BEGIN RETURN public.k3_soft_delete(_kind,_id); END $fn$;
COMMENT ON FUNCTION public.k3_draft_delete(text,uuid) IS 'Compatibility alias for unified protected work deletion; not restricted to draft status.';
REVOKE ALL ON FUNCTION public.k3_draft_delete(text,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.k3_draft_delete(text,uuid) TO authenticated;