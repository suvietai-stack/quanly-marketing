# Read-only deploy check 6b5294aa (12/11/2026)
- 07:37:52 UTC: base.suviet.vn served 83bb5dfa; 07:39 and 07:41 UTC: served 6b5294aa-6ea2-4fac-82c7-b4c13cd0be0e (HTTP 200). lovable.app 302 -> base.suviet.vn.
- Super Admin chart: loaded ~9s, no errors in that run; base_permissions_effective called once ({}, own user).
- Profiles tab -> person: only role_actual_sources loaded; no per-person base_permissions_effective.
- Effective tab: showed "Đang tải quyền..."; no effective request observed within networkidle window — lazy load not conclusively verified.
- One run: org_workspace_read HTTP 500 (backend timeout unchanged; optimization SQL not applied).
- No writes, SQL, Role edits, or republish.
