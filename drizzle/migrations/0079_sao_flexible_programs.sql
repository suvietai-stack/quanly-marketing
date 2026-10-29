CREATE TABLE public.sao_programs(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL CHECK(length(btrim(name)) BETWEEN 1 AND 150), source text NOT NULL CHECK(source IN ('signal','kpi','task')), field text NOT NULL, condition text NOT NULL, threshold numeric NOT NULL DEFAULT 100, stars integer NOT NULL CHECK(stars BETWEEN 1 AND 100000), enabled boolean NOT NULL DEFAULT false, enabled_at timestamptz, starts_at timestamptz, ends_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), updated_by uuid);
GRANT SELECT ON public.sao_programs TO authenticated; GRANT ALL ON public.sao_programs TO service_role;
ALTER TABLE public.sao_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY sao_program_read ON public.sao_programs FOR SELECT TO authenticated USING(private.sig_can(auth.uid(),'sao.program_manage'));
ALTER TABLE public.sao_ledger ADD COLUMN program_id uuid REFERENCES public.sao_programs(id);
INSERT INTO public.sao_programs(id,name,source,field,condition,stars,enabled,enabled_at,updated_by) SELECT id,CASE source WHEN 'signal' THEN 'Chốt tín hiệu' WHEN 'task' THEN 'Công việc được xác nhận' ELSE 'Hoàn thành KR liên kết Task' END,source,CASE source WHEN 'signal' THEN 'status' WHEN 'task' THEN 'approved_completion' ELSE 'verified_task_rate' END,CASE source WHEN 'signal' THEN 'transition' WHEN 'task' THEN 'event' ELSE 'gte' END,stars,enabled,enabled_at,updated_by FROM public.sao_rules;
UPDATE public.sao_ledger SET program_id=rule_id WHERE rule_id IS NOT NULL;
CREATE UNIQUE INDEX sao_ledger_program_once ON public.sao_ledger(program_id,source,source_id) WHERE program_id IS NOT NULL;
CREATE FUNCTION public.sao_program_save(_id uuid,_name text,_source text,_field text,_condition text,_threshold numeric,_stars integer,_enabled boolean,_starts timestamptz DEFAULT NULL,_ends timestamptz DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE oldrow public.sao_programs; newrow public.sao_programs; gid uuid:=coalesce(_id,gen_random_uuid());
BEGIN
 IF NOT private.sig_can(auth.uid(),'sao.program_manage') THEN RAISE EXCEPTION 'Không có quyền quản lý thưởng Sao'; END IF;
 IF _name IS NULL OR length(btrim(_name)) NOT BETWEEN 1 AND 150 OR _source IS NULL OR _field IS NULL OR _condition IS NULL OR _enabled IS NULL OR _stars IS NULL OR _stars NOT BETWEEN 1 AND 100000 OR _threshold IS NULL OR _threshold::text IN ('NaN','Infinity','-Infinity') THEN RAISE EXCEPTION 'Thông tin chương trình không hợp lệ'; END IF;
 IF NOT ((_source='signal' AND _field='status' AND _condition='transition') OR (_source='task' AND _field='approved_completion' AND _condition='event') OR (_source='kpi' AND _field='verified_task_rate' AND _condition='gte' AND _threshold BETWEEN 100 AND 1000)) THEN RAISE EXCEPTION 'Căn cứ thưởng chưa được tích hợp'; END IF;
 IF _starts IS NOT NULL AND _ends IS NOT NULL AND _ends<=_starts THEN RAISE EXCEPTION 'Ngày kết thúc phải sau ngày bắt đầu'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('sao-program:'||gid::text,0));
 SELECT * INTO oldrow FROM public.sao_programs WHERE id=gid FOR UPDATE;
 INSERT INTO public.sao_programs(id,name,source,field,condition,threshold,stars,enabled,enabled_at,starts_at,ends_at,updated_by) VALUES(gid,btrim(_name),_source,_field,_condition,CASE WHEN _source='kpi' THEN _threshold ELSE 100 END,_stars,_enabled,CASE WHEN _enabled THEN now() END,_starts,_ends,auth.uid())
 ON CONFLICT(id) DO UPDATE SET name=excluded.name,source=excluded.source,field=excluded.field,condition=excluded.condition,threshold=excluded.threshold,stars=excluded.stars,enabled=excluded.enabled,enabled_at=CASE WHEN excluded.enabled AND (NOT sao_programs.enabled OR sao_programs.source<>excluded.source OR sao_programs.threshold<>excluded.threshold OR sao_programs.starts_at IS DISTINCT FROM excluded.starts_at OR sao_programs.ends_at IS DISTINCT FROM excluded.ends_at) THEN now() ELSE sao_programs.enabled_at END,starts_at=excluded.starts_at,ends_at=excluded.ends_at,updated_at=now(),updated_by=auth.uid() RETURNING * INTO newrow;
 INSERT INTO public.sao_admin_events(actor_id,kind,entity_id,before_data,after_data) VALUES(auth.uid(),'rule',gid::text,CASE WHEN oldrow.id IS NOT NULL THEN to_jsonb(oldrow) END,to_jsonb(newrow)); RETURN gid;
