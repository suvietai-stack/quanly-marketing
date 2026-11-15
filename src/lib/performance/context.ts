export type DashboardContext={userId:string;asOf:string;identity:{name:string;placements:{unit:string;title:string}[]};units:{id:string;name:string;parent_id:string|null}[];people:{id:string;name:string;units:string[]}[];capabilities:{work:boolean;k3:boolean;business:boolean;signals:boolean};canUseBusiness?:boolean;canManage:boolean};
export const managementAllowed=(c:DashboardContext)=>c.canManage&&Object.values(c.capabilities).some(Boolean);
export function managedTargets(c:DashboardContext){
 if(!c.capabilities.work)return [];
 const units=new Set(c.units.map(u=>u.id));
 return [...new Set(c.people.filter(p=>p.units.some(u=>units.has(u))).map(p=>p.id))];
}
