# Kiểm kê ban đầu: Kho Role và ô vị trí

## Cập nhật fix trực tiếp 11/11/2026 — 0365–0368

### Đã sửa code và áp dụng
- **0365**: slotted rules lấy Role của ô trong snapshot truyền vào, không còn join bắt buộc với title-role link. Fallback cũ chỉ nhận membership chưa slot. Nhiệm vụ mới/tái kích hoạt có `eligibility_enforced`; mỗi lần đọc phải còn Marketing theo root ID ổn định hoặc code, kể cả kiêm nhiệm. Đổi user/specialty trên row không bypass guard. Bảy row chuyên môn hiện hữu giữ nguyên compatibility, không sửa nhân sự thật.
- **0366**: sửa snapshot `base_config` sau phát hiện lỗi key JSON trên Preview; preview tạo Role vị trí từ chối permission có sẵn, insert guard cùng kiểm tra. Role hiện hành không bị blank. Preview sửa Role đếm người từ toàn bộ nguồn thay vì title-only.
- **0367**: thay Role ô có lịch sử qua `replace_slot_role`: ô phiên bản mới, kết thúc đúng holder và tạo khoảng kế tiếp trong một preview/apply/audit; ô cũ giữ Role gốc. Bổ nhiệm tương lai chặn để đối chiếu riêng. Scope Tín hiệu ô dùng slot Role; title scope chỉ dùng un-slotted. Source model thêm nhiệm vụ gắn bổ nhiệm.
- **0368**: exclusion GiST `[starts_at,ends_at)` chặn hai holder chồng thời gian trên cùng slot trong DB, cả giao dịch đồng thời; cancelled history không xóa. Constraint đã đọc lại ở DB.
- UI mapping chọn Role rõ ràng, tách nhiều người thành ô riêng, tái dùng ô tương thích, thêm ô trống; preview người/Role/đơn vị/ngày/tác động quyền, chỉ Super Admin apply. Lọc current/history/all không giấu các record active nhưng hết hạn.
- Staff và tài khoản có **Role & Quyền thực tế**: source ID, đơn vị, Role, quyền từ nguồn, cảnh báo compatibility. Catalog distinct-person counts theo slot/task/direct/title legacy; không cộng trùng tổng. HCNS/Đóng hàng giữ ID hiện hữu, Super Admin được bảo vệ, không tạo Role trùng.

### Dữ liệu thật không chuyển
- 33 Role; 85 bổ nhiệm: 82 `status=active`, trong đó **36** còn hiệu lực theo thời gian, không phải 82 cùng hiệu lực; 3 ended. Giao diện All gồm đủ 85.
- 0 ô vật lý; 0 bổ nhiệm mapped; 7 chuyên môn cũ; 0 chuyên môn có enforced flag. Không reset, không update hàng loạt Role/quyền/người thật, không Publish. Chỉ preview thao tác thật, không apply.

### Kiểm thử đã chạy
- 129/129: 19 mới (15 PGlite cùng SQL deployed + 4 mapping), appointment 12, catalog PGlite 9, source scope PGlite 8; CRM 28, standard Biz 6, 3K PGlite 10, order tracking 7, finance 19, approvals 11.
- Test mới: Role ô không cần title link; cross-unit fail-closed; cùng Role hai source; thu hồi một giữ source kia; task không gắn slot; Role mới rỗng; root đổi tên vẫn Marketing; nhiều task; rời hết ngừng quyền mới giữ history; chuyển user trái phép; Thiết kế ngoài Marketing giữ quyền; nhiệm vụ lịch sử không bị tự cắt.
- Preview phiên thật: kho tải; current 36; xem trước một mapping người thật giữ dates; mở thêm ô trống và Role mới; nguồn thực tế đọc được. Không pageerror. Không bấm confirm. Harness typecheck/build gần nhất OK; không chạy build/typecheck thủ công.
- **Chưa test thực**: hai connection concurrent INSERT, apply/restore branch thay Role mới, full migration chain PGlite, toàn bộ native CRM/3K/workflow cutover. Test trigger cũ không thay thế các kiểm thử này.

### Chưa hoàn thành / cần xác nhận trước cutover
- `user_roles`, override replace/additive, `biz_appointments`/CRM/3K/native workflow vẫn dùng hợp đồng hiện hành. Không tuyên bố toàn hệ đã một canonical authorization path, không tự bỏ fallback.
- Nhiệm vụ mới tự mất quyền khi rời Marketing. **Nhiệm vụ/chuyên môn lịch sử và assignment-specialty source còn compatibility**, cần đối chiếu và xác nhận chuyển nguồn trước khi bật enforced/cắt fallback. Không làm mất Thiết kế/Chụp ảnh.
- Tín hiệu chức năng+nhóm cùng source ở mọi RPC còn cần action-specific contract; một helper scope chung chưa đủ chứng minh mọi action không cross-role. Không tuyên bố đã giải quyết toàn bộ các workflow.
- Trưởng nhóm KD chưa có Role riêng; DB có chức danh dùng chung nhưng hiện không có Nhóm KD thật. Không tự tạo Role với quyền phỏng đoán: Admin có thể tạo Role rỗng trong kho khi chốt cần dùng, giữ Role Trưởng phòng đang chạy.
- Mapping thực, cập nhật Role ô người thật, retirement legacy và enforcement lịch sử đều chờ người dùng xác nhận. Chưa đủ điều kiện báo hoàn thành toàn bộ hay cutover.

