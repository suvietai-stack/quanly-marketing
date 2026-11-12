# Executive Role A — controlled production execution

## Applied
- Only `role-v2-executive` changed through the authenticated Super Admin `role_catalog_change` workflow.
- Preview: `2413db79-9942-46c8-9cdf-72f8b5a58a57`; added `ot.view_unit`, removed `[]`, affected one current holder.
- Applied at `2026-11-12T06:22:54.639794Z` (13:22:54 Vietnam).
- Audit: `c781d0a8-d5df-410d-9637-fd8285dabc44`, with explicit owner decision, retained blocked reduction and no bypass.
- Actual `base_permissions_effective` readback: `ot.view_unit` ALLOW, source `appointment_role`, role `role-v2-executive`, unit `org-company`, assignment `78d9cae4-877b-4639-b9ae-0a1c58c9e632`, slot null, no bypass.
- Scope is orders whose sale/supply has a current organizational assignment inside the Company subtree; it does **not** prove visibility of unassigned/historical-only records or every report. No write/approval permission was added.

## Current 15 permissions
`leave.recall`, `leave.view_own`, `att.view_own`, `leave.create`, `att.create`, `leave.view_assigned`, `leave.approve`, `leave.view_all`, `leave.edit_others`, `leave.reassign`, `leave.cancel_handle`, `leave.exception`, `leave.report`, `leave.export`, `ot.view_unit`.

## Blocked reductions — A not fully achieved
- `leave.edit_others` allows editing other pending requests, including changing reviewer in the payload.
- `leave.reassign` can change a pending request reviewer without current-assignee restriction.
- `leave.cancel_handle` combined with view-all allows deciding cancellation beyond the assigned reviewer.
- `leave.exception` is not pure read and is outside the requested read/assigned-approval model (current leave_prepare separately allows late reason submissions).
- Attempted removal of these four through the authorized preview was rejected with code 42501: unresolved approval obligations. Two pending requests assigned to the current executive were independently confirmed: `8c767733-863d-4f77-bfae-aea36f23b492`, `0ae59f7d-57d9-481d-ab04-1074408df774`.
- The guard remains intact; no request was approved, reassigned, cancelled or otherwise altered to bypass it. These four permissions remain, so **the live Role is not yet fully compliant with A**.

## Module audit and gaps
- Leave: existing view-all RLS permits company-wide read. `leave_decide` requires permission, matching approver, pending status and different owner. No new approval key needed.
- Attendance: att.view_all is a read-only RLS branch; editor rejected its addition.
- Quotes: oq.view_all excludes other people's drafts; rejected, not claimed full access.
- Tracking: company-source ot.view_unit admitted; ot.view_all rejected. No new manage/reconcile/reschedule/supplier/report keys.
- Design Orders: view-all keys exist in readiness but editor rejects addition; live permissive active-user policies coexist with design_scoped_read. Whitelist is not evidence of safe role-gated authorization. No order.approve or marketing_design.approve added.
- Signals: scope helper still contains legacy slot/title/user-role paths, while canonical provenance uses position sources. signal.view_all rejected; no scope flags changed or full visibility claim.
- CRM/Biz: CRM eligibility and legacy business guards remain; biz.crm_view_scope rejected. No eligibility bypass or cross-module admin.
- Finance: fin_can_see restricts read by transaction owner/source; view_totals does not expand transaction visibility. finance.incoming.view_unit and view_totals rejected; no manage/reconcile/manual_manage added.
- Overview: overview.view rejected. Other content/web/social/video/task/KPI/3K manager and approvals remain outside admitted company-wide read policy; no expansion.
- Nine read candidates were actually rejected through authenticated role preview, not inferred only from the 120-key whitelist.

## Safety evidence
- Pre-role snapshot `/tmp/browser/executive-a/before.json`, SHA256 `b0f1000b574aa836fa7bbd29ee6b231f08f4a6b1f68ce4e2828385d128aa8bc3`.
- Related baseline `/tmp/browser/executive-a/baseline.json`, SHA256 `476743e41da6700b0cd7eef5cbacd145d8f19173368f9c4f8073cd367f2ec74f`.
- Before/after compare preserves 56 other Roles, Common seven keys, 13 overrides, two user-role rows, 86 assignments, 21 bindings, 16 units, 25 titles and all profile business fields. Profile last_seen_at/updated_at changed during concurrent normal activity; not falsely reported byte-identical.
- Snapshot and original proposal stored for reviewed recovery; no direct table rollback, competing migration, RLS change or permission-policy expansion. Re-adding removed old keys would itself need valid editor policy; no unconditional rollback promise.
- 28 tests passed across four files, including five new concrete current-reviewer/permission/self/status/valid-decision tests. No production negative write was attempted without an authorized employee session.
- Latest observed preview build log: build OK. No application presentation/runtime code changed; only regression tests and documentation.

## Production and verification limits
- Dynamic Role change affects the shared production database immediately; no deploy requested.
- `https://base.suviet.vn` returned HTTP200. Existing deploy identifier began `psr2.7c506329-c45c-4580-84a4-9f89361742d8`; no claim of a new release.
- Authenticated production organization smoke timed out; local organization chart loaded but Role catalog selection timed out. Consequently, the 15-key UI display is **not verified**, despite successful authorized catalog/effective/audit readbacks.
- No executive employee session was minted or chosen without approval; real employee RLS/UI end-to-end and approval interactions remain unverified. No full-company/full-A completion claim.