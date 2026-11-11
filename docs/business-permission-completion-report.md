# Báo cáo — Hoàn thiện phân quyền nghiệp vụ sau migration 0353 (bản 69)

Ngày: 2026-11-11. Không làm lại resolver, không tạo Role mới, không reset quyền, không đổi cơ cấu, chưa Publish.

## 1. Phát hiện then chốt

- **10 liên kết Chức vụ → Role chuẩn đã cấp quyền thật**: `org_role_rules` không phụ thuộc cờ `active` (cờ này chỉ rào kích hoạt full-Role); điều kiện thật là bổ nhiệm còn hiệu lực + chức vụ hoạt động + chữ ký quyền khớp + quyền nằm trong danh sách đã kiểm chứng. Kiểm tra trên dữ liệu thật: 5 nhân sự đang bổ nhiệm (Kế toán trưởng, Hành chính Nhân sự, Thu mua, Nhân viên Thiết kế, Giám đốc Marketing) có chữ ký hợp lệ → đang nhận quyền chuẩn qua bổ nhiệm.
- **Kinh doanh (biz.*/k3.*/CRM) là điểm nghẽn duy nhất còn lại**: rào 0347 chặn toàn bộ nghiệp vụ Kinh doanh cho 24 tài khoản đã reset, kể cả khi được bổ nhiệm lại qua luồng chuẩn. → Migration **0354** mở theo hợp đồng đã kiểm chứng (mục 2).

## 2. Hợp đồng Kinh doanh chuẩn (migration 0354)

Nguyên tắc: **chỉ bổ nhiệm Kinh doanh tạo SAU thời điểm reset (qua luồng Cơ cấu tổ chức) mới là nguồn quyền.** Bổ nhiệm/thành viên legacy giữ nguyên làm lịch sử, không tự phục hồi.

- `private.biz_source_ok(user, started_at)`: một dòng tổ chức chỉ là nguồn hợp lệ nếu tài khoản chưa reset hoặc dòng đó bắt đầu sau lần reset gần nhất.
- `private.legacy_business_allowed(user)`: cổng tài khoản — tài khoản reset chỉ dùng nghiệp vụ Kinh doanh khi có bổ nhiệm chuẩn còn hiệu lực tạo sau reset.
- Lọc theo mốc reset tại mọi resolver trung tâm: `biz_participant`, `biz_manager`, `biz_all_scope`, `biz_scope_ok`, `biz_appointment_scope`, `biz_can`, `biz_executive_holder`, `biz_department_access` (k3_can/crm_can/k3_scope_ok thừa hưởng qua các hàm này).
- Miễn nhiệm (kết thúc bổ nhiệm mới) → cổng đóng lại, thu hồi toàn bộ quyền Kinh doanh. Kiêm nhiệm tính theo từng bổ nhiệm riêng, không gộp phạm vi.
- Xác nhận trên database thật: định nghĩa mới đang chạy; **0 tài khoản reset có bổ nhiệm mới → chưa quyền của ai thay đổi** cho tới khi Admin bổ nhiệm lại.

## 3. Bảng bàn giao: Chức vụ → Role → Quyền → Phạm vi → Kết quả

| Chức vụ | Role | Quyền nghiệp vụ | Phạm vi backend | Kiểm thử |
|---|---|---|---|---|
| Kế toán kho | Kế toán kho | finance.incoming.view/claim/manual_* + leave/att cá nhân | Tiền về: giao dịch của mình + kho chưa ai nhận (fin_can_see) | ĐẠT — chữ ký hợp lệ trên dữ liệu thật; resolver parity 44/44 |
| Kế toán trưởng | Kế toán trưởng | + view_totals/reconcile/manage/remind | Toàn bộ giao dịch thường (manage/reconcile là quyền toàn cục theo thiết kế Tiền về) | ĐẠT — nhân sự thật đang nhận quyền |
| Nhân viên Thu mua | Thu mua | oq.* cá nhân, ot.view_own/task_*/reschedule | Đơn mình phụ trách (sale/supply/creator/assignee) | ĐẠT — nhân sự thật đang nhận quyền |
| Nhân viên Đóng hàng | Nhân viên Đóng hàng | ot.view_own/task_view/task_update/stage_update/accept/reschedule_reply | Việc được giao trong đơn | ĐẠT — đã kiểm chứng từ 0335 |
| Trưởng phòng Mua hàng & Giao vận | Quản lý Mua hàng & Giao vận | oq.view_all/manage/report, ot.view_all/assign/manage/report/supplier | Toàn cục trong phân hệ Hỏi giá/Theo dõi đơn (thiết kế hiện hữu không có trường phòng ban trên đơn) | ĐẠT — liên kết hợp lệ; giới hạn ghi mục 5 |
| Nhân viên Thiết kế | Nhân viên Thiết kế | order.* cá nhân (take/submit/deliver...) | Đơn mình tạo/được giao (design_read) | ĐẠT — nhân sự thật đang nhận quyền |
| Trưởng phòng Thiết kế | Quản lý Thiết kế | order.* + approve/assign/edit/complete/cancel/report | Toàn cục trong luồng Thiết kế | ĐẠT — liên kết hợp lệ |
| Trưởng phòng Marketing | Quản lý Marketing | order.* + order.marketing_design.* đầy đủ | Toàn cục trong luồng đơn Marketing/Thiết kế | ĐẠT — liên kết hợp lệ |
| Giám đốc Marketing | Giám đốc Marketing | như Trưởng phòng Marketing | như trên | ĐẠT — nhân sự thật đang nhận quyền |
| Hành chính Nhân sự | Hành Chính Nhân Sự | leave.*/att.* quản lý đầy đủ + kpi.view_own | Toàn cục Nghỉ phép/Chấm công (view_all/manage theo thiết kế hiện hữu) | ĐẠT — nhân sự thật đang nhận quyền |
| Chức vụ Kinh doanh (biz_positions) | — (không qua liên kết Role) | biz.*/k3.*/CRM qua bổ nhiệm Kinh doanh | Hệ/Phòng/Nhóm theo bổ nhiệm (biz_scope_ok) — phạm vi tổ chức thật | ĐẠT — 6/6 kiểm thử hợp đồng 0354 |
| Nhiệm vụ Marketing (Content/SEO/Local/Social/Video) | Role nhiệm vụ | web.*/social.*/video.*/local.* cá nhân | Việc của mình trong từng nhiệm vụ | ĐẠT — đã kiểm chứng từ 0323 |

