import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/auth";
import { ALLOWED_IMG, MAX_IMG, BrandMark, DEFAULT_BRANDING, useBranding, type Branding } from "@/lib/branding";

const readImg = (f: File) => new Promise<string>((ok, bad) => {
  if (!ALLOWED_IMG.includes(f.type)) return bad(new Error("Chỉ nhận ảnh PNG, JPG, WEBP hoặc ICO."));
  if (f.size > MAX_IMG) return bad(new Error("Ảnh tối đa 500 KB."));
  const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = () => bad(new Error("Không đọc được tệp.")); r.readAsDataURL(f);
});

export function SystemInfoSettings() {
  const { can } = useCurrentUser();
  const canEdit = can("system.branding");
  const cur = useBranding();
  const qc = useQueryClient();
  const [d, setD] = useState<Branding>(cur);
  const [saving, setSaving] = useState(false);
  useEffect(() => setD(cur), [cur]);
  const hist = useQuery({
    queryKey: ["branding-history"], enabled: canEdit,
    queryFn: async () => (await (supabase as any).from("app_branding_history").select("*").order("created_at", { ascending: false }).limit(10)).data ?? [],
  });
  const set = (p: Partial<Branding>) => setD((x) => ({ ...x, ...p }));
  const pick = (key: "logo_url" | "favicon_url") => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; e.target.value = "";
    if (!f) return;
    try { set({ [key]: await readImg(f) } as any); } catch (err: any) { toast.error(err.message); }
  };
  const save = async () => {
    setSaving(true);
    const { error } = await (supabase as any).rpc("branding_save", {
      _app_name: d.app_name, _short_name: d.short_name, _org_name: d.org_name, _description: d.description,
      _logo_url: d.logo_url ?? "", _favicon_url: d.favicon_url ?? "",
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Đã lưu thông tin hệ thống");
    qc.invalidateQueries({ queryKey: ["branding"] }); qc.invalidateQueries({ queryKey: ["branding-history"] });
  };
  const dirty = JSON.stringify({ ...d, updated_at: 0 }) !== JSON.stringify({ ...cur, updated_at: 0 });

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <Card><CardContent className="p-5 space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div><Label>Tên ứng dụng</Label><Input value={d.app_name} maxLength={60} disabled={!canEdit} onChange={(e) => set({ app_name: e.target.value })} /></div>
          <div><Label>Tên viết tắt</Label><Input value={d.short_name} maxLength={20} disabled={!canEdit} onChange={(e) => set({ short_name: e.target.value })} /></div>
          <div className="sm:col-span-2"><Label>Tên đơn vị sử dụng</Label><Input value={d.org_name} maxLength={120} disabled={!canEdit} onChange={(e) => set({ org_name: e.target.value })} /></div>
          <div className="sm:col-span-2"><Label>Mô tả ứng dụng</Label><Textarea rows={2} value={d.description} maxLength={200} disabled={!canEdit} onChange={(e) => set({ description: e.target.value })} /></div>
        </div>
        {(["logo_url", "favicon_url"] as const).map((k) => (
          <div key={k} className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg border flex items-center justify-center overflow-hidden bg-muted">
              {d[k] ? <img src={d[k]!} alt="" className="h-full w-full object-contain" /> : <span className="text-xs text-muted-foreground">Trống</span>}
            </div>
            <div className="flex-1"><div className="text-sm font-medium">{k === "logo_url" ? "Logo" : "Favicon"}</div><div className="text-xs text-muted-foreground">PNG, JPG, WEBP{k === "favicon_url" ? ", ICO" : ""} — tối đa 500 KB</div></div>
            {canEdit && <>
              <Button variant="outline" size="sm" asChild><label className="cursor-pointer">Chọn ảnh<input type="file" accept={ALLOWED_IMG.join(",")} className="hidden" onChange={pick(k)} /></label></Button>
              {d[k] && <Button variant="ghost" size="sm" onClick={() => set({ [k]: null } as any)}>Xóa</Button>}
            </>}
          </div>
        ))}
        {canEdit ? (
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setD({ ...DEFAULT_BRANDING })}>Về mặc định</Button>
            <Button variant="outline" disabled={!dirty} onClick={() => setD(cur)}>Hoàn tác</Button>
            <Button disabled={!dirty || saving} onClick={save}>{saving ? "Đang lưu…" : "Lưu thay đổi"}</Button>
          </div>
        ) : <p className="text-xs text-muted-foreground">Bạn chỉ có quyền xem. Cần quyền "Quản lý thông tin hệ thống" để chỉnh sửa.</p>}
      </CardContent></Card>

      <div className="space-y-4">
        <Card><CardContent className="p-4 space-y-3">
          <div className="text-xs font-medium text-muted-foreground">XEM TRƯỚC</div>
          <div className="rounded-lg bg-sidebar text-sidebar-foreground p-3 flex items-center gap-2">
            <BrandMark b={d} className="h-9 w-9 rounded-lg" />
            <div><div className="text-sm font-semibold">{d.app_name || "—"}</div><div className="text-xs opacity-60">{d.description}</div></div>
          </div>
          <div className="rounded-md border px-3 py-2 text-xs flex items-center gap-2">
            {d.favicon_url ? <img src={d.favicon_url} alt="" className="h-4 w-4" /> : <img src="/favicon.ico" alt="" className="h-4 w-4" />}
            <span className="truncate">Tổng quan — {d.app_name}</span>
          </div>
          <div className="rounded-md border px-3 py-2 text-xs"><b>🔔 {(d.app_name || "").toUpperCase()}</b><div className="text-muted-foreground">Đầu tin Zalo gửi sau khi lưu</div></div>
          <div className="text-xs text-muted-foreground">Đơn vị: {d.org_name || "—"}</div>
        </CardContent></Card>
        {canEdit && <Card><CardContent className="p-4">
          <div className="text-xs font-medium text-muted-foreground mb-2">LỊCH SỬ THAY ĐỔI</div>
          {(hist.data ?? []).length === 0 && <div className="text-xs text-muted-foreground">Chưa có thay đổi.</div>}
          <ul className="space-y-2 text-xs">
            {(hist.data ?? []).map((h: any) => {
              const ch = Object.keys(h.after).filter((k) => JSON.stringify(h.after[k]) !== JSON.stringify(h.before[k]));
              return <li key={h.id}><div className="font-medium"><HistName id={h.actor_id} /> · {new Date(h.created_at).toLocaleString("vi-VN")}</div>
                <div className="text-muted-foreground">Đổi: {ch.join(", ") || "không đổi"}</div></li>;
            })}
          </ul>
        </CardContent></Card>}
      </div>
    </div>
  );
}

function HistName({ id }: { id: string | null }) {
  const q = useQuery({ queryKey: ["profiles-dir"], queryFn: async () => (await (supabase as any).rpc("get_profiles_directory")).data ?? [], staleTime: 60_000 });
  return <>{(q.data ?? []).find((p: any) => p.id === id)?.full_name ?? "—"}</>;
}
