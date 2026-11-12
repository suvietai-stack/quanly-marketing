# Owner execution — 12 November 2026, 04:08 UTC

## Applied to the shared live database
- 0385_org_assign_shared_position: four existing functions replaced, historical slot authorization and legacy title fallback retired. Private ACLs remain postgres-only. Assignment and slot rows unchanged.
- 0386_role_common_company: existing candidate applied after 0385. First attempt timed out and fully rolled back (Common count remained zero); identical retry succeeded. One Common Role, unique index, active-account own-ready source; no per-user Role links.
- Common configured through authenticated Super Admin role_catalog_change preview/apply/readback: leave.view_own, att.view_own, leave.create, att.create. Preview affected 23 users. No admin, cross-unit or K3 permissions.
- Five previously missing empty-position bindings applied through authenticated org_change preview/apply. Bindings 16→21; impact list empty. Reused existing V2 Roles; no new position Role.
- Three block parents attached to org-company through org_change preview/apply; live impact empty and prior block-subtree PGlite parity passed. Company tree is now real, not only presentation.

## Preservation and evidence
Pre/post snapshots: pre.json, post-tree.json. Common catalog and effective readback are separate files. Rollbacks retained in docs/org-repair-2026-11-12 and docs/role-three-sources-2026-11-12; apply Common rollback before position rollback if required, never restore snapshots over subsequent changes.

86 assignments, 25 slots, 25 titles, 13 personal overrides and all 56 original Roles compare exactly before/after tree and binding changes. Common adds one Role (57 total). No DELETE/CASCADE, no Super Admin or system Role changes. Repeated no-op mapping previews during tree execution generated audit events but did not add duplicate binding rows.

Candidate verification: Common migration differs from staged only by trailing newline. 0385 submission inadvertently omitted one coalesce around historical before_data.position_slots inside the restore_slots branch; NULL array produces no rows in either form. This is not byte-identical and is explicitly disclosed; authorization/new-assignment functions otherwise match. No competing functions or reapplication were created.

## Verification actually run
- 18 staged PGlite preflight tests passed before production mutation.
- 371 tests / 38 files passed: position, Role edit, Common, task-source, DENY, scope, provenance, cache, chart and related contracts.
- 722 / 724 domain/auth tests passed. Two pre-existing date-dependent failures remain in src/lib/biz/my-work.database.test.ts (submission period not open). Do not describe the complete suite as passing.
- Browser fixture: fourth staff holder, no slot payload, save/readback at 1280/1024/390; Role tick/untick preview/save/readback and viewer edit denial at the same sizes.
- Authenticated live Super Admin: mapping and tree preview/apply/readback; Common preview/apply/readback; org chart one Marketing staff row; live Common UI desktop/mobile without document overflow.
- Live base_permissions_effective RPC readback for all 26 accounts: 23 active have four Common keys, three locked have zero allowed permissions. Source payload contains common and appointment_role with slot_id=NULL.
- Harness build OK after both migrations. No manual build/typecheck run.

## Not complete / not published
Only the owner's Super Admin session was available. Fixture and privileged readback are not employee E2E. No real fourth employee was assigned solely for testing, no SEO/Content task was withdrawn from a real employee, no personal DENY or account status was altered for tests. Pending/new-user, cross-unit writes, independent-source removal and scoped employee write flows still need authorized employee sessions.

27 ordinary gen1 Roles still have historical FK/SQL dependencies (16 title-link rows across 13 Roles); not deleted. Four protected gen1 system Roles, two Super Admin accounts and personal overrides retained. Biz Role-source and full 3K block-application candidates remain staged; unsupported permissions stay disabled. Generalized non-Marketing Task Roles are not newly activated.

Production database changes above are live; frontend has NOT been published because full scoped E2E and regression acceptance are incomplete. No deploy request issued. Commit records database migrations and evidence, not publication.