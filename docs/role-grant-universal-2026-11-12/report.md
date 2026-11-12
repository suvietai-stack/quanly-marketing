# Universal Role/personal grantability — STAGED, NOT APPLIED

Supersedes role-grant-expansion 3c4b23f8 (2 keys); do not apply that one.

| Measure | Before | After candidate |
|---|---:|---|
| Catalog | 510 | 510 |
| Editor policy keys | 43 | 195 (all keys the resolver already enforces: org-ready ∪ specialty-ready, minus 4 settings keys) |
| Selectable in Common, position, Marketing task AND personal | 12 | 190 |
| Unit-scoped (position Role only, needs a unit) | — | 4: leave.view_unit, ot.view_unit, finance.incoming.view_unit, biz.crm_view_scope |
| Still locked | 498 | 320: 311 not enforced by the resolver + 4 settings + k3.use (Common) ... |

What changes: 7 functions replaced + 3 new private helpers. One policy `private.universal_permission_ready` (no role_kind); validator/emitters use it. No schema, RLS, grants, Role or staff data change.
Safety: 152 stored-but-inactive Role/key pairs (e.g. leave.approve in old SEO/Video Roles) are fenced so applying grants nobody anything new. DENY, inactive accounts, appointment dates, Marketing eligibility, owner/approver checks inside each module stay unchanged. Settings/admin keys and k3.use (Common) stay blocked.
Preflight: exact md5/owner/ACL of all 7 functions, catalog=510, Role permission fingerprint b4b3fd87…; any drift aborts.
Tests: grantUniversal.database.test.ts 14/14; all permission tests 432/432.
SHA256: see SHA256SUMS. candidate e818e8af…7b275, rollback 03debdd9…a4a6f.
