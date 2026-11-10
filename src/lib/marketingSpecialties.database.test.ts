import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, expect, it } from 'vitest';
const db = new PGlite();
const own = '00000000-0000-0000-0000-000000000001';
const other = '00000000-0000-0000-0000-000000000002';
beforeAll(async () => {
  await db.exec(`create schema auth; create schema private; create role anon; create role authenticated; create role service_role;
  create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('test.uid',true),'')::uuid $$;
  create function private.is_active(u uuid) returns boolean language sql as $$ select current_setting('test.active',true)='true' $$;
  create function private.is_super_admin(u uuid) returns boolean language sql as $$ select current_setting('test.super',true)='true' $$;
  create function public.account_caller_can(p text) returns boolean language sql as $$ select p=any(string_to_array(current_setting('test.permissions',true),',')) $$;
  create table profiles(id uuid,full_name text,status text);
  create table mkt_specialties(id text,active boolean);
  create table mkt_staff_specialties(user_id uuid,specialty_id text,state text,is_primary boolean);
  alter table mkt_staff_specialties enable row level security;
  grant select on mkt_staff_specialties to authenticated;
  create policy mkt_staff_spec_read on mkt_staff_specialties for select to authenticated using(true);
  insert into mkt_staff_specialties values('${own}','video','active',false),('${other}','video','active',false);
  insert into profiles values('${own}','Own','Đang hoạt động'),('${other}','Other','Đang hoạt động');
  insert into mkt_specialties values('video',true);`);
  await db.exec(readFileSync('drizzle/migrations/0316_marketing_specialty_scoped_reads.sql', 'utf8'));
}, 30000);
afterAll(() => db.close());
async function rows(permission = '', active = true, superAdmin = false) {
  await db.query("select set_config('test.uid',$1,false),set_config('test.active',$2,false),set_config('test.permissions',$3,false),set_config('test.super',$4,false)", [own, String(active), permission, String(superAdmin)]);
  await db.exec('set role authenticated');
  try { return (await db.query<{ user_id: string }>('select user_id from mkt_staff_specialties order by user_id')).rows.map(x => x.user_id); }
  finally { await db.exec('reset role'); }
}
it('ordinary active staff see only their own specialties', async () => expect(await rows()).toEqual([own]));
it.each(['settings.user_view', 'settings.role', 'settings.permission'])('%s allows the manager to read all specialties', async p => expect(await rows(p)).toEqual([own, other]));
it('Super Admin can read all specialties', async () => expect(await rows('', true, true)).toEqual([own, other]));
it('inactive accounts cannot read even their own specialties', async () => expect(await rows('settings.role', false)).toEqual([]));
it('candidate RPC cannot bypass the same read boundary', async () => {
  await rows();
  await db.exec('set role authenticated');
  try { expect((await db.query<{ user_id: string }>("select user_id from mkt_specialty_candidates('video')")).rows.map(x => x.user_id)).toEqual([own]); }
  finally { await db.exec('reset role'); }
});