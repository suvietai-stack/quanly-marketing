import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
import {beforeAll,afterAll,it,expect} from 'vitest';
const db=new PGlite();const A='00000000-0000-0000-0000-000000000001',B='00000000-0000-0000-0000-000000000002',D='00000000-0000-0000-0000-000000000003';
beforeAll(async()=>{await db.exec(`CREATE SCHEMA auth;CREATE SCHEMA private;CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT nullif(current_setting('test.uid',true),'')::uuid$$;
CREATE TABLE profiles(id uuid,full_name text,username text,status text);CREATE TABLE test_perms(uid uuid,p text);
CREATE FUNCTION private.is_active(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT EXISTS(SELECT 1 FROM profiles WHERE id=$1 AND status='Đang hoạt động')$$;
CREATE FUNCTION private.is_admin(uuid) RETURNS boolean LANGUAGE sql AS $$SELECT false$$;
CREATE FUNCTION private.has_permission(uuid,text) RETURNS boolean LANGUAGE sql AS $$SELECT EXISTS(SELECT 1 FROM test_perms WHERE uid=$1 AND p=$2)$$;
CREATE TABLE orders(id text primary key,data jsonb,is_demo boolean default false,created_by uuid,created_at timestamptz default now(),updated_at timestamptz default now());GRANT ALL ON orders TO authenticated;ALTER TABLE orders ENABLE ROW LEVEL SECURITY;CREATE POLICY legacy_all ON orders TO authenticated USING(true) WITH CHECK(true);CREATE TABLE web_contents(id text,data jsonb);
INSERT INTO profiles VALUES('${A}','Sale A','a','Đang hoạt động'),('${B}','Sale B','b','Đang hoạt động'),('${D}','Designer','d','Đang hoạt động');
INSERT INTO test_perms SELECT '${A}',unnest(ARRAY['order.view','order.create','order.complete','order.approve','order.edit']);INSERT INTO test_perms SELECT '${B}',unnest(ARRAY['order.view','order.create']);INSERT INTO test_perms SELECT '${D}',unnest(ARRAY['order.view','order.take','order.submit','order.edit','order.deliver','order.resubmit']);
INSERT INTO orders(id,created_by,data) VALUES('a','${A}','{"title":"A","status":"Chờ phân công","requester":"Sale A","reviewer":"Sale A","history":[]}'),('b','${B}','{"title":"B","status":"Chờ phân công","requester":"Sale B","reviewer":"Sale B","history":[]}');`);
await db.exec(readFileSync('drizzle/migrations/0264_design_order_workflows_and_scoped_access.sql','utf8'));await db.exec(readFileSync('drizzle/migrations/0265_design_order_guard_and_atomic_save.sql','utf8'));await db.exec(readFileSync('drizzle/migrations/0267_design_order_authoritative_audit.sql','utf8'));await db.exec('GRANT USAGE ON SCHEMA auth,private TO authenticated;');},60000);
beforeAll(async()=>{await db.exec(readFileSync('drizzle/migrations/0268_design_order_transition_timestamp_integrity.sql','utf8'));await db.exec(readFileSync('drizzle/migrations/0269_design_order_file_permission_compatibility.sql','utf8'));});
afterAll(()=>db.close());
it.each([
  ['Mới tạo', 'Chờ phân công', 'Chờ nhận việc', A],
  ['Đang làm', 'Đang thực hiện', 'Chờ duyệt', D],
])('legacy status %s accepts the displayed expected value and preserves old history',async(raw,displayed,next,uid)=>{
  await db.exec("RESET ROLE;select set_config('test.uid','',false)");
  const id=`legacy-${raw}`;
  const history=[{at:'2026-01-01T00:00:00Z',action:'Legacy creation',byId:A}];
  await db.query(`INSERT INTO orders(id,created_by,data) VALUES($1,$2,$3)`,[id,A,JSON.stringify({title:'Legacy',status:raw,requester:'Sale A',reviewer:'Sale A',assignee:'Designer',history})]);
  await db.exec(`INSERT INTO test_perms VALUES('${A}','order.send_request')`);
  await as(uid);
  const result=await db.query<{v:{status:string;history:unknown[]}}>(`SELECT design_order_save($1,$2,$3) v`,[id,JSON.stringify({status:next,history:[...history,{action:'Next step'}]}),JSON.stringify({status:displayed,history})]);
  expect(result.rows[0]?.v.status).toBe(next);
  expect(result.rows[0]?.v.history[0]).toEqual(history[0]);
  await expect(db.query(`SELECT design_order_save($1,$2,$3)`,[id,JSON.stringify({status:'Đã hủy'}),JSON.stringify({status:displayed})])).rejects.toThrow('đã được cập nhật');
});
it('unknown legacy status is not silently treated as an equivalent expected status',async()=>{
  await db.exec("RESET ROLE;select set_config('test.uid','',false)");
  await db.query(`INSERT INTO orders(id,created_by,data) VALUES('unknown-status',$1,'{"status":"Unrecognized","requester":"Sale A","history":[]}')`,[A]);
  await as(A);
  await expect(db.query(`SELECT design_order_save('unknown-status','{"status":"Đã hủy"}','{"status":"Chờ phân công"}')`)).rejects.toThrow('đã được cập nhật');
});
async function as(uid:string){await db.exec('RESET ROLE');await db.query("select set_config('test.uid',$1,false)",[uid]);await db.exec('SET ROLE authenticated');}
it('Sale A cannot read Sale B even with permissive legacy policies',async()=>{await as(A);expect((await db.query<{id:string}>('select id from orders order by id')).rows.map(r=>r.id)).toEqual(['a']);});
it('create permission never grants all orders or cross-user writes',async()=>{await as(A);await expect(db.query(`select design_order_save('b','{"title":"stolen"}',NULL)`)).rejects.toThrow('Không có quyền xem');});
it('designer sees eligible unassigned jobs and only that creator sees totals',async()=>{await as(D);expect((await db.query('select * from orders')).rows).toHaveLength(2);await as(B);expect((await db.query('select * from orders')).rows).toHaveLength(1);});
it('classification-only manager write cannot erase history or timestamps',async()=>{await db.exec("RESET ROLE;select set_config('test.uid','',false)");await db.exec(`INSERT INTO test_perms VALUES('${A}','order.assign');UPDATE orders SET data=data||'{"history":[{"at":"2026-11-01T00:00:00Z","action":"Tạo","byName":"A"}]}' WHERE id='a';`);await as(A);await expect(db.query(`select design_order_save('a','{"history":[]}',NULL)`)).rejects.toThrow('Không được sửa');await expect(db.query(`select design_order_save('a','{"completedAt":"2000-01-01"}',NULL)`)).rejects.toThrow('mốc xử lý');});
it('history prevents delete even when delete permission exists',async()=>{await db.exec('RESET ROLE');await db.exec(`INSERT INTO test_perms VALUES('${A}','order.delete')`);await as(A);await expect(db.query("delete from orders where id='a'")).rejects.toThrow('có lịch sử');});
it('explicit view flow scope cannot be bypassed with legacy view',async()=>{await db.exec("RESET ROLE;select set_config('test.uid','',false)");await db.exec(`UPDATE orders SET workflow_kind='photo',data=data||'{"workflowKind":"photo"}' WHERE id='a';INSERT INTO test_perms VALUES('${B}','order.marketing_design.view')`);await as(B);expect((await db.query('select * from orders')).rows).toHaveLength(0);});
it('concurrent patch rejects changed edited fields without overwriting other fields',async()=>{await as(A);await db.query(`select design_order_save('a','{"title":"New"}', '{"title":"A"}')`);await expect(db.query(`select design_order_save('a','{"title":"Lost"}', '{"title":"A"}')`)).rejects.toThrow('đã được cập nhật');expect((await db.query<{v:string}>("select data->>'title' v from orders where id='a'")).rows[0]?.v).toBe('New');});
it('all new requests must choose a flow and cannot forge creation audit',async()=>{await as(A);await expect(db.query(`select design_order_save('no-flow','{"title":"No flow","requester":"Sale A","status":"Chờ phân công"}',NULL)`)).rejects.toThrow('Chọn luồng');const result=await db.query<{v:{history:{byId:string;at:string}[]}}>(`select design_order_save('new-photo','{"workflowKind":"photo","title":"New","requester":"Sale A","status":"Chờ phân công","history":[{"at":"2000-01-01","byId":"${B}","toStatus":"Hoàn thành"}]}',NULL) v`);expect(result.rows[0]?.v.history[0]?.byId).toBe(A);expect(result.rows[0]?.v.history[0]?.at).not.toBe('2000-01-01');});
it('taking a job cannot forge a completion timestamp during the valid transition',async()=>{await as(D);const previous=await db.query<{h:unknown}>("select data->'history' h from orders where id='new-photo'");await expect(db.query(`select design_order_save('new-photo',$1,NULL)`,[JSON.stringify({assignee:'Designer',status:'Đang thực hiện',completedAt:'2000-01-01',history:[...(previous.rows[0]?.h as unknown[] || []),{at:'2000-01-01'}]})])).rejects.toThrow('mốc xử lý');});
it('update_draft can save files without generic edit but cannot change the brief',async()=>{await db.exec('RESET ROLE');await db.exec(`DELETE FROM test_perms WHERE uid='${D}' AND p='order.edit';INSERT INTO test_perms VALUES('${D}','order.update_draft')`);await as(D);await db.query(`select design_order_save('new-photo','{"draftLink":"https://example.org/file"}',NULL)`);await expect(db.query(`select design_order_save('new-photo','{"brief":"not allowed"}',NULL)`)).rejects.toThrow('sửa thông tin');expect((await db.query<{v:string}>("select data->>'draftLink' v from orders where id='new-photo'")).rows[0]?.v).toBe('https://example.org/file');});