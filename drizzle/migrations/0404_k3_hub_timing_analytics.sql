-- Read-only timing analytics for unified 3K management.
-- Never interpret missing timestamps as disciplinary violations.
-- Historical timestamps only shown to managers who hold current scoped authority.
BEGIN;
SET LOCAL lock_timeout='8s';
SET LOCAL statement_timeout='90s';

CREATE OR REPLACE FUNCTION public.k3hub_timing_read(_start date,_end date,_unit text DEFAULT 'org-company')
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE
  uid uuid := auth.uid();
  today_ date := (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date;
  output_ jsonb;
BEGIN
  IF uid IS NULL OR NOT private.is_active(uid) THEN
    RAISE EXCEPTION 'Cần đăng nhập vào Base.' USING ERRCODE='42501';
  END IF;
  IF _start IS NULL OR _end IS NULL OR _start>_end OR _start<DATE '2020-01-01'
     OR _end>today_ OR _end-_start>30 THEN
    RAISE EXCEPTION 'Chỉ xem tối đa 31 ngày, không vượt ngày hiện tại.';
  END IF;
  IF _unit IS NULL OR NOT EXISTS(
    SELECT 1 FROM public.org_units WHERE id=_unit AND active
  ) THEN
    RAISE EXCEPTION 'Không tìm thấy phạm vi tổ chức.';
  END IF;
  IF _unit='org-company' AND NOT private.k3hub_exec(uid) THEN
    RAISE EXCEPTION 'Không có quyền xem toàn công ty.' USING ERRCODE='42501';
  END IF;
  IF _unit<>'org-company' AND NOT private.k3hub_is_enabled(_unit,today_) THEN
    RAISE EXCEPTION 'Đơn vị không thuộc phạm vi 3K.' USING ERRCODE='42501';
  END IF;

  WITH roster AS (
    SELECT DISTINCT ON (a.user_id,a.unit_id)
      a.user_id,a.unit_id,u.name unit_name,p.full_name,
      b.id block_id,b.name block_name,t.name position
    FROM public.org_assignments a
    JOIN public.profiles p ON p.id=a.user_id AND p.status='Đang hoạt động'
    JOIN public.org_units u ON u.id=a.unit_id AND u.active
    JOIN public.org_titles t ON t.id=a.title_id AND t.active
    JOIN LATERAL (
      SELECT root.id,root.name
      FROM private.k3hub_path(a.unit_id) anc
      JOIN public.org_units root ON root.id=anc.id AND root.kind='block'
      WHERE root.id=ANY(private.k3hub_policy_at(today_))
      LIMIT 1
    ) b ON true
    WHERE a.status='active'
      AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())
      AND (_unit='org-company' OR EXISTS(
        SELECT 1 FROM private.k3hub_path(a.unit_id) anc WHERE anc.id=_unit))
      AND private.k3hub_can_view(uid,a.user_id,a.unit_id,today_)
    ORDER BY a.user_id,a.unit_id,t.kind DESC,t.name
  ),
  roster_days AS (
    SELECT r.*,days.day::date work_date
    FROM roster r CROSS JOIN generate_series(_start::timestamp,_end::timestamp,interval '1 day') AS days(day)
  ),
  daily AS (
    SELECT rd.*,
      d.planned_at legacy_plan_at,d.summarized_at legacy_summary_at,
      d.plan_deadline stored_plan_deadline,d.summary_deadline stored_summary_deadline,
      -- Directly stored creation time on that date, NOT a formal daily-plan confirmation.
      (SELECT min(v.event_at) FROM (
        SELECT g.created_at event_at FROM public.k3_goals g
        WHERE g.user_id=rd.user_id AND g.deleted_at IS NULL
          AND (g.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date=rd.work_date
          AND (g.org_unit_id=rd.unit_id OR
             (g.org_unit_id IS NULL AND g.department_id::text=rd.unit_id))
        UNION ALL
        SELECT a.created_at event_at FROM public.k3_actions a
        JOIN public.k3_goals g ON g.id=a.goal_id AND g.deleted_at IS NULL
        WHERE a.user_id=rd.user_id AND a.deleted_at IS NULL
          AND (a.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date=rd.work_date
          AND (g.org_unit_id=rd.unit_id OR
             (g.org_unit_id IS NULL AND g.department_id::text=rd.unit_id))
      ) v) AS first_work_at,
      -- New summary workflow is person/date, without a unit column. Only attribute
      -- to a unit if the person currently has one distinct active assignment unit.
      CASE WHEN (SELECT COUNT(DISTINCT a2.unit_id)
                 FROM public.org_assignments a2
                 WHERE a2.user_id=rd.user_id AND a2.status='active'
                 AND a2.starts_at<=now() AND (a2.ends_at IS NULL OR a2.ends_at>now()))=1
        THEN (SELECT min(er.confirmed_at) FROM public.k3_employee_reviews er
              WHERE er.user_id=rd.user_id AND er.work_date=rd.work_date)
        ELSE NULL END AS review_at,
      (SELECT COUNT(*) FROM public.org_assignments a2
         WHERE a2.user_id=rd.user_id AND a2.status='active'
         AND a2.starts_at<=now() AND (a2.ends_at IS NULL OR a2.ends_at>now())
         AND a2.unit_id<>rd.unit_id) > 0 AS has_multi_unit
    FROM roster_days rd
    LEFT JOIN public.k3_days d ON d.user_id=rd.user_id AND d.work_date=rd.work_date
      AND (d.org_unit_id=rd.unit_id OR
        (d.org_unit_id IS NULL AND d.department_id::text=rd.unit_id))
  ),
  standardized AS (
    SELECT d.*,
      coalesce(d.stored_plan_deadline,
        ((d.work_date::timestamp+s.plan_by) AT TIME ZONE 'Asia/Ho_Chi_Minh')) plan_due,
      coalesce(d.stored_summary_deadline,
        ((d.work_date::timestamp+s.summary_by) AT TIME ZONE 'Asia/Ho_Chi_Minh')) summary_due,
      coalesce(d.review_at,d.legacy_summary_at) summary_at
    FROM daily d CROSS JOIN public.k3_settings s WHERE s.id
  )
  SELECT jsonb_build_object(
    'start',_start,'end',_end,'unit_id',_unit,'server_now',now(),
    'plan_by',(SELECT plan_by::text FROM public.k3_settings WHERE id),
    'summary_by',(SELECT summary_by::text FROM public.k3_settings WHERE id),
    'rows',coalesce(jsonb_agg(jsonb_build_object(
      'date',x.work_date,'user_id',x.user_id,'full_name',x.full_name,
      'unit_id',x.unit_id,'unit_name',x.unit_name,
      'block_id',x.block_id,'block_name',x.block_name,'position',x.position,
      'planned_at',x.legacy_plan_at,
      'work_created_at',x.first_work_at,
      'summarized_at',x.summary_at,
      'summary_source',CASE WHEN x.review_at IS NOT NULL THEN 'employee_review'
           WHEN x.legacy_summary_at IS NOT NULL THEN 'legacy_summary' ELSE NULL END,
      'plan_deadline',x.plan_due,'summary_deadline',x.summary_due,
      'plan_status',CASE
        WHEN x.legacy_plan_at IS NOT NULL AND x.legacy_plan_at<=x.plan_due THEN 'on_time'
        WHEN x.legacy_plan_at IS NOT NULL THEN 'late'
        WHEN x.first_work_at IS NOT NULL THEN 'work_only'
        ELSE 'no_record' END,
      'summary_status',CASE
        WHEN x.summary_at IS NOT NULL AND x.summary_at<=x.summary_due THEN 'on_time'
        WHEN x.summary_at IS NOT NULL THEN 'late'
        ELSE 'no_record' END,
      'multi_unit',x.has_multi_unit
    ) ORDER BY x.work_date DESC,x.block_name,x.unit_name,x.full_name),'[]'::jsonb)
  ) INTO output_
  FROM standardized x;
  RETURN output_;
END;
$fn$;

REVOKE ALL ON FUNCTION public.k3hub_timing_read(date,date,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.k3hub_timing_read(date,date,text) TO authenticated;
COMMIT;
