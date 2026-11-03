# Sửa đăng nhập, duyệt tài khoản và đặt lại mật khẩu

## Kết quả kiểm tra đã xác minh
- Nhật ký tài khoản gặp lỗi ghi rõ `email_not_confirmed` lúc đăng nhập. Sau khi mở email khôi phục, xác thực thành công rồi mật khẩu được cập nhật. Đây là bằng chứng lỗi xác nhận email trong trường hợp đã cung cấp, không phải bằng chứng mật khẩu đăng ký bị lưu sai.
- Cấu hình dịch vụ đang bật đăng nhập email, cho đăng ký và **bắt buộc xác nhận email**. Giữ nguyên các cấu hình này. Dịch vụ đọc công khai không cung cấp đầy đủ chính sách độ mạnh mật khẩu; chưa khẳng định phần cấu hình đó.
- Duyệt hiện chỉ đổi trạng thái hồ sơ. Admin reset hiện gọi đúng API quản trị để đổi mật khẩu tài khoản được chọn, nhưng không xác nhận email. Đổi mật khẩu không làm tài khoản chưa xác nhận trở thành sẵn sàng đăng nhập.
- Giao diện đăng nhập gom lỗi xác nhận email vào lỗi sai mật khẩu; đăng ký không hướng dẫn đầy đủ bước xác nhận. Một số thao tác duyệt/lưu báo thành công trước khi chờ kết quả.
- Hiện có 25 hồ sơ: 22 hoạt động, 3 tạm khóa; tất cả có Auth tương ứng, email khớp, đã xác nhận và có mật khẩu thiết lập. Không cần sửa hàng loạt tài khoản hiện tại; không đọc hoặc xuất hash mật khẩu.

## 1. Đăng ký và đăng nhập
- Dùng hồ sơ nhân viên hiện có, không tạo thêm hệ thống tài khoản hoặc lưu mật khẩu riêng.
- Đăng ký mới yêu cầu email thật để hoàn tất xác nhận; giữ các tài khoản nội bộ cũ. Tên đăng nhập hiện có vẫn sử dụng được.
- Hiển thị bước kiểm tra email và chờ Admin duyệt; thêm gửi lại liên kết xác nhận có giới hạn, không tiết lộ tài khoản có tồn tại hay không.
- Phân biệt lỗi chưa xác nhận email, thông tin không hợp lệ và lỗi dịch vụ. Chỉ mô tả trạng thái chờ duyệt/khóa sau khi thông tin xác thực hợp lệ.
- Chặn trường hợp thiếu hồ sơ hoặc lỗi đọc hồ sơ; không coi đó là đăng nhập thành công.

## 2. Duyệt và quản lý tài khoản
- Bổ sung trạng thái xác thực và kiểm tra theo quyền: đã xác nhận, chưa xác nhận, thiếu/không khớp hồ sơ, bị hạn chế đăng nhập.
- Duyệt kiểm tra đúng hồ sơ/Auth; ghi trạng thái và gán role tùy chọn trong một giao dịch, kiểm quyền riêng cho từng thao tác.
- Duyệt không đổi mật khẩu, không xác nhận email thay nhân viên; nếu còn thiếu xác nhận, hiển thị rõ bước còn lại thay vì báo sẵn sàng đăng nhập.
- Chờ kết quả thật trước thông báo thành công, chặn bấm lặp và giữ biểu mẫu khi có lỗi.
- Không cho sửa riêng email hồ sơ. Email đăng nhập do hệ thống xác thực quản lý; không thêm quy trình đổi email quản trị bỏ qua xác minh.

