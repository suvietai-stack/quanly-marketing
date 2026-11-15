import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, expect, it } from 'vitest';

// All tests are isolated PGlite. There are NO production database connections.
const dir='docs/role-515-cutover-20261116/';
const candidate=readFileSync(dir+'account-approval-candidate.sql','utf8');
const rollback=readFileSync(dir+'account-approval-rollback.sql','utf8');
const before=readFileSync(dir+'account-approve-before.sql','utf8');
const db=new PGlite();
const ADMIN='00000000-0000-0000-0000-000000000001';
const PENDING='00000000-0000-0000-0000-000000000002';
const ORIGINAL_PRODUCTION_MD5='e374f12498c68c720bdffed4c8289941';
const count=async(sql:string)=>Number((await db.query<{n:number}>(sql)).rows[0]?.n ?? 0);

beforeAll(async()=>{
  const statements=[
    'CREATE ROLE anon','CREATE ROLE authenticated','CREATE SCHEMA auth','CREATE SCHEMA private',
    "CREATE TABLE public.profiles(id uuid PRIMARY KEY,status text)",
    "CREATE TABLE auth.users(id uuid PRIMARY KEY,email_confirmed_at timestamptz,encrypted_password text,banned_until timestamptz)",
    "CREATE TABLE public.app_roles(id text PRIMARY KEY)",
    "CREATE TABLE public.user_roles(user_id uuid,role_id text REFERENCES public.app_roles(id))",
    "CREATE TABLE public.account_security_logs(actor_id uuid,target_id uuid,action text)",
    "CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('test.actor',true),'')::uuid $$",
    "CREATE FUNCTION private.is_active(u uuid) RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id=u AND status='Đang hoạt động') $$",
    "CREATE FUNCTION private.is_admin(u uuid) RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT u='00000000-0000-0000-0000-000000000001'::uuid $$",
    "CREATE FUNCTION private.is_super_admin(u uuid) RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT u='00000000-0000-0000-0000-000000000001'::uuid $$",
    "CREATE FUNCTION private.has_permission(u uuid,p text) RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT false $$",
    "INSERT INTO app_roles VALUES('role-super-admin'),('role-nhan-su-moi')",
    "INSERT INTO profiles VALUES('00000000-0000-0000-0000-000000000001','Đang hoạt động'),('00000000-0000-0000-0000-000000000002','Chờ duyệt')",
    "INSERT INTO auth.users VALUES('00000000-0000-0000-0000-000000000001',now(),'hash',null),('00000000-0000-0000-0000-000000000002',now(),'hash',null)",
    "INSERT INTO user_roles VALUES('00000000-0000-0000-0000-000000000001','role-super-admin'),('00000000-0000-0000-0000-000000000005','role-super-admin')"
  ];
  await db.exec(statements.join(';\n')+';');
  await db.exec(before);
  const h=(await db.query<{md5:string}>(
    "SELECT md5(pg_get_functiondef('public.account_approve(uuid,text)'::regprocedure)) md5"
  )).rows[0].md5;
  // pg_get_functiondef formatting may differ by Postgres/PGlite version.
  // Adapt ONLY the isolated reference hash; production SQL retains its live-pinned hash.
  const adapted=candidate.replaceAll(ORIGINAL_PRODUCTION_MD5,h);
  const start=adapted.indexOf('CREATE TABLE private.role_515_approval_backup');
  if(start<0)throw Error('Candidate SQL body not found');
  const body=adapted.slice(start,adapted.lastIndexOf('COMMIT;'));
  await db.exec(body);
},60000);
afterAll(()=>db.close());

it('creates an exact private backup and keeps both protected Super Admin assignments',async()=>{
  expect(await count('SELECT count(*)::int n FROM private.role_515_approval_backup')).toBe(1);
  expect(await count("SELECT count(*)::int n FROM user_roles WHERE role_id='role-super-admin'")).toBe(2);
});
it('rejects manual Role IDs from old clients, including privileged and default roles',async()=>{
  await db.query("SELECT set_config('test.actor',$1,false)",[ADMIN]);
  for(const role of ['role-nhan-su-moi','role-super-admin']){
    await expect(db.query('SELECT public.account_approve($1,$2)',[PENDING,role]))
      .rejects.toThrow('Không gán Role trực tiếp');
  }
  expect(await count("SELECT count(*)::int n FROM user_roles WHERE user_id='00000000-0000-0000-0000-000000000002'")).toBe(0);
});
it('denies inactive/unauthenticated approval',async()=>{
  await db.query("SELECT set_config('test.actor','',false)");
  await expect(db.query('SELECT public.account_approve($1)',[PENDING]))
    .rejects.toThrow('Không có quyền duyệt tài khoản');
});
it('approves staff with zero direct Role assignments',async()=>{
  await db.query("SELECT set_config('test.actor',$1,false)",[ADMIN]);
  const result=await db.query<{v:{ok:boolean,ready:boolean}}>(
    'SELECT public.account_approve($1) v',[PENDING]);
  expect(result.rows[0].v.ok).toBe(true);
  expect(await count("SELECT count(*)::int n FROM user_roles WHERE user_id='00000000-0000-0000-0000-000000000002'")).toBe(0);
  expect(await count("SELECT count(*)::int n FROM profiles WHERE id='00000000-0000-0000-0000-000000000002' AND status='Đang hoạt động'")).toBe(1);
});
it('rollback guards against drift and restores original approval definition',async()=>{
  const md5=(await db.query<{md5:string}>(
    "SELECT old_md5 md5 FROM private.role_515_approval_backup WHERE id='role-515-approval-20261116'"
  )).rows[0].md5;
  const adapted=rollback.replaceAll(ORIGINAL_PRODUCTION_MD5,md5);
  await db.exec(adapted);
  expect(await count("SELECT count(*)::int n FROM private.role_515_approval_backup WHERE status='rolled_back'")).toBe(1);
  await db.exec("UPDATE profiles SET status='Chờ duyệt' WHERE id='00000000-0000-0000-0000-000000000002'");
  await db.query("SELECT set_config('test.actor',$1,false)",[ADMIN]);
  await db.query('SELECT public.account_approve($1)',[PENDING]);
  expect(await count("SELECT count(*)::int n FROM user_roles WHERE user_id='00000000-0000-0000-0000-000000000002' AND role_id='role-nhan-su-moi'")).toBe(1);
});
