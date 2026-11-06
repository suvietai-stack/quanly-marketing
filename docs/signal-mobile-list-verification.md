# Signal mobile list — 2026-11-06

## Delivered
- Compact search/filter/create row; one horizontally scrollable status row with counts derived from the existing RLS-scoped backend list and all other applied filters.
- Authoritative progression deadline choices moved into the existing draft filter sheet. Apply, clear, filter count and user-keyed session restoration retained.
- Mobile cards show two-line customer name, non-overlapping status, full authorized phone, two-line actual need, rated potential, at most one label plus remaining count, owner and progression deadline. Legacy follow-up date is not substituted for progression deadline.
- Read-only valid `tel:` links, disabled contact actions for invalid/missing numbers, copy-phone Zalo dialog and clipboard failure explanation. No unverified phone deep link, OA send, progression write or status transition.
- Incremental rendering of 30 mobile cards using the existing complete scoped list/cache, no per-card requests. Desktop table unchanged; existing detail Sheet preserves list filters and scroll.

## Verification
- `bunx vitest run src/lib/signals tests/signals --maxWorkers=2`: 131 tests passed.
- `tests/signals-mobile-list.browser.py`: isolated 320/360/390/430/1280 checks passed: long names/status/need, missing phone/need, call URL, Zalo copy fallback, status counts, deadline draft cancellation/apply/clear, reload persistence, load more, detail close scroll, desktop table, no overflow, no business writes.
- `tests/signals.browser.py` and `tests/signals-deadlines.browser.py`: regression passed.
- Preview build log: build OK.

## Limits
- Hosted authenticated acceptance unavailable: own-account session mint found no matching account. Tests intercepted all backend calls and did not create fake production customers or modify records.
- Real phone dialer, Zalo app, mobile keyboard/PWA safe area not verified on a physical device.
- No official personal phone-to-chat deep-link guarantee was verified; the mobile list deliberately uses the copy-number fallback.
- Existing full scoped data fetch remains unchanged; only mobile DOM rendering is batched. No new server pagination/counters or business permissions were introduced.
- Not published.