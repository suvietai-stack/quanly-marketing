-- Role references only; no existing user_roles or business grants are changed.
CREATE TABLE public.base_title_role_links (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 title_source text NOT NULL CHECK (title_source IN ('base','biz')),
 title_id text NOT NULL,
 role_id text NOT NULL REFERENCES public.app_roles(id),
 is_primary boolean NOT NULL DEFAULT false,
 scope_kind text NOT NULL DEFAULT 'unit' CHECK (scope_kind IN ('own','unit')),
 active boolean NOT NULL DEFAULT false,
 revision bigint NOT NULL DEFAULT 1,
 reason text NOT NULL,
 updated_by uuid NOT NULL REFERENCES public.profiles(id),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(title_source,title_id,role_id),
 CONSTRAINT base_title_role_privilege_fence CHECK (role_id NOT IN ('role-super-admin','role-admin')),
 CONSTRAINT base_title_role_activation_fence CHECK (active = false)
);
GRANT SELECT ON public.base_title_role_links TO authenticated;
GRANT ALL ON public.base_title_role_links TO service_role;
ALTER TABLE public.base_title_role_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY base_title_role_admin_read ON public.base_title_role_links FOR SELECT TO authenticated USING (private.is_super_admin(auth.uid()));
CREATE UNIQUE INDEX base_title_role_one_primary ON public.base_title_role_links(title_source,title_id) WHERE is_primary;

CREATE TABLE public.base_title_role_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 actor_id uuid NOT NULL REFERENCES public.profiles(id),
 title_source text NOT NULL,
 title_id text NOT NULL,
 reason text NOT NULL,
 before_data jsonb NOT NULL,
 after_data jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.base_title_role_events TO authenticated;
GRANT ALL ON public.base_title_role_events TO service_role;
ALTER TABLE public.base_title_role_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY base_title_role_event_admin_read ON public.base_title_role_events FOR SELECT TO authenticated USING (private.is_super_admin(auth.uid()));

-- Pure scope primitive. Missing/disabled/cyclic units never broaden access.
CREATE OR REPLACE FUNCTION private.base_role_unit_contains(c jsonb, root_id text, target_id text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 WITH RECURSIVE tree AS (
 SELECT x->>'id' id, ARRAY[x->>'id'] path FROM jsonb_array_elements(coalesce(c->'units','[]')) x
 WHERE x->>'id'=root_id AND coalesce((x->>'active')::boolean,false)
 UNION ALL
 SELECT x->>'id', tree.path || (x->>'id') FROM tree
 JOIN LATERAL jsonb_array_elements(coalesce(c->'units','[]')) x ON x->>'parent_id'=tree.id
 WHERE coalesce((x->>'active')::boolean,false) AND NOT (x->>'id'=ANY(tree.path))
 ) SELECT root_id IS NOT NULL AND target_id IS NOT NULL AND EXISTS(SELECT 1 FROM tree WHERE id=target_id)
$$;
REVOKE ALL ON FUNCTION private.base_role_unit_contains(jsonb,text,text) FROM PUBLIC,anon,authenticated;

-- Read-only audit against the live original Role. Every key remains blocked for inheritance
-- until all of that module's reads/writes/reports/notifications have scope verification.
CREATE OR REPLACE FUNCTION public.base_title_roles_read()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF auth.uid() IS NULL OR NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin được thiết lập Role mặc định.'; END IF;
 RETURN jsonb_build_object(
 'server_now',now(),
 'roles',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',r.id,'name',r.name,'restricted',r.id IN ('role-admin','role-super-admin'),'permissions',coalesce(r.permissions,'{}'::text[]),'checks',(
 SELECT coalesce(jsonb_agg(jsonb_build_object('key',p,'ready',false,'reason',CASE
 WHEN p LIKE 'biz.%' OR p LIKE 'k3.%' THEN 'appointment_only'
 WHEN p LIKE 'settings.%' OR p LIKE '%.settings' OR p LIKE '%.manage_settings' THEN 'global_configuration'
 ELSE 'scope_audit_pending' END) ORDER BY p),'[]'::jsonb) FROM unnest(coalesce(r.permissions,'{}'::text[])) p)) ORDER BY r.name),'[]'::jsonb) FROM app_roles r),
 'links',(SELECT coalesce(jsonb_agg(to_jsonb(l) ORDER BY l.title_source,l.title_id,l.is_primary DESC),'[]'::jsonb) FROM base_title_role_links l),
 'events',(SELECT coalesce(jsonb_agg(to_jsonb(e)),'[]'::jsonb) FROM (SELECT * FROM base_title_role_events ORDER BY created_at DESC LIMIT 50)e),
 'direct_roles',(SELECT coalesce(jsonb_agg(jsonb_build_object('user_id',ur.user_id,'role_id',ur.role_id)),'[]'::jsonb) FROM user_roles ur),
 'activation_ready',false);
END $$;
REVOKE ALL ON FUNCTION public.base_title_roles_read() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.base_title_roles_read() TO authenticated,service_role;

