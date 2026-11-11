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

Role Trưởng nhóm Marketing/Thiết kế trùng chức năng đã ngừng chọn thông thường; tái sử dụng **Quản lý Marketing** và **Quản lý Thiết kế** khi có Nhóm thực tế. Không tự tạo Nhóm/chức vụ hoặc bổ nhiệm.

## Chưa hoàn tất — không đủ điều kiện tuyên bố hoàn thiện toàn bộ
- Quyền quản lý theo đơn vị, báo cáo toàn phòng, xuất dữ liệu và duyệt chưa có hợp đồng phạm vi an toàn ở nhiều phân hệ; không kích hoạt.
- Tập quyền cá nhân Marketing hiện vẫn kế thừa tập đã kiểm chứng của Role cũ, chưa phải bộ chức năng Marketing đầy đủ; không coi là quyền quản lý đã hoàn thiện.
- Role nhiệm vụ Marketing và HCNS giữ tập quyền trực tiếp cũ để không thay quyền người hiện có; chỉ tập được kiểm chứng mới tự cấp theo bổ nhiệm.
- Snapshot catalog được bảo vệ riêng tư nhưng chưa có thao tác phục hồi catalog dành cho Admin; khôi phục chuyển đổi quyền cũ vẫn là quy trình độc lập.
- Đã có sửa nhiệm vụ Marketing trong hồ sơ nhân sự: xem trước và kết thúc/tạo lại đúng một phân công, giữ các nguồn khác. Không tự bổ sung vị trí trưởng nhóm.
- Cần nghiệm thu bộ quyền quản lý thiết yếu và quyền kế toán/cung ứng trước chuyển đổi tiếp. Không chạy reset, không tự bổ nhiệm người thật, chưa Publish.

## Kiểm chứng dữ liệu thật
- Khi bắt đầu chưa có bổ nhiệm canonical; trong lúc thực hiện xuất hiện một bổ nhiệm Marketing mới lúc 04:00:51 UTC. Không do kiểm thử của agent: các kiểm thử ghi chạy qua PGlite cô lập. Bổ nhiệm mới được giữ nguyên; fingerprint `biz_appointments` trước/sau đều `b43bc4ce99de48c1abbe8fbb358ac0dc`.
- Đăng ký catalog báo `changed_accounts=0`, `business_unchanged=true`; giữ nguồn quyền hiện tại.
- Kiểm thử nguồn quyền/thu hồi/kiêm nhiệm/DENY/ngoài phạm vi/chống tự nâng quyền: 89 kiểm thử đạt; 4 kiểm thử catalog đạt, tổng **93**. Catalog xác minh đăng ký idempotent, không bổ nhiệm, không thay quyền cũ và snapshot riêng tư. Preview build OK.

