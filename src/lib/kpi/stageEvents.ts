/**
 * KPI V2 — ĐỀ XUẤT sidecar (chưa có bảng thật, chưa apply). Interfaces để engine đọc
 * khi bảng `kpi_stage_assignments` / `kpi_stage_events` được phê duyệt. Xem
 * `proposals/kpi_stage_sidecar.draft.sql`. Chỉ dùng cho công việc phát sinh SAU phê duyệt.
 */
export type KpiStage = "video_script" | "video_shoot" | "video_edit" | "video_publish" | "design_order";
export type KpiStageEventType = "assigned" | "started" | "submitted" | "approved" | "revision_requested" | "published";

export interface KpiStageAssignment {
  id: string;
  sourceType: "video" | "design_order";
  sourceId: string;
  stage: KpiStage;
  userId: string;
  deadline: string | null;
  assignedBy: string | null;
  assignedAt: string;
  unassignedAt: string | null;
}

export interface KpiStageEvent {
  id: string;
  sourceType: "video" | "design_order";
  sourceId: string;
  stage: KpiStage;
  eventType: KpiStageEventType;
  /** Người thực hiện công đoạn (được credit). */
  userId: string;
  /** Người ghi event (có thể là leader xác nhận). */
  authorId: string;
  version: number;
  occurredAt: string;
  evidenceUrl: string | null;
}
