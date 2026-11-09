# Đề nghị Tài chính (fr_*)
- Ba loại advance/payment/salary_advance dùng chung fr_requests + fr_steps + fr_events; client SELECT-only, ghi qua fr_* SECURITY DEFINER RPC (fr_save/submit/decide/cancel/pay/deduct) với khóa dòng và request_key chống trùng.
- Quy trình duyệt cấu hình theo quyền trong fr_settings.flow; thiếu cấu hình → needs_config; người tạo không tự duyệt trừ limits.allow_self_approve.
- Quyết toán tạm ứng chỉ cập nhật khoản gốc khi đề nghị thanh toán liên kết chi xong; khấu trừ lương thủ công qua fr_deduct.
- Thông báo in-app only (zalo ineligible, push none); chứng từ trong bucket riêng tư fr-attachments theo thư mục người tạo/đề nghị.
- Đề Nghị Thanh Toán mới bắt buộc bảng kê fr_request_lines (fr_save nhận payload.lines, tự tính line_total/amount, fr_submit chặn khi không có dòng lẫn detail cũ); đề nghị trước nâng cấp không có dòng vẫn hiển thị/gửi qua detail; danh mục gợi ý fr_line_catalog quản lý bởi fr.payment.settings; component chung src/components/finance/ExpenseLines.tsx (bảng Desktop, thẻ+Dialog Mobile).
