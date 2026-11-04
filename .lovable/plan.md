# Nâng cấp bộ đo KPI đa dạng cho Quản lý 3K

## Mục tiêu
Hoàn thiện đồng bộ **10 kiểu đo** từ cấu hình, nhập kết quả, tính toán, trạng thái đến chốt sổ và báo cáo. Mở rộng 3K hiện có, không xây lại và không ảnh hưởng KR, Kế hoạch hoặc Báo cáo Kinh doanh.

## Hiện trạng đã kiểm tra
- Đã có bảy kiểu đo cơ bản; **Có/Chưa, Tần suất, Chuỗi liên tục** chưa được triển khai.
- Các kiểu hiện có còn thiếu cấu hình nghiệm thu, lịch chu kỳ, trọng số/cột mốc tuần tự và một số điều kiện nâng cao.
- Form Tạo công việc vẫn chỉ có một KPI mỗi KF và chưa dùng chung bộ cấu hình đo lường.
- Dữ liệu hiện có: **2 KPI tích lũy, 1 kết quả đo lường; 3 công việc cũ chưa liên kết KPI**, trong đó 2 chưa liên kết KF. Không tự suy đoán liên kết hoặc thay số gốc.
- Chốt sổ tự động và hàng đợi Zalo đã có; báo cáo cần bổ sung cách thể hiện riêng cho từng kiểu đo.

## 1. Chuẩn hóa cấu hình và bảo vệ lịch sử
- Thêm cấu hình có cấu trúc cho 10 kiểu đo, điều kiện đạt, phạm vi thời gian, bắt buộc/tùy chọn và trạng thái hợp lệ.
- Lưu cấu hình theo phiên bản; kết quả và bản chốt giữ liên kết tới cấu hình áp dụng.
- KPI đã có kết quả không bị đổi công thức hồi tố. Thay đổi không tương thích tạo phiên bản KPI mới có hiệu lực rõ ràng, cảnh báo và giữ bản cũ.
- Phân biệt **Lưu trữ chờ rà soát không tự xóa** với **Thùng rác 15 ngày chỉ cho bản ghi đã xác nhận xóa**; sửa đường xóa tự động hiện có để không xử lý hồ sơ đang chờ rà soát.

## 2. Hoàn thiện bộ tính toán chung
| Kiểu đo | Quy tắc chính |
|---|---|
| Tích lũy | Cộng tổng ngày hiện hành; cùng ngày sửa là thay thế, request lặp không cộng thêm; giá trị bắt đầu phải có nguồn |
| Đạt con số | Lấy giá trị hiện tại theo ngày đo; hỗ trợ ≥, ≤, =, trong khoảng, sai số; cải thiện chỉ tính khi có baseline hợp lệ |
| Có/Chưa | Ghi kết quả và bằng chứng; phân biệt báo hoàn tất, chờ nghiệm thu, đã nghiệm thu |
| Cột mốc | Mốc có ID, thứ tự, deadline, điều kiện, bắt buộc và trọng số; hỗ trợ độc lập/tuần tự và nghiệm thu |
| Tần suất | Đếm tổng ngày trong chu kỳ Ngày/Tuần/Tháng; tách chu kỳ hiện tại khỏi tổng toàn thời gian |
| Chuỗi liên tục | Tính chuỗi hiện tại/dài nhất theo lịch nghĩa vụ; thiếu ngày phải đạt thì ngắt; bổ sung ngày cũ tính lại |
| Tỷ lệ | Tổng tử số / tổng mẫu số × 100; mẫu số 0 là chưa đủ dữ liệu |
| Không trùng | Đếm định danh theo loại đối tượng và quy tắc chuẩn hóa đã cấu hình; không xác minh duy nhất bằng số lượng tự nhập |
| Trung bình | Tổng giá trị / tổng số quan sát, không lấy trung bình các trung bình ngày |
| Thời lượng | Chuẩn hóa phút/giờ; ghi tổng hoặc khoảng thời gian theo cấu hình, kiểm tra chồng lấn khi được yêu cầu |

- Tổng kết quả ngày và thêm sự kiện riêng là hai thao tác khác nhau; sự kiện có định danh chống trùng.
- Nghiệm thu do người có quyền trong phạm vi cơ cấu tổ chức thực hiện; không tự nghiệm thu bằng tích chọn hoặc chốt 18:00.
- KF chỉ đạt khi đủ KPI bắt buộc và các điều kiện nghiệm thu; không lấy trung bình phần trăm khác loại. KG có tiêu chí riêng hoặc quy tắc dựa trên KF được cấu hình rõ.

