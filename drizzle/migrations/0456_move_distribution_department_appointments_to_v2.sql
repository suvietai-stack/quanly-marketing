-- Canonical reassignment for Phòng Kinh doanh Phân Phối 1. No guessing:
-- the old per-unit effective Role MUST match the destination V2 Role.
-- The old biz_appointment is ended, never deleted; audit history remains.
-- A new canonical concurrent appointment is opened in the exact standard
-- position. This is idempotent and rejects unexpected legacy positions.
DO $migrate$
DECLARE actor_ uuid; source_count_ integer; matched_ integer;
        changes_ jsonb; preview_ jsonb;
BEGIN
  SELECT id INTO STRICT actor_ FROM public.profiles
  WHERE username='Admin' AND status='Đang hoạt động' AND private.is_super_admin(id);
  PERFORM set_config('request.jwt.claim.sub',actor_::text,true);

  SELECT count(*) INTO source_count_ FROM public.org_assignments a
  JOIN public.org_titles t ON t.id=a.title_id
  WHERE a.unit_id='cef13ee0-73a8-43c4-bfe5-6bef393248fc' AND a.source='biz_appointments'
    AND t.source='biz_positions' AND t.code IN ('employee','department_head','director','team_lead')
    AND a.status='active' AND a.starts_at<=now()
    AND (a.ends_at IS NULL OR a.ends_at>now());
  IF source_count_>3 THEN
    RAISE EXCEPTION 'Unexpected count of old appointments for Phòng Kinh doanh Phân Phối 1: %',source_count_;
  END IF;
  IF source_count_=0 THEN RETURN; END IF;

  WITH map_(old_code,new_title,role_id) AS (
    VALUES ('employee','org-v2-dist1-staff','role-v2-distribution-staff'),
        ('department_head','org-v2-dist1-head','role-v2-distribution-head')
  )
  SELECT count(*) INTO matched_
  FROM public.org_assignments a
  JOIN public.org_titles t ON t.id=a.title_id
  JOIN map_ m ON m.old_code=t.code
  JOIN public.org_position_roles old_role
    ON old_role.unit_id=a.unit_id AND old_role.title_id=a.title_id AND old_role.role_id=m.role_id
  JOIN public.org_position_roles new_role
    ON new_role.unit_id=a.unit_id AND new_role.title_id=m.new_title AND new_role.role_id=m.role_id
  WHERE a.unit_id='cef13ee0-73a8-43c4-bfe5-6bef393248fc' AND a.source='biz_appointments'
    AND a.status='active' AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now());

  IF matched_<>source_count_ THEN
    RAISE EXCEPTION 'Ambiguous old -> V2 mapping for Phòng Kinh doanh Phân Phối 1 (% of %)',
      matched_,source_count_;
  END IF;

  WITH map_(old_code,new_title,role_id) AS (
    VALUES ('employee','org-v2-dist1-staff','role-v2-distribution-staff'),
        ('department_head','org-v2-dist1-head','role-v2-distribution-head')
  ), candidates AS (
    SELECT a.id,a.user_id,a.unit_id,m.new_title
    FROM public.org_assignments a
    JOIN public.org_titles t ON t.id=a.title_id
    JOIN map_ m ON m.old_code=t.code
    WHERE a.unit_id='cef13ee0-73a8-43c4-bfe5-6bef393248fc' AND a.source='biz_appointments'
      AND a.status='active' AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())
  )
  SELECT jsonb_agg(cmd.item ORDER BY a.id,cmd.sequence) INTO changes_
  FROM candidates a
  CROSS JOIN LATERAL (
    VALUES
      (0,jsonb_build_object('action','end',
        'data',jsonb_build_object('id',a.id,'immediate',true))),
      (1,jsonb_build_object('action','assign',
        'data',jsonb_build_object('unit_id',a.unit_id,'title_id',a.new_title,
          'user_id',a.user_id,'kind','concurrent','immediate',true)))
  ) cmd(sequence,item);

  IF jsonb_array_length(changes_)<>2*source_count_ THEN
    RAISE EXCEPTION 'Incomplete migration action set for Phòng Kinh doanh Phân Phối 1';
  END IF;
  preview_:=public.org_change('preview',
    (SELECT revision FROM private.org_control WHERE id),changes_,NULL,NULL,NULL);
  PERFORM public.org_change('apply',NULL,NULL,(preview_->>'id')::uuid,
    'ÁP DỤNG CƠ CẤU','Miễn nhiệm vị trí Kinh doanh cũ và gắn đúng Role V2 tại Phòng Kinh doanh Phân Phối 1');

  IF EXISTS (
    SELECT 1 FROM public.org_assignments a JOIN public.org_titles t ON t.id=a.title_id
    WHERE a.unit_id='cef13ee0-73a8-43c4-bfe5-6bef393248fc' AND a.source='biz_appointments'
      AND t.source='biz_positions' AND t.code IN ('employee','department_head','director','team_lead')
      AND a.status='active' AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())
  ) THEN RAISE EXCEPTION 'Old business appointments still active at Phòng Kinh doanh Phân Phối 1'; END IF;
END
$migrate$;
