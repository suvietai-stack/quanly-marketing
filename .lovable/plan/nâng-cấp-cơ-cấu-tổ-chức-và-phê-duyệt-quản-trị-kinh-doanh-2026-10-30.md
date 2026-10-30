# Nâng cấp cơ cấu tổ chức và phê duyệt Quản trị Kinh doanh

## Kết quả kiểm tra hiện tại
- Có **3 phòng**, **9 thành viên đang thuộc phòng**, **14 bản ghi lịch sử thành viên**, **7 chỉ số KR**, **2 mục tiêu năm** (1 nháp, 1 chờ duyệt) và **1 Kế hoạch đã nộp**. Có 2 phân công Trưởng phòng hiện hành; chưa có Hệ, Nhóm hoặc phân công Giám Đốc/Trưởng Nhóm.
- Ba phòng hiện hữu: **Kinh doanh Sứ Quà Tặng 1**, **Kinh Doanh Quà Tặng 2**, **Kinh doanh Phân Phối 1**. Tên gần giống cấu hình mới nhưng **chưa có ánh xạ được xác nhận**.
- Mục tiêu và Báo cáo hiện duyệt một lần để thành chính thức, có khóa chống xử lý trùng và lưu phiên bản/lịch sử. Kế hoạch đã bỏ bước duyệt; chỉ nộp, yêu cầu sửa và nộp lại.
- Nâng cấp trên các phần đang có, không tạo hệ thống tài khoản, thông báo hoặc hồ sơ kinh doanh thứ hai.

## 1. Cơ cấu tổ chức và chuyển tiếp an toàn
- Tại **Quản trị Kinh doanh → Cài đặt → Cơ cấu tổ chức**, thêm cây **Khối → Hệ → Phòng → Nhóm → Nhân viên**, mở/thu từng nhánh, tìm nhân viên, thêm/sửa/ngừng sử dụng đơn vị và xem lịch sử.
- Khởi tạo 3 Hệ đúng đặc tả; trình bày 4 phòng đích để Super Admin xác nhận dùng phòng cũ hay tạo phòng mới. **Không tự gắn, đổi tên hoặc gộp phòng cũ**. Phòng chưa ánh xạ vẫn xem và sử dụng theo cơ chế cũ, có nhãn rõ ràng.
- Giữ nguyên ID phòng cũ khi xác nhận gắn vào Hệ; giữ hồ sơ và KR đã có. KR Bán Lẻ để chưa cấu hình, không tự sao chép hoặc suy diễn.
- Dùng tài khoản nhân sự hiện có; quản lý riêng lịch sử thuộc Phòng/Nhóm và lịch sử phụ trách Giám Đốc/Trưởng Phòng/Trưởng Nhóm. Mỗi Hệ chỉ một Giám Đốc chính thức tại một thời điểm; không tự chuyển 2 phân công quản lý cũ thành chức danh mới chưa xác nhận.
- Điều chuyển có thời điểm hiệu lực và lịch sử; không đổi cơ cấu đã ghi nhận trên hồ sơ/phiên bản đã chốt. Ngừng đơn vị có phụ thuộc hoạt động phải được xử lý rõ ràng trước, không xóa cứng dữ liệu.

## 2. Phạm vi và quyền
- Tách **chức danh**, **phạm vi quản lý** và **quyền hành động**; không cấp quyền duyệt hoặc quản trị chỉ vì được gán chức danh.
- Dùng Role/Permission chung, thêm quyền quản lý cơ cấu, cấu hình quy trình, xem Trung tâm và can thiệp luồng. Người được giao xử lý có thể đọc đúng hồ sơ được giao, không được mở rộng ra dữ liệu ngoài phạm vi.
- Giám Đốc chỉ phạm vi Hệ phụ trách; Trưởng Phòng trong Phòng; Trưởng Nhóm trong Nhóm. Quyền xem toàn Khối phải được cấp riêng. Super Admin toàn quyền và không cần thuộc phòng.
- Áp dụng cùng quy tắc phía máy chủ cho danh sách, chi tiết, bộ đếm, dashboard và xuất dữ liệu. Dữ liệu lịch sử tiếp tục quy thuộc đúng phòng và cơ cấu tại thời điểm nghiệp vụ.

