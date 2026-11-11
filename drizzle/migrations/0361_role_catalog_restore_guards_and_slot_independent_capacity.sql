DO $patch$ DECLARE d text; old_ text; new_ text; BEGIN
 SELECT pg_get_functiondef('private.org_commands(jsonb)'::regprocedure) INTO d;
 old_:='IF title_.capacity>0 AND'; new_:='IF nullif(v->>''slot_id'','''') IS NULL AND title_.capacity>0 AND';
 IF strpos(d,old_)=0 THEN RAISE EXCEPTION 'Capacity contract changed.'; END IF;
 d:=replace(d,old_,new_);
 old_:='AND user_id=(v->>''user_id'')::uuid) THEN RAISE EXCEPTION ''Trùng phân công';
 new_:='AND user_id=(v->>''user_id'')::uuid AND (nullif(v->>''slot_id'','''') IS NULL OR slot_id=v->>''slot_id'')) THEN RAISE EXCEPTION ''Trùng phân công';
 IF strpos(d,old_)=0 THEN RAISE EXCEPTION 'Duplicate assignment contract changed.'; END IF; d:=replace(d,old_,new_);
 old_:='UPDATE org_assignments live SET slot_id=NULL';
 new_:=$guard$IF EXISTS(SELECT 1 FROM org_assignments live JOIN org_position_slots slot ON slot.id=live.slot_id WHERE EXISTS(SELECT 1 FROM jsonb_array_elements(old_.after_data->'position_slots') a WHERE a->>'id'=slot.id) AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(old_.before_data->'position_slots','[]')) b WHERE b->>'id'=slot.id) AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements(old_.after_data->'memberships') original WHERE original->>'id'=live.id AND original->>'slot_id'=slot.id)) THEN RAISE EXCEPTION 'Ô đã có bổ nhiệm mới; không khôi phục đè dữ liệu.'; END IF;
 UPDATE org_assignments live SET slot_id=NULL$guard$;
 IF strpos(d,old_)=0 THEN RAISE EXCEPTION 'Restore contract changed.'; END IF; EXECUTE replace(d,old_,new_);
 END $patch$;
CREATE OR REPLACE FUNCTION public.org_slot_snapshots_read() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$ BEGIN IF NOT private.is_active(auth.uid()) OR NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin xem khôi phục.' USING ERRCODE='42501'; END IF; RETURN (SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'created_at',created_at,'restored_at',restored_at,'slots',(SELECT count(*) FROM jsonb_array_elements(coalesce(after_data->'position_slots','[]')) a WHERE NOT EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(before_data->'position_slots','[]')) b WHERE b->>'id'=a->>'id')))),'[]') FROM private.org_slot_snapshots); END $$;
CREATE OR REPLACE FUNCTION private.role_catalog_system_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF OLD.id='role-super-admin' AND (NEW.permissions IS DISTINCT FROM OLD.permissions OR NEW.name IS DISTINCT FROM OLD.name OR NOT NEW.is_system OR NEW.catalog_state IS DISTINCT FROM OLD.catalog_state OR NEW.role_kind IS DISTINCT FROM OLD.role_kind) THEN RAISE EXCEPTION 'Role Super Admin không được thay đổi qua cổng thông thường.' USING ERRCODE='42501'; END IF;
 IF NEW.role_kind='marketing_task' AND OLD.role_kind IS DISTINCT FROM NEW.role_kind AND private.role_in_use(OLD.id) THEN RAISE EXCEPTION 'Không đổi loại Role đang có nguồn sử dụng.'; END IF;
 RETURN NEW; END $$;
CREATE TRIGGER role_catalog_system_guard BEFORE UPDATE ON public.app_roles FOR EACH ROW EXECUTE FUNCTION private.role_catalog_system_guard();
REVOKE ALL ON FUNCTION private.role_catalog_system_guard() FROM PUBLIC,anon,authenticated,service_role;