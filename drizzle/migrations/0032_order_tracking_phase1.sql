CREATE SEQUENCE IF NOT EXISTS public.ot_code_seq START 1;

CREATE TABLE public.ot_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  allow_manual boolean NOT NULL DEFAULT true,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.ot_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

CREATE TABLE public.ot_suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 200),
  groups text[] NOT NULL DEFAULT '{}',
  contact text, phone text, address text, note text,
  active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ot_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  source text NOT NULL DEFAULT 'manual',
  order_type text NOT NULL CHECK (order_type IN ('sample','mass')),
  title text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 300),
  due_date date NOT NULL,
  original_due date NOT NULL,
  due_time text,
  address text,
  sale_id uuid,
  supply_id uuid,
  crm_url text,
  note text,
  planned boolean NOT NULL DEFAULT false,
  has_box boolean NOT NULL DEFAULT false,
  has_processing boolean NOT NULL DEFAULT false,
  qty numeric,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_progress','done','cancelled')),
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ot_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.ot_orders(id),
  kind text NOT NULL CHECK (kind IN ('intake','blank','box','proc','packing','delivery')),
  position int NOT NULL DEFAULT 0,
  supplier_id uuid REFERENCES public.ot_suppliers(id),
  assignee_id uuid,
  qty numeric,
  proc_type text,
  planned_date date,
  planned_arrival date,
  ordered_at timestamptz,
  mail_due date, mail_sent_at timestamptz, mail_by uuid,
  send_planned date, sent_at timestamptz, sent_qty numeric NOT NULL DEFAULT 0,
  shipped_at timestamptz,
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','doing','waiting','done','skipped')),
  done_at timestamptz,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ot_tasks_order_idx ON public.ot_tasks(order_id);
CREATE INDEX ot_tasks_assignee_idx ON public.ot_tasks(assignee_id);

CREATE TABLE public.ot_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.ot_tasks(id),
  qty numeric NOT NULL CHECK (qty > 0),
  received_at timestamptz NOT NULL DEFAULT now(),
  actor_id uuid NOT NULL
);
CREATE INDEX ot_receipts_task_idx ON public.ot_receipts(task_id);

CREATE TABLE public.ot_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.ot_orders(id),
  task_id uuid REFERENCES public.ot_tasks(id),
  actor_id uuid,
  action text NOT NULL,
  old jsonb, new jsonb, reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ot_logs_order_idx ON public.ot_logs(order_id);

