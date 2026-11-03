# Báo cáo sửa xác thực tài khoản — 03/11/2026

## Nguyên nhân thực sự đã xác minh
Nhật ký được cung cấp ghi `email_not_confirmed` ở hai lần đăng nhập. Luồng Admin duyệt chỉ cập nhật trạng thái nghiệp vụ; Admin reset gọi đúng `auth.admin.updateUserById(targetId,{password})`, không xác nhận email. Vì vậy đổi mật khẩu không khắc phục email chưa được xác nhận. Sau khi mở liên kết khôi phục, nhật ký ghi xác thực thành công rồi cập nhật mật khẩu. Không có bằng chứng mật khẩu ban đầu bị lưu sai hoặc Admin reset nhầm mật khẩu Admin.

Đã đọc `/auth/v1/settings` từ dịch vụ thật: email bật, `mailer_autoconfirm=false`, `disable_signup=false`. Không tắt xác nhận email. 25 hồ sơ hiện hữu được kiểm tra ban đầu: 22 hoạt động, 3 khóa; ID/email khớp Auth, không thiếu mật khẩu thiết lập, đều đã xác nhận tại thời điểm kiểm tra. Không đọc/xuất hash hoặc mật khẩu và không sửa tài khoản thật.

## File và hàm thay đổi
- `src/lib/auth.ts`: `register`, `login`, `approve`, `reload`, `init`, `updateUser`, `reject`, `setStatus`, `setRole`, `changeOwnPassword`, `resetPassword`.
- `src/lib/accounts.functions.ts`: `adminResetPassword`, `adminDeleteUser`, `usernameSignIn`, `accountAuthStatus`, `resendConfirmation`; loại tra cứu email công khai trước đăng nhập.
- `src/lib/accounts.server.ts`: kiểm tài khoản hoạt động/quyền bằng phiên người gọi; đọc trạng thái xác thực tối thiểu, client Auth không lưu phiên và allowlist URL xác nhận.
- `src/lib/password.ts`, `src/lib/auth-errors.ts`: kiểm mật khẩu mới chung, phân loại lỗi theo code; không ép mật khẩu cũ theo chính sách mới lúc đăng nhập.
- `src/lib/recovery-session.ts`: handoff chỉ từ sự kiện PASSWORD_RECOVERY của SDK, xác minh lại user, không chấp nhận marker URL hoặc phiên thường, xóa khi sign-in/sign-out/sử dụng.
- `src/components/AccountsSettings.tsx`, `AccountAuthPanel.tsx`, `ConfirmationDialog.tsx`, `AuthGate.tsx`: thao tác có chờ kết quả/lỗi, trạng thái Auth, gửi lại xác nhận, khóa hiển thị khi hồ sơ thiếu/không hoạt động.
- `src/routes/register.tsx`, `login.tsx`, `reset-password.tsx`: email thật cho đăng ký mới, trạng thái kiểm tra email, thông báo và xử lý lỗi khôi phục đúng.
- `src/start.ts`: thêm chống yêu cầu chéo nguồn cho server functions, giữ middleware đính kèm token hiện có.
- `src/lib/roles.functions.ts`: giữ kiểm quyền bootstrap, thêm tài khoản hoạt động, không import client quản trị ở đầu module.
- `vitest.config.ts`: kiểm thử cô lập không chạy transform RPC của ứng dụng.

