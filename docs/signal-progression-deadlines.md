# Bàn giao kỳ cập nhật diễn biến — Preview

## Đã triển khai
- Diễn biến nhanh nhiều lựa chọn, ghi chú bổ sung và nội dung sửa trước lưu. Gợi ý trạng thái cần xác nhận; giữ nguyên, không lùi trạng thái hoặc tự Chốt/tạo Job. Lưu qua RPC nguyên tử/chống trùng hiện có.
- Hạn theo ngày Việt Nam: ngày giao là ngày 0; hết ngày +5, +12, +19, +26, +56 rồi +86, +116… Ranh giới `[bắt đầu, kết thúc)` tại 00:00 ngày kế tiếp.
- Một kỳ có nhiều note chỉ đạt một kỳ; note muộn không sửa kỳ trễ. Kết thúc/bàn giao trước hạn miễn kỳ chưa đến hạn; giữ kỳ đã đến hạn. Sale mới có lịch riêng từ bàn giao.
- Dữ liệu cũ bắt đầu từ mốc Admin xác nhận, không chấm trễ quá khứ. Không sửa note, timestamp hay mục tiêu cũ.
- Danh sách có lọc hôm nay/sắp hạn/quá hạn, badge và hạn cạnh diễn biến cũ; chi tiết có theo dõi kỳ và lịch sử trách nhiệm.
- Báo cáo: đúng hạn / kỳ đã đến hạn theo ngày hạn, loại miễn/chưa đến hạn; mẫu rỗng hiển thị Chưa có dữ liệu. Quá hạn/hôm nay/đang theo dõi là hiện tại, theo Sale/nhóm/nguồn và quyền. KR tham chiếu 90%, không nối tự động mục tiêu hay thưởng/phạt.
- Nhắc dùng notifications và cache Chipi hiện có; gộp Sale/loại/ngày, Zalo ineligible và Push none. Khi kích hoạt mới tạo lịch 08:00 Việt Nam mỗi ngày; không gọi dịch vụ ngoài. Chi phí phát sinh một lượt công việc hằng ngày, nhắc chờ lượt 08:00 tiếp theo, badge/báo cáo tính lúc đọc không chờ lịch.

## Thay đổi
- `src/lib/signals/deadlines.ts`, `api.ts`, `progression.ts` và kiểm thử.
- `src/components/signals/ProgressionSummary.tsx`, `ProgressionReport.tsx`, `SignalsUi.tsx`.
- `src/components/ZaloUi.tsx`, `ChipiAssistant.tsx`, `src/lib/chipi.ts`: nội dung/điều hướng nhắc dùng chung.
- Migrations 0070–0073 bổ sung cấu hình, trách nhiệm Sale, kỳ và RPC/trigger/evaluator. Client chỉ đọc, RPC kiểm quyền, private helper không mở cho client.
- `AGENTS.md`, `roadmap.md`; PGlite là dependency chỉ kiểm thử SQL tách biệt.

## Xác minh
- 135 tests liên quan tín hiệu/Chipi đạt; 14 tests mới chạy lịch/outcome PostgreSQL thật trong PGlite, không ghi dữ liệu production.
- Preview đăng nhập Super Admin: danh sách/báo cáo đọc dữ liệu thật; chọn nhiều chip, giữ nguyên gợi ý, nội dung ghép; desktop 1280 và mobile 360/390 không tràn ngang/lỗi runtime. Nút Lưu mobile cố định, không bị Chipi che.
- Build OK. Đối soát backend: 0 cấu hình kích hoạt, 0 đoạn trách nhiệm, 0 kỳ, 0 nhắc mới, 0 lịch mới.
- Chưa kiểm lưu thực tế/đồng thời/quyền bằng Sale thật hoặc nhắc hằng ngày sau kích hoạt: cần dữ liệu tách biệt hoặc tín hiệu/nội dung thật được phép. Không bấm lưu test và không tự kích hoạt production.
- Không Publish. Mở menu **Danh sách tín hiệu** hoặc **Báo cáo tín hiệu**, kéo đến **Hiệu suất ghi nhận diễn biến Sale**. Nút kích hoạt yêu cầu xác nhận rõ và ảnh hưởng backend dùng chung; chưa cần bấm để xem Preview.