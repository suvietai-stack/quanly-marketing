# Chuẩn hóa sáu nhóm khách và thông tin CRM tùy chỉnh

## Phạm vi
Nâng cấp CRM Khách Hàng hiện có; ưu tiên tạo khách nhanh trên Mobile. Giữ nguyên quyền theo cơ cấu Kinh doanh, lịch chăm sóc, người liên hệ, lịch sử, Sale phụ trách, đường dẫn và Mobile Launcher. Không Publish.

## Hiện trạng đã kiểm tra
- Có năm nhóm gốc đang sử dụng; chưa có nhóm Siêu thị / Cửa hàng (Sỉ).
- Khách sỉ / Đại lý là nhóm cũ pha trộn, có hai khối con Sỉ đồ thờ và Trung gian quà tặng; không được suy luận tương đương Khách sỉ.
- Tại thời điểm kiểm kê: 0 khách, 0 người liên hệ, 0 lịch chăm sóc, 0 tương tác CRM. Kiểm tra lại trước khi chuẩn hóa vì dữ liệu có thể thay đổi.
- Đã có cây danh mục, tệp theo nhóm, phạm vi `group_ids`, báo cáo lịch sử và quyền CRM. Hiện phạm vi rỗng vẫn được xem là dùng chung; thông tin chuyên sâu còn là các ô cố định lưu theo tên.

## 1. Chuẩn hóa danh mục an toàn
- Sáu nhóm khởi tạo: Khách quà tặng trực tiếp; Trung gian quà tặng; Khách sỉ; Đại lý / Sỉ Đồ thờ; Bát Đĩa Nhà Hàng; Siêu thị / Cửa hàng (Sỉ).
- Đổi tên nhóm tương đương bằng ID hiện có; chỉ thêm nhóm thiếu. Tệp, đặc điểm và trường khởi tạo theo tài liệu, kiểm tra trùng trước khi thêm; không ghi đè tùy chỉnh hiện hữu.
- Giữ ID và cấu trúc nhóm cũ Khách sỉ / Đại lý. Ngừng cho chọn mới nhóm cũ nếu kiểm kê lại xác nhận không có hồ sơ sử dụng; nếu đã có hồ sơ, giữ nguyên và đưa vào danh sách cần rà soát. Không chuyển khách tự động.
- Giữ các khối/tệp cũ; tái dùng mục tương đương khi đủ bằng chứng. Không ép mọi nhóm có ba cấp.
- Người có quyền tiếp tục thêm, sửa tên/mô tả, sắp xếp và ngừng sử dụng nhóm/tệp; đổi cha phải kiểm tra tác động.

## 2. Đặc điểm và trường chuyên sâu động
- Phạm vi rõ ràng: dùng chung có chủ đích, nhóm được chọn hoặc tệp được chọn. Phạm vi rỗng không hiển thị rộng; mục cũ chưa rõ phạm vi được đánh dấu cần cấu hình, giữ các liên kết đã lưu.
- Chưa chọn nhóm không hiện đặc điểm/trường chuyên sâu. Quà tặng trực tiếp và Bát Đĩa Nhà Hàng không tự hiện Có cửa hàng/Bán Online.
- Hỗ trợ chín kiểu trường: văn bản ngắn/dài, số, tiền, ngày, Có/Không, chọn một/nhiều và URL. Mặc định không bắt buộc.
- ID trường và lựa chọn ổn định; cấu hình tên, hướng dẫn, phạm vi, thứ tự, trạng thái và bắt buộc. Kế thừa nhóm + tệp không tạo trường trùng.
- Ngừng trường/lựa chọn không xóa giá trị cũ; chặn đổi kiểu khi đã có dữ liệu nếu chưa có quy trình chuyển đổi an toàn.

