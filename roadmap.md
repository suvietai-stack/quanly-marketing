# Roadmap — Role chuẩn và bổ nhiệm

## Chấp nhận mất quyền legacy — 15:05 UTC
- [ ] Fresh snapshot, pending approver check, policy/diff; apply 25 verified V2 defaults qua audited RPC.
- [ ] Bind Đức/Quỳnh Anh sang V2, chấp nhận legacy loss; giữ mọi membership/title/history và không tự bổ nhiệm lại Ngọc.
- [ ] HOÃN theo chủ dự án 15:26: retire title links/xóa legacy/slot migration chờ mô hình một vị trí nhiều người. Migration retirement bị hủy, không chạy.

## Quản trị Kinh doanh theo chức năng — 15:26 UTC
- [ ] Ma trận: một nhóm Quản trị Kinh doanh, 5 nhóm con theo key backend thật; CRM/3K/Tín hiệu/Hỏi giá riêng.
- [ ] Preset sales staff/team/head/director dùng key đã kiểm chứng; áp live chỉ khi backend nhận nguồn Role V2.
- [ ] Test matrix/preset/scope, build; không Publish, không đụng cơ cấu/0371.
- [ ] Test/read-back scoped sessions, cache, rollback/UI and publish only after full real E2E pass.

## Cutover an toàn được yêu cầu 14:49 UTC
- [x] Live snapshot/fingerprint + guarded serial RPC; giữ 0371. Phát hiện Ngọc miễn nhiệm ngoài lượt này lúc 14:50:39 UTC; không tự khôi phục.
- [x] 0376 exact audit restore + approver guard; NV Marketing bỏ 7 quyền nhạy cảm, 5 task Roles bỏ cross-domain excess (Content 20, SEO 3, Local 5, Social 6, Video 19) qua audited RPC. Full defaults chưa apply.
- [x] Hai preview slot riêng: Đức mất 16 quyền, Quỳnh Anh mất leave.export → dừng riêng hai nguồn; 12 membership không title giữ nguyên.
- [x] 0377 sửa task-edit signature sync chạm canonical assignments; 0378 equal-rights Design/Photography chuyển V2, effective 26 người không đổi. Xóa 2 legacy zero-ref (design-team/mkt-team), còn 31 legacy.
- [x] 140 regression tests + 6 cutover tests lượt cuối; rollback writer/signature và exact audit restore test, Preview 4 trang không alert; snapshot compact <10 MB. Báo docs/role-v2-cutover-2026-11-11/report.md. Không Publish.
- [ ] Full defaults/legacy-links/delete remaining: blocked by Đức/Quỳnh Anh decisions, Ngọc's concurrent dismissal, verified native CRM/Task scope and complete source replacement. Scoped employee live E2E not available this turn.

## Nghiệm thu tối giản V2 — 14:34 UTC 11/11/2026
- [x] Audit 25 Role live và 23 ô: 37 nguồn hiệu lực, 25 titled, 23 bound; 22 Role giảm đề xuất ảnh hưởng 18 người distinct. Chi tiết docs/role-v2-acceptance-2026-11-11/report.md.
- [x] Sửa 25 preset và ma trận trên draft; không union legacy, giữ desired rights đã admitted, policy-gate chỉ additions. Sensitive filter + system group + UI khóa reduction apply.
- [x] SQL guarded preview/apply PENDING, baseline/backup/hash/rollback proposals; test chặn pending approver ở preview lẫn apply. Không apply SQL hoặc quyền live.
- [x] 200 tests/18 files đạt; 25 authenticated edit previews, desktop/iPad zero overflow; CRM/3K/organization smoke không alert/pageerror. Build OK.
- [ ] Giảm live/cutover/xóa legacy/Publish: chờ quyết định Đức/Quỳnh Anh/Ngọc, restore exact sensitive snapshot được kiểm chứng và native scopes/policy cho CRM/Task. Fixture không thay employee live E2E; không thực hiện trong lượt này.

Các checklist cũ dưới đây là lịch sử, không phải chỉ thị mở hiện tại; trạng thái nghiệm thu mới phía trên thay thế số liệu/cách giải thích cũ.

