import { useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { oqApi, type JobTime } from "@/lib/orderQuotes/api";
import { vnDateTime } from "@/lib/orderQuotes/logic";
import { fmtDur } from "@/lib/orderQuotes/report";

/** Thời gian từng lượt từ máy chủ; làm mới 60 giây/lần (không dồn dập). */
export function useJobTimes(flowIds: string[]) {
  const key = [...flowIds].sort();
  const q = useQuery({ queryKey: ["oq-times", key], queryFn: () => oqApi.jobTimes(key), refetchInterval: 60_000, staleTime: 30_000, enabled: key.length > 0 });
  const all = q.data ?? [];
  const current = (flowId: string, round?: number) => {
    const rs = all.filter((t) => t.flow_id === flowId);
    return round ? rs.find((t) => t.round_no === round) : rs.sort((a, b) => b.round_no - a.round_no)[0];
  };
  return { all, current, isLoading: q.isLoading };
}

const since = (t: JobTime, iso: string | null) => (iso ? (Date.parse(t.server_now) - Date.parse(iso)) / 1000 : null);

/** Nhãn ngắn dùng trên danh sách. Job đang chạy luôn ghi rõ "tạm tính". */
export function timeLines(t: JobTime | undefined, kind: "price" | "progress") {
  if (!t) return null;
  if (t.status === "answered") return {
    head: kind === "price" ? "Đã báo giá" : "Đã phản hồi", running: false,
    resp: `Phản hồi: ${fmtDur(t.response_sec)}`,
    proc: `Cung ứng xử lý: ${t.data_ok ? fmtDur(t.process_sec) : "Chưa đủ dữ liệu"}`,
  };
  if (t.status === "cancelled") return { head: "Đã hủy", running: false, resp: "Phản hồi: —", proc: "Cung ứng xử lý: —" };
  const head = t.status === "pending" ? "Đang chờ" : t.status === "waiting_sale" ? "Chờ Sale bổ sung" : "Đang xử lý";
  return {
    head, running: true,
    resp: `${head} — đã trôi qua ${fmtDur(since(t, t.sent_at))}`,
    proc: t.status === "pending" || !t.final_accepted_at ? "Chưa tiếp nhận" : `Cung ứng đang xử lý: ${fmtDur(since(t, t.final_accepted_at))}`,
  };
}

export function ListTimeCell({ t, kind, part }: { t?: JobTime; kind: "price" | "progress"; part: "resp" | "proc" }) {
  const l = timeLines(t, kind);
  if (!l) return <span className="text-muted-foreground">—</span>;
  return <span className={l.running ? "text-muted-foreground" : ""}>{l[part].replace(/^(Phản hồi|Cung ứng xử lý): /, "")}{l.running && part === "resp" ? " (tạm tính)" : ""}</span>;
}

export function Explain({ text }: { text: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild><button type="button" aria-label="Giải thích" className="inline-flex text-muted-foreground hover:text-foreground"><Info className="h-3.5 w-3.5" /></button></PopoverTrigger>
      <PopoverContent className="text-xs max-w-72">{text}</PopoverContent>
    </Popover>
  );
}

export const EXPLAIN = {
  response: "Từ lúc Sale gửi (hoặc gửi hỏi lại) đến lúc lượt hoàn thành đầy đủ. Gồm cả thời gian chờ tiếp nhận và chờ Sale bổ sung.",
  process: "Từ lúc Cung ứng hiện tại xác nhận tiếp nhận đến lúc hoàn thành, trừ các khoảng chờ Sale bổ sung ghi nhận trong hệ thống. Nếu có chuyển giao, chỉ tính thời gian của người hoàn thành.",
  waitSale: "Tổng các khoảng từ lúc Cung ứng yêu cầu bổ sung đến lúc Sale gửi phản hồi.",
  accept: "Từ lúc Sale gửi đến lần xác nhận tiếp nhận đầu tiên của lượt.",
  firstPub: "Từ lúc Sale gửi đến lần công bố chính thức đầu tiên (lưu nháp không tính).",
};

/** Khối tóm tắt thời gian ở đầu mỗi luồng — mặc định lượt đang xem, không cộng dồn nhiều lượt. */
export function FlowTimeSummary({ t, kind, assignee }: { t?: JobTime; kind: "price" | "progress"; assignee: string }) {
  if (!t) return null;
  const l = timeLines(t, kind)!;
  const done = t.status === "answered";
  return (
    <div className="rounded-md border bg-muted/30 p-3 space-y-2 text-sm">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-1 text-xs">
        <span className="text-muted-foreground">Người phụ trách</span><span className="sm:col-span-3 font-medium">{assignee}{t.handover ? " · Có chuyển giao" : ""}</span>
        <span className="text-muted-foreground">Sale gửi</span><span>{vnDateTime(t.sent_at)}</span>
        <span className="text-muted-foreground">Tiếp nhận</span><span>{t.final_accepted_at ? vnDateTime(t.final_accepted_at) : "Chưa tiếp nhận"}</span>
        <span className="text-muted-foreground">Hoàn thành</span><span>{t.completed_at ? vnDateTime(t.completed_at) : "Chưa hoàn thành"}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">Thời gian phản hồi <Explain text={EXPLAIN.response} /></div>
          <div className="text-lg font-semibold">{done ? fmtDur(t.response_sec) : "—"}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">Thời gian Cung ứng xử lý <Explain text={EXPLAIN.process} /></div>
          <div className="text-lg font-semibold">{done ? (t.data_ok ? fmtDur(t.process_sec) : "Chưa đủ dữ liệu") : "—"}</div>
        </div>
      </div>
      {!done && t.status !== "cancelled" && <p className="text-xs text-muted-foreground">{l.resp} · {l.proc} (số liệu tạm tính, chưa phải thời gian hoàn thành)</p>}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">Chờ Sale: <b className="text-foreground">{fmtDur(t.wait_sale_sec, "0")}</b> <Explain text={EXPLAIN.waitSale} /></span>
        <span className="flex items-center gap-1">Chờ tiếp nhận: <b className="text-foreground">{fmtDur(t.accept_wait_sec, "Chưa tiếp nhận")}</b> <Explain text={EXPLAIN.accept} /></span>
        {t.first_pub_sec != null && <span className="flex items-center gap-1">Công bố đầu tiên: <b className="text-foreground">{fmtDur(t.first_pub_sec)}</b> <Explain text={EXPLAIN.firstPub} /></span>}
      </div>
    </div>
  );
}
