# Đồng bộ Role hiện có với chức vụ, hoàn thiện phạm vi trước

## Mục tiêu và nguyên tắc
- Dùng danh sách Role gốc tại **Cài đặt → Tài khoản & Phân quyền**; chức vụ tham chiếu ID Role, không sao chép quyền hay tạo Role thứ hai.
- **Hoàn thiện kiểm tra phạm vi tại các phân hệ trước khi bật đồng bộ**, theo lựa chọn của bạn.
- Giữ nguyên Role trực tiếp, quyền riêng, ngoại lệ, dữ liệu và lịch sử hiện tại. Không gán Role hay thay quyền nhân sự cũ khi chưa đối chiếu và xác nhận.
- Cấp bậc và tên chức vụ không tự cấp quyền. Super Admin không thể được kế thừa từ chức vụ; Role nhạy cảm chỉ được áp dụng qua cổng quản trị hiện có.
- Không Publish. Lưu ý: thay đổi phía máy chủ dùng chung Preview và ứng dụng đã xuất bản; vì vậy cấu trúc mới phải mặc định chưa kích hoạt và không thay hành vi cấp quyền hiện tại.

## Hiện trạng đã xác minh
- Có **18 Role gốc**, gồm Admin, Super Admin, Content Web, Cung Ứng, Designer / Chụp ảnh, Giám Đốc Kinh Doanh, Hành Chính Nhân Sự, Kế Toán, Kinh doanh Đơn Hàng, Kinh Doanh Phân Phối, Lead Kinh Doanh ĐH, Leader Marketing, Local SEO, SEO, Showroom, Social, Video và Viewer / Ban Giám Đốc.
- Cơ cấu Base có 11 chức vụ và chưa có phân công trong cấu hình được đọc; dữ liệu bổ nhiệm Kinh doanh vẫn nằm trong kho vận hành riêng và phải được kiểm tra riêng.
- Máy chủ đã tổng hợp nhiều Role trực tiếp ở một số đường đọc, nhưng giao diện đăng nhập đang lấy một Role đầu tiên. Cần thống nhất trước khi hỗ trợ nhiều nguồn.
- Các cổng quản trị và một số thông báo đọc trực tiếp liên kết tài khoản–Role. Không thể chỉ thêm quyền ở giao diện hoặc sửa một hàm rồi coi toàn Base đã đồng bộ.
- Kinh doanh, 3K và CRM có quy tắc bổ nhiệm/phạm vi riêng; Role tổng đã bị loại khỏi nguồn cấp quyền nghiệp vụ. **Không phục hồi quyền legacy này**. Chức vụ Kinh doanh vẫn có thể liên kết Role để nhận quyền ở phân hệ khác, nhưng quyền Kinh doanh tiếp tục qua bổ nhiệm và ngoại lệ hợp lệ.

## 1. Hoàn thiện phạm vi trước
- Lập danh mục các đường đọc, ghi, bộ đếm, báo cáo, xuất dữ liệu, danh sách người duyệt và thông báo đang sử dụng Role.
- Với từng phân hệ, xác định người/đơn vị chịu tác động từ dữ liệu thật: người sở hữu, nhân sự được giao việc hoặc đơn vị đã lưu. Không suy đoán đơn vị từ tên, không tự sửa dữ liệu lịch sử.
- Dùng cây tổ chức tổng để kiểm tra đơn vị và đơn vị con; giữ đúng người duyệt, lượt duyệt, thời hạn và điều kiện nghiệp vụ hiện tại.
- Quyền chức vụ có phạm vi phải được kiểm tra ngay tại đường đọc/ghi và báo cáo, không chỉ ở danh sách hiển thị. Quyền cấu hình toàn hệ thống không được coi là quyền quản lý một bộ phận.
- Nếu dữ liệu một phân hệ chưa đủ để xác định phạm vi, bổ sung liên kết có kiểm soát, hiển thị các trường hợp chưa xác định để quản trị xác nhận; không mặc nhiên mở toàn Base.
- Chỉ đánh dấu một nhóm quyền sẵn sàng kế thừa sau khi kiểm thử cả trong phạm vi và ngoài phạm vi. Những nhóm chưa đạt chưa được kích hoạt đồng bộ.

## 2. Liên kết chức vụ với Role gốc
- Mỗi chức vụ có Role chính, nhiều Role bổ sung tùy chọn, phạm vi và trạng thái hiệu lực.
- Áp dụng cho chức vụ Base và chức vụ Kinh doanh mà không chuyển dữ liệu tổ chức sang kho thứ hai.
- Đề xuất từ Role thực tế, chỉ hiển thị gợi ý; quản trị chọn hoặc sửa rồi xác nhận. Không tìm thấy thì để **Chưa thiết lập Role**.
- Rà soát quyền mặc định và bộ quyền bổ sung cũ: giữ cấu hình còn được dùng, chỉ chuyển đổi khi đã so sánh hiệu lực và xác nhận; không xóa nguồn quyền đang hoạt động.

