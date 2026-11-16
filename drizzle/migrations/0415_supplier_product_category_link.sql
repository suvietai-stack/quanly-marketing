-- Supplier category search also includes active products already classified
-- under a product group. Product category must use shared catalog IDs, not free text.
BEGIN;
SET LOCAL lock_timeout='10s';
SET LOCAL statement_timeout='90s';
CREATE OR REPLACE FUNCTION public.supplier_master_list_read(
  _search text,_status text,_category text,_service text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE who uuid:=auth.uid(); key_ text:=left(btrim(coalesce(_search,'')),100); result_ jsonb;
BEGIN
 IF NOT private.supplier_master_can_read(who) THEN
   RAISE EXCEPTION 'Không có quyền tra cứu nhà cung cấp chung.' USING ERRCODE='42501'; END IF;
 IF coalesce(_service,'') NOT IN ('','blank','box','print','process','shipping','other') THEN
    RAISE EXCEPTION 'Loại hình cung ứng không hợp lệ.'; END IF;
 IF _category IS NOT NULL AND _category<>'' AND
    NOT EXISTS(SELECT 1 FROM public.supplier_product_groups WHERE code=_category AND active)
 THEN RAISE EXCEPTION 'Nhóm sản phẩm không hợp lệ.'; END IF;
 IF coalesce(_status,'') NOT IN ('','potential','active','paused','archived') THEN
   RAISE EXCEPTION 'Bộ lọc trạng thái không hợp lệ.'; END IF;
 SELECT jsonb_build_object(
   'can_create',private.supplier_master_can_write(who,'supplier.master.create'),
   'can_manage',private.supplier_master_can_write(who,'supplier.master.manage'),
   'can_view_cost',private.supplier_master_can_write(who,'supplier.master.view_cost'),
   'can_manage_groups',private.supplier_master_can_write(who,'supplier.master.manage'),
   'groups',coalesce((SELECT jsonb_agg(
      jsonb_build_object('code',g.code,'name',g.name)
      ORDER BY g.sort_order,g.name)
     FROM public.supplier_product_groups g WHERE g.active),'[]'::jsonb),
   'suppliers',coalesce((SELECT jsonb_agg(to_jsonb(z) ORDER BY z.name)
     FROM (
       SELECT s.id,s.master_code AS code,s.name,s.category,s.groups AS service_groups,
         s.contact AS contact_name,s.phone,s.email,s.website,s.address,
         s.status,s.active,s.next_follow_up,s.last_contact_at,s.updated_at,
         s.created_at,s.created_by::text,
         (SELECT count(*)::integer FROM public.supplier_master_products p
          WHERE p.supplier_id=s.id AND p.active) AS product_count,
         private.supplier_master_can_write(who,'supplier.master.edit') AS can_edit
       FROM public.ot_suppliers s
       WHERE (coalesce(_status,'')='' OR s.status=_status)
         AND (coalesce(_category,'')='' OR _category=ANY(s.category)
           OR EXISTS(SELECT 1 FROM public.supplier_master_products p
             WHERE p.supplier_id=s.id AND p.active AND p.category=_category))
         AND (coalesce(_service,'')='' OR _service=ANY(s.groups))
         AND (key_='' OR s.name ILIKE '%'||key_||'%' OR s.master_code ILIKE '%'||key_||'%'
           OR coalesce(s.contact,'') ILIKE '%'||key_||'%'
           OR coalesce(s.phone,'') ILIKE '%'||key_||'%')
       ORDER BY s.updated_at DESC,s.name
       LIMIT 300
     ) z),'[]'::jsonb),
   'limit',300,'server_now',now()
 ) INTO result_;
 RETURN result_;
END $fn$;




CREATE OR REPLACE FUNCTION public.supplier_master_product_save(
 _supplier_id uuid,_id uuid,_data jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE who uuid:=auth.uid(); s public.ot_suppliers; existing public.supplier_master_products;
 title_ text:=btrim(coalesce(_data->>'name','')); cost_ boolean;
 price_ numeric(18,2); qty_ numeric(12,2); days_ integer; new_id uuid;
BEGIN
 IF NOT private.supplier_master_can_write(who,'supplier.master.product_edit') THEN
  RAISE EXCEPTION 'Chưa có quyền cập nhật sản phẩm.' USING ERRCODE='42501'; END IF;
 SELECT * INTO s FROM public.ot_suppliers WHERE id=_supplier_id;
 IF NOT FOUND OR s.status='archived' THEN
  RAISE EXCEPTION 'Nhà cung cấp không hợp lệ hoặc đã lưu trữ.'; END IF;
 IF jsonb_typeof(_data) IS DISTINCT FROM 'object' OR length(title_) NOT BETWEEN 1 AND 200 THEN
  RAISE EXCEPTION 'Tên sản phẩm không hợp lệ.'; END IF;
 IF nullif(btrim(_data->>'category'),'') IS NOT NULL AND
    NOT EXISTS(SELECT 1 FROM public.supplier_product_groups g
      WHERE g.code=btrim(_data->>'category') AND g.active) THEN
   RAISE EXCEPTION 'Nhóm sản phẩm chưa có trong danh mục chung.';
 END IF;
 cost_:=private.supplier_master_can_write(who,'supplier.master.view_cost');
 IF NOT cost_ AND (_data ? 'purchase_price' OR _data ? 'currency') THEN
  RAISE EXCEPTION 'Chưa được cấp quyền giá nhập.' USING ERRCODE='42501'; END IF;
 IF cost_ THEN price_:=nullif(_data->>'purchase_price','')::numeric; END IF;
 qty_:=nullif(_data->>'min_order_qty','')::numeric;
 days_:=nullif(_data->>'lead_days','')::integer;
 IF price_<0 OR qty_<0 OR days_<0 OR days_>3650 THEN
  RAISE EXCEPTION 'Giá, MOQ hoặc thời gian cung ứng không hợp lệ.'; END IF;
 IF _id IS NULL THEN
   INSERT INTO public.supplier_master_products(
     supplier_id,name,sku,category,specification,unit,origin,min_order_qty,
     purchase_price,currency,lead_days,note,active,created_by,updated_by)
   VALUES(_supplier_id,title_,nullif(btrim(_data->>'sku'),''),
     nullif(btrim(_data->>'category'),''),nullif(btrim(_data->>'specification'),''),
     coalesce(nullif(btrim(_data->>'unit'),''),'cái'),nullif(btrim(_data->>'origin'),''),
     qty_,CASE WHEN cost_ THEN price_ ELSE NULL END,
     CASE WHEN cost_ THEN coalesce(nullif(_data->>'currency',''),'VND') ELSE 'VND' END,
     days_,nullif(btrim(_data->>'note'),''),true,who,who)
   RETURNING id INTO new_id;
 ELSE
   SELECT * INTO existing FROM public.supplier_master_products
      WHERE id=_id AND supplier_id=_supplier_id FOR UPDATE;
   IF NOT FOUND THEN RAISE EXCEPTION 'Sản phẩm không tồn tại.'; END IF;
   IF (_data->>'revision') IS NULL OR (_data->>'revision')::bigint<>existing.revision THEN
    RAISE EXCEPTION 'Sản phẩm đã được người khác cập nhật, hãy tải lại.' USING ERRCODE='40001'; END IF;
   IF _data ? 'active' AND (_data->>'active')::boolean IS DISTINCT FROM existing.active
     AND NOT private.supplier_master_can_write(who,'supplier.master.manage') THEN
    RAISE EXCEPTION 'Chỉ quản lý được đổi trạng thái sản phẩm.' USING ERRCODE='42501'; END IF;
   UPDATE public.supplier_master_products SET name=title_,sku=nullif(btrim(_data->>'sku'),''),
     category=nullif(btrim(_data->>'category'),''),
     specification=nullif(btrim(_data->>'specification'),''),
     unit=coalesce(nullif(btrim(_data->>'unit'),''),'cái'),
     origin=nullif(btrim(_data->>'origin'),''),
     min_order_qty=qty_,lead_days=days_,note=nullif(btrim(_data->>'note'),''),
     purchase_price=CASE WHEN cost_ AND _data ? 'purchase_price' THEN price_ ELSE existing.purchase_price END,
     currency=CASE WHEN cost_ AND _data ? 'currency'
       THEN _data->>'currency' ELSE existing.currency END,
     active=CASE WHEN private.supplier_master_can_write(who,'supplier.master.manage')
       THEN coalesce((_data->>'active')::boolean,existing.active) ELSE existing.active END,
     updated_by=who,updated_at=now(),revision=revision+1
   WHERE id=existing.id RETURNING id INTO new_id;
 END IF;
 RETURN new_id;
END $fn$;


COMMIT;
