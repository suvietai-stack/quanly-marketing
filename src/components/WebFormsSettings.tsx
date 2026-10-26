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
import { Label } from "@/components/ui/label";
import { Globe, RefreshCw, Plus, KeyRound, Copy, Settings2, RotateCw, Ban, Pencil } from "lucide-react";
import { wfOverview, wfAddWebsite, wfWebsiteAction, wfSaveForm, wfEvents, wfRetry } from "@/lib/webForms/wf.functions";
import { useVisibleRefresh } from "@/hooks/use-visible-refresh";
import { FIELDS, validateMapping, suggestMapping, copyMapping, type FieldKey, type FieldRule, type Mapping, type FormField } from "@/lib/webForms/mapping";

type Overview = Awaited<ReturnType<typeof wfOverview>>;
const STATUS: Record<string, string> = { pending: "Chờ xử lý", success: "Thành công", failed: "Thất bại", skipped: "Bỏ qua", duplicate: "Trùng", needs_action: "Cần xử lý" };
const fmt = (s?: string | null) => (s ? new Date(s).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : "—");
const copyText = (v: string) => { navigator.clipboard.writeText(v); toast.success("Đã sao chép"); };

export function WebFormsSettings() {
  const overview = useServerFn(wfOverview);
  const [ov, setOv] = useState<Overview | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newKey, setNewKey] = useState<{ websiteId: string; key: string } | null>(null);
  const [editForm, setEditForm] = useState<{ websiteId: string; formId: string; variant: string } | null>(null);
  const load = () => overview().then((r) => { setOv(r); setErr(null); }).catch((e) => setErr(e.message));
  useVisibleRefresh(load, 30000);
  useEffect(() => { load(); }, []);
  if (err) return <Card><CardContent className="p-5 text-sm text-destructive">{err}</CardContent></Card>;
  if (!ov) return <Card><CardContent className="p-5 text-sm text-muted-foreground">Đang tải…</CardContent></Card>;
  const form = editForm ? ov.forms.find((f: any) => f.website_id === editForm.websiteId && f.form_id === editForm.formId && f.variant === editForm.variant) : null;

  return <div className="space-y-4">
    <StatusCard ov={ov} />
    <Tabs defaultValue="websites">
      <TabsList><TabsTrigger value="websites">Website & Form</TabsTrigger><TabsTrigger value="history">Lịch sử đồng bộ</TabsTrigger></TabsList>
      <TabsContent value="websites" className="mt-3 space-y-4">
        <Button onClick={() => setAdding(true)}><Plus className="h-4 w-4 mr-1.5" />Thêm Website</Button>
        {ov.websites.length === 0 && <p className="text-sm text-muted-foreground">Chưa có Website nào. Thêm Website để nhận tín hiệu từ Form WordPress.</p>}
        {ov.websites.map((w: any) => <WebsiteCard key={w.id} website={w} ov={ov} onChange={load}
          onKey={(k) => setNewKey(k)} onEdit={(f) => setEditForm(f)} />)}
      </TabsContent>
      <TabsContent value="history" className="mt-3"><History ov={ov} /></TabsContent>
    </Tabs>
    {adding && <AddWebsiteDialog ov={ov} onClose={() => setAdding(false)} onCreated={(r) => { setAdding(false); setNewKey(r); load(); }} />}
    {newKey && <KeyDialog data={newKey} ov={ov} onClose={() => setNewKey(null)} />}
    {form && <MappingDialog form={form} ov={ov} onClose={() => setEditForm(null)} onSaved={load} />}
  </div>;
}

