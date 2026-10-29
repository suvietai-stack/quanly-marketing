-- Hạn nộp đơn: chấp nhận giá trị lẻ (ví dụ 0.5 giờ) thay vì ép kiểu số nguyên gây lỗi.
CREATE OR REPLACE FUNCTION private.leave_deadline(_type text, _mark timestamptz, _s jsonb) RETURNS timestamptz
LANGUAGE sql IMMUTABLE AS $$
  SELECT _mark - make_interval(secs => CASE _type
    WHEN 'leave' THEN coalesce((_s->'deadlines'->>'leave_hours')::float8, 12) * 3600
    WHEN 'late' THEN coalesce((_s->'deadlines'->>'late_minutes')::float8, 5) * 60
    ELSE coalesce((_s->'deadlines'->>'early_minutes')::float8, 5) * 60 END);
$$;