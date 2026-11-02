-- Remove the now-dead direct actual_range call in rolling basis; month coverage is the single source.
DO $patch$
DECLARE f text; marker text;
BEGIN
 SELECT pg_get_functiondef('private.biz_rolling_basis(uuid)'::regprocedure) INTO f;
 marker:='a:=private.biz_report_actual_range(g.user_id,i.metric_id,make_date(g.year,m,1),(make_date(g.year,m,1)+interval ''1 month - 1 day'')::date,''official'');';
 IF position(marker IN f)=0 THEN RAISE EXCEPTION 'Rolling basis actual call changed.'; END IF;
 f:=replace(f,marker,'-- actual resolved through month coverage below');
 EXECUTE f;
END $patch$;