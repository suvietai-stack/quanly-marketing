# P0 tạo công việc 3K — 12/11/2026

## Đã sửa trên Preview
- Khôi phục Cơ bản | Nâng cao rõ ngay đầu modal. Cơ bản mặc định: tên, hạn, Có/Chưa hoặc Số lượng (mục tiêu + đơn vị khi cần).
- Nâng cao dùng chung state, hiển thị thời gian/lộ trình, nhiều KF/KPI, cả10 phương pháp đo, phối hợp, bằng chứng/nghiệm thu; các nhóm details được mở mặc định, không phải bấm qua nhiều nhóm. Không xóa tính năng.
- creation_mode là lựa chọn thật, không tự suy từ cấu trúc. Chuyển về basic khi cấu trúc/lịch/người phối hợp không tương thích bị chặn, không flatten hay mất dữ liệu. Tên/mô tả/KF/KPI giữ state khi đổi mode.
- Guard synchronous chống double click trước khi React cập nhật isPending. Timeout/unknown transport giữ requestKey và **payload gốc**; khóa chỉnh form cho đến retry/kết thúc để không lưu nội dung khác với request đã có thể commit. Lỗi SQL xác định không phải57014 cho chỉnh lại. Timeout hiển thị tiếng Việt, không che lỗi thành thành công.
- Không Publish. Đã mở modal thật `/biz/3k` bằng phiên Super Admin được cấp, có đúng1 tab mỗi chế độ, không alert; chặn heartbeat/Sao/server writes, không tạo công việc thật.

## Live audit chỉ đọc
- k3_quick_create MD5=e8e6f7ee55584ac9ba202f40d3f2d554;141calls,mean1174.9ms,max7817.4ms. Shared authenticated statement timeout8s không tăng.
- Live giữ142goals/140actions/139kpis/851plan events; readback cuối hashquick_create/capture/changed/Signals0371 không đổi. Không apply SQL hoặc đổi Role/phạm vi Khối.
- `k3_plan_changed` MD5=747bba016fb854adde9ea58fe6e11336: bốn statement triggers trên goals/actions/goal_members/action_collaborators, mỗi statement lặp tất cả active k3.use+biz_participant rồi capture. Quick create goal insert, creation_mode update, action writes/activate tạo nhiều lượt scan. Đây là amplification thật trong DDL, chưa đo contribution milliseconds bằng production write vì không được tạo test data thật.
- Capture MD5=b001458f08a1cc617257f0192237523a, lockcheckpoint FORUPDATE; tính duty/plan source lại. Snapshot không có waiting locks (0), không chứng minh không bao giờ contention.
- QuickCreate owner advisory lock + unique request key: RPC transactional, statement cancellation rollback; ambiguous response sau commit retry tìm goal cũ. Không tăng abort/DBtimeout hoặc mở RLS.

## SQL bản sửa nhỏ PENDING
`docs/pending/k3_plan_targeted_capture.sql` thay đúng trigger function và4trigger bindings từ statement sang row:
- OLD+NEW IDs, goalowner, accepted members, assignees và collaborators trong KG bị tác động; DISTINCT, sorted UUID để thứ tự locks ổn định.
- Insert/update/delete membership/collaborator cũng cập nhật đúng người cũ/mới, không bỏ đường phối hợp/revoke. UPDATE0rows không chạy toàn công ty.
- Giữ nguyên capture/duty/source/cutoff/formula, active/k3.use/biz_participant gates hiện tại; không biến việc này thành cutover3K toàn công ty hoặc scope Khối. Scheduler toàn người giữ nguyên, không tạo xác nhận nhân viên giả.
- Không batch qua GUC/cờ do client có thể giả. Một update nhiều rows cùng goal có thể vẫn capture lặp; patch giảm global amplification, không tuyên bố tối ưu mọi bulk path. Không sửa guardgoal/action/KPI/activate chung khi chưa có evidence riêng.
- Snapshot9functions DDL/MD5/owner/ACL trong functions.json; rollback khôi phục exact function và4statement triggers. SHA256SUMS. Hàm CREATEORREPLACE giữ ACL/OID; không grant mới. lock_timeout2s, guard MD5changed trước áp.

## Kiểm thử
-247/247tests toàn20files3K, gồm creation/status/discipline/KPI/periods/personal/company-scope. Scope Marketing/HCNS/Sales chỉ fixture, không tự đăng nhập nhân viên khác.
-Real checkpoint fixture25users×5updates: trước125captures/35–36ms, sau5captures/10–12ms. Initial snapshots/deadline/summary deadline giữ nguyên, ontime/late/leave tests đạt, reassign/revoke/denied/zero-row/rollbackhash đạt. Cô lập dùng capture implementation từ migration0248 hiện có trong discipline test; snapshotlive capture được lưu nhưng chưa clone full production dependency graph. Không suy ra timesproduction.
-Creation test chạy **quick_create nguyên văn live**: basic/advanced, KG/KF/KPI parent crosscheck, double request retry1goal; SQL57014 giữa KPIinsert rollback toàn request rồi samekeyretry tạo1goal; simulated lost response aftercommit returnsduplicated,1KF/1KPI,modeadvanced.
-Browser thực modal interceptedRPC (không DBproduction):1280/1024/390 mỗibasic/advanced; mode/state/multipleKPI/no-loss/singleflight/timeout+retry cùngpayload+key đều đạt6/6. Screenshot inspected iPadbasic/mobileadvanced và realPreviewmodal, không documentoverflow.
-Build latest OK. Không claimed live save thành công: người dùng không cho phép testwritesproduction, SQL chưa áp.

## Quyết định còn cần
Tool migration hiện chỉ tự ép thẻ khiDDL phá schema; additive patch có thể áp ngay. Vì owner yêu cầu duyệt trước, **không gọi tool để tránh tự áp**, không chènDROP giả để ép thẻ. **Chưa có approvalcard**, không dùng approvalSignals hay0383/0384 cho patchnày.

Xác nhận riêng cần: **“Duyệt áp k3_plan_targeted_capture ngày12/11: tối ưu4trigger checkpoint, giữ dữ liệu/quyền/kỷ luật, không Publish.”** Sau duyệt cần freshhash/triggeraudit, áp đúng patch, live metadata readback và nghiệm thu scoped trên bản ghi owner cho phép; rollback nếu checkpoint/output sai. Chưa Publish tới backendstable+E2E. Signals SQLpending độc lập, khôngmigrationtranh chấp.