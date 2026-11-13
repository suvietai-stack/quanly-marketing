import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Camera, Check, ChevronsUpDown, ImagePlus, RotateCw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
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
  const tone = status === "answered" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" : status === "processing" ? waiting ? "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200" : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200" : status === "cancelled" ? "bg-muted text-muted-foreground line-through" : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200";
  return (
    <span className="inline-flex flex-wrap gap-1">
      <Badge variant="outline" className={cn("border-0 font-medium", tone)}>{kind === "price" ? "Giá" : "Tiến độ"}: {flowStatusLabel(kind, status)}</Badge>
      {waiting && status === "processing" && <Badge variant="outline" className="border-dashed">Đang chờ Sale bổ sung</Badge>}
    </span>
  );
}

/** Cùng bố cục thông tin sản phẩm ở yêu cầu, lượt phản hồi và bản xem lại. */
export function ProductQuantity({ qty, unit }: { qty?: string | number | null; unit?: string | null }) {
  return <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-2 text-sm">
    <span className="text-muted-foreground">Số lượng:</span>
    <span className="min-w-0 break-words font-medium">{qty === null || qty === undefined || qty === "" ? "—" : `${qty}${unit ? ` ${unit}` : ""}`}</span>
  </div>;
}

export function useSignedUrls(paths: string[]) {
  return useQuery({ queryKey: ["oq-img", paths.join("|")], queryFn: () => oqApi.signedUrls(paths), enabled: paths.length > 0, staleTime: 30 * 60 * 1000 }).data ?? {};
}

/** Bàn phím điện thoại đang mở (dùng để ẩn thanh thao tác cố định, tránh che ô nhập). */
export function useKeyboardOpen() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (!vv) return;
    const h = () => setOpen(window.innerHeight - vv.height > 150);
    vv.addEventListener("resize", h); h();
    return () => vv.removeEventListener("resize", h);
  }, []);
  return open;
}

/** Thanh thao tác cố định dưới màn hình điện thoại; trên máy tính hiển thị bình thường. Ẩn khi bàn phím mở. */
export function MobileActionBar({ children, className }: { children: ReactNode; className?: string }) {
  const kb = useKeyboardOpen();
  return (
    <div className={cn(
      "z-20 md:static md:mt-6 md:border-0 md:bg-transparent md:p-0",
      kb ? "static mt-4" : "fixed bottom-0 inset-x-0 border-t bg-background/95 backdrop-blur px-3 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] shadow-lg md:shadow-none",
      className,
    )}>{children}</div>
  );
}

