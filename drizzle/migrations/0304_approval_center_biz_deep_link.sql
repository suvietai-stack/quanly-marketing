-- Deep link Kinh doanh: mo dung ho so tu Trung tam Phe duyet qua ?open=<run_id>.
CREATE OR REPLACE FUNCTION public.approval_center_read() RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _todo jsonb := '[]'::jsonb;
  _mine jsonb := '[]'::jsonb;
  _done jsonb := '[]'::jsonb;
  _part jsonb;
  _biz jsonb;
  _run jsonb;
  _ev jsonb;
  _eligible boolean;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Cần đăng nhập.'; END IF;
  IF NOT private.is_active(_uid) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;

  -- 1. KINH DOANH: tái sử dụng nguyên dữ liệu và quy tắc can_act của biz_approvals_read
  _biz := public.biz_approvals_read();
  FOR _run IN SELECT value FROM jsonb_array_elements(coalesce(_biz->'runs','[]'::jsonb)) LOOP
    IF coalesce((_run->>'can_act')::boolean,false) AND _run->>'status'='pending' THEN
      _todo := _todo || jsonb_build_array(jsonb_build_object(
        'source','biz','id',_run->>'id',
        'title',CASE
          WHEN _run->'content_snapshot'->>'entity'='rolling_plan' THEN 'Điều chỉnh phân bổ KR'
          WHEN _run->>'kind'='goal_year' THEN 'Mục tiêu KR năm'
          WHEN _run->>'kind' LIKE 'late_%' THEN 'Yêu cầu nộp bù'
          WHEN _run->>'kind' LIKE 'plan%' THEN 'Kế hoạch Kinh doanh'
          ELSE 'Báo cáo Kinh doanh' END,
        'requester',_run->>'employee_name',
        'summary',trim(COALESCE(CASE WHEN _run->'content_snapshot'->>'period' IS NOT NULL THEN (CASE WHEN _run->'content_snapshot'->>'period_kind'='quarter' THEN 'Quý ' ELSE 'Tháng ' END) || (_run->'content_snapshot'->>'period') || ' / ' ELSE '' END,'') || coalesce(_run->'content_snapshot'->>'year','') || COALESCE(' · ' || nullif(_run->'content_snapshot'->>'reason',''),'')),
        'step_label',COALESCE('Cấp ' || (coalesce((_run->>'current_step')::int,0)+1) || ': ' || (_run->'steps'->coalesce((_run->>'current_step')::int,0)->>'label'), _run->'org_snapshot'->>'workflow_name'),
        'waiting_since',_run->>'step_started_at',
        'overdue',coalesce((_run->'steps'->coalesce((_run->>'current_step')::int,0)->>'sla_hours')::numeric IS NOT NULL AND (_run->>'step_started_at')::timestamptz + make_interval(hours => coalesce((_run->'steps'->coalesce((_run->>'current_step')::int,0)->>'sla_hours')::numeric,0)) < now(), false),
        'url','/biz/approvals?open=' || (_run->>'id')));
    END IF;
    IF _run->>'owner_id' = _uid::text AND _run->>'status'='pending' THEN
      _mine := _mine || jsonb_build_array(jsonb_build_object(
        'source','biz','id',_run->>'id',
        'title',CASE WHEN _run->>'kind'='goal_year' THEN 'Mục tiêu KR năm' WHEN _run->>'kind' LIKE 'late_%' THEN 'Yêu cầu nộp bù' WHEN _run->>'kind' LIKE 'plan%' THEN 'Kế hoạch Kinh doanh' ELSE 'Báo cáo Kinh doanh' END,
        'requester',_run->>'employee_name',
        'summary',trim(COALESCE(CASE WHEN _run->'content_snapshot'->>'period' IS NOT NULL THEN 'Kỳ ' || (_run->'content_snapshot'->>'period') || ' / ' ELSE '' END,'') || coalesce(_run->'content_snapshot'->>'year','')),
        'step_label',COALESCE('Cấp ' || (coalesce((_run->>'current_step')::int,0)+1) || ': ' || (_run->'steps'->coalesce((_run->>'current_step')::int,0)->>'label'), _run->'org_snapshot'->>'workflow_name'),
        'waiting_since',_run->>'submitted_at',
        'url','/biz/approvals?open=' || (_run->>'id')));
    END IF;
    SELECT e.value INTO _ev FROM jsonb_array_elements(coalesce(_run->'events','[]'::jsonb)) e
      WHERE e.value->>'actor_id' = _uid::text AND e.value->>'action' IN ('step_approved','approved','returned','override')
      ORDER BY e.value->>'created_at' DESC LIMIT 1;
    IF _ev IS NOT NULL THEN
      _done := _done || jsonb_build_array(jsonb_build_object(
        'source','biz','id',_run->>'id',
        'title',CASE WHEN _run->>'kind'='goal_year' THEN 'Mục tiêu KR năm' WHEN _run->>'kind' LIKE 'late_%' THEN 'Yêu cầu nộp bù' WHEN _run->>'kind' LIKE 'plan%' THEN 'Kế hoạch Kinh doanh' ELSE 'Báo cáo Kinh doanh' END,
        'requester',_run->>'employee_name',
        'summary',trim(COALESCE(CASE WHEN _run->'content_snapshot'->>'period' IS NOT NULL THEN 'Kỳ ' || (_run->'content_snapshot'->>'period') || ' / ' ELSE '' END,'') || coalesce(_run->'content_snapshot'->>'year','')),
        'action',CASE _ev->>'action' WHEN 'returned' THEN 'Yêu cầu bổ sung' WHEN 'override' THEN 'Can thiệp' ELSE 'Đã duyệt' END,
        'acted_at',_ev->>'created_at',
        'url','/biz/approvals?open=' || (_run->>'id')));
    END IF;
  END LOOP;

  -- 2. TÀI CHÍNH (tạm ứng / thanh toán / tạm ứng lương): đúng điều kiện fr_decide
  SELECT coalesce(jsonb_agg(x ORDER BY x->>'waiting_since'),'[]') INTO _part FROM (
    SELECT jsonb_build_object(
      'source','finance','id',r.id,'code',r.code,
      'title',CASE r.kind WHEN 'advance' THEN 'Đề nghị tạm ứng' WHEN 'payment' THEN 'Đề nghị thanh toán' ELSE 'Tạm ứng lương' END,
      'requester',p.full_name,'summary',r.title,'amount',r.amount,
      'dates',jsonb_build_object('desired_date',r.desired_date),
      'step_label',s.label,'waiting_since',r.updated_at,'overdue',false,
      'url','/finance/' || CASE r.kind WHEN 'salary_advance' THEN 'salary' ELSE r.kind END || '?open=' || r.id) x
    FROM public.fr_requests r
    JOIN public.fr_steps s ON s.request_id=r.id AND s.step_no=r.current_step
    JOIN public.profiles p ON p.id=r.requester_id
    WHERE r.status='pending'
      AND (s.approver_id=_uid OR (s.approver_id IS NULL AND s.perm IS NOT NULL AND coalesce(private.has_permission(_uid,s.perm),false)))
      AND NOT (r.requester_id=_uid AND NOT coalesce((SELECT (limits->>'allow_self_approve')::boolean FROM public.fr_settings WHERE kind=r.kind),false))) q;
  _todo := _todo || _part;

  SELECT coalesce(jsonb_agg(x ORDER BY x->>'waiting_since' DESC),'[]') INTO _part FROM (
    SELECT jsonb_build_object(
      'source','finance','id',r.id,'code',r.code,
      'title',CASE r.kind WHEN 'advance' THEN 'Đề nghị tạm ứng' WHEN 'payment' THEN 'Đề nghị thanh toán' ELSE 'Tạm ứng lương' END,
      'requester',p.full_name,'summary',r.title,'amount',r.amount,
      'step_label',CASE r.status WHEN 'info_requested' THEN 'Chờ bổ sung thông tin' ELSE 'Chờ duyệt cấp ' || (r.current_step+1) END,
      'waiting_since',r.updated_at,
      'url','/finance/' || CASE r.kind WHEN 'salary_advance' THEN 'salary' ELSE r.kind END || '?open=' || r.id) x
    FROM public.fr_requests r JOIN public.profiles p ON p.id=r.requester_id
    WHERE r.requester_id=_uid AND r.status IN ('pending','info_requested')) q;
  _mine := _mine || _part;

  SELECT coalesce(jsonb_agg(x ORDER BY x->>'acted_at' DESC),'[]') INTO _part FROM (
    SELECT DISTINCT ON (r.id) jsonb_build_object(
      'source','finance','id',r.id,'code',r.code,
      'title',CASE r.kind WHEN 'advance' THEN 'Đề nghị tạm ứng' WHEN 'payment' THEN 'Đề nghị thanh toán' ELSE 'Tạm ứng lương' END,
      'requester',p.full_name,'summary',r.title,'amount',r.amount,
      'action',CASE s.status WHEN 'approved' THEN 'Đã duyệt' WHEN 'rejected' THEN 'Từ chối' ELSE 'Yêu cầu bổ sung' END,
      'acted_at',s.decided_at,
      'url','/finance/' || CASE r.kind WHEN 'salary_advance' THEN 'salary' ELSE r.kind END || '?open=' || r.id) x
    FROM public.fr_steps s JOIN public.fr_requests r ON r.id=s.request_id JOIN public.profiles p ON p.id=r.requester_id
    WHERE s.decided_by=_uid AND s.status IN ('approved','rejected','info_requested')
    ORDER BY r.id, s.decided_at DESC) q;
  _done := _done || _part;

  -- 3. NGHỈ PHÉP & ĐI SỚM MUỘN: đúng điều kiện leave_decide / leave_cancel_decide
  SELECT coalesce(jsonb_agg(x ORDER BY x->>'waiting_since'),'[]') INTO _part FROM (
    SELECT jsonb_build_object(
      'source','leave','id',q.id,
      'title',CASE q.type WHEN 'leave' THEN 'Đơn nghỉ phép' WHEN 'late' THEN 'Đơn đi muộn' ELSE 'Đơn về sớm' END,
      'requester',p.full_name,
      'summary',q.reason_name || COALESCE(' · ' || nullif(q.detail,''),''),
      'dates',jsonb_build_object('mark_at',q.mark_at),
      'waiting_since',q.submitted_at,'overdue',false,
      'url','/leave?open=' || q.id) x
    FROM public.leave_requests q JOIN public.profiles p ON p.id=q.owner_id
    WHERE q.status='pending' AND q.approver_id=_uid AND q.owner_id<>_uid
      AND private.sig_can(_uid,'leave.approve')) q;
  _todo := _todo || _part;

  SELECT coalesce(jsonb_agg(x ORDER BY x->>'waiting_since'),'[]') INTO _part FROM (
    SELECT jsonb_build_object(
      'source','leave_cancel','id',q.id,
      'title','Yêu cầu hủy ' || CASE q.type WHEN 'leave' THEN 'đơn nghỉ phép' WHEN 'late' THEN 'đơn đi muộn' ELSE 'đơn về sớm' END,
      'requester',p.full_name,'summary',q.cancel_reason,
      'dates',jsonb_build_object('mark_at',q.mark_at),
      'waiting_since',q.updated_at,'overdue',false,
      'url','/leave?open=' || q.id) x
    FROM public.leave_requests q JOIN public.profiles p ON p.id=q.owner_id
    WHERE q.status='approved' AND q.cancel_state='requested' AND q.owner_id<>_uid
      AND private.sig_can(_uid,'leave.cancel_handle')
      AND (q.approver_id=_uid OR private.sig_can(_uid,'leave.view_all'))) q;
  _todo := _todo || _part;

  SELECT coalesce(jsonb_agg(x ORDER BY x->>'waiting_since' DESC),'[]') INTO _part FROM (
    SELECT jsonb_build_object(
      'source','leave','id',q.id,
      'title',CASE WHEN q.cancel_state='requested' THEN 'Yêu cầu hủy đơn' ELSE CASE q.type WHEN 'leave' THEN 'Đơn nghỉ phép' WHEN 'late' THEN 'Đơn đi muộn' ELSE 'Đơn về sớm' END END,
      'requester',p.full_name,'summary',q.reason_name,
      'step_label','Chờ duyệt','waiting_since',q.submitted_at,
      'url','/leave?open=' || q.id) x
    FROM public.leave_requests q JOIN public.profiles p ON p.id=q.owner_id
    WHERE q.owner_id=_uid AND (q.status='pending' OR q.cancel_state='requested')) q;
  _mine := _mine || _part;

  SELECT coalesce(jsonb_agg(x ORDER BY x->>'acted_at' DESC),'[]') INTO _part FROM (
    SELECT jsonb_build_object(
      'source','leave','id',q.id,
      'title',CASE q.type WHEN 'leave' THEN 'Đơn nghỉ phép' WHEN 'late' THEN 'Đơn đi muộn' ELSE 'Đơn về sớm' END,
      'requester',p.full_name,'summary',q.reason_name,
      'action',CASE q.status WHEN 'approved' THEN 'Đã duyệt' ELSE 'Từ chối' END,
      'acted_at',q.decided_at,
      'url','/leave?open=' || q.id) x
    FROM public.leave_requests q JOIN public.profiles p ON p.id=q.owner_id
    WHERE q.decided_by=_uid AND q.status IN ('approved','rejected')) q;
  _done := _done || _part;

  SELECT coalesce(jsonb_agg(x ORDER BY x->>'acted_at' DESC),'[]') INTO _part FROM (
    SELECT jsonb_build_object(
      'source','leave_cancel','id',q.id,
      'title','Yêu cầu hủy đơn','requester',p.full_name,'summary',q.cancel_reason,
      'action',CASE e.action WHEN 'cancel_approve' THEN 'Đã duyệt hủy' ELSE 'Từ chối hủy' END,
      'acted_at',e.created_at,
      'url','/leave?open=' || q.id) x
    FROM public.leave_request_events e JOIN public.leave_requests q ON q.id=e.request_id JOIN public.profiles p ON p.id=q.owner_id
    WHERE e.actor_id=_uid AND e.action IN ('cancel_approve','cancel_reject')) q;
  _done := _done || _part;

  -- 4. GIẢI TRÌNH CHẤM CÔNG: đúng điều kiện att_witness
  SELECT coalesce(jsonb_agg(x ORDER BY x->>'waiting_since'),'[]') INTO _part FROM (
    SELECT jsonb_build_object(
      'source','attendance','id',a.id,
      'title','Giải trình chấm công','requester',p.full_name,
      'summary',a.reason_name || ' · ngày ' || to_char(a.work_date,'DD/MM/YYYY') || COALESCE(' · ' || nullif(a.detail,''),''),
      'dates',jsonb_build_object('work_date',a.work_date),
      'waiting_since',a.submitted_at,'overdue',false,
      'url','/attendance?att=' || a.id) x
    FROM public.attendance_explanations a JOIN public.profiles p ON p.id=a.owner_id
    WHERE a.witness_status='pending' AND NOT a.recalled AND a.witness_id=_uid AND a.owner_id<>_uid
      AND private.sig_can(_uid,'att.witness')) q;
  _todo := _todo || _part;

  SELECT coalesce(jsonb_agg(x ORDER BY x->>'waiting_since' DESC),'[]') INTO _part FROM (
    SELECT jsonb_build_object(
      'source','attendance','id',a.id,
      'title','Giải trình chấm công','requester',p.full_name,
      'summary',a.reason_name || ' · ngày ' || to_char(a.work_date,'DD/MM/YYYY'),
      'step_label','Chờ người làm chứng','waiting_since',a.submitted_at,
      'url','/attendance?att=' || a.id) x
    FROM public.attendance_explanations a JOIN public.profiles p ON p.id=a.owner_id
    WHERE a.owner_id=_uid AND a.witness_status='pending' AND NOT a.recalled) q;
  _mine := _mine || _part;

  SELECT coalesce(jsonb_agg(x ORDER BY x->>'acted_at' DESC),'[]') INTO _part FROM (
    SELECT jsonb_build_object(
      'source','attendance','id',a.id,
      'title','Giải trình chấm công','requester',p.full_name,
      'summary',a.reason_name || ' · ngày ' || to_char(a.work_date,'DD/MM/YYYY'),
      'action',CASE a.witness_status WHEN 'confirmed' THEN 'Đã xác nhận' ELSE 'Không xác nhận được' END,
      'acted_at',a.witness_at,
      'url','/attendance?att=' || a.id) x
    FROM public.attendance_explanations a JOIN public.profiles p ON p.id=a.owner_id
    WHERE a.witness_id=_uid AND a.witness_status IN ('confirmed','unable')) q;
  _done := _done || _part;

  -- 5. THIẾT KẾ: đúng điều kiện guard Chờ duyệt → Đã duyệt / Cần sửa
  SELECT coalesce(jsonb_agg(x ORDER BY x->>'waiting_since'),'[]') INTO _part FROM (
    SELECT jsonb_build_object(
      'source','design','id',o.id,
      'title','Duyệt ' || CASE o.workflow_kind WHEN 'photo' THEN 'Chụp ảnh' WHEN 'marketing_design' THEN 'Ấn phẩm Marketing' WHEN 'order_mockup' THEN 'Ma-két đơn hàng' ELSE 'Thiết kế' END,
      'requester',o.data->>'requester','summary',o.data->>'title',
      'dates',jsonb_build_object('deadline',o.data->>'deadline'),
      'waiting_since',coalesce(o.data->>'submittedAt', o.updated_at::text),
      'overdue',coalesce((o.data->>'deadline')::date < (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date, false),
      'url','/orders?open=' || o.id) x
    FROM public.orders o
    WHERE o.data->>'status'='Chờ duyệt'
      AND private.design_person(_uid, coalesce(nullif(o.data->>'reviewer',''), o.data->>'requester'))
      AND public.design_can(_uid, o.workflow_kind, 'approve')
      AND NOT private.design_person(_uid, o.data->>'assignee')) q;
  _todo := _todo || _part;

  SELECT coalesce(jsonb_agg(x ORDER BY x->>'waiting_since' DESC),'[]') INTO _part FROM (
    SELECT jsonb_build_object(
      'source','design','id',o.id,
      'title',CASE o.workflow_kind WHEN 'photo' THEN 'Chụp ảnh' WHEN 'marketing_design' THEN 'Ấn phẩm Marketing' WHEN 'order_mockup' THEN 'Ma-két đơn hàng' ELSE 'Thiết kế' END,
      'requester',o.data->>'requester','summary',o.data->>'title',
      'step_label','Chờ duyệt','waiting_since',coalesce(o.data->>'submittedAt', o.updated_at::text),
      'url','/orders?open=' || o.id) x
    FROM public.orders o
    WHERE o.data->>'status'='Chờ duyệt'
      AND private.design_person(_uid, o.data->>'assignee')) q;
  _mine := _mine || _part;

  SELECT coalesce(jsonb_agg(x ORDER BY x->>'acted_at' DESC),'[]') INTO _part FROM (
    SELECT DISTINCT ON (o.id) jsonb_build_object(
      'source','design','id',o.id,
      'title',CASE o.workflow_kind WHEN 'photo' THEN 'Chụp ảnh' WHEN 'marketing_design' THEN 'Ấn phẩm Marketing' WHEN 'order_mockup' THEN 'Ma-két đơn hàng' ELSE 'Thiết kế' END,
      'requester',o.data->>'requester','summary',o.data->>'title',
      'action',CASE h->>'toStatus' WHEN 'Đã duyệt' THEN 'Đã duyệt' ELSE 'Yêu cầu sửa' END,
      'acted_at',h->>'at',
      'url','/orders?open=' || o.id) x
    FROM public.orders o, jsonb_array_elements(coalesce(o.data->'history','[]'::jsonb)) h
    WHERE h->>'byId'=_uid::text AND h->>'toStatus' IN ('Đã duyệt','Cần sửa')
    ORDER BY o.id, h->>'at' DESC) q;
  _done := _done || _part;

  -- 6. ĐỔI LỊCH ĐƠN HÀNG: đúng điều kiện ot_reschedule_reply
  SELECT coalesce(jsonb_agg(x ORDER BY x->>'waiting_since'),'[]') INTO _part FROM (
    SELECT jsonb_build_object(
      'source','order_tracking','id',r.id,'code',o.code,
      'title','Đề xuất đổi lịch giao','requester',p.full_name,
      'summary',o.title || ' · ' || to_char(r.from_date,'DD/MM') || ' → ' || to_char(r.proposed_date,'DD/MM/YYYY') || COALESCE(' · ' || nullif(r.reason,''),''),
      'dates',jsonb_build_object('from_date',r.from_date,'proposed_date',r.proposed_date),
      'waiting_since',r.created_at,'overdue',false,
      'url','/order-tracking/' || o.id) x
    FROM public.ot_reschedules r
    JOIN public.ot_orders o ON o.id=r.order_id
    LEFT JOIN public.profiles p ON p.id=r.proposer_id
    WHERE r.status='pending' AND o.status IN ('new','in_progress') AND o.due_date=r.from_date
      AND private.sig_can(_uid,'ot.reschedule_reply')
      AND _uid = CASE WHEN r.side='sale' THEN o.supply_id ELSE o.sale_id END) q;
  _todo := _todo || _part;

  SELECT coalesce(jsonb_agg(x ORDER BY x->>'waiting_since' DESC),'[]') INTO _part FROM (
    SELECT jsonb_build_object(
      'source','order_tracking','id',r.id,'code',o.code,
      'title','Đề xuất đổi lịch giao','requester',p.full_name,
      'summary',o.title || ' · ' || to_char(r.from_date,'DD/MM') || ' → ' || to_char(r.proposed_date,'DD/MM/YYYY'),
      'step_label','Chờ bên còn lại phản hồi','waiting_since',r.created_at,
      'url','/order-tracking/' || o.id) x
    FROM public.ot_reschedules r JOIN public.ot_orders o ON o.id=r.order_id LEFT JOIN public.profiles p ON p.id=r.proposer_id
    WHERE r.proposer_id=_uid AND r.status='pending') q;
  _mine := _mine || _part;

  SELECT coalesce(jsonb_agg(x ORDER BY x->>'acted_at' DESC),'[]') INTO _part FROM (
    SELECT jsonb_build_object(
      'source','order_tracking','id',r.id,'code',o.code,
      'title','Đề xuất đổi lịch giao','requester',p.full_name,
      'summary',o.title || ' · ' || to_char(r.from_date,'DD/MM') || ' → ' || to_char(r.proposed_date,'DD/MM/YYYY'),
      'action',CASE r.status WHEN 'accepted' THEN 'Đã chấp nhận' WHEN 'rejected' THEN 'Từ chối' ELSE 'Đề xuất ngày khác' END,
      'acted_at',r.responded_at,
      'url','/order-tracking/' || o.id) x
    FROM public.ot_reschedules r JOIN public.ot_orders o ON o.id=r.order_id LEFT JOIN public.profiles p ON p.id=r.proposer_id
    WHERE r.responder_id=_uid AND r.status IN ('accepted','rejected','countered')) q;
  _done := _done || _part;

  -- 7. DUYỆT TÀI KHOẢN MỚI: cùng quyền account_approve
  IF private.has_permission(_uid,'settings.account_approve') THEN
    SELECT coalesce(jsonb_agg(x ORDER BY x->>'waiting_since'),'[]') INTO _part FROM (
      SELECT jsonb_build_object(
        'source','account','id',pr.id,
        'title','Duyệt tài khoản mới','requester',pr.full_name,
        'summary','Tên đăng nhập: ' || pr.username,
        'waiting_since',pr.created_at,'overdue',false,
        'url','/settings') x
      FROM public.profiles pr WHERE pr.status='Chờ duyệt') q;
    _todo := _todo || _part;
  END IF;

  SELECT coalesce(jsonb_agg(x ORDER BY x->>'acted_at' DESC),'[]') INTO _part FROM (
    SELECT jsonb_build_object(
      'source','account','id',l.target_id,
      'title','Duyệt tài khoản mới','requester',pr.full_name,
      'summary','Tên đăng nhập: ' || pr.username,
      'action','Đã duyệt','acted_at',l.created_at,
      'url','/settings') x
    FROM public.account_security_logs l JOIN public.profiles pr ON pr.id=l.target_id
    WHERE l.actor_id=_uid AND l.action='approve_account') q;
  _done := _done || _part;

  -- Quyền vào Trung tâm: có khả năng duyệt ít nhất một nghiệp vụ, hoặc đã/đang có hồ sơ liên quan
  _eligible := jsonb_array_length(_todo) + jsonb_array_length(_mine) + jsonb_array_length(_done) > 0
    OR coalesce((_biz->>'has_assigned')::boolean,false)
    OR private.sig_can(_uid,'leave.approve') OR private.sig_can(_uid,'leave.cancel_handle')
    OR private.sig_can(_uid,'att.witness') OR private.sig_can(_uid,'ot.reschedule_reply')
    OR private.has_permission(_uid,'settings.account_approve')
    OR public.design_can(_uid,'photo','approve') OR public.design_can(_uid,'marketing_design','approve') OR public.design_can(_uid,'order_mockup','approve')
    OR EXISTS (SELECT 1 FROM public.fr_steps s WHERE s.approver_id=_uid OR (s.approver_id IS NULL AND s.perm IS NOT NULL AND coalesce(private.has_permission(_uid,s.perm),false)));

  RETURN jsonb_build_object(
    'server_now',now(),
    'eligible',_eligible,
    'todo',(SELECT coalesce(jsonb_agg(v.value ORDER BY v.value->>'waiting_since'),'[]') FROM jsonb_array_elements(_todo) v),
    'mine',(SELECT coalesce(jsonb_agg(v.value ORDER BY v.value->>'waiting_since' DESC),'[]') FROM jsonb_array_elements(_mine) v),
    'done',(SELECT coalesce(jsonb_agg(v.value ORDER BY v.value->>'acted_at' DESC),'[]') FROM (SELECT value FROM jsonb_array_elements(_done) ORDER BY value->>'acted_at' DESC LIMIT 50) v));
END $$;
REVOKE ALL ON FUNCTION public.approval_center_read() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approval_center_read() TO authenticated;