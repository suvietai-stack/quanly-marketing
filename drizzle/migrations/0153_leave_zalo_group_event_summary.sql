-- Lưu tóm tắt hồ sơ (nhân viên · loại đơn) vào sự kiện để lịch sử gửi hiển thị mà không cần quyền đọc đơn.
ALTER TABLE public.leave_zalo_group_events ADD COLUMN summary text;