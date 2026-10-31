import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {beforeAll,afterAll,it,expect} from 'vitest';
const db=new PGlite();const admin='00000000-0000-0000-0000-000000000001',sale='00000000-0000-0000-0000-000000000002',leader='00000000-0000-0000-0000-000000000003',other='00000000-0000-0000-0000-000000000004';const dept='10000000-0000-0000-0000-000000000001';
async function actor(id:string){await db.query("select set_config('test.uid',$1,false)",[id]);}
async function scalar(sql:string,args:unknown[]=[]){return(await db.query<{v:any}>(sql,args)).rows[0]?.v;}
async function saveCfg(kind:string,rule:unknown){await actor(admin);await db.query('select biz_deadline_save($1)',[JSON.stringify({[kind]:rule})]);}
/** Kỳ tháng hiện tại theo giờ VN (lệch múi giờ PGlite/UTC tối đa nửa ngày — chấp nhận cho kiểm thử). */
function vnNow(){const vn=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit'}).format(new Date());const[y,m]=vn.split('-').map(Number);return{year:y,month:m};}
beforeAll(async()=>{
 await db.exec(`CREATE SCHEMA auth;CREATE SCHEMA private;CREATE ROLE authenticated;CREATE ROLE service_role;CREATE ROLE anon;CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT nullif(current_setting('test.uid',true),'')::uuid$$;CREATE TABLE profiles(id uuid PRIMARY KEY,full_name text,status text);CREATE TABLE app_roles(id text,permissions text[],updated_at timestamptz);CREATE TABLE user_permission_overrides(user_id uuid,use_custom boolean,permissions text[]);CREATE FUNCTION public.is_super_admin(u uuid) RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$SELECT u='${admin}'::uuid$$;CREATE FUNCTION private.sig_can(u uuid,p text) RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$SELECT u='${admin}'::uuid OR (u='${sale}'::uuid AND p IN ('biz.view_own','biz.plan_submit','biz.report_submit')) OR (u='${leader}'::uuid AND p IN ('biz.view_dept','biz.plan_approve','biz.report_approve','biz.view_own'))$$;INSERT INTO profiles VALUES('${admin}','Admin','Đang hoạt động'),('${sale}','Sale','Đang hoạt động'),('${leader}','Leader','Đang hoạt động'),('${other}','Other','Đang hoạt động');CREATE TABLE notifications(id uuid DEFAULT gen_random_uuid(),recipient_id uuid,kind text,dedup_key text UNIQUE,payload jsonb,zalo_status text,push_status text,CONSTRAINT notifications_kind_check CHECK(kind IN ('signal_new')));`);
 for(const f of ['0088_biz_management_foundation','0089_biz_annual_goals_and_scoped_foundation','0090_biz_membership_serialized_boundaries','0091_biz_documents_foundation','0092_biz_document_workflow','0093_biz_document_aggregation_guards','0094_biz_base_notifications','0095_biz_notification_recipient_scope','0096_biz_deadline_and_reminder_access','0097_biz_report_baseline_scope','0098_biz_report_frozen_baselines','0099_biz_dashboard_scoped_months','0100_biz_dashboard_exact_aggregates','0101_biz_dashboard_trends','0102_biz_dashboard_completeness_summary','0103_biz_plan_revision_flow'])await db.exec(readFileSync(`drizzle/migrations/${f}.sql`,'utf8'));
 await db.exec(`CREATE TABLE biz_approval_runs(version_id uuid,status text);CREATE FUNCTION public.biz_scope_ok(uuid,uuid,uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT true $$;CREATE FUNCTION public.biz_approval_start(uuid,text,uuid,uuid,jsonb) RETURNS uuid LANGUAGE sql AS $$ SELECT NULL::uuid $$;`);
 for(const f of ['0122_biz_report_instant_official','0123_biz_report_guard_instant_official','0124_biz_plan_link_requirement','0125_biz_attachment_url_regex_portable','0126_biz_plan_view_tracking','0127_biz_deadline_milestones','0128_biz_late_submit_requests','0129_biz_milestone_month_offset','0130_biz_deadline_auto_notify','0131_biz_department_head_single_source','0132_biz_my_work_open_periods'])await db.exec(readFileSync(`drizzle/migrations/${f}.sql`,'utf8'));
 await db.exec(`INSERT INTO biz_departments(id,name) VALUES('${dept}','Quà tặng');INSERT INTO biz_department_members(department_id,user_id,is_manager,effective_from,started_at) VALUES('${dept}','${sale}',false,'2026-01-01','2026-01-01T00:00:00+07'),('${dept}','${leader}',true,'2026-01-01','2026-01-01T00:00:00+07');`);
 await saveCfg('plan_month',{open:{day:25,offset:-1,hour:0,minute:0},due:{day:3,offset:0,hour:23,minute:59},late_close:{day:15,offset:0,hour:23,minute:59}});
},30000);
afterAll(()=>db.close());

it('tự liệt kê kỳ đang mở nộp, kỳ quá hạn và kỳ sắp mở mà không cần chọn tháng',async()=>{
 await actor(sale);
 const res=await scalar("select biz_my_work('plan') v");
 const rows=res.rows as {period_kind:string;year:number;period:number;phase:string}[];
 const{year,month}=vnNow();
 const next=month===12?{year:year+1,month:1}:{year,month:month+1};
 const prev=month===1?{year:year-1,month:12}:{year,month:month-1};
 // Kỳ tháng hiện tại: còn trong hạn nộp/nộp bù (đến hết ngày 15) thì phải xuất hiện; sau đó đã đóng kỳ → không còn là việc cần làm.
 const day=Number(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',day:'2-digit'}).format(new Date()));
 const cur=rows.find(r=>r.period_kind==='month'&&r.year===year&&r.period===month);
 if(day<=15){expect(cur).toBeTruthy();expect(['open','overdue']).toContain(cur!.phase);}else expect(cur).toBeUndefined();
 // Tháng tiếp theo: đã mở (sau ngày 25) hoặc sắp mở — đều phải xuất hiện.
 const nxt=rows.find(r=>r.period_kind==='month'&&r.year===next.year&&r.period===next.month);
 expect(nxt).toBeTruthy();expect(['open','not_open']).toContain(nxt!.phase);
 // Tháng trước đã qua hạn: còn trong hạn nộp bù thì overdue, qua ngày 15 thì đã đóng và biến mất khỏi danh sách việc cần làm.
 const prv=rows.find(r=>r.period_kind==='month'&&r.year===prev.year&&r.period===prev.month);
 const day=Number(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',day:'2-digit'}).format(new Date()));
 if(day>15)expect(prv).toBeUndefined();else expect(prv?.phase).toBe('overdue');
 // Không tự tạo bản nháp khi chỉ đọc danh sách.
 expect(Number(await scalar(`select count(*) v from biz_documents where user_id='${sale}'`))).toBe(0);
});

it('kỳ đã nộp không còn là việc cần xử lý; quá hạn chưa nộp vẫn hiện với trạng thái nộp bù',async()=>{
 const{year,month}=vnNow();
 const next=month===12?{year:year+1,month:1}:{year,month:month+1};
 await actor(sale);
 await db.query('select biz_document_start($1,$2,$3,$4)',['plan','month',next.year,next.month]);
 const doc=await scalar(`select id v from biz_documents where user_id='${sale}' and kind='plan' and period_kind='month' and year=${next.year} and period=${next.month}`);
 const ver=await scalar(`select id v from biz_document_versions where document_id='${doc}' order by version desc limit 1`);
 const phase=await scalar(`select biz_deadline_phase('plan_month',${next.year},${next.month},now()) v`);
 if(phase==='open'){
  await db.query('select biz_document_save($1,$2,$3,$4,$5,$6)',[ver,0,'https://docs.google.com/document/d/abc123XYZ/edit','',[],true]);
  const res=await scalar("select biz_my_work('plan') v");
  const row=(res.rows as any[]).find(r=>r.period_kind==='month'&&r.year===next.year&&r.period===next.month);
  expect(row).toBeUndefined();
 }
 // Kỳ hiện tại quá hạn (sau ngày 3) hoặc đang mở: tạo yêu cầu nộp bù khi quá hạn thì danh sách phải phản ánh đúng.
 const curPhase=await scalar(`select biz_deadline_phase('plan_month',${year},${month},now()) v`);
 if(curPhase==='overdue'){
  await db.query('select biz_late_request_create($1,$2,$3,$4,$5)',['plan','month',year,month,'Lý do kiểm thử']);
  const res=await scalar("select biz_my_work('plan') v");
  const row=(res.rows as any[]).find(r=>r.period_kind==='month'&&r.year===year&&r.period===month);
  expect(row?.phase).toBe('overdue');expect(row?.late_status).toBe('pending');
 }
});

it('người không có quyền nộp không đọc được danh sách công việc',async()=>{
 await actor(other);
 await expect(db.query("select biz_my_work('plan')")).rejects.toThrow('Không có quyền');
});
