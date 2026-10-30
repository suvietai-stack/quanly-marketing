CREATE OR REPLACE FUNCTION public.biz_document_notify() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE d public.biz_documents;recipient uuid;label text;
BEGIN
 SELECT * INTO d FROM public.biz_documents WHERE id=NEW.document_id;
 IF NEW.action NOT IN ('submitted','approved','returned') THEN RETURN NEW;END IF;
 label:=CASE d.kind WHEN 'plan' THEN 'Kế hoạch' ELSE 'Báo cáo' END;
 FOR recipient IN SELECT p.id FROM public.profiles p WHERE CASE WHEN NEW.action='submitted' THEN p.id<>d.user_id AND private.sig_can(p.id,'biz.'||d.kind||'_approve') AND (private.sig_can(p.id,'biz.view_all') OR EXISTS(SELECT 1 FROM public.biz_department_members m WHERE m.user_id=p.id AND m.department_id=d.department_id AND m.is_manager AND m.ended_at IS NULL)) ELSE p.id=d.user_id AND (private.sig_can(p.id,'biz.'||d.kind||'_submit') OR private.sig_can(p.id,'biz.view_own')) END LOOP
  INSERT INTO public.notifications(recipient_id,kind,dedup_key,payload,zalo_status,push_status) VALUES(recipient,'biz_'||NEW.action,'biz:'||NEW.id||':'||recipient,jsonb_build_object('message',label||CASE NEW.action WHEN 'submitted' THEN ' đang chờ duyệt.' WHEN 'approved' THEN ' đã được duyệt.' ELSE ' cần chỉnh sửa.' END,'document_id',d.id,'kind',d.kind,'period_kind',d.period_kind,'year',d.year,'period',d.period,'user_id',d.user_id),'ineligible','none') ON CONFLICT(dedup_key) DO NOTHING;
 END LOOP;RETURN NEW;
END $$;