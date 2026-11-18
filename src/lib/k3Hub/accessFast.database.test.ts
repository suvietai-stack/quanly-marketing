import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, expect, it } from 'vitest';

const db = new PGlite();
const actor = {
  executive: '00000000-0000-0000-0000-000000000101',
  manager: '00000000-0000-0000-0000-000000000102',
  employee: '00000000-0000-0000-0000-000000000103',
  denied: '00000000-0000-0000-0000-000000000104',
  outsider: '00000000-0000-0000-0000-000000000105',
};
const changeActor = async (uid: string) => db.query("SELECT set_config('test.uid',$1,false)",[uid]);
const value = async (fn: string) => (await db.query<{ v: any }>(`SELECT public.${fn}() v`)).rows[0]?.v;

beforeAll(async () => {
  await db.exec(`
    CREATE SCHEMA private; CREATE SCHEMA auth;
    CREATE TABLE profiles(id uuid PRIMARY KEY,status text NOT NULL);
    CREATE TABLE org_units(id text PRIMARY KEY,parent_id text,kind text,name text,active boolean NOT NULL);
    CREATE TABLE org_titles(id text PRIMARY KEY,kind text);
    CREATE TABLE org_position_roles(unit_id text,title_id text,role_id text);
    CREATE TABLE org_assignments(user_id uuid,unit_id text,title_id text,status text,starts_at timestamptz,ends_at timestamptz);
    CREATE TABLE role_perms(user_id uuid,permission text);
    CREATE TABLE personal_denials(user_id uuid,permission text);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$SELECT nullif(current_setting('test.uid',true),'')::uuid$$;
    CREATE FUNCTION private.is_active(uuid) RETURNS boolean LANGUAGE sql STABLE AS
      $$SELECT EXISTS(SELECT 1 FROM profiles WHERE id=$1 AND status='Đang hoạt động')$$;
    CREATE FUNCTION private.is_super_admin(uuid) RETURNS boolean LANGUAGE sql STABLE AS
      $$SELECT $1='00000000-0000-0000-0000-000000000101'::uuid$$;
    CREATE FUNCTION private.has_permission(uuid,text) RETURNS boolean LANGUAGE sql STABLE AS
      $$SELECT EXISTS(SELECT 1 FROM role_perms WHERE user_id=$1 AND permission=$2)$$;
    CREATE FUNCTION private.k3_personal_denied(uuid,text) RETURNS boolean LANGUAGE sql STABLE AS
      $$SELECT EXISTS(SELECT 1 FROM personal_denials WHERE user_id=$1 AND permission=$2)$$;
    CREATE FUNCTION private.k3hub_policy_at(date) RETURNS text[] LANGUAGE sql STABLE AS
      $$SELECT ARRAY['biz-block']::text[]$$;
    CREATE FUNCTION private.k3hub_path(_unit text)
    RETURNS TABLE(id text, kind text) LANGUAGE sql STABLE AS $$
      WITH RECURSIVE path AS (
        SELECT u.id,u.kind,u.parent_id FROM org_units u WHERE u.id=_unit
        UNION ALL SELECT p.id,p.kind,p.parent_id FROM org_units p JOIN path q ON p.id=q.parent_id
      ) SELECT p.id,p.kind FROM path p
    $$;
    CREATE FUNCTION private.k3hub_is_enabled(text,date) RETURNS boolean LANGUAGE sql STABLE AS
      $$SELECT EXISTS(SELECT 1 FROM private.k3hub_path($1) p
        WHERE p.kind='block' AND p.id=ANY(private.k3hub_policy_at($2)))$$;
    CREATE FUNCTION public.k3_can(uuid,text) RETURNS boolean LANGUAGE sql STABLE AS
      $$SELECT private.is_active($1) AND $2='k3.use'$$;
    CREATE FUNCTION private.k3hub_exec(uuid) RETURNS boolean LANGUAGE sql STABLE AS
      $$SELECT private.is_super_admin($1) OR (
        private.has_permission($1,'k3hub.center') AND NOT private.k3_personal_denied($1,'k3.view_scope')
        AND EXISTS(SELECT 1 FROM org_assignments a JOIN org_position_roles pr
          ON pr.unit_id=a.unit_id AND pr.title_id=a.title_id
          WHERE a.user_id=$1 AND a.status='active' AND a.unit_id='org-company'
            AND a.starts_at<=now() AND (a.ends_at IS NULL OR a.ends_at>now())
            AND pr.role_id='role-v2-executive'))$$;
    INSERT INTO org_units VALUES
      ('org-company',null,'company','Công ty',true),
      ('biz-block','org-company','block','Kinh doanh',true),
      ('biz-dept','biz-block','department','Phòng kinh doanh',true),
      ('biz-showroom','biz-block','department','Showrom Hà Nội',true),
      ('other-block','org-company','block','Thiết kế',true),
      ('retired','biz-block','department','Không hoạt động',false);
    INSERT INTO org_titles VALUES ('executive','manager'),('head','manager'),('staff','staff');
    INSERT INTO org_position_roles VALUES ('org-company','executive','role-v2-executive');
  `);
  for (const uid of Object.values(actor)) {
    await db.query('INSERT INTO profiles VALUES($1,$2)',[uid,'Đang hoạt động']);
  }
  for (const uid of [actor.manager,actor.denied,actor.executive]) {
    await db.query('INSERT INTO role_perms VALUES ($1,$2)',[uid,'k3hub.center']);
  }
  await db.query('INSERT INTO role_perms VALUES($1,$2)',[actor.executive,'k3hub.config']);
  await db.query('INSERT INTO personal_denials VALUES($1,$2)',[actor.denied,'k3.view_scope']);
  for(const [uid,unit,title] of [
    [actor.executive,'org-company','executive'],
    [actor.manager,'biz-dept','head'],
    [actor.employee,'biz-dept','staff'],
    [actor.denied,'biz-dept','head'],
    [actor.outsider,'other-block','staff'],
  ]) {
    await db.query('INSERT INTO org_assignments VALUES($1,$2,$3,$4,now()-interval \'1 day\',null)',[uid,unit,title,'active']);
  }

  const old = readFileSync('drizzle/migrations/0401_k3_hub_access_options.sql','utf8');
  const start = old.indexOf('CREATE OR REPLACE FUNCTION public.k3hub_access_read()');
  const end = old.indexOf('$function$;',start)+'$function$;'.length;
  if (start<0 || end<'$function$;'.length) throw new Error('Missing original source');
  await db.exec(old.slice(start,end).replace('public.k3hub_access_read()','public.k3hub_access_reference()'));
  await db.exec(readFileSync('drizzle/migrations/0465_k3hub_access_evaluate_once.sql','utf8'));
},30000);

afterAll(() => db.close());

it.each(Object.entries(actor))('optimized access keeps exact original permissions and units for %s',async(_,uid)=>{
  await changeActor(uid);
  expect(await value('k3hub_access_read')).toEqual(await value('k3hub_access_reference'));
});

it('moving manager out immediately removes their area access',async()=>{
  await db.query("UPDATE org_assignments SET ends_at=now()-interval '1 second' WHERE user_id=$1",[actor.manager]);
  await changeActor(actor.manager);
  const result = await value('k3hub_access_read');
  expect(result.can_manage).toBe(false);
  expect(result.units).toEqual([]);
  expect(result).toEqual(await value('k3hub_access_reference'));
});
