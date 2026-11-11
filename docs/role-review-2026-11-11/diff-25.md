# Diff 25 Role — chỉ bản nháp

Đọc lúc 2026-11-11T12:55:14.458746+00:00; chưa áp dụng. Người nhận là số distinct từ kho Role, không đồng nghĩa mọi permission đã hiệu lực. Không tự seed sau chỉnh sửa.

| Role | Trước → sau | Giữ / bỏ / thêm | Người | Nguồn ô / task / trực tiếp / legacy |
|---|---:|---:|---:|---|
| Content Web | 90 → 7 | 7 / 83 / 0 | 4 | 0 / 4 / 0 / 0 |
| Giám Đốc Kinh Doanh | 4 → 6 | 1 / 3 / 5 | 0 | 0 / 0 / 0 / 0 |
| Giám đốc Marketing | 31 → 6 | 3 / 28 / 3 | 1 | 0 / 0 / 0 / 1 |
| Hành Chính Nhân Sự | 41 → 6 | 4 / 37 / 2 | 1 | 0 / 0 / 0 / 1 |
| Kế toán kho | 10 → 4 | 4 / 6 / 0 | 0 | 0 / 0 / 0 / 0 |
| Kế toán trưởng | 15 → 6 | 4 / 11 / 2 | 1 | 0 / 0 / 0 / 1 |
| Kinh doanh Đơn Hàng | 29 → 4 | 4 / 25 / 0 | 0 | 0 / 0 / 0 / 0 |
| Kinh Doanh Phân Phối | 12 → 4 | 3 / 9 / 1 | 0 | 0 / 0 / 0 / 0 |
| Lead Kinh Doanh ĐH | 44 → 6 | 4 / 40 / 2 | 0 | 0 / 0 / 0 / 0 |
| Local SEO | 46 → 4 | 4 / 42 / 0 | 2 | 0 / 2 / 0 / 0 |
| Nhân sự mới (bảo vệ) | 4 → 4 | 4 / 0 / 0 | 0 | 0 / 0 / 0 / 0 |
| Nhân viên Đóng hàng (bảo vệ) | 10 → 10 | 10 / 0 / 0 | 0 | 0 / 0 / 0 / 0 |
| Nhân viên Kinh doanh | 21 → 4 | 4 / 17 / 0 | 10 | 0 / 0 / 0 / 10 |
| Nhân viên Marketing | 10 → 4 | 4 / 6 / 0 | 4 | 0 / 0 / 0 / 4 |
| Nhân viên Thiết kế | 15 → 10 | 9 / 6 / 1 | 2 | 0 / 2 / 0 / 1 |
| Quản lý Marketing | 32 → 6 | 4 / 28 / 2 | 0 | 0 / 0 / 0 / 0 |
| Quản lý Mua hàng & Giao vận | 28 → 6 | 5 / 23 / 1 | 0 | 0 / 0 / 0 / 0 |
| Quản lý Thiết kế | 25 → 12 | 10 / 15 / 2 | 0 | 0 / 0 / 0 / 0 |
| SEO | 95 → 3 | 3 / 92 / 0 | 3 | 0 / 3 / 0 / 0 |
| Showroom | 18 → 4 | 4 / 14 / 0 | 0 | 0 / 0 / 0 / 0 |
| Social | 49 → 7 | 7 / 42 / 0 | 3 | 0 / 3 / 0 / 0 |
| Thu mua | 17 → 4 | 4 / 13 / 0 | 1 | 0 / 0 / 0 / 1 |
| Trưởng phòng Kinh doanh | 36 → 6 | 6 / 30 / 0 | 2 | 0 / 0 / 0 / 2 |
| Video | 82 → 6 | 6 / 76 / 0 | 2 | 0 / 2 / 0 / 0 |
| Viewer / Ban Giám Đốc | 60 → 6 | 2 / 58 / 4 | 3 | 0 / 0 / 0 / 3 |

