ALTER TABLE public.app_roles ADD COLUMN IF NOT EXISTS role_kind text NOT NULL DEFAULT 'position' CHECK (role_kind IN ('position','marketing_task','system'));
ALTER TABLE public.app_roles ADD COLUMN IF NOT EXISTS role_code text;
UPDATE public.app_roles SET role_kind=CASE WHEN id IN ('role-content-web','role-seo','role-local-seo','role-social','role-video') THEN 'marketing_task' WHEN id IN ('role-super-admin','role-admin') THEN 'system' ELSE 'position' END, role_code=id WHERE role_code IS NULL;

CREATE TABLE public.org_position_slots (
 id text PRIMARY KEY, title_id text NOT NULL REFERENCES public.org_titles(id), unit_id text NOT NULL REFERENCES public.org_units(id),
 role_id text NOT NULL REFERENCES public.app_roles(id), name text NOT NULL, active boolean NOT NULL DEFAULT true,
 revision bigint NOT NULL DEFAULT 1, created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.org_position_slots TO authenticated;
GRANT ALL ON public.org_position_slots TO service_role;
ALTER TABLE public.org_position_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_slots_read ON public.org_position_slots FOR SELECT TO authenticated USING (private.is_active(auth.uid()));
ALTER TABLE public.org_assignments ADD COLUMN IF NOT EXISTS slot_id text REFERENCES public.org_position_slots(id);
CREATE INDEX org_assignments_slot_interval ON public.org_assignments(slot_id,starts_at,ends_at) WHERE slot_id IS NOT NULL AND status<>'cancelled';
COMMENT ON COLUMN public.org_assignments.slot_id IS 'Explicit physical position; null means historical/shared-title assignment not yet mapped. Binding never rewrites original dates or business position IDs.';

CREATE TABLE private.role_catalog_previews (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id uuid NOT NULL, action text NOT NULL,
 role_id text NOT NULL, proposed jsonb NOT NULL, before_data jsonb, baseline text NOT NULL,
 expires_at timestamptz NOT NULL DEFAULT now()+interval '10 minutes', applied_at timestamptz
);
CREATE TABLE private.role_catalog_audit (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id uuid, action text NOT NULL, role_id text NOT NULL,
 before_data jsonb, after_data jsonb, reason text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON private.role_catalog_previews,private.role_catalog_audit FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION private.role_catalog_fingerprint() RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT md5(coalesce((SELECT string_agg(to_jsonb(r)::text,'|' ORDER BY id) FROM app_roles r),'')||private.org_fingerprint()||coalesce((SELECT string_agg(to_jsonb(s)::text,'|' ORDER BY id) FROM org_position_slots s),'')||coalesce((SELECT string_agg(to_jsonb(s)::text,'|' ORDER BY user_id,specialty_id) FROM mkt_staff_specialties s),''))
$$;
CREATE OR REPLACE FUNCTION private.role_references(r text) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT jsonb_build_object('positions',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',s.id,'name',s.name,'unit_id',s.unit_id)),'[]') FROM org_position_slots s WHERE s.role_id=r),'titles',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',t.id,'name',t.name)),'[]') FROM base_title_role_links l JOIN org_titles t ON t.id=l.title_id WHERE l.role_id=r),'direct',(SELECT count(*) FROM user_roles WHERE role_id=r),'specialties',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'name',name)),'[]') FROM mkt_specialties WHERE role_id=r))
$$;
CREATE OR REPLACE FUNCTION private.role_in_use(r text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM user_roles WHERE role_id=r) OR EXISTS(SELECT 1 FROM base_title_role_links WHERE role_id=r) OR EXISTS(SELECT 1 FROM mkt_specialties WHERE role_id=r) OR EXISTS(SELECT 1 FROM org_position_slots WHERE role_id=r)
$$;
CREATE OR REPLACE FUNCTION private.role_catalog_record() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
 BEGIN
 INSERT INTO private.role_catalog_audit(actor_id,action,role_id,before_data,after_data,reason)
 VALUES(auth.uid(),TG_OP,CASE WHEN TG_OP='DELETE' THEN OLD.id ELSE NEW.id END,CASE WHEN TG_OP='INSERT' THEN NULL ELSE to_jsonb(OLD) END,CASE WHEN TG_OP='DELETE' THEN NULL ELSE to_jsonb(NEW) END,coalesce(nullif(current_setting('app.role_reason',true),''),'Thay đổi qua cổng Role hiện hành'));
 IF TG_OP='DELETE' THEN RETURN OLD; END IF; RETURN NEW;
 END $$;
