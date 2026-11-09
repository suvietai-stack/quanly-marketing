import { expect,it } from 'vitest';
import { firstNoteStat } from './noteReport';
it('reuses working time across overnight: 16:50 to next workday 08:10 is 20 minutes',()=>{
 expect(firstNoteStat([{signal_id:'s',sale:'a',accepted:'2026-11-06T16:50:00+07:00',first_note:'2026-11-07T08:10:00+07:00'}])).toEqual({avg:20,valid:1,missing:0,cycles:1});
});
it('excludes zero work time and missing notes from the average',()=>{
 expect(firstNoteStat([{signal_id:'s',sale:'a',accepted:'2026-11-08T09:00:00+07:00',first_note:'2026-11-08T10:00:00+07:00'},{signal_id:'t',sale:'a',accepted:'2026-11-07T08:00:00+07:00',first_note:null}])).toEqual({avg:null,valid:0,missing:1,cycles:2});
});
it('retains positive subminute samples and rejects preacceptance time',()=>{
 expect(firstNoteStat([{signal_id:'s',sale:'a',accepted:'2026-11-07T08:00:00+07:00',first_note:'2026-11-07T08:00:30+07:00'},{signal_id:'t',sale:'a',accepted:'2026-11-07T09:00:00+07:00',first_note:'2026-11-07T08:00:00+07:00'}]).avg).toBe(0.5);
});