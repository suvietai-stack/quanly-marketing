import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Camera, LoaderCircle, Pencil, Save, ShieldCheck, UserRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const sections = [
  { title: 'Về bản thân', fields: [ ['displayName', 'Tên hiển thị'], ['headline', 'Một câu về bạn'], ['bio', 'Giới thiệu bản thân', 'textarea'], ['birthday', 'Ngày sinh', 'date'], ['gender', 'Giới tính'], ['hometown', 'Quê quán'], ['city', 'Nơi đang sống'] ] },
  { title: 'Thông tin liên hệ', fields: [ ['phone', 'Số điện thoại', 'tel'], ['contactEmail', 'Email liên hệ', 'email'], ['address', 'Địa chỉ'], ['emergencyName', 'Người liên hệ khẩn cấp'], ['emergencyPhone', 'Số điện thoại khẩn cấp', 'tel'] ] },
  { title: 'Kỹ năng & sở thích', fields: [ ['skills', 'Kỹ năng chuyên môn', 'textarea'], ['education', 'Học vấn'], ['interests', 'Sở thích'], ['goals', 'Mục tiêu cá nhân', 'textarea'] ] },
  { title: 'Kết nối với bạn', fields: [ ['facebook', 'Facebook', 'url'], ['zalo', 'Zalo (số điện thoại hoặc liên kết)'], ['linkedin', 'LinkedIn', 'url'], ['website', 'Website cá nhân', 'url'] ] },
];
type Details = Record<string, string>;
type Profile = { details: Details; avatar: string };
function parseDetails(value: unknown): Details {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([key, val]) => sections.some(s => s.fields.some(f => f[0] === key)) && typeof val === 'string'));
}
async function prepareAvatar(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) throw new Error('Chọn ảnh JPG, PNG hoặc WebP dưới 8 MB.');
  const url = URL.createObjectURL(file);
  try {
    const img = new Image(); img.src = url; await img.decode();
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 384;
    const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Thiết bị chưa xử lý được ảnh này.');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 384, 384);
    const side = Math.min(img.width, img.height);
    ctx.drawImage(img, (img.width-side)/2, (img.height-side)/2, side, side, 0, 0, 384, 384);
    const result = canvas.toDataURL('image/jpeg', .8);
    if (result.length > 300000) throw new Error('Ảnh quá lớn. Vui lòng chọn ảnh khác.');
    return result;
  } finally { URL.revokeObjectURL(url); }
}
export function PersonalProfile({ userId, fullName }: { userId: string; fullName: string }) {
  const cache = useQueryClient();
  const [draft, setDraft] = useState<Profile>();
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const profile = useQuery({ queryKey: ['personal-profile', userId], queryFn: async ({signal}): Promise<Profile> => {
    const {data, error} = await supabase.from('personal_profiles').select('details,avatar').eq('user_id', userId).abortSignal(signal).maybeSingle();
    if (error) throw error;
    return { details: parseDetails(data?.details), avatar: data?.avatar ?? '' };
  }, retry: 1 });
  const current = draft ?? profile.data ?? { details: {}, avatar: '' };
  const title = current.details.displayName || fullName;
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); if (!draft || saving || processing) return;
    setSaving(true);
    try {
      const details = Object.fromEntries(Object.entries(draft.details).map(([k,v]) => [k,v.trim()]));
      const {data, error} = await supabase.from('personal_profiles').upsert({ user_id: userId, details, avatar: draft.avatar }).select('details,avatar').single();
      if (error) throw error;
      cache.setQueryData(['personal-profile', userId], { details: parseDetails(data.details), avatar: data.avatar });
      setDraft(undefined); toast.success('Đã lưu hồ sơ cá nhân');
    } catch { toast.error('Chưa lưu được hồ sơ. Thông tin đang nhập vẫn được giữ lại, hãy thử lại.'); }
    finally { setSaving(false); }
  };
  if (profile.isPending) return <div role="status" className="p-8 text-center text-muted-foreground">Đang tải hồ sơ…</div>;
  if (profile.isError) return <div role="alert" className="rounded-2xl border p-5">Chưa tải được hồ sơ. <Button variant="outline" onClick={() => profile.refetch()}>Thử lại</Button></div>;
  return <form onSubmit={save} className="space-y-5 min-w-0">
    <section className="overflow-hidden rounded-3xl border bg-card shadow-soft">
      <div className="h-28 bg-gradient-to-br from-[#102d54] via-[#184d77] to-[#197580]" />
      <div className="px-5 pb-6">
        <div className="flex items-end justify-between gap-3">
          <div className="relative -mt-11 h-24 w-24 shrink-0 rounded-3xl border-4 border-card bg-muted shadow-sm">
            {current.avatar ? <img src={current.avatar} alt={`Ảnh đại diện ${title}`} className="h-full w-full rounded-[20px] object-cover" /> : <UserRound className="h-full w-full p-5 text-primary" />}
            {draft && <Button type="button" size="icon" className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full" disabled={processing || saving} aria-label="Đổi ảnh đại diện" onClick={() => fileInput.current?.click()}>{processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}</Button>}
          </div>
          {!draft && <Button type="button" variant="outline" className="min-h-11 rounded-xl" onClick={() => setDraft({ details: {...current.details}, avatar: current.avatar })}><Pencil className="h-4 w-4" />Chỉnh sửa</Button>}
        </div>
        <h2 className="mt-4 text-2xl font-bold break-words">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground break-words">{current.details.headline || 'Chia sẻ đôi điều về bạn với Base Sứ Việt'}</p>
        {current.details.bio && <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6">{current.details.bio}</p>}
        <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />Hồ sơ riêng tư — hiện chỉ bạn xem và chỉnh sửa. Tên hiển thị tại đây không đổi tên trong hồ sơ nhân sự.</p>
        <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" aria-label="Chọn ảnh đại diện" onChange={async e => {
          const file = e.target.files?.[0]; e.target.value = ''; if (!file || !draft) return;
          setProcessing(true);
          try { const avatar = await prepareAvatar(file); setDraft(prev => prev ? {...prev, avatar} : prev); }
          catch (err) { toast.error(err instanceof Error ? err.message : 'Không xử lý được ảnh.'); }
          finally { setProcessing(false); }
        }} />
        {draft && current.avatar && <Button type="button" variant="ghost" disabled={saving || processing} className="mt-2 min-h-11" onClick={() => setDraft(prev => prev ? {...prev, avatar: ''} : prev)}>Gỡ ảnh đại diện</Button>}
      </div>
    </section>
    <fieldset disabled={saving} className="space-y-5 min-w-0">
      {sections.map(section => <section key={section.title} className="rounded-2xl border bg-card p-5"><h3 className="mb-4 font-semibold">{section.title}</h3><div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {section.fields.map(([key, label, type = 'text']) => <div key={key} className={`min-w-0 space-y-2 ${type === 'textarea' ? 'sm:col-span-2' : ''}`}>
          <Label htmlFor={`personal-${key}`} className="text-xs text-muted-foreground">{label}</Label>
          {draft ? type === 'textarea' ? <textarea id={`personal-${key}`} maxLength={2000} rows={3} className="w-full rounded-xl border bg-background p-3 text-base" value={current.details[key] ?? ''} onChange={e => setDraft({...draft, details: {...draft.details, [key]: e.target.value}})} /> : <Input id={`personal-${key}`} type={type} maxLength={300} className="min-h-11 rounded-xl text-base" value={current.details[key] ?? ''} onChange={e => setDraft({...draft, details: {...draft.details, [key]: e.target.value}})} /> : <p className="break-words whitespace-pre-wrap text-sm leading-6">{current.details[key] || 'Chưa cập nhật'}</p>}
        </div>)}
      </div></section>)}
    </fieldset>
    {draft && <div className="flex flex-wrap justify-end gap-3 rounded-2xl border bg-card p-4"><Button type="button" variant="outline" className="min-h-11 rounded-xl" disabled={saving || processing} onClick={() => setDraft(undefined)}>Hủy thay đổi</Button><Button type="submit" className="min-h-11 rounded-xl" disabled={saving || processing}>{saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? 'Đang lưu…' : 'Lưu hồ sơ'}</Button></div>}
  </form>;
}
