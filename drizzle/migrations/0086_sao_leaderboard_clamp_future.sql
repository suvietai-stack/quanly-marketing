CREATE OR REPLACE FUNCTION public.sao_leaderboard(_from timestamptz DEFAULT NULL, _to timestamptz DEFAULT NULL)
RETURNS TABLE(user_id uuid, full_name text, earned bigint, available bigint, rank bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT private.is_active(auth.uid()) THEN
    RAISE EXCEPTION 'Tài khoản chưa hoạt động';
  END IF;
  IF _from IS NOT NULL AND _to IS NOT NULL AND _from >= _to THEN
    RAISE EXCEPTION 'Khoảng thời gian không hợp lệ';
  END IF;
  IF _from IS NOT NULL AND _from > now() THEN
    RAISE EXCEPTION 'Không xem kỳ tương lai';
  END IF;
  -- Current periods end in the future; count only what has happened.
  IF _to IS NULL OR _to > now() THEN
    _to := now();
  END IF;
  RETURN QUERY
  WITH earned AS (
    SELECT l.user_id, GREATEST(SUM(l.amount), 0)::bigint AS stars
    FROM public.sao_ledger l
    WHERE l.source NOT IN ('manual', 'redemption')
      AND (_from IS NULL OR l.created_at >= _from)
      AND l.created_at < _to
    GROUP BY l.user_id
  ),
  ranked AS (
    SELECT p.id, p.full_name,
           COALESCE(e.stars, 0)::bigint AS stars,
           GREATEST(COALESCE(w.balance, 0) - COALESCE(w.held, 0), 0)::bigint AS avail
    FROM public.profiles p
    LEFT JOIN earned e ON e.user_id = p.id
    LEFT JOIN public.sao_wallets w ON w.user_id = p.id
    WHERE private.is_active(p.id)
  )
  SELECT r.id, r.full_name, r.stars, r.avail,
         RANK() OVER (ORDER BY r.stars DESC)
  FROM ranked r
  ORDER BY r.stars DESC, r.full_name ASC;
END;
$$;