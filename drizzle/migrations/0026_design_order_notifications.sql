ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS order_id text REFERENCES public.orders(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS notifications_order_idx ON public.notifications(order_id);
ALTER TABLE public.notifications DROP CONSTRAINT notifications_kind_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_kind_check CHECK (kind = ANY (ARRAY['signal_new','signal_assigned','signal_care','leave_pending','leave_result','leave_cancel_request','leave_remind','leave_cc','att_witness','att_new','att_result','att_changed','att_submitted','content_assigned','content_review','content_revise','content_approved','content_published','content_remind','order_new','order_assigned','order_taken','order_review','order_revise','order_approved','order_delivered','order_remind']));

UPDATE public.content_notify_settings SET data = data || '{"order":{"zalo":{"order_new":false,"order_assigned":true,"order_taken":false,"order_review":true,"order_revise":true,"order_approved":false,"order_delivered":true,"order_remind":false},"remind":{"enabled":false,"hours":24}}}'::jsonb
WHERE id = 1 AND NOT (data ? 'order');

-- Lưu gộp: mỗi khu vực cài đặt chỉ ghi phần của mình
CREATE OR REPLACE FUNCTION public.content_notify_save(_data jsonb) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT (public.is_admin(auth.uid()) OR public.has_permission(auth.uid(), 'settings.system_edit')) THEN
    RAISE EXCEPTION 'Bạn không có quyền thay đổi cài đặt thông báo';
  END IF;
  IF jsonb_typeof(_data) <> 'object' THEN RAISE EXCEPTION 'Dữ liệu không hợp lệ'; END IF;
  UPDATE public.content_notify_settings SET data = data || _data, updated_by = auth.uid(), updated_at = now() WHERE id = 1;
END $$;

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

  -- A. Order mới chưa phân công → người có quyền phân công
  IF st = 'Chờ phân công' AND coalesce(d->>'assignee','') = '' AND (TG_OP = 'INSERT' OR ost IS DISTINCT FROM st) THEN
    INSERT INTO public.notifications(recipient_id, kind, order_id, payload, dedup_key)
    SELECT p.id, 'order_new', NEW.id, _p, 'od:new:'||NEW.id||':'||rnd||':'||p.id
    FROM public.profiles p WHERE p.status = 'Đang hoạt động' AND (public.has_permission(p.id, 'order.assign') OR public.is_admin(p.id))
      AND p.id IS DISTINCT FROM _req
    ON CONFLICT (dedup_key) DO NOTHING;
  END IF;

  -- B. Phân công / đổi người → chỉ người mới được giao (bỏ qua nếu Task liên kết đã báo giao việc cho cùng người)
  IF _asg IS NOT NULL AND coalesce(d->>'assignee','') <> coalesce(o->>'assignee','')
     AND coalesce(st,'') NOT IN ('Hoàn thành','Đã hủy')
     AND NOT EXISTS (SELECT 1 FROM public.notifications n WHERE coalesce(d->>'taskId','') <> '' AND n.dedup_key = 'task_assigned:'||(d->>'taskId')||':'||_asg) THEN
    INSERT INTO public.notifications(recipient_id, kind, order_id, payload, dedup_key)
    VALUES (_asg, 'order_assigned', NEW.id, _p, 'od:assigned:'||NEW.id||':'||rnd||':'||_asg) ON CONFLICT (dedup_key) DO NOTHING;
  END IF;

  IF TG_OP = 'INSERT' OR st IS NOT DISTINCT FROM ost THEN RETURN NEW; END IF;

  -- C. Nhận việc → người yêu cầu
  IF st = 'Đang thực hiện' AND ost = 'Chờ nhận việc' AND _req IS NOT NULL AND _req IS DISTINCT FROM _asg THEN
    INSERT INTO public.notifications(recipient_id, kind, order_id, payload, dedup_key)
    VALUES (_req, 'order_taken', NEW.id, _p, 'od:taken:'||NEW.id||':'||rnd||':'||_req) ON CONFLICT (dedup_key) DO NOTHING;
  -- D. Gửi duyệt / gửi lại → người duyệt
  ELSIF st = 'Chờ duyệt' AND _rev IS NOT NULL AND _rev IS DISTINCT FROM _asg THEN
    INSERT INTO public.notifications(recipient_id, kind, order_id, payload, dedup_key)
    VALUES (_rev, 'order_review', NEW.id, _p, 'od:review:'||NEW.id||':'||rnd||':'||_rev) ON CONFLICT (dedup_key) DO NOTHING;
  -- E. Yêu cầu chỉnh sửa → người thiết kế
  ELSIF st = 'Cần sửa' AND _asg IS NOT NULL THEN
    INSERT INTO public.notifications(recipient_id, kind, order_id, payload, dedup_key)
    VALUES (_asg, 'order_revise', NEW.id, _p, 'od:revise:'||NEW.id||':'||rnd||':'||_asg) ON CONFLICT (dedup_key) DO NOTHING;
  -- F. Được duyệt → người thiết kế
  ELSIF st = 'Đã duyệt' AND _asg IS NOT NULL THEN
    INSERT INTO public.notifications(recipient_id, kind, order_id, payload, dedup_key)
    VALUES (_asg, 'order_approved', NEW.id, _p, 'od:approved:'||NEW.id||':'||rnd||':'||_asg) ON CONFLICT (dedup_key) DO NOTHING;
  -- G. Bàn giao → người xác nhận theo quy trình hiện tại (người duyệt; mặc định người yêu cầu khi chưa chỉ định)
  ELSIF st = 'Đã bàn giao' AND _rev IS NOT NULL AND _rev IS DISTINCT FROM _asg THEN
    INSERT INTO public.notifications(recipient_id, kind, order_id, payload, dedup_key)
    VALUES (_rev, 'order_delivered', NEW.id, _p, 'od:delivered:'||NEW.id||':'||rnd||':'||_rev) ON CONFLICT (dedup_key) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER order_notify AFTER INSERT OR UPDATE OF data ON public.orders FOR EACH ROW EXECUTE FUNCTION public.order_notify();

CREATE OR REPLACE FUNCTION public.order_remind_run() RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cfg jsonb; _h int; n int := 0; r record; _u uuid; _t timestamptz; _day text := to_char(now() AT TIME ZONE 'Asia/Ho_Chi_Minh','YYYY-MM-DD');
BEGIN
  SELECT data->'order'->'remind' INTO cfg FROM public.content_notify_settings WHERE id = 1;
  IF cfg IS NULL OR NOT coalesce((cfg->>'enabled')::boolean,false) THEN RETURN 0; END IF;
  _h := greatest(1, coalesce((cfg->>'hours')::int, 24));
  FOR r IN SELECT id, data FROM public.orders WHERE NOT is_demo AND data->>'status' IN ('Chờ nhận việc','Chờ duyệt','Đã bàn giao') LOOP
    BEGIN
      IF r.data->>'status' = 'Chờ nhận việc' THEN _u := public.cw_uid(r.data->>'assignee'); _t := (r.data->>'assignedAt')::timestamptz;
      ELSIF r.data->>'status' = 'Chờ duyệt' THEN _u := public.cw_uid(coalesce(nullif(r.data->>'reviewer',''), r.data->>'requester')); _t := (r.data->>'submittedAt')::timestamptz;
      ELSE _u := public.cw_uid(coalesce(nullif(r.data->>'reviewer',''), r.data->>'requester')); _t := (r.data->>'deliveredAt')::timestamptz;
      END IF;
    EXCEPTION WHEN OTHERS THEN CONTINUE;
    END;
    IF _u IS NULL OR _t IS NULL OR _t > now() - make_interval(hours => _h) THEN CONTINUE; END IF;
    INSERT INTO public.notifications(recipient_id, kind, order_id, payload, dedup_key)
    VALUES (_u, 'order_remind', r.id, jsonb_build_object('title', r.data->>'title', 'status', r.data->>'status', 'assignee', r.data->>'assignee'), 'od:remind:'||_day||':'||r.id)
    ON CONFLICT (dedup_key) DO NOTHING;
    IF FOUND THEN n := n + 1; END IF;
  END LOOP;
  RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.order_remind_run() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.order_remind_run() TO service_role;

CREATE OR REPLACE FUNCTION public.push_wake() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _tok text;
BEGIN
  IF NEW.kind NOT IN ('signal_new','signal_assigned','leave_pending','leave_result','leave_cancel_request','leave_cc','att_witness','att_new')
     AND NEW.kind NOT LIKE 'content\_%' AND NEW.kind NOT LIKE 'order\_%' THEN RETURN NEW; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.push_subscriptions WHERE user_id = NEW.recipient_id AND status = 'active') THEN RETURN NEW; END IF;
  SELECT token INTO _tok FROM public.push_config WHERE id = 1;
  BEGIN
    PERFORM net.http_post(url := 'https://base.suviet.vn/api/public/push/dispatch',
      headers := jsonb_build_object('Content-Type','application/json','x-push-token', _tok), body := '{}'::jsonb);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.leave_zalo_wake() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _tok text; _on boolean;
