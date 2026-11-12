# Cơ chế bật lại quyền Dormant sau khi xóa Role cũ

**STAGED ONLY, CHƯA APPLIED.** Áp đúng thứ tự: 510 candidate → retire 29 legacy Roles → dormant reactivation. Không tự chạy production.

## Lỗi phát hiện

Trong gói 510 quyền ban đầu, `private.universal_dormant_fence` có một danh sách **930 cặp Role/key** hardcode để bảo vệ không tự cấp quyền cũ. Tuy nhiên người quản trị bỏ tích rồi tích lại trong Role V2 thì quyền vẫn bị chặn vĩnh viễn, vì function không có cách biết đây là grant mới.

## Sửa tận gốc

- Ghi nguyên **930 cặp dormant** vào bảng private bất biến; danh sách giữ đúng parity ban đầu. Sao lưu nguyên definition của hàm cũ.
- Một bảng private khác chỉ ghi quyết định **kích hoạt rõ ràng** khi Role V2 bị chỉnh: trước đó key không có, sau đó có, actor thực sự là Super Admin. Không có ghi cấp ngầm khi triển khai migration, metadata edit hay update bởi service actor.
- `private.universal_dormant_fence(role,key)` kiểm tra: thuộc 930 cặp và **chưa có** quyết định kích hoạt. Nghĩa là:
  - Stored pair dormant cũ vẫn không hiệu lực.
  - Bỏ quyền rồi lưu: chưa cấp, không ảnh hưởng nguồn khác.
  - Bật lại và lưu bởi Super Admin: Role này được phép cấp key nếu backend policy đã sẵn sàng.
  - Tắt lại: activation bị xóa; không đụng Role khác.
- Trigger xóa activation khi xóa Role, tránh ID tái sử dụng kích hoạt nhầm.
- RLS/ownership/resource scope không thay đổi; chỉ thay cơ chế dormant. Bảng private không có quyền đọc/ghi cho authenticated.

## Kiểm thử cần đạt trước khi xin duyệt production

- 930/930 vẫn dormant ngay sau migration; 2 V2 pairs `role-v2-sales-head/staff · settings.view` vẫn không grant ngầm.
- Super Admin bỏ key → lưu → thêm key → lưu → resolver cấp quyền. Admin thường/dịch vụ không thể tự kích hoạt bằng update.
- Xóa key → fence bật trở lại; Role khác, Super Admin, Common, người ngoài unit không bị ảnh hưởng.
- Rollback từ chối khi còn activation, tránh revoke quyền âm thầm.
- So sánh `base_effective` trước/sau cho các user; thử action/row-level security và chi phí resolver.

**Không xóa bảng dormant để "mở hết"**: đó sẽ làm 930 quyền lịch sử tự có hiệu lực và tạo privilege escalation.
