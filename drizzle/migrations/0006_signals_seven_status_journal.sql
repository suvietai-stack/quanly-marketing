ALTER TABLE public.opportunity_signals DROP CONSTRAINT opportunity_signals_status_check;
ALTER TABLE public.opportunity_signals ADD CONSTRAINT opportunity_signals_status_check
  CHECK (status = ANY (ARRAY['waiting','contacting','consulting','quoted','deposit','won','lost']));
ALTER TABLE public.opportunity_signals ADD COLUMN IF NOT EXISTS next_contact_at timestamptz;
ALTER TABLE public.opportunity_signal_notes ADD COLUMN IF NOT EXISTS event_type text;
ALTER TABLE public.opportunity_signal_notes ADD COLUMN IF NOT EXISTS channel text;
ALTER TABLE public.opportunity_signal_notes ADD COLUMN IF NOT EXISTS next_contact_at timestamptz;

CREATE OR REPLACE FUNCTION public.sig_guard()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $function$
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
      OR NEW.next_contact_at IS DISTINCT FROM OLD.next_contact_at
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
END $function$;

DROP FUNCTION IF EXISTS public.signal_sale_update(uuid, text, text, date, numeric, text);
CREATE FUNCTION public.signal_sale_update(_id uuid, _status text, _note text, _next date, _revenue numeric, _lost_reason text,
  _event text DEFAULT NULL, _channel text DEFAULT NULL, _next_at timestamptz DEFAULT NULL)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE s public.opportunity_signals; ns text; nd date; nat timestamptz;
BEGIN
  SELECT * INTO s FROM public.opportunity_signals WHERE id = _id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy tín hiệu'; END IF;
  IF NOT ((s.assigned_to = auth.uid() AND private.sig_can(auth.uid(),'signal.sale')) OR private.sig_can(auth.uid(),'signal.manage')) THEN
    RAISE EXCEPTION 'Tín hiệu không được giao cho bạn'; END IF;
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
REVOKE ALL ON FUNCTION public.signal_sale_update(uuid, text, text, date, numeric, text, text, text, timestamptz) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.signal_sale_update(uuid, text, text, date, numeric, text, text, text, timestamptz) TO authenticated;

CREATE OR REPLACE FUNCTION public.signal_reopen(_id uuid, _reason text)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
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
    VALUES (_id, auth.uid(), 'reopen', jsonb_build_object('reason', _reason, 'prev_status', s.status, 'prev_revenue', s.revenue, 'prev_lost_reason', s.lost_reason, 'prev_closed_at', s.closed_at));
END $function$;