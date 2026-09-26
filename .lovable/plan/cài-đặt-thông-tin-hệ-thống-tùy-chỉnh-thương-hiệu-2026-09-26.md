# Cài đặt → Thông tin hệ thống (tùy chỉnh thương hiệu)

## Kết quả rà soát — chỗ đang ghi cố định
- Tên "Base Marketing": thanh bên + thanh trên điện thoại, trang đăng nhập, trang chờ duyệt, tiêu đề tab trình duyệt của khoảng 20 trang.
- "BASE MARKETING" ở đầu các tin Zalo: tin tín hiệu, tin nhắc chăm sóc, tin đơn từ, tin nhắc duyệt, tin gửi thử.
- Favicon: tệp mặc định `favicon.ico`. Hiện chưa có logo ứng dụng (chỉ có chữ).
- Tên file Excel báo cáo đơn từ.
- Giữ nguyên, không đổi: chữ "OA Sứ Việt" trong hướng dẫn liên kết Zalo (đó là tên OA thật), tên miền base.suviet.vn, mã liên kết `BASE-XXXXXX`, tên bảng, đường dẫn, biến kỹ thuật.

## Người dùng sẽ thấy
- Tab mới "Thông tin hệ thống" trong Cài đặt, chỉ người có quyền "Quản lý thông tin hệ thống" mới thấy. Trang gồm: Tên ứng dụng, Tên viết tắt, Tên đơn vị sử dụng, Mô tả, Logo, Favicon.
- Có khung xem trước (thanh bên, màn đăng nhập, tiêu đề tab, đầu tin Zalo) trước khi bấm Lưu.
- Có nhật ký thay đổi: ai sửa, lúc nào, sửa gì.
- Sau khi lưu, mọi người thấy tên và logo mới ở: màn đăng nhập, thanh bên, thanh trên điện thoại, tiêu đề tab, favicon, thông báo trong Base, tin Zalo gửi sau đó, tiêu đề báo cáo và file Excel.
- Tin đã gửi trước đó giữ nguyên nội dung cũ.
- Nếu không tải được cấu hình, ứng dụng dùng thông tin hiện tại: Base Marketing / BASE / Công ty Cổ phần Sứ Việt.

## Cần bạn duyệt: thay đổi dữ liệu (chỉ thêm mới, không sửa dữ liệu cũ)
1. Bảng mới chỉ có một dòng cấu hình thương hiệu: tên, tên viết tắt, đơn vị, mô tả, đường dẫn logo, đường dẫn favicon, người sửa cuối, thời gian.
   - Không có tài khoản cũng đọc được, vì màn đăng nhập cần hiển thị tên và logo. Bảng không chứa thông tin bí mật.
   - Không ai ghi thẳng vào bảng.
2. Bảng nhật ký thay đổi, chỉ thêm dòng mới: người sửa, thời gian, giá trị trước và sau. Chỉ người có quyền quản lý mới đọc được.
3. Chức năng lưu cấu hình ở máy chủ: kiểm tra quyền "Quản lý thông tin hệ thống" ngay tại máy chủ, kiểm độ dài các trường, ghi nhật ký.
4. Kho ảnh "branding" (ai cũng xem được) để lưu logo và favicon.
   - Chỉ người có quyền mới tải lên được.
   - Chỉ nhận PNG, JPG, WEBP, ICO, tối đa 1 MB mỗi tệp.
   - Không nhận SVG, vì SVG có thể chứa mã chạy ngầm.
   - Kiểm tra cả trên giao diện lẫn tại kho lưu trữ.
5. Thêm quyền mới `system.branding` "Quản lý thông tin hệ thống". Chưa bật cho vai trò nào; bạn tự tick cho Admin.

Phần cấu hình kỹ thuật (tên miền, Zalo OA, khóa kết nối, OAuth, Webhook…) không nằm trong trang này.

## Sửa lỗi bảo mật kèm theo
- Hiện mọi tài khoản đăng nhập đều đọc được cấu hình Đơn từ, kể cả tài khoản đang chờ duyệt hoặc bị khóa.
- Sẽ thu hẹp lại: chỉ tài khoản đang hoạt động mới đọc được.
- Đơn từ vẫn chạy như cũ, vì người dùng Đơn từ đều là tài khoản đang hoạt động.

## Chi tiết kỹ thuật
- Tạo `src/lib/branding.ts`: giá trị mặc định, hook `useBranding()` (react-query, lỗi thì dùng mặc định) và hàm `brandTitle(page)`.
- `__root.tsx`: sau khi tải xong, cập nhật `document.title` (thay đuôi "— Base Marketing") và thẻ favicon. Khi máy chủ dựng trang lần đầu, tiêu đề vẫn là mặc định.
- Sửa `AppShell.tsx`, `login.tsx`, `pending.tsx` để dùng tên và logo từ `useBranding`.
- Zalo: `zalo.server.ts` đọc tên viết tắt / tên ứng dụng (viết hoa) mỗi lần dựng tin rồi truyền vào `signalMessage`, `leaveMessage`, `remindMessage`, `careMessage`, `testMessage` qua tham số `brand` (mặc định "BASE MARKETING"). Cập nhật test tương ứng. Không đổi hàng đợi, OAuth hay Webhook.
- Tên file và tiêu đề Excel báo cáo đơn từ lấy theo tên viết tắt.
- `settings.tsx`: thêm tab `system` và tạo component `SystemInfoSettings.tsx`.
- Migration: tạo bảng `app_branding` (id=1) và `app_branding_history`, RPC `branding_save` (SECURITY DEFINER, `has_permission(auth.uid(),'system.branding')`), bucket `branding` với chính sách insert/update theo quyền, giới hạn mime type và dung lượng. Đổi policy `leave_settings read` sang `private`/`public.is_active(auth.uid())`.
- Ghi quy tắc vào AGENTS.md: thương hiệu chỉ đọc từ `app_branding` qua `useBranding`, có giá trị mặc định dự phòng.
