# Architecture rules

- Leave writes only via SECURITY DEFINER RPCs checking `private.sig_can` and server time; client tables SELECT-only — prevents bypassing permission/deadlines.
- Change `src/lib/leave/calc.ts` and `private.leave_eval` together — keeps preview and authoritative calculation aligned.
- Read branding only from app_branding via useBranding()/brandHeader() with fallback — supports reuse without code changes.
- Attendance explanations live in attendance_explanations, written via att_* RPCs — avoids mixing leave approvals/reports.
- Web Push uses notifications.push_status + unique push_deliveries; push.server.ts sends on push_wake to /api/public/push/dispatch; public/push-sw.js never caches pages — isolates Push from Zalo.
- Content/Design notifications originate in content_notify/order_notify triggers with unique-name recipients and event+item+history+recipient dedup_key; switches live in content_notify_settings — every writer triggers the same notification.
- KPI periods use src/lib/kpi/timeframe.ts (Vietnam time); goals.metadata holds periodType/deadline; overlap filtering doesn't clone monthly goals — preserves historic KPI data.
- Order quotes: separate oq_flows and snapshot oq_rounds; published responses immutable; writes via SECURITY DEFINER oq_* RPC; private order-quotes images. Change private.oq_missing with src/lib/orderQuotes/logic.ts; oq_publish_response auto-completes under FOR UPDATE; delete images via oq_storage_cleanup — preserves history and access control.
- Order tracking remains a data-free placeholder independent of oq_* — no unrequested order workflow.
- New progress forms only submit capability; detail reads old in_progress/existing_code — keeps historical rounds readable.
- Order-quote durations are computed only in private.oq_round_metrics (exposed via oq_job_times/oq_report_rows, report perms oq.report_own/all/export checked server-side); src/lib/orderQuotes/report.ts only filters/aggregates — one formula for list, detail, report, Excel.
