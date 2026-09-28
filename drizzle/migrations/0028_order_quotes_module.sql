-- Module Đơn hàng — Hỏi Giá & Tiến Độ. Client chỉ SELECT; mọi ghi qua RPC SECURITY DEFINER.
CREATE SEQUENCE IF NOT EXISTS public.oq_code_seq START 1;

CREATE TABLE public.oq_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE,
  order_type text NOT NULL DEFAULT 'gift_ceramic' CHECK (order_type IN ('gift_ceramic')),
  title text NOT NULL DEFAULT '' CHECK (length(title) <= 300),
  delivery_place text CHECK (length(delivery_place) <= 500),
  delivery_date date,
  note text CHECK (length(note) <= 5000),
  items_mode text NOT NULL DEFAULT 'option' CHECK (items_mode IN ('option','bundle')),
  form_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  want_price boolean NOT NULL DEFAULT false,
  want_progress boolean NOT NULL DEFAULT false,
  draft_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  creator_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  cancelled_at timestamptz,
  cancelled_by uuid,
  cancel_reason text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.oq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.oq_requests(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 1,
  code text NOT NULL DEFAULT '',
  name text NOT NULL DEFAULT '' CHECK (length(name) <= 300),
  qty numeric,
  unit text CHECK (length(unit) <= 50),
  detail text CHECK (length(detail) <= 5000),
  processing text CHECK (length(processing) <= 5000),
  note text CHECK (length(note) <= 5000),
  customer_choice text CHECK (customer_choice IN ('considering','chosen','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.oq_items(request_id);
CREATE TABLE public.oq_item_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.oq_requests(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.oq_items(id) ON DELETE CASCADE,
  path text NOT NULL,
  category text NOT NULL DEFAULT 'other' CHECK (category IN ('product','logo','box','other')),
  caption text CHECK (length(caption) <= 1000),
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.oq_item_images(item_id);
CREATE TABLE public.oq_flows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.oq_requests(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('price','progress')),
  code text NOT NULL,
  assignee_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','answered','cancelled')),
  waiting_info boolean NOT NULL DEFAULT false,
  current_round integer NOT NULL DEFAULT 1,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  processing_started_at timestamptz,
  first_published_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancel_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (request_id, kind)
);
CREATE INDEX ON public.oq_flows(assignee_id);
CREATE TABLE public.oq_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id uuid NOT NULL REFERENCES public.oq_flows(id) ON DELETE CASCADE,
  no integer NOT NULL,
  request_note text,
  items_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  assignee_id uuid NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  first_published_at timestamptz,
  completed_at timestamptz,
  UNIQUE (flow_id, no)
);
CREATE TABLE public.oq_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id uuid NOT NULL REFERENCES public.oq_rounds(id) ON DELETE CASCADE,
  flow_id uuid NOT NULL REFERENCES public.oq_flows(id) ON DELETE CASCADE,
  target text NOT NULL,
  version integer,
  is_published boolean NOT NULL DEFAULT false,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  author_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_by uuid,
  published_at timestamptz
);
CREATE UNIQUE INDEX oq_responses_one_draft ON public.oq_responses(round_id, target) WHERE NOT is_published;
CREATE UNIQUE INDEX oq_responses_version ON public.oq_responses(round_id, target, version) WHERE is_published;
CREATE TABLE public.oq_info_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id uuid NOT NULL REFERENCES public.oq_flows(id) ON DELETE CASCADE,
  round_no integer NOT NULL,
  question text NOT NULL,
  asked_by uuid NOT NULL,
  asked_at timestamptz NOT NULL DEFAULT now(),
  answer text,
  answered_by uuid,
  answered_at timestamptz
);
CREATE TABLE public.oq_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.oq_requests(id) ON DELETE CASCADE,
  flow_id uuid REFERENCES public.oq_flows(id) ON DELETE CASCADE,
  item_id uuid,
  round_no integer,
  kind text NOT NULL,
  actor_id uuid,
  status_from text,
  status_to text,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.oq_events(request_id, created_at);

GRANT SELECT ON public.oq_requests, public.oq_items, public.oq_item_images, public.oq_flows, public.oq_rounds,
  public.oq_responses, public.oq_info_requests, public.oq_events TO authenticated;
GRANT ALL ON public.oq_requests, public.oq_items, public.oq_item_images, public.oq_flows, public.oq_rounds,
  public.oq_responses, public.oq_info_requests, public.oq_events TO service_role;
ALTER TABLE public.oq_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oq_item_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oq_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oq_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oq_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oq_info_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oq_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION private.oq_can_view(_req uuid, _uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _uid IS NOT NULL AND private.is_active(_uid) AND EXISTS (
    SELECT 1 FROM public.oq_requests r WHERE r.id = _req AND (
      (r.creator_id = _uid AND (private.sig_can(_uid,'oq.view_own') OR private.sig_can(_uid,'oq.create')))
      OR (r.status <> 'draft' AND (private.sig_can(_uid,'oq.view_all') OR private.sig_can(_uid,'oq.manage')))
      OR (r.status <> 'draft' AND EXISTS (SELECT 1 FROM public.oq_flows f WHERE f.request_id = r.id AND f.assignee_id = _uid))
    ));
$$;
CREATE OR REPLACE FUNCTION private.oq_can_see_drafts(_flow uuid, _uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.oq_flows f WHERE f.id = _flow AND (f.assignee_id = _uid OR private.sig_can(_uid,'oq.manage')));
$$;

CREATE POLICY oq_req_sel ON public.oq_requests FOR SELECT TO authenticated USING (private.oq_can_view(id, auth.uid()));
CREATE POLICY oq_item_sel ON public.oq_items FOR SELECT TO authenticated USING (private.oq_can_view(request_id, auth.uid()));
CREATE POLICY oq_img_sel ON public.oq_item_images FOR SELECT TO authenticated USING (private.oq_can_view(request_id, auth.uid()));
CREATE POLICY oq_flow_sel ON public.oq_flows FOR SELECT TO authenticated USING (private.oq_can_view(request_id, auth.uid()));
CREATE POLICY oq_round_sel ON public.oq_rounds FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.oq_flows f WHERE f.id = flow_id AND private.oq_can_view(f.request_id, auth.uid())));
CREATE POLICY oq_resp_sel ON public.oq_responses FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.oq_flows f WHERE f.id = flow_id AND private.oq_can_view(f.request_id, auth.uid()))
  AND (is_published OR private.oq_can_see_drafts(flow_id, auth.uid())));
