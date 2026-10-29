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
  IF _to IS NULL OR _to > now() THEN _to := now(); END IF;
  RETURN QUERY
  WITH rewards AS (
    -- Every real reward from any source (programs + manual), excluding
    -- redemptions, test reversals and refunds of a redemption (linked by source_id).
    SELECT l.user_id, l.amount, l.created_at
    FROM public.sao_ledger l
    WHERE l.amount > 0
      AND l.source NOT IN ('redemption', 'test_reversal')
      AND NOT EXISTS (SELECT 1 FROM public.sao_redemptions r WHERE r.id::text = l.source_id)
      -- A reversed reward is cancelled in its own period, whenever the reversal happened.
      AND NOT EXISTS (
        SELECT 1 FROM public.sao_ledger x
        WHERE x.source = 'test_reversal' AND x.user_id = l.user_id
          AND x.source_id = l.source_id AND x.amount = -l.amount)
  ),
  earned AS (
    SELECT w.user_id, SUM(w.amount)::bigint AS stars FROM rewards w
    WHERE (_from IS NULL OR w.created_at >= _from) AND w.created_at < _to
    GROUP BY w.user_id
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
  SELECT r.id, r.full_name, r.stars, r.avail, RANK() OVER (ORDER BY r.stars DESC)
  FROM ranked r ORDER BY r.stars DESC, r.full_name ASC;
END;
$$;