# Mục tiêu → KR chung → Phân bổ nhân sự

## Hiện trạng (đã kiểm tra)
- Mỗi "KR" hiện là 1 dòng chỉ tiêu gắn với **1 nhân viên + 1 kỳ**. Muốn Julia 10 + Hoa Ngâu 30 thì hiện phải tạo 2 KR giống nhau, đây là điều tài liệu cấm.
- Mục tiêu có trường người phụ trách, chưa có Phạm vi (Phòng ban/Nhóm/Dự án/Cá nhân) hay Người điều phối.
- Base **chưa có** danh mục phòng ban hoặc nhóm. Dự án dùng Thương hiệu có sẵn.
- Các lỗi logic ở mục XII (lẫn KR giữa các mục tiêu, lọc báo cáo, hướng Đạt ít nhất/Không vượt quá, deadline riêng, Check Top đúng Website, không báo thành công giả, chống tạo trùng) **đã sửa ở lượt trước**, có 39 bài kiểm thử. Lượt này chỉ kiểm tra lại, sau đó mở rộng các quy tắc đó sang phần phân bổ.
- Còn thiếu: nhân viên tự gửi bằng chứng và snapshot khóa kỳ đầy đủ. Hai phần này cần thay đổi cơ sở dữ liệu và đang chờ duyệt.

## Cách lưu đề xuất (cần duyệt, thay đổi nhỏ và không phá dữ liệu)
```text
goals (có sẵn) ──< goal_krs (BẢNG MỚI: KR chung) ──< employee_kpi_items (có sẵn = dòng phân bổ)
```
- **Bảng mới `goal_krs`**: goal_id, metric, chỉ tiêu chung, phạm vi đo (brand/website/social), deadline, trạng thái (active/cancelled/archived), metadata.
- **`employee_kpi_items` thêm cột `kr_id`**: cột này được phép để trống và không đổi cột cũ. Mỗi dòng chỉ tiêu hiện có là một dòng phân bổ, vẫn giữ nguyên kỳ, người được giao và kết quả.
- **Dữ liệu cũ**: KR cũ (chưa có kr_id) vẫn hoạt động như hiện nay. Có thể thêm bước tùy chọn: tạo 1 KR chung cho mỗi dòng cũ và gắn lại, không xóa dữ liệu nào.
- **Phạm vi và người điều phối** lưu trong `goals.metadata`, không cần cột mới: scope = department|team|project|personal, scopeRef, coordinatorId. Phòng ban mặc định là "Phòng Marketing". Nhóm chỉ là nhãn tên, không xây hệ thống quản lý nhóm.
- **Quyền truy cập (RLS)**: Admin toàn quyền. Nhân viên chỉ đọc KR chung khi có dòng phân bổ của mình trong KR đó. Quyền ghi dòng phân bổ giữ nguyên như hiện tại.
- **Khôi phục**: `ALTER TABLE employee_kpi_items DROP COLUMN kr_id; DROP TABLE goal_krs;`. Các bảng cũ không bị ảnh hưởng.

SQL dự kiến sẽ được ghi vào file đề xuất. Tôi **chỉ chạy khi anh/chị bấm duyệt kế hoạch này**. Sau khi chạy vẫn chưa Publish.

## Cách tính (dùng chung một bộ máy tính hiện có)
- Kết quả của dòng phân bổ = cách tính hiện tại theo người + Website + kỳ (đã có kiểm tra người nộp, lần duyệt đầu tiên và chống đếm trùng).
- Kết quả KR chung (loại sản lượng) = tổng các bản ghi hợp lệ **không trùng** giữa các dòng, không cộng mù phần trăm.
- Loại 2–4 (Top từ khóa, tỷ lệ, chuyển đổi): chỉ hiện kết quả chung. Không chia chỉ tiêu cho từng người, trừ khi nguồn dữ liệu hỗ trợ; nếu chưa hỗ trợ thì ghi rõ "Không phân bổ theo nhân sự".
- Kiểm tra phân bổ: hiện "Còn X chưa phân bổ" hoặc "Vượt chỉ tiêu X". Chỉ được xác nhận giao chính thức khi phân bổ vừa đủ. Dòng phân bổ không được vượt ra ngoài Website/Brand của KR.

## Giao diện (giữ trang Mục tiêu hiện tại)
- Thẻ Mục tiêu hiện: Phạm vi, Kỳ, Deadline, Trạng thái, danh sách KR, menu [...] gồm Xem, Sửa, Nhân bản, Hủy/Lưu trữ, Xóa. Chỉ xóa được khi chưa có kết quả và kỳ chưa khóa.
- Thẻ KR hiện: phạm vi đo, kết quả/chỉ tiêu, deadline, số người được phân bổ, menu [...]. Khi mở thẻ sẽ thấy bảng Nhân sự | Website | Chỉ tiêu | Hoàn thành | Deadline | Thao tác, kèm nút "+ Phân bổ chỉ tiêu".
- Mọi lần sửa chỉ tiêu đều ghi vào lịch sử điều chỉnh có sẵn.
- Dashboard cá nhân hiện chỉ tiêu riêng (Julia 7/10). Dashboard quản lý hiện KR chung (27/40) và mở được chi tiết từng người, từng Website. Báo cáo dùng cùng cách tính này.

## Kiểm thử
Viết bài kiểm thử cho các trường hợp: Julia 10 + Hoa Ngâu 30 = 27/40; một người phân bổ trên 2 Website; phân bổ thiếu hoặc vượt; dòng phân bổ ngoài phạm vi KR bị chặn; KR cũ không có kr_id vẫn tính đúng; không đếm trùng; xóa bị chặn khi đã có kết quả. Chạy lại toàn bộ 39 bài kiểm thử cũ.

## Không làm
Không Publish, không đổi Auth, không xóa dữ liệu, không thêm chỉ số KR mới. Phần nhân viên tự gửi bằng chứng và snapshot khóa kỳ vẫn là đề xuất riêng.
