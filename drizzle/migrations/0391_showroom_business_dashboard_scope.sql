-- Showroom A2 is no longer a branch of Khối Kinh doanh.
-- Retain legacy documents and historical facts, but exclude their current
-- department from business dashboards. No documents or metrics are deleted.
BEGIN;
SET LOCAL lock_timeout='8s';
SET LOCAL statement_timeout='90s';

DO $scope$
DECLARE
  fn text;
  definition text;
  find_str text;
  replace_str text;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.org_units WHERE id='76fcf3a9-8561-4e2a-be3c-c6724a6310fb' AND parent_id='showroom-block')
  THEN RAISE EXCEPTION 'A2 cutover missing, refuse dashboard patch'; END IF;

  FOR fn IN SELECT unnest(ARRAY[
    'public.biz_dashboard_read(integer,text,integer,uuid,uuid,text)',
    'private.biz_dashboard_global_read(integer,text,integer,uuid,uuid,text)'
  ]) LOOP
    SELECT pg_get_functiondef(fn::regprocedure) INTO definition;
    find_str:='FROM roster r WHERE (all_ok OR';
    replace_str:='FROM roster r WHERE private.biz_owned_department(r.department_id) AND (all_ok OR';
    IF position(replace_str IN definition)=0 THEN
      IF position(find_str IN definition)=0 THEN RAISE EXCEPTION 'Dashboard roster statement changed: %',fn; END IF;
      definition:=replace(definition,find_str,replace_str);
    END IF;

    find_str:='FROM obligations o JOIN public.biz_departments dep ON dep.id=o.department_id WHERE ';
    replace_str:='FROM obligations o JOIN public.biz_departments dep ON dep.id=o.department_id WHERE private.biz_owned_department(o.department_id) AND ';
    IF position(replace_str IN definition)=0 THEN
      IF position(find_str IN definition)=0 THEN RAISE EXCEPTION 'Dashboard obligations statement changed: %',fn; END IF;
      definition:=replace(definition,find_str,replace_str);
    END IF;
    EXECUTE definition;
  END LOOP;

  fn:='public.biz_dashboard_published(integer,text,integer)';
  SELECT pg_get_functiondef(fn::regprocedure) INTO definition;
  find_str:='FROM public.biz_systems WHERE active ORDER BY ord';
  replace_str:='FROM public.biz_systems WHERE active AND private.biz_owned_system(id) ORDER BY ord';
  IF position(replace_str IN definition)=0 THEN
    IF position(find_str IN definition)=0 THEN RAISE EXCEPTION 'Business published system loop changed'; END IF;
    definition:=replace(definition,find_str,replace_str);
  END IF;
  EXECUTE definition;
END
$scope$;

COMMIT;
