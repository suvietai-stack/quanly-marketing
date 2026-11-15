# Dashboard theo vị trí: cá nhân và phạm vi quản lý

Dashboard chung chỉ có **Cá nhân tôi** và, khi có quyền/phạm vi hợp lệ, **Phạm vi quản lý**. Bỏ các tab Tổng hợp/Nhân sự/Vận hành Marketing khỏi điểm vào Dashboard chung. Các báo cáo chuyên môn vẫn ở trang nguồn của chúng.

## Cách trình bày

- Header lấy tên, đơn vị và chức danh đang hiệu lực từ máy chủ. Không mặc định tài khoản thuộc Marketing.
- Khối công việc chỉ hiện khi có việc đang mở hoặc hoàn thành trong kỳ; chỉ vẽ các nhóm có số liệu hiện tại. Không dựng bảng năm phân hệ trống hoặc các ô — cho nguồn ngoài quyền.
- Sale chỉ hiện khi có tín hiệu cần chăm sóc hoặc có kết quả trong kỳ. 3K chỉ hiện khi có KPI/ghi nhận/ngày chốt. Kinh doanh chỉ hiện khi có mục tiêu hoặc số liệu chính thức.
- Nguồn bị lỗi được báo lỗi riêng, không coi là nguồn trống. Khi tất cả nguồn hợp lệ đều trống, chỉ có một thông báo ngắn; không gọi AI cho Dashboard trống.
- Mỗi khối chỉ giữ số liệu tóm tắt, biểu đồ nhỏ và liên kết báo cáo gốc. Chi tiết 3K/KPI, KR, danh sách hồ sơ và bộ lọc chuyên sâu giữ ở phân hệ gốc. Không xếp hạng nhân viên.
- Công việc cần mình duyệt hoặc sửa vẫn có lối mở khi thực sự có dữ liệu; không hiển thị danh sách Marketing trống.

## Phạm vi và quyền

`dashboard_scope_context()` dùng `auth.uid()` và tài khoản đang hoạt động, đọc cơ cấu hiện hành và các quyền nguồn đã có; không thay resolver, Role, ngoại lệ hay bộ máy phạm vi Biz/3K/Signal.

Phạm vi công việc chuyên môn dùng ALLOW/DENY đang hiệu lực cho `report.view`/`overview.all_dept`, cây đơn vị hiện hành và phân công quản lý có kiểu rõ ràng:

- DENY khớp đơn vị thắng; quyền own không trở thành quản lý.
- ALLOW có đơn vị chỉ áp dụng cây con của đơn vị đó.
- `report.view` toàn cục chỉ được thu hẹp vào các đơn vị quản lý hiện hành; không có phân công quản lý thì không tự trở thành ALL.
- `overview.all_dept` toàn cục là quyền đọc toàn phạm vi đã được cấu hình rõ ràng; Super Admin theo cơ chế Super Admin hiện có.
- Chức danh một mình không cấp quyền. Phân công tương lai/đã hết hạn/hủy không đi vào phạm vi hiện tại.

Roster là nhân sự đang hoạt động có phân công hiện tại trong đơn vị được cấp. Khi đọc công việc vẫn dùng JWT của người hỏi, bộ lọc ID/tên duy nhất của roster và RLS nguồn. Chia bộ lọc theo lô, khử trùng ID hồ sơ khi nhiều người cùng phụ trách. Roster rỗng không rơi về dữ liệu của chính quản lý hoặc toàn công ty.

Các khối có phạm vi gốc riêng, không lấy quyền ở nguồn này mở dữ liệu nguồn khác:

- Sale quản lý cần quyền báo cáo/quản lý Signal; đọc bảng qua RLS Signal gốc, giữ phạm vi nhóm nhu cầu.
- 3K dùng `k3_settings_read` và `k3_measured_period_read` với `_manage` đúng chế độ. Không dùng roster công việc để mở thêm dữ liệu 3K; không đoán KPI từ `k3_tasks` cũ. Giữ phép đo, nghiệm thu và số liệu chốt ở nguồn gốc.
- Kinh doanh dùng `biz_can` và `biz_dashboard_data`, phạm vi/phiên bản chính thức vẫn do nguồn gốc quyết định. Cá nhân buộc `_user_id=auth.uid()`; quản lý đọc theo quyền native. KR tháng được gắn nhãn tháng, không giả thành số liệu tuần.

## AI và cache

Server đọc lại đúng chế độ/phạm vi cho mỗi lần nhận định. Browser chỉ gửi chế độ và kỳ, không gửi actor, danh sách nhân viên hoặc số liệu. Cache UI theo tài khoản/chế độ/kỳ; nhận định theo dấu số liệu. Nhận định khác dấu dữ liệu hiện tại không được trình bày như khớp báo cáo. AI chỉ nhận tổng hợp cần thiết, không nhận hồ sơ nhân sự hoặc ghi chú nghiệp vụ.

Không cộng các đơn vị đo khác nhau; KPI có số liệu không đồng nghĩa đạt mục tiêu. Số ngày chốt quản lý là ngày-người. Phân công/đơn vị chỉ giúp thu hẹp cách trình bày trong quyền báo cáo đã có, không cấp thêm quyền hành động hoặc dữ liệu.

## Kiểm tra

`npx vitest run src/lib/performance src/lib/aiSuviet`, `npx tsc --noEmit`, `npm run build`.

`supabase/tests/dashboard_scope.sql` kiểm tra quyền own, title-only, DENY, cây con, đơn vị không tồn tại, roster theo thời gian và tài khoản/EXECUTE trong transaction rồi rollback. Không thay cơ cấu hoặc dữ liệu nghiệp vụ để chạy test.
