-- Unified supplier master for every commercial unit: reuses existing ot_suppliers.
-- Prior Showroom-only staging tables contain zero rows; no records are fabricated.
-- Supplied product prices are RPC-only and restricted to procurement management.
BEGIN;
SET LOCAL lock_timeout='8s';
SET LOCAL statement_timeout='90s';

CREATE SEQUENCE IF NOT EXISTS public.supplier_master_code_seq;
ALTER TABLE public.ot_suppliers
  ADD COLUMN IF NOT EXISTS master_code text,
  ADD COLUMN IF NOT EXISTS category text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS tax_code text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS next_follow_up date,
  ADD COLUMN IF NOT EXISTS last_contact_at timestamptz,
  ADD COLUMN IF NOT EXISTS revision bigint NOT NULL DEFAULT 1;
UPDATE public.ot_suppliers SET master_code=
  'NCC-'||lpad(nextval('public.supplier_master_code_seq')::text,6,'0')
 WHERE master_code IS NULL;
ALTER TABLE public.ot_suppliers ALTER COLUMN master_code SET DEFAULT
  ('NCC-'||lpad(nextval('public.supplier_master_code_seq')::text,6,'0'));
ALTER TABLE public.ot_suppliers ALTER COLUMN master_code SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ot_supplier_master_code_uq ON public.ot_suppliers(master_code);
ALTER TABLE public.ot_suppliers
  DROP CONSTRAINT IF EXISTS ot_supplier_master_status_check;
ALTER TABLE public.ot_suppliers ADD CONSTRAINT ot_supplier_master_status_check
 CHECK(status IN ('potential','active','paused','archived'));
-- Legacy active=false rows are preserved as paused without deletion.
UPDATE public.ot_suppliers SET status='paused' WHERE NOT active AND status='active';

