-- Scoped RPC layer for Showroom suppliers, products and immutable contact history.
-- Direct tables remain private; all UI data comes from these functions.
BEGIN;
SET LOCAL lock_timeout='8s';
SET LOCAL statement_timeout='95s';

CREATE OR REPLACE FUNCTION public.showroom_supplier_list_read(
  _store text DEFAULT NULL,_search text DEFAULT NULL,_status text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE who uuid:=auth.uid(); result_ jsonb; keyword text:=left(btrim(coalesce(_search,'')),100);
BEGIN
  IF who IS NULL OR NOT private.is_active(who)
    OR NOT private.has_permission(who,'showroom.view')
    OR NOT private.has_permission(who,'showroom.supplier.view') THEN
    RAISE EXCEPTION 'Chưa có quyền xem Nhà cung cấp Showroom.' USING ERRCODE='42501';
  END IF;
  IF _store IS NOT NULL AND NOT private.showroom_supplier_can_view(who,_store)
    THEN RAISE EXCEPTION 'Cửa hàng nằm ngoài phạm vi được cấp.' USING ERRCODE='42501'; END IF;
  IF coalesce(_status,'') NOT IN ('','potential','active','paused','archived')
    THEN RAISE EXCEPTION 'Bộ lọc trạng thái không hợp lệ.'; END IF;
  SELECT jsonb_build_object(
    'stores',coalesce((SELECT jsonb_agg(jsonb_build_object('id',u.id,'name',
       replace(u.name,'Showrom ','Showroom '),'can_create',
       private.has_permission(who,'showroom.supplier.create'),
       'can_manage',private.showroom_supplier_can_manage(who,u.id)
       ) ORDER BY u.name)
       FROM public.org_units u WHERE private.showroom_supplier_can_view(who,u.id)
         AND u.kind='department' AND u.active),'[]'::jsonb),
    'suppliers',coalesce((SELECT jsonb_agg(to_jsonb(r) ORDER BY r.name),'[]'::jsonb)
      FROM (
        SELECT s.id,s.code,s.name,s.store_id,
          replace(u.name,'Showrom ','Showroom ') store_name,
          s.category,s.contact_name,s.phone,s.email,s.address,s.website,
          s.status,s.next_follow_up,s.last_contact_at,s.updated_at,
          s.created_at,s.created_by::text,
          (SELECT COUNT(*)::integer FROM public.showroom_supplier_products p
            WHERE p.supplier_id=s.id AND p.active) AS product_count,
          private.showroom_supplier_can_manage(who,s.store_id) AS can_manage,
          (private.showroom_supplier_can_manage(who,s.store_id) OR
            (s.created_by=who AND private.has_permission(who,'showroom.supplier.edit_own')))
              AS can_edit
        FROM public.showroom_suppliers s
        JOIN public.org_units u ON u.id=s.store_id
        WHERE private.showroom_supplier_can_view(who,s.store_id)
          AND (_store IS NULL OR s.store_id=_store)
          AND (_status IS NULL OR _status='' OR s.status=_status)
          AND (keyword='' OR s.name ILIKE '%'||keyword||'%' OR
            s.code ILIKE '%'||keyword||'%' OR
            coalesce(s.contact_name,'') ILIKE '%'||keyword||'%' OR
            coalesce(s.phone,'') ILIKE '%'||keyword||'%')
        ORDER BY s.updated_at DESC,s.name LIMIT 300
      ) r
    ),'[]'::jsonb),
    'limit',300,'server_now',now()
  ) INTO result_;
  RETURN result_;
END $fn$;

CREATE OR REPLACE FUNCTION public.showroom_supplier_detail_read(_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE who uuid:=auth.uid(); s public.showroom_suppliers; manage_ boolean;
        can_edit_ boolean; cost_ boolean; result_ jsonb;
BEGIN
  SELECT * INTO s FROM public.showroom_suppliers WHERE id=_id;
  IF NOT FOUND OR NOT private.showroom_supplier_can_view(who,s.store_id) THEN
    RAISE EXCEPTION 'Không tìm thấy nhà cung cấp trong phạm vi của bạn.' USING ERRCODE='42501'; END IF;
  manage_:=private.showroom_supplier_can_manage(who,s.store_id);
  can_edit_:=manage_ OR (s.created_by=who AND private.has_permission(who,'showroom.supplier.edit_own'));
  cost_:=private.has_permission(who,'showroom.supplier.view_cost');
  SELECT jsonb_build_object(
     'supplier',to_jsonb(s),
     'store_name',(SELECT replace(name,'Showrom ','Showroom ') FROM public.org_units WHERE id=s.store_id),
     'can_edit',can_edit_,'can_manage',manage_,
     'can_product_edit',private.has_permission(who,'showroom.supplier.product_edit'),
     'can_contact_log',private.has_permission(who,'showroom.supplier.contact_log'),
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
       'can_edit',manage_ OR (p.created_by=who
         AND private.has_permission(who,'showroom.supplier.product_edit'))
       ) ORDER BY p.active DESC,p.name)
       FROM public.showroom_supplier_products p WHERE p.supplier_id=s.id),'[]'::jsonb),
     'contacts',coalesce((SELECT jsonb_agg(jsonb_build_object(
       'id',c.id,'channel',c.channel,'summary',c.summary,
       'next_follow_up',c.next_follow_up,'created_at',c.created_at,
       'actor_name',coalesce(p.full_name,'Nhân viên'))
       ORDER BY c.created_at DESC)
       FROM public.showroom_supplier_contacts c LEFT JOIN public.profiles p ON p.id=c.actor_id
       WHERE c.supplier_id=s.id),'[]'::jsonb)
  ) INTO result_;
  RETURN result_;
