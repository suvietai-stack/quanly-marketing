-- Suppliers being researched remain unavailable to order-tracking selection
-- until a procurement manager activates them. Legacy existing suppliers unaffected.
BEGIN;
SET LOCAL lock_timeout='10s';
SET LOCAL statement_timeout='80s';
CREATE OR REPLACE FUNCTION public.supplier_master_save(_id uuid,_data jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE who uuid:=auth.uid(); s public.ot_suppliers; new_id uuid;
 title_ text:=btrim(coalesce(_data->>'name','')); tags_ text[];
 new_status text; rev bigint;
BEGIN
 IF who IS NULL OR jsonb_typeof(_data) IS DISTINCT FROM 'object' THEN
  RAISE EXCEPTION 'Cần đăng nhập và nhập dữ liệu hợp lệ.' USING ERRCODE='42501'; END IF;
 IF length(title_) NOT BETWEEN 2 AND 180 THEN
  RAISE EXCEPTION 'Tên nhà cung cấp cần từ 2 đến 180 ký tự.'; END IF;
 IF (_data ? 'category') AND jsonb_typeof(_data->'category') <> 'array' THEN
  RAISE EXCEPTION 'Nhóm hàng phải là danh sách.'; END IF;
 SELECT coalesce(array_agg(DISTINCT btrim(t) ORDER BY btrim(t)),'{}'::text[]) INTO tags_
 FROM jsonb_array_elements_text(coalesce(_data->'category','[]'::jsonb)) t
 WHERE btrim(t)<>'';
 IF cardinality(tags_)>12 OR EXISTS(SELECT 1 FROM unnest(tags_) t WHERE length(t)>80) THEN
  RAISE EXCEPTION 'Chỉ nhập tối đa 12 nhóm hàng, mỗi nhóm không quá 80 ký tự.'; END IF;
 IF nullif(btrim(_data->>'email'),'') IS NOT NULL AND
   btrim(_data->>'email') !~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$' THEN
   RAISE EXCEPTION 'Email không hợp lệ.'; END IF;
 IF length(coalesce(_data->>'notes',''))>5000 THEN
   RAISE EXCEPTION 'Ghi chú quá dài.'; END IF;
 IF _id IS NULL THEN
   IF NOT private.supplier_master_can_write(who,'supplier.master.create') THEN
     RAISE EXCEPTION 'Chưa có quyền tạo nhà cung cấp.' USING ERRCODE='42501'; END IF;
   INSERT INTO public.ot_suppliers(name,groups,contact,phone,address,note,active,
     created_by,category,email,website,tax_code,status,next_follow_up)
   VALUES(title_,'{}'::text[],nullif(btrim(_data->>'contact_name'),''),
     nullif(btrim(_data->>'phone'),''),nullif(btrim(_data->>'address'),''),
     nullif(btrim(_data->>'notes'),''),false,who,tags_,
     nullif(btrim(_data->>'email'),''),nullif(btrim(_data->>'website'),''),
     nullif(btrim(_data->>'tax_code'),''),'potential',
     nullif(_data->>'next_follow_up','')::date)
   RETURNING id INTO new_id;
 ELSE
   IF NOT private.supplier_master_can_write(who,'supplier.master.edit') THEN
     RAISE EXCEPTION 'Chưa có quyền sửa nhà cung cấp.' USING ERRCODE='42501'; END IF;
   SELECT * INTO s FROM public.ot_suppliers WHERE id=_id FOR UPDATE;
   IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy nhà cung cấp.'; END IF;
   IF (_data->>'revision') IS NULL OR (_data->>'revision')::bigint<>s.revision THEN
     RAISE EXCEPTION 'Hồ sơ đã cập nhật, hãy tải lại.' USING ERRCODE='40001'; END IF;
   new_status:=coalesce(nullif(_data->>'status',''),s.status);
   IF new_status NOT IN ('potential','active','paused','archived') THEN
     RAISE EXCEPTION 'Trạng thái không hợp lệ.'; END IF;
   IF new_status<>s.status AND NOT private.supplier_master_can_write(who,'supplier.master.manage') THEN
     RAISE EXCEPTION 'Chỉ quản lý mới được đổi trạng thái.' USING ERRCODE='42501'; END IF;
   UPDATE public.ot_suppliers SET name=title_,category=tags_,
     contact=nullif(btrim(_data->>'contact_name'),''),
     phone=nullif(btrim(_data->>'phone'),''),email=nullif(btrim(_data->>'email'),''),
     website=nullif(btrim(_data->>'website'),''),address=nullif(btrim(_data->>'address'),''),
     tax_code=nullif(btrim(_data->>'tax_code'),''),
     note=nullif(btrim(_data->>'notes'),''),
     next_follow_up=nullif(_data->>'next_follow_up','')::date,
     status=new_status,active=new_status IN ('potential','active'),
     updated_at=now(),revision=revision+1 WHERE id=s.id
   RETURNING id INTO new_id;
 END IF;
 RETURN new_id;
END $fn$;

COMMIT;
