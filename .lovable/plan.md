# Module Tích hợp Website Forms → Tín hiệu & Cơ hội

Kết quả: Admin thêm Website → Base cấp Website ID + khóa riêng → plugin WordPress gọi API đăng ký Form và gửi submission → Admin khớp trường theo từng Form/nhóm → bật đồng bộ → khách gửi Form → tín hiệu tự xuất hiện ở trạng thái "Chờ nhận", chạy tiếp đúng quy trình Sale/Zalo/KPI hiện có. Tận dụng toàn bộ Kho nguồn, Kho sản phẩm, Kho nhóm nhu cầu và quy trình tín hiệu hiện tại — không tạo hệ thống lead song song.

Kiến trúc bám sát module Facebook Lead Ads đang chạy ổn định (bảng riêng `wf_*`, RPC SECURITY DEFINER, xử lý có lease, chống trùng bằng ràng buộc DB), nhưng khác biệt cốt lõi: WordPress **chủ động đẩy** dữ liệu sang Base (server-to-server, ký HMAC), Base không cần quét website.

## 1. Database (migration mới `website_forms_phase1`)

- `wf_websites`: id (uuid, chính là Website ID), name, domain, source (nguồn từ Kho nguồn), status (active/revoked), created_by, timestamps.
- `wf_keys`: website_id, key_hash (SHA-256), key_prefix (8 ký tự đầu để nhận diện), created_at, revoked_at. Chỉ service_role đọc; khóa thật hiển thị đúng 1 lần lúc tạo/đổi khóa. Thu hồi/đổi khóa độc lập từng website.
- `wf_forms`: website_id + form_id (plugin gửi, cố định), variant (nhóm nhu cầu/biến thể, có thể null), name, schema jsonb (danh sách trường: key, label, type, options), schema_hash, mapping jsonb, enabled (mặc định Tắt), enabled_at, needs_review, checked_at. Unique (website_id, form_id, variant).
- `wf_events`: id, website_id, form_id, variant, submission_id, payload jsonb, page_url, sent_at, received_at, status (pending/success/failed/skipped/duplicate/needs_action), error, attempts, signal_id, processed_at, next_retry_at, lease_token/lease_until. Unique (website_id, submission_id) — chống trùng ở tầng DB.
- GRANT + RLS: client chỉ SELECT qua policy kiểm quyền `integration.website_forms`; mọi ghi qua RPC SECURITY DEFINER / server function. `wf_keys` không có policy cho client.
- RPC `wf_complete_event` (SECURITY DEFINER, mirror `fbl_complete_event`): khóa dòng, kiểm lease, kiểm Form đang bật + nguồn còn khớp, insert `opportunity_signals` (created_by = tài khoản hệ thống `00000000-0000-0000-0000-00000000eb01`, status chờ nhận, chưa phân công), cập nhật event, đánh thức Zalo qua `net.http_post` như FBL. Trigger thông báo "tín hiệu mới chưa phân công" hiện có tự chạy — không gửi trùng.
- RPC `wf_can_manage()` (SECURITY DEFINER): Super Admin hoặc quyền `integration.website_forms`.

## 2. API công khai cho plugin WordPress — `src/routes/api/public/wf/*`

Xác thực chung mọi endpoint: header `x-wf-website` (Website ID), `x-wf-timestamp`, `x-wf-signature` = HMAC-SHA256(secret, `timestamp + "." + rawBody`). Kiểm: website tồn tại & active, khóa chưa thu hồi (so hash), timestamp lệch ≤ 5 phút (chống phát lại), chữ ký khớp (timing-safe). Payload ≤ 256 KB. Giới hạn tần suất: tối đa 60 request/phút/website (đếm trong DB), vượt → 429. Plugin không bao giờ tự chỉ định nguồn hay Sale.

- `POST /api/public/wf/ping` — kiểm tra kết nối; trả tên website, trạng thái, số Form đang bật.
- `POST /api/public/wf/register-forms` — plugin gửi danh sách Form + schema trường. Base upsert (không xóa mapping hợp lệ khi schema đổi; nếu trường đang dùng biến mất → `needs_review=true` + tự tắt), Form mới mặc định Tắt.
- `POST /api/public/wf/submit` — nhận submission: lưu event bền vững trước (upsert theo website_id+submission_id), rồi xử lý ngay trong cùng request (áp mapping → tạo tín hiệu). Response phân biệt rõ: `accepted` (đã tạo tín hiệu), `duplicate`, `form_disabled` (chỉ ghi metadata, không lưu dữ liệu cá nhân), `mapping_invalid` / `needs_action`, `retry_later` (lỗi tạm, plugin nên gửi lại), 401 khóa sai, 429 quá tần suất. Không trả thành công giả.

