import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Facebook, RefreshCw, Link2, Unlink, Settings2, RotateCw, Copy } from "lucide-react";
import { fblOverview, fblConnectUrl, fblPendingPages, fblConnectPages, fblPageAction, fblSaveForm, fblEvents, fblRetry, fblBackfill, fblMaintainNow, fblWebhookDiagnostic } from "@/lib/fbLeads/fb.functions";
import { useVisibleRefresh } from "@/hooks/use-visible-refresh";
import { eventLatency } from "@/lib/fbLeads/latency";
import { FIELDS, validateMapping, suggestMapping, type FieldKey, type FieldRule, type Mapping, type Question } from "@/lib/fbLeads/mapping";

type Overview = Awaited<ReturnType<typeof fblOverview>>;
const STATUS: Record<string, string> = { pending: "Chờ xử lý", success: "Thành công", failed: "Thất bại", skipped: "Bỏ qua", duplicate: "Trùng", needs_action: "Cần xử lý" };
const fmt = (s?: string | null) => (s ? new Date(s).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : "—");
const METHOD: Record<string, string> = { webhook: "Webhook", reconciliation: "Quét bù tự động", backfill: "Đồng bộ bù", legacy_unknown: "Chưa xác định (lịch sử cũ)" };
const duration = (seconds: number | null) => seconds === null ? "—" : `${seconds.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} giây`;

export function FbLeadsSettings() {
  const overview = useServerFn(fblOverview);
  const [ov, setOv] = useState<Overview | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pendingState, setPendingState] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<string | null>(null);
  const load = () => overview().then((r) => { setOv(r); setErr(null); }).catch((e) => setErr(e.message));
  useVisibleRefresh(load, 30000);
  useEffect(() => {
    load();
    const q = new URLSearchParams(window.location.search);
    if (q.get("fbl_state")) setPendingState(q.get("fbl_state"));
    if (q.get("fbl_error")) toast.error(`Kết nối Facebook thất bại: ${q.get("fbl_error")}`);
  }, []);
  if (err) return <Card><CardContent className="p-5 text-sm text-destructive">{err}</CardContent></Card>;
  if (!ov) return <Card><CardContent className="p-5 text-sm text-muted-foreground">Đang tải…</CardContent></Card>;
  const form = ov.forms.find((f: any) => f.form_id === editForm);

  return <div className="space-y-4">
    <StatusCard ov={ov} />
    <Tabs defaultValue="pages">
      <TabsList><TabsTrigger value="pages">Page & Form</TabsTrigger><TabsTrigger value="history">Lịch sử đồng bộ</TabsTrigger></TabsList>
      <TabsContent value="pages" className="mt-3 space-y-4">
        <ConnectButton disabled={!ov.secrets.appSecret} />
        {ov.pages.length === 0 && <p className="text-sm text-muted-foreground">Chưa có Page nào được kết nối.</p>}
        {ov.pages.map((p: any) => <PageCard key={p.page_id} page={p} ov={ov} onChange={load} onEdit={setEditForm} />)}
      </TabsContent>
      <TabsContent value="history" className="mt-3"><History ov={ov} /></TabsContent>
    </Tabs>
    {pendingState && <PickPages state={pendingState} onDone={() => { setPendingState(null); window.history.replaceState(null, "", "/settings?tab=fbleads"); load(); }} />}
    {form && <MappingDialog form={form} ov={ov} onClose={() => setEditForm(null)} onSaved={load} />}
  </div>;
}

