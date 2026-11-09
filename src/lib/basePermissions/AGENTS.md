# Base organization permissions
- Store organization/default/direct/bundle configuration as revisioned JSON; writes require Super Admin, actor-bound expiring previews and atomic audited apply to prevent silent changes.
- Only audited supported keys may activate; unsupported rules remain drafts. Preserve specialized business/CRM and legacy role evaluators without restoring retired business-role grants.
- Permission reads are user-matched and invalidated at server transitions; native scope/workflow restrictions remain authoritative and own CRM grants pass the shared ownership boundary.