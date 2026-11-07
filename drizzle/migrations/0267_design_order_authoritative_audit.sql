CREATE OR REPLACE FUNCTION private.design_audit_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,private AS $$
DECLARE u uuid:=auth.uid(); nm text; ts text:=to_char(now() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'); h jsonb; n int; i int; e jsonb; st text:=NEW.data->>'status'; os text; k text;
BEGIN
 IF u IS NULL THEN RETURN NEW; END IF;
 SELECT coalesce(nullif(full_name,''),username) INTO nm FROM profiles WHERE id=u;
 IF TG_OP='INSERT' THEN
  IF coalesce(NEW.data->>'workflowKind',NEW.workflow_kind) IS NULL THEN RAISE EXCEPTION 'Chọn luồng công việc trước khi tạo'; END IF;
  NEW.data:=(NEW.data-ARRAY['takenAt','submittedAt','deliveredAt','completedAt','cancelReason','reviewNotes'])||jsonb_build_object('revisions',0,'history',jsonb_build_array(jsonb_build_object('at',ts,'byId',u,'byName',nm,'action','Tạo yêu cầu','toStatus',CASE WHEN st='Mới tạo' THEN 'Chờ phân công' ELSE st END)));
  NEW.created_at:=now();
 ELSE
  os:=OLD.data->>'status'; h:=coalesce(NEW.data->'history','[]');n:=jsonb_array_length(coalesce(OLD.data->'history','[]'));
  -- Every added audit event gets the authenticated identity and server timestamp.
  IF jsonb_typeof(h)='array' AND jsonb_array_length(h)>n THEN
   FOR i IN n..jsonb_array_length(h)-1 LOOP
    e:=h->i; e:=e||jsonb_build_object('at',ts,'byId',u,'byName',nm);
    IF st IS DISTINCT FROM os THEN e:=e||jsonb_build_object('fromStatus',os,'toStatus',st);
    ELSE e:=e-ARRAY['fromStatus','toStatus']; END IF;
    h:=jsonb_set(h,ARRAY[i::text],e);
   END LOOP;NEW.data:=NEW.data||jsonb_build_object('history',h);
  END IF;
  IF NEW.data->>'reviewNotes' IS DISTINCT FROM OLD.data->>'reviewNotes' AND st<>'Cần sửa' THEN RAISE EXCEPTION 'Ghi chú duyệt chỉ đổi khi yêu cầu sửa'; END IF;
  IF NEW.data->>'cancelReason' IS DISTINCT FROM OLD.data->>'cancelReason' AND st<>'Đã hủy' THEN RAISE EXCEPTION 'Lý do hủy chỉ đổi khi hủy'; END IF;
  IF coalesce(NEW.data->>'workflowKind',NEW.workflow_kind) IS DISTINCT FROM OLD.workflow_kind AND jsonb_array_length(h)=n THEN
   NEW.data:=NEW.data||jsonb_build_object('history',h||jsonb_build_array(jsonb_build_object('at',ts,'byId',u,'byName',nm,'action','Phân loại luồng công việc','note',coalesce(NEW.data->>'workflowKind',NEW.workflow_kind))));
  END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER design_order_audit_guard BEFORE INSERT OR UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION private.design_audit_guard();