CREATE OR REPLACE FUNCTION public.approval_center_read() RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _todo jsonb := '[]'::jsonb;
  _mine jsonb := '[]'::jsonb;
  _done jsonb := '[]'::jsonb;
  _errors jsonb := '[]'::jsonb;
  _part jsonb;
  _biz jsonb;
  _run jsonb;
  _ev jsonb;
  _eligible boolean;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Cần đăng nhập.'; END IF;
  IF NOT private.is_active(_uid) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501'; END IF;

  -- 1. KINH DOANH: tái sử dụng nguyên dữ liệu và quy tắc can_act của biz_approvals_read
  BEGIN
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
  EXCEPTION WHEN OTHERS THEN
    _errors := _errors || jsonb_build_array(jsonb_build_object('source','biz','message',SQLERRM));
  END;

  -- 2. TÀI CHÍNH (tạm ứng / thanh toán / tạm ứng lương): đúng điều kiện fr_decide
  BEGIN
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
  EXCEPTION WHEN OTHERS THEN
    _errors := _errors || jsonb_build_array(jsonb_build_object('source','finance','message',SQLERRM));
  END;

  -- 3. NGHỈ PHÉP & ĐI SỚM MUỘN: đúng điều kiện leave_decide / leave_cancel_decide
  BEGIN
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
  EXCEPTION WHEN OTHERS THEN
    _errors := _errors || jsonb_build_array(jsonb_build_object('source','leave','message',SQLERRM));
  END;

  -- 4. GIẢI TRÌNH CHẤM CÔNG: đúng điều kiện att_witness
  BEGIN
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
  EXCEPTION WHEN OTHERS THEN
    _errors := _errors || jsonb_build_array(jsonb_build_object('source','attendance','message',SQLERRM));
  END;

  -- 5. THIẾT KẾ: đúng điều kiện guard Chờ duyệt → Đã duyệt / Cần sửa
  BEGIN
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
  EXCEPTION WHEN OTHERS THEN
    _errors := _errors || jsonb_build_array(jsonb_build_object('source','design','message',SQLERRM));
  END;

  -- 6. ĐỔI LỊCH ĐƠN HÀNG: đúng điều kiện ot_reschedule_reply
  BEGIN
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
  EXCEPTION WHEN OTHERS THEN
    _errors := _errors || jsonb_build_array(jsonb_build_object('source','order_tracking','message',SQLERRM));
  END;

  -- 7. DUYỆT TÀI KHOẢN MỚI: cùng quyền account_approve
  BEGIN
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
  EXCEPTION WHEN OTHERS THEN
    _errors := _errors || jsonb_build_array(jsonb_build_object('source','account','message',SQLERRM));
  END;

  -- 8. VIDEO: chờ duyệt kịch bản / chờ duyệt video — đúng quyền video.script_approve / video.approve
  BEGIN
    SELECT coalesce(jsonb_agg(x ORDER BY x->>'waiting_since'),'[]') INTO _part FROM (
      SELECT jsonb_build_object(
        'source','video','id',v.id,
        'title',CASE WHEN v.data->>'status'='Chờ duyệt kịch bản' THEN 'Duyệt kịch bản Video' ELSE 'Duyệt Video hoàn chỉnh' END,
        'requester',v.data->>'owner','summary',v.data->>'title',
        'step_label',v.data->>'status',
        'waiting_since',coalesce((SELECT max(h->>'at') FROM jsonb_array_elements(coalesce(v.data->'history','[]'::jsonb)) h), v.updated_at::text),
        'url','/videos?open=' || v.id) x
      FROM public.videos v
      WHERE v.data->>'status' IN ('Chờ duyệt kịch bản','Chờ duyệt video')
        AND CASE WHEN v.data->>'status'='Chờ duyệt kịch bản' THEN private.has_permission(_uid,'video.script_approve') ELSE private.has_permission(_uid,'video.approve') END
        AND (public.cw_uid(v.data->>'reviewer') IS NULL OR public.cw_uid(v.data->>'reviewer')=_uid OR private.is_super_admin(_uid))) q;
    _todo := _todo || _part;

    SELECT coalesce(jsonb_agg(x ORDER BY x->>'waiting_since' DESC),'[]') INTO _part FROM (
      SELECT jsonb_build_object(
        'source','video','id',v.id,
        'title',CASE WHEN v.data->>'status'='Chờ duyệt kịch bản' THEN 'Kịch bản Video' ELSE 'Video hoàn chỉnh' END,
        'requester',v.data->>'owner','summary',v.data->>'title',
        'step_label',v.data->>'status',
        'waiting_since',coalesce((SELECT max(h->>'at') FROM jsonb_array_elements(coalesce(v.data->'history','[]'::jsonb)) h), v.updated_at::text),
        'url','/videos?open=' || v.id) x
      FROM public.videos v
      WHERE v.data->>'status' IN ('Chờ duyệt kịch bản','Chờ duyệt video')
        AND v.data->>'owner' = (SELECT full_name FROM public.profiles WHERE id=_uid)) q;
    _mine := _mine || _part;

    SELECT coalesce(jsonb_agg(x ORDER BY x->>'acted_at' DESC),'[]') INTO _part FROM (
      SELECT DISTINCT ON (v.id) jsonb_build_object(
        'source','video','id',v.id,
        'title','Duyệt Video','requester',v.data->>'owner','summary',v.data->>'title',
        'action',CASE WHEN h->>'toStatus' LIKE '%đã duyệt%' THEN 'Đã duyệt' ELSE 'Yêu cầu sửa' END,
        'acted_at',h->>'at',
        'url','/videos?open=' || v.id) x
      FROM public.videos v, jsonb_array_elements(coalesce(v.data->'history','[]'::jsonb)) h
      WHERE h->>'byId'=_uid::text AND h->>'toStatus' IN ('Kịch bản đã duyệt','Cần sửa kịch bản','Video đã duyệt','Cần sửa video')
      ORDER BY v.id, h->>'at' DESC) q;
    _done := _done || _part;
  EXCEPTION WHEN OTHERS THEN
    _errors := _errors || jsonb_build_array(jsonb_build_object('source','video','message',SQLERRM));
  END;

  -- 9. CONTENT WEB: outline / bài / bản nháp web / tối ưu — đúng quyền từng bước và người duyệt được chỉ định (cw_reviewer)
  BEGIN
    SELECT coalesce(jsonb_agg(x ORDER BY x->>'waiting_since'),'[]') INTO _part FROM (
      SELECT jsonb_build_object(
        'source','web_content','id',c.id,
        'title',CASE c.data->>'status'
          WHEN 'Chờ duyệt outline' THEN 'Duyệt outline Content Web'
          WHEN 'Chờ duyệt bài' THEN 'Duyệt bài Content Web'
          WHEN 'Chờ duyệt bản nháp web' THEN 'Duyệt bản nháp Web'
          ELSE 'Duyệt tối ưu Website' END,
        'requester',c.data->>'writer','summary',c.data->>'title',
        'step_label',c.data->>'status',
        'waiting_since',coalesce((SELECT max(h->>'at') FROM jsonb_array_elements(coalesce(c.data->'history','[]'::jsonb)) h), c.updated_at::text),
        'url',CASE WHEN c.data->>'type'='Bài tối ưu lại' THEN '/websites/' || (c.data->>'websiteId') || '?open_opt=' || c.id ELSE '/web-contents?open=' || c.id END) x
      FROM public.web_contents c
      WHERE NOT c.is_demo
        AND c.data->>'status' IN ('Chờ duyệt outline','Chờ duyệt bài','Chờ duyệt bản nháp web','Chờ duyệt tối ưu')
        AND CASE c.data->>'status'
          WHEN 'Chờ duyệt outline' THEN private.has_permission(_uid,'web.outline_approve')
          WHEN 'Chờ duyệt bài' THEN private.has_permission(_uid,'web.post_approve')
          WHEN 'Chờ duyệt bản nháp web' THEN private.has_permission(_uid,'web.approve_web_draft')
          ELSE private.has_permission(_uid,'web.reopt_status') END
        AND (public.cw_uid(public.cw_reviewer(c.data, c.data->>'status')) IS NULL
          OR public.cw_uid(public.cw_reviewer(c.data, c.data->>'status'))=_uid
          OR private.is_super_admin(_uid))) q;
    _todo := _todo || _part;

    SELECT coalesce(jsonb_agg(x ORDER BY x->>'waiting_since' DESC),'[]') INTO _part FROM (
      SELECT jsonb_build_object(
        'source','web_content','id',c.id,
        'title','Content Web','requester',c.data->>'writer','summary',c.data->>'title',
        'step_label',c.data->>'status',
        'waiting_since',coalesce((SELECT max(h->>'at') FROM jsonb_array_elements(coalesce(c.data->'history','[]'::jsonb)) h), c.updated_at::text),
        'url',CASE WHEN c.data->>'type'='Bài tối ưu lại' THEN '/websites/' || (c.data->>'websiteId') || '?open_opt=' || c.id ELSE '/web-contents?open=' || c.id END) x
      FROM public.web_contents c
      WHERE NOT c.is_demo
        AND c.data->>'status' IN ('Chờ duyệt outline','Chờ duyệt bài','Chờ duyệt bản nháp web','Chờ duyệt tối ưu')
        AND c.data->>'writer' = (SELECT full_name FROM public.profiles WHERE id=_uid)) q;
    _mine := _mine || _part;

    SELECT coalesce(jsonb_agg(x ORDER BY x->>'acted_at' DESC),'[]') INTO _part FROM (
      SELECT DISTINCT ON (c.id) jsonb_build_object(
        'source','web_content','id',c.id,
        'title','Duyệt Content Web','requester',c.data->>'writer','summary',c.data->>'title',
        'action',CASE WHEN h->>'toStatus' LIKE '%đã duyệt%' THEN 'Đã duyệt' ELSE 'Yêu cầu sửa' END,
        'acted_at',h->>'at',
        'url',CASE WHEN c.data->>'type'='Bài tối ưu lại' THEN '/websites/' || (c.data->>'websiteId') || '?open_opt=' || c.id ELSE '/web-contents?open=' || c.id END) x
      FROM public.web_contents c, jsonb_array_elements(coalesce(c.data->'history','[]'::jsonb)) h
      WHERE NOT c.is_demo
        AND h->>'byId'=_uid::text
        AND h->>'toStatus' IN ('Outline đã duyệt','Cần sửa outline','Bài viết đã duyệt','Cần sửa bài','Bản nháp web đã duyệt','Cần sửa bản nháp web','Đã duyệt tối ưu','Cần sửa tối ưu')
      ORDER BY c.id, h->>'at' DESC) q;
    _done := _done || _part;
  EXCEPTION WHEN OTHERS THEN
    _errors := _errors || jsonb_build_array(jsonb_build_object('source','web_content','message',SQLERRM));
  END;

  -- 10. SOCIAL: bài chờ duyệt — đúng quyền social.post_approve
  BEGIN
    SELECT coalesce(jsonb_agg(x ORDER BY x->>'waiting_since'),'[]') INTO _part FROM (
      SELECT jsonb_build_object(
        'source','social_post','id',p.id,
        'title','Duyệt bài Social','requester',p.data->>'writer','summary',p.data->>'title',
        'step_label','Chờ duyệt',
        'waiting_since',coalesce((SELECT max(h->>'at') FROM jsonb_array_elements(coalesce(p.data->'history','[]'::jsonb)) h), p.updated_at::text),
        'url','/social/' || (p.data->>'channelId') || '?post=' || p.id) x
      FROM public.social_posts p
      WHERE p.data->>'status'='Chờ duyệt'
        AND private.has_permission(_uid,'social.post_approve')
        AND (public.cw_uid(p.data->>'reviewer') IS NULL OR public.cw_uid(p.data->>'reviewer')=_uid OR private.is_super_admin(_uid))) q;
    _todo := _todo || _part;

    SELECT coalesce(jsonb_agg(x ORDER BY x->>'waiting_since' DESC),'[]') INTO _part FROM (
      SELECT jsonb_build_object(
        'source','social_post','id',p.id,
        'title','Bài Social','requester',p.data->>'writer','summary',p.data->>'title',
        'step_label','Chờ duyệt',
        'waiting_since',coalesce((SELECT max(h->>'at') FROM jsonb_array_elements(coalesce(p.data->'history','[]'::jsonb)) h), p.updated_at::text),
        'url','/social/' || (p.data->>'channelId') || '?post=' || p.id) x
      FROM public.social_posts p
      WHERE p.data->>'status'='Chờ duyệt'
        AND p.data->>'writer' = (SELECT full_name FROM public.profiles WHERE id=_uid)) q;
    _mine := _mine || _part;

    SELECT coalesce(jsonb_agg(x ORDER BY x->>'acted_at' DESC),'[]') INTO _part FROM (
      SELECT DISTINCT ON (p.id) jsonb_build_object(
        'source','social_post','id',p.id,
        'title','Duyệt bài Social','requester',p.data->>'writer','summary',p.data->>'title',
        'action',CASE WHEN h->>'toStatus'='Đã duyệt' THEN 'Đã duyệt' ELSE 'Yêu cầu sửa' END,
        'acted_at',h->>'at',
        'url','/social/' || (p.data->>'channelId') || '?post=' || p.id) x
      FROM public.social_posts p, jsonb_array_elements(coalesce(p.data->'history','[]'::jsonb)) h
      WHERE h->>'byId'=_uid::text AND h->>'toStatus' IN ('Đã duyệt','Cần sửa')
      ORDER BY p.id, h->>'at' DESC) q;
    _done := _done || _part;
  EXCEPTION WHEN OTHERS THEN
    _errors := _errors || jsonb_build_array(jsonb_build_object('source','social_post','message',SQLERRM));
  END;

  -- 11. TASK: chờ xác nhận hoàn thành — đúng quyền task.approve_completion
  BEGIN
    SELECT coalesce(jsonb_agg(x ORDER BY x->>'waiting_since'),'[]') INTO _part FROM (
      SELECT jsonb_build_object(
        'source','task','id',t.id,
        'title','Xác nhận hoàn thành Task','requester',t.data->>'assignee','summary',t.data->>'title',
        'step_label','Chờ xác nhận',
        'waiting_since',coalesce((SELECT max(h->>'at') FROM jsonb_array_elements(coalesce(t.data->'history','[]'::jsonb)) h), t.updated_at::text),
        'url','/tasks?open=' || t.id) x
      FROM public.tasks t
      WHERE t.data->>'status'='Chờ xác nhận'
        AND private.has_permission(_uid,'task.approve_completion')
        AND (public.cw_uid(t.data->>'approver') IS NULL OR public.cw_uid(t.data->>'approver')=_uid OR private.is_super_admin(_uid))) q;
    _todo := _todo || _part;

    SELECT coalesce(jsonb_agg(x ORDER BY x->>'waiting_since' DESC),'[]') INTO _part FROM (
      SELECT jsonb_build_object(
        'source','task','id',t.id,
        'title','Task','requester',t.data->>'assignee','summary',t.data->>'title',
        'step_label','Chờ xác nhận',
        'waiting_since',coalesce((SELECT max(h->>'at') FROM jsonb_array_elements(coalesce(t.data->'history','[]'::jsonb)) h), t.updated_at::text),
        'url','/tasks?open=' || t.id) x
      FROM public.tasks t
      WHERE t.data->>'status'='Chờ xác nhận'
        AND t.data->>'assignee' = (SELECT full_name FROM public.profiles WHERE id=_uid)) q;
    _mine := _mine || _part;

    SELECT coalesce(jsonb_agg(x ORDER BY x->>'acted_at' DESC),'[]') INTO _part FROM (
      SELECT DISTINCT ON (t.id) jsonb_build_object(
        'source','task','id',t.id,
        'title','Xác nhận Task','requester',t.data->>'assignee','summary',t.data->>'title',
        'action',CASE WHEN h->>'toStatus'='Hoàn thành' THEN 'Đã xác nhận' ELSE 'Yêu cầu sửa' END,
        'acted_at',h->>'at',
        'url','/tasks?open=' || t.id) x
      FROM public.tasks t, jsonb_array_elements(coalesce(t.data->'history','[]'::jsonb)) h
      WHERE h->>'byId'=_uid::text AND h->>'toStatus' IN ('Hoàn thành','Cần sửa')
      ORDER BY t.id, h->>'at' DESC) q;
    _done := _done || _part;
  EXCEPTION WHEN OTHERS THEN
    _errors := _errors || jsonb_build_array(jsonb_build_object('source','task','message',SQLERRM));
  END;

  -- 12. HỎI GIÁ & TIẾN ĐỘ: luồng chờ tiếp nhận — đúng điều kiện oq.accept / oq.manage
  BEGIN
    SELECT coalesce(jsonb_agg(x ORDER BY x->>'waiting_since'),'[]') INTO _part FROM (
      SELECT jsonb_build_object(
        'source','order_quote','id',f.id,'code',r.code,
        'title',CASE f.kind WHEN 'price' THEN 'Tiếp nhận Hỏi giá' ELSE 'Tiếp nhận Hỏi tiến độ' END,
        'requester',p.full_name,'summary',r.title,
        'step_label','Chờ tiếp nhận','waiting_since',f.assigned_at,'overdue',false,
        'url','/order-quotes/' || f.request_id) x
      FROM public.oq_flows f
      JOIN public.oq_requests r ON r.id=f.request_id
      JOIN public.profiles p ON p.id=r.creator_id
      WHERE f.status='pending'
        AND ((f.assignee_id=_uid AND private.has_permission(_uid,'oq.accept')
              AND private.has_permission(_uid, CASE f.kind WHEN 'price' THEN 'oq.reply_price' ELSE 'oq.reply_progress' END))
             OR private.has_permission(_uid,'oq.manage'))) q;
    _todo := _todo || _part;

    SELECT coalesce(jsonb_agg(x ORDER BY x->>'waiting_since' DESC),'[]') INTO _part FROM (
      SELECT jsonb_build_object(
        'source','order_quote','id',f.id,'code',r.code,
        'title',CASE f.kind WHEN 'price' THEN 'Hỏi giá' ELSE 'Hỏi tiến độ' END,
        'requester',p.full_name,'summary',r.title,
        'step_label','Chờ bên Cung ứng tiếp nhận','waiting_since',f.assigned_at,
        'url','/order-quotes/' || f.request_id) x
      FROM public.oq_flows f
      JOIN public.oq_requests r ON r.id=f.request_id
      JOIN public.profiles p ON p.id=r.creator_id
      WHERE f.status='pending' AND r.creator_id=_uid) q;
    _mine := _mine || _part;

    SELECT coalesce(jsonb_agg(x ORDER BY x->>'acted_at' DESC),'[]') INTO _part FROM (
      SELECT jsonb_build_object(
        'source','order_quote','id',f.id,'code',r.code,
        'title',CASE f.kind WHEN 'price' THEN 'Hỏi giá' ELSE 'Hỏi tiến độ' END,
        'requester',p.full_name,'summary',r.title,
        'action','Đã tiếp nhận','acted_at',f.accepted_at,
        'url','/order-quotes/' || f.request_id) x
      FROM public.oq_flows f
      JOIN public.oq_requests r ON r.id=f.request_id
      JOIN public.profiles p ON p.id=r.creator_id
      WHERE f.assignee_id=_uid AND f.accepted_at IS NOT NULL) q;
    _done := _done || _part;
  EXCEPTION WHEN OTHERS THEN
    _errors := _errors || jsonb_build_array(jsonb_build_object('source','order_quote','message',SQLERRM));
  END;

  -- 13. SAO SỨ VIỆT: xác nhận phát quà — đúng quyền sao.shop_manage
  BEGIN
    IF private.sig_can(_uid,'sao.shop_manage') THEN
      SELECT coalesce(jsonb_agg(x ORDER BY x->>'waiting_since'),'[]') INTO _part FROM (
        SELECT jsonb_build_object(
          'source','sao','id',r.id,
          'title','Xác nhận phát quà Sao','requester',p.full_name,
          'summary',r.gift_name || ' · ' || r.price || ' Sao',
          'step_label','Đang giữ Sao chờ phát quà','waiting_since',r.created_at,'overdue',false,
          'url','/sao/admin') x
        FROM public.sao_redemptions r JOIN public.profiles p ON p.id=r.user_id
        WHERE r.status='pending') q;
      _todo := _todo || _part;
    END IF;

    SELECT coalesce(jsonb_agg(x ORDER BY x->>'waiting_since' DESC),'[]') INTO _part FROM (
      SELECT jsonb_build_object(
        'source','sao','id',r.id,
        'title','Đổi quà Sao','requester',p.full_name,
        'summary',r.gift_name || ' · ' || r.price || ' Sao',
        'step_label','Đang giữ Sao chờ phát quà','waiting_since',r.created_at,
        'url','/sao/admin') x
      FROM public.sao_redemptions r JOIN public.profiles p ON p.id=r.user_id
      WHERE r.status='pending' AND r.user_id=_uid) q;
    _mine := _mine || _part;

    SELECT coalesce(jsonb_agg(x ORDER BY x->>'acted_at' DESC),'[]') INTO _part FROM (
      SELECT jsonb_build_object(
        'source','sao','id',r.id,
        'title','Xác nhận phát quà Sao','requester',p.full_name,
        'summary',r.gift_name,
        'action',CASE r.status WHEN 'fulfilled' THEN 'Đã phát quà' ELSE 'Đã hủy' END,
        'acted_at',r.decided_at,
        'url','/sao/admin') x
      FROM public.sao_redemptions r JOIN public.profiles p ON p.id=r.user_id
      WHERE r.decided_by=_uid AND r.status IN ('fulfilled','cancelled')) q;
    _done := _done || _part;
  EXCEPTION WHEN OTHERS THEN
    _errors := _errors || jsonb_build_array(jsonb_build_object('source','sao','message',SQLERRM));
  END;

  -- 14. 3K: xác nhận kết quả KPI ngày — đúng điều kiện can_accept (biz_admin hoặc k3.view_scope trong phạm vi)
  BEGIN
    IF public.biz_admin(_uid) OR public.k3_can(_uid,'k3.view_scope') THEN
      SELECT coalesce(jsonb_agg(x ORDER BY x->>'waiting_since'),'[]') INTO _part FROM (
        SELECT jsonb_build_object(
          'source','k3','id',r.id,
          'title','Xác nhận kết quả KPI 3K','requester',p.full_name,
          'summary',k.name || ' · ngày ' || to_char(r.work_date,'DD/MM/YYYY'),
          'step_label','Chờ xác nhận kết quả','waiting_since',r.updated_at,'overdue',false,
          'url','/biz/3k') x
        FROM public.k3_kpi_results r
        JOIN public.k3_kpis k ON k.id=r.kpi_id
        JOIN public.profiles p ON p.id=r.user_id
        WHERE coalesce((k.config->>'acceptance_required')::boolean,false)
          AND r.deleted_at IS NULL
          AND r.user_id <> _uid
          AND private.k3_result_detail_ok(_uid, r.user_id, r.goal_id, r.work_date)
          AND NOT EXISTS (SELECT 1 FROM public.k3_kpi_acceptances a WHERE a.result_id=r.id AND a.result_revision=r.revision)) q;
      _todo := _todo || _part;
    END IF;

    SELECT coalesce(jsonb_agg(x ORDER BY x->>'waiting_since' DESC),'[]') INTO _part FROM (
      SELECT jsonb_build_object(
        'source','k3','id',r.id,
        'title','Kết quả KPI 3K','requester',p.full_name,
        'summary',k.name || ' · ngày ' || to_char(r.work_date,'DD/MM/YYYY'),
        'step_label','Chờ quản lý xác nhận','waiting_since',r.updated_at,
        'url','/biz/3k') x
      FROM public.k3_kpi_results r
      JOIN public.k3_kpis k ON k.id=r.kpi_id
      JOIN public.profiles p ON p.id=r.user_id
      WHERE coalesce((k.config->>'acceptance_required')::boolean,false)
        AND r.deleted_at IS NULL
        AND r.user_id=_uid
        AND NOT EXISTS (SELECT 1 FROM public.k3_kpi_acceptances a WHERE a.result_id=r.id AND a.result_revision=r.revision)) q;
    _mine := _mine || _part;

    SELECT coalesce(jsonb_agg(x ORDER BY x->>'acted_at' DESC),'[]') INTO _part FROM (
      SELECT jsonb_build_object(
        'source','k3','id',r.id,
        'title','Xác nhận kết quả KPI 3K','requester',p.full_name,
        'summary',k.name || ' · ngày ' || to_char(r.work_date,'DD/MM/YYYY'),
        'action',CASE a.decision WHEN 'accepted' THEN 'Đã xác nhận' ELSE 'Từ chối' END,
        'acted_at',a.created_at,
        'url','/biz/3k') x
      FROM public.k3_kpi_acceptances a
      JOIN public.k3_kpi_results r ON r.id=a.result_id
      JOIN public.k3_kpis k ON k.id=r.kpi_id
      JOIN public.profiles p ON p.id=r.user_id
      WHERE a.actor_id=_uid) q;
    _done := _done || _part;
  EXCEPTION WHEN OTHERS THEN
    _errors := _errors || jsonb_build_array(jsonb_build_object('source','k3','message',SQLERRM));
  END;

  -- Quyền vào Trung tâm: có khả năng duyệt ít nhất một nghiệp vụ, hoặc đã/đang có hồ sơ liên quan
  _eligible := jsonb_array_length(_todo) + jsonb_array_length(_mine) + jsonb_array_length(_done) > 0
    OR coalesce((_biz->>'has_assigned')::boolean,false)
    OR private.sig_can(_uid,'leave.approve') OR private.sig_can(_uid,'leave.cancel_handle')
    OR private.sig_can(_uid,'att.witness') OR private.sig_can(_uid,'ot.reschedule_reply')
    OR private.has_permission(_uid,'settings.account_approve')
    OR public.design_can(_uid,'photo','approve') OR public.design_can(_uid,'marketing_design','approve') OR public.design_can(_uid,'order_mockup','approve')
    OR EXISTS (SELECT 1 FROM public.fr_steps s WHERE s.approver_id=_uid OR (s.approver_id IS NULL AND s.perm IS NOT NULL AND coalesce(private.has_permission(_uid,s.perm),false)))
    OR private.has_permission(_uid,'video.script_approve') OR private.has_permission(_uid,'video.approve')
    OR private.has_permission(_uid,'web.outline_approve') OR private.has_permission(_uid,'web.post_approve')
    OR private.has_permission(_uid,'web.approve_web_draft') OR private.has_permission(_uid,'web.reopt_status')
    OR private.has_permission(_uid,'social.post_approve') OR private.has_permission(_uid,'task.approve_completion')
    OR private.has_permission(_uid,'oq.accept') OR private.has_permission(_uid,'oq.manage')
    OR private.sig_can(_uid,'sao.shop_manage')
    OR public.k3_can(_uid,'k3.view_scope');

  RETURN jsonb_build_object(
    'server_now',now(),
    'eligible',_eligible,
    'todo',(SELECT coalesce(jsonb_agg(v.value ORDER BY v.value->>'waiting_since'),'[]') FROM jsonb_array_elements(_todo) v),
    'mine',(SELECT coalesce(jsonb_agg(v.value ORDER BY v.value->>'waiting_since' DESC),'[]') FROM jsonb_array_elements(_mine) v),
    'done',(SELECT coalesce(jsonb_agg(v.value ORDER BY v.value->>'acted_at' DESC),'[]') FROM (SELECT value FROM jsonb_array_elements(_done) ORDER BY value->>'acted_at' DESC LIMIT 50) v),
    'errors',_errors);
END $$;
REVOKE ALL ON FUNCTION public.approval_center_read() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approval_center_read() TO authenticated;