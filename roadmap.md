# Roadmap — Báo cáo Kinh doanh theo Ngày/Tuần/Tháng/Quý

## FIX 3K NGÀY + TUẦN/THÁNG — spec 1086 dòng
- [x] A. VN timezone/deadline snapshot, khóa ghi, ngày gốc/owner, KPI/trạng thái, phiên bản tổng kết, nhận xét và lịch sử; dữ liệu legacy Hoàn thành dưới KPI được trình bày Chưa đạt, không sửa trạng thái/timestamp gốc.
- [x] B. Migrations 0174–0180: KG/KF, một k3_tasks dùng chung, chưa xếp lịch/xếp lịch, tổng kết kỳ/lịch sử, request-key + revision fences và phạm vi đơn vị lịch sử; dữ liệu thật giữ 1 ngày/1 công việc, không seed.
- [x] C. Ngày/Tuần/Tháng giữ ngữ cảnh, KG/KF, danh sách theo ngày, KPI theo đơn vị, quản lý/nhận xét, cài đặt bật riêng và deadline tùy chọn.
- [x] D1. 50 kiểm thử 3K + 55 regression Báo cáo/Cơ cấu đạt; build OK; phiên Admin thật mở Ngày/Tuần/Tháng/quản lý/cài đặt và form có dữ liệu hiện hữu; 360/375/390/430px không tràn, không lỗi trình duyệt.
- [ ] D2. Nghiệm thu ghi qua UI: chờ người dùng bật Tuần/Tháng, chọn ngày vận hành và cung cấp KG/KF/công việc thật để tạo–cập nhật–tổng kết–nhận xét; không tạo dữ liệu thử trên database dùng chung. Tuần/Tháng còn Tắt, chưa Publish.

## QUẢN LÝ 3K GIAI ĐOẠN 1 — spec 830 dòng
Nguyên tắc: phân hệ độc lập (dữ liệu/giao diện/cài đặt/lịch sử riêng), không bắt có Kế hoạch/KR mới được lập 3K, không đưa kết quả 3K vào KR/Dashboard KD, tái dùng đăng nhập/tài khoản/cơ cấu/chức danh, không dữ liệu giả, múi giờ VN, chưa Publish.
- [x] K3-1. Database + RLS + RPC: migration 0173 — k3_settings/log, k3_days (KG, planned_at, summarized_at, unique user+ngày), k3_tasks (KF, KPI dự kiến/thực tế, tiến độ, trạng thái, mũi khoan, VNGB), k3_task_events, k3_comments; quyền k3.use/view_scope/comment/settings qua k3_can (tái dùng sig_can/biz_manager/biz_all_scope), scope qua biz_scope_ok; giới hạn mũi khoan theo cấu hình; tổng kết bắt VNGB cho việc chưa xong; không hồi tố nghĩa vụ trước ngày hiệu lực.
- [x] K3-2. Giao diện "3K của tôi": chọn ngày + Hôm nay, thẻ tổng quan, ô KG, thêm/sửa/xóa công việc nhanh, cập nhật tiến độ/kết quả, mũi khoan (tối đa theo cấu hình), VNGB, nút Tổng kết 3K hôm nay, đúng hạn/trễ hạn.
- [x] K3-3. "Trong phạm vi quản lý": tổng quan ngày, danh sách nhân viên theo scope (Trưởng Nhóm/Phòng/GĐ Hệ/lãnh đạo Khối), chi tiết 3K nhân viên, nhận xét quản lý; quyền xem tách quyền sửa; kiểm tra máy chủ.
- [x] K3-4. Cài đặt 3K trong module: bật/tắt, ngày hiệu lực, giờ lập (08:45)/tổng kết (18:00), số mũi khoan tối đa (3), xem phạm vi kế thừa, quy chuẩn trạng thái, lịch sử cấu hình.
- [x] K3-5. Quyền & menu: nhóm quyền "Quản lý 3K" trong registry, menu Quản trị Kinh doanh → Quản lý 3K, route /biz/3k.
- [x] K3-6. Kiểm thử: 10 đơn vị + 10 database (scope, giới hạn mũi khoan, VNGB tổng kết, chống sửa chéo, lịch sử xóa, chống trùng ngày) đạt; typecheck/build đạt; UI thật desktop + 390px không tràn, không lỗi trình duyệt; module mặc định Tắt, chưa tạo nghĩa vụ.
- [ ] K3-7. Module Ngày đã được người dùng bật từ 02/11/2026 và có 1 công việc thật; chờ nghiệm thu ghi/cập nhật/tổng kết/nhận xét với hồ sơ thật được cho phép; chưa Publish.

