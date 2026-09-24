# KPI V2 — Checklist cho owner (sau Ngày 6)

Không tự bật route/menu, không Publish. Thực hiện theo thứ tự:

1. **Xác nhận migration production ở chế độ chỉ đọc**
   - [ ] Review `0000_kpi_v2_data_model.sql`, `0001_app_roles_select_permission.sql`, `proposals/kpi_stage_sidecar.draft.sql`.
   - [ ] Chạy thử trên bản sao; xác nhận không ALTER/DROP bảng nghiệp vụ hiện có.
2. **Backup**
   - [ ] Backup toàn bộ database + ghi lại thời điểm; thử khôi phục trên staging.
3. **Staging + security QA**
   - [ ] Tạo staging tách biệt, chuyển `KPI_V2_MODE` từ mock sang repository thật.
   - [ ] Kiểm tra RLS: Admin / nhân viên A / nhân viên B (không thấy dữ liệu nhau); quyết định policy Leader.
   - [ ] Chạy security scan, đối soát số liệu Report V2 ↔ Overview V2 ↔ dữ liệu gốc trên dữ liệu thật.
4. **Release theo nhóm nhỏ**
   - [ ] Bật flag cho 1–2 Admin, rồi 1 team; theo dõi 1 kỳ trước khi thêm menu.
5. **Rollback**
   - [ ] Tắt flag `VITE_KPI_V2` (route về "Trang không khả dụng").
   - [ ] Bảng KPI độc lập — có thể giữ nguyên hoặc drop mà không ảnh hưởng workflow cũ; khôi phục từ backup nếu cần.
