import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Dự phòng phía client: nhờ máy chủ gửi push ngay (trigger CSDL là đường chính). */
export const pushDispatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const s = await import("./push.server");
    const r = await s.processPush(20);
    return { sent: r.sent ?? 0 };
  });

export const pushTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const s = await import("./push.server");
    return s.sendTest(context.userId);
  });
