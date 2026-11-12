# Leave employee P0 — 12/11/2026

## Confirmed code paths, not yet proof of the reported staff production incident
- Auth `_load` publishes `loaded:true` and profiles BEFORE `refreshBaseAccess`; `can()` fails closed for verified appointment keys while Base access is missing. Old Leave route immediately rendered definitive denial. New Leave-only access boundary distinguishes pending/failed/verified denial, joins existing per-actor access coalescer and bounds its UI wait at 12 seconds. No global auth evaluator changes or optimistic permission grant.
- Unit-only viewers were omitted from route and management tab despite existing backend unit SELECT branch. Both now admit that key; same RLS-filtered SELECT, no frontend view-all promotion.
- Previously selected tab could become invalid after permissions changed. Valid tabs now reconcile while preserving valid deep links.
- Read errors now retain query label, HTTP status, code and duration; settings/own list/approver/detail/history independent. 401/403 never auto-retry, client deadline immediate. Actor-only invalidation avoids unrelated cached users' Leave refetches.
- Underlying global access RPC coalescer still has no network abort deadline; this patch bounds only the Leave UI wait, not the shared RPC. A indefinitely hanging global read remains an upstream limitation, not hidden success.

## Verification
- 59 Leave unit/database tests passed; automatic build OK 09:56:14 UTC.
- Desktop/mobile nonadmin **isolated fixture, no JWT**: pending causes zero Leave requests; grant arrival opens active own tab and exactly list/settings reads; settings403 does not hide own list; access failure→manual retry recovers, signout removes tabs, no page errors.
- Authenticated real Super Admin local desktop/mobile: all four tabs, existing own rows, no alerts/page errors. No writes admitted by browser guard.
- Only injected Super Admin session available. **Staff production E2E UNTESTED**. No impersonation, new accounts, leave requests, assignments, Role changes, RLS changes or SQL application.
- Tool-side read-only query using native private helpers failed `42501 permission denied for function base_config`. No grant workaround. Therefore native production set-based parity/EXPLAIN is blocked; owner-provided 889ms/8752 buffer evidence is not a measured 12s employee query.
- Counts read: 57 Roles, 88 assignments, 13 overrides, 47 Leave requests; unchanged.

## New staged candidate — NOT APPLIED, separate from prior four packages
- `candidate.sql`: new actor-bound `public.leave_visible_unit_owners()` returns allowed unit owners, computes native has_permission once (unchanged DENY/ALLOW/fallback), config once for projection, org_role_rules once, materialized roots/active units and recursive cycle-safe closure. Target and source intervals/status match native predicate exactly. No effect filter added: old predicate also relies on has_permission, not rule.effect.
- SELECT retains own/creator/assigned-approver/all branches, now statement initplans; replaces per-row unit helper with `owner_id=ANY((SELECT helper())::uuid[])`. Active restrictive policy unchanged. No other modules changed. Existing has_permission may internally recompute its own config; not claiming a fully unified resolver.
- Preflight checks exact policy MD5 `4dc8270f8abbec16f94a004cd9f2a5d2`, dependency MD5/owner/ACL and active guard. New helper installation refuses existing object. Backup read script included; rollback restores original SELECT and removes only new helper. Candidate adds only actor-scoped read EXECUTE, never direct private-helper grants.
- Fixture native gates are controlled substitutes, **not full production source evaluator**. Exact row parity tested for unit subtree, inactive unit, ended/future/status-ended assignment, co-appointments, unrelated actor, inactive and signed-out, DENY, own legacy-history row, creator and assigned approver. Existing production Role evaluator/DENY/source coverage remains pending before approval.
- 30 sequential isolated reads on 8 synthetic rows: old p50 1.183ms / p95 1.405ms / max 1.479ms; candidate p50 0.759ms / p95 0.886ms / max 1.049ms. Not production, not 47-row native costs or a cold latency guarantee.
- Exact SHA256 in `SHA256SUMS`; final newline included. **Do not apply until separate exact SQL approval after remaining native parity/ACL review**. Plan approval is not migration approval.

## Release
Frontend commit/deployment readback pending at report creation; code readiness does not mean staff production issue fixed.