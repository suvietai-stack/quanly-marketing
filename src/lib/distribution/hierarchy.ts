import type { ChartNode } from "@/lib/orgChart";
import { DISTRIBUTION_UNIT } from "@/lib/k3Hub/area";

/** Display projection only; retain original IDs, holders and action targets. */
export function distributionVisualHierarchy(roots: ChartNode[]): ChartNode[] {
  let distribution: ChartNode | undefined;
  const detach = (nodes: ChartNode[]): ChartNode[] =>
    nodes.flatMap((node) => {
      if (node.id === DISTRIBUTION_UNIT) {
        distribution = {
          ...node,
          name: "Trung tâm Kinh doanh Phân Phối",
          kind: "block",
          visualHierarchy: true,
        };
        return [];
      }
      return [{ ...node, children: detach(node.children) }];
    });
  const remaining = detach(roots);
  if (!distribution) return roots;
  const center = distribution;
  const company = remaining.find((node) => node.kind === "company");
  return company
    ? remaining.map((node) =>
        node === company ? { ...node, children: [...node.children, center] } : node,
      )
    : [...remaining, center];
}
