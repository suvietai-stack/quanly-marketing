# K3 functions still using Biz

| Function | Dependencies |
|---|---|
| public.k3_can | biz_admin, biz_all_scope, biz_manager, biz_participant |
| public.k3_data_review_save | biz_admin |
| public.k3_day_scope_ok | biz_scope_ok |
| public.k3_deletable | biz_admin |
| public.k3_discipline_exclude | biz_admin |
| public.k3_discipline_read | biz_admin, biz_department_at, biz_participant, biz_scope_ok |
| public.k3_employee_review_read | biz_admin, biz_department_at, biz_scope_ok |
| public.k3_employee_review_team | biz_admin, biz_department_at, biz_participant, biz_scope_ok |
| public.k3_goal_list | biz_admin, biz_scope_ok |
| public.k3_goal_save | biz_admin, biz_department_at |
| public.k3_goal_visible | biz_admin, biz_scope_ok |
| public.k3_kpi_accept | biz_admin, biz_department_at, biz_scope_ok |
| public.k3_kpi_backup_create | biz_admin |
| public.k3_kpi_inventory | biz_admin |
| public.k3_kpi_result_read | biz_admin |
| public.k3_legacy_task_archive | biz_admin |
| public.k3_legacy_task_restore | biz_admin |
| public.k3_measured_period_read | biz_admin, biz_department_at, biz_scope_ok |
| public.k3_member_invite | biz_admin |
| public.k3_period_read | biz_department_at, biz_scope_ok |
| public.k3_period_summary_confirm | biz_department_at |
| public.k3_period_team_read | biz_department_at, biz_scope_ok |
| public.k3_plan_checkpoint_run | biz_participant |
| public.k3_purge_expired | biz_admin |
| public.k3_restore | biz_admin |
| public.k3_scope_ok | biz_all_scope, biz_scope_ok |
| public.k3_soft_delete | biz_admin |
| public.k3_task_delete | biz_admin |
| public.k3_team_read | biz_department_at, biz_scope_ok |
| public.k3_trash_list | biz_admin, biz_scope_ok |
| public.k3_user_day_read | biz_department_at, biz_scope_ok |
| private.k3_close_one | biz_department_at |
| private.k3_day_guard | biz_department_at |
| private.k3_day_obligated | biz_participant |
| private.k3_goal_manage_ok | biz_admin |
| private.k3_period_comment_scope | biz_department_at, biz_scope_ok |
| private.k3_plan_capture | biz_department_at |
| private.k3_plan_changed | biz_participant |
| private.k3_result_can_write | biz_admin |
| private.k3_result_detail_ok | biz_admin, biz_scope_ok |
| private.k3_result_eligible_range | biz_admin, biz_department_at, biz_scope_ok |
