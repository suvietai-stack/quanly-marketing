## Bối cảnh

App hiện tại lưu **toàn bộ** dữ liệu trong localStorage (Zustand persist):
- `src/lib/auth.ts` — users, roles, permissions, session
- `src/lib/store.ts` — 18 collection nghiệp vụ (brands, websites, contents, tasks, socials, places, videos, orders, keywords, backlinks, growth, technical SEO, entities, web topics, plans, topics, people, reviews, mapPosts, socialPosts, seoChecks)

Lovable Cloud đã bật nhưng database trống — chưa có bảng nào. Cần build từ đầu.

## Vì sao phải chia đợt

- 18 bảng + RLS + ~30 server functions + refactor 20 file route/component = vượt xa giới hạn 1 lượt an toàn
- Auth phải migrate trước, nếu không các tính năng nghiệp vụ không có ai để gắn ownership
- Mỗi đợt cần test riêng (đăng nhập, CRUD, reload còn dữ liệu) trước khi sang đợt tiếp

## Đợt 1 — Auth + Role + Phân quyền (lượt này)

**Database:**
- `profiles` (1-1 với `auth.users`: full_name, username, phone, desired_position, notes, status `Chờ duyệt|Đang hoạt động|Tạm khóa|Từ chối|Lưu trữ`, is_system_admin, must_change_password)
- `app_roles` (id, name, description, is_system, permissions text[]) — seed 10 role mặc định (Super Admin, Admin, Leader Marketing, SEO, Content Web, Social, Local SEO, Designer, Video, Viewer)
- `user_roles` (user_id, role_id)
- `user_permission_overrides` (user_id, use_custom bool, permissions text[])
- Functions: `has_permission(user_id, perm)`, `is_super_admin(user_id)` — SECURITY DEFINER
- Trigger `handle_new_user` → tạo profile với status `Chờ duyệt`
- Seed Admin: tạo `auth.users` với email `admin@local`, password `Suviet888@@@`, gắn role Super Admin, status `Đang hoạt động`, is_system_admin=true

**Code:**
- Bỏ `src/lib/auth.ts` Zustand → viết lại bằng `supabase.auth` + React Query
- `login.tsx` dùng `signInWithPassword` (map "Admin" → `admin@local` trong nội bộ)
- `register.tsx` dùng `signUp` với metadata (full_name, phone, desired_position) + redirect `emailRedirectTo`
- `AuthGate.tsx` dùng `onAuthStateChange` + check status `Đang hoạt động`
- `AccountsSettings.tsx` refactor đầy đủ: list profiles, duyệt, khóa, set role, custom permissions, reset password
- Server functions: `accounts.functions.ts` (approve, reject, lock, setRole, setCustomPerms, resetPassword) — dùng `requireSupabaseAuth` + check `is_super_admin`
- `src/start.ts` thêm `attachSupabaseAuth` middleware
- Cấu hình auth: `auto_confirm_email=true`, `disable_signup=false`, `password_hibp_enabled=true`
- Nhắc nhở "đổi mật khẩu mặc định" sau khi Admin login lần đầu

**Kết quả:** Tài khoản dùng chung trên mọi máy. Đăng ký mới → chờ duyệt. Admin không thể bị xóa/khóa. Dữ liệu nghiệp vụ vẫn ở localStorage tạm thời (sẽ migrate ở đợt 2).

## Đợt 2 — Database nghiệp vụ + Server functions (lượt sau)

**18 bảng** (tất cả có RLS, FK đến auth.users qua profiles, có cột `is_demo bool default false`):
- `brands`, `websites`, `web_topics`, `web_keywords`, `web_backlinks`, `web_growth`, `web_technical_seo`
- `web_contents` (kèm các trường outline/draft/publish/index/share)
- `socials`, `social_posts`
- `places`, `map_posts`, `map_reviews`
- `videos`, `design_orders`
- `tasks`, `people`
- `entity_socials`
- Catalog: `plans` (text), `topics` (text)

**RLS policy:** mọi user đã đăng nhập + status `Đang hoạt động` có thể đọc; thao tác ghi check qua `has_permission()`.

**Server functions:** 1 cặp `<resource>.functions.ts` cho mỗi bảng (list/get/create/update/delete) + `requireSupabaseAuth`.

**Refactor `src/lib/store.ts`:** giữ nguyên API `useStore().add/update/remove/...` nhưng đổi internals sang React Query + server functions, để các route/component không phải thay đổi nhiều.

## Đợt 3 — Reset demo + Empty states (lượt sau cùng)

- Trang Cài Đặt → "Reset dữ liệu demo" với modal yêu cầu nhập `RESET DEMO`
- Server function `resetDemoData()` (chỉ Super Admin/Admin) → `DELETE FROM <table> WHERE is_demo = true` cho 18 bảng. KHÔNG đụng profiles/roles/Admin/catalog defaults.
- Sau reset hiện toast "Đã reset dữ liệu demo. App đã sẵn sàng để nhập dữ liệu thật."
- Empty states với CTA cho từng màn (Brands, Websites, Tasks, Socials, Orders, ...)
- Bỏ hoàn toàn code seed demo trong `store.ts` (đã làm 1 phần ở turn trước)

## Phạm vi lượt này

**Chỉ Đợt 1.** Sau khi Đợt 1 chạy được (đăng nhập Admin, đăng ký + duyệt tài khoản hoạt động trên cả 2 máy khác nhau), tôi sẽ bắt đầu Đợt 2.

## Rủi ro / lưu ý kỹ thuật

- Username "Admin" sẽ được map sang email `admin@local` ở tầng client. Form đăng nhập vẫn nhận "Admin" hoặc email.
- Trong thời gian giữa Đợt 1 và Đợt 2, dữ liệu nghiệp vụ vẫn ở localStorage (theo máy). Đăng nhập máy mới sẽ thấy nghiệp vụ trống cho đến khi xong Đợt 2.
- `auto_confirm_email=true` để admin duyệt tài khoản trong app, không phải vào email. Nếu sau này muốn xác minh email, có thể bật lại.
- Tất cả mật khẩu do Supabase Auth quản lý (bcrypt server-side), không lưu hash trong frontend nữa.
