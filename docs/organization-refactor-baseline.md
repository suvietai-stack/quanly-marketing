# Đối chiếu trước refactor Cơ cấu tổ chức toàn Base

Mốc cũ bên dưới là baseline app đã được ghi ở lượt trước, KHÔNG đại diện dữ liệu của bản nháp hiện tại. Kiểm tra riêng ngày 2026-11-10 xác nhận bản nháp có 2 Hệ, 2 Phòng, 2 phân công Phòng, 2 profiles, 2 user_roles; tất cả các nguồn bổ nhiệm/chức vụ/cấu hình Base đều rỗng. Không sao chép nhân sự thật sang dữ liệu ví dụ.

## Đối chiếu bản nháp trước thay đổi

| Nguồn | Số dòng | MD5 sorted row_to_json |
|---|---:|---|
| biz_systems | 2 | 778ebf1dbb5d111bbfc21141f6cd9bbf |
| biz_departments | 2 | 2d75951d240532b7bf130b2df415cefe |
| biz_department_members | 2 | 2daf4d9405102a0fc07d392a94aac630 |
| profiles | 2 | b115407b895119754d3f62237ab0be7d |
| user_roles | 2 | d5c72ec2348cd6959eecb2e4d30e1376 |

Nguồn còn lại (appointments, positions, teams, team_members, management_assignments, affiliations, department_system_history, org_events, base_org_state, title_role_links): 0 dòng, MD5 d41d8cd98f00b204e9800998ecf8427e.

## Baseline app trước đó (không dùng làm kết quả bản nháp)

## Kết quả bản nháp 2026-11-10

- Canonical: 6 đơn vị (2 nút cấu trúc công ty/khối + 4 đơn vị nguồn), 2 phân công nguồn primary, 0 chức vụ/bổ nhiệm. Không tạo bổ nhiệm giả để lấp dữ liệu rỗng.
- Các MD5 biz_systems, biz_departments, biz_department_members và user_roles giữ nguyên so với bảng đối chiếu bản nháp. Không đọc hoặc áp dụng baseline app như dữ liệu của bản nháp.
- Profiles sau đăng nhập kiểm chứng vẫn 2 dòng, MD5 cc37d7c48dc6f1d3e86689feaca5346e khác baseline b115407b895119754d3f62237ab0be7d: đăng nhập có thể cập nhật dấu hoạt động hồ sơ; chưa đối chiếu từng trường nên KHÔNG kết luận toàn bộ profiles byte-identical. Tài khoản kiểm tra tạm đã xóa, user_roles vẫn 2 dòng và MD5 nguyên vẹn.
- 22 kiểm thử hợp đồng tổ chức mới đạt; 5 kiểm thử cây và 28 kiểm thử phân công đạt. Đây KHÔNG phải xác nhận đạt đủ 22 kịch bản nghiệm thu người dùng.
- Hồi quy Biz/Base: 612/614 đạt; 2 lỗi ở my-work phụ thuộc lịch/kỳ nộp, vẫn chưa xử lý.
- Kiểm tra đăng nhập bằng tài khoản ví dụ: /organization hiển thị cây trên desktop 1280×1800 và mobile 390×844, không lỗi JavaScript hoặc tràn ngang. Không có quyền quản trị nên chưa kiểm chứng drawer/phân công/apply qua UI.
- Các đường public ghi Base/Biz cũ không còn EXECUTE authenticated; org_change có EXECUTE. Direct projection DML bị thu hồi và có trigger fence. Không kiểm tra nghiệm thu ghi nhân sự thật.

### Chưa được chấp nhận là hoàn tất

1. Chuyển primary obligations Kinh doanh qua khối khác và scheduled primary cần xử lý projection semantics đầy đủ; hiện chưa bảo đảm tương đương.
2. Quyền bổ sung chưa có handler giao dịch chung; UI từ chối áp dụng. Role linking chưa có preview hiển thị/confirm chung hoàn chỉnh nên vô hiệu thao tác, fence 0307 giữ nguyên.
3. Cần hoàn thiện history cha (cả trước/sau, mốc hiệu lực), nhánh quyền org.manage_structure/manage_permissions, cache transitions toàn app, source revision và dependency fingerprint đầy đủ.
4. Component Biz cũ đã bỏ khỏi workspace nhưng file còn giữ, do chưa đủ chức năng tương đương để xóa theo yêu cầu; các read APIs cũ cần rà soát scoped redaction.
5. Chưa chạy đầy đủ 22 kịch bản bắt buộc, concurrency thực nhiều kết nối, RPC authenticated scoped success, CRM/Signal end-to-end, admin desktop/mobile.

