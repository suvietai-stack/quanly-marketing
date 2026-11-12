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
## Tiếp tục 01:37–01:53 UTC — chủ đã chốt triển khai
- Kế thừa duy nhất `docs/pending/biz_role_source.sql`, không gửi lại 0379–0382. Không migration mới applied trong lượt này.
- Đã sửa vòng lặp ALLOW: nguồn đọc trực tiếp binding V2 + bổ nhiệm; base_rules chỉ đọc DENY. Reset kiểm tại nguồn, không dùng legacy gate để loại bổ nhiệm org mới hợp lệ.
- Thêm target authorization vào 4 RPC thật `biz_goal_start/save`, `biz_document_start/save`; giữ nguyên validation, revision, deadline, first-official và nhật ký. Dashboard đọc theo nguồn từng row, lịch sử duyệt qua cùng scope; cache next_change tính cả org starts/ends.
- 19 PGlite integration đạt: RLS restricted-user, own/team/dept/system, nhiều người/vị trí, kiêm nhiệm, grant/revoke, DENY/reset, lưu KR thật+audit, từ chối goal/report ngoài phòng, readiness và rollback forward-reapply.
- Fixture cấu trúc live 23 active/86 bổ nhiệm/16 bindings đã ẩn danh: 0 nguồn quyền Biz mới trước chỉnh Role; thử thêm view_dept cho sales-head trên clone có tác dụng đúng phòng, không phòng khác. Đây KHÔNG phải full effective-access diff live: tool read-query không có EXECUTE biz_can/base_rules, không nâng ACL để vòng qua.
- Stage readiness `biz_role_source_readiness.sql` giữ PENDING: chỉ 9 key đã nối; không mở dashboard_public (RPC hiện tổng hợp toàn Khối), view_all, plan_approve và 5 key cấu hình chưa đủ target-scope. Không tự mở cả 17.
- Bốn Sales presets đã có nháp tối giản; UI mới “Thử bổ sung quyền Kinh doanh” chỉ additive + policy-ready, không gỡ CRM/Signals/finance và không tự apply. 12 unit tests preset đạt.
- Bộ hồi quy 36 files/352 tests đạt sau giảm workers=2 (lần đầu concurrent quá tải làm 3 hooks timeout). Lần cuối sau toàn bộ chỉnh sửa: 36 files/354 tests đạt.
- Browser admin mở /biz, /biz/crm, /biz/3k, /signals không lỗi trang/tràn ngang, chờ cố định 14 giây (không coi là TTI benchmark). Organization desktop có sơ đồ; mobile ảnh đầu còn loading nên KHÔNG nghiệm thu. Lần kiểm editor sau 45 giây trả `canceling statement due to statement timeout`; chưa kiểm được nút mới trong dialog thật.
- Snapshot integration/sibling function definitions MD5 verified; rollback chỉ thay những hàm đã sửa, không viết lại shared CRM/K3 helpers. Build harness mới nhất OK.

### Blockers thực tế trước apply
1. Hoàn thiện và nghiệm thu các đường published dashboard, cấu hình quản trị còn 8 key chưa hỗ trợ; không thể mở giả 17/17.
2. Đối chiếu effective trước/sau từng tài khoản thật và workflow pending (không chỉ fixture), đủ phiên scoped và E2E nộp/duyệt/rollback. Hiện có phiên Super Admin, chưa có phiên scoped được cấp.
3. Lỗi statement timeout organization cản đọc catalog/preview impact trên UI. Không restart hoặc tăng quyền query để vòng qua.
4. Chỉ khi các mục trên đạt mới gọi `lov_database--migration` với SQL candidate; nếu tool yêu cầu duyệt riêng sẽ dừng đúng card. Hiện CHƯA gọi tool, không có card chờ duyệt và không báo là “đang chờ duyệt migration”.
5. Không xóa 31 legacy Roles/17 title links, không sửa Signals 0371 hoặc dữ liệu nghiệp vụ, không Publish.
