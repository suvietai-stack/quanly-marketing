ALTER TABLE public.opportunity_signals
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_by uuid,
  ADD COLUMN IF NOT EXISTS cancel_reason text;

DROP POLICY IF EXISTS sig_update ON public.opportunity_signals;
CREATE POLICY sig_update ON public.opportunity_signals FOR UPDATE TO authenticated
USING (
  private.sig_can(auth.uid(),'signal.manage') OR private.sig_can(auth.uid(),'signal.edit')
  OR (created_by = auth.uid() AND private.sig_can(auth.uid(),'signal.create') AND (status IS NULL OR status IN ('waiting','consulting')))
)
WITH CHECK (
  private.sig_can(auth.uid(),'signal.manage') OR private.sig_can(auth.uid(),'signal.edit')
  OR (created_by = auth.uid() AND private.sig_can(auth.uid(),'signal.create') AND (status IS NULL OR status IN ('waiting','consulting')))
);

DROP POLICY IF EXISTS sig_delete ON public.opportunity_signals;
CREATE POLICY sig_delete ON public.opportunity_signals FOR DELETE TO authenticated
USING (
  (private.sig_can(auth.uid(),'signal.manage') OR private.sig_can(auth.uid(),'signal.delete'))
  AND (status IS NULL OR status NOT IN ('won','lost'))
  AND NOT EXISTS (SELECT 1 FROM public.opportunity_signal_notes n WHERE n.signal_id = opportunity_signals.id)
);

CREATE OR REPLACE FUNCTION public.sig_guard()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $function$
DECLARE rpc boolean := coalesce(current_setting('app.sig_rpc', true),'') = '1';
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_at := now(); NEW.updated_at := now();
    NEW.cancelled_at := NULL; NEW.cancelled_by := NULL; NEW.cancel_reason := NULL;
    RETURN NEW;
  END IF;
  NEW.updated_at := now();
  IF NOT rpc THEN
    IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to OR NEW.status IS DISTINCT FROM OLD.status
      OR NEW.revenue IS DISTINCT FROM OLD.revenue OR NEW.lost_reason IS DISTINCT FROM OLD.lost_reason
      OR NEW.closed_at IS DISTINCT FROM OLD.closed_at OR NEW.next_contact_on IS DISTINCT FROM OLD.next_contact_on
      OR NEW.next_contact_at IS DISTINCT FROM OLD.next_contact_at
      OR NEW.assigned_at IS DISTINCT FROM OLD.assigned_at OR NEW.created_by IS DISTINCT FROM OLD.created_by
      OR NEW.created_at IS DISTINCT FROM OLD.created_at
      OR NEW.cancelled_at IS DISTINCT FROM OLD.cancelled_at OR NEW.cancelled_by IS DISTINCT FROM OLD.cancelled_by
      OR NEW.cancel_reason IS DISTINCT FROM OLD.cancel_reason THEN
      RAISE EXCEPTION 'Trường này chỉ đổi được qua thao tác phân công/tư vấn';
    END IF;
    IF OLD.status IN ('won','lost') THEN
      RAISE EXCEPTION 'Tín hiệu đã kết thúc — cần Quản lý mở lại trước khi sửa';
    END IF;
    IF OLD.cancelled_at IS NOT NULL THEN
      RAISE EXCEPTION 'Tín hiệu đã hủy — cần bỏ hủy trước khi sửa';
    END IF;
    INSERT INTO public.opportunity_signal_events(signal_id, actor_id, kind, detail)
      VALUES (NEW.id, auth.uid(), 'edit', jsonb_build_object('customer_name', OLD.customer_name, 'phone', OLD.phone, 'source', OLD.source));
  END IF;
  RETURN NEW;
END $function$;

CREATE OR REPLACE FUNCTION public.signal_cancel(_id uuid, _reason text, _undo boolean DEFAULT false)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE s public.opportunity_signals;
BEGIN
  IF NOT private.sig_can(auth.uid(),'signal.manage') THEN RAISE EXCEPTION 'Chỉ Quản lý mới được hủy tín hiệu'; END IF;
  SELECT * INTO s FROM public.opportunity_signals WHERE id = _id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy tín hiệu'; END IF;
  IF NOT _undo AND (_reason IS NULL OR length(trim(_reason)) = 0) THEN RAISE EXCEPTION 'Bắt buộc nhập lý do hủy'; END IF;
  IF length(_reason) > 500 THEN RAISE EXCEPTION 'Lý do quá dài'; END IF;
  IF _undo AND s.cancelled_at IS NULL THEN RAISE EXCEPTION 'Tín hiệu chưa bị hủy'; END IF;
  IF NOT _undo AND s.cancelled_at IS NOT NULL THEN RAISE EXCEPTION 'Tín hiệu đã hủy'; END IF;
  PERFORM set_config('app.sig_rpc','1',true);
  UPDATE public.opportunity_signals SET
    cancelled_at = CASE WHEN _undo THEN NULL ELSE now() END,
    cancelled_by = CASE WHEN _undo THEN NULL ELSE auth.uid() END,
    cancel_reason = CASE WHEN _undo THEN NULL ELSE trim(_reason) END
  WHERE id = _id;
  PERFORM set_config('app.sig_rpc','',true);
  INSERT INTO public.opportunity_signal_events(signal_id, actor_id, kind, detail)
    VALUES (_id, auth.uid(), CASE WHEN _undo THEN 'uncancel' ELSE 'cancel' END,
      jsonb_build_object('reason', nullif(trim(coalesce(_reason,'')),''), 'prev_reason', s.cancel_reason));
