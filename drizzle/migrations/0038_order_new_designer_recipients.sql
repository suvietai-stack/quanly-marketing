CREATE OR REPLACE FUNCTION private.is_designer(_uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.app_roles r ON r.id = ur.role_id
    WHERE ur.user_id = _uid AND lower(regexp_replace(trim(r.name), '\s+', ' ', 'g')) = 'designer / chụp ảnh');
$$;

CREATE OR REPLACE FUNCTION public.order_notify() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  d jsonb := NEW.data; o jsonb := CASE WHEN TG_OP = 'UPDATE' THEN OLD.data ELSE '{}'::jsonb END;
  st text := d->>'status'; ost text := o->>'status';
  h jsonb := CASE WHEN jsonb_typeof(d->'history')='array' THEN d->'history' ELSE '[]'::jsonb END;
  rnd text := jsonb_array_length(h)::text;
  _actor text := h->(jsonb_array_length(h)-1)->>'byName';
  _asg uuid := public.cw_uid(d->>'assignee');
  _req uuid := public.cw_uid(d->>'requester');
  _rev uuid := public.cw_uid(coalesce(nullif(d->>'reviewer',''), d->>'requester'));
  _p jsonb; _brand text;
BEGIN
  IF NEW.is_demo THEN RETURN NEW; END IF;
  SELECT data->>'name' INTO _brand FROM public.brands WHERE id = d->>'brandId';
  _p := jsonb_build_object('title', d->>'title', 'brand', _brand, 'status', st, 'requester', d->>'requester', 'assignee', d->>'assignee',
    'reviewer', coalesce(nullif(d->>'reviewer',''), d->>'requester'), 'deadline', d->>'deadline', 'priority', d->>'priority', 'actor', _actor, 'at', now());

  -- Order mới chưa phân công → chỉ tài khoản thuộc vai trò Designer / Chụp ảnh (không gửi Admin chỉ vì là Admin)
  IF st = 'Chờ phân công' AND coalesce(d->>'assignee','') = '' AND (TG_OP = 'INSERT' OR ost IS DISTINCT FROM st) THEN
    INSERT INTO public.notifications(recipient_id, kind, order_id, payload, dedup_key)
    SELECT p.id, 'order_new', NEW.id, _p, 'od:new:'||NEW.id||':'||rnd||':'||p.id
    FROM public.profiles p WHERE p.status = 'Đang hoạt động' AND private.is_designer(p.id)
      AND p.id IS DISTINCT FROM _req
    ON CONFLICT (dedup_key) DO NOTHING;
  END IF;

  -- Phân công / đổi người → chỉ người mới được giao (không báo khi tự nhận Job)
  IF _asg IS NOT NULL AND coalesce(d->>'assignee','') <> coalesce(o->>'assignee','')
     AND coalesce(st,'') NOT IN ('Hoàn thành','Đã hủy') AND _asg IS DISTINCT FROM auth.uid() THEN
    INSERT INTO public.notifications(recipient_id, kind, order_id, payload, dedup_key)
    VALUES (_asg, 'order_assigned', NEW.id, _p, 'od:assigned:'||NEW.id||':'||rnd||':'||_asg) ON CONFLICT (dedup_key) DO NOTHING;
  END IF;

  IF TG_OP = 'INSERT' OR st IS NOT DISTINCT FROM ost THEN RETURN NEW; END IF;

  IF st = 'Đang thực hiện' AND ost IN ('Chờ nhận việc','Chờ phân công') AND _req IS NOT NULL AND _req IS DISTINCT FROM _asg THEN
    INSERT INTO public.notifications(recipient_id, kind, order_id, payload, dedup_key)
    VALUES (_req, 'order_taken', NEW.id, _p, 'od:taken:'||NEW.id||':'||rnd||':'||_req) ON CONFLICT (dedup_key) DO NOTHING;
  ELSIF st = 'Chờ duyệt' AND _rev IS NOT NULL AND _rev IS DISTINCT FROM _asg THEN
    INSERT INTO public.notifications(recipient_id, kind, order_id, payload, dedup_key)
    VALUES (_rev, 'order_review', NEW.id, _p, 'od:review:'||NEW.id||':'||rnd||':'||_rev) ON CONFLICT (dedup_key) DO NOTHING;
  ELSIF st = 'Cần sửa' AND _asg IS NOT NULL THEN
    INSERT INTO public.notifications(recipient_id, kind, order_id, payload, dedup_key)
    VALUES (_asg, 'order_revise', NEW.id, _p, 'od:revise:'||NEW.id||':'||rnd||':'||_asg) ON CONFLICT (dedup_key) DO NOTHING;
  ELSIF st = 'Đã duyệt' AND _asg IS NOT NULL THEN
    INSERT INTO public.notifications(recipient_id, kind, order_id, payload, dedup_key)
    VALUES (_asg, 'order_approved', NEW.id, _p, 'od:approved:'||NEW.id||':'||rnd||':'||_asg) ON CONFLICT (dedup_key) DO NOTHING;
  ELSIF st = 'Đã bàn giao' AND _rev IS NOT NULL AND _rev IS DISTINCT FROM _asg THEN
    INSERT INTO public.notifications(recipient_id, kind, order_id, payload, dedup_key)
    VALUES (_rev, 'order_delivered', NEW.id, _p, 'od:delivered:'||NEW.id||':'||rnd||':'||_rev) ON CONFLICT (dedup_key) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

-- Designer tự nhận Job (atomic)
CREATE OR REPLACE FUNCTION public.order_take_job(_id text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _name text; _d jsonb; _now text := to_char(now() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập'; END IF;
  IF NOT (public.has_permission(_uid,'order.take') AND private.is_designer(_uid)) THEN
    RAISE EXCEPTION 'Bạn cần quyền Nhận việc và thuộc vai trò Designer / Chụp ảnh'; END IF;
  SELECT coalesce(nullif(trim(full_name),''), username) INTO _name FROM public.profiles WHERE id = _uid AND status = 'Đang hoạt động';
  IF _name IS NULL THEN RAISE EXCEPTION 'Tài khoản không hoạt động'; END IF;
  SELECT data INTO _d FROM public.orders WHERE id = _id AND NOT is_demo FOR UPDATE;
  IF _d IS NULL THEN RAISE EXCEPTION 'Không tìm thấy order'; END IF;
  IF coalesce(_d->>'assignee','') <> '' THEN RAISE EXCEPTION 'Job đã được người khác nhận.'; END IF;
  IF _d->>'status' IS DISTINCT FROM 'Chờ phân công' THEN RAISE EXCEPTION 'Order không còn ở trạng thái Chờ phân công'; END IF;
  UPDATE public.orders SET updated_at = now(), data = _d || jsonb_build_object(
    'assignee', _name, 'status', 'Đang thực hiện', 'assignedBy', _name, 'assignedAt', _now, 'takenAt', _now,
    'history', coalesce(CASE WHEN jsonb_typeof(_d->'history')='array' THEN _d->'history' END, '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
      'at', _now, 'byId', _uid, 'byName', _name, 'action', _name || ' đã nhận Job', 'fromStatus', 'Chờ phân công', 'toStatus', 'Đang thực hiện')))
  WHERE id = _id;
END $$;
REVOKE ALL ON FUNCTION public.order_take_job(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.order_take_job(text) TO authenticated;