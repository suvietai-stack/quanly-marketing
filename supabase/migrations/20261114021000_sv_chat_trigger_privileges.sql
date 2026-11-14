-- Defense in depth. Trigger-only function must not advertise callable
-- EXECUTE privileges to anonymous or normal users.
-- PostgreSQL still invokes it from the sv_chat_messages INSERT trigger.
REVOKE ALL ON FUNCTION public.sv_chat_touch_thread()
  FROM PUBLIC, anon, authenticated;
