-- Showroom 3K stage 1: reuse canonical k3 goals/actions/KPI records and
-- canonical org assignments. NO legacy Biz scope and no automatic discipline.
-- A manager sees only active employees at their assigned store. Director sees
-- all showroom stores. Personal writes still use existing k3 owner RPC guards.
BEGIN;
SET LOCAL lock_timeout='8s';
SET LOCAL statement_timeout='90s';

INSERT INTO public.base_permission_catalog(key,label,module,dependencies) VALUES
 ('showroom.k3.use','Mở 3K Showroom cá nhân','Showroom','{}'::text[]),
 ('showroom.k3.view_team','Theo dõi 3K nhân sự cửa hàng','Showroom','{}'::text[]),
 ('showroom.k3.view_all','Xem 3K toàn Khối Showroom','Showroom','{}'::text[]),
 ('showroom.k3.comment','Nhận xét 3K nhân viên Showroom','Showroom','{}'::text[])
ON CONFLICT(key) DO UPDATE SET label=excluded.label,module=excluded.module;

DO $role$
DECLARE r text;
BEGIN
  FOREACH r IN ARRAY ARRAY['role-v2-showroom-staff','role-v2-showroom-manager','role-v2-executive'] LOOP
    IF NOT EXISTS(SELECT 1 FROM app_roles WHERE id=r AND role_kind='position'
      AND catalog_state='standard' AND catalog_generation>=2 AND NOT is_system)
    THEN RAISE EXCEPTION 'Missing active showroom/exec position role %',r; END IF;
  END LOOP;
  PERFORM set_config('app.role_reason','Kích hoạt 3K Showroom theo Role vị trí, không phát sinh quyền quản trị Biz',true);
  UPDATE app_roles SET permissions=(SELECT array_agg(DISTINCT p ORDER BY p)
      FROM unnest(permissions||ARRAY['showroom.k3.use','k3.use']) p),updated_at=now()
  WHERE id='role-v2-showroom-staff';
  UPDATE app_roles SET permissions=(SELECT array_agg(DISTINCT p ORDER BY p)
      FROM unnest(permissions||ARRAY['showroom.k3.use','showroom.k3.view_team','showroom.k3.comment','k3.use']) p),updated_at=now()
  WHERE id='role-v2-showroom-manager';
  UPDATE app_roles SET permissions=(SELECT array_agg(DISTINCT p ORDER BY p)
      FROM unnest(permissions||ARRAY['showroom.k3.use','showroom.k3.view_all','showroom.k3.comment']) p),updated_at=now()
  WHERE id='role-v2-executive';
END
$role$;

CREATE OR REPLACE FUNCTION private.showroom_k3_store(_unit text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
 WITH RECURSIVE lineage AS (
   SELECT id,parent_id,ARRAY[id] path FROM public.org_units WHERE id=_unit AND active
   UNION ALL SELECT p.id,p.parent_id,l.path||p.id FROM public.org_units p
     JOIN lineage l ON l.parent_id=p.id WHERE p.active AND NOT p.id=ANY(l.path)
 )
 SELECT EXISTS(SELECT 1 FROM lineage WHERE id='showroom-block')
$fn$;

CREATE OR REPLACE FUNCTION private.showroom_k3_scope(_actor uuid,_target uuid)
RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE full_access boolean; manager_access boolean; store text;
BEGIN
  IF _actor IS NULL OR _target IS NULL OR NOT private.is_active(_actor)
     OR NOT private.is_active(_target) THEN RETURN NULL; END IF;
  IF NOT (private.is_super_admin(_actor)
     OR (private.has_permission(_actor,'showroom.view')
          AND private.has_permission(_actor,'showroom.k3.use'))) THEN RETURN NULL; END IF;
  full_access:=private.is_super_admin(_actor) OR (
    private.has_permission(_actor,'showroom.k3.view_all') AND EXISTS(
      SELECT 1 FROM public.org_assignments a JOIN public.org_position_roles pr
       ON pr.unit_id=a.unit_id AND pr.title_id=a.title_id
      WHERE a.user_id=_actor AND a.unit_id='org-company' AND a.status='active'
        AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())
        AND pr.role_id='role-v2-executive'
    )
  );
  FOR store IN
    SELECT DISTINCT a.unit_id FROM public.org_assignments a
    JOIN public.org_units u ON u.id=a.unit_id AND u.kind='department' AND u.active
    WHERE a.user_id=_target AND a.status='active'
      AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())
      AND private.showroom_k3_store(a.unit_id)
  LOOP
    IF full_access THEN RETURN 'company'; END IF;
    IF _actor=_target AND public.k3_can(_actor,'k3.use') THEN RETURN 'own'; END IF;
    manager_access:=private.has_permission(_actor,'showroom.k3.view_team')
      AND EXISTS(
        SELECT 1 FROM public.org_assignments a JOIN public.org_titles t
        ON t.id=a.title_id AND t.kind='manager'
        JOIN public.org_position_roles pr
        ON pr.unit_id=a.unit_id AND pr.title_id=a.title_id
        WHERE a.user_id=_actor AND a.unit_id=store AND a.status='active'
          AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())
          AND pr.role_id='role-v2-showroom-manager'
      );
    IF manager_access THEN RETURN 'store'; END IF;
  END LOOP;
  RETURN NULL;
