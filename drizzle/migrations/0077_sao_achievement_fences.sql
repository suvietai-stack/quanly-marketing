CREATE TABLE public.sao_achievements(source text NOT NULL, source_id text NOT NULL, occurred_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(source,source_id));
GRANT ALL ON public.sao_achievements TO service_role; ALTER TABLE public.sao_achievements ENABLE ROW LEVEL SECURITY;
INSERT INTO public.sao_achievements(source,source_id,occurred_at) SELECT 'signal',id::text,coalesce(closed_at,created_at) FROM public.opportunity_signals WHERE status='won' OR EXISTS(SELECT 1 FROM public.opportunity_signal_notes n WHERE n.signal_id=opportunity_signals.id AND n.status_to='won');
INSERT INTO public.sao_achievements(source,source_id,occurred_at) SELECT 'task',id,created_at FROM public.tasks WHERE data->>'status'='Hoàn thành' OR EXISTS(SELECT 1 FROM jsonb_array_elements(CASE WHEN jsonb_typeof(data->'history')='array' THEN data->'history' ELSE '[]'::jsonb END) h WHERE h->>'toStatus'='Hoàn thành');
INSERT INTO public.sao_achievements(source,source_id,occurred_at) SELECT 'kpi',i.id::text,i.created_at FROM public.employee_kpi_items i JOIN public.employee_kpi_periods p ON p.id=i.kpi_period_id WHERE p.status IN ('locked','closed');
CREATE OR REPLACE FUNCTION private.sao_award(_user uuid,_source text,_id text,_at timestamptz,_reason text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r public.sao_rules; first_id text;
BEGIN
 INSERT INTO public.sao_achievements(source,source_id,occurred_at) VALUES(_source,_id,_at) ON CONFLICT DO NOTHING RETURNING source_id INTO first_id;
 IF first_id IS NULL THEN RETURN; END IF;
 SELECT * INTO r FROM public.sao_rules WHERE source=_source FOR SHARE;
 IF r.id IS NULL OR NOT r.enabled OR r.enabled_at IS NULL OR _at<r.enabled_at THEN RETURN; END IF;
 PERFORM private.sao_credit(_user,r.stars,_source,_id,r.id,_reason,auth.uid());
END $$;
CREATE TABLE public.sao_kpi_locks(period_id uuid PRIMARY KEY, locked_by uuid NOT NULL, locked_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.sao_kpi_locks TO service_role; ALTER TABLE public.sao_kpi_locks ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION private.sao_period_lock() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF OLD.status='active' AND NEW.status='locked' AND private.sig_can(auth.uid(),'kpi.period_manage') THEN INSERT INTO public.sao_kpi_locks(period_id,locked_by) VALUES(NEW.id,auth.uid()) ON CONFLICT DO NOTHING; END IF; RETURN NEW; END $$;
CREATE TRIGGER sao_period_lock AFTER UPDATE ON public.employee_kpi_periods FOR EACH ROW EXECUTE FUNCTION private.sao_period_lock();
CREATE OR REPLACE FUNCTION private.sao_kpi_event() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p public.employee_kpi_periods; it public.employee_kpi_items; actual numeric; ids jsonb; l public.sao_kpi_locks;
BEGIN
 IF NOT private.sig_can(auth.uid(),'kpi.period_manage') OR NEW.locked_by IS DISTINCT FROM auth.uid() THEN RETURN NEW; END IF;
 SELECT * INTO l FROM public.sao_kpi_locks WHERE period_id=NEW.kpi_period_id;
 IF l.period_id IS NULL OR l.locked_by<>auth.uid() OR l.locked_at<now()-interval '5 minutes' THEN RETURN NEW; END IF;
 SELECT * INTO p FROM public.employee_kpi_periods WHERE id=NEW.kpi_period_id;
 IF p.status NOT IN ('locked','closed') THEN RETURN NEW; END IF;
 FOR it IN SELECT * FROM public.employee_kpi_items WHERE kpi_period_id=p.id AND metric_key IN ('task_completed','custom_task_result') AND target_value>0 AND website_id IS NULL AND social_id IS NULL LOOP
 ids:=coalesce(it.metadata->'taskIds','[]'::jsonb);
 SELECT count(*) INTO actual FROM public.sao_task_approvals a JOIN public.tasks t ON t.id=a.task_id WHERE a.user_id=p.user_id AND t.data->>'status'='Hoàn thành' AND (a.submitted_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date BETWEEN p.period_start AND least(p.period_end,coalesce((it.metadata->>'deadline')::date,p.period_end)) AND (it.brand_id IS NULL OR a.brand_id=it.brand_id) AND (it.metric_key='task_completed' OR ids ? a.task_id);
 IF actual>=it.target_value AND it.metadata->>'lockedAchieved'='true' THEN PERFORM private.sao_award(p.user_id,'kpi',it.id::text,l.locked_at,'Hoàn thành KPI đã khóa kỳ: '||coalesce(it.label,it.metric_key)); END IF;
 END LOOP; RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.sao_period_lock() FROM PUBLIC,anon,authenticated;