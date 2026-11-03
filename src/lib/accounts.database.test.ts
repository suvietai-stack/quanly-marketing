import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, it, expect } from 'vitest';
const db = new PGlite();
const admin = '00000000-0000-0000-0000-000000000001';
const staff = '00000000-0000-0000-0000-000000000002';
const other = '00000000-0000-0000-0000-000000000003';
async function value(sql: string) { return (await db.query<{ v: any }>(sql)).rows[0]?.v; }
async function as(id: string, role = 'authenticated') { await db.exec(`RESET ROLE;SET test.uid='${id}';SET ROLE ${role};`); }
beforeAll(async () => {
  await db.exec(`CREATE SCHEMA auth;CREATE SCHEMA private;CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;
    GRANT USAGE ON SCHEMA public,auth,private TO authenticated,service_role;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT nullif(current_setting('test.uid',true),'')::uuid$$;
    CREATE TYPE account_status AS ENUM('Chờ duyệt','Đang hoạt động','Tạm khóa','Từ chối','Lưu trữ');
    CREATE TABLE profiles(id uuid PRIMARY KEY,username text,full_name text,email text,phone text,desired_position text,notes text,status account_status,is_system_admin boolean DEFAULT false,must_change_password boolean DEFAULT false,last_seen_at timestamptz,created_at timestamptz DEFAULT now());
    CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,email_confirmed_at timestamptz,encrypted_password text,banned_until timestamptz,raw_user_meta_data jsonb);
    CREATE TABLE app_roles(id text PRIMARY KEY,permissions text[] DEFAULT '{}');
    CREATE TABLE user_roles(user_id uuid,role_id text);
    CREATE TABLE user_permission_overrides(user_id uuid,use_custom boolean,permissions text[]);
    CREATE TABLE account_security_logs(id uuid DEFAULT gen_random_uuid(),actor_id uuid,target_id uuid,action text,created_at timestamptz DEFAULT now());
    CREATE TABLE protected_items(id int,user_id uuid);
    GRANT SELECT,UPDATE ON profiles TO authenticated;GRANT SELECT ON app_roles,user_roles,user_permission_overrides TO authenticated;
    GRANT SELECT,INSERT,UPDATE,DELETE ON protected_items TO authenticated;
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    CREATE POLICY own_profile ON profiles FOR SELECT TO authenticated USING(id=auth.uid());
    CREATE POLICY own_update ON profiles FOR UPDATE TO authenticated USING(id=auth.uid()) WITH CHECK(id=auth.uid());
    ALTER TABLE protected_items ENABLE ROW LEVEL SECURITY;
    CREATE POLICY item_owner ON protected_items FOR ALL TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
    CREATE FUNCTION private.is_active(uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$SELECT EXISTS(SELECT 1 FROM profiles WHERE id=$1 AND status='Đang hoạt động')$$;
    CREATE TRIGGER profiles_prevent_privilege_escalation BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION suppress_redundant_updates_trigger();
    INSERT INTO profiles(id,username,email,status) VALUES('${admin}','admin','admin@local','Đang hoạt động'),('${staff}','staff','staff@example.test','Chờ duyệt'),('${other}','other','other@example.test','Đang hoạt động');
    INSERT INTO auth.users(id,email,email_confirmed_at,encrypted_password,banned_until) VALUES('${admin}','admin@local',now(),'opaque-test-password',NULL),('${staff}','staff@example.test',NULL,'opaque-original-password',NULL),('${other}','other@example.test',now(),'opaque-other-password',NULL);
    INSERT INTO app_roles VALUES('role-super-admin','{}'),('role-admin','{}'),('staff','{}');
    INSERT INTO user_roles VALUES('${admin}','role-super-admin'),('${staff}','staff'),('${other}','staff');
    INSERT INTO protected_items VALUES(1,'${staff}'),(2,'${other}');
  `);
  await db.exec(readFileSync('drizzle/migrations/0181_account_auth_integrity.sql','utf8'));
  await db.exec(`DROP TRIGGER profiles_prevent_privilege_escalation ON profiles;CREATE TRIGGER profiles_prevent_privilege_escalation BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION prevent_profile_privilege_escalation();`);
  await db.exec(`CREATE TABLE k3_settings(id boolean,enabled boolean,effective_from date,plan_by time,summary_by time,max_focus int,updated_at timestamptz);
    CREATE FUNCTION k3_can(uuid,text) RETURNS boolean LANGUAGE sql AS $$SELECT true$$;
    CREATE FUNCTION private.leave_settings_current() RETURNS jsonb LANGUAGE sql AS $$SELECT '{}'::jsonb$$;
    CREATE TABLE oq_requests(id uuid,creator_id uuid,status text);
    CREATE TABLE oq_items(id uuid,request_id uuid);
    CREATE TABLE oq_item_images(id uuid DEFAULT gen_random_uuid(),request_id uuid,item_id uuid,path text,category text,caption text,created_by uuid);
  `);
  for (const migration of ['0182_account_identity_and_role_guards','0183_account_rpc_active_and_signup_guards','0184_account_caller_permission_check']) await db.exec(readFileSync(`drizzle/migrations/${migration}.sql`,'utf8'));
  await db.exec(`CREATE TRIGGER test_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();`);
}, 30000);
afterAll(() => db.close());
it('pending users cannot read owned internal rows with a valid identity', async () => {
  await as(staff); expect(await value('SELECT count(*)::int v FROM protected_items')).toBe(0);
});
it('approval leaves original Auth password and email confirmation unchanged', async () => {
  await as(admin);
  const result = await value(`SELECT account_approve('${staff}',NULL) v`);
  expect(result).toEqual({ok:true,emailConfirmed:false,ready:false});
  await db.exec('RESET ROLE');
  expect(await value(`SELECT encrypted_password v FROM auth.users WHERE id='${staff}'`)).toBe('opaque-original-password');
  expect(await value(`SELECT email_confirmed_at v FROM auth.users WHERE id='${staff}'`)).toBeNull();
  expect(await value(`SELECT role_id v FROM user_roles WHERE user_id='${staff}'`)).toBe('staff');
});
it('confirmed Auth email mirrors to profile through the lifecycle trigger', async () => {
  await db.exec(`RESET ROLE;SET test.uid='';UPDATE auth.users SET email_confirmed_at=now() WHERE id='${staff}';`);
  expect(await value(`SELECT email v FROM profiles WHERE id='${staff}'`)).toBe('staff@example.test');
});
it('ordinary users cannot approve themselves or promote their system flag', async () => {
  await as(other);
  await expect(db.query(`SELECT account_approve('${other}',NULL)`)).rejects.toThrow('Không có quyền');
  await expect(db.query(`UPDATE profiles SET is_system_admin=true WHERE id='${other}'`)).rejects.toThrow('quyền hệ thống');
});
it('profile-only email edits are denied even for an administrator', async () => {
  await as(admin);
  await db.exec('RESET ROLE');
  await expect(db.query(`UPDATE profiles SET email='different@example.test' WHERE id='${staff}'`)).rejects.toThrow('xác thực email');
});
it('failed role assignment leaves approval and role unchanged', async () => {
  await db.exec(`RESET ROLE;UPDATE profiles SET status='Chờ duyệt' WHERE id='${staff}';`);
  await as(admin);
  await expect(db.query(`SELECT account_approve('${staff}','missing-role')`)).rejects.toThrow('Role không tồn tại');
  await db.exec('RESET ROLE');
  expect(await value(`SELECT status::text v FROM profiles WHERE id='${staff}'`)).toBe('Chờ duyệt');
  expect(await value(`SELECT role_id v FROM user_roles WHERE user_id='${staff}'`)).toBe('staff');
});
it('blocked admin loses permissions and directory access without changing roles', async () => {
  await db.exec(`RESET ROLE;SET test.uid='${admin}';UPDATE profiles SET status='Tạm khóa' WHERE id='${admin}';`);
  await as(admin);
  expect(await value(`SELECT private.is_admin('${admin}') v`)).toBe(false);
  expect(await value(`SELECT private.has_permission('${admin}','settings.user_reset_password') v`)).toBe(false);
  expect(await value('SELECT count(*)::int v FROM private.get_profiles_directory()')).toBe(1);
});
it('username resolution uses literal matching, not wildcard patterns', async () => {
  await db.exec('RESET ROLE');
  expect(await value(`SELECT account_username_identity('%') v`)).toBeNull();
  expect(await value(`SELECT account_username_identity('STAFF') v`)).toBe(staff);
});
it('ten reset reservations are allowed; eleventh is rejected atomically', async () => {
  await db.exec('RESET ROLE');
  for (let i=0;i<10;i++) expect(await value(`SELECT account_auth_reserve('reset-test','reset_password','${admin}','${staff}') v`)).toBeTruthy();
  await expect(db.query(`SELECT account_auth_reserve('reset-test','reset_password','${admin}','${staff}')`)).rejects.toThrow('quá nhiều');
  expect(await value(`SELECT count(*)::int v FROM account_auth_requests WHERE bucket='reset-test'`)).toBe(10);
});
it('successful reset records target-only audit and cannot complete twice', async () => {
  const id = await value(`SELECT account_auth_reserve('reset-log','reset_password','${admin}','${staff}') v`);
  await db.query(`SELECT account_auth_finish('${id}','completed')`);
  expect(await value(`SELECT count(*)::int v FROM account_security_logs WHERE target_id='${staff}' AND action='reset_password'`)).toBe(1);
  expect(await value(`SELECT count(*)::int v FROM account_security_logs WHERE target_id='${other}' AND action='reset_password'`)).toBe(0);
  await expect(db.query(`SELECT account_auth_finish('${id}','completed')`)).rejects.toThrow('Invalid reservation');
});
it('signup lifecycle creates a pending linked profile and prevents duplicate case identities', async () => {
  await db.exec(`RESET ROLE;INSERT INTO auth.users(id,email,encrypted_password,raw_user_meta_data) VALUES('00000000-0000-0000-0000-000000000004','new@example.test','opaque-new-password','{"username":"NewStaff","is_system_admin":true}');`);
  expect(await value(`SELECT status::text v FROM profiles WHERE username='NewStaff'`)).toBe('Chờ duyệt');
  expect(await value(`SELECT is_system_admin v FROM profiles WHERE username='NewStaff'`)).toBe(false);
  await expect(db.exec(`INSERT INTO auth.users(id,email,encrypted_password,raw_user_meta_data) VALUES('00000000-0000-0000-0000-000000000005','duplicate@example.test','opaque-password','{"username":"newstaff"}');`)).rejects.toThrow('unique');
  expect(await value(`SELECT count(*)::int v FROM auth.users WHERE id='00000000-0000-0000-0000-000000000005'`)).toBe(0);
});
it('reserved admin handle is rejected by the lifecycle, not only UI', async () => {
  await expect(db.exec(`INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES('00000000-0000-0000-0000-000000000006','reserved@example.test','{"username":"ADMIN"}');`)).rejects.toThrow('Tên đăng nhập');
});
it('inactive users cannot invoke formerly owner-only privileged RPCs', async () => {
  await as(admin);
  expect(await value('SELECT leave_settings_get() v')).toBeNull();
  await expect(db.query('SELECT k3_settings_read()')).rejects.toThrow('không được phép');
  await expect(db.query(`SELECT oq_delete_draft('${staff}')`)).rejects.toThrow('không được phép');
  await expect(db.query(`SELECT oq_image_add('${staff}','x','other','')`)).rejects.toThrow('không được phép');
  await expect(db.query(`SELECT oq_image_update('${staff}','other','',false)`)).rejects.toThrow('không được phép');
});
it('inactive callers cannot use the caller-scoped account permission checker', async () => {
  await as(admin); expect(await value(`SELECT account_caller_can('settings.user_reset_password') v`)).toBe(false);
});