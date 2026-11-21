import { r as reactExports } from "../_libs/react.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { o as otApi } from "./api-CEBEc05Q.mjs";
function usePeople() {
  const q = useQuery({ queryKey: ["ot", "people"], queryFn: otApi.people, staleTime: 6e4 });
  const map = reactExports.useMemo(() => new Map((q.data ?? []).map((p) => [p.id, p.full_name])), [q.data]);
  return { list: q.data ?? [], name: (id) => id ? map.get(id) ?? "—" : "—" };
}
export {
  usePeople as u
};
