const STATUS_LABELS = { draft: "Bản nháp", pending: "Chờ duyệt", changes: "Cần chỉnh sửa", approved: "Đã duyệt" };
const STATE_LABELS = { none: "Chưa lập", draft: "Bản nháp", pending: "Chờ duyệt", changes: "Cần chỉnh sửa", approved: "Đã duyệt", adjusting: "Đang đề nghị điều chỉnh" };
function goalState(goal) {
  const latest = goal.versions[goal.versions.length - 1];
  if (!latest) return "none";
  if (latest.status === "approved") return "approved";
  if (latest.status === "pending") return "pending";
  if (goal.official_version_id) return "adjusting";
  return latest.status;
}
function draftDeletable(v) {
  return v.status === "draft" && !v.submitted_at;
}
function displayVersion(goal) {
  return goal.versions.find((v) => v.id === goal.official_version_id) ?? goal.versions[goal.versions.length - 1];
}
function validValue(value) {
  return value === null || /^[0-9]{1,20}$/.test(value);
}
function total(values) {
  return values.reduce((sum, v) => sum + BigInt(v ?? "0"), 0n);
}
function quarterTotal(item, quarter) {
  const values = item.months.slice(quarter * 3, quarter * 3 + 3);
  return item.definition.aggregation === "sum" ? total(values).toString() : averageText(values);
}
function averageText(values) {
  const n = BigInt(values.length);
  const sum = total(values);
  return `${sum / n}${sum % n ? `,${(sum % n * 100n / n).toString().padStart(2, "0")}` : ""}`;
}
function allocationMatches(item) {
  if (item.annual === null || item.months.length !== 12 || item.months.some((v) => v === null || !validValue(v)) || !validValue(item.annual)) return false;
  return item.definition.aggregation === "sum" ? total(item.months) === BigInt(item.annual) : total(item.months) === BigInt(item.annual) * 12n;
}
function allocatedText(item) {
  return item.definition.aggregation === "sum" ? total(item.months).toLocaleString("vi-VN") : averageText(item.months);
}
function differenceText(item) {
  if (item.annual === null) return "—";
  const multiplier = item.definition.aggregation === "sum" ? 1n : 12n;
  const difference = BigInt(item.annual) * multiplier - total(item.months);
  return multiplier === 1n ? difference.toLocaleString("vi-VN") : averageText([difference.toString(), ...Array(11).fill("0")]);
}
function allocationPercent(item) {
  if (item.annual === null) return "—";
  const denominator = BigInt(item.annual) * (item.definition.aggregation === "sum" ? 1n : 12n);
  if (denominator === 0n) return total(item.months) === 0n ? "100%" : "—";
  return `${total(item.months) * 100n / denominator}%`;
}
function fmtGoal(value) {
  return value === null ? "—" : BigInt(value).toLocaleString("vi-VN");
}
function fmtQuarter(item, quarter) {
  const result = quarterTotal(item, quarter);
  return /^-?\d+$/.test(result) ? BigInt(result).toLocaleString("vi-VN") : result;
}
export {
  STATE_LABELS as S,
  fmtQuarter as a,
  STATUS_LABELS as b,
  draftDeletable as c,
  displayVersion as d,
  allocationMatches as e,
  fmtGoal as f,
  goalState as g,
  allocatedText as h,
  differenceText as i,
  allocationPercent as j,
  validValue as v
};
