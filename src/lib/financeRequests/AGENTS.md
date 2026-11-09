# Đề nghị Tài chính (fr_*)
- Ba loại advance/payment/salary_advance dùng chung fr_requests + fr_steps + fr_events; client SELECT-only, ghi qua fr_* SECURITY DEFINER RPC (fr_save/submit/decide/cancel/pay/deduct) với khóa dòng và request_key chống trùng.
- Quy trình duyệt cấu hình theo quyền trong fr_settings.flow; thiếu cấu hình → needs_config; người tạo không tự duyệt trừ limits.allow_self_approve.
- Quyết toán tạm ứng chỉ cập nhật khoản gốc khi đề nghị thanh toán liên kết chi xong; khấu trừ lương thủ công qua fr_deduct.
- Thông báo in-app only (zalo ineligible, push none); chứng từ trong bucket riêng tư fr-attachments theo thư mục người tạo/đề nghị.
