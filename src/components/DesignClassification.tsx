import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useDesignCatalogs } from '@/lib/orders/catalogs';
import type { DesignOrder } from '@/lib/store';
import type { DesignFlow } from '@/lib/orders/design';

export function DesignClassification({
  flow, value, onChange, disabled = false,
}: {
  flow: DesignFlow;
  value: Partial<DesignOrder>;
  onChange: (patch: Partial<DesignOrder>) => void;
  disabled?: boolean;
}) {
  const query = useDesignCatalogs();
  const catalogs = query.data || [];
  const work = catalogs.filter(c => c.workflow_kind === flow && c.kind === 'work'
    && (c.active || c.id === value.workCategoryId));
  const products = catalogs.filter(c => c.workflow_kind === flow && c.kind === 'product'
    && (c.active || value.productIds?.includes(c.id)));
  const selected = value.productIds || [];
  const other = products.some(c => c.is_other && selected.includes(c.id));
  const workLabel = flow === 'photo' ? 'Loại công việc chụp ảnh'
    : flow === 'marketing_design' ? 'Loại ấn phẩm' : 'Loại yêu cầu ma-két';

  return <div className="sm:col-span-2 space-y-3">
    {query.isError && <p role="alert" className="text-sm text-destructive">
      Không tải được danh mục.{' '}
      <button type="button" className="underline" onClick={() => query.refetch()}>Thử lại</button>
    </p>}

    <div className="grid gap-3 sm:grid-cols-2">
      <div className="min-w-0 space-y-1">
        <Label>{workLabel}</Label>
        <Select disabled={disabled || query.isPending} value={value.workCategoryId || '_legacy'}
          onValueChange={id => {
            const c = work.find(x => x.id === id);
            if (c) onChange({ workCategoryId: id, workCategoryName: c.name, workOther: '' });
          }}>
          <SelectTrigger className="min-h-10 w-full min-w-0">
            <SelectValue placeholder="Chọn loại công việc"/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_legacy">{value.type || 'Chọn loại công việc'}</SelectItem>
            {work.map(c => <SelectItem key={c.id} value={c.id}>
              {c.name}{!c.active ? ' (Ngừng sử dụng)' : ''}
            </SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {work.some(c => c.id === value.workCategoryId && c.is_other) && <div className="space-y-1">
        <Label>Mô tả loại công việc khác</Label>
        <Input disabled={disabled} value={value.workOther || ''}
          onChange={e => onChange({ workOther: e.target.value })}/>
      </div>}
    </div>

    {flow === 'order_mockup' && <fieldset className="space-y-2">
      <legend className="text-sm font-medium">
        Sản phẩm áp dụng
        {selected.length > 0 && <span className="ml-2 font-normal text-muted-foreground">
          · {selected.length} đã chọn
        </span>}
      </legend>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {products.map(c => {
          const checked = selected.includes(c.id);
          return <label key={c.id}
            className={`flex min-h-11 min-w-0 cursor-pointer items-center sm:min-h-10 gap-2 rounded-md border px-2.5 py-2 text-xs leading-4 transition-colors sm:text-sm ${checked ? 'border-primary/40 bg-primary/5' : 'border-border/70 hover:bg-muted/30'} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}>
            <Checkbox disabled={disabled} checked={checked}
              onCheckedChange={next => {
                const ids = next ? [...selected, c.id] : selected.filter(id => id !== c.id);
                onChange({
                  productIds: ids,
                  productNames: { ...value.productNames, [c.id]: c.name },
                  ...(!next && c.is_other ? { otherProducts: [] } : {}),
                });
              }}/>
            <span className="min-w-0 break-words">{c.name}</span>
          </label>;
        })}
      </div>
      {other && <div className="space-y-1">
        <Label>Tên sản phẩm khác</Label>
        <Input disabled={disabled} placeholder="Nhập tên sản phẩm cần thiết kế…"
          value={(value.otherProducts || []).join('; ')}
          onChange={e => onChange({ otherProducts: e.target.value.split(';') })}/>
      </div>}
    </fieldset>}
  </div>;
}
