# Kỳ cập nhật diễn biến, nhắc hạn và KR Sale

## Phạm vi và an toàn
- Thay quy định cũ “5 lần / lâu chưa cập nhật 7 ngày” bằng kỳ cập nhật cố định; tận dụng note, chi tiết tín hiệu, báo cáo, chuông và Chipi hiện có.
- Preview và ứng dụng đang chạy dùng chung dữ liệu. Bổ sung cấu trúc lưu kỳ nhưng **mặc định chưa kích hoạt**, chưa tạo kỳ hàng loạt, chưa gửi nhắc, chưa thay lịch chạy hiện tại. Chỉ kích hoạt sau khi Admin xác nhận rõ mốc bắt đầu bằng thời gian hệ thống.
- Không Publish; không sửa note/mốc cũ, không tạo dữ liệu thử trên dữ liệu thật, không đổi quyền hoặc các tích hợp.

## Quy tắc kỳ/hạn
- Ngày giao Sale là ngày 0 theo Asia/Ho_Chi_Minh. Kỳ đầu bắt đầu từ đúng thời điểm giao đến hết ngày +5; ba kỳ tiếp theo kết thúc ngày +12, +19, +26; kỳ dài hạn đầu đến hết ngày +56, sau đó mỗi 30 ngày.
- Lưu ranh giới dạng `[bắt đầu, kết thúc)`; kết thúc là 00:00 ngày kế tiếp hạn. Note ở đúng 00:00 thuộc kỳ mới, không tính hai kỳ.
- Một note hợp lệ trong kỳ là đạt; nhiều note chỉ đạt một kỳ. Không lấy việc sửa note hoặc đổi trạng thái đơn thuần làm note mới.
- Sau hạn, thiếu note là trễ lịch sử. Note muộn hoàn thành kỳ đang diễn ra và giải quyết tồn đọng vận hành trước đó, nhưng không đổi kỳ trễ thành đúng hạn.
- Chốt/Trượt hoặc hủy dừng theo dõi; kỳ chưa đến hạn được miễn, kỳ đã đến hạn giữ nguyên. Giữ doanh số/lý do bắt buộc và quy trình hiện có.
- Tín hiệu cũ đang mở bắt đầu từ mốc kích hoạt, không bị chấm trễ hồi tố. Tín hiệu mới từ giao Sale; đổi Sale kết thúc trách nhiệm cũ, mở lịch mới từ bàn giao, không chuyển lỗi cũ sang người mới.

## Giao diện Sale
- Giữ gợi ý nhiều lựa chọn, note sửa được trước lưu, bổ sung gợi ý còn thiếu; maket chỉ đúng nhóm Sứ quà tặng thực tế.
- Gợi ý trạng thái chỉ sau xác nhận; không chuyển lùi máy móc, không tự Chốt hay tạo Job. Một lần Lưu ghi note và trạng thái nguyên tử, giữ chống trùng hiện có.
- Bỏ thanh 5/5; khối Theo dõi diễn biến hiện kỳ, hạn, tình trạng, nút cập nhật và lịch sử note.
- Dòng/card hiện diễn biến gần nhất, thời gian, hạn và badge gọn. Thêm lọc hôm nay / sắp đến hạn / quá hạn; chế độ cần chăm sóc ưu tiên quá hạn. Giữ mở chi tiết bằng tên/dòng/card và các thao tác độc lập.
- Kiểm 360px, 390px và desktop; nút lưu, bộ lọc và thông tin chính không bị Chipi che.

