CREATE TABLE public.biz_approval_workflows(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),family_id uuid NOT NULL DEFAULT gen_random_uuid(),version int NOT NULL DEFAULT 1,name text NOT NULL,system_id uuid NOT NULL REFERENCES public.biz_systems(id),department_id uuid REFERENCES public.biz_departments(id),kind text NOT NULL CHECK(kind IN ('goal_year','report_month','report_quarter','report_year')),effective_from timestamptz NOT NULL DEFAULT now(),active boolean NOT NULL DEFAULT false,steps jsonb NOT NULL,director_steps jsonb NOT NULL DEFAULT '[]',created_by uuid NOT NULL REFERENCES public.profiles(id),created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.biz_approval_workflows TO authenticated; GRANT ALL ON public.biz_approval_workflows TO service_role;
ALTER TABLE public.biz_approval_workflows ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.biz_approval_runs(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),workflow_id uuid NOT NULL REFERENCES public.biz_approval_workflows(id),version_id uuid NOT NULL,kind text NOT NULL,owner_id uuid NOT NULL REFERENCES public.profiles(id),department_id uuid NOT NULL REFERENCES public.biz_departments(id),system_id uuid REFERENCES public.biz_systems(id),team_id uuid REFERENCES public.biz_teams(id),org_snapshot jsonb NOT NULL,content_snapshot jsonb NOT NULL,steps jsonb NOT NULL,current_step int NOT NULL DEFAULT 0,status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','changes')),submitted_at timestamptz NOT NULL DEFAULT now(),step_started_at timestamptz NOT NULL DEFAULT now(),revision int NOT NULL DEFAULT 0);
GRANT SELECT ON public.biz_approval_runs TO authenticated; GRANT ALL ON public.biz_approval_runs TO service_role;
ALTER TABLE public.biz_approval_runs ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX biz_one_pending_run ON public.biz_approval_runs(version_id) WHERE status='pending';
CREATE INDEX biz_run_owner ON public.biz_approval_runs(owner_id,department_id);
CREATE TABLE public.biz_approval_events(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),run_id uuid NOT NULL REFERENCES public.biz_approval_runs(id),actor_id uuid NOT NULL REFERENCES public.profiles(id),action text NOT NULL,step int NOT NULL,comment text,payload jsonb NOT NULL DEFAULT '{}',created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.biz_approval_events TO authenticated; GRANT ALL ON public.biz_approval_events TO service_role;
ALTER TABLE public.biz_approval_events ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.biz_workflow_manage() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$SELECT auth.uid() IS NOT NULL AND (public.is_super_admin(auth.uid()) OR private.sig_can(auth.uid(),'biz.workflow_manage'))$$;
CREATE FUNCTION public.biz_workflows_read() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$BEGIN IF NOT public.biz_workflow_manage() THEN RAISE EXCEPTION 'Không có quyền cấu hình quy trình.'; END IF; RETURN coalesce((SELECT jsonb_agg(to_jsonb(w) ORDER BY created_at DESC) FROM public.biz_approval_workflows w),'[]'); END $$;
CREATE FUNCTION public.biz_workflow_save(_data jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE old public.biz_approval_workflows; sid uuid:=(_data->>'system_id')::uuid; dep uuid:=nullif(_data->>'department_id','')::uuid; st jsonb:=_data->'steps'; ds jsonb:=coalesce(_data->'director_steps','[]'); x jsonb; id_ uuid; fam uuid; ver int; kind_ text:=_data->>'kind'; name_ text:=btrim(_data->>'name'); active_ boolean:=coalesce((_data->>'active')::boolean,false);
BEGIN
 IF NOT public.biz_workflow_manage() THEN RAISE EXCEPTION 'Không có quyền cấu hình quy trình.'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('biz_approval_workflows'));
 IF coalesce(name_,'')='' OR kind_ NOT IN ('goal_year','report_month','report_quarter','report_year') OR NOT EXISTS(SELECT 1 FROM public.biz_systems WHERE id=sid AND active) THEN RAISE EXCEPTION 'Tên, Hệ hoặc loại hồ sơ không hợp lệ.'; END IF;
 IF dep IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.biz_departments WHERE id=dep AND system_id=sid AND active) THEN RAISE EXCEPTION 'Phòng không thuộc Hệ.'; END IF;
 IF jsonb_typeof(st) IS DISTINCT FROM 'array' OR jsonb_array_length(st)=0 OR jsonb_typeof(ds) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Cần ít nhất một cấp duyệt.'; END IF;
 FOR x IN SELECT * FROM jsonb_array_elements(st||ds) LOOP
  IF coalesce(x->>'label','')='' OR coalesce(x->>'type','') NOT IN ('team_lead','department_head','director','user') THEN RAISE EXCEPTION 'Cấp duyệt không hợp lệ.'; END IF;
  IF x->>'type'='user' AND NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=nullif(x->>'user_id','')::uuid AND status='Đang hoạt động' AND private.sig_can(id,CASE WHEN kind_='goal_year' THEN 'biz.goal_approve' ELSE 'biz.report_approve' END)) THEN RAISE EXCEPTION 'Người duyệt cụ thể phải hoạt động và có quyền duyệt.'; END IF;
  IF nullif(x->>'substitute_id','') IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=(x->>'substitute_id')::uuid AND status='Đang hoạt động' AND private.sig_can(id,CASE WHEN kind_='goal_year' THEN 'biz.goal_approve' ELSE 'biz.report_approve' END)) THEN RAISE EXCEPTION 'Người thay thế phải có quyền duyệt và đang hoạt động.'; END IF;
  IF x->>'sla_hours' IS NOT NULL AND ((x->>'sla_hours')::numeric<=0 OR (x->>'sla_hours')::numeric>8760) THEN RAISE EXCEPTION 'Hạn xử lý phải lớn hơn 0, tối đa 8760 giờ.'; END IF;
 END LOOP;
 IF nullif(_data->>'id','') IS NOT NULL THEN SELECT * INTO old FROM public.biz_approval_workflows WHERE id=(_data->>'id')::uuid FOR UPDATE; IF old.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy quy trình.'; END IF; fam:=old.family_id; ver:=old.version+1; ELSE fam:=gen_random_uuid();ver:=1; END IF;
 IF active_ THEN UPDATE public.biz_approval_workflows SET active=false WHERE system_id=sid AND department_id IS NOT DISTINCT FROM dep AND kind=kind_ AND effective_from=coalesce(nullif(_data->>'effective_from','')::timestamptz,now()); END IF;
 IF old.id IS NOT NULL THEN UPDATE public.biz_approval_workflows SET active=false WHERE family_id=fam; END IF;
 INSERT INTO public.biz_approval_workflows(family_id,version,name,system_id,department_id,kind,effective_from,active,steps,director_steps,created_by) VALUES(fam,ver,name_,sid,dep,kind_,coalesce(nullif(_data->>'effective_from','')::timestamptz,now()),active_,st,ds,auth.uid()) RETURNING id INTO id_;
 INSERT INTO public.biz_org_events(actor_id,action,payload) VALUES(auth.uid(),'workflow',jsonb_build_object('workflow_id',id_,'previous_id',old.id)); RETURN id_;
