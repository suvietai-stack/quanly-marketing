-- PENDING explicit owner approval. No business rows or permissions changed.
SET LOCAL lock_timeout='2s';
DO $$ BEGIN
 IF md5(pg_get_functiondef('private.k3_plan_changed()'::regprocedure)) <> '747bba016fb854adde9ea58fe6e11336'
 THEN RAISE EXCEPTION '3K plan trigger changed: snapshot must be refreshed'; END IF;
END $$;
CREATE OR REPLACE FUNCTION private.k3_plan_changed()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE goals uuid[]:='{}'; actions uuid[]:='{}'; users uuid[]:='{}'; r jsonb; u record;
BEGIN
 -- OLD and NEW both participate: reassignment/revocation must not miss either side.
 FOR r IN SELECT value FROM jsonb_array_elements(jsonb_build_array(
   CASE WHEN TG_OP<>'INSERT' THEN to_jsonb(OLD) ELSE '{}'::jsonb END,
   CASE WHEN TG_OP<>'DELETE' THEN to_jsonb(NEW) ELSE '{}'::jsonb END)) LOOP
  IF TG_TABLE_NAME='k3_goals' THEN goals:=array_append(goals,(r->>'id')::uuid);
  ELSE goals:=array_append(goals,(r->>'goal_id')::uuid); END IF;
  IF TG_TABLE_NAME='k3_actions' THEN actions:=array_append(actions,(r->>'id')::uuid);
  ELSE actions:=array_append(actions,(r->>'action_id')::uuid); END IF;
  users:=users||ARRAY[(r->>'user_id')::uuid,(r->>'assignee_id')::uuid];
 END LOOP;
 SELECT coalesce(array_agg(DISTINCT id),'{}') INTO goals FROM (
  SELECT unnest(goals) id UNION SELECT goal_id FROM k3_actions WHERE id=ANY(actions)
 ) x WHERE id IS NOT NULL;
 FOR u IN
  SELECT DISTINCT p.id FROM profiles p JOIN (
   SELECT unnest(users) id
   UNION SELECT user_id FROM k3_goals WHERE id=ANY(goals)
   UNION SELECT user_id FROM k3_goal_members WHERE goal_id=ANY(goals) AND status='accepted'
   UNION SELECT assignee_id FROM k3_actions WHERE goal_id=ANY(goals)
   UNION SELECT c.user_id FROM k3_action_collaborators c JOIN k3_actions a ON a.id=c.action_id WHERE a.goal_id=ANY(goals)
  ) affected ON affected.id=p.id
  WHERE p.status='Đang hoạt động' AND public.k3_can(p.id,'k3.use') AND public.biz_participant(p.id)
  ORDER BY p.id
 LOOP PERFORM private.k3_plan_capture(u.id); END LOOP;
 RETURN NULL;
END $$;
-- Keep the capture formula, cutoff, initial snapshots and ACLs unchanged.
DROP TRIGGER k3_plan_change ON public.k3_actions;
CREATE TRIGGER k3_plan_change AFTER INSERT OR UPDATE ON public.k3_actions FOR EACH ROW EXECUTE FUNCTION private.k3_plan_changed();
DROP TRIGGER k3_goal_plan_change ON public.k3_goals;
CREATE TRIGGER k3_goal_plan_change AFTER INSERT OR UPDATE ON public.k3_goals FOR EACH ROW EXECUTE FUNCTION private.k3_plan_changed();
DROP TRIGGER k3_member_plan_change ON public.k3_goal_members;
CREATE TRIGGER k3_member_plan_change AFTER INSERT OR UPDATE OR DELETE ON public.k3_goal_members FOR EACH ROW EXECUTE FUNCTION private.k3_plan_changed();
DROP TRIGGER k3_collaborator_plan_change ON public.k3_action_collaborators;
CREATE TRIGGER k3_collaborator_plan_change AFTER INSERT OR UPDATE OR DELETE ON public.k3_action_collaborators FOR EACH ROW EXECUTE FUNCTION private.k3_plan_changed();