/** Chọn người có ô tìm kiếm (dễ tìm trên điện thoại). */
export function UserPicker({ users, value, onChange, placeholder = "Chọn nhân viên Cung ứng", invalid }: { users: { id: string; full_name: string }[]; value: string; onChange: (id: string) => void; placeholder?: string; invalid?: boolean }) {
  const [open, setOpen] = useState(false);
  const cur = users.find((u) => u.id === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" aria-invalid={invalid} className={cn("w-full justify-between h-11 font-normal", invalid && "border-destructive")}>
          <span className="flex min-w-0 items-center gap-2">
            {cur && <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">{initials(cur.full_name)}</span>}
            <span className={cn("truncate", !cur && "text-muted-foreground")}>{cur?.full_name ?? placeholder}</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] max-w-[calc(100vw-1.5rem)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Tìm theo tên…" />
          <CommandList className="max-h-64">
            <CommandEmpty>Không tìm thấy.</CommandEmpty>
            <CommandGroup>{users.map((u) => (
              <CommandItem key={u.id} value={`${u.full_name} ${u.id}`} onSelect={() => { onChange(u.id); setOpen(false); }} className="py-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">{initials(u.full_name)}</span>
                <span className="flex-1 truncate">{u.full_name}</span>
                {u.id === value && <Check className="h-4 w-4" />}
              </CommandItem>
            ))}</CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
const initials = (n: string) => n.trim().split(/\s+/).slice(-2).map((w) => w[0]?.toUpperCase() ?? "").join("");

export type Img = { id: string; path: string; category: string; caption: string | null };

/** Ảnh tham khảo của một sản phẩm. editable = còn là bản nháp của người tạo. onAdd tải từng ảnh một (để báo tiến trình và thử lại riêng ảnh lỗi). */
export function ItemImages({ images, editable, onAdd, onChanged }: { images: Img[]; editable?: boolean; onAdd?: (file: File, category: string) => Promise<void>; onChanged?: () => void }) {
  const urls = useSignedUrls(images.map((i) => i.path));
  const [zoom, setZoom] = useState<Img | null>(null);
  const [cat, setCat] = useState("product");
  const [prog, setProg] = useState<{ done: number; total: number } | null>(null);
  const [failed, setFailed] = useState<{ file: File; cat: string; msg: string }[]>([]);
  const upload = async (list: { file: File; cat: string }[]) => {
    if (!list.length || !onAdd) return;
    const bad: typeof failed = [];
    setProg({ done: 0, total: list.length });
    for (let i = 0; i < list.length; i++) {
      try { await onAdd(list[i].file, list[i].cat); } catch (e: any) { bad.push({ ...list[i], msg: e.message }); }
      setProg({ done: i + 1, total: list.length });
    }
    setProg(null); setFailed(bad);
    if (bad.length) toast.error(`${bad.length} ảnh chưa tải được — bấm Thử lại.`);
    if (bad.length < list.length) onChanged?.();
  };
  const pick = (fl: FileList | null) => fl?.length && upload(Array.from(fl).map((file) => ({ file, cat })));
  const busy = !!prog;
  return (
    <div className="space-y-2">
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((im) => (
            <div key={im.id} className="min-w-0 space-y-1">
              <button type="button" onClick={() => setZoom(im)} className="block aspect-square w-full overflow-hidden rounded-md border bg-muted">
                {urls[im.path] ? <img src={urls[im.path] ?? undefined} alt={im.caption ?? IMG_CAT[im.category]} loading="lazy" decoding="async" className="h-full w-full object-cover" /> : null}
              </button>
              <div className="text-[11px] text-muted-foreground truncate">{IMG_CAT[im.category]}</div>
              {editable ? <CaptionEdit im={im} onChanged={onChanged} /> : im.caption && <div className="text-xs line-clamp-2">{im.caption}</div>}
            </div>
          ))}
        </div>
      )}
      {editable && (
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="col-span-2 h-10 sm:h-9 sm:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(IMG_CAT).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
          </Select>
          <Button type="button" variant="outline" className="h-10 sm:h-9" disabled={busy} asChild>
            <label className="cursor-pointer"><ImagePlus className="h-4 w-4 mr-1" />Thư viện<input type="file" accept="image/*" multiple hidden disabled={busy} onChange={(e) => { pick(e.target.files); e.target.value = ""; }} /></label>
          </Button>
          <Button type="button" variant="outline" className="h-10 sm:h-9" disabled={busy} asChild>
            <label className="cursor-pointer"><Camera className="h-4 w-4 mr-1" />Chụp ảnh<input type="file" accept="image/*" capture="environment" hidden disabled={busy} onChange={(e) => { pick(e.target.files); e.target.value = ""; }} /></label>
          </Button>
        </div>
      )}
      {prog && (
        <div className="space-y-1"><Progress value={(prog.done / prog.total) * 100} className="h-1.5" />
          <div className="text-xs text-muted-foreground">Đang tải ảnh {Math.min(prog.done + 1, prog.total)}/{prog.total}…</div></div>
      )}
      {failed.length > 0 && !busy && (
        <div className="rounded-md border border-destructive/40 p-2 text-xs space-y-1">
          <div>{failed.length} ảnh chưa tải được: {failed[0].msg}</div>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" className="h-8" onClick={() => upload(failed.map(({ file, cat }) => ({ file, cat })))}><RotateCw className="h-3.5 w-3.5 mr-1" />Thử lại</Button>
            <Button type="button" size="sm" variant="ghost" className="h-8" onClick={() => setFailed([])}>Bỏ qua</Button>
          </div>
        </div>
      )}
      <Dialog open={!!zoom} onOpenChange={(o) => !o && setZoom(null)}>
        <DialogContent className="max-w-3xl w-[calc(100vw-1rem)] p-2">
          <DialogTitle className="sr-only">Xem ảnh</DialogTitle>
          {zoom && urls[zoom.path] && <img src={urls[zoom.path] ?? undefined} alt={zoom.caption ?? undefined} className="max-h-[80dvh] w-full object-contain" />}
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
      <Input value={v} onChange={(e) => setV(e.target.value)} placeholder="Chú thích" className="h-8 text-xs px-2"
        onBlur={() => v !== (im.caption ?? "") && oqApi.updateImage(im.id, im.category, v).then(onChanged).catch((e) => toast.error(e.message))} />
      <button type="button" aria-label="Xóa ảnh" className="p-1.5 text-destructive" onClick={() => confirm("Xóa ảnh này?") && oqApi.deleteImage(im.id).then(onChanged).catch((e) => toast.error(e.message))}><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}

