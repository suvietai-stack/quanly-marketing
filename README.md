# Quan Lý Marketing Sứ Việt

Hãy xây dựng một web app tiếng Việt có tên:

Base Marketing – Quản lý công việc

Mục tiêu:

Đây là app base dùng để quản lý quy trình thực thi công việc của phòng Digital Marketing. App tập trung vào quản lý thương hiệu, quản lý kênh triển khai, giao việc, sản xuất nội dung, theo dõi trạng thái công việc và lưu kết quả đầu ra.

App này KHÔNG phải app lập kế hoạch chiến lược, KHÔNG phải CRM, KHÔNG làm báo cáo KPI nâng cao ở bản base, KHÔNG làm phân quyền phức tạp ở giai đoạn đầu.

==================================================

1. YÊU CẦU GIAO DIỆN

==================================================

Thiết kế giao diện chuyên nghiệp, hiện đại, sạch và dễ dùng.

Phong cách giao diện:

- Hiện đại, tối giản, có chiều sâu.

- Layout thoáng, nhiều khoảng trắng.

- Card bo góc mềm, shadow nhẹ.

- Sidebar rõ ràng, dễ điều hướng.

- Bảng dữ liệu dễ đọc, có filter và search.

- Form thêm/sửa gọn, dễ nhập liệu.

- Trạng thái dùng badge màu trực quan.

- Có dashboard tổng quan ở trang đầu.

- Responsive tốt cho desktop, tablet và mobile.

Tone giao diện:

- Nền sáng, sạch.

- Màu chính: xanh navy hoặc xanh dương đậm.

- Màu phụ: xám nhạt, trắng, xanh lá cho trạng thái hoàn thành, cam/vàng cho chờ duyệt, đỏ/cam cho cần sửa hoặc quá hạn.

- Typography rõ ràng, chuyên nghiệp.

- Không dùng giao diện quá màu mè.

Có thể dùng icon line hiện đại cho sidebar.

==================================================

2. SIDEBAR CHÍNH

==================================================

Sidebar gồm các mục sau:

Nhóm Điều hành:

1. Tổng Quan

2. Task To-do List

Nhóm Nền tảng:

3. Thương Hiệu

Nhóm Kênh Marketing:

4. Dự Án Web

5. Kênh Social

6. Local Map

Nhóm Sản xuất nội dung:

7. Sản Xuất Video

8. Order Thiết Kế / Chụp Ảnh

Nhóm Mở rộng & Hệ thống:

9. OKRs — Sắp ra mắt

10. Cài Đặt

OKRs chỉ hiển thị là “Sắp ra mắt”, chưa cần làm chức năng sâu.

==================================================

3. LOGIC DỮ LIỆU TỔNG THỂ

==================================================

Thương Hiệu là dữ liệu trung tâm.

Mọi module khác đều có thể liên kết với một Thương Hiệu thông qua brandId.

Quan hệ tổng thể:

Thương Hiệu

├── Dự Án Web

├── Kênh Social

├── Local Map

├── Sản Xuất Video

├── Order Thiết Kế / Chụp Ảnh

└── Task To-do List

Một thương hiệu có thể có:

- Nhiều website

- Nhiều kênh social

- Nhiều local map

- Nhiều video

- Nhiều order thiết kế

- Nhiều task liên quan

Không tạo module Chiến Dịch Marketing riêng trong sidebar.

Thay vào đó, trong các công việc có thể có các trường:

- Kế hoạch / Plan liên quan

- Topic / Chủ đề triển khai

- Link tài liệu kế hoạch

Ví dụ:

Plan liên quan: Tết 2026

Topic: Quà tặng doanh nghiệp

==================================================

4. MODULE TỔNG QUAN

==================================================

Mục tiêu:

Hiển thị tình hình vận hành tổng thể của phòng Digital Marketing.

Các card thống kê cơ bản:

- Tổng công việc đang mở

- Công việc quá hạn

- Công việc chờ duyệt

- Công việc hoàn thành trong tuần

- Website đang vận hành

- Kênh social đang vận hành

- Local Map đang quản lý

- Video đang sản xuất

- Order thiết kế đang xử lý

Có bảng “Việc cần chú ý” gồm:

- Task quá hạn

- Order thiết kế chờ duyệt

- Video chờ duyệt

- Bài social chờ đăng

- Nội dung web chờ xử lý

Có bộ lọc:

- Theo thương hiệu

- Theo module

- Theo người phụ trách

