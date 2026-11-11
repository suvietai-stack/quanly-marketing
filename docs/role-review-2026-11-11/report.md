# Chuẩn hóa Role — bản nháp 11/11/2026

## Đã code, chưa áp dụng live
- Kho Role hiện có thêm bảng so sánh đủ 20 vị trí + 5 nhiệm vụ và nút mở bản nháp tối giản. Từng Role có giữ/bỏ/thêm, người nhận distinct và nguồn. Checkbox vẫn chỉnh được; không tự lưu/seed và không thêm editor/resolver mới.
- Content Web 90→7, SEO 95→3, Local SEO 46→4, Social 49→7, Video 82→6. Admin/Super Admin không có preset áp dụng. Nhân sự mới giữ 4, Đóng hàng giữ 10; hai vị trí is_system không sửa.
- Diff chi tiết: `diff-25.md`, dữ liệu máy đọc: `impact-25.json`. Scope lấy từ policy live: cá nhân/được giao/xem đơn vị của nguồn bổ nhiệm; catalog_pending không được coi là quyền thực tế.
- Pending Marketing chuyển 0371→0372, số mới chưa dùng tại thời điểm audit. Không đăng ký/áp migration quyền. SHA256 migration Tín hiệu 0371 trước/sau đều `daf9beaa6b229add4865662c91e1216a328af35cab3b05bb3d80a91514619136`.
- SQL pending sửa eligibility cả legacy, specialty, appointment, central rules và direct fallback; dedupe specialty/appointment; không lọc prefix module. Role vẫn là nguồn permissions Admin chọn ∩ gate có sẵn. Provenance cùng điều kiện, không đếm task trùng.
- Preflight riêng đối chiếu hash sáu hàm và bắt buộc năm task Roles đã được giảm qua workflow audited trước khi mở lại nguồn. Không thể bật 90 quyền Content cũ bằng việc chạy preflight + forward patch đúng quy trình.

## Trạng thái live
**SQL quyền applied: NO. Role permissions changed: NO. Bổ nhiệm changed: NO. Publish: NO.**
Snapshot fresh có 33 Role, 86 phân công (không phải 85 như lần trước), 0 ô. Khác biệt số phân công là trạng thái live quan sát được; lượt này không viết nhân sự. Chưa thể nói Ngọc đã có quyền Content trên live. Ngọc trong fixture reset nhận content_view/outline_start sau safe SQL và bộ 7 quyền, người ngoài Marketing bị chặn; đây không thay thế nghiệm thu nhân viên live.

## Backup và rollback
- `docs/backup/role-review-2026-11-11/snapshot.json`: nguyên Role, liên kết chức danh và phân công tại lúc đọc.
- `functions.sql`, `function-hashes.json`, `source-and-triggers.json`, `has-permission.sql`: định nghĩa live cũ và trigger bảo vệ/signature.
- `docs/rollback/2026-11-11-role-marketing.sql`: sáu định nghĩa cũ, transaction; không phục hồi dữ liệu hoặc thay Role.
- Phục hồi permissions sau đợt chuẩn hóa: dùng đúng Role IDs/permissions/scope trong snapshot, tạo preview từng Role qua `role_catalog_change`, xác nhận lý do khôi phục rồi apply. Không UPDATE thẳng; trigger hiện hữu đồng bộ enabled_permissions/chữ ký assignment và audit. Snapshot chỉ là bản chụp của lượt này: trước apply thật cần chụp mới và kiểm tra concurrent edits.
- PGlite chạy forward thật, restore định nghĩa live thật, forward lại; xác nhận quyền reset cũ chặn rồi quyền mới mở và Role rows không đổi. Preflight hash live là hàng rào production; không coi fixture là đối chiếu hash live sau thay đổi tương lai.

