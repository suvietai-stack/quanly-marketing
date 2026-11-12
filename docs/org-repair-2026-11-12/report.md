# P0 shared positions repair — 12 November 2026

## Delivered on Preview, not published
- Chart now renders one row per (unit,title), listing distinct effective user IDs. Historical physical slots never become visible title rows. Marketing read-only authorized Admin preview shows one Nhân viên Marketing row with Nguyễn Thị Mai Loan, Trần Thị Bích Ngọc and Trần Thị Julia.
- Chart appointment sends only unit/title; no old slot ID. Existing holders cannot be selected again. Withdrawal selects an effective title assignment; title history retains all old slotted assignments. Staff capacity is unlimited; explicit manager capacity stays enforced.
- Fixed Business title presentation after a future Company parent change: ancestor search stops at block, recognizing stable biz-block ID rather than losing titles at Company root.
- Desktop 1280, iPad 1024, phone 390: actual components create/preview/confirm/read-back with isolated data, no real writes. Existing-holder denial, title-only target and no per-person labels verified. Authorized live Preview chart read only passed. No employee session impersonation.

## Root cause and SQL candidate (NOT APPLIED)
Live private.org_commands(jsonb) MD5 c759e726c6c627bbae8f113db9e0f285 still requires a physical slot whenever old active slots exist. The insert-freeze prohibits creating those slots: UI and backend models conflict.

`docs/pending/org_assign_shared_position.sql` replaces that single obsolete guard with a fail-closed (unit,title) mapping check: standard generation>=2 non-system position Role, excluding Admin/Super Admin. A transaction advisory lock serializes existing overlap/capacity checks for that pair. All old validation, authorization, audit wrappers, business sync, non-null slot history guard and ACL remain unchanged. No row updates, RLS edits, grants, new Roles or legacy cleanup. Exact baseline MD5 prevents applying over a concurrent patch.

PGlite executes exact live DDL: original fails with “Chọn một ô vị trí còn trống”; candidate accepts two slotless staff. Missing/gen1/system/task mapping denied; locked staff/cross-unit/self-manager/overlap/capacity denied; future cancellation preserves row. Private function execution denied to authenticated/anon. Exact live resolver outputs match for all 24 existing effective titled assignments when only that source is represented slotlessly; all 12 simultaneous titleless mirrors yield no position Role. This is source-key/unit/Role parity, not a claim that all live modules were exercised as employees. Existing appointment Role suite covers DENY and unrelated source preservation.

102 tests / 8 files pass. Latest observed preview build OK. Clone fixture is not production create E2E.

## Separate Company tree change (NOT APPLIED)
Three current root blocks have parent_id NULL. `tree-parent-preview.json` contains only three audited org_change unit deltas to parent org-company. Existing org_change unit command already logs org_parent_history and enforces scope. Use this writer, not raw row UPDATE or a migration that circumvents projection guards. PGlite exact org_unit_subtree: Company 1→16; Business/Marketing/Operations subtrees unchanged; rollback transaction restores 1. Company scope necessarily expands, so company-level role/action and RLS impact must be checked via owner-authorized preview before apply. This is NOT yet live staff/admin scope acceptance. Direct read-only execution of the private subtree helper was refused by ACL; privileges were not widened.

No parent migration was submitted: data-only changes must use the audited org_change flow; do not bypass guards with a competing migration. Rollback is reverse audited unit deltas (parent=NULL), retaining both histories and rechecking current baseline. Full workflow preview/apply scope evidence remains pending.

## Five empty mappings (NOT APPLIED)
`missing-position-preview.json` proposes existing Role IDs: Marketing head→role-v2-mkt-head, Design head→role-v2-design-head, Stock accountant→role-v2-account-stock, Procurement head→role-v2-proc-head, Packing→role-v2-packing. All five titles have zero effective holders; IDs and generation/non-system eligibility verified. No inferred Role creation, no grant changes. Requires separate audited preview/impact acceptance before persistence.

## Backup and approval
`functions.json`: exact DDL, identity args, MD5, owner, ACL of eight relevant helpers. `rows.json`: exact organization rows (86 assignments,25 historical slots,16 mappings,56 Roles,25 titles,16 units,4 parent histories). `rollback.sql`: exact original org_commands; no restore executed. SHA256SUMS protects backups. Final readback in live-final.json confirms original command and counts; other users may independently change data.

Tool `lov_database--migration` applies immediately and has no approval card. Therefore it was deliberately NOT called without explicit consent to this exact new patch. Approval requested: **“Duyệt org_assign_shared_position: thay guard ô trống bằng mapping Role V2, thêm khóa kiểm tra vị trí; không đổi dữ liệu/quyền, chưa Publish.”**
After consent: apply byte-exact candidate with that tool; read back DDL/ACL/hash, then authorized org_change clone/live-safe E2E before Publish. No production employee test records permitted in this request. Tree parent and five mapping proposals remain separately audited data changes, not included in this SQL approval. Biz 17-key backend, Signals 0371 and 3K pending changes remain independent and untouched.
