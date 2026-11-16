# B2B / BTC centers — code implemented, SQL not applied

One shared post-build chart projection (extended Distribution implementation) promotes B2B original system ID and Distribution to company peers; BTC uses `showroom-block`. B2B department names and Hanoi showroom name are display aliases only. Original IDs, ChartSlots, holders, membership/history and management-action targets remain intact. No generic title/Role renaming, no permissions or OrgConfig rewrites.

BTC hides only the exact redundant Bán Lẻ ID when no current/historical memberships, titles, slots or nonstructural metadata exist. Unknown or populated data is protected. Live audit found **one assignment** at Bán Lẻ: the wrapper stays visible with a warning; a flat live BTC→Showroom tree is therefore **not complete**. No guard is removed to force flattening.

## Empty positions
`/organization` unit drawer → titles → preview center positions: B2B director at original B2B ID, head/staff at real departments, team/staff at real groups; BTC director only at `showroom-block`. Existing Showroom manager/staff use their original Role IDs. Catalog identity must match, existing mapping must already match to be skipped; any other existing position refuses automatic rebinding, including occupied/history-bearing titles. New titles/bindings use existing org_change preview/apply/audit. No live calls made.

## Live mapping evidence (read-only)
Hanoi has `showroom-hanoi-manager` → `role-v2-showroom-manager` and `showroom-hanoi-staff` → `role-v2-showroom-staff`. Generic title `e5fe2a3f-dfff-4ee0-beaa-a6434b2388e0` still maps to `role-v2-sales-staff`; three active historical slots retain that Sales Role. None were changed or hidden. New B2B/BTC Role IDs were absent. Existing Showroom Roles and permissions remain unchanged.

## Staged SQL and blockers
Candidate creates five independent V2 catalog Roles only. Defaults: own attendance/leave, 3K use; managers add k3hub.center; B2B adds existing own-order/quote/CRM entry and signal-sale keys, checked through current server policy before insert. No all-company, admin, approval, delete or finance defaults. These are conservative starter permissions, NOT proof of full B2B work coverage; configure through central Role editor and compare required/effective actions before any occupied cutover. Existing business/CRM/action scope engines remain authoritative.

Requires separate exact-SHA approval and official/private backup before migration. preflight is read-only; rollback archives only unused unchanged records matching seed audit, refuses references/customization, preserves audit/history. Source/parent transfer and occupied Sales→Showroom/B2B mapping are NOT supplied as ready migrations: need prospective attribution, Biz sync and effective-rights/obligation parity audit. No employee records, raw backups, tokens or personal data in repo. No publish.

## QA
98/98 targeted tests pass across 10 files including exact candidate SQL execution/rollback refusal in isolated PostgreSQL, center hierarchy, position source guards, Distribution, navigation and organizational history. First parallel SQL run exceeded the default 5s cold-start limit; rerun passed with 15s test timeout (actual SQL test 1.9s). ESLint new files passes; existing edited files pass non-format rules, existing formatting untouched. Automated build reports OK. Manual tsc/build not run. Authenticated responsive 320–430px tree/setup E2E remains UNTESTED because no valid Super Admin session is available; no QA data/users created. No live save/role grant or publish.