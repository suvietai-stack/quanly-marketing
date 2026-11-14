# AI Sứ Việt — chuẩn bị trước khi kết nối OpenAI

Ngày tạo nền: 14/11/2026. Không lưu khóa API, mã bí mật hoặc dữ liệu tài chính trong repository.

## Hiện trạng khi chưa có API Key

- Nhân viên đăng nhập Base bấm nhân vật Chipi để mở AI Sứ Việt.
- Chipi vẫn có thể hướng dẫn một số quy trình đã được xác minh trong Base: Job thiết kế, gửi duyệt, tín hiệu, 3K, hỏi giá, đơn hàng, nghỉ phép, v.v.
- Chipi tự biết tên và vị trí các chức năng mới đã thêm vào danh mục Base theo quyền người dùng, **nhưng không đoán chi tiết quy trình chưa được mô tả**.
- Super Admin vào **Base → Hệ thống → Kho kiến thức AI** tại `/ai-knowledge`. Có thể tải TXT, MD, CSV, DOCX, XLS/XLSX để trích xuất nội dung. Các file mặc định chỉ quản trị xem.
- PDF có thể được tải lên riêng tư nhưng chỉ trích xuất nội dung sau khi có API Key và nhấn **Đọc PDF**. Chỉ tài liệu ở trạng thái **Đã đọc nội dung** mới được chia sẻ cho toàn nhân viên.
- Base dữ liệu tìm kiếm chịu chính sách RLS của người hỏi. Không có quyền sửa dữ liệu, tự duyệt hoặc tự phân công.

## Khi quản trị viên có OpenAI API Key

1. Mở mục **Secrets/Environment Variables phía máy chủ** trong dự án đang chạy `base.suviet.vn` (Lovable Cloud hoặc hosting backend thực tế). Đừng nhầm GitHub Actions secrets với secrets của runtime website.
2. Tạo secret tên chính xác `OPENAI_API_KEY` với khóa từ OpenAI Platform. **Không gửi khóa vào chat ChatGPT, không đặt trong `VITE_*`, không tạo bảng database chứa khóa và không commit khóa lên GitHub**.
3. Tuỳ chọn: `SUVIET_AI_MODEL` để chọn model được cấp quyền trong tài khoản; mặc định source code sử dụng `gpt-6-luna`.
4. Nếu nền tảng yêu cầu, Publish/redeploy hoặc khởi động lại môi trường server để biến mới được nạp.
5. Đăng nhập Base bằng tài khoản Super Admin → **Kho kiến thức AI** → **Làm mới trạng thái**. Trạng thái “Đã nhận API Key” chỉ xác nhận server thấy biến môi trường, **chưa xác nhận API hoạt động**.
6. Nhấn **Kiểm tra kết nối**. Thao tác này từ server gọi OpenAI Model API và trả về thành công hoặc lỗi mà **không lộ khóa**.
7. Mở Chipi, hỏi: “Cách tạo Job thiết kế?” và “Cho tôi biết các Job thiết kế đang chờ xử lý mà tôi có quyền xem”. Kiểm tra việc trả lời, dẫn nguồn, giới hạn quyền bằng tài khoản nhân viên thường.
8. Với PDF đã tải trước đó, quay lại Kho kiến thức AI, nhấn **Đọc PDF**, kiểm tra nội dung trích xuất rồi mới bấm **Chia sẻ cho nhân viên**.

## Quy định an toàn

- Khóa chỉ nằm trong biến môi trường backend; không hiển thị và không được log.
- Nếu ứng dụng chưa được cấu hình OpenAI, phần hướng dẫn sẵn có vẫn hoạt động. Không giả là đã gọi AI.
- Chỉ tài khoản Base đang hoạt động mới có thể hỏi. Hệ thống giới hạn 30 câu hỏi AI/người/giờ.
- Prompt gửi tới API chỉ nên chứa dữ kiện Base đã được người dùng được phép xem và đoạn trích tài liệu được chia sẻ. Nhà cung cấp OpenAI sẽ xử lý các đoạn dữ liệu thực sự được gửi; quản trị viên cần xác định loại thông tin nào phù hợp để sử dụng.
- File gốc trong Storage riêng tư, không dùng public URL. Chỉ quản trị viên được quản lý kho.
- Hiện kết nối Base có tập dữ liệu giới hạn ở các phân hệ được đưa vào hàm tìm kiếm; không được hứa truy xuất mọi trường dữ liệu hay thống kê chính xác toàn công ty chỉ dựa vào 18 kết quả mẫu.
- Sau khi thêm một chức năng mới, Chipi tự biết menu nhưng nếu muốn hướng dẫn từng nút phải bổ sung quy trình vào kho tài liệu hoặc mã hướng dẫn.
- Công cụ này chỉ hỏi đáp/trò chuyện, không tạo, sửa, xóa hoặc duyệt hồ sơ.

## Không cần tạo lại ngày mai

API endpoint `/v1/responses`, cơ chế lấy dữ liệu đúng quyền, kho tài liệu, UI Chipi và trang kiểm tra cấu hình đã có. Khi khóa chưa tồn tại không phát sinh cuộc gọi tính phí tới OpenAI.
