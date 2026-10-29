CREATE TABLE public.sao_wallets(user_id uuid PRIMARY KEY, balance bigint NOT NULL DEFAULT 0 CHECK(balance>=0), held bigint NOT NULL DEFAULT 0 CHECK(held>=0 AND held<=balance));
GRANT SELECT ON public.sao_wallets TO authenticated; GRANT ALL ON public.sao_wallets TO service_role;
ALTER TABLE public.sao_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY sao_wallet_own ON public.sao_wallets FOR SELECT TO authenticated USING(user_id=auth.uid() AND private.is_active(auth.uid()));
CREATE TABLE public.sao_rules(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), source text UNIQUE NOT NULL CHECK(source IN ('signal','kpi','task')), stars integer NOT NULL CHECK(stars>0 AND stars<=100000), enabled boolean NOT NULL DEFAULT false, enabled_at timestamptz, updated_by uuid, updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.sao_rules TO authenticated; GRANT ALL ON public.sao_rules TO service_role;
ALTER TABLE public.sao_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY sao_rule_read ON public.sao_rules FOR SELECT TO authenticated USING(private.sig_can(auth.uid(),'sao.program_manage'));
CREATE TABLE public.sao_gifts(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL CHECK(length(btrim(name)) BETWEEN 1 AND 150), image_url text NOT NULL, price integer NOT NULL CHECK(price>0 AND price<=1000000), stock integer NOT NULL DEFAULT 0 CHECK(stock>=0), reserved integer NOT NULL DEFAULT 0 CHECK(reserved>=0 AND reserved<=stock), enabled boolean NOT NULL DEFAULT true, updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.sao_gifts TO authenticated; GRANT ALL ON public.sao_gifts TO service_role;
ALTER TABLE public.sao_gifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY sao_gift_read ON public.sao_gifts FOR SELECT TO authenticated USING(private.is_active(auth.uid()) AND (enabled OR private.sig_can(auth.uid(),'sao.shop_manage')));
CREATE TABLE public.sao_redemptions(id uuid PRIMARY KEY, user_id uuid NOT NULL, gift_id uuid NOT NULL REFERENCES public.sao_gifts(id), gift_name text NOT NULL, price integer NOT NULL, status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','fulfilled','cancelled')), created_at timestamptz NOT NULL DEFAULT now(), decided_at timestamptz, decided_by uuid, reason text);
GRANT SELECT ON public.sao_redemptions TO authenticated; GRANT ALL ON public.sao_redemptions TO service_role;
ALTER TABLE public.sao_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY sao_redemption_read ON public.sao_redemptions FOR SELECT TO authenticated USING(private.is_active(auth.uid()) AND (user_id=auth.uid() OR private.sig_can(auth.uid(),'sao.shop_manage')));
CREATE TABLE public.sao_ledger(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, amount integer NOT NULL CHECK(amount<>0), source text NOT NULL, source_id text NOT NULL, rule_id uuid REFERENCES public.sao_rules(id), reason text NOT NULL, actor_id uuid, balance_after bigint NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(rule_id,source,source_id));
CREATE UNIQUE INDEX sao_ledger_manual_once ON public.sao_ledger(source,source_id) WHERE source IN ('manual','redemption');
CREATE INDEX sao_ledger_user_time ON public.sao_ledger(user_id,created_at DESC);
GRANT SELECT ON public.sao_ledger TO authenticated; GRANT ALL ON public.sao_ledger TO service_role;
ALTER TABLE public.sao_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY sao_ledger_read ON public.sao_ledger FOR SELECT TO authenticated USING(private.is_active(auth.uid()) AND (user_id=auth.uid() OR private.sig_can(auth.uid(),'sao.program_manage') OR private.sig_can(auth.uid(),'sao.manual_grant')));
CREATE TABLE public.sao_celebrations(ledger_id uuid PRIMARY KEY REFERENCES public.sao_ledger(id), user_id uuid NOT NULL, shown_at timestamptz);
GRANT SELECT ON public.sao_celebrations TO authenticated; GRANT ALL ON public.sao_celebrations TO service_role;
ALTER TABLE public.sao_celebrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY sao_celebration_own ON public.sao_celebrations FOR SELECT TO authenticated USING(user_id=auth.uid() AND private.is_active(auth.uid()));
CREATE TABLE public.sao_task_approvals(task_id text PRIMARY KEY, user_id uuid NOT NULL, approved_by uuid NOT NULL, approved_at timestamptz NOT NULL DEFAULT now(), submitted_at timestamptz, brand_id text);
GRANT ALL ON public.sao_task_approvals TO service_role;
ALTER TABLE public.sao_task_approvals ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.sao_admin_events(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id uuid NOT NULL, kind text NOT NULL, entity_id text NOT NULL, before_data jsonb, after_data jsonb, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.sao_admin_events TO authenticated; GRANT ALL ON public.sao_admin_events TO service_role;
ALTER TABLE public.sao_admin_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY sao_admin_event_read ON public.sao_admin_events FOR SELECT TO authenticated USING(private.sig_can(auth.uid(),'sao.program_manage') OR private.sig_can(auth.uid(),'sao.shop_manage'));
CREATE FUNCTION private.sao_credit(_user uuid,_amount integer,_source text,_source_id text,_rule uuid,_reason text,_actor uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE lid uuid; b bigint;
BEGIN
 IF _amount<=0 OR NOT private.is_active(_user) THEN RETURN NULL; END IF;
 INSERT INTO public.sao_wallets(user_id) VALUES(_user) ON CONFLICT DO NOTHING;
 SELECT balance INTO b FROM public.sao_wallets WHERE user_id=_user FOR UPDATE;
 INSERT INTO public.sao_ledger(user_id,amount,source,source_id,rule_id,reason,actor_id,balance_after) VALUES(_user,_amount,_source,_source_id,_rule,_reason,_actor,b+_amount) ON CONFLICT DO NOTHING RETURNING id INTO lid;
 IF lid IS NULL THEN RETURN NULL; END IF;
 UPDATE public.sao_wallets SET balance=balance+_amount WHERE user_id=_user;
 INSERT INTO public.sao_celebrations(ledger_id,user_id) VALUES(lid,_user);
 RETURN lid;
END $$;
CREATE FUNCTION private.sao_award(_user uuid,_source text,_id text,_at timestamptz,_reason text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r public.sao_rules;
BEGIN
 SELECT * INTO r FROM public.sao_rules WHERE source=_source FOR SHARE;
 IF r.id IS NULL OR NOT r.enabled OR r.enabled_at IS NULL OR _at<r.enabled_at THEN RETURN; END IF;
 PERFORM private.sao_credit(_user,r.stars,_source,_id,r.id,_reason,auth.uid());
END $$;
CREATE FUNCTION public.sao_rule_save(_source text,_stars integer,_enabled boolean) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE oldrow jsonb; newrow jsonb; rid uuid;
BEGIN
 IF NOT private.sig_can(auth.uid(),'sao.program_manage') THEN RAISE EXCEPTION 'Không có quyền quản lý thưởng Sao'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('sao-rule:'||_source,0));
 SELECT to_jsonb(r) INTO oldrow FROM public.sao_rules r WHERE source=_source;
 INSERT INTO public.sao_rules(source,stars,enabled,enabled_at,updated_by) VALUES(_source,_stars,_enabled,CASE WHEN _enabled THEN now() END,auth.uid())
 ON CONFLICT(source) DO UPDATE SET stars=excluded.stars,enabled=excluded.enabled,enabled_at=CASE WHEN excluded.enabled AND NOT sao_rules.enabled THEN now() ELSE sao_rules.enabled_at END,updated_by=auth.uid(),updated_at=now() RETURNING id,to_jsonb(sao_rules.*) INTO rid,newrow;
 INSERT INTO public.sao_admin_events(actor_id,kind,entity_id,before_data,after_data) VALUES(auth.uid(),'rule',rid::text,oldrow,newrow);
END $$;
CREATE FUNCTION public.sao_gift_save(_id uuid,_name text,_image text,_price integer,_stock integer,_enabled boolean) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE gid uuid:=coalesce(_id,gen_random_uuid()); oldrow jsonb; newrow jsonb;
BEGIN
 IF NOT private.sig_can(auth.uid(),'sao.shop_manage') THEN RAISE EXCEPTION 'Không có quyền quản lý quà'; END IF;
 IF _image !~ '^https://' THEN RAISE EXCEPTION 'Ảnh quà phải có địa chỉ HTTPS'; END IF;
 SELECT to_jsonb(g) INTO oldrow FROM public.sao_gifts g WHERE id=gid FOR UPDATE;
 INSERT INTO public.sao_gifts(id,name,image_url,price,stock,enabled) VALUES(gid,btrim(_name),_image,_price,_stock,_enabled)
 ON CONFLICT(id) DO UPDATE SET name=excluded.name,image_url=excluded.image_url,price=excluded.price,stock=excluded.stock,enabled=excluded.enabled,updated_at=now() RETURNING to_jsonb(sao_gifts.*) INTO newrow;
 INSERT INTO public.sao_admin_events(actor_id,kind,entity_id,before_data,after_data) VALUES(auth.uid(),'gift',gid::text,oldrow,newrow);
 RETURN gid;
END $$;
CREATE FUNCTION public.sao_manual_grant(_user uuid,_stars integer,_reason text,_request uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE lid uuid; existing public.sao_ledger;
BEGIN
 IF NOT private.sig_can(auth.uid(),'sao.manual_grant') THEN RAISE EXCEPTION 'Không có quyền cộng Sao'; END IF;
 IF _stars IS NULL OR _stars<=0 OR _stars>100000 OR _reason IS NULL OR length(btrim(_reason))<3 THEN RAISE EXCEPTION 'Nhập số Sao hợp lệ và lý do'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('sao-manual:'||_request::text,0));
 SELECT * INTO existing FROM public.sao_ledger WHERE source='manual' AND source_id=_request::text;
 IF existing.id IS NOT NULL THEN
 IF existing.user_id<>_user OR existing.amount<>_stars OR existing.reason<>btrim(_reason) THEN RAISE EXCEPTION 'Mã thao tác đã được dùng'; END IF; RETURN existing.id;
 END IF;
 lid:=private.sao_credit(_user,_stars,'manual',_request::text,NULL,btrim(_reason),auth.uid());
 IF lid IS NULL THEN RAISE EXCEPTION 'Nhân viên không đang hoạt động'; END IF; RETURN lid;
END $$;
CREATE FUNCTION public.sao_redeem(_gift uuid,_request uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE w public.sao_wallets; g public.sao_gifts; r public.sao_redemptions;
BEGIN
 IF NOT private.is_active(auth.uid()) THEN RAISE EXCEPTION 'Bạn cần tài khoản đang hoạt động'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('sao-redeem:'||_request::text,0));
 SELECT * INTO r FROM public.sao_redemptions WHERE id=_request;
 IF r.id IS NOT NULL THEN IF r.user_id<>auth.uid() OR r.gift_id<>_gift THEN RAISE EXCEPTION 'Mã yêu cầu đã được dùng'; END IF; RETURN r.id; END IF;
 SELECT * INTO g FROM public.sao_gifts WHERE id=_gift FOR UPDATE;
 IF g.id IS NULL OR NOT g.enabled OR g.stock-g.reserved<1 THEN RAISE EXCEPTION 'Quà đã hết hoặc tạm ngừng'; END IF;
 SELECT * INTO w FROM public.sao_wallets WHERE user_id=auth.uid() FOR UPDATE;
 IF w.user_id IS NULL OR w.balance-w.held<g.price THEN RAISE EXCEPTION 'Bạn chưa đủ Sao khả dụng'; END IF;
 UPDATE public.sao_wallets SET held=held+g.price WHERE user_id=auth.uid();
 UPDATE public.sao_gifts SET reserved=reserved+1 WHERE id=_gift;
 INSERT INTO public.sao_redemptions(id,user_id,gift_id,gift_name,price) VALUES(_request,auth.uid(),g.id,g.name,g.price);
 RETURN _request;
END $$;
CREATE FUNCTION public.sao_redemption_decide(_id uuid,_status text,_reason text DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r public.sao_redemptions; b bigint;
BEGIN
 SELECT * INTO r FROM public.sao_redemptions WHERE id=_id FOR UPDATE;
 IF r.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy yêu cầu'; END IF;
 IF NOT (private.sig_can(auth.uid(),'sao.shop_manage') OR (r.user_id=auth.uid() AND private.is_active(auth.uid()) AND _status='cancelled')) THEN RAISE EXCEPTION 'Không có quyền xử lý'; END IF;
 IF _status NOT IN ('fulfilled','cancelled') OR _status IS NULL THEN RAISE EXCEPTION 'Trạng thái không hợp lệ'; END IF;
 IF r.status=_status THEN RETURN; END IF;
 IF r.status<>'pending' THEN RAISE EXCEPTION 'Yêu cầu đã được xử lý'; END IF;
 PERFORM 1 FROM public.sao_gifts WHERE id=r.gift_id FOR UPDATE;
 SELECT balance INTO b FROM public.sao_wallets WHERE user_id=r.user_id FOR UPDATE;
 UPDATE public.sao_wallets SET held=held-r.price,balance=balance-CASE WHEN _status='fulfilled' THEN r.price ELSE 0 END WHERE user_id=r.user_id;
 UPDATE public.sao_gifts SET reserved=reserved-1,stock=stock-CASE WHEN _status='fulfilled' THEN 1 ELSE 0 END WHERE id=r.gift_id;
 IF _status='fulfilled' THEN INSERT INTO public.sao_ledger(user_id,amount,source,source_id,reason,actor_id,balance_after) VALUES(r.user_id,-r.price,'redemption',r.id::text,'Đổi quà: '||r.gift_name,auth.uid(),b-r.price); END IF;
 UPDATE public.sao_redemptions SET status=_status,decided_at=now(),decided_by=auth.uid(),reason=nullif(btrim(_reason),'') WHERE id=r.id;
END $$;
CREATE FUNCTION public.sao_celebration_claim() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE result jsonb;
BEGIN
 IF NOT private.is_active(auth.uid()) THEN RAISE EXCEPTION 'Không có quyền'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('sao-celebration:'||auth.uid()::text,0));
 WITH claimed AS (UPDATE public.sao_celebrations SET shown_at=now() WHERE user_id=auth.uid() AND shown_at IS NULL RETURNING ledger_id), rewards AS (SELECT l.amount,l.reason,l.source FROM public.sao_ledger l JOIN claimed c ON c.ledger_id=l.id)
 SELECT jsonb_build_object('stars',coalesce(sum(amount),0),'rewards',coalesce(jsonb_agg(to_jsonb(rewards)),'[]'::jsonb),'balance',coalesce((SELECT balance FROM public.sao_wallets WHERE user_id=auth.uid()),0)) INTO result FROM rewards;
 RETURN result;
END $$;
CREATE FUNCTION private.sao_signal_event() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NEW.status='won' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.assigned_to IS NOT NULL AND NEW.closed_at IS NOT NULL AND NEW.revenue>0 AND NEW.cancelled_at IS NULL THEN
 PERFORM private.sao_award(NEW.assigned_to,'signal',NEW.id::text,now(),'Chốt thành công tín hiệu: '||NEW.customer_name); END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER sao_signal_reward AFTER UPDATE ON public.opportunity_signals FOR EACH ROW EXECUTE FUNCTION private.sao_signal_event();
CREATE FUNCTION private.sao_task_event() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h jsonb; uid uuid; matches integer;
BEGIN
 IF OLD.data->>'status'<>'Chờ xác nhận' OR NEW.data->>'status'<>'Hoàn thành' OR NEW.is_demo OR NOT private.sig_can(auth.uid(),'task.approve_completion') THEN RETURN NEW; END IF;
 IF NEW.data->>'assignee' IS DISTINCT FROM OLD.data->>'assignee' OR NEW.data->>'submittedAt' IS DISTINCT FROM OLD.data->>'submittedAt' THEN RETURN NEW; END IF;
 IF jsonb_typeof(NEW.data->'history')<>'array' OR jsonb_typeof(OLD.data->'history')<>'array' THEN RETURN NEW; END IF;
 IF jsonb_array_length(NEW.data->'history')<>jsonb_array_length(OLD.data->'history')+1 THEN RETURN NEW; END IF;
 IF (NEW.data->'history')- (jsonb_array_length(NEW.data->'history')-1) IS DISTINCT FROM OLD.data->'history' THEN RETURN NEW; END IF;
 h:=NEW.data->'history'->-1;
 IF h->>'action'<>'Xác nhận hoàn thành' OR h->>'fromStatus'<>'Chờ xác nhận' OR h->>'toStatus'<>'Hoàn thành' OR h->>'byId' IS DISTINCT FROM auth.uid()::text OR coalesce((h->>'forced')::boolean,false) THEN RETURN NEW; END IF;
 SELECT count(*),min(id::text)::uuid INTO matches,uid FROM public.profiles WHERE (id::text=OLD.data->>'assignee' OR full_name=OLD.data->>'assignee') AND status='Đang hoạt động';
 IF matches<>1 THEN RETURN NEW; END IF;
 INSERT INTO public.sao_task_approvals(task_id,user_id,approved_by,submitted_at,brand_id) VALUES(NEW.id,uid,auth.uid(),(OLD.data->>'submittedAt')::timestamptz,OLD.data->>'brandId') ON CONFLICT DO NOTHING;
 PERFORM private.sao_award(uid,'task',NEW.id,now(),'Công việc được xác nhận hoàn thành: '||coalesce(NEW.data->>'title','Task'));
 RETURN NEW;
END $$;
CREATE TRIGGER sao_task_reward AFTER UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION private.sao_task_event();
CREATE FUNCTION private.sao_kpi_event() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p public.employee_kpi_periods; it public.employee_kpi_items; actual numeric; ids jsonb;
BEGIN
 IF NOT private.sig_can(auth.uid(),'kpi.period_manage') OR NEW.locked_by IS DISTINCT FROM auth.uid() THEN RETURN NEW; END IF;
 SELECT * INTO p FROM public.employee_kpi_periods WHERE id=NEW.kpi_period_id;
 IF p.status NOT IN ('locked','closed') THEN RETURN NEW; END IF;
 FOR it IN SELECT * FROM public.employee_kpi_items WHERE kpi_period_id=p.id AND metric_key IN ('task_completed','custom_task_result') AND target_value>0 LOOP
 ids:=coalesce(it.metadata->'taskIds','[]'::jsonb);
 SELECT count(*) INTO actual FROM public.sao_task_approvals a JOIN public.tasks t ON t.id=a.task_id WHERE a.user_id=p.user_id AND t.data->>'status'='Hoàn thành' AND (a.submitted_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date BETWEEN p.period_start AND coalesce((it.metadata->>'deadline')::date,p.period_end) AND (it.brand_id IS NULL OR a.brand_id=it.brand_id) AND (it.metric_key='task_completed' OR ids ? a.task_id);
 IF actual>=it.target_value AND it.metadata->>'lockedAchieved'='true' THEN PERFORM private.sao_award(p.user_id,'kpi',it.id::text,now(),'Hoàn thành KPI đã khóa kỳ: '||coalesce(it.label,it.metric_key)); END IF;
 END LOOP;
 RETURN NEW;
END $$;
CREATE TRIGGER sao_kpi_reward AFTER INSERT ON public.employee_kpi_snapshots FOR EACH ROW EXECUTE FUNCTION private.sao_kpi_event();
REVOKE ALL ON FUNCTION private.sao_credit(uuid,integer,text,text,uuid,text,uuid),private.sao_award(uuid,text,text,timestamptz,text),private.sao_signal_event(),private.sao_task_event(),private.sao_kpi_event() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.sao_rule_save(text,integer,boolean),public.sao_gift_save(uuid,text,text,integer,integer,boolean),public.sao_manual_grant(uuid,integer,text,uuid),public.sao_redeem(uuid,uuid),public.sao_redemption_decide(uuid,text,text),public.sao_celebration_claim() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.sao_rule_save(text,integer,boolean),public.sao_gift_save(uuid,text,text,integer,integer,boolean),public.sao_manual_grant(uuid,integer,text,uuid),public.sao_redeem(uuid,uuid),public.sao_redemption_decide(uuid,text,text),public.sao_celebration_claim() TO authenticated;
COMMENT ON FUNCTION private.sao_kpi_event() IS 'MVP: verifies only task_completed/custom_task_result from authoritative new task approvals, never client lockedActual or other metrics. No historical task backfill.';