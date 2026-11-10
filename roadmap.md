# Roadmap — Báo cáo Kinh doanh theo Ngày/Tuần/Tháng/Quý

## MONITORING HOTFIX — 10/11/2026
- [x] MF1. Confirmed deployed pgcrypto exists only in extensions; 0299 schema-qualifies grant/reset/reveal calls, preserving search paths, ACLs and credentials. Hosted synthetic crypto roundtrip true.
- [x] MF2. Reproduced both legacy aliases; 0299 fixes comparison only, leaving unknown statuses/exact field conflicts, locks, guards and history intact. Hosted currently has no legacy-status rows; no historical rewrite.
- [x] MF3a. 43/43 focused regressions pass; deployed function repairs/ACL/search paths verified, build OK; no Publish or live business test writes.
- [ ] MF3b. Signed-in UI acceptance blocked: --self finds no matching account and preview is signed out; needs user's preview sign-in and authorized business inputs, not fabricated rows/password resets.

## PHÂN QUYỀN TOÀN BASE — 09/11/2026
- [x] BP1. Đọc yêu cầu, rà soát nguồn quyền/frontend/schema hiện hành; chưa có cơ cấu tổ chức toàn Base, chỉ có cơ cấu Kinh doanh.
- [x] BP2. Kế hoạch duyệt; giữ evaluator legacy và không phục hồi biz.*/k3.* qua Role cũ.
- [x] BP3a. 0292–0298 nền tảng cấu hình tổ chức có phiên bản, mặc định/trực tiếp/bộ quyền, thời hạn, RPC/audit/xem trước/xác nhận; không gán nhân sự thật.
- [x] BP4a. Nấc 1 chỉ kích hoạt năm quyền Sale Work + CRM cá nhân đã có ownership guard; các quyền khác server chặn active. Role/quyền riêng/gán Role fingerprint không đổi.
- [x] BP5a. Ba tab, đơn vị/chức danh, bộ quyền, preview/confirm/history; Mobile390/Desktop1280 cách ly lưu–đọc đạt.
- [x] BP6a. 82/82 tests, build OK; docs/base-permissions-verification.md ghi rõ phần chưa tích hợp.
- [ ] BP3b/BP4b/BP5b. Chưa hoàn tất ánh xạ Kinh doanh, adapters toàn module, mẫu nháp, gán nhiều người, mô phỏng tương lai và điều chuyển chuyên biệt; quyền chưa tích hợp chỉ nháp.
- [ ] BP6b. Nghiệm thu phiên thật bị chặn: --self không có tài khoản khớp, /organization→/login; cần người dùng đăng nhập Preview. Chưa Publish.

## HỢP NHẤT DIỄN BIẾN & ĐỒNG BỘ PHÂN CÔNG — 09/11/2026
- [x] HB1. Rà soát hai luồng ghi diễn biến, mẫu chọn nhanh, RPC note/status và luồng phân công + cache invalidation.
- [x] HB2. Một form "Cập nhật diễn biến": mẫu nhiều chọn + ghi chú tùy chọn + trạng thái tùy chọn; một note/lần lưu, chống trùng, không note tự động từ đổi trạng thái.
- [x] HB3. Mobile ưu tiên: chip nhóm, bàn phím không che Lưu, lịch sử cập nhật ngay; Desktop cùng logic.
- [x] HB4. Chi tiết: "DIỄN BIẾN TÍN HIỆU – X LẦN CẬP NHẬT", tách nhật ký hệ thống khỏi lượt note; giữ báo cáo note/tỷ lệ chốt.
- [x] HB5. Phân công: chỉ báo thành công sau backend xác nhận; invalidate đúng key list/count/detail theo user/quyền/lọc/trang; không request trùng/vòng lặp; giữ ưu tiên công việc.
- [x] HB6. 158 unit + 5 suite browser (390/1280) đạt; sửa lỗi thật: chi tiết tín hiệu thiếu label_ids và form đánh giá không nạp lại nhãn; không đổi dữ liệu thật, không Publish.

## P0 TÍN HIỆU LOAD MÃI — 09/11/2026
- [x] SL1a. RPC/grants tồn tại; pg_stat_statements page 2 calls mean7127.57/max7629.52ms, token14 mean3685.63ms; EXPLAIN quản trị view17ms không phải nghiệm thu authenticated. Không lock wait thấy trong mẫu.
- [x] SL2. 0283 bộ đếm không đọc history, SELECT permission initplans giữ nguyên điều kiện/RLS, index latest-note; không sửa dữ liệu hoặc sort.
- [x] SL3. Chờ tối đa15s/hủy request, retry=false; bộ đếm — và lỗi/thử lại độc lập, chặn tải thêm tự động sau lỗi; token chỉ sau list/count thành công.
- [x] SL4a. 157 tests; browser390/1280: page/count error, timeout, retry tay và luồng page/search/note cách ly đạt. docs/signal-load-hotfix-verification.md.
- [ ] SL1b/SL4b. Nghiệm thu Publish Sale/quản lý và đo authenticated sau sửa: --self không khớp, Publish→/login; cần đăng nhập/chỉ định tài khoản. Không ghi note thử thật hoặc tự Publish.

## CRM SÁU NHÓM & THÔNG TIN TÙY CHỈNH — 09/11/2026
- [x] CX1. Kiểm kê năm nhóm cũ, 0 khách/liên hệ/lịch/tương tác; kế hoạch duyệt, giữ nhóm pha trộn cũ.
- [x] CX2. Sáu nhóm đang dùng, tái dùng ID tương đương, thêm nhóm/tệp thiếu; legacy inactive/review, không chuyển khách/trùng.
- [x] CX3. 0280–0282: chín kiểu, custom_values ID ổn định, option/type/required/scope guards, catalog versions; 39 trường khởi tạo.
- [x] CX4. Cây tìm kiếm/phạm vi/xem trước, cài đặt tập trung; form thu gọn/giữ giá trị và tệp khi đổi nhóm quay lại.
- [x] CX5. Dynamic read/report/filter/export dùng lịch sử và cùng định nghĩa, phân tích đặc điểm/custom, khoảng và chọn nhiều không trùng.
- [x] CX6a. 49 test CRM, browser hồi quy chăm sóc/classification/custom tại 320/390/430/768/1280 theo từng suite đạt; build OK, số khách/liên hệ/lịch/tương tác giữ 0. docs/crm-custom-fields-verification.md.
- [ ] CX6b. Nghiệm thu phiên thật Sale/quản lý/cài đặt/export/keyboard và concurrency: --self không khớp tài khoản; chờ người dùng đăng nhập Preview và hồ sơ được phép. Không khách giả, chưa Publish.

## DIỄN BIẾN TỰ NGUYỆN & HIỆU NĂNG TÍN HIỆU — 09/11/2026
- [x] SN1a. Rà soát dependency/hiện trạng, kế hoạch duyệt; EXPLAIN truy vấn bỏ deadline 115.953→15.537ms sau grouped history, không tuyên bố toàn trang tăng tốc.
- [x] SN2. 0273/0277/0278 ngừng kỳ/tick/cron, care chỉ còn nhận, note-only chống trùng và giữ lịch sử.
- [x] SN3. 0274 Mobile30/Desktop40, lọc/sort/đếm backend, bỏ deadline/polling10s, change-token30s, note history paged và detail-by-ID.
- [x] SN4a. 0275/0276 báo cáo note phân bố/tác giả/tệp/lượt nhận, sales aggregates giữ tỷ lệ chốt; businessMinutes dùng chung.
- [x] SN5a. 152 test đạt; tải cách ly600/3000/5000; browser390/1280 lưu-đọc/page/report đạt, build OK; docs/signal-voluntary-notes-verification.md. Không dữ liệu test thật/Publish.
- [ ] SN1b/SN5b. Đo network/latency/memory trước-sau và nghiệm thu phiên thật/concurrency: --self không khớp tài khoản, chờ đăng nhập Preview và hồ sơ được phép.
- [ ] SN4b. Bộ lọc Hệ/Phòng/Nhóm và phạm vi bổ nhiệm chưa nối: cần xác nhận cách áp dụng với scope Role Tín hiệu hiện hành để không đổi quyền ngoài yêu cầu.
- [x] SN4c. 0279 ranh giới kết thúc/mở lại/bàn giao giới hạn first-note đúng trách nhiệm, không gán note lần sau cho lần nhận cũ.

## BIỂU MẪU THIẾT KẾ & TÀI LIỆU — 07/11/2026
- [x] DF1. 30 danh mục ID ổn định (7/9/7 loại + 7 sản phẩm); nhiều lựa chọn/Khác; 83 Order giữ nguyên, không phân loại lại lịch sử.
- [x] DF2. Private design-inputs, RLS theo Order, kiểm file thành công/đuôi/20MB/tổng 100MB/30 tài liệu hai phía; đầu vào tách file kết quả; gỡ liên kết giữ object tránh mất file khi hủy lưu.
- [x] DF3. Form tạo/sửa bỏ Thương hiệu/Logo chữ, Cài đặt thêm/sửa/kích hoạt/sắp xếp nguyên tử/số Order theo scope; lọc/báo cáo loại và sản phẩm không đếm trùng tổng.
- [x] DF4a. 55 unit/database/regression đạt; browser cách ly 390/1280 tạo ba luồng → file AI/ảnh/link → nhiều sản phẩm → lưu/đọc lại đạt; build OK, chưa Publish.
- [ ] DF4b. Nghiệm thu phiên thật upload/mở file/quyền/Cài đặt và camera/bàn phím thiết bị: --self không khớp tài khoản; cần người dùng đăng nhập Preview và hồ sơ được phép.