### Phục hồi

Migration 0308 lưu private.org_recovery trước backfill. Không tự restore bằng cách xóa lịch sử hoặc thay ID. Khi cần phục hồi, dừng nhận thay đổi cơ cấu, đối chiếu canonical events và snapshot cùng revision, rồi thực hiện bản sửa bổ sung có kiểm toán. Các transaction bị lỗi tự rollback cả canonical/projection/audit. Không coi bản nháp này sẵn sàng chấp nhận hoặc Publish khi những mục trên chưa đạt.

## Số liệu nguồn

| Nguồn | Số lượng |
|---|---:|
| Hệ Kinh doanh | 3 |
| Phòng Kinh doanh | 4 |
| Phòng chưa có Hệ | 0 |
| Nhóm Kinh doanh | 0 |
| Phân công Phòng (gồm lịch sử) | 30 |
| Phân công Nhóm | 0 |
| Nhân sự Kinh doanh duy nhất trong phân công Phòng, gồm lịch sử | 12 |
| Chức vụ Kinh doanh | 6 |
| Bổ nhiệm Kinh doanh (gồm lịch sử) | 39 |
| Bổ nhiệm status=active, bắt đầu không sau hiện tại và chưa kết thúc | 16 |
| Quyết định quản lý legacy (gồm lịch sử) | 5 |
| Quyết định quản lý legacy còn hiệu lực | 1 |
| Phân công bổ sung/kiêm nhiệm Biz | 1 |
| Lịch sử gắn Phòng với Hệ | 4 |
| Sự kiện tổ chức Biz | 79 |
| Đơn vị Base | 7 |
| Chức vụ Base | 11 |
| Phân công Base | 0 |
| Phiên bản cấu hình Base | 1 |
| Sự kiện phân quyền Base | 0 |
| Hồ sơ nhân sự | 26 |
| Tài khoản có Role trực tiếp | 26 |
| Dòng cấp Role trực tiếp | 26 |
| Liên kết Role chức vụ | 0 |

Không cộng các nguồn phân công/bổ nhiệm thành số người: một người có thể xuất hiện ở nhiều nguồn và nhiều thời điểm. Số 12 ở trên không phải số nhân viên hiện tại.

## Dấu đối chiếu toàn bộ bản ghi

MD5 được tính từ `row_to_json` của từng bản ghi, sắp theo nội dung và nối bằng `|`; chỉ dùng phát hiện chênh lệch, không dùng bảo mật.

| Nguồn | Dấu đối chiếu |
|---|---|
| user_roles | `2d18029947fca992f4b7b5fa08d0c723` |
| biz_appointments | `971bd0116829a53400fbd28d7ee06dd0` |
| biz_departments | `bfaf2fb5c200e3d61a9489ca729ebdd7` |
| biz_systems | `e8a27ce8dc4d2307959d0fc56719e46e` |
| biz_positions | `3601062b964f04cc4b3e3dcad537b28d` |

## Phụ thuộc xác nhận trong database

Các khóa ngoại hiện có tham chiếu ID Hệ/Phòng/Nhóm/chức vụ/bổ nhiệm từ: thành viên, danh mục KR, mục tiêu năm, báo cáo/kế hoạch, lịch sử Phòng–Hệ, workflow và lượt phê duyệt, ngoại lệ quyền, yêu cầu nộp muộn, phân công bổ sung, cấu hình chu kỳ báo cáo, ngày/goal/tổng kết kỳ 3K. Phải giữ các ID và snapshot nghiệp vụ khi chuyển nguồn quản trị.

## Chưa thực hiện

- Báo cáo này là baseline, không phải kết quả migration.
- Chưa có số liệu sau chuyển đổi hoặc kết luận bảo toàn đầy đủ.
- Chưa sửa Role trực tiếp, bổ nhiệm, lịch sử, cấu hình hay dữ liệu nghiệp vụ.
- Kiểm tra 16 bổ nhiệm hiệu lực và 1 quản lý legacy là hai số riêng; cần đối chiếu trùng người/phạm vi trước khi ánh xạ, không được suy diễn hoặc gộp tự động.