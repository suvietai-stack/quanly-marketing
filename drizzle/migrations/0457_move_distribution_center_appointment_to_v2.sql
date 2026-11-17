-- Canonical reassignment for Trung tâm Kinh doanh Phân Phối. No guessing:
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
  WHERE a.unit_id='3df93c75-8a46-4c2f-bc09-7583aa672b52' AND a.source='biz_appointments'
    AND t.source='biz_positions' AND t.code IN ('employee','department_head','director','team_lead')
    AND a.status='active' AND a.starts_at<=now()
    AND (a.ends_at IS NULL OR a.ends_at>now());
  IF source_count_>1 THEN
    RAISE EXCEPTION 'Unexpected count of old appointments for Trung tâm Kinh doanh Phân Phối: %',source_count_;
  END IF;
  IF source_count_=0 THEN RETURN; END IF;

  WITH map_(old_code,new_title,role_id) AS (
    VALUES ('director','9558f384-6e60-40df-b453-4411f095aa8e','role-v2-distribution-director')
  )
  SELECT count(*) INTO matched_
  FROM public.org_assignments a
  JOIN public.org_titles t ON t.id=a.title_id
  JOIN map_ m ON m.old_code=t.code
  JOIN public.org_position_roles old_role
    ON old_role.unit_id=a.unit_id AND old_role.title_id=a.title_id AND old_role.role_id=m.role_id
  JOIN public.org_position_roles new_role
    ON new_role.unit_id=a.unit_id AND new_role.title_id=m.new_title AND new_role.role_id=m.role_id
  WHERE a.unit_id='3df93c75-8a46-4c2f-bc09-7583aa672b52' AND a.source='biz_appointments'
    AND a.status='active' AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now());

  IF matched_<>source_count_ THEN
    RAISE EXCEPTION 'Ambiguous old -> V2 mapping for Trung tâm Kinh doanh Phân Phối (% of %)',
      matched_,source_count_;
  END IF;

  WITH map_(old_code,new_title,role_id) AS (
    VALUES ('director','9558f384-6e60-40df-b453-4411f095aa8e','role-v2-distribution-director')
  ), candidates AS (
    SELECT a.id,a.user_id,a.unit_id,m.new_title
    FROM public.org_assignments a
    JOIN public.org_titles t ON t.id=a.title_id
    JOIN map_ m ON m.old_code=t.code
    WHERE a.unit_id='3df93c75-8a46-4c2f-bc09-7583aa672b52' AND a.source='biz_appointments'
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
    RAISE EXCEPTION 'Incomplete migration action set for Trung tâm Kinh doanh Phân Phối';
  END IF;
  preview_:=public.org_change('preview',
    (SELECT revision FROM private.org_control WHERE id),changes_,NULL,NULL,NULL);
  PERFORM public.org_change('apply',NULL,NULL,(preview_->>'id')::uuid,
    'ÁP DỤNG CƠ CẤU','Miễn nhiệm vị trí Kinh doanh cũ và gắn đúng Role V2 tại Trung tâm Kinh doanh Phân Phối');

  IF EXISTS (
    SELECT 1 FROM public.org_assignments a JOIN public.org_titles t ON t.id=a.title_id
    WHERE a.unit_id='3df93c75-8a46-4c2f-bc09-7583aa672b52' AND a.source='biz_appointments'
      AND t.source='biz_positions' AND t.code IN ('employee','department_head','director','team_lead')
      AND a.status='active' AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())
  ) THEN RAISE EXCEPTION 'Old business appointments still active at Trung tâm Kinh doanh Phân Phối'; END IF;
END
$migrate$;