## TÁI CẤU TRÚC THIẾT KẾ — 07/11/2026
- [x] DS1. Rà soát Order/schema/quyền/workflow/Content/Video/KPI/thông báo và chốt phương án bảo toàn.
- [x] DS2. 0264–0269 phân luồng, đọc theo caller, ghi nguyên tử/audit/quyền file; đối soát 83 Order, 76 hoàn thành, 13 Marketing, 70 chưa phân loại, một completedAt; giữ URL cũ.
- [x] DS3. Năm mục menu, All-in-One/ba luồng, form chuyên môn, chi tiết và quyền luồng trong Role; gear tới cấu hình quyền hiện có.
- [x] DS4. Ba báo cáo riêng và dashboard, kỳ VN/mẫu số/giây/lịch sử/drill-down; biểu đồ hiển thị ngay.
- [x] DS5a. 77 unit/database/regression tests đạt; browser cách ly tạo/đọc/lọc/báo cáo tại 320/390/430/768/1280; build OK. Không tạo dữ liệu thật hay Publish.
- [ ] DS5b. Nghiệm thu phiên thật theo đúng tài khoản: --self không tìm được tài khoản khớp; chờ người dùng đăng nhập Preview hoặc chỉ định tài khoản cho phép kiểm tra. Chưa xác minh toàn chuỗi duyệt/lỗi thử lại, Content/Video thật và thông báo thật.

## HOTFIX ƯU TIÊN CÔNG VIỆC TÍN HIỆU — 07/11/2026
- [x] SF1. Hợp nhất Ưu tiên công việc và ưu tiên tiếp nhận; bảy thứ hạng đúng hạn diễn biến, mặc định work và chuyển lựa chọn priority cũ.
- [x] SF2. 0263 thêm list_work_priority/lịch diễn biến trước range, RLS/SELECT-only; cùng comparator Desktop/Mobile, kiểu khác độc lập; không ghi nghiệp vụ.
- [x] SF3. 143 unit/database test đạt; browser quản lý/Sale 320/390/430/1280 đạt 579/4/2/306, sáu dòng chờ đầu, lọc/chọn work/newest/reload. Build OK; docs/signal-work-priority-verification.md.
- [ ] SF4. Nghiệm thu dữ liệu thật quản lý/Sale trên Desktop/Mobile: mint --self không khớp, cần người dùng đăng nhập Preview; dữ liệu hiện tại 588 tổng/0 chưa phân công/3 chờ nhận không hủy, không còn ví dụ 4+2. Không ghi thử/Publish.

## ƯU TIÊN DANH SÁCH TÍN HIỆU — 07/11/2026
- [x] SP1. Thứ tự tab chung Desktop/Mobile, Chờ phân công đúng quyền, đếm cùng tập lọc.
- [x] SP2. 0261–0262 view security-invoker chỉ SELECT, sắp xếp trước range; thời gian phân công/chuyển trạng thái thật và fallback, hai nhóm chờ → đang xử lý → kết thúc, không sửa bản ghi/lịch sử.
- [x] SP3. Mặc định Ưu tiên tiếp nhận, giữ lựa chọn cũ/bộ lọc/cache invalidation/thẻ/báo cáo. 139 test đạt; browser Sale/quản lý 320/390/430/1280 thứ tự/đếm/lọc/tùy chọn/reload và hồi quy thẻ/đánh giá/hạn/báo cáo đạt; build OK. docs/signal-list-priority-verification.md.
- [ ] SP4. Nghiệm thu phiên thật: mint --self không khớp tài khoản, cần người dùng đăng nhập Preview. Không tạo dữ liệu thử, không Publish; backend chung đã áp dụng bổ sung chỉ đọc.

## DANH SÁCH TÍN HIỆU MOBILE — 06/11/2026
- [x] SM1. Một hàng tìm/thao tác, trạng thái cuộn ngang có đếm theo cùng tập RLS trừ trạng thái đang chọn; hạn trong Bộ lọc nháp áp dụng/xóa/số điều kiện, giữ phiên theo user.
- [x] SM2. Thẻ gọn tên tối đa hai dòng/trạng thái/SĐT/nhu cầu thật/tiềm năng/người/hạn diễn biến, Gọi/Zalo sao chép số/chi tiết hiện có; tải thêm 30 thẻ từ cache chung; desktop/nghiệp vụ không đổi.
- [x] SM3. 131 unit/database test đạt; browser cách ly 320/360/390/430/1280 đạt liên hệ không ghi dữ liệu/lọc nháp/hạn/status/count/giữ phiên/tải thêm/giữ cuộn/desktop, hồi quy đánh giá và lọc hạn đạt; build OK, không Publish.
- [ ] SM4. Nghiệm thu phiên thật và thiết bị Zalo/PWA: mint --self không khớp tài khoản, cần người dùng đăng nhập Preview; chưa xác minh ứng dụng gọi/Zalo trên điện thoại thật.

## ĐÁNH GIÁ CƠ HỘI / LỌC HẠN — 06/11/2026
- [x] AS1. Đánh giá chỉ tiềm năng/nhãn, tìm kiếm/chip/chọn nhiều/Quản lý nhãn, Lưu đánh giá; 0260 field-limited RPC giữ lịch đồng thời, trạng thái và diễn biến cũ.
- [x] AS2. Bốn chip hạn độc lập một hàng cuộn ngang; đếm cùng tập lọc khác trừ hạn đang chọn, dùng deadline_state; mobile chuyển các lựa chọn khác vào Bộ lọc.
- [x] AS3. 128 test Tín hiệu đạt; browser cách ly 320/360/390/430/1280 lưu/lỗi/retry/đọc lại/lọc/báo cáo, 320/390/430/1280 hạn/số đếm/tìm nhãn/giữ chọn/nút Lưu đạt, build OK; không Publish.
- [ ] AS4. Nghiệm thu phiên thật: Preview signed_out, mint --self không khớp; cần người dùng đăng nhập Preview và hồ sơ được phép. Chưa kiểm bàn phím/PWA thiết bị thật.

## CRM PHÂN LOẠI / DANH MỤC / BÁO CÁO — 06/11/2026
- [x] CC1. Đã thêm 7/8 tệp đang sử dụng vào ID nhóm thật; chống trùng và không ghi đè tệp cũ, 0 khách/liên hệ/lịch trước và sau.
- [x] CC2. Cây Nhóm–Tệp, thêm tệp trực tiếp/thêm nhóm, mô tả/thứ tự/ẩn/số khách theo scope; đặc điểm dùng config.group_ids; 0258–0259 guard phân loại, sắp xếp nguyên tử, tên trùng/cha có khách bảo vệ.
- [x] CC3. Search Nhóm→Tệp→đặc điểm; xác nhận đổi nhóm/cancel giữ tệp, chỉ lựa chọn mới đang dùng, tên mục cũ ngừng dùng; lọc tệp danh sách/báo cáo.
- [x] CC4. crm_report_filtered từ RPC lịch sử có scope, đủ bộ lọc/khoảng ngày, tám chỉ số, donut/cột/danh sách tỷ trọng, Chưa phân loại, xu hướng tháng/quý/năm theo tệp và chăm sóc/drill-down/export. Lâu chưa chăm sóc dùng lần hoàn tất >30 ngày có nhãn rõ; không suy diễn mất khách.
- [x] CC5a. 35 test CRM đạt; browser cách ly 320/390/430/1280 phân loại/cancel/lưu/đọc/cây/thêm tệp/lọc/drill-down và hồi quy 320/390/430/768/1280 đều đạt, build OK. docs/crm-classification-verification.md.
- [ ] CC5b. Nghiệm thu phiên thật Sale/quản lý/cài đặt/export: Preview signed_out, mint --self không có tài khoản khớp; cần người dùng đăng nhập và hồ sơ được phép. Không khách giả, chưa Publish.

## TÍN HIỆU CƠ HỘI & MOBILE — 06/11/2026
- [x] SIG1. Migration 0255–0257: tiềm năng/audit, nhãn chung/cá nhân ID ổn định, RPC-only có quyền và chống request trùng; 9 nhãn chung, 573 tín hiệu cũ Chưa đánh giá, không sửa phân công/lịch sử.
- [x] SIG2. Thẻ mobile, năm quick filters, bottom sheet giai đoạn/trạng thái/tiềm năng/nhãn/lịch, áp dụng/xóa/giữ phiên theo user; ưu tiên theo lịch thật, shell giữ nguyên.
- [x] SIG3a. Cập nhật nhanh tiềm năng/nhãn/lịch, quản lý nhãn cá nhân/chung, sticky save và guard double click tạo; giữ chuyển trạng thái/Gọi/Zalo cũ.
- [x] SIG4. Cơ cấu/biểu đồ tỷ lệ tiềm năng, giai đoạn tiềm năng cao, quá hạn, xu hướng ngày chốt thật và mẫu số theo toàn bộ bộ lọc; bảng mobile gọn.
- [x] SIG5a. 122 test tín hiệu đạt; browser cách ly 320/360/390/430/1280 đạt lưu→lỗi→retry→đọc lại→lọc/reload→báo cáo không tràn; build OK. docs/signal-potential-verification.md.
- [ ] SIG3b/SIG5b. Nghiệm thu phiên thật Sale/quản lý/lưu/đọc/report/Zalo và thiết bị/bàn phím cần người dùng đăng nhập Preview và hồ sơ được phép; mint --self không khớp, không chọn tài khoản khác. Chưa Publish; không thêm Tạm hoãn theo kế hoạch.