Kiểm tra chỉ đọc ngày 11/11/2026. Chưa chuyển dữ liệu, chưa reset, chưa Publish.

## Xác minh
- Preview `/organization` mở bằng phiên hiện tại; nút Role & Phân quyền hoạt động, không có JavaScript pageerror trong lượt kiểm tra.
- Code/journal có migration đến `0358`; mốc applied mới nhất `1794379454726` khớp entry 0358. Không có file 0359/0360/0361 trong cây hiện tại. Công cụ kiểm kê toàn bộ lịch sử từ chối vì vượt giới hạn kích thước; không tuyên bố đã xác minh từng migration cũ.
- 33 Role: 27 `standard`, 6 `archived`. Hai liên kết `user_roles`; 13 bản ghi override — đây là số bản ghi, không phải khẳng định 13 nguồn đang cấp quyền.
- 25 chức danh, 17 đang hoạt động; tất cả 17 có liên kết Role. Không có nhóm liên kết chức danh nhiều Role trong dữ liệu kiểm kê.
- 5 Role nhiệm vụ yêu cầu đã có đúng ID: `role-content-web`, `role-seo`, `role-local-seo`, `role-social`, `role-video`; hiện nhóm catalog là Marketing.
- 3 ID trong danh sách khởi đầu chưa tồn tại: `role-standard-sales-team`, `role-standard-hr-staff`, `role-standard-packer`. HCNS/Đóng hàng đã có Role được tham chiếu với ID khác; phải giữ ID và mapping rõ ràng, không tạo bản trùng. Trưởng nhóm Kinh doanh cần cấu hình Role riêng theo quyền/phạm vi đã kiểm chứng.

## Khoảng trống quan trọng
- `org_titles` đang chứa cả chức danh dùng chung và vị trí: Trưởng Phòng có 2 người/2 đơn vị; Giám Đốc có 2 người/2 đơn vị; Nhân viên Marketing có 4 người/1 đơn vị; Nhân viên Kinh doanh có 9 người/4 đơn vị. Đây không tự động là xung đột của ô thực tế vì chưa có định danh ô riêng.
- Có 32 cặp khoảng bổ nhiệm giao nhau theo cùng chức danh/đơn vị trong toàn bộ lịch sử. Không tự sửa hoặc coi là 32 vi phạm: mô hình cũ cho phép chức danh nhân viên nhiều người; cần phân loại và xem trước việc tách ô.
- Ràng buộc hiện tại cho nhiều liên kết Role trên một chức danh; ghi tổ chức kiểm tra capacity dưới khóa chung nhưng chưa có một ô độc lập cho từng nhân viên. Giao diện liên kết vẫn chọn Role bổ sung.
- `private.mkt_specialty_rules` kiểm tra trạng thái tài khoản/chuyên môn nhưng chưa đòi bổ nhiệm Marketing; `mkt_specialty_save` cũng chưa có điều kiện này. Thiết kế/Chụp ảnh đang dùng catalog chuyên môn cùng nhóm: phải giữ dữ liệu và tách rõ khỏi 5 Role nhiệm vụ, không tự xóa.
- `private.base_unit_member` kết hợp quyền đã được tổng hợp với bất kỳ membership hiệu lực của người quản lý; cần gắn permission với đúng bổ nhiệm cấp permission để không dùng phạm vi kiêm nhiệm khác.
- Danh sách Role đang đếm liên kết trực tiếp nên thường hiển thị 0 tài khoản dù có quyền qua bổ nhiệm; cần số nguồn/nhân sự hiệu lực và trạng thái tải/lỗi rõ ràng.
- Màn hình Role thiếu tạo/ngừng/xóa an toàn, phân loại nhiệm vụ; cơ chế xóa hiện còn chặn cả tham chiếu lịch sử. Cần snapshot audit giữ ID trước khi cho xóa Role không còn nguồn vận hành.

