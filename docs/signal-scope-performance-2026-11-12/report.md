# Signal list timeout fix — applied 2026-11-12

## Cause
The sig_select RLS policy called private.sig_scope_ok for every signal. That helper rebuilt organizational Role sources repeatedly. An authenticated non-admin count of 682 visible signals took 43,756.041 ms.

## Change
- private.sig_scope_context computes the exact existing scope once per statement through an uncorrelated SELECT initplan.
- private.sig_scope_matches compares each signal's groups with that context, including the existing Khác: alias.
- Only the scope expression in sig_select changed. Permission checks, active-account guard, creator and assigned-sale branches, sorting, filters and pagination remain unchanged.
- No application AI code-generation request or frontend deployment was needed. SQL and rollback are committed in this directory.

## Validation on the live database
- 230 actor/group comparisons over all active accounts, stored distinct need_groups, empty groups, unknown groups and Khác: alias: zero mismatches against the original sig_scope_ok.
- Same authenticated non-admin count: 682 rows before and after.
- Before count: 43,756.041 ms. After count: 291.692 ms (about 150 times faster).
- Combined signal_list_page({}, work, 0, 40) plus signal_list_counts({}): 1,833.106 ms, successful.
- Measurements are server query execution timings, not browser/network latency.
- Existing Role and personal permission data were not modified.

## Operations
The ALTER POLICY waited for a read-only metadata-dump transaction (backend_xid NULL, EXECUTE dumpFunc) holding a table lock. Only that blocking idle metadata session was terminated. The original ALTER completed; its live policy was checked after the client timeout rather than reapplying.
Use rollback.sql to restore the exact previous policy. No statement timeout was increased.