## 3. Quy trình phê duyệt tùy chỉnh
- Tại **Cài đặt → Quy trình phê duyệt**, cấu hình tên, Hệ/Phòng, loại hồ sơ KR Năm/Báo cáo Tháng–Quý–Năm, ngày hiệu lực, trạng thái và các cấp có thể thêm/xóa/đổi thứ tự.
- Mỗi cấp chọn chức danh hoặc người cụ thể, người thay thế và xem trước sơ đồ. Kiểm tra phạm vi, quyền xử lý, người thay thế và cảnh báo thiếu người hoặc tự duyệt; **không tự bỏ qua cấp thiếu người**.
- Có mẫu **Trưởng Nhóm → Trưởng Phòng → Giám Đốc**, nhưng không kích hoạt trên phòng chưa ánh xạ hoặc chưa đủ quản lý. Các ví dụ báo cáo 1/2 cấp không tự áp dụng.
- Cấu hình điểm bắt đầu theo chức danh người nộp: nhân viên từ Trưởng Nhóm, Trưởng Nhóm từ Trưởng Phòng, Trưởng Phòng từ Giám Đốc; Giám Đốc cần nhánh đặc biệt hoặc Super Admin xử lý. Không cho tự duyệt ở cấp thường.
- Khi nộp, chụp phiên bản quy trình, cơ cấu và người xử lý; sửa quy trình sau đó không âm thầm thay hồ sơ đang chạy. Đổi người xử lý/can thiệp hồ sơ đang chạy cần thao tác riêng và lưu vết.
- Mục tiêu đang chờ duyệt giữ cơ chế hiện tại, không tự chuyển luồng. Có thao tác Super Admin xem trước/xác nhận chuyển sang luồng mới nếu cần; hồ sơ mới dùng cấu hình có hiệu lực, còn đơn vị chưa chuyển tiếp giữ cơ chế cũ với nhãn rõ ràng.

## 4. Xử lý từng cấp và bảo toàn dữ liệu chính thức
- Duyệt chỉ khi đúng cấp/đúng phiên bản/đúng người và có quyền; lưu người, thời gian, nhận xét và chuyển đến cấp tiếp theo trong cùng thao tác an toàn.
- Chỉ cấp cuối hoàn tất mới chốt mục tiêu hoặc đưa Báo cáo thành số liệu chính thức. Các cấp trước không thay baseline hoặc số chính thức trên dashboard.
- Yêu cầu sửa bắt buộc lý do, trả về người nộp; phiên bản mới mặc định chạy lại từ đầu. Cho phép cấu hình cách chạy lại rõ ràng, không kế thừa duyệt cũ ngầm.
- Chặn duyệt trùng và hai thiết bị xử lý đồng thời. Thông báo Base đúng người cấp tiếp theo/người nộp, chống trùng; không thêm gửi Zalo/Push.
- Super Admin có thao tác can thiệp riêng, bắt buộc lý do và lưu vết; không dùng nút duyệt thường để vượt quy tắc tự duyệt.