## Đã triển khai trong lượt này (0359–0364)
- Kho Role chung có loại vị trí/nhiệm vụ/hệ thống, tìm kiếm và nhóm nhiệm vụ riêng; giữ đủ 5 ID nhiệm vụ, không tạo Role trùng. Tạo/sửa/ngừng/xóa qua RPC Super Admin với preview actor-bound, fingerprint, hết hạn, xác nhận và audit riêng tư. Role còn tham chiếu vận hành không được ngừng/xóa; lịch sử Role giữ snapshot.
- `org_position_slots` là ô vật lý riêng tham chiếu chức danh/đơn vị/một Role. `org_assignments.slot_id` bổ sung mà không đổi ID hoặc ngày cũ. Ghi qua `org_change`; trigger khóa ô và chặn chồng khoảng, sai đơn vị và Role nhiệm vụ/hệ thống.
- Khu vực chuyển đổi hiển thị 36 phân công chưa gắn ô (gồm cả phân công chưa có chức danh), chọn cụ thể và xem trước tạo ô giữ đúng Role hiện có. Chưa có mapping hợp lệ bị chặn, không đoán theo tên.
- Chuyển ô có snapshot riêng tư trước/sau trong cùng giao dịch; xem trước khôi phục kiểm tra ngày, trạng thái, ô và bổ nhiệm phát sinh, không ghi đè dữ liệu mới. Chưa có snapshot thật vì chưa xác nhận chuyển nhân sự thật.
- Sơ đồ có thể hiển thị ô riêng, form bổ nhiệm chọn ô trống, kiêm nhiệm hai ô cùng Role không bị loại nhầm, không tự thay người trong ô đã chuyển. Dữ liệu cũ chưa chuyển vẫn giữ cách hiển thị/ghi tương thích.
- Ba quyền xem đơn vị Nghỉ phép/Tiền Về/Theo dõi đơn dùng permission cùng chính nguồn bổ nhiệm cấp nó; không lấy phạm vi của kiêm nhiệm khác. Không đổi quyền toàn cục hay nghiệp vụ khác.
- Cấp mới nhiệm vụ bị chặn tại trigger khi không có bổ nhiệm Marketing hiệu lực, kể cả đường gán Role trực tiếp; form hồ sơ phản ánh điều kiện. Nhiệm vụ theo bổ nhiệm bị chặn ngoài Khối Marketing. Quyền chuyên môn lịch sử chưa bị tự thu hồi.
- Bộ liên kết mới chỉ nhận một Role vị trí chuẩn; quyền đã kiểm chứng vẫn được thực thi theo hợp đồng hiện tại. Cơ chế cũ chưa được tuyên bố đã loại bỏ hoàn toàn.

## Kiểm chứng
- 121/121 kiểm thử chọn lọc: kho Role 9, quyền/phạm vi nguồn 8, bổ nhiệm 12, Role 8, sơ đồ 13, Kinh doanh chuẩn 6, CRM 28, Theo dõi đơn 7, Tiền Về 19, phê duyệt 11.
- Preview có phiên hợp lệ: mở kho, lọc đúng 5 nhiệm vụ, mở xem trước chỉnh Content Web; mở xem trước chuyển một phân công thật nhưng không bấm áp dụng. Không có pageerror trong lượt này. Desktop và điện thoại 390×844 hiển thị, không tràn ngang.
- Build gần nhất sau code đạt. Không chạy build/typecheck thủ công. Kiểm thử giao dịch đồng thời hai kết nối, áp dụng/khôi phục ô end-to-end và toàn bộ 15 tình huống chưa được nghiệm thu đầy đủ; không coi unit test là thay thế.
- Đọc lại database: 33 Role, 5 loại nhiệm vụ, 0 ô thật, 0 bổ nhiệm đã gắn ô, 0 snapshot chuyển ô. Không reset, không bổ nhiệm người thật, không Publish. Snapshot preview có thể đã được tạo nhưng không đổi dữ liệu nhân sự.

## Còn thiếu — chưa sẵn sàng reset
- Chưa tạo/mapping Role Trưởng nhóm Kinh doanh chuẩn; giữ ID HCNS `role-wupj68a6` và Đóng hàng `role-dong-hang` hiện hữu. Các Role chuẩn còn lại giữ ID như kiểm kê.
- Super Admin cần xem trước/xác nhận mapping và chuyển ô cụ thể. Vị trí trống cần giao diện tạo ô riêng, đổi Role ô đang dùng và xem trước tác động sâu hơn; hiện giữ chặn an toàn khi có lịch sử liên quan.
- Chưa tắt quyền nhiệm vụ lịch sử khi rời hết Marketing: cần đối chiếu và xác nhận chuyển nguồn, không tự làm mất quyền hiện hữu. Nguồn `mkt_specialty_rules` lịch sử vẫn còn; reset fence và nhiệm vụ theo bổ nhiệm vẫn theo hợp đồng cũ.
- Chưa thống nhất toàn bộ resolver đặc thù CRM/3K/phê duyệt và scope Tín hiệu vào hợp đồng permission–nguồn; chỉ ba quyền xem đơn vị đã chuyển trong lượt này. Quản lý/sửa/duyệt/báo cáo/xuất theo đơn vị chưa có nghiệm thu đầy đủ.
- Chưa có reset legacy mới; chưa xóa Role legacy; chưa chuyển 36 phân công thật. Không báo hoàn thành toàn bộ hệ thống.