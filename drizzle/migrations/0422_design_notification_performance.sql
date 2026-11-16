-- Optimize notifications for Design v2. The BEFORE guard validates assigneeId for new and reassigned jobs.
CREATE OR REPLACE FUNCTION public.order_notify()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE d jsonb:=NEW.data; o jsonb:=CASE WHEN TG_OP='UPDATE' THEN OLD.data ELSE '{}'::jsonb END; st text:=d->>'status'; ost text:=o->>'status'; h jsonb:=coalesce(d->'history','[]'); rnd text:=jsonb_array_length(h)::text; _has_assignee_id boolean:=coalesce(d->>'assigneeId','') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'; _asg uuid:=CASE WHEN _has_assignee_id THEN (d->>'assigneeId')::uuid ELSE public.cw_uid(d->>'assignee') END; _req uuid:=coalesce(NEW.created_by,public.cw_uid(d->>'requester')); _rev uuid:=public.cw_uid(coalesce(nullif(d->>'reviewer',''),d->>'requester')); _p jsonb; _brand text;
BEGIN
 IF NEW.is_demo THEN RETURN NEW; END IF;
 SELECT data->>'name' INTO _brand FROM public.brands WHERE id=d->>'brandId';
 _p:=jsonb_build_object('title',d->>'title','brand',_brand,'status',st,'requester',d->>'requester','assignee',d->>'assignee','reviewer',coalesce(nullif(d->>'reviewer',''),d->>'requester'),'deadline',d->>'deadline','priority',d->>'priority','actor',h->(jsonb_array_length(h)-1)->>'byName','at',now());
 -- Legacy unassigned broadcast removed; every new Job has a designated executor.

 IF _asg IS NOT NULL AND coalesce(d->>'assignee','')<>coalesce(o->>'assignee','') AND st NOT IN ('Hoàn thành','Đã hủy') AND _asg IS DISTINCT FROM auth.uid() AND (_has_assignee_id OR public.design_can(_asg,NEW.workflow_kind,'take')) THEN
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
END $function$;
