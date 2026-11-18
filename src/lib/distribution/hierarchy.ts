import type { ChartNode } from "@/lib/orgChart";
import { DISTRIBUTION_UNIT } from "@/lib/k3Hub/area";
import { B2B_CENTER, BTC_CENTER, HANOI_SHOWROOM, RETAIL_SYSTEM } from "@/lib/orgCenters";

/** Display projection only; retain original IDs, holders and action targets. */
export function distributionVisualHierarchy(roots: ChartNode[]): ChartNode[] {
  const promoted: ChartNode[] = [];
  const names: Record<string, string> = {
    [DISTRIBUTION_UNIT]: "Trung tâm Kinh doanh Phân Phối",
    [B2B_CENTER]: "Trung tâm Kinh doanh B2B",
    [BTC_CENTER]: "Trung tâm Kinh doanh BTC",
    [HANOI_SHOWROOM]: "Showroom Hà Nội",
    "61efa9bf-0de8-43d5-95c8-f0578627a40e": "Phòng Kinh doanh Sứ Quà Tặng 1",
    "28239f0c-0657-4b88-8287-5b715a2387dd": "Phòng Kinh doanh Quà Tặng 2",
    "cef13ee0-73a8-43c4-bfe5-6bef393248fc": "Phòng Kinh doanh Phân Phối 1",
  };
  const centers = new Set([DISTRIBUTION_UNIT, B2B_CENTER, BTC_CENTER]);
  const detach = (nodes: ChartNode[]): ChartNode[] =>
    nodes.flatMap((node) => {
      let children = detach(node.children);
      if (node.id === BTC_CENTER)
        children = children.flatMap((child) => {
          if (child.id !== RETAIL_SYSTEM) return [child];
          // Keep the active showroom directly under BTC. Only reveal the old
          // Retail wrapper when it contains recorded positions, holders,
          // historical appointments or metadata that must remain inspectable.
          return child.wrapperProtected
            ? [...child.children, {
                ...child,
                children: [],
                hierarchyWarning: "Đơn vị lịch sử — chỉ xem, không bổ nhiệm mới.",
              }]
            : child.children;
        });
      if (centers.has(node.id)) {
        promoted.push({
          ...node,
          name: names[node.id],
          kind: "block",
          visualHierarchy: true,
          children,
        });
        return [];
      }
      return [{ ...node, name: names[node.id] ?? node.name, children }];
    });
  const detached = detach(roots);
  // Remove only an entirely empty old Business wrapper from the *display*.
  // Never remove units with assigned people, titles, slots, other children or history.
  const prune = (nodes: ChartNode[]): ChartNode[] =>
    nodes.flatMap((node) => {
      const children = prune(node.children);
      if (node.id === "biz-block" && !children.length && !node.leader
          && !node.people.length && !node.slots?.length && !node.wrapperProtected)
        return [];
      return [{ ...node, children }];
    });
  const remaining = prune(detached);
  if (!promoted.length) return roots;
  const company = remaining.find((node) => node.kind === "company");
  return company
    ? remaining.map((node) =>
        node === company ? { ...node, children: [...node.children, ...promoted] } : node,
      )
    : [...remaining, ...promoted];
}
