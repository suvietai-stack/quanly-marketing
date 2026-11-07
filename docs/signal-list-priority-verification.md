# Signal list intake priority — 7 November 2026

## Delivered
- Desktop/mobile tabs: All, Unassigned when permitted, Waiting, then existing workflow statuses. Counts consume the existing RLS-scoped set and all other filters.
- New default `priority` sorting keeps unassigned and waiting first, oldest wait first; active records follow, closed/cancelled records last. Existing saved sorting choices, including `work`, remain respected.
- `signal_list_priority` is a SELECT-only security-invoker view. Both parent and history RLS apply. It derives waiting start from real unassignment/assignment events and actual transitions into waiting, excluding same-state notes, with existing assignment/creation timestamps as fallbacks.
- Global backend ordering precedes every 1,000-row fetch range. The existing complete-list cache is fully loaded before search/deadline/label filters and mobile 30-record rendering batches. No fetched page is sorted independently. No limited filtered server page endpoint was introduced.
- List/report query variants use distinct suffixes under the existing user-keyed `sig:` invalidation prefix; report logic is unchanged.
- No customer/status/history rows were rewritten. No notifications were enabled or sent by this change. Additive migrations are applied to the shared backend; app code is not published.

## Verification
- 139 tests across 16 signal test files passed, including a 1,105-row database fixture proving waiting rows appear before LIMIT/OFFSET and authenticated parent/history RLS applies.
- Dedicated priority browser checks passed for Sale and manager at 320/390/430/1280: initial priority, tab order, counts, search, status selection, explicit sorting, reload persistence, backend order query, and overflow.
- Mobile list, deadline-filter, assessment and report browser regressions passed.
- Hosted grants verified: authenticated SELECT true; INSERT/UPDATE/DELETE false; anon SELECT false; `security_invoker=true`.
- Preview build OK.

## Not verified
- Hosted authenticated end-to-end list/assignment/acceptance: own-session mint found no matching account. User sign-in in Preview is required. No arbitrary account was selected and no test business writes were made to the shared backend.
- Physical mobile/PWA behavior is not tested in this change.