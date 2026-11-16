-- One RPC layer for canonical ot_suppliers, shared products and contact history.
BEGIN;
SET LOCAL lock_timeout='8s';
SET LOCAL statement_timeout='90s';

CREATE OR REPLACE FUNCTION public.supplier_master_list_read(
  _search text DEFAULT NULL,_status text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE who uuid:=auth.uid(); key_ text:=left(btrim(coalesce(_search,'')),100); result_ jsonb;
BEGIN
 IF NOT private.supplier_master_can_read(who) THEN
   RAISE EXCEPTION 'Không có quyền tra cứu nhà cung cấp chung.' USING ERRCODE='42501'; END IF;
 IF coalesce(_status,'') NOT IN ('','potential','active','paused','archived') THEN
   RAISE EXCEPTION 'Bộ lọc trạng thái không hợp lệ.'; END IF;
 SELECT jsonb_build_object(
   'can_create',private.supplier_master_can_write(who,'supplier.master.create'),
   'can_manage',private.supplier_master_can_write(who,'supplier.master.manage'),
   'can_view_cost',private.supplier_master_can_write(who,'supplier.master.view_cost'),
   'suppliers',coalesce((SELECT jsonb_agg(to_jsonb(z) ORDER BY z.name)
     FROM (
       SELECT s.id,s.master_code AS code,s.name,s.category,
         s.contact AS contact_name,s.phone,s.email,s.website,s.address,
         s.status,s.active,s.next_follow_up,s.last_contact_at,s.updated_at,
         s.created_at,s.created_by::text,
         (SELECT count(*)::integer FROM public.supplier_master_products p
          WHERE p.supplier_id=s.id AND p.active) AS product_count,
         private.supplier_master_can_write(who,'supplier.master.edit') AS can_edit
       FROM public.ot_suppliers s
       WHERE (coalesce(_status,'')='' OR s.status=_status)
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

CREATE OR REPLACE FUNCTION public.supplier_master_detail_read(_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE who uuid:=auth.uid(); s public.ot_suppliers; manage_ boolean; cost_ boolean; result_ jsonb;
BEGIN
 IF NOT private.supplier_master_can_read(who) THEN
   RAISE EXCEPTION 'Không có quyền tra cứu nhà cung cấp.' USING ERRCODE='42501'; END IF;
 SELECT * INTO s FROM public.ot_suppliers WHERE id=_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Nhà cung cấp không tồn tại.'; END IF;
 manage_:=private.supplier_master_can_write(who,'supplier.master.manage');
 cost_:=private.supplier_master_can_write(who,'supplier.master.view_cost');
 SELECT jsonb_build_object(
  'supplier',jsonb_build_object(
    'id',s.id,'code',s.master_code,'name',s.name,'category',s.category,
    'contact_name',s.contact,'phone',s.phone,'email',s.email,'website',s.website,
    'address',s.address,'tax_code',s.tax_code,'status',s.status,
    'notes',s.note,'next_follow_up',s.next_follow_up,
    'last_contact_at',s.last_contact_at,'created_at',s.created_at,
    'updated_at',s.updated_at,'created_by',s.created_by,'revision',s.revision),
  'can_edit',private.supplier_master_can_write(who,'supplier.master.edit'),
  'can_manage',manage_,
  'can_product_edit',private.supplier_master_can_write(who,'supplier.master.product_edit'),
  'can_contact_log',private.supplier_master_can_write(who,'supplier.master.contact_log'),
  'can_view_cost',cost_,
  'products',coalesce((SELECT jsonb_agg(jsonb_build_object(
    'id',p.id,'supplier_id',p.supplier_id,'name',p.name,'sku',p.sku,
    'category',p.category,'specification',p.specification,'unit',p.unit,
    'origin',p.origin,'min_order_qty',p.min_order_qty,
    'purchase_price',CASE WHEN cost_ THEN p.purchase_price ELSE NULL END,
    'currency',CASE WHEN cost_ THEN p.currency ELSE NULL END,
    'lead_days',p.lead_days,'note',p.note,'active',p.active,
    'created_by',p.created_by::text,'revision',p.revision,
    'created_at',p.created_at,'updated_at',p.updated_at,
    'can_edit',private.supplier_master_can_write(who,'supplier.master.product_edit')
  ) ORDER BY p.active DESC,p.name)
    FROM public.supplier_master_products p WHERE p.supplier_id=s.id),'[]'::jsonb),
  'contacts',coalesce((SELECT jsonb_agg(jsonb_build_object(
    'id',c.id,'channel',c.channel,'summary',c.summary,'next_follow_up',c.next_follow_up,
    'created_at',c.created_at,'actor_name',coalesce(p.full_name,'Nhân viên'))
    ORDER BY c.created_at DESC)
    FROM public.supplier_master_contacts c
    LEFT JOIN public.profiles p ON p.id=c.actor_id
    WHERE c.supplier_id=s.id),'[]'::jsonb)
 ) INTO result_;
 RETURN result_;
END $fn$;

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
     nullif(btrim(_data->>'notes'),''),true,who,tags_,
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

CREATE OR REPLACE FUNCTION public.supplier_master_contact_add(
  _supplier_id uuid,_channel text,_summary text,_next_follow_up date DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE who uuid:=auth.uid(); s public.ot_suppliers; result_id uuid;
BEGIN
 IF NOT private.supplier_master_can_write(who,'supplier.master.contact_log') THEN
  RAISE EXCEPTION 'Chưa có quyền ghi liên hệ nhà cung cấp.' USING ERRCODE='42501'; END IF;
 SELECT * INTO s FROM public.ot_suppliers WHERE id=_supplier_id FOR UPDATE;
 IF NOT FOUND OR s.status='archived' THEN RAISE EXCEPTION 'Nhà cung cấp không hợp lệ.'; END IF;
 IF _channel NOT IN ('call','zalo','email','meeting','other') OR
   length(btrim(coalesce(_summary,''))) NOT BETWEEN 1 AND 2000 THEN
  RAISE EXCEPTION 'Kênh hoặc nội dung trao đổi không hợp lệ.'; END IF;
 INSERT INTO public.supplier_master_contacts(
  supplier_id,actor_id,channel,summary,next_follow_up)
 VALUES(_supplier_id,who,_channel,btrim(_summary),_next_follow_up)
 RETURNING id INTO result_id;
 UPDATE public.ot_suppliers SET
  last_contact_at=now(),next_follow_up=coalesce(_next_follow_up,next_follow_up),
  updated_at=now(),revision=revision+1 WHERE id=s.id;
 RETURN result_id;
END $fn$;

-- Legacy order-tracking status toggle remains compatible with canonical status.
CREATE OR REPLACE FUNCTION public.ot_supplier_active(_id uuid,_active boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
BEGIN
 IF NOT private.sig_can(auth.uid(),'ot.supplier') THEN
  RAISE EXCEPTION 'Bạn không có quyền quản lý nhà cung cấp.' USING ERRCODE='42501'; END IF;
 UPDATE public.ot_suppliers SET active=_active,
   status=CASE WHEN _active THEN 'active' ELSE 'paused' END,
   revision=revision+1,updated_at=now()
 WHERE id=_id;
END $fn$;
-- Legacy order tracking edit can still modify its existing contact/group fields.
-- Keep it for backward API compatibility and do not duplicate the supplier entity.

REVOKE ALL ON FUNCTION public.supplier_master_list_read(text,text),
 public.supplier_master_detail_read(uuid),
 public.supplier_master_save(uuid,jsonb),
 public.supplier_master_product_save(uuid,uuid,jsonb),
 public.supplier_master_contact_add(uuid,text,text,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.supplier_master_list_read(text,text),
 public.supplier_master_detail_read(uuid),
 public.supplier_master_save(uuid,jsonb),
 public.supplier_master_product_save(uuid,uuid,jsonb),
 public.supplier_master_contact_add(uuid,text,text,date) TO authenticated;
COMMIT;
