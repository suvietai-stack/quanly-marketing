# All 510 permissions toggleable in every Role + personal Inherit/ALLOW/DENY — STAGED, NOT APPLIED

Supersedes role-permission-deny 94f95b4b, role-grant-universal e818e8af, role-grant-expansion 3c4b23f8 (apply none of them).

## Result after apply
| | Before (live) | After candidate |
|---|---:|---:|
| Catalog keys | 510 | 510 |
| Toggle enabled in Common / position / Marketing task / any Role | 12 | 510 / 510 / 510 / 510 |
| Personal ALLOW enabled | 15 | 510 |
| Personal DENY enabled | 0 | 510 |
| Administration keys (Super Admin only may grant, audited) | locked | 50 grantable by Super Admin |

## How each key takes effect (no "OR true", no RLS change)
- 195 keys: already read by the shared resolver.
- 315 newly routed: the resolver now covers every catalog key (`base_supported`), and these gates read it:
  `has_permission`/`sig_can`/`kpi_can` (all ordinary modules), `biz_can` (Quản trị Kinh doanh, V2 rule first), `k3_can` (3K), `crm_can`, `org_can` (Cơ cấu tổ chức).
- Data scope stays with the key and resource: unit rights only open the unit of the granting position appointment; `org_can` no longer treats a unit-less ALLOW as company-wide (Common/personal org rights open no unit). Granting never changes owner_id or RLS.
- Honest limitation: many Web/Thiết Kế/Social/Task/Video/Thương hiệu actions are gated in the app screens only; their tables are open to every active account today (pre-existing, same for the 195 keys). Toggles change what those screens allow; per-action server guards for those tables are a separate tranche.

## Safety
- 930 stored Role/key pairs that today grant nothing stay inactive (dormant fence) — applying grants nobody anything new (510-key parity test).
- New gates only consult the resolver once a V2 Role or the person's ALLOW/DENY mentions the key (`permission_configured`), so existing pages keep today's speed.
- Super Admin bypass unchanged; Super Admin/system admin/self cannot be edited; administration keys may be added only by a Super Admin actor; inactive accounts get nothing; denies that an admin bypass would ignore are refused instead of faked; leave-approval deny blocked while approvals are pending; deny lists only change through preview/save with audit.
- Preflight: md5/owner/ACL of 26 functions, catalog=510, Role and personal-override fingerprints. Rollback restores 18 exact definitions and refuses while any personal DENY exists.

## Tests
`permissionFull.database.test.ts` 25/25 (isolated, exact live definitions): all 510 keys validate in every Role kind and preview as personal ALLOW/DENY; one key per module Role-grant → gate open → personal DENY closes → removal restores; biz/3K/KPI gates; org unit scoping; administration grant by Super Admin only; 510-key parity; concurrency; rollback. All permission tests 481/481.