## Content Web (role-content-web)
Giữ: web.view, web.content_view, web.content_view_mine, web.outline_start, web.outline_submit, web.post_write_start, web.post_submit
Bỏ: overview.view, overview.alerts, overview.own_only, task.view, task.view_mine, task.start, task.update_result, task.submit_completion, task.resubmit_completion, task.view_history, task.add_note, brand.view, web.open_detail, web.keyword_view, web.keyword_open_sheet, web.content_history, web.content_note, web.outline_resubmit, web.post_resubmit, web.move_pending_publish, web.publish, web.view_web_draft_url, web.edit_web_draft_url, web.start_web_draft_layout, web.submit_web_draft_review, web.resubmit_web_draft_review, web.view_web_draft_revision_note, web.index_view, web.open_published_url, task.accept, task.update_status, brand.view_all, social.view, social.view_mine, social.view_all, social.post_view, social.post_view_all, social.post_view_mine, social.post_create, social.post_edit, social.post_delete, social.post_assign, social.post_submit, social.post_start, social.post_resubmit, social.post_complete, social.post_confirm_published, social.post_cancel, social.post_restore, social.post_history, social.growth_view, social.growth_create, social.growth_edit, social.growth_delete, social.growth_update, social.growth_open, social.report, overview.staff_summary, order.view, order.view_mine, order.create, order.edit, order.send_request, order.assign, order.approve, order.request_changes, order.complete, order.cancel, order.history, order.open_delivery, web.content_edit_brief, web.complete, social.post_force_status, settings.view, leave.view_own, leave.create, leave.recall, leave.report, att.create, att.view_own, kpi.view_own, leave.view_assigned, leave.approve
Thêm: —
Chờ kiểm chứng: —

## Giám Đốc Kinh Doanh (role-xwbmhg3b)
Giữ: leave.create
Bỏ: leave.create_for, leave.view_assigned, leave.approve
Thêm: leave.view_own, att.create, att.view_own, leave.view_unit, ot.view_unit
Chờ kiểm chứng: —

## Giám đốc Marketing (role-standard-mkt-director)
Giữ: leave.view_own, leave.create, att.create
Bỏ: order.view, order.view_mine, order.create, order.take, order.update_draft, order.submit, order.resubmit, order.deliver, order.history, order.open_delivery, leave.recall, order.marketing_design.view, order.marketing_design.view_all, order.marketing_design.create, order.marketing_design.send_request, order.marketing_design.submit, order.marketing_design.take, order.marketing_design.update_draft, order.marketing_design.resubmit, order.marketing_design.deliver, order.marketing_design.approve, order.marketing_design.assign, order.marketing_design.edit, order.marketing_design.complete, order.marketing_design.cancel, order.marketing_design.edit_reviewer, order.marketing_design.report_view, order.marketing_design.request_changes
Thêm: att.view_own, leave.view_unit, ot.view_unit
Chờ kiểm chứng: —

## Hành Chính Nhân Sự (role-wupj68a6)
Giữ: att.create, att.view_own, leave.create, leave.view_own
Bỏ: att.edit_own, att.manage, att.reconcile, att.report, att.settings, att.view_all, att.witness, kpi.view_own, leave.approve, leave.cancel_handle, leave.create_for, leave.edit_others, leave.edit_own, leave.exception, leave.export, leave.reassign, leave.recall, leave.report, leave.settings, leave.view_all, leave.view_assigned, settings.account_approve, settings.account_lock, settings.account_reject, settings.activity_log, settings.assign_role, settings.login_history, settings.people, settings.system_view, settings.user_create, settings.user_edit, settings.user_reset_password, settings.user_view, settings.view, settings.view_presence, overview.view, overview.own_only
Thêm: leave.view_unit, ot.view_unit
Chờ kiểm chứng: —

## Kế toán kho (role-standard-account-stock)
Giữ: leave.create, leave.view_own, att.create, att.view_own
Bỏ: leave.recall, att.witness, finance.incoming.view, finance.incoming.claim, finance.incoming.manual_view, finance.incoming.manual_create
Thêm: —
Chờ kiểm chứng: —

## Kế toán trưởng (role-standard-account-chief)
Giữ: leave.create, leave.view_own, att.create, att.view_own
Bỏ: leave.recall, att.witness, finance.incoming.view, finance.incoming.view_totals, finance.incoming.claim, finance.incoming.reconcile, finance.incoming.manual_view, finance.incoming.manual_create, finance.incoming.manual_manage, finance.incoming.manage, finance.incoming.remind
Thêm: leave.view_unit, ot.view_unit
Chờ kiểm chứng: —

## Kinh doanh Đơn Hàng (role-kinh-doanh)
Giữ: att.create, att.view_own, leave.create, leave.view_own
Bỏ: att.witness, biz.goal_submit, biz.plan_submit, biz.report_submit, biz.view_own, brand.view, brand.view_all, finance.incoming.claim, finance.incoming.manual_view, finance.incoming.view, kpi.view_own, leave.recall, leave.view_assigned, oq.accept, oq.create, oq.reply_price, oq.reply_progress, oq.report_own, oq.view_own, overview.view, settings.user_view, settings.view, signal.reassign, signal.report, signal.sale
Thêm: —
Chờ kiểm chứng: —

