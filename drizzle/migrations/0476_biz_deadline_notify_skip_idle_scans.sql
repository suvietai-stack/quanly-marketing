-- Skip staff and Role scans on cron ticks when no notice is due.
-- Preserve deduplication, recipient checks, and notification content.
-- Store local Vietnam wall clock as TIMESTAMP, avoiding implicit zone conversion.
CREATE OR REPLACE FUNCTION public.biz_deadline_auto_notify()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE k text; pk text; y int; p int; months int; pstart date; pend date; cfg jsonb; ex jsonb; ek text;
  v_open timestamptz; v_due timestamptz; v_close timestamptz; vn_now timestamp;
  u record; sent int:=0; dkey text; msg text; label text; plabel text;
BEGIN
  vn_now:=now() AT TIME ZONE 'Asia/Ho_Chi_Minh';
  y:=extract(year FROM vn_now)::int;
  FOR k IN SELECT unnest(ARRAY['plan','report']) LOOP
    label:=CASE k WHEN 'plan' THEN 'Kế hoạch' ELSE 'Báo cáo' END;
    FOR pk IN SELECT unnest(ARRAY['month','quarter','year']) LOOP
      months:=CASE pk WHEN 'month' THEN 1 WHEN 'quarter' THEN 3 ELSE 12 END;
      p:=CASE pk WHEN 'month' THEN extract(month FROM vn_now)::int WHEN 'quarter' THEN extract(quarter FROM vn_now)::int ELSE 1 END;
      plabel:=CASE pk WHEN 'month' THEN 'Tháng '||p||'/'||y WHEN 'quarter' THEN 'Quý '||p||'/'||y ELSE 'Năm '||y END;
      SELECT data->(k||'_'||pk) INTO cfg FROM public.biz_deadline_config WHERE id=true;
      IF cfg IS NULL THEN CONTINUE; END IF;
      ek:=y::text||'-'||lpad(p::text,2,'0');
      ex:=cfg->'exceptions'->ek;
      v_open:=CASE WHEN ex->>'open' IS NOT NULL THEN ((ex->>'open')::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh') ELSE public.biz_milestone_at(cfg->'open',k||'_'||pk,y,p) END;
      v_due:=CASE WHEN ex->>'due' IS NOT NULL THEN ((ex->>'due')::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh') WHEN jsonb_typeof(ex)='string' THEN ((ex#>>'{}')::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh') ELSE public.biz_milestone_at(cfg->'due',k||'_'||pk,y,p) END;
      v_close:=CASE WHEN ex->>'late_close' IS NOT NULL THEN ((ex->>'late_close')::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh') ELSE public.biz_milestone_at(cfg->'late_close',k||'_'||pk,y,p) END;
      IF v_due IS NULL THEN CONTINUE; END IF;
      pstart:=make_date(y,(p-1)*months+1,1); pend:=(pstart+make_interval(months=>months)-interval '1 day')::date;
      msg:=NULL; dkey:=NULL;
      IF v_close IS NOT NULL AND now()>v_close AND now()-v_close<=interval '24 hours' THEN
        msg:=label||' '||plabel||' đã đóng kỳ nộp.'; dkey:='closed';
      ELSIF now()>v_due AND (v_close IS NULL OR now()<=v_close) THEN
        msg:=label||' '||plabel||' đã quá hạn nộp. Hãy gửi yêu cầu nộp bù nếu cần.'; dkey:='overdue';
      ELSIF now()<=v_due AND v_due-now()<=interval '24 hours' AND (v_open IS NULL OR now()>=v_open) THEN
        msg:=label||' '||plabel||' sắp đến hạn nộp ('||to_char(v_due AT TIME ZONE 'Asia/Ho_Chi_Minh','DD/MM/YYYY HH24:MI')||').'; dkey:='due';
      ELSIF v_open IS NOT NULL AND now()>=v_open AND now()-v_open<=interval '24 hours' THEN
        msg:=label||' '||plabel||' đã mở nộp.'; dkey:='open';
      END IF;
      IF msg IS NULL THEN CONTINUE; END IF;
      FOR u IN SELECT DISTINCT m2.user_id FROM public.biz_department_members m2 WHERE m2.effective_from<=pend AND (m2.effective_to IS NULL OR m2.effective_to>=pstart) AND public.biz_can(m2.user_id,'biz.'||k||'_submit') LOOP
        IF EXISTS(SELECT 1 FROM public.biz_documents d WHERE d.user_id=u.user_id AND d.kind=k AND d.period_kind=pk AND d.year=y AND d.period=p AND d.first_submitted_at IS NOT NULL) THEN CONTINUE; END IF;
        INSERT INTO public.notifications(recipient_id,kind,dedup_key,payload,zalo_status,push_status)
        VALUES(u.user_id,'biz_deadline','biz_auto:'||dkey||':'||k||':'||pk||':'||y||':'||p||':'||u.user_id,jsonb_build_object('message',msg,'kind',k,'period_kind',pk,'year',y,'period',p),'ineligible','none') ON CONFLICT(dedup_key) DO NOTHING;
        IF FOUND THEN sent:=sent+1; END IF;
      END LOOP;
    END LOOP;
  END LOOP;
  RETURN jsonb_build_object('sent',sent);
END $function$;
