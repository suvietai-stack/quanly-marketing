import { useDeferredValue, useMemo, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, Package, Plus, RefreshCw, Search, Truck, Users } from 'lucide-react';
import { useCurrentUser } from '@/lib/auth';
import { PageHeader } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  supplierListRead, supplierStatusLabels, supplierStatusTone,
  supplierStats, supplierFollowUpOverdue, supplierGroupNames,
  supplierServiceGroups, supplierServiceNames,
  type SupplierFull,
} from '@/lib/procurement/suppliers';
import { SupplierEditDialog } from './SupplierForms';
import { SupplierDetail } from './SupplierDetail';

export function SupplierMaster() {
  const {user,can,isSuperAdmin} = useCurrentUser();
  const authorized=!!user && user.status==='Đang hoạt động'
    && (isSuperAdmin || can('supplier.master.view'));
  const [search,setSearch]=useState('');
  const deferredSearch=useDeferredValue(search);
  const [status,setStatus]=useState('');
  const [category,setCategory]=useState('');
  const [service,setService]=useState('');
  const [selected,setSelected]=useState<string|null>(null);
  const [editOpen,setEditOpen]=useState(false);
  const [editSupplier,setEditSupplier]=useState<SupplierFull|null>(null);
  const [editCanManage,setEditCanManage]=useState(false);
  const qc=useQueryClient();
  const query=useQuery({
    queryKey:['supplier-master',user?.id,deferredSearch,status,category,service],
    queryFn:()=>supplierListRead(deferredSearch,status,category,service),
    enabled:authorized,
    retry:1,staleTime:20_000,
  });
  const suppliers=query.data?.suppliers??[];
  const totals=useMemo(()=>supplierStats(suppliers),[suppliers]);
  const canCreate=authorized && !!query.data?.can_create;

  const newSupplier=()=>{setEditSupplier(null);setEditCanManage(false);setEditOpen(true);};
  const editExisting=(supplier:SupplierFull,canManage:boolean)=>{
    setSelected(null);setEditSupplier(supplier);setEditCanManage(canManage);setEditOpen(true);
  };
  const saved=(id:string)=>{
    setEditOpen(false);setEditSupplier(null);
    void Promise.all([
      qc.invalidateQueries({queryKey:['supplier-master']}),
      qc.invalidateQueries({queryKey:['supplier-detail']}),
      qc.invalidateQueries({queryKey:['ot','suppliers']}),
    ]);
    setSelected(id);
  };

  if(!authorized) return <div className="space-y-4">
    <PageHeader title="Nhà cung cấp" description="Trung tâm dữ liệu nguồn cung chung của Sứ Việt"/>
    <p role="alert" className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
      Chưa có quyền vào danh mục Nhà cung cấp chung. Quyền được cấp theo vai trò
      trên sơ đồ tổ chức hoặc quyền bổ sung.
    </p>
  </div>;

  return <div className="min-w-0 space-y-5 pb-10">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <PageHeader title="Nhà cung cấp"
        description="Mua Hàng & Giao Vận · Một danh mục dùng chung cho Kinh doanh, Showroom và các hệ được cấp quyền"/>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" disabled={query.isFetching}
          onClick={()=>query.refetch()}>
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
      <Stat label="Sản phẩm cung ứng" value={totals.products} icon={<Package className="h-4 w-4"/>}/>
      <Stat label="Cần liên hệ lại" value={totals.overdue} icon={<CalendarClock className="h-4 w-4"/>}/>
    </div>

    <section className="space-y-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="relative min-w-56 flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
          <Input aria-label="Tìm nhà cung cấp" value={search}
            onChange={e=>setSearch(e.target.value)} className="pl-9"
            placeholder="Tìm tên, mã NCC, liên hệ, số điện thoại…"/>
        </div>
        <select aria-label="Lọc loại hình cung ứng" value={service}
          onChange={e=>setService(e.target.value)}
          className="h-10 max-w-full rounded-md border bg-background px-3 text-sm">
          <option value="">Tất cả loại hình cung ứng</option>
          {supplierServiceGroups.map(g=><option key={g.code} value={g.code}>{g.name}</option>)}
        </select>
        <select aria-label="Lọc nhóm sản phẩm nhà cung cấp" value={category}
          onChange={e=>setCategory(e.target.value)}
          className="h-10 max-w-full rounded-md border bg-background px-3 text-sm">
          <option value="">Tất cả nhóm sản phẩm</option>
          {(query.data?.groups??[]).map(g=><option key={g.code} value={g.code}>{g.name}</option>)}
        </select>
        <select aria-label="Lọc trạng thái nhà cung cấp" value={status}
          onChange={e=>setStatus(e.target.value)}
          className="h-10 max-w-full rounded-md border bg-background px-3 text-sm">
          <option value="">Mọi trạng thái</option>
          {Object.entries(supplierStatusLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{suppliers.length} nhà cung cấp trong kết quả tìm kiếm.
          Danh mục dùng chung, không nhân bản theo bộ phận.</span>
        {query.data && suppliers.length>=query.data.limit &&
          <span>Hiển thị tối đa {query.data.limit} hồ sơ; hãy thu hẹp bộ lọc.</span>}
      </div>
    </section>

    {query.isPending && <div role="status" className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
      Đang tải hồ sơ nhà cung cấp chung…
    </div>}
    {query.error && <div role="alert" className="space-y-3 rounded-xl border border-destructive/30 p-5 text-sm">
      <p className="font-medium text-destructive">Không tải được dữ liệu: {query.error.message}</p>
      <Button variant="outline" size="sm" onClick={()=>query.refetch()}>Thử lại</Button>
    </div>}
    {query.data && suppliers.length===0 && <div className="space-y-3 rounded-xl border border-dashed bg-card px-5 py-10 text-center">
      <Truck className="mx-auto h-8 w-8 text-muted-foreground"/>
      <p className="font-medium">{search||status||category||service?'Không tìm thấy nhà cung cấp phù hợp.':'Danh mục nhà cung cấp đang trống.'}</p>
      <p className="text-sm text-muted-foreground">
        {search||status||category||service?'Thử thay đổi bộ lọc.':
          'Nhập thông tin nhà cung cấp, sau đó thêm sản phẩm và nhật ký làm việc.'}
      </p>
      {canCreate && !search && !status && !category && !service && <Button className="mx-auto" size="sm" onClick={newSupplier}>
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
            <p className="mt-1 font-mono text-xs text-muted-foreground">{s.code}</p>
          </div>
          <Badge variant={supplierStatusTone(s.status)} className="shrink-0">
            {supplierStatusLabels[s.status]}
          </Badge>
        </div>
        <div className="mt-3 space-y-2 text-xs text-muted-foreground">
          <p className="flex items-center gap-1"><Package className="h-3.5 w-3.5 shrink-0"/>
            {s.product_count} sản phẩm đang cung ứng
          </p>
          {(s.contact_name||s.phone) && <p className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 shrink-0"/>
            {[s.contact_name,s.phone].filter(Boolean).join(' · ')}
          </p>}
          {!!s.service_groups?.length && <p className="line-clamp-2">
            Cung ứng: {supplierServiceNames(s.service_groups).join(', ')}
          </p>}
          {!!s.category.length && <p className="line-clamp-2">
            Sản phẩm: {supplierGroupNames(s.category,query.data?.groups??[]).join(', ')}
          </p>}
          {s.next_follow_up && <p className={`flex items-center gap-1 ${supplierFollowUpOverdue(s)?'font-semibold text-amber-600':''}`}>
            <CalendarClock className="h-3.5 w-3.5 shrink-0"/>
            Liên hệ tiếp: {s.next_follow_up.split('-').reverse().join('/')}
            {supplierFollowUpOverdue(s)?' · Cần theo dõi':''}
          </p>}
        </div>
        <p className="mt-4 border-t pt-3 text-xs font-medium text-primary">Xem hồ sơ, sản phẩm và lịch sử hợp tác</p>
      </button>)}
    </div>}

    <div className="rounded-xl border bg-muted/20 p-4 text-xs leading-5 text-muted-foreground">
      <span className="font-semibold">Dữ liệu gốc thống nhất:</span> Nhà cung cấp tại đây
      là dữ liệu đang được hệ Theo Dõi Đơn Hàng sử dụng, không tạo bản sao cho Showroom.
      Đơn hàng, tồn kho và giá bán được quản lý bởi các nghiệp vụ riêng.
      Giá nhập được phân quyền độc lập phía máy chủ.
    </div>

    <SupplierDetail id={selected} onClose={()=>setSelected(null)}
      onEdit={editExisting} groups={query.data?.groups??[]}/>
    {editOpen && <SupplierEditDialog
      key={editSupplier?.id??'new'}
      open={editOpen} onOpenChange={setEditOpen}
      supplier={editSupplier}
      canManage={editCanManage}
      groups={query.data?.groups??[]}
      canManageGroups={!!query.data?.can_manage_groups}
      onGroupsChanged={()=>{void qc.invalidateQueries({queryKey:['supplier-master']});}}
      onSaved={saved}/>}
  </div>;
}
function Stat({label,value,icon}:{label:string;value:number;icon:ReactNode}) {
  return <Card><CardHeader className="pb-2">
    <CardTitle className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
      {icon}{label}
    </CardTitle>
  </CardHeader>
  <CardContent><p className="text-2xl font-bold tabular-nums">{value}</p></CardContent>
  </Card>;
}
