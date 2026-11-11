CREATE TABLE private.legacy_reset_accounts(user_id uuid PRIMARY KEY, reset_at timestamptz NOT NULL DEFAULT now(), run_id uuid NOT NULL, active boolean NOT NULL DEFAULT true);
REVOKE ALL ON private.legacy_reset_accounts FROM PUBLIC,anon,authenticated,service_role;
CREATE OR REPLACE FUNCTION private.legacy_reset_applies(u uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM private.legacy_reset_accounts WHERE user_id=u AND active) AND NOT private.is_super_admin(u) $$;
CREATE OR REPLACE FUNCTION private.legacy_business_allowed(u uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT NOT private.legacy_reset_applies(u) $$;
COMMENT ON FUNCTION private.legacy_business_allowed(uuid) IS 'Legacy business appointments remain organizational history, not permission sources after reset. Business standard-role scope activation requires a separately audited contract; never restores old appointments automatically.';
DO $$ DECLARE r record; d text; arg_ text; oldname text; BEGIN
 FOR r IN SELECT p.oid,p.proname,p.proargnames,p.proargtypes FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname IN ('biz_can','k3_can','crm_can','biz_participant','biz_manager','biz_all_scope','biz_scope_ok','k3_scope_ok','biz_executive_holder','biz_department_access','biz_run_can_read','biz_goal_can_read','biz_goal_can_review','biz_doc_access') LOOP
  d:=pg_get_functiondef(r.oid);oldname:='reset_previous_'||r.proname;
  EXECUTE replace(d,'FUNCTION public.'||r.proname||'(','FUNCTION private.'||oldname||'(');
  EXECUTE format('REVOKE ALL ON FUNCTION private.%I(%s) FROM PUBLIC,anon,authenticated,service_role',oldname,pg_get_function_identity_arguments(r.oid));
  IF r.proname IN ('biz_department_access','biz_run_can_read','biz_goal_can_read','biz_goal_can_review','biz_doc_access') THEN arg_:='auth.uid()';ELSE arg_:=r.proargnames[1];END IF;
  IF strpos(d,'LANGUAGE sql')>0 THEN
   d:=regexp_replace(d,'AS \$function\$','AS $function$ SELECT private.legacy_business_allowed('||arg_||') AND (');
   d:=regexp_replace(d,';?\s*\$function\$\s*$','); $function$');
  ELSE
   d:=regexp_replace(d,'BEGIN','BEGIN IF NOT private.legacy_business_allowed('||arg_||') THEN RETURN false; END IF;');
  END IF;
  EXECUTE d;
 END LOOP;
END $$;
DO $$ DECLARE d text; BEGIN
 SELECT pg_get_functiondef('private.base_rules(uuid,jsonb)'::regprocedure) INTO d;
 EXECUTE replace(d,'FUNCTION private.base_rules(','FUNCTION private.reset_previous_base_rules(');
END $$;
CREATE OR REPLACE FUNCTION private.base_rules(u uuid,c jsonb) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT coalesce(jsonb_agg(r),'[]') FROM jsonb_array_elements(private.reset_previous_base_rules(u,c)) r WHERE NOT private.legacy_reset_applies(u) OR r->>'effect'='DENY' OR (r->>'source_kind' IN ('appointment_role','marketing_appointment') AND EXISTS(SELECT 1 FROM app_roles ar WHERE ar.id=r->>'role_id' AND ar.catalog_state='standard'))
$$;
CREATE OR REPLACE FUNCTION private.legacy_regrant_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF NOT private.legacy_reset_applies(NEW.user_id) THEN RETURN NEW;END IF;
 IF TG_TABLE_NAME='user_roles' THEN
  IF NEW.source_kind='legacy' OR NOT EXISTS(SELECT 1 FROM app_roles WHERE id=NEW.role_id AND catalog_state='standard') THEN RAISE EXCEPTION 'Nguồn Role legacy đã ngừng; dùng bổ nhiệm hoặc Role chuẩn bổ sung.';END IF;
 ELSE
  IF NEW.use_custom AND NEW.source_kind='legacy' THEN RAISE EXCEPTION 'Quyền riêng legacy đã ngừng; cấu hình quyền bổ sung mới.';END IF;
 END IF;RETURN NEW;END $$;
CREATE TRIGGER legacy_role_regrant_guard BEFORE INSERT OR UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION private.legacy_regrant_guard();
CREATE TRIGGER legacy_override_regrant_guard BEFORE INSERT OR UPDATE ON public.user_permission_overrides FOR EACH ROW EXECUTE FUNCTION private.legacy_regrant_guard();
CREATE OR REPLACE FUNCTION public.base_perm_standard_reset_preview() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$ DECLARE a jsonb; BEGIN
 IF NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin được kiểm kê reset.';END IF;
 SELECT jsonb_agg(jsonb_build_object('user_id',p.id,'name',p.full_name,'protected',private.is_super_admin(p.id),'already_applied',private.legacy_reset_applies(p.id),'legacy_roles',(SELECT coalesce(jsonb_agg(to_jsonb(r)),'[]') FROM user_roles r WHERE r.user_id=p.id AND r.source_kind='legacy'),'legacy_override',(SELECT to_jsonb(o) FROM user_permission_overrides o WHERE o.user_id=p.id AND o.source_kind='legacy'),'organization_records',(SELECT count(*) FROM org_assignments a WHERE a.user_id=p.id))) INTO a FROM profiles p;
 RETURN jsonb_build_object('fingerprint',private.final_permission_fingerprint(),'accounts',a,'account_count',jsonb_array_length(a),'protected_count',(SELECT count(*) FROM profiles WHERE private.is_super_admin(id)),'pending_count',(SELECT count(*) FROM profiles WHERE NOT private.is_super_admin(id) AND NOT private.legacy_reset_applies(id)));
END $$;
CREATE OR REPLACE FUNCTION public.base_perm_standard_reset_execute(_fingerprint text,_confirmation text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE run_ uuid; snap_ jsonb; removed_ jsonb; users_ uuid[]; result_ jsonb; BEGIN
 IF NOT private.is_super_admin(auth.uid()) OR _confirmation IS DISTINCT FROM 'RESET QUYỀN LEGACY' THEN RAISE EXCEPTION 'Cần Super Admin xác nhận RESET QUYỀN LEGACY.';END IF;
 LOCK TABLE profiles,user_roles,user_permission_overrides,app_roles,org_assignments,base_title_role_links,mkt_staff_specialties,mkt_specialties,base_org_state,biz_appointments,biz_department_members,biz_management_assignments,biz_member_affiliations IN SHARE ROW EXCLUSIVE MODE;
 PERFORM pg_advisory_xact_lock(hashtext('standard_only_legacy_reset'));
 SELECT array_agg(id) INTO users_ FROM profiles WHERE NOT private.is_super_admin(id) AND NOT private.legacy_reset_applies(id);
 IF users_ IS NULL THEN RETURN jsonb_build_object('already_applied',true,'accounts',0);END IF;
 IF _fingerprint IS DISTINCT FROM private.final_permission_fingerprint() THEN RAISE EXCEPTION 'Dữ liệu thay đổi; xem trước lại.';END IF;
 snap_:=jsonb_build_object('user_roles',(SELECT coalesce(jsonb_agg(to_jsonb(r)),'[]') FROM user_roles r),'overrides',(SELECT coalesce(jsonb_agg(to_jsonb(r)),'[]') FROM user_permission_overrides r),'roles',(SELECT jsonb_agg(to_jsonb(r)) FROM app_roles r),'config',private.base_config(),'org_assignments',(SELECT jsonb_agg(to_jsonb(r)) FROM org_assignments r),'title_links',(SELECT jsonb_agg(to_jsonb(r)) FROM base_title_role_links r),'specialties',(SELECT jsonb_agg(to_jsonb(r)) FROM mkt_staff_specialties r),'biz_appointments',(SELECT jsonb_agg(to_jsonb(r)) FROM biz_appointments r),'biz_members',(SELECT jsonb_agg(to_jsonb(r)) FROM biz_department_members r),'biz_management',(SELECT jsonb_agg(to_jsonb(r)) FROM biz_management_assignments r),'biz_affiliations',(SELECT jsonb_agg(to_jsonb(r)) FROM biz_member_affiliations r),'effective',private.final_effective_snapshot(),'business_effective',(SELECT jsonb_agg(public.biz_effective_access(id)) FROM profiles),'account_count',(SELECT count(*) FROM profiles));
 SELECT coalesce(jsonb_agg(to_jsonb(r)),'[]') INTO removed_ FROM user_roles r WHERE r.user_id=ANY(users_) AND r.source_kind='legacy';
 INSERT INTO base_perm_cleanup_runs(actor,fingerprint,removed,snapshot,final_transition,result) VALUES(auth.uid(),_fingerprint,removed_,snap_,false,jsonb_build_object('standard_only_reset',true)) RETURNING id INTO run_;
 INSERT INTO private.legacy_reset_accounts(user_id,run_id) SELECT unnest(users_),run_ ON CONFLICT(user_id) DO UPDATE SET reset_at=excluded.reset_at,run_id=excluded.run_id,active=true;
 DELETE FROM user_roles WHERE user_id=ANY(users_) AND source_kind='legacy';
 UPDATE user_permission_overrides SET use_custom=false WHERE user_id=ANY(users_) AND source_kind='legacy' AND use_custom;
 result_:=jsonb_build_object('standard_only_reset',true,'run_id',run_,'accounts',cardinality(users_),'protected_accounts',(SELECT count(*) FROM profiles WHERE private.is_super_admin(id)),'removed_roles',jsonb_array_length(removed_),'active_legacy_roles_after',(SELECT count(*) FROM user_roles WHERE user_id=ANY(users_) AND source_kind='legacy'),'active_legacy_overrides_after',(SELECT count(*) FROM user_permission_overrides WHERE user_id=ANY(users_) AND source_kind='legacy' AND use_custom),'account_count_after',(SELECT count(*) FROM profiles),'organization_records_after',(SELECT count(*) FROM org_assignments),'business_activation_pending',true);
 UPDATE base_perm_cleanup_runs SET result=result_ WHERE id=run_;RETURN result_;
END $$;
CREATE OR REPLACE FUNCTION public.base_perm_standard_reset_restore(_run uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE r base_perm_cleanup_runs; n int; BEGIN
 IF NOT private.is_super_admin(auth.uid()) THEN RAISE EXCEPTION 'Chỉ Super Admin được khôi phục.';END IF;
 LOCK TABLE user_roles,user_permission_overrides IN SHARE ROW EXCLUSIVE MODE;
 SELECT * INTO r FROM base_perm_cleanup_runs WHERE id=_run AND result->>'standard_only_reset'='true' FOR UPDATE;
 IF NOT FOUND OR r.restored THEN RAISE EXCEPTION 'Không tìm thấy lần reset hoặc đã khôi phục.';END IF;
 UPDATE private.legacy_reset_accounts SET active=false WHERE run_id=_run;
 INSERT INTO user_roles(user_id,role_id,created_at,source_kind) SELECT (x->>'user_id')::uuid,x->>'role_id',(x->>'created_at')::timestamptz,x->>'source_kind' FROM jsonb_array_elements(r.removed)x ON CONFLICT DO NOTHING;GET DIAGNOSTICS n=ROW_COUNT;
 UPDATE user_permission_overrides o SET use_custom=(x->>'use_custom')::boolean FROM jsonb_array_elements(r.snapshot->'overrides')x WHERE o.user_id=(x->>'user_id')::uuid AND o.source_kind='legacy' AND o.user_id IN(SELECT user_id FROM private.legacy_reset_accounts WHERE run_id=_run) AND to_jsonb(o)-'use_custom'=x-'use_custom';
 UPDATE base_perm_cleanup_runs SET restored=true,restored_at=now(),restored_by=auth.uid() WHERE id=_run;
 RETURN jsonb_build_object('restored_rows',n,'conflicts','[]'::jsonb,'new_supplements_preserved',true);
END $$;
REVOKE ALL ON FUNCTION private.legacy_reset_applies(uuid),private.legacy_business_allowed(uuid),private.reset_previous_base_rules(uuid,jsonb),private.legacy_regrant_guard() FROM PUBLIC,anon,authenticated,service_role;
REVOKE ALL ON FUNCTION public.base_perm_standard_reset_preview(),public.base_perm_standard_reset_execute(text,text),public.base_perm_standard_reset_restore(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.base_perm_standard_reset_preview(),public.base_perm_standard_reset_execute(text,text),public.base_perm_standard_reset_restore(uuid) TO authenticated;