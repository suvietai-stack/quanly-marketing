ALTER TABLE public.app_roles
  ADD COLUMN IF NOT EXISTS signal_scope_all boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS signal_scope text[] NOT NULL DEFAULT '{}';

-- Phạm vi nhóm nhu cầu của người dùng (hợp các vai trò). Admin / không có vai trò → toàn bộ.
CREATE OR REPLACE FUNCTION private.sig_scope_ok(_uid uuid, _groups text[]) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT _uid IS NOT NULL AND (
    private.is_super_admin(_uid) OR private.is_admin(_uid)
    OR NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = _uid)
    OR EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.app_roles r ON r.id = ur.role_id
               WHERE ur.user_id = _uid AND r.signal_scope_all)
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur JOIN public.app_roles r ON r.id = ur.role_id,
        unnest(coalesce(_groups,'{}')) g
      WHERE ur.user_id = _uid
        AND (g = ANY(r.signal_scope) OR (g LIKE 'Khác:%' AND 'Khác' = ANY(r.signal_scope))))
  );
$$;

-- Quy tắc xem tín hiệu dùng chung cho policy và trigger.
CREATE OR REPLACE FUNCTION private.sig_visible(_uid uuid, _created_by uuid, _assigned_to uuid, _groups text[]) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT ((private.sig_can(_uid,'signal.view_all') OR private.sig_can(_uid,'signal.manage')
           OR private.sig_can(_uid,'signal.edit') OR private.sig_can(_uid,'signal.delete')
           OR private.sig_can(_uid,'signal.assign') OR private.sig_can(_uid,'signal.report'))
          AND private.sig_scope_ok(_uid, _groups))
    OR (_created_by = _uid AND private.sig_can(_uid,'signal.create'))
    OR (_assigned_to = _uid AND private.sig_can(_uid,'signal.sale'));
$$;
REVOKE ALL ON FUNCTION private.sig_scope_ok(uuid, text[]) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.sig_visible(uuid, uuid, uuid, text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.sig_scope_ok(uuid, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION private.sig_visible(uuid, uuid, uuid, text[]) TO authenticated;

DROP POLICY IF EXISTS sig_select ON public.opportunity_signals;
CREATE POLICY sig_select ON public.opportunity_signals FOR SELECT TO authenticated
USING (
  ((private.sig_can(auth.uid(),'signal.view_all') OR private.sig_can(auth.uid(),'signal.manage'))
    AND private.sig_scope_ok(auth.uid(), need_groups))
  OR (created_by = auth.uid() AND private.sig_can(auth.uid(),'signal.create'))
  OR (assigned_to = auth.uid() AND private.sig_can(auth.uid(),'signal.sale'))
);

DROP POLICY IF EXISTS sig_update ON public.opportunity_signals;
CREATE POLICY sig_update ON public.opportunity_signals FOR UPDATE TO authenticated
USING (
  ((private.sig_can(auth.uid(),'signal.manage') OR private.sig_can(auth.uid(),'signal.edit'))
    AND private.sig_scope_ok(auth.uid(), need_groups))
  OR (created_by = auth.uid() AND private.sig_can(auth.uid(),'signal.create') AND (status IS NULL OR status = ANY (ARRAY['waiting','consulting'])))
)
WITH CHECK (
  (private.sig_can(auth.uid(),'signal.manage') OR private.sig_can(auth.uid(),'signal.edit'))
  OR (created_by = auth.uid() AND private.sig_can(auth.uid(),'signal.create') AND (status IS NULL OR status = ANY (ARRAY['waiting','consulting'])))
);

DROP POLICY IF EXISTS sig_delete ON public.opportunity_signals;
CREATE POLICY sig_delete ON public.opportunity_signals FOR DELETE TO authenticated
USING (
  (private.sig_can(auth.uid(),'signal.manage') OR private.sig_can(auth.uid(),'signal.delete'))
  AND private.sig_scope_ok(auth.uid(), need_groups)
  AND (status IS NULL OR status <> ALL (ARRAY['won','lost']))
  AND NOT EXISTS (SELECT 1 FROM public.opportunity_signal_notes n WHERE n.signal_id = opportunity_signals.id)
);

-- Chặn mọi thao tác (kể cả qua RPC: phân công, hủy, mở lại, cập nhật) trên tín hiệu ngoài phạm vi.
CREATE OR REPLACE FUNCTION private.sig_scope_guard() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF auth.uid() IS NULL OR current_setting('app.sig_scope_skip', true) = '1' THEN
    RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
  END IF;
  IF NOT private.sig_visible(auth.uid(), OLD.created_by, OLD.assigned_to, OLD.need_groups) THEN
    RAISE EXCEPTION 'Tín hiệu nằm ngoài phạm vi nhóm bạn được theo dõi';
  END IF;
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END $$;
DROP TRIGGER IF EXISTS sig_scope_guard_trg ON public.opportunity_signals;
CREATE TRIGGER sig_scope_guard_trg BEFORE UPDATE OR DELETE ON public.opportunity_signals
FOR EACH ROW EXECUTE FUNCTION private.sig_scope_guard();

-- Danh sách Sale giữ nguyên; thông báo "tín hiệu mới" chỉ gửi người có tín hiệu trong phạm vi.
CREATE OR REPLACE FUNCTION public.signal_notify()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, private AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications(recipient_id, kind, signal_id, dedup_key)
    SELECT p.id, 'signal_new', NEW.id, 'new:' || NEW.id || ':' || p.id
    FROM public.profiles p
    WHERE p.status = 'Đang hoạt động' AND p.id IS DISTINCT FROM NEW.created_by
      AND (private.sig_can(p.id,'signal.assign') OR private.sig_can(p.id,'signal.manage'))
      AND private.sig_scope_ok(p.id, NEW.need_groups)
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
END $$;

-- Đổi tên danh mục: cập nhật mọi tín hiệu (bỏ qua phạm vi) và phạm vi của các vai trò.
CREATE OR REPLACE FUNCTION public.signal_catalog_rename(_scope text, _old text, _new text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.can_edit_signal_catalog(auth.uid()) THEN RAISE EXCEPTION 'Bạn không có quyền Quản lý danh mục tín hiệu'; END IF;
  IF _scope NOT IN ('signal_sources','signal_products','signal_need_groups') THEN RAISE EXCEPTION 'Loại danh mục "%" không được hỗ trợ', _scope; END IF;
  _new := btrim(regexp_replace(coalesce(_new,''), '\s+', ' ', 'g'));
  IF _new = '' THEN RAISE EXCEPTION 'Tên mới không được để trống'; END IF;
  IF _new = _old THEN RETURN; END IF;
  PERFORM set_config('app.sig_rpc','1',true);
  PERFORM set_config('app.sig_scope_skip','1',true);
  IF _scope = 'signal_sources' THEN
    UPDATE public.opportunity_signals SET source = _new WHERE source = _old;
  ELSIF _scope = 'signal_products' THEN
    UPDATE public.opportunity_signals SET products = array_replace(products, _old, _new) WHERE _old = ANY(products);
  ELSE
    UPDATE public.opportunity_signals SET need_groups = array_replace(need_groups, _old, _new),
      need_group = CASE WHEN need_group = _old THEN _new ELSE need_group END
      WHERE _old = ANY(need_groups) OR need_group = _old;
    UPDATE public.app_roles SET signal_scope = array_replace(signal_scope, _old, _new) WHERE _old = ANY(signal_scope);
  END IF;
  PERFORM set_config('app.sig_scope_skip','',true);
END $$;
GRANT EXECUTE ON FUNCTION public.signal_catalog_rename(text, text, text) TO authenticated;