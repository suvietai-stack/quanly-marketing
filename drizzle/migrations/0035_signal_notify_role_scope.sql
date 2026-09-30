CREATE OR REPLACE FUNCTION private.sig_notify_ok(_uid uuid, _groups text[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT _uid IS NOT NULL AND (
    private.is_super_admin(_uid) OR private.is_admin(_uid)
    -- Quyền tùy chỉnh theo tài khoản: dùng hợp phạm vi các vai trò
    OR (EXISTS (SELECT 1 FROM public.user_permission_overrides o WHERE o.user_id=_uid AND o.use_custom)
        AND private.sig_scope_ok(_uid, _groups))
    -- Chỉ tính vai trò đang cấp quyền Phân công / Quản lý
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur JOIN public.app_roles r ON r.id = ur.role_id
      WHERE ur.user_id = _uid
        AND ('signal.assign' = ANY(r.permissions) OR 'signal.manage' = ANY(r.permissions))
        AND (r.signal_scope_all OR EXISTS (
          SELECT 1 FROM unnest(coalesce(_groups,'{}')) g
          WHERE g = ANY(r.signal_scope) OR (g LIKE 'Khác:%' AND 'Khác' = ANY(r.signal_scope)))))
  );
$$;
REVOKE ALL ON FUNCTION private.sig_notify_ok(uuid, text[]) FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION public.signal_notify()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'private'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications(recipient_id, kind, signal_id, dedup_key)
    SELECT p.id, 'signal_new', NEW.id, 'new:' || NEW.id || ':' || p.id
    FROM public.profiles p
    WHERE p.status = 'Đang hoạt động' AND p.id IS DISTINCT FROM NEW.created_by
      AND (private.sig_can(p.id,'signal.assign') OR private.sig_can(p.id,'signal.manage'))
      AND private.sig_notify_ok(p.id, NEW.need_groups)
    ON CONFLICT (dedup_key) DO NOTHING;
    IF NEW.assigned_to IS NOT NULL THEN
      INSERT INTO public.notifications(recipient_id, kind, signal_id, dedup_key)
      VALUES (NEW.assigned_to, 'signal_assigned', NEW.id, 'assign:' || NEW.id || ':' || NEW.assigned_to || ':' || coalesce(NEW.assigned_at, now()))
      ON CONFLICT (dedup_key) DO NOTHING;
    END IF;
  ELSIF NEW.assigned_to IS NOT NULL AND NEW.assigned_to IS DISTINCT FROM OLD.assigned_to THEN
    INSERT INTO public.notifications(recipient_id, kind, signal_id, dedup_key)
    VALUES (NEW.assigned_to, 'signal_assigned', NEW.id, 'assign:' || NEW.id || ':' || NEW.assigned_to || ':' || coalesce(NEW.assigned_at, now()))
    ON CONFLICT (dedup_key) DO NOTHING;
  END IF;
  RETURN NEW;
END $function$;