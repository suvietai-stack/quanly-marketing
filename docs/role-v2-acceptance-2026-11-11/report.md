# Nghiệm thu Role V2 — 11/11/2026

## Kết luận ngắn
- **CHƯA READY cho giảm quyền live/cutover/Publish.** 25/25 preview authenticated thành công; chưa apply. 22 Role đề xuất giảm, **18 nhân viên distinct** nhận các Role đó (không cộng trùng nhiều nguồn).
- Live giữ nguyên 58 Role = 25 V2 + 33 legacy, 23 slots, 23/25 bổ nhiệm có chức danh hiệu lực. **86 là tổng lịch sử; 37 nguồn tổ chức hiện hiệu lực, gồm 12 nguồn không chức danh**, không phải 86 người/bổ nhiệm đang hoạt động.
- Nguyên nhân quyền thừa: tạo canonical dùng basis union Role cũ. Proposals NV Marketing dùng role-standard-mkt-staff + role-content-web; validator coi quyền basis là quyền được giữ, không kiểm tra tính phù hợp trách nhiệm. Content kế thừa Social/Order/settings từ Role cũ. Đây là sai mặc định, không phải lỗi cần chặn prefix trong resolver.
- Draft thay 25 preset theo trách nhiệm; giữ desired quyền cũ đã admitted, chỉ policy-gate quyền thêm mới. Nếu lọc toàn bộ bằng editor policy sẽ mất CRM/finance/Design đang chạy. Không whitelist module trong resolver.

## Giữ/bỏ từng Role
Số “người” là receiver distinct từ server preview. “Chờ” là quyền đề xuất chưa được policy cho thêm, tuyệt đối chưa cấp. Chi tiết key và sources: impact-25-roles.json.

| Role | Trước → nháp | Bỏ / thêm | Người |
|---|---:|---:|---:|
| Giám đốc Kinh doanh | 2 → 7 | 0 / 5 | 2 |
| Trưởng phòng Kinh doanh | 31 → 14 | 17 / 0 | 2 |
| Trưởng nhóm Kinh doanh | 31 → 14 | 17 / 0 | 0 |
| Nhân viên Kinh doanh | 21 → 14 | 7 / 0 | 10 |
| Trưởng phòng Thiết kế | 25 → 15 | 11 / 1 | 0 |
| Nhân viên Thiết kế | 15 → 14 | 2 / 1 | 1 |
| Giám đốc Marketing | 31 → 6 | 27 / 2 | 1 |
| Trưởng phòng Marketing | 32 → 6 | 27 / 1 | 0 |
| Nhân viên Marketing | 22 → 8 | 14 / 0 | 4 |
| Hành chính Nhân sự | 27 → 11 | 16 / 0 | 0 |
| Đóng hàng | 10 → 11 | 0 / 1 | 0 |
| Giao vận | 10 → 11 | 0 / 1 | 0 |
| Thu mua | 17 → 15 | 2 / 0 | 1 |
| Nhân viên Cung ứng | 8 → 9 | 2 / 3 | 0 |
| Quản lý Mua hàng & Giao vận | 26 → 16 | 11 / 1 | 0 |
| Kế toán | 10 → 8 | 5 / 3 | 0 |
| Kế toán trưởng | 15 → 9 | 6 / 0 | 1 |
| Kế toán kho | 10 → 7 | 3 / 0 | 0 |
| Giám đốc Điều hành | 6 → 5 | 3 / 2 | 0 |
| Phó Giám đốc Điều hành | 6 → 5 | 3 / 2 | 1 |
| Content Web | 61 → 27 | 34 / 0 | 2 |
| SEO | 30 → 14 | 16 / 0 | 0 |
| Local SEO | 34 → 16 | 18 / 0 | 0 |
| Social | 35 → 17 | 18 / 0 | 0 |
| Video | 54 → 23 | 31 / 0 | 1 |

## Chi tiết quyền cụ thể

