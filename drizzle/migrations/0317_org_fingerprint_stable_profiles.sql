-- Sửa vân tay cơ cấu: loại cột tự cập nhật (last_seen_at, updated_at) khỏi thành phần profiles.
-- Trước đây mọi request xác thực làm đổi last_seen_at -> vân tay đổi -> apply luôn báo "Nguồn cơ cấu/quyền đã thay đổi".
-- Danh tính, trạng thái tài khoản, Role và cấu hình vẫn được băm đầy đủ.
CREATE OR REPLACE FUNCTION private.org_fingerprint() RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
SELECT md5(private.org_config()::text
  ||coalesce((SELECT string_agg(row_to_json(x)::text,'|' ORDER BY row_to_json(x)::text) FROM user_roles x),'')
  ||coalesce((SELECT string_agg(row_to_json(x)::text,'|' ORDER BY row_to_json(x)::text) FROM app_roles x),'')
  ||coalesce((SELECT string_agg((row_to_json(x)::jsonb-'last_seen_at'-'updated_at')::text,'|' ORDER BY (row_to_json(x)::jsonb-'last_seen_at'-'updated_at')::text) FROM profiles x),'')
  ||coalesce((SELECT string_agg(row_to_json(x)::text,'|' ORDER BY row_to_json(x)::text) FROM base_title_role_links x),'')
  ||coalesce((SELECT string_agg(row_to_json(x)::text,'|' ORDER BY row_to_json(x)::text) FROM biz_approval_workflows x),'')
  ||coalesce((SELECT string_agg(row_to_json(x)::text,'|' ORDER BY row_to_json(x)::text) FROM biz_access_exceptions x),'')) $$;
REVOKE ALL ON FUNCTION private.org_fingerprint() FROM PUBLIC,anon,authenticated,service_role;