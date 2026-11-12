import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
const dir='docs/leave-set-based-2026-11-12/';
const id=(n:number)=>`00000000-0000-0000-0000-${String(n).padStart(12,'0')}`;
it('set-based owners exactly match old unit checks across DENY, inactive, interval, co-appointment and unit closure',async()=>{
 const db=new PGlite();
 try {
  await db.exec(`CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;CREATE SCHEMA private;CREATE SCHEMA auth;
  GRANT USAGE ON SCHEMA private,auth TO authenticated;
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT nullif(current_setting('test.actor',true),'')::uuid$$;
  CREATE FUNCTION private.is_active(u uuid) RETURNS boolean LANGUAGE sql AS $$SELECT u IS NOT NULL AND u<>'${id(9)}'::uuid$$;
  CREATE FUNCTION private.has_permission(u uuid,p text) RETURNS boolean LANGUAGE sql AS $$SELECT private.is_active(u) AND current_setting('test.deny',true)<>'yes' AND p=ANY(string_to_array(current_setting('test.permissions',true),','))$$;
  CREATE FUNCTION private.sig_can(u uuid,p text) RETURNS boolean LANGUAGE sql AS $$SELECT private.has_permission(u,p)$$;
  CREATE TABLE org_assignments(id text,user_id uuid,unit_id text,status text,starts_at timestamptz,ends_at timestamptz);
  INSERT INTO org_assignments VALUES('manager','${id(1)}','root','active',now()-interval '1 day',null),('owner','${id(2)}','child','active',now()-interval '1 day',null),('outsider','${id(3)}','other','active',now()-interval '1 day',null),('ended','${id(4)}','child','active',now()-interval '2 days',now()-interval '1 day'),('future','${id(5)}','child','active',now()+interval '1 day',null),('inactive','${id(6)}','child','ended',now()-interval '1 day',null),('co-outside','${id(7)}','other','active',now()-interval '1 day',null),('co-inside','${id(7)}','child','active',now()-interval '1 day',null),('disabled-unit','${id(8)}','disabled','active',now()-interval '1 day',null);
  CREATE FUNCTION private.base_config() RETURNS jsonb LANGUAGE sql AS $$SELECT '{"units":[{"id":"root","active":true},{"id":"child","parent_id":"root","active":true},{"id":"disabled","parent_id":"root","active":false},{"id":"other","active":true}]}'::jsonb$$;
  CREATE FUNCTION private.org_role_rules(u uuid,c jsonb) RETURNS jsonb LANGUAGE sql AS $$SELECT CASE WHEN u='${id(1)}' THEN '[{"source_id":"manager","permission":"leave.view_unit","effect":"ALLOW"}]'::jsonb ELSE '[]'::jsonb END$$;
  CREATE FUNCTION private.base_role_unit_contains(c jsonb,root_id text,target_id text) RETURNS boolean LANGUAGE sql AS $$WITH RECURSIVE tree AS (SELECT x->>'id' id,ARRAY[x->>'id'] path FROM jsonb_array_elements(c->'units') x WHERE x->>'id'=root_id AND coalesce((x->>'active')::boolean,false) UNION ALL SELECT x->>'id',tree.path||(x->>'id') FROM tree JOIN LATERAL jsonb_array_elements(c->'units') x ON x->>'parent_id'=tree.id WHERE coalesce((x->>'active')::boolean,false) AND NOT(x->>'id'=ANY(tree.path))) SELECT EXISTS(SELECT 1 FROM tree WHERE id=target_id)$$;
  CREATE FUNCTION private.leave_unit_visible(u uuid,target uuid) RETURNS boolean LANGUAGE sql AS $$SELECT private.is_active(u) AND private.has_permission(u,'leave.view_unit') AND EXISTS(SELECT 1 FROM jsonb_array_elements(private.org_role_rules(u,private.base_config())) rule JOIN org_assignments a ON a.id=rule->>'source_id' AND a.user_id=u JOIN org_assignments b ON b.user_id=target AND b.status='active' AND b.starts_at<=now() AND (b.ends_at IS NULL OR b.ends_at>now()) WHERE rule->>'permission'='leave.view_unit' AND a.status='active' AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now()) AND private.base_role_unit_contains(private.base_config(),a.unit_id,b.unit_id))$$;
  CREATE TABLE leave_requests(id int,owner_id uuid,created_by uuid,approver_id uuid);ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;GRANT SELECT ON leave_requests TO authenticated;
  CREATE POLICY "leave_requests read" ON leave_requests FOR SELECT TO authenticated USING(private.leave_unit_visible(auth.uid(),owner_id));
  CREATE POLICY account_active_guard ON leave_requests AS RESTRICTIVE FOR ALL TO authenticated USING(private.is_active(auth.uid())) WITH CHECK(private.is_active(auth.uid()));
  INSERT INTO leave_requests SELECT n,'00000000-0000-0000-0000-'||lpad(n::text,12,'0'),'${id(3)}','${id(1)}' FROM generate_series(1,8)n;
  SELECT set_config('test.actor','${id(1)}',false),set_config('test.permissions','leave.view_unit',false),set_config('test.deny','no',false);` .replace("SELECT n,'00000000-0000-0000-0000-'||lpad(n::text,12,'0')", "SELECT n,('00000000-0000-0000-0000-'||lpad(n::text,12,'0'))::uuid"));
  const candidate=readFileSync(dir+'candidate.sql','utf8');
  await db.exec(candidate.slice(candidate.indexOf('CREATE FUNCTION')) .replace(/COMMIT;\s*$/,''));
  async function compare(actor:string,permissions:string,deny='no') {
   await db.query(`SELECT set_config('test.actor',$1,false),set_config('test.permissions',$2,false),set_config('test.deny',$3,false)`,[actor,permissions,deny]);
   const rows=(await db.query<{owner_id:string;old:boolean;new:boolean}>(`SELECT owner_id,private.leave_unit_visible(auth.uid(),owner_id) old,owner_id=ANY(public.leave_visible_unit_owners()) new FROM leave_requests ORDER BY id`)).rows;
   expect(rows.map(r=>r.new)).toEqual(rows.map(r=>r.old));return rows.filter(r=>r.new).map(r=>r.owner_id);
  }
  expect(await compare(id(1),'leave.view_unit')).toEqual([id(1),id(2),id(7)]);
  expect(await compare(id(1),'leave.view_unit','yes')).toEqual([]);
  expect(await compare(id(3),'leave.view_unit')).toEqual([]);
  expect(await compare(id(9),'leave.view_unit')).toEqual([]);
  expect(await compare('','leave.view_unit')).toEqual([]);
  expect(await compare(id(1),'leave.view_own')).toEqual([]);
  const timings:{old:number[];candidate:number[]}={old:[],candidate:[]};
  await db.query(`SELECT set_config('test.actor',$1,false),set_config('test.permissions','leave.view_unit',false),set_config('test.deny','no',false)`,[id(1)]);
  for(let n=0;n<30;n++) {
    let start=performance.now();await db.query('SELECT count(*) FROM leave_requests WHERE private.leave_unit_visible(auth.uid(),owner_id)');timings.old.push(performance.now()-start);
    start=performance.now();await db.query('SELECT count(*) FROM leave_requests WHERE owner_id=ANY((SELECT public.leave_visible_unit_owners())::uuid[])');timings.candidate.push(performance.now()-start);
  }
  console.log('Isolated 30 sequential reads (NOT production/native resolver):',JSON.stringify(Object.fromEntries(Object.entries(timings).map(([k,v])=>{const s=[...v].sort((a,b)=>a-b);return[k,{p50:s[14],p95:s[28],max:s[29]}]}))));
  // Full SELECT branches remain independent, including legacy leave records whose org interval ended.
  await db.query(`SELECT set_config('test.actor',$1,false),set_config('test.permissions','leave.view_own,leave.create_for,leave.view_assigned',false),set_config('test.deny','no',false)`,[id(4)]);
  await db.exec('SET ROLE authenticated');
  expect((await db.query<{id:number}>('SELECT id FROM leave_requests')).rows.map(r=>r.id)).toEqual([4]);
  await db.exec('RESET ROLE');
  await db.query(`SELECT set_config('test.actor',$1,false),set_config('test.permissions','leave.approve',false)`,[id(1)]);await db.exec('SET ROLE authenticated');
  expect((await db.query('SELECT id FROM leave_requests')).rows).toHaveLength(8);
  await db.exec('RESET ROLE');
  await db.query(`SELECT set_config('test.actor',$1,false),set_config('test.permissions','leave.view_all',false)`,[id(9)]);await db.exec('SET ROLE authenticated');
  expect((await db.query('SELECT id FROM leave_requests')).rows).toHaveLength(0);await db.exec('RESET ROLE');
  await db.query(`SELECT set_config('test.actor',$1,false),set_config('test.permissions','leave.create_for',false)`,[id(3)]);await db.exec('SET ROLE authenticated');
  expect((await db.query('SELECT id FROM leave_requests')).rows).toHaveLength(8);
  await db.exec('RESET ROLE');await db.exec(readFileSync(dir+'rollback.sql','utf8'));
  expect((await db.query<{f:unknown}>("SELECT to_regprocedure('public.leave_visible_unit_owners()') f")).rows[0]?.f).toBeNull();
 } finally {await db.close();}
},30000);