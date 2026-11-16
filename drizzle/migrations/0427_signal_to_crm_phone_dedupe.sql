-- Manual, one-way registration of an opportunity signal as a CRM customer.
-- Never auto-merge existing CRM customers; phone duplicates return a generic notice.
BEGIN;

CREATE OR REPLACE FUNCTION private.signal_crm_phone_key(_raw text)
RETURNS text LANGUAGE plpgsql IMMUTABLE SET search_path TO 'public' AS $fn$
DECLARE digits text := regexp_replace(coalesce(_raw,''), '[^0-9]', '', 'g');
BEGIN
  IF length(digits) = 11 AND left(digits,2) = '84' THEN
    RETURN '0' || substring(digits FROM 3);
  ELSIF length(digits) = 13 AND left(digits,4) = '0084' THEN
    RETURN '0' || substring(digits FROM 5);
  END IF;
  RETURN digits;
END
$fn$;

CREATE TABLE IF NOT EXISTS public.signal_crm_links (
  signal_id uuid PRIMARY KEY REFERENCES public.opportunity_signals(id) ON DELETE RESTRICT,
  customer_id uuid NOT NULL REFERENCES public.crm_customers(id) ON DELETE RESTRICT,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS signal_crm_links_customer_idx ON public.signal_crm_links(customer_id);
CREATE INDEX IF NOT EXISTS crm_customers_signal_phone_idx
  ON public.crm_customers (private.signal_crm_phone_key(phone));
CREATE INDEX IF NOT EXISTS crm_contacts_signal_phone_idx
  ON public.crm_contacts (private.signal_crm_phone_key(phone));

ALTER TABLE public.signal_crm_links ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.signal_crm_links FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.signal_crm_links TO authenticated;

DROP POLICY IF EXISTS signal_crm_links_read ON public.signal_crm_links;
CREATE POLICY signal_crm_links_read ON public.signal_crm_links
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.opportunity_signals s WHERE s.id = signal_id)
    OR public.crm_customer_visible(customer_id)
  );

CREATE OR REPLACE FUNCTION public.signal_crm_register(_signal_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','private' AS $fn$
DECLARE
  sig public.opportunity_signals%ROWTYPE;
  cid uuid;
  phone_key text;
  description text;
BEGIN
  IF auth.uid() IS NULL OR NOT private.is_active(auth.uid()) THEN
    RAISE EXCEPTION 'Bạn cần đăng nhập để thực hiện.' USING ERRCODE='42501';
  END IF;

  SELECT * INTO sig FROM public.opportunity_signals WHERE id = _signal_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy tín hiệu.'; END IF;

  IF NOT (
    (sig.created_by = auth.uid() AND private.sig_can(auth.uid(),'signal.create'))
    OR (sig.assigned_to = auth.uid() AND private.sig_can(auth.uid(),'signal.sale'))
    OR (private.sig_can(auth.uid(),'signal.manage') AND private.sig_scope_ok(auth.uid(),sig.need_groups))
  ) THEN
    RAISE EXCEPTION 'Bạn không có quyền đưa tín hiệu này vào CRM.' USING ERRCODE='42501';
  END IF;

  IF sig.cancelled_at IS NOT NULL THEN
    RAISE EXCEPTION 'Tín hiệu đã hủy, không thể đưa vào CRM.';
  END IF;
  IF sig.assigned_to IS NULL THEN
    RAISE EXCEPTION 'Cần phân công Sale trước khi đưa khách vào CRM.';
  END IF;
  IF NOT public.crm_can(sig.assigned_to,'biz.crm_use') THEN
    RAISE EXCEPTION 'Sale được giao chưa có quyền CRM. Vui lòng kiểm tra phân quyền.';
  END IF;

  SELECT customer_id INTO cid FROM public.signal_crm_links WHERE signal_id = _signal_id;
  IF cid IS NOT NULL THEN
    RETURN jsonb_build_object('status','linked','customer_id',cid);
  END IF;

  phone_key := private.signal_crm_phone_key(sig.phone);
  IF length(phone_key) < 9 THEN
    RAISE EXCEPTION 'Số điện thoại tín hiệu không hợp lệ để đối chiếu CRM.';
  END IF;

  -- Serialize new CRM registrations for the same normalized phone, even across signals.
  PERFORM pg_advisory_xact_lock(hashtextextended('signal-crm-phone:' || phone_key,0));

  -- A duplicate anywhere in CRM (including secondary contacts and archived records)
  -- is deliberately reported without exposing another employee's customer data.
  IF EXISTS (
    SELECT 1 FROM public.crm_customers c
    WHERE private.signal_crm_phone_key(c.phone) = phone_key
  ) OR EXISTS (
    SELECT 1 FROM public.crm_contacts ct
    WHERE private.signal_crm_phone_key(ct.phone) = phone_key
  ) THEN
    RETURN jsonb_build_object('status','duplicate');
  END IF;

  description := concat_ws(E'\n',
    'Tạo từ Tín hiệu cơ hội',
    'Nguồn tín hiệu: ' || nullif(sig.source,''),
    'Sản phẩm: ' || nullif(array_to_string(sig.products,', '),''),
    'Nhóm nhu cầu: ' || nullif(array_to_string(sig.need_groups,', '),''),
    'Nhu cầu: ' || nullif(sig.need_detail,''),
    'Ghi chú Marketing: ' || nullif(sig.marketing_note,'')
  );

  INSERT INTO public.crm_customers
    (owner_id, created_by, request_key, profile_kind, name, phone, address, note)
  VALUES
    (sig.assigned_to, auth.uid(), gen_random_uuid(), 'organization',
     sig.customer_name, sig.phone, coalesce(sig.address,''), description)
  RETURNING id INTO cid;

  INSERT INTO public.signal_crm_links (signal_id,customer_id,created_by)
  VALUES (_signal_id,cid,auth.uid());

  INSERT INTO public.crm_events(customer_id,actor_id,action,reason,after_data)
  VALUES (cid,auth.uid(),'signal_import','Đưa khách từ Tín hiệu vào CRM',
    jsonb_build_object('signal_id',_signal_id,'phone',sig.phone,'assigned_sale',sig.assigned_to));

  INSERT INTO public.opportunity_signal_events(signal_id,actor_id,kind,detail)
  VALUES (_signal_id,auth.uid(),'crm_import',jsonb_build_object('customer_id',cid));

  RETURN jsonb_build_object('status','created','customer_id',cid);
END
$fn$;

REVOKE ALL ON FUNCTION public.signal_crm_register(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.signal_crm_register(uuid) TO authenticated;
COMMIT;
