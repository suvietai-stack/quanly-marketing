# Role on/off + personal ALLOW/DENY — STAGED, NOT APPLIED

Supersedes role-grant-universal e818e8af and role-grant-expansion 3c4b23f8 (apply neither).

## Semantics
- Any Role (Common, position, Marketing Content/SEO/Video task): ticking a key = that Role grants it; unticking = that Role stops granting it. Other Roles may still grant (union).
- Position = which Role a person gets + which unit their unit-scoped rights cover. It is not a permission whitelist.
- Personal: Theo Role (inherit) / Cho phép (ALLOW) / Chặn (DENY). DENY wins over every Role source at the backend; removing DENY returns to inherited; unchecking ALLOW returns to inherited (never an implicit deny). ALLOW and DENY on the same key are rejected.

## Counts (live catalog, captured read-only)
| | Keys |
|---|---:|
| Catalog | 510 |
| Server-enforced through the shared resolver (on/off actually works) | 195 |
| Selectable in all four sources (Common, position, task, personal) | 193 |
| k3.use — not from Common (3K application scope not accepted yet) | 1 |
| biz.crm_view_scope — position only (legacy CRM scope would widen without a unit) | 1 |
| Personal DENY possible | 195 |
| Locked: settings/admin keys (Super Admin only) | 4 (att.settings, biz.crm_settings, leave.settings, settings.view) |
| Locked: gate does not read the shared resolver yet (no fake checkbox) | 311 |
| Stored-but-inactive Role/key pairs kept inactive (no silent grant) | 152 |

Unit keys (leave.view_unit, ot.view_unit, finance.incoming.view_unit) can be ticked in any Role; unit rows only come from a position appointment's unit. From Common/task/personal they open no unit data and never default to company-wide.

## What changes
- Schema (additive, neutral): `user_permission_overrides.denied_permissions text[] NOT NULL DEFAULT '{}'`, same column on private preview table. All 13 existing rows get an empty deny list; no row is rewritten.
- One policy `private.grant_source_ready(kind,key)` used by the validator, Common rules, task emitters, personal rules and the editor read.
- `private.personal_permission_rules` adds personal DENY/ALLOW into `base_rules`, so `has_permission`, `sig_can`, `base_effective`, `crm_can`, `k3_can` all see them. Super Admin bypass and the inactive-account check are unchanged.
- New RPC overloads: `account_supplement_preview(_target,_permissions,_denied)`, `account_supplement_save(_target,_roles,_permissions,_denied,_fingerprint,_reason)`; old 2/5-arg calls keep the current deny list.
- Trigger blocks direct table writes that add/clear/delete denies (the existing admin table policy cannot bypass preview/audit); account deletion still cascades.
- Guards: no deny on Super Admin/system admin/self; no deny on keys whose gate does not read the resolver; no CRM deny on business admins (they bypass); no deny of leave approval while the person still has pending approvals.

## Safety
Preflight: md5/owner/ACL of 22 functions, catalog=510, Role fingerprint, personal-override fingerprint, new objects absent. Any drift aborts.
Rollback: restores 11 exact definitions, drops the new objects and columns; refuses while any personal DENY exists.
Tests: `permissionDeny.database.test.ts` 20/20 (isolated PGlite with exact live definitions, including 510-key parity before/after). All permission tests 455/455.
SHA256: see SHA256SUMS.