## FIX TỔNG THỂ QUẢN TRỊ KINH DOANH (SOURCE 35) — spec 909 dòng, 10 phần
Nguyên tắc: không xây lại module, không xóa/reset dữ liệu thật, không động module khác, không tự khóa Báo cáo 2027, chưa Publish.

- [x] P1. Độ chính xác Báo cáo: migration 0169 — biz_report_month_coverage (4 trạng thái Đầy đủ/Chưa đầy đủ/Chưa có/Không áp dụng, liệt kê kỳ thiếu), biz_opening_actuals + RPC xác nhận số liệu đầu kỳ (quyền, nguồn bắt buộc, lịch sử sự kiện, không tự tạo 0, chống cộng trùng với báo cáo chính thức), biz_report_coverage_read; biz_rolling_basis dùng độ phủ thay vì NULL=0.
- [x] P2. KR cuốn chiếu: nhãn rõ trên giao diện Rolling; bản nháp qua tháng mới có cảnh báo + Cập nhật theo tháng mới (rebaseMonths giữ tháng còn chỉnh được, theo kế hoạch hiện hành cho tháng mới khóa) + Hủy; duyệt kiểm tra lại nguồn tại thời điểm duyệt (đã có từ 0167/0168). Lớp biểu đồ Dashboard riêng vẫn chưa nối (mục riêng bên dưới).
- [x] P3. Chuyển chu kỳ: BizDocuments mặc định chu kỳ/kỳ theo cấu hình hiệu lực tại kỳ đó (kể cả kỳ lịch sử), đổi tab chọn kỳ hiện tại của chu kỳ; nghĩa vụ theo chu kỳ từng ngày (0164/0165) giữ không sót/trùng/hồi tố.
- [x] P4. Phê duyệt KR cuốn chiếu: nhãn "Điều chỉnh phân bổ tháng", chi tiết duyệt có tổng quan + bảng trước/sau từng chỉ số/tháng + cơ sở tính; snapshot đơn vị/người duyệt đóng băng khi gửi.
- [x] P5. Bộ luồng duyệt mẫu: migration 0171 — biz_workflow_seed_defaults (5 nhóm × từng Hệ, idempotent, chức danh bổ nhiệm, Cần hoàn thiện khi thiếu người, không ghi đè luồng có sẵn) + biz_workflow_simulate; UI Quy trình mẫu Sứ Việt trong Cài đặt → Quy trình phê duyệt. Đã chạy khởi tạo trên dữ liệu thật: 45 luồng (8 hoạt động, 37 cần hoàn thiện, 0 ghi đè).
- [x] P6. An toàn phê duyệt: luồng thiếu người ở trạng thái Cần hoàn thiện (không kích hoạt, không tự thông qua); Kiểm tra quy trình hiển thị chuỗi duyệt/nguyên nhân thiếu; cấm tự duyệt qua skip_if_submitter + kiểm tra lượt máy chủ (đã có, test mới xác nhận).
- [x] P7. Giao diện: Công việc của tôi có trạng thái lỗi + Thử lại; Phê duyệt có lọc thời gian gửi + tab Trong phạm vi quản lý; mobile 390px không tràn (Báo cáo/Phê duyệt/Cài đặt).
- [x] P8. Hiệu năng: migration 0170 thay khóa bảng biz_documents bằng khóa advisory theo người dùng, phối hợp giữa lưu báo cáo và xác nhận đầu kỳ; giữ kiểm soát đồng thời.
- [ ] P9. Nghiệm thu Nhóm A–D trên dữ liệu thật: cần nhân viên thật có mục tiêu + báo cáo nguồn đủ để nộp/duyệt thật; không tạo dữ liệu giả.