## Hoàn thiện theo tài liệu bản 62 — 11/11/2026
- Sửa đồng hồ của phân công tức thời tại `org_change`: xem trước dùng thời gian máy chủ và apply tái sử dụng cùng mốc; không phụ thuộc đồng hồ máy người dùng. Mốc lịch sử/lịch tương lai không đổi.
- Bổ nhiệm từ sơ đồ đã được kiểm chứng **chọn → xem trước → xác nhận → lưu → refresh** trong môi trường cô lập, cả miễn nhiệm lưu và ghi lịch sử. Nhân viên không Role vẫn chọn được. Preview thật xem trước Marketing không có lỗi runtime; không xác nhận bổ nhiệm bằng tài khoản thật.
- Xem trước có thể báo không đổi quyền nếu người đó đã có quyền từ nguồn khác; không giả lập quyền mới. Nhiệm vụ đã chọn được ghi trong bản xem trước cùng chữ ký Role máy chủ.
- Hai khu vực quản trị chính: **Cơ cấu & Nhân sự** / **Role & Phân quyền**. Nhân sự/lịch sử là mục phụ. Chức vụ và đơn vị con tạo/sửa tại drawer đúng đơn vị; gỡ danh sách chức vụ toàn Base trong Cài đặt, ba dialog bổ nhiệm cũ, form thêm phân công riêng, nút quyền mặc định và dialog legacy không dùng.
- Gộp hai Role trưởng nhóm trùng chức năng, giữ IDs và snapshot `fa043ddc-8239-4c6e-8c22-492e41eff2e5`; không đổi quyền trực tiếp hoặc bổ nhiệm mới. Đổi nhãn Role quản lý Mua hàng & Giao vận. Các Role legacy đã ẩn: Leader Marketing, Designer/Chụp ảnh, Kế Toán, Cung Ứng, Nhân sự mới, hai Role trưởng nhóm trùng.
- Bộ Role ngoài Kinh doanh đang dùng: Giám đốc Marketing; Quản lý Marketing; Content Web/SEO/Local SEO/Social/Video; Nhân viên Thiết kế/Quản lý Thiết kế; Kế toán trưởng/Kế toán kho; Hành chính Nhân sự; Quản lý Mua hàng & Giao vận/Thu mua/Đóng hàng. Hệ thống và Kinh doanh giữ nguyên.
- **68 kiểm thử tập trung đạt**: nhiều nhân sự, nhiều nhiệm vụ, kế toán kho (chỉ 2 quyền đơn từ đã kiểm chứng), Thu mua, Đóng hàng, cấp/thu hồi đúng nguồn, kiêm nhiệm, ngoài phạm vi, chống tự nâng quyền và catalog. Desktop/mobile được quan sát; build OK.
- **Chưa hoàn thiện toàn bộ:** quyền quản lý theo đơn vị và nghiệp vụ kế toán/cung ứng đầy đủ vẫn chưa an toàn để tự cấp; Kế toán kho hiện không nhận quyền kế toán. Chưa có thao tác phục hồi catalog riêng hoặc kiểm thử UI thực tế bổ nhiệm Kinh doanh (chỉ bảo toàn dữ liệu và kiểm thử hợp đồng cô lập). Không reset lại 9 tài khoản, không Publish.
## Hoàn thiện dứt điểm Cơ cấu — bản 63, 11/11/2026
- **Chi tiết tài khoản không còn sửa Role/vị trí thủ công.** Tab Thông tin chỉ sửa tên/SĐT/trạng thái/ghi chú; ô "Vị trí" tự nhập và hộp chọn Role đã gỡ. Thay bằng bảng chỉ đọc "Phân công theo Cơ cấu tổ chức": chức vụ đang giữ (kể cả kiêm nhiệm), nhiệm vụ Marketing, Role hiệu lực, và nút "Đến Cơ cấu tổ chức". Dữ liệu đọc qua RPC mới `account_org_summary` (0350), chỉ Super Admin hoặc người có `settings.user_view`/`settings.user_custom_perm`; tài khoản thường không gọi được.
- **Tab Quyền một cửa.** Hiển thị quyền thực nhận kèm nguồn (chức vụ, nhiệm vụ Marketing, Role trực tiếp, quyền riêng, DENY) qua `account_permission_explain`; chỉnh sửa chỉ qua "Tùy chỉnh quyền" thống nhất (`account_supplement_read/save`, có xem trước + lý do + nhật ký). Ma trận checkbox quyền riêng và chọn Role cũ đã gỡ.
- **Duyệt tài khoản không chọn Role.** Tab Chờ duyệt chỉ còn Duyệt/Từ chối; `account_approve` tự gán Role nền "Nhân sự mới" khi không truyền Role — không ai bị khóa chức năng vì thiếu Role.
- **Sửa timeout đọc quyền.** `account_permission_explain` bản cũ gọi `has_permission` cho từng quyền (mỗi lần tính lại toàn bộ luật) nên vượt statement timeout trên dữ liệu thật. Bản 0351 vật liệu hóa luật/quyền Role/quyền riêng thành mảng một lần và lọc theo tập hợp; ngữ nghĩa giữ nguyên y hệt (quyền theo nguồn cần rule và không bị DENY; quyền khác theo Role/quyền riêng; tài khoản khóa thì rỗng; Super Admin có tất cả). Đã kiểm chứng trên Preview: cả hai RPC trả dữ liệu, tab Quyền hiển thị đầy đủ.
- **Sơ đồ khử trùng theo user ID** đã có sẵn trong `orgChart.ts`: cùng một người kiêm nhiệm nhiều chức vụ chỉ hiện một lần ở danh sách chưa phân công; người khác ID dù trùng tên vẫn hiện riêng.
- **Kiểm thử:** 5 test PGlite mới cho `account_org_summary` (Super Admin, tài khoản chưa phân công, lọc bổ nhiệm hết hạn/tương lai/đã hủy, chặn người không quyền, lọc nhiệm vụ đã gỡ); toàn bộ 121 test basePermissions đạt; typecheck/build đạt; Preview xác nhận cả ba tab Thông tin/Quyền/Bảo mật và tab Chờ duyệt.
- **Không làm:** không reset lại quyền, không bổ nhiệm người thật, không đổi quyền Kinh doanh, không tạo giao diện quản trị trùng, chưa Publish.
- **Vẫn chờ:** kiểm chứng bộ quyền quản lý theo đơn vị, kế toán và cung ứng đầy đủ trước khi kích hoạt thêm liên kết Role; Admin bổ nhiệm người thật tại Cơ cấu tổ chức.
