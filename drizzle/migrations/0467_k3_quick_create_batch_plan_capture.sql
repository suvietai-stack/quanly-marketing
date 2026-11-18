-- 3K quick-create hotfix: preserve all original write/RLS/locking semantics while
-- calculating the daily plan checkpoint only once after the atomic KG/KF/KPI write.
-- Today the AFTER triggers on goal/action fire repeatedly inside one RPC, and
-- each invokes private.k3_plan_capture (which recalculates the entire day's plan).
-- Keep individual updates outside quick-create unchanged and preserve audit/history.
DO $patch$
DECLARE
  trigger_def text;
  quick_def text;
  affected_sql text;
BEGIN
  trigger_def := pg_get_functiondef('private.k3_plan_changed()'::regprocedure);
  IF position('app.k3_quick_create_batch' IN trigger_def)=0 THEN
    IF trigger_def !~ 'BEGIN[[:space:]]+FOR r IN SELECT' THEN
      RAISE EXCEPTION '3K plan trigger changed; cannot safely batch quick-create.';
    END IF;
    trigger_def := regexp_replace(trigger_def,
      'BEGIN[[:space:]]+FOR r IN SELECT',
      E'BEGIN\\n -- The quick-create RPC captures its affected staff once after its last write.\\n IF current_setting(''app.k3_quick_create_batch'',true)=''on'' THEN RETURN NULL; END IF;\\n FOR r IN SELECT');
    EXECUTE trigger_def;
  END IF;

  quick_def := pg_get_functiondef('public.k3_quick_create(jsonb)'::regprocedure);
  IF position('app.k3_quick_create_batch' IN quick_def)=0 THEN
    IF position(' g:=public.k3_goal_save(' IN quick_def)=0
       OR position(' RETURN jsonb_build_object(''goal_id'',gid,''kf_count'',created_kf,''duplicated'',false);' IN quick_def)=0 THEN
      RAISE EXCEPTION '3K quick-create changed; refusing unsafe optimization.';
    END IF;

    quick_def := replace(quick_def,
      ' g:=public.k3_goal_save(',
      ' PERFORM set_config(''app.k3_quick_create_batch'',''on'',true); g:=public.k3_goal_save(');

    -- The exact same actor filter as private.k3_plan_changed: capture the owner,
    -- accepted members, assigned workers and collaborators, once per active user.
    affected_sql := $affected$
 PERFORM set_config('app.k3_quick_create_batch','off',true);
 FOR participant IN
   SELECT DISTINCT p.id
   FROM public.profiles p
   JOIN (
     SELECT user_id AS uid FROM public.k3_goals WHERE id=gid
     UNION SELECT user_id FROM public.k3_goal_members WHERE goal_id=gid AND status='accepted'
     UNION SELECT assignee_id FROM public.k3_actions WHERE goal_id=gid
     UNION SELECT c.user_id FROM public.k3_action_collaborators c
       JOIN public.k3_actions a ON a.id=c.action_id WHERE a.goal_id=gid
   ) affected ON affected.uid=p.id
   WHERE p.status='Đang hoạt động'
     AND public.k3_can(p.id,'k3.use')
     AND public.biz_participant(p.id)
   ORDER BY p.id
 LOOP
   PERFORM private.k3_plan_capture(participant.id);
 END LOOP;
$affected$;

    quick_def := replace(quick_def,
      'created_kf int:=0;',
      'created_kf int:=0;participant record;');
    IF position('participant record;' IN quick_def)=0 THEN
      RAISE EXCEPTION '3K quick-create declaration changed; refusing unsafe optimization.';
    END IF;

    quick_def := replace(quick_def,
      ' RETURN jsonb_build_object(''goal_id'',gid,''kf_count'',created_kf,''duplicated'',false);',
      affected_sql || ' RETURN jsonb_build_object(''goal_id'',gid,''kf_count'',created_kf,''duplicated'',false);');
    EXECUTE quick_def;
  END IF;
END
$patch$;

-- Do not change execute grants, triggers, staff roles or existing data.
