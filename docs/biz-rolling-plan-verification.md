# Rolling Plan — kiểm chứng 31/10/2026

- Migrations 0166–0168: hồ sơ/phân bổ riêng, read/save/decide RPC, GRANT/RLS SELECT-only, nguồn thực tế tháng từ helper chính thức theo khoảng và phân bổ Tuần.
- Cam kết năm và mục tiêu tháng lịch sử không bị ghi đè; phân bổ duyệt lưu trong hồ sơ riêng, chỉ tháng sau tháng hiện tại chỉnh sửa.
- Chia đều và tỷ trọng dùng BigInt/largest remainder; số lượng và VNĐ nguyên không âm. Nháp cho thiếu với cảnh báo, gửi duyệt cần đủ nguồn chính thức và đủ tổng; vượt là phấn đấu không tăng cam kết năm.
- Luồng goal_year hiện có tiếp nhận entity rolling_plan; can_act và các bước giữ quy tắc hiện hành. Duyệt kiểm lại toàn bộ basis/source identities và thời điểm, cấm tự duyệt. Can thiệp duyệt tắt không áp dụng cho rolling entities.
- 56 tests ở 6 files đạt; 19 test Rolling gồm tính hụt/vượt/phần dư, khóa tháng/cam kết, pending không áp dụng, nguồn đổi chặn duyệt, trả lại giữ hiện hành và duyệt cuối áp dụng.
- UI kiểm bằng phiên Admin thật: xem mục tiêu của Lê Minh Ngọc với 3 KR đã duyệt, giữ doanh số năm 3.480.000.000; tháng 11/12 hiện hành 700.000.000. Thiếu lịch sử chính thức hiển thị NULL/cảnh báo, không tạo số còn phải đạt giả. Desktop và mobile 390px không tràn/lỗi trình duyệt.
- Chưa nghiệm thu gửi/duyệt thật: Admin không có mục tiêu cá nhân và mục tiêu vận hành hiện thiếu báo cáo lịch sử. Không tạo thử/đổi tài khoản hoặc nộp thay nhân viên.
- Chưa nối chuỗi biểu đồ phân bổ tương lai riêng trên Dashboard; Dashboard vẫn giữ nguồn cam kết năm và thực tế chính thức. Không dùng kế hoạch bù để tính lại cam kết năm.
- Chưa Publish. Database thay đổi dùng chung với ứng dụng đã xuất bản; không cập nhật dữ liệu vận hành.