## Đính chính 13:08 UTC — Role mới, không sửa Role cũ
- [x] Thay draft giảm quyền Role cũ bằng bộ canonical mới theo ID/key; Legacy riêng, dropdown gán mới loại legacy.
- [x] Mapping draft title + unit: 18/86 nguồn đề xuất, 68 ngoại lệ; slot-per-person qua preview, không viết live/cutover.
- [ ] Pending canonical creation và Marketing binding không sửa specialty/Role cũ; impact/rollback, end-to-end tests và Preview.
- [x] Bàn giao canonical Role → slot → người tại canonical-mapping.md; 0 gắn live. Giữ 0371 Tín hiệu.
- [ ] Canonical Marketing binding mới chưa code/kiểm chứng; 0372 cũ fail-closed. Chưa đủ preview source/signature/rollback để ghi shared database.
- [ ] Cutover/gắn live: chờ Admin chọn ngoại lệ title/unit/nguồn trùng và complete permission/source impact; không đổi quyền làm việc cũ.

## P0 Tín hiệu production timeout — ưu tiên trước Role, 11/11/2026
- [x] Tái hiện Preview/published với phiên được ủy quyền; counts/page timeout 8,4–9,1s, read id-only toàn tập cũng timeout; health/locks chỉ đọc.
- [x] Sửa token invalidation tối thiểu; chuẩn bị 3 SQL PENDING, không thay quyền/dữ liệu/restart/publish.
- [x] Test SQL/phân trang/filter/phạm vi; 187 hồi quy đạt và 12 test mới sau benchmark; 3 lần load desktop/iPad vẫn timeout, tab không refetch Tín hiệu; smoke CRM/3K/tổ chức OK trong cửa sổ quan sát.
- [x] Báo docs/signals-p0-2026-11-11.md, không tuyên bố live fixed.
- [x] Đã duyệt 12:25 UTC: backup/checksum + PGlite restore/forward thật, migration 0371 chỉ ba hàm áp atomically; 190 tests/build OK, số đếm/filter/8 sort/paging authenticated Super Admin đạt, checksums dữ liệu/Role không đổi.
- [x] Publish frontend đúng commit đã duyệt: bundle mới xác minh; 6 load cuối desktop/iPad qua hai địa chỉ đều 200/zero timeout, counts p50 827,5ms/page 1277ms; Lovable URL canonical về base.suviet.vn; không đổi Role/restart/reset.
- [ ] Nhân viên scope-limited LIVE: chưa có phiên được ủy quyền cho nhân viên trong lượt này; fixture own/team/slot/isolation đạt nhưng không thay thế nghiệm thu live. Không tự gán quyền hay chọn tài khoản.

## Chuẩn hóa toàn kho Role — yêu cầu chốt 11/11/2026
- [x] Tiếp tục 12:51 UTC: code đủ 25 preset/diff trong RoleCatalog, pending Marketing 0372, preflight/checksum, backup/rollback sáu hàm, dry-run mapping và audit archived; không đụng 0371, không áp quyền/bổ nhiệm/Publish. Report docs/role-review-2026-11-11/report.md.
- [x] 409 tests hồi quy + lượt cuối Marketing 16 tests và modules 96 tests; typecheck exit 0/build OK; Preview desktop/mobile Content 7 quyền, tab không tải lại quyền; CRM/3K/Signals không lỗi RPC.
- [ ] Owner duyệt diff/mapping/SQL quyền 0372; sau đó nghiệm thu nhân viên scope-limited live và concurrency/restore slots. Native nghiệp vụ quản lý chưa đủ để cutover toàn Base.
- [x] Audit 33 Role và nguồn live; archived có RPC/lịch sử nên giữ nguyên. Không ghi live.
- [x] Bộ gợi ý tối giản đủ 20 vị trí + 5 nhiệm vụ; bảo vệ 6 archived + 2 system và vị trí is_system.
- [x] Diff trước/sau, quyền giữ/bỏ/chưa cấu hình và số người/nguồn ảnh hưởng; UX dùng kho/ma trận hiện có.
- [x] Chuẩn bị pending snapshot/preview/apply/restore và xác minh trigger signature có sẵn; không apply.
- [x] Kiểm thử core SQL/ma trận/cache/phân hệ và Preview desktop/mobile; bàn giao quyết định còn chờ. Chưa benchmark quyền nhân viên live sau SQL vì chưa được áp.

