-- BEFORE PRODUCTION 2026-11-13: original definitions for 3 functions.
-- RESTORE ONLY IF NEEDED; the live production data is not copied here.
-- Original owners: private.base_decision=postgres; private.has_permission=postgres; public.signal_sales_list=postgres
-- Original ACLs: private.base_decision={postgres=X/postgres}; private.has_permission={postgres=X/postgres,authenticated=X/postgres}; public.signal_sales_list={postgres=X/postgres,authenticated=X/postgres,service_role=X/postgres}

CREATE OR REPLACE FUNCTION private.base_decision(u uuid, p text, c jsonb)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT CASE WHEN EXISTS(SELECT 1 FROM jsonb_array_elements(private.base_rules(u,c)) r WHERE r->>'permission'=p AND r->>'effect'='DENY') THEN 'DENY' WHEN EXISTS(SELECT 1 FROM jsonb_array_elements(private.base_rules(u,c)) r WHERE r->>'permission'=p AND r->>'effect'='ALLOW') THEN 'ALLOW' ELSE 'NOT_CONFIGURED' END $function$
;

CREATE OR REPLACE FUNCTION private.has_permission(_user_id uuid, _permission text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT private.is_active(_user_id) AND (private.is_super_admin(_user_id) OR CASE
 WHEN (private.org_role_permission_ready(_permission) OR private.mkt_specialty_permission_ready(_permission) OR _permission LIKE 'sale_work.%' OR private.permission_configured(_user_id,_permission)) AND private.base_tier1(_user_id,_permission)='DENY' THEN false
 WHEN (private.org_role_permission_ready(_permission) OR private.mkt_specialty_permission_ready(_permission) OR _permission LIKE 'sale_work.%' OR private.permission_configured(_user_id,_permission)) AND private.base_tier1(_user_id,_permission)='ALLOW' THEN true
 WHEN EXISTS(SELECT 1 FROM user_permission_overrides o WHERE o.user_id=_user_id AND o.use_custom=true AND o.mode='replace') THEN EXISTS(SELECT 1 FROM user_permission_overrides o WHERE o.user_id=_user_id AND o.use_custom=true AND _permission=ANY(o.permissions))
 ELSE EXISTS(SELECT 1 FROM user_roles ur JOIN app_roles r ON r.id=ur.role_id WHERE ur.user_id=_user_id AND _permission=ANY(r.permissions))
   OR EXISTS(SELECT 1 FROM user_permission_overrides o WHERE o.user_id=_user_id AND o.use_custom=true AND o.mode='additive' AND _permission=ANY(o.permissions)) END) $function$
;

CREATE OR REPLACE FUNCTION public.signal_sales_list()
 RETURNS TABLE(id uuid, full_name text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT p.id, p.full_name FROM public.profiles p
  WHERE (private.sig_can(auth.uid(),'signal.assign') OR private.sig_can(auth.uid(),'signal.manage'))
    AND private.sig_can(p.id,'signal.sale') ORDER BY p.full_name;
$function$
;
