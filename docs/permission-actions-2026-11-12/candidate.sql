-- STAGED ONLY. Separate exact SHA approval required. Independent of full-510 resolver package.
BEGIN;
LOCK TABLE public.tasks,public.socials,public.social_posts,public.websites IN SHARE ROW EXCLUSIVE MODE;
DO $preflight$ BEGIN
IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid=to_regprocedure('private.is_active(uuid)') AND md5(pg_get_functiondef(oid))='74e3dda25d8ca7880f227656cd5fcc7b' AND pg_get_userbyid(proowner)='postgres' AND coalesce(proacl::text,'')='{postgres=X/postgres,authenticated=X/postgres}') THEN RAISE EXCEPTION 'Dependency baseline/owner/ACL mismatch: private.is_active(uuid)'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid=to_regprocedure('private.is_super_admin(uuid)') AND md5(pg_get_functiondef(oid))='687ed3ba3cc6fef74327c3c4b31a0865' AND pg_get_userbyid(proowner)='postgres' AND coalesce(proacl::text,'')='{postgres=X/postgres,authenticated=X/postgres}') THEN RAISE EXCEPTION 'Dependency baseline/owner/ACL mismatch: private.is_super_admin(uuid)'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid=to_regprocedure('public.cw_uid(text)') AND md5(pg_get_functiondef(oid))='e0f752c969b2e82d8423183187e0bfd7' AND pg_get_userbyid(proowner)='postgres' AND coalesce(proacl::text,'')='{postgres=X/postgres,service_role=X/postgres}') THEN RAISE EXCEPTION 'Dependency baseline/owner/ACL mismatch: public.cw_uid(text)'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_proc WHERE oid=to_regprocedure('private.has_permission(uuid,text)') AND md5(pg_get_functiondef(oid))='c57afd7736a787a1cd89d48962f0261e' AND pg_get_userbyid(proowner)='postgres' AND coalesce(proacl::text,'')='{postgres=X/postgres,authenticated=X/postgres}') THEN RAISE EXCEPTION 'Dependency baseline/owner/ACL mismatch: private.has_permission(uuid,text)'; END IF;
IF (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename='tasks')<>5 THEN RAISE EXCEPTION 'Policy count drift: tasks'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tasks' AND policyname='Active users can delete tasks' AND permissive='PERMISSIVE' AND cmd='DELETE' AND coalesce(qual,'')='(private.is_active(auth.uid()) OR private.is_admin(auth.uid()))' AND coalesce(with_check,'')='' AND roles::text='{authenticated}') THEN RAISE EXCEPTION 'Policy drift: tasks/Active users can delete tasks'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tasks' AND policyname='Active users can insert tasks' AND permissive='PERMISSIVE' AND cmd='INSERT' AND coalesce(qual,'')='' AND coalesce(with_check,'')='(private.is_active(auth.uid()) OR private.is_admin(auth.uid()))' AND roles::text='{authenticated}') THEN RAISE EXCEPTION 'Policy drift: tasks/Active users can insert tasks'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tasks' AND policyname='Active users can read tasks' AND permissive='PERMISSIVE' AND cmd='SELECT' AND coalesce(qual,'')='(private.is_active(auth.uid()) OR private.is_admin(auth.uid()))' AND coalesce(with_check,'')='' AND roles::text='{authenticated}') THEN RAISE EXCEPTION 'Policy drift: tasks/Active users can read tasks'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tasks' AND policyname='Active users can update tasks' AND permissive='PERMISSIVE' AND cmd='UPDATE' AND coalesce(qual,'')='(private.is_active(auth.uid()) OR private.is_admin(auth.uid()))' AND coalesce(with_check,'')='(private.is_active(auth.uid()) OR private.is_admin(auth.uid()))' AND roles::text='{authenticated}') THEN RAISE EXCEPTION 'Policy drift: tasks/Active users can update tasks'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tasks' AND policyname='account_active_guard' AND permissive='RESTRICTIVE' AND cmd='ALL' AND coalesce(qual,'')='private.is_active(auth.uid())' AND coalesce(with_check,'')='private.is_active(auth.uid())' AND roles::text='{authenticated}') THEN RAISE EXCEPTION 'Policy drift: tasks/account_active_guard'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_class WHERE oid='public.tasks'::regclass AND relrowsecurity AND pg_get_userbyid(relowner)='postgres' AND coalesce(relacl::text,'')='{postgres=arwdDxtm/postgres,anon=arwdDxtm/postgres,authenticated=arwdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}') THEN RAISE EXCEPTION 'Table owner/ACL drift: tasks'; END IF;
IF (SELECT count(*) FROM pg_trigger WHERE tgrelid='public.tasks'::regclass AND NOT tgisinternal)<>2 THEN RAISE EXCEPTION 'Trigger drift: tasks'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.tasks'::regclass AND tgname='sao_task_reward' AND pg_get_triggerdef(oid)='CREATE TRIGGER sao_task_reward AFTER UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION private.sao_task_event()') THEN RAISE EXCEPTION 'Trigger definition drift: tasks'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.tasks'::regclass AND tgname='set_updated_at_tasks' AND pg_get_triggerdef(oid)='CREATE TRIGGER set_updated_at_tasks BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION set_updated_at()') THEN RAISE EXCEPTION 'Trigger definition drift: tasks'; END IF;
IF (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename='socials')<>5 THEN RAISE EXCEPTION 'Policy count drift: socials'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='socials' AND policyname='Active users can delete socials' AND permissive='PERMISSIVE' AND cmd='DELETE' AND coalesce(qual,'')='(private.is_active(auth.uid()) OR private.is_admin(auth.uid()))' AND coalesce(with_check,'')='' AND roles::text='{authenticated}') THEN RAISE EXCEPTION 'Policy drift: socials/Active users can delete socials'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='socials' AND policyname='Active users can insert socials' AND permissive='PERMISSIVE' AND cmd='INSERT' AND coalesce(qual,'')='' AND coalesce(with_check,'')='(private.is_active(auth.uid()) OR private.is_admin(auth.uid()))' AND roles::text='{authenticated}') THEN RAISE EXCEPTION 'Policy drift: socials/Active users can insert socials'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='socials' AND policyname='Active users can read socials' AND permissive='PERMISSIVE' AND cmd='SELECT' AND coalesce(qual,'')='(private.is_active(auth.uid()) OR private.is_admin(auth.uid()))' AND coalesce(with_check,'')='' AND roles::text='{authenticated}') THEN RAISE EXCEPTION 'Policy drift: socials/Active users can read socials'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='socials' AND policyname='Active users can update socials' AND permissive='PERMISSIVE' AND cmd='UPDATE' AND coalesce(qual,'')='(private.is_active(auth.uid()) OR private.is_admin(auth.uid()))' AND coalesce(with_check,'')='(private.is_active(auth.uid()) OR private.is_admin(auth.uid()))' AND roles::text='{authenticated}') THEN RAISE EXCEPTION 'Policy drift: socials/Active users can update socials'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='socials' AND policyname='account_active_guard' AND permissive='RESTRICTIVE' AND cmd='ALL' AND coalesce(qual,'')='private.is_active(auth.uid())' AND coalesce(with_check,'')='private.is_active(auth.uid())' AND roles::text='{authenticated}') THEN RAISE EXCEPTION 'Policy drift: socials/account_active_guard'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_class WHERE oid='public.socials'::regclass AND relrowsecurity AND pg_get_userbyid(relowner)='postgres' AND coalesce(relacl::text,'')='{postgres=arwdDxtm/postgres,anon=arwdDxtm/postgres,authenticated=arwdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}') THEN RAISE EXCEPTION 'Table owner/ACL drift: socials'; END IF;
IF (SELECT count(*) FROM pg_trigger WHERE tgrelid='public.socials'::regclass AND NOT tgisinternal)<>1 THEN RAISE EXCEPTION 'Trigger drift: socials'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.socials'::regclass AND tgname='set_updated_at_socials' AND pg_get_triggerdef(oid)='CREATE TRIGGER set_updated_at_socials BEFORE UPDATE ON public.socials FOR EACH ROW EXECUTE FUNCTION set_updated_at()') THEN RAISE EXCEPTION 'Trigger definition drift: socials'; END IF;
IF (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename='social_posts')<>5 THEN RAISE EXCEPTION 'Policy count drift: social_posts'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='social_posts' AND policyname='Active users can delete social_posts' AND permissive='PERMISSIVE' AND cmd='DELETE' AND coalesce(qual,'')='(private.is_active(auth.uid()) OR private.is_admin(auth.uid()))' AND coalesce(with_check,'')='' AND roles::text='{authenticated}') THEN RAISE EXCEPTION 'Policy drift: social_posts/Active users can delete social_posts'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='social_posts' AND policyname='Active users can insert social_posts' AND permissive='PERMISSIVE' AND cmd='INSERT' AND coalesce(qual,'')='' AND coalesce(with_check,'')='(private.is_active(auth.uid()) OR private.is_admin(auth.uid()))' AND roles::text='{authenticated}') THEN RAISE EXCEPTION 'Policy drift: social_posts/Active users can insert social_posts'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='social_posts' AND policyname='Active users can read social_posts' AND permissive='PERMISSIVE' AND cmd='SELECT' AND coalesce(qual,'')='(private.is_active(auth.uid()) OR private.is_admin(auth.uid()))' AND coalesce(with_check,'')='' AND roles::text='{authenticated}') THEN RAISE EXCEPTION 'Policy drift: social_posts/Active users can read social_posts'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='social_posts' AND policyname='Active users can update social_posts' AND permissive='PERMISSIVE' AND cmd='UPDATE' AND coalesce(qual,'')='(private.is_active(auth.uid()) OR private.is_admin(auth.uid()))' AND coalesce(with_check,'')='(private.is_active(auth.uid()) OR private.is_admin(auth.uid()))' AND roles::text='{authenticated}') THEN RAISE EXCEPTION 'Policy drift: social_posts/Active users can update social_posts'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='social_posts' AND policyname='account_active_guard' AND permissive='RESTRICTIVE' AND cmd='ALL' AND coalesce(qual,'')='private.is_active(auth.uid())' AND coalesce(with_check,'')='private.is_active(auth.uid())' AND roles::text='{authenticated}') THEN RAISE EXCEPTION 'Policy drift: social_posts/account_active_guard'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_class WHERE oid='public.social_posts'::regclass AND relrowsecurity AND pg_get_userbyid(relowner)='postgres' AND coalesce(relacl::text,'')='{postgres=arwdDxtm/postgres,anon=arwdDxtm/postgres,authenticated=arwdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}') THEN RAISE EXCEPTION 'Table owner/ACL drift: social_posts'; END IF;
IF (SELECT count(*) FROM pg_trigger WHERE tgrelid='public.social_posts'::regclass AND NOT tgisinternal)<>1 THEN RAISE EXCEPTION 'Trigger drift: social_posts'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.social_posts'::regclass AND tgname='set_updated_at_social_posts' AND pg_get_triggerdef(oid)='CREATE TRIGGER set_updated_at_social_posts BEFORE UPDATE ON public.social_posts FOR EACH ROW EXECUTE FUNCTION set_updated_at()') THEN RAISE EXCEPTION 'Trigger definition drift: social_posts'; END IF;
IF (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename='websites')<>5 THEN RAISE EXCEPTION 'Policy count drift: websites'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='websites' AND policyname='Active users can delete websites' AND permissive='PERMISSIVE' AND cmd='DELETE' AND coalesce(qual,'')='(private.is_active(auth.uid()) OR private.is_admin(auth.uid()))' AND coalesce(with_check,'')='' AND roles::text='{authenticated}') THEN RAISE EXCEPTION 'Policy drift: websites/Active users can delete websites'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='websites' AND policyname='Active users can insert websites' AND permissive='PERMISSIVE' AND cmd='INSERT' AND coalesce(qual,'')='' AND coalesce(with_check,'')='(private.is_active(auth.uid()) OR private.is_admin(auth.uid()))' AND roles::text='{authenticated}') THEN RAISE EXCEPTION 'Policy drift: websites/Active users can insert websites'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='websites' AND policyname='Active users can read websites' AND permissive='PERMISSIVE' AND cmd='SELECT' AND coalesce(qual,'')='(private.is_active(auth.uid()) OR private.is_admin(auth.uid()))' AND coalesce(with_check,'')='' AND roles::text='{authenticated}') THEN RAISE EXCEPTION 'Policy drift: websites/Active users can read websites'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='websites' AND policyname='Active users can update websites' AND permissive='PERMISSIVE' AND cmd='UPDATE' AND coalesce(qual,'')='(private.is_active(auth.uid()) OR private.is_admin(auth.uid()))' AND coalesce(with_check,'')='(private.is_active(auth.uid()) OR private.is_admin(auth.uid()))' AND roles::text='{authenticated}') THEN RAISE EXCEPTION 'Policy drift: websites/Active users can update websites'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='websites' AND policyname='account_active_guard' AND permissive='RESTRICTIVE' AND cmd='ALL' AND coalesce(qual,'')='private.is_active(auth.uid())' AND coalesce(with_check,'')='private.is_active(auth.uid())' AND roles::text='{authenticated}') THEN RAISE EXCEPTION 'Policy drift: websites/account_active_guard'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_class WHERE oid='public.websites'::regclass AND relrowsecurity AND pg_get_userbyid(relowner)='postgres' AND coalesce(relacl::text,'')='{postgres=arwdDxtm/postgres,anon=arwdDxtm/postgres,authenticated=arwdDxtm/postgres,service_role=arwdDxtm/postgres,sandbox_exec=ar/postgres}') THEN RAISE EXCEPTION 'Table owner/ACL drift: websites'; END IF;
IF (SELECT count(*) FROM pg_trigger WHERE tgrelid='public.websites'::regclass AND NOT tgisinternal)<>1 THEN RAISE EXCEPTION 'Trigger drift: websites'; END IF;
IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.websites'::regclass AND tgname='set_updated_at_websites' AND pg_get_triggerdef(oid)='CREATE TRIGGER set_updated_at_websites BEFORE UPDATE ON public.websites FOR EACH ROW EXECUTE FUNCTION set_updated_at()') THEN RAISE EXCEPTION 'Trigger definition drift: websites'; END IF;
IF to_regprocedure('private.content_action_can(uuid,text)') IS NOT NULL THEN RAISE EXCEPTION 'Already applied or helper collision: content_action_can(uuid,text)'; END IF;
IF to_regprocedure('private.content_actor(uuid,jsonb,text)') IS NOT NULL THEN RAISE EXCEPTION 'Already applied or helper collision: content_actor(uuid,jsonb,text)'; END IF;
IF to_regprocedure('private.content_related(uuid,text,uuid,jsonb)') IS NOT NULL THEN RAISE EXCEPTION 'Already applied or helper collision: content_related(uuid,text,uuid,jsonb)'; END IF;
IF to_regprocedure('private.content_read(uuid,text,uuid,jsonb)') IS NOT NULL THEN RAISE EXCEPTION 'Already applied or helper collision: content_read(uuid,text,uuid,jsonb)'; END IF;
IF to_regprocedure('private.content_require(uuid,text)') IS NOT NULL THEN RAISE EXCEPTION 'Already applied or helper collision: content_require(uuid,text)'; END IF;
IF to_regprocedure('private.content_write_guard()') IS NOT NULL THEN RAISE EXCEPTION 'Already applied or helper collision: content_write_guard()'; END IF;
IF (SELECT count(*) FROM base_permission_catalog)<>510 THEN RAISE EXCEPTION 'Catalog drift'; END IF;
IF md5(coalesce((select string_agg(id||':'||coalesce(permissions::text,''),'|' order by id) from app_roles),''))<>'9f579679928570fcb221e4177065be8e' THEN RAISE EXCEPTION 'Role baseline drift'; END IF;
END $preflight$;
-- ===== CHANGES =====
-- Executable implementation; loaded after preflight by candidate.sql. Not applied live.
CREATE FUNCTION private.content_action_can(u uuid,p text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,private AS $$
 SELECT u IS NOT NULL AND private.is_active(u) AND
 (private.is_super_admin(u) OR private.has_permission(u,p));
$$;
CREATE FUNCTION private.content_actor(u uuid,d jsonb,k text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,private AS $$
 -- Stable IDs take precedence. Legacy names only resolve when unique and active.
 SELECT u IS NOT NULL AND CASE WHEN coalesce(d->>(k||'Id'),'')<>''
 THEN d->>(k||'Id')=u::text ELSE public.cw_uid(d->>k)=u END;
$$;
CREATE FUNCTION private.content_related(u uuid,t text,c uuid,d jsonb) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,private AS $$
 SELECT c=u OR EXISTS(SELECT 1 FROM unnest(CASE t
 WHEN 'tasks' THEN ARRAY['assignee','reporter','approver']
 WHEN 'social_posts' THEN ARRAY['writer','designer','reviewer','publisher']
 WHEN 'socials' THEN ARRAY['owner']
 WHEN 'websites' THEN ARRAY['seoOwner','contentOwner','techOwner']
 ELSE ARRAY[]::text[] END) k WHERE private.content_actor(u,d,k))
 OR (t='tasks' AND EXISTS(SELECT 1 FROM jsonb_array_elements_text(
 CASE WHEN jsonb_typeof(d->'relatedPeople')='array' THEN d->'relatedPeople' ELSE '[]'::jsonb END) n
 WHERE public.cw_uid(n)=u));
$$;
CREATE FUNCTION private.content_read(u uuid,t text,c uuid,d jsonb) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,private AS $$
 SELECT u IS NOT NULL AND private.is_active(u) AND (private.is_super_admin(u) OR
 (private.content_action_can(u,CASE t WHEN 'tasks' THEN 'task.view' WHEN 'social_posts' THEN 'social.post_view'
 WHEN 'socials' THEN 'social.view' WHEN 'websites' THEN 'web.view' ELSE 'invalid' END)
 AND (private.content_action_can(u,CASE t WHEN 'tasks' THEN 'task.view_all' WHEN 'social_posts' THEN 'social.post_view_all'
 WHEN 'socials' THEN 'social.view_all' WHEN 'websites' THEN 'web.view_all' ELSE 'invalid' END)
 OR private.content_related(u,t,c,d))));
$$;
CREATE FUNCTION private.content_require(u uuid,p text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,private AS $$
 BEGIN IF NOT private.content_action_can(u,p) THEN RAISE EXCEPTION 'Missing permission: %',p USING ERRCODE='42501'; END IF; END;
$$;
CREATE FUNCTION private.content_write_guard() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,private AS $$
DECLARE u uuid:=auth.uid(); t text:=TG_TABLE_NAME; d jsonb; od jsonb:='{}'; k text; p text;
 os text; ns text; action_ text; actor_field text; history_ jsonb; old_history jsonb;
 core_keys text[]; reserved text[]; h jsonb; nm text;
BEGIN
 IF u IS NULL THEN
  IF current_setting('role',true) IN ('service_role','postgres','none') THEN
   IF TG_OP='DELETE' THEN RETURN OLD; END IF; RETURN NEW;
  END IF;
  RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501';
 END IF;
 IF NOT private.is_active(u) THEN RAISE EXCEPTION 'Inactive account' USING ERRCODE='42501'; END IF;
 p:=CASE t WHEN 'tasks' THEN 'task.' WHEN 'social_posts' THEN 'social.post_' WHEN 'socials' THEN 'social.' WHEN 'websites' THEN 'web.' ELSE NULL END;
 IF p IS NULL THEN RAISE EXCEPTION 'Unsupported guarded resource'; END IF;
 IF TG_OP<>'INSERT' THEN
  od:=OLD.data;
  IF NOT private.content_read(u,t,OLD.created_by,od) THEN RAISE EXCEPTION 'Resource outside scope' USING ERRCODE='42501'; END IF;
 END IF;
 IF TG_OP='DELETE' THEN
  PERFORM private.content_require(u,p||'delete');
  IF jsonb_array_length(coalesce(od->'history','[]'))>0 THEN RAISE EXCEPTION 'Cancel instead of deleting history'; END IF;
  RETURN OLD;
 END IF;
 d:=NEW.data; ns:=d->>'status'; os:=od->>'status';
 IF t='tasks' AND (ns IS NULL OR ns NOT IN ('Mới tạo','Đã giao','Đang làm','Chờ xác nhận','Cần sửa','Hoàn thành','Đã hủy')) THEN RAISE EXCEPTION 'Invalid task state'; END IF;
 IF t='social_posts' AND (ns IS NULL OR ns NOT IN ('Kế hoạch','Đang làm','Chờ duyệt','Cần sửa','Đã duyệt','Chờ đăng','Đã đăng','Hoàn thành','Đã hủy')) THEN RAISE EXCEPTION 'Invalid social state'; END IF;
 IF TG_OP='INSERT' THEN
  PERFORM private.content_require(u,p||'create');
  IF NEW.created_by IS DISTINCT FROM u THEN RAISE EXCEPTION 'Creator spoofing' USING ERRCODE='42501'; END IF;
  IF t='tasks' AND ns NOT IN ('Mới tạo','Đã giao') THEN RAISE EXCEPTION 'Invalid initial state'; END IF;
  IF t='tasks' AND ns='Đã giao' THEN PERFORM private.content_require(u,'task.assign'); END IF;
  IF t='social_posts' AND ns IS DISTINCT FROM 'Kế hoạch' THEN RAISE EXCEPTION 'Invalid initial state'; END IF;
  IF t='tasks' AND EXISTS(SELECT 1 FROM unnest(ARRAY['acceptedAt','submittedAt','completedAt','cancelledAt','submittedBy','revisions']) f WHERE d->f IS NOT NULL AND d->f<>'null'::jsonb AND d->f<>'0'::jsonb) THEN RAISE EXCEPTION 'Cannot seed workflow results'; END IF;
  IF t='social_posts' AND coalesce((d->>'revisions')::integer,0)<>0 THEN RAISE EXCEPTION 'Cannot seed workflow results'; END IF;
 ELSE
  IF NEW.id IS DISTINCT FROM OLD.id OR NEW.created_by IS DISTINCT FROM OLD.created_by OR NEW.created_at IS DISTINCT FROM OLD.created_at OR NEW.is_demo IS DISTINCT FROM OLD.is_demo THEN RAISE EXCEPTION 'Immutable resource identity' USING ERRCODE='42501'; END IF;
 END IF;
 IF t='tasks' THEN
  core_keys:=ARRAY['title','description','brandId','module','relatedLink','relatedPeople','notes','link','plan','topic','inputLink'];
  reserved:=ARRAY['reporter','reporterId','approver','approverId','assignee','assigneeId','deadline','priority','resultLink','handoverLink','processNote','completionNote','completionFiles','relatedDocumentLink','revisionNote','revisions','acceptedAt','submittedAt','completedAt','cancelledAt','submittedBy','createdAt'];
 ELSIF t='social_posts' THEN
  core_keys:=ARRAY['title','brandId','channelId','platform','contentType','topic','plan','scheduledDate','caption','mediaLink','notes'];
  reserved:=ARRAY['writer','writerId','designer','designerId','reviewer','reviewerId','publisher','publisherId','publishedDate','publishedLink','reviewNotes','revisions'];
 ELSIF t='socials' THEN
  core_keys:=ARRAY['name','platform','url','brandId','frequency','goal','status','notes']; reserved:=ARRAY['owner','ownerId'];
 ELSE
  core_keys:=ARRAY['name','url','brandId','type','status','goal','notes']; reserved:=ARRAY['seoOwner','seoOwnerId','contentOwner','contentOwnerId','techOwner','techOwnerId'];
 END IF;
 -- Every changed JSON field is accounted for; generic edit never bypasses a specialized action.
 FOR k IN SELECT key FROM (SELECT jsonb_object_keys(d) key UNION SELECT jsonb_object_keys(od)) fields LOOP
  IF d->k IS NOT DISTINCT FROM od->k OR k IN ('status','history') THEN CONTINUE; END IF;
  IF k=ANY(core_keys) THEN IF TG_OP='UPDATE' THEN PERFORM private.content_require(u,p||'edit'); END IF;
  ELSIF t='tasks' AND k IN ('reporter','reporterId','approver','approverId') THEN
   IF TG_OP='UPDATE' THEN
    PERFORM private.content_require(u,'task.assign');
    IF os NOT IN ('Mới tạo','Đã giao') THEN RAISE EXCEPTION 'Cannot replace workflow actor after work starts' USING ERRCODE='42501'; END IF;
   END IF;
  ELSIF t='tasks' AND k IN ('assignee','assigneeId') THEN PERFORM private.content_require(u,'task.edit_assignee');
  ELSIF t='tasks' AND k='deadline' THEN IF TG_OP='UPDATE' THEN PERFORM private.content_require(u,'task.edit_deadline'); END IF;
  ELSIF t='tasks' AND k='priority' THEN IF TG_OP='UPDATE' THEN PERFORM private.content_require(u,'task.edit_priority'); END IF;
  ELSIF t='tasks' AND k IN ('resultLink','handoverLink','processNote','completionNote','completionFiles','relatedDocumentLink') THEN
   PERFORM private.content_require(u,'task.update_result');
   IF NOT private.is_super_admin(u) AND NOT coalesce(private.content_actor(u,od,'assignee'),false) THEN RAISE EXCEPTION 'Only assigned worker may update result' USING ERRCODE='42501'; END IF;
  ELSIF t='social_posts' AND k IN ('writer','writerId','designer','designerId','reviewer','reviewerId','publisher','publisherId') THEN
   PERFORM private.content_require(u,'social.post_assign');
   IF TG_OP='UPDATE' AND k IN ('reviewer','reviewerId') AND os='Chờ duyệt' THEN RAISE EXCEPTION 'Cannot replace pending reviewer' USING ERRCODE='42501'; END IF;
  ELSIF t='social_posts' AND k IN ('publishedDate','publishedLink') THEN
   PERFORM private.content_require(u,'social.post_confirm_published');
   IF NOT private.is_super_admin(u) AND NOT coalesce(private.content_actor(u,od,'publisher'),false) THEN RAISE EXCEPTION 'Only publisher may edit publication' USING ERRCODE='42501'; END IF;
  ELSIF t='socials' AND k IN ('owner','ownerId') THEN PERFORM private.content_require(u,'social.assign_owner');
  ELSIF t='websites' AND k IN ('seoOwner','seoOwnerId') THEN PERFORM private.content_require(u,'web.assign_seo');
  ELSIF t='websites' AND k IN ('contentOwner','contentOwnerId') THEN PERFORM private.content_require(u,'web.assign_content');
  ELSIF t='websites' AND k IN ('techOwner','techOwnerId') THEN PERFORM private.content_require(u,'web.assign_tech');
  ELSIF k=ANY(reserved) THEN
   IF TG_OP='INSERT' AND k='createdAt' THEN NULL;
   ELSIF ns IS NOT DISTINCT FROM os THEN RAISE EXCEPTION 'Workflow metadata cannot be edited: %',k USING ERRCODE='42501'; END IF;
  ELSE RAISE EXCEPTION 'Unknown field: %',k USING ERRCODE='42501'; END IF;
 END LOOP;
 -- IDs/names identifying an actor must resolve to the same active person, never a duplicate name.
 FOREACH k IN ARRAY CASE t WHEN 'tasks' THEN ARRAY['assignee','reporter','approver'] WHEN 'social_posts' THEN ARRAY['writer','designer','reviewer','publisher'] WHEN 'socials' THEN ARRAY['owner'] ELSE ARRAY['seoOwner','contentOwner','techOwner'] END LOOP
  IF (d->k IS DISTINCT FROM od->k OR d->(k||'Id') IS DISTINCT FROM od->(k||'Id')) AND coalesce(d->>k,d->>(k||'Id'),'')<>'' THEN
   IF coalesce(d->>(k||'Id'),'')<>'' THEN
    IF NOT EXISTS(SELECT 1 FROM profiles WHERE id::text=d->>(k||'Id') AND status='Đang hoạt động' AND (coalesce(d->>k,'')='' OR public.cw_uid(d->>k)=id)) THEN RAISE EXCEPTION 'Invalid or ambiguous actor: %',k; END IF;
   ELSIF public.cw_uid(d->>k) IS NULL THEN RAISE EXCEPTION 'Invalid or ambiguous actor: %',k; END IF;
  END IF;
 END LOOP;
 IF TG_OP='UPDATE' AND t IN ('socials','websites') AND ns IS DISTINCT FROM os THEN PERFORM private.content_require(u,p||'edit'); END IF;
 IF TG_OP='UPDATE' AND t IN ('tasks','social_posts') AND ns IS DISTINCT FROM os THEN
  action_:=NULL; actor_field:=NULL;
  IF t='tasks' THEN
   action_:=CASE WHEN os='Mới tạo' AND ns='Đã giao' THEN 'assign' WHEN os='Đã giao' AND ns='Đang làm' THEN 'start'
   WHEN os='Đang làm' AND ns='Chờ xác nhận' THEN 'submit_completion' WHEN os='Cần sửa' AND ns='Chờ xác nhận' THEN 'resubmit_completion'
   WHEN os='Chờ xác nhận' AND ns='Hoàn thành' THEN 'approve_completion' WHEN os='Chờ xác nhận' AND ns='Cần sửa' THEN 'request_revision'
   WHEN os='Hoàn thành' AND ns='Đang làm' THEN 'reopen_completed' WHEN os='Đã hủy' AND ns='Mới tạo' THEN 'restore'
   WHEN os NOT IN ('Hoàn thành','Đã hủy') AND ns='Đã hủy' THEN 'cancel' END;
   IF action_ IN ('start','submit_completion','resubmit_completion') THEN actor_field:='assignee'; END IF;
   IF action_ IN ('approve_completion','request_revision') THEN actor_field:='approver'; END IF;
  ELSE
   action_:=CASE WHEN os='Kế hoạch' AND ns='Đang làm' THEN 'start' WHEN os='Đang làm' AND ns='Chờ duyệt' THEN 'submit'
   WHEN os='Cần sửa' AND ns='Chờ duyệt' THEN 'resubmit' WHEN os='Chờ duyệt' AND ns='Đã duyệt' THEN 'approve'
   WHEN os='Chờ duyệt' AND ns='Cần sửa' THEN 'request_changes' WHEN os='Đã duyệt' AND ns='Chờ đăng' THEN 'move_pending_publish'
   WHEN os='Chờ đăng' AND ns='Đã đăng' THEN 'confirm_published' WHEN os='Đã đăng' AND ns='Hoàn thành' THEN 'complete'
   WHEN os='Đã hủy' AND ns='Kế hoạch' THEN 'restore' WHEN os NOT IN ('Hoàn thành','Đã hủy') AND ns='Đã hủy' THEN 'cancel' END;
   IF action_ IN ('start','submit','resubmit') THEN actor_field:='writer'; END IF;
   IF action_ IN ('approve','request_changes') THEN actor_field:='reviewer'; END IF;
   IF action_ IN ('move_pending_publish','confirm_published','complete') THEN actor_field:='publisher'; END IF;
  END IF;
  IF action_ IS NULL THEN
   PERFORM private.content_require(u,p||'force_status'); action_:='force_status';
  ELSE PERFORM private.content_require(u,p||action_); END IF;
  IF NOT private.is_super_admin(u) AND actor_field IS NOT NULL AND NOT coalesce(private.content_actor(u,od,actor_field),false) THEN RAISE EXCEPTION 'Wrong workflow actor' USING ERRCODE='42501'; END IF;
  IF action_ IN ('approve','request_changes','approve_completion','request_revision') AND NOT private.is_super_admin(u) AND private.content_actor(u,od,CASE t WHEN 'tasks' THEN 'assignee' ELSE 'writer' END) THEN RAISE EXCEPTION 'Self approval forbidden' USING ERRCODE='42501'; END IF;
  IF action_ IN ('cancel','restore','reopen_completed','assign','force_status') AND NOT private.is_super_admin(u) AND NOT (OLD.created_by=u OR private.content_actor(u,od,CASE t WHEN 'tasks' THEN 'reporter' ELSE 'reviewer' END)) THEN RAISE EXCEPTION 'Only requester/coordinator may control lifecycle' USING ERRCODE='42501'; END IF;
  IF action_='assign' AND coalesce(d->>'assignee','')='' THEN RAISE EXCEPTION 'Assignee required'; END IF;
  IF action_ IN ('request_revision','request_changes') AND coalesce(trim(d->>CASE t WHEN 'tasks' THEN 'revisionNote' ELSE 'reviewNotes' END),'')='' THEN RAISE EXCEPTION 'Revision reason required'; END IF;
  -- Do not let the client forge completion identity or workflow counters/timestamps.
  IF t='tasks' THEN
   d:=d||jsonb_build_object('createdAt',od->'createdAt','acceptedAt',od->'acceptedAt','submittedAt',od->'submittedAt','completedAt',od->'completedAt','cancelledAt',od->'cancelledAt','revisions',od->'revisions','submittedBy',od->'submittedBy');
   IF action_='start' THEN d:=d||jsonb_build_object('acceptedAt',clock_timestamp()); END IF;
   IF action_ IN ('submit_completion','resubmit_completion') THEN d:=d||jsonb_build_object('submittedAt',clock_timestamp(),'submittedBy',u); END IF;
   IF action_='approve_completion' THEN d:=d||jsonb_build_object('completedAt',clock_timestamp()); END IF;
   IF action_='cancel' THEN d:=d||jsonb_build_object('cancelledAt',clock_timestamp()); END IF;
   IF action_='restore' THEN d:=d||jsonb_build_object('cancelledAt',null); END IF;
   IF action_='reopen_completed' THEN d:=d||jsonb_build_object('completedAt',null); END IF;
  END IF;
  IF t='social_posts' THEN d:=d||jsonb_build_object('revisions',od->'revisions'); END IF;
  IF action_ IN ('request_revision','request_changes') THEN d:=d||jsonb_build_object('revisions',coalesce((od->>'revisions')::integer,0)+1); END IF;
 END IF;
 history_:=coalesce(d->'history','[]'); old_history:=coalesce(od->'history','[]');
 IF jsonb_typeof(history_)<>'array' OR jsonb_typeof(old_history)<>'array' THEN RAISE EXCEPTION 'Invalid history'; END IF;
 IF TG_OP='INSERT' THEN history_:='[]'; old_history:='[]';
 ELSIF jsonb_array_length(history_)<jsonb_array_length(old_history) OR EXISTS(SELECT 1 FROM jsonb_array_elements(old_history) WITH ORDINALITY e(v,n) WHERE history_->((n-1)::integer) IS DISTINCT FROM v) THEN RAISE EXCEPTION 'History is append only'; END IF;
 IF TG_OP='UPDATE' AND ns IS NOT DISTINCT FROM os AND history_ IS DISTINCT FROM old_history THEN
  PERFORM private.content_require(u,CASE t WHEN 'tasks' THEN 'task.add_note' ELSE p||'edit' END);
 END IF;
 SELECT full_name INTO nm FROM profiles WHERE id=u;
 IF TG_OP='INSERT' OR d IS DISTINCT FROM od THEN
  h:=jsonb_build_object('at',clock_timestamp(),'byId',u,'byName',nm,'action',coalesce(action_,lower(TG_OP)),'fromStatus',os,'toStatus',ns);
  IF jsonb_array_length(history_)>jsonb_array_length(old_history) THEN h:=h||jsonb_build_object('note',history_->(jsonb_array_length(history_)-1)->>'note'); END IF;
  d:=d||jsonb_build_object('history',old_history||jsonb_build_array(h));
 END IF;
 NEW.data:=d; RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.content_action_can(uuid,text),private.content_actor(uuid,jsonb,text),private.content_related(uuid,text,uuid,jsonb),private.content_read(uuid,text,uuid,jsonb),private.content_require(uuid,text),private.content_write_guard() FROM PUBLIC,anon,authenticated;
-- RLS may call only the read wrapper; helper execution and trigger bodies are not public APIs.
GRANT EXECUTE ON FUNCTION private.content_read(uuid,text,uuid,jsonb) TO authenticated;
CREATE POLICY content_action_read ON public.tasks AS RESTRICTIVE FOR SELECT TO authenticated USING (private.content_read((SELECT auth.uid()),'tasks',created_by,data));
CREATE POLICY content_action_read ON public.socials AS RESTRICTIVE FOR SELECT TO authenticated USING (private.content_read((SELECT auth.uid()),'socials',created_by,data));
CREATE POLICY content_action_read ON public.social_posts AS RESTRICTIVE FOR SELECT TO authenticated USING (private.content_read((SELECT auth.uid()),'social_posts',created_by,data));
CREATE POLICY content_action_read ON public.websites AS RESTRICTIVE FOR SELECT TO authenticated USING (private.content_read((SELECT auth.uid()),'websites',created_by,data));
CREATE TRIGGER content_action_write BEFORE INSERT OR UPDATE OR DELETE ON public.tasks FOR EACH ROW EXECUTE FUNCTION private.content_write_guard();
CREATE TRIGGER content_action_write BEFORE INSERT OR UPDATE OR DELETE ON public.socials FOR EACH ROW EXECUTE FUNCTION private.content_write_guard();
CREATE TRIGGER content_action_write BEFORE INSERT OR UPDATE OR DELETE ON public.social_posts FOR EACH ROW EXECUTE FUNCTION private.content_write_guard();
CREATE TRIGGER content_action_write BEFORE INSERT OR UPDATE OR DELETE ON public.websites FOR EACH ROW EXECUTE FUNCTION private.content_write_guard();
COMMIT;
