CREATE OR REPLACE FUNCTION public.order_notify() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE d jsonb:=NEW.data; o jsonb:=CASE WHEN TG_OP='UPDATE' THEN OLD.data ELSE '{}'::jsonb END; st text:=d->>'status'; ost text:=o->>'status'; h jsonb:=coalesce(d->'history','[]'); rnd text:=jsonb_array_length(h)::text; _asg uuid:=public.cw_uid(d->>'assignee'); _req uuid:=coalesce(NEW.created_by,public.cw_uid(d->>'requester')); _rev uuid:=public.cw_uid(coalesce(nullif(d->>'reviewer',''),d->>'requester')); _p jsonb; _brand text;
BEGIN
 IF NEW.is_demo THEN RETURN NEW; END IF;
 SELECT data->>'name' INTO _brand FROM public.brands WHERE id=d->>'brandId';
 _p:=jsonb_build_object('title',d->>'title','brand',_brand,'status',st,'requester',d->>'requester','assignee',d->>'assignee','reviewer',coalesce(nullif(d->>'reviewer',''),d->>'requester'),'deadline',d->>'deadline','priority',d->>'priority','actor',h->(jsonb_array_length(h)-1)->>'byName','at',now());
 IF st='Chờ phân công' AND coalesce(d->>'assignee','')='' AND (TG_OP='INSERT' OR ost IS DISTINCT FROM st) THEN
  INSERT INTO public.notifications(recipient_id,kind,order_id,payload,dedup_key) SELECT p.id,'order_new',NEW.id,_p,'od:new:'||NEW.id||':'||rnd||':'||p.id FROM profiles p WHERE p.status='Đang hoạt động' AND NOT private.is_admin(p.id) AND public.design_can(p.id,NEW.workflow_kind,'take') AND p.id IS DISTINCT FROM _req ON CONFLICT(dedup_key) DO NOTHING;
 END IF;
 IF _asg IS NOT NULL AND coalesce(d->>'assignee','')<>coalesce(o->>'assignee','') AND st NOT IN ('Hoàn thành','Đã hủy') AND _asg IS DISTINCT FROM auth.uid() AND public.design_can(_asg,NEW.workflow_kind,'take') THEN
  INSERT INTO notifications(recipient_id,kind,order_id,payload,dedup_key) VALUES(_asg,'order_assigned',NEW.id,_p,'od:assigned:'||NEW.id||':'||rnd||':'||_asg) ON CONFLICT(dedup_key) DO NOTHING;
 END IF;
 IF TG_OP='INSERT' OR st IS NOT DISTINCT FROM ost THEN RETURN NEW; END IF;
 IF st='Đang thực hiện' AND ost IN ('Chờ nhận việc','Chờ phân công') AND _req IS NOT NULL AND _req IS DISTINCT FROM _asg THEN
  INSERT INTO notifications(recipient_id,kind,order_id,payload,dedup_key) VALUES(_req,'order_taken',NEW.id,_p,'od:taken:'||NEW.id||':'||rnd||':'||_req) ON CONFLICT(dedup_key) DO NOTHING;
 ELSIF st='Chờ duyệt' AND _rev IS NOT NULL AND _rev IS DISTINCT FROM _asg AND public.design_can(_rev,NEW.workflow_kind,'approve') THEN
  INSERT INTO notifications(recipient_id,kind,order_id,payload,dedup_key) VALUES(_rev,'order_review',NEW.id,_p,'od:review:'||NEW.id||':'||rnd||':'||_rev) ON CONFLICT(dedup_key) DO NOTHING;
 ELSIF st='Cần sửa' AND _asg IS NOT NULL THEN
  INSERT INTO notifications(recipient_id,kind,order_id,payload,dedup_key) VALUES(_asg,'order_revise',NEW.id,_p,'od:revise:'||NEW.id||':'||rnd||':'||_asg) ON CONFLICT(dedup_key) DO NOTHING;
 ELSIF st='Đã duyệt' AND _asg IS NOT NULL THEN
  INSERT INTO notifications(recipient_id,kind,order_id,payload,dedup_key) VALUES(_asg,'order_approved',NEW.id,_p,'od:approved:'||NEW.id||':'||rnd||':'||_asg) ON CONFLICT(dedup_key) DO NOTHING;
 ELSIF st='Đã bàn giao' AND _rev IS NOT NULL AND _rev IS DISTINCT FROM _asg THEN
  INSERT INTO notifications(recipient_id,kind,order_id,payload,dedup_key) VALUES(_rev,'order_delivered',NEW.id,_p,'od:delivered:'||NEW.id||':'||rnd||':'||_rev) ON CONFLICT(dedup_key) DO NOTHING;
 END IF; RETURN NEW;
END $$;
CREATE OR REPLACE FUNCTION public.order_take_job(_id text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,private AS $$
DECLARE u uuid:=auth.uid(); r public.orders; nm text; ts text:=to_char(now() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');
BEGIN
 IF u IS NULL OR NOT private.is_active(u) THEN RAISE EXCEPTION 'Chưa đăng nhập'; END IF;
 SELECT * INTO r FROM orders WHERE id=_id AND NOT is_demo FOR UPDATE;
 IF NOT FOUND OR NOT private.design_read(u,r.created_by,r.data,r.workflow_kind) OR NOT public.design_can(u,r.workflow_kind,'take') THEN RAISE EXCEPTION 'Không có quyền nhận Order' USING ERRCODE='42501'; END IF;
 IF coalesce(r.data->>'assignee','')<>'' OR r.data->>'status' NOT IN ('Chờ phân công','Mới tạo') THEN RAISE EXCEPTION 'Order không còn chờ nhận'; END IF;
 SELECT coalesce(nullif(full_name,''),username) INTO nm FROM profiles WHERE id=u;
 PERFORM public.design_order_save(_id,jsonb_build_object('assignee',nm,'status','Đang thực hiện','assignedBy',nm,'assignedAt',ts,'takenAt',ts,'history',coalesce(r.data->'history','[]')||jsonb_build_array(jsonb_build_object('at',ts,'byId',u,'byName',nm,'action',nm||' đã nhận Job','fromStatus','Chờ phân công','toStatus','Đang thực hiện'))),r.data);
END $$;