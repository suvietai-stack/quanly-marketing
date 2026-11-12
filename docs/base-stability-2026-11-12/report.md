# Base Sứ Việt — 12/11/2026 09:11 request

## Safe code delivered
- Leave: list/settings already had deadlines; detail/history/approver paths did not. All now bounded by 12 seconds, actor-keyed and cancellable. Already-aborted calls never start; SDK promises that ignore cancellation are raced against explicit rejection. Client deadline no longer automatically retries twice (previously could keep loading ~39 seconds). Permission errors never retry. Report/detail/history/approver failures are explicit, not empty data.
- Role and personal editors retain all 510 catalog keys and 24 modules. Source eligibility remains controlled by deployed server metadata; displayed reasons distinguish missing policy, source enforcement and missing unit scope. Existing preview/save/audit unchanged. No fake checkbox enabled.

## Measured evidence
- Production Super Admin read-only before changes: desktop leave SELECT 435ms/settings 375ms; mobile 378ms/335ms; no page errors or spinner after 18-second observation.
- Local mobile hung list: explicit error appeared 16.527 seconds from initial navigation (includes auth/loading; read deadline 12 seconds); manual retry recovered, zero retry buttons/spinners/page errors afterward. Screenshots `/tmp/browser/owner-stability/`.
- 68 targeted tests passed; automated preview build OK. Isolated SQL tests include full 510 metadata/no readiness widening, 43-policy rollback, 20+5 stable history pagination, mixed-unit denial, signed-out denial and leave own visibility parity.
- Only current authorized Super Admin session was available; ordinary employee live session and their RLS performance are **unverified**. No impersonation or permission mutation was used. Production employee spinner root cause remains unconfirmed; per-row policy probes and previously unbounded secondary reads are confirmed risks, not proof of the employee incident.

## Separate SQL packages — NOT APPLIED
Each directory has `candidate.sql`, `backup.sql`, `rollback.sql`. Exact file-byte hashes are in `SHA256SUMS`; final newline is included. `preflight.sql` is read-only. Owner must separately approve each exact candidate after reviewing limits below.

### permissions
- Candidate returns complete catalog capability metadata, keeping existing 43 admission keys/15 personal keys. It does **not** activate 510 permissions.
- Remaining full unification is blocked on native module/source contracts: Common currently own-only; task rules enforce Marketing eligibility; personal writer forbids changing direct Roles; position writer requires position Role. Removing these without coordinated resolver, native scope and workflow coverage would create granted-but-unusable or unsafe rights. No broad expansion SQL is offered as approved-safe.
- Audit: org_role_permission_ready and mkt_specialty_permission_ready include more keys than editor policy, but membership in those lists alone does not prove admission for every source. Signals still use direct Role scope, Biz/CRM native gates remain separate, and legacy Orders broad RLS cannot be treated as safe scope enforcement.

### management
- Live confirmed Nguyễn Thảo (stored name uses decomposed Vietnamese Unicode) has legacy department_head since 30/10/2026 08:01:12 UTC, no end date, and separate staff appointment since 11/11/2026. Exact-name SQL initially missed this because of Unicode normalization; stable-ID follow-up confirmed it.
- Also found missing **Trưởng Phòng → Role V2 mapping for Kinh Doanh Quà Tặng 2**. Role on the other departments is `role-v2-sales-head`.
- Candidate installs a Super-Admin-only preview wrapper, no staff DML at install time. It builds one existing org_change transaction: selected legacy source end at server time → missing mapping only if no conflicting mapping → same-person V2 manager assignment at that same boundary. Existing advisory locks/signature/baseline/workflow guards remain unchanged. It never calls apply. Owner still needs separate preview impact approval before the later personnel change.
- Existing staff appointment is retained (concurrent choice explicit), so it does not remove personal obligations. Legacy row/history remains, no two manager intervals overlap.
- Isolated wrapper checks pass for preview-only output, same interval boundary, ordinary-actor denial and conflicting mapping denial. Wrapper has **not** been exercised against complete isolated business tables or live previews: pending further acceptance; not claiming production fixed. Rollback removes only wrapper, not later personnel decisions. Any actual personnel apply requires fresh row snapshots and a conflict-safe audited restoration plan, not this DDL rollback.

### history
- Candidate trims initial events to 20 summaries; adds keyset page reader (20 default, maximum 50), and on-demand event detail. Every event's units must all be authorized; signed-out/inactive denied. Full snapshots remain stored.
- **Requires paired frontend history update**. Current frontend expects snapshots; therefore candidate must not be applied independently. No frontend depending on it is published in this turn. No production payload reduction claimed.

### leave
- Candidate replaces statement-constant permission/auth probes with SELECT initplans; owner/creator/approver/all/unit conditions unchanged. Row-dependent leave_unit_visible remains; no widening of SELECT or write permissions.
- Isolated own/outsider/signed-out parity passed; manager/unit/deadline/full source parity and live employee benchmark remain required before application.

## Protections / release
- No migration tools called, SQL applied, Role/override/personnel mutations or history deletion.
- Latest read-only baseline: 57 Roles, 88 org assignments, 25 historical slots, 13 overrides. Prior 86 was superseded by a real intervening appointment outside this turn; no assumption that current count should be reset.
- Security scan: 3 existing warnings (password leak check, k3_settings and mkt_specialties policies), no critical result; external Wiz scan unavailable. No security policy changed to bypass them.
- Production deployment evidence will be recorded after the safe frontend publish request; requested is not equivalent to live.