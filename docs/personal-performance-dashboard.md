# Dashboard cá nhân và nhận định Chipi

Mở Dashboard → Của tôi; trên mobile dùng lối vào Dashboard từ màn hình ứng dụng (`/?view=dashboard`). Không đổi launcher, dashboard quản lý hay quyền xem nhân sự.

## Nguồn và phạm vi

- Task, Content Web, Social, Video, Thiết kế: chỉ đầu việc trực tiếp gán cho tài khoản đang đăng nhập. Không tính việc chỉ tạo/giao/duyệt. Ưu tiên ID ổn định; tên cũ chỉ dùng nếu duy nhất trong danh bạ. Tên trùng bị loại khỏi đối chiếu bằng tên. Loại dữ liệu mẫu.
- Mỗi nguồn đọc bằng Supabase client JWT của người hỏi, có bộ lọc chủ sở hữu, sau đó kiểm tra chủ sở hữu lần nữa trước khi tổng hợp. Không có tham số user_id từ trình duyệt, không service role, không ghi nghiệp vụ. Quyền Dashboard và quyền nguồn được đọc lại từ máy chủ.
- Tín hiệu Sale chỉ `assigned_to` của người hỏi, bỏ tín hiệu hủy. Kết thúc kỳ tính cả won/lost; không đánh đồng với doanh thu hay bán thành công.
- 3K chỉ `user_id` của người hỏi, chưa xóa, ngày kế hoạch trong kỳ đến hôm nay. Trạng thái do nhân viên cập nhật, không coi là KPI đã xác minh. Hai nguồn này trình bày riêng, không cộng vào tổng đầu việc Marketing/Task.
- Các hồ sơ liên kết giữa module vẫn là đầu việc riêng trong module đó; không quy đổi khối lượng thành một thang năng suất hay so sánh nhân viên.

## Công thức

- Tuần từ thứ Hai; tháng theo lịch. Mọi mốc ngày ở Asia/Ho_Chi_Minh, dùng helper khung thời gian KPI hiện có.
- Đang xử lý/chờ phản hồi/trạng thái khác là tồn hiện tại. Quá hạn xử lý chỉ nằm trong đang xử lý; hồ sơ chờ phản hồi quá hạn được nhắc riêng, không tự quy lỗi cá nhân.
- Hoàn thành trong kỳ chỉ có ngày hoàn thành hợp lệ từ đầu kỳ đến thời điểm cập nhật. Không dùng updated_at hay ngày tạo để thay ngày hoàn thành. Web đăng xong vẫn chưa coi hoàn thành toàn quy trình. Social dùng ngày đăng cho mốc hoàn thành.
- Đúng hạn = số hoàn thành không muộn hơn deadline / số hoàn thành đủ dữ liệu đối chiếu. Deadline chỉ có ngày tính đến hết ngày Việt Nam. Ngày hoàn thành không có giờ không được đem so với deadline có giờ. Không có mẫu số hiển thị —.
- Dùng phân công và deadline hiện lưu; không hồi suy attribution tại thời điểm hoàn thành hoặc các lần thay hạn. Không thay thế báo cáo KPI đã chốt.
- Biểu đồ theo ngày, biểu đồ cơ cấu việc mở và biểu đồ hoàn thành theo nhóm có chú giải/số liệu tương ứng. Bảng chi tiết cuộn ngang trên mobile. Các gợi ý ưu tiên sắp deadline, có liên kết về nguồn.

## Lỗi, tải và AI

Mỗi nguồn đọc đủ trang theo chủ sở hữu (250/trang, giới hạn 5.000 bản ghi/nguồn, timeout 12 giây/trang). Nếu một trang lỗi hoặc vượt giới hạn, bỏ toàn bộ nguồn đó và báo chưa tải được; không âm thầm đếm dữ liệu một phần. Nguồn không có quyền/chưa bật hiện —, không phải 0. Không chặn các nguồn đọc thành công.

Báo cáo lazy-load trong tab Của tôi, cache 60 giây theo tài khoản và kỳ; không polling. Chipi tự phân tích khi có dữ liệu và nguồn đọc thành công; cache nhận định 10 phút theo tài khoản/kỳ/dấu số liệu. Có nút phân tích lại. Máy chủ luôn đọc lại số liệu khi tạo nhận định, không nhận số liệu client. Dữ liệu đổi trong lúc phân tích thì nhận định không hiển thị như khớp báo cáo cũ. Lỗi AI không làm mất số liệu. Dùng giới hạn hỏi AI hiện có và API key server-only; không tạo yêu cầu AI cho báo cáo trống.

AI chỉ nhận tổng hợp và tối đa 3 tên việc ưu tiên, không nhận ghi chú riêng/lương/hồ sơ nhân sự. Tên việc là dữ liệu không tin cậy. Nhận định chỉ hỗ trợ cá nhân, không chấm điểm tổng, suy năng lực/thái độ hay đề nghị khen thưởng/kỷ luật. Không so kỳ trước khi chưa có dữ liệu đối chiếu. Chưa có key dùng gợi ý theo công thức và gắn nhãn tương ứng.

## Kiểm tra

`npx vitest run src/lib/performance src/lib/aiSuviet`, `npx tsc --noEmit`, `npm run build`.

Các ca kiểm tra gồm ngày Việt Nam, tách chờ với quá hạn xử lý, ngày hoàn thành thiếu/ngoài kỳ, tránh 0% giả, tên trùng, ID xung đột, chỉ gán bởi mình, lọc actor cho Sale/3K, nguồn lỗi độc lập và chặn khi thiếu quyền Dashboard.
