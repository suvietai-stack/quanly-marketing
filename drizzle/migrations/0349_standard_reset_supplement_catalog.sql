CREATE OR REPLACE FUNCTION private.supplement_permission_guard(u uuid) RETURNS void LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF NOT private.is_active(auth.uid()) OR NOT(private.is_super_admin(auth.uid()) OR (private.is_admin(auth.uid()) AND private.has_permission(auth.uid(),'settings.user_custom_perm'))) THEN RAISE EXCEPTION 'Không có quyền tùy chỉnh quyền nhân sự.';END IF;
 IF u=auth.uid() OR private.is_super_admin(u) OR EXISTS(SELECT 1 FROM profiles WHERE id=u AND is_system_admin) THEN RAISE EXCEPTION 'Tài khoản quản trị và tự thay đổi quyền được bảo vệ.';END IF;
 IF private.cleanup_is_biz_staff(u) AND NOT private.legacy_reset_applies(u) THEN RAISE EXCEPTION 'Tài khoản Kinh doanh chưa chuyển đổi được bảo vệ.';END IF;
 IF NOT EXISTS(SELECT 1 FROM profiles WHERE id=u) THEN RAISE EXCEPTION 'Nhân sự không tồn tại.';END IF;
 END $$;
DO $$ DECLARE d text;BEGIN
 SELECT pg_get_functiondef('public.account_supplement_read(uuid)'::regprocedure) INTO d;
 d:=replace(d,$s$'name',r.name,'permissions',r.permissions$s$,$s$'name',r.name,'permissions',r.permissions,'catalog_state',r.catalog_state$s$);
 d:=replace(d,'FROM app_roles r WHERE r.id NOT IN','FROM app_roles r WHERE r.catalog_state=''standard'' AND r.id NOT IN');EXECUTE d;
 SELECT pg_get_functiondef('public.account_supplement_save(uuid,text[],text[],text,text)'::regprocedure) INTO d;
 d:=replace(d,'FROM app_roles r WHERE r.id=x AND','FROM app_roles r WHERE r.catalog_state=''standard'' AND r.id=x AND');EXECUTE d;
END $$;