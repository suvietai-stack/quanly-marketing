# Leave tab-scoped SELECT — 12 November 2026

## Scope and result before publishing
- Code-only change. No SQL, RLS, Role, staff, leave or approval writes; staged SQL packages untouched.
- Initial authorized mine tab sends one `leave_requests` GET with `owner_id=eq.<actor>`, limit=1000. Approve sends only `approver_id=eq.<actor>`. Manage/report use the unchanged RLS-scoped full list only after the permitted tab is opened; report reuses manage scope.
- Actor/scope query keys, no previous-actor placeholder; abandoned observer consumes AbortSignal. Actor refresh invalidates all own scope keys, with hidden tabs stale until opened.
- Approval badge uses only already-loaded actor approver cache, never fetches the full list in background.
- Existing 12-second deadline, explicit operation/status/code/duration errors, finite transient retry, no 401/403 retry are preserved.

## Preview evidence
Authenticated existing Super Admin, no impersonation, desktop 1280x1800 and mobile 390x844:
- Exactly one initial owner-filtered GET each. Approve tab exactly one approver-filtered GET. Manage exactly one unfiltered RLS GET. Report made no additional GET because manage cache was fresh.
- 403 simulation showed error/retry, no automatic additional requests; removing simulation and retry recovered.
- Hung request showed LEAVE_TIMEOUT 12.0 seconds in error UI; time including navigation/auth was 15.48 seconds desktop, 15.09 seconds mobile. Retry recovered.
- No page JavaScript errors. Playwright emitted a teardown pending-route warning for simulated hung network routing, not a page error.
- Test artifacts under /tmp/browser/leave-scoped (temporary). No live request was created, edited, approved or cancelled.
- Ordinary employee authenticated E2E is UNTESTED: provided session is Super Admin. Deterministic filter, permission-tab and actor cancellation tests cover the code paths without employee JWT impersonation; they do not establish production employee RLS performance.

## Tests and production verification
- Code commit ecf2aab2. All 67 Leave tests pass; automatic build OK including 10:07:02 UTC.
- Full suite: 1846 pass, 5 fail across launcher.test.ts (2), mobileShell.test.ts (1), biz/my-work.database.test.ts (2). These are the previously reported unrelated navigation/time-dependent failures; no files involved in those failures were changed here. They remain unresolved, not a clean full-suite result.
- Published once. Production https://base.suviet.vn/leave HTTP 200 at 10:07:02 UTC, full header `psr2.8767c1a2-107e-4006-9019-047ad5378a2f.1795082821.dYKlynA6tnirCIuqHIJvo4iFTR_F7jinSdkEcnREwG8`; core deployment identifier 8767c1a2-107e-4006-9019-047ad5378a2f. The signed header suffix is request-specific; browser behavior, not header alone, confirms the scoped code is live.
- Two fresh desktop/mobile production rounds as existing authorized Super Admin: exactly one owner-filtered initial GET, one approver-filtered GET when selected, one unfiltered RLS manage GET when selected, report cache reuse with no extra GET. Confirmatory round observed all six GETs HTTP 200, no page errors, no retry buttons or loading spinner at report completion. Navigation/auth/3s wait-inclusive initial elapsed 6.606s desktop / 5.605s mobile; these are NOT endpoint timings or employee benchmarks.
- Ordinary employee authenticated E2E remains UNTESTED; no employee JWT impersonation. Backend scope/RLS unchanged and may still need separately approved optimization; do not claim ordinary employees universally fixed before authorized employee E2E.
- No SQL/migration/Role/personnel/leave writes, and no change to other staged candidates.