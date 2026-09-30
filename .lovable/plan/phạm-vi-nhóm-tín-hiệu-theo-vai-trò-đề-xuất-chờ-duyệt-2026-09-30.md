# Phạm vi nhóm tín hiệu theo Vai trò — đề xuất chờ duyệt

## Hiện trạng
- Quyền xem tín hiệu đang được kiểm tra ngay trong cơ sở dữ liệu: "Xem toàn bộ" / "Quản lý" thì thấy hết, người tạo thấy tín hiệu mình tạo, Sale thấy tín hiệu được giao.
- Danh sách, bộ đếm, hàng phân loại, báo cáo và Excel đều lấy từ cùng một nguồn dữ liệu đã qua kiểm tra quyền. Vì vậy chỉ cần giới hạn ở cơ sở dữ liệu là mọi nơi tự đúng theo phạm vi, không ẩn ở giao diện.

## Cách lưu phạm vi
- Thêm vào mỗi Vai trò 2 thông tin: **"Tất cả nhóm"** (bật/tắt) và **danh sách nhóm nhu cầu** được theo dõi. Không tạo bảng hay hệ thống phân loại mới.
- **Vai trò hiện có mặc định là "Tất cả nhóm"**, để không ai bị mất dữ liệu ngay sau khi áp dụng. Admin thu hẹp dần sau.
- Người có nhiều Vai trò: phạm vi là hợp của các Vai trò. Admin hệ thống / Super Admin luôn là tất cả.
- "Tất cả nhóm" tự bao gồm nhóm mới thêm sau này.
- Đổi tên nhóm trong Danh mục: phạm vi của các Vai trò đổi tên theo. Ngừng dùng nhóm: phạm vi vẫn giữ, dữ liệu cũ vẫn xem được.

## Quyền nào theo phạm vi
- **Theo phạm vi:** Xem toàn bộ, Phân công / đổi Sale, Quản lý, Sửa, Xóa, Xem báo cáo (kèm xuất Excel).
- **Không theo phạm vi:** "Kinh doanh — nhận tín hiệu được giao" (Sale vẫn chỉ thấy đúng tín hiệu giao cho mình), "Tạo tín hiệu" (người tạo vẫn thấy tín hiệu mình tạo), "Quản lý danh mục".
- Tín hiệu có nhiều nhóm: thấy nếu ít nhất một nhóm nằm trong phạm vi; tổng chỉ đếm một lần (giữ cách đếm hiện có).
- Tín hiệu chưa có nhóm nhu cầu nào: chỉ Vai trò "Tất cả nhóm" thấy.

## Kiểm tra phía máy chủ
- Quy tắc xem tín hiệu, nhật ký và lịch sử áp dụng phạm vi. Vì vậy danh sách, tìm kiếm, bộ lọc, bộ đếm, chi tiết, mở bằng đường dẫn trực tiếp, báo cáo và Excel đều bị giới hạn ngay từ đầu.
- Sửa, xóa, phân công, hủy và mở lại: kiểm tra tín hiệu có thuộc phạm vi hay không. Ví dụ Leader Quà tặng không phân công được tín hiệu Mua lẻ, kể cả khi gửi yêu cầu trực tiếp.
- Thông báo cho quản lý khi có tín hiệu mới chỉ gửi đến người có tín hiệu đó trong phạm vi. Cách gửi Zalo/Web Push không đổi.

## Giao diện
- **Cài đặt → Vai trò & Phân quyền → nhóm Tín hiệu cơ hội:** thêm khung **Phạm vi tín hiệu** phía trên danh sách quyền, gồm ô "Tất cả nhóm" và các nhóm nhu cầu lấy từ danh mục (nhóm ngừng dùng vẫn hiện nếu đã được chọn, có ghi chú).
- **Hàng phân loại trên danh sách:** chỉ hiện nhóm nằm trong phạm vi và đang có dữ liệu theo bộ lọc hiện tại, ẩn nhóm có số 0 (trừ nhóm đang chọn).
- Báo cáo: không đổi giao diện, số liệu tự theo phạm vi.

## Kiểm thử
- Trong cơ sở dữ liệu: dựng 3 vai trò giả A (Sứ quà tặng), B (Quà tặng + Nhập sỉ), C (Tất cả), một người nhiều vai trò, một Sale thường, và tín hiệu giả nhiều nhóm. Tất cả bọc trong một giao dịch rồi hủy bỏ, không đụng dữ liệu thật. Kiểm 16 mục trong tài liệu: xem, đếm, tìm kiếm, đường dẫn trực tiếp, phân công bị chặn, doanh thu/nguồn/Sale/lý do trượt, không đếm trùng.
- Kiểm thử logic hàng phân loại, chạy lại toàn bộ kiểm thử cũ, typecheck và build.

## Chi tiết kỹ thuật
- `app_roles`: thêm `signal_scope_all boolean not null default true`, `signal_scope text[] not null default '{}'`. Ghi qua quyền Super Admin sẵn có.
- Hàm `private.sig_in_scope(uid, need_groups text[])` (SECURITY DEFINER, STABLE) tính hợp phạm vi qua `user_roles`, ngoại lệ admin; `&&` cho giao nhóm.
- Sửa policy `sig_select/sig_update/sig_delete` của `opportunity_signals`: nhánh view_all/manage/edit/delete thêm `AND private.sig_in_scope(...)`. Nhật ký/sự kiện kế thừa qua EXISTS sẵn có.
- Cập nhật `signal_assign`, `signal_cancel`, `signal_reopen`, `signal_sale_update` (nhánh quản lý), `signal_notify`, `signal_catalog_rename` (đổi tên trong scope).
- Khôi phục: bỏ điều kiện phạm vi khỏi policy/hàm; hai cột mới để nguyên không ảnh hưởng.

## Không làm
Không đổi quy trình Sale, Zalo hay module khác, không sửa dữ liệu thật, không Publish.
