SET LOCAL lock_timeout='2s';
CREATE OR REPLACE FUNCTION private.k3_plan_changed()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE u record;
BEGIN
 -- Include assigned/cooperating employees; do not mint employee confirmations.
 FOR u IN SELECT id FROM profiles WHERE status='Đang hoạt động' AND public.k3_can(id,'k3.use') AND public.biz_participant(id) LOOP PERFORM private.k3_plan_capture(u.id); END LOOP;
 RETURN NULL;
END $function$
;
DROP TRIGGER k3_plan_change ON public.k3_actions;
CREATE TRIGGER k3_plan_change AFTER INSERT OR UPDATE ON public.k3_actions FOR EACH STATEMENT EXECUTE FUNCTION private.k3_plan_changed();
DROP TRIGGER k3_goal_plan_change ON public.k3_goals;
CREATE TRIGGER k3_goal_plan_change AFTER INSERT OR UPDATE ON public.k3_goals FOR EACH STATEMENT EXECUTE FUNCTION private.k3_plan_changed();
DROP TRIGGER k3_member_plan_change ON public.k3_goal_members;
CREATE TRIGGER k3_member_plan_change AFTER INSERT OR UPDATE OR DELETE ON public.k3_goal_members FOR EACH STATEMENT EXECUTE FUNCTION private.k3_plan_changed();
DROP TRIGGER k3_collaborator_plan_change ON public.k3_action_collaborators;
CREATE TRIGGER k3_collaborator_plan_change AFTER INSERT OR UPDATE OR DELETE ON public.k3_action_collaborators FOR EACH STATEMENT EXECUTE FUNCTION private.k3_plan_changed();
