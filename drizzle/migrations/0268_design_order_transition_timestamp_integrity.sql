CREATE OR REPLACE FUNCTION private.design_transition_integrity() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,private AS $$
DECLARE k text; st text; os text;
BEGIN
 IF auth.uid() IS NULL OR TG_OP='INSERT' THEN RETURN NEW; END IF;
 st:=NEW.data->>'status'; os:=OLD.data->>'status';
 FOREACH k IN ARRAY ARRAY['takenAt','submittedAt','deliveredAt','completedAt','revisions'] LOOP
  IF NEW.data->k IS DISTINCT FROM OLD.data->k AND NOT ((k='takenAt' AND st='Đang thực hiện') OR (k='submittedAt' AND st='Chờ duyệt') OR (k='deliveredAt' AND st='Đã bàn giao') OR (k='completedAt' AND st='Hoàn thành') OR (k='revisions' AND st='Cần sửa')) THEN
   RAISE EXCEPTION 'Không được sửa mốc xử lý lịch sử: %',k;
  END IF;
 END LOOP;
 RETURN NEW;
END $$;
CREATE TRIGGER design_order_integrity_guard BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION private.design_transition_integrity();