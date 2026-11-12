# Base performance — 12 November 2026

## Delivered safely in frontend
- Staff opens Sources, not full Effective. Full effective RPC is enabled only on explicit Effective tab, keyed by actor/target/revision and AbortSignal. Personal supplemental state is independent; inherited data is shown only when already available.
- One shared actor-keyed catalog SELECT in Role/personal editors, merged by stable key with local metadata. No editor catalog SELECT on chart or initial staff. Still 510 unique keys / 24 modules / 15 ready personal keys; no readiness expansion.
- Chart, Role tools, large advanced tools, appointment dialogs lazy imported with local Suspense. Advanced matrix, source history and slot snapshot reads require opening their section. Personnel components remain ordinary imports after live navigation showed selection remounts during lazy loading; their queries still mount only on visible tabs.
- Workspace UI reads reuse 30s actor/revision cache; no cross-actor reuse. Revision closes previews without clearing an open employee selection. Existing mutation reload, status/sign-out handling and transition-bounded access cache retained. Server writes remain live-authorized; no durable permit cache.
- Current backend still eagerly returns staff/catalog/events and evaluates all 510 effective keys during auth load. Code does NOT claim to have removed that cost before approved SQL.

## Audit and cutover graph
Baseline 07:19Z: 31 gen1, 26 V2, 25 legacy slots, 86 assignments, 13 overrides, 510 catalog keys, 2 Super Admins; 23 active / 3 locked profiles.
Row MD5 over sorted row JSON: roles `396b9b333d8f5a8d1e36d1fbcaa0f16d`; assignments `ab614dbd480c285f428158819e186886`; slots `f0da0d57570dc8a55f6ee811b316d1d5`; overrides `6186af0e345bd230f6615de4edc1d688`; user_roles `88b2a9a53be01f2fc60531ef005ce15e`.

```text
auth/header -> base_permissions_effective -> base_config + base_effective
base_effective -> base_rules + per-key base_legacy
base_rules -> common + existing source pipeline -> position/task/supplemental/DENY
position evaluator org_slot_rules -> (unit,title) org_position_roles -> V2 app_roles
base_legacy / has_permission / admin / signal scopes -> user_roles + app_roles
org_workspace_read -> org_config + 4 unit org_can scans + configured/view scan
org_config -> legacy slots (compatibility/history payload, NOT V2 source)
writer/signatures/restore/history + FK -> legacy slot IDs
Biz/3K native gates -> workflow, eligibility and historical appointments
```

Live `org_slot_rules` already joins V2 binding and emits slot_id NULL; `org_role_rules` delegates to it. Do NOT duplicate that cutover. user_roles still participates in bootstrap/admin, direct legacy fallback, signal scope and exception policies. FKs retain user_roles, specialties, title links, org_position_roles, biz exceptions and assignment.slot_id; do not delete/rewrite/cascade them.
Full direct textual frontend/SQL dependency inventory and current function definitions/checksums in neighboring artifacts. Text search is not a complete transitive PostgreSQL dependency proof: PL/pgSQL dynamic references and cron indirect gates need module-by-module reconcile before disabling gen1. No legacy source was disabled this turn; preserving current rights takes precedence over an unproven global switch.

## Sole staged candidate — NOT APPLIED
`docs/org-performance-2026-11-12/candidate.sql`
SHA256 **6acee6d6a91a55c035811c5342c30fba38608fc03749f2609f1cd38579ffba25** (supersedes old 331ad3a8 candidate IN PLACE, not a competing migration).
Affected objects only: `public.org_workspace_read()`, `private.base_effective(uuid,jsonb)`, `public.base_permissions_effective(uuid)`.
- One config/rules evaluation + set-based unit decisions, validated active Super Admin fast path.
- Group rule flags/source arrays once, preserve legacy/native gates, DENY and source order, aggregate output instead of growing arrays.
- Reuse config for transitions; return empty catalog in workspace while authenticated editor SELECT stays available.
- Exact preflight DDL MD5/owner postgres/ACL verified unchanged live. Original rollback SQL remains available; no table/RLS/GRANT/Role/assignment changes.
**Separate owner approval required for this exact SHA before migration.** Not a full V2-only cutover: broad legacy reconciliation and splitting auth evaluation into compact keyed decisions remain unsafe to activate without full native-scope parity.

## Tests and observed performance
- 54 tests initially passed across nine focused files: Common, source scope, cutover, executive assigned-step guard, DENY, cache, checklist, retry and staged SQL parity. Added explicit workspace catalog-exclusion regression afterward; final test result recorded in tests.txt.
- Authenticated Super Admin local desktop1280/mobile390 read-only navigation: chart no editor GET/role RPC; select staff→Sources; Personal shows 510/24 with one GET; no new full-effective RPC until Effective clicked; returning to Personal reuses catalog; zero page errors/no horizontal overflow. No real mutations.
- Fixture desktop/mobile full 510 unique, preview/save/readback and fail-closed policy checks passed (writes mocked only). Retry fixtures passed two attempts then stop/manual recovery.
- Isolated PGlite 30+30 reads p95 old3.25ms/new1.34ms; stubbed config/gates, NOT production speed. Production 30 RPC +30 reload cold p95<2s is deferred until approved SQL as requested.
- Current slow-query sample: signal_progression_deadlines mean3178.59ms/max7996.27 across7157 calls; signal reads/history also large. No claim that Roles explain all slowness.
- Actual auth startup also reads 20+ domain tables via global store. Removing that waterfall affects many module stores and is a distinct second stage; not changed blindly here. Existing Signals staged scope candidate remains independent; no blanket retry, timeout increase or compute resize.

## Remaining approval/dependency boundaries
1. Apply exact three-function candidate: blocked solely by separate owner approval; SQL remains unapplied.
2. V2-only gen1 business retirement + remove operational slot writer deps: needs per-actor before/after native scope and obligation reconcile and approved exact SQL; current history/bootstrap/rights retained.
3. Compact auth evaluation, chart/staff/history RPC payload separation and global store lazy domain loads: backend-dependent follow-on, not shipped behind fake readiness.
4. Scoped employee production negative/write E2E: no authorized employee session supplied; Super Admin reads and isolated tests do not substitute.
5. Production cold benchmark after migration: pending approval, no extrapolated success.

## Release
Frontend-only release requested after passing tests/build; deployment ID and production read-only smoke are recorded separately. No database migration or Role changes were performed.