# Bàn giao Giai đoạn 3A — Base Sứ Việt

## Kết luận

**Chưa hoàn thành toàn bộ Role chuẩn.** Chín liên kết còn lại đã bật tập quyền cá nhân/nghiệp vụ an toàn, nhưng quyền quản lý thiết yếu chưa có rào đơn vị đầy đủ nên vẫn chặn. Không reset, không bổ nhiệm thật, chưa Publish.

Các chức vụ đều trống lúc kích hoạt; bản xem trước có **0 nhân sự bị tác động**. Đối chiếu sau: danh sách bổ nhiệm, Role trực tiếp, đơn vị, chức vụ giữ nguyên. Quyền Kinh doanh không thay đổi.

## Chức vụ và quyền thực tế

| Chức vụ | Quyền đã bật | Quyền còn chờ | Kết luận |
|---|---:|---:|---|
| Giám đốc Marketing | 14 | 274 | Chỉ một phần; chưa thay thế Role quản lý |
| Hành chính Nhân sự | 8 | 33 | Chỉ một phần; chưa thay thế Role quản lý |
| Kế toán kho | 2 | 11 | Chỉ một phần; chưa thay thế Role quản lý |
| Kế toán trưởng | 2 | 11 | Chỉ một phần; chưa thay thế Role quản lý |
| Nhân viên Đóng hàng | 4 | 0 | Đầy đủ tập Role hiện tại; giữ nguyên giai đoạn 2.5 |
| Nhân viên Thiết kế | 15 | 38 | Chỉ một phần; chưa thay thế Role quản lý |
| Nhân viên Thu mua | 7 | 7 | Chỉ một phần; chưa thay thế Role quản lý |
| Trưởng phòng Marketing | 14 | 274 | Chỉ một phần; chưa thay thế Role quản lý |
| Trưởng phòng Mua hàng & Giao vận | 7 | 7 | Chỉ một phần; chưa thay thế Role quản lý |
| Trưởng phòng Thiết kế | 15 | 38 | Chỉ một phần; chưa thay thế Role quản lý |

### Tập quyền cụ thể

**Giám đốc Marketing → Leader Marketing**
`att.create`, `leave.create`, `leave.recall`, `leave.view_own`, `order.create`, `order.deliver`, `order.history`, `order.open_delivery`, `order.resubmit`, `order.submit`, `order.take`, `order.update_draft`, `order.view`, `order.view_mine`

**Hành chính Nhân sự → Hành Chính Nhân Sự**
`att.create`, `att.edit_own`, `att.view_own`, `att.witness`, `leave.create`, `leave.edit_own`, `leave.recall`, `leave.view_own`

**Kế toán kho → Kế Toán**
`att.create`, `leave.create`

**Kế toán trưởng → Kế Toán**
`att.create`, `leave.create`

**Nhân viên Đóng hàng → Nhân viên Đóng hàng**
`ot.stage_update`, `ot.task_update`, `ot.task_view`, `ot.view_own`

**Nhân viên Thiết kế → Designer / Chụp ảnh**
`att.create`, `att.witness`, `leave.create`, `leave.recall`, `leave.view_own`, `order.create`, `order.deliver`, `order.history`, `order.open_delivery`, `order.resubmit`, `order.submit`, `order.take`, `order.update_draft`, `order.view`, `order.view_mine`

**Nhân viên Thu mua → Cung Ứng**
`att.create`, `leave.create`, `oq.accept`, `oq.create`, `oq.reply_price`, `oq.reply_progress`, `oq.report_own`

**Trưởng phòng Marketing → Leader Marketing**
`att.create`, `leave.create`, `leave.recall`, `leave.view_own`, `order.create`, `order.deliver`, `order.history`, `order.open_delivery`, `order.resubmit`, `order.submit`, `order.take`, `order.update_draft`, `order.view`, `order.view_mine`

**Trưởng phòng Mua hàng & Giao vận → Cung Ứng**
`att.create`, `leave.create`, `oq.accept`, `oq.create`, `oq.reply_price`, `oq.reply_progress`, `oq.report_own`

