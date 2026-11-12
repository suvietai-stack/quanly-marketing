# Personal K3 rollout — 12 November 2026

## Applied
- 0383_k3_personal_company_access: active accounts may use owner-only K3 independently of Biz, with DENY checking. Four nullable org_unit_id columns and company_effective_from added. Existing department attribution retained. No historical backfill, Role row changes or business data writes.
- 0384_k3_personal_invitation_guard: newly personal-only users can search only themselves and cannot originate cross-user invitations; prior Sales collaboration remains compatible. Company hierarchy management remains separate and incomplete.
- k3.use is now editor-ready and suggested for 20 position presets; no live preset application. Other k3 keys are not made Role-ready.
- Existing verified Sales scope/comment/settings gates retained, not replaced by company-wide scope.

## Verification
- 15 personal SQL integration tests, including Marketing/Design/HR/unassigned active, inactive/DENY, own day, quick-create KG/KF/KPI, weekly KG update, day summary, closed week/month summaries, owner denial, directory/invitation denial and rollback preserving records.
- 256 K3/navigation/preset regression tests passed; 63 Marketing/cache/permission-unification tests passed (319 total).
- Fixed a pre-existing flaky test which changed the last digit of a random UUID and sometimes kept the same ID. No application business rule changed.
- Browser authorized Super Admin opened /biz/3k, waited for work loading to finish, opened the creation form without saving; desktop 1280×1800, iPad 820×1180, mobile 390×844 showed no horizontal overflow or page errors. This does NOT verify employee-scoped creation.
- Current build log: build OK. No manual build/typecheck run.
- Live readback: 23 active profiles, 141 goals, 3 days, 3 tasks; four org attribution columns. Dates unchanged: effective_from 2026-11-02, discipline_from 2026-11-06, company_effective_from NULL.
- Counts and Role rows were not changed. 23 active users are eligible under the new gate except explicit DENY; exact effective user count was not directly verified because the read-only query role cannot execute k3_can.

## Remaining blockers / publication
- NOT PUBLISHED. Only Super Admin managed browser session is available. A valid authorized non-Biz employee session is needed for the required live UI create/update/summary/readback and denial checks; no employee impersonation or fabricated live record performed.
- Company manager hierarchy, organization-source permission rollout, cross-unit invitation expansion and comprehensive automation cutover remain pending in the existing company K3 sequence. No Biz candidate migration was submitted, legacy Roles/links remain, Signals 0371 unchanged.
- No migration approval card was required by the platform for these additive changes; both migrations applied directly. No pending approval/tool card exists for these two.
- Full original 132-function snapshot plus schema/readiness/checksums is retained. Rollback restores changed definitions and disables new attribution triggers without deleting additive columns or records. It was exercised on PGlite only, not on production.
