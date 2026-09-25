CREATE OR REPLACE FUNCTION private.sig_can(_uid uuid, _perm text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT _uid IS NOT NULL AND private.is_active(_uid)
    AND (private.is_super_admin(_uid) OR private.has_permission(_uid, _perm));
$$;

CREATE TABLE public.opportunity_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  detected_on date NOT NULL DEFAULT current_date,
  customer_name text NOT NULL CHECK (length(trim(customer_name)) BETWEEN 1 AND 200),
  phone text NOT NULL CHECK (phone ~ '^\+?[0-9 .-]{8,20}$'),
  address text CHECK (length(address) <= 500),
  need_detail text CHECK (length(need_detail) <= 3000),
  products text[] NOT NULL DEFAULT '{}',
  need_group text,
  source text NOT NULL,
  marketing_note text CHECK (length(marketing_note) <= 3000),
  created_by uuid NOT NULL DEFAULT auth.uid(),
  assigned_to uuid,
  assigned_at timestamptz,
  status text CHECK (status IN ('waiting','consulting','won','lost')),
  next_contact_on date,
  revenue numeric CHECK (revenue IS NULL OR revenue >= 0),
  lost_reason text,
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sig_won_revenue CHECK (status IS DISTINCT FROM 'won' OR (revenue IS NOT NULL AND revenue > 0)),
  CONSTRAINT sig_lost_reason CHECK (status IS DISTINCT FROM 'lost' OR (lost_reason IS NOT NULL AND length(trim(lost_reason)) > 0)),
  CONSTRAINT sig_assign_status CHECK ((assigned_to IS NULL) = (status IS NULL))
);
CREATE INDEX ON public.opportunity_signals(assigned_to);
CREATE INDEX ON public.opportunity_signals(created_by);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunity_signals TO authenticated;
GRANT ALL ON public.opportunity_signals TO service_role;
ALTER TABLE public.opportunity_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY sig_select ON public.opportunity_signals FOR SELECT TO authenticated USING (
  private.sig_can(auth.uid(),'signal.view_all') OR private.sig_can(auth.uid(),'signal.manage')
  OR (created_by = auth.uid() AND private.sig_can(auth.uid(),'signal.create'))
  OR (assigned_to = auth.uid() AND private.sig_can(auth.uid(),'signal.sale')));
CREATE POLICY sig_insert ON public.opportunity_signals FOR INSERT TO authenticated WITH CHECK (
  created_by = auth.uid() AND assigned_to IS NULL AND status IS NULL
  AND (private.sig_can(auth.uid(),'signal.create') OR private.sig_can(auth.uid(),'signal.manage')));
CREATE POLICY sig_update ON public.opportunity_signals FOR UPDATE TO authenticated USING (
  private.sig_can(auth.uid(),'signal.manage')
  OR (created_by = auth.uid() AND private.sig_can(auth.uid(),'signal.create') AND (status IS NULL OR status IN ('waiting','consulting'))))
  WITH CHECK (true);
CREATE POLICY sig_delete ON public.opportunity_signals FOR DELETE TO authenticated USING (private.sig_can(auth.uid(),'signal.manage'));

CREATE TABLE public.opportunity_signal_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid NOT NULL REFERENCES public.opportunity_signals(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  note text,
  status_from text,
  status_to text,
  next_contact_on date,
  revenue numeric,
  lost_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.opportunity_signal_notes(signal_id);
GRANT SELECT ON public.opportunity_signal_notes TO authenticated;
GRANT ALL ON public.opportunity_signal_notes TO service_role;
ALTER TABLE public.opportunity_signal_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY sig_notes_select ON public.opportunity_signal_notes FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.opportunity_signals s WHERE s.id = signal_id));

CREATE TABLE public.opportunity_signal_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid NOT NULL REFERENCES public.opportunity_signals(id) ON DELETE CASCADE,
  actor_id uuid,
  kind text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.opportunity_signal_events(signal_id);
GRANT SELECT ON public.opportunity_signal_events TO authenticated;
GRANT ALL ON public.opportunity_signal_events TO service_role;
ALTER TABLE public.opportunity_signal_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY sig_events_select ON public.opportunity_signal_events FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.opportunity_signals s WHERE s.id = signal_id));

