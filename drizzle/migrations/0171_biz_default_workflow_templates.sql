-- Default Sứ Việt approval workflow templates per system, idempotent, position-based, safe activation; plus an approval-chain simulator for Admins.
CREATE FUNCTION public.biz_workflow_seed_defaults() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE s public.biz_systems; k record; pid jsonb; steps_ jsonb; dsteps_ jsonb; ok_ boolean; x jsonb; pos public.biz_positions; holder uuid; code_ text; created_ jsonb:='[]'; skipped_ jsonb:='[]'; incomplete_ jsonb:='[]'; active_ boolean;
BEGIN
 IF NOT public.biz_workflow_manage() THEN RAISE EXCEPTION 'Không có quyền cấu hình quy trình.'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('biz_workflow_seed'));
 SELECT jsonb_object_agg(code,id) INTO pid FROM public.biz_positions WHERE code IN ('team_lead','department_head','director','deputy_executive_director','executive_director') AND active;
 IF pid IS NULL OR NOT (pid?'team_lead' AND pid?'department_head' AND pid?'director') THEN RAISE EXCEPTION 'Thiếu chức danh chuẩn (Trưởng Nhóm/Trưởng Phòng/Giám Đốc) trong Cơ cấu tổ chức.'; END IF;
 FOR s IN SELECT * FROM public.biz_systems WHERE active LOOP
  FOR k IN SELECT * FROM (VALUES
   ('goal_year','KR Năm – Phê duyệt mục tiêu','team_lead,department_head,director'),
   ('rolling_plan','KR – Điều chỉnh phân bổ tháng','department_head,director'),
   ('report_day','Báo cáo – Điều chỉnh số liệu','team_lead,department_head'),
   ('report_week','Báo cáo – Điều chỉnh số liệu','team_lead,department_head'),
   ('report_month','Báo cáo – Điều chỉnh số liệu','team_lead,department_head'),
   ('report_quarter','Báo cáo – Điều chỉnh số liệu','team_lead,department_head'),
   ('report_year','Báo cáo – Điều chỉnh số liệu','team_lead,department_head'),
   ('late_report_day','Báo cáo – Xin nộp bù','team_lead,department_head'),
   ('late_report_week','Báo cáo – Xin nộp bù','team_lead,department_head'),
   ('late_report_month','Báo cáo – Xin nộp bù','team_lead,department_head'),
   ('late_report_quarter','Báo cáo – Xin nộp bù','team_lead,department_head'),
   ('late_report_year','Báo cáo – Xin nộp bù','team_lead,department_head'),
   ('late_plan_month','Kế hoạch – Xin nộp bù','department_head'),
   ('late_plan_quarter','Kế hoạch – Xin nộp bù','department_head'),
   ('late_plan_year','Kế hoạch – Xin nộp bù','department_head')
  ) t(kind,name,chain)
  LOOP
   IF EXISTS(SELECT 1 FROM public.biz_approval_workflows w WHERE w.system_id=s.id AND w.department_id IS NULL AND w.kind=k.kind) THEN skipped_:=skipped_||jsonb_build_array(k.kind); CONTINUE; END IF;
   steps_:='[]';
   FOREACH code_ IN ARRAY string_to_array(k.chain,',') LOOP
    steps_:=steps_||jsonb_build_array(jsonb_build_object('label',(SELECT name FROM public.biz_positions WHERE id=(pid->>code_)::uuid),'type','position','position_id',pid->>code_,'skip_if_submitter',true));
   END LOOP;
   dsteps_:='[]';
   IF pid?'deputy_executive_director' THEN dsteps_:=dsteps_||jsonb_build_array(jsonb_build_object('label',(SELECT name FROM public.biz_positions WHERE id=(pid->>'deputy_executive_director')::uuid),'type','position','position_id',pid->>'deputy_executive_director','skip_if_submitter',true)); END IF;
   IF pid?'executive_director' THEN dsteps_:=dsteps_||jsonb_build_array(jsonb_build_object('label',(SELECT name FROM public.biz_positions WHERE id=(pid->>'executive_director')::uuid),'type','position','position_id',pid->>'executive_director','skip_if_submitter',true)); END IF;
   ok_:=true;
   FOR x IN SELECT * FROM jsonb_array_elements(steps_||dsteps_) LOOP
    SELECT * INTO pos FROM public.biz_positions WHERE id=(x->>'position_id')::uuid;
    IF pos.id IS NULL THEN ok_:=false; CONTINUE; END IF;
    BEGIN
     IF pos.unit_kind='system' AND NOT pos.all_business THEN holder:=public.biz_resolve_position(pos.id,s.id,NULL,NULL);
     ELSIF pos.unit_kind='system' THEN holder:=public.biz_resolve_position(pos.id,NULL,NULL,NULL);
     ELSIF pos.unit_kind='department' THEN SELECT public.biz_resolve_position(pos.id,s.id,d.id,NULL) INTO holder FROM public.biz_departments d WHERE d.system_id=s.id AND d.active AND public.biz_resolve_position(pos.id,s.id,d.id,NULL) IS NOT NULL LIMIT 1;
     ELSE SELECT public.biz_resolve_position(pos.id,s.id,t.department_id,t.id) INTO holder FROM public.biz_teams t JOIN public.biz_departments d ON d.id=t.department_id WHERE d.system_id=s.id AND t.active AND public.biz_resolve_position(pos.id,s.id,t.department_id,t.id) IS NOT NULL LIMIT 1;
     END IF;
    EXCEPTION WHEN OTHERS THEN holder:=NULL;
    END;
    IF holder IS NULL THEN ok_:=false; END IF;
   END LOOP;
   active_:=ok_;
   INSERT INTO public.biz_approval_workflows(family_id,version,name,system_id,department_id,kind,effective_from,active,steps,director_steps,created_by) VALUES(gen_random_uuid(),1,k.name,s.id,NULL,k.kind,now(),active_,steps_,dsteps_,auth.uid());
   created_:=created_||jsonb_build_array(jsonb_build_object('kind',k.kind,'name',k.name,'system',s.name,'active',active_));
   IF NOT active_ THEN incomplete_:=incomplete_||jsonb_build_array(jsonb_build_object('kind',k.kind,'system',s.name)); END IF;
  END LOOP;
 END LOOP;
 INSERT INTO public.biz_org_events(actor_id,action,payload) VALUES(auth.uid(),'workflow_seed',jsonb_build_object('created',created_,'skipped',skipped_,'incomplete',incomplete_));
 RETURN jsonb_build_object('created',created_,'skipped',skipped_,'incomplete',incomplete_);
