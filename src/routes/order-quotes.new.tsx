import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { RequirePermission } from "@/components/PermissionGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { oqApi } from "@/lib/orderQuotes/api";
import { PRICE_CATS, vnDate, type PriceConfig, type ProgressConfig } from "@/lib/orderQuotes/logic";
import { ItemImages, MobileActionBar, ProductQuantity, UserPicker, useUserName } from "@/components/orderQuotes/OqCommon";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/order-quotes/new")({
  validateSearch: (s: Record<string, unknown>) => ({ id: typeof s.id === "string" ? s.id : undefined }),
  head: () => ({ meta: [
    { title: "Tạo yêu cầu Hỏi Giá & Tiến Độ" },
    { name: "description", content: "Tạo yêu cầu hỏi giá, kiểm tra khả năng đáp ứng và ngày giao dự kiến trước khi chốt đơn." },
    { property: "og:title", content: "Tạo yêu cầu Hỏi Giá & Tiến Độ" },
    { property: "og:description", content: "Form 4 bước: thông tin đơn, sản phẩm, nội dung hỏi, kiểm tra và gửi." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <RequirePermission perm="oq.create"><OqForm /></RequirePermission>,
});

type Item = { id?: string; key: string; name: string; qty: string; unit: string; detail: string; processing: string; note: string };
type Form = {
  title: string; delivery_place: string; delivery_date: string; note: string; items_mode: "option" | "bundle";
  want_price: boolean; want_progress: boolean; items: Item[];
  price: PriceConfig; progress: ProgressConfig; price_assignee: string; progress_assignee: string;
};
const newItem = (): Item => ({ key: crypto.randomUUID(), name: "", qty: "", unit: "bộ", detail: "", processing: "", note: "" });
const empty: Form = { title: "", delivery_place: "", delivery_date: "", note: "", items_mode: "option", want_price: false, want_progress: false, items: [newItem()], price: { items: {}, shipping_mode: "per_item" }, progress: { check_type: "capability" }, price_assignee: "", progress_assignee: "" };
const STEPS = ["Thông tin đơn hàng", "Sản phẩm", "Nội dung hỏi & Cung ứng", "Kiểm tra & gửi"];

function OqForm() {
  const { id: initialId } = Route.useSearch();
  const nav = useNavigate();
  const name = useUserName();
  const [id, setId] = useState<string | null>(initialId ?? null);
  const [f, setF] = useState<Form>(empty);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(!initialId);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const toggleItem = (k: string) => setCollapsed((c) => { const n = new Set(c); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const priceUsers = useQuery({ queryKey: ["oq-assignees", "price"], queryFn: () => oqApi.assignees("price") }).data ?? [];
  const progUsers = useQuery({ queryKey: ["oq-assignees", "progress"], queryFn: () => oqApi.assignees("progress") }).data ?? [];

  const reload = async (rid: string, keepForm = false) => {
    const d = await oqApi.detail(rid);
    if (!d) { toast.error("Không tìm thấy bản nháp."); return; }
    if (d.req.status !== "draft") { nav({ to: "/order-quotes/$id", params: { id: rid }, search: { flow: undefined } }); return; }
    setImages(d.images);
    const items: Item[] = d.items.map((i: any) => ({ id: i.id, key: i.id, name: i.name ?? "", qty: i.qty == null ? "" : String(i.qty), unit: i.unit ?? "", detail: i.detail ?? "", processing: i.processing ?? "", note: i.note ?? "" }));
    if (keepForm) { setF((p) => ({ ...p, items: p.items.map((it, idx) => ({ ...it, id: items[idx]?.id, key: items[idx]?.id ?? it.key })) })); return; }
    const c = d.req.draft_config ?? {};
    setF({ title: d.req.title ?? "", delivery_place: d.req.delivery_place ?? "", delivery_date: d.req.delivery_date ?? "", note: d.req.note ?? "", items_mode: d.req.items_mode,
      want_price: d.req.want_price, want_progress: d.req.want_progress, items: items.length ? items : [newItem()],
       price: c.price ?? { items: {}, shipping_mode: "per_item" }, progress: c.progress ?? { check_type: "capability" }, price_assignee: c.price_assignee ?? "", progress_assignee: c.progress_assignee ?? "" });
    setLoaded(true);
  };
  useEffect(() => { if (initialId) reload(initialId); }, [initialId]);

   const payload = (forSubmit = false) => ({
    title: f.title, delivery_place: f.delivery_place, delivery_date: f.delivery_date, note: f.note, items_mode: f.items_mode,
    want_price: f.want_price, want_progress: f.want_progress,
    items: f.items.map(({ id, name, qty, unit, detail, processing, note }) => ({ id, name, qty, unit, detail, processing, note })),
     config: { price: f.price, progress: forSubmit ? { content: f.progress.content, per_item: f.progress.per_item, check_type: "capability" } : f.progress, price_assignee: f.want_price ? f.price_assignee : "", progress_assignee: f.want_progress ? f.progress_assignee : "" },
  });
   const save = async (quiet = false, forSubmit = false) => {
     const rid = await oqApi.save(id, payload(forSubmit));
    if (!id) { setId(rid); nav({ to: "/order-quotes/new", search: { id: rid }, replace: true }); }
    await reload(rid, true);
    if (!quiet) toast.success("Đã lưu nháp.");
    return rid;
  };
  const run = async (fn: () => Promise<unknown>) => { setBusy(true); try { await fn(); } catch (e: any) { toast.error(e.message); } finally { setBusy(false); } };

  const setItem = (k: string, patch: Partial<Item>) => setF((p) => ({ ...p, items: p.items.map((i) => (i.key === k ? { ...i, ...patch } : i)) }));
  /** Lỗi theo từng trường (chỉ kiểm tra khi Tiếp tục/Gửi; Lưu nháp không kiểm tra). */
  const needPlace = f.want_price && (f.price.shipping_mode === "common" || f.items.some((i) => i.id && (f.price.items?.[i.id] as any)?.shipping?.on));
  const needDate = f.want_progress;
  const fieldErrs = (s: number): Record<string, string> => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!f.title.trim()) e.title = "Nhập tên yêu cầu.";
      if (needPlace && !f.delivery_place.trim()) e.delivery_place = "Vui lòng bổ sung địa điểm giao hàng để Cung ứng báo giá vận chuyển.";
      if (needDate && !f.delivery_date) e.delivery_date = "Vui lòng bổ sung ngày khách cần nhận hàng để Cung ứng kiểm tra khả năng đáp ứng.";
    }
    if (s === 1) {
      if (f.items.length === 0) e.items = "Cần ít nhất một sản phẩm.";
      for (const i of f.items) {
        if (!i.name.trim()) e[`${i.key}.name`] = "Nhập tên sản phẩm.";
        const q = Number(i.qty);
        if (i.qty.trim() === "" || !Number.isFinite(q) || q <= 0) e[`${i.key}.qty`] = "Số lượng phải lớn hơn 0.";
        if (!i.unit.trim()) e[`${i.key}.unit`] = "Nhập đơn vị tính.";
        if (!i.detail.trim()) e[`${i.key}.detail`] = "Nhập thông tin chi tiết sản phẩm.";
      }
    }
    if (s === 2) {
      if (!f.want_price && !f.want_progress) e.flows = "Chọn ít nhất Hỏi Giá hoặc Hỏi Tiến Độ.";
      if (f.want_price && !priceUsers.some((u) => u.id === f.price_assignee)) e.price_assignee = "Chọn người phụ trách Hỏi Giá.";
      if (f.want_price && f.price.shipping_mode !== "common" && !f.items.some((i) => i.id && Object.values(f.price.items?.[i.id] ?? {}).some((c: any) => c?.on))) e.price_cats = "Chọn ít nhất một hạng mục cần báo giá.";
      if (f.want_progress && !progUsers.some((u) => u.id === f.progress_assignee)) e.progress_assignee = "Chọn người phụ trách Hỏi Tiến Độ.";
      if (f.want_progress && !f.progress.content?.trim()) e.progress_content = "Nhập nội dung cần kiểm tra.";
    }
    return e;
  };
  const [tried, setTried] = useState<Set<number>>(new Set());
  const err = (k: string) => (tried.has(step) ? fieldErrs(step)[k] : undefined);
  const stepErr = (s: number): string | null => {
    const e = fieldErrs(s); const n = Object.keys(e).length;
    return n ? `Còn ${n} mục cần bổ sung ở bước ${s + 1} (xem các ô báo đỏ).` : null;
  };
  const next = () => run(async () => {
    const e = stepErr(step); if (e) { setTried((t) => new Set(t).add(step)); throw new Error(e); }
    if (step === 1) await save(true); // cần mã sản phẩm để gắn hạng mục hỏi giá
    setStep((s) => s + 1);
    window.scrollTo({ top: 0 });
  });
  const submit = () => run(async () => {
    for (let s = 0; s < 3; s++) {
      const fe = fieldErrs(s); const e = stepErr(s);
      if (e) {
        setTried((t) => new Set(t).add(s)); setStep(s);
        const k = Object.keys(fe)[0];
        setTimeout(() => { const el = document.getElementById(`oq-f-${k}`); if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.focus(); } else window.scrollTo({ top: 0 }); }, 80);
        throw new Error(fe.delivery_place || fe.delivery_date || e);
      }
    }
     const rid = await save(true, true);
    const code = await oqApi.submit(rid);
    toast.success(`Đã gửi yêu cầu ${code}.`);
    nav({ to: "/order-quotes/$id", params: { id: rid }, search: { flow: undefined } });
  });

  const togglePriceCat = (itemId: string, cat: string, on: boolean) => setF((p) => {
    const items = { ...(p.price.items ?? {}) }; const cur = { ...(items[itemId] ?? {}) } as any;
    cur[cat] = { ...(cur[cat] ?? {}), on }; items[itemId] = cur; return { ...p, price: { ...p.price, items } };
  });
  const setPriceNote = (itemId: string, cat: string, note: string) => setF((p) => {
    const items = { ...(p.price.items ?? {}) }; const cur = { ...(items[itemId] ?? {}) } as any;
    cur[cat] = { ...(cur[cat] ?? {}), note }; items[itemId] = cur; return { ...p, price: { ...p.price, items } };
  });

  if (!loaded) return <p className="text-sm text-muted-foreground">Đang tải bản nháp…</p>;
  const itemImgs = (itemId?: string) => images.filter((g) => g.item_id === itemId);

  const curErr = tried.has(step) ? stepErr(step) : null;
  return (
    <div className="oq-mobile-create max-w-4xl mx-auto pb-32 md:pb-6">
      <PageHeader title={id ? "Bản nháp yêu cầu" : "Tạo yêu cầu"} description="Phân loại: Đơn Sứ Quà Tặng" />
      <div className="sm:hidden mb-2 text-sm font-semibold">Bước {step + 1}/4 — {STEPS[step]}</div>
      <p className="md:hidden mb-4 rounded-xl bg-primary/5 border border-primary/15 p-3 text-xs leading-5 text-muted-foreground">{['Đặt tên yêu cầu và thông tin giao hàng.','Thêm sản phẩm, số lượng và ảnh cần thiết.','Chọn hỏi giá hoặc tiến độ, rồi chọn người trả lời.','Kiểm tra lại thông tin trước khi gửi.'][step]}</p>
      <ol className="grid grid-cols-4 gap-1 mb-5">
        {STEPS.map((s, i) => (
          <li key={s}><button type="button" aria-label={`Bước ${i + 1}: ${s}`} onClick={() => i < step && setStep(i)} className={cn("w-full text-left rounded-md px-2 text-xs sm:text-sm border h-2 sm:h-auto sm:py-2", i === step ? "bg-primary text-primary-foreground border-primary" : i < step ? "bg-primary/40 sm:bg-accent border-primary/40 sm:border-border" : "bg-muted text-muted-foreground")}>
            <span className="hidden sm:inline"><span className="font-semibold">{i + 1}.</span> {s}</span></button></li>
        ))}
      </ol>

      {step === 0 && (
        <Card><CardContent className="p-4 sm:p-6 space-y-4">
          <div><Label>Phân loại đơn hàng</Label><Input value="Đơn Sứ Quà Tặng" disabled /></div>
          <div><Label>Tên yêu cầu *</Label><Input value={f.title} aria-invalid={!!err("title")} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={300} /><FieldErr m={err("title")} /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label htmlFor="oq-f-delivery_place">Địa điểm giao hàng{needPlace && <span className="text-destructive"> *</span>}</Label><Input id="oq-f-delivery_place" value={f.delivery_place} aria-invalid={!!err("delivery_place")} onChange={(e) => setF({ ...f, delivery_place: e.target.value })} />{needPlace && !err("delivery_place") && <p className="mt-1 text-xs text-muted-foreground">Bắt buộc vì bạn yêu cầu báo giá vận chuyển.</p>}<FieldErr m={err("delivery_place")} /></div>
            <div><Label htmlFor="oq-f-delivery_date">Ngày khách yêu cầu giao{needDate && <span className="text-destructive"> *</span>}</Label><Input id="oq-f-delivery_date" type="date" className="h-11" value={f.delivery_date} aria-invalid={!!err("delivery_date")} onChange={(e) => setF({ ...f, delivery_date: e.target.value })} />{needDate && !err("delivery_date") && <p className="mt-1 text-xs text-muted-foreground">Bắt buộc vì bạn chọn Hỏi Tiến Độ.</p>}<FieldErr m={err("delivery_date")} /></div>
          </div>
          <div><Label>Ghi chú chung</Label><Textarea rows={4} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></div>
        </CardContent></Card>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <Card><CardContent className="p-4">
            <Label className="mb-2 block">Các sản phẩm trong yêu cầu là</Label>
            <RadioGroup value={f.items_mode} onValueChange={(v) => setF({ ...f, items_mode: v as any })} className="grid sm:grid-cols-2 gap-2">
              <label className="flex items-start gap-2 rounded-md border p-3 cursor-pointer"><RadioGroupItem value="option" className="mt-0.5" /><span><b>Phương án để khách lựa chọn</b><br /><span className="text-xs text-muted-foreground">Không cộng số lượng giữa các phương án.</span></span></label>
              <label className="flex items-start gap-2 rounded-md border p-3 cursor-pointer"><RadioGroupItem value="bundle" className="mt-0.5" /><span><b>Sản phẩm khách đặt đồng thời</b><br /><span className="text-xs text-muted-foreground">Khách cần tất cả các sản phẩm.</span></span></label>
            </RadioGroup>
          </CardContent></Card>
          {f.items.map((it, idx) => {
            const hasErr = ["name", "qty", "unit", "detail"].some((k) => err(`${it.key}.${k}`));
            const isOpen = !collapsed.has(it.key) || hasErr;
            const imgs = itemImgs(it.id);
            return (
            <Card key={it.key}><CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <button type="button" className="flex min-w-0 flex-1 items-center gap-2 text-left" onClick={() => toggleItem(it.key)} aria-expanded={isOpen}>
                  <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">PA{String(idx + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block truncate font-medium", !it.name && "text-muted-foreground")}>{it.name || "(chưa đặt tên)"}</span>
                     {!isOpen && <span className="block text-xs text-muted-foreground">{imgs.length} ảnh</span>}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", isOpen && "rotate-180")} />
                </button>
                {f.items.length > 1 && <Button variant="ghost" size="icon" aria-label="Xóa sản phẩm" onClick={() => confirm(`Xóa PA${String(idx + 1).padStart(2, "0")}?`) && setF({ ...f, items: f.items.filter((x) => x.key !== it.key) })}><Trash2 className="h-4 w-4" /></Button>}
              </div>
               {!isOpen && <ProductQuantity qty={it.qty} unit={it.unit} />}
              <div className={cn("space-y-3", !isOpen && "hidden")}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="col-span-2"><Label>Tên sản phẩm *</Label><Input value={it.name} aria-invalid={!!err(`${it.key}.name`)} onChange={(e) => setItem(it.key, { name: e.target.value })} /><FieldErr m={err(`${it.key}.name`)} /></div>
                 <div><Label>Số lượng *</Label><Input type="number" min="0" inputMode="decimal" className="font-medium" value={it.qty} aria-invalid={!!err(`${it.key}.qty`)} onChange={(e) => setItem(it.key, { qty: e.target.value })} /><FieldErr m={err(`${it.key}.qty`)} /></div>
                <div><Label>Đơn vị tính *</Label><Input value={it.unit} aria-invalid={!!err(`${it.key}.unit`)} onChange={(e) => setItem(it.key, { unit: e.target.value })} /><FieldErr m={err(`${it.key}.unit`)} /></div>
              </div>
              <div><Label>Thông tin chi tiết sản phẩm *</Label><Textarea rows={3} className="field-sizing-content min-h-20" value={it.detail} aria-invalid={!!err(`${it.key}.detail`)} onChange={(e) => setItem(it.key, { detail: e.target.value })} /><FieldErr m={err(`${it.key}.detail`)} /></div>
              <div><Label>Yêu cầu in ấn / gia công</Label><Textarea rows={2} className="field-sizing-content min-h-16" value={it.processing} onChange={(e) => setItem(it.key, { processing: e.target.value })} /></div>
              <div><Label>Ghi chú riêng</Label><Textarea rows={2} className="field-sizing-content min-h-16" value={it.note} onChange={(e) => setItem(it.key, { note: e.target.value })} /></div>
              <div><Label className="mb-1 block">Hình ảnh tham khảo</Label>
                <ItemImages images={imgs} editable onChanged={() => id && oqApi.detail(id).then((d) => d && setImages(d.images))}
                  onAdd={async (file, cat) => {
                    if (!it.name.trim()) throw new Error("Nhập tên sản phẩm trước khi thêm ảnh.");
                    let rid = id; let itemId = it.id;
                    if (!rid || !itemId) {
                      rid = await save(true);
                      const d = await oqApi.detail(rid);
                      itemId = d?.items[idx]?.id; if (!itemId) throw new Error("Chưa lưu được sản phẩm.");
                    }
                    await oqApi.uploadImage(rid, itemId, file, cat, "");
                    if (!id) { const d2 = await oqApi.detail(rid); if (d2) setImages(d2.images); }
                  }} />
              </div>
              </div>
            </CardContent></Card>
          ); })}
          <Button variant="outline" className="w-full h-11 border-dashed" onClick={() => { const n = newItem(); setCollapsed(new Set(f.items.map((i) => i.key))); setF({ ...f, items: [...f.items, n] }); }}><Plus className="h-4 w-4 mr-1" />Thêm sản phẩm</Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <div className="grid grid-cols-2 gap-3">
               {([["want_price", "HỎI GIÁ", "Báo giá từng sản phẩm"], ["want_progress", "HỎI TIẾN ĐỘ", "Khả năng đáp ứng trước khi chốt đơn"]] as const).map(([k, t, sub]) => (
                <label key={k} className={cn("flex cursor-pointer flex-col gap-1 rounded-lg border-2 p-3 sm:p-4 transition-colors", f[k] ? "border-primary bg-primary/5" : "border-border")}>
                  <span className="flex items-center gap-2 font-semibold"><Checkbox checked={f[k]} onCheckedChange={(v) => setF(k === "want_price" ? { ...f, want_price: !!v, price_assignee: f.price_assignee || f.progress_assignee } : { ...f, want_progress: !!v, progress_assignee: f.progress_assignee || f.price_assignee })} />{t}</span>
                  <span className="text-xs text-muted-foreground">{sub}</span>
                </label>
              ))}
            </div>
            <FieldErr m={err("flows")} />
          </div>

          {f.want_price && (
            <Card className="border-l-4 border-l-primary"><CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">Hỏi Giá</h3>
              <div><Label>Người phụ trách Hỏi Giá *</Label>
                <UserPicker users={priceUsers} value={f.price_assignee} invalid={!!err("price_assignee")} onChange={(v) => setF({ ...f, price_assignee: v })} />
                <FieldErr m={err("price_assignee")} />
                {priceUsers.length === 0 && <p className="text-xs text-muted-foreground mt-1">Chưa có tài khoản nào được cấp quyền "Phản hồi Hỏi Giá".</p>}</div>
              <div><Label className="mb-1 block">Giá vận chuyển</Label>
                <RadioGroup value={f.price.shipping_mode ?? "per_item"} onValueChange={(v) => setF({ ...f, price: { ...f.price, shipping_mode: v as any } })} className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="per_item" />Hỏi riêng từng sản phẩm/phương án</label>
                  <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="common" />Hỏi chung cho cả đơn / tổ hợp sản phẩm</label>
                </RadioGroup>
                {needPlace && !f.delivery_place.trim() && <p className="mt-2 text-xs text-muted-foreground">Cần nhập Địa điểm giao hàng ở bước 1 để Cung ứng báo giá vận chuyển.</p>}
                {f.price.shipping_mode === "common" && <Textarea className="mt-2" rows={2} placeholder="Ghi rõ áp dụng cho sản phẩm nào, giao đi đâu…" value={f.price.shipping_note ?? ""} onChange={(e) => setF({ ...f, price: { ...f.price, shipping_note: e.target.value } })} />}
              </div>
              {f.items.map((it, idx) => it.id && (
                <div key={it.key} className="rounded-md border p-3 space-y-2">
                   <div className="font-medium text-sm">PA{String(idx + 1).padStart(2, "0")} — {it.name}</div>
                   <ProductQuantity qty={it.qty} unit={it.unit} />
                  {PRICE_CATS.filter((c) => !(c.key === "shipping" && f.price.shipping_mode === "common")).map((c) => {
                    const cur = (f.price.items?.[it.id!] as any)?.[c.key];
                    return (
                      <div key={c.key}>
                        <label className="flex items-center gap-2 text-sm"><Checkbox checked={!!cur?.on} onCheckedChange={(v) => togglePriceCat(it.id!, c.key, !!v)} />{c.label}</label>
                        {cur?.on && <Textarea className="mt-1" rows={2} placeholder="Ghi chú yêu cầu" value={cur?.note ?? ""} onChange={(e) => setPriceNote(it.id!, c.key, e.target.value)} />}
                      </div>
                    );
                  })}
                </div>
              ))}
              <FieldErr m={err("price_cats")} />
              <div><Label>Ghi chú chung cho Hỏi Giá</Label><Textarea rows={2} value={f.price.note ?? ""} onChange={(e) => setF({ ...f, price: { ...f.price, note: e.target.value } })} /></div>
            </CardContent></Card>
          )}

          {f.want_progress && (
            <Card className="border-l-4 border-l-accent-foreground/40"><CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">Hỏi Tiến Độ</h3>
              <div><Label>Người phụ trách Hỏi Tiến Độ *</Label>
                <UserPicker users={progUsers} value={f.progress_assignee} invalid={!!err("progress_assignee")} onChange={(v) => setF({ ...f, progress_assignee: v })} />
                <FieldErr m={err("progress_assignee")} />
                {f.want_price && f.price_assignee && f.price_assignee !== f.progress_assignee && progUsers.some((u) => u.id === f.price_assignee) && (
                  <Button type="button" variant="link" size="sm" className="h-auto px-0" onClick={() => setF({ ...f, progress_assignee: f.price_assignee })}>Dùng cùng người Hỏi Giá ({name(f.price_assignee)})</Button>)}
                {progUsers.length === 0 && <p className="text-xs text-muted-foreground mt-1">Chưa có tài khoản nào được cấp quyền "Phản hồi Hỏi Tiến Độ".</p>}</div>
               <p className="text-sm text-muted-foreground">Kiểm tra khả năng đáp ứng và thời gian giao hàng dự kiến trước khi chốt đơn.</p>
              <div><Label>Nội dung cần kiểm tra *</Label><Textarea rows={3} value={f.progress.content ?? ""} onChange={(e) => setF({ ...f, progress: { ...f.progress, content: e.target.value } })} /><FieldErr m={err("progress_content")} /></div>
              <p className="text-xs text-muted-foreground">Ngày khách yêu cầu giao: {f.delivery_date ? vnDate(f.delivery_date) : "chưa chọn — bắt buộc khi Hỏi Tiến Độ (bước 1)"}</p>
              {f.items.map((it, idx) => it.id && (
                <div key={it.key}><Label className="text-xs">Yêu cầu tiến độ riêng PA{String(idx + 1).padStart(2, "0")} — {it.name} (tùy chọn)</Label>
                  <Input value={f.progress.per_item?.[it.id] ?? ""} onChange={(e) => setF({ ...f, progress: { ...f.progress, per_item: { ...(f.progress.per_item ?? {}), [it.id!]: e.target.value } } })} /></div>
              ))}
            </CardContent></Card>
          )}
        </div>
      )}

      {step === 3 && (
        <Card><CardContent className="p-4 sm:p-6 space-y-3 text-sm">
          <Row k="Phân loại" v="Đơn Sứ Quà Tặng" /><Row k="Tên" v={f.title} /><Row k="Giao tại" v={f.delivery_place || "—"} /><Row k="Ngày giao" v={vnDate(f.delivery_date)} />
          {f.note && <Row k="Ghi chú" v={f.note} />}
          <Row k="Loại sản phẩm" v={f.items_mode === "option" ? "Phương án để khách lựa chọn (không cộng số lượng)" : "Sản phẩm đặt đồng thời"} />
           <div className="space-y-2">{f.items.map((it, i) => <div key={it.key} className="rounded border px-3 py-2 space-y-1"><div className="font-medium break-words">PA{String(i + 1).padStart(2, "0")} — {it.name}</div><ProductQuantity qty={it.qty} unit={it.unit} /><div className="text-xs text-muted-foreground">{itemImgs(it.id).length} ảnh</div></div>)}</div>
          <Row k="Nội dung hỏi" v={[f.want_price && `Hỏi Giá → ${name(f.price_assignee)}`, f.want_progress && `Hỏi Tiến Độ → ${name(f.progress_assignee)}`].filter(Boolean).join(" · ") || "—"} />
          <p className="text-xs text-muted-foreground">Sau khi gửi không đổi được phân loại đơn hàng. Mỗi nội dung hỏi thành một luồng xử lý riêng.</p>
        </CardContent></Card>
      )}

      {id && <div className="mt-4 md:hidden"><Button variant="ghost" size="sm" className="text-destructive" disabled={busy} onClick={() => confirm("Xóa bản nháp này?") && run(async () => { await oqApi.deleteDraft(id); nav({ to: "/order-quotes" }); })}>Xóa bản nháp</Button></div>}
      <MobileActionBar>
        {curErr && <p className="mb-2 text-xs text-destructive md:text-right">{curErr}</p>}
        <div className="grid grid-cols-3 gap-2 md:flex md:justify-end">
          {id && <Button variant="ghost" className="hidden md:inline-flex mr-auto text-destructive" disabled={busy} onClick={() => confirm("Xóa bản nháp này?") && run(async () => { await oqApi.deleteDraft(id); nav({ to: "/order-quotes" }); })}>Xóa nháp</Button>}
          <Button variant="outline" className="h-11 md:h-10" disabled={busy || step === 0} onClick={() => { setStep(step - 1); window.scrollTo({ top: 0 }); }}>Quay lại</Button>
          <Button variant="outline" className="h-11 md:h-10" disabled={busy} onClick={() => run(() => save())}>Lưu nháp</Button>
          {step < 3 ? <Button className="h-11 md:h-10" disabled={busy} onClick={next}>Tiếp tục</Button> : <Button className="h-11 md:h-10" disabled={busy} onClick={submit}>Gửi yêu cầu</Button>}
        </div>
      </MobileActionBar>
    </div>
  );
}

const Row = ({ k, v }: { k: string; v: string }) => <div className="grid grid-cols-[110px_1fr] gap-2"><span className="text-muted-foreground">{k}</span><span className="whitespace-pre-wrap">{v}</span></div>;
const FieldErr = ({ m }: { m?: string }) => (m ? <p className="text-xs text-destructive mt-1">{m}</p> : null);

