-- Preserve immutable legacy writers as private, unreachable implementation details.
DO $$DECLARE d text; BEGIN
SELECT pg_get_functiondef('public.biz_org_save(text,jsonb)'::regprocedure) INTO d; EXECUTE replace(d,'public.biz_org_save(','private.biz_org_save_before_sync(');
SELECT pg_get_functiondef('public.biz_appointment_save(jsonb)'::regprocedure) INTO d; EXECUTE replace(d,'public.biz_appointment_save(','private.biz_appointment_save_before_sync(');
END $$;
REVOKE ALL ON FUNCTION private.biz_org_save_before_sync(text,jsonb),private.biz_appointment_save_before_sync(jsonb) FROM PUBLIC,anon,authenticated,service_role;
-- Primary memberships stay historical; concurrent affiliations live on the existing interval-based appointments.
CREATE FUNCTION private.biz_sync_member(_user uuid,_dep uuid,_team uuid,_at timestamptz,_mode text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE id_ uuid; BEGIN
PERFORM pg_advisory_xact_lock(hashtext('biz_org_structure'));
IF NOT EXISTS(SELECT 1 FROM profiles WHERE id=_user AND status='Đang hoạt động') THEN RAISE EXCEPTION 'Nhân viên chưa hoạt động.'; END IF;
IF NOT EXISTS(SELECT 1 FROM biz_departments d JOIN biz_systems s ON s.id=d.system_id WHERE d.id=_dep AND d.active AND s.active) OR (_team IS NOT NULL AND NOT EXISTS(SELECT 1 FROM biz_teams WHERE id=_team AND department_id=_dep AND active)) THEN RAISE EXCEPTION 'Đơn vị nhân sự không hợp lệ.';END IF;
IF _mode NOT IN ('transfer','concurrent') THEN RAISE EXCEPTION 'Chọn Điều chuyển hoặc Kiêm nhiệm.';END IF;
-- Concurrent appointments express secondary affiliation without duplicating personal obligations.
IF _mode='concurrent' AND EXISTS(SELECT 1 FROM biz_department_members WHERE user_id=_user AND started_at<=_at AND (ended_at IS NULL OR ended_at>_at) AND department_id<>_dep) THEN RETURN NULL;END IF;
IF _mode='transfer' THEN
UPDATE biz_team_members SET ended_at=_at WHERE user_id=_user AND started_at<_at AND (ended_at IS NULL OR ended_at>_at) AND team_id IS DISTINCT FROM _team;
UPDATE biz_department_members SET ended_at=_at,effective_to=(_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date WHERE user_id=_user AND department_id<>_dep AND started_at<_at AND (ended_at IS NULL OR ended_at>_at);
END IF;
SELECT id INTO id_ FROM biz_department_members WHERE user_id=_user AND department_id=_dep AND started_at<=_at AND (ended_at IS NULL OR ended_at>_at) ORDER BY started_at DESC,id LIMIT 1;
IF id_ IS NULL THEN
IF EXISTS(SELECT 1 FROM biz_department_members WHERE user_id=_user AND department_id=_dep AND effective_from=(_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date) THEN RAISE EXCEPTION 'Đã có phân công cùng ngày; cần đối chiếu lịch sử trước khi thêm lại.';END IF;
INSERT INTO biz_department_members(user_id,department_id,is_manager,effective_from,started_at) VALUES(_user,_dep,false,(_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date,_at) RETURNING id INTO id_;END IF;
IF _team IS NOT NULL AND NOT EXISTS(SELECT 1 FROM biz_team_members WHERE user_id=_user AND team_id=_team AND started_at<=_at AND (ended_at IS NULL OR ended_at>_at)) THEN
IF _mode='concurrent' AND EXISTS(SELECT 1 FROM biz_team_members WHERE user_id=_user AND (ended_at IS NULL OR ended_at>_at)) THEN RETURN id_;END IF;
INSERT INTO biz_team_members(user_id,team_id,started_at,actor_id) VALUES(_user,_team,_at,auth.uid()) RETURNING id INTO id_;END IF;
RETURN id_;END $$;
CREATE FUNCTION private.biz_sync_employee(_user uuid,_at timestamptz) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE m biz_department_members;t uuid;p uuid;BEGIN
IF EXISTS(SELECT 1 FROM biz_appointments WHERE user_id=_user AND status<>'cancelled' AND started_at<=_at AND (ended_at IS NULL OR ended_at>_at)) OR EXISTS(SELECT 1 FROM biz_management_assignments WHERE user_id=_user AND started_at<=_at AND (ended_at IS NULL OR ended_at>_at)) THEN RETURN;END IF;
SELECT * INTO m FROM biz_department_members WHERE user_id=_user AND started_at<=_at AND (ended_at IS NULL OR ended_at>_at) ORDER BY started_at DESC,id LIMIT 1;
IF m.id IS NULL THEN RETURN;END IF;
SELECT id INTO p FROM biz_positions WHERE code='employee' AND active AND unit_kind='individual' AND business_policy='personal';IF p IS NULL THEN RAISE EXCEPTION 'Cần chức vụ Nhân viên Kinh doanh đang hoạt động trong danh mục.';END IF;
SELECT tm.team_id INTO t FROM biz_team_members tm JOIN biz_teams bt ON bt.id=tm.team_id WHERE tm.user_id=_user AND bt.department_id=m.department_id AND tm.started_at<=_at AND (tm.ended_at IS NULL OR tm.ended_at>_at) ORDER BY tm.started_at DESC,tm.id LIMIT 1;
PERFORM private.biz_appointment_save_before_sync(jsonb_build_object('user_id',_user,'position_id',p,'scope_kind','individual','department_id',m.department_id,'system_id',(SELECT system_id FROM biz_departments WHERE id=m.department_id),'team_id',t,'started_at',_at));END $$;
REVOKE ALL ON FUNCTION private.biz_sync_member(uuid,uuid,uuid,timestamptz,text),private.biz_sync_employee(uuid,timestamptz) FROM PUBLIC,anon,authenticated,service_role;
CREATE OR REPLACE FUNCTION public.biz_org_save(_action text,_data jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE u uuid:=nullif(_data->>'user_id','')::uuid;d uuid:=nullif(_data->>'department_id','')::uuid;t uuid:=nullif(_data->>'team_id','')::uuid;ts timestamptz:=clock_timestamp();mode_ text:=_data->>'membership_mode';id_ uuid;p uuid;BEGIN
IF NOT public.biz_org_can_manage() THEN RAISE EXCEPTION 'Không có quyền quản lý cơ cấu.';END IF;PERFORM pg_advisory_xact_lock(hashtext('biz_org_structure'));
IF _action<>'member' THEN RETURN private.biz_org_save_before_sync(_action,_data);END IF;
IF mode_ IS NULL THEN
IF EXISTS(SELECT 1 FROM biz_department_members WHERE user_id=u AND ended_at IS NULL AND department_id<>d) OR EXISTS(SELECT 1 FROM biz_team_members WHERE user_id=u AND ended_at IS NULL AND team_id IS DISTINCT FROM t) THEN RAISE EXCEPTION 'Chọn Điều chuyển hoặc Kiêm nhiệm.';END IF;mode_:='concurrent';END IF;
IF mode_ NOT IN ('transfer','concurrent') THEN RAISE EXCEPTION 'Chọn Điều chuyển hoặc Kiêm nhiệm.';END IF;
IF mode_='transfer' THEN
IF EXISTS(SELECT 1 FROM biz_appointments WHERE user_id=u AND status<>'cancelled' AND (ended_at IS NULL OR ended_at>ts) AND scope_kind<>'individual' AND NOT (coalesce((_data->'end_appointment_ids') ? id::text,false))) OR EXISTS(SELECT 1 FROM biz_management_assignments WHERE user_id=u AND (ended_at IS NULL OR ended_at>ts) AND NOT (coalesce((_data->'end_legacy_ids') ? id::text,false))) THEN RAISE EXCEPTION 'Cần xác nhận các bổ nhiệm quản lý bị ảnh hưởng trước khi điều chuyển.';END IF;
IF EXISTS(SELECT 1 FROM biz_appointments WHERE user_id=u AND status<>'cancelled' AND started_at>ts) OR EXISTS(SELECT 1 FROM biz_management_assignments WHERE user_id=u AND started_at>ts) THEN RAISE EXCEPTION 'Có quyết định tương lai; cần xử lý riêng trước khi điều chuyển.';END IF;
UPDATE biz_appointments SET ended_at=ts WHERE user_id=u AND status='active' AND started_at<ts AND (ended_at IS NULL OR ended_at>ts);
UPDATE biz_management_assignments SET ended_at=ts WHERE user_id=u AND started_at<ts AND (ended_at IS NULL OR ended_at>ts);
END IF;
id_:=private.biz_sync_member(u,d,t,ts,mode_);
IF mode_='concurrent' AND id_ IS NULL OR (mode_='concurrent' AND t IS NOT NULL AND NOT EXISTS(SELECT 1 FROM biz_team_members WHERE user_id=u AND team_id=t AND ended_at IS NULL)) THEN
-- A secondary individual affiliation is an appointment, not another primary membership.
IF NOT EXISTS(SELECT 1 FROM biz_appointments WHERE user_id=u AND department_id=d AND team_id IS NOT DISTINCT FROM t AND scope_kind='individual' AND status<>'cancelled' AND started_at<=ts AND (ended_at IS NULL OR ended_at>ts)) THEN
IF NOT EXISTS(SELECT 1 FROM biz_appointments WHERE user_id=u AND status<>'cancelled' AND started_at<=ts AND (ended_at IS NULL OR ended_at>ts)) AND NOT EXISTS(SELECT 1 FROM biz_management_assignments WHERE user_id=u AND ended_at IS NULL) THEN
SELECT id INTO p FROM biz_positions WHERE code='employee' AND active AND unit_kind='individual';PERFORM private.biz_appointment_save_before_sync(jsonb_build_object('user_id',u,'position_id',p,'scope_kind','individual','department_id',d,'system_id',(SELECT system_id FROM biz_departments WHERE id=d),'team_id',t,'started_at',ts));
ELSE RAISE EXCEPTION 'Đơn vị kiêm nhiệm cần quyết định Bổ nhiệm theo chức vụ hiện có; không tự cấp chức vụ cấp 0.';END IF;END IF;
ELSE PERFORM private.biz_sync_employee(u,ts);END IF;
INSERT INTO biz_org_events(actor_id,action,payload) VALUES(auth.uid(),'member_sync',jsonb_build_object('id',id_,'new',_data));RETURN id_;END $$;
CREATE OR REPLACE FUNCTION public.biz_appointment_save(_data jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE x jsonb:=_data;id_ uuid;a biz_appointments;p biz_positions;u uuid;d uuid;t uuid;ts timestamptz;mode_ text:=coalesce(_data->>'membership_mode','concurrent');BEGIN
IF NOT public.biz_org_can_manage() THEN RAISE EXCEPTION 'Không có quyền bổ nhiệm.';END IF;PERFORM pg_advisory_xact_lock(hashtext('biz_org_structure'));
IF _data->>'action' IN ('end','cancel') THEN
id_:=private.biz_appointment_save_before_sync(_data);SELECT * INTO a FROM biz_appointments WHERE id=id_;PERFORM private.biz_sync_employee(a.user_id,clock_timestamp());RETURN id_;END IF;
SELECT * INTO p FROM biz_positions WHERE id=nullif(x->>'position_id','')::uuid;u:=nullif(x->>'user_id','')::uuid;d:=nullif(x->>'department_id','')::uuid;t:=nullif(x->>'team_id','')::uuid;ts:=coalesce(nullif(x->>'started_at','')::timestamptz,clock_timestamp());
IF t IS NOT NULL THEN SELECT department_id INTO d FROM biz_teams WHERE id=t;x:=x||jsonb_build_object('department_id',d);END IF;
IF d IS NOT NULL THEN x:=x||jsonb_build_object('system_id',(SELECT system_id FROM biz_departments WHERE id=d));END IF;
id_:=private.biz_appointment_save_before_sync(x);
IF p.unit_kind IN ('team','department','individual') THEN
IF mode_='transfer' AND EXISTS(SELECT 1 FROM biz_appointments WHERE user_id=u AND id<>id_ AND status<>'cancelled' AND (ended_at IS NULL OR ended_at>ts) AND scope_kind<>'individual' AND NOT (id::text=coalesce(x->>'replaces_id',''))) THEN RAISE EXCEPTION 'Còn bổ nhiệm quản lý khác; hãy điều chuyển có xác nhận hoặc chọn Kiêm nhiệm.';END IF;
PERFORM private.biz_sync_member(u,d,t,ts,mode_);END IF;
RETURN id_;END $$;
CREATE OR REPLACE FUNCTION public.biz_member_save(_department_id uuid,_user_id uuid,_is_manager boolean) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$BEGIN
IF coalesce(_is_manager,false) THEN RAISE EXCEPTION 'Bổ nhiệm quản lý tại Cơ cấu tổ chức.';END IF;
RETURN public.biz_org_save('member',jsonb_build_object('department_id',_department_id,'user_id',_user_id));END $$;
COMMENT ON FUNCTION public.biz_org_save(text,jsonb) IS 'Atomic personnel sync, explicit transfer/concurrent; no historical bulk backfill. Concurrent appointments are secondary organizational affiliations, never duplicate primary obligations.';
COMMENT ON FUNCTION public.biz_appointment_save(jsonb) IS 'Atomic appointment and member sync; private historical writer retains guards; intervals and snapshots remain immutable.';