ALTER TABLE public.orders ADD COLUMN workflow_kind text;
COMMENT ON COLUMN public.orders.workflow_kind IS 'Design workflow independent of data.type; NULL means legacy unclassified.';
ALTER TABLE public.orders ADD CONSTRAINT orders_workflow_kind_valid CHECK(workflow_kind IS NULL OR workflow_kind IN ('photo','marketing_design','order_mockup'));
UPDATE public.orders o SET workflow_kind='marketing_design', data=o.data||jsonb_build_object('workflowKind','marketing_design') WHERE o.workflow_kind IS NULL AND o.data->>'sourceModule'='Content Web' AND EXISTS(SELECT 1 FROM public.web_contents c WHERE c.id=o.data->>'contentId');
CREATE INDEX orders_workflow_created ON public.orders(workflow_kind,created_at DESC);
CREATE OR REPLACE FUNCTION public.design_can(_uid uuid,_flow text,_action text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,private AS $$
 SELECT private.is_active(_uid) AND (private.is_admin(_uid) OR CASE WHEN EXISTS(SELECT 1 FROM unnest(ARRAY['photo','marketing_design','order_mockup']) f WHERE private.has_permission(_uid,'order.'||f||'.'||_action)) THEN _flow IS NOT NULL AND private.has_permission(_uid,'order.'||_flow||'.'||_action) ELSE private.has_permission(_uid,'order.'||_action) END);
$$;
CREATE OR REPLACE FUNCTION private.design_person(_uid uuid,_name text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT coalesce(_name,'')<>'' AND EXISTS(SELECT 1 FROM profiles WHERE id=_uid AND status='Đang hoạt động' AND (_name=full_name OR _name=username)); $$;
CREATE OR REPLACE FUNCTION private.design_read(_uid uuid,_creator uuid,_data jsonb,_flow text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,private AS $$
 SELECT private.is_active(_uid) AND (private.is_admin(_uid) OR (public.design_can(_uid,_flow,'view') AND (public.design_can(_uid,_flow,'view_all') OR public.design_can(_uid,_flow,'assign') OR _creator=_uid OR private.design_person(_uid,_data->>'requester') OR private.design_person(_uid,_data->>'assignee') OR private.design_person(_uid,coalesce(nullif(_data->>'reviewer',''),_data->>'requester')) OR (coalesce(_data->>'assignee','')='' AND _data->>'status' IN ('Chờ phân công','Mới tạo') AND public.design_can(_uid,_flow,'take')))));
$$;
CREATE POLICY design_scoped_read ON public.orders AS RESTRICTIVE FOR SELECT TO authenticated USING(private.design_read(auth.uid(),created_by,data,workflow_kind));
REVOKE ALL ON FUNCTION public.design_can(uuid,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.design_can(uuid,text,text) TO authenticated,service_role;