-- Guard: protected fields only changed inside RPCs (flag set via set_config)
CREATE OR REPLACE FUNCTION public.sig_guard() RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
DECLARE rpc boolean := coalesce(current_setting('app.sig_rpc', true),'') = '1';
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_at := now(); NEW.updated_at := now();
    RETURN NEW;
  END IF;
  NEW.updated_at := now();
  IF NOT rpc THEN
    IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to OR NEW.status IS DISTINCT FROM OLD.status
      OR NEW.revenue IS DISTINCT FROM OLD.revenue OR NEW.lost_reason IS DISTINCT FROM OLD.lost_reason
      OR NEW.closed_at IS DISTINCT FROM OLD.closed_at OR NEW.next_contact_on IS DISTINCT FROM OLD.next_contact_on
      OR NEW.assigned_at IS DISTINCT FROM OLD.assigned_at OR NEW.created_by IS DISTINCT FROM OLD.created_by
      OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'Trường này chỉ đổi được qua thao tác phân công/tư vấn';
    END IF;
    IF OLD.status IN ('won','lost') THEN
      RAISE EXCEPTION 'Tín hiệu đã kết thúc — cần Quản lý mở lại trước khi sửa';
    END IF;
    INSERT INTO public.opportunity_signal_events(signal_id, actor_id, kind, detail)
      VALUES (NEW.id, auth.uid(), 'edit', jsonb_build_object('customer_name', OLD.customer_name, 'phone', OLD.phone, 'source', OLD.source));
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER sig_guard_trg BEFORE INSERT OR UPDATE ON public.opportunity_signals FOR EACH ROW EXECUTE FUNCTION public.sig_guard();

