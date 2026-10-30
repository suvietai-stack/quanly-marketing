CREATE OR REPLACE FUNCTION public.biz_deadline_at(_kind text,_year int,_period int DEFAULT 1) RETURNS timestamptz LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE r jsonb; first_month int; months int; base date; day_no int; exception_key text;
BEGIN
 IF NOT (private.sig_can(auth.uid(),'biz.deadline_manage') OR private.sig_can(auth.uid(),'biz.goal_submit') OR private.sig_can(auth.uid(),'biz.plan_submit') OR private.sig_can(auth.uid(),'biz.report_submit') OR private.sig_can(auth.uid(),'biz.plan_approve') OR private.sig_can(auth.uid(),'biz.report_approve') OR private.sig_can(auth.uid(),'biz.view_own') OR private.sig_can(auth.uid(),'biz.view_dept') OR private.sig_can(auth.uid(),'biz.view_all') OR private.sig_can(auth.uid(),'biz.goal_approve')) THEN RAISE EXCEPTION 'Không có quyền xem deadline.';END IF;
 IF _kind NOT IN ('goal_year','plan_month','plan_quarter','plan_year','report_month','report_quarter','report_year') OR _year NOT BETWEEN 2000 AND 2200 THEN RAISE EXCEPTION 'Kỳ không hợp lệ.';END IF;
 months:=CASE WHEN _kind LIKE '%month' THEN 1 WHEN _kind LIKE '%quarter' THEN 3 ELSE 12 END;
 IF _period<1 OR _period>12/months THEN RAISE EXCEPTION 'Kỳ không hợp lệ.';END IF;
 first_month:=(_period-1)*months+1;exception_key:=_year::text||'-'||lpad(_period::text,2,'0');SELECT data->_kind INTO r FROM public.biz_deadline_config WHERE id=true;
 IF r->'exceptions'->>exception_key IS NOT NULL THEN RETURN ((r->'exceptions'->>exception_key)::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh');END IF;
 IF r->>'day' IS NULL THEN RETURN NULL;END IF;
 base:=make_date(_year,first_month,1);base:=CASE r->>'phase' WHEN 'before' THEN (base-interval '1 month')::date WHEN 'after' THEN (base+make_interval(months=>months))::date ELSE base END;
 day_no:=least((r->>'day')::int,extract(day FROM base+interval '1 month - 1 day')::int);
 RETURN ((base+(day_no-1))::timestamp+make_interval(hours=>coalesce((r->>'hour')::int,17),mins=>coalesce((r->>'minute')::int,0))) AT TIME ZONE 'Asia/Ho_Chi_Minh';
END $$;
CREATE FUNCTION public.biz_deadline_remind(_kind text,_period_kind text,_year int,_period int) RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r jsonb;rows_ jsonb;status_ text;count_ int:=0;
BEGIN
 IF NOT private.sig_can(auth.uid(),'biz.deadline_manage') THEN RAISE EXCEPTION 'Không có quyền nhắc deadline.';END IF;
 rows_:=public.biz_documents_read(_kind,_period_kind,_year,_period);
 FOR r IN SELECT * FROM jsonb_array_elements(rows_) LOOP
  IF NOT private.sig_can((r->>'user_id')::uuid,'biz.'||_kind||'_submit') THEN CONTINUE;END IF;
  status_:=public.biz_deadline_status((r->>'deadline')::timestamptz,(r->'document'->>'first_submitted_at')::timestamptz,now());
  IF status_ IN ('soon','overdue') THEN
   INSERT INTO public.notifications(recipient_id,kind,dedup_key,payload,zalo_status,push_status) VALUES((r->>'user_id')::uuid,'biz_deadline','biz:deadline:'||_kind||':'||_period_kind||':'||_year||':'||_period||':'||(r->>'user_id')||':'||status_,jsonb_build_object('message',CASE _kind WHEN 'plan' THEN 'Kế hoạch' ELSE 'Báo cáo' END||CASE status_ WHEN 'soon' THEN ' sắp đến hạn nộp.' ELSE ' quá hạn, chưa nộp.' END,'kind',_kind,'period_kind',_period_kind,'year',_year,'period',_period,'user_id',r->>'user_id'),'ineligible','none') ON CONFLICT(dedup_key) DO NOTHING;
   IF FOUND THEN count_:=count_+1;END IF;
  END IF;
 END LOOP;RETURN count_;
END $$;
REVOKE ALL ON FUNCTION public.biz_deadline_remind(text,text,int,int) FROM PUBLIC,anon;GRANT EXECUTE ON FUNCTION public.biz_deadline_remind(text,text,int,int) TO authenticated;