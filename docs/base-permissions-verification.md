# Phân quyền toàn Base — kết quả triển khai bước nền tảng

## Đã thực hiện
- Migrations 0292–0298: cấu hình tổ chức có phiên bản, danh mục quyền, mặc định/trực tiếp/bộ quyền/gán bộ, nhật ký, bản xem trước và áp dụng nguyên tử.
- ALLOW/DENY/NOT_CONFIGURED, DENY ưu tiên; kế thừa Khối–Phòng–Nhóm, chức danh đang hoạt động; nguồn quyền và hiệu lực.
- Super Admin quản trị tại `/organization`; ba tab nhân sự, đơn vị/chức danh, bộ quyền, xem trước/xác nhận và nhật ký. Các thay đổi không ghi vào Role/quyền riêng cũ.
- Áp dụng Nấc 1 mới cho năm quyền Sale Work và `biz.crm_use` (CRM của chính mình). Các quyền khác chỉ lưu nháp; không được kích hoạt bằng giao diện hoặc RPC.
- CRM của chính mình được kiểm tra ở `crm_owner_visible`; không cho grant cá nhân biến thành đọc CRM nhân viên khác. Admin Kinh doanh hiện hữu giữ bypass CRM, hiển thị nấc 0.
- Auth đọc quyền hỗ trợ từ máy chủ, fail closed khi thiếu/lỗi, cập nhật tại mốc thời gian/focus/30 giây. Ghim Mobile không persist khi quyền chưa sẵn sàng.

## Kiểm thử
- 82/82 kiểm tra đạt: 25 nền tảng phân quyền, 17 menu, 9 ghim, 5 Sale Work, 6 thống nhất quyền Kinh doanh, 20 đề nghị tài chính.
- Browser cách ly 390×844 và 1280×1800: cấp CRM → xem trước → bắt buộc xác nhận → áp dụng → đọc lại; không tràn ngang/lỗi JavaScript. Không ghi dữ liệu thật qua fixture.
- Build gần nhất OK. Kiểm tra schema thật có đủ bốn bảng mới.
- Fingerprint trước/sau của 18 Role, 13 quyền riêng và 26 gán Role không đổi: `4141c8e48d0b7fea8945c3929017962c`, `3273822a2d6c947d2e38d2bfab8e1c23`, `2d18029947fca992f4b7b5fa08d0c723`.
- Không tự gán quyền/đơn vị, không tạo tài khoản/dữ liệu nghiệp vụ giả, không Publish. Backend chung được bổ sung schema/RPC, không phải thay đổi chỉ Preview.

## Chưa hoàn tất toàn bộ tài liệu
- Tích hợp Nấc 1 cho Marketing/Thiết kế/Tín hiệu/Đơn hàng/Nhân sự/Tài chính/Kinh doanh/3K và các quyền CRM còn lại: đang chặn kích hoạt, không giả định các module đã hỗ trợ.
- Ánh xạ được xác nhận giữa cơ cấu Base mới và cơ cấu Kinh doanh cũ; bộ mẫu nháp theo phòng/chức danh; gán bộ hàng loạt và xem trước ảnh hưởng theo mốc tương lai đầy đủ.
- UI hiện có thêm/kết thúc phân công; chưa có luồng điều chuyển/kiêm nhiệm chuyên biệt và xem trước toàn bộ thay đổi cơ cấu độc lập quyền.
- Xem trước cấu hình có diff và mốc kế tiếp; impact quyền hiện tại không phải mô phỏng tất cả mốc tương lai. Cần hoàn thiện trình bày trước/sau bằng nhãn nhân sự/đơn vị thay vì giá trị JSON.
- Nghiệm thu đăng nhập thật: `lovable auth-session --json --self` không tìm tài khoản khớp; trang thật `/organization` chuyển `/login`. Cần người dùng đăng nhập Preview bằng tài khoản được phép; không tự chọn tài khoản khác.