# Website Forms → Base Marketing — Tài liệu API cho plugin WordPress

Tài liệu này dành cho bên phát triển plugin WordPress gửi dữ liệu Form về Base Marketing. Không cần biết nội bộ Base; chỉ cần 3 endpoint, Website ID và khóa kết nối do Base cấp.

## 1. Thông tin kết nối

Base cấp cho mỗi Website:

| Thông tin | Ví dụ | Ghi chú |
|---|---|---|
| Website ID | `550e8400-e29b-41d4-a716-446655440000` | UUID, không bí mật |
| Khóa kết nối | `wf_AbCdEfGh_<43 ký tự ngẫu nhiên>` | **Bí mật** — chỉ hiển thị 1 lần khi tạo/đổi khóa |
| Endpoint Ping | `https://base.suviet.vn/api/public/wf/ping` | Kiểm tra kết nối |
| Endpoint Đăng ký Form | `https://base.suviet.vn/api/public/wf/register-forms` | Gửi cấu trúc Form |
| Endpoint Gửi submission | `https://base.suviet.vn/api/public/wf/submit` | Gửi dữ liệu khách gửi Form |

## 2. Xác thực (bắt buộc mọi request)

Mọi request là `POST` + `Content-Type: application/json`, kèm 3 header:

| Header | Nội dung |
|---|---|
| `x-wf-website` | Website ID |
| `x-wf-timestamp` | Thời điểm gửi, mili-giây Unix (ví dụ `1761448800000`). Lệch quá ±5 phút so với máy chủ Base sẽ bị từ chối — đồng bộ giờ máy chủ web qua NTP. |
| `x-wf-signature` | `HMAC_SHA256(khóa, timestamp + "." + thân_request_nguyên_văn)`, dạng hex thường 64 ký tự |

Ví dụ PHP:

```php
$body = json_encode($payload, JSON_UNESCAPED_UNICODE);
$ts   = (string) round(microtime(true) * 1000);
$sig  = hash_hmac('sha256', $ts . '.' . $body, WF_SECRET_KEY);
wp_remote_post('https://base.suviet.vn/api/public/wf/submit', [
  'headers' => [
    'Content-Type'    => 'application/json',
    'x-wf-website'    => WF_WEBSITE_ID,
    'x-wf-timestamp'  => $ts,
    'x-wf-signature'  => $sig,
  ],
  'body' => $body, 'timeout' => 15,
]);
```

**Lưu ý bảo mật:**
- Khóa chỉ tồn tại trong cấu hình PHP phía máy chủ (wp-config / option mã hóa). Không bao giờ đưa khóa ra JavaScript, HTML hay phía trình duyệt.
- Không ký lại request cũ để gửi lặp: Base chống replay bằng timestamp ±5 phút và chống trùng bằng `submission_id`.
- Giới hạn tần suất: **60 request/phút/Website**. Vượt quá nhận HTTP 429 — giảm tần suất và thử lại sau ít nhất 60 giây.
- Thân request tối đa **256 KB**.

## 3. Ping — kiểm tra kết nối

`POST /api/public/wf/ping` — thân có thể rỗng `{}`.

Phản hồi 200:

```json
{ "ok": true, "code": "connected", "website": { "id": "…", "name": "…", "domain": "…" }, "forms_enabled": 2, "server_time": "2026-10-26T02:00:00.000Z" }
```

## 4. Đăng ký Form

`POST /api/public/wf/register-forms` — gọi khi plugin khởi động, khi Form thay đổi cấu trúc, hoặc định kỳ (ví dụ mỗi giờ). Idempotent: gọi nhiều lần không gây hại.

```json
{
  "forms": [
    {
      "form_id": "contact-main",
      "variant": "",
      "name": "Form liên hệ trang chủ",
      "fields": [
        { "key": "name", "label": "Họ tên", "type": "text" },
        { "key": "phone", "label": "Số điện thoại", "type": "tel" },
        { "key": "product", "label": "Sản phẩm quan tâm", "type": "select",
          "options": [{ "value": "Gốm" }, { "value": "Sứ" }] },
        { "key": "message", "label": "Lời nhắn", "type": "textarea" }
      ]
    }
  ]
}
```

- `form_id`: khóa ổn định do plugin tự đặt (1–100 ký tự), không đổi giữa các lần gọi.
- `variant`: dùng khi cùng một Form có nhiều nhóm trường/biến thể cần cấu hình riêng (tối đa 100 ký tự, mặc định `""`). Form không khai báo variant sẽ **kế thừa cấu hình của Form chính** cùng `form_id`.
- `fields[].key`: khóa trường ổn định (chữ, số, `_`, `-`, `.`). `label` hiển thị trong Base. `options` chỉ cần với trường chọn (select/radio/checkbox).
- Tối đa 50 Form/lần gọi, 100 trường/Form.

