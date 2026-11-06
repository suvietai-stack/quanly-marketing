# Signal potential and mobile verification

## Implemented
- Additive potential fields default old signals to `unrated`; guarded RPC records actor/time and shared history without private-label payloads.
- Stable-ID shared/private labels, rename/hide/reactivate, scoped label-link reads; authenticated write privileges explicitly revoked after hosted default-grant inspection.
- Atomic enrichment saves lock signal, validate scope/label ownership and follow-up dates, deduplicate actor/request ID with payload equality. Manager edits preserve other users' private links.
- Mobile cards, five work quick filters, detailed bottom filter sheet, user-scoped session preferences and work sorting from existing appointment/progression deadlines.
- Independent potential/label/follow-up update form with retained values after errors and same request ID on retry.
- Report potential distribution/rate/stage/overdue charts; exact filtered denominator; actual close-date trend. Existing status transitions, assignment, rewards, contact buttons and external integrations unchanged.

## Checked
- 122 signal tests passed, including PGlite execution of migrations 0255–0257; permission denial, private labels, rename, dedupe, report filters, old unrated data, priority ordering and workflow regressions.
- Isolated browser checks at 320/360/390/430 and 1280: potential + multiple labels + follow-up, failure retention, request-ID retry, list readback, filters persisted through reload, report rendering, no page overflow or JavaScript errors.
- Hosted read-only verification: 573 signals, all 573 unrated; nine shared labels; authenticated INSERT/UPDATE/DELETE denied on new tables. No real signal record changed for tests.
- Preview build monitor: build OK.

## Not verified / deliberately excluded
- Hosted authenticated acceptance blocked: Preview signed out; `auth-session --self` has no account matching requester. No other account was selected. User must sign in before real Sale/manager and existing Zalo acceptance.
- Isolated browser traffic is mocked and is not evidence of hosted end-to-end acceptance or a physical keyboard/device check.
- No new Tạm hoãn status, invented probability, automatic CRM sync or fake operational data.
- Existing expected opportunity value is absent from the source data: value sorting uses recorded revenue only, never treats it as an estimated opportunity amount.
- No Publish; backend migrations/data categories already apply to shared Cloud.