**Trưởng phòng Thiết kế → Designer / Chụp ảnh**
`att.create`, `att.witness`, `leave.create`, `leave.recall`, `leave.view_own`, `order.create`, `order.deliver`, `order.history`, `order.open_delivery`, `order.resubmit`, `order.submit`, `order.take`, `order.update_draft`, `order.view`, `order.view_mine`

## Căn cứ an toàn và phần còn thiếu

- Thiết kế: `0264–0269`, `0299` dùng restrictive RLS, design_read/design_can, trigger cho mọi writer, kiểm danh tính, workflow, khóa dòng, lịch sử bất biến. `order.take` cho hàng đợi chưa giao đủ điều kiện, không chỉ việc đã sở hữu.
- Hỏi giá: `0028–0030`, `0039`; create gắn creator, accept/reply đúng assignee và loại luồng, SELECT theo quan hệ; báo cáo own lọc creator/assignee lịch sử; export riêng vẫn bị chặn. Cùng yêu cầu có thể thấy cả luồng liên quan, không phải cách ly tuyệt đối từng luồng.
- Nghỉ phép/giải trình: `0013`, `0018`; quyền cá nhân kiểm owner/witness, thời hạn và workflow phía máy chủ.
- Marketing/Task/Web/Social/Video/Local/Brand: nhiều bảng legacy vẫn cho nhân sự hoạt động đọc/ghi rộng; bộ lọc và bước xử lý còn ở trình duyệt. **Không coi RLS rộng là bằng chứng quyền cá nhân an toàn; không sao chép allowlist chuyên môn cũ sang chức vụ.**
- Tài chính: reconcile/manage/manual_manage và báo cáo chưa có đơn vị bổ nhiệm; không cấp tự động.
- HCNS: view_all/manage/reconcile/approve/create_for/report/export và quyền tài khoản chưa chứng minh đơn vị; giữ khóa.
- Mua hàng: oq.view_all/manage/report_all/report_export chưa có đơn vị bổ nhiệm; giữ khóa.
- Thiết kế/Marketing quản lý: assign cho phép đọc rộng và nhiều tác vụ manager; chưa kích hoạt theo đơn vị.
- Đóng hàng giữ nguyên 4 quyền của giai đoạn 2.5: phạm vi thực là đơn liên quan; ot.stage_update có thể cập nhật công đoạn/task trong đơn có thể xem, không được mô tả là chỉ sửa task cá nhân.

## Cấp/thu hồi và nhiệm vụ

- Quyền theo chức vụ tính từ bổ nhiệm live, chọn permission, chữ ký Role và khoảng hiệu lực; không thêm user_roles. Kết thúc một nguồn giữ nguồn direct/concurrent/override hợp lệ khác; DENY ưu tiên.
- Nhiệm vụ chọn trong form phân công mới lưu stable specialty IDs và chữ ký Role máy chủ trong assignment data. Chỉ tập org_role_permission_ready được cấp; không thay mkt_staff_specialties hoặc quyết định chuyên môn cũ. Miễn nhiệm thu hồi đúng marketing_appointment source.
- Gắn nhiệm vụ qua quy trình xem trước → xác nhận hiện có, Super Admin-only; không cấp nhiệm vụ cho bổ nhiệm Kinh doanh. Tên nhiệm vụ không tự suy đoán quyền.
- Chặn self-assignment vào chức vụ ngoài Kinh doanh có quyền tự cấp (người quản trị khác xác nhận); chặn dùng end để gia hạn ngày thu hồi ngoài Kinh doanh.
- Role thay đổi chữ ký làm nguồn mới fail-closed đến khi kiểm chứng lại.
- Traversal có visited path, không treo khi chu kỳ; không tuyên bố từ chối toàn bộ cây cyclic. Canonical writer chặn tạo chu kỳ. Resolver quản lý theo đơn vị vẫn chưa hoàn tất.

## Kiểm thử / nghiệm thu

