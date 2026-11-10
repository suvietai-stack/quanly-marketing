# Giai đoạn 3 — Làm sạch quyền cũ, chuyển sang Role chuẩn

Ngày: 2026-11-10. Trạng thái: công cụ đã triển khai và kiểm chứng trên Preview; **chưa thực thi chuyển đổi dữ liệu thật** — chờ Admin xác nhận trên màn hình xem trước. Chưa Publish.

## Đã triển khai

### Backend (migrations 0324, 0325, 0326)
- `base_perm_cleanup_runs`: nhật ký + bản sao khôi phục từng lần chạy (ai, khi nào, gỡ Role nào, trạng thái khôi phục).
- `private.cleanup_role_protected`: bảo vệ Role quản trị (role-admin/super-admin), Role chứa quyền biz.*/k3.*, Role chứa quyền quản trị tài khoản.
- `private.cleanup_fingerprint`: vân tay toàn bộ user_roles + overrides — đổi bất kỳ dòng nào thì bắt buộc xem trước lại.
- `public.base_perm_cleanup_preview`: kiểm kê toàn bộ tài khoản đang hoạt động có nguồn quyền trực tiếp; phân nhóm A (Quản trị) / B (Kinh doanh) / C (Ngoài Kinh doanh) / D (Kiêm nhiệm); tính quyền trước/sau theo tập hợp với một cấu hình dùng chung (nhanh, cùng ngữ nghĩa DENY > ALLOW > override > Role trực tiếp); trạng thái ready / review / needs_confirm / protected.
- `public.base_perm_cleanup_execute`: chỉ Super Admin; khóa vân tay; bỏ qua tài khoản quản trị và tài khoản có quyền tùy chỉnh; chỉ gỡ Role không được bảo vệ; lưu bản sao khôi phục nguyên tử cùng transaction.
- `public.base_perm_cleanup_restore`: trả lại đúng các dòng đã gỡ của một lần chạy, chặn khôi phục lặp.

### Giao diện
- Cơ cấu tổ chức → Cài đặt → Role & Phân quyền → Nâng cao → **Chuyển đổi quyền cũ** (`src/components/PermissionCleanup.tsx`, `src/lib/permissionCleanup.ts`).
- Tổng quan theo nhóm trạng thái, bảng lọc được, chi tiết từng tài khoản (Role giữ/gỡ, nguồn quyền tự động thay thế, danh sách quyền sẽ mất, cảnh báo quyền tùy chỉnh).
- Xác nhận bằng gõ `CHUYỂN ĐỔI QUYỀN`; nút "Xem trước lại"; lịch sử chạy kèm nút Khôi phục.

## Kiểm kê dữ liệu thật (xem trước, chưa thực thi)
- 23 tài khoản có nguồn quyền trực tiếp.
- Được bảo vệ: 15 (2 Super Admin; 13 nhân sự Kinh doanh/kiêm nhiệm với Role Kinh doanh hoặc Viewer Ban Giám Đốc).
- Cần xác nhận: 1 (tài khoản có 69 quyền tùy chỉnh riêng — hệ thống không tự gỡ).
- Cần xem lại: 7 — vì nhân sự chưa được bổ nhiệm vào chức vụ trong Cơ cấu tổ chức nên quyền thay thế từ chức vụ chưa có; số quyền sẽ mất: Kế Toán 13, Hành Chính Nhân Sự 41, Cung Ứng 14, Content Web 32, Designer 28 (×2), Leader Marketing 288.
- Sẵn sàng: 0 — đúng kỳ vọng: chưa thể làm sạch an toàn tới khi bổ nhiệm chức vụ cấp quyền thay thế.

## Kiểm thử
- 7/7 test DB (PGlite, migration thật 0324–0326): phân nhóm, quyền được thay thế không tính mất, quyền chưa kiểm chứng vẫn tính mất, thực thi chỉ gỡ Role không bảo vệ + lưu backup, vân tay đổi bắt xem trước lại, khôi phục đúng và chống lặp, non-Super-Admin bị chặn cả ba RPC, chạy lại không xóa thêm.
- Hồi quy 147/147; typecheck sạch; build OK; xác minh giao diện trên Preview bằng tài khoản Super Admin thật (chỉ đọc).

## Trạng thái theo yêu cầu bàn giao
- Đã triển khai code: có. Đã kiểm thử: có. Đã xem trước dữ liệu thật: có.
- Đã được Admin xác nhận: CHƯA. Đã thực hiện chuyển đổi dữ liệu thật: CHƯA.

## Việc cần làm trước khi chuyển đổi thật
1. Bổ nhiệm nhân sự ngoài Kinh doanh vào chức vụ trong Cơ cấu tổ chức (hiện hầu hết "Chưa phân công vị trí").
2. Kiểm chứng thêm quyền quản lý theo phạm vi để giảm danh sách "quyền sẽ mất" (đặc biệt Leader Marketing 288 quyền, HCNS 41, Content Web 32).
3. Xử lý riêng tài khoản có quyền tùy chỉnh (69 quyền) — đối chiếu thủ công với Role Video chuẩn.
4. Role riêng cho Nhân viên Đóng hàng (chưa có Role phù hợp).
