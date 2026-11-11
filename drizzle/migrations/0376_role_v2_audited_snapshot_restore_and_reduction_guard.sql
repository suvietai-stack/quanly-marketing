CREATE OR REPLACE FUNCTION private.role_v2_reduction_guard(role_id_ text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $guard$ BEGIN IF EXISTS(SELECT 1 FROM public.leave_requests l JOIN private.role_source_rows(private.base_config()) s ON s.user_id=l.approver_id WHERE s.role_id=role_id_ AND (l.status='pending' OR (l.cancel_state IS NOT NULL AND l.cancel_state NOT IN ('approved','rejected','cancelled','recalled')))) THEN RAISE EXCEPTION 'Còn trách nhiệm duyệt đơn chưa xử lý; dừng giảm quyền Role.' USING ERRCODE='42501'; END IF; END $guard$;
REVOKE ALL ON FUNCTION private.role_v2_reduction_guard(text) FROM PUBLIC,anon,authenticated;
DO $patch$ DECLARE d text; BEGIN SELECT pg_get_functiondef('public.role_catalog_change(text,text,text,jsonb,uuid,text,text)'::regprocedure) INTO d; IF md5(d)<>'d1b1248447281e92e3a5418bfedf3cf1' THEN RAISE EXCEPTION 'Role writer changed; review instead of overwriting'; END IF; d:=replace(d,'mkt_specialties,mkt_staff_specialties IN SHARE ROW EXCLUSIVE MODE;','mkt_specialties,mkt_staff_specialties,leave_requests IN SHARE ROW EXCLUSIVE MODE;'); d:=replace(d,$old$proposal:=coalesce(_proposed,'{}');$old$,$new$proposal:=coalesce(_proposed,'{}'); IF _action='edit' AND (r.is_system OR r.id IN ('role-admin','role-super-admin')) AND proposal->'permissions' IS DISTINCT FROM to_jsonb(r.permissions) THEN RAISE EXCEPTION 'Role hệ thống được bảo vệ.' USING ERRCODE='42501'; END IF;$new$); d:=replace(d,$old$affected_:=(SELECT$old$,$new$IF _action='edit' AND r.catalog_generation>=2 AND EXISTS(SELECT 1 FROM unnest(r.permissions) k WHERE NOT coalesce(proposal->'permissions','[]') ? k) THEN PERFORM private.role_v2_reduction_guard(id_); END IF; affected_:=(SELECT$new$); d:=replace(d,$old$ELSIF p.action='edit' THEN
   UPDATE$old$,$new$ELSIF p.action='edit' THEN
   SELECT * INTO r FROM app_roles WHERE id=p.role_id;
   IF (r.is_system OR r.id IN ('role-admin','role-super-admin')) AND proposal->'permissions' IS DISTINCT FROM to_jsonb(r.permissions) THEN RAISE EXCEPTION 'Role hệ thống được bảo vệ.' USING ERRCODE='42501'; END IF;
   IF r.catalog_generation>=2 AND EXISTS(SELECT 1 FROM unnest(r.permissions) k WHERE NOT coalesce(proposal->'permissions','[]') ? k) THEN PERFORM private.role_v2_reduction_guard(p.role_id); END IF;
   UPDATE$new$); IF strpos(d,'private.role_v2_reduction_guard(p.role_id)')=0 THEN RAISE EXCEPTION 'Writer patch mismatch'; END IF; EXECUTE d; END $patch$;
CREATE OR REPLACE FUNCTION public.role_catalog_restore(_phase text,_audit uuid DEFAULT NULL,_preview uuid DEFAULT NULL,_confirmation text DEFAULT NULL,_reason text DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $restore$
DECLARE a record; p record; r record; snap jsonb;
BEGIN
 IF NOT private.is_active(auth.uid()) OR NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin khôi phục Role.' USING ERRCODE='42501'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('canonical_org'));
 LOCK TABLE app_roles,user_roles,base_title_role_links,org_assignments,org_position_slots,mkt_specialties,mkt_staff_specialties,leave_requests IN SHARE ROW EXCLUSIVE MODE;
 IF _phase='preview' THEN
 SELECT * INTO a FROM private.role_catalog_audit WHERE id=_audit AND action='UPDATE';
 IF a.id IS NULL OR coalesce((a.before_data->>'is_system')::boolean,true) OR coalesce((a.before_data->>'catalog_generation')::int,1)<2 THEN RAISE EXCEPTION 'Snapshot Role V2 hợp lệ không tồn tại.'; END IF;
 SELECT * INTO r FROM app_roles WHERE id=a.role_id;
 IF to_jsonb(r) IS DISTINCT FROM a.after_data THEN RAISE EXCEPTION 'Role đã thay đổi sau snapshot; không ghi đè.'; END IF;
 INSERT INTO private.role_catalog_previews(actor_id,action,role_id,proposed,before_data,baseline) VALUES(auth.uid(),'restore',r.id,jsonb_build_object('audit',a.id),to_jsonb(r),private.role_catalog_fingerprint()) RETURNING * INTO p;
 RETURN jsonb_build_object('id',p.id,'role_id',r.id,'before',to_jsonb(r),'after',a.before_data,'expires_at',p.expires_at);
 ELSIF _phase='apply' THEN
 SELECT * INTO p FROM private.role_catalog_previews WHERE id=_preview AND actor_id=auth.uid() AND action='restore' FOR UPDATE;
 IF p.id IS NULL OR p.applied_at IS NOT NULL OR p.expires_at<=clock_timestamp() OR p.baseline<>private.role_catalog_fingerprint() THEN RAISE EXCEPTION 'Snapshot hết hạn hoặc nguồn đã thay đổi.'; END IF;
 IF _confirmation IS DISTINCT FROM 'KHÔI PHỤC ROLE' OR coalesce(trim(_reason),'')='' THEN RAISE EXCEPTION 'Cần xác nhận khôi phục và lý do.'; END IF;
 SELECT * INTO a FROM private.role_catalog_audit WHERE id=(p.proposed->>'audit')::uuid AND action='UPDATE';
 SELECT * INTO r FROM app_roles WHERE id=p.role_id;
 IF a.id IS NULL OR to_jsonb(r) IS DISTINCT FROM a.after_data OR r.is_system OR r.catalog_generation<2 THEN RAISE EXCEPTION 'Snapshot xung đột.'; END IF;
 snap:=a.before_data; PERFORM set_config('app.role_reason','Khôi phục snapshot: '||trim(_reason),true);
 UPDATE app_roles SET name=snap->>'name',description=snap->>'description',permissions=ARRAY(SELECT jsonb_array_elements_text(snap->'permissions')),role_kind=snap->>'role_kind',catalog_group=snap->>'catalog_group',signal_scope_all=(snap->>'signal_scope_all')::boolean,signal_scope=ARRAY(SELECT jsonb_array_elements_text(snap->'signal_scope')),updated_at=clock_timestamp() WHERE id=p.role_id;
 UPDATE private.role_catalog_previews SET applied_at=clock_timestamp() WHERE id=p.id;
 RETURN jsonb_build_object('role_id',p.role_id,'restored',true);
 END IF; RAISE EXCEPTION 'Giai đoạn không hợp lệ.';
END $restore$;
REVOKE ALL ON FUNCTION public.role_catalog_restore(text,uuid,uuid,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.role_catalog_restore(text,uuid,uuid,text,text) TO authenticated;