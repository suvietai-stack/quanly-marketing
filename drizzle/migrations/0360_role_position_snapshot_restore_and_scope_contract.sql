CREATE TABLE private.org_slot_snapshots(id uuid PRIMARY KEY, actor_id uuid NOT NULL, preview_id uuid NOT NULL, before_data jsonb NOT NULL, after_data jsonb NOT NULL, role_data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), restored_at timestamptz);
REVOKE ALL ON private.org_slot_snapshots FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION private.org_slot_snapshot_record() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
 BEGIN
 IF NEW.before_data->'position_slots' IS DISTINCT FROM NEW.after_data->'position_slots' THEN
 INSERT INTO private.org_slot_snapshots(id,actor_id,preview_id,before_data,after_data,role_data)
 SELECT NEW.id,NEW.actor_id,e.preview_id,NEW.before_data,NEW.after_data,(SELECT jsonb_agg(to_jsonb(r) ORDER BY r.id) FROM app_roles r)
 FROM private.org_execution e WHERE e.transaction_id=txid_current() AND e.actor_id=auth.uid();
 END IF; RETURN NEW;
 END $$;
CREATE TRIGGER org_slot_snapshot_record AFTER INSERT ON public.org_events FOR EACH ROW EXECUTE FUNCTION private.org_slot_snapshot_record();

CREATE OR REPLACE FUNCTION private.org_permission_unit_member(u uuid,target uuid,permission_ text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT private.is_active(u) AND private.has_permission(u,permission_) AND EXISTS(
 SELECT 1 FROM jsonb_array_elements(private.org_role_rules(u,private.base_config())) rule
 JOIN org_assignments a ON a.id=rule->>'source_id' AND a.user_id=u
 JOIN org_assignments b ON b.user_id=target AND b.status='active' AND b.starts_at<=now() AND (b.ends_at IS NULL OR b.ends_at>now())
 WHERE rule->>'permission'=permission_ AND a.status='active' AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())
 AND private.base_role_unit_contains(private.base_config(),a.unit_id,b.unit_id))
 $$;
-- Existing unit-visibility rules now bind the permission and unit to the same appointment.
CREATE OR REPLACE FUNCTION private.leave_unit_visible(u uuid,owner uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT private.org_permission_unit_member(u,owner,'leave.view_unit') $$;
DO $patch$ DECLARE d text; BEGIN
 SELECT pg_get_functiondef('private.fin_can_see(uuid,uuid)'::regprocedure) INTO d;
 IF strpos(d,'private.base_unit_member(_uid, t.claimed_by)')=0 THEN RAISE EXCEPTION 'Finance scope contract changed.'; END IF;
 EXECUTE replace(d,'private.base_unit_member(_uid, t.claimed_by)','private.org_permission_unit_member(_uid, t.claimed_by,''finance.incoming.view_unit'')');
 SELECT pg_get_functiondef('private.ot_can_view(uuid,uuid)'::regprocedure) INTO d;
 IF strpos(d,'private.base_unit_member(_uid, o.sale_id)')=0 THEN RAISE EXCEPTION 'Order scope contract changed.'; END IF;
 d:=replace(d,'private.base_unit_member(_uid, o.sale_id)','private.org_permission_unit_member(_uid, o.sale_id,''ot.view_unit'')');
 EXECUTE replace(d,'private.base_unit_member(_uid, o.supply_id)','private.org_permission_unit_member(_uid, o.supply_id,''ot.view_unit'')');
 END $patch$;

CREATE OR REPLACE FUNCTION private.org_marketing_eligible(u uuid,c jsonb) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT private.is_active(u) AND EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(c->'memberships','[]')) m JOIN LATERAL jsonb_array_elements(coalesce(c->'titles','[]')) t ON t->>'id'=m->>'title_id' WHERE m->>'user_id'=u::text AND private.base_valid_at(m) AND coalesce(m->>'status','active')='active' AND coalesce((t->>'active')::boolean,false) AND EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(c->'units','[]')) b WHERE b->>'kind'='block' AND b->>'name'='Khối Marketing' AND private.base_role_unit_contains(c,b->>'id',m->>'unit_id')))
 $$;
