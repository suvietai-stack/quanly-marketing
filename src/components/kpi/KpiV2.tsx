/** KPI V2 — UI ẩn (feature flag OFF mặc định, không có trong menu). Dữ liệu MOCK, không ghi production. */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { KPI_METRIC_LIST, getKpiMetric } from "@/lib/kpi/metrics";
import { createKpiService, isKpiV2Enabled, KpiError, ROLE_KPI_TEMPLATES, scopeOf, type KpiDb, type NewItem } from "@/lib/kpi/service";
import { cloudRepository, hydrateKpi, onCloudSync, flushKpi } from "@/lib/kpi/cloudRepository";
import { calculateKpiItem } from "@/lib/kpi/calculateKpi";
import { calculateVideoDesignItem } from "@/lib/kpi/calculateVideoDesign";
import { findNestedItems } from "@/lib/kpi/overview";
import type { EmployeeKpiItem, GoalStatus, KpiPeriodType } from "@/lib/kpi/types";

const svc = createKpiService(cloudRepository);
const inp = "h-9 rounded-md border border-input bg-background px-2 text-sm";
const btn = "h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-50";
const btn2 = "h-8 rounded-md border border-input px-2 text-xs";

export function useKpiDb() {
  const [db, setDb] = useState<KpiDb | null>(null);
  const refresh = () => setDb(svc.list());
  useEffect(() => { refresh(); return onCloudSync(() => refresh()); }, []);
  return { db, refresh };
}

/** Chỉ báo "thành công" sau khi cơ sở dữ liệu xác nhận; lỗi hiển thị rõ ràng. */
async function run(fn: () => void, ok: string, after: () => void): Promise<boolean> {
  try { fn(); await flushKpi(); toast.success(ok); after(); return true; }
  catch (e) { toast.error(e instanceof KpiError ? e.message : `Không lưu được: ${(e as Error).message ?? e}`); after(); return false; }
}

export function KpiV2Gate({ title, children }: { title: string; children: (actor: { id: string; isAdmin: boolean }) => ReactNode }) {
  const me = useAuth((s) => s.users.find((x) => x.id === s.currentUserId));
  const [state, setState] = useState<{ on: boolean; ready: boolean; error?: string } | null>(null);
  useEffect(() => {
    const on = isKpiV2Enabled();
    if (!on) { setState({ on, ready: false }); return; }
    (async () => {
      try {
        await hydrateKpi();
        setState({ on, ready: true });
      } catch (e) { setState({ on, ready: false, error: String((e as Error).message ?? e) }); }
    })();
  }, []);
  // Quyền hiển thị lấy từ role đã tải trong useAuth (role-super-admin / role-admin / tài khoản hệ thống).
  // Quyền GHI dữ liệu vẫn do RLS phía database kiểm soát — giao diện chỉ quyết định hiện/ẩn biểu mẫu.
  const isAdmin = !!me && (me.system || me.roleId === "role-super-admin" || me.roleId === "role-admin");
  if (!state) return <div className="p-8 text-sm text-muted-foreground">Đang tải…</div>;
  if (!state.on || !me) return <div className="p-8 text-sm text-muted-foreground">Trang không khả dụng.</div>;
  if (state.error) return <div className="p-8 text-sm text-destructive">Không tải được KPI: {state.error}</div>;
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      {children({ id: me.id, isAdmin })}
    </div>
  );
}

const today = () => new Date().toISOString().slice(0, 10);
function monthRange(d = new Date()) {
  const s = new Date(d.getFullYear(), d.getMonth(), 1), e = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const f = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  return [f(s), f(e)] as const;
}
function quarterRange(d = new Date()) {
  const q = Math.floor(d.getMonth() / 3);
  const s = new Date(d.getFullYear(), q * 3, 1), e = new Date(d.getFullYear(), q * 3 + 3, 0);
  const f = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  return [f(s), f(e)] as const;
}

