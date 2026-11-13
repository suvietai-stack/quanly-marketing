begin;
create or replace function private.fr_executive_approver() returns uuid
language plpgsql stable security definer set search_path = public as $$
declare ids uuid[];
begin
 select array_agg(distinct a.user_id) into ids
 from public.org_assignments a join public.org_titles t on t.id=a.title_id
 join public.profiles p on p.id=a.user_id
 where a.category='appointment' and a.status='active' and a.starts_at <= now()
 and (a.ends_at is null or a.ends_at > now())
 and t.code='executive_director' and t.active
 and p.status = 'Đang hoạt động';
 if coalesce(cardinality(ids),0) <> 1 then
 raise exception 'Cần bổ nhiệm duy nhất một Giám đốc điều hành đang hoạt động để nhận duyệt đề nghị.';
 end if;
 return ids[1];
end $$;
revoke all on function private.fr_executive_approver() from public, anon, authenticated;
CREATE OR REPLACE FUNCTION public.fr_submit(_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _uid uuid := auth.uid(); _req public.fr_requests; _cfg public.fr_settings;
  _step jsonb; _n int := 0; _open int;
BEGIN
  IF NOT private.is_active(_uid) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;
  SELECT * INTO _req FROM public.fr_requests WHERE id = _id FOR UPDATE;
  IF _req.id IS NULL OR _req.requester_id <> _uid THEN RAISE EXCEPTION 'Không tìm thấy đề nghị của bạn.'; END IF;
  IF _req.status NOT IN ('draft','info_requested','needs_config') THEN RAISE EXCEPTION 'Đề nghị đã được gửi hoặc đã xử lý.'; END IF;
  SELECT * INTO _cfg FROM public.fr_settings WHERE kind = _req.kind;

  IF _req.kind = 'payment'
     AND NOT EXISTS (SELECT 1 FROM public.fr_request_lines l WHERE l.request_id = _req.id)
     AND length(trim(coalesce(_req.detail,''))) = 0 THEN
    RAISE EXCEPTION 'Vui lòng nhập ít nhất một khoản chi hợp lệ.';
  END IF;

  IF _req.kind = 'salary_advance' THEN
    IF coalesce((_cfg.limits->>'require_reason')::boolean, false) AND length(trim(_req.title)) = 0 THEN
      RAISE EXCEPTION 'Vui lòng nhập lý do tạm ứng.'; END IF;
    IF nullif(_cfg.limits->>'max_amount','') IS NOT NULL AND _req.amount > (_cfg.limits->>'max_amount')::numeric THEN
      RAISE EXCEPTION 'Số tiền vượt mức tối đa mỗi lần cho phép.'; END IF;
    IF nullif(_cfg.limits->>'max_per_period','') IS NOT NULL THEN
      SELECT count(*) INTO _open FROM public.fr_requests
      WHERE kind = 'salary_advance' AND requester_id = _uid AND salary_period = _req.salary_period
        AND status NOT IN ('draft','cancelled','rejected') AND id <> _req.id;
      IF _open >= (_cfg.limits->>'max_per_period')::int THEN
        RAISE EXCEPTION 'Bạn đã đạt số lượt đề nghị tối đa trong kỳ lương này.'; END IF;
    END IF;
    IF coalesce((_cfg.limits->>'block_open')::boolean, false) AND EXISTS (
      SELECT 1 FROM public.fr_requests WHERE kind = 'salary_advance' AND requester_id = _uid
        AND status IN ('pending','info_requested','approved','awaiting_payment','paid') AND id <> _req.id) THEN
      RAISE EXCEPTION 'Bạn còn đề nghị tạm ứng lương chưa tất toán.';
    END IF;
  END IF;

  DELETE FROM public.fr_steps WHERE request_id = _id;
  FOR _step IN SELECT value FROM jsonb_array_elements(coalesce(_cfg.flow,'[]'::jsonb)) LOOP
    IF _step->>'position' = 'executive_director' THEN
      _step := jsonb_build_object('label', coalesce(nullif(_step->>'label',''), 'Giám đốc điều hành'), 'user_id', private.fr_executive_approver());
    ELSIF nullif(_step->>'position','') IS NOT NULL THEN
      RAISE EXCEPTION 'Chức danh duyệt chưa được hỗ trợ.';
    END IF;
    IF nullif(_step->>'user_id','') IS NOT NULL OR nullif(_step->>'perm','') IS NOT NULL THEN
      _n := _n + 1;
      INSERT INTO public.fr_steps(request_id, step_no, label, approver_id, perm)
      VALUES (_id, _n, coalesce(nullif(_step->>'label',''), 'Cấp duyệt ' || _n), nullif(_step->>'user_id','')::uuid, nullif(_step->>'perm',''));
    END IF;
  END LOOP;

  IF _n = 0 THEN
    UPDATE public.fr_requests SET status = 'needs_config', current_step = 0, updated_at = now() WHERE id = _id;
    PERFORM private.fr_event(_id, _uid, 'needs_config', NULL);
    PERFORM private.fr_notify_perm(private.fr_perm(_req.kind,'settings'), 'fr_pending', _id, 'fr_needcfg:' || _id::text,
      jsonb_build_object('code', _req.code, 'title', _req.title, 'amount', _req.amount, 'kind', _req.kind));
    RETURN 'needs_config';
  END IF;

  UPDATE public.fr_requests SET status = 'pending', current_step = 1, submitted_at = now(), updated_at = now() WHERE id = _id;
  PERFORM private.fr_event(_id, _uid, 'submit', jsonb_build_object('steps', _n));
  PERFORM private.fr_notify_step(_id, 1, 'fr_pending');
  RETURN 'pending';
END $function$
;
update public.fr_settings set flow='[{"label":"Giám đốc điều hành","position":"executive_director"}]'::jsonb, updated_at=now()
where kind in ('advance','payment','salary_advance') and flow='[]'::jsonb;
commit;

