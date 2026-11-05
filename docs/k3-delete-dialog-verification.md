# Hộp xác nhận Xóa 3K — 05/11/2026

## Sửa đúng vòng đời

Đã tái hiện với Radix thật: chọn Xóa đóng dropdown và số alertdialog về 0. Sau sửa, K3DeleteProvider nằm ngoài Biz3KScreen, nên item/menu/card/Sheet bị unmount hoặc refetch không xóa target/dialog. Một hộp dùng chung cho Ngày, KG và KF; không timer hoặc giữ menu mở.

Target được chụp lúc chọn, guard ref đồng bộ chặn gửi lặp trước khi React cập nhật busy. Khi đang gửi, Quay lại/Escape không đóng. Lỗi RPC hiển thị trong hộp, cho phép thử lại có chủ ý. Thành công đóng hộp và invalidates k3_* gồm danh sách/Thùng rác; lỗi refresh sau commit không mời gửi lại thao tác xóa.

## Kiểm thử

`python3 tests/k3Delete.browser.py`: 6/6 tình huống desktop 1280 và mobile 390 × Ngày/KG/KF đạt; RPC được Playwright chặn, không chạm dữ liệu thật. Kiểm tra menu đóng nhưng dialog còn, refetch/blur, Quay lại không ghi, gửi đúng loại/ID một lần khi click lặp, busy/Escape, lỗi giữ mở và retry thành công làm danh sách biến mất.

`bunx vitest run src/lib/biz/k3DeleteRules.database.test.ts --maxWorkers=2`: 12/12 đạt, gồm xóa/khôi phục/giữ kết quả và snapshot/15 ngày/phạm vi. Đây là database cô lập, không phải nghiệm thu hosted.

## Giới hạn

Chưa nghiệm thu xóa → Thùng rác → khôi phục qua giao diện tài khoản thật. `lovable auth-session --json --self` không tìm được tài khoản của người yêu cầu; Preview đang `/login`. Không tự chọn tài khoản khác hoặc tạo dữ liệu thật. Không thay backend, không Publish.