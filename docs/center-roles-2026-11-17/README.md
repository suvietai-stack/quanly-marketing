# Role and Organization standard — 17 Nov 2026

**Only fill missing elements.** There are 11 canonical position Roles: 4 B2B, 4 Phân Phối, 1 Giám đốc Trung tâm BTC, 1 Cửa hàng trưởng and 1 Nhân viên Showroom. Existing 2 Showroom Roles were audited with 28/18 permissions; they are NOT rewritten by the idempotent seed. Current role catalog contained 0 of the other 9 Role IDs before seeding.

## Default rights

- All Roles: own attendance and leave, overview, own 3K entry.
- B2B employees: scoped CRM, signals, order and quotes, plan/goal/report submission and 3K. Team/head/director add unit-scoped management and approvals by seniority. No default company-wide/all-data finance or destructive grants.
- Phân Phối: own 3K plus scoped unit 3K for leaders and leave management. **No B2B orders, quotes or CRM grants.** Management scope depends on verified appointment, not title text.
- BTC director: showroom center visibility, shift approval/configuration, showroom 3K and unit leave; no B2B order rights.
- Cửa hàng trưởng/Nhân viên Showroom: preserve existing 28/18 configured permissions and admin customizations exactly.

`seed-missing-roles.sql` checks source IDs, canonical identity and duplicate names, validates every proposed permission through policy and catalog, and inserts missing Roles in one transaction. Never re-seeds an existing row. `src/lib/basePermissions/centerRoleDefaults.ts` is the reviewable Role matrix and SQL test verifies each inserted array. **Roles are not automatically granted to personnel**: position links require existing authorized `org_change` preview/apply. No source or historical assignment is deleted/rewritten.

## Correct hierarchy

- Company → sibling B2B, Phân Phối, BTC centers, all with original IDs.
- B2B and Phân Phối: center → real department → real team (if any) → employee positions.
- BTC: center → each real Showroom directly → Cửa hàng trưởng and Nhân viên Showroom positions.
- Empty legacy business wrapper can be omitted from *display only*. Historical Bán Lẻ wrapper is retained separately for audit; database reparent is not attempted because canonical org/3K source guards protect active and historical data.

Actual DB parent transfer, prospective mapping of currently occupied generic Sales slots and private server-scope policy remain separate guarded cutovers. Do not claim full independence until such transfers are audited and applied.