## CRM KHÁCH HÀNG — 06/11/2026
- [x] CRM1a. Nền tảng riêng CRM, quyền bổ nhiệm/phạm vi, danh mục tùy chỉnh và kiểm thử backend cách ly.
- [x] CRM2a. Hồ sơ tổ chức/cá nhân, liên hệ/địa điểm, chống trùng, lịch sử/bàn giao, file riêng tư và giao diện.
- [x] CRM3a. Lịch hẹn/chu kỳ/mùa vụ, tương tác, quá hạn/dời lịch, snapshot lịch sử và nhắc Base chống trùng.
- [x] CRM4a. Báo cáo theo kỳ/phạm vi, năm tỷ lệ, biểu đồ cơ cấu/hoạt động, drill-down, so sánh cơ bản và xuất có quyền.
- [x] CRM5a. Menu/ghim dùng chung, mobile 320/390/430/768/1280 cách ly đạt; 52 test đạt, build OK; docs/crm-verification.md. Chưa Publish.
- [ ] CRM5b. Nghiệm thu lưu→đọc→chăm sóc→báo cáo/quyền/file/nhắc thật: cần đăng nhập Preview và hồ sơ/lịch được phép; --self không khớp, không tự chọn tài khoản khác.
- [ ] CRM4b/UX. Chưa hoàn thiện phân tích đa mảng/khối/lâu chưa chăm sóc, tổng hợp so sánh đa cấp đầy đủ, trường chuyên sâu cấu hình theo nhóm, lịch cố định ngày tháng và màn quản lý mẫu cá nhân cho Sale; ghi rõ giới hạn trong docs/crm-verification.md.

## MOBILE NGHỈ PHÉP & ĐI SỚM MUỘN — 06/11/2026
- [x] ML1. Ba ô tạo trực tiếp, tab/danh sách/bộ lọc mobile gọn đúng quyền; giữ /leave và deep link, tách attendance.
- [x] ML2. Form/chi tiết/duyệt/báo cáo mobile, chọn nhanh và safe-area; giữ phép tính/hạn/bổ sung/API/quyền/Zalo.
- [x] ML3a. Browser cách ly 320/375/390/430/1280 đạt: tạo trực tiếp, nửa/cả ngày, lỗi/retry/giữ dữ liệu/bỏ thay đổi, phút/bổ sung/lý do, báo cáo, không lỗi JS/tràn; unit test và build OK. docs/mobile-3k-leave-verification.md; chưa Publish.
- [ ] ML3b. Gửi/duyệt/từ chối/hủy/gửi lại/Excel trên hồ sơ và phiên thật: cần người dùng đăng nhập Preview và cho phép hồ sơ thử; chưa kiểm thiết bị vật lý.

## MOBILE QUẢN LÝ 3K — 06/11/2026
- [x] M3K1. Gọn điều hướng/kỳ/ngày/tóm tắt và thẻ việc; giữ nguồn đo/thao tác/quyền và desktop.
- [x] M3K2. Tối ưu form tạo/cập nhật/tổng kết, sheet chi tiết, nhóm/theo dõi; không đổi API/database/nghiệp vụ.
- [x] M3K3a. Browser cách ly 320/375/390/430/768/1280 đạt: ngày/tạo/lỗi/retry/KPI số thay tổng/Có-Chưa/lịch sử/cảnh báo tổng kết; 6 hồi quy hộp Xóa đạt. Tổng 95 unit test hai module đạt, build OK; docs/mobile-3k-leave-verification.md, chưa Publish.
- [ ] M3K3b. Nghiệm thu AppShell/nhóm/phạm vi/10 kiểu đo/điều chỉnh sau chốt/tổng kết lại bằng phiên và hồ sơ thật: đang /login, mint --self không khớp; cần đăng nhập và hồ sơ được phép, không tự chọn tài khoản/ghi dữ liệu giả.

## TÙY CHỈNH GHIM MOBILE — 06/11/2026
- [x] P1. Bỏ menu ô ứng dụng mọi khu vực/tìm kiếm/truy cập nhanh; Tùy chỉnh tại Truy cập nhanh với chọn/bỏ/sắp xếp, nháp độc lập và Lưu; giữ storage/quyền cũ, desktop không đổi.
- [x] P2a. 29 unit test đạt; Launcher + chrome cách ly 320/390/767/1280 đạt: ghim cũ, lưu/hủy/reload/thứ tự/thu hồi quyền ngay trong dialog, route/desktop/không tràn/không lỗi JS; ảnh màn hình xác minh, build OK, chưa Publish.
- [ ] P2b. Nghiệm thu AppShell bằng phiên thật: Preview đang /login, mint --self không có tài khoản khớp; cần người dùng đăng nhập Preview, không tự chọn tài khoản khác.

## CHUYỂN MENU KPI SANG MARKETING — 06/11/2026
- [x] K1. Chuyển nguyên hai mục /settings/kpi-v2 và /reports-v2 sang Marketing trong cấu hình chung, giữ predicate quyền/nhãn/route/ghim, không đổi nghiệp vụ.
- [x] K2. 28 unit test đạt: KPI chỉ ở Marketing, route/ghim/tìm kiếm/nhãn/quyền cũ và 3K/KR giữ nguyên; Sidebar/Launcher/chrome hồi quy đạt. Trình duyệt cách ly 1280/390 xác minh mở hai route KPI cũ từ Marketing, không KPI trong Kinh doanh; build OK, chưa Publish. Không nghiệm thu dữ liệu KPI thật khi phiên chưa đăng nhập.

## BỎ HEADER LAUNCHER LẶP — 06/11/2026
- [x] H1. Bỏ h1/nút quay lại nội dung Launcher ở mọi khu vực; header chung có tên Trang chủ/khu vực, tìm kiếm cách header 16px, lưới gọn và giữ ghim.
- [x] H2a. Mười khu vực tại 320/390/767px chỉ một header/tiêu đề/back; ghim/bỏ ghim/back/home/fixed chrome và desktop hồi quy đạt; 25 unit test và build OK. docs/mobile-single-header-verification.md; không đổi nghiệp vụ, chưa Publish.
- [ ] H2b. Nghiệm thu phiên AppShell thật cần đăng nhập Preview (hiện signed_out, mint --self trước đó không khớp); không tự chọn tài khoản khác.

## KHUNG MOBILE CỐ ĐỊNH TOÀN BASE — 06/11/2026
- [x] S1. MobileAppChrome chung AppShell: header/nav fixed mọi route, tên module/cha, quay lại chỉ lịch sử được quan sát cùng user, fallback khu vực/home, tab đang chọn.
- [x] S2a. Một vùng cuộn document; đo chiều cao/safe-area, chừa nội dung và nâng nút fixed/sticky; modal z-50 trên chrome z-30; xử lý visualViewport bàn phím, desktop/deep link nguyên trạng.
- [x] S3a. 25 unit test đạt; chrome harness 320/390/767/1280, Launcher và Sidebar hồi quy đạt, build OK. docs/mobile-shell-verification.md; chưa Publish.
- [ ] S2b/S3b. Nghiệm thu AppShell/module/modal thật và bàn phím/safe-area/PWA thiết bị: cần đăng nhập Preview (mint --self không khớp hồ sơ) và thiết bị thật; không tự chọn tài khoản khác.

## TRANG CHỦ MOBILE APP LAUNCHER — 06/11/2026
- [x] L1. Cùng visibleNavigation với Sidebar; trang chủ mobile, màn hình khu vực qua root search, tìm kiếm chỉ chức năng đúng quyền.
- [x] L2. Ghim/bỏ ghim/sắp xếp theo tài khoản trên thiết bị; sáu ghim + Xem thêm; thanh dưới nối Task/chuông/hồ sơ thật, giữ deep link/desktop, không đổi backend.
- [x] L3a. 17 unit test đạt; Launcher cách ly 320/390/767/1280 và Sidebar hồi quy 1280/390/768 đạt; trang thật signed-out về login, build OK. Chi tiết docs/mobile-launcher-verification.md; chưa Publish.
- [ ] L3b. Nghiệm thu AppShell/chuông/deep link qua đăng nhập và thu hồi quyền thật: Preview đang đăng xuất, mint --self không khớp hồ sơ; cần người dùng đăng nhập, không tự chọn tài khoản khác.

## QUY HOẠCH MENU BASE — 06/11/2026
- [x] N1. Kiểm kê/ánh xạ 30 URL cũ sang 10 khu vực; Showroom và 6 mục con tương lai không có liên kết, không nhân bản chức năng.
- [x] N2. Sidebar hai cấp, giữ nguyên predicate quyền/route; mở/đóng theo người dùng, tự mở trang con, chọn đường dẫn cụ thể nhất, thu gọn/mobile.
- [x] N3a. Kiểm thử menu cách ly desktop 1280/mobile 390/tablet 768 đạt; không lỗi JS/tràn, build OK. Báo cáo tại docs/base-navigation-verification.md; không sửa nghiệp vụ/database, chưa Publish.
- [ ] N3b. Nghiệm thu AppShell và trang nghiệp vụ bằng phiên thật: đang /login, mint --self không khớp tài khoản; cần người dùng đăng nhập Preview. Khác biệt quyền menu Tiền Về/trang được ghi riêng, không tự sửa.

## HỘP XÁC NHẬN XÓA 3K — 05/11/2026
- [x] D1. Tái hiện dialog count=0 sau menu đóng; K3DeleteProvider ngoài Biz3KScreen giữ target/dialog cho Ngày/KG/KF, không timer.
- [x] D2. Guard đồng bộ chống gửi trùng, busy/inline error giữ mở; thành công đóng và invalidate toàn bộ k3_* gồm Thùng rác. Quyền/RPC/lịch sử không đổi.
- [x] D3a. 6 kiểm thử trình duyệt (1280/390 × Ngày/KG/KF) đạt với RPC chặn trong kiểm thử: đóng menu/refetch/blur/Quay lại/busy/Escape/lỗi/retry/đúng ID, không lỗi JS/tràn. 12 kiểm thử database xóa/khôi phục/lịch sử đạt.
- [ ] D3b. Xóa→Thùng rác→khôi phục trên phiên thật chưa nghiệm thu: --self không khớp tài khoản, người dùng đang /login; cần đăng nhập Preview, không tự chọn tài khoản/ghi dữ liệu thử thật. Chưa Publish.