END $$;
CREATE FUNCTION public.biz_run_can_read(_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.biz_approval_runs r WHERE r.id=_id AND auth.uid() IS NOT NULL AND (public.is_super_admin(auth.uid()) OR r.owner_id=auth.uid() OR EXISTS(SELECT 1 FROM jsonb_array_elements(r.steps) s WHERE s->>'user_id'=auth.uid()::text OR s->>'substitute_id'=auth.uid()::text) OR (private.sig_can(auth.uid(),'biz.approval_view') AND public.biz_scope_ok(auth.uid(),r.owner_id,r.department_id,r.submitted_at)) OR (private.sig_can(auth.uid(),'biz.view_dept') AND public.biz_scope_ok(auth.uid(),r.owner_id,r.department_id,r.submitted_at)) OR private.sig_can(auth.uid(),'biz.view_all'))) $$;
CREATE FUNCTION public.biz_run_assigned(_version uuid,_pending boolean DEFAULT false) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.biz_approval_runs r WHERE r.version_id=_version AND (NOT _pending OR r.status='pending') AND r.owner_id<>auth.uid() AND (CASE WHEN _pending THEN r.steps->r.current_step->>'user_id'=auth.uid()::text OR r.steps->r.current_step->>'substitute_id'=auth.uid()::text ELSE EXISTS(SELECT 1 FROM jsonb_array_elements(r.steps) s WHERE s->>'user_id'=auth.uid()::text OR s->>'substitute_id'=auth.uid()::text) END)) $$;
CREATE FUNCTION public.biz_approval_start(_version uuid,_kind text,_owner uuid,_dept uuid,_content jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE w public.biz_approval_workflows; sid uuid; tid uuid; rank_ int:=0; x jsonb; approver uuid; sub uuid; resolved jsonb:='[]'; id_ uuid; permission_ text:=CASE WHEN _kind='goal_year' THEN 'biz.goal_approve' ELSE 'biz.report_approve' END; org jsonb;
BEGIN
 SELECT system_id INTO sid FROM public.biz_departments WHERE id=_dept;
 SELECT * INTO w FROM public.biz_approval_workflows WHERE active AND system_id=sid AND kind=_kind AND (department_id IS NULL OR department_id=_dept) AND effective_from<=now() ORDER BY (department_id IS NOT NULL) DESC,effective_from DESC,created_at DESC LIMIT 1;
 IF w.id IS NULL THEN RETURN NULL; END IF;
 SELECT m.team_id INTO tid FROM public.biz_team_members m JOIN public.biz_teams t ON t.id=m.team_id WHERE m.user_id=_owner AND m.ended_at IS NULL AND t.department_id=_dept AND t.active;
 SELECT coalesce(max(CASE position WHEN 'director' THEN 3 WHEN 'department_head' THEN 2 ELSE 1 END),0) INTO rank_ FROM public.biz_management_assignments WHERE user_id=_owner AND ended_at IS NULL AND ((position='director' AND system_id=sid) OR (position='department_head' AND department_id=_dept) OR (position='team_lead' AND team_id=tid));
 IF rank_=3 AND jsonb_array_length(w.director_steps)=0 THEN RAISE EXCEPTION 'Giám Đốc cần quy trình đặc biệt do Super Admin cấu hình.'; END IF;
 FOR x IN SELECT * FROM jsonb_array_elements(CASE WHEN rank_=3 THEN w.director_steps ELSE w.steps END) LOOP
  IF rank_<3 AND ((x->>'type'='team_lead' AND rank_>=1) OR (x->>'type'='department_head' AND rank_>=2)) THEN CONTINUE; END IF;
  approver:=NULL;sub:=nullif(x->>'substitute_id','')::uuid;
  IF x->>'type'='user' THEN approver:=nullif(x->>'user_id','')::uuid;
  ELSE SELECT user_id INTO approver FROM public.biz_management_assignments WHERE ended_at IS NULL AND position=x->>'type' AND ((position='director' AND system_id=sid) OR (position='department_head' AND department_id=_dept) OR (position='team_lead' AND team_id=tid)); END IF;
  IF approver=_owner OR sub=_owner THEN RAISE EXCEPTION 'Không được tự duyệt hồ sơ ở cấp thông thường.'; END IF;
  IF approver IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=approver AND status='Đang hoạt động' AND private.sig_can(id,permission_)) THEN approver:=NULL; END IF;
  IF sub IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=sub AND status='Đang hoạt động' AND private.sig_can(id,permission_)) THEN RAISE EXCEPTION 'Người thay thế không còn quyền duyệt.'; END IF;
  IF approver IS NULL THEN approver:=sub;sub:=NULL; END IF;
  IF approver IS NULL THEN RAISE EXCEPTION 'Thiếu người duyệt có quyền tại cấp: %',x->>'label'; END IF;
  resolved:=resolved||jsonb_build_array(x||jsonb_build_object('user_id',approver,'substitute_id',sub));
 END LOOP;
 IF jsonb_array_length(resolved)=0 THEN RAISE EXCEPTION 'Không còn cấp duyệt phù hợp; cần cấu hình rõ ràng.'; END IF;
 org:=jsonb_build_object('system_name',(SELECT name FROM public.biz_systems WHERE id=sid),'department_name',(SELECT name FROM public.biz_departments WHERE id=_dept),'team_name',(SELECT name FROM public.biz_teams WHERE id=tid),'submitter_rank',rank_,'workflow_name',w.name,'workflow_version',w.version);
 INSERT INTO public.biz_approval_runs(workflow_id,version_id,kind,owner_id,department_id,system_id,team_id,org_snapshot,content_snapshot,steps) VALUES(w.id,_version,_kind,_owner,_dept,sid,tid,org,_content,resolved) RETURNING id INTO id_;
 INSERT INTO public.biz_approval_events(run_id,actor_id,action,step,payload) VALUES(id_,auth.uid(),'submitted',0,jsonb_build_object('version_id',_version)); RETURN id_;
