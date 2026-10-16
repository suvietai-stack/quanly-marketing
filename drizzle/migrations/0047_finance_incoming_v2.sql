ALTER TABLE public.bank_transactions
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'bank',
  ADD COLUMN IF NOT EXISTS received_date date,
  ADD COLUMN IF NOT EXISTS created_by uuid,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_by uuid,
  ADD COLUMN IF NOT EXISTS cancel_reason text,
  ADD COLUMN IF NOT EXISTS counter_account_name text,
  ADD COLUMN IF NOT EXISTS counter_account_number text,
  ADD COLUMN IF NOT EXISTS counter_bank_name text;
ALTER TABLE public.bank_transactions ADD CONSTRAINT bank_tx_source_chk CHECK (source IN ('bank','cash','other_account'));
ALTER TABLE public.bank_transactions ADD CONSTRAINT bank_tx_manual_provider_chk CHECK ((source = 'bank') = (provider <> 'manual'));
COMMENT ON COLUMN public.bank_transactions.info_reason IS 'Yêu cầu chỉnh sửa của Kế toán khi đang Chờ đối soát (không còn là trạng thái riêng)';
COMMENT ON COLUMN public.bank_transactions.counter_account_name IS 'Casso counterAccountName — chỉ lưu khi Casso cung cấp';
UPDATE public.bank_transactions SET transaction_at = created_at WHERE transaction_at IS NULL;
-- needs_info không còn là trạng thái: đưa về Chờ đối soát, giữ info_reason
UPDATE public.bank_transactions SET status = 'pending_reconciliation' WHERE status = 'needs_info';
CREATE INDEX IF NOT EXISTS bank_tx_src_idx ON public.bank_transactions (source, bank_account_id, status);

CREATE OR REPLACE FUNCTION private.fin_can_see(_uid uuid, _tx uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.bank_transactions t LEFT JOIN public.bank_accounts a ON a.id = t.bank_account_id
    WHERE t.id = _tx AND CASE WHEN t.source = 'bank' THEN
      private.is_admin(_uid) OR private.sig_can(_uid, 'finance.incoming.manage') OR private.sig_can(_uid, 'finance.incoming.reconcile')
      OR (private.sig_can(_uid, 'finance.incoming.view') AND (coalesce(a.share_sale, false) OR t.claimed_by = _uid))
    ELSE
      private.sig_can(_uid, 'finance.incoming.manage')
      OR (private.sig_can(_uid, 'finance.incoming.manual_view') AND (private.sig_can(_uid, 'finance.incoming.view') OR private.sig_can(_uid, 'finance.incoming.reconcile')))
    END);
$$;

DROP POLICY IF EXISTS bank_acc_select ON public.bank_accounts;
DROP POLICY IF EXISTS bank_acc_insert ON public.bank_accounts;
DROP POLICY IF EXISTS bank_acc_update ON public.bank_accounts;
CREATE POLICY bank_acc_select ON public.bank_accounts FOR SELECT TO authenticated USING (private.is_admin(auth.uid()) OR private.sig_can(auth.uid(), 'finance.incoming.bank_config'));
CREATE POLICY bank_acc_insert ON public.bank_accounts FOR INSERT TO authenticated WITH CHECK (private.is_admin(auth.uid()) OR private.sig_can(auth.uid(), 'finance.incoming.bank_config'));
CREATE POLICY bank_acc_update ON public.bank_accounts FOR UPDATE TO authenticated USING (private.is_admin(auth.uid()) OR private.sig_can(auth.uid(), 'finance.incoming.bank_config')) WITH CHECK (private.is_admin(auth.uid()) OR private.sig_can(auth.uid(), 'finance.incoming.bank_config'));

DROP FUNCTION IF EXISTS public.fin_bank_labels();
CREATE FUNCTION public.fin_bank_labels()
RETURNS TABLE(id uuid, label text, bank_name text, last4 text, active boolean) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT a.id, coalesce(nullif(btrim(a.label), ''), a.bank_name || ' · ' || right(a.account_number, 4)), a.bank_name, right(a.account_number, 4), a.active
  FROM public.bank_accounts a
  WHERE private.is_admin(auth.uid()) OR private.sig_can(auth.uid(), 'finance.incoming.manage') OR private.sig_can(auth.uid(), 'finance.incoming.reconcile')
     OR private.sig_can(auth.uid(), 'finance.incoming.bank_config')
     OR (private.sig_can(auth.uid(), 'finance.incoming.view') AND (a.share_sale OR EXISTS (SELECT 1 FROM public.bank_transactions t WHERE t.bank_account_id = a.id AND t.claimed_by = auth.uid())))
  ORDER BY a.active DESC, a.created_at;
