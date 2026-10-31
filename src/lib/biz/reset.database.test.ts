import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {beforeAll,afterAll,it,expect} from 'vitest';
const db=new PGlite();const admin='00000000-0000-0000-0000-000000000001',sale='00000000-0000-0000-0000-000000000002';
async function actor(id:string){await db.query("select set_config('test.uid',$1,false)",[id]);}
async function scalar(sql:string,args:unknown[]=[]){return(await db.query<{v:any}>(sql,args)).rows[0]?.v;}
beforeAll(async()=>{
 await db.exec(`CREATE SCHEMA auth;CREATE SCHEMA private;CREATE ROLE authenticated;CREATE ROLE service_role;CREATE ROLE anon;CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT nullif(current_setting('test.uid',true),'')::uuid$$;CREATE TABLE profiles(id uuid PRIMARY KEY,full_name text,status text);CREATE FUNCTION public.is_super_admin(u uuid) RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$SELECT u='${admin}'::uuid$$;INSERT INTO profiles VALUES('${admin}','Admin','Đang hoạt động'),('${sale}','Lê Minh Ngọc','Đang hoạt động');
 CREATE TABLE biz_annual_goals(id uuid DEFAULT gen_random_uuid() PRIMARY KEY,user_id uuid,official_version_id uuid);CREATE TABLE biz_goal_versions(id uuid DEFAULT gen_random_uuid() PRIMARY KEY,goal_id uuid);CREATE TABLE biz_goal_items(id uuid DEFAULT gen_random_uuid() PRIMARY KEY,version_id uuid);CREATE TABLE biz_goal_events(id uuid DEFAULT gen_random_uuid() PRIMARY KEY,goal_id uuid,version_id uuid);
 CREATE TABLE biz_documents(id uuid DEFAULT gen_random_uuid() PRIMARY KEY,user_id uuid,kind text,official_version_id uuid);CREATE TABLE biz_document_versions(id uuid DEFAULT gen_random_uuid() PRIMARY KEY,document_id uuid);CREATE TABLE biz_document_events(id uuid DEFAULT gen_random_uuid() PRIMARY KEY,document_id uuid,version_id uuid);CREATE TABLE biz_document_views(id uuid DEFAULT gen_random_uuid() PRIMARY KEY,version_id uuid);
 CREATE TABLE biz_late_requests(id uuid DEFAULT gen_random_uuid() PRIMARY KEY,user_id uuid);CREATE TABLE biz_approval_runs(id uuid DEFAULT gen_random_uuid() PRIMARY KEY,version_id uuid);CREATE TABLE biz_approval_events(id uuid DEFAULT gen_random_uuid() PRIMARY KEY,run_id uuid);
 CREATE TABLE notifications(id uuid DEFAULT gen_random_uuid() PRIMARY KEY,kind text,dedup_key text,payload jsonb);CREATE TABLE push_deliveries(id uuid DEFAULT gen_random_uuid() PRIMARY KEY,notification_id uuid);
 CREATE TABLE biz_kr_metrics(id uuid DEFAULT gen_random_uuid() PRIMARY KEY,name text);CREATE TABLE biz_departments(id uuid DEFAULT gen_random_uuid() PRIMARY KEY,name text);CREATE TABLE biz_deadline_config(id uuid DEFAULT gen_random_uuid() PRIMARY KEY,kind text);`);
 await db.exec(readFileSync('drizzle/migrations/0149_biz_business_data_reset.sql','utf8'));
 await db.exec(`INSERT INTO biz_annual_goals(user_id) VALUES('${sale}');INSERT INTO biz_documents(user_id,kind) VALUES('${sale}','plan'),('${sale}','report');INSERT INTO biz_late_requests(user_id) VALUES('${sale}');INSERT INTO biz_approval_runs(version_id) VALUES(NULL);INSERT INTO notifications(kind,dedup_key) VALUES('biz_submitted','biz:x'),('biz_deadline','biz-deadline:x'),('signal_new','sig:x');INSERT INTO push_deliveries(notification_id) SELECT id FROM notifications;INSERT INTO biz_kr_metrics(name) VALUES('Doanh số');INSERT INTO biz_departments(name) VALUES('Kinh doanh 1');INSERT INTO biz_deadline_config(kind) VALUES('plan');`);
},30000);
afterAll(()=>db.close());

it('chỉ Super Admin được xem trước và thực hiện reset',async()=>{
 await actor(sale);
 await expect(db.query('select biz_reset_preview()')).rejects.toThrow('Chỉ Super Admin');
 await expect(db.query(`select biz_reset_execute('RESET KINH DOANH')`)).rejects.toThrow('Chỉ Super Admin');
});

it('xác nhận sai chuỗi bị từ chối, không xóa gì',async()=>{
 await actor(admin);
 await expect(db.query(`select biz_reset_execute('sai')`)).rejects.toThrow('RESET KINH DOANH');
 expect(Number(await scalar('select count(*) v from biz_documents'))).toBe(2);
});

it('preview thống kê đúng phạm vi và nhận diện hồ sơ Lê Minh Ngọc',async()=>{
 const p=await scalar('select biz_reset_preview() v');
 expect(p).toMatchObject({goals:1,plans:1,reports:1,late_requests:1,approval_runs:1,notifications:1,le_minh_ngoc:3,backups:0});
});

it('reset xóa sạch dữ liệu nghiệp vụ, giữ cấu hình, sao lưu và thông báo hạn nộp',async()=>{
 const r=await scalar(`select biz_reset_execute('RESET KINH DOANH') v`);
 expect(r.counts).toMatchObject({goals:1,plans:1,reports:1,approval_runs:1,notifications:1});
 for(const t of ['biz_annual_goals','biz_goal_versions','biz_goal_items','biz_goal_events','biz_documents','biz_document_versions','biz_document_events','biz_document_views','biz_late_requests','biz_approval_runs','biz_approval_events'])expect(Number(await scalar(`select count(*) v from ${t}`))).toBe(0);
 // Cấu hình và module khác giữ nguyên
 expect(Number(await scalar('select count(*) v from biz_kr_metrics'))).toBe(1);
 expect(Number(await scalar('select count(*) v from biz_departments'))).toBe(1);
 expect(Number(await scalar('select count(*) v from biz_deadline_config'))).toBe(1);
 expect(Number(await scalar(`select count(*) v from notifications where kind='biz_deadline'`))).toBe(1);
 expect(Number(await scalar(`select count(*) v from notifications where kind='signal_new'`))).toBe(1);
 // Sao lưu đầy đủ, riêng tư
 const b=await scalar('select counts v from private.biz_reset_backups');
 expect(b).toMatchObject({goals:1,plans:1,reports:1});
 expect(Number(await scalar('select jsonb_array_length(documents) v from private.biz_reset_backups'))).toBe(2);
 expect(Number(await scalar('select jsonb_array_length(notifications) v from private.biz_reset_backups'))).toBe(1);
});