END $$;
CREATE FUNCTION public.biz_approval_submit_trigger() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE g public.biz_annual_goals; d public.biz_documents; c jsonb;BEGIN
 IF NEW.status='pending' AND OLD.status IN ('draft','changes') THEN
  IF TG_TABLE_NAME='biz_goal_versions' THEN SELECT * INTO g FROM public.biz_annual_goals WHERE id=NEW.goal_id; SELECT coalesce(jsonb_agg(jsonb_build_object('metric_id',i.metric_id,'definition',i.definition,'annual',i.annual::text,'months',ARRAY(SELECT x::text FROM unnest(i.months) x))),'[]') INTO c FROM public.biz_goal_items i WHERE i.version_id=NEW.id; PERFORM public.biz_approval_start(NEW.id,'goal_year',g.user_id,g.department_id,jsonb_build_object('year',g.year,'version',NEW.version,'items',c));
  ELSE SELECT * INTO d FROM public.biz_documents WHERE id=NEW.document_id; IF d.kind='report' THEN PERFORM public.biz_approval_start(NEW.id,'report_'||d.period_kind,d.user_id,d.department_id,jsonb_build_object('year',d.year,'period',d.period,'period_kind',d.period_kind,'url',NEW.url,'items',NEW.items,'version',NEW.version)); END IF; END IF;
 END IF; RETURN NEW;