## Ô vị trí và archived
- `slot-dry-run.md`: mapping từng chức danh, thiếu chức danh, nhiều người cùng title/unit, ID nguồn; năm nhóm có title đang nhiều người phải tách ô. Membership thiếu title không tự đoán Role; có nguồn trùng cùng người/đơn vị cần Owner chọn nguồn chuẩn.
- Giữ luồng slot+bind_slot qua org_change; không end/cancel, không đổi thời gian lịch sử. Slot có một Role/một người, kiêm nhiệm nhiều ô đã có tests. Chưa apply mapping live; giao dịch concurrent hai kết nối/restore branch thay Role chưa nghiệm thu.
- Sáu archived: 0 direct/title/slot/specialty hiện tại; vẫn có tham chiếu RPC `standard_role_catalog_setup`, `standard_role_catalog_consolidate`, `final_permission_account` tùy Role. Bốn Role legacy Kế toán/Designer/Leader Marketing/Cung ứng mỗi Role có 6 sự kiện lịch sử title; hai team archived chưa thấy sự kiện title/account trong truy vấn này. Code vận hành không thấy ID ngoài tests; SQL lịch sử vẫn tham chiếu. Không DELETE bất kỳ Role nào. Zero reference hiện tại không đủ quyết định xóa.

## Kiểm thử và Preview
- 46 files / 409 tests đạt (Role, slots, personal scope, Signals, access cache); lượt mới cuối Marketing 16 tests gồm actual has_permission, A/B additive, locked user, Super Admin và rollback/forward thật.
- 9 files / 96 tests đạt (CRM, 3K, Auth và Marketing; có tests trùng lượt trên). Một lượt chạy quá nhiều PGlite đồng thời bị hook timeout; chạy lại tối đa 4 workers đạt toàn bộ, không sửa Tín hiệu để né lỗi.
- `oj typecheck -b --noEmit` exit 0; harness build OK. Không chạy build thủ công.
- Preview phiên Super Admin: 25 gợi ý, 23 nút draft sửa được, 2 protected; Content draft 7 selected, bỏ 83. Desktop và điện thoại 390px không tràn ngang, không pageerror. Mở và hủy draft không lưu/preview RPC ghi dữ liệu.
- Chuyển Hồ sơ↔Role không gọi lại base_permissions_effective/biz_effective_access trong cửa sổ quan sát. Không sửa cache đã có.
- Smoke CRM/3K/Signals: không RPC >=400 trong cửa sổ 10 giây mỗi trang; Signals counts/page HTTP 200. Không coi thời gian cửa sổ là tốc độ tải chính xác và không đo quyền nhân viên scope-limited live.

## Owner cần chốt trước production
1. Duyệt diff cụ thể 23 Role thường; giữ nguyên bốn system/protected. Bộ vị trí tối giản hiện chỉ nền cá nhân/xem đơn vị đã kiểm chứng: bỏ nghiệp vụ CRM/3K/Tài chính/Hỏi giá có thể làm giảm chức năng người đang dùng. Cần chọn quyền thiết yếu giữ lại qua checklist trước apply; không tuyên bố bộ nền thay thế đầy đủ các nghiệp vụ đó.
2. Duyệt năm task minima (7/3/4/7/6) trước SQL 0372. Nếu Admin muốn cross-module đã verified, cập nhật diff và guard preflight tương ứng; resolver không cấm prefix.
3. Duyệt safe SQL sáu hàm cùng backup/checksum/rollback mới; không apply từ lượt này. Sau apply phải kiểm tra quyền Ngọc bằng phiên được ủy quyền, ngoài Marketing, hết bổ nhiệm, task union và tốc độ.
4. Chốt mapping nguồn thiếu title/trùng, tách ô và giữ lịch sử trong dry-run. Không bổ nhiệm người thật tự động.
5. Giữ sáu archived nguyên trạng; nếu muốn dọn vật lý cần audit snapshot/private lịch sử rộng hơn và duyệt danh sách xóa riêng. Publish giao diện chỉ sau phê duyệt và nghiệm thu live phù hợp.

**Chưa READY production cutover:** thiếu duyệt diff/mapping, nghiệm thu nhân viên live, concurrency/restore slot và các hợp đồng native nghiệp vụ quản lý. Đã có code draft và chứng minh Marketing P0 trong SQL fixture, không còn chỉ là plan.