import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, expect, it } from 'vitest';

// Kiểm thử migration 0300: Phó Giám đốc Điều hành có cùng quyền điều hành với Giám đốc.
// Dựng stub tối thiểu đúng chữ ký các hàm/bảng mà migration chạm tới.
const db = new PGlite();
const ids = Array.from({ length: 5 }, (_, i) => `00000000-0000-0000-0000-${String(i + 1).padStart(12, '0')}`);
const [director, deputy, staff, owner, outsider] = ids;

async function actor(id: string) { await db.query("select set_config('test.uid',$1,false)", [id]); }
async function scalar(sql: string, args: unknown[] = []) { return (await db.query<{ v: any }>(sql, args)).rows[0]?.v; }

const execSnapshot = (code: string, name: string, level: number) =>
  JSON.stringify({ code, name, level, business_policy: 'executive', all_business: true });

beforeAll(async () => {
  await db.exec(`CREATE SCHEMA auth;CREATE SCHEMA private;CREATE ROLE authenticated;CREATE ROLE anon;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT nullif(current_setting('test.uid',true),'')::uuid$$;
CREATE TABLE profiles(id uuid PRIMARY KEY,full_name text,status text);
CREATE TABLE biz_appointments(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid,status text,started_at timestamptz,ended_at timestamptz,position_snapshot jsonb);
CREATE TABLE biz_approval_runs(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),version_id uuid,owner_id uuid,status text,current_step int,steps jsonb,submitted_at timestamptz DEFAULT now());
CREATE FUNCTION public.is_super_admin(u uuid) RETURNS boolean LANGUAGE sql AS $$SELECT false$$;
CREATE FUNCTION public.biz_admin(u uuid) RETURNS boolean LANGUAGE sql AS $$SELECT false$$;
CREATE FUNCTION private.sig_can(u uuid,p text) RETURNS boolean LANGUAGE sql AS $$SELECT false$$;
-- Stub biz_can đúng cấu trúc 0185 để migration vá nhánh biz.intervene.
CREATE FUNCTION public.biz_can(_actor uuid,_permission text) RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $f$
BEGIN
IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=_actor AND status='Đang hoạt động') THEN RETURN false;END IF;
IF public.is_super_admin(_actor) THEN RETURN true;END IF;
IF _permission NOT LIKE 'biz.%' THEN RETURN private.sig_can(_actor,_permission);END IF;
IF public.biz_admin(_actor) THEN RETURN true;END IF;
IF _permission='biz.access_manage' THEN RETURN false;END IF;
IF _permission='biz.intervene' THEN RETURN EXISTS(SELECT 1 FROM public.biz_appointments a WHERE a.user_id=_actor AND a.status<>'cancelled' AND a.started_at<=now() AND (a.ended_at IS NULL OR a.ended_at>now()) AND a.position_snapshot->>'code'='executive_director' AND a.position_snapshot->>'business_policy'='executive' AND coalesce((a.position_snapshot->>'all_business')::boolean,false));END IF;
RETURN false;
END $f$;
-- Stub biz_approval_notify đúng đoạn vòng lặp 0105 để migration vá người nhận thông báo.
CREATE FUNCTION public.biz_approval_notify() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $f$DECLARE r public.biz_approval_runs; u uuid;BEGIN
 SELECT * INTO r FROM public.biz_approval_runs WHERE id=NEW.run_id;
 FOR u IN SELECT DISTINCT id FROM public.profiles WHERE status='Đang hoạt động' AND ((r.status<>'pending' AND id=r.owner_id) OR (r.status='pending' AND (id=nullif(r.steps->r.current_step->>'user_id','')::uuid OR id=nullif(r.steps->r.current_step->>'substitute_id','')::uuid))) LOOP
  PERFORM u;
 END LOOP; RETURN NEW; END $f$;`);
  for (const [i, id] of ids.entries()) await db.query('insert into profiles values($1,$2,$3)', [id, `Người ${i}`, 'Đang hoạt động']);
  await db.query('insert into biz_appointments(user_id,status,started_at,position_snapshot) values($1,$2,now() - interval \'1 day\',$3)', [director, 'active', execSnapshot('executive_director', 'Giám Đốc Điều hành', 5)]);
  await db.query('insert into biz_appointments(user_id,status,started_at,position_snapshot) values($1,$2,now() - interval \'1 day\',$3)', [deputy, 'active', execSnapshot('deputy_executive_director', 'Phó Giám Đốc Điều hành', 4)]);
  await db.query('insert into biz_appointments(user_id,status,started_at,ended_at,position_snapshot) values($1,$2,now() - interval \'10 days\',now() - interval \'1 day\',$3)', [outsider, 'active', execSnapshot('deputy_executive_director', 'Phó Giám đốc cũ', 4)]);
  await db.exec(readFileSync('drizzle/migrations/0300_biz_executive_deputy_parity.sql', 'utf8'));
}, 30000);
afterAll(() => db.close());

