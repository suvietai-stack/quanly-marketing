CREATE OR REPLACE FUNCTION public.account_approve(_target uuid, _role text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'private'
AS $function$ DECLARE p profiles;confirmed boolean;has_password boolean;banned boolean;BEGIN
 IF NOT private.is_active(auth.uid()) OR NOT (private.is_admin(auth.uid()) OR private.has_permission(auth.uid(),'settings.account_approve')) THEN RAISE EXCEPTION 'Không có quyền duyệt tài khoản.' USING ERRCODE='42501';END IF;
 SELECT * INTO p FROM profiles WHERE id=_target FOR UPDATE;IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy hồ sơ.';END IF;
 IF p.status<>'Chờ duyệt' THEN RAISE EXCEPTION 'Tài khoản không còn chờ duyệt. Vui lòng tải lại.';END IF;
 SELECT email_confirmed_at IS NOT NULL,coalesce(encrypted_password,'')<>'',coalesce(banned_until>now(),false) INTO confirmed,has_password,banned FROM auth.users WHERE id=_target;
 IF NOT FOUND OR NOT has_password OR banned THEN RAISE EXCEPTION 'Tài khoản xác thực chưa sẵn sàng. Vui lòng kiểm tra trạng thái xác thực.';END IF;
 IF _role IS NOT NULL THEN
  IF NOT(private.is_admin(auth.uid()) OR private.has_permission(auth.uid(),'settings.assign_role')) THEN RAISE EXCEPTION 'Không có quyền gán role.' USING ERRCODE='42501';END IF;
  IF _role IN ('role-super-admin','role-admin') AND NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin được gán role quản trị.' USING ERRCODE='42501';END IF;
  IF NOT EXISTS(SELECT 1 FROM app_roles WHERE id=_role AND catalog_state='standard') THEN RAISE EXCEPTION 'Chỉ gán Role thuộc danh mục chuẩn; Role cũ đã ngừng sử dụng.';END IF;
  INSERT INTO user_roles(user_id,role_id) SELECT _target,_role WHERE NOT EXISTS(SELECT 1 FROM user_roles WHERE user_id=_target AND role_id=_role);
 ELSE
  INSERT INTO user_roles(user_id,role_id) SELECT _target,'role-nhan-su-moi' WHERE NOT EXISTS(SELECT 1 FROM user_roles WHERE user_id=_target);
 END IF;
 UPDATE profiles SET status='Đang hoạt động' WHERE id=_target;
 INSERT INTO account_security_logs(actor_id,target_id,action) VALUES(auth.uid(),_target,'approve_account');
 RETURN jsonb_build_object('ok',true,'emailConfirmed',confirmed,'ready',confirmed);END;$function$

