CREATE FUNCTION private.k3_result_acceptance(_result uuid,_official boolean) RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
 SELECT a.decision FROM k3_kpi_results r JOIN k3_kpi_acceptances a ON a.result_id=r.id AND a.result_revision=r.revision WHERE r.id=_result AND (NOT _official OR a.created_at<=(SELECT max(c.at) FROM (SELECT d.closed_at AS at FROM k3_daily_closes d WHERE d.user_id=r.user_id AND d.work_date=r.work_date UNION ALL SELECT d.confirmed_at FROM k3_kpi_day_confirmations d WHERE d.user_id=r.user_id AND d.work_date=r.work_date AND d.source='manual') c)) ORDER BY a.created_at DESC,a.id DESC LIMIT 1;
$fn$;
REVOKE ALL ON FUNCTION private.k3_result_acceptance(uuid,boolean) FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION private.k3_measure_rows(_kpi uuid,_official boolean) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
 SELECT coalesce(jsonb_agg(to_jsonb(r)||jsonb_build_object('acceptance',private.k3_result_acceptance(r.id,_official))),'[]') FROM private.k3_result_eligible(_kpi,_official) r;
$fn$;
CREATE OR REPLACE FUNCTION private.k3_result_metric_range(_kpi uuid,_official boolean,_start date,_end date,_user uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE k k3_kpis; rows jsonb; config jsonb;
BEGIN
 SELECT * INTO k FROM k3_kpis WHERE id=_kpi;
 SELECT coalesce(jsonb_agg(to_jsonb(r)||jsonb_build_object('acceptance',private.k3_result_acceptance(r.id,_official))),'[]') INTO rows FROM private.k3_result_eligible_range(_kpi,_official,_start,_end,_user) r;
 config:=to_jsonb(k); IF k.measure='streak' THEN config:=jsonb_set(config,'{config,start_date}',to_jsonb(greatest(_start,(k.config->>'start_date')::date))); END IF;
 RETURN private.k3_measure_eval(config,rows,least(_end,(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date)); END $fn$;