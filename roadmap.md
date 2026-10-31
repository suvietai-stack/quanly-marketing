# Roadmap — Fix Kế hoạch/Deadline + Nâng cấp Báo cáo (31/10/2026)

- [x] A. Kỳ đã mở nộp tự xuất hiện trong "Công việc của tôi" (RPC biz_my_work, không phụ thuộc bộ lọc tháng); không tự tạo bản nháp; bỏ kỳ khi không thuộc phòng nào trong kỳ.
- [x] B. Khóa nộp trực tiếp sau deadline: backend đã chặn (biz_document_save kiểm biz_deadline_phase, quá hạn cần late request đã duyệt, đóng kỳ chỉ Super Admin can thiệp có audit); UI hiện nút đúng theo phase (mở/quá hạn-xin bù/chờ duyệt/được duyệt/đóng kỳ).
- [x] C. Đóng xin nộp bù sau ngày đóng kỳ: cấu hình plan_month sửa due=3/23:59, late_close=15/23:59 (có log); RPC biz_late_request_create đã chặn phase closed; UI ẩn nút khi đóng kỳ.
- [x] D. Trang Báo cáo đồng bộ Kế hoạch: "Công việc của tôi" + "Báo cáo của tôi" + "Trong phạm vi quản lý" (chỉ người có quyền), quick-filter chips, search, mobile cards 360–430px.
- [x] Kiểm thử: 146 test Biz đạt (gồm biz_my_work: kỳ mở/quá hạn/sắp mở, đã nộp biến mất, xin nộp bù pending, chặn không quyền, chặn không thuộc phòng); build OK; Playwright desktop/mobile không lỗi console, không tràn ngang.
- [ ] Chưa kiểm: mở dialog nộp từ thẻ công việc bằng tài khoản nhân viên thật (phiên hiện tại là Super Admin, không thuộc phòng tháng 11); chưa Publish.
