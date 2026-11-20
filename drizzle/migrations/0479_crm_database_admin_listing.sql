-- CRM: independent, read-only, company-wide customer register.
-- No assignment of this permission: only active Super Admin passes initially.
-- To grant later, assign crm.database.view through the normal Role/individual permission engine.
BEGIN;

INSERT INTO public.base_permission_catalog (key, label, module, dependencies)
VALUES ('crm.database.view', 'Xem toàn bộ dữ liệu khách hàng CRM', 'CRM Dữ liệu tổng', ARRAY[]::text[])
ON CONFLICT (key) DO UPDATE
SET label = EXCLUDED.label, module = EXCLUDED.module, dependencies = EXCLUDED.dependencies;

CREATE OR REPLACE FUNCTION public.crm_database_list(
  _group uuid DEFAULT NULL,
  _segment uuid DEFAULT NULL,
  _search text DEFAULT '',
  _archive text DEFAULT 'all',
  _page integer DEFAULT 1,
  _size integer DEFAULT 50
) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, private
AS $fn$
DECLARE
  _uid uuid := auth.uid();
  _skip integer;
  _total bigint;
  _items jsonb;
BEGIN
  IF NOT private.sig_can(_uid, 'crm.database.view') THEN
    RAISE EXCEPTION 'Bạn không có quyền xem dữ liệu khách hàng toàn công ty.' USING ERRCODE = '42501';
  END IF;
  IF _page < 1 OR _page > 100000 OR _size < 1 OR _size > 100 OR _archive NOT IN ('all','active','archived')
    OR length(coalesce(_search,'')) > 150 THEN
    RAISE EXCEPTION 'Bộ lọc hoặc phân trang không hợp lệ.' USING ERRCODE = '22023';
  END IF;
  _skip := (_page - 1) * _size;

  WITH filtered AS (
    SELECT c.id, c.code, c.name, c.phone, c.group_id, c.segment_id,
      c.priority_id, c.owner_id, c.profile_kind, c.archived_at, c.created_at
    FROM public.crm_customers c
    WHERE (_group IS NULL OR c.group_id = _group)
      AND (_segment IS NULL OR c.segment_id = _segment)
      AND (_archive = 'all'
        OR (_archive = 'active' AND c.archived_at IS NULL)
        OR (_archive = 'archived' AND c.archived_at IS NOT NULL))
      AND (coalesce(trim(_search),'') = ''
        OR c.name ILIKE '%' || trim(_search) || '%'
        OR c.code ILIKE '%' || trim(_search) || '%')
  ), paged AS (
    SELECT * FROM filtered ORDER BY created_at DESC, id DESC LIMIT _size OFFSET _skip
  )
  SELECT
    (SELECT count(*) FROM filtered),
    (SELECT coalesce(jsonb_agg(jsonb_build_object(
      'id', p.id, 'code', p.code, 'name', p.name,
      'phone_masked', CASE
        WHEN nullif(regexp_replace(coalesce(p.phone,''), '[^0-9]', '', 'g'),'') IS NULL THEN ''
        WHEN length(regexp_replace(p.phone, '[^0-9]', '', 'g')) <= 3 THEN '***'
        ELSE '***' || right(regexp_replace(p.phone, '[^0-9]', '', 'g'),3)
      END,
      'group_id', p.group_id, 'segment_id', p.segment_id, 'priority_id', p.priority_id,
      'profile_kind', p.profile_kind, 'owner_id', p.owner_id,
      'owner_name', coalesce(pr.full_name, ''), 'archived_at', p.archived_at,
      'created_at', p.created_at
    ) ORDER BY p.created_at DESC, p.id DESC), '[]'::jsonb)
      FROM paged p LEFT JOIN public.profiles pr ON pr.id = p.owner_id)
  INTO _total, _items;
  RETURN jsonb_build_object('total', _total, 'rows', _items, 'page', _page, 'page_size', _size);
END;
$fn$;

-- Full phone and record details are fetched only after an explicit detail click.
CREATE OR REPLACE FUNCTION public.crm_database_detail(_id uuid)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, private
AS $fn$
DECLARE _uid uuid := auth.uid(); _result jsonb;
BEGIN
  IF NOT private.sig_can(_uid, 'crm.database.view') THEN
    RAISE EXCEPTION 'Bạn không có quyền xem chi tiết khách hàng toàn công ty.' USING ERRCODE = '42501';
  END IF;
  SELECT jsonb_build_object(
    'id',c.id,'code',c.code,'name',c.name,'phone',c.phone,
    'email',c.email,'address',c.address,'tax_code',c.tax_code,
    'legal_name',c.legal_name,'website',c.website,'note',c.note,
    'owner_id',c.owner_id,'owner_name',coalesce(p.full_name,''),
    'group_id',c.group_id,'segment_id',c.segment_id,
    'priority_id',c.priority_id,'source_id',c.source_id,
    'relationship_id',c.relationship_id,'created_at',c.created_at,'archived_at',c.archived_at
  ) INTO _result
  FROM public.crm_customers c LEFT JOIN public.profiles p ON p.id = c.owner_id
  WHERE c.id = _id;
  IF _result IS NULL THEN RAISE EXCEPTION 'Không tìm thấy khách hàng.'; END IF;
  RETURN _result;
END;
$fn$;

REVOKE ALL ON FUNCTION public.crm_database_list(uuid,uuid,text,text,integer,integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.crm_database_detail(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.crm_database_list(uuid,uuid,text,text,integer,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_database_detail(uuid) TO authenticated;
NOTIFY pgrst, 'reload schema';
COMMIT;
