CREATE OR REPLACE FUNCTION public.biz_appointment_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$DECLARE p public.biz_positions;unit uuid;BEGIN
PERFORM pg_advisory_xact_lock(hashtext('biz_org_structure'));
IF TG_OP='DELETE' THEN RAISE EXCEPTION 'Không xóa lịch sử bổ nhiệm.'; END IF;
IF TG_OP='UPDATE' AND (NEW.position_id<>OLD.position_id OR NEW.user_id<>OLD.user_id OR NEW.system_id IS DISTINCT FROM OLD.system_id OR NEW.department_id IS DISTINCT FROM OLD.department_id OR NEW.team_id IS DISTINCT FROM OLD.team_id OR NEW.started_at<>OLD.started_at OR NEW.scope_kind<>OLD.scope_kind OR NEW.position_snapshot<>OLD.position_snapshot OR NEW.actor_id<>OLD.actor_id OR NEW.replaces_id IS DISTINCT FROM OLD.replaces_id) THEN RAISE EXCEPTION 'Bổ nhiệm bất biến; kết thúc rồi tạo quyết định mới.'; END IF;
IF TG_OP='UPDATE' AND OLD.status<>'active' THEN RAISE EXCEPTION 'Quyết định đã kết thúc hoặc hủy.'; END IF;
IF NEW.ended_at IS NOT NULL AND NEW.ended_at<=NEW.started_at THEN RAISE EXCEPTION 'Ngày kết thúc phải sau ngày bắt đầu.'; END IF;
SELECT * INTO p FROM public.biz_positions WHERE id=NEW.position_id;
IF TG_OP='INSERT' THEN
IF NOT p.active OR NEW.scope_kind<>p.unit_kind THEN RAISE EXCEPTION 'Chức vụ đã ngừng hoặc phạm vi không phù hợp.'; END IF;
IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=NEW.user_id AND status='Đang hoạt động') THEN RAISE EXCEPTION 'Nhân viên chưa hoạt động.'; END IF;
IF p.all_business AND p.business_policy='executive' THEN IF NEW.system_id IS NOT NULL OR NEW.department_id IS NOT NULL OR NEW.team_id IS NOT NULL THEN RAISE EXCEPTION 'Lãnh đạo cấp Khối không gắn vào một Hệ.';END IF; ELSIF NEW.scope_kind='system' THEN
IF NEW.system_id IS NULL OR NEW.department_id IS NOT NULL OR NEW.team_id IS NOT NULL OR NOT EXISTS(SELECT 1 FROM public.biz_systems WHERE id=NEW.system_id AND active) THEN RAISE EXCEPTION 'Phạm vi Hệ không hợp lệ.'; END IF;
ELSIF NEW.scope_kind='department' THEN
IF NEW.department_id IS NULL OR NEW.team_id IS NOT NULL OR NOT EXISTS(SELECT 1 FROM public.biz_departments d JOIN public.biz_systems s ON s.id=d.system_id WHERE d.id=NEW.department_id AND s.id=NEW.system_id AND d.active AND s.active) THEN RAISE EXCEPTION 'Phạm vi Phòng không hợp lệ.'; END IF;
ELSIF NEW.scope_kind='team' THEN
IF NOT EXISTS(SELECT 1 FROM public.biz_teams t JOIN public.biz_departments d ON d.id=t.department_id JOIN public.biz_systems s ON s.id=d.system_id WHERE t.id=NEW.team_id AND d.id=NEW.department_id AND s.id=NEW.system_id AND t.active AND d.active AND s.active) THEN RAISE EXCEPTION 'Phạm vi Nhóm không hợp lệ.'; END IF;
ELSE
IF NOT EXISTS(SELECT 1 FROM public.biz_departments d JOIN public.biz_systems s ON s.id=d.system_id WHERE d.id=NEW.department_id AND s.id=NEW.system_id AND d.active AND s.active) OR (NEW.team_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.biz_teams WHERE id=NEW.team_id AND department_id=NEW.department_id AND active)) THEN RAISE EXCEPTION 'Đơn vị nhân viên không hợp lệ.'; END IF;
END IF;NEW.position_snapshot:=to_jsonb(p);END IF;
unit:=CASE NEW.scope_kind WHEN 'system' THEN NEW.system_id WHEN 'team' THEN NEW.team_id ELSE NEW.department_id END;
IF NEW.status<>'cancelled' AND EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.id<>NEW.id AND a.status<>'cancelled' AND tstzrange(a.started_at,a.ended_at,'[)') && tstzrange(NEW.started_at,NEW.ended_at,'[)') AND a.position_id=NEW.position_id AND a.scope_kind=NEW.scope_kind AND CASE a.scope_kind WHEN 'system' THEN a.system_id WHEN 'team' THEN a.team_id ELSE a.department_id END IS NOT DISTINCT FROM unit AND (NEW.scope_kind<>'individual' OR a.user_id=NEW.user_id)) THEN RAISE EXCEPTION 'Bổ nhiệm có phạm vi hoặc thời gian hiệu lực mâu thuẫn.'; END IF;
IF NEW.status<>'cancelled' AND p.code IN ('director','department_head','team_lead') AND EXISTS(SELECT 1 FROM public.biz_management_assignments a WHERE a.position=p.code AND CASE p.code WHEN 'director' THEN a.system_id WHEN 'department_head' THEN a.department_id ELSE a.team_id END=unit AND tstzrange(a.started_at,a.ended_at,'[)') && tstzrange(NEW.started_at,NEW.ended_at,'[)')) THEN RAISE EXCEPTION 'Trùng thời gian với bổ nhiệm quản lý hiện có.'; END IF; RETURN NEW;END $function$;
