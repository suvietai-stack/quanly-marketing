CREATE OR REPLACE FUNCTION private.base_role_links_resign()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_actor uuid;
BEGIN
  SELECT p.id INTO v_actor FROM public.profiles p WHERE p.id = auth.uid();
  IF v_actor IS NULL THEN
    SELECT ur.user_id INTO v_actor FROM public.user_roles ur WHERE ur.role_id = 'role-super-admin' ORDER BY ur.user_id LIMIT 1;
  END IF;
  WITH upd AS (
    UPDATE public.base_title_role_links l
    SET enabled_permissions = ARRAY(
          SELECT p FROM unnest(coalesce(l.enabled_permissions,'{}'::text[])) p
          WHERE p = ANY (NEW.permissions) AND private.org_role_permission_ready(p)),
        permission_signature = md5(coalesce(NEW.permissions,'{}'::text[])::text),
        revision = l.revision + 1,
        updated_at = now()
    WHERE l.role_id = NEW.id
      AND (l.permission_signature IS DISTINCT FROM md5(coalesce(NEW.permissions,'{}'::text[])::text)
           OR l.enabled_permissions <> ARRAY(
                SELECT p FROM unnest(coalesce(l.enabled_permissions,'{}'::text[])) p
                WHERE p = ANY (NEW.permissions) AND private.org_role_permission_ready(p)))
    RETURNING l.title_source, l.title_id
  )
  INSERT INTO public.base_title_role_events (actor_id, title_source, title_id, reason, before_data, after_data)
  SELECT v_actor, u.title_source, u.title_id,
         'Tự đồng bộ chữ ký liên kết sau khi Role thay đổi quyền',
         jsonb_build_object('role_id', OLD.id, 'permissions', OLD.permissions),
         jsonb_build_object('role_id', NEW.id, 'permissions', NEW.permissions)
  FROM upd u
  WHERE v_actor IS NOT NULL;

  UPDATE public.org_assignments a
  SET data = jsonb_set(a.data, '{specialty_signatures}',
             coalesce(a.data->'specialty_signatures','{}'::jsonb) || jsonb_build_object(s.id, md5(coalesce(NEW.permissions,'{}'::text[])::text))),
      revision = a.revision + 1
  FROM public.mkt_specialties s
  WHERE s.role_id = NEW.id
    AND a.data->'specialty_ids' ? s.id
    AND (a.data->'specialty_signatures'->>s.id) IS DISTINCT FROM md5(coalesce(NEW.permissions,'{}'::text[])::text);

  RETURN NEW;
END
$function$
;
