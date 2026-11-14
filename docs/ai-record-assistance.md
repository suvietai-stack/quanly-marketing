# Chipi: trợ lý hồ sơ đang mở

Trong chi tiết Job Thiết kế, Tín hiệu hoặc Đề nghị tài chính, chọn **Hỏi Chipi về hồ sơ này**. Ba câu hỏi nhanh giúp xem người phụ trách/bước duyệt, việc tiếp theo và tóm tắt hồ sơ.

Khi chưa có API key, máy chủ trả về tóm tắt theo trạng thái hiện tại và hướng dẫn cố định từ Base. Đây chưa phải câu trả lời AI tự nhiên. Khi đã cấu hình OpenAI, cùng hồ sơ được dùng làm nguồn cho câu trả lời AI.

Máy chủ chỉ nhận loại và ID, đọc lại bản ghi với Supabase client của người đăng nhập, giữ nguyên RLS. Không dùng service role để đọc hồ sơ; không tạo, sửa, xóa hoặc phê duyệt. Trường hợp không đọc được bản ghi sẽ báo lỗi, không dùng nội dung từ bộ nhớ phía client làm nguồn thay thế.

ID hồ sơ chỉ được giữ trong bộ nhớ tab khi chi tiết còn mở. Khi đổi hồ sơ hoặc tài khoản, giao diện nạp cuộc trò chuyện riêng đúng tài khoản/phạm vi và bỏ qua kết quả cũ đang chờ. Cuộc trò chuyện được lưu trên máy chủ từ bản nâng cấp bộ nhớ cá nhân; máy chủ bỏ qua lịch sử do client tự gửi và chỉ truy hồi lời nhân viên trong dữ liệu của chính tài khoản. Xem docs/ai-personal-memory.md. Mỗi câu hỏi đọc lại trạng thái đã lưu; thay đổi chưa lưu trong form không được đưa vào câu trả lời.

Tên người xử lý lấy từ danh bạ được phép đọc. Nếu thiếu tên hoặc chưa xác định được bước tiếp theo, hiển thị chưa xác định và dẫn về hồ sơ gốc. Hướng dẫn trạng thái không thay thế kiểm tra quyền thao tác tại hồ sơ.
