# Three actual Role types — 12 November 2026

## Preview code
RoleCatalog now has exactly three primary group controls: Quyền chung / Role vị trí / Role nhiệm vụ. Existing inline edit → preview → reason → save remains. Common is hidden from create/retype and stays unavailable until the server reports common_role_ready. Individual checkbox readiness requires explicit common_ready AND own scope; no client inference. Role tasks retain marketing_task internally for compatibility. Additional task/position Roles can use the existing audited custom Role create path; no per-employee Roles.

Employee source view separates common, position, task and preserved legacy provenance. The personal matrix remains account_supplement_* additive, independent of shared Roles. Existing explicit DENY wins in the unmodified permission evaluator. No personal DENY editor or new task assignment engine for other departments is introduced in this stage.

## One staged SQL candidate
`docs/pending/role_common_company.sql` is NOT applied. It extends role_kind with common, enforces a single common Role by unique index, inserts role-v2-common with EMPTY permissions and no user_roles links, feeds active-account own-only rules into base_rules and source provenance, exposes readiness/counts and extends audited Role writer/validation. Common cannot be recreated, retyped, archived or deleted from the writer; additions AND held common keys must be backend-ready own personal keys. Pending approval responsibility remains checked on reductions at preview/apply. Private helpers remain revoked; existing function ACL/owner preserved by CREATE OR REPLACE.

K3 use is explicitly NOT ready from Common until the existing single block-application contract is activated and end-to-end verified; its current personal access is untouched. No alternate application rules, timeout changes, bypass, scope widening or changes to Signals 0371/CRM/Biz/3K records.

## Sequential deployment boundary
This candidate DOES NOT redefine slot_previous_source_rows/org_commands/org_slot_rules/org_role_rules or amend the pending shared-position cutover. Apply it only after that cutover is approved and accepted. Its six-function MD5 preflight aborts on changed definitions; if intervening work changes these functions, re-snapshot/review/re-test first rather than overwrite. Backup exact definitions/MD5/ACL/owner and Role rows: snapshot.json, triggers.json, baseline.txt, SHA256SUMS. rollback.sql restores those exact pre-common definitions, removes only the empty newly introduced Role (after archive and reference review), and restores the check/index; never restore over intervening accepted changes. Existing business history and all 56 Roles are preserved.

## Validation
- New PGlite candidate executed byte-for-byte after exact baseline functions: eight tests for single empty Role/no user links, newly active without appointment, locked/pending exclusion, common source counts, unsafe/unit/admin/K3 rejection, reduction guard, unrelated Role preservation, common+position+two tasks+personal union through exact live has_permission, explicit DENY, task revocation and inactive denial. Native scope tests separately cover cross-unit prevention and source ending.
- Regression suites cover manager capacity, four staff holders, multi-appointment scope, 24 slot/canonical parity, 12 titleless mirrors, Marketing eligibility/revoke, personal isolation, auth/cache and K3 personal.
- Desktop/iPad/mobile fixtures: existing Role add/remove → preview → save → read-back; Common unavailable state cannot generate grants; viewer cannot edit. Authorized live Super Admin Preview opens/cancels editing without Role/org writes. Real common Role E2E is blocked because SQL is not applied, and no production test grants are made.
- Route metadata unchanged and verified in preceding editor work; harness build checked after changes.

## Needed owner confirmation
The migration tool applies immediately and offers NO approval card; it was deliberately not invoked. Required explicit consent: “Duyệt role_common_company sau shared-position cutover: thêm một Role chung rỗng, nguồn active-only own-scope, mở editor có audit; không cấp sẵn quyền và không xóa Role cũ.” Shared-position approval remains separate. Production/common activation and Publish are blocked until both approved database stages and live scoped E2E pass. This report is not a claim that all company permissions or generic task assignment are live.
