-- Bản 66: chốt cấp bậc, Role nền chuẩn, mở rộng quyền đã kiểm chứng theo chức vụ.

-- 1) Cấp bậc: Giám đốc Marketing là Giám đốc Khối (Cấp 3). Một dòng metadata, có ghi trong migration.
ALTER TABLE public.org_titles DISABLE TRIGGER org_canonical_fence;
UPDATE public.org_titles SET level = 3 WHERE id = 'b5e00000-0000-4000-8000-000000000120' AND level IS DISTINCT FROM 3;
ALTER TABLE public.org_titles ENABLE TRIGGER org_canonical_fence;

-- 2) Role nền "Nhân sự mới" vào danh mục chuẩn với quyền cá nhân tối thiểu đã kiểm chứng.
UPDATE public.app_roles
SET catalog_state = 'standard',
    permissions = ARRAY['leave.create','leave.view_own','att.create','att.view_own'],
    description = 'Role nền cho tài khoản mới: chỉ quyền cá nhân tối thiểu đã kiểm chứng; chưa có quyền nghiệp vụ khi chưa được bổ nhiệm.'
WHERE id = 'role-nhan-su-moi';

-- 3) Mở rộng quyền được phép tự cấp theo chức vụ — chỉ quyền có rào máy chủ đã kiểm chứng:
-- leave/att: RPC SECURITY DEFINER + RLS qua private.sig_can; finance: fin_* RPC + private.fin_can_see;
-- oq/ot: oq_*/ot_* RPC SECURITY DEFINER; order.*: trigger orders qua public.design_can → private.has_permission.
CREATE OR REPLACE FUNCTION private.org_role_permission_ready(p text) RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
SELECT p = ANY (ARRAY[
  'leave.create','leave.view_own','leave.edit_own','leave.recall',
  'leave.view_assigned','leave.view_all','leave.approve','leave.create_for','leave.edit_others','leave.cancel_handle','leave.exception','leave.reassign','leave.report','leave.export','leave.settings',
  'att.create','att.view_own','att.edit_own','att.witness',
  'att.manage','att.reconcile','att.report','att.view_all','att.settings',
  'order.view','order.view_mine','order.create','order.take','order.update_draft','order.submit','order.resubmit','order.deliver','order.history','order.open_delivery',
  'order.approve','order.assign','order.edit','order.complete','order.cancel','order.edit_reviewer','order.report_view','order.request_changes','order.send_request','order.view_all',
  'order.marketing_design.view','order.marketing_design.view_all','order.marketing_design.create','order.marketing_design.send_request','order.marketing_design.submit','order.marketing_design.take','order.marketing_design.update_draft','order.marketing_design.resubmit','order.marketing_design.deliver','order.marketing_design.approve','order.marketing_design.assign','order.marketing_design.edit','order.marketing_design.complete','order.marketing_design.cancel','order.marketing_design.edit_reviewer','order.marketing_design.report_view','order.marketing_design.request_changes',
  'oq.create','oq.accept','oq.reply_price','oq.reply_progress','oq.report_own',
  'oq.view_own','oq.view_all','oq.manage','oq.report_all','oq.report_export',
  'ot.view_own','ot.task_view','ot.task_update','ot.stage_update',
  'ot.accept','ot.assign','ot.create','ot.manage','ot.report','ot.report_export','ot.reschedule_propose','ot.reschedule_reply','ot.supplier','ot.view_all',
  'finance.incoming.view','finance.incoming.view_totals','finance.incoming.claim','finance.incoming.reconcile','finance.incoming.manual_view','finance.incoming.manual_create','finance.incoming.manual_manage','finance.incoming.manage','finance.incoming.remind',
  'kpi.view_own','overview.view','overview.own_only','settings.view'
])
$$;

-- 4) Nhiệm vụ Marketing: bổ sung luồng đơn cá nhân đã kiểm chứng (cùng căn cứ design_can).
CREATE OR REPLACE FUNCTION private.mkt_specialty_permission_ready(p text) RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
  SELECT p = ANY (ARRAY[
    'overview.view','overview.alerts','overview.own_only',
    'task.view','task.view_mine','task.view_created_by_me','task.create','task.accept','task.start','task.update_result','task.update_status','task.submit_completion','task.resubmit_completion','task.view_history','task.add_note',
    'brand.view',
    'web.view','web.open_detail','web.keyword_view','web.keyword_open_sheet','web.content_view','web.content_view_mine','web.content_history','web.content_note','web.outline_start','web.outline_submit','web.outline_resubmit','web.post_write_start','web.post_submit','web.post_resubmit','web.view_web_draft_url','web.edit_web_draft_url','web.start_web_draft_layout','web.submit_web_draft_review','web.resubmit_web_draft_review','web.view_web_draft_revision_note','web.index_view','web.open_published_url',
    'social.view','social.view_mine','social.post_view','social.post_view_mine','social.post_create','social.post_edit','social.post_submit','social.post_start','social.post_resubmit','social.post_history','social.growth_view','social.growth_create','social.growth_edit','social.growth_open',
    'video.view','video.view_mine','video.create','video.script_start','video.script_submit','video.script_resubmit','video.submit','video.resubmit','video.deliver','video.history','video.edit_cut','video.move_editing','video.move_shooting','video.footage','video.create_design_order',
    'local.view','local.view_mine','local.create','local.edit','local.post_create','local.post_edit','local.photo','local.products','local.review','local.review_reply','local.review_status','local.growth_view','local.growth_create','local.growth_edit',
    'order.take','order.create','order.view','order.view_mine','order.update_draft','order.submit','order.resubmit','order.deliver','order.history','order.open_delivery',
    'leave.create','leave.view_own','leave.recall','att.create','att.view_own','att.witness','kpi.view_own','settings.view'
  ])
