# Cutover extension — 12 November 03:39 request

Same candidate `docs/pending/org_assign_shared_position.sql`; no duplicate migration created or sent.

## Implemented code
New creation explicitly refuses legacy slot targets (not merely hiding labels). AppointmentTarget no longer contains slotId. Existing assignment history and FK remain untouched. Fourth-holder browser flow works at 1280/1024/390; authorized live Admin Preview is read-only.

## Staged SQL cutover, NOT applied
Four existing functions only: org_commands, org_slot_rules, slot_previous_source_rows, org_role_rules. Existing named function ownership/ACL preserved by CREATE OR REPLACE; no new public entry point. MD5 checks cover all four baselines.
- Reject new non-null slot target, replace obsolete empty-slot requirement with V2 pair check; staff legacy capacity is ignored, manager explicit capacity/overlap/auth/Biz workflows retained. Pair advisory lock prevents concurrency gaps.
- Every effective titled assignment receives its Role from org_position_roles, regardless of historical slot_id. Physical slots are not read for permissions. Keep 86 assignment rows/25 referenced slots as provenance; no destructive backfill.
- Source explanations read the same canonical position, removing slot/title_legacy provenance sources; Marketing specialty/direct branches unchanged, two Super Admin direct grants intact.
- Retire legacy title-rule fallback rather than allowing inactive links with enabled_permissions to revive when slotless records are added. Existing DENY resolution is not changed.

PGlite exact source-key/unit/Role parity passes for all 24 effective titled assignments; removing physical slot data entirely does not change candidate outputs. Twelve titleless mirrors receive no position Role. Poison legacy fallback cannot grant unsafe.legacy. Fourth staff and explicit manager capacity tests pass. 136 tests/9 files including canonical scoped DENY regression pass. No production write E2E claimed.

Exact source/slot/role rollback definitions plus original command backup retained. Do not restore production without a failure. No Signals/3K/CRM/Biz17 function changed.

## Hard cleanup and tree — not complete
27 non-system gen1 roles: no direct users, position bindings, slot references, specialty or business-exception references at current live read, but 16 old title FK rows reference 13 Roles, and old SQL catalog/cleanup helpers still mention IDs. Inactive links are not proof of zero authorization. Keep 4 system Roles and 2 Super Admin rows. No DELETE/CASCADE attempted. Role deletion requires archival audit/restore and catalog recreation guard after canonical cutover acceptance. See gen1-deletion-audit.md.

Three block parents and five empty mappings still require separate org_change preview/apply scope verification. Data-only attach migration is rejected by the platform's DDL-only migration contract, so use existing audited writer; never bypass its projection guard. Company subtree clone expands 1→16 while all block subtrees remain the same, but live scope E2E has not been accepted.

## Exact approval needed
`lov_database--migration` applies DDL immediately; it offers no routine approval card. It was not called because prior consent to the one-guard proposal does not prove consent to this expanded four-function source cutover.

Owner confirmation: **“Duyệt áp org_assign_shared_position bản cutover 4 hàm: bỏ nguồn slot và fallback title cũ, dùng mapping V2, giữ lịch sử/ACL/DENY; chưa xóa Role/slots.”**
After confirmation, submit this exact candidate once, verify function MD5/ACL and live scoped org_change behavior; only then publish the frontend. Tree/empty mappings and gen1 deletion remain separate audited changes. Migration history inspect returned “migration tree exceeds inspection limits”; no history repair/replay was attempted.