### Giám đốc Kinh doanh (role-v2-sales-director)
- Giữ: leave.view_own, leave.create
- Bỏ đề xuất: không
- Thêm đề xuất chưa áp dụng: att.create, att.view_own, leave.recall, leave.view_unit, ot.view_unit
- Chờ kiểm chứng/không đưa vào proposal: biz.crm_use, signal.sale, oq.create, oq.view_own, oq.accept, oq.report_own, ot.view_own, biz.crm_view_scope
- Người nhận: Trung Hiếu, Admin Hệ Thống
- Nguồn distinct: {"slots": 2, "tasks": 0, "total": 2, "direct": 0, "legacy": 0}

### Trưởng phòng Kinh doanh (role-v2-sales-head)
- Giữ: leave.view_unit, leave.recall, oq.accept, ot.view_unit, oq.view_own, leave.view_own, att.view_own, biz.crm_view_scope, leave.create, att.create, oq.create, biz.crm_use, signal.sale, oq.report_own
- Bỏ đề xuất: kpi.view_own, oq.report_all, finance.incoming.view, finance.incoming.view_unit, finance.incoming.view_totals, signal.report, finance.incoming.claim, finance.incoming.manual_view, oq.reply_progress, biz.crm_edit_other, signal.reassign, att.witness, overview.view, oq.reply_price, signal.assign, settings.view, oq.manage
- Thêm đề xuất chưa áp dụng: không
- Chờ kiểm chứng/không đưa vào proposal: ot.view_own
- Người nhận: Trung Hiếu, Admin Hệ Thống
- Nguồn distinct: {"slots": 2, "tasks": 0, "total": 2, "direct": 0, "legacy": 0}

### Trưởng nhóm Kinh doanh (role-v2-sales-team)
- Giữ: leave.view_unit, leave.recall, oq.accept, ot.view_unit, oq.view_own, leave.view_own, att.view_own, biz.crm_view_scope, leave.create, att.create, oq.create, biz.crm_use, signal.sale, oq.report_own
- Bỏ đề xuất: kpi.view_own, oq.report_all, finance.incoming.view, finance.incoming.view_unit, finance.incoming.view_totals, signal.report, finance.incoming.claim, finance.incoming.manual_view, oq.reply_progress, biz.crm_edit_other, signal.reassign, att.witness, overview.view, oq.reply_price, signal.assign, settings.view, oq.manage
- Thêm đề xuất chưa áp dụng: không
- Chờ kiểm chứng/không đưa vào proposal: ot.view_own
- Người nhận: 0
- Nguồn distinct: {}

### Nhân viên Kinh doanh (role-v2-sales-staff)
- Giữ: finance.incoming.view, leave.recall, oq.accept, finance.incoming.claim, finance.incoming.manual_view, oq.view_own, leave.view_own, att.view_own, leave.create, att.create, oq.create, biz.crm_use, signal.sale, oq.report_own
- Bỏ đề xuất: kpi.view_own, signal.report, oq.reply_progress, att.witness, overview.view, oq.reply_price, settings.view
- Thêm đề xuất chưa áp dụng: không
- Chờ kiểm chứng/không đưa vào proposal: ot.view_own
- Người nhận: Nguyễn Thị Hồng Giang, Trung Hiếu, Nguyễn Thị Thu Hương, Nguyễn Dung, Nguyễn Thị Hòa, Nguyễn Thị Thanh Mai, Nguyễn Thảo, Lê Phượng, nguyễn lan anh, Nguyễn Nhàn
- Nguồn distinct: {"slots": 10, "tasks": 0, "total": 10, "direct": 0, "legacy": 0}

### Trưởng phòng Thiết kế (role-v2-design-head)
- Giữ: leave.view_unit, order.open_delivery, leave.recall, leave.view_own, order.update_draft, order.take, order.view_mine, order.history, order.deliver, leave.create, order.resubmit, att.create, order.view, order.submit
- Bỏ đề xuất: order.request_changes, order.edit_reviewer, order.create, order.cancel, order.complete, order.approve, order.view_all, att.witness, order.assign, order.edit, order.report_view
- Thêm đề xuất chưa áp dụng: att.view_own
- Chờ kiểm chứng/không đưa vào proposal: không
- Người nhận: 0
- Nguồn distinct: {}