## UX Role & ma trận quyền — 11/11/2026
- [x] Ma trận nhóm quyền dùng chung, kho Role một đường chỉnh, 9 preset nháp lọc theo nguồn backend; không áp production.
- [x] 0369–0370: tạo Role có quyền an toàn; cá nhân chỉ additive, preview có audit và bảo vệ replace đang bật.
- [x] Ba khu vực gọn desktop/mobile; 160 test đạt, gồm A/B dùng has_permission, hồi quy; preview Role mới 10 quyền gợi ý mở được, không áp; build/typecheck harness OK.
- [x] Bàn giao docs/role-permission-matrix-ux-report.md; nguồn legacy giữ nguyên, xác nhận Admin trước áp.
- [ ] Nghiệm thu browser quyền riêng và preset Role hiện hữu: kết nối Lovable Cloud pooler unavailable, phiên kiểm thử chờ khôi phục; chưa hoàn tất, không chỉnh Auth hoặc dữ liệu để vượt rào.

## Fix tận gốc trên code hiện tại — 11/11/2026
- [x] Sửa resolver ô lấy slot.role_id trực tiếp; virtual snapshot dùng trong preview; permission/phạm vi cùng nguồn. Nguồn chưa mapping giữ nguyên.
- [x] Mapping hiển thị 85 bản ghi (82 status active nhưng chỉ 36 hiệu lực theo thời gian), lịch sử/tương lai, chọn Role/ô rõ ràng, tách ô và thêm ô trống. Preview thật được mở, không apply.
- [x] Code thay Role ô bằng phiên bản ô mới + khoảng bổ nhiệm kế tiếp; không sửa Role lịch sử, chặn bổ nhiệm tương lai. Chưa nghiệm thu apply/restore cô lập cho branch mới, không mở cutover.
- [x] Marketing dùng ID/mã/cây, nhiệm vụ mới enforced lúc đọc và ghi, nhiều nhiệm vụ; giữ 7 chuyên môn cũ và Thiết kế/Chụp ảnh.
- [x] Role & Quyền thực tế theo nguồn; receiver distinct và nguồn; Role mới permissions=[] enforced backend + UI, mã unique; giữ HCNS/Đóng hàng/Super Admin.
- [x] 129/129 kiểm thử chọn lọc đạt (19 mới); Preview mapping và nguồn thực tế có phiên thật; harness typecheck/build OK.
- [ ] Chuyển 82 status-active và 3 lịch sử: CHỜ xác nhận Super Admin; 0 ô thật, chưa mapping bất kỳ người thật nào.
- [ ] Cutover fallback user_roles/override/biz_appointments và nhiệm vụ lịch sử: CHỜ xác nhận, hợp đồng native CRM/3K/duyệt/báo cáo chưa đủ để thay toàn bộ.
- [ ] Role Trưởng nhóm KD mới: thiếu trong catalog nhưng chưa có Nhóm KD thật; CHỜ chọn mô hình dùng Role Trưởng phòng hiện hữu hay tạo Role rỗng qua kho, không tự tạo/gán.
- [ ] Apply/restore branch thay Role và giao dịch hai kết nối: chưa nghiệm thu; constraint chống overlap đã xác nhận có ở DB, không coi kiểm thử trigger là kiểm thử concurrency thực.

