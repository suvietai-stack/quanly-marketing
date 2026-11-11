# Roadmap — Role chuẩn và bổ nhiệm

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
