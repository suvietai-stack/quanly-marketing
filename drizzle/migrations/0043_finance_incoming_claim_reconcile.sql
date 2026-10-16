
ALTER TABLE public.bank_accounts
  ADD COLUMN IF NOT EXISTS share_sale boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS gmf_notify boolean NOT NULL DEFAULT false;

ALTER TABLE public.bank_transactions
  ADD COLUMN IF NOT EXISTS customer text,
  ADD COLUMN IF NOT EXISTS money_type text,
  ADD COLUMN IF NOT EXISTS ref_code text,
  ADD COLUMN IF NOT EXISTS note text,
  ADD COLUMN IF NOT EXISTS claimed_by uuid,
  ADD COLUMN IF NOT EXISTS claimed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reconciled_by uuid,
  ADD COLUMN IF NOT EXISTS reconciled_at timestamptz,
  ADD COLUMN IF NOT EXISTS info_reason text,
  ADD COLUMN IF NOT EXISTS gmf_status text NOT NULL DEFAULT 'skipped',
  ADD COLUMN IF NOT EXISTS gmf_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gmf_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS gmf_error text;

ALTER TABLE public.zalo_oa_config
  ADD COLUMN IF NOT EXISTS gmf_group_id text,
  ADD COLUMN IF NOT EXISTS gmf_group_name text,
  ADD COLUMN IF NOT EXISTS gmf_enabled boolean NOT NULL DEFAULT false;

ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS bank_tx_id uuid REFERENCES public.bank_transactions(id) ON DELETE CASCADE;

CREATE TABLE public.bank_transaction_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_id uuid NOT NULL REFERENCES public.bank_transactions(id) ON DELETE CASCADE,
  actor_id uuid,
  action text NOT NULL,
  before jsonb,
  after jsonb,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.bank_transaction_events(tx_id, created_at);
GRANT SELECT ON public.bank_transaction_events TO authenticated;
GRANT ALL ON public.bank_transaction_events TO service_role;
ALTER TABLE public.bank_transaction_events ENABLE ROW LEVEL SECURITY;

