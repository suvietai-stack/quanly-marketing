# Kiểm toán hiệu năng 11/11/2026 (Preview, chưa Publish)
Đo bằng cùng phiên test, Playwright, tới khi mạng lặng (tối đa 45s).
| Trang | Trước (giây / lượt gọi) | Sau |
|---|---|---|
| Trang chủ | 47,8 / 69 | 9,2 / 42 |
| /signals | 7,6 / 53 | 5,7–7,3 / 28 |
| /organization | 45,2 / 53 | 7,5 / 28 |
| /biz/crm | 45,2 / 55 (lỗi 500 quyền) | 7,2 / 28 |
| /biz/3k | 40,7 / 64 (2 lỗi 500 quyền) | 16,9 / 37 |
Nguyên nhân có bằng chứng: mỗi trang tải 18 bảng dữ liệu chung 2 lần và quyền 2–3 lần; dữ liệu chung còn tải lại mỗi lần làm mới token.
Sửa: src/lib/singleFlight.ts (+test), src/lib/auth.ts, src/lib/store.ts, src/components/AppShell.tsx (làm mới quyền 30s→120s + khi quay lại tab), src/components/BaseOrganization.tsx (60s, chỉ khi tab đang xem).
Không đổi quyền, dữ liệu, giao diện, SQL.
Còn lại (cần xác nhận): tải 18 bảng Marketing theo từng màn hình; listDeadlines/signal_progression_deadlines không còn được gọi (đề xuất xóa code); hàm SQL này gọi lại toàn bộ mỗi trang 1000 dòng; polling 15–30s ở Sao, 3K, Phê duyệt, Zalo.
