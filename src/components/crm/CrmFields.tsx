import type { Catalog } from "@/lib/crm/types";
import {
  applicableFields,
  scopeMatches,
  fieldOptions,
  FIELD_TYPES,
  type FieldValue,
  type FieldValues,
  type DynamicFilter,
} from "@/lib/crm/fields";
import { Field, SearchPick, Pick } from "./CrmControls";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
export function ScopeEditor({
  config,
  catalogs,
  onChange,
}: {
  config: Record<string, unknown>;
  catalogs: Catalog[];
  onChange: (v: Record<string, unknown>) => void;
}) {
  const mode = String(
    config.scope_mode ||
      (Array.isArray(config.group_ids) && config.group_ids.length ? "groups" : ""),
  );
  const key = mode === "segments" ? "segment_ids" : "group_ids";
  const ids = Array.isArray(config[key]) ? (config[key] as string[]) : [];
  return (
    <div className="space-y-3">
      <Field label="Phạm vi áp dụng">
        <Pick
          label="Chọn phạm vi"
          value={mode}
          onChange={(v) => onChange({ ...config, scope_mode: v, group_ids: [], segment_ids: [] })}
          options={[
            { id: "shared", name: "Dùng chung mọi nhóm" },
            { id: "groups", name: "Nhóm được chọn" },
            { id: "segments", name: "Tệp được chọn" },
          ]}
        />
      </Field>
      {["groups", "segments"].includes(mode) && (
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {catalogs
            .filter((c) =>
              mode === "groups" ? c.kind === "group" : ["segment", "block"].includes(c.kind),
            )
            .map((c) => (
              <label key={c.id} className="flex min-h-10 items-center gap-2 text-sm">
                <Checkbox
                  checked={ids.includes(c.id)}
                  onCheckedChange={(yes) =>
                    onChange({
                      ...config,
                      [key]: yes ? [...ids, c.id] : ids.filter((id) => id !== c.id),
                    })
                  }
                />
                <span>
                  {c.name}
                  {mode === "segments"
                    ? ` · ${catalogs.find((x) => x.id === c.parent_id)?.name || ""}`
                    : ""}
                </span>
              </label>
            ))}
        </div>
      )}
    </div>
  );
}
export function FieldControl({
  field,
  value,
  onChange,
}: {
  field: Catalog;
  value: FieldValue | undefined;
  onChange: (v: FieldValue) => void;
}) {
  const typ = String(field.config.field_type);
  const options = fieldOptions(field).filter(
    (o) => o.active || value === o.id || (Array.isArray(value) && value.includes(o.id)),
  );
  if (typ === "boolean")
    return (
      <Pick
        label="Chọn Có/Không"
        value={typeof value === "boolean" ? String(value) : ""}
        onChange={(v) => onChange(v === "" ? null : v === "true")}
        options={[
          { id: "true", name: "Có" },
          { id: "false", name: "Không" },
        ]}
      />
    );
  if (typ === "select")
    return (
      <SearchPick
        label={`Chọn ${field.name}`}
        value={typeof value === "string" ? value : ""}
        onChange={onChange}
        options={options.map((o) => ({
          code: o.id,
          name: o.name + (o.active ? "" : " (Đã ngừng)"),
        }))}
      />
    );
  if (typ === "multiselect")
    return (
      <div className="grid gap-2">
        {options.map((o) => (
          <label className="flex min-h-10 items-center gap-2" key={o.id}>
            <Checkbox
              checked={Array.isArray(value) && value.includes(o.id)}
              onCheckedChange={(yes) => {
                const ids = Array.isArray(value) ? value : [];
                onChange(yes ? [...ids, o.id] : ids.filter((id) => id !== o.id));
              }}
            />
            {o.name}
            {!o.active ? " (Đã ngừng)" : ""}
          </label>
        ))}
      </div>
    );
  if (typ === "textarea")
    return (
      <Textarea
        aria-label={field.name}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        maxLength={10000}
      />
    );
  return (
    <Input
      aria-label={field.name}
      type={
        ["number", "money"].includes(typ)
          ? "number"
          : typ === "date"
            ? "date"
            : typ === "url"
              ? "url"
              : "text"
      }
      step={["number", "money"].includes(typ) ? "any" : undefined}
      value={typeof value === "string" || typeof value === "number" ? value : ""}
      onChange={(e) =>
        onChange(
          ["number", "money"].includes(typ)
            ? e.target.value === ""
              ? null
              : Number(e.target.value)
            : e.target.value,
        )
      }
    />
  );
}
export function CustomFields({
  catalogs,
  group,
  segment,
  values,
  onChange,
}: {
  catalogs: Catalog[];
  group: string;
  segment: string;
  values: FieldValues;
  onChange: (v: FieldValues) => void;
}) {
  const fields = applicableFields(catalogs, group, segment);
  return fields.length ? (
    <details>
      <summary className="cursor-pointer text-sm font-medium">Thông tin chuyên sâu</summary>
      <div className="grid gap-4 pt-4">
        {fields.map((c) => (
          <Field key={c.id} label={c.name + (c.config.required === true ? " *" : "")}>
            <FieldControl
              field={c}
              value={values[c.id]}
              onChange={(v) => onChange({ ...values, [c.id]: v })}
            />
            {c.description && (
              <span className="text-xs text-muted-foreground">{c.description}</span>
            )}
          </Field>
        ))}
      </div>
    </details>
  ) : null;
}
export function DynamicFilters({
  catalogs,
  group,
  segment,
  filters,
  onChange,
}: {
  catalogs: Catalog[];
  group: string;
  segment: string;
  filters: DynamicFilter[];
  onChange: (v: DynamicFilter[]) => void;
}) {
  const defs = catalogs
    .filter(
      (c) =>
        c.active &&
        (c.kind === "custom_field" ||
          ["trait", "channel", "cooperation", "output", "product", "need", "occasion"].includes(
            c.kind,
          )),
    )
    .filter((c) => !group || scopeMatches(c, group, segment, catalogs));
  const update = (i: number, v: DynamicFilter) =>
    onChange(filters.map((f, n) => (n === i ? v : f)));
  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-sm font-semibold">Đặc điểm & Thông tin chuyên sâu</h3>
      {filters.map((f, i) => {
        const c = catalogs.find((c) => c.id === f.id),
          typ = String(c?.config.field_type);
        return (
          <div key={i} className="grid gap-3 border-b pb-3">
            <SearchPick
              label="Chọn trường hoặc đặc điểm"
              value={f.id}
              onChange={(id) => update(i, { id })}
              options={defs.map((c) => ({ code: c.id, name: c.name }))}
            />
            {c?.kind === "custom_field" &&
              (["number", "money", "date"].includes(typ) ? (
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    aria-label={`Từ ${c.name}`}
                    type={typ === "date" ? "date" : "number"}
                    value={f.min || ""}
                    onChange={(e) => update(i, { ...f, min: e.target.value })}
                  />
                  <Input
                    aria-label={`Đến ${c.name}`}
                    type={typ === "date" ? "date" : "number"}
                    value={f.max || ""}
                    onChange={(e) => update(i, { ...f, max: e.target.value })}
                  />
                </div>
              ) : ["text", "textarea", "url"].includes(typ) ? (
                <Input
                  aria-label={`Tìm ${c.name}`}
                  value={f.contains || ""}
                  onChange={(e) => update(i, { ...f, contains: e.target.value })}
                />
              ) : (
                <FieldControl
                  field={c}
                  value={f.value}
                  onChange={(v) => update(i, { ...f, value: v })}
                />
              ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange(filters.filter((_, n) => n !== i))}
            >
              Bỏ điều kiện
            </Button>
          </div>
        );
      })}
      <Button variant="outline" onClick={() => onChange([...filters, { id: "" }])}>
        Thêm điều kiện
      </Button>
    </div>
  );
}
export { FIELD_TYPES };
