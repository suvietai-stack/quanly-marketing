# Bỏ header lặp trên Launcher — 06/11/2026

- Bỏ h1 khu vực/Trang chủ và nút quay lại nội dung trong `MobileLauncher`; giữ header chung `MobileAppChrome` với dòng thương hiệu nhỏ và một h1 tên trang, kể cả Trang chủ.
- Nội dung Launcher bắt đầu trực tiếp bằng tìm kiếm, cách header 16px; khoảng cách section 16px, hàng lưới 8px, ô chức năng tối thiểu 112px, icon vẫn 48px. Giữ ba cột khi đủ rộng, hai cột dưới 360px.
- Giữ menu ba chấm cho ghim/bỏ ghim/sắp xếp, không thay cơ chế lưu hoặc quyền. Không sửa module nghiệp vụ, desktop, API/RPC/schema, thông báo hoặc Zalo.
- File UI: `src/components/MobileLauncher.tsx`, `src/components/MobileAppChrome.tsx`, `src/styles.css`. Cập nhật kiểm thử `tests/mobileShell.browser.py`, `tests/launcher.browser.py` và roadmap.

## Kiểm tra
Harness dùng header/Launcher thật kiểm tra cả mười khu vực ở 320/390/767px: đúng một header, một tên trang trong header, không h1/nút quay lại thứ hai trong nội dung; tìm kiếm cách mép dưới header 12–20px. Marketing chụp ảnh 320/390px xác nhận lưới không chật/tràn. Ghim/bỏ ghim 3K, back nội bộ, Trang chủ từ module, fixed chrome, modal, thông báo và desktop 1280px đạt. Hồi quy Launcher và Sidebar đạt; 25/25 unit test đạt; build mới nhất OK.

Giới hạn: nghiệm thu AppShell trên tài khoản thật còn cần đăng nhập Preview; phiên đang signed_out và lượt trước mint --self không khớp hồ sơ. Harness không được coi là nghiệm thu nghiệp vụ thật. Chưa Publish.