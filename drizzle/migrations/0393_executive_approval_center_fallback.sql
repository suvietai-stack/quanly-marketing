-- Lightweight, deliberately partial fallback for an active executive director.
-- The full approval_center_read remains authoritative for all modules; if it
-- times out, this endpoint still exposes assigned HR/finance cases, with a
-- visible incomplete-source warning. No workflow decision gates are weakened.
BEGIN;
SET LOCAL lock_timeout='8s';
SET LOCAL statement_timeout='60s';

CREATE OR REPLACE FUNCTION public.approval_center_executive_fallback()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE
  u uuid:=auth.uid();
  todo_ jsonb:='[]'::jsonb;
  mine_ jsonb:='[]'::jsonb;
  done_ jsonb:='[]'::jsonb;
BEGIN
  IF u IS NULL OR NOT private.is_active(u) THEN RAISE EXCEPTION 'Cần đăng nhập.' USING ERRCODE='42501'; END IF;
  IF NOT EXISTS(
    SELECT 1 FROM public.org_assignments a
    JOIN public.org_position_roles p ON p.unit_id=a.unit_id AND p.title_id=a.title_id
    WHERE a.user_id=u AND a.unit_id='org-company' AND a.status='active'
      AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())
      AND p.role_id='role-v2-executive'
  ) THEN RAISE EXCEPTION 'Nguồn Role điều hành không hiệu lực.' USING ERRCODE='42501'; END IF;

  SELECT coalesce(jsonb_agg(t.payload ORDER BY t.sort_at),'[]'::jsonb) INTO todo_
  FROM (
    SELECT jsonb_build_object(
      'source','leave','id',q.id,'title',CASE q.type WHEN 'leave' THEN 'Đơn nghỉ phép' WHEN 'late' THEN 'Đơn đi muộn' ELSE 'Đơn về sớm' END,
      'requester',p.full_name,'summary',q.reason_name||coalesce(' · '||nullif(q.detail,''),''),
      'dates',jsonb_build_object('mark_at',q.mark_at),'waiting_since',q.submitted_at,
      'overdue',false,'url','/leave?open='||q.id
    ) AS payload,q.submitted_at AS sort_at
    FROM public.leave_requests q JOIN public.profiles p ON p.id=q.owner_id
    WHERE q.status='pending' AND q.approver_id=u AND q.owner_id<>u
      AND private.sig_can(u,'leave.approve')
    UNION ALL
    SELECT jsonb_build_object(
      'source','finance','id',r.id,'code',r.code,
      'title',CASE r.kind WHEN 'advance' THEN 'Đề nghị tạm ứng' WHEN 'payment' THEN 'Đề nghị thanh toán' ELSE 'Tạm ứng lương' END,
      'requester',p.full_name,'summary',r.title,'amount',r.amount,
      'dates',jsonb_build_object('desired_date',r.desired_date),
      'step_label',s.label,'waiting_since',r.updated_at,'overdue',false,
      'url','/finance/'||CASE r.kind WHEN 'salary_advance' THEN 'salary' ELSE r.kind END||'?open='||r.id
    ),r.updated_at
    FROM public.fr_requests r
    JOIN public.fr_steps s ON s.request_id=r.id AND s.step_no=r.current_step
    JOIN public.profiles p ON p.id=r.requester_id
    WHERE r.status='pending'
      AND (s.approver_id=u OR (s.approver_id IS NULL AND s.perm IS NOT NULL AND private.has_permission(u,s.perm)))
      AND NOT (r.requester_id=u AND NOT coalesce(
        (SELECT (limits->>'allow_self_approve')::boolean FROM public.fr_settings WHERE kind=r.kind),false))
    ORDER BY sort_at LIMIT 200
  ) t;

  SELECT coalesce(jsonb_agg(t.payload ORDER BY t.sort_at DESC),'[]'::jsonb) INTO mine_
  FROM (
    SELECT jsonb_build_object('source','leave','id',q.id,'title','Đơn cá nhân',
      'requester',p.full_name,'summary',q.reason_name,'step_label','Chờ duyệt',
      'waiting_since',q.submitted_at,'url','/leave?open='||q.id) payload,q.submitted_at sort_at
    FROM public.leave_requests q JOIN public.profiles p ON p.id=q.owner_id
    WHERE q.owner_id=u AND (q.status='pending' OR q.cancel_state='requested')
    UNION ALL
    SELECT jsonb_build_object('source','finance','id',r.id,'code',r.code,
      'title','Đề nghị tài chính','requester',p.full_name,'summary',r.title,
      'step_label','Chờ duyệt','waiting_since',r.updated_at,
      'url','/finance/'||CASE r.kind WHEN 'salary_advance' THEN 'salary' ELSE r.kind END||'?open='||r.id),
      r.updated_at
    FROM public.fr_requests r JOIN public.profiles p ON p.id=r.requester_id
    WHERE r.requester_id=u AND r.status IN ('pending','info_requested')
    ORDER BY sort_at DESC LIMIT 100
  ) t;

  SELECT coalesce(jsonb_agg(t.payload ORDER BY t.sort_at DESC),'[]'::jsonb) INTO done_
  FROM (
    SELECT jsonb_build_object('source','leave','id',q.id,
      'title','Đơn đã xử lý','requester',p.full_name,'summary',q.reason_name,
      'action',CASE q.status WHEN 'approved' THEN 'Đã duyệt' ELSE 'Từ chối' END,
      'acted_at',q.decided_at,'url','/leave?open='||q.id) payload,q.decided_at sort_at
    FROM public.leave_requests q JOIN public.profiles p ON p.id=q.owner_id
    WHERE q.decided_by=u AND q.status IN ('approved','rejected')
    ORDER BY sort_at DESC LIMIT 50
  ) t;

  RETURN jsonb_build_object(
    'server_now',now(),'eligible',true,'todo',todo_,'mine',mine_,'done',done_,
    'errors',jsonb_build_array(jsonb_build_object('source','biz',
      'message','Bản tổng hợp toàn bộ nguồn chưa phản hồi; đang hiển thị đơn từ và tài chính thuộc phạm vi duyệt.'))
  );
END $fn$;

REVOKE ALL ON FUNCTION public.approval_center_executive_fallback() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.approval_center_executive_fallback() TO authenticated;
COMMIT;
