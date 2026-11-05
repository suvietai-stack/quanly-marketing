# Hotfix 3K — 05/11/2026

## Nguyên nhân và sửa chữa
- Migration 0243 đưa `g.creation_mode` vào `k3_kpi_day_read`, nhưng `k3_goals` thật không có cột này. Trước đó `k3_quick_create` chỉ đọc kiểu từ payload và ghi vào event, không lưu trên KG. Test daily context đã tạo sẵn cột giả định nên không phát hiện thiếu schema thật.
- Migration 0244 bổ sung cột nullable, không backfill suy đoán. Quick create lưu basic/advanced cho bản mới; request-key idempotency vẫn giữ nguyên. Daily delete target dựa cấu trúc một bước, không cần biết kiểu legacy.
- `k3_draft_delete` cũ từ chối mọi trạng thái ngoài draft. UI hiện dùng `k3_soft_delete`, nhưng KF duy nhất bị chặn xóa lẻ và ngày không tải được nên không thể lấy target cha. Alias cũ nay chuyển vào thao tác thống nhất; một KF duy nhất chuyển sang xóa toàn công việc, vẫn kiểm quyền chủ trì/Admin.
- Backend giữ bảo vệ kết quả KPI kể cả đã lưu trữ, result versions, thực hiện legacy, xác nhận Sale và snapshot chốt. Xóa khóa KPI; writer kiểm lại sau chờ khóa. Bản hủy không chuyển sang timed trash. Cấu trúc được soft-delete; KPI vẫn giữ ID và bị ẩn/khóa theo cha, không xóa vật lý.
- Detail một bước không hiển thị thêm Xóa KF. Lỗi SQL thô được thay thông báo thân thiện và ghi console kỹ thuật. Lỗi danh sách không vô hiệu hóa nút tạo/tổng kết độc lập.

## Xác minh database đang chạy
- Tool áp dụng 0244 thành công; kiểm tra information_schema: creation_mode tồn tại, nullable, không default.
- Không còn lời gọi `g.creation_mode` trong function; quick create có đoạn lưu mode.
- authenticated có EXECUTE cho list/detail/day/create/deletable/delete/restore/alias.
- Trước: 18 KG không có cột mode. Sau: 18 legacy NULL và 1 bản mới có mode; có người dùng hoạt động đồng thời. Không tạo hoặc chỉnh công việc thử bằng tooling.
- Kết quả KPI 9, result versions 15, chốt 1 giữ nguyên qua các lượt đối soát. Không tuyên bố toàn bộ số KG/KF/event bất biến vì có hoạt động đồng thời.
- Gọi list/day qua read-query chưa nghiệm thu: tool không có EXECUTE k3_can. Không mở rộng grants để vượt quyền tool.

## Kiểm thử
- 197/197 test ở 15 file 3K đạt; 12 test deletion dùng migration 0244 thực tế, chạy lại migration hai lần không lỗi.
- Đạt trong database cô lập: tạo basic, lưu mode, legacy NULL; nháp xóa/trash/restore; việc đang chạy không kết quả xóa qua alias/sole-step; KPI kể cả lưu trữ chặn xóa; tổng kết thủ công chặn xóa; hủy không vào trash; xóa chặn người khác; bảo vệ ngày chốt; daily result không vượt assignment và bản hủy không trở lại list.
- Build log mới nhất: OK.

## Chưa nghiệm thu
Browser 1280×1800 mở /biz/3k chuyển /login; --self không tìm được tài khoản tương ứng. Chưa chứng minh các bước mở list/day, tạo → xóa → trash → restore qua UI trên phiên thật. Cần người dùng đăng nhập Preview. Danh sách riêng cho lịch sử hủy vẫn là hạng mục tồn từ trước; dữ liệu hủy được giữ, chưa có màn hình riêng.

Không Publish, không bật Zalo, không reset/chỉnh timestamp lịch sử, không tạo dữ liệu thử trên backend chung.