# Approval Center (/approvals)

- Read-only aggregation layer: single RPC `approval_center_read` unions todo/mine/done from biz_approvals_read, fr_steps, leave_requests, leave_request_events, attendance_explanations, orders, ot_reschedules, profiles — each branch mirrors its source decide RPC's eligibility exactly; no new approval tables, statuses, or duplicate workflow logic. Badge = todo length only; navigation/mobile button gated by the RPC's eligible flag.
