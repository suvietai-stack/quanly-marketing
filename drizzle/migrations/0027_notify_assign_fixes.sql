CREATE OR REPLACE FUNCTION public.cw_reviewer(d jsonb, st text) RETURNS text
LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE
    WHEN st LIKE '%outline' THEN d->>'outlineReviewer'
    WHEN st LIKE '%tối ưu' THEN coalesce(nullif(d->>'optimizeReviewer',''), d->>'draftReviewer')
    WHEN st LIKE '%bản nháp web' THEN coalesce(nullif(d->>'webDraftReviewer',''), d->>'draftReviewer')
    ELSE d->>'draftReviewer' END;
$$;

CREATE OR REPLACE FUNCTION public.content_notify() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  d jsonb := NEW.data; o jsonb := CASE WHEN TG_OP = 'UPDATE' THEN OLD.data ELSE '{}'::jsonb END;
  st text := d->>'status'; ost text := o->>'status';
  rnd text := coalesce(jsonb_array_length(CASE WHEN jsonb_typeof(d->'history')='array' THEN d->'history' END),0)::text;
  _writer uuid := public.cw_uid(d->>'writer'); _u uuid; _rev text; _p jsonb; _site text;
  _inactive text[] := ARRAY['Kế hoạch','Đã hủy','Hoàn thành','Đã đăng web','Kiểm tra index'];
BEGIN
  IF NEW.is_demo THEN RETURN NEW; END IF;
  SELECT data->>'name' INTO _site FROM public.websites WHERE id = d->>'websiteId';
  _p := jsonb_build_object('title', d->>'title', 'website', _site, 'status', st, 'writer', d->>'writer', 'assigner', d->>'assigner', 'deadline', d->>'deadline', 'at', now());

  -- A. Giao bài: người viết mới được gán, HOẶC bài chuyển từ Kế hoạch sang giao (người viết đã chọn sẵn)
  IF _writer IS NOT NULL AND NOT (coalesce(st,'') = ANY(_inactive))
     AND (coalesce(d->>'writer','') <> coalesce(o->>'writer','') OR coalesce(ost,'') = 'Kế hoạch')
     AND _writer IS DISTINCT FROM public.cw_uid(d->>'assigner') THEN
    INSERT INTO public.notifications(recipient_id, kind, content_id, payload, dedup_key)
    VALUES (_writer, 'content_assigned', NEW.id, _p, 'cw:assigned:'||NEW.id||':'||_writer) ON CONFLICT (dedup_key) DO NOTHING;
  END IF;

  IF st IS NOT DISTINCT FROM ost THEN RETURN NEW; END IF;

  IF st IN ('Chờ duyệt outline','Chờ duyệt bài','Chờ duyệt bản nháp web','Chờ duyệt tối ưu') THEN
    _rev := public.cw_reviewer(d, st);
    _u := public.cw_uid(_rev);
    IF _u IS NOT NULL THEN
      INSERT INTO public.notifications(recipient_id, kind, content_id, payload, dedup_key)
      VALUES (_u, 'content_review', NEW.id, _p || jsonb_build_object('reviewer', _rev), 'cw:review:'||NEW.id||':'||st||':'||rnd||':'||_u) ON CONFLICT (dedup_key) DO NOTHING;
    END IF;
  ELSIF st IN ('Cần sửa outline','Cần sửa bài','Cần sửa bản nháp web','Cần sửa tối ưu') AND _writer IS NOT NULL THEN
    _rev := public.cw_reviewer(d, st);
    INSERT INTO public.notifications(recipient_id, kind, content_id, payload, dedup_key)
    VALUES (_writer, 'content_revise', NEW.id, _p || jsonb_build_object('reviewer', _rev), 'cw:revise:'||NEW.id||':'||st||':'||rnd||':'||_writer) ON CONFLICT (dedup_key) DO NOTHING;
  ELSIF st IN ('Outline đã duyệt','Bài viết đã duyệt','Bản nháp web đã duyệt','Đã duyệt tối ưu') THEN
    INSERT INTO public.notifications(recipient_id, kind, content_id, payload, dedup_key)
    SELECT u, 'content_approved', NEW.id, _p, 'cw:approved:'||NEW.id||':'||st||':'||rnd||':'||u
    FROM (SELECT _writer AS u UNION SELECT CASE WHEN st IN ('Bản nháp web đã duyệt','Bài viết đã duyệt') THEN public.cw_uid(d->>'publisher') END) x
    WHERE u IS NOT NULL ON CONFLICT (dedup_key) DO NOTHING;
  ELSIF st = 'Đã đăng web' AND _writer IS NOT NULL THEN
    INSERT INTO public.notifications(recipient_id, kind, content_id, payload, dedup_key)
    VALUES (_writer, 'content_published', NEW.id, _p, 'cw:published:'||NEW.id||':'||_writer) ON CONFLICT (dedup_key) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.content_remind_run() RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cfg jsonb; _h int; n int := 0; r record; _u uuid; _last timestamptz; _day text := to_char(now() AT TIME ZONE 'Asia/Ho_Chi_Minh','YYYY-MM-DD');
