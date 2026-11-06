import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Pencil } from "lucide-react";
import { useCurrentUser } from "@/lib/auth";
import { useCrmMutation, crmPeopleQuery, crmTemplatesQuery, crmRpc } from "@/lib/crm/queries";
import { KINDS, CHANNELS, type Catalog, type Template } from "@/lib/crm/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Field, Pick } from "./CrmControls";
import { CrmModal } from "./CrmForms";
export function CrmSettings({ uid, catalogs }: { uid: string; catalogs: Catalog[] }) {
  const [kind, setKind] = useState("group");
  const [edit, setEdit] = useState<Record<string, unknown> | null>(null);
  const [template, setTemplate] = useState<Partial<Template> | null>(null);
  const [grant, setGrant] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const { can } = useCurrentUser();
  const save = useCrmMutation("crm_catalog_save");
  const saveTemplate = useCrmMutation("crm_template_save");
  const saveGrant = useCrmMutation("crm_access_save");
  const people = useQuery(crmPeopleQuery(uid));
  const templates = useQuery(crmTemplatesQuery(uid));
  const grants = useQuery({queryKey:['crm_access',uid],enabled:can('biz.crm_access'),queryFn:()=>crmRpc<{id:string;user_id:string;permission:string;reason:string;revoked_at:string|null;ended_at:string|null}[]>('crm_access_list')});
  return (
    <div className="space-y-4">
      <Tabs defaultValue="catalogs">
        <TabsList className="h-auto w-full justify-start overflow-x-auto">
          <TabsTrigger value="catalogs">Danh mục</TabsTrigger>
          <TabsTrigger value="templates">Mẫu chăm sóc</TabsTrigger>
          {can("biz.crm_access") && <TabsTrigger value="access">Quyền CRM</TabsTrigger>}
        </TabsList>
        <TabsContent value="catalogs" className="space-y-4">
          <div className="flex gap-2">
            <Pick
              label="Loại danh mục"
              value={kind}
              onChange={setKind}
              options={Object.entries(KINDS).map(([id, name]) => ({ id, name }))}
            />
            <Button
              onClick={() => {
                setError("");
                setEdit({ kind, name: "", active: true, sort_order: 0, config: {} });
              }}
            >
              <Plus className="h-4 w-4" />
              Thêm
            </Button>
          </div>
          <div className="divide-y border-y">
            {catalogs
              .filter((c) => c.kind === kind)
              .map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <strong className="text-sm">{c.name}</strong>
                    <p className="text-xs text-muted-foreground">
                      {c.parent_id
                        ? catalogs.find((x) => x.id === c.parent_id)?.name
                        : "Danh mục gốc"}{" "}
                      · {c.active ? "Đang sử dụng" : "Đã ngừng"} · Thứ tự {c.sort_order}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Sửa ${c.name}`}
                    onClick={() => {
                      setError("");
                      setEdit({ ...c });
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              ))}
          </div>
        </TabsContent>
        <TabsContent value="templates" className="space-y-4">
          <Button
            onClick={() =>
              setTemplate({ name: "", goal: "", interval_days: 15, channel: "phone", active: true })
            }
          >
            <Plus className="h-4 w-4" />
            Thêm mẫu
          </Button>
          {templates.data?.map((t) => (
            <div className="flex items-center justify-between gap-2 border-b py-3" key={t.id}>
              <div>
                <strong className="text-sm">{t.name}</strong>
                <p className="text-xs text-muted-foreground">
                  {t.goal} · {t.interval_days} ngày · {t.owner_id ? "Cá nhân" : "Dùng chung"}
                </p>
              </div>
              <Button variant="ghost" onClick={() => setTemplate(t)}>
                Sửa
              </Button>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="access" className="space-y-4">
          <h3 className="font-semibold">Quyền theo cơ cấu tổ chức</h3>
          <div className="divide-y border-y text-sm">
            {[
              ["Sale", "Khách của chính mình"],
              ["Trưởng Nhóm", "Nhân viên thuộc nhóm"],
              ["Trưởng Phòng", "Nhóm và nhân viên thuộc phòng"],
              ["Giám Đốc Hệ", "Toàn Hệ phụ trách"],
              ["Lãnh đạo toàn Khối", "Toàn Khối theo bổ nhiệm hiệu lực"],
              ["Admin / Super Admin", "Quản trị toàn bộ CRM"],
            ].map(([l, r]) => (
              <div key={l} className="flex flex-wrap justify-between gap-2 py-3">
                <strong>{l}</strong>
                <span className="text-muted-foreground">{r}</span>
              </div>
            ))}
          </div>
          <Button onClick={() => setGrant({})}>
            <Plus className="h-4 w-4" />
            Cấp quyền nghiệp vụ riêng
          </Button>
          <div className="divide-y border-y">{grants.data?.map(g=><div className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm" key={g.id}><div><strong>{people.data?.find(p=>p.id===g.user_id)?.name||'Nhân sự'}</strong><p className="text-xs text-muted-foreground">{g.permission} · {g.reason}{g.revoked_at?' · Đã thu hồi':''}</p></div>{!g.revoked_at&&<Button variant="outline" size="sm" disabled={saveGrant.isPending} onClick={async()=>{try{await saveGrant.mutateAsync({user_id:g.user_id,permission:g.permission,revoke_id:g.id,reason:'Thu hồi quyền CRM'});}catch(e){setError(e instanceof Error?e.message:'Chưa thu hồi được.');}}}>Thu hồi</Button>}</div>)}</div>
        </TabsContent>
      </Tabs>
      {edit && (
        <CrmModal title="Danh mục CRM" onClose={() => setEdit(null)} dirty busy={save.isPending}>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                setError("");
                await save.mutateAsync(edit);
                setEdit(null);
              } catch (e) {
                setError(e instanceof Error ? e.message : "Chưa lưu được.");
              }
            }}
          >
            <Field label="Tên danh mục">
              <Input
                aria-label="Tên danh mục"
                required
                value={String(edit.name || "")}
                onChange={(e) => setEdit({ ...edit, name: e.target.value })}
              />
            </Field>
            <Field label="Nhóm cha">
              <Pick
                label="Không có nhóm cha"
                value={String(edit.parent_id || "")}
                onChange={(v) => setEdit({ ...edit, parent_id: v })}
                options={catalogs.filter(
                  (c) =>
                    ["group", "block", "segment"].includes(c.kind) && c.active && c.id !== edit.id,
                )}
              />
            </Field>
            <Field label="Mô tả">
              <Textarea
                value={String(edit.description || "")}
                onChange={(e) => setEdit({ ...edit, description: e.target.value })}
              />
            </Field>
            <Field label="Thứ tự">
              <Input
                type="number"
                value={String(edit.sort_order || 0)}
                onChange={(e) => setEdit({ ...edit, sort_order: Number(e.target.value) })}
              />
            </Field>
            <label className="flex gap-2 text-sm">
              <Checkbox
                checked={edit.active === true}
                onCheckedChange={(v) => setEdit({ ...edit, active: v === true })}
              />
              Đang sử dụng
            </label>
            {(edit.kind === "priority" || edit.kind === "outcome") && (
              <div className="grid gap-3">
                {(edit.kind === "priority"
                  ? [["key_customer", "Khách trọng điểm"]]
                  : [
                      ["connected", "Thực sự kết nối / Trao đổi được"],
                      ["completed", "Hoàn tất hợp lệ"],
                      ["need", "Có nhu cầu"],
                    ]
                ).map(([k, l]) => (
                  <label key={k} className="flex gap-2 text-sm">
                    <Checkbox
                      checked={(edit.config as Record<string, unknown>)?.[k] === true}
                      onCheckedChange={(v) =>
                        setEdit({
                          ...edit,
                          config: { ...(edit.config as Record<string, unknown>), [k]: v === true },
                        })
                      }
                    />
                    {l}
                  </label>
                ))}
              </div>
            )}
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="crm-form-footer">
              <Button className="w-full" type="submit" disabled={save.isPending}>
                Lưu danh mục
              </Button>
            </div>
          </form>
        </CrmModal>
      )}
      {template && (
        <CrmModal
          title="Mẫu chăm sóc"
          onClose={() => setTemplate(null)}
          dirty
          busy={saveTemplate.isPending}
        >
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await saveTemplate.mutateAsync({ ...template, shared: template.owner_id === null });
                setTemplate(null);
              } catch (e) {
                setError(e instanceof Error ? e.message : "Chưa lưu được.");
              }
            }}
          >
            <Field label="Tên mẫu">
              <Input
                required
                value={template.name || ""}
                onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              />
            </Field>
            <Field label="Mục tiêu">
              <Input
                value={template.goal || ""}
                onChange={(e) => setTemplate({ ...template, goal: e.target.value })}
              />
            </Field>
            <Field label="Chu kỳ (ngày)">
              <Input
                type="number"
                min={1}
                value={template.interval_days || 15}
                onChange={(e) =>
                  setTemplate({ ...template, interval_days: Number(e.target.value) })
                }
              />
            </Field>
            <Pick
              label="Kênh liên hệ"
              value={template.channel || "phone"}
              onChange={(v) => setTemplate({ ...template, channel: v })}
              options={Object.entries(CHANNELS).map(([id, name]) => ({ id, name }))}
            />
            <label className="flex gap-2 text-sm">
              <Checkbox
                checked={template.owner_id === null}
                onCheckedChange={(v) =>
                  setTemplate({ ...template, owner_id: v === true ? null : uid })
                }
              />
              Dùng chung
            </label>
            {error && (
              <p role="alert" className="text-destructive">
                {error}
              </p>
            )}
            <div className="crm-form-footer">
              <Button type="submit" disabled={saveTemplate.isPending} className="w-full">
                Lưu mẫu
              </Button>
            </div>
          </form>
        </CrmModal>
      )}
      {grant && (
        <CrmModal title="Quyền CRM riêng" onClose={() => setGrant(null)} busy={saveGrant.isPending}>
          <Field label="Nhân sự">
            <Pick
              label="Chọn nhân sự"
              value={String(grant.user_id || "")}
              onChange={(v) => setGrant({ ...grant, user_id: v })}
              options={people.data || []}
            />
          </Field>
          <Field label="Quyền">
            <Pick
              label="Chọn quyền"
              value={String(grant.permission || "")}
              onChange={(v) => setGrant({ ...grant, permission: v })}
              options={[
                { id: "biz.crm_edit_other", name: "Sửa hộ trong phạm vi" },
                { id: "biz.crm_transfer", name: "Bàn giao trong phạm vi" },
                { id: "biz.crm_export", name: "Xuất dữ liệu" },
                { id: "biz.crm_archive", name: "Lưu trữ / Khôi phục" },
                { id: "biz.crm_settings", name: "Cài đặt CRM" },
              ]}
            />
          </Field>
          <Field label="Ngày hết hiệu lực (không bắt buộc)">
            <Input
              type="datetime-local"
              onChange={(e) =>
                setGrant({
                  ...grant,
                  ended_at: e.target.value ? `${e.target.value}:00+07:00` : null,
                })
              }
            />
          </Field>
          <Field label="Lý do">
            <Textarea
              value={String(grant.reason || "")}
              onChange={(e) => setGrant({ ...grant, reason: e.target.value })}
            />
          </Field>
          {error && (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          )}
          <div className="crm-form-footer">
            <Button
              className="w-full"
              disabled={saveGrant.isPending}
              onClick={async () => {
                try {
                  await saveGrant.mutateAsync(grant);
                  setGrant(null);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Chưa cấp được quyền.");
                }
              }}
            >
              Lưu quyền
            </Button>
          </div>
        </CrmModal>
      )}
    </div>
  );
}