## Yêu cầu mới: Một kho Role → ô vị trí → bổ nhiệm → quyền
- [x] Đọc tệp yêu cầu; audit chỉ đọc database/code/lịch sử đến 0358; Preview đăng nhập mở được Role & Phân quyền, không lỗi runtime.
- [x] Kiểm kê trực tiếp, kho Role có preview/audit và chuyển ô có snapshot/khôi phục riêng tư; không reset tự động. Preview Role và chuyển ô đã mở trên phiên thật.
- [x] Quản trị tạo/sửa/ngừng/xóa Role chung có kiểm toán; phân loại đủ 5 nhiệm vụ, giữ ID đang dùng.
- [x] Mô hình ô vật lý bổ sung, một Role/một người, khóa/kiểm tra khoảng; form chọn ô và sơ đồ hiển thị ô; 121 kiểm thử chọn lọc đạt, build đạt, mobile không tràn ngang.
- [ ] Mapping Trưởng nhóm Kinh doanh và tạo ô trống/đổi Role ô có người: chưa hoàn thiện; không tự mapping/bổ nhiệm thật.
- [ ] Chuyển 36 phân công thật sang ô: chờ Super Admin xác nhận trong giao diện; chưa áp dụng nên 0 ô/0 snapshot thật.
- [ ] Hợp đồng mọi permission–nguồn–phạm vi: đã chuyển 3 quyền xem đơn vị; CRM/3K/Tín hiệu/duyệt/báo cáo/xuất còn cần kiểm chứng.
- [ ] Nhiệm vụ: cấp mới có điều kiện Marketing và chặn gán trực tiếp; quyền chuyên môn lịch sử chưa tắt khi rời Marketing, chờ đối chiếu/xác nhận nguồn thay thế.
- [ ] Nghiệm thu đủ 15 tình huống và giao dịch đồng thời/áp dụng/khôi phục end-to-end chưa hoàn tất; chưa reset legacy, chưa Publish. Báo cáo docs/role-position-rebuild-audit.md.

Các mục lịch sử bên dưới mô tả các lần triển khai trước, không phải tiêu chí hoàn thành yêu cầu mới.

## Bản 71: Phạm vi đơn vị + dọn cơ chế cũ (migration 0358)
- [x] Phạm vi đơn vị backend cho Nghỉ phép/Tiền Về/Đơn hàng: base_unit_member + 3 quyền view_unit, RLS/RPC thực thi, cấp qua bổ nhiệm quản lý; kiểm chứng dữ liệu thật (Trưởng Phòng thấy đúng đơn vị, ngoài đơn vị bị chặn).
- [x] Ngừng role-designer: chuyên môn Thiết kế/Chụp ảnh → Role chuẩn Nhân viên Thiết kế, 2 nhân sự giữ nguyên quyền, Role cũ archived không xóa.
- [x] Gỡ đường cũ: auto-bootstrap/restoreDefaultRoles/roles.functions.ts, nút Thêm/Xóa role tự do, ô vị trí tự do trong hồ sơ nhân sự (chỉ đọc); vá trigger ký lại liên kết ghi actor thật.
- [x] 7 test cô lập mới + hồi quy 150/150, typecheck/build đạt; báo cáo docs/unit-scope-permissions-report.md. Chưa Publish.
- [ ] Còn tồn tại: sửa/duyệt theo đơn vị và báo cáo tổng hợp theo đơn vị chưa mở (chờ hợp đồng workflow); settings.* vẫn chỉ Super Admin.

## Bản 70: Hoàn thiện toàn bộ phân quyền + dọn sạch cơ chế cũ (file upload mới)
- [x] Rà soát toàn bộ chức vụ, Role, permission thực tế của mọi phân hệ (0355–0357: 17/17 chức vụ liên kết Role chuẩn, signal/CRM scope qua bổ nhiệm).
- [x] Phạm vi cá nhân/nhóm tín hiệu/đơn vị (xem) thực thi backend/RPC/RLS; phạm vi sửa theo đơn vị còn chờ hợp đồng workflow (bản 71 ghi rõ).
- [x] Cài Role chuẩn vào từng chức vụ; bổ nhiệm tự cấp, miễn nhiệm thu hồi, kiêm nhiệm tổng hợp.
- [x] Dọn sạch: Role legacy archived có snapshot, liên kết legacy ngừng, sync tự cấp lại đã gỡ (bản 71), UI trùng gỡ dần; không xóa dữ liệu/lịch sử/tài khoản.
- [x] Giữ Super Admin, tài khoản khôi phục, tài khoản dịch vụ; không Publish.

