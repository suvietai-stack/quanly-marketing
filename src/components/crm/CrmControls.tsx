import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { Catalog } from "@/lib/crm/types";
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid min-w-0 gap-2 text-sm">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}
export function Pick({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: string; name: string }[];
}) {
  return (
    <Select value={value || "none"} onValueChange={(v) => onChange(v === "none" ? "" : v)}>
      <SelectTrigger className="w-full" aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">{label}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            {o.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
export function SearchPick({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { code: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-label={label}
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">{options.find((o) => o.code === value)?.name || label}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" onCloseAutoFocus={e=>e.preventDefault()}>
        <Command>
          <CommandInput placeholder={`Tìm ${label.toLowerCase()}`} />
          <CommandList>
            <CommandEmpty>Không tìm thấy</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                Không chọn
              </CommandItem>
              {options.map((o) => (
                <CommandItem
                  key={o.code}
                  value={`${o.name} ${o.code}`}
                  onSelect={() => {
                    onChange(o.code);
                    setOpen(false);
                  }}
                >
                  {o.name}
                  {o.code === value && <Check className="ml-auto h-4 w-4" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
export function MultiCatalog({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: Catalog[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <details className="space-y-2">
      <summary className="cursor-pointer text-sm font-medium">
        {label}
        {value.length > 0 ? ` (${value.length})` : ""}
      </summary>
      <div className="grid gap-3 pt-3">
        {items.map((c) => (
          <Label key={c.id} className="flex min-h-9 items-center gap-2">
            <Checkbox
              checked={value.includes(c.id)}
              onCheckedChange={(yes) =>
                onChange(yes ? [...value, c.id] : value.filter((x) => x !== c.id))
              }
            />
            {c.name}
          </Label>
        ))}
      </div>
    </details>
  );
}