END $fn$;

CREATE OR REPLACE FUNCTION public.showroom_supplier_save(_id uuid,_data jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE who uuid:=auth.uid(); s public.showroom_suppliers; result_id uuid;
  store_ text; title_ text:=btrim(coalesce(_data->>'name',''));
  categories_ text[]; new_status text; can_manage_ boolean; old_revision bigint;
BEGIN
  IF who IS NULL OR NOT private.is_active(who) OR
    jsonb_typeof(_data) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION 'Cần đăng nhập và nhập hồ sơ hợp lệ.' USING ERRCODE='42501'; END IF;
  IF length(title_) NOT BETWEEN 2 AND 180 THEN
    RAISE EXCEPTION 'Tên nhà cung cấp cần từ 2 đến 180 ký tự.'; END IF;
  IF _data ? 'category' AND jsonb_typeof(_data->'category') <> 'array' THEN
    RAISE EXCEPTION 'Nhóm hàng phải là danh sách.'; END IF;
  SELECT coalesce(array_agg(DISTINCT btrim(x) ORDER BY btrim(x)),'{}'::text[])
    INTO categories_ FROM jsonb_array_elements_text(coalesce(_data->'category','[]'::jsonb)) x
    WHERE btrim(x)<>'';
  IF cardinality(categories_)>12 OR EXISTS(SELECT 1 FROM unnest(categories_) x WHERE length(x)>80) THEN
    RAISE EXCEPTION 'Chỉ được nhập tối đa 12 nhóm hàng, mỗi nhóm tối đa 80 ký tự.'; END IF;
  IF _data->>'email' IS NOT NULL AND btrim(_data->>'email')<>''
    AND btrim(_data->>'email') !~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$' THEN
    RAISE EXCEPTION 'Email nhà cung cấp không hợp lệ.'; END IF;
  IF length(coalesce(_data->>'notes',''))>5000 THEN
    RAISE EXCEPTION 'Ghi chú vượt 5.000 ký tự.'; END IF;
  IF _id IS NULL THEN
    store_:=nullif(_data->>'store_id','');
    IF NOT private.showroom_supplier_can_view(who,store_)
       OR NOT private.has_permission(who,'showroom.supplier.create') THEN
      RAISE EXCEPTION 'Bạn chưa có quyền thêm nhà cung cấp cho cửa hàng này.' USING ERRCODE='42501'; END IF;
    INSERT INTO public.showroom_suppliers(
      store_id,name,category,contact_name,phone,email,website,address,tax_code,
      notes,next_follow_up,created_by,updated_by)
    VALUES(
      store_,title_,categories_,nullif(btrim(_data->>'contact_name'),''),
      nullif(btrim(_data->>'phone'),''),nullif(btrim(_data->>'email'),''),
      nullif(btrim(_data->>'website'),''),nullif(btrim(_data->>'address'),''),
      nullif(btrim(_data->>'tax_code'),''),nullif(btrim(_data->>'notes'),''),
      nullif(_data->>'next_follow_up','')::date,who,who)
    RETURNING id INTO result_id;
    RETURN result_id;
  END IF;
  SELECT * INTO s FROM public.showroom_suppliers WHERE id=_id FOR UPDATE;
  IF NOT FOUND OR NOT private.showroom_supplier_can_view(who,s.store_id) THEN
    RAISE EXCEPTION 'Nhà cung cấp không thuộc phạm vi được xem.' USING ERRCODE='42501'; END IF;
  can_manage_:=private.showroom_supplier_can_manage(who,s.store_id);
  IF NOT can_manage_ AND NOT(s.created_by=who AND
    private.has_permission(who,'showroom.supplier.edit_own')) THEN
    RAISE EXCEPTION 'Chưa có quyền sửa nhà cung cấp này.' USING ERRCODE='42501'; END IF;
  IF s.status='archived' AND NOT can_manage_ THEN
    RAISE EXCEPTION 'Nhà cung cấp đã lưu trữ.' USING ERRCODE='42501'; END IF;
  IF _data ? 'store_id' AND s.store_id IS DISTINCT FROM _data->>'store_id' THEN
    RAISE EXCEPTION 'Không được tự chuyển nhà cung cấp sang cửa hàng khác.'; END IF;
  new_status:=coalesce(nullif(_data->>'status',''),s.status);
  IF new_status NOT IN ('potential','active','paused','archived') THEN
    RAISE EXCEPTION 'Trạng thái không hợp lệ.'; END IF;
  IF NOT can_manage_ AND s.status<>new_status THEN
    RAISE EXCEPTION 'Chỉ quản lý mới được thay đổi trạng thái hợp tác.' USING ERRCODE='42501'; END IF;
  IF NOT (_data ? 'revision') OR (_data->>'revision')::bigint <> s.revision THEN
    RAISE EXCEPTION 'Hồ sơ đã được người khác cập nhật, hãy tải lại.' USING ERRCODE='40001'; END IF;
  UPDATE public.showroom_suppliers SET
    name=title_,category=categories_,status=new_status,
    contact_name=nullif(btrim(_data->>'contact_name'),''),
    phone=nullif(btrim(_data->>'phone'),''),
    email=nullif(btrim(_data->>'email'),''),
    website=nullif(btrim(_data->>'website'),''),
    address=nullif(btrim(_data->>'address'),''),
    tax_code=nullif(btrim(_data->>'tax_code'),''),
    notes=nullif(btrim(_data->>'notes'),''),
    next_follow_up=nullif(_data->>'next_follow_up','')::date,
    updated_by=who,updated_at=now(),revision=revision+1
  WHERE id=s.id RETURNING id INTO result_id;
  RETURN result_id;
END $fn$;

CREATE OR REPLACE FUNCTION public.showroom_supplier_product_save(
  _supplier_id uuid,_id uuid,_data jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE who uuid:=auth.uid(); s public.showroom_suppliers;
  p public.showroom_supplier_products; can_manage_ boolean; cost_ boolean;
  title_ text:=btrim(coalesce(_data->>'name','')); result_id uuid;
  price_ numeric(18,2); qty_ numeric(12,2); days_ integer;
  product_active boolean;
BEGIN
  SELECT * INTO s FROM public.showroom_suppliers WHERE id=_supplier_id;
  IF NOT FOUND OR NOT private.showroom_supplier_can_view(who,s.store_id)
     OR NOT private.has_permission(who,'showroom.supplier.product_edit')
     OR s.status='archived' THEN
    RAISE EXCEPTION 'Chưa có quyền cập nhật sản phẩm của nhà cung cấp.' USING ERRCODE='42501'; END IF;
  IF jsonb_typeof(_data) IS DISTINCT FROM 'object' OR length(title_) NOT BETWEEN 1 AND 200 THEN
    RAISE EXCEPTION 'Tên sản phẩm không hợp lệ (1–200 ký tự).'; END IF;
  can_manage_:=private.showroom_supplier_can_manage(who,s.store_id);
  cost_:=private.has_permission(who,'showroom.supplier.view_cost');
  IF NOT cost_ AND _data ? 'purchase_price' THEN
    RAISE EXCEPTION 'Chưa được cấp quyền cập nhật giá nhập.' USING ERRCODE='42501'; END IF;
  price_:=nullif(_data->>'purchase_price','')::numeric;
  qty_:=nullif(_data->>'min_order_qty','')::numeric;
  days_:=nullif(_data->>'lead_days','')::integer;
  IF price_<0 OR qty_<0 OR days_<0 OR days_>3650 THEN RAISE EXCEPTION 'Giá, MOQ hoặc thời gian cung ứng không hợp lệ.'; END IF;
  IF _id IS NULL THEN
    IF _data ? 'active' AND (_data->>'active')::boolean IS FALSE AND NOT can_manage_ THEN
      RAISE EXCEPTION 'Chỉ quản lý mới được ẩn sản phẩm.' USING ERRCODE='42501'; END IF;
    INSERT INTO public.showroom_supplier_products(
      supplier_id,name,sku,category,specification,unit,origin,min_order_qty,
      purchase_price,currency,lead_days,note,active,created_by,updated_by)
    VALUES(_supplier_id,title_,nullif(btrim(_data->>'sku'),''),
      nullif(btrim(_data->>'category'),''),
      nullif(btrim(_data->>'specification'),''),
      coalesce(nullif(btrim(_data->>'unit'),''),'cái'),
      nullif(btrim(_data->>'origin'),''),
      qty_,CASE WHEN cost_ THEN price_ ELSE NULL END,
      CASE WHEN cost_ THEN coalesce(nullif(_data->>'currency',''),'VND') ELSE 'VND' END,
      days_,nullif(btrim(_data->>'note'),''),
      CASE WHEN can_manage_ THEN coalesce((_data->>'active')::boolean,true) ELSE true END,
      who,who)
    RETURNING id INTO result_id;
    RETURN result_id;
  END IF;
  SELECT * INTO p FROM public.showroom_supplier_products
     WHERE id=_id AND supplier_id=_supplier_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy sản phẩm.' USING ERRCODE='42501'; END IF;
  IF NOT can_manage_ AND (p.created_by<>who OR NOT p.active) THEN
    RAISE EXCEPTION 'Chỉ được sửa sản phẩm do mình nhập và đang hoạt động.' USING ERRCODE='42501'; END IF;
  IF _data ? 'active' AND (_data->>'active')::boolean IS DISTINCT FROM p.active
    AND NOT can_manage_ THEN
    RAISE EXCEPTION 'Chỉ quản lý mới được bật/tắt sản phẩm.' USING ERRCODE='42501'; END IF;
  IF NOT (_data ? 'revision') OR (_data->>'revision')::bigint<>p.revision THEN
    RAISE EXCEPTION 'Sản phẩm đã được cập nhật, hãy tải lại.' USING ERRCODE='40001'; END IF;
  product_active:=CASE WHEN can_manage_ THEN coalesce((_data->>'active')::boolean,p.active)
    ELSE p.active END;
  UPDATE public.showroom_supplier_products SET
    name=title_,sku=nullif(btrim(_data->>'sku'),''),
    category=nullif(btrim(_data->>'category'),''),
    specification=nullif(btrim(_data->>'specification'),''),
    unit=coalesce(nullif(btrim(_data->>'unit'),''),'cái'),
    origin=nullif(btrim(_data->>'origin'),''),
    min_order_qty=qty_,lead_days=days_,note=nullif(btrim(_data->>'note'),''),
    purchase_price=CASE WHEN cost_ AND _data ? 'purchase_price' THEN price_ ELSE p.purchase_price END,
    currency=CASE WHEN cost_ AND _data ? 'currency' THEN _data->>'currency' ELSE p.currency END,
    active=product_active,updated_by=who,updated_at=now(),revision=revision+1
  WHERE id=p.id RETURNING id INTO result_id;
  RETURN result_id;
END $fn$;

CREATE OR REPLACE FUNCTION public.showroom_supplier_contact_add(
  _supplier_id uuid,_channel text,_summary text,_next_follow_up date DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE who uuid:=auth.uid(); s public.showroom_suppliers; result_id uuid;
BEGIN
  SELECT * INTO s FROM public.showroom_suppliers WHERE id=_supplier_id FOR UPDATE;
  IF NOT FOUND OR NOT private.showroom_supplier_can_view(who,s.store_id)
    OR NOT private.has_permission(who,'showroom.supplier.contact_log')
    OR s.status='archived' THEN
    RAISE EXCEPTION 'Chưa có quyền ghi lịch sử làm việc.' USING ERRCODE='42501'; END IF;
  IF _channel NOT IN ('call','zalo','email','meeting','other') THEN
    RAISE EXCEPTION 'Kênh liên hệ không hợp lệ.'; END IF;
  IF length(btrim(coalesce(_summary,''))) NOT BETWEEN 1 AND 2000 THEN
    RAISE EXCEPTION 'Nội dung làm việc cần từ 1–2.000 ký tự.'; END IF;
  INSERT INTO public.showroom_supplier_contacts(
    supplier_id,actor_id,channel,summary,next_follow_up)
  VALUES(_supplier_id,who,_channel,btrim(_summary),_next_follow_up)
  RETURNING id INTO result_id;
  UPDATE public.showroom_suppliers SET
    last_contact_at=now(),next_follow_up=coalesce(_next_follow_up,next_follow_up),
    updated_at=now(),updated_by=who,revision=revision+1 WHERE id=s.id;
  RETURN result_id;
END $fn$;

REVOKE ALL ON FUNCTION public.showroom_supplier_list_read(text,text,text),
 public.showroom_supplier_detail_read(uuid),
 public.showroom_supplier_save(uuid,jsonb),
 public.showroom_supplier_product_save(uuid,uuid,jsonb),
 public.showroom_supplier_contact_add(uuid,text,text,date) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.showroom_supplier_list_read(text,text,text),
 public.showroom_supplier_detail_read(uuid),
 public.showroom_supplier_save(uuid,jsonb),
 public.showroom_supplier_product_save(uuid,uuid,jsonb),
 public.showroom_supplier_contact_add(uuid,text,text,date) TO authenticated;
COMMIT;