## Bản 69: Hoàn thiện phân quyền nghiệp vụ sau 0353
- [x] Kiểm chứng trên dữ liệu thật: 10 liên kết Chức vụ → Role chuẩn ĐÃ trực tiếp cấp quyền (org_role_rules không phụ thuộc cờ active; chữ ký hợp lệ); 5 nhân sự đang bổ nhiệm (Kế toán trưởng, HCNS, Thu mua, Thiết kế, GĐ Marketing) nhận quyền chuẩn qua bổ nhiệm.
- [x] Migration 0354 — hợp đồng Kinh doanh chuẩn sau reset: tài khoản reset chỉ dùng biz.*/k3.*/CRM khi có bổ nhiệm Kinh doanh chuẩn tạo SAU reset (qua org_change); bổ nhiệm/thành viên legacy giữ làm lịch sử, không tự phục hồi; miễn nhiệm thu hồi toàn bộ; phạm vi lọc theo mốc reset ở mọi resolver trung tâm (participant/manager/all_scope/scope_ok/appointment_scope/can/executive_holder/department_access).
- [x] 6 kiểm thử nghiệp vụ mới (bizStandardContract): chặn legacy, mở bằng bổ nhiệm mới, đúng phạm vi phòng, không phục hồi legacy, miễn nhiệm thu hồi, Super Admin không đổi. Hồi quy 1514/1516 (2 lỗi date-dependent đã biết); typecheck/build đạt; xác nhận database thật chạy định nghĩa mới, 0 tài khoản reset có bổ nhiệm mới → chưa ai bị thay đổi quyền.
- [x] Báo cáo bàn giao docs/business-permission-completion-report.md kèm bảng Chức vụ → Role → Quyền → Phạm vi → Kết quả.
- [ ] Tín hiệu theo bổ nhiệm: CHƯA kích hoạt — chức vụ Kinh doanh thuộc nguồn biz_positions (org_role_rules loại trừ đúng thiết kế) và phạm vi nhóm Tín hiệu đang theo Role trực tiếp; quyền signal.* có sẵn trong Role chuẩn trực tiếp (Kinh doanh Đơn Hàng, Lead Kinh Doanh ĐH...) cấp qua Tùy chỉnh quyền. Cần hợp đồng phạm vi nhóm theo bổ nhiệm nếu muốn tự cấp.
- [ ] Chờ Admin: bổ nhiệm lại nhân sự Kinh doanh qua Cơ cấu tổ chức để kích hoạt quyền theo hợp đồng 0354. Chưa Publish.

## Bản 68: Thống nhất một cơ chế xác định quyền
- [x] Rà soát toàn bộ resolver: phát hiện 5 điểm backend/frontend/Debug cho kết quả khác nhau (Debug bỏ quyền Role trực tiếp của quyền đã kiểm chứng; Debug bỏ qua chế độ replace; base_legacy bỏ qua chế độ additive; frontend chặn quyền cha mà backend không; frontend bypass Super Admin trước khi kiểm tra trạng thái).
- [x] Migration 0353: viết lại `account_permission_explain` khớp y hệt `private.has_permission` (fallthrough quyền đã kiểm chứng + replace/additive); vá `private.base_legacy` tôn trọng chế độ additive — frontend `base_permissions_effective` khớp backend.
- [x] Frontend auth.ts: `can`/`canSee`/`scopeList` kiểm tra tài khoản hoạt động trước cả Super Admin; bỏ chặn quyền cha ở đường thực thi (PERMISSION_DEPENDS chỉ còn là gợi ý soạn Role qua auditDependencies); `explainPermission` khớp backend.
- [x] Kiểm thử: 44/44 resolver (thêm parity tuyệt đối explain↔has_permission cho 5 dạng tài khoản, quyền đã kiểm chứng cấp trực tiếp qua Role, base_legacy replace/additive); hồi quy 1508/1510 (2 lỗi date-dependent đã biết ở biz/my-work, không liên quan); typecheck/build đạt; xác nhận database thật đang chạy định nghĩa mới.
- [x] Báo cáo bàn giao: docs/unified-permission-resolver-report.md. Không reset, không bổ nhiệm thật, không đổi dữ liệu, chưa Publish.
- [ ] Còn tồn tại đã ghi trong báo cáo: phạm vi nhóm Tín hiệu vẫn theo Role trực tiếp (signal_scope), chưa suy ra từ bổ nhiệm — giữ cơ chế an toàn hiện hành, không tự mở rộng; quyền quản lý/kế toán/cung ứng và biz.*/k3.* vẫn chặn an toàn chờ hợp đồng phạm vi.

