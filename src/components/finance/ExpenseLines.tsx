// Bảng kê khoản chi dùng chung (Đề Nghị Thanh Toán; có thể tái dùng cho Đề Nghị Tạm Ứng).
// Desktop: bảng nhập trực tiếp. Mobile: danh sách thẻ thu gọn + form thêm/sửa trong Dialog.
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  emptyLine, isBlankLine, lineTotal, linesTotal, fmtAmountInput, parseAmount, vnd,
  type FrLine,
} from "@/lib/financeRequests/logic";
import type { FrLineCatalog, FrRequestLine } from "@/lib/financeRequests/api";

const fmtQty = (q: number) => (Number.isInteger(q) ? String(q) : String(q));

/** Khớp tên nhập tay với danh mục (không bắt buộc; tự nhập vẫn hợp lệ). */
const matchCatalog = (name: string, catalog: FrLineCatalog[]) =>
  catalog.find((c) => c.name.trim().toLowerCase() === name.trim().toLowerCase())?.id ?? null;

// ============ Editor ============

export function ExpenseLinesEditor({ lines, onChange, catalog }: {
  lines: FrLine[];
  onChange: (ls: FrLine[]) => void;
  catalog: FrLineCatalog[];
}) {
  const [editIdx, setEditIdx] = useState<number | null>(null); // mobile dialog
  const set = (i: number, patch: Partial<FrLine>) =>
    onChange(lines.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const remove = (i: number) => {
    const l = lines[i];
    if (!isBlankLine(l) && !window.confirm(`Xóa khoản chi "${l.name || "chưa đặt tên"}"?`)) return;
    onChange(lines.filter((_, j) => j !== i));
  };
  const add = () => onChange([...lines, emptyLine()]);
  const total = linesTotal(lines);

  return (
    <div className="fr-expense-lines space-y-2">
      {/* Desktop: bảng nhập nhanh */}
      <div className="hidden md:block rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground">
              <th className="w-8 px-2 py-2 text-center font-medium">#</th>
              <th className="px-2 py-2 text-left font-medium">Tên khoản chi *</th>
              <th className="w-20 px-2 py-2 text-left font-medium">ĐVT</th>
              <th className="w-20 px-2 py-2 text-right font-medium">SL</th>
              <th className="w-32 px-2 py-2 text-right font-medium">Đơn giá</th>
              <th className="w-32 px-2 py-2 text-right font-medium">Thành tiền</th>
              <th className="w-10 px-1 py-2" />
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={i} className="border-t">
                <td className="px-2 py-1 text-center text-muted-foreground">{i + 1}</td>
                <td className="px-1 py-1">
                  <Input
                    className="h-9 border-0 shadow-none focus-visible:ring-1"
                    list="fr-line-catalog"
                    maxLength={300}
                    placeholder="VD: In catalogue"
                    value={l.name}
                    onChange={(e) => set(i, { name: e.target.value, catalog_id: matchCatalog(e.target.value, catalog) })}
                  />
                </td>
                <td className="px-1 py-1">
                  <Input
                    className="h-9 border-0 shadow-none focus-visible:ring-1"
                    maxLength={30}
                    placeholder="Khoản"
                    value={l.unit}
                    onChange={(e) => set(i, { unit: e.target.value })}
                  />
                </td>
                <td className="px-1 py-1">
                  <Input
                    className="h-9 border-0 shadow-none text-right focus-visible:ring-1"
                    inputMode="decimal"
                    value={fmtQty(l.qty)}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^\d.,]/g, "").replace(",", ".");
                      const n = Number(v);
                      set(i, { qty: v === "" ? 0 : Number.isFinite(n) ? n : l.qty });
                    }}
                  />
                </td>
                <td className="px-1 py-1">
                  <Input
                    className="h-9 border-0 shadow-none text-right focus-visible:ring-1"
                    inputMode="numeric"
                    placeholder="0"
                    value={l.unit_price ? fmtAmountInput(String(l.unit_price)) : ""}
                    onChange={(e) => set(i, { unit_price: parseAmount(e.target.value) })}
                  />
                </td>
                <td className="px-2 py-1 text-right font-semibold tabular-nums">
                  {isBlankLine(l) ? "—" : vnd(lineTotal(l))}
                </td>
                <td className="px-1 py-1 text-center">
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8" aria-label={`Xóa dòng ${i + 1}`} onClick={() => remove(i)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <datalist id="fr-line-catalog">
          {catalog.filter((c) => c.active).map((c) => <option key={c.id} value={c.name} />)}
        </datalist>
      </div>

      {/* Mobile: thẻ thu gọn */}
      <div className="md:hidden space-y-2">
        {lines.map((l, i) => (
          <div key={i} className="fr-expense-card rounded-2xl border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="font-medium leading-snug">{i + 1}. {l.name || <span className="text-muted-foreground">Chưa đặt tên</span>}</div>
                {!isBlankLine(l) && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {fmtQty(l.qty)}{l.unit ? ` ${l.unit}` : ""} × {vnd(l.unit_price)}
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="font-semibold tabular-nums">{isBlankLine(l) ? "—" : vnd(lineTotal(l))}</div>
                <div className="flex gap-1 mt-1 justify-end">
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8" aria-label={`Sửa khoản ${i + 1}`} onClick={() => setEditIdx(i)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8" aria-label={`Xóa khoản ${i + 1}`} onClick={() => remove(i)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto"
        onClick={() => {
          if (window.matchMedia("(max-width: 767px)").matches) {
            onChange([...lines, emptyLine()]);
            setEditIdx(lines.length);
          } else add();
        }}>
        <Plus className="h-4 w-4 mr-1" />Thêm khoản chi
      </Button>

      <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
        <span className="text-sm text-muted-foreground">{lines.filter((l) => !isBlankLine(l)).length} khoản chi</span>
        <span className="font-bold">Tổng tiền: {vnd(total)}</span>
      </div>

      {/* Form thêm/sửa trên Mobile */}
      <LineDialog
        line={editIdx !== null ? lines[editIdx] : null}
        catalog={catalog}
        onClose={() => setEditIdx(null)}
        onSave={(l) => {
          if (editIdx === null) return;
          set(editIdx, l);
          setEditIdx(null);
        }}
      />
    </div>
  );
}

function LineDialog({ line, catalog, onClose, onSave }: {
  line: FrLine | null; catalog: FrLineCatalog[];
  onClose: () => void; onSave: (l: FrLine) => void;
}) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!line) return;
    setName(line.name); setUnit(line.unit);
    setQty(line.qty ? fmtQty(line.qty) : "1");
    setPrice(line.unit_price ? fmtAmountInput(String(line.unit_price)) : "");
    setErr("");
  }, [line]);

  if (!line) return null;
  const q = Number(qty.replace(",", ".")) || 0;
  const p = parseAmount(price);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="fr-mobile-dialog fr-expense-dialog max-w-md">
        <DialogHeader><DialogTitle>Khoản chi</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Tên khoản chi *</Label>
            <Input list="fr-line-catalog-mobile" maxLength={300} value={name} autoFocus
              onChange={(e) => setName(e.target.value)} placeholder="VD: Vận chuyển" />
            <datalist id="fr-line-catalog-mobile">
              {catalog.filter((c) => c.active).map((c) => <option key={c.id} value={c.name} />)}
            </datalist>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>ĐVT</Label>
              <Input maxLength={30} value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Khoản" />
            </div>
            <div className="space-y-1.5">
              <Label>Số lượng</Label>
              <Input inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value.replace(/[^\d.,]/g, ""))} />
            </div>
            <div className="col-span-2 md:col-span-1 space-y-1.5">
              <Label>Đơn giá *</Label>
              <Input inputMode="numeric" value={price} onChange={(e) => setPrice(fmtAmountInput(e.target.value))} placeholder="0" />
            </div>
          </div>
          <div className="flex justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Thành tiền</span>
            <b>{vnd(Math.round(q * p))}</b>
          </div>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <Button className="w-full" onClick={() => {
            if (!name.trim()) return setErr("Vui lòng nhập tên khoản chi.");
            if (!(q > 0)) return setErr("Số lượng phải lớn hơn 0.");
            if (!(p > 0)) return setErr("Đơn giá phải lớn hơn 0.");
            onSave({ ...line, name: name.trim(), unit: unit.trim(), qty: q, unit_price: p, catalog_id: matchCatalog(name, catalog) });
          }}>Lưu khoản chi</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============ Chế độ xem (chi tiết đề nghị) ============

