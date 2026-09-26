CREATE TABLE public.attendance_explanations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  work_date date NOT NULL,
  kind text NOT NULL CHECK (kind IN ('in','out','both')),
  time_in text,
  time_out text,
  reason_id text NOT NULL,
  reason_name text NOT NULL,
  detail text,
  witness_id uuid NOT NULL,
  witness_status text NOT NULL DEFAULT 'pending' CHECK (witness_status IN ('pending','confirmed','unable')),
  witness_at timestamptz,
  witness_note text,
  reconciled boolean NOT NULL DEFAULT false,
  reconciled_by uuid,
  reconciled_at timestamptz,
  reconcile_note text,
  recalled boolean NOT NULL DEFAULT false,
  recalled_at timestamptz,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX att_owner_idx ON public.attendance_explanations(owner_id);
CREATE INDEX att_witness_idx ON public.attendance_explanations(witness_id);
CREATE INDEX att_date_idx ON public.attendance_explanations(work_date);

CREATE TABLE public.attendance_explanation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  explanation_id uuid NOT NULL REFERENCES public.attendance_explanations(id) ON DELETE CASCADE,
  actor_id uuid,
  action text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX att_ev_idx ON public.attendance_explanation_events(explanation_id);

GRANT SELECT ON public.attendance_explanations TO authenticated;
GRANT SELECT ON public.attendance_explanation_events TO authenticated;
GRANT ALL ON public.attendance_explanations TO service_role;
GRANT ALL ON public.attendance_explanation_events TO service_role;
ALTER TABLE public.attendance_explanations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_explanation_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION private.att_can_view(_uid uuid, a public.attendance_explanations) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (a.owner_id = _uid AND private.sig_can(_uid,'att.view_own'))
      OR (a.witness_id = _uid AND private.sig_can(_uid,'att.witness'))
      OR private.sig_can(_uid,'att.view_all') OR private.sig_can(_uid,'att.reconcile') OR private.sig_can(_uid,'att.manage')
$$;
GRANT EXECUTE ON FUNCTION private.att_can_view(uuid, public.attendance_explanations) TO authenticated;

CREATE POLICY att_read ON public.attendance_explanations FOR SELECT TO authenticated
USING (private.att_can_view(auth.uid(), attendance_explanations));
CREATE POLICY att_ev_read ON public.attendance_explanation_events FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.attendance_explanations a WHERE a.id = explanation_id AND private.att_can_view(auth.uid(), a)));

ALTER TABLE public.notifications ADD COLUMN attendance_id uuid REFERENCES public.attendance_explanations(id) ON DELETE CASCADE;
ALTER TABLE public.notifications DROP CONSTRAINT notifications_kind_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_kind_check CHECK (kind = ANY (ARRAY['signal_new','signal_assigned','signal_care','leave_pending','leave_result','leave_cancel_request','leave_remind','leave_cc','att_witness','att_new','att_result','att_changed','att_submitted']));