- Theo trạng thái

- Theo Plan / Topic

==================================================

5. MODULE TASK TO-DO LIST

==================================================

Mục tiêu:

Dùng cho việc lẻ, việc nhanh, việc phát sinh hằng ngày.

Mục con:

- Tất cả task

- Việc của tôi

- Việc tôi giao

- Việc quá hạn

- Kanban công việc

- Task đã hoàn thành

Trường dữ liệu:

- Tên task

- Thương hiệu liên quan

- Người phụ trách

- Người giao việc

- Deadline

- Mức ưu tiên: Thấp / Trung bình / Cao / Gấp

- Trạng thái: Chưa làm / Đang làm / Hoàn thành

- Ghi chú

- Link liên quan

- Kế hoạch / Plan liên quan

- Topic / Chủ đề triển khai

Giao diện:

- Có table view

- Có kanban view theo trạng thái

- Có nút thêm task mới

- Có form chỉnh sửa task

- Có bộ lọc theo người phụ trách, thương hiệu, trạng thái, mức ưu tiên

==================================================

6. MODULE THƯƠNG HIỆU

==================================================

Mục tiêu:

Quản lý hồ sơ gốc của từng thương hiệu/dự án marketing.

Mục con:

- Danh sách thương hiệu

- Hồ sơ thương hiệu

- Nhận diện thương hiệu

- Kênh liên kết

- Nhân sự phụ trách

- Tài liệu / Guideline

- Ghi chú vận hành

- Trạng thái thương hiệu

Trường dữ liệu thương hiệu:

- Tên thương hiệu

- Lĩnh vực

- Website chính

- Mô tả ngắn

- USP / điểm mạnh

- Người phụ trách chính

- Trạng thái: Đang xây dựng / Đang vận hành / Đang tối ưu / Tạm dừng / Lưu trữ

- Link tài liệu thương hiệu

- Ghi chú

Phần Kênh liên kết:

Đây là nơi tổng hợp tự động các kênh đã tạo ở module khác, không nhập tay rời rạc.

Kênh liên kết gồm:

1. Website

2. Social

3. Local Map

Ví dụ thương hiệu Sứ Việt có thể hiển thị:

Website:

- xuonggomsuviet.vn

- tinhhoabattrang.vn

Social:

- Facebook Page Sứ Việt

- TikTok Sứ Việt

- YouTube Sứ Việt

Local Map:

- Xưởng Gốm Sứ Việt Bát Tràng

- Showroom Không Gian Gốm

Có nút tạo nhanh:

- + Thêm website

- + Thêm kênh social

- + Thêm local map

Khi tạo nhanh từ hồ sơ thương hiệu, form tự điền sẵn thương hiệu đang xem.

==================================================

7. MODULE DỰ ÁN WEB

==================================================

Mục tiêu:

Quản lý các website và quy trình triển khai nội dung web/SEO ở mức base.

Cấu trúc:

Dự Án Web

├── Danh sách website

├── Tổng quan website

├── Technical SEO Checklist

├── Sản xuất Content

├── Bài đã đăng / Index

└── Báo cáo Web — Sắp ra mắt

Trường dữ liệu website:

- Tên website

- Link website

- Thuộc thương hiệu

- Người phụ trách SEO

- Người phụ trách content

- Người phụ trách kỹ thuật

- Trạng thái website: Đang xây dựng / Đang vận hành / Đang tối ưu / Tạm dừng

- Ghi chú

Chi tiết từng website có các tab:

1. Tổng quan

2. Technical SEO Checklist

3. Sản xuất Content

4. Bài đã đăng / Index

5. Báo cáo Web — Sắp ra mắt

Technical SEO Checklist:

Dạng checklist tích chọn, chưa cần tạo task phức tạp.

Nhóm checklist:

- Cài đặt nền tảng

- Index / Crawl

- Tốc độ website

- Cấu trúc website

- Onpage kỹ thuật

- Schema

- WooCommerce SEO

- Tracking / Bảo mật

Mỗi checklist item gồm:

- Tên hạng mục

- Nhóm checklist

- Đã hoàn thành hay chưa

- Người kiểm tra

- Ghi chú

- Link minh chứng nếu có

Sản xuất Content Web:

Mỗi website có khu sản xuất content riêng.

Trường dữ liệu content web:

- Website

- Thương hiệu

- Loại bài: Bài SEO / Bài blog / Landing page / Bài danh mục / Bài sản phẩm / Bài tối ưu lại

