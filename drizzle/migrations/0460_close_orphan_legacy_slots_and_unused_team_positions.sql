-- Canonical organization cleanup, 2026-11-17.
-- Close fourteen obsolete per-person business slots, remove their obsolete
-- title-to-role mappings, and deactivate four global business titles.
-- Do not display a "Trưởng nhóm" placeholder until an actual team exists.
--
-- No historical title/slot/appointment rows are deleted. New canonical V2
-- positions and their Role links are never changed.
-- All writes use audited org_change preview/apply as Super Admin.
DO $preflight$
BEGIN
  IF EXISTS(SELECT 1 FROM public.biz_teams WHERE active)
    OR EXISTS(SELECT 1 FROM public.org_units WHERE kind='team' AND active) THEN
    RAISE EXCEPTION 'Teams already exist: review team-lead positions before cleanup';
  END IF;
  IF EXISTS(
    SELECT 1 FROM public.org_assignments a
    JOIN public.org_titles t ON t.id=a.title_id
    WHERE (t.source='biz_positions' AND t.unit_id IS NULL
       OR t.id IN ('org-v2-b2b-gift1-team','org-v2-b2b-gift2-team','org-v2-dist1-team'))
      AND a.status<>'cancelled'
      AND (a.ends_at IS NULL OR a.ends_at>clock_timestamp())
  ) THEN
    RAISE EXCEPTION 'Old/unused team titles have current or future appointments';
  END IF;
  IF EXISTS(
    SELECT 1 FROM public.org_position_slots s
    JOIN public.org_titles t ON t.id=s.title_id
    JOIN public.org_assignments a ON a.slot_id=s.id
    WHERE t.source='biz_positions' AND t.unit_id IS NULL
      AND a.status<>'cancelled'
      AND (a.ends_at IS NULL OR a.ends_at>clock_timestamp())
  ) THEN
    RAISE EXCEPTION 'One old per-person slot still has a live/future holder';
  END IF;
  IF EXISTS(
    SELECT 1 FROM public.org_titles t WHERE t.id IN (
       'org-v2-b2b-gift1-team','org-v2-b2b-gift2-team','org-v2-dist1-team'
    ) AND t.source <> 'canonical'
  ) THEN RAISE EXCEPTION 'Team titles unexpectedly changed source'; END IF;
END $preflight$;

CREATE TABLE IF NOT EXISTS private.retired_legacy_org_titles_20261117(
  title_id text PRIMARY KEY,
  before_data jsonb NOT NULL,
  retired_at timestamptz NOT NULL DEFAULT now()
);

DO $cleanup$
DECLARE
  admin_id uuid;
  batch jsonb;
  preview_ jsonb;
  total_retired integer;
