import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, expect, it } from 'vitest';

const db=new PGlite();
const dir='docs/role-515-cutover-20261116/';
const candidate=readFileSync(dir+'delete-rls-candidate.sql','utf8');
const rollback=readFileSync(dir+'delete-rls-rollback.sql','utf8');
const USER='00000000-0000-0000-0000-000000000002';
const routes=[
  ['brands','brand.delete'],['map_posts','local.post_delete'],
  ['social_posts','social.post_delete'],['socials','social.delete'],
  ['tasks','task.delete'],['videos','video.delete'],
  ['web_contents','web.content_delete'],['web_topics','web.keyword_topic_delete'],
  ['websites','web.delete'],
] as const;

const count=async(table:string)=>
  Number((await db.query<{n:number}>('SELECT count(*)::int n FROM public.'+table)).rows[0]?.n ?? 0);
const setRole=async(role:'authenticated'|'postgres')=>
  db.exec(role==='authenticated'?'SET ROLE authenticated':'RESET ROLE');

beforeAll(async()=>{
  await db.exec([
    'CREATE ROLE authenticated',
    'CREATE SCHEMA auth',
    'CREATE SCHEMA private',
    "CREATE TABLE private.test_permission(user_id uuid, permission text, allowed boolean, PRIMARY KEY(user_id,permission))",
    "CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('test.actor',true),'')::uuid $$",
    "CREATE FUNCTION private.has_permission(u uuid,p text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'private' AS $$ SELECT EXISTS (SELECT 1 FROM private.test_permission t WHERE t.user_id=u AND t.permission=p AND t.allowed) $$",
    "GRANT USAGE ON SCHEMA auth,private TO authenticated",
    "GRANT EXECUTE ON FUNCTION private.has_permission(uuid,text) TO authenticated"
  ].join(';\n')+';');
  for(const [table] of routes){
    await db.exec('CREATE TABLE public.'+table+"(id text PRIMARY KEY);"+
      ' ALTER TABLE public.'+table+' ENABLE ROW LEVEL SECURITY;'+
      ' CREATE POLICY allow_old ON public.'+table+' FOR ALL TO authenticated USING (true) WITH CHECK (true);'+
      ' GRANT SELECT,INSERT,UPDATE,DELETE ON public.'+table+' TO authenticated;'+
      " INSERT INTO public."+table+" VALUES ('row-1');");
  }
  const start=candidate.indexOf('CREATE POLICY role_515_delete_permission');
  const sql=candidate.slice(start,candidate.lastIndexOf('COMMIT;'));
  if(start<0||!sql.includes('AS RESTRICTIVE FOR DELETE'))throw Error('Restrictive policies absent');
  await db.exec(sql);
  await setRole('authenticated');
  await db.query("SELECT set_config('test.actor',$1,false)",[USER]);
},60000);
afterAll(()=>db.close());

it('creates nine restrictive policies mapped to the exact delete action keys',async()=>{
  await setRole('postgres');
  const r=await db.query<{tablename:string,qual:string}>(
    "SELECT tablename,qual FROM pg_policies WHERE schemaname='public' AND policyname='role_515_delete_permission' ORDER BY tablename");
  expect(r.rows).toHaveLength(9);
  for(const [table,key] of routes){
    const item=r.rows.find(x=>x.tablename===table);
    expect(item?.qual).toContain(key);
  }
});

it('an active user with no DELETE grant cannot delete any of the nine table rows',async()=>{
  await setRole('authenticated');
  await db.query("SELECT set_config('test.actor',$1,false)",[USER]);
  for(const [table] of routes) {
    await db.exec("DELETE FROM public."+table+" WHERE id='row-1'");
    expect(await count(table)).toBe(1);
  }
});

it('explicit ALLOW opens one table only; removing it (DENY) blocks DELETE again',async()=>{
  await setRole('postgres');
  await db.query('INSERT INTO private.test_permission VALUES ($1,$2,true)',[USER,'task.delete']);
  await setRole('authenticated');
  await db.exec("DELETE FROM public.videos WHERE id='row-1'");
  expect(await count('videos')).toBe(1);
  await db.exec("DELETE FROM public.tasks WHERE id='row-1'");
  expect(await count('tasks')).toBe(0);

  await setRole('postgres');
  await db.exec("INSERT INTO public.tasks VALUES ('row-1')");
  await db.query('UPDATE private.test_permission SET allowed=false WHERE user_id=$1 AND permission=$2',[USER,'task.delete']);
  await setRole('authenticated');
  await db.exec("DELETE FROM public.tasks WHERE id='row-1'");
  expect(await count('tasks')).toBe(1);
});

it('rollback removes only the new RLS policies and leaves existing broad policies',async()=>{
  await setRole('postgres');
  await db.exec(rollback);
  const r=await db.query<{n:number}>(
    "SELECT count(*)::int n FROM pg_policies WHERE schemaname='public' AND policyname='allow_old'");
  expect(r.rows[0].n).toBe(9);
  await setRole('authenticated');
  await db.exec("DELETE FROM public.tasks WHERE id='row-1'");
  expect(await count('tasks')).toBe(0);
});
