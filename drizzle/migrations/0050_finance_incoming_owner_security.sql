CREATE OR REPLACE FUNCTION private.fin_can_see(_uid uuid, _tx uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, public AS $$
 SELECT _uid IS NOT NULL AND private.is_active(_uid) AND EXISTS (
 SELECT 1 FROM public.bank_transactions t LEFT JOIN public.bank_accounts a ON a.id=t.bank_account_id
 WHERE t.id=_tx AND (
 private.sig_can(_uid,'finance.incoming.manage') OR private.sig_can(_uid,'finance.incoming.reconcile')
 OR (t.source<>'bank' AND private.sig_can(_uid,'finance.incoming.manual_manage'))
 OR (CASE WHEN t.source='bank' THEN
   (private.sig_can(_uid,'finance.incoming.view') OR private.sig_can(_uid,'finance.incoming.claim')) AND coalesce(a.share_sale,false)
 ELSE private.sig_can(_uid,'finance.incoming.manual_view') END
 AND (t.claimed_by=_uid OR (t.claimed_by IS NULL AND t.status='unclaimed')))
 OR (t.source<>'bank' AND t.created_by=_uid AND private.sig_can(_uid,'finance.incoming.manual_create') AND t.claimed_by IS NULL AND t.status='unclaimed')
 ));
$$;
CREATE OR REPLACE FUNCTION public.fin_can_view_totals()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,public AS $$
 SELECT coalesce(private.sig_can(auth.uid(),'finance.incoming.view_totals'),false);
$$;
REVOKE ALL ON FUNCTION public.fin_can_view_totals() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fin_can_view_totals() TO authenticated;
CREATE OR REPLACE FUNCTION public.fin_incoming_stats(_src text DEFAULT NULL, _acc uuid DEFAULT NULL, _from timestamptz DEFAULT NULL, _to timestamptz DEFAULT NULL, _q text DEFAULT NULL, _sale uuid DEFAULT NULL)
RETURNS TABLE(status text, source text, n bigint, total numeric)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path=pg_catalog,public AS $$
 WITH search AS (
 SELECT CASE WHEN btrim(coalesce(_q,'')) ~ '^[0-9]+([.,][0-9]{3})*$' AND length(replace(replace(btrim(_q),'.',''),',',''))<=16
 THEN replace(replace(btrim(_q),'.',''),',','')::numeric END amount,
 btrim(coalesce(_q,'')) text, public.fin_can_view_totals() totals
 )
 SELECT t.status, CASE WHEN t.source='bank' THEN 'bank' ELSE 'manual' END, count(*),
 coalesce(sum(t.amount) FILTER (WHERE s.totals OR t.claimed_by=auth.uid()),0)
 FROM public.bank_transactions t CROSS JOIN search s
 WHERE t.cancelled_at IS NULL AND t.amount>0
 AND (_src IS NULL OR t.source=_src) AND (_acc IS NULL OR t.bank_account_id=_acc)
 AND (_from IS NULL OR t.transaction_at>=_from) AND (_to IS NULL OR t.transaction_at<_to)
 AND (_sale IS NULL OR t.claimed_by=_sale)
 AND (s.text='' OR CASE WHEN s.amount IS NOT NULL THEN t.amount=s.amount ELSE
 t.description ILIKE '%'||s.text||'%' OR t.reference_number ILIKE '%'||s.text||'%' OR t.note ILIKE '%'||s.text||'%' OR t.customer ILIKE '%'||s.text||'%' END)
 GROUP BY 1,2;
$$;
REVOKE ALL ON FUNCTION public.fin_incoming_stats(text,uuid,timestamptz,timestamptz,text,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.fin_incoming_stats(text,uuid,timestamptz,timestamptz,text,uuid) TO authenticated;
CREATE OR REPLACE FUNCTION public.fin_bank_labels()
RETURNS TABLE(id uuid,label text,bank_name text,last4 text,active boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,public AS $$
 SELECT a.id,coalesce(nullif(btrim(a.label),''),a.bank_name||' · '||right(a.account_number,4)),a.bank_name,right(a.account_number,4),a.active
 FROM public.bank_accounts a
 WHERE private.sig_can(auth.uid(),'finance.incoming.manage') OR private.sig_can(auth.uid(),'finance.incoming.reconcile') OR private.sig_can(auth.uid(),'finance.incoming.bank_config')
 OR ((private.sig_can(auth.uid(),'finance.incoming.view') OR private.sig_can(auth.uid(),'finance.incoming.claim')) AND a.share_sale)
 ORDER BY a.active DESC,a.created_at;
$$;
ALTER POLICY bank_acc_select ON public.bank_accounts USING (private.sig_can(auth.uid(),'finance.incoming.bank_config'));
ALTER POLICY bank_acc_insert ON public.bank_accounts WITH CHECK (private.sig_can(auth.uid(),'finance.incoming.bank_config'));
ALTER POLICY bank_acc_update ON public.bank_accounts USING (private.sig_can(auth.uid(),'finance.incoming.bank_config')) WITH CHECK (private.sig_can(auth.uid(),'finance.incoming.bank_config'));
CREATE OR REPLACE FUNCTION public.fin_reconcile(_tx uuid,_customer text DEFAULT NULL,_type text DEFAULT NULL,_ref text DEFAULT NULL,_note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE t public.bank_transactions; me uuid:=auth.uid();
BEGIN
 IF NOT private.sig_can(me,'finance.incoming.reconcile') THEN RAISE EXCEPTION 'Bạn không có quyền đối soát'; END IF;
 SELECT * INTO t FROM public.bank_transactions WHERE id=_tx FOR UPDATE;
 IF NOT FOUND OR NOT private.fin_can_see(me,_tx) THEN RAISE EXCEPTION 'Không tìm thấy giao dịch'; END IF;
 IF t.cancelled_at IS NOT NULL THEN RAISE EXCEPTION 'Khoản tiền đã hủy'; END IF;
 IF t.status='reconciled' THEN RAISE EXCEPTION 'Giao dịch đã được đối soát'; END IF;
 IF t.claimed_by IS NULL OR t.status<>'pending_reconciliation' THEN RAISE EXCEPTION 'Giao dịch cần Sale xác nhận trước khi đối soát'; END IF;
 IF _customer IS NOT NULL THEN
 PERFORM private.fin_check(_customer,_type,_note);
 UPDATE public.bank_transactions SET customer=btrim(_customer),money_type=_type,ref_code=nullif(btrim(coalesce(_ref,'')),''),note=btrim(_note) WHERE id=_tx;
 END IF;
 UPDATE public.bank_transactions SET status='reconciled',reconciled_by=me,reconciled_at=now(),info_reason=NULL WHERE id=_tx;
 INSERT INTO public.bank_transaction_events(tx_id,actor_id,action,before,after) SELECT _tx,me,'reconcile',private.fin_snap(t),private.fin_snap(x) FROM public.bank_transactions x WHERE x.id=_tx;
END;
$$;