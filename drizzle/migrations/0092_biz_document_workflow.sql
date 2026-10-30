CREATE FUNCTION public.biz_document_start(_kind text,_period_kind text,_year int,_period int,_reason text DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE d public.biz_documents; v_id uuid; dep uuid; target uuid; vals jsonb;
BEGIN
 IF _kind NOT IN ('plan','report') OR NOT private.sig_can(auth.uid(),'biz.'||_kind||'_submit') THEN RAISE EXCEPTION 'Không có quyền nộp tài liệu.'; END IF;
 PERFORM public.biz_period_start(_year,_period_kind,_period); PERFORM 1 FROM public.profiles WHERE id=auth.uid() FOR UPDATE;
 dep:=public.biz_period_department(auth.uid(),_year,_period_kind,_period); IF dep IS NULL THEN RAISE EXCEPTION 'Bạn không thuộc phòng kinh doanh trong kỳ này.'; END IF;
 SELECT * INTO d FROM public.biz_documents WHERE user_id=auth.uid() AND kind=_kind AND period_kind=_period_kind AND year=_year AND period=_period FOR UPDATE;
 IF d.id IS NULL THEN INSERT INTO public.biz_documents(user_id,department_id,department_name,kind,period_kind,year,period,deadline) SELECT auth.uid(),id,name,_kind,_period_kind,_year,_period,public.biz_deadline_at(_kind||'_'||_period_kind,_year,_period) FROM public.biz_departments WHERE id=dep RETURNING * INTO d; END IF;
 SELECT id INTO v_id FROM public.biz_document_versions WHERE document_id=d.id AND status<>'approved'; IF v_id IS NOT NULL THEN RETURN v_id; END IF;
 IF d.official_version_id IS NOT NULL AND btrim(coalesce(_reason,''))='' THEN RAISE EXCEPTION 'Cần nêu lý do điều chỉnh.'; END IF;
 SELECT official_version_id INTO target FROM public.biz_annual_goals WHERE user_id=auth.uid() AND year=_year;
 vals:='[]';
 IF _kind='report' AND _period_kind='month' AND target IS NOT NULL THEN SELECT coalesce(jsonb_agg(jsonb_build_object('metric_id',metric_id,'definition',definition,'target',months[_period]::text,'annual_target',annual::text,'actual',NULL)),'[]') INTO vals FROM public.biz_goal_items WHERE version_id=target; END IF;
 INSERT INTO public.biz_document_versions(document_id,version,reason,target_version_id,items) VALUES(d.id,coalesce((SELECT max(version) FROM public.biz_document_versions WHERE document_id=d.id),0)+1,nullif(btrim(_reason),''),CASE WHEN _kind='report' THEN target END,vals) RETURNING id INTO v_id;
 IF d.official_version_id IS NOT NULL THEN UPDATE public.biz_document_versions SET url=old.url,notes=old.notes,target_version_id=old.target_version_id,items=old.items FROM public.biz_document_versions old WHERE old.id=d.official_version_id AND biz_document_versions.id=v_id; END IF;
 INSERT INTO public.biz_document_events(document_id,version_id,actor_id,action,payload) VALUES(d.id,v_id,auth.uid(),'created',jsonb_build_object('reason',_reason)); RETURN v_id;
END $$;
CREATE FUNCTION public.biz_document_save(_id uuid,_revision int,_url text,_notes text,_actuals jsonb,_submit boolean DEFAULT false) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v public.biz_document_versions; d public.biz_documents; new_items jsonb:='[]'; i jsonb; a jsonb;
BEGIN
 SELECT * INTO v FROM public.biz_document_versions WHERE id=_id FOR UPDATE; SELECT * INTO d FROM public.biz_documents WHERE id=v.document_id FOR UPDATE;
 IF d.user_id IS DISTINCT FROM auth.uid() OR NOT private.sig_can(auth.uid(),'biz.'||d.kind||'_submit') THEN RAISE EXCEPTION 'Không có quyền sửa tài liệu.'; END IF;
 IF v.status NOT IN ('draft','changes') THEN RAISE EXCEPTION 'Tài liệu đang chờ duyệt hoặc đã khóa.'; END IF;
 IF v.revision<>_revision THEN RAISE EXCEPTION 'Dữ liệu đã thay đổi. Hãy tải lại.'; END IF;
 IF btrim(coalesce(_url,''))<>'' AND NOT public.biz_docs_url_ok(btrim(_url)) THEN RAISE EXCEPTION 'Link phải là Google Docs HTTPS hợp lệ.'; END IF;
 IF _submit AND NOT public.biz_docs_url_ok(btrim(coalesce(_url,''))) THEN RAISE EXCEPTION 'Cần link Google Docs hợp lệ trước khi gửi.'; END IF;
 IF d.kind='report' AND d.period_kind='month' THEN
  IF jsonb_typeof(_actuals) IS DISTINCT FROM 'array' OR jsonb_array_length(_actuals)<>jsonb_array_length(v.items) OR (SELECT count(DISTINCT x->>'metric_id') FROM jsonb_array_elements(_actuals) x)<>jsonb_array_length(_actuals) THEN RAISE EXCEPTION 'Danh sách KR không hợp lệ.'; END IF;
  FOR i IN SELECT * FROM jsonb_array_elements(v.items) LOOP
   SELECT x->'actual' INTO a FROM jsonb_array_elements(_actuals) x WHERE x->>'metric_id'=i->>'metric_id';
   IF a IS NULL THEN RAISE EXCEPTION 'Thiếu KR.'; END IF;
   IF a<>'null'::jsonb AND (a#>>'{}') !~ '^[0-9]{1,20}$' THEN RAISE EXCEPTION 'Thực tế phải là số nguyên không âm, tối đa 20 chữ số.'; END IF;
   IF _submit AND a='null'::jsonb THEN RAISE EXCEPTION 'Cần nhập kết quả từng KR, giá trị 0 hợp lệ.'; END IF;
   new_items:=new_items||jsonb_build_array(i||jsonb_build_object('actual',a));
  END LOOP;
 ELSE
  IF coalesce(_actuals,'[]'::jsonb)<>'[]'::jsonb THEN RAISE EXCEPTION 'Không nhập lại thực tế Quý/Năm hoặc số liệu kế hoạch.'; END IF;
  new_items:=v.items;
 END IF;
 IF _submit AND d.first_submitted_at IS NULL THEN UPDATE public.biz_documents SET deadline=public.biz_deadline_at(d.kind||'_'||d.period_kind,d.year,d.period),deadline_frozen=true,first_submitted_at=now() WHERE id=d.id; END IF;
 IF _submit THEN UPDATE public.biz_documents SET last_submitted_at=now() WHERE id=d.id; END IF;
 UPDATE public.biz_document_versions SET url=nullif(btrim(_url),''),notes=nullif(btrim(_notes),''),items=new_items,status=CASE WHEN _submit THEN 'pending' ELSE status END,submitted_at=CASE WHEN _submit THEN now() ELSE submitted_at END,revision=revision+1 WHERE id=v.id;
 INSERT INTO public.biz_document_events(document_id,version_id,actor_id,action,payload) VALUES(d.id,v.id,auth.uid(),CASE WHEN _submit THEN 'submitted' ELSE 'saved' END,jsonb_build_object('old',to_jsonb(v),'new',jsonb_build_object('url',_url,'notes',_notes,'items',new_items),'target_version_id',v.target_version_id));
END $$;
CREATE FUNCTION public.biz_document_decide(_id uuid,_revision int,_approve boolean,_comment text DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v public.biz_document_versions; d public.biz_documents;
BEGIN
 SELECT * INTO v FROM public.biz_document_versions WHERE id=_id FOR UPDATE; SELECT * INTO d FROM public.biz_documents WHERE id=v.document_id FOR UPDATE;
 IF NOT public.biz_doc_access(d.user_id,d.department_id,d.kind,true) THEN RAISE EXCEPTION 'Không có quyền duyệt hoặc không được tự duyệt.'; END IF;
 IF v.status<>'pending' OR v.revision<>_revision THEN RAISE EXCEPTION 'Tài liệu không còn chờ duyệt. Hãy tải lại.'; END IF;
 IF NOT _approve AND btrim(coalesce(_comment,''))='' THEN RAISE EXCEPTION 'Cần nhận xét yêu cầu chỉnh sửa.'; END IF;
 UPDATE public.biz_document_versions SET status=CASE WHEN _approve THEN 'approved' ELSE 'changes' END,review_comment=nullif(btrim(_comment),''),approved_at=CASE WHEN _approve THEN now() END,approved_by=CASE WHEN _approve THEN auth.uid() END,revision=revision+1 WHERE id=v.id;
 IF _approve THEN UPDATE public.biz_documents SET official_version_id=v.id WHERE id=d.id; END IF;
 INSERT INTO public.biz_document_events(document_id,version_id,actor_id,action,payload) VALUES(d.id,v.id,auth.uid(),CASE WHEN _approve THEN 'approved' ELSE 'returned' END,jsonb_build_object('comment',_comment,'items',v.items,'target_version_id',v.target_version_id));
END $$;
CREATE FUNCTION public.biz_documents_read(_kind text,_period_kind text,_year int,_period int) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE result jsonb;
BEGIN
 IF _kind NOT IN ('plan','report') THEN RAISE EXCEPTION 'Loại tài liệu không hợp lệ.'; END IF; PERFORM public.biz_period_start(_year,_period_kind,_period);
 SELECT coalesce(jsonb_agg(jsonb_build_object('user_id',p.id,'employee_name',p.full_name,'department_id',coalesce(d.department_id,dep.id),'department_name',coalesce(d.department_name,dep.name),'can_review',public.biz_doc_access(p.id,coalesce(d.department_id,dep.id),_kind,true),'document',CASE WHEN d.id IS NULL THEN NULL ELSE to_jsonb(d)||jsonb_build_object('deadline',CASE WHEN d.deadline_frozen THEN d.deadline ELSE public.biz_deadline_at(_kind||'_'||_period_kind,_year,_period) END,'versions',(SELECT jsonb_agg(to_jsonb(v) ORDER BY version) FROM public.biz_document_versions v WHERE document_id=d.id)) END,'deadline',CASE WHEN d.deadline_frozen THEN d.deadline ELSE public.biz_deadline_at(_kind||'_'||_period_kind,_year,_period) END,'server_now',now()) ORDER BY p.full_name),'[]') INTO result
 FROM public.profiles p JOIN public.biz_departments dep ON dep.id=public.biz_period_department(p.id,_year,_period_kind,_period) LEFT JOIN public.biz_documents d ON d.user_id=p.id AND d.kind=_kind AND d.period_kind=_period_kind AND d.year=_year AND d.period=_period
 WHERE public.biz_doc_access(p.id,coalesce(d.department_id,dep.id),_kind);
 RETURN result;
END $$;
CREATE FUNCTION public.biz_report_metrics(_user uuid,_year int,_period_kind text,_period int,_mode text DEFAULT 'official') RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE dep uuid; target uuid; lo int; hi int; i public.biz_goal_items; m int; v public.biz_document_versions; chosen uuid; item jsonb; values_ numeric[]; complete_months int[]; missing int[]; result jsonb:='[]'; target_value numeric; actual_value numeric; percent_value numeric;
BEGIN
 PERFORM public.biz_period_start(_year,_period_kind,_period); dep:=public.biz_period_department(_user,_year,_period_kind,_period);
 IF NOT public.biz_doc_access(_user,dep,'report') THEN RAISE EXCEPTION 'Không có quyền xem báo cáo.'; END IF;
 IF _mode NOT IN ('official','provisional') THEN RAISE EXCEPTION 'Chế độ không hợp lệ.'; END IF;
 SELECT official_version_id INTO target FROM public.biz_annual_goals WHERE user_id=_user AND year=_year;
 IF target IS NULL THEN RETURN jsonb_build_object('target_version_id',NULL,'items','[]'::jsonb,'no_target',true); END IF;
 lo:=CASE _period_kind WHEN 'month' THEN _period WHEN 'quarter' THEN (_period-1)*3+1 ELSE 1 END; hi:=lo+CASE _period_kind WHEN 'month' THEN 0 WHEN 'quarter' THEN 2 ELSE 11 END;
 FOR i IN SELECT * FROM public.biz_goal_items WHERE version_id=target LOOP
  values_:='{}';complete_months:='{}';missing:='{}';
  FOR m IN lo..hi LOOP
   chosen:=NULL;
   SELECT CASE WHEN _mode='official' THEN d.official_version_id ELSE coalesce((SELECT id FROM public.biz_document_versions WHERE document_id=d.id AND status='pending' ORDER BY version DESC LIMIT 1),d.official_version_id) END INTO chosen FROM public.biz_documents d WHERE user_id=_user AND kind='report' AND period_kind='month' AND year=_year AND period=m;
   SELECT * INTO v FROM public.biz_document_versions WHERE id=chosen;
   SELECT x INTO item FROM jsonb_array_elements(coalesce(v.items,'[]')) x WHERE x->>'metric_id'=i.metric_id::text;
   IF item->>'actual' IS NULL THEN missing:=array_append(missing,m); ELSE values_:=array_append(values_,(item->>'actual')::numeric);complete_months:=array_append(complete_months,m); END IF;
  END LOOP;
  SELECT CASE WHEN i.definition->>'aggregation'='sum' THEN sum(x) ELSE avg(x) END INTO actual_value FROM unnest(values_) x;
  SELECT CASE WHEN i.definition->>'aggregation'='sum' THEN sum(x) ELSE avg(x) END INTO target_value FROM unnest(i.months[lo:hi]) x;
  percent_value:=CASE WHEN target_value>0 AND i.definition->>'direction'='higher' THEN actual_value/target_value*100 ELSE NULL END;
  result:=result||jsonb_build_array(jsonb_build_object('metric_id',i.metric_id,'definition',i.definition,'target',target_value::text,'annual_target',i.annual::text,'actual',actual_value::text,'percent',percent_value::text,'complete',cardinality(missing)=0,'confirmed_months',complete_months,'missing_months',missing,'mode',_mode,'difference',(actual_value-target_value)::text,'remaining',(i.annual-actual_value)::text));
 END LOOP;
 RETURN jsonb_build_object('target_version_id',target,'items',result,'no_target',false);
END $$;
REVOKE ALL ON FUNCTION public.biz_document_start(text,text,int,int,text),public.biz_document_save(uuid,int,text,text,jsonb,boolean),public.biz_document_decide(uuid,int,boolean,text),public.biz_documents_read(text,text,int,int),public.biz_report_metrics(uuid,int,text,int,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.biz_document_start(text,text,int,int,text),public.biz_document_save(uuid,int,text,text,jsonb,boolean),public.biz_document_decide(uuid,int,boolean,text),public.biz_documents_read(text,text,int,int),public.biz_report_metrics(uuid,int,text,int,text) TO authenticated;