CREATE TRIGGER role_catalog_record AFTER INSERT OR UPDATE OR DELETE ON public.app_roles FOR EACH ROW EXECUTE FUNCTION private.role_catalog_record();

CREATE OR REPLACE FUNCTION private.org_position_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
 DECLARE s record;
 BEGIN
 IF TG_TABLE_NAME='org_position_slots' THEN
  IF NOT private.org_execution_ok() OR NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Ô vị trí phải qua xem trước và xác nhận Super Admin.' USING ERRCODE='42501'; END IF;
  IF TG_OP='DELETE' THEN RAISE EXCEPTION 'Không xóa ô vị trí và lịch sử.'; END IF;
  IF NOT EXISTS(SELECT 1 FROM app_roles WHERE id=NEW.role_id AND role_kind='position' AND catalog_state='standard' AND id NOT IN ('role-admin','role-super-admin')) THEN RAISE EXCEPTION 'Ô vị trí chỉ nhận một Role vị trí chuẩn.'; END IF;
  IF TG_OP='UPDATE' AND (NEW.role_id<>OLD.role_id OR NEW.title_id<>OLD.title_id OR NEW.unit_id<>OLD.unit_id) AND EXISTS(SELECT 1 FROM org_assignments WHERE slot_id=OLD.id) THEN RAISE EXCEPTION 'Ô đã sử dụng: cần đối chiếu nguồn quyền trước khi đổi Role hoặc đơn vị.'; END IF;
  RETURN NEW;
 END IF;
 IF NEW.slot_id IS NULL THEN RETURN NEW; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('org-slot:'||NEW.slot_id));
 SELECT * INTO s FROM org_position_slots WHERE id=NEW.slot_id FOR UPDATE;
 IF s.id IS NULL OR s.title_id IS DISTINCT FROM NEW.title_id OR s.unit_id IS DISTINCT FROM NEW.unit_id THEN RAISE EXCEPTION 'Ô vị trí không khớp chức danh/đơn vị.'; END IF;
 IF (TG_OP='INSERT' OR OLD.slot_id IS DISTINCT FROM NEW.slot_id) AND NOT s.active THEN RAISE EXCEPTION 'Ô vị trí đã ngừng sử dụng.'; END IF;
 IF NEW.status<>'cancelled' AND EXISTS(SELECT 1 FROM org_assignments a WHERE a.id<>NEW.id AND a.slot_id=NEW.slot_id AND a.status<>'cancelled' AND tstzrange(a.starts_at,a.ends_at,'[)')&&tstzrange(NEW.starts_at,NEW.ends_at,'[)')) THEN RAISE EXCEPTION 'Ô vị trí đã có bổ nhiệm chồng thời gian.' USING ERRCODE='23P01'; END IF;
 RETURN NEW;
 END $$;
CREATE TRIGGER org_position_slots_guard BEFORE INSERT OR UPDATE OR DELETE ON public.org_position_slots FOR EACH ROW EXECUTE FUNCTION private.org_position_guard();
CREATE TRIGGER org_assignment_slot_guard BEFORE INSERT OR UPDATE ON public.org_assignments FOR EACH ROW EXECUTE FUNCTION private.org_position_guard();

