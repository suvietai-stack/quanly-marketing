import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, expect, it } from 'vitest';

// Bản 66: chốt cấp bậc, Role nền chuẩn, mở rộng quyền đã kiểm chứng, duyệt tài khoản và rào xóa Role.
const db = new PGlite();
const admin = '00000000-0000-0000-0000-000000000001';
const staff = '00000000-0000-0000-0000-000000000002';
const newcomer = '00000000-0000-0000-0000-000000000003';
const val = async (sql: string, args: unknown[] = []) => (await db.query<{ v: any }>(sql, args)).rows[0]?.v;

beforeAll(async () => {
  await db.exec(`CREATE SCHEMA private;CREATE SCHEMA auth;CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;
 CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT nullif(current_setting('test.uid',true),'')::uuid$$;
 CREATE TABLE profiles(id uuid PRIMARY KEY,full_name text,status text);
 INSERT INTO profiles VALUES('${admin}','Admin','Đang hoạt động'),('${staff}','Staff','Chờ duyệt'),('${newcomer}','New','Chờ duyệt');
 CREATE TABLE auth.users(id uuid PRIMARY KEY,email_confirmed_at timestamptz,encrypted_password text,banned_until timestamptz);
 INSERT INTO auth.users VALUES('${staff}',now(),'x',NULL),('${newcomer}',now(),'x',NULL);
 CREATE TABLE app_roles(id text PRIMARY KEY,name text,description text,permissions text[],is_system boolean,catalog_state text);
 INSERT INTO app_roles VALUES
  ('role-super-admin','Super Admin','', '{}',true,'standard'),
  ('role-nhan-su-moi','Nhân sự mới','',ARRAY['task.view_mine','task.accept'],true,'compatibility'),
  ('role-standard-account-chief','Kế toán trưởng','',ARRAY['leave.create','att.create'],false,'standard'),
  ('role-legacy-mkt','Leader Marketing','',ARRAY['task.view_all'],false,'compatibility'),
  ('role-free','Role tự do','',ARRAY['overview.view'],false,'standard');
 CREATE TABLE user_roles(user_id uuid,role_id text);
 INSERT INTO user_roles VALUES('${admin}','role-super-admin'),('${staff}','role-legacy-mkt');
 CREATE TABLE org_units(id text PRIMARY KEY,parent_id text,kind text,name text,active boolean);
 INSERT INTO org_units VALUES('u-mkt',NULL,'block','Khối Marketing',true);
 CREATE TABLE org_titles(id text PRIMARY KEY,unit_id text,name text,code text,level int,kind text,capacity int,active boolean,source text,source_id text,data jsonb,revision bigint);
 INSERT INTO org_titles VALUES('b5e00000-0000-4000-8000-000000000120','u-mkt','Giám đốc Marketing','mkt_director',1,'manager',1,true,'base','x','{}',1);
 CREATE FUNCTION private.org_canonical_guard() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN RAISE EXCEPTION 'fenced';END$$;
 CREATE TRIGGER org_canonical_fence BEFORE INSERT OR UPDATE OR DELETE ON org_titles FOR EACH ROW EXECUTE FUNCTION private.org_canonical_guard();
 CREATE TABLE base_title_role_links(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),title_source text,title_id text,role_id text,is_primary boolean,scope_kind text,active boolean,reason text,updated_by uuid,enabled_permissions text[],permission_signature text);
 INSERT INTO base_title_role_links(title_source,title_id,role_id,is_primary,scope_kind,active,enabled_permissions,permission_signature)
  VALUES('base','b5e00000-0000-4000-8000-000000000120','role-standard-account-chief',true,'own',false,'{}','stale');
 CREATE TABLE base_title_role_events(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),actor_id uuid NOT NULL,title_source text,title_id text,reason text,before_data jsonb,after_data jsonb,created_at timestamptz DEFAULT now());
 CREATE TABLE mkt_specialties(id text PRIMARY KEY,name text,role_id text,active boolean,sort int,created_at timestamptz);
 INSERT INTO mkt_specialties VALUES('seo','SEO','role-legacy-mkt',true,1,now());
 CREATE TABLE account_security_logs(actor_id uuid,target_id uuid,action text);
 CREATE FUNCTION private.is_super_admin(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT $1='${admin}'::uuid$$;
 CREATE FUNCTION private.is_admin(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT $1='${admin}'::uuid$$;
 CREATE FUNCTION private.is_active(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT EXISTS(SELECT 1 FROM profiles WHERE id=$1 AND status='Đang hoạt động')$$;
 CREATE FUNCTION private.has_permission(u uuid,p text) RETURNS boolean LANGUAGE sql AS $$SELECT false$$;`);
  await db.exec(readFileSync('drizzle/migrations/0352_finalize_org_levels_standard_roles.sql', 'utf8'));
}, 30000);

