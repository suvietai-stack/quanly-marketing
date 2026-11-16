-- Live visitor presence for existing Web Chat conversations. Additive and private.
-- Every browser tab owns one ephemeral session. An old WordPress plugin simply shows "Đã rời".
BEGIN;
CREATE TABLE IF NOT EXISTS public.wc_presence_sessions (
  conversation_id uuid NOT NULL REFERENCES public.wc_conversations(id) ON DELETE CASCADE,
  session_id uuid NOT NULL,
  chat_open boolean NOT NULL DEFAULT false,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  left_at timestamptz,
  PRIMARY KEY(conversation_id,session_id)
);
ALTER TABLE public.wc_presence_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.wc_presence_sessions FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.wc_presence_sessions TO service_role;

CREATE OR REPLACE FUNCTION public.wc_presence_ping(
  p_site uuid, p_hash text, p_session uuid, p_chat_open boolean, p_leaving boolean DEFAULT false
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE v_conversation uuid;
BEGIN
  SELECT id INTO v_conversation FROM public.wc_conversations
    WHERE site_id=p_site AND visitor_hash=p_hash;
  -- A website visit alone must never create an empty conversation.
  IF v_conversation IS NULL THEN RETURN false; END IF;
  INSERT INTO public.wc_presence_sessions(conversation_id,session_id,chat_open,last_seen_at,left_at)
    VALUES(v_conversation,p_session,p_chat_open AND NOT p_leaving,now(),CASE WHEN p_leaving THEN now() ELSE NULL END)
    ON CONFLICT(conversation_id,session_id) DO UPDATE SET
      chat_open=excluded.chat_open,
      last_seen_at=excluded.last_seen_at,
      left_at=excluded.left_at;
  -- Reclaim only stale sessions for this particular conversation.
  DELETE FROM public.wc_presence_sessions
    WHERE conversation_id=v_conversation AND last_seen_at<now()-interval '7 days';
  RETURN true;
END $;

CREATE OR REPLACE FUNCTION public.wc_presence_summary(p_conversations uuid[])
RETURNS TABLE(conversation_id uuid,presence text,last_seen_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,public AS $$
  SELECT ids.id,
    CASE
      WHEN bool_or(p.left_at IS NULL AND p.last_seen_at>now()-interval '45 seconds' AND p.chat_open) THEN 'chat'
      WHEN bool_or(p.left_at IS NULL AND p.last_seen_at>now()-interval '45 seconds') THEN 'website'
      ELSE 'offline'
    END AS presence,
    max(p.last_seen_at) AS last_seen_at
  FROM unnest(coalesce(p_conversations,ARRAY[]::uuid[])) ids(id)
  LEFT JOIN public.wc_presence_sessions p ON p.conversation_id=ids.id
  GROUP BY ids.id;
$$;
REVOKE ALL ON FUNCTION public.wc_presence_ping(uuid,text,uuid,boolean,boolean),public.wc_presence_summary(uuid[]) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.wc_presence_ping(uuid,text,uuid,boolean,boolean),public.wc_presence_summary(uuid[]) TO service_role;
COMMIT;
