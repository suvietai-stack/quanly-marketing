# Distribution: code-only release, organization cutover blocked

## Implemented
- `/distribution/3k` is a sibling navigation area. Reuses existing `Biz3K personalOnly`, `k3hub_access_read`, `k3hub_read`, member and feedback RPCs.
- No new permission key or grant: entry uses existing `k3hub.biz` or `k3hub.use`; active account, own current appointment and backend-authorized report options remain required. Menu presence is not a data grant.
- Restricted report selection intersects authorized options with the active chart subtree rooted at existing ID `3df93c75-8a46-4c2f-bc09-7583aa672b52`. Empty/error never falls back to `biz-block`/company. Existing business route behavior stays unchanged.
- Own personal records remain shared, including authorized concurrent appointments; no cloned records or attribution updates.

## Live audit / blocker
Live `base_config()` reads canonical `org_config()` units/memberships. Existing chart RPC is active-account-only. Live `k3hub_read` checks active account, policy and per-person server scope; chart intersection does not replace authorization.

Existing canonical `org_commands` forbids reparenting an existing `source=biz_systems` unit (`Hệ Kinh doanh giữ liên kết nghiệp vụ với Khối Kinh doanh`). It also forbids changing existing unit kind. Distribution is currently a system beneath `biz-block`; K3Hub policy applies block IDs and `k3hub_path` follows current parents, not historical parent intervals. Moving it to company would remove its enabled ancestor without a coordinated prospective policy change and could change historical aggregation. **No safe executable reparent migration is supplied or applied.** A direct UPDATE would bypass the audited contract and is prohibited.

## Required cutover package before separate approval
1. Snapshot exact canonical tree, parent intervals, 5+18 active assignments, position bindings, Biz system/department mappings, CRM attribution and policy versions; export privately, not into this repository.
2. Extend the audited organization preview/apply contract only for this reviewed move with revision/concurrency fencing and accurate parent interval closure. Preserve system/department IDs and source links.
3. Prove historical parent resolution for K3Hub/Biz/CRM/report dates; policy cutover must be prospective with no previous-version rewrite. Decide approved root kind/policy representation explicitly.
4. Test employee, department manager, company admin, concurrent appointments, DENY, inactive users, CRM and report history; capture before/after counts and scope parity.
5. Supply exact candidate SHA, transaction snapshot, conflict-safe rollback and owner approval. Rollback must restore only the approved transition, never bulk restore over subsequent writes.

`preflight.sql` contains SELECTs only. It is an audit aid, **not a migration or proof that organizational separation is complete**. Production tree, permissions, personnel, records and policy remain untouched. No publish.

## QA
- 33/33 targeted tests passed: navigation, area scope/intervals, shared totals and timing.
- Automatic preview build reports `build OK`. Manual `bunx tsc --noEmit` / `bun run build` were not run: this environment prohibits manual builds/typechecks. These exact requested commands are UNTESTED, not claimed PASS.
- New area/helper/route files pass ESLint with the formatting rule disabled; whitespace diff check passes.
- Browser HTTP 200 then existing auth redirect to `/login` at 1280/320/375/390/414; no page errors. This verifies route loading and signed-out gating only, not signed-in workspace layout.
- Existing-user session unavailable (`--self` found no matching account); no user created, no writes. Employee/manager live scoped E2E and authenticated responsive layout remain UNTESTED.
- Read-only live confirms unchanged unit IDs/source/parents and the explicit reparent guard. The latest active-count query did not return rows, so the earlier owner-supplied 5/18 counts are not independently reconfirmed here.
- Preflight SHA-256: `fc8ef2235b5765e2696aa95f7328d7a2aa04d5b4ed6882ff0243f259ae7871e1` (read-only SQL, not an approved executable migration).