CREATE POLICY oq_info_sel ON public.oq_info_requests FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.oq_flows f WHERE f.id = flow_id AND private.oq_can_view(f.request_id, auth.uid())));
CREATE POLICY oq_ev_sel ON public.oq_events FOR SELECT TO authenticated USING (private.oq_can_view(request_id, auth.uid()));

CREATE POLICY oq_obj_sel ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'order-quotes' AND private.oq_can_view(((storage.foldername(name))[1])::uuid, auth.uid()));
CREATE POLICY oq_obj_ins ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'order-quotes' AND lower(name) ~ '\.(jpe?g|png|webp|gif|heic|heif)$'
    AND EXISTS (SELECT 1 FROM public.oq_requests r WHERE r.id::text = (storage.foldername(name))[1] AND r.creator_id = auth.uid() AND r.status = 'draft'));
CREATE POLICY oq_obj_del ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'order-quotes'
    AND EXISTS (SELECT 1 FROM public.oq_requests r WHERE r.id::text = (storage.foldername(name))[1] AND r.creator_id = auth.uid() AND r.status = 'draft'));

ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS oq_flow_id uuid REFERENCES public.oq_flows(id) ON DELETE CASCADE;
ALTER TABLE public.notifications DROP CONSTRAINT notifications_kind_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_kind_check CHECK (kind = ANY (ARRAY['signal_new','signal_assigned','signal_care','leave_pending','leave_result','leave_cancel_request','leave_remind','leave_cc','att_witness','att_new','att_result','att_changed','att_submitted','content_assigned','content_review','content_revise','content_approved','content_published','content_remind','order_new','order_assigned','order_taken','order_review','order_revise','order_approved','order_delivered','order_remind','oq_new','oq_accepted','oq_info','oq_answered','oq_published','oq_done','oq_reask','oq_assigned']));

CREATE OR REPLACE FUNCTION private.oq_notify(_to uuid, _kind text, _flow uuid, _payload jsonb, _key text) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.notifications(recipient_id, kind, oq_flow_id, payload, dedup_key)
  SELECT _to, _kind, _flow, _payload, 'oq:'||_key||':'||_to WHERE _to IS NOT NULL AND _to <> coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
  ON CONFLICT (dedup_key) DO NOTHING;
$$;

CREATE OR REPLACE FUNCTION private.oq_log(_req uuid, _flow uuid, _item uuid, _round integer, _kind text, _from text, _to text, _detail jsonb) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.oq_events(request_id, flow_id, item_id, round_no, kind, actor_id, status_from, status_to, detail)
  VALUES (_req, _flow, _item, _round, _kind, auth.uid(), _from, _to, coalesce(_detail,'{}'::jsonb));
$$;

