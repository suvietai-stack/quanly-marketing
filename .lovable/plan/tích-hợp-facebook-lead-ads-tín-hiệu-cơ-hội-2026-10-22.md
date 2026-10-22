# Tích hợp Facebook Lead Ads → Tín hiệu & Cơ hội

Kết quả: Admin kết nối Page → chọn nguồn từ Kho nguồn → Base tự lấy Form → khớp trường từng Form → bật đồng bộ. Lead mới từ Form đang bật tự thành tín hiệu "Chờ phân công", chạy tiếp đúng quy trình Sale/Zalo/KPI hiện có.

## Giai đoạn 1 (lượt này)

1. **Cài đặt → Tích hợp Marketing → Facebook Lead Ads** (tab mới trong Cài đặt, không thêm menu).
   - Thẻ trạng thái: Meta App, Secrets đã nhập chưa, Webhook đã xác minh chưa.
   - Nút **Kết nối Page Facebook** (đăng nhập Facebook chính thức) → chọn Page → Base đăng ký nhận lead cho Page và báo đúng lỗi Meta trả về (thiếu quyền, cần App Review/Leads Access…).
   - Mỗi Page: chọn Nguồn tín hiệu từ Kho nguồn hiện có (lưu đúng theo tên như tín hiệu đang dùng, không tạo nguồn mới), Kiểm tra lại, Kết nối lại, Ngắt kết nối.
   - Danh sách Form của Page, nút **Làm mới danh sách Form**; Form mới luôn Tắt; Form bị lưu trữ vẫn giữ lịch sử.
2. **Cấu hình Form**: 7 trường (Khách hàng, SĐT, Địa chỉ, Sản phẩm, Nhóm nhu cầu, Chi tiết nhu cầu, Ghi chú Marketing) × 3 chế độ: Lấy từ Facebook (chọn câu hỏi thật của Form, lưu theo khóa Meta) / Mặc định (danh mục đọc từ Cài đặt) / Để trống. Ánh xạ đáp án Facebook → giá trị danh mục Base. Kiểm tra hợp lệ trước khi cho Bật. Ngày phát hiện, Nguồn, Sale phụ trách tự động.
3. **Công tắc đồng bộ từng Form**, lưu thời điểm bật; chỉ lead sau thời điểm đó được nhập.
4. **Webhook Meta**: xác minh GET bằng Verify Token; POST kiểm chữ ký `X-Hub-Signature-256`, lưu sự kiện trước khi trả 200, rồi lấy lead qua Graph API, áp mapping, tạo tín hiệu. Form tắt chỉ lưu metadata, không lấy dữ liệu cá nhân.
5. **Chống trùng/mất lead**: mỗi Leadgen ID tối đa 1 tín hiệu (ràng buộc duy nhất); trạng thái Chờ xử lý / Thành công / Thất bại / Bỏ qua / Trùng; thiếu dữ liệu bắt buộc → giữ ở "Cần xử lý" kèm lý do, không tạo tín hiệu sai.
6. **Lịch sử đồng bộ**: lọc Page/Form/thời gian/trạng thái, link mở tín hiệu, nút **Thử đồng bộ lại**, 4 số liệu tổng quan.
7. **Phân quyền**: quyền mới `integration.facebook_leads` (Super Admin luôn có, không cấp mặc định cho Role khác); kiểm cả giao diện và máy chủ. Token Page lưu mã hóa phía máy chủ, không bao giờ gửi ra trình duyệt.

## Giai đoạn 2 (sau khi G1 chạy với lead thật)

Tự gợi ý mapping, tự quét Form mới định kỳ, retry tự động có backoff, đối chiếu định kỳ và **Đồng bộ bù** có chọn phạm vi + xác nhận.

## Cần bạn chuẩn bị

- Nhập qua ô Secrets bảo mật (tôi sẽ mở khi cần): **META_APP_SECRET**, **META_WEBHOOK_VERIFY_TOKEN** (tôi có thể tự sinh). App ID `1673473860857150` không bí mật.
- Sau khi Publish: dán Callback URL `https://base.suviet.vn/api/public/meta/leads-webhook` và Redirect URI `https://base.suviet.vn/api/public/meta/oauth-callback` vào Meta Developers.

## Chi tiết kỹ thuật

- Bảng mới: `fb_lead_pages`, `fb_lead_forms` (mapping JSON, enabled, enabled_at, schema hash), `fb_lead_events` (unique leadgen_id, status, error, signal_id, meta times), token trong bảng riêng chỉ service_role đọc, mã hóa AES-GCM bằng khóa từ App Secret. Client SELECT-only, ghi qua RPC SECURITY DEFINER / server function kiểm quyền.
- Tín hiệu tạo bằng insert service-role vào `opportunity_signals` với `status=waiting`, `assigned_to=null`; `created_by` dùng một tài khoản hệ thống "Tích hợp Facebook" (không phải nhân viên) — kiểm tra trigger `sig_guard`/thông báo để Zalo/push chỉ phát một lần.
- Graph API v23+ qua `graph.facebook.com` (app riêng của bạn, không dùng connector Lovable vì connector không có `leads_retrieval`).
- Test: chữ ký webhook, idempotency, mapping/validation, form tắt.
