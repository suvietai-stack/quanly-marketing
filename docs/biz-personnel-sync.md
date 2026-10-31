# Đồng bộ nhân sự, chức vụ và cơ cấu — 31/10/2026

## Kết quả
1. **Tự gán Nhân viên:** `biz_org_save('member',...)` dùng danh mục `code=employee`, chỉ tạo khi không có chức vụ/manager hiệu lực. Thêm Nhóm hoặc Phòng đều được; người quản lý không bị hạ cấp. Thêm lại không tạo trùng.
2. **Đơn vị bổ nhiệm:** `biz_appointment_save` suy ra Phòng/Hệ từ Nhóm, đồng bộ cùng giao dịch với quyết định. Trưởng Phòng chỉ thêm Phòng; Giám Đốc Hệ/điều hành không tạo thành viên mỗi Phòng. Quyền Hệ/Khối từ bổ nhiệm hiện có.
3. **Kiêm nhiệm:** chức danh chính xếp theo cấp snapshot giảm dần, thời điểm bắt đầu tăng dần và ID ổn định; giữ toàn bộ bổ nhiệm để tính quyền. Các phân công phụ/tương lai dùng `biz_member_affiliations`, không thêm nghĩa vụ cá nhân vào nguồn `biz_department_members`. Không sửa các phân công cũ hàng loạt.
4. **Danh mục:** dùng chung danh mục hiện có, giữ ID/tên hiện tại. Chặn đổi cấp/chính sách/phạm vi hoặc tắt chức vụ còn quyết định hiệu lực/tương lai. Thống kê `BizPositions` vốn đếm user duy nhất còn hiệu lực, giữ nguyên.
5. **Quyền và duyệt:** giữ `biz_can`, quyền là hợp bổ nhiệm, không ghi Role Base. Query mutations làm mới toàn bộ `biz_*` và quyền. Luồng mới dùng resolver hiện có; không thay snapshot hồ sơ đang chờ. Không tự duyệt hoặc bỏ bước. Chuyển giao hồ sơ đang chờ vẫn sử dụng thao tác can thiệp có lý do hiện có, không chuyển giao tự động trong đồng bộ nhân sự.

## Điều chuyển và kết thúc
- Chọn rõ Điều chuyển / Kiêm nhiệm trong form nhân sự; Điều chuyển quản lý yêu cầu xác nhận các quyết định bị kết thúc. Thiếu xác nhận hoặc có quyết định tương lai thì chặn, rollback.
- Bổ nhiệm có chọn phân công đơn vị; điều chuyển tại form bổ nhiệm chặn khi còn quản lý khác/legacy chưa xử lý hoặc lịch tương lai. Form điều chuyển nhân sự xử lý xác nhận đầy đủ.
- Miễn nhiệm chức quản lý cuối cùng tạo Nhân viên theo thành viên chính còn hợp lệ. Không xóa lịch sử. Nếu không còn đơn vị chính thì không bịa đơn vị.
- Các đường cũ `biz_member_save`, `biz_member_end`, `manager` cùng đi qua đồng bộ/guard, không cho tạo manager riêng bỏ qua bổ nhiệm.
- Kiêm nhiệm khác đơn vị giữ phân công chính; thành viên phụ có thời gian riêng, liên kết quyết định khi sinh từ bổ nhiệm, kết thúc theo quyết định. Không xóa member chính khi chấm dứt chức quản lý.

## Thành phần thay đổi
- `BizOrganization.tsx`: form điều chuyển/kiêm nhiệm, xác nhận bổ nhiệm ảnh hưởng, danh sách nhân sự duy nhất, không lặp Trưởng Nhóm, tên quản lý mở chức vụ, fallback chức danh legacy.
- `BizAppointments.tsx`: chức danh chính và kiêm nhiệm; chọn thay thế khi người được chọn có chức vụ, đơn vị theo context, chọn đồng bộ đơn vị.
- `src/lib/biz/positions.ts`: `currentTitles` chỉ phục vụ hiển thị.
- `BizPositions`, query hooks và Trung tâm Phê duyệt giữ cơ chế hiện hữu, không viết lại.
- Migrations `0143`–`0148`: RPC đồng bộ, private helpers/writers bị khóa EXECUTE, phân công phụ RLS/grants, guard khoảng thời gian, phạm vi Nhóm phụ và đường ghi legacy. Không backfill phân công hiện hữu.

## Kiểm thử
- **200/200 tests Biz**, 16 file; 17 ca thêm so với 183 ban đầu (14 database, 3 chức danh).
- Database cô lập: cấp 0 Nhóm/Phòng, lặp thao tác, tự suy ra đơn vị Trưởng Nhóm, Trưởng Phòng không thêm Nhóm, Giám Đốc không nghĩa vụ cá nhân, không hạ chức quản lý, secondary affiliation, thiếu xác nhận rollback, điều chuyển thu hồi quyền giữ snapshot, miễn nhiệm về cấp 0, cấm tự bổ nhiệm/private helper, tương lai không nghĩa vụ hiện tại, kiêm nhiệm hai chức với một thành viên chính, scope Nhóm kiêm nhiệm và chặn đổi danh mục mở quyền.
- Existing regression kiểm lãnh đạo cấp 5/4, phạm vi hợp lệ, ngoại lệ, không tự duyệt, lượt duyệt và lịch sử. Không coi 28 tình huống yêu cầu đều đã nghiệm thu qua UI thật.
- Playwright phiên Super Admin thật tại `/biz/settings`: mở Cơ cấu, Thêm nhân viên, Bổ nhiệm Giám Đốc từ Hệ và hồ sơ Dung; thấy chức danh chính Trưởng Phòng cùng Nhân viên kiêm nhiệm, form thay thế đúng vị trí. Không bấm lưu nhân sự.
- Desktop 1280×1800/mobile 360/390/430 không tràn, không pageerror; đã xem ảnh form/chức danh và mobile. Build OK.

## Dữ liệu và giới hạn
- Trước/sau: bổ nhiệm **13→13**, thành viên Phòng **25→25**, Nhóm **0→0**, hồ sơ **3→3**, mục tiêu năm **1→1**; phân công phụ mới **0**. Không tạo DEMO, không đổi Role/nhân sự/hồ sơ thật.
- Chưa nghiệm thu ghi qua UI bằng quyết định nhân sự thật hoặc phiên Sale/cấp quản lý; ghi đã kiểm bằng database cô lập, không tạo người thử trên dữ liệu chung.
- Chưa có giao diện chuyển giao hàng loạt hồ sơ chờ gắn ngay vào form bổ nhiệm; dùng cơ chế can thiệp/chuyển giao từng hồ sơ hiện có và giữ lịch sử. Chưa tự chọn đơn vị phụ thay đơn vị chính khi toàn bộ thành viên chính kết thúc; cần quyết định điều chuyển rõ ràng.
- Chưa Publish. Migration đã chạy trên database chung, quy tắc ghi mới có hiệu lực ở cả Preview và app công khai; giao diện mới chỉ Preview tới khi Publish.