## 4. Kiểm thử đã chạy

- 6/6 kiểm thử hợp đồng Kinh doanh mới (`bizStandardContract.database.test.ts`): chặn legacy sau reset; mở bằng bổ nhiệm mới; đúng phạm vi phòng D1/không lọt D2; bổ nhiệm legacy không tự phục hồi phạm vi; miễn nhiệm thu hồi toàn bộ; Super Admin không đổi.
- Hồi quy toàn dự án: 1514/1516 đạt; 2 lỗi còn lại là lỗi phụ thuộc ngày đã biết ở `biz/my-work` (không liên quan).
- Typecheck/build đạt. Kiểm thử dùng dữ liệu cô lập; không thử trên quyền nhân sự thật.

## 5. Chưa triển khai được — ghi chính xác

1. **Tín hiệu (signal.*) tự cấp từ bổ nhiệm**: chức vụ Kinh doanh thuộc nguồn `biz_positions` mà `org_role_rules` loại trừ đúng thiết kế; đồng thời phạm vi nhóm nhu cầu (`sig_scope_ok`) đang đọc Role TRỰC TIẾP (user_roles), không đọc bổ nhiệm. Phần thiếu: hợp đồng phạm vi nhóm theo bổ nhiệm + liên kết chức vụ Kinh doanh. Hiện tại quyền signal.* có sẵn trong các Role chuẩn trực tiếp (Kinh doanh Đơn Hàng, Lead Kinh Doanh ĐH, Kinh Doanh Phân Phối, Showroom) — Admin cấp qua công cụ Tùy chỉnh quyền, phạm vi nhóm hoạt động ngay.
2. **Quản lý theo đơn vị cho Tài chính/Hỏi giá/Theo dõi đơn/Nghỉ phép**: các bảng nghiệp vụ không có trường đơn vị tổ chức trên bản ghi (giao dịch, đơn, đơn nghỉ phép), nên manage/view_all là toàn cục trong phân hệ theo đúng thiết kế hiện hữu. Không tự mở rộng; cần bổ sung quan hệ đơn vị trên dữ liệu nếu muốn giới hạn theo phòng.
3. **Duyệt nội dung Marketing** (web.outline_approve, web.post_approve, video.approve, social.post_approve...): chưa nằm trong danh sách kiểm chứng vì RLS bảng nội dung chưa được chứng minh đầy đủ — giữ chặn, cấp thủ công qua Tùy chỉnh quyền khi cần.
4. **Cấu hình hệ thống** (settings.*, finance.incoming.bank_config/gmf_config, ot.settings, force_status/delete/restore): vẫn chặn an toàn, chỉ cấp thủ công có kiểm soát.

## 6. Việc cần Admin làm

- Bổ nhiệm lại nhân sự Kinh doanh tại Cơ cấu tổ chức (chức vụ nguồn biz_positions) → quyền biz.*/k3.*/CRM tự kích hoạt đúng phạm vi theo hợp đồng 0354; miễn nhiệm tự thu hồi.
- Quyền Tín hiệu cho Sale: cấp Role chuẩn trực tiếp qua Tùy chỉnh quyền (phạm vi nhóm theo Role hoạt động ngay).
