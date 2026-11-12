# P0 /signals — 12/11/2026, 02:25–02:36 UTC

## Kết luận
**Chưa nghiệm thu hết timeout. Bản vá SQL mới đã code/kiểm thử, chưa áp; không Publish.** Không chạy lại0371 hoặc ba pending cũ. Chỉ tối ưu cách thực thi SELECT scope, không thay quyền được cấp, resolver chung CRM/3K hay workflow diễn biến.

## Phiên được ủy quyền / số đo thật
Phiên hiện có là Admin Hệ Thống / Super Admin; không chọn hay giả danh nhân viên. Cùng backend thật, không mock.

| Trang / viewport | Counts | Page | HTTP | REST requests trong24s |
|---|---:|---:|---|---:|
| Preview1280×1800 |1054ms|1615ms|200/200|41|
| Preview1024×1800 |1316ms|6138ms|200/200|41|
| Production1280×1800 |963ms|1440ms|200/200|41|
| Production1024×1800 |5643ms|7256ms|200/200|40|

Mỗi lần đúng một counts/một page, token sau thành công. Focus/visibility không sinh counts/page/quyền mới. Không console exception/alert lỗi/document overflow; screenshot thấy655. 24s là cửa sổ quan sát, không phải thời gian tải. Không tái hiện57014 bằng Admin trong cửa sổ này; 7,256s gần ngưỡng8s, không đủ kết luận hết lỗi. Không có phiên scoped đúng người trong ảnh.

Probe tiếp theo chặn ghi tự động app/server functions: ID-only LIMIT1/40/665=358/386/965ms; counts706/662/746ms,total655; page1205/1238/1540ms,40rows. Tám sort offset40 đều200,1249–2620ms. Đây là trước patch, không phải số cải thiện. Không tạo tải đồng thời nhân tạo.

**Giới hạn read-only mẫu đầu:** app tự gửi heartbeat profiles.last_seen_at HTTP204 và sao_celebration_claim HTTP200 khi đăng nhập. Không tự sửa quyền/dữ liệu nghiệp vụ qua công cụ, nhưng không thể khẳng định mẫu đầu tuyệt đối không ghi. Probe sau đã chặn chúng; không cố hoàn tác production.

## Live / nguyên nhân
-665 signals,655 active,10cancelled. Ba MD5 0371 khớp nguyên trạng user cung cấp.
-SELECT policy đã có InitPlans cho bốn key view_all/manage/create/sale, không phải sáu key mỗi row. `sig_visible` còn sáu keys ở đường compatibility/labels, không đổi lần này.
-`sig_scope_ok(uid,need_groups)` vẫn phụ thuộc row: non-Admin dựng base_config+role_source_rows theo từng signal. Graph tổ chức/slots/direct/title/task eligibility được quét lặp; counts/page/history re-enter RLS khuếch đại. Admin bỏ source graph nhưng còn Admin/active check theo row; patch chưa chứng minh chữa competition của Admin.
-~20 bảng module khác đọc đồng thời lúc khởi động, cùng directory/quyền/approvals; mẫu iPad nhiều endpoint độc lập đều chậm. Competition có tương quan, chưa causal benchmark. Không sửa store toàn app/bỏ chức năng đang dùng trong patch cô lập.
-Deadline pg_stat_statements calls giữ nguyên7157 trong mẫu; source không caller listDeadlines ngoài định nghĩa. Không coi lịch sử7157 là tải hiện tại/xóa RPC.
-02:29 stats page678/counts646/base5694calls, means tích lũy2331/2094/2744ms; không dùng làm số sau patch.
-Authenticated/authenticator8s,anon3s; tool read session120s. Không nâng timeout.
-Health DB/pool up,RAM79%,17/60connections,1/200clients,disk19%,DB64.5MB; I/O alert11/11 04:56 là lịch sử, không resize/restart.
-EXPLAIN live LIMIT40 seq scan estimated665/cost2.2; tool không như app RLS caller, không dùng để chứng minh authenticated performance.
-Stats **đổi ngoài lượt này**: last_analyze=02:26:56UTC,n_live_tup665 thay user baselineNULL/7. Lượt này không chạy ANALYZE, không biết actor; không quy phục hồi tạm thời cho patch chưa áp.

