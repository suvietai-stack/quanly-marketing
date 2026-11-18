-- Reverse only migration 0467, as verified on 2026-11-18 before rollout.
-- No KG, KF, KPI, audit or staff data is deleted. Run with DB owner authority.
BEGIN;
CREATE OR REPLACE FUNCTION private.k3_plan_changed()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE goals uuid[]:='{}'; actions uuid[]:='{}'; users uuid[]:='{}'; r jsonb; u record;
BEGIN
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
END $function$;
CREATE OR REPLACE FUNCTION public.k3_quick_create(_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE p jsonb:=_payload;key uuid:=nullif(p->>'request_key','')::uuid;g jsonb;gid uuid;kf jsonb;kpi jsonb;kid uuid;created_kf int:=0;start_now boolean:=coalesce((p->>'save_valid')::boolean,(p->>'start_now')::boolean,false);members uuid[]:=coalesce((SELECT array_agg(value::uuid) FROM jsonb_array_elements_text(coalesce(p->'member_ids','[]'))),'{}');
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
 IF key IS NULL THEN RAISE EXCEPTION 'Thiếu mã yêu cầu tạo công việc.'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('k3owner'),hashtext(auth.uid()::text));
 SELECT id INTO gid FROM k3_goals WHERE user_id=auth.uid() AND request_key=key;
 IF gid IS NOT NULL THEN RETURN jsonb_build_object('goal_id',gid,'duplicated',true); END IF;
 IF p->>'creation_mode'='basic' THEN
 kpi:=coalesce(p->'kpi','{}');kpi:=kpi||jsonb_build_object('name',coalesce(nullif(btrim(kpi->>'name'),''),p->>'name'),'measure',coalesce(kpi->>'measure','binary'));
 IF kpi->>'measure'='binary' AND nullif(btrim(kpi->'config'->>'valid_condition'),'') IS NULL THEN kpi:=kpi||jsonb_build_object('config',coalesce(kpi->'config','{}')||jsonb_build_object('valid_condition',p->>'expected_result')); END IF;
 p:=p||jsonb_build_object('kfs',jsonb_build_array(jsonb_build_object('name',p->>'name','inherit_timeline',true,'kpis',jsonb_build_array(kpi))));
 END IF;
 IF start_now AND jsonb_array_length(coalesce(p->'kfs','[]'))=0 THEN RAISE EXCEPTION 'Công việc bắt đầu cần ít nhất một KF.'; END IF;
 g:=public.k3_goal_save(p||jsonb_build_object('period_type','custom','status','draft'));gid:=(g->>'id')::uuid; UPDATE public.k3_goals SET creation_mode=CASE WHEN p->>'creation_mode' IN ('basic','advanced') THEN p->>'creation_mode' ELSE NULL END WHERE id=gid;
 FOR kf IN SELECT * FROM jsonb_array_elements(coalesce(p->'kfs','[]')) LOOP
 kid:=(public.k3_action_save(kf||jsonb_build_object('request_key',coalesce(nullif(kf->>'request_key','')::uuid,gen_random_uuid()),'goal_id',gid,'name',coalesce(nullif(btrim(kf->>'name'),''),p->>'name'),'inherit_timeline',coalesce((kf->>'inherit_timeline')::boolean,true),'assignee_id',coalesce(nullif(kf->>'assignee_id',''),auth.uid()::text)))->>'id')::uuid;
 FOR kpi IN SELECT * FROM jsonb_array_elements(coalesce(kf->'kpis','[]')) LOOP
 kpi:=kpi||jsonb_build_object('name',coalesce(nullif(btrim(kpi->>'name'),''),kf->>'name',p->>'name'),'action_id',kid,'request_key',coalesce(nullif(kpi->>'request_key','')::uuid,gen_random_uuid()));
 IF kpi->>'measure'='binary' AND nullif(btrim(kpi->'config'->>'valid_condition'),'') IS NULL THEN kpi:=kpi||jsonb_build_object('config',coalesce(kpi->'config','{}')||jsonb_build_object('valid_condition',p->>'expected_result')); END IF;
 PERFORM public.k3_kpi_configure(kpi);
 END LOOP;
 IF start_now AND NOT EXISTS(SELECT 1 FROM k3_kpis WHERE action_id=kid) THEN RAISE EXCEPTION 'KF cần ít nhất một KPI hợp lệ.'; END IF;
 created_kf:=created_kf+1;
 END LOOP;
 IF start_now THEN PERFORM public.k3_goal_activate(gid,(SELECT revision FROM k3_goals WHERE id=gid)); END IF; IF cardinality(members)>0 THEN PERFORM public.k3_member_invite(gid,members); END IF;
 INSERT INTO k3_plan_events(user_id,goal_id,actor_id,action,detail) VALUES(auth.uid(),gid,auth.uid(),'quick_create',jsonb_build_object('kf_count',created_kf,'start_now',start_now,'creation_mode',p->>'creation_mode'));
 RETURN jsonb_build_object('goal_id',gid,'kf_count',created_kf,'duplicated',false);
END $function$;
COMMIT;