### Nhân viên Thiết kế (role-v2-design-staff)
- Giữ: order.open_delivery, leave.recall, leave.view_own, order.update_draft, order.take, order.view_mine, order.history, order.deliver, leave.create, order.resubmit, att.create, order.view, order.submit
- Bỏ đề xuất: order.create, att.witness
- Thêm đề xuất chưa áp dụng: att.view_own
- Chờ kiểm chứng/không đưa vào proposal: không
- Người nhận: Vũ Hạnh
- Nguồn distinct: {"slots": 1, "tasks": 0, "total": 1, "direct": 0, "legacy": 0}

### Giám đốc Marketing (role-v2-mkt-director)
- Giữ: leave.recall, leave.view_own, leave.create, att.create
- Bỏ đề xuất: order.marketing_design.take, order.marketing_design.assign, order.open_delivery, order.marketing_design.complete, order.marketing_design.deliver, order.marketing_design.submit, order.marketing_design.approve, order.marketing_design.update_draft, order.marketing_design.view_all, order.marketing_design.edit, order.create, order.marketing_design.edit_reviewer, order.update_draft, order.marketing_design.request_changes, order.take, order.marketing_design.send_request, order.marketing_design.view, order.marketing_design.create, order.view_mine, order.history, order.deliver, order.marketing_design.report_view, order.resubmit, order.marketing_design.cancel, order.view, order.marketing_design.resubmit, order.submit
- Thêm đề xuất chưa áp dụng: att.view_own, leave.view_unit
- Chờ kiểm chứng/không đưa vào proposal: task.view, task.view_mine, task.accept, task.start, task.update_result, task.submit_completion, task.resubmit_completion, task.view_history, task.add_note
- Người nhận: Admin Hệ Thống
- Nguồn distinct: {"slots": 1, "tasks": 0, "total": 1, "direct": 0, "legacy": 0}

### Trưởng phòng Marketing (role-v2-mkt-head)
- Giữ: leave.view_unit, leave.recall, leave.view_own, leave.create, att.create
- Bỏ đề xuất: order.marketing_design.take, order.marketing_design.assign, order.open_delivery, order.marketing_design.complete, order.marketing_design.deliver, order.marketing_design.submit, order.marketing_design.approve, order.marketing_design.update_draft, order.marketing_design.view_all, order.marketing_design.edit, order.create, order.marketing_design.edit_reviewer, order.update_draft, order.marketing_design.request_changes, order.take, order.marketing_design.send_request, order.marketing_design.view, order.marketing_design.create, order.view_mine, order.history, order.deliver, order.marketing_design.report_view, order.resubmit, order.marketing_design.cancel, order.view, order.marketing_design.resubmit, order.submit
- Thêm đề xuất chưa áp dụng: att.view_own
- Chờ kiểm chứng/không đưa vào proposal: task.view, task.view_mine, task.accept, task.start, task.update_result, task.submit_completion, task.resubmit_completion, task.view_history, task.add_note
- Người nhận: 0
- Nguồn distinct: {}

### Nhân viên Marketing (role-v2-mkt-staff)
- Giữ: kpi.view_own, leave.recall, leave.view_own, att.view_own, leave.create, overview.own_only, att.create, overview.view
- Bỏ đề xuất: order.request_changes, order.open_delivery, order.create, order.cancel, order.complete, order.view_mine, order.history, order.approve, att.witness, order.send_request, order.view, order.assign, order.edit, settings.view
- Thêm đề xuất chưa áp dụng: không
- Chờ kiểm chứng/không đưa vào proposal: task.view, task.view_mine, task.accept, task.start, task.update_result, task.submit_completion, task.resubmit_completion, task.view_history, task.add_note
- Người nhận: Nguyễn Thị Mai Loan, Trần Thị Bích Ngọc, Lê Minh Ngọc, Trần Thị Julia
- Nguồn distinct: {"slots": 4, "tasks": 0, "total": 4, "direct": 0, "legacy": 0}

