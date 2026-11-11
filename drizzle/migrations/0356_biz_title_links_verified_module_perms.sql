-- Allow title->role links for biz_positions titles to grant verified MODULE permissions
-- (signal.*/biz.crm_*/oq.*/ot.*/finance.incoming.*/leave.*/att.* with their own backend gates).
-- biz.*/k3.* permissions stay outside the allowlist, so the 0354 biz appointment contract remains
-- the only path for business-management rights.
CREATE OR REPLACE FUNCTION private.org_role_rules(u uuid, c jsonb)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
 SELECT coalesce(jsonb_agg(jsonb_build_object('id',(m->>'id')||':'||(l->>'role_id')||':'||p,'permission',p,'effect','ALLOW','scope','native','active',true,'source_kind','appointment_role','source_id',m->>'id','source_name',r.name,'role_id',r.id,'unit_id',m->>'unit_id','starts_at',m->>'starts_at','ends_at',m->>'ends_at')),'[]')
 FROM jsonb_array_elements(coalesce(c->'memberships','[]')) m
 JOIN LATERAL jsonb_array_elements(coalesce(c->'titles','[]')) t ON t->>'id'=m->>'title_id'
 JOIN LATERAL jsonb_array_elements(coalesce(c->'role_links','[]')) l ON l->>'title_id'=t->>'id' AND l->>'title_source'=CASE WHEN t->>'source'='biz_positions' THEN 'biz' ELSE 'base' END
 JOIN app_roles r ON r.id=l->>'role_id'
 CROSS JOIN LATERAL jsonb_array_elements_text(coalesce(l->'enabled_permissions','[]')) p
 WHERE private.is_active(u) AND m->>'user_id'=u::text AND private.base_valid_at(m) AND coalesce(m->>'status','active')='active'
 AND coalesce((t->>'active')::boolean,false)
 AND l->>'scope_kind'='own' AND r.id NOT IN ('role-admin','role-super-admin') AND l->>'permission_signature'=md5(coalesce(r.permissions,'{}')::text)
 AND p=ANY(r.permissions) AND private.org_role_permission_ready(p)
 AND EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(c->'units','[]')) root WHERE root->>'kind' IN ('company','block') AND private.base_role_unit_contains(c,root->>'id',m->>'unit_id'))
$function$;

-- Move the six links created in 0355 to the biz title source so they match biz_positions titles.
UPDATE public.base_title_role_links
SET title_source = 'biz', revision = revision + 1
WHERE title_id IN ('e5fe2a3f-dfff-4ee0-beaa-a6434b2388e0','3fac501b-ebb5-4262-8c87-d376a2c18ad8','9cc8cdff-afcf-41eb-89b3-d8836d86ab84','60dc2983-c41c-42dc-bcf6-14010beaa3dd','ea700d9c-35a7-4ceb-b1cd-bfb9080b4d08','6faa90f6-1f3f-4974-bf4e-d4e21d529f6c')
  AND title_source = 'base';

-- Signal scope from appointment-linked roles must follow the same source matching.
CREATE OR REPLACE FUNCTION private.sig_scope_ok(_uid uuid, _groups text[])
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT _uid IS NOT NULL AND (
    private.is_super_admin(_uid) OR private.is_admin(_uid)
    OR NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = _uid)
    OR EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.app_roles r ON r.id = ur.role_id
               WHERE ur.user_id = _uid AND r.signal_scope_all)
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur JOIN public.app_roles r ON r.id = ur.role_id,
        unnest(coalesce(_groups,'{}')) g
      WHERE ur.user_id = _uid
        AND (g = ANY(r.signal_scope) OR (g LIKE 'Khác:%' AND 'Khác' = ANY(r.signal_scope))))
    OR EXISTS (
      SELECT 1 FROM public.org_assignments a
        JOIN public.base_title_role_links l ON l.title_id = a.title_id
        JOIN public.app_roles r ON r.id = l.role_id
      WHERE a.user_id = _uid AND a.status = 'active'
        AND a.starts_at <= now() AND (a.ends_at IS NULL OR a.ends_at > now())
        AND l.permission_signature = md5(coalesce(r.permissions,'{}')::text)
        AND r.signal_scope_all)
    OR EXISTS (
      SELECT 1 FROM public.org_assignments a
        JOIN public.base_title_role_links l ON l.title_id = a.title_id
        JOIN public.app_roles r ON r.id = l.role_id,
        unnest(coalesce(_groups,'{}')) g
      WHERE a.user_id = _uid AND a.status = 'active'
        AND a.starts_at <= now() AND (a.ends_at IS NULL OR a.ends_at > now())
        AND l.permission_signature = md5(coalesce(r.permissions,'{}')::text)
        AND (g = ANY(r.signal_scope) OR (g LIKE 'Khác:%' AND 'Khác' = ANY(r.signal_scope))))
  );
$function$;