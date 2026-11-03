CREATE UNIQUE INDEX profiles_username_case_insensitive ON public.profiles(lower(username));
CREATE FUNCTION public.account_identity_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,private AS $$BEGIN
 IF TG_TABLE_NAME='profiles' THEN
  IF NEW.id IS DISTINCT FROM OLD.id OR NEW.username IS DISTINCT FROM OLD.username THEN RAISE EXCEPTION 'Không được thay đổi định danh đăng nhập.' USING ERRCODE='42501';END IF;
  IF NOT private.is_active(auth.uid()) AND pg_trigger_depth()<2 THEN RAISE EXCEPTION 'Tài khoản không hoạt động.' USING ERRCODE='42501';END IF;
 ELSE
  IF NEW.role_id IN ('role-super-admin','role-admin') AND NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin được gán quyền quản trị.' USING ERRCODE='42501';END IF;
 END IF;RETURN NEW;END;$$;
CREATE TRIGGER account_profile_identity_guard BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.account_identity_guard();
CREATE TRIGGER account_role_hierarchy_guard BEFORE INSERT OR UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.account_identity_guard();
CREATE POLICY account_approver_profile_read ON public.profiles FOR SELECT TO authenticated USING(private.has_permission(auth.uid(),'settings.user_view') OR private.has_permission(auth.uid(),'settings.account_approve'));
CREATE POLICY account_status_operator_update ON public.profiles FOR UPDATE TO authenticated USING(private.has_permission(auth.uid(),'settings.account_approve') OR private.has_permission(auth.uid(),'settings.account_lock') OR private.has_permission(auth.uid(),'settings.account_reject')) WITH CHECK(private.has_permission(auth.uid(),'settings.account_approve') OR private.has_permission(auth.uid(),'settings.account_lock') OR private.has_permission(auth.uid(),'settings.account_reject'));
REVOKE ALL ON FUNCTION public.account_identity_guard() FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION public.k3_settings_read() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$DECLARE s public.k3_settings;BEGIN
 IF NOT private.is_active(auth.uid()) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501';END IF;
 SELECT * INTO s FROM public.k3_settings WHERE id=true;
 RETURN jsonb_build_object('enabled',coalesce(s.enabled,false),'effective_from',s.effective_from,'plan_by',coalesce(s.plan_by,'08:45'::time),'summary_by',coalesce(s.summary_by,'18:00'::time),'max_focus',coalesce(s.max_focus,3),'updated_at',s.updated_at,'can_use',public.k3_can(auth.uid(),'k3.use'),'can_view_scope',public.k3_can(auth.uid(),'k3.view_scope'),'can_comment',public.k3_can(auth.uid(),'k3.comment'),'can_settings',public.k3_can(auth.uid(),'k3.settings'),'today',(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date);END;$$;