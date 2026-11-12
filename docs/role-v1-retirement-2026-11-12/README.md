# Dọn toàn bộ Role cũ + gỡ gán Role trực tiếp cho nhân viên

**STAGED ONLY — chưa áp production.** Gói này bắt buộc chạy **sau** migration 510 quyền, vì migration đó khóa fingerprint 29 Role V1.

## Kết quả đọc trực tiếp production (2026-11-12, read-only)

- 31 Role thế hệ 1, trong đó **2 Role bảo vệ** `role-super-admin` và `role-admin` được giữ nguyên.
- **29 Role V1** dự kiến xóa (bao gồm 2 vai trò mẫu hệ thống cũ không còn người nhận).
- **17** link chức danh cũ, tất cả **inactive**, được chụp backup trước khi xóa.
- `user_roles` có đúng **2** bản ghi và cả hai là Super Admin; **không có** gán Role trực tiếp cho nhân viên thường để xóa.
- 26 Role V2: **1 Common + 20 vị trí + 5 nhiệm vụ**. Có **21** binding vị trí, **7** binding nhiệm vụ; 38 bổ nhiệm đang hoạt động trên sơ đồ.
- Dấu vân tay snapshot: 29 roles `6de25f7bbb1f9cbe4df96e5e5944c861`, 17 links `b2ba1d705627b5e25f07927e23107d48`, `account_approve` `e374f12498c68c720bdffed4c8289941`.

## Vì sao phải sửa account_approve?

RPC đang tự gán `role-nhan-su-moi` khi duyệt tài khoản. Xóa Role cũ mà không sửa hàm này sẽ làm **duyệt nhân viên mới bị lỗi**. Candidate thay đoạn gán Role mặc định thành: account mới được kích hoạt **không có Role trực tiếp**; Role Common tự nhận qua resolver khi account active; Role vị trí tự theo bổ nhiệm trong org chart.

Candidate cũng từ chối request _role thủ công qua RPC duyệt tài khoản, chặn app cũ tự cấp Role không đúng mô hình. Bootstrap Super Admin hiện hữu vẫn giữ nguyên.

## Nội dung migration

1. Lock trong transaction, kiểm tra 510 policy đã áp và đúng 29 Role/17 link/2 Super Admin/21 mapping/7 task links.
2. So khớp fingerprint roles, links, function RPC; dừng khi production đổi.
3. Chụp nguyên **to_jsonb** của từng Role và link cùng full `pg_get_functiondef` account_approve vào bảng riêng trong `private` để rollback. Không ghi email/số điện thoại nhân viên.
4. Thay account_approve; xóa **17 link đã inactive** trước rồi xóa **29 Role V1** bằng DELETE có FK (không CASCADE).
5. Verify giữ nguyên toàn bộ Role V2, 2 Super Admin, 26 Role chuẩn.

`rollback.sql` khôi phục Role/link với ID và cột gốc + definition của RPC từ snapshot. Nếu đã có ID xung đột hoặc account_approve được sửa tiếp, rollback từ chối (fail closed).

## Điều kiện chạy production

- Chưa được chủ dự án phê duyệt bản SQL cụ thể này: **KHÔNG chạy**.
- Phải có DB snapshot/backup hệ thống ngoài `private.role_v1_retirement_backup` trước khi apply.
- Lấy lại preflight vào ngày áp: `preflight.sql`. Nếu drift, thay đổi kế hoạch và xin duyệt lại; **không bỏ guard**.
- Không chạy đồng thời với tài khoản đang duyệt hay thay đổi Role.
- Sau áp: thử duyệt tài khoản test (không _role), chuyển nhân viên vào sơ đồ, xem effective source; xác nhận 2 Super Admin còn toàn quyền; thử đăng ký cũ với _role phải bị chặn; kiểm tra lỗi API/CI và thời gian xử lý.

## Phạm vi không làm

Không thay đổi org assignments, mkt_specialties, V2 position mappings, user personal overrides, account/profile info, hay bảng lịch sử nghiệp vụ. Không tự áp 510 SQL hoặc Publish.

**Lưu ý:** Các chức năng cũ khác như `standard_role_catalog_setup` vẫn có tham chiếu ID Role V1 và cần thu hồi/cập nhật trước khi coi migration xóa vật lý là hoàn thành trên mọi đường viết. Chưa chứng minh tất cả RPC/hook đã ngừng tái tạo Role V1.
