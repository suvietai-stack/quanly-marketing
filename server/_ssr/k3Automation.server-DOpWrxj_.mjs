import { postGroup } from "./gmf.server-CUA1cOPW.mjs";
import { b as k3DailyReport } from "./k3DailyReport-C2AYBx3X.mjs";
import "./zalo.server-DBQRHLrG.mjs";
import "crypto";
import "./zaloSend-DdkAb9gd.mjs";
import "./reminder-p6KbmApG.mjs";
async function processK3Reports() {
  const { supabaseAdmin: db } = await import("./client.server-D5ro3rAQ.mjs");
  const { error: queuedError } = await db.rpc("k3_zalo_report_queue");
  if (queuedError) throw new Error("Không tạo được báo cáo 3K.");
  const { data: reports, error } = await db.rpc("k3_zalo_report_claim");
  if (error) throw new Error("Không nhận được lượt gửi báo cáo 3K.");
  let processed = 0;
  for (const report of reports ?? []) {
    if (!report.lease) continue;
    const people = report.snapshot;
    const result = await postGroup(report.group_id, k3DailyReport(report.work_date, people));
    const { data: finalized, error: finished } = await db.rpc("k3_zalo_report_finish", { _id: report.id, _lease: report.lease, _status: result.ok ? "sent" : result.ambiguous ? "unknown" : "failed", _error: result.ok ? void 0 : `${result.code}: ${result.message}` });
    if (finished || !finalized) throw new Error("Chưa xác nhận được kết quả gửi; cần đối soát.");
    processed++;
  }
  return { processed };
}
export {
  processK3Reports
};
