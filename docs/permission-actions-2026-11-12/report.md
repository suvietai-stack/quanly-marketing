# Working per-action backend implementation — STAGED, NOT APPLIED

## Delivered
- Existing `tasks`, `social_posts`, `socials`, `websites`: four restrictive SELECT policies and four BEFORE write triggers, six narrowly scoped helper functions. No schema/Role/employee changes, no production writes.
- **51 concrete permission checks**: Task 20, Social 23, core Web 8. Exact keys: `enforced-keys.json`. These are implemented action/read checks, not 51 new Role grants and not a claim of 510 secure actions.
- All checks call the existing unified `has_permission` gate; no role-kind/department restrictions. With the separately staged full-510 resolver installed, personal DENY wins; without it, current backend restrictions still apply. The test fixture loads that exact resolver candidate, not a mock permission flag.
- Direct authenticated SQL tests exercise real RLS plus triggers, including Common/position/eligible Marketing/personal reads, DENY, inactive, own/all scope, wrong actor/stage, self-approval, specialized fields, spoofed identity/audit, stale concurrent completion and rollback.
- Baseline read-only: 510 catalog, 57 Roles, 88 assignments, 13 overrides, 2 Super Admin links. Role fingerprint `9f579679928570fcb221e4177065be8e`.

## Approval artifacts
- `candidate.sql` SHA256: `efea2ebde19329f6b9cbd2603f7b1050087fe3f0c8aefefad650b633aab4539e`.
- `rollback.sql` SHA256: `d612a9a119b0e00bed4bc035893b3f806a8479d60f8832d994f025ad4f2d89b9`.
- `snapshot.json`: read-only exact helper definitions, policies, trigger definitions, table owner/ACL and catalog.
- `backup.sql`: read-only metadata snapshot command; capture privately immediately before approved application. This package alters no business rows; it requires no export of staff data.
- Candidate aborts on helper definition/owner/ACL, table owner/ACL, policies, triggers, Role fingerprint or catalog drift. It never silently overwrites existing helper names. Rollback checks exact helper body/owner and drops only this package, no CASCADE or business data deletion.

## Safety and compatibility limits — not ready to auto-apply
- Full-510 candidate `4a0eb2cf…44ae` remains separately unapproved. Applying that resolver changes helper definitions, so this package's dependency preflight **must be restaged against the approved resulting baseline**, with a new SHA, before applying both in sequence. Do not bypass preflight.
- Existing UI has shortcuts: Social writer actions bypass `can`, some forms combine generic edit and special-field permissions, store mutations are optimistic. This staged backend rejects unauthorized shortcuts rather than accepting fake grants; client integration/ordinary-actor acceptance must be completed before cutover.
- `view` is necessary for reads; without `view_all`, only original creator/explicit involved actors see a resource. Names resolve only if unique; stable IDs win. No unassigned reviewer is treated as an arbitrary eligible approver.
- Generic edit cannot modify assignee/deadline/priority, publication or workflow identity using an unrelated key. Task approver replacement after work starts and pending Social reviewer replacement are blocked. Audit actor/time and processing counters are server-authored.
- Restrictive reads intentionally reduce the former active-account-wide API visibility; not a read-parity/no-impact migration. Existing Role defaults are untouched.
- SELECT currently returns the entire row JSON: separate history-only/link-only/secret-field read permissions are **not** fully enforced by this package. They are explicitly outside the 51-key count; do not claim otherwise.
- No new anonymous or service-role privileges; protected Super Admin bootstrap retained. Service/maintenance operations without a user retain existing trusted paths.

## Remaining concrete work
Live catalog counts differ from earlier estimates: Web 114, Design 83, Social 34, Task 27, Finance 28.
- Web: content workflow, technical checklist, keywords/topics, entities/password projection, backlink/PR, growth, reoptimization and field-specific reads remain (106 keys not covered here).
- Social: growth/report and history/mine-mode and info-specific controls remain (11 keys).
- Task: history/mine/created-by modes and legacy action aliases need dedicated semantics (7 keys).
- Design: existing scoped RLS/action triggers already exist; 83-key universal/DENY behavior still needs proof against exact live guards, notably ordinary Admin bypass in `design_can`/`design_read`/`design_guard`. No patch applied or falsely claimed complete.
- Finance: existing RPC-only guards remain unchanged; regression tests passed, but all 28 keys have not received new full-source/DENY end-to-end proof here.
- Other modules remain as reported in the full-510 package. **Production newly enforced by this turn: 0; staged concrete checks: 51; full 510 completion: not achieved.**

## Verification and release
- 24/24 action tests passed, including preflight mismatch and drift-safe rollback.
- 586/586 regression tests passed across Base permissions, Design and Finance; preview build log says build OK.
- No application code enabled these unapplied policies; no no-op publish. Live browser grant/save tests were intentionally not performed because production writes are forbidden.
- Next step: complete client integration and baseline rebase as needed, obtain separate owner approval of the exact resulting candidate SHA(s), apply through the authorized migration workflow, then actor E2E before claiming production completion.