-- Validation helper
CREATE OR REPLACE FUNCTION private.att_check(_kind text, _in text, _out text, _reason text, _detail text, _witness uuid, _owner uuid) RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  IF _kind NOT IN ('in','out','both') THEN RAISE EXCEPTION 'Nội dung giải trình không hợp lệ'; END IF;
  IF _kind IN ('in','both') AND (_in IS NULL OR _in !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$') THEN RAISE EXCEPTION 'Vui lòng nhập Giờ vào hợp lệ'; END IF;
  IF _kind IN ('out','both') AND (_out IS NULL OR _out !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$') THEN RAISE EXCEPTION 'Vui lòng nhập Giờ ra hợp lệ'; END IF;
  IF _kind = 'both' AND _out <= _in THEN RAISE EXCEPTION 'Giờ ra phải sau Giờ vào'; END IF;
  IF _reason = 'other' AND coalesce(btrim(_detail),'') = '' THEN RAISE EXCEPTION 'Chọn Lý do khác thì bắt buộc nhập chi tiết giải trình'; END IF;
  IF _witness IS NULL THEN RAISE EXCEPTION 'Vui lòng chọn người làm chứng'; END IF;
  IF _witness = _owner THEN RAISE EXCEPTION 'Không thể tự làm chứng cho chính mình'; END IF;
  IF NOT public.is_active(_witness) THEN RAISE EXCEPTION 'Người làm chứng không còn hoạt động'; END IF;
END $$;

CREATE OR REPLACE FUNCTION private.att_reason_name(_id text) RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(
    (SELECT r->>'name' FROM public.leave_settings s, jsonb_array_elements(coalesce(s.data->'attendance'->'reasons','[]'::jsonb)) r WHERE s.id=1 AND r->>'id'=_id LIMIT 1),
    CASE _id WHEN 'forgot' THEN 'Quên thao tác' WHEN 'device' THEN 'Thiết bị chấm công gặp sự cố' WHEN 'network' THEN 'Sự cố kết nối' WHEN 'outside' THEN 'Công tác bên ngoài' WHEN 'other' THEN 'Lý do khác' END)
$$;

CREATE OR REPLACE FUNCTION public.att_submit(_date date, _kind text, _in text, _out text, _reason_id text, _detail text, _witness uuid) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid; _rn text; _uid uuid := auth.uid();
BEGIN
  IF NOT private.sig_can(_uid,'att.create') THEN RAISE EXCEPTION 'Bạn không có quyền tạo giải trình chấm công'; END IF;
  IF _date IS NULL THEN RAISE EXCEPTION 'Vui lòng chọn ngày quên chấm công'; END IF;
  IF _date > (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date THEN RAISE EXCEPTION 'Ngày quên chấm công không được ở tương lai'; END IF;
  PERFORM private.att_check(_kind,_in,_out,_reason_id,_detail,_witness,_uid);
  _rn := private.att_reason_name(_reason_id);
  IF _rn IS NULL THEN RAISE EXCEPTION 'Lý do không hợp lệ'; END IF;
  INSERT INTO public.attendance_explanations(owner_id, work_date, kind, time_in, time_out, reason_id, reason_name, detail, witness_id)
  VALUES (_uid, _date, _kind, CASE WHEN _kind<>'out' THEN _in END, CASE WHEN _kind<>'in' THEN _out END, _reason_id, _rn, nullif(btrim(_detail),''), _witness)
  RETURNING id INTO _id;
  INSERT INTO public.attendance_explanation_events(explanation_id, actor_id, action) VALUES (_id, _uid, 'submit');
  RETURN _id;
END $$;

CREATE OR REPLACE FUNCTION public.att_update(_id uuid, _date date, _kind text, _in text, _out text, _reason_id text, _detail text, _witness uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE a public.attendance_explanations; _rn text; _uid uuid := auth.uid(); _reset boolean; _old jsonb; _new jsonb;
BEGIN
  SELECT * INTO a FROM public.attendance_explanations WHERE id = _id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy giải trình'; END IF;
  IF NOT ((a.owner_id = _uid AND private.sig_can(_uid,'att.edit_own')) OR private.sig_can(_uid,'att.manage')) THEN RAISE EXCEPTION 'Bạn không có quyền sửa giải trình này'; END IF;
  IF a.recalled THEN RAISE EXCEPTION 'Giải trình đã thu hồi'; END IF;
  IF a.reconciled AND NOT private.sig_can(_uid,'att.manage') THEN RAISE EXCEPTION 'Giải trình đã được đối chiếu, vui lòng liên hệ người quản lý giải trình'; END IF;
  IF _date IS NULL OR _date > (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date THEN RAISE EXCEPTION 'Ngày quên chấm công không hợp lệ'; END IF;
  PERFORM private.att_check(_kind,_in,_out,_reason_id,_detail,_witness,a.owner_id);
  _rn := private.att_reason_name(_reason_id);
  IF _rn IS NULL THEN RAISE EXCEPTION 'Lý do không hợp lệ'; END IF;
  IF _kind = 'in' THEN _out := NULL; ELSIF _kind = 'out' THEN _in := NULL; END IF;
  _old := jsonb_build_object('work_date',a.work_date,'kind',a.kind,'time_in',a.time_in,'time_out',a.time_out,'reason_name',a.reason_name,'detail',a.detail,'witness_id',a.witness_id);
  _new := jsonb_build_object('work_date',_date,'kind',_kind,'time_in',_in,'time_out',_out,'reason_name',_rn,'detail',nullif(btrim(_detail),''),'witness_id',_witness);
  IF _old = _new THEN RETURN; END IF;
  _reset := a.witness_status <> 'pending' AND (a.work_date <> _date OR a.kind <> _kind OR a.time_in IS DISTINCT FROM _in OR a.time_out IS DISTINCT FROM _out OR a.witness_id <> _witness);
  IF a.witness_id <> _witness THEN _reset := true; END IF;
  UPDATE public.attendance_explanations SET work_date=_date, kind=_kind, time_in=_in, time_out=_out, reason_id=_reason_id, reason_name=_rn,
    detail=nullif(btrim(_detail),''), witness_id=_witness,
    witness_status = CASE WHEN _reset THEN 'pending' ELSE witness_status END,
    witness_at = CASE WHEN _reset THEN NULL ELSE witness_at END,
    witness_note = CASE WHEN _reset THEN NULL ELSE witness_note END,
    updated_at = now() WHERE id = _id;
  INSERT INTO public.attendance_explanation_events(explanation_id, actor_id, action, detail)
  VALUES (_id, _uid, 'edit', jsonb_build_object('old',_old,'new',_new,'witness_reset',coalesce(_reset,false),
    'important', (a.work_date <> _date OR a.kind <> _kind OR a.time_in IS DISTINCT FROM _in OR a.time_out IS DISTINCT FROM _out OR a.witness_id <> _witness)));
END $$;

CREATE OR REPLACE FUNCTION public.att_recall(_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE a public.attendance_explanations; _uid uuid := auth.uid();
BEGIN
  SELECT * INTO a FROM public.attendance_explanations WHERE id = _id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy giải trình'; END IF;
  IF NOT ((a.owner_id = _uid AND private.sig_can(_uid,'att.edit_own')) OR private.sig_can(_uid,'att.manage')) THEN RAISE EXCEPTION 'Bạn không có quyền thu hồi giải trình này'; END IF;
  IF a.recalled THEN RAISE EXCEPTION 'Giải trình đã thu hồi'; END IF;
  IF a.reconciled AND NOT private.sig_can(_uid,'att.manage') THEN RAISE EXCEPTION 'Giải trình đã được đối chiếu, không thể tự thu hồi'; END IF;
  UPDATE public.attendance_explanations SET recalled=true, recalled_at=now(), updated_at=now() WHERE id=_id;
  INSERT INTO public.attendance_explanation_events(explanation_id, actor_id, action) VALUES (_id, _uid, 'recall');
END $$;

CREATE OR REPLACE FUNCTION public.att_witness(_id uuid, _confirm boolean, _note text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE a public.attendance_explanations; _uid uuid := auth.uid();
BEGIN
  SELECT * INTO a FROM public.attendance_explanations WHERE id = _id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy giải trình'; END IF;
  IF a.witness_id <> _uid OR NOT private.sig_can(_uid,'att.witness') THEN RAISE EXCEPTION 'Chỉ người làm chứng được chỉ định mới được xác nhận'; END IF;
  IF a.owner_id = _uid THEN RAISE EXCEPTION 'Không thể tự làm chứng cho chính mình'; END IF;
  IF a.recalled THEN RAISE EXCEPTION 'Giải trình đã thu hồi'; END IF;
  IF a.witness_status <> 'pending' THEN RAISE EXCEPTION 'Bạn đã phản hồi giải trình này'; END IF;
  UPDATE public.attendance_explanations SET witness_status = CASE WHEN _confirm THEN 'confirmed' ELSE 'unable' END,
    witness_at = now(), witness_note = nullif(btrim(_note),''), updated_at = now() WHERE id=_id;
  INSERT INTO public.attendance_explanation_events(explanation_id, actor_id, action, detail)
  VALUES (_id, _uid, CASE WHEN _confirm THEN 'witness_confirm' ELSE 'witness_unable' END, jsonb_build_object('note', nullif(btrim(_note),'')));
END $$;

CREATE OR REPLACE FUNCTION public.att_reconcile(_id uuid, _note text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE a public.attendance_explanations; _uid uuid := auth.uid();
BEGIN
  SELECT * INTO a FROM public.attendance_explanations WHERE id = _id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy giải trình'; END IF;
  IF NOT (private.sig_can(_uid,'att.reconcile') OR private.sig_can(_uid,'att.manage')) THEN RAISE EXCEPTION 'Bạn không có quyền đối chiếu giải trình'; END IF;
  IF a.reconciled THEN RAISE EXCEPTION 'Giải trình đã được đối chiếu'; END IF;
  UPDATE public.attendance_explanations SET reconciled=true, reconciled_by=_uid, reconciled_at=now(), reconcile_note=nullif(btrim(_note),''), updated_at=now() WHERE id=_id;
  INSERT INTO public.attendance_explanation_events(explanation_id, actor_id, action, detail) VALUES (_id, _uid, 'reconcile', jsonb_build_object('note', nullif(btrim(_note),'')));
END $$;

CREATE OR REPLACE FUNCTION public.att_note(_id uuid, _note text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE a public.attendance_explanations; _uid uuid := auth.uid();
BEGIN
  SELECT * INTO a FROM public.attendance_explanations WHERE id = _id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy giải trình'; END IF;
  IF NOT (private.sig_can(_uid,'att.reconcile') OR private.sig_can(_uid,'att.manage')) THEN RAISE EXCEPTION 'Bạn không có quyền cập nhật ghi chú đối chiếu'; END IF;
  IF NOT a.reconciled THEN RAISE EXCEPTION 'Giải trình chưa được đối chiếu'; END IF;
  IF a.reconcile_note IS NOT DISTINCT FROM nullif(btrim(_note),'') THEN RETURN; END IF;
  UPDATE public.attendance_explanations SET reconcile_note=nullif(btrim(_note),''), updated_at=now() WHERE id=_id;
  INSERT INTO public.attendance_explanation_events(explanation_id, actor_id, action, detail) VALUES (_id, _uid, 'note', jsonb_build_object('old', a.reconcile_note, 'new', nullif(btrim(_note),'')));
END $$;

CREATE OR REPLACE FUNCTION public.att_witnesses() RETURNS TABLE(id uuid, full_name text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.full_name FROM public.profiles p
  WHERE public.is_active(auth.uid()) AND public.is_active(p.id) AND p.id <> auth.uid() ORDER BY p.full_name
$$;

REVOKE ALL ON FUNCTION public.att_submit(date,text,text,text,text,text,uuid), public.att_update(uuid,date,text,text,text,text,text,uuid),
  public.att_recall(uuid), public.att_witness(uuid,boolean,text), public.att_reconcile(uuid,text), public.att_note(uuid,text), public.att_witnesses() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.att_submit(date,text,text,text,text,text,uuid), public.att_update(uuid,date,text,text,text,text,text,uuid),
  public.att_recall(uuid), public.att_witness(uuid,boolean,text), public.att_reconcile(uuid,text), public.att_note(uuid,text), public.att_witnesses() TO authenticated;

-- Notifications
CREATE OR REPLACE FUNCTION public.att_notify() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE a public.attendance_explanations; cfg jsonb; _owner text; _wit text; _p jsonb;
BEGIN
  SELECT * INTO a FROM public.attendance_explanations WHERE id = NEW.explanation_id;
  IF NOT FOUND THEN RETURN NEW; END IF;
  SELECT full_name INTO _owner FROM public.profiles WHERE id = a.owner_id;
  SELECT full_name INTO _wit FROM public.profiles WHERE id = a.witness_id;
  _p := jsonb_build_object('action',NEW.action,'owner_name',_owner,'witness_name',_wit,'work_date',a.work_date,'kind',a.kind,'time_in',a.time_in,'time_out',a.time_out,'reconciled',a.reconciled);
  IF NEW.action = 'submit' THEN
    INSERT INTO public.notifications(recipient_id, kind, attendance_id, payload, dedup_key)
    VALUES (a.owner_id, 'att_submitted', a.id, _p, 'att:'||NEW.id||':'||a.owner_id) ON CONFLICT (dedup_key) DO NOTHING;
  END IF;
  IF NEW.action = 'submit' OR (NEW.action = 'edit' AND coalesce((NEW.detail->>'witness_reset')::boolean,false)) THEN
    INSERT INTO public.notifications(recipient_id, kind, attendance_id, payload, dedup_key)
    VALUES (a.witness_id, 'att_witness', a.id, _p, 'att:'||NEW.id||':'||a.witness_id) ON CONFLICT (dedup_key) DO NOTHING;
  END IF;
  IF NEW.action IN ('witness_confirm','witness_unable') THEN
    INSERT INTO public.notifications(recipient_id, kind, attendance_id, payload, dedup_key)
    VALUES (a.owner_id, 'att_result', a.id, _p, 'att:'||NEW.id||':'||a.owner_id) ON CONFLICT (dedup_key) DO NOTHING;
  END IF;
  IF NEW.action = 'submit' OR (NEW.action = 'edit' AND coalesce((NEW.detail->>'important')::boolean,false)) THEN
    SELECT data->'attendance'->'notify' INTO cfg FROM public.leave_settings WHERE id = 1;
    IF cfg IS NOT NULL AND coalesce((cfg->>'enabled')::boolean,false) THEN
      INSERT INTO public.notifications(recipient_id, kind, attendance_id, payload, dedup_key)
      SELECT u.uid, CASE WHEN NEW.action='submit' THEN 'att_new' ELSE 'att_changed' END, a.id, _p, 'att:'||NEW.id||':'||u.uid
      FROM (
        SELECT ur.user_id AS uid FROM public.user_roles ur WHERE ur.role_id IN (SELECT jsonb_array_elements_text(coalesce(cfg->'role_ids','[]'::jsonb)))
        UNION SELECT x::uuid FROM jsonb_array_elements_text(coalesce(cfg->'user_ids','[]'::jsonb)) x
      ) u
      WHERE u.uid <> a.owner_id AND u.uid <> a.witness_id AND public.is_active(u.uid)
      ON CONFLICT (dedup_key) DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.att_notify() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER trg_att_notify AFTER INSERT ON public.attendance_explanation_events FOR EACH ROW EXECUTE FUNCTION public.att_notify();

CREATE OR REPLACE FUNCTION public.leave_zalo_wake()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _tok text;
BEGIN
  IF NEW.kind NOT IN ('leave_pending','leave_result','leave_cancel_request','leave_cc','att_witness','att_new') THEN RETURN NEW; END IF;
  SELECT care_cron_token INTO _tok FROM public.zalo_oa_config WHERE id = 1 AND auto_send AND status = 'connected';
  IF _tok IS NULL THEN RETURN NEW; END IF;
  BEGIN
    PERFORM net.http_post(
      url := 'https://base.suviet.vn/api/public/zalo/dispatch-cron',
      headers := jsonb_build_object('Content-Type','application/json','x-care-token', _tok),
      body := '{}'::jsonb);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  RETURN NEW;
END $function$;