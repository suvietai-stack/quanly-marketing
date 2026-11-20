-- Xóa hồ sơ CRM chưa phát sinh lịch sử nghiệp vụ; dữ liệu đã có nghiệp vụ chỉ cho phép lưu trữ.
-- Chỉ Super Admin được mặc định; có thể cấp crm.customer.delete sau này qua Role.
BEGIN;
INSERT INTO public.base_permission_catalog (key,label,module,dependencies)
VALUES ('crm.customer.delete','Xóa hồ sơ khách hàng CRM chưa phát sinh nghiệp vụ','CRM Khách Hàng',ARRAY[]::text[])
ON CONFLICT (key) DO UPDATE SET label=EXCLUDED.label,module=EXCLUDED.module,dependencies=EXCLUDED.dependencies;

CREATE TABLE IF NOT EXISTS public.crm_customer_delete_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  customer_code text NOT NULL,
  customer_name text NOT NULL,
  deleted_by uuid NOT NULL,
  reason text NOT NULL,
  deleted_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.crm_customer_delete_audit FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.crm_customer_delete(_id uuid,_revision integer,_reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,private AS $fn$
DECLARE _uid uuid := auth.uid(); _customer public.crm_customers%ROWTYPE;
BEGIN
  IF NOT private.sig_can(_uid,'crm.customer.delete') THEN
    RAISE EXCEPTION 'Bạn không có quyền xóa khách hàng.' USING ERRCODE='42501';
  END IF;
  IF length(btrim(coalesce(_reason,''))) < 5 THEN
    RAISE EXCEPTION 'Nhập lý do xóa tối thiểu 5 ký tự.';
  END IF;
  SELECT * INTO _customer FROM public.crm_customers WHERE id=_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy khách hàng.'; END IF;
  IF _customer.revision <> _revision THEN RAISE EXCEPTION 'Hồ sơ đã thay đổi. Vui lòng tải lại.'; END IF;

  IF EXISTS (SELECT 1 FROM public.crm_schedules WHERE customer_id=_id)
    OR EXISTS (SELECT 1 FROM public.crm_interactions WHERE customer_id=_id)
    OR EXISTS (SELECT 1 FROM public.crm_schedule_history WHERE customer_id=_id)
    OR EXISTS (SELECT 1 FROM public.signal_crm_links WHERE customer_id=_id)
  THEN
    RAISE EXCEPTION 'Khách đã có lịch sử chăm sóc hoặc liên kết nghiệp vụ. Vui lòng dùng Lưu trữ để bảo toàn dữ liệu.';
  END IF;

  INSERT INTO public.crm_customer_delete_audit(customer_id,customer_code,customer_name,deleted_by,reason)
  VALUES (_id,_customer.code,_customer.name,_uid,btrim(_reason));

  DELETE FROM public.crm_events WHERE customer_id=_id;
  DELETE FROM public.crm_contacts WHERE customer_id=_id;
  DELETE FROM public.crm_locations WHERE customer_id=_id;
  DELETE FROM public.crm_customers WHERE id=_id;
EXCEPTION
  WHEN foreign_key_violation THEN
    RAISE EXCEPTION 'Hồ sơ còn liên kết dữ liệu khác. Vui lòng dùng Lưu trữ.';
END;
$fn$;
REVOKE ALL ON FUNCTION public.crm_customer_delete(uuid,integer,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.crm_customer_delete(uuid,integer,text) TO authenticated;
NOTIFY pgrst,'reload schema';
COMMIT;
