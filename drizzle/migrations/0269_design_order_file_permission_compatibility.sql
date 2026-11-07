DO $$
DECLARE def text; old_fragment text := '''cancelReason'',''assignee'',''assignedAt'',''assignedBy'',''reviewer'',''workflowKind'']'; new_fragment text := '''cancelReason'',''assignee'',''assignedAt'',''assignedBy'',''reviewer'',''workflowKind'',''draftLink'',''reviseLink'',''deliverLink'']';
BEGIN
 SELECT pg_get_functiondef('private.design_guard()'::regprocedure) INTO def;
 IF position(old_fragment in def)=0 THEN RAISE EXCEPTION 'Design guard definition changed; review before replacement'; END IF;
 EXECUTE replace(def,old_fragment,new_fragment);
END $$;
CREATE OR REPLACE FUNCTION private.design_file_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,private AS $$
DECLARE u uuid:=auth.uid(); f text:=OLD.workflow_kind; k text;
BEGIN
 IF u IS NULL THEN RETURN NEW; END IF;
 FOREACH k IN ARRAY ARRAY['draftLink','reviseLink','deliverLink'] LOOP
  IF NEW.data->k IS DISTINCT FROM OLD.data->k AND NOT private.is_admin(u) AND NOT public.design_can(u,f,'edit') AND NOT public.design_can(u,f,CASE WHEN k='deliverLink' THEN 'deliver' ELSE 'update_draft' END) THEN
   RAISE EXCEPTION 'Không có quyền cập nhật file Order' USING ERRCODE='42501';
  END IF;
 END LOOP;
 RETURN NEW;
END $$;
CREATE TRIGGER design_order_file_guard BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION private.design_file_guard();