GRANT SELECT ON public.ot_settings, public.ot_suppliers, public.ot_orders, public.ot_tasks, public.ot_receipts, public.ot_logs TO authenticated;
GRANT ALL ON public.ot_settings, public.ot_suppliers, public.ot_orders, public.ot_tasks, public.ot_receipts, public.ot_logs TO service_role;
ALTER TABLE public.ot_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ot_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ot_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ot_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ot_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ot_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION private.ot_any(_uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT private.sig_can(_uid,'ot.view_own') OR private.sig_can(_uid,'ot.view_all') OR private.sig_can(_uid,'ot.manage')
      OR private.sig_can(_uid,'ot.task_view') OR private.sig_can(_uid,'ot.supplier') OR private.sig_can(_uid,'ot.create');
$$;

CREATE OR REPLACE FUNCTION private.ot_can_view(_uid uuid, _order uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT private.sig_can(_uid,'ot.view_all') OR private.sig_can(_uid,'ot.manage')
    OR EXISTS (SELECT 1 FROM public.ot_orders o WHERE o.id = _order AND private.sig_can(_uid,'ot.view_own')
               AND _uid IN (o.sale_id, o.supply_id, o.created_by))
    OR EXISTS (SELECT 1 FROM public.ot_tasks t WHERE t.order_id = _order AND t.assignee_id = _uid AND private.sig_can(_uid,'ot.task_view'));
$$;

CREATE OR REPLACE FUNCTION private.ot_can_stage(_uid uuid, _order uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT private.sig_can(_uid,'ot.manage')
    OR (private.sig_can(_uid,'ot.stage_update') AND private.ot_can_view(_uid,_order));
$$;

CREATE POLICY ot_settings_read ON public.ot_settings FOR SELECT TO authenticated USING (private.ot_any(auth.uid()) OR private.sig_can(auth.uid(),'ot.settings'));
CREATE POLICY ot_suppliers_read ON public.ot_suppliers FOR SELECT TO authenticated USING (private.ot_any(auth.uid()));
CREATE POLICY ot_orders_read ON public.ot_orders FOR SELECT TO authenticated USING (private.ot_can_view(auth.uid(), id));
CREATE POLICY ot_tasks_read ON public.ot_tasks FOR SELECT TO authenticated USING (private.ot_can_view(auth.uid(), order_id));
CREATE POLICY ot_receipts_read ON public.ot_receipts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ot_tasks t WHERE t.id = task_id AND private.ot_can_view(auth.uid(), t.order_id)));
CREATE POLICY ot_logs_read ON public.ot_logs FOR SELECT TO authenticated USING (private.ot_can_view(auth.uid(), order_id));

CREATE OR REPLACE FUNCTION private.ot_log(_order uuid, _task uuid, _action text, _old jsonb, _new jsonb, _reason text DEFAULT NULL) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.ot_logs(order_id, task_id, actor_id, action, old, new, reason) VALUES (_order, _task, auth.uid(), _action, _old, _new, _reason);
$$;

CREATE OR REPLACE FUNCTION private.ot_received(_task uuid) RETURNS numeric
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(sum(qty),0) FROM public.ot_receipts WHERE task_id = _task;
$$;

CREATE OR REPLACE FUNCTION public.ot_settings_save(_allow_manual boolean) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT private.sig_can(auth.uid(),'ot.settings') THEN RAISE EXCEPTION 'Bạn không có quyền quản lý cài đặt đơn hàng.'; END IF;
  UPDATE public.ot_settings SET allow_manual = _allow_manual, updated_by = auth.uid(), updated_at = now() WHERE id = 1;
END $$;

CREATE OR REPLACE FUNCTION public.ot_supplier_save(_id uuid, _data jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _rid uuid := _id; _groups text[];
BEGIN
  IF NOT private.sig_can(auth.uid(),'ot.supplier') THEN RAISE EXCEPTION 'Bạn không có quyền quản lý nhà cung cấp.'; END IF;
  IF length(trim(coalesce(_data->>'name',''))) = 0 THEN RAISE EXCEPTION 'Vui lòng nhập tên nhà cung cấp.'; END IF;
  SELECT coalesce(array_agg(g), '{}') INTO _groups FROM jsonb_array_elements_text(coalesce(_data->'groups','[]')) g
    WHERE g IN ('blank','box','print','process','shipping','other');
  IF _rid IS NULL THEN
    INSERT INTO public.ot_suppliers(name, groups, contact, phone, address, note, created_by)
    VALUES (trim(_data->>'name'), _groups, _data->>'contact', _data->>'phone', _data->>'address', _data->>'note', auth.uid()) RETURNING id INTO _rid;
  ELSE
    UPDATE public.ot_suppliers SET name = trim(_data->>'name'), groups = _groups, contact = _data->>'contact', phone = _data->>'phone',
      address = _data->>'address', note = _data->>'note', updated_at = now() WHERE id = _rid;
    IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy nhà cung cấp.'; END IF;
  END IF;
  RETURN _rid;
END $$;

CREATE OR REPLACE FUNCTION public.ot_supplier_active(_id uuid, _active boolean) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT private.sig_can(auth.uid(),'ot.supplier') THEN RAISE EXCEPTION 'Bạn không có quyền quản lý nhà cung cấp.'; END IF;
  UPDATE public.ot_suppliers SET active = _active, updated_at = now() WHERE id = _id;
END $$;

CREATE OR REPLACE FUNCTION public.ot_create(_data jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _id uuid; _code text; _due date;
BEGIN
  IF NOT private.sig_can(_uid,'ot.create') THEN RAISE EXCEPTION 'Bạn không có quyền tạo đơn thủ công.'; END IF;
  IF NOT (SELECT allow_manual FROM public.ot_settings WHERE id = 1) THEN RAISE EXCEPTION 'Tạo đơn thủ công đang tắt trong Cài đặt.'; END IF;
  IF coalesce(_data->>'order_type','') NOT IN ('sample','mass') THEN RAISE EXCEPTION 'Vui lòng chọn loại đơn hàng.'; END IF;
  IF length(trim(coalesce(_data->>'title',''))) = 0 THEN RAISE EXCEPTION 'Vui lòng nhập tên đơn hàng.'; END IF;
  _due := nullif(_data->>'due_date','')::date;
  IF _due IS NULL THEN RAISE EXCEPTION 'Vui lòng chọn ngày khách nhận hàng.'; END IF;
  _code := 'BASE-DH-'||lpad(nextval('public.ot_code_seq')::text,6,'0');
  INSERT INTO public.ot_orders(code, order_type, title, due_date, original_due, due_time, address, sale_id, supply_id, crm_url, note, created_by)
  VALUES (_code, _data->>'order_type', trim(_data->>'title'), _due, _due, nullif(_data->>'due_time',''), nullif(_data->>'address',''),
    nullif(_data->>'sale_id','')::uuid, nullif(_data->>'supply_id','')::uuid, nullif(trim(coalesce(_data->>'crm_url','')),''), nullif(_data->>'note',''), _uid)
  RETURNING id INTO _id;
  INSERT INTO public.ot_tasks(order_id, kind, position, assignee_id, planned_date)
  VALUES (_id, 'intake', 0, nullif(_data->>'supply_id','')::uuid, current_date);
  PERFORM private.ot_log(_id, NULL, 'create', NULL, jsonb_build_object('code', _code, 'due_date', _due));
  RETURN _id;
END $$;

CREATE OR REPLACE FUNCTION public.ot_accept(_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _o public.ot_orders;
BEGIN
  SELECT * INTO _o FROM public.ot_orders WHERE id = _id FOR UPDATE;
  IF _o.id IS NULL OR NOT private.ot_can_view(auth.uid(), _id) THEN RAISE EXCEPTION 'Không tìm thấy đơn hàng.'; END IF;
  IF NOT (private.sig_can(auth.uid(),'ot.manage') OR private.sig_can(auth.uid(),'ot.accept')) THEN RAISE EXCEPTION 'Bạn không có quyền tiếp nhận đơn.'; END IF;
  IF _o.status <> 'new' THEN RAISE EXCEPTION 'Đơn đã được tiếp nhận.'; END IF;
  UPDATE public.ot_orders SET status = 'in_progress', accepted_at = now(), supply_id = coalesce(supply_id, auth.uid()), updated_at = now() WHERE id = _id;
  UPDATE public.ot_tasks SET status = 'done', done_at = now(), assignee_id = coalesce(assignee_id, auth.uid()), updated_at = now()
    WHERE order_id = _id AND kind = 'intake';
  PERFORM private.ot_log(_id, NULL, 'accept', NULL, NULL);
END $$;

CREATE OR REPLACE FUNCTION public.ot_update_order(_id uuid, _data jsonb) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _o public.ot_orders; _uid uuid := auth.uid(); _mgr boolean;
BEGIN
  SELECT * INTO _o FROM public.ot_orders WHERE id = _id FOR UPDATE;
  IF _o.id IS NULL OR NOT private.ot_can_view(_uid, _id) THEN RAISE EXCEPTION 'Không tìm thấy đơn hàng.'; END IF;
  _mgr := private.sig_can(_uid,'ot.manage');
  IF (_data ? 'sale_id' OR _data ? 'supply_id') AND NOT (_mgr OR private.sig_can(_uid,'ot.assign')) THEN RAISE EXCEPTION 'Bạn không có quyền phân công người phụ trách.'; END IF;
  IF (_data ? 'title' OR _data ? 'address' OR _data ? 'crm_url' OR _data ? 'note' OR _data ? 'due_time' OR _data ? 'order_type')
     AND NOT (_mgr OR (_o.created_by = _uid AND private.sig_can(_uid,'ot.create'))) THEN RAISE EXCEPTION 'Bạn không có quyền sửa thông tin đơn.'; END IF;
  IF _data ? 'title' AND length(trim(coalesce(_data->>'title',''))) = 0 THEN RAISE EXCEPTION 'Vui lòng nhập tên đơn hàng.'; END IF;
  UPDATE public.ot_orders SET
    title = CASE WHEN _data ? 'title' THEN trim(_data->>'title') ELSE title END,
    order_type = CASE WHEN _data->>'order_type' IN ('sample','mass') THEN _data->>'order_type' ELSE order_type END,
    address = CASE WHEN _data ? 'address' THEN nullif(_data->>'address','') ELSE address END,
    crm_url = CASE WHEN _data ? 'crm_url' THEN nullif(_data->>'crm_url','') ELSE crm_url END,
    note = CASE WHEN _data ? 'note' THEN nullif(_data->>'note','') ELSE note END,
    due_time = CASE WHEN _data ? 'due_time' THEN nullif(_data->>'due_time','') ELSE due_time END,
    sale_id = CASE WHEN _data ? 'sale_id' THEN nullif(_data->>'sale_id','')::uuid ELSE sale_id END,
    supply_id = CASE WHEN _data ? 'supply_id' THEN nullif(_data->>'supply_id','')::uuid ELSE supply_id END,
    updated_at = now()
  WHERE id = _id;
  PERFORM private.ot_log(_id, NULL, 'update_order',
    (SELECT jsonb_object_agg(k, to_jsonb(_o)->k) FROM jsonb_object_keys(_data) k), _data);
END $$;

CREATE OR REPLACE FUNCTION public.ot_plan(_id uuid, _has_box boolean, _has_proc boolean, _qty numeric) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _o public.ot_orders; _box public.ot_tasks;
BEGIN
  SELECT * INTO _o FROM public.ot_orders WHERE id = _id FOR UPDATE;
  IF _o.id IS NULL OR NOT private.ot_can_stage(auth.uid(), _id) THEN RAISE EXCEPTION 'Bạn không có quyền cập nhật tiến độ đơn này.'; END IF;
  IF _o.status = 'new' THEN RAISE EXCEPTION 'Cần tiếp nhận đơn trước khi lập kế hoạch.'; END IF;
  IF _o.status IN ('done','cancelled') THEN RAISE EXCEPTION 'Đơn đã kết thúc.'; END IF;
  IF _qty IS NULL OR _qty <= 0 THEN RAISE EXCEPTION 'Vui lòng nhập số lượng lớn hơn 0.'; END IF;
  IF NOT _o.planned THEN
    INSERT INTO public.ot_tasks(order_id, kind, position, assignee_id, qty) VALUES
      (_id,'blank',10,_o.supply_id,_qty), (_id,'packing',40,_o.supply_id,NULL), (_id,'delivery',50,_o.supply_id,NULL);
  ELSIF _qty < (SELECT max(greatest(private.ot_received(id), sent_qty)) FROM public.ot_tasks WHERE order_id = _id) THEN
    RAISE EXCEPTION 'Số lượng không được nhỏ hơn số đã nhận/đã gửi.';
  END IF;
  SELECT * INTO _box FROM public.ot_tasks WHERE order_id = _id AND kind = 'box';
  IF _has_box AND _box.id IS NULL THEN
    INSERT INTO public.ot_tasks(order_id, kind, position, assignee_id, qty) VALUES (_id,'box',20,_o.supply_id,_qty);
  ELSIF _has_box AND _box.status = 'skipped' THEN
    UPDATE public.ot_tasks SET status = 'todo', updated_at = now() WHERE id = _box.id;
  ELSIF NOT _has_box AND _box.id IS NOT NULL AND _box.status <> 'skipped' THEN
    IF _box.ordered_at IS NOT NULL OR private.ot_received(_box.id) > 0 THEN RAISE EXCEPTION 'Đã đặt hộp nên không thể bỏ công đoạn đặt hộp.'; END IF;
    UPDATE public.ot_tasks SET status = 'skipped', updated_at = now() WHERE id = _box.id;
  END IF;
  IF NOT _has_proc AND EXISTS (SELECT 1 FROM public.ot_tasks WHERE order_id = _id AND kind = 'proc' AND status <> 'skipped'
       AND (mail_sent_at IS NOT NULL OR sent_qty > 0)) THEN
    RAISE EXCEPTION 'Đã có lượt gia công đang thực hiện nên không thể bỏ công đoạn In ấn & Gia công.';
  END IF;
  IF NOT _has_proc THEN UPDATE public.ot_tasks SET status = 'skipped', updated_at = now() WHERE order_id = _id AND kind = 'proc'; END IF;
  IF _has_proc THEN UPDATE public.ot_tasks SET status = 'todo', updated_at = now() WHERE order_id = _id AND kind = 'proc' AND status = 'skipped'; END IF;
  UPDATE public.ot_orders SET planned = true, has_box = _has_box, has_processing = _has_proc, qty = _qty, updated_at = now() WHERE id = _id;
  PERFORM private.ot_log(_id, NULL, 'plan',
    CASE WHEN _o.planned THEN jsonb_build_object('has_box',_o.has_box,'has_processing',_o.has_processing,'qty',_o.qty) END,
    jsonb_build_object('has_box',_has_box,'has_processing',_has_proc,'qty',_qty));
END $$;

CREATE OR REPLACE FUNCTION public.ot_proc_add(_order uuid, _data jsonb) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _o public.ot_orders; _tid uuid; _qty numeric := nullif(_data->>'qty','')::numeric;
BEGIN
  SELECT * INTO _o FROM public.ot_orders WHERE id = _order FOR UPDATE;
  IF _o.id IS NULL OR NOT private.ot_can_stage(auth.uid(), _order) THEN RAISE EXCEPTION 'Bạn không có quyền cập nhật tiến độ đơn này.'; END IF;
  IF NOT _o.has_processing THEN RAISE EXCEPTION 'Đơn chưa bật công đoạn In ấn & Gia công.'; END IF;
  IF _o.status IN ('done','cancelled') THEN RAISE EXCEPTION 'Đơn đã kết thúc.'; END IF;
  IF _qty IS NULL OR _qty <= 0 THEN RAISE EXCEPTION 'Vui lòng nhập số lượng gia công lớn hơn 0.'; END IF;
  INSERT INTO public.ot_tasks(order_id, kind, position, supplier_id, assignee_id, qty, proc_type, mail_due, send_planned, planned_arrival, note)
  VALUES (_order, 'proc', 30, nullif(_data->>'supplier_id','')::uuid, coalesce(nullif(_data->>'assignee_id','')::uuid, _o.supply_id), _qty,
    coalesce(nullif(_data->>'proc_type',''),'print'), nullif(_data->>'mail_due','')::date, nullif(_data->>'send_planned','')::date,
    nullif(_data->>'planned_arrival','')::date, nullif(_data->>'note',''))
  RETURNING id INTO _tid;
  PERFORM private.ot_log(_order, _tid, 'proc_add', NULL, _data);
  RETURN _tid;
END $$;

CREATE OR REPLACE FUNCTION public.ot_task_update(_task uuid, _data jsonb) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _t public.ot_tasks; _uid uuid := auth.uid(); _stage boolean; _own boolean; _k text; _allowed text[]; _got numeric;
BEGIN
  SELECT * INTO _t FROM public.ot_tasks WHERE id = _task FOR UPDATE;
  IF _t.id IS NULL OR NOT private.ot_can_view(_uid, _t.order_id) THEN RAISE EXCEPTION 'Không tìm thấy công việc.'; END IF;
  _stage := private.ot_can_stage(_uid, _t.order_id);
  _own := _t.assignee_id = _uid AND private.sig_can(_uid,'ot.task_update');
  IF NOT (_stage OR _own) THEN RAISE EXCEPTION 'Bạn không có quyền cập nhật công việc này.'; END IF;
  _allowed := CASE WHEN _stage THEN ARRAY['supplier_id','assignee_id','qty','proc_type','planned_date','planned_arrival','mail_due','send_planned','note','status']
                   ELSE ARRAY['supplier_id','planned_arrival','note','status'] END;
  FOR _k IN SELECT jsonb_object_keys(_data) LOOP
    IF NOT _k = ANY(_allowed) THEN RAISE EXCEPTION 'Bạn không được sửa trường %.', _k; END IF;
  END LOOP;
  IF _data ? 'assignee_id' AND NOT (private.sig_can(_uid,'ot.assign') OR private.sig_can(_uid,'ot.manage')) THEN
    RAISE EXCEPTION 'Bạn không có quyền phân công người phụ trách.'; END IF;
  IF _data ? 'status' AND _data->>'status' NOT IN ('todo','doing','waiting') THEN
    RAISE EXCEPTION 'Hoàn thành công việc bằng nút xác nhận tương ứng.'; END IF;
  IF _t.status IN ('done','skipped') AND _data ? 'status' THEN RAISE EXCEPTION 'Công việc đã hoàn thành hoặc bỏ qua.'; END IF;
  IF _data ? 'qty' THEN
    IF nullif(_data->>'qty','')::numeric IS NULL OR (_data->>'qty')::numeric <= 0 THEN RAISE EXCEPTION 'Số lượng phải lớn hơn 0.'; END IF;
    _got := private.ot_received(_task);
    IF (_data->>'qty')::numeric < greatest(_got, _t.sent_qty) THEN RAISE EXCEPTION 'Số lượng không được nhỏ hơn số đã nhận/đã gửi (%).', greatest(_got,_t.sent_qty); END IF;
  END IF;
  UPDATE public.ot_tasks SET
    supplier_id = CASE WHEN _data ? 'supplier_id' THEN nullif(_data->>'supplier_id','')::uuid ELSE supplier_id END,
    assignee_id = CASE WHEN _data ? 'assignee_id' THEN nullif(_data->>'assignee_id','')::uuid ELSE assignee_id END,
    qty = CASE WHEN _data ? 'qty' THEN (_data->>'qty')::numeric ELSE qty END,
    proc_type = CASE WHEN _data ? 'proc_type' THEN _data->>'proc_type' ELSE proc_type END,
    planned_date = CASE WHEN _data ? 'planned_date' THEN nullif(_data->>'planned_date','')::date ELSE planned_date END,
    planned_arrival = CASE WHEN _data ? 'planned_arrival' THEN nullif(_data->>'planned_arrival','')::date ELSE planned_arrival END,
    mail_due = CASE WHEN _data ? 'mail_due' THEN nullif(_data->>'mail_due','')::date ELSE mail_due END,
    send_planned = CASE WHEN _data ? 'send_planned' THEN nullif(_data->>'send_planned','')::date ELSE send_planned END,
    note = CASE WHEN _data ? 'note' THEN nullif(_data->>'note','') ELSE note END,
    status = CASE WHEN _data ? 'status' THEN _data->>'status' ELSE status END,
    updated_at = now()
  WHERE id = _task;
  IF _data ? 'qty' AND _t.kind IN ('blank','box','proc') THEN
    UPDATE public.ot_tasks SET status = CASE WHEN private.ot_received(id) >= qty THEN 'done' WHEN status = 'done' THEN 'waiting' ELSE status END,
      done_at = CASE WHEN private.ot_received(id) >= qty THEN coalesce(done_at, now()) ELSE NULL END WHERE id = _task;
  END IF;
  PERFORM private.ot_log(_t.order_id, _task, 'task_update',
    (SELECT jsonb_object_agg(k, to_jsonb(_t)->k) FROM jsonb_object_keys(_data) k), _data);
END $$;

CREATE OR REPLACE FUNCTION public.ot_task_action(_task uuid, _action text, _qty numeric DEFAULT NULL) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _t public.ot_tasks; _o public.ot_orders; _uid uuid := auth.uid(); _got numeric; _blank_got numeric; _x record;
BEGIN
  SELECT * INTO _t FROM public.ot_tasks WHERE id = _task;
  IF _t.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy công việc.'; END IF;
  SELECT * INTO _o FROM public.ot_orders WHERE id = _t.order_id FOR UPDATE;
  SELECT * INTO _t FROM public.ot_tasks WHERE id = _task FOR UPDATE;
  IF NOT (private.ot_can_stage(_uid, _o.id) OR (_t.assignee_id = _uid AND private.sig_can(_uid,'ot.task_update') AND private.ot_can_view(_uid,_o.id))) THEN
    RAISE EXCEPTION 'Bạn không có quyền cập nhật công việc này.'; END IF;
  IF _o.status <> 'in_progress' THEN RAISE EXCEPTION 'Đơn chưa tiếp nhận hoặc đã kết thúc.'; END IF;
  IF _t.status = 'skipped' THEN RAISE EXCEPTION 'Công đoạn này đã bỏ qua.'; END IF;
  _got := private.ot_received(_task);

  IF _action = 'ordered' THEN
    IF _t.kind NOT IN ('blank','box') THEN RAISE EXCEPTION 'Thao tác không hợp lệ.'; END IF;
    IF _t.ordered_at IS NOT NULL THEN RAISE EXCEPTION 'Đã xác nhận đặt hàng.'; END IF;
    IF _t.supplier_id IS NULL THEN RAISE EXCEPTION 'Vui lòng chọn nhà cung cấp trước khi xác nhận đã đặt.'; END IF;
    UPDATE public.ot_tasks SET ordered_at = now(), status = 'waiting', updated_at = now() WHERE id = _task;

  ELSIF _action = 'receive' THEN
    IF _t.kind NOT IN ('blank','box','proc') THEN RAISE EXCEPTION 'Thao tác không hợp lệ.'; END IF;
    IF _qty IS NULL OR _qty <= 0 THEN RAISE EXCEPTION 'Số lượng nhận phải lớn hơn 0.'; END IF;
    IF _t.kind IN ('blank','box') AND _t.ordered_at IS NULL THEN RAISE EXCEPTION 'Cần xác nhận đã đặt trước khi ghi nhận hàng về.'; END IF;
    IF _t.kind = 'proc' THEN
      IF _t.mail_sent_at IS NULL THEN RAISE EXCEPTION 'Cần xác nhận đã gửi mail sản xuất cho xưởng này trước.'; END IF;
      IF _got + _qty > _t.sent_qty THEN RAISE EXCEPTION 'Số nhận vượt số phôi đã gửi gia công (đã gửi %, đã nhận %).', _t.sent_qty, _got; END IF;
    END IF;
    IF _got + _qty > _t.qty THEN RAISE EXCEPTION 'Số nhận vượt số lượng đặt (đặt %, đã nhận %).', _t.qty, _got; END IF;
    INSERT INTO public.ot_receipts(task_id, qty, actor_id) VALUES (_task, _qty, _uid);
    UPDATE public.ot_tasks SET status = CASE WHEN _got + _qty >= qty THEN 'done' ELSE 'waiting' END,
      done_at = CASE WHEN _got + _qty >= qty THEN now() ELSE NULL END, updated_at = now() WHERE id = _task;

  ELSIF _action = 'mail_sent' THEN
    IF _t.kind <> 'proc' THEN RAISE EXCEPTION 'Thao tác không hợp lệ.'; END IF;
    IF _t.mail_sent_at IS NOT NULL THEN RAISE EXCEPTION 'Đã xác nhận gửi mail sản xuất.'; END IF;
    IF _t.supplier_id IS NULL THEN RAISE EXCEPTION 'Vui lòng chọn xưởng gia công trước.'; END IF;
    UPDATE public.ot_tasks SET mail_sent_at = now(), mail_by = _uid, status = CASE WHEN status = 'todo' THEN 'doing' ELSE status END, updated_at = now() WHERE id = _task;

  ELSIF _action = 'sent' THEN
    IF _t.kind <> 'proc' THEN RAISE EXCEPTION 'Thao tác không hợp lệ.'; END IF;
    IF _t.mail_sent_at IS NULL THEN RAISE EXCEPTION 'Cần xác nhận đã gửi mail sản xuất cho xưởng này trước khi gửi phôi.'; END IF;
    IF _qty IS NULL OR _qty <= 0 THEN RAISE EXCEPTION 'Số lượng gửi phải lớn hơn 0.'; END IF;
    IF _t.sent_qty + _qty > _t.qty THEN RAISE EXCEPTION 'Số gửi vượt số lượng của lượt gia công (%).', _t.qty; END IF;
    SELECT coalesce(sum(r.qty),0) INTO _blank_got FROM public.ot_receipts r JOIN public.ot_tasks b ON b.id = r.task_id WHERE b.order_id = _o.id AND b.kind = 'blank';
    IF _t.sent_qty + _qty > _blank_got THEN RAISE EXCEPTION 'Chưa đủ phôi: phôi đã về %, lượt này đã gửi %.', _blank_got, _t.sent_qty; END IF;
    UPDATE public.ot_tasks SET sent_qty = sent_qty + _qty, sent_at = coalesce(sent_at, now()), status = 'waiting', updated_at = now() WHERE id = _task;

  ELSIF _action = 'pack_done' THEN
    IF _t.kind <> 'packing' THEN RAISE EXCEPTION 'Thao tác không hợp lệ.'; END IF;
    FOR _x IN SELECT kind, qty, private.ot_received(id) AS got FROM public.ot_tasks WHERE order_id = _o.id AND kind IN ('blank','box','proc') AND status <> 'skipped' LOOP
      IF _x.qty IS NULL OR _x.got < _x.qty THEN
        RAISE EXCEPTION '%', CASE _x.kind WHEN 'blank' THEN 'Phôi chưa về đủ, chưa thể đóng gói.' WHEN 'box' THEN 'Hộp chưa về đủ, chưa thể đóng gói.' ELSE 'Hàng gia công chưa nhận đủ, chưa thể đóng gói.' END;
      END IF;
    END LOOP;
    UPDATE public.ot_tasks SET status = 'done', done_at = now(), updated_at = now() WHERE id = _task;

  ELSIF _action = 'shipped' THEN
    IF _t.kind <> 'delivery' THEN RAISE EXCEPTION 'Thao tác không hợp lệ.'; END IF;
    IF EXISTS (SELECT 1 FROM public.ot_tasks WHERE order_id = _o.id AND kind = 'packing' AND status <> 'done') THEN RAISE EXCEPTION 'Cần hoàn thành đóng gói trước khi xuất hàng.'; END IF;
    IF _t.shipped_at IS NOT NULL THEN RAISE EXCEPTION 'Đã xác nhận xuất hàng.'; END IF;
    UPDATE public.ot_tasks SET shipped_at = now(), status = 'waiting', updated_at = now() WHERE id = _task;

  ELSIF _action = 'delivered' THEN
    IF _t.kind <> 'delivery' THEN RAISE EXCEPTION 'Thao tác không hợp lệ.'; END IF;
    IF _t.shipped_at IS NULL THEN RAISE EXCEPTION 'Cần xác nhận xuất hàng trước.'; END IF;
    UPDATE public.ot_tasks SET status = 'done', done_at = now(), updated_at = now() WHERE id = _task;
    UPDATE public.ot_orders SET status = 'done', completed_at = now(), updated_at = now() WHERE id = _o.id;
  ELSE
    RAISE EXCEPTION 'Thao tác không hợp lệ.';
  END IF;
  PERFORM private.ot_log(_o.id, _task, _action, NULL, CASE WHEN _qty IS NOT NULL THEN jsonb_build_object('qty', _qty) END);
END $$;

CREATE OR REPLACE FUNCTION public.ot_fix_time(_task uuid, _field text, _value timestamptz, _reason text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _t public.ot_tasks; _old timestamptz;
BEGIN
  SELECT * INTO _t FROM public.ot_tasks WHERE id = _task FOR UPDATE;
  IF _t.id IS NULL OR NOT private.ot_can_stage(auth.uid(), _t.order_id) THEN RAISE EXCEPTION 'Bạn không có quyền điều chỉnh thời gian thực tế.'; END IF;
  IF length(trim(coalesce(_reason,''))) < 3 THEN RAISE EXCEPTION 'Vui lòng nhập lý do điều chỉnh.'; END IF;
  IF _value IS NULL OR _value > now() THEN RAISE EXCEPTION 'Thời gian thực tế không hợp lệ.'; END IF;
  IF _field NOT IN ('ordered_at','mail_sent_at','sent_at','shipped_at','done_at') THEN RAISE EXCEPTION 'Trường không hợp lệ.'; END IF;
  _old := (to_jsonb(_t)->>_field)::timestamptz;
  IF _old IS NULL THEN RAISE EXCEPTION 'Mốc này chưa được xác nhận.'; END IF;
  EXECUTE format('UPDATE public.ot_tasks SET %I = $1, updated_at = now() WHERE id = $2', _field) USING _value, _task;
  PERFORM private.ot_log(_t.order_id, _task, 'fix_time', jsonb_build_object(_field, _old), jsonb_build_object(_field, _value), trim(_reason));
END $$;

CREATE OR REPLACE FUNCTION public.ot_cancel(_id uuid, _reason text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT private.sig_can(auth.uid(),'ot.manage') THEN RAISE EXCEPTION 'Bạn không có quyền quản lý đơn hàng.'; END IF;
  IF length(trim(coalesce(_reason,''))) < 3 THEN RAISE EXCEPTION 'Vui lòng nhập lý do hủy.'; END IF;
  UPDATE public.ot_orders SET status = 'cancelled', updated_at = now() WHERE id = _id AND status IN ('new','in_progress');
  IF NOT FOUND THEN RAISE EXCEPTION 'Không thể hủy đơn này.'; END IF;
  PERFORM private.ot_log(_id, NULL, 'cancel', NULL, NULL, trim(_reason));
END $$;

CREATE OR REPLACE FUNCTION public.ot_people() RETURNS TABLE(id uuid, full_name text, sale boolean, supply boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.full_name,
    private.sig_can(p.id,'ot.view_own') OR private.sig_can(p.id,'ot.create'),
    private.sig_can(p.id,'ot.stage_update') OR private.sig_can(p.id,'ot.task_update') OR private.sig_can(p.id,'ot.accept')
  FROM public.profiles p
  WHERE private.ot_any(auth.uid()) AND p.status = 'Đang hoạt động'
  ORDER BY p.full_name;
$$;

REVOKE ALL ON FUNCTION public.ot_settings_save(boolean), public.ot_supplier_save(uuid,jsonb), public.ot_supplier_active(uuid,boolean),
  public.ot_create(jsonb), public.ot_accept(uuid), public.ot_update_order(uuid,jsonb), public.ot_plan(uuid,boolean,boolean,numeric),
  public.ot_proc_add(uuid,jsonb), public.ot_task_update(uuid,jsonb), public.ot_task_action(uuid,text,numeric),
  public.ot_fix_time(uuid,text,timestamptz,text), public.ot_cancel(uuid,text), public.ot_people() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ot_settings_save(boolean), public.ot_supplier_save(uuid,jsonb), public.ot_supplier_active(uuid,boolean),
  public.ot_create(jsonb), public.ot_accept(uuid), public.ot_update_order(uuid,jsonb), public.ot_plan(uuid,boolean,boolean,numeric),
  public.ot_proc_add(uuid,jsonb), public.ot_task_update(uuid,jsonb), public.ot_task_action(uuid,text,numeric),
  public.ot_fix_time(uuid,text,timestamptz,text), public.ot_cancel(uuid,text), public.ot_people() TO authenticated;
