import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { beforeAll, afterAll, it, expect } from 'vitest';

const db = new PGlite();
const uid = (n: number) => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`;
const snapshot = JSON.parse(readFileSync('docs/signals-p0-2026-11-12/snapshot.json', 'utf8'));
const patch = readFileSync('docs/pending/signals_p0_statement_scope.sql', 'utf8');
const definition = (name: string) => snapshot.functions.find((f: { signature: string }) => f.signature === name)?.definition;

beforeAll(async () => {
  await db.exec(`CREATE SCHEMA auth; CREATE SCHEMA private; CREATE ROLE authenticated;
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('test.uid',true),'')::uuid $$;
  CREATE TABLE app_roles(id text PRIMARY KEY,permissions text[],signal_scope_all boolean,signal_scope text[]);
  CREATE TABLE user_roles(user_id uuid,role_id text);
  CREATE TABLE org_assignments(user_id uuid,title_id text,slot_id text,status text,starts_at timestamptz,ends_at timestamptz);
  CREATE TABLE base_title_role_links(title_id text,role_id text,permission_signature text);
  CREATE TABLE sources(user_id uuid,role_id text,source_kind text,permissions text[]);
  CREATE TABLE grants(user_id uuid,p text,allowed boolean);
  CREATE FUNCTION private.is_super_admin(u uuid) RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT u='${uid(1)}'::uuid $$;
  CREATE FUNCTION private.is_admin(u uuid) RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT u IN ('${uid(1)}'::uuid,'${uid(2)}'::uuid) $$;
  CREATE FUNCTION private.is_active(u uuid) RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT u IS NOT NULL AND u<>'${uid(9)}'::uuid $$;
  CREATE FUNCTION private.sig_can(u uuid,p text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT private.is_active(u) AND (u='${uid(1)}'::uuid OR EXISTS(SELECT 1 FROM grants g WHERE g.user_id=u AND g.p=$2 AND allowed)) $$;
  CREATE FUNCTION private.base_config() RETURNS jsonb LANGUAGE plpgsql STABLE AS $$ BEGIN
    IF current_setting('test.forbid_sources',true)='true' THEN RAISE EXCEPTION 'source scan forbidden'; END IF;
    RETURN '{}'::jsonb; END $$;
  CREATE FUNCTION private.role_source_rows(jsonb) RETURNS SETOF sources LANGUAGE sql STABLE AS $$ SELECT * FROM sources $$;
  CREATE TABLE opportunity_signals(id uuid PRIMARY KEY,assigned_to uuid,created_by uuid,need_groups text[],status text,cancelled_at timestamptz);
  ALTER TABLE opportunity_signals ENABLE ROW LEVEL SECURITY;
  CREATE POLICY sig_select ON opportunity_signals TO authenticated USING(false);
  CREATE POLICY account_active_guard ON opportunity_signals AS RESTRICTIVE TO authenticated USING((SELECT private.is_active(auth.uid())));
  GRANT USAGE ON SCHEMA auth,private TO authenticated;
  GRANT SELECT ON opportunity_signals TO authenticated;
  INSERT INTO app_roles VALUES ('bounded',ARRAY['signal.view_all'],false,ARRAY['Quà','Khác']),('global',ARRAY['signal.view_all'],true,'{}');
  INSERT INTO user_roles VALUES ('${uid(3)}','bounded'),('${uid(4)}','global');
  INSERT INTO sources VALUES ('${uid(5)}','bounded','slot',ARRAY['signal.view_all']),('${uid(8)}','global','task',ARRAY['signal.view_all']);
  INSERT INTO org_assignments VALUES ('${uid(6)}','valid',NULL,'active',now()-interval '1 day',NULL),('${uid(7)}','invalid',NULL,'active',now()-interval '1 day',NULL),('${uid(10)}','expired',NULL,'active',now()-interval '2 day',now()-interval '1 day');
  INSERT INTO base_title_role_links VALUES ('valid','bounded',md5(ARRAY['signal.view_all']::text)),('invalid','global','broken'),('expired','global',md5(ARRAY['signal.view_all']::text));
  INSERT INTO grants VALUES ('${uid(2)}','signal.view_all',true),('${uid(3)}','signal.view_all',true),('${uid(4)}','signal.view_all',true),('${uid(5)}','signal.view_all',true),('${uid(6)}','signal.view_all',true),('${uid(7)}','signal.view_all',true),('${uid(8)}','signal.sale',true),('${uid(9)}','signal.view_all',true),('${uid(10)}','signal.create',true);
  INSERT INTO opportunity_signals SELECT ('10000000-0000-0000-0000-'||lpad(i::text,12,'0'))::uuid,'${uid(8)}'::uuid,'${uid(10)}'::uuid,
    CASE i%4 WHEN 0 THEN ARRAY['Quà','Other'] WHEN 1 THEN ARRAY['Other'] WHEN 2 THEN ARRAY['Khác:Web'] ELSE '{}' END,
    CASE WHEN i%10=0 THEN 'won' ELSE 'consulting' END,CASE WHEN i%66=0 THEN now() ELSE NULL END FROM generate_series(1,665) i;`);
  await db.exec(definition('private.sig_scope_ok(uuid,text[])'));
  await db.exec(readFileSync('docs/signals-p0-2026-11-12/rollback.sql', 'utf8'));
  await db.exec(`ALTER TABLE opportunity_signals ADD COLUMN assigned_at timestamptz, ADD COLUMN created_at timestamptz DEFAULT '2026-11-01', ADD COLUMN updated_at timestamptz DEFAULT '2026-11-09', ADD COLUMN detected_on date DEFAULT '2026-11-09', ADD COLUMN customer_name text DEFAULT 'Khách', ADD COLUMN phone text DEFAULT '0901234567', ADD COLUMN products text[] DEFAULT '{}', ADD COLUMN need_group text, ADD COLUMN source text DEFAULT 'Website', ADD COLUMN lost_reason text, ADD COLUMN potential text DEFAULT 'unrated', ADD COLUMN next_contact_on date, ADD COLUMN revenue numeric, ADD COLUMN closed_at timestamptz;
  CREATE TABLE opportunity_signal_notes(id uuid DEFAULT gen_random_uuid(),signal_id uuid,note text,status_from text,status_to text,created_at timestamptz,event_type text,is_progression boolean);
  CREATE TABLE opportunity_signal_events(id uuid DEFAULT gen_random_uuid(),signal_id uuid,kind text,detail jsonb,created_at timestamptz);
  CREATE TABLE signal_label_links(signal_id uuid,label_id uuid);
  ALTER TABLE opportunity_signal_notes ENABLE ROW LEVEL SECURITY;
  ALTER TABLE opportunity_signal_events ENABLE ROW LEVEL SECURITY;
  ALTER TABLE signal_label_links ENABLE ROW LEVEL SECURITY;
  CREATE POLICY scoped ON opportunity_signal_notes TO authenticated USING(EXISTS(SELECT 1 FROM opportunity_signals s WHERE s.id=signal_id));
  CREATE POLICY scoped ON opportunity_signal_events TO authenticated USING(EXISTS(SELECT 1 FROM opportunity_signals s WHERE s.id=signal_id));
  CREATE POLICY scoped ON signal_label_links TO authenticated USING(EXISTS(SELECT 1 FROM opportunity_signals s WHERE s.id=signal_id));
  GRANT SELECT ON opportunity_signal_notes,opportunity_signal_events,signal_label_links TO authenticated;
  CREATE FUNCTION signal_note_is_progression(_note text,_event text,_marker boolean) RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path=public AS $$ SELECT coalesce(_marker, coalesce(trim(_event),'') <> 'Đã tiếp nhận' AND (coalesce(trim(_note),'') <> '' OR coalesce(trim(_event),'') NOT IN ('','Đã tiếp nhận','Khác'))) $$;
  INSERT INTO opportunity_signal_notes(signal_id,note,created_at,is_progression) SELECT id,'Ghi chú thật',created_at+interval '1 day',true FROM opportunity_signals LIMIT 50;
  INSERT INTO opportunity_signal_events(signal_id,kind,detail,created_at) SELECT id,'assign',jsonb_build_object('to',assigned_to),created_at FROM opportunity_signals LIMIT 40;
  INSERT INTO signal_label_links SELECT id,'${uid(100)}' FROM opportunity_signals LIMIT 20;`);
  const base=readFileSync('drizzle/migrations/0274_signal_paged_filtered_reads.sql','utf8').split('\n')[0]
    .replace('public.signal_filtered(', 'public.signal_base_filtered(')
    .replace('SETOF public.signal_list_priority','SETOF public.opportunity_signals')
    .replace('FROM signal_list_priority s','FROM opportunity_signals s');
  await db.exec(base);
  await db.exec(definition('signal_list_counts(jsonb)'));
  await db.exec(definition('signal_list_page(jsonb,text,integer,integer)'));
}, 60000);
afterAll(() => db.close());

async function rows(n: number) {
  await db.exec(`SELECT set_config('test.uid','${uid(n)}',false); SET ROLE authenticated;`);
  const result = (await db.query('SELECT id FROM opportunity_signals ORDER BY id')).rows;
  await db.exec('RESET ROLE');
  return result;
}

it('preserves the exact live scope truth table: direct, slot, signed/unsigned titles, fallback, Khác and multi-group', async () => {
  await db.exec(patch);
  for (const n of [1,2,3,4,5,6,7,8,9,10]) {
    await db.exec(`SELECT set_config('test.uid','${uid(n)}',false);`);
    for (const groups of [null, [], ['Quà'], ['Other'], ['Other','Quà'], ['Khác:Web']]) {
      const r = (await db.query<{ old: boolean; next: boolean }>(`SELECT private.sig_scope_ok($1,$2) old,
        EXISTS(SELECT 1 FROM (SELECT private.sig_read_scope_context($1) value) c WHERE (value->>'all')::boolean OR
          EXISTS(SELECT 1 FROM unnest(coalesce($2::text[],'{}')) g WHERE value->'groups' ? g OR (g LIKE 'Khác:%' AND value->'groups' ? 'Khác'))) next`, [uid(n), groups])).rows[0];
      expect(r?.next).toBe(r?.old);
    }
  }
  await db.exec(`SELECT set_config('test.uid','${uid(3)}',false); SET ROLE authenticated;`);
  expect((await db.query<{v:{all:boolean;groups:string[]}}>('SELECT private.sig_read_scope_context($1) v',[uid(4)])).rows[0]?.v).toEqual({all:false,groups:[]});
  await db.exec('RESET ROLE');
});

it('RLS parity across admin, bounded, DENY/no grant, assigned, creator and locked users; exact rollback', async () => {
  await db.exec(readFileSync('docs/signals-p0-2026-11-12/rollback.sql', 'utf8'));
  const before = [];
  for (let n=1;n<=10;n++) before.push(await rows(n));
  // Patch is non-idempotent by design for the new function; policy reapply only.
  await db.exec(patch.slice(patch.indexOf('ALTER POLICY')));
  for (let n=1;n<=10;n++) expect(await rows(n)).toEqual(before[n-1]);
  expect((await rows(3)).length).toBe(332);
  expect(await rows(7)).toEqual([]);
  expect(await rows(9)).toEqual([]);
  expect((await rows(8)).length).toBe(665);
  expect((await rows(10)).length).toBe(665);
  await db.exec(readFileSync('docs/signals-p0-2026-11-12/rollback.sql', 'utf8'));
  expect((await db.query<{qual:string}>("SELECT qual FROM pg_policies WHERE policyname='sig_select'")).rows[0]?.qual).toBe(snapshot.policies.find((p:{policyname:string})=>p.policyname==='sig_select').qual);
  await db.exec(patch.slice(patch.indexOf('ALTER POLICY')));
});

it('statement context does not use client/session cache and reevaluates revoked grants and scopes', async () => {
  expect((await rows(3)).length).toBe(332);
  await db.exec(`UPDATE app_roles SET signal_scope=ARRAY['Other'] WHERE id='bounded';`);
  expect((await rows(3)).length).toBe(333);
  await db.exec(`UPDATE grants SET allowed=false WHERE user_id='${uid(3)}';`);
  expect(await rows(3)).toEqual([]);
  await db.exec(`UPDATE grants SET allowed=true WHERE user_id='${uid(3)}'; UPDATE app_roles SET signal_scope=ARRAY['Quà','Khác'] WHERE id='bounded';`);
});

it('live 0371 invoker counts/page retain all facets, cancellation, eight sorts and pagination under each RLS caller',async()=>{
  const filters=[{},{quick:'consulting'},{quick:'won'},{q:'Khách'},{q:'missing'},{needGroup:'Quà'},{needGroup:'Khác:Web'},{saleId:uid(8)},{creatorId:uid(10)},{stage:'advice'},{potential:'high'},{work:'action'},{cancelled:true},{from:'2026-11-09',to:'2026-11-09'},{labelId:uid(100)}];
  const sorts=['work','priority','activity','newest','oldest','soonest','potential','value'];
  const oldPolicy=readFileSync('docs/signals-p0-2026-11-12/rollback.sql','utf8');
  const newPolicy=patch.slice(patch.indexOf('ALTER POLICY'));
  for(const n of [1,3,5,7,8,9,10]){
    await db.exec(oldPolicy);
    await db.exec(`SELECT set_config('test.uid','${uid(n)}',false); SET ROLE authenticated;`);
    const before=[];
    for(const f of filters){
      const counts=(await db.query('SELECT signal_list_counts($1) v',[f])).rows;
      const pages=[];
      for(const sort of sorts) for(const offset of [0,40]) pages.push((await db.query('SELECT signal_list_page($1,$2,$3,40) v',[f,sort,offset])).rows);
      before.push({counts,pages});
    }
    await db.exec('RESET ROLE');await db.exec(newPolicy);await db.exec('SET ROLE authenticated');
    for(const [i,f] of filters.entries()){
      expect((await db.query('SELECT signal_list_counts($1) v',[f])).rows).toEqual(before[i]?.counts);
      let j=0;
      for(const sort of sorts) for(const offset of [0,40]) expect((await db.query('SELECT signal_list_page($1,$2,$3,40) v',[f,sort,offset])).rows).toEqual(before[i]?.pages[j++]);
    }
    await db.exec('RESET ROLE');
  }
  const metadata=(await db.query<{prosecdef:boolean}>("SELECT prosecdef FROM pg_proc WHERE oid IN ('signal_list_counts(jsonb)'::regprocedure,'signal_list_page(jsonb,text,integer,integer)'::regprocedure)")).rows;
  expect(metadata).toEqual([{prosecdef:false},{prosecdef:false}]);
},120000);

it('admin avoids organization resolver and bounded scan has a once-per-statement InitPlan; benchmark 665 rows', async () => {
  await db.exec("SELECT set_config('test.forbid_sources','true',false)");
  expect((await rows(1)).length).toBe(665);
  await db.exec("SELECT set_config('test.forbid_sources','false',false)");
  await db.exec(`SELECT set_config('test.uid','${uid(3)}',false); SET ROLE authenticated;`);
  const plan = (await db.query(`EXPLAIN (ANALYZE, BUFFERS, VERBOSE, FORMAT JSON) SELECT id FROM opportunity_signals`)).rows;
  const text=JSON.stringify(plan);
  expect(text).toContain('InitPlan');
  expect(text).toContain('sig_read_scope_context');
  const contexts: Record<string,unknown>[]=[];
  const walk=(node:unknown)=>{ if (!node || typeof node!=='object') return; if (Array.isArray(node)) {node.forEach(walk);return;} const n=node as Record<string,unknown>;
    if(n['Parent Relationship']==='InitPlan' && JSON.stringify(n.Output).includes('sig_read_scope_context')) contexts.push(n);
    Object.values(n).forEach(walk); };
  walk(plan);
  expect(contexts).toHaveLength(1);
  expect(contexts[0]?.['Actual Loops']).toBe(1);
  console.log('isolated authenticated plan',text);
  await db.exec('RESET ROLE');
  for (const version of ['old','new']) {
    await db.exec(version==='old' ? readFileSync('docs/signals-p0-2026-11-12/rollback.sql','utf8') : patch.slice(patch.indexOf('ALTER POLICY')));
    const start=performance.now(); const result=await rows(3);
    console.log('665-row isolated RLS',version,Math.round(performance.now()-start),'ms',result.length,'rows');
    expect(result.length).toBe(332);
  }
},60000);