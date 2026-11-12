CREATE OR REPLACE FUNCTION private.base_legacy(u uuid, p text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  allowed boolean := false; src jsonb;
  o_mode text; o_perms text[]; o_custom boolean := false;
BEGIN
  IF p LIKE 'biz.crm_%' THEN
    allowed := private.base_crm_legacy(u, p); src := '{"kind":"business","tier":2}';
  ELSIF p LIKE 'biz.%' THEN
    allowed := public.biz_can(u, p); src := '{"kind":"business","tier":2}';
  ELSIF p LIKE 'k3.%' THEN
    allowed := public.k3_can(u, p); src := '{"kind":"business","tier":2}';
  ELSE
    SELECT o.mode, coalesce(o.permissions, '{}') INTO o_mode, o_perms
    FROM user_permission_overrides o WHERE o.user_id = u AND o.use_custom;
    o_custom := FOUND;
    IF o_custom AND o_mode = 'replace' THEN
      allowed := p = ANY(o_perms);
      src := '{"kind":"custom","tier":3}';
    ELSE
      SELECT coalesce(bool_or(p = ANY(r.permissions)), false) INTO allowed
      FROM user_roles ur JOIN app_roles r ON r.id = ur.role_id WHERE ur.user_id = u;
      SELECT jsonb_build_object('kind', 'role', 'tier', 3, 'names', coalesce(jsonb_agg(r.name), '[]')) INTO src
      FROM user_roles ur JOIN app_roles r ON r.id = ur.role_id WHERE ur.user_id = u;
      IF NOT allowed AND o_custom AND o_mode = 'additive' AND p = ANY(o_perms) THEN
        allowed := true;
        src := jsonb_build_object('kind', 'custom', 'tier', 3, 'mode', 'additive');
      END IF;
    END IF;
  END IF;
  RETURN jsonb_build_object('allowed', coalesce(allowed, false), 'source', src);
END $function$
