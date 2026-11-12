# Gen1 deletion dependency audit — 03:44 UTC

No production rows deleted. Every one of 25 slots is referenced; retain all as historical provenance. All 27 non-system gen1 roles have zero direct users, position bindings, slot roles, specialties and business-exception references at the live read. Sixteen legacy title links still reference 13 roles; all inactive but enabled_permissions remain and the old resolver does NOT use active as its gate. Never assume inactive equals ineffective.

| Role | Title FK rows | SQL code references detected | Decision |
|---|---:|---|---|
| role-0k2hmw8r | 0 | final_permission_account, standard_role_catalog_setup | No FK row at snapshot; audited deletion/restore still pending |
| role-9h328b84 | 0 | final_permission_account, standard_role_catalog_setup, account_supplement_read | No FK row at snapshot; audited deletion/restore still pending |
| role-content-web | 0 | final_permission_account, standard_role_catalog_setup | No FK row at snapshot; audited deletion/restore still pending |
| role-designer | 0 | final_permission_account, standard_role_catalog_setup | No FK row at snapshot; audited deletion/restore still pending |
| role-g8qc3q2s | 0 | final_permission_account, standard_role_catalog_setup, account_supplement_read | No FK row at snapshot; audited deletion/restore still pending |
| role-kinh-doanh | 0 | final_permission_account, standard_role_catalog_setup, account_supplement_read | No FK row at snapshot; audited deletion/restore still pending |
| role-leader-marketing | 0 | final_permission_account, standard_role_catalog_setup | No FK row at snapshot; audited deletion/restore still pending |
| role-local-seo | 0 | final_permission_account, standard_role_catalog_setup | No FK row at snapshot; audited deletion/restore still pending |
| role-seo | 0 | final_permission_account, standard_role_catalog_setup | No FK row at snapshot; audited deletion/restore still pending |
| role-social | 0 | final_permission_account, standard_role_catalog_setup | No FK row at snapshot; audited deletion/restore still pending |
| role-standard-account-chief | 1 | standard_role_catalog_setup | Blocked: title FK + history retirement needed |
| role-standard-account-stock | 1 | standard_role_catalog_setup | Blocked: title FK + history retirement needed |
| role-standard-buyer | 1 | standard_role_catalog_setup | Blocked: title FK + history retirement needed |
| role-standard-design-head | 1 | standard_role_catalog_setup, standard_role_catalog_consolidate | Blocked: title FK + history retirement needed |
| role-standard-design-staff | 1 | standard_role_catalog_setup | Blocked: title FK + history retirement needed |
| role-standard-mkt-director | 1 | standard_role_catalog_setup | Blocked: title FK + history retirement needed |
| role-standard-mkt-head | 1 | standard_role_catalog_setup, standard_role_catalog_consolidate | Blocked: title FK + history retirement needed |
| role-standard-mkt-staff | 1 | No literal match in SQL/source runtime scan | Blocked: title FK + history retirement needed |
| role-standard-proc-head | 1 | standard_role_catalog_setup, standard_role_catalog_consolidate | Blocked: title FK + history retirement needed |
| role-standard-sales-head | 1 | No literal match in SQL/source runtime scan | Blocked: title FK + history retirement needed |
| role-standard-sales-staff | 2 | No literal match in SQL/source runtime scan | Blocked: title FK + history retirement needed |
| role-u0fzsvsp | 0 | final_permission_account, standard_role_catalog_setup, account_supplement_read | No FK row at snapshot; audited deletion/restore still pending |
| role-video | 0 | final_permission_account, standard_role_catalog_setup | No FK row at snapshot; audited deletion/restore still pending |
| role-viewer | 3 | standard_role_catalog_setup | Blocked: title FK + history retirement needed |
| role-wupj68a6 | 1 | final_permission_account, standard_role_catalog_setup | Blocked: title FK + history retirement needed |
| role-xim870m3 | 0 | final_permission_account, standard_role_catalog_setup | No FK row at snapshot; audited deletion/restore still pending |
| role-xwbmhg3b | 0 | standard_role_catalog_setup | No FK row at snapshot; audited deletion/restore still pending |

Four protected gen1 system IDs: role-admin, role-super-admin, role-dong-hang, role-nhan-su-moi. Two super-admin user_roles rows preserved. No CASCADE. No table drop. SQL migration-history inspect refused because tree exceeds limits: no replay/repair/reapply attempted.

Hard deletion is NOT included in pending source cutover: first apply and verify canonical source, retire/archive title rows through audited writer with exact restore, fence old catalog setup functions from recreating IDs, then delete individually only after fresh all-FK checks. Source cutover solves authorization without rewriting 86 assignments; DB hard cleanup remains separately blocked.
