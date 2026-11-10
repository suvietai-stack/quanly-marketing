# Lộ trình hiện tại

## Bước 1 — Role chuẩn theo chức vụ (yêu cầu hiện tại)
- [ ] Dùng duy nhất app_roles gốc; đối chiếu quyền từng Role và vị trí áp dụng, không tạo Role mới
- [ ] Cấp/thu hồi nguồn bổ nhiệm theo hiệu lực, giữ nguồn trực tiếp và Kinh doanh; chỉ bật permission đã kiểm chứng
- [ ] Liên kết qua xem trước/xác nhận chung; giao diện chức năng/vị trí áp dụng và tùy chỉnh quyền
- [ ] Kiểm thử vòng đời, đa nguồn, phạm vi, chống nâng quyền và nghiệm thu Preview; báo phần chưa an toàn
- Không reset quyền cũ, không tạo bản thử, không Publish; bước 2/3 chưa thực hiện trong lượt này

## Chuẩn hóa toàn bộ cơ cấu, Role, phân quyền (yêu cầu 912 dòng)
- [x] Sửa lỗi nền: vân tay org_change băm cả profiles.last_seen_at tự đổi mỗi request -> mọi thao tác ÁP DỤNG CƠ CẤU luôn thất bại; migration 0317 loại cột biến động, giữ băm danh tính/trạng thái/Role
- [x] Chuẩn hóa danh mục qua đúng hợp đồng org_change (Super Admin, xem trước + xác nhận, revision 1→3): Bộ phận→Phòng (Marketing/Thiết kế/Kế toán/Mua hàng & Giao vận), HC&NS giữ tên riêng; Trưởng bộ phận→Trưởng phòng (quản lý, 1 người); Kế toán trưởng thành quản lý đơn nhiệm; thêm Giám đốc Marketing cấp Khối (chưa bổ nhiệm); ngừng Trưởng bộ phận HC&NS thừa; 7 bản chức danh tạo trùng do sai mã đã ngừng và đánh dấu rõ
- [ ] Một bộ Role chuẩn + Role mặc định theo chức vụ hoạt động thật ở backend (cấp/thu hồi theo nguồn bổ nhiệm) — phụ thuộc kiểm chứng phạm vi từng phân hệ
- [ ] Marketing: tích nhiệm vụ → tự nhận Role tương ứng, thu hồi đúng nguồn — phụ thuộc mục trên
- [ ] Reset quyền cũ ngoài Kinh doanh theo quy trình 6 bước có đối chiếu/xác nhận — chỉ sau khi cơ chế Role mới an toàn
- [ ] Nối danh sách chuyên môn vào màn giao job Marketing
- [ ] Nghiệm thu sau đăng nhập; chưa Publish

## Tổng dọn dẹp toàn Base — yêu cầu mới
- [x] Gom Cài đặt thành Đơn vị / Chức vụ & Chức năng / Role & Phân quyền; công cụ kỹ thuật vào Nâng cao
- [x] Mở khu vực Role theo settings.role/settings.permission độc lập quyền sửa cơ cấu; nhóm Role gốc không đổi ID/quyền
- [x] Chặn ngay thao tác quyền bổ sung chưa có đường lưu; báo rõ giới hạn Role tự động
- [x] Giới hạn đọc chuyên môn: người quản lý có quyền hoặc chính nhân sự; kiểm tra API và hồi quy (0316, 7 tests)
- [ ] Nối chuyên môn với workflow; hoàn thiện cấp/thu hồi đa Role theo nguồn và quyền bổ sung giao dịch chung
- [x] Kiểm chứng sau đăng nhập, đối chiếu dữ liệu và bàn giao báo cáo docs/base-cleanup-report.md; 133 tests đạt; chưa Publish

## Chuyên môn Marketing & Role tập trung
- [x] Danh mục 7 chuyên môn, nhiều-nhiều, nguồn/thời điểm, lịch sử; đồng bộ idempotent từ Role (không ghi đè chỉnh tay); 4 nhân sự được điền sẵn
- [x] Checkbox theo nhân sự + chuyên môn chính; chỉnh hàng loạt có xem trước; tab Role & Phân quyền chuyển về Cơ cấu tổ chức, gỡ khỏi Tài khoản
- [ ] Dùng danh sách chuyên môn khi giao job từng module Marketing (đã có hàm lấy ứng viên, chưa nối vào màn giao việc)
- [ ] Nhận diện từ phân công job/đơn vị, mục "Cần xác nhận"; liên kết chuyên môn→Role tự cấp

