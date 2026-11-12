# Application blocks — staged extension, 12 November 2026

## Implemented on Preview
- Existing 3K Settings gains a separate application-scope section. Dynamic active block IDs, all-block switch, explicit company/unassigned option, effective date, reason, employee-count preview and revision-bound Save.
- All ON includes future blocks. Switching to manual clears the company/unassigned option; administrators must explicitly select it. No fixed block names are authorization keys.
- One isolated RPC adapter for pending names; no generated client/type modifications. User-keyed query, no focus refetch or retries; Save invalidates K3 caches and refreshes verified account access.
- Unavailable live RPC displays an explicit inactive configuration state with no Save control. It does not invent a successful save or alter live application scope.

## Pending SQL
`docs/pending/k3_application_scope.sql` is the single extension AFTER applied 0383/0384. It does not repeat `k3_company_schema.sql` or replace the company manager-source candidate.
- Additive settings fields and append-only application versions, SELECT-only authenticated grants and settings-permission RLS.
- Authenticated settings read/preview/save with active-account guard, real k3.settings, prospective effective date, active block-ID validation, mandatory reason, atomic settings lock, revision conflict rejection and before-state audit.
- Cycle-bounded recursive ancestor traversal, effective assignment intervals, concurrent appointment union, company/unassigned option and new-block semantics.
- Separate application eligibility and authorization: `k3_application_can_write` requires both current/day scope plus existing DENY-aware k3.use. Existing k3_can remains for owner historical read compatibility; choosing blocks never grants manager scope.

## Verified
- 9 PGlite scope tests: defaults/new blocks, Marketing→Design descendants, Operations exclusion, concurrent assignments, company/unassigned, restricted staff, revision/active IDs/past date, historical reads with rejected scope writes, future activation, expiration/future assignments, DENY.
- 15 existing personal K3 tests and 12 cache tests: 36 passed total. Current build log build OK.
- Browser authorized Super Admin: live inactive state has zero Save controls. Mocked staged RPC fixture rendered manual Kinh doanh + Marketing and company/unassigned OFF at desktop 1280×1800, iPad 820×1180, mobile 390×844, zero horizontal overflow. Mocked fixture is presentation validation, NOT live scoped end-to-end acceptance.
- Read-only live audit confirms 3 active block IDs supplied by owner. Baseline snapshot retained in live-baseline.txt. No DB migration, config/Role/business writes, legacy deletion, Signals 0371 changes or Publish this turn.

## Activation blockers — not claimed complete
1. All owner write RPCs, direct trigger paths, goals/actions/KPI/results/summaries/deletion/restore must consume the shared application write gate. Existing write RPCs still work as before on live; the pending helper alone does not enforce exclusion.
2. Historical owner read-only screen and shared navigation eligibility need one recipient-scoped application access result (including next transition); do not hide history by replacing k3_can with the write gate.
3. Obligation start must use continuous eligible application intervals and preserve leave/schedule checks; reminders, automation, frozen close snapshots and Zalo/report selection must share this predicate without widening viewer scope. No company_effective_from activation has been added.
4. Full cutover rollback must snapshot each additional modified function and test restore before submitting migration. Present rollback deactivates only this new, not-yet-live configuration surface while preserving additive history.
5. Authorized non-Biz employee live session is still unavailable; full own create/update/readback, exclusion and manager denial E2E remains unverified.

No migration tool was called, so no approval card/tool ID exists. SQL remains pending; no competing migration sequence or draft backend was created.