-- Final cutover: retire unused Showroom-specific supplier store (empty at cutover)
-- while preserving the live ot_suppliers master and legacy order references.
BEGIN;
SET LOCAL lock_timeout='15s';
SET LOCAL statement_timeout='90s';

DO $guard$
BEGIN
 IF EXISTS(SELECT 1 FROM public.showroom_suppliers LIMIT 1)
   OR EXISTS(SELECT 1 FROM public.showroom_supplier_products LIMIT 1)
   OR EXISTS(SELECT 1 FROM public.showroom_supplier_contacts LIMIT 1)
 THEN
   RAISE EXCEPTION 'Showroom supplier staging contains records; abort cleanup and migrate first.';
 END IF;
END $guard$;

-- Disable legacy Showroom supplier RPCs immediately without taking exclusive locks.
-- The staging schema is intentionally left empty and inaccessible until a safe cleanup.
REVOKE EXECUTE ON FUNCTION public.showroom_supplier_list_read(text,text,text),
 public.showroom_supplier_detail_read(uuid),
 public.showroom_supplier_save(uuid,jsonb),
 public.showroom_supplier_product_save(uuid,uuid,jsonb),
 public.showroom_supplier_contact_add(uuid,text,text,date)
 FROM PUBLIC,anon,authenticated;

-- Remove now-obsolete supplier permissions from Showroom positions; shared
-- supplier.master.view remains on those roles.
UPDATE public.app_roles r SET
 permissions=coalesce((SELECT array_agg(x ORDER BY x) FROM unnest(r.permissions) x
   WHERE x NOT LIKE 'showroom.supplier.%'),'{}'::text[]),
 updated_at=now()
WHERE EXISTS(SELECT 1 FROM unnest(r.permissions) x WHERE x LIKE 'showroom.supplier.%');
DELETE FROM public.base_permission_catalog WHERE key LIKE 'showroom.supplier.%';

-- Same entity must not be re-created under another business-area list.
CREATE UNIQUE INDEX IF NOT EXISTS ot_supplier_master_name_unique
 ON public.ot_suppliers(lower(btrim(name)))
 WHERE status <> 'archived';

-- Existing legacy table policies are unchanged to avoid blocking order tracking
-- during the companywide supplier cutover. New cost rows are RPC-only.

-- Legacy RPC callers now use master privileges; no bypass of procurement owner.
CREATE OR REPLACE FUNCTION public.ot_supplier_active(_id uuid,_active boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
BEGIN
 IF NOT private.supplier_master_can_write(auth.uid(),'supplier.master.manage') THEN
  RAISE EXCEPTION 'Chỉ quản lý được thay đổi trạng thái Nhà cung cấp.' USING ERRCODE='42501'; END IF;
 UPDATE public.ot_suppliers SET active=_active,
   status=CASE WHEN _active THEN 'active' ELSE 'paused' END,
   revision=revision+1,updated_at=now() WHERE id=_id;
END $fn$;

CREATE OR REPLACE FUNCTION public.ot_supplier_save(_id uuid,_data jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
DECLARE uid uuid:=auth.uid(); result_id uuid; groups_ text[];
BEGIN
 IF NOT private.supplier_master_can_write(uid,
       CASE WHEN _id IS NULL THEN 'supplier.master.create' ELSE 'supplier.master.edit' END)
 THEN RAISE EXCEPTION 'Chỉ nhân sự được phân quyền Mua hàng mới được sửa Nhà cung cấp.'
   USING ERRCODE='42501'; END IF;
 IF length(btrim(coalesce(_data->>'name',''))) NOT BETWEEN 2 AND 180 THEN
   RAISE EXCEPTION 'Tên nhà cung cấp phải có từ 2 đến 180 ký tự.'; END IF;
 SELECT coalesce(array_agg(DISTINCT g),'{}'::text[]) INTO groups_
 FROM jsonb_array_elements_text(coalesce(_data->'groups','[]'::jsonb)) g
 WHERE g IN ('blank','box','print','process','shipping','other');
 IF _id IS NULL THEN
   INSERT INTO public.ot_suppliers(name,groups,contact,phone,address,note,created_by,
     active,status)
   VALUES(btrim(_data->>'name'),groups_,_data->>'contact',
     _data->>'phone',_data->>'address',_data->>'note',false,'potential',uid)
   RETURNING id INTO result_id;
 ELSE
   UPDATE public.ot_suppliers SET name=btrim(_data->>'name'),groups=groups_,
     contact=_data->>'contact',phone=_data->>'phone',
     address=_data->>'address',note=_data->>'note',
     updated_at=now(),revision=revision+1
   WHERE id=_id RETURNING id INTO result_id;
   IF result_id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy nhà cung cấp.'; END IF;
 END IF;
 RETURN result_id;
END $fn$;
COMMIT;
