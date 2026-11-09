CREATE SEQUENCE IF NOT EXISTS public.fr_code_seq START 1;

CREATE TABLE public.fr_settings (
  kind text PRIMARY KEY CHECK (kind IN ('advance','payment','salary_advance')),
  flow jsonb NOT NULL DEFAULT '[]',
  limits jsonb NOT NULL DEFAULT '{}',
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.fr_settings (kind) VALUES ('advance'), ('payment'), ('salary_advance') ON CONFLICT DO NOTHING;

CREATE TABLE public.fr_payment_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE CHECK (length(trim(name)) BETWEEN 1 AND 200),
  active boolean NOT NULL DEFAULT true,
  sort int NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.fr_payment_types (name, sort) VALUES
  ('Thanh toán nhà cung cấp/đối tác', 1),
  ('Hoàn trả chi phí nhân viên', 2),
  ('Chi phí hoạt động công ty', 3),
  ('Quyết toán/hoàn ứng tạm ứng', 4),
  ('Khác', 5)
ON CONFLICT DO NOTHING;

CREATE TABLE public.fr_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  kind text NOT NULL CHECK (kind IN ('advance','payment','salary_advance')),
  requester_id uuid NOT NULL,
  department_id uuid,
  amount numeric NOT NULL CHECK (amount > 0),
  title text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 300),
  detail text,
  desired_date date,
  payee_name text,
  payee_info text,
  attachments jsonb NOT NULL DEFAULT '[]',
  note text,
  payment_type_id uuid REFERENCES public.fr_payment_types(id),
  advance_id uuid REFERENCES public.fr_requests(id),
  supplier_name text,
  supplier_tax text,
  supplier_bank text,
  invoice_no text,
  salary_period text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','needs_config','pending','info_requested','approved','rejected','awaiting_payment','paid','settling','done','cancelled')),
  current_step int NOT NULL DEFAULT 0,
  request_key text UNIQUE,
  approved_at timestamptz,
  paid_amount numeric NOT NULL DEFAULT 0,
  paid_at timestamptz,
  paid_by uuid,
  pay_method text,
  pay_ref text,
  settled_amount numeric NOT NULL DEFAULT 0,
  deducted_amount numeric NOT NULL DEFAULT 0,
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX fr_requests_requester_idx ON public.fr_requests(requester_id, created_at DESC);
CREATE INDEX fr_requests_kind_status_idx ON public.fr_requests(kind, status);
CREATE INDEX fr_requests_advance_idx ON public.fr_requests(advance_id) WHERE advance_id IS NOT NULL;

CREATE TABLE public.fr_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.fr_requests(id) ON DELETE CASCADE,
  step_no int NOT NULL,
  label text NOT NULL,
  approver_id uuid,
  perm text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','info_requested')),
  comment text,
  decided_by uuid,
  decided_at timestamptz,
  UNIQUE (request_id, step_no)
);
CREATE INDEX fr_steps_request_idx ON public.fr_steps(request_id);

CREATE TABLE public.fr_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.fr_requests(id) ON DELETE CASCADE,
  actor_id uuid,
  action text NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX fr_events_request_idx ON public.fr_events(request_id, created_at);

GRANT SELECT ON public.fr_settings, public.fr_payment_types, public.fr_requests, public.fr_steps, public.fr_events TO authenticated;
GRANT ALL ON public.fr_settings, public.fr_payment_types, public.fr_requests, public.fr_steps, public.fr_events TO service_role;
ALTER TABLE public.fr_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fr_payment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fr_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fr_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fr_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION private.fr_scope_perm(_kind text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE _kind WHEN 'advance' THEN 'fr.advance.view_scope' WHEN 'payment' THEN 'fr.payment.view_scope' ELSE 'fr.salary.view_scope' END;
$$;

CREATE OR REPLACE FUNCTION private.fr_can_view(_uid uuid, _req uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.fr_requests r
    WHERE r.id = _req AND (
      r.requester_id = _uid
      OR private.sig_can(_uid, private.fr_scope_perm(r.kind))
      OR private.sig_can(_uid, CASE r.kind WHEN 'advance' THEN 'fr.advance.pay' WHEN 'payment' THEN 'fr.payment.pay' ELSE 'fr.salary.pay' END)
      OR EXISTS (SELECT 1 FROM public.fr_steps s WHERE s.request_id = r.id AND (s.approver_id = _uid OR (s.approver_id IS NULL AND s.perm IS NOT NULL AND private.sig_can(_uid, s.perm))))
    )
  );
$$;

CREATE POLICY fr_requests_read ON public.fr_requests FOR SELECT TO authenticated USING (private.fr_can_view(auth.uid(), id));
CREATE POLICY fr_steps_read ON public.fr_steps FOR SELECT TO authenticated USING (private.fr_can_view(auth.uid(), request_id));
CREATE POLICY fr_events_read ON public.fr_events FOR SELECT TO authenticated USING (private.fr_can_view(auth.uid(), request_id));
CREATE POLICY fr_types_read ON public.fr_payment_types FOR SELECT TO authenticated USING (true);
CREATE POLICY fr_settings_read ON public.fr_settings FOR SELECT TO authenticated USING (
  private.sig_can(auth.uid(), 'fr.advance.settings') OR private.sig_can(auth.uid(), 'fr.payment.settings') OR private.sig_can(auth.uid(), 'fr.salary.settings')
);

ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS fr_request_id uuid REFERENCES public.fr_requests(id) ON DELETE CASCADE;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_kind_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_kind_check CHECK (kind = ANY (ARRAY[
  'signal_new','signal_assigned','signal_care','leave_pending','leave_result','leave_cancel_request','leave_remind','leave_cc',
  'att_witness','att_new','att_result','att_changed','att_submitted',
  'content_assigned','content_review','content_revise','content_approved','content_published','content_remind',
  'order_new','order_assigned','order_taken','order_review','order_revise','order_approved','order_delivered','order_remind',
  'oq_new','oq_accepted','oq_info','oq_answered','oq_published','oq_done','oq_reask','oq_assigned',
  'ot_reschedule','ot_reschedule_result','fin_pending','fin_needs_info',
  'biz_submitted','biz_approved','biz_returned','biz_deadline','biz_late_request','biz_late_approved','biz_late_rejected','biz_late_expired',
  'fr_pending','fr_approved','fr_rejected','fr_info','fr_awaiting_pay','fr_paid','fr_settle','fr_deducted'
]::text[]));

CREATE OR REPLACE FUNCTION private.fr_notify(_rcpt uuid, _kind text, _req uuid, _key text, _payload jsonb) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.notifications(recipient_id, kind, fr_request_id, dedup_key, payload, zalo_status, push_status)
  SELECT _rcpt, _kind, _req, _key, _payload, 'ineligible', 'none'
  WHERE _rcpt IS NOT NULL AND _rcpt IS DISTINCT FROM auth.uid()
  ON CONFLICT (dedup_key) DO NOTHING;
$$;