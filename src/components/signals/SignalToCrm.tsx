import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, RefreshCw, UserRoundPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Signal } from "@/lib/signals/catalog";

type Registration = { status: "created" | "linked" | "duplicate"; customer_id?: string };

export function SignalToCrm({
  signal,
  canPush,
  canOpenCrm,
}: {
  signal: Signal;
  canPush: boolean;
  canOpenCrm: boolean;
}) {
  const qc = useQueryClient();
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [duplicate, setDuplicate] = useState(false);
  const link = useQuery({
    queryKey: ["signal-crm-link", signal.id],
    retry: false,
    queryFn: async (): Promise<string | null> => {
      const { data, error } = await (supabase as any)
        .from("signal_crm_links")
        .select("customer_id")
        .eq("signal_id", signal.id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data?.customer_id ?? null;
    },
  });

  async function register() {
    if (!canPush || lock.current || link.isPending || link.isError || link.data) return;
    lock.current = true;
    setBusy(true);
    try {
      const { data, error } = await (supabase as any)
        .rpc("signal_crm_register", { _signal_id: signal.id });
      if (error) throw new Error(error.message);
      const result = data as Registration;
      if (result.status === "duplicate") {
        setDuplicate(true);
        toast.info("Khách đã có trong CRM");
        return;
      }
      if ((result.status === "created" || result.status === "linked") && result.customer_id) {
        qc.setQueryData(["signal-crm-link", signal.id], result.customer_id);
        await qc.invalidateQueries({ predicate: q => String(q.queryKey[0]).startsWith("crm_") || q.queryKey[0] === "sig:hist" });
        toast.success(result.status === "created" ? "Đã lưu khách vào CRM" : "Khách đã được lưu vào CRM");
        return;
      }
      throw new Error("CRM trả về kết quả không hợp lệ.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể đưa khách vào CRM.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  if (!canPush && !link.data) return null;
  if (link.isPending) {
    return <Button className="h-12 w-full" variant="outline" disabled>Đang kiểm tra CRM…</Button>;
  }
  if (link.isError) {
    return <Button className="min-h-12 w-full" variant="outline" onClick={() => void link.refetch()}>
      <RefreshCw className="mr-2 h-4 w-4" />Thử kiểm tra CRM lại
    </Button>;
  }
  if (link.data) {
    return <div className="rounded-md border p-2 space-y-2">
      <p className="flex items-center gap-2 text-sm font-medium"><CheckCircle2 className="h-4 w-4 text-green-600" />Đã lưu vào CRM</p>
      {canOpenCrm && <Button asChild variant="outline" className="min-h-11 w-full">
        <a href={`/biz/crm?customer=${link.data}`}>Mở hồ sơ CRM</a>
      </Button>}
      {!canOpenCrm && <p className="text-xs text-muted-foreground">Sale phụ trách sẽ quản lý và phân loại trong CRM.</p>}
    </div>;
  }
  if (duplicate) {
    return <p role="status" className="rounded-md border p-3 text-sm font-medium">Khách đã có trong CRM</p>;
  }
  return <Button className="h-12 w-full" variant="outline" disabled={!canPush || busy} onClick={() => void register()}>
    <UserRoundPlus className="mr-2 h-4 w-4" />
    {busy ? "Đang lưu vào CRM…" : "Lưu vào CRM Khách hàng"}
  </Button>;
}