BEGIN
  SELECT p.id INTO STRICT admin_id
  FROM public.profiles p
  WHERE p.username='Admin' AND p.status='Đang hoạt động'
    AND private.is_super_admin(p.id);
  PERFORM set_config('request.jwt.claim.sub',admin_id::text,true);

  INSERT INTO private.retired_legacy_org_titles_20261117(title_id,before_data)
  SELECT t.id,to_jsonb(t)
  FROM public.org_titles t
  WHERE t.active AND (
    (t.source='biz_positions' AND t.unit_id IS NULL)
    OR t.id IN ('org-v2-b2b-gift1-team','org-v2-b2b-gift2-team','org-v2-dist1-team')
  )
  ON CONFLICT(title_id) DO NOTHING;

  -- The retired-slot command already makes a per-slot snapshot before closing.
  FOR batch IN
    SELECT jsonb_agg(jsonb_build_object(
      'action','retire_legacy_slot','data',jsonb_build_object('id',x.id)
    ) ORDER BY x.id)
    FROM (
      SELECT s.id, (row_number() OVER(ORDER BY s.id)-1)/3 AS grp
      FROM public.org_position_slots s
      JOIN public.org_titles t ON t.id=s.title_id
      WHERE s.active AND t.source='biz_positions' AND t.unit_id IS NULL
    ) x
    GROUP BY x.grp ORDER BY x.grp
  LOOP
    preview_:=public.org_change('preview',
      (SELECT revision FROM private.org_control WHERE id),
      batch,NULL,NULL,NULL);
    PERFORM public.org_change('apply',NULL,NULL,(preview_->>'id')::uuid,
      'ÁP DỤNG CƠ CẤU','Ngừng ô vị trí Kinh doanh cá nhân đã hết người; giữ lịch sử');
  END LOOP;

  -- Remove stale V1 title mappings, which are not employee appointments.
  -- Canonical V2 position/role pairs remain untouched.
  FOR batch IN
    SELECT jsonb_agg(jsonb_build_object(
      'action','position_role',
      'data',jsonb_build_object(
        'unit_id',x.unit_id,'title_id',x.title_id,'role_id','',
        'reason','Bỏ liên kết chức danh Kinh doanh chung không còn hiệu lực'
      )
    ) ORDER BY x.unit_id,x.title_id)
    FROM (
      SELECT pr.unit_id,pr.title_id,
        (row_number() OVER(ORDER BY pr.unit_id,pr.title_id)-1)/3 grp
      FROM public.org_position_roles pr
      JOIN public.org_titles t ON t.id=pr.title_id
      WHERE t.source='biz_positions' AND t.unit_id IS NULL
    ) x GROUP BY x.grp ORDER BY x.grp
  LOOP
    preview_:=public.org_change('preview',
      (SELECT revision FROM private.org_control WHERE id),
      batch,NULL,NULL,NULL);
    PERFORM public.org_change('apply',NULL,NULL,(preview_->>'id')::uuid,
      'ÁP DỤNG CƠ CẤU','Gỡ liên kết Role qua chức danh Kinh doanh chung đời cũ');
  END LOOP;

  -- Four global V1 titles plus three unused team-lead placeholders.
  -- The matching Role V2 records are intentionally preserved for future teams.
  FOR batch IN
    SELECT jsonb_agg(jsonb_build_object('action','title','data',
      jsonb_build_object(
        'id',x.id,'unit_id',x.unit_id,'name',x.name,'code',x.code,
        'level',x.level,'kind',x.kind,'capacity',x.capacity,'active',false,
        'unit_kind',coalesce(x.unit_kind,'department'),
        'business_policy',coalesce(x.business_policy,'none'),
        'all_business',coalesce(x.all_business,false),
        'description',coalesce(x.description,'')
      )
    ) ORDER BY x.id)
    FROM (
      SELECT t.*,bp.unit_kind,bp.business_policy,bp.all_business,bp.description,
        (row_number() OVER(ORDER BY t.id)-1)/2 AS grp
      FROM public.org_titles t
      LEFT JOIN public.biz_positions bp ON bp.id::text=t.id
      WHERE t.active AND (
        (t.source='biz_positions' AND t.unit_id IS NULL)
        OR t.id IN ('org-v2-b2b-gift1-team','org-v2-b2b-gift2-team','org-v2-dist1-team')
      )
    ) x GROUP BY x.grp ORDER BY x.grp
  LOOP
    preview_:=public.org_change('preview',
      (SELECT revision FROM private.org_control WHERE id),
      batch,NULL,NULL,NULL);
    PERFORM public.org_change('apply',NULL,NULL,(preview_->>'id')::uuid,
      'ÁP DỤNG CƠ CẤU','Ẩn chức danh toàn hệ cũ và Trưởng nhóm chưa có nhóm thực tế');
  END LOOP;

  SELECT count(*) INTO total_retired FROM public.org_position_slots s
  JOIN public.org_titles t ON t.id=s.title_id
  WHERE s.active AND t.source='biz_positions' AND t.unit_id IS NULL;
  IF total_retired<>0 THEN RAISE EXCEPTION 'Old per-person slot still active: %',total_retired; END IF;

  IF EXISTS(
    SELECT 1 FROM public.org_titles t
    WHERE t.active AND (
      (t.source='biz_positions' AND t.unit_id IS NULL)
      OR t.id IN ('org-v2-b2b-gift1-team','org-v2-b2b-gift2-team','org-v2-dist1-team')
    )
  ) THEN RAISE EXCEPTION 'Legacy or team-lead placeholder still active'; END IF;

  IF EXISTS(
    SELECT 1 FROM public.org_position_roles pr
    JOIN public.org_titles t ON t.id=pr.title_id
    WHERE t.source='biz_positions' AND t.unit_id IS NULL
  ) THEN RAISE EXCEPTION 'Stale global title role mapping remains'; END IF;

  IF (SELECT count(*) FROM public.org_position_roles
      WHERE title_id LIKE 'org-v2-%')<11 THEN
    RAISE EXCEPTION 'Canonical V2 Role mappings missing';
  END IF;
END $cleanup$;
