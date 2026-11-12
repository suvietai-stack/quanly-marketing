# Kế hoạch triển khai 510/510 quyền trên GitHub — Base Sứ Việt

> **Chưa deploy và chưa áp SQL production.** Tài liệu này là checklist bắt buộc để kết thúc lỗi "không tích được quyền" mà không mở rộng truy cập dữ liệu sai. Chỉ sửa code bằng GitHub; Lovable có thể nhận đồng bộ từ nhánh `main`, nhưng không dùng Lovable để sửa.

## 1. Hợp đồng nghiệp vụ đã chốt

- **Role = tên + danh sách permission từ cùng kho 510 keys**, không whitelist theo `role_kind`, phòng ban hay vị trí. Role chung, Role vị trí, Marketing Content/SEO/Video, Role bổ sung đều chỉnh được.
- Một nhân viên có quyền từ **Role chung + Role vị trí gắn trên sơ đồ + các Role bổ sung**, cộng **ALLOW riêng**. **DENY riêng thắng mọi ALLOW** trừ đặc quyền bootstrap của chính Super Admin. Với quyền có scope, ALLOW không tự động mở dữ liệu khác đơn vị hoặc toàn công ty.
- **Tắt trong Role** chỉ ngừng nguồn cấp đó; nếu Role khác vẫn cấp thì cá nhân vẫn có quyền. **Tắt riêng (DENY)** ngăn nhân viên sử dụng quyền nhận từ mọi Role; không làm ảnh hưởng đồng nghiệp.
- Quy trình Super Admin: **bật/tắt → xem trước → xác nhận có lý do → lưu có audit → đọc lại → thử đúng backend action**. Hệ thống không được silently chấp nhận quyền không thực thi.

## 2. Hiện trạng trên GitHub (12/11/2026)

- Kho quyền: **510**, gói `docs/role-permission-full-2026-11-12/` đã được lưu nhưng **CHƯA ÁP PRODUCTION**.
- Phân nhóm hồ sơ gói: **195** keys đã qua shared resolver; **315** keys cần định tuyến thêm. `keys.json` chứa **930** cặp Role/key được giữ dormant để tránh tự động kích quyền lịch sử.
- Candidate SQL SHA256: `4a0eb2cf084474dc336cd40143648848f3f88392a72403c575cb67db367d44ae`.
- Rollback SHA256: `09082c5a19955c125a6994b73801aa7a91aec52673246553664916271cb84229`.
- Bộ kiểm thử PGlite đi kèm có **25 test** về 510-key selection, role sources, DENY và rollback; báo cáo trước ghi 481/481 test phân quyền đạt. **Các test mô phỏng này không chứng minh đầy đủ RLS/API của 315 keys.**
- Frontend đã có bộ `PermissionChecklist` chung và editor cá nhân 3 trạng thái khi backend trả `deny_supported`. Khi database còn policy cũ, các checkbox khác vẫn bị khóa — **Publish giao diện không giải quyết được**.

## 3. Rủi ro quan trọng trước khi kích hoạt 510/510

Báo cáo trong gói SQL tự chỉ ra một số bảng Web, Thiết kế, Social, Task, Video, Thương hiệu hiện cho mọi tài khoản active đọc/ghi qua RLS cũ và chỉ chặn tác vụ tại giao diện. **Bật checkbox trên Role không tự bảo vệ những API/bảng này.** Không gọi 510/510 là hoàn thành chỉ vì preview/save và menu hoạt động.

Kiểm tra `private.permission_configured`: candidate xét key có ở một Role V2 bất kỳ, kể cả Role không thuộc nhân viên hiện hành, trước khi đi vào resolver. Đo độ trễ của nhân viên thường và chứng minh DENY/ALLOW không vượt scope. Không biến role admin được cấu hình thành cơ chế xóa giới hạn RLS tài nguyên.

## 4. Thực hiện qua GitHub (thứ tự)

**Pha A — Khóa chính xác gói triển khai, không thay đổi nghiệp vụ**