CREATE OR REPLACE FUNCTION public.signal_assign(_id uuid, _user uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE s public.opportunity_signals;
BEGIN
  IF NOT (private.sig_can(auth.uid(),'signal.assign') OR private.sig_can(auth.uid(),'signal.manage')) THEN
    RAISE EXCEPTION 'Bạn không có quyền phân công'; END IF;
  SELECT * INTO s FROM public.opportunity_signals WHERE id = _id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy tín hiệu'; END IF;
  IF s.status IN ('won','lost') THEN RAISE EXCEPTION 'Tín hiệu đã kết thúc'; END IF;
  IF _user IS NOT NULL AND NOT private.sig_can(_user,'signal.sale') THEN
    RAISE EXCEPTION 'Người nhận chưa có quyền Kinh doanh'; END IF;
  IF _user IS NOT DISTINCT FROM s.assigned_to THEN RETURN; END IF;
  PERFORM set_config('app.sig_rpc','1',true);
  UPDATE public.opportunity_signals SET assigned_to = _user,
    assigned_at = CASE WHEN _user IS NULL THEN NULL ELSE now() END,
    status = CASE WHEN _user IS NULL THEN NULL ELSE 'waiting' END
  WHERE id = _id;
  PERFORM set_config('app.sig_rpc','',true);
  INSERT INTO public.opportunity_signal_events(signal_id, actor_id, kind, detail)
    VALUES (_id, auth.uid(), 'assign', jsonb_build_object('from', s.assigned_to, 'to', _user));
END $$;

CREATE OR REPLACE FUNCTION public.signal_sale_update(_id uuid, _status text, _note text, _next date, _revenue numeric, _lost_reason text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE s public.opportunity_signals; ns text;
BEGIN
  SELECT * INTO s FROM public.opportunity_signals WHERE id = _id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy tín hiệu'; END IF;
  IF NOT ((s.assigned_to = auth.uid() AND private.sig_can(auth.uid(),'signal.sale')) OR private.sig_can(auth.uid(),'signal.manage')) THEN
    RAISE EXCEPTION 'Tín hiệu không được giao cho bạn'; END IF;
  IF s.assigned_to IS NULL THEN RAISE EXCEPTION 'Tín hiệu chưa được phân công'; END IF;
  IF s.status IN ('won','lost') THEN RAISE EXCEPTION 'Tín hiệu đã kết thúc'; END IF;
  ns := coalesce(_status, s.status);
  IF ns NOT IN ('waiting','consulting','won','lost') THEN RAISE EXCEPTION 'Trạng thái không hợp lệ'; END IF;
  IF ns = 'waiting' AND s.status = 'consulting' THEN RAISE EXCEPTION 'Không quay lại Chờ nhận'; END IF;
  IF ns = 'won' AND (_revenue IS NULL OR _revenue <= 0) THEN RAISE EXCEPTION 'Chốt bắt buộc nhập doanh số'; END IF;
  IF ns = 'lost' AND (_lost_reason IS NULL OR length(trim(_lost_reason)) = 0) THEN RAISE EXCEPTION 'Trượt bắt buộc chọn lý do'; END IF;
  IF ns = s.status AND coalesce(trim(_note),'') = '' AND _next IS NOT DISTINCT FROM s.next_contact_on THEN
    RAISE EXCEPTION 'Chưa có nội dung cập nhật'; END IF;
  IF length(_note) > 3000 THEN RAISE EXCEPTION 'Ghi chú quá dài'; END IF;
  PERFORM set_config('app.sig_rpc','1',true);
  UPDATE public.opportunity_signals SET status = ns,
    next_contact_on = CASE WHEN ns IN ('won','lost') THEN NULL ELSE _next END,
    revenue = CASE WHEN ns = 'won' THEN _revenue ELSE NULL END,
    lost_reason = CASE WHEN ns = 'lost' THEN _lost_reason ELSE NULL END,
    closed_at = CASE WHEN ns IN ('won','lost') THEN now() ELSE NULL END
  WHERE id = _id;
  PERFORM set_config('app.sig_rpc','',true);
  INSERT INTO public.opportunity_signal_notes(signal_id, author_id, note, status_from, status_to, next_contact_on, revenue, lost_reason)
    VALUES (_id, auth.uid(), nullif(trim(_note),''), s.status, ns, _next,
      CASE WHEN ns='won' THEN _revenue END, CASE WHEN ns='lost' THEN _lost_reason END);
END $$;

CREATE OR REPLACE FUNCTION public.signal_reopen(_id uuid, _reason text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE s public.opportunity_signals;
BEGIN
  IF NOT private.sig_can(auth.uid(),'signal.manage') THEN RAISE EXCEPTION 'Chỉ Quản lý được mở lại'; END IF;
  IF coalesce(trim(_reason),'') = '' THEN RAISE EXCEPTION 'Cần nhập lý do mở lại'; END IF;
  SELECT * INTO s FROM public.opportunity_signals WHERE id = _id FOR UPDATE;
  IF NOT FOUND OR s.status NOT IN ('won','lost') THEN RAISE EXCEPTION 'Tín hiệu chưa kết thúc'; END IF;
  PERFORM set_config('app.sig_rpc','1',true);
  UPDATE public.opportunity_signals SET status='consulting', revenue=NULL, lost_reason=NULL, closed_at=NULL WHERE id=_id;
  PERFORM set_config('app.sig_rpc','',true);
  INSERT INTO public.opportunity_signal_events(signal_id, actor_id, kind, detail)
    VALUES (_id, auth.uid(), 'reopen', jsonb_build_object('reason', _reason, 'prev_status', s.status, 'prev_revenue', s.revenue, 'prev_lost_reason', s.lost_reason));
END $$;

REVOKE ALL ON FUNCTION public.signal_assign(uuid,uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.signal_sale_update(uuid,text,text,date,numeric,text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.signal_reopen(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.signal_assign(uuid,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.signal_sale_update(uuid,text,text,date,numeric,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.signal_reopen(uuid,text) TO authenticated;

-- Danh sách Sale để phân công (chỉ người có quyền phân công gọi được)
CREATE OR REPLACE FUNCTION public.signal_sales_list() RETURNS TABLE(id uuid, full_name text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT p.id, p.full_name FROM public.profiles p
  WHERE (private.sig_can(auth.uid(),'signal.assign') OR private.sig_can(auth.uid(),'signal.manage'))
    AND private.sig_can(p.id,'signal.sale') ORDER BY p.full_name;
$$;
REVOKE ALL ON FUNCTION public.signal_sales_list() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.signal_sales_list() TO authenticated;