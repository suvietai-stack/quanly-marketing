DO $$ BEGIN IF md5(pg_get_functiondef('public.k3_member_invite(uuid,uuid[])'::regprocedure)) <> 'b994a934060adc9e4ccae3171f517a8e' THEN RAISE EXCEPTION 'K3 invitation gate changed'; END IF; END $$;
CREATE OR REPLACE FUNCTION public.k3_member_invite(_goal_id uuid, _user_ids uuid[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE g public.k3_goals; u uuid; invited int:=0;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập.'; END IF;
  SELECT * INTO g FROM public.k3_goals WHERE id=_goal_id FOR UPDATE;
  IF g.id IS NULL OR NOT private.k3_goal_manage_ok(auth.uid(), g.id) THEN RAISE EXCEPTION 'Bạn không có quyền mời thành viên vào mục tiêu này.'; END IF;
  IF g.status IN ('done','ended_missed','cancelled') THEN RAISE EXCEPTION 'Mục tiêu đã kết thúc, không thể mời thành viên.'; END IF;
  IF NOT coalesce((SELECT (allow_invite AND allow_team_goal) FROM public.k3_settings WHERE id),true) AND NOT public.biz_admin(auth.uid()) THEN RAISE EXCEPTION 'Quyền mời thành viên đang tắt trong Cài đặt 3K.'; END IF;
  IF NOT public.biz_participant(auth.uid()) AND NOT public.k3_can(auth.uid(),'k3.view_scope') AND EXISTS(SELECT 1 FROM unnest(coalesce(_user_ids,'{}'::uuid[])) x WHERE x IS DISTINCT FROM auth.uid()) THEN RAISE EXCEPTION '3K cá nhân chưa mở lời mời liên phòng.'; END IF;
  FOREACH u IN ARRAY coalesce(_user_ids,'{}'::uuid[]) LOOP
    IF u IS NULL OR u=g.user_id THEN CONTINUE; END IF;
    IF NOT public.k3_can(u,'k3.use') THEN RAISE EXCEPTION 'Nhân sự được mời phải đang hoạt động và thuộc Cơ cấu tổ chức Kinh doanh.'; END IF;
    INSERT INTO public.k3_goal_members(goal_id,user_id,status,invited_by,invited_at)
    VALUES(g.id,u,'invited',auth.uid(),now())
    ON CONFLICT (goal_id,user_id) DO UPDATE SET status='invited',invited_by=auth.uid(),invited_at=now(),responded_at=NULL,revoked_at=NULL,revoked_by=NULL
      WHERE public.k3_goal_members.status IN ('declined','revoked');
    invited:=invited+1;
    INSERT INTO public.k3_plan_events(user_id,goal_id,actor_id,action,detail) VALUES(g.user_id,g.id,auth.uid(),'member_invite',jsonb_build_object('member',u));
  END LOOP;
  RETURN jsonb_build_object('invited',invited);
END$function$
;
DO $$ BEGIN IF md5(pg_get_functiondef('public.k3_member_search(text)'::regprocedure)) <> '8021312a146cee1c8cfed8c476143ead' THEN RAISE EXCEPTION 'K3 invitation gate changed'; END IF; END $$;
CREATE OR REPLACE FUNCTION public.k3_member_search(_q text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.k3_can(auth.uid(),'k3.use') THEN RAISE EXCEPTION 'Bạn không có quyền sử dụng 3K.'; END IF;
  RETURN coalesce((SELECT jsonb_agg(jsonb_build_object('id',x.id,'full_name',x.full_name,'departments',x.departments) ORDER BY x.full_name) FROM (
    SELECT p.id, p.full_name, coalesce(array_agg(DISTINCT d.name) FILTER (WHERE d.name IS NOT NULL), '{}'::text[]) departments
    FROM public.profiles p
    LEFT JOIN public.biz_department_members m ON m.user_id=p.id
    LEFT JOIN public.biz_departments d ON d.id=m.department_id
    WHERE p.status='Đang hoạt động' AND (p.id=auth.uid() OR public.biz_participant(auth.uid()) OR public.k3_can(auth.uid(),'k3.view_scope')) AND (coalesce(_q,'')='' OR p.full_name ILIKE '%'||_q||'%')
    GROUP BY p.id, p.full_name ORDER BY p.full_name LIMIT 20) x),'[]'::jsonb);
END$function$
;