### Hành chính Nhân sự (role-v2-hr)
- Giữ: leave.approve, leave.recall, att.view_all, leave.view_own, leave.report, leave.view_assigned, att.view_own, att.reconcile, leave.create, att.create, att.report
- Bỏ đề xuất: kpi.view_own, leave.cancel_handle, leave.reassign, leave.settings, att.manage, leave.edit_own, leave.view_all, leave.edit_others, leave.create_for, att.edit_own, overview.own_only, att.witness, overview.view, leave.exception, att.settings, settings.view
- Thêm đề xuất chưa áp dụng: không
- Chờ kiểm chứng/không đưa vào proposal: không
- Người nhận: 0
- Nguồn distinct: {}

### Đóng hàng (role-v2-packing)
- Giữ: ot.stage_update, leave.view_own, att.view_own, leave.create, ot.reschedule_reply, att.create, ot.task_view, ot.accept, ot.view_own, ot.task_update
- Bỏ đề xuất: không
- Thêm đề xuất chưa áp dụng: leave.recall
- Chờ kiểm chứng/không đưa vào proposal: không
- Người nhận: 0
- Nguồn distinct: {}

### Giao vận (role-v2-delivery)
- Giữ: ot.stage_update, leave.view_own, att.view_own, leave.create, ot.reschedule_reply, att.create, ot.task_view, ot.accept, ot.view_own, ot.task_update
- Bỏ đề xuất: không
- Thêm đề xuất chưa áp dụng: leave.recall
- Chờ kiểm chứng/không đưa vào proposal: không
- Người nhận: 0
- Nguồn distinct: {}

### Thu mua (role-v2-purchasing)
- Giữ: leave.recall, oq.accept, oq.view_own, leave.view_own, oq.reply_progress, att.view_own, leave.create, ot.reschedule_reply, ot.reschedule_propose, att.create, oq.reply_price, ot.task_view, ot.view_own, oq.report_own, ot.task_update
- Bỏ đề xuất: att.witness, oq.create
- Thêm đề xuất chưa áp dụng: không
- Chờ kiểm chứng/không đưa vào proposal: không
- Người nhận: Nguyễn Thị Hằng
- Nguồn distinct: {"slots": 1, "tasks": 0, "total": 1, "direct": 0, "legacy": 0}

### Nhân viên Cung ứng (role-v2-supply-chain)
- Giữ: oq.accept, oq.reply_progress, leave.create, att.create, oq.reply_price, oq.report_own
- Bỏ đề xuất: oq.create, oq.manage
- Thêm đề xuất chưa áp dụng: att.view_own, leave.view_own, leave.recall
- Chờ kiểm chứng/không đưa vào proposal: oq.view_own, ot.view_own, ot.task_view, ot.task_update, ot.reschedule_reply
- Người nhận: 0
- Nguồn distinct: {}

### Quản lý Mua hàng & Giao vận (role-v2-proc-head)
- Giữ: leave.view_unit, leave.recall, oq.accept, oq.view_own, leave.view_own, oq.reply_progress, att.view_own, leave.create, ot.reschedule_reply, att.create, oq.reply_price, ot.task_view, ot.view_own, oq.report_own, ot.task_update
- Bỏ đề xuất: oq.report_all, ot.view_all, ot.create, oq.view_all, ot.report, att.witness, ot.supplier, oq.create, ot.manage, ot.assign, oq.manage
- Thêm đề xuất chưa áp dụng: ot.view_unit
- Chờ kiểm chứng/không đưa vào proposal: không
- Người nhận: 0
- Nguồn distinct: {}

### Kế toán (role-v2-accountant)
- Giữ: finance.incoming.view, finance.incoming.manual_view, leave.create, att.create, finance.incoming.manual_create
- Bỏ đề xuất: finance.incoming.manage, finance.incoming.claim, finance.incoming.remind, finance.incoming.reconcile, finance.incoming.manual_manage
- Thêm đề xuất chưa áp dụng: att.view_own, leave.view_own, leave.recall
- Chờ kiểm chứng/không đưa vào proposal: không
- Người nhận: 0
- Nguồn distinct: {}

