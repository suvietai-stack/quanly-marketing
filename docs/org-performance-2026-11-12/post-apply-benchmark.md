# Post-apply benchmark (read-only, 12/11/2026 ~07:50 UTC, Super Admin)
REST sequential, 8s client ceiling:
- org_workspace_read x30: p50 8000, p95 8000, max 8880 ms; 18/30 hit 8s ceiling (prior: 26/30). Successful response: catalog=[] , keys actor/catalog/config/events/revision/server_now/staff.
- base_permissions_effective x15: p50 1326, p95 1781, max 1910 ms; 0 failures (prior mean 2718, max 8000).
- Unauthenticated org_workspace_read: 401 / 42501 permission denied (guard OK).
Browser /organization, 3 reloads each: desktop org_workspace_read 3.9/9.8/6.1 s, mobile 6.6/7.5/9.2 s, all HTTP 200, no page errors, 0 catalog GETs on chart load.
DB health: 18/60 connections, no long active queries; but simple table reads (signals, notes, social_posts) also show max ~7.9s in pg_stat_statements → shared IO pressure (DiskIO alert 11/11) likely contributes.
Conclusion: base_permissions_effective improved; org_workspace_read still slow — NOT fixed. No rollback indicated (no scope/runtime regression observed). No writes.