function StatusCard({ ov }: { ov: Overview }) {
  const s = ov.stats;
  return <Card><CardContent className="p-5 space-y-3 text-sm">
    <div className="flex items-center gap-2 font-semibold"><Globe className="h-4 w-4" />Website Forms — nhận tín hiệu từ Form WordPress</div>
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline">Website đang kết nối: {ov.websites.filter((w: any) => w.status === "active").length}</Badge>
      <Badge variant="outline">Form đang bật: {ov.forms.filter((f: any) => f.enabled).length}</Badge>
    </div>
    {[["Kiểm tra kết nối (Ping)", ov.endpoints.ping], ["Đăng ký Form", ov.endpoints.register], ["Gửi submission", ov.endpoints.submit]].map(([l, v]) => (
      <div key={l} className="flex items-center gap-2 flex-wrap"><span className="text-muted-foreground w-44">{l}</span><code className="text-xs bg-muted px-2 py-1 rounded break-all">{v}</code>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyText(v)}><Copy className="h-3.5 w-3.5" /></Button></div>))}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
      {[["Submission thành công", s.success ?? 0], ["Đang chờ xử lý", s.pending ?? 0], ["Lỗi cần xử lý", (s.failed ?? 0) + (s.needs_action ?? 0)], ["Bỏ qua / trùng", (s.skipped ?? 0) + (s.duplicate ?? 0)]].map(([l, v]) => (
        <div key={l as string} className="rounded-md border p-2"><div className="text-xs text-muted-foreground">{l}</div><div className="text-lg font-semibold">{v}</div></div>))}
    </div>
  </CardContent></Card>;
}

function AddWebsiteDialog({ ov, onClose, onCreated }: { ov: Overview; onClose: () => void; onCreated: (r: { websiteId: string; key: string }) => void }) {
  const add = useServerFn(wfAddWebsite);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [source, setSource] = useState("");
  const [busy, setBusy] = useState(false);
  return <Dialog open onOpenChange={(o) => !o && onClose()}><DialogContent>
    <DialogHeader><DialogTitle>Thêm Website</DialogTitle></DialogHeader>
    <div className="space-y-3">
      <div><Label>Tên Website</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Xưởng Gốm Sứ Việt" /></div>
      <div><Label>Domain</Label><Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="xuonggomsuviet.vn" /></div>
      <div><Label>Nguồn tín hiệu (từ Kho nguồn)</Label>
        <Select value={source} onValueChange={setSource}><SelectTrigger><SelectValue placeholder="Chọn nguồn…" /></SelectTrigger>
          <SelectContent>{ov.catalogs.sources.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
      <p className="text-xs text-muted-foreground">Sau khi tạo, Base cấp Website ID và khóa kết nối riêng — khóa chỉ hiển thị đúng một lần.</p>
    </div>
    <DialogFooter><Button variant="ghost" onClick={onClose}>Hủy</Button>
      <Button disabled={!name.trim() || !domain.trim() || !source || busy} onClick={async () => {
        setBusy(true);
        try { onCreated(await add({ data: { name: name.trim(), domain: domain.trim(), source } })); }
        catch (e: any) { toast.error(e.message); setBusy(false); }
      }}>Tạo Website</Button></DialogFooter>
  </DialogContent></Dialog>;
}

function KeyDialog({ data, ov, onClose }: { data: { websiteId: string; key: string }; ov: Overview; onClose: () => void }) {
  return <Dialog open onOpenChange={(o) => !o && onClose()}><DialogContent>
    <DialogHeader><DialogTitle className="flex items-center gap-2"><KeyRound className="h-4 w-4" />Khóa kết nối — chỉ hiển thị một lần</DialogTitle></DialogHeader>
    <div className="space-y-3 text-sm">
      <p className="text-destructive font-medium">Sao chép và lưu khóa ngay. Sau khi đóng, Base không thể hiển thị lại khóa này.</p>
      <div><Label>Website ID</Label><div className="flex items-center gap-2"><code className="text-xs bg-muted px-2 py-1 rounded break-all">{data.websiteId}</code>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyText(data.websiteId)}><Copy className="h-3.5 w-3.5" /></Button></div></div>
      <div><Label>Khóa kết nối</Label><div className="flex items-center gap-2"><code className="text-xs bg-muted px-2 py-1 rounded break-all">{data.key}</code>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyText(data.key)}><Copy className="h-3.5 w-3.5" /></Button></div></div>
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Cấu hình trong plugin WordPress (backend PHP, không đưa khóa ra JavaScript):</p>
        <p>· Endpoint gửi dữ liệu: <code className="break-all">{ov.endpoints.submit}</code></p>
        <p>· Mỗi request ký HMAC-SHA256: chữ ký = HMAC(khóa, timestamp + "." + thân request), gửi kèm header <code>x-wf-website</code>, <code>x-wf-timestamp</code>, <code>x-wf-signature</code>.</p>
      </div>
    </div>
    <DialogFooter><Button onClick={onClose}>Đã lưu khóa</Button></DialogFooter>
  </DialogContent></Dialog>;
}

