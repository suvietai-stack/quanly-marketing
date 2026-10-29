CREATE TABLE public.fin_reminder_config (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  enabled boolean NOT NULL DEFAULT true,
  interval_min integer NOT NULL DEFAULT 30 CHECK (interval_min BETWEEN 5 AND 240),
  start_hour integer NOT NULL DEFAULT 8 CHECK (start_hour BETWEEN 0 AND 23),
  end_hour integer NOT NULL DEFAULT 17 CHECK (end_hour BETWEEN 1 AND 24),
  workdays integer[] NOT NULL DEFAULT '{1,2,3,4,5,6}',
  max_auto integer NOT NULL DEFAULT 5 CHECK (max_auto BETWEEN 1 AND 10),
  active_from timestamptz NOT NULL DEFAULT now(),
  manual_cooldown_min integer NOT NULL DEFAULT 10,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_hour > start_hour)
);
INSERT INTO public.fin_reminder_config (id) VALUES (1);
GRANT SELECT ON public.fin_reminder_config TO authenticated;
GRANT ALL ON public.fin_reminder_config TO service_role;
ALTER TABLE public.fin_reminder_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY fin_reminder_config_read ON public.fin_reminder_config FOR SELECT TO authenticated USING (public.is_active(auth.uid()));

CREATE TABLE public.fin_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_id uuid NOT NULL REFERENCES public.bank_transactions(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('auto','manual')),
  seq integer,
  status text NOT NULL DEFAULT 'sending' CHECK (status IN ('sending','sent','failed','unknown')),
  sent_by uuid,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  CHECK ((kind = 'auto') = (seq IS NOT NULL))
);
CREATE UNIQUE INDEX fin_reminders_auto_once ON public.fin_reminders (tx_id, seq) WHERE kind = 'auto' AND status IN ('sending','sent','unknown');
CREATE INDEX fin_reminders_tx ON public.fin_reminders (tx_id, created_at DESC);
GRANT SELECT ON public.fin_reminders TO authenticated;
GRANT ALL ON public.fin_reminders TO service_role;
ALTER TABLE public.fin_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY fin_reminders_read ON public.fin_reminders FOR SELECT TO authenticated USING (private.fin_can_see(auth.uid(), tx_id));

CREATE OR REPLACE FUNCTION public.fin_remind_can()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT auth.uid() IS NOT NULL AND public.is_active(auth.uid()) AND public.has_permission(auth.uid(), 'finance.incoming.remind')
$$;
REVOKE ALL ON FUNCTION public.fin_remind_can() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fin_remind_can() TO authenticated;

CREATE OR REPLACE FUNCTION public.fin_remind_manual_claim(_tx uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t record; cd integer; rid uuid;
BEGIN
  IF NOT public.fin_remind_can() THEN RAISE EXCEPTION 'Bạn không có quyền nhắc xác nhận'; END IF;
  IF NOT private.fin_can_see(auth.uid(), _tx) THEN RAISE EXCEPTION 'Không tìm thấy khoản tiền'; END IF;
  SELECT * INTO t FROM public.bank_transactions WHERE id = _tx FOR UPDATE;
  IF t.id IS NULL OR t.cancelled_at IS NOT NULL OR t.operation_test OR t.confirmation_status <> 'unclaimed' THEN
    RAISE EXCEPTION 'Khoản tiền không còn chờ xác nhận';
  END IF;
  SELECT manual_cooldown_min INTO cd FROM public.fin_reminder_config WHERE id = 1;
  IF EXISTS (SELECT 1 FROM public.fin_reminders WHERE tx_id = _tx AND kind = 'manual' AND status <> 'failed'
             AND created_at > now() - make_interval(mins => coalesce(cd, 10))) THEN
    RAISE EXCEPTION 'Khoản này vừa được nhắc, vui lòng đợi % phút giữa hai lần nhắc', coalesce(cd, 10);
  END IF;
  INSERT INTO public.fin_reminders (tx_id, kind, sent_by) VALUES (_tx, 'manual', auth.uid()) RETURNING id INTO rid;
  RETURN rid;
END $$;
REVOKE ALL ON FUNCTION public.fin_remind_manual_claim(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fin_remind_manual_claim(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.fin_reminder_config_save(_enabled boolean, _interval integer, _start integer, _end integer, _days integer[], _max integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.fin_gmf_can_manage() THEN RAISE EXCEPTION 'Bạn không có quyền cài đặt Tiền Về'; END IF;
  IF _days IS NULL OR cardinality(_days) = 0 OR EXISTS (SELECT 1 FROM unnest(_days) d WHERE d < 0 OR d > 6) THEN
    RAISE EXCEPTION 'Chọn ít nhất một ngày làm việc hợp lệ';
  END IF;
  UPDATE public.fin_reminder_config SET enabled = _enabled, interval_min = _interval, start_hour = _start, end_hour = _end,
    workdays = (SELECT array_agg(DISTINCT d ORDER BY d) FROM unnest(_days) d), max_auto = _max, updated_by = auth.uid(), updated_at = now()
  WHERE id = 1;
END $$;
REVOKE ALL ON FUNCTION public.fin_reminder_config_save(boolean, integer, integer, integer, integer[], integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fin_reminder_config_save(boolean, integer, integer, integer, integer[], integer) TO authenticated;

UPDATE public.app_roles SET permissions = array_append(permissions, 'finance.incoming.remind')
WHERE NOT ('finance.incoming.remind' = ANY(permissions))
  AND permissions && ARRAY['finance.incoming.manage','finance.incoming.reconcile','finance.incoming.gmf_config']::text[];