CREATE OR REPLACE FUNCTION public.biz_member_save(_department_id uuid,_user_id uuid,_is_manager boolean) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_id uuid; v_now timestamptz;
BEGIN
 IF NOT private.sig_can(auth.uid(),'biz.dept_manage') THEN RAISE EXCEPTION 'Bạn không có quyền quản lý phòng ban kinh doanh.'; END IF;
 PERFORM 1 FROM public.profiles WHERE id=_user_id FOR UPDATE; IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy nhân viên.'; END IF;
 v_now:=clock_timestamp();
 IF NOT EXISTS(SELECT 1 FROM public.biz_departments WHERE id=_department_id AND active) THEN RAISE EXCEPTION 'Phòng ban không tồn tại hoặc đã ngừng.'; END IF;
 SELECT id INTO v_id FROM public.biz_department_members WHERE user_id=_user_id AND department_id=_department_id AND ended_at IS NULL;
 IF v_id IS NOT NULL THEN UPDATE public.biz_department_members SET is_manager=coalesce(_is_manager,false) WHERE id=v_id; RETURN v_id; END IF;
 UPDATE public.biz_department_members SET ended_at=v_now,effective_to=(v_now AT TIME ZONE 'Asia/Ho_Chi_Minh')::date WHERE user_id=_user_id AND ended_at IS NULL;
 INSERT INTO public.biz_department_members(department_id,user_id,is_manager,effective_from,started_at) VALUES(_department_id,_user_id,coalesce(_is_manager,false),(v_now AT TIME ZONE 'Asia/Ho_Chi_Minh')::date,v_now) RETURNING id INTO v_id;
 RETURN v_id;
END $$;
CREATE OR REPLACE FUNCTION public.biz_member_end(_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_user uuid; v_now timestamptz;
BEGIN
 IF NOT private.sig_can(auth.uid(),'biz.dept_manage') THEN RAISE EXCEPTION 'Bạn không có quyền quản lý phòng ban kinh doanh.'; END IF;
 SELECT user_id INTO v_user FROM public.biz_department_members WHERE id=_id;
 PERFORM 1 FROM public.profiles WHERE id=v_user FOR UPDATE;
 v_now:=clock_timestamp();
 UPDATE public.biz_department_members SET ended_at=v_now,effective_to=(v_now AT TIME ZONE 'Asia/Ho_Chi_Minh')::date WHERE id=_id AND ended_at IS NULL;
 IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy thành viên đang hiệu lực.'; END IF;
END $$;