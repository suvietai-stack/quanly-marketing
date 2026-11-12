# Design workspace UX — 2026-11-12
## Result
- One workboard for all jobs and each existing Photo / Marketing Design / Order Mockup flow.
- Read-only overview queues: active, assigned to me, waiting for my review, overdue, unassigned, requested by me.
- Six presentation lanes group all nine existing statuses without changing stored statuses or transitions.
- Mobile cards and horizontally scrollable Kanban, desktop table, search by job/person, detailed status/category/product/person/date filters, attention/deadline/newest sorting.
- Progressive rendering: 40 rows/cards at a time with explicit load-more controls; counts use the complete authorized collection.
- Detail opens the existing processing tab. Read-only stage guide, assignee/reviewer/deadline and next-step text stay visible above the tabs.
- Authorized assignment shortcut and draft/revision/delivery links reduce navigation during review.
- Receive-job action guards against duplicate clicks and surfaces failures. Workflow actions wait for uploads.
- Save button permits submitting drafts from fields with their own edit capabilities; existing disabled-field rules and authoritative design_order_save checks remain in force.
- Shared reports, notification deep links (/orders?open=...), attachments, source rows, RPCs and server permissions are retained. No SQL or business-data changes.

## Validation
- 6 workboard regression tests: status grouping, stable assignee identity, designated reviewer/requester fallback, closed/unassigned separation, overdue sorting, deterministic undated ordering.
- 13 selected suites / 102 tests pass.
- TypeScript noEmit passes.
- Production build passes; new/rewritten files pass semantic ESLint checks.
- A browser fixture was prepared, but visual browser verification could not complete: isolated Chrome refused the local preview connection. No claim of authenticated visual or live mutation E2E testing is made.