## 3. Một bộ cấu hình và form nhập dùng chung
- Sáu thẻ đo phổ biến, bốn thẻ nâng cao trong khu vực mở rộng; chọn kiểu đo trước rồi chỉ hiện trường liên quan.
- Dùng chung trong Tạo KG/KF cá nhân, nhóm và Thêm/Sửa KPI; mỗi KF có nhiều KPI khác loại, lưu cùng một giao dịch.
- Giữ lưu nháp; bắt đầu chính thức cần ít nhất một KF và cấu hình đo hợp lệ.
- Form cập nhật theo kiểu đo, không nhập trạng thái hay phần trăm thủ công; nhật ký hiển thị người, ngày, dữ liệu thành phần, phiên bản và nghiệm thu theo quyền.
- Tách **KPI tổng 50/200 = 25%** khỏi **kế hoạch ngày 20/10 = 200%**. KF theo lịch tự xuất hiện đúng người/ngày, không nhân bản.

## 4. Đồng bộ các màn hình, chốt sổ và Zalo
- 3K Của Tôi, Nhóm/Phòng Ban, Theo Dõi Nhân Viên và tổng hợp kỳ lấy kết quả từ cùng bộ tính phía máy chủ.
- Bản chốt 18:00 giờ Việt Nam lưu cấu hình, dữ liệu thành phần, chu kỳ/chuỗi và trạng thái nghiệm thu; phân biệt chưa cập nhật với 0.
- Sửa sau chốt giữ bản cũ, lý do và lịch sử; kết quả chính thức chỉ thay sau bước xác nhận phù hợp.
- Zalo dùng tên/đơn vị/kết quả đã đóng băng trong báo cáo: +20 đại lý, 3/3 lần tuần, chuỗi 5/7 ngày, 2/3 mốc, 12/50 = 24%; không ép thành một phần trăm hoặc cộng khác đơn vị.
- Giữ cấu hình nhóm độc lập, giới hạn tin, lịch sử và chống gửi trùng; không bật gửi hay gửi thử thật tự động.

## 5. Dữ liệu cũ và nghiệm thu
- Kiểm kê A/B/C theo cấu hình và nguồn thực tế, không theo tên/đơn vị phỏng đoán; có bản sao đối chiếu và phương án khôi phục trước chuyển đổi.
- Giữ KPI tương thích; dữ liệu thiếu thành phần đưa vào danh sách cần xác minh, không dựng tử/mẫu hoặc đối tượng giả.
- Không chạy chuyển đổi/cách ly/xóa công việc thật trong lượt triển khai nếu chưa có xác nhận xử lý hồ sơ.
- Thêm và chạy kiểm thử cho 32 nhóm yêu cầu: công thức, chu kỳ, lịch/chuỗi, chống trùng, nghiệm thu, nhiều KPI, phân quyền, chốt/correction, báo cáo và lịch sử.
- Kiểm tra các kích thước 360/375/390/430/768/1280/1440px; đọc dữ liệu thật, kiểm tra luồng ghi trong môi trường cô lập. Nghiệm thu ghi/gửi thật chỉ khi được cho phép.
- Báo cáo triển khai: kiểu đo, form, công thức, thay đổi dữ liệu/quyền, xử lý nhiều KPI, số chuyển đổi, hồ sơ cần rà soát, kiểm thử và giới hạn. **Chỉ Preview, chưa Publish.**

## Chi tiết kỹ thuật
- Mở rộng `k3_kpis`, nguồn `k3_kpi_results` và phiên bản hiện có bằng thay đổi bổ sung; không sửa các migration đã áp dụng.
- Chuẩn hóa một evaluator dùng chung cho tổng, kỳ, cá nhân/nhóm, trạng thái và snapshot; frontend chỉ trình bày kết quả máy chủ, không giữ một công thức chính thức thứ hai.
- Giữ các kiểm quyền `k3_can`, assignment/membership, phạm vi lịch sử, RLS, khóa, request-key và revision fences; nghiệm thu có RPC kiểm quyền, lịch sử và phiên bản nguồn.
- Dùng chung bộ cấu hình KPI trong các form; dispatcher Zalo và cơ chế OA hiện tại không thay đổi ngoài dữ liệu báo cáo theo kiểu đo.