## Điều chỉnh phân bổ KR (Rolling Plan) — đã xong trước đó
- [x] Hồ sơ phân bổ riêng, tái sử dụng phê duyệt KR, kiểm tra nguồn chính thức/phiên bản và thời điểm khi duyệt; không thay cam kết năm.
- [x] Tính phần còn phải đạt từ tháng đã kết thúc đủ dữ liệu; khóa tháng lịch sử/hiện tại; chia đều/tỷ trọng/tự nhập bằng số nguyên chính xác.
- [x] Giao diện điều chỉnh, lịch sử, cảnh báo nguồn thay đổi và tổng phân bổ hiện hành tại KR; Dashboard đánh giá giữ cam kết chính thức.
- [x] 56 kiểm thử KR/phân bổ/báo cáo/tổ chức đạt, trong đó 19 kiểm thử Rolling; đọc mục tiêu thật trên desktop/mobile không lỗi, không tạo dữ liệu vận hành; chưa Publish.
- [ ] Nghiệm thu biểu mẫu và gửi/duyệt bằng nhân viên thật: phiên hiện tại là Admin không có mục tiêu cá nhân; mục tiêu hiện có thiếu báo cáo lịch sử chính thức. Cần chọn tài khoản và hồ sơ thật đủ nguồn.
- [ ] Lớp biểu đồ phân bổ tương lai riêng trên Dashboard: chưa nối, không dùng phân bổ để thay tỷ lệ cam kết năm hiện tại.

- [x] Đồng bộ mặc định Tuần từ 02/11, giữ ngoại lệ/lịch sử và chặn kích hoạt khi thiếu deadline; không hồi tố.
- [x] Một nơi sửa deadline Báo cáo, xem trước kỳ và cảnh báo cấu hình thiếu/ngắn.
- [x] Bỏ chế độ Tạm tính ở KR/Dashboard và khóa nguồn chính thức phía máy chủ; giữ điều chỉnh và tổng hợp không trùng.
- [x] 122 kiểm thử đạt; mở Cài đặt bằng phiên thật, desktop và 360/375/390/430px không tràn; chưa Publish.
- [ ] Hoàn tất lịch Tuần vận hành: cần người dùng chọn mốc đóng nộp bù và xác nhận khoảng mở–hạn cuối hiện dưới 24 giờ.

- [x] Sửa nộp Kế hoạch: Google Docs chính thức, validation nháp/nộp, pha kỳ và mở tài liệu, lỗi chuẩn hóa; 94 tests đạt, form desktop/mobile bằng nháp có sẵn, không đổi dữ liệu/deadline.
- [ ] Nghiệm thu nộp Kế hoạch thật của Lê Minh Ngọc và refresh sau nộp: cần link kế hoạch thật và xác nhận nộp; không lưu/nộp URL thử vào dữ liệu vận hành.

- [x] Bước 1: Nền tảng chu kỳ & deadline (biz_report_cycle_configs, biz_report_cycle_of, deadline report_day/report_week, period_start/end, periodCycle.ts) — migrations 0155/0156, 17 tests đạt
- [x] Bước 2: Nghĩa vụ nộp & form theo chu kỳ (biz_my_work theo chu kỳ được giao, save/start/late-request nhận day/week, phân bổ tuần giao tháng) — migration 0157, typecheck+build đạt
- [x] Giao diện Cài đặt trong Báo cáo: cấu hình hiện có, kế thừa có ngày hiệu lực/lịch sử, xem trước, deadline Ngày/Tuần và form phân bổ tuần; mở được bằng Admin, kiểm tra mobile không tràn.
- [x] Chặn gửi lần đầu sai deadline tại máy chủ, dùng một lần quyền nộp bù; 59 kiểm thử quy tắc đạt, không tạo dữ liệu vận hành.
- [x] Mở rộng nguồn KR cộng dồn theo khoảng/đoạn phân bổ cho Dashboard hiện có; chặn cộng nguồn chồng lấn, thiếu nguồn trả NULL.
- [ ] Nghiệm thu lưu cấu hình → nhân viên nộp Ngày/Tuần/Tháng/Quý trên dữ liệu thật: cần xác nhận lịch và hồ sơ thật; giữ cấu hình hiện có.
- [x] Thống kê nghĩa vụ Dashboard theo chu kỳ thực thay vì kỳ xem; kiểm thử lịch chuyển chu kỳ và thành viên không tạo nghĩa vụ trùng.
- [ ] Nghiệm thu tổng hợp đa chu kỳ/mục tiêu lịch sử qua luồng thật: cần hồ sơ nguồn thật và xác nhận nộp, không tạo dữ liệu giả.
