import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, Pick, SearchPick, MultiCatalog } from "./CrmControls";
import { crmRpc, crmTemplatesQuery, useCrmMutation } from "@/lib/crm/queries";
import { descendant, vnDay } from "@/lib/crm/logic";
import {
  CHANNELS,
  type Catalog,
  type Customer,
  type Contact,
  type Location,
  type Schedule,
} from "@/lib/crm/types";
import locations from "@/lib/crm/locations.json";
export function CrmModal({
  title,
  onClose,
  children,
  dirty = false,
  busy = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  dirty?: boolean;
  busy?: boolean;
}) {
  const [discard, setDiscard] = useState(false);
  return (
    <>
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open && !busy) {
            if (dirty) setDiscard(true);
            else onClose();
          }
        }}
      >
        <DialogContent className="crm-dialog max-h-[90dvh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
      <AlertDialog open={discard} onOpenChange={setDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bỏ thay đổi?</AlertDialogTitle>
            <AlertDialogDescription>
              Thông tin chưa lưu sẽ không được giữ lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tiếp tục nhập</AlertDialogCancel>
            <AlertDialogAction onClick={onClose}>Bỏ thay đổi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
function ErrorText({ error }: { error: string }) {
  return error ? (
    <p role="alert" className="text-sm text-destructive">
      {error}
    </p>
  ) : null;
}
export function CustomerForm({
  customer,
  catalogs,
  onClose,
  onSaved,
}: {
  customer?: Customer;
  catalogs: Catalog[];
  onClose: () => void;
  onSaved: (id: string) => void;
}) {
  const [data, setData] = useState<Record<string, unknown>>(() => ({
    ...customer,
    profile_kind: customer?.profile_kind || "organization",
    name: customer?.name || "",
    related_ids: customer?.related_ids || [],
    details: customer?.details || {},
  }));
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [duplicates, setDuplicates] = useState<{ id: string; name: string; code: string }[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [discard, setDiscard] = useState(false);
  const key = useRef(crypto.randomUUID());
  const lock = useRef(false);
  const save = useCrmMutation("crm_customer_save");
  const value = (k: string) => String(data[k] ?? "");
  const set = (k: string, v: unknown) => {
    setData((d) => ({ ...d, [k]: v }));
    setDirty(true);
    if (["name", "phone", "tax_code"].includes(k)) setConfirmed(false);
  };
  const items = (kind: string) =>
    catalogs.filter((c) => c.kind === kind && (c.active || c.id === data[`${kind}_id`]));
  const input = (k: string, label: string, type = "text") => (
    <Field label={label}>
      <Input
        aria-label={label}
        type={type}
        inputMode={k.includes("phone") ? "tel" : undefined}
        value={value(k)}
        onChange={(e) => set(k, e.target.value)}
      />
    </Field>
  );
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setError("");
    try {
      if (!confirmed && !customer) {
        const d = await crmRpc<{ id: string; name: string; code: string }[]>("crm_duplicates", {
          _name: value("name"),
          _phone: value("phone"),
          _tax: value("tax_code"),
        });
        if (d.length) {
          setDuplicates(d);
          setConfirmed(true);
          return;
        }
      }
      const id = await save.mutateAsync({ ...data, request_key: key.current });
      toast.success("Đã lưu khách hàng");
      onSaved(String(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chưa lưu được khách hàng.");
    } finally {
      lock.current = false;
    }
  }
  return (
    <CrmModal
      title={customer ? "Sửa hồ sơ khách" : "Thêm khách hàng"}
      onClose={onClose}
      dirty={dirty}
      busy={save.isPending}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {[
            ["organization", "Tổ chức / Đơn vị"],
            ["individual", "Cá nhân"],
          ].map(([id, name]) => (
            <Button
              key={id}
              type="button"
              variant={value("profile_kind") === id ? "default" : "outline"}
              onClick={() => set("profile_kind", id)}
            >
              {name}
            </Button>
          ))}
        </div>
        {input(
          "name",
          value("profile_kind") === "individual" ? "Họ tên khách hàng" : "Tên khách hàng / Đơn vị",
        )}
        {input("phone", "Số điện thoại", "tel")}
        {!customer && value("profile_kind") === "organization" && (
          <details>
            <summary className="cursor-pointer text-sm font-medium">Người liên hệ chính</summary>
            <div className="grid gap-4 pt-4">
              {input("contact_name", "Họ tên người liên hệ")}
              {input("contact_phone", "Điện thoại người liên hệ", "tel")}
            </div>
          </details>
        )}
        <Field label="Nhóm khách">
          <Pick
            label="Chọn nhóm khách"
            value={value("group_id")}
            onChange={(v) => {
              set("group_id", v);
              set("segment_id", "");
            }}
            options={items("group")}
          />
        </Field>
        <Field label="Tệp khách">
          <Pick
            label="Chọn tệp khách"
            value={value("segment_id")}
            onChange={(v) => set("segment_id", v)}
            options={items("segment").filter(
              (c) => !value("group_id") || descendant(c.id, value("group_id"), catalogs),
            )}
          />
        </Field>
        <Field label="Tỉnh / Thành phố">
          <SearchPick
            label="Chọn tỉnh / thành phố"
            value={value("province_code")}
            onChange={(v) => {
              set("province_code", v);
              set("ward_code", "");
            }}
            options={locations.provinces}
          />
        </Field>
        {!customer && (
          <Field label="Lịch chăm sóc tiếp theo (không bắt buộc)">
            <Input
              aria-label="Lịch chăm sóc tiếp theo"
              type="datetime-local"
              value={value("next_local")}
              onChange={(e) => set("next_local", e.target.value)}
            />
          </Field>
        )}
        <details>
          <summary className="cursor-pointer text-sm font-medium">Thông tin mở rộng</summary>
          <div className="grid gap-4 pt-4">
            <Field label="Phường / Xã">
              <SearchPick
                label="Chọn phường / xã"
                value={value("ward_code")}
                onChange={(v) => set("ward_code", v)}
                options={locations.wards.filter((w) => w.province_code === value("province_code"))}
              />
            </Field>
            {input("address", "Địa chỉ chi tiết")}
            {input("email", "Email", "email")}
            {input("website", "Website")}
            {value("profile_kind") === "organization" && (
              <>
                {input("legal_name", "Tên pháp lý")}
                {input("tax_code", "Mã số thuế")}
              </>
            )}
            {[
              ["priority", "Mức độ ưu tiên"],
              ["relationship", "Tình trạng hợp tác"],
              ["source", "Nguồn khách"],
            ].map(([k, l]) => (
              <Field key={k} label={l}>
                <Pick
                  label={l}
                  value={value(`${k}_id`)}
                  onChange={(v) => set(`${k}_id`, v)}
                  options={items(k)}
                />
              </Field>
            ))}
            <MultiCatalog
              label="Đặc điểm / Mảng liên quan / Nhu cầu"
              items={catalogs.filter(
                (c) =>
                  [
                    "trait",
                    "product",
                    "need",
                    "group",
                    "channel",
                    "cooperation",
                    "occasion",
                  ].includes(c.kind) && c.active,
              )}
              value={data.related_ids as string[]}
              onChange={(v) => set("related_ids", v)}
            />
            {value("group_id") && (
              <details>
                <summary className="cursor-pointer text-sm font-medium">
                  Thông tin kinh doanh
                </summary>
                <div className="grid gap-4 pt-4">
                  {[
                    "Mục tiêu quan hệ dài hạn",
                    "Quy mô nhập hàng",
                    "Ngân sách dự kiến",
                    "Giá trị hợp tác tiềm năng",
                    "Phân khúc giá",
                    "Chu kỳ nhập hàng",
                    "Quy mô cửa hàng / Kho",
                    "Nhu cầu dự án",
                  ].map((k) => (
                    <Field key={k} label={k}>
                      <Input
                        value={String((data.details as Record<string, string>)[k] || "")}
                        onChange={(e) =>
                          set("details", {
                            ...(data.details as Record<string, string>),
                            [k]: e.target.value,
                          })
                        }
                      />
                    </Field>
                  ))}
                </div>
              </details>
            )}
            <Field label="Ghi chú">
              <Textarea
                aria-label="Ghi chú"
                value={value("note")}
                onChange={(e) => set("note", e.target.value)}
              />
            </Field>
          </div>
        </details>
        {duplicates.length > 0 && (
          <div className="border-l-2 border-warning pl-3 text-sm">
            <p>Đã có hồ sơ tương tự trong phạm vi của bạn:</p>
            {duplicates.map((d) => (
              <Button
                key={d.id}
                type="button"
                variant="link"
                className="h-auto whitespace-normal text-left"
                onClick={() => onSaved(d.id)}
              >
                {d.name} · {d.code}
              </Button>
            ))}
            <p>Bấm Lưu lần nữa nếu đây là một khách khác.</p>
          </div>
        )}
        <ErrorText error={error} />
        <div className="crm-form-footer flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => (dirty ? setDiscard(true) : onClose())}
            disabled={save.isPending}
          >
            Hủy
          </Button>
          <Button
            className="flex-1"
            type="submit"
            disabled={save.isPending || !value("name").trim()}
          >
            {save.isPending ? "Đang lưu…" : "Lưu khách hàng"}
          </Button>
        </div>
      </form>
      <AlertDialog open={discard} onOpenChange={setDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bỏ thay đổi?</AlertDialogTitle>
            <AlertDialogDescription>
              Thông tin khách chưa lưu sẽ không được giữ lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tiếp tục nhập</AlertDialogCancel>
            <AlertDialogAction onClick={onClose}>Bỏ thay đổi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CrmModal>
  );
}
export function ScheduleForm({
  uid,
  customer,
  contacts,
  catalogs,
  schedule,
  onClose,
}: {
  uid: string;
  customer: Customer;
  contacts: Contact[];
  catalogs: Catalog[];
  schedule?: Schedule;
  onClose: () => void;
}) {
  const [data, setData] = useState<Record<string, unknown>>(() => ({
    ...schedule,
    kind: schedule?.kind || "appointment",
    due_local: schedule
      ? new Date(Date.parse(schedule.due_at) + 7 * 3600000).toISOString().slice(0, 16)
      : `${vnDay()}T09:00`,
    interval_days: schedule?.interval_days || 15,
  }));
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const lock = useRef(false);
  const key = useRef(crypto.randomUUID());
  const save = useCrmMutation("crm_schedule_save");
  const { data: templates = [] } = useQuery(crmTemplatesQuery(uid));
  const v = (k: string) => String(data[k] ?? "");
  const set = (k: string, val: unknown) => {
    setData((d) => ({ ...d, [k]: val }));
    setDirty(true);
  };
  return (
    <CrmModal
      title={schedule ? "Sửa / Dời lịch" : "Đặt lịch chăm sóc"}
      onClose={onClose}
      dirty={dirty}
      busy={save.isPending}
    >
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (lock.current) return;
          lock.current = true;
          try {
            setError("");
            await save.mutateAsync({
              ...data,
              customer_id: customer.id,
              request_key: key.current,
              due_at: `${v("due_local")}:00+07:00`,
            });
            toast.success("Đã lưu lịch chăm sóc");
            onClose();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Chưa lưu được lịch.");
          } finally {
            lock.current = false;
          }
        }}
      >
        <p className="font-medium">{customer.name}</p>
        <Field label="Loại lịch">
          <Pick
            label="Loại lịch"
            value={v("kind")}
            onChange={(x) => set("kind", x)}
            options={[
              { id: "appointment", name: "Lịch hẹn cụ thể" },
              { id: "recurring", name: "Chăm sóc định kỳ" },
              { id: "seasonal", name: "Mùa vụ / Sự kiện" },
            ]}
          />
        </Field>
        <Field label="Mẫu chăm sóc">
          <Pick
            label="Chọn mẫu (không bắt buộc)"
            value=""
            onChange={(id) => {
              const t = templates.find((x) => x.id === id);
              if (t) {
                setData((d) => ({
                  ...d,
                  goal: t.goal,
                  channel: t.channel,
                  interval_days: t.interval_days,
                  kind: "recurring",
                }));
                setDirty(true);
              }
            }}
            options={templates.filter((t) => t.active)}
          />
        </Field>
        <Field label="Ngày hẹn">
          <Input
            aria-label="Ngày hẹn"
            type="datetime-local"
            required
            value={v("due_local")}
            onChange={(e) => set("due_local", e.target.value)}
          />
        </Field>
        {v("kind") === "recurring" && (
          <>
            <Field label="Chu kỳ (ngày)">
              <Input
                aria-label="Chu kỳ (ngày)"
                type="number"
                min={1}
                max={3660}
                value={v("interval_days")}
                onChange={(e) => set("interval_days", e.target.value)}
              />
            </Field>
            <Field label="Lịch cố định theo thứ">
              <Pick
                label="Theo lần hoàn tất gần nhất"
                value={v("fixed_weekday")}
                onChange={(x) => set("fixed_weekday", x)}
                options={Array.from({ length: 7 }, (_, i) => ({
                  id: String(i),
                  name: i === 0 ? "Chủ nhật" : `Thứ ${i + 1}`,
                }))}
              />
            </Field>
          </>
        )}
        <Field label="Người liên hệ">
          <Pick
            label="Chọn người liên hệ"
            value={v("contact_id")}
            onChange={(x) => set("contact_id", x)}
            options={contacts.filter((c) => c.active)}
          />
        </Field>
        <Field label="Kênh liên hệ">
          <Pick
            label="Kênh liên hệ"
            value={v("channel") || "phone"}
            onChange={(x) => set("channel", x)}
            options={Object.entries(CHANNELS).map(([id, name]) => ({ id, name }))}
          />
        </Field>
        <Field label="Mục tiêu chăm sóc">
          <Input
            aria-label="Mục tiêu chăm sóc"
            list="crm-goals"
            value={v("goal")}
            onChange={(e) => set("goal", e.target.value)}
          />
          <datalist id="crm-goals">
            {catalogs
              .filter((c) => c.kind === "goal" && c.active)
              .map((c) => (
                <option key={c.id} value={c.name} />
              ))}
          </datalist>
        </Field>
        <Field label="Nội dung cần trao đổi">
          <Textarea value={v("content")} onChange={(e) => set("content", e.target.value)} />
        </Field>
        {v("kind") === "seasonal" && (
          <Field label="Nhắc trước (ngày)">
            <Input
              type="number"
              min={0}
              value={v("reminder_days")}
              onChange={(e) => set("reminder_days", e.target.value)}
            />
          </Field>
        )}
        {schedule && (
          <Field label="Lý do thay đổi lịch">
            <Textarea
              aria-label="Lý do thay đổi lịch"
              value={v("reason")}
              onChange={(e) => set("reason", e.target.value)}
            />
          </Field>
        )}
        <ErrorText error={error} />
        <div className="crm-form-footer">
          <Button type="submit" className="w-full" disabled={save.isPending}>
            {save.isPending ? "Đang lưu…" : "Lưu lịch chăm sóc"}
          </Button>
        </div>
      </form>
    </CrmModal>
  );
}
export function InteractionForm({
  customer,
  contacts,
  catalogs,
  schedule,
  onClose,
}: {
  customer: Customer;
  contacts: Contact[];
  catalogs: Catalog[];
  schedule?: Schedule;
  onClose: () => void;
}) {
  const [data, setData] = useState<Record<string, unknown>>({
    contact_id: schedule?.contact_id || contacts.find((c) => c.is_primary)?.id || "",
    channel: schedule?.channel || "phone",
    next_action: "keep",
  });
  const [error, setError] = useState("");
  const key = useRef(crypto.randomUUID());
  const lock = useRef(false);
  const save = useCrmMutation("crm_interaction_save");
  const v = (k: string) => String(data[k] ?? "");
  const set = (k: string, val: unknown) => setData((d) => ({ ...d, [k]: val }));
  return (
    <CrmModal
      title="Cập nhật chăm sóc"
      onClose={onClose}
      dirty={Object.keys(data).length > 3}
      busy={save.isPending}
    >
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (lock.current) return;
          lock.current = true;
          try {
            setError("");
            await save.mutateAsync({
              ...data,
              customer_id: customer.id,
              schedule_id: schedule?.id || null,
              revision: schedule?.revision,
              request_key: key.current,
              next_at: v("next_local") ? `${v("next_local")}:00+07:00` : null,
            });
            toast.success("Đã ghi nhận chăm sóc");
            onClose();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Chưa ghi nhận được.");
          } finally {
            lock.current = false;
          }
        }}
      >
        <p className="font-medium">{customer.name}</p>
        <Field label="Người đã liên hệ">
          <Pick
            label="Người đã liên hệ"
            value={v("contact_id")}
            onChange={(x) => set("contact_id", x)}
            options={contacts.filter((c) => c.active)}
          />
        </Field>
        <Field label="Hình thức liên hệ">
          <Pick
            label="Hình thức liên hệ"
            value={v("channel")}
            onChange={(x) => set("channel", x)}
            options={Object.entries(CHANNELS).map(([id, name]) => ({ id, name }))}
          />
        </Field>
        <Field label="Kết quả">
          <Pick
            label="Chọn kết quả"
            value={v("outcome_id")}
            onChange={(x) => set("outcome_id", x)}
            options={catalogs.filter((c) => c.kind === "outcome" && c.active)}
          />
        </Field>
        <Field label="Nội dung trao đổi">
          <Textarea
            aria-label="Nội dung trao đổi"
            required
            value={v("content")}
            onChange={(e) => set("content", e.target.value)}
          />
        </Field>
        <Field label="Bước tiếp theo">
          <Pick
            label="Bước tiếp theo"
            value={v("next_action")}
            onChange={(x) => set("next_action", x)}
            options={[
              { id: "keep", name: "Không đặt lịch mới" },
              ...(schedule?.kind === "recurring"
                ? [{ id: "continue", name: "Tiếp tục chu kỳ hiện tại" }]
                : []),
              { id: "date", name: "Đặt lịch hẹn cụ thể" },
              ...(schedule ? [{ id: "pause", name: "Tạm ngừng lịch" }] : []),
            ]}
          />
        </Field>
        {v("next_action") === "date" && (
          <Field label="Ngày hẹn tiếp theo">
            <Input
              aria-label="Ngày hẹn tiếp theo"
              required
              type="datetime-local"
              value={v("next_local")}
              onChange={(e) => set("next_local", e.target.value)}
            />
          </Field>
        )}
        {v("next_action") === "continue" && (
          <Field label="Chu kỳ tiếp theo (ngày)">
            <Input
              type="number"
              min={1}
              value={v("interval_days") || String(schedule?.interval_days || 15)}
              onChange={(e) => set("interval_days", e.target.value)}
            />
          </Field>
        )}
        {["continue", "date"].includes(v("next_action")) && (
          <Field label="Mục tiêu tiếp theo">
            <Input value={v("next_goal")} onChange={(e) => set("next_goal", e.target.value)} />
          </Field>
        )}
        {v("next_action") === "pause" && (
          <Field label="Lý do tạm ngừng">
            <Textarea
              required
              value={v("reason")}
              onChange={(e) => set("reason", e.target.value)}
            />
          </Field>
        )}
        <ErrorText error={error} />
        <div className="crm-form-footer">
          <Button type="submit" className="w-full" disabled={save.isPending || !v("outcome_id")}>
            {save.isPending ? "Đang lưu…" : "Lưu kết quả chăm sóc"}
          </Button>
        </div>
      </form>
    </CrmModal>
  );
}
export function ContactForm({
  customer,
  contact,
  onClose,
  catalogs,
}: {
  customer: Customer;
  contact?: Contact;
  onClose: () => void;
  catalogs: Catalog[];
}) {
  const [data, set] = useState<Record<string, unknown>>({
    ...contact,
    name: contact?.name || "",
    role_ids: contact?.role_ids || [],
  });
  const save = useCrmMutation("crm_contact_save");
  const [error, setError] = useState("");
  const lock = useRef(false);
  return (
    <CrmModal
      title={contact ? "Sửa người liên hệ" : "Thêm người liên hệ"}
      onClose={onClose}
      dirty
      busy={save.isPending}
    >
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (lock.current) return;
          lock.current = true;
          try {
            await save.mutateAsync({ ...data, customer_id: customer.id });
            onClose();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Chưa lưu được.");
          } finally {
            lock.current = false;
          }
        }}
      >
        {[
          ["name", "Họ tên"],
          ["phone", "Số điện thoại"],
          ["zalo", "Zalo"],
          ["email", "Email"],
          ["title", "Chức vụ"],
          ["department", "Bộ phận"],
          ["note", "Ghi chú"],
        ].map(([k, l]) => (
          <Field key={k} label={l}>
            <Input
              aria-label={l}
              value={String(data[k] || "")}
              inputMode={k === "phone" ? "tel" : undefined}
              onChange={(e) => set((d) => ({ ...d, [k]: e.target.value }))}
            />
          </Field>
        ))}
        <MultiCatalog
          label="Vai trò mua hàng"
          items={catalogs.filter((c) => c.kind === "contact_role" && c.active)}
          value={data.role_ids as string[]}
          onChange={(v) => set((d) => ({ ...d, role_ids: v }))}
        />
        <Field label="Kênh ưu tiên">
          <Pick
            label="Kênh ưu tiên"
            value={String(data.preferred_channel || "phone")}
            onChange={(v) => set((d) => ({ ...d, preferred_channel: v }))}
            options={Object.entries(CHANNELS).map(([id, name]) => ({ id, name }))}
          />
        </Field>
        <label className="flex gap-2 text-sm">
          <Checkbox
            checked={data.is_primary === true}
            onCheckedChange={(v) => set((d) => ({ ...d, is_primary: v === true }))}
          />
          Liên hệ chính
        </label>
        <label className="flex gap-2 text-sm">
          <Checkbox
            checked={data.active !== false}
            onCheckedChange={(v) => set((d) => ({ ...d, active: v === true }))}
          />
          Còn làm việc tại đơn vị
        </label>
        <ErrorText error={error} />
        <div className="crm-form-footer">
          <Button className="w-full" disabled={save.isPending} type="submit">
            Lưu người liên hệ
          </Button>
        </div>
      </form>
    </CrmModal>
  );
}
export function LocationForm({
  customer,
  location,
  onClose,
}: {
  customer: Customer;
  location?: Location;
  onClose: () => void;
}) {
  const [data, set] = useState<Record<string, unknown>>({ ...location });
  const save = useCrmMutation("crm_location_save");
  const [error, setError] = useState("");
  return (
    <CrmModal title="Địa điểm khách hàng" onClose={onClose} dirty busy={save.isPending}>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await save.mutateAsync({ ...data, customer_id: customer.id });
            onClose();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Chưa lưu được.");
          }
        }}
      >
        <Field label="Tên địa điểm">
          <Input
            value={String(data.label || "")}
            onChange={(e) => set((d) => ({ ...d, label: e.target.value }))}
          />
        </Field>
        <SearchPick
          label="Chọn tỉnh / thành phố"
          value={String(data.province_code || "")}
          onChange={(v) => set((d) => ({ ...d, province_code: v, ward_code: "" }))}
          options={locations.provinces}
        />
        <SearchPick
          label="Chọn phường / xã"
          value={String(data.ward_code || "")}
          onChange={(v) => set((d) => ({ ...d, ward_code: v }))}
          options={locations.wards.filter((w) => w.province_code === data.province_code)}
        />
        <Field label="Địa chỉ chi tiết">
          <Input
            value={String(data.address || "")}
            onChange={(e) => set((d) => ({ ...d, address: e.target.value }))}
          />
        </Field>
        <label className="flex gap-2 text-sm">
          <Checkbox
            checked={data.is_primary === true}
            onCheckedChange={(v) => set((d) => ({ ...d, is_primary: v === true }))}
          />
          Địa chỉ chính
        </label>
        <ErrorText error={error} />
        <div className="crm-form-footer">
          <Button disabled={save.isPending} className="w-full" type="submit">
            Lưu địa điểm
          </Button>
        </div>
      </form>
    </CrmModal>
  );
}
