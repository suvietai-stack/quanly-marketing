CREATE OR REPLACE FUNCTION public.base_permissions_effective(_user uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ DECLARE c_ jsonb;u uuid:=coalesce(_user,auth.uid());BEGIN IF auth.uid() IS NULL OR NOT private.is_active(auth.uid()) OR (u<>auth.uid() AND NOT private.base_org_admin()) THEN RAISE EXCEPTION 'Không có quyền xem phân quyền.';END IF;c_:=private.base_config();RETURN jsonb_build_object('user_id',u,'revision',coalesce((SELECT revision FROM base_org_state WHERE id),0),'server_now',now(),'next_transition_at',private.base_next_transition(c_),'permissions',private.base_effective(u,c_));END $function$
;
