# Org appointment preview/apply loop — staged fix (NOT applied)
Symptom: Thêm nhân sự into a Biz position loops "Tác động đã thay đổi; cần xem trước lại".
Root cause (confirmed from live definitions + owner evidence): org_change preview and apply each re-run org_commands; for biz_positions the projection trigger inserts biz_department_members/team/affiliation rows with random UUIDs, projected into org_assignments. private.org_effect_signature includes every membership id, so preview and apply signatures always differ.
Fix: one function, private.org_effect_signature. Membership id is kept only when the id is named in the normalized change (canonical appointment / end / transfer targets); other memberships compare by unit/title/user/category/slot/start/end/status as a multiset. Permissions, role_links, slots, units, titles unchanged. No change to org_change, fingerprint, revision, RLS, grants, capacity, Super Admin guard.
Preflight (live 12/11 08:30Z): md5 a5b4eead675d66f64472b7553fe48780, owner postgres, acl {postgres=X/postgres}, LANGUAGE sql IMMUTABLE.
candidate.sql sha256 759e816f995ce6ca8bb280f91a73ecf189948dd8595b9309f797a8dc19e86bad
rollback.sql  sha256 865d5826c963eace95e376eec1b1561a1e3f7ca4a736e4c42907e7fb4b3018e8 (exact live definition)
Tests: src/lib/basePermissions/orgSignature.database.test.ts (6, isolated PGlite): live def reproduces mismatch; candidate parity across random projection ids; canonical id kept; fails on unit/person/start/end/status/extra member; tampered canonical id; permissions/role links/slots.
Not tested: full org_change preview→apply on real Biz tables (needs isolated fixture or approved apply); assumption that projected starts_at is deterministic (owner evidence says only id differs).
Trade-off: an unchanged pre-existing row whose id alone changes would not be detected — not a meaningful permission/org effect; baseline fingerprint still guards concurrent writes.
Status: PENDING exact owner approval. No SQL applied, no assignments changed.
