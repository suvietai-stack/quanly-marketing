# Role chuẩn và bổ nhiệm — bàn giao

## Đã thực hiện
- Đăng ký 10 Role riêng cho Marketing, Thiết kế, Kế toán và Mua hàng; giữ ID/quyền của Role cũ, không thay nguồn trực tiếp hoặc bổ nhiệm nhân sự.
- Role tương thích ẩn khỏi bộ chọn thông thường, vẫn tồn tại cho lịch sử và phục hồi. Bản sao trước/sau riêng tư: `ee3460a9-12ab-49cc-bcca-f2dfe32e314f`.
- Bổ nhiệm từ ô sơ đồ hoặc drawer dùng chung hộp chọn nhân sự theo ID, xem trước và xác nhận tại chỗ. Nhân viên đang hoạt động không cần Role cũ để được chọn. Vị trí thường chọn nhiều người; vị trí quản lý một người; điều chuyển/kiêm nhiệm phải chọn rõ.
- Năm nhiệm vụ Marketing độc lập: Content Web, SEO, Local SEO, Social, Video. Không xóa chuyên môn Thiết kế/Chụp ảnh đã tồn tại.
- Đã chạy luồng UI chọn nhân viên giả lập không Role → xem trước → lưu → tải lại và đọc lại trên sơ đồ trong PGlite cô lập; không thay dữ liệu sản xuất. Không lỗi JavaScript; kiểm tra hộp bổ nhiệm 390×844 và sơ đồ 1280×1800.

## Liên kết thực tế hiện tại
| Chức vụ | Quyền đã kiểm chứng tự cấp | Giới hạn |
|---|---:|---|
| Giám đốc Marketing | 14 | Chỉ quyền cá nhân; 274 quyền nguồn chưa tự cấp |
| Trưởng phòng Marketing | 14 | Chỉ quyền cá nhân; 274 quyền nguồn chưa tự cấp |
| Trưởng phòng Thiết kế | 15 | 38 quyền nguồn còn chờ |
| Nhân viên Thiết kế | 15 | 38 quyền nguồn còn chờ |
| Kế toán trưởng | 2 | Chỉ tạo đơn nghỉ/giải trình; **chưa có quyền kế toán thay thế** |
| Kế toán kho | 2 | Chỉ tạo đơn nghỉ/giải trình; **chưa có quyền kế toán thay thế** |
| Trưởng phòng Mua hàng & Giao vận | 7 | Chỉ tập Hỏi giá cá nhân/đơn từ; 7 quyền còn chờ |
| Nhân viên Thu mua | 7 | Chưa thay thế trọn nghiệp vụ Cung ứng |
| Hành chính Nhân sự | 8 | Chỉ cá nhân; quản trị nhân sự chưa thay thế |
| Nhân viên Đóng hàng | 4 | `ot.view_own`, `ot.task_view`, `ot.task_update`, `ot.stage_update` |

Trưởng nhóm Marketing và Trưởng nhóm Thiết kế có Role riêng, **chưa có chức vụ tương ứng được liên kết**; không giả lập đã bổ nhiệm/cấp quyền.

## Chưa hoàn tất — không đủ điều kiện tuyên bố hoàn thiện toàn bộ
- Quyền quản lý theo đơn vị, báo cáo toàn phòng, xuất dữ liệu và duyệt chưa có hợp đồng phạm vi an toàn ở nhiều phân hệ; không kích hoạt.
- Tập quyền cá nhân Marketing hiện vẫn kế thừa tập đã kiểm chứng của Role cũ, chưa phải bộ chức năng Marketing đầy đủ; không coi là quyền quản lý đã hoàn thiện.
- Role nhiệm vụ Marketing và HCNS giữ tập quyền trực tiếp cũ để không thay quyền người hiện có; chỉ tập được kiểm chứng mới tự cấp theo bổ nhiệm.
- Snapshot catalog được bảo vệ riêng tư nhưng chưa có thao tác phục hồi catalog dành cho Admin; khôi phục chuyển đổi quyền cũ vẫn là quy trình độc lập.
- Chưa sửa chuyên môn trên một bổ nhiệm đã tồn tại; hiện cần kết thúc/tạo lại qua xem trước. Chưa bổ sung vị trí trưởng nhóm tự động.
- Cần nghiệm thu bộ quyền quản lý thiết yếu và quyền kế toán/cung ứng trước chuyển đổi tiếp. Không chạy reset, không tự bổ nhiệm người thật, chưa Publish.

## Kiểm chứng dữ liệu thật
- Không có bổ nhiệm canonical mới (`0`); fingerprint `biz_appointments` trước/sau đều `b43bc4ce99de48c1abbe8fbb358ac0dc`.
- Đăng ký catalog báo `changed_accounts=0`, `business_unchanged=true`; giữ nguồn quyền hiện tại.
- Kiểm thử nguồn quyền/thu hồi/kiêm nhiệm/DENY/ngoài phạm vi/chống tự nâng quyền: 89 kiểm thử đạt. Kiểm thử catalog bổ sung xác minh đăng ký idempotent, không bổ nhiệm, không thay quyền cũ và snapshot riêng tư.