END $$;
CREATE TRIGGER biz_goal_approval_submit AFTER UPDATE ON public.biz_goal_versions FOR EACH ROW EXECUTE FUNCTION public.biz_approval_submit_trigger();
CREATE TRIGGER biz_report_approval_submit AFTER UPDATE ON public.biz_document_versions FOR EACH ROW EXECUTE FUNCTION public.biz_approval_submit_trigger();
CREATE FUNCTION public.biz_approval_step(_version uuid,_approve boolean,_comment text) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r public.biz_approval_runs; last_ boolean;
BEGIN
 SELECT * INTO r FROM public.biz_approval_runs WHERE version_id=_version AND status='pending' FOR UPDATE; IF r.id IS NULL THEN RETURN _approve; END IF;
 IF r.owner_id=auth.uid() OR NOT public.biz_run_assigned(_version,true) OR NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND status='Đang hoạt động') OR NOT private.sig_can(auth.uid(),CASE WHEN r.kind='goal_year' THEN 'biz.goal_approve' ELSE 'biz.report_approve' END) THEN RAISE EXCEPTION 'Không đến lượt, không có quyền hoặc không được tự duyệt.'; END IF;
 IF NOT _approve AND btrim(coalesce(_comment,''))='' THEN RAISE EXCEPTION 'Cần nhập lý do yêu cầu chỉnh sửa.'; END IF;
 last_:=_approve AND r.current_step+1=jsonb_array_length(r.steps);
 UPDATE public.biz_approval_runs SET status=CASE WHEN NOT _approve THEN 'changes' WHEN last_ THEN 'approved' ELSE 'pending' END,current_step=CASE WHEN _approve AND NOT last_ THEN current_step+1 ELSE current_step END,step_started_at=now(),revision=revision+1 WHERE id=r.id;
 INSERT INTO public.biz_approval_events(run_id,actor_id,action,step,comment) VALUES(r.id,auth.uid(),CASE WHEN NOT _approve THEN 'returned' WHEN last_ THEN 'approved' ELSE 'step_approved' END,r.current_step,nullif(btrim(_comment),'')); RETURN last_;