## Báo cáo và KR
- Thay khu báo cáo diễn biến cũ bằng **Hiệu suất ghi nhận diễn biến Sale** trong trang báo cáo hiện có.
- Bốn KPI: tỷ lệ đúng hạn, khách quá hạn hiện tại, khách đến hạn hôm nay, khách đang theo dõi; sắp đến hạn là chỉ số phụ.
- Tỷ lệ = số kỳ đúng hạn / tổng kỳ đã đến hạn trong khoảng báo cáo ×100%; lọc theo ngày hạn, không theo ngày tạo tín hiệu. Loại kỳ chưa đến hạn/được miễn; không có mẫu hiện “Chưa có dữ liệu”.
- Chỉ số vận hành dùng trạng thái hiện tại, không bị bộ lọc ngày tạo tín hiệu làm bỏ sót khách lâu năm; vẫn áp dụng Sale, nhóm, nguồn và phạm vi quyền.
- Bảng Sale có đúng hạn/tổng kỳ, tỷ lệ và khách cần cập nhật; bấm số quá hạn/hôm nay mở đúng danh sách lọc. Mobile dùng card, KPI hai cột.
- Mục tiêu/KR đã tồn tại nhưng bộ tính hiện chưa có nguồn kỳ diễn biến đáng tin cậy. Giai đoạn này hiển thị tỷ lệ thực tế, tham chiếu ≥90% và mức đạt; không tự sửa mục tiêu hay thêm phép tính KR ở trình duyệt.

## Nhắc Base và Chipi
- Tái sử dụng thông báo đúng người nhận; gộp mỗi Sale theo ba loại: trước hạn một ngày, hôm nay, quá hạn. Khóa chống trùng theo Sale/loại/ngày Việt Nam.
- Nội dung và số lượng lấy từ dữ liệu thực; bấm chuông/Chipi mở danh sách lọc tương ứng. Khách đã cập nhật hoặc kết thúc được loại khỏi nhắc hiện tại.
- Dùng tác vụ trong database để ghi thông báo Base, không cần Zalo thành công. Chipi chỉ đọc cache chuông hiện có, không thêm hệ thống hay timer nhắc riêng.
- Chưa bật Push cho loại nhắc mới trong lượt này để tránh spam và tránh phụ thuộc công việc sửa Push đang riêng biệt; giữ Push hiện có nguyên trạng.

## Chi tiết kỹ thuật
- Migration bổ sung cấu hình kích hoạt, các đoạn trách nhiệm Sale và kỳ có ranh giới/hạn/kết quả cùng liên kết note hợp lệ; không sửa migration cũ hay viết lại lịch sử.
- Mọi bảng mới có GRANT phù hợp, RLS và client chỉ đọc; RPC/trigger tính bằng thời gian server, khóa theo tín hiệu, tuân thủ quyền và scope hiện hành. Không mở quyền private helper cho client.
- Đồng bộ kỳ trên giao/bàn giao, note và kết thúc; tác vụ idempotent hoàn tất kỳ đã đến hạn và tạo nhắc. Kết quả đúng hạn/trễ không bị note muộn thay đổi, kể cả tác vụ chạy muộn.
- RPC đọc báo cáo kiểm quyền báo cáo và scope, trả dữ liệu kỳ thực cùng thời điểm tính; giao diện không tự tăng KR. Cache gắn user và làm mới sau lưu/bàn giao.
- Điểm sửa chính: `src/lib/signals/{progression,api}.ts`, các thành phần `ProgressionSummary`, `ProgressionReport`, `SignalsUi`, `SignalsReport`; điều hướng thông báo dùng chung và phân loại Chipi khi cần. Ghi quy tắc kiến trúc vào `AGENTS.md`.
- Trước áp dụng đối chiếu schema/RPC/RLS và lịch chạy thực tế; sau áp dụng xác minh cấu trúc mới, vẫn giữ tính năng ở trạng thái chưa kích hoạt.

## Kiểm thử và bàn giao
- Test từng ranh giới +5/+12/+19/+26/+56/+86, nửa đêm Việt Nam, nhiều note một kỳ, note muộn, kết thúc sớm, bàn giao, kích hoạt tín hiệu cũ, mẫu số theo ngày hạn và mẫu rỗng.
- Kiểm chống retry trùng, lưu note + trạng thái cùng nhau, quyền Sale/Admin và nhắc gộp không trùng/không phụ thuộc Zalo.
- Kiểm luồng đọc thật trong Preview sau đăng nhập; lưu thành công và nhắc thật chỉ trên môi trường tách biệt hoặc tín hiệu/nội dung thật được người dùng cho phép, không chèn demo vào production.
- Bàn giao báo cáo file sửa, thay đổi dữ liệu, quy tắc/công thức, xử lý lịch sử/bàn giao, cách xem Preview và các kiểm thử đạt/chưa xác minh.