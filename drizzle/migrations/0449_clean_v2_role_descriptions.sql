-- Remove V1 migration notes from the displayed descriptions of current V2
-- roles. Only generated migration boilerplate is changed; user-written role
-- descriptions and all effective permissions are preserved.
DO $$
DECLARE changed integer;
BEGIN
  PERFORM set_config('app.role_reason',
    'Chuẩn hóa mô tả Role V2 sau khi xóa Role nghiệp vụ cũ',true);
  UPDATE public.app_roles
  SET description=CASE
    WHEN role_kind='marketing_task'
      THEN 'Quyền nhiệm vụ '||name||', áp dụng khi được giao chuyên môn.'
    WHEN role_kind='position'
      THEN 'Quyền vị trí '||name||', áp dụng theo sơ đồ tổ chức và phạm vi bổ nhiệm.'
    ELSE description
  END
  WHERE catalog_generation>=2
    AND description LIKE 'Bộ Role chuẩn mặc định 2026; đối chiếu từ Role cũ %';
  GET DIAGNOSTICS changed=ROW_COUNT;
  RAISE NOTICE 'Updated % obsolete V1-role descriptions',changed;
END
$$;
