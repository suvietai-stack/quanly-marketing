CREATE TABLE IF NOT EXISTS public.org_position_role_events(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id text NOT NULL, title_id text NOT NULL,
  before_role text, after_role text, actor_id uuid, reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.org_position_role_events TO authenticated;
GRANT ALL ON public.org_position_role_events TO service_role;
ALTER TABLE public.org_position_role_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_position_role_events_read ON public.org_position_role_events FOR SELECT TO authenticated USING (private.is_super_admin(auth.uid()));

DO $patch$
DECLARE def text;
BEGIN
 SELECT pg_get_functiondef('private.org_commands_v2(jsonb)'::regprocedure) INTO def;
 IF position('''position_role''' IN def)>0 THEN RAISE EXCEPTION 'already installed'; END IF;
 def:=replace(def,'IF x->>''action''<>''roles'' THEN', $b$IF x->>'action'='position_role' THEN
  IF NOT private.org_execution_ok() OR NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin gắn Role cho vị trí qua xem trước.' USING ERRCODE='42501'; END IF;
  IF NOT EXISTS(SELECT 1 FROM org_units WHERE id=v->>'unit_id' AND active) OR NOT EXISTS(SELECT 1 FROM org_titles WHERE id=v->>'title_id' AND active) THEN RAISE EXCEPTION 'Đơn vị hoặc chức danh không hợp lệ.'; END IF;
  IF nullif(v->>'role_id','') IS NOT NULL AND NOT EXISTS(SELECT 1 FROM app_roles WHERE id=v->>'role_id' AND role_kind='position' AND catalog_state='standard' AND NOT is_system AND catalog_generation>=2) THEN RAISE EXCEPTION 'Vị trí chỉ nhận Role chuẩn mới.'; END IF;
  SELECT role_id INTO src FROM org_position_roles WHERE unit_id=v->>'unit_id' AND title_id=v->>'title_id' FOR UPDATE;
  IF nullif(v->>'role_id','') IS NULL THEN DELETE FROM org_position_roles WHERE unit_id=v->>'unit_id' AND title_id=v->>'title_id';
  ELSE INSERT INTO org_position_roles(unit_id,title_id,role_id,updated_by) VALUES(v->>'unit_id',v->>'title_id',v->>'role_id',auth.uid())
   ON CONFLICT(unit_id,title_id) DO UPDATE SET role_id=excluded.role_id,revision=org_position_roles.revision+1,updated_at=now(),updated_by=auth.uid(); END IF;
  INSERT INTO org_position_role_events(unit_id,title_id,before_role,after_role,actor_id,reason) VALUES(v->>'unit_id',v->>'title_id',src,nullif(v->>'role_id',''),auth.uid(),coalesce(v->>'reason','Gắn Role cho vị trí'));
  result_:=result_||jsonb_build_array(v->>'unit_id'); CONTINUE;
 END IF;
 IF x->>'action'<>'roles' THEN$b$);
 EXECUTE def;
END $patch$;