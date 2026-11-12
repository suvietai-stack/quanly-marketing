CREATE OR REPLACE FUNCTION public.biz_can(_actor uuid, _permission text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
 IF NOT private.legacy_business_allowed(_actor) THEN RETURN false; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=_actor AND status='Đang hoạt động') THEN RETURN false;END IF;
 IF public.is_super_admin(_actor) THEN RETURN true;END IF;
 IF _permission NOT LIKE 'biz.%' THEN RETURN private.sig_can(_actor,_permission);END IF;
 IF public.biz_admin(_actor) THEN RETURN true;END IF;
 IF _permission='biz.access_manage' THEN RETURN false;END IF;
 IF _permission='biz.intervene' THEN RETURN EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND a.position_snapshot->>'code' IN ('executive_director','deputy_executive_director') AND a.position_snapshot->>'business_policy'='executive' AND coalesce((a.position_snapshot->>'all_business')::boolean,false) AND private.biz_source_ok(a.user_id, a.started_at));END IF;
 IF public.biz_exception_ok(_actor,_permission) THEN RETURN true;END IF;
 IF _permission='biz.view_all' THEN RETURN public.biz_all_scope(_actor);END IF;
 IF _permission='biz.dashboard_public' THEN RETURN public.biz_participant(_actor) OR public.biz_all_scope(_actor);END IF;
 IF _permission IN ('biz.view_dept','biz.approval_view') THEN RETURN public.biz_manager(_actor) OR public.biz_all_scope(_actor) OR EXISTS(SELECT 1 FROM public.biz_approval_runs r WHERE r.status='pending' AND (r.steps->r.current_step->>'user_id'=_actor::text OR r.steps->r.current_step->>'substitute_id'=_actor::text));END IF;
 IF _permission IN ('biz.view_own','biz.plan_submit','biz.goal_submit','biz.report_submit') THEN RETURN public.biz_participant(_actor) AND (NOT EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND a.position_snapshot->>'business_policy'='executive' AND private.biz_source_ok(a.user_id, a.started_at)) OR EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND coalesce(a.position_snapshot->>'business_policy','personal')<>'executive' AND private.biz_source_ok(a.user_id, a.started_at)));END IF;
 IF _permission='biz.plan_request_revision' THEN RETURN public.biz_manager(_actor);END IF;
 IF _permission IN ('biz.goal_approve','biz.report_approve','biz.late_approve') THEN RETURN public.biz_manager(_actor) OR EXISTS(SELECT 1 FROM public.biz_approval_runs r WHERE r.status='pending' AND (r.steps->r.current_step->>'user_id'=_actor::text OR r.steps->r.current_step->>'substitute_id'=_actor::text));END IF;
 IF _permission='biz.plan_approve' THEN RETURN false;END IF;
 RETURN false;
END $function$
;