## 3K LINH HOẠT / KỶ LUẬT NGÀY — 05/11/2026
- [x] F1. 0245/0247: xóa cá nhân có kết quả/chốt; khôi phục 15 ngày, purge giữ lịch sử bảo vệ; không mở quyền xóa nhóm. 12 kiểm thử xóa đạt.
- [x] F2a. 0246/0248: checkpoint theo plan_by 08:45, cron ngày 01:45 UTC; nguồn/lịch/nghỉ phép, dấu mốc bất biến và chống trùng. Áp dụng từ 06/11/2026, không hồi tố.
- [ ] F2b. Nghiệm thu checkpoint vận hành sau ngày hiệu lực và tinh chỉnh timestamp nguồn khi sửa lịch đã có: cần phiên/hồ sơ thật; chưa diễn giải checkpoint thiếu thành vi phạm.
- [x] F3. Sửa sau chốt giữ giá trị gốc và versions; tổng kết lại độc lập, 0249 đóng băng deadline xác nhận mới, giữ NULL lịch sử. Giữ giờ tổng kết thật đang cấu hình 20:00, không tự đổi.
- [x] F4a. Kỷ luật Ngày/Tuần/Tháng/Quý và cá nhân, mẫu số nghĩa vụ; close/Zalo mới có snapshot kỷ luật, không thay báo cáo cũ hoặc bật gửi.
- [ ] F4b/F5b. Nghiệm thu ghi→đọc UI 3K desktop/mobile và gửi Zalo: mint --self không khớp, cả hai viewport chuyển /login; cần người dùng đăng nhập Preview/chọn hồ sơ và cho phép gửi thật.
- [x] F5a. 210/210 kiểm thử 3K đạt, build OK, schema/deadline/cron thật xác minh. Không tạo dữ liệu thử thật, không Publish/bật Zalo.

## HOTFIX 3K DATABASE / XÓA — 05/11/2026
- [x] H1. 0244 áp dụng trên backend thật: creation_mode nullable; 18 legacy giữ NULL, 1 công việc mới lưu kiểu. Đã loại phụ thuộc kiểu tạo khỏi delete target ngày.
- [x] H2. k3_draft_delete alias thao tác Xóa thống nhất; KF duy nhất chuyển sang cha; guard quyền/kết quả kể cả lưu trữ/versions/thực hiện/tổng kết/chốt, khóa KPI và recheck writer; không purge bản hủy. Detail một bước không lặp Xóa KF.
- [x] H3. Lỗi SQL được ghi console kỹ thuật và thay thông báo thân thiện; giữ nguyên tạo/tổng kết độc lập khi lỗi danh sách.
- [x] H4a. 197/197 kiểm thử đạt, 12 quy tắc Xóa gồm nháp/trash/restore/legacy/reapply; build OK. Schema và execute grants thật xác minh. Kết quả 9/versions 15/chốt 1 không đổi; có hoạt động người dùng đồng thời, không tuyên bố toàn bộ rows bất biến. Chi tiết docs/k3-hotfix-database-verification.md.
- [ ] H4b. Nghiệm thu RPC theo phiên và UI thật chưa thực hiện: read-query từ chối EXECUTE k3_can, --self không khớp và trình duyệt chuyển /login. Cần người dùng đăng nhập Preview; không tạo dữ liệu thử trên backend chung, chưa Publish.

## TỐI ƯU TỔNG THỂ 3K CHO SALE — spec 840 dòng (05/11/2026)
- [x] O1a. Một form tên/hạn/ba cách đo; tùy chọn mở rộng, kế thừa tên/tiêu chí không nhập lặp; validation tại form và lưu nguyên tử hiện có.
- [x] O2a. Ngày ưu tiên công việc theo lịch thay danh sách KG tổng; thẻ một KPI cập nhật trực tiếp, nhiều KPI mở ngắn gọn; binary không chỉ tiêu 1, bằng chứng theo ngữ cảnh.
- [x] O3a. 0242 loại công việc hủy khỏi danh sách, giữ nguyên bản ghi; ngày có goal_id và deadline kế thừa. Quy tắc xóa/khôi phục/trạng thái/phạm vi/chốt/Zalo hiện có giữ nguyên và kiểm thử đạt.
- [x] O4a. 191/191 kiểm thử 3K đạt, build OK; đã xác minh 0242–0243 trên backend. 0243 nối xóa công việc đơn giản qua cha và hiện kết quả cá nhân ngoài lịch, không bỏ guard quyền/trạng thái/rà soát. Không sửa dữ liệu thật, chưa Publish.
- [ ] O1b/O2b/O3b/O4b. Chưa nghiệm thu UI desktop/mobile, nhiều KPI/phối hợp và ghi→đọc thật: phiên chuyển /login, mint --self không khớp; cần phiên hợp lệ và hồ sơ được phép. Lịch sử hủy vẫn lưu nguyên nhưng chưa có danh sách lịch sử hủy riêng. Không coi đợt tối ưu tổng thể đã nghiệm thu.

## TỐI GIẢN GIAO DIỆN 3K + CHUẨN SỬA/XÓA — spec 656 dòng (05/11/2026)
Nguyên tắc: một thông tin một lần hiển thị; một chức năng một nút; chưa có lịch sử bảo vệ → được xóa, đã có kết quả/chốt → không xóa; backend vẫn kiểm tra, không chỉ ẩn nút; bảo toàn dữ liệu/lịch sử; chưa Publish.
- [x] G1. Thẻ công việc tối giản: bỏ nút Bắt đầu/Sửa/Xóa rời → nút Cập nhật kết quả + menu 3 chấm; KG Cơ bản trùng tên KF không lặp dòng "KG:"; bỏ dòng "Đã chốt/Chưa đủ dữ liệu" khỏi thẻ (chuyển vào Nhật ký KPI); bỏ chọn trạng thái thủ công trong form cập nhật (tự động từ KPI).
- [x] G2. KPI Có/Chưa hiện một dòng "Kết quả: Đã/Chưa hoàn thành", bỏ "Chỉ tiêu 1"; các kiểu khác tách "Hôm nay" vs "Lũy kế", giữ hiển thị theo kiểu đo.
- [x] G3. Migrations 0240–0241: k3_soft_delete/k3_task_delete chặn xóa khi đã có kết quả KPI hoặc chốt sổ (kể cả chưa chốt), KF duy nhất của KG đang chạy không xóa lẻ; RPC k3_deletable cho UI ẩn Xóa đúng quy tắc; K3DeleteMenuItem dùng chung, xác nhận "Thùng rác 15 ngày"; bỏ nút Kết thúc chưa đạt/Tạm dừng/Hủy KG khỏi giao diện thường ngày (trạng thái lịch sử giữ nguyên); form đổi "Hủy"→"Bỏ thay đổi", cảnh báo thiếu hạn hoàn thành tại trường.
- [x] G4. Thùng rác 15 ngày đã có UI (Thùng lưu trữ) + backend 0197–0201; khôi phục đúng quan hệ, purge cron 02:30.
- [x] G5a. 7/7 test quy tắc xóa mới (k3DeleteRules.database.test.ts); toàn bộ 3K 182/182; typecheck sạch; build OK. Phát hiện và sửa lỗi thật: xung đột tên biến trong k3_soft_delete (0241).
- [ ] G5b. Nghiệm thu UI desktop/mobile và luồng xóa/khôi phục thật: phiên hết hạn, mint --self không khớp tài khoản; cần người dùng đăng nhập Preview. Chưa Publish.

## TRẠNG THÁI 3K TỰ ĐỘNG — spec 585 dòng (05/11/2026)
- [x] T1. 0235–0239: nguồn trạng thái KG/KF từ thời gian/KPI/nghiệm thu; KG không KPI riêng dùng KF bắt buộc, done counter/filter đồng bộ.
- [x] T2. Lưu công việc nguyên tử tự vận hành, KF bổ sung đủ KPI không cần bắt đầu; bỏ ready/start/reopen thường, chặn RPC trạng thái/progress, ngoại lệ có lý do/khóa/quyền.
- [x] T3a. Ngày/nguồn tổng kết/chốt mới dùng nguồn chung, snapshot/fingerprint/chốt/Zalo cũ giữ nguyên, tải lại 30 giây. 8 KG/4 KF/3 KPI/2 kết quả/1 chốt/38 events không đổi.
- [x] T4a. 18/18 test creation-state; full suite cuối 175/175 đạt. Một lượt trước có test hồi quy cũ không ổn định, rerun 34/34 và full 175/175 đạt. Build OK; docs/k3-automatic-state-verification.md.
- [ ] T3b/T4b. Ghi→đọc UI thật, desktop/mobile, chốt/gửi Zalo và ma trận chức danh: phiên hiện tại chuyển /biz/3k→/login; cần người dùng đăng nhập/chọn hồ sơ thật. Không dữ liệu giả, không chuyển legacy hay Publish/bật Zalo.

