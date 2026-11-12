CREATE OR REPLACE FUNCTION public.biz_late_can_act(_request uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$SELECT EXISTS(SELECT 1 FROM public.biz_late_requests l JOIN public.biz_approval_runs r ON r.version_id=l.id AND r.kind='late_'||l.kind||'_'||l.period_kind JOIN public.profiles p ON p.id=auth.uid() WHERE l.id=_request AND l.status='pending' AND r.status='pending' AND p.status='Đang hoạt động' AND r.owner_id<>auth.uid() AND public.biz_run_assigned(l.id,true) AND public.biz_step_scope_ok(r.steps,r.current_step,auth.uid(),r.owner_id,r.department_id,r.submitted_at) AND public.biz_any_phase(l.kind,l.period_kind,l.year,l.period,now())='overdue')$function$
;

CREATE OR REPLACE FUNCTION public.biz_dashboard_aggregate(_facts jsonb, _lo integer, _hi integer, _axis text DEFAULT 'total'::text)
 RETURNS jsonb
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
 WITH f AS (SELECT x.*,jsonb_build_object('code',definition->>'code','name',definition->>'name','unit',definition->>'unit','aggregation',definition->>'aggregation','direction',definition->>'direction','value_kind',definition->>'value_kind') def FROM jsonb_to_recordset(_facts) x(user_id uuid,employee_name text,department_id uuid,department_name text,month int,definition jsonb,target text,actual text)),g AS (
 SELECT md5(def::text) metric_key,def definition,CASE _axis WHEN 'month' THEN month::text WHEN 'department' THEN department_id::text WHEN 'employee' THEN user_id::text ELSE 'total' END group_id,
 CASE _axis WHEN 'month' THEN 'Tháng '||month WHEN 'department' THEN department_name WHEN 'employee' THEN employee_name ELSE def->>'name' END group_name,
 CASE WHEN def->>'aggregation'='sum' THEN sum(target::numeric) WHEN def->>'aggregation'='avg' THEN avg(target::numeric) END target,
 CASE WHEN def->>'aggregation'='sum' THEN sum(actual::numeric) WHEN def->>'aggregation'='avg' THEN avg(actual::numeric) END actual,
 count(*) expected,count(actual) received,bool_and(actual IS NOT NULL AND target IS NOT NULL) complete,
 jsonb_agg(DISTINCT month) FILTER(WHERE actual IS NULL) missing_months
 FROM f WHERE month BETWEEN _lo AND _hi GROUP BY def,group_id,group_name)
 SELECT coalesce(jsonb_agg(jsonb_build_object('metric_key',metric_key,'definition',definition,'group_id',group_id,'group_name',group_name,'target',target::text,'actual',actual::text,'difference',(actual-target)::text,'percent',CASE WHEN target>0 AND definition->>'direction'='higher' THEN (actual/target*100)::text END,'complete',complete,'expected',expected,'received',received,'missing_months',coalesce(missing_months,'[]'))),'[]') FROM g
$function$
;

CREATE OR REPLACE FUNCTION public.biz_dashboard_data(_year integer, _period_kind text DEFAULT 'year'::text, _period integer DEFAULT 1, _department_id uuid DEFAULT NULL::uuid, _user_id uuid DEFAULT NULL::uuid, _mode text DEFAULT 'official'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE r jsonb;opts jsonb;lo int;hi int;m int;current_month int;cum jsonb:='[]';quarters jsonb:='[]';missing jsonb;annual jsonb;current_data jsonb;
BEGIN
 _mode:='official';
 r:=public.biz_dashboard_read(_year,_period_kind,_period,_department_id,_user_id,_mode);lo:=(r->>'lo')::int;hi:=(r->>'hi')::int;
 opts:=public.biz_dashboard_read(_year,_period_kind,_period,NULL,NULL,_mode);
 SELECT coalesce(jsonb_agg(jsonb_build_object('user_id',x->>'user_id','employee_name',x->>'employee_name','department_id',x->>'department_id','department_name',x->>'department_name','month',(x->>'month')::int,'metric_id',k.id,'baseline_id',NULL,'target_version_id',NULL,'definition',jsonb_build_object('name',k.name,'unit',k.unit,'aggregation',k.aggregation,'direction',k.direction,'value_kind',k.value_kind),'target',NULL,'actual',NULL)),'[]') INTO missing
 FROM jsonb_array_elements(r->'roster') x JOIN public.biz_kr_metrics k ON k.department_id=(x->>'department_id')::uuid AND k.active
 WHERE NOT EXISTS(SELECT 1 FROM jsonb_array_elements(r->'facts') f WHERE f->>'user_id'=x->>'user_id' AND f->>'month'=x->>'month');
 r:=jsonb_set(r,'{facts}',private.biz_dash_enrich((r->'facts')||missing,_year));
 r:=jsonb_set(r,'{obligations}',private.biz_dash_enrich(r->'obligations',_year));
 FOR m IN 1..12 LOOP cum:=cum||coalesce((SELECT jsonb_agg(x||jsonb_build_object('group_id',m::text,'group_name','Tháng '||m)) FROM jsonb_array_elements(public.biz_dashboard_aggregate(r->'facts',1,m)) x),'[]');END LOOP;
 FOR m IN 1..4 LOOP quarters:=quarters||coalesce((SELECT jsonb_agg(x||jsonb_build_object('group_id',m::text,'group_name','Quý '||m)) FROM jsonb_array_elements(public.biz_dashboard_aggregate(r->'facts',(m-1)*3+1,m*3)) x),'[]');END LOOP;
 current_month:=CASE WHEN _year<extract(year FROM now() AT TIME ZONE 'Asia/Ho_Chi_Minh') THEN 12 WHEN _year>extract(year FROM now() AT TIME ZONE 'Asia/Ho_Chi_Minh') THEN 0 ELSE extract(month FROM now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::int END;
 annual:=public.biz_dashboard_aggregate(r->'facts',1,12);current_data:=public.biz_dashboard_aggregate(r->'facts',1,current_month);
 RETURN r||jsonb_build_object('current_month',current_month,'options_roster',opts->'roster','totals',public.biz_dashboard_aggregate(r->'facts',lo,hi),'months',public.biz_dashboard_aggregate(r->'facts',1,12,'month'),'quarters',quarters,'cumulative',cum,'annual',annual,'current',current_data,'remaining',coalesce((SELECT jsonb_agg(jsonb_build_object('metric_key',x->>'metric_key','value',((x->>'target')::numeric-(y->>'actual')::numeric)::text)) FROM jsonb_array_elements(annual) x LEFT JOIN LATERAL (SELECT v FROM jsonb_array_elements(current_data) v WHERE v->>'metric_key'=x->>'metric_key') t ON true CROSS JOIN LATERAL (SELECT t.v y) z),'[]'),'departments',public.biz_dashboard_aggregate(r->'facts',lo,hi,'department'),'employees',public.biz_dashboard_aggregate(r->'facts',lo,hi,'employee'));
END $function$
;

CREATE OR REPLACE FUNCTION public.biz_approvals_read()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$DECLARE r jsonb; legacy jsonb;BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Cần đăng nhập.'; END IF;
 SELECT coalesce(jsonb_agg(to_jsonb(a)||jsonb_build_object('employee_name',p.full_name,'can_act',CASE WHEN a.kind LIKE 'late_%' THEN public.biz_late_can_act(a.version_id) ELSE a.status='pending' AND public.biz_run_assigned(a.version_id,true) AND public.biz_step_scope_ok(a.steps,a.current_step,auth.uid(),a.owner_id,a.department_id,a.submitted_at) AND public.biz_can(auth.uid(),CASE WHEN a.kind IN ('goal_year','rolling_plan') THEN 'biz.goal_approve' ELSE 'biz.report_approve' END) END,'source_revision',CASE WHEN a.kind LIKE 'late_%' THEN (SELECT revision FROM public.biz_late_requests WHERE id=a.version_id) WHEN a.kind IN ('goal_year','rolling_plan') THEN coalesce((SELECT revision FROM public.biz_rolling_plans WHERE id=a.version_id),(SELECT revision FROM public.biz_goal_versions WHERE id=a.version_id)) ELSE (SELECT revision FROM public.biz_document_versions WHERE id=a.version_id) END,'events',(SELECT coalesce(jsonb_agg(to_jsonb(e)||jsonb_build_object('actor_name',ep.full_name) ORDER BY e.created_at),'[]') FROM public.biz_approval_events e JOIN public.profiles ep ON ep.id=e.actor_id WHERE e.run_id=a.id)) ORDER BY a.submitted_at DESC),'[]') INTO r FROM public.biz_approval_runs a JOIN public.profiles p ON p.id=a.owner_id WHERE public.biz_run_can_read(a.id);
 SELECT coalesce(jsonb_agg(x ORDER BY x->>'submitted_at' DESC),'[]') INTO legacy FROM (
 SELECT jsonb_build_object('id',v.id,'version_id',v.id,'kind','goal_year','owner_id',g.user_id,'employee_name',p.full_name,'department_id',g.department_id,'org_snapshot',jsonb_build_object('department_name',g.department_name,'workflow_name','Quy trình cũ'),'content_snapshot',jsonb_build_object('year',g.year,'items',(SELECT jsonb_agg(jsonb_build_object('metric_id',i.metric_id,'definition',i.definition,'annual',i.annual::text,'months',ARRAY(SELECT z::text FROM unnest(i.months) z))) FROM public.biz_goal_items i WHERE i.version_id=v.id)),'steps','[]'::jsonb,'current_step',0,'status',v.status,'submitted_at',v.submitted_at,'step_started_at',v.submitted_at,'source_revision',v.revision,'can_act',public.biz_goal_can_review(g.user_id,g.department_id),'legacy',true,'events',(SELECT coalesce(jsonb_agg(to_jsonb(e)||jsonb_build_object('actor_name',ep.full_name) ORDER BY e.created_at),'[]') FROM public.biz_goal_events e JOIN public.profiles ep ON ep.id=e.actor_id WHERE e.version_id=v.id)) x FROM public.biz_goal_versions v JOIN public.biz_annual_goals g ON g.id=v.goal_id JOIN public.profiles p ON p.id=g.user_id WHERE v.status='pending' AND public.biz_goal_can_read(g.id) AND NOT EXISTS(SELECT 1 FROM public.biz_approval_runs WHERE version_id=v.id)
 UNION ALL
 SELECT jsonb_build_object('id',v.id,'version_id',v.id,'kind','report_'||d.period_kind,'owner_id',d.user_id,'employee_name',p.full_name,'department_id',d.department_id,'org_snapshot',jsonb_build_object('department_name',d.department_name,'workflow_name','Quy trình cũ'),'content_snapshot',jsonb_build_object('year',d.year,'period',d.period,'period_kind',d.period_kind,'url',v.url,'attachments',v.attachments,'items',v.items,'previous_items',(SELECT coalesce(ov.items,'[]'::jsonb) FROM public.biz_document_versions ov WHERE ov.id=d.official_version_id),'reason',v.reason),'steps','[]'::jsonb,'current_step',0,'status',v.status,'submitted_at',v.submitted_at,'step_started_at',v.submitted_at,'source_revision',v.revision,'can_act',public.biz_doc_access(d.user_id,d.department_id,'report',true),'legacy',true,'events','[]'::jsonb) FROM public.biz_document_versions v JOIN public.biz_documents d ON d.id=v.document_id JOIN public.profiles p ON p.id=d.user_id WHERE d.kind='report' AND v.status='pending' AND public.biz_doc_access(d.user_id,d.department_id,'report') AND NOT EXISTS(SELECT 1 FROM public.biz_approval_runs WHERE version_id=v.id)) q;
 RETURN jsonb_build_object('runs',r||legacy,'server_now',now(),'has_assigned',EXISTS(SELECT 1 FROM public.biz_approval_runs WHERE status='pending' AND public.biz_run_assigned(version_id,true)));
END $function$
;

CREATE OR REPLACE FUNCTION public.biz_goal_draft_delete(_version_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v public.biz_goal_versions; g public.biz_annual_goals;
BEGIN
 SELECT * INTO v FROM public.biz_goal_versions WHERE id=_version_id FOR UPDATE;
 IF v.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy bản nháp.'; END IF;
 SELECT * INTO g FROM public.biz_annual_goals WHERE id=v.goal_id FOR UPDATE;
 IF NOT ((g.user_id=auth.uid() AND public.biz_can(auth.uid(),'biz.goal_submit')) OR public.is_super_admin(auth.uid())) THEN RAISE EXCEPTION 'Không có quyền xóa bản nháp này.'; END IF;
 IF v.status<>'draft' OR v.submitted_at IS NOT NULL THEN RAISE EXCEPTION 'Chỉ xóa được bản nháp chưa gửi duyệt.'; END IF;
 IF g.official_version_id=v.id THEN RAISE EXCEPTION 'Không thể xóa phiên bản chính thức.'; END IF;
 IF EXISTS(SELECT 1 FROM public.biz_goal_events WHERE version_id=v.id AND action IN ('submitted','approved','returned')) THEN RAISE EXCEPTION 'Bản nháp đã từng trình duyệt, không thể xóa cứng.'; END IF;
 IF EXISTS(SELECT 1 FROM public.biz_approval_runs WHERE version_id=v.id) THEN RAISE EXCEPTION 'Bản nháp đang nằm trong quy trình duyệt.'; END IF;
 DELETE FROM public.biz_goal_events WHERE version_id=v.id;
 DELETE FROM public.biz_goal_items WHERE version_id=v.id;
 DELETE FROM public.biz_goal_versions WHERE id=v.id;
 IF g.official_version_id IS NULL AND NOT EXISTS(SELECT 1 FROM public.biz_goal_versions WHERE goal_id=g.id) THEN
  DELETE FROM public.biz_annual_goals WHERE id=g.id;
 END IF;
END $function$
;

CREATE OR REPLACE FUNCTION public.biz_dashboard_published(_year integer, _period_kind text DEFAULT 'year'::text, _period integer DEFAULT 1)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE facts_ jsonb;previous_facts jsonb;scoped jsonb;previous_scoped jsonb;groups_ jsonb:='[]';months_ jsonb;cumulative_ jsonb;metrics_ jsonb;node record;m int;lo int;hi int;eval_hi int;current_month int;prev_year int;prev_lo int;prev_hi int;
BEGIN
IF auth.uid() IS NULL OR NOT public.biz_can(auth.uid(),'biz.dashboard_public') THEN RAISE EXCEPTION 'Không có quyền xem Dashboard tổng hợp.';END IF;
PERFORM public.biz_period_start(_year,_period_kind,_period);
lo:=CASE _period_kind WHEN 'month' THEN _period WHEN 'quarter' THEN (_period-1)*3+1 ELSE 1 END;hi:=lo+CASE _period_kind WHEN 'month' THEN 0 WHEN 'quarter' THEN 2 ELSE 11 END;
current_month:=CASE WHEN _year<extract(year FROM now() AT TIME ZONE 'Asia/Ho_Chi_Minh') THEN 12 WHEN _year>extract(year FROM now() AT TIME ZONE 'Asia/Ho_Chi_Minh') THEN 0 ELSE extract(month FROM now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::int END;eval_hi:=least(hi,current_month);
prev_year:=_year;prev_hi:=lo-1;prev_lo:=prev_hi-(hi-lo);
IF _period_kind='year' THEN prev_year:=_year-1;prev_lo:=1;prev_hi:=12;ELSIF prev_lo<1 THEN prev_year:=_year-1;prev_hi:=12;prev_lo:=12-(hi-lo);END IF;
facts_:=private.biz_published_facts(_year);previous_facts:=CASE WHEN prev_year=_year THEN facts_ WHEN prev_year>=2000 THEN private.biz_published_facts(prev_year) ELSE '[]'::jsonb END;
FOR node IN SELECT 'all'::text AS id,'Toàn Khối'::text AS name,'block'::text AS level,0::bigint AS ord UNION ALL SELECT id::text,name,'system',row_number() OVER(ORDER BY created_at,name) FROM public.biz_systems WHERE active ORDER BY ord LOOP
SELECT coalesce(jsonb_agg(f),'[]') INTO scoped FROM jsonb_array_elements(facts_) f WHERE node.id='all' OR f->>'system_id'=node.id;
SELECT coalesce(jsonb_agg(f),'[]') INTO previous_scoped FROM jsonb_array_elements(previous_facts) f WHERE node.id='all' OR f->>'system_id'=node.id;
months_:='[]';cumulative_:='[]';
FOR m IN 1..12 LOOP
metrics_:=private.biz_published_metrics(scoped,m,m,_year,now());SELECT coalesce(jsonb_agg(x||jsonb_build_object('group_id',m::text,'group_name','Tháng '||m)),'[]') INTO metrics_ FROM jsonb_array_elements(metrics_) x;months_:=months_||metrics_;
metrics_:=private.biz_published_metrics(scoped,1,m,_year,now());SELECT coalesce(jsonb_agg(x||jsonb_build_object('group_id',m::text,'group_name','Tháng '||m)),'[]') INTO metrics_ FROM jsonb_array_elements(metrics_) x;cumulative_:=cumulative_||metrics_;
END LOOP;
groups_:=groups_||jsonb_build_array(jsonb_build_object('level',node.level,'id',node.id,'name',node.name,'metrics',private.biz_published_metrics(scoped,lo,hi,_year,now()),'evaluation_metrics',private.biz_published_metrics(scoped,lo,eval_hi,_year,now()),'months',months_,'cumulative',cumulative_,'previous_metrics',private.biz_published_metrics(previous_scoped,prev_lo,prev_hi,prev_year,now()),'previous_period',jsonb_build_object('year',prev_year,'lo',prev_lo,'hi',prev_hi)));
END LOOP;
RETURN jsonb_build_object('year',_year,'period_kind',_period_kind,'period',_period,'mode','official','lo',lo,'hi',hi,'evaluation_hi',eval_hi,'ongoing',hi>=current_month AND _year>=extract(year FROM now() AT TIME ZONE 'Asia/Ho_Chi_Minh'),'groups',groups_,'server_now',now());
END $function$
;

CREATE OR REPLACE FUNCTION public.biz_document_open(_version_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v public.biz_document_versions; d public.biz_documents;
BEGIN
 SELECT * INTO v FROM public.biz_document_versions WHERE id=_version_id;
 IF v.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy phiên bản tài liệu.'; END IF;
 IF NOT public.biz_document_access(v.document_id) THEN RAISE EXCEPTION 'Không có quyền xem tài liệu này.'; END IF;
 SELECT * INTO d FROM public.biz_documents WHERE id=v.document_id;
 IF d.kind='plan' AND (v.submitted_at IS NULL OR NOT public.biz_docs_url_ok(v.url)) THEN RAISE EXCEPTION 'Kế hoạch chưa có phiên bản Google Docs chính thức đã nộp.'; END IF;
 IF v.url IS NULL OR btrim(v.url)='' THEN RAISE EXCEPTION 'Phiên bản này chưa có liên kết tài liệu.'; END IF;
 INSERT INTO public.biz_document_views(version_id,viewer_id) VALUES(v.id,auth.uid()) ON CONFLICT(version_id,viewer_id) DO UPDATE SET latest_opened_at=now();
 RETURN v.url;
END $function$
;

CREATE OR REPLACE FUNCTION private.position_role_sources(_user uuid, _at timestamp with time zone DEFAULT now())
 RETURNS TABLE(assignment_id text, role_id text, unit_id text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT a.id, b.role_id, a.unit_id FROM org_assignments a JOIN org_position_roles b ON b.unit_id=a.unit_id AND b.title_id=a.title_id
  WHERE a.user_id=_user AND a.status='active' AND a.starts_at<=_at AND (a.ends_at IS NULL OR a.ends_at>_at)
$function$
;
