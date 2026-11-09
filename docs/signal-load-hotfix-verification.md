# Tín hiệu load mãi — 09/11/2026

## Kết quả và giới hạn
- Đã áp dụng 0283 trên backend dùng chung; bản giao diện mới ở Preview, chưa Publish.
- Chưa được coi là hoàn thành nghiệm thu: chưa có phiên authenticated thật. Mint `--self` không khớp tài khoản; trình duyệt Publish `/signals` chuyển `/login`.
- Cần phiên Sale và quản lý được người dùng cho phép, rồi kiểm tra danh sách, đếm, quyền, bộ lọc, chuyển trang/chi tiết và lưu diễn biến thật được chỉ định. Không tạo nội dung thử trên dữ liệu vận hành.

## Nguyên nhân đã xác minh trong source và tín hiệu vận hành
- `SignalsUi.tsx`: dùng `counts.data ?? 0` trước khi tải xong; lỗi counts gộp vào lỗi page khiến danh sách tải thành công vẫn bị che. Không timeout riêng, retry mặc định và sentinel có thể tải thêm lại sau lỗi.
- 0274 `signal_list_counts` gọi `signal_filtered` ba tập lọc; hàm này dựa trên view 0278 tổng hợp lịch sử phân công/note dù số đếm không dùng các cột đó.
- RLS SELECT gọi các kiểm tra quyền không phụ thuộc dòng nhiều lần; chuyển sang scalar initplans, giữ nguyên biểu thức quyền/phạm vi/active. Phạm vi phụ thuộc `need_groups` vẫn kiểm tra từng dòng.
- RPC mới tồn tại, SECURITY INVOKER và authenticated EXECUTE được xác minh; không thấy bằng chứng lỗi thiếu hàm/grant.
- Database activity cho thấy các request đọc view/history và legacy deadline thực đang chạy, không có wait_event lock ở mẫu. Không kết luận toàn bộ nguyên nhân treo Publish đã được tái hiện bằng đúng tài khoản.

## Số đo trước sửa
- pg_stat_statements: page 2 calls mean 7127.57ms/max 7629.52ms; change token14 calls mean3685.63ms/max7034.81ms. Mẫu ít, không có tổng thời gian UI.
- EXPLAIN ANALYZE BUFFERS view priority LIMIT40 bằng quyền kiểm tra quản trị: khoảng17.4ms, 618 dòng. Không đại diện RLS authenticated và không dùng để tuyên bố khôi phục.
- Chưa có phép đo authenticated sau sửa; không đưa tỷ lệ tăng tốc giả.

## Thay đổi
- 0283 tạo `signal_base_filtered` từ định nghĩa filter cũ, counts chuyển sang base không quét lịch sử; giữ nguyên các facet/status/need/mine và invoker. Không đổi page priority hoặc write RPC.
- SELECT permission-only initplans và index `(signal_id,created_at DESC,id DESC)`; không chỉnh timestamp/hồ sơ/note.
- Reads page/count/token bị hủy sau15s, không retry tự động; lỗi độc lập với nút tải lại. Số liệu chưa có dùng —; page thành công vẫn hiển thị khi counts lỗi; counts lỗi không vô hiệu hóa chuyển trang còn đủ40 dòng.
- Token chỉ chạy sau page/count thành công, ngừng polling sau lỗi; sentinel ngừng tự tải thêm khi lần tải thêm lỗi.

## Kiểm tra
- 157 tests /20 files đạt, gồm migration0283 thật trong PGlite, filter parity và counts/page visibility cho hai người dùng authenticated cách ly.
- Browser390/1280: counts error vẫn thấy danh sách, page error không báo rỗng, timeout không treo và không request retry vòng lặp; thử tải lại thủ công đọc lại thành công.
- Browser cách ly: pagination, debounce, chi tiết, note save/read, report vẫn chạy; không gọi deadline từ danh sách mới.
- Hosted: xác minh hàm base tồn tại/invoker, counts gọi base, initplans có trong policy. Số liệu sau kiểm tra619 signals/1231 notes, có hoạt động người dùng đồng thời; không khẳng định các tổng bất biến toàn hệ thống. Không thực hiện ghi hồ sơ/note qua công cụ.

## Chưa xác minh
- Chưa kiểm tra UI Publish authenticated; frontend mới chưa được phát hành.
- Chưa có latency HTTP authenticated sau sửa, matrix Sale/quản lý, chi phí RLS bằng EXPLAIN theo caller thật, và lưu diễn biến vận hành.
- Legacy clients Publish vẫn có thể gọi deadline/history; không thay return contract của legacy RPC để che lỗi, không khôi phục nghiệp vụ kỳ note.