## UX TẠO CÔNG VIỆC 3K — spec 703 dòng (05/11/2026)
- [x] U1a. 0231–0234: giờ/phút nullable KG/KF/lịch, kế thừa, cuối ngày VN, ghi nguyên tử và cảnh báo ngoài KG; giữ dữ liệu cũ.
- [x] U2a. Cơ bản mặc định/Nâng cao chung form và RPC, binary kế thừa tiêu chí nguyên văn; không suy diễn số/đơn vị, giữ request identity.
- [x] U3a. RPC all/active/overdue/done bỏ bypass Admin cá nhân; worker chỉ phần việc được giao/phối hợp, nguồn tổng kết dùng lịch; Xem 3K nhân viên chỉ đọc và lọc phòng.
- [ ] U3b. Hoàn thiện bộ lọc Khối/Hệ/Phòng/Nhóm và chi tiết lịch sử/lộ trình đầy đủ; chưa hoàn tất triển khai.
- [x] U4a. Xóa nháp xác nhận qua RPC, bảo vệ kết quả/chốt, restore chặn đúng 360 giờ, purge xử lý config history; cron thật hoạt động.
- [x] U5a. 168/168 hồi quy 3K cuối cùng (maxWorkers=2), 11/11 test database tạo/trash, build OK; docs/k3-creation-ux-verification.md.
- [ ] U5b. Desktop/mobile và ghi→đọc lại UI thật: phiên injected không đăng nhập, mint --self không khớp tài khoản; cần đăng nhập Preview. Ma trận từng chức danh chưa nghiệm thu. Không dữ liệu giả, không bật Zalo, chưa Publish.

## TỔNG KẾT THỦ CÔNG / CHỐT TỰ ĐỘNG — spec 731 dòng (04/11/2026)
- [x] S1. Xác nhận Sale độc lập, version nguồn tại máy chủ, lịch sử và phạm vi ngày đúng lịch/kết quả.
- [x] S2. Tổng kết hôm nay: rà soát KG/KF/KPI/VNGB, cảnh báo thiếu, xác nhận không nhập lại KPI, không chốt hệ thống.
- [x] S3. Chốt 18h snapshot trạng thái thủ công riêng; nhật ký lỗi/idempotency/điều chỉnh; giữ chốt cũ; so sánh ID/revision tránh cảnh báo giả do thêm trường.
- [x] S4. Theo dõi trạng thái tách biệt, nhắc Base 17h/17h30 theo nghĩa vụ và quyền, cài đặt tập trung; click thông báo mở 3K.
- [x] S5a. Báo cáo Zalo 18h05 từ snapshot, xem trước/rút gọn giữ liên kết; không tự gửi/bật/chuyển dữ liệu cũ; 151 test và UI 360–1440px đạt.
- [ ] S5b. Nghiệm thu xác nhận→cập nhật→xác nhận lại→chốt→gửi Zalo thật: chờ người dùng cho phép thao tác và chọn hồ sơ/nhóm; Zalo vẫn Tắt, chưa Publish.

## BỘ ĐO KPI ĐA DẠNG — spec 866 dòng (04/11/2026)
- [x] M1a. 0216–0223: 10 kiểu đo, cấu hình JSON, snapshot cấu hình và revision kết quả; chặn đổi công thức đã có kết quả.
- [x] M2a. Máy tính chung, lịch/chu kỳ/chuỗi, bằng chứng, nghiệm thu theo revision; thời lượng chuẩn phút, chống chồng lấn, mốc tuần tự, nhiều KPI bắt buộc.
- [x] M3a. Bộ chọn 6+4 thẻ dùng chung Tạo KG/KF và Thêm KPI, nhiều KPI/KF; form kết quả động, preview phía máy chủ, nhật ký nghiệm thu; kế hoạch ngày tách tổng KPI.
- [x] M4a. Tổng hợp kỳ/monitor và báo cáo dùng kiểu đo; snapshot đo lường riêng không đổi fingerprint chốt; rà soát không tự purge, Thùng rác riêng 15 ngày.
- [x] M5a. Đối soát chỉ đọc giữ 2 KPI/1 kết quả/3 task/0 rà soát, Zalo vẫn Tắt; giao diện tài khoản thật 360/375/390/430/768/1280/1440px không tràn.
- [ ] M5b. Nghiệm thu tạo/cập nhật/chốt/nghiệm thu và gửi Zalo trên hồ sơ thật: cần người dùng cho phép thao tác và chọn hồ sơ/nhóm; chưa chuyển dữ liệu cũ, chưa Publish.

## FIX MODULE QUẢN LÝ 3K — 04/11/2026
- [x] F1. Một badge KF, kết quả ngày/lũy kế/%; cùng ngày thay tổng, khác ngày cộng dồn; UI thật hiển thị 30/200=15%.
- [x] F2. KF có lịch tự xuất hiện qua đọc ngày; kỳ/quản lý dùng nguồn đo lường có scope, không form trạng thái thủ công; KG có hoạt động KF không còn Chưa bắt đầu nhưng không tự hoàn thành.
- [x] F3. Tự chốt 18:00 VN, không actor giả, khóa và sửa có lý do/lịch sử; cài đặt/chốt sớm; kiểm thử cô lập đạt.
- [x] F4. Báo cáo Zalo độc lập, nhóm/giờ/phạm vi, outbox chống trùng và nhật ký; gửi vẫn Tắt.
- [x] F5. Thao tác lưu trữ/khôi phục task thiếu KPI có bản sao khớp nguyên bản, purge 15 ngày giữ chốt; không tự chuyển/xóa dữ liệu thật.
- [x] F6a. 123/123 test 3K, build OK; Admin thật đọc ngày/cài đặt/theo dõi và form sửa sau chốt bắt lý do; 360/375/390/430/768/1280/1440px không tràn.
- [ ] F6b. Nghiệm thu ghi/chốt và gửi Zalo thật: chờ người dùng cho phép thao tác nghiệp vụ và chọn nhóm/bật gửi. Lưu trữ KG/KF/KPI cũ có quan hệ mơ hồ chờ quyết định hồ sơ, không tự cascade hay đoán liên kết. Chưa Publish.

## FIX TOÀN DIỆN KPI 3K — spec 964 dòng (04/11/2026)
- [x] KPI-1a. Kiểm kê thật: 2 KG/1 KF/2 KPI/3 tasks/3 ngày; 3 task thiếu KPI, 2 thiếu KF, 2 ngày chốt; giữ nguyên. RPC inventory + private counted backup bổ sung, chưa chạy backup/chuyển đổi.
- [ ] KPI-1b. Xác minh bản sao qua RPC trước chuyển đổi hàng loạt.
- [x] KPI-2a. 0202–0205: nguồn KPI-người-ngày, 7 phương thức/4 điều kiện, thay thế có revision/idempotency, versions/chốt và derived KG/KF status; không sửa legacy.
- [ ] KPI-2b. Nối mọi tổng hợp kỳ/monitor và chặn toàn bộ đường legacy ghi thủ công.
- [x] KPI-3a. Form chung tại Ngày/chi tiết KG/KF/nhóm, nhật ký và chốt sổ theo phiên bản. 0206–0208: ghi chú riêng/lịch sử theo scope, khóa cấu hình, không đổi KPI có thực tế cũ và bảo vệ kết quả canonical đã chốt khỏi xóa KG/KF.
- [x] KPI-3b. Tuần/Tháng/Quý/monitor dùng measured read; form legacy không còn trong luồng chính, Ngày cũ chỉ đọc.
- [x] KPI-4a. Lưu trữ/khôi phục task chưa chốt thiếu KPI, sao lưu khớp, 15 ngày; lịch sử chốt giữ nguyên.
- [ ] KPI-4b. KG/KF/KPI legacy mơ hồ: chờ quyết định hồ sơ, không tự cascade; task thật chưa chuyển khi chưa cho phép.
- [ ] KPI-5. Phân loại/chuyển đổi an toàn A/B/C, bảo toàn chốt cũ và đối soát trước/sau; không đoán liên kết nguồn.
- [ ] KPI-6. Kiểm thử bổ sung concurrent/purge và UI bảy kích thước; bộ 3K 109/109 đạt (36 mới + 73 hồi quy), build OK. Phiên injected không đăng nhập được; mint --self không tìm thấy tài khoản, cần người dùng đăng nhập Preview để nghiệm thu thật. Không tạo dữ liệu giả, chưa Publish.

## FIX ĐĂNG NHẬP, DUYỆT TÀI KHOẢN VÀ RESET MẬT KHẨU — spec 411 dòng
- [x] AUTH-1. Nhật ký xác minh email_not_confirmed; cấu hình đọc thật email bật/auto-confirm tắt. 25 hồ sơ có Auth/email khớp/mật khẩu/đã xác nhận; reset gọi đúng admin API, duyệt không xác nhận email; độ mạnh mật khẩu hosted chưa đọc được đầy đủ. Không đổi tài khoản thật.
- [x] AUTH-2. Migrations 0181–0184: duyệt nguyên tử, xác nhận email độc lập, caller-scoped kiểm quyền, active guards/RPC, định danh/role guards và hạn mức/nhật ký reset; giữ tài khoản/dữ liệu thật.
- [x] AUTH-3. Yêu cầu email thật cho đăng ký mới, gửi lại xác nhận, username sign-in không lộ email, mật khẩu chung, thông báo và xác thực recovery SDK; UI duyệt/lưu chờ kết quả, trạng thái Auth thật đọc được tại tài khoản Nguyễn Thị Thanh Mai.
- [x] AUTH-4a. 101 kiểm thử cô lập/hồi quy đạt; UI Admin thật đọc trạng thái Email đã xác nhận, hộp gửi lại và recovery giả bị chặn; không lỗi trình duyệt; build OK. Chi tiết docs/auth-p0-verification.md.
- [ ] AUTH-4b. Hai nghiệm thu ghi thật đăng ký→email→duyệt→mật khẩu ban đầu và Admin reset→mật khẩu mới/cũ: cần tài khoản hoặc môi trường thử được người dùng cho phép và truy cập hộp thư xác nhận. Không đổi mật khẩu/tạo tài khoản/gửi email thử trên backend dùng chung; độ mạnh mật khẩu hosted/redirect allowlist chưa đọc đầy đủ; chưa Publish.

