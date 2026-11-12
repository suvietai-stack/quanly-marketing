# Tạm dừng thay đổi mô hình Role — chờ Owner chốt hướng

## Áp dụng ngay (không cần duyệt thêm)
- Dừng toàn bộ việc tinh gọn và đổi mô hình Role. Không có thao tác nào đang chạy dở sẽ được làm tiếp.
- Không chạy migration, không chạy SQL tối ưu đang chuẩn bị sẵn (SHA `6acee6d6…ba25` và `331ad3a8…ea25`).
- Không sửa Role, bổ nhiệm, quyền, quyền riêng; không tạo Role hoặc quyền mới.
- Không Publish thay đổi kiến trúc. Commit `9611e9a9` (tải theo tab) vẫn chưa Publish và sẽ giữ nguyên như vậy.

## Trạng thái gần nhất (theo báo cáo các lượt trước, chưa đọc lại lúc này)
- Production đang chạy bản e65746b1: màn quyền riêng hiện đủ 510 quyền / 24 module.
- Database đã áp: 0385 (bổ nhiệm theo đơn vị + chức danh), 0386 (Common Role), 21 Role vị trí, 3 khối nằm dưới Công ty, Common có 7 quyền tự quản, Giám đốc Điều hành có 15 quyền.
- Còn chờ, chưa áp: SQL tối ưu tốc độ cho /organization (lỗi timeout vẫn có thể xảy ra), dọn gen1, phạm vi Biz/3K.

## Khi Owner muốn thảo luận (chỉ đọc, không ghi)
Tôi chỉ chuẩn bị tài liệu so sánh, không sửa gì:
1. Giữ mô hình hiện tại (Common + vị trí + nhiệm vụ + quyền riêng).
2. Quay về 1 nhân viên = 1 Role: ảnh hưởng tới các Role vị trí đã tạo, việc kiêm nhiệm, quyền riêng, và cách chuyển đổi có rollback.
3. Phương án lai.
Riêng lỗi timeout /organization là việc độc lập với lựa chọn Role, có thể duyệt riêng nếu Owner muốn.

## Việc tiếp theo
Chờ Owner chốt hướng. Sau khi có quyết định mới lập kế hoạch triển khai mới.
