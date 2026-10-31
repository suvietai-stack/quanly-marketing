# Đồng bộ nhân sự, chức vụ và cơ cấu Kinh doanh

## Đối chiếu hiện tại
- Thêm/điều chuyển thành viên hiện kết thúc các Nhóm cũ, nhưng không tự tạo chức vụ Nhân viên và không xử lý bổ nhiệm quản lý liên quan.
- Bổ nhiệm đã kiểm tra quyền, khóa chống xung đột và lưu lịch sử, nhưng chưa tự đồng bộ thành viên vào đơn vị.
- Danh mục chức vụ dùng chung; quyền Kinh doanh đã suy ra từ bổ nhiệm. Không cần gán thêm Role tài khoản.
- Hiển thị quản lý còn chọn bản ghi đầu tiên; thiếu chức danh chính và tổng hợp các chức vụ kiêm nhiệm.
- Dữ liệu đối chiếu: 13 bổ nhiệm, 25 bản ghi thành viên Phòng, 0 thành viên Nhóm, 3 hồ sơ, 1 mục tiêu năm. Không tự sửa hàng loạt những bản ghi này.

## 1. Một thao tác, đồng bộ nguyên tử
- Thêm vào Nhóm/Phòng: tạo thành viên nếu chưa có; tự bổ nhiệm Nhân viên Kinh doanh từ danh mục dùng chung khi chưa có chức vụ hiệu lực. Không hạ chức người đang quản lý.
- Bổ nhiệm Trưởng Nhóm: suy ra Phòng/Hệ, thêm thành viên đúng Nhóm nếu cần, không tạo trùng. Trưởng Phòng xuất hiện tại Phòng, không thêm vào mọi Nhóm; Giám Đốc Hệ và điều hành không bị thêm vào từng Phòng hoặc phát sinh nghĩa vụ cá nhân do bổ nhiệm.
- Khi thay đổi đơn vị, chọn rõ Điều chuyển hoặc Kiêm nhiệm. Điều chuyển phải xác nhận các bổ nhiệm/phân công bị kết thúc; nếu chưa xác định đầy đủ thì chặn, không âm thầm giữ quyền cũ. Kiêm nhiệm giữ các phạm vi hợp lệ.
- Kết thúc chức quản lý cuối cùng: trở về chức Nhân viên tại đơn vị còn hợp lệ; không xóa tài khoản hay hồ sơ. Ngày hiệu lực và kết thúc được kiểm tra ở nơi xử lý dữ liệu.
- Bảo vệ chống trùng, nhiệm kỳ xung đột và rollback toàn bộ khi một bước không hợp lệ. Không tự cấp chức vụ hay quyền cho người gọi trái thẩm quyền.

## 2. Hiển thị và thao tác quản trị
- Tách Thêm nhân viên, Điều chuyển, Bổ nhiệm và Kết thúc bổ nhiệm.
- Form mở từ đơn vị tự chọn chức vụ/phạm vi tương ứng từ danh mục; đổi chức vụ gợi ý Thay thế, không mặc định Kiêm nhiệm.
- Chức danh chính là cấp cao nhất còn hiệu lực; đồng cấp dùng quy tắc ổn định theo thời điểm và ID, không chọn ngẫu nhiên. Tất cả chức kiêm nhiệm và phạm vi vẫn giữ nguyên.
- Bấm tên mở tổng hợp chức danh, đơn vị, quyền hiệu lực, ngày hiệu lực và lịch sử; cây không lặp Trưởng Nhóm trong danh sách nhân viên.
- Thống kê danh mục đếm người duy nhất còn hiệu lực; thay đổi danh mục không viết lại snapshot hoặc vô tình mở rộng bổ nhiệm cũ.

## 3. Quyền và phê duyệt
- Giữ cơ chế quyền tự động hiện có và ngoại lệ quản trị đã thống nhất; không ghi thêm/xóa Role Base, không ảnh hưởng module khác.
- Quyền quản lý là hợp các bổ nhiệm hiệu lực, không chỉ chức danh chính. Mọi truy vấn mới kiểm tra phạm vi ở nơi xử lý dữ liệu.
- Các thay đổi làm mới cơ cấu, chức vụ, quyền, hồ sơ và Trung tâm Phê duyệt, không cần đăng nhập lại.
- Hồ sơ mới xác định người duyệt từ phân công hợp lệ. Hồ sơ đang chờ có cảnh báo và chuyển giao có kiểm soát qua cơ chế hiện có; không tự sửa lịch sử, tự duyệt hoặc bỏ bước bắt buộc.

## Chi tiết kỹ thuật
- Migration cộng thêm qua công cụ quản lý migration; tái sử dụng khóa `biz_org_structure`, bổ nhiệm và các guard hiện tại.
- Đồng bộ đặt trong RPC đã xác thực, không nối nhiều lần ghi độc lập từ giao diện. Các đường ghi thành viên/bổ nhiệm hiện hữu phải cùng tuân thủ quy tắc; không để đường cũ bỏ qua đồng bộ.
- Chuẩn hóa `BizOrganization`, `BizAppointments`, `BizPositions` cùng các query/helper hiện có; bổ sung thành phần chi tiết nhân sự nhỏ, không viết lại module.
- Giữ `biz_can`, snapshot bổ nhiệm, lịch sử tổ chức và luồng phê duyệt làm ranh giới quyền; không dùng chức danh hiển thị để cấp quyền.

## Kiểm thử và nghiệm thu
- Kiểm thử từng quy tắc trong 28 tình huống yêu cầu: cấp 0, không hạ chức, đồng bộ đơn vị, kiêm nhiệm/cấp cao nhất, kết thúc/điều chuyển, chống trùng, quyền, duyệt đúng lượt và lịch sử.
- Thử dữ liệu trong môi trường kiểm thử cô lập, không tạo DEMO hoặc hồ sơ thử trên dữ liệu chung.
- Kiểm giao diện desktop/mobile 360–430px và luồng thực tế đọc bằng phiên được phép; thao tác ghi nhân sự thật chỉ khi có quyết định bổ nhiệm/điều chuyển cụ thể.
- Báo cáo các cơ chế, component/RPC/migration, kết quả kiểm thử và đối soát trước/sau; nêu rõ phần chưa nghiệm thu bằng tài khoản thật.
- Chưa Publish. Database của Preview và app công khai dùng chung: migration không thay đổi hàng loạt phân công/hồ sơ thật, nhưng quy tắc ghi mới áp dụng ngay sau khi migration chạy.