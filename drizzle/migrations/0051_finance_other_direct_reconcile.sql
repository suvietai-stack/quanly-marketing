CREATE OR REPLACE FUNCTION private.fin_check(_customer text, _type text, _note text)
RETURNS void LANGUAGE plpgsql SET search_path=pg_catalog,public AS $$
BEGIN
 IF _type IS NULL OR _type NOT IN ('deposit','payment','extra_payment','refund','other') THEN RAISE EXCEPTION 'Vui lòng chọn Loại tiền'; END IF;
 IF _type <> 'other' AND coalesce(btrim(_customer),'')='' THEN RAISE EXCEPTION 'Vui lòng nhập Khách hàng'; END IF;
 IF coalesce(btrim(_note),'')='' THEN RAISE EXCEPTION 'Vui lòng nhập Ghi chú khoản tiền'; END IF;
 IF length(_customer)>200 OR length(_note)>2000 THEN RAISE EXCEPTION 'Nội dung quá dài'; END IF;
END;
$$;
CREATE OR REPLACE FUNCTION public.fin_reconcile(_tx uuid,_customer text DEFAULT NULL,_type text DEFAULT NULL,_ref text DEFAULT NULL,_note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE t public.bank_transactions; me uuid:=auth.uid();
BEGIN
 IF NOT coalesce(private.sig_can(me,'finance.incoming.reconcile'),false) THEN RAISE EXCEPTION 'Bạn không có quyền đối soát'; END IF;
 SELECT * INTO t FROM public.bank_transactions WHERE id=_tx FOR UPDATE;
 IF NOT FOUND OR NOT private.fin_can_see(me,_tx) THEN RAISE EXCEPTION 'Không tìm thấy giao dịch'; END IF;
 IF t.cancelled_at IS NOT NULL THEN RAISE EXCEPTION 'Khoản tiền đã hủy'; END IF;
 IF t.status='reconciled' THEN RAISE EXCEPTION 'Giao dịch đã được đối soát'; END IF;
 IF _type='other' AND t.status='unclaimed' AND t.claimed_by IS NULL THEN
   PERFORM private.fin_check(NULL,'other',_note);
   UPDATE public.bank_transactions SET money_type='other',note=btrim(_note),status='reconciled',reconciled_by=me,reconciled_at=now(),info_reason=NULL WHERE id=_tx;
 ELSE
   IF t.claimed_by IS NULL OR t.status<>'pending_reconciliation' THEN RAISE EXCEPTION 'Giao dịch cần Sale xác nhận trước khi đối soát'; END IF;
   IF _customer IS NOT NULL THEN
     PERFORM private.fin_check(_customer,_type,_note);
     UPDATE public.bank_transactions SET customer=btrim(_customer),money_type=_type,ref_code=nullif(btrim(coalesce(_ref,'')),''),note=btrim(_note) WHERE id=_tx;
   END IF;
   UPDATE public.bank_transactions SET status='reconciled',reconciled_by=me,reconciled_at=now(),info_reason=NULL WHERE id=_tx;
 END IF;
 INSERT INTO public.bank_transaction_events(tx_id,actor_id,action,before,after) SELECT _tx,me,'reconcile',private.fin_snap(t),private.fin_snap(x) FROM public.bank_transactions x WHERE x.id=_tx;
END;
$$;
REVOKE ALL ON FUNCTION public.fin_reconcile(uuid,text,text,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.fin_reconcile(uuid,text,text,text,text) TO authenticated;