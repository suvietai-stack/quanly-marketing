import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { addOption, moveOption, removeOption, renameOption, toggleOption, type CatOption, type OptionScope } from "@/lib/signals/catalog";
import { errMsg, optionUsage, renameOptionEverywhere, saveOptions } from "@/lib/signals/api";
import { useOptions } from "./SignalsUi";

const SIG = "sig:";
const LISTS: { scope: OptionScope; title: string; hint: string }[] = [
  { scope: "signal_sources", title: "Nguồn tín hiệu", hint: "Chọn một khi tạo tín hiệu" },
  { scope: "signal_products", title: "Loại sản phẩm", hint: "Cho phép chọn nhiều" },
  { scope: "signal_need_groups", title: "Nhóm nhu cầu", hint: "Cho phép chọn nhiều" },
];

/** Cài đặt → Danh mục tín hiệu: dùng chung bảng danh mục đã có, quyền kiểm tra ở cơ sở dữ liệu. */
export function SignalCatalogSettings() {
  return <div className="grid gap-4 lg:grid-cols-3">{LISTS.map((l) => <CatalogCard key={l.scope} {...l} />)}</div>;
}

function CatalogCard({ scope, title, hint }: { scope: OptionScope; title: string; hint: string }) {
  const qc = useQueryClient();
  const o = useOptions(scope);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = () => qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith(SIG) });
  const run = async (fn: () => Promise<void>, ok?: string) => {
    setBusy(true);
    try { await fn(); await refresh(); if (ok) toast.success(ok); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  const persist = (items: CatOption[]) => saveOptions(scope, items);

  return (
    <Card><CardContent className="p-4 space-y-3">
      <div><h3 className="font-semibold">{title}</h3><p className="text-xs text-muted-foreground">{hint}</p></div>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); run(async () => { await persist(addOption(o.all, name)); setName(""); }, "Đã thêm"); }}>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên lựa chọn mới" maxLength={100} className="h-9" />
        <Button type="submit" size="sm" disabled={busy || !name.trim()}><Plus className="h-4 w-4" /></Button>
      </form>
      <ul className="divide-y text-sm">
        {o.all.map((it, i) => (
          <li key={it.name} className="flex items-center gap-1 py-1.5">
            <span className={cn("flex-1 min-w-0 truncate", !it.active && "line-through text-muted-foreground")}>{it.name}</span>
            <Button size="icon" variant="ghost" className="h-7 w-7" disabled={busy || i === 0} aria-label="Lên" onClick={() => run(() => persist(moveOption(o.all, it.name, -1)))}><ArrowUp className="h-3.5 w-3.5" /></Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" disabled={busy || i === o.all.length - 1} aria-label="Xuống" onClick={() => run(() => persist(moveOption(o.all, it.name, 1)))}><ArrowDown className="h-3.5 w-3.5" /></Button>
            <button type="button" className="text-xs underline px-1" disabled={busy} onClick={() => {
              const to = window.prompt("Tên mới", it.name); if (!to || to.trim() === it.name) return;
              run(async () => { const items = renameOption(o.all, it.name, to); await renameOptionEverywhere(scope, it.name, items[i].name, items); }, "Đã đổi tên, tín hiệu cũ cập nhật theo");
            }}>Sửa</button>
            <button type="button" className="text-xs underline px-1" disabled={busy} onClick={() => run(() => persist(toggleOption(o.all, it.name)))}>{it.active ? "Ngừng dùng" : "Dùng lại"}</button>
            <button type="button" className="text-xs underline px-1 text-destructive" disabled={busy} onClick={() => run(async () => {
              const n = await optionUsage(scope, it.name);
              if (n > 0) throw new Error(`Đang có ${n} tín hiệu dùng lựa chọn này — chỉ được "Ngừng dùng".`);
              if (!window.confirm(`Xóa vĩnh viễn "${it.name}"?`)) return;
              await persist(removeOption(o.all, it.name));
            })}>Xóa</button>
          </li>
        ))}
      </ul>
    </CardContent></Card>
  );
}
