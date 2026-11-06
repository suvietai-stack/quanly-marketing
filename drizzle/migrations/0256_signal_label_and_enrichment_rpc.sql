CREATE FUNCTION public.signal_label_save(_id uuid,_name text,_personal boolean DEFAULT true,_active boolean DEFAULT true) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE u uuid:=auth.uid(); l public.signal_labels; target uuid; own uuid;
BEGIN
IF u IS NULL OR NOT private.is_active(u) THEN RAISE EXCEPTION 'Bạn cần đăng nhập tài khoản đang hoạt động'; END IF;
IF _personal THEN
 IF NOT private.sig_can(u,'signal.sale') THEN RAISE EXCEPTION 'Bạn không có quyền tạo nhãn cá nhân'; END IF; own:=u;
ELSE
 IF NOT (private.sig_can(u,'signal.catalog') OR private.sig_can(u,'signal.manage')) THEN RAISE EXCEPTION 'Bạn không có quyền quản lý nhãn chung'; END IF; own:=NULL;
END IF;
IF length(btrim(coalesce(_name,''))) NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Tên nhãn cần từ 1 đến 100 ký tự'; END IF;
IF _id IS NOT NULL THEN
 SELECT * INTO l FROM public.signal_labels WHERE id=_id FOR UPDATE;
 IF NOT FOUND OR l.owner_id IS DISTINCT FROM own THEN RAISE EXCEPTION 'Bạn không có quyền sửa nhãn này'; END IF;
 UPDATE public.signal_labels SET name=btrim(_name),active=_active,updated_at=now() WHERE id=_id; RETURN _id;
