# Bàn giao chuyển đổi quyền cuối — Base Sứ Việt

## Quyết định mới: reset gồm Kinh doanh, 11/11/2026

- Đã thực hiện trên backend dùng chung: 24/26 nhân sự thuộc diện reset; giữ đúng hai Super Admin (Admin Hệ Thống và Trung Hiếu).
- 15 liên kết Role legacy đã ngừng; quyền riêng legacy đang bật 1 → 0. Còn 2 liên kết Super Admin; không tự bổ nhiệm bất kỳ người nào.
- Mã khôi phục: `0e42f305-c0a8-4a1a-8e5c-e16361c7da56`. Snapshot riêng tư gồm nguồn Role, override, catalog, cơ cấu, bổ nhiệm, chuyên môn, quyền hiệu lực và quyền Kinh doanh trước reset.
- 26 tài khoản và 84 bản ghi tổ chức giữ nguyên. Timestamp và dữ liệu nghiệp vụ không chỉnh sửa. Sơ đồ loại trùng bằng user ID trong cùng đơn vị/chức vụ, giữ kiêm nhiệm và người khác ID trùng tên.
- Chặn ghi lại Role/override nguồn legacy; nguồn chức vụ/chuyên môn chỉ tiếp tục khi thuộc Role chuẩn đã kiểm chứng. Bổ nhiệm Kinh doanh cũ vẫn là dữ liệu tổ chức nhưng không còn cấp quyền.
- Giới hạn quan trọng: quyền Kinh doanh từ bổ nhiệm chuẩn mới và quyền quản lý theo đơn vị chưa được kích hoạt an toàn. Không tuyên bố luồng bổ nhiệm Kinh doanh hoàn chỉnh; không mở toàn Base để thay thế. Marketing/Thiết kế/Vận hành tiếp tục tập quyền cá nhân chuẩn đã kiểm chứng.
- Quyền bổ sung mới của nhân sự đã reset có thể cấu hình qua màn hình hiện có, chỉ Role chuẩn không chứa quyền quản trị/Kinh doanh chưa hỗ trợ. Khôi phục giữ quyền bổ sung mới.
- Lần gọi đầu timeout và rollback; lần thành công chỉ tạo một snapshot. Chưa Publish; quyền thật đã thay đổi ngay.

Phần dưới là báo cáo lịch sử của lần chuyển đổi trước, không phải trạng thái hiện tại.

## Kết quả thực tế

- Giao dịch thành công lúc 10:13:44 ngày 11/11/2026 (giờ Việt Nam).
- Đã chuyển đổi 9 tài khoản, ngừng 9 liên kết Role trực tiếp cũ. Quan hệ cũ được lưu nguyên trạng trong snapshot, không xóa vĩnh viễn.
- 26 hồ sơ trước/sau; không thay đổi tài khoản đăng nhập, định danh, bổ nhiệm, đơn vị, chức vụ, người nhận việc hay người duyệt.
- 15 tài khoản có quan hệ/Role Kinh doanh được giữ nguyên; cả hai Super Admin được giữ nguyên (có thể kiêm nhiệm Kinh doanh). 16 tài khoản được bảo vệ trong danh sách sau chuyển đổi, 1 ngoại lệ cần xử lý.
- Chưa Publish. Backend dùng chung Preview và bản đang chạy nên quyền thật đã thay đổi ngay; không coi đây là chỉ thay giao diện Preview.

## Tài khoản đã chuyển đổi

| Nhân sự | Nguồn Role đã ngừng | Quyền cũ thiếu thay thế trong kiểm kê |
|---|---|---:|
| Mưa Bụi | Kế Toán | 13 |
| Nguyễn Quỳnh Anh | Hành Chính Nhân Sự | 41 |
| Nguyễn Tân | Video | 82 |
| Nguyễn Thị Hằng | Cung Ứng | 14 |
| Nguyễn Thị Mai Loan | Content Web | 32 |
| Nguyễn Thị Thương | Designer / Chụp ảnh | 28 |
| Nguyễn Thu Hiền | Content Web | 90 |
| Trần Thị Julia | Leader Marketing | 288 |
| Vũ Hạnh | Designer / Chụp ảnh | 28 |

Số quyền thiếu thay thế là chênh lệch kiểm kê nguồn cũ, không phải số công việc bị xóa hay tổng quyền hiệu lực. Nguồn chuyên môn thủ công, bổ nhiệm và nguồn hợp lệ khác được giữ nguyên. Không cấp Role nền Nhân sự mới hàng loạt: Role này hiện chứa quyền Task legacy chưa có rào máy chủ đầy đủ; tránh tự thêm quyền nghiệp vụ cho người chưa bổ nhiệm. Admin vẫn có thể chọn Role nền bằng cơ chế bổ sung có xác nhận khi phù hợp.

## Ngoại lệ

- Trần Thị Bích Ngọc: giữ nguyên Role Video và 69 quyền riêng chế độ replace, gồm signal.sale/signal.report; không thể xác định nguồn ngoài Kinh doanh một cách chắc chắn. Không chuyển additive, không ghi đè.
- Nhân Sự Khác: Viewer / Ban Giám Đốc chưa xác định nguồn chuyên môn, giữ nguyên.
- Role Kinh doanh còn trên tài khoản chưa có bổ nhiệm cũng được giữ nguyên; không suy đoán là ngoài Kinh doanh để gỡ.