- Cụm chủ đề

- Từ khóa chính

- Từ khóa phụ

- Tiêu đề dự kiến

- Brief

- Người viết

- Người duyệt

- Deadline

- Ngày dự kiến đăng

- Link outline

- Link bài viết

- Link ảnh

- Link bài đã đăng

- Trạng thái index: Chưa kiểm tra / Chưa index / Đã index

- Trạng thái bài

- Kế hoạch / Plan liên quan

- Topic / Chủ đề triển khai

- Ghi chú

Workflow content web bản base:

- Kế hoạch

- Đã giao

- Đang viết

- Chờ duyệt

- Cần sửa

- Đã duyệt

- Chờ đăng

- Đã đăng

- Hoàn thành

Có:

- Table view

- Kanban view theo trạng thái

- Bộ lọc theo website, thương hiệu, người viết, trạng thái, deadline

==================================================

8. MODULE KÊNH SOCIAL

==================================================

Mục tiêu:

Quản lý nhiều kênh social và sản xuất bài đăng cho từng kênh.

Tư duy:

Kênh Social giống Dự Án Web.

Tạo kênh social trước, sau đó mỗi kênh có khu sản xuất bài đăng riêng.

Cấu trúc:

Kênh Social

├── Danh sách kênh

├── Hồ sơ kênh

├── Sản xuất bài đăng

├── Lịch đăng

├── Bài đã đăng

├── Kho ý tưởng

└── Báo cáo Social — Sắp ra mắt

Trường dữ liệu kênh social:

- Tên kênh

- Nền tảng: Facebook Page / Facebook Group / TikTok / YouTube / Instagram / Zalo OA / Khác

- Link kênh

- Thuộc thương hiệu

- Người phụ trách

- Tần suất đăng

- Mục tiêu kênh

- Trạng thái: Đang xây / Đang vận hành / Đang tối ưu / Tạm dừng

- Ghi chú

Chi tiết từng kênh có các tab:

1. Tổng quan kênh

2. Hồ sơ kênh

3. Sản xuất bài đăng

4. Lịch đăng

5. Bài đã đăng

6. Báo cáo Social — Sắp ra mắt

Sản xuất bài đăng:

Mỗi bài social có các trường:

- Tên bài đăng

- Thuộc thương hiệu

- Thuộc kênh social

- Nền tảng

- Loại nội dung: Bài ảnh đơn / Album / Carousel / Text / Reels / TikTok Video / YouTube Shorts / Story / Livestream / Khác

- Topic / Chủ đề triển khai

- Kế hoạch / Plan liên quan

- Người viết

- Người thiết kế hoặc video liên quan

- Người duyệt

- Ngày dự kiến đăng

- Ngày đăng thực tế

- Caption hoặc link nội dung

- Link ảnh / video

- Link bài đã đăng

- Trạng thái

- Ghi chú

Workflow social bản base:

- Ý tưởng

- Đang làm

- Chờ duyệt

- Cần sửa

- Đã duyệt

- Đã lên lịch

- Đã đăng

- Hoàn thành

Có 2 cách xem:

1. Xem bài đăng trong từng kênh

2. Xem tất cả bài social của toàn bộ kênh

Tất cả bài social có bộ lọc:

- Thương hiệu

- Kênh

- Nền tảng

- Người phụ trách

- Trạng thái

- Ngày đăng

- Plan / Topic

==================================================

9. MODULE LOCAL MAP

==================================================

Mục tiêu:

Quản lý Google Map / Google Business Profile và công việc local marketing.

Cấu trúc:

Local Map

├── Danh sách địa điểm

├── Hồ sơ Google Map

├── Lịch đăng bài Map

├── Ảnh địa điểm

├── Sản phẩm / Dịch vụ trên Map

├── Review / Đánh giá

└── Báo cáo Local — Sắp ra mắt

Trường dữ liệu địa điểm:

- Tên địa điểm

- Link Google Map

- Thuộc thương hiệu

- Địa chỉ

- Số điện thoại

- Người phụ trách

- Trạng thái xác minh: Đã xác minh / Chưa xác minh / Đang xử lý

- Ghi chú

Bài đăng Map:

- Tên bài đăng

- Địa điểm

- Thương hiệu

- Nội dung bài đăng

- Loại bài: Cập nhật / Sản phẩm / Ưu đãi / Sự kiện / Khác

- Người phụ trách

- Ngày dự kiến đăng