END $fn$;

REVOKE ALL ON FUNCTION private.showroom_k3_store(text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION private.showroom_k3_scope(uuid,uuid) FROM PUBLIC,anon,authenticated;

CREATE TABLE IF NOT EXISTS public.showroom_k3_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id text NOT NULL REFERENCES public.org_units(id),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  review_date date NOT NULL,
  author_id uuid NOT NULL REFERENCES public.profiles(id),
  body text NOT NULL CHECK(length(trim(body)) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS showroom_k3_feedback_user_date_idx
 ON public.showroom_k3_feedback(user_id,review_date,created_at);
ALTER TABLE public.showroom_k3_feedback ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.showroom_k3_feedback FROM PUBLIC,anon,authenticated;
-- Only SECURITY DEFINER functions expose selected data, never direct table reads.

CREATE OR REPLACE FUNCTION public.showroom_k3_team_read(_date date)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE uid uuid:=auth.uid(); team jsonb; scope_name text;
BEGIN
  IF uid IS NULL OR NOT private.is_active(uid) THEN
    RAISE EXCEPTION 'Cần đăng nhập.' USING ERRCODE='42501'; END IF;
  IF _date IS NULL OR _date < DATE '2020-01-01'
     OR _date>(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date+31 THEN
    RAISE EXCEPTION 'Ngày xem 3K không hợp lệ.'; END IF;
  IF NOT (private.is_super_admin(uid)
       OR (private.has_permission(uid,'showroom.view')
          AND private.has_permission(uid,'showroom.k3.use'))) THEN
    RAISE EXCEPTION 'Không có quyền vào 3K Showroom.' USING ERRCODE='42501'; END IF;

  SELECT coalesce(jsonb_agg(to_jsonb(z) ORDER BY z.store_name,z.full_name),'[]'::jsonb)
  INTO team FROM (
   SELECT DISTINCT ON (a.user_id,a.unit_id)
     a.user_id::text AS user_id,p.full_name,a.unit_id AS store_id,
     CASE WHEN u.name LIKE 'Showrom %' THEN replace(u.name,'Showrom ','Showroom ') ELSE u.name END AS store_name,
     t.name AS position,
     CASE WHEN e.confirmed_at IS NOT NULL OR k.confirmed_at IS NOT NULL
         OR d.summarized_at IS NOT NULL THEN 'confirmed'
       WHEN res.n>0 OR d.planned_at IS NOT NULL THEN 'updated'
       WHEN goals.n>0 THEN 'planned' ELSE 'none' END AS state,
     coalesce(goals.n,0)::int AS goals_count,
     coalesce(actions.n,0)::int AS actions_count,
     coalesce(res.n,0)::int AS results_count,
     d.planned_at,d.summarized_at,
     coalesce(e.confirmed_at,k.confirmed_at) AS confirmed_at,
     (uid<>a.user_id AND (private.is_super_admin(uid)
        OR private.has_permission(uid,'showroom.k3.comment'))
        AND private.showroom_k3_scope(uid,a.user_id) IN ('store','company')) AS can_comment
   FROM public.org_assignments a
   JOIN public.org_units u ON u.id=a.unit_id AND u.active AND u.kind='department'
   JOIN public.org_titles t ON t.id=a.title_id AND t.active
   JOIN public.profiles p ON p.id=a.user_id AND p.status='Đang hoạt động'
   LEFT JOIN public.k3_days d ON d.user_id=a.user_id AND d.work_date=_date
   LEFT JOIN LATERAL (
     SELECT max(confirmed_at) confirmed_at FROM public.k3_employee_reviews
     WHERE user_id=a.user_id AND work_date=_date
   ) e ON true
   LEFT JOIN LATERAL (
     SELECT max(confirmed_at) confirmed_at FROM public.k3_kpi_day_confirmations
     WHERE user_id=a.user_id AND work_date=_date
   ) k ON true
   LEFT JOIN LATERAL (
     SELECT count(*) n FROM public.k3_goals g
     WHERE g.user_id=a.user_id AND g.deleted_at IS NULL
       AND g.period_start<=_date AND g.period_end>=_date
       AND g.status NOT IN ('cancelled')
   ) goals ON true
   LEFT JOIN LATERAL (
     SELECT count(*) n FROM public.k3_actions act
     JOIN public.k3_goals g ON g.id=act.goal_id AND g.deleted_at IS NULL
     WHERE act.assignee_id=a.user_id AND act.deleted_at IS NULL
       AND coalesce(act.start_date,g.period_start)<=_date
       AND coalesce(act.due_date,g.period_end)>=_date
       AND act.status NOT IN ('cancelled')
   ) actions ON true
   LEFT JOIN LATERAL (
     SELECT count(*) n FROM public.k3_kpi_results rr
     WHERE rr.user_id=a.user_id AND rr.work_date=_date
       AND rr.deleted_at IS NULL AND rr.review_reason IS NULL
   ) res ON true
   WHERE a.status='active' AND a.starts_at<=now()
     AND (a.ends_at IS NULL OR a.ends_at>now())
     AND private.showroom_k3_store(a.unit_id)
     AND private.showroom_k3_scope(uid,a.user_id) IS NOT NULL
   ORDER BY a.user_id,a.unit_id,t.name
  ) z;

  scope_name:=CASE WHEN private.is_super_admin(uid)
      OR EXISTS(SELECT 1 FROM public.org_assignments a JOIN public.org_position_roles pr
        ON pr.unit_id=a.unit_id AND pr.title_id=a.title_id
        WHERE a.user_id=uid AND a.unit_id='org-company' AND a.status='active'
          AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())
          AND pr.role_id='role-v2-executive'
          AND private.has_permission(uid,'showroom.k3.view_all')) THEN 'company'
    WHEN private.has_permission(uid,'showroom.k3.view_team') THEN 'store'
    ELSE 'own' END;
  RETURN jsonb_build_object('date',_date,'scope',scope_name,'people',team,
     'member_count',jsonb_array_length(team),'server_now',now());
END $fn$;

CREATE OR REPLACE FUNCTION public.showroom_k3_member_read(_user uuid,_date date)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE uid uuid:=auth.uid(); permission_scope text; day_ public.k3_days;
BEGIN
  permission_scope:=private.showroom_k3_scope(uid,_user);
  IF permission_scope IS NULL THEN
    RAISE EXCEPTION 'Không có quyền xem 3K nhân viên này.' USING ERRCODE='42501'; END IF;
  IF _date IS NULL OR _date < DATE '2020-01-01'
     OR _date>(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date+31 THEN
    RAISE EXCEPTION 'Ngày xem 3K không hợp lệ.'; END IF;
  SELECT * INTO day_ FROM public.k3_days WHERE user_id=_user AND work_date=_date;
  RETURN jsonb_build_object(
    'person',(SELECT jsonb_build_object('id',id,'name',full_name) FROM public.profiles WHERE id=_user),
    'date',_date,'scope',permission_scope,
    'day',CASE WHEN day_.id IS NULL THEN NULL ELSE jsonb_build_object(
        'kg',day_.kg,'summary_note',day_.summary_note,'planned_at',day_.planned_at,
        'summarized_at',day_.summarized_at) END,
    'goals',coalesce((SELECT jsonb_agg(jsonb_build_object('id',g.id,'name',g.name,
        'status',g.status,'due_date',g.due_date,'expected_result',g.expected_result)
        ORDER BY g.is_key DESC,g.due_date)
      FROM public.k3_goals g WHERE g.user_id=_user AND g.deleted_at IS NULL
        AND g.period_start<=_date AND g.period_end>=_date),'[]'::jsonb),
    'actions',coalesce((SELECT jsonb_agg(jsonb_build_object('id',a.id,'name',a.name,
        'status',a.status,'goal_name',g.name,'kpi_target',a.kpi_target,'kpi_unit',a.kpi_unit)
        ORDER BY a.is_key DESC,a.due_date)
      FROM public.k3_actions a JOIN public.k3_goals g ON g.id=a.goal_id
      WHERE a.assignee_id=_user AND a.deleted_at IS NULL AND g.deleted_at IS NULL
        AND coalesce(a.start_date,g.period_start)<=_date
        AND coalesce(a.due_date,g.period_end)>=_date),'[]'::jsonb),
    'results',coalesce((SELECT jsonb_agg(jsonb_build_object(
        'kpi_id',r.kpi_id,'value',r.value,'note',r.note,
        'kpi_name',k.name,'unit',k.unit,'target',k.target) ORDER BY k.name)
      FROM public.k3_kpi_results r JOIN public.k3_kpis k ON k.id=r.kpi_id
      WHERE r.user_id=_user AND r.work_date=_date AND r.deleted_at IS NULL
        AND r.review_reason IS NULL),'[]'::jsonb),
    'feedback',coalesce((SELECT jsonb_agg(jsonb_build_object('id',f.id,'body',f.body,
        'created_at',f.created_at,'author_name',p.full_name) ORDER BY f.created_at)
      FROM public.showroom_k3_feedback f JOIN public.profiles p ON p.id=f.author_id
      WHERE f.user_id=_user AND f.review_date=_date),'[]'::jsonb),
    'can_comment',uid<>_user AND permission_scope IN ('store','company')
      AND (private.is_super_admin(uid) OR private.has_permission(uid,'showroom.k3.comment'))
  );
END $fn$;

CREATE OR REPLACE FUNCTION public.showroom_k3_comment_save(_user uuid,_date date,_body text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE uid uuid:=auth.uid(); scope_ text; store_ text; saved public.showroom_k3_feedback;
BEGIN
  scope_:=private.showroom_k3_scope(uid,_user);
  IF uid=_user OR scope_ NOT IN ('store','company')
    OR NOT (private.is_super_admin(uid) OR private.has_permission(uid,'showroom.k3.comment')) THEN
    RAISE EXCEPTION 'Bạn không có quyền nhận xét 3K nhân viên này.' USING ERRCODE='42501'; END IF;
  IF NOT coalesce((SELECT enabled FROM public.k3_settings WHERE id),false) THEN
    RAISE EXCEPTION '3K hiện chưa bật.'; END IF;
  IF _date IS NULL OR _date > (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
     OR _date < DATE '2026-11-16' THEN
    RAISE EXCEPTION 'Ngày nhận xét không thuộc giai đoạn 3K Showroom.'; END IF;
  IF btrim(coalesce(_body,''))='' OR length(btrim(_body))>2000 THEN
    RAISE EXCEPTION 'Nhận xét phải từ 1 đến 2.000 ký tự.'; END IF;
  SELECT a.unit_id INTO store_ FROM public.org_assignments a
  WHERE a.user_id=_user AND a.status='active' AND a.starts_at<=now()
    AND (a.ends_at IS NULL OR a.ends_at>now())
    AND private.showroom_k3_store(a.unit_id)
  ORDER BY a.starts_at DESC LIMIT 1;
  IF store_ IS NULL THEN RAISE EXCEPTION 'Nhân sự không còn thuộc Showroom.'; END IF;
  INSERT INTO public.showroom_k3_feedback(store_id,user_id,review_date,author_id,body)
  VALUES(store_,_user,_date,uid,btrim(_body)) RETURNING * INTO saved;
  RETURN jsonb_build_object('id',saved.id,'created_at',saved.created_at);
END $fn$;

REVOKE ALL ON FUNCTION public.showroom_k3_team_read(date) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.showroom_k3_member_read(uuid,date) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.showroom_k3_comment_save(uuid,date,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.showroom_k3_team_read(date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.showroom_k3_member_read(uuid,date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.showroom_k3_comment_save(uuid,date,text) TO authenticated;
COMMIT;