### Kế toán trưởng (role-v2-account-chief)
- Giữ: finance.incoming.view, leave.recall, finance.incoming.view_totals, finance.incoming.manual_view, leave.view_own, att.view_own, leave.create, att.create, finance.incoming.manual_create
- Bỏ đề xuất: finance.incoming.manage, finance.incoming.claim, att.witness, finance.incoming.remind, finance.incoming.reconcile, finance.incoming.manual_manage
- Thêm đề xuất chưa áp dụng: không
- Chờ kiểm chứng/không đưa vào proposal: không
- Người nhận: Mưa Bụi
- Nguồn distinct: {"slots": 1, "tasks": 0, "total": 1, "direct": 0, "legacy": 0}

### Kế toán kho (role-v2-account-stock)
- Giữ: finance.incoming.view, leave.recall, finance.incoming.manual_view, leave.view_own, att.view_own, leave.create, att.create
- Bỏ đề xuất: finance.incoming.claim, att.witness, finance.incoming.manual_create
- Thêm đề xuất chưa áp dụng: không
- Chờ kiểm chứng/không đưa vào proposal: không
- Người nhận: 0
- Nguồn distinct: {}

### Giám đốc Điều hành (role-v2-executive)
- Giữ: leave.view_own, leave.create, att.create
- Bỏ đề xuất: kpi.view_own, overview.view, settings.view
- Thêm đề xuất chưa áp dụng: att.view_own, leave.recall
- Chờ kiểm chứng/không đưa vào proposal: không
- Người nhận: 0
- Nguồn distinct: {}

### Phó Giám đốc Điều hành (role-v2-deputy-exec)
- Giữ: leave.view_own, leave.create, att.create
- Bỏ đề xuất: kpi.view_own, overview.view, settings.view
- Thêm đề xuất chưa áp dụng: att.view_own, leave.recall
- Chờ kiểm chứng/không đưa vào proposal: không
- Người nhận: Admin Hệ Thống
- Nguồn distinct: {"slots": 1, "tasks": 0, "total": 1, "direct": 0, "legacy": 0}

### Content Web (role-v2-task-content-web)
- Giữ: task.resubmit_completion, web.post_write_start, web.post_submit, task.submit_completion, web.view_web_draft_revision_note, web.outline_start, web.resubmit_web_draft_review, web.edit_web_draft_url, web.content_note, web.start_web_draft_layout, task.view, web.outline_resubmit, web.content_view, task.update_result, web.open_detail, web.content_view_mine, web.outline_submit, task.view_mine, web.view_web_draft_url, web.submit_web_draft_review, web.view, task.accept, task.start, web.content_history, task.add_note, web.post_resubmit, task.view_history
- Bỏ đề xuất: kpi.view_own, social.post_start, order.open_delivery, social.post_resubmit, leave.recall, social.post_view, social.growth_create, web.keyword_view, web.index_view, order.create, overview.alerts, social.post_submit, att.view_own, social.view, social.growth_edit, order.view_mine, social.post_view_mine, brand.view, order.history, leave.create, social.growth_view, overview.own_only, att.create, web.open_published_url, social.post_edit, overview.view, order.view, task.update_status, social.post_history, settings.view, web.keyword_open_sheet, social.view_mine, social.post_create, social.growth_open
- Thêm đề xuất chưa áp dụng: không
- Chờ kiểm chứng/không đưa vào proposal: không
- Người nhận: Nguyễn Thị Mai Loan, Lê Minh Ngọc
- Nguồn distinct: {"slots": 0, "tasks": 2, "total": 2, "direct": 0, "legacy": 0}

### SEO (role-v2-task-seo)
- Giữ: task.resubmit_completion, task.submit_completion, web.keyword_view, web.index_view, task.view, task.update_result, web.open_detail, task.view_mine, web.open_published_url, web.view, task.start, task.add_note, task.view_history, web.keyword_open_sheet
- Bỏ đề xuất: kpi.view_own, web.view_web_draft_revision_note, order.create, overview.alerts, task.view_created_by_me, web.content_view, task.create, brand.view, order.history, leave.create, overview.own_only, att.create, overview.view, web.view_web_draft_url, order.view, web.content_history
- Thêm đề xuất chưa áp dụng: không
- Chờ kiểm chứng/không đưa vào proposal: task.accept
- Người nhận: 0
- Nguồn distinct: {}

