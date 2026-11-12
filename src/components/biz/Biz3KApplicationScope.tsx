import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { k3Error } from '@/lib/biz/k3';
import { applicationScopeRpc, k3ApplicationScopeQuery, type K3ApplicationDraft, type K3ApplicationScope } from '@/lib/biz/k3ApplicationScope';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function Biz3KApplicationScope() {
  const uid = useAuth(s => s.currentUserId) ?? '';
  const query = useQuery({ ...k3ApplicationScopeQuery(uid), enabled: !!uid });
  return <section className="space-y-3 border-b border-border pb-5 lg:col-span-2">
    <h3 className="font-medium">PHẠM VI ÁP DỤNG 3K</h3>
    {query.isPending && <p className="text-sm text-muted-foreground">Đang tải phạm vi áp dụng…</p>}
    {query.error && <div className="space-y-2"><p className="text-sm text-muted-foreground">Cấu hình chọn Khối chưa được kích hoạt; phạm vi hiện hành chưa thay đổi.</p><Button variant="outline" onClick={() => query.refetch()}>Tải lại</Button></div>}
    {query.data && <ScopeForm key={`${uid}:${query.data.revision}`} scope={query.data} />}
  </section>;
}

function ScopeForm({ scope }: { scope: K3ApplicationScope }) {
  const qc = useQueryClient();
  const [f, setF] = useState<K3ApplicationDraft>({ ...scope, reason: '', effective_from: scope.effective_from && scope.effective_from >= scope.today ? scope.effective_from : scope.today });
  const [preview, setPreview] = useState<{ employee_count: number } | null>(null);
  const [previewKey, setPreviewKey] = useState('');
  const change = (patch: Partial<K3ApplicationDraft>) => { setF(p => ({ ...p, ...patch })); setPreview(null); };
  const mutation = useMutation({
    mutationFn: async (mode: 'preview' | 'save') => {
      if (mode === 'save' && (!preview || previewKey !== JSON.stringify(f))) throw new Error('Cần kiểm tra phạm vi trước khi lưu.');
      return { mode, data: await applicationScopeRpc(mode, f) };
    },
    onSuccess: async ({ mode, data }) => {
      if (mode === 'preview') { setPreview(data as { employee_count: number }); setPreviewKey(JSON.stringify(f)); }
      else {
        toast.success('Đã lưu phạm vi áp dụng 3K.');
        await qc.invalidateQueries({ predicate: q => String(q.queryKey[0]).startsWith('k3_') });
        await useAuth.getState().reload();
      }
    },
    onError: e => toast.error(k3Error(e)),
  });
  return <div className="max-w-2xl space-y-4">
    <label className="flex items-center justify-between gap-3 text-sm"><span>Áp dụng cho tất cả các khối</span><Switch checked={f.applies_all_blocks} disabled={mutation.isPending} onCheckedChange={value => change({ applies_all_blocks: value, applies_unassigned: value })} /></label>
    <div className="space-y-3">{scope.blocks.map(block => <label key={block.id} className="flex items-start gap-3 text-sm"><Checkbox checked={f.applies_all_blocks || f.applied_block_ids.includes(block.id)} disabled={f.applies_all_blocks || mutation.isPending} onCheckedChange={v => change({ applied_block_ids: v === true ? [...f.applied_block_ids, block.id] : f.applied_block_ids.filter(id => id !== block.id) })} /><span>{block.name}</span></label>)}
      <label className="flex items-start gap-3 text-sm"><Checkbox checked={f.applies_all_blocks || f.applies_unassigned} disabled={f.applies_all_blocks || mutation.isPending} onCheckedChange={v => change({ applies_unassigned: v === true })} /><span>Nhân sự trực thuộc Công ty / chưa thuộc Khối</span></label>
    </div>
    <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-1"><Label htmlFor="k3-application-date">Ngày bắt đầu hiệu lực</Label><Input id="k3-application-date" type="date" min={scope.today} value={f.effective_from} onChange={e => change({ effective_from: e.target.value })} /></div><div className="space-y-1"><Label htmlFor="k3-application-reason">Lý do thay đổi</Label><Input id="k3-application-reason" value={f.reason} onChange={e => change({ reason: e.target.value })} /></div></div>
    <p className="text-sm text-muted-foreground">{preview ? `${preview.employee_count} nhân viên thuộc phạm vi từ ngày ${f.effective_from.split('-').reverse().join('/')}.` : `${scope.employee_count} nhân viên thuộc cấu hình đã lưu.`}</p>
    <div className="flex flex-wrap gap-2"><Button variant="outline" disabled={mutation.isPending || !f.effective_from} onClick={() => mutation.mutate('preview')}>Kiểm tra phạm vi</Button><Button disabled={mutation.isPending || !preview || !f.reason.trim()} onClick={() => mutation.mutate('save')}>Lưu phạm vi</Button></div>
  </div>;
}