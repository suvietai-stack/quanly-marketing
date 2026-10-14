CREATE OR REPLACE FUNCTION public.signal_assign(_id uuid, _user uuid)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE s public.opportunity_signals;
BEGIN
  SELECT * INTO s FROM public.opportunity_signals WHERE id = _id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy tín hiệu'; END IF;
  IF s.assigned_to IS NULL THEN
    IF NOT private.sig_can(auth.uid(),'signal.assign') THEN
      RAISE EXCEPTION 'Bạn không có quyền Phân công Sale'; END IF;
  ELSE
    IF NOT private.sig_can(auth.uid(),'signal.reassign') THEN
      RAISE EXCEPTION 'Bạn không có quyền Đổi Sale'; END IF;
  END IF;
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
END $function$;