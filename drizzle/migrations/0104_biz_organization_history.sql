CREATE TABLE public.biz_systems(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),name text NOT NULL,active boolean NOT NULL DEFAULT true,created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.biz_systems TO authenticated; GRANT ALL ON public.biz_systems TO service_role;
ALTER TABLE public.biz_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biz_departments ADD COLUMN system_id uuid REFERENCES public.biz_systems(id);
CREATE TABLE public.biz_department_system_history(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),department_id uuid NOT NULL REFERENCES public.biz_departments(id),system_id uuid NOT NULL REFERENCES public.biz_systems(id),started_at timestamptz NOT NULL DEFAULT now(),ended_at timestamptz,actor_id uuid NOT NULL REFERENCES public.profiles(id));
GRANT SELECT ON public.biz_department_system_history TO authenticated; GRANT ALL ON public.biz_department_system_history TO service_role;
ALTER TABLE public.biz_department_system_history ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX biz_department_system_current ON public.biz_department_system_history(department_id) WHERE ended_at IS NULL;
CREATE TABLE public.biz_teams(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),department_id uuid NOT NULL REFERENCES public.biz_departments(id),name text NOT NULL,active boolean NOT NULL DEFAULT true,created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.biz_teams TO authenticated; GRANT ALL ON public.biz_teams TO service_role;
ALTER TABLE public.biz_teams ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.biz_team_members(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),team_id uuid NOT NULL REFERENCES public.biz_teams(id),user_id uuid NOT NULL REFERENCES public.profiles(id),started_at timestamptz NOT NULL DEFAULT now(),ended_at timestamptz,actor_id uuid NOT NULL REFERENCES public.profiles(id));
GRANT SELECT ON public.biz_team_members TO authenticated; GRANT ALL ON public.biz_team_members TO service_role;
ALTER TABLE public.biz_team_members ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX biz_team_member_current ON public.biz_team_members(user_id) WHERE ended_at IS NULL;
CREATE TABLE public.biz_management_assignments(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),position text NOT NULL CHECK(position IN ('director','department_head','team_lead')),system_id uuid REFERENCES public.biz_systems(id),department_id uuid REFERENCES public.biz_departments(id),team_id uuid REFERENCES public.biz_teams(id),user_id uuid NOT NULL REFERENCES public.profiles(id),started_at timestamptz NOT NULL DEFAULT now(),ended_at timestamptz,actor_id uuid NOT NULL REFERENCES public.profiles(id),CHECK((position='director' AND system_id IS NOT NULL AND department_id IS NULL AND team_id IS NULL) OR (position='department_head' AND system_id IS NULL AND department_id IS NOT NULL AND team_id IS NULL) OR (position='team_lead' AND system_id IS NULL AND department_id IS NULL AND team_id IS NOT NULL)));
GRANT SELECT ON public.biz_management_assignments TO authenticated; GRANT ALL ON public.biz_management_assignments TO service_role;
ALTER TABLE public.biz_management_assignments ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX biz_one_director ON public.biz_management_assignments(system_id) WHERE position='director' AND ended_at IS NULL;
CREATE UNIQUE INDEX biz_one_head ON public.biz_management_assignments(department_id) WHERE position='department_head' AND ended_at IS NULL;
CREATE UNIQUE INDEX biz_one_lead ON public.biz_management_assignments(team_id) WHERE position='team_lead' AND ended_at IS NULL;
CREATE TABLE public.biz_org_events(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),actor_id uuid NOT NULL REFERENCES public.profiles(id),action text NOT NULL,payload jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.biz_org_events TO authenticated; GRANT ALL ON public.biz_org_events TO service_role;
ALTER TABLE public.biz_org_events ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.biz_org_can_manage() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT auth.uid() IS NOT NULL AND (public.is_super_admin(auth.uid()) OR private.sig_can(auth.uid(),'biz.org_manage')) $$;
CREATE FUNCTION public.biz_scope_ok(_actor uuid,_user uuid,_dept uuid,_at timestamptz DEFAULT now()) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
SELECT _actor IS NOT NULL AND (public.is_super_admin(_actor) OR private.sig_can(_actor,'biz.view_all') OR EXISTS(
 SELECT 1 FROM public.biz_management_assignments a WHERE a.user_id=_actor AND a.started_at<=now() AND a.ended_at IS NULL AND (
 (a.position='director' AND EXISTS(SELECT 1 FROM public.biz_department_system_history h WHERE h.department_id=_dept AND h.system_id=a.system_id AND h.started_at<=_at AND (h.ended_at IS NULL OR h.ended_at>_at))) OR
 (a.position='department_head' AND a.department_id=_dept) OR
 (a.position='team_lead' AND EXISTS(SELECT 1 FROM public.biz_team_members m JOIN public.biz_teams t ON t.id=m.team_id WHERE m.user_id=_user AND m.team_id=a.team_id AND t.department_id=_dept AND m.started_at<=_at AND (m.ended_at IS NULL OR m.ended_at>_at))))) OR
 (NOT EXISTS(SELECT 1 FROM public.biz_departments d WHERE d.id=_dept AND d.system_id IS NOT NULL) AND EXISTS(SELECT 1 FROM public.biz_department_members m WHERE m.user_id=_actor AND m.department_id=_dept AND m.is_manager AND m.ended_at IS NULL))) $$;