END $function$;
REVOKE ALL ON FUNCTION public.signal_cancel(uuid,text,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.signal_cancel(uuid,text,boolean) TO authenticated;

CREATE OR REPLACE FUNCTION public.signal_sale_update(_id uuid, _status text, _note text, _next date, _revenue numeric, _lost_reason text, _event text DEFAULT NULL::text, _channel text DEFAULT NULL::text, _next_at timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE s public.opportunity_signals; ns text; nd date; nat timestamptz;
BEGIN
  SELECT * INTO s FROM public.opportunity_signals WHERE id = _id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy tín hiệu'; END IF;
  IF NOT ((s.assigned_to = auth.uid() AND private.sig_can(auth.uid(),'signal.sale')) OR private.sig_can(auth.uid(),'signal.manage')) THEN
    RAISE EXCEPTION 'Tín hiệu không được giao cho bạn'; END IF;
  IF s.cancelled_at IS NOT NULL THEN RAISE EXCEPTION 'Tín hiệu đã hủy'; END IF;
  IF s.assigned_to IS NULL THEN RAISE EXCEPTION 'Tín hiệu chưa được phân công'; END IF;
  IF s.status IN ('won','lost') THEN RAISE EXCEPTION 'Tín hiệu đã kết thúc'; END IF;
  ns := coalesce(_status, s.status);
  IF ns NOT IN ('waiting','contacting','consulting','quoted','deposit','won','lost') THEN RAISE EXCEPTION 'Trạng thái không hợp lệ'; END IF;
  IF ns = 'won' AND (_revenue IS NULL OR _revenue <= 0) THEN RAISE EXCEPTION 'Chốt bắt buộc nhập doanh số'; END IF;
  IF ns = 'lost' AND (_lost_reason IS NULL OR length(trim(_lost_reason)) = 0) THEN RAISE EXCEPTION 'Trượt bắt buộc chọn lý do'; END IF;
  IF length(_note) > 3000 OR length(_lost_reason) > 500 OR length(_event) > 200 OR length(_channel) > 50 THEN RAISE EXCEPTION 'Nội dung quá dài'; END IF;
  nat := _next_at;
  nd := coalesce(_next, CASE WHEN _next_at IS NOT NULL THEN (_next_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date END);
  IF ns = s.status AND coalesce(trim(_note),'') = '' AND coalesce(trim(_event),'') = ''
     AND nd IS NOT DISTINCT FROM s.next_contact_on AND nat IS NOT DISTINCT FROM s.next_contact_at THEN
    RAISE EXCEPTION 'Chưa có nội dung cập nhật'; END IF;
  PERFORM set_config('app.sig_rpc','1',true);
  UPDATE public.opportunity_signals SET status = ns,
    next_contact_on = CASE WHEN ns IN ('won','lost') THEN NULL ELSE nd END,
    next_contact_at = CASE WHEN ns IN ('won','lost') THEN NULL ELSE nat END,
    revenue = CASE WHEN ns = 'won' THEN _revenue ELSE NULL END,
    lost_reason = CASE WHEN ns = 'lost' THEN trim(_lost_reason) ELSE NULL END,
    closed_at = CASE WHEN ns IN ('won','lost') THEN now() ELSE NULL END
  WHERE id = _id;
  PERFORM set_config('app.sig_rpc','',true);
  INSERT INTO public.opportunity_signal_notes(signal_id, author_id, note, status_from, status_to, next_contact_on, next_contact_at, revenue, lost_reason, event_type, channel)
    VALUES (_id, auth.uid(), nullif(trim(_note),''), s.status, ns, nd, nat,
      CASE WHEN ns='won' THEN _revenue END, CASE WHEN ns='lost' THEN trim(_lost_reason) END,
      nullif(trim(_event),''), coalesce(nullif(trim(_channel),''),'Zalo'));
END $function$;