CREATE OR REPLACE FUNCTION public.oq_assignees(_kind text) RETURNS TABLE(id uuid, full_name text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.full_name FROM public.profiles p
  WHERE private.sig_can(auth.uid(),'oq.create')
    AND private.sig_can(p.id, CASE WHEN _kind = 'price' THEN 'oq.reply_price' ELSE 'oq.reply_progress' END)
  ORDER BY p.full_name;
$$;

CREATE OR REPLACE FUNCTION public.oq_save(_id uuid, _data jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _rid uuid := _id; _it jsonb; _pos int := 0; _keep uuid[] := '{}'; _iid uuid;
BEGIN
  IF NOT private.sig_can(_uid,'oq.create') THEN RAISE EXCEPTION 'Bạn không có quyền tạo yêu cầu.'; END IF;
  IF _rid IS NULL THEN
    INSERT INTO public.oq_requests(creator_id) VALUES (_uid) RETURNING id INTO _rid;
    PERFORM private.oq_log(_rid, NULL, NULL, NULL, 'draft_created', NULL, 'draft', '{}');
  ELSIF NOT EXISTS (SELECT 1 FROM public.oq_requests WHERE id = _rid AND creator_id = _uid AND status = 'draft') THEN
    RAISE EXCEPTION 'Chỉ sửa được bản nháp của chính bạn.';
  END IF;
  UPDATE public.oq_requests SET
    title = coalesce(_data->>'title',''), delivery_place = nullif(_data->>'delivery_place',''),
    delivery_date = nullif(_data->>'delivery_date','')::date, note = nullif(_data->>'note',''),
    items_mode = coalesce(nullif(_data->>'items_mode',''),'option'),
    want_price = coalesce((_data->>'want_price')::boolean,false), want_progress = coalesce((_data->>'want_progress')::boolean,false),
    draft_config = coalesce(_data->'config','{}'::jsonb), form_data = coalesce(_data->'form_data','{}'::jsonb), updated_at = now()
  WHERE id = _rid;
  FOR _it IN SELECT * FROM jsonb_array_elements(coalesce(_data->'items','[]'::jsonb)) LOOP
    _pos := _pos + 1;
    _iid := nullif(_it->>'id','')::uuid;
    IF _iid IS NOT NULL AND EXISTS (SELECT 1 FROM public.oq_items WHERE id = _iid AND request_id = _rid) THEN
      UPDATE public.oq_items SET position = _pos, code = 'PA'||lpad(_pos::text,2,'0'), name = coalesce(_it->>'name',''),
        qty = nullif(_it->>'qty','')::numeric, unit = nullif(_it->>'unit',''), detail = nullif(_it->>'detail',''),
        processing = nullif(_it->>'processing',''), note = nullif(_it->>'note',''), updated_at = now() WHERE id = _iid;
    ELSE
      INSERT INTO public.oq_items(request_id, position, code, name, qty, unit, detail, processing, note)
      VALUES (_rid, _pos, 'PA'||lpad(_pos::text,2,'0'), coalesce(_it->>'name',''), nullif(_it->>'qty','')::numeric, nullif(_it->>'unit',''),
        nullif(_it->>'detail',''), nullif(_it->>'processing',''), nullif(_it->>'note','')) RETURNING id INTO _iid;
    END IF;
    _keep := _keep || _iid;
  END LOOP;
  DELETE FROM public.oq_items WHERE request_id = _rid AND NOT (id = ANY(_keep));
  RETURN _rid;
END $$;

CREATE OR REPLACE FUNCTION public.oq_delete_draft(_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.oq_requests WHERE id = _id AND creator_id = auth.uid() AND status = 'draft';
  IF NOT FOUND THEN RAISE EXCEPTION 'Không xóa được bản nháp này.'; END IF;
END $$;

CREATE OR REPLACE FUNCTION public.oq_image_add(_item uuid, _path text, _category text, _caption text) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _rid uuid; _new uuid;
BEGIN
  SELECT i.request_id INTO _rid FROM public.oq_items i JOIN public.oq_requests r ON r.id = i.request_id
   WHERE i.id = _item AND r.creator_id = auth.uid() AND r.status = 'draft';
  IF _rid IS NULL THEN RAISE EXCEPTION 'Chỉ thêm ảnh khi yêu cầu còn là bản nháp của bạn.'; END IF;
  IF split_part(_path,'/',1) <> _rid::text THEN RAISE EXCEPTION 'Đường dẫn ảnh không hợp lệ.'; END IF;
  INSERT INTO public.oq_item_images(request_id, item_id, path, category, caption, created_by)
  VALUES (_rid, _item, _path, coalesce(nullif(_category,''),'other'), nullif(_caption,''), auth.uid()) RETURNING id INTO _new;
  RETURN _new;
END $$;

CREATE OR REPLACE FUNCTION public.oq_image_update(_id uuid, _category text, _caption text, _delete boolean) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _p text;
BEGIN
  SELECT g.path INTO _p FROM public.oq_item_images g JOIN public.oq_requests r ON r.id = g.request_id
   WHERE g.id = _id AND r.creator_id = auth.uid() AND r.status = 'draft';
  IF _p IS NULL THEN RAISE EXCEPTION 'Chỉ sửa ảnh khi yêu cầu còn là bản nháp của bạn.'; END IF;
  IF _delete THEN DELETE FROM public.oq_item_images WHERE id = _id;
  ELSE UPDATE public.oq_item_images SET category = coalesce(nullif(_category,''),'other'), caption = nullif(_caption,'') WHERE id = _id; END IF;
  RETURN _p;
END $$;

CREATE OR REPLACE FUNCTION private.oq_missing(_round uuid) RETURNS text[]
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _r public.oq_rounds; _f public.oq_flows; _it jsonb; _c jsonb; _pub jsonb; _out text[] := '{}'; _cat text;
  _labels jsonb := '{"product":"Giá sản phẩm","processing":"Giá gia công","box":"Giá hộp","shipping":"Giá vận chuyển"}';
BEGIN
  SELECT * INTO _r FROM public.oq_rounds WHERE id = _round;
  SELECT * INTO _f FROM public.oq_flows WHERE id = _r.flow_id;
  FOR _it IN SELECT * FROM jsonb_array_elements(_r.items_snapshot) LOOP
    _pub := NULL;
    SELECT content INTO _pub FROM public.oq_responses WHERE round_id = _round AND target = _it->>'id' AND is_published ORDER BY version DESC LIMIT 1;
    IF _f.kind = 'progress' THEN
      IF _pub IS NULL OR coalesce(trim(_pub->>'reply'),'') = '' THEN _out := _out || ((_it->>'code')||' '||(_it->>'name')||': phản hồi tiến độ'); END IF;
    ELSE
      _c := _r.config->'items'->(_it->>'id');
      FOREACH _cat IN ARRAY ARRAY['product','processing','box','shipping'] LOOP
        IF _cat = 'shipping' AND coalesce(_r.config->>'shipping_mode','per_item') <> 'per_item' THEN CONTINUE; END IF;
        IF coalesce((_c->_cat->>'on')::boolean,false) AND (_pub IS NULL OR coalesce(trim(_pub->>_cat),'') = '') THEN
          _out := _out || ((_it->>'code')||' '||(_it->>'name')||': '||(_labels->>_cat));
        END IF;
      END LOOP;
    END IF;
  END LOOP;
  IF _f.kind = 'price' AND coalesce(_r.config->>'shipping_mode','per_item') = 'common' THEN
    _pub := NULL;
    SELECT content INTO _pub FROM public.oq_responses WHERE round_id = _round AND target = 'shipping' AND is_published ORDER BY version DESC LIMIT 1;
    IF _pub IS NULL OR coalesce(trim(_pub->>'shipping'),'') = '' THEN _out := _out || 'Giá vận chuyển chung'::text; END IF;
  END IF;
  RETURN _out;
END $$;

CREATE OR REPLACE FUNCTION public.oq_missing(_flow uuid) RETURNS text[]
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _f public.oq_flows; _rid uuid;
BEGIN
  SELECT * INTO _f FROM public.oq_flows WHERE id = _flow;
  IF NOT private.oq_can_view(_f.request_id, auth.uid()) THEN RAISE EXCEPTION 'Không có quyền.'; END IF;
  SELECT id INTO _rid FROM public.oq_rounds WHERE flow_id = _flow AND no = _f.current_round;
  RETURN private.oq_missing(_rid);
END $$;

CREATE OR REPLACE FUNCTION public.oq_submit(_id uuid) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); r public.oq_requests; _code text; _snap jsonb; _cfg jsonb; _pa uuid; _ta uuid; _fp uuid; _ft uuid; _n int;
BEGIN
  SELECT * INTO r FROM public.oq_requests WHERE id = _id FOR UPDATE;
  IF r.id IS NULL OR r.creator_id <> _uid OR r.status <> 'draft' THEN RAISE EXCEPTION 'Chỉ gửi được bản nháp của chính bạn.'; END IF;
  IF NOT private.sig_can(_uid,'oq.create') THEN RAISE EXCEPTION 'Bạn không có quyền tạo yêu cầu.'; END IF;
  IF trim(r.title) = '' THEN RAISE EXCEPTION 'Thiếu tên báo giá / đơn hàng.'; END IF;
  SELECT count(*) INTO _n FROM public.oq_items WHERE request_id = _id;
  IF _n = 0 THEN RAISE EXCEPTION 'Cần ít nhất một sản phẩm.'; END IF;
  IF EXISTS (SELECT 1 FROM public.oq_items WHERE request_id = _id AND trim(name) = '') THEN RAISE EXCEPTION 'Có sản phẩm chưa nhập tên.'; END IF;
  IF NOT (r.want_price OR r.want_progress) THEN RAISE EXCEPTION 'Chọn ít nhất Hỏi Giá hoặc Hỏi Tiến Độ.'; END IF;
  _cfg := r.draft_config;
  _pa := nullif(_cfg->>'price_assignee','')::uuid; _ta := nullif(_cfg->>'progress_assignee','')::uuid;
  IF r.want_price THEN
    IF _pa IS NULL OR NOT private.sig_can(_pa,'oq.reply_price') THEN RAISE EXCEPTION 'Người phụ trách Hỏi Giá không hợp lệ hoặc không có quyền.'; END IF;
    IF NOT EXISTS (SELECT 1 FROM public.oq_items i WHERE i.request_id = _id AND EXISTS (
         SELECT 1 FROM jsonb_each(coalesce(_cfg->'price'->'items'->(i.id::text),'{}'::jsonb)) e WHERE jsonb_typeof(e.value) = 'object' AND coalesce((e.value->>'on')::boolean,false)))
       AND coalesce(_cfg->'price'->>'shipping_mode','per_item') <> 'common' THEN
      RAISE EXCEPTION 'Hỏi Giá: chọn ít nhất một hạng mục cần báo giá.'; END IF;
  END IF;
  IF r.want_progress THEN
    IF _ta IS NULL OR NOT private.sig_can(_ta,'oq.reply_progress') THEN RAISE EXCEPTION 'Người phụ trách Hỏi Tiến Độ không hợp lệ hoặc không có quyền.'; END IF;
    IF coalesce(_cfg->'progress'->>'check_type','') NOT IN ('capability','in_progress') THEN RAISE EXCEPTION 'Hỏi Tiến Độ: chọn loại kiểm tra.'; END IF;
    IF coalesce(trim(_cfg->'progress'->>'content'),'') = '' THEN RAISE EXCEPTION 'Hỏi Tiến Độ: nhập nội dung cần kiểm tra.'; END IF;
  END IF;
  _code := 'YC-'||lpad(nextval('public.oq_code_seq')::text,4,'0');
  SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'code',code,'name',name,'qty',qty,'unit',unit,'detail',detail,'processing',processing,'note',note) ORDER BY position),'[]')
    INTO _snap FROM public.oq_items WHERE request_id = _id;
  UPDATE public.oq_requests SET code = _code, status = 'submitted', submitted_at = now(), updated_at = now() WHERE id = _id;
  PERFORM private.oq_log(_id, NULL, NULL, NULL, 'submitted', 'draft', 'submitted', jsonb_build_object('code',_code));
  IF r.want_price THEN
    INSERT INTO public.oq_flows(request_id, kind, code, assignee_id) VALUES (_id,'price',_code||'-G',_pa) RETURNING id INTO _fp;
    INSERT INTO public.oq_rounds(flow_id, no, items_snapshot, config, assignee_id, created_by, request_note)
      VALUES (_fp, 1, _snap, coalesce(_cfg->'price','{}'), _pa, _uid, nullif(_cfg->'price'->>'note',''));
    PERFORM private.oq_log(_id, _fp, NULL, 1, 'flow_created', NULL, 'pending', jsonb_build_object('assignee',_pa));
    PERFORM private.oq_log(_id, _fp, NULL, 1, 'assigned', NULL, NULL, jsonb_build_object('to',_pa));
  END IF;
  IF r.want_progress THEN
    INSERT INTO public.oq_flows(request_id, kind, code, assignee_id) VALUES (_id,'progress',_code||'-T',_ta) RETURNING id INTO _ft;
    INSERT INTO public.oq_rounds(flow_id, no, items_snapshot, config, assignee_id, created_by, request_note)
      VALUES (_ft, 1, _snap, coalesce(_cfg->'progress','{}'), _ta, _uid, nullif(_cfg->'progress'->>'content',''));
    PERFORM private.oq_log(_id, _ft, NULL, 1, 'flow_created', NULL, 'pending', jsonb_build_object('assignee',_ta));
    PERFORM private.oq_log(_id, _ft, NULL, 1, 'assigned', NULL, NULL, jsonb_build_object('to',_ta));
  END IF;
  IF _fp IS NOT NULL AND _ft IS NOT NULL AND _pa = _ta THEN
    PERFORM private.oq_notify(_pa, 'oq_new', _fp, jsonb_build_object('request_id',_id,'code',_code,'title',r.title,'both',true), 'new:'||_id);
  ELSE
    IF _fp IS NOT NULL THEN PERFORM private.oq_notify(_pa, 'oq_new', _fp, jsonb_build_object('request_id',_id,'code',_code||'-G','title',r.title,'flow','price'), 'new:'||_fp); END IF;
    IF _ft IS NOT NULL THEN PERFORM private.oq_notify(_ta, 'oq_new', _ft, jsonb_build_object('request_id',_id,'code',_code||'-T','title',r.title,'flow','progress'), 'new:'||_ft); END IF;
  END IF;
  RETURN _code;
