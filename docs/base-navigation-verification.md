# Quy hoạch menu Base Sứ Việt — 06/11/2026

## Kiểm kê trước thay đổi / Ánh xạ

| Khu vực mới | Chức năng từ menu cũ | Đường dẫn giữ nguyên |
|---|---|---|
| Điều hành | Dashboard, Task To-do List | `/`, `/tasks` |
| Kinh doanh | Quản trị Kinh doanh + Tín hiệu cơ hội + KPI | `/biz`, `/biz/plans`, `/biz/goals`, `/biz/reports`, `/biz/approvals`, `/biz/3k`, `/biz/settings`, `/signals`, `/signals/report`, `/settings/kpi-v2`, `/reports-v2` |
| Showroom | Chưa có chức năng thật | Không tạo đường dẫn |
| Marketing | Nền tảng + Kênh Marketing + Sản xuất Video | `/brands`, `/websites`, `/web-contents`, `/social`, `/local`, `/videos` |
| Thiết Kế | Order Thiết Kế từ Sản xuất nội dung | `/orders` |
| Mua Hàng & Giao Vận | Đơn hàng | `/order-quotes`, `/order-tracking` |
| Kế Toán & Tài Chính | Tài Chính Kế Toán | `/finance/incoming` |
| Hành Chính & Nhân Sự | Nhân sự & Chấm công | `/leave`, `/attendance` |
| Sao Sứ Việt | Giữ chức năng hiện có | `/sao`, `/sao/leaderboard`, `/sao/shop`, `/sao/admin` |
| Hệ thống | Mở rộng & Hệ thống | `/settings` |

Đổi tên trong điều hướng: Quản trị Kinh doanh → Kinh doanh; Tổng quan → Tổng quan Kinh doanh; hai mục Báo cáo → Báo cáo tín hiệu/Báo cáo KPI/Báo cáo Kinh doanh theo chức năng (Báo cáo tín hiệu vốn đã có tên riêng); Cài đặt Biz → Cài đặt Kinh doanh. Giữ nhãn KPI của tôi theo quyền hiện có.

Sắp ra mắt, không có liên kết: Showroom; Trung tâm phê duyệt toàn hệ thống (không thay thế Phê duyệt Biz); Quản Lý Mua Hàng; Quản Lý Giao Vận; Đề Nghị Tạm Ứng; Đề Nghị Thanh Toán; Tạm Ứng Lương. Chỉ Showroom là khu vực tương lai độc lập; các mục tương lai khác chỉ xuất hiện cùng ít nhất một chức năng thật được phép.

Cài đặt Tài khoản/Role và các thiết lập chung vẫn trong `/settings`; Cơ cấu tổ chức và cài đặt nghiệp vụ Biz vẫn trong `/biz/settings`. Không nhân bản chức năng hoặc tạo liên kết giả đến tab chưa có URL riêng.

## Phạm vi sửa
- `src/components/AppShell.tsx`: nối menu, giữ nguyên các dịch vụ/thông báo và kiểm tra quyền; nút thu gọn/khôi phục và menu mobile.
- `src/components/AppNavigation.tsx`: hai cấp, icon, mở/đóng, ghi nhớ theo người dùng, mở theo trang con, chỉ một liên kết được chọn, nhãn Sắp ra mắt vô hiệu hóa.
- `src/lib/navigation.ts`: ánh xạ 30 liên kết thật và nguyên vẹn các điều kiện quyền cũ; không có quyền cha hoặc điều kiện phòng ban.
- `src/lib/navigation.test.ts`, `tests/navigation.browser.tsx`, `tests/navigation.browser.py`: kiểm thử riêng, không được import bởi trang ứng dụng, không tạo dữ liệu thật.
- Không sửa trang nghiệp vụ, route, database/migration, Auth, role, RPC, RLS, lịch chạy hay tích hợp. Chưa Publish.

## Kiểm chứng
- Unit: thứ tự 10 khu vực; quyền con mở nhóm cha (Sale theo dõi đơn, thiết kế, nghỉ phép, Tiền Về, 3K); mọi permission cũ vẫn mở đúng liên kết; KPI feature gate/Admin; phê duyệt được giao; không cấp quyền mới; giữ 30 URL thật không trùng và có route; tương lai không có URL; chọn liên kết cụ thể nhất.
- Trình duyệt cách ly dùng AppNavigation thật: 1280×1800, 390×844, 768×1024; `/biz/3k` tự mở Kinh doanh; bấm Theo Dõi Đơn Hàng tới `/order-tracking`, chọn đúng mục; mobile đóng sau bấm; các mục tương lai bị vô hiệu hóa; thu gọn/khôi phục; không tràn ngang/lỗi JS. Ảnh ở `/tmp/browser/navigation` đã kiểm tra.
- Nghiệm thu toàn AppShell và các chức năng trên phiên thật chưa thực hiện: người dùng đang `/login`, mint `--self` không khớp tài khoản; không tự chọn người dùng hay cấp quyền. Cần người dùng đăng nhập Preview. Các bài kiểm thử cách ly không chứng minh nghiệp vụ từng trang hoạt động end-to-end.

## Phát hiện ngoài phạm vi (không sửa)
Menu Tiền Về hiện chỉ kiểm `finance.incoming.view`, trong khi trang còn cho một số quyền claim/reconcile/manage/manual_view. Giữ nguyên khác biệt hiện có theo yêu cầu không thay đổi quyền; có thể rà soát riêng sau.