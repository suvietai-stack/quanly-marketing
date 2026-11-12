# Actual grantability expansion — staged, NOT APPLIED

## Decision and counts

Read-only production capture: 2026-11-12 11:39–11:45 UTC.

| Measure | Result |
|---|---:|
| Catalog / modules | 510 / 24 |
| Existing editor policy / personal entries | 43 / 15 — unchanged |
| Existing source-readiness union | 199 (org 120, specialty 99, overlap 20) |
| Proven own/selected-person semantics in all four sources after this candidate | 8 |
| Newly universal keys | **2** |
| Remaining keys without universal enforcement proof | **502** |
| Of those 502: source-ready but not universally proven | 191 |
| Outside both readiness lists | 311 — not a claim that all lack enforcement |

Existing UI/validator intersection is 12 keys. Candidate intersection becomes 14, but six Order keys are grandfathered compatibility, **not newly certified secure**: order.view, order.view_mine, order.take, order.update_draft, order.submit, order.history. Orders still have permissive active-user policies; this package neither changes those policies nor adds any Order capability. Do not call all 14 newly secure or all 510 unlocked.

The eight proven own/selected-person keys are leave.create, leave.view_own, leave.edit_own, leave.recall, att.create, att.view_own, att.edit_own, att.witness. Before this candidate, six of these were universal; both edit_own keys worked in Common/position/personal but failed Marketing task validation. All 510 discovery/classification rows are in audit-510.json; literal references are discovery evidence, never enforcement proof.

## Exact new keys and enforcement proof

| New universal key | Module | Actual server enforcement |
|---|---|---|
| `leave.edit_own` | Đơn Từ & Phê Duyệt | `public.leave_update`: locks requested row FOR UPDATE; owner_id=auth.uid AND sig_can(edit_own), otherwise needs separate edit_others. Only pending rows; existing leave_prepare validates payload, approver, self-approval prohibition and deadline/late reason. This candidate never enables edit_others/approve/exception. |
| `att.edit_own` | Đơn Từ & Phê Duyệt | `public.att_update` and `att_recall`: FOR UPDATE, owner_id=auth.uid AND sig_can(edit_own), otherwise needs separate att.manage. Recalled/reconciled workflow restrictions remain; att_update retains att_check/date/witness checks. |

Source trace: Common → common_permission_ready → common_role_rules; position → org_slot_rules using unit/title binding; task → role_editor_validate + mkt_specialty_permission_ready → org_assignment_specialty_rules/mkt_specialty_rules; personal → staff_permission_validate → actor-bound preview → locked additive save with audit. Then base_supported → base_tier1/base_decision → has_permission/sig_can. Both keys were already org-ready and supported before this candidate, so **base_supported and legacy fallback behavior do not change**. Explicit DENY is checked before fallback; inactive users remain denied.

## One minimal executable candidate

Directory: `docs/role-grant-expansion-2026-11-12/`.

- Replace only `private.mkt_specialty_permission_ready(text)`: add the two exact keys.
- Replace only `public.permission_editor_read()`: expose the current universal intersection as `grantable` for the existing shared editor.
- Existing permission_editor_policy, common_permission_ready, common_role_rules, role_editor_validate, staff_permission_validate and preview/save need **no edits**: both keys are already present as own+personal, org-ready; changing their real missing task readiness removes the kind rejection without bypassing it.
- No schema, RLS, GRANT/ACL, resolver, role grants/defaults, appointments or employee writes. No frontend patch or publication is needed.
- Preflight asserts exact function definitions, owners and ACLs for both changed functions and 34 dependencies, 510/24 catalog, and no existing specialty/task Role containing either new key. Locks app_roles/mkt_specialties before preflight. Unexpected baseline aborts the transaction.
- Live capture found no task Role, active specialty Role or override with either key; applying this candidate therefore does not implicitly activate an existing dormant task grant. Common's existing seven rights remain exactly untouched.
- Rollback restores exact definitions and rejects changed-function conflicts. It does not undo any separately authorized grants made later; such grants require their own audit/restore.

**Candidate SHA256:** `3c4b23f8d31c75811aabd490bf0a1fffb298bc8385175db21d18b3afa4085bd7`

**Rollback SHA256:** `ab74debdc2a4817232faa2139a1d3b4f8764306a3843b5b2800b2e79ae6cc5d6`

backup.sql holds executable original definitions; snapshot.json captures exact definitions/ACL/owner and original catalog. SHA256SUMS covers the package. The prior ac37… no-op candidate is not used or requested for approval.

## Verification

**17 new isolated tests PASS; 61 targeted tests PASS; preview build OK at 11:44:53 UTC.** New tests execute actual captured validators, source emitters, has_permission, base_effective, personal preview/save and native attendance recall/leave update. They prove exact two-key expansion, all four sources, DENY, inactive/expired/non-Marketing sources, owner/workflow rejection, privileged/unit/3K exclusion from universal readiness, self/admin protection, stale/expired preview rejection, conflicting saves, exact rollback and preflight fail-closed.

Concurrency coverage is **queued competing saves in one PGlite connection**, plus conflict-fenced rollback/preflight. It is not a two-connection PostgreSQL lock contention test; that remains UNTESTED. Leave_prepare is a fixture boundary in the own/pending mutation test; its full live definition was read, not modified. Full department/3K/CRM/financial workflows are not certified by these tests. No production write/preview/save was used.

Readback at 11:45 UTC: **57 Roles / 88 assignments / 13 overrides / 2 Super Admin links**, all three role/assignment/override fingerprints identical to capture. Task readiness function MD5 remains `318e90477714f4b34efaf9e7efd3aa6a`; candidate is not applied.

## Concrete remaining gates, not a redesign

- `k3.use`: common_permission_ready explicitly excludes it; personal policy already admits it, while k3_can/native eligibility remains separate. No universal checkbox for it in this candidate.
- `web.view`, `web.content_view`, `web.keyword_view`: already specialty-ready, but org_slot_rules filters org_role_permission_ready; common_permission_ready requires own+personal; policy marks them assigned/nonpersonal. Real expansion needs proof of project/task ownership in each server gate and a source-safe common/personal path. Do not simply promote them to own.
- `ot.view_own`: org-ready but not policy/task-ready; audit private.ot_can/order visibility and task-assignee scope first. This is the next small cross-module candidate to investigate, not included here.
- Unit/company rights: require bound scope from the same granting source; Common/personal have no such binding. Preserve this restriction rather than granting unscoped access.
- Legacy fallback and permissive Order policies remain existing risks; no automatic widening, retirement or RLS work is bundled here.

## Remaining owner step

Approve **only the exact new candidate SHA256 above** if accepting these two additional universal capabilities. After approval: rerun preflight, apply once, read back checksums and test employee effective/native behavior without changing any real Role grants. Full 510 grantability is **not completed** and is not what this candidate claims.