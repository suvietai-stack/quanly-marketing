CREATE OR REPLACE FUNCTION private.org_slot_insert_freeze() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  RAISE EXCEPTION 'Không tạo ô theo từng người nữa: gắn Role cho vị trí (đơn vị + chức danh), vị trí nhận nhiều nhân sự.' USING ERRCODE='42501';
END $$;
CREATE TRIGGER org_slot_insert_freeze BEFORE INSERT ON public.org_position_slots FOR EACH ROW EXECUTE FUNCTION private.org_slot_insert_freeze();
COMMENT ON TABLE public.org_position_slots IS 'DEPRECATED for new writes: per-person slots kept for history/fallback; positions use org_position_roles.';