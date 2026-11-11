CREATE OR REPLACE FUNCTION public.standard_role_catalog_consolidate() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE snapshot_ uuid; mapping_ jsonb:='[{"from":"role-standard-mkt-team","to":"role-standard-mkt-head","name":"Quản lý Marketing"},{"from":"role-standard-design-team","to":"role-standard-design-head","name":"Quản lý Thiết kế"}]'; item_ jsonb; changes_ jsonb:='[]'; p jsonb; title_ text;
BEGIN
IF auth.uid() IS NULL OR NOT private.is_active(auth.uid()) OR NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin được chuẩn hóa Role.'; END IF;
PERFORM pg_advisory_xact_lock(hashtext('standard_role_catalog'));
IF EXISTS(SELECT 1 FROM private.standard_role_catalog_runs WHERE mapping=mapping_ AND after_data IS NOT NULL) THEN RETURN jsonb_build_object('already_applied',true); END IF;
LOCK TABLE app_roles,base_title_role_links,org_assignments IN SHARE ROW EXCLUSIVE MODE;
IF EXISTS(SELECT 1 FROM org_assignments WHERE source='canonical' AND status='active' AND (ends_at IS NULL OR ends_at>now())) THEN RAISE EXCEPTION 'Có bổ nhiệm mới: cần xem trước riêng trước khi gộp Role.'; END IF;
INSERT INTO private.standard_role_catalog_runs(actor_id,before_data,mapping) VALUES(auth.uid(),jsonb_build_object('roles',(SELECT jsonb_agg(to_jsonb(r)) FROM app_roles r),'links',(SELECT jsonb_agg(to_jsonb(l)) FROM base_title_role_links l)),mapping_) RETURNING id INTO snapshot_;
FOR item_ IN SELECT value FROM jsonb_array_elements(mapping_) LOOP
IF NOT EXISTS(SELECT 1 FROM app_roles a JOIN app_roles b ON a.permissions=b.permissions AND a.catalog_pending=b.catalog_pending WHERE a.id=item_->>'from' AND b.id=item_->>'to') THEN RAISE EXCEPTION 'Role không cùng chức năng: không tự gộp.'; END IF;
FOR title_ IN SELECT DISTINCT title_id FROM base_title_role_links WHERE role_id=item_->>'from' LOOP
changes_:=changes_||jsonb_build_array(jsonb_build_object('action','roles','data',jsonb_build_object('id',title_,'roles',(SELECT jsonb_agg(jsonb_build_object('role_id',CASE WHEN role_id=item_->>'from' THEN item_->>'to' ELSE role_id END,'is_primary',is_primary,'scope_kind',scope_kind,'enabled_permissions',enabled_permissions)) FROM base_title_role_links WHERE title_id=title_))));
END LOOP;
UPDATE app_roles SET catalog_state='compatibility' WHERE id=item_->>'from';
UPDATE app_roles SET name=item_->>'name' WHERE id=item_->>'to';
END LOOP;
UPDATE app_roles SET name='Quản lý Mua hàng & Giao vận' WHERE id='role-standard-proc-head';
IF jsonb_array_length(changes_)>0 THEN
p:=org_change('preview',(SELECT revision FROM private.org_control WHERE id),changes_);
IF jsonb_array_length(coalesce(p->'impact','[]'))>0 THEN RAISE EXCEPTION 'Có thay đổi quyền nhân sự: không tự gộp.'; END IF;
PERFORM org_change('apply',NULL,NULL,(p->>'id')::uuid,'ÁP DỤNG CƠ CẤU','ÁP DỤNG PHÂN QUYỀN:Gộp Role quản lý cùng chức năng, không đổi quyền nhân sự');
END IF;
UPDATE private.standard_role_catalog_runs SET after_data=jsonb_build_object('roles',(SELECT jsonb_agg(to_jsonb(r)) FROM app_roles r),'links',(SELECT jsonb_agg(to_jsonb(l)) FROM base_title_role_links l)) WHERE id=snapshot_;
RETURN jsonb_build_object('snapshot_id',snapshot_,'changed_accounts',0,'merged',2);
END $$;
REVOKE ALL ON FUNCTION public.standard_role_catalog_consolidate() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.standard_role_catalog_consolidate() TO authenticated;