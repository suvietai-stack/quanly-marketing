const POSITIONS = { team_lead: "Trưởng Nhóm", department_head: "Trưởng Phòng", director: "Giám Đốc", user: "Người cụ thể" };
const WORKFLOW_KINDS = { report_day: "Điều chỉnh Báo cáo Ngày", report_week: "Điều chỉnh Báo cáo Tuần", late_report_day: "Nộp bù Báo cáo Ngày", late_report_week: "Nộp bù Báo cáo Tuần", goal_year: "Mục tiêu KR Năm", rolling_plan: "Điều chỉnh phân bổ KR Tháng", report_month: "Điều chỉnh Báo cáo Tháng", report_quarter: "Điều chỉnh Báo cáo Quý", report_year: "Điều chỉnh Báo cáo Năm", late_plan_month: "Nộp bù Kế hoạch Tháng", late_plan_quarter: "Nộp bù Kế hoạch Quý", late_plan_year: "Nộp bù Kế hoạch Năm", late_report_month: "Nộp bù Báo cáo Tháng", late_report_quarter: "Nộp bù Báo cáo Quý", late_report_year: "Nộp bù Báo cáo Năm" };
const defaultApprovalSteps = () => ["team_lead", "department_head", "director"].map((type) => ({ label: POSITIONS[type], type }));
function approvalOverdue(run, now) {
  const hours = run.steps[run.current_step]?.sla_hours;
  return run.status === "pending" && hours != null && hours > 0 && Date.parse(now) > Date.parse(run.step_started_at) + hours * 36e5;
}
function approvalInTab(run, tab, uid) {
  return tab === "mine" ? run.status === "pending" && run.can_act : tab === "pending" ? run.status === "pending" : tab === "processed" ? run.events.some((e) => e.actor_id === uid && ["step_approved", "approved", "returned", "override"].includes(e.action)) : true;
}
function orgDate(value) {
  return new Date(value).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
}
function waitingText(value, now) {
  const minutes = Math.max(0, Math.floor((Date.parse(now) - Date.parse(value)) / 6e4));
  return minutes < 60 ? `${minutes} phút` : minutes < 1440 ? `${Math.floor(minutes / 60)} giờ ${minutes % 60} phút` : `${Math.floor(minutes / 1440)} ngày ${Math.floor(minutes % 1440 / 60)} giờ`;
}
export {
  POSITIONS as P,
  WORKFLOW_KINDS as W,
  approvalInTab as a,
  approvalOverdue as b,
  defaultApprovalSteps as d,
  orgDate as o,
  waitingText as w
};
