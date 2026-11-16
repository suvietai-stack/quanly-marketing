-- Read detail from canonical 3K only for scoped org units; manager feedback is
-- additive and never mutates official K3 results or previous Showroom feedback.
BEGIN;
SET LOCAL lock_timeout='8s';
SET LOCAL statement_timeout='90s';
CREATE TABLE IF NOT EXISTS public.k3hub_feedback (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 unit_id text NOT NULL REFERENCES public.org_units(id),
 user_id uuid NOT NULL REFERENCES public.profiles(id),
 review_date date NOT NULL,
 author_id uuid NOT NULL REFERENCES public.profiles(id),
 body text NOT NULL CHECK(length(btrim(body)) BETWEEN 1 AND 2000),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS k3hub_feedback_target ON public.k3hub_feedback(user_id,review_date);
ALTER TABLE public.k3hub_feedback ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.k3hub_feedback FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.k3hub_member_read(_user uuid,_date date,_unit text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE uid uuid:=auth.uid(); units text[]; person jsonb;
BEGIN
 IF NOT private.is_active(uid) OR NOT private.is_active(_user) THEN RAISE EXCEPTION 'Cần đăng nhập.' USING ERRCODE='42501'; END IF;
 IF _date IS NULL OR _date<DATE '2020-01-01' OR
    _date>(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date+31 THEN
    RAISE EXCEPTION 'Ngày xem không hợp lệ.'; END IF;
 IF _unit='org-company' AND NOT private.k3hub_exec(uid) THEN
   RAISE EXCEPTION 'Không có quyền xem 3K toàn công ty.' USING ERRCODE='42501'; END IF;
 SELECT array_agg(DISTINCT a.unit_id) INTO units
 FROM public.org_assignments a
 WHERE a.user_id=_user AND a.status='active'
  AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())
  AND (_unit='org-company' OR EXISTS(SELECT 1 FROM private.k3hub_path(a.unit_id) pp WHERE pp.id=_unit))
  AND private.k3hub_can_view(uid,_user,a.unit_id,_date);
 IF cardinality(units) IS NULL OR cardinality(units)=0 THEN
   RAISE EXCEPTION 'Không có quyền xem 3K nhân viên này.' USING ERRCODE='42501'; END IF;
 SELECT jsonb_build_object(
  'name',p.full_name,'user_id',p.id,'date',_date,'unit_id',_unit,
  'goals',coalesce((SELECT jsonb_agg(jsonb_build_object(
   'id',g.id,'name',g.name,'status',g.status,'due_date',g.due_date,
   'expected_result',g.expected_result,'unit_id',g.org_unit_id)
   ORDER BY g.is_key DESC,g.due_date)
   FROM public.k3_goals g WHERE g.user_id=_user AND g.deleted_at IS NULL
    AND g.period_start<=_date AND g.period_end>=_date
    AND (g.org_unit_id=ANY(units) OR
     (g.org_unit_id IS NULL AND g.department_id::text=ANY(units))), '[]'::jsonb),
  'actions',coalesce((SELECT jsonb_agg(jsonb_build_object(
   'id',a.id,'name',a.name,'status',a.status,
   'goal_name',g.name,'due_date',a.due_date) ORDER BY a.is_key DESC,a.due_date)
    FROM public.k3_actions a JOIN public.k3_goals g ON g.id=a.goal_id
    WHERE a.assignee_id=_user AND a.deleted_at IS NULL AND g.deleted_at IS NULL
     AND coalesce(a.start_date,g.period_start)<=_date AND coalesce(a.due_date,g.period_end)>=_date
     AND (g.org_unit_id=ANY(units) OR
      (g.org_unit_id IS NULL AND g.department_id::text=ANY(units))), '[]'::jsonb),
  'results',coalesce((SELECT jsonb_agg(jsonb_build_object(
     'name',k.name,'value',r.value,'target',k.target,'unit',k.unit,'note',r.note)
     ORDER BY k.name)
     FROM public.k3_kpi_results r
     JOIN public.k3_kpis k ON k.id=r.kpi_id
     JOIN public.k3_actions a ON a.id=k.action_id
     JOIN public.k3_goals g ON g.id=a.goal_id
     WHERE r.user_id=_user AND r.work_date=_date
       AND r.deleted_at IS NULL AND r.review_reason IS NULL
       AND (g.org_unit_id=ANY(units) OR
        (g.org_unit_id IS NULL AND g.department_id::text=ANY(units))), '[]'::jsonb),
  'day',coalesce((SELECT jsonb_build_object('kg',d.kg,'summary_note',d.summary_note,
    'planned_at',d.planned_at,'summarized_at',d.summarized_at)
    FROM public.k3_days d WHERE d.user_id=_user AND d.work_date=_date
      AND (d.org_unit_id=ANY(units) OR
       (d.org_unit_id IS NULL AND d.department_id::text=ANY(units)))
    ORDER BY d.updated_at DESC LIMIT 1),'null'::jsonb),
  'feedback',coalesce((SELECT jsonb_agg(jsonb_build_object(
    'id',x.id,'body',x.body,'author_name',author.full_name,'created_at',x.created_at)
     ORDER BY x.created_at) FROM (
       SELECT id,body,author_id,created_at FROM public.k3hub_feedback
       WHERE user_id=_user AND review_date=_date AND unit_id=ANY(units)
       UNION ALL
       SELECT id,body,author_id,created_at FROM public.showroom_k3_feedback
       WHERE user_id=_user AND review_date=_date AND store_id=ANY(units)
     ) x JOIN public.profiles author ON author.id=x.author_id), '[]'::jsonb),
  'can_comment',uid<>_user AND (private.k3hub_exec(uid)
    OR (private.has_permission(uid,'k3hub.center') AND
      NOT private.k3_personal_denied(uid,'k3.view_scope')
      AND EXISTS(SELECT 1 FROM public.org_assignments a
        JOIN public.org_titles t ON t.id=a.title_id AND t.kind='manager' AND t.active
        WHERE a.user_id=uid AND a.status='active' AND a.starts_at<=now()
          AND (a.ends_at IS NULL OR a.ends_at>now())
          AND EXISTS(SELECT 1 FROM private.k3hub_path(unnest_unit.unit_id) pp WHERE pp.id=a.unit_id)
      )))
 ) INTO person
 FROM public.profiles p
 CROSS JOIN LATERAL (SELECT units[1] AS unit_id) unnest_unit WHERE p.id=_user;
 RETURN person;
END $fn$;

CREATE OR REPLACE FUNCTION public.k3hub_feedback_save(_user uuid,_date date,_unit text,_body text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE uid uuid:=auth.uid(); target_unit text; record public.k3hub_feedback;
BEGIN
 IF uid IS NULL OR _user=uid OR NOT private.is_active(uid) THEN
  RAISE EXCEPTION 'Không có quyền nhận xét.' USING ERRCODE='42501'; END IF;
 IF _date IS NULL OR _date<DATE '2026-11-16'
  OR _date>(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date THEN
  RAISE EXCEPTION 'Chỉ được nhận xét trong giai đoạn đã kích hoạt 3K chung.'; END IF;
 IF length(btrim(coalesce(_body,''))) NOT BETWEEN 1 AND 2000 THEN
  RAISE EXCEPTION 'Nhận xét từ 1 đến 2.000 ký tự.'; END IF;
 IF _unit='org-company' AND NOT private.k3hub_exec(uid) THEN
  RAISE EXCEPTION 'Không được nhận xét toàn công ty.' USING ERRCODE='42501'; END IF;
 IF NOT private.k3hub_exec(uid) AND
    (NOT private.has_permission(uid,'k3hub.center')
     OR private.k3_personal_denied(uid,'k3.view_scope')) THEN
  RAISE EXCEPTION 'Không có quyền quản lý 3K.' USING ERRCODE='42501'; END IF;
 SELECT a.unit_id INTO target_unit FROM public.org_assignments a
 WHERE a.user_id=_user AND a.status='active'
   AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())
   AND (_unit='org-company' OR EXISTS(SELECT 1 FROM private.k3hub_path(a.unit_id) pp WHERE pp.id=_unit))
   AND private.k3hub_can_view(uid,_user,a.unit_id,_date)
 ORDER BY a.starts_at DESC LIMIT 1;
 IF target_unit IS NULL THEN RAISE EXCEPTION 'Nhân viên ngoài phạm vi.' USING ERRCODE='42501'; END IF;
 INSERT INTO public.k3hub_feedback(unit_id,user_id,review_date,author_id,body)
 VALUES(target_unit,_user,_date,uid,btrim(_body)) RETURNING * INTO record;
 RETURN jsonb_build_object('id',record.id,'created_at',record.created_at);
END $fn$;

REVOKE ALL ON FUNCTION public.k3hub_member_read(uuid,date,text),
 public.k3hub_feedback_save(uuid,date,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.k3hub_member_read(uuid,date,text),
 public.k3hub_feedback_save(uuid,date,text,text) TO authenticated;
COMMIT;
