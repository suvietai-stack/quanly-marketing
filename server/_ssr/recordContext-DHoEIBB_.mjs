const RECORD_LABELS = { design: "Job Thiết kế", signal: "Tín hiệu", finance: "Đề nghị tài chính" };
function validRecordContext(value) {
  if (!value || typeof value !== "object") return false;
  const v = value;
  return ["design", "signal", "finance"].includes(v.kind) && typeof v.id === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(v.id);
}
export {
  RECORD_LABELS as R,
  validRecordContext as v
};
