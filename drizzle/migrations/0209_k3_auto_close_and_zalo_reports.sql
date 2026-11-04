CREATE TABLE public.k3_automation_config (id boolean PRIMARY KEY DEFAULT true CHECK(id), auto_close boolean NOT NULL DEFAULT true, close_time time NOT NULL DEFAULT '18:00', enabled_from date NOT NULL DEFAULT ((now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date), zalo_enabled boolean NOT NULL DEFAULT false, group_id text, group_name text, send_time time NOT NULL DEFAULT '18:05', scope_kind text NOT NULL DEFAULT 'all' CHECK(scope_kind IN ('all','system','department')), scope_id uuid, updated_at timestamptz NOT NULL DEFAULT now(), updated_by uuid);
GRANT SELECT ON public.k3_automation_config TO authenticated; GRANT ALL ON public.k3_automation_config TO service_role;
ALTER TABLE public.k3_automation_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY k3_automation_admin ON public.k3_automation_config FOR SELECT TO authenticated USING(public.k3_can(auth.uid(),'k3.settings'));
CREATE TABLE public.k3_daily_closes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid NOT NULL,work_date date NOT NULL,department_id uuid,system_id uuid,source text NOT NULL CHECK(source IN ('auto','manual')),snapshot jsonb NOT NULL,closed_at timestamptz NOT NULL DEFAULT now(),actor_id uuid, UNIQUE(user_id,work_date));
GRANT SELECT ON public.k3_daily_closes TO authenticated; GRANT ALL ON public.k3_daily_closes TO service_role;
ALTER TABLE public.k3_daily_closes ENABLE ROW LEVEL SECURITY;
CREATE POLICY k3_close_scope ON public.k3_daily_closes FOR SELECT TO authenticated USING(user_id=auth.uid() OR public.biz_admin(auth.uid()) OR (public.k3_can(auth.uid(),'k3.view_scope') AND public.biz_scope_ok(auth.uid(),user_id,department_id,(work_date::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh'))));
CREATE TABLE public.k3_zalo_reports (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),work_date date NOT NULL,group_id text NOT NULL,scope_kind text NOT NULL,scope_id uuid,snapshot jsonb NOT NULL,status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sending','sent','failed','unknown','skipped')),lease uuid,attempted_at timestamptz,sent_at timestamptz,error text,created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(work_date,group_id));
GRANT SELECT ON public.k3_zalo_reports TO authenticated; GRANT ALL ON public.k3_zalo_reports TO service_role;
ALTER TABLE public.k3_zalo_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY k3_zalo_admin ON public.k3_zalo_reports FOR SELECT TO authenticated USING(public.k3_can(auth.uid(),'k3.settings'));
ALTER TABLE public.k3_kpi_day_confirmations ADD COLUMN source text NOT NULL DEFAULT 'manual';
CREATE FUNCTION public.k3_automation_read() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE c k3_automation_config;
BEGIN
 IF NOT public.k3_can(auth.uid(),'k3.settings') THEN RAISE EXCEPTION 'Chỉ Admin được cấu hình tự động 3K.'; END IF;
 SELECT * INTO c FROM k3_automation_config WHERE id;
 RETURN coalesce(to_jsonb(c),'{}')||jsonb_build_object('auto_close',coalesce(c.auto_close,true),'close_time',coalesce(c.close_time,'18:00'::time),'send_time',coalesce(c.send_time,'18:05'::time),'zalo_enabled',coalesce(c.zalo_enabled,false),'scope_kind',coalesce(c.scope_kind,'all'));
END$fn$;
CREATE FUNCTION public.k3_automation_save(_payload jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE ct time:=(_payload->>'close_time')::time; st time:=(_payload->>'send_time')::time; sk text:=_payload->>'scope_kind'; sid uuid:=nullif(_payload->>'scope_id','')::uuid; old jsonb;
BEGIN
 IF NOT public.k3_can(auth.uid(),'k3.settings') THEN RAISE EXCEPTION 'Chỉ Admin được cấu hình tự động 3K.'; END IF;
 IF ct IS NULL OR st IS NULL OR st<=ct OR extract(second FROM ct)<>0 OR extract(second FROM st)<>0 THEN RAISE EXCEPTION 'Giờ gửi phải sau giờ chốt; chọn giờ và phút.'; END IF;
 IF sk NOT IN ('all','system','department') OR sk IS NULL THEN RAISE EXCEPTION 'Phạm vi không hợp lệ.'; END IF;
 IF sk='system' AND NOT EXISTS(SELECT 1 FROM biz_systems WHERE id=sid) OR sk='department' AND NOT EXISTS(SELECT 1 FROM biz_departments WHERE id=sid) THEN RAISE EXCEPTION 'Cần chọn Hệ/Phòng hợp lệ.'; END IF;
 IF coalesce((_payload->>'zalo_enabled')::boolean,false) AND btrim(coalesce(_payload->>'group_id',''))='' THEN RAISE EXCEPTION 'Cần chọn nhóm Zalo.'; END IF;
 SELECT to_jsonb(c) INTO old FROM k3_automation_config c WHERE id FOR UPDATE;
 INSERT INTO k3_automation_config(id,auto_close,close_time,zalo_enabled,group_id,group_name,send_time,scope_kind,scope_id,updated_by) VALUES(true,coalesce((_payload->>'auto_close')::boolean,true),ct,coalesce((_payload->>'zalo_enabled')::boolean,false),nullif(btrim(_payload->>'group_id'),''),nullif(btrim(_payload->>'group_name'),''),st,sk,CASE WHEN sk<>'all' THEN sid END,auth.uid()) ON CONFLICT(id) DO UPDATE SET auto_close=excluded.auto_close,close_time=excluded.close_time,zalo_enabled=excluded.zalo_enabled,group_id=excluded.group_id,group_name=excluded.group_name,send_time=excluded.send_time,scope_kind=excluded.scope_kind,scope_id=excluded.scope_id,updated_at=now(),updated_by=auth.uid();
 INSERT INTO k3_settings_log(changed_by,snapshot) VALUES(auth.uid(),jsonb_build_object('old',old,'new',public.k3_automation_read(),'kind','automation'));
 PERFORM cron.schedule('k3-auto-close',extract(minute FROM ct)::int::text||' '||mod(extract(hour FROM ct)::int+17,24)::text||' * * *','SELECT public.k3_auto_close_run();');
 RETURN public.k3_automation_read();
END$fn$;
CREATE FUNCTION private.k3_close_one(_user uuid,_date date,_source text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE rows jsonb; acts jsonb; dep uuid; sys uuid; made uuid;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('k3owner'),hashtext(_user::text));
 IF EXISTS(SELECT 1 FROM k3_daily_closes WHERE user_id=_user AND work_date=_date) THEN RETURN; END IF;
 dep:=public.biz_department_at(_user,_date); SELECT system_id INTO sys FROM biz_departments WHERE id=dep;
 SELECT coalesce(jsonb_agg(to_jsonb(r) ORDER BY r.id),'[]') INTO rows FROM k3_kpi_results r WHERE user_id=_user AND work_date=_date AND deleted_at IS NULL AND review_reason IS NULL AND NOT EXISTS(SELECT 1 FROM k3_data_reviews v WHERE v.status='pending' AND v.record_id IN (r.kpi_id,r.action_id,r.goal_id));
 SELECT coalesce(jsonb_agg(jsonb_build_object('id',a.id,'goal_id',g.id,'name',a.name,'metric',private.k3_entity_metric('action',a.id),'overdue',coalesce(a.due_date,g.period_end)<_date,'updated',EXISTS(SELECT 1 FROM jsonb_array_elements(rows) r WHERE r->>'action_id'=a.id::text))),'[]') INTO acts FROM k3_actions a JOIN k3_goals g ON g.id=a.goal_id WHERE private.k3_action_worker_ok(_user,a.id) AND a.deleted_at IS NULL AND g.deleted_at IS NULL AND a.status NOT IN ('draft','paused','cancelled','ended_missed') AND g.status NOT IN ('draft','paused','cancelled','ended_missed') AND _date BETWEEN coalesce(a.start_date,g.period_start) AND g.period_end AND NOT EXISTS(SELECT 1 FROM k3_data_reviews v WHERE v.status='pending' AND v.record_id IN(a.id,g.id));
 INSERT INTO k3_daily_closes(user_id,work_date,department_id,system_id,source,snapshot,actor_id) VALUES(_user,_date,dep,sys,_source,jsonb_build_object('results',rows,'actions',acts,'updated',jsonb_array_length(rows)>0,'name',(SELECT full_name FROM profiles WHERE id=_user),'department',(SELECT name FROM biz_departments WHERE id=dep)),CASE WHEN _source='manual' THEN auth.uid() END) ON CONFLICT(user_id,work_date) DO NOTHING RETURNING id INTO made;
 IF made IS NOT NULL AND _source='auto' AND jsonb_array_length(rows)>0 AND NOT EXISTS(SELECT 1 FROM k3_kpi_day_confirmations WHERE user_id=_user AND work_date=_date) THEN
 INSERT INTO k3_kpi_day_confirmations(user_id,work_date,snapshot,actor_id,source) VALUES(_user,_date,rows,'00000000-0000-0000-0000-000000000000','auto');
 END IF;
END$fn$;
COMMENT ON COLUMN public.k3_kpi_day_confirmations.source IS 'auto uses the zero UUID as system actor, not an employee confirmation; manual uses the authenticated actor.';
CREATE FUNCTION public.k3_auto_close_run() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE d date:=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date; c k3_automation_config; u record; n int:=0;
BEGIN
 SELECT * INTO c FROM k3_automation_config WHERE id;
 IF coalesce(c.auto_close,true)=false OR (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::time<coalesce(c.close_time,'18:00'::time) OR d<coalesce(c.enabled_from,current_date) OR NOT EXISTS(SELECT 1 FROM k3_settings WHERE id AND enabled AND effective_from<=d) THEN RETURN jsonb_build_object('closed',0); END IF;
 FOR u IN SELECT p.id FROM profiles p WHERE p.status='Đang hoạt động' AND EXISTS(SELECT 1 FROM biz_appointments a WHERE a.user_id=p.id AND a.status<>'cancelled' AND a.started_at<((d+1)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh') AND (a.ended_at IS NULL OR a.ended_at>(d::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh'))) LOOP
 PERFORM private.k3_close_one(u.id,d,'auto'); n:=n+1; END LOOP;
 RETURN jsonb_build_object('checked',n);
END$fn$;
CREATE FUNCTION public.k3_zalo_report_queue() RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE c k3_automation_config; d date:=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date; n int;
BEGIN
 SELECT * INTO c FROM k3_automation_config WHERE id;
 IF NOT coalesce(c.zalo_enabled,false) OR c.group_id IS NULL OR (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::time<c.send_time OR d<c.enabled_from THEN RETURN 0; END IF;
 INSERT INTO k3_zalo_reports(work_date,group_id,scope_kind,scope_id,snapshot) SELECT d,c.group_id,c.scope_kind,c.scope_id,coalesce(jsonb_agg(jsonb_build_object('user_id',user_id,'department_id',department_id,'data',snapshot) ORDER BY snapshot->>'name'),'[]') FROM k3_daily_closes WHERE work_date=d AND (c.scope_kind='all' OR c.scope_kind='system' AND system_id=c.scope_id OR c.scope_kind='department' AND department_id=c.scope_id) HAVING count(*)>0 ON CONFLICT(work_date,group_id) DO NOTHING;
 GET DIAGNOSTICS n=ROW_COUNT; RETURN n;
END$fn$;
CREATE FUNCTION public.k3_zalo_report_claim() RETURNS SETOF public.k3_zalo_reports LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
BEGIN
 UPDATE k3_zalo_reports SET status='unknown',error='Tiến trình gửi gián đoạn; cần đối soát, không gửi lại.' WHERE status='sending' AND attempted_at<now()-interval '20 minutes';
 RETURN QUERY WITH chosen AS (SELECT r.id FROM k3_zalo_reports r JOIN k3_automation_config c ON c.id WHERE r.status='pending' AND c.zalo_enabled AND r.group_id=c.group_id AND r.scope_kind=c.scope_kind AND r.scope_id IS NOT DISTINCT FROM c.scope_id ORDER BY r.created_at LIMIT 5 FOR UPDATE OF r SKIP LOCKED) UPDATE k3_zalo_reports r SET status='sending',lease=gen_random_uuid(),attempted_at=now() WHERE r.id IN(SELECT id FROM chosen) RETURNING r.*;
END$fn$;
CREATE FUNCTION public.k3_zalo_report_finish(_id uuid,_lease uuid,_status text,_error text DEFAULT NULL) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE n int;
BEGIN
 IF _status NOT IN ('sent','failed','unknown','skipped') THEN RAISE EXCEPTION 'Trạng thái không hợp lệ.'; END IF;
 UPDATE k3_zalo_reports SET status=_status,error=left(_error,300),sent_at=CASE WHEN _status='sent' THEN now() END WHERE id=_id AND lease=_lease AND status='sending'; GET DIAGNOSTICS n=ROW_COUNT; RETURN n=1;
END$fn$;
DO $patch$ DECLARE def text; BEGIN
 def:=pg_get_functiondef('public.k3_kpi_result_save(jsonb)'::regprocedure);
 def:=replace(def,'PERFORM private.k3_write_guard(day);','PERFORM private.k3_write_guard(day); IF EXISTS(SELECT 1 FROM k3_daily_closes WHERE user_id=uid AND work_date=day) AND btrim(coalesce(p->>''correction_reason'',''''))='''' THEN RAISE EXCEPTION ''Ngày đã chốt; cần lý do điều chỉnh để giữ lịch sử.''; END IF;');
 def:=replace(def,'''result_id'',r.id,''before''','''correction_reason'',nullif(btrim(p->>''correction_reason''),''''),''result_id'',r.id,''before'''); EXECUTE def;
 def:=pg_get_functiondef('public.k3_kpi_result_read(uuid,date)'::regprocedure); def:=replace(def,'''kpi'',to_jsonb(k)', '''day_closed'',EXISTS(SELECT 1 FROM k3_daily_closes WHERE user_id=auth.uid() AND work_date=_date),''kpi'',to_jsonb(k)'); EXECUTE def;
 def:=pg_get_functiondef('public.k3_kpi_day_confirm(date)'::regprocedure); def:=replace(def,'RETURN to_jsonb(c);','PERFORM private.k3_close_one(uid,_date,''manual''); RETURN to_jsonb(c);'); EXECUTE def;
 def:=pg_get_functiondef('public.k3_kpi_day_read(date)'::regprocedure); def:=replace(def,'''date'',_date','''closed_at'',(SELECT closed_at FROM k3_daily_closes WHERE user_id=uid AND work_date=_date),''close_source'',(SELECT source FROM k3_daily_closes WHERE user_id=uid AND work_date=_date),''auto_close_time'',CASE WHEN coalesce((SELECT auto_close FROM k3_automation_config WHERE id),true) THEN coalesce((SELECT close_time FROM k3_automation_config WHERE id),''18:00''::time) END,''date'',_date'); EXECUTE def;
END$patch$;
REVOKE ALL ON FUNCTION private.k3_close_one(uuid,date,text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.k3_automation_read(),public.k3_automation_save(jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.k3_automation_read(),public.k3_automation_save(jsonb) TO authenticated;
REVOKE ALL ON FUNCTION public.k3_auto_close_run(),public.k3_zalo_report_queue(),public.k3_zalo_report_claim(),public.k3_zalo_report_finish(uuid,uuid,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.k3_auto_close_run(),public.k3_zalo_report_queue(),public.k3_zalo_report_claim(),public.k3_zalo_report_finish(uuid,uuid,text,text) TO service_role;
SELECT cron.schedule('k3-auto-close','0 11 * * *','SELECT public.k3_auto_close_run();');