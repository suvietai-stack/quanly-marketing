-- Canonical, selectable product groups shared across Supplier Master and Order Tracking.
-- Supplier categories store stable group codes; labels can be renamed without
-- changing supplier data. No unapproved free-text groups are accepted on save.
BEGIN;
SET LOCAL lock_timeout='10s';
SET LOCAL statement_timeout='90s';

CREATE SEQUENCE IF NOT EXISTS public.supplier_product_group_seq;
CREATE TABLE IF NOT EXISTS public.supplier_product_groups (
 code text PRIMARY KEY CHECK(length(code) BETWEEN 2 AND 80),
 name text NOT NULL CHECK(length(btrim(name)) BETWEEN 2 AND 80),
 sort_order integer NOT NULL DEFAULT 1000,
 active boolean NOT NULL DEFAULT true,
 created_by uuid REFERENCES public.profiles(id),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS supplier_product_groups_name_uq
 ON public.supplier_product_groups(lower(btrim(name)));
ALTER TABLE public.supplier_product_groups ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.supplier_product_groups FROM PUBLIC,anon,authenticated;
REVOKE ALL ON SEQUENCE public.supplier_product_group_seq FROM PUBLIC,anon,authenticated;

INSERT INTO public.supplier_product_groups(code,name,sort_order) VALUES
 ('blank','Phôi',10),('box','Hộp',20),('print','In ấn',30),
 ('process','Gia công',40),('shipping','Vận chuyển',50),('other','Khác',60)
ON CONFLICT(code) DO NOTHING;

-- Legacy data lives in ot_suppliers.groups. Mirror current selections only
-- when no master categories were chosen, preserving any later master edits.
UPDATE public.ot_suppliers s
SET category=(SELECT coalesce(array_agg(DISTINCT g ORDER BY g),'{}'::text[])
             FROM unnest(s.groups) g
             WHERE EXISTS(SELECT 1 FROM public.supplier_product_groups x WHERE x.code=g))
WHERE cardinality(s.category)=0 AND cardinality(s.groups)>0;

CREATE OR REPLACE FUNCTION public.supplier_product_group_add(_name text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE uid uuid:=auth.uid(); group_name text:=btrim(coalesce(_name,''));
  code_ text;
BEGIN
 IF NOT private.supplier_master_can_write(uid,'supplier.master.manage') THEN
   RAISE EXCEPTION 'Chỉ quản lý Mua hàng được bổ sung nhóm sản phẩm.' USING ERRCODE='42501';
 END IF;
 IF length(group_name) NOT BETWEEN 2 AND 80 THEN
   RAISE EXCEPTION 'Tên nhóm sản phẩm phải dài từ 2 đến 80 ký tự.'; END IF;
 IF EXISTS(SELECT 1 FROM public.supplier_product_groups
   WHERE lower(btrim(name))=lower(group_name)) THEN
   RAISE EXCEPTION 'Nhóm sản phẩm này đã có trong danh mục.'; END IF;
 code_:='custom-'||lpad(nextval('public.supplier_product_group_seq')::text,6,'0');
 INSERT INTO public.supplier_product_groups(code,name,created_by)
 VALUES(code_,group_name,uid);
 RETURN jsonb_build_object('code',code_,'name',group_name);
END $fn$;

CREATE OR REPLACE FUNCTION public.supplier_master_list_read(
  _search text DEFAULT NULL,_status text DEFAULT NULL,_category text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $fn$
DECLARE who uuid:=auth.uid(); key_ text:=left(btrim(coalesce(_search,'')),100); result_ jsonb;
BEGIN
 IF NOT private.supplier_master_can_read(who) THEN
   RAISE EXCEPTION 'Không có quyền tra cứu nhà cung cấp chung.' USING ERRCODE='42501'; END IF;
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
       SELECT s.id,s.master_code AS code,s.name,s.category,
         s.contact AS contact_name,s.phone,s.email,s.website,s.address,
         s.status,s.active,s.next_follow_up,s.last_contact_at,s.updated_at,
         s.created_at,s.created_by::text,
         (SELECT count(*)::integer FROM public.supplier_master_products p
          WHERE p.supplier_id=s.id AND p.active) AS product_count,
         private.supplier_master_can_write(who,'supplier.master.edit') AS can_edit
       FROM public.ot_suppliers s
       WHERE (coalesce(_status,'')='' OR s.status=_status)
         AND (coalesce(_category,'')='' OR _category=ANY(s.category))
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
   VALUES(title_,(SELECT coalesce(array_agg(t),'{}'::text[]) FROM unnest(tags_) t
         WHERE t IN ('blank','box','print','process','shipping','other')),
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
     groups=(SELECT coalesce(array_agg(t),'{}'::text[]) FROM unnest(tags_) t
         WHERE t IN ('blank','box','print','process','shipping','other')),
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


REVOKE ALL ON FUNCTION public.supplier_product_group_add(text),
 public.supplier_master_list_read(text,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.supplier_product_group_add(text),
 public.supplier_master_list_read(text,text,text) TO authenticated;
-- Compatibility for old clients, no parallel source or duplicated data.
CREATE OR REPLACE FUNCTION public.supplier_master_list_read(_search text,_status text)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
 SELECT public.supplier_master_list_read(_search,_status,NULL::text)
$fn$;
COMMIT;