## Bản 66: Chốt cơ cấu, cấp bậc và Role chuẩn
- [x] Migration 0352: Giám đốc Marketing Cấp 3; Role nền "Nhân sự mới" thành chuẩn tối thiểu; mở rộng quyền đã kiểm chứng (leave/att/finance/oq/ot/order) theo rào máy chủ; đồng bộ 10 liên kết chức vụ (chữ ký hợp lệ); duyệt tài khoản không xóa Role; rào xóa Role còn tham chiếu.
- [x] Frontend: tên/cấp chức vụ chính thức trong orgStructure.ts (bỏ "Trưởng bộ phận"); gợi ý Role chuẩn trong titleRoles.ts; đồng bộ danh sách quyền đã kiểm chứng trong auth.ts.
- [x] 8 kiểm thử mới + hồi quy 171/171 đạt, typecheck/build đạt; báo cáo docs/standard-role-catalog-report.md cập nhật. Không reset, không bổ nhiệm thật, chưa Publish.
- [ ] Chờ Admin: bổ nhiệm người thật tại Cơ cấu tổ chức để nhận quyền tự cấp; quyền force_status/delete/restore, cấu hình ngân hàng/Zalo GMF, settings.* và biz.*/k3.* vẫn chặn an toàn (lý do trong báo cáo).

## Quyết định mới: ngừng toàn bộ quyền legacy
- [x] Snapshot 26 tài khoản/84 bản ghi tổ chức; giữ hai Super Admin theo xác nhận.
- [x] Reset 24 nhân sự/15 Role/1 override; nguồn legacy còn hiệu lực 0, chống cấp lại; phục hồi kiểm chứng cô lập, mã 0e42f305-c0a8-4a1a-8e5c-e16361c7da56.
- [x] Sửa sơ đồ trùng theo ID, giữ kiêm nhiệm và lịch sử; desktop/mobile và 13 test đạt.
- [x] 39 kiểm thử đạt, Preview đọc lại lịch sử/khôi phục và quyền Kinh doanh nhân sự thường 0; báo cáo cập nhật; chưa Publish.
- [ ] Cấp quyền Kinh doanh theo bổ nhiệm chuẩn mới: chưa có hợp đồng Role/phạm vi được kiểm chứng, hiện bị chặn an toàn; không tự phục hồi bổ nhiệm legacy.

## Hoàn thiện theo yêu cầu bản 62
- [x] Xem trước Marketing trên Preview không lỗi; sửa mốc tức thời máy chủ, lưu/refresh/miễn nhiệm đã kiểm chứng bằng nhân sự cô lập.
- [x] Gộp Cơ cấu & Nhân sự / Role & Phân quyền; chức vụ về drawer đơn vị, gỡ ba dialog cũ và form phân công riêng.
- [x] Gộp hai Role trưởng nhóm trùng chức năng; giữ ID/snapshot và mọi quyền Kinh doanh, không reset.
- [x] Miễn nhiệm tại chỗ, điều chuyển/kiêm nhiệm dùng form chung, sửa nhiệm vụ Marketing theo nguồn bằng end/recreate.
- [x] 68 kiểm thử trọng yếu đạt, báo cáo cập nhật; chưa Publish, không bổ nhiệm người thật.

