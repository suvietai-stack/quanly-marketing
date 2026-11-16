-- Store selector scoped by shift Role, independent of broader Showroom overview rights.
BEGIN;
CREATE OR REPLACE FUNCTION public.showroom_roster_stores_read()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE who uuid:=auth.uid(); stores_ jsonb;
BEGIN
 IF who IS NULL OR NOT private.is_active(who) THEN
  RAISE EXCEPTION 'Cần đăng nhập để xem cửa hàng.' USING ERRCODE='42501'; END IF;
 SELECT coalesce(jsonb_agg(jsonb_build_object('id',u.id,
   'name',CASE WHEN u.name LIKE 'Showrom %' THEN overlay(u.name placing 'Showroom' from 1 for 7) ELSE u.name END)
   ORDER BY u.name),'[]'::jsonb) INTO stores_
 FROM public.org_units u
 JOIN public.org_units p ON p.id=u.parent_id AND p.active AND p.kind='system'
 JOIN public.org_units b ON b.id=p.parent_id AND b.id='showroom-block' AND b.active
 WHERE u.active AND u.kind='department'
   AND private.showroom_shift_can(who,u.id,'showroom.shift.view');
 RETURN jsonb_build_object('stores',stores_);
END $fn$;
REVOKE ALL ON FUNCTION public.showroom_roster_stores_read() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.showroom_roster_stores_read() TO authenticated;
COMMIT;