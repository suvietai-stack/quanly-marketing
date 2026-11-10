# Tổng dọn dẹp Base — kết quả lượt triển khai

## Đã thực hiện
- Cài đặt Cơ cấu tổ chức còn ba nhóm: Đơn vị tổ chức / Chức vụ & Chức năng / Role & Phân quyền.
- Chuyên môn đặt trong Chức vụ & Chức năng; ma trận, kiểm tra quyền và thông tin kế thừa/tùy chỉnh vào Nâng cao.
- Role gốc phân nhóm hiển thị: Kinh doanh, Marketing, Thiết kế, Vận hành, Quản trị & Điều hành, Khác. Không tạo lại ID hoặc thay permission.
- Người có settings.role hoặc settings.permission được mở Cài đặt dù không có quyền sửa cơ cấu; quyền sửa Role và xem ma trận được tách riêng.
- Chặn thao tác cấp quyền tùy chỉnh chưa có đường áp dụng, thay vì cho nhập rồi thất bại lúc xem trước.
- Lưu Role chờ kết quả thật và hiển thị lỗi, không báo thành công trước khi ghi hoàn tất. Permission và phạm vi tín hiệu vẫn là hai lần ghi riêng; chưa phải giao dịch nguyên tử.
- Chuyên môn chỉ đọc bởi người đang hoạt động: chính chủ, Super Admin hoặc settings.user_view/settings.role/settings.permission. RPC ứng viên áp dụng cùng giới hạn; không còn đường đọc vượt chính sách.
- Danh sách Role trên điện thoại dùng danh sách dọc thay cho bảng hẹp.

## Rà soát phân loại
| Phần | Phân loại | Xử lý |
|---|---|---|
| Role trong Tài khoản | CHUYỂN VỊ TRÍ | Đã chuyển từ lượt trước; tiếp tục dùng store app_roles hiện hữu |
| Hai danh sách Role mặc định trong cơ cấu | HỢP NHẤT | Gỡ tab trùng; giữ thông tin từng chức vụ và trạng thái chưa kích hoạt |
| Form quyền bổ sung không lưu được | CẦN HOÀN THIỆN | Chặn nhập ngay, giữ cấu hình lịch sử |
| Ma trận và debug | CHUYỂN VỊ TRÍ | Nâng cao, đúng quyền |
| BizOrganization/BizPositions/BizAppointments | CẦN HOÀN THIỆN | Chưa xóa: còn cần chứng minh thay thế đầy đủ nghiệp vụ |
| Phê duyệt tổng và Kinh doanh | GIỮ | Tổng là tổng hợp/điều hướng; Biz còn quy trình riêng, không coi là code chết |
| CRM/KR/KPI/Tín hiệu/Tài chính/Nghỉ phép | GIỮ | Không đổi dữ liệu, scope hoặc workflow trong lượt này |

## Chưa hoàn thành — không phải giới hạn bên ngoài
1. Cấp/thu hồi đa Role theo nguồn: client hiện chỉ chọn một roleId; setRole xóa rồi thêm qua hai yêu cầu, chưa có giao dịch và provenance.
2. Kế thừa Role: database vẫn có active=false fence; cần resolver chung và kiểm chứng scope đọc/ghi/báo cáo/xuất/duyệt/thông báo trước khi bật.
3. Quyền tùy chỉnh cộng thêm: user_permission_overrides hiện thay thế Role, không cộng. org_change chưa có command grants/defaults/bundles/bindings. Không đổi ngầm ý nghĩa cũ.
4. Chuyên môn trong workflow: chưa nối vào picker và kiểm tra quyền nhận việc từng phân hệ; không đổi người phụ trách hiện có.
5. Gỡ code quản trị Biz cũ và nghiệm thu đủ các luồng tổ chức/điều chuyển theo yêu cầu.
6. Hiệu năng org_workspace_read: trang tải xong bằng phiên thật nhưng lần đầu mất hàng chục giây; chưa tối ưu truy vấn trong lượt này.

## Kiểm chứng
- 133/133 kiểm thử tập trung đạt (12 tệp): tổ chức, Role, tài khoản, chuyên môn, điều hướng, phê duyệt.
- Preview đăng nhập bằng tài khoản hiện tại: ba tab chính, lọc Marketing hiển thị sáu Role gốc, mở/đóng chi tiết quyền, thông báo chưa hỗ trợ. Không ghi thay đổi quyền thật để kiểm thử.
- Điện thoại 390×844 và desktop 1493×1082: không lỗi JS/tràn trang; đã bổ sung danh sách Role mobile sau kiểm tra.
- Build OK. Đối chiếu app_roles/user_roles/mkt_staff_specialties trước–sau không đổi.
- Migration 0316_marketing_specialty_scoped_reads.sql áp dụng và chính sách thực tế đã xác minh.
- Thay đổi: BaseOrganization.tsx, AccountsSettings.tsx, OrgUnitDrawer.tsx, MarketingSpecialties.tsx, rolePresentation.ts và tests, marketingSpecialties.database.test.ts, ghi chú kiến trúc/lộ trình.
- Chưa Publish, không tạo Draft, không reset/xóa dữ liệu.