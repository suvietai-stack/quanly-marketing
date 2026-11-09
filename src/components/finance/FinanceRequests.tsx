import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, FileText, Paperclip, Trash2, ArrowUp, ArrowDown, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { frApi, type FrRequest, type FrStep, type FrPaymentType, type FrSettleOption } from "@/lib/financeRequests/api";
import {
  FR_KIND_LABEL, FR_STATUS_LABEL, FR_STATUS_VARIANT, FR_QUICK_FILTERS, quickFilterStatuses,
  vnd, parseAmount, fmtAmountInput, frEditable, frCancellable, frRemainingToPay,
  frAdvanceRemaining, frSalaryRemaining, frValidate, type FrKind, type FrStatus,
  emptyLine, isBlankLine, linesTotal, validateLines, type FrLine,
} from "@/lib/financeRequests/logic";
import { ExpenseLinesEditor, ExpenseLinesView } from "@/components/finance/ExpenseLines";

const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));
const fmtDate = (s: string | null | undefined) => (s ? new Date(s).toLocaleDateString("vi-VN") : "—");
const fmtDateTime = (s: string | null | undefined) => (s ? new Date(s).toLocaleString("vi-VN") : "—");

const SETTLE_TYPE = "Quyết toán/hoàn ứng tạm ứng";

const chip = (on: boolean) =>
  `shrink-0 h-9 px-3 rounded-full border text-sm whitespace-nowrap transition-colors ${on ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-accent"}`;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}

export function FinanceRequests({ kind }: { kind: FrKind }) {
  const qc = useQueryClient();
  const { user, can, isSuperAdmin } = useCurrentUser();
  const uid = user?.id ?? "";
  const scopePerm = `fr.${kind === "salary_advance" ? "salary" : kind}.view_scope` as const;
  const payPerm = `fr.${kind === "salary_advance" ? "salary" : kind}.pay` as const;
  const reportPerm = `fr.${kind === "salary_advance" ? "salary" : kind}.report` as const;
  const settingsPerm = `fr.${kind === "salary_advance" ? "salary" : kind}.settings` as const;
  const deductPerm = "fr.salary.deduct" as const;
  const canScope = can(scopePerm as any);
  const canPay = can(payPerm as any);
  const canReport = can(reportPerm as any);
  const canSettings = can(settingsPerm as any);
  const canDeduct = kind === "salary_advance" && can(deductPerm as any);

  const [tab, setTab] = useState<"mine" | "todo" | "all" | "report" | "settings">("mine");
  const [filter, setFilter] = useState("");
  const [q, setQ] = useState("");
  const [qText, setQText] = useState("");
  useEffect(() => { const h = setTimeout(() => setQ(qText), 350); return () => clearTimeout(h); }, [qText]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<FrRequest | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const invalidate = () => qc.invalidateQueries({ predicate: (qr) => String(qr.queryKey[0]) === "fr" });

  const statuses = quickFilterStatuses(filter);
  const mine = useQuery({
    queryKey: ["fr", kind, "mine", uid, filter, q],
    queryFn: () => frApi.list(kind, { mine: true, uid, statuses, q: q || undefined }),
    enabled: !!uid && tab === "mine",
  });
  const all = useQuery({
    queryKey: ["fr", kind, "all", filter, q],
    queryFn: () => frApi.list(kind, { statuses, q: q || undefined }),
    enabled: tab === "all" && canScope,
  });
  // Chờ tôi xử lý: các bước đang chờ mà tôi là người duyệt (trực tiếp hoặc theo quyền).
  const pendingSteps = useQuery({
    queryKey: ["fr", kind, "todo", uid],
    queryFn: () => frApi.pendingSteps(),
    enabled: tab === "todo" && !!uid,
  });
  const todoIds = useMemo(() => {
    const steps = (pendingSteps.data ?? []).filter((s) => s.approver_id === uid || (s.perm && can(s.perm as any)));
    return steps.map((s) => s.request_id);
  }, [pendingSteps.data, uid]);
  const todo = useQuery({
    queryKey: ["fr", kind, "todo-reqs", todoIds.join(",")],
    queryFn: async () => {
      if (!todoIds.length) return [] as FrRequest[];
      const reqs = await Promise.all(todoIds.map((id) => frApi.detail(id)));
      return reqs.filter((r): r is FrRequest => !!r && r.kind === kind && r.status === "pending");
    },
    enabled: tab === "todo" && todoIds.length >= 0 && pendingSteps.isSuccess,
  });

  const rows = tab === "mine" ? mine.data ?? [] : tab === "all" ? all.data ?? [] : tab === "todo" ? todo.data ?? [] : [];
  const loading = (tab === "mine" && mine.isLoading) || (tab === "all" && all.isLoading) || (tab === "todo" && (pendingSteps.isLoading || todo.isLoading));

  return (
    <div className="space-y-4 pb-24">
      <PageHeader title={FR_KIND_LABEL[kind]} />
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => { setEditing(null); setCreateOpen(true); }}><Plus className="h-4 w-4 mr-1" />Tạo đề nghị</Button>
        <div className="flex gap-1 overflow-x-auto">
          <button className={chip(tab === "mine")} onClick={() => setTab("mine")}>Đề nghị của tôi</button>
          <button className={chip(tab === "todo")} onClick={() => setTab("todo")}>Chờ tôi xử lý</button>
          {canScope && <button className={chip(tab === "all")} onClick={() => setTab("all")}>Tất cả</button>}
          {canReport && <button className={chip(tab === "report")} onClick={() => setTab("report")}>Báo cáo</button>}
          {canSettings && <button className={chip(tab === "settings")} onClick={() => setTab("settings")}>Cài đặt</button>}
        </div>
      </div>

      {(tab === "mine" || tab === "all" || tab === "todo") && (
        <>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Tìm theo mã, nội dung…" value={qText} onChange={(e) => setQText(e.target.value)} />
            </div>
          </div>
          {tab !== "todo" && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {FR_QUICK_FILTERS.map((f) => (
                <button key={f.key} className={chip(filter === f.key)} onClick={() => setFilter(f.key)}>{f.label}</button>
              ))}
            </div>
          )}
          {loading && <p className="text-sm text-muted-foreground">Đang tải…</p>}
          {!loading && rows.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">Chưa có đề nghị nào.</p>}
          <div className="grid gap-2">
            {rows.map((r) => <RequestCard key={r.id} r={r} uid={uid} onOpen={() => setDetailId(r.id)} />)}
          </div>
        </>
      )}

      {tab === "report" && canReport && <ReportTab kind={kind} />}
      {tab === "settings" && canSettings && <SettingsTab kind={kind} onSaved={invalidate} />}

      <RequestForm
        kind={kind}
        open={createOpen}
        editing={editing}
        onClose={() => { setCreateOpen(false); setEditing(null); }}
        onSaved={() => { setCreateOpen(false); setEditing(null); invalidate(); }}
      />
      {detailId && (
        <RequestDetail
          id={detailId}
          kind={kind}
          uid={uid}
          canPay={canPay}
          canDeduct={canDeduct}
          isSuperAdmin={isSuperAdmin}
          onClose={() => setDetailId(null)}
          onChanged={() => invalidate()}
          onEdit={(r) => { setDetailId(null); setEditing(r); setCreateOpen(true); }}
          canDecidePerm={(perm) => can(perm as any)}
        />
      )}
    </div>
  );
}

