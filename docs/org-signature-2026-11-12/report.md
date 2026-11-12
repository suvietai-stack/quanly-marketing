# Org appointment preview/apply loop — staged fix v2 (NOT applied)
Symptom: Thêm nhân sự into a Biz position loops "Tác động đã thay đổi; cần xem trước lại".
Root cause (live defs): org_change re-runs org_commands_v2 on apply; org_biz_appointment → biz_sync_member INSERTs biz_department_members/team/affiliation rows with random UUIDs, org_projection_sync projects them into org_assignments; private.org_effect_signature includes every membership id.

## v1 REJECTED (security review 12/11)
superseded/candidate-759e816f.sql (sha256 759e816f…6bad) dropped ids for ALL memberships unless the id appeared as a text substring of changes_. Too broad, substring unsafe. Do not approve.

## v2 candidate (only private.org_effect_signature)
A membership gets a deterministic identity `projected:source|user|unit|category|starts_at` ONLY when all hold:
- source ∈ biz_department_members/biz_team_members/biz_member_affiliations with matching category primary/team/concurrent; title_id IS NULL;
- a normalized change (parsed with jsonb_array_elements, no substring) has action='assign', same user_id, same starts_at instant, data.id ≠ row id (never the canonical appointment), and row unit = change unit or its parent in c->'units';
- no change of another action (end/cancel/transfer…) names the row's id/source_id via data.id/assignment_id/source_id/ids[].
Everything else keeps the exact UUID. Multiplicity kept (jsonb_agg, no DISTINCT). units/titles/slots/role_links/permissions unchanged. org_change, org_fingerprint (→ phase3a_previous_fingerprint → exact org_config incl. ids), revision, RLS, grants untouched.
Built-in preflight DO block: aborts unless live md5 = a5b4eead675d66f64472b7553fe48780 and owner/acl = postgres|{postgres=X/postgres}; postflight re-checks owner/acl. Re-running after apply aborts (md5 changed).
Live re-check 12/11 08:37Z: md5 a5b4eead…, owner postgres, acl {postgres=X/postgres} — unchanged, nothing applied.

candidate.sql sha256 29c79563187d9d542298735a0fe9baf7d7994e2305976233ae058858b076ecd0 (3849 bytes, LF, trailing newline)
rollback.sql  sha256 865d5826c963eace95e376eec1b1561a1e3f7ca4a736e4c42907e7fb4b3018e8 (exact live definition)

Tests: src/lib/basePermissions/orgSignature.database.test.ts — 15/15 pass (isolated PGlite): preflight accept/refuse; live def reproduces loop; (1) generated id varies → pass; canonical + two synthetic rows parity + multiplicity; (2) unrelated existing id change fails; (3) canonical id change fails; (4) unit/person/category/status/start/end fail; (5) extra member fails; (6) fake business rows (other user/titled/other time/unrelated unit, or no matching assign) keep UUID; end/ids/source_id-named rows keep UUID; (7) transfer/concurrent parity, mismatched source/category not normalized; (8) legacy ids significant; permissions/role links/slots kept; no position() in SQL.
Not tested: full org_change preview→apply on real Biz tables (needs isolated full fixture or approved apply).
Status: PENDING separate exact owner approval of sha256 29c79563…ecd0. Not applied; no assignments changed.

## Post-apply smoke (12/11 08:5xZ, read-only)
Live md5 1d8ea364154c986e31ce2e705746a03d. Super Admin browser, Kinh Doanh Quà Tặng 2 → Thêm nhân sự → Nhân viên Kinh doanh → Xem trước: org_change preview HTTP 200 in 3.64s, modal "Xem trước bổ nhiệm" rendered, no page errors. Apply requests were blocked at network layer; "Xác nhận bổ nhiệm" never clicked.
Preview impact: before 86 → after 88 memberships; signature has canonical appointment with exact id + exactly 1 `projected:biz_department_members|…` (primary, title null). applied_at null.
HR counts before/after identical: org_assignments 86, biz_appointments 40, dept members 30, team 0, affiliations 1, org_events 40. Only private.org_previews +1.
Unauthenticated org_change: 401. Isolated tests 15/15.
Apply path NOT E2E tested (no rollback-protected authorized transaction available).