## 3. Cài đặt và biểu mẫu
- Cài đặt tập trung: Nhóm & Tệp khách; Đặc điểm kinh doanh; Trường thông tin chuyên sâu; Danh mục CRM khác; Phân quyền CRM. Giữ Mẫu chăm sóc hiện có.
- Cây nhóm/tệp có tìm kiếm, thêm tệp ngay trong nhóm, số hồ sơ sử dụng và thao tác sắp xếp. Cấu hình trường có xem trước theo nhóm/tệp.
- Form tạo khách chỉ mở sẵn thông tin tối thiểu; Đặc điểm, Chuyên sâu và Mở rộng thu gọn. Nhóm/tệp tìm kiếm được.
- Đổi nhóm/tệp cảnh báo tác động; thông tin chung và giá trị nhóm cũ được giữ, quay lại nhóm cũ hiện lại. Giá trị ngoài phạm vi không được tự gắn hoặc thống kê cho nhóm mới.
- Thông tin chuyên sâu cũ theo tên được giữ nguyên như dữ liệu lịch sử, không tự đoán ánh xạ sang trường mới.

## 4. Bộ lọc và báo cáo
- Dùng chung định nghĩa với form; danh mục/trường mới tự xuất hiện trong lựa chọn lọc và phân tích.
- Lọc đặc điểm, lựa chọn một/nhiều, Có/Không, văn bản/URL và khoảng số/tiền/ngày.
- Chọn trường phân tích: cơ cấu lựa chọn, số hồ sơ có dữ liệu và tổng hợp phù hợp theo kiểu; bấm xem khách và xuất đúng tập lọc khi có quyền.
- Phân biệt khách duy nhất và lượt gắn lựa chọn; tổng không cộng trùng. Chỉ tính giá trị phù hợp nhóm/tệp tại thời điểm báo cáo, không dùng cấu hình/giá trị tương lai để thay số quá khứ.
- Giữ so sánh Sale/Nhóm/Phòng/Hệ qua phạm vi tổ chức hiện có; không mở quyền quản lý thành quyền sửa/cài đặt.

## Chi tiết kỹ thuật
- Tái dùng `crm_catalogs`, quan hệ cha và cơ chế RPC CRM hiện có; bổ sung cấu trúc định nghĩa/giá trị trường theo ID ổn định cùng lịch sử cấu hình/giá trị cần cho báo cáo. Không cần sửa schema khi quản trị viên thêm trường.
- Các thay đổi schema chỉ bổ sung, qua công cụ migration; cấp GRANT/RLS đúng quyền. Dữ liệu danh mục khởi tạo được thêm bằng thao tác dữ liệu chống trùng, không dùng migration chỉ để seed.
- Ghi cấu hình/giá trị qua RPC kiểm tra `biz.crm_*`, phạm vi, kiểu và revision phía máy chủ; phối hợp khóa với lưu danh mục/khách hiện có. Không tạo quyền hoặc hệ CRM song song.
- Báo cáo mở rộng từ nguồn lịch sử `crm_report_filtered`/`crm_report`, lọc đồng bộ khách và lịch/tương tác; không tải dữ liệu vượt quyền rồi lọc ở trình duyệt.

## Kiểm chứng và nghiệm thu
- Kiểm kê trước/sau ID, liên kết, số khách/liên hệ/lịch/tương tác và mục đã sử dụng; chạy lại khởi tạo không trùng.
- Kiểm thử chín kiểu, phạm vi nhóm/tệp/dùng chung, kế thừa, bắt buộc, lựa chọn ngừng dùng, đổi kiểu bị chặn, đổi nhóm giữ giá trị và quyền không hợp lệ.
- Kiểm thử lọc khoảng, chọn nhiều không cộng trùng, dữ liệu lịch sử, quyền xuất và phạm vi tổ chức; hồi quy chăm sóc và báo cáo hiện có.
- Kiểm tra Mobile/Desktop: tạo → lưu → mở lại → đổi nhóm → quay lại → lọc/báo cáo; cấu hình trường mới và lỗi/thử lại, không tràn ngang.
- Nghiệm thu phiên thật cần phiên được phép và hồ sơ được người dùng cho phép; không tạo khách giả trên dữ liệu dùng chung. Nêu rõ phần chưa xác minh nếu thiếu điều kiện.

## Lưu ý triển khai
Lovable Cloud dùng chung dữ liệu cho Preview và ứng dụng đã Publish: thay đổi danh mục/quy tắc máy chủ có hiệu lực trên dữ liệu chung dù chưa Publish giao diện. Không xóa hoặc phân loại lại khách; đối soát lại ngay trước mỗi thay đổi dữ liệu.