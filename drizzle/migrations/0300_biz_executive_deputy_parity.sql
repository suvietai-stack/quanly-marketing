-- Chuẩn hóa quyền điều hành: Phó Giám đốc Điều hành có cùng quyền nghiệp vụ với Giám đốc Điều hành.
-- Giữ nguyên hai mã chức vụ, không tạo Role trùng, không đổi quyền Giám đốc Hệ/Trưởng Phòng/Trưởng Nhóm/Nhân viên.

CREATE OR REPLACE FUNCTION public.biz_executive_holder(_actor uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
SELECT EXISTS (
  SELECT 1
  FROM public.biz_appointments a
  JOIN public.profiles p ON p.id = a.user_id AND p.status = 'Đang hoạt động'
  WHERE a.user_id = _actor
    AND a.status <> 'cancelled'
    AND a.started_at <= now()
    AND (a.ended_at IS NULL OR a.ended_at > now())
    AND a.position_snapshot->>'code' IN ('executive_director', 'deputy_executive_director')
    AND a.position_snapshot->>'business_policy' = 'executive'
    AND coalesce((a.position_snapshot->>'all_business')::boolean, false)
)
$$;
REVOKE ALL ON FUNCTION public.biz_executive_holder(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.biz_executive_holder(uuid) TO authenticated;

DO $$
DECLARE d text;
BEGIN
  SELECT pg_get_functiondef('public.biz_can(uuid,text)'::regprocedure) INTO d;
  IF position('a.position_snapshot->>''code''=''executive_director''' IN d) = 0 THEN
    RAISE EXCEPTION 'Không khớp nhánh biz.intervene trong biz_can.';
  END IF;
  d := replace(d, 'a.position_snapshot->>''code''=''executive_director''', 'a.position_snapshot->>''code'' IN (''executive_director'',''deputy_executive_director'')');
  EXECUTE d;
END $$;

CREATE OR REPLACE FUNCTION public.biz_run_assigned(_version uuid, _pending boolean DEFAULT false)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
SELECT EXISTS (
  SELECT 1 FROM public.biz_approval_runs r
  WHERE r.version_id = _version
    AND (NOT _pending OR r.status = 'pending')
    AND r.owner_id <> auth.uid()
    AND (
      CASE WHEN _pending
        THEN r.steps->r.current_step->>'user_id' = auth.uid()::text OR r.steps->r.current_step->>'substitute_id' = auth.uid()::text
        ELSE EXISTS (SELECT 1 FROM jsonb_array_elements(r.steps) s WHERE s->>'user_id' = auth.uid()::text OR s->>'substitute_id' = auth.uid()::text)
      END
      OR (
        public.biz_executive_holder(auth.uid())
        AND CASE WHEN _pending
          THEN (r.steps->r.current_step->'position_snapshot'->>'code') IN ('executive_director', 'deputy_executive_director')
          ELSE EXISTS (SELECT 1 FROM jsonb_array_elements(r.steps) s WHERE (s->'position_snapshot'->>'code') IN ('executive_director', 'deputy_executive_director'))
        END
      )
    )
)
$$;

DO $$
DECLARE d text;
BEGIN
  SELECT pg_get_functiondef('public.biz_approval_notify()'::regprocedure) INTO d;
  IF position('id=nullif(r.steps->r.current_step->>''substitute_id'','''')::uuid)))' IN d) = 0 THEN
    RAISE EXCEPTION 'Không khớp vòng lặp thông báo duyệt.';
  END IF;
  d := replace(d,
    'id=nullif(r.steps->r.current_step->>''substitute_id'','''')::uuid)))',
    'id=nullif(r.steps->r.current_step->>''substitute_id'','''')::uuid)) OR (r.status=''pending'' AND id<>r.owner_id AND (r.steps->r.current_step->''position_snapshot''->>''code'') IN (''executive_director'',''deputy_executive_director'') AND public.biz_executive_holder(id)))');
  EXECUTE d;
END $$;