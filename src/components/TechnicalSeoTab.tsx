import { useMemo, useState } from "react";
import { useStore, ensureSeoChecks, todayISO, SEO_CHECK_TEMPLATE } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, RotateCcw, CheckCircle2 } from "lucide-react";
import { useCurrentUser } from "@/lib/auth";
import { toast } from "sonner";

type StatusFilter = "all" | "done" | "todo";

export function TechnicalSeoTab({ websiteId }: { websiteId: string }) {
  const { can } = useCurrentUser();
  const canCheck = can("web.tech_check");
  const canEditDesc = can("web.tech_edit_desc");
  const canReset = can("web.tech_reset");
  const s = useStore();
  const checks = s.seoChecks.filter((c) => c.websiteId === websiteId);

  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const groups = useMemo(
    () => Array.from(new Set(checks.map((c) => c.group))),
    [checks],
  );

  const total = checks.length;
  const done = checks.filter((c) => c.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const q = search.trim().toLowerCase();
  const filtered = checks.filter((c) => {
    if (groupFilter !== "all" && c.group !== groupFilter) return false;
    if (statusFilter === "done" && !c.done) return false;
    if (statusFilter === "todo" && c.done) return false;
    if (q) {
      const hay = `${c.group} ${c.name} ${c.description || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  // Group filtered items by group, preserve template order
  const grouped = useMemo(() => {
    const order = Array.from(new Set([...Object.keys(SEO_CHECK_TEMPLATE), ...groups]));
    return order
      .map((g) => ({ g, items: filtered.filter((c) => c.group === g) }))
      .filter((x) => x.items.length > 0);
  }, [filtered, groups]);

  const reset = () => {
    if (!canReset) { toast.error("Bạn không có quyền reset checklist Technical SEO."); return; }
    if (!confirm("Reset checklist Technical SEO về mặc định? Trạng thái và ghi chú sẽ bị xóa.")) return;
    checks.forEach((c) => s.remove("seoChecks", c.id));
    // re-seed from template
    setTimeout(() => {
      ensureSeoChecks([], websiteId).forEach((c) => s.add("seoChecks", c));
    }, 0);
  };

  return (
    <div className="space-y-4">
      {/* Progress */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-sm font-medium">Tiến độ Technical SEO</div>
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{done}/{total}</span> hạng mục đã hoàn thành — {pct}%
            </div>
          </div>
          <Progress value={pct} />
        </CardContent>
      </Card>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-3 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-8" placeholder="Tìm hạng mục, vấn đề, diễn giải..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={groupFilter} onValueChange={setGroupFilter}>
            <SelectTrigger className="w-[260px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả hạng mục</SelectItem>
              {Array.from(new Set([...Object.keys(SEO_CHECK_TEMPLATE), ...groups])).map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="done">Đã hoàn thành</SelectItem>
              <SelectItem value="todo">Chưa hoàn thành</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto">
            {canReset && (
              <Button variant="outline" onClick={reset}><RotateCcw className="h-4 w-4" />Reset checklist</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Accordion list */}
      {grouped.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Không có mục nào khớp bộ lọc.</CardContent></Card>
      ) : (
        <Accordion type="multiple" defaultValue={grouped.map((x) => x.g)} className="space-y-2">
          {grouped.map(({ g, items }) => {
            const gDone = items.filter((c) => c.done).length;
            const gPct = items.length ? Math.round((gDone / items.length) * 100) : 0;
            return (
              <AccordionItem key={g} value={g} className="border rounded-lg bg-card overflow-hidden">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30">
                  <div className="flex flex-1 items-center gap-3">
                    <span className="font-semibold text-left">{g}</span>
                    <span className="text-xs text-muted-foreground">{gDone}/{items.length}</span>
                    <div className="ml-auto flex items-center gap-2 mr-3 min-w-[120px]">
                      <Progress value={gPct} className="h-1.5" />
                      <span className="text-xs text-muted-foreground w-8 text-right">{gPct}%</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-xs text-muted-foreground bg-muted/30 border-y">
                        <tr>
                          <th className="text-left font-medium px-4 py-2 w-[28%]">Các vấn đề kiểm tra</th>
                          <th className="text-center font-medium px-3 py-2 w-[110px]">Trạng thái</th>
                          <th className="text-left font-medium px-4 py-2">Diễn giải</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {items.map((it) => (
                          <tr key={it.id} className={it.done ? "bg-success/5" : "hover:bg-muted/20"}>
                            <td className="px-4 py-2.5 align-top">
                              <div className={`font-medium ${it.done ? "text-muted-foreground" : ""}`}>{it.name}</div>
                              <Input
                                className="h-7 text-xs mt-1.5"
                                placeholder="Ghi chú nội bộ (tuỳ chọn)..."
                                value={it.notes || ""}
                                onChange={(e) => s.update("seoChecks", it.id, { notes: e.target.value })}
                              />
                            </td>
                            <td className="px-3 py-2.5 align-top">
                              <div className="flex items-center justify-center gap-1.5">
                                <Checkbox
                                  checked={it.done}
                                  onCheckedChange={(v) => s.update("seoChecks", it.id, { done: !!v, checkedAt: v ? todayISO() : undefined })}
                                />
                                {it.done && <CheckCircle2 className="h-4 w-4 text-success" />}
                              </div>
                            </td>
                            <td className="px-4 py-2.5 align-top">
                              <Textarea
                                rows={2}
                                className="text-xs min-h-0 resize-y"
                                value={it.description || ""}
                                onChange={(e) => s.update("seoChecks", it.id, { description: e.target.value })}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}