## FIX 3K NGÀY + TUẦN/THÁNG — spec 1086 dòng
- [x] A. VN timezone/deadline snapshot, khóa ghi, ngày gốc/owner, KPI/trạng thái, phiên bản tổng kết, nhận xét và lịch sử; dữ liệu legacy Hoàn thành dưới KPI được trình bày Chưa đạt, không sửa trạng thái/timestamp gốc.
- [x] B. Migrations 0174–0180: KG/KF, một k3_tasks dùng chung, chưa xếp lịch/xếp lịch, tổng kết kỳ/lịch sử, request-key + revision fences và phạm vi đơn vị lịch sử; dữ liệu thật giữ 1 ngày/1 công việc, không seed.
- [x] C. Ngày/Tuần/Tháng giữ ngữ cảnh, KG/KF, danh sách theo ngày, KPI theo đơn vị, quản lý/nhận xét, cài đặt bật riêng và deadline tùy chọn.
- [x] D1. 50 kiểm thử 3K + 55 regression Báo cáo/Cơ cấu đạt; build OK; phiên Admin thật mở Ngày/Tuần/Tháng/quản lý/cài đặt và form có dữ liệu hiện hữu; 360/375/390/430px không tràn, không lỗi trình duyệt.
- [ ] D2. Nghiệm thu ghi qua UI: chờ người dùng bật Tuần/Tháng, chọn ngày vận hành và cung cấp KG/KF/công việc thật để tạo–cập nhật–tổng kết–nhận xét; không tạo dữ liệu thử trên database dùng chung. Tuần/Tháng còn Tắt, chưa Publish.

## QUẢN LÝ 3K GIAI ĐOẠN 1 — spec 830 dòng
Nguyên tắc: phân hệ độc lập (dữ liệu/giao diện/cài đặt/lịch sử riêng), không bắt có Kế hoạch/KR mới được lập 3K, không đưa kết quả 3K vào KR/Dashboard KD, tái dùng đăng nhập/tài khoản/cơ cấu/chức danh, không dữ liệu giả, múi giờ VN, chưa Publish.
- [x] K3-1. Database + RLS + RPC: migration 0173 — k3_settings/log, k3_days (KG, planned_at, summarized_at, unique user+ngày), k3_tasks (KF, KPI dự kiến/thực tế, tiến độ, trạng thái, mũi khoan, VNGB), k3_task_events, k3_comments; quyền k3.use/view_scope/comment/settings qua k3_can (tái dùng sig_can/biz_manager/biz_all_scope), scope qua biz_scope_ok; giới hạn mũi khoan theo cấu hình; tổng kết bắt VNGB cho việc chưa xong; không hồi tố nghĩa vụ trước ngày hiệu lực.
- [x] K3-2. Giao diện "3K của tôi": chọn ngày + Hôm nay, thẻ tổng quan, ô KG, thêm/sửa/xóa công việc nhanh, cập nhật tiến độ/kết quả, mũi khoan (tối đa theo cấu hình), VNGB, nút Tổng kết 3K hôm nay, đúng hạn/trễ hạn.
- [x] K3-3. "Trong phạm vi quản lý": tổng quan ngày, danh sách nhân viên theo scope (Trưởng Nhóm/Phòng/GĐ Hệ/lãnh đạo Khối), chi tiết 3K nhân viên, nhận xét quản lý; quyền xem tách quyền sửa; kiểm tra máy chủ.
- [x] K3-4. Cài đặt 3K trong module: bật/tắt, ngày hiệu lực, giờ lập (08:45)/tổng kết (18:00), số mũi khoan tối đa (3), xem phạm vi kế thừa, quy chuẩn trạng thái, lịch sử cấu hình.
- [x] K3-5. Quyền & menu: nhóm quyền "Quản lý 3K" trong registry, menu Quản trị Kinh doanh → Quản lý 3K, route /biz/3k.
- [x] K3-6. Kiểm thử: 10 đơn vị + 10 database (scope, giới hạn mũi khoan, VNGB tổng kết, chống sửa chéo, lịch sử xóa, chống trùng ngày) đạt; typecheck/build đạt; UI thật desktop + 390px không tràn, không lỗi trình duyệt; module mặc định Tắt, chưa tạo nghĩa vụ.
- [ ] K3-7. Module Ngày đã được người dùng bật từ 02/11/2026 và có 1 công việc thật; chờ nghiệm thu ghi/cập nhật/tổng kết/nhận xét với hồ sơ thật được cho phép; chưa Publish.

## FIX TỔNG THỂ QUẢN TRỊ KINH DOANH (SOURCE 35) — spec 909 dòng, 10 phần
Nguyên tắc: không xây lại module, không xóa/reset dữ liệu thật, không động module khác, không tự khóa Báo cáo 2027, chưa Publish.

- [x] P1. Độ chính xác Báo cáo: migration 0169 — biz_report_month_coverage (4 trạng thái Đầy đủ/Chưa đầy đủ/Chưa có/Không áp dụng, liệt kê kỳ thiếu), biz_opening_actuals + RPC xác nhận số liệu đầu kỳ (quyền, nguồn bắt buộc, lịch sử sự kiện, không tự tạo 0, chống cộng trùng với báo cáo chính thức), biz_report_coverage_read; biz_rolling_basis dùng độ phủ thay vì NULL=0.
- [x] P2. KR cuốn chiếu: nhãn rõ trên giao diện Rolling; bản nháp qua tháng mới có cảnh báo + Cập nhật theo tháng mới (rebaseMonths giữ tháng còn chỉnh được, theo kế hoạch hiện hành cho tháng mới khóa) + Hủy; duyệt kiểm tra lại nguồn tại thời điểm duyệt (đã có từ 0167/0168). Lớp biểu đồ Dashboard riêng vẫn chưa nối (mục riêng bên dưới).
- [x] P3. Chuyển chu kỳ: BizDocuments mặc định chu kỳ/kỳ theo cấu hình hiệu lực tại kỳ đó (kể cả kỳ lịch sử), đổi tab chọn kỳ hiện tại của chu kỳ; nghĩa vụ theo chu kỳ từng ngày (0164/0165) giữ không sót/trùng/hồi tố.
- [x] P4. Phê duyệt KR cuốn chiếu: nhãn "Điều chỉnh phân bổ tháng", chi tiết duyệt có tổng quan + bảng trước/sau từng chỉ số/tháng + cơ sở tính; snapshot đơn vị/người duyệt đóng băng khi gửi.
- [x] P5. Bộ luồng duyệt mẫu: migration 0171 — biz_workflow_seed_defaults (5 nhóm × từng Hệ, idempotent, chức danh bổ nhiệm, Cần hoàn thiện khi thiếu người, không ghi đè luồng có sẵn) + biz_workflow_simulate; UI Quy trình mẫu Sứ Việt trong Cài đặt → Quy trình phê duyệt. Đã chạy khởi tạo trên dữ liệu thật: 45 luồng (8 hoạt động, 37 cần hoàn thiện, 0 ghi đè).
- [x] P6. An toàn phê duyệt: luồng thiếu người ở trạng thái Cần hoàn thiện (không kích hoạt, không tự thông qua); Kiểm tra quy trình hiển thị chuỗi duyệt/nguyên nhân thiếu; cấm tự duyệt qua skip_if_submitter + kiểm tra lượt máy chủ (đã có, test mới xác nhận).
- [x] P7. Giao diện: Công việc của tôi có trạng thái lỗi + Thử lại; Phê duyệt có lọc thời gian gửi + tab Trong phạm vi quản lý; mobile 390px không tràn (Báo cáo/Phê duyệt/Cài đặt).
- [x] P8. Hiệu năng: migration 0170 thay khóa bảng biz_documents bằng khóa advisory theo người dùng, phối hợp giữa lưu báo cáo và xác nhận đầu kỳ; giữ kiểm soát đồng thời.
- [ ] P9. Nghiệm thu Nhóm A–D trên dữ liệu thật: cần nhân viên thật có mục tiêu + báo cáo nguồn đủ để nộp/duyệt thật; không tạo dữ liệu giả.

## Điều chỉnh phân bổ KR (Rolling Plan) — đã xong trước đó
- [x] Hồ sơ phân bổ riêng, tái sử dụng phê duyệt KR, kiểm tra nguồn chính thức/phiên bản và thời điểm khi duyệt; không thay cam kết năm.
- [x] Tính phần còn phải đạt từ tháng đã kết thúc đủ dữ liệu; khóa tháng lịch sử/hiện tại; chia đều/tỷ trọng/tự nhập bằng số nguyên chính xác.
- [x] Giao diện điều chỉnh, lịch sử, cảnh báo nguồn thay đổi và tổng phân bổ hiện hành tại KR; Dashboard đánh giá giữ cam kết chính thức.
- [x] 56 kiểm thử KR/phân bổ/báo cáo/tổ chức đạt, trong đó 19 kiểm thử Rolling; đọc mục tiêu thật trên desktop/mobile không lỗi, không tạo dữ liệu vận hành; chưa Publish.
- [ ] Nghiệm thu biểu mẫu và gửi/duyệt bằng nhân viên thật: phiên hiện tại là Admin không có mục tiêu cá nhân; mục tiêu hiện có thiếu báo cáo lịch sử chính thức. Cần chọn tài khoản và hồ sơ thật đủ nguồn.
- [ ] Lớp biểu đồ phân bổ tương lai riêng trên Dashboard: chưa nối, không dùng phân bổ để thay tỷ lệ cam kết năm hiện tại.

