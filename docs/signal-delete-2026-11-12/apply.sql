BEGIN;
DO $guard$ BEGIN IF to_regprocedure('public.signal_delete(uuid)') IS NOT NULL THEN RAISE EXCEPTION 'signal_delete already exists; re-review required'; END IF; END $guard$;
CREATE OR REPLACE FUNCTION public.signal_delete(_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $body$
DECLARE u uuid:=auth.uid(); s public.opportunity_signals%ROWTYPE; scope_ok boolean; visible_ boolean;
BEGIN
 IF u IS NULL OR NOT private.is_active(u) OR NOT(private.sig_can(u,'signal.delete') OR private.sig_can(u,'signal.manage')) THEN
  RAISE EXCEPTION 'Bạn không có quyền xóa tín hiệu.' USING ERRCODE='42501';
 END IF;
 SELECT * INTO s FROM public.opportunity_signals WHERE id=_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Tín hiệu không tồn tại hoặc bạn không có quyền xem.' USING ERRCODE='42501'; END IF;
 scope_ok:=private.sig_scope_matches(private.sig_scope_context(u),s.need_groups);
 visible_:=((private.sig_can(u,'signal.view_all') OR private.sig_can(u,'signal.manage')) AND scope_ok)
  OR (s.created_by=u AND private.sig_can(u,'signal.create')) OR (s.assigned_to=u AND private.sig_can(u,'signal.sale'));
 IF NOT coalesce(scope_ok AND visible_,false) THEN RAISE EXCEPTION 'Tín hiệu không tồn tại hoặc bạn không có quyền xem.' USING ERRCODE='42501'; END IF;
 IF s.status IN('won','lost') THEN RAISE EXCEPTION 'Tín hiệu đã Chốt/Trượt không được xóa. Hãy giữ lịch sử xử lý.' USING ERRCODE='55000'; END IF;
 IF EXISTS(SELECT 1 FROM public.opportunity_signal_notes WHERE signal_id=_id) THEN
  RAISE EXCEPTION 'Tín hiệu đã có nhật ký tư vấn nên không được xóa. Hãy dùng Hủy tín hiệu.' USING ERRCODE='55000';
 END IF;
 IF EXISTS(SELECT 1 FROM public.signal_progression_assignments WHERE signal_id=_id) THEN
  RAISE EXCEPTION 'Tín hiệu đã có dữ liệu phân công/kỳ theo dõi nên không được xóa. Hãy dùng Hủy tín hiệu để giữ lịch sử.' USING ERRCODE='55000';
 END IF;
 DELETE FROM public.opportunity_signals WHERE id=_id;
 RETURN FOUND;
END $body$;
REVOKE ALL ON FUNCTION public.signal_delete(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.signal_delete(uuid) TO authenticated,service_role;

COMMIT;