## 3. Theo dõi nguồn cấp và đối chiếu
- Lưu nguồn Role riêng: trực tiếp, bổ nhiệm chính, kiêm nhiệm; tham chiếu Role gốc và bổ nhiệm gốc, có người xác nhận, thời gian và lịch sử.
- Không biến các Role trực tiếp hiện tại thành nguồn kế thừa. Không xóa một Role chỉ vì trùng tên hoặc ID với nguồn bổ nhiệm đã kết thúc.
- Đối chiếu theo nhân sự: chức vụ, Role trực tiếp, Role đề xuất, phạm vi, quyền thêm/mất và quyền nhạy cảm.
- Nhân sự cũ chỉ nhận nguồn kế thừa sau xác nhận riêng. Phân công mới hiển thị Role sẽ được cấp và đi qua xác nhận có thẩm quyền.
- Điều chuyển/miễn nhiệm chỉ kết thúc nguồn của bổ nhiệm cũ; kiêm nhiệm còn hiệu lực và quyền trực tiếp vẫn giữ.
- Chỉnh quyền Role gốc được phản ánh từ cùng một nguồn, không cần sao chép hay đồng bộ từng phân hệ. Quyền riêng kiểu ghi đè hiện tại vẫn giữ quy tắc của nó và được hiển thị rõ.

## 4. Giao diện
- **Chức vụ & Cấp bậc:** thay “Chỉnh quyền mặc định” của chức vụ bằng **Thiết lập Role mặc định**; chọn Role chính/bổ sung, xem quyền của Role và phạm vi đã được hỗ trợ.
- **Nhân sự → Quyền truy cập:** hiển thị Role kế thừa kèm nguồn/trạng thái, Role trực tiếp, quyền bổ sung cá nhân và quyền thực tế.
- Tái sử dụng quyền bổ sung hiện có, lý do, thời hạn, phạm vi và nhật ký; không dựng thêm danh sách permission độc lập.
- Gán nhiều người hiển thị Role và phạm vi trước xác nhận; không cấp trùng. Điều chuyển/miễn nhiệm hiển thị nguồn kết thúc và nguồn còn giữ.
- Đối chiếu dễ đọc, tìm kiếm và trạng thái chưa xác nhận; mobile không cần bảng kéo ngang.

## Chi tiết kỹ thuật
- Thay đổi cấu trúc theo hướng bổ sung; không thay ID Role, tài khoản, chức vụ hay bảng bổ nhiệm hiện tại. Bảng mới có GRANT/RLS, ghi chỉ qua hàm có kiểm tra quyền.
- Không đưa Role kế thừa vào liên kết trực tiếp đang được các cổng Admin/Super Admin tin cậy. Dùng tập nguồn hiệu lực chung cho quyền thông thường, còn đặc quyền giữ cổng hiện tại.
- Bổ nhiệm, đối chiếu và áp dụng phải khóa phiên bản, kiểm tra lại phạm vi, có dấu thao tác chống lặp, ghi nhật ký và thực hiện nguyên tử.
- Bản xem trước ràng buộc với người thực hiện, phiên bản cơ cấu, Role gốc và mốc hiệu lực; nguồn đổi thì yêu cầu xem trước lại.
- Cache quyền theo người dùng và mốc chuyển hiệu lực; đổi Role, bổ nhiệm, đăng nhập lại hoặc thu hồi phải đọc lại cùng quyền hiệu lực.
- Kiểm tra toàn bộ đường đọc Role trực tiếp, bao gồm thông báo và lựa chọn người duyệt; không thay các quy tắc nghiệp vụ độc lập.

## Kiểm thử và bàn giao
- Kiểm thử 15 tình huống trong tài liệu, đặc biệt: hai Role/chức vụ, gán nhiều người, kiêm nhiệm, điều chuyển, miễn nhiệm nhưng còn nguồn trực tiếp, quyền bổ sung, nhân sự cũ chưa xác nhận, chặn tự cấp quyền và giữ Super Admin.
- Với mỗi phân hệ được kích hoạt: xác minh đọc/ghi, bộ đếm, báo cáo và xuất dữ liệu không vượt phạm vi; Role sửa tại Nghỉ phép phải có hiệu lực với người kế thừa mà không sao chép cấu hình.
- Chạy hồi quy quyền Kinh doanh/3K/CRM, tài chính và luồng duyệt; không đổi dữ liệu nghiệp vụ thật để thử.
- Nghiệm thu đăng nhập trên desktop/mobile; nếu không có phiên thử hợp lệ, ghi rõ phần chưa kiểm chứng thay vì báo đã đạt.
- Bàn giao danh sách Role tái sử dụng, chức vụ đã/chưa ánh xạ, nhóm quyền/phân hệ đã đạt kiểm tra phạm vi, kết quả kiểm thử và các trường hợp còn cần quản trị xác nhận.

## Thứ tự thực hiện
1. Kiểm tra và hoàn thiện phạm vi cùng bộ kiểm thử từng phân hệ.
2. Thêm liên kết Role và theo dõi nguồn, mặc định chưa kích hoạt.
3. Hoàn thiện thiết lập chức vụ, quyền nhân sự và đối chiếu.
4. Kiểm thử tổng thể, nghiệm thu; chỉ quản trị mới xác nhận bật đồng bộ cho dữ liệu thật.