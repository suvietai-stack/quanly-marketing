import { useDeferredValue, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, ClipboardList, Package, Plus, RefreshCw, Search, Store, Truck, Users } from 'lucide-react';
import { useCurrentUser } from '@/lib/auth';
import { PageHeader } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  supplierListRead, supplierStatusLabels, supplierStatusTone,
  supplierStats, supplierFollowUpOverdue,
  type SupplierFull,
} from '@/lib/showroom/suppliers';
import { SupplierEditDialog } from './SupplierForms';
import { ShowroomSupplierDetail } from './ShowroomSupplierDetail';

export function ShowroomSuppliers() {
  const { user, can, isSuperAdmin }=useCurrentUser();
  const uid=user?.id;
  const authorized=!!user && user.status==='Đang hoạt động'
    && (isSuperAdmin || (can('showroom.view') && can('showroom.supplier.view')));
  const [search,setSearch]=useState('');
  const deferredSearch=useDeferredValue(search);
  const [status,setStatus]=useState('');
  const [store,setStore]=useState('');
  const [selected,setSelected]=useState<string|null>(null);
  const [editOpen,setEditOpen]=useState(false);
  const [editSupplier,setEditSupplier]=useState<SupplierFull|null>(null);
  const [editCanManage,setEditCanManage]=useState(false);
  const qc=useQueryClient();
  const query=useQuery({
    queryKey:['showroom-suppliers',uid,store,deferredSearch,status],
    queryFn:()=>supplierListRead(store,deferredSearch,status),
    enabled:authorized,
    retry:1,staleTime:25_000,
  });
  const suppliers=query.data?.suppliers??[];
  const stores=query.data?.stores??[];
  const totals=useMemo(()=>supplierStats(suppliers),[suppliers]);
  const canCreate=authorized && (isSuperAdmin||can('showroom.supplier.create'))
    && stores.some(x=>x.can_create);

  const newSupplier=()=>{setEditSupplier(null);setEditCanManage(false);setEditOpen(true);};
  const editExisting=(supplier:SupplierFull,canManage:boolean)=>{
    setSelected(null);setEditSupplier(supplier);setEditCanManage(canManage);setEditOpen(true);
  };
  const saved=(id:string)=>{
    setEditOpen(false);setEditSupplier(null);
    void Promise.all([
      qc.invalidateQueries({queryKey:['showroom-suppliers']}),
      qc.invalidateQueries({queryKey:['showroom-supplier-detail']}),
    ]);
    setSelected(id);
  };

  if(!authorized) return <div className="space-y-4">
    <PageHeader title="Nhà cung cấp Showroom" description="Kho hồ sơ nhà cung cấp sản phẩm của Khối Showroom"/>
    <p role="alert" className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
      Tài khoản chưa có quyền vào danh mục Nhà cung cấp Showroom.
      Quyền được cấp theo vị trí trong sơ đồ tổ chức hoặc phân quyền bổ sung.
    </p>
  </div>;

  return <div className="min-w-0 space-y-5 pb-10">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <PageHeader title="Nhà cung cấp Showroom"
        description="Lập dữ liệu nguồn hàng · Theo dõi sản phẩm cung ứng · Quản lý lịch sử hợp tác"/>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" disabled={query.isFetching}
          onClick={()=>query.refetch()} aria-label="Làm mới danh sách nhà cung cấp">
          <RefreshCw className={`mr-2 h-4 w-4 ${query.isFetching?'animate-spin':''}`}/>Làm mới
        </Button>
        {canCreate && <Button size="sm" onClick={newSupplier}>
          <Plus className="mr-2 h-4 w-4"/>Thêm nhà cung cấp
        </Button>}
      </div>
    </div>

    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      <Stat label="Nhà cung cấp" value={totals.total} icon={<Truck className="h-4 w-4"/>}/>
      <Stat label="Đang hợp tác" value={totals.active} icon={<Users className="h-4 w-4"/>}/>
      <Stat label="Đang tìm hiểu" value={totals.potential} icon={<Search className="h-4 w-4"/>}/>
      <Stat label="Sản phẩm đang cung ứng" value={totals.products} icon={<Package className="h-4 w-4"/>}/>
      <Stat label="Cần liên hệ lại" value={totals.overdue} icon={<CalendarClock className="h-4 w-4"/>}/>
    </div>

    <section className="space-y-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="relative min-w-56 flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
          <Input aria-label="Tìm nhà cung cấp" value={search}
            onChange={e=>setSearch(e.target.value)} className="pl-9"
            placeholder="Tìm tên, mã, liên hệ, số điện thoại…"/>
        </div>
        <select aria-label="Lọc theo cửa hàng" value={store} onChange={e=>setStore(e.target.value)}
          className="h-10 min-w-36 max-w-full rounded-md border bg-background px-3 text-sm">
          <option value="">Tất cả cửa hàng được xem</option>
          {stores.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
        <select aria-label="Lọc trạng thái nhà cung cấp" value={status}
          onChange={e=>setStatus(e.target.value)}
          className="h-10 max-w-full rounded-md border bg-background px-3 text-sm">
          <option value="">Mọi trạng thái</option>
          {Object.entries(supplierStatusLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>Đang hiển thị {suppliers.length} nhà cung cấp theo bộ lọc.
          Dữ liệu phân theo cửa hàng được bổ nhiệm trên sơ đồ tổ chức.</span>
        {query.data && suppliers.length>=query.data.limit &&
          <span>Đang hiển thị tối đa {query.data.limit} hồ sơ; hãy thu hẹp tìm kiếm.</span>}
      </div>
    </section>

    {query.isPending && <div role="status" className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
      Đang đọc danh mục nhà cung cấp Showroom…
    </div>}
    {query.error && <div role="alert" className="space-y-3 rounded-xl border border-destructive/30 p-5 text-sm">
      <p className="font-medium text-destructive">Không tải được nhà cung cấp: {query.error.message}</p>
      <Button variant="outline" size="sm" onClick={()=>query.refetch()}>Thử lại</Button>
    </div>}
    {query.data && suppliers.length===0 && <div className="space-y-3 rounded-xl border border-dashed bg-card px-5 py-10 text-center">
      <Truck className="mx-auto h-8 w-8 text-muted-foreground"/>
      <p className="font-medium">{search||status||store?'Không tìm thấy nhà cung cấp phù hợp.':'Chưa có dữ liệu nhà cung cấp Showroom.'}</p>
      <p className="text-sm text-muted-foreground">
        {search||status||store?'Thử thay đổi bộ lọc để tìm lại.':
          'Bắt đầu bằng hồ sơ nhà cung cấp, sau đó thêm sản phẩm và ghi lịch sử trao đổi.'}
      </p>
      {canCreate && !search && !status && !store && <Button className="mx-auto" size="sm" onClick={newSupplier}>
        <Plus className="mr-2 h-4 w-4"/>Thêm nhà cung cấp đầu tiên
      </Button>}
    </div>}
    {query.data && suppliers.length>0 && <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {suppliers.map(s=><button type="button" key={s.id}
        onClick={()=>setSelected(s.id)}
        className="min-w-0 rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-muted/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="break-words font-semibold">{s.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.code}</p>
          </div>
          <Badge variant={supplierStatusTone(s.status)} className="shrink-0">
            {supplierStatusLabels[s.status]}
          </Badge>
        </div>
        <div className="mt-3 space-y-2 text-xs text-muted-foreground">
          <p className="flex items-center gap-1"><Store className="h-3.5 w-3.5 shrink-0"/>{s.store_name}</p>
          <p className="flex items-center gap-1"><Package className="h-3.5 w-3.5 shrink-0"/>
            {s.product_count} sản phẩm đang cung ứng
          </p>
          {(s.contact_name||s.phone) && <p className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 shrink-0"/>
            {[s.contact_name,s.phone].filter(Boolean).join(' · ')}
          </p>}
          {!!s.category.length && <p className="line-clamp-2">
            Nhóm hàng: {s.category.join(', ')}
          </p>}
          {s.next_follow_up && <p className={`flex items-center gap-1 ${supplierFollowUpOverdue(s)?'font-semibold text-amber-600':''}`}>
            <CalendarClock className="h-3.5 w-3.5 shrink-0"/>
            Liên hệ tiếp: {s.next_follow_up.split('-').reverse().join('/')}
            {supplierFollowUpOverdue(s)?' · Cần theo dõi':''}
          </p>}
        </div>
        <p className="mt-4 border-t pt-3 text-xs font-medium text-primary">Xem hồ sơ và danh mục sản phẩm</p>
      </button>)}
    </div>}

    <div className="rounded-xl border bg-muted/20 p-4 text-xs leading-5 text-muted-foreground">
      <span className="font-semibold">Phạm vi module:</span> Danh mục nguồn cung sản phẩm Showroom.
      Không tự tạo đơn mua hàng, tồn kho, giá bán hoặc đồng bộ sang Nhà cung cấp của Theo Dõi Đơn Hàng.
      Quyền xem giá nhập được kiểm soát riêng phía máy chủ.
    </div>

    <ShowroomSupplierDetail id={selected} onClose={()=>setSelected(null)} onEdit={editExisting}/>
    {editOpen && <SupplierEditDialog
      key={editSupplier?.id??'new'}
      open={editOpen} onOpenChange={setEditOpen}
      supplier={editSupplier}
      stores={stores}
      canManage={editCanManage}
      onSaved={saved}/>}
  </div>;
}

function Stat({label,value,icon}:{
  label:string;value:number;icon:React.ReactNode;
}) {
  return <Card>
    <CardHeader className="pb-2">
      <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon}{label}
      </CardTitle>
    </CardHeader>
    <CardContent><p className="text-2xl font-bold tabular-nums">{value}</p></CardContent>
  </Card>;
}