END IF;
INSERT INTO public.signal_labels(owner_id,name,active) VALUES(own,btrim(_name),_active) ON CONFLICT DO NOTHING RETURNING id INTO target;
IF target IS NULL THEN SELECT id INTO target FROM public.signal_labels WHERE owner_id IS NOT DISTINCT FROM own AND lower(btrim(name))=lower(btrim(_name)); END IF;
RETURN target; END $$;
REVOKE ALL ON FUNCTION public.signal_label_save(uuid,text,boolean,boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.signal_label_save(uuid,text,boolean,boolean) TO authenticated;
CREATE FUNCTION public.signal_enrichment_save(_id uuid,_request_id uuid,_potential text,_labels uuid[],_next date DEFAULT NULL,_next_at timestamptz DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE u uuid:=auth.uid(); s public.opportunity_signals; e public.signal_enrichment_events; payload jsonb; old_labels uuid[]; target uuid; nd date;
BEGIN
IF u IS NULL OR _request_id IS NULL THEN RAISE EXCEPTION 'Thiếu phiên đăng nhập hoặc mã thao tác'; END IF;
SELECT * INTO s FROM public.opportunity_signals WHERE id=_id FOR UPDATE;
IF NOT FOUND OR NOT private.sig_visible(u,s.created_by,s.assigned_to,s.need_groups) THEN RAISE EXCEPTION 'Không có quyền xem tín hiệu'; END IF;
IF NOT ((s.assigned_to=u AND private.sig_can(u,'signal.sale')) OR (private.sig_can(u,'signal.manage') AND private.sig_scope_ok(u,s.need_groups))) THEN RAISE EXCEPTION 'Bạn không có quyền cập nhật tín hiệu này'; END IF;
IF _potential NOT IN ('high','medium','low','unrated') OR _potential IS NULL THEN RAISE EXCEPTION 'Mức tiềm năng không hợp lệ'; END IF;
IF cardinality(coalesce(_labels,'{}'))>50 THEN RAISE EXCEPTION 'Chỉ chọn tối đa 50 nhãn'; END IF;
nd:=coalesce(_next,(_next_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date);
IF _next_at IS NOT NULL AND _next IS NOT NULL AND (_next_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date<>_next THEN RAISE EXCEPTION 'Ngày và giờ lịch theo dõi không khớp'; END IF;
payload:=jsonb_build_object('signal_id',_id,'potential',_potential,'labels',to_jsonb(ARRAY(SELECT DISTINCT x FROM unnest(coalesce(_labels,'{}')) x ORDER BY x)),'next',nd,'next_at',_next_at);
SELECT * INTO e FROM public.signal_enrichment_events WHERE actor_id=u AND request_id=_request_id;
IF FOUND THEN
 IF e.detail->'payload' IS DISTINCT FROM payload THEN RAISE EXCEPTION 'Mã thao tác đã dùng cho nội dung khác'; END IF; RETURN e.id;
END IF;
IF s.cancelled_at IS NOT NULL THEN RAISE EXCEPTION 'Tín hiệu đã hủy'; END IF;
IF s.status IN ('won','lost') AND (nd IS DISTINCT FROM s.next_contact_on OR _next_at IS DISTINCT FROM s.next_contact_at) THEN RAISE EXCEPTION 'Tín hiệu đã kết thúc, không đặt lịch mới'; END IF;
SELECT coalesce(array_agg(l.id ORDER BY l.id),'{}') INTO old_labels FROM public.signal_label_links sl JOIN public.signal_labels l ON l.id=sl.label_id WHERE sl.signal_id=_id AND (l.owner_id IS NULL OR l.owner_id=u);
IF EXISTS(SELECT 1 FROM unnest(coalesce(_labels,'{}')) x WHERE NOT EXISTS(SELECT 1 FROM public.signal_labels l WHERE l.id=x AND (l.owner_id IS NULL OR l.owner_id=u) AND (l.active OR l.id=ANY(old_labels)))) THEN RAISE EXCEPTION 'Nhãn không tồn tại, đã ẩn hoặc không thuộc quyền của bạn'; END IF;
IF EXISTS(SELECT 1 FROM unnest(coalesce(_labels,'{}')) x JOIN public.signal_labels l ON l.id=x WHERE l.owner_id=u) AND s.assigned_to IS DISTINCT FROM u THEN RAISE EXCEPTION 'Nhãn cá nhân chỉ dùng cho tín hiệu bạn phụ trách'; END IF;
PERFORM set_config('app.sig_rpc','1',true); PERFORM set_config('app.sig_enrichment','1',true);
UPDATE public.opportunity_signals SET potential=_potential,potential_updated_by=CASE WHEN potential IS DISTINCT FROM _potential THEN u ELSE potential_updated_by END,potential_updated_at=CASE WHEN potential IS DISTINCT FROM _potential THEN now() ELSE potential_updated_at END,next_contact_on=nd,next_contact_at=_next_at WHERE id=_id;
PERFORM set_config('app.sig_rpc','',true); PERFORM set_config('app.sig_enrichment','',true);
DELETE FROM public.signal_label_links sl USING public.signal_labels l WHERE sl.signal_id=_id AND l.id=sl.label_id AND (l.owner_id IS NULL OR l.owner_id=u) AND NOT(sl.label_id=ANY(coalesce(_labels,'{}')));
INSERT INTO public.signal_label_links(signal_id,label_id,created_by) SELECT _id,x,u FROM (SELECT DISTINCT unnest(coalesce(_labels,'{}')) x) a ON CONFLICT DO NOTHING;
INSERT INTO public.signal_enrichment_events(signal_id,actor_id,request_id,detail) VALUES(_id,u,_request_id,jsonb_build_object('payload',payload,'before',jsonb_build_object('potential',s.potential,'labels',old_labels,'next',s.next_contact_on,'next_at',s.next_contact_at))) RETURNING id INTO target;
IF s.potential IS DISTINCT FROM _potential OR s.next_contact_on IS DISTINCT FROM nd OR s.next_contact_at IS DISTINCT FROM _next_at THEN
 INSERT INTO public.opportunity_signal_events(signal_id,actor_id,kind,detail) VALUES(_id,u,'enrichment',jsonb_build_object('potential_from',s.potential,'potential_to',_potential,'next_from',s.next_contact_on,'next_to',nd));
END IF;
RETURN target; END $$;
REVOKE ALL ON FUNCTION public.signal_enrichment_save(uuid,uuid,text,uuid[],date,timestamptz) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.signal_enrichment_save(uuid,uuid,text,uuid[],date,timestamptz) TO authenticated;
COMMENT ON TABLE public.signal_enrichment_events IS 'Request audit visible only to actor; public signal history contains no personal label payload.';