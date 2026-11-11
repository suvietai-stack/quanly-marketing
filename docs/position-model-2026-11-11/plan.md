# Mô hình đúng: một vị trí trong đơn vị = một Role, nhiều nhân viên

Supersedes the "one slot = one person" cutover (queued turns umsg_01m75h6tvdeptrzrhdsqm8jfwf, umsg_01m75hek1xf47axnfq2cywayas). No new per-person slots, no legacy deletion, no Publish until this model is live and verified.

```text
Kinh doanh Sứ Quà Tặng 1
 └─ Nhân viên Kinh doanh  [role-v2-sales-staff]  → A, B, C … (không giới hạn)
 └─ Trưởng Phòng          [role-v2-sales-head]   → D (có thể nhiều người nếu không đặt giới hạn)
Một người kiêm nhiều vị trí/đơn vị → quyền = hợp các Role, mỗi nguồn giữ phạm vi đơn vị riêng.
Nhiệm vụ Marketing (chọn nhiều) chỉ hiệu lực khi có ≥1 bổ nhiệm Marketing.
Quyền riêng: chỉ cộng thêm cho một người.
```

## Hiện trạng live (read-only 15:32 UTC)
- 25 org_position_slots đang hoạt động, mỗi ô 1 người; gom lại chỉ có **16 cặp (đơn vị, chức danh)** và mỗi cặp dùng đúng 1 Role → gộp được, không xung đột.
  - Ví dụ: Phòng Marketing / Nhân viên Marketing: 4 ô → 1 vị trí; Showroom Hà Nội / NV Kinh doanh: 3 → 1; KD Sứ Quà Tặng 1 / NV KD: 3 → 1; KD Phân Phối 1 và KD Quà Tặng 2 / NV KD: 2 → 1.
- Ràng buộc ép 1 người/ô: `org_slot_no_interval_overlap` (GiST trên org_assignments.slot_id). Không có unique (unit,title).
- Hàm phụ thuộc slot: private.org_slot_rules, org_commands (slot / replace_slot_role / restore_slots), org_config, org_effect_signature, org_position_guard, slot_previous_*, role_in_use, role_references, role_catalog_fingerprint, sig_scope_ok, role_catalog_change/restore.

## Chuyển đổi đề xuất (chờ xác nhận; SQL dry-run ở `dry-run.sql`)
1. Bảng mới `org_position_roles(unit_id, title_id, role_id)` unique (unit_id,title_id), Super-Admin-only qua org_change preview/apply, audit. Dựng từ 16 cặp hiện có — không thêm/bớt quyền của ai.
2. Resolver: bổ nhiệm hiệu lực (unit,title) → Role theo org_position_roles; phạm vi lấy từ unit của chính bổ nhiệm. org_slot_rules giữ làm nhánh fallback cho tới khi preview chứng minh quyền 26 người không đổi, rồi mới tắt.
3. Bổ nhiệm mới chỉ chọn đơn vị + chức danh; không cần ô, không giới hạn số người. Giữ nguyên slot_id trên 23–25 bổ nhiệm cũ làm lịch sử.
4. Sau khi xác minh: bỏ ràng buộc GiST một-người-một-ô (cần quyền thay đổi không tương thích ngược), đánh dấu org_position_slots DEPRECATED, không xóa.
5. Chỉ sau đó mới: tháo 17 liên kết chức danh cũ, xóa Role cũ không còn tham chiếu (bảo vệ Admin/Super Admin, Nhân sự mới, Đóng hàng).

## Rollback
Bước 1–3 là bổ sung: rollback = tắt nhánh resolver mới (fallback slot vẫn còn) và xóa bảng mapping. Bước 4 chỉ làm sau xác minh; trước khi bỏ ràng buộc lưu định nghĩa để tạo lại.

## Cần chủ xác nhận
- Gắn Role theo (đơn vị, chức danh) như trên; muốn cùng chức danh ở mọi phòng dùng chung Role thì chỉ cần chọn Role giống nhau, không cần tầng toàn hệ thống.
- Vị trí quản lý mặc định không giới hạn người (đúng lời chủ); có muốn đặt giới hạn riêng cho GĐ Điều hành / Trưởng phòng không?
