# Lộ trình: Hoàn thiện Trung tâm Phê duyệt toàn Base

- [x] Rà soát toàn bộ luồng duyệt còn thiếu (Video, Content Web, Social, Task, Local Map, Tối ưu Web, Sao, 3K, Hỏi giá)
- [x] Mở rộng `approval_center_read`: 7 nguồn mới + cô lập lỗi từng nguồn (migration 0304_approval_center_all_modules)
- [x] Deep link mở đúng hồ sơ: /videos?open=, /tasks?open=, /social/$id?post=, /websites/$id?open_opt= (web-contents đã có)
- [x] Nhóm bộ lọc: thêm Marketing/Công việc/Sao Sứ Việt, nhóm lạ tự hiện tên gốc
- [x] Kiểm thử: 35/35 test đạt, build OK, RPC chạy thật không lỗi nhánh
- [ ] Nghiệm thu sau đăng nhập trên Preview (badge, mở hồ sơ từng loại, mobile) — chờ người dùng đăng nhập