- Ngày đăng thực tế

- Link ảnh

- Link bài đăng nếu có

- Trạng thái

- Plan / Topic

- Ghi chú

Review / Đánh giá:

- Địa điểm

- Tên người đánh giá

- Số sao

- Nội dung review

- Ngày review

- Trạng thái phản hồi: Chưa phản hồi / Đã phản hồi

- Người phản hồi

- Ghi chú

==================================================

10. MODULE SẢN XUẤT VIDEO

==================================================

Mục tiêu:

Quản lý các đầu việc sản xuất video độc lập với social.

Video có thể phục vụ:

- TikTok

- YouTube

- Facebook Reels

- Website

- Landing page

- Ads

- Shopee

Mục con:

- Danh sách video

- Kho ý tưởng video

- Kịch bản

- Lịch quay

- Đang sản xuất

- Chờ duyệt

- Đã bàn giao / Đã đăng

Trường dữ liệu video:

- Tên video

- Thuộc thương hiệu

- Kênh sử dụng

- Mục đích video

- Người phụ trách

- Người duyệt

- Deadline

- Link kịch bản

- Link footage

- Link bản dựng

- Link video hoàn thiện

- Link video đã đăng

- Trạng thái

- Kế hoạch / Plan liên quan

- Topic / Chủ đề triển khai

- Ghi chú

Workflow video bản base:

- Ý tưởng

- Đang sản xuất

- Chờ duyệt

- Cần sửa

- Đã bàn giao

- Hoàn thành

Có thể liên kết video với bài đăng social.

==================================================

11. MODULE ORDER THIẾT KẾ / CHỤP ẢNH

==================================================

Mục tiêu:

Quản lý yêu cầu thiết kế, chụp ảnh, retouch, banner, thumbnail.

Module này độc lập vì thiết kế nhận yêu cầu từ nhiều nguồn:

- Web

- Social

- Video

- Local

- Leader

- Task lẻ

Mục con:

- Tất cả order

- Brief mới

- Đang thực hiện

- Chờ duyệt

- Cần sửa

- Đã bàn giao

- Kho file bàn giao

Loại order:

- Banner website

- Ảnh bài web

- Ảnh social

- Thumbnail video

- Ảnh sản phẩm

- Catalogue / profile

- Chụp ảnh

- Retouch ảnh

- Khác

Trường dữ liệu order:

- Tên order

- Thuộc thương hiệu

- Loại order

- Nguồn yêu cầu: Web / Social / Video / Local / Leader / Khác

- Người yêu cầu

- Người thực hiện

- Người duyệt

- Deadline

- Brief

- Kích thước

- Số lượng ảnh/file

- Link tư liệu

- Link file bàn giao

- Trạng thái

- Kế hoạch / Plan liên quan

- Topic / Chủ đề triển khai

- Ghi chú

Workflow order bản base:

- Mới tạo

- Đang làm

- Chờ duyệt

- Cần sửa

- Đã bàn giao

- Hoàn thành

Có thể tạo order thiết kế từ:

- Một bài content web

- Một bài social

- Một video

- Một task lẻ

==================================================

12. MODULE OKRs — SẮP RA MẮT

==================================================

OKRs chưa làm chức năng sâu ở bản base.

Khi bấm vào OKRs, hiển thị một trang “Sắp ra mắt”.

Nội dung hiển thị:

“Module OKRs sẽ được phát triển ở giai đoạn sau để quản lý mục tiêu toàn phòng, mục tiêu theo thương hiệu, mục tiêu theo kênh và theo dõi tiến độ thực hiện.”

Các mục dự kiến:

- Mục tiêu toàn phòng

- Mục tiêu theo thương hiệu

- Mục tiêu theo kênh

- Tiến độ hiện tại

- Đánh giá cuối kỳ

Không cần tạo CRUD phức tạp cho OKRs trong bản base.

==================================================

13. MODULE CÀI ĐẶT

==================================================

Mục tiêu:

Quản lý danh mục dùng chung.

Mục con:

- Nhân sự

- Loại thương hiệu

- Loại website

- Loại kênh social

- Loại task

- Loại video

- Loại thiết kế

- Trạng thái công việc

- Mức ưu tiên

- Plan / Topic

- Template checklist

Nhân sự chỉ là danh sách để chọn người phụ trách, chưa làm phân quyền.

Trường nhân sự:

- Họ tên

- Vai trò mô tả

- Email

- Số điện thoại