END $$;

CREATE OR REPLACE FUNCTION private.oq_flow_for_handler(_flow uuid) RETURNS public.oq_flows
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE f public.oq_flows; _uid uuid := auth.uid(); r public.oq_requests;
BEGIN
  SELECT * INTO f FROM public.oq_flows WHERE id = _flow FOR UPDATE;
  IF f.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy luồng.'; END IF;
  SELECT * INTO r FROM public.oq_requests WHERE id = f.request_id;
  IF r.status = 'cancelled' OR f.status = 'cancelled' THEN RAISE EXCEPTION 'Yêu cầu/luồng đã hủy.'; END IF;
  IF NOT ((f.assignee_id = _uid AND private.sig_can(_uid, CASE f.kind WHEN 'price' THEN 'oq.reply_price' ELSE 'oq.reply_progress' END))
          OR private.sig_can(_uid,'oq.manage')) THEN
    RAISE EXCEPTION 'Bạn không phải người phụ trách luồng này hoặc không có quyền phản hồi.'; END IF;
  RETURN f;
END $$;

CREATE OR REPLACE FUNCTION private.oq_flow_for_owner(_flow uuid) RETURNS public.oq_flows
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE f public.oq_flows; r public.oq_requests;
BEGIN
  SELECT * INTO f FROM public.oq_flows WHERE id = _flow FOR UPDATE;
  IF f.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy luồng.'; END IF;
  SELECT * INTO r FROM public.oq_requests WHERE id = f.request_id;
  IF r.status = 'cancelled' OR f.status = 'cancelled' THEN RAISE EXCEPTION 'Yêu cầu/luồng đã hủy.'; END IF;
  IF NOT ((r.creator_id = auth.uid() AND private.sig_can(auth.uid(),'oq.create')) OR private.sig_can(auth.uid(),'oq.manage')) THEN
    RAISE EXCEPTION 'Chỉ người tạo yêu cầu hoặc người quản lý được thao tác.'; END IF;
  RETURN f;
