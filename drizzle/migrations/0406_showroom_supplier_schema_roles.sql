-- Showroom supplier CRM and supplied product catalogue.
-- Separate from ot_suppliers (operational order tracking); no automatic migration.
-- All tables are RPC-only, RLS enabled, with a scoped org-position privilege fence.
BEGIN;
SET LOCAL lock_timeout='8s';
SET LOCAL statement_timeout='90s';

CREATE SEQUENCE IF NOT EXISTS public.showroom_supplier_code_seq;

CREATE TABLE IF NOT EXISTS public.showroom_suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE DEFAULT (
    'SR-NCC-' || lpad(nextval('public.showroom_supplier_code_seq')::text,6,'0')),
  store_id text NOT NULL REFERENCES public.org_units(id),
  name text NOT NULL CHECK(length(btrim(name)) BETWEEN 2 AND 180),
  category text[] NOT NULL DEFAULT '{}'::text[],
  contact_name text CHECK(length(coalesce(contact_name,'')) <= 160),
  phone text CHECK(length(coalesce(phone,'')) <= 60),
  email text CHECK(length(coalesce(email,'')) <= 254),
  website text CHECK(length(coalesce(website,'')) <= 500),
  address text CHECK(length(coalesce(address,'')) <= 800),
  tax_code text CHECK(length(coalesce(tax_code,'')) <= 40),
  status text NOT NULL DEFAULT 'potential'
    CHECK(status IN ('potential','active','paused','archived')),
  notes text CHECK(length(coalesce(notes,'')) <= 5000),
  next_follow_up date,
  last_contact_at timestamptz,
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  updated_by uuid NOT NULL REFERENCES public.profiles(id),
  revision bigint NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS showroom_supplier_store_name_unique
  ON public.showroom_suppliers(store_id, lower(btrim(name)))
  WHERE status <> 'archived';
CREATE INDEX IF NOT EXISTS showroom_supplier_store_status_idx
  ON public.showroom_suppliers(store_id,status,updated_at DESC);

CREATE TABLE IF NOT EXISTS public.showroom_supplier_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.showroom_suppliers(id),
  name text NOT NULL CHECK(length(btrim(name)) BETWEEN 1 AND 200),
  sku text CHECK(length(coalesce(sku,''))<=80),
  category text CHECK(length(coalesce(category,''))<=120),
  specification text CHECK(length(coalesce(specification,''))<=2000),
  unit text NOT NULL DEFAULT 'cái' CHECK(length(btrim(unit)) BETWEEN 1 AND 40),
  origin text CHECK(length(coalesce(origin,''))<=160),
  min_order_qty numeric(12,2) CHECK(min_order_qty IS NULL OR min_order_qty >= 0),
  purchase_price numeric(18,2) CHECK(purchase_price IS NULL OR purchase_price >= 0),
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
CREATE INDEX IF NOT EXISTS showroom_supplier_products_owner_idx
  ON public.showroom_supplier_products(supplier_id,active,name);
CREATE UNIQUE INDEX IF NOT EXISTS showroom_supplier_products_sku_unique
  ON public.showroom_supplier_products(supplier_id,lower(btrim(sku)))
  WHERE sku IS NOT NULL AND btrim(sku)<>'' AND active;

CREATE TABLE IF NOT EXISTS public.showroom_supplier_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.showroom_suppliers(id),
  actor_id uuid NOT NULL REFERENCES public.profiles(id),
  channel text NOT NULL CHECK(channel IN ('call','zalo','email','meeting','other')),
  summary text NOT NULL CHECK(length(btrim(summary)) BETWEEN 1 AND 2000),
  next_follow_up date,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS showroom_supplier_contacts_owner_idx
  ON public.showroom_supplier_contacts(supplier_id,created_at DESC);

-- No direct authenticated/anon table access. RPC functions must scope every row.
ALTER TABLE public.showroom_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showroom_supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showroom_supplier_contacts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.showroom_suppliers,public.showroom_supplier_products,
 public.showroom_supplier_contacts FROM PUBLIC,anon,authenticated;
REVOKE ALL ON SEQUENCE public.showroom_supplier_code_seq FROM PUBLIC,anon,authenticated;

INSERT INTO public.base_permission_catalog(key,label,module,dependencies) VALUES
 ('showroom.supplier.view','Xem danh mục Nhà cung cấp Showroom','Showroom','{}'::text[]),
 ('showroom.supplier.create','Thêm nhà cung cấp Showroom','Showroom','{}'::text[]),
 ('showroom.supplier.edit_own','Sửa hồ sơ nhà cung cấp đã nhập','Showroom','{}'::text[]),
 ('showroom.supplier.product_edit','Nhập sản phẩm nhà cung cấp','Showroom','{}'::text[]),
 ('showroom.supplier.contact_log','Ghi lịch sử liên hệ nhà cung cấp','Showroom','{}'::text[]),
 ('showroom.supplier.manage','Quản lý nhà cung cấp cửa hàng phụ trách','Showroom','{}'::text[]),
 ('showroom.supplier.view_cost','Xem và cập nhật giá nhập sản phẩm','Showroom','{}'::text[]),
 ('showroom.supplier.view_all','Xem nhà cung cấp toàn Khối Showroom','Showroom','{}'::text[]),
 ('showroom.supplier.manage_all','Quản lý nhà cung cấp toàn Khối Showroom','Showroom','{}'::text[])
 ON CONFLICT(key) DO UPDATE SET label=excluded.label,module=excluded.module;

