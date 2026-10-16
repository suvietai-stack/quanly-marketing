CREATE OR REPLACE FUNCTION private.has_permission(_user_id uuid, _permission text)
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role_id = 'role-super-admin')
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND is_system_admin = true)
    OR CASE
      WHEN EXISTS (SELECT 1 FROM public.user_permission_overrides WHERE user_id = _user_id AND use_custom = true) THEN
        EXISTS (SELECT 1 FROM public.user_permission_overrides WHERE user_id = _user_id AND _permission = ANY(permissions))
      ELSE
        EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.app_roles r ON r.id = ur.role_id
                WHERE ur.user_id = _user_id AND _permission = ANY(r.permissions))
    END;
$function$;