## Chức vụ sẵn sàng dùng tập quyền đã kiểm chứng

| Chức vụ | Đã tự cấp thực tế | Chưa tự cấp |
|---|---:|---:|
| Giám đốc Marketing | 14 | 274 |
| Hành chính Nhân sự | 8 | 33 |
| Kế toán kho | 2 | 11 |
| Kế toán trưởng | 2 | 11 |
| Nhân viên Đóng hàng | 4 | 0 |
| Nhân viên Thiết kế | 15 | 38 |
| Nhân viên Thu mua | 7 | 7 |
| Trưởng phòng Marketing | 14 | 274 |
| Trưởng phòng Mua hàng & Giao vận | 7 | 7 |
| Trưởng phòng Thiết kế | 15 | 38 |

Tất cả 10 liên kết dùng tập enabled_permissions đã kiểm chứng, không kích hoạt trọn Role rộng. Đóng hàng đủ 4 quyền hiện tại; các chức vụ khác chỉ một phần. Quyền quản lý Marketing/Thiết kế/HCNS/Tài chính/Mua hàng theo đơn vị còn chặn. Chưa tạo thêm liên kết Trưởng nhóm hoặc Role tổng hợp. Nhiệm vụ Marketing chọn nhiều được lưu theo bổ nhiệm và chỉ cấp tập đã kiểm chứng; không tự giao job. Chi tiết permission và căn cứ: docs/phase3a-role-activation-report.md.

## Snapshot và phục hồi

- Mã phục hồi: `90717bc1-ae8e-4bed-a162-9ab8c8e61bec`.
- Lưu riêng tư trong base_perm_cleanup_runs.snapshot, chỉ Super Admin đọc: 26 quan hệ Role, 13 bản quyền riêng, danh mục Role, 26 kết quả quyền hiệu lực cùng nguồn, cấu hình cơ cấu/phạm vi, đơn vị/chức vụ/bổ nhiệm, liên kết Role, chuyên môn và quan hệ Kinh doanh.
- Cơ cấu tổ chức → Cài đặt → Role & Phân quyền → Nâng cao → Chuyển đổi quyền cũ → Lịch sử → Khôi phục. Có xác nhận; chỉ trả nguồn đã ngừng, giữ quyền mới, không ghi đè bổ nhiệm hay quyền riêng.
- Lần đầu quá thời gian đã rollback toàn bộ; sau tối ưu snapshot theo tập hợp, lần sau thành công. Chỉ một giao dịch chuyển đổi thật được lưu.

## Tùy chỉnh quyền và việc Admin cần làm

- Cơ cấu tổ chức → Nhân sự → chọn người → Tùy chỉnh quyền: thêm/thu hồi Role bổ sung và permission cụ thể, xem thêm/mất rồi xác nhận, ghi thật nguyên tử và có nhật ký before/after. Nguồn bổ sung gắn nhãn riêng, không bị các lần chuyển đổi tiếp theo gỡ.
- Không cho tự nâng quyền, không chỉnh Kinh doanh hoặc quản trị thiết yếu tại màn hình này. Quyền riêng cũ có nguồn không rõ được khóa chống ghi đè.
- Phạm vi chỉ giữ điều kiện nghiệp vụ sẵn có; chưa có tùy chỉnh giới hạn Phòng/Nhóm cho quyền quản lý chưa hỗ trợ backend. Role chứa quyền settings/biz/k3 không được bổ sung tại đây; có thể chọn từng permission nghiệp vụ có thẩm quyền, không cấp Admin.
- Admin bổ nhiệm thủ công nhân sự vào đơn vị/chức vụ, chọn nhiệm vụ Marketing; cấp bổ sung quyền cần xử lý công việc cũ. Không tự đổi người duyệt hoặc người nhận việc.
- Cần tiếp tục triển khai rào phạm vi quản lý từng phân hệ và đối chiếu ngoại lệ trước khi gỡ thêm nguồn; không tuyên bố Role quản lý toàn Base đã hoàn thiện.

## Kiểm thử và xác minh

- 7 kiểm thử mới: phân loại/bảo vệ, snapshot tối ưu khớp replace/DENY, xác nhận/vân tay, chuyển đổi nguyên tử, bổ sung có kiểm tra, phục hồi timestamp và giữ nguồn mới, chống truy cập không có thẩm quyền.
- 83 kiểm thử hồi quy: canonical, bổ nhiệm/miễn nhiệm/kiêm nhiệm, cleanup cũ, specialty/multi-role, Hỏi giá. Tổng 90 kiểm thử đạt.
- Preview Super Admin: thực hiện chuyển đổi qua nút chọn → xác nhận → RPC thành công → đọc lại lịch sử với đúng mã phục hồi; không lỗi JS. Đối chiếu danh sách bổ nhiệm/đơn vị/chức vụ và Role của tài khoản không chuyển đổi không thay đổi. Quan hệ Kinh doanh trong snapshot khớp dữ liệu hiện tại.
- Màn hình bổ sung quyền đã kiểm tra desktop/mobile, không tràn ngang; lưu/thu hồi bổ sung và khôi phục được kiểm thử cô lập, chưa cấp quyền thử lên nhân sự thật.
- Kiểm kê công việc chờ cũ chỉ bao phủ Nghỉ phép/3K/Tài chính, không đủ để kết luận mọi job Marketing/Thiết kế không bị thiếu quyền. Admin cần rà danh sách job được giao sau bổ nhiệm.
