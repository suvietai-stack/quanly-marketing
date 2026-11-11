import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, beforeEach, expect, it } from 'vitest';

// account_org_summary: trang Tài khoản đọc phân công từ Cơ cấu tổ chức (chỉ đọc).
const db = new PGlite();
const admin = '00000000-0000-0000-0000-000000000001';
const viewer = '00000000-0000-0000-0000-000000000003';
const staff = '00000000-0000-0000-0000-000000000002';
const outsider = '00000000-0000-0000-0000-000000000004';
const val = async (sql: string, args: unknown[] = []) => (await db.query<{ v: any }>(sql, args)).rows[0]?.v;

beforeAll(async () => {
  await db.exec(`CREATE SCHEMA private;CREATE SCHEMA auth;CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;
 CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT nullif(current_setting('test.uid',true),'')::uuid$$;
 CREATE TABLE profiles(id uuid PRIMARY KEY,full_name text,status text);
 INSERT INTO profiles VALUES('${admin}','Admin','Đang hoạt động'),('${viewer}','Viewer','Đang hoạt động'),('${staff}','Staff','Đang hoạt động'),('${outsider}','Out','Đang hoạt động');
 CREATE TABLE app_roles(id text PRIMARY KEY,name text,permissions text[]);
 INSERT INTO app_roles VALUES('role-seo','SEO','{}'),('role-nhan-su-moi','Nhân sự mới','{}');
 CREATE TABLE user_roles(user_id uuid,role_id text);
 CREATE TABLE org_units(id text PRIMARY KEY,parent_id text,kind text,name text,active boolean,source text,source_id text,data jsonb,revision bigint);
 INSERT INTO org_units VALUES('u-mkt',NULL,'department','Marketing',true,'base','u-mkt','{}',1);
 CREATE TABLE org_titles(id text PRIMARY KEY,unit_id text,name text,code text,level int,kind text,capacity int,active boolean,source text,source_id text,data jsonb,revision bigint);
 INSERT INTO org_titles VALUES('t-seo','u-mkt','Chuyên viên SEO',NULL,1,'staff',0,true,'base','t-seo','{}',1);
 CREATE TABLE org_assignments(id text PRIMARY KEY,unit_id text,title_id text,user_id uuid,category text,starts_at timestamptz,ends_at timestamptz,status text,source text,source_id text,data jsonb,revision bigint);
 CREATE TABLE mkt_specialties(id text PRIMARY KEY,name text,role_id text,active boolean,sort int,created_at timestamptz);
 INSERT INTO mkt_specialties VALUES('seo','SEO','role-seo',true,1,now());
 CREATE TABLE mkt_staff_specialties(user_id uuid,specialty_id text,state text,origin text,is_primary boolean,source jsonb,synced_at timestamptz,updated_by uuid,updated_at timestamptz);
 CREATE FUNCTION private.is_super_admin(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT $1='${admin}'::uuid$$;
 CREATE FUNCTION private.is_active(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT EXISTS(SELECT 1 FROM profiles WHERE id=$1 AND status='Đang hoạt động')$$;
 CREATE FUNCTION private.has_permission(u uuid,p text) RETURNS boolean LANGUAGE sql AS $$SELECT u='${viewer}'::uuid AND p='settings.user_view'$$;`);
  await db.exec(readFileSync('drizzle/migrations/0350_account_org_summary.sql', 'utf8'));
}, 30000);

beforeEach(async () => {
  await db.exec(`DELETE FROM org_assignments;DELETE FROM mkt_staff_specialties;DELETE FROM user_roles;SELECT set_config('test.uid','${admin}',false);`);
});
afterAll(() => db.close());

const summary = (target: string) => val('select public.account_org_summary($1) v', [target]);

it('Super Admin đọc được phân công, chuyên môn và Role hiệu lực', async () => {
  await db.query(`INSERT INTO org_assignments VALUES('a1','u-mkt','t-seo','${staff}','primary',NULL,NULL,'active','base','a1','{}',1)`);
  await db.query(`INSERT INTO mkt_staff_specialties VALUES('${staff}','seo','active','manual',true,'{}',NULL,NULL,now())`);
  await db.query(`INSERT INTO user_roles VALUES('${staff}','role-seo')`);
  const s = await summary(staff);
  expect(s.assignments).toHaveLength(1);
  expect(s.assignments[0].unit_name).toBe('Marketing');
  expect(s.assignments[0].title_name).toBe('Chuyên viên SEO');
  expect(s.specialties.map((x: any) => x.name)).toEqual(['SEO']);
  expect(s.roles.map((x: any) => x.name)).toEqual(['SEO']);
});

it('tài khoản chưa bổ nhiệm trả về danh sách rỗng', async () => {
  const s = await summary(staff);
  expect(s.assignments).toEqual([]);
  expect(s.specialties).toEqual([]);
  expect(s.roles).toEqual([]);
});

it('phân công đã kết thúc hoặc chưa hiệu lực không hiển thị', async () => {
  await db.query(`INSERT INTO org_assignments VALUES('a1','u-mkt','t-seo','${staff}','primary',NULL,'2000-01-01','active','base','a1','{}',1)`);
  await db.query(`INSERT INTO org_assignments VALUES('a2','u-mkt','t-seo','${staff}','primary','2099-01-01',NULL,'active','base','a2','{}',1)`);
  await db.query(`INSERT INTO org_assignments VALUES('a3','u-mkt','t-seo','${staff}','primary',NULL,NULL,'cancelled','base','a3','{}',1)`);
  expect((await summary(staff)).assignments).toEqual([]);
});

it('người có quyền settings.user_view đọc được; người thường bị chặn', async () => {
  await db.query(`SELECT set_config('test.uid','${viewer}',false)`);
  expect((await summary(staff)).user_id).toBe(staff);
  await db.query(`SELECT set_config('test.uid','${outsider}',false)`);
  await expect(summary(staff)).rejects.toThrow('Không có quyền');
});

it('chuyên môn đã gỡ không còn hiển thị', async () => {
  await db.query(`INSERT INTO mkt_staff_specialties VALUES('${staff}','seo','removed','manual',false,'{}',NULL,NULL,now())`);
  expect((await summary(staff)).specialties).toEqual([]);
});