END $$;
REVOKE ALL ON FUNCTION public.sao_program_save(uuid,text,text,text,text,numeric,integer,boolean,timestamptz,timestamptz) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.sao_program_save(uuid,text,text,text,text,numeric,integer,boolean,timestamptz,timestamptz) TO authenticated;
CREATE FUNCTION private.sao_award_evaluated(_user uuid,_source text,_id text,_at timestamptz,_reason text,_rate numeric) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p public.sao_programs; first_id text; lid uuid; b bigint;
BEGIN
 INSERT INTO public.sao_achievements(source,source_id,occurred_at) VALUES(_source,_id,_at) ON CONFLICT DO NOTHING RETURNING source_id INTO first_id;
 IF first_id IS NULL OR NOT private.is_active(_user) THEN RETURN; END IF;
 FOR p IN SELECT * FROM public.sao_programs WHERE source=_source AND enabled AND enabled_at IS NOT NULL AND _at>=enabled_at AND (starts_at IS NULL OR _at>=starts_at) AND (ends_at IS NULL OR _at<ends_at) AND (_source<>'kpi' OR _rate>=threshold) ORDER BY id FOR SHARE LOOP
 INSERT INTO public.sao_wallets(user_id) VALUES(_user) ON CONFLICT DO NOTHING;
 SELECT balance INTO b FROM public.sao_wallets WHERE user_id=_user FOR UPDATE;
 INSERT INTO public.sao_ledger(user_id,amount,source,source_id,program_id,reason,actor_id,balance_after) VALUES(_user,p.stars,_source,_id,p.id,p.name||' · '||_reason,auth.uid(),b+p.stars) ON CONFLICT DO NOTHING RETURNING id INTO lid;
 IF lid IS NOT NULL THEN UPDATE public.sao_wallets SET balance=balance+p.stars WHERE user_id=_user; INSERT INTO public.sao_celebrations(ledger_id,user_id) VALUES(lid,_user); END IF;
 END LOOP;
END $$;
REVOKE ALL ON FUNCTION private.sao_award_evaluated(uuid,text,text,timestamptz,text,numeric) FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION private.sao_award(_user uuid,_source text,_id text,_at timestamptz,_reason text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN PERFORM private.sao_award_evaluated(_user,_source,_id,_at,_reason,100); END $$;
CREATE OR REPLACE FUNCTION private.sao_kpi_event() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p public.employee_kpi_periods; it public.employee_kpi_items; actual numeric; ids jsonb; l public.sao_kpi_locks; deadline_date date;
BEGIN
 IF NOT private.sig_can(auth.uid(),'kpi.period_manage') OR NEW.locked_by IS DISTINCT FROM auth.uid() THEN RETURN NEW; END IF;
 SELECT * INTO l FROM public.sao_kpi_locks WHERE period_id=NEW.kpi_period_id;
 IF l.period_id IS NULL OR l.locked_by<>auth.uid() OR l.locked_at<now()-interval '5 minutes' THEN RETURN NEW; END IF;
 SELECT * INTO p FROM public.employee_kpi_periods WHERE id=NEW.kpi_period_id;
 IF p.status NOT IN ('locked','closed') THEN RETURN NEW; END IF;
 FOR it IN SELECT * FROM public.employee_kpi_items WHERE kpi_period_id=p.id AND metric_key IN ('task_completed','custom_task_result') AND target_value>0 AND website_id IS NULL AND social_id IS NULL LOOP
 ids:=coalesce(it.metadata->'taskIds','[]'::jsonb);
 BEGIN deadline_date:=least(p.period_end,coalesce((it.metadata->>'deadline')::date,p.period_end)); EXCEPTION WHEN invalid_datetime_format OR datetime_field_overflow THEN CONTINUE; END;
 SELECT count(*) INTO actual FROM public.sao_task_approvals a JOIN public.tasks t ON t.id=a.task_id WHERE a.user_id=p.user_id AND a.approved_at<=l.locked_at AND t.data->>'status'='Hoàn thành' AND (a.submitted_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date BETWEEN p.period_start AND deadline_date AND (it.brand_id IS NULL OR a.brand_id=it.brand_id) AND (it.metric_key='task_completed' OR ids ? a.task_id);
 PERFORM private.sao_award_evaluated(p.user_id,'kpi',it.id::text,l.locked_at,'KR đã khóa kỳ: '||coalesce(it.label,it.metric_key),100*actual/it.target_value);
 END LOOP; RETURN NEW;
END $$;
COMMENT ON TABLE public.sao_rules IS 'DEPRECATED: program configuration replaced by sao_programs; retained for legacy ledger references and old clients.';
CREATE OR REPLACE FUNCTION public.sao_rule_save(_source text,_stars integer,_enabled boolean) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE rid uuid; oldrow public.sao_rules;
BEGIN
 IF NOT private.sig_can(auth.uid(),'sao.program_manage') THEN RAISE EXCEPTION 'Không có quyền quản lý thưởng Sao'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('sao-rule:'||_source,0)); SELECT * INTO oldrow FROM public.sao_rules WHERE source=_source;
 INSERT INTO public.sao_rules(source,stars,enabled,enabled_at,updated_by) VALUES(_source,_stars,_enabled,CASE WHEN _enabled THEN now() END,auth.uid()) ON CONFLICT(source) DO UPDATE SET stars=excluded.stars,enabled=excluded.enabled,enabled_at=CASE WHEN excluded.enabled AND NOT sao_rules.enabled THEN now() ELSE sao_rules.enabled_at END,updated_by=auth.uid(),updated_at=now() RETURNING id INTO rid;
 PERFORM public.sao_program_save(rid,CASE _source WHEN 'signal' THEN 'Chốt tín hiệu' WHEN 'task' THEN 'Công việc được xác nhận' ELSE 'Hoàn thành KR liên kết Task' END,_source,CASE _source WHEN 'signal' THEN 'status' WHEN 'task' THEN 'approved_completion' ELSE 'verified_task_rate' END,CASE _source WHEN 'signal' THEN 'transition' WHEN 'task' THEN 'event' ELSE 'gte' END,100,_stars,_enabled,NULL,NULL);
END $$;