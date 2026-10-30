CREATE OR REPLACE FUNCTION public.biz_org_parent_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$BEGIN
 IF TG_TABLE_NAME='biz_teams' THEN
 IF NEW.active AND NOT EXISTS(SELECT 1 FROM public.biz_departments d JOIN public.biz_systems s ON s.id=d.system_id WHERE d.id=NEW.department_id AND d.active AND s.active) THEN RAISE EXCEPTION 'Nhóm cần phòng và Hệ đang hoạt động.'; END IF;
 ELSIF TG_TABLE_NAME='biz_management_assignments' THEN
 IF NEW.ended_at IS NULL THEN
 IF NEW.position='department_head' AND NOT EXISTS(SELECT 1 FROM public.biz_departments d JOIN public.biz_systems s ON s.id=d.system_id WHERE d.id=NEW.department_id AND d.active AND s.active) THEN RAISE EXCEPTION 'Phòng và Hệ phải đang hoạt động.'; END IF;
 IF NEW.position='team_lead' AND NOT EXISTS(SELECT 1 FROM public.biz_teams t JOIN public.biz_departments d ON d.id=t.department_id JOIN public.biz_systems s ON s.id=d.system_id WHERE t.id=NEW.team_id AND t.active AND d.active AND s.active) THEN RAISE EXCEPTION 'Nhóm, phòng và Hệ phải đang hoạt động.'; END IF;
 END IF; END IF; RETURN NEW;END $$;