function RequestCard({ r, uid, onOpen }: { r: FrRequest; uid: string; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="text-left rounded-lg border bg-card p-3 space-y-1.5 hover:bg-accent/50 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-sm font-semibold">{r.code}</span>
        <Badge variant={FR_STATUS_VARIANT[r.status]}>{FR_STATUS_LABEL[r.status]}</Badge>
      </div>
      <div className="font-medium line-clamp-2">{r.title}</div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{vnd(r.amount)}</span>
        <span>{fmtDate(r.created_at)}</span>
        {r.requester_id !== uid && <span>Người đề nghị khác</span>}
        {r.paid_amount > 0 && r.paid_amount < r.amount && <span>Đã chi {vnd(r.paid_amount)}</span>}
      </div>
    </button>
  );
}

// ============ Form tạo/sửa ============

function RequestForm({ kind, open, editing, onClose, onSaved }: {
  kind: FrKind; open: boolean; editing: FrRequest | null; onClose: () => void; onSaved: () => void;
}) {
  const { user } = useCurrentUser();
  const uid = user?.id ?? "";
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [desiredDate, setDesiredDate] = useState("");
  const [payeeName, setPayeeName] = useState("");
  const [payeeInfo, setPayeeInfo] = useState("");
  const [note, setNote] = useState("");
  const [typeId, setTypeId] = useState("");
  const [advanceId, setAdvanceId] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [supplierTax, setSupplierTax] = useState("");
  const [supplierBank, setSupplierBank] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [salaryPeriod, setSalaryPeriod] = useState("");
  const [attachments, setAttachments] = useState<{ name: string; path?: string; url?: string }[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [lines, setLines] = useState<FrLine[]>([]);
  const [linkUrl, setLinkUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const requestKey = useRef(crypto.randomUUID());

  const types = useQuery({ queryKey: ["fr", "types"], queryFn: frApi.paymentTypes, enabled: open && kind === "payment" });
  const settleOpts = useQuery({ queryKey: ["fr", "settle-opts"], queryFn: frApi.settleOptions, enabled: open && kind === "payment" });
  const catalog = useQuery({ queryKey: ["fr", "line-catalog"], queryFn: frApi.lineCatalog, enabled: open && kind === "payment" });
  const selectedType = (types.data ?? []).find((t) => t.id === typeId);
  const isSettle = selectedType?.name === SETTLE_TYPE;
  const isSupplier = selectedType?.name === "Thanh toán nhà cung cấp/đối tác";

  useEffect(() => {
    if (!open) return;
    requestKey.current = crypto.randomUUID();
    setFiles([]);
    if (editing) {
      setAmount(fmtAmountInput(String(editing.amount)));
      setTitle(editing.title); setDetail(editing.detail ?? ""); setDesiredDate(editing.desired_date ?? "");
      setPayeeName(editing.payee_name ?? ""); setPayeeInfo(editing.payee_info ?? ""); setNote(editing.note ?? "");
      setTypeId(editing.payment_type_id ?? ""); setAdvanceId(editing.advance_id ?? "");
      setSupplierName(editing.supplier_name ?? ""); setSupplierTax(editing.supplier_tax ?? "");
      setSupplierBank(editing.supplier_bank ?? ""); setInvoiceNo(editing.invoice_no ?? "");
      setSalaryPeriod(editing.salary_period ?? "");
      setAttachments((editing.attachments as any[])?.filter((a) => a?.path || a?.url) ?? []);
      setLines([]);
    } else {
      setAmount(""); setTitle(""); setDetail(""); setDesiredDate(""); setPayeeName(""); setPayeeInfo("");
      setNote(""); setTypeId(""); setAdvanceId(""); setSupplierName(""); setSupplierTax(""); setSupplierBank("");
      setInvoiceNo(""); setSalaryPeriod(""); setAttachments([]);
      setLines(kind === "payment" ? [emptyLine()] : []);
    }
    setLinkUrl("");
  }, [open, editing]);

  // Nạp bảng kê khi sửa đề nghị thanh toán đã có dòng khoản chi.
  useEffect(() => {
    if (!(open && kind === "payment" && editing)) return;
    frApi.lines(editing.id)
      .then((ls) => setLines(ls.length
        ? ls.map((l) => ({ id: l.id, name: l.name, catalog_id: l.catalog_id, unit: l.unit ?? "", qty: Number(l.qty), unit_price: Number(l.unit_price) }))
        : [emptyLine()]))
      .catch(() => {});
  }, [open, editing, kind]);

  const effectiveAmount = kind === "payment" ? linesTotal(lines) : parseAmount(amount);

  const payload = () => ({
    amount: effectiveAmount, title, detail, desired_date: desiredDate || null,
    payee_name: payeeName, payee_info: payeeInfo, note,
    payment_type_id: typeId || null, advance_id: isSettle ? advanceId || null : null,
    supplier_name: supplierName, supplier_tax: supplierTax, supplier_bank: supplierBank,
    invoice_no: invoiceNo, salary_period: salaryPeriod, attachments,
    // Backend tự tính lại thành tiền/tổng tiền từ bảng kê, không tin số client gửi.
    ...(kind === "payment" ? { lines: lines.filter((l) => !isBlankLine(l)).map((l) => ({
      name: l.name, catalog_id: l.catalog_id ?? null, unit: l.unit, qty: l.qty, unit_price: l.unit_price,
    })) } : {}),
  });

  const save = async (submitAfter: boolean) => {
    if (kind === "payment") {
      const lineErr = validateLines(lines);
      if (lineErr) return toast.error(lineErr);
    }
    const err = frValidate(kind, {
      amount: effectiveAmount, title, paymentTypeId: typeId, payeeName,
      advanceId, salaryPeriod, settleTypeName: selectedType?.name,
    });
    if (err) return toast.error(err);
    setBusy(true);
    try {
      const id = await frApi.save(editing?.id ?? null, kind, payload(), requestKey.current);
      // Tải chứng từ sau khi có mã đề nghị.
      if (files.length) {
        const uploaded = [...attachments];
        for (const f of files) {
          const path = `${uid}/${id}/${Date.now()}_${f.name}`;
          const { error } = await supabase.storage.from("fr-attachments").upload(path, f);
          if (error) throw new Error(`Tải tệp ${f.name} thất bại: ${error.message}`);
          uploaded.push({ name: f.name, path });
        }
        await frApi.save(id, kind, { ...payload(), attachments: uploaded }, requestKey.current);
        setAttachments(uploaded);
        setFiles([]);
      }
      if (submitAfter) {
        const result = await frApi.submit(id);
        if (result === "needs_config") toast.warning("Đề nghị đã gửi nhưng chưa có quy trình duyệt. Người quản trị cần cấu hình trong mục Cài đặt.");
        else toast.success("Đã gửi đề nghị");
      } else {
        toast.success("Đã lưu nháp");
      }
      onSaved();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={`${kind === "payment" ? "sm:max-w-3xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto`}>
        <DialogHeader><DialogTitle>{editing ? `Sửa ${FR_KIND_LABEL[kind]}` : `Tạo ${FR_KIND_LABEL[kind]}`}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {kind !== "payment" && (
            <Field label={kind === "salary_advance" ? "Số tiền muốn tạm ứng *" : "Số tiền đề nghị *"}>
              <Input inputMode="numeric" value={amount} onChange={(e) => setAmount(fmtAmountInput(e.target.value))} placeholder="VD: 5.000.000" />
            </Field>
          )}
          <Field label={kind === "advance" ? "Mục đích tạm ứng *" : kind === "salary_advance" ? "Lý do *" : "Nội dung thanh toán *"}>
            <Input maxLength={300} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={kind === "advance" ? "VD: Tạm ứng mua vật tư" : ""} />
          </Field>
          {kind === "advance" && (
            <Field label="Nội dung chi tiết">
              <Textarea rows={3} maxLength={3000} value={detail} onChange={(e) => setDetail(e.target.value)} />
            </Field>
          )}
          {kind === "payment" && (
            <>
              <Field label="Loại thanh toán *">
                <select className="h-11 w-full rounded-md border bg-background px-3 text-sm" value={typeId} onChange={(e) => setTypeId(e.target.value)}>
                  <option value="">— Chọn loại —</option>
                  {(types.data ?? []).filter((t) => t.active).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </Field>
              {isSettle && (
                <Field label="Khoản tạm ứng cần quyết toán *">
                  <select className="h-11 w-full rounded-md border bg-background px-3 text-sm" value={advanceId} onChange={(e) => setAdvanceId(e.target.value)}>
                    <option value="">— Chọn khoản tạm ứng —</option>
                    {(settleOpts.data ?? []).map((o: FrSettleOption) => (
                      <option key={o.id} value={o.id}>{o.code} — {o.title} (còn {vnd(o.remaining)})</option>
                    ))}
                  </select>
                </Field>
              )}
              <Field label="Đối tượng nhận tiền *">
                <Input maxLength={200} value={payeeName} onChange={(e) => setPayeeName(e.target.value)} />
              </Field>
              {isSupplier && (
                <>
                  <Field label="Tên đơn vị nhà cung cấp"><Input maxLength={200} value={supplierName} onChange={(e) => setSupplierName(e.target.value)} /></Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Mã số thuế"><Input maxLength={50} value={supplierTax} onChange={(e) => setSupplierTax(e.target.value)} /></Field>
                    <Field label="Số hóa đơn/chứng từ"><Input maxLength={100} value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} /></Field>
                  </div>
                  <Field label="Thông tin ngân hàng"><Input maxLength={300} value={supplierBank} onChange={(e) => setSupplierBank(e.target.value)} placeholder="Ngân hàng — STK — Chủ TK" /></Field>
                </>
              )}
            </>
          )}
          {kind === "advance" && (
            <>
              <Field label="Người/đơn vị nhận tiền (nếu khác người đề nghị)">
                <Input maxLength={200} value={payeeName} onChange={(e) => setPayeeName(e.target.value)} />
              </Field>
              <Field label="Thông tin nhận tiền (nếu cần)">
                <Input maxLength={300} value={payeeInfo} onChange={(e) => setPayeeInfo(e.target.value)} placeholder="Ngân hàng — STK — Chủ TK" />
              </Field>
            </>
          )}
          {kind === "payment" && (
            <Field label="Thông tin tài khoản nhận tiền (nếu cần)">
              <Input maxLength={300} value={payeeInfo} onChange={(e) => setPayeeInfo(e.target.value)} placeholder="Ngân hàng — STK — Chủ TK" />
            </Field>
          )}
          {kind === "payment" && (
            <Field label="Bảng kê khoản chi *">
              <ExpenseLinesEditor lines={lines} onChange={setLines} catalog={catalog.data ?? []} />
            </Field>
          )}
          {kind === "salary_advance" && (
            <Field label="Kỳ lương dự kiến khấu trừ *">
              <Input type="month" value={salaryPeriod} onChange={(e) => setSalaryPeriod(e.target.value)} />
            </Field>
          )}
          <Field label={kind === "payment" ? "Ngày đề nghị thanh toán" : "Ngày mong muốn nhận tiền"}>
            <Input type="date" value={desiredDate} onChange={(e) => setDesiredDate(e.target.value)} />
          </Field>
          <Field label="Chứng từ & tài liệu đính kèm">
            <div className="space-y-2">
              <Input type="file" multiple accept="image/*,application/pdf" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
              {files.map((f, i) => <div key={i} className="text-sm text-muted-foreground flex items-center gap-1"><Paperclip className="h-3 w-3" />{f.name} (chưa tải lên)</div>)}
              {attachments.map((a, i) => (
                <div key={a.path ?? a.url ?? i} className="text-sm flex items-center gap-2">
                  <Paperclip className="h-3 w-3 shrink-0" />
                  <span className="flex-1 truncate">{a.name}{a.url ? " (liên kết)" : ""}</span>
                  <Button type="button" size="sm" variant="ghost" aria-label={`Xóa đính kèm ${a.name}`} onClick={() => setAttachments(attachments.filter((_, j) => j !== i))}><X className="h-3 w-3" /></Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input placeholder="Dán liên kết tài liệu (Google Drive…)" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
                <Button type="button" variant="outline" className="shrink-0" onClick={() => {
                  const u = linkUrl.trim();
                  if (!u) return;
                  if (!/^https?:\/\//i.test(u)) return toast.error("Liên kết phải bắt đầu bằng http:// hoặc https://");
                  setAttachments([...attachments, { name: u.replace(/^https?:\/\//i, "").slice(0, 80), url: u }]);
                  setLinkUrl("");
                }}>Thêm liên kết</Button>
              </div>
            </div>
          </Field>
          <Field label="Ghi chú">
            <Textarea rows={2} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" disabled={busy} onClick={() => save(false)}>Lưu nháp</Button>
            <Button className="flex-1" disabled={busy} onClick={() => save(true)}>{busy ? "Đang lưu…" : "Gửi đề nghị"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============ Chi tiết + hành động ============

function RequestDetail({ id, kind, uid, canPay, canDeduct, isSuperAdmin, onClose, onChanged, onEdit, canDecidePerm }: {
  id: string; kind: FrKind; uid: string; canPay: boolean; canDeduct: boolean; isSuperAdmin: boolean;
  onClose: () => void; onChanged: () => void; onEdit: (r: FrRequest) => void; canDecidePerm: (perm: string) => boolean;
}) {
  const detail = useQuery({ queryKey: ["fr", "detail", id], queryFn: () => frApi.detail(id) });
  const steps = useQuery({ queryKey: ["fr", "steps", id], queryFn: () => frApi.steps(id) });
  const events = useQuery({ queryKey: ["fr", "events", id], queryFn: () => frApi.events(id) });
  const reqLines = useQuery({ queryKey: ["fr", "lines", id], queryFn: () => frApi.lines(id), enabled: kind === "payment" });
  const [comment, setComment] = useState("");
  const [payOpen, setPayOpen] = useState(false);
  const [deductOpen, setDeductOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const r = detail.data;

  const act = async (fn: () => Promise<unknown>, ok: string) => {
    if (busy) return;
    setBusy(true);
    try { await fn(); toast.success(ok); await Promise.all([detail.refetch(), steps.refetch(), events.refetch()]); onChanged(); }
    catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  if (!r) return <Sheet open onOpenChange={(o) => !o && onClose()}><SheetContent className="w-full sm:max-w-xl overflow-y-auto"><p className="p-4 text-sm text-muted-foreground">Đang tải…</p></SheetContent></Sheet>;

  const isOwner = r.requester_id === uid;
  const currentStep = (steps.data ?? []).find((s) => s.step_no === r.current_step);
  const canDecide = r.status === "pending" && !!currentStep &&
    (currentStep.approver_id === uid || (currentStep.perm ? canDecidePerm(currentStep.perm) : false)) &&
    (isOwner ? false : true);
  const showPay = canPay && (r.status === "awaiting_payment" || (r.status === "paid" && r.paid_amount < r.amount));
  const showDeduct = canDeduct && r.status === "paid" && r.deducted_amount < r.paid_amount;

  const openAttachment = async (a: { path?: string; url?: string }) => {
    if (a.url) return window.open(a.url, "_blank", "noopener");
    if (!a.path) return;
    const { data, error } = await supabase.storage.from("fr-attachments").createSignedUrl(a.path, 120);
    if (error || !data?.signedUrl) return toast.error("Không mở được tệp đính kèm");
    window.open(data.signedUrl, "_blank", "noopener");
  };

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className="font-mono">{r.code}</span>
            <Badge variant={FR_STATUS_VARIANT[r.status]}>{FR_STATUS_LABEL[r.status]}</Badge>
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-lg border p-3 space-y-2">
            <div className="text-2xl font-bold">{vnd(r.amount)}</div>
            <div className="font-medium">{r.title}</div>
            {r.detail && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{r.detail}</p>}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <span className="text-muted-foreground">Ngày tạo</span><span>{fmtDateTime(r.created_at)}</span>
              {r.desired_date && <><span className="text-muted-foreground">Ngày mong muốn</span><span>{fmtDate(r.desired_date)}</span></>}
              {r.payee_name && <><span className="text-muted-foreground">Người nhận tiền</span><span>{r.payee_name}</span></>}
              {r.payee_info && <><span className="text-muted-foreground">Thông tin nhận</span><span>{r.payee_info}</span></>}
              {r.supplier_name && <><span className="text-muted-foreground">Nhà cung cấp</span><span>{r.supplier_name}</span></>}
              {r.supplier_tax && <><span className="text-muted-foreground">Mã số thuế</span><span>{r.supplier_tax}</span></>}
              {r.invoice_no && <><span className="text-muted-foreground">Số HĐ/chứng từ</span><span>{r.invoice_no}</span></>}
              {r.salary_period && <><span className="text-muted-foreground">Kỳ lương khấu trừ</span><span>{r.salary_period}</span></>}
            </div>
            {(r.attachments as any[])?.length > 0 && (
              <div className="space-y-1 pt-1">
                {(r.attachments as any[]).filter((a) => a?.path || a?.url).map((a, i) => (
                  <button key={a.path ?? a.url ?? i} onClick={() => openAttachment(a)} className="flex items-center gap-1 text-sm text-primary hover:underline">
                    <Paperclip className="h-3 w-3" />{a.name}{a.url ? " (liên kết)" : ""}
                  </button>
                ))}
              </div>
            )}
            {r.note && <p className="text-sm text-muted-foreground">Ghi chú: {r.note}</p>}
          </div>

          {kind === "payment" && (reqLines.data ?? []).length > 0 && <ExpenseLinesView lines={reqLines.data!} />}

          {(r.paid_amount > 0 || r.status === "awaiting_payment") && (
            <div className="rounded-lg border p-3 space-y-1 text-sm">
              <div className="font-semibold">Tình trạng chi tiền</div>
              <div>Đã chi: <b>{vnd(r.paid_amount)}</b> / {vnd(r.amount)}{r.paid_amount < r.amount && r.paid_amount > 0 ? ` (còn ${vnd(frRemainingToPay(r))})` : ""}</div>
              {r.paid_at && <div className="text-muted-foreground">Lần chi gần nhất: {fmtDateTime(r.paid_at)}{r.pay_method ? ` — ${r.pay_method}` : ""}{r.pay_ref ? ` — Mã tham chiếu: ${r.pay_ref}` : ""}</div>}
              {r.kind === "advance" && <div>Đã quyết toán: <b>{vnd(r.settled_amount)}</b> — còn {vnd(frAdvanceRemaining(r))}</div>}
              {r.kind === "salary_advance" && <div>Đã khấu trừ/hoàn trả: <b>{vnd(r.deducted_amount)}</b> — còn {vnd(frSalaryRemaining(r))}</div>}
            </div>
          )}

          {(steps.data ?? []).length > 0 && (
            <div className="space-y-2">
              <div className="font-semibold text-sm">Quy trình phê duyệt</div>
              {(steps.data ?? []).map((s) => (
                <div key={s.id} className="flex items-start gap-2 text-sm rounded-md border p-2">
                  <Badge variant={s.status === "approved" ? "default" : s.status === "rejected" ? "destructive" : s.status === "info_requested" ? "secondary" : "outline"}>
                    {s.step_no}
                  </Badge>
                  <div className="flex-1">
                    <div>{s.label} {s.step_no === r.current_step && r.status === "pending" && <span className="text-primary">(đang chờ)</span>}</div>
                    {s.comment && <div className="text-muted-foreground">“{s.comment}”</div>}
                    {s.decided_at && <div className="text-xs text-muted-foreground">{fmtDateTime(s.decided_at)}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Hành động */}
          <div className="space-y-3">
            {isOwner && frEditable(r.status) && (
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => onEdit(r)}>Sửa</Button>
                <Button className="flex-1" disabled={busy} onClick={() => act(async () => {
                  const res = await frApi.submit(r.id);
                  if (res === "needs_config") toast.warning("Chưa có quy trình duyệt — đề nghị chuyển sang Chờ cấu hình.");
                }, "Đã gửi đề nghị")}>Gửi duyệt</Button>
              </div>
            )}
            {isOwner && frCancellable(r.status) && (
              <Button variant="outline" className="w-full" disabled={busy} onClick={() => act(() => frApi.cancel(r.id), "Đã hủy đề nghị")}>Hủy đề nghị</Button>
            )}
            {canDecide && (
              <div className="rounded-lg border p-3 space-y-2">
                <div className="font-semibold text-sm">Xử lý phê duyệt</div>
                <Textarea rows={2} maxLength={1000} placeholder="Ý kiến / lý do (bắt buộc khi từ chối hoặc yêu cầu bổ sung)" value={comment} onChange={(e) => setComment(e.target.value)} />
                <div className="grid grid-cols-3 gap-2">
                  <Button disabled={busy} onClick={() => act(() => frApi.decide(r.id, "approve", comment), "Đã phê duyệt")}>Phê duyệt</Button>
                  <Button variant="secondary" disabled={busy} onClick={() => act(() => frApi.decide(r.id, "info", comment), "Đã yêu cầu bổ sung")}>Yêu cầu bổ sung</Button>
                  <Button variant="destructive" disabled={busy} onClick={() => act(() => frApi.decide(r.id, "reject", comment), "Đã từ chối")}>Từ chối</Button>
                </div>
              </div>
            )}
            {showPay && <Button className="w-full" onClick={() => setPayOpen(true)}>Xác nhận chi tiền</Button>}
            {showDeduct && <Button className="w-full" onClick={() => setDeductOpen(true)}>Xác nhận khấu trừ/hoàn trả</Button>}
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-sm">Lịch sử</div>
            {(events.data ?? []).map((e) => (
              <div key={e.id} className="text-sm flex gap-2">
                <span className="text-muted-foreground shrink-0">{fmtDateTime(e.created_at)}</span>
                <span>{FR_EVENT_LABEL[e.action] ?? e.action}{e.payload?.comment ? ` — “${e.payload.comment}”` : ""}{e.action === "pay" ? ` — ${vnd(e.payload?.amount)}` : ""}{e.action === "deduct" ? ` — ${vnd(e.payload?.amount)}` : ""}</span>
              </div>
            ))}
          </div>
        </div>

        <PayDialog open={payOpen} onClose={() => setPayOpen(false)} remaining={frRemainingToPay(r)}
          onConfirm={(amount, method, ref, note) => act(() => frApi.pay(r.id, amount, method, ref, note), "Đã xác nhận chi tiền")} />
        <DeductDialog open={deductOpen} onClose={() => setDeductOpen(false)} remaining={frSalaryRemaining(r)}
          onConfirm={(amount, note) => act(() => frApi.deduct(r.id, amount, note), "Đã xác nhận khấu trừ")} />
      </SheetContent>
    </Sheet>
  );
}

const FR_EVENT_LABEL: Record<string, string> = {
  create: "Tạo đề nghị", update: "Cập nhật", submit: "Gửi duyệt", needs_config: "Chờ cấu hình quy trình",
  approve_step: "Duyệt bước", approved: "Phê duyệt xong", reject: "Từ chối", info: "Yêu cầu bổ sung",
  cancel: "Hủy đề nghị", pay: "Xác nhận chi", settle: "Quyết toán tạm ứng", deduct: "Khấu trừ/hoàn trả",
};

function PayDialog({ open, onClose, remaining, onConfirm }: {
  open: boolean; onClose: () => void; remaining: number;
  onConfirm: (amount: number, method: string, ref: string, note: string) => void;
}) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Chuyển khoản");
  const [ref, setRef] = useState("");
  const [note, setNote] = useState("");
  useEffect(() => { if (open) { setAmount(fmtAmountInput(String(remaining))); setRef(""); setNote(""); } }, [open, remaining]);
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Xác nhận chi tiền</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Field label={`Số tiền thực chi (còn phải chi: ${vnd(remaining)}) *`}>
            <Input inputMode="numeric" value={amount} onChange={(e) => setAmount(fmtAmountInput(e.target.value))} />
          </Field>
          <Field label="Hình thức chi">
            <select className="h-11 w-full rounded-md border bg-background px-3 text-sm" value={method} onChange={(e) => setMethod(e.target.value)}>
              <option>Chuyển khoản</option><option>Tiền mặt</option><option>Khác</option>
            </select>
          </Field>
          <Field label="Mã tham chiếu / số chứng từ"><Input maxLength={100} value={ref} onChange={(e) => setRef(e.target.value)} /></Field>
          <Field label="Ghi chú"><Textarea rows={2} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
          <Button className="w-full" onClick={() => {
            const a = parseAmount(amount);
            if (!a || a <= 0) return toast.error("Số tiền chi phải lớn hơn 0");
            if (a > remaining) return toast.error("Số tiền chi vượt số còn phải chi");
            onConfirm(a, method, ref, note); onClose();
          }}>Xác nhận</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DeductDialog({ open, onClose, remaining, onConfirm }: {
  open: boolean; onClose: () => void; remaining: number; onConfirm: (amount: number, note: string) => void;
}) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  useEffect(() => { if (open) { setAmount(fmtAmountInput(String(remaining))); setNote(""); } }, [open, remaining]);
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Xác nhận khấu trừ/hoàn trả</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Field label={`Số tiền khấu trừ lần này (còn lại: ${vnd(remaining)}) *`}>
            <Input inputMode="numeric" value={amount} onChange={(e) => setAmount(fmtAmountInput(e.target.value))} />
          </Field>
          <Field label="Ghi chú"><Textarea rows={2} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
          <Button className="w-full" onClick={() => {
            const a = parseAmount(amount);
            if (!a || a <= 0) return toast.error("Số tiền phải lớn hơn 0");
            if (a > remaining) return toast.error("Vượt số dư chưa tất toán");
            onConfirm(a, note); onClose();
          }}>Xác nhận</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============ Báo cáo ============

function ReportTab({ kind }: { kind: FrKind }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const report = useQuery({
    queryKey: ["fr", kind, "report", from, to],
    queryFn: () => frApi.report(kind, from || null, to || null),
  });
  const d = report.data;
  const requesterIds = useMemo(() => (d?.by_requester ?? []).map((r: any) => r.requester_id), [d]);
  const names = useQuery({
    queryKey: ["fr", "names", requesterIds.join(",")],
    queryFn: () => frApi.profiles(requesterIds),
    enabled: requesterIds.length > 0,
  });
  const nameOf = (id: string) => (names.data ?? []).find((p) => p.id === id)?.full_name ?? "—";

  if (report.isLoading) return <p className="text-sm text-muted-foreground">Đang tải báo cáo…</p>;
  if (!d) return null;
  const cards: { label: string; value: string }[] = [
    { label: "Tổng số đề nghị", value: String(d.total) },
    { label: "Tổng tiền đề nghị", value: vnd(d.amount) },
    { label: "Tổng đã duyệt", value: vnd(d.approved_amount) },
    { label: "Tổng đã chi", value: vnd(d.paid_amount) },
    { label: "Đang chờ duyệt", value: String(d.pending_count) },
    { label: "Đang chờ chi", value: String(d.awaiting_pay_count) },
  ];
  if (kind === "advance") {
    cards.push({ label: "Chưa hoàn ứng", value: vnd(d.paid_amount - d.settled_amount) });
    cards.push({ label: "Chưa quyết toán", value: String(d.open_settle_count) });
  }
  if (kind === "payment") cards.push({ label: "Còn phải trả", value: vnd(d.approved_amount - d.paid_amount) });
  if (kind === "salary_advance") {
    cards.push({ label: "Đã khấu trừ/hoàn trả", value: vnd(d.deducted_amount) });
    cards.push({ label: "Chưa tất toán", value: vnd(d.paid_amount - d.deducted_amount) });
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end">
        <Field label="Từ ngày"><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
        <Field label="Đến ngày"><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border bg-card p-3">
            <div className="text-xs text-muted-foreground">{c.label}</div>
            <div className="text-lg font-bold">{c.value}</div>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border p-3 space-y-1">
          <div className="font-semibold text-sm">Theo trạng thái</div>
          {Object.entries(d.by_status as Record<string, number>).map(([st, c]) => (
            <div key={st} className="flex justify-between text-sm">
              <span>{FR_STATUS_LABEL[st as FrStatus] ?? st}</span><b>{c}</b>
            </div>
          ))}
          {Object.keys(d.by_status).length === 0 && <p className="text-sm text-muted-foreground">Chưa có dữ liệu.</p>}
        </div>
        <div className="rounded-lg border p-3 space-y-1">
          <div className="font-semibold text-sm">Theo nhân viên</div>
          {(d.by_requester as any[]).map((r) => (
            <div key={r.requester_id} className="flex justify-between text-sm gap-2">
              <span className="truncate">{nameOf(r.requester_id)}</span>
              <span className="shrink-0"><b>{r.count}</b> đề nghị — {vnd(r.amount)}</span>
            </div>
          ))}
          {(d.by_requester as any[]).length === 0 && <p className="text-sm text-muted-foreground">Chưa có dữ liệu.</p>}
        </div>
      </div>
      {kind === "payment" && Array.isArray(d.by_line) && d.by_line.length > 0 && (
        <div className="rounded-lg border p-3 space-y-1">
          <div className="font-semibold text-sm">Theo khoản chi</div>
          {(d.by_line as any[]).map((l) => (
            <div key={l.name} className="flex justify-between text-sm gap-2">
              <span className="truncate">{l.name}</span>
              <span className="shrink-0"><b>{l.count}</b> khoản — {vnd(l.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ Cài đặt ============

function SettingsTab({ kind, onSaved }: { kind: FrKind; onSaved: () => void }) {
  const settings = useQuery({ queryKey: ["fr", "settings"], queryFn: frApi.settings });
  const cfg = (settings.data ?? []).find((s) => s.kind === kind);
  const permPrefix = kind === "salary_advance" ? "fr.salary" : `fr.${kind}`;
  const [flow, setFlow] = useState<{ label: string; perm: string }[]>([]);
  const [limits, setLimits] = useState<Record<string, any>>({});
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (cfg) {
      setFlow((cfg.flow ?? []).map((s: any) => ({ label: s.label ?? "", perm: s.perm ?? `${permPrefix}.approve` })));
      setLimits(cfg.limits ?? {});
    }
  }, [cfg, permPrefix]);

  const save = async () => {
    setBusy(true);
    try {
      await frApi.saveSettings(kind, flow.map((s, i) => ({ label: s.label || `Cấp duyệt ${i + 1}`, perm: s.perm })), limits);
      toast.success("Đã lưu cài đặt");
      onSaved();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  if (settings.isLoading) return <p className="text-sm text-muted-foreground">Đang tải cài đặt…</p>;
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-semibold">Quy trình phê duyệt</div>
        <p className="text-sm text-muted-foreground">Mỗi cấp duyệt gán cho người giữ một quyền. Đề nghị đi qua từng cấp theo thứ tự.</p>
        {flow.map((s, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-mono w-6">{i + 1}.</span>
            <Input className="flex-1 min-w-32" placeholder="Tên cấp duyệt" value={s.label}
              onChange={(e) => setFlow(flow.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
            <select className="h-10 rounded-md border bg-background px-2 text-sm" value={s.perm}
              onChange={(e) => setFlow(flow.map((x, j) => (j === i ? { ...x, perm: e.target.value } : x)))}>
              <option value={`${permPrefix}.approve`}>Người có quyền Phê duyệt</option>
              <option value={`${permPrefix}.view_scope`}>Người có quyền Xem phạm vi</option>
              <option value={`${permPrefix}.settings`}>Người có quyền Cài đặt</option>
            </select>
            <Button size="icon" variant="ghost" disabled={i === 0} onClick={() => { const f = [...flow]; [f[i - 1], f[i]] = [f[i], f[i - 1]]; setFlow(f); }}><ArrowUp className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" disabled={i === flow.length - 1} onClick={() => { const f = [...flow]; [f[i + 1], f[i]] = [f[i], f[i + 1]]; setFlow(f); }}><ArrowDown className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => setFlow(flow.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setFlow([...flow, { label: "", perm: `${permPrefix}.approve` }])}>
          <Plus className="h-4 w-4 mr-1" />Thêm cấp duyệt
        </Button>
        {flow.length === 0 && <p className="text-sm text-destructive">Chưa có cấp duyệt — đề nghị gửi lên sẽ chuyển sang “Chờ cấu hình duyệt”.</p>}
      </div>

      {kind === "salary_advance" && (
        <div className="rounded-lg border p-4 space-y-3">
          <div className="font-semibold">Giới hạn tạm ứng lương</div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Số tiền tối đa mỗi lần (VNĐ)">
              <Input inputMode="numeric" value={limits.max_amount ? fmtAmountInput(String(limits.max_amount)) : ""}
                onChange={(e) => setLimits({ ...limits, max_amount: parseAmount(e.target.value) || null })} />
            </Field>
            <Field label="Số lượt tối đa mỗi kỳ lương">
              <Input inputMode="numeric" value={limits.max_per_period ?? ""}
                onChange={(e) => setLimits({ ...limits, max_per_period: parseAmount(e.target.value) || null })} />
            </Field>
          </div>
          {([["require_reason", "Bắt buộc nhập lý do"], ["block_open", "Chặn khi còn đề nghị chưa tất toán"], ["allow_self_approve", "Cho phép người tạo tự duyệt (ngoại lệ có kiểm soát)"]] as const).map(([k, label]) => (
            <label key={k} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" className="h-4 w-4" checked={!!limits[k]} onChange={(e) => setLimits({ ...limits, [k]: e.target.checked })} />
              {label}
            </label>
          ))}
        </div>
      )}

      {kind !== "salary_advance" && (
        <div className="rounded-lg border p-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="h-4 w-4" checked={!!limits.allow_self_approve}
              onChange={(e) => setLimits({ ...limits, allow_self_approve: e.target.checked })} />
            Cho phép người tạo tự duyệt (ngoại lệ có kiểm soát)
          </label>
        </div>
      )}

      {kind === "payment" && <PaymentTypesManager />}
      {kind === "payment" && <LineCatalogManager />}

      <Button disabled={busy} onClick={save}>{busy ? "Đang lưu…" : "Lưu cài đặt"}</Button>
    </div>
  );
}

function PaymentTypesManager() {
  const qc = useQueryClient();
  const types = useQuery({ queryKey: ["fr", "types"], queryFn: frApi.paymentTypes });
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const add = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await frApi.savePaymentType(null, name, true, (types.data ?? []).length + 1);
      setName("");
      qc.invalidateQueries({ queryKey: ["fr", "types"] });
      toast.success("Đã thêm loại thanh toán");
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  const toggle = async (t: FrPaymentType) => {
    try {
      await frApi.savePaymentType(t.id, t.name, !t.active, t.sort);
      qc.invalidateQueries({ queryKey: ["fr", "types"] });
    } catch (e) { toast.error(errMsg(e)); }
  };
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="font-semibold">Danh mục loại thanh toán</div>
      {(types.data ?? []).map((t) => (
        <div key={t.id} className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className={`flex-1 ${t.active ? "" : "line-through text-muted-foreground"}`}>{t.name}</span>
          <Button size="sm" variant="outline" onClick={() => toggle(t)}>{t.active ? "Ẩn" : "Hiện"}</Button>
        </div>
      ))}
      <div className="flex gap-2">
        <Input placeholder="Tên loại mới" value={name} onChange={(e) => setName(e.target.value)} />
        <Button variant="outline" disabled={busy} onClick={add}>Thêm</Button>
      </div>
    </div>
  );
}