## Thay đổi cơ sở dữ liệu
Đã áp dụng `0181_account_auth_integrity`, `0182_account_identity_and_role_guards`, `0183_account_rpc_active_and_signup_guards`, `0184_account_caller_permission_check`.
- `account_approve`: kiểm quyền/đúng hồ sơ/Auth, gán role tùy chọn và duyệt trong một giao dịch. Không đổi mật khẩu hay xác nhận email. Trả riêng emailConfirmed/ready.
- `account_auth_requests` và reserve/finish: đặt chỗ nguyên tử theo người reset, 10 lần/giờ; nhật ký chỉ ID/hành động/kết quả, không chứa email/password/token.
- `account_caller_can`: kiểm quyền dựa trên `auth.uid()` của người gọi, vì các wrapper `is_admin`/`has_permission` cũ thực tế không cấp EXECUTE cho authenticated. Không mở các wrapper cũ cho tra cứu quyền người khác.
- Username chính xác không wildcard, duy nhất không phân biệt hoa/thường, trim/giới hạn ở trigger signup và chặn sửa định danh.
- Shared permission helpers và restrictive active policies chặn phiên cũ của tài khoản không hoạt động. Bổ sung active prerequisite ở directory/settings và ba RPC ảnh/bản nháp còn thiếu. Giữ nguyên quy tắc nghiệp vụ cho tài khoản hoạt động; không thay công thức 3K/KR/báo cáo.
- Auth email chỉ mirror khi đã xác nhận; không sửa email ở profile để bỏ qua xác minh. Chặn self-promotion và gán/xóa role quản trị vượt cấp.
- Không tạo Edge Function, không đổi config auto-confirm, không xóa/tạo lại Auth user, không sửa dữ liệu/timestamp lịch sử. Cơ sở dữ liệu dùng chung nên các ràng buộc bảo mật đã có hiệu lực, dù giao diện chưa Publish.

## Kiểm thử đã chạy
101/101 qua 10 tệp: password 13, auth-errors 4, recovery-session 5, accounts.functions 8, auth.flows 6, accounts.database 14, reportSync 6, organization 16, k3 10, k3Periods 19.
- Kiểm handler reset thực tế với Auth mock: target ID duy nhất, không xác nhận email, không đổi Admin, quyền/hierarchy, cap trước mutation, lỗi Auth không thành công, lỗi nhật ký không tự reset lại.
- PGlite tải migrations thật: signup trigger pending/ID, trùng username rollback, tên admin dành riêng, duyệt giữ mật khẩu gốc, email chưa xác nhận vẫn chưa ready, failed role assignment rollback, self-promotion/email-only denied, phiên Admin khóa mất quyền, owner table/RPC inactive denied, quota 10/11 và audit completion một lần.
- Mock luồng: original password chuyển nguyên vẹn vào Auth, signup không coi session null là đăng nhập, yêu cầu email thật, unconfirmed/missing/blocked profile, recovery chỉ SDK verified và nghỉ khi sign-in thường.
- Browser localhost với phiên Admin thật: mở đúng Cài đặt → tài khoản → Bảo mật của Nguyễn Thị Thanh Mai; đọc `Email đã xác nhận` từ server, không mutation. Mở dialog xác nhận; `/reset-password#type=recovery` giả bị chặn. Không lỗi JavaScript.
- Harness build hiện tại OK.

## Chưa nghiệm thu và vì sao
**Chưa chứng minh end-to-end thật** hai tiêu chí bắt buộc: đăng ký → nhận email → xác nhận → duyệt → original-password login; Admin reset → new-password accepted/old-password rejected/Admin+B unchanged. Mock/PGlite không chứng minh GoTrue xử lý mật khẩu/email thật. Backend hiện dùng chung với bản đang hoạt động, chưa có tài khoản/môi trường test được phép; không tự tạo người thử, đổi mật khẩu nhân viên thật hoặc gửi email thử.

Chưa kiểm tra hộp thư nhận thư, link đã dùng/hết hạn thật, refresh trang sau link đã tiêu thụ và chính sách độ mạnh mật khẩu đầy đủ. `/settings` công khai không trả min length/character classes. Giữ quy tắc ứng dụng sẵn có 8 ký tự + chữ/số, thống nhất max 200 và hiển thị lỗi chính sách hosted; chưa tuyên bố hoàn toàn trùng cấu hình hosted.

Không cần tắt xác nhận email. Redirect allowlist và chính sách mật khẩu chưa đọc được đầy đủ: có thể kiểm tra tại More → Users → Auth settings → Email/Advanced. Chưa yêu cầu hoặc thực hiện thay đổi cấu hình đó. **Chưa Publish; chưa tuyên bố hoàn tất nghiệm thu P0.**