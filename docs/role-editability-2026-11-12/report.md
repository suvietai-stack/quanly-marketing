# Role V2 editability — 12 November 2026

## Delivered in Preview
- One inline editor in RoleCatalog: select Role → Chỉnh sửa → checkbox matrix → Xem trước → reason → Lưu thay đổi Role. Details retain name/type/group/preset editing; no automatic preset.
- Common rights and recipient impact are separate sections; affected names are shown when available in the existing user directory, no additional employee fetch.
- Position binding has a shortcut into this editor; overview matrix is explicitly read-only.
- Unsupported additions remain disabled with “Chưa hỗ trợ từ Role”; existing unknown keys remain in baseline and proposal unless explicitly removed. No readiness gates were broadened.
- System Roles and inactive actors cannot use the UI editor; server authorization remains authoritative.
- Successful apply invalidates caches without background duplicate refetch, then reloads RoleCatalog and the coalesced auth/permission state once. Failure preserves draft/preview and displays server errors; no automatic rollback or personal-right mutation.

## Backend verification — no new migration
Exact live public.role_catalog_change (MD5 16ffa239723e05252f4165b2ee82c330) and private.role_v2_reduction_guard (MD5 97d1b33ca5995d1a5d4dd730c5cf0608) already support authorized additions and reductions. The defect was the client blanket removed.length prohibition, now removed. Guard checks pending leave/cancellation responsibilities at both preview and apply, while actor, expiry, fingerprint, reason, scope, catalog validation and system protections remain unchanged. Definitions/ACL/owner are preserved in live-functions.txt and extracted SQL files for isolated execution only, NOT pending migrations.

## Evidence
- 120 selected tests across 12 files: exact live writer addition/reduction, unknown baseline preservation, unrelated Role unchanged, ordinary actor denial, pending responsibility/recheck, stale preview, system protection, V2 task edits, position scope/DENY, 24 legacy-slot versus canonical parity, 12 titleless mirrors, cache and auth flows.
- Browser fixture 1280/1024/390: inline remove and add → preview → reason → save → read-back. One catalog read after each save and one auth reload; viewer cannot edit, no overflow or page errors.
- Authorized Super Admin Preview: /organization → Role & Phân quyền → Chỉnh sửa → Hủy; no live Role preview/apply or org_change writes. Real employee live write E2E intentionally not performed.
- Latest harness build OK; existing organization and index route titles/descriptions/OG metadata verified.
- Live readback: writer/guard hashes unchanged, 86 assignments, 25 historical slots, 16 mappings, 56 Roles and two Super Admin accounts.

## Release boundary / rollback
Code is ready for review but not Published: the existing org_assign_shared_position four-function cutover still awaits specific approval/application and live appointment E2E. No competing migration, Role/data deletion or changes to Biz/3K/Signals/CRM were made. For this UI change revert the committed files if needed; Role operation rollback remains a separately authorized audited restore, never automatic. Do not apply the extracted SQL snapshots as migrations.