function StatusCard({ ov }: { ov: Overview }) {
  const check = useServerFn(fblWebhookDiagnostic);
  const [diagnostic, setDiagnostic] = useState<Awaited<ReturnType<typeof fblWebhookDiagnostic>> | null>(null);
  const [checking, setChecking] = useState(false);
  const copy = (v: string) => { navigator.clipboard.writeText(v); toast.success("Đã sao chép"); };
  const s = ov.stats;
  return <Card><CardContent className="p-5 space-y-3 text-sm">
    <div className="flex items-center gap-2 font-semibold"><Facebook className="h-4 w-4" />Meta App Sứ Việt · ID {ov.appId}</div>
    <div className="flex flex-wrap gap-2">
      <Badge variant={ov.secrets.appSecret ? "secondary" : "destructive"}>App Secret: {ov.secrets.appSecret ? "đã nhập" : "chưa nhập"}</Badge>
      <Badge variant={ov.secrets.verifyToken ? "secondary" : "destructive"}>Verify Token: {ov.secrets.verifyToken ? "đã nhập" : "chưa nhập"}</Badge>
      <Badge variant={ov.state?.webhook_verified_at ? "secondary" : "outline"}>Webhook: {ov.state?.webhook_verified_at ? `đã xác minh ${fmt(ov.state.webhook_verified_at)}` : "chưa xác minh"}</Badge>
      <Badge variant="outline">Webhook POST gần nhất: {fmt(ov.state?.last_webhook_at)}</Badge>
      <Badge variant="outline">Quét dự phòng gần nhất: {fmt(ov.state?.last_maintain_at)}</Badge>
    </div>
    <Button size="sm" variant="outline" disabled={checking} onClick={async () => { setChecking(true); try { setDiagnostic(await check()); } catch (e: any) { toast.error(e.message); } finally { setChecking(false); } }}><RefreshCw className="h-3.5 w-3.5 mr-1" />{checking ? "Đang kiểm tra Meta…" : "Kiểm tra Webhook trên Meta"}</Button>
    {diagnostic && <p className="text-sm break-words" role="status">{diagnostic.message}<span className="block text-xs text-muted-foreground">Kiểm tra: {fmt(diagnostic.checkedAt)}</span></p>}
    {[["Callback URL (Webhook)", ov.webhookUrl], ["OAuth Redirect URI", ov.redirectUri]].map(([l, v]) => (
      <div key={l} className="flex items-center gap-2 flex-wrap"><span className="text-muted-foreground w-44">{l}</span><code className="text-xs bg-muted px-2 py-1 rounded break-all">{v}</code>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copy(v)}><Copy className="h-3.5 w-3.5" /></Button></div>))}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
      {[["Page đang kết nối", ov.pages.filter((p: any) => p.status === "connected").length], ["Form đang bật", ov.forms.filter((f: any) => f.enabled).length],
        ["Lead thành công", s.success ?? 0], ["Lead lỗi cần xử lý", (s.failed ?? 0) + (s.needs_action ?? 0)]].map(([l, v]) => (
        <div key={l as string} className="rounded-md border p-2"><div className="text-xs text-muted-foreground">{l}</div><div className="text-lg font-semibold">{v}</div></div>))}
    </div>
  </CardContent></Card>;
}

function ConnectButton({ disabled }: { disabled: boolean }) {
  const connect = useServerFn(fblConnectUrl);
  const [busy, setBusy] = useState(false);
  return <Button disabled={disabled || busy} onClick={async () => {
    setBusy(true);
    try { const r = await connect(); window.location.href = r.url; } catch (e: any) { toast.error(e.message); setBusy(false); }
  }}><Link2 className="h-4 w-4 mr-1.5" />Kết nối Page Facebook</Button>;
}

