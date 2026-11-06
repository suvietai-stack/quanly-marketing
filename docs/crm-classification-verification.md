# CRM classification verification — 2026-11-06

## Implemented
- Existing root IDs retained. Added exactly 7 Trung Gian Quà Tặng and 8 Đại Lý Đồ Thờ segments, active and ordered. Seed uses sibling-name existence checks and never overwrites existing entries.
- Catalog tree with inline add, rename/description/activation, scoped customer counts and atomic reorder. Existing intermediate block hierarchy stays readable. Used segments cannot change parent.
- Existing catalogs/config and customer related_ids carry scoped features; output kind added to existing guarded writer. Group and segment search, active-only new selections, inactive historical labels, confirm/cancel incompatible group changes.
- Historical scoped report source retained. New wrapper filters all customers/schedules/interactions consistently and checks export separately. Eight indicators, segment donut/bar/list, uncategorized main segment, trends and care analysis use unique customer IDs.
- Last completed care timestamp is read only before report as_of and through historical owner visibility; >30 days has explicit UI label, not inferred customer loss. No automatic customer reclassification.

## Verified
- Hosted roots have 7 and 8 active segments; no duplicate catalog names within kind/parent found.
- Hosted customer/contact/schedule counts remain 0 before and after. No business sample customers created.
- `bunx vitest run src/lib/crm --maxWorkers=2`: 35 tests pass, including DB scope/settings/export guards, used-parent rejection, root rules, atomic ordering, scope labels, uniqueness, 100% segment+unclassified, dynamic catalogs and no future-created customers.
- `tests/crm-classification.browser.py`: isolated requests only, 320/390/430/1280 pass search/group dependency, cancellation, confirmation, save/readback, tree add, report filter and unclassified drill-down, no JS errors/horizontal overflow.
- `tests/crm.browser.py`: old create/error/retry/readback/care/history/report flow passes at 320/390/430/768/1280.
- Preview build OK; top-level content route metadata inspected, including index and CRM.

## Not verified
- Hosted authenticated save/read/export/catalog writes and real hierarchy matrix: requester has no matching Auth account for `auth-session --self`; preview is signed out. No other account selected without permission.
- Real mobile keyboard, PWA safe area, real report growth/care quantities: no hosted customer records to analyze.
- Catalog edits change the shared hosted database; frontend is preview only. No Publish and no Zalo activation.

## Interpretation
- Segment table is rendered as mobile-friendly rows rather than a wide table; zero-count dynamic catalogs stay visible.
- Used segment parent changes are rejected, not a mass reclassification. Unused parent edits retain ID.
- Existing report permission model is preserved: personal through crm_use, management through crm_view_scope, settings and export separately; no parallel organization or Role bypass.