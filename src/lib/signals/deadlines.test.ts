import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {beforeAll,afterAll,describe,it,expect} from 'vitest';
import {suggestedProgressionStatus,deadlineLink} from './deadlines';
const db=new PGlite();
beforeAll(async()=>{
 await db.exec('CREATE SCHEMA private;');
 for(const [file,name] of [['0070_signal_progression_deadline_periods.sql','private.progression_boundary'],['0071_signal_progression_live_calendar.sql','private.progression_calendar'],['0072_signal_progression_early_close_exemption.sql','private.progression_outcome']]){
  const sql=readFileSync(`drizzle/migrations/${file}`,'utf8');
  const start=sql.indexOf(`FUNCTION ${name}`);
  const end=sql.indexOf('$$;',start)+3;
  await db.exec('CREATE '+sql.slice(start,end));
 }
},20000);
afterAll(()=>db.close());
async function outcome(end:string|null,note:string|null,asof='2026-11-08 12:00+07'){
 const r=await db.query<{outcome:string}>("select private.progression_outcome('2026-11-07 00:00+07',$1::timestamptz,$2::timestamptz,$3::timestamptz) outcome",[end,note,asof]);
 return r.rows[0]?.outcome;
}
describe('authoritative calendar and outcomes',()=>{
 it('fixed deadlines are day +5,+12,+19,+26,+56,+86',async()=>{
  const r=await db.query<{due_on:string}>("select due_on::text from private.progression_calendar('2026-11-01 10:00+07',null,'2027-01-27 10:00+07')");
  expect(r.rows.map(x=>x.due_on)).toEqual(['2026-11-06','2026-11-13','2026-11-20','2026-11-27','2026-12-27','2027-01-26','2027-02-25']);
 });
 it('Vietnam midnight belongs only to new period',async()=>{
  const r=await db.query<{sequence:number}>("select sequence from private.progression_calendar('2026-11-01 10:00+07',null,'2026-11-08 10:00+07') where '2026-11-07 00:00+07'::timestamptz>=starts_at and '2026-11-07 00:00+07'::timestamptz<ends_at");
  expect(r.rows).toEqual([{sequence:2}]);
 });
 it('five notes satisfy one period only',async()=>{
  const r=await db.query<{count:number}>("with notes as(select '2026-11-03 10:00+07'::timestamptz t from generate_series(1,5)) select count(*)::int count from private.progression_calendar('2026-11-01 10:00+07',null,'2026-11-08 10:00+07') p where exists(select 1 from notes n where n.t>=p.starts_at and n.t<p.ends_at)");
  expect(r.rows[0]?.count).toBe(1);
 });
 it('elapsed period without note is missed',async()=>expect(await outcome(null,null)).toBe('missed'));
 it('late note never repairs previous period',async()=>expect(await outcome(null,'2026-11-07 12:00+07')).toBe('missed'));
 it('closing early exempts even an already noted period',async()=>expect(await outcome('2026-11-05 12:00+07','2026-11-03 12:00+07')).toBe('exempt'));
 it('closing after deadline keeps missed result',async()=>expect(await outcome('2026-11-08 12:00+07',null)).toBe('missed'));
 it('handover excludes new Sale note from old responsibility',async()=>expect(await outcome('2026-11-08 12:00+07','2026-11-09 12:00+07','2026-11-10 12:00+07')).toBe('missed'));
 it('activation starts old open signal today without retroactive periods',async()=>{
  const r=await db.query<{sequence:number}>("select sequence from private.progression_calendar('2026-11-01 10:00+07',null,'2026-11-01 10:00+07')");
  expect(r.rows).toEqual([{sequence:1}]);
 });
 it('KR denominator excludes retrospective periods before rule start',async()=>{
  const r=await db.query<{due:number;retro_due:number;rate:number|null}>("with p(due_on,outcome) as(values('2026-10-20'::date,'on_time'),('2026-10-25'::date,'missed'),('2026-11-05'::date,'on_time'),('2026-11-06'::date,'missed')) select count(*) filter(where due_on>='2026-10-29')::int due,count(*) filter(where due_on<'2026-10-29')::int retro_due,count(*) filter(where outcome='on_time' and due_on>='2026-10-29')*100.0/nullif(count(*) filter(where due_on>='2026-10-29'),0) rate from p");
  expect(r.rows[0]).toEqual({due:2,retro_due:2,rate:'50.0000000000000000'});
 });
 it('due sample excludes future and exempt periods, and empty rate is null',async()=>{
  const r=await db.query<{due:number;rate:number|null}>("with p(ends_at,outcome) as(values('2026-11-07 00:00+07'::timestamptz,'on_time'),('2026-11-07 00:00+07','missed'),('2026-11-14 00:00+07','pending'),('2026-11-07 00:00+07','exempt')) select count(*)::int due,count(*) filter(where outcome='on_time')*100.0/nullif(count(*),0) rate from p where ends_at<='2026-11-08 12:00+07' and outcome<>'exempt'");
  expect(r.rows[0]).toEqual({due:2,rate:'50.0000000000000000'});
  const empty=await db.query<{rate:number|null}>("select 0*100.0/nullif(0,0) rate");expect(empty.rows[0]?.rate).toBeNull();
 });
});
describe('status proposals and filtered navigation',()=>{
 it('quote proposes quoted, not automatic won',()=>expect(suggestedProgressionStatus('consulting',['Đã gửi báo giá'])).toBe('quoted'));
 it('maket cannot move quoted backward',()=>expect(suggestedProgressionStatus('quoted',['Đang thiết kế maket'])).toBeNull());
 it('order agreement never auto closes',()=>expect(suggestedProgressionStatus('consulting',['Khách đồng ý đặt hàng'])).toBeNull());
 it('overdue link preserves selected Sale and group',()=>expect(new URL(deadlineLink('overdue','sale','Sứ quà tặng'),'https://example.test').searchParams.get('sale')).toBe('sale'));
});