CREATE OR REPLACE FUNCTION public.role_catalog_read() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
 DECLARE c jsonb;
 BEGIN
 IF NOT private.is_active(auth.uid()) OR NOT (private.is_super_admin(auth.uid()) OR private.has_permission(auth.uid(),'settings.role') OR private.has_permission(auth.uid(),'settings.permission')) THEN RAISE EXCEPTION 'Không có quyền xem Role.' USING ERRCODE='42501'; END IF;
 c:=private.org_config();
 RETURN jsonb_build_object('server_now',now(),'roles',(SELECT coalesce(jsonb_agg(to_jsonb(r)||jsonb_build_object('references',private.role_references(r.id),'receivers',(SELECT count(DISTINCT a.user_id) FROM org_assignments a JOIN base_title_role_links l ON l.title_id=a.title_id WHERE l.role_id=r.id AND a.status='active' AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())),'permission_checks',(SELECT coalesce(jsonb_agg(jsonb_build_object('key',p,'ready',private.org_role_permission_ready(p),'reason',private.org_role_audit_reason(p))),'[]') FROM unnest(r.permissions)p)) ORDER BY r.name),'[]') FROM app_roles r),
 'slots',(SELECT coalesce(jsonb_agg(to_jsonb(s) ORDER BY s.name),'[]') FROM org_position_slots s),
 'mapping',(SELECT coalesce(jsonb_agg(jsonb_build_object('title_id',t.id,'title_name',t.name,'unit_id',t.unit_id,'active',t.active,'roles',(SELECT coalesce(jsonb_agg(l.role_id),'[]') FROM base_title_role_links l WHERE l.title_id=t.id),'unmapped_assignments',(SELECT count(*) FROM org_assignments a WHERE a.title_id=t.id AND a.slot_id IS NULL AND a.status='active' AND (a.ends_at IS NULL OR a.ends_at>now())))),'[]') FROM org_titles t WHERE t.active),
 'unmapped',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',a.id,'title_id',a.title_id,'title_name',t.name,'unit_id',a.unit_id,'unit_name',u.name,'user_id',a.user_id,'user_name',p.full_name,'starts_at',a.starts_at,'ends_at',a.ends_at,'source',a.source,'category',a.category) ORDER BY t.name,u.name,a.user_id),'[]') FROM org_assignments a LEFT JOIN org_titles t ON t.id=a.title_id JOIN org_units u ON u.id=a.unit_id JOIN profiles p ON p.id=a.user_id WHERE a.slot_id IS NULL AND a.status='active' AND (a.ends_at IS NULL OR a.ends_at>now())),
 'direct_count',(SELECT count(*) FROM user_roles),'override_rows',(SELECT count(*) FROM user_permission_overrides),
 'audit',CASE WHEN private.is_super_admin(auth.uid()) THEN (SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'role_id',role_id,'action',action,'reason',reason,'created_at',created_at)),'[]') FROM (SELECT * FROM private.role_catalog_audit ORDER BY created_at DESC LIMIT 50)x) ELSE '[]'::jsonb END);
 END $$;