## Refactor tận gốc Cơ cấu tổ chức toàn Base
- [x] Kế hoạch được duyệt; đã khởi chạy triển khai trong bản thử riêng “Hợp nhất cơ cấu toàn Base”, chưa chuyển đổi backend chung
- [x] Đọc yêu cầu; rà soát màn hình và số liệu app đã ghi trước đó (không phải dữ liệu bản nháp): 3 Hệ, 4 Phòng, 0 Nhóm, 12 nhân sự Kinh doanh duy nhất, 39 bổ nhiệm (16 hiệu lực), 6 chức vụ Biz, 11 chức vụ Base, 26 tài khoản có Role
- [x] Đọc yêu cầu đầy đủ và kiểm tra nguồn trong bản nháp: 2 Hệ, 2 Phòng, 2 phân công Phòng, 0 bổ nhiệm, 0 chức vụ Biz, 0 cấu hình Base, 2 tài khoản có Role; đây là dữ liệu ví dụ riêng, không phải baseline của app
- [ ] Hoàn tất bản đồ phụ thuộc và mô hình nguồn tổ chức có thẩm quyền; lưu đối chiếu ID, lịch sử, quyền và quan hệ chưa ánh xạ
- [x] 0308–0314 bổ sung nguồn quan hệ, bản sao phục hồi, đọc theo phạm vi, xem trước rollback, áp dụng nguyên tử và khóa đường ghi quản trị cũ/direct DML
- [x] Một cây đệ quy, drawer chung, danh sách chức vụ chung; không nhúng giao diện Biz cũ
- [ ] Hoàn thiện quyền bổ sung qua giao dịch chung (hiện chưa hỗ trợ); Role cần xem trước tác động hiển thị và xác nhận chung thay vì tự preview/apply trong nút lưu
- [ ] Hoàn thiện chiếu nghĩa vụ cá nhân khi điều chuyển xuyên khối, hủy quyết định lên lịch và phục hồi lịch sử cha theo thời gian; không coi scaffolding là hoàn tất
- [ ] Quyền org.* có phạm vi, vòng đời phân công chính/kiêm nhiệm, bổ nhiệm/miễn nhiệm và lịch sử thống nhất
- [ ] Liên kết Role gốc: chỉ kích hoạt nguồn đã kiểm chứng an toàn; giữ chặn và lý do cho Role chưa đạt; không sửa Role trực tiếp hiện có
- [ ] Gỡ giao diện BizOrganization/BizPositions/BizAppointments cũ sau khi chức năng được thay thế đầy đủ
- [ ] Kiểm thử 22 tình huống, hồi quy CRM/Tín hiệu/KR/KPI/Báo cáo/Phê duyệt, đối chiếu trước–sau, nghiệm thu đăng nhập desktop/mobile; chưa Publish
- [x] 22 kiểm thử hợp đồng mới + 33 cây/phân công đạt; hồi quy 612/614, build OK; không thay đổi MD5 nguồn Biz hoặc Role trực tiếp
- [x] Đăng nhập tài khoản ví dụ: cây hiển thị desktop/mobile, không lỗi JS/tràn ngang; chưa phải nghiệm thu UI quản trị
- [ ] Chưa có blocker bên ngoài để giải thích các phần code thiếu: phải tiếp tục hoàn thiện các mục trên, không tuyên bố hoàn tất

## Liên kết Role hiện có với chức vụ toàn Base
- [x] Rà soát Role, nguồn cấp quyền, phạm vi và đường ghi hiện tại (18 Role, không có phân công Base trong dữ liệu đọc)
- [ ] Hoàn thiện kiểm tra phạm vi từng phân hệ trước khi bật đồng bộ Role (theo lựa chọn người dùng)
- [x] Liên kết Role gốc dạng chưa kích hoạt cho chức vụ Base/Biz; xem quyền Role, đề xuất bảo thủ, lưu nguyên tử có lý do/nhật ký/chống ghi đè (0307)
- [ ] Đối chiếu có tác động quyền và xác nhận trước khi cấp cho nhân sự cũ — chưa triển khai, phụ thuộc hoàn thiện kiểm tra phạm vi
- [ ] Cấp/thu hồi theo nguồn bổ nhiệm; giữ Role trực tiếp, ngoại lệ và phạm vi nghiệp vụ
- [x] Giao diện thiết lập Role chính/bổ sung và phạm vi đề xuất; nhân sự xem Role trực tiếp/Role chức vụ chưa cấp quyền
- [ ] Xem trước quyền thực tế và cấp/thu hồi nguồn hiệu lực — chưa triển khai, phụ thuộc hoàn thiện kiểm tra phạm vi
- [x] 69/69 kiểm thử đạt; build OK; không sửa quyền nhân sự thật, không Publish
- [ ] Nghiệm thu màn hình sau đăng nhập — không tạo được phiên cho người yêu cầu; cần đăng nhập Preview