export function ExpenseLinesView({ lines }: { lines: FrRequestLine[] }) {
  if (!lines.length) return null;
  const total = lines.reduce((s, l) => s + Number(l.line_total), 0);
  return (
    <div className="fr-expense-lines space-y-2">
      <div className="font-semibold text-sm">Bảng kê khoản chi</div>
      {/* Desktop */}
      <div className="hidden md:block rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground">
              <th className="w-8 px-2 py-2 text-center font-medium">#</th>
              <th className="px-2 py-2 text-left font-medium">Tên khoản chi</th>
              <th className="w-20 px-2 py-2 text-left font-medium">ĐVT</th>
              <th className="w-16 px-2 py-2 text-right font-medium">SL</th>
              <th className="w-28 px-2 py-2 text-right font-medium">Đơn giá</th>
              <th className="w-28 px-2 py-2 text-right font-medium">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="px-2 py-1.5 text-center text-muted-foreground">{l.line_no}</td>
                <td className="px-2 py-1.5">{l.name}</td>
                <td className="px-2 py-1.5 text-muted-foreground">{l.unit ?? ""}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{fmtQty(Number(l.qty))}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{vnd(Number(l.unit_price))}</td>
                <td className="px-2 py-1.5 text-right font-semibold tabular-nums">{vnd(Number(l.line_total))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile */}
      <div className="md:hidden space-y-2">
        {lines.map((l) => (
          <div key={l.id} className="fr-expense-card rounded-2xl border bg-card p-3 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="font-medium leading-snug">{l.line_no}. {l.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {fmtQty(Number(l.qty))}{l.unit ? ` ${l.unit}` : ""} × {vnd(Number(l.unit_price))}
              </div>
            </div>
            <div className="font-semibold tabular-nums shrink-0">{vnd(Number(l.line_total))}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-end rounded-lg bg-muted/50 px-3 py-2">
        <span className="font-bold">Tổng tiền: {vnd(total)}</span>
      </div>
    </div>
  );
}