CREATE OR REPLACE FUNCTION public.role_catalog_change(_phase text,_action text DEFAULT NULL,_role_id text DEFAULT NULL,_proposed jsonb DEFAULT NULL,_preview uuid DEFAULT NULL,_confirmation text DEFAULT NULL,_reason text DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
 DECLARE p record; r record; proposal jsonb; before_ jsonb; id_ text; affected_ jsonb;
 BEGIN
 IF NOT private.is_active(auth.uid()) OR NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin quản trị kho Role.' USING ERRCODE='42501'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('canonical_org'));
 LOCK TABLE app_roles,user_roles,base_title_role_links,org_assignments,org_position_slots,mkt_specialties,mkt_staff_specialties IN SHARE ROW EXCLUSIVE MODE;
 IF _phase='preview' THEN
  IF _action NOT IN ('create','edit','archive','delete') THEN RAISE EXCEPTION 'Thao tác Role không hợp lệ.'; END IF;
  id_:=CASE WHEN _action='create' THEN 'role-custom-'||gen_random_uuid()::text ELSE _role_id END;
  SELECT * INTO r FROM app_roles WHERE id=id_; before_:=to_jsonb(r);
  IF _action<>'create' AND r.id IS NULL THEN RAISE EXCEPTION 'Role không tồn tại.'; END IF;
  IF _action IN ('archive','delete') AND r.is_system THEN RAISE EXCEPTION 'Role hệ thống không được ngừng hoặc xóa.'; END IF;
  IF _action='delete' AND private.role_in_use(id_) THEN RAISE EXCEPTION 'Role còn liên kết vị trí, nhiệm vụ hoặc nguồn trực tiếp; không được xóa.'; END IF;
  IF _action='archive' AND private.role_in_use(id_) THEN RAISE EXCEPTION 'Role đang được sử dụng; cần nguồn thay thế đã xác nhận trước khi ngừng.'; END IF;
  proposal:=coalesce(_proposed,'{}');
  IF _action IN ('create','edit') THEN
   IF coalesce(trim(proposal->>'name'),'')='' OR proposal->>'role_kind' NOT IN ('position','marketing_task','system') OR jsonb_typeof(proposal->'permissions') IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Tên, loại và permission Role không hợp lệ.'; END IF;
   IF _action='create' AND proposal->>'role_kind'='system' THEN RAISE EXCEPTION 'Không tạo Role đặc quyền qua kho thông thường.'; END IF;
   IF _action='edit' AND proposal->>'role_kind'<>r.role_kind AND private.role_in_use(id_) THEN RAISE EXCEPTION 'Không đổi loại Role đang sử dụng.'; END IF;
   IF _action='edit' AND r.is_system AND (proposal->>'name'<>r.name OR proposal->>'role_kind'<>r.role_kind OR (id_='role-super-admin' AND proposal->'permissions' IS DISTINCT FROM to_jsonb(r.permissions))) THEN RAISE EXCEPTION 'Không thay đổi Role hệ thống được bảo vệ.'; END IF;
   IF EXISTS(SELECT 1 FROM jsonb_array_elements_text(proposal->'permissions') k WHERE NOT EXISTS(SELECT 1 FROM base_permission_catalog b WHERE b.key=k) AND NOT (_action='edit' AND k=ANY(r.permissions))) THEN RAISE EXCEPTION 'Permission chưa có trong danh mục backend.'; END IF;
   IF EXISTS(SELECT 1 FROM app_roles ar WHERE ar.id<>id_ AND ar.catalog_state='standard' AND lower(trim(ar.name))=lower(trim(proposal->>'name'))) THEN RAISE EXCEPTION 'Tên Role đã tồn tại.'; END IF;
  END IF;
  affected_:=(SELECT coalesce(jsonb_agg(DISTINCT a.user_id),'[]') FROM org_assignments a JOIN base_title_role_links l ON l.title_id=a.title_id WHERE l.role_id=id_ AND a.status='active' AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now()));
  INSERT INTO private.role_catalog_previews(actor_id,action,role_id,proposed,before_data,baseline) VALUES(auth.uid(),_action,id_,proposal,before_,private.role_catalog_fingerprint()) RETURNING * INTO p;
  RETURN jsonb_build_object('id',p.id,'action',_action,'role_id',id_,'before',before_,'after',proposal,'affected_users',affected_,'references',private.role_references(id_),'added',(SELECT coalesce(jsonb_agg(k),'[]') FROM jsonb_array_elements_text(coalesce(proposal->'permissions','[]')) k WHERE NOT k=ANY(coalesce(r.permissions,'{}'))),'removed',(SELECT coalesce(jsonb_agg(k),'[]') FROM unnest(coalesce(r.permissions,'{}')) k WHERE NOT coalesce(proposal->'permissions','[]') ? k),'expires_at',p.expires_at);
 ELSIF _phase='apply' THEN
  SELECT * INTO p FROM private.role_catalog_previews WHERE id=_preview AND actor_id=auth.uid() FOR UPDATE;
  IF p.id IS NULL OR p.applied_at IS NOT NULL OR p.expires_at<=clock_timestamp() OR p.baseline<>private.role_catalog_fingerprint() THEN RAISE EXCEPTION 'Xem trước hết hạn hoặc nguồn đã thay đổi.'; END IF;
  IF _confirmation IS DISTINCT FROM 'ÁP DỤNG ROLE' OR coalesce(trim(_reason),'')='' THEN RAISE EXCEPTION 'Cần xác nhận ÁP DỤNG ROLE và lý do.'; END IF;
  PERFORM set_config('app.role_reason',trim(_reason),true); proposal:=p.proposed;
  IF p.action='create' THEN
   INSERT INTO app_roles(id,name,description,permissions,is_system,catalog_state,catalog_group,role_kind,role_code,signal_scope_all,signal_scope) VALUES(p.role_id,trim(proposal->>'name'),coalesce(proposal->>'description',''),ARRAY(SELECT DISTINCT jsonb_array_elements_text(proposal->'permissions')),false,'standard',CASE WHEN proposal->>'role_kind'='marketing_task' THEN 'Nhiệm vụ Marketing' ELSE coalesce(proposal->>'catalog_group','Vận hành') END,proposal->>'role_kind',p.role_id,coalesce((proposal->>'signal_scope_all')::boolean,false),ARRAY(SELECT jsonb_array_elements_text(coalesce(proposal->'signal_scope','[]'))));
  ELSIF p.action='edit' THEN
   UPDATE app_roles SET name=trim(proposal->>'name'),description=coalesce(proposal->>'description',''),permissions=ARRAY(SELECT DISTINCT jsonb_array_elements_text(proposal->'permissions')),role_kind=proposal->>'role_kind',catalog_group=CASE WHEN proposal->>'role_kind'='marketing_task' THEN 'Nhiệm vụ Marketing' ELSE coalesce(proposal->>'catalog_group',catalog_group) END,signal_scope_all=coalesce((proposal->>'signal_scope_all')::boolean,signal_scope_all),signal_scope=CASE WHEN proposal ? 'signal_scope' THEN ARRAY(SELECT jsonb_array_elements_text(proposal->'signal_scope')) ELSE signal_scope END,updated_at=now() WHERE id=p.role_id;
  ELSIF p.action='archive' THEN
   IF private.role_in_use(p.role_id) THEN RAISE EXCEPTION 'Role vẫn còn liên kết.'; END IF;
   UPDATE app_roles SET catalog_state='archived',updated_at=now() WHERE id=p.role_id;
  ELSIF p.action='delete' THEN
   IF private.role_in_use(p.role_id) THEN RAISE EXCEPTION 'Role vẫn còn liên kết.'; END IF;
   DELETE FROM app_roles WHERE id=p.role_id;
  END IF;
  UPDATE private.role_catalog_previews SET applied_at=clock_timestamp() WHERE id=p.id;
  RETURN jsonb_build_object('role_id',p.role_id,'action',p.action);
 END IF;
 RAISE EXCEPTION 'Giai đoạn không hợp lệ.';
 END $$;

