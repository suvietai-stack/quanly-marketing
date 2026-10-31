import {it,expect} from 'vitest';
import {defaultReportCycle,reportDeadlineError,shortReportWindow} from './reportPolicy';
import {storedRange} from './periodCycle';
const rule={open:{offset_days:1,hour:8},due:{offset_days:2,hour:17},late_close:{offset_days:5,hour:17}};
it('weekly default starts on 2 November, not the running October week',()=>{expect(defaultReportCycle('2026-11-01')).toBe('month');expect(defaultReportCycle('2026-11-02')).toBe('week');expect(storedRange('week',2026,45)).toEqual({start:'2026-11-02',end:'2026-11-08'});});
it('weekly activation requires a closing milestone',()=>{expect(reportDeadlineError('week',{open:rule.open,due:rule.due},'2026-11-02')).not.toBeNull();expect(reportDeadlineError('week',rule,'2026-11-02')).toBeNull();});
it('late closing must be strictly later than direct submission due',()=>{expect(reportDeadlineError('week',{...rule,late_close:rule.due},'2026-11-02')).not.toBeNull();});
it('opening at the due time is allowed',()=>{expect(reportDeadlineError('week',{...rule,open:rule.due},'2026-11-02')).toBeNull();});
it('a Monday 00:00 to 23:00 window is flagged, not silently accepted',()=>{expect(shortReportWindow('week',{...rule,open:{offset_days:1,hour:0},due:{offset_days:1,hour:23}},'2026-11-02')).toBe(true);expect(shortReportWindow('week',rule,'2026-11-02')).toBe(false);});