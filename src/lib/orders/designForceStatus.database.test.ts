import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { beforeAll, afterAll, it, expect } from 'vitest';

const db = new PGlite();
const ADMIN='00000000-0000-0000-0000-000000000001';
const DESIGNER='00000000-0000-0000-0000-000000000002';
const REVIEWER='00000000-0000-0000-0000-000000000003';

beforeAll(async()=>{
  await db.exec(`
    CREATE SCHEMA auth; CREATE SCHEMA private; CREATE ROLE authenticated;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS
      $$ SELECT nullif(current_setting('test.uid',true),'')::uuid $$;
    CREATE TABLE profiles(id uuid PRIMARY KEY, full_name text, username text, status text);
    CREATE TABLE test_perms(uid uuid, perm text);
    CREATE TABLE mkt_staff_specialties(user_id uuid, specialty_id text, state text);
    CREATE TABLE orders(id text PRIMARY KEY, data jsonb NOT NULL, workflow_kind text,
      created_by uuid, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
    CREATE FUNCTION private.is_active(_uid uuid) RETURNS boolean LANGUAGE sql STABLE AS
      $$ SELECT EXISTS(SELECT 1 FROM profiles WHERE id=_uid AND status='Đang hoạt động') $$;
    CREATE FUNCTION private.is_admin(_uid uuid) RETURNS boolean LANGUAGE sql STABLE AS
      $$ SELECT _uid='00000000-0000-0000-0000-000000000001'::uuid $$;
    CREATE FUNCTION private.is_super_admin(_uid uuid) RETURNS boolean LANGUAGE sql STABLE AS
      $$ SELECT private.is_admin(_uid) $$;
    CREATE FUNCTION private.has_permission(_uid uuid,_perm text) RETURNS boolean LANGUAGE sql STABLE AS
      $$ SELECT EXISTS(SELECT 1 FROM test_perms WHERE uid=_uid AND perm=_perm) $$;
    CREATE FUNCTION private.design_person(_uid uuid,_name text) RETURNS boolean LANGUAGE sql STABLE AS
      $$ SELECT EXISTS(SELECT 1 FROM profiles WHERE id=_uid AND (full_name=_name OR username=_name)) $$;
    CREATE FUNCTION private.design_team_member(_uid uuid) RETURNS boolean LANGUAGE sql STABLE AS
      $$ SELECT private.is_active(_uid) AND EXISTS(
        SELECT 1 FROM mkt_staff_specialties WHERE user_id=_uid AND specialty_id='design' AND state='active') $$;
    CREATE FUNCTION private.design_read(_uid uuid,_creator uuid,_data jsonb,_flow text)
      RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT private.is_active(_uid) $$;
    CREATE FUNCTION public.design_can(_uid uuid,_flow text,_action text)
      RETURNS boolean LANGUAGE sql STABLE AS
      $$ SELECT private.is_active(_uid) AND
         (private.is_admin(_uid) OR private.has_permission(_uid,'order.'||_flow||'.'||_action)) $$;
    INSERT INTO profiles VALUES
      ('00000000-0000-0000-0000-000000000001','Admin','admin','Đang hoạt động'),
      ('00000000-0000-0000-0000-000000000002','Designer','designer','Đang hoạt động'),
      ('00000000-0000-0000-0000-000000000003','Reviewer','reviewer','Đang hoạt động');
    INSERT INTO mkt_staff_specialties VALUES ('00000000-0000-0000-0000-000000000002','design','active');
    INSERT INTO test_perms(uid,perm)
      SELECT '00000000-0000-0000-0000-000000000002', unnest(
        ARRAY['order.marketing_design.view','order.marketing_design.take',
              'order.marketing_design.assign','order.marketing_design.force_status']);
    INSERT INTO orders(id,workflow_kind,created_by,data) VALUES
      ('old','marketing_design','00000000-0000-0000-0000-000000000003',
       '{"workflowKind":"marketing_design","requester":"Reviewer","reviewer":"Reviewer","status":"Cần giao người","history":[{"action":"Tạo Job"}]}'),
      ('self','marketing_design','00000000-0000-0000-0000-000000000003',
       '{"workflowKind":"marketing_design","requester":"Reviewer","reviewer":"Designer",
         "assignee":"Designer","assigneeId":"00000000-0000-0000-0000-000000000002",
         "status":"Chờ duyệt","history":[{"action":"Tạo Job"}]}');
    GRANT USAGE ON SCHEMA auth,private TO authenticated;
    GRANT SELECT,UPDATE ON orders TO authenticated;
  `);
  await db.exec(readFileSync('drizzle/migrations/0442_design_force_status_audited_override.sql','utf8'));
  await db.exec('CREATE TRIGGER design_order_write_guard BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION private.design_guard()');
},60000);
afterAll(()=>db.close());

