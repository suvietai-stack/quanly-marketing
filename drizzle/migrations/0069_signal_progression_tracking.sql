ALTER TABLE public.opportunity_signal_notes ADD COLUMN request_id uuid, ADD COLUMN request_payload text, ADD COLUMN is_progression boolean;
CREATE UNIQUE INDEX signal_notes_request_unique ON public.opportunity_signal_notes(request_id) WHERE request_id IS NOT NULL;
COMMENT ON COLUMN public.opportunity_signal_notes.is_progression IS 'Explicit progression marker for new saves; NULL legacy rows classified without rewriting history.';
CREATE FUNCTION public.signal_note_is_progression(_note text, _event text, _marker boolean) RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path=public AS $$ SELECT coalesce(_marker, coalesce(trim(_event),'') <> 'Đã tiếp nhận' AND (coalesce(trim(_note),'') <> '' OR coalesce(trim(_event),'') NOT IN ('','Đã tiếp nhận','Khác'))) $$;
REVOKE ALL ON FUNCTION public.signal_note_is_progression(text,text,boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.signal_note_is_progression(text,text,boolean) TO authenticated,service_role;
CREATE FUNCTION public.signal_progression_save(_id uuid,_request_id uuid,_status text,_note text,_next date,_next_at timestamptz,_revenue numeric,_lost_reason text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE s public.opportunity_signals; existing public.opportunity_signal_notes; result uuid; ns text; payload text; valid boolean;
BEGIN
 IF auth.uid() IS NULL OR _request_id IS NULL THEN RAISE EXCEPTION 'Thiếu phiên hoặc mã thao tác'; END IF;
 SELECT * INTO s FROM public.opportunity_signals WHERE id=_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy tín hiệu'; END IF;
 IF NOT ((s.assigned_to=auth.uid() AND private.sig_can(auth.uid(),'signal.sale')) OR (private.sig_can(auth.uid(),'signal.manage') AND private.sig_scope_ok(auth.uid(),s.need_groups))) THEN RAISE EXCEPTION 'Tín hiệu không được giao cho bạn'; END IF;
 ns:=coalesce(_status,s.status);
 payload:=jsonb_build_array(_id,ns,trim(coalesce(_note,'')),_next,_next_at,_revenue,_lost_reason)::text;
 SELECT * INTO existing FROM public.opportunity_signal_notes WHERE request_id=_request_id;
 IF FOUND THEN
  IF existing.signal_id<>_id OR existing.author_id<>auth.uid() OR existing.request_payload<>payload THEN RAISE EXCEPTION 'Mã thao tác đã dùng cho nội dung khác'; END IF;
  RETURN existing.id;
 END IF;
 SELECT * INTO existing FROM public.opportunity_signal_notes WHERE signal_id=_id AND author_id=auth.uid() AND request_payload=payload AND created_at>=now()-interval '60 seconds' ORDER BY created_at DESC LIMIT 1;
 IF FOUND THEN RETURN existing.id; END IF;
 IF s.cancelled_at IS NOT NULL THEN RAISE EXCEPTION 'Tín hiệu đã hủy'; END IF;
 IF s.assigned_to IS NULL THEN RAISE EXCEPTION 'Tín hiệu chưa được phân công'; END IF;
 IF s.status IN ('won','lost') THEN RAISE EXCEPTION 'Tín hiệu đã kết thúc'; END IF;
 IF ns NOT IN ('waiting','contacting','consulting','quoted','deposit','won','lost') THEN RAISE EXCEPTION 'Trạng thái không hợp lệ'; END IF;
 IF ns='won' AND (_revenue IS NULL OR _revenue<=0) THEN RAISE EXCEPTION 'Chốt bắt buộc nhập doanh số'; END IF;
 IF ns='lost' AND coalesce(trim(_lost_reason),'')='' THEN RAISE EXCEPTION 'Trượt bắt buộc chọn lý do'; END IF;
 IF length(_note)>3000 OR length(_lost_reason)>500 THEN RAISE EXCEPTION 'Nội dung quá dài'; END IF;
 valid:=coalesce(trim(_note),'')<>'';
 IF NOT valid AND ns=s.status THEN RAISE EXCEPTION 'Chưa có nội dung cập nhật'; END IF;
 PERFORM set_config('app.sig_rpc','1',true);
 UPDATE public.opportunity_signals SET status=ns,next_contact_on=CASE WHEN ns IN ('won','lost') THEN NULL ELSE _next END,next_contact_at=CASE WHEN ns IN ('won','lost') THEN NULL ELSE _next_at END,revenue=CASE WHEN ns='won' THEN _revenue END,lost_reason=CASE WHEN ns='lost' THEN trim(_lost_reason) END,closed_at=CASE WHEN ns IN ('won','lost') THEN now() END WHERE id=_id;
 PERFORM set_config('app.sig_rpc','',true);
 INSERT INTO public.opportunity_signal_notes(signal_id,author_id,note,status_from,status_to,next_contact_on,next_contact_at,revenue,lost_reason,event_type,channel,request_id,request_payload,is_progression) VALUES(_id,auth.uid(),nullif(trim(_note),''),s.status,ns,_next,_next_at,CASE WHEN ns='won' THEN _revenue END,CASE WHEN ns='lost' THEN trim(_lost_reason) END,NULL,'Zalo',_request_id,payload,valid) RETURNING id INTO result;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.signal_progression_save(uuid,uuid,text,text,date,timestamptz,numeric,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.signal_progression_save(uuid,uuid,text,text,date,timestamptz,numeric,text) TO authenticated;
CREATE FUNCTION public.signal_progression_rows(_from date DEFAULT NULL,_to date DEFAULT NULL) RETURNS TABLE(signal_id uuid,total bigint,last_at timestamptz,period_updates bigint,authors jsonb) LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$
 WITH valid AS (SELECT n.* FROM public.opportunity_signal_notes n JOIN public.opportunity_signals s ON s.id=n.signal_id WHERE public.signal_note_is_progression(n.note,n.event_type,n.is_progression)), period AS (SELECT v.signal_id,v.author_id,count(*) AS c FROM valid v WHERE (_from IS NULL OR (v.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date>=_from) AND (_to IS NULL OR (v.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date<=_to) GROUP BY v.signal_id,v.author_id), totals AS (SELECT v.signal_id,count(*) AS total,max(v.created_at) AS last_at FROM valid v GROUP BY v.signal_id), counts AS (SELECT p.signal_id,sum(p.c)::bigint AS period_updates,jsonb_object_agg(p.author_id::text,p.c) AS authors FROM period p GROUP BY p.signal_id) SELECT t.signal_id,t.total,t.last_at,coalesce(c.period_updates,0),coalesce(c.authors,'{}'::jsonb) FROM totals t LEFT JOIN counts c ON c.signal_id=t.signal_id;
$$;
REVOKE ALL ON FUNCTION public.signal_progression_rows(date,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.signal_progression_rows(date,date) TO authenticated;