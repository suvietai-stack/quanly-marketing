ALTER TABLE public.notifications DROP CONSTRAINT notifications_kind_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_kind_check CHECK (kind = ANY (ARRAY['signal_new','signal_assigned','signal_care','leave_pending','leave_result','leave_cancel_request','leave_remind','leave_cc']));

CREATE OR REPLACE FUNCTION public.leave_notify()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE r public.leave_requests; cc jsonb; _owner text; _actor text;
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
  -- CC sau khi phê duyệt: chỉ cho sự kiện mới phát sinh, không gửi bù
  IF NEW.action IN ('approve','cancel_approve') THEN
    SELECT data->'notify'->'cc' INTO cc FROM public.leave_settings WHERE id = 1;
    IF cc IS NOT NULL AND coalesce((cc->>'enabled')::boolean,false)
       AND ((NEW.action='approve' AND coalesce((cc->>'on_approve')::boolean,false))
         OR (NEW.action='cancel_approve' AND coalesce((cc->>'on_cancel')::boolean,false))) THEN
      SELECT full_name INTO _owner FROM public.profiles WHERE id = r.owner_id;
      SELECT full_name INTO _actor FROM public.profiles WHERE id = NEW.actor_id;
      INSERT INTO public.notifications(recipient_id, kind, leave_request_id, payload, dedup_key)
      SELECT u.uid, 'leave_cc', r.id,
        jsonb_build_object('action', NEW.action, 'owner_name', _owner, 'approver_name', _actor, 'type', r.type, 'payload', r.payload, 'calc', r.calc),
        'leave:'||NEW.id||':'||u.uid
      FROM (
        SELECT ur.user_id AS uid FROM public.user_roles ur
          WHERE ur.role_id IN (SELECT jsonb_array_elements_text(coalesce(cc->'role_ids','[]'::jsonb)))
        UNION
        SELECT x::uuid FROM jsonb_array_elements_text(coalesce(cc->'user_ids','[]'::jsonb)) x
      ) u
      WHERE u.uid <> r.owner_id AND u.uid IS DISTINCT FROM NEW.actor_id AND public.is_active(u.uid)
      ON CONFLICT (dedup_key) DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END $function$;

CREATE OR REPLACE FUNCTION public.leave_zalo_wake()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _tok text;
BEGIN
  IF NEW.kind NOT IN ('leave_pending','leave_result','leave_cancel_request','leave_cc') THEN RETURN NEW; END IF;
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