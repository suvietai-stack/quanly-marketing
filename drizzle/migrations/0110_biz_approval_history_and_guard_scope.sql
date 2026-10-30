DO $$DECLARE def text;BEGIN
 SELECT pg_get_functiondef('public.biz_approvals_read()'::regprocedure) INTO def;
 IF position('v.status=''pending'' AND public.biz_goal_can_read' IN def)=0 OR position('d.kind=''report'' AND v.status=''pending''' IN def)=0 THEN RAISE EXCEPTION 'Không khớp định nghĩa trung tâm hiện tại'; END IF;
 def:=replace(def,'v.status=''pending'' AND public.biz_goal_can_read','v.status IN (''pending'',''approved'',''changes'') AND public.biz_goal_can_read');
 def:=replace(def,'d.kind=''report'' AND v.status=''pending''','d.kind=''report'' AND v.status IN (''pending'',''approved'',''changes'')');
 def:=replace(def,'''can_act'',public.biz_goal_can_review','''can_act'',v.status=''pending'' AND public.biz_goal_can_review');
 def:=replace(def,'''can_act'',public.biz_doc_access','''can_act'',v.status=''pending'' AND public.biz_doc_access');
 def:=replace(def,'''events'',''[]''::jsonb) FROM public.biz_document_versions','''events'',(SELECT coalesce(jsonb_agg(to_jsonb(e)||jsonb_build_object(''actor_name'',ep.full_name) ORDER BY e.created_at),''[]'') FROM public.biz_document_events e JOIN public.profiles ep ON ep.id=e.actor_id WHERE e.version_id=v.id)) FROM public.biz_document_versions');
 EXECUTE def;
END $$;
CREATE OR REPLACE FUNCTION public.biz_org_can_manage() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND status='Đang hoạt động') AND (public.is_super_admin(auth.uid()) OR private.sig_can(auth.uid(),'biz.org_manage')) $$;
CREATE OR REPLACE FUNCTION public.biz_workflow_manage() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND status='Đang hoạt động') AND (public.is_super_admin(auth.uid()) OR private.sig_can(auth.uid(),'biz.workflow_manage')) $$;
DO $$DECLARE def text;BEGIN
 SELECT pg_get_functiondef('public.biz_workflow_save(jsonb)'::regprocedure) INTO def;
 def:=replace(def,'fam:=old.family_id; ver:=old.version+1;', 'fam:=old.family_id; SELECT coalesce(max(version),0)+1 INTO ver FROM public.biz_approval_workflows WHERE family_id=fam;');
 EXECUTE def;
END $$;