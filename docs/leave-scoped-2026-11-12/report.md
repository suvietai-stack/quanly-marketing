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

## Remaining verification
Publish and production filtered HTTP smoke pending at initial report creation. Backend scope/RLS is unchanged and may still need separately approved optimization; do not claim ordinary employees universally fixed before authorized employee E2E.