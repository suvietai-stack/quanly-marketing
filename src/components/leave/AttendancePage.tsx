import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, useCurrentUser } from "@/lib/auth";
import * as api from "@/lib/leave/api";
import * as attApi from "@/lib/leave/attApi";
import type { AttExplanation } from "@/lib/leave/attendance";
import { AttCard, AttDetail, AttForm, AttManage } from "./AttendanceUi";
import { LeaveReport } from "./LeaveReport";

function useNames() {
  const users = useAuth((s) => s.users);
  return useMemo(() => {
    const m = new Map(users.map((u) => [u.id, u.fullName || u.username]));
    return (id?: string | null) => (id ? m.get(id) || "—" : "—");
  }, [users]);
}

export function AttendancePage() {
  const { user, can } = useCurrentUser();
  const qc = useQueryClient();
  const name = useNames();
  const settingsQ = useQuery({ queryKey: ["leave", "settings"], queryFn: api.getSettings });
  const attQ = useQuery({ queryKey: ["leave", "att-list"], queryFn: attApi.listAtt, enabled: !!user });
  const atts = attQ.data || [];
  const uid = user?.id;

  const canCreate = can("att.create");
  const showMine = can("att.view_own") || canCreate;
  const showManage = can("att.view_all") || can("att.reconcile") || can("att.manage");
  const showReport = can("att.report");
  const initial = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const [attOpen, setAttOpen] = useState<string | null>(() => initial?.get("att") || null);
  const [attForm, setAttForm] = useState<null | { edit?: AttExplanation }>(null);
  const setAttO = (id: string | null) => {
    setAttOpen(id);
    const u = new URL(window.location.href);
    if (id) u.searchParams.set("att", id); else u.searchParams.delete("att");
    window.history.replaceState(null, "", u.toString());
  };
  const myAtts = atts.filter((a) => a.owner_id === uid);
  const witnessTodo = atts.filter((a) => a.witness_id === uid && a.owner_id !== uid && !a.recalled && a.witness_status === "pending");
  const showWitness = can("att.witness") || witnessTodo.length > 0;
  const [tab, setTab] = useState(() => initial?.get("tab") || (showMine ? "mine" : showWitness ? "witness" : showManage ? "manage" : "report"));

  const refresh = () => qc.invalidateQueries({ queryKey: ["leave"] });
  const settings = settingsQ.data;

  return (
    <>
      <PageHeader
        title="Giải trình chấm công"
        description="Giải trình quên chấm công — gửi, làm chứng và đối chiếu."
        actions={canCreate ? (
          <Button onClick={() => setAttForm({})} disabled={!settings}><Plus className="h-4 w-4 mr-1" />Tạo giải trình</Button>
        ) : undefined}
      />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto">
          {showMine && <TabsTrigger value="mine">Giải trình của tôi</TabsTrigger>}
          {showWitness && <TabsTrigger value="witness">Chờ tôi duyệt{witnessTodo.length > 0 && <span className="ml-1.5 rounded-full bg-primary text-primary-foreground text-[10px] px-1.5">{witnessTodo.length}</span>}</TabsTrigger>}
          {showManage && <TabsTrigger value="manage">Quản lý giải trình</TabsTrigger>}
          {showReport && <TabsTrigger value="report">Báo cáo</TabsTrigger>}
        </TabsList>
        {showMine && <TabsContent value="mine" className="mt-4">
          {attQ.isLoading ? <p className="text-sm text-muted-foreground py-6">Đang tải…</p> : !myAtts.length
            ? <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Bạn chưa có giải trình nào.</CardContent></Card>
            : <div className="space-y-2">{myAtts.map((a) => <AttCard key={a.id} a={a} name={name} showOwner={false} onOpen={setAttO} />)}</div>}
        </TabsContent>}
        {showWitness && <TabsContent value="witness" className="mt-4">
          {attQ.isLoading ? <p className="text-sm text-muted-foreground py-6">Đang tải…</p> : !witnessTodo.length
            ? <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Không có giải trình nào chờ bạn xác nhận làm chứng.</CardContent></Card>
            : <div className="space-y-2">{witnessTodo.map((a) => <AttCard key={a.id} a={a} name={name} showOwner onOpen={setAttO} />)}</div>}
        </TabsContent>}
        {showManage && <TabsContent value="manage" className="mt-4"><AttManage rows={atts} loading={attQ.isLoading} name={name} onOpen={setAttO} /></TabsContent>}
        {showReport && <TabsContent value="report" className="mt-4">
          <LeaveReport rows={[]} atts={atts} name={name} onOpenAtt={setAttO} mode="att" />
        </TabsContent>}
      </Tabs>

      {attOpen && <AttDetail id={attOpen} name={name} onClose={() => setAttO(null)} onChanged={refresh} onEdit={(a) => setAttForm({ edit: a })} />}
      {attForm && settings && <AttForm settings={settings} edit={attForm.edit} onClose={() => setAttForm(null)} onDone={(id) => { setAttForm(null); refresh(); if (id) setAttO(id); }} />}
    </>
  );
}
