-- Sale Work Zalo: cấu hình liên kết + kho thông tin đăng nhập riêng từng nhân viên, mã hóa hai chiều có kiểm soát tại backend.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Khóa giải mã nằm trong schema private, không cấp quyền cho bất kỳ role API nào; chỉ hàm SECURITY DEFINER đọc được.
CREATE TABLE private.sw_vault (id boolean PRIMARY KEY DEFAULT true CHECK (id), secret text NOT NULL);
INSERT INTO private.sw_vault (secret) VALUES (encode(gen_random_bytes(32), 'hex'));
REVOKE ALL ON private.sw_vault FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION private.sw_key() RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = private AS $$ SELECT secret FROM private.sw_vault WHERE id $$;

CREATE TABLE public.sw_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  display_name text NOT NULL DEFAULT 'Sale Work Zalo',
  url text,
  description text,
  enabled boolean NOT NULL DEFAULT false,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.sw_settings (id) VALUES (true) ON CONFLICT DO NOTHING;

CREATE TABLE public.sw_credentials (
  user_id uuid PRIMARY KEY,
  username text NOT NULL,
  password_enc bytea NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','locked')),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.sw_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  target_user_id uuid,
  action text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RPC-only: không cấp quyền đọc/ghi trực tiếp cho anon/authenticated (mật khẩu không bao giờ lọt vào API danh sách).
ALTER TABLE public.sw_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sw_events ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.sw_settings TO service_role;
GRANT ALL ON public.sw_credentials TO service_role;
GRANT ALL ON public.sw_events TO service_role;

CREATE OR REPLACE FUNCTION private.sw_event(_actor uuid, _target uuid, _action text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.sw_events(actor_id, target_user_id, action) VALUES (_actor, _target, _action);
END $$;

-- Cấu hình hiển thị cho nhân viên (không chứa bí mật)
CREATE OR REPLACE FUNCTION public.sw_config() RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF NOT private.is_active(_uid) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;
  IF NOT (private.sig_can(_uid,'sale_work.access') OR private.sig_can(_uid,'sale_work.manage_settings') OR private.sig_can(_uid,'sale_work.manage_credentials')) THEN
    RAISE EXCEPTION 'Bạn không có quyền truy cập Sale Work Zalo.' USING ERRCODE='42501';
  END IF;
  RETURN (SELECT jsonb_build_object('display_name', s.display_name, 'url', s.url, 'description', s.description, 'enabled', s.enabled) FROM public.sw_settings s WHERE s.id);
END $$;
REVOKE ALL ON FUNCTION public.sw_config() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sw_config() TO authenticated;

CREATE OR REPLACE FUNCTION public.sw_config_save(_display_name text, _url text, _description text, _enabled boolean) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF NOT private.is_active(_uid) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;
  IF NOT private.sig_can(_uid,'sale_work.manage_settings') THEN RAISE EXCEPTION 'Bạn không có quyền cài đặt Sale Work Zalo.' USING ERRCODE='42501'; END IF;
  IF _url IS NOT NULL AND btrim(_url) <> '' AND _url !~ '^https://[^\s]+$' THEN
    RAISE EXCEPTION 'URL phải bắt đầu bằng https:// và không chứa khoảng trắng.';
  END IF;
  UPDATE public.sw_settings SET display_name = nullif(btrim(coalesce(_display_name,'')), ''), url = nullif(btrim(coalesce(_url,'')), ''),
    description = nullif(btrim(coalesce(_description,'')), ''), enabled = coalesce(_enabled, false), updated_by = _uid, updated_at = now()
  WHERE id;
  IF NOT FOUND THEN
    INSERT INTO public.sw_settings(id, display_name, url, description, enabled, updated_by)
    VALUES (true, coalesce(nullif(btrim(coalesce(_display_name,'')), ''), 'Sale Work Zalo'), nullif(btrim(coalesce(_url,'')), ''), nullif(btrim(coalesce(_description,'')), ''), coalesce(_enabled, false), _uid);
  END IF;
  PERFORM private.sw_event(_uid, NULL, 'config');
END $$;
REVOKE ALL ON FUNCTION public.sw_config_save(text, text, text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sw_config_save(text, text, text, boolean) TO authenticated;

-- Nhân viên xem thông tin của chính mình (không gồm mật khẩu)
CREATE OR REPLACE FUNCTION public.sw_my_credential() RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF NOT private.is_active(_uid) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;
  IF NOT (private.sig_can(_uid,'sale_work.view_own') OR private.sig_can(_uid,'sale_work.access')) THEN
    RAISE EXCEPTION 'Bạn không có quyền xem thông tin Sale Work.' USING ERRCODE='42501';
  END IF;
  RETURN (SELECT jsonb_build_object('username', c.username, 'status', c.status, 'updated_at', c.updated_at) FROM public.sw_credentials c WHERE c.user_id = _uid);
END $$;
REVOKE ALL ON FUNCTION public.sw_my_credential() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sw_my_credential() TO authenticated;

-- Giải mã mật khẩu: chỉ chính chủ, tài khoản hoạt động, thông tin cấp còn hiệu lực; mọi lần xem đều ghi nhật ký (không ghi giá trị)
CREATE OR REPLACE FUNCTION public.sw_reveal_password() RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _c public.sw_credentials; _plain text;
BEGIN
  IF NOT private.is_active(_uid) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;
  IF NOT private.sig_can(_uid,'sale_work.view_own') THEN RAISE EXCEPTION 'Bạn không có quyền xem mật khẩu Sale Work.' USING ERRCODE='42501'; END IF;
  SELECT * INTO _c FROM public.sw_credentials WHERE user_id = _uid;
  IF _c.user_id IS NULL THEN RAISE EXCEPTION 'Bạn chưa được cấp tài khoản Sale Work Zalo.'; END IF;
  IF _c.status <> 'active' THEN RAISE EXCEPTION 'Thông tin truy cập của bạn đang bị tạm khóa. Liên hệ người quản trị.'; END IF;
  _plain := pgp_sym_decrypt(_c.password_enc, private.sw_key());
  PERFORM private.sw_event(_uid, _uid, 'view_password');
  RETURN _plain;
END $$;
REVOKE ALL ON FUNCTION public.sw_reveal_password() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sw_reveal_password() TO authenticated;

-- Danh sách nhân sự cho quản trị (tuyệt đối không trả mật khẩu)
CREATE OR REPLACE FUNCTION public.sw_staff_list(_q text DEFAULT NULL) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF NOT private.is_active(_uid) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;
  IF NOT private.sig_can(_uid,'sale_work.manage_credentials') THEN RAISE EXCEPTION 'Bạn không có quyền quản lý tài khoản Sale Work.' USING ERRCODE='42501'; END IF;
  RETURN coalesce((
    SELECT jsonb_agg(jsonb_build_object(
      'user_id', p.id, 'full_name', p.full_name, 'base_username', p.username, 'position', p.desired_position,
      'sw_username', c.username, 'sw_status', c.status, 'granted', c.user_id IS NOT NULL
    ) ORDER BY p.full_name)
    FROM public.profiles p
    LEFT JOIN public.sw_credentials c ON c.user_id = p.id
    WHERE p.status = 'Đang hoạt động'
      AND (_q IS NULL OR btrim(_q) = '' OR p.full_name ILIKE '%' || btrim(_q) || '%' OR p.username ILIKE '%' || btrim(_q) || '%' OR coalesce(p.email,'') ILIKE '%' || btrim(_q) || '%')
    LIMIT 500
  ), '[]'::jsonb);
END $$;
REVOKE ALL ON FUNCTION public.sw_staff_list(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sw_staff_list(text) TO authenticated;

-- Cấp/sửa/khóa thông tin đăng nhập; mật khẩu mã hóa trước khi lưu, không bao giờ đọc lại cho quản trị
CREATE OR REPLACE FUNCTION public.sw_credential_save(_user_id uuid, _username text, _password text, _status text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _old public.sw_credentials; _action text;
BEGIN
  IF NOT private.is_active(_uid) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;
  IF NOT private.sig_can(_uid,'sale_work.manage_credentials') THEN RAISE EXCEPTION 'Bạn không có quyền quản lý tài khoản Sale Work.' USING ERRCODE='42501'; END IF;
  IF NOT private.is_active(_user_id) THEN RAISE EXCEPTION 'Nhân sự này không còn hoạt động trên Base.'; END IF;
  IF length(btrim(coalesce(_username,''))) < 3 OR length(_username) > 100 THEN RAISE EXCEPTION 'Tên tài khoản Sale Work không hợp lệ (3–100 ký tự).'; END IF;
  IF _status NOT IN ('active','locked') THEN RAISE EXCEPTION 'Trạng thái không hợp lệ.'; END IF;
  SELECT * INTO _old FROM public.sw_credentials WHERE user_id = _user_id;
  IF _old.user_id IS NULL AND (_password IS NULL OR length(_password) < 6) THEN
    RAISE EXCEPTION 'Mật khẩu ban đầu tối thiểu 6 ký tự.';
  END IF;
  IF _password IS NOT NULL AND _password <> '' AND length(_password) > 100 THEN RAISE EXCEPTION 'Mật khẩu quá dài.'; END IF;

  IF _old.user_id IS NULL THEN
    INSERT INTO public.sw_credentials(user_id, username, password_enc, status, created_by)
    VALUES (_user_id, btrim(_username), pgp_sym_encrypt(_password, private.sw_key()), _status, _uid);
    _action := 'grant';
  ELSE
    UPDATE public.sw_credentials SET
      username = btrim(_username),
      password_enc = CASE WHEN _password IS NULL OR _password = '' THEN password_enc ELSE pgp_sym_encrypt(_password, private.sw_key()) END,
      status = _status, updated_at = now()
    WHERE user_id = _user_id;
    _action := CASE
      WHEN _old.status <> _status AND _status = 'locked' THEN 'lock'
      WHEN _old.status <> _status AND _status = 'active' THEN 'unlock'
      WHEN _password IS NOT NULL AND _password <> '' THEN 'reset_password'
      ELSE 'update' END;
  END IF;
  PERFORM private.sw_event(_uid, _user_id, _action);
END $$;
REVOKE ALL ON FUNCTION public.sw_credential_save(uuid, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sw_credential_save(uuid, text, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.sw_credential_revoke(_user_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF NOT private.is_active(_uid) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;
  IF NOT private.sig_can(_uid,'sale_work.manage_credentials') THEN RAISE EXCEPTION 'Bạn không có quyền quản lý tài khoản Sale Work.' USING ERRCODE='42501'; END IF;
  DELETE FROM public.sw_credentials WHERE user_id = _user_id;
  IF FOUND THEN PERFORM private.sw_event(_uid, _user_id, 'revoke'); END IF;
END $$;
REVOKE ALL ON FUNCTION public.sw_credential_revoke(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sw_credential_revoke(uuid) TO authenticated;

-- Nhật ký quản trị (không chứa giá trị mật khẩu)
CREATE OR REPLACE FUNCTION public.sw_audit(_limit int DEFAULT 100) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF NOT private.is_active(_uid) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;
  IF NOT private.sig_can(_uid,'sale_work.view_audit') THEN RAISE EXCEPTION 'Bạn không có quyền xem nhật ký Sale Work.' USING ERRCODE='42501'; END IF;
  RETURN coalesce((
    SELECT jsonb_agg(jsonb_build_object(
      'id', e.id, 'action', e.action, 'created_at', e.created_at,
      'actor_name', pa.full_name, 'target_name', pt.full_name
    ) ORDER BY e.created_at DESC)
    FROM (SELECT * FROM public.sw_events ORDER BY created_at DESC LIMIT least(greatest(coalesce(_limit,100),1),500)) e
    LEFT JOIN public.profiles pa ON pa.id = e.actor_id
    LEFT JOIN public.profiles pt ON pt.id = e.target_user_id
  ), '[]'::jsonb);
END $$;
REVOKE ALL ON FUNCTION public.sw_audit(int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sw_audit(int) TO authenticated;