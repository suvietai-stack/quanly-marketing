# Title Role scope audit — implementation status

## Shipped safely
- Original Role read, live permission inspection and conservative mapping suggestions.
- Separate draft links for Base titles and Biz positions; no permission snapshots or cloned Roles.
- Super-Admin-only transactional draft saves, reason/audit, expected snapshot fencing, duplicate/primary checks.
- Database CHECK prevents activation, including privileged direct writes; Admin/Super Admin cannot be inherited.
- Read-only personnel source comparison and existing direct Role display.
- Scope primitive covers active descendants and denies missing/outside/disabled targets.

## Not complete; activation intentionally unavailable
The scope primitive is not yet wired into all module resource reads/writes. No inherited Role source is effective.

| Surface | Existing boundary to preserve | Required before inheritance activation |
|---|---|---|
| Marketing / Design / Task | has_permission, ownership, assigned workflow actors | resource attribution, RLS/writers/reports/export, recipients |
| Leave / Attendance | sig_can, owner/approver/witness RPC guards | target-aware actions, reports and recipients |
| Finance / Finance requests | financial visibility, decision order | scoped ownership, export, approval candidates and notifications |
| Signal | role group scope + ownership | inherit group settings and organization target scope together |
| Order tracking / Quotes | guarded RPCs and opposite-party decisions | scoped visibility, writers, reports and recipients |
| Organization | revisioned scoped membership writer | require grant authority when positions start granting Roles |
| Biz / 3K / CRM | appointment-only effective permissions | never revive legacy Role grants |
| Settings / Admin | direct-role hierarchy guards | never infer global authority from unit management |

Outstanding: effective source lifecycle, direct multi-Role atomic writer, reconciliation preview/apply, timed refresh, full regression and signed-in UI acceptance. Existing account rights have not been modified.