CREATE FUNCTION public.biz_org_read() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Cần đăng nhập.'; END IF;
 IF NOT public.biz_org_can_manage() AND NOT private.sig_can(auth.uid(),'biz.workflow_manage') THEN RAISE EXCEPTION 'Không có quyền xem cài đặt cơ cấu.'; END IF;
 RETURN jsonb_build_object('systems',(SELECT coalesce(jsonb_agg(to_jsonb(s) ORDER BY created_at),'[]') FROM public.biz_systems s),'departments',(SELECT coalesce(jsonb_agg(to_jsonb(d) ORDER BY sort_order,name),'[]') FROM public.biz_departments d),'teams',(SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY name),'[]') FROM public.biz_teams t),'members',(SELECT coalesce(jsonb_agg(to_jsonb(m)),'[]') FROM public.biz_department_members m),'team_members',(SELECT coalesce(jsonb_agg(to_jsonb(m)),'[]') FROM public.biz_team_members m),'managers',(SELECT coalesce(jsonb_agg(to_jsonb(a)),'[]') FROM public.biz_management_assignments a),'events',(SELECT coalesce(jsonb_agg(to_jsonb(e) ORDER BY created_at DESC),'[]') FROM (SELECT * FROM public.biz_org_events ORDER BY created_at DESC LIMIT 200) e));
