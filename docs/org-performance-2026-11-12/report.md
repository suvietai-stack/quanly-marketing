# P0 organization read timeout — 12 November 2026

## Verified diagnosis
- Previous executive operation completed at 06:22:54Z, adding only ot.view_unit. This investigation does not change Roles, overrides, tree, appointments or business data and runs no migrations.
- Live pg_stat_statements: org_workspace_read 1530 calls, mean 1344.00 ms, max 7931.25 ms; base_permissions_effective() 5918 calls, mean 2719.94 ms, max 8000.55 ms; role_catalog_read 138 calls, mean 628.24 ms, max 7040.84 ms. Parameterized effective reads: 170 calls, mean 1834.84 ms, max 7388.01 ms.
- Authorized Super Admin REST benchmark, sequential requests, client ceiling 8000 ms: workspace 30 reads, 26 errors/aborts at ceiling, p95 8000 ms. Effective 3 reads, 1 error, p95 8000 ms. Role catalog 3 reads, zero errors, p95 1432 ms. Raw name/status/timing-only results in live-before-timings.json. These are RPC reads, **not** 30 browser page reloads or cold measurements. Client abort errors do not prove each request received server 57014.
- Exact live workspace definition runs four per-unit org_can scans plus a view scan and additional base_rules for configured fallback. org_can reconstructs config/rules for each non-Super-Admin target. This repetition is verified from definitions; its share of production latency is not phase-measured. Super Admin org_can short-circuits, so repeated base_rules is **not** proven to be the sole cause of the observed Super Admin timeouts.
- Exact base_effective repeatedly scans the same JSON rules per catalog key, calls legacy gates per key, and appends growing JSON arrays across 510 keys. base_permissions_effective constructs base_config twice. These avoidable operations are confirmed.
- EXPLAIN ANALYZE on the 16-row org_units scan: execution 0.098 ms, shared hits 2. Missing index on this tiny scan is not demonstrated as the bottleneck.
- RLS org tables calls org_can; workspace/config run SECURITY DEFINER as postgres. No ACL/RLS recursion changes made.
- Cloud health: up, no restarts, memory 81%, connections 15/60, pool clients 1/200, data disk 19%; historical I/O budget alert 11 November, not proof of current exhaustion. No resize or timeout increase.

## Staged backend optimization — NOT APPLIED
Candidate SHA256: `331ad3a83764d9563605b8c1d7113166751a2cc6f7e8f0ea72099ab753e2ea25`.
Exact file: `docs/org-performance-2026-11-12/candidate.sql`.

Changes only three existing functions:
1. org_workspace_read: one org_config; Super Admin unit-array fast path, zero org_can calls; other actors compute base_rules once, materialized unit closure and set-based ALLOW/DENY decisions. Keeps inactive-unit semantics, unconfigured fallback, filtering, staff/catalog/events and current output schema.
2. private.base_effective: one rules evaluation, grouped per-key flags and original ordered source JSON; one supported/legacy result per catalog key; ordered jsonb_agg rather than array append loop. Preserves inactive, Super Admin/CRM bypass, unsupported, legacy and K3 gates.
3. base_permissions_effective: evaluate base_config once and reuse for transitions and effective output.

Preflight checks current DDL MD5, postgres owner and exact ACL for all three modified functions. No CREATE TABLE, GRANT, policy, Role or data mutation. Existing function ACLs remain through CREATE OR REPLACE. No persistent cache or authorization shortcut across requests.
Snapshot contains exact DDL/MD5/ACL/owner for eight relevant functions. Rollback contains original three definitions, SHA256 `b2a675a4eb782ffd9b933f4141efacc2bc683213e0c99d867c3eda3d17b4327f`; review deployed candidate fingerprints before rollback, do not overwrite concurrent edits.

**Owner action:** approve this exact candidate SHA256 before any live SQL execution through the migration workflow. This is not authorization to alter Role keys, eligibility, policies or business records.

## Tests and benchmark
- 49/49 selected tests passed: eight candidate parity/benchmark tests, four retry/cache-key tests, 20 appointment-source tests, nine shared-position tests, eight Common-source tests.
- Candidate parity exercises Company/Block/Dept, scoped DENY, inactive actor, Super Admin, unconfigured fallback, inactive units, exact effective sources/order, unsupported rights and delegated K3 legacy eligibility. Existing tests cover concurrent source/title/active dates and DENY. **Not** a full production resolver clone for every business eligibility branch.
- Isolated PGlite workspace fixture 30+30 reads: old p95 3.30 ms/max 4.26; candidate p95 1.32/max 1.40. Stubbed config/rules/legacy, tiny fixture — cannot extrapolate this to production or cold p95.
- Phase timings config/rights/filter/staff/catalog/events on production remain unavailable: read tool cannot execute private.org_config (42501); no grants added and no impersonation. Authorized REST exposes only whole RPC duration. SQL profiling wrappers were not deployed without owner approval. Service-role execution and non-admin authenticated production benchmark remain unverified.
- Target cold production p95<2s and 30 page reloads without timeout: **not met/verified**; candidate not live.

## Frontend compatibility changes
- One automatic retry for transient failures only, 1s backoff, no retry for permission denial; manual retry disabled while fetching.
- AbortSignal propagated from query to REST request; no app-level timeout increase.
- Query identity includes user and matching access revision. Account switch remounts state; revision resets drafts/dialogs/staff selection; nonpersistent query gcTime zero, focus revalidation, existing periodic/mutation invalidation retained.
- Fail closed: errors hide prior privileged page content instead of reusing stale sensitive snapshots. No cross-account last-success/localStorage cache.
- Loading skeleton plus persistent page title/error/retry. Logs only RPC name, HTTP status, error code and elapsed time; no actor or response payload.
- Browser fixtures at 1280 and 390: two failing requests then stop; manual retry successfully renders page, no errors/overflow. Uses empty fixture, not authenticated full organization data; production flow still needs post-deploy verification.
- Preview build/typecheck OK after correcting API callback compatibility; no manual build/typecheck run. Existing organization/index metadata retained.

## Publish state
- Requested **frontend-only compatible** publish in this turn; SQL candidate not applied/included as active backend change. Scheduling is not succeeded status.
- At 06:41Z production /organization returned HTTP200 with deployment prefix `psr2.7c506329-c45c-4580-84a4-9f89361742d8`, same prefix as before publish request; frontend release is not confirmed live.
- Authorized Super Admin browser stayed on /organization and screenshot visibly showed `canceling statement due to statement timeout` plus retry button, without the new page-title error state. This confirms the original failure is still present on production. No claim of deploy success or root-cause fix.