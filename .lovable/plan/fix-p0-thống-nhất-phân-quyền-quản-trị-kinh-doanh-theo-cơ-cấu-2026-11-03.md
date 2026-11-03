# FIX P0: Thống nhất phân quyền Quản trị Kinh doanh theo Cơ cấu tổ chức

## Mục tiêu
Một nguồn quyền duy nhất cho Kinh doanh: **Cơ cấu tổ chức → Chức vụ → Bổ nhiệm → Phạm vi → Quyền**. Admin/Super Admin full quyền. Role tổng không còn cấp quyền `biz.*`/`k3.*`.

## Hiện trạng (đã khảo sát)
- `can('biz.*')` trên giao diện đã đọc từ quyền hiệu lực máy chủ (tốt), nhưng `can('k3.*')` vẫn đọc từ Role tổng.
- Rò rỉ Role tổng trong backend:
  - `biz_participant`: bất kỳ Role nào có quyền `biz.%` → được coi là người thuộc Kinh doanh.
  - `biz_all_scope`: cờ `biz_detail_exception` trên Role → xem toàn Khối.
  - `biz_can`: quyền cài đặt (`org_manage`, `kr_manage`, `deadline_manage`, `workflow_manage`, `dept_manage`) đòi quyền trong Role tổng.
  - `k3_can`: cấp `k3.use/view_scope/comment/settings` qua Role tổng.
  - 7 RPC nghiệp vụ kiểm quyền bằng Role: `biz_cycle_milestones`, `biz_deadline_save`, `biz_document_save`, `biz_document_start`, `biz_my_work`, `biz_report_cycle_save`, `biz_report_cycle_delete`.
- Dữ liệu legacy: 6 Role đang giữ quyền biz/k3 (Admin 13, Viewer/Ban Giám Đốc 9, Lead Kinh Doanh ĐH 9, Kinh Doanh Phân Phối 4, Kinh doanh Đơn Hàng 4, Showroom 3); 2 Role có cờ xem toàn Khối (Admin, Viewer).
- Màn hình Role trong Cài đặt tổng vẫn hiển thị và cho gán nhóm quyền "Quản trị Kinh doanh" và "Quản lý 3K".

## Bước 1 — Migration backend (0185)
1. `biz_participant`: bỏ nhánh "Role có quyền biz.%" → chỉ còn thành viên phòng/bổ nhiệm/phân công hiệu lực.
2. `biz_all_scope`: bỏ nhánh cờ `biz_detail_exception` trên Role → chỉ còn Admin/Super Admin, ngoại lệ `biz.view_all` trong Quản trị Kinh doanh, bổ nhiệm điều hành toàn Khối.
3. `biz_can`: nhánh quyền cài đặt không còn đòi quyền Role; chỉ Admin/Super Admin hoặc ngoại lệ `biz_access_exceptions` (đã kiểm tra trước đó trong hàm).
4. `k3_can`: bỏ hoàn toàn kiểm tra Role; `k3.use` = người thuộc Cơ cấu; `k3.view_scope/comment` = quản lý theo bổ nhiệm hoặc ngoại lệ; `k3.settings` = Admin/Super Admin hoặc ngoại lệ.
5. `biz_effective_access`: bổ sung các quyền `k3.*` vào danh sách quyền hiệu lực; bỏ mục `role_exceptions` (không còn hiệu lực, không hiển thị như quyền đang hoạt động).
6. 7 RPC nghiệp vụ chuyển từ kiểm tra Role sang `biz_can` (cùng điều kiện quyền, cùng thông báo lỗi).

Không xóa `app_roles`/`user_roles`/dữ liệu Role; không đổi dữ liệu Kế hoạch/KR/Báo cáo/3K; không đổi quyền các module khác.

## Bước 2 — Frontend
1. `can('k3.*')` đọc từ quyền hiệu lực máy chủ giống `biz.*` (menu 3K tự đúng theo Cơ cấu).
2. Cài đặt tổng → Role & Phân quyền: ẩn hai nhóm "Quản trị Kinh doanh" và "Quản lý 3K" khỏi ma trận Role, form quyền riêng tài khoản và bộ lọc nhóm; thêm ghi chú quyền Kinh doanh quản lý tại Quản trị Kinh doanh → Cài đặt.
3. Gói quyền mặc định của Role không còn chứa `biz.*`/`k3.*` (dữ liệu Role cũ giữ nguyên để audit nhưng không còn hiệu lực).
4. Màn hình quyền hiệu lực Kinh doanh: bỏ mục "ngoại lệ theo Role".

## Bước 3 — Kiểm thử
- Cập nhật test database đang giả lập quyền Role cho biz/k3 sang cơ chế bổ nhiệm/ngoại lệ.
- Thêm test: nhân viên có Role `biz.*` legacy nhưng không bổ nhiệm → bị chặn; bổ nhiệm Trưởng Nhóm/Trưởng Phòng/Giám Đốc Hệ → đúng phạm vi; miễn nhiệm → thu hồi; `k3.*` không cần Role.
- Chạy toàn bộ test biz/k3 + build + kiểm tra giao diện (menu, chặn URL, trang Cài đặt Role).

## Giới hạn
Không xây lại Cơ cấu tổ chức, không đổi quy trình phê duyệt/KR/Báo cáo/3K, không xóa Role module khác, không Publish. Admin/Super Admin giữ full quyền nhưng không tự xuất hiện trong thống kê nhân sự Kinh doanh (đã có sẵn qua `biz_participant`).

## Rủi ro còn lại
- Tài khoản đang quản lý cài đặt Kinh doanh nhờ Role tổng (không phải Admin) sẽ mất quyền cài đặt cho tới khi được cấp ngoại lệ trong Quản trị Kinh doanh — đúng chủ trương của yêu cầu.
- Hai luồng nghiệm thu bằng tài khoản thật (nhân viên mới bổ nhiệm, miễn nhiệm) cần thao tác trên dữ liệu thật — chỉ thực hiện khi được xác nhận.
