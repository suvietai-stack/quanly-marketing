-- Preserve two independent dimensions on one supplier master:
-- ot_suppliers.groups = 6 operational supply capabilities used by Order Tracking
-- ot_suppliers.category = multi-select product taxonomy, managed by Procurement.
BEGIN;
SET LOCAL lock_timeout='10s';
SET LOCAL statement_timeout='90s';

-- Correct the accidental mirroring from migration 0413, without touching
-- genuine other product group selections or operational groups.
UPDATE public.ot_suppliers s SET category=(
  SELECT coalesce(array_agg(x ORDER BY x),'{}'::text[])
  FROM unnest(s.category) x
  WHERE x NOT IN ('blank','box','print','process','shipping','other')
)
WHERE s.category && ARRAY['blank','box','print','process','shipping','other']::text[];

-- Those six were legacy supply capability codes, never an actual product catalog.
DELETE FROM public.supplier_product_groups g
WHERE g.code IN ('blank','box','print','process','shipping','other')
 AND NOT EXISTS(SELECT 1 FROM public.ot_suppliers s WHERE g.code=ANY(s.category));

-- Reuse authentic product names that Sứ Việt has already defined in its
-- lead-intake and CRM product catalogs. New categories may be added later
-- by a Procurement manager, without a fixed six- or twelve-group ceiling.
WITH names AS (
 SELECT btrim(item->>'name') AS name
 FROM public.catalogs c CROSS JOIN LATERAL jsonb_array_elements(c.items) AS item
 WHERE c.scope='signal_products' AND coalesce((item->>'active')::boolean,true)
 UNION ALL
 SELECT btrim(c.name) FROM public.crm_catalogs c WHERE c.kind='product' AND c.active
), distinct_names AS (
 SELECT DISTINCT ON(lower(name)) name FROM names
 WHERE length(name) BETWEEN 2 AND 80
 ORDER BY lower(name),name
)
INSERT INTO public.supplier_product_groups(code,name,sort_order)
SELECT 'custom-'||lpad(nextval('public.supplier_product_group_seq')::text,6,'0'),
       n.name,1000
FROM distinct_names n
WHERE NOT EXISTS (SELECT 1 FROM public.supplier_product_groups g
 WHERE lower(btrim(g.name))=lower(btrim(n.name)))
ORDER BY n.name;

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
         AND (coalesce(_category,'')='' OR _category=ANY(s.category))
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
    'service_groups',s.groups,
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
 services_ text[];
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
 IF cardinality(tags_)>500 OR EXISTS(SELECT 1 FROM unnest(tags_) t WHERE length(t)>80) THEN
  RAISE EXCEPTION 'Nhà cung cấp chỉ được gắn tối đa 500 nhóm sản phẩm hợp lệ.'; END IF;
 -- Older clients wrote operational service codes as product categories.
 -- Ignore only legacy six codes; preserve actual product tags.
 SELECT coalesce(array_agg(x ORDER BY x),'{}'::text[]) INTO tags_
 FROM unnest(tags_) x
 WHERE x NOT IN ('blank','box','print','process','shipping','other');
 IF _data ? 'service_groups' AND jsonb_typeof(_data->'service_groups')<>'array'
 THEN RAISE EXCEPTION 'Loại hình cung ứng phải là danh sách tích chọn.'; END IF;
 SELECT coalesce(array_agg(DISTINCT x ORDER BY x),'{}'::text[]) INTO services_
 FROM jsonb_array_elements_text(coalesce(_data->'service_groups','[]'::jsonb)) x;
 IF EXISTS(SELECT 1 FROM unnest(services_) x
   WHERE x NOT IN ('blank','box','print','process','shipping','other')) THEN
   RAISE EXCEPTION 'Loại hình cung ứng không hợp lệ.'; END IF;
 IF EXISTS(SELECT 1 FROM unnest(tags_) t
   WHERE NOT EXISTS(SELECT 1 FROM public.supplier_product_groups g
      WHERE g.code=t AND g.active)) THEN
   RAISE EXCEPTION 'Nhóm sản phẩm chưa có trong danh mục dùng chung.'; END IF;
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
   VALUES(title_,services_,
     nullif(btrim(_data->>'contact_name'),''),
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
     groups=CASE WHEN _data ? 'service_groups' THEN services_ ELSE s.groups END,
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



-- Existing 3-argument consumers continue to work during UI rollout.
CREATE OR REPLACE FUNCTION public.supplier_master_list_read(
 _search text,_status text,_category text)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
 SELECT public.supplier_master_list_read(_search,_status,_category,NULL::text)
$fn$;
REVOKE ALL ON FUNCTION public.supplier_master_list_read(text,text,text,text)
 FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.supplier_master_list_read(text,text,text,text)
 TO authenticated;
COMMIT;
