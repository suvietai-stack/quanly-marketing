# CRM Khách Hàng — verification, 2026-11-06

## Implemented foundation
- Separate CRM tables/RLS/RPCs, organization-derived effective permissions, own versus employee monitoring, Admin-only grant management and separately guarded export.
- Editable stable-ID catalogs: 3 primary groups, 11 blocks, 33 segments plus priority/relationship/source/outcome/goals/contact roles/traits. No operational demo customers.
- Organization/personal profiles, optional immediate appointment saved atomically, contacts, addresses, guarded private file uploads/downloads, history, transfer/archive.
- Independent appointment/recurring/seasonal schedules, unsuccessful attempts remain pending, recurring completion creates a single next schedule, original deadline preserved when rescheduled, immutable interactions and schedule snapshots.
- Scoped period report with zero-denominator rates, customer distribution/activity charts, comparison, detail lists and basic factual insights. Export rechecks its own permission.
- One shared navigation entry, automatic launcher/pin integration, mobile dialogs and touch controls; Base-only daily deduplicated reminders on the existing authenticated pulse. No Zalo/Push eligibility.

## Verified
- 52 tests across CRM logic/database/administrative baseline, navigation/launcher and business-permission regression passed.
- Browser fixture with intercepted requests: 320/390/430/768/1280, create → error → retry same request key → read back → interaction → history → report, no horizontal overflow or JS errors. These are isolated verification, not production acceptance.
- Actual protected `/biz/crm` without session redirects to `/login`; requesting-user session mint has no matching Auth account. Authenticated end-to-end acceptance remains blocked.
- Hosted schema reads confirm ten CRM tables. Hosted catalogs present. Operational customer count is zero; no test customer was written to the shared backend.
- Preview build signals show build OK.

## Remaining acceptance and limitations
- Sign in through Preview and identify authorized real customer/schedule inputs to verify create/edit/read/report, transfer, private uploads/downloads, notifications and exports end-to-end.
- Full live organization hierarchy/appointment transition matrix and intraday transfers need acceptance against real appointments; isolated tests exercise the shared scope boundary with controlled fixtures.
- Administrative baseline is 2025 two-tier data; subsequent local legal changes are not automatically updated.
- Advanced configurable group-specific fields, fixed month-day recurrence, richer calendar navigation, related-group/block/long-uncontacted/need-without-follow-up analysis and full organizational roll-up comparisons are not complete. Current report covers primary-group distributions and basic employee comparisons.
- Personal care templates can be stored by RPC but the current template editor is reached from Settings; a Sale-only personal template management surface remains incomplete.
- Do not claim the full 1155-line specification is accepted. No Publish performed; shared schema changes are live and additive.