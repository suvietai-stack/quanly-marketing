# Chuẩn hóa một kho Role, ô vị trí và quyền theo bổ nhiệm

## Phạm vi
Tiếp tục trên code hiện tại, tái sử dụng `/organization` và kho Role chung. Giữ tài khoản, đơn vị, bổ nhiệm, lịch sử, CRM, 3K, Tiền Về, đơn hàng và phê duyệt. Không reset tự động, không tự bổ nhiệm người thật, không Publish. Thay đổi dữ liệu chuyển đổi chỉ sau snapshot, xem trước và xác nhận Super Admin.

## Hiện trạng đã kiểm tra
- Preview mở được Cơ cấu tổ chức → Role & Phân quyền bằng phiên hiện tại, không lỗi runtime trong lượt kiểm tra.
- 33 Role (27 chuẩn, 6 ngừng); 25 chức danh, 17 hoạt động, mỗi chức danh hoạt động có một liên kết Role. **Chưa phải mỗi ô một người**: chức danh dùng chung hiện chứa nhiều nhân sự/đơn vị.
- Đã có đủ 5 Role nhiệm vụ Marketing đúng ID. HCNS và Đóng hàng có Role hiện hữu với ID khác danh sách mẫu; Trưởng nhóm Kinh doanh chưa có Role theo ID yêu cầu.
- Code và mốc migration mới nhất đã kiểm tra đến 0358; chưa thấy 0359–0361 trong cây hiện tại. Kiểm kê tự động toàn lịch sử vượt giới hạn kích thước, cần đối chiếu hash/mốc trước khi ghi thay đổi mới.
- Có 32 cặp khoảng lịch sử cùng chức danh/đơn vị giao nhau; phải phân loại theo mô hình cũ, không tự xóa hay kết thúc.
- Hai điểm cần sửa tận gốc: nhiệm vụ chưa yêu cầu bổ nhiệm Marketing còn hiệu lực; quyền xem đơn vị có thể ghép với phạm vi của bổ nhiệm khác.

## 1. Kiểm kê và chuẩn bị chuyển đổi
- Bổ sung khu vực Chuyển đổi Role trong quản trị hiện tại: Role hệ thống/chuẩn/ngừng, liên kết vị trí, nguồn trực tiếp, nhiệm vụ, phụ thuộc Kinh doanh, thiếu mapping và ô nhiều người.
- Tạo snapshot riêng tư có số liệu kiểm chứng và quy trình khôi phục chống ghi đè thay đổi mới. Lập bản xem trước quyền/nguồn/phạm vi trước–sau theo từng nhân sự.
- Chỉ ngừng nguồn legacy khi nguồn thay thế đã được kiểm thử và xác nhận. Giữ các nguồn cần thiết trong chuyển đổi, bảo vệ Super Admin.

## 2. Chuẩn hóa kho Role chung
- Bổ sung loại Role vị trí/nhiệm vụ/hệ thống, mã, nhóm, trạng thái và audit vào kho hiện tại.
- Đối chiếu 14 Role cơ sở; **giữ ID HCNS/Đóng hàng đang dùng**, ghi mapping rõ với danh sách yêu cầu thay vì tạo bản trùng. Tạo Role Trưởng nhóm Kinh doanh nếu kiểm kê không có Role tương đương chính xác. Vị trí điều hành hoặc khác ngoài danh sách đưa vào mapping riêng.
- Giữ nguyên ID và quyền hợp lệ của 5 nhiệm vụ; nhóm riêng Nhiệm vụ Marketing. Không cho gắn Role nhiệm vụ/Super Admin vào ô thông thường.
- Hoàn thiện tạo/sửa tên/mô tả/quyền, số vị trí/nhân sự nhận quyền, nguồn/phạm vi, ngừng sử dụng và xóa an toàn. Role còn nguồn vận hành bị chặn xóa và hiện tham chiếu; lịch sử giữ ID/snapshot.
- Chỉnh Role đang sử dụng phải xem trước quyền thêm/mất và xác nhận; không mặc định cấp tất cả quyền quản lý.

## 3. Ô vị trí, bổ nhiệm và kiêm nhiệm
- Phân biệt chức danh dùng chung với ô thực tế trong cùng sơ đồ. Mỗi ô có ID riêng, đơn vị, chức danh và đúng một Role vị trí.
- Cung cấp xem trước tách các nhóm nhiều người thành từng ô; giữ liên kết tới bổ nhiệm gốc và lịch sử. Thiếu mapping để chờ cấu hình, không đoán theo tên.
- Một ô tối đa một người trong mọi khoảng hiệu lực, kể cả lịch tương lai và thao tác đồng thời. Ô đang có người phải kết thúc/thay thế rõ ràng; không tự miễn nhiệm người cũ khi bấm bổ nhiệm.
- Kiêm nhiệm giữ từng nguồn quyền, Role, đơn vị và thời gian. Miễn nhiệm chỉ kết thúc nguồn đã chọn, không xóa nguồn khác cùng Role.