END $$;
CREATE FUNCTION public.biz_org_save(_action text,_data jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_id uuid:=nullif(_data->>'id','')::uuid; dep uuid:=nullif(_data->>'department_id','')::uuid; sys uuid:=nullif(_data->>'system_id','')::uuid; team uuid:=nullif(_data->>'team_id','')::uuid; usr uuid:=nullif(_data->>'user_id','')::uuid; pos text:=_data->>'position'; n text:=btrim(_data->>'name'); act boolean:=coalesce((_data->>'active')::boolean,true); ts timestamptz:=clock_timestamp(); old jsonb;
BEGIN
 IF NOT public.biz_org_can_manage() THEN RAISE EXCEPTION 'Không có quyền quản lý cơ cấu.'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('biz_org_structure'));
 IF _action IN ('system','department','team') AND coalesce(n,'')='' THEN RAISE EXCEPTION 'Cần tên đơn vị.'; END IF;
 IF _action='system' THEN
  IF v_id IS NULL THEN INSERT INTO public.biz_systems(name,active) VALUES(n,act) RETURNING id INTO v_id;
  ELSE SELECT to_jsonb(s) INTO old FROM public.biz_systems s WHERE id=v_id FOR UPDATE; IF old IS NULL THEN RAISE EXCEPTION 'Không tìm thấy Hệ.'; END IF;
   IF NOT act AND (EXISTS(SELECT 1 FROM public.biz_departments WHERE system_id=v_id AND active) OR EXISTS(SELECT 1 FROM public.biz_management_assignments WHERE system_id=v_id AND ended_at IS NULL)) THEN RAISE EXCEPTION 'Hệ còn phòng hoặc quản lý đang hoạt động.'; END IF;
   UPDATE public.biz_systems SET name=n,active=act WHERE id=v_id; END IF;
 ELSIF _action='department' THEN
  IF v_id IS NULL THEN IF sys IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.biz_systems WHERE id=sys AND active) THEN RAISE EXCEPTION 'Hệ đã ngừng hoặc không tồn tại.'; END IF; INSERT INTO public.biz_departments(name,active,system_id) VALUES(n,act,sys) RETURNING id INTO v_id; IF sys IS NOT NULL THEN INSERT INTO public.biz_department_system_history(department_id,system_id,actor_id) VALUES(v_id,sys,auth.uid()); END IF;
  ELSE SELECT to_jsonb(d) INTO old FROM public.biz_departments d WHERE id=v_id FOR UPDATE; IF old IS NULL THEN RAISE EXCEPTION 'Không tìm thấy phòng.'; END IF;
   IF NOT act AND (EXISTS(SELECT 1 FROM public.biz_department_members WHERE department_id=v_id AND ended_at IS NULL) OR EXISTS(SELECT 1 FROM public.biz_teams WHERE department_id=v_id AND active) OR EXISTS(SELECT 1 FROM public.biz_management_assignments WHERE department_id=v_id AND ended_at IS NULL)) THEN RAISE EXCEPTION 'Phòng còn thành viên, nhóm hoặc quản lý hoạt động.'; END IF;
   UPDATE public.biz_departments SET name=n,active=act WHERE id=v_id; END IF;
 ELSIF _action='team' THEN
  IF NOT EXISTS(SELECT 1 FROM public.biz_departments WHERE id=dep AND active AND system_id IS NOT NULL) THEN RAISE EXCEPTION 'Phòng cần được ánh xạ vào Hệ đang hoạt động.'; END IF;
  IF v_id IS NULL THEN INSERT INTO public.biz_teams(department_id,name,active) VALUES(dep,n,act) RETURNING id INTO v_id;
  ELSE SELECT to_jsonb(t) INTO old FROM public.biz_teams t WHERE id=v_id FOR UPDATE; IF old IS NULL OR (old->>'department_id')::uuid<>dep THEN RAISE EXCEPTION 'Không đổi phòng của nhóm đã tạo.'; END IF;
   IF NOT act AND (EXISTS(SELECT 1 FROM public.biz_team_members WHERE team_id=v_id AND ended_at IS NULL) OR EXISTS(SELECT 1 FROM public.biz_management_assignments WHERE team_id=v_id AND ended_at IS NULL)) THEN RAISE EXCEPTION 'Nhóm còn thành viên hoặc quản lý hoạt động.'; END IF;
   UPDATE public.biz_teams SET name=n,active=act WHERE id=v_id; END IF;
 ELSIF _action='map' THEN
  IF NOT public.is_super_admin(auth.uid()) OR coalesce((_data->>'confirmed')::boolean,false)=false THEN RAISE EXCEPTION 'Super Admin cần xác nhận ánh xạ.'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.biz_systems WHERE id=sys AND active) THEN RAISE EXCEPTION 'Hệ không hợp lệ.'; END IF;
  SELECT to_jsonb(d) INTO old FROM public.biz_departments d WHERE id=dep FOR UPDATE; IF old IS NULL THEN RAISE EXCEPTION 'Không tìm thấy phòng.'; END IF;
  IF (old->>'system_id')::uuid IS NOT DISTINCT FROM sys THEN RETURN dep; END IF;
  UPDATE public.biz_department_system_history SET ended_at=ts WHERE department_id=dep AND ended_at IS NULL;
  INSERT INTO public.biz_department_system_history(department_id,system_id,started_at,actor_id) VALUES(dep,sys,ts,auth.uid());
  UPDATE public.biz_departments SET system_id=sys WHERE id=dep; v_id:=dep;
 ELSIF _action='manager' THEN
  IF pos NOT IN ('director','department_head','team_lead') THEN RAISE EXCEPTION 'Chức danh không hợp lệ.'; END IF;
  IF (pos='director' AND NOT EXISTS(SELECT 1 FROM public.biz_systems WHERE id=sys AND active)) OR (pos='department_head' AND NOT EXISTS(SELECT 1 FROM public.biz_departments WHERE id=dep AND active AND system_id IS NOT NULL)) OR (pos='team_lead' AND NOT EXISTS(SELECT 1 FROM public.biz_teams WHERE id=team AND active)) THEN RAISE EXCEPTION 'Đơn vị không hợp lệ.'; END IF;
  IF usr IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=usr AND status='Đang hoạt động') THEN RAISE EXCEPTION 'Nhân viên chưa hoạt động.'; END IF;
  UPDATE public.biz_management_assignments SET ended_at=ts WHERE position=pos AND ended_at IS NULL AND ((pos='director' AND system_id=sys) OR (pos='department_head' AND department_id=dep) OR (pos='team_lead' AND team_id=team));
  IF usr IS NOT NULL THEN INSERT INTO public.biz_management_assignments(position,system_id,department_id,team_id,user_id,started_at,actor_id) VALUES(pos,CASE WHEN pos='director' THEN sys END,CASE WHEN pos='department_head' THEN dep END,CASE WHEN pos='team_lead' THEN team END,usr,ts,auth.uid()) RETURNING id INTO v_id; END IF;
 ELSIF _action='member' THEN
  PERFORM 1 FROM public.profiles WHERE id=usr AND status='Đang hoạt động' FOR UPDATE; IF NOT FOUND THEN RAISE EXCEPTION 'Nhân viên chưa hoạt động.'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.biz_departments WHERE id=dep AND active) THEN RAISE EXCEPTION 'Phòng không hợp lệ.'; END IF;
  IF team IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.biz_teams WHERE id=team AND department_id=dep AND active) THEN RAISE EXCEPTION 'Nhóm không thuộc phòng.'; END IF;
  UPDATE public.biz_team_members SET ended_at=ts WHERE user_id=usr AND ended_at IS NULL;
  IF NOT EXISTS(SELECT 1 FROM public.biz_department_members WHERE user_id=usr AND department_id=dep AND ended_at IS NULL) THEN
   UPDATE public.biz_department_members SET ended_at=ts,effective_to=(ts AT TIME ZONE 'Asia/Ho_Chi_Minh')::date WHERE user_id=usr AND ended_at IS NULL;
   INSERT INTO public.biz_department_members(department_id,user_id,is_manager,effective_from,started_at) VALUES(dep,usr,false,(ts AT TIME ZONE 'Asia/Ho_Chi_Minh')::date,ts) RETURNING id INTO v_id;
  END IF;
  IF team IS NOT NULL THEN INSERT INTO public.biz_team_members(team_id,user_id,started_at,actor_id) VALUES(team,usr,ts,auth.uid()) RETURNING id INTO v_id; END IF;
 ELSE RAISE EXCEPTION 'Thao tác không hợp lệ.'; END IF;
 INSERT INTO public.biz_org_events(actor_id,action,payload) VALUES(auth.uid(),_action,jsonb_build_object('id',v_id,'old',old,'new',_data)); RETURN v_id;