it('biz.intervene: cả Giám đốc và Phó Giám đốc, người ngoài và người đã kết thúc nhiệm kỳ thì không', async () => {
  expect(await scalar('select public.biz_can($1,\'biz.intervene\') v', [director])).toBe(true);
  expect(await scalar('select public.biz_can($1,\'biz.intervene\') v', [deputy])).toBe(true);
  expect(await scalar('select public.biz_can($1,\'biz.intervene\') v', [staff])).toBe(false);
  expect(await scalar('select public.biz_can($1,\'biz.intervene\') v', [outsider])).toBe(false);
});

it('biz_executive_holder nhận cả hai chức vụ điều hành đang hiệu lực', async () => {
  expect(await scalar('select public.biz_executive_holder($1) v', [director])).toBe(true);
  expect(await scalar('select public.biz_executive_holder($1) v', [deputy])).toBe(true);
  expect(await scalar('select public.biz_executive_holder($1) v', [staff])).toBe(false);
  expect(await scalar('select public.biz_executive_holder($1) v', [outsider])).toBe(false);
});

it('bước duyệt cấp Giám đốc: Phó Giám đốc xử lý được, chặn tự duyệt và chặn khi chưa tới bước', async () => {
  const version = '10000000-0000-0000-0000-000000000001';
  const steps = JSON.stringify([
    { label: 'Trưởng Phòng', type: 'user', user_id: staff, substitute_id: null },
    { label: 'Giám Đốc Điều hành', type: 'position', user_id: director, substitute_id: null, position_snapshot: { code: 'executive_director' } },
  ]);
  await db.query('insert into biz_approval_runs(version_id,owner_id,status,current_step,steps) values($1,$2,$3,0,$4)', [version, owner, 'pending', steps]);
  // Chưa tới bước Giám đốc: Phó Giám đốc không được duyệt.
  await actor(deputy);
  expect(await scalar('select public.biz_run_assigned($1,true) v', [version])).toBe(false);
  // Tới bước Giám đốc: cả hai đều xử lý được, người nộp thì không.
  await db.query('update biz_approval_runs set current_step=1 where version_id=$1', [version]);
  await actor(deputy);
  expect(await scalar('select public.biz_run_assigned($1,true) v', [version])).toBe(true);
  await actor(director);
  expect(await scalar('select public.biz_run_assigned($1,true) v', [version])).toBe(true);
  await actor(owner);
  expect(await scalar('select public.biz_run_assigned($1,true) v', [version])).toBe(false);
  await actor(outsider);
  expect(await scalar('select public.biz_run_assigned($1,true) v', [version])).toBe(false);
  // Bước chỉ định đích danh (không có position_snapshot) không mở cho Phó Giám đốc.
  await db.query('update biz_approval_runs set current_step=0 where version_id=$1', [version]);
  await actor(deputy);
  expect(await scalar('select public.biz_run_assigned($1,true) v', [version])).toBe(false);
  // Quyền đọc (không pending): Phó Giám đốc vẫn xem được hồ sơ có bước cấp Giám đốc.
  await db.query('update biz_approval_runs set status=$2 where version_id=$1', [version, 'approved']);
  expect(await scalar('select public.biz_run_assigned($1,false) v', [version])).toBe(true);
});

it('thông báo bước cấp Giám đốc được vá để gửi cả hai người giữ chức vụ điều hành', async () => {
  const def = await scalar("select pg_get_functiondef('public.biz_approval_notify()'::regprocedure) v");
  expect(def).toContain('biz_executive_holder');
  expect(def).toContain('deputy_executive_director');
});
