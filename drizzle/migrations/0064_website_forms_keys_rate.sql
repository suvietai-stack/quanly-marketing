-- Website Forms: khóa mã hóa phục vụ ký HMAC + bảng đếm tần suất request (rate limit bền vững).

ALTER TABLE public.wf_keys ADD COLUMN key_enc text;

CREATE TABLE public.wf_rate_hits (
  website_id uuid NOT NULL REFERENCES public.wf_websites(id) ON DELETE CASCADE,
  at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX wf_rate_hits_idx ON public.wf_rate_hits (website_id, at);
GRANT ALL ON public.wf_rate_hits TO service_role;
ALTER TABLE public.wf_rate_hits ENABLE ROW LEVEL SECURITY;

-- Đếm + ghi một lượt request, dọn bản ghi cũ; trả số request trong 60 giây gần nhất.
CREATE OR REPLACE FUNCTION public.wf_rate_hit(p_website uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public'
AS $fn$
DECLARE n integer;
BEGIN
  DELETE FROM public.wf_rate_hits WHERE at < now() - interval '10 minutes';
  INSERT INTO public.wf_rate_hits (website_id) VALUES (p_website);
  SELECT count(*) INTO n FROM public.wf_rate_hits WHERE website_id = p_website AND at > now() - interval '1 minute';
  RETURN n;
END
$fn$;
REVOKE ALL ON FUNCTION public.wf_rate_hit(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.wf_rate_hit(uuid) TO service_role;