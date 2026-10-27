import { Bell, Check, ClipboardList, Radar } from "lucide-react";
import { chipiNoticeCategory } from "@/lib/chipi";
export function ChipiNoticeIcon({ kind, className }: { kind: string; className?: string }) {
  const category = chipiNoticeCategory(kind);
  const Icon = category === "signal" ? Radar : category === "job" ? ClipboardList : category === "success" ? Check : Bell;
  return <Icon className={className} aria-hidden="true" />;
}