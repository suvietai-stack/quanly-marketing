import { useState, type FormEvent, type ReactNode } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { LoaderCircle, Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  supplierSave, supplierProductSave, supplierContactAdd, supplierProductGroupAdd,
  type SupplierFull, type SupplierProduct, type SupplierSavePayload,
  type ProductSavePayload, type SupplierContactChannel, type SupplierProductGroup,
  supplierStatusLabels, supplierChannelLabels, supplierGroupNames,
} from '@/lib/procurement/suppliers';

function FormField({id,label,children,description}:{
  id:string;label:string;children:ReactNode;description?:string;
}) {
  return <div className="min-w-0 space-y-1.5">
    <Label htmlFor={id}>{label}</Label>
    {children}
    {description && <p className="text-[11px] text-muted-foreground">{description}</p>}
  </div>;
}

export function SupplierEditDialog({open,onOpenChange,supplier,canManage,
  groups,canManageGroups,onGroupsChanged,onSaved}:{
  open:boolean;
  onOpenChange:(open:boolean)=>void;
  supplier:SupplierFull | null;
  canManage:boolean;
  groups:SupplierProductGroup[];
  canManageGroups:boolean;
  onGroupsChanged:()=>void;
  onSaved:(id:string)=>void;
}) {
  const [state,setState] = useState<SupplierSavePayload>(()=>({
    name:supplier?.name ?? '',
    status:supplier?.status ?? 'potential',
    category:supplier?.category ?? [],
    contact_name:supplier?.contact_name ?? '',
    phone:supplier?.phone ?? '',
    email:supplier?.email ?? '',
    website:supplier?.website ?? '',
    address:supplier?.address ?? '',
    tax_code:supplier?.tax_code ?? '',
    notes:supplier?.notes ?? '',
    next_follow_up:supplier?.next_follow_up ?? '',
    revision:supplier?.revision,
  }));
  const [categories,setCategories] = useState<string[]>(supplier?.category ?? []);
  const [newGroupName,setNewGroupName] = useState('');
  const [addedGroups,setAddedGroups] = useState<SupplierProductGroup[]>([]);
  const allGroups = [...groups, ...addedGroups.filter(g=>!groups.some(item=>item.code===g.code))];
  const addGroup = useMutation({
    mutationFn:()=>supplierProductGroupAdd(newGroupName.trim()),
    onSuccess:group=>{
      setAddedGroups(current=>[...current,group]);
      setCategories(current=>[...new Set([...current,group.code])]);
      setNewGroupName('');
      toast.success('Đã thêm nhóm sản phẩm vào danh mục chung.');
      onGroupsChanged();
    },
    onError:e=>toast.error(e instanceof Error?e.message:'Không thêm được nhóm sản phẩm.'),
  });
  const toggleGroup = (code:string,checked:boolean) =>
    setCategories(current=>checked
      ? [...new Set([...current,code])]
      : current.filter(x=>x!==code));
  const update=(field:keyof SupplierSavePayload,value:string)=>
    setState(current=>({...current,[field]:value}));
  const save=useMutation({
    mutationFn:()=>supplierSave(supplier?.id ?? null,{
      ...state, category:categories,
    }),
    onSuccess:id=>{
      toast.success(supplier?'Đã cập nhật nhà cung cấp.':'Đã tạo hồ sơ nhà cung cấp.');
      onSaved(id);
    },
    onError:e=>toast.error(e instanceof Error?e.message:'Không lưu được nhà cung cấp.'),
  });
  const submit=(e:FormEvent)=>{e.preventDefault();if(!save.isPending)save.mutate();};
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90dvh] w-[calc(100vw-1.5rem)] max-w-2xl overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{supplier?'Chỉnh sửa nhà cung cấp':'Thêm nhà cung cấp'}</DialogTitle>
        <DialogDescription>Quản lý hồ sơ dùng chung cho toàn bộ các hệ kinh doanh Sứ Việt.</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField id="supplier-name" label="Tên nhà cung cấp *">
            <Input id="supplier-name" required minLength={2} maxLength={180}
              value={state.name} onChange={e=>update('name',e.target.value)}
              placeholder="Ví dụ: Xưởng gốm, nhà nhập khẩu…"/>
          </FormField>
          <div className="space-y-2 sm:col-span-2">
            <Label>Nhóm sản phẩm (tích chọn nhiều nhóm)</Label>
            <div className="grid max-h-52 grid-cols-2 gap-2 overflow-y-auto rounded-lg border bg-muted/15 p-3 sm:grid-cols-3">
              {allGroups.map(group=><label key={group.code}
                className="flex cursor-pointer items-start gap-2 rounded-md p-1.5 text-sm hover:bg-muted/60">
                <Checkbox checked={categories.includes(group.code)}
                  onCheckedChange={checked=>toggleGroup(group.code,checked===true)}
                  aria-label={group.name}/>
                <span>{group.name}</span>
              </label>)}
              {!allGroups.length && <p className="col-span-full text-xs text-muted-foreground">
                Chưa có nhóm sản phẩm trong danh mục.
              </p>}
            </div>
            <p className="text-xs text-muted-foreground">
              Đã chọn {categories.length}/12 nhóm.
              {categories.length>0&&` ${supplierGroupNames(categories,allGroups).join(' · ')}`}
            </p>
            {canManageGroups && <div className="flex flex-wrap gap-2">
              <Input value={newGroupName} maxLength={80} className="min-w-40 flex-1"
                aria-label="Tên nhóm sản phẩm mới"
                onChange={e=>setNewGroupName(e.target.value)}
                placeholder="Thêm nhóm mới vào danh mục dùng chung"/>
              <Button type="button" size="sm" variant="outline"
                disabled={newGroupName.trim().length<2||addGroup.isPending}
                onClick={()=>addGroup.mutate()}>
                <Plus className="mr-1 h-4 w-4"/>Thêm nhóm
              </Button>
            </div>}
          </div>
          <FormField id="supplier-contact" label="Người liên hệ">
            <Input id="supplier-contact" maxLength={160} value={state.contact_name}
              onChange={e=>update('contact_name',e.target.value)} placeholder="Họ tên người liên hệ"/>
          </FormField>
          <FormField id="supplier-phone" label="Số điện thoại">
            <Input id="supplier-phone" type="tel" maxLength={60}
              value={state.phone} onChange={e=>update('phone',e.target.value)}
              placeholder="Số điện thoại / Zalo"/>
          </FormField>
          <FormField id="supplier-email" label="Email">
            <Input id="supplier-email" type="email" maxLength={254}
              value={state.email} onChange={e=>update('email',e.target.value)}
              placeholder="diachi@nhacungcap.vn"/>
          </FormField>
          <FormField id="supplier-website" label="Website">
            <Input id="supplier-website" maxLength={500}
              value={state.website} onChange={e=>update('website',e.target.value)}
              placeholder="https://..."/>
          </FormField>
          <FormField id="supplier-tax-code" label="Mã số thuế (nếu có)">
            <Input id="supplier-tax-code" maxLength={40}
              value={state.tax_code} onChange={e=>update('tax_code',e.target.value)}/>
          </FormField>
          {supplier && canManage && <FormField id="supplier-status" label="Trạng thái hợp tác">
            <select id="supplier-status" value={state.status}
              onChange={e=>update('status',e.target.value)}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm">
              {Object.entries(supplierStatusLabels).map(([value,label])=>
                <option key={value} value={value}>{label}</option>)}
            </select>
          </FormField>}
          <FormField id="supplier-followup" label="Ngày dự kiến liên hệ lại">
            <Input id="supplier-followup" type="date" value={state.next_follow_up}
              onChange={e=>update('next_follow_up',e.target.value)}/>
          </FormField>
        </div>
        <FormField id="supplier-address" label="Địa chỉ">
          <Textarea id="supplier-address" rows={2} maxLength={800}
            value={state.address} onChange={e=>update('address',e.target.value)}/>
        </FormField>
        <FormField id="supplier-notes" label="Ghi chú về năng lực, hợp tác">
          <Textarea id="supplier-notes" rows={3} maxLength={5000}
            value={state.notes} onChange={e=>update('notes',e.target.value)}
            placeholder="Năng lực cung ứng, chính sách, đầu mối, lưu ý…"/>
        </FormField>
        <p className="text-xs text-muted-foreground">
          Hồ sơ lưu vào danh mục Nhà cung cấp chung. Bộ phận Mua hàng quản lý trạng thái hợp tác.
        </p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={()=>onOpenChange(false)}>Hủy</Button>
          <Button type="submit" disabled={save.isPending||categories.length>12||!state.name.trim()}>
            {save.isPending?<LoaderCircle className="mr-2 h-4 w-4 animate-spin"/>:<Save className="mr-2 h-4 w-4"/>}
            Lưu hồ sơ
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>;
}

