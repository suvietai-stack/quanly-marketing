CREATE FUNCTION public.sao_can_manage_shop() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT coalesce(private.sig_can(auth.uid(),'sao.shop_manage'),false) $$;
CREATE FUNCTION public.sao_active() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT coalesce(private.is_active(auth.uid()),false) $$;
REVOKE ALL ON FUNCTION public.sao_can_manage_shop(),public.sao_active() FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.sao_can_manage_shop(),public.sao_active() TO authenticated;
ALTER POLICY sao_gift_image_read ON storage.objects USING(bucket_id='sao-gifts' AND public.sao_active());
ALTER POLICY sao_gift_image_insert ON storage.objects WITH CHECK(bucket_id='sao-gifts' AND (storage.foldername(name))[1]=auth.uid()::text AND public.sao_can_manage_shop());
CREATE FUNCTION public.signal_progression_config_can_read() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM unnest(ARRAY['signal.create','signal.view_all','signal.manage','signal.sale','signal.assign','signal.reassign','signal.edit','signal.delete','signal.report']) p WHERE private.sig_can(auth.uid(),p)) $$;
REVOKE ALL ON FUNCTION public.signal_progression_config_can_read() FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.signal_progression_config_can_read() TO authenticated;
ALTER POLICY progression_config_read ON public.signal_progression_config USING(public.signal_progression_config_can_read());
CREATE OR REPLACE FUNCTION public.signal_progression_activate(_confirm boolean) RETURNS timestamptz LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF NOT public.signal_progression_config_can_read() THEN RAISE EXCEPTION 'Không có quyền xem cấu hình Tín hiệu'; END IF;
 RETURN (SELECT activated_at FROM public.signal_progression_config WHERE id); END $$;
CREATE OR REPLACE FUNCTION private.sao_task_event() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE h jsonb; uid uuid; matches integer; submitted timestamptz;
BEGIN
 IF OLD.data->>'status' IS DISTINCT FROM 'Chờ xác nhận' OR NEW.data->>'status' IS DISTINCT FROM 'Hoàn thành' OR coalesce(NEW.is_demo,false) OR NOT private.sig_can(auth.uid(),'task.approve_completion') THEN RETURN NEW; END IF;
 IF NEW.data->>'assignee' IS DISTINCT FROM OLD.data->>'assignee' OR NEW.data->>'submittedAt' IS DISTINCT FROM OLD.data->>'submittedAt' THEN RETURN NEW; END IF;
 IF jsonb_typeof(NEW.data->'history') IS DISTINCT FROM 'array' OR jsonb_typeof(OLD.data->'history') IS DISTINCT FROM 'array' THEN RETURN NEW; END IF;
 IF jsonb_array_length(NEW.data->'history')<>jsonb_array_length(OLD.data->'history')+1 THEN RETURN NEW; END IF;
 IF (NEW.data->'history')-(jsonb_array_length(NEW.data->'history')-1) IS DISTINCT FROM OLD.data->'history' THEN RETURN NEW; END IF;
 h:=NEW.data->'history'->-1;
 IF h->>'action' IS DISTINCT FROM 'Xác nhận hoàn thành' OR h->>'fromStatus' IS DISTINCT FROM 'Chờ xác nhận' OR h->>'toStatus' IS DISTINCT FROM 'Hoàn thành' OR h->>'byId' IS DISTINCT FROM auth.uid()::text OR coalesce(h->>'forced','false')<>'false' THEN RETURN NEW; END IF;
 BEGIN submitted:=(OLD.data->>'submittedAt')::timestamptz; EXCEPTION WHEN invalid_datetime_format OR datetime_field_overflow THEN RETURN NEW; END;
 IF submitted IS NULL OR submitted>now() THEN RETURN NEW; END IF;
 SELECT count(*),min(id::text)::uuid INTO matches,uid FROM public.profiles WHERE (id::text=OLD.data->>'assignee' OR full_name=OLD.data->>'assignee') AND status='Đang hoạt động';
 IF matches<>1 THEN RETURN NEW; END IF;
 INSERT INTO public.sao_task_approvals(task_id,user_id,approved_by,submitted_at,brand_id) VALUES(NEW.id,uid,auth.uid(),submitted,OLD.data->>'brandId') ON CONFLICT DO NOTHING;
 PERFORM private.sao_award(uid,'task',NEW.id,now(),'Công việc được xác nhận hoàn thành: '||coalesce(NEW.data->>'title','Task'));
 RETURN NEW;
END $$;