Phản hồi 200: `{ "ok": true, "code": "registered", "added": 1, "updated": 0, "total": 1 }`

Form mới luôn ở trạng thái **Tắt** — Admin Base vào Cài đặt → Tích hợp Marketing · Website Forms để cấu hình ánh xạ rồi bật. Đổi cấu trúc Form không xóa cấu hình ánh xạ còn hợp lệ; nếu ánh xạ không còn hợp lệ, Form tự tắt và báo "Cần kiểm tra lại" trong Base.

## 5. Gửi submission

`POST /api/public/wf/submit` — gọi ngay khi khách gửi Form thành công.

```json
{
  "form_id": "contact-main",
  "variant": "",
  "submission_id": "cf7-12345",
  "sent_at": "2026-10-26T09:05:00+07:00",
  "page_url": "https://example.vn/lien-he",
  "data": {
    "name": "Nguyễn Văn A",
    "phone": "0912 345 678",
    "product": ["Gốm"],
    "message": "Cần báo giá 200 bộ"
  }
}
```

- `submission_id` (**bắt buộc, duy nhất trên mỗi Website**): plugin tự sinh ID duy nhất cho mỗi lần khách gửi (ví dụ ID bản ghi CF7/Fluent Forms hoặc UUID). Base dùng nó để chống trùng — gửi lại cùng `submission_id` không tạo tín hiệu thứ hai.
- `sent_at`: thời điểm khách gửi (ISO 8601 kèm múi giờ). Nếu thiếu, Base dùng thời điểm nhận.
- `data`: tối đa 100 trường; giá trị là chuỗi (≤5000 ký tự) hoặc mảng chuỗi (≤50 phần tử, mỗi phần tử ≤500 ký tự) cho trường nhiều lựa chọn.

### Mã phản hồi

| HTTP | `code` | Ý nghĩa | Plugin nên |
|---|---|---|---|
| 200 | `accepted` | Đã tạo tín hiệu trong Base | Ghi log thành công |
| 200 | `duplicate` | `submission_id` đã gửi trước đó | Không gửi lại nữa |
| 202 | `form_disabled` | Form chưa bật đồng bộ trong Base — Base chỉ lưu metadata, không lưu dữ liệu cá nhân | Không thử lại; chờ Admin bật |
| 422 | `mapping_invalid` | Cấu hình ánh xạ thiếu/sai — Admin Base phải sửa | Không thử lại liên tục; có thể thử lại sau khi Admin xác nhận đã sửa |
| 503 | `retry_later` | Lỗi tạm thời phía Base | Thử lại với backoff: 1, 2, 4, 8… phút, tối đa 10 lần |
| 401 | `unauthorized` / `stale_timestamp` / `bad_signature` / `key_revoked` / `website_inactive` | Sai khóa, sai chữ ký, lệch giờ, khóa bị thu hồi | Dừng gửi, báo quản trị website kiểm tra cấu hình |
| 429 | `rate_limited` | Quá 60 request/phút | Chờ ≥60 giây |
| 400 | `bad_json` / `invalid_payload` | Sai định dạng | Kiểm tra lại payload theo tài liệu này |
| 413 | `too_large` | Thân request > 256 KB | Rút gọn dữ liệu |

### Gửi lại khi lỗi mạng

Nếu không nhận được phản hồi (timeout, 5xx): thử lại với **cùng `submission_id`** theo backoff lũy tiến (1, 2, 4, 8… phút, tối đa 10 lần). Nhờ chống trùng theo `submission_id`, việc gửi lại không bao giờ tạo tín hiệu kép.

## 6. Dữ liệu Base tạo ra

Mỗi submission hợp lệ tạo một **Tín hiệu** trong module Tín hiệu & Cơ hội với trạng thái "Chờ phân công", chạy tiếp đúng quy trình Sale/Zalo/KPI hiện có. Trường nào của tín hiệu lấy từ trường nào của Form do Admin Base cấu hình (lấy từ Website / giá trị mặc định / ghép nhiều trường / để trống) — plugin chỉ cần gửi đúng `fields[].key` đã đăng ký.

Khi Form đang tắt, Base **không lưu dữ liệu cá nhân** của submission — chỉ lưu metadata (Form, thời gian, trạng thái) phục vụ thống kê.