export function SupplierProductDialog({open,onOpenChange,supplierId,product,canManage,canViewCost,groups,onSaved}:{
  open:boolean;
  onOpenChange:(open:boolean)=>void;
  supplierId:string;
  product:SupplierProduct|null;
  canManage:boolean;
  canViewCost:boolean;
  groups:SupplierProductGroup[];
  onSaved:()=>void;
}) {
  const [state,setState]=useState<ProductSavePayload>(()=>({
    name:product?.name ?? '', sku:product?.sku ?? '',
    category:product?.category ?? '', specification:product?.specification ?? '',
    unit:product?.unit ?? 'cái', origin:product?.origin ?? '',
    min_order_qty:product?.min_order_qty?.toString() ?? '',
    lead_days:product?.lead_days?.toString() ?? '',note:product?.note ?? '',
    ...(canManage?{active:product?.active ?? true}:{}),
    ...(canViewCost?{
      purchase_price:product?.purchase_price?.toString() ?? '',
      currency:product?.currency ?? 'VND',
    }:{}),revision:product?.revision,
  }));
  const set=(key:keyof ProductSavePayload,value:string|boolean)=>
    setState(current=>({...current,[key]:value}));
  const save=useMutation({
    mutationFn:()=>supplierProductSave(supplierId,product?.id ?? null,state),
    onSuccess:()=>{toast.success(product?'Đã cập nhật sản phẩm.':'Đã thêm sản phẩm cung ứng.');onSaved();},
    onError:e=>toast.error(e instanceof Error?e.message:'Không lưu được sản phẩm.'),
  });
  const submit=(e:FormEvent)=>{e.preventDefault();if(!save.isPending)save.mutate();};
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90dvh] w-[calc(100vw-1.5rem)] max-w-2xl overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{product?'Sửa sản phẩm cung ứng':'Thêm sản phẩm của nhà cung cấp'}</DialogTitle>
        <DialogDescription>Danh mục nguồn hàng dùng chung; chưa phải tồn kho hay đơn đặt mua.</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField id="supplier-product-name" label="Tên sản phẩm *">
            <Input id="supplier-product-name" required maxLength={200} value={state.name}
              onChange={e=>set('name',e.target.value)} placeholder="Tên sản phẩm / dòng sản phẩm"/>
          </FormField>
          <FormField id="supplier-product-sku" label="Mã sản phẩm">
            <Input id="supplier-product-sku" maxLength={80} value={state.sku}
              onChange={e=>set('sku',e.target.value)} placeholder="SKU nhà cung cấp"/>
          </FormField>
          <FormField id="supplier-product-category" label="Nhóm sản phẩm">
            <select id="supplier-product-category" value={state.category}
              onChange={e=>set('category',e.target.value)}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm">
              <option value="">Chưa phân nhóm</option>
              {groups.map(group=><option key={group.code} value={group.code}>{group.name}</option>)}
              {state.category && !groups.some(g=>g.code===state.category) &&
                <option value={state.category}>{state.category} (nhóm cũ)</option>}
            </select>
          </FormField>
          <FormField id="supplier-product-unit" label="Đơn vị tính *">
            <Input id="supplier-product-unit" required maxLength={40}
              value={state.unit} onChange={e=>set('unit',e.target.value)}/>
          </FormField>
          <FormField id="supplier-product-origin" label="Xuất xứ">
            <Input id="supplier-product-origin" maxLength={160}
              value={state.origin} onChange={e=>set('origin',e.target.value)}/>
          </FormField>
          <FormField id="supplier-product-moq" label="Số lượng đặt tối thiểu (MOQ)">
            <Input id="supplier-product-moq" type="number" min={0} step="0.01"
              value={state.min_order_qty} onChange={e=>set('min_order_qty',e.target.value)}/>
          </FormField>
          <FormField id="supplier-product-lead" label="Thời gian cung ứng (ngày)">
            <Input id="supplier-product-lead" type="number" min={0} max={3650} step="1"
              value={state.lead_days} onChange={e=>set('lead_days',e.target.value)}/>
          </FormField>
          {canViewCost && <>
            <FormField id="supplier-product-price" label="Giá nhập tham khảo">
              <Input id="supplier-product-price" type="number" min={0} step="0.01"
                value={state.purchase_price ?? ''} onChange={e=>set('purchase_price',e.target.value)}/>
            </FormField>
            <FormField id="supplier-product-currency" label="Đơn vị tiền tệ">
              <select id="supplier-product-currency" value={state.currency ?? 'VND'}
                onChange={e=>set('currency',e.target.value)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                <option value="VND">VND</option><option value="USD">USD</option><option value="CNY">CNY</option>
              </select>
            </FormField>
          </>}
          {canManage && <FormField id="supplier-product-active" label="Trạng thái sản phẩm">
            <select id="supplier-product-active" value={state.active===false?'false':'true'}
              onChange={e=>set('active',e.target.value==='true')}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm">
              <option value="true">Đang cung ứng</option><option value="false">Ngừng cung ứng</option>
            </select>
          </FormField>}
        </div>
        <FormField id="supplier-product-spec" label="Quy cách / chất liệu / kích thước">
          <Textarea id="supplier-product-spec" maxLength={2000} rows={2}
            value={state.specification} onChange={e=>set('specification',e.target.value)}/>
        </FormField>
        <FormField id="supplier-product-note" label="Ghi chú sản phẩm">
          <Textarea id="supplier-product-note" maxLength={3000} rows={2}
            value={state.note} onChange={e=>set('note',e.target.value)}/>
        </FormField>
        {!canViewCost && <p className="text-xs text-muted-foreground">
          Giá nhập được bảo vệ bằng quyền riêng; hồ sơ này chỉ cập nhật thông số hàng hóa.
        </p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={()=>onOpenChange(false)}>Hủy</Button>
          <Button type="submit" disabled={save.isPending||!state.name.trim()||!state.unit.trim()}>
            {save.isPending?<LoaderCircle className="mr-2 h-4 w-4 animate-spin"/>:<Save className="mr-2 h-4 w-4"/>}
            Lưu sản phẩm
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>;
}

export function SupplierContactDialog({open,onOpenChange,supplierId,onSaved}:{
  open:boolean;onOpenChange:(open:boolean)=>void;supplierId:string;onSaved:()=>void;
}) {
  const [channel,setChannel]=useState<SupplierContactChannel>('call');
  const [summary,setSummary]=useState('');
  const [next,setNext]=useState('');
  const save=useMutation({
    mutationFn:()=>supplierContactAdd(supplierId,channel,summary,next),
    onSuccess:()=>{toast.success('Đã ghi lịch sử liên hệ.');onSaved();},
    onError:e=>toast.error(e instanceof Error?e.message:'Không thể ghi lịch sử.'),
  });
  const submit=(e:FormEvent)=>{e.preventDefault();if(!save.isPending)save.mutate();};
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90dvh] w-[calc(100vw-1.5rem)] max-w-lg overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Ghi lịch sử liên hệ</DialogTitle>
        <DialogDescription>Lịch sử được lưu cùng nhà cung cấp, không ghi đè các lần trao đổi cũ.</DialogDescription>
      </DialogHeader>
      <form className="space-y-4" onSubmit={submit}>
        <FormField id="supplier-contact-channel" label="Kênh liên hệ">
          <select id="supplier-contact-channel" value={channel}
            onChange={e=>setChannel(e.target.value as SupplierContactChannel)}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm">
            {Object.entries(supplierChannelLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}
          </select>
        </FormField>
        <FormField id="supplier-contact-summary" label="Nội dung trao đổi *">
          <Textarea id="supplier-contact-summary" required maxLength={2000} rows={5}
            value={summary} onChange={e=>setSummary(e.target.value)}
            placeholder="Đã trao đổi về mặt hàng, báo giá, mẫu thử, điều khoản…"/>
        </FormField>
        <FormField id="supplier-contact-next" label="Ngày cần liên hệ lại">
          <Input id="supplier-contact-next" type="date" value={next}
            onChange={e=>setNext(e.target.value)}/>
        </FormField>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={()=>onOpenChange(false)}>Hủy</Button>
          <Button type="submit" disabled={save.isPending||!summary.trim()}>
            {save.isPending?<LoaderCircle className="mr-2 h-4 w-4 animate-spin"/>:<Save className="mr-2 h-4 w-4"/>}
            Lưu lịch sử
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>;
}
