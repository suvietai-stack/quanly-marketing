CREATE OR REPLACE FUNCTION private.fin_confirmation_guard() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog,public AS $$ BEGIN
IF TG_OP='UPDATE' AND OLD.operation_test AND (NEW.confirmation_status,NEW.confirmed_by,NEW.confirmed_at) IS DISTINCT FROM (OLD.confirmation_status,OLD.confirmed_by,OLD.confirmed_at) THEN RAISE EXCEPTION 'Giao dịch thuộc lịch sử kiểm thử chỉ được xem, không xử lý'; END IF;
IF TG_OP='UPDATE' AND NEW.status='unclaimed' AND OLD.status<>'unclaimed' THEN NEW.confirmation_status:='unclaimed'; NEW.confirmed_by:=NULL; NEW.confirmed_at:=NULL; END IF;
IF TG_OP='UPDATE' AND OLD.confirmation_status='confirmed' AND (NEW.source,NEW.amount,NEW.received_date,NEW.description,NEW.cancelled_at) IS DISTINCT FROM (OLD.source,OLD.amount,OLD.received_date,OLD.description,OLD.cancelled_at) AND NOT coalesce(private.sig_can(auth.uid(),'finance.incoming.manage'),false) THEN RAISE EXCEPTION 'Khoản đã xác nhận chỉ người quản lý được sửa hoặc hủy'; END IF;
RETURN NEW; END; $$;
CREATE OR REPLACE FUNCTION public.fin_manual_update(_tx uuid,_source text,_amount bigint,_date date,_note text,_reason text DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$ DECLARE t public.bank_transactions; me uuid:=auth.uid(); BEGIN
IF NOT coalesce(private.sig_can(me,'finance.incoming.manual_manage'),false) THEN RAISE EXCEPTION 'Bạn không có quyền sửa khoản thủ công'; END IF;
PERFORM private.fin_manual_check(_source,_amount,_date,_note);
SELECT * INTO t FROM public.bank_transactions WHERE id=_tx FOR UPDATE;
IF NOT FOUND OR t.source='bank' OR NOT private.fin_can_see(me,_tx) THEN RAISE EXCEPTION 'Không tìm thấy khoản thủ công'; END IF;
IF t.operation_test OR t.cancelled_at IS NOT NULL THEN RAISE EXCEPTION 'Không thể sửa khoản lưu trữ hoặc đã hủy'; END IF;
IF t.confirmation_status='confirmed' THEN
IF NOT coalesce(private.sig_can(me,'finance.incoming.manage'),false) THEN RAISE EXCEPTION 'Khoản đã xác nhận chỉ người quản lý được sửa'; END IF;
IF coalesce(btrim(_reason),'')='' THEN RAISE EXCEPTION 'Vui lòng nhập lý do sửa khoản đã xác nhận'; END IF;
END IF;
UPDATE public.bank_transactions SET source=_source,amount=_amount,received_date=_date,transaction_at=(_date+(transaction_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::time) AT TIME ZONE 'Asia/Ho_Chi_Minh',description=btrim(_note) WHERE id=_tx;
INSERT INTO public.bank_transaction_events(tx_id,actor_id,action,before,after,reason) SELECT _tx,me,'manual_edit',private.fin_snap(t),private.fin_snap(x),nullif(btrim(coalesce(_reason,'')),'') FROM public.bank_transactions x WHERE x.id=_tx;
END; $$;
CREATE OR REPLACE FUNCTION public.fin_reset(_tx uuid,_reason text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$ DECLARE t public.bank_transactions; me uuid:=auth.uid(); BEGIN
IF NOT (coalesce(private.sig_can(me,'finance.incoming.manage'),false) OR coalesce(private.sig_can(me,'finance.incoming.reconcile'),false)) THEN RAISE EXCEPTION 'Bạn không có quyền điều chỉnh'; END IF;
IF coalesce(btrim(_reason),'')='' THEN RAISE EXCEPTION 'Vui lòng nhập lý do'; END IF;
SELECT * INTO t FROM public.bank_transactions WHERE id=_tx FOR UPDATE;
IF NOT FOUND OR NOT private.fin_can_see(me,_tx) THEN RAISE EXCEPTION 'Không tìm thấy giao dịch'; END IF;
IF t.operation_test OR t.cancelled_at IS NOT NULL THEN RAISE EXCEPTION 'Không thể điều chỉnh khoản lưu trữ hoặc đã hủy'; END IF;
IF t.confirmation_status='confirmed' AND NOT coalesce(private.sig_can(me,'finance.incoming.manage'),false) THEN RAISE EXCEPTION 'Chỉ người quản lý được mở lại giao dịch đã xác nhận'; END IF;
UPDATE public.bank_transactions SET status='unclaimed',confirmation_status='unclaimed',confirmed_by=NULL,confirmed_at=NULL,claimed_by=NULL,claimed_at=NULL,reconciled_by=NULL,reconciled_at=NULL,info_reason=NULL,customer=CASE WHEN source<>'bank' THEN NULL ELSE customer END,money_type=CASE WHEN source<>'bank' THEN NULL ELSE money_type END,ref_code=CASE WHEN source<>'bank' THEN NULL ELSE ref_code END,note=CASE WHEN source<>'bank' THEN NULL ELSE note END WHERE id=_tx;
INSERT INTO public.bank_transaction_events(tx_id,actor_id,action,before,after,reason) SELECT _tx,me,'reset',private.fin_snap(t),private.fin_snap(x),btrim(_reason) FROM public.bank_transactions x WHERE x.id=_tx;
END; $$;