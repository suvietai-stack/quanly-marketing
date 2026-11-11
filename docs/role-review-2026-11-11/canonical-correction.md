# Đính chính Role chuẩn mới — 13:08 UTC

Tài liệu này thay thế đề xuất giảm quyền trên Role cũ trong `report.md`, `diff-25.md` và `impact-25.json`. Những tài liệu trước là lịch sử review, không phải danh sách được phép áp.

## Đã code
- 20 Role vị trí MỚI, 5 nhiệm vụ Marketing MỚI với ID canonical riêng; các cấp Điều hành, Giám đốc, Trưởng phòng, Trưởng nhóm và nhân viên tách biệt, không dùng Viewer cũ.
- Bộ lọc Role chuẩn mới / Legacy trong chính kho hiện có. `catalog_state=standard` không xác định canonical; cần ID/key audit. Mọi Role cũ, quyền/direct links/legacy links giữ nguyên.
- Ma trận soạn Role mới theo backend editor policy, không mở rộng mặc định. Soạn/hủy không ghi dữ liệu; nút lưu canonical khóa tới khi server contract được cập nhật/kiểm chứng.
- Dropdown mapping/thay Role ô chỉ nhận canonical vị trí, không nhận Legacy hay task Marketing. Bỏ fallback tự lấy Role từ title legacy.
- Mapping draft đối chiếu ID chức danh + đúng đơn vị của mapping đã audit. Generic Giám Đốc/Trưởng Phòng/Trưởng Nhóm không đoán; không lấy tên đơn vị thay bằng chứng nguồn. Mỗi assignment chọn ô riêng; apply vẫn qua snapshot/preview org_change đang có.

## Hiện trạng — CHƯA hoàn tất
- Live read-only 13:12 UTC: **33 Role cũ, 0 canonical Role, 0 slots, 86 assignments**. Không phải 85 như bằng chứng trước.
- Snapshot bảng bàn giao có 86 nguồn: 18 có đề xuất theo title/unit; **68 ngoại lệ** (bao gồm lịch sử/nguồn không có title/generic). Không phải 68 nhân viên đang hiệu lực.
- Bảng `canonical-mapping.md/json` liệt kê từng Role mới, đơn vị/người/ngoại lệ. **0 slots đã gắn live**, không tuyên bố quyền bổ nhiệm mới đã chạy thực tế.
- Native quyền quản lý CRM/3K/Tài chính vẫn có gates riêng; 4–12 quyền nền của Role vị trí không phải bộ đủ để thay quyền làm việc cũ. Không cutover trước permission impact từng người và scope.

## SQL pending / phục hồi
- `0372_marketing_task_role_is_source.sql` và preflight cũ đã **fail-closed**, không được chạy: thiết kế cũ yêu cầu giảm quyền task cũ trái đính chính. Giữ logic trong fixture lịch sử để hồi quy, không dùng làm migration deploy.
- `0373_canonical_role_creation.sql` chỉ mở explicit canonical ID/kind trong Role preview/apply hiện có; không tự tạo 25 rows, không sửa old Role/assignments/links. 0373 chưa đăng ký/apply; 0372 chưa được sử dụng.
- Exact backup Role writer live: `docs/rollback/2026-11-11-canonical-role-create.sql`; MD5 live `6b280f65642662037a0e45dd2818f60f`, SHA256 rollback `4895ee924d806ea0f665dbbaef9afa99a04a664c77f74598d3d11d8b59f16fb7`. File chỉ phục hồi function, không xóa Role mới/slots. Cần snapshot mới trước apply.
- Canonical create + slot/person thật trong PGlite qua migration 0359 và pending 0373; rollback function cũ rồi forward lại đạt. Test không thay thế full live migration set/concurrency.
- **Marketing canonical specialty binding chưa hoàn tất**: cần preview old-specialty → canonical-task Role theo stable specialty IDs mà không ghi đè old role_id/history; resolver/provenance/signature phải đọc cùng mapping. Ngọc chưa được sửa live. Không áp 0372 cũ để bật Content 90 quyền.

## Kiểm chứng
- 67 tests / 8 files: canonical ID/kind, old rows giữ nguyên, slot một Role/một người, kiêm nhiệm/thu hồi nguồn và unit isolation, legacy Marketing fixture, personal/cache. Canonical Marketing binding mới chưa có end-to-end test.
- Typecheck exit 0; harness build OK. Preview 25 nút soạn Role mới, desktop/mobile không tràn ngang/pageerror, đổi tab không đọc lại effective access.
- CRM/3K/Signals không RPC lỗi trong 10 giây quan sát mỗi trang; counts/page Signals 200.
- 0371 Signals SHA256 vẫn `daf9beaa6b229add4865662c91e1216a328af35cab3b05bb3d80a91514619136`; không đổi SQL Tín hiệu, không Publish.

## Xung đột thực cần Admin chọn
1. Generic Trưởng Nhóm/Trưởng Phòng/Giám Đốc: đơn vị/cấp trách nhiệm nào, đúng Role canonical nào; không dùng Role nhân viên/Viewer.
2. Nguồn thiếu title, nguồn trùng một người/title/unit và các khoảng hiệu lực: giữ nguyên cho đến khi chọn nguồn cần bind; không tự end/cancel.
3. Vị trí system Nhân sự mới/Đóng hàng không thay Role cũ, không gán vào ô thông thường qua preset.

Không cần duyệt lại nguyên tắc Role mới. Chưa có đủ mapping/permission diff/Marketing binding/rollback dữ liệu để ghi hàng loạt hoặc tuyên bố hoàn tất.