afterAll(() => db.close());

it('Giám đốc Marketing là Cấp 3', async () => {
  expect(await val(`SELECT level v FROM org_titles WHERE id='b5e00000-0000-4000-8000-000000000120'`)).toBe(3);
});

it('Role nền Nhân sự mới thuộc danh mục chuẩn với quyền tối thiểu đã kiểm chứng', async () => {
  expect(await val(`SELECT catalog_state v FROM app_roles WHERE id='role-nhan-su-moi'`)).toBe('standard');
  expect(await val(`SELECT permissions v FROM app_roles WHERE id='role-nhan-su-moi'`)).toEqual(['leave.create', 'leave.view_own', 'att.create', 'att.view_own']);
});

it('danh sách quyền đã kiểm chứng mở rộng đúng phạm vi', async () => {
  expect(await val(`SELECT private.org_role_permission_ready('finance.incoming.manage') v`)).toBe(true);
  expect(await val(`SELECT private.org_role_permission_ready('leave.approve') v`)).toBe(true);
  expect(await val(`SELECT private.org_role_permission_ready('order.marketing_design.approve') v`)).toBe(true);
  expect(await val(`SELECT private.org_role_permission_ready('ot.manage') v`)).toBe(true);
  expect(await val(`SELECT private.org_role_permission_ready('order.force_status') v`)).toBe(false);
  expect(await val(`SELECT private.org_role_permission_ready('finance.incoming.bank_config') v`)).toBe(false);
  expect(await val(`SELECT private.org_role_permission_ready('settings.user_edit') v`)).toBe(false);
  expect(await val(`SELECT private.org_role_permission_ready('biz.crm_use') v`)).toBe(false);
});

it('liên kết chức vụ đồng bộ đúng phần giao đã kiểm chứng và ký lại chữ ký', async () => {
  const perms = await val(`SELECT permissions v FROM app_roles WHERE id='role-standard-account-chief'`);
  expect(perms).toContain('finance.incoming.manage');
  const enabled = await val(`SELECT enabled_permissions v FROM base_title_role_links WHERE role_id='role-standard-account-chief'`);
  expect(enabled).toContain('finance.incoming.manage');
  expect(enabled).toContain('leave.create');
  expect(await val(`SELECT l.permission_signature = md5(coalesce(r.permissions,'{}')::text) v FROM base_title_role_links l JOIN app_roles r ON r.id=l.role_id WHERE l.role_id='role-standard-account-chief'`)).toBe(true);
  expect(await val(`SELECT count(*)::int v FROM base_title_role_events WHERE title_id='b5e00000-0000-4000-8000-000000000120'`)).toBe(1);
});

it('duyệt tài khoản giữ Role hiện có, không tự thêm Role nền', async () => {
  await db.exec(`SELECT set_config('test.uid','${admin}',false)`);
  await db.query(`SELECT public.account_approve('${staff}',NULL)`);
  expect(await val(`SELECT count(*)::int v FROM user_roles WHERE user_id='${staff}'`)).toBe(1);
  expect(await val(`SELECT role_id v FROM user_roles WHERE user_id='${staff}'`)).toBe('role-legacy-mkt');
  expect(await val(`SELECT status v FROM profiles WHERE id='${staff}'`)).toBe('Đang hoạt động');
});

it('duyệt tài khoản chưa có Role thì nhận Role nền chuẩn', async () => {
  await db.exec(`SELECT set_config('test.uid','${admin}',false)`);
  await db.query(`SELECT public.account_approve('${newcomer}',NULL)`);
  expect(await val(`SELECT role_id v FROM user_roles WHERE user_id='${newcomer}'`)).toBe('role-nhan-su-moi');
});

it('duyệt tài khoản từ chối gán Role legacy', async () => {
  await db.exec(`SELECT set_config('test.uid','${admin}',false)`);
  await expect(db.query(`SELECT public.account_approve('${newcomer}','role-legacy-mkt')`)).rejects.toThrow(/danh mục chuẩn/);
});

it('không xóa Role còn tham chiếu, xóa được Role tự do', async () => {
  await expect(db.query(`DELETE FROM app_roles WHERE id='role-legacy-mkt'`)).rejects.toThrow(/ngừng sử dụng thay vì xóa/);
  await expect(db.query(`DELETE FROM app_roles WHERE id='role-nhan-su-moi'`)).rejects.toThrow(/ngừng sử dụng thay vì xóa/);
  await db.query(`DELETE FROM app_roles WHERE id='role-free'`);
  expect(await val(`SELECT count(*)::int v FROM app_roles WHERE id='role-free'`)).toBe(0);
});
