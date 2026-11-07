# Signal work priority hotfix — 2026-11-07

## Cause and correction
- The previous fix added a separate `priority` option but left `work` sorting overdue/contact dates ahead of intake. Existing sessions selecting work therefore retained the bug.
- `work` is now the default and the sole visible priority option. Saved `priority` selections migrate to `work`; both use the same comparator.
- Additive migration 0263 preserves legacy intake columns and adds seven-rank `list_work_priority` plus progression due date. API orders work rank, wait start, progression due date, activity, ID before each range.
- Progression states reuse `signal_progression_deadlines()` without changing its rules, visibility, timestamps or data. View remains security-invoker and SELECT-only. No writes to business records, no Publish.

## Verified
- 143 signal unit/database tests pass, including seven ranks, 4 unassigned + 2 waiting before 573 active, stable ties, legacy selection alias, refreshed deadlines and Sale scope.
- PGlite verifies full-set ranking before LIMIT/OFFSET with 1,105 rows, history-derived wait starts, parent/history RLS and read-only grants.
- Real list components with isolated requests: Manager/Sale at 320, 390, 430 and 1280px pass initial ordering, exact 579/4/2/306 fixture counts, search/status filtering, explicit newest override, selecting work again and reload persistence. Screenshots confirm the first six Desktop rows and identical Mobile order. No fixture records written to hosted data.
- Hosted grants: authenticated SELECT true, UPDATE false, anon SELECT false. Latest application build OK.

## Not yet verified
- Authenticated hosted Manager/Sale end-to-end. `lovable auth-session --json --self` cannot match the requesting user's email. Preview is signed out; no other account was selected.
- The illustrative 579/4/2 dataset is not current: a read-only aggregate returned 588 total, zero non-cancelled unassigned and three non-cancelled waiting at verification time. Data is live; an earlier aggregate returned four waiting including cancelled rows. Do not alter data to reproduce the illustration.
- Privileged read-query tool cannot execute the caller-scoped progression RPC, so hosted work-rank counts were not obtained. Do not broaden function grants to bypass this diagnostic restriction.
- Real state-changing workflows were not executed; isolated tests cover reordering without modifying customer records.