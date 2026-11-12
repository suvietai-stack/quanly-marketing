# Independent post-apply recheck (read-only, 12/11/2026 ~08:00 UTC, Super Admin)
DDL live (md5/owner/ACL/SECURITY DEFINER): base_effective af242a6b… postgres {postgres=X}; base_permissions_effective 8326b2c5… and org_workspace_read 8a10d37f… postgres {postgres,authenticated,service_role=X}. Matches approved post-apply.
Data unchanged: 57 app_roles, 86 org_assignments, 25 org_position_slots, 13 user_permission_overrides, 21 org_position_roles.
Unauth org_workspace_read: 401/42501.

REST sequential (8s ceiling):
- org_workspace_read x30: p50 8000, p95 8000, max 8000 ms; 22/30 timeout — FAIL.
- base_permissions_effective x10: p50 1185 ms, p95/max 8000; 2/10 timeout — FAIL (not zero-error).
No ceiling, 4 calls: 4.63 / 9.47 / 6.09 s (200) then 12.04 s HTTP 500 57014 statement timeout.

ROOT CAUSE (measured): response is 7,929,456 bytes; events = 8,001,376 bytes (99%). org_events has only 40 rows but each stores full before_data/after_data org snapshots (avg 54 KB compressed on disk). Workspace returns up to 100 events with both snapshots on every load. config=112 KB, staff=3 KB, catalog=[].
Only consumer of before_data/after_data: BaseOrganization history section (orgConfigDiff).

NEXT SMALLEST CANDIDATE (not written/executed; needs owner approval of exact SQL + frontend):
1. org_workspace_read: events without before_data/after_data (id, actor_id, reason, created_at, revisions, unit_ids) — same visibility predicate.
2. New authenticated read RPC org_event_detail(id) (or paged 20) with identical visibility predicate, used only when a history row is opened.
3. Frontend: history <details> lazily fetches diff. Expected payload ~120 KB.
Plus shared IO pressure: simple table reads also hit ~7.9s max; DiskIO alert 11/11.