- 140/140 kiểm thử liên quan đạt: canonical preview/apply thật trong PGlite, actor-bound/single-use, bổ nhiệm, miễn nhiệm, kiêm nhiệm, direct source survives, hiệu lực tương lai/hết hạn, inactive, DENY, tự nâng quyền, sai đơn vị, sửa chữ ký, RLS/RPC, báo cáo/xuất Hỏi giá, ghi trực tiếp, workflow Thiết kế. Không tạo tài khoản/dữ liệu giả trên database thật.
- Preview Admin Hệ Thống: đăng nhập được, sơ đồ/Cài đặt/Role/Chuyển đổi quyền cũ tải qua RPC không lỗi, chọn nhân sự/chức vụ/nhiệm vụ và quyền tự nhận hiển thị; không lưu bổ nhiệm thật.
- Desktop/mobile: không lỗi JS, không tràn ngang; build OK theo observability.
- End-to-end ghi bổ nhiệm/miễn nhiệm chỉ chạy môi trường cô lập; Preview thật chỉ đọc, ngoại trừ kích hoạt liên kết chức vụ trống đã qua preview/apply.

## Chuyển đổi quyền cũ

23 tài khoản: **15 được bảo vệ, 8 cần xử lý, 0 sẵn sàng**. Không reset; nút chuyển đổi trên UI bị khóa cho giai đoạn này. Admin xem từng tài khoản và danh sách permission còn thiếu trong báo cáo có sẵn; bảng audit chức vụ hiển thị enabled/eligible/blocked và nguyên nhân.
- Mưa Bụi: thiếu 13 quyền thay thế; Còn 13 quyền chưa có nguồn thay thế từ chức vụ/nhiệm vụ đã kiểm chứng; Chưa được bổ nhiệm chức vụ hoặc giao nhiệm vụ chuyên môn nào còn hiệu lực
- Nguyễn Quỳnh Anh: thiếu 41 quyền thay thế; Còn 41 quyền chưa có nguồn thay thế từ chức vụ/nhiệm vụ đã kiểm chứng; Chưa được bổ nhiệm chức vụ hoặc giao nhiệm vụ chuyên môn nào còn hiệu lực
- Nguyễn Thị Hằng: thiếu 14 quyền thay thế; Còn 14 quyền chưa có nguồn thay thế từ chức vụ/nhiệm vụ đã kiểm chứng; Chưa được bổ nhiệm chức vụ hoặc giao nhiệm vụ chuyên môn nào còn hiệu lực
- Nguyễn Thị Mai Loan: thiếu 32 quyền thay thế; Còn 32 quyền chưa có nguồn thay thế từ chức vụ/nhiệm vụ đã kiểm chứng
- Nguyễn Thị Thương: thiếu 28 quyền thay thế; Còn 28 quyền chưa có nguồn thay thế từ chức vụ/nhiệm vụ đã kiểm chứng
- Trần Thị Bích Ngọc: thiếu 0 quyền thay thế; Tài khoản có quyền bổ sung riêng — cần Admin xử lý thủ công, hệ thống không tự gỡ
- Trần Thị Julia: thiếu 288 quyền thay thế; Còn 288 quyền chưa có nguồn thay thế từ chức vụ/nhiệm vụ đã kiểm chứng; Chưa được bổ nhiệm chức vụ hoặc giao nhiệm vụ chuyên môn nào còn hiệu lực
- Vũ Hạnh: thiếu 28 quyền thay thế; Còn 28 quyền chưa có nguồn thay thế từ chức vụ/nhiệm vụ đã kiểm chứng

## Trước khi chuyển đổi quyền cũ

1. Hoàn thiện backend ownership/workflow/RLS báo cáo/xuất Marketing legacy; cần thay đổi đồng bộ, không chỉ bộ lọc giao diện.
2. Xây dựng native management-unit resolver tại từng phân hệ và kiểm thử ranh giới trước khi cấp quản lý.
3. Admin bổ nhiệm thủ công đúng nhân sự sau khi kiểm tra quyền đã bật và quyền còn chờ; không bật trọn Role từ tên chức vụ.
4. Đối chiếu lại cả 8 tài khoản thiếu thay thế và quyền riêng; 0 sẵn sàng nghĩa là chưa được chuyển đổi.
5. Chạy nghiệm thu với tài khoản nghiệp vụ sau các bổ nhiệm do Admin thực hiện.

Các thay đổi database hiện có hiệu lực chung Preview/published backend; không có lần Publish giao diện nào trong giai đoạn này.