## Kinh Doanh Phân Phối (role-9h328b84)
Giữ: att.create, leave.create, leave.view_own
Bỏ: biz.goal_submit, biz.plan_submit, biz.report_submit, biz.view_own, kpi.view_own, leave.approve, leave.recall, signal.report, signal.sale
Thêm: att.view_own
Chờ kiểm chứng: —

## Lead Kinh Doanh ĐH (role-u0fzsvsp)
Giữ: att.create, att.view_own, leave.create, leave.view_own
Bỏ: att.edit_own, att.witness, biz.goal_approve, biz.goal_submit, biz.plan_approve, biz.plan_submit, biz.report_approve, biz.report_submit, biz.view_dept, biz.view_own, brand.view, brand.view_all, finance.incoming.claim, finance.incoming.view, kpi.view_own, leave.approve, leave.cancel_handle, leave.edit_own, leave.exception, leave.export, leave.reassign, leave.recall, leave.report, leave.view_all, leave.view_assigned, oq.accept, oq.create, oq.manage, oq.reply_price, oq.reply_progress, oq.report_own, oq.view_all, oq.view_own, overview.view, settings.view, signal.reassign, signal.report, signal.sale, signal.view_all, biz.plan_request_revision
Thêm: leave.view_unit, ot.view_unit
Chờ kiểm chứng: —

## Local SEO (role-local-seo)
Giữ: local.view, local.view_mine, local.post_create, local.post_edit
Bỏ: overview.view, overview.alerts, overview.own_only, task.view, task.view_mine, task.start, task.update_result, task.submit_completion, task.resubmit_completion, task.view_history, task.add_note, brand.view, local.create, local.edit, local.photo, local.products, local.review, local.review_reply, local.review_status, local.growth_view, local.growth_create, local.growth_edit, local.report, order.view, order.view_mine, order.view_all, order.create, order.edit, order.send_request, order.assign, order.approve, order.request_changes, order.cancel, order.complete, order.open_delivery, order.history, kpi.view_own, leave.create, leave.create_for, leave.view_assigned, leave.approve, att.create
Thêm: —
Chờ kiểm chứng: —

## Nhân sự mới (role-nhan-su-moi)
Giữ: leave.create, leave.view_own, att.create, att.view_own
Bỏ: —
Thêm: —
Chờ kiểm chứng: —

## Nhân viên Đóng hàng (role-dong-hang)
Giữ: leave.create, leave.view_own, att.create, att.view_own, ot.view_own, ot.task_view, ot.task_update, ot.stage_update, ot.accept, ot.reschedule_reply
Bỏ: —
Thêm: —
Chờ kiểm chứng: —

## Nhân viên Kinh doanh (role-standard-sales-staff)
Giữ: leave.create, leave.view_own, att.create, att.view_own
Bỏ: leave.recall, att.witness, kpi.view_own, overview.view, settings.view, signal.sale, signal.report, biz.crm_use, oq.create, oq.accept, oq.reply_price, oq.reply_progress, oq.report_own, oq.view_own, finance.incoming.view, finance.incoming.claim, finance.incoming.manual_view
Thêm: —
Chờ kiểm chứng: —

## Nhân viên Marketing (role-standard-mkt-staff)
Giữ: leave.create, leave.view_own, att.create, att.view_own
Bỏ: leave.recall, att.witness, kpi.view_own, overview.view, overview.own_only, settings.view
Thêm: —
Chờ kiểm chứng: —

## Nhân viên Thiết kế (role-standard-design-staff)
Giữ: order.view, order.view_mine, order.take, order.update_draft, order.submit, order.history, att.create, leave.create, leave.view_own
Bỏ: order.resubmit, order.deliver, order.open_delivery, order.create, leave.recall, att.witness
Thêm: att.view_own
Chờ kiểm chứng: —

## Quản lý Marketing (role-standard-mkt-head)
Giữ: leave.view_own, leave.create, att.create, leave.view_unit
Bỏ: order.view, order.view_mine, order.create, order.take, order.update_draft, order.submit, order.resubmit, order.deliver, order.history, order.open_delivery, leave.recall, order.marketing_design.view, order.marketing_design.view_all, order.marketing_design.create, order.marketing_design.send_request, order.marketing_design.submit, order.marketing_design.take, order.marketing_design.update_draft, order.marketing_design.resubmit, order.marketing_design.deliver, order.marketing_design.approve, order.marketing_design.assign, order.marketing_design.edit, order.marketing_design.complete, order.marketing_design.cancel, order.marketing_design.edit_reviewer, order.marketing_design.report_view, order.marketing_design.request_changes
Thêm: att.view_own, ot.view_unit
Chờ kiểm chứng: —

