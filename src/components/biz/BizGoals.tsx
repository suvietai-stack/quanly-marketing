import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, ChevronDown, ChevronUp, Eye, History, PencilLine, RefreshCw, Save, Send, Target, Trash2 } from 'lucide-react';
import { useAuth, useCurrentUser } from '@/lib/auth';
import { bizDepartmentsQuery, bizMembersQuery } from '@/lib/biz/queries';
import { bizGoalsQuery, bizGoalEventsQuery, bizGoalDeadlineQuery, useGoalAction } from '@/lib/biz/goalQueries';
import { allocatedText, allocationMatches, allocationPercent, differenceText, displayVersion, draftDeletable, fmtGoal, fmtQuarter, goalState, STATE_LABELS, STATUS_LABELS, validValue, type AnnualGoal, type GoalItem, type GoalState, type GoalVersion } from '@/lib/biz/goals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { BizRollingPlan } from './BizRollingPlan';
const dateText = (v: string) => new Date(v).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
const STATE_BADGE: Record<GoalState, 'default' | 'secondary' | 'outline' | 'destructive'> = { none: 'outline', draft: 'outline', pending: 'secondary', changes: 'secondary', approved: 'default', adjusting: 'secondary' };

export function BizGoals({scopeDepartmentIds}:{scopeDepartmentIds?:string[]}={}) {
 const uid = useAuth(s => s.currentUserId) ?? ''; const me = useAuth(s => s.users.find(u => u.id === s.currentUserId));
 const { can } = useCurrentUser(); const [year, setYear] = useState(() => Number(new Intl.DateTimeFormat('en', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric' }).format(new Date())));
 const goals = useQuery({ ...bizGoalsQuery(uid, year), enabled: !!uid }); const members = useQuery(bizMembersQuery); const departments = useQuery(bizDepartmentsQuery); const deadline = useQuery({ ...bizGoalDeadlineQuery(uid, year), enabled: !!uid }); const action = useGoalAction();
 const scopedGoals=(goals.data??[]).filter(g=>!scopeDepartmentIds || scopeDepartmentIds.includes(g.department_id));
 const own = scopedGoals.find(g => g.user_id === uid);
 const membership = members.data?.find(m => m.user_id === uid && !m.ended_at); const dept = departments.data?.find(d => d.id === membership?.department_id && (!scopeDepartmentIds || scopeDepartmentIds.includes(d.id)));
 const canManage = can('biz.view_dept') || can('biz.view_all') || can('biz.goal_approve');
 const start = async () => { try { await action.mutateAsync({ kind: 'start', year }); toast.success('Đã tạo bản nháp mục tiêu năm.'); } catch (e) { toast.error(e instanceof Error ? e.message : String(e)); } };
 return <div className="space-y-6 pb-32 sm:pb-8">
  <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
   <div className="flex items-center gap-3"><Label htmlFor="goal-year">Năm</Label><Input id="goal-year" type="number" min={2000} max={2200} className="w-28" value={year} onChange={e => { const y = Number(e.target.value); if (y >= 2000 && y <= 2200) setYear(y); }} /><Button variant="ghost" size="icon" aria-label="Làm mới mục tiêu" onClick={() => goals.refetch()}><RefreshCw className="h-4 w-4" /></Button></div>
   <div className="text-sm text-muted-foreground">Hạn gửi: {deadline.data ? `${dateText(deadline.data)} (giờ Việt Nam)` : 'Chưa quy định'}</div>
  </div>
  {goals.isPending && <p>Đang tải mục tiêu…</p>}{goals.error && <p role="alert" className="text-destructive">Không tải được mục tiêu: {goals.error.message}</p>}
  {!goals.isPending && <section className="space-y-4">
   <h2 className="text-base font-semibold">Mục tiêu KR của tôi</h2>
   {own ? <MyGoalCard goal={own} uid={uid} /> : <div className="rounded-xl border bg-card p-6 space-y-3"><Target className="h-9 w-9 text-primary" /><h3 className="text-lg font-semibold">{me?.fullName} · Mục tiêu {year}</h3><p className="text-muted-foreground text-sm">{dept ? dept.name : 'Chưa được phân vào phòng kinh doanh đang hoạt động.'}</p>{can('biz.goal_submit') && <Button onClick={start} disabled={!dept?.active || action.isPending}><Target className="h-4 w-4 mr-2" />Lập mục tiêu năm</Button>}</div>}
  </section>}
  {canManage && !goals.isPending && <ManageSection goals={scopedGoals} year={year} uid={uid} memberCount={new Set((members.data ?? []).filter(m => !m.ended_at && (!scopeDepartmentIds || scopeDepartmentIds.includes(m.department_id))).map(m => m.user_id)).size} />}
 </div>;
}

/** Thẻ tổng quan mục tiêu cá nhân: bảng chỉ đọc Năm × 4 Quý, thao tác theo trạng thái, khu vực bản nháp thu gọn. */
function MyGoalCard({ goal, uid }: { goal: AnnualGoal; uid: string }) {
 const { can } = useCurrentUser(); const action = useGoalAction();
 const [detail, setDetail] = useState(false); const [history, setHistory] = useState(false); const [adjust, setAdjust] = useState(false); const [reason, setReason] = useState(''); const [editing, setEditing] = useState<string | null>(null); const [deleting, setDeleting] = useState<GoalVersion | null>(null); const [draftsOpen, setDraftsOpen] = useState(false);
 const state = goalState(goal); const shown = displayVersion(goal);
 const editable = goal.user_id === uid && can('biz.goal_submit') ? goal.versions.find(v => ['draft', 'changes'].includes(v.status)) : undefined;
 const drafts = goal.versions.filter(v => v.id !== goal.official_version_id && ['draft', 'changes'].includes(v.status));
 const allApproved = goal.versions.length > 0 && goal.versions.every(v => v.status === 'approved');
 const remove = async () => { if (!deleting) return; try { await action.mutateAsync({ kind: 'delete', id: deleting.id }); toast.success('Đã xóa bản nháp.'); setDeleting(null); } catch (e) { toast.error(e instanceof Error ? e.message : String(e)); } };
 return <div className="space-y-4">
  <div className="rounded-xl border bg-card overflow-hidden">
   <div className="flex flex-wrap items-center justify-between gap-2 p-4 border-b">
    <div className="min-w-0"><h3 className="font-semibold">Mục tiêu KR năm {goal.year}</h3><p className="text-xs text-muted-foreground">{goal.department_name} · Cập nhật {dateText(shown.updated_at)}</p></div>
    <Badge variant={STATE_BADGE[state]}>{STATE_LABELS[state]}</Badge>
   </div>
   <GoalSummaryTable version={shown} />
   {shown.review_comment && state === 'changes' && <p className="px-4 py-3 text-sm border-t border-l-2 border-l-destructive break-words">Nhận xét của người duyệt: {shown.review_comment}</p>}
   <div className="flex flex-wrap gap-2 p-4 border-t">
    <Button size="sm" variant="outline" onClick={() => setDetail(true)}><Eye className="h-4 w-4 mr-2" />Xem chi tiết 12 tháng</Button>
    {editable && <Button size="sm" onClick={() => setEditing(editable.id)}><PencilLine className="h-4 w-4 mr-2" />{editable.status === 'changes' ? 'Chỉnh sửa và nộp lại' : 'Tiếp tục chỉnh sửa'}</Button>}
    <Button size="sm" variant="outline" onClick={() => setHistory(true)}><History className="h-4 w-4 mr-2" />Xem lịch sử</Button>
    {goal.user_id === uid && can('biz.goal_submit') && allApproved && <Button size="sm" variant="outline" onClick={() => setAdjust(true)}>Yêu cầu điều chỉnh</Button>}
   </div>
  </div>
  {drafts.length > 0 && <div className="rounded-xl border bg-card">
   <button type="button" className="flex w-full items-center justify-between gap-2 p-4 text-left" onClick={() => setDraftsOpen(o => !o)} aria-expanded={draftsOpen}>
    <span className="font-medium text-sm">Bản nháp ({drafts.length})</span>{draftsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
   </button>
   {draftsOpen && <div className="border-t divide-y">{drafts.map(v => <div key={v.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
    <div className="min-w-0 text-sm"><p className="font-medium">Bản {v.version} · {v.reason ? 'Điều chỉnh' : 'Lập mới'}</p><p className="text-xs text-muted-foreground">{STATUS_LABELS[v.status]} · Cập nhật {dateText(v.updated_at)}</p>{v.review_comment && <p className="text-xs break-words mt-1">Nhận xét: {v.review_comment}</p>}</div>
    <div className="flex flex-wrap gap-2">
     {goal.user_id === uid && can('biz.goal_submit') && <Button size="sm" variant="outline" onClick={() => setEditing(v.id)}><PencilLine className="h-4 w-4 mr-2" />Tiếp tục chỉnh sửa</Button>}
     {draftDeletable(v) && (goal.user_id === uid || can('biz.view_all')) && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleting(v)}><Trash2 className="h-4 w-4 mr-2" />Xóa bản nháp</Button>}
    </div>
   </div>)}</div>}
  </div>}
  <Dialog open={detail} onOpenChange={setDetail}><DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>Chi tiết mục tiêu {goal.year} · {STATUS_LABELS[shown.status]}</DialogTitle></DialogHeader><GoalDetailView version={shown} /></DialogContent></Dialog>
  <Dialog open={!!editing} onOpenChange={open => !open && setEditing(null)}><DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Chỉnh sửa mục tiêu {goal.year}</DialogTitle></DialogHeader>{editing && (() => { const v = goal.versions.find(x => x.id === editing); return v ? <GoalEditor key={`${v.id}-${v.revision}`} version={v} canEdit canReview={false} /> : null; })()}</DialogContent></Dialog>
  <Dialog open={adjust} onOpenChange={setAdjust}><DialogContent><DialogHeader><DialogTitle>Điều chỉnh mục tiêu năm</DialogTitle></DialogHeader><Label htmlFor="adjust-reason">Lý do điều chỉnh</Label><Textarea id="adjust-reason" value={reason} onChange={e => setReason(e.target.value)} /><Button disabled={!reason.trim() || action.isPending} onClick={async () => { try { await action.mutateAsync({ kind: 'start', year: goal.year, reason }); setAdjust(false); toast.success('Đã tạo bản điều chỉnh. Bản chính thức vẫn được giữ nguyên.'); } catch (e) { toast.error(e instanceof Error ? e.message : String(e)); } }}>Tạo bản điều chỉnh</Button></DialogContent></Dialog>
  <Dialog open={!!deleting} onOpenChange={open => !open && setDeleting(null)}><DialogContent><DialogHeader><DialogTitle>Xóa bản nháp mục tiêu {goal.year}</DialogTitle></DialogHeader>{deleting && <div className="space-y-3 text-sm"><p>Bạn sắp xóa <strong>bản nháp {deleting.version} ({deleting.reason ? 'điều chỉnh' : 'lập mới'})</strong> của năm {goal.year}.</p><p className="text-destructive">Nội dung chưa gửi duyệt sẽ bị mất và không khôi phục được.{goal.official_version_id ? ' Mục tiêu chính thức hiện hành được giữ nguyên.' : ''}</p><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDeleting(null)}>Giữ lại</Button><Button variant="destructive" disabled={action.isPending} onClick={remove}>Xác nhận xóa</Button></div></div>}</DialogContent></Dialog>
  <BizRollingPlan goal={goal} uid={uid} />
  {history && <GoalHistory goal={goal} uid={uid} onClose={() => setHistory(false)} onVersion={() => setHistory(false)} />}
 </div>;
}

/** Bảng tổng quan chỉ đọc: KR × Mục tiêu năm × 4 Quý. */
function GoalSummaryTable({ version }: { version: GoalVersion }) {
 if (!version.items.length) return <p className="p-4 text-sm text-muted-foreground">Chưa có chỉ số KR.</p>;
 return <>
  <div className="hidden sm:block overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="p-3 font-medium">KR</th><th className="p-3 font-medium text-right">Mục tiêu năm</th>{[0, 1, 2, 3].map(q => <th key={q} className="p-3 font-medium text-right">Quý {q + 1}</th>)}</tr></thead><tbody>{version.items.map(item => <tr key={item.metric_id} className="border-b last:border-0"><td className="p-3"><span className="font-medium">{item.definition.name}</span> <span className="text-xs text-muted-foreground">({item.definition.unit})</span></td><td className="p-3 text-right tabular-nums font-medium text-primary">{fmtGoal(item.annual)}</td>{[0, 1, 2, 3].map(q => <td key={q} className="p-3 text-right tabular-nums">{fmtQuarter(item, q)}</td>)}</tr>)}</tbody></table></div>
  <div className="sm:hidden divide-y">{version.items.map(item => <div key={item.metric_id} className="p-4 space-y-2"><div className="flex flex-wrap items-center justify-between gap-2"><span className="font-medium text-sm">{item.definition.name} <span className="text-xs text-muted-foreground">({item.definition.unit})</span></span><span className="text-sm font-medium text-primary tabular-nums">Năm: {fmtGoal(item.annual)}</span></div><div className="grid grid-cols-2 gap-2 text-xs">{[0, 1, 2, 3].map(q => <div key={q} className="flex justify-between gap-2 rounded-md bg-accent/40 px-2 py-1.5"><span className="text-muted-foreground">Quý {q + 1}</span><span className="tabular-nums font-medium">{fmtQuarter(item, q)}</span></div>)}</div></div>)}</div>
 </>;
}

/** Chi tiết 12 tháng ở chế độ đọc: desktop 4 Quý × 3 tháng, mobile từng Quý thu gọn. Không dùng ô nhập. */
function GoalDetailView({ version }: { version: GoalVersion }) {
 return <div className="space-y-4">{version.items.map(item => <section key={item.metric_id} className="border rounded-lg bg-card overflow-hidden">
  <div className="p-4 border-b flex flex-wrap items-center justify-between gap-2"><div className="min-w-0"><h3 className="font-semibold text-sm">{item.definition.name}</h3><p className="text-xs text-muted-foreground">{item.definition.unit} · {item.definition.aggregation === 'sum' ? 'Cộng dồn' : 'Bình quân'}</p></div><span className="text-sm font-medium text-primary tabular-nums">Năm: {fmtGoal(item.annual)}</span></div>
  <div className="hidden sm:grid sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map(q => <div key={q} className="p-4 border-b sm:border-r"><div className="flex justify-between gap-2 text-sm mb-2"><strong>Quý {q + 1}</strong><span className="text-primary tabular-nums">{fmtQuarter(item, q)}</span></div><div className="space-y-1 text-sm">{[0, 1, 2].map(o => { const m = q * 3 + o; return <div key={m} className="flex justify-between gap-2"><span className="text-muted-foreground">Tháng {m + 1}</span><span className="tabular-nums">{fmtGoal(item.months[m] ?? null)}</span></div>; })}</div></div>)}</div>
  <div className="sm:hidden divide-y">{[0, 1, 2, 3].map(q => <details key={q} className="group"><summary className="flex items-center justify-between gap-2 p-3 text-sm cursor-pointer list-none"><span><strong>Quý {q + 1}</strong> <span className="text-primary tabular-nums">{fmtQuarter(item, q)}</span></span><ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /></summary><div className="px-3 pb-3 space-y-1 text-sm">{[0, 1, 2].map(o => { const m = q * 3 + o; return <div key={m} className="flex justify-between gap-2"><span className="text-muted-foreground">Tháng {m + 1}</span><span className="tabular-nums">{fmtGoal(item.months[m] ?? null)}</span></div>; })}</div></details>)}</div>
 </section>)}</div>;
}

/** Khu vực quản lý: thống kê nhanh, bộ lọc và danh sách nhân sự trong phạm vi. */
function ManageSection({ goals, year, uid, memberCount }: { goals: AnnualGoal[]; year: number; uid: string; memberCount: number }) {
 const [search, setSearch] = useState(''); const [deptFilter, setDeptFilter] = useState('all'); const [stateFilter, setStateFilter] = useState<GoalState | 'all'>('all'); const [viewing, setViewing] = useState<AnnualGoal | null>(null); const [historyGoal, setHistoryGoal] = useState<AnnualGoal | null>(null);
 const stats = useMemo(() => { const states = goals.map(goalState); return { total: memberCount || goals.length, done: goals.length, missing: Math.max(0, (memberCount || goals.length) - goals.length), pending: states.filter(s => s === 'pending').length, approved: states.filter(s => s === 'approved').length, changes: states.filter(s => s === 'changes' || s === 'adjusting').length }; }, [goals, memberCount]);
 const deptNames = useMemo(() => [...new Set(goals.map(g => g.department_name))].sort(), [goals]);
 const filtered = goals.filter(g => (stateFilter === 'all' || goalState(g) === stateFilter) && (deptFilter === 'all' || g.department_name === deptFilter) && (!search.trim() || g.employee_name.toLowerCase().includes(search.trim().toLowerCase())));
 const cards: { key: GoalState | 'all' | 'missing'; label: string; value: number }[] = [{ key: 'all', label: 'Tổng nhân sự cần lập', value: stats.total }, { key: 'all', label: 'Đã lập', value: stats.done }, { key: 'missing', label: 'Chưa lập', value: stats.missing }, { key: 'pending', label: 'Chờ duyệt', value: stats.pending }, { key: 'approved', label: 'Đã duyệt hoàn tất', value: stats.approved }, { key: 'changes', label: 'Cần chỉnh sửa', value: stats.changes }];
 return <section className="space-y-4 border-t pt-5">
  <h2 className="text-base font-semibold">Mục tiêu KR trong phạm vi quản lý</h2>
  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2">{cards.map((c, i) => <button key={`${c.label}-${i}`} type="button" onClick={() => setStateFilter(c.key === 'all' || c.key === 'missing' ? 'all' : c.key)} className={`rounded-xl border bg-card p-3 text-left transition-colors ${stateFilter !== 'all' && c.key === stateFilter ? 'ring-2 ring-primary' : ''}`}><p className="text-xs text-muted-foreground">{c.label}</p><p className="text-xl font-semibold tabular-nums">{c.value}</p></button>)}</div>
  <div className="flex flex-wrap gap-2">
   <Input placeholder="Tìm theo tên nhân viên…" value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:w-64" />
   <Select value={deptFilter} onValueChange={setDeptFilter}><SelectTrigger className="w-full sm:w-56"><SelectValue placeholder="Tất cả phòng ban" /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả phòng ban</SelectItem>{deptNames.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
   <Select value={stateFilter} onValueChange={v => setStateFilter(v as GoalState | 'all')}><SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Mọi trạng thái" /></SelectTrigger><SelectContent><SelectItem value="all">Mọi trạng thái</SelectItem>{(['draft', 'pending', 'changes', 'approved', 'adjusting'] as GoalState[]).map(s => <SelectItem key={s} value={s}>{STATE_LABELS[s]}</SelectItem>)}</SelectContent></Select>
  </div>
  {!filtered.length && <p className="text-sm text-muted-foreground">Không có mục tiêu phù hợp bộ lọc.</p>}
  <div className="hidden md:block rounded-xl border bg-card overflow-hidden"><table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="p-3 font-medium">Nhân viên</th><th className="p-3 font-medium">Phòng</th><th className="p-3 font-medium">Năm</th><th className="p-3 font-medium">Trạng thái</th><th className="p-3 font-medium text-right">Thao tác</th></tr></thead><tbody>{filtered.map(g => { const s = goalState(g); return <tr key={g.id} className="border-b last:border-0"><td className="p-3 font-medium">{g.employee_name}</td><td className="p-3">{g.department_name}</td><td className="p-3 tabular-nums">{g.year}</td><td className="p-3"><Badge variant={STATE_BADGE[s]}>{STATE_LABELS[s]}</Badge></td><td className="p-3"><div className="flex justify-end gap-1"><Button size="sm" variant="ghost" onClick={() => setViewing(g)}><Eye className="h-4 w-4 mr-1" />Xem</Button><Button size="sm" variant="ghost" onClick={() => setHistoryGoal(g)}><History className="h-4 w-4 mr-1" />Lịch sử</Button>{s === 'pending' && <Button size="sm" variant="ghost" asChild><Link to="/biz/approvals">Duyệt</Link></Button>}</div></td></tr>; })}</tbody></table></div>
  <div className="md:hidden space-y-2">{filtered.map(g => { const s = goalState(g); return <div key={g.id} className="rounded-xl border bg-card p-4 space-y-2"><div className="flex items-center justify-between gap-2"><div className="min-w-0"><p className="font-medium text-sm truncate">{g.employee_name}</p><p className="text-xs text-muted-foreground">{g.department_name} · {g.year}</p></div><Badge variant={STATE_BADGE[s]}>{STATE_LABELS[s]}</Badge></div><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => setViewing(g)}><Eye className="h-4 w-4 mr-1" />Xem</Button><Button size="sm" variant="outline" onClick={() => setHistoryGoal(g)}><History className="h-4 w-4 mr-1" />Lịch sử</Button>{s === 'pending' && <Button size="sm" variant="outline" asChild><Link to="/biz/approvals">Duyệt</Link></Button>}</div></div>; })}</div>
  <Dialog open={!!viewing} onOpenChange={open => !open && setViewing(null)}><DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">{viewing && (() => { const v = displayVersion(viewing); return <><DialogHeader><DialogTitle>{viewing.employee_name} · Mục tiêu {viewing.year} · {STATE_LABELS[goalState(viewing)]}</DialogTitle></DialogHeader><div className="space-y-4"><GoalSummaryTable version={v} /><GoalDetailView version={v} /><BizRollingPlan goal={viewing} uid={uid}/></div></>; })()}</DialogContent></Dialog>
  {historyGoal && <GoalHistory goal={historyGoal} uid={uid} onClose={() => setHistoryGoal(null)} onVersion={() => setHistoryGoal(null)} />}
 </section>;
}

function NumberField({ value, onChange, disabled, label }: { value: string | null; onChange: (v: string | null) => void; disabled: boolean; label: string }) { return <Input aria-label={label} inputMode="numeric" value={value === null ? '' : fmtGoal(value)} disabled={disabled} onChange={e => { const raw = e.target.value.replace(/[.,\s]/g, ''); if (!raw) onChange(null); else if (validValue(raw)) onChange(BigInt(raw).toString()); }} className="text-right tabular-nums min-w-0" />; }
function GoalEditor({ version, canEdit, canReview }: { version: GoalVersion; canEdit: boolean; canReview: boolean }) {
 const [items, setItems] = useState<GoalItem[]>(() => structuredClone(version.items)); const [quarter, setQuarter] = useState('0'); const [comment, setComment] = useState(''); const action = useGoalAction(); const valid = items.length > 0 && items.every(allocationMatches); const dirty = JSON.stringify(items) !== JSON.stringify(version.items);
 const update = (index: number, month: number | null, value: string | null) => setItems(current => current.map((item, n) => n !== index ? item : month === null ? { ...item, annual: value } : { ...item, months: item.months.map((v, m) => m === month ? value : v) }));
 const save = async (submit: boolean) => { try { await action.mutateAsync({ kind: 'save', id: version.id, revision: version.revision, items, submit }); toast.success(submit ? 'Đã gửi mục tiêu chờ duyệt.' : 'Đã lưu nháp.'); } catch (e) { toast.error(e instanceof Error ? e.message : String(e)); } };
 return <div className="space-y-5">
  <Tabs value={quarter} onValueChange={setQuarter} className="sm:hidden"><TabsList className="grid w-full grid-cols-4">{[0, 1, 2, 3].map(q => <TabsTrigger key={q} value={String(q)}>Quý {q + 1}</TabsTrigger>)}</TabsList></Tabs>
  {items.map((item, index) => <section key={item.metric_id} className="border rounded-lg bg-card overflow-hidden">
   <div className="p-4 border-b space-y-3"><div className="flex flex-wrap items-center justify-between gap-3"><div className="min-w-0"><h3 className="font-semibold">{item.definition.name}</h3><p className="text-xs text-muted-foreground break-words">{item.definition.description}</p><Badge variant="outline" className="mt-2">{item.definition.unit} · {item.definition.aggregation === 'sum' ? 'Cộng dồn' : 'Bình quân'}</Badge></div><div className="w-full sm:w-56 space-y-1"><Label>Mục tiêu năm</Label><NumberField value={item.annual} label={`Mục tiêu năm ${item.definition.name}`} disabled={!canEdit} onChange={v => update(index, null, v)} /></div></div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm"><div><p className="text-muted-foreground text-xs">Mục tiêu năm</p><strong className="break-all">{fmtGoal(item.annual)}</strong></div><div><p className="text-muted-foreground text-xs">{item.definition.aggregation === 'sum' ? 'Tổng đã phân bổ' : 'Bình quân đã phân bổ'}</p><strong className="break-all">{allocatedText(item)}</strong></div><div><p className="text-muted-foreground text-xs">Chênh lệch</p><strong className="break-all">{differenceText(item)}</strong></div><div><p className="text-muted-foreground text-xs">Tỷ lệ đã phân bổ</p><strong>{allocationPercent(item)}</strong></div></div>
   </div>
   <div className="grid sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map(q => <div key={q} className={`p-4 border-b sm:border-r ${q === Number(quarter) ? '' : 'hidden sm:block'}`}><div className="flex justify-between gap-2 text-sm mb-3"><strong>Quý {q + 1}</strong><span className="text-primary tabular-nums break-all">{fmtQuarter(item, q)}</span></div><div className="space-y-3">{[0, 1, 2].map(offset => { const month = q * 3 + offset; return <div key={month} className="space-y-1"><Label className="text-xs">Tháng {month + 1}</Label><NumberField label={`${item.definition.name} tháng ${month + 1}`} value={item.months[month] ?? null} disabled={!canEdit} onChange={v => update(index, month, v)} /></div>; })}</div></div>)}</div>
   {!allocationMatches(item) && canEdit && <p className="px-4 py-3 text-sm text-destructive" role="alert">{item.annual === null || item.months.some(v => v === null) ? 'Chưa nhập đủ mục tiêu năm và 12 tháng. Có thể lưu nháp.' : 'Phân bổ tháng chưa khớp mục tiêu năm.'}</p>}
  </section>)}
  {canEdit && <div className="flex flex-wrap items-center gap-2 border-t pt-4"><Button variant="outline" disabled={action.isPending} onClick={() => save(false)}><Save className="h-4 w-4 mr-2" />Lưu nháp</Button><Button disabled={!valid || action.isPending} onClick={() => save(true)}><Send className="h-4 w-4 mr-2" />Gửi duyệt</Button><Button variant="ghost" disabled={!dirty || action.isPending} onClick={() => setItems(structuredClone(version.items))}>Hủy chỉnh sửa chưa lưu</Button>{dirty && <span className="text-xs text-muted-foreground">Có thay đổi chưa lưu</span>}</div>}
  {canReview && <div className="border-t pt-4 space-y-3"><Label htmlFor="goal-review">Nhận xét</Label><Textarea id="goal-review" value={comment} onChange={e => setComment(e.target.value)} /><div className="flex flex-wrap gap-2">{[true, false].map(approve => <Button key={String(approve)} variant={approve ? 'default' : 'outline'} disabled={action.isPending || (!approve && !comment.trim())} onClick={async () => { try { await action.mutateAsync({ kind: 'decide', id: version.id, revision: version.revision, approve, comment }); toast.success(approve ? 'Đã duyệt mục tiêu.' : 'Đã yêu cầu chỉnh sửa.'); } catch (e) { toast.error(e instanceof Error ? e.message : String(e)); } }}>{approve && <Check className="h-4 w-4 mr-2" />}{approve ? 'Duyệt mục tiêu' : 'Yêu cầu chỉnh sửa'}</Button>)}</div></div>}
 </div>;
}
function GoalHistory({ goal, uid, onClose }: { goal: AnnualGoal; uid: string; onClose: () => void; onVersion: (id: string) => void }) {
 const events = useQuery(bizGoalEventsQuery(uid, goal.id)); const users = useAuth(s => s.users); const [snapshotId, setSnapshotId] = useState(''); const labels: Record<string, string> = { created: 'Tạo phiên bản', saved: 'Lưu nháp', submitted: 'Gửi duyệt', approved: 'Duyệt', returned: 'Yêu cầu chỉnh sửa' };
 return <Dialog open onOpenChange={open => !open && onClose()}><DialogContent className="max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>Lịch sử mục tiêu {goal.year}</DialogTitle></DialogHeader>
  {events.isPending && <p>Đang tải…</p>}{events.error && <p role="alert">Không tải được lịch sử.</p>}
  {events.data?.map(e => <div key={e.id} className="border-b pb-3 text-sm space-y-1">
   <div className="font-medium">{labels[e.action] ?? e.action} · {users.find(u => u.id === e.actor_id)?.fullName ?? 'Nhân viên'}</div>
   <div className="text-xs text-muted-foreground">{dateText(e.created_at)}</div>
   {e.comment && <p className="break-words">{e.comment}</p>}
   {Array.isArray(e.payload) && <Button variant="link" size="sm" onClick={() => setSnapshotId(snapshotId === e.id ? '' : e.id)}>Dữ liệu tại lần {e.action === 'submitted' ? 'gửi' : 'lưu'} này</Button>}
   {snapshotId === e.id && Array.isArray(e.payload) && (e.payload as unknown as GoalItem[]).map(item => <div key={item.metric_id} className="py-2 space-y-2">
    <strong>{goal.versions.find(v => v.id === e.version_id)?.items.find(i => i.metric_id === item.metric_id)?.definition.name} · Năm: {fmtGoal(item.annual)}</strong>
    <div className="grid grid-cols-2 gap-2 text-xs">{item.months.map((value, m) => <div key={m} className="break-all">Tháng {m + 1}: {fmtGoal(value)}</div>)}</div>
   </div>)}
  </div>)}
 </DialogContent></Dialog>;
}