$$;

-- 5) Bổ sung quyền nghiệp vụ đã kiểm chứng vào Role chuẩn.
UPDATE public.app_roles SET permissions = ARRAY['leave.create','leave.view_own','leave.recall','att.create','att.view_own','att.witness','finance.incoming.view','finance.incoming.view_totals','finance.incoming.claim','finance.incoming.reconcile','finance.incoming.manual_view','finance.incoming.manual_create','finance.incoming.manual_manage','finance.incoming.manage','finance.incoming.remind'] WHERE id = 'role-standard-account-chief';
UPDATE public.app_roles SET permissions = ARRAY['leave.create','leave.view_own','leave.recall','att.create','att.view_own','att.witness','finance.incoming.view','finance.incoming.claim','finance.incoming.manual_view','finance.incoming.manual_create'] WHERE id = 'role-standard-account-stock';
UPDATE public.app_roles SET permissions = ARRAY['leave.create','leave.view_own','leave.recall','att.create','att.view_own','att.witness','oq.create','oq.accept','oq.reply_price','oq.reply_progress','oq.report_own','oq.view_own','oq.view_all','oq.manage','oq.report_all','oq.report_export','ot.view_own','ot.view_all','ot.task_view','ot.task_update','ot.create','ot.assign','ot.manage','ot.report','ot.report_export','ot.supplier','ot.reschedule_reply'] WHERE id = 'role-standard-proc-head';
UPDATE public.app_roles SET permissions = ARRAY['leave.create','leave.view_own','leave.recall','att.create','att.view_own','att.witness','oq.create','oq.accept','oq.reply_price','oq.reply_progress','oq.report_own','oq.view_own','ot.view_own','ot.task_view','ot.task_update','ot.reschedule_propose','ot.reschedule_reply'] WHERE id = 'role-standard-buyer';
UPDATE public.app_roles SET permissions = ARRAY['leave.create','leave.view_own','att.create','att.view_own','ot.view_own','ot.task_view','ot.task_update','ot.stage_update','ot.accept','ot.reschedule_reply'] WHERE id = 'role-dong-hang';
UPDATE public.app_roles SET permissions = ARRAY['order.view','order.view_mine','order.take','order.update_draft','order.submit','order.resubmit','order.deliver','order.history','order.open_delivery','order.create','att.create','leave.create','leave.view_own','leave.recall','att.witness','order.approve','order.assign','order.edit','order.complete','order.cancel','order.edit_reviewer','order.report_view','order.request_changes','order.view_all'] WHERE id = 'role-standard-design-head';
UPDATE public.app_roles SET permissions = ARRAY['order.view','order.view_mine','order.create','order.take','order.update_draft','order.submit','order.resubmit','order.deliver','order.history','order.open_delivery','leave.view_own','leave.create','leave.recall','att.create','order.marketing_design.view','order.marketing_design.view_all','order.marketing_design.create','order.marketing_design.send_request','order.marketing_design.submit','order.marketing_design.take','order.marketing_design.update_draft','order.marketing_design.resubmit','order.marketing_design.deliver','order.marketing_design.approve','order.marketing_design.assign','order.marketing_design.edit','order.marketing_design.complete','order.marketing_design.cancel','order.marketing_design.edit_reviewer','order.marketing_design.report_view','order.marketing_design.request_changes'] WHERE id IN ('role-standard-mkt-head','role-standard-mkt-director');

-- 6) Đồng bộ liên kết chức vụ: bật đúng phần giao giữa Role và danh sách đã kiểm chứng, ký lại chữ ký, ghi nhật ký.
DO $$ DECLARE before_ jsonb; actor_ uuid; BEGIN
  SELECT coalesce(jsonb_agg(to_jsonb(l)),'[]') INTO before_ FROM public.base_title_role_links l WHERE l.title_source='base';
  UPDATE public.base_title_role_links l
  SET enabled_permissions = x.perms, permission_signature = x.sig
  FROM (
    SELECT a.id, md5(coalesce(a.permissions,'{}')::text) AS sig,
           ARRAY(SELECT p FROM unnest(a.permissions) p WHERE private.org_role_permission_ready(p)) AS perms
    FROM public.app_roles a
  ) x
  WHERE l.title_source = 'base' AND l.role_id = x.id;
  SELECT user_id INTO actor_ FROM public.user_roles WHERE role_id='role-super-admin' ORDER BY user_id LIMIT 1;
  IF actor_ IS NOT NULL THEN
    INSERT INTO public.base_title_role_events(actor_id,title_source,title_id,reason,before_data,after_data)
    SELECT actor_,'base',t.id,'Chốt bộ Role chuẩn (bản 66): đồng bộ quyền đã kiểm chứng theo chức vụ',before_,
      (SELECT coalesce(jsonb_agg(to_jsonb(l)),'[]') FROM public.base_title_role_links l WHERE l.title_source='base' AND l.title_id=t.id)
    FROM (SELECT DISTINCT title_id AS id FROM public.base_title_role_links WHERE title_source='base') t;
  END IF;
