import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {beforeAll,afterAll,it,expect} from 'vitest';
const db=new PGlite();const admin='00000000-0000-0000-0000-000000000001',sale='00000000-0000-0000-0000-000000000002',other='00000000-0000-0000-0000-000000000004';const dept='10000000-0000-0000-0000-000000000001',metric='20000000-0000-0000-0000-000000000001';
async function actor(id:string){await db.query("select set_config('test.uid',$1,false)",[id]);}
async function scalar(sql:string,args:unknown[]=[]){return(await db.query<{v:any}>(sql,args)).rows[0]?.v;}
async function newDraft(year:number){await actor(sale);return scalar('select biz_goal_start($1) v',[year]);}
async function fillAndSubmit(versionId:string){const items=await scalar('select jsonb_agg(jsonb_build_object(\'metric_id\',metric_id,\'annual\',\'12\',\'months\',(select jsonb_agg(\'1\') from generate_series(1,12)))) v from biz_goal_items where version_id=$1',[versionId]);const rev=await scalar('select revision v from biz_goal_versions where id=$1',[versionId]);await db.query('select biz_goal_save($1,$2,$3,true)',[versionId,rev,items]);}
beforeAll(async()=>{
 await db.exec(`CREATE SCHEMA auth;CREATE SCHEMA private;CREATE ROLE authenticated;CREATE ROLE service_role;CREATE ROLE anon;CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT nullif(current_setting('test.uid',true),'')::uuid$$;CREATE TABLE profiles(id uuid PRIMARY KEY,full_name text,status text);CREATE TABLE app_roles(id text,permissions text[],updated_at timestamptz);CREATE TABLE user_permission_overrides(user_id uuid,use_custom boolean,permissions text[]);CREATE FUNCTION public.is_super_admin(u uuid) RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$SELECT u='${admin}'::uuid$$;CREATE FUNCTION private.sig_can(u uuid,p text) RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$SELECT u='${admin}'::uuid OR (u='${sale}'::uuid AND p IN ('biz.view_own','biz.goal_submit'))$$;INSERT INTO profiles VALUES('${admin}','Admin','Đang hoạt động'),('${sale}','Sale','Đang hoạt động'),('${other}','Other','Đang hoạt động');CREATE TABLE notifications(id uuid DEFAULT gen_random_uuid(),recipient_id uuid,kind text,dedup_key text UNIQUE,payload jsonb,zalo_status text,push_status text,CONSTRAINT notifications_kind_check CHECK(kind IN ('signal_new')));`);
 for(const f of ['0088_biz_management_foundation','0089_biz_annual_goals_and_scoped_foundation','0090_biz_membership_serialized_boundaries'])await db.exec(readFileSync(`drizzle/migrations/${f}.sql`,'utf8'));
 await db.exec(`CREATE TABLE biz_approval_runs(version_id uuid,status text);CREATE FUNCTION public.biz_scope_ok(uuid,uuid,uuid) RETURNS boolean LANGUAGE sql AS $$ SELECT true $$;CREATE FUNCTION public.biz_approval_start(uuid,text,uuid,uuid,jsonb) RETURNS uuid LANGUAGE sql AS $$ SELECT NULL::uuid $$;`);
 await db.exec(readFileSync('drizzle/migrations/0134_biz_goal_draft_delete.sql','utf8'));
 await db.exec(`INSERT INTO biz_departments(id,name) VALUES('${dept}','Quà tặng');INSERT INTO biz_department_members(department_id,user_id,is_manager,effective_from,started_at) VALUES('${dept}','${sale}',false,'2026-01-01','2026-01-01T00:00:00+07');INSERT INTO biz_kr_metrics(id,department_id,name,unit,aggregation,value_kind,direction,active) VALUES('${metric}','${dept}','Doanh số','đồng','sum','money','higher',true);`);
},30000);
afterAll(()=>db.close());

it('chủ sở hữu xóa được bản nháp chưa gửi; hồ sơ năm không còn phiên bản nào thì biến mất',async()=>{
 const v=await newDraft(2031);
 expect(Number(await scalar('select count(*) v from biz_goal_items where version_id=$1',[v]))).toBe(1);
 await db.query('select biz_goal_draft_delete($1)',[v]);
 expect(Number(await scalar('select count(*) v from biz_goal_versions where id=$1',[v]))).toBe(0);
 expect(Number(await scalar('select count(*) v from biz_goal_items where version_id=$1',[v]))).toBe(0);
 expect(Number(await scalar('select count(*) v from biz_goal_events where version_id=$1',[v]))).toBe(0);
 expect(Number(await scalar(`select count(*) v from biz_annual_goals where user_id='${sale}' and year=2031`))).toBe(0);
});

it('biz_goal_start không tạo trùng bản nháp: gọi lại trả về đúng bản đang dở',async()=>{
 const v1=await newDraft(2032);const v2=await newDraft(2032);
 expect(v2).toBe(v1);
 expect(Number(await scalar(`select count(*) v from biz_goal_versions v join biz_annual_goals g on g.id=v.goal_id where g.user_id='${sale}' and g.year=2032`))).toBe(1);
});

it('chặn xóa bản chờ duyệt và bản đã duyệt/chính thức',async()=>{
 const v=await scalar(`select v.id v from biz_goal_versions v join biz_annual_goals g on g.id=v.goal_id where g.user_id='${sale}' and g.year=2032`);
 await fillAndSubmit(v);
 await expect(db.query('select biz_goal_draft_delete($1)',[v])).rejects.toThrow('Chỉ xóa được bản nháp chưa gửi duyệt');
 // Duyệt thủ công để thành bản chính thức.
 await actor(admin);
 await db.query(`update biz_goal_versions set status='approved',approved_at=now(),approved_by='${admin}' where id=$1`,[v]);
 await db.query('update biz_annual_goals set official_version_id=$1 where year=2032',[v]);
 await expect(db.query('select biz_goal_draft_delete($1)',[v])).rejects.toThrow();
});

it('xóa bản nháp điều chỉnh giữ nguyên mục tiêu chính thức',async()=>{
 await actor(sale);
 const adj=await scalar('select biz_goal_start($1,$2) v',[2032,'Cần cập nhật chỉ tiêu']);
 expect(adj).toBeTruthy();
 await db.query('select biz_goal_draft_delete($1)',[adj]);
 // Bản chính thức vẫn còn nguyên và là bản duy nhất.
 expect(Number(await scalar(`select count(*) v from biz_goal_versions v join biz_annual_goals g on g.id=v.goal_id where g.user_id='${sale}' and g.year=2032`))).toBe(1);
 expect(await scalar(`select status v from biz_goal_versions v join biz_annual_goals g on g.id=v.goal_id where g.user_id='${sale}' and g.year=2032`)).toBe('approved');
 expect(await scalar(`select official_version_id is not null v from biz_annual_goals where user_id='${sale}' and year=2032`)).toBe(true);
});

it('người khác không xóa được bản nháp không thuộc quyền',async()=>{
 const v=await newDraft(2033);
 await actor(other);
 await expect(db.query('select biz_goal_draft_delete($1)',[v])).rejects.toThrow('Không có quyền');
 await actor(admin);await db.query('select biz_goal_draft_delete($1)',[v]);
 expect(Number(await scalar('select count(*) v from biz_goal_versions where id=$1',[v]))).toBe(0);
});
