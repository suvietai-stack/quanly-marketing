# Nối Role V2 với phạm vi Kinh doanh — bản thử, SQL chưa áp

## Thiết kế đã chốt
- Tái sử dụng ánh xạ `org_units.source/source_id` hiện có: 3 hệ, 4 phòng, 0 nhóm. Không thêm bảng ánh xạ hay nguồn phân quyền song song.
- Role của chính bổ nhiệm cấp hành động; đơn vị của cùng bổ nhiệm giới hạn own/team/phòng/hệ/khối. Kiêm nhiệm hợp nguồn, không ghép quyền nguồn A với phạm vi B.
- Giữ DENY, trạng thái hoạt động, mốc reset, lịch sử phân phòng/nhóm và bước duyệt. Không tự tái cấp bổ nhiệm cũ.
- SQL PENDING có bản sao đầy đủ cổng hiện tại, checksum/preflight, rollback; không chạy lại 0379–0382.
- Chỉ mở các quyền thực sự có cổng phạm vi được kiểm thử; quyền quản trị toàn cục và quyền Kế hoạch không có quy trình duyệt vẫn khóa. Preset Sales tối giản, không tự thêm duyệt hoặc xem toàn Khối.

## Kiểm chứng
PGlite thực thi chính SQL pending với phiên restricted, kiểm tra RLS/RPC, nhiều người/vị trí, kiêm nhiệm, DENY, thu hồi, reset, nguồn sai/ngoài phạm vi và rollback. Hồi quy Marketing/cache/CRM/3K/Tín hiệu. Preview chỉ đọc desktop/iPad/mobile.

## Giới hạn
Không áp SQL, sửa dữ liệu nghiệp vụ, xóa Role/liên kết cũ hoặc Publish. Chưa coi fixture là E2E nhân viên live. Áp cổng quyền và thay Role thật là hai bước riêng, cần diff từng người và audited preview/apply trước khi cutover.
