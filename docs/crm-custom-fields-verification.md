# CRM — six groups and custom fields verification

## Delivered
- Reused existing equivalent root IDs, added missing wholesale/retail roots. Six active official groups; ambiguous legacy wholesale/dealer root retained inactive with review flag, without moving customers.
- Dynamic group files and scoped traits; 39 optional initial custom field definitions, including segment-specific examples. Nine types supported; stable option/field IDs.
- Additive migrations 0280–0282: custom_values, catalog versions, typed/scope/required/option guards, dangerous type-change rejection, subtree-parent protection, dynamic scoped read/report RPCs. Legacy details retained.
- Settings: group/file tree search, traits, custom field definitions/options/scope, other catalogs, existing care templates/access; preview does not save customers.
- Compact form, collapsed details, retained out-of-scope values, confirmation when changing groups, remembered segment during an unsaved group roundtrip. Read-only retained values shown in detail.
- Dynamic filters and selectable analysis; numeric/money/date intervals, distinct multiselect customers vs selections, drilldown, export through existing separate export permission. Reports use historical customer rows and catalog-version snapshots.

## Evidence
- 49 unit/database tests across five CRM test files passed, including nine types, scope, empty/shared mode, omission retention, forbidden type changes, required zero, retired options, historical labels, interval totals, unique counts, report and export guards.
- Browser fixtures intercept all CRM requests and never write production data. Existing care workflow passed at 320/390/430/768/1280. Classification and custom-field save/read/group-roundtrip/settings/report passed at 320/390/430/1280; no page errors or horizontal overflow.
- Latest observed preview build: OK. CRM content route and index have app-specific metadata.
- Hosted inventory before and after: customers/contacts/schedules/interactions all 0; six active groups, 39 custom fields, zero duplicate sibling catalogs. Equivalent IDs retained; legacy root remains stored. No customer, contact, schedule or interaction created.
- 0280 alias ambiguity discovered during catalog normalization; failed statement rolled back; 0282 corrected alias, normalization then succeeded.

## Not yet verified
- Hosted authenticated create/read/change/filter/report/export and actual appointment-role matrix: preview signed out; self-session mint found no matching requesting-user account. No alternative account selected.
- Real phone keyboard/camera/PWA interaction and concurrent real-user edits have not been exercised.
- Production historical field reporting cannot be demonstrated with real CRM customers while CRM contains none; isolated database tests cover definition history and report scoping. Legacy free-text details have not been guessed into typed fields.
- Shared database schema/catalog changes apply to the shared backend. UI not published.