- [x] Đồng bộ mặc định Tuần từ 02/11, giữ ngoại lệ/lịch sử và chặn kích hoạt khi thiếu deadline; không hồi tố.
- [x] Một nơi sửa deadline Báo cáo, xem trước kỳ và cảnh báo cấu hình thiếu/ngắn.
- [x] Bỏ chế độ Tạm tính ở KR/Dashboard và khóa nguồn chính thức phía máy chủ; giữ điều chỉnh và tổng hợp không trùng.
- [x] 122 kiểm thử đạt; mở Cài đặt bằng phiên thật, desktop và 360/375/390/430px không tràn; chưa Publish.
- [ ] Hoàn tất lịch Tuần vận hành: cần người dùng chọn mốc đóng nộp bù và xác nhận khoảng mở–hạn cuối hiện dưới 24 giờ.

- [x] Sửa nộp Kế hoạch: Google Docs chính thức, validation nháp/nộp, pha kỳ và mở tài liệu, lỗi chuẩn hóa; 94 tests đạt, form desktop/mobile bằng nháp có sẵn, không đổi dữ liệu/deadline.
- [ ] Nghiệm thu nộp Kế hoạch thật của Lê Minh Ngọc và refresh sau nộp: cần link kế hoạch thật và xác nhận nộp; không lưu/nộp URL thử vào dữ liệu vận hành.

- [x] Bước 1: Nền tảng chu kỳ & deadline (biz_report_cycle_configs, biz_report_cycle_of, deadline report_day/report_week, period_start/end, periodCycle.ts) — migrations 0155/0156, 17 tests đạt
- [x] Bước 2: Nghĩa vụ nộp & form theo chu kỳ (biz_my_work theo chu kỳ được giao, save/start/late-request nhận day/week, phân bổ tuần giao tháng) — migration 0157, typecheck+build đạt
- [x] Giao diện Cài đặt trong Báo cáo: cấu hình hiện có, kế thừa có ngày hiệu lực/lịch sử, xem trước, deadline Ngày/Tuần và form phân bổ tuần; mở được bằng Admin, kiểm tra mobile không tràn.
- [x] Chặn gửi lần đầu sai deadline tại máy chủ, dùng một lần quyền nộp bù; 59 kiểm thử quy tắc đạt, không tạo dữ liệu vận hành.
- [x] Mở rộng nguồn KR cộng dồn theo khoảng/đoạn phân bổ cho Dashboard hiện có; chặn cộng nguồn chồng lấn, thiếu nguồn trả NULL.
- [ ] Nghiệm thu lưu cấu hình → nhân viên nộp Ngày/Tuần/Tháng/Quý trên dữ liệu thật: cần xác nhận lịch và hồ sơ thật; giữ cấu hình hiện có.
- [x] Thống kê nghĩa vụ Dashboard theo chu kỳ thực thay vì kỳ xem; kiểm thử lịch chuyển chu kỳ và thành viên không tạo nghĩa vụ trùng.
- [ ] Nghiệm thu tổng hợp đa chu kỳ/mục tiêu lịch sử qua luồng thật: cần hồ sơ nguồn thật và xác nhận nộp, không tạo dữ liệu giả.

## FIX P0 Thống nhất phân quyền Kinh doanh (2026-11-03)
- [x] Backend: biz_participant/biz_all_scope/biz_can/k3_can/biz_effective_access bỏ mọi nhánh Role tổng; 7 RPC (cycle_milestones, deadline_save, document_save/start, my_work, report_cycle_save/delete) kiểm quyền qua biz_can — migrations 0185–0188.
- [x] Frontend: can('k3.*') đọc quyền hiệu lực máy chủ; Cài đặt tổng ẩn nhóm Quản trị Kinh doanh/Quản lý 3K khỏi ma trận Role + quyền riêng; bỏ hiển thị ngoại lệ theo Role.
- [x] Test: permission-unification.database.test.ts 6/6; cập nhật harness k3 sang biz_admin; 349/354 (5 lỗi lịch có sẵn); build OK; UI Super Admin: menu Biz đầy đủ, ma trận Role 391 quyền không còn biz/k3.
- [ ] Nghiệm thu bằng tài khoản thật: nhân viên có Role legacy nhưng chưa bổ nhiệm (ví dụ tài khoản Showroom/Kinh Doanh Phân Phối chưa vào Cơ cấu) phải mất menu Biz; cần xác nhận trước khi thao tác dữ liệu thật. Chưa Publish.

## NÂNG CẤP TOÀN DIỆN QUẢN LÝ 3K — spec 1386 dòng
Nguyên tắc: MỘT KG – NHIỀU KF – NHIỀU NGƯỜI – NHIỀU NGÀY – MỘT NGUỒN DỮ LIỆU. KG/KF xuyên thời gian (start→deadline tùy ý, không hardcode kỳ), Ngày/Tuần/Tháng/Quý chỉ là góc nhìn. Bỏ ô KG văn bản theo ngày (giữ lịch sử, không tự chuyển). Lời mời thành viên chấp nhận/từ chối, phân công KF, phối hợp liên nhóm không mở rộng quyền xem. Chốt sổ cá nhân theo ngày, sửa sau chốt ghi lịch sử không cộng trùng. KPI: cộng dồn/tỷ lệ/mốc, chống cộng trùng và cộng chéo đơn vị. Quyền 3K chỉ từ Cơ cấu tổ chức + cài đặt module, Admin/Super Admin full. Độc lập KR/Kế hoạch/Báo cáo KD. Bảo toàn dữ liệu cũ, không dữ liệu giả, giờ VN, chưa Publish.
- [x] 3K2-0. Khảo sát mô hình 0173–0180 thực tế.
- [x] 3K2-1. Bước 1 — Mô hình dữ liệu: migration 0189 (KG custom range/trạng thái/trọng tâm, k3_goal_members, k3_action_collaborators, k3_kpis đa dòng + backfill, cài đặt quyền nghiệp vụ, RLS theo k3_goal_visible).
- [x] 3K2-2. Bước 2 — Backend: migrations 0190–0193 (goal/action save v2, trạng thái, mời/chấp nhận/thu hồi, KPI RPC, goal list/detail, member search, module settings, worker_ok cho thực thi chung, góc nhìn Quý, day read kèm KG/KF). 12 test database mới đạt.
- [x] 3K2-3. Bước 3 — Desktop: tab KG tham gia (lọc/lời mời/chi tiết/KF/KPI/thành viên), bỏ ô KG văn bản ngày (giữ lịch sử đọc), chọn KF vào hôm nay, góc nhìn Quý chỉ đọc, cài đặt quyền nghiệp vụ. Typecheck + 56 test hồi quy đạt.
- [x] 3K2-4. Bước 4 — Desktop 1280px: tab KG tham gia, Tạo KG, Quý, Cài đặt, bỏ ô KG văn bản, không lỗi JS. Mobile 390/768 chưa đo được màn 3K (harness điều hướng preview bị chặn), bố cục dùng cùng lớp responsive đã kiểm trước đó.
- [ ] 3K2-5. Còn lại: nghiệm thu ghi thật (tạo KG/KF/mời thành viên/chốt sổ bằng tài khoản thật được cho phép), kiểm mobile thật, chưa Publish.

## NÂNG CẤP 3K THỐNG NHẤT 2 KHU VỰC — spec 1240 dòng (2026-11-04)
Nguyên tắc: một mô hình KG/KF/KPI, hai không gian (3K Của Tôi / 3K Nhóm-Phòng Ban), một nguồn dữ liệu; bỏ tab "KG tham gia" và "Trong phạm vi quản lý" độc lập; quyền chỉ từ Cơ cấu tổ chức; bảo toàn dữ liệu/lịch sử; chưa Publish.
- [x] 3K3-1. Backend fix A–D: migrations 0194 (logic) + 0195 (khôi phục thông báo tiếng Việt); thu hồi thành viên chặn ghi KF cũ, sửa ngày KG custom lưu thật, KPI cùng đơn vị tách theo kpi_id, KF chưa tới ngày không vào danh sách hôm nay.
- [x] 3K3-2. Test database A–D: 16/16 k3Goals, 45/45 toàn bộ 3K; hồi quy biz 365/370 (5 lỗi lịch có sẵn, không liên quan).
- [x] 3K3-3. Giao diện: Biz3K còn 2 tab + Cài đặt; Biz3KGoals variant personal/scope; "3K Của Tôi" có Tạo KG trực tiếp; "3K Nhóm/Phòng Ban" gộp Theo nhân viên + Theo KG.
- [x] 3K3-4. UI desktop 1280 + mobile 390 qua menu thật: 2 tab mới, không còn tab cũ, không tràn ngang, không lỗi JS; typecheck sạch.
- [ ] 3K3-5. Nghiệm thu ghi thật bằng tài khoản nhân viên/quản lý được cho phép (tạo KG → mời → chấp nhận → ghi kết quả → chốt sổ); chưa Publish.

