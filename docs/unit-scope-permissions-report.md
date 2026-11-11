# Báo cáo bàn giao — Phạm vi đơn vị & dọn cơ chế cũ (migration 0358)

Ngày: 2026-11-11. Phạm vi: hoàn thiện phân quyền theo đơn vị cho Nghỉ phép / Tài chính / Đơn hàng, ngừng Role compatibility cuối cùng, gỡ đường cấp quyền cũ. Không reset, không xóa dữ liệu, chưa Publish.

## 1. Phân quyền theo đơn vị (đã triển khai và kiểm chứng)

Quan hệ dữ liệu đã có sẵn — không cần thêm cột, không đoán đơn vị:
- Đơn nghỉ phép: `leave_requests.owner_id` → đơn vị của người xin nghỉ.
- Tiền Về: `bank_transactions.claimed_by` → đơn vị của Sale phụ trách.
- Đơn hàng: `ot_orders.sale_id` / `supply_id` → đơn vị của người phụ trách.

Cơ chế mới (backend, không filter frontend):
- `private.base_unit_member(u, target)`: target có bổ nhiệm đang hiệu lực trong đơn vị của u hoặc đơn vị con. Bản ghi mà người liên quan không có bổ nhiệm hiệu lực → không hiển thị (mặc định an toàn).
- 3 quyền mới trong catalog + allowlist đã kiểm chứng: `leave.view_unit`, `ot.view_unit`, `finance.incoming.view_unit`.
- Thực thi: RLS `leave_requests read` thêm nhánh `leave_unit_visible`; `fin_can_see` thêm nhánh giao dịch đã claim bởi thành viên đơn vị; `ot_can_view` thêm nhánh đơn do thành viên đơn vị phụ trách.
- Cấp qua bổ nhiệm: Trưởng phòng Kinh doanh nhận cả 3; Quản lý Marketing / Thiết kế / Mua hàng & Giao vận nhận `leave.view_unit`. Miễn nhiệm → thu hồi tự động (resolver yêu cầu bổ nhiệm hiệu lực).

Kiểm chứng trên dữ liệu thật: Trưởng Phòng (Trung Hiếu) thấy đúng 4 thành viên đơn vị + bản thân; 14 nhân sự đơn vị khác bị chặn. Không mở quyền toàn Base để vượt kiểm tra.

## 2. Dọn cơ chế và giao diện cũ

- `role-designer` (compatibility cuối cùng): chuyên môn Thiết kế / Chụp ảnh chuyển sang Role chuẩn "Nhân viên Thiết kế"; 2 nhân sự (Vũ Hạnh, Nguyễn Thị Thương) giữ nguyên quyền qua đường chuyên môn; Role cũ lưu trữ (archived), không xóa — lịch sử giữ nguyên. Không tài khoản nào mất quyền vì Role cũ không được gán trực tiếp.
- Gỡ đường tự khôi phục Role mặc định cũ: bỏ auto-bootstrap trong auth store, bỏ `restoreDefaultRoles`/`buildDefaultRolesPayload`/`DEFAULT_ROLES_META`/`DEFAULT_ROLE_PERMISSIONS`, xóa server function `roles.functions.ts` — trước đây đường này có thể tự tạo lại Role legacy khi Super Admin đăng nhập.
- Gỡ nút "Thêm role" và "Xóa role" khỏi Tài khoản & Phân quyền (tạo/xóa Role tự do ngoài catalog chuẩn); giữ "Tùy chỉnh quyền" cho Role chuẩn.
- Hồ sơ nhân sự trong Cài đặt: ô "Vị trí / bộ phận" chuyển thành chỉ đọc (vị trí thật quản lý tại Cơ cấu tổ chức); đăng ký tài khoản vẫn ghi "vị trí mong muốn" bình thường.
- Vá trigger ký lại liên kết Role: sự kiện audit trước đây ghi actor NULL (vi phạm ràng buộc) — nay ghi người thực hiện hoặc Super Admin đầu tiên.

## 3. Chốt luồng bổ nhiệm

- Cả 17 chức vụ đang dùng đều đã liên kết Role chuẩn (chữ ký hợp lệ, tự ký lại khi Role đổi quyền).
- Bổ nhiệm → nhận quyền thực tế (đã kiểm chứng: 6 Nhân viên Kinh doanh, Kế toán trưởng, Trưởng Phòng...); miễn nhiệm → thu hồi; kiêm nhiệm → tổng hợp nhiều nguồn; Marketing nhận nhiều chuyên môn (many-to-many).
- Tài khoản không cần chọn Role thủ công: duyệt tài khoản tự gán Role nền; chi tiết tài khoản chỉ hiển thị, chỉnh qua Cơ cấu tổ chức / Tùy chỉnh quyền.

## 4. Nghiệm thu

- 7 kiểm thử cô lập mới (unitScope.database.test.ts): allowlist/catalog, phạm vi đơn vị trong/ngoài/không bổ nhiệm, Nghỉ phép, Tiền Về, Đơn hàng, ngừng role-designer, ký lại liên kết + audit actor.
- Hồi quy: 150/150 suite basePermissions đạt; typecheck sạch; build OK.

## 5. Còn tồn tại (không che giấu)

- Phạm vi đơn vị mới áp dụng cho XEM (Nghỉ phép/Tiền Về/Đơn hàng). Sửa/duyệt vẫn theo quy trình hiện hữu (người được chỉ định duyệt, quyền manage toàn hệ thống) — chưa mở sửa theo đơn vị vì chưa có hợp đồng workflow kiểm chứng.
- Quyền cấu hình toàn hệ thống (settings.*, cấu hình ngân hàng/Zalo) vẫn chặn an toàn, chỉ Super Admin.
- Báo cáo tổng hợp (leave.report, ot.report, finance.incoming.view_totals) vẫn là phạm vi toàn hệ thống theo quyền riêng, chưa giới hạn theo đơn vị.