$$;
REVOKE ALL ON FUNCTION public.fin_bank_labels() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fin_bank_labels() TO authenticated;

CREATE OR REPLACE FUNCTION public.fin_gmf_can_manage()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, private AS $$
  SELECT COALESCE(private.sig_can(auth.uid(), 'finance.incoming.gmf_config') OR private.sig_can(auth.uid(), 'finance.incoming.manage'), false);
$$;

CREATE OR REPLACE FUNCTION private.fin_snap(t public.bank_transactions)
RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
  SELECT jsonb_build_object('status', t.status, 'customer', t.customer, 'money_type', t.money_type, 'ref_code', t.ref_code, 'note', t.note, 'claimed_by', t.claimed_by, 'info_reason', t.info_reason,
    'amount', t.amount, 'source', t.source, 'received_date', t.received_date, 'cancelled', t.cancelled_at IS NOT NULL);
$$;

CREATE OR REPLACE FUNCTION public.fin_claim(_tx uuid, _customer text, _type text, _ref text, _note text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t public.bank_transactions; me uuid := auth.uid(); n int;
BEGIN
  IF NOT private.sig_can(me, 'finance.incoming.claim') THEN RAISE EXCEPTION 'Bạn không có quyền xác nhận giao dịch'; END IF;
  PERFORM private.fin_check(_customer, _type, _note);
  SELECT * INTO t FROM public.bank_transactions WHERE id = _tx FOR UPDATE;
  IF NOT FOUND OR NOT private.fin_can_see(me, _tx) THEN RAISE EXCEPTION 'Không tìm thấy giao dịch'; END IF;
  IF t.source <> 'bank' OR t.cancelled_at IS NOT NULL THEN RAISE EXCEPTION 'Giao dịch này không cần Sale xác nhận'; END IF;
  IF t.status = 'unclaimed' AND t.claimed_by IS NULL THEN
    UPDATE public.bank_transactions SET customer = btrim(_customer), money_type = _type, ref_code = nullif(btrim(coalesce(_ref,'')),''), note = btrim(_note),
      claimed_by = me, claimed_at = now(), status = 'pending_reconciliation', info_reason = NULL WHERE id = _tx AND claimed_by IS NULL;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n = 0 THEN RAISE EXCEPTION 'Giao dịch đã được người khác nhận'; END IF;
    INSERT INTO public.bank_transaction_events(tx_id, actor_id, action, before, after) SELECT _tx, me, 'claim', private.fin_snap(t), private.fin_snap(x) FROM public.bank_transactions x WHERE x.id = _tx;
  ELSIF t.claimed_by = me AND t.status = 'pending_reconciliation' THEN
    UPDATE public.bank_transactions SET customer = btrim(_customer), money_type = _type, ref_code = nullif(btrim(coalesce(_ref,'')),''), note = btrim(_note), info_reason = NULL WHERE id = _tx;
    INSERT INTO public.bank_transaction_events(tx_id, actor_id, action, before, after) SELECT _tx, me, CASE WHEN t.info_reason IS NOT NULL THEN 'resubmit' ELSE 'edit' END, private.fin_snap(t), private.fin_snap(x) FROM public.bank_transactions x WHERE x.id = _tx;
  ELSIF t.claimed_by IS NOT NULL AND t.claimed_by <> me THEN
    RAISE EXCEPTION 'Giao dịch đã được người khác nhận';
  ELSE
    RAISE EXCEPTION 'Giao dịch đã đối soát, không thể sửa';
  END IF;
  PERFORM private.fin_notify_acct(_tx, 'fin_pending', 'fin_pending:' || _tx || ':' || extract(epoch from now())::bigint);
END $$;

CREATE OR REPLACE FUNCTION public.fin_request_info(_tx uuid, _reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t public.bank_transactions; me uuid := auth.uid();
BEGIN
  IF NOT private.sig_can(me, 'finance.incoming.reconcile') THEN RAISE EXCEPTION 'Bạn không có quyền đối soát'; END IF;
  IF coalesce(btrim(_reason),'') = '' THEN RAISE EXCEPTION 'Vui lòng nhập nội dung yêu cầu'; END IF;
  SELECT * INTO t FROM public.bank_transactions WHERE id = _tx FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy giao dịch'; END IF;
  IF t.status <> 'pending_reconciliation' OR t.claimed_by IS NULL OR t.cancelled_at IS NOT NULL THEN RAISE EXCEPTION 'Chỉ yêu cầu chỉnh sửa khi giao dịch đang chờ đối soát'; END IF;
  UPDATE public.bank_transactions SET info_reason = btrim(_reason) WHERE id = _tx;
  INSERT INTO public.bank_transaction_events(tx_id, actor_id, action, before, after, reason) SELECT _tx, me, 'request_info', private.fin_snap(t), private.fin_snap(x), btrim(_reason) FROM public.bank_transactions x WHERE x.id = _tx;
  INSERT INTO public.notifications(recipient_id, kind, bank_tx_id, dedup_key, payload, zalo_status, push_status)
  VALUES (t.claimed_by, 'fin_needs_info', _tx, 'fin_needs_info:' || _tx || ':' || extract(epoch from now())::bigint, '{}'::jsonb, 'ineligible', 'none')
  ON CONFLICT (dedup_key) DO NOTHING;
END $$;

CREATE OR REPLACE FUNCTION public.fin_reconcile(_tx uuid, _customer text DEFAULT NULL, _type text DEFAULT NULL, _ref text DEFAULT NULL, _note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t public.bank_transactions; me uuid := auth.uid();
BEGIN
  IF NOT private.sig_can(me, 'finance.incoming.reconcile') THEN RAISE EXCEPTION 'Bạn không có quyền đối soát'; END IF;
  SELECT * INTO t FROM public.bank_transactions WHERE id = _tx FOR UPDATE;
  IF NOT FOUND OR NOT private.fin_can_see(me, _tx) THEN RAISE EXCEPTION 'Không tìm thấy giao dịch'; END IF;
  IF t.cancelled_at IS NOT NULL THEN RAISE EXCEPTION 'Khoản tiền đã hủy'; END IF;
  IF t.status = 'reconciled' THEN RAISE EXCEPTION 'Giao dịch đã được đối soát'; END IF;
  IF _customer IS NOT NULL OR (t.claimed_by IS NULL AND t.source = 'bank') THEN
    PERFORM private.fin_check(_customer, _type, _note);
    UPDATE public.bank_transactions SET customer = btrim(_customer), money_type = _type, ref_code = nullif(btrim(coalesce(_ref,'')),''), note = btrim(_note) WHERE id = _tx;
  END IF;
  UPDATE public.bank_transactions SET status = 'reconciled', reconciled_by = me, reconciled_at = now(), info_reason = NULL WHERE id = _tx;
  INSERT INTO public.bank_transaction_events(tx_id, actor_id, action, before, after) SELECT _tx, me, 'reconcile', private.fin_snap(t), private.fin_snap(x) FROM public.bank_transactions x WHERE x.id = _tx;
END $$;

CREATE OR REPLACE FUNCTION public.fin_reset(_tx uuid, _reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t public.bank_transactions; me uuid := auth.uid();
BEGIN
  IF NOT (private.sig_can(me, 'finance.incoming.manage') OR private.sig_can(me, 'finance.incoming.reconcile')) THEN RAISE EXCEPTION 'Bạn không có quyền điều chỉnh'; END IF;
  IF coalesce(btrim(_reason),'') = '' THEN RAISE EXCEPTION 'Vui lòng nhập lý do'; END IF;
  SELECT * INTO t FROM public.bank_transactions WHERE id = _tx FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy giao dịch'; END IF;
  IF t.source <> 'bank' THEN RAISE EXCEPTION 'Khoản thủ công dùng chức năng sửa/hủy khoản thủ công'; END IF;
  IF t.status = 'reconciled' AND NOT private.sig_can(me, 'finance.incoming.manage') THEN RAISE EXCEPTION 'Chỉ người quản lý được mở lại giao dịch đã đối soát'; END IF;
  UPDATE public.bank_transactions SET status = 'unclaimed', claimed_by = NULL, claimed_at = NULL, reconciled_by = NULL, reconciled_at = NULL, info_reason = NULL WHERE id = _tx;
  INSERT INTO public.bank_transaction_events(tx_id, actor_id, action, before, after, reason) SELECT _tx, me, 'reset', private.fin_snap(t), private.fin_snap(x), btrim(_reason) FROM public.bank_transactions x WHERE x.id = _tx;
END $$;

CREATE OR REPLACE FUNCTION private.fin_manual_check(_source text, _amount bigint, _date date, _note text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF _source IS NULL OR _source NOT IN ('cash','other_account') THEN RAISE EXCEPTION 'Vui lòng chọn Nguồn tiền'; END IF;
  IF _amount IS NULL OR _amount <= 0 THEN RAISE EXCEPTION 'Số tiền phải lớn hơn 0'; END IF;
  IF _date IS NULL THEN RAISE EXCEPTION 'Vui lòng chọn Ngày nhận tiền'; END IF;
  IF _date > (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date THEN RAISE EXCEPTION 'Ngày nhận tiền không được ở tương lai'; END IF;
  IF coalesce(btrim(_note),'') = '' THEN RAISE EXCEPTION 'Vui lòng nhập Ghi chú'; END IF;
  IF length(_note) > 2000 THEN RAISE EXCEPTION 'Ghi chú quá dài'; END IF;
END $$;

CREATE OR REPLACE FUNCTION public.fin_manual_create(_source text, _amount bigint, _date date, _note text, _reconcile boolean DEFAULT false)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me uuid := auth.uid(); nid uuid := gen_random_uuid();
BEGIN
  IF NOT private.sig_can(me, 'finance.incoming.manual_create') THEN RAISE EXCEPTION 'Bạn không có quyền thêm khoản tiền thủ công'; END IF;
  IF _reconcile AND NOT private.sig_can(me, 'finance.incoming.reconcile') THEN RAISE EXCEPTION 'Bạn không có quyền đối soát'; END IF;
  PERFORM private.fin_manual_check(_source, _amount, _date, _note);
  INSERT INTO public.bank_transactions(id, provider, provider_transaction_id, source, amount, received_date, transaction_at, note, created_by, status, reconciled_by, reconciled_at, gmf_status)
  VALUES (nid, 'manual', 'manual:' || nid, _source, _amount, _date,
    (_date + (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::time) AT TIME ZONE 'Asia/Ho_Chi_Minh', btrim(_note), me,
    CASE WHEN _reconcile THEN 'reconciled' ELSE 'pending_reconciliation' END,
    CASE WHEN _reconcile THEN me END, CASE WHEN _reconcile THEN now() END, 'skipped');
  INSERT INTO public.bank_transaction_events(tx_id, actor_id, action, after) SELECT nid, me, 'manual_create', private.fin_snap(x) FROM public.bank_transactions x WHERE x.id = nid;
  IF _reconcile THEN INSERT INTO public.bank_transaction_events(tx_id, actor_id, action) VALUES (nid, me, 'reconcile'); END IF;
  RETURN nid;
END $$;

CREATE OR REPLACE FUNCTION public.fin_manual_update(_tx uuid, _source text, _amount bigint, _date date, _note text, _reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t public.bank_transactions; me uuid := auth.uid();
BEGIN
  IF NOT private.sig_can(me, 'finance.incoming.manual_manage') THEN RAISE EXCEPTION 'Bạn không có quyền sửa khoản thủ công'; END IF;
  PERFORM private.fin_manual_check(_source, _amount, _date, _note);
  SELECT * INTO t FROM public.bank_transactions WHERE id = _tx FOR UPDATE;
  IF NOT FOUND OR t.source = 'bank' THEN RAISE EXCEPTION 'Không tìm thấy khoản thủ công'; END IF;
  IF t.cancelled_at IS NOT NULL THEN RAISE EXCEPTION 'Khoản tiền đã hủy'; END IF;
  IF t.status = 'reconciled' THEN
    IF NOT private.sig_can(me, 'finance.incoming.manage') THEN RAISE EXCEPTION 'Khoản đã đối soát chỉ người quản lý được sửa'; END IF;
    IF coalesce(btrim(_reason),'') = '' THEN RAISE EXCEPTION 'Vui lòng nhập lý do sửa khoản đã đối soát'; END IF;
  END IF;
  UPDATE public.bank_transactions SET source = _source, amount = _amount, received_date = _date,
    transaction_at = (_date + (transaction_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::time) AT TIME ZONE 'Asia/Ho_Chi_Minh', note = btrim(_note) WHERE id = _tx;
  INSERT INTO public.bank_transaction_events(tx_id, actor_id, action, before, after, reason) SELECT _tx, me, 'manual_edit', private.fin_snap(t), private.fin_snap(x), nullif(btrim(coalesce(_reason,'')),'') FROM public.bank_transactions x WHERE x.id = _tx;
END $$;

CREATE OR REPLACE FUNCTION public.fin_manual_cancel(_tx uuid, _reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t public.bank_transactions; me uuid := auth.uid();
BEGIN
  IF NOT private.sig_can(me, 'finance.incoming.manual_manage') THEN RAISE EXCEPTION 'Bạn không có quyền hủy khoản thủ công'; END IF;
  IF coalesce(btrim(_reason),'') = '' THEN RAISE EXCEPTION 'Vui lòng nhập lý do hủy'; END IF;
  SELECT * INTO t FROM public.bank_transactions WHERE id = _tx FOR UPDATE;
  IF NOT FOUND OR t.source = 'bank' THEN RAISE EXCEPTION 'Không tìm thấy khoản thủ công'; END IF;
  IF t.cancelled_at IS NOT NULL THEN RAISE EXCEPTION 'Khoản tiền đã hủy'; END IF;
  IF t.status = 'reconciled' AND NOT private.sig_can(me, 'finance.incoming.manage') THEN RAISE EXCEPTION 'Khoản đã đối soát chỉ người quản lý được hủy'; END IF;
  UPDATE public.bank_transactions SET cancelled_at = now(), cancelled_by = me, cancel_reason = btrim(_reason) WHERE id = _tx;
  INSERT INTO public.bank_transaction_events(tx_id, actor_id, action, before, after, reason) SELECT _tx, me, 'manual_cancel', private.fin_snap(t), private.fin_snap(x), btrim(_reason) FROM public.bank_transactions x WHERE x.id = _tx;
END $$;

-- Thống kê theo đúng RLS người gọi (SECURITY INVOKER), không giới hạn số dòng tải ở trình duyệt
CREATE OR REPLACE FUNCTION public.fin_incoming_stats(_src text DEFAULT NULL, _acc uuid DEFAULT NULL, _from timestamptz DEFAULT NULL, _to timestamptz DEFAULT NULL, _q text DEFAULT NULL, _sale uuid DEFAULT NULL)
RETURNS TABLE(status text, source text, n bigint, total numeric) LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT t.status, CASE WHEN t.source = 'bank' THEN 'bank' ELSE 'manual' END, count(*), sum(t.amount)
  FROM public.bank_transactions t
  WHERE t.cancelled_at IS NULL AND t.amount > 0
    AND (_src IS NULL OR t.source = _src)
    AND (_acc IS NULL OR t.bank_account_id = _acc)
    AND (_from IS NULL OR t.transaction_at >= _from)
    AND (_to IS NULL OR t.transaction_at < _to)
    AND (_sale IS NULL OR t.claimed_by = _sale)
    AND (coalesce(_q,'') = '' OR concat_ws(' ', t.description, t.reference_number, t.counter_account_name, t.note, t.customer) ILIKE '%' || _q || '%')
  GROUP BY 1, 2;
$$;

REVOKE ALL ON FUNCTION public.fin_manual_create(text,bigint,date,text,boolean), public.fin_manual_update(uuid,text,bigint,date,text,text), public.fin_manual_cancel(uuid,text), public.fin_incoming_stats(text,uuid,timestamptz,timestamptz,text,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fin_manual_create(text,bigint,date,text,boolean), public.fin_manual_update(uuid,text,bigint,date,text,text), public.fin_manual_cancel(uuid,text), public.fin_incoming_stats(text,uuid,timestamptz,timestamptz,text,uuid) TO authenticated;

-- Giữ năng lực hiện có của role Admin (trước đây cấu hình qua is_admin / manage)
UPDATE public.app_roles SET permissions = (SELECT array_agg(DISTINCT x) FROM unnest(permissions || ARRAY['finance.incoming.manual_view','finance.incoming.manual_create','finance.incoming.manual_manage','finance.incoming.bank_config','finance.incoming.gmf_config']) x), updated_at = now() WHERE id = 'role-admin';