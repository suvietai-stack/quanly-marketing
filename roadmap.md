# Lộ trình: Hoàn thiện Trung tâm Phê duyệt toàn Base

- [ ] Rà soát toàn bộ luồng duyệt còn thiếu (Video, Content Web, Social, Task, Local Map, Tối ưu Web, Sao, Mua hàng…) — trạng thái chờ, người duyệt, quyền, deep link
- [ ] Mở rộng `approval_center_read`: thêm nhánh cho từng luồng tìm thấy, cô lập lỗi từng nguồn (một nguồn lỗi không làm hỏng toàn Trung tâm)
- [ ] Deep link mở đúng hồ sơ cho từng module mới (thêm ?open= nơi chưa có)
- [ ] Nhóm bộ lọc: thêm Marketing/Task… chỉ hiện nhóm có dữ liệu
- [ ] Kiểm thử: badge khớp danh sách, không đếm trùng, không lộ trái quyền; test đơn vị + build
- [ ] Báo cáo: module đã rà, luồng đã/chưa tích hợp + lý do