- [x] Sửa bổ nhiệm từ sơ đồ: nhân sự hợp lệ theo ID, nhiều người, xem trước/xác nhận/lưu tại chỗ; lưu và tải lại nhân viên giả lập không Role đã kiểm chứng trong môi trường cô lập.
- [x] Đăng ký 10 Role riêng, liên kết 8 chức vụ với tập cá nhân đã kiểm chứng, giữ HCNS/Đóng hàng; ẩn legacy có snapshot, giữ nguồn hiện tại và Kinh doanh. Đây chưa phải bộ quyền quản lý hoàn chỉnh.
- [x] 93 kiểm thử cô lập nguồn cấp/thu hồi, phạm vi, chống tự nâng quyền và catalog đạt; kiểm tra desktop/mobile, không lỗi JavaScript.
- [x] Báo cáo docs/standard-role-catalog-report.md ghi rõ danh sách quyền đã bật và còn chờ; không reset, tự bổ nhiệm thật hay Publish.
- [ ] Quyền quản lý, kế toán và cung ứng đầy đủ: chờ hợp đồng phạm vi nghiệp vụ an toàn; hiện không đủ điều kiện chuyển đổi tiếp.
- [ ] Chức vụ trưởng nhóm Marketing/Thiết kế: chỉ tạo khi Admin có Nhóm thực tế; dùng Role quản lý chung đã gộp, không tự tạo vị trí.

## Chuyển đổi quyền cuối cùng trước đó

- [x] Snapshot đầy đủ và chuyển đổi thật 9 tài khoản/9 nguồn Role cũ, giữ ngoại lệ và quản trị; mã phục hồi 90717bc1-ae8e-4bed-a162-9ab8c8e61bec.
- [x] Mở thao tác chuyển đổi/khôi phục có xác nhận, giữ nguyên nguồn bổ nhiệm và tập quyền đã kiểm chứng.
- [x] Quyền bổ sung thật tại Nhân sự, dùng Role/permission chung và kiểm tra máy chủ; không giả lập giới hạn đơn vị chưa hỗ trợ.
- [x] 90 kiểm thử cô lập đạt, Preview chuyển đổi thành công và đọc lại; báo cáo docs/final-permission-transition-report.md; không Publish.

## Giai đoạn 3A trước đó

- [x] Kiểm chứng từng quyền của chín liên kết chức vụ còn chờ, gồm đọc/ghi/báo cáo/xuất/workflow.
- [x] Chỉ kích hoạt tập quyền có rào backend an toàn; ghi rõ chức năng quản lý còn chờ.
- [x] Kiểm tra cấp/thu hồi theo nguồn, kiêm nhiệm, thời gian hiệu lực, ngoài phạm vi và chống tự nâng quyền.
- [x] Hiển thị quyền tự nhận và lý do chặn trong quy trình phân công hiện có; không thêm quản trị trùng.
- [x] Cập nhật báo cáo Chuyển đổi quyền cũ và bàn giao kết quả, không thực thi reset.
- [x] Kiểm thử cô lập và Preview; không bổ nhiệm thật, không thay Kinh doanh, chưa Publish.

## Giai đoạn 2.5 đã hoàn thành

- [x] 1. RPC backend `account_permission_explain` (0334) — một nguồn giải thích quyền.
- [x] 2. Debug tab đọc từ RPC backend, bỏ thuật toán tính riêng.
- [x] 3. Frontend hỗ trợ nhiều Role (roleIds, loại trùng, replace/additive); roleId = Role chính hiển thị.
- [x] 4. Picker giao việc theo ID; job mới lưu writerId/designerId/ownerId/assigneeId; job cũ giữ nguyên.
- [x] 5. Kiểm chứng + kích hoạt liên kết Role Đóng hàng (0335); 9 liên kết còn lại chờ kiểm chứng scope.
- [x] 6. Báo cáo đối chiếu reset (A/B/C/D) đã có trong khu vực quản trị nâng cao — chỉ xem trước.
- [x] 7. Kiểm thử: 21 test mới đạt; hồi quy 1426/1443 (2 lỗi date-dependent đã biết); typecheck/build đạt.
- [x] 8. Báo cáo bàn giao docs/phase25-report.md.