CREATE OR REPLACE FUNCTION public.marketing_task_eligibility(_target uuid) RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF NOT private.is_active(auth.uid()) OR NOT (auth.uid()=_target OR private.is_super_admin(auth.uid()) OR private.has_permission(auth.uid(),'settings.user_view')) THEN RAISE EXCEPTION 'Không có quyền xem nhiệm vụ.' USING ERRCODE='42501'; END IF;
 RETURN private.org_marketing_eligible(_target,private.base_config()); END $$;
-- Keep current historical specialty rights during conversion. New task grants are fenced now;
-- disabling historical rights requires a separate verified conversion confirmation.
CREATE OR REPLACE FUNCTION private.mkt_task_assignment_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF NEW.state='active' AND (TG_OP='INSERT' OR OLD.state IS DISTINCT FROM NEW.state) AND EXISTS(SELECT 1 FROM mkt_specialties s JOIN app_roles r ON r.id=s.role_id WHERE s.id=NEW.specialty_id AND r.role_kind='marketing_task') AND NOT private.org_marketing_eligible(NEW.user_id,private.base_config()) THEN RAISE EXCEPTION 'Chỉ nhân sự có bổ nhiệm Marketing hiệu lực được cấp nhiệm vụ.' USING ERRCODE='42501'; END IF; RETURN NEW; END $$;
CREATE TRIGGER mkt_task_assignment_guard BEFORE INSERT OR UPDATE ON public.mkt_staff_specialties FOR EACH ROW EXECUTE FUNCTION private.mkt_task_assignment_guard();
CREATE OR REPLACE FUNCTION private.direct_task_role_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF EXISTS(SELECT 1 FROM app_roles WHERE id=NEW.role_id AND role_kind='marketing_task') THEN RAISE EXCEPTION 'Role nhiệm vụ phải cấp trong hồ sơ Marketing, không gán trực tiếp.' USING ERRCODE='42501'; END IF; RETURN NEW; END $$;
CREATE TRIGGER direct_task_role_guard BEFORE INSERT OR UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION private.direct_task_role_guard();

