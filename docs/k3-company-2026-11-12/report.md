# 3K toàn công ty — kiểm tra và bản thử 12/11/2026

## Xác nhận trực tiếp
23 hồ sơ đang hoạt động, 19 người có bổ nhiệm hiệu lực, 138 KG, 3 ngày, 3 việc. Cài đặt cũ: enabled=true, effective_from=2026-11-02, discipline_from=2026-11-06. Không đổi số liệu hay ngày lịch sử.

Nguồn 3K live vẫn dùng Biz: k3_can/k3_scope_ok, ngày, danh sách/giám sát và nghĩa vụ. Bản chụp có **132 định nghĩa hàm**, từng MD5 kiểm tra khớp; **41 hàm phụ thuộc Biz** được liệt kê trong biz-dependencies.md. Lưu cả columns và constraints.

## Code đã có, chưa áp live
- `docs/pending/k3_company_schema.sql`: thêm nullable org_unit_id cho goals/days/period summaries/daily closes, company_effective_from NULL; không backfill đoán, không bật nghĩa vụ.
- `docs/pending/k3_company_scope.sql`: private helpers cá nhân active, quản lý theo kind=manager + quyền Role V2 + đơn vị cùng nguồn; DENY mạnh hơn; lịch sử dùng frozen unit; lời mời chỉ đúng KG.
- Test PGlite core scope; helper không thay k3_can public nên không giả nhận quyền hoạt động. Role/menu/matrix live chưa mở.
- Giao diện bổ nhiệm không còn bắt chọn ô legacy theo người; staff không bị metadata capacity=1 giới hạn, manager chỉ theo capacity đã đặt, không tự kết thúc người cũ.

## Còn thiếu, không đủ điều kiện áp/publish
1. Stage 3: thay public resolver và toàn bộ RPC ngày/tuần/tháng/member search/team read, RLS, writer dual attribution, trigger/automation/Zalo/discipline. Personal override ALLOW chưa nối; DENY đã có core test.
2. Test schema apply/rollback thật, 20 preset vị trí và 4 key matrix qua gate ready, invitation workflow/notification, no retroactive discipline với schedule/leave đầy đủ.
3. User-scoped live E2E, các tầng quản lý và benchmark trước/sau bằng dữ liệu tải xong. Preview lần kiểm tra trước đang loading, lần sau đang restoring session; không coi zero alert là pass.
4. Riêng Biz: SQL pending lượt trước cũng chưa áp; không chạy 0379–0382 hoặc sửa 0371; chưa cutover nguồn/xóa 31 Role và 17 links.

## Next approval
Chưa gọi tool áp SQL vì các stage chưa đủ nghiệm thu. Khi đủ điều kiện, công cụ áp là **lov_database--migration**; stage 1 chỉ bổ sung cột nullable/index, stage 2 chỉ private helpers, stage 3 mới đổi nguồn quyền/nghĩa vụ. Không có approval card đang được yêu cầu trong lượt này.

## Access trước/sau
Theo audit Owner: 3 người dùng 3K và 2 người xem phạm vi trước; mục tiêu 23 active có cá nhân, người quản lý chỉ đúng nguồn Role/cây org. **Sau lượt này live không đổi**; đây là mục tiêu chưa cutover, không phải quyền đã cấp.