END $$;
CREATE POLICY biz_system_read ON public.biz_systems FOR SELECT TO authenticated USING(public.biz_org_can_manage() OR private.sig_can(auth.uid(),'biz.workflow_manage') OR public.is_super_admin(auth.uid()) OR EXISTS(SELECT 1 FROM public.biz_departments d WHERE d.system_id=biz_systems.id AND public.biz_department_access(d.id)));
CREATE POLICY biz_team_read ON public.biz_teams FOR SELECT TO authenticated USING(public.biz_org_can_manage() OR public.biz_department_access(department_id));
CREATE POLICY biz_system_history_read ON public.biz_department_system_history FOR SELECT TO authenticated USING(public.biz_org_can_manage());
CREATE POLICY biz_team_member_read ON public.biz_team_members FOR SELECT TO authenticated USING(public.biz_org_can_manage() OR user_id=auth.uid());
CREATE POLICY biz_management_read ON public.biz_management_assignments FOR SELECT TO authenticated USING(public.biz_org_can_manage() OR user_id=auth.uid());
CREATE POLICY biz_org_events_read ON public.biz_org_events FOR SELECT TO authenticated USING(public.biz_org_can_manage());
REVOKE ALL ON FUNCTION public.biz_org_can_manage(),public.biz_scope_ok(uuid,uuid,uuid,timestamptz),public.biz_org_read(),public.biz_org_save(text,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.biz_org_can_manage(),public.biz_scope_ok(uuid,uuid,uuid,timestamptz),public.biz_org_read(),public.biz_org_save(text,jsonb) TO authenticated;