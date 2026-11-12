# Quyền Kinh doanh qua Role V2 — 12/11/2026

## Trạng thái
- Live chưa đổi: 25 Role V2, 31 Role cũ, 16 vị trí đã gắn Role, 25 ô cũ, 86 bổ nhiệm, 17 liên kết cũ, `biz_can` md5 `f6eda4b5951bc99ff315f7d2862c9559`.
- SQL đề xuất: `docs/pending/biz_role_source.sql`. Không áp, không ghi dữ liệu nghiệp vụ, không chỉnh 0371.
- Bản sao 14 cổng hiện hành: `live-functions.sql`; checksum: `live-checksums.json`; khôi phục: `rollback.sql`.

## Mô hình
- Ánh xạ có sẵn qua `org_units.source/source_id`: Khối `biz-block`, 3 Hệ, 4 Phòng; chưa có Nhóm thật.
- Role V2 cấp hành động; đơn vị của chính bổ nhiệm cấp phạm vi. Không dùng `position_can(..., NULL)` làm quyền xem dữ liệu.
- Cùng một nguồn phải chứa cả quyền và phạm vi. DENY, tài khoản hoạt động, mốc reset, hiệu lực bổ nhiệm và bước duyệt vẫn bắt buộc.
- Không đổi `biz_scope_ok`, `biz_participant`, `biz_all_scope` vì CRM/3K dùng chung.

## Kiểm thử
- 12 PGlite dùng định nghĩa live của 6 cổng thay thế: nhân viên chỉ của mình, Trưởng nhóm không thấy nhóm khác, Trưởng phòng đúng phòng, Giám đốc đúng hệ, ngoài phạm vi bị chặn, bỏ quyền Role làm RLS mất dòng, DENY thắng, hết hạn/tương lai/khóa bị chặn, kiêm nhiệm không mượn quyền, nguồn reset/legacy/mapping sai bị chặn, rollback + apply lại.
- Hồi quy: 342/342 sau sửa test kỳ vọng preset; Preview read-only desktop/iPad/mobile không page error, alert hay tràn ngang. Ảnh mobile `/organization` sau 11 giây vẫn đang tải nên chưa coi là nghiệm thu.

## Chặn áp live
1. Cần duyệt migration DDL qua công cụ `lov_database--migration`, dùng nguyên SQL pending.
2. Trước mở ô chọn hoặc preset live: nối các RPC nộp KR/Kế hoạch/Báo cáo với đơn vị đích, sau đó diff từng người, audited preview/apply và test phiên nhân viên thật.
3. Hiện tác động live của cổng: 0 quyền Biz V2 mới, vì 4 Role Sales chưa chứa các key `biz.*` mới và ma trận vẫn khóa chúng.