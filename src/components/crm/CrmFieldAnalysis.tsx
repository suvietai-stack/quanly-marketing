import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import type { Catalog, Customer } from "@/lib/crm/types";
import { dynamicAnalysis, scopeMatches } from "@/lib/crm/fields";
import { SearchPick } from "./CrmControls";
import { Input } from "@/components/ui/input";
export function CrmFieldAnalysis({
  customers,
  catalogs,
  group,
  segment,
  onOpen,
}: {
  customers: Customer[];
  catalogs: Catalog[];
  group: string;
  segment: string;
  onOpen: (id: string) => void;
}) {
  const [field, setField] = useState(""),
    [selected, setSelected] = useState<string[] | null>(null);
  const [min, setMin] = useState(""),
    [max, setMax] = useState("");
  const defs = catalogs.filter(
    (c) =>
      [
        "custom_field",
        "trait",
        "channel",
        "cooperation",
        "output",
        "product",
        "need",
        "occasion",
      ].includes(c.kind) &&
      (!group || scopeMatches(c, group, segment, catalogs)),
  );
  const c = defs.find((c) => c.id === field),
    a = c ? dynamicAnalysis(customers, c, catalogs, { min, max }) : null;
  const typ = c?.kind === "custom_field" ? String(c.config.field_type) : "boolean";
  return (
    <section className="space-y-4 border-t pt-5">
      <h3 className="font-semibold">Phân tích thông tin chuyên sâu</h3>
      <SearchPick
        label="Chọn trường phân tích"
        value={field}
        onChange={(v) => {
          setField(v);
          setSelected(null);
          setMin("");
          setMax("");
        }}
        options={defs.map((c) => ({ code: c.id, name: c.name }))}
      />
      {a && (
        <>
          {["number", "money", "date"].includes(typ) && (
            <div className="grid grid-cols-2 gap-2">
              <Input
                aria-label="Từ giá trị phân tích"
                type={typ === "date" ? "date" : "number"}
                value={min}
                onChange={(e) => setMin(e.target.value)}
              />
              <Input
                aria-label="Đến giá trị phân tích"
                type={typ === "date" ? "date" : "number"}
                value={max}
                onChange={(e) => setMax(e.target.value)}
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <p>
              Khách duy nhất: <strong>{a.total}</strong>
            </p>
            <p>
              Có dữ liệu: <strong>{a.filled}</strong>
            </p>
            {typ === "multiselect" && (
              <p>
                Lượt lựa chọn: <strong>{a.selections}</strong>
              </p>
            )}
            {a.sum !== null && (
              <>
                <p>
                  Tổng: <strong>{a.sum.toLocaleString("vi-VN")}</strong>
                </p>
                <p>
                  Trung bình: <strong>{a.average?.toLocaleString("vi-VN")}</strong>
                </p>
              </>
            )}
          </div>
          {["select", "multiselect", "boolean"].includes(typ) && a.rows.length > 0 && (
            <ChartContainer
              config={{ count: { label: "Khách duy nhất", color: "var(--primary)" } }}
              className="h-64 w-full"
            >
              <BarChart data={a.rows}>
                <XAxis dataKey="name" hide />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" />
              </BarChart>
            </ChartContainer>
          )}
          <div className="divide-y border-y">
            {a.rows.map((r) => (
              <Button
                key={r.id}
                className="h-auto w-full justify-between whitespace-normal py-3 text-left"
                variant="ghost"
                onClick={() => setSelected(r.ids)}
              >
                <span>{r.name}</span>
                <span>
                  {r.count} · {r.share?.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%
                </span>
              </Button>
            ))}
          </div>
          {selected && (
            <div className="divide-y">
              {customers
                .filter((c) => selected.includes(c.id))
                .map((c) => (
                  <Button
                    className="h-auto w-full justify-start whitespace-normal py-3"
                    variant="link"
                    key={c.id}
                    onClick={() => onOpen(c.id)}
                  >
                    {c.name}
                  </Button>
                ))}
            </div>
          )}
          {!a.filled && <p className="text-sm text-muted-foreground">Chưa có dữ liệu</p>}
        </>
      )}
    </section>
  );
}