- Trạng thái: Đang làm / Tạm nghỉ

- Ghi chú

Không làm role/phân quyền ở bản base.

Chưa cần phân biệt Admin, Leader, Nhân sự, Viewer bằng logic khóa quyền.

Tất cả role/phân quyền để phát triển sau.

==================================================

14. BÁO CÁO / THỐNG KÊ

==================================================

Ở bản base, chưa cần xây dựng hệ thống thống kê và báo cáo chi tiết.

Trong các module Web, Social, Local chỉ cần hiển thị tab:

- Báo cáo Web — Sắp ra mắt

- Báo cáo Social — Sắp ra mắt

- Báo cáo Local — Sắp ra mắt

Các tab này chỉ cần giao diện giữ chỗ đẹp, ghi rõ sẽ phát triển ở giai đoạn sau.

Tuy nhiên, các bảng dữ liệu cần có đủ trường nền tảng để sau này có thể tổng hợp báo cáo:

- Người phụ trách

- Người giao việc

- Người duyệt

- Deadline

- Ngày hoàn thành

- Trạng thái

- Thương hiệu

- Kênh liên quan

- Plan / Topic

- Link kết quả

==================================================

15. MOCK DATA MẪU

==================================================

Tạo mock data với một số thương hiệu mẫu:

- Sứ Việt

- Sứ Minh Đăng

- Thổ Tú

- Đồ Thờ Tín Tâm

- Không Gian Gốm Hà Nội

Website mẫu:

- xuonggomsuviet.vn thuộc Sứ Việt

- suminhdang.com thuộc Sứ Minh Đăng

- thotu.vn thuộc Thổ Tú

Social mẫu:

- TikTok Sứ Việt

- Facebook Page Sứ Minh Đăng

- YouTube Thổ Tú

Local Map mẫu:

- Xưởng Gốm Sứ Việt Bát Tràng

- Showroom Không Gian Gốm Hà Nội

Video mẫu:

- Quy trình làm gốm Bát Tràng

- Gợi ý quà tặng doanh nghiệp

- Tượng Phật gốm trong không gian thờ

Order thiết kế mẫu:

- Banner trang chủ Sứ Việt

- Ảnh social bộ ấm chén in logo

- Thumbnail video quà tặng Tết

Task mẫu:

- Sửa banner trang chủ

- Kiểm tra link bài viết

- Cập nhật ảnh Google Map

- Gửi brief cho designer

==================================================

16. PHẠM VI BẢN BASE

==================================================

Bản base cần làm:

- Sidebar đầy đủ

- Dashboard tổng quan

- Module Task To-do List

- Module Thương Hiệu

- Module Dự Án Web ở mức base

- Module Kênh Social ở mức base

- Module Local Map ở mức base

- Module Sản Xuất Video ở mức base

- Module Order Thiết Kế / Chụp Ảnh ở mức base

- OKRs hiển thị “Sắp ra mắt”

- Báo cáo Web/Social/Local hiển thị “Sắp ra mắt”

- Cài Đặt danh mục

- Mock data

- Table view

- Kanban view ở những module cần thiết

- Form thêm/sửa

- Trang chi tiết

- Bộ lọc cơ bản

- Giao diện đẹp, chuyên nghiệp, dễ dùng

Chưa làm:

- Phân quyền/role

- Đăng nhập phức tạp

- API Google Analytics

- API Search Console

- API Facebook/TikTok

- Báo cáo KPI nâng cao

- CRM/Lead

- Ads/ngân sách

- Automation nhắc việc

- OKRs chi tiết

==================================================

17. MỤC TIÊU KẾT QUẢ

==================================================

Sau khi tạo app, người dùng có thể:

- Xem tổng quan công việc phòng marketing

- Tạo và quản lý thương hiệu

- Tạo nhiều website cho một thương hiệu

- Tạo nhiều kênh social cho một thương hiệu

- Tạo nhiều local map cho một thương hiệu

- Quản lý sản xuất content web

- Quản lý sản xuất bài đăng social

- Quản lý bài đăng local map

- Quản lý sản xuất video

- Quản lý order thiết kế/chụp ảnh

- Gắn công việc với Plan / Topic

- Quản lý danh mục cơ bản trong Cài Đặt

- Có sẵn nền tảng để sau này phát triển báo cáo, OKRs, role/phân quyền và automation

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://quanly-marketing.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/32968bd6-6ca2-45ac-99ce-8a48c617e3d0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
