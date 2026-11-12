CREATE OR REPLACE FUNCTION private.role_v2_reduction_guard(role_id_ text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ BEGIN IF EXISTS(SELECT 1 FROM public.leave_requests l JOIN private.role_source_rows(private.base_config()) s ON s.user_id=l.approver_id WHERE s.role_id=role_id_ AND (l.status='pending' OR (l.cancel_state IS NOT NULL AND l.cancel_state NOT IN ('approved','rejected','cancelled','recalled')))) THEN RAISE EXCEPTION 'Còn trách nhiệm duyệt đơn chưa xử lý; dừng giảm quyền Role.' USING ERRCODE='42501'; END IF; END $function$;