## Quản lý Mua hàng & Giao vận (role-standard-proc-head)
Giữ: leave.create, leave.view_own, att.create, att.view_own, leave.view_unit
Bỏ: leave.recall, att.witness, oq.create, oq.accept, oq.reply_price, oq.reply_progress, oq.report_own, oq.view_own, oq.view_all, oq.manage, oq.report_all, oq.report_export, ot.view_own, ot.view_all, ot.task_view, ot.task_update, ot.create, ot.assign, ot.manage, ot.report, ot.report_export, ot.supplier, ot.reschedule_reply
Thêm: ot.view_unit
Chờ kiểm chứng: —

## Quản lý Thiết kế (role-standard-design-head)
Giữ: order.view, order.view_mine, order.take, order.update_draft, order.submit, order.history, att.create, leave.create, leave.view_own, leave.view_unit
Bỏ: order.resubmit, order.deliver, order.open_delivery, order.create, leave.recall, att.witness, order.approve, order.assign, order.edit, order.complete, order.cancel, order.edit_reviewer, order.report_view, order.request_changes, order.view_all
Thêm: att.view_own, ot.view_unit
Chờ kiểm chứng: —

## SEO (role-seo)
Giữ: web.view, web.keyword_view, web.keyword_open_sheet
Bỏ: overview.view, overview.alerts, overview.own_only, task.view, task.view_mine, task.view_created_by_me, task.create, task.edit, task.start, task.update_result, task.submit_completion, task.resubmit_completion, task.view_history, task.add_note, brand.view, web.view_all, web.open_detail, web.manage_info, web.tech_view, web.tech_check, web.tech_edit_desc, web.entity_view, web.entity_create, web.entity_edit, web.entity_delete, web.entity_open_link, web.entity_view_account, web.keyword_topic_create, web.keyword_topic_edit, web.keyword_topic_delete, web.keyword_manage_sheet, web.content_view, web.content_view_all, web.content_history, web.outline_approve, web.outline_reject, web.view_web_draft_url, web.approve_web_draft, web.request_web_draft_revision, web.view_web_draft_revision_note, web.index_view, web.update_index, web.update_share, web.update_share_date, web.select_shared_entity, web.edit_published_url, web.open_published_url, web.backlink_view, web.backlink_create, web.backlink_edit, web.backlink_delete, web.backlink_status, web.backlink_open, web.backlink_cost, web.checktop_view, web.checktop_primary, web.checktop_secondary, web.checktop_kw_create, web.checktop_kw_edit, web.checktop_kw_delete, web.checktop_open_url, web.checktop_filter_topic, web.reopt_view, web.reopt_create, web.reopt_edit, web.reopt_assign, web.reopt_status, web.growth_view, web.growth_create, web.growth_edit, web.growth_open, web.report_view, web.report_alerts, web.report_action, web.report_by_topic, web.report_by_staff, order.view, order.view_all, order.create, order.send_request, order.assign, order.approve, order.request_changes, order.complete, order.cancel, order.history, kpi.view_own, leave.create, leave.create_for, leave.view_assigned, leave.approve, att.create
Thêm: —
Chờ kiểm chứng: —

## Showroom (role-g8qc3q2s)
Giữ: att.create, att.view_own, leave.create, leave.view_own
Bỏ: att.edit_own, att.report, att.witness, leave.approve, leave.edit_own, leave.recall, leave.report, leave.view_assigned, overview.own_only, overview.view, signal.sale, biz.view_own, biz.plan_submit, biz.goal_submit
Thêm: —
Chờ kiểm chứng: —

## Social (role-social)
Giữ: social.view, social.post_view, social.post_view_mine, social.post_create, social.post_edit, social.post_start, social.post_submit
Bỏ: overview.view, overview.alerts, overview.own_only, task.view, task.view_mine, task.start, task.update_result, task.submit_completion, task.resubmit_completion, task.view_history, task.add_note, brand.view, social.view_mine, social.manage_info, social.post_resubmit, social.post_move_pending_publish, social.post_confirm_published, social.post_complete, social.post_history, social.growth_view, social.growth_create, social.growth_edit, social.growth_update, social.growth_open, order.view, order.view_mine, order.create, order.send_request, order.approve, order.request_changes, order.complete, order.assign, order.cancel, order.history, order.open_delivery, settings.view, kpi.view_own, leave.create, leave.create_for, leave.view_assigned, leave.approve, att.create
Thêm: —
Chờ kiểm chứng: —