DO $role$
DECLARE kind text;
BEGIN
  FOREACH kind IN ARRAY ARRAY['role-v2-showroom-staff','role-v2-showroom-manager','role-v2-executive'] LOOP
    IF NOT EXISTS(SELECT 1 FROM public.app_roles
      WHERE id=kind AND role_kind='position' AND catalog_generation=2)
      THEN RAISE EXCEPTION 'Missing canonical Showroom V2 role: %',kind;
    END IF;
  END LOOP;
  UPDATE public.app_roles r SET
    permissions=(SELECT array_agg(DISTINCT p ORDER BY p)
      FROM unnest(r.permissions||ARRAY[
      'showroom.supplier.view','showroom.supplier.create',
      'showroom.supplier.edit_own','showroom.supplier.product_edit',
      'showroom.supplier.contact_log']) p),updated_at=now()
  WHERE r.id='role-v2-showroom-staff';
  UPDATE public.app_roles r SET
    permissions=(SELECT array_agg(DISTINCT p ORDER BY p)
      FROM unnest(r.permissions||ARRAY[
      'showroom.supplier.view','showroom.supplier.create',
      'showroom.supplier.edit_own','showroom.supplier.product_edit',
      'showroom.supplier.contact_log','showroom.supplier.manage',
      'showroom.supplier.view_cost']) p),updated_at=now()
  WHERE r.id='role-v2-showroom-manager';
  UPDATE public.app_roles r SET
    permissions=(SELECT array_agg(DISTINCT p ORDER BY p)
      FROM unnest(r.permissions||ARRAY[
      'showroom.supplier.view','showroom.supplier.create',
      'showroom.supplier.edit_own','showroom.supplier.product_edit',
      'showroom.supplier.contact_log','showroom.supplier.manage',
      'showroom.supplier.view_cost','showroom.supplier.view_all',
      'showroom.supplier.manage_all']) p),updated_at=now()
  WHERE r.id='role-v2-executive';
END $role$;

CREATE OR REPLACE FUNCTION private.showroom_supplier_is_store(_store text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
  WITH RECURSIVE parents AS (
    SELECT u.id,u.parent_id,ARRAY[u.id] path
    FROM public.org_units u WHERE u.id=_store AND u.kind='department' AND u.active
    UNION ALL SELECT u.id,u.parent_id,p.path||u.id
      FROM public.org_units u JOIN parents p ON u.id=p.parent_id
      WHERE u.active AND NOT u.id=ANY(p.path)
  ) SELECT EXISTS(SELECT 1 FROM parents WHERE id='showroom-block')
$fn$;

CREATE OR REPLACE FUNCTION private.showroom_supplier_in_store(_actor uuid,_store text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
  SELECT private.is_active(_actor)
    AND private.showroom_supplier_is_store(_store)
    AND EXISTS(
      SELECT 1 FROM public.org_assignments a
      WHERE a.user_id=_actor AND a.unit_id=_store AND a.status='active'
      AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now()))
$fn$;

CREATE OR REPLACE FUNCTION private.showroom_supplier_can_view(_actor uuid,_store text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
 SELECT private.is_active(_actor)
  AND private.showroom_supplier_is_store(_store)
  AND private.has_permission(_actor,'showroom.view')
  AND private.has_permission(_actor,'showroom.supplier.view')
  AND (private.has_permission(_actor,'showroom.supplier.view_all')
    OR private.showroom_supplier_in_store(_actor,_store))
$fn$;

CREATE OR REPLACE FUNCTION private.showroom_supplier_can_manage(_actor uuid,_store text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $fn$
 SELECT private.showroom_supplier_can_view(_actor,_store)
  AND (
    private.has_permission(_actor,'showroom.supplier.manage_all')
    OR (private.has_permission(_actor,'showroom.supplier.manage')
      AND EXISTS(
        SELECT 1 FROM public.org_assignments a
          JOIN public.org_titles t ON t.id=a.title_id
        WHERE a.user_id=_actor AND a.unit_id=_store AND a.status='active'
          AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())
          AND t.active AND t.kind='manager')
    )
  )
$fn$;

REVOKE ALL ON FUNCTION private.showroom_supplier_is_store(text),
 private.showroom_supplier_in_store(uuid,text),
 private.showroom_supplier_can_view(uuid,text),
 private.showroom_supplier_can_manage(uuid,text)
 FROM PUBLIC,anon,authenticated;
COMMIT;
