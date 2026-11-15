import {describe,it,expect} from 'vitest';
import {managedTargets,managementAllowed,type DashboardContext} from './context';
const base:DashboardContext={userId:'a',asOf:'now',identity:{name:'A',placements:[]},units:[{id:'deptA',name:'A',parent_id:null}],people:[{id:'a',name:'A',units:['deptA']},{id:'b',name:'B',units:['deptB']}],capabilities:{work:true,k3:false,business:false,signals:false},canManage:true};
describe('dashboard context boundaries',()=>{
 it('never uses people outside the authorized units',()=>expect(managedTargets(base)).toEqual(['a']));
 it('never falls back to the current user when a management unit is empty',()=>expect(managedTargets({...base,people:[]})).toEqual([]));
 it('a 3K management capability does not authorize a marketing work roster',()=>expect(managedTargets({...base,capabilities:{...base.capabilities,work:false,k3:true}})).toEqual([]));
 it('management is not inferred from names or titles',()=>expect(managementAllowed({...base,canManage:false,identity:{name:'Director',placements:[{unit:'A',title:'Giám đốc'}]}})).toBe(false));
});
