import { q as queryOptions, u as useQueryClient, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-DfPXH9B8.mjs";
import { g as googleDocsOk } from "./documents-RNnMLtSC.mjs";
function officialLinkValid(kind, url, submit) {
  return !url.trim() && (!submit || kind === "report") || googleDocsOk(url);
}
function hasSubmittedDocument(row) {
  return !!row.document?.versions.some((v) => v.submitted_at && googleDocsOk(v.url ?? ""));
}
function canSubmitInPhase(phase, first, lateStatus) {
  if (first) return true;
  return phase === "open" || phase === "none" || phase === "overdue" && lateStatus === "approved";
}
function documentError(error) {
  const fields = typeof error === "object" && error !== null ? error : {};
  const text = [fields.message, fields.details, fields.hint, fields.code].filter((v) => typeof v === "string").join(" · ") || (typeof error === "string" ? error : "");
  if (/Google Docs/i.test(text)) return "Vui lòng nhập link Google Docs kế hoạch chính thức trước khi nộp.";
  if (/chưa mở|chưa đến ngày mở/i.test(text)) return "Kỳ kế hoạch chưa đến ngày mở nộp.";
  if (/quá hạn|hết hạn/i.test(text)) return "Đã hết hạn nộp trực tiếp. Vui lòng gửi yêu cầu xin nộp bù.";
  if (/đóng/i.test(text)) return "Kỳ nộp đã đóng. Không thể nộp mới hoặc xin nộp bù.";
  if (/quyền|42501/i.test(text)) return "Bạn không có quyền thực hiện thao tác này.";
  return text && text !== "[object Object]" ? text : "Không thể hoàn tất thao tác. Vui lòng thử lại.";
}
const documentsQuery = (uid, kind, periodKind, year, period) => queryOptions({ queryKey: ["biz_docs", uid, kind, periodKind, year, period], staleTime: 0, queryFn: async () => {
  const { data, error } = await supabase.rpc("biz_documents_read", { _kind: kind, _period_kind: periodKind, _year: year, _period: period });
  if (error) throw error;
  return data;
} });
const myWorkQuery = (uid, kind) => queryOptions({ queryKey: ["biz_my_work", uid, kind], staleTime: 0, queryFn: async () => {
  const { data, error } = await supabase.rpc("biz_my_work", { _kind: kind });
  if (error) throw error;
  return data;
} });
const reportMetricsQuery = (uid, user, year, kind, period, mode = "official") => queryOptions({ queryKey: ["biz_metrics", uid, user, year, kind, period, mode], staleTime: 0, queryFn: async () => {
  const { data, error } = await supabase.rpc("biz_report_metrics", { _user: user, _year: year, _period_kind: kind, _period: period, _mode: "official" });
  if (error) throw error;
  return data;
} });
const documentEventsQuery = (uid, id) => queryOptions({ queryKey: ["biz_doc_events", uid, id], queryFn: async () => {
  const { data, error } = await supabase.from("biz_document_events").select("*").eq("document_id", id).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
} });
function useDocumentAction() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (a) => {
    const result = a.kind === "start" ? await supabase.rpc("biz_document_start", { _kind: a.docKind, _period_kind: a.periodKind, _year: a.year, _period: a.period, _reason: a.reason ?? void 0 }) : a.kind === "attach" ? await supabase.rpc("biz_document_attach_target", { _id: a.id, _revision: a.revision }) : a.kind === "save" ? await supabase.rpc("biz_document_save", { _id: a.id, _revision: a.revision, _url: a.url, _notes: a.notes, _actuals: a.actuals, _submit: a.submit, _allocations: a.allocations, _attachments: a.attachments }) : await supabase.rpc("biz_document_decide", { _id: a.id, _revision: a.revision, _approve: a.approve, _comment: a.comment });
    if (result.error) throw new Error(documentError(result.error));
    return result.data;
  }, onSuccess: async () => {
    await Promise.all(["biz_late_requests", "biz_my_work", "biz_approvals", "biz_dashboard", "biz_dashboard_published", "biz_docs", "biz_metrics", "biz_doc_events", "biz_plans_unviewed", "notifications"].map((key) => qc.invalidateQueries({ queryKey: [key] })));
  } });
}
function useDocumentOpen() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (versionId) => {
    const { data, error } = await supabase.rpc("biz_document_open", { _version_id: versionId });
    if (error) throw error;
    return data;
  }, onSuccess: async () => {
    await Promise.all(["biz_docs", "biz_plans_unviewed"].map((key) => qc.invalidateQueries({ queryKey: [key] })));
  } });
}
const plansUnviewedQuery = (uid, year, kind, period) => queryOptions({ queryKey: ["biz_plans_unviewed", uid, year, kind, period], staleTime: 15e3, queryFn: async () => {
  const { data, error } = await supabase.rpc("biz_plans_unviewed", { _year: year, _period_kind: kind, _period: period });
  if (error) throw error;
  return data;
} });
export {
  useDocumentOpen as a,
  documentError as b,
  canSubmitInPhase as c,
  documentsQuery as d,
  documentEventsQuery as e,
  hasSubmittedDocument as h,
  myWorkQuery as m,
  officialLinkValid as o,
  plansUnviewedQuery as p,
  reportMetricsQuery as r,
  useDocumentAction as u
};