END $$;
-- Simulate the approval chain for a chosen employee without creating anything.
CREATE FUNCTION public.biz_workflow_simulate(_kind text,_user uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE w public.biz_approval_workflows; dep uuid; sid uuid; tid uuid; rank_ integer:=0; arank_ integer; x jsonb; approver uuid; pos_id uuid; out_ jsonb:='[]';
BEGIN
 IF NOT public.biz_workflow_manage() THEN RAISE EXCEPTION 'Không có quyền cấu hình quy trình.'; END IF;
 dep:=public.biz_department_at(_user,(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date);
 IF dep IS NULL THEN RETURN jsonb_build_object('error','Nhân viên chưa thuộc Phòng nào.'); END IF;
 SELECT system_id INTO sid FROM public.biz_departments WHERE id=dep;
 SELECT * INTO w FROM public.biz_approval_workflows WHERE active AND system_id=sid AND kind=_kind AND (department_id IS NULL OR department_id=dep) AND effective_from<=now() ORDER BY (department_id IS NOT NULL) DESC,effective_from DESC,created_at DESC LIMIT 1;
 IF w.id IS NULL THEN RETURN jsonb_build_object('error','Chưa có luồng hoạt động cho loại hồ sơ này tại Hệ này.'); END IF;
 SELECT m.team_id INTO tid FROM public.biz_team_members m JOIN public.biz_teams t ON t.id=m.team_id WHERE m.user_id=_user AND m.ended_at IS NULL AND t.department_id=dep AND t.active;
 SELECT coalesce(max(CASE position WHEN 'director' THEN 3 WHEN 'department_head' THEN 2 ELSE 1 END),0) INTO rank_ FROM public.biz_management_assignments WHERE user_id=_user AND ended_at IS NULL AND ((position='director' AND system_id=sid) OR (position='department_head' AND department_id=dep) OR (position='team_lead' AND team_id=tid));
 SELECT max(p.level) INTO arank_ FROM public.biz_appointments a JOIN public.biz_positions p ON p.id=a.position_id WHERE a.user_id=_user AND a.status='active' AND NOT p.all_business AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND ((a.scope_kind='system' AND a.system_id=sid) OR (a.scope_kind='department' AND a.department_id=dep) OR (a.scope_kind='team' AND a.team_id=tid));
 rank_:=least(greatest(rank_,coalesce(arank_,0)),3);
 IF rank_>=3 AND jsonb_array_length(w.director_steps)=0 THEN RETURN jsonb_build_object('error','Giám Đốc nộp hồ sơ cần nhánh duyệt cấp cao do Super Admin cấu hình.','workflow',w.name); END IF;
 FOR x IN SELECT * FROM jsonb_array_elements(CASE WHEN rank_>=3 THEN w.director_steps ELSE w.steps END) LOOP
  IF rank_<3 AND ((x->>'type'='team_lead' AND rank_>=1) OR (x->>'type'='department_head' AND rank_>=2)) THEN CONTINUE; END IF;
  approver:=NULL;
  IF x->>'type'='user' THEN approver:=nullif(x->>'user_id','')::uuid;
  ELSE
   pos_id:=CASE WHEN x->>'type'='position' THEN nullif(x->>'position_id','')::uuid ELSE (SELECT id FROM public.biz_positions WHERE code=x->>'type') END;
   BEGIN approver:=public.biz_resolve_position(pos_id,sid,dep,tid); EXCEPTION WHEN OTHERS THEN approver:=NULL; END;
   IF approver=_user AND coalesce((x->>'skip_if_submitter')::boolean,false) THEN CONTINUE; END IF;
  END IF;
  IF approver=_user THEN approver:=NULL; END IF;
  out_:=out_||jsonb_build_array(jsonb_build_object('label',x->>'label','user_id',approver,'user_name',(SELECT full_name FROM public.profiles WHERE id=approver),'missing',approver IS NULL));
 END LOOP;
 RETURN jsonb_build_object('workflow',w.name,'kind',_kind,'submitter_rank',rank_,'steps',out_);
END $$;
REVOKE ALL ON FUNCTION public.biz_workflow_seed_defaults(),public.biz_workflow_simulate(text,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.biz_workflow_seed_defaults(),public.biz_workflow_simulate(text,uuid) TO authenticated;