import { expect, it } from 'vitest';
import { appointmentCurrent, currentTitles, vietnamTimestamp, type Appointment } from './positions';
it('appointments start inclusively and finish exclusively without activating future or cancelled decisions', () => {
 const a = { status: 'active' as const, started_at: '2026-10-30T08:00:00+07:00', ended_at: '2026-11-01T08:00:00+07:00' };
 expect(appointmentCurrent(a, '2026-10-30T07:59:59+07:00')).toBe(false);
 expect(appointmentCurrent(a, a.started_at)).toBe(true);
 expect(appointmentCurrent(a, a.ended_at)).toBe(false);
 expect(appointmentCurrent({ ...a, status: 'cancelled' }, a.started_at)).toBe(false);
});
it('appointment dates preserve Vietnam local input as an explicit UTC+7 timestamp', () => {
 expect(vietnamTimestamp('2026-10-30T15:30')).toBe('2026-10-30T15:30:00+07:00');
 expect(new Date(vietnamTimestamp('2026-10-30T15:30')).toISOString()).toBe('2026-10-30T08:30:00.000Z');
});
const title=(id:string,level:number):Appointment=>({id,user_id:'u',position_id:id,system_id:null,department_id:'d',team_id:null,scope_kind:'department',started_at:'2026-01-01',ended_at:null,status:'active',replaces_id:null,position_snapshot:{id,code:null,name:id,description:'',level,unit_kind:'department',sort_order:0,active:true}});
it('highest effective title wins while all concurrent appointments are retained',()=>{expect(currentTitles([title('lead',1),title('head',2)],'u','2026-10-31').map(a=>a.id)).toEqual(['head','lead']);});
it('ending highest title restores the remaining title',()=>{expect(currentTitles([title('lead',1),{...title('head',2),ended_at:'2026-10-01'}],'u','2026-10-31')[0]?.id).toBe('lead');});
it('equal rank primary title selection is deterministic regardless of query order',()=>{expect(currentTitles([title('b',2),title('a',2)],'u','2026-10-31')[0]?.id).toBe('a');expect(currentTitles([title('a',2),title('b',2)],'u','2026-10-31')[0]?.id).toBe('a');});