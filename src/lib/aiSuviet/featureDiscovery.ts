import { navigationGroups, type NavGroup } from '@/lib/navigation';

/**
 * A self-updating catalogue based on the same source as the Base sidebar.
 * New modules appear here automatically after their navigation entry ships.
 * It knows WHERE a function lives, never invents HOW its workflow works.
 */
export type BaseFeature = { label:string; group:string; path:string; description:string };
export type PermissionEntry={key:string;allowed:boolean};
export type PermissionSnapshot={permissions?:PermissionEntry[]};

export function discoverBaseFeatures(
  groups:Pick<NavGroup,'label'|'items'>[],
  snapshot:PermissionSnapshot|null,
  superAdmin=false
):BaseFeature[]{
  const allowed=new Set((snapshot?.permissions??[]).filter(p=>p.allowed).map(p=>p.key));
  const features:BaseFeature[]=[];
  const seen=new Set<string>();
  for(const group of groups){
    for(const item of group.items){
      if(!item.to||!item.to.startsWith('/')||item.comingSoon||item.adminOnly&&!superAdmin)continue;
      if(!superAdmin){
        if(item.perm&&!allowed.has(item.perm))continue;
        if(item.anyPerm&&!item.anyPerm.some(p=>allowed.has(p)))continue;
        if(item.kpi&&!item.anyPerm?.some(p=>allowed.has(p)))continue;
        if(item.to==='/approvals' && ![...allowed].some(x=>/^(approval|fr\.|finance\.)/.test(x)))continue;
      }
      if(seen.has(item.to))continue;
      seen.add(item.to);
      features.push({label:item.label,group:group.label,path:item.to,
        description:`Base → ${group.label} → ${item.label}`});
    }
  }
  return features;
}
export function loadBaseFeatureCatalogue(snapshot:PermissionSnapshot|null,superAdmin=false):BaseFeature[]{
  return discoverBaseFeatures(navigationGroups,snapshot,superAdmin);
}
const normalize=(s:string)=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
const noise=new Set(['cho','toi','em','anh','chi','cach','nao','the','ve','tai','tren','trong','base','chuc','nang','huong','dan','lam','sao','vao','o','dau','thao','tac','quy','trinh','phan','he','moi','cua','voi','khong','the','gi','la','mot','nhung','nhieu','danh','sach','phan','menu']);
export function findBaseFeatures(question:string,catalogue:BaseFeature[],limit=6):BaseFeature[]{
  const query=normalize(question);
  const terms=query.split(' ').filter(x=>x.length>=2&&!noise.has(x));
  if(!terms.length)return [];
  return catalogue
    .map(feature=>{
      const label=normalize(feature.label),group=normalize(feature.group);
      const phrase=label.length>3 && query.includes(label);
      const matched=terms.filter(t=>label.includes(t)||group.includes(t));
      return {feature,score:(phrase?9:0)+matched.length*2+(query.includes(group)&&group.length>3?1:0)};
    })
    .filter(x=>x.score>=2 && (x.score>=4 || terms.length===1))
    .sort((a,b)=>b.score-a.score||a.feature.label.localeCompare(b.feature.label,'vi'))
    .slice(0,limit).map(x=>x.feature);
}
export function baseFeatureHelp(feature:BaseFeature):string{
  return `Mình thấy mục “${feature.label}” nằm ở ${feature.description}. Bạn có thể mở mục đó tại ${feature.path}. Hiện Đốm mới xác nhận được vị trí chức năng này, chưa có tài liệu đủ chi tiết để hướng dẫn chính xác từng nút. Bạn có thể nhờ quản trị bổ sung hướng dẫn vào Kho kiến thức AI nhé.`;
}