## CHUẨN HÓA GIAO DIỆN VÀ QUY TRÌNH 3K — spec 899 dòng
Nguyên tắc: Tạo công việc = tạo KG; một KG một/nhiều KF kèm KPI/deadline/người phụ trách; mỗi ngày chỉ ghi nhận thực hiện; bảo toàn dữ liệu/lịch sử cũ; quyền theo Cơ cấu tổ chức kiểm tra tại backend; chưa Publish.
- [x] B1–B2. Migration 0196: k3_quick_create (KG+KF+KPI nguyên tử, request_key chống tạo trùng, bắt đầu cần ≥1 KF, mời thành viên kèm), k3_goal_list thêm lọc 'collab' (chỉ KG có phối hợp), k3_team_read thêm status_key (none/planned/updated/summarized/reconfirm) + goals_active/kf_active/kf_overdue thay khái niệm "Chưa lập 3K".
- [x] B3. Ba tab nghiệp vụ + nút Cài đặt riêng (Biz3K.tsx): 3K Của Tôi (KG cá nhân + KF được giao + Ngày/Tuần/Tháng/Quý/Tất cả), 3K Nhóm/Phòng Ban (chỉ KG phối hợp, lọc Tôi chủ trì/Tôi tham gia/Đang thực hiện/Quá hạn/Hoàn thành), Theo Dõi Nhân Viên (chỉ cấp quản lý).
- [x] B4. Quyền backend đã có từ 0185–0194 (k3_can theo bổ nhiệm, thu hồi thành viên chặn ghi); không cấp quyền qua Role tổng.
- [x] B5. UX: Biz3KQuickCreate (form KG + KF + KPI một lần lưu, Lưu nháp/Lưu và bắt đầu, mời thành viên cho KG nhóm); Biz3KMyDay thay "Thêm công việc" bằng "Tạo công việc" + "Ghi nhận thực hiện" (chọn KF có sẵn, không tạo KG giả); Biz3KManage trạng thái mới + 8 chỉ số tổng quan + lọc đơn vị + chi tiết KG/KF nhân viên.
- [x] B6. Kiểm thử: 7 test database mới (0196) đạt; toàn bộ 3K 73/73; hồi quy Biz 372/377 (5 lỗi lịch có sẵn: effective-access, my-work); typecheck/build OK; UI thật desktop 1280 + mobile 390 qua menu: đủ 3 tab, form tạo, không tràn ngang, không lỗi trình duyệt.
- [ ] Nghiệm thu luồng ghi thật bằng tài khoản nhân viên/quản lý (tạo công việc → KF → ghi kết quả nhiều ngày → chốt sổ → quản lý theo dõi): cần tài khoản thật được phép; chưa Publish.

## 3K – Thùng lưu trữ (đang làm)
- [x] Migration 0197: xóa mềm/khôi phục/trash_list/purge + cron 02:30
- [x] 0198: RPC đọc loại trừ bản ghi đã xóa mềm
- [x] 0199/0200: guard ghi goal/action/plan_task
- [x] 0201: guard kpi_save + task_save
- [ ] UI: menu ba chấm, hộp xác nhận, Thùng lưu trữ, khôi phục
- [ ] Test database k3Trash + hồi quy

## 3K – Nâng cấp mới (spec 670 dòng, chờ)
- [ ] Deadline KG/KF tới giờ/phút (VN)
- [ ] KPI đa phương thức đo; tự tính tiến độ/trạng thái
- [ ] Lộ trình KF theo ngày/giờ/định kỳ; tự hiển thị vào 3K Của Tôi

## 3 CHỨC NĂNG ĐỀ NGHỊ TÀI CHÍNH — spec 621 dòng (2026-11-09)
Nguyên tắc: ba chức năng riêng (Tạm Ứng / Thanh Toán / Tạm Ứng Lương) dùng chung nền tảng phê duyệt; tái dùng tài khoản/nhân sự/tổ chức/quyền/thông báo hiện có; người tạo chỉ xem đề nghị của mình; Tạm Ứng Lương phân quyền riêng chặt; không tự chuyển khoản/khấu trừ lương; không ảnh hưởng Tiền Về và module khác; bỏ "Sắp ra mắt" chỉ khi hoạt động + kiểm thử; chưa Publish.
- [x] FR1. Khảo sát hạ tầng: quyền, thông báo, tổ chức/bổ nhiệm, mẫu module ot_.
- [x] FR2. Migration dữ liệu: bảng fr_* (đề nghị, bước duyệt, sự kiện, cài đặt, danh mục loại thanh toán), RLS, quyền fr.*.
- [x] FR3. RPC: tạo/nháp/gửi/duyệt/từ chối/bổ sung/hủy/chi tiền/quyết toán/khấu trừ, chống chi trùng, lịch sử bất biến.
- [x] FR4. Thông báo đúng người có quyền, liên kết đúng đề nghị; không gửi lương vào nhóm chung.
- [x] FR5. Giao diện: danh sách/tạo/chờ tôi xử lý/báo cáo/cài đặt theo tab; mobile-first; menu bỏ "Sắp ra mắt" khi xong.
- [x] FR6. Báo cáo riêng từng chức năng theo quyền; số liệu thật, không đếm trùng.
- [ ] FR7 (còn: nghiệm thu phiên đăng nhập thật, upload file thật, xuất Excel). Kiểm thử đầy đủ theo mục 18 của spec; chưa Publish.

## BẢNG KÊ CHI PHÍ ĐỀ NGHỊ THANH TOÁN — spec 626 dòng (2026-11-09)
Nguyên tắc: một đề nghị nhiều khoản chi có cấu trúc; backend tự tính thành tiền/tổng tiền, không tin số client; Desktop bảng nhập nhanh, Mobile thẻ thu gọn + form ngắn; đề nghị cũ không tự chia dòng; không đổi quy trình duyệt/thông báo/phân quyền; chưa Publish.
- [x] BL1. Migration 0288: fr_request_lines (cha–con, line_total backend tính), fr_line_catalog (8 mục mẫu, quản lý qua quyền Cài đặt Thanh Toán), fr_save/fr_submit/fr_report nâng cấp (chặn đề nghị mới thiếu khoản chi, giữ đường đi cũ cho đề nghị trước nâng cấp).
- [x] BL2. Component dùng chung ExpenseLines (editor bảng Desktop / thẻ + Dialog Mobile, view chỉ đọc hai chế độ); form Thanh Toán bỏ ô Số tiền + Nội dung chi tiết, tổng tự tính; đính kèm thêm liên kết tài liệu.
- [x] BL3. Chi tiết đề nghị hiển thị bảng kê chỉ đọc; báo cáo thêm "Theo khoản chi" không nhân trùng tổng; Cài đặt thêm quản lý danh mục khoản chi (thêm/đổi tên/ẩn).
- [x] BL4. Kiểm thử: 23/23 (đơn vị + database PGlite: tính lại tổng, chống trùng dòng, chặn dòng rỗng/âm, đề nghị cũ vẫn gửi được, báo cáo không nhân dòng); typecheck/build OK.
- [ ] BL5. Nghiệm thu phiên đăng nhập thật (tạo đề nghị nhiều khoản trên Mobile/Desktop, duyệt, chi, báo cáo); chưa Publish.

## THÔNG BÁO ZALO NHÓM CHO 3 CHỨC NĂNG TÀI CHÍNH — spec 627 dòng (2026-11-09)
Nguyên tắc: một kết nối OA chung, ba cấu hình độc lập theo kind; tái dùng hạ tầng GMF (postGroup) và mẫu outbox của Đơn từ; lưu nháp không gửi; chống trùng dedup_key + claim; lỗi Zalo không ảnh hưởng nghiệp vụ; Tạm Ứng Lương mặc định tắt và mẫu tin che tên/số tiền/lý do; không động vào tích hợp Zalo hiện có; chưa Publish.
- [x] ZG1. Migration 0289: fr_zalo_group_config (theo kind, 8 sự kiện, lời dẫn), fr_zalo_group_events (outbox + dedup), trigger từ fr_events + chuyển trạng thái done, RPC lưu cấu hình theo quyền fr.*.settings; kèm sửa RLS fr_payment_types/fr_line_catalog (finding bảo mật đã đóng).
- [x] ZG2. Server: zaloGroup.server.ts (xử lý hàng đợi, gửi thử, gửi lại) + zaloGroupMessage.ts (mẫu tin, lương che dữ liệu) + functions layer theo quyền; nối vào dispatch-cron và đánh thức sau RPC ghi.
- [x] ZG3. Giao diện Cài đặt → Thông báo Zalo trong từng chức năng: trạng thái OA, chọn nhóm (API hoặc nhập ID), bật/tắt sự kiện, xem trước mẫu, gửi thử [TIN NHẮN KIỂM TRA], lịch sử gửi + gửi lại; mở đề nghị qua ?open=.
- [x] ZG4. Kiểm thử: 32/32 (database queue/dedup/quyền/lương che, đơn vị mẫu tin), typecheck/build OK, 3 trang tải không lỗi.
- [ ] ZG5. Nghiệm thu gửi nhóm thật (cần OA đã cấp quyền GMF + nhóm thật) và phiên đăng nhập; chưa Publish.

## SƠ ĐỒ TỔ CHỨC TOÀN BASE & CHUẨN HÓA QUYỀN GIÁM ĐỐC — spec (2026-11-10)
Nguyên tắc: không xây lại phân quyền, giữ hai mã chức vụ executive_director/deputy_executive_director, kế thừa dữ liệu Kinh doanh thật, không đổi quyền các cấp khác, chưa Publish.
- [x] OC1. Migration 0300: biz_executive_holder; biz.intervene cho cả Phó Giám đốc; bước duyệt cấp Giám đốc (position step) GĐ/P.GĐ đều xử lý, một người đủ, vẫn chặn tự duyệt/chưa tới bước; thông báo gửi cả hai.
- [x] OC2. Sơ đồ tổ chức mặc định tại /organization: Công ty → GĐĐH → P.GĐĐH → các Khối (Kinh doanh từ dữ liệu biz thật, Marketing/Vận hành từ cấu hình base), mở rộng/thu gọn, tìm kiếm, chạm nhân sự xem chức danh/nhiệm vụ/quyền.
- [x] OC3. Kiểm thử: orgChart unit tests + executive-parity PGlite (intervene, holder, assigned, notify patch).
- [ ] OC4. Nghiệm thu phiên đăng nhập thật (sơ đồ Mobile/Desktop, duyệt bước Giám đốc bằng tài khoản Phó Giám đốc); chưa Publish.
