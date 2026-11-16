-- Nhóm Nhân sự: a worker must leave pending BEFORE calling the Zalo API.
-- Incrementing attempts while still pending permitted overlapping sends (up to 3).
-- 'sending' is a one-way claim, never automatically re-queued on timeout:
-- a timed-out Zalo request may already have delivered its message.
ALTER TABLE public.leave_zalo_group_events
  ADD COLUMN IF NOT EXISTS started_at timestamptz;
ALTER TABLE public.leave_zalo_group_events
  DROP CONSTRAINT IF EXISTS leave_zalo_group_events_status_check,
  ADD CONSTRAINT leave_zalo_group_events_status_check
    CHECK (status IN ('pending','sending','sent','failed','unknown','skipped'));
