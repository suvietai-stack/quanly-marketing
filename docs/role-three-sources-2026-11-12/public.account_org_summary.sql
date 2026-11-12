CREATE OR REPLACE FUNCTION public.account_org_summary(_target uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ DECLARE d jsonb; BEGIN d:=private.slot_account_previous_summary(_target); RETURN jsonb_set(d,'{roles}',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'name',name)),'[]') FROM (SELECT DISTINCT r.id,r.name FROM private.role_source_rows(private.base_config()) s JOIN app_roles r ON r.id=s.role_id WHERE s.user_id=_target AND cardinality(s.permissions)>0) x)); END $function$
;