END $$;

CREATE OR REPLACE FUNCTION public.oq_accept(_flow uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE f public.oq_flows; r public.oq_requests;
BEGIN
  f := private.oq_flow_for_handler(_flow);
  IF f.status <> 'pending' THEN RAISE EXCEPTION 'Luồng không ở trạng thái Chờ xác nhận.'; END IF;
  UPDATE public.oq_flows SET status = 'processing', accepted_at = coalesce(accepted_at, now()), processing_started_at = coalesce(processing_started_at, now()), updated_at = now() WHERE id = _flow;
  UPDATE public.oq_rounds SET accepted_at = now() WHERE flow_id = _flow AND no = f.current_round;
  PERFORM private.oq_log(f.request_id, _flow, NULL, f.current_round, 'accepted', 'pending', 'processing', '{}');
  PERFORM private.oq_log(f.request_id, _flow, NULL, f.current_round, 'processing_started', NULL, NULL, '{}');
  SELECT * INTO r FROM public.oq_requests WHERE id = f.request_id;
  PERFORM private.oq_notify(r.creator_id, 'oq_accepted', _flow, jsonb_build_object('request_id',r.id,'code',f.code,'title',r.title,'flow',f.kind), 'acc:'||_flow||':'||f.current_round);
END $$;

CREATE OR REPLACE FUNCTION public.oq_save_response(_flow uuid, _target text, _content jsonb) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE f public.oq_flows; _rid uuid;
BEGIN
  f := private.oq_flow_for_handler(_flow);
  IF f.status <> 'processing' THEN RAISE EXCEPTION 'Chỉ phản hồi khi luồng Đang xử lý (cần Xác nhận tiếp nhận trước).'; END IF;
  SELECT id INTO _rid FROM public.oq_rounds WHERE flow_id = _flow AND no = f.current_round;
  INSERT INTO public.oq_responses(round_id, flow_id, target, content, author_id) VALUES (_rid, _flow, _target, coalesce(_content,'{}'), auth.uid())
  ON CONFLICT (round_id, target) WHERE NOT is_published DO UPDATE SET content = EXCLUDED.content, author_id = EXCLUDED.author_id, updated_at = now();
END $$;

CREATE OR REPLACE FUNCTION public.oq_publish_response(_flow uuid, _target text, _content jsonb) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE f public.oq_flows; _rid uuid; _v int; r public.oq_requests; _first boolean;
BEGIN
  PERFORM public.oq_save_response(_flow, _target, _content);
  SELECT * INTO f FROM public.oq_flows WHERE id = _flow;
  SELECT id INTO _rid FROM public.oq_rounds WHERE flow_id = _flow AND no = f.current_round;
  SELECT coalesce(max(version),0)+1 INTO _v FROM public.oq_responses WHERE round_id = _rid AND target = _target AND is_published;
  UPDATE public.oq_responses SET is_published = true, version = _v, published_by = auth.uid(), published_at = now()
   WHERE round_id = _rid AND target = _target AND NOT is_published;
  _first := f.first_published_at IS NULL;
  UPDATE public.oq_flows SET first_published_at = coalesce(first_published_at, now()), updated_at = now() WHERE id = _flow;
  UPDATE public.oq_rounds SET first_published_at = coalesce(first_published_at, now()) WHERE id = _rid;
  PERFORM private.oq_log(f.request_id, _flow, CASE WHEN _target ~ '^[0-9a-f-]{36}$' THEN _target::uuid END, f.current_round,
    'published', NULL, NULL, jsonb_build_object('target',_target,'version',_v,'first',_first));
  SELECT * INTO r FROM public.oq_requests WHERE id = f.request_id;
  PERFORM private.oq_notify(r.creator_id, 'oq_published', _flow, jsonb_build_object('request_id',r.id,'code',f.code,'title',r.title,'flow',f.kind), 'pub:'||_flow||':'||f.current_round||':'||_target||':'||_v);
  RETURN _v;
END $$;

CREATE OR REPLACE FUNCTION public.oq_complete(_flow uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE f public.oq_flows; _rid uuid; _miss text[]; r public.oq_requests;
BEGIN
  f := private.oq_flow_for_handler(_flow);
  IF f.status <> 'processing' THEN RAISE EXCEPTION 'Luồng không ở trạng thái Đang xử lý.'; END IF;
  IF f.waiting_info THEN RAISE EXCEPTION 'Đang chờ Sale bổ sung thông tin.'; END IF;
  SELECT id INTO _rid FROM public.oq_rounds WHERE flow_id = _flow AND no = f.current_round;
  _miss := private.oq_missing(_rid);
  IF array_length(_miss,1) > 0 THEN RAISE EXCEPTION 'Còn thiếu: %', array_to_string(_miss, '; '); END IF;
  UPDATE public.oq_flows SET status = 'answered', completed_at = now(), updated_at = now() WHERE id = _flow;
  UPDATE public.oq_rounds SET completed_at = now() WHERE id = _rid;
  PERFORM private.oq_log(f.request_id, _flow, NULL, f.current_round, 'completed', 'processing', 'answered', '{}');
  SELECT * INTO r FROM public.oq_requests WHERE id = f.request_id;
  PERFORM private.oq_notify(r.creator_id, 'oq_done', _flow, jsonb_build_object('request_id',r.id,'code',f.code,'title',r.title,'flow',f.kind), 'done:'||_flow||':'||f.current_round);
END $$;

CREATE OR REPLACE FUNCTION public.oq_request_info(_flow uuid, _question text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE f public.oq_flows; r public.oq_requests; _iid uuid;
BEGIN
  f := private.oq_flow_for_handler(_flow);
  IF f.status <> 'processing' THEN RAISE EXCEPTION 'Chỉ yêu cầu bổ sung khi đang xử lý.'; END IF;
  IF f.waiting_info THEN RAISE EXCEPTION 'Đang chờ Sale trả lời yêu cầu trước.'; END IF;
  IF coalesce(trim(_question),'') = '' THEN RAISE EXCEPTION 'Nhập nội dung cần bổ sung.'; END IF;
  INSERT INTO public.oq_info_requests(flow_id, round_no, question, asked_by) VALUES (_flow, f.current_round, trim(_question), auth.uid()) RETURNING id INTO _iid;
  UPDATE public.oq_flows SET waiting_info = true, updated_at = now() WHERE id = _flow;
  PERFORM private.oq_log(f.request_id, _flow, NULL, f.current_round, 'info_requested', NULL, 'waiting_sale', jsonb_build_object('question',trim(_question),'info_id',_iid));
  SELECT * INTO r FROM public.oq_requests WHERE id = f.request_id;
  PERFORM private.oq_notify(r.creator_id, 'oq_info', _flow, jsonb_build_object('request_id',r.id,'code',f.code,'title',r.title,'flow',f.kind), 'info:'||_iid);
END $$;

CREATE OR REPLACE FUNCTION public.oq_answer_info(_flow uuid, _answer text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE f public.oq_flows; r public.oq_requests; _iid uuid;
BEGIN
  f := private.oq_flow_for_owner(_flow);
  IF NOT f.waiting_info THEN RAISE EXCEPTION 'Không có yêu cầu bổ sung đang chờ.'; END IF;
  IF coalesce(trim(_answer),'') = '' THEN RAISE EXCEPTION 'Nhập nội dung bổ sung.'; END IF;
  UPDATE public.oq_info_requests SET answer = trim(_answer), answered_by = auth.uid(), answered_at = now()
   WHERE id = (SELECT id FROM public.oq_info_requests WHERE flow_id = _flow AND answered_at IS NULL ORDER BY asked_at DESC LIMIT 1) RETURNING id INTO _iid;
  UPDATE public.oq_flows SET waiting_info = false, updated_at = now() WHERE id = _flow;
  PERFORM private.oq_log(f.request_id, _flow, NULL, f.current_round, 'info_answered', 'waiting_sale', NULL, jsonb_build_object('answer',trim(_answer),'info_id',_iid));
  SELECT * INTO r FROM public.oq_requests WHERE id = f.request_id;
  PERFORM private.oq_notify(f.assignee_id, 'oq_answered', _flow, jsonb_build_object('request_id',r.id,'code',f.code,'title',r.title,'flow',f.kind), 'ans:'||_iid);
END $$;

CREATE OR REPLACE FUNCTION public.oq_reask(_flow uuid, _note text, _config jsonb, _snapshot jsonb) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE f public.oq_flows; r public.oq_requests; _old public.oq_rounds; _no int;
BEGIN
  f := private.oq_flow_for_owner(_flow);
  IF f.status <> 'answered' THEN RAISE EXCEPTION 'Chỉ hỏi lại sau khi luồng đã có kết quả hoàn tất.'; END IF;
  IF coalesce(trim(_note),'') = '' THEN RAISE EXCEPTION 'Nhập nội dung hỏi lại.'; END IF;
  SELECT * INTO _old FROM public.oq_rounds WHERE flow_id = _flow AND no = f.current_round;
  _no := f.current_round + 1;
  INSERT INTO public.oq_rounds(flow_id, no, items_snapshot, config, assignee_id, created_by, request_note)
  VALUES (_flow, _no, coalesce(_snapshot, _old.items_snapshot), coalesce(_config, _old.config), f.assignee_id, auth.uid(), trim(_note));
  UPDATE public.oq_flows SET status = 'pending', current_round = _no, completed_at = NULL, waiting_info = false, updated_at = now() WHERE id = _flow;
  PERFORM private.oq_log(f.request_id, _flow, NULL, _no, 'reasked', 'answered', 'pending', jsonb_build_object('note',trim(_note)));
  SELECT * INTO r FROM public.oq_requests WHERE id = f.request_id;
  PERFORM private.oq_notify(f.assignee_id, 'oq_reask', _flow, jsonb_build_object('request_id',r.id,'code',f.code,'title',r.title,'flow',f.kind,'round',_no), 'reask:'||_flow||':'||_no);
  RETURN _no;
END $$;

CREATE OR REPLACE FUNCTION public.oq_reassign(_flow uuid, _user uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE f public.oq_flows; r public.oq_requests;
BEGIN
  f := private.oq_flow_for_owner(_flow);
  IF f.status = 'answered' THEN RAISE EXCEPTION 'Luồng đã hoàn tất, không đổi người phụ trách.'; END IF;
  IF _user = f.assignee_id THEN RETURN; END IF;
  IF NOT private.sig_can(_user, CASE f.kind WHEN 'price' THEN 'oq.reply_price' ELSE 'oq.reply_progress' END) THEN
    RAISE EXCEPTION 'Người được chọn không có quyền xử lý luồng này.'; END IF;
  UPDATE public.oq_flows SET assignee_id = _user, assigned_at = now(), updated_at = now() WHERE id = _flow;
  UPDATE public.oq_rounds SET assignee_id = _user WHERE flow_id = _flow AND no = f.current_round;
  PERFORM private.oq_log(f.request_id, _flow, NULL, f.current_round, 'reassigned', NULL, NULL, jsonb_build_object('from',f.assignee_id,'to',_user));
  SELECT * INTO r FROM public.oq_requests WHERE id = f.request_id;
  PERFORM private.oq_notify(_user, 'oq_assigned', _flow, jsonb_build_object('request_id',r.id,'code',f.code,'title',r.title,'flow',f.kind), 'asg:'||_flow||':'||extract(epoch from clock_timestamp())::bigint);
END $$;

CREATE OR REPLACE FUNCTION public.oq_set_choice(_item uuid, _choice text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE i public.oq_items; r public.oq_requests;
BEGIN
  SELECT * INTO i FROM public.oq_items WHERE id = _item;
  SELECT * INTO r FROM public.oq_requests WHERE id = i.request_id;
  IF r.id IS NULL OR r.status <> 'submitted' THEN RAISE EXCEPTION 'Yêu cầu không hợp lệ.'; END IF;
  IF NOT ((r.creator_id = auth.uid() AND private.sig_can(auth.uid(),'oq.create')) OR private.sig_can(auth.uid(),'oq.manage')) THEN RAISE EXCEPTION 'Không có quyền.'; END IF;
  IF _choice IS NOT NULL AND _choice NOT IN ('considering','chosen','rejected') THEN RAISE EXCEPTION 'Lựa chọn không hợp lệ.'; END IF;
  UPDATE public.oq_items SET customer_choice = _choice, updated_at = now() WHERE id = _item;
  PERFORM private.oq_log(r.id, NULL, _item, NULL, 'choice', i.customer_choice, _choice, '{}');
END $$;

CREATE OR REPLACE FUNCTION public.oq_cancel(_id uuid, _flow uuid, _reason text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.oq_requests; f public.oq_flows;
BEGIN
  SELECT * INTO r FROM public.oq_requests WHERE id = _id FOR UPDATE;
  IF r.id IS NULL OR r.status <> 'submitted' THEN RAISE EXCEPTION 'Yêu cầu không hợp lệ hoặc đã hủy.'; END IF;
  IF NOT ((r.creator_id = auth.uid() AND private.sig_can(auth.uid(),'oq.create')) OR private.sig_can(auth.uid(),'oq.manage')) THEN RAISE EXCEPTION 'Không có quyền hủy.'; END IF;
  IF coalesce(trim(_reason),'') = '' THEN RAISE EXCEPTION 'Nhập lý do hủy.'; END IF;
  IF _flow IS NOT NULL THEN
    SELECT * INTO f FROM public.oq_flows WHERE id = _flow AND request_id = _id;
    IF f.id IS NULL OR f.status = 'cancelled' THEN RAISE EXCEPTION 'Luồng không hợp lệ.'; END IF;
    UPDATE public.oq_flows SET status = 'cancelled', cancelled_at = now(), cancel_reason = trim(_reason), waiting_info = false, updated_at = now() WHERE id = _flow;
    PERFORM private.oq_log(_id, _flow, NULL, f.current_round, 'flow_cancelled', f.status, 'cancelled', jsonb_build_object('reason',trim(_reason)));
  ELSE
    UPDATE public.oq_requests SET status = 'cancelled', cancelled_at = now(), cancelled_by = auth.uid(), cancel_reason = trim(_reason), updated_at = now() WHERE id = _id;
    FOR f IN SELECT * FROM public.oq_flows WHERE request_id = _id AND status <> 'cancelled' LOOP
      UPDATE public.oq_flows SET status = 'cancelled', cancelled_at = now(), cancel_reason = trim(_reason), waiting_info = false, updated_at = now() WHERE id = f.id;
      PERFORM private.oq_log(_id, f.id, NULL, f.current_round, 'flow_cancelled', f.status, 'cancelled', jsonb_build_object('reason',trim(_reason)));
    END LOOP;
    PERFORM private.oq_log(_id, NULL, NULL, NULL, 'cancelled', 'submitted', 'cancelled', jsonb_build_object('reason',trim(_reason)));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.oq_comment(_flow uuid, _text text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE f public.oq_flows; r public.oq_requests;
BEGIN
  SELECT * INTO f FROM public.oq_flows WHERE id = _flow;
  SELECT * INTO r FROM public.oq_requests WHERE id = f.request_id;
  IF r.id IS NULL OR NOT private.is_active(auth.uid()) OR NOT (r.creator_id = auth.uid() OR f.assignee_id = auth.uid() OR private.sig_can(auth.uid(),'oq.manage')) THEN
    RAISE EXCEPTION 'Không có quyền trao đổi trong luồng này.'; END IF;
  IF coalesce(trim(_text),'') = '' OR length(_text) > 3000 THEN RAISE EXCEPTION 'Nội dung không hợp lệ.'; END IF;
  PERFORM private.oq_log(r.id, _flow, NULL, f.current_round, 'message', NULL, NULL, jsonb_build_object('text',trim(_text)));
END $$;

REVOKE ALL ON FUNCTION private.oq_notify(uuid,text,uuid,jsonb,text), private.oq_log(uuid,uuid,uuid,integer,text,text,text,jsonb),
  private.oq_missing(uuid), private.oq_flow_for_handler(uuid), private.oq_flow_for_owner(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.oq_can_view(uuid,uuid), private.oq_can_see_drafts(uuid,uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.oq_assignees(text), public.oq_save(uuid,jsonb), public.oq_delete_draft(uuid), public.oq_image_add(uuid,text,text,text),
  public.oq_image_update(uuid,text,text,boolean), public.oq_missing(uuid), public.oq_submit(uuid), public.oq_accept(uuid),
  public.oq_save_response(uuid,text,jsonb), public.oq_publish_response(uuid,text,jsonb), public.oq_complete(uuid), public.oq_request_info(uuid,text),
  public.oq_answer_info(uuid,text), public.oq_reask(uuid,text,jsonb,jsonb), public.oq_reassign(uuid,uuid), public.oq_set_choice(uuid,text),
  public.oq_cancel(uuid,uuid,text), public.oq_comment(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.oq_assignees(text), public.oq_save(uuid,jsonb), public.oq_delete_draft(uuid), public.oq_image_add(uuid,text,text,text),
  public.oq_image_update(uuid,text,text,boolean), public.oq_missing(uuid), public.oq_submit(uuid), public.oq_accept(uuid),
  public.oq_save_response(uuid,text,jsonb), public.oq_publish_response(uuid,text,jsonb), public.oq_complete(uuid), public.oq_request_info(uuid,text),
  public.oq_answer_info(uuid,text), public.oq_reask(uuid,text,jsonb,jsonb), public.oq_reassign(uuid,uuid), public.oq_set_choice(uuid,text),
  public.oq_cancel(uuid,uuid,text), public.oq_comment(uuid,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.push_wake() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _tok text;
BEGIN
  IF NEW.kind NOT IN ('signal_new','signal_assigned','leave_pending','leave_result','leave_cancel_request','leave_cc','att_witness','att_new')
     AND NEW.kind NOT LIKE 'content\_%' AND NEW.kind NOT LIKE 'order\_%' AND NEW.kind NOT LIKE 'oq\_%' THEN RETURN NEW; END IF;
  IF NEW.kind = 'oq_accepted' THEN RETURN NEW; END IF;
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
     AND NEW.kind NOT LIKE 'content\_%' AND NEW.kind NOT LIKE 'order\_%' AND NEW.kind NOT LIKE 'oq\_%' THEN RETURN NEW; END IF;
  IF NEW.kind LIKE 'content\_%' THEN
    SELECT coalesce((data->'zalo'->>NEW.kind)::boolean, false) INTO _on FROM public.content_notify_settings WHERE id = 1;
    IF NOT coalesce(_on,false) THEN RETURN NEW; END IF;
  ELSIF NEW.kind LIKE 'order\_%' THEN
    SELECT coalesce((data->'order'->'zalo'->>NEW.kind)::boolean, false) INTO _on FROM public.content_notify_settings WHERE id = 1;
    IF NOT coalesce(_on,false) THEN RETURN NEW; END IF;
  ELSIF NEW.kind LIKE 'oq\_%' THEN
    IF NEW.kind = 'oq_accepted' THEN RETURN NEW; END IF;
    SELECT coalesce((data->'oq'->>'zalo')::boolean, true) INTO _on FROM public.content_notify_settings WHERE id = 1;
    IF NOT coalesce(_on,true) THEN RETURN NEW; END IF;
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