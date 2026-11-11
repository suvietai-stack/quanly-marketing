DO $patch$ DECLARE d text; needle text; branch text; BEGIN SELECT pg_get_functiondef('private.org_commands(jsonb)'::regprocedure) INTO d; needle:='IF x->>''action''=''restore_slots'' THEN'; branch:=$branch$IF x->>'action'='replace_slot_role' THEN
 IF NOT private.is_super_admin(auth.uid()) OR NOT private.org_execution_ok() THEN RAISE EXCEPTION 'Thay Role phải qua xem trước Super Admin.' USING ERRCODE='42501'; END IF;
 SELECT * INTO old_ FROM org_position_slots WHERE id=id_ AND active FOR UPDATE; IF old_.id IS NULL THEN RAISE EXCEPTION 'Ô không tồn tại hoặc đã ngừng.'; END IF;
 IF NOT EXISTS(SELECT 1 FROM app_roles WHERE id=v->>'role_id' AND role_kind='position' AND catalog_state='standard' AND NOT is_system) THEN RAISE EXCEPTION 'Role thay thế không hợp lệ.'; END IF;
 IF EXISTS(SELECT 1 FROM org_assignments WHERE slot_id=id_ AND status='active' AND starts_at>=now()) THEN RAISE EXCEPTION 'Ô có bổ nhiệm tương lai; cần đối chiếu riêng trước khi thay Role.'; END IF;
 expected_:=to_jsonb(old_); parent_:=gen_random_uuid()::text;
 affected:=affected||private.org_commands(jsonb_build_array(jsonb_build_object('action','slot','data',jsonb_build_object('id',parent_,'title_id',old_.title_id,'unit_id',old_.unit_id,'role_id',v->>'role_id','name',old_.name||' · phiên bản mới'))));
 FOR before_ IN SELECT to_jsonb(a) FROM org_assignments a WHERE slot_id=id_ AND status='active' AND starts_at<now() AND (ends_at IS NULL OR ends_at>now()) LOOP
 after_:=coalesce(before_->'data','{}')||jsonb_build_object('id',gen_random_uuid()::text,'unit_id',before_->>'unit_id','title_id',before_->>'title_id','user_id',before_->>'user_id','category',before_->>'category','kind',CASE WHEN before_->>'category'='concurrent' THEN 'concurrent' ELSE 'primary' END,'starts_at',now(),'ends_at',before_->'ends_at','slot_id',parent_,'immediate',true);
 affected:=affected||private.org_commands(jsonb_build_array(jsonb_build_object('action','end','data',jsonb_build_object('id',before_->>'id','ends_at',now(),'immediate',true)),jsonb_build_object('action','assign','data',after_)));
 END LOOP;
 UPDATE org_position_slots SET active=false,revision=revision+1 WHERE id=id_;
 affected:=affected||jsonb_build_array(expected_->>'unit_id');
 ELSIF x->>'action'='restore_slots' THEN$branch$;
 IF strpos(d,needle)=0 THEN RAISE EXCEPTION 'Slot replacement command contract changed'; END IF; EXECUTE replace(d,needle,branch); END $patch$;
-- Include assignment-specific task sources in the shared read model, preserving distinct source IDs.
DO $patch$ DECLARE d text; BEGIN SELECT pg_get_functiondef('private.role_source_rows(jsonb)'::regprocedure) INTO d; EXECUTE replace(d,'FUNCTION private.role_source_rows(','FUNCTION private.slot_previous_source_rows('); END $patch$;
CREATE OR REPLACE FUNCTION private.role_source_rows(c jsonb) RETURNS TABLE(user_id uuid,role_id text,source_kind text,source_id text,unit_id text,legacy boolean,eligible boolean,scope text,permissions text[]) LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT * FROM private.slot_previous_source_rows(c)
 UNION ALL
 SELECT (m->>'user_id')::uuid,r.id,'task',m->>'id'||':'||s.id,m->>'unit_id',true,private.org_marketing_eligible((m->>'user_id')::uuid,c),'native',ARRAY(SELECT p FROM unnest(r.permissions) p WHERE private.org_role_permission_ready(p))
 FROM jsonb_array_elements(coalesce(c->'memberships','[]')) m CROSS JOIN LATERAL jsonb_array_elements_text(coalesce(m->'specialty_ids','[]')) sid JOIN mkt_specialties s ON s.id=sid AND s.active JOIN app_roles r ON r.id=s.role_id
 WHERE private.is_active((m->>'user_id')::uuid) AND private.base_valid_at(m) AND m->>'status'='active' AND m->'specialty_signatures'->>s.id=md5(coalesce(r.permissions,'{}')::text) $$;
REVOKE ALL ON FUNCTION private.slot_previous_source_rows(jsonb) FROM PUBLIC,anon,authenticated,service_role;
-- All slot-derived signal scopes come from the slot Role, not title links. Unmapped legacy scopes stay compatible.
DO $patch$ DECLARE d text; BEGIN SELECT pg_get_functiondef('private.sig_scope_ok(uuid,text[])'::regprocedure) INTO d;
 d:=replace(d,'JOIN public.base_title_role_links l ON l.title_id = a.title_id','JOIN public.base_title_role_links l ON l.title_id = a.title_id AND a.slot_id IS NULL');
 d:=replace(d,'SELECT _uid IS NOT NULL AND (','SELECT _uid IS NOT NULL AND (EXISTS(SELECT 1 FROM private.role_source_rows(private.base_config()) source JOIN app_roles role ON role.id=source.role_id WHERE source.user_id=_uid AND source.source_kind=''slot'' AND EXISTS(SELECT 1 FROM unnest(source.permissions) p WHERE p LIKE ''signal.%'') AND (role.signal_scope_all OR EXISTS(SELECT 1 FROM unnest(coalesce(_groups,''{}'')) g WHERE g=ANY(role.signal_scope) OR (g LIKE ''Khác:%'' AND ''Khác''=ANY(role.signal_scope))))) OR ');
 EXECUTE d; END $patch$;