## 5. Trung tâm Phê duyệt
- Thêm **Phê duyệt** trong menu Quản trị Kinh doanh, hiển thị theo quyền hoặc hồ sơ được giao; Super Admin luôn thấy.
- Các tổng số: Chờ tôi xử lý, Đang trình duyệt, Đã hoàn tất, Bị trả lại, Quá hạn xử lý; các tab Chờ tôi xử lý/Đang trình duyệt/Đã xử lý/Tất cả hồ sơ theo phạm vi.
- Danh sách có người gửi, Hệ/Phòng/Nhóm, loại/kỳ, thời điểm gửi, cấp hiện tại, người chờ xử lý, trạng thái và thời gian chờ; tìm tên và lọc cơ cấu, nhân viên, kỳ, loại, trạng thái, cấp.
- Chi tiết KR ưu tiên tổng năm/quý, mở bảng 12 tháng khi cần; Báo cáo có mục tiêu/thực tế/tỷ lệ/chênh lệch, biểu đồ, Google Docs và lịch sử các cấp. Tái sử dụng phần chi tiết hiện có, không bắt người duyệt đi qua biểu mẫu nhập dài.
- Quá hạn xử lý chỉ tính khi quy trình có hạn xử lý được cấu hình; chưa có hạn hiển thị chưa cấu hình, không lấy nhầm deadline nộp hồ sơ làm deadline người duyệt.
- Yêu cầu sửa Kế hoạch là nhóm theo dõi riêng, **không nằm trong số hồ sơ chờ duyệt**. Giữ nguyên nộp đầu/đúng hạn, lịch sử sửa và quyền yêu cầu sửa hiện có.

## 6. Kiểm thử và nghiệm thu
- Kiểm từng quy tắc bằng dữ liệu kiểm thử tách biệt: cơ cấu/lịch sử, một Giám Đốc mỗi Hệ, quyền và phạm vi, điểm bắt đầu theo chức danh, thiếu người, người thay thế, không tự duyệt, thứ tự cấp, trả lại/nộp lại, phiên bản quy trình và can thiệp Super Admin.
- Kiểm đồng thời: hai lượt duyệt chỉ một lượt thành công, cấp cuối chỉ chốt một lần, thông báo không trùng. Kiểm số chính thức trước/sau duyệt cuối và Kế hoạch không bị đưa vào luồng duyệt.
- Kiểm giao diện máy tính/điện thoại, sáng/tối; dùng phiên thật để đọc dữ liệu đang có, không tạo nhân sự, hồ sơ, số kinh doanh hoặc gửi thông báo thử trên dữ liệu vận hành dùng chung.
- Nghiệm thu ghi/duyệt thật cần cơ cấu, người quản lý, quy trình và hồ sơ thực tế do Admin xác nhận. Báo rõ phần đã kiểm và phần chờ xác nhận.
- **Chưa Publish.** Lưu ý: thay đổi dữ liệu/cấu hình Lovable Cloud tác động dữ liệu dùng chung; không tự ánh xạ, phân công hoặc kích hoạt luồng chỉ vì đang xem Preview.

## Chi tiết kỹ thuật
- Bổ sung cấu trúc tổ chức có hiệu lực, lịch sử quản lý, quy trình/phiên bản/cấp, phiên xét duyệt và nhật ký; giữ `biz_departments`, các bảng mục tiêu/tài liệu/phiên bản và lịch sử hiện có.
- Tiếp tục dùng `biz_*` RPC kiểm quyền phía máy chủ, khóa hàng và revision; cập nhật đồng bộ tất cả đường ghi cũ để không thể bỏ qua cấp mới. Bảng mới có GRANT/RLS tối thiểu, không mở ghi trực tiếp từ trình duyệt.
- Luồng mới tham chiếu chính phiên bản KR/Báo cáo hiện tại; snapshot cơ cấu/quy trình/người xử lý và giữ numeric strings/NULL, thống kê tháng gốc không cộng trùng.
- Tái sử dụng các thành phần trong `src/components/biz`, truy vấn/cache gắn người dùng và Role store. Bổ sung trang `/biz/approvals` có metadata riêng; không thay các module nghiệp vụ khác.
- Thực hiện theo thứ tự: **cơ cấu và ánh xạ → quyền/phạm vi → cấu hình và máy xét duyệt → Trung tâm → dashboard và kiểm thử**, kiểm mỗi bước trước khi nối bước tiếp theo.