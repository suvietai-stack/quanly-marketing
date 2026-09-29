import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { otApi } from "./api";

export function usePeople() {
  const q = useQuery({ queryKey: ["ot", "people"], queryFn: otApi.people, staleTime: 60_000 });
  const map = useMemo(() => new Map((q.data ?? []).map((p) => [p.id, p.full_name])), [q.data]);
  return { list: q.data ?? [], name: (id?: string | null) => (id ? map.get(id) ?? "—" : "—") };
}
