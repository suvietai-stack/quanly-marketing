# Quản trị Kinh doanh — Bước 2

## Đã bổ sung
- Giữ 2 phòng và 5 KR thực tế, không ghi đè cấu hình hoặc tự gán nhân viên. Doanh số vẫn là giá trị đơn đã chốt.
- Form phòng/KR chỉ mount khi mở và theo ID, reset khi chuyển bản ghi; tab riêng theo quyền, phân quyền dùng Role chung.
- Đọc phòng/thành viên/KR/deadline theo quyền thay vì mọi người đăng nhập. Trưởng phòng cần membership quản lý và quyền tương ứng; view_all không tự cấp quyền duyệt.
- Membership thêm started_at/ended_at (kết thúc loại trừ); khóa profile và unique membership hiện hành. Giữ mốc date cũ. Một dòng lịch sử cũ đã có effective_to trước effective_from: cột mới ánh xạ thành khoảng không có độ dài, không suy đoán thời điểm rời phòng.
- Deadline trước/trong/sau kỳ, giờ/phút VN, ngoại lệ YYYY-PP; thiếu ngày nghĩa là chưa áp dụng, ngày 31 clamp cuối tháng. Có xem hạn cụ thể và RPC dùng cho bước sau. Không gửi nhắc tự động.
- Mục tiêu năm: tự nhập năm/12 tháng, tính quý từ tháng, lưu nháp thiếu và số 0 hợp lệ, chặn gửi thiếu/sai tổng. Không chia đều.
- Tiền/số lượng numeric(20,0), JSON đọc trả chuỗi, UI BigInt. sum cộng dồn; avg/ratio bình quân tháng, không cộng tỷ lệ. Hiện cấu hình thật chỉ có sum; các nguồn tỷ lệ có mẫu số/trọng số cần mô hình riêng trước khi dùng.
- Draft → pending → changes/approved. Duyệt/ trả lại cần đúng phạm vi, không tự duyệt, trả lại bắt buộc nhận xét; optimistic revision tránh ghi đè.
- Phiên bản duyệt bất biến; điều chỉnh có lý do, copy bản chính thức, bản cũ vẫn chính thức đến khi bản mới duyệt. KR snapshot giữ tên/đơn vị/cách tổng hợp/định nghĩa; lịch sử lưu payload từng lần lưu/gửi và xem lại.

## Bảng và RPC
Migration 0089: biz_annual_goals, biz_goal_versions, biz_goal_items, biz_goal_events; SELECT-only cho client, ghi qua RPC. Migration 0090 lấy mốc chuyển phòng sau khi nhận khóa, tránh mốc bị cũ khi hai lượt chờ nhau.
- biz_goal_start, biz_goal_save, biz_goal_decide, biz_goals_read.
- biz_goal_can_read / biz_goal_can_review, biz_department_access / biz_member_access.
- biz_deadline_at và cập nhật biz_deadline_save, biz_member_save/end.

## Kiểm thử và giới hạn
- 34 kiểm thử Biz (29 mục tiêu/database + 5 deadline), tổng 284 kiểm thử Biz/KPI/Đơn từ/Tín hiệu/Sao đạt; build sạch. Các content route đã đối soát metadata, gồm index.
- Kiểm thử PostgreSQL tách biệt qua PGlite: lưu/gửi/trả lại/duyệt/khóa/điều chỉnh, không tự duyệt, view_all không duyệt, RLS và direct-write deny; dữ liệu test không đưa vào vận hành.
- UI tài khoản Super Admin thật: đi từ menu /biz/goals và /biz/settings, phòng và KR thật, form sửa chuyển ID đúng. Tài khoản hiện không thuộc phòng kinh doanh nên không tạo mục tiêu thật.
- UI phân bổ qua response fixture chỉ trong trình duyệt: phân bổ 6 tỷ không đều hợp lệ, thay đổi sai tổng chặn gửi, hủy chỉnh sửa khôi phục; desktop và 360/375/390/430px không tràn, chuyển quý đúng, không lỗi console. Không bấm lưu/gửi fixture.
- Chưa kiểm lưu/gửi/duyệt bằng các nhân viên thật hoặc hai phiên đồng thời trên vận hành: cần mục tiêu thực tế/người lập và người duyệt do người dùng chỉ định. Không tạo mục tiêu hoặc membership giả.
- Chưa Publish. Backend dùng chung nên schema/quyền mới đã áp dụng; code Preview chưa xuất bản.

## Để Bước 3–4
Nộp kế hoạch/báo cáo, kết quả thực tế, mục tiêu vs thực tế, dashboard, nhắc deadline; đọc mục tiêu từ official_version_id, quý tổng hợp từ tháng.
Ngoài phạm vi: cảnh báo bảo vệ mật khẩu đã rò rỉ vẫn còn, không đổi thiết lập đăng nhập ở lượt này.