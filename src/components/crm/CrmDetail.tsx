import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Phone,
  Plus,
  FileUp,
  Download,
  CalendarPlus,
  Pencil,
  Archive,
  ArrowRightLeft,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/lib/auth";
import { crmDetailQuery, crmPeopleQuery, crmRpc } from "@/lib/crm/queries";
import { formatDate, scheduleStatus } from "@/lib/crm/logic";
import {
  CHANNELS,
  type Catalog,
  type Contact,
  type Location,
  type Schedule,
} from "@/lib/crm/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Field, Pick } from "./CrmControls";
import { displayValue, scopeMatches } from '@/lib/crm/fields';
import {
  CrmModal,
  CustomerForm,
  ContactForm,
  LocationForm,
  ScheduleForm,
  InteractionForm,
} from "./CrmForms";
export function CrmDetail({
  uid,
  id,
  catalogs,
  onClose,
}: {
  uid: string;
  id: string;
  catalogs: Catalog[];
  onClose: () => void;
}) {
  const q = useQuery(crmDetailQuery(uid, id));
  const people = useQuery(crmPeopleQuery(uid));
  const qc = useQueryClient();
  const { can } = useCurrentUser();
  const [form, setForm] = useState("");
  const [contact, setContact] = useState<Contact>();
  const [location, setLocation] = useState<Location>();
  const [schedule, setSchedule] = useState<Schedule>();
  const [reason, setReason] = useState("");
  const [owner, setOwner] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");
  const origin = useQuery({
    queryKey: ["crm_signal_origin", uid, id],
    queryFn: async (): Promise<string | null> => {
      const { data, error } = await (supabase as any)
        .from("signal_crm_links")
        .select("signal_id")
        .eq("customer_id", id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data?.signal_id ?? null;
    },
    retry: false,
  });
  const files = useQuery({
    queryKey: ["crm_files", uid, id],
    queryFn: async () => {
      const r = await supabase.storage.from("crm-files").list(id);
      if (r.error) throw r.error;
      return r.data;
    },
  });
  if (!q.data)
    return (
      <CrmModal title="Hồ sơ khách hàng" onClose={onClose}>
        <p role={q.error ? "alert" : undefined}>{q.error?.message || "Đang tải…"}</p>
      </CrmModal>
    );
  const d = q.data,
    c = d.customer;
  const label = (i: string | null) => catalogs.find((x) => x.id === i)?.name || "—";
  const editable = d.can_edit;
  const now = new Date().toISOString();
  if (form === "edit")
    return (
      <CustomerForm
        customer={c}
        catalogs={catalogs}
        onClose={() => setForm("")}
        onSaved={() => setForm("")}
      />
    );
  if (form === "contact")
    return (
      <ContactForm customer={c} contact={contact} catalogs={catalogs} onClose={() => setForm("")} />
    );
  if (form === "location")
    return <LocationForm customer={c} location={location} onClose={() => setForm("")} />;
  if (form === "schedule")
    return (
      <ScheduleForm
        uid={uid}
        customer={c}
        contacts={d.contacts}
        catalogs={catalogs}
        schedule={schedule}
        onClose={() => setForm("")}
      />
    );
  if (form === "interaction")
    return (
      <InteractionForm
        customer={c}
        contacts={d.contacts}
        catalogs={catalogs}
        schedule={schedule}
        onClose={() => setForm("")}
      />
    );
  if (form === "action")
    return (
      <CrmModal title="Bàn giao / Lưu trữ khách" onClose={() => setForm("")} busy={busy}>
        <Field label="Người nhận bàn giao">
          <Pick
            label="Chọn Sale nhận khách"
            value={owner}
            onChange={setOwner}
            options={people.data || []}
          />
        </Field>
        <Field label="Lý do">
          <Input aria-label="Lý do" value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
        {error && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
        <div className="crm-form-footer grid gap-2">
          {[
            ["transfer", "Bàn giao khách", "biz.crm_transfer"],
            [
              c.archived_at ? "restore" : "archive",
              c.archived_at ? "Khôi phục khách" : "Lưu trữ khách",
              "biz.crm_archive",
            ],
          ]
            .filter(([, , p]) => can(p))
            .map(([action, title]) => (
              <Button
                key={action}
                disabled={busy || !reason.trim() || (action === "transfer" && !owner)}
                onClick={async () => {
                  if (busy) return;
                  setBusy(true);
                  try {
                    await crmRpc("crm_customer_action", {
                      _id: id,
                      _revision: c.revision,
                      _action: action,
                      _reason: reason,
                      _owner: owner || null,
                    });
                    await qc.invalidateQueries({
                      predicate: (q) => String(q.queryKey[0]).startsWith("crm_"),
                    });
                    toast.success("Đã cập nhật hồ sơ");
                    setForm("");
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Chưa thực hiện được.");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {title}
              </Button>
            ))}
        </div>
      </CrmModal>
    );
  return (
    <CrmModal title={c.name} onClose={onClose}>
      <p className="text-xs text-muted-foreground">
        {c.code} · {c.profile_kind === "individual" ? "Cá nhân" : "Tổ chức / Đơn vị"}
      </p>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-auto w-full justify-start overflow-x-auto">
          {[
            ["overview", "Tổng quan"],
            ["contacts", "Liên hệ"],
            ["care", "Chăm sóc"],
            ["history", "Lịch sử"],
            ["more", "Mở rộng"],
          ].map(([v, l]) => (
            <TabsTrigger key={v} value={v} className="shrink-0">
              {l}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          {origin.data && <div className="rounded-md border p-3 text-sm space-y-1">
            <p>Khách được lưu từ Tín hiệu cơ hội.</p>
            {(can("signal.sale") || can("signal.view_all") || can("signal.manage") || can("signal.create")) && (
              <Button asChild variant="outline" size="sm">
                <a href={`/signals?open=${origin.data}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />Xem tín hiệu gốc
                </a>
              </Button>
            )}
          </div>}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{label(c.group_id)}</Badge>
            <Badge variant="outline">{label(c.segment_id)}</Badge>
            {c.priority_id && <Badge>{label(c.priority_id)}</Badge>}
          </div>
          {c.phone && (
            <Button asChild variant="outline">
              <a href={`tel:${c.phone}`}>
                <Phone className="h-4 w-4" />
                {c.phone}
              </a>
            </Button>
          )}
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-3 text-sm">
            <dt className="text-muted-foreground">Quan hệ</dt>
            <dd>{label(c.relationship_id)}</dd>
            <dt className="text-muted-foreground">Nguồn</dt>
            <dd>{label(c.source_id)}</dd>
            <dt className="text-muted-foreground">Sale</dt>
            <dd>{people.data?.find((p) => p.id === c.owner_id)?.name || "—"}</dd>
            <dt className="text-muted-foreground">Địa chỉ</dt>
            <dd>{c.address || "—"}</dd>
            <dt className="text-muted-foreground">Ghi chú</dt>
            <dd className="whitespace-pre-wrap">{c.note || "—"}</dd>
          </dl>
          <div className="flex flex-wrap gap-2">
            {editable && (
              <Button variant="outline" onClick={() => setForm("edit")}>
                <Pencil className="h-4 w-4" />
                Sửa hồ sơ
              </Button>
            )}
            {(can("biz.crm_transfer") || can("biz.crm_archive")) && (
              <Button variant="outline" onClick={() => setForm("action")}>
                <ArrowRightLeft className="h-4 w-4" />
                <Archive className="h-4 w-4" />
                Bàn giao / Lưu trữ
              </Button>
            )}
          </div>
        </TabsContent>
        <TabsContent value="contacts" className="space-y-3">
          {editable && (
            <Button
              variant="outline"
              onClick={() => {
                setContact(undefined);
                setForm("contact");
              }}
            >
              <Plus className="h-4 w-4" />
              Thêm liên hệ
            </Button>
          )}
          {!d.contacts.length && (
            <p className="text-sm text-muted-foreground">Chưa có người liên hệ</p>
          )}
          {d.contacts.map((ct) => (
            <article key={ct.id} className="space-y-2 rounded-lg border p-3">
              <div className="flex flex-wrap justify-between gap-2">
                <strong>{ct.name}</strong>
                <Badge variant="outline">
                  {!ct.active
                    ? "Đã chuyển công tác"
                    : ct.is_primary
                      ? "Liên hệ chính"
                      : "Liên hệ phụ"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {[ct.title, ct.department, ct.email].filter(Boolean).join(" · ")}
              </p>
              <div className="flex flex-wrap gap-2">
                {ct.phone && (
                  <Button asChild size="sm" variant="outline">
                    <a href={`tel:${ct.phone}`}>
                      <Phone className="h-4 w-4" />
                      {ct.phone}
                    </a>
                  </Button>
                )}
                {ct.zalo && (
                  <Button asChild size="sm" variant="outline">
                    <a
                      href={`https://zalo.me/${ct.zalo.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Zalo
                    </a>
                  </Button>
                )}
                {editable && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setContact(ct);
                      setForm("contact");
                    }}
                  >
                    Sửa
                  </Button>
                )}
              </div>
            </article>
          ))}
        </TabsContent>
        <TabsContent value="care" className="space-y-3">
          {editable && !c.archived_at && (
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  setSchedule(undefined);
                  setForm("schedule");
                }}
              >
                <CalendarPlus className="h-4 w-4" />
                Đặt lịch
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSchedule(undefined);
                  setForm("interaction");
                }}
              >
                Ghi nhận chăm sóc
              </Button>
            </div>
          )}
          {!d.schedules.length && (
            <p className="text-sm text-muted-foreground">Chưa có lịch chăm sóc</p>
          )}
          {d.schedules.map((s) => (
            <article key={s.id} className="space-y-2 rounded-lg border p-3">
              <div className="flex flex-wrap justify-between gap-2">
                <strong className="text-sm">{s.goal || "Chăm sóc khách hàng"}</strong>
                <Badge
                  variant={s.status === "pending" && s.due_at < now ? "destructive" : "secondary"}
                >
                  {scheduleStatus(s, now)}
                </Badge>
              </div>
              <p className="text-sm">{s.content}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(s.due_at)} ·{" "}
                {s.kind === "recurring"
                  ? `Mỗi ${s.interval_days} ngày`
                  : s.kind === "seasonal"
                    ? "Mùa vụ / Sự kiện"
                    : "Lịch hẹn"}
              </p>
              {s.due_at !== s.original_due_at && (
                <p className="text-xs text-muted-foreground">
                  Ngày gốc: {formatDate(s.original_due_at)}
                </p>
              )}
              {editable && s.status === "pending" && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setSchedule(s);
                      setForm("interaction");
                    }}
                  >
                    Cập nhật chăm sóc
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSchedule(s);
                      setForm("schedule");
                    }}
                  >
                    Sửa / Dời lịch
                  </Button>
                </div>
              )}
            </article>
          ))}
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          {!d.interactions.length && (
            <p className="text-sm text-muted-foreground">Chưa có lịch sử chăm sóc</p>
          )}
          {d.interactions.map((i) => (
            <article className="border-l-2 border-primary pl-3" key={i.id}>
              <div className="flex flex-wrap gap-2 text-sm">
                <strong>{label(i.outcome_id)}</strong>
                <Badge variant={i.connected ? "secondary" : "outline"}>
                  {i.connected ? "Đã kết nối" : "Lượt thử"}
                </Badge>
              </div>
              <p className="my-2 whitespace-pre-wrap text-sm">{i.content}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(i.happened_at)} ·{" "}
                {CHANNELS[i.channel as keyof typeof CHANNELS] || i.channel} ·{" "}
                {people.data?.find((p) => p.id === i.actor_id)?.name || "Người thực hiện"}
              </p>
            </article>
          ))}
          <details>
            <summary className="cursor-pointer text-sm font-medium">
              Nhật ký thay đổi ({d.events.length})
            </summary>
            <div className="space-y-3 pt-3">
              {d.events.map((e) => (
                <div className="border-b pb-2 text-xs" key={e.id}>
                  <strong>
                    {(
                      {
                        customer_save: "Lưu hồ sơ",
                        schedule_save: "Lưu / Dời lịch",
                        interaction: "Ghi nhận chăm sóc",
                        contact_save: "Cập nhật liên hệ",
                        transfer: "Bàn giao",
                        archive: "Lưu trữ",
                        restore: "Khôi phục",
                        location_save: "Cập nhật địa điểm",
                      } as Record<string, string>
                    )[e.action] || e.action}
                  </strong>
                  <p>
                    {formatDate(e.created_at)}
                    {e.reason ? ` · ${e.reason}` : ""}
                  </p>
                  {e.action === "schedule_save" &&
                    e.before_data?.due_at !== e.after_data?.due_at &&
                    Boolean(e.before_data?.due_at) && (
                      <p>
                        Ngày cũ: {formatDate(String(e.before_data?.due_at))} →{" "}
                        {formatDate(String(e.after_data?.due_at))}
                      </p>
                    )}
                </div>
              ))}
            </div>
          </details>
        </TabsContent>
        <TabsContent value="more" className="space-y-4">
          <dl className="space-y-2 text-sm">
            {catalogs.filter(x=>x.kind==='custom_field' && c.custom_values?.[x.id]!==undefined).map(x=><div key={x.id}><dt className="text-muted-foreground">{x.name}{!x.active || !scopeMatches(x,c.group_id||'',c.segment_id||'',catalogs)?' (Thông tin đã lưu)':''}</dt><dd>{displayValue(x,c.custom_values?.[x.id])}</dd></div>)}
            {[
              ["Tên pháp lý", c.legal_name],
              ["Mã số thuế", c.tax_code],
              ["Email", c.email],
              ["Website", c.website],
              ...Object.entries(c.details),
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
          </dl>
          <div className="flex flex-wrap gap-2">
            {c.related_ids.map((i) => (
              <Badge key={i} variant="outline">
                {label(i)}
              </Badge>
            ))}
          </div>
          <h3 className="text-sm font-semibold">Địa điểm</h3>
          {editable && (
            <Button
              variant="outline"
              onClick={() => {
                setLocation(undefined);
                setForm("location");
              }}
            >
              <Plus className="h-4 w-4" />
              Thêm địa điểm
            </Button>
          )}
          {d.locations.map((l) => (
            <div
              key={l.id}
              className="flex items-start justify-between gap-2 border-b pb-2 text-sm"
            >
              <div>
                <strong>
                  {l.label}
                  {l.is_primary ? " · Chính" : ""}
                </strong>
                <p>{l.address}</p>
              </div>
              {editable && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLocation(l);
                    setForm("location");
                  }}
                >
                  Sửa
                </Button>
              )}
            </div>
          ))}
          <h3 className="text-sm font-semibold">Tài liệu</h3>
          {editable && (
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-primary">
              <FileUp className="h-4 w-4" />
              Thêm tài liệu
              <input
                type="file"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const r = await supabase.storage
                      .from("crm-files")
                      .upload(
                        `${id}/${crypto.randomUUID()}-${file.name.replace(/[^\p{L}\p{N}._-]/gu, "_")}`,
                        file,
                      );
                    if (r.error) throw r.error;
                    await files.refetch();
                    toast.success("Đã lưu tài liệu riêng tư");
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Chưa tải lên được.");
                  }
                }}
              />
            </label>
          )}
          {files.error && (
            <p role="alert" className="text-sm text-destructive">
              Chưa tải được tài liệu
            </p>
          )}
          {files.data?.map((f) => (
            <Button
              key={f.name}
              className="h-auto w-full justify-start whitespace-normal text-left"
              variant="outline"
              onClick={async () => {
                const r = await supabase.storage
                  .from("crm-files")
                  .createSignedUrl(`${id}/${f.name}`, 60);
                if (r.error) {
                  toast.error("Không tải được tài liệu");
                  return;
                }
                window.open(r.data.signedUrl, "_blank", "noopener");
              }}
            >
              <Download className="h-4 w-4 shrink-0" />
              {f.name.slice(37)}
            </Button>
          ))}
        </TabsContent>
      </Tabs>
    </CrmModal>
  );
}