### Local SEO (role-v2-task-local-seo)
- Giữ: task.resubmit_completion, task.submit_completion, local.photo, local.post_edit, local.review, local.products, task.view, local.review_reply, task.update_result, local.post_create, local.view, task.view_mine, task.start, task.add_note, task.view_history, local.view_mine
- Bỏ đề xuất: local.growth_edit, kpi.view_own, order.open_delivery, local.growth_create, order.create, overview.alerts, local.edit, local.growth_view, local.review_status, order.view_mine, brand.view, order.history, leave.create, overview.own_only, att.create, overview.view, order.view, local.create
- Thêm đề xuất chưa áp dụng: không
- Chờ kiểm chứng/không đưa vào proposal: task.accept
- Người nhận: 0
- Nguồn distinct: {}

### Social (role-v2-task-social)
- Giữ: social.post_start, task.resubmit_completion, social.post_resubmit, task.submit_completion, social.post_view, social.post_submit, social.view, task.view, social.post_view_mine, task.update_result, task.view_mine, social.post_edit, task.start, social.post_history, task.add_note, task.view_history, social.post_create
- Bỏ đề xuất: kpi.view_own, order.open_delivery, social.growth_create, order.create, overview.alerts, social.growth_edit, order.view_mine, brand.view, order.history, leave.create, social.growth_view, overview.own_only, att.create, overview.view, order.view, settings.view, social.view_mine, social.growth_open
- Thêm đề xuất chưa áp dụng: không
- Chờ kiểm chứng/không đưa vào proposal: task.accept
- Người nhận: 0
- Nguồn distinct: {}

### Video (role-v2-task-video)
- Giữ: video.deliver, video.script_resubmit, video.submit, task.resubmit_completion, video.edit_cut, video.script_start, video.move_shooting, task.submit_completion, video.view, video.footage, video.history, task.view, video.resubmit, task.update_result, video.view_mine, video.create, task.view_mine, video.script_submit, task.accept, video.move_editing, task.start, task.add_note, task.view_history
- Bỏ đề xuất: kpi.view_own, social.post_resubmit, leave.recall, social.post_view, social.growth_create, order.create, video.create_design_order, overview.alerts, social.post_submit, att.view_own, social.view, social.growth_edit, order.view_mine, brand.view, order.history, leave.create, social.growth_view, overview.own_only, local.view, att.witness, att.create, social.post_edit, overview.view, order.view, web.view, task.update_status, social.post_history, settings.view, social.view_mine, social.post_create, social.growth_open
- Thêm đề xuất chưa áp dụng: không
- Chờ kiểm chứng/không đưa vào proposal: không
- Người nhận: Trần Thị Bích Ngọc
- Nguồn distinct: {"slots": 0, "tasks": 1, "total": 1, "direct": 0, "legacy": 0}

## Nguồn khác của quyền bị bỏ — không đồng nghĩa mất quyền cuối cùng
Server explain không trả role_id cho mọi rules. Bảng sau dùng nguồn kind+name, chỉ là đối chiếu bảo thủ; không dùng để áp quyền. Khi approve cần snapshot giả lập toàn tập nguồn và DENY, không suy luận từ tên.

Ngọc live: web.content_view=True, order.approve=True, order.cancel=True, social.post_create=True, settings.view=True, leave.approve=False. NV Marketing 22→8 (bỏ 14); Content 61→27 (bỏ 34). Content giữ Web + Task cá nhân; Social/Order/settings không còn mặc định.

