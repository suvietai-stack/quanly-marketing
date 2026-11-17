# Hồ sơ chuẩn dự án · Base Sứ Việt

> Nguồn thông tin vận hành cho những lần tiếp tục phát triển dự án. Không đưa API keys, mật khẩu, access token hay dữ liệu cá nhân vào đây.
> Cập nhật khi có thay đổi kiến trúc hoặc quyết định đã chốt, không dùng làm nhật ký công việc.

## 1. Nhận diện
- Tên: Base Sứ Việt · hệ thống quản trị nội bộ Công ty Cổ phần Sứ Việt
- Website production hiện tại: https://base.suviet.vn
- Mã nguồn chuẩn: `suvietai-stack/quanly-marketing`, nhánh `main`
- Nguyên tắc: **sửa code trên GitHub**, không sửa source code bằng Lovable.
- Mọi thay đổi production phải qua kiểm thử và phát hành có kiểm soát.

## 2. Hạ tầng và trạng thái chuyển nhà
- Lovable Cloud đang vận hành production (project `32968bd6-6ca2-45ac-99ce-8a48c617e3d0`).
- Supabase đích độc lập: `base-suviet` (project ref `qhfziehibhmqkpknqxle`, Singapore).
- Database mới **chưa được nhập bản sao dữ liệu**; đang chờ bản export đầy đủ từ Lovable.
- VPS AZDIGI: phương án dự kiến, chưa coi là đã triển khai.
- **Không ngắt Lovable hoặc chuyển DNS trước khi** xác minh đủ Auth, Storage, database, tính năng và tính nhất quán.

## 3. Mô hình quyền chuẩn
Tổng hợp quyền thực tế theo bốn nguồn:
1. Quyền chung cấp cho tất cả nhân sự.
2. Role vị trí theo ô chuẩn của sơ đồ tổ chức.
3. Role nhiệm vụ/chuyên môn bổ sung.
4. Quyền bổ sung cá nhân (ALLOW/DENY theo quy tắc đã kiểm chứng).

- Role nghiệp vụ: chỉ dùng **Role V2**; giữ riêng Admin/Super Admin hệ thống.
- Không tự cấp Role cũ, không tự tái tạo cơ cấu cũ.
- Cấu trúc Kinh doanh có các trung tâm **B2B, Phân Phối, BTC/Showroom** độc lập.
- Một ô vị trí chuẩn gắn một Role V2 xác định; nhân sự được bổ nhiệm ngay trên cây.
- Đơn vị chưa rõ bổ nhiệm: để trống, quản trị tự thêm. Không suy đoán nhân sự.
- Khi thay vị trí: kết thúc bổ nhiệm cũ và ghi quyết định mới; **không xóa lịch sử**.

## 4. Quy tắc kỹ thuật
- Bảo toàn dữ liệu, log, job và lịch sử nghiệp vụ; mọi migration phải có đối chiếu.
- Chỉ mở quyền tối thiểu theo đúng Role + phạm vi tổ chức.
- Giữ giao diện mobile-first và desktop gọn, không hiển thị lớp chuyển đổi đã hết hiệu lực.
- API cũ còn được RLS, CRM, Auth, báo cáo hoặc tính quyền gọi: kiểm tra phụ thuộc trước khi xóa.
- Kiểm tra quyền thực tế với tài khoản thử đại diện: Admin, quản lý B2B/Phân Phối, Sale, Thiết kế.
- Phát hành theo thứ tự: GitHub → migration database đã dry-run → xác minh → Publish Lovable → kiểm thử giao diện thật.

## 5. Quyết định hiện hành
- Bổ nhiệm cũ từ hệ Kinh doanh phải được đối chiếu Role và đơn vị trước khi kết thúc.
- Role V2 phải làm việc với CRM, tín hiệu và quy trình Kinh doanh mà không dựa vào quyết định cũ.
- Bản xuất database Lovable là nguồn cho kế hoạch chuyển sang Supabase riêng; không chuyển nhà khi chưa kiểm chứng dữ liệu.
- Chỗ chưa rõ: **không phỏng đoán**, để trống và hiển thị tác vụ quản trị.

## 6. Cập nhật dự án
Khi đổi quyết định kỹ thuật, ghi ngày, phạm vi, lý do và liên kết PR/migration liên quan.
Trạng thái hoàn thành phải dựa trên **kết quả kiểm chứng thực tế**, không dựa riêng vào PR merge hoặc lệnh publish pending.
