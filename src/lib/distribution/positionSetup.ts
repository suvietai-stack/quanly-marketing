import type { OrgConfig } from "@/lib/basePermissions/types";
import type { CatalogRole } from "@/lib/basePermissions/roleCatalog";
import { areaUnitIds, DISTRIBUTION_UNIT } from "@/lib/k3Hub/area";
import {
  centerPositionDefinitions,
  centerPositionSetup,
  missingCenterPositions,
} from "@/lib/basePermissions/centerPositions";
export { DISTRIBUTION_POSITION_ROLES } from "@/lib/basePermissions/centerPositions";

export function distributionDefinitions(config: OrgConfig, unitId: string) {
  return areaUnitIds(config.units, DISTRIBUTION_UNIT).has(unitId)
    ? centerPositionDefinitions(config, unitId)
    : [];
}
export function missingDistributionPositions(config: OrgConfig, unitId: string) {
  return !!distributionDefinitions(config, unitId).length && missingCenterPositions(config, unitId);
}
/** Compatibility entry point; all three centers share the same guarded writer. */
export function distributionPositionSetup(
  config: OrgConfig,
  unitId: string,
  roles: CatalogRole[],
  mapping: Parameters<typeof centerPositionSetup>[3] = [],
) {
  if (!distributionDefinitions(config, unitId).length)
    throw new Error("Đơn vị không thuộc nhánh Phân Phối đang hoạt động.");
  return centerPositionSetup(config, unitId, roles, mapping);
}
