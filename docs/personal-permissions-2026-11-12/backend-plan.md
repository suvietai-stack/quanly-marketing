# Personal permission enforcement — next stage (not approved)

No database changes in this UI release. Visibility is not authorization.

| Module | Catalog | Grantable personal | Not supported personally |
|---|---:|---:|---:|
| CRM Khách Hàng | 8 | 0 | 8 |
| Sao Sứ Việt | 3 | 0 | 3 |
| Quản trị Kinh doanh | 17 | 0 | 17 |
| Quản lý 3K | 4 | 1 | 3 |
| Tổng Quan | 7 | 0 | 7 |
| Task | 27 | 0 | 27 |
| Thương Hiệu | 12 | 0 | 12 |
| Dự Án Web | 114 | 0 | 114 |
| Social | 34 | 0 | 34 |
| Local | 21 | 0 | 21 |
| Video | 28 | 0 | 28 |
| Thiết Kế | 83 | 6 | 77 |
| Báo Cáo | 8 | 0 | 8 |
| Cài Đặt | 16 | 0 | 16 |
| Tín Hiệu Cơ Hội | 10 | 0 | 10 |
| KPI / Giao KPI | 11 | 0 | 11 |
| Đơn Từ & Phê Duyệt | 25 | 8 | 17 |
| Đơn Hàng — Hỏi Giá & Tiến Độ | 11 | 0 | 11 |
| Theo Dõi Đơn Hàng | 16 | 0 | 16 |
| Tài Chính Kế Toán | 28 | 0 | 28 |
| Sale Work Zalo | 5 | 0 | 5 |
| Tích hợp Marketing | 2 | 0 | 2 |
| Tài khoản | 14 | 0 | 14 |
| Cơ cấu tổ chức | 6 | 0 | 6 |

## Separate controlled implementation plan
1. Audit each unsupported key against its actual RPC/RLS, own/assigned/unit boundaries, business eligibility and current reviewer/stage/self-approval guards. Readiness whitelist alone is not evidence.
2. Stage the smallest module-specific enforcement candidate with exact SQL snapshot, checksum, rollback and negative scope/DENY/locked-account tests; obtain separate owner approval before any live SQL.
3. Enable personal policy only for independently verified keys. Reuse account_supplement_preview/save and audited readback; do not grant via direct tables or turn view-all into write/approval.
4. Test with authorized employee sessions, deploy only compatible frontend, and report remaining unsupported counts.

Organization performance candidate remains unapplied, unchanged SHA256 331ad3a83764d9563605b8c1d7113166751a2cc6f7e8f0ea72099ab753e2ea25.
