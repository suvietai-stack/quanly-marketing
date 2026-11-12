# Signal deletion fix
## Findings
The client deleted directly through the table and interpreted a zero-row RLS result as a history error. It did not close the open detail/deep link after a successful deletion. The progression assignment FK blocks deleting a parent signal even with no consultation notes: live read-only inspection found 10 nonterminal/no-note signals, one with a progression assignment dependency.
## Fix
- Add authenticated signal_delete RPC with active-account, delete/manage permission, exact existing SELECT visibility and group-scope checks.
- Lock parent FOR UPDATE, reject won/lost, consultation notes and progression assignment dependencies with explicit Vietnamese reasons.
- Do not remove assignment/period/report history to make a hard delete succeed. Existing dependency restrictions are retained; affected users are directed to cancellation.
- Keep existing deletion confirmation; prevent duplicate clicks; close detail and remove its open deep link only after confirmed success, then await cache invalidation.
- No production records were deleted in testing.
## Verification
10 isolated PGlite tests pass: eligible deletion + notification cascade, permission denial, inactive actor, SELECT visibility, scope, terminal states, consultation history, assignment FK history, anonymous EXECUTE denial.
TypeScript noEmit and production build pass. No authenticated live deletion of user records was attempted.
## Rollback
Restore the prior client commit first, then execute rollback.sql. No existing table, permission assignment, status or historical row was changed by this migration.
