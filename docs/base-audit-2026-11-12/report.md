# Base audit and fixes — 2026-11-12
## Applied backend fixes
1. 62 SELECT policies now evaluate constant STABLE actor checks in statement initplans. Row-dependent predicates, privileges, RLS modes and write policies are unchanged. Exact guarded deployment and rollback SQL are in this directory.
2. signal_progression_deadlines computes the full progression evaluation once, rather than once per signal, and uses statement-level actor scope/permission checks. Function remains SECURITY DEFINER with the same visibility logic and return schema. Exact original rollback retained.

## Frontend fixes
- Shared store reads all pages with stable created_at/id ordering instead of silently accepting the server row cap.
- A later-page failure rejects the whole collection, so partial data is never presented as complete.
- Transient failures retain only the current actor's previous collection; permission/schema errors clear it. Failed collection reads produce a visible error rather than looking like successful empty data.
- Each page has a 20-second abort and settlement deadline even if the transport ignores abort.
- Catalog reads use the same bounded pagination.
- Switching accounts clears collections immediately. Failed obsolete requests cannot mark a different account's store loaded.
- Mobile navigation test updated to the existing approved “3K của tôi / Điều hành” labels; product navigation was not changed.

## Verification
- TypeScript: npx tsc --noEmit passes.
- Production build: npm run build passes.
- 12 selected regression suites: 96/96 tests pass (session/cache/navigation/permission controls/reads plus six new store-read regressions).
- Static scan: 216 literal public RPC names in implementation source all exist in the live database.
- No remaining detached .rpc assignments found in implementation source (the prior personal-editor fix binds its receiver).
- Same actor's visible-row digests for profiles, social_posts, web_contents, leave_requests and signal_labels are identical before/after policy changes.
- Combined reads of those five groups: 18,049.496 ms before → 6,842.617 ms after.
- Deadline read before: diagnostic exceeded 120 seconds and was cancelled; sampled exact before/after row comparison: 1 row, 0 mismatches. After: 765.639 ms, 59 rows.
- Current combined base_permissions_effective + approval_center_read diagnostic: 3,009.082 ms.
- SQL timings exclude network/browser latency; query-statistics history was used to prioritize investigation, not as a claim about current latency.
- Repository lint has existing formatting/explicit-any violations; a clean repository-wide lint run is not claimed.

## Scope and remaining verification
This is a source/SQL audit and targeted regression run, not proof of zero defects throughout Base. Live business writes, money operations, approvals, notification delivery, Zalo and every actor/module combination were not exercised on real records. No business records or Role assignments were changed for tests. Further work should use isolated fixtures for those state-changing flows. The director Role remains unchanged.