function PickPages({ state, onDone }: { state: string; onDone: () => void }) {
  const list = useServerFn(fblPendingPages);
  const connect = useServerFn(fblConnectPages);
  const [discovery, setDiscovery] = useState<Awaited<ReturnType<typeof fblPendingPages>> | null>(null);
  const pages = discovery?.pages;
  const [sel, setSel] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => { list({ data: { state } }).then(setDiscovery).catch((e) => { toast.error(e.message); setDiscovery({ pages: [], diagnostics: [e.message], permissions: [], granular: [] }); }); }, [state]);
  return <Dialog open onOpenChange={(o) => !o && onDone()}><DialogContent>
    <DialogHeader><DialogTitle>Chọn Page muốn kết nối</DialogTitle></DialogHeader>
    {discovery && <div className="space-y-2 text-xs break-words">
      {discovery.diagnostics.map((d, i) => <p key={i} className="text-destructive">{d}</p>)}
      {discovery.permissions.length > 0 && <details><summary className="cursor-pointer">Quyền Meta và phạm vi Page</summary><div className="max-h-36 overflow-auto space-y-1 mt-2">{discovery.permissions.map((p) => <div key={p.permission}>{p.permission}: {p.status}</div>)}{discovery.granular.map((g, i) => <div key={i}>{g.scope}: {g.target_ids?.join(", ") ?? "Meta không trả target_ids; không suy ra toàn bộ Page"}</div>)}</div></details>}
    </div>}
    {!pages ? <p className="text-sm">Đang tải…</p> : pages.length === 0 ? <p className="text-sm text-muted-foreground">Meta không trả về Page nào cho tài khoản này (hoặc phiên đã hết hạn).</p> :
      <div className="space-y-3 max-h-80 overflow-auto">{pages.map((p) => <label key={p.id} className="flex items-start gap-2 text-sm">
        <Checkbox aria-label={`Chọn ${p.name}`} disabled={!p.eligible} checked={sel.includes(p.id)} onCheckedChange={(c) => setSel(c ? [...sel, p.id] : sel.filter((x) => x !== p.id))} />
        <span className="min-w-0 break-words"><span className="block font-medium">{p.name}</span><span className="block text-xs text-muted-foreground">{p.id} · {p.origins.join("; ")}</span><span className={`block text-xs ${p.eligible ? "text-muted-foreground" : "text-destructive"}`}>{p.message}</span></span></label>)}</div>}
    <DialogFooter><Button variant="ghost" onClick={onDone}>Hủy</Button>
      <Button disabled={!sel.length || busy} onClick={async () => {
        setBusy(true);
        try { const r = await connect({ data: { state, pageIds: sel } }); r.forEach((x) => (x.ok ? toast.success : toast.error)(`${x.name}: ${x.message}`)); onDone(); }
        catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
      }}>Kết nối</Button></DialogFooter>
  </DialogContent></Dialog>;
}

