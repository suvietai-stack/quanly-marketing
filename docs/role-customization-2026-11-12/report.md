# Role customization — 12 November 2026

## Actual status
NOT COMPLETE: frontend is compatible and truthful; production still has 510 catalog keys, 43 reviewed policy entries and 15 personal entries. This release does not claim all 510 can be granted. No SQL, Role permissions, override or personnel mutations were applied.

## Live diagnosis
- permission_editor_policy MD5 5df07db9d70790a174e3078520314162 is a literal 43-row review list. It is NOT the complete catalog.
- role_editor_validate MD5 9e5fa1a93890aaa486fe9d1674a4c1c2 intersects that list with source readiness; Common additionally uses common_permission_ready; personal validates personal=true. Native readiness lists contain many more keys, but a list entry does not prove target-scoped enforcement or safe propagation.
- Common emits own scope, positions emit native scope+unit from the same assignment, Marketing emits own scope and checks active eligibility. Direct Role links and legacy overrides remain separate transitional paths. Unifying these blindly could activate permissions already present in stored Roles, including old unused rights, without an owner explicitly choosing a new grant.
- role_catalog_change still enforces actor-bound previews, fingerprints, system/Common protection, immutable signal scope and pending-approver reduction obligations. Personal preview/save protects self/SuperAdmin, live legacy replacement and audited additive changes. No bypass was added.

## Safe frontend changes
- Full server policy is passed to the same Role checklist for every kind; shared permissionControl determines selectable, retained, scope-required and unavailable. Personal uses that same helper; inherited sources/DENY remain separate from checked supplemental state.
- A checked but unsupported NEW draft key cannot enable itself or pass the local preview guard. Historical held keys may remain or be removed, still subject to server obligation checks. No unsupported additions are filtered silently or saved.
- All preset suggestions are visible regardless of Role kind; actual suggested keys still intersect current server-supported source capability. Changing a draft Role kind no longer silently clears its permissions.
- Full 510 catalog retains actor-keyed lazy loading. Role counters explicitly separate selectable keys from unavailable keys, rather than equating catalog presence with grants.
- Unit-only unavailable grants show the missing source/unit contract, not a fake scope selector. Existing signal scope remains locked by role_catalog_change; this release does not invent a setter.

## Isolated candidate — NOT broad expansion approval
candidate.sql is a contract-only normalization of private.role_editor_validate for 12 existing own permissions shared by Common/position/task/personal. It deliberately modifies NO resolver and changes NO existing acceptance result across 510×3 isolated validation cases. It therefore DOES NOT unlock additional permissions, and applying it is not a fix for the missing 467/495 grant capabilities.

Exact keys are in keys.json: leave.create, leave.view_own, leave.recall, att.create, att.view_own, att.witness, order.view, order.view_mine, order.take, order.update_draft, order.submit, order.history.

Candidate SHA256 c36e7c706bddae96ac506510aadedcb37b4a3dca7ec37c3ba95f947c885cc507.
Rollback SHA256 17b2ae9bab5ef188b646d1896ddb1a3c670f7d8fcc843b859e6dce7d0742919c.
Preflight pins exact MD5, postgres owner and {postgres=X/postgres} ACL. snapshot.json contains captured definitions/catalog/counts; backup.sql is SELECT-only. Rollback restores exact captured function definition. No grant/default/table/policy/source is changed.

An initial unapproved draft adding leave.edit_own/att.edit_own to Marketing readiness was discarded before committing because changing a resolver can activate stored Role rights without a fresh grant. The final candidate does not include that change.

## Remaining implementation — BLOCKED on scoped contracts, not blanket approval
catalog-audit.tsv lists all 510 keys and separates 12 reviewed own-contract keys, existing source/scope contracts, privileged audit and unreviewed native audit. These are conservative audit statuses, NOT a claim that all remaining keys lack implementation.

1. Extend native ownership/workflow proofs per module; inspect all RPCs/RLS and pending responsibility semantics for each proposed key.
2. Build same-source scoped rules for Common/direct/personal/extra Roles before opening unit or company permissions. Do not combine a permission from one Role with another Role's unit.
3. For each readiness expansion, inventory stored rights and build an explicit pending/activation fence so previously inert keys cannot automatically become effective. Include baseline/rollback, inactive/DENY, scope, changed approver and before/after parity. No production grant changes until separate exact approval.
4. Only after that can an expansion candidate add reviewed keys to policy and propagation; no approval-ready broad-expansion SQL exists yet. Biz/CRM/K3, finance, Design and privileged settings require their own native-contract reviews; the current frontend leaves them unavailable as appropriate.

## Preview verification (no apply)
Existing authorized Super Admin on local preview: Common, Sales position, SEO-family task and personal all allowed toggling leave.create. For Role previews the key was restored before preview to avoid creating a real pending reduction; three previews returned 200 with added/removed=0, followed by Cancel. Personal prospective addition returned 200 then Cancel. Never clicked save/apply; network blocks all write RPCs except preview metadata. First attempted Common reduction correctly returned 403 from the obligation guard; it was not bypassed.
87 targeted tests pass, including 510×3 exact validation acceptance parity, exact isolated rollback, scope/DENY/inactive/approver regressions. Automatic build OK. No authenticated employee impersonation. Full production preview verification remains to be appended after publishing.

## Release and actual acceptance
- Code captured in maintenance checkpoint aec07923; final reviewed candidate/report commit 6d22f739. Published once to https://base.suviet.vn/organization.
- HTTP200 at 10:22:31 UTC, deployment header core d3fae7ff-63db-4e40-8e83-b31d8a312853. Initial browser during transition saw old labels; a fresh browser subsequently confirmed new data-capability=selectable markers and four preview RPCs HTTP200 with no page errors. Common/Sales/SEO-family Role previews had no added/removed keys (toggle then restore), personal had one prospective addition, all cancelled and never applied.
- All 398 Base permission tests pass across 43 files. Build OK. Scope/DENY/inactive/current-approver rules stayed unchanged.
- Before/after exact hashes match for 57 Roles, 88 assignments, 13 overrides, two SuperAdmin links. Validator MD5 remains 9e5fa1a93890aaa486fe9d1674a4c1c2: candidate NOT applied. Only preview ephemeral metadata was created.
- Live policy remains exactly43 unique keys/15 personal, not86/30 (two repeated policy reads were deduplicated in final instrumentation).
- Mobile preview acceptance FAIL: opening Common edit then focusing search returned to read-only, checkbox disabled; screenshot shows no active Cancel button. No error alert or permission write. Suspected focus/selection behavior is unconfirmed; attempted local selector guards did not solve it and were removed. Do not claim mobile editing passed; this remains a concrete UI blocker to diagnose separately without broadening rights.
- Broad all-Role/individual configuration remains NOT COMPLETE: expanded native contracts and activation fencing are still required. The staged contract-only candidate is explicitly not a broad unlock; do not ask owner to approve it as that fix.