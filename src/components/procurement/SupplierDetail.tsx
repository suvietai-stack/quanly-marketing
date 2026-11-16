import { useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, Clock3, Edit3, Mail, MapPin, Package, Phone, Plus, RefreshCw, Store, Truck, Users } from 'lucide-react';
import { useCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supplierDetailRead, supplierStatusLabels, supplierStatusTone,
  supplierChannelLabels, supplierFollowUpOverdue, formatSupplierPrice,
  type SupplierFull, type SupplierProduct,
} from '@/lib/procurement/suppliers';
import { SupplierProductDialog, SupplierContactDialog } from './SupplierForms';

type Section = 'info' | 'products' | 'contacts';

const dateLabel = (value:string|null) => {
  if(!value) return '—';
  const [year,month,day] = value.split('-');
  return `${day}/${month}/${year}`;
};
const dateTimeLabel = (value:string|null) => value
  ? new Date(value).toLocaleString('vi-VN', {timeZone:'Asia/Ho_Chi_Minh'}) : '—';
const safeWebsite = (value:string|null) => {
  if(!value) return null;
  try {
    const url = new URL(value);
    return ['https:','http:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
};

export function SupplierDetail({id,onClose,onEdit}:{
  id:string|null;
  onClose:()=>void;
  onEdit:(supplier:SupplierFull,canManage:boolean)=>void;
}) {
  const { user } = useCurrentUser();
  const qc=useQueryClient();
  const [section,setSection]=useState<Section>('info');
  const [product,setProduct]=useState<SupplierProduct|null>(null);
  const [productOpen,setProductOpen]=useState(false);
  const [contactOpen,setContactOpen]=useState(false);
  const query=useQuery({
    queryKey:['showroom-supplier-detail',user?.id,id],
    queryFn:()=>supplierDetailRead(id!),
    enabled:!!id && user?.status==='Đang hoạt động',
    retry:1,staleTime:20_000,
  });
  const detail=query.data;
  const s=detail?.supplier;
  const archived=s?.status==='archived';

  const invalidate=async()=>{
    await Promise.all([
      qc.invalidateQueries({queryKey:['showroom-supplier-detail']}),
      qc.invalidateQueries({queryKey:['showroom-suppliers']}),
    ]);
  };
  const onProductSaved=()=>{setProductOpen(false);setProduct(null);void invalidate();};
  const onContactSaved=()=>{setContactOpen(false);void invalidate();};

  return <>
    <Dialog open={!!id} onOpenChange={open=>{if(!open){setSection('info');onClose();}}}>
      <DialogContent className="flex max-h-[92dvh] w-[calc(100vw-1.5rem)] max-w-4xl flex-col overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b px-5 pb-4 pt-5">
          <DialogTitle className="flex flex-wrap items-center gap-2 pr-7">
            <Truck className="h-5 w-5 text-primary"/>
            {s?.name ?? 'Hồ sơ nhà cung cấp'}
            {s && <Badge variant={supplierStatusTone(s.status)}>{supplierStatusLabels[s.status]}</Badge>}
          </DialogTitle>
          <DialogDescription>
            {s ? `${s.code} · ${detail?.store_name}` : 'Đang tải hồ sơ nhà cung cấp…'}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 space-y-4 overflow-y-auto px-5 pb-6">
          {query.isPending && <p role="status" className="py-8 text-center text-sm text-muted-foreground">
            Đang tải hồ sơ, sản phẩm và lịch sử liên hệ…
          </p>}
          {query.error && <div role="alert" className="space-y-3 rounded-lg border border-destructive/30 p-4 text-sm text-destructive">
            <p>{query.error.message}</p>
            <Button variant="outline" size="sm" onClick={()=>query.refetch()}>Thử lại</Button>
          </div>}
          {detail && s && <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="Nội dung nhà cung cấp">
                <Button role="tab" aria-selected={section==='info'} size="sm"
                  variant={section==='info'?'default':'outline'} onClick={()=>setSection('info')}>Thông tin</Button>
                <Button role="tab" aria-selected={section==='products'} size="sm"
                  variant={section==='products'?'default':'outline'}
                  onClick={()=>setSection('products')}>Sản phẩm ({detail.products.filter(p=>p.active).length})</Button>
                <Button role="tab" aria-selected={section==='contacts'} size="sm"
                  variant={section==='contacts'?'default':'outline'}
                  onClick={()=>setSection('contacts')}>Lịch sử liên hệ ({detail.contacts.length})</Button>
              </div>
              <div className="flex gap-2">
                {section==='info' && detail.can_edit && <Button variant="outline" size="sm"
                  onClick={()=>onEdit(s,detail.can_manage)}><Edit3 className="mr-1.5 h-4 w-4"/>Sửa hồ sơ</Button>}
                {section==='products' && detail.can_product_edit && !archived && <Button size="sm"
                  onClick={()=>{setProduct(null);setProductOpen(true);}}>
                  <Plus className="mr-1.5 h-4 w-4"/>Thêm sản phẩm</Button>}
                {section==='contacts' && detail.can_contact_log && !archived && <Button size="sm"
                  onClick={()=>setContactOpen(true)}>
                  <Plus className="mr-1.5 h-4 w-4"/>Ghi liên hệ</Button>}
                <Button variant="ghost" size="icon" onClick={()=>query.refetch()} aria-label="Làm mới hồ sơ">
                  <RefreshCw className="h-4 w-4"/></Button>
              </div>
            </div>
            {section==='info' && <section className="grid gap-5 text-sm sm:grid-cols-2">
              <div className="space-y-3 rounded-xl border bg-card p-4">
                <h3 className="font-semibold">Thông tin liên hệ</h3>
                <Info label="Người phụ trách" value={s.contact_name || 'Chưa có'}/>
                <Info label="Số điện thoại" value={s.phone?
                  <a href={`tel:${encodeURIComponent(s.phone)}`} className="text-primary underline underline-offset-2">{s.phone}</a>
                  :'Chưa có'}/>
                <Info label="Email" value={s.email?
                  <a href={`mailto:${encodeURIComponent(s.email)}`} className="break-all text-primary underline underline-offset-2">{s.email}</a>
                  :'Chưa có'}/>
                <Info label="Website" value={safeWebsite(s.website)?
                  <a href={safeWebsite(s.website)!} target="_blank" rel="noopener noreferrer"
                    className="break-all text-primary underline underline-offset-2">{s.website}</a>
                  :s.website || 'Chưa có'}/>
                <Info label="Mã số thuế" value={s.tax_code || 'Chưa có'}/>
                <Info label="Địa chỉ" value={s.address || 'Chưa có'}/>
              </div>
              <div className="space-y-3 rounded-xl border bg-card p-4">
                <h3 className="font-semibold">Năng lực & hợp tác</h3>
                <Info label="Hồ sơ" value="Nhà cung cấp dùng chung cho các hệ kinh doanh"/>
                <Info label="Nhóm hàng" value={s.category.length ? s.category.join(' · ') : 'Chưa phân nhóm'}/>
                <Info label="Trạng thái" value={supplierStatusLabels[s.status]}/>
                <Info label="Liên hệ gần nhất" value={dateTimeLabel(s.last_contact_at)}/>
                <Info label="Liên hệ tiếp" value={<span className={supplierFollowUpOverdue(s)?'font-medium text-amber-600':''}>
                  {dateLabel(s.next_follow_up)} {supplierFollowUpOverdue(s)?'(Cần theo dõi)':''}
                </span>}/>
                <Info label="Cập nhật hồ sơ" value={dateTimeLabel(s.updated_at)}/>
                {s.notes && <div className="space-y-1 border-t pt-3">
                  <p className="text-xs text-muted-foreground">Ghi chú</p>
                  <p className="whitespace-pre-wrap">{s.notes}</p>
                </div>}
              </div>
            </section>}
            {section==='products' && <section className="space-y-3">
              {!detail.can_view_cost && <p className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                Giá nhập được giới hạn theo quyền quản lý và không hiển thị ở tài khoản này.
              </p>}
              {detail.products.length===0 && <div className="rounded-xl border border-dashed p-7 text-center text-sm text-muted-foreground">
                <Package className="mx-auto mb-2 h-7 w-7" />
                Chưa nhập danh mục sản phẩm cung ứng.
              </div>}
              <div className="grid gap-3 sm:grid-cols-2">
                {detail.products.map(p=><div key={p.id} className="min-w-0 space-y-2 rounded-xl border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-semibold">{p.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {p.sku || 'Chưa có SKU'} · {p.category || 'Chưa phân nhóm'}
                      </p>
                    </div>
                    <Badge variant={p.active?'secondary':'outline'}>{p.active?'Đang cung ứng':'Ngừng cung ứng'}</Badge>
                  </div>
                  {p.specification && <p className="whitespace-pre-wrap text-sm">{p.specification}</p>}
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <Info label="Đơn vị" value={p.unit}/>
                    <Info label="Xuất xứ" value={p.origin || '—'}/>
                    <Info label="MOQ" value={p.min_order_qty==null?'—':`${p.min_order_qty} ${p.unit}`}/>
                    <Info label="Thời gian cấp hàng" value={p.lead_days==null?'—':`${p.lead_days} ngày`}/>
                  </div>
                  {detail.can_view_cost && <div className="border-t pt-2">
                    <p className="text-xs text-muted-foreground">Giá nhập tham khảo</p>
                    <p className="font-semibold">{formatSupplierPrice(p.purchase_price,p.currency)}</p>
                  </div>}
                  {p.note && <p className="whitespace-pre-wrap border-t pt-2 text-xs text-muted-foreground">{p.note}</p>}
                  {p.can_edit && !archived && <Button variant="outline" size="sm"
                    onClick={()=>{setProduct(p);setProductOpen(true);}}>
                    <Edit3 className="mr-1 h-3.5 w-3.5"/>Sửa sản phẩm
                  </Button>}
                </div>)}
              </div>
            </section>}
            {section==='contacts' && <section className="space-y-3">
              {detail.contacts.length===0 && <div className="rounded-xl border border-dashed p-7 text-center text-sm text-muted-foreground">
                <CalendarClock className="mx-auto mb-2 h-7 w-7"/>
                Chưa có lịch sử liên hệ. Có thể ghi lần trao đổi đầu tiên.
              </div>}
              {detail.contacts.map(c=><div key={c.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="outline">{supplierChannelLabels[c.channel]}</Badge>
                  <p className="text-xs text-muted-foreground">{dateTimeLabel(c.created_at)}</p>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm">{c.summary}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5"/>{c.actor_name}</span>
                  {c.next_follow_up && <span className="flex items-center gap-1">
                    <CalendarClock className="h-3.5 w-3.5"/>Liên hệ lại {dateLabel(c.next_follow_up)}
                  </span>}
                </div>
              </div>)}
            </section>}
          </>}
        </div>
      </DialogContent>
    </Dialog>
    {s && productOpen && <SupplierProductDialog
      key={product?.id ?? 'new-product'}
      open={productOpen} onOpenChange={setProductOpen}
      supplierId={s.id} product={product}
      canManage={!!detail?.can_manage} canViewCost={!!detail?.can_view_cost}
      onSaved={onProductSaved}/>}
    {s && contactOpen && <SupplierContactDialog
      key={s.id}
      open={contactOpen} onOpenChange={setContactOpen}
      supplierId={s.id} onSaved={onContactSaved}/>}
  </>;
}

function Info({label,value}:{label:string;value:ReactNode}) {
  return <div className="min-w-0 space-y-1">
    <p className="text-xs text-muted-foreground">{label}</p>
    <div className="break-words text-sm">{value}</div>
  </div>;
}