## Thu mua (role-standard-buyer)
Giữ: leave.create, leave.view_own, att.create, att.view_own
Bỏ: leave.recall, att.witness, oq.create, oq.accept, oq.reply_price, oq.reply_progress, oq.report_own, oq.view_own, ot.view_own, ot.task_view, ot.task_update, ot.reschedule_propose, ot.reschedule_reply
Thêm: —
Chờ kiểm chứng: —

## Trưởng phòng Kinh doanh (role-standard-sales-head)
Giữ: leave.create, leave.view_own, att.create, att.view_own, ot.view_unit, leave.view_unit
Bỏ: leave.recall, att.witness, kpi.view_own, overview.view, settings.view, signal.sale, signal.report, signal.view_all, signal.assign, signal.reassign, biz.crm_use, biz.crm_view_scope, biz.crm_edit_other, biz.crm_transfer, biz.crm_export, oq.create, oq.accept, oq.reply_price, oq.reply_progress, oq.report_own, oq.view_own, oq.view_all, oq.manage, oq.report_all, oq.report_export, finance.incoming.view, finance.incoming.view_totals, finance.incoming.claim, finance.incoming.manual_view, finance.incoming.view_unit
Thêm: —
Chờ kiểm chứng: —

## Video (role-video)
Giữ: video.view, video.view_mine, video.script_start, video.script_submit, video.submit, video.create
Bỏ: overview.view, overview.alerts, overview.own_only, task.view, task.view_mine, task.start, task.update_result, task.submit_completion, task.resubmit_completion, task.view_history, task.add_note, brand.view, video.edit, video.script_resubmit, video.move_shooting, video.footage, video.move_editing, video.edit_cut, video.resubmit, video.deliver, video.history, video.create_design_order, task.accept, task.update_status, brand.view_all, order.view, order.view_mine, order.create, order.send_request, order.assign, order.request_changes, order.complete, order.cancel, order.history, social.view, social.view_mine, social.post_view, social.post_view_all, social.post_create, social.post_edit, social.post_delete, social.post_submit, social.post_confirm_published, social.post_move_pending_publish, social.post_resubmit, social.post_complete, social.post_force_status, social.post_restore, social.post_cancel, social.post_history, social.growth_view, social.growth_create, social.growth_edit, social.growth_open, social.growth_update, social.report, local.view, local.view_all, video.assign, video.approve, video.force_status, video.confirm_published, web.view_all, web.view, video.cancel, settings.view, leave.view_own, leave.create, leave.recall, leave.report, att.create, att.view_own, att.witness, kpi.view_own, leave.view_assigned, leave.approve
Thêm: —
Chờ kiểm chứng: —

## Viewer / Ban Giám Đốc (role-viewer)
Giữ: att.create, leave.create
Bỏ: att.witness, biz.view_all, brand.view, brand.view_all, finance.incoming.reconcile, finance.incoming.remind, finance.incoming.view, finance.incoming.view_totals, kpi.view_own, leave.approve, leave.create_for, leave.view_all, leave.view_assigned, local.view, local.view_all, oq.report_all, oq.view_all, order.report_view, order.view, order.view_all, overview.alerts, overview.brand_summary, overview.module_summary, overview.staff_summary, overview.view, report.attention, report.attention_all, report.by_brand, report.by_module, report.by_staff, report.export, report.growth, report.view, settings.activity_log, settings.login_history, settings.user_view, settings.view, signal.report, signal.view_all, social.post_view, social.post_view_all, social.view, social.view_all, video.view, video.view_all, web.content_view, web.content_view_all, web.open_detail, web.view, web.view_all, biz.view_dept, biz.plan_request_revision, biz.plan_approve, biz.goal_approve, biz.approval_view, biz.report_approve, biz.dept_manage, biz.view_own
Thêm: leave.view_own, att.view_own, leave.view_unit, ot.view_unit
Chờ kiểm chứng: —

## Giới hạn quan trọng
Các Role Kinh doanh/Kế toán/Thu mua hiện chỉ được gợi ý nền cá nhân và xem đơn vị đã kiểm chứng. Không giả lập rằng bộ này đã thay thế CRM/3K/Tài chính/Hỏi giá. Owner cần giữ rõ các nghiệp vụ thiết yếu trước áp dụng; kiểm tra native gates theo nguồn là bắt buộc. Thiết kế giữ 6 tác vụ Order trong scope mình/được giao; Chụp ảnh không bị sửa liên kết.