function WebsiteCard({ website: w, ov, onChange, onKey, onEdit }: { website: any; ov: Overview; onChange: () => void; onKey: (k: { websiteId: string; key: string }) => void; onEdit: (f: { websiteId: string; formId: string; variant: string }) => void }) {
  const act = useServerFn(wfWebsiteAction);
  const [busy, setBusy] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(w.name);
  const forms = ov.forms.filter((f: any) => f.website_id === w.id);
  const key = ov.keys.find((k) => k.website_id === w.id);
  const run = async (payload: any, confirmMsg?: string) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setBusy(true);
    try {
      const r: any = await act({ data: { websiteId: w.id, ...payload } });
      if (r?.key) onKey({ websiteId: w.id, key: r.key });
      toast.success(r?.message ?? "Đã lưu");
      onChange();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };
  return <Card><CardContent className="p-5 space-y-3">
    <div className="flex items-start justify-between gap-3 flex-wrap">
      <div className="min-w-0">
        <div className="flex items-center gap-2 font-semibold">{w.name}
          <Badge variant={w.status === "active" ? "secondary" : "destructive"}>{w.status === "active" ? "Đang kết nối" : "Đã thu hồi"}</Badge>
          {key && !key.revoked_at && <Badge variant="outline">Khóa: {key.key_prefix}…</Badge>}
          {(!key || key.revoked_at) && <Badge variant="destructive">Khóa đã thu hồi</Badge>}
        </div>
        <div className="text-xs text-muted-foreground mt-1 break-all">{w.domain} · ID <code>{w.id}</code> · Kết nối gần nhất: {fmt(w.last_seen_at)}</div>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        <Button size="sm" variant="ghost" onClick={() => setRenaming(true)}><Pencil className="h-3.5 w-3.5 mr-1" />Đổi tên</Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => run({ action: "rotate_key" }, "Cấp khóa mới? Khóa cũ sẽ hết hiệu lực ngay, plugin WordPress phải cập nhật khóa mới.")}><RefreshCw className="h-3.5 w-3.5 mr-1" />Đổi khóa</Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => run({ action: "revoke_key" }, "Thu hồi khóa? Website sẽ ngắt kết nối và mọi Form tắt đồng bộ. Lịch sử được giữ lại.")}><Ban className="h-3.5 w-3.5 mr-1" />Thu hồi khóa</Button>
      </div>
    </div>
    {renaming && <div className="flex gap-2"><Input value={newName} onChange={(e) => setNewName(e.target.value)} />
      <Button size="sm" disabled={busy} onClick={() => { setRenaming(false); run({ action: "rename", name: newName }); }}>Lưu</Button>
      <Button size="sm" variant="ghost" onClick={() => setRenaming(false)}>Hủy</Button></div>}
    <div className="flex items-center gap-2 text-sm flex-wrap">
      <span className="text-muted-foreground">Nguồn tín hiệu:</span>
      <Select value={w.source ?? ""} onValueChange={(v) => run({ action: "set_source", source: v || null })}>
        <SelectTrigger className="w-64 h-8"><SelectValue placeholder="Chưa chọn nguồn" /></SelectTrigger>
        <SelectContent>{ov.catalogs.sources.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
      </Select>
      {!w.source && <Badge variant="destructive">Chưa chọn nguồn — Form chưa thể bật</Badge>}
    </div>
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">{forms.length} Form đã phát hiện · {forms.filter((f: any) => f.enabled).length} đang bật · Cập nhật cấu trúc: {fmt(forms[0]?.checked_at)}</div>
      {forms.length === 0 && <p className="text-sm text-muted-foreground">Chưa có Form nào — plugin WordPress gọi API Đăng ký Form để Base nhận diện trường.</p>}
      {forms.map((f: any) => <FormRow key={`${f.form_id}|${f.variant}`} form={f} website={w} ov={ov} onChange={onChange} onEdit={() => onEdit({ websiteId: w.id, formId: f.form_id, variant: f.variant })} />)}
    </div>
  </CardContent></Card>;
}

