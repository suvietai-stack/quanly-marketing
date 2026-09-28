ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS content_id text REFERENCES public.web_contents(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS notifications_content_idx ON public.notifications(content_id);
ALTER TABLE public.notifications DROP CONSTRAINT notifications_kind_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_kind_check CHECK (kind = ANY (ARRAY['signal_new','signal_assigned','signal_care','leave_pending','leave_result','leave_cancel_request','leave_remind','leave_cc','att_witness','att_new','att_result','att_changed','att_submitted','content_assigned','content_review','content_revise','content_approved','content_published','content_remind']));

CREATE TABLE public.content_notify_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.content_notify_settings TO authenticated;
GRANT ALL ON public.content_notify_settings TO service_role;
ALTER TABLE public.content_notify_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active users read content notify settings" ON public.content_notify_settings FOR SELECT TO authenticated USING (public.is_active(auth.uid()) OR public.is_admin(auth.uid()));
INSERT INTO public.content_notify_settings(id, data) VALUES (1, '{"zalo":{"content_assigned":true,"content_review":true,"content_revise":true,"content_approved":false,"content_published":false},"remind":{"enabled":false,"hours":24}}'::jsonb) ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.content_notify_save(_data jsonb) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT (public.is_admin(auth.uid()) OR public.has_permission(auth.uid(), 'settings.manage')) THEN
    RAISE EXCEPTION 'Bạn không có quyền thay đổi cài đặt thông báo';
  END IF;
  UPDATE public.content_notify_settings SET data = _data, updated_by = auth.uid(), updated_at = now() WHERE id = 1;
END $$;
REVOKE ALL ON FUNCTION public.content_notify_save(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.content_notify_save(jsonb) TO authenticated;

-- Tên người trong Content Web → tài khoản (chỉ khi khớp duy nhất một tài khoản đang hoạt động)
CREATE OR REPLACE FUNCTION public.cw_uid(_name text) RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE WHEN count(*) = 1 THEN (array_agg(id))[1] END FROM public.profiles
  WHERE coalesce(trim(_name),'') <> '' AND (lower(trim(full_name)) = lower(trim(_name)) OR lower(trim(username)) = lower(trim(_name)))
    AND status = 'Đang hoạt động';
$$;
REVOKE ALL ON FUNCTION public.cw_uid(text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.content_notify() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  d jsonb := NEW.data; o jsonb := CASE WHEN TG_OP = 'UPDATE' THEN OLD.data ELSE '{}'::jsonb END;
  st text := d->>'status'; ost text := o->>'status';
  rnd text := coalesce(jsonb_array_length(CASE WHEN jsonb_typeof(d->'history')='array' THEN d->'history' END),0)::text;
  _writer uuid := public.cw_uid(d->>'writer'); _u uuid; _rev text; _p jsonb; _site text;
BEGIN
  IF NEW.is_demo THEN RETURN NEW; END IF;
  SELECT data->>'name' INTO _site FROM public.websites WHERE id = d->>'websiteId';
  _p := jsonb_build_object('title', d->>'title', 'website', _site, 'status', st, 'writer', d->>'writer', 'assigner', d->>'assigner', 'deadline', d->>'deadline', 'at', now());

  -- A. Giao bài: người viết mới được gán (không phải chỉ sửa nháp)
  IF _writer IS NOT NULL AND coalesce(d->>'writer','') <> coalesce(o->>'writer','')
     AND coalesce(st,'') NOT IN ('Kế hoạch','Đã hủy','Hoàn thành','Đã đăng web','Kiểm tra index')
     AND _writer IS DISTINCT FROM public.cw_uid(d->>'assigner')
     -- Chống trùng với Task: Task liên kết cùng bài, cùng người, đã có thông báo giao việc
     AND NOT EXISTS (SELECT 1 FROM public.tasks t JOIN public.notifications n ON n.dedup_key = 'task_assigned:'||t.id||':'||_writer
                     WHERE t.data->>'contentId' = NEW.id AND public.cw_uid(t.data->>'assignee') = _writer) THEN
    INSERT INTO public.notifications(recipient_id, kind, content_id, payload, dedup_key)
    VALUES (_writer, 'content_assigned', NEW.id, _p, 'cw:assigned:'||NEW.id||':'||_writer) ON CONFLICT (dedup_key) DO NOTHING;
  END IF;

  IF st IS NOT DISTINCT FROM ost THEN RETURN NEW; END IF;

  -- B. Gửi duyệt → đúng người được chỉ định duyệt
  IF st IN ('Chờ duyệt outline','Chờ duyệt bài','Chờ duyệt bản nháp web','Chờ duyệt tối ưu') THEN
    _rev := CASE st WHEN 'Chờ duyệt outline' THEN d->>'outlineReviewer' WHEN 'Chờ duyệt tối ưu' THEN coalesce(d->>'optimizeReviewer', d->>'draftReviewer') ELSE d->>'draftReviewer' END;
    _u := public.cw_uid(_rev);
    IF _u IS NOT NULL THEN
      INSERT INTO public.notifications(recipient_id, kind, content_id, payload, dedup_key)
      VALUES (_u, 'content_review', NEW.id, _p || jsonb_build_object('reviewer', _rev), 'cw:review:'||NEW.id||':'||st||':'||rnd||':'||_u) ON CONFLICT (dedup_key) DO NOTHING;
    END IF;
  -- C. Yêu cầu chỉnh sửa → người thực hiện
  ELSIF st IN ('Cần sửa outline','Cần sửa bài','Cần sửa bản nháp web','Cần sửa tối ưu') AND _writer IS NOT NULL THEN
    _rev := CASE st WHEN 'Cần sửa outline' THEN d->>'outlineReviewer' WHEN 'Cần sửa tối ưu' THEN coalesce(d->>'optimizeReviewer', d->>'draftReviewer') ELSE d->>'draftReviewer' END;
    INSERT INTO public.notifications(recipient_id, kind, content_id, payload, dedup_key)
    VALUES (_writer, 'content_revise', NEW.id, _p || jsonb_build_object('reviewer', _rev), 'cw:revise:'||NEW.id||':'||st||':'||rnd||':'||_writer) ON CONFLICT (dedup_key) DO NOTHING;
  -- D. Được duyệt → người thực hiện (+ người đăng khi bản nháp web đã duyệt)
  ELSIF st IN ('Outline đã duyệt','Bài viết đã duyệt','Bản nháp web đã duyệt','Đã duyệt tối ưu') THEN
    INSERT INTO public.notifications(recipient_id, kind, content_id, payload, dedup_key)
    SELECT u, 'content_approved', NEW.id, _p, 'cw:approved:'||NEW.id||':'||st||':'||rnd||':'||u
    FROM (SELECT _writer AS u UNION SELECT CASE WHEN st IN ('Bản nháp web đã duyệt','Bài viết đã duyệt') THEN public.cw_uid(d->>'publisher') END) x
    WHERE u IS NOT NULL ON CONFLICT (dedup_key) DO NOTHING;
  -- E. Đã đăng Website (chỉ khi thực sự chuyển sang Đã đăng web)
  ELSIF st = 'Đã đăng web' AND _writer IS NOT NULL THEN
    INSERT INTO public.notifications(recipient_id, kind, content_id, payload, dedup_key)
    VALUES (_writer, 'content_published', NEW.id, _p, 'cw:published:'||NEW.id||':'||_writer) ON CONFLICT (dedup_key) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER content_notify AFTER INSERT OR UPDATE OF data ON public.web_contents FOR EACH ROW EXECUTE FUNCTION public.content_notify();

-- Nhắc bài chờ duyệt: tối đa 1 lần/ngày/bài, chỉ người duyệt hiện tại
CREATE OR REPLACE FUNCTION public.content_remind_run() RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cfg jsonb; _h int; n int := 0; r record; _u uuid; _last timestamptz; _day text := to_char(now() AT TIME ZONE 'Asia/Ho_Chi_Minh','YYYY-MM-DD');
BEGIN
  SELECT data->'remind' INTO cfg FROM public.content_notify_settings WHERE id = 1;
  IF cfg IS NULL OR NOT coalesce((cfg->>'enabled')::boolean,false) THEN RETURN 0; END IF;
  _h := greatest(1, coalesce((cfg->>'hours')::int, 24));
  FOR r IN SELECT id, data FROM public.web_contents WHERE NOT is_demo AND data->>'status' IN ('Chờ duyệt outline','Chờ duyệt bài','Chờ duyệt bản nháp web','Chờ duyệt tối ưu') LOOP
    _u := public.cw_uid(CASE r.data->>'status' WHEN 'Chờ duyệt outline' THEN r.data->>'outlineReviewer' WHEN 'Chờ duyệt tối ưu' THEN coalesce(r.data->>'optimizeReviewer', r.data->>'draftReviewer') ELSE r.data->>'draftReviewer' END);
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

CREATE OR REPLACE FUNCTION public.push_wake() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _tok text;
BEGIN
  IF NEW.kind NOT IN ('signal_new','signal_assigned','leave_pending','leave_result','leave_cancel_request','leave_cc','att_witness','att_new','content_assigned','content_review','content_revise','content_approved','content_published','content_remind') THEN RETURN NEW; END IF;
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
DECLARE _tok text;
BEGIN
  IF NEW.kind NOT IN ('leave_pending','leave_result','leave_cancel_request','leave_cc','att_witness','att_new','content_assigned','content_review','content_revise','content_approved','content_published','content_remind') THEN RETURN NEW; END IF;
  IF NEW.kind LIKE 'content_%' AND NOT coalesce((SELECT (data->'zalo'->>NEW.kind)::boolean FROM public.content_notify_settings WHERE id = 1), false) THEN RETURN NEW; END IF;
  SELECT care_cron_token INTO _tok FROM public.zalo_oa_config WHERE id = 1 AND auto_send AND status = 'connected';
  IF _tok IS NULL THEN RETURN NEW; END IF;
  BEGIN
    PERFORM net.http_post(url := 'https://base.suviet.vn/api/public/zalo/dispatch-cron',
      headers := jsonb_build_object('Content-Type','application/json','x-care-token', _tok), body := '{}'::jsonb);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  RETURN NEW;
END $$;