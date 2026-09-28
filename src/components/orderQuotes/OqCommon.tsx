import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Camera, ImagePlus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { oqApi } from "@/lib/orderQuotes/api";
import { IMG_CAT, flowStatusLabel } from "@/lib/orderQuotes/logic";
import { cn } from "@/lib/utils";

export function useUserName() {
  const users = useAuth((s) => s.users);
  return (id?: string | null) => (id ? users.find((u) => u.id === id)?.fullName ?? "—" : "—");
}

export function FlowBadge({ kind, status, waiting }: { kind: "price" | "progress"; status: string; waiting?: boolean }) {
  const tone = status === "answered" ? "bg-primary/15 text-primary" : status === "processing" ? "bg-accent text-accent-foreground" : status === "cancelled" ? "bg-muted text-muted-foreground line-through" : "bg-secondary text-secondary-foreground";
  return (
    <span className="inline-flex flex-wrap gap-1">
      <Badge variant="outline" className={cn("border-0 font-medium", tone)}>{kind === "price" ? "Giá" : "Tiến độ"}: {flowStatusLabel(kind, status)}</Badge>
      {waiting && status === "processing" && <Badge variant="outline" className="border-dashed">Đang chờ Sale bổ sung</Badge>}
    </span>
  );
}

export function useSignedUrls(paths: string[]) {
  return useQuery({ queryKey: ["oq-img", paths.join("|")], queryFn: () => oqApi.signedUrls(paths), enabled: paths.length > 0, staleTime: 30 * 60 * 1000 }).data ?? {};
}

export type Img = { id: string; path: string; category: string; caption: string | null };

/** Ảnh tham khảo của một sản phẩm. editable = còn là bản nháp của người tạo. */
export function ItemImages({ images, editable, onAdd, onChanged }: { images: Img[]; editable?: boolean; onAdd?: (files: File[], category: string) => Promise<void>; onChanged?: () => void }) {
  const urls = useSignedUrls(images.map((i) => i.path));
  const [zoom, setZoom] = useState<Img | null>(null);
  const [cat, setCat] = useState("product");
  const [busy, setBusy] = useState(false);
  const pick = async (fl: FileList | null) => {
    if (!fl?.length || !onAdd) return;
    setBusy(true);
    try { await onAdd(Array.from(fl), cat); } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };
  return (
    <div className="space-y-2">
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((im) => (
            <div key={im.id} className="space-y-1">
              <button type="button" onClick={() => setZoom(im)} className="block aspect-square w-full overflow-hidden rounded-md border bg-muted">
                {urls[im.path] ? <img src={urls[im.path]} alt={im.caption ?? ""} className="h-full w-full object-cover" /> : null}
              </button>
              <div className="text-[11px] text-muted-foreground truncate">{IMG_CAT[im.category]}</div>
              {editable ? <CaptionEdit im={im} onChanged={onChanged} /> : im.caption && <div className="text-xs line-clamp-2">{im.caption}</div>}
            </div>
          ))}
        </div>
      )}
      {editable && (
        <div className="flex flex-wrap items-center gap-2">
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(IMG_CAT).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
          </Select>
          <Button type="button" variant="outline" size="sm" disabled={busy} asChild>
            <label className="cursor-pointer"><ImagePlus className="h-4 w-4 mr-1" />Tải ảnh<input type="file" accept="image/*" multiple hidden onChange={(e) => { pick(e.target.files); e.target.value = ""; }} /></label>
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={busy} asChild>
            <label className="cursor-pointer"><Camera className="h-4 w-4 mr-1" />Chụp ảnh<input type="file" accept="image/*" capture="environment" hidden onChange={(e) => { pick(e.target.files); e.target.value = ""; }} /></label>
          </Button>
          {busy && <span className="text-xs text-muted-foreground">Đang tải…</span>}
        </div>
      )}
      <Dialog open={!!zoom} onOpenChange={(o) => !o && setZoom(null)}>
        <DialogContent className="max-w-3xl p-2">
          <DialogTitle className="sr-only">Xem ảnh</DialogTitle>
          {zoom && urls[zoom.path] && <img src={urls[zoom.path]} alt={zoom.caption ?? ""} className="max-h-[80vh] w-full object-contain" />}
          {zoom?.caption && <p className="px-2 pb-2 text-sm">{zoom.caption}</p>}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CaptionEdit({ im, onChanged }: { im: Img; onChanged?: () => void }) {
  const [v, setV] = useState(im.caption ?? "");
  useEffect(() => setV(im.caption ?? ""), [im.caption]);
  return (
    <div className="flex gap-1">
      <Input value={v} onChange={(e) => setV(e.target.value)} placeholder="Chú thích" className="h-7 text-xs px-2"
        onBlur={() => v !== (im.caption ?? "") && oqApi.updateImage(im.id, im.category, v).then(onChanged).catch((e) => toast.error(e.message))} />
      <button type="button" aria-label="Xóa ảnh" className="p-1 text-destructive" onClick={() => oqApi.deleteImage(im.id).then(onChanged).catch((e) => toast.error(e.message))}><Trash2 className="h-3.5 w-3.5" /></button>
    </div>
  );
}