Mở (chờ Admin): bổ nhiệm nhân sự thủ công và đối chiếu ngoại lệ Bích Ngọc (69 quyền riêng chứa quyền Tín hiệu) / Viewer chưa rõ nguồn. Quyền quản lý theo đơn vị chưa hỗ trợ ở nhiều phân hệ nên không tự cấp; không giả lập đã hoàn thiện. Không cấp Role nền hàng loạt vì Task legacy chưa có rào máy chủ đầy đủ; Admin chọn khi phù hợp. Báo cáo chi tiết: docs/final-permission-transition-report.md.
Quyết định mới thay thế ngoại lệ cũ: reset cả Kinh doanh đã thực hiện; chỉ hai Super Admin giữ nguyên. Admin bổ nhiệm thủ công, không Publish. Các mục lịch sử phía trên không phải chính sách hiện hành.

## Hoàn thiện dứt điểm Cơ cấu (bản 63)

- [x] Chi tiết tài khoản: bỏ ô "Vị trí" tự nhập và chọn Role; thêm bảng chỉ đọc phân công chức vụ (kiêm nhiệm), nhiệm vụ Marketing, Role hiệu lực, nút "Đến Cơ cấu tổ chức" — RPC mới `account_org_summary` (0350), chỉ Super Admin/settings.user_view/settings.user_custom_perm.
- [x] Tab Quyền: hiển thị quyền thực nhận + nguồn (account_permission_explain), chỉnh sửa chỉ qua "Tùy chỉnh quyền" thống nhất (account_supplement_read/save); gỡ ma trận quyền riêng và chọn Role cũ.
- [x] Duyệt tài khoản: không chọn Role thủ công; account_approve tự gán Role nền "Nhân sự mới" khi không truyền Role.
- [x] Sửa timeout account_permission_explain: tính theo tập hợp thay vì gọi has_permission từng quyền (0351), ngữ nghĩa giữ nguyên.
- [x] Sơ đồ khử trùng nhân sự theo user ID (đã có ở orgChart.ts); 121 test basePermissions + 5 test mới đạt, typecheck/build đạt, Preview xác nhận cả ba tab.
- [ ] Chờ Admin: bổ nhiệm người thật tại Cơ cấu tổ chức; kiểm chứng bộ quyền quản lý/kế toán/cung ứng trước khi kích hoạt thêm liên kết Role. Chưa Publish.

## Role v2 — bộ Role chuẩn mới (đang làm 11/11)

- [x] A. Snapshot 33 Role cũ + liên kết + quyền hiệu lực 26 người (docs/backup/role-v2-2026-11-11/, SHA256SUMS).
- [x] B1. Migration 0373/0374: cột catalog_generation, writer role_catalog_change hỗ trợ role-v2-*, nguồn nhiệm vụ Marketing, rollback docs/rollback/2026-11-11-role-v2.sql; 10 test PGlite đạt. (0372 là placeholder rỗng do gửi nhầm, vô hại.)
- [x] B2/C/D lịch sử: đã tạo 25 V2, 5 Marketing bindings và 23/25 titled appointments; mặc định union legacy có quyền thừa, thay bằng draft nghiệm thu phía trên.
- [ ] E. Ngọc: không tự cấp leave.approve; chủ quyết trách nhiệm. Đọc 14:42 UTC không còn pending, không tự kết luận ai xử lý.
- [ ] F. Đối chiếu effective before/after 26 người; chỉ xóa Role cũ khi 0 phụ thuộc; chưa Publish.
- [x] B2. 25 Role chuẩn role-v2-* đã tạo live qua RPC có kiểm toán; 7 Role đã tối giản thêm (bỏ export rộng/phê duyệt ngoại module).
- [x] C. 5 nhiệm vụ Marketing đã gắn Role v2; Ngọc có web.content_view/outline_start thật (nguồn marketing_appointment).
- [x] D. 23/25 bổ nhiệm đang hiệu lực đã gắn ô vị trí (23 slots); sửa lỗi chữ ký tác động org_change (0375).
- [ ] Ngoại lệ chờ chủ dự án: Vũ Văn Đức (GĐ ĐH, 16 quyền rộng từ link Viewer cũ), Nguyễn Quỳnh Anh (leave.export), Ngọc (leave.approve/view_assigned/report — 2 đơn chờ duyệt).
- [ ] Xóa 33 Role cũ: chỉ sau khi chủ chốt 3 ngoại lệ + kiểm tra 0 phụ thuộc. Chưa Publish.