-- Slotted rights use the slot's Role, never a different title link. Legacy unmapped sources remain unchanged.
DO $patch$ DECLARE d text; needle text; BEGIN
 SELECT pg_get_functiondef('private.org_role_rules(uuid,jsonb)'::regprocedure) INTO d;
 needle:='AND p=ANY(r.permissions)';
 IF strpos(d,needle)=0 THEN RAISE EXCEPTION 'Appointment resolver contract changed.'; END IF;
 EXECUTE replace(d,needle,'AND (nullif(m->>''slot_id'','''') IS NULL OR EXISTS(SELECT 1 FROM org_position_slots slot WHERE slot.id=m->>''slot_id'' AND slot.role_id=r.id AND slot.unit_id=m->>''unit_id'' AND slot.title_id=m->>''title_id'' AND slot.active)) '||needle);
 END $patch$;

-- Extend the existing organization command path, without a second organization writer.
DO $patch$ DECLARE d text; needle text; replacement_ text; BEGIN
 SELECT pg_get_functiondef('private.org_commands(jsonb)'::regprocedure) INTO d;
 needle:='IF x->>''action''=''slot'' THEN';
 replacement_:=$branch$IF x->>'action'='restore_slots' THEN
 IF NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin khôi phục chuyển ô.'; END IF;
 SELECT * INTO old_ FROM private.org_slot_snapshots WHERE id=id_::uuid FOR UPDATE;
 IF old_.id IS NULL OR old_.restored_at IS NOT NULL THEN RAISE EXCEPTION 'Snapshot không tồn tại hoặc đã khôi phục.'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(old_.after_data->'memberships') a JOIN org_assignments live ON live.id=a->>'id' WHERE a->>'slot_id' IS DISTINCT FROM (SELECT b->>'slot_id' FROM jsonb_array_elements(old_.before_data->'memberships') b WHERE b->>'id'=a->>'id') AND (live.slot_id IS DISTINCT FROM a->>'slot_id' OR live.starts_at IS DISTINCT FROM (a->>'starts_at')::timestamptz OR live.ends_at IS DISTINCT FROM nullif(a->>'ends_at','')::timestamptz)) THEN RAISE EXCEPTION 'Bổ nhiệm đã thay đổi; không ghi đè khi khôi phục.'; END IF;
 UPDATE org_assignments live SET slot_id=NULL,data=data-'slot_id',revision=revision+1 WHERE EXISTS(SELECT 1 FROM jsonb_array_elements(old_.after_data->'memberships') a WHERE a->>'id'=live.id AND a->>'slot_id'=live.slot_id) AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements(old_.before_data->'memberships') b WHERE b->>'id'=live.id AND nullif(b->>'slot_id','') IS NOT NULL);
 UPDATE org_position_slots slot SET active=false,revision=revision+1 WHERE EXISTS(SELECT 1 FROM jsonb_array_elements(old_.after_data->'position_slots') a WHERE a->>'id'=slot.id) AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(old_.before_data->'position_slots','[]')) b WHERE b->>'id'=slot.id);
 UPDATE private.org_slot_snapshots SET restored_at=now() WHERE id=old_.id;
 affected:=affected||jsonb_build_array('org-company');
 ELSIF x->>'action'='slot' THEN$branch$;
 IF strpos(d,needle)=0 THEN RAISE EXCEPTION 'Slot command contract changed.'; END IF; d:=replace(d,needle,replacement_);
 needle:='INSERT INTO org_assignments(id,unit_id,title_id,user_id,category,starts_at,ends_at,source,source_id,data) VALUES(id_,unit_.id,title_.id,(v->>''user_id'')::uuid,category_,at_,end_,src_,id_,v);';
 replacement_:=$branch$IF EXISTS(SELECT 1 FROM org_position_slots WHERE unit_id=unit_.id AND title_id=title_.id AND active) AND nullif(v->>'slot_id','') IS NULL THEN RAISE EXCEPTION 'Chọn một ô vị trí còn trống.'; END IF;
 INSERT INTO org_assignments(id,unit_id,title_id,user_id,category,starts_at,ends_at,source,source_id,data,slot_id) VALUES(id_,unit_.id,title_.id,(v->>'user_id')::uuid,category_,at_,end_,src_,id_,v,nullif(v->>'slot_id',''));$branch$;
 IF strpos(d,needle)=0 THEN RAISE EXCEPTION 'Assignment command contract changed.'; END IF; EXECUTE replace(d,needle,replacement_);
 END $patch$;

CREATE OR REPLACE FUNCTION public.org_slot_snapshots_read() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$ BEGIN IF NOT private.is_active(auth.uid()) OR NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin xem khôi phục.' USING ERRCODE='42501'; END IF; RETURN (SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'created_at',created_at,'restored_at',restored_at)),'[]') FROM private.org_slot_snapshots); END $$;
CREATE OR REPLACE FUNCTION public.app_role_delete_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF OLD.is_system OR private.role_in_use(OLD.id) THEN RAISE EXCEPTION 'Role còn nguồn sử dụng; hãy chuyển đổi trước khi xóa.' USING ERRCODE='23503'; END IF; RETURN OLD; END $$;
REVOKE ALL ON FUNCTION private.org_slot_snapshot_record(),private.org_permission_unit_member(uuid,uuid,text),private.org_marketing_eligible(uuid,jsonb),private.mkt_task_assignment_guard(),private.direct_task_role_guard() FROM PUBLIC,anon,authenticated,service_role;
REVOKE ALL ON FUNCTION public.marketing_task_eligibility(uuid),public.org_slot_snapshots_read() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.marketing_task_eligibility(uuid),public.org_slot_snapshots_read() TO authenticated;