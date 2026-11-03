CREATE OR REPLACE FUNCTION private.is_super_admin(_user_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT private.is_active(_user_id) AND EXISTS(SELECT 1 FROM user_roles WHERE user_id=_user_id AND role_id='role-super-admin'); $$;
CREATE OR REPLACE FUNCTION private.is_admin(_user_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT private.is_active(_user_id) AND EXISTS(SELECT 1 FROM user_roles WHERE user_id=_user_id AND role_id IN ('role-super-admin','role-admin')); $$;
CREATE OR REPLACE FUNCTION private.has_permission(_user_id uuid,_permission text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT private.is_active(_user_id) AND (EXISTS(SELECT 1 FROM user_roles WHERE user_id=_user_id AND role_id='role-super-admin') OR EXISTS(SELECT 1 FROM profiles WHERE id=_user_id AND is_system_admin=true) OR CASE WHEN EXISTS(SELECT 1 FROM user_permission_overrides WHERE user_id=_user_id AND use_custom=true) THEN EXISTS(SELECT 1 FROM user_permission_overrides WHERE user_id=_user_id AND _permission=ANY(permissions)) ELSE EXISTS(SELECT 1 FROM user_roles ur JOIN app_roles r ON r.id=ur.role_id WHERE ur.user_id=_user_id AND _permission=ANY(r.permissions)) END); $$;
CREATE OR REPLACE FUNCTION private.get_profiles_directory() RETURNS TABLE(id uuid,username text,full_name text,status public.account_status,last_seen_at timestamptz,created_at timestamptz) LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT p.id,p.username,p.full_name,p.status,p.last_seen_at,p.created_at FROM profiles p WHERE private.is_active(auth.uid()) OR p.id=auth.uid(); $$;
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,private AS $$ BEGIN
 IF NEW.email IS DISTINCT FROM OLD.email AND pg_trigger_depth()<2 THEN RAISE EXCEPTION 'Email phải được thay đổi qua xác thực email.' USING ERRCODE='42501'; END IF;
 IF NEW.is_system_admin IS DISTINCT FROM OLD.is_system_admin AND NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Không được thay đổi quyền hệ thống.' USING ERRCODE='42501'; END IF;
 IF NEW.status IS DISTINCT FROM OLD.status THEN
  IF NOT private.is_active(auth.uid()) OR NOT (private.is_admin(auth.uid()) OR private.has_permission(auth.uid(),CASE WHEN OLD.status='Chờ duyệt' AND NEW.status='Đang hoạt động' THEN 'settings.account_approve' WHEN NEW.status='Từ chối' THEN 'settings.account_reject' ELSE 'settings.account_lock' END)) THEN RAISE EXCEPTION 'Không có quyền thay đổi trạng thái tài khoản.' USING ERRCODE='42501'; END IF;
 END IF;
 IF NEW.must_change_password IS DISTINCT FROM OLD.must_change_password AND NOT private.is_admin(auth.uid()) AND NOT (NEW.id=auth.uid() AND NEW.must_change_password=false) THEN RAISE EXCEPTION 'Không được thay đổi yêu cầu mật khẩu.' USING ERRCODE='42501'; END IF;
 IF NEW.phone IS DISTINCT FROM OLD.phone AND NOT private.is_admin(auth.uid()) THEN RAISE EXCEPTION 'Không được thay đổi số điện thoại.' USING ERRCODE='42501'; END IF;
 RETURN NEW; END; $$;
CREATE OR REPLACE FUNCTION public.sync_profile_email() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN IF NEW.email_confirmed_at IS NOT NULL AND (NEW.email IS DISTINCT FROM OLD.email OR NEW.email_confirmed_at IS DISTINCT FROM OLD.email_confirmed_at) THEN UPDATE profiles SET email=NEW.email WHERE id=NEW.id; END IF; RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated AFTER UPDATE OF email,email_confirmed_at ON auth.users FOR EACH ROW EXECUTE FUNCTION public.sync_profile_email();
CREATE TABLE public.account_auth_requests(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),bucket text NOT NULL,actor_id uuid,target_id uuid,action text NOT NULL,state text NOT NULL DEFAULT 'reserved' CHECK(state IN ('reserved','completed','failed','uncertain')),created_at timestamptz NOT NULL DEFAULT now(),finished_at timestamptz);
GRANT ALL ON public.account_auth_requests TO service_role;
ALTER TABLE public.account_auth_requests ENABLE ROW LEVEL SECURITY;
CREATE INDEX account_auth_requests_bucket_time ON public.account_auth_requests(bucket,created_at);
CREATE FUNCTION public.account_auth_reserve(_bucket text,_action text,_actor uuid DEFAULT NULL,_target uuid DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE n int;lim int;span interval;rid uuid;BEGIN
 IF _action NOT IN ('username_login','confirmation','reset_password') OR length(_bucket)>160 THEN RAISE EXCEPTION 'Invalid request'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('account-auth:'||_bucket,0));
 lim:=CASE WHEN _action='reset_password' THEN 10 WHEN _action='confirmation' THEN 3 ELSE 15 END;span:=CASE WHEN _action='username_login' THEN interval '1 minute' ELSE interval '1 hour' END;
 SELECT count(*) INTO n FROM account_auth_requests WHERE bucket=_bucket AND created_at>now()-span;
 IF n>=lim THEN RAISE EXCEPTION 'Bạn đã thao tác quá nhiều lần. Vui lòng thử lại sau.' USING ERRCODE='P0001'; END IF;
 INSERT INTO account_auth_requests(bucket,actor_id,target_id,action) VALUES(_bucket,_actor,_target,_action) RETURNING id INTO rid;RETURN rid;END;$$;
CREATE FUNCTION public.account_auth_finish(_id uuid,_state text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE r account_auth_requests;BEGIN
 IF _state NOT IN ('completed','failed','uncertain') THEN RAISE EXCEPTION 'Invalid state'; END IF;
 SELECT * INTO r FROM account_auth_requests WHERE id=_id FOR UPDATE;
 IF NOT FOUND OR r.state<>'reserved' THEN RAISE EXCEPTION 'Invalid reservation';END IF;
 IF r.action='reset_password' AND _state='completed' THEN INSERT INTO account_security_logs(actor_id,target_id,action) VALUES(r.actor_id,r.target_id,'reset_password');END IF;
 UPDATE account_auth_requests SET state=_state,finished_at=now() WHERE id=_id;END;$$;
REVOKE ALL ON FUNCTION public.account_auth_reserve(text,text,uuid,uuid),public.account_auth_finish(uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.account_auth_reserve(text,text,uuid,uuid),public.account_auth_finish(uuid,text) TO service_role;
CREATE FUNCTION public.account_username_identity(_username text) RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT id FROM profiles WHERE lower(username)=lower(trim(_username)); $$;
REVOKE ALL ON FUNCTION public.account_username_identity(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.account_username_identity(text) TO service_role;
CREATE FUNCTION public.account_approve(_target uuid,_role text DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,private AS $$ DECLARE p profiles;confirmed boolean;has_password boolean;banned boolean;BEGIN
 IF NOT private.is_active(auth.uid()) OR NOT (private.is_admin(auth.uid()) OR private.has_permission(auth.uid(),'settings.account_approve')) THEN RAISE EXCEPTION 'Không có quyền duyệt tài khoản.' USING ERRCODE='42501';END IF;
 SELECT * INTO p FROM profiles WHERE id=_target FOR UPDATE;IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy hồ sơ.';END IF;
 IF p.status<>'Chờ duyệt' THEN RAISE EXCEPTION 'Tài khoản không còn chờ duyệt. Vui lòng tải lại.';END IF;
 SELECT email_confirmed_at IS NOT NULL,coalesce(encrypted_password,'')<>'',coalesce(banned_until>now(),false) INTO confirmed,has_password,banned FROM auth.users WHERE id=_target;
 IF NOT FOUND OR NOT has_password OR banned THEN RAISE EXCEPTION 'Tài khoản xác thực chưa sẵn sàng. Vui lòng kiểm tra trạng thái xác thực.';END IF;
 IF _role IS NOT NULL THEN
  IF NOT(private.is_admin(auth.uid()) OR private.has_permission(auth.uid(),'settings.assign_role')) THEN RAISE EXCEPTION 'Không có quyền gán role.' USING ERRCODE='42501';END IF;
  IF _role IN ('role-super-admin','role-admin') AND NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin được gán role quản trị.' USING ERRCODE='42501';END IF;
  IF NOT EXISTS(SELECT 1 FROM app_roles WHERE id=_role) THEN RAISE EXCEPTION 'Role không tồn tại.';END IF;
  DELETE FROM user_roles WHERE user_id=_target;INSERT INTO user_roles(user_id,role_id) VALUES(_target,_role);
 END IF;
 UPDATE profiles SET status='Đang hoạt động' WHERE id=_target;
 INSERT INTO account_security_logs(actor_id,target_id,action) VALUES(auth.uid(),_target,'approve_account');
 RETURN jsonb_build_object('ok',true,'emailConfirmed',confirmed,'ready',confirmed);END;$$;
REVOKE ALL ON FUNCTION public.account_approve(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.account_approve(uuid,text) TO authenticated;
DO $$ DECLARE t record;BEGIN FOR t IN SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND c.relrowsecurity AND c.relname NOT IN ('profiles','app_branding','account_auth_requests') LOOP EXECUTE format('CREATE POLICY account_active_guard ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING (private.is_active(auth.uid())) WITH CHECK (private.is_active(auth.uid()))',t.relname);END LOOP;END;$$;
REVOKE ALL ON FUNCTION public.sync_profile_email(),public.prevent_profile_privilege_escalation() FROM PUBLIC,anon,authenticated;
COMMENT ON TABLE public.account_auth_requests IS 'Secret-free server-only operation reservations; no passwords, emails, tokens or hashes.';