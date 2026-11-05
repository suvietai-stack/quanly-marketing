# UX tạo công việc 3K — 05/11/2026

## Đã triển khai
- Cơ bản mặc định, Nâng cao dùng cùng trạng thái form và cùng RPC `k3_quick_create`. Cơ bản tạo nguyên tử một KG, một KF và một KPI; retry cùng request key không nhân đôi.
- Tên KF/KPI được kế thừa khi chưa tùy chỉnh. KPI Có/Chưa dùng đúng nguyên văn kết quả cần đạt; không suy diễn yêu cầu gửi khách, số lượng hoặc đơn vị. Giữ đủ 10 kiểu đo và tùy chọn bằng chứng/nghiệm thu.
- KG/KF có `start_time`, `due_time` nullable; KF mới có `inherit_timeline`, `execution_schedule`. Không backfill giờ dữ liệu cũ. Ngày-only kết thúc cuối ngày Asia/Ho_Chi_Minh, thời gian đến phút; chặn kết thúc trước bắt đầu và KF ngoài khoảng KG.
- Lộ trình Hằng ngày/Chọn ngày/Các thứ/Hằng tuần có khung giờ riêng. Đọc KPI ngày, KF được giao và nguồn tổng kết dùng lịch, không nhân bản KF.
- `k3_goal_list` all/active/overdue/done dùng liên quan cá nhân thay admin visibility; quản trị vẫn xem bằng scope. Người sở hữu KG không mặc nhiên là người thực hiện mọi KF giao cho người khác.
- Xóa KG/KF nháp qua `k3_draft_delete`, xác nhận ở menu ba chấm, gọi cơ chế soft-delete bảo vệ kết quả/chốt hiện có. Khôi phục giữ ID và quan hệ cha/con, chặn sau đúng 360 giờ. Purge xử lý phiên bản cấu hình KPI trước xóa cấu trúc; không chạy purge thật bằng tooling.
- Theo dõi kết quả có lọc phòng và nút Xem 3K mở tổng kết nhân viên chỉ đọc.

## Thay đổi
Migrations: `0231` thời gian/cơ bản/phạm vi/xóa nháp; `0232` ghi thời gian nguyên tử và thực thi cá nhân; `0233` sửa alias SQL trong trash và hạn khôi phục; `0234` purge cấu hình và cảnh báo quá hạn KF.

Frontend: `Biz3KQuickCreate.tsx`, `Biz3KKpiConfig.tsx`, `Biz3KTimeline.tsx`, `Biz3KGoals.tsx`, `Biz3KMeasuredPeriod.tsx`, `Biz3KManage.tsx`.

Chung/kiểm thử: `k3Creation.ts`, `k3Goals.ts`, `k3Creation.test.ts`, `k3Creation.database.test.ts`.

## Kiểm thử và giới hạn
- Bộ 3K cuối cùng: 168/168 đạt khi chạy tối đa hai worker; lượt chạy nhiều worker trước đó có một timeout khởi tạo, không lỗi quy tắc. Test tạo/thời gian/phạm vi/trash: 11/11; unit tạo: 6/6.
- Build tự động hiện OK.
- Scheduler thật `k3-trash-purge` hoạt động, lịch `30 2 * * *`; chỉ xác minh cấu hình, không tự chạy xóa trên dữ liệu vận hành.
- Phiên trình duyệt được cấp không đăng nhập thành công; khôi phục phiên của người yêu cầu thất bại vì không tìm thấy tài khoản tương ứng. Chưa kiểm tra trực quan desktop/mobile hoặc ghi/đọc lại qua UI thật.
- Chưa hoàn thiện bộ lọc đủ Khối/Hệ/Phòng/Nhóm, chi tiết lịch sử/lộ trình ngoài ngày tổng kết và toàn bộ ma trận quyền từng chức danh bằng tài khoản thật.
- Chưa nghiệm thu nâng cấp form đang có nhiều KF rồi chuyển về Cơ bản: giữ Nâng cao để tránh bỏ cấu trúc, không xóa dữ liệu đã nhập.
- Không tạo dữ liệu thử, đổi dữ liệu legacy, bật Zalo hay Publish. Các thay đổi database áp dụng trên backend chung; Preview frontend chưa Publish.