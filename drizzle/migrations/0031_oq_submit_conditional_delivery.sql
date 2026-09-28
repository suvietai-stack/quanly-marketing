DO $mig$
DECLARE d text;
BEGIN
  d := pg_get_functiondef('public.oq_submit(uuid)'::regprocedure);
  IF position('Thiếu địa điểm giao hàng.' in d) = 0 THEN RAISE EXCEPTION 'oq_submit body not as expected'; END IF;
  d := replace(d, $r$IF coalesce(trim(r.delivery_place),'') = '' THEN RAISE EXCEPTION 'Thiếu địa điểm giao hàng.'; END IF;$r$,
    $r$IF r.want_price AND coalesce(trim(r.delivery_place),'') = '' AND (coalesce(r.draft_config->'price'->>'shipping_mode','per_item') = 'common'
     OR EXISTS (SELECT 1 FROM public.oq_items i WHERE i.request_id = _id AND coalesce((r.draft_config->'price'->'items'->(i.id::text)->'shipping'->>'on')::boolean,false))) THEN
    RAISE EXCEPTION 'Vui lòng bổ sung địa điểm giao hàng để Cung ứng báo giá vận chuyển.'; END IF;$r$);
  d := replace(d, $r$IF r.delivery_date IS NULL THEN RAISE EXCEPTION 'Thiếu ngày khách yêu cầu giao.'; END IF;$r$,
    $r$IF r.want_progress AND r.delivery_date IS NULL THEN RAISE EXCEPTION 'Vui lòng bổ sung ngày khách cần nhận hàng để Cung ứng kiểm tra khả năng đáp ứng.'; END IF;$r$);
  IF position('Thiếu ngày khách' in d) > 0 OR position('Thiếu địa điểm' in d) > 0 THEN RAISE EXCEPTION 'replace failed'; END IF;
  EXECUTE d;
END $mig$;