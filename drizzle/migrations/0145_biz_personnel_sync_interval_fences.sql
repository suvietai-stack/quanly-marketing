-- Fence invalid/scheduled membership transitions and tie secondary affiliations to their appointment.
DO $$DECLARE d text;BEGIN
SELECT pg_get_functiondef('public.biz_appointment_save(jsonb)'::regprocedure) INTO d;
d:=replace(d,'mode_ text:=coalesce(_data->>''membership_mode'',''concurrent'');','mode_ text:=coalesce(_data->>''membership_mode'',''concurrent'');member_ uuid;');
d:=replace(d,'id_:=private.biz_appointment_save_before_sync(_data);SELECT * INTO a FROM biz_appointments WHERE id=id_;', 'id_:=private.biz_appointment_save_before_sync(_data);SELECT * INTO a FROM biz_appointments WHERE id=id_; UPDATE biz_member_affiliations SET ended_at=CASE WHEN _data->>''action''=''cancel'' THEN started_at+interval ''1 microsecond'' ELSE a.ended_at END WHERE appointment_id=id_ AND (ended_at IS NULL OR ended_at>clock_timestamp());');
d:=replace(d,'id_:=private.biz_appointment_save_before_sync(x);', 'IF mode_ NOT IN (''transfer'',''concurrent'') THEN RAISE EXCEPTION ''Chọn Điều chuyển hoặc Kiêm nhiệm.'';END IF; IF mode_=''transfer'' AND (ts>clock_timestamp()+interval ''1 second'' OR EXISTS(SELECT 1 FROM biz_management_assignments WHERE user_id=u AND (ended_at IS NULL OR ended_at>ts))) THEN RAISE EXCEPTION ''Điều chuyển tương lai/phân công cũ cần xử lý riêng có xác nhận.'';END IF; id_:=private.biz_appointment_save_before_sync(x);');
d:=replace(d,'PERFORM private.biz_sync_member(u,d,t,ts,mode_);', 'member_:=private.biz_sync_member(u,d,t,ts,mode_); UPDATE biz_member_affiliations SET appointment_id=id_,ended_at=nullif(x->>''ended_at'','''')::timestamptz WHERE id=member_ AND appointment_id IS NULL; IF mode_=''transfer'' THEN UPDATE biz_appointments SET ended_at=ts WHERE user_id=u AND id<>id_ AND scope_kind=''individual'' AND status=''active'' AND started_at<ts AND (ended_at IS NULL OR ended_at>ts);END IF;');EXECUTE d;
-- Secondary team members participate in scoped visibility, but do not duplicate personal submission obligations.
SELECT pg_get_functiondef('public.biz_scope_ok(uuid,uuid,uuid,timestamptz)'::regprocedure) INTO d;
d:=replace(d, 'EXISTS(SELECT 1 FROM public.biz_team_members', 'EXISTS(SELECT 1 FROM (SELECT user_id,team_id,started_at,ended_at FROM public.biz_team_members UNION ALL SELECT user_id,team_id,started_at,ended_at FROM public.biz_member_affiliations WHERE team_id IS NOT NULL)');EXECUTE d;
END $$;
CREATE FUNCTION private.biz_membership_overlap_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$BEGIN
PERFORM pg_advisory_xact_lock(hashtext('biz_org_structure'));
IF NEW.ended_at IS NOT NULL AND NEW.ended_at<=NEW.started_at THEN RAISE EXCEPTION 'Khoảng thành viên không hợp lệ.';END IF;
IF TG_TABLE_NAME='biz_department_members' THEN
IF EXISTS(SELECT 1 FROM biz_department_members m WHERE m.id<>NEW.id AND m.user_id=NEW.user_id AND m.department_id=NEW.department_id AND tstzrange(m.started_at,m.ended_at,'[)')&&tstzrange(NEW.started_at,NEW.ended_at,'[)')) THEN RAISE EXCEPTION 'Thành viên Phòng trùng khoảng hiệu lực.';END IF;
ELSE
IF EXISTS(SELECT 1 FROM biz_team_members m WHERE m.id<>NEW.id AND m.user_id=NEW.user_id AND m.team_id=NEW.team_id AND tstzrange(m.started_at,m.ended_at,'[)')&&tstzrange(NEW.started_at,NEW.ended_at,'[)')) THEN RAISE EXCEPTION 'Thành viên Nhóm trùng khoảng hiệu lực.';END IF;END IF;RETURN NEW;END $$;
CREATE TRIGGER biz_department_members_overlap BEFORE INSERT OR UPDATE ON public.biz_department_members FOR EACH ROW EXECUTE FUNCTION private.biz_membership_overlap_guard();
CREATE TRIGGER biz_team_members_overlap BEFORE INSERT OR UPDATE ON public.biz_team_members FOR EACH ROW EXECUTE FUNCTION private.biz_membership_overlap_guard();
REVOKE ALL ON FUNCTION private.biz_membership_overlap_guard() FROM PUBLIC,anon,authenticated,service_role;