CREATE OR REPLACE FUNCTION private.design_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,private AS $$
DECLARE u uuid:=auth.uid(); f text; d jsonb; od jsonb; st text; os text; req boolean; own boolean; rev boolean; mgr boolean; admin boolean; k text; h jsonb; oh jsonb; nm text; ts text:=to_char(now() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
BEGIN
 IF u IS NULL THEN IF current_setting('role',true) IN ('anon','authenticated') THEN RAISE EXCEPTION 'Chưa đăng nhập' USING ERRCODE='42501'; END IF; IF TG_OP='DELETE' THEN RETURN OLD; END IF; RETURN NEW; END IF;
 IF NOT private.is_active(u) THEN RAISE EXCEPTION 'Tài khoản không hoạt động' USING ERRCODE='42501'; END IF;
 admin:=private.is_admin(u);
 IF TG_OP='DELETE' THEN
   IF NOT private.design_read(u,OLD.created_by,OLD.data,OLD.workflow_kind) OR NOT public.design_can(u,OLD.workflow_kind,'delete') THEN RAISE EXCEPTION 'Không có quyền xóa Order' USING ERRCODE='42501'; END IF;
   IF jsonb_array_length(coalesce(OLD.data->'history','[]'))>0 THEN RAISE EXCEPTION 'Order có lịch sử; hãy hủy thay vì xóa'; END IF; RETURN OLD;
 END IF;
 d:=NEW.data; f:=coalesce(nullif(d->>'workflowKind',''),NEW.workflow_kind);
 IF f IS NOT NULL AND f NOT IN ('photo','marketing_design','order_mockup') THEN RAISE EXCEPTION 'Luồng không hợp lệ'; END IF;
 NEW.workflow_kind:=f; IF f IS NOT NULL THEN d:=d||jsonb_build_object('workflowKind',f); END IF;
 st:=coalesce(d->>'status','Chờ phân công'); IF st='Mới tạo' THEN st:='Chờ phân công'; END IF; IF st='Đang làm' THEN st:='Đang thực hiện'; END IF;
 h:=coalesce(d->'history','[]'); IF jsonb_typeof(h)<>'array' THEN RAISE EXCEPTION 'Lịch sử không hợp lệ'; END IF;
 SELECT coalesce(nullif(full_name,''),username) INTO nm FROM profiles WHERE id=u;
 IF TG_OP='INSERT' THEN
   IF NOT public.design_can(u,f,'create') THEN RAISE EXCEPTION 'Không có quyền tạo Order trong luồng này' USING ERRCODE='42501'; END IF;
   IF NEW.created_by IS DISTINCT FROM u THEN RAISE EXCEPTION 'Người tạo không hợp lệ' USING ERRCODE='42501'; END IF;
   IF NOT admin AND NOT private.design_person(u,d->>'requester') THEN RAISE EXCEPTION 'Người yêu cầu phải là tài khoản tạo Order' USING ERRCODE='42501'; END IF;
   IF coalesce(d->>'assignee','')<>'' AND NOT public.design_can(u,f,'assign') THEN RAISE EXCEPTION 'Không có quyền phân công' USING ERRCODE='42501'; END IF;
   IF st NOT IN ('Chờ phân công','Chờ nhận việc') THEN RAISE EXCEPTION 'Trạng thái khởi tạo không hợp lệ'; END IF;
 ELSE
   od:=OLD.data; os:=od->>'status'; IF os='Mới tạo' THEN os:='Chờ phân công'; END IF; IF os='Đang làm' THEN os:='Đang thực hiện'; END IF;
   IF NEW.id IS DISTINCT FROM OLD.id OR NEW.created_by IS DISTINCT FROM OLD.created_by OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN RAISE EXCEPTION 'Không được đổi danh tính Order'; END IF;
   IF NOT private.design_read(u,OLD.created_by,od,OLD.workflow_kind) THEN RAISE EXCEPTION 'Không có quyền xem Order' USING ERRCODE='42501'; END IF;
   req:=OLD.created_by=u OR private.design_person(u,od->>'requester'); own:=private.design_person(u,od->>'assignee'); rev:=private.design_person(u,coalesce(nullif(od->>'reviewer',''),od->>'requester')); mgr:=admin OR public.design_can(u,OLD.workflow_kind,'assign');
   oh:=coalesce(od->'history','[]');
   IF jsonb_array_length(h)<jsonb_array_length(oh) OR EXISTS(SELECT 1 FROM jsonb_array_elements(oh) WITH ORDINALITY e(v,n) WHERE h->((n-1)::int) IS DISTINCT FROM v) THEN RAISE EXCEPTION 'Không được sửa hoặc xóa lịch sử'; END IF;
   IF f IS DISTINCT FROM OLD.workflow_kind AND NOT (mgr AND public.design_can(u,f,'assign')) THEN RAISE EXCEPTION 'Chỉ điều phối được phân loại luồng' USING ERRCODE='42501'; END IF;
   IF d->>'requester' IS DISTINCT FROM od->>'requester' AND NOT admin THEN RAISE EXCEPTION 'Không được đổi người yêu cầu'; END IF;
   IF d->>'assignee' IS DISTINCT FROM od->>'assignee' AND NOT mgr AND NOT (coalesce(od->>'assignee','')='' AND public.design_can(u,f,'take') AND d->>'assignee'=nm) THEN RAISE EXCEPTION 'Không có quyền đổi người thực hiện' USING ERRCODE='42501'; END IF;
   IF d->>'reviewer' IS DISTINCT FROM od->>'reviewer' AND NOT admin AND NOT (req AND os IN ('Chờ phân công','Chờ nhận việc')) AND NOT public.design_can(u,f,'edit_reviewer') THEN RAISE EXCEPTION 'Không có quyền đổi người duyệt' USING ERRCODE='42501'; END IF;
   FOREACH k IN ARRAY ARRAY['takenAt','submittedAt','deliveredAt','completedAt','revisions','assignedAt','assignedBy'] LOOP
    IF d->k IS DISTINCT FROM od->k AND st=os AND NOT (k IN ('assignedAt','assignedBy') AND mgr AND d->>'assignee' IS DISTINCT FROM od->>'assignee') THEN RAISE EXCEPTION 'Không được sửa mốc xử lý lịch sử: %',k; END IF;
   END LOOP;
   IF st IS DISTINCT FROM os THEN
     IF jsonb_array_length(h)<=jsonb_array_length(oh) THEN RAISE EXCEPTION 'Chuyển trạng thái cần thêm lịch sử'; END IF;
     IF admin OR (mgr AND public.design_can(u,f,'force_status')) THEN NULL;
     ELSIF d->>'assignee' IS DISTINCT FROM od->>'assignee' AND mgr AND st IN ('Chờ phân công','Chờ nhận việc') THEN NULL;
     ELSIF os IN ('Chờ phân công','Chờ nhận việc') AND st='Đang thực hiện' AND public.design_can(u,f,'take') AND (own OR (coalesce(od->>'assignee','')='' AND d->>'assignee'=nm)) THEN NULL;
     ELSIF os='Chờ phân công' AND st='Chờ nhận việc' AND req AND public.design_can(u,f,'send_request') AND coalesce(d->>'assignee','')<>'' THEN NULL;
     ELSIF os='Đang thực hiện' AND st='Chờ duyệt' AND own AND public.design_can(u,f,'submit') THEN NULL;
     ELSIF os='Cần sửa' AND st='Chờ duyệt' AND own AND public.design_can(u,f,'resubmit') THEN NULL;
     ELSIF os='Chờ duyệt' AND st='Đã duyệt' AND rev AND public.design_can(u,f,'approve') THEN NULL;
     ELSIF os IN ('Chờ duyệt','Đã bàn giao') AND st='Cần sửa' AND rev AND public.design_can(u,f,'request_changes') AND coalesce(trim(d->>'reviewNotes'),'')<>'' THEN NULL;
     ELSIF os='Đã duyệt' AND st='Đã bàn giao' AND own AND public.design_can(u,f,'deliver') THEN NULL;
     ELSIF os='Đã bàn giao' AND st='Hoàn thành' AND (rev OR req) AND public.design_can(u,f,'complete') THEN NULL;
     ELSIF os NOT IN ('Hoàn thành','Đã hủy') AND st='Đã hủy' AND (req OR mgr) AND public.design_can(u,f,'cancel') THEN NULL;
     ELSIF os='Đã hủy' AND st IN ('Chờ phân công','Chờ nhận việc') AND (req OR mgr) AND public.design_can(u,f,'restore') THEN NULL;
     ELSE RAISE EXCEPTION 'Không có quyền thực hiện bước này' USING ERRCODE='42501'; END IF;
     IF st IN ('Đã duyệt','Cần sửa') AND private.design_person(u,d->>'assignee') AND NOT admin THEN RAISE EXCEPTION 'Không được tự duyệt'; END IF;
     IF st='Đang thực hiện' THEN d:=d||jsonb_build_object('takenAt',ts); END IF;
     IF st='Chờ duyệt' THEN d:=d||jsonb_build_object('submittedAt',ts); END IF;
     IF st='Đã bàn giao' THEN d:=d||jsonb_build_object('deliveredAt',ts); END IF;
     IF st='Hoàn thành' THEN d:=d||jsonb_build_object('completedAt',ts); END IF;
     IF st='Cần sửa' THEN d:=d||jsonb_build_object('revisions',coalesce((od->>'revisions')::int,0)+1); END IF;
   END IF;
   IF (d-ARRAY['status','history','takenAt','submittedAt','deliveredAt','completedAt','revisions','reviewNotes','cancelReason','assignee','assignedAt','assignedBy','reviewer','workflowKind']) IS DISTINCT FROM (od-ARRAY['status','history','takenAt','submittedAt','deliveredAt','completedAt','revisions','reviewNotes','cancelReason','assignee','assignedAt','assignedBy','reviewer','workflowKind']) AND NOT admin AND NOT ((req OR own OR mgr) AND public.design_can(u,f,'edit')) THEN RAISE EXCEPTION 'Không có quyền sửa thông tin' USING ERRCODE='42501'; END IF;
 END IF;
 IF coalesce(d->>'assignee','')<>'' AND NOT EXISTS(SELECT 1 FROM profiles p WHERE p.status='Đang hoạt động' AND (p.full_name=d->>'assignee' OR p.username=d->>'assignee') AND public.design_can(p.id,f,'take')) THEN IF TG_OP='INSERT' OR d->>'assignee' IS DISTINCT FROM od->>'assignee' THEN RAISE EXCEPTION 'Người thực hiện chưa có quyền nhận luồng này'; END IF; END IF;
 IF st IN ('Chờ duyệt','Đã duyệt') AND coalesce(d->>'assignee','')<>'' AND d->>'assignee'=coalesce(nullif(d->>'reviewer',''),d->>'requester') THEN RAISE EXCEPTION 'Người thực hiện không được đồng thời là người duyệt'; END IF;
 NEW.data:=d||jsonb_build_object('status',st); NEW.updated_at:=now(); RETURN NEW;
END $$;
CREATE TRIGGER design_order_write_guard BEFORE INSERT OR UPDATE OR DELETE ON public.orders FOR EACH ROW EXECUTE FUNCTION private.design_guard();
CREATE OR REPLACE FUNCTION public.design_order_save(_id text,_patch jsonb,_expected jsonb DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,private AS $$
DECLARE r public.orders; k text; result jsonb;
BEGIN
 IF auth.uid() IS NULL OR NOT private.is_active(auth.uid()) THEN RAISE EXCEPTION 'Chưa đăng nhập' USING ERRCODE='42501'; END IF;
 IF jsonb_typeof(_patch)<>'object' OR _patch ?| ARRAY['id','created_by','created_at'] THEN RAISE EXCEPTION 'Thông tin không hợp lệ'; END IF;
 SELECT * INTO r FROM public.orders WHERE id=_id FOR UPDATE;
 IF FOUND THEN
   IF NOT private.design_read(auth.uid(),r.created_by,r.data,r.workflow_kind) THEN RAISE EXCEPTION 'Không có quyền xem Order' USING ERRCODE='42501'; END IF;
   IF _expected IS NOT NULL THEN FOR k IN SELECT jsonb_object_keys(_patch) LOOP IF r.data->k IS DISTINCT FROM _expected->k THEN RAISE EXCEPTION 'Order đã được cập nhật. Tải lại trước khi lưu.' USING ERRCODE='40001'; END IF; END LOOP; END IF;
   UPDATE public.orders SET data=data||_patch WHERE id=_id RETURNING data INTO result;
 ELSE
   IF _expected IS NOT NULL THEN RAISE EXCEPTION 'Order không còn tồn tại'; END IF;
   INSERT INTO public.orders(id,data,created_by) VALUES(_id,_patch,auth.uid()) RETURNING data INTO result;
 END IF;
 RETURN result||jsonb_build_object('id',_id);
END $$;
REVOKE ALL ON FUNCTION public.design_order_save(text,jsonb,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.design_order_save(text,jsonb,jsonb) TO authenticated;