## 3. Ánh xạ trường — `src/lib/webForms/mapping.ts`

7 trường Base giống FBL (Khách hàng, SĐT, Địa chỉ, Sản phẩm, Nhóm nhu cầu, Chi tiết nhu cầu, Ghi chú Marketing). 4 chế độ mỗi trường:
1. **Lấy từ Website** — chọn trường theo key ổn định (không theo label); trường lựa chọn có mapping đáp án → giá trị danh mục Base.
2. **Mặc định** — text cố định hoặc giá trị từ Kho sản phẩm / Kho nhóm nhu cầu (đọc từ DB, không hardcode).
3. **Để trống** — tuân thủ validation: thiếu trường bắt buộc (Khách hàng, SĐT) → event `needs_action`, không tạo tín hiệu sai.
4. **Ghép nhiều trường** (mới so với FBL) — chọn nhiều trường, sắp thứ tự, mỗi dòng "Nhãn: trả lời", tự bỏ trường rỗng.

Tự gợi ý mapping (name/full_name→Khách hàng, phone/mobile→SĐT, address→Địa chỉ, message/note→Chi tiết). Nút sao chép mapping từ Form khác có kiểm tra trường tồn tại ở Form đích. Form có nhiều nhóm: mỗi nhóm cấu hình riêng; nhóm chưa cấu hình kế thừa mapping Form chính. Ngày phát hiện tự động (giờ VN), Nguồn lấy từ Website (không tin payload), Sale để trống.

## 4. Giao diện — Cài đặt → tab "Tích hợp Marketing · Website Forms"

Thống nhất với tab Facebook Lead Ads (`WebFormsSettings.tsx`, quyền `integration.website_forms`):
- Danh sách Website: tên, domain, Website ID, trạng thái, nguồn, số Form phát hiện/đang bật, kết nối & đồng bộ gần nhất.
- Thêm Website (tên + domain + nguồn từ Kho nguồn) → hiển thị khóa đúng 1 lần kèm hướng dẫn cấu hình plugin; nút Đổi khóa / Thu hồi khóa / Kiểm tra kết nối / Đổi nguồn (chỉ ảnh hưởng tín hiệu tạo sau).
- Danh sách Form/nhóm theo Website: công tắc đồng bộ (chỉ bật khi website active + đã chọn nguồn + mapping hợp lệ), nút cấu hình mapping, website 1 Form tự mở cấu hình.
- Tab Lịch sử: lọc Website/Form/trạng thái/thời gian, link mở tín hiệu, nút Thử lại, URL nguồn, 4 số liệu tổng quan.

## 5. Quyền & tài khoản hệ thống

- Quyền mới `integration.website_forms` trong nhóm "Tích hợp Marketing" (auth.ts + DB); Super Admin luôn có, không cấp mặc định cho role khác. Kiểm cả UI lẫn máy chủ.
- Tài khoản hệ thống "Tích hợp Website" (uuid `…eb01`) làm created_by — không phải nhân viên.

## 6. Kiểm thử & bàn giao

- Test: HMAC/chống phát lại, idempotency (gửi lại cùng submission_id), mapping 4 chế độ + ghép trường + mapping danh mục, schema đổi không mất mapping, Form tắt không lưu dữ liệu cá nhân, rate limit.
- Tài liệu API thật sau triển khai: `docs/website-forms-api.md` (endpoint, hợp đồng request/response JSON mẫu, cơ chế ký, hướng dẫn nâng cấp plugin WordPress Báo giá Sứ Việt) + tóm tắt trong chat.

## Không làm (đúng phạm vi)

Không sửa plugin WordPress, không động vào Facebook Lead Ads, không tạo dữ liệu khách giả trong production, không dashboard marketing riêng, không tự nhập submission cũ khi bật Form.

## Chi tiết kỹ thuật

- Server routes workerd-safe: chỉ Web Crypto (HMAC/SHA-256), không Node crypto; đọc `process.env` trong handler.
- Xử lý submit đồng bộ trong request (không phụ thuộc cron); lỗi tạm → `retry_later` + event pending, nút Thử lại trong Lịch sử.
- Khóa website: sinh 32 bytes ngẫu nhiên (base64url), lưu SHA-256 hash; định dạng `wf_<prefix>_<secret>`.
