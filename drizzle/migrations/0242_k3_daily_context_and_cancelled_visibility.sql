DO $patch$
DECLARE def text; changed text;
BEGIN
 def:=pg_get_functiondef('public.k3_goal_list(text,text)'::regprocedure);
 changed:=replace(def,'WHERE g.deleted_at IS NULL','WHERE g.deleted_at IS NULL AND g.status<>''cancelled''');
 IF changed=def THEN RAISE EXCEPTION 'k3_goal_list visibility anchor missing'; END IF;
 EXECUTE changed;
 def:=pg_get_functiondef('public.k3_kpi_day_read(date)'::regprocedure);
 changed:=replace(def,'''id'',a.id,''name'',a.name,''goal_name'',g.name,''due_date'',a.due_date', '''id'',a.id,''goal_id'',g.id,''name'',a.name,''goal_name'',g.name,''due_date'',CASE WHEN a.inherit_timeline THEN coalesce(g.due_date,g.period_end) ELSE coalesce(a.due_date,g.period_end) END,''due_time'',CASE WHEN a.inherit_timeline THEN g.due_time ELSE a.due_time END');
 IF changed=def THEN RAISE EXCEPTION 'k3_kpi_day_read metadata anchor missing'; END IF;
 EXECUTE changed;
END $patch$;
COMMENT ON FUNCTION public.k3_goal_list(text,text) IS 'Operational lists exclude cancelled and deleted work; historical records and protected results are retained unchanged. Personal scope still requires ownership or valid assignment.';