## Ô vị trí và ngoại lệ
- 23 slots kiểm tra: không có hơn một holder hiệu lực; mỗi slot có role_id FK, khoảng chồng được chặn bởi EXCLUDE/GiST. Không chuyển hoặc kết thúc bổ nhiệm. Constraints nguyên văn trong associations-baseline.json.
- 2/25 titled hiện hành chưa gắn: Vũ Văn Đức (16 quyền Viewer legacy); Nguyễn Quỳnh Anh (leave.export). Không đoán Role/đơn vị.
- Ngọc vẫn cần Owner quyết trách nhiệm duyệt. **Truy vấn mới 14:42 UTC thấy 0 pending**, 9 đơn lịch sử (recalled/cancelled/approved); hai đơn được nêu trước không còn pending trong lần đọc này. Không tự quyết ai đã xử lý, không đổi người duyệt/cấp leave.approve.
- Ba quyết định cần chủ: (1) quyền cần giữ cho Đức; (2) leave.export của Quỳnh Anh; (3) Ngọc có tiếp tục trách nhiệm duyệt hay dùng người duyệt khác theo quy trình.
- Double-source nhiệm vụ có thể gồm marketing_appointment và marketing_specialty; eligibility tại mỗi nguồn, union distinct, không nhân đôi quyền. Before snapshot lưu config và specialties. Không gán nhiệm vụ qua slots/user_roles.

## Guard, backup, rollback và giới hạn
- docs/pending/role_v2_reduction_guard.sql **PENDING, không gọi migration tool**, không sửa 0371. Dùng chính writer role_catalog_change: guard pending approver ở preview và apply, khóa leave_requests tránh race, protected Admin/Super Admin, actor/expiry/fingerprint/audit hiện có giữ nguyên.
- UI giảm quyền khóa apply trong đợt nghiệm thu. 25 server previews được lưu, expires_at ngắn hạn; phải tạo preview mới trước apply. Preview chỉ tạo bản ghi kiểm toán, không thay app_roles/slots/specialties/đơn.
- Baseline 58 Role + associations, effective 26 người và định nghĩa SQL có SHA256SUMS. rollback-functions.sql phục hồi writer; rollback-role-proposals.json chuẩn bị exact before proposals qua audited edit, KHÔNG UPDATE/CASCADE.
- **Rollback quyền chưa READY:** editor policy từ chối thêm lại một số sensitive keys đã bỏ, kể cả snapshot. Trước live cần cơ chế restore exact-before actor-bound/fingerprint-bound được kiểm thử, không bật quyền rộng tùy ý. Không giảm live khi restore đó chưa hoàn thiện.
- Backend editor policy chỉ 42 key: task.* cá nhân chưa có trong policy; Giám đốc KD vẫn chưa thêm được CRM/lead/own quote. Preset liệt kê trách nhiệm cần có nhưng đánh dấu chờ; không giả vờ đã hoạt động. Cần kiểm chứng native CRM/3K/Signal source scopes và đưa vào policy qua bản cập nhật riêng, không regrant legacy.

## Kiểm thử
- 200/200 tests, 18 files: SQL guarded preview/apply stale baseline, pending trách nhiệm trước/sau preview, audited reduction/restore quyền an toàn, system guards; Marketing eligibility, multiple-source, own/unit/isolation, additive cá nhân; leave/finance/order quotes/Signals 0371, CRM/3K/catalog/mapping regression.
- 25/25 authenticated server edit previews thành công. Desktop và iPad 820px: ma trận và confirm rõ bỏ/thêm/4 người; giảm quyền disabled, không tràn ngang. Build harness OK.
- Chưa nghiệm thu employee own/team/all live sau giảm vì KHÔNG apply; fixture không thay nghiệm thu đó. Chưa Publish/xóa legacy/cutover.
- CRM/3K/Organization smoke authenticated Preview: đúng đường dẫn, không alert/pageerror trong cửa sổ 10 giây mỗi trang; CRM tài khoản kiểm thử không có lịch chăm sóc. Đây không phải nghiệm thu nghiệp vụ nhân viên sau giảm quyền.
- Read-back cuối 14:48 UTC: 58 Role, 25 V2, 23 ô, 23 titled bound, 86 lịch sử; latest_role_write vẫn 14:22:55 UTC (trước lượt này). Không có thay đổi quyền/Role/bổ nhiệm live trong lượt nghiệm thu.
