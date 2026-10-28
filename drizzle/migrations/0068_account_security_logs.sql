-- Nhật ký thao tác bảo mật tài khoản (reset mật khẩu, xóa tài khoản) — không bao giờ ghi mật khẩu.
CREATE TABLE public.account_security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL,
  target_id UUID NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.account_security_logs TO authenticated;
GRANT ALL ON public.account_security_logs TO service_role;

ALTER TABLE public.account_security_logs ENABLE ROW LEVEL SECURITY;

-- Chỉ người có quyền xem log thao tác (hoặc admin) được đọc; ghi chỉ qua service role (server function).
CREATE POLICY "account_security_logs_select" ON public.account_security_logs
  FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), 'settings.activity_log'));

-- Đồng bộ email: khi email trong Supabase Auth đổi (sau khi người dùng xác minh), cập nhật profiles.
CREATE OR REPLACE FUNCTION public.sync_profile_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.profiles SET email = NEW.email WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_email();