function FormRow({ form: f, website: w, ov, onChange, onEdit }: { form: any; website: any; ov: Overview; onChange: () => void; onEdit: () => void }) {
  const save = useServerFn(wfSaveForm);
  const [busy, setBusy] = useState(false);
  const errs = validateMapping(f.mapping, f.schema ?? [], ov.catalogs, w.source);
  const toggle = async (enabled: boolean) => {
    setBusy(true);
    try {
      const r: any = await save({ data: { websiteId: w.id, formId: f.form_id, variant: f.variant, enabled } });
      r.ok ? toast.success(r.message) : toast.error(r.message);
      onChange();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };
  return <div className="flex items-center justify-between gap-3 rounded-md border p-3 flex-wrap">
    <div className="min-w-0">
      <div className="flex items-center gap-2 text-sm font-medium">{f.name}
        {f.variant && <Badge variant="outline">Nhóm: {f.variant}</Badge>}
        {f.needs_review && <Badge variant="destructive">Cần kiểm tra lại</Badge>}
        {f.enabled && <Badge variant="secondary">Đang đồng bộ từ {fmt(f.enabled_at)}</Badge>}
      </div>
      <div className="text-xs text-muted-foreground mt-0.5">{f.form_id} · {(f.schema ?? []).length} trường{f.mapping ? "" : " · chưa cấu hình ánh xạ"}</div>
    </div>
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" onClick={onEdit}><Settings2 className="h-3.5 w-3.5 mr-1" />Cấu hình</Button>
      <Switch checked={f.enabled} disabled={busy} onCheckedChange={toggle} aria-label={`Đồng bộ ${f.name}`} />
    </div>
  </div>;
}

const MODES: { value: FieldRule["mode"]; label: string }[] = [
  { value: "website", label: "Lấy từ Website" },
  { value: "default", label: "Giá trị mặc định" },
  { value: "compose", label: "Ghép nhiều trường" },
  { value: "empty", label: "Để trống" },
];

function MappingDialog({ form, ov, onClose, onSaved }: { form: any; ov: Overview; onClose: () => void; onSaved: () => void }) {
  const save = useServerFn(wfSaveForm);
  const fields = (form.schema ?? []) as FormField[];
  const [mapping, setMapping] = useState<Mapping>(form.mapping ?? suggestMapping({}, fields));
  const [busy, setBusy] = useState(false);
  const website = ov.websites.find((w: any) => w.id === form.website_id);
  const errs = validateMapping(mapping, fields, ov.catalogs, website?.source ?? null);
  const siblings = ov.forms.filter((x: any) => x.website_id === form.website_id && (x.form_id !== form.form_id || x.variant !== form.variant) && x.mapping);
  const set = (k: FieldKey, r: FieldRule) => setMapping({ ...mapping, [k]: r });
  return <Dialog open onOpenChange={(o) => !o && onClose()}><DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
    <DialogHeader><DialogTitle>Ánh xạ dữ liệu — {form.name}{form.variant ? ` · Nhóm ${form.variant}` : ""}</DialogTitle></DialogHeader>
    <div className="flex gap-2 flex-wrap mb-2">
      <Button size="sm" variant="outline" onClick={() => setMapping(suggestMapping(mapping, fields))}>Tự gợi ý mapping</Button>
      {siblings.length > 0 && <Select onValueChange={(v) => {
        const src = siblings.find((x: any) => `${x.form_id}|${x.variant}` === v);
        if (!src) return;
        const { mapping: m, dropped } = copyMapping(src.mapping as Mapping, fields);
        setMapping(m);
        if (dropped.length) toast.warning(`Bỏ qua ${dropped.length} trường không có ở Form này: ${dropped.join(", ")}`);
      }}>
        <SelectTrigger className="w-56 h-8"><SelectValue placeholder="Sao chép mapping từ Form khác…" /></SelectTrigger>
        <SelectContent>{siblings.map((x: any) => <SelectItem key={`${x.form_id}|${x.variant}`} value={`${x.form_id}|${x.variant}`}>{x.name}{x.variant ? ` · ${x.variant}` : ""}</SelectItem>)}</SelectContent>
      </Select>}
    </div>
    <div className="space-y-4">
      {FIELDS.map((f) => {
        const r = mapping[f.key];
        const mode = r?.mode ?? "empty";
        const catValues = f.catalog ? ov.catalogs[f.catalog] : [];
        const srcField = r?.mode === "website" ? fields.find((x) => x.key === r.key) : null;
        return <div key={f.key} className="rounded-md border p-3 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{f.label}{f.required && <span className="text-destructive"> *</span>}</span>
            <Select value={mode} onValueChange={(v) => {
              const m = v as FieldRule["mode"];
              set(f.key, m === "website" ? { mode: "website", key: "" } : m === "default" ? { mode: "default", value: f.catalog ? [] : "" } : m === "compose" ? { mode: "compose", keys: [] } : { mode: "empty" });
            }}>
              <SelectTrigger className="w-44 h-8"><SelectValue /></SelectTrigger>
              <SelectContent>{MODES.filter((m) => m.value !== "compose" || f.kind === "text").map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {r?.mode === "website" && <div className="space-y-2">
            <Select value={r.key} onValueChange={(v) => set(f.key, { ...r, key: v })}>
              <SelectTrigger className="h-8"><SelectValue placeholder="Chọn trường của Form…" /></SelectTrigger>
              <SelectContent>{fields.map((x) => <SelectItem key={x.key} value={x.key}>{x.label} <span className="text-muted-foreground">({x.key})</span></SelectItem>)}</SelectContent>
            </Select>
            {f.catalog && srcField?.options?.length ? <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Ánh xạ đáp án → giá trị danh mục Base:</p>
              {srcField.options.map((o) => <div key={o.key ?? o.value} className="flex items-center gap-2 text-xs">
                <span className="w-48 truncate">{o.value}</span>
                <Select value={r.valueMap?.[o.value] ?? ""} onValueChange={(v) => set(f.key, { ...r, valueMap: { ...(r.valueMap ?? {}), [o.value]: v } })}>
                  <SelectTrigger className="h-7 flex-1"><SelectValue placeholder="Bỏ qua" /></SelectTrigger>
                  <SelectContent>{catValues.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select></div>)}
            </div> : null}
          </div>}
          {r?.mode === "default" && (f.catalog
            ? <div className="flex flex-wrap gap-2">{catValues.map((c) => {
                const vals = Array.isArray(r.value) ? r.value : [];
                return <label key={c} className="flex items-center gap-1.5 text-xs border rounded px-2 py-1">
                  <Checkbox checked={vals.includes(c)} onCheckedChange={(ck) => set(f.key, { mode: "default", value: ck ? [...vals, c] : vals.filter((x) => x !== c) })} />{c}</label>;
              })}</div>
            : <Input value={String(r.value ?? "")} onChange={(e) => set(f.key, { mode: "default", value: e.target.value })} placeholder="Giá trị cố định…" />)}
          {r?.mode === "compose" && <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Chọn các trường ghép lại — mỗi trường một dòng "Nhãn: trả lời", tự bỏ trường rỗng.</p>
            {fields.map((x) => <label key={x.key} className="flex items-center gap-1.5 text-xs">
              <Checkbox checked={r.keys.includes(x.key)} onCheckedChange={(ck) => set(f.key, { mode: "compose", keys: ck ? [...r.keys, x.key] : r.keys.filter((k) => k !== x.key) })} />
              {x.label} <span className="text-muted-foreground">({x.key})</span></label>)}
          </div>}
        </div>;
      })}
    </div>
    {errs.length > 0 && <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive space-y-1">{errs.map((e, i) => <p key={i}>· {e}</p>)}</div>}
    <DialogFooter className="gap-2">
      <Button variant="ghost" onClick={onClose}>Đóng</Button>
      <Button variant="outline" disabled={busy} onClick={async () => {
        setBusy(true);
        try { const r: any = await save({ data: { websiteId: form.website_id, formId: form.form_id, variant: form.variant, mapping } }); r.ok ? toast.success(r.message) : toast.error(r.message); onSaved(); } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
      }}>Lưu cấu hình</Button>
      <Button disabled={busy || errs.length > 0} onClick={async () => {
        setBusy(true);
        try { const r: any = await save({ data: { websiteId: form.website_id, formId: form.form_id, variant: form.variant, mapping, enabled: true } }); r.ok ? toast.success(r.message) : toast.error(r.message); onSaved(); onClose(); } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
      }}>Lưu & Bật đồng bộ</Button>
    </DialogFooter>
  </DialogContent></Dialog>;
}

function History({ ov }: { ov: Overview }) {
  const list = useServerFn(wfEvents);
  const retry = useServerFn(wfRetry);
  const [rows, setRows] = useState<Awaited<ReturnType<typeof wfEvents>>>([]);
  const [fWebsite, setFWebsite] = useState("");
  const [fStatus, setFStatus] = useState("");
  const load = () => list({ data: { websiteId: fWebsite || undefined, status: fStatus || undefined } }).then(setRows).catch((e) => toast.error(e.message));
  useEffect(() => { load(); }, [fWebsite, fStatus]);
  const nameOf = (id: string) => ov.websites.find((w: any) => w.id === id)?.name ?? id;
  return <Card><CardContent className="p-5 space-y-3">
    <div className="flex gap-2 flex-wrap">
      <Select value={fWebsite} onValueChange={setFWebsite}><SelectTrigger className="w-56 h-8"><SelectValue placeholder="Tất cả Website" /></SelectTrigger>
        <SelectContent>{ov.websites.map((w: any) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent></Select>
      <Select value={fStatus} onValueChange={setFStatus}><SelectTrigger className="w-44 h-8"><SelectValue placeholder="Mọi trạng thái" /></SelectTrigger>
        <SelectContent>{Object.entries(STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select>
      <Button size="sm" variant="ghost" onClick={() => { setFWebsite(""); setFStatus(""); }}>Xóa lọc</Button>
      <Button size="sm" variant="outline" onClick={load}><RefreshCw className="h-3.5 w-3.5 mr-1" />Làm mới</Button>
    </div>
    <div className="overflow-x-auto"><table className="w-full text-sm">
      <thead className="text-xs text-muted-foreground bg-muted/40"><tr>
        <th className="text-left font-medium px-3 py-2">Thời gian nhận</th><th className="text-left font-medium px-3 py-2">Website</th>
        <th className="text-left font-medium px-3 py-2">Form / Nhóm</th><th className="text-left font-medium px-3 py-2">Trạng thái</th>
        <th className="text-left font-medium px-3 py-2">Tín hiệu</th><th className="text-left font-medium px-3 py-2">Lỗi / Ghi chú</th>
        <th className="text-right font-medium px-3 py-2"></th>
      </tr></thead><tbody className="divide-y">
        {rows.map((r: any) => <tr key={r.id} className="hover:bg-muted/30">
          <td className="px-3 py-2 whitespace-nowrap">{fmt(r.received_at)}</td>
          <td className="px-3 py-2">{nameOf(r.website_id)}</td>
          <td className="px-3 py-2">{r.form_id}{r.variant ? ` · ${r.variant}` : ""}</td>
          <td className="px-3 py-2"><Badge variant={r.status === "success" ? "secondary" : r.status === "pending" ? "outline" : "destructive"}>{STATUS[r.status] ?? r.status}</Badge></td>
          <td className="px-3 py-2">{r.signal_id ? <Link to="/signals" className="text-primary underline text-xs">Mở tín hiệu</Link> : "—"}{r.page_url && <a href={r.page_url} target="_blank" rel="noreferrer" className="block text-xs text-muted-foreground underline truncate max-w-40">Trang nguồn</a>}</td>
          <td className="px-3 py-2 text-xs text-muted-foreground max-w-64"><span className="line-clamp-2" title={r.error ?? ""}>{r.error ?? "—"}</span></td>
          <td className="px-3 py-2 text-right">{!r.signal_id && ["failed", "needs_action", "skipped"].includes(r.status) &&
            <Button size="sm" variant="outline" onClick={async () => { try { const x: any = await retry({ data: { id: r.id } }); toast.success(`Đã thử lại: ${STATUS[x.status] ?? x.status}`); load(); } catch (e: any) { toast.error(e.message); } }}><RotateCw className="h-3.5 w-3.5 mr-1" />Thử lại</Button>}</td>
        </tr>)}
        {rows.length === 0 && <tr><td colSpan={7} className="px-3 py-10 text-center text-muted-foreground text-sm">Chưa có submission nào.</td></tr>}
      </tbody></table></div>
  </CardContent></Card>;
}