function PageCard({ page, ov, onChange, onEdit }: { page: any; ov: Overview; onChange: () => void; onEdit: (id: string) => void }) {
  const act = useServerFn(fblPageAction);
  const save = useServerFn(fblSaveForm);
  const [busy, setBusy] = useState("");
  const run = async (action: "check" | "refresh" | "disconnect" | "source", source?: string | null) => {
    if (action === "disconnect" && !confirm(`Ngắt kết nối Page ${page.name}? Các Form của Page sẽ tắt đồng bộ, lịch sử được giữ.`)) return;
    setBusy(action);
    try { const r = await act({ data: { pageId: page.page_id, action, source } }); (r.ok ? toast.success : toast.error)(r.message); onChange(); }
    catch (e: any) { toast.error(e.message); } finally { setBusy(""); }
  };
  const forms = ov.forms.filter((f: any) => f.page_id === page.page_id);
  const srcOpts = ov.catalogs.sources.includes(page.source) || !page.source ? ov.catalogs.sources : [page.source, ...ov.catalogs.sources];
  return <Card><CardContent className="p-5 space-y-3">
    <div className="flex items-start justify-between gap-2 flex-wrap">
      <div><div className="font-semibold">{page.name}</div><div className="text-xs text-muted-foreground">Page ID {page.page_id} · kiểm tra {fmt(page.checked_at)}</div>
        <div className="mt-1 flex gap-2 flex-wrap"><Badge variant={page.status === "connected" ? "secondary" : "destructive"}>{page.status === "connected" ? "Đã kết nối" : "Lỗi kết nối"}</Badge>
          <Badge variant={page.subscribed ? "secondary" : "outline"}>{page.subscribed ? "Đã đăng ký nhận lead" : "Chưa đăng ký nhận lead"}</Badge></div>
        {page.status_detail && <p className="text-xs text-destructive mt-1">{page.status_detail}</p>}</div>
      <div className="flex gap-1 flex-wrap">
        <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run("check")}><RefreshCw className="h-3.5 w-3.5 mr-1" />Kiểm tra</Button>
        <MaintainButton onDone={onChange} />
        <Button size="sm" variant="outline" disabled={!!busy} onClick={() => run("refresh")}><RotateCw className="h-3.5 w-3.5 mr-1" />Làm mới danh sách Form</Button>
        <Button size="sm" variant="ghost" disabled={!!busy} onClick={() => run("disconnect")}><Unlink className="h-3.5 w-3.5 mr-1" />Ngắt</Button>
      </div>
    </div>
    <div className="flex items-center gap-2 flex-wrap text-sm">
      <span className="text-muted-foreground">Nguồn tín hiệu:</span>
      <Select value={page.source ?? "__none"} onValueChange={(v) => run("source", v === "__none" ? null : v)}>
        <SelectTrigger className="w-64 h-9"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="__none">— Chưa chọn —</SelectItem>{srcOpts.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
      </Select>
      <a href="/settings?tab=sigcat" className="text-xs underline text-muted-foreground">Quản lý Kho nguồn</a>
    </div>
    <div className="divide-y border rounded-md">
      {forms.length === 0 && <p className="p-3 text-sm text-muted-foreground">Chưa có Form — bấm “Làm mới danh sách Form”.</p>}
      {forms.map((f: any) => {
        const errs = validateMapping(f.mapping, f.questions, ov.catalogs, page.source);
        return <div key={f.form_id} className="p-3 flex items-center justify-between gap-2 flex-wrap text-sm">
          <div><div className="font-medium">{f.name}</div>
            <div className="text-xs text-muted-foreground">{f.mapping ? (errs.length ? "Cấu hình chưa hợp lệ" : "Đã cấu hình") : "Chưa cấu hình"} · {f.enabled ? `Đang đồng bộ từ ${fmt(f.enabled_at)}` : "Tắt"}{f.meta_status && f.meta_status !== "ACTIVE" ? ` · Meta: ${f.meta_status === "ARCHIVED_OR_GONE" ? "không còn truy cập" : f.meta_status}` : ""}</div>
            {f.needs_review && <div className="text-xs text-destructive">Form đã thay đổi câu hỏi — cần kiểm tra lại cấu hình</div>}</div>
          <div className="flex items-center gap-2">
            <BackfillButton form={f} />
            <Button size="sm" variant="outline" onClick={() => onEdit(f.form_id)}><Settings2 className="h-3.5 w-3.5 mr-1" />Cấu hình Form</Button>
            <Switch checked={f.enabled} disabled={!f.enabled && errs.length > 0} title={errs.join("; ")} onCheckedChange={async (v) => {
              try { const r = await save({ data: { formId: f.form_id, enabled: v } }); (r.ok ? toast.success : toast.error)(r.message); onChange(); } catch (e: any) { toast.error(e.message); }
            }} />
          </div>
        </div>;
      })}
    </div>
  </CardContent></Card>;
}

