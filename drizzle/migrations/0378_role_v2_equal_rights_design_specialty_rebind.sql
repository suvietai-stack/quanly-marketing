CREATE OR REPLACE FUNCTION public.role_specialty_rebind(_phase text,_specialty text DEFAULT NULL,_role text DEFAULT NULL,_preview uuid DEFAULT NULL,_confirmation text DEFAULT NULL,_reason text DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $binding$
DECLARE p record; s record; oldr record; newr record; proposal jsonb;
BEGIN
 IF NOT private.is_active(auth.uid()) OR NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin chuyển liên kết.' USING ERRCODE='42501'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('canonical_org'));
 LOCK TABLE app_roles,mkt_specialties,mkt_staff_specialties,org_assignments IN SHARE ROW EXCLUSIVE MODE;
 IF _phase='preview' THEN
 SELECT * INTO s FROM mkt_specialties WHERE id=_specialty AND id IN ('design','photography');
 SELECT * INTO oldr FROM app_roles WHERE id=s.role_id;
 SELECT * INTO newr FROM app_roles WHERE id=_role AND id='role-v2-design-staff' AND catalog_generation>=2 AND role_kind='position' AND NOT is_system;
 IF s.id IS NULL OR newr.id IS NULL OR oldr.id IS NULL THEN RAISE EXCEPTION 'Liên kết Thiết kế không hợp lệ.'; END IF;
 IF EXISTS(SELECT 1 FROM unnest(oldr.permissions) k WHERE private.mkt_specialty_permission_ready(k) AND NOT k=ANY(newr.permissions)) OR EXISTS(SELECT 1 FROM unnest(newr.permissions) k WHERE private.mkt_specialty_permission_ready(k) AND NOT k=ANY(oldr.permissions)) THEN RAISE EXCEPTION 'Chuyển liên kết làm đổi quyền chuyên môn; dừng.'; END IF;
 proposal:=jsonb_build_object('specialty',s.id,'role',newr.id,'old',s.role_id);
 INSERT INTO private.role_catalog_previews(actor_id,action,role_id,proposed,before_data,baseline) VALUES(auth.uid(),'specialty_rebind',newr.id,proposal,to_jsonb(s),private.role_catalog_fingerprint()) RETURNING * INTO p;
 RETURN jsonb_build_object('id',p.id,'before',to_jsonb(s),'after',proposal,'expires_at',p.expires_at);
 ELSIF _phase='apply' THEN
 SELECT * INTO p FROM private.role_catalog_previews WHERE id=_preview AND actor_id=auth.uid() AND action='specialty_rebind' FOR UPDATE;
 IF p.id IS NULL OR p.applied_at IS NOT NULL OR p.expires_at<=clock_timestamp() OR p.baseline<>private.role_catalog_fingerprint() THEN RAISE EXCEPTION 'Xem trước hết hạn hoặc nguồn đã thay đổi.'; END IF;
 IF _confirmation IS DISTINCT FROM 'CHUYỂN ROLE CHUYÊN MÔN' OR coalesce(trim(_reason),'')='' THEN RAISE EXCEPTION 'Cần xác nhận và lý do.'; END IF;
 SELECT * INTO s FROM mkt_specialties WHERE id=p.proposed->>'specialty';
 IF to_jsonb(s) IS DISTINCT FROM p.before_data THEN RAISE EXCEPTION 'Liên kết đã thay đổi.'; END IF;
 UPDATE mkt_specialties SET role_id=p.role_id WHERE id=s.id;
 INSERT INTO mkt_specialty_events(user_id,specialty_id,action,before_state,after_state,actor,note) VALUES(auth.uid(),s.id,'role_rebind',p.before_data->>'role_id',p.role_id,auth.uid(),trim(_reason));
 UPDATE private.role_catalog_previews SET applied_at=clock_timestamp() WHERE id=p.id;
 RETURN jsonb_build_object('specialty',s.id,'role_id',p.role_id);
 END IF; RAISE EXCEPTION 'Giai đoạn không hợp lệ.';
END $binding$;
REVOKE ALL ON FUNCTION public.role_specialty_rebind(text,text,text,uuid,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.role_specialty_rebind(text,text,text,uuid,text,text) TO authenticated;