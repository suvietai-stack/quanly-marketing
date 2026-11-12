# Khắc phục nhân viên không xem được Nghỉ phép

## Phần sửa an toàn
- Kiểm chứng chuỗi khôi phục phiên → hồ sơ → quyền hiệu lực → màn hình → đọc đơn/cài đặt. Phân biệt quyền chưa tải với bị từ chối; không dùng quyền cũ của người khác hoặc mở quyền tạm.
- Kiểm thử race đã thấy trong mã: hồ sơ được đánh dấu tải xong trước quyền hiệu lực; cổng trang có thể báo không có quyền trong khoảng đó. Kiểm chứng thêm việc tab được chọn một lần trước khi quyền cập nhật.
- Nếu tái hiện được, sửa trong phạm vi Nghỉ phép: chờ quyền có thời hạn, lỗi và Thử lại rõ ràng; chọn lại tab hợp lệ khi quyền thay đổi; tránh đọc lại do đổi trạng thái không cần thiết. Không đổi quy tắc cấp quyền toàn Base.
- Bổ sung chẩn đoán đọc an toàn: tên yêu cầu, mã lỗi/HTTP nếu có và thời lượng, không chứa token hoặc dữ liệu người khác. Giữ RLS, deadline 12 giây và không retry 401/403.

## SQL chỉ chuẩn bị, không áp
- Tạo gói mới riêng cho SELECT leave_requests, không sửa bốn gói đã stage trước đó.
- Tính tập owner được xem theo đơn vị một lần mỗi statement: một snapshot cấu hình và org_role_rules, các bổ nhiệm đang hiệu lực và cây đơn vị có chống vòng lặp. Giữ đúng ngữ nghĩa hàm cũ, kể cả quy tắc DENY/ALLOW của has_permission; không thay evaluator khác.
- Giữ riêng nhánh owner, creator, approver, view_all và active guard. Chỉ thay nhánh unit bằng kiểm tra membership trong tập đã tính; không cấp thêm quyền hay đổi dữ liệu.
- Preflight chính xác definition/owner/ACL/policy, backup và rollback nguyên bản, SHA256 từng file. SQL phải chờ owner duyệt riêng; duyệt kế hoạch không phải duyệt áp SQL.

## Nghiệm thu
- Fixture không dùng JWT nhân viên: auth pending, quyền tới muộn/lỗi, đổi actor/sign-out, settings lỗi, SELECT 403/timeout, retry, tab thay đổi; desktop/mobile và chuyển trang nhanh.
- SQL fixture: own, creator, approver, manager, unrelated, inactive, DENY, co-appointments, bổ nhiệm đã kết thúc/legacy và cây đơn vị; đối chiếu chính xác tập ID cũ/mới, benchmark thấp concurrency.
- Chỉ thử E2E nhân viên production nếu có phiên hợp lệ được owner ủy quyền; nếu chỉ có Super Admin, ghi UNTESTED nhân viên và không tuyên bố lỗi nhân viên đã sửa.
- Commit/publish chỉ frontend đã kiểm thử và tương thích SQL hiện hành; kiểm tra production HTTP/bundle/deployment và báo đúng trạng thái.

## Giới hạn
- Không migration, RLS, grants, Role, bổ nhiệm hoặc đơn thật; không rollback production và không impersonation.
- Không chỉnh 3K, gói tổ chức/Role hay các candidate cũ.