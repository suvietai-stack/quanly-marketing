-- Khoản thủ công: ghi chú Kế toán lưu ở description (note dành cho Sale khi nhận)
UPDATE public.bank_transactions SET description = note WHERE source <> 'bank' AND description IS NULL;

CREATE OR REPLACE FUNCTION private.fin_can_see(_uid uuid, _tx uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.bank_transactions t LEFT JOIN public.bank_accounts a ON a.id = t.bank_account_id
    WHERE t.id = _tx AND CASE WHEN t.source = 'bank' THEN
      private.is_admin(_uid) OR private.sig_can(_uid, 'finance.incoming.manage') OR private.sig_can(_uid, 'finance.incoming.reconcile')
      OR (private.sig_can(_uid, 'finance.incoming.view') AND (coalesce(a.share_sale, false) OR t.claimed_by = _uid))
    ELSE
      private.sig_can(_uid, 'finance.incoming.manage') OR t.created_by = _uid OR t.claimed_by = _uid
      OR (private.sig_can(_uid, 'finance.incoming.manual_view') AND (private.sig_can(_uid, 'finance.incoming.view') OR private.sig_can(_uid, 'finance.incoming.reconcile')))
    END);
$$;

CREATE OR REPLACE FUNCTION public.fin_claim(_tx uuid, _customer text, _type text, _ref text, _note text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t public.bank_transactions; me uuid := auth.uid(); n int;
BEGIN
  IF NOT private.sig_can(me, 'finance.incoming.claim') THEN RAISE EXCEPTION 'Bạn không có quyền xác nhận giao dịch'; END IF;
  PERFORM private.fin_check(_customer, _type, _note);
  SELECT * INTO t FROM public.bank_transactions WHERE id = _tx FOR UPDATE;
  IF NOT FOUND OR NOT private.fin_can_see(me, _tx) THEN RAISE EXCEPTION 'Không tìm thấy giao dịch'; END IF;
  IF t.cancelled_at IS NOT NULL THEN RAISE EXCEPTION 'Khoản tiền đã hủy'; END IF;
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

CREATE OR REPLACE FUNCTION public.fin_reconcile(_tx uuid, _customer text DEFAULT NULL, _type text DEFAULT NULL, _ref text DEFAULT NULL, _note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t public.bank_transactions; me uuid := auth.uid();
BEGIN
  IF NOT private.sig_can(me, 'finance.incoming.reconcile') THEN RAISE EXCEPTION 'Bạn không có quyền đối soát'; END IF;
  SELECT * INTO t FROM public.bank_transactions WHERE id = _tx FOR UPDATE;
  IF NOT FOUND OR NOT private.fin_can_see(me, _tx) THEN RAISE EXCEPTION 'Không tìm thấy giao dịch'; END IF;
  IF t.cancelled_at IS NOT NULL THEN RAISE EXCEPTION 'Khoản tiền đã hủy'; END IF;
  IF t.status = 'reconciled' THEN RAISE EXCEPTION 'Giao dịch đã được đối soát'; END IF;
  IF t.source <> 'bank' AND t.claimed_by IS NULL THEN RAISE EXCEPTION 'Khoản thủ công cần Sale xác nhận trước khi đối soát'; END IF;
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
  IF t.cancelled_at IS NOT NULL THEN RAISE EXCEPTION 'Khoản tiền đã hủy'; END IF;
  IF t.status = 'reconciled' AND NOT private.sig_can(me, 'finance.incoming.manage') THEN RAISE EXCEPTION 'Chỉ người quản lý được mở lại giao dịch đã đối soát'; END IF;
  UPDATE public.bank_transactions SET status = 'unclaimed', claimed_by = NULL, claimed_at = NULL, reconciled_by = NULL, reconciled_at = NULL, info_reason = NULL,
    customer = CASE WHEN source <> 'bank' THEN NULL ELSE customer END, money_type = CASE WHEN source <> 'bank' THEN NULL ELSE money_type END,
    ref_code = CASE WHEN source <> 'bank' THEN NULL ELSE ref_code END, note = CASE WHEN source <> 'bank' THEN NULL ELSE note END WHERE id = _tx;
  INSERT INTO public.bank_transaction_events(tx_id, actor_id, action, before, after, reason) SELECT _tx, me, 'reset', private.fin_snap(t), private.fin_snap(x), btrim(_reason) FROM public.bank_transactions x WHERE x.id = _tx;
END $$;

CREATE OR REPLACE FUNCTION public.fin_manual_create(_source text, _amount bigint, _date date, _note text, _reconcile boolean DEFAULT false)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me uuid := auth.uid(); nid uuid := gen_random_uuid();
BEGIN
  IF NOT private.sig_can(me, 'finance.incoming.manual_create') THEN RAISE EXCEPTION 'Bạn không có quyền thêm khoản tiền thủ công'; END IF;
  IF _reconcile THEN RAISE EXCEPTION 'Khoản thủ công cần Sale xác nhận trước khi đối soát'; END IF;
  PERFORM private.fin_manual_check(_source, _amount, _date, _note);
  INSERT INTO public.bank_transactions(id, provider, provider_transaction_id, source, amount, received_date, transaction_at, description, created_by, status, gmf_status)
  VALUES (nid, 'manual', 'manual:' || nid, _source, _amount, _date,
    (_date + (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::time) AT TIME ZONE 'Asia/Ho_Chi_Minh', btrim(_note), me, 'unclaimed', 'skipped');
  INSERT INTO public.bank_transaction_events(tx_id, actor_id, action, after) SELECT nid, me, 'manual_create', private.fin_snap(x) FROM public.bank_transactions x WHERE x.id = nid;
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
    transaction_at = (_date + (transaction_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::time) AT TIME ZONE 'Asia/Ho_Chi_Minh', description = btrim(_note) WHERE id = _tx;
  INSERT INTO public.bank_transaction_events(tx_id, actor_id, action, before, after, reason) SELECT _tx, me, 'manual_edit', private.fin_snap(t), private.fin_snap(x), nullif(btrim(coalesce(_reason,'')),'') FROM public.bank_transactions x WHERE x.id = _tx;
END $$;