## 4. Quyền thực tế và nhiệm vụ Marketing
- Dùng một tập nguồn quyền hiệu lực cho toàn Base; mỗi permission gắn chính nguồn bổ nhiệm cấp nó và phạm vi tương ứng. Không dùng quyền của một Role với đơn vị của Role kiêm nhiệm khác.
- Điều chỉnh các điểm kiểm tra CRM/3K/Tín hiệu/Tiền Về/Đơn hàng/Nghỉ phép/báo cáo/xuất/phê duyệt để dùng hợp đồng chung, giữ điều kiện người sở hữu, người duyệt, thứ tự, thời hạn và trạng thái hiện tại.
- Cấu hình toàn hệ thống chỉ có hiệu lực từ nguồn được cấp quyền toàn hệ thống; quyền chưa kiểm chứng giữ chặn và ghi lý do, không giả lập phạm vi bằng lọc giao diện.
- Hồ sơ chọn nhiều nhiệm vụ khi có bất kỳ bổ nhiệm Marketing hiệu lực, kể cả kiêm nhiệm. Chặn cấp mới qua mọi API/Role trực tiếp nếu không đủ điều kiện; rời hết Marketing ngừng sinh quyền nhưng không xóa lịch sử lựa chọn.
- Giữ chuyên môn Thiết kế/Chụp ảnh đang dùng; phân biệt chúng với 5 Role nhiệm vụ để không gây mất quyền ngoài phạm vi yêu cầu.
- Hồ sơ Role & Quyền thực tế hiển thị vị trí chính/kiêm nhiệm, từng Role, nhiệm vụ, permission, nguồn, phạm vi, thời gian và lịch sử. Đổi Role/bổ nhiệm/miễn nhiệm, refresh và đăng nhập lại đều đọc lại quyền.

## 5. Kiểm thử và bàn giao
- Kiểm thử đủ 15 tình huống trong tệp bằng tài khoản cô lập, thêm kiểm thử giao dịch đồng thời và chống ghép sai quyền–phạm vi.
- Hồi quy CRM, 3K, đơn hàng, Tiền Về và trung tâm phê duyệt: đọc/ghi, ngoài phạm vi, báo cáo, xuất, đúng lượt và miễn nhiệm; không thao tác dữ liệu thật để thử.
- Nghiệm thu Preview desktop/mobile với phiên đăng nhập hợp lệ; kiểm tra lỗi, quyền sau refresh/logout/login và số nhân sự nhận Role.
- Bàn giao danh sách Role/ID mapping, ô đã/chưa chuyển, xung đột, nguồn legacy đã/chưa thay thế, kết quả kiểm thử và điều kiện reset. Không báo hoàn thành nếu vẫn còn nguồn chưa được kiểm chứng.

## Chi tiết kỹ thuật
- Mở rộng cấu trúc theo hướng bổ sung; không đổi tên/xóa cột hoặc bảng đang dùng. Ô vị trí nằm trong mô hình tổ chức hiện có, không cây hay trình ghi tổ chức thứ hai; tiếp tục quy trình `org_change` xem trước/xác nhận/áp dụng nguyên tử.
- Ràng buộc một Role/ô và không chồng khoảng bổ nhiệm tại database; giữ khóa/kiểm tra phiên bản và audit actor thật. Phân loại dữ liệu cũ trước khi thêm ràng buộc, không để ràng buộc mới phá lịch sử hợp lệ.
- Ghi thay đổi schema bằng công cụ migration sau đối chiếu lịch sử; mọi bảng công khai mới có GRANT/RLS đúng quyền. Chuyển dữ liệu nằm trong quy trình có snapshot/xác nhận, không seed/reset lúc tải trang hoặc khi chạy migration.
- Tái sử dụng resolver và các cổng workflow hiện tại, loại bỏ nguồn cũ chỉ sau parity test; không thêm allowlist tạm hay nguồn quyền cạnh tranh mới.
- Thay đổi máy chủ dùng chung Preview và ứng dụng đang xuất bản: tính năng chuyển đổi mặc định chưa áp dụng, không đổi nguồn quyền của nhân sự trong lúc chuẩn bị.