import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { beforeAll, afterAll, expect, it } from 'vitest';

const db = new PGlite();
const executive = '00000000-0000-0000-0000-000000000001';
const owner = '00000000-0000-0000-0000-000000000002';
const reviewer = '00000000-0000-0000-0000-000000000003';
const request = '00000000-0000-0000-0000-000000000004';
const functionSql = (path: string, name: string) => {
  const sql = readFileSync(path, 'utf8');
  const start = sql.indexOf(`CREATE OR REPLACE FUNCTION ${name}(`);
  if (start < 0) throw new Error(`Missing function ${name}`);
  const end = sql.indexOf('$$;', start);
  if (end < 0) throw new Error(`Missing function terminator ${name}`);
  return sql.slice(start, end + 3);
};

beforeAll(async () => {
  await db.exec(`create schema auth; create schema private;
    create function auth.uid() returns uuid language sql as $$select nullif(current_setting('test.actor',true),'')::uuid$$;
    create table test_permissions(user_id uuid, key text);
    create function private.sig_can(u uuid,p text) returns boolean language sql as $$select exists(select 1 from test_permissions where user_id=u and key=p)$$;
    create table leave_requests(id uuid,owner_id uuid,approver_id uuid,status text,decided_by uuid,decided_at timestamptz,decision_note text,updated_at timestamptz,submission_no int);
    create table leave_request_submissions(request_id uuid,no int,result text,decided_by uuid,decided_at timestamptz,note text);
    create function private.leave_log(uuid,text,jsonb) returns void language sql as $$select$$;
    insert into test_permissions values('${executive}','leave.approve'),('${executive}','leave.view_all');
    insert into leave_requests(id,owner_id,approver_id,status,submission_no) values('${request}','${owner}','${reviewer}','pending',1);
    insert into leave_request_submissions(request_id,no) values('${request}',1);`);
  await db.exec(functionSql('drizzle/migrations/0013_leave_requests_module.sql', 'public.leave_decide'));
  await db.query("select set_config('test.actor',$1,false)", [executive]);
}, 30000);
afterAll(() => db.close());

it('view-all plus approval permission cannot approve an unassigned pending request', async () => {
  await expect(db.query('select leave_decide($1,true,null)', [request])).rejects.toThrow('được chỉ định');
  expect((await db.query<{ status: string }>('select status from leave_requests where id=$1', [request])).rows[0]?.status).toBe('pending');
});
it('assigned reviewer still needs the approval Role permission', async () => {
  await db.query('update leave_requests set approver_id=$1 where id=$2', [executive, request]);
  await db.query('delete from test_permissions where key=$1', ['leave.approve']);
  await expect(db.query('select leave_decide($1,true,null)', [request])).rejects.toThrow('không có quyền');
  await db.query('insert into test_permissions values($1,$2)', [executive, 'leave.approve']);
});
it('an assigned executive cannot approve their own request', async () => {
  await db.query('update leave_requests set owner_id=$1 where id=$2', [executive, request]);
  await expect(db.query('select leave_decide($1,true,null)', [request])).rejects.toThrow('tự phê duyệt');
  await db.query('update leave_requests set owner_id=$1 where id=$2', [owner, request]);
});
it('an assigned executive cannot skip the pending status guard', async () => {
  await db.query("update leave_requests set status='recalled' where id=$1", [request]);
  await expect(db.query('select leave_decide($1,true,null)', [request])).rejects.toThrow('Chờ duyệt');
});
it('an assigned executive with the permission can approve a pending request and records the same actor', async () => {
  await db.query("update leave_requests set status='pending' where id=$1", [request]);
  await db.query('select leave_decide($1,true,null)', [request]);
  expect((await db.query<{ status: string; decided_by: string }>('select status,decided_by from leave_requests where id=$1', [request])).rows[0]).toEqual({ status: 'approved', decided_by: executive });
});