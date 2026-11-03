CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE handle text;BEGIN
 handle:=trim(coalesce(NEW.raw_user_meta_data->>'username',split_part(NEW.email,'@',1)));
 IF handle='' OR length(handle)>100 OR lower(handle)='admin' OR handle~'[[:cntrl:]]' THEN RAISE EXCEPTION 'Tên đăng nhập không hợp lệ hoặc đã được sử dụng.';END IF;
 INSERT INTO profiles(id,username,full_name,email,phone,desired_position,notes,status) VALUES(NEW.id,handle,coalesce(NEW.raw_user_meta_data->>'full_name',''),NEW.email,NEW.raw_user_meta_data->>'phone',NEW.raw_user_meta_data->>'desired_position',NEW.raw_user_meta_data->>'notes','Chờ duyệt') ON CONFLICT(id) DO NOTHING;RETURN NEW;END;$$;
CREATE OR REPLACE FUNCTION public.account_username_identity(_username text) RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$SELECT id FROM profiles WHERE lower(username)=lower(trim(_username));$$;
CREATE FUNCTION public.account_role_delete_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,private AS $$BEGIN
 IF OLD.role_id IN ('role-super-admin','role-admin') AND NOT private.is_super_admin(auth.uid()) AND auth.uid() IS NOT NULL THEN RAISE EXCEPTION 'Chỉ Super Admin được xóa quyền quản trị.' USING ERRCODE='42501';END IF;RETURN OLD;END;$$;
CREATE TRIGGER account_role_delete_guard BEFORE DELETE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.account_role_delete_guard();
REVOKE ALL ON FUNCTION public.account_role_delete_guard() FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION public.leave_settings_get() RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT CASE WHEN NOT coalesce(private.is_active(auth.uid()),false) THEN NULL ELSE private.leave_settings_current() END;$$;
CREATE OR REPLACE FUNCTION public.oq_delete_draft(_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$BEGIN
 IF NOT private.is_active(auth.uid()) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501';END IF;
 DELETE FROM oq_requests WHERE id=_id AND creator_id=auth.uid() AND status='draft';IF NOT FOUND THEN RAISE EXCEPTION 'Không xóa được bản nháp này.';END IF;END;$$;
CREATE OR REPLACE FUNCTION public.oq_image_add(_item uuid,_path text,_category text,_caption text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE _rid uuid;_new uuid;BEGIN
 IF NOT private.is_active(auth.uid()) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501';END IF;
 SELECT i.request_id INTO _rid FROM oq_items i JOIN oq_requests r ON r.id=i.request_id WHERE i.id=_item AND r.creator_id=auth.uid() AND r.status='draft';
 IF _rid IS NULL THEN RAISE EXCEPTION 'Chỉ thêm ảnh khi yêu cầu còn là bản nháp của bạn.';END IF;
 IF split_part(_path,'/',1)<>_rid::text THEN RAISE EXCEPTION 'Đường dẫn ảnh không hợp lệ.';END IF;
 INSERT INTO oq_item_images(request_id,item_id,path,category,caption,created_by) VALUES(_rid,_item,_path,coalesce(nullif(_category,''),'other'),nullif(_caption,''),auth.uid()) RETURNING id INTO _new;RETURN _new;END;$$;
CREATE OR REPLACE FUNCTION public.oq_image_update(_id uuid,_category text,_caption text,_delete boolean) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$DECLARE _p text;BEGIN
 IF NOT private.is_active(auth.uid()) THEN RAISE EXCEPTION 'Tài khoản hiện không được phép truy cập.' USING ERRCODE='42501';END IF;
 SELECT g.path INTO _p FROM oq_item_images g JOIN oq_requests r ON r.id=g.request_id WHERE g.id=_id AND r.creator_id=auth.uid() AND r.status='draft';
 IF _p IS NULL THEN RAISE EXCEPTION 'Chỉ sửa ảnh khi yêu cầu còn là bản nháp của bạn.';END IF;
 IF _delete THEN DELETE FROM oq_item_images WHERE id=_id;ELSE UPDATE oq_item_images SET category=coalesce(nullif(_category,''),'other'),caption=nullif(_caption,'') WHERE id=_id;END IF;RETURN _p;END;$$;