## SQL mới đã thực hiện, PENDING
`docs/pending/signals_p0_statement_scope.sql`: helper private self-only STABLE SECURITY DEFINER lấy scope từ đúng nhánh0371; caller khác UID trảfalse/empty; PUBLIC execute revoked, authenticated chỉ execute helper mới, không tăng table grants. SELECT context là scalar InitPlan với OFFSET0 chống optimizer nhân expression; group checks rẻ còn theo row. Không client/session cache hay GUC quyền giả mạo.

Giữ sig_can/DENY/active restrictive policy/creator/assigned/write guards. Counts/page vẫn SECURITY INVOKER; không sửa ba function0371. Không thêm nguồn position-role khác với ngữ nghĩa0371 trong performance patch. Guard MD5scope vàpolicy trước áp, lock_timeout2s, helper CREATE không overwrite hàm ngoài dự kiến.

## Kiểm thử
-5 tests mới PGlite thật665synthetic rows;60scope cases direct/slot/signed-unsigned-title/expiry/Khác/multi/global/fallback/null; RLS10callers gồmAdmin,bounded,no-grant,assigned,creator,locked.
-Scope/permission thay hoặc thu hồi giữa statements có tác dụng ngay; đọc scope người khác bị chặn.
-Counts/page nguyên văn live0371:15filters×8sorts×2pages×7callers old/new bằng nhau; facets/cancel/history giữ. Upstream graph là fixture, chưa clone nguyên graph toàn công ty.
-EXPLAIN ANALYZE BUFFERS VERBOSE chỉ trong authenticated PGlite: context InitPlan đúng1ActualLoop/665rows. Bản đầu bị planner nhân3; đã sửa OFFSET0 và test chặn regression.
-Bounded isolated IDscan trước35ms/sau3ms, cùng332rows; không suy ra tốc độ production.
-88/88hồi quy11files Signals/0371/progression/cache/CRM/K3personal; tổng93tests đạt. Preflight guard cuối thêm test đạt.
-Không frontend runtime edit: đo không duplicate counts/page; không sửa JS che lỗi hoặc trả tổng giả.

## Snapshot / rollback / owner approval
-snapshot.json:8exact DDL/MD5/owner/ACL/config/volatility,10policies. SHA256SUMS cho snapshot/rollback.
-rollback.sql khôi phục chính xác SELECTpolicy cũ, không dữ liệu; helper mới không còn reference sau rollback, giữ private/self-only để không cần DROP khẩn cấp. Byte-equivalent policy restore đã test PGlite.
-Migration tool chỉ ép thẻ cho DDL pháschema; additive patch có thể áp thẳng. Vì owner yêu cầu duyệt trước, **không gọi tool**, không chèn DROP giả ép thẻ, không dùng approval0371cũ. **Chưa có thẻ migration** trong lượt này.
-Xác nhận cần: **“Duyệt áp bản vá signals_p0_statement_scope ngày12/11: một helper self-only và SELECT policy, không đổi quyền/dữ liệu, không Publish.”** Sau xác nhận mới gọi migration đúng SQLguard/checksum, đọc live metadata, đo desktop/iPad+scoped user; rollbackpolicy nếu sai kết quả/regression.

## Còn chờ
1.Migration chờ owner duyệt riêng trước áp DB.
2.Live E2E saupatch và scoped account đúng người ảnh, không tựmint tài khoản khác.
3.Authenticated live EXPLAIN cần caller/session tool thích hợp; read tool không hỗ trợ SETROLE/claims an toàn. Fullgraphclone chưa có; không dùng DBowner plan để giả báo RLS.
4.Chưa nghiệm thu hết timeout/load competition; không Publish/mở quyền.