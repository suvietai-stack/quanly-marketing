import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { useOptions } from "./SignalsUi";

export interface SignalScopeHandle { save: () => Promise<void> }

/** Phạm vi nhóm nhu cầu của một vai trò — áp dụng cho quyền xem/quản lý/phân công/báo cáo tín hiệu. */
export const SignalScopeEditor = forwardRef<SignalScopeHandle, { roleId?: string }>(({ roleId }, ref) => {
  const o = useOptions("signal_need_groups");
  const [all, setAll] = useState(true);
  const [sel, setSel] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!roleId) return;
    (supabase as any).from("app_roles").select("signal_scope_all,signal_scope").eq("id", roleId).maybeSingle()
      .then(({ data }: any) => { if (data) { setAll(!!data.signal_scope_all); setSel(data.signal_scope ?? []); } setLoaded(true); });
  }, [roleId]);

  useImperativeHandle(ref, () => ({
    save: async () => {
      if (!roleId || !loaded) return;
      const { error } = await (supabase as any).from("app_roles")
        .update({ signal_scope_all: all, signal_scope: all ? [] : sel }).eq("id", roleId);
      if (error) throw error;
    },
  }), [roleId, loaded, all, sel]);

  const names = [...o.all.map((x) => x.name), ...sel.filter((n) => !o.all.some((x) => x.name === n))];
  const inactive = (n: string) => !o.all.find((x) => x.name === n)?.active;

  return (
    <div className="rounded border p-3 space-y-2">
      <div>
        <div className="text-sm font-semibold">Phạm vi tín hiệu</div>
        <p className="text-xs text-muted-foreground">Áp dụng cho Xem toàn bộ, Phân công, Quản lý, Sửa, Xóa và Báo cáo tín hiệu. Không ảnh hưởng Sale nhận tín hiệu được giao và người tạo.</p>
      </div>
      {!roleId ? <p className="text-xs text-muted-foreground">Role mới mặc định theo dõi tất cả nhóm. Lưu role xong, mở lại để thu hẹp phạm vi.</p> : (
        <>
          <label className="flex items-center gap-2 text-sm font-medium"><Checkbox checked={all} onCheckedChange={(v) => setAll(!!v)} />Tất cả nhóm (tự gồm nhóm thêm sau này)</label>
          {!all && (
            <div className="grid gap-1.5 sm:grid-cols-2 pl-1">
              {names.map((n) => (
                <label key={n} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={sel.includes(n)} onCheckedChange={(v) => setSel((s) => v ? [...s, n] : s.filter((x) => x !== n))} />
                  <span>{n}{inactive(n) && <span className="text-xs text-muted-foreground"> (ngừng dùng)</span>}</span>
                </label>
              ))}
              {sel.length === 0 && <p className="text-xs text-destructive sm:col-span-2">Chưa chọn nhóm nào — role sẽ không thấy tín hiệu theo quyền quản lý.</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
});
SignalScopeEditor.displayName = "SignalScopeEditor";
