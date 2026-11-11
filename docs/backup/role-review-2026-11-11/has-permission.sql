CREATE OR REPLACE FUNCTION private.has_permission(_user_id uuid, _permission text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT private.is_active(_user_id) AND (private.is_super_admin(_user_id) OR CASE
 WHEN (private.org_role_permission_ready(_permission) OR private.mkt_specialty_permission_ready(_permission) OR _permission LIKE 'sale_work.%') AND private.base_tier1(_user_id,_permission)='DENY' THEN false
 WHEN (private.org_role_permission_ready(_permission) OR private.mkt_specialty_permission_ready(_permission) OR _permission LIKE 'sale_work.%') AND private.base_tier1(_user_id,_permission)='ALLOW' THEN true
 WHEN EXISTS(SELECT 1 FROM user_permission_overrides o WHERE o.user_id=_user_id AND o.use_custom=true AND o.mode='replace') THEN EXISTS(SELECT 1 FROM user_permission_overrides o WHERE o.user_id=_user_id AND o.use_custom=true AND _permission=ANY(o.permissions))
 ELSE EXISTS(SELECT 1 FROM user_roles ur JOIN app_roles r ON r.id=ur.role_id WHERE ur.user_id=_user_id AND _permission=ANY(r.permissions))
   OR EXISTS(SELECT 1 FROM user_permission_overrides o WHERE o.user_id=_user_id AND o.use_custom=true AND o.mode='additive' AND _permission=ANY(o.permissions)) END) $function$;