CREATE TABLE IF NOT EXISTS public.supplier_master_products (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 supplier_id uuid NOT NULL REFERENCES public.ot_suppliers(id),
 name text NOT NULL CHECK(length(btrim(name)) BETWEEN 1 AND 200),
 sku text CHECK(length(coalesce(sku,''))<=80),
 category text CHECK(length(coalesce(category,''))<=120),
 specification text CHECK(length(coalesce(specification,''))<=2000),
 unit text NOT NULL DEFAULT 'cái' CHECK(length(btrim(unit)) BETWEEN 1 AND 40),
 origin text CHECK(length(coalesce(origin,''))<=160),
 min_order_qty numeric(12,2) CHECK(min_order_qty IS NULL OR min_order_qty>=0),
 purchase_price numeric(18,2) CHECK(purchase_price IS NULL OR purchase_price>=0),
 currency text NOT NULL DEFAULT 'VND' CHECK(currency IN ('VND','USD','CNY')),
 lead_days integer CHECK(lead_days IS NULL OR (lead_days BETWEEN 0 AND 3650)),
 note text CHECK(length(coalesce(note,''))<=3000),
 active boolean NOT NULL DEFAULT true,
 created_by uuid NOT NULL REFERENCES public.profiles(id),
 updated_by uuid NOT NULL REFERENCES public.profiles(id),
 revision bigint NOT NULL DEFAULT 1,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS supplier_master_products_supplier_idx
 ON public.supplier_master_products(supplier_id,active,name);
CREATE UNIQUE INDEX IF NOT EXISTS supplier_master_products_sku_uq
 ON public.supplier_master_products(supplier_id,lower(btrim(sku)))
 WHERE sku IS NOT NULL AND btrim(sku)<>'' AND active;

CREATE TABLE IF NOT EXISTS public.supplier_master_contacts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 supplier_id uuid NOT NULL REFERENCES public.ot_suppliers(id),
 actor_id uuid NOT NULL REFERENCES public.profiles(id),
 channel text NOT NULL CHECK(channel IN ('call','zalo','email','meeting','other')),
 summary text NOT NULL CHECK(length(btrim(summary)) BETWEEN 1 AND 2000),
 next_follow_up date,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS supplier_master_contacts_supplier_idx
 ON public.supplier_master_contacts(supplier_id,created_at DESC);

ALTER TABLE public.supplier_master_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_master_contacts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.supplier_master_products,public.supplier_master_contacts
 FROM PUBLIC,anon,authenticated;
REVOKE ALL ON SEQUENCE public.supplier_master_code_seq FROM PUBLIC,anon,authenticated;
-- Existing tracking reads remain intact; all master modifications go through RPCs.
REVOKE INSERT,UPDATE,DELETE ON public.ot_suppliers FROM authenticated,anon;

INSERT INTO public.base_permission_catalog(key,label,module,dependencies) VALUES
 ('supplier.master.view','Tra cứu Nhà cung cấp chung','Nhà cung cấp','{}'::text[]),
 ('supplier.master.create','Tạo hồ sơ Nhà cung cấp chung','Nhà cung cấp','{}'::text[]),
 ('supplier.master.edit','Sửa hồ sơ Nhà cung cấp chung','Nhà cung cấp','{}'::text[]),
 ('supplier.master.product_edit','Quản lý sản phẩm Nhà cung cấp','Nhà cung cấp','{}'::text[]),
 ('supplier.master.contact_log','Ghi lịch sử làm việc Nhà cung cấp','Nhà cung cấp','{}'::text[]),
 ('supplier.master.view_cost','Xem và cập nhật giá nhập','Nhà cung cấp','{}'::text[]),
 ('supplier.master.manage','Quản lý trạng thái và ngừng sử dụng Nhà cung cấp','Nhà cung cấp','{}'::text[])
ON CONFLICT(key) DO UPDATE SET label=excluded.label,module=excluded.module;

-- All commercial roles get read-only visibility. Not blanket company/Marketing.
WITH RECURSIVE tree AS (
 SELECT u.id,u.id block_id,ARRAY[u.id] path FROM public.org_units u
 WHERE u.id IN ('biz-block','showroom-block')
 UNION ALL
 SELECT child.id,t.block_id,t.path||child.id FROM public.org_units child
 JOIN tree t ON child.parent_id=t.id WHERE child.active AND NOT child.id=ANY(t.path)
), roles AS (
 SELECT DISTINCT pr.role_id FROM public.org_position_roles pr
 JOIN tree t ON t.id=pr.unit_id
)
UPDATE public.app_roles r SET
 permissions=(SELECT array_agg(DISTINCT k ORDER BY k)
   FROM unnest(r.permissions||ARRAY['supplier.master.view']) k),
 updated_at=now()
FROM roles WHERE r.id=roles.role_id AND r.role_kind='position' AND r.catalog_generation=2;

UPDATE public.app_roles r SET
 permissions=(SELECT array_agg(DISTINCT k ORDER BY k)
   FROM unnest(r.permissions||ARRAY[
     'supplier.master.view','supplier.master.create','supplier.master.edit',
     'supplier.master.product_edit','supplier.master.contact_log']) k),
 updated_at=now()
WHERE r.id='role-v2-purchasing' AND r.role_kind='position' AND r.catalog_generation=2;
UPDATE public.app_roles r SET
 permissions=(SELECT array_agg(DISTINCT k ORDER BY k)
   FROM unnest(r.permissions||ARRAY[
     'supplier.master.view','supplier.master.create','supplier.master.edit',
     'supplier.master.product_edit','supplier.master.contact_log',
     'supplier.master.view_cost','supplier.master.manage']) k),
 updated_at=now()
WHERE r.id='role-v2-proc-head' AND r.role_kind='position' AND r.catalog_generation=2;
UPDATE public.app_roles r SET
 permissions=(SELECT array_agg(DISTINCT k ORDER BY k)
   FROM unnest(r.permissions||ARRAY['supplier.master.view']) k),updated_at=now()
WHERE r.id='role-v2-packing' AND r.role_kind='position' AND r.catalog_generation=2;
UPDATE public.app_roles r SET
 permissions=(SELECT array_agg(DISTINCT k ORDER BY k)
   FROM unnest(r.permissions||ARRAY[
     'supplier.master.view','supplier.master.create','supplier.master.edit',
     'supplier.master.product_edit','supplier.master.contact_log',
     'supplier.master.view_cost','supplier.master.manage']) k),
 updated_at=now()
WHERE r.id='role-v2-executive' AND r.role_kind='position' AND r.catalog_generation=2;

CREATE OR REPLACE FUNCTION private.supplier_master_can_read(_actor uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
 SELECT private.is_active(_actor)
 AND private.has_permission(_actor,'supplier.master.view')
$fn$;
CREATE OR REPLACE FUNCTION private.supplier_master_can_write(_actor uuid,_key text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
 SELECT private.supplier_master_can_read(_actor)
 AND private.has_permission(_actor,_key)
$fn$;
REVOKE ALL ON FUNCTION private.supplier_master_can_read(uuid),
 private.supplier_master_can_write(uuid,text) FROM PUBLIC,anon,authenticated;
COMMIT;
