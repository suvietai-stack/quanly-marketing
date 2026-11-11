# Chuẩn hóa toàn kho Role Base Sứ Việt

## Phạm vi đã chốt
Chuẩn hóa trên bản nháp/Preview, dùng **kho Role và ma trận hiện có**. Không Publish, không ghi quyền live, không tự bổ nhiệm hay xóa dữ liệu. Việc giảm quyền đã được đồng ý về nguyên tắc; danh sách cụ thể và thời điểm áp dụng sẽ được trình sau kiểm thử.

## Kết quả kiểm kê ban đầu
Đã đọc lại database: **33 Role**, gồm 20 vị trí chuẩn, 5 nhiệm vụ Marketing, 6 đã ngừng và 2 hệ thống. Nhân sự mới và Đóng hàng là Role vị trí có `is_system=true`, được bảo vệ riêng. Lead Kinh Doanh ĐH được giữ để phục vụ vị trí tương lai; không đề nghị xóa chỉ vì chưa có người nhận.

Ma trận hiện dùng danh sách quyền đã kiểm chứng khá hẹp. Một số quyền CRM/Kinh doanh/kho chưa có hợp đồng an toàn trong danh sách này: sẽ hiện **Chưa cấu hình**, không tự cấp hoặc tuyên bố đủ nghiệp vụ. `catalog_pending` không được tính vào quyền hiện hành.

## Thực hiện
1. **Kiểm kê đủ 33 Role và phụ thuộc**
   - Chụp dữ liệu chỉ đọc; đối chiếu chức danh, bổ nhiệm, ô vị trí, nhiệm vụ, Role trực tiếp, quyền riêng, code, RPC, migrations và lịch sử.
   - Phân biệt người có liên kết, người có nguồn hiệu lực và người thực sự thay đổi quyền; không cộng trùng người kiêm nhiệm.
   - Giữ 2 hệ thống, 2 vị trí được bảo vệ, Thiết kế/Chụp ảnh và cả 6 Role đã ngừng. Chưa gộp/xóa vật lý khi chưa có căn cứ và xác nhận riêng.
2. **Bộ gợi ý tối giản cho toàn bộ 20 vị trí + 5 nhiệm vụ**
   - Nhân sự mới/Marketing: tác vụ cá nhân chung; không mặc định quyền Thiết kế.
   - Kinh doanh/Showroom/Phân phối: chăm sóc khách của mình và tác vụ được giao, chỉ khi nguồn và phạm vi đã được kiểm chứng.
   - Quản lý nhóm/phòng/điều hành: chỉ quyền xem đúng phạm vi đã được kiểm chứng; không mặc định xem toàn công ty.
   - HCNS/kế toán/thu mua/đóng hàng/thiết kế: giữ tác vụ đúng trách nhiệm; phần chưa an toàn ghi rõ Chưa cấu hình.
   - Content/SEO/Local SEO/Social/Video: bộ chuyên môn riêng tối giản, loại quyền ngoại module khỏi **gợi ý**, không tạo bộ lọc module trong cơ chế cấp quyền.
   - Không gợi ý quản trị, phân quyền, xóa/phục hồi, duyệt nhạy cảm, xuất rộng hoặc toàn cục. Gợi ý chỉ vào bản nháp do Admin chọn, không tự seed lại Role.
3. **Ma trận dễ dùng trong một kho duy nhất**
   - Giữ danh sách trái/dropdown điện thoại, ma trận phải, tìm kiếm và lọc quyền đã/chưa chọn, nhóm đóng/mở, số quyền và phạm vi.
   - Thêm đối chiếu bộ tối giản cho từng Role: quyền giữ/bỏ, chưa cấu hình, phụ thuộc và số người liên quan. Nhạy cảm cần chọn từng quyền; không chọn tất cả toàn kho.
   - Giữ ba khu Role & ma trận / Sơ đồ & Bổ nhiệm / Hồ sơ & quyền riêng; không thêm màn hình chỉnh Role song song.
4. **Quy trình áp dụng và phục hồi — chỉ chuẩn bị PENDING**
   - Dùng cổng `role_catalog_change` hiện có; không chạy UPDATE Role hàng loạt ngoài cổng.
   - Chuẩn bị snapshot, preview theo từng người/quyền/nguồn/phạm vi, xác nhận, apply có kiểm tra dữ liệu thay đổi, audit và phục hồi chống ghi đè thay đổi mới.
   - Kiểm chứng đồng bộ `enabled_permissions` và chữ ký bổ nhiệm sau chỉnh Role; không vô tình mở thêm snapshot chưa được duyệt. Báo rõ khoảng trống nếu quyền mới tích chưa thể kích hoạt qua nguồn cũ.
   - Rà lại 0371 sau khi có bộ tối giản: sửa chặn nhiệm vụ Marketing của tài khoản reset, giữ điều kiện Marketing cho cả hai nguồn, nhiều nhiệm vụ hợp quyền và hết bổ nhiệm thì mất quyền. Không áp Content 90 quyền nguyên trạng.
5. **Kiểm thử và bàn giao**
   - Test đủ phân loại 33 Role, bộ gợi ý và quyền bị loại; PGlite cho preview/apply/restore, bảo vệ hệ thống, chữ ký, nhiều nguồn, kiêm nhiệm, phạm vi đơn vị, Ngọc giả lập và quyền riêng A/B.
   - Chạy hồi quy cache/quyền/auth và các phân hệ CRM, 3K, Tín hiệu, Marketing, Thiết kế, đơn hàng, Tiền Về, Phê duyệt; báo riêng lỗi có sẵn.
   - Kiểm tra Preview desktop/mobile bằng phiên được ủy quyền nếu có; không yêu cầu mật khẩu, không thực hiện thao tác ghi live. Benchmark cùng phiên và điều kiện.
   - Bàn giao bảng trước/sau từng Role, diff từng quyền, người/nguồn ảnh hưởng, phụ thuộc, SQL PENDING và quyết định cuối cần chủ dự án xác nhận. **Không coi production đã hoàn tất khi chưa cutover.**

## Chi tiết kỹ thuật
- Bộ gợi ý ánh xạ ID Role hiện hữu sang trách nhiệm được audit; không suy diễn tên/prefix tại resolver và không tạo Role mới chồng lên.
- Quyền gợi ý phải tồn tại trong danh mục và giao với capability backend đúng nguồn; mở rộng capability chỉ sau kiểm chứng gate/scope, chưa áp database.
- Giữ cache quyền memory per-user hiện tại; thay đổi qua cổng quản trị invalidates/refreshes đúng người, không thêm cache persistent.
- Migrations chuẩn bị nằm trong `docs/pending`, không gọi công cụ áp migration; kiểm thử SQL chỉ trên database cô lập.
- Chỉ xóa code khi chứng minh không còn caller/phụ thuộc; không dọn lan sang startup hay workflow khác.