BEGIN
  SELECT data->'remind' INTO cfg FROM public.content_notify_settings WHERE id = 1;
  IF cfg IS NULL OR NOT coalesce((cfg->>'enabled')::boolean,false) THEN RETURN 0; END IF;
  _h := greatest(1, coalesce((cfg->>'hours')::int, 24));
  FOR r IN SELECT id, data FROM public.web_contents WHERE NOT is_demo AND data->>'status' IN ('Chờ duyệt outline','Chờ duyệt bài','Chờ duyệt bản nháp web','Chờ duyệt tối ưu') LOOP
    _u := public.cw_uid(public.cw_reviewer(r.data, r.data->>'status'));
    IF _u IS NULL THEN CONTINUE; END IF;
    SELECT max(created_at) INTO _last FROM public.notifications WHERE content_id = r.id AND kind = 'content_review' AND payload->>'status' = r.data->>'status';
    IF _last IS NULL OR _last > now() - make_interval(hours => _h) THEN CONTINUE; END IF;
    INSERT INTO public.notifications(recipient_id, kind, content_id, payload, dedup_key)
    VALUES (_u, 'content_remind', r.id, jsonb_build_object('title', r.data->>'title', 'status', r.data->>'status', 'writer', r.data->>'writer'), 'cw:remind:'||_day||':'||r.id)
    ON CONFLICT (dedup_key) DO NOTHING;
    IF FOUND THEN n := n + 1; END IF;
  END LOOP;
  RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.content_remind_run() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.content_remind_run() TO service_role;

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

  IF st = 'Chờ phân công' AND coalesce(d->>'assignee','') = '' AND (TG_OP = 'INSERT' OR ost IS DISTINCT FROM st) THEN
    INSERT INTO public.notifications(recipient_id, kind, order_id, payload, dedup_key)
    SELECT p.id, 'order_new', NEW.id, _p, 'od:new:'||NEW.id||':'||rnd||':'||p.id
    FROM public.profiles p WHERE p.status = 'Đang hoạt động' AND (public.has_permission(p.id, 'order.assign') OR public.is_admin(p.id))
      AND p.id IS DISTINCT FROM _req
    ON CONFLICT (dedup_key) DO NOTHING;
  END IF;

  -- Phân công / đổi người → chỉ người mới được giao
  IF _asg IS NOT NULL AND coalesce(d->>'assignee','') <> coalesce(o->>'assignee','')
     AND coalesce(st,'') NOT IN ('Hoàn thành','Đã hủy') THEN
    INSERT INTO public.notifications(recipient_id, kind, order_id, payload, dedup_key)
    VALUES (_asg, 'order_assigned', NEW.id, _p, 'od:assigned:'||NEW.id||':'||rnd||':'||_asg) ON CONFLICT (dedup_key) DO NOTHING;
  END IF;

  IF TG_OP = 'INSERT' OR st IS NOT DISTINCT FROM ost THEN RETURN NEW; END IF;

  IF st = 'Đang thực hiện' AND ost = 'Chờ nhận việc' AND _req IS NOT NULL AND _req IS DISTINCT FROM _asg THEN
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