ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS leave_request_id uuid REFERENCES public.leave_requests(id) ON DELETE CASCADE;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_kind_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_kind_check CHECK (kind = ANY (ARRAY['signal_new','signal_assigned','signal_care','leave_pending','leave_result','leave_cancel_request','leave_remind']));
CREATE INDEX IF NOT EXISTS notifications_leave_idx ON public.notifications(leave_request_id);

CREATE OR REPLACE FUNCTION public.leave_notify() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.leave_requests;
BEGIN
  SELECT * INTO r FROM public.leave_requests WHERE id = NEW.request_id;
  IF NOT FOUND THEN RETURN NEW; END IF;
  IF NEW.action IN ('submit','resubmit','reassign') AND r.approver_id IS NOT NULL THEN
    INSERT INTO public.notifications(recipient_id, kind, leave_request_id, payload, dedup_key)
    VALUES (r.approver_id, 'leave_pending', r.id, jsonb_build_object('action', NEW.action), 'leave:'||NEW.id||':'||r.approver_id)
    ON CONFLICT (dedup_key) DO NOTHING;
  END IF;
  IF NEW.action = 'submit' AND r.created_by <> r.owner_id THEN
    INSERT INTO public.notifications(recipient_id, kind, leave_request_id, payload, dedup_key)
    VALUES (r.owner_id, 'leave_result', r.id, jsonb_build_object('action', 'created_for'), 'leave:'||NEW.id||':'||r.owner_id)
    ON CONFLICT (dedup_key) DO NOTHING;
  END IF;
  IF NEW.action IN ('approve','reject','cancel_approve','cancel_reject','exception') AND NEW.actor_id IS DISTINCT FROM r.owner_id THEN
    INSERT INTO public.notifications(recipient_id, kind, leave_request_id, payload, dedup_key)
    VALUES (r.owner_id, 'leave_result', r.id, jsonb_build_object('action', NEW.action), 'leave:'||NEW.id||':'||r.owner_id)
    ON CONFLICT (dedup_key) DO NOTHING;
  END IF;
  IF NEW.action = 'cancel_request' AND r.approver_id IS NOT NULL THEN
    INSERT INTO public.notifications(recipient_id, kind, leave_request_id, payload, dedup_key)
    VALUES (r.approver_id, 'leave_cancel_request', r.id, jsonb_build_object('action', NEW.action), 'leave:'||NEW.id||':'||r.approver_id)
    ON CONFLICT (dedup_key) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.leave_notify() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS leave_events_notify ON public.leave_request_events;
CREATE TRIGGER leave_events_notify AFTER INSERT ON public.leave_request_events
FOR EACH ROW EXECUTE FUNCTION public.leave_notify();