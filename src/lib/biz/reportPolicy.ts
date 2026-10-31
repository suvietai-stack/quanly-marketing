import {milestonesFor,milestoneOrderError} from './deadline';
import {periodOfDate,type ReportCycle} from './periodCycle';
import type {BizDeadlineRule} from './types';

export const WEEKLY_EFFECTIVE_FROM='2026-11-02';
export function defaultReportCycle(date:string):ReportCycle{return date>=WEEKLY_EFFECTIVE_FROM?'week':'month';}
export function reportDeadlineError(cycle:ReportCycle,rule:BizDeadlineRule|undefined,date:string):string|null{
 const p=periodOfDate(cycle,date);const m=milestonesFor(`report_${cycle}`,rule,p.year,p.period);
 if(!m.open||!m.due||!m.late_close)return 'Cần hoàn tất cả ba mốc: mở nộp, hạn cuối và đóng nộp bù trước khi áp dụng chu kỳ.';
 if(m.open>m.due||m.due>=m.late_close)return 'Mở nộp không được sau hạn cuối; hạn cuối phải trước đóng nộp bù.';
 return milestoneOrderError(`report_${cycle}`,rule??{});
}
export function shortReportWindow(cycle:ReportCycle,rule:BizDeadlineRule|undefined,date:string){const p=periodOfDate(cycle,date);const m=milestonesFor(`report_${cycle}`,rule,p.year,p.period);return !!m.open&&!!m.due&&Date.parse(`${m.due.replace(' ','T')}+07:00`)-Date.parse(`${m.open.replace(' ','T')}+07:00`)<86400000;}