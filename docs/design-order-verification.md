# Design Order verification — 2026-11-07

## Verified
- One Order source; additive workflow field and caller-scoped reads, atomic writes, file permission compatibility and append-only authoritative audit (0264–0269).
- Hosted read-only counts: 83 total, 76 completed, 13 confirmed Content-linked Marketing, 70 unclassified; 1 existing completedAt field. No test Orders inserted.
- 77 targeted unit/database/regression tests pass: scopes, edited-field conflicts, audit identities, unclassified creation rejection, immutable history, unrelated transition timestamps, file updates without generic edit, VN periods, denominator and precise durations, navigation, launcher, KPI, quote/tracking logic.
- Isolated browser checks at 320/390/430/768/1280 cover form create/read-back, filters, default flow, reports and no overflow. Screenshots reviewed; charts render. Fixture data is browser-only and writes are intercepted.
- Latest preview build OK; five Design routes have individual metadata.

## Not verified
- Hosted signed-in end-to-end: managed session mint --self found no matching account. No other account was selected.
- Real approval/submission/error retry, Content/Video linked creation, notification delivery and historical staff/deadline attribution need acceptance with an identified authorized account and permitted records.
- No Publish. Database guards already apply to the shared backend, including the published app; UI changes remain unpublished.