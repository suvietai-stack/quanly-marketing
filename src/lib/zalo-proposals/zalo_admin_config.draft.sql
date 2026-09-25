-- ĐỀ XUẤT — CHƯA ÁP DỤNG. Chờ Admin phê duyệt.
-- Chỉ THÊM cột vào bảng zalo_oa_config (bảng này không cấp quyền cho anon/authenticated,
-- chỉ backend đọc được). Không sửa RLS, không đụng dữ liệu cũ.
ALTER TABLE public.zalo_oa_config
  ADD COLUMN IF NOT EXISTS app_id text,
  ADD COLUMN IF NOT EXISTS app_secret text,
  ADD COLUMN IF NOT EXISTS oa_secret_key text,
  ADD COLUMN IF NOT EXISTS base_url text DEFAULT 'https://base.suviet.vn',
  ADD COLUMN IF NOT EXISTS test_ok_at timestamptz;
