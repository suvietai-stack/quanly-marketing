-- Sửa lỗi Hỏi Giá & Tiến Độ: tự hoàn tất khi công bố đủ, kiểm tra target/nội dung, khóa công bố khi chờ Sale,
-- mốc thời gian theo lượt, đổi người cần tiếp nhận lại, quyền oq.accept, ảnh bổ sung, dọn ảnh an toàn. Chỉ thêm, không xóa dữ liệu.

ALTER TABLE public.oq_rounds ADD COLUMN IF NOT EXISTS assigned_at timestamptz;
UPDATE public.oq_rounds SET assigned_at = created_at WHERE assigned_at IS NULL;
ALTER TABLE public.oq_rounds ALTER COLUMN assigned_at SET DEFAULT now();

ALTER TABLE public.oq_item_images ADD COLUMN IF NOT EXISTS flow_id uuid REFERENCES public.oq_flows(id) ON DELETE CASCADE;
ALTER TABLE public.oq_item_images ADD COLUMN IF NOT EXISTS round_no integer;
ALTER TABLE public.oq_item_images ADD COLUMN IF NOT EXISTS info_request_id uuid REFERENCES public.oq_info_requests(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.oq_storage_cleanup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  owner_id uuid,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  done_at timestamptz,
  attempts integer NOT NULL DEFAULT 0,
  last_error text
);
CREATE UNIQUE INDEX IF NOT EXISTS oq_storage_cleanup_open ON public.oq_storage_cleanup(path) WHERE done_at IS NULL;
GRANT SELECT ON public.oq_storage_cleanup TO authenticated;
GRANT ALL ON public.oq_storage_cleanup TO service_role;
ALTER TABLE public.oq_storage_cleanup ENABLE ROW LEVEL SECURITY;
CREATE POLICY oq_cleanup_sel ON public.oq_storage_cleanup FOR SELECT TO authenticated USING (owner_id = auth.uid());

-- Ảnh bị xóa (chỉ có thể là ảnh bản nháp hoặc ảnh bổ sung đang chờ) -> đưa file vào hàng đợi dọn nếu không còn bản ghi nào dùng.
CREATE OR REPLACE FUNCTION private.oq_img_deleted() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.oq_item_images WHERE path = OLD.path) THEN
    INSERT INTO public.oq_storage_cleanup(path, owner_id, reason) VALUES (OLD.path, OLD.created_by, 'image_deleted')
    ON CONFLICT (path) WHERE done_at IS NULL DO NOTHING;
  END IF;
  RETURN OLD;
END $$;
DROP TRIGGER IF EXISTS oq_img_deleted ON public.oq_item_images;
CREATE TRIGGER oq_img_deleted AFTER DELETE ON public.oq_item_images FOR EACH ROW EXECUTE FUNCTION private.oq_img_deleted();

CREATE POLICY oq_obj_del_cleanup ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'order-quotes' AND EXISTS (SELECT 1 FROM public.oq_storage_cleanup c WHERE c.path = name AND c.owner_id = auth.uid() AND c.done_at IS NULL));
CREATE POLICY oq_obj_ins_info ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'order-quotes' AND lower(name) ~ '\.(jpe?g|png|webp|gif|heic|heif)$'
    AND EXISTS (SELECT 1 FROM public.oq_requests r JOIN public.oq_flows f ON f.request_id = r.id
      WHERE r.id::text = (storage.foldername(name))[1] AND r.creator_id = auth.uid() AND r.status = 'submitted' AND f.waiting_info AND f.status <> 'cancelled'));

