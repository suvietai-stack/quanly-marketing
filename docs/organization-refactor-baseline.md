# Đối chiếu trước refactor Cơ cấu tổ chức toàn Base

Mốc kiểm tra: 2026-11-10, khoảng 07:22–07:23 UTC. Chỉ đọc dữ liệu đang có; chưa chuyển đổi dữ liệu hoặc quyền.

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