## Hoàn thiện Cơ cấu tổ chức toàn Base (xong phần code)
- [x] Backend: quyền org.* có phạm vi đơn vị, RPC áp dụng phân công nguyên tử có kiểm tra phạm vi (migration 0306); org.manage_structure/org.manage_permissions còn bản nháp
- [x] Drawer quản lý đơn vị 5 tab: Nhân sự / Chức vụ & Cấp bậc / Phân quyền / Lịch sử / Cài đặt đơn vị
- [x] Gán nhiều nhân sự bằng checkbox (tìm kiếm, lọc chưa phân công/đơn vị khác, chọn tất cả, báo lỗi từng người)
- [x] Điều chuyển + kiêm nhiệm toàn Base (kết thúc phân công cũ có xác nhận khi đụng vị trí quản lý)
- [x] Xem trước dễ đọc (không JSON thô); chỉ bắt nhập ÁP DỤNG PHÂN QUYỀN khi thật sự sửa quyền
- [x] Lọc chức danh theo đơn vị ở tab Nhân sự
- [x] 28/28 test orgStructure, 53/53 gồm basePermissions, typecheck/build OK, cổng RPC xác thực đúng
- [ ] Nghiệm thu sau đăng nhập trên Preview — chờ người dùng

## Trung tâm Phê duyệt toàn Base (xong phần code)
- [x] Mở rộng `approval_center_read` 15 nguồn, deep link, nhóm lọc, cô lập lỗi
- [ ] Nghiệm thu sau đăng nhập trên Preview — chờ người dùng đăng nhập

## Chuẩn hóa Cơ cấu tổ chức, Chức vụ, Cấp bậc toàn Base (xong phần code)
- [x] Chức danh chuẩn: mã ổn định, cấp bậc 0–5, loại Quản lý/Nhân viên, số người tối đa; seed 11 chức danh có cấp bậc, backfill chức danh cũ không đổi tên/quyền
- [x] Không đoán quản lý theo tên với dữ liệu mới (kind rõ ràng; name-inference chỉ fallback dữ liệu cũ)
- [x] Sơ đồ: nhãn Cấp N + Quản lý, ô quản lý/cấp cao xếp trước, "Chưa phân công" giữ nguyên
- [x] Cài đặt 3 nhóm: Đơn vị tổ chức / Chức vụ & Cấp bậc (sửa đơn vị, cấp, loại, số người, mô tả + Chỉnh quyền mặc định kèm số người ảnh hưởng) / Bộ quyền bổ sung
- [x] Nhật ký hiển thị thay đổi tổ chức (gán/bỏ gán/đổi cấp/đổi tên) + thay đổi quyền (migration 0305 trả before/after config)
- [x] Giữ nguyên: Role cũ, backend Kinh doanh, fence 6 quyền kích hoạt, quy trình Xem trước → ÁP DỤNG PHÂN QUYỀN
- [x] 17/17 test orgStructure, 25/25 basePermissions, typecheck/build OK, không lỗi JS
- [ ] Nghiệm thu sau đăng nhập trên Preview — chờ người dùng (không mint được session: tài khoản chưa có trong auth)

## Hợp nhất Cơ cấu tổ chức toàn Base, gỡ cơ cấu Kinh doanh cũ (xong phần code)
- [x] Một nơi quản lý duy nhất: /organization — sơ đồ 3 khối, bổ nhiệm/thay đổi/miễn nhiệm/lịch sử ngay trên sơ đồ cho đơn vị Kinh doanh (leaderCode + biz scope trên ChartNode), bổ nhiệm GĐĐH/Phó GĐĐH trên thẻ điều hành
- [x] Nhúng quản lý chi tiết Khối Kinh doanh (Hệ/Phòng/Nhóm/nhân sự/điều chuyển) và Chức vụ Kinh doanh vào trang Cơ cấu tổ chức — ghi qua đúng biz_org_save/biz_appointment_save/biz_position_save, không di trú dữ liệu, không đồng bộ hai chiều
- [x] Gỡ 3 tab trùng lặp trong Kinh doanh → Cài đặt (Cơ cấu tổ chức, Chức vụ & Cấp bậc, Phân quyền); giữ Quy trình/KR/Deadline/Quản trị nâng cao (quyền ngoại lệ có kiểm toán nằm trong Quản trị nâng cao); người chỉ có quyền cơ cấu thấy thông báo điều hướng tới /organization
- [x] Giữ nguyên backend quyền: biz_can/biz_scope_ok/biz_appointments không đổi; không cấp quyền rộng hơn; bảng biz_* vẫn là kho vận hành
- [x] 21/21 test orgChart+orgStructure, 56/56 hồi quy biz organization/positions + basePermissions, typecheck/build OK
- [ ] Nghiệm thu sau đăng nhập trên Preview — chờ người dùng
