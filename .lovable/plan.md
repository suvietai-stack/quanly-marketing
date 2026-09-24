# Nâng cấp Mục tiêu – KR – KPI – Dashboard – Báo cáo

Mở rộng KPI V2 đang có. Không xây lại, không tạo engine KPI thứ hai, không đổi workflow cũ, không tạo bảng mới trong đợt này.

## Giai đoạn 1 – Đối chiếu nguồn dữ liệu (đã khảo sát)

| Nhóm | Chỉ số KR | Nguồn trong Base | Trạng thái |
|---|---|---|---|
| Content Web | Bài được duyệt | Content Web + lịch sử gửi/duyệt | Đã liên kết |
| Content Web | Bài hoàn thành tối ưu | Bài tối ưu (lịch sử) | Đã liên kết |
| Content Web | Sản phẩm đăng/cập nhật, trang cập nhật | Không có module riêng | Chưa tích hợp (dùng KR tùy chỉnh qua Task) |
| SEO | Từ khóa Top 3/5/10, thứ hạng từ khóa cụ thể | Check Top (thứ hạng hiện tại) | Đã liên kết (chỉ thứ hạng mới nhất, chưa có lịch sử từng ngày) |
| SEO | Organic clicks/traffic + tăng trưởng | Số liệu tăng trưởng nhập tay theo kỳ | Cần cấu hình (nhập tay, chưa nối Search Console) |
| SEO | Bộ nghiên cứu từ khóa, audit, onpage | Task | Qua KR tùy chỉnh |
| Social | Bài được duyệt / đã đăng | Social | Đã liên kết |
| Social | Tiếp cận, tương tác, follower, lượt xem | Số liệu tăng trưởng kênh nhập tay | Cần cấu hình |
| Video | Kịch bản duyệt, dựng xong, đã đăng | Video | Đã liên kết |
| Video | Quay xong | Chưa ghi nhận người quay | Chưa tích hợp |
| Thiết kế | Order hoàn thành / nghiệm thu | Order | Đã liên kết |
| Thiết kế | Điểm thiết kế | Chưa lưu điểm duyệt | Chưa tích hợp |
| Local SEO | Bài Google Business đã đăng | Bài đăng Map | Đã liên kết |
| Local SEO | Tương tác hồ sơ, cuộc gọi | Không có | Chưa tích hợp |
| Hiệu suất | Task hoàn thành, đúng hạn, duyệt lần đầu, phải sửa, quá hạn, thời gian xử lý | Task + lịch sử | Đã liên kết (không tính thời gian chờ người duyệt) |
| Marketing | Leads | Số liệu tăng trưởng web (nhập tay) | Cần cấu hình |
| Marketing | Chuyển đổi, CPL | Không có | Chưa tích hợp |

## Giai đoạn 2 – Cấu trúc liên kết (không đổi cơ sở dữ liệu)

```text
Mục tiêu (bảng goals có sẵn)
  └─ KR = chỉ tiêu KPI có sẵn, gắn goalId
       ├─ chỉ số thư viện → tính từ module nguồn (engine hiện tại)
       └─ KR tùy chỉnh → liên kết Task đã chọn (lưu mã Task trong KR)
```

- Thư viện KR: mở rộng danh sách chỉ số hiện có với mã, nhóm, đơn vị, nguồn, quy tắc, hướng mục tiêu (ít nhất / không vượt quá / đạt ngưỡng / tăng so với kỳ gốc), trạng thái khả dụng.
- Chỉ số "Chưa tích hợp" hiện trong thư viện nhưng không giao được (như đang làm với "Quay video").
- KR thứ hạng SEO lưu mã từ khóa; đạt khi thứ hạng hiện tại ≤ ngưỡng; "Top 3 ≠ đã hoàn thành" nếu kỳ chưa kết thúc.
- KR tùy chỉnh: người quản lý chọn Task có sẵn hoặc tạo Task mới qua luồng tạo Task hiện tại; kết quả = số Task liên kết đã "Hoàn thành" (có bằng chứng), không tự hiểu 1 Task = toàn bộ chỉ tiêu.
- Mọi liên kết bằng mã, không đoán theo tên.

## Giai đoạn 3–4 – Giao diện

- **Trang Mục tiêu** (thay thế trang Giao KPI hiện tại, vẫn ở menu KPI): danh sách Mục tiêu → mở ra thấy các KR, tiến độ, người phụ trách, deadline, trạng thái nguồn; nút "Thêm KR" mở thư viện có tìm kiếm + phân nhóm hoặc "KR tùy chỉnh".
- **Dashboard**: thẻ Mục tiêu/KR của tôi (nhân viên) và tổng hợp toàn phòng (quản lý), dùng cùng số liệu với Báo cáo.
- **Báo cáo**: thêm nhóm theo Mục tiêu/KR; mỗi số liệu bấm được xuống dữ liệu gốc.
- Hiện rõ nhãn Đã liên kết / Cần cấu hình / Chưa tích hợp; không tạo số liệu giả. Tối ưu cho điện thoại.

## Giai đoạn 5 – Kiểm thử

- Bổ sung test: KR từ khóa Top 3, KR tùy chỉnh qua Task, hiệu suất đúng hạn không tính thời gian chờ duyệt, KR chưa tích hợp không giao được; chạy lại 14 test cũ + kiểm tra kiểu.
- Đăng nhập thử Super Admin và nhân viên trên bản xem trước, cả máy tính và điện thoại.

## Cần bạn phê duyệt riêng (sẽ dừng, không tự làm)

- Lưu lịch sử thứ hạng từ khóa theo ngày (để tính "tăng/giảm so với kỳ gốc" chính xác).
- Kết nối Search Console / Analytics tự động.
- Ghi nhận người quay video và điểm thiết kế đã duyệt.

## Chi tiết kỹ thuật

- Thư viện: mở rộng `src/lib/kpi/metrics.ts` + `types.ts` (thêm `direction`, `availability`, `source`, `rule`).
- Engine: thêm bộ tính SEO rank, task-linked, task-performance vào `calculateKpi.ts`; dùng chung cho Dashboard/Báo cáo.
- KR tùy chỉnh và từ khóa lưu trong `employee_kpi_items.metadata` (`taskIds`, `keywordId`, `threshold`, `customTitle`) — không cần migration; RLS và trigger khóa kỳ giữ nguyên.
- UI: `KpiV2.tsx` (trang Mục tiêu/KR), `PersonalKpi.tsx`, `PlanProgress.tsx`, `ReportV2.tsx`.
- Không Publish.
