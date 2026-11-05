# 3K linh hoạt và kỷ luật ngày — 05/11/2026

- Migrations 0245–0249 đã áp dụng; hai lần migration lỗi được rollback hoàn toàn trước khi sửa.
- Xóa lịch cá nhân không xóa kết quả KPI/versions/tổng kết/chốt; khôi phục tối đa 15 ngày. Purge kiểm tra lịch sử bảo vệ.
- Dấu mốc đầu ngày theo cài đặt 08:45 Việt Nam, chạy một lần/ngày; ngày hiệu lực 06/11/2026. Không backfill checkpoint hoặc deadline tổng kết lịch sử.
- Giờ tổng kết thực tế hiện 20:00 được giữ nguyên. Chốt tự động độc lập; sửa kết quả sau chốt yêu cầu lịch sử/lý do, không cộng hai phiên bản.
- Theo dõi kỳ tách kế hoạch, xác nhận nhân viên và chốt; báo cáo gửi chỉ dùng snapshot mới, không tự bật Zalo.

## Kiểm chứng

210/210 kiểm thử 3K đạt qua `bunx vitest run src/lib/biz/k3*test.ts --maxWorkers=2`. Bao gồm xóa/khôi phục/giữ snapshot, checkpoint muộn/đúng hạn, nghỉ cả ngày/nửa ngày, lịch Chủ nhật, chống sửa dấu mốc và deadline đông cứng. Build mới nhất OK.

Đã đọc schema live: hai cột summary_deadline_at tồn tại; review state dùng deadline riêng. Cron `k3-morning-checkpoint` hoạt động `45 1 * * *`.

## Chưa nghiệm thu

- Truy cập 1280×1800 và 390×844 đều chuyển `/login`, không lỗi JS/không tràn; đây không phải nghiệm thu giao diện 3K đã đăng nhập.
- Mint phiên `--self` không khớp tài khoản. Không tự chọn tài khoản khác hoặc ghi dữ liệu thử trên backend chung.
- Chưa chạy checkpoint vận hành sau ngày hiệu lực, chưa gửi Zalo thật; Zalo không được bật và chưa Publish.
- Nguồn checkpoint hiện sử dụng timestamp cập nhật KG/KF bảo thủ. Cần tinh chỉnh timestamp thiết lập lịch riêng để không coi sửa nội dung sau cutoff là thiết lập mới khi checkpoint chạy chậm. Thiếu quan sát được hiển thị riêng, không suy đoán lịch sử.