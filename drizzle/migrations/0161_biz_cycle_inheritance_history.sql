ALTER TABLE public.biz_report_cycle_configs ADD COLUMN inherit_parent boolean NOT NULL DEFAULT false;
COMMENT ON COLUMN public.biz_report_cycle_configs.inherit_parent IS 'Effective-dated return to parent; older cycle rows remain for historical resolution.';
CREATE OR REPLACE FUNCTION public.biz_report_cycle_delete(_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE ex public.biz_report_cycle_configs; at_ date; start_ date; rid uuid;
BEGIN
 IF NOT private.sig_can(auth.uid(),'biz.deadline_manage') THEN RAISE EXCEPTION 'Bạn không có quyền cấu hình chu kỳ báo cáo.'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('biz_report_cycle_config'));
 SELECT * INTO ex FROM public.biz_report_cycle_configs WHERE id=_id FOR UPDATE;
 IF ex.id IS NULL THEN RAISE EXCEPTION 'Cấu hình không tồn tại.'; END IF;
 at_:=(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
 IF ex.effective_from>=at_ THEN
  DELETE FROM public.biz_report_cycle_configs WHERE id=_id;
  INSERT INTO public.biz_report_cycle_config_log(actor_id,action,config_id,old_row) VALUES(auth.uid(),'delete',_id,to_jsonb(ex));
  RETURN;
 END IF;
 start_:=CASE ex.cycle WHEN 'day' THEN at_+1 WHEN 'week' THEN at_+(8-extract(isodow FROM at_)::int) WHEN 'month' THEN (date_trunc('month',at_)+interval '1 month')::date ELSE (date_trunc('quarter',at_)+interval '3 months')::date END;
 INSERT INTO public.biz_report_cycle_configs(scope,system_id,department_id,cycle,effective_from,workdays,created_by,inherit_parent)
 VALUES(ex.scope,ex.system_id,ex.department_id,ex.cycle,start_,ex.workdays,auth.uid(),true)
 ON CONFLICT(scope,coalesce(system_id,'00000000-0000-0000-0000-000000000000'::uuid),coalesce(department_id,'00000000-0000-0000-0000-000000000000'::uuid),effective_from) DO UPDATE SET inherit_parent=true,updated_at=now() RETURNING id INTO rid;
 INSERT INTO public.biz_report_cycle_config_log(actor_id,action,config_id,old_row,new_row) VALUES(auth.uid(),'delete',rid,to_jsonb(ex),(SELECT to_jsonb(c) FROM public.biz_report_cycle_configs c WHERE id=rid));
END $$;
DO $patch$
DECLARE f text;
BEGIN
 SELECT pg_get_functiondef('public.biz_report_cycle_config_of(uuid,date)'::regprocedure) INTO f;
 f:=replace(f,'IF r.id IS NOT NULL THEN RETURN','IF r.id IS NOT NULL AND NOT r.inherit_parent THEN RETURN');EXECUTE f;
 SELECT pg_get_functiondef('public.biz_report_cycle_save(text,uuid,uuid,text,date,jsonb)'::regprocedure) INTO f;
 f:=replace(f,'SET cycle=_cycle, workdays=_workdays, updated_at=now()','SET cycle=_cycle, workdays=_workdays,inherit_parent=false, updated_at=now()');EXECUTE f;
 -- Canonical additive summary never silently prefers a monthly overlapping source.
 SELECT pg_get_functiondef('public.biz_report_metrics(uuid,integer,text,integer,text)'::regprocedure) INTO f;
 f:=replace(f,'IF item->>''actual'' IS NULL THEN item:=','IF i.definition->>''aggregation''=''sum'' THEN item:=');
 f:=replace(f,'percent_value:=CASE WHEN target_value>0',$whole$IF i.definition->>'aggregation'='sum' AND _period_kind IN ('quarter','year') THEN
   DECLARE whole_ text;
   BEGIN
    whole_:=private.biz_report_actual_range(_user,i.metric_id,public.biz_period_start_date(_period_kind,_year,_period),public.biz_period_end_date(_period_kind,_year,_period),_mode);
    IF whole_ IS NOT NULL THEN actual_value:=whole_::numeric; missing:='{}';complete_months:=ARRAY(SELECT generate_series(lo,hi)); END IF;
   END;
  END IF;
  percent_value:=CASE WHEN target_value>0$whole$);
 EXECUTE f;
END $patch$;