function MappingDialog({ form, ov, onClose, onSaved }: { form: any; ov: Overview; onClose: () => void; onSaved: () => void }) {
  const save = useServerFn(fblSaveForm);
  const questions: Question[] = form.questions ?? [];
  const page = ov.pages.find((p: any) => p.page_id === form.page_id);
  const [m, setM] = useState<Mapping>(form.mapping ?? {});
  const errs = useMemo(() => validateMapping(m, questions, ov.catalogs, page?.source ?? null), [m]);
  const set = (k: FieldKey, r: FieldRule) => setM({ ...m, [k]: r });
  return <Dialog open onOpenChange={(o) => !o && onClose()}><DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
    <DialogHeader><DialogTitle>Cấu hình Form — {form.name}</DialogTitle></DialogHeader>
    <p className="text-xs text-muted-foreground">Tự động: Ngày phát hiện (ngày lead, giờ Việt Nam) · Nguồn: <b>{page?.source ?? "chưa chọn"}</b> · Sale phụ trách: chưa phân công.</p>
    <div className="space-y-3">{FIELDS.map((f) => {
      const r: FieldRule = m[f.key] ?? { mode: "empty" };
      const opts = f.catalog ? ov.catalogs[f.catalog] : [];
      const q = r.mode === "facebook" ? questions.find((x) => x.key === r.key) : undefined;
      return <div key={f.key} className="border rounded-md p-3 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm w-44">{f.label}{f.required && " *"}</span>
          <Select value={r.mode} onValueChange={(v) => set(f.key, v === "facebook" ? { mode: "facebook", key: questions[0]?.key ?? "" } : v === "default" ? { mode: "default", value: f.kind === "multi" ? [] : "" } : { mode: "empty" })}>
            <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="facebook">Lấy từ Facebook</SelectItem><SelectItem value="default">Giá trị mặc định</SelectItem><SelectItem value="empty">Để trống</SelectItem></SelectContent>
          </Select>
          {r.mode === "facebook" && <Select value={r.key} onValueChange={(v) => set(f.key, { mode: "facebook", key: v })}>
            <SelectTrigger className="w-64 h-9"><SelectValue placeholder="Chọn câu hỏi" /></SelectTrigger>
            <SelectContent>{questions.map((x) => <SelectItem key={x.key} value={x.key}>{x.label} ({x.key})</SelectItem>)}</SelectContent>
          </Select>}
        </div>
        {r.mode === "default" && (f.kind === "multi"
          ? <div className="flex flex-wrap gap-3">{opts.map((o) => { const vals = (r.value as string[]) ?? []; return <label key={o} className="flex items-center gap-1.5 text-sm">
              <Checkbox checked={vals.includes(o)} onCheckedChange={(c) => set(f.key, { mode: "default", value: c ? [...vals, o] : vals.filter((x) => x !== o) })} />{o}</label>; })}</div>
          : f.max > 500 ? <Textarea rows={2} value={r.value as string} onChange={(e) => set(f.key, { mode: "default", value: e.target.value })} />
          : <Input value={r.value as string} onChange={(e) => set(f.key, { mode: "default", value: e.target.value })} />)}
        {r.mode === "facebook" && f.catalog && <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Ánh xạ đáp án Facebook sang danh mục Base (đáp án trùng tên danh mục tự khớp; đáp án không khớp sẽ bỏ qua).</p>
          {(q?.options ?? []).map((o) => <div key={o.value} className="flex items-center gap-2 text-sm"><span className="w-56 truncate">{o.value}</span>
            <Select value={r.valueMap?.[o.value] ?? "__auto"} onValueChange={(v) => { const vm = { ...(r.valueMap ?? {}) }; if (v === "__auto") delete vm[o.value]; else vm[o.value] = v; set(f.key, { ...r, valueMap: vm }); }}>
              <SelectTrigger className="w-56 h-8"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="__auto">Tự khớp theo tên</SelectItem>{opts.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
            </Select></div>)}
          {q && !(q.options ?? []).length && <p className="text-xs text-muted-foreground">Câu hỏi tự do: chỉ giữ câu trả lời trùng đúng tên trong danh mục.</p>}
        </div>}
      </div>;
    })}</div>
    {errs.length > 0 ? <ul className="text-xs text-destructive list-disc pl-5">{errs.map((e) => <li key={e}>{e}</li>)}</ul> : <p className="text-xs text-emerald-600">Cấu hình hợp lệ — có thể bật đồng bộ.</p>}
    <DialogFooter><Button variant="ghost" onClick={onClose}>Đóng</Button>
      <Button variant="outline" onClick={() => { const n = suggestMapping(m, questions); const c = Object.keys(n).filter((k) => n[k as FieldKey] !== m[k as FieldKey]).length; setM(n); toast(c ? `Đã gợi ý ${c} trường — kiểm tra trước khi lưu` : "Không có gợi ý mới"); }}>Gợi ý tự động</Button>
      <Button onClick={async () => { try { const r = await save({ data: { formId: form.form_id, mapping: m as any } }); (r.ok ? toast.success : toast.error)(r.message); onSaved(); onClose(); } catch (e: any) { toast.error(e.message); } }}>Lưu cấu hình</Button></DialogFooter>
  </DialogContent></Dialog>;
}

function History({ ov }: { ov: Overview }) {
  const list = useServerFn(fblEvents);
  const retry = useServerFn(fblRetry);
  const [f, setF] = useState({ pageId: "", formId: "", status: "", from: "", to: "" });
  const [rows, setRows] = useState<any[] | null>(null);
  const load = () => list({ data: { pageId: f.pageId || undefined, formId: f.formId || undefined, status: f.status || undefined, from: f.from ? new Date(f.from + "T00:00:00+07:00").toISOString() : undefined, to: f.to ? new Date(f.to + "T23:59:59+07:00").toISOString() : undefined } }).then(setRows).catch((e) => toast.error(e.message));
  useEffect(() => { load(); }, [f]);
  useVisibleRefresh(load);
  const pageName = (id: string) => ov.pages.find((p: any) => p.page_id === id)?.name ?? id;
  const formName = (id: string) => ov.forms.find((x: any) => x.form_id === id)?.name ?? id ?? "—";
  const sel = (k: keyof typeof f, v: string) => setF({ ...f, [k]: v === "__all" ? "" : v });
  return <Card><CardContent className="p-4 space-y-3">
    <div className="flex gap-2 flex-wrap">
      <Select value={f.pageId || "__all"} onValueChange={(v) => sel("pageId", v)}><SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="__all">Tất cả Page</SelectItem>{ov.pages.map((p: any) => <SelectItem key={p.page_id} value={p.page_id}>{p.name}</SelectItem>)}</SelectContent></Select>
      <Select value={f.formId || "__all"} onValueChange={(v) => sel("formId", v)}><SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="__all">Tất cả Form</SelectItem>{ov.forms.filter((x: any) => !f.pageId || x.page_id === f.pageId).map((x: any) => <SelectItem key={x.form_id} value={x.form_id}>{x.name}</SelectItem>)}</SelectContent></Select>
      <Select value={f.status || "__all"} onValueChange={(v) => sel("status", v)}><SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="__all">Tất cả trạng thái</SelectItem>{Object.entries(STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>
      <Input type="date" className="w-40 h-9" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} />
      <Input type="date" className="w-40 h-9" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} />
    </div>
    <div className="overflow-x-auto"><table className="w-full text-sm">
      <thead className="text-xs text-muted-foreground"><tr className="text-left"><th className="py-2 pr-3">Ba thời điểm</th><th className="pr-3">Phương thức nhận</th><th className="pr-3">Độ trễ</th><th className="pr-3">Page</th><th className="pr-3">Form</th><th className="pr-3">Trạng thái</th><th className="pr-3">Nguồn</th><th className="pr-3">Tín hiệu</th><th className="pr-3">Nguyên nhân</th><th /></tr></thead>
      <tbody className="divide-y">{(rows ?? []).map((r) => <tr key={r.id}>
        <td className="py-2 pr-3 whitespace-nowrap text-xs"><div>Meta tạo: {fmt(r.lead_created_at)}</div><div>Base nhận: {fmt(r.received_at)}</div><div>Tạo tín hiệu: {fmt(r.signal_created_at)}</div></td>
        <td className="pr-3 whitespace-nowrap text-xs">{METHOD[r.receipt_method] ?? METHOD.legacy_unknown}</td>
        <td className="pr-3 whitespace-nowrap text-xs"><div>Nhận Webhook: {duration(eventLatency(r).webhookSeconds)}</div><div>Xử lý: {duration(eventLatency(r).processingSeconds)}</div></td><td className="pr-3">{pageName(r.page_id)}</td><td className="pr-3">{formName(r.form_id)}</td>
        <td className="pr-3"><Badge variant={r.status === "success" ? "secondary" : r.status === "failed" || r.status === "needs_action" ? "destructive" : "outline"}>{STATUS[r.status] ?? r.status}</Badge></td>
        <td className="pr-3">{r.source ?? "—"}</td>
        <td className="pr-3">{r.signal_id ? <Link to="/signals" className="underline">Mở tín hiệu</Link> : "—"}</td>
        <td className="pr-3 text-xs text-muted-foreground max-w-xs">{r.error ?? ""}</td>
        <td>{["failed", "needs_action", "pending"].includes(r.status) && <Button size="sm" variant="outline" onClick={async () => { try { const x = await retry({ data: { id: r.id } }); toast.message(`Kết quả: ${STATUS[x.status] ?? x.status}`); load(); } catch (e: any) { toast.error(e.message); } }}>Thử đồng bộ lại</Button>}</td>
      </tr>)}
      {rows && rows.length === 0 && <tr><td colSpan={10} className="py-8 text-center text-muted-foreground">Chưa có sự kiện.</td></tr>}</tbody>
    </table></div>
  </CardContent></Card>;
}

function MaintainButton({ onDone }: { onDone: () => void }) {
  const run = useServerFn(fblMaintainNow);
  const [busy, setBusy] = useState(false);
  return <Button size="sm" variant="outline" disabled={busy} title="Quét Form mới, thử lại lead lỗi đến hạn, đối chiếu 48 giờ gần nhất" onClick={async () => {
    setBusy(true);
    try { const r = await run(); toast.success(`Kiểm tra xong: ${r.newForms} Form mới · thử lại ${r.retried} · bổ sung ${r.recovered} lead`); if (r.errors.length) toast.error(r.errors.slice(0, 3).join("; ")); onDone(); }
    catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  }}>{busy ? "Đang kiểm tra…" : "Kiểm tra ngay"}</Button>;
}

function BackfillButton({ form }: { form: any }) {
  const run = useServerFn(fblBackfill);
  const today = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [preview, setPreview] = useState<{ total: number; existing: number; missing: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const range = () => ({ formId: form.form_id, from: new Date(from + "T00:00:00+07:00").toISOString(), to: new Date(to + "T23:59:59+07:00").toISOString() });
  const go = async (apply: boolean) => {
    setBusy(true);
    try {
      const r = await run({ data: { ...range(), apply } });
      if (apply) { toast.success(`Đồng bộ bù xong: tạo ${r.created} tín hiệu${r.failed ? ` · ${r.failed} lead cần xử lý (xem Lịch sử)` : ""}`); setOpen(false); setPreview(null); }
      else setPreview(r);
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };
  return <>
    <Button size="sm" variant="outline" disabled={!form.mapping} title={form.mapping ? "" : "Cần cấu hình Form trước"} onClick={() => setOpen(true)}>Đồng bộ bù</Button>
    {open && <Dialog open onOpenChange={(o) => { if (!o) { setOpen(false); setPreview(null); } }}><DialogContent>
      <DialogHeader><DialogTitle>Đồng bộ bù — {form.name}</DialogTitle></DialogHeader>
      <p className="text-xs text-muted-foreground">Lấy lại các lead trong khoảng ngày (giờ Việt Nam, tối đa 90 ngày) chưa có trong Base. Lead đã có sẽ không bị tạo trùng.</p>
      <div className="flex gap-2 items-center"><Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPreview(null); }} /><span>→</span><Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPreview(null); }} /></div>
      {preview && <div className="text-sm border rounded-md p-3">Tìm thấy <b>{preview.total}</b> lead · đã có <b>{preview.existing}</b> · sẽ tạo mới tối đa <b>{Math.min(preview.missing, 300)}</b> tín hiệu{preview.missing > 300 ? " (lần này 300, chạy lại để tiếp tục)" : ""}.</div>}
      <DialogFooter>
        <Button variant="ghost" onClick={() => { setOpen(false); setPreview(null); }}>Hủy</Button>
        {!preview ? <Button disabled={busy} onClick={() => go(false)}>{busy ? "Đang kiểm tra…" : "Xem trước"}</Button>
          : <Button disabled={busy || preview.missing === 0} onClick={() => go(true)}>{busy ? "Đang đồng bộ…" : `Xác nhận tạo ${Math.min(preview.missing, 300)} tín hiệu`}</Button>}
      </DialogFooter>
    </DialogContent></Dialog>}
  </>;
}
