# Chipi: bộ nhớ nhân viên và cơ cấu tổ chức

Chipi đọc danh bạ cơ bản của toàn Base mỗi lần hỏi: tên nhân sự đang hoạt động, đơn vị và cấp trên, chức danh, vị trí và các phân công đang hiệu lực. Danh tính “tôi là ai” lấy từ JWT của người đăng nhập. Cơ cấu lấy trực tiếp từ `org_*`, không lấy từ Role, ký ức hoặc nội dung tự nhận. Bổ nhiệm tương lai, đã hết hạn, bị hủy hoặc đơn vị/chức danh ngừng hoạt động không được coi là phân công hiện tại.

`ai_sv_directory` là RPC riêng cho danh bạ nội bộ, chỉ nhân viên đang hoạt động gọi được. Không chứa email, điện thoại, lương, quyền, dữ liệu cá nhân mở rộng, sự kiện tổ chức hay JSON tự do. Nguồn này không mở quyền chỉnh sửa cơ cấu hoặc dữ liệu nghiệp vụ. Các hồ sơ khác vẫn đọc bằng client JWT và RLS hiện tại.

## Ghi nhớ

- `ai_sv_chat_turns` lưu câu hỏi và câu trả lời theo tài khoản, có scope `general` hoặc loại:ID hồ sơ. Mỗi lần mở Chipi khôi phục tối đa 20 lượt gần nhất trong scope đó.
- `ai_sv_memories` lưu tối đa 60 ghi chú cá nhân về sở thích giao tiếp và chủ đề đã trao đổi. Một lần trả lời có thể rút ra tối đa 3 ghi chú. Không hứa nhớ đúng mọi chi tiết.
- Mỗi lần hỏi, máy chủ lấy tối đa 8 câu hỏi gần nhất trong scope và 6 câu hỏi liên quan từ toàn bộ cuộc trò chuyện của cùng tài khoản. Tin nhắn nhân viên chỉ là lời đã nói, không phải sự thật đã xác minh về công ty.
- Các câu trả lời nghiệp vụ cũ không đưa trở lại prompt làm căn cứ; phải tra lại nguồn hiện tại. Danh tính/chức vụ/quyền không lưu vào bộ nhớ cá nhân. Ký ức tự chia sẻ không thay đổi danh tính hoặc quyền.
- Trích xuất ký ức và trả lời dùng cùng một yêu cầu OpenAI với Structured Outputs, `store:false`; không có yêu cầu AI thứ hai để ghi nhớ. API tham khảo: https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses.
- Câu trả lời hướng dẫn khi chưa có key vẫn được lưu, nhưng không tự trích xuất ký ức mới.

## Quyền riêng và điều khiển

Mở **Chipi nhớ về bạn** để xem, sửa hoặc quên. Nội dung đã sửa thủ công không bị cập nhật tự động ghi đè. Khi quên một ký ức, UI giải thích và yêu cầu xác nhận rằng toàn bộ cuộc trò chuyện đã lưu cũng bị xóa để không học lại thông tin đó; các ký ức khác giữ nguyên. Quên toàn bộ xóa cả ký ức và cuộc trò chuyện.

Không có quyền đọc ký ức người khác trong ứng dụng, kể cả tài khoản quản trị; các chính sách RLS chỉ cho chủ tài khoản đang hoạt động đọc. Client không có quyền ghi trực tiếp. Các RPC dùng `auth.uid()`, không nhận user_id do client gửi. Khóa revision bảo vệ việc quên/sửa trước phản hồi đang xử lý, request UUID chống ghi trùng và source_at giữ thứ tự câu hỏi để phản hồi cũ không ghi đè sở thích mới. Giới hạn 100 lượt lưu/giờ, cộng giới hạn AI hiện có. Hội thoại gốc được giữ đến khi người dùng yêu cầu quên; dữ liệu trước bản phát hành này không thể phục hồi từ bộ nhớ tạm trình duyệt.

## Kiểm tra

`npx vitest run src/lib/aiSuviet`; `npx tsc --noEmit`; `npm run build`.

`supabase/tests/ai_memory_isolation.sql` thử hai tài khoản đang hoạt động trong transaction rồi rollback: RLS, nhận dạng, chống ghi trùng, sửa thủ công, quên và phản hồi muộn. Không để lại ký ức hoặc hội thoại thử trong dữ liệu thật.
