# Khôi phục Tổng quan Kinh doanh — 31/10/2026

## Nguyên nhân
`BizDashboardViews` mở chế độ Tổng hợp mặc định, nhưng `BizPublishedDashboard` chỉ render KR; RPC công bố chưa cung cấp chuỗi tháng và phân tích. Dashboard chi tiết cũ vẫn tồn tại. Ngoài ra, Recharts 2 không nhận các trục/chú thích đặt trong Fragment chung: đã đổi sang danh sách phần tử có key để khôi phục nhãn trục và tooltip.

## Tái sử dụng và thay đổi
- Giữ `BizDashboard`, `BizHierarchyDashboard`, Hiệu suất, Kỷ luật và chi tiết nhân viên trong phạm vi.
- Tái sử dụng `MetricChart`, `DistributionChart`, `ranking`, `numberText`, `shortNumber`, `periodLabel`; sửa cấu trúc phần tử trục/tooltip trong `BizDashboardCharts`.
- Mở rộng `BizPublishedDashboard`: bộ lọc chung, KR động, thanh tiến độ, mục tiêu/thực tế tháng, lũy kế năm, so sánh Hệ, tỷ trọng doanh số, tiến độ/xu hướng, xếp hạng Hệ.
- Thêm `publishedDashboard.ts` cho hợp đồng tổng hợp, bộ lọc chuỗi, điều kiện so sánh/tỷ trọng và trạng thái thiếu.
- Tab chi tiết chỉ hiện khi có `biz.view_dept`/`biz.view_all`; không đổi quyền backend. Nhân viên vẫn có dữ liệu cá nhân ở trang nghiệp vụ.
- Làm mới giữ bộ lọc; quyết định mục tiêu/báo cáo và thay cấu hình làm mới cache công bố. Chế độ Tổng hợp không gọi API hồ sơ chi tiết.

## RPC và migration
- `0141_biz_published_dashboard_full_analytics`: mở rộng `biz_dashboard_published` giữ chữ ký và các trường cũ, thêm tháng/lũy kế/kỳ trước vào từng nhóm.
- `private.biz_published_facts`: sử dụng nguồn roster/phiên bản chính thức hiện có; mục tiêu chưa gắn báo cáo chính thức lấy từ mục tiêu duyệt, không từ điều chỉnh chưa duyệt; quy thuộc Hệ theo lịch sử phòng.
- `private.biz_published_metrics`: gộp mã ngữ nghĩa + đơn vị + loại + phép tổng hợp + chiều; khi không có mã dùng ID KR, không tên. Tính PostgreSQL numeric, đầu ra số là chuỗi.
- `0142_biz_published_dashboard_system_order_guard`: sửa thứ tự Hệ theo trường thực sự tồn tại; không thêm/sửa dữ liệu Hệ.
- Private helpers không cho browser/service-role EXECUTE trực tiếp. RPC công bố xác thực quyền `biz.dashboard_public`, chỉ trả nhóm Khối/Hệ và số tổng; không trả người dùng, tên nhân viên, hồ sơ, ghi chú, Docs, baseline hoặc lịch sử duyệt.

## Công thức và dữ liệu thiếu
- Tỷ lệ = tổng thực tế / tổng mục tiêu hợp lệ, không bình quân tỷ lệ đơn vị. Phép avg tính trực tiếp từ các mẫu gốc; ratio chưa có quy tắc không tự tính.
- Các tháng trống vẫn có vị trí trên trục (12 tháng năm / 3 tháng quý / 1 tháng được chọn), giá trị NULL, không bịa số 0.
- Thiếu mục tiêu hoàn toàn: Chưa có mục tiêu; có mục tiêu một phần: Chưa có mục tiêu đầy đủ.
- Tháng đã kết thúc và đã quá hạn thiếu báo cáo: Chưa có báo cáo. Kỳ hiện tại/tương lai hoặc chưa đến hạn: Đang theo dõi tiến độ. Kỳ đủ số liệu: đánh giá đạt/chưa đạt khi có quy tắc.
- Giữ deadline đóng băng; tháng tương lai không vào missing_months.
- Tách mục tiêu năm/mục tiêu lũy kế và hai tỷ lệ. Các mẫu thực tế một phần được ghi nhãn, không đủ điều kiện xếp hạng/cơ cấu.
- Donut chỉ tính thực tế chính thức và đủ dữ liệu các Hệ được chọn; thiếu một Hệ thì không xem nó là 0. Xu hướng chỉ khi hai kỳ có cùng metric_key và đủ cơ sở; kỳ gốc 0 không có tỷ lệ tăng trưởng.

## Kết quả kiểm thử
- 183/183 kiểm thử Biz đạt (16 file), gồm 19 ca mới về công thức/đầu ra công bố/chuỗi dữ liệu.
- 55% = 550/1000, không 75%; gộp đúng mã khác nhãn; tách KR không chuẩn khác ID/khác đơn vị/aggregation; số lớn chính xác; zero/null; future; missing deadline; mục tiêu năm/evaluation và quý không trùng.
- Dữ liệu thử chỉ trong PGlite cô lập, rollback. Báo cáo chính thức 50 không bị bản pending 999 thay; mục tiêu duyệt 100 giữ nguyên; tổng Hệ đối chiếu Khối = 50.
- Kiểm quyền nhân viên/phạm vi chức vụ/ngoại lệ và private reader trong các test database hiện có; kiểm thêm công bố dưới `SET ROLE authenticated`, private helper bị chặn và đầu ra không có khóa cá nhân.
- Playwright với phiên Super Admin thật tại `/biz`: năm/quý 4 (10–12)/tháng 10 (10–10), Hệ Phân Phối, đổi KR, làm mới giữ Tháng 10 + Phân Phối; tab chi tiết giữ Hiệu suất/Kỷ luật.
- Desktop 1280×1800 và mobile 360/375/390/430: không tràn trang, nhãn trục và chú thích hiển thị, không lỗi pageerror. Kiểm hình ảnh desktop và 390px. Build mới nhất OK.

## Giới hạn nghiệm thu
- Chưa kiểm UI bằng phiên Sale/Trưởng Nhóm/Trưởng Phòng/Giám Đốc thật; bảo mật các nhánh đã kiểm trong database cô lập.
- Dữ liệu vận hành chưa có thực tế chính thức đủ để vẽ donut/xếp hạng/xu hướng có kết quả; các khu vực hiện trạng thái thiếu, không tạo số giả.
- Không thao tác nộp/duyệt hay sửa/xóa hồ sơ thật. Mục tiêu 1, hồ sơ 3 vẫn giữ nguyên. Số bổ nhiệm đọc đầu/cuối là 12/13; tác vụ này không có SQL hay UI ghi bổ nhiệm, không kết luận mọi dữ liệu chung bất biến trong thời gian người khác sử dụng.
- Không thay cơ cấu/chức vụ/Role/quy trình phê duyệt/module khác. Chưa Publish; thay đổi RPC đã áp dụng vào database chung theo cơ chế Lovable Cloud.