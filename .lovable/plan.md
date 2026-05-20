## Plan: Nâng cấp module Task To-do List với workflow + phân quyền

### 1. Mở rộng data model (`src/lib/store.ts`)

Mở rộng `Task` interface:
- **Status mới**: `"Mới tạo" | "Đã giao" | "Đang làm" | "Chờ xác nhận" | "Cần sửa" | "Hoàn thành" | "Đã hủy"` (thay cho `"Chưa làm" | "Đang làm" | "Hoàn thành"`)
- **Fields mới**: `description`, `module`, `relatedLink`, `approver`, `relatedPeople[]`, `inputLink`, `resultLink`, `handoverLink`, `processNote`, `revisionNote`, `revisions`, `createdAt`, `acceptedAt`, `submittedAt`, `completedAt`, `cancelledAt`, `history[]` (mỗi entry: `{ by, action, fromStatus, toStatus, time, note }`)
- Thêm hàm `normalizeTaskStatus()` để map status cũ → mới (Chưa làm→Mới tạo, Đang làm→Đang làm, Hoàn thành→Hoàn thành)
- Helper `appendTaskHistory(task, entry)`

### 2. Bổ sung permissions (`src/lib/auth.ts`)

Thêm nhóm `Task To-do List` với các permission key (giữ namespace `task.*` đã có, bổ sung mới):
- View: `task.view`, `task.view_all`, `task.view_mine`, `task.view_created_by_me`
- Data: `task.create`, `task.edit`, `task.delete`, `task.assign`, `task.edit_assignee`, `task.edit_deadline`, `task.edit_priority`
- Workflow: `task.start`, `task.update_result`, `task.submit_completion`, `task.resubmit_completion`, `task.approve_completion`, `task.request_revision`, `task.cancel`, `task.restore`, `task.reopen_completed`, `task.force_change_status`
- History: `task.view_history`, `task.add_note`

Cập nhật default permissions cho 8 role theo bảng spec (Super Admin/Admin full, Leader/SEO/Content Web/Social/Local SEO/Designer/Video theo spec, Viewer chỉ view nếu được cấp).

### 3. UI Workflow trên trang Tasks (`src/routes/tasks.tsx` + form mới)

- Mở rộng `TaskForm`: thêm fields mô tả, approver, module, link tài liệu (input/result/handover), ghi chú; ẩn/disable theo `can()`.
- Thay cột "Hành động" trong table: hiển thị nút workflow tương ứng status hiện tại (Giao / Bắt đầu làm / Gửi hoàn thành / Xác nhận / Yêu cầu sửa / Gửi lại / Hủy / Khôi phục / Mở lại / Ép trạng thái).
- Mỗi action gọi handler chung `transitionTask(task, action)`:
  - Check permission, nếu thiếu → `toast.error("Bạn không có quyền thực hiện hành động này.")` và return.
  - "Yêu cầu sửa" mở modal nhập ghi chú bắt buộc → tăng `revisions`.
  - Update status, timestamps, push history entry.
- Kanban: 7 cột theo status mới.
- Tab nhanh: ẩn "Tất cả task" nếu thiếu `task.view_all`. "Việc của tôi" gồm assignee/approver/relatedPeople. "Việc tôi giao" gồm reporter/createdBy.
- Hằng số `STATUSES` + màu `StatusBadge` thêm các status mới.

### 4. Chi tiết task + lịch sử

- Thêm modal "Chi tiết Task" với tabs: **Thông tin / Tài liệu / Lịch sử xử lý** (chỉ hiện history nếu có `task.view_history`).
- Lịch sử render dạng timeline từ `task.history[]`.

### 5. Liên kết Tổng Quan (`src/routes/index.tsx`)

Thêm 5 nhóm cá nhân dựa trên task:
- Cần tôi xử lý (assignee, status ∈ Đã giao/Đang làm/Cần sửa)
- Cần duyệt (approver, status = Chờ xác nhận)
- Chờ người khác (reporter/createdBy, status ≠ Hoàn thành/Đã hủy, assignee ≠ me)
- Quá hạn (liên quan tôi, overdue)
- Hoàn thành gần đây (7 ngày)

### 6. Áp dụng quyền cho action lưu dữ liệu

Bọc `add/update/remove` cho tasks bằng wrapper `guardedTaskMutation` kiểm tra perm trước; toast khi reject.

### Files dự kiến chỉnh
- `src/lib/store.ts` — Task interface, status, normalize, history helper
- `src/lib/auth.ts` — permissions + default role mapping
- `src/components/StatusBadge.tsx` — màu cho status mới
- `src/routes/tasks.tsx` — form, workflow buttons, tabs, kanban
- `src/components/TaskDetail.tsx` (mới) — chi tiết + lịch sử
- `src/routes/index.tsx` — bổ sung khối task cá nhân

Không tạo migration mới (task data đã ở `tasks.data jsonb`, mở rộng field tự nhiên). Status cũ trong DB được normalize ở runtime.

Bạn duyệt plan này để mình bắt tay vào code nhé?