-- Atomic draft-only save. Explicit expected snapshot prevents a stale tab overwriting changes.
CREATE OR REPLACE FUNCTION public.base_title_roles_save(_source text,_title text,_roles jsonb,_expected jsonb,_reason text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE before_rows jsonb; after_rows jsonb; item jsonb; n int;
BEGIN
 IF auth.uid() IS NULL OR NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin được thiết lập Role mặc định.'; END IF;
 IF _source NOT IN ('base','biz') OR _source IS NULL OR coalesce(trim(_reason),'')='' THEN RAISE EXCEPTION 'Thiếu chức vụ hoặc lý do thay đổi.'; END IF;
 IF _source='base' AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements(private.base_config()->'titles') t WHERE t->>'id'=_title) THEN RAISE EXCEPTION 'Chức vụ không tồn tại.'; END IF;
 IF _source='biz' AND NOT EXISTS(SELECT 1 FROM biz_positions p WHERE p.id::text=_title) THEN RAISE EXCEPTION 'Chức vụ Kinh doanh không tồn tại.'; END IF;
 IF jsonb_typeof(_roles) IS DISTINCT FROM 'array' OR jsonb_array_length(_roles)>20 THEN RAISE EXCEPTION 'Danh sách Role không hợp lệ.'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(_roles) x GROUP BY x->>'role_id' HAVING count(*)>1) THEN RAISE EXCEPTION 'Role bị trùng.'; END IF;
 SELECT count(*) INTO n FROM jsonb_array_elements(_roles) x WHERE coalesce((x->>'is_primary')::boolean,false);
 IF jsonb_array_length(_roles)>0 AND n<>1 THEN RAISE EXCEPTION 'Cần chọn đúng một Role chính.'; END IF;
 FOR item IN SELECT value FROM jsonb_array_elements(_roles) LOOP
  IF item->>'role_id' IN ('role-admin','role-super-admin') THEN RAISE EXCEPTION 'Role quản trị không được kế thừa qua chức vụ.'; END IF;
  IF NOT EXISTS(SELECT 1 FROM app_roles WHERE id=item->>'role_id') THEN RAISE EXCEPTION 'Role gốc không tồn tại.'; END IF;
  IF coalesce(item->>'scope_kind','unit') NOT IN ('unit','own') THEN RAISE EXCEPTION 'Phạm vi không hợp lệ.'; END IF;
  IF coalesce((item->>'active')::boolean,false) THEN RAISE EXCEPTION 'Chưa hoàn tất kiểm tra phạm vi; không thể kích hoạt đồng bộ.'; END IF;
 END LOOP;
 PERFORM pg_advisory_xact_lock(hashtext('base_title_roles:'||_source||':'||_title));
 SELECT coalesce(jsonb_agg(jsonb_build_object('role_id',role_id,'is_primary',is_primary,'scope_kind',scope_kind,'revision',revision) ORDER BY role_id),'[]'::jsonb) INTO before_rows FROM base_title_role_links WHERE title_source=_source AND title_id=_title;
 IF before_rows IS DISTINCT FROM _expected THEN RAISE EXCEPTION 'Liên kết Role đã thay đổi; vui lòng tải lại trước khi lưu.'; END IF;
 -- Draft references may be replaced; audit retains their exact before/after and no granted source is removed.
 DELETE FROM base_title_role_links WHERE title_source=_source AND title_id=_title;
 FOR item IN SELECT value FROM jsonb_array_elements(_roles) LOOP
 INSERT INTO base_title_role_links(title_source,title_id,role_id,is_primary,scope_kind,active,revision,reason,updated_by)
 VALUES(_source,_title,item->>'role_id',coalesce((item->>'is_primary')::boolean,false),coalesce(item->>'scope_kind','unit'),false,
 coalesce((SELECT (b->>'revision')::bigint+1 FROM jsonb_array_elements(before_rows)b WHERE b->>'role_id'=item->>'role_id'),1),trim(_reason),auth.uid());
 END LOOP;
 SELECT coalesce(jsonb_agg(jsonb_build_object('role_id',role_id,'is_primary',is_primary,'scope_kind',scope_kind,'revision',revision) ORDER BY role_id),'[]'::jsonb) INTO after_rows FROM base_title_role_links WHERE title_source=_source AND title_id=_title;
 INSERT INTO base_title_role_events(actor_id,title_source,title_id,reason,before_data,after_data) VALUES(auth.uid(),_source,_title,trim(_reason),before_rows,after_rows);
 RETURN jsonb_build_object('links',after_rows,'active',false);
END $$;
REVOKE ALL ON FUNCTION public.base_title_roles_save(text,text,jsonb,jsonb,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.base_title_roles_save(text,text,jsonb,jsonb,text) TO authenticated,service_role;
COMMENT ON TABLE public.base_title_role_links IS 'Draft Role references only. Activation is fenced until per-module scope enforcement is implemented and verified. Never a substitute for direct user_roles or business appointments.';