CREATE OR REPLACE FUNCTION public.oq_cleanup_pending() RETURNS SETOF text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT path FROM public.oq_storage_cleanup WHERE owner_id = auth.uid() AND done_at IS NULL AND attempts < 10 ORDER BY created_at LIMIT 200;
$$;
CREATE OR REPLACE FUNCTION public.oq_cleanup_done(_paths text[], _error text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _error IS NULL THEN
    UPDATE public.oq_storage_cleanup SET done_at = now() WHERE owner_id = auth.uid() AND done_at IS NULL AND path = ANY(_paths)
      AND NOT EXISTS (SELECT 1 FROM public.oq_item_images g WHERE g.path = oq_storage_cleanup.path);
  ELSE
    UPDATE public.oq_storage_cleanup SET attempts = attempts + 1, last_error = left(_error, 500) WHERE owner_id = auth.uid() AND done_at IS NULL AND path = ANY(_paths);
  END IF;
END $$;

-- Người Cung ứng hợp lệ: đang hoạt động + quyền Tiếp nhận + quyền phản hồi đúng loại luồng.
CREATE OR REPLACE FUNCTION private.oq_valid_assignee(_u uuid, _kind text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _u IS NOT NULL AND private.is_active(_u) AND private.sig_can(_u,'oq.accept')
    AND private.sig_can(_u, CASE WHEN _kind = 'price' THEN 'oq.reply_price' ELSE 'oq.reply_progress' END);
$$;

CREATE OR REPLACE FUNCTION public.oq_assignees(_kind text) RETURNS TABLE(id uuid, full_name text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.full_name FROM public.profiles p
  WHERE (private.sig_can(auth.uid(),'oq.create') OR private.sig_can(auth.uid(),'oq.manage'))
    AND private.oq_valid_assignee(p.id, _kind)
  ORDER BY p.full_name;
$$;

-- Đặc tả một đích phản hồi của lượt: hạng mục bắt buộc, khóa được phép. Báo lỗi nếu đích không hợp lệ.
CREATE OR REPLACE FUNCTION private.oq_target_spec(_round uuid, _target text) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _r public.oq_rounds; _kind text; _it jsonb; _req text[] := '{}'; _cat text; _c jsonb;
BEGIN
  SELECT * INTO _r FROM public.oq_rounds WHERE id = _round;
  IF _r.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy lượt xử lý.'; END IF;
  SELECT kind INTO _kind FROM public.oq_flows WHERE id = _r.flow_id;
  IF coalesce(_target,'') = '' THEN RAISE EXCEPTION 'Thiếu đối tượng phản hồi.'; END IF;
  IF _kind = 'progress' THEN
    IF _target = 'conclusion' THEN
      RETURN jsonb_build_object('req','["text"]'::jsonb,'allow','["text"]'::jsonb,'label','Kết luận chung');
    END IF;
    SELECT e INTO _it FROM jsonb_array_elements(_r.items_snapshot) e WHERE e->>'id' = _target;
    IF _it IS NULL THEN RAISE EXCEPTION 'Sản phẩm không thuộc lượt xử lý hiện tại.'; END IF;
    RETURN jsonb_build_object('req','["reply"]'::jsonb,'allow','["reply","capability","eta","note"]'::jsonb,'label',(_it->>'code')||' '||(_it->>'name'));
  END IF;
  IF _target = 'conclusion' THEN RAISE EXCEPTION 'Luồng Hỏi Giá không có kết luận chung.'; END IF;
  IF _target = 'shipping' THEN
    IF coalesce(_r.config->>'shipping_mode','per_item') <> 'common' THEN RAISE EXCEPTION 'Lượt này không yêu cầu giá vận chuyển chung.'; END IF;
    RETURN jsonb_build_object('req','["shipping"]'::jsonb,'allow','["shipping"]'::jsonb,'label','Vận chuyển chung');
  END IF;
  SELECT e INTO _it FROM jsonb_array_elements(_r.items_snapshot) e WHERE e->>'id' = _target;
  IF _it IS NULL THEN RAISE EXCEPTION 'Sản phẩm không thuộc lượt xử lý hiện tại.'; END IF;
  _c := _r.config->'items'->_target;
  FOREACH _cat IN ARRAY ARRAY['product','processing','box','shipping'] LOOP
    IF _cat = 'shipping' AND coalesce(_r.config->>'shipping_mode','per_item') <> 'per_item' THEN CONTINUE; END IF;
    IF jsonb_typeof(_c->_cat) = 'object' AND coalesce((_c->_cat->>'on')::boolean,false) THEN _req := _req || _cat; END IF;
  END LOOP;
  IF cardinality(_req) = 0 THEN RAISE EXCEPTION 'Sale không yêu cầu báo giá cho sản phẩm này.'; END IF;
  RETURN jsonb_build_object('req', to_jsonb(_req), 'allow', to_jsonb(_req || 'note'::text), 'label', (_it->>'code')||' '||(_it->>'name'));
END $$;

-- Chỉ giữ khóa được phép, cắt khoảng trắng, bỏ giá trị rỗng.
CREATE OR REPLACE FUNCTION private.oq_clean(_content jsonb, _spec jsonb) RETURNS jsonb
LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT coalesce(jsonb_object_agg(k, to_jsonb(v)), '{}'::jsonb) FROM (
    SELECT a.k, left(trim(coalesce(_content,'{}'::jsonb)->>a.k), 5000) AS v FROM jsonb_array_elements_text(_spec->'allow') a(k)
  ) s WHERE coalesce(v,'') <> '';
$$;

-- Hoàn tất luồng nếu lượt hiện tại đã đủ (gọi khi luồng đã được khóa FOR UPDATE). Trả true nếu vừa hoàn tất.
CREATE OR REPLACE FUNCTION private.oq_try_complete(_flow uuid) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE f public.oq_flows; _rid uuid; r public.oq_requests;
BEGIN
  SELECT * INTO f FROM public.oq_flows WHERE id = _flow;
  IF f.status <> 'processing' OR f.waiting_info THEN RETURN false; END IF;
  SELECT id INTO _rid FROM public.oq_rounds WHERE flow_id = _flow AND no = f.current_round;
  IF cardinality(private.oq_missing(_rid)) > 0 THEN RETURN false; END IF;
  UPDATE public.oq_flows SET status = 'answered', completed_at = now(), updated_at = now() WHERE id = _flow AND status = 'processing';
  IF NOT FOUND THEN RETURN false; END IF;
  UPDATE public.oq_rounds SET completed_at = coalesce(completed_at, now()) WHERE id = _rid;
  PERFORM private.oq_log(f.request_id, _flow, NULL, f.current_round, 'completed', 'processing', 'answered', jsonb_build_object('auto', true));
  SELECT * INTO r FROM public.oq_requests WHERE id = f.request_id;
  PERFORM private.oq_notify(r.creator_id, 'oq_done', _flow, jsonb_build_object('request_id',r.id,'code',f.code,'title',r.title,'flow',f.kind), 'done:'||_flow||':'||f.current_round);
  RETURN true;
END $$;

CREATE OR REPLACE FUNCTION public.oq_submit(_id uuid) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); r public.oq_requests; _code text; _snap jsonb; _cfg jsonb; _pa uuid; _ta uuid; _fp uuid; _ft uuid; _n int; _bad text;
BEGIN
  SELECT * INTO r FROM public.oq_requests WHERE id = _id FOR UPDATE;
  IF r.id IS NULL OR r.creator_id <> _uid OR r.status <> 'draft' THEN RAISE EXCEPTION 'Chỉ gửi được bản nháp của chính bạn.'; END IF;
  IF NOT private.sig_can(_uid,'oq.create') THEN RAISE EXCEPTION 'Bạn không có quyền tạo yêu cầu.'; END IF;
  IF trim(r.title) = '' THEN RAISE EXCEPTION 'Thiếu tên yêu cầu.'; END IF;
  IF coalesce(trim(r.delivery_place),'') = '' THEN RAISE EXCEPTION 'Thiếu địa điểm giao hàng.'; END IF;
  IF r.delivery_date IS NULL THEN RAISE EXCEPTION 'Thiếu ngày khách yêu cầu giao.'; END IF;
  SELECT count(*) INTO _n FROM public.oq_items WHERE request_id = _id;
  IF _n = 0 THEN RAISE EXCEPTION 'Cần ít nhất một sản phẩm.'; END IF;
  SELECT code INTO _bad FROM public.oq_items WHERE request_id = _id AND trim(name) = '' ORDER BY position LIMIT 1;
  IF _bad IS NOT NULL THEN RAISE EXCEPTION '%: chưa nhập tên sản phẩm.', _bad; END IF;
  SELECT code INTO _bad FROM public.oq_items WHERE request_id = _id AND coalesce(qty,0) <= 0 ORDER BY position LIMIT 1;
  IF _bad IS NOT NULL THEN RAISE EXCEPTION '%: số lượng phải lớn hơn 0.', _bad; END IF;
  SELECT code INTO _bad FROM public.oq_items WHERE request_id = _id AND coalesce(trim(unit),'') = '' ORDER BY position LIMIT 1;
  IF _bad IS NOT NULL THEN RAISE EXCEPTION '%: chưa nhập đơn vị tính.', _bad; END IF;
  SELECT code INTO _bad FROM public.oq_items WHERE request_id = _id AND coalesce(trim(detail),'') = '' ORDER BY position LIMIT 1;
  IF _bad IS NOT NULL THEN RAISE EXCEPTION '%: chưa nhập thông tin chi tiết sản phẩm.', _bad; END IF;
  IF NOT (r.want_price OR r.want_progress) THEN RAISE EXCEPTION 'Chọn ít nhất Hỏi Giá hoặc Hỏi Tiến Độ.'; END IF;
  _cfg := r.draft_config;
  _pa := nullif(_cfg->>'price_assignee','')::uuid; _ta := nullif(_cfg->>'progress_assignee','')::uuid;
  IF r.want_price THEN
    IF NOT private.oq_valid_assignee(_pa,'price') THEN RAISE EXCEPTION 'Người phụ trách Hỏi Giá không hợp lệ hoặc không có quyền.'; END IF;
    IF NOT EXISTS (SELECT 1 FROM public.oq_items i WHERE i.request_id = _id AND EXISTS (
         SELECT 1 FROM jsonb_each(coalesce(_cfg->'price'->'items'->(i.id::text),'{}'::jsonb)) e
         WHERE e.key IN ('product','processing','box','shipping') AND jsonb_typeof(e.value) = 'object' AND coalesce((e.value->>'on')::boolean,false)
           AND NOT (e.key = 'shipping' AND coalesce(_cfg->'price'->>'shipping_mode','per_item') = 'common')))
       AND coalesce(_cfg->'price'->>'shipping_mode','per_item') <> 'common' THEN
      RAISE EXCEPTION 'Hỏi Giá: chọn ít nhất một hạng mục cần báo giá.'; END IF;
  END IF;
  IF r.want_progress THEN
    IF NOT private.oq_valid_assignee(_ta,'progress') THEN RAISE EXCEPTION 'Người phụ trách Hỏi Tiến Độ không hợp lệ hoặc không có quyền.'; END IF;
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

CREATE OR REPLACE FUNCTION public.oq_accept(_flow uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE f public.oq_flows; r public.oq_requests; _uid uuid := auth.uid(); _rd public.oq_rounds; _handover boolean;
BEGIN
  SELECT * INTO f FROM public.oq_flows WHERE id = _flow FOR UPDATE;
  IF f.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy luồng.'; END IF;
  SELECT * INTO r FROM public.oq_requests WHERE id = f.request_id;
  IF r.status = 'cancelled' OR f.status = 'cancelled' THEN RAISE EXCEPTION 'Yêu cầu/luồng đã hủy.'; END IF;
  IF NOT ((f.assignee_id = _uid AND private.oq_valid_assignee(_uid, f.kind)) OR (private.is_active(_uid) AND private.sig_can(_uid,'oq.manage'))) THEN
    RAISE EXCEPTION 'Cần được giao đúng luồng và có quyền Tiếp nhận + Phản hồi loại yêu cầu này.'; END IF;
  IF f.status <> 'pending' THEN RAISE EXCEPTION 'Luồng không ở trạng thái Chờ xác nhận.'; END IF;
  SELECT * INTO _rd FROM public.oq_rounds WHERE flow_id = _flow AND no = f.current_round;
  _handover := _rd.accepted_at IS NOT NULL;
  UPDATE public.oq_flows SET status = 'processing', accepted_at = now(), processing_started_at = coalesce(processing_started_at, now()), updated_at = now() WHERE id = _flow;
  UPDATE public.oq_rounds SET accepted_at = coalesce(accepted_at, now()) WHERE id = _rd.id;
  PERFORM private.oq_log(f.request_id, _flow, NULL, f.current_round, 'accepted', 'pending', 'processing', jsonb_build_object('assignee', f.assignee_id, 'handover', _handover));
  IF NOT _handover THEN PERFORM private.oq_log(f.request_id, _flow, NULL, f.current_round, 'processing_started', NULL, NULL, '{}'); END IF;
  PERFORM private.oq_notify(r.creator_id, 'oq_accepted', _flow, jsonb_build_object('request_id',r.id,'code',f.code,'title',r.title,'flow',f.kind), 'acc:'||_flow||':'||f.current_round||':'||f.assignee_id);
END $$;

CREATE OR REPLACE FUNCTION public.oq_save_response(_flow uuid, _target text, _content jsonb) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE f public.oq_flows; _rid uuid; _spec jsonb;
BEGIN
  f := private.oq_flow_for_handler(_flow);
  IF f.status <> 'processing' THEN RAISE EXCEPTION 'Chỉ phản hồi khi luồng Đang xử lý (cần Xác nhận tiếp nhận trước).'; END IF;
  SELECT id INTO _rid FROM public.oq_rounds WHERE flow_id = _flow AND no = f.current_round;
  _spec := private.oq_target_spec(_rid, _target);
  INSERT INTO public.oq_responses(round_id, flow_id, target, content, author_id) VALUES (_rid, _flow, _target, private.oq_clean(_content, _spec), auth.uid())
  ON CONFLICT (round_id, target) WHERE NOT is_published DO UPDATE SET content = EXCLUDED.content, author_id = EXCLUDED.author_id, updated_at = now();
END $$;

CREATE OR REPLACE FUNCTION public.oq_publish_response(_flow uuid, _target text, _content jsonb) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE f public.oq_flows; _rid uuid; _spec jsonb; _clean jsonb; _miss text[] := '{}'; _k text; _v int; r public.oq_requests; _first boolean;
  _labels jsonb := '{"product":"Giá sản phẩm","processing":"Giá gia công","box":"Giá hộp","shipping":"Giá vận chuyển","reply":"Nội dung phản hồi tiến độ","text":"Kết luận"}';
BEGIN
  f := private.oq_flow_for_handler(_flow);  -- khóa luồng FOR UPDATE: hai lần công bố đồng thời được xử lý tuần tự
  IF f.status <> 'processing' THEN RAISE EXCEPTION 'Chỉ công bố khi luồng Đang xử lý.'; END IF;
  IF f.waiting_info THEN RAISE EXCEPTION 'Đang chờ Sale bổ sung thông tin — chỉ lưu nháp được, tạm chưa công bố.'; END IF;
  SELECT id INTO _rid FROM public.oq_rounds WHERE flow_id = _flow AND no = f.current_round;
  _spec := private.oq_target_spec(_rid, _target);
  _clean := private.oq_clean(_content, _spec);
  FOR _k IN SELECT jsonb_array_elements_text(_spec->'req') LOOP
    IF NOT (_clean ? _k) THEN _miss := _miss || (_labels->>_k); END IF;
  END LOOP;
  IF cardinality(_miss) > 0 THEN RAISE EXCEPTION 'Chưa công bố được % — còn thiếu: %', _spec->>'label', array_to_string(_miss, ', '); END IF;
  IF _clean ? 'eta' AND (_clean->>'eta') !~ '^\d{4}-\d{2}-\d{2}$' THEN RAISE EXCEPTION 'Ngày dự kiến giao không hợp lệ.'; END IF;
  SELECT coalesce(max(version),0)+1 INTO _v FROM public.oq_responses WHERE round_id = _rid AND target = _target AND is_published;
  UPDATE public.oq_responses SET content = _clean, is_published = true, version = _v, author_id = auth.uid(), published_by = auth.uid(), published_at = now(), updated_at = now()
   WHERE round_id = _rid AND target = _target AND NOT is_published;
  IF NOT FOUND THEN
    INSERT INTO public.oq_responses(round_id, flow_id, target, content, author_id, is_published, version, published_by, published_at)
    VALUES (_rid, _flow, _target, _clean, auth.uid(), true, _v, auth.uid(), now());
  END IF;
  SELECT first_published_at IS NULL INTO _first FROM public.oq_rounds WHERE id = _rid;
  UPDATE public.oq_flows SET first_published_at = coalesce(first_published_at, now()), updated_at = now() WHERE id = _flow;
  UPDATE public.oq_rounds SET first_published_at = coalesce(first_published_at, now()) WHERE id = _rid;
  PERFORM private.oq_log(f.request_id, _flow, CASE WHEN _target ~ '^[0-9a-f-]{36}$' THEN _target::uuid END, f.current_round,
    'published', NULL, NULL, jsonb_build_object('target',_target,'version',_v,'first',_first));
  IF NOT private.oq_try_complete(_flow) THEN
    SELECT * INTO r FROM public.oq_requests WHERE id = f.request_id;
    PERFORM private.oq_notify(r.creator_id, 'oq_published', _flow, jsonb_build_object('request_id',r.id,'code',f.code,'title',r.title,'flow',f.kind), 'pub:'||_flow||':'||f.current_round||':'||_target||':'||_v);
  END IF;
  RETURN _v;
END $$;

CREATE OR REPLACE FUNCTION public.oq_complete(_flow uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE f public.oq_flows; _rid uuid; _miss text[];
BEGIN
  f := private.oq_flow_for_handler(_flow);
  IF f.status <> 'processing' THEN RAISE EXCEPTION 'Luồng không ở trạng thái Đang xử lý.'; END IF;
  IF f.waiting_info THEN RAISE EXCEPTION 'Đang chờ Sale bổ sung thông tin.'; END IF;
  SELECT id INTO _rid FROM public.oq_rounds WHERE flow_id = _flow AND no = f.current_round;
  _miss := private.oq_missing(_rid);
  IF cardinality(_miss) > 0 THEN RAISE EXCEPTION 'Còn thiếu: %', array_to_string(_miss, '; '); END IF;
  PERFORM private.oq_try_complete(_flow);
END $$;

CREATE OR REPLACE FUNCTION public.oq_answer_info(_flow uuid, _answer text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE f public.oq_flows; r public.oq_requests; _iid uuid; _imgs int;
BEGIN
  f := private.oq_flow_for_owner(_flow);
  IF NOT f.waiting_info THEN RAISE EXCEPTION 'Không có yêu cầu bổ sung đang chờ.'; END IF;
  IF coalesce(trim(_answer),'') = '' THEN RAISE EXCEPTION 'Nhập nội dung bổ sung.'; END IF;
  SELECT id INTO _iid FROM public.oq_info_requests WHERE flow_id = _flow AND answered_at IS NULL ORDER BY asked_at DESC LIMIT 1;
  UPDATE public.oq_info_requests SET answer = trim(_answer), answered_by = auth.uid(), answered_at = now() WHERE id = _iid;
  SELECT count(*) INTO _imgs FROM public.oq_item_images WHERE info_request_id = _iid;
  UPDATE public.oq_flows SET waiting_info = false, updated_at = now() WHERE id = _flow;
  PERFORM private.oq_log(f.request_id, _flow, NULL, f.current_round, 'info_answered', 'waiting_sale', NULL, jsonb_build_object('answer',trim(_answer),'info_id',_iid,'images',_imgs));
  SELECT * INTO r FROM public.oq_requests WHERE id = f.request_id;
  PERFORM private.oq_notify(f.assignee_id, 'oq_answered', _flow, jsonb_build_object('request_id',r.id,'code',f.code,'title',r.title,'flow',f.kind), 'ans:'||_iid);
  PERFORM private.oq_try_complete(_flow);
END $$;

CREATE OR REPLACE FUNCTION public.oq_info_image_add(_info uuid, _item uuid, _path text, _category text, _caption text) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _q public.oq_info_requests; f public.oq_flows; r public.oq_requests; _new uuid;
BEGIN
  SELECT * INTO _q FROM public.oq_info_requests WHERE id = _info;
  SELECT * INTO f FROM public.oq_flows WHERE id = _q.flow_id;
  SELECT * INTO r FROM public.oq_requests WHERE id = f.request_id;
  IF _q.id IS NULL OR _q.answered_at IS NOT NULL OR NOT f.waiting_info OR f.status = 'cancelled' OR r.status <> 'submitted' THEN
    RAISE EXCEPTION 'Chỉ thêm ảnh khi Cung ứng đang chờ bổ sung thông tin.'; END IF;
  IF r.creator_id <> auth.uid() OR NOT private.sig_can(auth.uid(),'oq.create') THEN RAISE EXCEPTION 'Chỉ người tạo yêu cầu được bổ sung ảnh.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.oq_items WHERE id = _item AND request_id = r.id) THEN RAISE EXCEPTION 'Sản phẩm không thuộc yêu cầu này.'; END IF;
  IF split_part(_path,'/',1) <> r.id::text OR lower(_path) !~ '\.(jpe?g|png|webp|gif|heic|heif)$' THEN RAISE EXCEPTION 'Đường dẫn ảnh không hợp lệ.'; END IF;
  INSERT INTO public.oq_item_images(request_id, item_id, path, category, caption, created_by, flow_id, round_no, info_request_id)
  VALUES (r.id, _item, _path, coalesce(nullif(_category,''),'other'), nullif(trim(coalesce(_caption,'')),''), auth.uid(), f.id, _q.round_no, _q.id) RETURNING id INTO _new;
  PERFORM private.oq_log(r.id, f.id, _item, _q.round_no, 'info_image_added', NULL, NULL, jsonb_build_object('info_id',_q.id,'image_id',_new));
  RETURN _new;
END $$;

CREATE OR REPLACE FUNCTION public.oq_info_image_delete(_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.oq_item_images g USING public.oq_info_requests q
   WHERE g.id = _id AND q.id = g.info_request_id AND q.answered_at IS NULL AND g.created_by = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Chỉ xóa được ảnh bổ sung chưa gửi của bạn.'; END IF;
END $$;

CREATE OR REPLACE FUNCTION public.oq_reask(_flow uuid, _note text, _config jsonb, _snapshot jsonb) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE f public.oq_flows; r public.oq_requests; _old public.oq_rounds; _no int; _snap jsonb;
BEGIN
  f := private.oq_flow_for_owner(_flow);
  IF f.status <> 'answered' THEN RAISE EXCEPTION 'Chỉ hỏi lại sau khi luồng đã có kết quả hoàn tất.'; END IF;
  IF coalesce(trim(_note),'') = '' THEN RAISE EXCEPTION 'Nhập nội dung hỏi lại.'; END IF;
  SELECT * INTO _old FROM public.oq_rounds WHERE flow_id = _flow AND no = f.current_round;
  -- Chỉ nhận thay đổi số lượng; tên/mã sản phẩm lấy từ ảnh chụp lượt trước.
  SELECT coalesce(jsonb_agg(CASE WHEN q.n IS NOT NULL THEN x.o || jsonb_build_object('qty', q.n) ELSE x.o END ORDER BY x.ord), '[]'::jsonb) INTO _snap
    FROM jsonb_array_elements(_old.items_snapshot) WITH ORDINALITY x(o, ord)
    LEFT JOIN LATERAL (SELECT (s->>'qty')::numeric AS n FROM jsonb_array_elements(coalesce(_snapshot,'[]'::jsonb)) s
                       WHERE s->>'id' = x.o->>'id' AND coalesce(s->>'qty','') <> '' LIMIT 1) q ON true;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(_snap) e WHERE coalesce((e->>'qty')::numeric, 0) <= 0) THEN RAISE EXCEPTION 'Số lượng phải lớn hơn 0.'; END IF;
  _no := f.current_round + 1;
  INSERT INTO public.oq_rounds(flow_id, no, items_snapshot, config, assignee_id, created_by, request_note, assigned_at)
  VALUES (_flow, _no, _snap, coalesce(_config, _old.config), f.assignee_id, auth.uid(), trim(_note), now());
  -- Mốc trên luồng phản ánh lượt hiện tại; mốc lượt cũ giữ nguyên trong oq_rounds + oq_events.
  UPDATE public.oq_flows SET status = 'pending', current_round = _no, waiting_info = false, assigned_at = now(),
    accepted_at = NULL, processing_started_at = NULL, first_published_at = NULL, completed_at = NULL, updated_at = now() WHERE id = _flow;
  PERFORM private.oq_log(f.request_id, _flow, NULL, _no, 'reasked', 'answered', 'pending', jsonb_build_object('note',trim(_note),'prev_round',f.current_round));
  SELECT * INTO r FROM public.oq_requests WHERE id = f.request_id;
  PERFORM private.oq_notify(f.assignee_id, 'oq_reask', _flow, jsonb_build_object('request_id',r.id,'code',f.code,'title',r.title,'flow',f.kind,'round',_no), 'reask:'||_flow||':'||_no);
  RETURN _no;
END $$;

CREATE OR REPLACE FUNCTION public.oq_reassign(_flow uuid, _user uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE f public.oq_flows; r public.oq_requests; _n int;
BEGIN
  f := private.oq_flow_for_owner(_flow);
  IF f.status NOT IN ('pending','processing') THEN RAISE EXCEPTION 'Chỉ đổi người khi luồng Chờ xác nhận hoặc Đang xử lý.'; END IF;
  IF _user IS NULL OR _user = f.assignee_id THEN RETURN; END IF;
  IF NOT private.oq_valid_assignee(_user, f.kind) THEN RAISE EXCEPTION 'Người được chọn không có quyền tiếp nhận/xử lý luồng này.'; END IF;
  -- Người mới phải Xác nhận tiếp nhận để ghi mốc của mình; nháp và kết quả đã công bố giữ nguyên.
  UPDATE public.oq_flows SET assignee_id = _user, assigned_at = now(), accepted_at = NULL, status = 'pending', updated_at = now() WHERE id = _flow;
  UPDATE public.oq_rounds SET assignee_id = _user, assigned_at = now() WHERE flow_id = _flow AND no = f.current_round;
  PERFORM private.oq_log(f.request_id, _flow, NULL, f.current_round, 'reassigned', f.status, 'pending', jsonb_build_object('from',f.assignee_id,'to',_user));
  SELECT count(*) INTO _n FROM public.oq_events WHERE flow_id = _flow AND kind = 'reassigned';
  SELECT * INTO r FROM public.oq_requests WHERE id = f.request_id;
  PERFORM private.oq_notify(_user, 'oq_assigned', _flow, jsonb_build_object('request_id',r.id,'code',f.code,'title',r.title,'flow',f.kind,'round',f.current_round), 'asg:'||_flow||':'||f.current_round||':'||_n);
END $$;

REVOKE ALL ON FUNCTION private.oq_img_deleted(), private.oq_valid_assignee(uuid,text), private.oq_target_spec(uuid,text), private.oq_clean(jsonb,jsonb), private.oq_try_complete(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.oq_cleanup_pending(), public.oq_cleanup_done(text[],text), public.oq_info_image_add(uuid,uuid,text,text,text), public.oq_info_image_delete(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.oq_cleanup_pending(), public.oq_cleanup_done(text[],text), public.oq_info_image_add(uuid,uuid,text,text,text), public.oq_info_image_delete(uuid) TO authenticated;