CREATE OR REPLACE FUNCTION private.legacy_business_allowed(u uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT NOT private.legacy_reset_applies(u)
     OR EXISTS(SELECT 1 FROM public.biz_appointments a
               WHERE a.user_id=u AND a.status<>'cancelled' AND a.started_at<=now()
                 AND (a.ended_at IS NULL OR a.ended_at>now())
                 AND a.started_at > (SELECT max(reset_at) FROM private.legacy_reset_accounts WHERE user_id=u AND active))
$function$
;

CREATE OR REPLACE FUNCTION public.biz_department_access(_department_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 SELECT private.legacy_business_allowed(auth.uid()) AND (
  SELECT public.is_super_admin(auth.uid()) OR public.biz_org_can_manage() OR public.biz_can(auth.uid(),'biz.workflow_manage') OR public.biz_all_scope(auth.uid()) OR public.biz_can(auth.uid(),'biz.dept_manage') OR public.biz_can(auth.uid(),'biz.kr_manage') OR EXISTS(SELECT 1 FROM public.biz_department_members m WHERE m.department_id=_department_id AND ((m.user_id=auth.uid() AND m.ended_at IS NULL AND private.biz_source_ok(m.user_id, m.started_at) AND (public.biz_can(auth.uid(),'biz.view_own') OR public.biz_can(auth.uid(),'biz.goal_submit'))) OR ((public.biz_can(auth.uid(),'biz.view_dept') OR public.biz_can(auth.uid(),'biz.goal_approve')) AND public.biz_scope_ok(auth.uid(),m.user_id,_department_id)))));
$function$
;

CREATE OR REPLACE FUNCTION public.biz_member_access(_user_id uuid, _department_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT public.biz_org_can_manage() OR public.biz_can(auth.uid(),'biz.dept_manage') OR public.biz_all_scope(auth.uid()) OR (_user_id=auth.uid() AND (public.biz_can(auth.uid(),'biz.view_own') OR public.biz_can(auth.uid(),'biz.goal_submit'))) OR ((public.biz_can(auth.uid(),'biz.view_dept') OR public.biz_can(auth.uid(),'biz.goal_approve')) AND public.biz_scope_ok(auth.uid(),_user_id,_department_id)) $function$
;

CREATE OR REPLACE FUNCTION public.biz_goal_can_review(_user_id uuid, _department_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT private.legacy_business_allowed(auth.uid()) AND (SELECT _user_id<>auth.uid() AND (public.is_super_admin(auth.uid()) OR EXISTS(SELECT 1 FROM public.biz_goal_versions v JOIN public.biz_annual_goals g ON g.id=v.goal_id JOIN public.biz_approval_runs r ON r.version_id=v.id WHERE g.user_id=_user_id AND g.department_id=_department_id AND r.status='pending' AND public.biz_run_assigned(v.id,true) AND public.biz_step_scope_ok(r.steps,r.current_step,auth.uid(),r.owner_id,r.department_id,r.submitted_at)))); $function$
;

CREATE OR REPLACE FUNCTION public.biz_goals_read(_year integer)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
 SELECT coalesce(jsonb_agg(jsonb_build_object('id',g.id,'user_id',g.user_id,'employee_name',p.full_name,'year',g.year,'department_id',g.department_id,'department_name',g.department_name,'official_version_id',g.official_version_id,'can_review',public.biz_goal_can_review(g.user_id,g.department_id),'versions',
 (SELECT coalesce(jsonb_agg(to_jsonb(v)||jsonb_build_object('items',(SELECT coalesce(jsonb_agg(jsonb_build_object('metric_id',i.metric_id,'definition',i.definition,'annual',i.annual::text,'months',ARRAY(SELECT x::text FROM unnest(i.months) x)) ORDER BY i.id),'[]'::jsonb) FROM public.biz_goal_items i WHERE i.version_id=v.id)) ORDER BY v.version),'[]'::jsonb) FROM public.biz_goal_versions v WHERE v.goal_id=g.id))), '[]'::jsonb)
 FROM public.biz_annual_goals g JOIN public.profiles p ON p.id=g.user_id WHERE g.year=_year AND public.biz_goal_can_read(g.id)
$function$
;

CREATE OR REPLACE FUNCTION public.biz_approval_step(_version uuid, _approve boolean, _comment text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE r public.biz_approval_runs; last_ boolean;
BEGIN
 SELECT * INTO r FROM public.biz_approval_runs WHERE version_id=_version AND status='pending' FOR UPDATE; IF r.id IS NULL THEN RETURN _approve; END IF;
 IF r.kind LIKE 'late_%' AND NOT public.biz_late_can_act(_version) THEN RAISE EXCEPTION 'Không đến lượt xử lý nộp bù.';END IF;IF NOT public.biz_step_scope_ok(r.steps,r.current_step,auth.uid(),r.owner_id,r.department_id,r.submitted_at) OR r.owner_id=auth.uid() OR NOT public.biz_run_assigned(_version,true) OR NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND status='Đang hoạt động') OR NOT public.biz_can(auth.uid(),CASE WHEN r.kind='goal_year' THEN 'biz.goal_approve' ELSE 'biz.report_approve' END) THEN RAISE EXCEPTION 'Không đến lượt, không có quyền hoặc không được tự duyệt.'; END IF;
 IF NOT _approve AND btrim(coalesce(_comment,''))='' THEN RAISE EXCEPTION 'Cần nhập lý do yêu cầu chỉnh sửa.'; END IF;
 last_:=_approve AND r.current_step+1=jsonb_array_length(r.steps);
 UPDATE public.biz_approval_runs SET status=CASE WHEN NOT _approve THEN 'changes' WHEN last_ THEN 'approved' ELSE 'pending' END,current_step=CASE WHEN _approve AND NOT last_ THEN current_step+1 ELSE current_step END,step_started_at=now(),revision=revision+1 WHERE id=r.id;
 INSERT INTO public.biz_approval_events(run_id,actor_id,action,step,comment) VALUES(r.id,auth.uid(),CASE WHEN NOT _approve THEN 'returned' WHEN last_ THEN 'approved' ELSE 'step_approved' END,r.current_step,nullif(btrim(_comment),'')); RETURN last_;
END $function$
;

CREATE OR REPLACE FUNCTION public.biz_goal_save(_version_id uuid, _revision integer, _items jsonb, _submit boolean DEFAULT false)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v public.biz_goal_versions; g public.biz_annual_goals; i public.biz_goal_items; r jsonb; annual_value numeric; month_values numeric[]; aggregate_value numeric; val jsonb;
BEGIN
 SELECT * INTO v FROM public.biz_goal_versions WHERE id=_version_id FOR UPDATE;
 SELECT * INTO g FROM public.biz_annual_goals WHERE id=v.goal_id;
 IF g.user_id IS DISTINCT FROM auth.uid() OR NOT public.biz_can(auth.uid(),'biz.goal_submit') THEN RAISE EXCEPTION 'Không có quyền sửa mục tiêu.'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.biz_department_members m JOIN public.biz_departments d ON d.id=m.department_id AND d.active WHERE m.user_id=auth.uid() AND m.ended_at IS NULL) THEN RAISE EXCEPTION 'Bạn chưa thuộc phòng kinh doanh hợp lệ.'; END IF;
 IF v.status NOT IN ('draft','changes') THEN RAISE EXCEPTION 'Mục tiêu đang chờ duyệt hoặc đã khóa.'; END IF;
 IF v.revision<>_revision THEN RAISE EXCEPTION 'Dữ liệu đã thay đổi. Hãy tải lại trước khi lưu.'; END IF;
 IF jsonb_typeof(_items) IS DISTINCT FROM 'array' OR jsonb_array_length(_items)<>(SELECT count(*) FROM public.biz_goal_items WHERE version_id=v.id) OR (SELECT count(DISTINCT x->>'metric_id') FROM jsonb_array_elements(_items) x)<>jsonb_array_length(_items) THEN RAISE EXCEPTION 'Danh sách KR không hợp lệ.'; END IF;
 FOR i IN SELECT * FROM public.biz_goal_items WHERE version_id=v.id LOOP
  SELECT x INTO r FROM jsonb_array_elements(_items) x WHERE x->>'metric_id'=i.metric_id::text;
  IF r IS NULL OR jsonb_typeof(r->'months') IS DISTINCT FROM 'array' OR jsonb_array_length(r->'months')<>12 THEN RAISE EXCEPTION 'Cần đủ 12 ô tháng cho mỗi KR.'; END IF;
  FOR val IN SELECT r->'annual' UNION ALL SELECT x FROM jsonb_array_elements(r->'months') x LOOP
   IF val IS NOT NULL AND val<>'null'::jsonb AND (val#>>'{}') !~ '^[0-9]{1,20}$' THEN RAISE EXCEPTION 'Giá trị phải là số nguyên không âm, tối đa 20 chữ số.'; END IF;
  END LOOP;
  annual_value:=(r->>'annual')::numeric;
  SELECT array_agg((x#>>'{}')::numeric ORDER BY n) INTO month_values FROM jsonb_array_elements(r->'months') WITH ORDINALITY t(x,n);
  IF _submit THEN
   IF annual_value IS NULL OR array_position(month_values,NULL) IS NOT NULL THEN RAISE EXCEPTION 'Cần nhập mục tiêu năm và đủ 12 tháng.'; END IF;
   SELECT CASE WHEN i.definition->>'aggregation'='sum' THEN sum(x) ELSE avg(x) END INTO aggregate_value FROM unnest(month_values) x;
   IF aggregate_value<>annual_value THEN RAISE EXCEPTION 'Phân bổ tháng không khớp mục tiêu năm: %.',i.definition->>'name'; END IF;
  END IF;
  UPDATE public.biz_goal_items SET annual=annual_value,months=month_values WHERE id=i.id;
 END LOOP;
 UPDATE public.biz_goal_versions SET status=CASE WHEN _submit THEN 'pending' ELSE status END,submitted_at=CASE WHEN _submit THEN now() ELSE submitted_at END,revision=revision+1,updated_at=now() WHERE id=v.id;
 INSERT INTO public.biz_goal_events(goal_id,version_id,actor_id,action,payload) VALUES(g.id,v.id,auth.uid(),CASE WHEN _submit THEN 'submitted' ELSE 'saved' END,_items);
END $function$
;

CREATE OR REPLACE FUNCTION private.biz_source_ok(_user uuid, _started_at timestamp with time zone)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT NOT private.legacy_reset_applies(_user)
     OR _started_at > (SELECT max(reset_at) FROM private.legacy_reset_accounts WHERE user_id=_user AND active)
$function$
;

CREATE OR REPLACE FUNCTION private.org_slot_rules(u uuid, c jsonb)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT coalesce(jsonb_agg(x.rule),'[]'::jsonb) FROM (
 SELECT jsonb_build_object('id',(m->>'id')||':'||r.id||':'||p,'permission',p,'effect','ALLOW','scope','native','active',true,'source_kind','appointment_role','source_id',m->>'id','source_name',r.name,'role_id',r.id,'unit_id',m->>'unit_id','slot_id',s->>'id','starts_at',m->>'starts_at','ends_at',m->>'ends_at','legacy',false) rule
 FROM jsonb_array_elements(coalesce(c->'memberships','[]')) m JOIN LATERAL jsonb_array_elements(coalesce(c->'position_slots','[]')) s ON s->>'id'=m->>'slot_id' AND s->>'title_id'=m->>'title_id' AND s->>'unit_id'=m->>'unit_id' JOIN LATERAL jsonb_array_elements(coalesce(c->'titles','[]')) t ON t->>'id'=m->>'title_id' JOIN app_roles r ON r.id=s->>'role_id' AND r.role_kind='position' AND r.catalog_state='standard' AND NOT r.is_system CROSS JOIN LATERAL unnest(r.permissions) p
 WHERE private.is_active(u) AND m->>'user_id'=u::text AND private.base_valid_at(m) AND coalesce(m->>'status','active')='active' AND coalesce((s->>'active')::boolean,false) AND coalesce((t->>'active')::boolean,false) AND private.org_role_permission_ready(p)
 UNION ALL
 -- Position model: many holders per (unit,title) without per-person slots; scope = that assignment's own unit.
 SELECT jsonb_build_object('id',(m->>'id')||':'||r.id||':'||p,'permission',p,'effect','ALLOW','scope','native','active',true,'source_kind','appointment_role','source_id',m->>'id','source_name',r.name,'role_id',r.id,'unit_id',m->>'unit_id','slot_id',NULL,'starts_at',m->>'starts_at','ends_at',m->>'ends_at','legacy',false)
 FROM jsonb_array_elements(coalesce(c->'memberships','[]')) m JOIN public.org_position_roles b ON b.unit_id=m->>'unit_id' AND b.title_id=m->>'title_id' JOIN LATERAL jsonb_array_elements(coalesce(c->'titles','[]')) t ON t->>'id'=m->>'title_id' JOIN app_roles r ON r.id=b.role_id AND r.role_kind='position' AND r.catalog_state='standard' AND NOT r.is_system CROSS JOIN LATERAL unnest(r.permissions) p
 WHERE private.is_active(u) AND m->>'user_id'=u::text AND nullif(m->>'slot_id','') IS NULL AND private.base_valid_at(m) AND coalesce(m->>'status','active')='active' AND coalesce((t->>'active')::boolean,false) AND private.org_role_permission_ready(p)
) x $function$
;

CREATE OR REPLACE FUNCTION public.biz_document_save_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE d public.biz_documents; target uuid;
BEGIN
 SELECT * INTO d FROM public.biz_documents WHERE id=NEW.document_id;
 IF OLD.status='approved' THEN RAISE EXCEPTION 'Phiên bản đã duyệt không được sửa.'; END IF;
 IF d.kind='report' AND d.period_kind IN ('day','week','month','quarter') AND NEW.status IN ('pending','approved') AND OLD.status IN ('draft','changes') AND OLD.target_version_id IS NULL THEN
  SELECT official_version_id INTO target FROM public.biz_annual_goals WHERE user_id=d.user_id AND year=d.year;
  IF target IS NOT NULL THEN RAISE EXCEPTION 'Mục tiêu đã được duyệt sau khi tạo bản nháp. Hãy gắn mục tiêu chính thức trước khi gửi.'; END IF;
 END IF;
 RETURN NEW;
END $function$
;

CREATE OR REPLACE FUNCTION public.biz_documents_read(_kind text, _period_kind text, _year integer, _period integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE result jsonb;
BEGIN
 IF _kind NOT IN ('plan','report') THEN RAISE EXCEPTION 'Loại tài liệu không hợp lệ.'; END IF; PERFORM public.biz_period_start(_year,_period_kind,_period);
 SELECT coalesce(jsonb_agg(jsonb_build_object('user_id',p.id,'employee_name',p.full_name,'department_id',coalesce(d.department_id,dep.id),'department_name',coalesce(d.department_name,dep.name),'can_review',public.biz_doc_access(p.id,coalesce(d.department_id,dep.id),_kind,true),'my_view',CASE WHEN (_kind='plan' AND NOT EXISTS(SELECT 1 FROM public.biz_document_versions sv WHERE sv.document_id=d.id AND sv.submitted_at IS NOT NULL AND public.biz_docs_url_ok(sv.url))) OR d.id IS NULL OR NOT EXISTS(SELECT 1 FROM public.biz_document_versions x WHERE x.document_id=d.id) THEN 'none' WHEN EXISTS(SELECT 1 FROM public.biz_document_views w JOIN public.biz_document_versions lv ON lv.id=w.version_id WHERE w.viewer_id=auth.uid() AND lv.document_id=d.id AND lv.version=(SELECT max(version) FROM public.biz_document_versions WHERE document_id=d.id)) THEN 'opened' WHEN EXISTS(SELECT 1 FROM public.biz_document_views w JOIN public.biz_document_versions ov ON ov.id=w.version_id WHERE w.viewer_id=auth.uid() AND ov.document_id=d.id) THEN 'new_version' ELSE 'unopened' END,'document',CASE WHEN d.id IS NULL THEN NULL ELSE to_jsonb(d)||jsonb_build_object('deadline',CASE WHEN d.deadline_frozen THEN d.deadline ELSE public.biz_any_deadline_at(_kind||'_'||_period_kind,_year,_period) END,'versions',(SELECT jsonb_agg(to_jsonb(v) ORDER BY version) FROM public.biz_document_versions v WHERE document_id=d.id)) END,'deadline',CASE WHEN d.deadline_frozen THEN d.deadline ELSE public.biz_any_deadline_at(_kind||'_'||_period_kind,_year,_period) END,'server_now',now()) ORDER BY p.full_name),'[]') INTO result
 FROM public.profiles p JOIN public.biz_departments dep ON dep.id=public.biz_period_department_any(p.id,_period_kind,_year,_period) LEFT JOIN public.biz_documents d ON d.user_id=p.id AND d.kind=_kind AND d.period_kind=_period_kind AND d.year=_year AND d.period=_period
 WHERE public.biz_doc_access(p.id,coalesce(d.department_id,dep.id),_kind) AND (_kind<>'report' OR d.id IS NOT NULL OR public.biz_report_period_matches(p.id,_period_kind,_year,_period));
 RETURN result;
END $function$
;

CREATE OR REPLACE FUNCTION public.biz_document_start(_kind text, _period_kind text, _year integer, _period integer, _reason text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE d public.biz_documents; v_id uuid; dep uuid; target uuid; vals jsonb; pstart date; cyc jsonb;
BEGIN
 IF _kind NOT IN ('plan','report') OR NOT public.biz_can(auth.uid(),'biz.'||_kind||'_submit') THEN RAISE EXCEPTION 'Không có quyền nộp tài liệu.'; END IF;
 PERFORM public.biz_period_start(_year,_period_kind,_period); PERFORM 1 FROM public.profiles WHERE id=auth.uid() FOR UPDATE;
 pstart:=public.biz_period_start_date(_period_kind,_year,_period);
 dep:=public.biz_period_department_any(auth.uid(),_period_kind,_year,_period); IF dep IS NULL THEN RAISE EXCEPTION 'Bạn không thuộc phòng kinh doanh trong kỳ này.'; END IF;
 SELECT * INTO d FROM public.biz_documents WHERE user_id=auth.uid() AND kind=_kind AND period_kind=_period_kind AND year=_year AND period=_period FOR UPDATE;
 IF d.id IS NULL AND _kind='report' THEN IF NOT public.biz_report_period_matches(auth.uid(),_period_kind,_year,_period) THEN RAISE EXCEPTION 'Kỳ xem giao thời điểm đổi chu kỳ; chỉ nộp kỳ nguồn được giao, không tạo nghĩa vụ trùng.'; END IF;
   cyc:=public.biz_report_cycle_config_of(auth.uid(),pstart);
   IF coalesce(cyc->>'cycle','month')<>_period_kind THEN RAISE EXCEPTION 'Đơn vị của bạn đang áp dụng chu kỳ báo cáo khác cho kỳ này — không tạo hồ sơ trùng.'; END IF;
   IF _period_kind='day' AND cyc->'workdays' IS NOT NULL AND coalesce(cyc->'workdays'->>(extract(isodow FROM pstart)::integer::text),'true')='false' THEN RAISE EXCEPTION 'Ngày này không thuộc lịch báo cáo của đơn vị.'; END IF;
 END IF;
 IF d.id IS NULL THEN INSERT INTO public.biz_documents(user_id,department_id,department_name,kind,period_kind,year,period,deadline,period_start,period_end) SELECT auth.uid(),id,name,_kind,_period_kind,_year,_period,public.biz_any_deadline_at(_kind||'_'||_period_kind,_year,_period),pstart,public.biz_period_end_date(_period_kind,_year,_period) FROM public.biz_departments WHERE id=dep RETURNING * INTO d; END IF;
 SELECT id INTO v_id FROM public.biz_document_versions WHERE document_id=d.id AND status<>'approved'; IF v_id IS NOT NULL THEN RETURN v_id; END IF;
 IF d.official_version_id IS NOT NULL AND btrim(coalesce(_reason,''))='' THEN RAISE EXCEPTION 'Cần nêu lý do điều chỉnh.'; END IF;
 SELECT official_version_id INTO target FROM public.biz_annual_goals WHERE user_id=auth.uid() AND year=_year;
 vals:='[]';
 IF _kind='report' AND target IS NOT NULL THEN
   IF _period_kind='month' THEN
     SELECT coalesce(jsonb_agg(jsonb_build_object('metric_id',metric_id,'definition',definition,'target',months[_period]::text,'annual_target',annual::text,'actual',NULL)),'[]') INTO vals FROM public.biz_goal_items WHERE version_id=target;
   ELSIF _period_kind='quarter' THEN
     SELECT coalesce(jsonb_agg(jsonb_build_object('metric_id',metric_id,'definition',definition,'target',qt,'annual_target',annual::text,'actual',NULL)),'[]') INTO vals
     FROM (SELECT metric_id,definition,annual,months,
              CASE WHEN (months[(_period-1)*3+1]#>>'{}')~'^[0-9]+$' AND (months[(_period-1)*3+2]#>>'{}')~'^[0-9]+$' AND (months[(_period-1)*3+3]#>>'{}')~'^[0-9]+$'
                  THEN ((months[(_period-1)*3+1]#>>'{}')::numeric+(months[(_period-1)*3+2]#>>'{}')::numeric+(months[(_period-1)*3+3]#>>'{}')::numeric)::text END AS qt
           FROM public.biz_goal_items WHERE version_id=target) g;
   ELSE
     SELECT coalesce(jsonb_agg(jsonb_build_object('metric_id',metric_id,'definition',definition,'target',NULL,'annual_target',annual::text,'actual',NULL)),'[]') INTO vals FROM public.biz_goal_items WHERE version_id=target;
   END IF;
 END IF;
 INSERT INTO public.biz_document_versions(document_id,version,reason,target_version_id,items) VALUES(d.id,coalesce((SELECT max(version) FROM public.biz_document_versions WHERE document_id=d.id),0)+1,nullif(btrim(_reason),''),CASE WHEN _kind='report' THEN target END,vals) RETURNING id INTO v_id;
 IF d.official_version_id IS NOT NULL THEN UPDATE public.biz_document_versions SET url=old.url,notes=old.notes,attachments=old.attachments,allocations=old.allocations,target_version_id=old.target_version_id,items=old.items FROM public.biz_document_versions old WHERE old.id=d.official_version_id AND biz_document_versions.id=v_id; END IF;
 INSERT INTO public.biz_document_events(document_id,version_id,actor_id,action,payload) VALUES(d.id,v_id,auth.uid(),'created',jsonb_build_object('reason',_reason)); RETURN v_id;
END $function$
;

CREATE OR REPLACE FUNCTION public.biz_goal_start(_year integer, _reason text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE g public.biz_annual_goals; v_id uuid; m public.biz_department_members; d public.biz_departments;
BEGIN
 IF NOT public.biz_can(auth.uid(),'biz.goal_submit') THEN RAISE EXCEPTION 'Không có quyền lập mục tiêu.'; END IF;
 PERFORM 1 FROM public.profiles WHERE id=auth.uid() FOR UPDATE;
 SELECT * INTO m FROM public.biz_department_members WHERE user_id=auth.uid() AND ended_at IS NULL;
 SELECT * INTO d FROM public.biz_departments WHERE id=m.department_id AND active;
 IF d.id IS NULL THEN RAISE EXCEPTION 'Bạn chưa thuộc phòng kinh doanh đang hoạt động. Liên hệ người quản lý.'; END IF;
 SELECT * INTO g FROM public.biz_annual_goals WHERE user_id=auth.uid() AND year=_year FOR UPDATE;
 IF g.id IS NULL THEN
  IF NOT EXISTS(SELECT 1 FROM public.biz_kr_metrics WHERE department_id=d.id AND active) THEN RAISE EXCEPTION 'Phòng chưa có chỉ số KR.'; END IF;
  INSERT INTO public.biz_annual_goals(user_id,year,department_id,department_name) VALUES(auth.uid(),_year,d.id,d.name) RETURNING * INTO g;
 END IF;
 SELECT id INTO v_id FROM public.biz_goal_versions WHERE goal_id=g.id AND status<>'approved';
 IF v_id IS NOT NULL THEN RETURN v_id; END IF;
 IF g.official_version_id IS NOT NULL AND btrim(coalesce(_reason,''))='' THEN RAISE EXCEPTION 'Cần nêu lý do điều chỉnh.'; END IF;
 INSERT INTO public.biz_goal_versions(goal_id,version,reason) VALUES(g.id,coalesce((SELECT max(version) FROM public.biz_goal_versions WHERE goal_id=g.id),0)+1,nullif(btrim(_reason),'')) RETURNING id INTO v_id;
 IF g.official_version_id IS NOT NULL THEN
  INSERT INTO public.biz_goal_items(version_id,metric_id,definition,annual,months) SELECT v_id,metric_id,definition,annual,months FROM public.biz_goal_items WHERE version_id=g.official_version_id;
 ELSE
  INSERT INTO public.biz_goal_items(version_id,metric_id,definition) SELECT v_id,id,jsonb_build_object('name',name,'description',description,'unit',unit,'aggregation',aggregation,'value_kind',value_kind,'direction',direction) FROM public.biz_kr_metrics WHERE department_id=g.department_id AND active;
 END IF;
 INSERT INTO public.biz_goal_events(goal_id,version_id,actor_id,action,comment) VALUES(g.id,v_id,auth.uid(),'created',_reason);
 RETURN v_id;
END $function$
;

CREATE OR REPLACE FUNCTION public.biz_run_can_read(_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT private.legacy_business_allowed(auth.uid()) AND (SELECT EXISTS(SELECT 1 FROM public.biz_approval_runs r WHERE r.id=_id AND EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND status='Đang hoạt động') AND (public.biz_all_scope(auth.uid()) OR r.owner_id=auth.uid() OR public.biz_scope_ok(auth.uid(),r.owner_id,r.department_id,r.submitted_at) OR EXISTS(SELECT 1 FROM jsonb_array_elements(r.steps) s WHERE s->>'user_id'=auth.uid()::text OR s->>'substitute_id'=auth.uid()::text)))); $function$
;

CREATE OR REPLACE FUNCTION public.biz_effective_access(_user uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE u uuid:=coalesce(_user,auth.uid());perms jsonb;
BEGIN
IF auth.uid() IS NULL OR (u<>auth.uid() AND NOT public.biz_org_can_manage() AND NOT private.sig_can(auth.uid(),'settings.role')) THEN RAISE EXCEPTION 'Không có quyền xem quyền nhân sự.';END IF;
SELECT coalesce(jsonb_agg(p),'[]') INTO perms FROM (
  SELECT p FROM unnest(ARRAY['biz.intervene','biz.access_manage','biz.dashboard_public','biz.view_own','biz.view_dept','biz.view_all','biz.plan_submit','biz.goal_submit','biz.report_submit','biz.plan_request_revision','biz.goal_approve','biz.report_approve','biz.late_approve','biz.approval_view','biz.org_manage','biz.dept_manage','biz.kr_manage','biz.deadline_manage','biz.workflow_manage']) p WHERE public.biz_can(u,p)
  UNION ALL
  SELECT p FROM unnest(ARRAY['k3.use','k3.view_scope','k3.comment','k3.settings']) p WHERE public.k3_can(u,p) UNION ALL SELECT p FROM unnest(ARRAY['biz.crm_use','biz.crm_view_scope','biz.crm_edit_other','biz.crm_transfer','biz.crm_export','biz.crm_archive','biz.crm_settings','biz.crm_access']) p WHERE public.crm_can(u,p)
) q;
RETURN jsonb_build_object('user_id',u,'permissions',perms,'server_now',now(),'super_admin',public.is_super_admin(u),'appointments',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',a.id,'position',a.position_snapshot->>'name','scope',a.scope_kind,'unit_name',CASE a.scope_kind WHEN 'system' THEN CASE WHEN coalesce((a.position_snapshot->>'all_business')::boolean,false) THEN 'Toàn Khối Kinh doanh Sứ Việt' ELSE (SELECT name FROM public.biz_systems WHERE id=a.system_id) END WHEN 'department' THEN (SELECT name FROM public.biz_departments WHERE id=a.department_id) WHEN 'team' THEN (SELECT name FROM public.biz_teams WHERE id=a.team_id) ELSE 'Cá nhân' END,'started_at',a.started_at,'ended_at',a.ended_at)),'[]') FROM public.biz_appointments a WHERE a.user_id=u AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now())),'legacy_assignments',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',a.id,'position',coalesce(p.name,a.position),'scope',p.unit_kind,'unit_name',coalesce(s.name,d.name,t.name),'started_at',a.started_at,'ended_at',a.ended_at)),'[]') FROM public.biz_management_assignments a LEFT JOIN public.biz_positions p ON p.code=a.position LEFT JOIN public.biz_systems s ON s.id=a.system_id LEFT JOIN public.biz_departments d ON d.id=a.department_id LEFT JOIN public.biz_teams t ON t.id=a.team_id WHERE a.user_id=u AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now())),'exceptions',(SELECT coalesce(jsonb_agg(to_jsonb(e)),'[]') FROM public.biz_access_exceptions e WHERE (e.user_id=u OR EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=u AND r.role_id=e.role_id)) AND e.revoked_at IS NULL AND e.started_at<=now() AND (e.ended_at IS NULL OR e.ended_at>now())),'next_change',(SELECT min(at_) FROM (SELECT a.started_at at_ FROM public.biz_appointments a WHERE a.user_id=u AND a.status<>'cancelled' UNION ALL SELECT a.ended_at FROM public.biz_appointments a WHERE a.user_id=u AND a.status<>'cancelled' UNION ALL SELECT a.started_at FROM public.biz_management_assignments a WHERE a.user_id=u UNION ALL SELECT a.ended_at FROM public.biz_management_assignments a WHERE a.user_id=u UNION ALL SELECT e.started_at FROM public.biz_access_exceptions e WHERE e.user_id=u OR EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=u AND r.role_id=e.role_id) UNION ALL SELECT e.ended_at FROM public.biz_access_exceptions e WHERE e.user_id=u OR EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=u AND r.role_id=e.role_id)) q WHERE at_>now()));
END $function$
;

CREATE OR REPLACE FUNCTION public.biz_document_save(_id uuid, _revision integer, _url text, _notes text, _actuals jsonb, _submit boolean DEFAULT false, _attachments jsonb DEFAULT NULL::jsonb, _allocations jsonb DEFAULT NULL::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v public.biz_document_versions; d public.biz_documents; new_items jsonb:='[]'; i jsonb; a jsonb; att jsonb; first_official boolean:=false;
  segs jsonb:='[]'; seg jsonb; al jsonb; tot numeric; wk text; cs date; ce date; mend date;
BEGIN
 SELECT * INTO v FROM public.biz_document_versions WHERE id=_id FOR UPDATE; SELECT * INTO d FROM public.biz_documents WHERE id=v.document_id FOR UPDATE;
 IF d.user_id IS DISTINCT FROM auth.uid() OR NOT public.biz_can(auth.uid(),'biz.'||d.kind||'_submit') THEN RAISE EXCEPTION 'Không có quyền sửa tài liệu.'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('biz_report_docs:'||d.user_id::text)); IF v.status NOT IN ('draft','changes') THEN RAISE EXCEPTION 'Tài liệu đang chờ duyệt hoặc đã khóa.'; END IF;
 IF v.revision<>_revision THEN RAISE EXCEPTION 'Dữ liệu đã thay đổi. Hãy tải lại.'; END IF;
 IF btrim(coalesce(_url,''))<>'' AND NOT public.biz_docs_url_ok(btrim(_url)) THEN RAISE EXCEPTION 'Link phải là Google Docs HTTPS hợp lệ.'; END IF;
 IF _submit AND d.kind='plan' AND NOT public.biz_docs_url_ok(btrim(coalesce(_url,''))) THEN RAISE EXCEPTION 'Vui lòng nhập link Google Docs kế hoạch chính thức trước khi nộp.'; END IF;
 IF _attachments IS NOT NULL THEN
  IF jsonb_typeof(_attachments) IS DISTINCT FROM 'array' OR jsonb_array_length(_attachments)>10 THEN RAISE EXCEPTION 'Tài liệu đính kèm phải là danh sách tối đa 10 mục.'; END IF;
  FOR att IN SELECT * FROM jsonb_array_elements(_attachments) LOOP
   IF btrim(coalesce(att->>'name',''))='' OR length(att->>'name')>200 THEN RAISE EXCEPTION 'Mỗi tài liệu đính kèm cần tên, tối đa 200 ký tự.'; END IF;
   IF coalesce(att->>'url','')!~'^https://[^[:space:]]+$' OR length(att->>'url')>2000 THEN RAISE EXCEPTION 'Liên kết tài liệu đính kèm phải là HTTPS hợp lệ.'; END IF;
   IF length(coalesce(att->>'description',''))>500 THEN RAISE EXCEPTION 'Mô tả tài liệu tối đa 500 ký tự.'; END IF;
  END LOOP;
 END IF;
 IF d.kind='report' AND d.period_kind<>'year' THEN
  IF jsonb_typeof(_actuals) IS DISTINCT FROM 'array' OR jsonb_array_length(_actuals)<>jsonb_array_length(v.items) OR (SELECT count(DISTINCT x->>'metric_id') FROM jsonb_array_elements(_actuals) x)<>jsonb_array_length(_actuals) THEN RAISE EXCEPTION 'Danh sách KR không hợp lệ.'; END IF;
  FOR i IN SELECT * FROM jsonb_array_elements(v.items) LOOP
   SELECT x->'actual' INTO a FROM jsonb_array_elements(_actuals) x WHERE x->>'metric_id'=i->>'metric_id';
   IF a IS NULL THEN RAISE EXCEPTION 'Thiếu KR.'; END IF;
   IF a<>'null'::jsonb AND (a#>>'{}') !~ '^[0-9]{1,20}$' THEN RAISE EXCEPTION 'Thực tế phải là số nguyên không âm, tối đa 20 chữ số.'; END IF;
   IF _submit AND a='null'::jsonb THEN RAISE EXCEPTION 'Cần nhập kết quả từng KR, giá trị 0 hợp lệ.'; END IF;
   new_items:=new_items||jsonb_build_array(i||jsonb_build_object('actual',a));
  END LOOP;
 ELSE
  IF coalesce(_actuals,'[]'::jsonb)<>'[]'::jsonb THEN RAISE EXCEPTION 'Không nhập lại thực tế kỳ Năm hoặc số liệu kế hoạch.'; END IF;
  new_items:=v.items;
 END IF;
 -- Phân bổ tuần giao tháng/năm: bắt buộc khi nộp, tổng các đoạn = tổng tuần từng KR.
 IF d.kind='report' AND d.period_kind='week' AND d.period_start IS NOT NULL AND to_char(d.period_start,'YYYY-MM')<>to_char(d.period_end,'YYYY-MM') THEN
  cs:=d.period_start; ce:=d.period_end;
  WHILE cs<=ce LOOP
   mend:=(date_trunc('month',cs)+interval '1 month - 1 day')::date;
   segs:=segs||jsonb_build_object('from',cs,'to',least(mend,ce));
   cs:=least(mend,ce)+1;
  END LOOP;
  IF _submit THEN
   IF jsonb_typeof(_allocations) IS DISTINCT FROM 'array' OR (SELECT count(*) FROM jsonb_array_elements(_allocations))<>jsonb_array_length(v.items)*jsonb_array_length(segs) THEN RAISE EXCEPTION 'Tuần giao tháng cần phân bổ thực tế cho từng KR theo từng đoạn tháng.'; END IF;
   IF (SELECT count(DISTINCT (x->>'metric_id',x->>'from',x->>'to')) FROM jsonb_array_elements(_allocations) x)<>jsonb_array_length(_allocations) THEN RAISE EXCEPTION 'Phân bổ không được trùng đoạn KR.'; END IF;
   FOR i IN SELECT * FROM jsonb_array_elements(new_items) LOOP
    FOR seg IN SELECT * FROM jsonb_array_elements(segs) LOOP
     SELECT x INTO al FROM jsonb_array_elements(_allocations) x WHERE x->>'metric_id'=i->>'metric_id' AND x->>'from'=seg->>'from' AND x->>'to'=seg->>'to';
     IF al IS NULL OR al->>'actual' IS NULL OR (al->>'actual')!~'^[0-9]{1,20}$' THEN RAISE EXCEPTION 'Thiếu phân bổ hợp lệ cho KR trong đoạn % đến %.', seg->>'from', seg->>'to'; END IF;
    END LOOP;
    SELECT coalesce(sum((x->>'actual')::numeric),0) INTO tot FROM jsonb_array_elements(_allocations) x WHERE x->>'metric_id'=i->>'metric_id';
    wk:=i->>'actual';
    IF tot<>(wk)::numeric THEN RAISE EXCEPTION 'Tổng phân bổ phải bằng tổng tuần của từng KR.'; END IF;
   END LOOP;
  ELSIF _allocations IS NOT NULL AND jsonb_typeof(_allocations) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Phân bổ không hợp lệ.'; END IF;
 ELSE
  IF _allocations IS NOT NULL AND coalesce(_allocations,'null'::jsonb) NOT IN ('null'::jsonb,'[]'::jsonb) THEN RAISE EXCEPTION 'Chỉ kỳ Tuần giao tháng mới cần phân bổ.'; END IF;
  _allocations:=NULL;
 END IF;
 IF _submit AND d.first_submitted_at IS NULL THEN
  DECLARE phase_ text; late_id uuid;
  BEGIN
   IF d.kind='report' AND NOT public.biz_report_deadline_ready(d.kind,d.period_kind,d.year,d.period) THEN RAISE EXCEPTION 'Cần hoàn tất ba mốc deadline Báo cáo trước khi nộp.'; END IF; phase_:=public.biz_any_phase(d.kind,d.period_kind,d.year,d.period,now());
   IF phase_='not_open' THEN RAISE EXCEPTION 'Kỳ nộp chưa mở.'; END IF;
   IF phase_='closed' THEN RAISE EXCEPTION 'Kỳ nộp đã đóng hoàn toàn.'; END IF;
   IF phase_='overdue' THEN
    SELECT id INTO late_id FROM public.biz_late_requests WHERE user_id=d.user_id AND kind=d.kind AND period_kind=d.period_kind AND year=d.year AND period=d.period AND status='approved' ORDER BY created_at DESC LIMIT 1 FOR UPDATE;
    IF late_id IS NULL THEN RAISE EXCEPTION 'Đã quá hạn nộp trực tiếp. Cần được duyệt nộp bù.'; END IF;
    UPDATE public.biz_late_requests SET status='used',used_at=now() WHERE id=late_id;
   END IF;
   UPDATE public.biz_documents SET deadline=public.biz_any_deadline_at(d.kind||'_'||d.period_kind,d.year,d.period),deadline_frozen=true,first_submitted_at=now(),late_submitted=phase_='overdue' WHERE id=d.id;
  END;
 END IF;
 IF _submit THEN UPDATE public.biz_documents SET last_submitted_at=now() WHERE id=d.id; END IF;
 first_official:=_submit AND d.kind='report' AND d.official_version_id IS NULL;
 UPDATE public.biz_document_versions SET url=nullif(btrim(_url),''),notes=nullif(btrim(_notes),''),attachments=coalesce(_attachments,v.attachments),items=new_items,allocations=CASE WHEN _allocations IS NOT NULL THEN _allocations WHEN d.period_kind='week' THEN v.allocations ELSE NULL END,status=CASE WHEN _submit AND d.kind='plan' AND v.status='changes' THEN 'resubmitted' WHEN _submit AND first_official THEN 'approved' WHEN _submit THEN 'pending' ELSE status END,submitted_at=CASE WHEN _submit THEN now() ELSE submitted_at END,approved_at=CASE WHEN first_official THEN now() END,approved_by=CASE WHEN first_official THEN auth.uid() END,revision=revision+1 WHERE id=v.id;
 IF first_official THEN UPDATE public.biz_documents SET official_version_id=v.id WHERE id=d.id; END IF;
 INSERT INTO public.biz_document_events(document_id,version_id,actor_id,action,payload) VALUES(d.id,v.id,auth.uid(),CASE WHEN _submit THEN 'submitted' ELSE 'saved' END,jsonb_build_object('old',to_jsonb(v),'new',jsonb_build_object('url',_url,'notes',_notes,'items',new_items,'attachments',coalesce(_attachments,v.attachments),'allocations',_allocations),'target_version_id',v.target_version_id,'resubmitted',_submit AND v.status='changes','official',first_official));
END $function$
;

CREATE OR REPLACE FUNCTION public.biz_dashboard_read(_year integer, _period_kind text DEFAULT 'year'::text, _period integer DEFAULT 1, _department_id uuid DEFAULT NULL::uuid, _user_id uuid DEFAULT NULL::uuid, _mode text DEFAULT 'official'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE a uuid:=auth.uid(); all_ok boolean; dept_ok boolean; self_ok boolean; lo int; hi int; result jsonb;
BEGIN
 _mode:='official';
 PERFORM public.biz_period_start(_year,_period_kind,_period);
 IF _mode NOT IN ('official','provisional') THEN RAISE EXCEPTION 'Chế độ không hợp lệ'; END IF;
 all_ok:=public.is_super_admin(a) OR public.biz_all_scope(a);dept_ok:=public.biz_can(a,'biz.view_dept');self_ok:=public.biz_can(a,'biz.view_own');
 IF a IS NULL OR NOT(all_ok OR dept_ok OR self_ok) THEN RAISE EXCEPTION 'Không có quyền xem Dashboard';END IF;
 IF _user_id IS NOT NULL AND _user_id<>a AND NOT(all_ok OR dept_ok) THEN RAISE EXCEPTION 'Không có quyền xem nhân viên';END IF;
 IF _department_id IS NOT NULL AND NOT all_ok AND NOT EXISTS(SELECT 1 FROM public.biz_department_members m WHERE m.department_id=_department_id AND ((m.user_id=a AND m.ended_at IS NULL AND self_ok) OR (dept_ok AND public.biz_scope_ok(a,m.user_id,m.department_id,m.started_at)))) THEN RAISE EXCEPTION 'Không có quyền xem phòng';END IF;
 lo:=CASE _period_kind WHEN 'month' THEN _period WHEN 'quarter' THEN (_period-1)*3+1 ELSE 1 END;hi:=lo+CASE _period_kind WHEN 'month' THEN 0 WHEN 'quarter' THEN 2 ELSE 11 END;
 WITH roster AS (
 SELECT p.id user_id,p.full_name employee_name,m.month,coalesce(d.department_id,public.biz_period_department(p.id,_year,'month',m.month)) department_id,d.id document_id,d.official_version_id,coalesce(d.first_submitted_at,least(now(),(make_date(_year,m.month,1)+interval '1 month') AT TIME ZONE 'Asia/Ho_Chi_Minh'-interval '1 microsecond')) scope_at
 FROM public.profiles p CROSS JOIN generate_series(1,12) m(month) LEFT JOIN public.biz_documents d ON d.user_id=p.id AND d.kind='report' AND d.period_kind='month' AND d.year=_year AND d.period=m.month
 WHERE public.biz_period_department(p.id,_year,'month',m.month) IS NOT NULL AND (_user_id IS NULL OR _user_id=p.id)
 ), visible AS (
 SELECT r.* FROM roster r WHERE (all_ok OR (self_ok AND r.user_id=a) OR (dept_ok AND public.biz_scope_ok(a,r.user_id,r.department_id,r.scope_at))) AND (_department_id IS NULL OR r.department_id=_department_id)
 ), chosen AS (
 SELECT r.*,coalesce(CASE WHEN _mode='provisional' THEN (SELECT id FROM public.biz_document_versions WHERE document_id=r.document_id AND status='pending' ORDER BY version DESC LIMIT 1) END,r.official_version_id) version_id FROM visible r
 ), baselines AS (
 SELECT r.*,v.items,v.target_version_id,coalesce(v.target_version_id,(SELECT target_version_id FROM public.biz_document_versions WHERE document_id=r.document_id ORDER BY version DESC LIMIT 1),(SELECT official_version_id FROM public.biz_annual_goals WHERE user_id=r.user_id AND year=_year)) baseline_id FROM chosen r LEFT JOIN public.biz_document_versions v ON v.id=r.version_id
 ), facts AS (
 SELECT r.user_id,r.employee_name,r.department_id,dep.name department_name,r.month,r.version_id,r.target_version_id,r.baseline_id,i.metric_id,i.definition,i.months[r.month]::text target,CASE WHEN i.definition->>'aggregation'='sum' THEN private.biz_report_actual_range(r.user_id,i.metric_id,make_date(_year,r.month,1),(make_date(_year,r.month,1)+interval '1 month - 1 day')::date,_mode) ELSE (SELECT x->>'actual' FROM jsonb_array_elements(coalesce(r.items,'[]')) x WHERE x->>'metric_id'=i.metric_id::text) END actual
 FROM baselines r JOIN public.biz_departments dep ON dep.id=r.department_id JOIN public.biz_goal_items i ON i.version_id=r.baseline_id
 ), obligations AS (
 SELECT p.id user_id,p.full_name employee_name,'plan'::text kind,coalesce(d.department_id,public.biz_period_department(p.id,_year,_period_kind,_period)) department_id,d.first_submitted_at,public.biz_deadline_status(CASE WHEN d.deadline_frozen THEN d.deadline ELSE public.biz_deadline_at('plan_'||_period_kind,_year,_period) END,d.first_submitted_at,now()) time_status,coalesce((SELECT status FROM public.biz_document_versions WHERE document_id=d.id ORDER BY version DESC LIMIT 1),'missing') approval_status,d.official_version_id IS NOT NULL official FROM public.profiles p LEFT JOIN public.biz_documents d ON d.user_id=p.id AND d.kind='plan' AND d.period_kind=_period_kind AND d.year=_year AND d.period=_period WHERE _period_kind IN ('month','quarter','year') AND public.biz_period_department(p.id,_year,_period_kind,_period) IS NOT NULL AND (_user_id IS NULL OR p.id=_user_id)
 UNION ALL SELECT user_id,employee_name,'report',department_id,first_submitted_at,time_status,approval_status,official FROM jsonb_to_recordset(private.biz_report_obligations(_year,_period_kind,_period)) o(user_id uuid,employee_name text,department_id uuid,first_submitted_at timestamptz,time_status text,approval_status text,official boolean) WHERE _user_id IS NULL OR user_id=_user_id
 ), scoped_obligations AS (
 SELECT o.*,dep.name department_name FROM obligations o JOIN public.biz_departments dep ON dep.id=o.department_id WHERE (_department_id IS NULL OR o.department_id=_department_id) AND (all_ok OR (self_ok AND o.user_id=a) OR (dept_ok AND public.biz_scope_ok(a,o.user_id,o.department_id,coalesce(o.first_submitted_at,now()))))
 )
 SELECT jsonb_build_object('year',_year,'period_kind',_period_kind,'period',_period,'mode',_mode,'lo',lo,'hi',hi,'server_now',now(),'facts',coalesce((SELECT jsonb_agg(to_jsonb(f)) FROM facts f),'[]'),'roster',coalesce((SELECT jsonb_agg(jsonb_build_object('user_id',r.user_id,'employee_name',r.employee_name,'department_id',r.department_id,'department_name',dep.name,'month',r.month,'official',r.official_version_id IS NOT NULL,'system_id',(SELECT system_id FROM public.biz_department_system_history WHERE department_id=r.department_id AND started_at<=r.scope_at AND (ended_at IS NULL OR ended_at>r.scope_at) LIMIT 1),'team_id',(SELECT team_id FROM public.biz_team_members tm JOIN public.biz_teams t ON t.id=tm.team_id WHERE tm.user_id=r.user_id AND t.department_id=r.department_id AND tm.started_at<=r.scope_at AND (tm.ended_at IS NULL OR tm.ended_at>r.scope_at) LIMIT 1))) FROM visible r JOIN public.biz_departments dep ON dep.id=r.department_id),'[]'),'obligations',coalesce((SELECT jsonb_agg(to_jsonb(o)) FROM scoped_obligations o),'[]')) INTO result;
 RETURN result;
END $function$
;

CREATE OR REPLACE FUNCTION private.permission_editor_policy()
 RETURNS TABLE(key text, scope text, personal boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT v.key,v.scope,v.personal FROM (VALUES ('leave.create','own',true),('leave.view_own','own',true),('leave.edit_own','own',true),('leave.recall','own',true),('att.create','own',true),('att.view_own','own',true),('att.edit_own','own',true),('att.witness','own',true),('order.view','own',true),('order.view_mine','own',true),('order.take','own',true),('order.update_draft','own',true),('order.submit','own',true),('order.history','own',true),('web.view','assigned',false),('web.content_view','assigned',false),('web.content_view_mine','assigned',false),('web.outline_start','assigned',false),('web.outline_submit','assigned',false),('web.post_write_start','assigned',false),('web.post_submit','assigned',false),('web.keyword_view','assigned',false),('web.keyword_open_sheet','assigned',false),('local.view','assigned',false),('local.view_mine','assigned',false),('local.post_create','assigned',false),('local.post_edit','assigned',false),('social.view','assigned',false),('social.post_view','assigned',false),('social.post_view_mine','assigned',false),('social.post_create','assigned',false),('social.post_edit','assigned',false),('social.post_start','assigned',false),('social.post_submit','assigned',false),('video.view','assigned',false),('video.view_mine','assigned',false),('video.create','assigned',false),('video.script_start','assigned',false),('video.script_submit','assigned',false),('video.submit','assigned',false),('leave.view_unit','unit',false),('ot.view_unit','unit',false)) v(key,scope,personal) JOIN base_permission_catalog b ON b.key=v.key WHERE private.org_role_permission_ready(v.key) OR private.mkt_specialty_permission_ready(v.key) $function$
;

CREATE OR REPLACE FUNCTION private.org_role_permission_ready(p text)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE
AS $function$
SELECT p = ANY (ARRAY[
  'leave.create','leave.view_own','leave.edit_own','leave.recall',
  'leave.view_assigned','leave.view_all','leave.view_unit','leave.approve','leave.create_for','leave.edit_others','leave.cancel_handle','leave.exception','leave.reassign','leave.report','leave.export','leave.settings',
  'att.create','att.view_own','att.edit_own','att.witness',
  'att.manage','att.reconcile','att.report','att.view_all','att.settings',
  'order.view','order.view_mine','order.create','order.take','order.update_draft','order.submit','order.resubmit','order.deliver','order.history','order.open_delivery',
  'order.approve','order.assign','order.edit','order.complete','order.cancel','order.edit_reviewer','order.report_view','order.request_changes','order.send_request','order.view_all',
  'order.marketing_design.view','order.marketing_design.view_all','order.marketing_design.create','order.marketing_design.send_request','order.marketing_design.submit','order.marketing_design.take','order.marketing_design.update_draft','order.marketing_design.resubmit','order.marketing_design.deliver','order.marketing_design.approve','order.marketing_design.assign','order.marketing_design.edit','order.marketing_design.complete','order.marketing_design.cancel','order.marketing_design.edit_reviewer','order.marketing_design.report_view','order.marketing_design.request_changes',
  'oq.create','oq.accept','oq.reply_price','oq.reply_progress','oq.report_own',
  'oq.view_own','oq.view_all','oq.manage','oq.report_all','oq.report_export',
  'ot.view_own','ot.view_unit','ot.task_view','ot.task_update','ot.stage_update',
  'ot.accept','ot.assign','ot.create','ot.manage','ot.report','ot.report_export','ot.reschedule_propose','ot.reschedule_reply','ot.supplier','ot.view_all',
  'finance.incoming.view','finance.incoming.view_unit','finance.incoming.view_totals','finance.incoming.claim','finance.incoming.reconcile','finance.incoming.manual_view','finance.incoming.manual_create','finance.incoming.manual_manage','finance.incoming.manage','finance.incoming.remind',
  'signal.sale','signal.report','signal.reassign','signal.view_all','signal.assign',
  'signal.create','signal.edit','signal.manage','signal.delete','signal.catalog',
  'biz.crm_use','biz.crm_access','biz.crm_view_scope','biz.crm_edit_other',
  'biz.crm_transfer','biz.crm_archive','biz.crm_export','biz.crm_settings',
  'kpi.view_own','overview.view','overview.own_only','settings.view'
])
$function$
;
