-- Require manager acknowledgement of lunch coverage before publishing a weekly roster.
BEGIN;
CREATE OR REPLACE FUNCTION public.showroom_roster_action(_store text, _week date, _action text, _data jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE who uuid:=auth.uid(); cfg jsonb; win jsonb; w public.showroom_shift_weeks;
 now_local timestamp:=now() AT TIME ZONE 'Asia/Ho_Chi_Minh';
 start_at timestamptz; stop_at timestamptz;
 i int; off_count int:=0; shift_ text; day_ date; staff_ uuid; j jsonb;
 newcfg jsonb; newver int; note_ text:=btrim(coalesce(_data->>'reason',''));
 change_ public.showroom_shift_changes; left_ text; right_ text; status_ text;
 curr_left text; curr_right text; a_second text; b_first text; headcount int; dcheck jsonb; problems jsonb:='[]'::jsonb;
 other_week date; rest_needed int; rest_actual int; actor_ uuid; alert_id uuid;
BEGIN
 IF who IS NULL OR NOT private.is_active(who) THEN
   RAISE EXCEPTION 'Hãy đăng nhập lại để tiếp tục.' USING ERRCODE='42501'; END IF;
 IF _week IS NULL OR extract(isodow from _week)<>1 THEN RAISE EXCEPTION 'Tuần phải bắt đầu từ Thứ Hai.'; END IF;
 IF _data IS NULL OR jsonb_typeof(_data)<>'object' THEN RAISE EXCEPTION 'Dữ liệu gửi lên không hợp lệ.'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('showroom-shift:'||coalesce(_store,'')));
 cfg:=private.showroom_shift_policy(_store);
 win:=private.showroom_shift_window(_week,cfg);
 IF NOT private.showroom_shift_can(who,_store,'showroom.shift.view') THEN
   RAISE EXCEPTION 'Không có quyền truy cập lịch trực này.' USING ERRCODE='42501'; END IF;
 SELECT * INTO w FROM public.showroom_shift_weeks WHERE store_id=_store AND week_start=_week FOR UPDATE;
 start_at:=coalesce(w.opens_at,(win->>'open_at')::timestamptz);
 stop_at:=coalesce(w.closes_at,(win->>'close_at')::timestamptz);

 IF _action='register' THEN
   IF NOT private.showroom_shift_can(who,_store,'showroom.shift.register')
     OR NOT private.showroom_shift_member(who,_store)
   THEN RAISE EXCEPTION 'Không có quyền đăng ký ca ở cửa hàng này.' USING ERRCODE='42501'; END IF;
   IF now()<start_at OR now()>=stop_at OR coalesce(w.status,'draft')<>'draft' THEN
     RAISE EXCEPTION 'Đã ngoài thời gian đăng ký. Hãy gửi yêu cầu thay đổi hoặc liên hệ quản lý.'; END IF;
   IF jsonb_typeof(_data->'shifts')<>'array' OR jsonb_array_length(_data->'shifts')<>7 THEN
     RAISE EXCEPTION 'Cần chọn đủ lịch cho 7 ngày.'; END IF;
   FOR i IN 0..6 LOOP
     shift_:=_data->'shifts'->>i;
     IF shift_ NOT IN('early','late','full','off') OR shift_ IS NULL THEN
       RAISE EXCEPTION 'Ca tại ngày % không hợp lệ.',i+1; END IF;
     IF shift_='off' AND NOT private.showroom_shift_holiday(cfg,_week+i) THEN off_count:=off_count+1; END IF;
   END LOOP;
   IF off_count<>coalesce((cfg->>'rest_days')::int,1) THEN
     RAISE EXCEPTION 'Cần chọn đúng % ngày nghỉ trong tuần (không tính ngày lễ).',cfg->>'rest_days'; END IF;
   INSERT INTO public.showroom_shift_weeks(store_id,week_start) VALUES(_store,_week)
     ON CONFLICT(store_id,week_start) DO NOTHING;
   DELETE FROM public.showroom_shift_entries
    WHERE store_id=_store AND staff_id=who AND work_date BETWEEN _week AND _week+6;
   FOR i IN 0..6 LOOP
     INSERT INTO public.showroom_shift_entries(store_id,work_date,staff_id,requested_shift,updated_by)
     VALUES(_store,_week+i,who,_data->'shifts'->>i,who);
   END LOOP;
   INSERT INTO public.showroom_shift_audit(store_id,week_start,action,actor_id,detail)
    VALUES(_store,_week,'register',who,jsonb_build_object('days',7,'rest',off_count));
   RETURN jsonb_build_object('ok',true,'message','Đã gửi lịch đăng ký tuần.');

 ELSIF _action='assign' THEN
   IF NOT private.showroom_shift_can(who,_store,'showroom.shift.approve') THEN
     RAISE EXCEPTION 'Chỉ quản lý được phân ca.' USING ERRCODE='42501'; END IF;
   IF coalesce(w.status,'draft')<>'draft' THEN RAISE EXCEPTION 'Lịch đã công bố. Hãy dùng chức năng đổi ca.'; END IF;
   staff_:=(_data->>'staff_id')::uuid; day_:=(_data->>'date')::date;shift_:=_data->>'shift';
   IF day_ NOT BETWEEN _week AND _week+6 OR shift_ NOT IN('early','late','full','off')
    OR NOT private.showroom_shift_member(staff_,_store) THEN
     RAISE EXCEPTION 'Nhân sự, ngày hoặc ca không hợp lệ.'; END IF;
   INSERT INTO public.showroom_shift_weeks(store_id,week_start) VALUES(_store,_week)
     ON CONFLICT(store_id,week_start) DO NOTHING;
   INSERT INTO public.showroom_shift_entries(store_id,work_date,staff_id,assigned_shift,updated_by)
    VALUES(_store,day_,staff_,shift_,who)
    ON CONFLICT(store_id,work_date,staff_id) DO UPDATE SET
      assigned_shift=excluded.assigned_shift,updated_by=who,updated_at=now();
   INSERT INTO public.showroom_shift_audit(store_id,week_start,action,actor_id,detail)
    VALUES(_store,_week,'assign',who,jsonb_build_object('staff_id',staff_,'date',day_,'shift',shift_));
   RETURN jsonb_build_object('ok',true,'message','Đã cập nhật phân ca.');

 ELSIF _action='publish' THEN
   IF NOT private.showroom_shift_can(who,_store,'showroom.shift.approve') THEN
     RAISE EXCEPTION 'Chưa được cấp quyền chốt lịch.' USING ERRCODE='42501'; END IF;
   IF coalesce(w.status,'draft')='published' THEN RAISE EXCEPTION 'Lịch tuần này đã công bố.'; END IF;
   IF NOT FOUND THEN RAISE EXCEPTION 'Chưa có lịch đăng ký của tuần này.'; END IF;
   -- No missing assignments or weekly rest violations. Manager can assign missing cells explicitly.
   FOR staff_ IN
     SELECT DISTINCT a.user_id FROM public.org_assignments a
      JOIN public.profiles p ON p.id=a.user_id AND p.status='Đang hoạt động'
      WHERE a.unit_id=_store AND a.status='active' AND a.starts_at<=now()
       AND(a.ends_at IS NULL OR a.ends_at>now())
   LOOP
     SELECT count(*) FILTER (WHERE coalesce(e.assigned_shift,e.requested_shift)='off'
       AND NOT private.showroom_shift_holiday(cfg,e.work_date)),
      count(*) INTO rest_actual,headcount
     FROM public.showroom_shift_entries e
     WHERE e.store_id=_store AND e.staff_id=staff_ AND e.work_date BETWEEN _week AND _week+6;
     IF headcount<>7 THEN RAISE EXCEPTION 'Còn nhân viên chưa có đủ lịch 7 ngày. Hãy bổ sung trước khi chốt.'; END IF;
     IF rest_actual<>coalesce((cfg->>'rest_days')::int,1) THEN
       RAISE EXCEPTION 'Có nhân viên chưa đủ số ngày nghỉ theo chính sách.'; END IF;
   END LOOP;
   FOR i IN 0..6 LOOP
     day_:=_week+i;
     IF private.showroom_shift_holiday(cfg,day_) THEN CONTINUE; END IF;
     dcheck:=private.showroom_shift_day_check(_store,day_,cfg);
     IF (dcheck->>'working')::int<1 THEN
       RAISE EXCEPTION 'Ngày % chưa có ai trực. Không thể công bố.',day_; END IF;
     IF (dcheck->>'missing_early')::int>0 OR (dcheck->>'missing_late')::int>0 THEN
       IF coalesce((cfg->>'allow_full_exception')::boolean,false) AND (dcheck->>'full')::int>0
           AND length(note_)>=10 THEN
         problems:=problems||jsonb_build_array(dcheck);
       ELSE
         RAISE EXCEPTION 'Ngày % thiếu Ca 1/Ca 2. Hãy đổi ca hoặc dùng Ca Full theo ngoại lệ có ghi rõ lý do.',day_;
       END IF;
     END IF;
   END LOOP;
   -- A pair of early/late shifts does not cover the common 12:00-13:15 break.
   -- The manager must document a real noon-coverage arrangement before publishing.
   IF NOT coalesce((_data->>'lunch_confirmed')::boolean,false)
      OR coalesce(_data->>'lunch_plan','') NOT IN('staggered','backup','mixed') THEN
     RAISE EXCEPTION 'Cần xác nhận phương án có người trực trong giờ nghỉ trưa cho cả tuần.'; END IF;
   IF jsonb_array_length(problems)>0 AND coalesce(_data->>'lunch_plan','')='staggered' THEN
     RAISE EXCEPTION 'Có ngày Ca Full thiếu người: cần người hỗ trợ trực thay giờ nghỉ trưa, không thể chỉ chọn nghỉ luân phiên.'; END IF;
   UPDATE public.showroom_shift_weeks SET status='published',published_by=who,
     published_at=now(),publish_note=nullif(note_,''),revision=revision+1,updated_at=now()
     WHERE store_id=_store AND week_start=_week;
   INSERT INTO public.showroom_shift_audit(store_id,week_start,action,actor_id,detail)
     VALUES(_store,_week,'publish',who,jsonb_build_object('exceptions',problems,'reason',note_,
       'lunch_confirmed',true,'lunch_plan',_data->>'lunch_plan','lunch_confirmed_by',who));
   FOR actor_ IN SELECT DISTINCT a.user_id FROM public.org_assignments a
     JOIN public.profiles p ON p.id=a.user_id AND p.status='Đang hoạt động'
     WHERE a.unit_id=_store AND a.status='active' AND a.starts_at<=now()
       AND(a.ends_at IS NULL OR a.ends_at>now()) LOOP
     PERFORM private.showroom_shift_alert_send(actor_,_store,_week,'shift_published',
       'sr:published:'||_store||':'||_week||':'||actor_,
       'Lịch trực tuần '||to_char(_week,'DD/MM')||' đã công bố. Mở Lịch trực để xem ca của bạn.');
   END LOOP;
   RETURN jsonb_build_object('ok',true,'message','Đã công bố lịch trực.','exceptions',problems);

 ELSIF _action='save_policy' THEN
   IF NOT private.showroom_shift_can(who,_store,'showroom.shift.settings') THEN
     RAISE EXCEPTION 'Không có quyền cài đặt chính sách.' USING ERRCODE='42501'; END IF;
   IF jsonb_typeof(_data->'config')<>'object' OR length(note_)<4 THEN
     RAISE EXCEPTION 'Cần nhập cấu hình và lý do thay đổi (ít nhất 4 ký tự).'; END IF;
   IF EXISTS(SELECT 1 FROM jsonb_object_keys(_data->'config') k
     WHERE k NOT IN('open_day','open_time','close_day','close_time','publish_day','publish_time',
       'rest_days','min_early','min_late','allow_full_exception','remind','holidays',
       'open_store','close_store','early_start','early_end','late_start','late_end',
       'noon_break_start','noon_break_end','allow_cross_week_rest')) THEN
     RAISE EXCEPTION 'Cài đặt chứa trường không được hỗ trợ.'; END IF;
   newcfg:=cfg||(_data->'config');
   IF (newcfg->>'open_day')::int NOT BETWEEN 1 AND 7 OR
     (newcfg->>'close_day')::int NOT BETWEEN 1 AND 7 OR
     (newcfg->>'publish_day')::int NOT BETWEEN 1 AND 7 OR
     (newcfg->>'rest_days')::int NOT BETWEEN 0 AND 3 OR
     (newcfg->>'min_early')::int NOT BETWEEN 1 AND 10 OR
     (newcfg->>'min_late')::int NOT BETWEEN 1 AND 10
   THEN RAISE EXCEPTION 'Giới hạn ngày nghỉ hoặc định mức ca không hợp lệ.'; END IF;
   win:=private.showroom_shift_window(date '2026-11-23',newcfg);
   IF (win->>'open_at')::timestamptz >= (win->>'close_at')::timestamptz
      OR (win->>'close_at')::timestamptz >= (win->>'publish_due')::timestamptz
   THEN RAISE EXCEPTION 'Cần đặt thời điểm mở, khóa và hạn công bố theo đúng thứ tự.'; END IF;
   IF jsonb_typeof(newcfg->'holidays')<>'array' OR jsonb_array_length(newcfg->'holidays')>120 THEN
     RAISE EXCEPTION 'Danh sách ngày nghỉ lễ không hợp lệ.'; END IF;
   FOR j IN SELECT value FROM jsonb_array_elements(newcfg->'holidays') LOOP
     IF jsonb_typeof(j)<>'string' OR (trim(both '"' from j::text)) !~ '^20[0-9]{2}-[0-9]{2}-[0-9]{2}$' THEN
       RAISE EXCEPTION 'Ngày nghỉ lễ phải theo dạng YYYY-MM-DD.'; END IF;
   END LOOP;
   INSERT INTO public.showroom_shift_policies(store_id,config,version,updated_by)
    VALUES(_store,newcfg,1,who)
    ON CONFLICT(store_id) DO UPDATE SET config=excluded.config,
      version=public.showroom_shift_policies.version+1,updated_by=who,updated_at=now()
    RETURNING version INTO newver;
   INSERT INTO public.showroom_shift_policy_history(store_id,version,config,changed_by,reason)
     VALUES(_store,newver,newcfg,who,note_);
   INSERT INTO public.showroom_shift_audit(store_id,action,actor_id,detail)
     VALUES(_store,'policy',who,jsonb_build_object('version',newver,'reason',note_));
   RETURN jsonb_build_object('ok',true,'message','Đã lưu chính sách mới.','version',newver);

 ELSIF _action='change_create' THEN
   IF NOT private.showroom_shift_can(who,_store,'showroom.shift.swap')
     OR NOT private.showroom_shift_member(who,_store) THEN
     RAISE EXCEPTION 'Không có quyền đề nghị đổi ca.' USING ERRCODE='42501'; END IF;
   day_:=(_data->>'date')::date;
   IF day_<now_local::date OR day_>now_local::date+56 THEN RAISE EXCEPTION 'Chỉ đổi ca trong 8 tuần tiếp theo.'; END IF;
   SELECT coalesce(assigned_shift,requested_shift) INTO left_
    FROM public.showroom_shift_entries
    WHERE store_id=_store AND staff_id=who AND work_date=day_;
   IF left_ IS NULL OR NOT EXISTS(SELECT 1 FROM public.showroom_shift_weeks
      WHERE store_id=_store AND week_start=day_-(extract(isodow from day_)::int-1) AND status='published')
   THEN RAISE EXCEPTION 'Chỉ đổi các ca đã được công bố.'; END IF;
   IF coalesce(_data->>'kind','swap')='emergency' THEN
     IF length(note_)<4 THEN RAISE EXCEPTION 'Cần nhập lý do báo nghỉ khẩn cấp.'; END IF;
     INSERT INTO public.showroom_shift_changes(store_id,requester_id,work_date,original_shift,kind,reason,status)
       VALUES(_store,who,day_,left_,'emergency',note_,'pending_manager') RETURNING id INTO alert_id;
   ELSIF coalesce(_data->>'kind','swap')='swap' THEN
     staff_:=(_data->>'partner_id')::uuid;
     other_week:=(_data->>'partner_date')::date;
     IF staff_ IS NULL OR staff_=who OR NOT private.showroom_shift_member(staff_,_store)
       OR other_week<now_local::date OR other_week>now_local::date+56 THEN
       RAISE EXCEPTION 'Hãy chọn đồng nghiệp và ngày đổi ca hợp lệ.'; END IF;
     SELECT coalesce(assigned_shift,requested_shift) INTO right_
       FROM public.showroom_shift_entries
       WHERE store_id=_store AND staff_id=staff_ AND work_date=other_week;
     IF right_ IS NULL OR left_=right_ OR NOT EXISTS(SELECT 1 FROM public.showroom_shift_weeks
       WHERE store_id=_store AND week_start=other_week-(extract(isodow from other_week)::int-1) AND status='published')
     THEN RAISE EXCEPTION 'Chọn hai ca đã công bố và khác nhau để đổi.'; END IF;
     INSERT INTO public.showroom_shift_changes(store_id,requester_id,work_date,original_shift,
       partner_id,partner_date,partner_shift,kind,reason,status)
       VALUES(_store,who,day_,left_,staff_,other_week,right_,'swap',note_,'pending_peer') RETURNING id INTO alert_id;
   ELSIF coalesce(_data->>'kind','swap')='rest_exchange' THEN
     staff_:=(_data->>'partner_id')::uuid;
     other_week:=(_data->>'partner_date')::date;
     IF staff_ IS NULL OR staff_=who OR NOT private.showroom_shift_member(staff_,_store)
       OR left_<>'off' OR other_week IS NULL OR other_week=day_
       OR other_week<now_local::date OR other_week>now_local::date+56
       OR other_week-(extract(isodow from other_week)::int-1)
         <>day_-(extract(isodow from day_)::int-1)
     THEN RAISE EXCEPTION 'Hãy chọn ngày bạn nghỉ và ngày đồng nghiệp nghỉ trong cùng một tuần đã công bố.'; END IF;
     SELECT coalesce(assigned_shift,requested_shift) INTO a_second
       FROM public.showroom_shift_entries WHERE store_id=_store AND staff_id=who AND work_date=other_week;
     SELECT coalesce(assigned_shift,requested_shift) INTO b_first
       FROM public.showroom_shift_entries WHERE store_id=_store AND staff_id=staff_ AND work_date=day_;
     SELECT coalesce(assigned_shift,requested_shift) INTO right_
       FROM public.showroom_shift_entries WHERE store_id=_store AND staff_id=staff_ AND work_date=other_week;
     IF right_ IS DISTINCT FROM 'off' OR a_second NOT IN('early','late','full')
       OR b_first NOT IN('early','late','full')
     THEN RAISE EXCEPTION 'Hai người phải nghỉ hai ngày khác nhau và đang có ca làm ở ngày còn lại.'; END IF;
     INSERT INTO public.showroom_shift_changes(store_id,requester_id,work_date,original_shift,
       partner_id,partner_date,partner_shift,kind,reason,status,snapshot)
       VALUES(_store,who,day_,left_,staff_,other_week,right_,'rest_exchange',note_,'pending_peer',
         jsonb_build_object('a_second',a_second,'b_first',b_first)) RETURNING id INTO alert_id;
   ELSE RAISE EXCEPTION 'Loại yêu cầu không hợp lệ.'; END IF;
   INSERT INTO public.showroom_shift_audit(store_id,week_start,action,actor_id,detail)
    VALUES(_store,day_-(extract(isodow from day_)::int-1),'change_create',who,
      jsonb_build_object('date',day_,'kind',coalesce(_data->>'kind','swap')));
   IF coalesce(_data->>'kind','swap')='emergency' THEN
     PERFORM private.showroom_shift_alert_mgr(_store,day_-(extract(isodow from day_)::int-1),
       'sr:pending:'||alert_id,'Có báo nghỉ khẩn cấp Showroom cần quản lý xử lý.');
   ELSE
     PERFORM private.showroom_shift_alert_send(staff_,_store,day_-(extract(isodow from day_)::int-1),
       'shift_peer','sr:peer:'||alert_id||':'||staff_,
       'Có đồng nghiệp muốn đổi ca/ngày nghỉ với bạn. Vào Lịch trực → Đổi ca để trả lời.');
   END IF;
   RETURN jsonb_build_object('ok',true,'message','Đã gửi yêu cầu.');

 ELSIF _action IN('change_reply','change_review','change_cancel') THEN
   SELECT * INTO change_ FROM public.showroom_shift_changes
     WHERE id=(_data->>'id')::uuid AND store_id=_store FOR UPDATE;
   IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy yêu cầu đổi ca.'; END IF;
   IF _action='change_cancel' THEN
     IF change_.requester_id<>who OR change_.status NOT IN('pending_peer','pending_manager') THEN
       RAISE EXCEPTION 'Không thể thu hồi yêu cầu này.'; END IF;
     UPDATE public.showroom_shift_changes SET status='cancelled',updated_at=now() WHERE id=change_.id;
     IF change_.partner_id IS NOT NULL THEN
       PERFORM private.showroom_shift_alert_send(change_.partner_id,_store,
         change_.work_date-(extract(isodow from change_.work_date)::int-1),'shift_result',
         'sr:cancel:'||change_.id||':'||change_.partner_id,'Yêu cầu đổi ca bạn tham gia đã được thu hồi.');
     END IF;
     RETURN jsonb_build_object('ok',true,'message','Đã thu hồi yêu cầu.');
   END IF;
   IF _action='change_reply' THEN
     IF change_.partner_id<>who OR change_.status<>'pending_peer' THEN
       RAISE EXCEPTION 'Yêu cầu này không còn chờ bạn phản hồi.'; END IF;
     status_:=CASE WHEN coalesce((_data->>'accept')::boolean,false) THEN 'pending_manager' ELSE 'rejected' END;
     UPDATE public.showroom_shift_changes SET status=status_,updated_at=now(),
      decision_note=CASE WHEN status_='rejected' THEN nullif(note_,'') ELSE NULL END,
      decided_by=CASE WHEN status_='rejected' THEN who ELSE NULL END,
      decided_at=CASE WHEN status_='rejected' THEN now() ELSE NULL END
      WHERE id=change_.id;
     IF status_='pending_manager' THEN
       PERFORM private.showroom_shift_alert_mgr(_store,
         change_.work_date-(extract(isodow from change_.work_date)::int-1),
         'sr:pending:'||change_.id,'Có yêu cầu đổi ca/ngày nghỉ đang chờ quản lý duyệt.');
     ELSE
       PERFORM private.showroom_shift_alert_send(change_.requester_id,_store,
         change_.work_date-(extract(isodow from change_.work_date)::int-1),'shift_result',
         'sr:peer_reject:'||change_.id||':'||change_.requester_id,
         'Đồng nghiệp đã từ chối nhận/đổi ca của bạn.');
     END IF;
     RETURN jsonb_build_object('ok',true,'message',CASE WHEN status_='rejected' THEN 'Đã từ chối nhận ca.' ELSE 'Đã đồng ý nhận ca, chờ quản lý duyệt.' END);
   END IF;
   IF NOT private.showroom_shift_can(who,_store,'showroom.shift.approve') OR change_.status<>'pending_manager'
   THEN RAISE EXCEPTION 'Yêu cầu không ở trạng thái chờ quản lý duyệt.' USING ERRCODE='42501'; END IF;
   IF coalesce((_data->>'accept')::boolean,false) THEN
     SELECT coalesce(assigned_shift,requested_shift) INTO curr_left
       FROM public.showroom_shift_entries
       WHERE store_id=_store AND staff_id=change_.requester_id AND work_date=change_.work_date FOR UPDATE;
     IF curr_left IS DISTINCT FROM change_.original_shift THEN
       RAISE EXCEPTION 'Ca đã đổi từ lúc gửi yêu cầu, hãy tạo yêu cầu mới.'; END IF;
     IF change_.kind IN('swap','rest_exchange') THEN
       SELECT coalesce(assigned_shift,requested_shift) INTO curr_right
        FROM public.showroom_shift_entries
        WHERE store_id=_store AND staff_id=change_.partner_id AND work_date=change_.partner_date FOR UPDATE;
       IF curr_right IS DISTINCT FROM change_.partner_shift THEN
         RAISE EXCEPTION 'Ca đồng nghiệp đã thay đổi, hãy tạo yêu cầu mới.'; END IF;
       IF change_.kind='rest_exchange' THEN
         SELECT coalesce(assigned_shift,requested_shift) INTO a_second
           FROM public.showroom_shift_entries
           WHERE store_id=_store AND staff_id=change_.requester_id AND work_date=change_.partner_date FOR UPDATE;
         SELECT coalesce(assigned_shift,requested_shift) INTO b_first
           FROM public.showroom_shift_entries
           WHERE store_id=_store AND staff_id=change_.partner_id AND work_date=change_.work_date FOR UPDATE;
         IF curr_left IS DISTINCT FROM 'off' OR curr_right IS DISTINCT FROM 'off'
           OR a_second IS DISTINCT FROM change_.snapshot->>'a_second'
           OR b_first IS DISTINCT FROM change_.snapshot->>'b_first'
         THEN RAISE EXCEPTION 'Một trong bốn ca đã thay đổi, hãy tạo lại yêu cầu đổi ngày nghỉ.'; END IF;
         UPDATE public.showroom_shift_entries SET assigned_shift=b_first,updated_by=who,updated_at=now()
          WHERE store_id=_store AND staff_id=change_.requester_id AND work_date=change_.work_date;
         UPDATE public.showroom_shift_entries SET assigned_shift='off',updated_by=who,updated_at=now()
          WHERE store_id=_store AND staff_id=change_.partner_id AND work_date=change_.work_date;
         UPDATE public.showroom_shift_entries SET assigned_shift='off',updated_by=who,updated_at=now()
          WHERE store_id=_store AND staff_id=change_.requester_id AND work_date=change_.partner_date;
         UPDATE public.showroom_shift_entries SET assigned_shift=a_second,updated_by=who,updated_at=now()
          WHERE store_id=_store AND staff_id=change_.partner_id AND work_date=change_.partner_date;
       ELSE
       UPDATE public.showroom_shift_entries SET assigned_shift=curr_right,updated_by=who,updated_at=now()
        WHERE store_id=_store AND staff_id=change_.requester_id AND work_date=change_.work_date;
       UPDATE public.showroom_shift_entries SET assigned_shift=curr_left,updated_by=who,updated_at=now()
        WHERE store_id=_store AND staff_id=change_.partner_id AND work_date=change_.partner_date;
       END IF;
       -- Changes may span weeks. Preserve the mandatory weekly rest invariant unless
       -- a separately-reviewed exceptional policy is explicitly configured.
       FOR actor_ IN SELECT DISTINCT x FROM unnest(ARRAY[change_.requester_id,change_.partner_id]) x LOOP
         FOR other_week IN SELECT DISTINCT x FROM unnest(ARRAY[
            change_.work_date-(extract(isodow from change_.work_date)::int-1),
            change_.partner_date-(extract(isodow from change_.partner_date)::int-1)]) x LOOP
           SELECT count(*) INTO rest_actual FROM public.showroom_shift_entries e
             WHERE e.store_id=_store AND e.staff_id=actor_ AND
               e.work_date BETWEEN other_week AND other_week+6
               AND coalesce(e.assigned_shift,e.requested_shift)='off'
               AND NOT private.showroom_shift_holiday(cfg,e.work_date);
           IF rest_actual<>coalesce((cfg->>'rest_days')::int,1)
             AND NOT coalesce((cfg->>'allow_cross_week_rest')::boolean,false) THEN
             RAISE EXCEPTION 'Đổi ca làm lệch định mức nghỉ trong tuần. Cần đổi phương án hoặc duyệt chính sách ngoại lệ hợp lệ.'; END IF;
         END LOOP;
       END LOOP;
       FOR day_ IN SELECT DISTINCT x FROM unnest(ARRAY[change_.work_date,change_.partner_date]) x LOOP
         IF private.showroom_shift_holiday(cfg,day_) THEN CONTINUE; END IF;
         dcheck:=private.showroom_shift_day_check(_store,day_,cfg);
         IF (dcheck->>'working')::int<1 OR
           ((dcheck->>'missing_early')::int>0 OR (dcheck->>'missing_late')::int>0) AND
           (dcheck->>'full')::int=0 THEN
           RAISE EXCEPTION 'Sau đổi ca, ngày % không đủ người Ca 1/Ca 2. Hãy chọn phương án khác.',day_; END IF;
       END LOOP;
     ELSE
       IF length(note_)<4 THEN RAISE EXCEPTION 'Cần ghi cách xử lý trường hợp khẩn cấp.'; END IF;
       UPDATE public.showroom_shift_entries SET assigned_shift='off',updated_by=who,updated_at=now()
       WHERE store_id=_store AND staff_id=change_.requester_id AND work_date=change_.work_date;
       -- An emergency is acknowledged rather than silently treated as valid coverage.
     END IF;
   END IF;
   UPDATE public.showroom_shift_changes SET
    status=CASE WHEN coalesce((_data->>'accept')::boolean,false) THEN 'approved' ELSE 'rejected' END,
    decided_by=who,decided_at=now(),decision_note=nullif(note_,''),
    updated_at=now() WHERE id=change_.id;
   INSERT INTO public.showroom_shift_audit(store_id,week_start,action,actor_id,detail)
     VALUES(_store,change_.work_date-(extract(isodow from change_.work_date)::int-1),
      'change_review',who,jsonb_build_object('change_id',change_.id,'kind',change_.kind,
       'accepted',coalesce((_data->>'accept')::boolean,false),'note',note_));
   PERFORM private.showroom_shift_alert_send(change_.requester_id,_store,
     change_.work_date-(extract(isodow from change_.work_date)::int-1),'shift_result',
     'sr:review:'||change_.id||':'||change_.requester_id,
     CASE WHEN coalesce((_data->>'accept')::boolean,false)
       THEN 'Quản lý đã duyệt yêu cầu đổi ca/ngày nghỉ của bạn.'
       ELSE 'Quản lý đã từ chối yêu cầu đổi ca/ngày nghỉ của bạn.' END);
   IF change_.partner_id IS NOT NULL THEN
     PERFORM private.showroom_shift_alert_send(change_.partner_id,_store,
       change_.work_date-(extract(isodow from change_.work_date)::int-1),'shift_result',
       'sr:review:'||change_.id||':'||change_.partner_id,
       CASE WHEN coalesce((_data->>'accept')::boolean,false)
         THEN 'Quản lý đã duyệt yêu cầu đổi ca bạn tham gia.'
         ELSE 'Yêu cầu đổi ca bạn tham gia không được quản lý duyệt.' END);
   END IF;
   RETURN jsonb_build_object('ok',true,'message','Đã xử lý yêu cầu đổi ca.');
 ELSE
   RAISE EXCEPTION 'Tác vụ lịch trực không được hỗ trợ.';
 END IF;
END $function$;
COMMIT;