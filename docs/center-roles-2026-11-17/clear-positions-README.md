# 3 trung tâm — tên rõ, Role chuẩn và xử lý vị trí cũ (17/11/2026)

## Cơ cấu hiển thị
- **Công ty → Trung tâm Kinh doanh B2B → Phòng B2B → Nhóm B2B (nếu có thật)**.
- **Công ty → Trung tâm Kinh doanh Phân Phối → Phòng Kinh doanh Phân Phối 1 → Nhóm (nếu có thật)**.
- **Công ty → Trung tâm Kinh doanh BTC → Showroom Hà Nội → Cửa hàng trưởng và Nhân viên Showroom**.
- Không tự tạo nhân viên, nhóm, phòng, showroom giả. Trung tâm và các đơn vị thật giữ nguyên ID hệ thống.
- Khối Kinh doanh rỗng và Bán Lẻ chỉ là wrapper/hệ cũ ở dữ liệu, không chen vào cây trung tâm đang sử dụng; đơn vị có lịch sử luôn có đường vào riêng.
- Vị trí Biz dùng chung đang có bổ nhiệm hiển thị trong **Vị trí cũ cần chuyển đổi** (thu gọn). Bổ nhiệm mới vào các ô chuẩn, không vào ô cũ.

## Role chuẩn theo cấp, giữ quyền sẵn
- B2B: Giám đốc Trung tâm Kinh doanh B2B → Trưởng phòng Kinh doanh B2B → Trưởng nhóm Kinh doanh B2B → Nhân viên Kinh doanh B2B.
- Phân Phối: Giám đốc Trung tâm Kinh doanh Phân Phối → Trưởng phòng Kinh doanh Phân Phối → Trưởng nhóm Kinh doanh Phân Phối → Nhân viên Kinh doanh Phân Phối.
- BTC: Giám đốc Trung tâm Kinh doanh BTC → Showroom: Cửa hàng trưởng → Nhân viên Showroom.
- Tên Role Distribution có thể cập nhật qua `rename-and-archive-unreferenced.sql` (giữ ID, nguyên các quyền đã cấp).
- 5 Role custom trùng/sai tên và **không có tham chiếu** được đổi sang trạng thái `archived` (không xóa dữ liệu/audit). Role Sales dùng chung đang có người được giữ tại mục Role cũ chờ chuyển đổi.
- Manager chuẩn định biên mặc định 1 người/ô; nhân viên nhiều người một ô. Không đổi định biên các ô hiện có.

## Tạo ô còn thiếu
Super Admin: **Cơ cấu tổ chức → Xem trước bổ sung ô vị trí chuẩn → xem quyền ảnh hưởng → Áp dụng**. Một batch gọi `org_change` để tạo các ô còn thiếu và binding Role. Nếu có tên/xung đột/lịch sử bất thường thì chặn toàn bộ. Không chỉnh trực tiếp `org_titles`, `org_assignments` hoặc `org_position_roles` bằng SQL.

**Giới hạn:** Những nhân viên đang ở ô Biz/Sales cũ chưa được tự động chuyển sang Role chuẩn vì có quyền đặc thù. Chuyển vị trí phải được Super Admin kiểm toán quyền trước/sau và ghi lịch sử, không xóa bằng SQL.