BEGIN
  IF NEW.kind NOT IN ('leave_pending','leave_result','leave_cancel_request','leave_cc','att_witness','att_new')
     AND NEW.kind NOT LIKE 'content\_%' AND NEW.kind NOT LIKE 'order\_%' THEN RETURN NEW; END IF;
  IF NEW.kind LIKE 'content\_%' THEN
    SELECT coalesce((data->'zalo'->>NEW.kind)::boolean, false) INTO _on FROM public.content_notify_settings WHERE id = 1;
    IF NOT coalesce(_on,false) THEN RETURN NEW; END IF;
  ELSIF NEW.kind LIKE 'order\_%' THEN
    SELECT coalesce((data->'order'->'zalo'->>NEW.kind)::boolean, false) INTO _on FROM public.content_notify_settings WHERE id = 1;
    IF NOT coalesce(_on,false) THEN RETURN NEW; END IF;
  END IF;
  SELECT care_cron_token INTO _tok FROM public.zalo_oa_config WHERE id = 1 AND auto_send AND status = 'connected';
  IF _tok IS NULL THEN RETURN NEW; END IF;
  BEGIN
    PERFORM net.http_post(url := 'https://base.suviet.vn/api/public/zalo/dispatch-cron',
      headers := jsonb_build_object('Content-Type','application/json','x-care-token', _tok), body := '{}'::jsonb);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  RETURN NEW;
END $$;