DO $patch$ DECLARE d text; marker text; branch text; BEGIN
 SELECT pg_get_functiondef('private.org_commands(jsonb)'::regprocedure) INTO d;
 marker:='IF x->>''action''=''unit'' THEN';
 branch:=$branch$IF x->>'action'='slot' THEN
 IF NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin tạo ô vị trí.'; END IF;
 PERFORM private.org_require('org.manage_structure',v->>'unit_id');
 IF NOT EXISTS(SELECT 1 FROM org_titles WHERE id=v->>'title_id' AND active AND (unit_id IS NULL OR unit_id=v->>'unit_id')) OR coalesce(trim(v->>'name'),'')='' THEN RAISE EXCEPTION 'Chức danh/đơn vị ô vị trí không hợp lệ.'; END IF;
 INSERT INTO org_position_slots(id,title_id,unit_id,role_id,name,active,created_by) VALUES(id_,v->>'title_id',v->>'unit_id',v->>'role_id',trim(v->>'name'),coalesce((v->>'active')::boolean,true),auth.uid()) ON CONFLICT(id) DO UPDATE SET name=excluded.name,active=excluded.active,revision=org_position_slots.revision+1;
 affected:=affected||jsonb_build_array(v->>'unit_id');
 ELSIF x->>'action'='bind_slot' THEN
 IF NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin chuyển ô vị trí.'; END IF;
 SELECT * INTO old_ FROM org_assignments WHERE id=id_ FOR UPDATE;
 IF old_.id IS NULL OR old_.slot_id IS NOT NULL THEN RAISE EXCEPTION 'Phân công đã chuyển hoặc không tồn tại.'; END IF;
 PERFORM private.org_require('org.manage_structure',old_.unit_id);
 IF NOT EXISTS(SELECT 1 FROM org_position_slots s JOIN base_title_role_links l ON l.title_id=old_.title_id AND l.role_id=s.role_id WHERE s.id=v->>'slot_id' AND s.unit_id=old_.unit_id AND s.title_id=old_.title_id) OR (SELECT count(*) FROM base_title_role_links WHERE title_id=old_.title_id)<>1 THEN RAISE EXCEPTION 'Chuyển ô chỉ giữ đúng Role hiện tại; mapping khác cần đối chiếu quyền.'; END IF;
 UPDATE org_assignments SET slot_id=v->>'slot_id',data=jsonb_set(data,'{slot_id}',to_jsonb(v->>'slot_id')),revision=revision+1 WHERE id=id_;
 affected:=affected||jsonb_build_array(old_.unit_id);
 ELSIF x->>'action'='unit' THEN$branch$;
 IF strpos(d,marker)=0 THEN RAISE EXCEPTION 'Không tìm thấy điểm mở rộng org_commands.'; END IF;
 EXECUTE replace(d,marker,branch);
 END $patch$;

DO $patch$ DECLARE d text; marker text; BEGIN
 SELECT pg_get_functiondef('private.org_config()'::regprocedure) INTO d;
 marker:='private.org_role_previous_org_config()';
 IF strpos(d,marker)=0 THEN RAISE EXCEPTION 'org_config không khớp phiên bản kiểm kê.'; END IF;
 EXECUTE replace(d,marker,marker||'||jsonb_build_object(''position_slots'',(SELECT coalesce(jsonb_agg(to_jsonb(s) ORDER BY id),''[]'') FROM public.org_position_slots s))');
 END $patch$;

REVOKE ALL ON FUNCTION private.role_catalog_fingerprint(),private.role_references(text),private.role_in_use(text),private.role_catalog_record(),private.org_position_guard() FROM PUBLIC,anon,authenticated,service_role;
REVOKE ALL ON FUNCTION public.role_catalog_read(),public.role_catalog_change(text,text,text,jsonb,uuid,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.role_catalog_read(),public.role_catalog_change(text,text,text,jsonb,uuid,text,text) TO authenticated;