END $$;

-- 7) Duyệt tài khoản: không xóa Role hiện có; chỉ thêm Role nền khi tài khoản chưa có Role nào; chặn Role legacy.
CREATE OR REPLACE FUNCTION public.account_approve(_target uuid,_role text DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,private AS $$ DECLARE p profiles;confirmed boolean;has_password boolean;banned boolean;BEGIN
 IF NOT private.is_active(auth.uid()) OR NOT (private.is_admin(auth.uid()) OR private.has_permission(auth.uid(),'settings.account_approve')) THEN RAISE EXCEPTION 'Không có quyền duyệt tài khoản.' USING ERRCODE='42501';END IF;
 SELECT * INTO p FROM profiles WHERE id=_target FOR UPDATE;IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy hồ sơ.';END IF;
 IF p.status<>'Chờ duyệt' THEN RAISE EXCEPTION 'Tài khoản không còn chờ duyệt. Vui lòng tải lại.';END IF;
 SELECT email_confirmed_at IS NOT NULL,coalesce(encrypted_password,'')<>'',coalesce(banned_until>now(),false) INTO confirmed,has_password,banned FROM auth.users WHERE id=_target;
 IF NOT FOUND OR NOT has_password OR banned THEN RAISE EXCEPTION 'Tài khoản xác thực chưa sẵn sàng. Vui lòng kiểm tra trạng thái xác thực.';END IF;
 IF _role IS NOT NULL THEN
  IF NOT(private.is_admin(auth.uid()) OR private.has_permission(auth.uid(),'settings.assign_role')) THEN RAISE EXCEPTION 'Không có quyền gán role.' USING ERRCODE='42501';END IF;
  IF _role IN ('role-super-admin','role-admin') AND NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin được gán role quản trị.' USING ERRCODE='42501';END IF;
  IF NOT EXISTS(SELECT 1 FROM app_roles WHERE id=_role AND catalog_state='standard') THEN RAISE EXCEPTION 'Chỉ gán Role thuộc danh mục chuẩn; Role cũ đã ngừng sử dụng.';END IF;
  INSERT INTO user_roles(user_id,role_id) SELECT _target,_role WHERE NOT EXISTS(SELECT 1 FROM user_roles WHERE user_id=_target AND role_id=_role);
 ELSE
  INSERT INTO user_roles(user_id,role_id) SELECT _target,'role-nhan-su-moi' WHERE NOT EXISTS(SELECT 1 FROM user_roles WHERE user_id=_target);
 END IF;
 UPDATE profiles SET status='Đang hoạt động' WHERE id=_target;
 INSERT INTO account_security_logs(actor_id,target_id,action) VALUES(auth.uid(),_target,'approve_account');
 RETURN jsonb_build_object('ok',true,'emailConfirmed',confirmed,'ready',confirmed);END;$$;
REVOKE ALL ON FUNCTION public.account_approve(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.account_approve(uuid,text) TO authenticated;

-- 8) Rào xóa Role còn tham chiếu: chức vụ, nhiệm vụ, nguồn quyền hoặc lịch sử.
CREATE OR REPLACE FUNCTION public.app_role_delete_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$BEGIN
 IF OLD.is_system
    OR EXISTS(SELECT 1 FROM user_roles WHERE role_id=OLD.id)
    OR EXISTS(SELECT 1 FROM base_title_role_links WHERE role_id=OLD.id)
    OR EXISTS(SELECT 1 FROM mkt_specialties WHERE role_id=OLD.id)
    OR EXISTS(SELECT 1 FROM base_title_role_events e WHERE e.before_data::text LIKE '%'||OLD.id||'%' OR e.after_data::text LIKE '%'||OLD.id||'%') THEN
  RAISE EXCEPTION 'Role còn liên kết chức vụ, nhiệm vụ, nguồn quyền hoặc lịch sử; hãy ngừng sử dụng thay vì xóa.' USING ERRCODE='23503';
 END IF;RETURN OLD;END;$$;
DROP TRIGGER IF EXISTS app_role_delete_guard ON public.app_roles;
CREATE TRIGGER app_role_delete_guard BEFORE DELETE ON public.app_roles FOR EACH ROW EXECUTE FUNCTION public.app_role_delete_guard();
REVOKE ALL ON FUNCTION public.app_role_delete_guard() FROM PUBLIC,anon,authenticated;