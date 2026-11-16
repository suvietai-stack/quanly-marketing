-- Design workflow v2 + three independent Zalo group configurations.
-- No auto-assignment of old Jobs, no deletion of historic data, no outgoing messages until per-flow setup is enabled.
CREATE OR REPLACE FUNCTION private.design_team_member(_uid uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,private AS $$
 SELECT _uid IS NOT NULL AND private.is_active(_uid) AND (
   private.is_super_admin(_uid) OR EXISTS(
     SELECT 1 FROM public.mkt_staff_specialties m WHERE m.user_id=_uid AND m.state='active'
       AND m.specialty_id IN ('design','photography')
   )
 );
$$;
REVOKE ALL ON FUNCTION private.design_team_member(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION private.design_team_member(uuid) TO authenticated,service_role;

-- Selected designer must be an active Design/Photography team member with permission to take this flow.
CREATE OR REPLACE FUNCTION public.design_assignable_staff(_flow text)
RETURNS TABLE(user_id uuid,name text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,private AS $
 SELECT DISTINCT p.id,p.full_name
 FROM public.profiles p
 JOIN public.mkt_staff_specialties s ON s.user_id=p.id AND s.state='active'
    AND s.specialty_id IN ('design','photography')
 WHERE _flow IN ('photo','marketing_design','order_mockup')
   AND private.is_active(auth.uid())
   AND (public.design_can(auth.uid(),_flow,'create') OR private.design_team_member(auth.uid()))
   AND p.status='Đang hoạt động' AND public.design_can(p.id,_flow,'take')
 ORDER BY 2,1;
$;
REVOKE ALL ON FUNCTION public.design_assignable_staff(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.design_assignable_staff(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.design_team_access() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,private AS $$
 SELECT private.design_team_member(auth.uid());
$$;
REVOKE ALL ON FUNCTION public.design_team_access() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.design_team_access() TO authenticated;

CREATE TABLE public.design_zalo_group_config(
 flow text PRIMARY KEY CHECK(flow IN ('photo','marketing_design','order_mockup')),
 group_id text, group_name text,
 enabled boolean NOT NULL DEFAULT false,
 updated_by uuid, updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK(NOT enabled OR nullif(btrim(group_id),'') IS NOT NULL)
);
INSERT INTO public.design_zalo_group_config(flow) VALUES ('photo'),('marketing_design'),('order_mockup') ON CONFLICT DO NOTHING;
ALTER TABLE public.design_zalo_group_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY design_zalo_config_admin ON public.design_zalo_group_config FOR SELECT TO authenticated
 USING(private.is_active(auth.uid()) AND (private.is_super_admin(auth.uid()) OR private.has_permission(auth.uid(),'settings.role')));
GRANT SELECT ON public.design_zalo_group_config TO authenticated;
GRANT ALL ON public.design_zalo_group_config TO service_role;

CREATE TABLE public.design_zalo_group_events(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 order_id text NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
 flow text NOT NULL CHECK(flow IN ('photo','marketing_design','order_mockup')),
 event text NOT NULL CHECK(event IN ('created','transferred','taken','submitted','changes','approved','delivered','completed','cancelled')),
 group_id text NOT NULL,
 snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
 dedup_key text NOT NULL UNIQUE,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sending','sent','failed','unknown','skipped')),
 attempts int NOT NULL DEFAULT 0,
 error text, started_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), sent_at timestamptz
);
CREATE INDEX design_zalo_pending_idx ON public.design_zalo_group_events(created_at) WHERE status='pending' AND attempts < 3;
ALTER TABLE public.design_zalo_group_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY design_zalo_events_admin ON public.design_zalo_group_events FOR SELECT TO authenticated
 USING(private.is_active(auth.uid()) AND (private.is_super_admin(auth.uid()) OR private.has_permission(auth.uid(),'settings.role')));
GRANT SELECT ON public.design_zalo_group_events TO authenticated;
GRANT ALL ON public.design_zalo_group_events TO service_role;

CREATE OR REPLACE FUNCTION public.design_zalo_group_can_manage() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,private AS $$
 SELECT private.is_active(auth.uid()) AND
   (private.is_super_admin(auth.uid()) OR private.has_permission(auth.uid(),'settings.role'));
$$;
REVOKE ALL ON FUNCTION public.design_zalo_group_can_manage() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.design_zalo_group_can_manage() TO authenticated;

CREATE OR REPLACE FUNCTION public.design_zalo_group_save(_flow text,_group_id text,_group_name text,_enabled boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,private AS $$
BEGIN
 IF NOT public.design_zalo_group_can_manage() THEN RAISE EXCEPTION 'Không có quyền Cài đặt Thiết kế' USING ERRCODE='42501'; END IF;
 IF _flow NOT IN ('photo','marketing_design','order_mockup') OR _flow IS NULL THEN RAISE EXCEPTION 'Luồng không hợp lệ'; END IF;
 IF length(coalesce(_group_id,''))>100 OR length(coalesce(_group_name,''))>200 THEN RAISE EXCEPTION 'Thông tin nhóm quá dài'; END IF;
 IF coalesce(_enabled,false) AND nullif(btrim(coalesce(_group_id,'')),'') IS NULL THEN RAISE EXCEPTION 'Chọn nhóm Zalo trước khi bật'; END IF;
 UPDATE public.design_zalo_group_config SET group_id=nullif(btrim(_group_id),''),group_name=nullif(btrim(_group_name),''),
 enabled=coalesce(_enabled,false),updated_by=auth.uid(),updated_at=now() WHERE flow=_flow;
END $$;
REVOKE ALL ON FUNCTION public.design_zalo_group_save(text,text,text,boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.design_zalo_group_save(text,text,text,boolean) TO authenticated;

-- Snapshot contains only safe routing fields. No content/files/private comments are sent.
CREATE OR REPLACE FUNCTION private.design_zalo_enqueue() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,private AS $$
DECLARE cfg public.design_zalo_group_config%ROWTYPE; kind text; prev text;
BEGIN
 IF coalesce(NEW.is_demo,false) OR NEW.workflow_kind NOT IN ('photo','marketing_design','order_mockup') THEN RETURN NEW; END IF;
 SELECT * INTO cfg FROM public.design_zalo_group_config WHERE flow=NEW.workflow_kind;
 IF NOT FOUND OR NOT cfg.enabled OR nullif(btrim(cfg.group_id),'') IS NULL THEN RETURN NEW; END IF;
 IF TG_OP='INSERT' THEN kind:='created';
 ELSE
   prev:=OLD.data->>'status';
   IF NEW.data->>'assigneeId' IS DISTINCT FROM OLD.data->>'assigneeId' THEN kind:='transferred';
   ELSIF NEW.data->>'status' IS DISTINCT FROM prev THEN
     kind:=CASE NEW.data->>'status'
       WHEN 'Đang thực hiện' THEN 'taken'
       WHEN 'Chờ duyệt' THEN 'submitted'
       WHEN 'Cần sửa' THEN 'changes'
       WHEN 'Đã duyệt' THEN 'approved'
       WHEN 'Đã bàn giao' THEN 'delivered'
       WHEN 'Hoàn thành' THEN 'completed'
       WHEN 'Đã hủy' THEN 'cancelled'
       ELSE NULL END;
   END IF;
 END IF;
 IF kind IS NULL THEN RETURN NEW; END IF;
 INSERT INTO public.design_zalo_group_events(order_id,flow,event,group_id,snapshot,dedup_key)
 VALUES(NEW.id,NEW.workflow_kind,kind,cfg.group_id,
  jsonb_build_object('title',left(coalesce(NEW.data->>'title',''),150),
    'requester',left(coalesce(NEW.data->>'requester',''),100),
    'assignee',left(coalesce(NEW.data->>'assignee',''),100),
    'old_assignee',CASE WHEN TG_OP='UPDATE' THEN left(coalesce(OLD.data->>'assignee',''),100) ELSE '' END,
    'reviewer',left(coalesce(NEW.data->>'reviewer',''),100),
    'deadline',NEW.data->>'deadline','status',NEW.data->>'status'),
  'design:'||NEW.id||':'||kind||':'||CASE WHEN TG_OP='INSERT' THEN '0' ELSE coalesce(jsonb_array_length(coalesce(NEW.data->'history','[]'))::text,'0') END||':'||coalesce(NEW.data->>'assigneeId',''))
 ON CONFLICT(dedup_key) DO NOTHING;
 RETURN NEW;
END $$;
CREATE TRIGGER design_zalo_enqueue AFTER INSERT OR UPDATE OF data ON public.orders
 FOR EACH ROW EXECUTE FUNCTION private.design_zalo_enqueue();

-- Server-side scope: only Design team has a whole-workspace read. Others can read own/assigned/reviewed Jobs.
CREATE OR REPLACE FUNCTION private.design_read(_uid uuid, _creator uuid, _data jsonb, _flow text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'private'
AS $function$
 SELECT private.is_active(_uid) AND (private.is_admin(_uid) OR private.design_team_member(_uid) OR (public.design_can(_uid,_flow,'view') AND (_creator=_uid OR private.design_person(_uid,_data->>'requester') OR private.design_person(_uid,_data->>'assignee') OR private.design_person(_uid,coalesce(nullif(_data->>'reviewer',''),_data->>'requester')))));
$function$

-- Safely extend existing guarded Order writer; preserves field-level authorization/audit and historic status aliases.
CREATE OR REPLACE FUNCTION private.design_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'private'
AS $function$
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
 st:=coalesce(d->>'status','Cần giao người'); IF st='Mới tạo' OR st='Chờ phân công' THEN st:='Cần giao người'; END IF; IF st='Đang làm' THEN st:='Đang thực hiện'; END IF;
 h:=coalesce(d->'history','[]'); IF jsonb_typeof(h)<>'array' THEN RAISE EXCEPTION 'Lịch sử không hợp lệ'; END IF;
 SELECT coalesce(nullif(full_name,''),username) INTO nm FROM profiles WHERE id=u;
 IF TG_OP='INSERT' THEN
   IF NOT public.design_can(u,f,'create') THEN RAISE EXCEPTION 'Không có quyền tạo Order trong luồng này' USING ERRCODE='42501'; END IF;
   IF NEW.created_by IS DISTINCT FROM u THEN RAISE EXCEPTION 'Người tạo không hợp lệ' USING ERRCODE='42501'; END IF;
   IF NOT admin AND NOT private.design_person(u,d->>'requester') THEN RAISE EXCEPTION 'Người yêu cầu phải là tài khoản tạo Order' USING ERRCODE='42501'; END IF;
   IF f IN ('photo','marketing_design','order_mockup') AND (coalesce(d->>'assignee','')='' OR coalesce(d->>'assigneeId','')='') THEN RAISE EXCEPTION 'Phải chọn nhân viên Thiết kế thực hiện khi tạo Job' USING ERRCODE='22023'; END IF;
   IF f IN ('photo','marketing_design','order_mockup') AND st <> 'Chờ nhận việc' THEN RAISE EXCEPTION 'Job mới phải ở bước Chờ nhận việc' USING ERRCODE='22023'; END IF;
   IF st NOT IN ('Chờ nhận việc') THEN RAISE EXCEPTION 'Trạng thái khởi tạo không hợp lệ'; END IF;
 ELSE
   od:=OLD.data; os:=od->>'status'; IF os='Mới tạo' OR os='Chờ phân công' THEN os:='Cần giao người'; END IF; IF os='Đang làm' THEN os:='Đang thực hiện'; END IF;
   IF NEW.id IS DISTINCT FROM OLD.id OR NEW.created_by IS DISTINCT FROM OLD.created_by OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN RAISE EXCEPTION 'Không được đổi danh tính Order'; END IF;
   IF NOT private.design_read(u,OLD.created_by,od,OLD.workflow_kind) THEN RAISE EXCEPTION 'Không có quyền xem Order' USING ERRCODE='42501'; END IF;
   req:=OLD.created_by=u OR private.design_person(u,od->>'requester'); own:=private.design_person(u,od->>'assignee'); rev:=private.design_person(u,coalesce(nullif(od->>'reviewer',''),od->>'requester')); mgr:=admin OR public.design_can(u,OLD.workflow_kind,'assign');
   oh:=coalesce(od->'history','[]');
   IF jsonb_array_length(h)<jsonb_array_length(oh) OR EXISTS(SELECT 1 FROM jsonb_array_elements(oh) WITH ORDINALITY e(v,n) WHERE h->((n-1)::int) IS DISTINCT FROM v) THEN RAISE EXCEPTION 'Không được sửa hoặc xóa lịch sử'; END IF;
   IF f IS DISTINCT FROM OLD.workflow_kind AND NOT ((mgr AND public.design_can(u,f,'assign')) OR (OLD.workflow_kind IS NULL AND req AND public.design_can(u,f,'create'))) THEN RAISE EXCEPTION 'Chỉ điều phối được phân loại luồng' USING ERRCODE='42501'; END IF;
   IF d->>'requester' IS DISTINCT FROM od->>'requester' AND NOT admin THEN RAISE EXCEPTION 'Không được đổi người yêu cầu'; END IF;
   IF (d->>'assignee' IS DISTINCT FROM od->>'assignee' OR d->>'assigneeId' IS DISTINCT FROM od->>'assigneeId') AND NOT mgr AND NOT ((coalesce(od->>'assignee','')='' AND (req OR private.design_team_member(u)) AND st='Chờ nhận việc') OR (own AND private.design_team_member(u) AND st='Chờ nhận việc' AND os IN ('Chờ nhận việc','Đang thực hiện','Cần sửa','Chờ duyệt'))) THEN RAISE EXCEPTION 'Chỉ bộ phận Thiết kế được chuyển Job, hoặc người tạo được giao Job còn thiếu người' USING ERRCODE='42501'; END IF;
   IF (d->>'assignee' IS DISTINCT FROM od->>'assignee' OR d->>'assigneeId' IS DISTINCT FROM od->>'assigneeId') AND od->>'status' IN ('Đã duyệt','Đã bàn giao','Hoàn thành','Đã hủy') AND NOT admin THEN RAISE EXCEPTION 'Không chuyển Job đã duyệt, bàn giao hoặc kết thúc' USING ERRCODE='42501'; END IF;
   IF d->>'reviewer' IS DISTINCT FROM od->>'reviewer' AND NOT admin AND NOT (req AND os IN ('Cần giao người','Chờ nhận việc')) AND NOT public.design_can(u,f,'edit_reviewer') THEN RAISE EXCEPTION 'Không có quyền đổi người duyệt' USING ERRCODE='42501'; END IF;
   FOREACH k IN ARRAY ARRAY['takenAt','submittedAt','deliveredAt','completedAt','revisions','assignedAt','assignedBy'] LOOP
    IF d->k IS DISTINCT FROM od->k AND st=os AND NOT (k IN ('assignedAt','assignedBy') AND (mgr OR (own AND private.design_team_member(u)) OR (req AND coalesce(od->>'assignee','')='')) AND (d->>'assignee' IS DISTINCT FROM od->>'assignee' OR d->>'assigneeId' IS DISTINCT FROM od->>'assigneeId')) THEN RAISE EXCEPTION 'Không được sửa mốc xử lý lịch sử: %',k; END IF;
   END LOOP;
   IF st IS DISTINCT FROM os THEN
     IF jsonb_array_length(h)<=jsonb_array_length(oh) THEN RAISE EXCEPTION 'Chuyển trạng thái cần thêm lịch sử'; END IF;
     IF admin OR (mgr AND public.design_can(u,f,'force_status')) THEN NULL;
     ELSIF (d->>'assignee' IS DISTINCT FROM od->>'assignee' OR d->>'assigneeId' IS DISTINCT FROM od->>'assigneeId') AND st='Chờ nhận việc' AND (mgr OR (coalesce(od->>'assignee','')='' AND req) OR (own AND private.design_team_member(u))) THEN NULL;
     ELSIF os='Chờ nhận việc' AND st='Đang thực hiện' AND public.design_can(u,f,'take') AND own THEN NULL;
     
     ELSIF os='Đang thực hiện' AND st='Chờ duyệt' AND own AND public.design_can(u,f,'submit') THEN NULL;
     ELSIF os='Cần sửa' AND st='Chờ duyệt' AND own AND public.design_can(u,f,'resubmit') THEN NULL;
     ELSIF os='Chờ duyệt' AND st='Đã duyệt' AND rev AND public.design_can(u,f,'approve') THEN NULL;
     ELSIF os IN ('Chờ duyệt','Đã bàn giao') AND st='Cần sửa' AND rev AND public.design_can(u,f,'request_changes') AND coalesce(trim(d->>'reviewNotes'),'')<>'' THEN NULL;
     ELSIF os='Đã duyệt' AND st='Đã bàn giao' AND own AND public.design_can(u,f,'deliver') THEN NULL;
     ELSIF os='Đã bàn giao' AND st='Hoàn thành' AND (rev OR req) AND public.design_can(u,f,'complete') THEN NULL;
     ELSIF os NOT IN ('Hoàn thành','Đã hủy') AND st='Đã hủy' AND (req OR mgr) AND public.design_can(u,f,'cancel') THEN NULL;
     ELSIF os='Đã hủy' AND st='Chờ nhận việc' AND (req OR mgr) AND public.design_can(u,f,'restore') THEN NULL;
     ELSE RAISE EXCEPTION 'Không có quyền thực hiện bước này' USING ERRCODE='42501'; END IF;
     IF st IN ('Đã duyệt','Cần sửa') AND private.design_person(u,d->>'assignee') AND NOT admin THEN RAISE EXCEPTION 'Không được tự duyệt'; END IF;
     IF st='Đang thực hiện' THEN d:=d||jsonb_build_object('takenAt',ts); END IF;
     IF st='Chờ duyệt' THEN d:=d||jsonb_build_object('submittedAt',ts); END IF;
     IF st='Đã bàn giao' THEN d:=d||jsonb_build_object('deliveredAt',ts); END IF;
     IF st='Hoàn thành' THEN d:=d||jsonb_build_object('completedAt',ts); END IF;
     IF st='Cần sửa' THEN d:=d||jsonb_build_object('revisions',coalesce((od->>'revisions')::int,0)+1); END IF;
   END IF;
   IF (d-ARRAY['status','history','takenAt','submittedAt','deliveredAt','completedAt','revisions','reviewNotes','cancelReason','assignee','assigneeId','assignedAt','assignedBy','reviewer','workflowKind','draftLink','reviseLink','deliverLink']) IS DISTINCT FROM (od-ARRAY['status','history','takenAt','submittedAt','deliveredAt','completedAt','revisions','reviewNotes','cancelReason','assignee','assigneeId','assignedAt','assignedBy','reviewer','workflowKind','draftLink','reviseLink','deliverLink']) AND NOT admin AND NOT ((req OR own OR mgr) AND public.design_can(u,f,'edit')) THEN RAISE EXCEPTION 'Không có quyền sửa thông tin' USING ERRCODE='42501'; END IF;
 END IF;
 IF coalesce(d->>'assignee','')<>'' AND (TG_OP='INSERT' OR d->>'assignee' IS DISTINCT FROM od->>'assignee' OR d->>'assigneeId' IS DISTINCT FROM od->>'assigneeId') AND NOT EXISTS(SELECT 1 FROM profiles p WHERE p.status='Đang hoạt động' AND (p.full_name=d->>'assignee' OR p.username=d->>'assignee') AND p.id::text=coalesce(d->>'assigneeId','') AND private.design_team_member(p.id) AND public.design_can(p.id,f,'take')) THEN RAISE EXCEPTION 'Chỉ chọn nhân viên Thiết kế/Chụp ảnh đang hoạt động và đủ quyền thực hiện'; END IF;
 IF st IN ('Chờ duyệt','Đã duyệt') AND coalesce(d->>'assignee','')<>'' AND d->>'assignee'=coalesce(nullif(d->>'reviewer',''),d->>'requester') THEN RAISE EXCEPTION 'Người thực hiện không được đồng thời là người duyệt'; END IF;
 NEW.data:=d||jsonb_build_object('status',st); NEW.updated_at:=now(); RETURN NEW;
END $function$

-- Idempotent linked-source Job creation. Historical duplicates are preserved;
-- newly created Content/Video linked Jobs may not duplicate a source even under concurrent clicks.
CREATE OR REPLACE FUNCTION private.design_linked_source_unique() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,private AS $
DECLARE src text; mode text;
BEGIN
 IF coalesce(NEW.workflow_kind,NEW.data->>'workflowKind') <> 'marketing_design' THEN RETURN NEW; END IF;
 IF nullif(NEW.data->>'contentId','') IS NOT NULL THEN
   src:=NEW.data->>'contentId';mode:='content';
 ELSIF nullif(NEW.data->>'videoId','') IS NOT NULL AND NEW.data->>'type'='Thumbnail video' THEN
   src:=NEW.data->>'videoId';mode:='video';
 ELSE RETURN NEW; END IF;
 IF TG_OP='UPDATE' AND src=CASE WHEN mode='content' THEN OLD.data->>'contentId' ELSE OLD.data->>'videoId' END
    AND coalesce(OLD.workflow_kind,OLD.data->>'workflowKind')='marketing_design' THEN RETURN NEW; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('design-link:'||mode||':'||src,0));
 IF EXISTS(
   SELECT 1 FROM public.orders o
   WHERE o.id<>NEW.id AND o.workflow_kind='marketing_design' AND
    CASE WHEN mode='content' THEN o.data->>'contentId'=src
      ELSE o.data->>'videoId'=src AND o.data->>'type'='Thumbnail video' END
 ) THEN RAISE EXCEPTION 'Đã có Job Thiết kế liên kết với nội dung này. Mở Job cũ thay vì tạo trùng.' USING ERRCODE='23505'; END IF;
 RETURN NEW;
END $;
CREATE TRIGGER design_order_duplicate_guard BEFORE INSERT OR UPDATE OF data ON public.orders
 FOR EACH ROW EXECUTE FUNCTION private.design_linked_source_unique();

-- Existing unassigned, active v1 Jobs become explicit exception queue, never auto-given to an arbitrary employee.
-- No past event triggers Zalo because three configurations are OFF by default.
UPDATE public.orders
 SET data=jsonb_set(
  jsonb_set(data,'{status}',to_jsonb('Cần giao người'::text),true),
  '{history}', coalesce(data->'history','[]'::jsonb)||jsonb_build_array(jsonb_build_object(
    'at',to_char(now() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'byName','Hệ thống','action','Chuyển sang quy trình Thiết kế mới: cần bổ sung người thực hiện',
    'fromStatus',data->>'status','toStatus','Cần giao người')),true)
 WHERE data->>'status' IN ('Chờ phân công','Mới tạo')
   AND nullif(data->>'assignee','') IS NULL
   AND data->>'status' NOT IN ('Hoàn thành','Đã hủy');

-- Legacy free-take path retired: new Jobs need an explicit named assignee.
REVOKE EXECUTE ON FUNCTION public.order_take_job(text) FROM authenticated;
