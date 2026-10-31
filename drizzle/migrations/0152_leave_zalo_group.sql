-- Thông báo Zalo nhóm Nhân sự cho Đơn từ: cấu hình nhóm riêng (độc lập nhóm Tiền Về) + hàng đợi sự kiện chống gửi trùng.

CREATE TABLE public.leave_zalo_group_config (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  group_id text,
  group_name text,
  enabled boolean NOT NULL DEFAULT false,
  on_new boolean NOT NULL DEFAULT true,
  on_reassign boolean NOT NULL DEFAULT true,
  on_approved boolean NOT NULL DEFAULT true,
  on_rejected boolean NOT NULL DEFAULT true,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.leave_zalo_group_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leave_zalo_group_config read" ON public.leave_zalo_group_config FOR SELECT TO authenticated
  USING (private.sig_can(auth.uid(), 'leave.settings'));
GRANT SELECT ON public.leave_zalo_group_config TO authenticated;
GRANT ALL ON public.leave_zalo_group_config TO service_role;

CREATE TABLE public.leave_zalo_group_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.leave_requests(id) ON DELETE CASCADE,
  event text NOT NULL CHECK (event IN ('new','reassign','approved','rejected')),
  dedup_key text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','unknown','skipped')),
  error text,
  attempts int NOT NULL DEFAULT 0,
  group_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);
CREATE INDEX leave_zalo_group_events_status_idx ON public.leave_zalo_group_events(status, created_at);
ALTER TABLE public.leave_zalo_group_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leave_zalo_group_events read" ON public.leave_zalo_group_events FOR SELECT TO authenticated
  USING (private.sig_can(auth.uid(), 'leave.settings'));
GRANT SELECT ON public.leave_zalo_group_events TO authenticated;
GRANT ALL ON public.leave_zalo_group_events TO service_role;

-- Trigger outbox: chỉ tạo sự kiện khi tính năng bật, có nhóm và sự kiện đó được bật; dedup_key chống trùng.
CREATE OR REPLACE FUNCTION private.leave_zalo_group_queue() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.leave_zalo_group_config%ROWTYPE;
BEGIN
  SELECT * INTO c FROM public.leave_zalo_group_config WHERE id = 1;
  IF NOT FOUND OR NOT c.enabled OR coalesce(btrim(c.group_id), '') = '' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'pending' AND c.on_new THEN
      INSERT INTO public.leave_zalo_group_events(request_id, event, dedup_key, group_id)
      VALUES (NEW.id, 'new', 'new:' || NEW.id || ':' || NEW.submission_no, c.group_id)
      ON CONFLICT (dedup_key) DO NOTHING;
    END IF;
    RETURN NEW;
  END IF;
  IF NEW.status = 'pending' AND NEW.submission_no > OLD.submission_no AND c.on_new THEN
    INSERT INTO public.leave_zalo_group_events(request_id, event, dedup_key, group_id)
    VALUES (NEW.id, 'new', 'new:' || NEW.id || ':' || NEW.submission_no, c.group_id)
    ON CONFLICT (dedup_key) DO NOTHING;
  END IF;
  IF NEW.status = 'pending' AND NEW.approver_id IS DISTINCT FROM OLD.approver_id AND c.on_reassign THEN
    INSERT INTO public.leave_zalo_group_events(request_id, event, dedup_key, group_id)
    VALUES (NEW.id, 'reassign', 'reassign:' || NEW.id || ':' || NEW.approver_id || ':' || clock_timestamp(), c.group_id)
    ON CONFLICT (dedup_key) DO NOTHING;
  END IF;
  IF NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved' AND c.on_approved THEN
    INSERT INTO public.leave_zalo_group_events(request_id, event, dedup_key, group_id)
    VALUES (NEW.id, 'approved', 'approved:' || NEW.id || ':' || NEW.submission_no, c.group_id)
    ON CONFLICT (dedup_key) DO NOTHING;
  END IF;
  IF NEW.status = 'rejected' AND OLD.status IS DISTINCT FROM 'rejected' AND c.on_rejected THEN
    INSERT INTO public.leave_zalo_group_events(request_id, event, dedup_key, group_id)
    VALUES (NEW.id, 'rejected', 'rejected:' || NEW.id || ':' || NEW.submission_no, c.group_id)
    ON CONFLICT (dedup_key) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER leave_zalo_group_trg AFTER INSERT OR UPDATE ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION private.leave_zalo_group_queue();

CREATE OR REPLACE FUNCTION public.leave_zalo_group_save(
  _group_id text, _group_name text, _enabled boolean,
  _on_new boolean, _on_reassign boolean, _on_approved boolean, _on_rejected boolean
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT private.sig_can(auth.uid(), 'leave.settings') THEN
    RAISE EXCEPTION 'Bạn không có quyền Quản lý cài đặt đơn từ.';
  END IF;
  IF _enabled AND coalesce(btrim(_group_id), '') = '' THEN
    RAISE EXCEPTION 'Chọn nhóm Zalo trước khi bật thông báo.';
  END IF;
  INSERT INTO public.leave_zalo_group_config(id, group_id, group_name, enabled, on_new, on_reassign, on_approved, on_rejected, updated_by, updated_at)
  VALUES (1, nullif(btrim(_group_id), ''), nullif(btrim(_group_name), ''), _enabled, _on_new, _on_reassign, _on_approved, _on_rejected, auth.uid(), now())
  ON CONFLICT (id) DO UPDATE SET
    group_id = excluded.group_id, group_name = excluded.group_name, enabled = excluded.enabled,
    on_new = excluded.on_new, on_reassign = excluded.on_reassign,
    on_approved = excluded.on_approved, on_rejected = excluded.on_rejected,
    updated_by = excluded.updated_by, updated_at = now();
END $$;
REVOKE ALL ON FUNCTION public.leave_zalo_group_save(text, text, boolean, boolean, boolean, boolean, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.leave_zalo_group_save(text, text, boolean, boolean, boolean, boolean, boolean) TO authenticated;