## 3. Đặt lại và khôi phục mật khẩu
- Giữ Admin reset bằng API quản trị phía máy chủ, đúng ID người được chọn; kiểm tài khoản người thao tác đang hoạt động, quyền và phân cấp quản trị.
- Reset không mở khóa, không xác nhận email, không đổi role/phòng/nhóm. Kết quả nêu rõ nếu còn bước xác thực khác.
- Dùng chung quy tắc mật khẩu cho đăng ký/reset/tự đổi/khôi phục; không áp quy tắc mật khẩu mới để từ chối đăng nhập bằng mật khẩu cũ hợp lệ.
- Giữ nhật ký không chứa bí mật; hạn mức reset được đặt chỗ nguyên tử trước thao tác, ghi nhận kết quả và không tự gửi lại khi kết quả không rõ.
- Trang khôi phục chỉ mở form sau khi phiên khôi phục hợp lệ được thiết lập, không chỉ dựa trên chữ `type=recovery` trong URL; giữ trang công khai cho người chờ duyệt.
- Không báo đã gửi thư hoặc đã đổi mật khẩu khi dịch vụ trả lỗi; phân biệt mật khẩu không đạt chính sách với liên kết hết hạn.

## 4. Bảo mật và kiểm thử
- Kiểm tra ràng buộc hồ sơ hiện có trước khi bổ sung; chặn tự đổi trạng thái/quyền quản trị/email qua yêu cầu trực tiếp.
- Kiểm tra người chờ duyệt/bị khóa, kể cả còn phiên cũ, không thể đọc/ghi dữ liệu nội bộ. Sửa ở lớp kiểm tra tài khoản chung, không đổi công thức hoặc quyền nghiệp vụ của module khác.
- Thêm kiểm thử đơn vị, máy chủ và cơ sở dữ liệu cô lập cho tám nhóm tình huống trong tài liệu: đăng ký, chờ duyệt, chưa xác nhận, Admin reset, khôi phục, khóa, vượt quyền và hồi quy.
- Kiểm tra giao diện bằng phiên Admin hiện có chỉ với thao tác đọc. Không đổi mật khẩu, duyệt, tạo/xóa tài khoản hoặc gửi thư thử cho nhân viên thật.
- Hai luồng nghiệm thu bắt buộc cần môi trường/tài khoản thử được phép: đăng ký → xác nhận → duyệt → đăng nhập bằng mật khẩu ban đầu; Admin reset → mật khẩu mới đúng, mật khẩu cũ bị từ chối, Admin và người khác không đổi. Nếu chưa có môi trường cô lập được phép, báo rõ chưa nghiệm thu hai luồng này, không tuyên bố sửa xong toàn bộ.

## Chi tiết kỹ thuật
- Sửa tập trung `src/lib/auth.ts`, `src/lib/accounts.functions.ts`, `src/lib/password.ts`, `src/components/AccountsSettings.tsx`, `src/components/AuthGate.tsx`, các trang đăng ký/đăng nhập/khôi phục và các kiểm thử liên quan.
- Tách tra cứu username khỏi phản hồi email công khai: so khớp chính xác, giải quyết danh tính và xác thực phía máy chủ, không trả email cá nhân trước xác thực.
- Server functions xác thực người gọi và quyền qua client theo phiên trước khi tải client quản trị bên trong handler; không import client quản trị ở đầu module.
- Migration bổ sung cho giao dịch duyệt/hạn mức/nhật ký và ràng buộc tài khoản khi cần; không sửa dữ liệu/timestamp lịch sử hay managed schema ngoài trigger vòng đời Auth được phép.
- Không viết Edge Function mới, không xây lại toàn bộ authentication; giữ cơ chế phiên và middleware hiện có.
- Báo cáo cuối ghi nguyên nhân đã chứng minh, file/hàm/migration thay đổi, kiểm thử đạt/chưa đạt và cấu hình còn chưa xác minh.

## Giới hạn
Không thay đổi 3K, KR, kế hoạch, báo cáo, cơ cấu, phê duyệt nghiệp vụ hoặc các module khác. Không tắt xác nhận email, không xác nhận/reset hàng loạt, không xóa/tạo lại tài khoản thật. **Chưa Publish.** Các thay đổi cơ sở dữ liệu dùng chung có thể ảnh hưởng cả bản đang chạy; phải tương thích và không thay đổi trạng thái nhân viên hiện có.