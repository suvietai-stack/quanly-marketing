import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, beforeEach, afterAll, expect, it } from 'vitest';
const db = new PGlite();
const actor = '00000000-0000-0000-0000-000000000001';
const other = '00000000-0000-0000-0000-000000000002';
const signal = '00000000-0000-0000-0000-000000000003';
const value = async (sql: string, args: unknown[] = []) => (await db.query<{v: unknown}>(sql,args)).rows[0]?.v;
const remove = () => value('select public.signal_delete($1) v',[signal]);
beforeAll(async () => {
  await db.exec(`create schema auth;create schema private;create role anon;create role authenticated;create role service_role;
    create table profiles(id uuid primary key,active boolean);create table permissions(user_id uuid,key text);
    create table opportunity_signals(id uuid primary key,created_by uuid,assigned_to uuid,status text,need_groups text[]);
    create table opportunity_signal_notes(signal_id uuid references opportunity_signals on delete cascade);
    create table signal_progression_assignments(signal_id uuid references opportunity_signals);
    create table notifications(signal_id uuid references opportunity_signals on delete cascade);
    create function auth.uid() returns uuid language sql as $$select nullif(current_setting('test.actor',true),'')::uuid$$;
    create function private.is_active(u uuid) returns boolean language sql as $$select coalesce((select active from profiles where id=u),false)$$;
    create function private.sig_can(u uuid,p text) returns boolean language sql as $$select exists(select 1 from permissions where user_id=u and key=p)$$;
    create function private.sig_scope_context(u uuid) returns jsonb language sql as $$select jsonb_build_object('all',coalesce(current_setting('test.scope',true),'true')::boolean)$$;
    create function private.sig_scope_matches(c jsonb,g text[]) returns boolean language sql as $$select (c->>'all')::boolean$$;`);
  await db.exec(readFileSync('docs/signal-delete-2026-11-12/apply.sql','utf8'));
});
afterAll(async () => db.close());
beforeEach(async () => {
  await db.exec('truncate notifications,signal_progression_assignments,opportunity_signal_notes,opportunity_signals,permissions,profiles');
  await db.query("select set_config('test.actor',$1,false),set_config('test.scope','true',false)",[actor]);
  await db.query('insert into profiles values($1,true),($2,true)',[actor,other]);
  await db.query("insert into permissions values($1,'signal.delete'),($1,'signal.create')",[actor]);
  await db.query('insert into opportunity_signals values($1,$2,null,null,ARRAY[]::text[])',[signal,actor]);
});
it('deletes an eligible signal and dependent notifications atomically',async()=>{
  await db.query('insert into notifications values($1)',[signal]);
  expect(await remove()).toBe(true);
  expect(await value('select count(*)::int v from opportunity_signals')).toBe(0);
  expect(await value('select count(*)::int v from notifications')).toBe(0);
});
it('requires the dedicated delete or management permission',async()=>{
  await db.exec("delete from permissions where key='signal.delete'");
  await expect(remove()).rejects.toThrow('không có quyền xóa');
  expect(await value('select count(*)::int v from opportunity_signals')).toBe(1);
});
it('denies inactive accounts',async()=>{
  await db.query('update profiles set active=false where id=$1',[actor]);
  await expect(remove()).rejects.toThrow('không có quyền xóa');
});
it('does not expand SELECT visibility for delete-only users',async()=>{
  await db.query('update opportunity_signals set created_by=$1',[other]);
  await expect(remove()).rejects.toThrow('không có quyền xem');
});
it('preserves the group scope boundary even for managers',async()=>{
  await db.query("insert into permissions values($1,'signal.manage')",[actor]);
  await db.exec("select set_config('test.scope','false',false)");
  await expect(remove()).rejects.toThrow('không có quyền xem');
});
it.each(['won','lost'])('keeps a terminal %s signal',async(status)=>{
  await db.query('update opportunity_signals set status=$1',[status]);
  await expect(remove()).rejects.toThrow('Chốt/Trượt');
});
it('keeps consultation history',async()=>{
  await db.query('insert into opportunity_signal_notes values($1)',[signal]);
  await expect(remove()).rejects.toThrow('nhật ký tư vấn');
  expect(await value('select count(*)::int v from opportunity_signal_notes')).toBe(1);
});
it('explains the assignment FK restriction without erasing historical assignments',async()=>{
  await db.query('insert into signal_progression_assignments values($1)',[signal]);
  await expect(remove()).rejects.toThrow('Hãy dùng Hủy tín hiệu');
  expect(await value('select count(*)::int v from signal_progression_assignments')).toBe(1);
});
it('does not expose the RPC to anonymous callers',async()=>{
  expect(await value("select has_function_privilege('anon','public.signal_delete(uuid)','EXECUTE') v")).toBe(false);
  expect(await value("select has_function_privilege('authenticated','public.signal_delete(uuid)','EXECUTE') v")).toBe(true);
});
