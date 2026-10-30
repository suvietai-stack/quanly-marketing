-- Module Quản trị Kinh doanh — nền tảng: phòng ban, thành viên, chỉ số KR, cấu hình deadline.
-- Độc lập với các module hiện có; ghi chỉ qua RPC SECURITY DEFINER kiểm tra quyền biz.*.

CREATE TABLE public.biz_departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.biz_departments TO authenticated;
GRANT ALL ON public.biz_departments TO service_role;
ALTER TABLE public.biz_departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read biz departments" ON public.biz_departments FOR SELECT TO authenticated USING (true);

-- Thành viên phòng ban, giữ lịch sử chuyển phòng qua effective_from/effective_to.
CREATE TABLE public.biz_department_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid NOT NULL REFERENCES public.biz_departments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_manager boolean NOT NULL DEFAULT false,
  effective_from date NOT NULL DEFAULT CURRENT_DATE,
  effective_to date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (department_id, user_id, effective_from)
);
GRANT SELECT ON public.biz_department_members TO authenticated;
GRANT ALL ON public.biz_department_members TO service_role;
ALTER TABLE public.biz_department_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read biz members" ON public.biz_department_members FOR SELECT TO authenticated USING (true);

-- Chỉ số KR theo phòng: không hardcode vào logic; ngừng áp dụng thay vì xóa.
CREATE TABLE public.biz_kr_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid NOT NULL REFERENCES public.biz_departments(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  unit text NOT NULL,
  value_kind text NOT NULL DEFAULT 'count' CHECK (value_kind IN ('money','count')),
  aggregation text NOT NULL DEFAULT 'sum' CHECK (aggregation IN ('sum','avg','ratio')),
  direction text NOT NULL DEFAULT 'higher' CHECK (direction IN ('higher','lower')),
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  effective_from date NOT NULL DEFAULT CURRENT_DATE,
  effective_to date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (department_id, name)
);
GRANT SELECT ON public.biz_kr_metrics TO authenticated;
GRANT ALL ON public.biz_kr_metrics TO service_role;
ALTER TABLE public.biz_kr_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read biz kr metrics" ON public.biz_kr_metrics FOR SELECT TO authenticated USING (true);

