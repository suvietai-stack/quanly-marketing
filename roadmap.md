# Roadmap — Role/personal permissions 510/510
- [x] Distribution code: independent navigation and fail-closed subtree selection; shared data; 33 regression tests and automatic build pass; no publish.
- [ ] Distribution signed-in employee/manager desktop/mobile E2E: requires an existing user session; self-session mint found no matching account, no test account created.
- [ ] Distribution live organization cutover: blocked by Biz source reparent guard and historical policy/scope compatibility audit; no live writes.
- [ ] Hộp thư: shared Facebook capabilities/subscription union; scoped durable Messenger storage, webhook ingest/send, staff access and responsive inbox; Chat Web placeholder only. Stage SQL with SHA/backup/rollback for separate approval; do not publish.
- [ ] Kết nối Page thống nhất: một nút, hai checkbox Nhận Lead/Nhận tin nhắn độc lập trên mỗi Page; giữ lựa chọn Lead hiện hữu và kiểm tra quyền Messenger thật.
- [x] Full candidate staged (not applied): all 510 keys toggleable in every Role + personal Inherit/ALLOW/DENY — docs/role-permission-full-2026-11-12 (SHA 4a0eb2cf…44ae). 25/25 isolated tests.
- [ ] BLOCKED on owner: approve exact SHA 4a0eb2cf084474dc336cd40143648848f3f88392a72403c575cb67db367d44ae, then apply + live E2E with a Super Admin session (Role toggle, personal DENY, readback) + publish.
- [x] Current request: implemented restrictive reads and per-field/action server guards for Task, Social and core Web tables (51 concrete keys); isolated direct SQL tests; snapshot/preflight/SHA/rollback staged, no live apply.
- [ ] Remaining tranche: complete Web content/technical/entity/backlink, Design configured-DENY bypass review, Finance per-action proof, and remaining screen-only modules; staged implementation cannot become live before exact SHA approval.
