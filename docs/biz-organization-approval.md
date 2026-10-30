# Cơ cấu và phê duyệt Kinh doanh — nghiệm thu Preview

## Đã triển khai
- Cây Hệ/Phòng/Nhóm và nhân viên; thêm/sửa/ngừng, phân công quản lý, điều chuyển, lịch sử và xác nhận ánh xạ riêng Super Admin.
- Ba Hệ khởi tạo. Không gắn phòng cũ, không tạo quản lý hay thay KR cũ.
- Quy trình nhiều cấp theo Hệ/Phòng/loại hồ sơ/ngày hiệu lực, người hoặc chức danh, thay thế, hạn xử lý, đổi thứ tự và nhánh Giám Đốc. Phiên bản gửi chụp quy trình/nội dung/cơ cấu; nộp lại chạy từ đầu.
- Các RPC quyết định hiện có chặn vượt cấp, stale revision và tự duyệt. Chỉ cấp cuối làm chính thức. Can thiệp Super Admin có lý do/lưu vết; chuyển hồ sơ cũ cần xác nhận.
- Trung tâm Phê duyệt đọc hồ sơ mới và lịch sử cũ; bộ đếm, lọc, chi tiết KR năm/quý/12 tháng, số báo cáo, Docs, lịch sử và thao tác.
- Phạm vi máy chủ bổ sung Giám Đốc/Trưởng Phòng/Trưởng Nhóm; dashboard giữ tháng gốc, baseline và số chính thức.
- Kế hoạch vẫn không duyệt và không tạo run; thông báo chạy Base, không Zalo/Push.

## Bằng chứng
- 98 kiểm thử Biz đạt, gồm 16 kiểm thử cơ cấu/SQL + 2 quy tắc bộ lọc/hạn xử lý. Kiểm ba cấp KR/Báo cáo, thiếu người, thay thế, title không cấp quyền, return/resubmit, override, one director, snapshot và hai yêu cầu duyệt cùng revision chỉ một thành công trên PGlite tách biệt.
- UI phiên Super Admin thật: cây ba Hệ/phòng cũ, dialog thêm Hệ (không lưu), cấu hình mẫu/đổi thứ tự/thêm cấp (không lưu), hồ sơ KR đang chờ của Lê Minh Ngọc, tổng năm/quý và điều khiển. Không gửi quyết định thật.
- Mobile 360/390/430 không tràn ngang; không lỗi JavaScript trong lượt kiểm. Build cuối sạch. Chế độ tối chung chưa đổi bảng màu ngoài hệ thiết kế hiện hữu; ảnh gắn `.dark` vẫn có nền sáng ở các trang mới, không báo đã nghiệm thu giao diện tối hoàn chỉnh.
- Tải URL cứng ban đầu có thể quay về Tổng quan khi AuthGate tải phiên; kiểm bằng menu thành công. Đây là hành vi cũ ngoài phạm vi nâng cấp, chưa sửa.
- DB sau nghiệm thu: 3 Hệ, 3 phòng, 0 phòng ánh xạ, 0 phân công quản lý mới, 0 workflow, 0 run, 2 mục tiêu, 1 tài liệu. Không thêm hồ sơ/test kinh doanh hoặc gửi thông báo thử trên DB chung.

## Chờ hoàn thiện / nghiệm thu
- Admin xác nhận ánh xạ ba phòng cũ, phòng đích cần tạo, người phụ trách/nhóm và quy trình có hiệu lực. Không tự kích hoạt trước xác nhận.
- Cần hồ sơ/người nộp/người duyệt thật được chỉ định để nghiệm thu ghi–duyệt–đọc lại và thông báo thật; chưa kiểm UI nhân viên/Trưởng Nhóm/Trưởng Phòng/Giám Đốc thực tế.
- Dashboard hiện áp dụng phạm vi cơ cấu ở máy chủ và trả Hệ/Nhóm của roster, nhưng chưa thêm bộ lọc/tổng hợp Hệ/Nhóm đầy đủ trên giao diện Dashboard/KR/Kế hoạch/Báo cáo. KR chưa có thao tác gán lại bộ theo Hệ; vẫn theo phòng đã bảo toàn.
- Chỉ hỗ trợ nộp lại chạy từ đầu (mặc định), chưa thêm cách cấu hình tiếp tục cấp cũ. Can thiệp Super Admin trên hồ sơ cũ phải chuyển vào workflow trước; chưa có override trực tiếp khi chưa có workflow.
- Chưa có nhóm theo dõi riêng yêu cầu sửa Kế hoạch ở Trung tâm (yêu cầu tùy chọn); danh sách Kế hoạch hiện tại giữ nguyên.
- Các lựa chọn lịch sử cơ cấu cần nghiệm thu thêm theo tháng trước/sau chuyển; helper dùng quản lý hiện hành xem hồ sơ theo cơ cấu tại thời điểm hồ sơ, không cấp lại quyền cho người quản lý đã hết nhiệm kỳ.
- Chưa Publish; schema ở Cloud dùng chung đã áp dụng, không phải môi trường dữ liệu riêng.