-- Cấu hình deadline nộp kế hoạch / báo cáo / mục tiêu (jsonb theo loại kỳ).
CREATE TABLE public.biz_deadline_config (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid REFERENCES public.profiles(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.biz_deadline_config TO authenticated;
GRANT ALL ON public.biz_deadline_config TO service_role;
ALTER TABLE public.biz_deadline_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read biz deadline config" ON public.biz_deadline_config FOR SELECT TO authenticated USING (true);

-- ===== RPC ghi dữ liệu (SECURITY DEFINER, kiểm tra quyền biz.*) =====

CREATE OR REPLACE FUNCTION public.biz_dept_save(_id uuid, _name text, _description text, _active boolean, _sort_order int)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid;
BEGIN
  IF NOT private.sig_can(auth.uid(), 'biz.dept_manage') THEN RAISE EXCEPTION 'Bạn không có quyền quản lý phòng ban kinh doanh.'; END IF;
  IF btrim(coalesce(_name,'')) = '' THEN RAISE EXCEPTION 'Tên phòng ban không được để trống.'; END IF;
  IF _id IS NULL THEN
    INSERT INTO public.biz_departments(name, description, active, sort_order)
    VALUES (btrim(_name), nullif(btrim(coalesce(_description,'')),''), coalesce(_active,true), coalesce(_sort_order,0))
    RETURNING id INTO v_id;
  ELSE
    UPDATE public.biz_departments
    SET name = btrim(_name), description = nullif(btrim(coalesce(_description,'')),''), active = coalesce(_active,true), sort_order = coalesce(_sort_order,0), updated_at = now()
    WHERE id = _id RETURNING id INTO v_id;
    IF v_id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy phòng ban.'; END IF;
  END IF;
  RETURN v_id;
END $$;

-- Thêm/cập nhật thành viên phòng; chuyển phòng = kết thúc membership cũ + tạo membership mới (giữ lịch sử).
CREATE OR REPLACE FUNCTION public.biz_member_save(_department_id uuid, _user_id uuid, _is_manager boolean)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid;
BEGIN
  IF NOT private.sig_can(auth.uid(), 'biz.dept_manage') THEN RAISE EXCEPTION 'Bạn không có quyền quản lý phòng ban kinh doanh.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.biz_departments d WHERE d.id = _department_id AND d.active) THEN RAISE EXCEPTION 'Phòng ban không tồn tại hoặc đã ngừng.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = _user_id) THEN RAISE EXCEPTION 'Không tìm thấy nhân viên.'; END IF;
  -- Kết thúc mọi membership đang hiệu lực ở phòng khác (một người một phòng tại một thời điểm).
  UPDATE public.biz_department_members SET effective_to = CURRENT_DATE - 1
  WHERE user_id = _user_id AND effective_to IS NULL AND department_id <> _department_id;
  SELECT id INTO v_id FROM public.biz_department_members
  WHERE user_id = _user_id AND department_id = _department_id AND effective_to IS NULL;
  IF v_id IS NULL THEN
    INSERT INTO public.biz_department_members(department_id, user_id, is_manager)
    VALUES (_department_id, _user_id, coalesce(_is_manager,false)) RETURNING id INTO v_id;
  ELSE
    UPDATE public.biz_department_members SET is_manager = coalesce(_is_manager,false) WHERE id = v_id;
  END IF;
  RETURN v_id;
END $$;

-- Kết thúc membership (rời phòng), giữ lịch sử.
CREATE OR REPLACE FUNCTION public.biz_member_end(_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT private.sig_can(auth.uid(), 'biz.dept_manage') THEN RAISE EXCEPTION 'Bạn không có quyền quản lý phòng ban kinh doanh.'; END IF;
  UPDATE public.biz_department_members SET effective_to = CURRENT_DATE - 1 WHERE id = _id AND effective_to IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy thành viên đang hiệu lực.'; END IF;
END $$;

-- Lưu chỉ số KR: sửa cấu hình không được làm sai lệch kỳ đã duyệt — chỉ đổi tên/mô tả/đơn vị/thứ tự/trạng thái;
-- đổi cách tổng hợp hoặc chiều đánh giá chỉ khi chưa có dữ liệu mục tiêu/kết quả (kiểm tra bổ sung ở bước 2).
CREATE OR REPLACE FUNCTION public.biz_kr_save(_id uuid, _department_id uuid, _name text, _description text, _unit text,
  _value_kind text, _aggregation text, _direction text, _sort_order int, _active boolean)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid;
BEGIN
  IF NOT private.sig_can(auth.uid(), 'biz.kr_manage') THEN RAISE EXCEPTION 'Bạn không có quyền quản lý chỉ số KR.'; END IF;
  IF btrim(coalesce(_name,'')) = '' THEN RAISE EXCEPTION 'Tên chỉ số không được để trống.'; END IF;
  IF btrim(coalesce(_unit,'')) = '' THEN RAISE EXCEPTION 'Đơn vị không được để trống.'; END IF;
  IF coalesce(_value_kind,'count') NOT IN ('money','count') THEN RAISE EXCEPTION 'Kiểu giá trị không hợp lệ.'; END IF;
  IF coalesce(_aggregation,'sum') NOT IN ('sum','avg','ratio') THEN RAISE EXCEPTION 'Cách tổng hợp không hợp lệ.'; END IF;
  IF coalesce(_direction,'higher') NOT IN ('higher','lower') THEN RAISE EXCEPTION 'Chiều đánh giá không hợp lệ.'; END IF;
  IF _id IS NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.biz_departments d WHERE d.id = _department_id AND d.active) THEN RAISE EXCEPTION 'Phòng ban không tồn tại hoặc đã ngừng.'; END IF;
    INSERT INTO public.biz_kr_metrics(department_id, name, description, unit, value_kind, aggregation, direction, sort_order, active)
    VALUES (_department_id, btrim(_name), nullif(btrim(coalesce(_description,'')),''), btrim(_unit), _value_kind, _aggregation, _direction, coalesce(_sort_order,0), coalesce(_active,true))
    RETURNING id INTO v_id;
  ELSE
    UPDATE public.biz_kr_metrics
    SET name = btrim(_name), description = nullif(btrim(coalesce(_description,'')),''), unit = btrim(_unit),
        value_kind = _value_kind, aggregation = _aggregation, direction = _direction,
        sort_order = coalesce(_sort_order,0), active = coalesce(_active,true), updated_at = now()
    WHERE id = _id RETURNING id INTO v_id;
    IF v_id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy chỉ số KR.'; END IF;
  END IF;
  RETURN v_id;
END $$;

-- Lưu cấu hình deadline (jsonb theo loại: plan_month/plan_quarter/plan_year/report_month/report_quarter/report_year/goal_year).
CREATE OR REPLACE FUNCTION public.biz_deadline_save(_data jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT private.sig_can(auth.uid(), 'biz.deadline_manage') THEN RAISE EXCEPTION 'Bạn không có quyền quản lý deadline.'; END IF;
  IF jsonb_typeof(_data) <> 'object' THEN RAISE EXCEPTION 'Cấu hình không hợp lệ.'; END IF;
  INSERT INTO public.biz_deadline_config(id, data, updated_by, updated_at) VALUES (true, _data, auth.uid(), now())
  ON CONFLICT (id) DO UPDATE SET data = excluded.data, updated_by = excluded.updated_by, updated_at = now();
END $$;

-- Cấp quyền mặc định: Admin toàn bộ biz.*; Viewer/Ban Giám Đốc xem dashboard toàn bộ.
UPDATE public.app_roles
SET permissions = (SELECT array_agg(DISTINCT x) FROM unnest(permissions || ARRAY[
  'biz.view_own','biz.view_dept','biz.view_all','biz.plan_submit','biz.goal_submit','biz.report_submit',
  'biz.plan_approve','biz.goal_approve','biz.report_approve','biz.kr_manage','biz.dept_manage','biz.deadline_manage'
]) x), updated_at = now()
WHERE id = 'role-admin';

UPDATE public.app_roles
SET permissions = (SELECT array_agg(DISTINCT x) FROM unnest(permissions || ARRAY['biz.view_all']) x), updated_at = now()
WHERE id = 'role-viewer';