END $$;
CREATE FUNCTION public.biz_approval_notify() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE r public.biz_approval_runs; u uuid; k text;BEGIN
 SELECT * INTO r FROM public.biz_approval_runs WHERE id=NEW.run_id;
 IF NEW.action NOT IN ('submitted','step_approved','approved','returned','override','reassigned') THEN RETURN NEW; END IF;
 k:=CASE WHEN r.status='approved' THEN 'biz_approved' WHEN r.status='changes' THEN 'biz_returned' ELSE 'biz_submitted' END;
 FOR u IN SELECT DISTINCT id FROM public.profiles WHERE status='Đang hoạt động' AND ((r.status<>'pending' AND id=r.owner_id) OR (r.status='pending' AND (id=nullif(r.steps->r.current_step->>'user_id','')::uuid OR id=nullif(r.steps->r.current_step->>'substitute_id','')::uuid))) LOOP
 INSERT INTO public.notifications(recipient_id,kind,dedup_key,payload,zalo_status,push_status) VALUES(u,k,'biz-run:'||NEW.id||':'||u,jsonb_build_object('message',CASE WHEN r.status='approved' THEN 'Hồ sơ kinh doanh đã được duyệt hoàn tất.' WHEN r.status='changes' THEN 'Hồ sơ cần chỉnh sửa: '||coalesce(NEW.comment,'') ELSE 'Hồ sơ đến lượt bạn xử lý: '||(r.steps->r.current_step->>'label') END,'approval_run_id',r.id,'user_id',r.owner_id,'year',r.content_snapshot->'year','period',r.content_snapshot->'period','period_kind',r.content_snapshot->'period_kind','goal_id',CASE WHEN r.kind='goal_year' THEN (SELECT goal_id FROM public.biz_goal_versions WHERE id=r.version_id) END,'document_id',CASE WHEN r.kind<>'goal_year' THEN (SELECT document_id FROM public.biz_document_versions WHERE id=r.version_id) END,'kind',CASE WHEN r.kind='goal_year' THEN 'goal' ELSE 'report' END),'ineligible','none') ON CONFLICT(dedup_key) DO NOTHING;
 END LOOP; RETURN NEW; END $$;
CREATE TRIGGER biz_approval_notify AFTER INSERT ON public.biz_approval_events FOR EACH ROW EXECUTE FUNCTION public.biz_approval_notify();
CREATE POLICY biz_workflow_read ON public.biz_approval_workflows FOR SELECT TO authenticated USING(public.biz_workflow_manage());
CREATE POLICY biz_run_read ON public.biz_approval_runs FOR SELECT TO authenticated USING(public.biz_run_can_read(id));
CREATE POLICY biz_approval_event_read ON public.biz_approval_events FOR SELECT TO authenticated USING(public.biz_run_can_read(run_id));
REVOKE ALL ON FUNCTION public.biz_workflow_manage(),public.biz_workflows_read(),public.biz_workflow_save(jsonb),public.biz_run_can_read(uuid),public.biz_run_assigned(uuid,boolean),public.biz_approval_start(uuid,text,uuid,uuid,jsonb),public.biz_approval_step(uuid,boolean,text),public.biz_approval_submit_trigger(),public.biz_approval_notify() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.biz_workflow_manage(),public.biz_workflows_read(),public.biz_workflow_save(jsonb),public.biz_run_can_read(uuid),public.biz_run_assigned(uuid,boolean) TO authenticated;