-- Quyền xem giao dịch
CREATE OR REPLACE FUNCTION private.fin_can_see(_uid uuid, _tx uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT private.is_admin(_uid)
    OR private.sig_can(_uid, 'finance.incoming.manage')
    OR private.sig_can(_uid, 'finance.incoming.reconcile')
    OR (private.sig_can(_uid, 'finance.incoming.view') AND EXISTS (
      SELECT 1 FROM public.bank_transactions t JOIN public.bank_accounts a ON a.id = t.bank_account_id
      WHERE t.id = _tx AND (a.share_sale OR t.claimed_by = _uid)));
$$;

DROP POLICY IF EXISTS bank_tx_select ON public.bank_transactions;
CREATE POLICY bank_tx_select ON public.bank_transactions FOR SELECT TO authenticated USING (private.fin_can_see(auth.uid(), id));
CREATE POLICY bank_tx_events_select ON public.bank_transaction_events FOR SELECT TO authenticated USING (private.fin_can_see(auth.uid(), tx_id));

-- Tên hiển thị cho Sale (không mở rộng quyền xem tài khoản)
CREATE OR REPLACE FUNCTION public.fin_bank_labels()
RETURNS TABLE(id uuid, label text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT a.id, coalesce(a.label, a.bank_name) FROM public.bank_accounts a
  WHERE private.sig_can(auth.uid(), 'finance.incoming.view') OR private.is_admin(auth.uid());
$$;
REVOKE ALL ON FUNCTION public.fin_bank_labels() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fin_bank_labels() TO authenticated;

CREATE OR REPLACE FUNCTION private.fin_snap(t public.bank_transactions)
RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
  SELECT jsonb_build_object('status', t.status, 'customer', t.customer, 'money_type', t.money_type, 'ref_code', t.ref_code, 'note', t.note, 'claimed_by', t.claimed_by, 'info_reason', t.info_reason);
$$;

CREATE OR REPLACE FUNCTION private.fin_check(_customer text, _type text, _note text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF coalesce(btrim(_customer), '') = '' THEN RAISE EXCEPTION 'Vui lòng nhập Khách hàng'; END IF;
  IF _type IS NULL OR _type NOT IN ('deposit','payment','extra_payment','refund','other') THEN RAISE EXCEPTION 'Vui lòng chọn Loại tiền'; END IF;
  IF coalesce(btrim(_note), '') = '' THEN RAISE EXCEPTION 'Vui lòng nhập Ghi chú chi tiết'; END IF;
  IF length(_customer) > 200 OR length(_note) > 2000 THEN RAISE EXCEPTION 'Nội dung quá dài'; END IF;
END $$;

CREATE OR REPLACE FUNCTION private.fin_notify_acct(_tx uuid, _kind text, _key text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.notifications(recipient_id, kind, bank_tx_id, dedup_key, payload, zalo_status, push_status)
  SELECT p.id, _kind, _tx, _key || ':' || p.id, '{}'::jsonb, 'ineligible', 'none'
  FROM public.profiles p
  WHERE p.id IS DISTINCT FROM auth.uid() AND private.sig_can(p.id, 'finance.incoming.reconcile')
  ON CONFLICT (dedup_key) DO NOTHING;
$$;

-- Sale nhận / gửi lại
CREATE OR REPLACE FUNCTION public.fin_claim(_tx uuid, _customer text, _type text, _ref text, _note text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t public.bank_transactions; me uuid := auth.uid(); n int;
BEGIN
  IF NOT private.sig_can(me, 'finance.incoming.claim') THEN RAISE EXCEPTION 'Bạn không có quyền xác nhận giao dịch'; END IF;
  PERFORM private.fin_check(_customer, _type, _note);
  SELECT * INTO t FROM public.bank_transactions WHERE id = _tx FOR UPDATE;
  IF NOT FOUND OR NOT private.fin_can_see(me, _tx) THEN RAISE EXCEPTION 'Không tìm thấy giao dịch'; END IF;
  IF t.status = 'unclaimed' AND t.claimed_by IS NULL THEN
    UPDATE public.bank_transactions SET customer = btrim(_customer), money_type = _type, ref_code = nullif(btrim(coalesce(_ref,'')),''), note = btrim(_note),
      claimed_by = me, claimed_at = now(), status = 'pending_reconciliation', info_reason = NULL WHERE id = _tx AND claimed_by IS NULL;
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n = 0 THEN RAISE EXCEPTION 'Giao dịch đã được người khác nhận'; END IF;
    INSERT INTO public.bank_transaction_events(tx_id, actor_id, action, before, after) SELECT _tx, me, 'claim', private.fin_snap(t), private.fin_snap(x) FROM public.bank_transactions x WHERE x.id = _tx;
  ELSIF t.claimed_by = me AND t.status IN ('pending_reconciliation','needs_info') THEN
    UPDATE public.bank_transactions SET customer = btrim(_customer), money_type = _type, ref_code = nullif(btrim(coalesce(_ref,'')),''), note = btrim(_note),
      status = 'pending_reconciliation' WHERE id = _tx;
    INSERT INTO public.bank_transaction_events(tx_id, actor_id, action, before, after) SELECT _tx, me, CASE WHEN t.status='needs_info' THEN 'resubmit' ELSE 'edit' END, private.fin_snap(t), private.fin_snap(x) FROM public.bank_transactions x WHERE x.id = _tx;
  ELSIF t.claimed_by IS NOT NULL AND t.claimed_by <> me THEN
    RAISE EXCEPTION 'Giao dịch đã được người khác nhận';
  ELSE
    RAISE EXCEPTION 'Giao dịch đã đối soát, không thể sửa';
  END IF;
  PERFORM private.fin_notify_acct(_tx, 'fin_pending', 'fin_pending:' || _tx || ':' || extract(epoch from now())::bigint);
END $$;

-- Kế toán: yêu cầu bổ sung
CREATE OR REPLACE FUNCTION public.fin_request_info(_tx uuid, _reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t public.bank_transactions; me uuid := auth.uid();
BEGIN
  IF NOT private.sig_can(me, 'finance.incoming.reconcile') THEN RAISE EXCEPTION 'Bạn không có quyền đối soát'; END IF;
  IF coalesce(btrim(_reason),'') = '' THEN RAISE EXCEPTION 'Vui lòng nhập lý do'; END IF;
  SELECT * INTO t FROM public.bank_transactions WHERE id = _tx FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy giao dịch'; END IF;
  IF t.status <> 'pending_reconciliation' OR t.claimed_by IS NULL THEN RAISE EXCEPTION 'Chỉ yêu cầu bổ sung khi giao dịch đang chờ đối soát'; END IF;
  UPDATE public.bank_transactions SET status = 'needs_info', info_reason = btrim(_reason) WHERE id = _tx;
  INSERT INTO public.bank_transaction_events(tx_id, actor_id, action, before, after, reason) SELECT _tx, me, 'request_info', private.fin_snap(t), private.fin_snap(x), btrim(_reason) FROM public.bank_transactions x WHERE x.id = _tx;
  INSERT INTO public.notifications(recipient_id, kind, bank_tx_id, dedup_key, payload, zalo_status, push_status)
  VALUES (t.claimed_by, 'fin_needs_info', _tx, 'fin_needs_info:' || _tx || ':' || extract(epoch from now())::bigint, '{}'::jsonb, 'ineligible', 'none')
  ON CONFLICT (dedup_key) DO NOTHING;
END $$;

-- Kế toán: đối soát (có thể tự nhập 4 trường)
CREATE OR REPLACE FUNCTION public.fin_reconcile(_tx uuid, _customer text DEFAULT NULL, _type text DEFAULT NULL, _ref text DEFAULT NULL, _note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t public.bank_transactions; me uuid := auth.uid();
BEGIN
  IF NOT private.sig_can(me, 'finance.incoming.reconcile') THEN RAISE EXCEPTION 'Bạn không có quyền đối soát'; END IF;
  SELECT * INTO t FROM public.bank_transactions WHERE id = _tx FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy giao dịch'; END IF;
  IF t.status = 'reconciled' THEN RAISE EXCEPTION 'Giao dịch đã được đối soát'; END IF;
  IF _customer IS NOT NULL OR t.claimed_by IS NULL THEN
    PERFORM private.fin_check(_customer, _type, _note);
    UPDATE public.bank_transactions SET customer = btrim(_customer), money_type = _type, ref_code = nullif(btrim(coalesce(_ref,'')),''), note = btrim(_note) WHERE id = _tx;
  END IF;
  UPDATE public.bank_transactions SET status = 'reconciled', reconciled_by = me, reconciled_at = now(), info_reason = NULL WHERE id = _tx;
  INSERT INTO public.bank_transaction_events(tx_id, actor_id, action, before, after) SELECT _tx, me, 'reconcile', private.fin_snap(t), private.fin_snap(x) FROM public.bank_transactions x WHERE x.id = _tx;
END $$;

-- Quản lý: điều chỉnh nhận nhầm (gỡ người nhận / đưa về chưa xác nhận)
CREATE OR REPLACE FUNCTION public.fin_reset(_tx uuid, _reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t public.bank_transactions; me uuid := auth.uid();
BEGIN
  IF NOT (private.sig_can(me, 'finance.incoming.manage') OR private.sig_can(me, 'finance.incoming.reconcile')) THEN RAISE EXCEPTION 'Bạn không có quyền điều chỉnh'; END IF;
  IF coalesce(btrim(_reason),'') = '' THEN RAISE EXCEPTION 'Vui lòng nhập lý do'; END IF;
  SELECT * INTO t FROM public.bank_transactions WHERE id = _tx FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy giao dịch'; END IF;
  IF t.status = 'reconciled' AND NOT private.sig_can(me, 'finance.incoming.manage') THEN RAISE EXCEPTION 'Chỉ người quản lý được mở lại giao dịch đã đối soát'; END IF;
  UPDATE public.bank_transactions SET status = 'unclaimed', claimed_by = NULL, claimed_at = NULL, reconciled_by = NULL, reconciled_at = NULL, info_reason = NULL WHERE id = _tx;
  INSERT INTO public.bank_transaction_events(tx_id, actor_id, action, before, after, reason) SELECT _tx, me, 'reset', private.fin_snap(t), private.fin_snap(x), btrim(_reason) FROM public.bank_transactions x WHERE x.id = _tx;
END $$;

REVOKE ALL ON FUNCTION public.fin_claim(uuid,text,text,text,text), public.fin_request_info(uuid,text), public.fin_reconcile(uuid,text,text,text,text), public.fin_reset(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fin_claim(uuid,text,text,text,text), public.fin_request_info(uuid,text), public.fin_reconcile(uuid,text,text,text,text), public.fin_reset(uuid,text) TO authenticated;
