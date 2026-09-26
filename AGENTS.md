# Architecture rules

- Đơn từ (leave_*) writes go only through SECURITY DEFINER RPCs (leave_submit/decide/recall/...) that check `private.sig_can` and server time; tables are SELECT-only for clients — so permission and deadline rules cannot be bypassed from the browser.
- Leave time math lives in `src/lib/leave/calc.ts` (preview) and mirrors `private.leave_eval` (authoritative); change both together — keeps the preview and the backend check consistent.