async function actAs(uid:string){
  await db.exec('RESET ROLE');
  await db.query("SELECT set_config('test.uid',$1,false)",[uid]);
  await db.exec('SET ROLE authenticated');
}

async function change(id:string,to:string,forced:boolean,note?:string){
  const {rows}=await db.query<{data:any}>('SELECT data FROM orders WHERE id=$1',[id]);
  const prev=rows[0].data;
  const h=[...prev.history,{action:forced?'Ép chuyển trạng thái':'Duyệt Job',forced,
    ...(note?{note}:{}),fromStatus:prev.status,toStatus:to}];
  return db.query('UPDATE orders SET data=$1 WHERE id=$2',[JSON.stringify({...prev,status:to,history:h}),id]);
}

it('Admin assigns an old unassigned Job with no assigneeId and preserves history',async()=>{
  await db.exec('BEGIN');
  try{
    await actAs(ADMIN);
    const old=(await db.query<{data:any}>("SELECT data FROM orders WHERE id='old'")).rows[0].data;
    await db.query('UPDATE orders SET data=$1 WHERE id=$2',
      [JSON.stringify({...old,assignee:'Designer',assigneeId:DESIGNER,
        status:'Chờ nhận việc',assignedAt:new Date().toISOString(),assignedBy:'Admin',
        history:[...old.history,{action:'Giao người'}]}),'old']);
    const row=(await db.query<{data:any}>("SELECT data FROM orders WHERE id='old'")).rows[0].data;
    expect(row.assigneeId).toBe(DESIGNER);
    expect(row.history).toHaveLength(2);
  }finally{await db.exec('ROLLBACK; RESET ROLE;');}
});

it('permissioned forced approval with reason is allowed and audited',async()=>{
  await db.exec('BEGIN');
  try{
    await actAs(DESIGNER);
    await change('self','Đã duyệt',true,'Khôi phục đã kiểm tra');
    const row=(await db.query<{data:any}>("SELECT data FROM orders WHERE id='self'")).rows[0].data;
    expect(row.status).toBe('Đã duyệt');
    expect(row.history.at(-1).forced).toBe(true);
  }finally{await db.exec('ROLLBACK; RESET ROLE;');}
});

it('normal self-approval is still blocked',async()=>{
  await db.exec('BEGIN');
  try{
    await actAs(DESIGNER);
    await expect(change('self','Đã duyệt',false)).rejects.toThrow();
  }finally{await db.exec('ROLLBACK; RESET ROLE;');}
});

it('forced approval requires a reason and valid force permission',async()=>{
  await db.exec('BEGIN');
  try{
    await actAs(DESIGNER);
    await expect(change('self','Đã duyệt',true)).rejects.toThrow('lý do');
  }finally{await db.exec('ROLLBACK; RESET ROLE;');}
  await db.exec('BEGIN');
  try{
    await actAs(REVIEWER);
    await expect(change('self','Đã duyệt',true,'Lý do kiểm tra')).rejects.toThrow('Không có quyền ép');
  }finally{await db.exec('ROLLBACK; RESET ROLE;');}
});
