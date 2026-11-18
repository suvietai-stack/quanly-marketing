# Base Sứ Việt — one effective permission snapshot per user

## Goal
The UI does not resolve organization trees or role sources on each tab open or operation. The server maintains one authoritative effective snapshot per user; the UI fetches it when signing in and caches indexed decisions. Writes never trust client permissions.

## Four sources
1. Common: verified company-wide rights for all active employees.
2. Position: canonical (unit,title) → standard V2 position Role; support concurrent assignments.
3. Personal: audited additive grants and individual explicit DENY.
4. Task: extra task/specialty Roles attached to a user or assignment until revoked or expired.

Final decisions are DENY > ALLOW > NOT_CONFIGURED, from one resolver. Keep raw source IDs for auditing/explanation; do not load provenance per task.

## Server snapshot
One private row per user with:
- decisions: permission key → final decision.
- source groups: common, position, personal, task (only for explain screen).
- revision/epoch, computed_at, earliest valid_until.
- Resource ownership, CRM scopes, time-based constraints and account status remain enforced by server-side predicates.

## Lifecycle
- Audited org assignment or removal: invalidate in the same transaction, update changed users.
- Role/extra task/personal changes: refresh affected users from audited server sources, not the full company.
- Sign in: load once. Compute only when missing/expired/invalidated.
- Each tab/task: read in-memory UI map; backend writes use the lightweight indexed server predicate.
- Active session: a minimal revision event prompts reload only when changed; expiry is scheduled. If live event fails, check only version on foreground, never full role data.
- Policies/schema changed: bump revision explicitly; stale caches must not be reused.
- Failure: fail closed on protected writes. Never trust the browser cache for authorization.

## Guardrails
Keep all existing IDs, data, scoped checks, audits and personal DENY semantics. Do not auto-grant showroom CRM rights: change such roles only through audited role configuration.

## Current status
PR #51 is a staged server cache, not a complete entire-Base conversion: native ownership rules and legacy business/CRM evaluators are still authoritative. The migration is not applied to production, and the PR is not verified by CI. Test parity, revocation, simultaneous role changes and latency before merge/publication.