1. Chạy `node scripts/check-role-510-package.mjs` để đối chiếu SHA256, 510 keys, 195/315 và 930 pairs. Đây chỉ là kiểm tra *package*, **không** thay thế security review.
2. Chạy `npx vitest run src/lib/basePermissions/permissionFull.database.test.ts src/lib/basePermissions/permissionEditor.test.ts` và `npm run build` từ checkout đáng tin cậy. Lưu output CI.
3. Kiểm tra lại preflight production chỉ-đọc: `md5(pg_get_functiondef(...))`, owner/ACL, schema, Role/override fingerprint, các session đang chạy và rollback. Nếu drift, dựng candidate mới và SHA mới; tuyệt đối không bỏ điều kiện.

**Pha B — Gia cố tất cả cổng backend theo module, không cấp quyền production**

4. Mỗi permission phải có bảng ánh xạ `key → UI → server RPC/RLS/action → scope → DENY → test âm tính`. Nhóm đầu cần ưu tiên: Web, Thiết kế, Social, Task, Video, Thương hiệu; sau đó Tài chính, CRM/Kinh doanh, KPI/3K, Cơ cấu tổ chức và cấu hình nhạy cảm.
5. Server ghi/đọc dữ liệu phải kiểm tra actor authenticated, active, permission hiệu lực, `owner_id`/đơn vị được giao/resource state. Test gọi **thẳng API** bỏ qua frontend: user không có quyền và DENY phải bị chặn. Không đổi RLS thành `USING (true)` hay cấp truy cập rộng cho `authenticated`.
6. Thêm test tải cho nhân viên thường và kích hoạt/thu hồi quyền liên tục, kiểm tra cache invalidation, không lặp per-row permission resolver gây timeout.

**Pha C — Duyệt từng migration, nghiệm thu và phát hành**

7. GitHub PR cho code + SQL đã kiểm thử. Review diff, CI, migration preflight, backup và rollback. **Super Admin/chủ dự án duyệt riêng bản SQL đúng SHA trước khi chạy production.** Merge GitHub không tự chạy SQL.
8. Sau khi áp SQL có kiểm soát, kiểm tra `permission_editor_read` trả **510/510 grantable** cho Common, position, Marketing task, personal ALLOW và DENY. Chạy thử quyền ở 24 nhóm: bật trên Role, preview, lưu, reload, gọi API; DENY cá nhân phải chặn dù Role vẫn ALLOW; gỡ DENY phải khôi phục đúng; kiểm tra unrelated users vẫn nguyên.
9. So sánh snapshot trước/sau: Role grants, bổ nhiệm, overrides, Super Admin, approver obligations, cache/latency. Nếu regression, rollback theo runbook (lưu ý **rollback từ chối khi có DENY mới**, phải audit/xử lý DENY trước theo thủ tục chủ dự án duyệt).
10. Merge `main` → xác nhận Lovable đã đồng bộ code từ GitHub và Publish `base.suviet.vn` sau nghiệm thu. Không giả định `git push` tự Publish hay tự migrate.

## 5. Điều kiện coi là xong

- **510/510** checkbox hoạt động ở mọi Role và quyền riêng, không phụ thuộc `role_kind`; đầy đủ 3 trạng thái cá nhân.
- Preview/save/readback/audit chính xác; hệ thống không cấp ngầm 930 dormant Role/key pairs.
- DENY thắng Role ALLOW ở các chức năng mà backend thực thi; không thể gọi API trực tiếp để vượt DENY hay vượt scope.
- Không làm thay đổi dữ liệu nhân sự, vai trò Super Admin hoặc hồ sơ nghiệp vụ khi chỉ triển khai cơ chế.
- Hiệu năng trang /organization và /leave của tài khoản thường được đo, không tăng request vòng lặp.

**Không được đánh dấu Done trước khi đạt cả UI, lưu backend, hiệu lực thực tế và an toàn tài nguyên.**
