# Module Đơn hàng — Hỏi Giá & Tiến Độ (Đơn Sứ Quà Tặng)

Kế hoạch này cần bạn duyệt trước vì có thay đổi database (spec yêu cầu trình bày migration trước khi áp dụng). Không đổi Auth, KPI, OAuth/Webhook Zalo hay module khác; không tự Publish.

## Người dùng sẽ thấy
- Menu mới **ĐƠN HÀNG → Hỏi Giá & Tiến Độ** (hiện với ai có ít nhất một quyền của nhóm).
- 3 tab: Tất cả / Hỏi Giá / Hỏi Tiến Độ; nút **+ Tạo yêu cầu**; tìm & lọc theo tên, mã, loại đơn, trạng thái, người tạo, người phụ trách, khoảng thời gian. Desktop dạng bảng, điện thoại dạng thẻ.
- Form 4 bước (Thông tin đơn → Sản phẩm/phương án + ảnh → Chọn Hỏi Giá/Tiến Độ + hạng mục + người Cung ứng → Kiểm tra & gửi), có Quay lại / Tiếp tục / Lưu nháp / Gửi; giữ dữ liệu khi chuyển bước.
- Trang chi tiết 2 vùng: trái = đơn, sản phẩm, ảnh (phóng to, chú thích); phải = yêu cầu của Sale, phản hồi Cung ứng, nút xử lý, trao đổi, lịch sử. Nút chuyển nhanh giữa luồng -G và -T.
- Cung ứng: Xác nhận tiếp nhận → phản hồi từng sản phẩm (chỉ hạng mục Sale chọn), lưu nháp, công bố từng phương án (có phiên bản), tiến độ "Đã báo giá 2/3", Hoàn tất luồng (báo chính xác hạng mục còn thiếu), Yêu cầu bổ sung.
- Sale: trả lời bổ sung, hỏi lại (lượt mới, giữ kết quả cũ), đổi người phụ trách, đánh dấu phương án (Đang cân nhắc / Khách chọn / Không chọn), sao chép kết quả đã công bố, hủy yêu cầu hoặc hủy riêng một luồng.

## Phân quyền mới (nhóm "Đơn hàng — Hỏi Giá & Tiến Độ")
`oq.create`, `oq.view_own`, `oq.view_all`, `oq.accept`, `oq.reply_price`, `oq.reply_progress`, `oq.manage`. Kiểm tra tại backend; danh sách người Cung ứng chỉ gồm tài khoản đang hoạt động có quyền phản hồi tương ứng.

## Thông báo
Dùng lại thông báo Base + Zalo + Web Push hiện có (không đổi bộ gửi). 9 sự kiện theo spec; không gửi cho lưu nháp; nếu cùng một người xử lý cả hai luồng thì gộp tin ban đầu thành một. Link mở đúng yêu cầu + luồng, giữ link sau đăng nhập.

## Chi tiết kỹ thuật (migration)
Bảng mới (client chỉ SELECT theo RLS; mọi ghi đi qua RPC SECURITY DEFINER dùng `private.sig_can` + giờ máy chủ — cùng mẫu với module Đơn từ):
- `oq_requests` — yêu cầu gốc: mã `YC-0001` (sequence), `order_type` ('gift_ceramic', khóa sau khi gửi), tên, địa điểm, ngày giao, ghi chú, creator, status (draft/submitted/cancelled), `form_data jsonb` cho trường riêng từng loại đơn, drafted_at/submitted_at/cancelled_at.
- `oq_items` — sản phẩm/phương án: mã PA01…, `item_mode` (option = phương án thay thế / bundle = đặt đồng thời), tên, SL, ĐVT, chi tiết, gia công, ghi chú, lựa chọn khách.
- `oq_item_images` — ảnh theo sản phẩm: path trong bucket riêng tư `order-quotes`, loại ảnh, chú thích. Storage policy chỉ cho người có quyền xem yêu cầu đó đọc ảnh; kiểm tra định dạng ảnh + ≤10 MB.
- `oq_flows` — luồng `YC-0001-G` / `-T`: kind (price/progress), assignee, status (pending/processing/answered/cancelled), sub-status chờ Sale bổ sung, lượt hiện tại, kết luận chung (tiến độ).
- `oq_rounds` — lượt xử lý: số lượt, nội dung yêu cầu, **ảnh chụp thông tin sản phẩm tại lúc hỏi** (jsonb, để sửa SL sau không làm sai báo giá cũ), hạng mục giá được chọn + ghi chú từng hạng mục, cách hỏi vận chuyển (riêng/chung/tổ hợp), loại kiểm tra tiến độ, mã đơn cũ; mọi mốc thời gian của lượt.
- `oq_responses` — phản hồi theo lượt × sản phẩm (hoặc nhóm vận chuyển chung), `version`, `is_published`, nội dung văn bản theo hạng mục, người/thời điểm công bố. Bản đã công bố không sửa được, chỉ tạo phiên bản mới.
- `oq_info_requests` — mỗi lần yêu cầu bổ sung: nội dung, câu trả lời, bắt đầu/kết thúc chờ.
- `oq_events` — nhật ký bất biến (request/flow/item/round, loại sự kiện, người, thời điểm, trạng thái trước/sau, payload) đủ để sau này tính các loại thời gian; không cho sửa/xóa.
- `oq_messages` — trao đổi trong luồng.
- RPC: `oq_save_draft`, `oq_submit` (tạo luồng + lượt 1), `oq_accept`, `oq_save_response`, `oq_publish_response`, `oq_complete_flow`, `oq_request_info`, `oq_answer_info`, `oq_reask`, `oq_reassign`, `oq_set_choice`, `oq_cancel_request`, `oq_cancel_flow`, `oq_post_message`, `oq_assignees(kind)`.
- Trigger `oq_notify` tạo thông báo (dedup_key theo sự kiện + luồng + lượt + người nhận); kiểm người nhận hiện tại trước khi gửi Zalo/Push (như Content/Order).
- Frontend: `src/routes/order-quotes.index.tsx`, `order-quotes.$id.tsx`, `order-quotes.new.tsx`; `src/lib/orderQuotes/*` (api, logic kiểm tra thiếu hạng mục + test); `src/components/orderQuotes/*`; thêm nhóm menu và quyền.

## Kiểm thử
Unit test logic (thiếu hạng mục, tiến độ x/y, phương án không cộng SL, phiên bản). Chạy 22 kịch bản spec bằng RPC trong transaction rollback nơi có thể; kiểm giao diện desktop/mobile bằng trình duyệt. Luồng thật hai tài khoản + Zalo/điện thoại thật cần bạn thử vì sẽ gửi tin thật.

## Chưa làm (theo spec)
Báo cáo, tổng tiền, MISA, sản xuất/giao hàng, loại đơn khác.
