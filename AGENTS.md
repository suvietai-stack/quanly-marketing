# Architecture rules

- Đơn từ (leave_*) writes go only through SECURITY DEFINER RPCs (leave_submit/decide/recall/...) that check `private.sig_can` and server time; tables are SELECT-only for clients — so permission and deadline rules cannot be bypassed from the browser.
- Leave time math lives in `src/lib/leave/calc.ts` (preview) and mirrors `private.leave_eval` (authoritative); change both together — keeps the preview and the backend check consistent.
- Thương hiệu (tên, logo, favicon) chỉ đọc từ bảng app_branding qua useBranding()/brandHeader(), luôn có giá trị mặc định dự phòng — để nhân bản cho đơn vị khác không cần sửa mã.
- Giải trình chấm công dùng bảng riêng attendance_explanations (không nhét vào leave_requests), ghi chỉ qua RPC att_* SECURITY DEFINER — để không lẫn trạng thái duyệt và báo cáo của đơn nghỉ/đi muộn/về sớm.
