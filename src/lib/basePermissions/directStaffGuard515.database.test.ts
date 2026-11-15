import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, expect, it } from 'vitest';

const dir='docs/role-515-cutover-20261116/';
const candidate=readFileSync(dir+'direct-staff-guard-candidate.sql','utf8');
const rollback=readFileSync(dir+'direct-staff-guard-rollback.sql','utf8');
const db=new PGlite();
const superAdmin='00000000-0000-0000-0000-000000000001';
const staff='00000000-0000-0000-0000-000000000002';
const direct=async()=>Number((await db.query<{n:number}>(
  "SELECT count(*)::int n FROM public.user_roles WHERE user_id='00000000-0000-0000-0000-000000000002'"
)).rows[0]?.n??0);

beforeAll(async()=>{
  await db.exec("CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA private;"+
    "CREATE TABLE public.user_roles(user_id uuid NOT NULL,role_id text NOT NULL);"+
    "INSERT INTO public.user_roles VALUES('00000000-0000-0000-0000-000000000001','role-super-admin');");
  const start=candidate.indexOf('CREATE OR REPLACE FUNCTION private.role_515_direct_staff_guard()');
  if(start<0)throw Error('Guard DDL missing');
  await db.exec(candidate.slice(start,candidate.lastIndexOf('COMMIT;')));
},60000);
afterAll(()=>db.close());

it('keeps the existing protected direct Super Admin',async()=>{
  const r=await db.query<{n:number}>(
    "SELECT count(*)::int n FROM public.user_roles WHERE role_id='role-super-admin'");
  expect(r.rows[0].n).toBe(1);
});
it('rejects direct V1 and V2 staff Roles even for a privileged SQL writer',async()=>{
  for(const role of ['role-nhan-su-moi','role-seo','role-v2-sales-staff','role-v2-task-video']){
    await expect(db.query("INSERT INTO public.user_roles(user_id,role_id) VALUES ($1,$2)",[staff,role]))
      .rejects.toThrow('Không gán Role nhân viên trực tiếp');
  }
  expect(await direct()).toBe(0);
});
it('allows only protected administrative bootstrap IDs, without removing existing admins',async()=>{
  await db.query("INSERT INTO public.user_roles(user_id,role_id) VALUES ($1,'role-admin')",[staff]);
  expect(await direct()).toBe(1);
  await expect(db.query("UPDATE public.user_roles SET role_id='role-v2-sales-staff' WHERE user_id=$1",[staff]))
    .rejects.toThrow('Không gán Role nhân viên trực tiếp');
  expect(await direct()).toBe(1);
});
it('rollback removes guard without touching user-role rows',async()=>{
  await db.exec(rollback);
  await db.query("INSERT INTO public.user_roles(user_id,role_id) VALUES ($1,'role-v2-sales-staff')",[staff]);
  expect(await direct()).toBe(2);
  expect(Number((await db.query<{n:number}>(
    "SELECT count(*)::int n FROM public.user_roles WHERE role_id='role-super-admin'"
  )).rows[0]?.n)).toBe(1);
});
